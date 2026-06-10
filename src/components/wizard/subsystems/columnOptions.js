export function normalizeColumnOptions(options) {
  if (!Array.isArray(options)) return []

  return options.map((option) => {
    if (Array.isArray(option) && option.length >= 2) {
      return { key: String(option[0]), value: String(option[1]) }
    }

    const key = option?.key ?? option?.Key ?? option?.editValue ?? option?.EditValue ?? option?.id ?? option?.Id
    const value = option?.value ?? option?.Value ?? option?.displayValue ?? option?.DisplayValue ?? option?.name ?? option?.Name ?? key

    if (key == null && value == null) return null
    return { key: String(key ?? ''), value: String(value ?? '') }
  }).filter(Boolean)
}

export function getColumnByNames(columns, names) {
  const targets = (Array.isArray(names) ? names : [names])
    .map(name => String(name || '').toLowerCase())
    .filter(Boolean)

  return (Array.isArray(columns) ? columns : []).find((column) => {
    const columnName = String(column?.columnName || column?.ColumnName || '').toLowerCase()
    return targets.includes(columnName)
  })
}

export function getColumnOptions(columns, names, fallback = []) {
  const column = getColumnByNames(columns, names)
  const dynamicOptions = normalizeColumnOptions(column?.columnOption || column?.ColumnOption)
  return dynamicOptions.length ? dynamicOptions : normalizeColumnOptions(fallback)
}

/**
 * 根据回填的值，如果在选项中找到匹配的 value，则返回对应的 key；否则如果是合法的 key 则返回 key。如果都找不到则返回原值。
 * 解决回填的中文描述值无法被 key 值绑定的 select 组件正常渲染的问题。
 */
export function getOptionKeyByValue(options, val) {
  if (val == null || val === '') return val
  const strVal = String(val).trim()
  if (!Array.isArray(options) || options.length === 0) return val
  // 1. 优先尝试精准匹配 option.value (如 '腾天', '1期')
  const foundByValue = options.find(opt => String(opt.value).trim() === strVal)
  if (foundByValue) return foundByValue.key
  // 2. 其次尝试匹配 option.key
  const foundByKey = options.find(opt => String(opt.key).trim() === strVal)
  if (foundByKey) return foundByKey.key
  return val
}

/**
 * 转换单个记录对象中的指定字段值，将它们的 value 值映射为 key 值
 */
export function convertRecordValuesToKeys(record, mappings) {
  if (!record || typeof record !== 'object') return record
  const result = { ...record }
  for (const [field, options] of Object.entries(mappings)) {
    if (result[field] !== undefined) {
      result[field] = getOptionKeyByValue(options, result[field])
    }
  }
  return result
}

/**
 * 转换记录列表中的所有对象
 */
export function convertItemsValuesToKeys(items, mappings) {
  if (!Array.isArray(items)) return []
  return items.map(item => convertRecordValuesToKeys(item, mappings))
}

