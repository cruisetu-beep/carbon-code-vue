<template>
  <div class="step-docs float-in">
    <!-- 左：文档类型导航 -->
    <div class="doc-types">
      <div class="ttl">资料类别</div>
      <div v-for="(dt, i) in DOC_TYPES" :key="dt.k"
           :class="['doc-type', activeType === dt.k && 'active']"
           @click="activeType = dt.k">
        <div class="num">{{ String(i + 1).padStart(2, '0') }}</div>
        <div class="info">
          <div class="n">
            {{ dt.n }}
            <span v-if="dt.required" class="req-mark">*</span>
            <span v-if="docsOf(dt.k).length > 0" class="badge ok" style="margin-left:auto;font-size:10px">
              {{ docsOf(dt.k).length }}
            </span>
          </div>
          <div class="d">{{ dt.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 中：主上传区 -->
    <div class="doc-main">
      <div class="doc-main-head">
        <div>
          <h3>
            {{ currentDocType.n }}
            <span v-if="currentDocType.required" style="color:var(--danger);margin-left:6px;font-size:13px">*</span>
          </h3>
          <div class="sub">{{ currentDocType.desc }} · 系统将自动 OCR、切片，并在图谱中关联到对应实体</div>
        </div>
        <span class="badge purple">支持 PDF · DOCX · XLSX · DWG · IFC</span>
      </div>

      <!-- 上传区 -->
      <div class="upload-zone" @click="addSample">
        <div class="up-ico"><AppIcon name="upload" :size="22"/></div>
        <div class="h">拖拽文件至此处，或点击选择</div>
        <div class="s">单文件最大 200MB · 上传后自动进入 AI 解析流水线</div>
        <div class="formats">
          <span v-for="f in ['.pdf','.docx','.xlsx','.dwg','.ifc','.csv']" :key="f">{{ f }}</span>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-if="currentDocs.length" class="doc-list">
        <div v-for="d in currentDocs" :key="d.id"
             :class="['doc-item', d.stage < 5 && 'parsing']">
          <div class="file-ico"><AppIcon name="doc" :size="18"/></div>
          <div>
            <div class="name">
              {{ d.name }}
              <span v-if="d.stage === 5" class="stage-text done">
                <AppIcon name="check" :size="11"/> 已入库
              </span>
              <span v-else class="stage-text">{{ STAGE_LABELS[d.stage] }}…</span>
            </div>
            <div class="meta">
              {{ d.size }} · {{ d.pages }} 页
              <template v-if="d.chunks > 0"> · 切片 {{ d.chunks }}</template>
              <template v-if="d.entities > 0"> · 实体 {{ d.entities }}</template>
            </div>
            <div v-if="d.stage < 5" class="doc-progress">
              <div class="fill" :style="{ width: `${d.progress}%` }"/>
            </div>
            <div v-if="d.tags.length" class="doc-tags">
              <span v-for="(t, i) in d.tags" :key="i"
                    :class="['doc-tag', t.k]"
                    :style="{ animationDelay: `${i * 0.04}s` }">{{ t.n }}</span>
            </div>
          </div>
          <button class="icon-btn" @click="removeDoc(d.id)">
            <AppIcon name="trash" :size="14"/>
          </button>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="form-actions" style="padding:16px 24px;margin-top:auto;border-top:1px solid var(--line);background:linear-gradient(180deg,#f8faff,#f3f6fb);border-radius:0 0 12px 12px;display:flex;justify-content:flex-end;align-items:center;gap:10px">
        <div style="font-size:12px;color:var(--text-2);margin-right:auto">
          已上传 <strong style="color:var(--brand-2)">{{ totalDocs }}</strong> 份文档
          <span v-if="!canNext" style="color:var(--warn);margin-left:12px">· 能源审计报告与设备清单为必填</span>
        </div>
        <button class="btn ghost" @click="$emit('prev')"><AppIcon name="chevron-left" :size="14"/> 上一步</button>
        <button class="btn primary" @click="$emit('next')">
          下一步 · 子项配置 <AppIcon name="chevron-right" :size="14"/>
        </button>
      </div>
    </div>

    <!-- 右：AI 解析流水线 -->
    <div class="parse-stream">
      <div class="parse-head">
        <div class="ico"><AppIcon name="cpu" :size="18"/></div>
        <div>
          <h4>AI 解析流水线</h4>
          <div class="sub mono">CarbonGraph-LLM · 多模态文档管线</div>
        </div>
      </div>

      <div class="parse-pipeline">
        <div v-for="s in PARSE_STAGES" :key="s.k"
             :class="['pipe-step', maxStage > s.k && 'done', maxStage === s.k && activeDoc && 'active']">
          <div class="dot">
            <AppIcon v-if="maxStage > s.k" name="check" :size="11"/>
            <template v-else>{{ s.k }}</template>
          </div>
          <div class="label">{{ s.n }}</div>
          <div class="stat">
            <template v-if="s.k === 1 && allDocs.length">{{ allDocs.length }} 份</template>
            <template v-if="s.k === 2 && totalChunks">{{ totalChunks }} 片</template>
            <template v-if="s.k === 3 && totalTags">{{ totalTags }} 标签</template>
            <template v-if="s.k === 4 && totalEntities">{{ totalEntities }} 实体</template>
          </div>
        </div>
      </div>

      <div class="parse-log" ref="logEl">
        <span v-for="(l, i) in logs" :key="i" class="line">
          <span class="ts">{{ l.ts }}</span>
          <span :class="`lv-${l.lv}`">[{{ l.lv.toUpperCase() }}]</span>
          <template v-for="(seg, j) in splitMsg(l.msg)" :key="j">
            <span v-if="seg.t === 'tag'" class="ent">{{ seg.v }}</span>
            <span v-else-if="seg.t === 'quote'" style="color:#4dc9ff">{{ seg.v }}</span>
            <template v-else>{{ seg.v }}</template>
          </template>
        </span>
      </div>

      <div class="doc-stats">
        <div class="doc-stat"><div class="v">{{ allDocs.length }}</div><div class="l">文档</div></div>
        <div class="doc-stat"><div class="v">{{ totalChunks }}</div><div class="l">语义切片</div></div>
        <div class="doc-stat"><div class="v">{{ totalEntities }}</div><div class="l">图谱实体</div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import { DOC_TYPES, SAMPLE_DOCS } from '../../data/constants.js'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit  = defineEmits(['update', 'next', 'prev'])

const activeType = ref('audit')
const logEl      = ref(null)
const logs       = ref([{ ts: '08:42:01', lv: 'info', msg: '知识库引擎已就绪，等待文档输入…' }])

const STAGE_LABELS  = ['排队中', 'OCR / 文本提取', '语义切片', '实体与术语标注', '知识图谱写入', '已入库']
const PARSE_STAGES  = [
  { k: 1, n: 'OCR · 文本抽取' },
  { k: 2, n: '语义切片 (RAG Chunking)' },
  { k: 3, n: '实体识别 / 术语标注' },
  { k: 4, n: '向量化 + 图谱写入' },
]

const currentDocType = computed(() => DOC_TYPES.find(t => t.k === activeType.value))
const docsOf         = (k) => props.data.docs?.[k] || []
const currentDocs    = computed(() => docsOf(activeType.value))

const allDocs       = computed(() => Object.values(props.data.docs || {}).flat())
const totalDocs     = computed(() => allDocs.value.length)
const totalChunks   = computed(() => allDocs.value.reduce((s, d) => s + (d.chunks || 0), 0))
const totalEntities = computed(() => allDocs.value.reduce((s, d) => s + (d.entities || 0), 0))
const totalTags     = computed(() => allDocs.value.reduce((s, d) => s + (d.tags?.length || 0), 0))
const maxStage      = computed(() => Math.max(0, ...allDocs.value.map(d => d.stage)))
const activeDoc     = computed(() => allDocs.value.find(d => d.stage > 0 && d.stage < 5))
const canNext       = computed(() => docsOf('audit').length > 0 && docsOf('equip').length > 0)

function setDocs(t, list) {
  emit('update', { ...props.data, docs: { ...(props.data.docs || {}), [t]: list } })
}

function addSample() {
  const k = activeType.value
  const samples = SAMPLE_DOCS[k] || []
  const existing = new Set(currentDocs.value.map(d => d.name))
  let toAdd = samples.filter(s => !existing.has(s.name)).map(s => ({
    ...s, id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    progress: 0, stage: 0, tags: [], chunks: 0, entities: 0,
  }))
  if (!toAdd.length) {
    toAdd = [{ name: `${currentDocType.value.n}_${currentDocs.value.length + 1}.pdf`,
               size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, pages: Math.floor(Math.random() * 60 + 10),
               id: `f_${Date.now()}`, progress: 0, stage: 0, tags: [], chunks: 0, entities: 0 }]
  }
  setDocs(k, [...currentDocs.value, ...toAdd])
}

function removeDoc(id) {
  setDocs(activeType.value, currentDocs.value.filter(d => d.id !== id))
}

// 解析动画
let parseTimer = null
function startParseTimer() {
  if (parseTimer) return
  parseTimer = setInterval(() => {
    const docs = props.data.docs || {}
    const allList = Object.entries(docs)
    let changed = false
    const next = {}
    for (const [k, arr] of allList) {
      next[k] = arr.map(d => {
        if (d.stage >= 5) return d
        changed = true
        const n = { ...d }
        n.progress = Math.min(100, n.progress + Math.random() * 8 + 5)
        if (n.progress >= 20 && n.stage < 1) n.stage = 1
        if (n.progress >= 40 && n.stage < 2) { n.stage = 2; n.chunks = Math.floor(d.pages * 4.6) }
        if (n.progress >= 60 && n.stage < 3) { n.stage = 3; n.tags = tagsFor(k, d.name) }
        if (n.progress >= 80 && n.stage < 4) { n.stage = 4; n.entities = Math.floor(Math.random() * 40 + 30) }
        if (n.progress >= 100 && n.stage < 5) { n.stage = 5; n.progress = 100 }
        return n
      })
    }
    if (changed) emit('update', { ...props.data, docs: next })
  }, 380)
}

watch(allDocs, (arr) => {
  if (arr.some(d => d.stage < 5)) startParseTimer()
  else { clearInterval(parseTimer); parseTimer = null }
}, { immediate: true })

// 日志动画
let logTimer = null
watch(activeDoc, (doc) => {
  clearInterval(logTimer)
  if (!doc) return
  logTimer = setInterval(() => {
    const ts = new Date().toTimeString().slice(0, 8)
    const ev = randomLogEvent(doc)
    logs.value = [...logs.value, { ts, ...ev }].slice(-40)
    nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
  }, 700)
}, { immediate: true })

onUnmounted(() => { clearInterval(parseTimer); clearInterval(logTimer) })

// 工具函数
const TAG_POOLS = {
  audit:    [{ k: 'entity', n: '#冷水机组' }, { k: 'entity', n: '#变配电系统' }, { k: 'metric', n: '#年综合能耗' }, { k: 'metric', n: '#EUI=98.2' }, { k: '', n: '#GB/T17981' }, { k: '', n: '#夏季工况' }],
  equip:    [{ k: 'entity', n: '#冷机×4' }, { k: 'entity', n: '#冷却塔×6' }, { k: 'entity', n: '#AHU×38' }, { k: 'metric', n: '#额定功率' }, { k: '', n: '#型号台账' }],
  retrofit: [{ k: '', n: '#冷源改造' }, { k: 'metric', n: '#节能率15.2%' }, { k: 'entity', n: '#磁悬浮主机' }, { k: '', n: '#投资回收期' }],
  drawing:  [{ k: 'entity', n: '#平面布局' }, { k: '', n: '#层高3.6m' }, { k: 'entity', n: '#机房位置' }],
  standard: [{ k: '', n: '#考核办法' }, { k: 'metric', n: '#能耗限额' }],
}
function tagsFor(type, _name) {
  const pool = TAG_POOLS[type] || []
  return pool.slice(0, Math.floor(Math.random() * 3) + 3)
}

const LOG_EVENTS = {
  1: [{ lv: 'info', msg: 'OCR 引擎读取文档，识别版式中…' }, { lv: 'info', msg: '提取章节结构 #目录 #正文 #图表' }],
  2: [{ lv: 'info', msg: 'Chunking 完成，生成语义切片' }, { lv: 'info', msg: '检测到表格 #设备清单 #能耗分项' }],
  3: [{ lv: 'info', msg: '实体识别：#冷水机组 #离心式 #额定制冷量' }, { lv: 'info', msg: '术语标定 → 链接到 #GB/T17981 #能耗限额' }],
  4: [{ lv: 'ok', msg: '向量化完成 (1536 维)，写入 #VectorDB' }, { lv: 'ok', msg: '图谱节点 +12，关系 +28' }],
}
function randomLogEvent(doc) {
  const pool = LOG_EVENTS[doc.stage] || [{ lv: 'info', msg: '…' }]
  return pool[Math.floor(Math.random() * pool.length)]
}

function splitMsg(s) {
  return s.split(/(#[\u4e00-\u9fa5A-Za-z0-9_]+|"[^"]+")/g).map(p => {
    if (/^#/.test(p)) return { t: 'tag',   v: p }
    if (/^"/.test(p)) return { t: 'quote', v: p }
    return { t: 'text', v: p }
  })
}
</script>
