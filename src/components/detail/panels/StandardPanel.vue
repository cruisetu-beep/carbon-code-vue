<template>
  <div class="dv-panel">
    <PanelHeader icon="tag" :color="DV_COLORS.standard" type="标准规范"
                 :name="s.name" :sub="s.full"/>
    <AISummary :text="summaryText"/>

    <div class="dv-panel-section-title">符合性自检结果</div>
    <div class="dv-check-result">
      <AppIcon name="check" :size="18" stroke="#2bd9a8"/>
      <span style="color:#2bd9a8;font-weight:600">{{ s.check }}</span>
    </div>

    <template v-if="doc">
      <div class="dv-panel-section-title">详细文档</div>
      <div class="dv-source-trace" @click="$emit('selectNode', s.doc)">
        <AppIcon name="doc" :size="14" :stroke="DV_COLORS.doc"/>
        <div class="dv-source-info">
          <div class="dv-source-label">查看标准全文</div>
          <div class="dv-source-name">{{ doc.name }}</div>
        </div>
        <AppIcon name="chevron-right" :size="12" stroke="#8da3c8"/>
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

const s           = computed(() => props.node.ref)
const doc         = computed(() => s.value.doc ? props.detail.docs?.[s.value.doc] : null)
const summaryText = computed(() =>
  doc.value?.summary || `${s.value.name} 适用于本建筑的相关条款已被 AI 自动抽取并完成符合性自检。`
)
</script>
