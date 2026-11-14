import { confidenceLabel, nodePrecision, nodeWindow } from './model.js'

const DAY = 86_400_000

/**
 * 「日期未知」的事项也要出现在时间轴上，否则日历会显得空。
 * 把每个事项归到一个可以排序的落点：
 *   - dated：任一节点有时间窗（精确日期、区间、只到月/年都算），落点取最早窗口的起点
 *   - expected：没有日期，但备注里写明了「预计 / 待公布」的时间（如“省赛通常在春季”）
 *   - unknown：没有任何时间线索，落到时间轴末尾
 * 这里只做排序与分组，绝不产出假的 start/end，也不改变节点可信度。
 */
export function timelineEntries(items = []) {
  return (items ?? []).map(item => {
    const nodes = item.nodes ?? []
    const dated = nodes
      .map(node => ({ node, window: nodeWindow(node) }))
      .filter(entry => entry.window.precision !== 'unknown')
      .sort((a, b) => a.window.from.localeCompare(b.window.from))
    if (dated.length) {
      const { node, window } = dated[0]
      // 只到年份的节点落在一月，是「最早的合理位置」，不是事件真实日期；
      // 展示层按 precision 渲染成「2027 年（预计）」，不会冒充某一天。
      return { item, node, key: window.from, kind: 'dated', precision: window.precision, window, label: confidenceLabel(item, node).label }
    }
    const hint = nodes.map(node => expectedHint(node.note)).find(Boolean)
    const labels = [...new Set(nodes.map(node => confidenceLabel(item, node).label))]
    return {
      item, node: nodes[0] || null,
      key: hint ? hint.key : '9999-12-31',
      kind: hint ? 'expected' : 'unknown',
      precision: 'unknown',
      window: null,
      label: labels.join('/') || '日期未知',
      expected: hint ? hint.text : '',
    }
  })
}

/** 备注里出现「预计 + 时间」的说法时，给出排序用的粗略落点（只影响排序，不作为日期展示）。 */
export function expectedHint(note) {
  const text = String(note ?? '')
  if (!text) return null
  const year = Number((text.match(/(20\d{2})\s*年/) || [])[1]) || null
  const semesters = [[/上半年|春季|3\s*月|4\s*月|5\s*月|6\s*月/, 3], [/下半年|秋季|9\s*月|10\s*月|11\s*月|12\s*月/, 9]]
  const semester = semesters.find(([re]) => re.test(text))
  // 「待公布」只说明还没定，不构成时间线索；只有它是唯一线索且没时间时才不产出落点
  if (!semester && !year) return null
  const base = year || new Date().getFullYear()
  const month = semester ? semester[1] : 6
  const key = `${base}-${String(month).padStart(2, '0')}-01`
  return { key, text }
}

/** 与月历同一口径：当月视图包含上下周溢出的 42 天。 */
export function monthWindow(month = new Date()) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() + 6) % 7))
  const days = Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index))
  return {
    start: isoDate(days[0]),
    end: isoDate(days[41]),
    days: days.map(date => ({ date, key: isoDate(date), inMonth: date.getMonth() === month.getMonth() })),
  }
}

export function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function todayIso(now = new Date()) {
  return isoDate(now)
}

export function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY)
}

/**
 * 月历格里的标签只代表「一个事项在这个日期上有个交代」。
 * 报名期 11/16–11/23、比赛 11/23–11/26 这种首尾相接的节点，
 * 23 日既是报名截止又是比赛开始，但格子里没必要出现两行同样的标题：
 * 合并成一个标记，优先保留「截止」语义（那才是要人动手的那天）。
 */
export function monthChips(rows = []) {
  const byItem = new Map()
  for (const row of rows) {
    const key = row.item.id
    const current = byItem.get(key)
    if (!current) { byItem.set(key, row); continue }
    // end 比 start 更值得强调；同边缘时保留类型更「重」的那个（截止 > 比赛/考试 > 报名）
    const weight = row => (row.edge === 'end' ? 20 : 0) + (({ registration_deadline: 4, competition: 3, exam: 3, submission: 2 })[row.node?.type] || 1)
    if (weight(row) > weight(current)) byItem.set(key, row)
  }
  return [...byItem.values()].sort((a, b) => (b.edge === 'end' ? 1 : 0) - (a.edge === 'end' ? 1 : 0))
}

/**
 * 把一个事项在给定窗口内的节点拆成两类标记：
 *   bar：某一具体日期上的一个标记（月历格里的标签条、+N 天倒数、首页时间轴）
 *   span：同一节点跨越的连续天（只给非月历视图画「进行中」的细带）
 *
 * 跨天节点（报名期、考试期）只在两天立标记：起点 start 与终点 end。
 * 以前是把整段日子逐天打点，结果报名期一开，整个月每天都是「关键日子」，
 * 月历格被同一个标题铺满，反而看不出哪天才是真正要动的。宁可少两点，也不制造虚假的紧迫感。
 */
export function itemMarks(item, { start, end, today } = {}) {
  const bars = []
  const spans = []
  for (const node of item.nodes ?? []) {
    const { precision, from, to } = nodeWindow(node)
    if (precision === 'unknown' || !from || !to) continue
    // 只到年份的窗口会铺满十二个月，把真实日期全糊掉：它留在时间轴、列表和 ICS 里，不进月历格。
    if (precision === 'year') continue
    if (start && to < start) continue
    if (end && from > end) continue
    const inWindow = value => (!start || value >= start) && (!end || value <= end)
    const days = Math.min(daysBetween(from, to) + 1, 366)
    if (days <= 1) {
      if (!inWindow(from)) continue
      bars.push({ node, date: from, precision, edge: from === to ? null : 'start', offset: today ? daysBetween(today, from) : null })
      continue
    }
    spans.push({ node, from, to, precision, clippedFrom: start && from < start ? start : from, clippedTo: end && to > end ? end : to })
    // 首日：起点（距今天的倒数也按起点算）
    if (inWindow(from)) bars.push({ node, date: from, precision, edge: 'start', offset: today ? daysBetween(today, from) : null })
    // 末日：截止日就是这个窗口真正要人动的那一天
    if (to !== from && inWindow(to)) bars.push({ node, date: to, precision, edge: 'end', offset: today ? daysBetween(today, to) : null })
  }
  return { bars, spans }
}

/**
 * 时间覆盖面：多少事项已经有时间锚点（精确日期、区间、只到月/年都算）。
 * 一份日历的价值与这个比例成正比，所以把它显示出来，
 * 而不是让用户自己在几十行里数「日期未知」。演示数据不计入分母。
 */
export function dateCoverage(items = []) {
  const rows = (items ?? []).filter(item => !item.demo)
  const dated = rows.filter(item => (item.nodes ?? []).some(node => nodePrecision(node) !== 'unknown'))
  const total = rows.length
  return { total, dated: dated.length, undated: total - dated.length, percent: total ? Math.round((dated.length / total) * 100) : 0 }
}

/** 下次该注意的那一天：今天的逾期不算，取 >= today 的最近一个标记。 */
export function nextMark(entry, today) {
  const { bars } = itemMarks(entry.item, { today })
  const future = bars.filter(bar => bar.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  return future[0] || null
}

export function groupByMonth(entries = []) {
  const groups = new Map()
  for (const entry of entries) {
    const key = entry.key.slice(0, 7)
    const rows = groups.get(key) || []
    rows.push(entry)
    groups.set(key, rows)
  }
  return [...groups.entries()].map(([month, rows]) => ({ month, rows }))
}
