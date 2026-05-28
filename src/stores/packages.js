import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getPackageList,
  getPackageDetail,
  getPackageSummary,
} from '../api/packages.js'

export const usePackageStore = defineStore('packages', () => {

  // ── 状态 ────────────────────────────────────────────────────
  const list        = ref([])          // 资源包列表
  const detailCache = ref({})          // 详情缓存 { [code]: detailData }
  const summary     = ref(null)        // 列表页顶部统计

  const listLoading   = ref(false)
  const detailLoading = ref(false)
  const error         = ref(null)

  // ── 计算属性 ─────────────────────────────────────────────────
  const activeCount = computed(() => list.value.filter(p => p.status === 'active').length)
  const draftCount  = computed(() => list.value.filter(p => p.status === 'draft').length)
  const totalArea   = computed(() => list.value.reduce((s, p) => s + (p.area || 0), 0))

  // ── Actions ──────────────────────────────────────────────────

  // 拉取资源包列表
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

  // 拉取统计汇总
  async function fetchSummary() {
    try {
      summary.value = await getPackageSummary()
    } catch (e) {
      console.error('[store] fetchSummary:', e)
    }
  }

  // 拉取资源包详情（带本地缓存，同一个 code 不重复请求）
  async function fetchDetail(code) {
    if (detailCache.value[code]) return   // 已缓存，直接用
    if (detailLoading.value) return
    detailLoading.value = true
    error.value = null
    try {
      detailCache.value[code] = await getPackageDetail(code)
    } catch (e) {
      error.value = e.message
      console.error('[store] fetchDetail:', e)
    } finally {
      detailLoading.value = false
    }
  }

  // 使某个详情缓存失效（编辑后刷新用）
  function invalidateDetail(code) {
    delete detailCache.value[code]
  }

  // 获取某个资源包的详情（已缓存则直接返回）
  function getDetail(code) {
    return detailCache.value[code] || null
  }

  return {
    // state
    list, summary, detailLoading, listLoading, error,
    // computed
    activeCount, draftCount, totalArea,
    // actions
    fetchList, fetchSummary, fetchDetail, invalidateDetail, getDetail,
  }
})
