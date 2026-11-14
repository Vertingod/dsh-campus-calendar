const MONTHS = Object.freeze({
  cet: [6, 12],
  csp: [3, 5, 9, 12],
  cumcm: [9],
})

function normalizedTitle(value) {
  return String(value || '').toLowerCase().replace(/[\s（）()/_-]/g, '')
}

function annualNote(key, year) {
  const sources = {
    cet: 'https://cet.neea.edu.cn/html1/report/2509/26-1.htm',
    csp: 'https://csp.ccf.org.cn/',
    cumcm: 'https://www.mcm.edu.cn/',
  }
  const basis = {
    cet: '六级通常安排上、下半年两次，教育部教育考试院2025年下半年公告确认笔试在12月；',
    csp: 'CCF认证计划页列出的第29至44次场次分别落在3、5、6、9、12月，按历届月份预测；',
    cumcm: '数学建模竞赛官网显示2026年竞赛于9月10日开始，按年度节奏推测；',
  }
  return `${year}年月份级预测：${basis[key]}不是当届官方日期，具体安排以当届公告为准。依据：${sources[key]}`
}

function ruleFor(item) {
  const title = normalizedTitle(item.title)
  if (title.includes('cet6') || title.includes('英语六级') || title.includes('大学英语六级') || title.includes('cet')) {
    const semester = item.title.includes('英语六级（CET-6）') ? 6 : item.title.includes('全国大学英语六级考试') ? 12 : null
    return [{ key: 'cet', months: semester ? [semester] : MONTHS.cet }]
  }
  if (title.includes('软件能力认证')) return [{ key: 'csp', months: MONTHS.csp }]
  if (title.includes('cumcm') || title.includes('数学建模竞赛') || title.includes('大学生数学建模')) return [{ key: 'cumcm', months: MONTHS.cumcm }]
  return []
}

/** Add annual month-window predictions for explicitly recognized stable cycles.
 * Existing dated nodes are never rewritten; unknown schedules remain untouched.
 */
export function addAnnualPredictions(state, year) {
  if (!Number.isInteger(year) || year < 2000 || year > 2200) throw new TypeError('year must be an integer between 2000 and 2200')
  const items = (state.items || []).map(item => {
    const rules = ruleFor(item)
    if (!rules.length || item.demo) return item
    const nodes = [...(item.nodes || [])]
    const occupiedMonths = new Set(nodes.filter(node => node.start).map(node => node.start.slice(0, 7)))
    let changed = false
    let firstUndated = nodes.findIndex(node => !node.start && !node.end)
    for (const rule of rules) for (const [index, month] of rule.months.entries()) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`
      if (occupiedMonths.has(start.slice(0, 7))) continue
      const id = `annual-${rule.key}-${year}-${String(month).padStart(2, '0')}`
      if (nodes.some(node => node.id === id)) continue
      const predictedNode = { id, type: rule.key === 'cet' || rule.key === 'csp' ? 'exam' : 'competition', start, end: null, accuracy: 'month', confidence: 'predicted', note: annualNote(rule.key, year) }
      if (firstUndated >= 0) {
        const original = nodes[firstUndated]
        const nodeId = original.id
        nodes[firstUndated] = { ...original, ...predictedNode, id: nodeId }
        firstUndated = nodes.findIndex(node => !node.start && !node.end && node.type !== predictedNode.type)
      } else nodes.push(predictedNode)
      occupiedMonths.add(start.slice(0, 7))
      changed = true
    }
    const recurringTypes = new Set(rules.map(rule => rule.key === 'cumcm' ? 'competition' : 'exam'))
    const normalizedNodes = nodes.filter(node => node.start || node.end || !recurringTypes.has(node.type))
    if (normalizedNodes.length !== nodes.length) changed = true
    return changed ? { ...item, nodes: normalizedNodes } : item
  })
  return { ...state, items }
}
