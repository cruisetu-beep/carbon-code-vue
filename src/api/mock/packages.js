// Mock 接口实现
// 直接复用现有静态数据，用 Promise.resolve() 模拟异步行为
// 后端就绪后此文件不再使用

import { SAMPLE_PKGS } from '../../data/samplePkgs.js'

// 模拟网络延迟（ms），设为 0 可关闭
const DELAY = 300
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ── 资源包列表 ────────────────────────────────────────────────
export async function getPackageList() {
  await delay(DELAY)
  return SAMPLE_PKGS
}

// ── 资源包详情（详情始终走真实接口，此处不实现）─────────────
export async function getPackageDetail(code) {
  return Promise.reject(new Error('detail always uses real API'))
}

// ── 统计汇总 ──────────────────────────────────────────────────
export async function getPackageSummary() {
  await delay(DELAY)
  return {
    totalCount:    SAMPLE_PKGS.length,
    totalArea:     SAMPLE_PKGS.reduce((s, p) => s + p.area, 0),
    totalEntities: 2298,
    readyRate:     83,
  }
}

// ── 创建资源包 ────────────────────────────────────────────────
export async function createPackage(data) {
  await delay(DELAY)
  return { code: `SH-NEW-${Date.now()}`, ...data }
}

// ── 上传文档 ──────────────────────────────────────────────────
export async function uploadDoc(pkgCode, _file) {
  await delay(DELAY * 2)
  return { docId: `doc_${Date.now()}`, status: 'parsing' }
}
