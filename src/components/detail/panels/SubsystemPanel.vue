<template>
  <div class="dv-panel">
    <PanelHeader :icon="icon" :color="color" type="子系统" :name="s.name"/>
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
      <MiniLine :data="s.realtime" :height="70" :color="color"
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
import AppIcon       from '../../shared/AppIcon.vue'
import PanelHeader   from '../shared/PanelHeader.vue'
import AISummary     from '../shared/AISummary.vue'
import StatTile      from '../shared/StatTile.vue'
import MiniLine      from '../shared/MiniLine.vue'
import { DV_COLORS } from '../../../data/constants.js'

const MODULE_META = {
  subEnergy:              { color: '#4dc9ff', icon: 'panel'    },
  greenBuild:             { color: '#2bd9a8', icon: 'leaf'     },
  virtualDaynamo:         { color: '#7a5cff', icon: 'bolt'     },
  savingRenovation:       { color: '#2bd9a8', icon: 'leaf'     },
  energyAudit:            { color: '#4dc9ff', icon: 'scan'     },
  benchmark:              { color: '#a799ff', icon: 'graph'    },
  effictImprove:          { color: '#ff8a47', icon: 'zap'      },
  energyUnit:             { color: '#4dc9ff', icon: 'panel'    },
  solar:                  { color: '#ff8a47', icon: 'sun'      },
  charge:                 { color: '#ffb547', icon: 'plug'     },
  carbonQR:               { color: '#2bd9a8', icon: 'sparkles' },
  certificateGlectricity: { color: '#2bd9a8', icon: 'leaf'     },
  blueprint:              { color: '#a799ff', icon: 'panel'    },
  others:                 { color: '#888',    icon: 'panel'    },
}

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
  pkg:    { type: Object, required: true },
})
defineEmits(['selectNode'])

// node.ref 是接口原始节点，其 .type 是 subEnergy / virtualDaynamo 等
const s       = computed(() => props.node.ref)
const rawType = computed(() => s.value?.type || props.node?._apiType || '')
const meta    = computed(() => MODULE_META[rawType.value] || { color: '#4dc9ff', icon: 'panel' })
const icon    = computed(() => String(s.value?.icon || meta.value.icon || 'panel'))
const color   = computed(() => String(props.node?.color || s.value?.color || meta.value.color || '#4dc9ff'))

const docs = computed(() =>
  (s.value?.docs || [])
    .map(did => ({ id: did, ...props.detail.docs?.[did] }))
    .filter(d => d.name)
)
</script>
