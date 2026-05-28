<template>
  <span class="dv-tag-chip" :style="color ? { '--cl': color } : {}">
    <slot/>
  </span>
</template>
<script setup>
defineProps({ color: { type: String, default: '' } })
</script>
