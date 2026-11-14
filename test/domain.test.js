import test from 'node:test'
import assert from 'node:assert/strict'
import { validateItem, validateDataset } from '../src/domain/model.js'
import { buildMonthIndex, filterItems, scoreFit } from '../src/domain/filter.js'
import { confidenceLabel } from '../src/domain/model.js'
import { toIcs } from '../src/domain/ics.js'

const base = {
  id: 'entry-1', title: '示例赛事', category: 'competition',
  sourceUrl: 'https://example.org/rules', verifiedAt: '2026-11-01',
  nodes: [{ id: 'node-1', type: 'registration', start: '2027-03-01', end: '2027-03-08',
    confidence: 'official_confirmed', note: '' }],
}

test('memo category accepts a single dated note without event metadata', () => {
  const memo = { id: 'memo-1', title: '提交材料', category: 'memo', memoLevel: 4, description: '带学生证', nodes: [{ id: 'memo-node-1', type: 'other', start: '2026-11-12', end: null, accuracy: 'exact', confidence: 'unknown' }] }
  assert.equal(validateItem(memo).ok, true)
  assert.equal(validateItem({ ...memo, title: ' ' }).ok, false)
  assert.equal(validateItem({ ...memo, memoLevel: 5 }).ok, false)
})

test('officially confirmed dates require source URL and checked date', () => {
  for (const patch of [{ sourceUrl: '' }, { verifiedAt: '' }, { sourceUrl: 'javascript:alert(1)' }]) {
    const item = structuredClone(base)
    Object.assign(item, patch)
    assert.equal(validateItem(item).ok, false)
  }
  assert.equal(validateItem(base).ok, true)
  const undated = structuredClone(base)
  undated.nodes[0].start = null
  undated.nodes[0].end = null
  assert.equal(validateItem(undated).ok, false)
})

test('predicted dates require a rationale and demo data is never verified', () => {
  const predicted = structuredClone(base)
  Object.assign(predicted.nodes[0], { confidence: 'predicted', sourceUrl: '', verifiedAt: '', note: '' })
  assert.equal(validateItem(predicted).ok, false)
  predicted.nodes[0].note = '根据往年公告时间推测'
  assert.equal(validateItem(predicted).ok, true)

  const demo = structuredClone(base)
  demo.demo = true
  assert.equal(validateItem(demo).ok, false)
  demo.nodes[0].confidence = 'unknown'
  assert.equal(validateItem(demo).ok, true)
})

test('date precision is stored using the supported precision enum', () => {
  const item = structuredClone(base)
  item.nodes[0].accuracy = 'month'
  assert.equal(validateItem(item).ok, true)
  item.nodes[0].accuracy = 'made-up'
  assert.equal(validateItem(item).ok, false)
})

test('invalid dates, reversed ranges, and unknown enums are rejected', () => {
  const invalid = structuredClone(base)
  invalid.nodes[0].start = '2027-02-30'
  assert.equal(validateItem(invalid).ok, false)
  invalid.nodes[0].start = '2027-03-09'
  assert.equal(validateItem(invalid).ok, false)
  invalid.nodes[0].start = '2027-03-01'
  invalid.category = 'made-up'
  assert.equal(validateItem(invalid).ok, false)
})

test('unknown dates remain null and datasets report indexed validation errors', () => {
  const unknown = structuredClone(base)
  unknown.nodes[0] = { id: 'node-1', type: 'exam', start: null, end: null, confidence: 'unknown', note: '' }
  assert.equal(validateItem(unknown).ok, true)
  const result = validateDataset({ version: 1, profile: {}, items: [base, { title: '' }], favorites: [], reminders: [] })
  assert.equal(result.ok, false)
  assert.match(result.errors.join(' '), /items\[1\]/)
})

test('dataset rejects duplicate item and node IDs with item indexes', () => {
  const one = structuredClone(base)
  const two = structuredClone(base)
  two.title = '另一个事项'
  two.nodes[0].id = 'node-2'
  const duplicateItems = validateDataset({ version: 1, profile: {}, items: [one, two] })
  assert.equal(duplicateItems.ok, false)
  assert.match(duplicateItems.errors.join(' '), /items\[1\].*id/)
  const duplicateNodes = structuredClone(base)
  duplicateNodes.nodes.push({ ...duplicateNodes.nodes[0], type: 'exam' })
  assert.equal(validateItem(duplicateNodes).ok, false)
})

test('dataset rejects invalid profile fields instead of persisting arbitrary values', () => {
  const result = validateDataset({ version: 1, profile: { major: ['not', 'text'], province: 12, interests: 'all' }, items: [], favorites: [], reminders: [] })
  assert.equal(result.ok, false)
})

test('dataset rejects JSON payload above the configured limit', () => {
  assert.equal(validateDataset({ version: 1, profile: {}, items: [], favorites: [], reminders: [] }, 20).ok, false)
})

test('filters compose and suitability reports profile match reasons', () => {
  const profile = { major: '计算机科学', province: '浙江', interests: ['创新创业'], year: '大三', types: ['competition'] }
  const items = [
    { id: 'fit', title: '计算机创新挑战赛', category: 'competition', majors: ['计算机科学'], regions: ['浙江'], interests: ['创新创业'], years: ['大三'], registrationStatus: 'open', nodes: [{ start: '2027-03-01', end: '2027-03-05' }] },
    { id: 'category', title: '其他计算机赛事', category: 'competition', majors: ['计算机科学'], regions: ['北京'], interests: [], years: [], registrationStatus: 'open', nodes: [{ start: '2027-03-10', end: '2027-03-10' }] },
    { id: 'none', title: '会计证书', category: 'certificate', majors: ['会计'], regions: ['浙江'], interests: [], years: [], registrationStatus: 'closed', nodes: [{ start: null, end: null }] },
  ]
  const filtered = filterItems(items, { query: '挑战', category: 'competition', major: '计算机科学', province: '浙江', status: 'open', from: '2027-03-02', to: '2027-03-04', onlySuitable: true }, profile)
  assert.deepEqual(filtered.map(item => item.id), ['fit'])
  const fit = scoreFit(items[0], profile)
  assert.ok(fit.score > 0)
  assert.ok(fit.reasons.length > 0)
  assert.ok(fit.reasons.includes('年级适配'))
})

test('month date index only marks the first and last day of a multi-day window', () => {
  const items = [
    { id: 'one', title: 'One day', nodes: [{ id: 'a', start: '2026-11-20', end: null }] },
    { id: 'range', title: 'Range', nodes: [{ id: 'b', start: '2026-11-19', end: '2026-11-21' }] },
    { id: 'unknown', title: 'Unknown', nodes: [{ id: 'c', start: null, end: null }] },
    { id: 'duplicate', title: 'Two nodes', nodes: [{ id: 'd', start: '2026-11-20', end: null }, { id: 'e', start: '2026-11-20', end: null }] },
  ]
  const index = buildMonthIndex(items, new Date(2026, 10, 1))
  assert.equal(index.get('2026-11-18')?.length || 0, 0)
  // 起始日是一个标签（带 start 边缘），中间的日子不再逐天成片染色
  assert.deepEqual(index.get('2026-11-19').map(({ item, edge }) => [item.id, edge]), [['range', 'start']])
  assert.equal(index.get('2026-11-20').length, 3, '一天 + 同一天两个节点都在 20 日')
  assert.deepEqual(index.get('2026-11-21').map(({ item, edge }) => [item.id, edge]), [['range', 'end']])
  assert.equal(index.get('2026-11-22')?.length || 0, 0)
  assert.equal([...index.values()].flat().some(({ item }) => item.id === 'unknown'), false)
})

test('month date index collapses a whole-month window to its first and last day', () => {
  const items = [{ id: 'month', title: 'March exam', nodes: [{ id: 'n', start: '2027-03-01', end: null, accuracy: 'month' }] }]
  const index = buildMonthIndex(items, new Date(2027, 2, 1))
  assert.deepEqual([...index.keys()], ['2027-03-01', '2027-03-31'])
})

test('a date shared by two nodes of one item collapses into a single chip, preferring the deadline', async () => {
  const { monthChips } = await import('../src/domain/timeline.js')
  const item = { id: 'mcm', title: '数学建模国赛' }
  const rows = [
    { item, node: { id: 'reg', type: 'registration', start: '2026-11-16', end: '2026-11-23' }, edge: 'end' },
    { item, node: { id: 'run', type: 'competition', start: '2026-11-23', end: '2026-11-26' }, edge: 'start' },
  ]
  const chips = monthChips(rows)
  assert.equal(chips.length, 1, '同一事项同一天只出一行，不能叠两个相同标题')
  assert.equal(chips[0].node.id, 'reg', '首尾相接时保留「截止」那个节点')
  assert.equal(monthChips([...rows, { item: { id: 'other', title: '另一件事' }, node: { id: 'x', type: 'exam' }, edge: null }]).length, 2, '不同事项各自保留一行')
})

test('month date index includes dates displayed in adjacent calendar weeks', () => {
  const items = [{ id: 'adjacent', title: 'Adjacent', nodes: [{ id: 'node', start: '2026-10-31', end: '2026-11-01' }] }]
  const index = buildMonthIndex(items, new Date(2026, 10, 1))
  assert.equal(index.get('2026-10-31')?.length, 1)
  assert.equal(index.get('2026-11-01')?.length, 1)
})

test('unknown dates never match date ranges and only-suitable excludes zero fit', () => {
  const items = [{ id: 'unknown', title: '未知日程', category: 'competition', nodes: [{ start: null, end: null }] }]
  assert.deepEqual(filterItems(items, { from: '2027-01-01', to: '2027-12-31' }, {}), [])
  assert.deepEqual(filterItems(items, { onlySuitable: true }, { major: '物理' }), [])
  assert.deepEqual(filterItems(items, { onlySuitable: false }, {}), items)
})

test('confidence labels distinguish verified, predicted, pending, unknown, and demo', () => {
  const confirmed = { sourceUrl: 'https://example.org', verifiedAt: '2026-11-01' }
  assert.equal(confidenceLabel(confirmed, { confidence: 'official_confirmed', start: '2027-03-01' }).label, '官方已确认')
  assert.equal(confidenceLabel(confirmed, { confidence: 'official_confirmed', start: null, end: null }).label, '待确认')
  assert.equal(confidenceLabel({}, { confidence: 'official_confirmed' }).label, '待确认')
  assert.equal(confidenceLabel({}, { confidence: 'predicted', note: '按往年安排推测' }).label, '预测')
  assert.equal(confidenceLabel({}, { confidence: 'pending_confirmation' }).label, '待确认')
  assert.equal(confidenceLabel({}, { confidence: 'unknown' }).label, '日期未知')
  // 演示记录标签不冒充可信度：标「演示」，真假由独立的提示横幅说
  assert.equal(confidenceLabel({ demo: true }, { confidence: 'official_confirmed' }).label, '演示')
})

test('ICS escapes text, uses CRLF and exclusive multi-day end, and omits unknown dates', () => {
  const ics = toIcs([
    { id: 'one', title: '赛事, A;\\B', sourceUrl: 'https://example.org', nodes: [{ id: 'n1', type: 'exam', start: '2027-03-01', end: '2027-03-02', confidence: 'pending_confirmation' }] },
    { id: 'none', title: '无日期', nodes: [{ id: 'n2', type: 'other', start: null, end: null, confidence: 'unknown' }] },
  ], { now: new Date('2026-11-10T00:00:00Z') })
  assert.match(ics, /SUMMARY:【待确认】赛事\\, A\\;\\\\B/)
  assert.match(ics, /DTSTART;VALUE=DATE:20270301/)
  assert.match(ics, /DTEND;VALUE=DATE:20270303/)
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 1)
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'))
  assert.ok(!ics.replaceAll('\r\n', '').includes('\n'))
})

test('image URLs and label colors are constrained before they reach the DOM', () => {
  const item = structuredClone(base)
  item.imageUrl = 'https://example.org/poster.jpg'
  assert.equal(validateItem(item).ok, true)
  item.imageUrl = 'javascript:alert(1)'
  assert.equal(validateItem(item).ok, false)
  item.imageUrl = ''
  item.nodes[0].color = 'rose'
  assert.equal(validateItem(item).ok, true)
  item.nodes[0].color = 'red; background:url(x)'
  assert.equal(validateItem(item).ok, false)
})

test('timeline keeps undated items visible without inventing dates', async () => {
  const { timelineEntries, expectedHint, nextMark } = await import('../src/domain/timeline.js')
  const entries = timelineEntries([
    { id: 'dated', title: '有日期', nodes: [{ id: 'n1', type: 'exam', start: '2026-12-13', end: null, confidence: 'official_confirmed' }] },
    { id: 'hint', title: '只写了季节', nodes: [{ id: 'n2', type: 'competition', start: null, end: null, confidence: 'pending_confirmation', note: '预计在 2027 年春季举行，待官方公布' }] },
    { id: 'none', title: '完全没时间线', nodes: [{ id: 'n3', type: 'other', start: null, end: null, confidence: 'unknown' }] },
  ])
  assert.deepEqual(entries.map(entry => [entry.item.id, entry.kind, entry.key]), [
    ['dated', 'dated', '2026-12-13'],
    ['hint', 'expected', '2027-03-01'],
    ['none', 'unknown', '9999-12-31'],
  ])
  assert.equal(entries[0].kind === 'dated' && entries[0].node.start, '2026-12-13')
  assert.equal(expectedHint('日期待公布'), null, '没有时间线索的备注不产生落点')
  const mark = nextMark(entries[0], '2026-11-11')
  assert.equal(mark.date, '2026-12-13')
  assert.equal(mark.offset, 32)
  assert.equal(nextMark(entries[0], '2026-12-20'), null, '已经过去的节点不再作为下一个待办')
})

test('item marks clip ranges into the visible window and flag ongoing nodes', async () => {
  const { itemMarks, monthWindow } = await import('../src/domain/timeline.js')
  const window = monthWindow(new Date(2026, 10, 1))
  assert.equal(window.start, '2026-10-26')
  assert.equal(window.end, '2026-12-06')
  assert.equal(window.days.length, 42)
  const item = { id: 'range', title: '报名期', nodes: [{ id: 'n', type: 'registration', start: '2026-10-01', end: '2026-11-20', confidence: 'pending_confirmation' }] }
  const marks = itemMarks(item, { start: window.start, end: window.end, today: '2026-11-11' })
  assert.equal(marks.spans.length, 1)
  assert.deepEqual([marks.spans[0].clippedFrom, marks.spans[0].clippedTo], ['2026-10-26', '2026-11-20'])
  // 起点在可见窗口之前，就只剩终点这一个标记：真正的截止日
  assert.deepEqual(marks.bars.map(bar => [bar.date, bar.edge]), [['2026-11-20', 'end']], '报名期不能逐天铺满一月')
})

test('ICS keeps demo events visibly marked even when a demo node has a date', () => {  const ics = toIcs([{ id: 'demo', title: '演示赛事', demo: true, nodes: [{ id: 'n', type: 'exam', start: '2027-04-01', end: null, confidence: 'unknown' }] }], { now: new Date('2026-11-10T00:00:00Z') })
  assert.match(ics, /SUMMARY:【演示】演示赛事/)
  assert.match(ics, /DESCRIPTION:演示数据/)
})

test('ICS folds lines at 75 UTF-8 octets without breaking multibyte text', () => {
  const ics = toIcs([{ id: 'long', title: '创新竞赛'.repeat(30), nodes: [{ id: 'n', type: 'competition', start: '2027-05-01', end: null, confidence: 'unknown' }] }], { now: new Date('2026-11-10T00:00:00Z') })
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75, `${Buffer.byteLength(line, 'utf8')} bytes`)
})

test('precision ladder keeps coarse dates usable without inventing days', async () => {
  const { nodePrecision, nodeWindow, monthBounds } = await import('../src/domain/model.js')
  assert.equal(nodePrecision({ start: null, end: null }), 'unknown')
  assert.equal(nodePrecision({ start: '2027-03-01', end: null }), 'exact')
  assert.equal(nodePrecision({ start: '2027-03-01', end: '2027-03-05' }), 'range')
  assert.equal(nodePrecision({ start: '2027-03-01', end: null, accuracy: 'month' }), 'month', '显式声明的粗精度优先于按起止推断')
  assert.equal(nodePrecision({ start: '2027-03-01', end: null, accuracy: 'year' }), 'year')
  assert.deepEqual(monthBounds('2027-02-01'), { from: '2027-02-01', to: '2027-02-28' })
  assert.deepEqual(monthBounds('2028-02-01'), { from: '2028-02-01', to: '2028-02-29' }, '闰年二月要算对')
  assert.deepEqual(nodeWindow({ start: '2027-03-01', end: null, accuracy: 'month' }), { precision: 'month', from: '2027-03-01', to: '2027-03-31' })
  assert.deepEqual(nodeWindow({ start: '2027-06-01', end: null, accuracy: 'year' }), { precision: 'year', from: '2027-01-01', to: '2027-12-31' })
  assert.deepEqual(nodeWindow({ start: '2027-03-01', end: '2027-03-08' }), { precision: 'range', from: '2027-03-01', to: '2027-03-08' })
})

test('month-precision marks cover the whole month and year-precision stays out of the grid', async () => {
  const { itemMarks, monthWindow, dateCoverage, timelineEntries } = await import('../src/domain/timeline.js')
  const window = monthWindow(new Date(2027, 2, 1))
  const monthItem = { id: 'm', title: '预计三月', nodes: [{ id: 'n', type: 'competition', start: '2027-03-01', end: null, accuracy: 'month', confidence: 'predicted', note: '往年三月' }] }
  const monthMarks = itemMarks(monthItem, { start: window.start, end: window.end, today: '2026-11-11' })
  assert.equal(monthMarks.spans.length, 1, '月份精度要占住整月，而不是一个点')
  assert.deepEqual([monthMarks.spans[0].from, monthMarks.spans[0].to], ['2027-03-01', '2027-03-31'])
  assert.equal(monthMarks.spans[0].precision, 'month')

  const yearItem = { id: 'y', title: '只到年份', nodes: [{ id: 'n2', type: 'competition', start: '2027-03-01', end: null, accuracy: 'year', confidence: 'predicted', note: '往年安排' }] }
  const yearMarks = itemMarks(yearItem, { start: window.start, end: window.end, today: '2026-11-11' })
  assert.equal(yearMarks.spans.length + yearMarks.bars.length, 0, '年份精度不铺满月历')
  assert.equal(timelineEntries([yearItem])[0].precision, 'year', '但时间轴仍要能看到它')

  const coverage = dateCoverage([
    { id: 'a', demo: true, nodes: [{ id: 'na', type: 'exam', start: null, end: null, confidence: 'unknown' }] },
    { id: 'b', nodes: [{ id: 'nb', type: 'exam', start: '2027-03-01', end: null, accuracy: 'month', confidence: 'predicted', note: 'x' }] },
    { id: 'c', nodes: [{ id: 'nc', type: 'exam', start: null, end: null, confidence: 'unknown' }] },
  ])
  assert.deepEqual(coverage, { total: 2, dated: 1, undated: 1, percent: 50 }, '演示数据不计入覆盖率')
})

test('ICS keeps coarse-precision dates but labels them as pending granularity', async () => {
  const { toIcs } = await import('../src/domain/ics.js')
  const ics = toIcs([
    { id: 'm', title: '三月赛事', nodes: [{ id: 'n', type: 'competition', start: '2027-03-01', end: null, accuracy: 'month', confidence: 'predicted', note: '往年三月' }] },
  ], { now: new Date('2026-11-10T00:00:00Z') })
  assert.match(ics, /DTSTART;VALUE=DATE:20270301/)
  assert.match(ics, /DTEND;VALUE=DATE:20270401/, '月份窗口结束于次月 1 日（ICS 的 DTEND 是开区间）')
  assert.match(ics, /月份待定/)
})
