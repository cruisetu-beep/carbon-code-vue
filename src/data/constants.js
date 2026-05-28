// ═══════════════════════════════════════════════════════════════
// 全局常量：图谱颜色、节点类型标签、向导数据
// ═══════════════════════════════════════════════════════════════

export const DV_COLORS = {
  building: "#4dc9ff",
  subsystem: "#2bd9a8",
  group: "#5fd0c0",
  device: "#a799ff",
  metric: "#ffb547",
  doc: "#ff6b8a",
  chunk: "#ffd4dc",
  standard: "#ff8a47",
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
};

export const SUBSYSTEMS = [
  {k:"sub_meter", n:"分项计量", icon:"panel", color:"#4dc9ff",
    desc:"按 照明插座 / 空调 / 动力 / 特殊用电 拆分",
    fields: [
      {k:"meter_count", n:"计量点位数量", t:"number", ph:"个", req:true},
      {k:"meter_protocol", n:"通讯协议", t:"select", opts:["Modbus-RTU","Modbus-TCP","BACnet","MQTT","其他"]},
      {k:"meter_freq", n:"采集频率", t:"select", opts:["1 分钟","5 分钟","15 分钟","小时"]},
      {k:"meter_start", n:"接入时间", t:"date"},
    ]},
  {k:"vpp", n:"虚拟电厂", icon:"bolt", color:"#7a5cff",
    desc:"可调节负荷 / 需求响应 / 储能资源",
    fields: [
      {k:"vpp_capacity", n:"可调节容量 (kW)", t:"number", ph:"0"},
      {k:"vpp_response", n:"响应时间", t:"select", opts:["秒级","分钟级","小时级"]},
      {k:"vpp_battery", n:"储能容量 (kWh)", t:"number", ph:"0"},
      {k:"vpp_market", n:"参与市场", t:"select", opts:["需求响应","辅助服务","现货市场","均参与"]},
    ]},
  {k:"retrofit", n:"节能改造", icon:"leaf", color:"#2bd9a8",
    desc:"已实施或规划中的节能项目",
    fields: [
      {k:"retrofit_count", n:"改造项目数", t:"number", ph:"个"},
      {k:"retrofit_invest", n:"累计投入 (万元)", t:"number", ph:"0"},
      {k:"retrofit_save", n:"年节能量 (万 kWh)", t:"number", ph:"0"},
      {k:"retrofit_status", n:"主要类型", t:"select", opts:["冷热源","照明","围护结构","控制系统","综合"]},
    ]},
  {k:"charge", n:"充电桩", icon:"plug", color:"#ffb547",
    desc:"电动汽车充电基础设施",
    fields: [
      {k:"charge_slow", n:"慢充桩数量", t:"number", ph:"个"},
      {k:"charge_fast", n:"快充桩数量", t:"number", ph:"个"},
      {k:"charge_power", n:"总装机功率 (kW)", t:"number", ph:"0"},
      {k:"charge_v2g", n:"是否支持 V2G", t:"select", opts:["否","部分支持","全部支持"]},
    ]},
  {k:"pv", n:"光伏", icon:"sun", color:"#ff8a47",
    desc:"屋顶 / BIPV 光伏发电系统",
    fields: [
      {k:"pv_capacity", n:"装机容量 (kWp)", t:"number", ph:"0"},
      {k:"pv_area", n:"光伏面积 (㎡)", t:"number", ph:"0"},
      {k:"pv_type", n:"组件类型", t:"select", opts:["单晶硅","多晶硅","薄膜","BIPV"]},
      {k:"pv_year", n:"投运年份", t:"number", ph:"YYYY"},
    ]},
];

export const DOC_TYPES = [
  {k:"audit", n:"能源审计报告", desc:"能耗诊断 / 设备运行 / 节能潜力", required:true},
  {k:"equip", n:"建筑设备清单", desc:"机电系统 / 设备型号台账", required:true},
  {k:"retrofit", n:"建筑改造项目报告", desc:"历次节能改造方案", required:false},
  {k:"drawing", n:"建筑图纸", desc:"CAD / 平面 / 立面 / 系统图", required:false},
  {k:"standard", n:"考核评价标准", desc:"地方碳考核办法 / 限额", required:false},
];

export const FUNC_MAP = {office:"办公", mall:"商场", hotel:"酒店", hospital:"医院", school:"学校", mixed:"综合体"};

export const SAMPLE_DOCS = {
  audit: [
    {name:"2024年度能源审计报告.pdf", size:"4.2 MB", pages: 86},
  ],
  equip: [
    {name:"机电设备总清单_v2.3.xlsx", size:"1.8 MB", pages: 12},
  ],
  retrofit: [
    {name:"2022冷源系统改造总结.docx", size:"6.4 MB", pages: 42},
    {name:"照明LED改造方案.pdf", size:"2.1 MB", pages: 18},
  ],
  drawing: [
    {name:"T1主楼平面图.dwg", size:"12.6 MB", pages: 1},
  ],
  standard: [],
};

export const STEPS = [
  {k:"basic", n:"建筑基础信息", d:"建筑标识与功能属性"},
  {k:"docs",  n:"资料文档",     d:"上传 + AI 自动解析"},
  {k:"subs",  n:"子项配置",     d:"分项 / VPP / 改造 / 充电 / 光伏"},
  {k:"graph", n:"图谱构建",     d:"知识库智能融合"},
  {k:"done",  n:"完成",         d:"资源包就绪"},
];
