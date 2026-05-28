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
        <div class="v">{{ store.list.length }}<span class="u">栋</span></div>
        <div class="d">在管 {{ activeCount }} · 草稿 {{ draftCount }}</div>
      </div>
      <div class="stat-tile" style="--cl:#a799ff">
        <div class="l"><AppIcon name="panel" :size="12"/> 覆盖建筑面积</div>
        <div class="v">{{ (totalArea / 10000).toFixed(1) }}<span class="u">万 ㎡</span></div>
        <div class="d">同比 ↑ 18%</div>
      </div>
      <div class="stat-tile" style="--cl:#2bd9a8">
        <div class="l"><AppIcon name="graph" :size="12"/> 图谱实体</div>
        <div class="v">2,298<span class="u">个</span></div>
        <div class="d">关系边 8,412 · 向量 38.6万</div>
      </div>
      <div class="stat-tile" style="--cl:#ffb547">
        <div class="l"><AppIcon name="zap" :size="12"/> 碳效计算就绪率</div>
        <div class="v">83<span class="u">%</span></div>
        <div class="d">5 栋已生成评级</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="search-box">
        <AppIcon name="search" :size="14"/>
        <input
          v-model="q"
          placeholder="搜索建筑名称 / 编号"
        />
      </div>
      <div class="filter-chips">
        <div
          v-for="[k, n] in filterOptions"
          :key="k"
          :class="['chip', filter === k && 'active']"
          @click="filter = k"
        >{{ n }}</div>
      </div>
      <div style="flex:1"/>
      <button class="btn ghost"><AppIcon name="filter" :size="12"/> 高级筛选</button>
      <button class="btn ghost"><AppIcon name="download" :size="12"/> 导出</button>
    </div>

    <!-- 加载中 -->
    <div v-if="store.listLoading" class="pkg-list">
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
    <div v-else-if="store.error" style="padding:40px;text-align:center;color:var(--danger)">
      <AppIcon name="scan" :size="32"/>
      <div style="margin-top:12px">数据加载失败：{{ store.error }}</div>
      <button class="btn ghost" style="margin-top:16px" @click="store.fetchList()">重试</button>
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
        v-for="(pkg, i) in filtered"
        :key="i"
        :pkg="pkg"
        @open="$emit('open', pkg)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import PkgTile from './PkgTile.vue'
import { usePackageStore } from '../../stores/packages.js'

defineEmits(['create', 'open'])

const store  = usePackageStore()
const filter = ref('all')
const q      = ref('')

// 页面挂载时拉取数据
onMounted(() => {
  store.fetchList()
  store.fetchSummary()
})

const filterOptions = [
  ['all',      '全部'],
  ['office',   '办公'],
  ['mall',     '商场'],
  ['hotel',    '酒店'],
  ['hospital', '医院'],
]

// 原来直接用 SAMPLE_PKGS，现在改为从 store 取
const totalArea   = computed(() => store.totalArea)
const activeCount = computed(() => store.activeCount)
const draftCount  = computed(() => store.draftCount)

const filtered = computed(() =>
  store.list.filter(p => {
    if (filter.value !== 'all' && p.func !== filter.value) return false
    if (q.value && !p.name.includes(q.value) && !p.code.toLowerCase().includes(q.value.toLowerCase())) return false
    return true
  })
)
</script>
