<template>
  <!-- 空状态 -->
  <div v-if="!node" class="dv-panel-empty">
    <AppIcon name="cube" :size="32" stroke="#4dc9ff"/>
    <div>请在图谱中选择节点查看详情</div>
  </div>

  <!-- 按节点类型分发 -->
  <BuildingPanel  v-else-if="node.type === 'building'"
    :node="node" :detail="detail" :pkg="pkg"
    @selectNode="$emit('selectNode', $event)"/>

  <SubsystemPanel v-else-if="node.type === 'subsystem'"
    :node="node" :detail="detail" :pkg="pkg"
    @selectNode="$emit('selectNode', $event)"/>

  <GroupPanel     v-else-if="node.type === 'group'"
    :node="node" :detail="detail"
    @selectNode="$emit('selectNode', $event)"/>

  <DevicePanel    v-else-if="node.type === 'device'"
    :node="node" :detail="detail"
    @selectNode="$emit('selectNode', $event)"/>

  <DocPanel       v-else-if="node.type === 'doc'"
    :node="node" :detail="detail"
    @selectNode="$emit('selectNode', $event)"
    @hoverChunk="$emit('hoverChunk', $event)"/>

  <ChunkPanel     v-else-if="node.type === 'chunk'"
    :node="node" :detail="detail"
    @selectNode="$emit('selectNode', $event)"/>

  <StandardPanel  v-else-if="node.type === 'standard'"
    :node="node" :detail="detail"
    @selectNode="$emit('selectNode', $event)"/>
</template>

<script setup>
import AppIcon       from '../shared/AppIcon.vue'
import BuildingPanel  from './panels/BuildingPanel.vue'
import SubsystemPanel from './panels/SubsystemPanel.vue'
import GroupPanel     from './panels/GroupPanel.vue'
import DevicePanel    from './panels/DevicePanel.vue'
import DocPanel       from './panels/DocPanel.vue'
import ChunkPanel     from './panels/ChunkPanel.vue'
import StandardPanel  from './panels/StandardPanel.vue'

defineProps({
  node:   { type: Object, default: null },
  detail: { type: Object, required: true },
  pkg:    { type: Object, required: true },
})
defineEmits(['selectNode', 'hoverChunk'])
</script>
