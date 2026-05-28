<template>
  <span class="dv-conf-badge" :style="{ '--cl': color }">{{ value }}%</span>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ value: { type: Number, required: true } })
const color = computed(() =>
  props.value >= 95 ? '#2bd9a8' : props.value >= 90 ? '#4dc9ff' : '#ffb547'
)
</script>
