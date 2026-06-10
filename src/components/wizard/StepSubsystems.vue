<template>
  <div class="step-subs float-in" style="display: flex; gap: 20px; align-items: flex-start;">
    
    <!-- 左侧：子项列表 -->
    <div class="subs-list-side" style="width: 240px; flex-shrink: 0; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.03); padding: 16px; position: sticky; top: 80px; display: flex; flex-direction: column; max-height: calc(100vh - 120px); overflow-y: auto;">
      <div class="section-head" style="padding-bottom:12px;margin-bottom:12px;border-bottom:1px dashed var(--line);display:flex;gap:10px;align-items:center">
        <div style="width:28px;height:28px;display:grid;place-items:center;background:linear-gradient(135deg,#eaf2ff,#d8e4fb);border-radius:8px;color:var(--brand)">
          <AppIcon name="graph" :size="16"/>
        </div>
        <div>
          <h3 style="margin:0;font-size:14px;font-weight:600">子项配置</h3>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px">
            已启用 <strong style="color:var(--brand)">{{ enabledCount }} / {{ filteredSubsystems.length }}</strong>
          </div>
        </div>
      </div>

      <!-- 接口数据加载进度条 -->
      <div v-if="totalToLoad > 0" class="load-progress-bar-container" style="margin-bottom: 16px; padding: 4px 0;">
        <div style="width: 100%; height: 4px; background: #e6effc; border-radius: 2px; overflow: hidden; position: relative;">
          <div :style="{ width: `${loadProgress}%` }" style="height: 100%; background: linear-gradient(90deg, #4dc9ff, var(--brand)); border-radius: 2px; transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- 子项选项卡 (纵向排版，恢复描述与样式) -->
      <div class="vertical-subs-tabs">
        <div v-for="(s, idx) in filteredSubsystems" :key="s.k"
             :class="['vertical-sub-tag', active === s.k && 'active', subs[s.k]?.enabled && 'enabled']"
             :style="{ '--c': s.color }"
             @click="active = s.k">
          <div class="ic">
            <AppIcon :name="s.icon" :size="14"/>
          </div>
          <div class="text-content">
            <div class="n-row">
              <div class="sub-name-wrap">
                <span class="n">{{ s.n }}</span>
                <span v-if="loadStates[s.k]?.status === 'loading'" class="load-badge loading">
                  <span class="spinner-dot"/> 加载中
                </span>
                <span v-else-if="loadStates[s.k]?.status === 'done' && loadStates[s.k]?.count > 0" class="load-badge success">
                  已回填 {{ loadStates[s.k].count }}
                </span>
                <span v-else-if="loadStates[s.k]?.status === 'error'" class="load-badge error">
                  加载失败
                </span>
              </div>
              <div class="toggle" @click.stop="toggleEnable(s.k)"/>
            </div>
            <div class="d">{{ s.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间：详情配置面板 -->
    <div class="subs-panel" style="flex:1; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.03); display: flex; flex-direction: column;">
      
      <div style="padding: 24px;">
        <!-- 当前子项详情 -->
        <div v-if="activeSub" :class="['sub-detail', !subs[active]?.enabled && 'disabled']" :style="{ '--c': activeSub.color }">
        <div class="sub-detail-head">
          <div class="ic"><AppIcon :name="activeSub.icon" :size="20"/></div>
          <div style="flex:1">
            <h4>{{ activeSub.n }}</h4>
            <div class="d">{{ activeSub.desc }}</div>
            <div v-if="activeLoadState.status !== 'idle'" class="detail-load-tip">
              <span v-if="activeLoadState.status === 'loading'" class="detail-load-inline">
                <span class="spinner-dot"/> 正在查询并回填接口数据
              </span>
              <span v-else-if="activeLoadState.status === 'done' && activeLoadState.count > 0">
                已从接口回填 {{ activeLoadState.count }} 条记录
              </span>
              <span v-else-if="activeLoadState.status === 'done'">
                当前子项暂无可回填数据
              </span>
              <span v-else-if="activeLoadState.status === 'error'">
                接口加载失败：{{ activeLoadState.error || '请稍后重试' }}
              </span>
            </div>
          </div>
          <button v-if="!subs[active]?.enabled" class="btn primary" style="padding:8px 16px;font-size:12px" @click="toggleEnable(active)">
            <AppIcon name="plus" :size="12"/> 启用此子项
          </button>
          <span v-else class="badge ok"><AppIcon name="check" :size="11"/> 已启用</span>
        </div>

        <div class="sub-section-title">基础参数</div>
        <div style="margin-bottom: 20px;">
          <component
            v-if="subComponents[active]"
            :is="subComponents[active]"
            v-bind="activeComponentProps"
            @update:formData="val => setSub(active, val)"
          >
            <template #attachment="{ item }">
              <div class="record-attachment-box" style="grid-column: 1 / -1; width: 100%; box-sizing: border-box; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--line); text-align: left;">
                
                <div v-if="!getRecordProjectID(item || subs[active])" style="padding: 12px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 6px; color: #d46b08; font-size: 12px;">
                  <span style="font-weight: 500;">提示：</span>请先在上方表单中录入并保存当前记录的项目ID，回填生成后方可上传相关附件。
                </div>
                
                <div v-else>
                  <div style="font-size: 12px; font-weight: 600; margin-bottom: 12px; color: var(--brand); display: flex; align-items: center; justify-content: space-between;">
                    <span>项目附件管理 (项目ID: {{ getRecordProjectID(item || subs[active]) }})</span>
                    <span style="font-size: 10px; font-weight: 400; color: var(--text-3)">对应记录的专属附件</span>
                  </div>
                  
                  <!-- 遍历当前 activeSub 的文档分类定义 -->
                  <div v-if="activeSub.docs && activeSub.docs.length > 0">
                    <div v-for="dt in activeSub.docs" :key="dt.k" class="sub-attachment-item" style="margin-bottom: 12px;">
                      <!-- 上方类别标题 -->
                      <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                        <span>
                          {{ dt.n }}
                          <span v-if="dt.required" class="req" style="color:var(--danger)">*</span>
                        </span>
                        <span style="font-size: 10px; font-weight: 400; color: var(--text-3)">{{ dt.desc }}</span>
                      </div>
                      
                      <!-- 下部：左侧上传按钮，右侧文件列表 -->
                      <div style="display: flex; gap: 12px; align-items: flex-start; background: #fafbfe; border: 1px solid var(--line); border-radius: 6px; padding: 10px;">
                        <!-- 左侧上传 -->
                        <div class="mini-upload-btn" @click="triggerFileInput(dt.k, getRecordProjectID(item || subs[active]))">
                          <AppIcon name="plus" :size="14"/>
                          <span style="font-size: 10px; font-weight: 500; margin-top: 2px;">选择文件</span>
                        </div>
                        
                        <!-- 右侧列表 -->
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; min-height: 52px; justify-content: center;">
                          <div v-if="docsOf(dt.k, getRecordProjectID(item || subs[active])).length === 0" style="font-size: 11px; color: var(--text-3); padding-left: 2px;">
                            暂无已上传附件
                          </div>
                          <div v-else v-for="d in docsOf(dt.k, getRecordProjectID(item || subs[active]))" :key="d.id" class="mini-doc-item">
                            <div style="color: var(--brand); display: flex;"><AppIcon name="doc" :size="12"/></div>
                            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;">
                              <div class="name-row" style="font-size: 11px; font-weight: 500; color: var(--text-1); display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                                <span :title="d.name" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; flex: 1;">{{ d.name }}</span>
                                <span v-if="d.stage === 5" class="badge-done">已入库</span>
                                <span v-else style="color: var(--brand); font-size: 9px; flex-shrink: 0;">{{ STAGE_LABELS[d.stage] }}…</span>
                              </div>
                              <div style="font-size: 9px; color: var(--text-3)">{{ d.size }}</div>
                              <div v-if="d.stage < 5" class="doc-progress" style="width: 100%; height: 2px; background: #f0f0f0; border-radius: 1px; overflow: hidden; margin-top: 2px;">
                                <div class="fill" :style="{ width: `${d.progress}%` }" style="height: 100%; background: var(--brand); transition: width 0.3s;" />
                              </div>
                            </div>
                            <button class="mini-del-btn" @click.stop="removeDoc(dt.k, d.id, getRecordProjectID(item || subs[active]))">
                              <AppIcon name="trash" :size="11"/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 默认的其他附件 -->
                  <div class="sub-attachment-item" style="margin-bottom: 12px;">
                    <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                      <span>其他附件</span>
                      <span style="font-size: 10px; font-weight: 400; color: var(--text-3)">其他非分类的或辅助性证明文件</span>
                    </div>
                    
                    <div style="display: flex; gap: 12px; align-items: flex-start; background: #fafbfe; border: 1px solid var(--line); border-radius: 6px; padding: 10px;">
                      <div class="mini-upload-btn" @click="triggerFileInput('other', getRecordProjectID(item || subs[active]))">
                        <AppIcon name="plus" :size="14"/>
                        <span style="font-size: 10px; font-weight: 500; margin-top: 2px;">选择文件</span>
                      </div>
                      
                      <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; min-height: 52px; justify-content: center;">
                        <div v-if="docsOf('other', getRecordProjectID(item || subs[active])).length === 0" style="font-size: 11px; color: var(--text-3); padding-left: 2px;">
                          暂无已上传附件
                        </div>
                        <div v-else v-for="d in docsOf('other', getRecordProjectID(item || subs[active]))" :key="d.id" class="mini-doc-item">
                          <div style="color: var(--brand); display: flex;"><AppIcon name="doc" :size="12"/></div>
                          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;">
                            <div class="name-row" style="font-size: 11px; font-weight: 500; color: var(--text-1); display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                              <span :title="d.name" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; flex: 1;">{{ d.name }}</span>
                              <span v-if="d.stage === 5" class="badge-done">已入库</span>
                              <span v-else style="color: var(--brand); font-size: 9px; flex-shrink: 0;">{{ STAGE_LABELS[d.stage] }}…</span>
                            </div>
                            <div style="font-size: 9px; color: var(--text-3)">{{ d.size }}</div>
                            <div v-if="d.stage < 5" class="doc-progress" style="width: 100%; height: 2px; background: #f0f0f0; border-radius: 1px; overflow: hidden; margin-top: 2px;">
                              <div class="fill" :style="{ width: `${d.progress}%` }" style="height: 100%; background: var(--brand); transition: width 0.3s;" />
                            </div>
                          </div>
                          <button class="mini-del-btn" @click.stop="removeDoc('other', d.id, getRecordProjectID(item || subs[active]))">
                            <AppIcon name="trash" :size="11"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </component>
        </div>

        <div class="sub-section-title">数据接口</div>
        <div class="field">
          <label class="field-label">实时数据接入</label>
          <div style="display:grid;grid-template-columns:1fr 140px;gap:10px">
            <input class="input mono" placeholder="API Endpoint / IP:Port"
                   :value="getFullEndpoint(active) || ''"
                   readonly
                   style="background: #f5f7fa; cursor: not-allowed; color: var(--text-3);" />
            <button class="btn" style="justify-content:center"
                    :disabled="testStates[active] === 'testing'"
                    @click="testConnection(active)">
              <span v-if="testStates[active] === 'testing'" class="spinner-dot" style="margin-right: 4px;"/>
              <AppIcon v-else name="zap" :size="12"/>
              {{ testStates[active] === 'testing' ? '测试中...' : '测试连接' }}
            </button>
          </div>
        </div>



      </div>
      </div>

      <!-- 底部操作 -->
      <div class="form-actions" style="padding:16px 24px;border-top:1px solid var(--line);background:linear-gradient(180deg,#f8faff,#f3f6fb);border-radius:0 0 12px 12px;display:flex;justify-content:flex-end;align-items:center;gap:10px">
        <div style="font-size:12px;color:var(--text-2);margin-right:auto">
          <template v-if="enabledCount === 0">未启用任何子项也可继续，但可能影响碳效计算精度</template>
          <template v-else>已启用 {{ enabledCount }} 个子项，相关资料可稍后补充上传</template>
        </div>
        <button class="btn ghost" @click="$emit('prev')"><AppIcon name="chevron-left" :size="14"/> 上一步</button>
        <button class="btn primary" :disabled="!canNext" @click="$emit('next')" :style="{ opacity: canNext ? 1 : 0.6 }">
          下一步 · 图谱构建 <AppIcon name="sparkles" :size="14"/>
        </button>
      </div>
    </div>

    <!-- 右侧：图谱预览 + AI 解析状态 -->
    <div class="ai-side" style="width: 280px; flex-shrink: 0; position:sticky;top:80px;display:flex;flex-direction:column;gap:16px">
      
      <div style="background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.03);padding:20px">
        <div class="ai-side-head">
          <div class="ai-orb"/>
          <div>
            <h4>图谱建模预览</h4>
            <div class="sub mono">知识图谱动态拓扑</div>
          </div>
        </div>

        <!-- 迷你图谱 SVG -->
        <svg viewBox="0 0 320 200" style="width:100%;height:140px;margin-bottom:8px">
          <defs>
            <radialGradient id="mg-center">
              <stop offset="0%" stop-color="#4dc9ff" stop-opacity="1"/>
              <stop offset="100%" stop-color="#2f7fff" stop-opacity="0.6"/>
            </radialGradient>
          </defs>
          <circle cx="160" cy="100" r="60" fill="none" stroke="rgba(77,201,255,0.1)" stroke-dasharray="2 4"/>
          <g v-for="(s, i) in enabledSubs" :key="s.k">
            <line x1="160" y1="100" :x2="subX(i)" :y2="subY(i)" :stroke="s.color" stroke-opacity="0.4" stroke-width="1"/>
            <circle :cx="subX(i)" :cy="subY(i)" r="12" :fill="`color-mix(in srgb, ${s.color} 20%, transparent)`" :stroke="s.color" stroke-width="1.2"/>
            <text :x="subX(i)" :y="subY(i)+3" text-anchor="middle" font-size="8" :fill="s.color" font-family="Noto Sans SC">{{ s.n }}</text>
          </g>
          <circle cx="160" cy="100" r="18" fill="url(#mg-center)" stroke="#4dc9ff" stroke-width="1.5"/>
          <text x="160" y="98"  text-anchor="middle" font-size="8"  fill="white"  font-weight="600">{{ (data.name || '建筑').slice(0, 6) }}</text>
          <text x="160" y="110" text-anchor="middle" font-size="6"  fill="#eaf2ff" font-family="JetBrains Mono">{{ data.code || '—' }}</text>
        </svg>

        <!-- 图谱统计 -->
        <div style="padding:10px 0;display:flex;gap:8px">
          <div style="flex:1;padding:10px;background:#f5f9ff;border:1px solid var(--line);border-radius:8px;text-align:center">
            <div style="font-family:Orbitron;font-size:16px;color:var(--brand)">{{ estNodes }}</div>
            <div style="font-size:10px;color:var(--text-2)">节点预估</div>
          </div>
          <div style="flex:1;padding:10px;background:#f5f9ff;border:1px solid var(--line);border-radius:8px;text-align:center">
            <div style="font-family:Orbitron;font-size:16px;color:#6a4eff">{{ estEdges }}</div>
            <div style="font-size:10px;color:var(--text-2)">关系预估</div>
          </div>
        </div>
      </div>

      <div style="background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.03);padding:20px;flex:1">
        <div class="ai-side-head">
          <div class="ico" style="background:#eaf2ff;color:var(--brand);padding:6px;border-radius:6px"><AppIcon name="cpu" :size="16"/></div>
          <div>
            <h4>AI 解析流水线</h4>
            <div class="sub mono">多模态文档处理</div>
          </div>
        </div>

        <div v-if="allDocs.length > 0" class="parse-pipeline" style="margin-top:16px">
          <div v-for="s in PARSE_STAGES" :key="s.k"
               :class="['pipe-step', maxStage > s.k && 'done', maxStage === s.k && activeDoc && 'active']">
            <div class="dot">
              <AppIcon v-if="maxStage > s.k" name="check" :size="10"/>
              <template v-else>{{ s.k }}</template>
            </div>
            <div class="label" style="font-size:12px">{{ s.n }}</div>
          </div>
        </div>
        <div v-else style="padding:30px 12px;font-size:11px;color:var(--text-3);text-align:center">
          上传资料后，此处将展示 AI 解析流水线状态
        </div>
      </div>

    </div>

    <!-- 隐藏的真实文件选择框 -->
    <input type="file" ref="fileInputEl" style="display: none" multiple @change="onFileSelect" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, defineAsyncComponent, reactive } from 'vue'
import AppIcon from '../shared/AppIcon.vue'
import * as subApi from '../../api/subsystems.js'

const STATIC_SUBSYSTEMS = [
  {k:"T001", n:"分项计量", icon:"panel", color:"#4dc9ff",
    desc:"按 照明插座 / 空调 / 动力 / 特殊用电 拆分",
    docs: [
      { k: "audit", n: "能源审计报告", desc: "能耗诊断 / 设备运行 / 节能潜力", required: false },
      { k: "equip", n: "建筑设备清单", desc: "机电系统 / 设备型号台账", required: false },
      { k: "point_table", n: "分项计量点表", desc: "计量表计 / 点表配置说明", required: false },
      { k: "operation_manual", n: "系统操作手册", desc: "能耗监测平台操作手册", required: false }
    ]
  },
  {k:"T002", n:"绿色建筑", icon:"tag", color:"#2bd9a8",
    desc:"国家星级绿色建筑或绿色商店认证",
    docs: [
      { k: "green_build_certification", n: "绿建证书", desc: "星级绿色建筑或绿色商店证书", required: false },
      { k: "green_build_icon", n: "绿建图标", desc: "绿建标识或图标设计文件", required: false },
      { k: "construction_drawing", n: "方案图纸", desc: "建筑总体设计图纸/方案", required: false }
    ]
  },
  {k:"T003", n:"节能改造", icon:"leaf", color:"#a799ff",
    desc:"已实施或规划中的节能项目",
    docs: [
      { k: "retrofit", n: "建筑改造项目报告", desc: "历次节能改造方案", required: false },
      { k: "energy_saving_scheme", n: "节能改造方案", desc: "技术方案 / 节能潜力分析", required: false },
      { k: "acceptance_report", n: "验收评估报告", desc: "改造验收报告 / 效果评估", required: false }
    ]
  },
  {k:"T004", n:"超低能耗建筑", icon:"cube", color:"#ffb547",
    desc:"超低能耗/近零能耗建筑指标管理",
    docs: [
      { k: "ultra_low_energy_cert", n: "超低能耗建筑认证", desc: "国家或地方超低能耗认定证书", required: false },
      { k: "test_report", n: "系统测试报告", desc: "气密性测试 / 暖通调适测试报告", required: false }
    ]
  },
  {k:"T005", n:"充电桩", icon:"plug", color:"#ff8a47",
    desc:"电动汽车充电基础设施",
    docs: [
      { k: "drawing", n: "建筑图纸", desc: "CAD / 车位平面布局图", required: false },
      { k: "charge_pile_spec", n: "设备技术规格", desc: "充电桩设备说明书 / 规格书", required: false },
      { k: "grid_connection_perm", n: "电网接入许可", desc: "电力接入与开户报装文件", required: false }
    ]
  },
  {k:"T006", n:"光伏", icon:"sun", color:"#7a5cff",
    desc:"屋顶 / BIPV 光伏发电系统",
    docs: [
      { k: "drawing", n: "建筑图纸", desc: "CAD / 光伏点位布局图", required: false },
      { k: "pv_system_scheme", n: "光伏设计方案", desc: "光伏发电系统接入与设计方案", required: false },
      { k: "grid_acceptance", n: "并网验收意见书", desc: "电网公司并网验收与接入文件", required: false }
    ]
  },
  {k:"T007", n:"虚拟电厂", icon:"bolt", color:"#6a4eff",
    desc:"可调节负荷 / 需求响应 / 储能资源",
    docs: [
      { k: "standard", n: "考核评价标准", desc: "地方碳考核办法 / 限额", required: false },
      { k: "demand_response_agreement", n: "需求响应参与协议", desc: "负荷聚合商或电网签约协议", required: false },
      { k: "vd_load_test", n: "可调节负荷测试报告", desc: "系统响应能力与负荷测试报告", required: false }
    ]
  },
  {k:"T008", n:"重点用能单位", icon:"database", color:"#ff6b8a",
    desc:"万家企业等重点用能单位监控",
    docs: [
      { k: "energy_conservation_target", n: "节能目标责任书", desc: "政府下达的节能目标责任书", required: false },
      { k: "energy_utilization_status", n: "能源利用状况报告", desc: "年度能源利用状况报告及表单", required: false }
    ]
  },
  {k:"T009", n:"节能宣传", icon:"bell", color:"#4dc9ff",
    desc:"建筑内部节能低碳宣传及培训",
    docs: [
      { k: "publicity_material", n: "节能宣传画册", desc: "宣传海报 / 培训PPT / 活动照片", required: false },
      { k: "training_record", n: "节能培训记录", desc: "培训签到表 / 培训计划与总结", required: false }
    ]
  },
  {k:"T010", n:"能源审计", icon:"doc", color:"#2bd9a8",
    desc:"定期执行的建筑综合能源审计",
    docs: [
      { k: "audit", n: "能源审计报告", desc: "能耗诊断 / 设备运行 / 节能潜力", required: false },
      { k: "audit_rectification_plan", n: "审计整改方案", desc: "针对审计发现问题的整改计划", required: false }
    ]
  },
  {k:"T011", n:"能效对标", icon:"scan", color:"#a799ff",
    desc:"国家/地方能效定额对标",
    docs: [
      { k: "benchmark_report", n: "能效对标分析报告", desc: "与先进水平对比分析报告", required: false },
      { k: "quota_certificate", n: "能耗定额证明", desc: "年度能耗限额定额下达书", required: false }
    ]
  },
  {k:"T012", n:"楼宇调适", icon:"settings", color:"#ffb547",
    desc:"暖通空调及照明控制系统调适",
    docs: [
      { k: "tuning_scheme", n: "调适测试方案", desc: "设备调试与系统运行调适计划", required: false },
      { k: "tuning_report", n: "系统运行调适报告", desc: "调适过程记录及调适报告", required: false }
    ]
  },
  {k:"T013", n:"能效提升", icon:"sparkles", color:"#ff8a47",
    desc:"重点设备或系统的能效提升方案",
    docs: [
      { k: "improve_scheme", n: "能效提升改造方案", desc: "设备更新升级或系统优化方案", required: false },
      { k: "benefit_evaluation", n: "能效评估报告", desc: "节能改造前后的能效对比与评估", required: false }
    ]
  },
  {k:"T014", n:"低碳实践区", icon:"factory", color:"#7a5cff",
    desc:"区域碳中和及低碳建筑实践",
    docs: [
      { k: "practice_zone_scheme", n: "实践区建设方案", desc: "低碳实践区/园区总体规划方案", required: false },
      { k: "carbon_neutral_roadmap", n: "碳中和实施路线图", desc: "中长期低碳/碳中和路线图", required: false }
    ]
  },
  {k:"T015", n:"碳效码", icon:"scan", color:"#6a4eff",
    desc:"建筑碳排放效能评级与赋码",
    docs: [
      { k: "carbon_qr_report", n: "碳效评价报告", desc: "季度或年度碳排放等级评估报告", required: false },
      { k: "carbon_footprint_cert", n: "建筑碳足迹证书", desc: "碳足迹认证或低碳等级证书", required: false }
    ]
  },
  {k:"T016", n:"绿电绿证", icon:"tag", color:"#ff6b8a",
    desc:"绿电交易与绿色电力证书购买",
    docs: [
      { k: "green_electricity_contract", n: "绿电交易合同", desc: "电力交易中心绿电合同及交易凭证", required: false },
      { k: "green_certificate", n: "绿色电力证书", desc: "认购 of 绿色电力证书（绿证）扫描件", required: false }
    ]
  },
]

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  relationTemplate: { type: Object, default: () => ({}) }
})

const SUBSYSTEM_ENDPOINTS = {
  T001: '/manage/buildInfo',
  T002: '/manage/greenBuild',
  T003: '/manage/renoInfo',
  T005: '/manage/chargingPileInfo',
  T006: '/manage/solarInfo',
  T007: '/manage/dynamoInfo',
  T008: '/manage/unitInfo',
  T010: '/manage/GetEnergyAuditData',
  T011: '/manage/unitBenchmarkInfo',
  T013: '/manage/getEffictImproveData',
  T015: '/manage/getCarbonQRList',
  T016: '/manage/getCGData'
}

const getFullEndpoint = (k) => {
  const path = SUBSYSTEM_ENDPOINTS[k]
  if (!path) return ''
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  return `${origin}${path}`
}

const testStates = reactive({})

async function testConnection(k) {
  const caseId = props.data.caseId || props.data.id || props.data.CaseID
  if (!caseId) {
    alert('未找到当前建筑案例ID，无法进行连接测试')
    return
  }
  const fullUrl = getFullEndpoint(k)
  if (!subsystemLoaders[k] || !fullUrl) {
    alert('当前子项未配置数据读取接口，无需进行连接测试')
    return
  }

  testStates[k] = 'testing'
  try {
    const loader = subsystemLoaders[k]
    const { rows } = await loader(caseId)
    testStates[k] = 'success'
    const count = Array.isArray(rows) ? rows.length : 0
    alert(`测试连接成功！\n接口路径: ${fullUrl}\n成功获取并读取到 ${count} 条记录。`)
  } catch (err) {
    testStates[k] = 'error'
    console.error(`测试连接失败:`, err)
    alert(`测试连接失败！\n接口路径: ${fullUrl}\n错误信息: ${err?.message || err}`)
  } finally {
    if (testStates[k] !== 'success' && testStates[k] !== 'error') {
      delete testStates[k]
    }
  }
}

// 自动为没有 endpoint 且已经启用的子项填入默认接口路径
watch(() => props.data.subs, (newSubs) => {
  if (!newSubs) return
  let changed = false
  const updatedSubs = { ...newSubs }
  for (const k in updatedSubs) {
    const defaultEndpoint = getFullEndpoint(k)
    if (updatedSubs[k]?.enabled && !updatedSubs[k].endpoint && defaultEndpoint) {
      updatedSubs[k] = { ...updatedSubs[k], endpoint: defaultEndpoint }
      changed = true
    }
  }
  if (changed) {
    emit('update', { ...props.data, subs: updatedSubs })
  }
}, { immediate: true })
const emit  = defineEmits(['update', 'next', 'prev'])

const filteredSubsystems = computed(() => {
  const template = props.relationTemplate
  console.log("relationTemplate inside StepSubsystems:", JSON.stringify(template))
  if (!template || !template.children || template.children.length === 0) {
    const defaultAvailable = ["T001", "T002", "T003", "T005", "T006", "T007", "T008", "T010", "T011", "T013", "T015", "T016"]
    console.log("relationTemplate is empty, using defaultAvailable")
    return defaultAvailable.map(tag => STATIC_SUBSYSTEMS.find(s => s.k === tag)).filter(Boolean)
  }
  const tags = template.children.map(child => child.tag).filter(Boolean)
  console.log("parsed tags from template:", JSON.stringify(tags))
  return tags.map(tag => STATIC_SUBSYSTEMS.find(s => s.k === tag)).filter(Boolean)
})

const active = ref('')
watch(filteredSubsystems, (subs) => {
  if (subs.length > 0 && !subs.some(s => s.k === active.value)) {
    active.value = subs[0].k
  }
}, { immediate: true })

// 动态注册组件
const subComponents = {
  T001: defineAsyncComponent(() => import('./subsystems/SubEnergy.vue')),
  T002: defineAsyncComponent(() => import('./subsystems/GreenBuild.vue')),
  T003: defineAsyncComponent(() => import('./subsystems/SavingRenovation.vue')),
  T004: defineAsyncComponent(() => import('./subsystems/UltraLowEnergy.vue')),
  T005: defineAsyncComponent(() => import('./subsystems/Charge.vue')),
  T006: defineAsyncComponent(() => import('./subsystems/Solar.vue')),
  T007: defineAsyncComponent(() => import('./subsystems/VirtualDynamo.vue')),
  T008: defineAsyncComponent(() => import('./subsystems/EnergyUnit.vue')),
  T009: defineAsyncComponent(() => import('./subsystems/EnergySavingPublicity.vue')),
  T010: defineAsyncComponent(() => import('./subsystems/EnergyAudit.vue')),
  T011: defineAsyncComponent(() => import('./subsystems/Benchmark.vue')),
  T012: defineAsyncComponent(() => import('./subsystems/BuildingAdjustment.vue')),
  T013: defineAsyncComponent(() => import('./subsystems/EffictImprove.vue')),
  T014: defineAsyncComponent(() => import('./subsystems/LowCarbonDistrict.vue')),
  T015: defineAsyncComponent(() => import('./subsystems/CarbonQR.vue')),
  T016: defineAsyncComponent(() => import('./subsystems/CertificateElectricity.vue'))
}

const subs         = computed(() => props.data.subs || {})
const activeSub    = computed(() => filteredSubsystems.value.find(s => s.k === active.value))
const enabledSubs  = computed(() => filteredSubsystems.value.filter(s => subs.value[s.k]?.enabled))
const enabledCount = computed(() => enabledSubs.value.length)
const estNodes     = computed(() => enabledCount.value * 4 + 8)
const estEdges     = computed(() => enabledCount.value * 6 + 12)
const loadStates   = reactive({})
const latestData   = ref(props.data)
const lastLoadSignature = ref('')
let activeLoadRunId = 0

const LIST_SUBSYSTEM_KEYS = new Set(['T002', 'T005', 'T006', 'T008', 'T010', 'T011', 'T013', 'T015', 'T016'])
const activeLoadState = computed(() => loadStates[active.value] || { status: 'idle', count: 0, error: '' })
const COLUMN_AWARE_KEYS = new Set(['T001', 'T002', 'T005', 'T006', 'T008', 'T010', 'T011', 'T016'])
const activeComponentProps = computed(() => {
  const formData = subs.value[active.value] || {}
  return COLUMN_AWARE_KEYS.has(active.value)
    ? { formData, columns: formData.columns || [] }
    : { formData }
})

watch(() => props.data, (val) => {
  latestData.value = val
}, { deep: true })

function setSub(k, v) {
  emit('update', { ...latestData.value, subs: { ...(latestData.value?.subs || {}), [k]: v } })
}
function toggleEnable(k) {
  const s = subs.value[k] || {}
  const nextEnabled = !s.enabled
  const updatedSub = { ...s, enabled: nextEnabled }
  const defaultEndpoint = getFullEndpoint(k)
  if (nextEnabled && defaultEndpoint) {
    updatedSub.endpoint = defaultEndpoint
  }
  setSub(k, updatedSub)
}
function setField(k, fk, v) {
  const s = subs.value[k] || { enabled: true }
  setSub(k, { ...s, [fk]: v })
}

// ========================
// 数据接口调用与回显逻辑
// ========================
function getField(obj, keys, defaultValue = undefined) {
  if (!obj || typeof obj !== 'object') return defaultValue
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return defaultValue
}

function safeJsonParse(value, fallback = []) {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value
  if (typeof value !== 'string' || !value.trim()) return fallback
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn('JSON parse failed:', error)
    return fallback
  }
}

function extractTableRows(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload

  const nested = getField(payload, ['rows', 'Rows', 'data', 'Data', 'table', 'Table', 'items', 'Items'])
  if (Array.isArray(nested)) return nested
  if (typeof nested === 'string') {
    const parsed = safeJsonParse(nested, [])
    return Array.isArray(parsed) ? parsed : []
  }
  if (nested && typeof nested === 'object' && nested !== payload) return extractTableRows(nested)
  return []
}

function extractPivotRows(payload) {
  const tableValue = getField(payload, ['table', 'Table'], payload)
  const parsed = safeJsonParse(tableValue, [])
  return Array.isArray(parsed) ? parsed : []
}

function normalizeColumnOption(option) {
  if (!option) return null
  if (Array.isArray(option) && option.length >= 2) {
    return { key: String(option[0]), value: String(option[1]) }
  }
  const key = option.key ?? option.Key ?? option.editValue ?? option.EditValue ?? option.id ?? option.Id
  const value = option.value ?? option.Value ?? option.displayValue ?? option.DisplayValue ?? option.name ?? option.Name ?? key
  if (key == null && value == null) return null
  return { key: String(key ?? ''), value: String(value ?? '') }
}

function extractColumns(payload) {
  const candidates = [
    getField(payload, ['columns', 'Columns']),
    getField(getField(payload, ['table', 'Table'], {}), ['columns', 'Columns']),
    getField(getField(payload, ['data', 'Data'], {}), ['columns', 'Columns'])
  ]
  const rawColumns = candidates.find(Array.isArray)
  if (!Array.isArray(rawColumns)) return []

  return rawColumns.map((col) => {
    const options = Array.isArray(col?.columnOption || col?.ColumnOption)
      ? (col.columnOption || col.ColumnOption).map(normalizeColumnOption).filter(Boolean)
      : []
    return {
      columnName: col?.columnName || col?.ColumnName || '',
      columnDispName: col?.columnDispName || col?.ColumnDispName || col?.columnName || col?.ColumnName || '',
      columnDataType: col?.columnDataType || col?.ColumnDataType || 'String',
      columnVisible: col?.columnVisible ?? col?.ColumnVisible ?? 1,
      columnOption: options
    }
  }).filter(col => col.columnName)
}

function unwrapRecord(item) {
  return getField(item, ['projectInfo', 'ProjectInfo', 'data', 'Data'], item) || {}
}

function formatDateInput(value) {
  if (!value) return ''
  const str = String(value)
  if (str.includes('T')) return str.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return str.replace(/\//g, '-')
  return str.slice(0, 10)
}

function formatMonthInput(value) {
  if (!value) return ''
  const dateValue = formatDateInput(value)
  return dateValue ? dateValue.slice(0, 7) : ''
}

function normalizeSubsystemRecord(k, raw) {
  const item = raw && typeof raw === 'object' ? { ...raw } : {}

  switch (k) {
    case 'T001':
      return {
        ...item,
        buildName: getField(item, ['buildName', 'BuildName']),
        buildAddress: getField(item, ['buildAddress', 'BuildAddress']),
        buildCityId: getField(item, ['buildCityId', 'BuildCityId']),
        buildId: getField(item, ['buildId', 'BuildId']),
        group: getField(item, ['group', 'Group']),
        contractor: getField(item, ['contractor', 'Contractor']),
        maintainer: getField(item, ['maintainer', 'Maintainer']),
        electricityMeter: getField(item, ['electricityMeter', 'eletricityMeter', 'EletricityMeter']),
        electricitySummary: getField(item, ['electricitySummary', 'eletricitySummary', 'EletricitySummary']),
        waterMeter: getField(item, ['waterMeter', 'WaterMeter']),
        waterSummary: getField(item, ['waterSummary', 'WaterSummary']),
        gasMeter: getField(item, ['gasMeter', 'gassMeter', 'GassMeter']),
        totalArea: getField(item, ['totalArea', 'TotalArea']),
        buildFunc: getField(item, ['buildFunc', 'BuildFunc']),
        contacts: getField(item, ['contacts', 'Contacts']),
        duties: getField(item, ['duties', 'Duties']),
        telephone: getField(item, ['telephone', 'Telephone']),
        introduce: getField(item, ['introduce', 'Introduce']),
        street: getField(item, ['street', 'Street']),
        streetCode: getField(item, ['streetCode', 'StreetCode']),
        time: formatMonthInput(getField(item, ['time', 'Time']))
      }
    case 'T003':
      return {
        ...item,
        projectName: getField(item, ['projectName', 'ProjectName']),
        year: getField(item, ['year', 'Year']),
        buildId: getField(item, ['buildId', 'BuildId']),
        buildArea: getField(item, ['buildArea', 'BuildArea']),
        renovationArea: getField(item, ['renovationArea', 'RenovationArea']),
        standardEnergy: getField(item, ['standardEnergy', 'StandardEnergy']),
        renovationEnergy: getField(item, ['renovationEnergy', 'RenovationEnergy']),
        savingAmount: getField(item, ['savingAmount', 'SavingAmount']),
        savingRate: getField(item, ['savingRate', 'SavingRate'])
      }
    case 'T005':
      return {
        ...item,
        stationCaseId: getField(item, ['stationCaseId', 'StationCaseId']),
        stationId: getField(item, ['stationId', 'StationId']),
        stationName: getField(item, ['stationName', 'StationName']),
        stationType: getField(item, ['stationType', 'StationType']),
        stationStatus: getField(item, ['stationStatus', 'StationStatus']),
        directNum: getField(item, ['directNum', 'DirectNum']),
        swapNum: getField(item, ['swapNum', 'SwapNum']),
        ownerID: getField(item, ['ownerID', 'OwnerID']),
        address: getField(item, ['address', 'Address']),
        street: getField(item, ['street', 'Street']),
        streetCode: getField(item, ['streetCode', 'StreetCode'])
      }
    case 'T006':
      return {
        ...item,
        solarCaseId: getField(item, ['solarCaseId', 'SolarCaseId']),
        solarStationId: getField(item, ['solarStationId', 'SolarStationId']),
        solarName: getField(item, ['solarName', 'SolarName']),
        solarStatus: getField(item, ['solarStatus', 'SolarStatus']),
        installDate: formatDateInput(getField(item, ['installDate', 'InstallDate'])),
        capacity: getField(item, ['capacity', 'Capacity']),
        street: getField(item, ['street', 'Street']),
        streetCode: getField(item, ['streetCode', 'StreetCode']),
        address: getField(item, ['address', 'Address'])
      }
    case 'T007':
      return {
        ...item,
        vdid: getField(item, ['vdid', 'VDID', 'Vdid']),
        vdName: getField(item, ['vdName', 'VDName', 'VdName']),
        operationMark: getField(item, ['operationMark', 'OperationMark']),
        maxCapacity: getField(item, ['maxCapacity', 'MaxCapacity']),
        maxNeed: getField(item, ['maxNeed', 'MaxNeed']),
        strategyCount: getField(item, ['strategyCount', 'StrategyCount']),
        factorCount: getField(item, ['factorCount', 'FactorCount']),
        time: formatMonthInput(getField(item, ['time', 'Time']))
      }
    case 'T008':
      return {
        ...item,
        unitCode: getField(item, ['unitCode', 'UnitCode']),
        unitName: getField(item, ['unitName', 'UnitName']),
        year: getField(item, ['year', 'Year']),
        group: getField(item, ['group', 'Group']),
        industrialType: getField(item, ['industrialType', 'IndustrialType']),
        industrialCode: getField(item, ['industrialCode', 'IndustrialCode']),
        energyValue: getField(item, ['energyValue', 'EnergyValue']),
        energyValueLastYear: getField(item, ['energyValueLastYear', 'EnergyValueLastYear'])
      }
    case 'T010':
      return {
        ...item,
        projectID: getField(item, ['projectID', 'ProjectID', 'projectId']),
        projectName: getField(item, ['projectName', 'ProjectName']),
        Year: getField(item, ['Year', 'year']),
        Unit: getField(item, ['Unit', 'unit']),
        EaAddress: getField(item, ['EaAddress', 'eaAddress']),
        EaArea: getField(item, ['EaArea', 'eaArea']),
        Competent: getField(item, ['Competent', 'competent']),
        IsAllNum: getField(item, ['IsAllNum', 'isAllNum']),
        IsConform: getField(item, ['IsConform', 'isConform']),
        IsUse: getField(item, ['IsUse', 'isUse']),
        IsAdvanced: getField(item, ['IsAdvanced', 'isAdvanced']),
        InnovateHas: getField(item, ['InnovateHas', 'innovateHas']),
        InnovateGN: getField(item, ['InnovateGN', 'innovateGN']),
        InnovateTech: getField(item, ['InnovateTech', 'innovateTech']),
        IntelligentScore1: getField(item, ['IntelligentScore1', 'intelligentScore1']),
        IntelligentScore2: getField(item, ['IntelligentScore2', 'intelligentScore2']),
        IntelligentScore3: getField(item, ['IntelligentScore3', 'intelligentScore3']),
        carbonActionScore: getField(item, ['carbonActionScore', 'CarbonActionScore'])
      }
    case 'T011':
      return {
        ...item,
        unitCode: getField(item, ['unitCode', 'UnitCode']),
        unitName: getField(item, ['unitName', 'UnitName']),
        year: getField(item, ['year', 'Year']),
        quarter: getField(item, ['quarter', 'Quarter']),
        group: getField(item, ['group', 'Group']),
        energyValue: getField(item, ['energyValue', 'EnergyValue']),
        energyValueLastYear: getField(item, ['energyValueLastYear', 'EnergyValueLastYear']),
        aggregateTarget: getField(item, ['aggregateTarget', 'AggregateTarget']),
        aggregateValueDesc: getField(item, ['aggregateValueDesc', 'AggregateValueDesc']),
        aggregateResult: getField(item, ['aggregateResult', 'AggregateResult']),
        instenstiyTarget: getField(item, ['instenstiyTarget', 'InstenstiyTarget']),
        instenstiyValueDesc: getField(item, ['instenstiyValueDesc', 'InstenstiyValueDesc']),
        instensityResult: getField(item, ['instensityResult', 'InstensityResult'])
      }
    case 'T013':
      return {
        ...item,
        projectID: getField(item, ['projectID', 'ProjectID', 'projectId']),
        projectName: getField(item, ['projectName', 'ProjectName', 'name', 'Name']),
        Group: getField(item, ['Group', 'group']),
        BuildID: getField(item, ['BuildID', 'buildID', 'buildId']),
        Year: getField(item, ['Year', 'year', 'time', 'Time']),
        EquParam1: getField(item, ['EquParam1', 'equParam1']),
        EquParam2: getField(item, ['EquParam2', 'equParam2']),
        EquParam3: getField(item, ['EquParam3', 'equParam3']),
        EFBuildType: getField(item, ['EFBuildType', 'efBuildType']),
        EFBuildArea: getField(item, ['EFBuildArea', 'efBuildArea']),
        EFUnitEnergy: getField(item, ['EFUnitEnergy', 'efUnitEnergy']),
        EFBench: getField(item, ['EFBench', 'efBench'])
      }
    case 'T015':
      return {
        ...item,
        buildID: getField(item, ['buildID', 'BuildID']),
        evaYear: getField(item, ['evaYear', 'EvaYear']),
        evaluationCode: getField(item, ['evaluationCode', 'EvaluationCode']),
        evaluationScore: getField(item, ['evaluationScore', 'EvaluationScore']),
        buildName: getField(item, ['buildName', 'BuildName']),
        buildAddress: getField(item, ['buildAddress', 'BuildAddress']),
        buildYear: getField(item, ['buildYear', 'BuildYear']),
        buildArea: getField(item, ['buildArea', 'BuildArea']),
        buildFunc: getField(item, ['buildFunc', 'BuildFunc'])
      }
    case 'T016':
      return {
        ...item,
        projectId: getField(item, ['projectId', 'ProjectId', 'projectID', 'ProjectID']),
        projectName: getField(item, ['projectName', 'ProjectName']),
        transactionNumber: getField(item, ['transactionNumber', 'TransactionNumber']),
        buildName: getField(item, ['buildName', 'BuildName']),
        greenCertificateNum: getField(item, ['greenCertificateNum', 'GreenCertificateNum']),
        gsProjectCode: getField(item, ['gsProjectCode', 'GsProjectCode']),
        gsProjectType: getField(item, ['gsProjectType', 'GsProjectType']),
        gsProjectAddress: getField(item, ['gsProjectAddress', 'GsProjectAddress']),
        productionDate: formatMonthInput(getField(item, ['productionDate', 'ProductionDate'])),
        transactionCity: getField(item, ['transactionCity', 'TransactionCity']),
        address: getField(item, ['address', 'Address']),
        houseHoldNumber: getField(item, ['houseHoldNumber', 'HouseHoldNumber']),
        accountNumber: getField(item, ['accountNumber', 'AccountNumber']),
        passWord: getField(item, ['passWord', 'PassWord', 'password']),
        rate: getField(item, ['rate', 'Rate']),
        subsidyPow: getField(item, ['subsidyPow', 'SubsidyPow']),
        enterpriseTitle: getField(item, ['enterpriseTitle', 'EnterpriseTitle']),
        gsProjectName: getField(item, ['gsProjectName', 'GsProjectName']),
        declarationDate: formatDateInput(getField(item, ['declarationDate', 'DeclarationDate'])),
        transactionDate: formatDateInput(getField(item, ['transactionDate', 'TransactionDate'])),
        averagePrice: getField(item, ['averagePrice', 'AveragePrice']),
        totalPrice: getField(item, ['totalPrice', 'TotalPrice']),
        gsUnitCode: getField(item, ['gsUnitCode', 'GsUnitCode']),
        saleUnit: getField(item, ['saleUnit', 'SaleUnit']),
        reduceCO2: getField(item, ['reduceCO2', 'ReduceCO2'])
      }
    default:
      return item
  }
}

const subsystemLoaders = {
  T001: async (caseId) => {
    const payload = await subApi.getBuildInfo(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T002: async (caseId) => {
    const payload = await subApi.getGreenBuild(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T003: async (caseId) => {
    const payload = await subApi.getRenoInfo(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T005: async (caseId) => {
    const payload = await subApi.getChargingPileInfo(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T006: async (caseId) => {
    const payload = await subApi.getSolarInfo(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T007: async (caseId) => {
    const payload = await subApi.getDynamoInfo(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T008: async (caseId) => {
    const payload = await subApi.getUnitInfo(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T010: async (caseId) => {
    const payload = await subApi.getEnergyAuditData(caseId)
    return { rows: extractPivotRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T011: async (caseId) => {
    const payload = await subApi.getUnitBenchmarkInfo(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T013: async (caseId) => {
    const payload = await subApi.getEffictImproveData(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T015: async (caseId) => {
    const payload = await subApi.getCarbonQRList(caseId)
    return { rows: extractTableRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  },
  T016: async (caseId) => {
    const payload = await subApi.getCGData(caseId)
    return { rows: extractPivotRows(payload).map(unwrapRecord), columns: extractColumns(payload) }
  }
}

const loadSubsystemsData = async () => {
  const caseId = props.data.caseId || props.data.id || props.data.CaseID;
  if (!caseId) return;

  const orderedKeys = filteredSubsystems.value
    .map(s => s.k)
    .filter(k => typeof subsystemLoaders[k] === 'function')
  const signature = `${caseId}|${orderedKeys.join(',')}`
  if (!orderedKeys.length || lastLoadSignature.value === signature) return

  lastLoadSignature.value = signature
  activeLoadRunId += 1
  const runId = activeLoadRunId
  const nextSubs = { ...(latestData.value?.subs || {}) }

  orderedKeys.forEach((k) => {
    loadStates[k] = { status: 'idle', count: 0, error: '' }
  })

  for (const k of orderedKeys) {
    if (runId !== activeLoadRunId) return

    loadStates[k] = { status: 'loading', count: 0, error: '' }

    try {
      const { rows, columns } = await subsystemLoaders[k](caseId)
      if (runId !== activeLoadRunId) return

      const normalizedRows = rows
        .map(row => normalizeSubsystemRecord(k, row))
        .filter(row => row && Object.keys(row).length > 0)

      if (normalizedRows.length > 0) {
        const currentSub = { ...(nextSubs[k] || {}) }
        if (LIST_SUBSYSTEM_KEYS.has(k)) currentSub.items = normalizedRows
        else Object.assign(currentSub, normalizedRows[0])
        if (Array.isArray(columns) && columns.length > 0) currentSub.columns = columns
        currentSub.enabled = true
        const defaultEndpoint = getFullEndpoint(k)
        if (defaultEndpoint) {
          currentSub.endpoint = defaultEndpoint
        }
        nextSubs[k] = currentSub

        emit('update', {
          ...latestData.value,
          subs: { ...(latestData.value?.subs || {}), ...nextSubs }
        })
      }

      loadStates[k] = { status: 'done', count: normalizedRows.length, error: '' }
    } catch (err) {
      console.error(`Failed to load data for ${k}:`, err)
      loadStates[k] = { status: 'error', count: 0, error: err?.message || '加载失败' }
    }
  }
}

watch(
  () => [props.data.caseId || props.data.id || props.data.CaseID, filteredSubsystems.value.map(s => s.k).join(',')],
  ([caseId, tags]) => {
    if (caseId && tags) loadSubsystemsData()
  },
  { immediate: true }
)

// SVG 子节点坐标
function subX(i) {
  const n = enabledSubs.value.length
  const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2
  return 160 + Math.cos(angle) * 55
}
function subY(i) {
  const n = enabledSubs.value.length
  const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2
  return 100 + Math.sin(angle) * 55
}

// ========================
// 资料上传与解析逻辑
// ========================

const DEFAULT_SUB_META = {
  T001: { attachment: 'T_BD_BuildSummaryInfo', projectColumn: 'buildId' },
  T002: { attachment: 'T_BD_GreenBuildInfo', projectColumn: 'buildId' },
  T003: { attachment: 'T_SR_SavingRenovationBaseInfo', projectColumn: 'projectID' },
  T005: { attachment: 'T_CS_StationCaseInfo', projectColumn: 'stationCaseId' },
  T006: { attachment: 'T_SS_SolarCaseInfo', projectColumn: 'solarCaseId' },
  T007: { attachment: 'T_VD_VirtualDaynamoInfo', projectColumn: 'vdid' },
  T008: { attachment: 'T_EU_EnergyUnitInfo', projectColumn: 'unitCode' },
  T010: { attachment: 'T_EA_AuditBaseInfo', projectColumn: 'projectID' },
  T011: { attachment: 'T_EU_EnergyUnitBenchmarkInfo', projectColumn: 'unitCode' },
  T013: { attachment: 'T_EF_EffictImproveInfo', projectColumn: 'projectID' },
  T015: { attachment: 'T_BD_CarbonQREvaluationBaseInfo', projectColumn: 'buildID' },
  T016: { attachment: 'T_GS_CertificateGlectricity', projectColumn: 'projectId' }
}

const activeRecords = computed(() => {
  const k = active.value
  if (!k) return []
  const subData = subs.value[k]
  if (!subData) return []
  
  if (LIST_SUBSYSTEM_KEYS.has(k)) {
    return subData.items || []
  } else {
    return [subData]
  }
})

const getRecordProjectID = (record) => {
  const meta = DEFAULT_SUB_META[active.value]
  if (!meta || !record) return null
  return record[meta.projectColumn] || null
}

const activeProjectIDs = computed(() => {
  const k = active.value
  const meta = DEFAULT_SUB_META[k]
  if (!meta) return []
  const subData = subs.value[k]
  if (!subData) return []
  
  if (LIST_SUBSYSTEM_KEYS.has(k)) {
    const list = subData.items || []
    return list.map(item => item[meta.projectColumn]).filter(Boolean)
  }
  const pid = subData[meta.projectColumn]
  return pid ? [pid] : []
})

const getActiveTable = () => {
  const k = active.value
  const meta = DEFAULT_SUB_META[k]
  return meta?.attachment || null
}

const getDocStorageKey = (subKey, projectID, docKey) => {
  return `${subKey}_${projectID}_${docKey}`
}

const fileLoadStates = reactive({})

const loadProjectFiles = async (projectID) => {
  const k = active.value
  if (!k || !subs.value[k]?.enabled || !projectID) return
  
  const table = getActiveTable()
  if (!table) return
  
  const cacheKey = `${k}_${projectID}_${table}`
  if (fileLoadStates[cacheKey] === 'loading') return
  
  fileLoadStates[cacheKey] = 'loading'
  try {
    const res = await subApi.getFileList(projectID, table)
    const fileList = res?.table || res || []
    
    const docs = { ...(props.data.docs || {}) }
    
    // 清理当前子系统和当前 projectID 下的所有分类
    const subDocs = activeSub.value?.docs || []
    const subDocKeys = [...subDocs.map(d => d.k), 'other']
    subDocKeys.forEach(dk => {
      delete docs[getDocStorageKey(k, projectID, dk)]
    })
    
    // 归类文件
    fileList.forEach(file => {
      let destTag = 'other'
      if (file.tag && subDocs.some(d => d.k === file.tag)) {
        destTag = file.tag
      }
      
      const storageKey = getDocStorageKey(k, projectID, destTag)
      if (!docs[storageKey]) {
        docs[storageKey] = []
      }
      
      docs[storageKey].push({
        id: file.fileID,
        name: file.fileName,
        size: file.fileSize ? (file.fileSize >= 1024 ? (file.fileSize / 1024).toFixed(1) + ' MB' : file.fileSize + ' KB') : '0 KB',
        progress: 100,
        stage: 5,
        chunks: 0,
        entities: 0,
        raw: file
      })
    })
    
    emit('update', { ...props.data, docs })
    fileLoadStates[cacheKey] = 'done'
  } catch (err) {
    console.error(`Failed to load files for projectID ${projectID}:`, err)
    fileLoadStates[cacheKey] = 'error'
  }
}

watch(activeProjectIDs, (newIds) => {
  if (!newIds || newIds.length === 0) return
  
  newIds.forEach(projectID => {
    const table = getActiveTable()
    const cacheKey = `${active.value}_${projectID}_${table}`
    if (fileLoadStates[cacheKey] !== 'done' && fileLoadStates[cacheKey] !== 'loading') {
      loadProjectFiles(projectID)
    }
  })
}, { deep: true, immediate: true })

const STAGE_LABELS  = ['排队中', 'OCR / 文本提取', '语义切片', '实体与术语标注', '知识图谱写入', '已入库']
const PARSE_STAGES  = [
  { k: 1, n: 'OCR · 抽取' },
  { k: 2, n: '语义切片' },
  { k: 3, n: '实体/术语' },
  { k: 4, n: '图谱入库' },
]

const docsOf      = (dtK, projectID) => {
  if (!projectID) return []
  return props.data.docs?.[getDocStorageKey(active.value, projectID, dtK)] || []
}
const allDocs     = computed(() => Object.values(props.data.docs || {}).flat())
const maxStage    = computed(() => Math.max(0, ...allDocs.value.map(d => d.stage)))
const activeDoc   = computed(() => allDocs.value.find(d => d.stage > 0 && d.stage < 5))

const totalToLoad = computed(() => {
  return filteredSubsystems.value
    .map(s => s.k)
    .filter(k => typeof subsystemLoaders[k] === 'function').length
})

const loadedCount = computed(() => {
  const orderedKeys = filteredSubsystems.value
    .map(s => s.k)
    .filter(k => typeof subsystemLoaders[k] === 'function')
  if (orderedKeys.length === 0) return 0
  return orderedKeys.filter(k => {
    const s = loadStates[k]?.status
    return s === 'done' || s === 'error'
  }).length
})

const loadProgress = computed(() => {
  if (totalToLoad.value === 0) return 100
  return Math.round((loadedCount.value / totalToLoad.value) * 100)
})

const canNext = computed(() => {
  if (totalToLoad.value === 0) return true
  return loadedCount.value === totalToLoad.value
})

const fileInputEl = ref(null)
let activeUploadDocKey = null
let activeUploadProjectID = null

function triggerFileInput(docKey, projectID) {
  activeUploadDocKey = docKey
  activeUploadProjectID = projectID
  if (fileInputEl.value) {
    fileInputEl.value.value = ''
    fileInputEl.value.click()
  }
}

async function onFileSelect(e) {
  const files = e.target.files
  if (!files || !files.length || !activeUploadDocKey || !activeUploadProjectID) return
  
  const k = active.value
  const dtK = activeUploadDocKey
  const projectID = activeUploadProjectID
  const table = getActiveTable()
  
  if (!projectID || !table) {
    alert('请先添加并保存子系统记录后再上传附件')
    return
  }
  
  const uploadTag = dtK === 'other' ? null : dtK
  
  // 先把文件列表在前端展示为上传中状态，以便推进模拟 OCR 流水线
  const tempDocs = Array.from(files).map((file, idx) => {
    return {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      id: `temp_${Date.now()}_${idx}`,
      progress: 20,
      stage: 1,
      chunks: 0,
      entities: 0,
      isUploading: true,
      pages: Math.floor(Math.random() * 50 + 10)
    }
  })
  
  const storageKey = getDocStorageKey(k, projectID, dtK)
  const currentDocs = props.data.docs?.[storageKey] || []
  
  emit('update', {
    ...props.data,
    docs: {
      ...(props.data.docs || {}),
      [storageKey]: [...currentDocs, ...tempDocs]
    }
  })
  
  try {
    await subApi.uploadFile(projectID, Array.from(files), table, uploadTag)
    
    // 上传成功后，清除该缓存 Key 状态，重新拉取最新文件列表
    const cacheKey = `${k}_${projectID}_${table}`
    delete fileLoadStates[cacheKey]
    await loadProjectFiles(projectID)
  } catch (err) {
    alert(`上传失败: ${err?.message || err}`)
    // 上传失败则还原
    emit('update', {
      ...props.data,
      docs: {
        ...(props.data.docs || {}),
        [storageKey]: currentDocs
      }
    })
  }
}

async function removeDoc(dtK, id, projectID) {
  if (String(id).startsWith('temp_')) {
    const storageKey = getDocStorageKey(active.value, projectID, dtK)
    const currentDocs = props.data.docs?.[storageKey] || []
    emit('update', {
      ...props.data,
      docs: {
        ...(props.data.docs || {}),
        [storageKey]: currentDocs.filter(d => d.id !== id)
      }
    })
    return
  }
  
  const table = getActiveTable()
  if (!projectID || !table) return
  
  const k = active.value
  
  if (!confirm('确定要删除该附件吗？')) return
  
  try {
    await subApi.deleteFile(projectID, id, table)
    
    // 删除成功后，清除该缓存 Key 状态，重新拉取最新文件列表
    const cacheKey = `${k}_${projectID}_${table}`
    delete fileLoadStates[cacheKey]
    await loadProjectFiles(projectID)
  } catch (err) {
    alert(`删除失败: ${err?.message || err}`)
  }
}

let parseTimer = null
function startParseTimer() {
  if (parseTimer) return
  parseTimer = setInterval(() => {
    const docs = props.data.docs || {}
    const allList = Object.entries(docs)
    let changed = false
    const next = {}
    for (const [k, arr] of allList) {
      next[k] = arr.map(d => {
        if (d.stage >= 5) return d
        changed = true
        const n = { ...d }
        n.progress = Math.min(100, n.progress + Math.random() * 8 + 5)
        if (n.progress >= 20 && n.stage < 1) n.stage = 1
        if (n.progress >= 40 && n.stage < 2) { n.stage = 2; n.chunks = Math.floor((d.pages || 10) * 4.6) }
        if (n.progress >= 60 && n.stage < 3) { n.stage = 3 }
        if (n.progress >= 80 && n.stage < 4) { n.stage = 4; n.entities = Math.floor(Math.random() * 40 + 30) }
        if (n.progress >= 100 && n.stage < 5) { n.stage = 5; n.progress = 100 }
        return n
      })
    }
    if (changed) emit('update', { ...props.data, docs: next })
  }, 380)
}

watch(allDocs, (arr) => {
  if (arr.some(d => d.stage < 5)) startParseTimer()
  else { clearInterval(parseTimer); parseTimer = null }
}, { immediate: true })

onUnmounted(() => { clearInterval(parseTimer) })
</script>

<style scoped>
.vertical-subs-tabs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.vertical-sub-tag {
  padding: 12px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.2s;
  user-select: none;
}
.vertical-sub-tag:hover {
  background: #f8faff;
}
.vertical-sub-tag.active {
  background: #f0f5ff;
  border-color: #d8e4fb;
}
.vertical-sub-tag .ic {
  width: 28px; height: 28px;
  border-radius: 6px;
  display: grid; place-items: center;
  background: color-mix(in srgb, var(--c) 15%, transparent);
  color: var(--c);
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  font-family: monospace;
}
.vertical-sub-tag.active .ic {
  background: var(--c);
  color: white;
}
.vertical-sub-tag .text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vertical-sub-tag .n-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vertical-sub-tag .n {
  font-size: 14px;
  color: var(--text-0);
  font-weight: 600;
}
.sub-name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.load-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 1.6;
  white-space: nowrap;
}
.load-badge.loading {
  color: #2f7fff;
  background: rgba(47, 127, 255, 0.08);
}
.load-badge.success {
  color: #1b8f64;
  background: rgba(43, 217, 168, 0.12);
}
.load-badge.error {
  color: #d4380d;
  background: rgba(255, 138, 71, 0.14);
}
.spinner-dot {
  width: 10px;
  height: 10px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.9s linear infinite;
}
.vertical-sub-tag.active .n {
  color: var(--c);
}
.vertical-sub-tag .d {
  font-size: 11px;
  color: var(--text-3);
  line-height: 1.4;
}
.vertical-sub-tag .toggle {
  width: 28px; height: 16px;
  background: var(--line-strong);
  border-radius: 10px;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}
.vertical-sub-tag .toggle::after {
  content: "";
  position: absolute;
  top: 2px; left: 2px;
  width: 12px; height: 12px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.vertical-sub-tag.enabled .toggle {
  background: var(--c);
}
.vertical-sub-tag.enabled .toggle::after {
  left: 14px;
}
.detail-load-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-2);
}
.detail-load-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 微型化左上传右列表文件框样式 */
.mini-upload-btn {
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  border: 1px dashed var(--brand);
  border-radius: 6px;
  background: #f0f7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--brand);
  transition: all 0.2s;
  box-sizing: border-box;
}
.mini-upload-btn:hover {
  background: #e6f1ff;
  box-shadow: 0 2px 6px rgba(47, 127, 255, 0.1);
  transform: translateY(-1px);
}
.mini-doc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 6px 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  box-sizing: border-box;
}
.mini-doc-item .badge-done {
  color: #1b8f64;
  background: rgba(43, 217, 168, 0.12);
  font-size: 8px;
  padding: 0 4px;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 1.4;
}
.mini-del-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-3);
  padding: 4px;
  border-radius: 4px;
  display: grid;
  place-items: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.mini-del-btn:hover {
  background: #fff1f0;
  color: #ff4d4f;
}
</style>
