<template>
  <div class="list-view float-in">
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h1 class="page-title">
          <AppIcon name="cube" :size="26" stroke="var(--brand-2)"/>
          资源包管理
        </h1>
        <div class="page-subtitle">
          每一个资源包对应一栋建筑的全套碳效计算资料 —
          资料一经入库即被知识图谱解析、关联、向量化，可直接服务于碳效码计算与考核评价。
        </div>
      </div>
      <button class="btn primary" @click="$emit('create')">
        <AppIcon name="plus" :size="14"/> 创建资源包
      </button>
    </div>

    <!-- 统计栏 -->
    <div class="stats-row">
      <div class="stat-tile" style="--cl:#4dc9ff">
        <div class="l"><AppIcon name="cube" :size="12"/> 资源包总数</div>
        <div class="v">{{ universeList.length }}<span class="u">栋</span></div>
        <!-- <div class="d">在管 {{ activeCount }} · 草稿 {{ draftCount }}</div> -->
      </div>
      <div class="stat-tile" style="--cl:#a799ff">
        <div class="l"><AppIcon name="panel" :size="12"/> 覆盖建筑面积</div>
        <div class="v">{{ (totalArea / 10000).toFixed(1) }}<span class="u">万 ㎡</span></div>
        <!-- <div class="d">同比 ↑ 18%</div> -->
      </div>
      <div class="stat-tile" style="--cl:#2bd9a8">
        <div class="l"><AppIcon name="panel" :size="12"/> 专项总数</div>
        <div class="v">{{ totalEntities }}<span class="u">个</span></div>
        <!-- <div class="d">涵盖各建筑功能目录</div> -->
      </div>
      <div class="stat-tile" style="--cl:#ffb547">
        <div class="l"><AppIcon name="zap" :size="12"/> 碳效码计算率</div>
        <div class="v">{{ readyRate }}<span class="u">%</span></div>
        <div class="d">{{ activeCount }} 栋已生成评级</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="search-box">
        <AppIcon name="search" :size="14"/>
        <input
          :value="draftFilters.keyword"
          placeholder="搜索建筑名称 / 编号"
          @input="patchDraft({ keyword: $event.target.value })"
        />
      </div>
      <div class="filter-chips">
        <div
          v-for="[k, n] in filterOptions"
          :key="k"
          :class="['chip', isChipActive(k) && 'active']"
          @click="onChipClick(k)"
        >{{ n }}</div>
      </div>
      <div style="flex:1"/>
      <button class="btn ghost" @click="panelOpen = true">
        <AppIcon name="filter" :size="12"/> 高级筛选
        <span v-if="activeChipCount" class="filter-count">{{ activeChipCount }}</span>
      </button>
      <button class="btn ghost"><AppIcon name="download" :size="12"/> 导出</button>
    </div>

    <!-- 加载中 -->
    <div v-if="listLoading && !hasLoaded" class="pkg-list">
      <div class="create-tile" @click="$emit('create')">
        <div class="plus-orb"><AppIcon name="plus" :size="26"/></div>
        <div>
          <div class="h">创建新资源包</div>
          <div class="s">填写建筑信息 → 上传资料 → AI 自动入图谱<br/>大约需要 3-5 分钟</div>
        </div>
      </div>
      <div v-for="i in 3" :key="i" class="pkg-tile" style="opacity:0.4;pointer-events:none;min-height:180px"/>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" style="padding:40px;text-align:center;color:var(--danger)">
      <AppIcon name="scan" :size="32"/>
      <div style="margin-top:12px">数据加载失败：{{ error }}</div>
      <button class="btn ghost" style="margin-top:16px" @click="fetchApplied()">重试</button>
    </div>

    <!-- 卡片列表 -->
    <div v-else class="pkg-list">
      <!-- 创建入口 -->
      <div class="create-tile" @click="$emit('create')">
        <div class="plus-orb"><AppIcon name="plus" :size="26"/></div>
        <div>
          <div class="h">创建新资源包</div>
          <div class="s">
            填写建筑信息 → 上传资料 → AI 自动入图谱<br/>大约需要 3-5 分钟
          </div>
        </div>
      </div>

      <!-- 建筑卡片 -->
      <PkgTile
        v-for="(pkg, i) in shownList"
        :key="i"
        :pkg="pkg"
        @open="$emit('open', pkg)"
      />
    </div>

    <!-- 高级筛选面板 (Teleport 至 body 防止被 float-in transform 限制层叠上下文和高度) -->
    <Teleport to="body">
      <PkgFilterPanel
        :open="panelOpen"
        :draftFilters="draftFilters"
        :facets="facets"
        :triggerMode="triggerMode"
        :pending="pending"
        @close="panelOpen = false"
        @reset="resetAll"
        @apply="applyDraft"
        @patch="patchDraft"
        @toggle="toggleDraft"
        @update:triggerMode="setTriggerMode"
      >
        <template #closeIcon>
          <AppIcon name="chevron-right" :size="16"/>
        </template>
      </PkgFilterPanel>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import PkgTile from './PkgTile.vue'
import PkgFilterPanel from './filter/PkgFilterPanel.vue'
import http from '../../api/http.js'
import { MOCK } from '../../config.js'
import { getPackageList } from '../../api/packages.js'
import {
  applyPkgFilters,
  buildPkgListBackendParams,
  clonePkgFilters,
  computePkgFacets,
  countActivePkgFilterChips,
  createDefaultPkgFilters,
  normalizePkgList,
  sanitizePkgFiltersAgainstFacets,
} from './filter/pkgFilterCore.js'

defineEmits(['create', 'open'])

const listLoading = ref(false)
const hasLoaded = ref(false)
const error = ref(null)
const universeList = ref([])
const serverList = ref([])

const panelOpen = ref(false)
const triggerMode = ref('realtime')

const appliedFilters = ref(createDefaultPkgFilters())
const draftFilters = reactive(clonePkgFilters(appliedFilters.value))

const facets = computed(() => computePkgFacets(universeList.value, draftFilters))
const activeChipCount = computed(() => countActivePkgFilterChips(draftFilters))
const pending = computed(() => JSON.stringify(clonePkgFilters(appliedFilters.value)) !== JSON.stringify(clonePkgFilters(draftFilters)))

const shownList = computed(() => applyPkgFilters(serverList.value, appliedFilters.value))

// 页面挂载时拉取数据
onMounted(() => {
  fetchUniverse().then(() => fetchApplied())
})

const filterOptions = computed(() => {
  const options = [['all', '全部']]
  ;(facets.value.funcs || []).forEach(it => options.push([it.k, it.n]))
  return options
})

const totalArea = computed(() => universeList.value.reduce((s, p) => s + (p.area || 0), 0))
const activeCount = computed(() => universeList.value.filter(p => p.status === '就绪').length)
const draftCount = computed(() => universeList.value.filter(p => p.status === '计算中').length)
const totalEntities = computed(() => universeList.value.reduce((s, p) => s + (p.entities || 0), 0))
const readyRate = computed(() => universeList.value.length ? Math.round((activeCount.value / universeList.value.length) * 100) : 0)

function patchDraft(patch) {
  Object.assign(draftFilters, patch || {})
}

function toggleDraft({ key, value }) {
  const arr = Array.isArray(draftFilters[key]) ? [...draftFilters[key]] : []
  const idx = arr.indexOf(value)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(value)
  patchDraft({ [key]: arr })
}

function isChipActive(k) {
  if (k === 'all') return !(draftFilters.funcs || []).length
  return (draftFilters.funcs || []).length === 1 && draftFilters.funcs[0] === k
}

function onChipClick(k) {
  if (k === 'all') {
    patchDraft({ funcs: [] })
    return
  }
  if ((draftFilters.funcs || []).length === 1 && draftFilters.funcs[0] === k) {
    patchDraft({ funcs: [] })
    return
  }
  patchDraft({ funcs: [k] })
}

function resetAll() {
  const d = createDefaultPkgFilters()
  appliedFilters.value = clonePkgFilters(d)
  Object.assign(draftFilters, clonePkgFilters(d))
  fetchApplied()
}

function applyDraft() {
  appliedFilters.value = clonePkgFilters(draftFilters)
  fetchApplied()
  panelOpen.value = false
}

function setTriggerMode(m) {
  triggerMode.value = m
}

watch(
  () => JSON.stringify(facets.value),
  () => {
    const sanitized = sanitizePkgFiltersAgainstFacets(draftFilters, facets.value)
    if (JSON.stringify(clonePkgFilters(draftFilters)) !== JSON.stringify(sanitized)) {
      Object.assign(draftFilters, sanitized)
    }
  },
  { immediate: true }
)

let applyTimer = null
watch(
  () => [triggerMode.value, JSON.stringify(clonePkgFilters(draftFilters))],
  ([mode]) => {
    if (mode !== 'realtime') return
    if (applyTimer) clearTimeout(applyTimer)
    applyTimer = setTimeout(() => {
      appliedFilters.value = clonePkgFilters(draftFilters)
      fetchApplied()
    }, 250)
  }
)

async function fetchUniverse() {
  if (listLoading.value) return
  listLoading.value = true
  error.value = null
  try {
    const raw = MOCK ? await getPackageList() : await http.get('/Resource/getResourceList')
    const normalized = normalizePkgList(raw)
    universeList.value = normalized
    if (!hasLoaded.value && normalized.length) hasLoaded.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    listLoading.value = false
  }
}

async function fetchApplied() {
  if (listLoading.value) return
  listLoading.value = true
  error.value = null
  try {
    if (!universeList.value.length) {
      await fetchUniverse()
    }

    const params = buildPkgListBackendParams(appliedFilters.value)
    
    // 如果没有后端筛选参数，且已经有全量数据，则直接使用全量数据
    if (Object.keys(params).length === 0 && universeList.value.length) {
      serverList.value = universeList.value
      if (!hasLoaded.value && universeList.value.length) hasLoaded.value = true
      return
    }

    let raw
    if (MOCK) {
      raw = await getPackageList()
    } else {
      try {
        raw = Object.keys(params).length
          ? await http.get('/Resource/getResourceList', { params })
          : await http.get('/Resource/getResourceList')
      } catch (e) {
        if (Object.keys(params).length) {
          raw = await http.get('/Resource/getResourceList')
        } else {
          throw e
        }
      }
    }

    const normalized = normalizePkgList(raw)
    serverList.value = normalized
    if (!universeList.value.length) universeList.value = normalized
    if (!hasLoaded.value && normalized.length) hasLoaded.value = true
  } catch (e) {
    error.value = e.message
    if (!hasLoaded.value) serverList.value = []
  } finally {
    listLoading.value = false
  }
}
</script>

<style scoped>
.filter-count{
  margin-left:8px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:18px;
  height:18px;
  padding:0 6px;
  border-radius:999px;
  font-size:11px;
  border:1px solid rgba(0,0,0,0.10);
  background:rgba(255,255,255,0.65);
  font-variant-numeric: tabular-nums;
}
</style>
