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
      <input class="input" v-model="item.projectID" placeholder="ID" />
    </div>
    <div class="field">
      <label class="field-label">项目名称</label>
      <input class="input" v-model="item.projectName" placeholder="名称" />
    </div>
    <div class="field">
      <label class="field-label">审计年份</label>
      <input class="input" type="number" v-model="item.Year" placeholder="如 2023" />
    </div>
    <div class="field">
      <label class="field-label">审计单位</label>
      <select class="input" v-model="item.Unit">
        <option v-for="opt in unitOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">项目地址</label>
      <input class="input" v-model="item.EaAddress" placeholder="项目地址" />
    </div>
    <div class="field">
      <label class="field-label">项目面积</label>
      <input class="input" v-model="item.EaArea" placeholder="项目面积" />
    </div>
    <div class="field">
      <label class="field-label">主管单位</label>
      <input class="input" v-model="item.Competent" placeholder="主管单位" />
    </div>
    <div class="field">
      <label class="field-label">高效用能设备参与总台数</label>
      <input class="input" type="number" v-model="item.IsAllNum" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">符合准入设备台数</label>
      <input class="input" type="number" v-model="item.IsConform" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">符合节能设备台数</label>
      <input class="input" type="number" v-model="item.IsUse" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">符合先进设备台数</label>
      <input class="input" type="number" v-model="item.IsAdvanced" placeholder="数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">新技术/新工艺获得表彰案例</label>
      <select class="input" v-model="item.InnovateHas">
        <option v-for="opt in innovateHasOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">创新技术或管理方法成果</label>
      <select class="input" v-model="item.InnovateGN">
        <option v-for="opt in innovateGNOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">采用国内低碳技术</label>
      <select class="input" v-model="item.InnovateTech">
        <option v-for="opt in innovateTechOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">空调冷热源系统得分</label>
      <input class="input" v-model="item.IntelligentScore1" placeholder="得分" />
    </div>
    <div class="field">
      <label class="field-label">空调末端得分</label>
      <input class="input" v-model="item.IntelligentScore2" placeholder="得分" />
    </div>
    <div class="field">
      <label class="field-label">公共照明区域得分</label>
      <input class="input" v-model="item.IntelligentScore3" placeholder="得分" />
    </div>
    <div class="field">
      <label class="field-label">低碳管理行动率得分</label>
      <input class="input" v-model="item.carbonActionScore" placeholder="得分" />
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

const unitOptions = () => getColumnOptions(props.columns, ['Unit', 'unit', 'UnitType', 'unitType'], [
  { key: '0', value: '上海腾天节能技术有限公司' },
  { key: '10', value: '上海浦公节能环保科技有限公司' },
  { key: '11', value: '上海浦江能源管理有限公司' },
  { key: '12', value: '上海市节能监察中心' },
  { key: '13', value: '上海泰豪智能节能技术有限公司' },
  { key: '14', value: '必维国际检验集团(Bureau Veritas)' },
  { key: '15', value: '上海通理信节能科技有限公司' },
  { key: '16', value: '上海微玄能源科技有限公司' },
  { key: '17', value: '上海信业智能科技股份有限公司' },
  { key: '18', value: '上海应技大科发展有限公司' },
  { key: '19', value: '上海智生环保技术工程有限公司' },
  { key: '2', value: '东方研华' },
  { key: '20', value: '同济大学' },
  { key: '21', value: '铜联商务咨询有限公司' },
  { key: '22', value: '君凯环境管理咨询(上海)有限公司' },
  { key: '23', value: '中国质量认证中心有限公司' },
  { key: '3', value: '监察中心' },
  { key: '4', value: '上海市建筑科学研究院' },
  { key: '5', value: '上海大学' },
  { key: '6', value: '上海梵华信息技术有限公司' },
  { key: '7', value: '上海华馨节能科技有限公司' },
  { key: '8', value: '上海绩峰节能环保科技有限公司' },
  { key: '9', value: '上海派恒环节能保科技有限公司' }
])
const innovateHasOptions = () => getColumnOptions(props.columns, ['InnovateHas', 'innovateHas'], [
  { key: '0', value: '无' },
  { key: '1', value: '行业奖项' },
  { key: '2', value: '省部级奖项' },
  { key: '3', value: '国家级奖项' }
])
const innovateGNOptions = () => getColumnOptions(props.columns, ['InnovateGN', 'innovateGN'], [
  { key: '0', value: '无' },
  { key: '1', value: '国内领先' },
  { key: '2', value: '国际先进' },
  { key: '3', value: '国际领先' }
])
const innovateTechOptions = () => getColumnOptions(props.columns, ['InnovateTech', 'innovateTech'], [
  { key: '0', value: '无' },
  { key: '1', value: '已采用' }
])

const convertItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return []
  return convertItemsValuesToKeys(rawItems, {
    Unit: unitOptions(),
    InnovateHas: innovateHasOptions(),
    InnovateGN: innovateGNOptions(),
    InnovateTech: innovateTechOptions()
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
