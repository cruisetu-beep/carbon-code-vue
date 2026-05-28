<template>
  <div class="dv-panel">
    <PanelHeader icon="cpu" :color="DV_COLORS.device" type="设备节点"
                 :name="d.name" :sub="`${d.brand || ''} · ${d.model || ''}`"/>
    <AISummary label="AI 提取参数"
               :text="`AI 从源文档中提取了该设备的 ${paramCount} 项关键参数，整体置信度 ${d.confidence}%。`"/>

    <div class="dv-panel-section-title">铭牌参数</div>
    <div class="dv-kv-list">
      <div v-for="[k, v] in paramEntries" :key="k" class="dv-kv-row">
        <span class="dv-kv-key">{{ k }}</span>
        <span class="dv-kv-val">{{ v }}</span>
        <ConfidenceBadge :value="d.confidence"/>
      </div>
    </div>

    <template v-if="sourceDoc">
      <div class="dv-panel-section-title">来源溯源</div>
      <div class="dv-source-trace" @click="$emit('selectNode', d.source)">
        <AppIcon name="doc" :size="14" :stroke="DV_COLORS.doc"/>
        <div class="dv-source-info">
          <div class="dv-source-label">参数提取自</div>
          <div class="dv-source-name">{{ sourceDoc.name }}</div>
        </div>
        <AppIcon name="chevron-right" :size="12" stroke="#8da3c8"/>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon           from '../../shared/AppIcon.vue'
import PanelHeader       from '../shared/PanelHeader.vue'
import AISummary         from '../shared/AISummary.vue'
import ConfidenceBadge   from '../shared/ConfidenceBadge.vue'
import { DV_COLORS }     from '../../../data/constants.js'

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
})
defineEmits(['selectNode'])

const d            = computed(() => props.node.ref)
const paramEntries = computed(() => Object.entries(d.value.params || {}))
const paramCount   = computed(() => paramEntries.value.length)
const sourceDoc    = computed(() =>
  d.value.source ? props.detail.docs?.[d.value.source] : null
)
</script>
