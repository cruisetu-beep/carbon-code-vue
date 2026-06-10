<template>
  <!-- 碳效码表单：列表形式，对齐后端 CarbonQREvaluationBaseInfo 模型 -->
  <div class="list-form-wrapper">
    <div v-for="(item, index) in items" :key="index" class="list-item-card">
      <div class="card-header">
        <div class="card-title">碳效码 #{{ index + 1 }} - {{ item.buildName || '未命名' }}</div>
        <button class="icon-btn danger" @click="removeItem(index)" title="删除此记录">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
        </button>
      </div>
      <div class="native-form">
        <div class="field">
          <label class="field-label">建筑ID</label>
          <input class="input" v-model="item.buildID" placeholder="建筑ID" />
        </div>
        <div class="field">
          <label class="field-label">评价年份</label>
          <input class="input" type="number" v-model="item.evaYear" placeholder="如 2023" />
        </div>
        <div class="field">
          <label class="field-label">碳效码</label>
          <input class="input" v-model="item.evaluationCode" placeholder="碳效码" />
        </div>
        <div class="field">
          <label class="field-label">碳分数</label>
          <input class="input" type="number" v-model="item.evaluationScore" placeholder="碳分数" step="0.01" />
        </div>
        <div class="field">
          <label class="field-label">建筑名称</label>
          <input class="input" v-model="item.buildName" placeholder="建筑名称" />
        </div>
        <div class="field">
          <label class="field-label">建筑地址</label>
          <input class="input" v-model="item.buildAddress" placeholder="建筑地址" />
        </div>
        <div class="field">
          <label class="field-label">建筑年代</label>
          <input class="input" type="number" v-model="item.buildYear" placeholder="如 2015" />
        </div>
        <div class="field">
          <label class="field-label">建筑面积（㎡）</label>
          <input class="input" type="number" v-model="item.buildArea" placeholder="建筑面积" min="0" />
        </div>
        <div class="field">
          <label class="field-label">建筑功能</label>
          <input class="input" v-model="item.buildFunc" placeholder="建筑功能" />
        </div>
      </div>
      <slot name="attachment" :item="item" :index="index"></slot>
    </div>
    <button class="btn-add" @click="addItem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
      添加碳效码记录
    </button>
  </div>
</template>

<script setup>
// 碳效码表单：多条记录列表，对齐 CarbonQREvaluationBaseInfo 模型
import { ref, watch } from 'vue'

const props = defineProps({ formData: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:formData'])

const items = ref(props.formData.items ? JSON.parse(JSON.stringify(props.formData.items)) : [])

watch(items, (newVal) => {
  emit('update:formData', { ...props.formData, items: newVal })
}, { deep: true })

watch(() => props.formData.items, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(items.value)) {
    items.value = newVal ? JSON.parse(JSON.stringify(newVal)) : []
  }
}, { deep: true })

function addItem() {
  items.value.push({})
}

function removeItem(index) {
  items.value.splice(index, 1)
}
</script>

<style scoped>
.list-form-wrapper { display: flex; flex-direction: column; gap: 16px; }
.list-item-card { background: #fafcff; border: 1px solid var(--line); border-radius: 8px; padding: 16px; position: relative; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed var(--line); }
.card-title { font-size: 13px; font-weight: 600; color: var(--text-1); }
.icon-btn.danger { color: #ff4d4f; background: #fff1f0; border: none; padding: 4px; border-radius: 4px; cursor: pointer; display: grid; place-items: center; }
.icon-btn.danger:hover { background: #ffccc7; }
.btn-add { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border: 1px dashed var(--brand); border-radius: 8px; background: #f0f7ff; color: var(--brand); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-add:hover { background: #e6f1ff; }

.native-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; color: var(--text-2); font-weight: 500; }
.input { width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; background: #fff; font-size: 13px; color: var(--text-1); outline: none; transition: all 0.2s; box-sizing: border-box; }
.input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(77, 201, 255, 0.1); }
@media screen and (max-width: 1200px) { .native-form { grid-template-columns: repeat(2, 1fr); } }
@media screen and (max-width: 768px) { .native-form { grid-column: 1fr; } }
</style>
