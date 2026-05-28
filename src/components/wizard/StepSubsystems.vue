<template>
  <div class="step-subs float-in">
    <div class="subs-panel">
      <div class="section-head" style="padding-bottom:16px;margin-bottom:20px;border-bottom:1px dashed var(--line);display:flex;gap:10px;align-items:center">
        <div style="width:32px;height:32px;display:grid;place-items:center;background:linear-gradient(135deg,#eaf2ff,#d8e4fb);border-radius:8px;color:var(--brand)">
          <AppIcon name="graph" :size="18"/>
        </div>
        <div>
          <h3 style="margin:0;font-size:15px;font-weight:600">子项资源配置</h3>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px">
            选择本建筑涉及的子项，每个子项作为图谱中"建筑实体"的子节点存在 ·
            已启用 <strong style="color:var(--brand)">{{ enabledCount }} / 5</strong>
          </div>
        </div>
      </div>

      <!-- 子项选项卡 -->
      <div class="subs-tabs">
        <div v-for="s in SUBSYSTEMS" :key="s.k"
             :class="['sub-tab', active === s.k && 'active', subs[s.k]?.enabled && 'enabled']"
             :style="{ '--c': s.color }"
             @click="active = s.k">
          <div class="top">
            <div class="ic"><AppIcon :name="s.icon" :size="16"/></div>
            <div class="toggle" @click.stop="toggleEnable(s.k)"/>
          </div>
          <div class="n">{{ s.n }}</div>
          <div class="d">{{ s.desc }}</div>
        </div>
      </div>

      <!-- 当前子项详情 -->
      <div v-if="activeSub" :class="['sub-detail', !subs[active]?.enabled && 'disabled']" :style="{ '--c': activeSub.color }">
        <div class="sub-detail-head">
          <div class="ic"><AppIcon :name="activeSub.icon" :size="20"/></div>
          <div style="flex:1">
            <h4>{{ activeSub.n }}</h4>
            <div class="d">{{ activeSub.desc }}</div>
          </div>
          <button v-if="!subs[active]?.enabled" class="btn primary" style="padding:8px 16px;font-size:12px" @click="toggleEnable(active)">
            <AppIcon name="plus" :size="12"/> 启用此子项
          </button>
          <span v-else class="badge ok"><AppIcon name="check" :size="11"/> 已启用</span>
        </div>

        <div class="sub-section-title">基础参数</div>
        <div class="grid-2">
          <div v-for="f in activeSub.fields" :key="f.k" class="field">
            <label class="field-label">{{ f.n }}<span v-if="f.req" class="req">*</span></label>
            <select v-if="f.t === 'select'" class="select"
                    :value="subs[active]?.[f.k] || ''"
                    @change="setField(active, f.k, $event.target.value)">
              <option value="">请选择</option>
              <option v-for="o in f.opts" :key="o">{{ o }}</option>
            </select>
            <input v-else class="input mono"
                   :type="f.t" :placeholder="f.ph"
                   :value="subs[active]?.[f.k] || ''"
                   @input="setField(active, f.k, $event.target.value)"/>
          </div>
        </div>

        <div class="sub-section-title">数据接口</div>
        <div class="field">
          <label class="field-label">实时数据接入</label>
          <div style="display:grid;grid-template-columns:1fr 1fr 140px;gap:10px">
            <input class="input mono" placeholder="API Endpoint / IP:Port"
                   :value="subs[active]?.endpoint || ''"
                   @input="setField(active, 'endpoint', $event.target.value)"/>
            <input class="input mono" placeholder="设备点位前缀"
                   :value="subs[active]?.prefix || ''"
                   @input="setField(active, 'prefix', $event.target.value)"/>
            <button class="btn" style="justify-content:center">
              <AppIcon name="zap" :size="12"/> 测试连接
            </button>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="form-actions" style="padding:16px 24px;margin-top:20px;border-top:1px solid var(--line);background:linear-gradient(180deg,#f8faff,#f3f6fb);border-radius:0 0 12px 12px;display:flex;justify-content:flex-end;align-items:center;gap:10px">
        <div style="font-size:12px;color:var(--text-2);margin-right:auto">
          <template v-if="enabledCount === 0">未启用任何子项也可继续，但可能影响碳效计算精度</template>
          <template v-else>{{ enabledCount }} 个子项将被建模到知识图谱中</template>
        </div>
        <button class="btn ghost" @click="$emit('prev')"><AppIcon name="chevron-left" :size="14"/> 上一步</button>
        <button class="btn primary" @click="$emit('next')">
          开始构建知识图谱 <AppIcon name="sparkles" :size="14"/>
        </button>
      </div>
    </div>

    <!-- 右：图谱预览 + AI 推理 -->
    <div class="ai-side" style="position:sticky;top:80px">
      <div class="ai-side-head">
        <div class="ai-orb"/>
        <div>
          <h4>图谱建模预览</h4>
          <div class="sub mono">本建筑将生成的图谱拓扑</div>
        </div>
      </div>

      <!-- 迷你图谱 SVG -->
      <svg viewBox="0 0 320 200" style="width:100%;height:200px;margin-bottom:8px">
        <defs>
          <radialGradient id="mg-center">
            <stop offset="0%" stop-color="#4dc9ff" stop-opacity="1"/>
            <stop offset="100%" stop-color="#2f7fff" stop-opacity="0.6"/>
          </radialGradient>
        </defs>
        <circle cx="160" cy="100" r="80" fill="none" stroke="rgba(77,201,255,0.1)" stroke-dasharray="2 4"/>
        <g v-for="(s, i) in enabledSubs" :key="s.k">
          <line x1="160" y1="100" :x2="subX(i)" :y2="subY(i)" :stroke="s.color" stroke-opacity="0.4" stroke-width="1"/>
          <circle :cx="subX(i)" :cy="subY(i)" r="14" :fill="`color-mix(in srgb, ${s.color} 20%, transparent)`" :stroke="s.color" stroke-width="1.2"/>
          <text :x="subX(i)" :y="subY(i)+3" text-anchor="middle" font-size="9" :fill="s.color" font-family="Noto Sans SC">{{ s.n }}</text>
        </g>
        <circle cx="160" cy="100" r="22" fill="url(#mg-center)" stroke="#4dc9ff" stroke-width="1.5"/>
        <text x="160" y="98"  text-anchor="middle" font-size="9"  fill="white"  font-weight="600">{{ (data.name || '建筑').slice(0, 6) }}</text>
        <text x="160" y="110" text-anchor="middle" font-size="7"  fill="#eaf2ff" font-family="JetBrains Mono">{{ data.code || '—' }}</text>
      </svg>

      <!-- 图谱统计 -->
      <div style="padding:10px 0;display:flex;gap:8px;margin-bottom:12px">
        <div style="flex:1;padding:10px;background:#f5f9ff;border:1px solid var(--line);border-radius:8px;text-align:center">
          <div style="font-family:Orbitron;font-size:18px;color:var(--brand)">{{ estNodes }}</div>
          <div style="font-size:10px;color:var(--text-2)">节点</div>
        </div>
        <div style="flex:1;padding:10px;background:#f5f9ff;border:1px solid var(--line);border-radius:8px;text-align:center">
          <div style="font-family:Orbitron;font-size:18px;color:#6a4eff">{{ estEdges }}</div>
          <div style="font-size:10px;color:var(--text-2)">关系</div>
        </div>
      </div>

      <div class="ai-thoughts" style="margin-top:12px">
        <div class="thought ok">
          <span class="label">SCHEMA.root</span>
          根节点：建筑实体 "{{ data.name || '未命名' }}"
        </div>
        <div v-for="(s, i) in enabledSubs" :key="s.k"
             class="thought"
             :style="{ borderLeftColor: s.color, animationDelay: `${i * 0.06}s` }">
          <span class="label">SCHEMA.sub:{{ s.k }}</span>
          子图 #{{ s.n }} 将关联设备节点、运行数据与改造记录
        </div>
        <div v-if="!enabledSubs.length" style="padding:20px 12px;font-size:11px;color:var(--text-3);text-align:center">
          启用子项后，<br/>知识图谱将动态扩展
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import { SUBSYSTEMS } from '../../data/constants.js'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit  = defineEmits(['update', 'next', 'prev'])

const active = ref('sub_meter')

const subs         = computed(() => props.data.subs || {})
const activeSub    = computed(() => SUBSYSTEMS.find(s => s.k === active.value))
const enabledSubs  = computed(() => SUBSYSTEMS.filter(s => subs.value[s.k]?.enabled))
const enabledCount = computed(() => enabledSubs.value.length)
const estNodes     = computed(() => enabledCount.value * 4 + 8)
const estEdges     = computed(() => enabledCount.value * 6 + 12)

function setSub(k, v) {
  emit('update', { ...props.data, subs: { ...(props.data.subs || {}), [k]: v } })
}
function toggleEnable(k) {
  const s = subs.value[k] || {}
  setSub(k, { ...s, enabled: !s.enabled })
}
function setField(k, fk, v) {
  const s = subs.value[k] || { enabled: true }
  setSub(k, { ...s, [fk]: v })
}

// SVG 子节点坐标
function subX(i) {
  const n = enabledSubs.value.length
  const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2
  return 160 + Math.cos(angle) * 75
}
function subY(i) {
  const n = enabledSubs.value.length
  const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2
  return 100 + Math.sin(angle) * 75
}
</script>
