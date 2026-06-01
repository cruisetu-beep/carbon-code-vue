<template>
  <div class="dv-canvas-wrap">
    <!-- 工具条 -->
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

    <!-- ECharts 画布 -->
    <div ref="chartEl" class="dv-canvas-svg-wrap" style="width:100%;flex:1;min-height:0"/>

    <!-- 图例 -->
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

const SIZE = { building: 30, subsystem: 18, group: 12, doc: 11, chunk: 8, standard: 10, device: 8 }

// ── 构建 ECharts 数据 ─────────────────────────────────────────
function buildEchartsData() {
  const { nodes: rawNodes, edges: rawEdges } = dvBuildGraph(
    props.detail,
    props.expandedSubsystem,
    props.expandedDoc,
  )

  nodeCount.value = rawNodes.length
  edgeCount.value = rawEdges.length

  // 获取画布中心坐标
  const w = chartEl.value?.clientWidth  || 600
  const h = chartEl.value?.clientHeight || 400
  const cx = w / 2
  const cy = h / 2

  const ecNodes = rawNodes.map(n => {
    const isBuilding = n.type === 'building'
    const isSelected = n.id === props.selectedId
    const color = n.color || DV_COLORS[n.type] || '#4dc9ff'
    const size  = SIZE[n.type] || 10

    return {
      id:   n.id,
      name: n.name,
      // 建筑根节点固定在画布中心
      fixed:      isBuilding,
      x:          isBuilding ? cx : undefined,
      y:          isBuilding ? cy : undefined,
      symbolSize: isSelected ? size * 1.6 : size,
      itemStyle: {
        color,
        borderColor: isSelected ? '#fff' : color,
        borderWidth: isSelected ? 2 : 0,
        shadowBlur:  isBuilding ? 20 : isSelected ? 14 : 5,
        shadowColor: color,
      },
      label: {
        show:     n.type === 'subsystem' || n.type === 'building' || isSelected,
        position: isBuilding ? 'inside' : 'bottom',
        formatter: isBuilding ? '建筑' : (n.name.length > 8 ? n.name.slice(0, 7) + '…' : n.name),
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

// ── 构建完整 option ────────────────────────────────────────────
function buildOption() {
  const { ecNodes, ecEdges } = buildEchartsData()
  const w = chartEl.value?.clientWidth  || 600
  const h = chartEl.value?.clientHeight || 400

  return {
    backgroundColor: 'transparent',
    animationDuration: 600,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      type:      'graph',
      layout:    'force',
      data:      ecNodes,
      links:     ecEdges,
      roam:      true,
      draggable: true,
      zoom:      1,
      // 让图谱中心对齐画布中心
      center:    [w / 2, h / 2],
      focusNodeAdjacency: true,
      force: {
        repulsion:       [200, 400],
        gravity:         0.08,
        edgeLength:      [80, 180],
        layoutAnimation: true,
      },
      lineStyle: { curveness: 0.1 },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 2 },
      },
      selectedMode: 'single',
    }],
  }
}

// ── 将指定节点平移到画布中心 ──────────────────────────────────
function centerNode(nodeId) {
  if (!chart) return
  // 从当前 option 找到该节点的坐标
  const opt = chart.getOption()
  const data = opt?.series?.[0]?.data || []
  const target = data.find(d => d.id === nodeId)
  if (!target || target.x == null || target.y == null) return

  // 当前缩放比例
  const currentZoom = opt?.series?.[0]?.zoom || 1
  const w = chartEl.value?.clientWidth  || 600
  const h = chartEl.value?.clientHeight || 400

  // 目标：把节点移到画布中心
  // ECharts graph 的 center 属性控制图的中心点（数据坐标）
  chart.setOption({
    series: [{
      center: [w / 2 - (target.x - w / 2) * 0, h / 2 - (target.y - h / 2) * 0],
    }]
  })

  // 用 pan 动作把节点移到视口中心
  // 先拿节点屏幕坐标，再计算偏移量
  const pointInPixel = chart.convertToPixel({ seriesIndex: 0 }, [target.x, target.y])
  if (!pointInPixel) return
  const dx = w / 2 - pointInPixel[0]
  const dy = h / 2 - pointInPixel[1]

  chart.dispatchAction({
    type:    'graphRoam',
    dx,
    dy,
  })
}

// ── 初始化 ────────────────────────────────────────────────────
function initChart() {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value, null, { renderer: 'canvas' })
  chart.setOption(buildOption())

  // 点击节点
  chart.on('click', 'series.graph', (params) => {
    if (params.dataType !== 'node') return
    const id = params.data.id
    emit('selectNode', id)
    // 短暂延迟等力导向稳定后再居中
    setTimeout(() => centerNode(id), 80)
  })

  // 同步缩放比例到工具条
  chart.on('graphroam', (e) => {
    if (e.zoom != null) {
      zoomLevel.value = Math.round(
        ((chart.getOption()?.series?.[0]?.zoom || 1)) * 100
      ) / 100
    }
  })
}

// ── 工具条按钮 ────────────────────────────────────────────────
function zoomIn() {
  chart?.dispatchAction({ type: 'graphRoam', zoom: 1.2 })
  zoomLevel.value = +(zoomLevel.value * 1.2).toFixed(2)
}
function zoomOut() {
  chart?.dispatchAction({ type: 'graphRoam', zoom: 0.8 })
  zoomLevel.value = +(zoomLevel.value * 0.8).toFixed(2)
}
function resetView() {
  zoomLevel.value = 1
  chart?.setOption(buildOption(), { replaceMerge: ['series'] })
}

// ── 响应数据变化 ───────────────────────────────────────────────
watch(
  () => [props.detail, props.expandedSubsystem, props.expandedDoc, props.selectedId],
  () => { if (chart) chart.setOption(buildOption(), { replaceMerge: ['series'] }) },
  { deep: false }
)

// ── 生命周期 ──────────────────────────────────────────────────
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
