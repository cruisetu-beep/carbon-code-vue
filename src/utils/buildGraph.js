// ═══════════════════════════════════════════════════════════════
// 图谱构建工具函数
// ═══════════════════════════════════════════════════════════════

// ─── 节点类型颜色映射（与 constants.js 保持一致）───────────────
const TYPE_COLORS = {
  building:  '#4dc9ff',
  subsystem: '#4dc9ff',
  group:     '#2bd9a8',
  device:    '#ff8a47',
  doc:       '#a799ff',
  chunk:     '#ffb547',
  standard:  '#ff8a47',
}

// 二级节点类型 -> 前端展示类型
function nodeTypeOf(n) {
  if (!n) return 'group'
  if (n.type === 'file')         return 'doc'
  if (n.type === 'data')         return 'chunk'
  if (n.type === 'dataQuantity') return 'chunk'
  if (n.levelType === '文件节点') return 'doc'
  return 'group'
}

// 节点颜色：一级节点按子系统类型给色，其他按 type
const SUB_COLORS = {
  subEnergy:              '#4dc9ff',
  greenBuild:             '#2bd9a8',
  virtualDaynamo:         '#7a5cff',
  savingRenovation:       '#2bd9a8',
  energyAudit:            '#4dc9ff',
  benchmark:              '#a799ff',
  effictImprove:          '#ff8a47',
  energyUnit:             '#4dc9ff',
  solar:                  '#ff8a47',
  charge:                 '#ffb547',
  carbonQR:               '#2bd9a8',
  certificateGlectricity: '#2bd9a8',
  blueprint:              '#a799ff',
  others:                 '#888',
}

// ─── 图谱布局算法 ────────────────────────────────────────────
export function dvBuildGraph(detail, expandedSubsystem, expandedDoc) {
  const W = 1000, H = 700
  const cx = W / 2, cy = H / 2
  const nodes = []
  const edges = []

  // L0 建筑根节点
  nodes.push({
    id: 'building', type: 'building', name: '建筑',
    x: cx, y: cy, r: 22,
    ref: detail.building,
  })

  // 取一级节点列表（来自接口 _rootNode.children，过滤 aiSummary）
  const lv1List = (detail._rootNode?.children || detail.subsystems || [])
    .filter(n => n.type !== 'aiSummary' && n.type !== 'root')

  const totalL1 = lv1List.length
  const angleStep = (Math.PI * 2) / Math.max(totalL1, 1)
  const startAngle = -Math.PI / 2

  lv1List.forEach((lv1, i) => {
    const ang = startAngle + i * angleStep
    const R = 200
    const x = cx + Math.cos(ang) * R
    const y = cy + Math.sin(ang) * R
    const color = SUB_COLORS[lv1.type] || '#4dc9ff'

    nodes.push({
      id: lv1.id,
      type: 'subsystem',
      name: lv1.name,
      x, y, r: 14,
      parent: 'building',
      ref: lv1,
      angle: ang,
      color,
      _apiType: lv1.type,
    })
    edges.push({ from: 'building', to: lv1.id, kind: 'owns' })

    // L2：当此一级节点被展开时，展出二级节点
    if (expandedSubsystem === lv1.id) {
      const children = (lv1.children || []).filter(n => n.type !== 'aiSummary')
      const fanCount = children.length
      if (fanCount > 0) {
        const fanSpan = Math.min(Math.PI * 0.9, Math.max(Math.PI / 4, fanCount * 0.25))
        const fanStart = ang - fanSpan / 2

        children.forEach((lv2, j) => {
          const a = fanCount === 1 ? ang : fanStart + (fanSpan / (fanCount - 1)) * j
          const R2 = 320
          const nx = cx + Math.cos(a) * R2
          const ny = cy + Math.sin(a) * R2
          const lv2type = nodeTypeOf(lv2)

          nodes.push({
            id: lv2.id,
            type: lv2type,
            name: lv2.name,
            x: nx, y: ny, r: 9,
            parent: lv1.id,
            ref: lv2,
            angle: a,
            color,
          })
          edges.push({ from: lv1.id, to: lv2.id, kind: lv2type === 'doc' ? 'describes' : 'contains' })

          // L3：当此二级节点被展开时，展出三级节点（文件节点）
          if (expandedDoc === lv2.id) {
            const lv3List = (lv2.children || []).filter(n => n.type !== 'aiSummary')
            const lv3Count = lv3List.length
            if (lv3Count > 0) {
              const subSpan = Math.min(Math.PI * 0.5, Math.max(Math.PI / 6, lv3Count * 0.2))
              const subStart = a - subSpan / 2

              lv3List.forEach((lv3, k) => {
                const subA = lv3Count === 1 ? a : subStart + (subSpan / (lv3Count - 1)) * k
                const R3 = 420
                const lx = cx + Math.cos(subA) * R3
                const ly = cy + Math.sin(subA) * R3

                nodes.push({
                  id: lv3.id,
                  type: 'doc',
                  name: lv3.name,
                  x: lx, y: ly, r: 6,
                  parent: lv2.id,
                  ref: lv3,
                  color,
                })
                edges.push({ from: lv2.id, to: lv3.id, kind: 'describes' })
              })
            }
          }
        })
      }
    }
  })

  return { nodes, edges, W, H }
}

export function dvFindNode(nodes, id) {
  return nodes.find(n => n.id === id)
}

export function dvNodeAncestors(nodes, id) {
  const path = []
  let cur = dvFindNode(nodes, id)
  while (cur) {
    path.unshift(cur)
    cur = cur.parent ? dvFindNode(nodes, cur.parent) : null
  }
  return path
}
