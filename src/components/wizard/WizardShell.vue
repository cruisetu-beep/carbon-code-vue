<template>
  <Breadcrumb :items="['首页', '资源包管理', '创建新资源包', currentStep.n]"/>
  <div class="page-head">
    <div>
      <h1 class="page-title">
        <AppIcon name="plus" :size="22" stroke="var(--brand-2)"/>
        创建建筑碳效码资源包
      </h1>
      <div class="page-subtitle">
        填写建筑信息、上传资料后，知识库引擎将自动解析、切片、关联，完成后即可用于碳效码计算与考核。
      </div>
    </div>
    <button class="btn ghost" @click="$emit('back')">
      <AppIcon name="chevron-left" :size="14"/> 返回列表
    </button>
  </div>

  <div class="card" style="padding:0">
    <!-- Stepper -->
    <div class="stepper">
      <template v-for="(s, i) in STEPS" :key="s.k">
        <div :class="['step', stepIdx === i && 'active', stepIdx > i && 'done']">
          <div class="step-num">
            <AppIcon v-if="stepIdx > i" name="check" :size="14"/>
            <template v-else>{{ String(i + 1).padStart(2, '0') }}</template>
          </div>
          <div class="step-info">
            <div class="step-title">{{ s.n }}</div>
            <div class="step-desc">{{ s.d }}</div>
          </div>
        </div>
        <div v-if="i < STEPS.length - 1" class="step-line"/>
      </template>
    </div>

    <!-- 步骤内容 -->
    <div style="padding:24px">
      <StepBasic      v-if="stepIdx === 0" :data="pkg" @update="pkg = $event" @next="next"/>
      <StepDocs       v-else-if="stepIdx === 1" :data="pkg" @update="pkg = $event" @next="next" @prev="prev"/>
      <StepSubsystems v-else-if="stepIdx === 2" :data="pkg" @update="pkg = $event" @next="next" @prev="prev"/>
      <StepGraph      v-else-if="stepIdx === 3" :data="pkg" @next="next" @prev="prev"/>
      <StepDone       v-else-if="stepIdx === 4" :data="pkg" @finish="$emit('back')" @back="$emit('back')"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppIcon      from '../shared/AppIcon.vue'
import Breadcrumb   from '../shared/Breadcrumb.vue'
import StepBasic    from './StepBasic.vue'
import StepDocs     from './StepDocs.vue'
import StepSubsystems from './StepSubsystems.vue'
import StepGraph    from './StepGraph.vue'
import StepDone     from './StepDone.vue'
import { STEPS }    from '../../data/constants.js'

defineEmits(['back'])

const stepIdx = ref(0)
const pkg     = ref({})

const currentStep = computed(() => STEPS[stepIdx.value])
const next = () => { stepIdx.value = Math.min(STEPS.length - 1, stepIdx.value + 1) }
const prev = () => { stepIdx.value = Math.max(0, stepIdx.value - 1) }
</script>
