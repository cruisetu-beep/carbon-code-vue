<template>
  <Breadcrumb :items="['首页', '资源包管理', pkg.name, crumbName]"/>

  <div class="page-head">
    <div>
      <h1 class="page-title">
        <AppIcon name="cube" :size="22" stroke="var(--brand-2)"/>
        {{ buildingName }}
        <span class="dv-head-code">{{ pkg.code }}</span>
        <span v-if="pkg.score && pkg.score !== '—'" class="dv-head-score">
          碳效码 {{ pkg.score }} · {{ pkg.cls }}
        </span>
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
  <div v-if="store.detailLoading && !detail"
       style="display:flex;align-items:center;justify-content:center;height:400px;gap:12px;color:var(--text-2)">
    <AppIcon name="sparkles" :size="20" stroke="var(--brand)"/>
    <span>知识库数据加载中…</span>
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
</script>
