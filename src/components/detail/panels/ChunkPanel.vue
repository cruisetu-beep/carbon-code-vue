<template>
  <div class="dv-panel">
    <PanelHeader icon="scan" :color="DV_COLORS.chunk" type="RAG 切片"
                 :name="`#${String(c.idx).padStart(2,'0')} · ${doc?.name || ''}`"
                 :sub="`置信度 ${c.confidence}% · 已向量化`"/>

    <div class="dv-panel-section-title">片段内容</div>
    <div class="dv-chunk-fulltext">"{{ c.excerpt }}"</div>

    <div class="dv-panel-section-title">语义标签</div>
    <div class="dv-tag-cloud">
      <TagChip v-for="(t, i) in c.tags" :key="i">{{ t }}</TagChip>
    </div>

    <div class="dv-panel-section-title">
      AI 建立的图谱关系（{{ links.length }}）
      <span class="dv-section-hint">此切片在知识图谱中触发了 {{ links.length }} 条关系边</span>
    </div>
    <div class="dv-doc-list">
      <div v-for="l in links" :key="l.id" class="dv-doc-item"
           @click="$emit('selectNode', l.id)">
        <AppIcon name="graph" :size="12" stroke="#4dc9ff"/>
        <div class="dv-doc-meta">
          <div class="dv-doc-name">{{ l.name }}</div>
        </div>
        <AppIcon name="chevron-right" :size="12" stroke="#8da3c8"/>
      </div>
    </div>

    <template v-if="doc">
      <div class="dv-panel-section-title">所属文档</div>
      <div class="dv-source-trace" @click="$emit('selectNode', c.docId)">
        <AppIcon name="doc" :size="14" :stroke="DV_COLORS.doc"/>
        <div class="dv-source-info">
          <div class="dv-source-label">查看完整文档</div>
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
import TagChip      from '../shared/TagChip.vue'
import { DV_COLORS } from '../../../data/constants.js'

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
})
defineEmits(['selectNode'])

const c   = computed(() => props.node.ref)
const doc = computed(() => props.detail.docs?.[c.value.docId])

const links = computed(() => {
  const all = {
    ...props.detail.devices,
    ...props.detail.groups,
    ...props.detail.docs,
  }
  return (c.value.links || []).map(lid => {
    const target = all[lid] || props.detail.subsystems?.find(s => s.id === lid)
    return target ? { id: lid, name: target.name } : null
  }).filter(Boolean)
})
</script>
