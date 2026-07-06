<template>
  <div class="dv-panel">
    <PanelHeader :icon="panelIcon" :color="panelColor" :type="panelType" :name="node.name"/>

    <!-- ① baseInfo：generalInfo 格式（分项计量）-->
    <template v-if="nodeType === 'baseInfo' && generalInfo.length">
      <div class="dv-panel-section-title">基础信息</div>
      <div class="rn-kv-list">
        <div v-for="item in generalInfo.filter(i => i.value)" :key="item.key" class="rn-kv-row">
          <span class="rn-kv-key">{{ item.key }}</span>
          <span class="rn-kv-val">{{ item.value }}</span>
        </div>
      </div>
      <template v-if="subMeter.length">
        <div class="dv-panel-section-title">计量回路</div>
        <div class="rn-meter-grid">
          <div v-for="m in subMeter" :key="m.key" class="rn-meter-card">
            <div class="rn-meter-val">{{ m.value }}<span class="rn-meter-unit">{{ m.unit }}</span></div>
            <div class="rn-meter-key">{{ m.key }}</div>
          </div>
        </div>
      </template>
    </template>

    <!-- ② virtualDaynamo baseInfo：虚拟电厂专用 -->
    <template v-else-if="nodeType === 'baseInfo' && parentType === 'virtualDaynamo' && vdData">

      <!-- 概览统计 -->
      <div class="dv-panel-section-title">概览统计</div>
      <div class="vd-total-gen-card">
        <div class="vd-total-gen-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/>
          </svg>
        </div>
        <div class="vd-total-gen-info">
          <div class="vd-total-gen-label">总发电量</div>
          <div class="vd-total-gen-val">{{ vdData.totalGenElec?.key?.toLocaleString() }}<span class="vd-total-gen-unit">{{ vdData.totalGenElec?.value }}</span></div>
        </div>
      </div>
      <div class="vd-overview-row">
        <div v-for="r in vdData.resource" :key="r.key" class="vd-stat-card vd-stat-purple">
          <div class="vd-stat-val">{{ r.value }}</div>
          <div class="vd-stat-label">{{ r.key }}</div>
        </div>
      </div>

      <!-- 历史参与统计 -->
      <div class="dv-panel-section-title">历史参与统计</div>
      <div class="vd-overview-row">
        <div v-for="h in vdData.historyGeneral" :key="h.key"
             class="vd-stat-card"
             :class="h.key === '完成率' ? 'vd-stat-green' : 'vd-stat-teal'">
          <div class="vd-stat-val">{{ h.key === '完成率' ? vdCompletionRate : h.value }}<span class="vd-stat-unit">{{ h.unit }}</span></div>
          <div class="vd-stat-label">{{ h.key }}</div>
        </div>
      </div>

      <!-- 策略列表 -->
      <template v-if="vdData.strategies?.length">
        <div class="dv-panel-section-title">策略列表（{{ vdData.strategies.length }}条）</div>
        <div class="rn-table">
          <div class="rn-table-head">
            <span style="flex:2">策略名称</span>
            <span style="flex:1;text-align:center">类型</span>
            <span style="flex:2;text-align:center">响应范围(kW)</span>
            <span style="flex:1;text-align:center">操作数</span>
          </div>
          <div v-for="s in vdData.strategies" :key="s.vdosId" class="rn-table-row vd-table-row">
            <span style="flex:2" class="vd-strategy-name">{{ s.vdosName }}</span>
            <span style="flex:1;text-align:center">
              <span class="vd-tag-dr">{{ s.operationMark }}</span>
            </span>
            <span style="flex:2;text-align:center" class="mono vd-range">{{ s.range1 }} ~ {{ s.range2 }}</span>
            <span style="flex:1;text-align:center" class="vd-op-count">{{ s.operationCount }}</span>
          </div>
        </div>
      </template>

      <!-- 设备（因子）列表 -->
      <template v-if="vdData.factors?.length">
        <div class="dv-panel-section-title">设备列表（{{ vdData.factors.length }}台）</div>
        <div class="vd-factor-list">
          <div v-for="f in vdData.factors" :key="f.vfId" class="vd-factor-row">
            <div class="vd-factor-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="1.5" stroke-width="1.5"/>
                <path d="M9 9h6v6H9z" stroke-width="1.5"/>
                <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="vd-factor-body">
              <div class="vd-factor-name">{{ f.vfName }}</div>
              <div class="vd-factor-desc">{{ f.description }}</div>
            </div>
            <div class="vd-factor-power">{{ f.maxLoad }}<span class="vd-factor-unit">kW</span></div>
          </div>
        </div>
      </template>

      <!-- 历史响应事件（最近5条） -->
      <template v-if="vdRecentEvents.length">
        <div class="dv-panel-section-title">近期响应事件</div>
        <div class="vd-event-list">
          <div v-for="e in vdRecentEvents" :key="e.planBaseId" class="vd-event-row">
            <div class="vd-event-left">
              <div class="vd-event-dot" :class="Number(e.actualQuan) > 0 ? 'done' : 'miss'"/>
              <div class="vd-event-body">
                <div class="vd-event-name">{{ e.planBaseName }}</div>
                <div class="vd-event-meta mono">{{ e.planDate }} &nbsp; {{ e.startTime }}–{{ e.endTime }}</div>
              </div>
            </div>
            <div class="vd-event-right">
              <div class="vd-event-actual" :class="Number(e.actualQuan) > 0 ? 'done' : 'miss'">{{ e.actualQuan }} kWh</div>
              <div class="vd-event-assign">/ {{ e.assignQuan }} kWh</div>
            </div>
          </div>
        </div>
      </template>

    </template>

    <!-- ③ baseInfo：扁平数组格式（其他二级节点）-->
    <template v-else-if="nodeType === 'baseInfo' && flatCards.length">
      <!-- 碳效码：特殊展示评分 -->
      <template v-if="parentType === 'carbonQR'">
        <div class="rn-cqr-header">
          <div class="rn-cqr-score-wrap">
            <div class="rn-cqr-score">{{ flatCards[0].carbonScore ?? '—' }}</div>
            <div class="rn-cqr-label">碳评分</div>
          </div>
          <div class="rn-cqr-badge" :class="'grade-' + (flatCards[0].evaluationCode || '').replace(/[^A-Za-z]/g,'').toLowerCase()">
            {{ flatCards[0].evaluationCode || '—' }}
          </div>
        </div>
        <div v-if="flatCards[0].tips" class="rn-tips">{{ flatCards[0].tips }}</div>
        <div class="dv-panel-section-title">详细信息</div>
      </template>

      <!-- 多条记录（如能效对标多年） -->
      <template v-if="flatCards.length > 1">
        <div v-for="(card, ci) in flatCards" :key="ci">
          <div class="dv-panel-section-title">记录 {{ ci + 1 }}</div>
          <div class="rn-kv-list">
            <div v-for="row in mappedRows(card)" :key="row.key" class="rn-kv-row">
              <span class="rn-kv-key">{{ row.label }}</span>
              <span class="rn-kv-val" :class="row.highlight ? 'rn-val-highlight' : ''">{{ row.val }}</span>
            </div>
          </div>
        </div>
      </template>
      <!-- 单条记录 -->
      <template v-else>
        <div class="rn-kv-list">
          <div v-for="row in mappedRows(flatCards[0])" :key="row.key" class="rn-kv-row">
            <span class="rn-kv-key">{{ row.label }}</span>
            <span class="rn-kv-val" :class="row.highlight ? 'rn-val-highlight' : ''">{{ row.val }}</span>
          </div>
        </div>
      </template>

      <!-- 碳效码：评分细项 -->
      <template v-if="parentType === 'carbonQR' && carbonItems.length">
        <div class="dv-panel-section-title">评分细项</div>
        <div class="rn-item-list">
          <div v-for="it in carbonItems" :key="it.id" class="rn-item-row">
            <span class="rn-item-name">{{ it.technology }}</span>
            <div class="rn-item-bar-wrap">
              <div class="rn-item-bar" :style="{ width: Math.min(it.percentage || 0, 100) + '%' }"/>
            </div>
            <span class="rn-item-score">{{ it.score }}</span>
          </div>
        </div>
      </template>
    </template>

    <!-- ③ modelConfig：模型配置列表 -->
    <template v-else-if="nodeType === 'modelConfig'">
      <div class="dv-panel-section-title">模型配置（{{ dataArr.length }}条）</div>
      <div class="rn-table">
        <div class="rn-table-head"><span>模型名称</span><span>状态</span></div>
        <div v-for="m in dataArr" :key="m.modelDefID" class="rn-table-row">
          <div class="rn-table-name">
            <span class="rn-model-id mono">{{ m.modelDefID }}</span>
            <span class="rn-model-name">{{ m.modelDefName }}</span>
          </div>
          <span class="rn-state-badge" :class="m.state === 1 ? 'active' : 'inactive'">
            {{ m.state === 1 ? '启用' : '停用' }}
          </span>
        </div>
      </div>
    </template>

    <!-- ④ data：时序统计 + 图表 -->
    <template v-else-if="nodeType === 'data'">
      <div class="dv-panel-section-title">数据统计</div>
      <div class="rn-stat-row">
        <div class="rn-stat-card">
          <div class="rn-stat-val">{{ dataArr.length }}</div>
          <div class="rn-stat-label">数据条数</div>
        </div>
        <div class="rn-stat-card">
          <div class="rn-stat-val">{{ dataMax }}</div>
          <div class="rn-stat-label">最大值 <span class="rn-unit">{{ dataUnit }}</span></div>
        </div>
        <div class="rn-stat-card">
          <div class="rn-stat-val">{{ dataMin }}</div>
          <div class="rn-stat-label">最小值 <span class="rn-unit">{{ dataUnit }}</span></div>
        </div>
        <div class="rn-stat-card">
          <div class="rn-stat-val">{{ dataAvg }}</div>
          <div class="rn-stat-label">均值 <span class="rn-unit">{{ dataUnit }}</span></div>
        </div>
      </div>
      <div class="rn-time-range">
        <AppIcon name="bell" :size="11" stroke="var(--text-3)"/>
        时间范围：{{ timeStart }} ~ {{ timeEnd }}
      </div>
      <template v-if="chartData.length">
        <div class="dv-panel-section-title">能耗曲线</div>
        <EnergyChart :data="chartData" :unit="dataUnit" color="#4dc9ff"/>
      </template>
    </template>

    <!-- ⑤ dataQuantity：数据质量 -->
    <template v-else-if="nodeType === 'dataQuantity'">
      <div class="dv-panel-section-title">数据质量（{{ dataArr.length }}条）</div>
      <div class="rn-dq-list">
        <div v-for="(d, i) in dataArr" :key="i" class="rn-dq-row">
          <div class="rn-dq-left">
            <span class="rn-dq-dot" :class="d.sign === 1 ? 'ok' : 'warn'"/>
            <span class="rn-dq-name">{{ d.statusName }}</span>
            <span class="rn-dq-sub">{{ d.subName }}</span>
          </div>
          <div class="rn-dq-right">
            <span class="rn-dq-remark">{{ d.remark }}</span>
            <span class="rn-dq-time mono">{{ d.checkTime?.slice(0,16) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ⑥ 通用兜底 -->
    <template v-else>
      <template v-if="Array.isArray(rawData) && rawData.length">
        <div class="dv-panel-section-title">数据列表（{{ rawData.length }}条）</div>
        <div class="rn-kv-list">
          <div v-for="(item, i) in rawData.slice(0, 20)" :key="i" class="rn-kv-row">
            <span class="rn-kv-key">{{ item.key || item.name || String(i+1) }}</span>
            <span class="rn-kv-val">{{ item.value ?? item.name ?? JSON.stringify(item).slice(0,60) }}</span>
          </div>
        </div>
        <div v-if="rawData.length > 20" class="rn-more">仅展示前 20 条，共 {{ rawData.length }} 条</div>
      </template>
      <div v-else class="rn-empty">暂无数据</div>
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon      from '../../shared/AppIcon.vue'
import PanelHeader  from '../shared/PanelHeader.vue'
import EnergyChart  from '../shared/EnergyChart.vue'
import { DV_COLORS } from '../../../data/constants.js'

const MODULE_META = {
  subEnergy:              { color: '#4dc9ff', icon: 'panel' },
  greenBuild:             { color: '#2bd9a8', icon: 'leaf'  },
  virtualDaynamo:         { color: '#7a5cff', icon: 'bolt'  },
  savingRenovation:       { color: '#2bd9a8', icon: 'leaf'  },
  energyAudit:            { color: '#4dc9ff', icon: 'scan'  },
  benchmark:              { color: '#a799ff', icon: 'graph' },
  effictImprove:          { color: '#ff8a47', icon: 'zap'   },
  charge:                 { color: '#ffb547', icon: 'plug'  },
  carbonQR:               { color: '#2bd9a8', icon: 'sparkles' },
  certificateGlectricity: { color: '#2bd9a8', icon: 'leaf'  },
}

const TYPE_LABEL = {
  baseInfo:     '基础信息',
  modelConfig:  '模型配置',
  data:         '数据',
  dataQuantity: '数据质量',
}

// 各模块字段中文映射（跳过无需展示的内部字段）
const SKIP_FIELDS = new Set(['table','tagID','projectID','buildID','buildId','gisId',
  'longitude','latitude','mark','picture','certification','tag','state',
  'description','files','items','objectName','bucketName','hashValue',
  'versionID','fileID','uploader','contentType','streetCode','ownerID'])

const FIELD_LABELS = {
  // 通用
  projectName:'项目名称', nickName:'简称', address:'地址', street:'街道',
  year:'年份', buildFunc:'建筑功能',
  // 绿色建筑
  greenID:'绿建ID', greenType:'认证类型', greenLevel:'认证等级', greenYear:'认证年份',
  // 能效对标
  totalCoal:'综合能耗(kgce)', unitCoal:'单位面积能耗(kgce/m²)',
  commonValue:'基准值', advancedValue:'先进值',
  resultLevel:'对标等级', resultDesc:'对标结果',
  // 能效提升
  order:'序号', group:'所属批次',
  equParam1:'节能量(tce)', equParam2:'减碳量(t)', equParam3:'节约费用(万元)',
  // 充电桩
  stationCaseId:'案例ID', stationId:'场站ID', stationName:'场站名称',
  stationType:'场站类型', stationStatus:'运营状态',
  directNum:'直流桩数', swapNum:'换电桩数', time:'接入时间',
  // 绿电绿证
  transactionNumber:'交易编号', buildName:'建筑名称',
  greenCertificateNum:'绿证数量(张)', gsProjectCode:'溯源码',
  gsProjectType:'电源类型', gsProjectAddress:'电源地址',
  productionDate:'生产日期', transactionCity:'交易平台',
  rate:'价格(元/度)', subsidyPow:'电量(万kWh)',
  enterpriseTitle:'购买单位', gsProjectName:'绿电项目',
  declarationDate:'申报日期', transactionDate:'交易日期',
  averagePrice:'均价(元)', totalPrice:'总价(元)',
  saleUnit:'出售单位', reduceCO2:'减少CO₂(t)',
  // 碳效码
  evaluation:'评分等级(数值)', evaluationCode:'评级',
  buildName_cqr:'建筑名称', area:'建筑面积(m²)',
  evaDate:'评价年份', carbonIntensity:'碳强度',
  carbonScore:'碳评分', unitCarbonScore:'单位碳评分',
  paramScore:'参数评分', tips:'备注', showType:'展示类型',
  // 节能改造
  savRenCaseID:'案例ID', savRenCaseName:'项目名称',
  unitName:'单位名称', unitCode:'统一社会信用代码',
  renClass:'改造类别', renTech:'改造技术', renDetails:'改造内容',
  buildArea:'建筑面积(m²)', renovationArea:'改造面积(m²)',
  investmentAmount:'投资金额', renovationEnergy:'节能量',
  subsidyAmount:'补贴金额', selfAmount:'自筹金额',
  standardEnergy:'标准能耗(吨标煤)', savingRate:'节能率',
}

const HIGHLIGHT_FIELDS = new Set(['resultDesc','greenLevel','evaluationCode','stationStatus'])

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
})

const rawNode   = computed(() => props.node.ref || props.node)
const nodeType  = computed(() => rawNode.value?.type || '')
const rawData   = computed(() => rawNode.value?.data ?? null)

// 找父级一级节点类型
const parentType = computed(() => {
  const rootNode = props.detail?._rootNode
  if (!rootNode) return ''
  for (const lv1 of (rootNode.children || [])) {
    for (const lv2 of (lv1.children || [])) {
      if (lv2.id === rawNode.value?.id) return lv1.type
    }
  }
  return ''
})

const panelColor = computed(() => MODULE_META[parentType.value]?.color || DV_COLORS.group)
const panelIcon  = computed(() => MODULE_META[parentType.value]?.icon  || 'panel')
const panelType  = computed(() => TYPE_LABEL[nodeType.value] || '节点')

// ── baseInfo：分项计量 generalInfo 格式 ───────────────────────
const generalInfo = computed(() =>
  Array.isArray(rawData.value?.generalInfo) ? rawData.value.generalInfo : []
)
const subMeter = computed(() =>
  Array.isArray(rawData.value?.subMeter) ? rawData.value.subMeter : []
)

// ── baseInfo：扁平数组格式 ────────────────────────────────────
const flatCards = computed(() => {
  if (!Array.isArray(rawData.value)) return []
  if (generalInfo.value.length) return []  // 已由上面处理
  return rawData.value
})

function mappedRows(card) {
  if (!card) return []
  return Object.entries(card)
    .filter(([k, v]) => !SKIP_FIELDS.has(k) && v != null && v !== '' && !Array.isArray(v) && typeof v !== 'object')
    .map(([k, v]) => ({
      key: k,
      label: FIELD_LABELS[k] || k,
      val: formatVal(k, v),
      highlight: HIGHLIGHT_FIELDS.has(k),
    }))
}

function formatVal(key, val) {
  if (key === 'stationType') return val === 1 ? '公共' : val === 2 ? '专用' : String(val)
  if (key === 'stationStatus') return val === 50 ? '运营中' : val === 0 ? '停用' : String(val)
  if (key === 'resultLevel') return val === 1 ? '先进' : val === 2 ? '未对标' : val === 3 ? '落后' : String(val)
  return String(val)
}

// 碳效码评分细项
const carbonItems = computed(() => {
  if (parentType.value !== 'carbonQR') return []
  return flatCards.value[0]?.items || []
})

// ── virtualDaynamo baseInfo ───────────────────────────────────
const vdData = computed(() => {
  if (nodeType.value !== 'baseInfo' || parentType.value !== 'virtualDaynamo') return null
  const d = rawData.value
  if (!d || Array.isArray(d) || typeof d !== 'object') return null
  return d
})

const vdCompletionRate = computed(() => {
  const participated = vdData.value?.historyGeneral?.find(h => h.key === '参与次数')?.value || 0
  const completed    = vdData.value?.historyGeneral?.find(h => h.key === '完成次数')?.value || 0
  if (!participated) return 0
  return Math.round(completed / participated * 100)
})

const vdRecentEvents = computed(() => {
  const events = vdData.value?.historyEvents || []
  return [...events]
    .sort((a, b) => (b.planDate || '').localeCompare(a.planDate || ''))
    .slice(0, 5)
})

// ── 通用数组 ───────────────────────────────────────────────────
const dataArr = computed(() =>
  Array.isArray(rawData.value) ? rawData.value : []
)

// ── data 时序统计 ─────────────────────────────────────────────
const values    = computed(() => dataArr.value.map(d => d.value).filter(v => v != null))
const dataMax   = computed(() => values.value.length ? Math.max(...values.value) : '—')
const dataMin   = computed(() => values.value.length ? Math.min(...values.value) : '—')
const dataAvg   = computed(() => values.value.length
  ? (values.value.reduce((a, b) => a + b, 0) / values.value.length).toFixed(1) : '—')
const dataUnit  = computed(() => dataArr.value[0]?.unit || '')
const times     = computed(() => dataArr.value.map(d => d.time).filter(Boolean).sort())
const timeStart = computed(() => times.value[0]?.slice(0,16) || '—')
const timeEnd   = computed(() => times.value[times.value.length - 1]?.slice(0,16) || '—')
const chartData = computed(() =>
  [...dataArr.value]
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    .filter(d => d.time && d.value != null)
)
</script>

<style scoped>
.mono { font-family: "JetBrains Mono", monospace; }

/* key-value 列表 */
.rn-kv-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 4px; }
.rn-kv-row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 6px 10px; border-radius: 6px;
  font-size: 12.5px;
  background: rgba(255,255,255,0.5);
  border: 1px solid var(--line);
}
.rn-kv-key { color: var(--text-2); flex-shrink: 0; margin-right: 12px; }
.rn-kv-val { color: var(--text-0); font-weight: 500; text-align: right; }
.rn-val-highlight { color: #4dc9ff; font-weight: 700; }

/* 计量回路 grid */
.rn-meter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 4px; }
.rn-meter-card {
  padding: 10px 8px; border-radius: 8px; text-align: center;
  background: rgba(77,201,255,0.06); border: 1px solid rgba(77,201,255,0.18);
}
.rn-meter-val { font-size: 22px; font-weight: 700; color: #4dc9ff; line-height: 1.2; }
.rn-meter-unit { font-size: 11px; font-weight: 400; color: var(--text-2); margin-left: 2px; }
.rn-meter-key { font-size: 11px; color: var(--text-2); margin-top: 4px; }

/* 模型配置 */
.rn-table { display: flex; flex-direction: column; gap: 2px; }
.rn-table-head { display: flex; justify-content: space-between; padding: 4px 10px; font-size: 11px; color: var(--text-3); font-weight: 600; }
.rn-table-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 10px; border-radius: 6px;
  background: rgba(255,255,255,0.5); border: 1px solid var(--line); font-size: 12px;
}
.rn-table-name { display: flex; flex-direction: column; gap: 2px; }
.rn-model-id { font-size: 10px; color: var(--text-3); font-family: "JetBrains Mono", monospace; }
.rn-model-name { color: var(--text-0); font-weight: 500; }
.rn-state-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
.rn-state-badge.active   { background: rgba(24,165,114,0.12); color: #18a572; }
.rn-state-badge.inactive { background: rgba(150,160,180,0.12); color: var(--text-3); }

/* 数据统计 */
.rn-stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; }
.rn-stat-card { padding: 10px 12px; border-radius: 8px; text-align: center; background: rgba(77,201,255,0.06); border: 1px solid rgba(77,201,255,0.18); }
.rn-stat-val  { font-size: 20px; font-weight: 700; color: #4dc9ff; }
.rn-stat-label{ font-size: 11px; color: var(--text-2); margin-top: 3px; }
.rn-unit      { font-size: 10px; color: var(--text-3); }
.rn-time-range{ font-size: 11px; color: var(--text-3); margin-bottom: 8px; display: flex; align-items: center; gap: 5px; font-family: "JetBrains Mono", monospace; }

/* 数据质量 */
.rn-dq-list { display: flex; flex-direction: column; gap: 6px; }
.rn-dq-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 10px; border-radius: 6px; background: rgba(255,255,255,0.5); border: 1px solid var(--line); font-size: 12px; gap: 8px; }
.rn-dq-left  { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.rn-dq-dot   { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.rn-dq-dot.ok   { background: #18a572; box-shadow: 0 0 5px #18a572; }
.rn-dq-dot.warn { background: #d97706; box-shadow: 0 0 5px #d97706; }
.rn-dq-name  { color: var(--text-0); font-weight: 500; }
.rn-dq-sub   { color: #18a572; font-size: 11px; }
.rn-dq-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.rn-dq-remark{ font-size: 11px; color: var(--text-2); text-align: right; }
.rn-dq-time  { font-size: 10px; color: var(--text-3); }

/* 碳效码 */
.rn-cqr-header { display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 8px; border-radius: 10px; background: rgba(43,217,168,0.06); border: 1px solid rgba(43,217,168,0.2); }
.rn-cqr-score-wrap { text-align: center; }
.rn-cqr-score { font-size: 36px; font-weight: 800; color: #2bd9a8; line-height: 1; }
.rn-cqr-label { font-size: 11px; color: var(--text-2); margin-top: 4px; }
.rn-cqr-badge { font-size: 28px; font-weight: 800; padding: 8px 18px; border-radius: 10px; background: rgba(43,217,168,0.12); color: #2bd9a8; }
.rn-tips { font-size: 11px; color: var(--text-3); margin-bottom: 8px; padding: 6px 10px; border-radius: 6px; background: rgba(255,181,71,0.08); border: 1px solid rgba(255,181,71,0.2); }

/* 评分细项 */
.rn-item-list { display: flex; flex-direction: column; gap: 6px; }
.rn-item-row  { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.rn-item-name { width: 130px; flex-shrink: 0; color: var(--text-1); font-size: 11px; }
.rn-item-bar-wrap { flex: 1; height: 5px; border-radius: 3px; background: rgba(77,201,255,0.15); overflow: hidden; }
.rn-item-bar  { height: 100%; border-radius: 3px; background: #2bd9a8; transition: width 0.4s; }
.rn-item-score{ width: 28px; text-align: right; color: #2bd9a8; font-weight: 600; font-size: 12px; }

.rn-more  { font-size: 11px; color: var(--text-3); text-align: center; padding: 6px 0; }
.rn-empty { font-size: 13px; color: var(--text-3); text-align: center; padding: 32px 0; }

/* ── 虚拟电厂 ──────────────────────────────────────────────── */
.vd-total-gen-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; margin-bottom: 8px; border-radius: 10px;
  background: linear-gradient(135deg, rgba(77,201,255,0.14), rgba(64,150,255,0.10));
  border: 1px solid rgba(77,201,255,0.22);
}
.vd-total-gen-icon {
  flex-shrink: 0; width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4dc9ff, #3a8bff);
  color: #fff;
}
.vd-total-gen-info { flex: 1; min-width: 0; }
.vd-total-gen-label { font-size: 11px; color: var(--text-2); margin-bottom: 2px; }
.vd-total-gen-val {
  font-size: 22px; font-weight: 700; line-height: 1.2;
  background: linear-gradient(135deg, #4dc9ff, #3a8bff);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.vd-total-gen-unit { font-size: 11px; font-weight: 400; color: var(--text-2); margin-left: 3px; -webkit-text-fill-color: var(--text-2); }

.vd-overview-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 4px;
}
.vd-stat-card {
  padding: 10px 10px 8px; border-radius: 8px; text-align: center;
  border: 1px solid transparent;
}
.vd-stat-purple { background: rgba(167,153,255,0.08); border-color: rgba(167,153,255,0.2); }
.vd-stat-blue   { background: rgba(77,201,255,0.08);  border-color: rgba(77,201,255,0.2);  }
.vd-stat-teal   { background: rgba(43,217,168,0.07);  border-color: rgba(43,217,168,0.18); }
.vd-stat-green  { background: rgba(24,165,114,0.08);  border-color: rgba(24,165,114,0.2);  }
.vd-stat-val {
  font-size: 22px; font-weight: 700; line-height: 1.2;
  color: #4dc9ff;
}
.vd-stat-purple .vd-stat-val { color: #a799ff; }
.vd-stat-teal   .vd-stat-val { color: #2bd9a8; }
.vd-stat-green  .vd-stat-val { color: #18a572; }
.vd-stat-unit { font-size: 11px; font-weight: 400; color: var(--text-2); margin-left: 2px; }
.vd-stat-label { font-size: 11px; color: var(--text-2); margin-top: 3px; }

/* 策略表格 */
.vd-table-row { display: flex; gap: 0; }
.vd-strategy-name { color: var(--text-0); font-weight: 500; font-size: 12px; }
.vd-tag-dr {
  display: inline-block; padding: 1px 6px; border-radius: 4px;
  background: rgba(77,201,255,0.1); color: #4dc9ff;
  font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
}
.vd-range { color: var(--text-1); font-size: 11px; }
.vd-op-count { color: #a799ff; font-weight: 600; font-size: 12px; }

/* 设备列表 */
.vd-factor-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
.vd-factor-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 7px;
  background: rgba(255,255,255,0.5); border: 1px solid var(--line);
}
.vd-factor-icon {
  width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(167,153,255,0.1); color: #a799ff;
}
.vd-factor-body { flex: 1; min-width: 0; }
.vd-factor-name { font-size: 12px; font-weight: 500; color: var(--text-0); }
.vd-factor-desc { font-size: 10px; color: var(--text-3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vd-factor-power { font-size: 14px; font-weight: 700; color: #4dc9ff; flex-shrink: 0; text-align: right; }
.vd-factor-unit { font-size: 10px; font-weight: 400; color: var(--text-3); }

/* 历史响应事件 */
.vd-event-list { display: flex; flex-direction: column; gap: 6px; }
.vd-event-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; border-radius: 7px;
  background: rgba(255,255,255,0.5); border: 1px solid var(--line); gap: 8px;
}
.vd-event-left  { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.vd-event-dot   { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.vd-event-dot.done { background: #18a572; box-shadow: 0 0 5px #18a572; }
.vd-event-dot.miss { background: rgba(150,160,180,0.5); }
.vd-event-body  { min-width: 0; }
.vd-event-name  { font-size: 11.5px; font-weight: 500; color: var(--text-0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vd-event-meta  { font-size: 10px; color: var(--text-3); margin-top: 1px; font-family: "JetBrains Mono", monospace; }
.vd-event-right { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.vd-event-actual{ font-size: 12px; font-weight: 600; }
.vd-event-actual.done { color: #18a572; }
.vd-event-actual.miss { color: var(--text-3); }
.vd-event-assign{ font-size: 10px; color: var(--text-3); }
</style>
