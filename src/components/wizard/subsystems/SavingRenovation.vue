<template>
  <div>
    <div class="native-form">
    <div class="field">
      <label class="field-label">项目名称</label>
      <input class="input" v-model="localData.projectName" placeholder="项目名称" />
    </div>
    <div class="field">
      <label class="field-label">年份</label>
      <input class="input" type="number" v-model="localData.year" placeholder="如 2023" />
    </div>
    <div class="field">
      <label class="field-label">关联建筑ID</label>
      <input class="input" v-model="localData.buildId" placeholder="输入关联建筑ID" />
    </div>
    <div class="field">
      <label class="field-label">建筑面积（m²）</label>
      <input class="input" type="number" v-model="localData.buildArea" placeholder="建筑面积" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">改造面积（m²）</label>
      <input class="input" type="number" v-model="localData.renovationArea" placeholder="改造面积" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">基准量（tce）</label>
      <input class="input" type="number" v-model="localData.standardEnergy" placeholder="基准量" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">节能量（tce）</label>
      <input class="input" type="number" v-model="localData.renovationEnergy" placeholder="节能量" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">节能率（%）</label>
      <input class="input" type="number"
        :value="localData.standardEnergy ? (localData.renovationEnergy / localData.standardEnergy * 100).toFixed(2) : (localData.savingRate || 0)"
        readonly disabled style="background:#eef2f9; cursor:not-allowed;" />
    </div>
    <div class="field">
      <label class="field-label">节能绝对量（tce）</label>
      <input class="input" type="number" v-model="localData.savingAmount" placeholder="节能绝对量" step="0.01" />
    </div>
    <slot name="attachment"></slot>
    </div>
  </div>
</template>

<script setup>
// 节能改造表单：单条记录表单（非列表），通过 localData 双向绑定
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
