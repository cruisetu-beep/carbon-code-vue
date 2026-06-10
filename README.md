# carbon-code-vue

建筑碳效码资源包可视化平台。为每栋建筑构建能源知识图谱，呈现建筑与其分项计量、虚拟电厂、节能改造等子系统之间的关联关系，并通过 AI 对建筑资源包进行智能解析与摘要。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建 | Vite |
| 状态 | Pinia |
| HTTP | axios |
| 图表 | ECharts（图谱 `graph` 系列，`layout: none` 手动坐标） |
| 样式 | 原生 CSS，全局变量集中在 `src/assets/global.css` |

---

## 目录结构

```
src/
├── api/
│   ├── http.js              # axios 实例，baseURL 读 VITE_API_BASE_URL，统一解包 {result, data}
│   ├── packages.js          # 接口统一出口，受 MOCK 开关控制
│   ├── _real.js             # 真实后端接口实现
│   └── mock/packages.js     # Mock 实现（列表页专用）
│
├── components/
│   ├── list/
│   │   ├── ListView.vue     # 资源包列表页
│   │   └── PkgTile.vue      # 列表卡片
│   ├── detail/
│   │   ├── DetailView.vue   # 详情页主视图（三栏布局 + loading 动画）
│   │   ├── GraphCanvas.vue  # 中间 ECharts 图谱
│   │   ├── OutlineTree.vue  # 左侧树形目录
│   │   ├── TreeNode.vue     # 树节点递归组件
│   │   ├── NodePanel.vue    # 右侧面板路由（按节点类型分发）
│   │   ├── panels/          # 各类型节点的右侧面板
│   │   │   ├── BuildingPanel.vue    # 建筑根节点：状态卡片 + AI 总结
│   │   │   ├── SubsystemPanel.vue   # 一级子系统节点
│   │   │   ├── GroupPanel.vue       # 二级设备组节点
│   │   │   ├── DevicePanel.vue      # 设备节点
│   │   │   ├── DocPanel.vue         # 文档节点
│   │   │   ├── ChunkPanel.vue       # 文档切片节点
│   │   │   └── StandardPanel.vue    # 标准规范节点
│   │   └── shared/          # 详情页内公用组件
│   │       ├── AISummary.vue        # 打字机动效 AI 摘要框
│   │       ├── PanelHeader.vue      # 面板头部（图标 + 类型 + 标题）
│   │       ├── StatTile.vue         # 指标卡片（label / value / unit）
│   │       ├── MiniBars.vue         # 迷你柱状图
│   │       ├── MiniLine.vue         # 迷你折线图
│   │       ├── ConfidenceBadge.vue  # AI 置信度徽章
│   │       └── TagChip.vue          # 标签胶囊
│   ├── shared/
│   │   ├── TopBar.vue       # 顶部导航栏
│   │   ├── Breadcrumb.vue   # 面包屑
│   │   └── AppIcon.vue      # 图标组件（自绘 SVG 图标集）
│   └── wizard/              # 创建资源包向导（5步）
│       ├── WizardShell.vue  # 向导外壳与流程控制
│       ├── StepBasic.vue    # 第1步：建筑基础信息
│       ├── StepSubsystems.vue # 第2步：子系统与资料配置
│       ├── StepObsolete.vue # 第3步：淘汰设备列表
│       ├── StepGraph.vue    # 第4步：图谱构建过程效果
│       ├── StepDone.vue     # 第5步：完成内容预览
│       └── subsystems/      # 各子系统动态台账组件与配置
│           ├── SubEnergy.vue              # T001: 分项计量台账组件
│           ├── GreenBuild.vue             # T002: 绿色建筑台账组件
│           ├── SavingRenovation.vue       # T003: 节能改造台账组件
│           ├── UltraLowEnergy.vue         # T004: 超低能耗建筑台账组件
│           ├── Charge.vue                 # T005: 充电桩台账组件
│           ├── Solar.vue                  # T006: 光伏储能台账组件
│           ├── VirtualDynamo.vue          # T007: 虚拟电厂台账组件
│           ├── EnergyUnit.vue             # T008: 重点用能单位台账组件
│           ├── EnergySavingPublicity.vue  # T009: 节能宣传台账组件
│           ├── EnergyAudit.vue            # T010: 能源审计台账组件
│           ├── Benchmark.vue              # T011: 能效对标台账组件
│           ├── BuildingAdjustment.vue     # T012: 楼宇调适台账组件
│           ├── EffictImprove.vue          # T013: 能效提升台账组件
│           ├── LowCarbonDistrict.vue      # T014: 低碳实践区台账组件
│           ├── CarbonQR.vue               # T015: 碳效码评级台账组件
│           ├── CertificateElectricity.vue  # T016: 绿电绿证台账组件
│           └── columnOptions.js           # 子系统下拉框/配置选项数据辅助处理工具
│
├── stores/
│   └── packages.js          # Pinia store，含接口数据适配逻辑 adaptDetail()
│
├── data/
│   ├── constants.js         # DV_COLORS / DV_TYPE_LABEL / SUBSYSTEMS 等全局常量
│   ├── samplePkgs.js        # 列表页静态 Mock 数据（MOCK=true 时使用）
│   └── pdT1Detail.js        # 浦东T1详情页完整 Mock 数据
│
├── utils/
│   ├── buildGraph.js        # 接口数据 → ECharts nodes/edges 的转换函数
│   └── classnames.js        # cx() 工具函数
│
├── assets/global.css        # 全局 CSS 变量与公用类
├── config.js                # MOCK 开关（true = 使用 mock，false = 走真实接口）
└── main.js
```

---

## 数据流

```
真实接口（详情页，始终启用）
GET https://www.ttbems.com:14442/CarbonData4AIAgentAPI/api/Resource/getResourceRelationData?buildId={buildId}
  └─→ stores/packages.js  adaptDetail()
        ├─→ GraphCanvas.vue   渲染 ECharts 图谱
        ├─→ OutlineTree.vue   渲染左侧树
        └─→ NodePanel.vue     点击节点后渲染右侧面板

列表接口（受 MOCK 开关控制）
MOCK=true  → src/data/samplePkgs.js（本地静态）
MOCK=false → GET /api/Resource/getResourceList（真实后端）
```

后端响应统一格式：
```json
{ "result": true, "data": { ... } }
```
`http.js` 响应拦截器自动解包，业务代码直接拿到 `data`。

---

## 核心数据结构

### buildId
列表页每条记录有一个 `buildId`（如 `310101A001`），用于调用详情接口。

### 详情接口返回（raw）
```js
{
  name: "建筑名称",
  nodes: {                  // 建筑根节点 (type: "root")
    id, type, name, data,
    children: [             // 一级节点列表（子系统）
      {
        id, type, name, data,
        children: [         // 二级节点
          {
            id, type, name, data,
            children: []    // 三级节点（文件/数据）
          }
        ]
      }
    ]
  }
}
```
`aiSummary` 类型节点在 `adaptDetail()` 中被过滤，不进入图谱。

### 子系统类型 → 颜色/图标映射
定义在 `stores/packages.js` 的 `MODULE_META`：

| type 字符串 | 含义 | 颜色 |
|---|---|---|
| `subEnergy` | 分项计量 | `#4dc9ff` |
| `virtualDaynamo` | 虚拟电厂 | `#7a5cff` |
| `savingRenovation` | 节能改造 | `#2bd9a8` |
| `solar` | 光伏 | `#ff8a47` |
| `charge` | 充电桩 | `#ffb547` |
| `carbonQR` | 碳效码 | `#2bd9a8` |
| `energyAudit` | 能源审计 | `#4dc9ff` |

---

## 图谱渲染（GraphCanvas.vue）

- ECharts `graph` 系列，`layout: 'none'`，坐标由前端手动计算
- 环形布局：L0（建筑）居中，L1（子系统）第一圈，L2（设备组/文档）第二圈，L3（文件/数据）第三圈
- 节点颜色：L0 蓝 `#4dc9ff` / L1 绿 `#2bd9a8` / L2 紫 `#a799ff` / L3 橙 `#ffb547` / 文件红 `#ff6b8a`
- 连接线颜色：L0→L1 绿色实线 / L1→L2 紫色实线 / L2→L3 橙红虚线
- 点击节点触发 `nodeClick` 事件，由 `DetailView.vue` 接收并更新右侧面板

---

## 右侧面板（NodePanel → panels/）

`NodePanel.vue` 根据节点 `type` 分发到对应面板组件。  
`BuildingPanel.vue` 是最重要的面板，显示建筑整体信息，包含：
- 状态统计卡片（文档数 / 实体数 / 关系边 / 向量组）
- `AISummary.vue` 打字机动效摘要（AI 智能解析文本）

---

## 样式约定

- 颜色常量统一在 `src/data/constants.js` 的 `DV_COLORS`
- 全局公用 class 在 `src/assets/global.css`（`.dv-canvas-toolbar` / `.dv-panel` / `.dv-stat-tile` 等）
- 不使用 CSS 框架，不使用 scoped style，组件样式写全局 class

---

## 本地启动

```bash
npm install
npm run dev
```

默认 `MOCK=true`，列表页展示静态数据，详情页点击任意卡片走真实接口。  
切换全真实接口：修改 `src/config.js` 中 `export const MOCK = false`。

---

## 当前已知限制

- 列表页 6 条静态数据，`buildId` 仅有 `310101A001` / `310101A090` 两个值
- Wizard（创建向导）目前为纯 UI，提交接口尚未对接
- 直接提交 `main` 分支，暂无 PR 流程

## 页面设计

### 资源包列表

负责展示系统中所有已构建或构建中的建筑知识库资源包。不仅提供基础的陈列，更集成了企业级的高级检索与筛选体验：

- **核心视图 (`ListView.vue`)**：作为主入口，负责数据加载、状态分发以及页面整体瀑布流式或网格化布局。支持按搜索框关键字快速定位。
- **资源包卡片 (`PkgTile.vue`)**：高度定制化的网格展示卡片，直观呈现单体建筑的缩略资产信息（如建筑类型、图谱解析规模、启用子系统的彩色徽章等）。
- **高级筛选引擎 (`filter/` 目录)**：
  - **`PkgFilterPanel.vue`**：提供抽屉式/下拉式的多维度组合检索面板，支持按地域、建筑功能、建成年代、启用的技术分类（如是否包含光伏、虚拟电厂）等条件进行交叉检索。
  - **`pkgFilterCore.js`**：独立封装的纯 JS 过滤算法核心。它负责解析面板抛出的各种复杂组合条件，进行高性能的多级数据过滤计算，彻底实现了视图与查询业务逻辑的解耦。

### 资源包新建

包含了将传统静态建筑数据转化为智能知识库图谱的一体化向导流程，共分五步：

#### 第一步：建筑基础信息
用于录入或确认目标建筑的基础标识，包括建筑名称、编号、功能类别（如办公、商业等）、总建筑面积、建成年代及所在地区。这些底层基准信息将决定后续能效对标和碳效码计算的基础阈值。

#### 第二步：子系统配置
全方位归集建筑内的所有技术资产与管理体系（涵盖分项计量、虚拟电厂、光伏、绿电交易等 16 个核心模块）。针对启用的子系统，支持动态填写业务台账，并集中上传各子系统的非结构化凭证文档（如审计报告、设备清单、标准规范），为后续的 AI 解析奠定语料基础。

#### 第三步：淘汰设备列表
专属的低效与淘汰设备台账管理模块。支持基于图文（设备铭牌、现场实景照）的快速录入与文件归集。对排查出的高耗能落后设备进行定级（强制淘汰、限期淘汰或低效建议改造），并分类挂载说明书、维保或检测记录等辅助材料，从而在后续评估中精确发掘建筑的减碳潜力点。

#### 第四步：图谱构建过程效果
可视化呈现多模态数据向智能图谱转化的全过程。界面以动态流水线的形式展示 AI 引擎在后台执行的 OCR 文本抽取、文档语义切片、实体与业务标签智能提取、以及高维向量化的进度，实时追踪知识网格的生长状态。

#### 第五步：完成内容预览
智能包成功入库后的全局数字概览面板。不仅能自动统计生成的实体关系数与切片规模，还会动态汇总各个子系统的现状并自动输出专属的 AI 节能洞察（如设备改造替换带来的碳效提升预测）。同时提供详尽的入库文档清单及平滑顺畅的后续操作入口（如直接进入碳效码计算或开启 AI 问答）。

### 资源包详细
