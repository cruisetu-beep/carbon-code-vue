<!--
  警告：该组件（楼宇调适）目前在后端的资源包关系图结构（getResourceRelationTemplate）中未包含。
  因此在创建向导的子项配置步骤中将不会展示此组件。
-->
<template>
  <div>
    <div class="native-form">
    <div class="field">
      <label class="field-label">调适系统名称</label>
      <input class="input" v-model="localData.systemName" placeholder="例如：中央空调水系统" />
    </div>
    <div class="field">
      <label class="field-label">当前调适阶段</label>
      <select class="input" v-model="localData.stage">
        <option value="planning">计划制定</option>
        <option value="executing">现场调适执行</option>
        <option value="evaluating">效果验证评估</option>
        <option value="completed">调适完成</option>
      </select>
    </div>
    <div class="field full-width">
      <label class="field-label">预期优化效果说明</label>
      <textarea class="input" v-model="localData.expectedEffect" placeholder="简述调适后的优化目标与预期节能效果" rows="2"></textarea>
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
