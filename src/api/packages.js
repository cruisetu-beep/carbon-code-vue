// 接口统一出口
// 列表/汇总接口受 MOCK 开关控制
// 详情接口始终走真实后端（已有真实接口）

import { MOCK } from '../config.js'
import * as mockApi from './mock/packages.js'
import * as realApi from './_real.js'

const api = MOCK ? mockApi : realApi

export const getPackageList    = api.getPackageList
export const getPackageSummary = api.getPackageSummary
export const createPackage     = api.createPackage
export const uploadDoc         = api.uploadDoc

// 详情接口：始终走真实后端
export const getPackageDetail  = realApi.getPackageDetail

