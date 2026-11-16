import { nodeWindow } from './model.js'

/**
 * 事项色板：按 id 稳定散列，同一事项每次渲染都得到同一种颜色。
 * 返回分类色名（teal/amber/…），只用来挂 data-color 属性，具体色由样式表决定。
 */
export function tagColor(item) {
  let hash = 0
  for (const char of String(item?.id ?? item?.title ?? '')) hash = (hash * 31 + char.codePointAt(0)) % 100000
  return ['teal', 'amber', 'rose', 'violet', 'sky', 'olive', 'slate'][hash % 7]
}

function includesValue(values, value) {
  return Array.isArray(values) && values.includes(value)
}

export function scoreFit(item, profile = {}) {
  let score = 0
  const reasons = []
  const rules = [
    ['major', item.majors, profile.major, 35, '专业匹配'],
    ['province', item.regions, profile.province, 15, '地区匹配'],
    ['interests', item.interests, profile.interests, 25, '关注方向匹配'],
    ['year', item.years, profile.year ?? profile.years, 15, '年级适配'],
    ['types', [item.category], profile.types, 10, '类别匹配'],
  ]
  for (const [kind, accepted, selected, weight, label] of rules) {
    if (kind === 'interests' || kind === 'types') {
      const choices = Array.isArray(selected) ? selected : []
      if (choices.length && choices.some(value => includesValue(accepted, value))) { score += weight; reasons.push(label) }
    } else if (selected && includesValue(accepted, selected)) {
      score += weight
      reasons.push(label)
    }
  }
  return { score: Math.min(100, score), reasons }
}

function matchesDate(item, from, to) {
  if (!from && !to) return true
  return (item.nodes ?? []).some(node => {
    const { precision, from: start, to: end } = nodeWindow(node)
    if (precision === 'unknown' || !start || !end) return false
    return (!from || end >= from) && (!to || start <= to)
  })
}

/**
 * 月历只索引「落在某一天」的节点：
 *   exact / range（短窗口）→ 起点和终点这两天（单日节点就是一个点）
 *   month                  → 不进格子。见 monthFloating()
 *   range（长窗口）        → 也不进格子。见下
 *   year / unknown         → 也不进格子（只留在时间轴、列表和 ICS）
 *
 * 两种日期都曾经在骗人：
 *   1. 月份精度的节点被钉在当月 1 号和最后一天，于是整张月历看起来「所有事都发生在 1 号和月末」；
 *   2. 「报名 4/1—6/30」这种长窗口，首日和末日只是窗口边界，不是任何一天有安排。
 * 与其编一天，不如把它们放进月历下方的横带里照实说「只知道是 3 月」「整个 5—6 月都在进行」。
 * 月历网格是 42 天（含上/下月补格），所以索引范围也取整块网格，否则补格里的事件会凭空消失。
 */
const DAY_MS = 86400000
/**
 * 超过这个天数的窗口算「一段时间都在进行」，两端不再是某一天的安排。
 *
 * 为什么是两周：一个 2—3 天的比赛窗口（数模 72 小时、省赛两天）首尾确实是真日子；
 * 但「报名 3 月 1 日—3 月 31 日」「报名 3 月 15 日—4 月 15 日」这种，端点只是窗口边界，
 * 没有任何一天比其他天更特殊 —— 那正是用户抱怨的「全是 1 号和月末」。
 * 两周以内还可能是「赛程本身就这么短」，两周以上基本都是「这段时间里某天」。
 */
export const LONG_SPAN_DAYS = 14
/** 几乎占满全年（≥ 两个月＋300 天…实际用 300 天）的窗口算「全年滚动」，不进每月横带。 */
export const ROLLING_YEAR_DAYS = 300

export function spanDays(from, to) {
  if (!from || !to) return 0
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  return Math.round((end - start) / DAY_MS) + 1
}

export function buildMonthIndex(items = [], month = new Date()) {
  const { startKey, endKey } = monthGridBounds(month)
  const index = new Map()
  const push = (key, item, node, edge) => {
    if (key < startKey || key > endKey) return
    const rows = index.get(key) || []
    if (rows.some(row => row.item.id === item.id && row.node.id === node.id && row.edge === edge)) return
    rows.push({ item, node, edge })
    index.set(key, rows)
  }
  for (const item of items ?? []) {
    for (const node of item.nodes ?? []) {
      const { precision, from, to } = nodeWindow(node)
      // 年份精度会铺满 12 个月，把真正要看的日期糊掉；它只留在时间轴、列表和 ICS 里。
      if (precision === 'unknown' || precision === 'year' || precision === 'month' || !from || !to) continue
      // 长窗口首尾不是「那天有安排」，同样进横带
      if (spanDays(from, to) > LONG_SPAN_DAYS) continue
      if (from > endKey || to < startKey) continue
      push(from, item, node, from === to ? null : 'start')
      if (to !== from) push(to, item, node, 'end')
    }
  }
  return index
}

/**
 * 本月「日期不够具体」的节点，单独一条横带列出来。三种：
 *   kind='month' —— 只知道是哪个月，还不知道哪一天（「3 月（预计）」）
 *   kind='span'  —— 跨度很长，整段时间都在进行（「5—6 月，整个窗口都在办」）
 *   kind='year'  —— 几乎占满全年（「全年滚动」），每个月都会命中，单独归成一行
 * 这样月历格子里只剩真正落在某一天的安排，格子里的东西才可信；
 * 而模糊档期也没被丢掉，只是换了个诚实的表达方式。
 */
export function monthFloating(items = [], month = new Date()) {
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  const monthStart = `${prefix}-01`
  const monthEnd = `${prefix}-31`
  const rows = []
  const seen = new Set()
  for (const item of items ?? []) {
    for (const node of item.nodes ?? []) {
      const { precision, from, to } = nodeWindow(node)
      if (!from) continue
      let kind = null
      if (precision === 'month' && from.startsWith(prefix)) kind = 'month'
      else if (precision === 'range' && spanDays(from, to) > LONG_SPAN_DAYS && from <= monthEnd && to >= monthStart) {
        // 覆盖大半个年头的「全年滚动」，放进每个月的横带只会挤掉真正要看的东西
        kind = spanDays(from, to) >= ROLLING_YEAR_DAYS ? 'year' : 'span'
      }
      if (!kind) continue
      const key = `${item.id}:${node.id}`
      if (seen.has(key)) continue
      seen.add(key)
      rows.push({ item, node, edge: null, kind })
    }
  }
  return rows.sort((a, b) => (a.node.start || '').localeCompare(b.node.start || '') || (a.item.title || '').localeCompare(b.item.title || '', 'zh-CN'))
}

/** 月历渲染的 42 天网格边界，索引与「档期未定」两处共用同一口径。 */
export function monthGridBounds(month = new Date()) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() + 6) % 7))
  const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 41)
  const fmt = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return { start: start, last, startKey: fmt(start), endKey: fmt(last) }
}

export function filterItems(items, filters = {}, profile = {}) {
  const query = String(filters.query ?? '').trim().toLocaleLowerCase()
  return (items ?? []).filter(item => {
    if (query && ![item.title, item.alias, item.description, item.organizer, ...(item.interests ?? []), ...(item.majors ?? [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(query)) return false
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false
    if (filters.major && filters.major !== 'all' && !includesValue(item.majors, filters.major)) return false
    if (filters.province && filters.province !== 'all' && !includesValue(item.regions, filters.province)) return false
    if (filters.status && filters.status !== 'all' && item.registrationStatus !== filters.status) return false
    if (!matchesDate(item, filters.from, filters.to)) return false
    if (filters.onlySuitable && scoreFit(item, profile).score === 0) return false
    return true
  }).sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'zh-CN'))
}
