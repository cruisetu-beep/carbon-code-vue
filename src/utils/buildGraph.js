// ═══════════════════════════════════════════════════════════════
// 图谱构建工具函数
// ═══════════════════════════════════════════════════════════════
import { PD_T1_DETAIL } from '../data/pdT1Detail.js'
import { FUNC_MAP, SUBSYSTEMS } from '../data/constants.js'

export function generateTagsFor(type, name) {
  const all = {
    audit: [
      {k:"entity", n:"#冷水机组"}, {k:"entity", n:"#变配电系统"}, {k:"metric", n:"#年综合能耗"},
      {k:"metric", n:"#EUI=98.2"}, {k:"", n:"#GB/T17981"}, {k:"", n:"#夏季工况"}, {k:"entity", n:"#锅炉"},
    ],
    equip: [
      {k:"entity", n:"#冷机×4"}, {k:"entity", n:"#冷却塔×6"}, {k:"entity", n:"#AHU×38"},
      {k:"metric", n:"#额定功率"}, {k:"", n:"#型号台账"},
    ],
    retrofit: [
      {k:"", n:"#冷源改造"}, {k:"metric", n:"#节能率15.2%"}, {k:"entity", n:"#磁悬浮主机"},
      {k:"", n:"#投资回收期"}, {k:"", n:"#LED改造"},
    ],
    drawing: [
      {k:"entity", n:"#平面布局"}, {k:"", n:"#层高3.6m"}, {k:"entity", n:"#机房位置"},
    ],
    standard: [
      {k:"", n:"#考核办法"}, {k:"metric", n:"#能耗限额"},
    ],
  };
  const pool = all[type] || [];
  return pool.slice(0, Math.floor(Math.random()*3)+3);
}

export function dvBuildSimpleDetail(pkg) {
  const subs = (pkg.subs || []).map(k => {
    const base = SUB_SUMMARIES[k] || {};
    const colorMap = {sub_meter:"#4dc9ff", vpp:"#7a5cff", retrofit:"#2bd9a8", charge:"#ffb547", pv:"#ff8a47"};
    return {
      id: k, key: k, name: base.n || k, color: colorMap[k] || "#4dc9ff", icon: SUB_ICON[k] || "panel",
      summary: base.summary || "AI 已完成该子系统的初步建模与数据接入。",
      stats: (base.highlights || []).map(h => ({ l: h.l, v: h.v, t: h.t })),
      realtime: null,
      groups: [],
      docs: [`gen_doc_${k}`],
      devices: [],
    };
  });
  const docs = {};
  subs.forEach(s => {
    docs[`gen_doc_${s.key}`] = {
      name: `${s.name}方案与运行数据.pdf`, type: "report", size: "4.2 MB", pages: 38,
      uploadAt: pkg.updated?.split(" ")[0] || "2025-01-01",
      summary: `${s.name}相关方案与运行数据，AI 已自动解析关键参数并入库。`,
      tags: [`#${s.name}`, "#AI解析"],
      chunks: [`gen_chk_${s.key}_01`, `gen_chk_${s.key}_02`, `gen_chk_${s.key}_03`],
      parent: s.key,
    };
  });
  const chunks = {};
  Object.keys(docs).forEach(did => {
    docs[did].chunks.forEach((cid, i) => {
      chunks[cid] = {
        docId: did, idx: i+1,
        excerpt: `${docs[did].name} 第 ${i+1} 段：AI 自动切片识别的关键内容片段，已建立与图谱中相关实体的关联...`,
        tags: ["#AI切片"], links: [], confidence: 92 + Math.floor(Math.random()*6),
      };
    });
  });
  return {
    building: {
      summary: `${pkg.name} 是 ${pkg.year} 年投运的${FUNC_MAP[pkg.func]}建筑，建筑面积 ${pkg.area.toLocaleString()} ㎡。AI 知识库已完成基础解析，文档与设备数据正持续接入中。`,
      stats: { docs: pkg.docs, entities: pkg.entities, edges: Math.floor(pkg.entities*3.2), vectors: Math.floor(pkg.entities*0.8), devices: Math.floor(pkg.entities*0.3), metrics: Math.floor(pkg.entities*0.2), chunks: pkg.docs*6, standards: 4 },
      energy30d: Array.from({length:30},()=>600+Math.floor(Math.random()*400)),
    },
    subsystems: subs,
    groups: {},
    devices: {},
    docs,
    chunks,
    standards: [],
  };
}

export function dvGetDetail(pkg) {
  if (pkg.code === "SH-PD-A0123") return PD_T1_DETAIL;
  return dvBuildSimpleDetail(pkg);
}

// ─── 图谱节点/边布局算法 ────────────────────────────────────────
export function dvBuildGraph(detail, expandedSubsystem, expandedDoc) {
  const W = 1000, H = 700;
  const cx = W/2, cy = H/2;
  const nodes = []; // {id, type, name, x, y, r, parent, ref}
  const edges = []; // {from, to, kind}

  // L0 建筑根
  nodes.push({ id: "building", type: "building", name: "建筑", x: cx, y: cy, r: 22, ref: detail.building });

  // L1 子系统：环绕一圈
  const subs = detail.subsystems || [];
  const standards = detail.standards || [];
  const totalL1 = subs.length + (standards.length > 0 ? 1 : 0);
  const angleStep = (Math.PI * 2) / Math.max(totalL1, 1);
  const startAngle = -Math.PI / 2; // 12点方向开始

  subs.forEach((s, i) => {
    const ang = startAngle + i * angleStep;
    const R = 200;
    const x = cx + Math.cos(ang) * R;
    const y = cy + Math.sin(ang) * R;
    nodes.push({ id: s.id, type: "subsystem", name: s.name, x, y, r: 14, parent: "building", ref: s, angle: ang, color: s.color });
    edges.push({ from: "building", to: s.id, kind: "owns" });

    // L2 当此子系统展开时，挂出 group/doc 节点
    if (expandedSubsystem === s.id) {
      const groups = (s.groups || []).map(gid => detail.groups?.[gid]).filter(Boolean);
      const docs = (s.docs || []).map(did => detail.docs?.[did] && {id: did, ...detail.docs[did]}).filter(Boolean);
      const all = [...groups.map((g, idx) => ({_kind:"group", id: s.groups[idx], ...g})), ...docs.map(d => ({_kind:"doc", ...d}))];
      const fanCount = all.length;
      if (fanCount > 0) {
        // 在子系统外侧动态扇形展开：子节点数越多，扇形越宽
        const fanSpan = Math.min(Math.PI * 0.95, Math.max(Math.PI / 4, fanCount * 0.22));
        const fanStart = ang - fanSpan/2;
        all.forEach((item, j) => {
          const a = fanCount === 1 ? ang : (fanStart + (fanSpan / (fanCount-1)) * j);
          const R2 = 320;
          const nx = cx + Math.cos(a) * R2;
          const ny = cy + Math.sin(a) * R2;
          if (item._kind === "group") {
            nodes.push({ id: item.id, type: "group", name: item.name, x: nx, y: ny, r: 9, parent: s.id, ref: item, color: s.color });
            edges.push({ from: s.id, to: item.id, kind: "contains" });
            // L3 设备
            const devs = (item.devices || []).map(did => detail.devices?.[did] && {id: did, ...detail.devices[did]}).filter(Boolean);
            devs.forEach((d, k) => {
              const subA = a + (k - (devs.length-1)/2) * 0.06;
              const R3 = 400;
              const dx = cx + Math.cos(subA) * R3;
              const dy = cy + Math.sin(subA) * R3;
              nodes.push({ id: d.id, type: "device", name: d.name, x: dx, y: dy, r: 6, parent: item.id, ref: d, color: s.color });
              edges.push({ from: item.id, to: d.id, kind: "has" });
            });
          } else {
            // doc
            nodes.push({ id: item.id, type: "doc", name: item.name, x: nx, y: ny, r: 8, parent: s.id, ref: item, color: s.color });
            edges.push({ from: s.id, to: item.id, kind: "describes" });
            // L3 chunks 仅当此 doc 被展开时挂出
            if (expandedDoc === item.id) {
              const chunks = (item.chunks || []).slice(0, 8);
              chunks.forEach((cid, k) => {
                const cref = detail.chunks?.[cid];
                if (!cref) return;
                const subA = a + (k - (chunks.length-1)/2) * 0.05;
                const R3 = 410;
                const cxn = cx + Math.cos(subA) * R3;
                const cyn = cy + Math.sin(subA) * R3;
                nodes.push({ id: cid, type: "chunk", name: `chunk #${cref.idx}`, x: cxn, y: cyn, r: 4, parent: item.id, ref: cref });
                edges.push({ from: item.id, to: cid, kind: "split" });
              });
            }
          }
        });
      }
    }
  });

  // 标准节点
  if (standards.length > 0) {
    const ang = startAngle + subs.length * angleStep;
    const R = 200;
    const stdHubX = cx + Math.cos(ang) * R;
    const stdHubY = cy + Math.sin(ang) * R;
    nodes.push({ id: "standards", type: "subsystem", name: "适用标准", x: stdHubX, y: stdHubY, r: 12, parent: "building", ref: { name: "适用标准", color: "#ff8a47" }, isStd: true });
    edges.push({ from: "building", to: "standards", kind: "complies" });
    if (expandedSubsystem === "standards") {
      const fanSpan = Math.min(Math.PI * 0.6, Math.max(Math.PI / 5, standards.length * 0.22));
      const fanStart = ang - fanSpan/2;
      standards.forEach((st, j) => {
        const a = standards.length === 1 ? ang : (fanStart + (fanSpan / (standards.length-1)) * j);
        const R2 = 320;
        const sx = cx + Math.cos(a) * R2;
        const sy = cy + Math.sin(a) * R2;
        nodes.push({ id: st.id, type: "standard", name: st.name, x: sx, y: sy, r: 8, parent: "standards", ref: st });
        edges.push({ from: "standards", to: st.id, kind: "ref" });
      });
    }
  }

  return { nodes, edges, W, H };
}

export function dvFindNode(nodes, id) {
  return nodes.find(n => n.id === id);
}

export function dvNodeAncestors(nodes, id) {
  const path = [];
  let cur = dvFindNode(nodes, id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parent ? dvFindNode(nodes, cur.parent) : null;
  }
  return path;
}
