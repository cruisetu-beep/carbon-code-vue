import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getPackageList,
  getPackageDetail,
  getPackageSummary,
} from '../api/packages.js'

// ── 模块 type → 颜色/图标映射 ────────────────────────────────
const MODULE_META = {
  subEnergy:              { color: '#4dc9ff', icon: 'panel' },
  greenBuild:             { color: '#2bd9a8', icon: 'leaf'  },
  virtualDaynamo:         { color: '#7a5cff', icon: 'bolt'  },
  savingRenovation:       { color: '#2bd9a8', icon: 'leaf'  },
  energyAudit:            { color: '#4dc9ff', icon: 'scan'  },
  benchmark:              { color: '#a799ff', icon: 'graph' },
  effictImprove:          { color: '#ff8a47', icon: 'zap'   },
  energyUnit:             { color: '#4dc9ff', icon: 'panel' },
  solar:                  { color: '#ff8a47', icon: 'sun'   },
  charge:                 { color: '#ffb547', icon: 'plug'  },
  carbonQR:               { color: '#2bd9a8', icon: 'sparkles'},
  certificateGlectricity: { color: '#2bd9a8', icon: 'leaf'  },
  blueprint:              { color: '#a799ff', icon: 'panel' },
  others:                 { color: '#888',    icon: 'panel' },
}

// ── 接口数据适配：新接口 getResourceRelationData 返回结构 ─────
// data.nodes = 建筑根节点（type:"root"）
// data.nodes.children[] = 一级节点列表，每项有 id/type/name/data/children
function adaptDetail(raw) {
  if (!raw) return null

  const rootNode = raw.nodes
  if (!rootNode) return null

  // 建筑名称
  const buildName = raw.name || rootNode.data?.buildName || ''

  // 一级节点 → 子系统列表（过滤掉 aiSummary 类型）
  const firstLevelNodes = (rootNode.children || []).filter(
    n => n.type !== 'aiSummary'
  )

  const subsystems = firstLevelNodes.map(node => {
    const meta = MODULE_META[node.type] || { color: '#4dc9ff', icon: 'panel' }
    return {
      id:       node.id,
      key:      node.type,
      name:     node.name,
      color:    meta.color,
      icon:     meta.icon,
      summary:  '',
      stats:    [],
      realtime: null,
      groups:   [],
      docs:     [],
      devices:  [],
      // 保留原始节点数据供后续面板使用
      _node:    node,
    }
  })

  // 能耗曲线：从分项计量节点的 data 子节点里找
  let energy30d = []
  const subEnergyNode = firstLevelNodes.find(n => n.type === 'subEnergy')
  if (subEnergyNode) {
    const dataChild = (subEnergyNode.children || []).find(c => c.type === 'data')
    if (dataChild && Array.isArray(dataChild.data)) {
      // 按时间排序取最近 30 个点的 value
      const sorted = [...dataChild.data]
        .sort((a, b) => new Date(a.time) - new Date(b.time))
      energy30d = sorted.slice(-30).map(d => d.value || 0)
    }
  }

  return {
    building: {
      summary: `${buildName} 知识库已完成资料解析与图谱融合。`,
      stats: {
        docs:      0,
        entities:  subsystems.length,
        edges:     subsystems.length,
        vectors:   0,
        devices:   0,
        metrics:   0,
        chunks:    0,
        standards: 0,
      },
      energy30d,
    },
    subsystems,
    groups:    {},
    devices:   {},
    docs:      {},
    chunks:    {},
    standards: [],
    // 挂载原始数据
    _raw:      raw,
    _rootNode: rootNode,
    _buildName: buildName,
  }
}

export const usePackageStore = defineStore('packages', () => {

  // ── 状态 ────────────────────────────────────────────────────
  const list        = ref([])
  const detailCache = ref({})
  const summary     = ref(null)

  const listLoading   = ref(false)
  const detailLoading = ref(false)
  const error         = ref(null)

  // ── 计算属性 ─────────────────────────────────────────────────
  const activeCount = computed(() => list.value.filter(p => p.status === 'active').length)
  const draftCount  = computed(() => list.value.filter(p => p.status === 'draft').length)
  const totalArea   = computed(() => list.value.reduce((s, p) => s + (p.area || 0), 0))

  // ── Actions ──────────────────────────────────────────────────

  async function fetchList() {
    if (listLoading.value) return
    listLoading.value = true
    error.value = null
    try {
      list.value = await getPackageList()
    } catch (e) {
      error.value = e.message
      console.error('[store] fetchList:', e)
    } finally {
      listLoading.value = false
    }
  }

  async function fetchSummary() {
    try {
      summary.value = await getPackageSummary()
    } catch (e) {
      console.error('[store] fetchSummary:', e)
    }
  }

  // 拉取资源包详情（用 buildId 调接口，用 pkg.code 作缓存 key）
  async function fetchDetail(code, buildId) {
    if (detailCache.value[code]) return
    if (detailLoading.value) return
    detailLoading.value = true
    error.value = null
    try {
      const raw = await getPackageDetail(buildId || code)
      detailCache.value[code] = adaptDetail(raw)
    } catch (e) {
      error.value = e.message
      console.error('[store] fetchDetail:', e)
    } finally {
      detailLoading.value = false
    }
  }

  function invalidateDetail(code) {
    delete detailCache.value[code]
  }

  function getDetail(code) {
    return detailCache.value[code] || null
  }

  return {
    list, summary, detailLoading, listLoading, error,
    activeCount, draftCount, totalArea,
    fetchList, fetchSummary, fetchDetail, invalidateDetail, getDetail,
  }
})

