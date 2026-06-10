<template>
  <div class="list-form-wrapper">
    <div v-for="(item, index) in items" :key="index" class="list-item-card">
      <div class="card-header">
        <div class="card-title">记录 #{{ index + 1 }}</div>
        <button class="icon-btn danger" @click="removeItem(index)" title="删除此记录">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
        </button>
      </div>
      <div class="native-form">
        <div class="field">
          <label class="field-label">单位编号</label>
          <input class="input" v-model="item.unitCode" placeholder="单位编号" />
        </div>
        <div class="field">
          <label class="field-label">单位名称</label>
          <input class="input" v-model="item.unitName" placeholder="单位名称" />
        </div>
        <div class="field">
          <label class="field-label">年份</label>
          <input class="input" type="number" v-model="item.year" placeholder="如 2023" />
        </div>
        <div class="field">
          <label class="field-label">季度</label>
          <select class="input" v-model="item.quarter">
            <option v-for="opt in quarterOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">分组</label>
          <select class="input" v-model="item.group">
            <option v-for="opt in groupOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">能耗（tce）</label>
          <input class="input" type="number" v-model="item.energyValue" placeholder="当年能耗" step="0.01" />
        </div>
        <div class="field">
          <label class="field-label">去年能耗（tce）</label>
          <input class="input" type="number" v-model="item.energyValueLastYear" placeholder="去年能耗" step="0.01" />
        </div>
        <div class="field">
          <label class="field-label">总量指标</label>
          <input class="input" v-model="item.aggregateTarget" placeholder="总量指标" />
        </div>
        <div class="field">
          <label class="field-label">总量值</label>
          <input class="input" v-model="item.aggregateValueDesc" placeholder="总量值" />
        </div>
        <div class="field">
          <label class="field-label">总量达标</label>
          <select class="input" v-model="item.aggregateResult">
            <option v-for="opt in resultOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">强度指标</label>
          <input class="input" v-model="item.instenstiyTarget" placeholder="强度指标" />
        </div>
        <div class="field">
          <label class="field-label">强度值</label>
          <input class="input" v-model="item.instenstiyValueDesc" placeholder="强度值" />
        </div>
        <div class="field">
          <label class="field-label">强度达标</label>
          <select class="input" v-model="item.instensityResult">
            <option v-for="opt in resultOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
          </select>
        </div>
      </div>
      <slot name="attachment" :item="item" :index="index"></slot>
    </div>
    <button class="btn-add" @click="addItem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
      添加一条记录
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getColumnOptions, getOptionKeyByValue, convertItemsValuesToKeys } from './columnOptions.js'

const props = defineProps({
  formData: { type: Object, default: () => ({}) },
  columns: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:formData'])

const quarterOptions = () => getColumnOptions(props.columns, ['quarter'], [
  { key: '1', value: 'Q1' },
  { key: '2', value: 'Q2' },
  { key: '3', value: 'Q3' },
  { key: '4', value: 'Q4' }
])
const groupOptions = () => getColumnOptions(props.columns, ['group'], [
  { key: '1', value: '市级重点用能单位' },
  { key: '2', value: '区级重点用能单位(法人)' },
  { key: '3', value: '区级重点用能单位(楼宇)' }
])
const resultOptions = () => getColumnOptions(props.columns, ['aggregateResult', 'instensityResult', 'result'], [
  { key: '1', value: '是' },
  { key: '0', value: '否' }
])

const convertItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return []
  return convertItemsValuesToKeys(rawItems, {
    quarter: quarterOptions(),
    group: groupOptions(),
    aggregateResult: resultOptions(),
    instensityResult: resultOptions()
  })
}

const items = ref(convertItems(props.formData.items))

watch(items, (newVal) => {
  emit('update:formData', { ...props.formData, items: newVal })
}, { deep: true })

watch(() => props.formData.items, (newVal) => {
  const converted = convertItems(newVal)
  if (JSON.stringify(converted) !== JSON.stringify(items.value)) {
    items.value = converted
  }
}, { deep: true })

watch(() => props.columns, () => {
  items.value = convertItems(items.value)
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
.field.full-width { grid-column: 1 / -1; }
.field-label { font-size: 12px; color: var(--text-2); font-weight: 500; }
.input { width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; background: #fff; font-size: 13px; color: var(--text-1); outline: none; transition: all 0.2s; box-sizing: border-box; font-family: inherit; resize: vertical; }
.input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(77, 201, 255, 0.1); }
@media screen and (max-width: 1200px) { .native-form { grid-template-columns: repeat(2, 1fr); } }
@media screen and (max-width: 768px) { .native-form { grid-template-columns: 1fr; } }
</style>
