<template>
  <div class="dv-outline">
    <div class="dv-outline-head">
      <AppIcon name="database" :size="14" stroke="#4dc9ff"/>
      <span>知识库结构</span>
    </div>

    <!-- 建筑根节点 -->
    <TreeNode
      nodeId="building" type="building"
      :name="detail._buildName || detail._raw?.resourceName || pkg.name"
      :selectedId="selectedId"
      :defaultOpen="true"
      @select="$emit('select', $event)"
    >
      <!-- 一级节点：直接来自接口 _rootNode.children，过滤掉 aiSummary -->
      <template v-if="rootChildren.length">
        <TreeNode
          v-for="lv1 in rootChildren" :key="lv1.id"
          :nodeId="lv1.id" type="subsystem"
          :name="lv1.name"
          :selectedId="selectedId"
          @select="$emit('select', $event)"
        >
          <!-- 二级节点：过滤掉 aiSummary -->
          <TreeNode
            v-for="lv2 in childrenOf(lv1)" :key="lv2.id"
            :nodeId="lv2.id"
            :type="nodeType(lv2)"
            :name="lv2.name"
            :count="countOf(lv2)"
            :selectedId="selectedId"
            @select="$emit('select', $event)"
          >
            <!-- 三级节点：文件节点 -->
            <TreeNode
              v-for="lv3 in childrenOf(lv2)" :key="lv3.id"
              :nodeId="lv3.id"
              type="doc"
              :name="lv3.name"
              :selectedId="selectedId"
              @select="$emit('select', $event)"
            />
          </TreeNode>
        </TreeNode>
      </template>

      <!-- 降级：如果接口节点为空，退回到 subsystems 列表 -->
      <template v-else>
        <TreeNode
          v-for="s in detail.subsystems" :key="s.id"
          :nodeId="s.id" type="subsystem"
          :name="s.name"
          :selectedId="selectedId"
          @select="$emit('select', $event)"
        />
      </template>
    </TreeNode>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon  from '../shared/AppIcon.vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  detail:     { type: Object, required: true },
  pkg:        { type: Object, required: true },
  selectedId: { type: String, default: '' },
})
defineEmits(['select'])

// 一级节点列表（过滤掉 aiSummary 和 root 类型）
const rootChildren = computed(() => {
  const nodes = props.detail._rootNode?.children || []
  return nodes.filter(n => n.type !== 'aiSummary')
})

// 获取子节点，过滤掉 aiSummary
const childrenOf = (node) =>
  (node.children || []).filter(n => n.type !== 'aiSummary')

// 节点类型映射
const nodeType = (node) => {
  if (node.type === 'file') return 'doc'
  if (node.type === 'data' || node.type === 'dataQuantity') return 'chunk'
  if (node.levelType === '文件节点') return 'doc'
  return 'group'
}

// 数量标注
const countOf = (node) => {
  if (node.type === 'file') {
    const cnt = Array.isArray(node.data) ? node.data.length : 0
    return cnt > 0 ? `${cnt}份` : ''
  }
  if (node.type === 'modelConfig') {
    const cnt = Array.isArray(node.data) ? node.data.length : 0
    return cnt > 0 ? `${cnt}条` : ''
  }
  if (node.type === 'data') {
    const cnt = Array.isArray(node.data) ? node.data.length : 0
    return cnt > 0 ? `${cnt}条` : ''
  }
  return ''
}
</script>
