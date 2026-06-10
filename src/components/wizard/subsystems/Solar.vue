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
      <label class="field-label">光伏编号 (SolarCaseId)</label>
      <input class="input" v-model="item.solarCaseId" placeholder="光伏编号" />
    </div>
    <div class="field">
      <label class="field-label">光伏站ID (SolarStationId)</label>
      <input class="input" v-model="item.solarStationId" placeholder="光伏站ID" />
    </div>
    <div class="field">
      <label class="field-label">光伏名称 (SolarName)</label>
      <input class="input" v-model="item.solarName" placeholder="光伏项目名称" />
    </div>
    <div class="field">
      <label class="field-label">状态 (SolarStatus)</label>
      <select class="input" v-model="item.solarStatus">
        <option v-for="opt in solarStatusOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">安装日期 (InstallDate)</label>
      <input class="input" type="date" v-model="item.installDate" />
    </div>
    <div class="field">
      <label class="field-label">容量 (Capacity)</label>
      <input class="input" type="number" v-model="item.capacity" placeholder="容量数值" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">街道 (Street)</label>
      <template v-if="streetOptions().length > 0">
        <select class="input" v-model="item.street">
          <option v-for="opt in streetOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
        </select>
      </template>
      <input v-else class="input" v-model="item.street" placeholder="街道" />
    </div>
    <div class="field">
      <label class="field-label">地址 (Address)</label>
      <input class="input" v-model="item.address" placeholder="详细地址" />
    </div>

    <!-- 勘察时间、人员 -->
    <div class="field">
      <label class="field-label">勘察时间</label>
      <input class="input" type="date" v-model="item.surveyDate" />
    </div>
    <div class="field">
      <label class="field-label">勘察人员</label>
      <input class="input" v-model="item.surveyor" placeholder="勘察人员" />
    </div>
    
    <!-- 面积相关 -->
    <div class="field">
      <label class="field-label">屋顶总面积（平米）</label>
      <input class="input" type="number" v-model="item.roofArea" placeholder="0" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">屋顶设备/绿化面积（平米）</label>
      <input class="input" type="number" v-model="item.roofGreeningArea" placeholder="0" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">机动车棚可利用面积（平米）</label>
      <input class="input" type="number" v-model="item.carportArea" placeholder="0" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">非机动车棚可利用面积（平米）</label>
      <input class="input" type="number" v-model="item.bikeCarportArea" placeholder="0" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">立面可利用面积（平米）</label>
      <input class="input" type="number" v-model="item.facadeArea" placeholder="0" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">立面方向</label>
      <input class="input" v-model="item.facadeDirection" placeholder="立面方向" />
    </div>

    <!-- 容量与难度 -->
    <div class="field">
      <label class="field-label">预计光伏安装容量（千瓦）</label>
      <input class="input" type="number" v-model="item.estimatedCapacity" placeholder="0" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">难易程度</label>
      <select class="input" v-model="item.difficulty">
        <option v-for="opt in difficultyOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>

    <!-- 建筑与联系人信息 -->
    <div class="field">
      <label class="field-label">现场联系人</label>
      <input class="input" v-model="item.contactPerson" placeholder="联系人" />
    </div>
    <div class="field">
      <label class="field-label">房屋产权</label>
      <input class="input" v-model="item.propertyRight" placeholder="房屋产权" />
    </div>
    <div class="field">
      <label class="field-label">建筑年代</label>
      <input class="input" type="number" v-model="item.buildYear" placeholder="如 2015" />
    </div>
    <div class="field">
      <label class="field-label">建筑功能</label>
      <select class="input" v-model="item.buildFunction">
        <option v-for="opt in buildFunctionOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">变配电系统</label>
      <input class="input" v-model="item.powerSystem" placeholder="变配电系统" />
    </div>
    <div class="field">
      <label class="field-label">变压器容量</label>
      <input class="input" v-model="item.transformerCapacity" placeholder="变压器容量" />
    </div>
    <div class="field">
      <label class="field-label">项目产权类型</label>
      <select class="input" v-model="item.propertyType">
        <option v-for="opt in propertyTypeOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">任务分解</label>
      <select class="input" v-model="item.taskBreakdown">
        <option v-for="opt in taskBreakdownOptions()" :key="opt.key" :value="opt.key">{{ opt.value }}</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">投资额（万元）</label>
      <input class="input" type="number" v-model="item.investment" placeholder="0" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">扶持额（万元）</label>
      <input class="input" type="number" v-model="item.subsidy" placeholder="0" step="0.01" />
    </div>

    <!-- 文本/说明区域 (跨列) -->
    <div class="field full-width">
      <label class="field-label">预计安装容量说明</label>
      <textarea class="input" v-model="item.estimatedCapacityDesc" placeholder="说明" rows="2"></textarea>
    </div>
    <div class="field full-width">
      <label class="field-label">其他特殊情况</label>
      <textarea class="input" v-model="item.otherConditions" placeholder="特殊情况..." rows="2"></textarea>
    </div>
    <div class="field full-width">
      <label class="field-label">现场概况</label>
      <textarea class="input" v-model="item.siteOverview" placeholder="概况..." rows="2"></textarea>
    </div>
    <div class="field full-width">
      <label class="field-label">特殊情况说明</label>
      <textarea class="input" v-model="item.specialDesc" placeholder="说明..." rows="2"></textarea>
    </div>

    <!-- 填报与更新 (只读) -->
    <div class="field">
      <label class="field-label">填报人</label>
      <input class="input" v-model="item.reporter" readonly disabled style="background:#eef2f9; cursor:not-allowed;" />
    </div>
    <div class="field">
      <label class="field-label">最后更新时间</label>
      <input class="input" v-model="item.lastUpdateTime" readonly disabled style="background:#eef2f9; cursor:not-allowed;" />
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
import { ref, watch, onMounted } from 'vue'
import { getColumnOptions, getOptionKeyByValue, convertItemsValuesToKeys } from './columnOptions.js'
import { getSolarData } from '../../../api/subsystems.js'

const props = defineProps({
  formData: { type: Object, default: () => ({}) },
  columns: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:formData'])

const streetOptionsList = ref([])
const solarStatusOptionsList = ref([])
const difficultyOptionsList = ref([])
const buildFunctionOptionsList = ref([])
const propertyTypeOptionsList = ref([])
const taskBreakdownOptionsList = ref([])

const solarStatusOptions = () => solarStatusOptionsList.value.length 
  ? solarStatusOptionsList.value 
  : getColumnOptions(props.columns, ['solarStatus'], [
      { key: '0', value: '调研中' },
      { key: '1', value: '已安装' },
      { key: '2', value: '拟安装' },
      { key: '3', value: '安装中' }
    ])
const streetOptions = () => streetOptionsList.value.length
  ? streetOptionsList.value
  : getColumnOptions(props.columns, ['street', 'streetCode'], [])
const difficultyOptions = () => difficultyOptionsList.value.length
  ? difficultyOptionsList.value
  : getColumnOptions(props.columns, ['difficulty'], [
      { key: 'A', value: '业主配合、屋顶情况好' },
      { key: 'B', value: '业主配合、屋顶情况不好' },
      { key: 'C', value: '业主不配合、屋顶情况好' },
      { key: 'D', value: '业主不配合、屋顶情况不好' }
    ])
const buildFunctionOptions = () => buildFunctionOptionsList.value.length
  ? buildFunctionOptionsList.value
  : getColumnOptions(props.columns, ['buildFunction'], [
      { key: 'AA', value: '机关' },
      { key: 'BA', value: '办公' },
      { key: 'BB', value: '商场' },
      { key: 'BC', value: '酒店' },
      { key: 'BD', value: '文化' },
      { key: 'BE', value: '医疗' },
      { key: 'BF', value: '体育' },
      { key: 'BH', value: '教育' },
      { key: 'BI', value: '会展' },
      { key: 'BJ', value: '交通' },
      { key: 'BY', value: '居民' },
      { key: 'BZ', value: '其他' }
    ])
const propertyTypeOptions = () => propertyTypeOptionsList.value.length
  ? propertyTypeOptionsList.value
  : getColumnOptions(props.columns, ['propertyType'], [
      { key: '1', value: '企业' },
      { key: '2', value: '个人' }
    ])
const taskBreakdownOptions = () => taskBreakdownOptionsList.value.length
  ? taskBreakdownOptionsList.value
  : getColumnOptions(props.columns, ['taskBreakdown'], [
      { key: '1', value: '交通领域' },
      { key: '2', value: '教育领域' },
      { key: '3', value: '区属集团' },
      { key: '4', value: '公共机构' },
      { key: '5', value: '商务领域' }
    ])

const convertItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return []
  return convertItemsValuesToKeys(rawItems, {
    solarStatus: solarStatusOptions(),
    street: streetOptions(),
    difficulty: difficultyOptions(),
    buildFunction: buildFunctionOptions(),
    propertyType: propertyTypeOptions(),
    taskBreakdown: taskBreakdownOptions()
  })
}

const items = ref(convertItems(props.formData.items))

const loadOptions = async () => {
  try {
    const res = await getSolarData(0)
    if (res?.data) {
      const dicts = res.data.solarDicts || []
      const survey = res.data.solarSurveyData || []

      const streetDict = dicts.find(d => d.key === 'street')
      if (streetDict && Array.isArray(streetDict.value)) {
        streetOptionsList.value = streetDict.value.map(opt => ({ key: String(opt.key), value: String(opt.value) }))
      }

      const statusDict = dicts.find(d => d.key === 'solarStatus')
      if (statusDict && Array.isArray(statusDict.value)) {
        solarStatusOptionsList.value = statusDict.value.map(opt => ({ key: String(opt.key), value: String(opt.value) }))
      }

      const difficultyItem = survey.find(d => d.markName === '难易程度' || d.markId === 12)
      if (difficultyItem && Array.isArray(difficultyItem.option)) {
        difficultyOptionsList.value = difficultyItem.option.map(opt => ({ key: String(opt.key), value: String(opt.value) }))
      }

      const buildFuncItem = survey.find(d => d.markName === '建筑功能' || d.markId === 18)
      if (buildFuncItem && Array.isArray(buildFuncItem.option)) {
        buildFunctionOptionsList.value = buildFuncItem.option.map(opt => ({ key: String(opt.key), value: String(opt.value) }))
      }

      const propertyItem = survey.find(d => d.markName === '项目产权类型' || d.markId === 21)
      if (propertyItem && Array.isArray(propertyItem.option)) {
        propertyTypeOptionsList.value = propertyItem.option.map(opt => ({ key: String(opt.key), value: String(opt.value) }))
      }

      const taskItem = survey.find(d => d.markName === '任务分解' || d.markId === 22)
      if (taskItem && Array.isArray(taskItem.option)) {
        taskBreakdownOptionsList.value = taskItem.option.map(opt => ({ key: String(opt.key), value: String(opt.value) }))
      }
      
      // 更新选项列表后，主动对 items 行中的中文描述进行映射转换
      items.value = convertItems(items.value)
    }
  } catch (err) {
    console.error('Failed to load solar options from api:', err)
  }
}

onMounted(() => {
  loadOptions()
})

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
