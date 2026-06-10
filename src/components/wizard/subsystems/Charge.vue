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
      <label class="field-label">充电桩编号</label>
      <input class="input" v-model="item.stationCaseId" placeholder="编号" />
    </div>
    <div class="field">
      <label class="field-label">充电桩名称</label>
      <input class="input" v-model="item.stationName" placeholder="名称" />
    </div>
    <div class="field">
      <label class="field-label">充电桩类型</label>
      <select class="input" v-model="item.stationType">
        <option v-for="opt in stationTypeOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">充电桩状态</label>
      <input class="input" type="number" v-model="item.stationStatus" placeholder="状态代码" />
    </div>
    <div class="field">
      <label class="field-label">直流桩数量</label>
      <input class="input" type="number" v-model="item.directNum" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">交流桩数量</label>
      <input class="input" type="number" v-model="item.swapNum" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">运营商</label>
      <select class="input" v-model="item.ownerID">
        <option v-for="opt in ownerOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">地址</label>
      <input class="input" v-model="item.address" placeholder="详细地址" />
    </div>
    <div class="field">
      <label class="field-label">街道</label>
      <select class="input" v-model="item.street">
        <option v-for="opt in streetOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">街道编码</label>
      <input class="input" v-model="item.streetCode" placeholder="街道编码" />
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

const stationTypeOptions = () => getColumnOptions(props.columns, ['stationType'], [
  { key: '1', value: '公共' },
  { key: '100', value: '公交' },
  { key: '101', value: '环卫' },
  { key: '102', value: '物流' },
  { key: '103', value: '出租车' },
  { key: '104', value: '分时租赁' },
  { key: '105', value: '小区共享' },
  { key: '108', value: '公用换电站' },
  { key: '109', value: '专用换电站' },
  { key: '110', value: '商业*' },
  { key: '1105', value: '充电桩示范小区' },
  { key: '255', value: '其他' },
  { key: '50', value: '个人' }
])
const ownerOptions = () => getColumnOptions(props.columns, ['ownerID', 'ownerId'], [
  { key: '000000000', value: '未知' },
  { key: '074782068', value: '国际汽车城新能源' },
  { key: '074842972', value: '贝棱斯' },
  { key: '088597509', value: '玖行能源' },
  { key: '088689470', value: '五里置业' },
  { key: '090024777', value: '富电科技' },
  { key: '094421091', value: '特斯拉' },
  { key: '132315311', value: '上海电力' },
  { key: '132538021', value: '国信广场' },
  { key: '134501759', value: '科技京城' },
  { key: '320513112', value: '依威能源' },
  { key: '350811823', value: '星星充电' },
  { key: '759588065', value: '上海一电' },
  { key: 'MA002TMQX', value: '国网' },
  { key: 'MA01U0GU9', value: '国网电动汽车' },
  { key: 'MA1FP0228', value: '安悦充电' },
  { key: 'MA1G81HD4', value: '特来电' },
  { key: 'MA1GU6N77', value: '蔚来' },
  { key: 'MA1K1T8R3', value: '上海洽界' }
])
const streetOptions = () => getColumnOptions(props.columns, ['street', 'streetCode'], [
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
])

const convertItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return []
  return convertItemsValuesToKeys(rawItems, {
    stationType: stationTypeOptions(),
    ownerID: ownerOptions(),
    street: streetOptions()
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
