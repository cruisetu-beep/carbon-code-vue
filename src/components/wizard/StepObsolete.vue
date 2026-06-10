<template>
  <div class="step-obsolete">
    <div class="section-head">
      <div class="ico"><AppIcon name="zap" :size="18"/></div>
      <div>
        <h3>低效与淘汰设备台账</h3>
        <div class="desc">记录建筑内仍在运行或待处理的老旧、低效、需淘汰设备</div>
      </div>
      <button class="btn primary" style="margin-left:auto" @click="showAdd = true" v-if="!showAdd">
        <AppIcon name="plus" :size="14"/> 录入设备
      </button>
    </div>

    <!-- 添加设备表单 -->
    <div v-if="showAdd" class="add-form card glow float-in">
      <div class="form-title">录入新设备</div>
      
      <!-- 第一部分：铭牌与基础信息 -->
      <div class="form-part">
        <div class="part-title">1. 基础信息与铭牌识别</div>
        
        <div class="field" style="margin-bottom: 16px;">
          <div class="upload-zone nameplate-zone" @click="$refs.nameplateInput.click()">
            <AppIcon name="scan" :size="20" stroke="var(--brand)"/>
            <div>
              <div class="upload-text" style="margin-top:0">上传设备铭牌照片</div>
              <div class="upload-sub">支持 JPG / PNG，上传后 AI 将尝试自动提取字段</div>
            </div>
            <input type="file" ref="nameplateInput" hidden accept="image/*" @change="e => handleFileChange(e, 'nameplate')" />
          </div>
          <div class="file-list" v-if="newDev.files.nameplate && newDev.files.nameplate.length > 0">
            <div v-for="(f, i) in newDev.files.nameplate" :key="i" class="file-item">
              <AppIcon name="doc" :size="14"/>
              <span class="file-name">{{ f.name }}</span>
              <span class="file-size">{{ (f.size / 1024 / 1024).toFixed(2) }} MB</span>
              <button class="icon-btn del-file" @click.stop="newDev.files.nameplate.splice(i, 1)" title="删除文件">
                <AppIcon name="trash" :size="12"/>
              </button>
            </div>
          </div>
        </div>

        <div class="grid-3">
          <div class="field">
            <label class="field-label">设备编号 <span class="req">*</span></label>
            <input class="input" v-model="newDev.code" placeholder="如 DEV-MTR-2008-01" />
          </div>
          <div class="field">
            <label class="field-label">设备名称 <span class="req">*</span></label>
            <input class="input" v-model="newDev.name" placeholder="如 地下泵房1#给水泵电机" />
          </div>
          <div class="field">
            <label class="field-label">一级类型</label>
            <select class="select" v-model="newDev.typeK">
              <option value="motor">电动机</option>
              <option value="fan">风机</option>
              <option value="pump">泵</option>
              <option value="transformer">变压器</option>
              <option value="boiler">工业锅炉</option>
              <option value="compressor">压缩机</option>
              <option value="chiller">制冷设备</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">规格型号</label>
            <input class="input" v-model="newDev.model" placeholder="选填，如 Y2-200L-4" />
          </div>
          <div class="field">
            <label class="field-label">投运年份</label>
            <input class="input" type="number" v-model="newDev.year" placeholder="YYYY" />
          </div>
          <div class="field">
            <label class="field-label">判定结果</label>
            <select class="select" v-model="newDev.status">
              <option value="pending">待判定</option>
              <option value="low_eff">低效运行 (建议改造)</option>
              <option value="phaseout">限期淘汰 (已超限值)</option>
              <option value="danger">强制淘汰 (高耗能落后)</option>
            </select>
          </div>
          <div class="field" style="grid-column: span 3">
            <label class="field-label">判定依据 / 备注</label>
            <input class="input" v-model="newDev.reason" placeholder="如：此型号在国家能效标准中已被列入强制淘汰目录..." />
          </div>
        </div>
      </div>

      <!-- 第二部分：补充资料 -->
      <div class="form-part" style="margin-top: 24px; border-top: 1px dashed var(--line); padding-top: 20px;">
        <div class="part-title">2. 补充文档资料 (选填)</div>
        <div class="doc-upload-grid">
          <div v-for="cat in DOC_CATS" :key="cat.k" class="doc-upload-item">
            <div class="doc-cat-head">
              <AppIcon :name="cat.ico" :size="16" stroke="var(--text-2)"/>
              <span class="doc-cat-name">{{ cat.n }}</span>
              <button class="btn ghost btn-sm" @click="$refs[cat.k][0].click()">上传</button>
            </div>
            <input type="file" :ref="cat.k" hidden multiple @change="e => handleFileChange(e, cat.k)" />
            
            <div class="file-list sm" v-if="newDev.files[cat.k] && newDev.files[cat.k].length > 0">
              <div v-for="(f, i) in newDev.files[cat.k]" :key="i" class="file-item sm">
                <span class="file-name">{{ f.name }}</span>
                <button class="icon-btn del-file" @click.stop="newDev.files[cat.k].splice(i, 1)"><AppIcon name="trash" :size="10"/></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn ghost" @click="showAdd = false">取消</button>
        <button class="btn primary" @click="saveDev">保存至台账</button>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="dev-list">
      <div v-for="(d, i) in devices" :key="i" class="dev-tile float-in" :style="{'animation-delay': `${i * 0.05}s`}">
        <div :class="['status-bar', d.status]"></div>
        <div class="dev-head">
          <div class="dev-thumb">
            <AppIcon :name="getIcon(d.typeK)" :size="24" :stroke="getStatusColor(d.status)"/>
          </div>
          <div class="dev-info">
            <div class="code">{{ d.code }}</div>
            <div class="name">{{ d.name }}</div>
            <div class="tags">
              <span class="tag">{{ getTypeLabel(d.typeK) }}</span>
              <span class="tag" v-if="d.model">{{ d.model }}</span>
              <span class="tag" v-if="d.year">{{ d.year }}年</span>
            </div>
          </div>
          <button class="icon-btn del-btn" @click="removeDev(i)" title="删除">
            <AppIcon name="trash" :size="14"/>
          </button>
        </div>
        <div class="reason" v-if="d.reason">
          <AppIcon name="info" :size="12" style="flex-shrink:0; margin-top:2px;" />
          <div>{{ d.reason }}</div>
        </div>
      </div>

      <div v-if="devices.length === 0 && !showAdd" class="empty-state float-in">
        <div class="empty-icon"><AppIcon name="cube" :size="32"/></div>
        <div>建筑内暂无记录淘汰或低效设备</div>
        <div style="font-size:12px; color:var(--text-3); margin-top:4px;">点击右上角录入需要追踪和改造的设备清单</div>
      </div>
    </div>

    <div class="actions" style="margin-top:32px; display: flex; justify-content: space-between;">
      <button class="btn ghost" @click="$emit('prev')">
        <AppIcon name="chevron-left" :size="14"/> 上一步
      </button>
      <button class="btn primary" @click="handleNext">
        完成台账并构建图谱 <AppIcon name="chevron-right" :size="14"/>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '../shared/AppIcon.vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update', 'next', 'prev'])

const showAdd = ref(false)
const devices = ref(props.data.obsoleteDevices || [])

const DOC_CATS = [
  { k: 'scene', n: '现场照片', ico: 'eye' },
  { k: 'manual', n: '使用说明书', ico: 'doc' },
  { k: 'archive', n: '设备档案', ico: 'database' },
  { k: 'maintain', n: '维保记录', ico: 'settings' },
  { k: 'report', n: '检测报告', ico: 'scan' }
]

const initDev = () => ({
  code: '', name: '', typeK: 'motor', model: '', year: new Date().getFullYear(), status: 'pending', reason: '', files: {}
})
const newDev = ref(initDev())

const handleFileChange = (e, cat) => {
  const files = Array.from(e.target.files)
  if (!newDev.value.files[cat]) newDev.value.files[cat] = []
  newDev.value.files[cat].push(...files)
  e.target.value = '' // reset input
}

const saveDev = () => {
  if (!newDev.value.name || !newDev.value.code) {
    alert('请填写设备编号和名称！');
    return;
  }
  devices.value.push({ ...newDev.value })
  newDev.value = initDev()
  showAdd.value = false
  sync()
}

const removeDev = (idx) => {
  devices.value.splice(idx, 1)
  sync()
}

const sync = () => {
  emit('update', { ...props.data, obsoleteDevices: devices.value })
}

const handleNext = () => {
  sync()
  emit('next')
}

const getIcon = (k) => {
  const map = {
    motor: 'cpu', fan: 'fan', pump: 'cube', transformer: 'zap',
    boiler: 'fire', compressor: 'cube', chiller: 'sun', other: 'cube'
  }
  return map[k] || 'cube'
}

const getTypeLabel = (k) => {
  const map = {
    motor: '电动机', fan: '风机', pump: '泵', transformer: '变压器',
    boiler: '工业锅炉', compressor: '压缩机', chiller: '制冷设备', other: '其他'
  }
  return map[k] || '其他'
}

const getStatusColor = (status) => {
  if (status === 'danger' || status === 'phaseout') return '#e0394f';
  if (status === 'low_eff') return '#ea8c2e';
  return '#6a7da3';
}
</script>

<style scoped>
.step-obsolete {
  animation: float-in 0.4s ease both;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--line);
  padding: 24px;
}
.section-head {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 16px; margin-bottom: 24px;
  border-bottom: 1px dashed var(--line);
}
.section-head .ico {
  width: 36px; height: 36px; border-radius: 8px;
  background: linear-gradient(135deg, #fff3f5, #fce8ec);
  color: #e0394f;
  display: grid; place-items: center;
}
.section-head h3 { margin: 0; font-size: 16px; color: var(--text-0); }
.section-head .desc { font-size: 12px; color: var(--text-2); margin-top: 2px; }

/* ─── 表单 ─── */
.add-form {
  padding: 24px; margin-bottom: 24px;
  background: #fdfdfe; border: 1px solid var(--brand); border-radius: 12px;
  box-shadow: 0 4px 16px rgba(47,127,255,0.08);
}
.form-title { font-size: 14px; font-weight: 600; color: var(--brand); margin-bottom: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; color: var(--text-2); font-weight: 500; }
.req { color: var(--danger); }
.input, .select {
  padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;
  background: #f9fbff; font-size: 13px; color: var(--text-1); outline: none; transition: all 0.2s;
  font-family: inherit;
}
.input:focus, .select:focus { border-color: var(--brand); background: #fff; box-shadow: 0 0 0 3px rgba(47, 201, 255, 0.1); }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

.part-title { font-size: 13px; font-weight: 600; color: var(--text-0); margin-bottom: 12px; display:flex; align-items:center; gap:8px; }

/* ─── 上传控件 ─── */
.upload-zone {
  border: 1px dashed var(--brand); border-radius: 8px;
  background: rgba(47, 127, 255, 0.04);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px 0; cursor: pointer; transition: all 0.2s;
  text-align: center;
}
.nameplate-zone { flex-direction: row; gap: 16px; padding: 16px; justify-content: flex-start; text-align: left; }
.upload-zone:hover { background: rgba(47, 127, 255, 0.08); border-color: var(--brand-2); }
.upload-text { font-size: 13px; color: var(--brand); font-weight: 500; }
.upload-sub { font-size: 11px; color: var(--text-3); margin-top: 4px; }
.file-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.file-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: white; border: 1px solid var(--line); border-radius: 6px;
  font-size: 12px; color: var(--text-1);
}
.file-item.sm { padding: 4px 8px; font-size: 11px; background: transparent; border-color: transparent; }
.file-item.sm:hover { background: #f3f6fb; }
.file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-size { color: var(--text-3); font-family: "JetBrains Mono", monospace; }
.del-file { color: var(--danger); }

/* ─── 补充文档分类 ─── */
.doc-upload-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
}
.doc-upload-item {
  background: #f9fbff; border: 1px solid var(--line); border-radius: 8px; padding: 12px;
}
.doc-cat-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.doc-cat-name { font-size: 12px; font-weight: 500; color: var(--text-1); flex: 1; }
.btn-sm { padding: 4px 8px; font-size: 11px; }

/* ─── 列表 ─── */
.dev-list {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;
}
.dev-tile {
  background: white; border: 1px solid var(--line); border-radius: 10px;
  padding: 16px; position: relative; overflow: hidden;
  box-shadow: 0 2px 8px rgba(60,110,200,0.02);
  transition: all 0.2s;
}
.dev-tile:hover {
  border-color: var(--line-strong); box-shadow: 0 6px 16px rgba(60,110,200,0.06); transform: translateY(-2px);
}
.status-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
}
.status-bar.pending { background: #d97706; }
.status-bar.low_eff { background: #ea8c2e; }
.status-bar.phaseout { background: #e0394f; }
.status-bar.danger { background: #cf3147; }

.dev-head { display: flex; gap: 12px; align-items: flex-start; }
.dev-thumb {
  width: 48px; height: 48px; border-radius: 8px;
  background: #f3f6fb; display: grid; place-items: center; color: var(--text-2);
}
.dev-info { flex: 1; min-width: 0; }
.code { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--text-2); }
.name { font-size: 14px; font-weight: 500; color: var(--text-0); margin-top: 2px; line-height: 1.4; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tag {
  font-size: 11px; color: var(--text-1); background: #f3f6fb;
  padding: 2px 6px; border-radius: 4px; border: 1px solid var(--line);
}
.icon-btn {
  background: none; border: none; cursor: pointer; color: var(--text-3);
  padding: 4px; border-radius: 4px; transition: all 0.2s;
}
.icon-btn:hover { background: #ffeaea; color: var(--danger); }

.reason {
  margin-top: 12px; padding: 8px 10px; border-radius: 6px;
  background: #fff8f8; color: #c12a3f; font-size: 12px;
  display: flex; gap: 6px; align-items: flex-start; line-height: 1.4;
  border: 1px solid rgba(224,57,79,0.1);
}

.empty-state {
  grid-column: 1 / -1; text-align: center; padding: 48px 0; color: var(--text-2);
  border: 1px dashed var(--line-strong); border-radius: 12px; background: #fdfdfe;
}
.empty-icon { color: var(--text-3); margin-bottom: 8px; }

@keyframes float-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; font-size: 13px; font-weight: 500;
  border-radius: 6px; border: 1px solid var(--line-strong);
  background: white; color: var(--text-0);
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.btn:hover { background: rgba(47,127,255,0.06); border-color: var(--brand); color: var(--brand); }
.btn.primary {
  background: linear-gradient(135deg, #1f6feb, #2f7fff);
  border: 1px solid transparent; color: #fff;
}
.btn.primary:hover { background: linear-gradient(135deg, #1860d4, #2974f0); color: #fff; }
.btn.ghost { background: transparent; border-color: var(--line); }
</style>
