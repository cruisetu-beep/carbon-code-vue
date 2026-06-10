<template>
  <div>
    <div class="native-form">
    <div class="field">
      <label class="field-label">虚拟发电机ID</label>
      <input class="input" v-model="localData.vdid" placeholder="发电机ID" />
    </div>
    <div class="field">
      <label class="field-label">虚拟发电机名称</label>
      <input class="input" v-model="localData.vdName" placeholder="发电机名称" />
    </div>
    <div class="field">
      <label class="field-label">操作说明</label>
      <input class="input" v-model="localData.operationMark" placeholder="操作说明" />
    </div>
    <div class="field">
      <label class="field-label">最大调节能力 (kW)</label>
      <input class="input" type="number" v-model="localData.maxCapacity" placeholder="调节能力" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">用电高峰负荷 (kW)</label>
      <input class="input" type="number" v-model="localData.maxNeed" placeholder="高峰负荷" step="0.01" />
    </div>
    <div class="field">
      <label class="field-label">策略数</label>
      <input class="input" type="number" v-model="localData.strategyCount" placeholder="策略数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">因子数</label>
      <input class="input" type="number" v-model="localData.factorCount" placeholder="因子数量" min="0" />
    </div>
    <div class="field">
      <label class="field-label">入网时间</label>
      <input class="input" type="month" v-model="localData.time" />
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
