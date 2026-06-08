<template>
  <div v-if="open" class="pf-overlay" @click.self="$emit('close')">
    <div class="pf-panel" role="dialog" aria-modal="true">
      <div class="pf-head">
        <div class="pf-title">
          <span>高级筛选</span>
          <span class="pf-sub">匹配 {{ facets?.matched ?? 0 }} / {{ facets?.total ?? 0 }}</span>
        </div>
        <button class="icon-btn" @click="$emit('close')" aria-label="close">
          <slot name="closeIcon"/>
        </button>
      </div>

      <div class="pf-body">
        <div class="pf-row">
          <div class="pf-label">生效方式</div>
          <div class="pf-inline">
            <label class="pf-radio">
              <input
                type="radio"
                name="mode"
                value="realtime"
                :checked="triggerMode === 'realtime'"
                @change="$emit('update:triggerMode', 'realtime')"
              />
              实时筛选
            </label>
            <label class="pf-radio">
              <input
                type="radio"
                name="mode"
                value="manual"
                :checked="triggerMode === 'manual'"
                @change="$emit('update:triggerMode', 'manual')"
              />
              手动提交
            </label>
            <span v-if="triggerMode === 'manual' && pending" class="pf-badge warn">待提交</span>
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">文本搜索</div>
          <div class="pf-inline">
            <input
              class="pf-input"
              :value="draftFilters.keyword"
              placeholder="建筑名称 / 编号 / 功能类型"
              @input="$emit('patch', { keyword: $event.target.value })"
            />
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">更新日期</div>
          <div class="pf-inline">
            <input
              class="pf-input"
              type="date"
              :min="facets?.updatedBounds?.min || undefined"
              :max="facets?.updatedBounds?.max || undefined"
              :value="draftFilters.updatedStart"
              @input="$emit('patch', { updatedStart: $event.target.value })"
            />
            <span class="pf-sep">至</span>
            <input
              class="pf-input"
              type="date"
              :min="facets?.updatedBounds?.min || undefined"
              :max="facets?.updatedBounds?.max || undefined"
              :value="draftFilters.updatedEnd"
              @input="$emit('patch', { updatedEnd: $event.target.value })"
            />
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">功能类型</div>
          <div class="pf-chips">
            <button
              v-for="it in facets?.funcs || []"
              :key="it.k"
              type="button"
              :disabled="it.c === 0 && !(draftFilters.funcs || []).includes(it.k)"
              :class="['pf-chip', (draftFilters.funcs || []).includes(it.k) && 'active', it.c === 0 && !(draftFilters.funcs || []).includes(it.k) && 'disabled']"
              @click="$emit('toggle', { key: 'funcs', value: it.k })"
            >
              <span class="t">{{ it.n }}</span>
              <span class="c">{{ it.c }}</span>
            </button>
            <div v-if="!(facets?.funcs || []).length" class="pf-empty">暂无可选项</div>
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">状态</div>
          <div class="pf-chips">
            <button
              v-for="it in facets?.statuses || []"
              :key="it.k"
              type="button"
              :disabled="it.c === 0 && !(draftFilters.statuses || []).includes(it.k)"
              :class="['pf-chip', (draftFilters.statuses || []).includes(it.k) && 'active', it.c === 0 && !(draftFilters.statuses || []).includes(it.k) && 'disabled']"
              @click="$emit('toggle', { key: 'statuses', value: it.k })"
            >
              <span class="t">{{ it.n }}</span>
              <span class="c">{{ it.c }}</span>
            </button>
            <div v-if="!(facets?.statuses || []).length" class="pf-empty">暂无可选项</div>
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">子系统标签</div>
          <div class="pf-chips">
            <button
              v-for="it in facets?.subs || []"
              :key="it.k"
              type="button"
              :disabled="it.c === 0 && !(draftFilters.subs || []).includes(it.k)"
              :class="['pf-chip', (draftFilters.subs || []).includes(it.k) && 'active', it.c === 0 && !(draftFilters.subs || []).includes(it.k) && 'disabled']"
              @click="$emit('toggle', { key: 'subs', value: it.k })"
            >
              <span class="t">{{ it.n }}</span>
              <span class="c">{{ it.c }}</span>
            </button>
            <div v-if="!(facets?.subs || []).length" class="pf-empty">暂无可选项</div>
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">建成年份</div>
          <div class="pf-inline">
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.yearBounds?.min ?? undefined"
              :max="facets?.yearBounds?.max ?? undefined"
              :placeholder="facets?.yearBounds?.min ? `最小 ${facets.yearBounds.min}` : '最小'"
              :value="draftFilters.yearMin ?? ''"
              @input="$emit('patch', { yearMin: $event.target.value === '' ? null : Number($event.target.value) })"
            />
            <span class="pf-sep">至</span>
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.yearBounds?.min ?? undefined"
              :max="facets?.yearBounds?.max ?? undefined"
              :placeholder="facets?.yearBounds?.max ? `最大 ${facets.yearBounds.max}` : '最大'"
              :value="draftFilters.yearMax ?? ''"
              @input="$emit('patch', { yearMax: $event.target.value === '' ? null : Number($event.target.value) })"
            />
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">资料条目 (条)</div>
          <div class="pf-inline">
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.docsBounds?.min ?? undefined"
              :max="facets?.docsBounds?.max ?? undefined"
              :placeholder="facets?.docsBounds?.min !== null && facets?.docsBounds?.min !== undefined ? `最小 ${Number(facets.docsBounds.min).toLocaleString()}` : '最小'"
              :value="draftFilters.docsMin ?? ''"
              @input="$emit('patch', { docsMin: $event.target.value === '' ? null : Number($event.target.value) })"
            />
            <span class="pf-sep">至</span>
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.docsBounds?.min ?? undefined"
              :max="facets?.docsBounds?.max ?? undefined"
              :placeholder="facets?.docsBounds?.max !== null && facets?.docsBounds?.max !== undefined ? `最大 ${Number(facets.docsBounds.max).toLocaleString()}` : '最大'"
              :value="draftFilters.docsMax ?? ''"
              @input="$emit('patch', { docsMax: $event.target.value === '' ? null : Number($event.target.value) })"
            />
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">专项数量 (个)</div>
          <div class="pf-inline">
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.entitiesBounds?.min ?? undefined"
              :max="facets?.entitiesBounds?.max ?? undefined"
              :placeholder="facets?.entitiesBounds?.min !== null && facets?.entitiesBounds?.min !== undefined ? `最小 ${Number(facets.entitiesBounds.min).toLocaleString()}` : '最小'"
              :value="draftFilters.entitiesMin ?? ''"
              @input="$emit('patch', { entitiesMin: $event.target.value === '' ? null : Number($event.target.value) })"
            />
            <span class="pf-sep">至</span>
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.entitiesBounds?.min ?? undefined"
              :max="facets?.entitiesBounds?.max ?? undefined"
              :placeholder="facets?.entitiesBounds?.max !== null && facets?.entitiesBounds?.max !== undefined ? `最大 ${Number(facets.entitiesBounds.max).toLocaleString()}` : '最大'"
              :value="draftFilters.entitiesMax ?? ''"
              @input="$emit('patch', { entitiesMax: $event.target.value === '' ? null : Number($event.target.value) })"
            />
          </div>
        </div>

        <div class="pf-row">
          <div class="pf-label">建筑面积 (㎡)</div>
          <div class="pf-inline">
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.areaBounds?.min ?? undefined"
              :max="facets?.areaBounds?.max ?? undefined"
              :placeholder="facets?.areaBounds?.min ? `最小 ${Number(facets.areaBounds.min).toLocaleString()}` : '最小'"
              :value="draftFilters.areaMin ?? ''"
              @input="$emit('patch', { areaMin: $event.target.value === '' ? null : Number($event.target.value) })"
            />
            <span class="pf-sep">至</span>
            <input
              class="pf-input"
              type="number"
              inputmode="numeric"
              :min="facets?.areaBounds?.min ?? undefined"
              :max="facets?.areaBounds?.max ?? undefined"
              :placeholder="facets?.areaBounds?.max ? `最大 ${Number(facets.areaBounds.max).toLocaleString()}` : '最大'"
              :value="draftFilters.areaMax ?? ''"
              @input="$emit('patch', { areaMax: $event.target.value === '' ? null : Number($event.target.value) })"
            />
          </div>
        </div>
      </div>

      <div class="pf-foot">
        <button class="btn ghost" @click="$emit('reset')">重置</button>
        <div style="flex:1"/>
        <button v-if="triggerMode === 'manual'" class="btn primary" :disabled="!pending" @click="$emit('apply')">应用筛选</button>
        <button v-else class="btn primary" @click="$emit('close')">完成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  draftFilters: { type: Object, required: true },
  facets: { type: Object, required: true },
  triggerMode: { type: String, required: true },
  pending: { type: Boolean, default: false },
})

defineEmits([
  'close',
  'reset',
  'apply',
  'patch',
  'toggle',
  'update:triggerMode',
])

watch(() => props.open, (v) => {
  if (!v) return
})

</script>

<style scoped>
.pf-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.35);
  z-index:60;
  display:flex;
  justify-content:flex-end;
}
.pf-panel{
  width:420px;
  max-width:100%;
  height:100%;
  background:rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
  border-left:1px solid rgba(0,0,0,0.06);
  display:flex;
  flex-direction:column;
}
.pf-head{
  padding:14px 14px 10px;
  border-bottom:1px solid rgba(0,0,0,0.06);
  display:flex;
  align-items:center;
  gap:10px;
}
.pf-title{
  display:flex;
  flex-direction:column;
  gap:2px;
}
.pf-title span:first-child{
  font-size:14px;
  font-weight:700;
  letter-spacing:0.2px;
}
.pf-sub{
  font-size:12px;
  opacity:0.75;
}
.pf-body{
  padding:12px 14px;
  overflow:auto;
  display:flex;
  flex-direction:column;
  gap:12px;
}
.pf-row{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.pf-label{
  font-size:12px;
  opacity:0.85;
}
.pf-inline{
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}
.pf-input{
  height:34px;
  padding:0 10px;
  border-radius:10px;
  border:1px solid rgba(0,0,0,0.10);
  background:rgba(255,255,255,0.9);
  outline:none;
  min-width:160px;
}
.pf-select{
  height:34px;
  padding:0 10px;
  border-radius:10px;
  border:1px solid rgba(0,0,0,0.10);
  background:rgba(255,255,255,0.9);
  outline:none;
  min-width:160px;
}
.pf-sep{
  font-size:12px;
  opacity:0.7;
}
.pf-chips{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}
.pf-chip{
  border:1px solid rgba(0,0,0,0.10);
  background:rgba(255,255,255,0.8);
  border-radius:999px;
  padding:7px 10px;
  font-size:12px;
  display:flex;
  gap:8px;
  align-items:center;
  cursor:pointer;
}
.pf-chip .c{
  opacity:0.6;
  font-variant-numeric: tabular-nums;
}
.pf-chip.active{
  border-color: rgba(77,201,255,0.65);
  box-shadow: 0 0 0 2px rgba(77,201,255,0.12) inset;
}
.pf-chip.disabled{
  opacity:0.45;
  cursor:not-allowed;
}
.pf-empty{
  font-size:12px;
  opacity:0.6;
  padding:6px 0;
}
.pf-foot{
  padding:12px 14px;
  border-top:1px solid rgba(0,0,0,0.06);
  display:flex;
  align-items:center;
  gap:10px;
}
.pf-badge{
  font-size:11px;
  padding:4px 8px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,0.08);
  background:rgba(255,255,255,0.7);
}
.pf-badge.warn{
  border-color: rgba(255,181,71,0.65);
  box-shadow: 0 0 0 2px rgba(255,181,71,0.12) inset;
}
.pf-radio{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:12px;
  opacity:0.9;
}
@media (max-width: 780px){
  .pf-overlay{ justify-content:stretch; }
  .pf-panel{ width:100%; border-left:none; }
  .pf-body{ padding-bottom:18px; }
  .pf-input,.pf-select{ min-width: 0; flex:1; }
}
</style>
