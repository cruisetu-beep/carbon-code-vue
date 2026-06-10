<!--
  警告：该组件（超低能耗建筑）目前在后端的资源包关系图结构（getResourceRelationTemplate）中未包含。
  因此在创建向导的子项配置步骤中将不会展示此组件。
-->
<template>
  <div>
    <div class="native-form">
    <div class="field">
      <label class="field-label">项目名称</label>
      <input class="input" v-model="localData.title" placeholder="例如：一大会址 新天地" />
    </div>
    <div class="field">
      <label class="field-label">认定年代</label>
      <input class="input" type="text" v-model="localData.year" placeholder="例如：2022年" />
    </div>
    <div class="field">
      <label class="field-label">建筑类型</label>
      <input class="input" v-model="localData.buildType" placeholder="例如：公共建筑" />
    </div>
    <div class="field">
      <label class="field-label">超低能耗类型</label>
      <select class="input" v-model="localData.energyType">
        <option value="ultra-low">超低能耗建筑</option>
        <option value="near-zero">近零能耗建筑</option>
        <option value="zero">零碳建筑</option>
      </select>
    </div>
    <slot name="attachment"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ formData: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:formData'])
const localData = ref({ ...props.formData })
watch(localData, (newVal) => emit('update:formData', newVal), { deep: true })
watch(() => props.formData, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localData.value)) localData.value = { ...newVal }
}, { deep: true })
</script>

<style scoped>
.native-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; color: var(--text-2); font-weight: 500; }
.input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;
  background: #f9fbff; font-size: 13px; color: var(--text-1); outline: none; transition: all 0.2s;
  box-sizing: border-box;
}
.input:focus { border-color: var(--brand); background: #fff; box-shadow: 0 0 0 3px rgba(77, 201, 255, 0.1); }
@media screen and (max-width: 1200px) { .native-form { grid-template-columns: repeat(2, 1fr); } }
@media screen and (max-width: 768px) { .native-form { grid-template-columns: 1fr; } }
</style>
