<template>
  <div>
    <div class="native-form">
    <div class="field">
      <label class="field-label">建筑名称</label>
      <input class="input" v-model="localData.buildName" placeholder="建筑名称" />
    </div>
    <div class="field">
      <label class="field-label">建筑地址</label>
      <input class="input" v-model="localData.buildAddress" placeholder="建筑地址" />
    </div>
    <div class="field">
      <label class="field-label">市平台ID</label>
      <input class="input" v-model="localData.buildCityId" placeholder="市平台ID" />
    </div>
    <div class="field">
      <label class="field-label">区平台ID</label>
      <input class="input" v-model="localData.buildId" placeholder="区平台ID" />
    </div>
    <div class="field">
      <label class="field-label">分组</label>
      <select class="input" v-model="localData.group">
        <option v-for="opt in groupOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">建设单位</label>
      <template v-if="contractorOptions().length > 0">
        <select class="input" v-model="localData.contractor">
          <option v-for="opt in contractorOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
        </select>
      </template>
      <input v-else class="input" v-model="localData.contractor" placeholder="建设单位" />
    </div>
    <div class="field">
      <label class="field-label">维护单位</label>
      <select class="input" v-model="localData.maintainer">
        <option v-for="opt in maintainerOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">电表数量</label>
      <input class="input" type="number" v-model="localData.electricityMeter" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">电表进线数量</label>
      <input class="input" type="number" v-model="localData.electricitySummary" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">水表数量</label>
      <input class="input" type="number" v-model="localData.waterMeter" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">水表总表数量</label>
      <input class="input" type="number" v-model="localData.waterSummary" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">燃气表数量</label>
      <input class="input" type="number" v-model="localData.gasMeter" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">总面积</label>
      <input class="input" type="number" v-model="localData.totalArea" placeholder="面积" min="0" />
    </div>
    <div class="field">
      <label class="field-label">建筑功能</label>
      <template v-if="buildFuncOptions().length > 0">
        <select class="input" v-model="localData.buildFunc">
          <option v-for="opt in buildFuncOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
        </select>
      </template>
      <input v-else class="input" v-model="localData.buildFunc" placeholder="建筑功能" />
    </div>
    <div class="field">
      <label class="field-label">街道</label>
      <select class="input" v-model="localData.street">
        <option v-for="opt in streetOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">联系人</label>
      <input class="input" v-model="localData.contacts" placeholder="联系人姓名" />
    </div>
    <div class="field">
      <label class="field-label">职位</label>
      <input class="input" v-model="localData.duties" placeholder="职位" />
    </div>
    <div class="field">
      <label class="field-label">电话</label>
      <input class="input" v-model="localData.telephone" placeholder="电话号码" />
    </div>
    <div class="field">
      <label class="field-label">接入时间</label>
      <input class="input" type="month" v-model="localData.time" />
    </div>
    <div class="field full-width">
      <label class="field-label">简介</label>
      <textarea class="input" v-model="localData.introduce" placeholder="简介信息" rows="2"></textarea>
    </div>
    <slot name="attachment"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getColumnOptions, getOptionKeyByValue } from './columnOptions.js'

const props = defineProps({
  formData: { type: Object, default: () => ({}) },
  columns: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:formData'])

const groupOptions = () => getColumnOptions(props.columns, ['group'], [
  { key: '1', value: '1期' },
  { key: '100', value: '新建建筑' },
  { key: '101', value: '市下发' },
  { key: '2', value: '2期' },
  { key: '3', value: '3期' },
  { key: '4', value: '4期' },
  { key: '5', value: '5期' },
  { key: '6', value: '6期' },
  { key: '7', value: '7期' },
  { key: '999', value: '其他' }
])

const contractorOptions = () => getColumnOptions(props.columns, ['contractor'], [])

const maintainerOptions = () => getColumnOptions(props.columns, ['maintainer'], [
  { key: '1', value: '腾天' },
  { key: '2', value: '延华' },
  { key: '3', value: '彦博' },
  { key: '4', value: '柯畅' }
])

const buildFuncOptions = () => getColumnOptions(props.columns, ['buildFunc'], [])

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

const convertValuesToKeys = (data) => {
  if (!data) return {}
  const res = { ...data }
  res.group = getOptionKeyByValue(groupOptions(), res.group)
  res.contractor = getOptionKeyByValue(contractorOptions(), res.contractor)
  res.maintainer = getOptionKeyByValue(maintainerOptions(), res.maintainer)
  res.buildFunc = getOptionKeyByValue(buildFuncOptions(), res.buildFunc)
  res.street = getOptionKeyByValue(streetOptions(), res.street)
  return res
}

const localData = ref(convertValuesToKeys(props.formData))

watch(localData, (newVal) => emit('update:formData', newVal), { deep: true })
watch(() => props.formData, (newVal) => {
  const converted = convertValuesToKeys(newVal)
  if (JSON.stringify(converted) !== JSON.stringify(localData.value)) {
    localData.value = converted
  }
}, { deep: true })
watch(() => props.columns, () => {
  localData.value = convertValuesToKeys(localData.value)
}, { deep: true })
</script>

<style scoped>
.native-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full-width { grid-column: 1 / -1; }
.field-label { font-size: 12px; color: var(--text-2); font-weight: 500; }
.input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;
  background: #f9fbff; font-size: 13px; color: var(--text-1); outline: none; transition: all 0.2s;
  box-sizing: border-box; font-family: inherit; resize: vertical;
}
.input:focus { border-color: var(--brand); background: #fff; box-shadow: 0 0 0 3px rgba(77, 201, 255, 0.1); }
@media screen and (max-width: 1200px) { .native-form { grid-template-columns: repeat(2, 1fr); } }
@media screen and (max-width: 768px) { .native-form { grid-template-columns: 1fr; } }
</style>
