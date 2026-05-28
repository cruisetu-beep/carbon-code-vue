<template>
  <div class="dv-tree-node">
    <div
      :class="['dv-tree-row', isSelected && 'sel', `t-${type}`]"
      @click="$emit('select', nodeId)"
    >
      <span class="dv-tree-arrow" @click.stop="hasChildren && (open = !open)">
        <AppIcon v-if="hasChildren && open"  name="chevron-down"  :size="10"/>
        <AppIcon v-else-if="hasChildren"     name="chevron-right" :size="10"/>
      </span>
      <span class="dv-tree-dot" :style="{ background: DV_COLORS[type] }"/>
      <span class="dv-tree-name">{{ name }}</span>
      <span v-if="count != null" class="dv-tree-count">{{ count }}</span>
    </div>
    <div v-if="open && hasChildren" class="dv-tree-children">
      <slot/>
    </div>
  </div>
</template>

<script>
// 声明组件名使自引用递归生效
export default { name: 'TreeNode' }
</script>

<script setup>
import { ref, computed, useSlots } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import { DV_COLORS } from '../../data/constants.js'

const props = defineProps({
  nodeId:      { type: String,  required: true },
  type:        { type: String,  required: true },
  name:        { type: String,  required: true },
  count:       { type: [String, Number], default: null },
  selectedId:  { type: String,  default: '' },
  defaultOpen: { type: Boolean, default: false },
})
defineEmits(['select'])

const slots = useSlots()
const open  = ref(props.defaultOpen)

const hasChildren = computed(() => !!slots.default)
const isSelected  = computed(() => props.selectedId === props.nodeId)
</script>
