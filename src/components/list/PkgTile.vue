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
        <div class="l">业务数</div>
      </div>
      <div class="s">
        <div class="v">
          <span v-if="pkg.status === '就绪'" class="badge ok">
            <AppIcon name="check" :size="9"/> 就绪
          </span>
          <span v-else-if="pkg.status === '计算中'" class="badge warn">计算中</span>
          <span v-else class="badge">草稿</span>
        </div>
        <div class="l">AI解析</div>
      </div>
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


const scoreBadgeClass = computed(() => {
  if (props.pkg.score === '—') return 'dash'
  if (props.pkg.score?.startsWith('B'))  return 'b'
  return ''
})
</script>
