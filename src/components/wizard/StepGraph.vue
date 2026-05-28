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
        <div class="gr-stat"><div class="l"><AppIcon name="database" :size="10"/> 向量数</div><div class="v green">{{ stats.vectors.toLocaleString() }}</div></div>
        <div class="gr-stat"><div class="l"><AppIcon name="scan" :size="10"/> 规则链</div><div class="v warn">{{ stats.rules }}</div></div>
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
            <circle v-if="n.t === 'building'" :cx="n.x" :cy="n.y-15" :r="3.2" fill="url(#ctrGrad2)" opacity="0.4"/>
            <circle :cx="n.x" :cy="n.y-15" :r="n.t === 'building' ? 2.2 : 1" :fill="NODE_COLORS[n.t]||'#4dc9ff'" filter="url(#glow2)" :opacity="n.t==='building'?1:0.85"/>
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
          <span class="dot" :style="{ background: c }"/>{{ NODE_LABELS[k] }}
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
            <span v-if="seg.t === 'tag'" class="ent">{{ seg.v }}</span>
            <span v-else-if="seg.t === 'quote'" style="color:var(--brand-2)">{{ seg.v }}</span>
            <template v-else>{{ seg.v }}</template>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'
import AppIcon from '../shared/AppIcon.vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['next', 'prev'])

const progress   = ref(0)
const phase      = ref(0)
const done       = ref(false)
const stats      = ref({ nodes: 0, edges: 0, vectors: 0, rules: 0 })
const graphNodes = ref([])
const graphEdges = ref([])
const logs       = ref([])
const logEl      = ref(null)

const PHASES = [
  { n: '实体抽取与去重',   d: '从所有切片中识别实体，与现有图谱节点合并去重' },
  { n: '关系推断与连边',   d: '基于上下文推断设备-系统-建筑的层级关系' },
  { n: '向量化与索引',     d: '对所有切片生成 1536 维语义向量，写入向量库' },
  { n: '规则与知识链接',   d: '链接到考核标准、能耗基准、节能工艺路径' },
  { n: '质量校验与发布',   d: '图谱一致性检查，发布为可查询版本' },
]

const NODE_COLORS = { building: '#4dc9ff', equip: '#a799ff', subsys: '#2bd9a8', metric: '#ffb547', standard: '#ff8a47', doc: '#ff6b8a' }
const NODE_LABELS = { building: '建筑', equip: '设备', subsys: '子系统', metric: '指标', standard: '标准', doc: '文档' }

// 进度动画
const t1 = setInterval(() => {
  if (done.value) return
  progress.value = Math.min(100, progress.value + 0.8)
  phase.value = Math.min(4, Math.floor(progress.value / 20))
  if (progress.value >= 100) { done.value = true; clearInterval(t1) }
}, 80)

// 统计增长
const t2 = setInterval(() => {
  if (done.value) return
  stats.value = {
    nodes:   Math.min(186,  stats.value.nodes   + Math.floor(Math.random() * 3 + 1)),
    edges:   Math.min(412,  stats.value.edges   + Math.floor(Math.random() * 5 + 2)),
    vectors: Math.min(2840, stats.value.vectors + Math.floor(Math.random() * 40 + 10)),
    rules:   Math.min(38,   stats.value.rules   + (Math.random() < 0.3 ? 1 : 0)),
  }
}, 220)

// 节点生长
const t3 = setInterval(() => {
  if (done.value) return
  if (graphNodes.value.length < 60) {
    const a = Math.random() * Math.PI * 2
    const r = 6 + Math.random() * 32
    const types = ['building', 'equip', 'subsys', 'metric', 'standard', 'doc']
    const t = graphNodes.value.length === 0 ? 'building' : types[1 + Math.floor(Math.random() * 5)]
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

// 日志
const LOG_POOLS = [
  [{ lv: 'info', msg: '节点合并：#冷水机组 检测到 3 个候选，执行去重' }, { lv: 'info', msg: '同义词消解：#冰机 → 标准词 #离心式冷水机组' }],
  [{ lv: 'info', msg: '推断关系 (设备)-[属于]->(子系统:空调)' }, { lv: 'ok', msg: '新增关系边 ×12' }],
  [{ lv: 'info', msg: 'Embedding 模型：bge-m3 · 维度 1536' }, { lv: 'ok', msg: '索引重建完成，召回延迟 P99 < 80ms' }],
  [{ lv: 'info', msg: '链接到 #GB/T51161-2016 #能耗限额' }, { lv: 'info', msg: '生成可解释规则 IF (#冷机COP<5.0) THEN #建议改造' }],
  [{ lv: 'ok', msg: '一致性校验通过：节点 186 · 关系 412' }, { lv: 'ok', msg: '图谱版本已发布' }],
]
const t4 = setInterval(() => {
  if (done.value) return
  const ts   = new Date().toTimeString().slice(0, 8)
  const pool = LOG_POOLS[Math.min(phase.value, 4)]
  const ev   = pool[Math.floor(Math.random() * pool.length)]
  logs.value = [...logs.value, { ts, ...ev }].slice(-50)
  nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
}, 480)

onUnmounted(() => { clearInterval(t1); clearInterval(t2); clearInterval(t3); clearInterval(t4) })

function splitMsg(s) {
  return s.split(/(#[\u4e00-\u9fa5A-Za-z0-9_/]+|"[^"]+")/g)
}
</script>
