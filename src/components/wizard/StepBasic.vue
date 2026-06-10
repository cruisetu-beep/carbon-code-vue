<template>
  <div class="step-basic float-in">
    <!-- 主表单 -->
    <div class="card glow">
      <div class="card-corner-tl"/><div class="card-corner-br"/>

      <div class="form-section">
        <div class="section-head">
          <div class="ico"><AppIcon name="cube" :size="18"/></div>
          <div>
            <h3>双碳案例标识与基础信息</h3>
            <div class="desc">这些字段将作为知识图谱中"案例实体"的核心属性写入</div>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed var(--line);">
          <div class="field" style="grid-column: 1 / -1">
            <label class="field-label">快捷选择已有建筑</label>
            <select class="select" :value="selectedBuildId" @change="onBuildSelect">
              <option value="">-- 请选择建筑 --</option>
              <option v-for="b in buildList" :key="b.buildId" :value="b.buildId">
                {{ b.buildName }} ({{ b.buildId }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid-2">
          <div :class="['field', errors.caseId && 'has-err']">
            <label class="field-label">案例编号 <span class="req">*</span></label>
            <input class="input mono" placeholder="自动生成或填入" :value="data.caseId || ''" @input="set('caseId', $event.target.value)"/>
            <div v-if="errors.caseId" class="err-msg">{{ errors.caseId }}</div>
          </div>
          <div :class="['field', errors.code && 'has-err']">
            <label class="field-label">关联建筑编号 <span class="req">*</span></label>
            <input class="input mono" placeholder="例如 SH-PD-A0247" :value="data.code || ''" @input="set('code', $event.target.value)"/>
            <div v-if="errors.code" class="err-msg">{{ errors.code }}</div>
          </div>
          <div :class="['field', errors.title && 'has-err']" style="grid-column: 1 / -1">
            <label class="field-label">案例名称 / 标题 <span class="req">*</span></label>
            <input class="input" placeholder="例如 浦东金融中心节能改造案例" :value="data.title || ''" @input="set('title', $event.target.value)"/>
            <div v-if="errors.title" class="err-msg">{{ errors.title }}</div>
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label class="field-label">案例关联（行动路线）</label>
            <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:8px">
              <div v-for="(item, i) in caseIconList" :key="i" @click="toggleCourse(i)" style="width: 32px; height: 32px; cursor: pointer;" :title="item.title">
                <img :src="selectedCourses.includes(i) ? item.url : item.url_NO" style="width:100%; height:100%" />
              </div>
            </div>
          </div>
          <div class="field">
            <label class="field-label">街道</label>
            <input class="input" placeholder="街道代码或名称" :value="data.streetCode || ''" @input="set('streetCode', $event.target.value)"/>
          </div>
          <div class="field">
            <label class="field-label">地址</label>
            <input class="input" placeholder="详细地址" :value="data.address || ''" @input="set('address', $event.target.value)"/>
          </div>
          <div class="field">
            <label class="field-label">经度 (Longitude)</label>
            <input class="input mono" type="number" placeholder="例如 121.47" :value="data.longitude || ''" @input="set('longitude', $event.target.value)"/>
          </div>
          <div class="field">
            <label class="field-label">纬度 (Latitude)</label>
            <input class="input mono" type="number" placeholder="例如 31.23" :value="data.latitude || ''" @input="set('latitude', $event.target.value)"/>
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label class="field-label">案例图片</label>
            <div class="img-upload-box" @click="triggerFileInput">
              <img v-if="previewImageUrl" :src="previewImageUrl" style="width:100%; height:100%; object-fit:contain" />
              <div v-else class="plus-icon">+</div>
              <input ref="fileInputRef" type="file" accept="image/jpeg, image/png" @change="onImageSelect" style="display:none" />
            </div>
            <div style="font-size: 11px; color: var(--text-3); margin-top: 4px;">只能上传jpg/png文件，且不超过500kb</div>
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label class="field-label">案例简介</label>
            <textarea class="input" style="min-height:80px;resize:vertical" placeholder="填写案例详细简介..." :value="data.introduce || ''" @input="set('introduce', $event.target.value)"></textarea>
          </div>
        </div>
      </div>



      <!-- 底部操作 -->
      <div class="form-actions">
        <div class="form-progress">
          <span>基础信息完成度</span>
          <div class="bar"><div class="bar-fill" :style="{ width: `${progress}%` }"/></div>
          <span class="mono">{{ progress }}%</span>
        </div>
        <div style="display:flex;gap:10px;margin-left:auto">
          <button class="btn ghost">保存草稿</button>
          <button class="btn primary" @click="handleNext">
            下一步 · 文档上传 <AppIcon name="chevron-right" :size="14"/>
          </button>
        </div>
      </div>
    </div>

    <!-- AI 侧边栏 -->
    <div class="ai-side">
      <div class="ai-side-head">
        <div class="ai-orb"/>
        <div>
          <h4>知识库引擎 · 实时推理</h4>
          <div class="sub mono">CarbonGraph-LLM · v3.2</div>
        </div>
      </div>

      <div v-if="thoughts.length === 0" style="padding:32px 12px;text-align:center;color:var(--text-3);font-size:12px">
        <AppIcon name="sparkles" :size="32"/>
        <div style="margin-top:12px">填写建筑信息时，<br/>知识库将实时推理与匹配</div>
      </div>
      <div v-else class="ai-thoughts">
        <div v-for="(th, i) in thoughts" :key="i"
             :class="['thought', th.ok && 'ok']"
             :style="{ animationDelay: `${i * 0.05}s` }">
          <span class="label">{{ th.l }}</span>{{ th.t }}
        </div>
      </div>

      <div class="meta-strip">
        <span class="dot"/>
        图谱中已有同类建筑 <strong style="color:var(--brand-2)">2,847</strong> 栋
      </div>
      <div class="meta-strip">
        <span class="dot"/>
        本市基准能耗中位数 <strong style="color:var(--brand-2)">92.4</strong> kWh/㎡·a
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AppIcon from '../shared/AppIcon.vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit  = defineEmits(['update', 'next'])

const errors  = ref({})
const thoughts = ref([])

const buildList = ref([])
const caseList = ref([])
const selectedBuildId = ref('')
const nextAvailableCaseId = ref('')
const selectedCourses = ref([])

const imageUrl = ref('')
const previewImageUrl = computed(() => {
  if (imageUrl.value) return imageUrl.value;
  if (props.data.bucketName && props.data.objectName) {
    const baseUrl = import.meta.env.VITE_CARBON_PLATFORM_API_BASE || 'https://www.ttbems.com:14440/HPManage/';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return `${normalizedBaseUrl}api/public/oosFile?bucketName=${props.data.bucketName}&objectName=${props.data.objectName}`;
  }
  return '';
});
const fileInputRef = ref(null)

const caseIconList = ref([
  {
    url: new URL('../../assets/businessManage_svg/icon_1.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_1_no.svg', import.meta.url).href,
    title: '建筑领域碳达峰'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_2.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_2_no.svg', import.meta.url).href,
    title: '节能降碳增效行动'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_3.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_3_no.svg', import.meta.url).href,
    title: '能源碳排放管理体系优化行动'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_4.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_4_no.svg', import.meta.url).href,
    title: '交通领域绿色低碳行动'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_5.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_5_no.svg', import.meta.url).href,
    title: '城区绿色生态空间拓展行动'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_6.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_6_no.svg', import.meta.url).href,
    title: '可再生能源发展行动'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_7.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_7_no.svg', import.meta.url).href,
    title: '重点企业低碳发展行动'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_8.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_8_no.svg', import.meta.url).href,
    title: '循环经济助力降碳行动'
  },
  {
    url: new URL('../../assets/businessManage_svg/icon_9.svg', import.meta.url).href,
    url_NO: new URL('../../assets/businessManage_svg/icon_9_no.svg', import.meta.url).href,
    title: '绿色低碳全民行动'
  }
])

function toggleCourse(index) {
  const current = [...selectedCourses.value]
  const pos = current.indexOf(index)
  if (pos > -1) current.splice(pos, 1)
  else current.push(index)
  selectedCourses.value = current
}

onMounted(async () => {
  try {
    const [bRes, cRes] = await Promise.all([
      fetch('/api/Resource/getBuildList').then(r => r.json()).catch(() => ({})),
      fetch('/api/manage/caseInfo?pageIndex=1&pageSize=10000').then(r => r.json()).catch(e => { console.error(e); return {} })
    ])
    if (bRes?.data) buildList.value = bRes.data
    
    let cases = []
    if (cRes?.data) {
      if (Array.isArray(cRes.data)) {
        cases = cRes.data
      } else if (Array.isArray(cRes.data.data)) {
        cases = cRes.data.data
      } else if (Array.isArray(cRes.data.table)) {
        cases = cRes.data.table
      } else if (cRes.data.table?.data && Array.isArray(cRes.data.table.data)) {
        cases = cRes.data.table.data
      } else if (typeof cRes.data === 'string') {
        try { cases = JSON.parse(cRes.data) } catch (e) {}
      }
    } else if (Array.isArray(cRes)) {
      cases = cRes
    }
    caseList.value = cases || []

    // 预先计算出最大的 caseID 并生成下一个编号
    let maxNum = 0
    for (const item of cases) {
      const idStr = item.caseId || item.F_CaseID || item.caseID || item.id || ''
      const match = idStr.match(/\d+/)
      if (match) {
        const num = parseInt(match[0], 10)
        if (num > maxNum) maxNum = num
      }
    }
    const nextNum = maxNum > 0 ? maxNum + 1 : 1
    nextAvailableCaseId.value = `C${String(nextNum).padStart(5, '0')}`

  } catch (e) {
    console.error('Failed to load building or case list', e)
  }
})

// ── 产生演示用例的淘汰设备数据 ──
function getSampleObsoleteDevices(code) {
  if (code && (code.includes('A090') || code.includes('M0058'))) {
    return [
      { code: 'DEV-MTR-2008-01', name: '地下二层 1# 消防泵电动机', typeK: 'motor', model: 'Y2-200L-4', year: 2008, status: 'phaseout', reason: '能效等级为三级，不符合 GB 18613-2020 二级能效的限值要求，已超期服役，列入限期淘汰清单。', files: {} },
      { code: 'DEV-PMP-2010-03', name: '地下一层 2# 采暖热水循环泵', typeK: 'pump', model: 'ISG80-250', year: 2010, status: 'low_eff', reason: '水泵效率低于国家能效限定值，运行振动大，建议改造为变频高效水泵。', files: {} }
    ]
  }
  if (code && (code.includes('A001') || code.includes('A0123'))) {
    return [
      { code: 'DEV-MTR-2006-02', name: '空调机房 3# 送风机电动机', typeK: 'motor', model: 'Y180M-4', year: 2006, status: 'danger', reason: '该系列电动机已被列入《国家高耗能落后机电设备（产品）淘汰目录》，属于强制淘汰产品，需立刻整改更换。', files: {} }
    ]
  }
  return [
    { code: 'DEV-MTR-2009-99', name: '裙楼排风机旧电机', typeK: 'motor', model: 'Y160M-6', year: 2009, status: 'low_eff', reason: '老旧电机效率低，建议更换为 YX3 高效电机。', files: {} }
  ]
}

function onBuildSelect(e) {
  const bId = e.target.value
  selectedBuildId.value = bId
  if (!bId) return
  
  const b = buildList.value.find(x => x.buildId === bId)
  if (b) {
    const nextData = { ...props.data }
    nextData.code = b.buildId
    
    const c = caseList.value.find(x => (x.description || x.F_Desc || x.desc) === bId)

    if (c) {
       nextData.caseId = c.caseId || c.F_CaseID || c.caseID || c.id || ''
       nextData.title = c.caseTitle || c.F_CaseTitle || c.title || b.buildName
       nextData.longitude = c.longitude || c.F_Longitude || b.buildLongitude || ''
       nextData.latitude = c.latitude || c.F_Latitude || b.buildLatitude || ''
       nextData.streetCode = c.streetCode || c.F_StreetCode || ''
       nextData.introduce = c.introduce || c.F_Introduce || ''
       nextData.address = c.address || c.F_Address || b.buildAddr || ''
       nextData.bucketName = c.bucketName || c.F_BucketName || ''
       nextData.objectName = c.objectName || c.F_ObjectName || ''
       
       if (c.courseRelationInfo || c.F_CourseRelationInfo) {
         const info = c.courseRelationInfo || c.F_CourseRelationInfo
         const arr = info.split('')
         if (arr[0] === 'A') arr.shift()
         selectedCourses.value = arr.map((x, i) => x === '1' ? i : -1).filter(x => x !== -1)
       } else {
         selectedCourses.value = []
       }
       imageUrl.value = '' // Clear preview when switching building
    } else {
       nextData.caseId = nextAvailableCaseId.value
       nextData.title = b.buildName
       nextData.longitude = b.buildLongitude || nextData.longitude || ''
       nextData.latitude = b.buildLatitude || nextData.latitude || ''
       nextData.address = b.buildAddr || nextData.address || ''
       
       // 保留用户已输入的字段，不清空
       nextData.streetCode = nextData.streetCode || ''
       nextData.introduce = nextData.introduce || ''
    }
    
    // Auto-save building details into a temporary holding area inside data
    // so they can be reused later in StepSubsystems.vue (分项计量)
    nextData.tempBuildInfo = {
       year: b.buildYear,
       area: b.totalArea,
       floors: `${b.upFloor || 0} / ${b.downFloor || 0}`,
       owner: b.buildOwner,
       func: b.buildFunc === 'C' ? 'hotel' : (b.buildFunc === 'A' ? 'office' : 'mixed')
    }
    
    // 自动注入默认淘汰设备数据以提供闭环演示
    nextData.obsoleteDevices = getSampleObsoleteDevices(b.buildId)
    
    emit('update', nextData)
  }
}

function triggerFileInput() {
  if (fileInputRef.value) fileInputRef.value.click()
}

function onImageSelect(e) {
  const file = e.target.files[0]
  if (file) {
    set('caseFile', file)
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
    imageUrl.value = URL.createObjectURL(file)
  }
}

watch(selectedCourses, (val) => {
  const len = caseIconList.value.length
  const arr = new Array(len).fill(0)
  val.forEach(i => arr[i] = 1)
  set('courseRelationInfo', 'A' + arr.join(''))
}, { deep: true })

const PROGRESS_FIELDS = ['caseId', 'code', 'title', 'address']
const progress = computed(() => {
  const filled = PROGRESS_FIELDS.filter(k => props.data[k]).length
  return Math.round(filled / PROGRESS_FIELDS.length * 100)
})

function set(k, v) {
  emit('update', { ...props.data, [k]: v })
}

function handleNext() {
  const e = {}
  if (!props.data.caseId) e.caseId = '请填写案例编号'
  if (!props.data.code) e.code = '请填写关联建筑编号'
  if (!props.data.title) e.title = '请填写案例名称 / 标题'
  errors.value = e
  if (Object.keys(e).length === 0) emit('next')
}

// AI 实时推理
watch(() => props.data, (d) => {
  const next = []
  if (d.code)   next.push({ t: `识别关联建筑 ${d.code}，已提取经纬度数据`,       l: 'ENTITY.id',       ok: true })
  if (d.title)  next.push({ t: `创建案例实体节点："${d.title}"`,                   l: 'GRAPH.node:Case', ok: true })
  if (d.bucketName && d.objectName) next.push({ t: `解析封面图片：从 ${d.bucketName} 中提取对象`, l: 'STORAGE.minio', ok: true })
  if (d.address) next.push({ t: `已链接区域气象站点与峰谷电价数据`,                l: 'DATA.link',       ok: true })
  thoughts.value = next
}, { deep: true })
</script>

<style scoped>
.img-upload-box {
  width: 148px;
  height: 148px;
  border: 1px dashed var(--line);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: rgba(0,0,0,0.02);
  transition: all 0.2s;
}
.img-upload-box:hover {
  border-color: var(--primary);
  background: rgba(0,0,0,0.05);
}
.img-upload-box .plus-icon {
  font-size: 32px;
  color: var(--text-3);
  font-weight: 200;
}
</style>
