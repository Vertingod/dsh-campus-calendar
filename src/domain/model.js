export const CATEGORIES = ['competition', 'certificate', 'memo']
export const NODE_TYPES = ['registration', 'registration_deadline', 'competition', 'exam', 'submission', 'result', 'other']
export const CONFIDENCE = ['official_confirmed', 'predicted', 'pending_confirmation', 'unknown']
export const REGISTRATION_STATUS = ['not_open', 'open', 'closed', 'unknown']
// 标签色板（实际色值写在 styles.css 的 .cc-tag[data-color=...] 上）
export const TAG_COLORS = ['teal', 'amber', 'rose', 'violet', 'sky', 'olive', 'slate']
// 时间精度阶梯：exact > range > month > year。粗粒度也是合法日期，不是「没有日期」。
export const PRECISION = ['exact', 'range', 'month', 'year', 'unknown']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function confidenceLabel(item = {}, node = {}) {
  if (item.demo) return { label: '演示', detail: '演示用时间窗，不代表真实活动或官方安排。' }
  if (node.confidence === 'official_confirmed' && (node.start || node.end) && validUrl(item.sourceUrl) && validDate(item.verifiedAt) && item.verifiedAt) return { label: '官方已确认', detail: `最近核验：${item.verifiedAt}` }
  if (node.confidence === 'official_confirmed' || node.confidence === 'pending_confirmation') return { label: '待确认', detail: node.note || '等待主办方发布正式日期。' }
  if (node.confidence === 'predicted') return { label: '预测', detail: node.note || '依据往年安排推测，待官方确认。' }
  return { label: '日期未知', detail: node.note || '暂无可确认的日期。' }
}

function validDate(value) {
  if (value === null) return true
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

/**
 * 时间精度：一个节点「知道到哪一步」。
 * 写入方可以显式声明 accuracy（month / year / range），没声明就按起止日期推断。
 * 关键约定：精度只是「我们说得多细」，不是「日期可不可信」——
 * 只到月份的预测（accuracy: month + confidence: predicted）是完整表达，
 * 不需要也不允许为了凑出一天而编一个日子。
 */
export function nodePrecision(node = {}) {
  const start = node?.start || null
  const end = node?.end || null
  if (!start && !end) return 'unknown'
  const declared = node?.accuracy
  if (declared === 'month' || declared === 'year') return declared
  if (declared === 'range' && end && start !== end) return 'range'
  return end && start !== end ? 'range' : 'exact'
}

/** 某一天所在月份的完整边界（含闰年二月）。 */
export function monthBounds(value) {
  const year = Number(String(value).slice(0, 4))
  const month = Number(String(value).slice(5, 7))
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return { from: `${prefix}-01`, to: `${prefix}-${String(last).padStart(2, '0')}` }
}

/**
 * 节点在日历上实际占住的时间窗。
 * exact → 当天；range → 起止；month → 整月；year → 整年；unknown → 无窗口。
 * 月历、时间轴、ICS 导出都用同一套窗口，避免三处各算一遍算出三个答案。
 */
export function nodeWindow(node = {}) {
  const precision = nodePrecision(node)
  const start = node?.start || node?.end || null
  if (precision === 'unknown' || !start) return { precision: 'unknown', from: null, to: null }
  if (precision === 'month') return { precision, ...monthBounds(start) }
  if (precision === 'year') {
    const year = start.slice(0, 4)
    return { precision, from: `${year}-01-01`, to: `${year}-12-31` }
  }
  return { precision, from: start, to: node?.end || start }
}

/**
 * 图片只接受 http(s) 直链。宣传图常挂在主办方站点，所以插件不下载、不缓存，
 * 由客户端按 referrerpolicy=no-referrer 直接引用；加载失败时退回文字占位。
 */
export function validImageUrl(value) {
  return typeof value === 'string' && value.length <= 500 && validUrl(value)
}

function validUrl(value) {
  if (!value) return false
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function text(value, max = 2000) {
  return typeof value === 'string' && value.length <= max
}

export function validateItem(input) {
  const errors = []
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['事项必须是对象'] }
  if (!text(input.id, 100) || !input.id.trim()) errors.push('id 必填且不超过 100 字符')
  if (!text(input.title, 200) || !input.title.trim()) errors.push('title 必填且不超过 200 字符')
  if (!CATEGORIES.includes(input.category)) errors.push('category 无效')
  if (input.category === 'memo') {
    if (input.memoLevel !== undefined && ![1, 2, 3, 4].includes(input.memoLevel)) errors.push('memoLevel 必须是 1-4')
    if (input.nodes?.length !== 1) errors.push('备忘必须只有一个日期节点')
    else if (input.nodes[0]?.type !== 'other' || !input.nodes[0]?.start || input.nodes[0]?.end) errors.push('备忘必须是单日日期节点')
  } else if (input.memoLevel !== undefined) errors.push('memoLevel 仅适用于备忘')
  if (input.demo !== undefined && typeof input.demo !== 'boolean') errors.push('demo 必须为布尔值')
  for (const field of ['description', 'organizer', 'eligibility', 'notes']) {
    if (input[field] !== undefined && !text(input[field])) errors.push(`${field} 格式无效`)
  }
  for (const field of ['majors', 'interests', 'years', 'regions']) {
    if (input[field] !== undefined && (!Array.isArray(input[field]) || input[field].some(value => !text(value, 100)))) errors.push(`${field} 必须为字符串列表`)
  }
  if (input.sourceUrl !== undefined && input.sourceUrl !== '' && !validUrl(input.sourceUrl)) errors.push('sourceUrl 必须是 http 或 https URL')
  if (input.imageUrl !== undefined && input.imageUrl !== '' && !validImageUrl(input.imageUrl)) errors.push('imageUrl 必须是 http 或 https 图片直链')
  if (input.artist !== undefined && input.artist !== '' && !text(input.artist, 120)) errors.push('artist 格式无效')
  if (input.venue !== undefined && input.venue !== '' && !text(input.venue, 200)) errors.push('venue 格式无效')
  if (input.verifiedAt !== undefined && input.verifiedAt !== '' && !validDate(input.verifiedAt)) errors.push('verifiedAt 必须是 YYYY-MM-DD 日期')
  if (input.registrationStatus !== undefined && !REGISTRATION_STATUS.includes(input.registrationStatus)) errors.push('registrationStatus 无效')
  if (!Array.isArray(input.nodes) || input.nodes.length > 100) errors.push('nodes 必须是最多 100 项的列表')
  else {
    const nodeIds = new Set()
    input.nodes.forEach((node, index) => {
    const prefix = `nodes[${index}]`
    if (!node || typeof node !== 'object') { errors.push(`${prefix} 必须是对象`); return }
    if (!text(node.id, 100) || !node.id.trim()) errors.push(`${prefix}.id 必填`)
    else if (nodeIds.has(node.id)) errors.push(`${prefix}.id 重复`)
    else nodeIds.add(node.id)
    if (!NODE_TYPES.includes(node.type)) errors.push(`${prefix}.type 无效`)
    if (!CONFIDENCE.includes(node.confidence)) errors.push(`${prefix}.confidence 无效`)
    const start = node.start ?? null
    const end = node.end ?? null
    if (!validDate(start) || !validDate(end)) errors.push(`${prefix} 日期必须是真实的 YYYY-MM-DD 或 null`)
    if (start && end && start > end) errors.push(`${prefix} 日期范围倒置`)
    if (input.demo && node.confidence === 'official_confirmed') errors.push(`${prefix} 演示数据不能标记为官方已确认`)
    if (node.confidence === 'official_confirmed' && (!validUrl(input.sourceUrl) || !validDate(input.verifiedAt) || !input.verifiedAt || (!start && !end))) errors.push(`${prefix} 官方确认日期必须有日期、来源 URL 和核验日期`)
    if (node.confidence === 'predicted' && (!text(node.note, 1000) || !node.note.trim())) errors.push(`${prefix} 预测日期必须填写依据说明`)
    if (node.note !== undefined && !text(node.note, 1000)) errors.push(`${prefix}.note 格式无效`)
    if (node.accuracy !== undefined && !PRECISION.includes(node.accuracy)) errors.push(`${prefix}.accuracy 无效`)
    // 标签色只能取枚举值：客户端会把它拼进 class 名，放任任意字符串等于引入样式注入
    if (node.color !== undefined && node.color !== '' && !TAG_COLORS.includes(node.color)) errors.push(`${prefix}.color 无效`)
    })
  }
  if (errors.length) return { ok: false, errors }
  return { ok: true, value: structuredClone(input) }
}

export function validateDataset(input, maxBytes = 2 * 1024 * 1024) {
  let serialized
  try { serialized = JSON.stringify(input) } catch { return { ok: false, errors: ['数据无法序列化'] } }
  if (new TextEncoder().encode(serialized ?? '').byteLength > maxBytes) return { ok: false, errors: ['数据超过大小限制'] }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['数据必须是对象'] }
  const errors = []
  if (input.version !== 1) errors.push('version 必须为 1')
  if (!input.profile || typeof input.profile !== 'object' || Array.isArray(input.profile)) errors.push('profile 必须是对象')
  else {
    for (const field of ['major', 'year', 'province']) if (input.profile[field] !== undefined && !text(input.profile[field], 100)) errors.push(`profile.${field} 必须是字符串`)
    for (const field of ['interests', 'types']) if (input.profile[field] !== undefined && (!Array.isArray(input.profile[field]) || input.profile[field].some(value => !text(value, 100)))) errors.push(`profile.${field} 必须是字符串列表`)
  }
  if (!Array.isArray(input.items)) errors.push('items 必须是列表')
  else {
    const itemIds = new Set()
    input.items.forEach((item, index) => {
      const result = validateItem(item)
      if (!result.ok) errors.push(...result.errors.map(error => `items[${index}]: ${error}`))
      if (typeof item?.id === 'string') {
        if (itemIds.has(item.id)) errors.push(`items[${index}]: id 重复`)
        else itemIds.add(item.id)
      }
    })
  }
  for (const field of ['favorites', 'reminders']) {
    if (input[field] !== undefined && (!Array.isArray(input[field]) || input[field].some(value => !text(value, 200)))) errors.push(`${field} 必须是字符串列表`)
  }
  if (errors.length) return { ok: false, errors }
  return { ok: true, value: { version: 1, profile: structuredClone(input.profile), items: structuredClone(input.items), favorites: [...(input.favorites ?? [])], reminders: [...(input.reminders ?? [])] } }
}
