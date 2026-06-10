import http from './http.js'

export function getBuildInfo(caseId, pageIndex = 1, pageSize = 20) {
  return http.get('/manage/buildInfo', { params: { caseId, pageIndex, pageSize } })
}

export function getGreenBuild(caseId, pageIndex = 1, pageSize = 20) {
  return http.get('/manage/greenBuild', { params: { caseId, pageIndex, pageSize } })
}

export function getDynamoInfo(caseId, pageIndex = 1, pageSize = 20) {
  return http.get('/manage/dynamoInfo', { params: { caseId, pageIndex, pageSize } })
}

export function getUnitBenchmarkInfo(caseId) {
  return http.get('/manage/unitBenchmarkInfo', { params: { caseId } })
}

export function getRenoInfo(caseId) {
  return http.get('/manage/renoInfo', { params: { caseId } })
}

export function getSrRenoData(caseId, time) {
  return http.get('/manage/srRenoData', { params: { caseId, time } })
}

export function getSrRenoDataInfo(caseId) {
  return http.get('/manage/srRenoDataInfo', { params: { CaseID: caseId } })
}

export function getEffictImproveData(caseId) {
  return http.get('/manage/getEffictImproveData', { params: { caseId } })
}

export function addEffictImproveData(efProjectName, group, buildID, dataJson) {
  return http.post('/manage/addEffictImproveData', { efProjectName, group, buildID, dataJson }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

export function getEnergyAuditData(caseId) {
  return http.get('/manage/GetEnergyAuditData', { params: { caseId } })
}

export function getChargingPileInfo(caseId, pageIndex = 1, pageSize = 20) {
  return http.get('/manage/chargingPileInfo', { params: { caseId, pageIndex, pageSize } })
}

export function getSolarInfo(caseId) {
  return http.get('/manage/solarInfo', { params: { caseId } })
}

export function getSolarData(solarId) {
  return http.get('/manage/solarData', { params: { solarId } })
}

export function getSolarFileList(solarId) {
  return http.get('/manage/solarFileList', { params: { solarId } })
}

export function getCGData(caseId) {
  return http.get('/manage/getCGData', { params: { caseId } })
}

export function getCarbonQRList(caseId) {
  return http.get('/manage/getCarbonQRList', { params: { caseId } })
}

export function getUnitInfo(caseId) {
  return http.get('/manage/unitInfo', { params: { caseId } })
}

export function getFileList(projectID, table) {
  return http.get('/manage/getFile', { params: { projectID, table } })
}

export function uploadFile(projectID, files, table, tag) {
  const formData = new FormData()
  formData.append('projectID', projectID)
  formData.append('table', table)
  if (tag) {
    formData.append('tag', tag)
  }
  files.forEach(file => {
    formData.append('files', file)
  })
  return http.post('/manage/uploadFile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function deleteFile(projectID, fileID, table) {
  const formData = new FormData()
  formData.append('projectID', projectID)
  formData.append('fileID', fileID)
  formData.append('table', table)
  return http.post('/manage/DeleteFile', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

