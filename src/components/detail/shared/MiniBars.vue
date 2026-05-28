<template>
  <div v-if="data && data.length" class="dv-mini-chart">
    <div v-if="label" class="dv-mini-label">{{ label }}</div>
    <svg width="100%" :height="height" :viewBox="`0 0 ${data.length * 4} ${height}`" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.9"/>
          <stop offset="100%" :stop-color="color" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect
        v-for="(v, i) in data" :key="i"
        :x="i * 4 + 0.5" :y="height - barH(v)"
        width="3" :height="barH(v)"
        :fill="`url(#${gradId})`" rx="0.5"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:   { type: Array,  default: () => [] },
  height: { type: Number, default: 36 },
  color:  { type: String, default: '#4dc9ff' },
  label:  { type: String, default: '' },
})

const gradId = computed(() => `mb-${props.color.replace('#', '')}`)
const maxVal  = computed(() => Math.max(...props.data, 1))
const barH    = (v) => (v / maxVal.value) * (props.height - 2)
</script>
