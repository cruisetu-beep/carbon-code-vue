<template>
  <div :class="['pkg-tile', pkg.status]" @click="$emit('open')">

    <!-- 头部：图标 + 信息 + 碳效评分 -->
    <div class="pkg-head">
      <!-- <div class="ic"><AppIcon name="cube" :size="22"/></div> -->
      <div class="info">
        <div class="code">{{ pkg._raw?.caseID || '-' }} · {{ pkg._raw?.buildID || '-' }}</div>
        <div class="name">{{ pkg.name }}</div>
        <div class="meta">
          <span><AppIcon name="panel" :size="10"/> {{ pkg.funcName || '未知类型' }}</span>
          <span v-if="pkg.area"> · {{ Number(pkg.area).toLocaleString() }} ㎡</span>
          <span v-if="pkg.year"> · {{ pkg.year }}年</span>
        </div>
      </div>
      <div :class="['score-badge', scoreBadgeClass]">{{ pkg.score }}</div>
    </div>

    <!-- 三列统计 -->
    <div class="stats">
      <div class="s">
        <div class="v">{{ pkg.docs }}</div>
        <div class="l">文件数</div>
      </div>
      <div class="s">
        <div class="v" style="color:#a799ff">{{ pkg.entities }}</div>
        <div class="l">专项数</div>
      </div>
      <div class="s">
        <div class="v">
          <span v-if="pkg.status === '就绪'" class="badge ok">
            <AppIcon name="check" :size="9"/> 就绪
          </span>
          <span v-else-if="pkg.status === '计算中'" class="badge warn">计算中</span>
          <span v-else class="badge">草稿</span>
        </div>
        <div class="l">状态</div>
      </div>
    </div>

    <!-- 子系统标签 -->
    <div class="subs">
      <span
        v-for="s in subsNormalized.filter(x => x.count > 0)"
        :key="s.type"
        class="sub-pill"
        :style="{ '--cl': s.color || '#4dc9ff' }"
      >
        <AppIcon :name="s.icon || 'panel'" :size="10"/>
        {{ s.name }}
        <span v-if="s.count !== undefined" style="opacity:0.75">· {{ s.count }}</span>
      </span>
    </div>

    <!-- 底部：更新时间 + 操作按钮 -->
    <div class="pkg-foot">
      <div class="upd">
        <!-- <AppIcon name="check" :size="10"/> caseID: {{ pkg._raw?.caseID || '-' }} -->
      </div>
      <button class="btn ghost" style="padding:6px 12px;font-size:11px" @click.stop="$emit('open')">
        <AppIcon name="eye" :size="10"/> 查看详情
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '../shared/AppIcon.vue'

const props = defineProps({
  pkg: { type: Object, required: true },
})
defineEmits(['open'])

const CATALOG_META = {
  summary: { icon: 'sparkles', color: '#a799ff' },
  subEnergy: { icon: 'panel', color: '#4dc9ff' },
  greenBuild: { icon: 'leaf', color: '#2bd9a8' },
  virtualDaynamo: { icon: 'bolt', color: '#7a5cff' },
  savingRenovation: { icon: 'leaf', color: '#2bd9a8' },
  energyAudit: { icon: 'scan', color: '#4dc9ff' },
  benchmark: { icon: 'graph', color: '#a799ff' },
  effictImprove: { icon: 'zap', color: '#ff8a47' },
  energyUnit: { icon: 'panel', color: '#4dc9ff' },
  solar: { icon: 'sun', color: '#ff8a47' },
  charge: { icon: 'plug', color: '#ffb547' },
  carbonQR: { icon: 'sparkles', color: '#2bd9a8' },
  certificateGlectricity: { icon: 'leaf', color: '#2bd9a8' },
  blueprint: { icon: 'panel', color: '#a799ff' },
  others: { icon: 'panel', color: '#888' },
}

const subsNormalized = computed(() =>
  (props.pkg.subs || []).map(s => {
    if (typeof s === 'string') return { type: s, name: s, ...CATALOG_META[s] }
    const t = s.type || s.catalogsType
    return { ...s, type: t, ...CATALOG_META[t], name: s.name || s.catalogsName || t }
  })
)

const scoreBadgeClass = computed(() => {
  if (props.pkg.score === '—') return 'dash'
  if (props.pkg.score?.startsWith('B'))  return 'b'
  return ''
})
</script>
