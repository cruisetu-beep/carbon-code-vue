<template>
  <div class="step-graph float-in">
    <!-- 左：构建管线 -->
    <div class="gr-side">
      <h4><AppIcon name="cpu" :size="14"/> 构建管线</h4>
      <div v-for="(p, i) in PHASES" :key="i"
           :class="['gr-phase', i === phase && !done && 'active', (i < phase || done) && 'done']">
        <div class="num">
          <AppIcon v-if="i < phase || done" name="check" :size="11"/>
          <template v-else>{{ String(i + 1).padStart(2, '0') }}</template>
        </div>
        <div class="info">
          <div class="n">{{ p.n }}</div>
          <div class="d">{{ p.d }}</div>
        </div>
      </div>
    </div>

    <!-- 中：图谱构建画布 -->
    <div class="gr-canvas">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <h3 style="margin:0;font-size:15px;display:flex;align-items:center;gap:10px">
            <AppIcon name="sparkles" :size="18" stroke="var(--brand-2)"/>
            知识图谱实时构建中
          </h3>
          <div style="font-size:11px;color:#8da3c8;margin-top:4px">
            本建筑数据正在被融合至
            <strong class="mono" style="color:var(--brand-2)">CarbonGraph</strong> 主图谱
          </div>
        </div>
        <span v-if="done" class="badge ok"><AppIcon name="check" :size="11"/> 构建完成</span>
        <span v-else class="badge">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--brand-2);margin-right:6px;animation:pulse 1s infinite"/>
          {{ PHASES[phase]?.n }}
        </span>
      </div>

      <div class="gr-progress-bar"><div class="fl" :style="{ width: `${progress}%` }"/></div>
      <div class="gr-meta">
        <span style="color:#8da3c8">阶段 {{ Math.min(phase + 1, 5) }}/5 · {{ PHASES[phase]?.n }}</span>
        <span style="color:var(--brand-2)">{{ progress.toFixed(1) }}%</span>
      </div>

      <div class="gr-stats">
        <div class="gr-stat"><div class="l"><AppIcon name="cube" :size="10"/> 图谱节点</div><div class="v">{{ stats.nodes }}</div></div>
        <div class="gr-stat"><div class="l"><AppIcon name="graph" :size="10"/> 关系边</div><div class="v purple">{{ stats.edges }}</div></div>
        <div class="gr-stat"><div class="l"><AppIcon name="database" :size="10"/> AI 切片</div><div class="v green">{{ stats.chunks }}</div></div>
        <div class="gr-stat"><div class="l"><AppIcon name="file-text" :size="10"/> 解析文档</div><div class="v warn">{{ stats.docs }}</div></div>
      </div>

      <!-- 迷你图谱动画 -->
      <div class="graph-svg">
        <svg width="100%" height="100%" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="ctrGrad2">
              <stop offset="0%" stop-color="#4dc9ff" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#2f7fff" stop-opacity="0.4"/>
            </radialGradient>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="0.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <ellipse v-for="(r, i) in [18,28,38]" :key="i" cx="50" cy="35" :rx="r" :ry="r*0.62" fill="none" stroke="rgba(77,201,255,0.08)" stroke-dasharray="0.5 1"/>
          <circle v-if="!done" cx="50" cy="35" r="2" fill="none" stroke="#4dc9ff" stroke-width="0.2">
            <animate attributeName="r" from="2" to="42" dur="2.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite"/>
          </circle>
          <line v-for="(e, i) in graphEdges" :key="`e${i}`"
                :x1="graphNodes[e.a]?.x" :y1="(graphNodes[e.a]?.y||0)-15"
                :x2="graphNodes[e.b]?.x" :y2="(graphNodes[e.b]?.y||0)-15"
                stroke="#4dc9ff" stroke-width="0.15" stroke-opacity="0.4" class="edge-anim"/>
          <g v-for="n in graphNodes" :key="n.id" class="node-anim" :style="{ transformOrigin: `${n.x}% ${n.y-15}%` }">
            <circle v-if="n.t === '建筑节点'" :cx="n.x" :cy="n.y-15" :r="3.2" fill="url(#ctrGrad2)" opacity="0.4"/>
            <circle :cx="n.x" :cy="n.y-15" :r="n.t === '建筑节点' ? 2.2 : 1" :fill="NODE_COLORS[n.t]||'#4dc9ff'" filter="url(#glow2)" :opacity="n.t==='建筑节点'?1:0.85"/>
          </g>
          <template v-if="graphNodes.length">
            <text x="50" y="33"   text-anchor="middle" font-size="2.2" fill="white"   font-family="Noto Sans SC" font-weight="600">{{ (data.name||'建筑').slice(0,8) }}</text>
            <text x="50" y="36.5" text-anchor="middle" font-size="1.6" fill="#b8c8e6" font-family="JetBrains Mono">{{ data.code||'—' }}</text>
          </template>
        </svg>
      </div>

      <!-- 图例 -->
      <div class="gr-legend">
        <div v-for="[k,c] in Object.entries(NODE_COLORS)" :key="k" class="lg">
          <span class="dot" :style="{ background: c }"/>{{ k }}
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="form-actions" style="padding:16px 24px;margin-top:20px;border-top:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);border-radius:0 0 12px 12px;display:flex;justify-content:flex-end;align-items:center;gap:10px">
        <div style="font-size:12px;color:#8da3c8;margin-right:auto">
          <span v-if="done" style="color:var(--ok)">✓ 所有数据已成功融合至知识图谱</span>
          <span v-else>请勿关闭页面，构建过程中数据正在写入</span>
        </div>
        <button class="btn ghost" @click="$emit('prev')"><AppIcon name="chevron-left" :size="14"/> 返回修改</button>
        <button class="btn primary" @click="$emit('next')">查看资源包 <AppIcon name="chevron-right" :size="14"/></button>
      </div>
    </div>

    <!-- 右：引擎日志 -->
    <div class="gr-side">
      <h4><AppIcon name="scan" :size="14"/> 引擎日志</h4>
      <div class="gr-log" ref="logEl">
        <span v-for="(l, i) in logs" :key="i" class="ln">
          <span class="ts">{{ l.ts }}</span>
          <span :class="`lv-${l.lv}`">[{{ l.lv.toUpperCase() }}]</span>
          <template v-for="(seg, j) in splitMsg(l.msg)" :key="j">
            <span v-if="isTag(seg)" class="ent">{{ seg }}</span>
            <span v-else-if="isQuote(seg)" style="color:var(--brand-2)">{{ seg }}</span>
            <template v-else>{{ seg }}</template>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick, onMounted, computed } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import http from '../../api/http.js'
import { generateLogPool, getRandomLogForPhase } from './wizardLogGenerator.js'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update', 'next', 'prev'])

const progress   = ref(0)
const phase      = ref(0)
const done       = ref(false)
const stats      = ref({ nodes: 0, edges: 0, chunks: 0, docs: 0 })
const graphNodes = ref([])
const graphEdges = ref([])
const logs       = ref([])
const logEl      = ref(null)

const realGraph   = ref(null)
const realFlatNodes = ref([])
const fetchStatus = ref('loading') // 'loading' | 'success' | 'failed'

const PHASES = [
  { n: '解析子项数据',     d: '智能识别并抽取各已启用子系统台账实体及核心设备参数' },
  { n: '解析相关文件',     d: '提取并解析已上传附件文本，包含 OCR 与大模型语义切片' },
  { n: '解析淘汰设备',     d: '读取淘汰落后设备台账，对齐分析能效与更新指标' },
  { n: '知识图谱实时构建', d: '自动构建设备-子系统-建筑之间的多维图谱关联与拓扑' },
  { n: '能效对标规则自检', d: '对齐国家与地方能效定额标准，执行低碳规则链自检' },
]

const NODE_COLORS = { '建筑节点': '#4dc9ff', '一级节点': '#2bd9a8', '二级节点': '#a799ff', '文件节点': '#ff6b8a', 'AI节点': '#ffb547', '其他': '#ff8a47' }

// ── 真实接口拉取 ──
onMounted(async () => {
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
      const list = []
      function flatNode(n) {
        if (!n) return
        list.push(n)
        if (n.children && Array.isArray(n.children)) n.children.forEach(flatNode)
      }
      flatNode(graphData.nodes)
      realFlatNodes.value = list
      fetchStatus.value = 'success'
    } else {
      fetchStatus.value = 'failed'
    }
  } catch (e) {
    console.error('Fetch graph data during build error:', e)
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
  return { 
    docCount: 0, 
    docPages: 0, 
    chunks: 0, 
    entities: Math.max(10, stats.value.nodes), 
    edges: Math.max(9, stats.value.edges), 
    vectors: 0 
  }
}

const targetStats = computed(() => {
  if (fetchStatus.value === 'success' && realGraph.value) {
    return analyzeGraph(realGraph.value)
  }
  return getFallbackStats()
})

// ── 日志生成池 ──
const logPool = ref([[], [], [], [], []])
const logIndices = ref([0, 0, 0, 0, 0])

onMounted(() => {
  logPool.value = generateLogPool(props.data)
})

// ── 定时器驱动 ──
const t1 = setInterval(() => {
  if (done.value) return
  
  let nextProgress = progress.value
  if (nextProgress < 90) {
    nextProgress += 0.8
  } else if (nextProgress >= 90 && nextProgress < 99) {
    if (fetchStatus.value !== 'loading') {
      nextProgress += 2.0
    } else {
      if (nextProgress < 92) nextProgress += 0.1
    }
  } else {
    nextProgress = 100
  }
  
  if (nextProgress > 100) nextProgress = 100
  progress.value = nextProgress

  phase.value = Math.min(4, Math.floor(progress.value / 20))
  if (progress.value >= 100) {
    done.value = true
    clearInterval(t1)
    handleBuildFinish()
  }
}, 80)

const t2 = setInterval(() => {
  if (done.value) return
  const target = targetStats.value
  stats.value = {
    nodes:   Math.min(target.entities, stats.value.nodes   + Math.floor(Math.random() * 3 + 1)),
    edges:   Math.min(target.edges,    stats.value.edges   + Math.floor(Math.random() * 3 + 1)),
    chunks:  Math.min(target.chunks,   stats.value.chunks  + Math.floor(Math.random() * 3 + 1)),
    docs:    Math.min(target.docCount, stats.value.docs    + (Math.random() > 0.8 ? 1 : 0))
  }
}, 220)

// 节点生长
const t3 = setInterval(() => {
  if (done.value) return
  if (graphNodes.value.length < 60) {
    const a = Math.random() * Math.PI * 2
    const r = 6 + Math.random() * 32
    
    let t = '建筑节点'
    if (realFlatNodes.value.length > graphNodes.value.length) {
      const realNode = realFlatNodes.value[graphNodes.value.length]
      if (realNode && realNode.levelType) {
        t = NODE_COLORS[realNode.levelType] ? realNode.levelType : '其他'
      }
    } else if (graphNodes.value.length > 0) {
      const types = Object.keys(NODE_COLORS)
      t = types[1 + Math.floor(Math.random() * (types.length - 1))]
    }

    graphNodes.value = [...graphNodes.value, { id: graphNodes.value.length, x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r * 0.62, t }]
  }
  if (graphNodes.value.length >= 2 && graphEdges.value.length < 100) {
    const len = graphNodes.value.length
    const a = Math.floor(Math.random() * len)
    let b = Math.floor(Math.random() * len)
    while (b === a) b = Math.floor(Math.random() * len)
    graphEdges.value = [...graphEdges.value, { a, b }]
  }
}, 180)

// 日志流动
const t4 = setInterval(() => {
  if (done.value) return
  const currPhase = phase.value
  const pool = logPool.value[currPhase] || []
  const idx = logIndices.value[currPhase]

  if (idx < pool.length) {
    const ev = pool[idx]
    const ts = new Date().toTimeString().slice(0, 8)
    logs.value = [...logs.value, { ts, ...ev }].slice(-50)
    logIndices.value[currPhase]++
    nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
  } else {
    const ts = new Date().toTimeString().slice(0, 8)
    const randomLog = getRandomLogForPhase(currPhase)
    if (randomLog) {
      logs.value = [...logs.value, { ts, ...randomLog }].slice(-50)
      nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
    }
  }
}, 500)

onUnmounted(() => { clearInterval(t1); clearInterval(t2); clearInterval(t3); clearInterval(t4) })

function handleBuildFinish() {
  const target = targetStats.value
  stats.value = {
    nodes: target.entities,
    edges: target.edges,
    chunks: target.chunks,
    docs: target.docCount
  }

  emit('update', {
    ...props.data,
    graphStats: target,
    graphSource: realGraph.value
  })
}

function splitMsg(s) {
  return s.split(/(#[\u4e00-\u9fa5A-Za-z0-9_/]+|"[^"]+")/g)
}

function isTag(seg) {
  return typeof seg === 'string' && seg.startsWith('#')
}

function isQuote(seg) {
  if (typeof seg !== 'string') return false
  return seg.startsWith("'") || seg.startsWith('"') || seg.startsWith('“') || seg.startsWith('”')
}
</script>
