// 真实后端接口
// MOCK = false 时启用，对接后端 REST API

import http from './http.js'

// ── 资源包列表 ────────────────────────────────────────────────
export function getPackageList() {
  return http.get('/packages')
}

// ── 资源包详情（传 buildId） ───────────────────────────────────
export function getPackageDetail(buildId) {
  return http.get('/Resource/getResourcePackage', { params: { buildId } })
}

// ── 统计汇总 ──────────────────────────────────────────────────
export function getPackageSummary() {
  return http.get('/packages/summary')
}

// ── 创建资源包 ────────────────────────────────────────────────
export function createPackage(data) {
  return http.post('/packages', data)
}

// ── 上传文档 ──────────────────────────────────────────────────
export function uploadDoc(pkgCode, formData) {
  return http.post(`/packages/${pkgCode}/docs`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

