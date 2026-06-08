<template>
  <div class="dv-panel">
    <PanelHeader :icon="icon" :color="color" type="子系统" :name="s.name"/>

    <!-- 建筑基本信息卡（仅分项计量展示）-->
    <template v-if="isSubEnergy && buildInfo">
      <!-- 第一行：建筑类型 + 建筑面积 两列 -->
      <div class="bp-status-grid">
        <div class="bp-status-card bp-status-none">
          <div class="bp-status-icon">
            <AppIcon name="cube" :size="14" stroke="#4dc9ff"/>
          </div>
          <div class="bp-status-body">
            <div class="bp-status-title">建筑类型</div>
            <div class="bp-status-val none">{{ buildInfo.buildType || '—' }}</div>
          </div>
        </div>
        <div class="bp-status-card bp-status-none">
          <div class="bp-status-icon">
            <AppIcon name="database" :size="14" stroke="#4dc9ff"/>
          </div>
          <div class="bp-status-body">
            <div class="bp-status-title">建筑面积</div>
            <div class="bp-status-val none">{{ (buildInfo.area || '—').replace('平方米', '㎡') }}</div>
          </div>
        </div>
      </div>
      <!-- 第二行：接入时间 + 数据传输 + 计量回路 三列 -->
      <div class="bp-status-grid si-three-col">
        <div class="bp-status-card bp-status-none">
          <div class="bp-status-icon">
            <AppIcon name="bell" :size="12" stroke="#4dc9ff"/>
          </div>
          <div class="bp-status-body">
            <div class="bp-status-title">接入时间</div>
            <div class="bp-status-val none si-val-sm">{{ buildInfo?.startTime || '—' }}</div>
          </div>
        </div>
        <div v-if="dataStatus" class="bp-status-card si-three-col" :class="dataStatus.transfer.ok ? 'bp-status-ok' : 'bp-status-warn'">
          <div class="bp-status-icon">
            <AppIcon name="refresh" :size="12" :stroke="dataStatus.transfer.ok ? '#2bd9a8' : '#ffb547'"/>
          </div>
          <div class="bp-status-body">
            <div class="bp-status-title">数据传输</div>
            <div class="bp-status-val si-val-sm" :class="dataStatus.transfer.ok ? 'ok' : 'warn'">
              {{ dataStatus.transfer.subName || '—' }}
            </div>
          </div>
        </div>
        <div v-else class="bp-status-card bp-status-none">
          <div class="bp-status-icon"><AppIcon name="refresh" :size="12" stroke="#4dc9ff"/></div>
          <div class="bp-status-body">
            <div class="bp-status-title">数据传输</div>
            <div class="bp-status-val none si-val-sm">—</div>
          </div>
        </div>
        <div class="bp-status-card bp-status-none">
          <div class="bp-status-icon">
            <AppIcon name="panel" :size="12" stroke="#4dc9ff"/>
          </div>
          <div class="bp-status-body">
            <div class="bp-status-title">计量回路</div>
            <div class="bp-status-val none si-val-sm">{{ buildInfo?.circuits || '—' }}</div>
          </div>
        </div>
      </div>
      <!-- 第三行：项目地址独占整行 -->
      <div class="bp-status-grid" style="grid-template-columns: 1fr;">
        <div class="bp-status-card bp-status-none">
          <div class="bp-status-icon">
            <AppIcon name="tag" :size="14" stroke="#4dc9ff"/>
          </div>
          <div class="bp-status-body">
            <div class="bp-status-title">项目地址</div>
            <div class="bp-status-val none si-address" :title="buildInfo.address">{{ buildInfo.address && buildInfo.address.length > 12 ? buildInfo.address.slice(0, 12) + '…' : (buildInfo.address || '—') }}</div>
          </div>
        </div>
      </div>
    </template>

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

const s       = computed(() => props.node.ref)
const rawType = computed(() => s.value?.type || props.node?._apiType || '')
const meta    = computed(() => MODULE_META[rawType.value] || { color: '#4dc9ff', icon: 'panel' })
const icon    = computed(() => String(s.value?.icon || meta.value.icon || 'panel'))
const color   = computed(() => String(props.node?.color || s.value?.color || meta.value.color || '#4dc9ff'))

// 是否为分项计量子系统
const isSubEnergy = computed(() => rawType.value === 'subEnergy')

// 从 subEnergy.baseInfo.data.generalInfo 里提取四个字段
// 路径: _rootNode.children[subEnergy].children[baseInfo].data.generalInfo
const buildInfo = computed(() => {
  const rootNode = props.detail?._rootNode
  if (!rootNode) return null

  // 找 subEnergy 一级节点
  const subEnergyNode = (rootNode.children || []).find(n => n.type === 'subEnergy')
  if (!subEnergyNode) return null

  // 找 baseInfo 二级节点
  const baseInfoNode = (subEnergyNode.children || []).find(n => n.type === 'baseInfo')
  if (!baseInfoNode) return null

  const generalInfo = baseInfoNode.data?.generalInfo
  if (!Array.isArray(generalInfo)) return null

  const find = (key) => generalInfo.find(d => d.key === key)?.value || ''

  return {
    buildType: find('建筑类型'),
    address:   find('项目地址'),
    area:      find('建筑面积'),
    circuits:  find('总回路数'),
    startTime: find('开始时间'),
  }
})

// 从 dataQuantity 节点取数据传输和市平台上传的最新状态
// 路径: subEnergy → data → dataQuantity
const dataStatus = computed(() => {
  const rootNode = props.detail?._rootNode
  if (!rootNode) return null
  const subEnergyNode = (rootNode.children || []).find(n => n.type === 'subEnergy')
  if (!subEnergyNode) return null
  // 兼容两种路径：直接子节点 或 data子节点下
  const dataNode = (subEnergyNode.children || []).find(n => n.type === 'data')
  const searchIn = dataNode ? (dataNode.children || []) : (subEnergyNode.children || [])
  const dqNode = searchIn.find(n => n.type === 'dataQuantity')
  if (!dqNode || !Array.isArray(dqNode.data)) return null

  // 按 checkTime 降序，取每个 statusName 最新一条
  const sorted = [...dqNode.data].sort((a, b) => (b.checkTime || '').localeCompare(a.checkTime || ''))
  const latest = (name) => sorted.find(d => d.statusName === name)

  const transfer = latest('数据传输')
  const upload   = latest('市平台上传')
  if (!transfer && !upload) return null

  return {
    transfer: { subName: transfer?.subName || '—', ok: transfer?.sign === 1 },
    upload:   { subName: upload?.subName   || '—', ok: upload?.sign   === 1 },
  }
})

const docs = computed(() =>
  (s.value?.docs || [])
    .map(did => ({ id: did, ...props.detail.docs?.[did] }))
    .filter(d => d.name)
)
</script>
