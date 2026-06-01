<template>
  <div class="dv-canvas-wrap">
    <div class="dv-canvas-toolbar">
      <div class="dv-toolbar-group">
        <button class="dv-tool-btn" title="放大"  @click="zoomIn">
          <AppIcon name="plus" :size="12"/>
        </button>
        <span class="dv-zoom-text">{{ Math.round(zoomLevel * 100) }}%</span>
        <button class="dv-tool-btn" title="缩小"  @click="zoomOut">
          <AppIcon name="chevron-down" :size="12"/>
        </button>
        <button class="dv-tool-btn" title="重置"  @click="resetView">
          <AppIcon name="scan" :size="12"/>
        </button>
      </div>
      <div class="dv-toolbar-divider"/>
      <div class="dv-toolbar-group" style="gap:10px">
        <span class="dv-toolbar-label">节点</span>
        <span class="dv-zoom-text" style="min-width:24px">{{ nodeCount }}</span>
        <span class="dv-toolbar-label" style="margin-left:4px">关系</span>
        <span class="dv-zoom-text" style="min-width:24px">{{ edgeCount }}</span>
        <div class="dv-toolbar-divider"/>
        <AppIcon name="sparkles" :size="10" stroke="#5a7499"/>
        <span class="dv-toolbar-label" style="margin-right:0">拖拽平移 · 滚轮缩放</span>
      </div>
    </div>

    <div ref="chartEl" class="dv-canvas-svg-wrap" style="width:100%;flex:1;min-height:0"/>

    <div class="dv-canvas-legend">
      <span v-for="[k, n] in typeEntries" :key="k" class="dv-legend-item">
        <span class="dv-legend-dot" :style="{ background: DV_COLORS[k] }"/>{{ n }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import AppIcon from '../shared/AppIcon.vue'
import { DV_COLORS, DV_TYPE_LABEL } from '../../data/constants.js'
import { dvBuildGraph } from '../../utils/buildGraph.js'

const props = defineProps({
  detail:            { type: Object, required: true },
  selectedId:        { type: String, default: null },
  expandedSubsystem: { type: String, default: null },
  expandedDoc:       { type: String, default: null },
  hoverChunkId:      { type: String, default: null },
})
const emit = defineEmits(['selectNode'])

const chartEl   = ref(null)
let   chart     = null
const zoomLevel = ref(1)
const nodeCount = ref(0)
const edgeCount = ref(0)

// 记录已稳定的节点坐标（id -> {x, y}），切换选中时复用
let frozenPositions = {}

const SIZE = { building: 30, subsystem: 18, group: 12, doc: 11, chunk: 8, standard: 10, device: 8 }

// ── 构建节点/边数据 ───────────────────────────────────────────
function buildEchartsData(useFrozen = false) {
  const { nodes: rawNodes, edges: rawEdges } = dvBuildGraph(
    props.detail, props.expandedSubsystem, props.expandedDoc,
  )
  nodeCount.value = rawNodes.length
  edgeCount.value = rawEdges.length

  const w  = chartEl.value?.clientWidth  || 600
  const h  = chartEl.value?.clientHeight || 400

  const ecNodes = rawNodes.map(n => {
    const isBuilding = n.type === 'building'
    const isSelected = n.id === props.selectedId
    const color = n.color || DV_COLORS[n.type] || '#4dc9ff'
    const size  = SIZE[n.type] || 10

    // 优先使用冻结坐标，保持节点位置不变
    const frozen = frozenPositions[n.id]
    const fx = isBuilding ? w / 2 : (useFrozen && frozen ? frozen.x : undefined)
    const fy = isBuilding ? h / 2 : (useFrozen && frozen ? frozen.y : undefined)

    return {
      id:         n.id,
      name:       n.name,
      fixed:      isBuilding || (useFrozen && !!frozen),
      x:          fx,
      y:          fy,
      symbolSize: isSelected ? size * 1.6 : size,
      cursor:     'pointer',
      itemStyle: {
        color,
        borderColor: isSelected ? '#fff' : color,
        borderWidth: isSelected ? 2 : 0,
        shadowBlur:  isBuilding ? 20 : isSelected ? 14 : 5,
        shadowColor: color,
      },
      label: {
        show:      n.type === 'subsystem' || n.type === 'building' || isSelected,
        position:  isBuilding ? 'inside' : 'bottom',
        formatter: isBuilding ? '建筑' : (n.name.length > 8 ? n.name.slice(0,7)+'…' : n.name),
        fontSize:  isBuilding ? 13 : 11,
        fontWeight: isBuilding || isSelected ? 'bold' : 'normal',
        color: '#e8f0fe',
        textBorderColor: 'rgba(0,0,0,0.5)',
        textBorderWidth: 2,
      },
      _type:    n.type,
      _apiType: n._apiType,
    }
  })

  const ecEdges = rawEdges.map(e => ({
    source: e.from,
    target: e.to,
    lineStyle: {
      color: 'rgba(100,160,220,0.35)',
      width: e.kind === 'owns' ? 1.5 : 1,
      type:  (e.kind === 'describes' || e.kind === 'split') ? 'dashed' : 'solid',
    },
  }))

  return { ecNodes, ecEdges }
}

function buildOption(useFrozen = false) {
  const { ecNodes, ecEdges } = buildEchartsData(useFrozen)
  const w = chartEl.value?.clientWidth  || 600
  const h = chartEl.value?.clientHeight || 400
  return {
    backgroundColor: 'transparent',
    animationDuration: 400,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      type: 'graph', layout: 'force',
      data: ecNodes, links: ecEdges,
      roam: true, draggable: true, zoom: 1,
      center: [w / 2, h / 2],
      focusNodeAdjacency: true,
      force: {
        repulsion: [200, 400], gravity: 0.08,
        edgeLength: [80, 180], layoutAnimation: false,
      },
      lineStyle: { curveness: 0 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 2 } },
      selectedMode: 'single',
    }],
  }
}

// ── 冻结当前所有节点坐标 ──────────────────────────────────────
function freezePositions() {
  if (!chart) return
  const opt = chart.getOption()
  const data = opt?.series?.[0]?.data || []
  data.forEach(n => {
    if (n.x != null && n.y != null) {
      frozenPositions[n.id] = { x: n.x, y: n.y }
    }
  })
}

// ── 点击后居中节点 ────────────────────────────────────────────
function centerNode(nodeId) {
  if (!chart) return
  let attempts = 0
  const tryCenter = () => {
    attempts++
    const px = chart.convertToPixel({ seriesIndex: 0 }, { graphNodeId: nodeId })
    if (px && (px[0] !== 0 || px[1] !== 0)) {
      const w  = chartEl.value?.clientWidth  || 600
      const h  = chartEl.value?.clientHeight || 400
      chart.dispatchAction({ type: 'graphRoam', dx: w / 2 - px[0], dy: h / 2 - px[1] })
    } else if (attempts < 16) {
      setTimeout(tryCenter, 50)
    }
  }
  setTimeout(tryCenter, 50)
}

// ── 初始化 ────────────────────────────────────────────────────
function initChart() {
  if (!chartEl.value) return
  frozenPositions = {}
  chart = echarts.init(chartEl.value, null, { renderer: 'canvas' })

  // 首次布局：不使用冻结坐标，让力导向自由排列
  chart.setOption(buildOption(false))

  // 力导向布局结束后冻结坐标
  chart.on('layoutfinished', () => {
    freezePositions()
  })
  // 备用：500ms 后强制冻结（部分情况 layoutfinished 不触发）
  setTimeout(() => { if (Object.keys(frozenPositions).length === 0) freezePositions() }, 600)

  chart.on('mouseover', 'series.graph', (p) => {
    if (p.dataType === 'node') chartEl.value.style.cursor = 'pointer'
  })
  chart.on('mouseout', 'series.graph', (p) => {
    if (p.dataType === 'node') chartEl.value.style.cursor = 'default'
  })

  chart.on('click', 'series.graph', (params) => {
    if (params.dataType !== 'node') return
    emit('selectNode', params.data.id)
    centerNode(params.data.id)
  })

  chart.on('graphroam', () => {
    const zoom = chart.getOption()?.series?.[0]?.zoom
    if (zoom != null) zoomLevel.value = Math.round(zoom * 100) / 100
  })
}

function zoomIn()  { chart?.dispatchAction({ type: 'graphRoam', zoom: 1.2 }); zoomLevel.value = +(zoomLevel.value * 1.2).toFixed(2) }
function zoomOut() { chart?.dispatchAction({ type: 'graphRoam', zoom: 0.8 }); zoomLevel.value = +(zoomLevel.value * 0.8).toFixed(2) }
function resetView() {
  frozenPositions = {}
  zoomLevel.value = 1
  chart?.setOption(buildOption(false), { replaceMerge: ['series'] })
  setTimeout(() => freezePositions(), 600)
}

// ── 选中/展开变化时：使用冻结坐标更新，不重新布局 ──────────
watch(
  () => [props.selectedId],
  () => {
    if (!chart) return
    // 仅更新节点样式，坐标用冻结值，节点不动
    chart.setOption(buildOption(true), { replaceMerge: ['series'] })
  },
  { deep: false }
)

// detail / expandedSubsystem / expandedDoc 变化时需要重新布局（节点数量变了）
watch(
  () => [props.detail, props.expandedSubsystem, props.expandedDoc],
  () => {
    if (!chart) return
    frozenPositions = {}
    chart.setOption(buildOption(false), { replaceMerge: ['series'] })
    setTimeout(() => freezePositions(), 600)
  },
  { deep: false }
)

onMounted(async () => {
  await nextTick()
  initChart()
  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    chart?.dispose()
    window.removeEventListener('resize', handler)
  })
})

const typeEntries = Object.entries(DV_TYPE_LABEL)
</script>
