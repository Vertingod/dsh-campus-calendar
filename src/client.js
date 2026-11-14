import { StarButton, maybeRemindStar } from './star-entry.js'
import React from 'react'
import styles from './styles.css'
import { buildMonthIndex, filterItems, scoreFit, tagColor } from './domain/filter.js'
import { confidenceLabel, nodePrecision, nodeWindow } from './domain/model.js'
import { dateCoverage, daysBetween, expectedHint, isoDate, monthChips, monthWindow, nextMark, timelineEntries, todayIso } from './domain/timeline.js'

const h = React.createElement
const API = '/campus-calendar'
const NODE_LABELS = { registration: '报名开始', registration_deadline: '报名截止', competition: '比赛日期', exam: '考试日期', submission: '材料提交', result: '结果公布', other: '其他节点' }
const REGISTRATION_LABELS = { open: '报名中', not_open: '尚未开放', closed: '已截止', unknown: '未知' }
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

const majors = ['计算机科学', '软件工程', '电子信息', '机械工程', '自动化', '经济学', '管理学', '会计学', '法学', '英语', '医学', '设计学']
const provinces = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆']
const directions = ['创新创业', '学术科研', '程序设计', '职业发展', '志愿服务', '艺术设计', '语言能力', '综合素质']

function dateText(value) { return value ? `${Number(value.slice(5, 7))}月${Number(value.slice(8, 10))}日` : '日期未知' }
function monthTitle(date) { return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月` }
function nodeDate(node) { return node.start || node.end || null }
/** 议程在没有时间轴条目时的时间列：取最早一个有锚点的节点，仍按精度渲染，不制造假的一天。 */
function firstWindowText(item) {
  const nodes = (item.nodes || []).filter(node => nodePrecision(node) !== 'unknown')
  if (!nodes.length) return '日期未知'
  const earliest = [...nodes].sort((a, b) => (nodeWindow(a).from || '').localeCompare(nodeWindow(b).from || ''))[0]
  return windowText(earliest)
}
function sameYear(value) { return value.slice(0, 4) === todayIso().slice(0, 4) }
/**
 * 按精度渲染时间窗。日历的价值在于「大概什么时候」，所以粗粒度要照实说：
 * 只知道月份就说「3 月（预计）」，绝不在"3 月"上编出"3 月 1 日"这一天。
 * 「预计」只加给非官方确认的粗粒度——官方确认到月（"3 月考试"）就直说 3 月。
 */
function windowText(node) {
  const precision = nodePrecision(node)
  if (precision === 'unknown') return '日期未知'
  const start = node.start || node.end
  const yearPrefix = sameYear(start) ? '' : `${start.slice(0, 4)} 年 `
  const coarseNote = node.confidence === 'official_confirmed' ? '' : '（预计）'
  if (precision === 'month') return `${yearPrefix}${Number(start.slice(5, 7))} 月${coarseNote}`
  if (precision === 'year') return `${start.slice(0, 4)} 年${coarseNote}`
  if (precision === 'range') return `${yearPrefix}${dateText(start)} – ${dateText(node.end || start)}`
  return `${yearPrefix}${dateText(start)}`
}
function nodeRangeText(node) { return windowText(node) }
function dayDistance(today, date) { return daysBetween(today, date) }
function distanceText(offset) {
  if (offset === null || offset === undefined) return ''
  if (offset === 0) return '今天'
  if (offset === 1) return '明天'
  if (offset === 2) return '后天'
  if (offset < 0) return `已过 ${-offset} 天`
  if (offset <= 30) return `${offset} 天后`
  if (offset <= 120) return `约 ${Math.round(offset / 7)} 周后`
  return `约 ${Math.round(offset / 30)} 个月后`
}
/**
 * 时间轴 / 列表 / 议程共用的时间列文案：
 * 有时间窗就按精度说（11月20日 · 3 天后 / 3 月（预计）），
 * 只有真的没有任何时间线索才写「日期待公布」——不要让粗粒度的日期看起来像不存在。
 */
function whenText(entry, next, { distance = true, expectedStyle = 'row' } = {}) {
  if (entry.kind === 'dated') {
    const text = windowText(entry.node || {})
    return next && distance ? `${text} · ${distanceText(next.offset)}` : text
  }
  if (entry.kind === 'expected') {
    const title = monthTitle(new Date(`${entry.key}T00:00:00`))
    return expectedStyle === 'timeline' ? `${title}前后（预计）` : `预计 ${title}`
  }
  return expectedStyle === 'timeline' ? '日期待公布' : '日期未知'
}
function api(path, options = {}) {
  return fetch(`${API}/${path}`, options).then(async response => {
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `请求失败 (${response.status})`)
    return response.headers.get('content-type')?.includes('text/calendar') ? response.blob() : response.json()
  })
}
function saveBlob(blob, name) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob); link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}
function monthCells(date) {
  return monthWindow(date).days.map(day => day.date)
}
/** 悬浮卡定位：贴着触发元素的下沿，但不超出视口底部。 */
function clampY(element) {
  const rect = typeof element?.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null
  const top = rect ? rect.top + (rect.height || 0) / 2 : 200
  const height = typeof window !== 'undefined' ? window.innerHeight || 760 : 760
  return Math.max(12, Math.min(top, height - 220))
}
function Icon({ name }) {
  const paths = { calendar: 'M7 2v4m10-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z', star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z', plus: 'M12 5v14M5 12h14', back: 'M19 12H5m7 7-7-7 7-7', forward: 'M5 12h14m-7-7 7 7-7 7', close: 'M18 6 6 18M6 6l12 12' }
  return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] || paths.calendar }))
}

/** 宣传图：主办方直链，失败或没有时退回色块占位，绝不留破图。 */
function Thumb({ item, size = 'card' }) {
  const [broken, setBroken] = React.useState(false)
  const color = tagColor(item)
  React.useEffect(() => { setBroken(false) }, [item.id, item.imageUrl])
  if (!item.imageUrl || broken) {
    return h('div', { className: `cc-thumb placeholder ${size}`, 'data-color': color, 'aria-hidden': true }, h('span', null, (item.title || '?').trim().slice(0, 1)))
  }
  return h('img', { className: `cc-thumb ${size}`, src: item.imageUrl, alt: `${item.title} 宣传图`, loading: 'lazy', referrerPolicy: 'no-referrer', onError: () => setBroken(true) })
}

function App({ onAsk }) {
  const [state, setState] = React.useState(null)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [view, setView] = React.useState('calendar')
  const [mode, setMode] = React.useState('month')
  const [month, setMonth] = React.useState(() => new Date())
  const [selectedDate, setSelectedDate] = React.useState('')
  const [selected, setSelected] = React.useState(null)
  const [filters, setFilters] = React.useState({ query: '', category: 'all', major: 'all', province: 'all', status: 'all', from: '', to: '', onlySuitable: false })
  const [showFilters, setShowFilters] = React.useState(false)
  const [showTools, setShowTools] = React.useState(false)
  const [editing, setEditing] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [notice, setNotice] = React.useState('')
  const [asking, setAsking] = React.useState(false)
  const [askError, setAskError] = React.useState('')
  const [suggestions, setSuggestions] = React.useState([])
  const [hover, setHover] = React.useState(null)
  const [memoDraft, setMemoDraft] = React.useState(null)
  const [eventDraft, setEventDraft] = React.useState(null)
  const importRef = React.useRef(null)
  const requestRef = React.useRef({ generation: 0, controller: null })
  const lastFocusRefreshRef = React.useRef(0)
  const editorRef = React.useRef(null)

  const load = React.useCallback(async ({ background = false } = {}) => {
    const generation = ++requestRef.current.generation
    requestRef.current.controller?.abort()
    const controller = new AbortController()
    requestRef.current.controller = controller
    if (!background) setLoading(true)
    setError('')
    try {
      const next = await api('state', { signal: controller.signal })
      if (generation === requestRef.current.generation && !controller.signal.aborted) setState(next)
    } catch (e) {
      if (!controller.signal.aborted && generation === requestRef.current.generation) setError(e.message)
    } finally {
      if (generation === requestRef.current.generation && !controller.signal.aborted) setLoading(false)
    }
  }, [])
  React.useEffect(() => {
    load()
    return () => { requestRef.current.generation++; requestRef.current.controller?.abort() }
  }, [load])
  React.useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'hidden' || editing || Date.now() - lastFocusRefreshRef.current < 30_000) return
      lastFocusRefreshRef.current = Date.now()
      load({ background: true })
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [editing, load])
  React.useEffect(() => {
    if (!selected) return
    const onKey = event => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])
  const profile = state?.profile || { major: '', year: '', province: '', interests: [], types: [] }
  const items = state?.items || []
  const filtersKey = JSON.stringify(filters)
  const filtered = React.useMemo(() => filterItems(items, filters, profile), [items, profile, filtersKey])
  const favoritesKey = (state?.favorites || []).join('\u0000')
  const visible = React.useMemo(() => view === 'favorites' ? filtered.filter(item => state?.favorites?.includes(item.id)) : filtered, [filtered, view, favoritesKey])
  const monthIndex = React.useMemo(() => buildMonthIndex(visible, month), [visible, month.getFullYear(), month.getMonth()])
  const today = todayIso()
  const eventsForDate = date => {
    const indexed = monthIndex.get(date) || []
    const itemsById = new Map(indexed.map(row => [row.item.id, row.item]))
    for (const item of visible) {
      if (item.category === 'memo' && item.nodes?.some(node => node.start === date)) itemsById.set(item.id, item)
    }
    return [...itemsById.values()]
  }
  const saveState = async next => {
    setBusy(true); setError('')
    try { setState(await api('state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next) })); setNotice('已保存') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const patchProfile = patch => saveState({ ...state, profile: { ...profile, ...patch } })
  const saveItem = async item => {
    setBusy(true); setError('')
    try { const next = await api(`items${item.id ? `/${encodeURIComponent(item.id)}` : ''}`, { method: item.id ? 'PUT' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ item }) }); setState(next); setEditing(null); setNotice('事项已保存'); maybeRemindStar() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const openCalendarEvent = date => {
    setSelectedDate(date)
    setError('')
    setEventDraft({ date, title: '', category: 'competition', type: 'competition', level: 2, description: '' })
  }
  const saveCalendarEvent = async event => {
    event.preventDefault()
    if (!eventDraft?.title?.trim()) return setError('请填写赛事或考试名称')
    const type = eventDraft.type
    const item = {
      title: eventDraft.title.trim(), category: type === 'exam' ? 'certificate' : 'competition',
      organizer: '', description: eventDraft.description.trim(), majors: [], interests: [], years: [], regions: [],
      registrationStatus: 'unknown', nodes: [{ id: `node-${crypto.randomUUID()}`, type, start: eventDraft.date, end: null, accuracy: 'exact', confidence: 'pending_confirmation', note: '由用户在日历中手动添加；日期尚无官方来源核验。' }],
    }
    await saveItem(item)
    setEventDraft(null)
  }
  const saveMemo = async () => {
    if (!memoDraft?.title?.trim()) { setError('请填写备忘标题'); return }
    setError('')
    setBusy(true)
    try {
      const body = { date: memoDraft.date, title: memoDraft.title, description: memoDraft.description, level: Number(memoDraft.level) }
      const next = await api(`memos${memoDraft.id ? `/${encodeURIComponent(memoDraft.id)}` : ''}`, { method: memoDraft.id ? 'PUT' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      setState(next); setMemoDraft(null); setNotice('备忘已保存')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const deleteMemo = async memo => {
    if (!window.confirm(`删除备忘“${memo.title}”？`)) return
    setBusy(true); setError('')
    try { setState(await api(`memos/${encodeURIComponent(memo.id)}`, { method: 'DELETE' })); setMemoDraft(null); setNotice('备忘已删除') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const toggleFavorite = async item => {
    const favorites = state.favorites.includes(item.id) ? state.favorites.filter(id => id !== item.id) : [...state.favorites, item.id]
    await saveState({ ...state, favorites })
  }
  const toggleReminder = async item => {
    if (!item.nodes?.some(node => nodeDate(node))) return setNotice('该事项没有已知日期，暂不能设置提醒')
    const reminders = state.reminders.includes(item.id) ? state.reminders.filter(id => id !== item.id) : [...state.reminders, item.id]
    await saveState({ ...state, reminders })
    setNotice('站内提醒偏好已保存；不会发送系统通知')
  }
  const exportFile = async type => { try { const data = await api(`export.${type}`); const blob = type === 'json' ? new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }) : data; saveBlob(blob, `campus-events-calendar.${type}`) } catch (e) { setError(e.message) } }
  const importFile = async event => {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return setError('导入文件不能超过 2 MB')
    if (!window.confirm('导入将替换当前事项和档案。建议先导出现有 JSON 备份。继续吗？')) return
    try { const parsed = JSON.parse(await file.text()); setState(await api('import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed) })); setNotice('JSON 导入完成') } catch (e) { setError(e.message) }
  }
  const clearFilters = () => setFilters({ query: '', category: 'all', major: 'all', province: 'all', status: 'all', from: '', to: '', onlySuitable: false })
  // 建议只是「可以去问问的候选」，没有日期也没有可信度；点一下走同一套草稿 + 对话流程
  React.useEffect(() => {
    if (!state) return
    let alive = true
    api('suggestions').then(next => { if (alive && Array.isArray(next?.items)) setSuggestions(next.items) }).catch(() => { if (alive) setSuggestions([]) })
    return () => { alive = false }
  }, [state])
  const hasRealItems = React.useMemo(() => items.some(item => !item.demo), [items])
  // 一份日历的价值与「有时间锚点的事项」成正比：把缺口显性化，
  // 而不是让用户在几十行里自己数「日期未知」。演示数据不计入分母。
  const coverage = React.useMemo(() => dateCoverage(items), [items])
  const coverageHint = view === 'calendar' && showTools && coverage.undated > 0
    ? h('div', { className: 'cc-coverage-hint', role: 'status' },
      h('div', null,
        h('strong', null, `还有 ${coverage.undated} 项没有时间锚点`),
        h('p', null, `共 ${coverage.total} 项，已锚定 ${coverage.percent}%。只到月份或年份也算数：让 Agent 按往年节奏补一轮，再按主办方公告校对。`)),
      h('button', { type: 'button', className: 'cc-button', disabled: asking, onClick: () => askAgent('plan') }, asking ? '正在准备…' : '让 Agent 补时间'))
    : null
  // 问 Agent：向宿主取一段草稿，交给 DSH 开新对话并填进输入框（不直接发送，用户补完再发）
  const askAgent = async (kind = 'add', text = '') => {
    if (asking) return
    if (!onAsk) { setAskError('当前 DSH 版本没有提供开新对话的接口，无法一键发起。'); return }
    setAsking(true); setAskError('')
    try {
      const draft = await api(`draft?kind=${encodeURIComponent(kind)}&text=${encodeURIComponent(text)}`)
      await onAsk(draft.prompt)
      setNotice('已在新对话里填好草稿，补充内容后发送即可')
    } catch (e) {
      setAskError(`没能开新对话：${e.message}`)
    } finally { setAsking(false) }
  }

  const navigation = h('nav', { className: 'cc-side-nav', 'aria-label': '主导航' }, [
    ['calendar', '日历', 'calendar'], ['favorites', '已收藏', 'star'], ['manage', '数据维护', 'edit'],
  ].map(([id, label, icon]) => h('button', { key: id, className: view === id ? 'active' : '', onClick: () => setView(id), 'aria-current': view === id ? 'page' : undefined }, h(Icon, { name: icon }), h('span', null, label))))

  const headerTitle = view === 'favorites' ? '已收藏事项' : view === 'manage' ? '数据维护' : '赛事与证书日历'
  const profileSummary = profile.major ? `${profile.major}${profile.year ? ` · ${profile.year}` : ''}${profile.province ? ` · ${profile.province}` : ''}` : '尚未设置个人档案'
  const categorySelect = (label, value, options, key) => h('label', { className: 'cc-field compact', key }, h('span', null, label), h('select', { value, onChange: event => setFilters(current => ({ ...current, [key]: event.target.value })) }, options.map(([v, name]) => h('option', { key: v, value: v }, name))))
  const filterPanel = h('div', { className: `cc-filters ${showFilters ? 'expanded' : ''}` },
    categorySelect('类别', filters.category, [['all', '全部类别'], ['competition', '赛事'], ['certificate', '证书']], 'category'),
    categorySelect('适配专业', filters.major, [['all', '全部专业'], ...majors.map(value => [value, value]), ...(profile.major && !majors.includes(profile.major) ? [[profile.major, profile.major]] : [])], 'major'),
    categorySelect('地区', filters.province, [['all', '全部地区'], ...provinces.map(value => [value, value])], 'province'),
    categorySelect('报名状态', filters.status, [['all', '全部状态'], ['open', '报名中'], ['not_open', '未开始'], ['closed', '已截止'], ['unknown', '未知']], 'status'),
    h('label', { className: 'cc-field compact', key: 'from' }, h('span', null, '开始日期'), h('input', { type: 'date', value: filters.from, onChange: event => setFilters(current => ({ ...current, from: event.target.value })) })),
    h('label', { className: 'cc-field compact', key: 'to' }, h('span', null, '结束日期'), h('input', { type: 'date', value: filters.to, onChange: event => setFilters(current => ({ ...current, to: event.target.value })) })),
  )
  const toolbar = h('div', { className: 'cc-toolbar' },
    h('label', { className: 'cc-search' }, h('span', { className: 'sr-only' }, '搜索赛事或证书'), h('span', { 'aria-hidden': true }, '⌕'), h('input', { value: filters.query, placeholder: '搜索赛事、证书、主办方…', onChange: event => setFilters(current => ({ ...current, query: event.target.value })) }), filters.query && h('button', { type: 'button', 'aria-label': '清除搜索', onClick: () => setFilters(current => ({ ...current, query: '' })) }, h(Icon, { name: 'close' }))),
    h('label', { className: 'cc-toggle' }, h('input', { type: 'checkbox', checked: filters.onlySuitable, onChange: event => setFilters(current => ({ ...current, onlySuitable: event.target.checked })) }), h('span', null, '只看适合我')),
    h('button', { className: 'cc-button', onClick: () => setShowFilters(!showFilters), 'aria-expanded': showFilters }, '筛选'),
    h('div', { className: 'cc-segment', role: 'group', 'aria-label': '视图模式' }, h('button', { className: mode === 'upcoming' ? 'selected' : '', onClick: () => setMode('upcoming') }, '时间轴'), h('button', { className: mode === 'month' ? 'selected' : '', onClick: () => setMode('month') }, '月历'), h('button', { className: mode === 'list' ? 'selected' : '', onClick: () => setMode('list') }, '列表')),
  )

  // 月历格里的标签条：颜色按事项分（不是可信度），文字标出这是「开始」还是「截止」，
  // 悬浮出摘要卡。跨天窗口只在首尾两天各出一个标签，不再逐天铺满格子。
  const EDGE_LABELS = { registration: '起', registration_deadline: '止', competition: '起', exam: '起', submission: '起', result: '出' }
  const eventChip = (item, node, edge = null) => {
    const confidence = confidenceLabel(item, node)
    const uncertain = node.confidence === 'predicted' || node.confidence === 'pending_confirmation'
    const edgeText = edge === 'end' ? '截止' : edge === 'start' ? '开始' : ''
    return h('button', {
      key: `${item.id}-${node.id}-${edge || 'day'}`,
      className: `cc-chip ${uncertain ? 'uncertain' : ''} ${item.demo ? 'demo' : ''}`,
      'data-color': node.color || tagColor(item),
      'data-node': node.type,
      'data-edge': edge || undefined,
      onClick: () => setSelected(item),
      onFocus: event => setHover({ item, node, x: 260, y: clampY(event.currentTarget) }),
      onBlur: () => setHover(null),
      title: `${item.title} · ${NODE_LABELS[node.type] || node.type}${edgeText ? `（${edgeText}）` : ''} · ${confidence.label}`,
      'aria-label': `${item.title}，${NODE_LABELS[node.type] || node.type}，${nodeRangeText(node)}${edgeText ? `，${edgeText}` : ''}，${confidence.label}`,
    }, edge && h('span', { className: 'cc-chip-edge', 'aria-hidden': true }, EDGE_LABELS[node.type] && edge === 'start' ? EDGE_LABELS[node.type] : edge === 'end' ? '止' : ''), h('span', { className: 'cc-chip-text' }, item.title))
  }
  // 一格被多个事项覆盖时只染一次色：取最紧急的节点等级；截止日一律按最高等级算。
  const levelOf = (node, edge) => edge === 'end' ? 4 : ({ registration_deadline: 4, competition: 3, exam: 3, submission: 2 })[node?.type] || (node?.type === 'registration' ? 2 : 1)
  const dayLevel = indexedNodes => indexedNodes.reduce((level, row) => Math.max(level, levelOf(row.node, row.edge)), 0)
  const cells = React.useMemo(() => monthCells(month), [month.getFullYear(), month.getMonth()])
  const calendar = React.useMemo(() => h('section', { className: 'cc-calendar', 'aria-label': monthTitle(month) },
    h('div', { className: 'cc-calendar-legend', 'aria-label': '日历等级' }, [['1', '一般'], ['2', '准备'], ['3', '重要'], ['4', '截止']].map(([level, label]) => h('span', { key: level, 'data-level': level }, label))),
    h('div', { className: 'cc-weekdays' }, WEEKDAYS.map((name, index) => h('span', { key: name, className: index > 4 ? 'weekend' : '' }, name))),
    h('div', { className: 'cc-grid' }, cells.map(date => {
      const iso = isoDate(date)
      const indexedNodes = monthIndex.get(iso) || []
      // 同一天可能既是某事的报名截止又是另一事的比赛开始；同一个事项只出一行，优先显示截止。
      const chips = monthChips(indexedNodes)
      const isToday = iso === today
      const level = dayLevel(indexedNodes)
      return h('div', { key: iso, className: `cc-day ${date.getMonth() !== month.getMonth() ? 'outside' : ''} ${selectedDate === iso ? 'chosen' : ''} ${isToday ? 'today' : ''}`, 'data-level': level || undefined },
        h('button', { className: 'cc-day-number', onClick: () => { setSelectedDate(iso); setMemoDraft(null); setEventDraft(null) }, 'aria-pressed': selectedDate === iso, 'aria-label': `${iso}，${chips.length} 项` }, date.getDate()),
        h('button', { type: 'button', className: 'cc-day-add', 'aria-label': `在 ${iso} 新增赛事或考试事项`, onClick: () => openCalendarEvent(iso) }, '+'),
        h('div', { className: 'cc-day-events' }, chips.slice(0, 3).map(({ item, node, edge }) => eventChip(item, node, edge)), chips.length > 3 ? h('span', { className: 'cc-more' }, `+${chips.length - 3} 项`) : null))
    }))), [cells, monthIndex, month, selectedDate, today])
  const sortedItems = React.useMemo(() => timelineEntries(visible).sort((a, b) => a.key.localeCompare(b.key) || (a.item.title || '').localeCompare(b.item.title || '', 'zh-CN')), [visible])
  const agendaItems = selectedDate ? eventsForDate(selectedDate) : sortedItems.map(entry => entry.item)
  const eventForm = eventDraft && h('form', { className: 'cc-event-form', onSubmit: saveCalendarEvent },
    h('div', { className: 'cc-event-form-head' }, h('strong', null, '新增赛事 / 考试事项'), h('button', { type: 'button', className: 'text-button', onClick: () => setEventDraft(null), 'aria-label': '关闭新增事项' }, '×')),
    h('label', null, h('span', null, '日期'), h('input', { type: 'date', value: eventDraft.date, required: true, onChange: event => setEventDraft({ ...eventDraft, date: event.target.value }) })),
    h('label', null, h('span', null, '事项名称'), h('input', { type: 'text', name: 'title', value: eventDraft.title, maxLength: 200, required: true, placeholder: '例如：蓝桥杯省赛', onChange: event => setEventDraft({ ...eventDraft, title: event.target.value }) })),
    h('label', null, h('span', null, '节点类型'), h('select', { name: 'type', value: eventDraft.type, onChange: event => setEventDraft({ ...eventDraft, type: event.target.value }) }, Object.entries(NODE_LABELS).filter(([type]) => !['other', 'registration'].includes(type)).map(([type, label]) => h('option', { key: type, value: type }, label)))),
    h('label', null, h('span', null, '重要等级'), h('select', { value: eventDraft.level, onChange: event => setEventDraft({ ...eventDraft, level: Number(event.target.value) }) }, [['1', '一般'], ['2', '准备'], ['3', '重要'], ['4', '截止']].map(([value, label]) => h('option', { key: value, value: Number(value) }, label)))),
    h('label', { className: 'cc-event-description' }, h('span', null, '简短说明'), h('textarea', { rows: 2, maxLength: 500, value: eventDraft.description, placeholder: '可选，限 500 字', onChange: event => setEventDraft({ ...eventDraft, description: event.target.value }) })),
    error && h('p', { className: 'cc-inline-error', role: 'alert' }, error),
    h('div', { className: 'cc-event-form-actions' }, h('button', { type: 'button', className: 'cc-button', onClick: () => setEventDraft(null) }, '取消'), h('button', { type: 'submit', className: 'cc-button primary', disabled: busy }, busy ? '保存中…' : '保存事项')))

  const agenda = React.useMemo(() => h('aside', { className: 'cc-agenda' },
    h('div', { className: 'cc-agenda-head' }, h('div', null, !selectedDate && h('span', { className: 'cc-agenda-kicker' }, '优先处理'), h('h2', null, selectedDate ? dateText(selectedDate) : '下一步')), selectedDate && h('button', { className: 'text-button', onClick: () => openCalendarEvent(selectedDate) }, '＋ 新增赛事/考试')),
    agendaItems.length
      ? h('div', { className: 'cc-agenda-list' }, agendaItems.slice(0, 12).map(item => {
        const entry = sortedItems.find(row => row.item.id === item.id)
        const next = entry ? nextMark(entry, today) : null
        const label = entry ? entry.label : confidenceLabel(item, item.nodes?.[0] || {}).label
        return h('div', { key: item.id, className: `cc-agenda-row ${item.category === 'memo' ? 'cc-agenda-memo' : ''}` },
          h('button', { type: 'button', className: 'cc-agenda-open', onClick: () => item.category === 'memo' ? setMemoDraft({ id: item.id, date: item.nodes?.[0]?.start || selectedDate, title: item.title, description: item.description || '', level: item.memoLevel || 1 }) : setSelected(item) },
            h('time', null, entry ? whenText(entry, next) : firstWindowText(item)), h('strong', null, item.title),
            h('span', { className: `cc-confidence ${item.category === 'memo' ? 'memo' : item.demo ? 'demo' : entry && entry.kind !== 'dated' ? 'uncertain' : ''}` }, item.category === 'memo' ? '备忘' : label)),
          item.category === 'memo' && h('button', { type: 'button', className: 'cc-memo-delete', 'aria-label': `删除备忘 ${item.title}`, onClick: () => deleteMemo(item) }, '×'))
      }))
      : h('div', { className: 'cc-empty small' }, selectedDate ? '这一天没有事项。' : '目前没有待办事项。'),
     selectedDate && eventForm), [agendaItems, selectedDate, sortedItems, today, eventDraft, busy, error])


  const memoForm = memoDraft && h('form', { className: 'cc-memo-form', onSubmit: event => { event.preventDefault(); saveMemo() } },
    h('div', { className: 'cc-memo-form-head' }, h('strong', null, memoDraft.id ? '编辑备忘' : '新增备忘'), h('button', { type: 'button', className: 'text-button', onClick: () => setMemoDraft(null), 'aria-label': '关闭备忘表单' }, '×')),
    h('label', null, h('span', null, '日期'), h('input', { type: 'date', value: memoDraft.date, onChange: event => setMemoDraft({ ...memoDraft, date: event.target.value }), required: true })),
    h('label', null, h('span', null, '标题'), h('input', { type: 'text', value: memoDraft.title, placeholder: '记下这一天要做的事', maxLength: 200, onChange: event => setMemoDraft({ ...memoDraft, title: event.target.value }), required: true })),
    h('label', null, h('span', null, '等级'), h('select', { value: memoDraft.level, onChange: event => setMemoDraft({ ...memoDraft, level: event.target.value }) }, [['1', '一般'], ['2', '准备'], ['3', '重要'], ['4', '截止']].map(([value, label]) => h('option', { key: value, value }, label)))),
    h('label', null, h('span', null, '备注'), h('textarea', { value: memoDraft.description, rows: 2, onChange: event => setMemoDraft({ ...memoDraft, description: event.target.value }) })),
    h('div', { className: 'cc-memo-form-actions' }, memoDraft.id && h('button', { type: 'button', className: 'text-button danger', onClick: () => deleteMemo(items.find(item => item.id === memoDraft.id)) }, '删除'), h('button', { type: 'button', className: 'cc-button', onClick: () => setMemoDraft(null) }, '取消'), h('button', { type: 'submit', className: 'cc-button primary', disabled: busy }, busy ? '保存中…' : '保存备忘')))
  const list = h('div', { className: 'cc-list' }, sortedItems.map(entry => {
    const item = entry.item
    const next = nextMark(entry, today)
    return h('button', { key: item.id, className: 'cc-list-row', onClick: () => setSelected(item) },
      h('time', null, whenText(entry, next)),
      h('span', { className: `cc-tag ${item.category}`, 'data-color': tagColor(item) }, item.category === 'competition' ? '赛事' : '证书'),
      h('strong', null, item.title),
      h('span', { className: `cc-confidence ${item.demo || entry.kind !== 'dated' ? 'uncertain' : ''}` }, entry.label),
      h('span', null, REGISTRATION_LABELS[item.registrationStatus] === '报名中' ? '报名中' : ''))
  }))
  // 时间轴：按「离今天还有多久」排，每行带配图缩略图，悬浮出摘要卡，点击开详情
  const timeline = h('section', { className: 'cc-timeline', 'aria-label': '时间轴' },
    sortedItems.length ? sortedItems.map(entry => {
      const { item } = entry
      const next = nextMark(entry, today)
      const when = whenText(entry, next, { expectedStyle: 'timeline' })
      const nodes = (item.nodes || []).filter(node => node.start || node.end)
      return h('button', {
        key: item.id,
        className: `cc-tl-row ${entry.kind}`,
        'data-color': tagColor(item),
        onClick: () => setSelected(item),
        onFocus: event => setHover({ item, node: entry.node, x: 260, y: clampY(event.currentTarget) }),
        onBlur: () => setHover(null),
      },
        h('span', { className: 'cc-tl-date' }, h('strong', null, when), h('small', null, entry.kind === 'dated' && nodes.length > 1 ? `${nodes.length} 个节点` : '')),
        h(Thumb, { item, size: 'row', key: 'thumb' }),
        h('span', { className: 'cc-tl-body' },
          h('span', { className: 'cc-tl-title' }, item.title),
          h('small', null, item.organizer || item.description || '未填写主办方')),
        h('span', { className: `cc-confidence ${item.demo || entry.kind !== 'dated' ? 'uncertain' : ''}` }, entry.label))
    }) : h('div', { className: 'cc-empty small' }, '还没有安排。可以让 Agent 补几条，或自己新增。'))
  const hoverCard = hover ? h('div', { className: 'cc-hover-card', 'aria-hidden': true, style: { top: `${hover.y}px`, left: `${hover.x}px` } },
    h(Thumb, { item: hover.item, size: 'wide' }),
    h('strong', null, hover.item.title),
    h('span', { className: 'cc-hover-meta' }, `${NODE_LABELS[hover.node?.type] || '关键节点'} · ${nodeRangeText(hover.node || {})} · ${confidenceLabel(hover.item, hover.node || {}).label}`),
    h('p', null, hover.item.organizer || '未填写主办方'),
    h('span', { className: 'cc-hover-more' }, '点击查看完整节点与来源')) : null
  const conversationHint = view === 'calendar' ? h('aside', { className: 'cc-conversation-hint', 'aria-label': '用对话生成日历' },
    h('div', null,
      h('strong', null, '让 Agent 生成属于我的日历'),
      h('p', null, profile.major
        ? `档案：${profileSummary}。可以让 Agent 据此挑出适合你的赛事和证书。`
        : '告诉 Agent 你的专业、年级、地区，它会挑出适合你的赛事和证书，排进这份日历。')),
    h('div', { className: 'cc-ask-actions' },
      h('button', { type: 'button', className: 'cc-button primary', disabled: asking, onClick: () => askAgent('plan') }, asking ? '正在打开…' : profile.major ? '生成我的日历' : '开始生成我的日历'),
      h('button', { type: 'button', className: 'cc-button', disabled: asking, onClick: () => askAgent('semester') }, '按学期排一批'),
      h('button', { type: 'button', className: 'cc-button', disabled: asking, onClick: () => askAgent('add') }, '记一个已定的')),
    askError && h('p', { className: 'cc-inline-error cc-ask-error', role: 'alert' }, askError)) : null
  // 建议：没有日期、没有可信度，只给「为什么值得看」和一句可以去问 Agent 的话
  const hasSuggestions = view === 'calendar' && !hasRealItems && suggestions.length > 0
  const demoIds = new Set(items.filter(item => item.demo).map(item => item.id))
  const shownSuggestions = hasSuggestions ? suggestions.filter(entry => !demoIds.has(entry.id)) : []
  const suggestionPanel = shownSuggestions.length ? h('section', { className: 'cc-suggest', 'aria-label': '可以补进来的事项' },
    h('div', { className: 'cc-suggest-head' }, h('div', null, h('h2', null, '不知道该排什么？'), h('p', null, profile.major ? `按你的档案（${profileSummary}）挑的，时间以主办方当届公告为准。` : '先填档案，这里会更准。'))),
    h('div', { className: 'cc-suggest-list' }, shownSuggestions.map(entry => h('article', { key: entry.id, className: 'cc-suggest-row', 'data-color': tagColor(entry) },
      h('span', { className: 'cc-tag', 'data-color': tagColor(entry) }, entry.category === 'competition' ? '赛事' : '证书'),
      h('div', { className: 'cc-suggest-body' }, h('strong', null, entry.title), h('small', null, entry.why), entry.typical && h('small', { className: 'cc-suggest-typical' }, `参考节奏：${entry.typical}`), h('small', { className: 'cc-suggest-meta' }, [entry.organizer, (entry.regions || []).join(' / ')].filter(Boolean).join(' · '))),
      h('button', { type: 'button', className: 'cc-button', disabled: asking, onClick: () => askAgent('ask', entry.ask) }, '问 Agent')))),
  ) : null
  const toolbarWithCalendar = view === 'calendar' && mode === 'month' ? h('div', { className: 'cc-month-head' }, h('div', null, h('h2', null, monthTitle(month)), profile.major && h('p', null, profileSummary)), h('div', { className: 'cc-month-actions' }, h('button', { className: 'icon-button', onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)), 'aria-label': '上个月' }, h(Icon, { name: 'back' })), h('button', { className: 'cc-button', onClick: () => setMonth(new Date()), 'aria-label': '返回本月' }, '今天'), h('button', { className: 'icon-button', onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)), 'aria-label': '下个月' }, h(Icon, { name: 'forward' })))) : null
  const resultView = h(React.Fragment, null,
    view === 'calendar' && mode === 'month' ? toolbarWithCalendar : null,
    view === 'calendar' && mode === 'month' ? h(React.Fragment, null,
      h('div', { className: 'cc-calendar-tools' }, h('button', { type: 'button', className: 'cc-button', 'aria-expanded': showTools, onClick: () => setShowTools(!showTools) }, showTools ? '收起工具' : '搜索与视图')),
      showTools && h(React.Fragment, null, toolbar, coverageHint, conversationHint),
      h('div', { className: 'cc-calendar-layout' }, calendar, agenda)) : null,
    view !== 'calendar' || mode !== 'month' ? h(React.Fragment, null,
      showFilters && filterPanel,
      h('label', { className: 'cc-toggle cc-mobile-suitable' }, h('input', { type: 'checkbox', checked: filters.onlySuitable, onChange: event => setFilters(current => ({ ...current, onlySuitable: event.target.checked })) }), h('span', null, '只看适合我')),
      visible.length === 0 ? h('div', { className: 'cc-empty' }, h('div', { className: 'cc-empty-mark' }, '0'), h('h2', null, '没有找到匹配事项'), h('p', null, '尝试清除筛选，或调整关键词、类别与日期范围。'), h('button', { className: 'cc-button', onClick: clearFilters }, '清除筛选'))
        : mode === 'list' || view !== 'calendar' ? list : mode === 'upcoming' ? timeline : h('div', { className: 'cc-calendar-layout' }, calendar, agenda),
      suggestionPanel) : null,
  )
  const profileSetup = !profile.major && view === 'calendar' ? h('div', { className: 'cc-profile-banner' }, h('div', null, h('strong', null, '先完善个人档案'), h('p', null, '填写专业与关注方向，筛出更适合你的事项。')), h('button', { className: 'cc-button primary', onClick: () => setView('manage') }, '设置档案')) : null
  const blankItem = () => ({ id: '', title: '', category: 'competition', description: '', organizer: '', eligibility: '', majors: [], interests: [], years: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', notes: '', demo: false, nodes: [{ id: crypto.randomUUID(), type: 'registration', start: null, end: null, confidence: 'unknown', note: '' }] })
  const manage = view === 'manage' ? h(ManageView, { state, profile, busy, error, onSaveProfile: patchProfile, onEdit: item => setEditing(item || blankItem()), onImport: () => importRef.current?.click(), onExport: () => exportFile('json') }) : null
  const detail = selected && h(Detail, { item: selected, profile, favorite: state.favorites.includes(selected.id), reminder: state.reminders.includes(selected.id), onClose: () => setSelected(null), onFavorite: () => toggleFavorite(selected), onReminder: () => toggleReminder(selected), onEdit: () => { setEditing(selected); setSelected(null) } })
  const itemEditor = editing && h(ItemEditor, { item: editing, busy, onClose: () => setEditing(null), onSave: saveItem, onDelete: async item => { if (!window.confirm(`删除“${item.title}”？此操作不能撤销。`)) return; try { setState(await api(`items/${encodeURIComponent(item.id)}`, { method: 'DELETE' })); setEditing(null) } catch (e) { setError(e.message) } } })

  if (loading && !state) return h('div', { className: 'cc-shell cc-state', role: 'status' }, '正在读取本地日历…')
  if (error && !state) return h('div', { className: 'cc-shell cc-state' }, h('h1', null, '无法读取日历'), h('p', null, error), h('button', { className: 'cc-button primary', onClick: load }, '重试'))

  return h('div', { className: 'cc-shell' },
    h('style', null, styles),
    h('aside', { className: 'cc-sidebar' }, h('div', { className: 'cc-brand' }, h('span', { className: 'cc-brand-mark' }, 'C'), h('span', null, h('strong', null, '校历'), h('small', null, '赛事与证书'))), navigation, h('div', { className: 'cc-sidebar-foot' }, h('span', { className: 'cc-local-dot' }), '本地数据 · 手动维护')),
    h('main', { className: 'cc-main' }, h('header', { className: 'cc-topbar' }, h('div', null, h('p', { className: 'cc-eyebrow' }, 'CAMPUS OPPORTUNITIES'), h('h1', null, headerTitle)), h('div', { className: 'cc-top-actions' }, h(StarButton, { className: 'cc-button' }), h('button', { className: 'cc-button cc-refresh', onClick: () => load(), disabled: loading, 'aria-label': loading ? '正在刷新日历' : '刷新日历', title: '刷新日历' }, h('span', { 'aria-hidden': true }, loading ? '…' : '↻')), h('button', { className: 'cc-button', onClick: () => exportFile('ics') }, '导出 ICS'), view !== 'manage' && h('button', { className: 'cc-button primary', onClick: () => setEditing(blankItem()) }, h(Icon, { name: 'plus' }), '新增事项'))),
      error && h('div', { className: 'cc-alert', role: 'alert' }, error, h('button', { onClick: () => setError(''), 'aria-label': '关闭提示' }, h(Icon, { name: 'close' }))), notice && h('div', { className: 'cc-notice', role: 'status' }, notice, h('button', { onClick: () => setNotice(''), 'aria-label': '关闭提示' }, h(Icon, { name: 'close' }))),
      view === 'manage' ? manage : h(React.Fragment, null, view === 'calendar' && mode === 'month' ? null : profileSetup, view === 'calendar' && mode === 'month' ? null : toolbar, view === 'calendar' && mode === 'month' ? null : conversationHint, resultView),
       memoDraft && h('div', { className: 'cc-memo-modal-backdrop', onClick: event => { if (event.target === event.currentTarget) setMemoDraft(null) } }, h('div', { className: 'cc-memo-modal', role: 'dialog', 'aria-modal': true, 'aria-label': memoDraft.id ? '编辑备忘' : '新增备忘' }, memoForm)),
      h('input', { ref: importRef, className: 'sr-only', type: 'file', accept: 'application/json,.json', onChange: importFile }),
      hover && (mode !== 'list' || view !== 'calendar') ? hoverCard : null,
    ), detail, itemEditor)
}

function ManageView({ state, profile, busy, error, onSaveProfile, onEdit, onImport, onExport }) {
  // 档案草稿以「已保存档案 + 本地改动」派生：保存失败时改动仍在，宿主返回成功后随 profile 更新清空
  const savedProfile = React.useMemo(() => ({ ...profile, interests: [...(profile.interests || [])], types: [...(profile.types || [])] }), [profile.major, profile.year, profile.province, (profile.interests || []).join('\u0000'), (profile.types || []).join('\u0000')])
  const [changes, setChanges] = React.useState({})
  React.useEffect(() => { setChanges({}) }, [profile.major, profile.year, profile.province, (profile.interests || []).join('\u0000'), (profile.types || []).join('\u0000')])
  const draft = { ...savedProfile, ...changes }
  const setField = (key, value) => setChanges(current => ({ ...current, [key]: value }))
  const toggleField = (key, value) => setChanges(current => {
    const list = (current[key] ?? draft[key]) || []
    return { ...current, [key]: list.includes(value) ? list.filter(entry => entry !== value) : [...list, value] }
  })
  return h('div', { className: 'cc-manage' },
    h('section', { className: 'cc-section' }, h('div', { className: 'cc-section-head' }, h('div', null, h('h2', null, '个人档案'), h('p', null, '档案用于计算适配度，数据仅存本机。')), h('button', { className: 'cc-button primary', disabled: busy, onClick: () => onSaveProfile(draft) }, '保存档案')),
      h('div', { className: 'cc-profile-form' }, h('label', { className: 'cc-field' }, h('span', null, '专业（可搜索或自定义）'), h('input', { list: 'cc-major-options', value: draft.major || '', maxLength: 100, onChange: event => setField('major', event.target.value), placeholder: '输入或选择专业' }), h('datalist', { id: 'cc-major-options' }, majors.map(value => h('option', { key: value, value })))), h('label', { className: 'cc-field' }, h('span', null, '年级'), h('select', { value: draft.year || '', onChange: event => setField('year', event.target.value) }, [['', '请选择'], ...['大一', '大二', '大三', '大四', '研一', '研二', '研三', '博士'].map(value => [value, value])].map(([value, label]) => h('option', { key: value, value }, label)))), h('label', { className: 'cc-field' }, h('span', null, '学校所在省份'), h('select', { value: draft.province || '', onChange: event => setField('province', event.target.value) }, [['', '请选择'], ...provinces.map(value => [value, value])].map(([value, label]) => h('option', { key: value, value }, label))))),
      h('fieldset', { className: 'cc-choice-set' }, h('legend', null, '关注方向'), h('div', { className: 'cc-choice-grid' }, directions.map(value => h('label', { key: value }, h('input', { type: 'checkbox', checked: (draft.interests || []).includes(value), onChange: () => toggleField('interests', value) }), h('span', null, value))))),
      h('fieldset', { className: 'cc-choice-set' }, h('legend', null, '感兴趣的类型'), h('div', { className: 'cc-choice-grid' }, [['competition', '赛事'], ['certificate', '证书考试']].map(([value, label]) => h('label', { key: value }, h('input', { type: 'checkbox', checked: (draft.types || []).includes(value), onChange: () => toggleField('types', value) }), h('span', null, label))))), error && h('p', { className: 'cc-inline-error', role: 'alert' }, error)),
    h('section', { className: 'cc-section' }, h('div', { className: 'cc-section-head' }, h('div', null, h('h2', null, '数据维护'), h('p', null, '录入可追溯来源的数据，或备份本地 JSON。')), h('div', { className: 'cc-row-actions' }, h('button', { className: 'cc-button', onClick: onImport }, '导入 JSON'), h('button', { className: 'cc-button', onClick: onExport }, '导出 JSON'), h('button', { className: 'cc-button primary', onClick: () => onEdit(null) }, h(Icon, { name: 'plus' }), '新增事项'))),
      h('div', { className: 'cc-data-list' }, state.items.map(item => h('div', { className: 'cc-data-row', key: item.id }, h('span', { className: `cc-tag ${item.category}`, 'data-color': tagColor(item) }, item.category === 'competition' ? '赛事' : '证书'), h('strong', null, item.title), h('span', { className: 'cc-confidence' }, confidenceLabel(item, item.nodes?.[0] || {}).label), h('button', { className: 'icon-button', 'aria-label': `编辑${item.title}`, onClick: () => onEdit(item) }, h(Icon, { name: 'edit' }))))),
      h('p', { className: 'cc-data-disclaimer' }, '没有赛事 API 或自动抓取。真实记录须填写官方来源 URL 与最近核验日期；预测日期需说明依据。站内提醒不等于系统通知。')),
  )
}

function Detail({ item, profile, favorite, reminder, onClose, onFavorite, onReminder, onEdit }) {
  const fit = scoreFit(item, profile)
  const today = todayIso()
  const marks = item.nodes || []
  return h('div', { className: 'cc-overlay', role: 'presentation', onMouseDown: event => { if (event.target === event.currentTarget) onClose() } }, h('section', { className: 'cc-dialog', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'cc-detail-title' },
    h('div', { className: 'cc-dialog-head' }, h('span', { className: `cc-tag ${item.category}`, 'data-color': tagColor(item) }, item.category === 'competition' ? '赛事' : '证书'), h('button', { className: 'icon-button', onClick: onClose, 'aria-label': '关闭详情' }, h(Icon, { name: 'close' })), h('h2', { id: 'cc-detail-title' }, item.title), item.demo && h('p', { className: 'cc-demo-notice' }, '这条是演示数据，不代表真实活动、近期报名或已核验安排')),
    h(Thumb, { item, size: 'hero' }),
    h('div', { className: 'cc-dialog-actions' }, h('button', { className: 'cc-button', onClick: onFavorite }, `${favorite ? '★' : '☆'} ${favorite ? '已收藏' : '收藏'}`), h('button', { className: 'cc-button', onClick: onReminder }, reminder ? '已设站内提醒' : '设置站内提醒'), h('button', { className: 'cc-button', onClick: onEdit }, '编辑')),
    h('dl', { className: 'cc-detail-grid' }, [['简介', item.description], ['适合人群', [...(item.majors || []), ...(item.years || []), ...(item.interests || [])].join('、') || item.eligibility], ['主办方', item.organizer], ['承办 / 账号', item.artist], ['地点', item.venue], ['报名条件', item.eligibility], ['适配度', `${fit.score}% · ${fit.reasons.join('、') || '暂无匹配信息'}`], ['报名状态', REGISTRATION_LABELS[item.registrationStatus] || '未知'], ['最近核验', item.verifiedAt || '未核验'], ['备注', item.notes]].map(([label, value]) => h('div', { key: label }, h('dt', null, label), h('dd', null, value || '未提供')))),
    h('section', { className: 'cc-node-list' }, h('h3', null, '关键节点'), marks.length ? marks.map(node => {
      const confidence = confidenceLabel(item, node)
      // 倒计时按「什么时候用得上」算：截止类节点挂在终点（最后一天），其余挂在起点。
      // 跨天报名期若按起点算，天天显示「已过 20 天」，反而盖住了真正要盯的截止日。
      const { from, to } = nodeWindow(node)
      const anchor = to && (node.type === 'registration_deadline' || node.type === 'submission') ? to : (from || to)
      const offset = anchor ? dayDistance(today, anchor) : null
      const rangeNote = from && to && from !== to && anchor === to ? '截止日' : ''
      return h('article', { key: node.id, 'data-color': node.color || tagColor(item) },
        h('div', null, h('strong', null, NODE_LABELS[node.type] || node.type), h('span', { className: `cc-confidence ${confidence.label === '预测' || confidence.label === '待确认' || confidence.label === '日期未知' ? 'uncertain' : ''}` }, confidence.label)),
        h('p', null, nodeRangeText(node), offset !== null && offset !== undefined ? h('span', { className: 'cc-node-distance' }, ` · ${rangeNote ? `${rangeNote} ` : ''}${distanceText(offset)}`) : null),
        h('small', null, confidence.detail),
        node.color && h('small', null, `标签色：${node.color}`))
    }) : h('p', { className: 'cc-node-empty' }, '还没有节点。')),
    h('footer', { className: 'cc-source' }, h('span', null, '官方来源'), item.sourceUrl && !item.demo ? h('a', { href: item.sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, item.sourceUrl) : h('span', null, item.demo ? '演示记录无官方来源' : '无来源 · 不得标记为已核验'),
      item.imageUrl && h('span', { className: 'cc-source-image' }, '宣传图：', h('a', { href: item.imageUrl, target: '_blank', rel: 'noopener noreferrer' }, '查看原图')))))
}

function ItemEditor({ item, busy, onClose, onSave, onDelete }) {
  const [draft, setDraft] = React.useState(() => structuredClone(item))
  const [localError, setLocalError] = React.useState('')
  const set = (key, value) => setDraft(current => ({ ...current, [key]: value }))
  const setNode = (index, key, value) => setDraft(current => ({ ...current, nodes: current.nodes.map((entry, row) => row === index ? { ...entry, [key]: value } : entry) }))
  const addNode = () => setDraft(current => ({ ...current, nodes: [...current.nodes, { id: crypto.randomUUID(), type: 'other', start: null, end: null, confidence: 'unknown', note: '' }] }))
  const removeNode = index => setDraft(current => ({ ...current, nodes: current.nodes.filter((_, row) => row !== index) }))
  const nodes = draft.nodes?.length ? draft.nodes : [{ id: crypto.randomUUID(), type: 'other', start: null, end: null, confidence: 'unknown', note: '' }]
  const submit = event => {
    event.preventDefault(); setLocalError('')
    if (!draft.title.trim()) return setLocalError('请填写事项名称。')
    if (!nodes.length) return setLocalError('至少保留一个关键节点。')
    if (nodes.some(entry => entry.confidence === 'official_confirmed') && (!draft.sourceUrl || !draft.verifiedAt)) return setLocalError('官方确认日期必须填写来源 URL 和最近核验日期。')
    if (nodes.some(entry => entry.confidence === 'predicted' && !entry.note?.trim())) return setLocalError('每个预测日期都必须说明推测依据。')
    if (draft.imageUrl && !/^https?:\/\//i.test(draft.imageUrl.trim())) return setLocalError('宣传图必须是 http 或 https 直链；没有就留空。')
    const next = { ...draft, title: draft.title.trim(), sourceUrl: draft.sourceUrl || '', verifiedAt: draft.verifiedAt || '', imageUrl: (draft.imageUrl || '').trim(), nodes: nodes.map(entry => ({ ...entry, start: entry.start || null, end: entry.end || null })) }
    onSave(next)
  }
  const nodeTypeOptions = [['registration', '报名开始'], ['registration_deadline', '报名截止'], ['competition', '比赛日期'], ['exam', '考试日期'], ['submission', '材料提交'], ['result', '结果公布'], ['other', '其他']]
  const confidenceOptions = [['unknown', '日期未知'], ['official_confirmed', '官方已确认'], ['predicted', '预测'], ['pending_confirmation', '待确认']]
  const splitList = text => text.split(/[、,，]/).map(value => value.trim()).filter(Boolean)
  return h('div', { className: 'cc-overlay', role: 'presentation', onMouseDown: event => { if (event.target === event.currentTarget) onClose() } }, h('section', { className: 'cc-dialog editor', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'cc-editor-title' }, h('div', { className: 'cc-dialog-head' }, h('button', { className: 'icon-button', onClick: onClose, 'aria-label': '关闭表单' }, h(Icon, { name: 'close' })), h('h2', { id: 'cc-editor-title' }, draft.id ? '编辑事项' : '新增事项')),
    h('form', { className: 'cc-editor-form', onSubmit: submit },
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '基本信息'), h('label', { className: 'cc-field' }, h('span', null, '事项名称 *'), h('input', { required: true, maxLength: 200, value: draft.title, onChange: event => set('title', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '类别'), h('select', { value: draft.category, onChange: event => set('category', event.target.value) }, h('option', { value: 'competition' }, '赛事'), h('option', { value: 'certificate' }, '证书考试'))), h('label', { className: 'cc-field' }, h('span', null, '主办方'), h('input', { value: draft.organizer || '', maxLength: 200, onChange: event => set('organizer', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '报名状态'), h('select', { value: draft.registrationStatus || 'unknown', onChange: event => set('registrationStatus', event.target.value) }, [['unknown', '未知'], ['not_open', '未开始'], ['open', '报名中'], ['closed', '已截止']].map(([value, label]) => h('option', { key: value, value }, label)))), h('label', { className: 'cc-field', style: { gridColumn: '1 / -1' } }, h('span', null, '简介'), h('textarea', { value: draft.description || '', maxLength: 2000, rows: 2, onChange: event => set('description', event.target.value) }))),
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '适用范围'), h('label', { className: 'cc-field' }, h('span', null, '适配专业（逗号分隔）'), h('input', { value: (draft.majors || []).join('、'), onChange: event => set('majors', splitList(event.target.value)) })), h('label', { className: 'cc-field' }, h('span', null, '适用年级（逗号分隔）'), h('input', { value: (draft.years || []).join('、'), onChange: event => set('years', splitList(event.target.value)) })), h('label', { className: 'cc-field' }, h('span', null, '关注方向（逗号分隔）'), h('input', { value: (draft.interests || []).join('、'), onChange: event => set('interests', splitList(event.target.value)) })), h('label', { className: 'cc-field' }, h('span', null, '适用地区（逗号分隔）'), h('input', { value: (draft.regions || []).join('、'), onChange: event => set('regions', splitList(event.target.value)) })), h('label', { className: 'cc-field', style: { gridColumn: '1 / -1' } }, h('span', null, '报名条件'), h('textarea', { rows: 2, maxLength: 2000, value: draft.eligibility || '', onChange: event => set('eligibility', event.target.value) }))),
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '来源与核验'), h('label', { className: 'cc-field' }, h('span', null, '官方来源 URL'), h('input', { type: 'url', placeholder: 'https://', value: draft.sourceUrl || '', onChange: event => set('sourceUrl', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '最近核验日期'), h('input', { type: 'date', value: draft.verifiedAt || '', onChange: event => set('verifiedAt', event.target.value) })), h('p', { className: 'cc-data-disclaimer', style: { gridColumn: '1 / -1' } }, '官方确认必须有具体日期、HTTP(S) 来源和最近核验日期；插件不会自动访问来源。')), 
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '外观与地点'), h('label', { className: 'cc-field', style: { gridColumn: '1 / -1' } }, h('span', null, '官方宣传图 URL'), h('input', { type: 'url', placeholder: 'https://', value: draft.imageUrl || '', onChange: event => set('imageUrl', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '承办 / 官方账号'), h('input', { maxLength: 120, value: draft.artist || '', onChange: event => set('artist', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '比赛或考试地点'), h('input', { maxLength: 200, value: draft.venue || '', onChange: event => set('venue', event.target.value) })), h('p', { className: 'cc-data-disclaimer', style: { gridColumn: '1 / -1' } }, '宣传图只接受 http(s) 直链，插件不下载也不缓存；没有官方图就留空，会显示色块占位。')), 
      h('fieldset', { className: 'cc-editor-section cc-editor-nodes' }, h('legend', null, '关键节点'), h('div', { className: 'cc-node-editor-head' }, h('span', { className: 'cc-data-disclaimer' }, '日期不明确时留空，并标记为待确认。'), h('button', { type: 'button', className: 'cc-button', onClick: addNode }, h(Icon, { name: 'plus' }), '添加节点')),
        nodes.map((entry, index) => h('fieldset', { className: 'cc-editor-node', key: entry.id }, h('legend', null, `节点 ${index + 1}`),
          h('div', { className: 'cc-editor-row' }, h('label', { className: 'cc-field' }, h('span', null, '节点类型'), h('select', { value: entry.type, onChange: event => setNode(index, 'type', event.target.value) }, nodeTypeOptions.map(([value, label]) => h('option', { key: value, value }, label)))), h('label', { className: 'cc-field' }, h('span', null, '可信度'), h('select', { value: entry.confidence, onChange: event => setNode(index, 'confidence', event.target.value) }, confidenceOptions.map(([value, label]) => h('option', { key: value, value }, label))))),
          h('div', { className: 'cc-editor-row' }, h('label', { className: 'cc-field' }, h('span', null, '开始日期'), h('input', { type: 'date', value: entry.start || '', onChange: event => setNode(index, 'start', event.target.value || null) })), h('label', { className: 'cc-field' }, h('span', null, '结束日期'), h('input', { type: 'date', value: entry.end || '', onChange: event => setNode(index, 'end', event.target.value || null) })), h('label', { className: 'cc-field' }, h('span', null, '日期精度'), h('select', { value: entry.accuracy || 'exact', onChange: event => setNode(index, 'accuracy', event.target.value) }, [['exact', '精确日期'], ['range', '日期范围'], ['month', '仅月份'], ['year', '仅年份'], ['unknown', '未知']].map(([value, label]) => h('option', { key: value, value }, label))))),
          h('label', { className: 'cc-field' }, h('span', null, entry.confidence === 'predicted' ? '推测依据 *' : '说明'), h('textarea', { rows: 2, maxLength: 1000, value: entry.note || '', onChange: event => setNode(index, 'note', event.target.value), placeholder: '如：根据往年公告时间推测，待官方确认' })),
          h('div', { className: 'cc-editor-row' }, h('label', { className: 'cc-field' }, h('span', null, '标签色'), h('select', { value: entry.color || '', onChange: event => setNode(index, 'color', event.target.value) }, [['', '自动'], ...['teal', 'amber', 'rose', 'violet', 'sky', 'olive', 'slate'].map(value => [value, value])].map(([value, label]) => h('option', { key: value, value }, label))))),
          nodes.length > 1 && h('button', { type: 'button', className: 'cc-button danger', onClick: () => removeNode(index) }, '删除此节点')))),
      h('label', { className: 'cc-field' }, h('span', null, '备注'), h('textarea', { rows: 2, maxLength: 2000, value: draft.notes || '', onChange: event => set('notes', event.target.value) })),
      localError && h('p', { className: 'cc-inline-error', role: 'alert' }, localError),
      h('div', { className: 'cc-form-actions' }, draft.id && !draft.demo && h('button', { type: 'button', className: 'cc-button danger', onClick: () => onDelete(draft) }, '删除事项'), h('span', { className: 'cc-grow' }), h('button', { type: 'button', className: 'cc-button', onClick: onClose }, '取消'), h('button', { type: 'submit', className: 'cc-button primary', disabled: busy }, busy ? '保存中…' : '保存事项')))))
}

function SidebarIcon() { return h(Icon, { name: 'calendar' }) }
const inject = ['slots', 'uiWorkspace']
function apply(ctx) {
  // 开新对话：DSH 的 uiWorkspace 服务。拿到了才把「问 Agent」按钮变成可用的
  const workspace = ctx.uiWorkspace || ctx.get?.('uiWorkspace')
  const onAsk = workspace && typeof workspace.startSession === 'function'
    ? prompt => workspace.startSession(undefined, { prompt, whenDraftExists: 'replace' })
    : undefined
  const Main = () => h(App, { onAsk })
  // 两处 slot 注册都必须包进 ctx.effect：插件被禁用或热重载时要能撤销，
  // 否则主区会叠出一份新的注册，旧注册继续渲染、连不上新的 ctx。
  ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'campus-events-calendar' }, Main)), 'campus events calendar main view')
  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'campus-events-calendar', order: 6, label: () => '赛事日历' }, SidebarIcon)), 'campus events calendar sidebar entry')
}
export { apply, inject }
