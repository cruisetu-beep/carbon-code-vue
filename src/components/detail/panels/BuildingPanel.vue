<template>
  <div class="dv-panel">
    <PanelHeader
      icon="cube" :color="DV_COLORS.building" type="建筑实体"
      :name="detail._buildName || detail._raw?.resourceName || pkg.name"
    />

    <!-- 状态卡片 2×2 -->
    <div class="bp-status-grid">
      <!-- AI 解析 -->
      <div class="bp-status-card bp-status-ok">
        <div class="bp-status-icon">
          <AppIcon name="sparkles" :size="14" stroke="#2bd9a8"/>
        </div>
        <div class="bp-status-body">
          <div class="bp-status-title">AI 解析</div>
          <div class="bp-status-val ok">已完成</div>
        </div>
      </div>

      <!-- 碳效码 -->
      <div class="bp-status-card" :class="carbonQRInfo ? 'bp-status-ok' : 'bp-status-none'">
        <div class="bp-status-icon">
          <AppIcon name="zap" :size="14" :stroke="carbonQRInfo ? '#4dc9ff' : '#8da3c8'"/>
        </div>
        <div class="bp-status-body">
          <div class="bp-status-title">碳效码</div>
          <div class="bp-status-val" :class="carbonQRInfo ? 'info' : 'none'">
            {{ carbonQRInfo || '暂无' }}
          </div>
        </div>
      </div>

      <!-- 淘汰设备 -->
      <div class="bp-status-card" :class="hasObsolete ? 'bp-status-warn' : 'bp-status-ok'">
        <div class="bp-status-icon">
          <AppIcon name="cpu" :size="14" :stroke="hasObsolete ? '#ffb547' : '#2bd9a8'"/>
        </div>
        <div class="bp-status-body">
          <div class="bp-status-title">淘汰设备</div>
          <div class="bp-status-val" :class="hasObsolete ? 'warn' : 'ok'">
            {{ hasObsolete ? '存在待淘汰' : '未发现' }}
          </div>
        </div>
      </div>

      <!-- 待调适楼宇 -->
      <div class="bp-status-card" :class="inTuning ? 'bp-status-info' : 'bp-status-none'">
        <div class="bp-status-icon">
          <AppIcon name="settings" :size="14" :stroke="inTuning ? '#a799ff' : '#8da3c8'"/>
        </div>
        <div class="bp-status-body">
          <div class="bp-status-title">待调适楼宇</div>
          <div class="bp-status-val" :class="inTuning ? 'info' : 'none'">
            {{ inTuning ? '在调适库中' : '未加入' }}
          </div>
        </div>
      </div>
    </div>

    <!-- AI 总结打字机 -->
    <div class="bp-ai-wrap">
      <div class="bp-ai-header">
        <AppIcon name="sparkles" :size="11" stroke="#a799ff"/>
        <span>AI 总结</span>
        <span v-if="typing" class="bp-ai-progress">{{ typingProgress }}%</span>
      </div>
      <div class="bp-ai-body" ref="aiBodyEl">
        <span class="bp-ai-text">{{ displayText }}</span>
        <span v-if="typing" class="bp-ai-cursor">|</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import PanelHeader   from '../shared/PanelHeader.vue'
import AppIcon       from '../shared/AppIcon.vue'
import { DV_COLORS } from '../../../data/constants.js'

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
  pkg:    { type: Object, required: true },
})

// ── 碳效码 ────────────────────────────────────────────────────
const carbonQRInfo = computed(() => {
  const rootNode = props.detail?._rootNode
  if (!rootNode) return ''
  const carbonNode = (rootNode.children || []).find(
    n => n.levelType === '一级节点' && n.type === 'carbonQR'
  )
  if (!carbonNode) return ''
  const baseInfo = (carbonNode.children || []).find(c => c.type === 'baseInfo')
  if (!baseInfo) return ''
  const dataArr = Array.isArray(baseInfo.data) ? baseInfo.data : []
  if (!dataArr.length) return ''
  const d = dataArr[0]
  return `${d.year} · ${d.evaluationCode}`
})

// ── 随机状态（固定到 buildId，避免刷新跳变）─────────────────
function seededRand(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}
const buildSeed = computed(() => {
  const s = props.detail?._rootNode?.data?.buildId || props.pkg.code || 'x'
  return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
})
const hasObsolete = computed(() => seededRand(buildSeed.value + 1) > 0.5)
const inTuning    = computed(() => seededRand(buildSeed.value + 2) > 0.5)

// ── AI 总结文本 ───────────────────────────────────────────────
const fullText = computed(() => {
  const rootNode = props.detail?._rootNode
  if (!rootNode) return ''
  const aiNode = (rootNode.children || []).find(n => n.type === 'aiSummary')
  return aiNode?.data || ''
})

// ── 打字机效果 ────────────────────────────────────────────────
const displayText    = ref('')
const typing         = ref(false)
const typingProgress = ref(0)
const aiBodyEl       = ref(null)
let   timer          = null

function startTyping(text) {
  clearInterval(timer)
  displayText.value = ''
  typing.value = true
  typingProgress.value = 0
  let i = 0
  timer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(timer)
      typing.value = false
      typingProgress.value = 100
      return
    }
    // 每次追加1-3个字加速长文本
    const step = text.length > 500 ? 3 : 1
    displayText.value += text.slice(i, i + step)
    i += step
    typingProgress.value = Math.min(99, Math.round(i / text.length * 100))
    // 自动滚到底
    if (aiBodyEl.value) aiBodyEl.value.scrollTop = aiBodyEl.value.scrollHeight
  }, 30)
}

watch(fullText, (val) => {
  if (val) startTyping(val)
}, { immediate: true })

onBeforeUnmount(() => clearInterval(timer))
</script>
