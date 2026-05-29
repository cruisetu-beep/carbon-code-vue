<template>
  <div class="dv-outline">
    <div class="dv-outline-head">
      <AppIcon name="database" :size="14" stroke="#4dc9ff"/>
      <span>知识库结构</span>
    </div>

    <!-- 建筑根节点 -->
    <TreeNode
      :nodeId="'building'" type="building"
      :name="detail._raw?.resourceName || pkg.name" :selectedId="selectedId"
      :defaultOpen="true"
      @select="$emit('select', $event)"
    >
      <!-- 子系统 -->
      <TreeNode
        v-for="s in detail.subsystems" :key="s.id"
        :nodeId="s.id" type="subsystem"
        :name="s.name" :count="s.stats?.[0]?.v || ''"
        :selectedId="selectedId"
        @select="$emit('select', $event)"
      >
        <!-- 设备组 -->
        <TreeNode
          v-for="g in groupsOf(s)" :key="g.id"
          :nodeId="g.id" type="group"
          :name="g.name" :selectedId="selectedId"
          @select="$emit('select', $event)"
        >
          <!-- 设备 -->
          <TreeNode
            v-for="devId in g.devices || []" :key="devId"
            :nodeId="devId" type="device"
            :name="detail.devices?.[devId]?.name || devId"
            :selectedId="selectedId"
            @select="$emit('select', $event)"
          />
        </TreeNode>

        <!-- 文档 -->
        <TreeNode
          v-for="d in docsOf(s)" :key="d.id"
          :nodeId="d.id" type="doc"
          :name="d.name" :count="`${(d.chunks||[]).length}片`"
          :selectedId="selectedId"
          @select="$emit('select', $event)"
        >
          <!-- 切片（最多6条） -->
          <TreeNode
            v-for="cid in (d.chunks||[]).slice(0,6)" :key="cid"
            :nodeId="cid" type="chunk"
            :name="`#${detail.chunks?.[cid]?.idx} ${detail.chunks?.[cid]?.tags?.[0] || ''}`"
            :selectedId="selectedId"
            @select="$emit('select', $event)"
          />
        </TreeNode>
      </TreeNode>

      <!-- 适用标准 -->
      <TreeNode
        v-if="detail.standards?.length"
        nodeId="standards" type="subsystem"
        name="适用标准" :count="`${detail.standards.length}项`"
        :selectedId="selectedId"
        @select="$emit('select', $event)"
      >
        <TreeNode
          v-for="st in detail.standards" :key="st.id"
          :nodeId="st.id" type="standard"
          :name="st.name" :selectedId="selectedId"
          @select="$emit('select', $event)"
        />
      </TreeNode>
    </TreeNode>
  </div>
</template>

<script setup>
import AppIcon  from '../shared/AppIcon.vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  detail:     { type: Object, required: true },
  pkg:        { type: Object, required: true },
  selectedId: { type: String, default: '' },
})
defineEmits(['select'])

const groupsOf = (s) =>
  (s.groups || [])
    .map(gid => ({ id: gid, ...props.detail.groups?.[gid] }))
    .filter(g => g.name)

const docsOf = (s) =>
  (s.docs || [])
    .map(did => ({ id: did, ...props.detail.docs?.[did] }))
    .filter(d => d.name)
</script>
