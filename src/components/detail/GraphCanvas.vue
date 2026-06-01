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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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

// ── DOM & ECharts 实例 ────────────────────────────────────────
const chartEl   = ref(null)
let   chart     = null
const zoomLevel = ref(1)
const nodeCount = ref(0)
const edgeCount = ref(0)

// ── 子系统类型颜色 ─────────────────────────────────────────────
const SUB_COLORS = {
  subEnergy:              '#4dc9ff',
  greenBuild:             '#2bd9a8',
  virtualDaynamo:         '7a5cff',
  savingRenovation:       '#2bd9a8',
  energyAudit:            '#4dc9ff',
  benchmark:              '#a799ff',
  effictImprove:          '#ff8a47',
  energyUnit:             '#4dc9ff',
  solar:                  '#ff8a47',
  charge:                 '#ffb547',
  carbonQR:               '#2bd9a8',
  certificateGlectricity: '#2bd9a8',
  blueprint:              '#a799ff',
  others:                 '#888',
}

// 节点尺寸
const SIZE = { building: 30, subsystem: 18, group: 12, doc: 11, chunk: 8, standard: 10, device: 8 }

// ── 从 detail 构建 ECharts graph 数据 ─────────────────────────
function buildEchartsData() {
  const { nodes: rawNodes, edges: rawEdges } = dvBuildGraph(
    props.detail,
    props.expandedSubsystem,
    props.expandedDoc,
  )

  nodeCount.value = rawNodes.length
  edgeCount.value = rawEdges.length

  const ecNodes = rawNodes.map(n => {
    const isBuilding  = n.type === 'building'
    const isSelected  = n.id === props.selectedId
    const color = n.color || DV_COLORS[n.type] || '#4dc9ff'
    const size  = SIZE[n.type] || 10

    return {
      id:         n.id,
      name:       n.name,
      // 力导向布局时不需要固定坐标；建筑节点固定在中心
      fixed:      isBuilding,
      x:          isBuilding ? 500 : undefined,
      y:          isBuilding ? 350 : undefined,
      symbolSize: isSelected ? size * 1.5 : size,
      itemStyle: {
        color,
        borderColor: isSelected ? '#fff' : color,
        borderWidth: isSelected ? 2 : 0,
        shadowBlur:  isBuilding ? 20 : isSelected ? 12 : 4,
        shadowColor: color,
      },
      label: {
        show:       n.type === 'subsystem' || n.type === 'building' || isSelected,
        position:   isBuilding ? 'inside' : 'bottom',
        formatter:  isBuilding ? '建筑' : (n.name.length > 8 ? n.name.slice(0,7) + '…' : n.name),
        fontSize:   isBuilding ? 13 : 11,
        fontWeight: isBuilding || isSelected ? 'bold' : 'normal',
        color:      '#e8f0fe',
        textBorderColor: 'rgba(0,0,0,0.5)',
        textBorderWidth: 2,
      },
      // 存原始信息用于点击回调
      _type:    n.type,
      _apiType: n._apiType,
    }
  })

  const ecEdges = rawEdges.map(e => ({
    source: e.from,
    target: e.to,
    lineStyle: {
      color:     'rgba(100,160,220,0.35)',
      width:     e.kind === 'owns' ? 1.5 : 1,
      type:      (e.kind === 'describes' || e.kind === 'split') ? 'dashed' : 'solid',
    },
  }))

  return { ecNodes, ecEdges }
}

// ── 构建完整 ECharts option ────────────────────────────────────
function buildOption() {
  const { ecNodes, ecEdges } = buildEchartsData()
  return {
    backgroundColor: 'transparent',
    animationDuration: 600,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      type:          'graph',
      layout:        'force',
      data:          ecNodes,
      links:         ecEdges,
      roam:          true,
      draggable:     true,
      focusNodeAdjacency: true,
      force: {
        repulsion:   [200, 400],
        gravity:     0.08,
        edgeLength:  [80, 180],
        layoutAnimation: true,
      },
      lineStyle: { curveness: 0.1 },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 2 },
      },
      // 选中样式
      select: {
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
      },
      selectedMode: 'single',
    }],
  }
}

// ── 初始化 ECharts ─────────────────────────────────────────────
function initChart() {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value, null, { renderer: 'canvas' })

  chart.setOption(buildOption())

  // 点击节点 → 触发 selectNode
  chart.on('click', 'series.graph', (params) => {
    if (params.dataType === 'node') {
      emit('selectNode', params.data.id)
    }
  })

  // 缩放/平移时同步 zoomLevel 显示
  chart.on('graphroam', () => {
    const opt = chart.getOption()
    const zoom = opt?.series?.[0]?.zoom
    if (zoom) zoomLevel.value = Math.round(zoom * 100) / 100
  })
}

// ── 工具条操作 ─────────────────────────────────────────────────
function zoomIn()    { chart?.dispatchAction({ type: 'graphZoom', zoom: 1.2 }); zoomLevel.value = Math.min(3, +(zoomLevel.value * 1.2).toFixed(2)) }
function zoomOut()   { chart?.dispatchAction({ type: 'graphZoom', zoom: 0.8 }); zoomLevel.value = Math.max(0.2, +(zoomLevel.value * 0.8).toFixed(2)) }
function resetView() {
  zoomLevel.value = 1
  chart?.setOption(buildOption(), { replaceMerge: ['series'] })
}

// ── 响应数据变化（detail / expandedSubsystem / expandedDoc 变化）
watch(
  () => [props.detail, props.expandedSubsystem, props.expandedDoc, props.selectedId],
  () => {
    if (!chart) return
    chart.setOption(buildOption(), { replaceMerge: ['series'] })
  },
  { deep: false }
)

// ── 生命周期 ──────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  initChart()
  // 响应窗口尺寸变化
  window.__dvResizeHandler = () => chart?.resize()
  window.addEventListener('resize', window.__dvResizeHandler)
})

onBeforeUnmount(() => {
  chart?.dispose()
  window.removeEventListener('resize', window.__dvResizeHandler)
})

// ── 图例静态数据 ───────────────────────────────────────────────
const typeEntries = Object.entries(DV_TYPE_LABEL)
</script>
