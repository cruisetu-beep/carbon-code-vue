<template>
  <div class="dv-stat-tile">
    <div class="dv-stat-label">{{ label }}</div>
    <div class="dv-stat-value">
      {{ value }}<span v-if="unit" class="dv-stat-unit">{{ unit }}</span>
    </div>
    <div v-if="hint" class="dv-stat-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  unit:  String,
  hint:  String,
})
</script>
