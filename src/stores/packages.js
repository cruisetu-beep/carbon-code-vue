import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getPackageList,
  getPackageDetail,
  getPackageSummary,
} from '../api/packages.js'

// ── 接口数据适配：把后端返回的 data 转成前端 detail 格式 ──────
function adaptDetail(raw) {
  if (!raw) return null

  // 模块存在性判断（有数据才显示节点）
  const MODULE_CONFIG = [
    { key: 'subEnergy',             id: 'sub_meter',   name: '分项计量',   color: '#4dc9ff', icon: 'panel' },
    { key: 'virtualDaynamo',        id: 'vpp',         name: '虚拟电厂',   color: '#7a5cff', icon: 'bolt'  },
    { key: 'savingRenovation',      id: 'retrofit',    name: '节能改造',   color: '#2bd9a8', icon: 'leaf'  },
    { key: 'solar',                 id: 'pv',          name: '光伏发电',   color: '#ff8a47', icon: 'sun'   },
    { key: 'charge',                id: 'charge',      name: '充电桩',     color: '#ffb547', icon: 'plug'  },
    { key: 'greenBuild',            id: 'green',       name: '绿色建筑',   color: '#2bd9a8', icon: 'leaf'  },
    { key: 'energyAudit',           id: 'audit',       name: '能源审计',   color: '#4dc9ff', icon: 'scan'  },
    { key: 'benchmark',             id: 'benchmark',   name: '能效对标',   color: '#a799ff', icon: 'graph' },
    { key: 'effictImprove',         id: 'effict',      name: '能效提升',   color: '#ff8a47', icon: 'zap'   },
    { key: 'energyUnit',            id: 'energyUnit',  name: '重点用能单位', color: '#4dc9ff', icon: 'panel' },
    { key: 'carbonQR',              id: 'carbonQR',    name: '碳效码',     color: '#2bd9a8', icon: 'sparkles'},
    { key: 'certificateGlectricity', id: 'greenCert', name: '绿电绿证',   color: '#2bd9a8', icon: 'leaf'  },
    { key: 'blueprint',             id: 'blueprint',   name: '图纸',       color: '#a799ff', icon: 'panel' },
    { key: 'others',                id: 'others',      name: '其他',       color: '#888',    icon: 'panel' },
  ]

  // 判断模块是否有有效数据
  function hasData(val) {
    if (val === null || val === undefined) return false
    if (Array.isArray(val)) return val.length > 0
    if (typeof val === 'object') return Object.keys(val).length > 0
    return true
  }

  // 生成有数据的子系统列表
  const subsystems = MODULE_CONFIG
    .filter(m => hasData(raw[m.key]))
    .map(m => ({
      id: m.id,
      key: m.id,
      name: m.name,
      color: m.color,
      icon: m.icon,
      summary: '',
      stats: [],
      realtime: null,
      groups: [],
      docs: [],
      devices: [],
      // 保留原始数据供后续面板使用
      _raw: raw[m.key],
    }))

  // 碳效码：取最新年份
  const latestCarbonQR = Array.isArray(raw.carbonQR) && raw.carbonQR.length > 0
    ? raw.carbonQR.sort((a, b) => b.evaDate - a.evaDate)[0]
    : null

  // 建筑基本信息
  const generalInfo = raw.subEnergy?.generalInfo || []
  const areaItem    = generalInfo.find(g => g.key === '建筑面积')
  const area        = areaItem ? parseFloat(areaItem.value) || 0 : 0

  // 能耗曲线（今日）
  const todaySeries = raw.subEnergy?.energyChart?.series?.find(s => s.name === '今日能耗')
  const energy30d   = todaySeries?.data || []

  return {
    // 建筑根节点
    building: {
      summary: `${raw.resourceName} 知识库已完成资料解析与图谱融合。`,
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
    // 子系统（第一层节点）
    subsystems,
    groups:    {},
    devices:   {},
    docs:      {},
    chunks:    {},
    standards: [],
    // 额外挂载原始数据，供详情面板使用
    _raw: raw,
    _carbonQR: latestCarbonQR,
    _area: area,
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

