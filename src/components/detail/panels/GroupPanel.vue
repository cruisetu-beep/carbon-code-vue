<template>
  <div class="dv-panel">
    <PanelHeader icon="cpu" :color="DV_COLORS.group" type="设备组" :name="g.name"/>
    <AISummary :text="g.summary || 'AI 已识别此设备组的成员构成。'"/>

    <template v-if="devs.length">
      <div class="dv-panel-section-title">组内设备（{{ devs.length }}）</div>
      <div class="dv-doc-list">
        <div v-for="d in devs" :key="d.id" class="dv-doc-item"
             @click="$emit('selectNode', d.id)">
          <div class="dv-doc-icon" :style="{ background: DV_COLORS.device + '33' }">
            <AppIcon name="cpu" :size="14" :stroke="DV_COLORS.device"/>
          </div>
          <div class="dv-doc-meta">
            <div class="dv-doc-name">{{ d.name }}</div>
            <div class="dv-doc-sub">{{ d.brand }} · {{ d.model }}</div>
          </div>
          <AppIcon name="chevron-right" :size="12" stroke="#8da3c8"/>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon      from '../../shared/AppIcon.vue'
import PanelHeader  from '../shared/PanelHeader.vue'
import AISummary    from '../shared/AISummary.vue'
import { DV_COLORS } from '../../../data/constants.js'

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
})
defineEmits(['selectNode'])

const g    = computed(() => props.node.ref)
const devs = computed(() =>
  (g.value.devices || [])
    .map(did => ({ id: did, ...props.detail.devices?.[did] }))
    .filter(d => d.name)
)
</script>
