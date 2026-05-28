<template>
  <div class="dv-ai-summary">
    <div class="dv-ai-summary-head">
      <AppIcon name="sparkles" :size="14" stroke="#4dc9ff"/>
      <span class="dv-ai-summary-label">{{ label || 'AI 智能摘要' }}</span>
      <span v-if="stillTyping" class="dv-ai-typing-dot"/>
    </div>
    <div class="dv-ai-summary-body">
      {{ displayed }}
      <span v-if="stillTyping" class="dv-ai-cursor">▎</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import AppIcon from '../../shared/AppIcon.vue'

const props = defineProps({
  text:  { type: String, default: '' },
  label: { type: String, default: '' },
})

const displayed = ref('')
let timer = null

function startTyping(text) {
  if (timer) clearInterval(timer)
  displayed.value = ''
  if (!text) return
  let i = 0
  const stepSize = Math.max(1, Math.ceil(text.length / 60))
  timer = setInterval(() => {
    i += stepSize
    displayed.value = text.slice(0, i)
    if (i >= text.length) clearInterval(timer)
  }, 22)
}

watch(() => props.text, (val) => startTyping(val), { immediate: true })
onUnmounted(() => { if (timer) clearInterval(timer) })

const stillTyping = computed(() =>
  props.text && displayed.value.length < props.text.length
)
</script>
