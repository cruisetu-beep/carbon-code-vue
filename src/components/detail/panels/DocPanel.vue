<template>
  <div class="dv-panel">
    <PanelHeader icon="doc" :color="DV_COLORS.doc"
                 :type="typeLabel" :name="d.name"
                 :sub="`${d.size} · ${d.pages} 页 · 上传 ${d.uploadAt}`"/>
    <AISummary :text="d.summary"/>

    <div class="dv-panel-section-title">AI 抽取关键标签</div>
    <div class="dv-tag-cloud">
      <TagChip v-for="(t, i) in d.tags" :key="i">{{ t }}</TagChip>
    </div>

    <div class="dv-panel-section-title">
      RAG 切片预览（{{ chunks.length }}）
      <span class="dv-section-hint">悬停切片卡查看其在图谱中的位置 · 点击进入切片详情</span>
    </div>
    <div class="dv-chunk-list">
      <div v-for="c in chunks" :key="c.id"
           class="dv-chunk-card"
           @click="$emit('selectNode', c.id)"
           @mouseenter="$emit('hoverChunk', c.id)"
           @mouseleave="$emit('hoverChunk', null)">
        <div class="dv-chunk-head">
          <span class="dv-chunk-idx">#{{ String(c.idx).padStart(2, '0') }}</span>
          <div class="dv-chunk-vec-bar">
            <div class="dv-chunk-vec-fill" :style="{ width: `${c.confidence}%` }"/>
          </div>
          <ConfidenceBadge :value="c.confidence"/>
        </div>
        <div class="dv-chunk-excerpt">
          {{ c.excerpt.slice(0, 100) }}{{ c.excerpt.length > 100 ? '…' : '' }}
        </div>
        <div class="dv-chunk-foot">
          <TagChip v-for="(t, i) in c.tags" :key="i">{{ t }}</TagChip>
          <span v-if="c.links && c.links.length" class="dv-chunk-link">
            <AppIcon name="graph" :size="9" stroke="#4dc9ff"/> {{ c.links.length }} 关联
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon         from '../../shared/AppIcon.vue'
import PanelHeader     from '../shared/PanelHeader.vue'
import AISummary       from '../shared/AISummary.vue'
import TagChip         from '../shared/TagChip.vue'
import ConfidenceBadge from '../shared/ConfidenceBadge.vue'
import { DV_COLORS }   from '../../../data/constants.js'

const TYPE_LABELS = {
  audit:'审计报告', report:'运行报告', design:'设计方案',
  acceptance:'验收文件', contract:'合同协议', drawing:'建筑图纸',
  list:'清单台账', standard:'标准规范',
}

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
})
defineEmits(['selectNode', 'hoverChunk'])

const d         = computed(() => props.node.ref)
const typeLabel = computed(() => TYPE_LABELS[d.value.type] || '文档')
const chunks    = computed(() =>
  (d.value.chunks || [])
    .map(cid => ({ id: cid, ...props.detail.chunks?.[cid] }))
    .filter(c => c.excerpt)
)
</script>
