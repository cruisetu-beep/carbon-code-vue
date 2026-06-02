<template>
  <!-- 头部：只在数据就绪后显示 -->
  <div v-if="detail" class="page-head">
    <div>
      <h1 class="page-title">
        <AppIcon name="cube" :size="22" stroke="var(--brand-2)"/>
        {{ buildingName }}
        <span class="dv-head-code">{{ buildId }}</span>
        <span v-if="carbonQRLabel" class="dv-head-score">{{ carbonQRLabel }}</span>
      </h1>
      <div class="page-subtitle">
        知识库已完成全部资料的智能解析、切片与图谱融合。
        点击节点查看详情，点击子系统可在图谱中展开下级结构。
      </div>
    </div>
    <button class="btn ghost" @click="$emit('back')">
      <AppIcon name="chevron-left" :size="14"/> 返回列表
    </button>
  </div>

  <!-- 加载中 -->
  <div v-if="store.detailLoading && !detail" class="dv-loading-screen">
    <div class="dv-loading-ring">
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="26" stroke="rgba(77,201,255,0.15)" stroke-width="3"/>
        <circle cx="30" cy="30" r="26" stroke="#4dc9ff" stroke-width="3"
                stroke-linecap="round" stroke-dasharray="60 104"
                class="dv-loading-arc"/>
      </svg>
      <div class="dv-loading-icon">
        <AppIcon name="sparkles" :size="22" stroke="#4dc9ff"/>
      </div>
    </div>
    <div class="dv-loading-text">知识库数据加载中…</div>
    <div class="dv-loading-sub">正在解析建筑知识图谱，请稍候</div>
  </div>

  <!-- 加载失败 -->
  <div v-else-if="store.error && !detail"
       style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:400px;gap:16px">
    <AppIcon name="scan" :size="32" stroke="var(--danger)"/>
    <div style="color:var(--danger)">数据加载失败：{{ store.error }}</div>
    <button class="btn ghost" @click="store.fetchDetail(pkg.code)">重新加载</button>
  </div>

  <!-- 三栏（detail 就绪后渲染） -->
  <div v-else-if="detail" class="dv-three-col">
    <!-- 左栏：大纲树 -->
    <aside class="dv-col-left">
      <OutlineTree
        :detail="detail"
        :pkg="pkg"
        :selectedId="selectedId"
        @select="onSelectNode"
      />
    </aside>

    <!-- 中央：图谱 -->
    <div class="dv-col-center">
      <GraphCanvas
        :detail="detail"
        :selectedId="selectedId"
        :expandedSubsystem="expandedSubsystem"
        :expandedDoc="expandedDoc"
        :hoverChunkId="hoverChunkId"
        @selectNode="onSelectNode"
      />
    </div>

    <!-- 右栏：详情面板 -->
    <aside class="dv-col-right">
      <NodePanel
        :node="selectedNode"
        :detail="detail"
        :pkg="pkg"
        @selectNode="onSelectNode"
        @hoverChunk="hoverChunkId = $event"
      />
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppIcon      from '../shared/AppIcon.vue'
import Breadcrumb   from '../shared/Breadcrumb.vue'
import OutlineTree  from './OutlineTree.vue'
import GraphCanvas  from './GraphCanvas.vue'
import NodePanel    from './NodePanel.vue'
import { dvBuildGraph } from '../../utils/buildGraph.js'
import { usePackageStore } from '../../stores/packages.js'

const props = defineProps({
  pkg: { type: Object, required: true },
})
defineEmits(['back'])

const store = usePackageStore()

// ── 数据：从 store 取，store 内部走 mock 或真实接口 ───────────
const detail = computed(() => store.getDetail(props.pkg.code))

// pkg 变化时触发拉取（首次进入 + 切换建筑）
onMounted(() => store.fetchDetail(props.pkg.code, props.pkg.buildId))
watch(() => props.pkg.code, code => store.fetchDetail(code, props.pkg.buildId))

// ── 状态 ──────────────────────────────────────────────────────
const selectedId        = ref('building')
const expandedSubsystem = ref(null)
const expandedDoc       = ref(null)
const hoverChunkId      = ref(null)

// ── 节点选择联动（自动展开父级）──────────────────────────────
function findNodeType(id) {
  const d = detail.value
  if (id === 'building') return 'building'
  if (d.subsystems.find(s => s.id === id)) return 'subsystem'
  if (d.groups?.[id])    return 'group'
  if (d.devices?.[id])   return 'device'
  if (d.docs?.[id])      return 'doc'
  if (d.chunks?.[id])    return 'chunk'
  if (d.standards?.find(s => s.id === id)) return 'standard'
  return null
}

function onSelectNode(id) {
  selectedId.value = id
  const t = findNodeType(id)
  const d = detail.value

  if (t === 'subsystem') {
    expandedSubsystem.value = id
  } else if (t === 'group') {
    expandedSubsystem.value = d.groups[id].parent
  } else if (t === 'device') {
    const gid = Object.keys(d.groups || {}).find(gid => d.groups[gid].devices?.includes(id))
    if (gid) expandedSubsystem.value = d.groups[gid].parent
  } else if (t === 'doc') {
    expandedSubsystem.value = d.docs[id].parent
    expandedDoc.value = id
  } else if (t === 'chunk') {
    const docId = d.chunks[id].docId
    expandedSubsystem.value = d.docs[docId]?.parent
    expandedDoc.value = docId
  } else if (t === 'standard') {
    expandedSubsystem.value = 'standards'
  }
}

// ── 当前选中节点对象（右栏面板需要） ──────────────────────────
const selectedNode = computed(() => {
  if (!detail.value) return null
  const { nodes } = dvBuildGraph(detail.value, expandedSubsystem.value, expandedDoc.value)
  return nodes.find(n => n.id === selectedId.value) || null
})

const buildingName = computed(() => detail.value?._buildName || detail.value?._raw?.resourceName || props.pkg.name)
const crumbName = computed(() => selectedNode.value?.name || '建筑')

// 建筑编号：取接口根节点 data.buildId
const buildId = computed(() => {
  const bid = detail.value?._rootNode?.data?.buildId
  return bid || props.pkg.buildId || props.pkg.code
})

// 碳效码：找 type===carbonQR 的一级节点，取其 children[0].data[0]
const carbonQRLabel = computed(() => {
  const rootNode = detail.value?._rootNode
  if (!rootNode) return ''
  const carbonNode = (rootNode.children || []).find(
    n => n.levelType === '一级节点' && n.type === 'carbonQR'
  )
  if (!carbonNode) return ''
  const baseInfoChild = (carbonNode.children || []).find(c => c.type === 'baseInfo')
  if (!baseInfoChild) return ''
  const dataArr = Array.isArray(baseInfoChild.data) ? baseInfoChild.data : []
  if (!dataArr.length) return ''
  const d = dataArr[0]
  return `${d.year} 碳效码 ${d.evaluationCode}`
})
</script>
