const STATUS_LABEL = {
  active: '就绪',
  computing: '计算中',
  draft: '草稿',
}

export function createDefaultPkgFilters() {
  return {
    keyword: '',
    funcs: [],
    statuses: [],
    subs: [],
    docsMin: null,
    docsMax: null,
    entitiesMin: null,
    entitiesMax: null,
    yearMin: null,
    yearMax: null,
    areaMin: null,
    areaMax: null,
    updatedStart: '',
    updatedEnd: '',
  }
}

export function clonePkgFilters(f) {
  return JSON.parse(JSON.stringify(f || createDefaultPkgFilters()))
}

function isResourceListItem(x) {
  if (!x) return false
  return (
    Object.prototype.hasOwnProperty.call(x, 'resourceID') ||
    Object.prototype.hasOwnProperty.call(x, 'resourceName') ||
    Object.prototype.hasOwnProperty.call(x, 'buildID') ||
    Object.prototype.hasOwnProperty.call(x, 'caseID')
  )
}

function pickUpdatedAt(raw) {
  return (
    raw?.updated ||
    raw?.updateTime ||
    raw?.updateAt ||
    raw?.modifyTime ||
    raw?.modifyAt ||
    raw?.gmtModified ||
    raw?.lastModified ||
    raw?.updatedAt ||
    raw?.createTime ||
    raw?.createdAt ||
    ''
  )
}

export function normalizePkgList(rawList) {
  if (!Array.isArray(rawList) || rawList.length === 0) return []
  const first = rawList[0]
  if (!isResourceListItem(first)) {
    return rawList.map(r => ({
      caseId: r.caseID || '',
      code: String(r.code || r.caseID || r.buildID || r.resourceID || ''),
      buildId: r.buildId || r.buildID || '',
      name: r.name || r.resourceName || '',
      status: r.status,
      docs: Number(r.docs || r.fileCount || 0) || 0,
      entities: Number(r.entities || r.catalogsCount || 0) || 0,
      score: r.score || r.carbonGrade || '—',
      func: r.func || r.buildType || '',
      funcName: r.funcName || r.buildTypeName || '',
      area: Number(r.area || r.buildArea || 0) || 0,
      year: r.year !== undefined && r.year !== null ? Number(r.year) : (r.buildYear !== undefined && r.buildYear !== null ? Number(r.buildYear) : null),
      subs: Array.isArray(r.subs) ? r.subs : [],
      updatedAt: pickUpdatedAt(r),
      _raw: r._raw || r,
    }))
  }

  return rawList.map(r => {
    const catalogs = Array.isArray(r.catalogs) ? r.catalogs : []
    const caseCount = catalogs.reduce((s, c) => s + (Number(c?.caseCount) || 0), 0)
    const subs = catalogs
      .filter(c => c?.catalogsType && c.catalogsType !== 'summary' && (Number(c.caseCount) || 0) > 0)
      .map(c => ({
        type: c.catalogsType,
        name: c.catalogsName || c.catalogsType,
        count: Number(c.caseCount) || 0,
      }))

    const code = String(r.caseID || r.buildID || r.resourceID || '')
    const func = r.buildType || ''
    const funcName = r.buildTypeName || ''

    const st = r.status || 'draft'

    return {
      code,
      buildId: r.buildID,
      name: r.resourceName || '',
      status: st,
      docs: r.fileCount !== undefined ? Number(r.fileCount) || 0 : caseCount,
      entities: subs.length,
      score: r.carbonGrade || '—',
      func,
      funcName,
      area: Number(r.buildArea) || 0,
      year: r.buildYear !== undefined && r.buildYear !== null ? Number(r.buildYear) : null,
      subs,
      updatedAt: pickUpdatedAt(r),
      _raw: r,
    }
  })
}

function normText(s) {
  return String(s || '').trim().toLowerCase()
}

function asDateDay(s) {
  if (!s) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) {
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!m) return null
    const dd = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`)
    return Number.isNaN(dd.getTime()) ? null : dd
  }
  return d
}

function inDateRange(updatedAt, start, end) {
  if (!start && !end) return true
  const d = asDateDay(updatedAt)
  if (!d) return false
  const t = d.getTime()
  if (start) {
    const s = asDateDay(`${start}T00:00:00`)
    if (s && t < s.getTime()) return false
  }
  if (end) {
    const e = asDateDay(`${end}T23:59:59`)
    if (e && t > e.getTime()) return false
  }
  return true
}

export function applyPkgFilters(list, filters, options = {}) {
  const ignore = new Set(options.ignoreKeys || [])
  const keyword = ignore.has('keyword') ? '' : normText(filters.keyword)
  const funcs = ignore.has('funcs') ? [] : (Array.isArray(filters.funcs) ? filters.funcs.filter(Boolean) : [])
  const statuses = ignore.has('statuses') ? [] : (Array.isArray(filters.statuses) ? filters.statuses.filter(Boolean) : [])
  const subs = ignore.has('subs') ? [] : (Array.isArray(filters.subs) ? filters.subs.filter(Boolean) : [])
  const docsMin = ignore.has('docs') ? null : (filters.docsMin !== null && filters.docsMin !== '' ? Number(filters.docsMin) : null)
  const docsMax = ignore.has('docs') ? null : (filters.docsMax !== null && filters.docsMax !== '' ? Number(filters.docsMax) : null)
  const entitiesMin = ignore.has('entities') ? null : (filters.entitiesMin !== null && filters.entitiesMin !== '' ? Number(filters.entitiesMin) : null)
  const entitiesMax = ignore.has('entities') ? null : (filters.entitiesMax !== null && filters.entitiesMax !== '' ? Number(filters.entitiesMax) : null)
  const yearMin = ignore.has('year') ? null : (filters.yearMin !== null && filters.yearMin !== '' ? Number(filters.yearMin) : null)
  const yearMax = ignore.has('year') ? null : (filters.yearMax !== null && filters.yearMax !== '' ? Number(filters.yearMax) : null)
  const areaMin = ignore.has('area') ? null : (filters.areaMin !== null && filters.areaMin !== '' ? Number(filters.areaMin) : null)
  const areaMax = ignore.has('area') ? null : (filters.areaMax !== null && filters.areaMax !== '' ? Number(filters.areaMax) : null)
  const updatedStart = ignore.has('updated') ? '' : (filters.updatedStart || '')
  const updatedEnd = ignore.has('updated') ? '' : (filters.updatedEnd || '')

  return (Array.isArray(list) ? list : []).filter(p => {
    if (keyword) {
      const name = normText(p.name)
      const code = normText(p.code)
      const funcName = normText(p.funcName)
      if (!name.includes(keyword) && !code.includes(keyword) && !funcName.includes(keyword)) return false
    }
    if (funcs.length && !funcs.includes(p.func)) return false
    if (statuses.length && !statuses.includes(p.status)) return false
    if (subs.length) {
      const pkgSubs = Array.isArray(p.subs) ? p.subs : []
      const subTypes = pkgSubs.map(s => (typeof s === 'string' ? s : (s.type || s.catalogsType))).filter(Boolean)
      if (!subs.some(x => subTypes.includes(x))) return false
    }
    if (docsMin !== null || docsMax !== null) {
      const d = Number(p.docs || 0)
      if (Number.isNaN(d)) return false
      if (docsMin !== null && d < docsMin) return false
      if (docsMax !== null && d > docsMax) return false
    }
    if (entitiesMin !== null || entitiesMax !== null) {
      const e = Number(p.entities || 0)
      if (Number.isNaN(e)) return false
      if (entitiesMin !== null && e < entitiesMin) return false
      if (entitiesMax !== null && e > entitiesMax) return false
    }
    if (yearMin !== null || yearMax !== null) {
      if (p.year === null || p.year === undefined || p.year === '') return false
      const y = Number(p.year)
      if (Number.isNaN(y)) return false
      if (yearMin !== null && y < yearMin) return false
      if (yearMax !== null && y > yearMax) return false
    }
    if (areaMin !== null || areaMax !== null) {
      const a = Number(p.area || 0)
      if (Number.isNaN(a)) return false
      if (areaMin !== null && a < areaMin) return false
      if (areaMax !== null && a > areaMax) return false
    }
    if (!inDateRange(p.updatedAt, updatedStart, updatedEnd)) return false
    return true
  })
}

function uniqueSortedNums(arr) {
  const s = new Set()
  arr.forEach(x => {
    const n = Number(x)
    if (!Number.isNaN(n)) s.add(n)
  })
  return Array.from(s).sort((a, b) => a - b)
}

function boundsOfNums(arr) {
  const nums = uniqueSortedNums(arr)
  if (!nums.length) return { min: null, max: null }
  return { min: nums[0], max: nums[nums.length - 1] }
}

function boundsOfDates(arr) {
  const times = arr
    .map(asDateDay)
    .filter(Boolean)
    .map(d => d.getTime())
    .sort((a, b) => a - b)
  if (!times.length) return { min: '', max: '' }
  const toISO = (t) => new Date(t).toISOString().slice(0, 10)
  return { min: toISO(times[0]), max: toISO(times[times.length - 1]) }
}

export function computePkgFacets(universeList, filters) {
  const list = Array.isArray(universeList) ? universeList : []

  const funcBaseMap = new Map()
  list.forEach(p => {
    const k = p.func || ''
    if (!k) return
    if (!funcBaseMap.has(k)) funcBaseMap.set(k, { k, n: p.funcName || k })
  })
  const funcCountMap = new Map()
  applyPkgFilters(list, filters, { ignoreKeys: ['funcs'] }).forEach(p => {
    const k = p.func || ''
    if (!k) return
    funcCountMap.set(k, (funcCountMap.get(k) || 0) + 1)
  })
  const funcs = Array.from(funcBaseMap.values())
    .map(it => ({ ...it, c: funcCountMap.get(it.k) || 0 }))
    .sort((a, b) => (b.c - a.c) || a.n.localeCompare(b.n))

  const statusBaseMap = new Map()
  list.forEach(p => {
    const k = p.status || ''
    if (!k) return
    if (!statusBaseMap.has(k)) statusBaseMap.set(k, { k, n: STATUS_LABEL[k] || k })
  })
  const statusCountMap = new Map()
  applyPkgFilters(list, filters, { ignoreKeys: ['statuses'] }).forEach(p => {
    const k = p.status || ''
    if (!k) return
    statusCountMap.set(k, (statusCountMap.get(k) || 0) + 1)
  })
  const statuses = Array.from(statusBaseMap.values())
    .map(it => ({ ...it, c: statusCountMap.get(it.k) || 0 }))
    .sort((a, b) => (b.c - a.c) || a.n.localeCompare(b.n))

  const subBaseMap = new Map()
  list.forEach(p => {
    const pkgSubs = Array.isArray(p.subs) ? p.subs : []
    pkgSubs.forEach(s => {
      const k = typeof s === 'string' ? s : (s.type || s.catalogsType)
      if (!k) return
      const n = typeof s === 'string' ? s : (s.name || s.catalogsName || k)
      if (!subBaseMap.has(k)) subBaseMap.set(k, { k, n })
    })
  })
  const subCountMap = new Map()
  applyPkgFilters(list, filters, { ignoreKeys: ['subs'] }).forEach(p => {
    const pkgSubs = Array.isArray(p.subs) ? p.subs : []
    const keys = pkgSubs.map(s => (typeof s === 'string' ? s : (s.type || s.catalogsType))).filter(Boolean)
    keys.forEach(k => subCountMap.set(k, (subCountMap.get(k) || 0) + 1))
  })
  const subs = Array.from(subBaseMap.values())
    .map(it => ({ ...it, c: subCountMap.get(it.k) || 0 }))
    .sort((a, b) => (b.c - a.c) || a.n.localeCompare(b.n))

  const yearBounds = boundsOfNums(list.map(p => p.year).filter(x => x !== null && x !== undefined && x !== ''))
  const areaBounds = boundsOfNums(list.map(p => p.area).filter(x => x !== null && x !== undefined && x !== ''))
  const docsBounds = boundsOfNums(list.map(p => p.docs).filter(x => x !== null && x !== undefined && x !== ''))
  const entitiesBounds = boundsOfNums(list.map(p => p.entities).filter(x => x !== null && x !== undefined && x !== ''))
  const updatedBounds = boundsOfDates(list.map(p => p.updatedAt).filter(Boolean))

  const matched = applyPkgFilters(list, filters).length

  return {
    funcs,
    statuses,
    subs,
    yearBounds,
    areaBounds,
    docsBounds,
    entitiesBounds,
    updatedBounds,
    matched,
    total: list.length,
  }
}

export function sanitizePkgFiltersAgainstFacets(filters, facets) {
  const next = clonePkgFilters(filters)

  const funcAllowed = new Set((facets?.funcs || []).map(x => x.k))
  next.funcs = (next.funcs || []).filter(k => funcAllowed.has(k))

  const statusAllowed = new Set((facets?.statuses || []).map(x => x.k))
  next.statuses = (next.statuses || []).filter(k => statusAllowed.has(k))

  const subAllowed = new Set((facets?.subs || []).map(x => x.k))
  next.subs = (next.subs || []).filter(k => subAllowed.has(k))

  const db = facets?.docsBounds || { min: null, max: null }
  if (db.min !== null && next.docsMin !== null && next.docsMin !== '' && Number(next.docsMin) < db.min) next.docsMin = db.min
  if (db.max !== null && next.docsMax !== null && next.docsMax !== '' && Number(next.docsMax) > db.max) next.docsMax = db.max
  if (next.docsMin !== null && next.docsMin !== '' && next.docsMax !== null && next.docsMax !== '') {
    const a = Number(next.docsMin)
    const b = Number(next.docsMax)
    if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
      next.docsMin = b
      next.docsMax = a
    }
  }

  const eb = facets?.entitiesBounds || { min: null, max: null }
  if (eb.min !== null && next.entitiesMin !== null && next.entitiesMin !== '' && Number(next.entitiesMin) < eb.min) next.entitiesMin = eb.min
  if (eb.max !== null && next.entitiesMax !== null && next.entitiesMax !== '' && Number(next.entitiesMax) > eb.max) next.entitiesMax = eb.max
  if (next.entitiesMin !== null && next.entitiesMin !== '' && next.entitiesMax !== null && next.entitiesMax !== '') {
    const a = Number(next.entitiesMin)
    const b = Number(next.entitiesMax)
    if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
      next.entitiesMin = b
      next.entitiesMax = a
    }
  }

  const yb = facets?.yearBounds || { min: null, max: null }
  if (yb.min !== null && next.yearMin !== null && next.yearMin !== '' && Number(next.yearMin) < yb.min) next.yearMin = yb.min
  if (yb.max !== null && next.yearMax !== null && next.yearMax !== '' && Number(next.yearMax) > yb.max) next.yearMax = yb.max
  if (next.yearMin !== null && next.yearMin !== '' && next.yearMax !== null && next.yearMax !== '') {
    const a = Number(next.yearMin)
    const b = Number(next.yearMax)
    if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
      next.yearMin = b
      next.yearMax = a
    }
  }

  const ab = facets?.areaBounds || { min: null, max: null }
  if (ab.min !== null && next.areaMin !== null && next.areaMin !== '' && Number(next.areaMin) < ab.min) next.areaMin = ab.min
  if (ab.max !== null && next.areaMax !== null && next.areaMax !== '' && Number(next.areaMax) > ab.max) next.areaMax = ab.max
  if (next.areaMin !== null && next.areaMin !== '' && next.areaMax !== null && next.areaMax !== '') {
    const a = Number(next.areaMin)
    const b = Number(next.areaMax)
    if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
      next.areaMin = b
      next.areaMax = a
    }
  }

  const ub = facets?.updatedBounds || { min: '', max: '' }
  if (ub.min && next.updatedStart && next.updatedStart < ub.min) next.updatedStart = ub.min
  if (ub.max && next.updatedEnd && next.updatedEnd > ub.max) next.updatedEnd = ub.max
  if (next.updatedStart && next.updatedEnd && next.updatedStart > next.updatedEnd) {
    const t = next.updatedStart
    next.updatedStart = next.updatedEnd
    next.updatedEnd = t
  }

  return next
}

export function buildPkgListBackendParams(filters) {
  const f = filters || createDefaultPkgFilters()
  const params = {
    resourceName: f.keyword ? String(f.keyword).trim() : undefined,
    buildType: Array.isArray(f.funcs) && f.funcs.length ? f.funcs.join(',') : undefined,
    status: Array.isArray(f.statuses) && f.statuses.length ? f.statuses.join(',') : undefined,
    fileCountMin: f.docsMin !== null && f.docsMin !== '' ? Number(f.docsMin) : undefined,
    fileCountMax: f.docsMax !== null && f.docsMax !== '' ? Number(f.docsMax) : undefined,
    catalogsCountMin: f.entitiesMin !== null && f.entitiesMin !== '' ? Number(f.entitiesMin) : undefined,
    catalogsCountMax: f.entitiesMax !== null && f.entitiesMax !== '' ? Number(f.entitiesMax) : undefined,
    buildYearMin: f.yearMin !== null && f.yearMin !== '' ? Number(f.yearMin) : undefined,
    buildYearMax: f.yearMax !== null && f.yearMax !== '' ? Number(f.yearMax) : undefined,
    buildAreaMin: f.areaMin !== null && f.areaMin !== '' ? Number(f.areaMin) : undefined,
    buildAreaMax: f.areaMax !== null && f.areaMax !== '' ? Number(f.areaMax) : undefined,
    updatedStart: f.updatedStart ? String(f.updatedStart) : undefined,
    updatedEnd: f.updatedEnd ? String(f.updatedEnd) : undefined,
    catalogsType: Array.isArray(f.subs) && f.subs.length ? f.subs.join(',') : undefined,
  }

  Object.keys(params).forEach(k => {
    const v = params[k]
    if (v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v))) delete params[k]
  })
  return params
}

export function countActivePkgFilterChips(filters) {
  const f = filters || createDefaultPkgFilters()
  let n = 0
  if (f.keyword && String(f.keyword).trim()) n += 1
  if (Array.isArray(f.funcs) && f.funcs.length) n += 1
  if (Array.isArray(f.statuses) && f.statuses.length) n += 1
  if (Array.isArray(f.subs) && f.subs.length) n += 1
  if (f.docsMin !== null && f.docsMin !== '' || f.docsMax !== null && f.docsMax !== '') n += 1
  if (f.entitiesMin !== null && f.entitiesMin !== '' || f.entitiesMax !== null && f.entitiesMax !== '') n += 1
  if (f.yearMin !== null && f.yearMin !== '' || f.yearMax !== null && f.yearMax !== '') n += 1
  if (f.areaMin !== null && f.areaMin !== '' || f.areaMax !== null && f.areaMax !== '') n += 1
  if (f.updatedStart || f.updatedEnd) n += 1
  return n
}
