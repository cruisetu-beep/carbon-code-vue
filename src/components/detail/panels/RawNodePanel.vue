<template>
  <div class="dv-panel">
    <PanelHeader :icon="panelIcon" :color="panelColor" :type="panelType" :name="node.name"/>

    <!-- ① baseInfo：信息清单 + 计量回路 -->
    <template v-if="nodeType === 'baseInfo'">
      <template v-if="generalInfo.length">
        <div class="dv-panel-section-title">基础信息</div>
        <div class="rn-kv-list">
          <div v-for="item in generalInfo.filter(i => i.value)" :key="item.key" class="rn-kv-row">
            <span class="rn-kv-key">{{ item.key }}</span>
            <span class="rn-kv-val">{{ item.value }}</span>
          </div>
        </div>
      </template>
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

    <!-- ② modelConfig：模型配置列表 -->
    <template v-else-if="nodeType === 'modelConfig'">
      <div class="dv-panel-section-title">模型配置（{{ dataArr.length }}条）</div>
      <div class="rn-table">
        <div class="rn-table-head">
          <span>模型名称</span>
          <span>状态</span>
        </div>
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

    <!-- ③ data：时序能耗数据统计 -->
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

    <!-- ④ dataQuantity：数据质量状态 -->
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

    <!-- ⑤ 各子系统 baseInfo：扁平数组转信息卡片 -->
    <template v-else-if="nodeType === 'baseInfo' && flatRecords.length">
      <div v-for="(record, ri) in flatRecords" :key="ri">
        <div v-if="flatRecords.length > 1" class="dv-panel-section-title">记录 {{ ri + 1 }}</div>
        <div class="rn-kv-list">
          <div v-for="row in record" :key="row.key" class="rn-kv-row">
            <span class="rn-kv-key">{{ row.label }}</span>
            <span class="rn-kv-val" :class="row.highlight ? 'rn-val-highlight' : ''">{{ row.val }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ⑥ 通用兜底 -->
    <template v-else>
      <div v-if="!rawData" class="rn-empty">暂无数据</div>
      <template v-else-if="Array.isArray(rawData) && rawData.length">
        <div class="dv-panel-section-title">数据列表（{{ rawData.length }}条）</div>
        <div class="rn-kv-list">
          <div v-for="(item, i) in rawData.slice(0, 20)" :key="i" class="rn-kv-row">
            <span class="rn-kv-key">{{ item.key || item.name || String(i+1) }}</span>
            <span class="rn-kv-val">{{ item.value ?? item.name ?? JSON.stringify(item).slice(0,60) }}</span>
          </div>
        </div>
        <div v-if="rawData.length > 20" class="rn-more">仅展示前 20 条，共 {{ rawData.length }} 条</div>
      </template>
      <template v-else-if="rawData && typeof rawData === 'object'">
        <div class="dv-panel-section-title">节点信息</div>
        <div class="rn-kv-list">
          <div v-for="(val, key) in flatObj" :key="key" class="rn-kv-row">
            <span class="rn-kv-key">{{ key }}</span>
            <span class="rn-kv-val">{{ val }}</span>
          </div>
        </div>
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
  subEnergy:    { color: '#4dc9ff', icon: 'panel' },
  greenBuild:   { color: '#2bd9a8', icon: 'leaf'  },
  virtualDaynamo:{ color: '#7a5cff', icon: 'bolt' },
  savingRenovation:{ color: '#2bd9a8', icon: 'leaf'},
  energyAudit:  { color: '#4dc9ff', icon: 'scan'  },
  benchmark:    { color: '#a799ff', icon: 'graph' },
  effictImprove:{ color: '#ff8a47', icon: 'zap'   },
  charge:       { color: '#ffb547', icon: 'plug'  },
  carbonQR:     { color: '#2bd9a8', icon: 'sparkles'},
  certificateGlectricity:{ color: '#2bd9a8', icon:'leaf'},
}

const TYPE_LABEL = {
  baseInfo:     '基础信息',
  modelConfig:  '模型配置',
  data:         '数据',
  dataQuantity: '数据质量',
}

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
})

// 原始 API 节点（ref 可能是 lv2 原始节点）
const rawNode = computed(() => props.node.ref || props.node)
const nodeType = computed(() => rawNode.value?.type || '')
const rawData  = computed(() => rawNode.value?.data ?? null)

// 找父级一级节点类型，用于颜色
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

// ── baseInfo ───────────────────────────────────────────────────
const generalInfo = computed(() =>
  Array.isArray(rawData.value?.generalInfo) ? rawData.value.generalInfo : []
)
const subMeter = computed(() =>
  Array.isArray(rawData.value?.subMeter) ? rawData.value.subMeter : []
)

// ── 通用数组 ───────────────────────────────────────────────────
const dataArr = computed(() =>
  Array.isArray(rawData.value) ? rawData.value : []
)

// ── data：时序统计 ─────────────────────────────────────────────
const values   = computed(() => dataArr.value.map(d => d.value).filter(v => v != null))
const dataMax  = computed(() => values.value.length ? Math.max(...values.value) : '—')
const dataMin  = computed(() => values.value.length ? Math.min(...values.value) : '—')
const dataAvg  = computed(() => values.value.length
  ? (values.value.reduce((a, b) => a + b, 0) / values.value.length).toFixed(1) : '—')
const dataUnit = computed(() => dataArr.value[0]?.unit || '')
const times    = computed(() => dataArr.value.map(d => d.time).filter(Boolean).sort())
const timeStart = computed(() => times.value[0]?.slice(0, 16) || '—')
const timeEnd   = computed(() => times.value[times.value.length - 1]?.slice(0, 16) || '—')
const chartData = computed(() =>
  [...dataArr.value]
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    .filter(d => d.time && d.value != null)
)

// ── 各子系统 baseInfo 字段中文映射 ────────────────────────────
const SKIP_FIELDS = new Set(['table','tagID','tag','state','gisId','mark','picture','certification',
  'hashValue','versionID','description','bucketName','objectName','showType',
  'order','ownerID','streetCode','buildId','buildID','projectID','stationCaseId','stationId'])

const FIELD_LABELS = {
  // 通用
  projectName:'项目名称', nickName:'简称', address:'地址', street:'所属街道',
  longitude:'经度', latitude:'纬度', year:'年份', buildFunc:'建筑功能',
  area:'建筑面积', buildName:'建筑名称', files:'相关文档',
  // 绿色建筑
  greenID:'绿建编号', greenType:'认证类型', greenLevel:'认证等级', greenYear:'认证年份',
  // 能效对标
  totalCoal:'总标煤量(kgce)', unitCoal:'单位面积煤耗(kgce/m²)',
  commonValue:'基准值', advancedValue:'先进值',
  resultLevel:'对标等级', resultDesc:'对标结果',
  // 能效提升
  group:'所属批次', equParam1:'设备参数1', equParam2:'设备参数2', equParam3:'设备参数3',
  // 充电桩
  stationName:'充电站名称', stationType:'站点类型', stationStatus:'运营状态',
  directNum:'直流桩数', swapNum:'交流桩数', time:'建站时间',
  // 绿电绿证
  transactionNumber:'交易编号', greenCertificateNum:'绿证数量(张)',
  gsProjectCode:'项目代码', gsProjectType:'项目类型', gsProjectAddress:'项目所在地',
  productionDate:'生产年月', transactionCity:'交易平台', rate:'价格(元/张)',
  subsidyPow:'交易电量(万kWh)', enterpriseTitle:'购买企业',
  gsProjectName:'绿证项目名称', declarationDate:'申报日期',
  transactionDate:'交易日期', averagePrice:'均价', totalPrice:'总价',
  saleUnit:'销售单位', reduceCO2:'减排量(吨CO₂)',
  // 碳效码
  evaluation:'碳效评价(分)', evaluationCode:'碳效码等级',
  evaDate:'评价年份', carbonIntensity:'碳排放强度',
  carbonScore:'碳排放评分', unitCarbonScore:'单位碳排评分',
  paramScore:'参数评分', tips:'备注',
}

const HIGHLIGHT_FIELDS = new Set([
  'greenLevel','greenType','resultDesc','resultLevel','evaluationCode',
  'stationStatus','stationType',
])

const STATION_TYPE  = { 1:'公共充电站', 2:'自用充电站', 3:'专用充电站' }
const STATION_STATUS = { 10:'建设中', 20:'待运营', 30:'运营中', 40:'暂停营业', 50:'正常运营' }
const RESULT_LEVEL   = { 1:'对标先进', 2:'未对标', 3:'对标基准' }

function formatVal(key, val) {
  if (val === null || val === undefined || val === '') return null
  if (key === 'stationType')   return STATION_TYPE[val]   || String(val)
  if (key === 'stationStatus') return STATION_STATUS[val] || String(val)
  if (key === 'resultLevel')   return RESULT_LEVEL[val]   || String(val)
  if (key === 'files' || Array.isArray(val)) return null   // 文件/数组跳过
  if (typeof val === 'object') return null
  return String(val)
}

// 把每条原始记录转成 [{key, label, val, highlight}] 数组
const flatRecords = computed(() => {
  if (nodeType.value !== 'baseInfo') return []
  const arr = Array.isArray(rawData.value) ? rawData.value : []
  return arr.map(item => {
    const rows = []
    Object.entries(item).forEach(([k, v]) => {
      if (SKIP_FIELDS.has(k)) return
      const formatted = formatVal(k, v)
      if (formatted === null) return
      rows.push({
        key: k,
        label: FIELD_LABELS[k] || k,
        val: formatted,
        highlight: HIGHLIGHT_FIELDS.has(k),
      })
    })
    return rows
  }).filter(r => r.length > 0)
})


const flatObj = computed(() => {
  const d = rawData.value
  if (!d || typeof d !== 'object' || Array.isArray(d)) return {}
  const skip = ['table', 'tagID']
  return Object.fromEntries(
    Object.entries(d)
      .filter(([k, v]) => !skip.includes(k) && v != null && v !== '' && !Array.isArray(v) && typeof v !== 'object')
  )
})
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

/* 计量回路 grid */
.rn-meter-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 4px;
}
.rn-meter-card {
  padding: 10px 8px; border-radius: 8px; text-align: center;
  background: rgba(77,201,255,0.06); border: 1px solid rgba(77,201,255,0.18);
}
.rn-meter-val { font-size: 22px; font-weight: 700; color: #4dc9ff; line-height: 1.2; }
.rn-meter-unit { font-size: 11px; font-weight: 400; color: var(--text-2); margin-left: 2px; }
.rn-meter-key { font-size: 11px; color: var(--text-2); margin-top: 4px; }

/* 模型配置表格 */
.rn-table { display: flex; flex-direction: column; gap: 2px; }
.rn-table-head {
  display: flex; justify-content: space-between;
  padding: 4px 10px; font-size: 11px; color: var(--text-3); font-weight: 600;
}
.rn-table-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 10px; border-radius: 6px;
  background: rgba(255,255,255,0.5); border: 1px solid var(--line);
  font-size: 12px;
}
.rn-table-name { display: flex; flex-direction: column; gap: 2px; }
.rn-model-id { font-size: 10px; color: var(--text-3); font-family: "JetBrains Mono", monospace; }
.rn-model-name { color: var(--text-0); font-weight: 500; }
.rn-state-badge {
  font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
}
.rn-state-badge.active   { background: rgba(24,165,114,0.12); color: #18a572; }
.rn-state-badge.inactive { background: rgba(150,160,180,0.12); color: var(--text-3); }

/* 数据统计 */
.rn-stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; }
.rn-stat-card {
  padding: 10px 12px; border-radius: 8px; text-align: center;
  background: rgba(77,201,255,0.06); border: 1px solid rgba(77,201,255,0.18);
}
.rn-stat-val  { font-size: 20px; font-weight: 700; color: #4dc9ff; }
.rn-stat-label{ font-size: 11px; color: var(--text-2); margin-top: 3px; }
.rn-unit      { font-size: 10px; color: var(--text-3); }
.rn-time-range{
  font-size: 11px; color: var(--text-3); margin-bottom: 8px;
  display: flex; align-items: center; gap: 5px;
  font-family: "JetBrains Mono", monospace;
}

/* 数据质量 */
.rn-dq-list { display: flex; flex-direction: column; gap: 6px; }
.rn-dq-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 8px 10px; border-radius: 6px;
  background: rgba(255,255,255,0.5); border: 1px solid var(--line);
  font-size: 12px; gap: 8px;
}
.rn-dq-left  { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.rn-dq-dot   { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.rn-dq-dot.ok   { background: #18a572; box-shadow: 0 0 5px #18a572; }
.rn-dq-dot.warn { background: #d97706; box-shadow: 0 0 5px #d97706; }
.rn-dq-name  { color: var(--text-0); font-weight: 500; }
.rn-dq-sub   { color: #18a572; font-size: 11px; }
.rn-dq-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.rn-dq-remark{ font-size: 11px; color: var(--text-2); text-align: right; }
.rn-dq-time  { font-size: 10px; color: var(--text-3); }

.rn-val-highlight { color: #4dc9ff; font-weight: 600; }

.rn-more  { font-size: 11px; color: var(--text-3); text-align: center; padding: 6px 0; }
.rn-empty { font-size: 13px; color: var(--text-3); text-align: center; padding: 32px 0; }
</style>
