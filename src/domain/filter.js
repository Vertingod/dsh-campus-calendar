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
 * 月历只索引「关键日子」，不是一个节点覆盖过的每一天：
 *   exact / range → 只落到起点和终点这两天（单日节点就是一个点）
 *   month         → 只落到当月 1 日和最后一天（起止各一个标记）
 *   year / unknown→ 不进月历格（只留在时间轴、列表和 ICS）
 * 理由是 user 提的那点：报名期一开，整月每天都染上颜色，月历就退化成一片色块，
 * 看不出哪天真正要动手。起止两天足够表达「什么时候开始、什么时候来不及」。
 */
export function buildMonthIndex(items = [], month = new Date()) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() + 6) % 7))
  const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 41)
  const startKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
  const endKey = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
  const index = new Map()
  const push = (key, item, node, edge) => {
    if (key < startKey || key > endKey) return
    const rows = index.get(key) || []
    if (rows.some(row => row.item.id === item.id && row.node.id === node.id)) return
    rows.push({ item, node, edge })
    index.set(key, rows)
  }
  for (const item of items ?? []) {
    for (const node of item.nodes ?? []) {
      const { precision, from, to } = nodeWindow(node)
      // 年份精度会铺满 12 个月，把真正要看的日期糊掉；它只留在时间轴、列表和 ICS 里。
      if (precision === 'unknown' || precision === 'year' || !from || !to) continue
      if (from > endKey || to < startKey) continue
      push(from, item, node, from === to ? null : 'start')
      if (to !== from) push(to, item, node, 'end')
    }
  }
  return index
}

export function filterItems(items, filters = {}, profile = {}) {
  const query = String(filters.query ?? '').trim().toLocaleLowerCase()
  return (items ?? []).filter(item => {
    if (query && ![item.title, item.description, item.organizer, ...(item.interests ?? []), ...(item.majors ?? [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(query)) return false
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false
    if (filters.major && filters.major !== 'all' && !includesValue(item.majors, filters.major)) return false
    if (filters.province && filters.province !== 'all' && !includesValue(item.regions, filters.province)) return false
    if (filters.status && filters.status !== 'all' && item.registrationStatus !== filters.status) return false
    if (!matchesDate(item, filters.from, filters.to)) return false
    if (filters.onlySuitable && scoreFit(item, profile).score === 0) return false
    return true
  }).sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'zh-CN'))
}
