<template>
  <div class="dv-panel-head">
    <div class="dv-panel-icon" :style="{ background: `linear-gradient(135deg, ${color}, ${color}80)` }">
      <AppIcon :name="icon" :size="18" stroke="#fff"/>
    </div>
    <div class="dv-panel-title-wrap">
      <div class="dv-panel-type">{{ type }}</div>
      <div class="dv-panel-title">{{ name }}</div>
      <div v-if="sub" class="dv-panel-sub">{{ sub }}</div>
    </div>
  </div>
</template>
<script setup>
import AppIcon from '../../shared/AppIcon.vue'
defineProps({
  icon:  { type: String, required: true },
  color: { type: String, required: true },
  type:  { type: String, required: true },
  name:  { type: String, required: true },
  sub:   { type: String, default: '' },
})
</script>
