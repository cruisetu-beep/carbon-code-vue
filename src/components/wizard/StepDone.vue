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
          <span><AppIcon name="doc" :size="11"/> {{ summary.docCount }} 份文档 · {{ summary.docPages }} 页</span>
          <span><AppIcon name="scan" :size="11"/> {{ summary.chunks }} 个语义切片</span>
          <span><AppIcon name="graph" :size="11"/> {{ summary.entities }} 实体 · {{ summary.edges }} 关系</span>
          <span><AppIcon name="database" :size="11"/> {{ summary.vectors.toLocaleString() }} 维向量</span>
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
                  <div v-for="[l,v,cl] in statItems" :key="l" class="stat-c" :style="{'--cl':cl}">
                    <div class="l">{{ l }}</div><div class="v">{{ v }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 各子系统折叠 -->
        <div v-for="s in SUBSYSTEM_META" :key="s.k"
             :class="['collapse-card', expanded[s.k] && 'open', !summary.enabled.includes(s.k) && 'disabled']"
             :style="{ '--cc': s.color }">
          <div class="collapse-head" @click="summary.enabled.includes(s.k) && (expanded[s.k] = !expanded[s.k])">
            <div class="ic-wrap"><AppIcon :name="s.icon" :size="18"/></div>
            <div>
              <div class="tt">{{ s.n }}</div>
              <div class="ss">{{ summary.enabled.includes(s.k) ? s.summary : '未启用' }}</div>
            </div>
            <span v-if="summary.enabled.includes(s.k)" class="bg">{{ s.badge }}</span>
            <span v-else/>
            <div class="arrow"><AppIcon name="chevron-down" :size="14"/></div>
          </div>
          <div v-if="expanded[s.k] && summary.enabled.includes(s.k)" class="collapse-body">
            <div class="hl-grid">
              <div v-for="h in s.highlights" :key="h.l" class="hl-c" :style="{'--cl': s.color}">
                <div class="hl-l">{{ h.l }}</div>
                <div class="hl-v">{{ h.v }}</div>
                <div class="hl-t">{{ h.t }}</div>
              </div>
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
          <div style="font-size:11px;color:var(--text-2)">共 {{ summary.docCount }} 个文档 · {{ summary.chunks }} 个语义切片</div>
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
import { ref, computed } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import { DOC_TYPES } from '../../data/constants.js'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['finish', 'back'])

const tab      = ref('overview')
const expanded = ref({ basic: true, sub_meter: false, vpp: false, retrofit: false, charge: false, pv: false })

const TABS = [{ k: 'overview', n: '概览' }, { k: 'docs', n: '文档清单' }, { k: 'next', n: '下一步' }]

const FUNC_MAP = { office: '办公', mall: '商场', hotel: '酒店', hospital: '医院', school: '学校', mixed: '综合体' }

const summary = computed(() => {
  const docs = props.data.docs || {}
  const allDocs = Object.values(docs).flat()
  const subs = props.data.subs || {}
  const enabled = Object.entries(subs).filter(([, v]) => v?.enabled).map(([k]) => k)
  return {
    docCount: allDocs.length,
    docPages: allDocs.reduce((s, d) => s + (d.pages || 0), 0),
    chunks:   allDocs.reduce((s, d) => s + (d.chunks || 0), 0),
    entities: 186, edges: 412, vectors: 2840,
    enabled,
  }
})

const basicInfo = computed(() => [
  ['建筑编号', props.data.code || '—'],
  ['建筑名称', props.data.name || '—'],
  ['功能类别', FUNC_MAP[props.data.func] || '—'],
  ['建筑面积', props.data.area ? `${props.data.area.toLocaleString()} ㎡` : '—'],
  ['建成年代', props.data.year || '—'],
  ['所在地区', props.data.region || '—'],
])

const statItems = [
  ['图谱实体',  186,  '#4dc9ff'],
  ['关系边',    412,  '#a799ff'],
  ['语义切片',  computed(() => summary.value.chunks), '#2bd9a8'],
  ['向量维度',  2840, '#ffb547'],
]

const flatDocs = computed(() =>
  DOC_TYPES.flatMap(dt =>
    (props.data.docs?.[dt.k] || []).map(d => ({ ...d, cat: dt.n }))
  )
)

const AI_TAGS = ['#夏热冬冷','#办公建筑','#高层','#中央空调','#冷水机组×4','#变配电','#智能照明','#楼宇自控','#年综合能耗98.2','#GB/T51161','#已节能改造','#具备分项计量','#可参与VPP','#屋顶光伏','#V2G就绪']

const NEXT_ACTIONS = [
  { n: '运行碳效码计算',     d: '基于已入库的资料、实时数据与基准，输出该建筑的碳效评级',              i: 'zap' },
  { n: '启动 AI 节能问答',   d: '在该建筑资源包内，与知识库进行自然语言问答',                       i: 'sparkles' },
  { n: '生成考核评价报告',   d: '按地方考核办法，自动生成阶段性报告',                               i: 'doc' },
  { n: '接入实时能耗看板',   d: '打开该建筑的负荷与分项实时驾驶舱',                                i: 'panel' },
]

const SUBSYSTEM_META = [
  { k:'sub_meter', n:'分项计量', icon:'panel', color:'#4dc9ff', badge:'128 点', summary:'已识别 4 类用电分项，数据采集网关接入正常。', insight:'AI 已将分项数据与设备节点完成实时对位，可直接驱动碳效码计算。', highlights:[{l:'计量点位',v:'128 个',t:'覆盖全部楼层'},{l:'数据完整度',v:'98.7%',t:'近 30 日'},{l:'AI 异常检测',v:'已开启',t:'夜间漂移自动告警'},{l:'协议',v:'Modbus-TCP',t:'15 分钟采集'}] },
  { k:'vpp',       n:'虚拟电厂', icon:'bolt',  color:'#7a5cff', badge:'1,250 kW', summary:'可调节资源已建模，具备分钟级响应能力。', insight:'VPP 资源可在碳效码评分中获得最高 8 分加分。', highlights:[{l:'可调节容量',v:'1,250 kW',t:'占负荷 42%'},{l:'储能',v:'800 kWh',t:'磷酸铁锂'},{l:'响应时间',v:'分钟级',t:'日前/日内邀约'},{l:'市场',v:'需求响应',t:'已中标 14 次'}] },
  { k:'retrofit',  n:'节能改造', icon:'leaf',  color:'#2bd9a8', badge:'82 万 kWh', summary:'已识别 3 项历史改造工程，节能效果已结构化入库。', insight:'AI 推断仍有 12% 节能潜力，集中在围护结构与新风热回收。', highlights:[{l:'改造项目',v:'3 项',t:'冷源/照明/群控'},{l:'年节能量',v:'82 万 kWh',t:'减碳 480 tCO₂e'},{l:'累计投入',v:'186 万元',t:'补贴 32 万'},{l:'回收期',v:'2.8 年',t:'已全部回收'}] },
  { k:'charge',    n:'充电桩',   icon:'plug',  color:'#ffb547', badge:'32 个', summary:'充电基础设施完备，支持有序充电与部分 V2G。', insight:'充电负荷已独立建模，可在 VPP 中作为可移负荷参与。', highlights:[{l:'充电桩数',v:'32 个',t:'慢充 24/快充 8'},{l:'总功率',v:'560 kW',t:'已纳入需量管理'},{l:'V2G',v:'部分支持',t:'8 台快充桩'},{l:'日均充电',v:'1,840 kWh',t:'覆盖率 73%'}] },
  { k:'pv',        n:'光伏发电', icon:'sun',   color:'#ff8a47', badge:'286 kWp', summary:'屋顶分布式光伏稳定运行，自发自用率高。', insight:'光伏每发 1 kWh 在碳效码中按当地电网因子抵扣。', highlights:[{l:'装机容量',v:'286 kWp',t:'屋顶单晶硅'},{l:'年发电量',v:'32 万 kWh',t:'自用率 94%'},{l:'光伏面积',v:'1,480 ㎡',t:'屋面利用率 86%'},{l:'投运年份',v:'2023 年',t:'衰减率 1.8%'}] },
]
</script>
