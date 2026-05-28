<template>
  <div class="step-basic float-in">
    <!-- 主表单 -->
    <div class="card glow">
      <div class="card-corner-tl"/><div class="card-corner-br"/>

      <div class="form-section">
        <div class="section-head">
          <div class="ico"><AppIcon name="cube" :size="18"/></div>
          <div>
            <h3>建筑标识与基础属性</h3>
            <div class="desc">这些字段将作为知识图谱中"建筑实体"的核心属性写入</div>
          </div>
        </div>

        <div class="grid-2">
          <div :class="['field', errors.code && 'has-err']">
            <label class="field-label">建筑编号 <span class="req">*</span></label>
            <input class="input mono" placeholder="例如 SH-PD-A0247" :value="data.code || ''" @input="set('code', $event.target.value)"/>
            <div v-if="errors.code" class="err-msg">{{ errors.code }}</div>
          </div>
          <div :class="['field', errors.name && 'has-err']">
            <label class="field-label">建筑名称 <span class="req">*</span></label>
            <input class="input" placeholder="例如 浦东金融中心 T1 主楼" :value="data.name || ''" @input="set('name', $event.target.value)"/>
            <div v-if="errors.name" class="err-msg">{{ errors.name }}</div>
          </div>
          <div :class="['field', errors.year && 'has-err']">
            <label class="field-label">建成年代 <span class="req">*</span></label>
            <input class="input mono" type="number" placeholder="YYYY" :value="data.year || ''" @input="set('year', $event.target.value)"/>
            <div v-if="errors.year" class="err-msg">{{ errors.year }}</div>
          </div>
          <div :class="['field', errors.area && 'has-err']">
            <label class="field-label">建筑面积（㎡） <span class="req">*</span></label>
            <input class="input mono" type="number" placeholder="0.00" :value="data.area || ''" @input="set('area', $event.target.value)"/>
            <div v-if="errors.area" class="err-msg">{{ errors.area }}</div>
          </div>
          <div class="field">
            <label class="field-label">所在地区</label>
            <select class="select" :value="data.region || ''" @change="set('region', $event.target.value)">
              <option value="">请选择</option>
              <option>上海市 浦东新区</option>
              <option>上海市 黄浦区</option>
              <option>上海市 静安区</option>
              <option>上海市 徐汇区</option>
              <option>北京市 朝阳区</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">气候分区</label>
            <select class="select" :value="data.climate || ''" @change="set('climate', $event.target.value)">
              <option value="">请选择</option>
              <option>夏热冬冷</option><option>夏热冬暖</option>
              <option>寒冷</option><option>严寒</option><option>温和</option>
            </select>
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label class="field-label">建筑层数 / 高度 / 业主单位</label>
            <div style="display:grid;grid-template-columns:1fr 1fr 2fr;gap:12px">
              <input class="input mono" placeholder="地上 / 地下" :value="data.floors || ''" @input="set('floors', $event.target.value)"/>
              <input class="input mono" placeholder="高度 m"    :value="data.height || ''" @input="set('height', $event.target.value)"/>
              <input class="input"     placeholder="业主 / 物业管理方" :value="data.owner || ''" @input="set('owner', $event.target.value)"/>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能类别 -->
      <div class="form-section" style="padding-top:0">
        <div class="section-head">
          <div class="ico"><AppIcon name="panel" :size="18"/></div>
          <div>
            <h3>建筑功能类别 <span class="req" style="color:var(--danger);font-size:13px">*</span></h3>
            <div class="desc">用于在图谱中关联对应的能耗基准、考核标准与节能工艺路径</div>
          </div>
        </div>
        <div class="func-grid">
          <div v-for="f in FUNC_OPTIONS" :key="f.k"
               :class="['func-card', data.func === f.k && 'active']"
               @click="set('func', f.k)">
            <div class="ico"><AppIcon :name="f.i" :size="22"/></div>
            <div>{{ f.n }}</div>
          </div>
        </div>
        <div v-if="errors.func" class="err-msg" style="margin-top:10px">{{ errors.func }}</div>
      </div>

      <!-- 底部操作 -->
      <div class="form-actions">
        <div class="form-progress">
          <span>基础信息完成度</span>
          <div class="bar"><div class="bar-fill" :style="{ width: `${progress}%` }"/></div>
          <span class="mono">{{ progress }}%</span>
        </div>
        <div style="display:flex;gap:10px;margin-left:auto">
          <button class="btn ghost">保存草稿</button>
          <button class="btn primary" @click="handleNext">
            下一步 · 文档上传 <AppIcon name="chevron-right" :size="14"/>
          </button>
        </div>
      </div>
    </div>

    <!-- AI 侧边栏 -->
    <div class="ai-side">
      <div class="ai-side-head">
        <div class="ai-orb"/>
        <div>
          <h4>知识库引擎 · 实时推理</h4>
          <div class="sub mono">CarbonGraph-LLM · v3.2</div>
        </div>
      </div>

      <div v-if="thoughts.length === 0" style="padding:32px 12px;text-align:center;color:var(--text-3);font-size:12px">
        <AppIcon name="sparkles" :size="32"/>
        <div style="margin-top:12px">填写建筑信息时，<br/>知识库将实时推理与匹配</div>
      </div>
      <div v-else class="ai-thoughts">
        <div v-for="(th, i) in thoughts" :key="i"
             :class="['thought', th.ok && 'ok']"
             :style="{ animationDelay: `${i * 0.05}s` }">
          <span class="label">{{ th.l }}</span>{{ th.t }}
        </div>
      </div>

      <div class="meta-strip">
        <span class="dot"/>
        图谱中已有同类建筑 <strong style="color:var(--brand-2)">2,847</strong> 栋
      </div>
      <div class="meta-strip">
        <span class="dot"/>
        本市基准能耗中位数 <strong style="color:var(--brand-2)">92.4</strong> kWh/㎡·a
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '../shared/AppIcon.vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit  = defineEmits(['update', 'next'])

const errors  = ref({})
const thoughts = ref([])

const FUNC_OPTIONS = [
  { k: 'office',   n: '办公',    i: 'factory' },
  { k: 'mall',     n: '商场综合体', i: 'panel' },
  { k: 'hotel',    n: '酒店',    i: 'cube' },
  { k: 'hospital', n: '医院',    i: 'plus' },
  { k: 'school',   n: '学校',    i: 'doc' },
  { k: 'mixed',    n: '综合体',  i: 'graph' },
]

const PROGRESS_FIELDS = ['code', 'name', 'year', 'func', 'area', 'region', 'climate']
const progress = computed(() => {
  const filled = PROGRESS_FIELDS.filter(k => props.data[k]).length
  return Math.round(filled / PROGRESS_FIELDS.length * 100)
})

function set(k, v) {
  emit('update', { ...props.data, [k]: v })
}

function handleNext() {
  const e = {}
  if (!props.data.code) e.code = '请填写建筑编号'
  if (!props.data.name) e.name = '请填写建筑名称'
  if (!props.data.year) e.year = '请填写建筑年代'
  if (!props.data.func) e.func = '请选择建筑功能'
  if (!props.data.area) e.area = '请填写建筑面积'
  errors.value = e
  if (Object.keys(e).length === 0) emit('next')
}

// AI 实时推理
const FUNC_MAP = { office: '办公', mall: '商场综合体', hotel: '酒店', hospital: '医院', school: '学校', mixed: '综合体' }

watch(() => props.data, (d) => {
  const next = []
  if (d.code)   next.push({ t: `识别建筑编号 ${d.code}，已匹配区域命名规范`,       l: 'ENTITY.id',       ok: true })
  if (d.name)   next.push({ t: `创建建筑实体节点："${d.name}"`,                   l: 'GRAPH.node:Building', ok: true })
  if (d.func)   next.push({ t: `匹配 ${FUNC_MAP[d.func]} 类建筑能耗基准 GB/T 51161-2016`, l: 'STANDARD.match', ok: true })
  if (d.year) {
    const age = 2026 - parseInt(d.year)
    if (!isNaN(age)) next.push({ t: `推算建筑使用年限 ${age} 年，将关联围护结构衰减模型`, l: 'INFER.age', ok: true })
  }
  if (d.area)   next.push({ t: `面积 ${d.area} ㎡，预计年综合能耗约 ${(d.area * 0.12).toFixed(0)} 万 kWh`, l: 'INFER.baseline', ok: true })
  if (d.region) next.push({ t: `已链接区域气象站点与峰谷电价数据`,                l: 'DATA.link',       ok: true })
  thoughts.value = next
}, { deep: true })
</script>
