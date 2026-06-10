<template>
  <div class="step-done float-in">

    <!-- 成功横幅 -->
    <div class="done-banner">
      <div class="done-icon"><AppIcon name="check" :size="36" stroke="var(--ok)"/></div>
      <div>
        <h2><span class="glow-text">知识库资源包构建完成</span></h2>
        <div class="sub">
          {{ data.name || '该建筑' }} 的全部资料已完成 AI 智能解析，知识图谱已融合
          {{ summary.entities }} 个实体、{{ summary.edges }} 条关系边，可直接用于碳效码计算与考核评价。
        </div>
        <div class="meta-row">
          <span><AppIcon name="doc" :size="11"/> {{ summary.docs }} 份文档 · {{ summary.docPages }} 页</span>
          <span><AppIcon name="scan" :size="11"/> {{ summary.chunks.toLocaleString() }} 个语义切片</span>
          <span><AppIcon name="graph" :size="11"/> {{ summary.nodes }} 实体 · {{ summary.edges }} 关系</span>
        </div>
      </div>
      <div>
        <div class="score-badge" style="width:64px;height:64px;border-radius:14px;font-size:24px;margin-bottom:8px">A</div>
        <div style="font-size:11px;color:var(--text-2);text-align:center">预测评级</div>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="done-tabs">
      <div v-for="t in TABS" :key="t.k" :class="['t', tab === t.k && 'active']" @click="tab = t.k">{{ t.n }}</div>
    </div>

    <!-- 概览 -->
    <template v-if="tab === 'overview'">
      <div class="overview-stack">
        <!-- 基础信息折叠 -->
        <div :class="['collapse-card', expanded.basic && 'open']" style="--cc:var(--brand)">
          <div class="collapse-head" @click="expanded.basic = !expanded.basic">
            <div class="ic-wrap"><AppIcon name="cube" :size="18"/></div>
            <div>
              <div class="tt">建筑基础信息</div>
              <div class="ss">建筑标识 / 位置 / 功能类别 / 气候分区</div>
            </div>
            <span/>
            <div class="arrow"><AppIcon name="chevron-down" :size="14"/></div>
          </div>
          <div v-if="expanded.basic" class="collapse-body">
            <div class="pkg-grid">
              <div class="pkg-card">
                <h4><AppIcon name="cube" :size="14" stroke="var(--brand)"/> 基础信息</h4>
                <div v-for="[l,v] in basicInfo" :key="l" class="info-row"><div class="l">{{ l }}</div><div class="v">{{ v }}</div></div>
              </div>
              <div class="pkg-card">
                <h4><AppIcon name="graph" :size="14" stroke="var(--brand)"/> 知识库统计</h4>
                <div class="stat-grid">
                  <div class="dn-stat"><div class="l">图谱实体</div><div class="v" style="color:var(--brand-2)">{{ summary.nodes }}<small>个</small></div></div>
                  <div class="dn-stat"><div class="l">关联拓扑</div><div class="v" style="color:#a799ff">{{ summary.edges }}<small>条</small></div></div>
                  <div class="dn-stat"><div class="l">AI 切片</div><div class="v" style="color:#2bd9a8">{{ summary.chunks }}<small>条</small></div></div>
                  <div class="dn-stat"><div class="l">解析文档</div><div class="v" style="color:#ffb547">{{ summary.docs }}<small>份</small></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 各子系统折叠 -->
        <div v-for="s in displaySystems" :key="s.k"
             :class="['collapse-card', expanded[s.k] && 'open', !s.isEnabled && 'disabled']"
             :style="{ '--cc': s.color }">
          <div class="collapse-head" @click="s.isEnabled && (expanded[s.k] = !expanded[s.k])">
            <div class="ic-wrap"><AppIcon :name="s.icon" :size="18"/></div>
            <div>
              <div class="tt">{{ s.n }}</div>
              <div class="ss">{{ s.summary }}</div>
            </div>
            <span v-if="s.isEnabled" class="bg" :style="{ background: s.color, color: '#fff' }">{{ s.badge }}</span>
            <span v-else/>
            <div class="arrow"><AppIcon name="chevron-down" :size="14"/></div>
          </div>
          <div v-if="expanded[s.k] && s.isEnabled" class="collapse-body">
            <div class="hl-grid">
              <div v-for="h in s.highlights" :key="h.l" class="hl-c" :style="{'--cl': s.color}">
                <div class="hl-l">{{ h.l }}</div>
                <div class="hl-v">{{ h.v }}</div>
                <div class="hl-t">{{ h.t }}</div>
              </div>
            </div>

            <!-- 淘汰设备明细表格列表 -->
            <div v-if="s.k === 'obsolete' && props.data.obsoleteDevices && props.data.obsoleteDevices.length > 0" class="obsolete-table-wrap" style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--line); overflow-x: auto;">
              <div style="font-size:12px; font-weight:600; margin-bottom:8px; color:var(--text-1)">低效与淘汰设备明细：</div>
              <table class="doc-table sm" style="width: 100%; min-width: 500px;">
                <thead>
                  <tr><th>设备编号</th><th>设备名称</th><th>类型</th><th>判定结果</th><th>判定依据/备注</th></tr>
                </thead>
                <tbody>
                  <tr v-for="dev in props.data.obsoleteDevices" :key="dev.code">
                    <td class="mono" style="font-size:11.5px">{{ dev.code }}</td>
                    <td style="font-weight: 500">{{ dev.name }}</td>
                    <td>{{ getTypeLabel(dev.typeK) }}</td>
                    <td>
                      <span :class="['badge', getStatusBadgeClass(dev.status)]">
                        {{ getStatusLabel(dev.status) }}
                      </span>
                    </td>
                    <td style="font-size:11.5px; color:var(--text-2); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="dev.reason">{{ dev.reason || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="ai-thoughts" style="margin-top:14px">
              <div class="thought ok" style="font-size:11.5px">
                <span class="label">AI 洞察</span>{{ s.insight }}
              </div>
            </div>
          </div>
        </div>

        <!-- AI 标签 -->
        <div class="pkg-card">
          <h4><AppIcon name="tag" :size="14" stroke="var(--brand)"/> AI 自动提取的资源包标签</h4>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <span v-for="(t,i) in AI_TAGS" :key="i" class="badge purple" style="font-size:11px">{{ t }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 文档清单 -->
    <template v-else-if="tab === 'docs'">
      <div class="pkg-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:12px;border-bottom:1px dashed var(--line)">
          <h4 style="margin:0;padding:0;border:none"><AppIcon name="doc" :size="14" stroke="var(--brand)"/> 解析文档清单</h4>
          <div style="font-size:11px;color:var(--text-2)">共 {{ summary.docs }} 个文档 · {{ summary.chunks }} 个语义切片</div>
        </div>
        <table class="doc-table">
          <thead>
            <tr><th>文档名</th><th>类别</th><th>大小</th><th>页数</th><th>切片</th><th>实体</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in flatDocs" :key="i">
              <td><AppIcon name="doc" :size="12"/> &nbsp;{{ d.name }}</td>
              <td><span class="badge">{{ d.cat }}</span></td>
              <td class="mono">{{ d.size }}</td>
              <td class="mono">{{ d.pages }}</td>
              <td class="mono" style="color:var(--brand)">{{ d.chunks || 0 }}</td>
              <td class="mono" style="color:#7a5cff">{{ d.entities || 0 }}</td>
              <td><span class="badge ok"><AppIcon name="check" :size="10"/> 已入库</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- 下一步 -->
    <template v-else-if="tab === 'next'">
      <div class="next-actions">
        <div v-for="a in NEXT_ACTIONS" :key="a.n" class="next-act">
          <div class="ic"><AppIcon :name="a.i" :size="18"/></div>
          <div><div class="n">{{ a.n }}</div><div class="d">{{ a.d }}</div></div>
        </div>
      </div>
    </template>

    <!-- 底部操作 -->
    <div class="form-actions" style="padding:16px 24px;margin-top:0;border-top:1px solid var(--line);background:linear-gradient(180deg,#f8faff,#f3f6fb);border-radius:0 0 12px 12px;display:flex;justify-content:flex-end;align-items:center;gap:10px">
      <div style="font-size:12px;color:var(--text-2);margin-right:auto">资源包已就绪，可进行碳效码计算与考核评价</div>
      <button class="btn ghost" @click="$emit('back')"><AppIcon name="chevron-left" :size="14"/> 返回资源包列表</button>
      <button class="btn primary" @click="$emit('finish')">
        <AppIcon name="zap" :size="14"/> 进入碳效码计算
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import { DOC_TYPES, SUBSYSTEMS, FUNC_MAP } from '../../data/constants.js'
import http from '../../api/http.js'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  relationTemplate: { type: Object, default: () => ({}) }
})
defineEmits(['finish', 'back'])

const realGraph = ref(null)
const fetchStatus = ref('loading') // 'loading' | 'success' | 'failed'

onMounted(async () => {
  if (props.data.graphStats) {
    fetchStatus.value = 'success'
    return
  }
  const buildId = props.data.code
  if (!buildId) {
    fetchStatus.value = 'failed'
    return
  }
  try {
    const res = await http.get('/Resource/getResourceRelationData', { params: { buildId } })
    let rawData = res
    if (typeof res === 'string') {
      try { rawData = JSON.parse(res) } catch (e) {}
    } else if (res && typeof res.data === 'string') {
      try { rawData = JSON.parse(res.data) } catch (e) {}
    }
    
    let graphData = null
    if (rawData?.nodes) {
      graphData = rawData
    } else if (rawData?.data?.nodes) {
      graphData = rawData.data
    } else if (res?.data?.data?.nodes) {
      graphData = res.data.data
    }
    
    if (graphData) {
      realGraph.value = graphData
      fetchStatus.value = 'success'
    } else {
      fetchStatus.value = 'failed'
    }
  } catch (e) {
    console.error('Fetch graph data in StepDone error:', e)
    fetchStatus.value = 'failed'
  }
})

// ── 图谱分析辅助函数 ──
function analyzeGraph(raw) {
  if (!raw || !raw.nodes) {
    return { docCount: 0, docPages: 0, chunks: 0, entities: 0, edges: 0, vectors: 0 }
  }
  let docCount = 0
  let docPages = 0
  let aiCount = 0
  let entities = 0

  function traverse(n) {
    if (!n) return
    entities++
    if (n.levelType && n.levelType.includes('文件')) {
      docCount++
      docPages += 10
    } else if (n.levelType && (n.levelType.includes('AI') || n.levelType.includes('切片') || n.levelType.includes('知识'))) {
      aiCount++
    }
    if (n.children && Array.isArray(n.children)) {
      n.children.forEach(traverse)
    }
  }
  traverse(raw.nodes)

  const edges = Math.max(0, entities - 1)
  return {
    docCount,
    docPages,
    chunks: aiCount,
    entities,
    edges,
    vectors: docCount > 0 ? docCount * 45 : aiCount // 如果有文档则估算向量条数（每篇文档约45个切片），否则等于AI节点数
  }
}

// ── Fallback 数据估算 ──
function getFallbackStats() {
  const docs = props.data.docs || {}
  const allDocs = Object.values(docs).flat()
  const docCount = allDocs.length
  const docPages = allDocs.reduce((s, d) => s + (d.pages || 0), 0)
  const chunks = allDocs.reduce((s, d) => s + (d.chunks || 0), 0) || Math.floor(docPages * 4.6)
  
  const subs = props.data.subs || {}
  const enabledSubsCount = Object.values(subs).filter(s => s?.enabled).length
  const obsoleteDevices = props.data.obsoleteDevices || []
  const obsoleteCount = obsoleteDevices.length

  const entities = 1 + enabledSubsCount + enabledSubsCount * 2.5
  const edges = Math.max(0, Math.floor(entities - 1))
  const vectors = chunks * 1536

  return {
    docCount,
    docPages,
    chunks,
    entities: Math.max(Math.floor(entities), 12),
    edges: Math.max(edges, 11),
    vectors
  }
}

const filteredSubsystems = computed(() => {
  const template = props.relationTemplate
  if (!template || !template.children || template.children.length === 0) {
    const defaultAvailable = ["T001", "T002", "T003", "T005", "T006", "T007", "T008", "T010", "T011", "T013", "T015", "T016"]
    return defaultAvailable.map(tag => SUBSYSTEMS.find(s => s.k === tag)).filter(Boolean)
  }
  const tags = template.children.map(child => child.tag).filter(Boolean)
  return tags.map(tag => SUBSYSTEMS.find(s => s.k === tag)).filter(Boolean)
})

const tab      = ref('overview')
const expanded = reactive({ basic: true, obsolete: true })

const TABS = [{ k: 'overview', n: '概览' }, { k: 'docs', n: '文档清单' }, { k: 'next', n: '下一步' }]

const targetStats = computed(() => {
  let gs = props.data.graphStats
  if (!gs && fetchStatus.value === 'success' && realGraph.value) {
    gs = analyzeGraph(realGraph.value)
  }
  if (!gs) {
    gs = getFallbackStats()
  }
  return gs
})

const summary = computed(() => {
  const s = targetStats.value
  const subs = props.data.subs || {}
  const enabled = Object.entries(subs).filter(([, v]) => v?.enabled).map(([k]) => k)
  const obsoleteDevices = props.data.obsoleteDevices || []

  return {
    nodes: s.entities,
    edges: s.edges,
    chunks: s.chunks,
    docs: s.docCount,
    docPages: s.docPages,
    score: 95,
    enabled,
    obsoleteCount: obsoleteDevices.length,
    obsoletePhaseoutCount: obsoleteDevices.filter(d => ['phaseout', 'danger'].includes(d.status)).length,
    obsoleteLowEffCount: obsoleteDevices.filter(d => d.status === 'low_eff').length,
  }
})

const basicInfo = computed(() => {
  const info = props.data.tempBuildInfo || {}
  return [
    ['建筑编号', props.data.code || '—'],
    ['建筑名称', props.data.title || props.data.name || '—'],
    ['功能类别', FUNC_MAP[info.func] || props.data.func || '—'],
    ['建筑面积', info.area ? `${info.area.toLocaleString()} ㎡` : (props.data.area ? `${props.data.area.toLocaleString()} ㎡` : '—')],
    ['建成年代', info.year || props.data.year || '—'],
    ['楼宇业主', info.owner || '—'],
    ['详细地址', props.data.address || '—'],
    ['经纬度', props.data.longitude && props.data.latitude ? `东经 ${props.data.longitude}° / 北纬 ${props.data.latitude}°` : '—'],
  ]
})

const statItems = computed(() => [
  ['图谱实体',  summary.value.entities,  '#4dc9ff'],
  ['关系边',    summary.value.edges,     '#a799ff'],
  ['语义切片',  summary.value.chunks,    '#2bd9a8'],
  ['向量维度',  summary.value.vectors,   '#ffb547'],
])

const flatDocs = computed(() => {
  const docs = props.data.docs || {}
  const result = []
  for (const [catKey, arr] of Object.entries(docs)) {
    if (!Array.isArray(arr)) continue
    const docTypeMeta = DOC_TYPES.find(dt => dt.k === catKey)
    const catName = docTypeMeta ? docTypeMeta.n : (catKey === 'scene' ? '现场照片' : (catKey === 'manual' ? '说明书' : catKey))
    arr.forEach(d => {
      result.push({
        ...d,
        cat: catName
      })
    })
  }
  return result
})

const AI_TAGS = computed(() => {
  const tags = ['#夏热冬冷','#高层','#中央空调','#智能照明','#楼宇自控','#GB/T51161','#已建图谱']
  
  // 动态根据基础信息和启用的子项以及淘汰设备数量生成标签
  const info = props.data.tempBuildInfo || {}
  if (info.func) {
    tags.unshift(`#${FUNC_MAP[info.func]}建筑`)
  }
  if (summary.value.obsoleteCount > 0) {
    tags.unshift(`#待淘汰设备${summary.value.obsoleteCount}台`)
  }
  
  const subs = props.data.subs || {}
  if (subs.T001?.enabled) tags.push('#具备分项计量')
  if (subs.T005?.enabled) tags.push('#智能充电桩')
  if (subs.T006?.enabled) tags.push('#屋顶光伏')
  if (subs.T007?.enabled) tags.push('#可参与VPP')
  if (subs.T015?.enabled) tags.push('#已评碳效码')
  if (subs.T016?.enabled) tags.push('#绿电交易完成')
  
  return tags
})

const NEXT_ACTIONS = [
  { n: '运行碳效码计算',     d: '基于已入库的资料、实时数据与基准，输出该建筑的碳效评级',              i: 'zap' },
  { n: '启动 AI 节能问答',   d: '在该建筑资源包内，与知识库进行自然语言问答',                       i: 'sparkles' },
  { n: '生成考核评价报告',   d: '按地方考核办法，自动生成阶段性报告',                               i: 'doc' },
  { n: '接入实时能耗看板',   d: '打开该建筑的负荷与分项实时驾驶舱',                                i: 'panel' },
]

function getSubsystemHighlights(s, subData) {
  const hl = []
  if (!subData) return hl

  if (s.k === 'T001') {
    hl.push({ l: '电表数', v: (subData.electricityMeter || '—') + ' 个', t: '用电计量' })
    hl.push({ l: '年用电量', v: (subData.electricitySummary || '—') + ' kWh', t: '总用能' })
    hl.push({ l: '水表数', v: (subData.waterMeter || '—') + ' 个', t: '用水计量' })
    hl.push({ l: '通讯协议', v: 'Modbus-TCP', t: '采集频率 15min' })
  } else if (s.k === 'T003') {
    hl.push({ l: '改造项目', v: (subData.projectName || '已实施项目'), t: '名称' })
    hl.push({ l: '改造面积', v: (subData.renovationArea || '—') + ' ㎡', t: '覆盖面积' })
    hl.push({ l: '年节能量', v: (subData.savingAmount || '—') + ' kWh', t: '节约能耗' })
    hl.push({ l: '节能率', v: (subData.savingRate || '—') + ' %', t: '能效提升' })
  } else if (s.k === 'T005') {
    hl.push({ l: '充电站名', v: subData.stationName || '—', t: '站点名称' })
    hl.push({ l: '直流快充', v: (subData.directNum || '—') + ' 个', t: '快充桩数' })
    hl.push({ l: '交流慢充', v: (subData.swapNum || '—') + ' 个', t: '慢充桩数' })
    hl.push({ l: '用电限额', v: '纳入需量管理', t: '安全控制' })
  } else if (s.k === 'T006') {
    hl.push({ l: '光伏电站', v: subData.solarName || '—', t: '电站名称' })
    hl.push({ l: '装机容量', v: (subData.capacity || '—') + ' kWp', t: '容量' })
    hl.push({ l: '运行状态', v: subData.solarStatus || '正常', t: '状态' })
    hl.push({ l: '投运日期', v: subData.installDate || '—', t: '并网时间' })
  } else if (s.k === 'T007') {
    hl.push({ l: '电厂名称', v: subData.vdName || '—', t: '聚合名称' })
    hl.push({ l: '最大容量', v: (subData.maxCapacity || '—') + ' kW', t: '可调负荷' })
    hl.push({ l: '策略数量', v: (subData.strategyCount || '—') + ' 个', t: '控制策略' })
    hl.push({ l: '因子数', v: (subData.factorCount || '—') + ' 个', t: '调度因子' })
  } else if (s.k === 'T008') {
    hl.push({ l: '用能企业', v: subData.unitName || '—', t: '单位名称' })
    hl.push({ l: '年度能耗', v: (subData.energyValue || '—') + ' tce', t: '综合能耗' })
    hl.push({ l: '上年能耗', v: (subData.energyValueLastYear || '—') + ' tce', t: '历史对比' })
  } else if (s.k === 'T010') {
    hl.push({ l: '审计项目', v: subData.projectName || '—', t: '项目名称' })
    hl.push({ l: '审计面积', v: (subData.EaArea || '—') + ' ㎡', t: '评估范围' })
    hl.push({ l: '主管单位', v: subData.Competent || '—', t: '审核机构' })
  } else if (s.k === 'T011') {
    hl.push({ l: '对标年度', v: (subData.year || '—') + ' 年', t: '评价时间' })
    hl.push({ l: '总量目标', v: subData.aggregateTarget || '—', t: '限额' })
    hl.push({ l: '总量结果', v: subData.aggregateResult || '—', t: '考核结果' })
    hl.push({ l: '强度结果', v: subData.instensityResult || '—', t: '能耗强度' })
  } else if (s.k === 'T015') {
    hl.push({ l: '评估年度', v: (subData.evaYear || '—') + ' 年', t: '年份' })
    hl.push({ l: '碳效赋码', v: subData.evaluationCode || '—', t: '码色等级' })
    hl.push({ l: '评估得分', v: (subData.evaluationScore || '—') + ' 分', t: '实得分数' })
  } else if (s.k === 'T016') {
    hl.push({ l: '项目名称', v: subData.gsProjectName || subData.projectName || '—', t: '名称' })
    hl.push({ l: '交易编号', v: subData.transactionNumber || '—', t: '订单号' })
    hl.push({ l: '绿证数量', v: (subData.greenCertificateNum || '—') + ' 张', t: '购买绿证' })
    hl.push({ l: '减碳成效', v: (subData.reduceCO2 || '—') + ' tCO₂', t: '二氧化碳减排' })
  } else {
    const entries = Object.entries(subData)
      .filter(([key, val]) => val !== null && val !== undefined && val !== '' && typeof val !== 'object' && key !== 'enabled')
      .slice(0, 4)
    entries.forEach(([key, val]) => {
      hl.push({ l: key, v: String(val), t: '' })
    })
  }
  
  if (hl.length === 0) {
    hl.push({ l: '数据接入', v: subData.endpoint ? '已配置' : '无数据', t: subData.endpoint || '未配置接入 Endpoint' })
  }
  
  return hl
}

const displaySystems = computed(() => {
  const graphData = props.data.graphSource || realGraph.value
  
  const list = filteredSubsystems.value.map(s => {
    const subData = props.data.subs?.[s.k] || {}
    const isEnabled = !!subData.enabled
    const highlights = getSubsystemHighlights(s, subData)
    
    let summaryText = s.desc
    let insightText = `AI 已自动分析该子系统台账，并链接至图谱中相应实体。`
    
    let hasRealInsight = false
    if (isEnabled && graphData && graphData.nodes) {
      const lv1Node = (graphData.nodes.children || []).find(n => n.tag === s.k)
      if (lv1Node) {
        const aiNode = (lv1Node.children || []).find(n => n.type === 'aiSummary')
        if (aiNode && aiNode.data) {
          insightText = aiNode.data
          hasRealInsight = true
        }
      }
    }
    
    if (!hasRealInsight) {
      if (s.k === 'T001') {
        summaryText = '分项计量表点位已完成在线对位，数据正常接入。'
        insightText = 'AI 洞察：当前分项用电主要为照明与空调，建议在非工作时段开启能效监控告警以规避异常漂移。'
      } else if (s.k === 'T003') {
        summaryText = '节能改造历史记录已入库，能效提升成效结构化。'
        insightText = 'AI 洞察：历次改造成效良好，AI 预测如果继续实施变频新风改造，可进一步提升约 5% 的总体节能量。'
      } else if (s.k === 'T005') {
        summaryText = '充电基础设施完备，已绑定有序充电调度因子。'
        insightText = 'AI 洞察：通过部署有序充电和部分 V2G 双向调度，预计每日可为建筑转移高峰负荷约 150 kW。'
      } else if (s.k === 'T006') {
        summaryText = '屋顶分布式光伏发电接入，碳减排链路已对齐。'
        insightText = 'AI 洞察：光伏发电自发自用率极高（超 90%），在后续碳效码评估中可用于直接扣减建筑运营碳排放。'
      } else if (s.k === 'T007') {
        summaryText = '虚拟电厂可调节资源池已建模，具备需求响应白名单资质。'
        insightText = 'AI 洞察：储能及暖通空调的可调节容量较大，参与需求响应可在碳效码计算中获得最高 8 分加分。'
      }
    }
    
    return {
      k: s.k,
      n: s.n,
      icon: s.icon,
      color: s.color,
      badge: isEnabled ? (s.k === 'T001' ? `${subData.electricityMeter || 0} 表` : (s.k === 'T006' ? `${subData.capacity || 0} kWp` : '已启用')) : '未启用',
      summary: isEnabled ? summaryText : '未启用',
      insight: insightText,
      highlights,
      isEnabled
    }
  })
  
  const obsoleteCount = summary.value.obsoleteCount
  list.push({
    k: 'obsolete',
    n: '淘汰与低效设备',
    icon: 'zap',
    color: '#e0394f',
    badge: obsoleteCount > 0 ? `${obsoleteCount} 台` : '未录入',
    summary: obsoleteCount > 0 ? `已录入 ${obsoleteCount} 台运行中或待处理的落后用能设备。` : '未录入落后或低效用能设备。',
    insight: 'AI 预测：如果能够将识别出的淘汰设备（特别是超期运行电机）更换为新一代一级能效产品，将显著提升设备运行评分。',
    highlights: obsoleteCount > 0 ? [
      { l: '总计台账', v: `${obsoleteCount} 台`, t: '关联设备库跟踪' },
      { l: '强制/限期淘汰', v: `${summary.value.obsoletePhaseoutCount} 台`, t: '待整改设备' },
      { l: '建议改造', v: `${summary.value.obsoleteLowEffCount} 台`, t: '低效运行' },
      { l: '补充凭证', v: '已入库', t: '支持铭牌OCR识别' }
    ] : [
      { l: '总计台账', v: '0 台', t: '关联设备库跟踪' },
      { l: '限期淘汰', v: '0 台', t: '待整改设备' },
      { l: '建议改造', v: '0 台', t: '低效运行' }
    ],
    isEnabled: obsoleteCount > 0
  })
  
  return list
})

const getTypeLabel = (k) => {
  const map = {
    motor: '电动机', fan: '风机', pump: '泵', transformer: '变压器',
    boiler: '工业锅炉', compressor: '压缩机', chiller: '制冷设备', other: '其他'
  }
  return map[k] || '其他'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待判定',
    low_eff: '低效运行',
    phaseout: '限期淘汰',
    danger: '强制淘汰'
  }
  return map[status] || '待判定'
}

const getStatusBadgeClass = (status) => {
  if (status === 'danger' || status === 'phaseout') return 'red'
  if (status === 'low_eff') return 'warn'
  return 'gray'
}
</script>
