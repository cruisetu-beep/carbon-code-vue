<template>
  <div :class="['pkg-tile', pkg.status]" @click="$emit('open')">

    <!-- 头部：图标 + 信息 + 碳效评分 -->
    <div class="pkg-head">
      <div class="ic"><AppIcon name="cube" :size="22"/></div>
      <div class="info">
        <div class="code">{{ pkg.code }}</div>
        <div class="name">{{ pkg.name }}</div>
        <div class="meta">
          <span><AppIcon name="panel" :size="10"/> {{ FUNC_MAP[pkg.func] }}</span>
          <span>· {{ pkg.area.toLocaleString() }} ㎡</span>
          <span>· {{ pkg.year }} 年</span>
        </div>
      </div>
      <div :class="['score-badge', scoreBadgeClass]">{{ pkg.score }}</div>
    </div>

    <!-- 三列统计 -->
    <div class="stats">
      <div class="s">
        <div class="v">{{ pkg.docs }}</div>
        <div class="l">已解析文档</div>
      </div>
      <div class="s">
        <div class="v" style="color:#a799ff">{{ pkg.entities }}</div>
        <div class="l">图谱实体</div>
      </div>
      <div class="s">
        <div class="v">
          <span v-if="pkg.status === 'active'" class="badge ok">
            <AppIcon name="check" :size="9"/> 就绪
          </span>
          <span v-else-if="pkg.status === 'computing'" class="badge warn">计算中</span>
          <span v-else class="badge">草稿</span>
        </div>
        <div class="l">状态</div>
      </div>
    </div>

    <!-- 子系统标签 -->
    <div class="subs">
      <span
        v-for="s in pkg.subs"
        :key="s"
        class="sub-pill"
        :style="{ '--cl': SUB_COLOR[s] }"
      >
        <AppIcon :name="SUB_ICON[s]" :size="10"/>
        {{ SUB_LABEL[s] }}
      </span>
    </div>

    <!-- 底部：更新时间 + 操作按钮 -->
    <div class="pkg-foot">
      <div class="upd">
        <AppIcon name="check" :size="10"/> 更新于 {{ pkg.updated }}
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
import { FUNC_MAP } from '../../data/constants.js'

const props = defineProps({
  pkg: { type: Object, required: true },
})
defineEmits(['open'])

const SUB_ICON  = { sub_meter: 'panel', vpp: 'bolt', retrofit: 'leaf', charge: 'plug', pv: 'sun' }
const SUB_COLOR = { sub_meter: '#4dc9ff', vpp: '#7a5cff', retrofit: '#2bd9a8', charge: '#ffb547', pv: '#ff8a47' }
const SUB_LABEL = { sub_meter: '分项计量', vpp: '虚拟电厂', retrofit: '节能改造', charge: '充电桩', pv: '光伏' }

const scoreBadgeClass = computed(() => {
  if (props.pkg.score === '—') return 'dash'
  if (props.pkg.score?.startsWith('B'))  return 'b'
  return ''
})
</script>
