<template>
  <div class="dv-canvas-wrap">
    <!-- 工具条 -->
    <div class="dv-canvas-toolbar">
      <div class="dv-toolbar-group">
        <button class="dv-tool-btn" title="放大"  @click="zoom = Math.min(2.5, zoom + 0.2)">
          <AppIcon name="plus" :size="12"/>
        </button>
        <span class="dv-zoom-text">{{ Math.round(zoom * 100) }}%</span>
        <button class="dv-tool-btn" title="缩小"  @click="zoom = Math.max(0.5, zoom - 0.2)">
          <AppIcon name="chevron-down" :size="12"/>
        </button>
        <button class="dv-tool-btn" title="重置"  @click="resetView">
          <AppIcon name="scan" :size="12"/>
        </button>
      </div>
      <div class="dv-toolbar-divider"/>

      <!-- 类型筛选 -->
      <div class="dv-toolbar-group">
        <span class="dv-toolbar-label">类型</span>
        <button
          v-for="[k, n] in filterOptions" :key="k"
          :class="['dv-filter-chip', filter[k] && 'on']"
          :style="{ '--cl': DV_COLORS[k], whiteSpace: 'nowrap' }"
          @click="filter[k] = !filter[k]"
        >
          <span class="dv-filter-dot"/>{{ n }}
        </button>
      </div>

      <div style="flex:1"/>

    </div>

    <!-- 画布 -->
    <div
      class="dv-canvas-svg-wrap"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel.prevent="onWheel"
    >
      <!-- 左上统计 -->
      <div class="dv-canvas-stats">
        <div class="dv-canvas-stats-row">
          <span class="dv-canvas-stats-label">节点</span>
          <span class="dv-canvas-stats-value">{{ visibleNodes.length }}</span>
        </div>
        <div class="dv-canvas-stats-row">
          <span class="dv-canvas-stats-label">关系</span>
          <span class="dv-canvas-stats-value">{{ visibleEdges.length }}</span>
        </div>
        <div class="dv-canvas-stats-tip">
          <AppIcon name="sparkles" :size="9" stroke="#4dc9ff"/>
          <span>拖拽平移 · 滚轮缩放</span>
        </div>
      </div>

      <svg
        width="100%" height="100%"
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
      >
        <defs>
          <radialGradient id="dv-ctr-grad">
            <stop offset="0%"   stop-color="#4dc9ff" stop-opacity="0.95"/>
            <stop offset="60%"  stop-color="#2f7fff" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#2f7fff" stop-opacity="0"/>
          </radialGradient>
          <filter id="dv-glow">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dv-glow-strong">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient v-for="[k, c] in colorEntries" :key="k" :id="`dv-grad-${k}`">
            <stop offset="0%"   :stop-color="c" stop-opacity="1"/>
            <stop offset="100%" :stop-color="c" stop-opacity="0.5"/>
          </radialGradient>
        </defs>

        <g :transform="`translate(${pan.x} ${pan.y}) scale(${zoom})`"
           :style="{ transformOrigin: `${W/2}px ${H/2}px` }">

          <!-- 同心引导圈 -->
          <circle v-for="r in [140,220,320,400]" :key="r"
                  :cx="W/2" :cy="H/2" :r="r"
                  fill="none" stroke="rgba(77,201,255,0.06)" stroke-dasharray="2 6"/>

          <!-- 中心脉冲（两圈错开） -->
          <circle :cx="W/2" :cy="H/2" r="22" fill="none" stroke="#4dc9ff" stroke-width="0.8" opacity="0.4">
            <animate attributeName="r" from="22" to="120" dur="3.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.4" to="0" dur="3.6s" repeatCount="indefinite"/>
          </circle>
          <circle :cx="W/2" :cy="H/2" r="22" fill="none" stroke="#4dc9ff" stroke-width="0.8" opacity="0.4">
            <animate attributeName="r" from="22" to="120" dur="3.6s" begin="1.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.4" to="0" dur="3.6s" begin="1.2s" repeatCount="indefinite"/>
          </circle>

          <!-- 边 -->
          <g v-for="(e, i) in visibleEdges" :key="i">
            <template v-if="edgeNodeA(e) && edgeNodeB(e)">
              <line
                :x1="edgeNodeA(e).x" :y1="edgeNodeA(e).y"
                :x2="edgeNodeB(e).x" :y2="edgeNodeB(e).y"
                :stroke="edgeStroke(e)"
                :stroke-width="edgeWidth(e)"
                :stroke-opacity="edgeOpacity(e)"
                :stroke-dasharray="kindStyle[e.kind]?.dash || 'none'"
                stroke-linecap="round"
              />
              <!-- 流动光点 -->
              <circle v-if="isEdgeRelated(e)" r="2.4" fill="#4dc9ff" opacity="0.95">
                <animate attributeName="opacity" values="0;1;1;0" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="cx" :from="edgeNodeA(e).x" :to="edgeNodeB(e).x" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="cy" :from="edgeNodeA(e).y" :to="edgeNodeB(e).y" dur="1.6s" repeatCount="indefinite"/>
              </circle>
            </template>
          </g>

          <!-- 节点 -->
          <g
            v-for="n in visibleNodes" :key="n.id"
            class="dv-node"
            :style="{ cursor: 'pointer', opacity: isNodeDim(n) ? 0.25 : 1, transition: 'opacity 300ms' }"
            @click.stop="$emit('selectNode', n.id)"
            @mouseenter="hoverNodeId = n.id"
            @mouseleave="hoverNodeId = null"
          >
            <!-- 建筑节点光晕 -->
            <template v-if="n.type === 'building'">
              <circle :cx="n.x" :cy="n.y" :r="n.r + 16" fill="url(#dv-ctr-grad)"/>
              <circle :cx="n.x" :cy="n.y" :r="n.r + 6"  fill="none" stroke="#4dc9ff" stroke-width="0.8" opacity="0.5"/>
            </template>

            <!-- hoverChunk 橙色脉冲 -->
            <template v-if="hoverChunkId === n.id && !isSelected(n)">
              <circle :cx="n.x" :cy="n.y" :r="n.r + 14" fill="none" stroke="#ffb547" stroke-width="2" opacity="0.85">
                <animate attributeName="r" :from="n.r + 6" :to="n.r + 22" dur="1.0s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.9" to="0" dur="1.0s" repeatCount="indefinite"/>
              </circle>
              <circle :cx="n.x" :cy="n.y" :r="n.r + 4" fill="none" stroke="#ffb547" stroke-width="1.5" opacity="0.7"/>
            </template>

            <!-- 选中辉光 -->
            <template v-if="isSelected(n)">
              <circle :cx="n.x" :cy="n.y" :r="n.r + 8" fill="none" :stroke="nodeColor(n)" stroke-width="1.5" opacity="0.6">
                <animate attributeName="r" :from="n.r + 6" :to="n.r + 14" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite"/>
              </circle>
            </template>

            <!-- 主体圆 -->
            <circle
              :cx="n.x" :cy="n.y"
              :r="isSelected(n) ? n.r * 1.2 : hoverNodeId === n.id ? n.r * 1.1 : n.r"
              :fill="n.color ? n.color : `url(#dv-grad-${n.type})`"
              :filter="isSelected(n) ? 'url(#dv-glow-strong)' : 'url(#dv-glow)'"
              :stroke="isSelected(n) ? '#fff' : isNodeRelated(n) ? nodeColor(n) : 'none'"
              :stroke-width="isSelected(n) ? 2 : 1"
              style="transition: r 240ms"
            />

            <!-- 建筑节点文字 -->
            <text v-if="n.type === 'building'"
                  :x="n.x" :y="n.y + 4"
                  text-anchor="middle" font-size="14" font-weight="600" fill="#fff"
                  style="pointer-events:none">
              {{ n.name?.slice(0, 6) }}
            </text>

            <!-- 持久标签 -->
            <g v-if="showLabel(n)" style="pointer-events:none">
              <rect
                :x="n.x - Math.min(n.name.length * 5, 80)"
                :y="n.y + n.r + 4"
                :width="Math.min(n.name.length * 10, 160)"
                height="18" rx="3"
                fill="rgba(13,27,53,0.88)"
                :stroke="isSelected(n) || hoverNodeId === n.id ? nodeColor(n) : 'rgba(77,201,255,0.3)'"
                stroke-width="0.6"
              />
              <text
                :x="n.x" :y="n.y + n.r + 16"
                text-anchor="middle" font-size="11"
                :fill="isSelected(n) || hoverNodeId === n.id ? '#fff' : '#eaf2ff'"
                font-family="Noto Sans SC"
                :font-weight="isSelected(n) ? '600' : '400'"
              >
                {{ n.name.length > 14 ? n.name.slice(0, 13) + '…' : n.name }}
              </text>
            </g>

            <!-- Hover Tooltip -->
            <g v-if="hoverNodeId === n.id && !isSelected(n)" style="pointer-events:none">
              <rect
                :x="n.x - 88" :y="n.y - n.r - 60"
                width="176" height="48" rx="6"
                fill="rgba(8,18,38,0.96)"
                :stroke="nodeColor(n)" stroke-width="1"
                filter="url(#dv-glow)"
              />
              <text :x="n.x - 80" :y="n.y - n.r - 42"
                    font-size="9.5" fill="#8da3c8" font-family="Noto Sans SC" letter-spacing="0.6">
                {{ DV_TYPE_LABEL[n.type] || n.type }}
              </text>
              <text :x="n.x - 80" :y="n.y - n.r - 27"
                    font-size="11.5" fill="#fff" font-family="Noto Sans SC" font-weight="600">
                {{ n.name.length > 22 ? n.name.slice(0, 21) + '…' : n.name }}
              </text>
              <text :x="n.x - 80" :y="n.y - n.r - 16"
                    font-size="10" :fill="nodeColor(n)" font-family="JetBrains Mono">
                {{ tooltipSub(n) }}
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- 图例 -->
    <div class="dv-canvas-legend">
      <span v-for="[k, n] in typeEntries" :key="k" class="dv-legend-item">
        <span class="dv-legend-dot" :style="{ background: DV_COLORS[k] }"/>{{ n }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import { DV_COLORS, DV_TYPE_LABEL } from '../../data/constants.js'
import { dvBuildGraph, dvNodeAncestors } from '../../utils/buildGraph.js'

const props = defineProps({
  detail:             { type: Object, required: true },
  selectedId:         { type: String, default: null },
  expandedSubsystem:  { type: String, default: null },
  expandedDoc:        { type: String, default: null },
  hoverChunkId:       { type: String, default: null },
})
const emit = defineEmits(['selectNode'])

// ── 状态 ──────────────────────────────────────────────────────
const hoverNodeId = ref(null)
const zoom        = ref(1)
const pan         = reactive({ x: 0, y: 0 })
const filter      = reactive({ device: true, doc: true, chunk: true, standard: true })
const searchQ     = ref('')
let dragStart     = null
const isDragging  = ref(false)

const filterOptions = [
  ['device',   '设备'],
  ['doc',      '文档'],
  ['chunk',    '切片'],
  ['standard', '标准'],
]

// ── 图谱数据 ──────────────────────────────────────────────────
const graph = computed(() =>
  dvBuildGraph(props.detail, props.expandedSubsystem, props.expandedDoc)
)
const W = computed(() => graph.value.W)
const H = computed(() => graph.value.H)
const nodes = computed(() => graph.value.nodes)
const edges = computed(() => graph.value.edges)

// ── 可见节点/边（按 filter 过滤）────────────────────────────
const visibleNodes = computed(() =>
  nodes.value.filter(n =>
    filter[n.type] !== false ||
    n.type === 'building' ||
    n.type === 'subsystem' ||
    n.type === 'group'
  )
)
const visibleNodeSet = computed(() => new Set(visibleNodes.value.map(n => n.id)))
const visibleEdges = computed(() =>
  edges.value.filter(e => visibleNodeSet.value.has(e.from) && visibleNodeSet.value.has(e.to))
)

// ── 选中节点及其祖先/邻居 ──────────────────────────────────
const sel = computed(() => nodes.value.find(n => n.id === props.selectedId) || null)
const ancestorIds = computed(() =>
  sel.value ? dvNodeAncestors(nodes.value, sel.value.id).map(n => n.id) : []
)
const relatedIds = computed(() => {
  const s = new Set(ancestorIds.value)
  if (sel.value) {
    edges.value.forEach(e => {
      if (e.from === sel.value.id) s.add(e.to)
      if (e.to   === sel.value.id) s.add(e.from)
    })
  }
  return s
})

// ── 搜索 ──────────────────────────────────────────────────────
const searchableEntries = computed(() => {
  const e = []
  e.push({ id: 'building', name: props.detail.building?.name || '建筑', type: 'building' })
  props.detail.subsystems.forEach(s => e.push({ id: s.id, name: s.name, type: 'subsystem' }))
  Object.keys(props.detail.groups  || {}).forEach(id => e.push({ id, name: props.detail.groups[id].name,   type: 'group' }))
  Object.keys(props.detail.devices || {}).forEach(id => e.push({ id, name: props.detail.devices[id].name,  type: 'device' }))
  Object.keys(props.detail.docs    || {}).forEach(id => e.push({ id, name: props.detail.docs[id].name,     type: 'doc' }))
  Object.keys(props.detail.chunks  || {}).forEach(id => {
    const c = props.detail.chunks[id]
    e.push({ id, name: `切片 #${c.idx} ${c.tags?.[0] || ''}`, type: 'chunk', excerpt: c.excerpt })
  })
  ;(props.detail.standards || []).forEach(st => e.push({ id: st.id, name: st.name, type: 'standard' }))
  return e
})

const searchResults = computed(() => {
  if (!searchQ.value.trim()) return []
  const q = searchQ.value.trim().toLowerCase()
  return searchableEntries.value
    .filter(e => e.name.toLowerCase().includes(q) || (e.excerpt && e.excerpt.toLowerCase().includes(q)))
    .slice(0, 8)
})

function onSearchSelect(id) {
  emit('selectNode', id)
  searchQ.value = ''
}

// ── 辅助：颜色/状态判断 ───────────────────────────────────────
const nodeColor  = (n) => n.color || DV_COLORS[n.type] || '#4dc9ff'
const isSelected = (n) => sel.value?.id === n.id
const isNodeRelated = (n) => sel.value && (relatedIds.value.has(n.id) || ancestorIds.value.includes(n.id))
const isNodeDim  = (n) => sel.value && !isSelected(n) && !isNodeRelated(n)

const showLabel  = (n) =>
  n.type === 'building' ? false :      // 建筑用文字，不用标签
  n.type === 'subsystem' ||
  isSelected(n) ||
  hoverNodeId.value === n.id ||
  (n.type === 'group' && props.expandedSubsystem) ||
  (n.type === 'doc'   && props.expandedSubsystem === n.parent)

const tooltipSub = (n) => {
  if (n.type === 'device'    && n.ref?.confidence)   return `置信度 ${n.ref.confidence}%`
  if (n.type === 'doc'       && n.ref?.chunks)        return `${n.ref.chunks.length} 个切片 · ${n.ref.size || ''}`
  if (n.type === 'chunk'     && n.ref?.confidence)    return `置信度 ${n.ref.confidence}% · 已向量化`
  if (n.type === 'subsystem')                         return '点击展开下级'
  if (n.type === 'group'     && n.ref?.devices)       return `${n.ref.devices.length} 台设备`
  return '点击查看详情'
}

// ── 边计算 ────────────────────────────────────────────────────
const kindStyle = {
  owns:     { width: 1.4, dash: 'none' },
  contains: { width: 1.0, dash: 'none' },
  describes:{ width: 0.9, dash: '5 4' },
  has:      { width: 0.7, dash: 'none' },
  split:    { width: 0.7, dash: '2 3' },
  ref:      { width: 0.9, dash: '5 4' },
  complies: { width: 1.2, dash: 'none' },
}
const edgeNodeA    = (e) => nodes.value.find(n => n.id === e.from)
const edgeNodeB    = (e) => nodes.value.find(n => n.id === e.to)
const isEdgeRelated = (e) => {
  if (!sel.value) return false
  const isRel = e.from === sel.value.id || e.to === sel.value.id
  const isAnc = ancestorIds.value.includes(e.from) && ancestorIds.value.includes(e.to)
  return (isRel || isAnc)
}
const isEdgeDim = (e) => {
  if (!sel.value) return false
  const isRel = e.from === sel.value.id || e.to === sel.value.id
  const isAnc = ancestorIds.value.includes(e.from) && ancestorIds.value.includes(e.to)
  return !isRel && !isAnc
}
const edgeStroke  = (e) => {
  const b = edgeNodeB(e)
  const baseColor = b?.color || DV_COLORS[b?.type] || '#4dc9ff'
  return isEdgeRelated(e) ? '#4dc9ff' : baseColor
}
const edgeWidth   = (e) => {
  const ks = kindStyle[e.kind] || { width: 0.8 }
  if (e.from === sel.value?.id || e.to === sel.value?.id) return ks.width + 0.8
  if (ancestorIds.value.includes(e.from) && ancestorIds.value.includes(e.to)) return ks.width + 0.4
  return ks.width
}
const edgeOpacity = (e) => {
  if (isEdgeDim(e)) return 0.08
  if (e.from === sel.value?.id || e.to === sel.value?.id) return 0.75
  if (ancestorIds.value.includes(e.from) && ancestorIds.value.includes(e.to)) return 0.5
  return 0.32
}

// ── 拖拽 ──────────────────────────────────────────────────────
function onMouseDown(e) {
  dragStart = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
  isDragging.value = false
}
function onMouseMove(e) {
  if (!dragStart) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging.value = true
  pan.x = dragStart.px + dx
  pan.y = dragStart.py + dy
}
function onMouseUp() {
  dragStart = null
  isDragging.value = false
}
function resetView() {
  zoom.value = 1
  pan.x = 0
  pan.y = 0
}

// ── 滚轮缩放（以鼠标位置为中心缩放）─────────────────────────
function onWheel(e) {
  const delta  = e.deltaY > 0 ? -0.1 : 0.1
  const before = zoom.value
  zoom.value   = Math.min(2.5, Math.max(0.3, before + delta))
  // 以鼠标指针为缩放中心点，平移补偿
  const rect   = e.currentTarget.getBoundingClientRect()
  const mx     = e.clientX - rect.left - rect.width  / 2
  const my     = e.clientY - rect.top  - rect.height / 2
  const scale  = zoom.value / before
  pan.x = mx - scale * (mx - pan.x)
  pan.y = my - scale * (my - pan.y)
}

// ── 静态数据 ──────────────────────────────────────────────────
const colorEntries = Object.entries(DV_COLORS)
const typeEntries  = Object.entries(DV_TYPE_LABEL)
</script>
