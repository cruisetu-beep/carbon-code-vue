<template>
  <div class="dv-panel">
    <PanelHeader :icon="s.icon" :color="s.color" type="子系统"
                 :name="s.name" :sub="`所属：${pkg.name}`"/>
    <AISummary :text="s.summary"/>

    <template v-if="s.stats && s.stats.length">
      <div class="dv-panel-section-title">结构化字段</div>
      <div class="dv-stat-grid">
        <StatTile v-for="(st, i) in s.stats" :key="i"
                  :label="st.l" :value="st.v" :unit="st.u" :hint="st.t"/>
      </div>
    </template>

    <template v-if="s.realtime">
      <div class="dv-panel-section-title">24h 实时数据</div>
      <MiniLine :data="s.realtime" :height="70" :color="s.color"
                label="最近 24 小时功率曲线"/>
    </template>

    <template v-if="docs.length">
      <div class="dv-panel-section-title">关联文档（{{ docs.length }}）</div>
      <div class="dv-doc-list">
        <div v-for="d in docs" :key="d.id" class="dv-doc-item"
             @click="$emit('selectNode', d.id)">
          <div class="dv-doc-icon" :style="{ background: DV_COLORS.doc + '33' }">
            <AppIcon name="doc" :size="14" :stroke="DV_COLORS.doc"/>
          </div>
          <div class="dv-doc-meta">
            <div class="dv-doc-name">{{ d.name }}</div>
            <div class="dv-doc-sub">{{ d.size }} · {{ d.pages }} 页 · {{ (d.chunks||[]).length }} 切片</div>
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
import StatTile     from '../shared/StatTile.vue'
import MiniLine     from '../shared/MiniLine.vue'
import { DV_COLORS } from '../../../data/constants.js'

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
  pkg:    { type: Object, required: true },
})
defineEmits(['selectNode'])

const s    = computed(() => props.node.ref)
const docs = computed(() =>
  (s.value.docs || [])
    .map(did => ({ id: did, ...props.detail.docs?.[did] }))
    .filter(d => d.name)
)
</script>
