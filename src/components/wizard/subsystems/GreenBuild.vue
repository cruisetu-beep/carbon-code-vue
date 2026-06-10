<template>
  <div class="list-form-wrapper">
    <div v-for="(item, index) in items" :key="index" class="list-item-card">
      <div class="card-header">
        <div class="card-title">记录 #{{ index + 1 }} - {{ item.projectName || '未命名' }}</div>
        <button class="icon-btn" @click="toggleMore(index)" :title="moreVisible[index] ? '收起更多字段' : '展开更多字段'">
          <svg v-if="!moreVisible[index]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"></path>
          </svg>
        </button>
        <button class="icon-btn danger" @click="removeItem(index)" title="删除此记录">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
        </button>
      </div>
      <div class="native-form">
        <template v-for="col in visibleColumns" :key="col.columnName">
          <div :class="['field', col.columnName === 'mark' && 'full-width']">
            <label class="field-label">{{ col.columnDispName }}</label>
            <template v-if="col.columnName === 'mark'">
              <textarea class="input" v-model="item[col.columnName]" :placeholder="col.columnDispName" rows="2"></textarea>
            </template>
            <template v-else-if="col.columnDataType === 'Single' && Array.isArray(col.columnOption) && col.columnOption.length > 0">
              <select class="input" v-model="item[col.columnName]">
                <option value="" disabled>请选择</option>
                <option v-for="opt in col.columnOption" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
              </select>
            </template>
            <template v-else-if="col.columnDataType === 'Int32'">
              <input class="input" type="number" v-model="item[col.columnName]" :placeholder="col.columnDispName" min="0" />
            </template>
            <template v-else-if="col.columnDataType === 'Decimal'">
              <input class="input" type="number" v-model="item[col.columnName]" :placeholder="col.columnDispName" step="0.000001" />
            </template>
            <template v-else>
              <input class="input" v-model="item[col.columnName]" :placeholder="col.columnDispName" />
            </template>
          </div>
        </template>
      </div>
      <div v-if="moreVisible[index]" class="native-form more-form">
        <template v-for="col in hiddenColumns" :key="col.columnName">
          <div class="field">
            <label class="field-label">{{ col.columnDispName }}</label>
            <template v-if="col.columnDataType === 'Single' && Array.isArray(col.columnOption) && col.columnOption.length > 0">
              <select class="input" v-model="item[col.columnName]">
                <option value="" disabled>请选择</option>
                <option v-for="opt in col.columnOption" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
              </select>
            </template>
            <template v-else-if="col.columnDataType === 'Int32'">
              <input class="input" type="number" v-model="item[col.columnName]" :placeholder="col.columnDispName" min="0" />
            </template>
            <template v-else-if="col.columnDataType === 'Decimal'">
              <input class="input" type="number" v-model="item[col.columnName]" :placeholder="col.columnDispName" step="0.000001" />
            </template>
            <template v-else>
              <input class="input" v-model="item[col.columnName]" :placeholder="col.columnDispName" />
            </template>
          </div>
        </template>
      </div>
      <slot name="attachment" :item="item" :index="index"></slot>
    </div>
    <button class="btn-add" @click="addItem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
      添加一条绿建记录
    </button>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getColumnByNames, normalizeColumnOptions, getOptionKeyByValue } from './columnOptions.js'

const props = defineProps({
  formData: { type: Object, default: () => ({}) },
  columns: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:formData'])

const moreVisible = ref({})

const defaultColumns = [
  { columnID: 1, columnOrder: 1, columnName: 'greenId', columnDispName: '绿色建筑ID', columnDataType: 'String', columnVisible: 1, columnOption: null },
  { columnID: 2, columnOrder: 2, columnName: 'projectName', columnDispName: '项目名称', columnDataType: 'String', columnVisible: 1, columnOption: null },
  { columnID: 3, columnOrder: 3, columnName: 'nickName', columnDispName: '项目昵称', columnDataType: 'String', columnVisible: 1, columnOption: null },
  { columnID: 4, columnOrder: 4, columnName: 'buildFunc', columnDispName: '建筑类型', columnDataType: 'Single', columnVisible: 1, columnOption: [] },
  {
    columnID: 5,
    columnOrder: 5,
    columnName: 'greenType',
    columnDispName: '绿建类型',
    columnDataType: 'Single',
    columnVisible: 1,
    columnOption: [
      { key: 'GreenBuild', value: '绿色建筑' },
      { key: 'GreenHotel', value: '绿色饭店' },
      { key: 'GreenRenewal', value: '绿色更新' },
      { key: 'LEED', value: 'LEED' },
      { key: 'UltraLowEnergy', value: '超低能耗建筑' },
      { key: 'WELL', value: 'WELL' }
    ]
  },
  { columnID: 6, columnOrder: 6, columnName: 'greenLevel', columnDispName: '等级', columnDataType: 'Single', columnVisible: 1, columnOption: [] },
  { columnID: 7, columnOrder: 7, columnName: 'greenYear', columnDispName: '年代', columnDataType: 'Int32', columnVisible: 1, columnOption: null },
  { columnID: 8, columnOrder: 8, columnName: 'address', columnDispName: '地址', columnDataType: 'String', columnVisible: 1, columnOption: null },
  {
    columnID: 9,
    columnOrder: 9,
    columnName: 'street',
    columnDispName: '街道',
    columnDataType: 'Single',
    columnVisible: 1,
    columnOption: [
      { key: '310101002', value: '南京东路街道' },
      { key: '310101013', value: '外滩街道' },
      { key: '310101015', value: '半淞园路街道' },
      { key: '310101017', value: '小东门街道' },
      { key: '310101018', value: '豫园街道' },
      { key: '310101019', value: '老西门街道' },
      { key: '310101020', value: '五里桥街道' },
      { key: '310101021', value: '打浦桥街道' },
      { key: '310101022', value: '淮海中路街道' },
      { key: '310101023', value: '瑞金二路街道' }
    ]
  },
  { columnID: 10, columnOrder: 10, columnName: 'longitude', columnDispName: '经度', columnDataType: 'Decimal', columnVisible: 0, columnOption: null },
  { columnID: 11, columnOrder: 11, columnName: 'latitude', columnDispName: '纬度', columnDataType: 'Decimal', columnVisible: 0, columnOption: null },
  { columnID: 12, columnOrder: 12, columnName: 'buildId', columnDispName: '关联建筑', columnDataType: 'String', columnVisible: 0, columnOption: null },
  { columnID: 13, columnOrder: 13, columnName: 'gisId', columnDispName: 'GisID', columnDataType: 'String', columnVisible: 0, columnOption: null },
  { columnID: 14, columnOrder: 14, columnName: 'mark', columnDispName: '说明', columnDataType: 'String', columnVisible: 1, columnOption: null }
]

const columns = computed(() => defaultColumns.map((col) => {
  const matched = getColumnByNames(props.columns, col.columnName)
  const incomingOptions = normalizeColumnOptions(matched?.columnOption || matched?.ColumnOption)
  const fallbackOptions = normalizeColumnOptions(col.columnOption)

  return {
    ...col,
    ...matched,
    columnName: matched?.columnName || matched?.ColumnName || col.columnName,
    columnDispName: matched?.columnDispName || matched?.ColumnDispName || col.columnDispName,
    columnDataType: matched?.columnDataType || matched?.ColumnDataType || col.columnDataType,
    columnVisible: matched?.columnVisible ?? matched?.ColumnVisible ?? col.columnVisible,
    columnOption: incomingOptions.length ? incomingOptions : fallbackOptions
  }
}).slice().sort((a, b) => (a.columnOrder || 0) - (b.columnOrder || 0)))

const visibleColumns = computed(() => columns.value.filter(c => c.columnVisible === 1))
const hiddenColumns = computed(() => columns.value.filter(c => c.columnVisible !== 1))

const convertItems = (newItems) => {
  if (!Array.isArray(newItems)) return []
  return newItems.map((item) => {
    const record = { ...item }
    columns.value.forEach((col) => {
      if (col.columnOption && col.columnOption.length > 0 && record[col.columnName] !== undefined) {
        record[col.columnName] = getOptionKeyByValue(col.columnOption, record[col.columnName])
      }
    })
    return record
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

watch(columns, () => {
  items.value = convertItems(items.value)
}, { deep: true })

function toggleMore(index) {
  moreVisible.value = { ...moreVisible.value, [index]: !moreVisible.value[index] }
}

function addItem() {
  items.value.push({
    greenId: '', projectName: '', nickName: '', buildFunc: '',
    greenType: 'GreenBuild', greenLevel: '', greenYear: new Date().getFullYear(),
    address: '', street: '310101002', mark: '',
    longitude: 0, latitude: 0, buildId: '', gisId: ''
  })
}

function removeItem(index) {
  items.value.splice(index, 1)
}
</script>

<style scoped>
.list-form-wrapper { display: flex; flex-direction: column; gap: 16px; }
.list-item-card {
  background: #fafcff;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 16px;
  position: relative;
}
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--line);
}
.card-title { font-size: 13px; font-weight: 600; color: var(--text-1); }
.icon-btn {
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: grid;
  place-items: center;
  background: #f2f6ff;
  color: var(--text-2);
}
.icon-btn:hover { background: #e6f1ff; color: var(--brand); }
.icon-btn.danger { color: #ff4d4f; background: #fff1f0; border: none; padding: 4px; border-radius: 4px; cursor: pointer; display: grid; place-items: center; }
.icon-btn.danger:hover { background: #ffccc7; }
.btn-add {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border: 1px dashed var(--brand); border-radius: 8px;
  background: #f0f7ff; color: var(--brand); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.btn-add:hover { background: #e6f1ff; }

.native-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.more-form { margin-top: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full-width { grid-column: 1 / -1; }
.field-label { font-size: 12px; color: var(--text-2); font-weight: 500; }
.input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;
  background: #fff; font-size: 13px; color: var(--text-1); outline: none; transition: all 0.2s;
  box-sizing: border-box; font-family: inherit; resize: vertical;
}
.input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(77, 201, 255, 0.1); }
@media screen and (max-width: 1200px) { .native-form { grid-template-columns: repeat(2, 1fr); } }
@media screen and (max-width: 768px) { .native-form { grid-template-columns: 1fr; } }
</style>
