// ═══════════════════════════════════════════════════════════════
// 全局常量：图谱颜色、节点类型标签、向导数据
// ═══════════════════════════════════════════════════════════════

export const DV_COLORS = {
  building: "#4dc9ff",
  subsystem: "#2bd9a8",
  group: "#a799ff",
  device: "#a799ff",
  metric: "#ffb547",
  doc: "#ff6b8a",
  chunk: "#a799ff",
  standard: "#ff8a47",
  obsolete: "#e0394f",
};

export const DV_TYPE_LABEL = {
  building: "建筑",
  subsystem: "子系统",
  group: "设备组",
  device: "设备",
  metric: "指标",
  doc: "文档",
  chunk: "切片",
  standard: "标准",
  obsolete: "淘汰与低效设备",
};

export const SUBSYSTEMS = [
  {
    k: "T001", n: "分项计量", icon: "panel", color: "#4dc9ff",
    desc: "按 照明插座 / 空调 / 动力 / 特殊用电 拆分",
    docs: [
      { k: "audit", n: "能源审计报告", desc: "能耗诊断 / 设备运行 / 节能潜力", required: true },
      { k: "equip", n: "建筑设备清单", desc: "机电系统 / 设备型号台账", required: true },
    ]
  },
  {
    k: "T002", n: "绿色建筑", icon: "tag", color: "#2bd9a8",
    desc: "国家星级绿色建筑或绿色商店认证",
    docs: []
  },
  {
    k: "T003", n: "节能改造", icon: "leaf", color: "#a799ff",
    desc: "已实施或规划中的节能项目",
    docs: [
      { k: "retrofit", n: "建筑改造项目报告", desc: "历次节能改造方案", required: false }
    ]
  },
  {
    k: "T004", n: "超低能耗建筑", icon: "cube", color: "#ffb547",
    desc: "超低能耗/近零能耗建筑指标管理",
    docs: []
  },
  {
    k: "T005", n: "充电桩", icon: "plug", color: "#ff8a47",
    desc: "电动汽车充电基础设施",
    docs: [
      { k: "drawing", n: "建筑图纸", desc: "CAD / 车位平面布局图", required: false }
    ]
  },
  {
    k: "T006", n: "光伏", icon: "sun", color: "#7a5cff",
    desc: "屋顶 / BIPV 光伏发电系统",
    docs: [
      { k: "drawing", n: "建筑图纸", desc: "CAD / 光伏点位布局图", required: false }
    ]
  },
  {
    k: "T007", n: "虚拟电厂", icon: "bolt", color: "#6a4eff",
    desc: "可调节负荷 / 需求响应 / 储能资源",
    docs: [
      { k: "standard", n: "考核评价标准", desc: "地方碳考核办法 / 限额", required: false }
    ]
  },
  {
    k: "T008", n: "重点用能单位", icon: "database", color: "#ff6b8a",
    desc: "万家企业等重点用能单位监控",
    docs: []
  },
  {
    k: "T009", n: "节能宣传", icon: "bell", color: "#4dc9ff",
    desc: "建筑内部节能低碳宣传及培训",
    docs: []
  },
  {
    k: "T010", n: "能源审计", icon: "doc", color: "#2bd9a8",
    desc: "定期执行的建筑综合能源审计",
    docs: []
  },
  {
    k: "T011", n: "能效对标", icon: "scan", color: "#a799ff",
    desc: "国家/地方能效定额对标",
    docs: []
  },
  {
    k: "T012", n: "楼宇调适", icon: "settings", color: "#ffb547",
    desc: "暖通空调及照明控制系统调适",
    docs: []
  },
  {
    k: "T013", n: "能效提升", icon: "sparkles", color: "#ff8a47",
    desc: "重点设备或系统的能效提升方案",
    docs: []
  },
  {
    k: "T014", n: "低碳实践区", icon: "factory", color: "#7a5cff",
    desc: "区域碳中和及低碳建筑实践",
    docs: []
  },
  {
    k: "T015", n: "碳效码", icon: "scan", color: "#6a4eff",
    desc: "建筑碳排放效能评级与赋码",
    docs: []
  },
  {
    k: "T016", n: "绿电绿证", icon: "tag", color: "#ff6b8a",
    desc: "绿电交易与绿色电力证书购买",
    docs: []
  },
];

export const DOC_TYPES = [
  { k: "audit", n: "能源审计报告", desc: "能耗诊断 / 设备运行 / 节能潜力", required: true },
  { k: "equip", n: "建筑设备清单", desc: "机电系统 / 设备型号台账", required: true },
  { k: "retrofit", n: "建筑改造项目报告", desc: "历次节能改造方案", required: false },
  { k: "drawing", n: "建筑图纸", desc: "CAD / 平面 / 立面 / 系统图", required: false },
  { k: "standard", n: "考核评价标准", desc: "地方碳考核办法 / 限额", required: false },
];

export const FUNC_MAP = { office: "办公", mall: "商场", hotel: "酒店", hospital: "医院", school: "学校", mixed: "综合体" };

export const SAMPLE_DOCS = {
  audit: [
    { name: "2024年度能源审计报告.pdf", size: "4.2 MB", pages: 86 },
  ],
  equip: [
    { name: "机电设备总清单_v2.3.xlsx", size: "1.8 MB", pages: 12 },
  ],
  retrofit: [
    { name: "2022冷源系统改造总结.docx", size: "6.4 MB", pages: 42 },
    { name: "照明LED改造方案.pdf", size: "2.1 MB", pages: 18 },
  ],
  drawing: [
    { name: "T1主楼平面图.dwg", size: "12.6 MB", pages: 1 },
  ],
  standard: [],
};

export const STEPS = [
  { k: "basic", n: "建筑基础信息", d: "建筑标识与功能属性" },
  { k: "subs", n: "子项与资料配置", d: "分项 / VPP / 资料上传" },
  { k: "obsolete", n: "淘汰设备清单", d: "低效与淘汰设备台账" },
  { k: "graph", n: "图谱构建", d: "知识库智能融合" },
  { k: "done", n: "完成", d: "资源包就绪" },
];
