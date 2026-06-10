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
      <label class="field-label">项目ID</label>
      <input class="input" v-model="item.projectId" placeholder="ID" />
    </div>
    <div class="field">
      <label class="field-label">项目名称</label>
      <input class="input" v-model="item.projectName" placeholder="项目名称" />
    </div>
    <div class="field">
      <label class="field-label">证书编号</label>
      <input class="input" v-model="item.transactionNumber" placeholder="证书编号" />
    </div>
    <div class="field">
      <label class="field-label">购买方</label>
      <input class="input" v-model="item.buildName" placeholder="购买方" />
    </div>
    <div class="field">
      <label class="field-label">绿证 (MWh)</label>
      <input class="input" type="number" v-model="item.greenCertificateNum" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">项目代码</label>
      <input class="input" v-model="item.gsProjectCode" placeholder="项目代码" />
    </div>
    <div class="field">
      <label class="field-label">项目类型</label>
      <select class="input" v-model="item.gsProjectType">
        <option v-for="opt in projectTypeOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">项目所在地</label>
      <input class="input" v-model="item.gsProjectAddress" placeholder="项目所在地" />
    </div>
    <div class="field">
      <label class="field-label">电生产日期</label>
      <input class="input" type="month" v-model="item.productionDate" />
    </div>
    <div class="field">
      <label class="field-label">交易平台</label>
      <select class="input" v-model="item.transactionCity">
        <option v-for="opt in transactionCityOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">地址</label>
      <input class="input" v-model="item.address" placeholder="地址" />
    </div>
    <div class="field">
      <label class="field-label">户号</label>
      <input class="input" v-model="item.houseHoldNumber" placeholder="户号" />
    </div>
    <div class="field">
      <label class="field-label">账号</label>
      <input class="input" v-model="item.accountNumber" placeholder="账号" />
    </div>
    <div class="field">
      <label class="field-label">密码</label>
      <input class="input" v-model="item.passWord" placeholder="密码" />
    </div>
    <div class="field">
      <label class="field-label">激励百分比</label>
      <input class="input" type="number" v-model="item.rate" placeholder="激励百分比" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">电量(万度)</label>
      <input class="input" type="number" v-model="item.subsidyPow" placeholder="电量" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">购买单位</label>
      <input class="input" v-model="item.enterpriseTitle" placeholder="购买单位" />
    </div>
    <div class="field">
      <label class="field-label">项目名称 (GsProjectName)</label>
      <input class="input" v-model="item.gsProjectName" placeholder="项目名称" />
    </div>
    <div class="field">
      <label class="field-label">申报日期</label>
      <input class="input" type="date" v-model="item.declarationDate" />
    </div>
    <div class="field">
      <label class="field-label">交易日期</label>
      <input class="input" type="date" v-model="item.transactionDate" />
    </div>
    <div class="field">
      <label class="field-label">平均价格</label>
      <input class="input" type="number" v-model="item.averagePrice" placeholder="平均价格" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">成交总价</label>
      <input class="input" type="number" v-model="item.totalPrice" placeholder="成交总价" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">信用代码</label>
      <input class="input" v-model="item.gsUnitCode" placeholder="信用代码" />
    </div>
    <div class="field">
      <label class="field-label">售电（证）单位</label>
      <select class="input" v-model="item.saleUnit">
        <option v-for="opt in saleUnitOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">减排(吨CO2）</label>
      <input class="input" v-model="item.reduceCO2" readonly disabled style="background:#eef2f9; cursor:not-allowed;" />
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

const projectTypeOptions = () => getColumnOptions(props.columns, ['gsProjectType'], [
  { key: '1', value: '太阳能发电' },
  { key: '2', value: '风力发电' },
  { key: '3', value: '水力发电' }
])
const transactionCityOptions = () => getColumnOptions(props.columns, ['transactionCity'], [
  { key: '1', value: '北京电力交易平台' },
  { key: '2', value: '广州电力交易平台' },
  { key: '3', value: '中国绿色电力证书交易平台' }
])
const saleUnitOptions = () => getColumnOptions(props.columns, ['saleUnit'], [
  { key: '1', value: '腾天' }
])

const convertItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return []
  return convertItemsValuesToKeys(rawItems, {
    gsProjectType: projectTypeOptions(),
    transactionCity: transactionCityOptions(),
    saleUnit: saleUnitOptions()
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
