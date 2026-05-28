<template>
  <div class="breadcrumb">
    <template v-for="(item, i) in items" :key="i">
      <span :class="['crumb', i === items.length - 1 && 'active']">{{ item }}</span>
      <AppIcon v-if="i < items.length - 1" name="chevron-right" :size="12"/>
    </template>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
defineProps({
  items: { type: Array, required: true },
})
</script>
