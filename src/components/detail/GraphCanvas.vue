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
      <span v-for="item in LEGEND_ITEMS" :key="item.key" class="dv-legend-item">
        <span class="dv-legend-dot" :style="{ background: item.color }"/>{{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import AppIcon from '../shared/AppIcon.vue'

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

// 当前展开的二级节点 id（展示三级节点）
const expandedLv2 = ref(null)

// ── 四层颜色方案 ──────────────────────────────────────────────
const COLOR_L0   = '#4dc9ff'   // 根节点（建筑）  亮蓝
const COLOR_L1   = '#2bd9a8'   // 一级节点        翠绿
const COLOR_L2   = '#a799ff'   // 二级节点        紫色
const COLOR_L3   = '#ffb547'   // 三级普通节点    琥珀橙
const COLOR_FILE = '#ff6b8a'   // 三级文件节点    玫瑰红

const LEGEND_ITEMS = [
  { key: 'l0',   color: COLOR_L0,   label: '建筑' },
  { key: 'l1',   color: COLOR_L1,   label: '一级节点' },
  { key: 'l2',   color: COLOR_L2,   label: '二级节点' },
  { key: 'l3',   color: COLOR_L3,   label: '三级节点' },
  { key: 'file', color: COLOR_FILE, label: '文件' },
]

const SIZE = { building: 30, subsystem: 16, group: 11, doc: 9, chunk: 8 }

function isFileNode(node) {
  return node.levelType === '文件节点' || node.type === 'file'
}

// ── 固定环形布局，坐标完全由计算决定，不用力导向 ────────────
function buildGraphData() {
  const rootNode = props.detail._rootNode
  if (!rootNode) return { nodes: [], edges: [] }

  const w  = chartEl.value?.clientWidth  || 700
  const h  = chartEl.value?.clientHeight || 450
  const cx = w / 2
  const cy = h / 2

  const nodes = []
  const edges = []

  // L0 建筑根节点
  nodes.push({
    id: 'building', name: '建筑',
    x: cx, y: cy, fixed: true,
    symbolSize: SIZE.building,
    cursor: 'pointer',
    itemStyle: { color: COLOR_L0, shadowBlur: 20, shadowColor: COLOR_L0 },
    label: { show: true, position: 'inside', formatter: '建筑',
             fontSize: 13, fontWeight: 'bold', color: '#fff',
             textBorderColor: 'transparent' },
    _level: 0,
  })

  // L1 一级节点：均匀分布在第一圈
  const lv1List = (rootNode.children || []).filter(n => n.type !== 'aiSummary')
  const R1 = Math.min(w, h) * 0.30
  const angleStep1 = (Math.PI * 2) / Math.max(lv1List.length, 1)

  lv1List.forEach((lv1, i) => {
    const ang = -Math.PI / 2 + i * angleStep1
    const x   = cx + Math.cos(ang) * R1
    const y   = cy + Math.sin(ang) * R1
    const isSel = lv1.id === props.selectedId

    nodes.push({
      id: lv1.id, name: lv1.name,
      x, y, fixed: true,
      symbolSize: isSel ? SIZE.subsystem * 1.5 : SIZE.subsystem,
      cursor: 'pointer',
      itemStyle: {
        color: COLOR_L1,
        borderColor: isSel ? '#fff' : COLOR_L1,
        borderWidth: isSel ? 2 : 0,
        shadowBlur: isSel ? 14 : 6,
        shadowColor: COLOR_L1,
      },
      label: {
        show: true, position: 'bottom',
        formatter: lv1.name.length > 6 ? lv1.name.slice(0,5)+'…' : lv1.name,
        fontSize: 11, color: '#e8f0fe',
        textBorderColor: 'rgba(0,0,0,0.6)', textBorderWidth: 2,
      },
      _level: 1, _angle: ang, _lv1id: lv1.id,
    })
    edges.push({ source: 'building', target: lv1.id,
      lineStyle: { color: 'rgba(43,217,168,0.25)', width: 1.2 } })

    // L2 二级节点：扇形分布在第二圈
    const lv2List = (lv1.children || []).filter(n => n.type !== 'aiSummary')
    const R2 = R1 + Math.min(w, h) * 0.20
    const fanSpan = Math.min(Math.PI * 0.7, Math.max(0.4, lv2List.length * 0.22))
    const fanStart = ang - fanSpan / 2

    lv2List.forEach((lv2, j) => {
      const a  = lv2List.length === 1 ? ang : fanStart + (fanSpan / (lv2List.length - 1)) * j
      const lx = cx + Math.cos(a) * R2
      const ly = cy + Math.sin(a) * R2
      const lv2Sel = lv2.id === props.selectedId

      nodes.push({
        id: lv2.id, name: lv2.name,
        x: lx, y: ly, fixed: true,
        symbolSize: lv2Sel ? SIZE.group * 1.5 : SIZE.group,
        cursor: 'pointer',
        itemStyle: {
          color: COLOR_L2,
          borderColor: lv2Sel ? '#fff' : COLOR_L2,
          borderWidth: lv2Sel ? 2 : 0,
          shadowBlur: lv2Sel ? 12 : 3,
          shadowColor: COLOR_L2, opacity: 0.85,
        },
        label: {
          show: lv2Sel,
          position: 'bottom',
          formatter: lv2.name.length > 6 ? lv2.name.slice(0,5)+'…' : lv2.name,
          fontSize: 10, color: '#e8f0fe',
          textBorderColor: 'rgba(0,0,0,0.6)', textBorderWidth: 2,
        },
        _level: 2, _angle: a, _lv1id: lv1.id,
        _hasChildren: (lv2.children || []).filter(n => n.type !== 'aiSummary').length > 0,
      })
      edges.push({ source: lv1.id, target: lv2.id,
        lineStyle: { color: 'rgba(167,153,255,0.25)', width: 0.8, type: 'solid' } })

      // L3 三级节点：仅当此二级节点被展开时显示
      if (expandedLv2.value === lv2.id) {
        const lv3List = (lv2.children || []).filter(n => n.type !== 'aiSummary')
        const R3 = R2 + Math.min(w, h) * 0.14
        const subSpan = Math.min(Math.PI * 0.4, Math.max(0.2, lv3List.length * 0.18))
        const subStart = a - subSpan / 2

        lv3List.forEach((lv3, k) => {
          const sa = lv3List.length === 1 ? a : subStart + (subSpan / (lv3List.length - 1)) * k
          const isFile = isFileNode(lv3)
          const l3Color = isFile ? COLOR_FILE : COLOR_L3
          nodes.push({
            id: lv3.id, name: lv3.name,
            x: cx + Math.cos(sa) * R3,
            y: cy + Math.sin(sa) * R3,
            fixed: true,
            symbolSize: SIZE.doc,
            cursor: 'pointer',
            itemStyle: { color: l3Color, shadowBlur: 3, shadowColor: l3Color, opacity: 0.85 },
            label: {
              show: true, position: 'bottom',
              formatter: lv3.name.length > 8 ? lv3.name.slice(0,7)+'…' : lv3.name,
              fontSize: 10, color: '#e8f0fe',
              textBorderColor: 'rgba(0,0,0,0.6)', textBorderWidth: 2,
            },
            _level: 3, _isFile: isFile,
          })
          edges.push({ source: lv2.id, target: lv3.id,
            lineStyle: { color: `rgba(${isFile ? '255,107,138' : '255,181,71'},0.2)`, width: 0.6, type: 'dashed' } })
        })
      }
    })
  })

  nodeCount.value = nodes.length
  edgeCount.value = edges.length
  return { nodes, edges }
}

function buildOption() {
  const { nodes, edges } = buildGraphData()
  const w = chartEl.value?.clientWidth  || 700
  const h = chartEl.value?.clientHeight || 450
  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 300,
    series: [{
      type: 'graph',
      layout: 'none',
      data:  nodes,
      links: edges,
      roam:      true,
      draggable: false,
      zoom: 1,
      center: [w / 2, h / 2],
      focusNodeAdjacency: false,
      lineStyle: { curveness: 0 },
      emphasis: { disabled: false, focus: 'none' },
    }],
  }
}

function refreshChart() {
  if (!chart) return
  chart.setOption(buildOption(), { replaceMerge: ['series'] })
}

function centerNode(nodeId) {
  if (!chart) return
  const opt = chart.getOption()
  const target = (opt?.series?.[0]?.data || []).find(n => n.id === nodeId)
  if (!target || target.x == null) return
  const px = chart.convertToPixel({ seriesIndex: 0 }, [target.x, target.y])
  if (!px) return
  const w = chartEl.value?.clientWidth  || 700
  const h = chartEl.value?.clientHeight || 450
  chart.dispatchAction({ type: 'graphRoam', dx: w / 2 - px[0], dy: h / 2 - px[1] })
}

function initChart() {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value, null, { renderer: 'canvas' })
  chart.setOption(buildOption())

  chart.on('mouseover', 'series.graph', p => {
    if (p.dataType === 'node') chartEl.value.style.cursor = 'pointer'
  })
  chart.on('mouseout', 'series.graph', p => {
    if (p.dataType === 'node') chartEl.value.style.cursor = 'default'
  })

  chart.on('click', 'series.graph', params => {
    if (params.dataType !== 'node') return
    const node = params.data
    const id   = node.id

    if (node._level === 2 && node._hasChildren) {
      expandedLv2.value = expandedLv2.value === id ? null : id
    }

    emit('selectNode', id)
    setTimeout(() => centerNode(id), 50)
  })

  chart.on('graphroam', () => {
    const zoom = chart.getOption()?.series?.[0]?.zoom
    if (zoom != null) zoomLevel.value = Math.round(zoom * 100) / 100
  })
}

function zoomIn()  { chart?.dispatchAction({ type: 'graphRoam', zoom: 1.2 }); zoomLevel.value = +(zoomLevel.value * 1.2).toFixed(2) }
function zoomOut() { chart?.dispatchAction({ type: 'graphRoam', zoom: 0.8 }); zoomLevel.value = +(zoomLevel.value * 0.8).toFixed(2) }
function resetView() {
  expandedLv2.value = null
  zoomLevel.value = 1
  chart?.setOption(buildOption(), { replaceMerge: ['series'] })
}

watch(() => [props.detail, props.expandedSubsystem, props.expandedDoc, props.selectedId, expandedLv2.value],
  () => refreshChart(), { deep: false })

onMounted(async () => {
  await nextTick()
  initChart()
  const handler = () => { chart?.resize(); refreshChart() }
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => { chart?.dispose(); window.removeEventListener('resize', handler) })
})
</script>
