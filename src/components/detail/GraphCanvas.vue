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

// 已冻结的节点坐标 id -> {x, y}
let frozenPositions = {}
// 当前是否已完成冻结
let layoutFrozen = false

const SIZE = { building: 30, subsystem: 18, group: 12, doc: 11, chunk: 8, standard: 10, device: 8 }

// ── 读取 ECharts 内部当前节点坐标并写入 frozenPositions ───────
function snapshotPositions() {
  if (!chart) return
  const opt = chart.getOption()
  const data = opt?.series?.[0]?.data || []
  let allValid = true
  data.forEach(n => {
    if (n.x != null && n.y != null && !(n.x === 0 && n.y === 0)) {
      frozenPositions[n.id] = { x: n.x, y: n.y }
    } else {
      allValid = false
    }
  })
  return allValid && data.length > 0
}

// ── 轮询等待坐标稳定，然后冻结 ───────────────────────────────
function waitAndFreeze(maxMs = 2000) {
  layoutFrozen = false
  frozenPositions = {}
  const interval = 100
  let elapsed = 0
  let prevSnapshot = ''

  const tick = () => {
    elapsed += interval
    snapshotPositions()
    const snap = JSON.stringify(frozenPositions)

    if (snap === prevSnapshot && snap !== '{}') {
      // 坐标稳定了，冻结
      layoutFrozen = true
      applyFrozenPositions()
      return
    }
    prevSnapshot = snap

    if (elapsed < maxMs) setTimeout(tick, interval)
    else {
      layoutFrozen = true
      applyFrozenPositions()
    }
  }
  setTimeout(tick, interval)
}

// ── 把冻结坐标写回 ECharts，让所有节点 fixed ─────────────────
function applyFrozenPositions() {
  if (!chart || !layoutFrozen) return
  const opt = chart.getOption()
  const data = opt?.series?.[0]?.data || []
  const newData = data.map(n => {
    const pos = frozenPositions[n.id]
    if (!pos) return n
    return { ...n, fixed: true, x: pos.x, y: pos.y }
  })
  chart.setOption({ series: [{ data: newData }] })
}

// ── 构建初始 option（不带冻结坐标，自由布局）─────────────────
function buildRawOption() {
  const { nodes: rawNodes, edges: rawEdges } = dvBuildGraph(
    props.detail, props.expandedSubsystem, props.expandedDoc,
  )
  nodeCount.value = rawNodes.length
  edgeCount.value = rawEdges.length

  const w = chartEl.value?.clientWidth  || 600
  const h = chartEl.value?.clientHeight || 400

  const ecNodes = rawNodes.map(n => {
    const isBuilding = n.type === 'building'
    const color = n.color || DV_COLORS[n.type] || '#4dc9ff'
    const size  = SIZE[n.type] || 10
    return {
      id:   n.id, name: n.name,
      fixed: isBuilding,
      x: isBuilding ? w / 2 : undefined,
      y: isBuilding ? h / 2 : undefined,
      symbolSize: size, cursor: 'pointer',
      itemStyle: { color, shadowBlur: isBuilding ? 20 : 5, shadowColor: color },
      label: {
        show:      n.type === 'subsystem' || isBuilding,
        position:  isBuilding ? 'inside' : 'bottom',
        formatter: isBuilding ? '建筑' : (n.name.length > 8 ? n.name.slice(0,7)+'…' : n.name),
        fontSize:  isBuilding ? 13 : 11,
        fontWeight: isBuilding ? 'bold' : 'normal',
        color: '#e8f0fe',
        textBorderColor: 'rgba(0,0,0,0.5)',
        textBorderWidth: 2,
      },
      _type: n.type, _apiType: n._apiType,
    }
  })

  const ecEdges = rawEdges.map(e => ({
    source: e.from, target: e.to,
    lineStyle: {
      color: 'rgba(100,160,220,0.35)',
      width: e.kind === 'owns' ? 1.5 : 1,
      type:  e.kind === 'describes' ? 'dashed' : 'solid',
    },
  }))

  return {
    backgroundColor: 'transparent',
    animationDuration: 300,
    series: [{
      type: 'graph', layout: 'force',
      data: ecNodes, links: ecEdges,
      roam: true, draggable: true, zoom: 1,
      center: [w / 2, h / 2],
      focusNodeAdjacency: true,
      force: { repulsion: [200, 400], gravity: 0.08, edgeLength: [80, 180], layoutAnimation: false },
      lineStyle: { curveness: 0 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 2 } },
      selectedMode: 'single',
    }],
  }
}

// ── 仅更新节点高亮样式，坐标保持冻结不变 ─────────────────────
function updateSelectionStyle(selectedId) {
  if (!chart || !layoutFrozen) return
  const opt = chart.getOption()
  const data = opt?.series?.[0]?.data || []

  const newData = data.map(n => {
    const isBuilding = n._type === 'building' || n.id === 'building'
    const isSelected = n.id === selectedId
    const color = n.itemStyle?.color || '#4dc9ff'
    const baseSize = SIZE[n._type] || SIZE[n.type] || 10
    return {
      ...n,
      symbolSize: isSelected ? baseSize * 1.6 : baseSize,
      itemStyle: {
        ...n.itemStyle,
        borderColor: isSelected ? '#fff' : color,
        borderWidth: isSelected ? 2 : 0,
        shadowBlur:  isBuilding ? 20 : isSelected ? 14 : 5,
      },
      label: {
        ...n.label,
        show:      n._type === 'subsystem' || isBuilding || isSelected,
        fontWeight: isBuilding || isSelected ? 'bold' : 'normal',
      },
    }
  })

  chart.setOption({ series: [{ data: newData }] })
}

// ── 居中指定节点 ──────────────────────────────────────────────
function centerNode(nodeId) {
  if (!chart) return
  let attempts = 0
  const tryCenter = () => {
    attempts++
    const px = chart.convertToPixel({ seriesIndex: 0 }, { graphNodeId: nodeId })
    if (px && (Math.abs(px[0]) + Math.abs(px[1])) > 0) {
      const w = chartEl.value?.clientWidth  || 600
      const h = chartEl.value?.clientHeight || 400
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
  chart = echarts.init(chartEl.value, null, { renderer: 'canvas' })
  chart.setOption(buildRawOption())
  waitAndFreeze()

  chart.on('mouseover', 'series.graph', p => { if (p.dataType==='node') chartEl.value.style.cursor='pointer' })
  chart.on('mouseout',  'series.graph', p => { if (p.dataType==='node') chartEl.value.style.cursor='default' })

  chart.on('click', 'series.graph', params => {
    if (params.dataType !== 'node') return
    const id = params.data.id
    emit('selectNode', id)
    centerNode(id)
  })

  chart.on('graphroam', () => {
    const zoom = chart.getOption()?.series?.[0]?.zoom
    if (zoom != null) zoomLevel.value = Math.round(zoom * 100) / 100
  })
}

function zoomIn()  { chart?.dispatchAction({ type: 'graphRoam', zoom: 1.2 }); zoomLevel.value = +(zoomLevel.value * 1.2).toFixed(2) }
function zoomOut() { chart?.dispatchAction({ type: 'graphRoam', zoom: 0.8 }); zoomLevel.value = +(zoomLevel.value * 0.8).toFixed(2) }
function resetView() {
  layoutFrozen = false; frozenPositions = {}; zoomLevel.value = 1
  chart?.setOption(buildRawOption(), { replaceMerge: ['series'] })
  waitAndFreeze()
}

// selectedId 变化 → 只改样式，不动坐标
watch(() => props.selectedId, (id) => { updateSelectionStyle(id) })

// 结构变化（展开/收起/切换建筑）→ 重新布局
watch(
  () => [props.detail, props.expandedSubsystem, props.expandedDoc],
  () => {
    if (!chart) return
    layoutFrozen = false; frozenPositions = {}
    chart.setOption(buildRawOption(), { replaceMerge: ['series'] })
    waitAndFreeze()
  },
  { deep: false }
)

onMounted(async () => {
  await nextTick()
  initChart()
  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => { chart?.dispose(); window.removeEventListener('resize', handler) })
})

const typeEntries = Object.entries(DV_TYPE_LABEL)
</script>
