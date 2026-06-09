<template>
  <div class="dv-panel">
    <PanelHeader icon="doc" :color="DV_COLORS.doc"
                 :type="typeLabel" :name="nodeName"/>

    <template v-if="files.length">
      <div class="dv-panel-section-title">文件（{{ files.length }}）</div>
      <div class="doc-file-grid">
        <div v-for="f in files" :key="f.id" class="doc-file-card">
          <!-- 文件图标区 -->
          <div class="doc-file-icon-wrap" @click="openFile(f)" :title="f.name">
            <div class="doc-file-icon" :class="iconClass(f)">
              <svg v-if="isPdf(f)" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="13" height="17" rx="2" fill="currentColor" opacity="0.15"/>
                <path d="M3 4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M14 2v5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <text x="12" y="17" text-anchor="middle" font-size="4.5" font-weight="700" fill="currentColor" font-family="sans-serif">PDF</text>
              </svg>
              <svg v-else-if="isImage(f)" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M3 16l5-5 4 4 3-3 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
              </svg>
              <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M14 2v5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="doc-file-ext">{{ extOf(f) }}</div>
          </div>
          <!-- 文件名 -->
          <div class="doc-file-name" :title="f.name">{{ f.name }}</div>
          <!-- 文件信息 -->
          <div class="doc-file-meta">{{ f.size ? f.size + ' KB' : '' }}{{ f.uploadTime ? ' · ' + f.uploadTime.slice(0,10) : '' }}</div>
          <!-- 操作按钮 -->
          <div class="doc-file-actions">
            <button class="doc-btn-preview" @click="openFile(f)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
              预览
            </button>
            <button class="doc-btn-ai" disabled>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>
              AI 解析
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="doc-file-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M3 4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z" stroke="#8da3c8" stroke-width="1.5" fill="none"/></svg>
      <span>暂无文件</span>
    </div>

    <!-- AI 智能解析 -->
    <template v-if="aiFullText">
      <div class="bp-ai-wrap" style="margin-top: 12px;">
        <div class="bp-ai-header">
          <AppIcon name="sparkles" :size="11" stroke="#4dc9ff"/>
          <span>AI 智能解析</span>
          <span v-if="aiTyping" class="bp-ai-progress">{{ aiTypingProgress }}%</span>
        </div>
        <div class="bp-ai-body" ref="aiBodyEl">
          <span v-html="aiDisplayHtml"/>
          <span v-if="aiTyping" class="bp-ai-cursor">|</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import AppIcon      from '../../shared/AppIcon.vue'
import PanelHeader   from '../shared/PanelHeader.vue'
import { DV_COLORS } from '../../../data/constants.js'

const props = defineProps({
  node:   { type: Object, required: true },
  detail: { type: Object, required: true },
})
defineEmits(['selectNode', 'hoverChunk'])

// 节点本身（可能是文件节点 or 文档二级节点）
const rawNode = computed(() => {
  // 如果 node.ref 存在说明走了 buildGraph 适配层
  return props.node.ref || props.node
})

const nodeName = computed(() => rawNode.value?.name || '文档')

const typeLabel = computed(() => {
  if (rawNode.value?.levelType === '文件节点') return '文件'
  return '文档'
})

// 文件列表：优先从 children 取，兜底从 data 数组取
const files = computed(() => {
  const n = rawNode.value
  if (!n) return []

  // 情况1：二级文档节点，children 是文件节点数组
  if (Array.isArray(n.children) && n.children.length) {
    return n.children.map(c => ({
      id:         c.id,
      name:       c.data?.fileName || c.name || '未知文件',
      objectName: c.data?.objectName || '',
      bucketName: c.data?.bucketName || 'report',
      contentType:c.data?.contentType || '',
      size:       c.data?.fileSize || '',
      uploadTime: c.data?.uploadTime || '',
    }))
  }

  // 情况2：data 是数组（直接存文件信息）
  if (Array.isArray(n.data)) {
    return n.data.map((f, i) => ({
      id:         String(i),
      name:       f.fileName || f.objectName || '未知文件',
      objectName: f.objectName || '',
      bucketName: f.bucketName || 'report',
      contentType:f.contentType || '',
      size:       f.fileSize || '',
      uploadTime: f.uploadTime || '',
    }))
  }

  // 情况3：单个文件节点（levelType === 文件节点）
  if (n.data?.objectName) {
    return [{
      id:         n.id,
      name:       n.data.fileName || n.name || '未知文件',
      objectName: n.data.objectName,
      bucketName: n.data.bucketName || 'report',
      contentType:n.data.contentType || '',
      size:       n.data.fileSize || '',
      uploadTime: n.data.uploadTime || '',
    }]
  }

  return []
})

// ── AI 智能解析（动态查找 children 中的 aiSummary）────────────
const aiFullText = computed(() => {
  const n = rawNode.value
  if (!n) return ''
  const aiNode = (n.children || []).find(c => c.type === 'aiSummary')
  return aiNode?.data || ''
})

function renderMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

const aiDisplayText    = ref('')
const aiTyping         = ref(false)
const aiTypingProgress = ref(0)
const aiBodyEl         = ref(null)
let   aiTimer          = null

function startAiTyping(text) {
  clearInterval(aiTimer)
  aiDisplayText.value = ''
  aiTyping.value = true
  aiTypingProgress.value = 0
  let i = 0
  aiTimer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(aiTimer)
      aiTyping.value = false
      aiTypingProgress.value = 100
      return
    }
    const step = text.length > 500 ? 3 : 1
    aiDisplayText.value += text.slice(i, i + step)
    i += step
    aiTypingProgress.value = Math.min(99, Math.round(i / text.length * 100))
    if (aiBodyEl.value) aiBodyEl.value.scrollTop = aiBodyEl.value.scrollHeight
  }, 30)
}

const aiDisplayHtml = computed(() => renderMd(aiDisplayText.value))

watch(aiFullText, (val) => { if (val) startAiTyping(val) }, { immediate: true })
onBeforeUnmount(() => clearInterval(aiTimer))

  const name = f.name || ''
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toUpperCase() : 'FILE'
}
function isPdf(f)   { return f.contentType?.includes('pdf')   || f.name?.toLowerCase().endsWith('.pdf') }
function isImage(f) { return f.contentType?.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name) }

function iconClass(f) {
  if (isPdf(f))   return 'doc-file-icon-pdf'
  if (isImage(f)) return 'doc-file-icon-img'
  return 'doc-file-icon-default'
}

function openFile(f) {
  if (!f.objectName) return
  const url = `https://www.ttbems.com:14440/HPManage/api/public/oosFile?bucketName=${encodeURIComponent(f.bucketName || 'report')}&objectName=${encodeURIComponent(f.objectName)}`
  window.open(url, '_blank')
}
</script>

<style scoped>
.doc-file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 4px 0 8px;
}
.doc-file-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px;
  padding: 12px 8px 10px;
  border-radius: 10px;
  background: rgba(255,255,255,0.6);
  border: 1px solid var(--line);
  cursor: default;
  transition: background 0.15s, border-color 0.15s;
}
.doc-file-name {
  font-size: 11px; color: var(--text-0); font-weight: 500;
  text-align: center; line-height: 1.4;
  word-break: break-all;
  width: 100%;
  height: 2.8em;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.doc-file-card:hover {
  background: rgba(77,201,255,0.06);
  border-color: rgba(77,201,255,0.3);
}
.doc-file-icon-wrap {
  position: relative;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.doc-file-icon {
  width: 52px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  transition: transform 0.15s;
}
.doc-file-icon-wrap:hover .doc-file-icon { transform: scale(1.08); }
.doc-file-icon-pdf     { color: #e54e6e; background: rgba(229,78,110,0.1); }
.doc-file-icon-img     { color: #ffb547; background: rgba(255,181,71,0.1); }
.doc-file-icon-default { color: #4dc9ff; background: rgba(77,201,255,0.1); }
.doc-file-ext {
  font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
  color: var(--text-3);
  font-family: "JetBrains Mono", monospace;
}
.doc-file-meta {
  font-size: 10px; color: var(--text-3);
  font-family: "JetBrains Mono", monospace;
  text-align: center;
}
.doc-file-actions {
  display: flex; gap: 5px; width: 100%;
  margin-top: auto;
}
.doc-btn-preview, .doc-btn-ai {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 3px;
  padding: 4px 0;
  border-radius: 5px;
  font-size: 10px; font-weight: 500;
  cursor: pointer; border: none; transition: background 0.15s;
}
.doc-btn-preview {
  background: rgba(77,201,255,0.12);
  color: #4dc9ff;
}
.doc-btn-preview:hover { background: rgba(77,201,255,0.22); }
.doc-btn-ai {
  background: rgba(167,153,255,0.12);
  color: #a799ff;
  cursor: not-allowed; opacity: 0.6;
}
.doc-file-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 32px 0;
  color: var(--text-3); font-size: 13px;
}
</style>
