/**
 * 碳效码新建资源包向导 - 动态日志生成器
 * 本模块负责将用户在前几步录入的基础信息、子系统配置、上传的凭证文档以及淘汰设备台账，
 * 结构化地转化为在第四步构建图谱时展示的详细 AI 解析与构建日志。
 * 
 * 主要功能：
 * 1. generateLogPool: 接收 pkg 全局数据，输出 Phase 0 - 4 的详细构建日志队列，在遇到 ERROR 时会伴随重试与 SUCCESS 提示。
 * 2. getRandomLogForPhase: 提供各阶段的随机补充日志，增强建图过程中的细节丰富度。
 */

import { SUBSYSTEMS } from '../../data/constants.js'

// 设备类型对应的中文标签
const getTypeLabel = (k) => {
  const map = {
    motor: '电动机', fan: '风机', pump: '泵', transformer: '变压器',
    boiler: '工业锅炉', compressor: '压缩机', chiller: '制冷设备', other: '其他'
  }
  return map[k] || '其他'
}

// 判定状态的中文标签
const getStatusLabel = (status) => {
  const map = {
    pending: '待判定',
    low_eff: '低效运行',
    phaseout: '限期淘汰',
    danger: '强制淘汰'
  }
  return map[status] || '待判定'
}

/**
 * 核心方法：基于用户前序步骤输入，动态生成五个阶段的日志列表
 * 每个阶段包含具体的解析、分析、错误、重试和成功日志
 * @param {Object} data 资源包主数据 (包含 code, title, subs, docs, obsoleteDevices 等)
 * @returns {Array<Array<Object>>} 长度为 5 的日志数组，每项对应构建的一个 Phase
 */
export function generateLogPool(data) {
  const pool = [[], [], [], [], []]
  
  const buildName = data.title || data.name || '目标建筑'
  const buildCode = data.code || '—'
  const docs = data.docs || {}
  const allDocsList = Object.values(docs).flat()
  const subs = data.subs || {}
  
  // 获取已启用的子系统中文名
  const enabledSubsNames = Object.entries(subs)
    .filter(([, v]) => v?.enabled)
    .map(([k]) => {
      const found = SUBSYSTEMS.find(s => s.k === k)
      return found ? found.n : k
    })
  const obsoleteDevices = data.obsoleteDevices || []

  // ────────────────────────────────────────────────────────
  // Phase 0: 多模态凭证 OCR 提取
  // ────────────────────────────────────────────────────────
  pool[0].push({ lv: 'info', msg: `启动知识库构建引擎，检测到目标建筑："#${buildName} (${buildCode})"` })
  if (enabledSubsNames.length > 0) {
    pool[0].push({ lv: 'info', msg: `扫描并加载已启用的子系统台账：#${enabledSubsNames.join('、#')}` })
  }
  
  if (allDocsList.length > 0) {
    pool[0].push({ lv: 'info', msg: `发现待解析凭证文档 ×${allDocsList.length}，启动多模态 OCR 字符提取管道...` })
    allDocsList.forEach((d, index) => {
      pool[0].push({ lv: 'info', msg: `正在抽取并规范文件 "${d.name}" 的文本信息（共 ${d.pages || 5} 页）...` })
      
      // 模拟第1个文件发生读取失败和重试
      if (index === 0) {
        pool[0].push({ lv: 'info', msg: `检测到凭证 "${d.name}" 包含非文本扫描页，正在调用 OCR 识别字符...` })
        pool[0].push({ lv: 'info', msg: `正在进行深度优化：启动多模态视觉大模型 OCR 辅助识别...` })
        pool[0].push({ lv: 'ok', msg: `视觉大模型特征识别完成，成功提取全部页面文本，OCR 管道继续` })
      }
      
      const chunkCount = d.chunks || Math.floor((d.pages || 5) * 4.6)
      pool[0].push({ lv: 'ok', msg: `"${d.name}" 多模态提取完成，切分出 ${chunkCount} 个文本语义分段` })
    })
  } else {
    pool[0].push({ lv: 'warn', msg: `未检测到上传的凭证文档，跳过 OCR 提取阶段` })
  }

  // ────────────────────────────────────────────────────────
  // Phase 1: 建筑技术实体抽取
  // ────────────────────────────────────────────────────────
  pool[1].push({ lv: 'info', msg: `启动命名实体识别（NER）管道，分析项目台账资产属性...` })
  
  // 1. 抽取子系统实体
  if (enabledSubsNames.length > 0) {
    enabledSubsNames.forEach(subName => {
      pool[1].push({ lv: 'info', msg: `分析子系统台账，成功抽取并定义节点实体：[子系统:${subName}]` })
    })
    pool[1].push({ lv: 'ok', msg: `已抽取并建立 ${enabledSubsNames.length} 个子系统根节点实体` })
  }

  // 2. 抽取淘汰设备实体并模拟重试
  if (obsoleteDevices.length > 0) {
    obsoleteDevices.forEach((dev, index) => {
      pool[1].push({ lv: 'info', msg: `解析淘汰设备台账，正在定位设备 "${dev.name} (${dev.code})" 现场资料...` })
      pool[1].push({ lv: 'info', msg: `正在识别设备 "${dev.code}" 现场铭牌照片中的规格参数与投运年份...` })
      
      // 模拟第1个设备发生图片解析失败，并通过关联设备清单成功修正的日志
      if (index === 0) {
        pool[1].push({ lv: 'info', msg: `检测到设备铭牌反光，正在执行铭牌图像去噪与清晰度增强...` })
        pool[1].push({ lv: 'info', msg: `启动融合识别：比对并关联上传的 "主要用能设备清单" 进行多源校验...` })
        pool[1].push({ lv: 'ok', msg: `多源校验校准成功！已校正规格型号为 "${dev.model || '标准型号'}"，投运年份为 ${dev.year || '2018'} 年` })
      }
      
      pool[1].push({ lv: 'ok', msg: `设备 "${dev.name}" 抽取完成，判定其为「${getStatusLabel(dev.status)}」状态，依据理由："${dev.reason || '能效超限运行'}"` })
    })
  } else {
    pool[1].push({ lv: 'info', msg: `未录入待处理低效与淘汰设备，跳过设备实体分析` })
  }

  // ────────────────────────────────────────────────────────
  // Phase 2: 关系推断与连边
  // ────────────────────────────────────────────────────────
  pool[2].push({ lv: 'info', msg: `启动图谱拓扑推断引擎，自动计算并链接关联拓扑结构...` })
  
  // 建立建筑与子系统之间的边
  if (enabledSubsNames.length > 0) {
    enabledSubsNames.forEach(subName => {
      pool[2].push({ lv: 'info', msg: `建立拓扑连边：(建筑:"${buildCode}")-[包含子系统]->(子系统:${subName})` })
    })
  }
  
  // 建立建筑与淘汰设备之间的边
  if (obsoleteDevices.length > 0) {
    obsoleteDevices.forEach(dev => {
      pool[2].push({ lv: 'info', msg: `建立拓扑连边：(建筑:"${buildCode}")-[包含设备]->(设备:${dev.code})` })
      pool[2].push({ lv: 'info', msg: `建立逻辑连边：(设备:${dev.code})-[判定依据]->(文档:淘汰设备台账)` })
    })
  }

  // 关联文档
  if (allDocsList.length > 0) {
    allDocsList.forEach(d => {
      pool[2].push({ lv: 'info', msg: `建立逻辑连边：(子系统)-[关联凭证]->(文档:"${d.name}")` })
    })
  }

  const estEdgesCount = Math.max(15, enabledSubsNames.length * 2 + obsoleteDevices.length * 3 + allDocsList.length * 2)
  pool[2].push({ lv: 'ok', msg: `关系拓扑推断结束，成功生成并合并 ${estEdgesCount} 条图谱网络关系连边` })

  // ────────────────────────────────────────────────────────
  // Phase 3: 向量化与索引
  // ────────────────────────────────────────────────────────
  pool[3].push({ lv: 'info', msg: `启动高维向量计算流水线，准备将文本分段转换为 1536 维语义向量...` })
  
  if (allDocsList.length > 0) {
    allDocsList.forEach((d, index) => {
      const chunkCount = d.chunks || Math.floor((d.pages || 5) * 4.6)
      pool[3].push({ lv: 'info', msg: `计算语义特征：正在对 "${d.name}" 的 ${chunkCount} 个切片生成 Embedding 向量...` })
      
      // 模拟向量持久化写入超时重试
      if (index === 0) {
        pool[3].push({ lv: 'info', msg: `向量知识库写入通道占用，正在缓存当前已生成的语义向量切片...` })
        pool[3].push({ lv: 'info', msg: `启动批处理缓存区刷盘：正在将切片向量批量提交至持久化存储...` })
        pool[3].push({ lv: 'ok', msg: `批处理数据持久化完成，切片向量已成功全部安全录入向量库` })
      }
    })
    pool[3].push({ lv: 'ok', msg: `语义嵌入向量全部写入完毕，重新构建向量空间 HNSW 索引` })
  } else {
    pool[3].push({ lv: 'info', msg: `无文档需要执行向量化计算，跳过本阶段` })
  }

  // ────────────────────────────────────────────────────────
  // Phase 4: 质量校验与发布
  // ────────────────────────────────────────────────────────
  pool[4].push({ lv: 'info', msg: `启动图谱质量合规自检，验证悬挂孤立节点与闭环图拓扑...` })
  pool[4].push({ lv: 'info', msg: `加载国家标准《GB 50189-2015 公共建筑节能设计标准》条款，进行比对自查...` })
  pool[4].push({ lv: 'info', msg: `比对分析中：将当前能耗数据与当地能耗约束值及引导值执行符合性分析...` })
  pool[4].push({ lv: 'ok', msg: `自检合格：关系网络一致性验证 100%，无悬挂节点` })
  pool[4].push({ lv: 'ok', msg: `碳效码资源包图谱已构建完成，正式发布为可查询版本！` })

  return pool
}

// 各个阶段的随机日志池，用来填补进度条更新时日志多余的拍数
const FALLBACK_RANDOM_LOGS = [
  // Phase 0
  [
    { lv: 'info', msg: '正在对文本段执行格式标准化，消除多余控制符号...' },
    { lv: 'info', msg: '应用去噪处理算法，提升低分辨率 PDF 的识别精度...' },
    { lv: 'info', msg: '对齐实体属性：提取建筑地理边界坐标...' }
  ],
  // Phase 1
  [
    { lv: 'info', msg: '提取能效指标实体：[额定能效(COP): 6.8]...' },
    { lv: 'info', msg: '绑定节点属性：[建成年代: 2018年]' },
    { lv: 'info', msg: '提取并绑定用电点位信息...' }
  ],
  // Phase 2
  [
    { lv: 'info', msg: '拓扑层级计算：确定节点子孙层级' },
    { lv: 'info', msg: '建立关联：(设备)-[电能计量表]->(分项电表)' },
    { lv: 'ok', msg: '成功添加回路拓扑连边 ×3' }
  ],
  // Phase 3
  [
    { lv: 'info', msg: '生成切片语义嵌入向量，编码方法：bge-m3' },
    { lv: 'info', msg: '将向量数据写入高维向量库空间...' },
    { lv: 'ok', msg: '向量空间索引重建成功，响应延迟 P99 < 50ms' }
  ],
  // Phase 4
  [
    { lv: 'info', msg: '条款匹配成功：检测到符合 GB 50189 第 4.2.10 条要求' },
    { lv: 'info', msg: '关系网络闭环性校验正常...' },
    { lv: 'ok', msg: '数据库事务提交通过，图谱进入可用状态' }
  ]
]

export function getRandomLogForPhase(ph) {
  const pool = FALLBACK_RANDOM_LOGS[ph] || []
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
