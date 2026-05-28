<template>
  <div class="dv-panel">
    <PanelHeader
      icon="cube" :color="DV_COLORS.building" type="建筑实体"
      :name="pkg.name"
      :sub="`${pkg.code} · ${FUNC_MAP[pkg.func]} · ${pkg.area.toLocaleString()} ㎡`"
    />
    <AISummary :text="b.summary"/>

    <div class="dv-panel-section-title">知识库统计</div>
    <div class="dv-stat-grid">
      <StatTile label="已解析文档" :value="b.stats.docs"      unit="份"/>
      <StatTile label="知识实体"   :value="b.stats.entities"  unit="个"/>
      <StatTile label="关系边"     :value="b.stats.edges"     unit="条"/>
      <StatTile label="向量维度"   :value="b.stats.vectors"   unit="组"/>
      <StatTile label="设备节点"   :value="b.stats.devices"   unit="台"/>
      <StatTile label="指标节点"   :value="b.stats.metrics"   unit="项"/>
      <StatTile label="切片片段"   :value="b.stats.chunks"    unit="片"/>
      <StatTile label="适用标准"   :value="b.stats.standards" unit="项"/>
    </div>

    <template v-if="b.energy30d">
      <div class="dv-panel-section-title">近 30 日能耗速览</div>
      <MiniBars :data="b.energy30d" :height="60" color="#4dc9ff"
                :label="`日均 ${avgEnergy} kWh`"/>
    </template>

    <div class="dv-panel-section-title">建筑评级</div>
    <div class="dv-rating-row">
      <div class="dv-rating-card">
        <div class="dv-rating-label">碳效码</div>
        <div class="dv-rating-value" style="color:#2bd9a8">{{ pkg.score || '—' }}</div>
      </div>
      <div class="dv-rating-card">
        <div class="dv-rating-label">综合评级</div>
        <div class="dv-rating-value">{{ pkg.cls || '—' }}</div>
      </div>
      <div class="dv-rating-card">
        <div class="dv-rating-label">建成年份</div>
        <div class="dv-rating-value" style="font-size:18px">{{ pkg.year }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PanelHeader      from '../shared/PanelHeader.vue'
import AISummary        from '../shared/AISummary.vue'
import StatTile         from '../shared/StatTile.vue'
import MiniBars         from '../shared/MiniBars.vue'
import { DV_COLORS }    from '../../../data/constants.js'
import { FUNC_MAP }     from '../../../data/constants.js'

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
  pkg:    { type: Object, required: true },
})

const b = computed(() => props.detail.building)
const avgEnergy = computed(() => {
  const arr = b.value.energy30d
  return Math.round(arr.reduce((a, c) => a + c, 0) / arr.length)
})
</script>
