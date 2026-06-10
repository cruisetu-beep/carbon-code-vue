<!--
  警告：该组件（节能宣传）目前在后端的资源包关系图结构（getResourceRelationTemplate）中未包含。
  因此在创建向导的子项配置步骤中将不会展示此组件。
-->
<template>
  <div>
    <div class="native-form">
    <div class="field">
      <label class="field-label">宣传活动名称</label>
      <input class="input" v-model="localData.campaignName" placeholder="请输入活动名称" />
    </div>
    <div class="field">
      <label class="field-label">举办日期</label>
      <input class="input" type="date" v-model="localData.campaignDate" />
    </div>
    <div class="field">
      <label class="field-label">覆盖受众人数</label>
      <input class="input" type="number" v-model="localData.audienceCount" placeholder="受众人数" min="0" />
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
