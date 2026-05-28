<template>
  <div v-if="data && data.length" class="dv-mini-chart">
    <div v-if="label" class="dv-mini-label">{{ label }}</div>
    <svg width="100%" :height="height" :viewBox="`0 0 ${W} ${height}`" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   :stop-color="color" stop-opacity="0.4"/>
          <stop offset="100%" :stop-color="color" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path v-if="fill" :d="areaPath" :fill="`url(#${gradId})`"/>
      <path :d="linePath" fill="none" :stroke="color" stroke-width="1.4"/>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:   { type: Array,   default: () => [] },
  height: { type: Number,  default: 60 },
  color:  { type: String,  default: '#4dc9ff' },
  label:  { type: String,  default: '' },
  fill:   { type: Boolean, default: true },
})

const W      = 240
const gradId = computed(() => `ml-${props.color.replace('#', '')}-${Math.floor(Math.random() * 1000)}`)
const maxVal  = computed(() => Math.max(...props.data, 1))

const pts = computed(() =>
  props.data.map((v, i) => {
    const x = (i / (props.data.length - 1)) * W
    const y = props.height - 4 - (v / maxVal.value) * (props.height - 8)
    return `${x},${y}`
  })
)
const linePath  = computed(() => `M${pts.value.join(' L')}`)
const areaPath  = computed(() =>
  `M0,${props.height} L${pts.value.join(' L')} L${W},${props.height} Z`
)
</script>
