// 接口统一出口
// 所有组件/store 只从这里 import，不直接引用 mock 或 _real
// 切换环境只需修改 src/config.js 里的 MOCK 值

import { MOCK } from '../config.js'
import * as mockApi from './mock/packages.js'
import * as realApi from './_real.js'

const api = MOCK ? mockApi : realApi

export const getPackageList    = api.getPackageList
export const getPackageDetail  = api.getPackageDetail
export const getPackageSummary = api.getPackageSummary
export const createPackage     = api.createPackage
export const uploadDoc         = api.uploadDoc
