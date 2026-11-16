import { StarButton, maybeRemindStar } from './star-entry.js'
import React from 'react'
import styles from './styles.css'
import { buildMonthIndex, filterItems, monthFloating, scoreFit, tagColor } from './domain/filter.js'
import { itemAlias } from './domain/alias.js'
import { buildViews } from './domain/merge.js'
import { confidenceLabel, nodePrecision, nodeWindow, validateItem, verificationState } from './domain/model.js'
import { dateCoverage, daysBetween, expectedHint, isoDate, monthChips, monthWindow, nextMark, timelineEntries, todayIso } from './domain/timeline.js'

const h = React.createElement
const API = '/campus-calendar'
const NODE_LABELS = { registration: '报名开始', registration_deadline: '报名截止', competition: '比赛日期', exam: '考试日期', submission: '材料提交', result: '结果公布', other: '其他节点' }
const REGISTRATION_LABELS = { open: '报名中', not_open: '尚未开放', closed: '已截止', unknown: '未知' }
// 四档重要程度：月历格底色、胶囊、详情里的选择器共用同一套名字，改一处就全站一致
const LEVEL_LABELS = { 1: '一般', 2: '准备', 3: '重要', 4: '截止' }
const LEVEL_HINTS = { 1: '知道就行', 2: '要开始准备', 3: '必须到场或提交', 4: '过了就没了' }
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
// 视图模式只有这四种；顺序即重要性（先月历，再全年）
const MODES = [['month', '月历'], ['year', '全年'], ['upcoming', '时间轴'], ['list', '列表']]

const majors = ['计算机科学', '软件工程', '电子信息', '机械工程', '自动化', '经济学', '管理学', '会计学', '法学', '英语', '医学', '设计学']
const provinces = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆']
const directions = ['创新创业', '学术科研', '程序设计', '职业发展', '志愿服务', '艺术设计', '语言能力', '综合素质']

function dateText(value) { return value ? `${Number(value.slice(5, 7))}月${Number(value.slice(8, 10))}日` : '日期未知' }
/**
 * 横带上那句「什么时候」：月份精度的说「3 月」，长窗口说「5 月—6 月」，全年滚动的说「全年」。
 * 都不给具体日 —— 给不出，编一个才是错的。
 */
function floatingWhen(node, kind) {
  const from = node.start || ''
  if (!from) return '日期未知'
  if (kind === 'year') return '全年滚动'
  if (kind === 'span' && node.end) {
    const sameYear = from.slice(0, 4) === node.end.slice(0, 4)
    const sameMonth = sameYear && from.slice(5, 7) === node.end.slice(5, 7)
    // 同月内的窗口写「11 月」就够，「11 月—11 月」既啰嗦又像写错
    if (sameMonth) return `${Number(from.slice(5, 7))}月`
    const left = `${sameYear ? '' : `${from.slice(0, 4)}年`}${Number(from.slice(5, 7))}月`
    return `${left}—${Number(node.end.slice(5, 7))}月`
  }
  return `${Number(from.slice(5, 7))}月`
}
/**
 * 按节点类型推断的默认档：截止类最急，比赛/考试次之，报名开始再次之。
 * 窗口的「结束日」不等于截止 —— 只有报名/提交窗口的末日才是「过了就没了」，
 * 比赛窗口的末日只是最后一天，染成截止红会让人以为那天必须交东西。
 */
function autoLevel(node, edge) {
  const base = ({ registration_deadline: 4, competition: 3, exam: 3, submission: 2 })[node?.type] || (node?.type === 'registration' ? 2 : 1)
  if (edge === 'end' && (node?.type === 'registration' || node?.type === 'registration_deadline' || node?.type === 'submission')) return 4
  return base
}
/** 用户手动标的 level 优先于自动推断 —— 那是他自己对这个日子的判断。 */
function nodeLevel(node, edge) { return node?.level || autoLevel(node, edge) }
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
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const error = new Error(payload.error || `请求失败 (${response.status})`)
      // 带上状态码：调用方要区分「这个宿主根本没有这条路由」和「这条请求本身被拒」
      error.status = response.status
      throw error
    }
    return response.headers.get('content-type')?.includes('text/calendar') ? response.blob() : response.json()
  })
}
/**
 * 首次打不开数据时，最可能的原因是宿主进程还跑着旧版本（插件是 link 进来的，dist 已经更新但进程没重启）。
 * 404 就直说这件事，别丢一句「请求失败 (404)」让用户去猜。
 */
function loadErrorMessage(error) {
  if (error?.status === 404) return '宿主没有找到这个插件的接口：多半是 DSH 还在跑旧进程，重启 dsh web 后就好。'
  if (error?.status === 401 || error?.status === 403) return '没有权限读取日历数据，请确认已登录 DSH。'
  return error?.message || '读取日历失败'
}
function saveBlob(blob, name) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob); link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}
function monthCells(date) {
  return monthWindow(date).days.map(day => day.date)
}
/** 年视图用的小月历格子：只排本月的日子，前面补空格对齐星期（周一起始）。 */
function yearMonthCells(year, month) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: lead }, () => null)
  for (let day = 1; day <= days; day++) cells.push(new Date(year, month, day))
  return cells
}
/** 读本地存的视图偏好，值不在白名单里就当没存过（防止旧版本写进去的废值把界面卡在空白页）。 */
function stored(key, allowed) {
  try {
    const value = localStorage.getItem(key)
    return allowed.includes(value) ? value : ''
  } catch { return '' }
}
/**
 * 弹层焦点：打开时把焦点移进弹层，Tab 只在弹层内循环，关闭时还给原来那个按钮。
 * 不做这件事的话，键盘用户按 Tab 会跑到弹层背后的月历里 —— 那里面有 90 多个可聚焦元素，
 * 一旦跑出去基本就找不回来了。
 */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
function useDialogFocus(active = true) {
  const ref = React.useRef(null)
  const previous = React.useRef(null)
  React.useEffect(() => {
    const node = active ? ref.current : null
    if (!node) return
    previous.current = typeof document !== 'undefined' ? document.activeElement : null
    const list = () => [...node.querySelectorAll(FOCUSABLE)].filter(element => element.getClientRects().length > 0)
    const first = list()[0]
    if (first) first.focus(); else node.focus()
    const onKey = event => {
      if (event.key !== 'Tab') return
      const items = list()
      if (!items.length) return
      const head = items[0]
      const tail = items[items.length - 1]
      const inside = node.contains(document.activeElement)
      if (event.shiftKey && (!inside || document.activeElement === head)) { event.preventDefault(); tail.focus() }
      else if (!event.shiftKey && (!inside || document.activeElement === tail)) { event.preventDefault(); head.focus() }
    }
    node.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('keydown', onKey)
      const back = previous.current
      if (back && typeof back.focus === 'function' && document.contains(back)) back.focus()
    }
  }, [active])
  return ref
}
/** 悬浮卡定位：贴着触发元素的下沿，但不超出视口底部。 */
function clampY(element) {
  const rect = typeof element?.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null
  const top = rect ? rect.top + (rect.height || 0) / 2 : 200
  const height = typeof window !== 'undefined' ? window.innerHeight || 760 : 760
  return Math.max(12, Math.min(top, height - 220))
}
/** 月历格 / 时间轴 / 详情标题统一用的显示名：自定义简称 > 词典简称 > 智能缩写。 */
function shortName(item) { return itemAlias(item).alias || (item.title || '').trim().slice(0, 6) || '未命名' }

/** 一张卡由多条记录合成时，明细行要说明「这里其实是几条记录」，否则用户以为数据丢了。 */
function cardNote(item, cardsOf) {
  const cards = cardsOf?.get(item)
  return cards && cards.length > 1 ? `合并了 ${cards.length} 条记录 · 共 ${(item.nodes || []).length} 个节点` : ''
}

function Icon({ name }) {
  const paths = { calendar: 'M7 2v4m10-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z', star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z', plus: 'M12 5v14M5 12h14', back: 'M19 12H5m7 7-7-7 7-7', forward: 'M5 12h14m-7-7 7 7-7 7', close: 'M18 6 6 18M6 6l12 12', today: 'M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z' }
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
  // 视图偏好（日历/收藏/维护 + 月历/时间轴/列表 + 上次看的月份）存在本地：
  // 这个插件是每天都会打开看一眼的东西，每次都回到「本月 + 月历」等于把用户上次的动作抹掉。
  const [view, setView] = React.useState(() => stored('cc-view', ['calendar', 'favorites', 'manage']) || 'calendar')
  const [mode, setMode] = React.useState(() => stored('cc-mode', MODES.map(([value]) => value)) || 'month')
  React.useEffect(() => { try { localStorage.setItem('cc-view', view) } catch {} }, [view])
  React.useEffect(() => { try { localStorage.setItem('cc-mode', mode) } catch {} }, [mode])
  // 月历自身的字号档位（紧凑/标准/宽松）：格子只有 90 来像素高，字号和行高直接决定能看清几件事
  const [density, setDensity] = React.useState(() => {
    try { return localStorage.getItem('cc-density') || 'cozy' } catch { return 'cozy' }
  })
  React.useEffect(() => { try { localStorage.setItem('cc-density', density) } catch {} }, [density])
  const [month, setMonth] = React.useState(() => {
    // 预览/调试用：?month=2027-05 直接落到指定月份，方便核对远期赛程的排版
    const hit = typeof location !== 'undefined' && /[?&]month=(\d{4})-(\d{2})/.exec(location.search || '')
    if (hit) {
      const date = new Date(Number(hit[1]), Number(hit[2]) - 1, 1)
      if (!Number.isNaN(date.getTime())) return date
    }
    // 否则回到上次看的那一页：翻到明年 4 月准备比赛的人，下次打开还想看 4 月
    const saved = typeof localStorage !== 'undefined' && /^(\d{4})-(\d{2})$/.exec(stored('cc-month') || '')
    if (saved) {
      const date = new Date(Number(saved[1]), Number(saved[2]) - 1, 1)
      if (!Number.isNaN(date.getTime())) return date
    }
    return new Date()
  })
  React.useEffect(() => { try { localStorage.setItem('cc-month', `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`) } catch {} }, [month])
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
  const [duplicates, setDuplicates] = React.useState([])
  const importRef = React.useRef(null)
  // 通知条不该一直挂在屏幕上：成功类自动淡出，错误类留着手动关（错误信息用户往往要看仔细）。
  // 用 ref 记住定时器，连续两次操作时把上一个清掉，避免旧定时器提前关掉新提示。
  const noticeTimerRef = React.useRef(null)
  const memoDialogRef = useDialogFocus(Boolean(memoDraft))
  const notify = React.useCallback(message => {
    setNotice(message)
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    if (!message) return
    noticeTimerRef.current = setTimeout(() => setNotice(''), 4500)
  }, [])
  React.useEffect(() => () => { if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current) }, [])
  // 删除是不可逆操作，但撤销窗口只有一次点击的距离：通知条里带一个「撤销」，8 秒内可以放回去。
  // 用独立 state 而不是复用 notice，是因为这条要活得比普通提示久，而且要带按钮。
  const [undo, setUndo] = React.useState(null)
  const undoTimerRef = React.useRef(null)
  const offerUndo = React.useCallback((message, restore) => {
    setUndo({ message, restore })
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setUndo(null), 8000)
  }, [])
  const dismissUndo = React.useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndo(null)
  }, [])
  React.useEffect(() => () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }, [])
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
      if (!controller.signal.aborted && generation === requestRef.current.generation) setError(loadErrorMessage(e))
    } finally {
      if (generation === requestRef.current.generation && !controller.signal.aborted) setLoading(false)
    }
  }, [])
  React.useEffect(() => {
    load()
    // 卸载时只作废正在等的那次请求；整代 generation 不在这里递增，
    // 否则 StrictMode 的双次挂载会把第一次挂载的清理当成「用户关掉了页面」，把第二次的加载也一起废掉。
    const request = requestRef.current
    return () => request.controller?.abort()
  }, [load])
  const editingRef = React.useRef(editing)
  editingRef.current = editing
  React.useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'hidden' || editingRef.current || Date.now() - lastFocusRefreshRef.current < 30_000) return
      lastFocusRefreshRef.current = Date.now()
      load({ background: true })
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])
  React.useEffect(() => {
    if (!selected) return
    const onKey = event => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])
  const profile = state?.profile || { major: '', year: '', province: '', interests: [], types: [] }
  const items = state?.items || []
  /**
   * 展示层按「一个赛事 = 一张卡」渲染：同一赛事被写成多条记录时只在月历里出现一次，
   * 点开能看到全部记录。数据本身一条都没删——要真删，走数据维护里的「删除重复记录」。
   */
  const { views, viewById, cardsOf } = React.useMemo(() => buildViews(items), [items])
  const filtersKey = JSON.stringify(filters)
  const filtered = React.useMemo(() => filterItems(views, filters, profile), [views, profile, filtersKey])
  const favoritesKey = (state?.favorites || []).join('\u0000')
  const visible = React.useMemo(() => {
    if (view !== 'favorites') return filtered
    const favorites = new Set(state?.favorites || [])
    // 收藏的是其中一条记录时，整张卡都算收藏（否则卡片会在收藏页里凭空消失）
    return filtered.filter(entry => cardsOf.get(entry)?.some(card => favorites.has(card.id)) || favorites.has(entry.id))
  }, [filtered, view, favoritesKey, cardsOf])
  // 依赖不能只串 id：改节点等级、改日期都不换 id，只串 id 会让月历停在旧数据上，
  // 表现就是「点了重要程度，格子颜色不变」。把节点也串进去，内容一变就重算。
  const viewKey = React.useMemo(() => visible.map(entry => `${entry.id}#${(entry.nodes || []).map(node => `${node.id}:${node.start}:${node.end}:${node.level || ''}`).join(',')}`).join('\u0000'), [visible])
  const monthIndex = React.useMemo(() => buildMonthIndex(visible, month), [viewKey, month.getFullYear(), month.getMonth()])
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
    try { setState(await api('state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next) })); notify('已保存') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const patchProfile = patch => saveState({ ...state, profile: { ...profile, ...patch } })
  const saveItem = async item => {
    setBusy(true); setError('')
    try { const next = await api(`items${item.id ? `/${encodeURIComponent(item.id)}` : ''}`, { method: item.id ? 'PUT' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ item }) }); setState(next); setEditing(null); notify('事项已保存'); maybeRemindStar() }
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
      setState(next); setMemoDraft(null); notify('备忘已保存')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const deleteMemo = async memo => {
    if (!window.confirm(`删除备忘“${memo.title}”？`)) return
    setBusy(true); setError('')
    try {
      const next = await api(`memos/${encodeURIComponent(memo.id)}`, { method: 'DELETE' })
      setState(next); setMemoDraft(null); notify('备忘已删除')
      // 撤销就是把原字段原样再存一遍：备忘的 id 会换新，但日期、标题、描述、等级都还在
      const node = memo.nodes?.[0] || {}
      offerUndo(`已删除备忘「${memo.title}」`, async () => {
        setState(await api('memos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ date: node.start, title: memo.title, description: memo.description || '', level: memo.memoLevel || 1 }) }))
      })
    }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const toggleFavorite = async item => {
    const favorites = state.favorites.includes(item.id) ? state.favorites.filter(id => id !== item.id) : [...state.favorites, item.id]
    await saveState({ ...state, favorites })
  }
  const toggleReminder = async item => {
    if (!item.nodes?.some(node => nodeDate(node))) return notify('该事项没有已知日期，暂不能设置提醒')
    const on = !state.reminders.includes(item.id)
    const reminders = on ? [...state.reminders, item.id] : state.reminders.filter(id => id !== item.id)
    await saveState({ ...state, reminders })
    // 说清它到底会做什么：打开插件时把 7 天内到期的排在最上面，不发系统通知
    notify(on ? '已加入提醒：打开日历时，7 天内到期的会排在日历上方' : '已取消这项提醒')
  }
  const exportFile = async type => { try { const data = await api(`export.${type}`); const blob = type === 'json' ? new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }) : data; saveBlob(blob, `campus-events-calendar.${type}`) } catch (e) { setError(e.message) } }
  const importFile = async event => {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return setError('导入文件不能超过 2 MB')
    if (!window.confirm('导入将替换当前事项和档案。建议先导出现有 JSON 备份。继续吗？')) return
    try {
      const parsed = JSON.parse(await file.text())
      const { backup, ...next } = await api('import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed) })
      setState(next)
      // 宿主在替换前会先整份备份；把备份文件名告诉用户，出问题时有据可查
      const name = String(backup || '').split(/[\\/]/).pop()
      notify(name ? `JSON 导入完成，原数据已备份为 ${name}` : 'JSON 导入完成')
    } catch (e) { setError(e.message) }
  }
  const clearFilters = () => setFilters({ query: '', category: 'all', major: 'all', province: 'all', status: 'all', from: '', to: '', onlySuitable: false })
  /**
   * 重复记录：查询是只读的，合并要用户点头才动数据。
   * 合并前宿主会自动备份一份 state.backup-merge-*.json，所以这一步是可回退的。
   */
  const refreshDuplicates = React.useCallback(() => {
    // 直接拉原始响应：这是后台的一次补充查询，不能走 api() —— 走 api() 会把失败塞进
    // 全局 error 并覆盖掉「读不到日历 + 重试」这类主流程的错误提示。
    fetch(`${API}/duplicates`, { headers: { accept: 'application/json' } })
      .then(response => (response.ok ? response.json() : { duplicates: [] }))
      .then(next => setDuplicates(Array.isArray(next?.duplicates) ? next.duplicates : []))
      .catch(() => setDuplicates([]))
  }, [])
  // 每次事项集合变化后重算「重复记录」。state 是整份 JSON：列表内容没变也要刷新，
  // 但重复项只取决于 items，所以用它当依赖，避免刷新（重新拉 state）时重复请求一遍。
  // 内容签名把 id 串起来，增删改都会变；sort 避免顺序抖动。
  const itemsKey = React.useMemo(() => items.map(item => item.id).sort().join('|'), [items])
  React.useEffect(() => { if (items.length) refreshDuplicates() }, [itemsKey, refreshDuplicates])
  const mergeDuplicates = async keys => {
    const list = keys ? duplicates.filter(plan => keys.includes(plan.key)) : duplicates
    if (!list.length) return
    const nodes = list.reduce((sum, plan) => sum + (plan.ids?.length || 0), 0)
    if (!window.confirm(`把 ${list.length} 组、共 ${nodes} 条重复记录合并成 ${list.length} 条？\n合并前会自动备份当前 JSON，不会丢数据。`)) return
    setBusy(true); setError('')
    try {
      const next = await api('duplicates/merge', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ keys: keys || undefined }) })
      setState(next.state)
      setDuplicates([])
      notify(`已合并 ${next.merged?.length || 0} 组重复记录${next.backup ? '，原文件已备份' : ''}`)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  /**
   * 标重要程度：把某个节点标成 1-4 档，月历格的底色和胶囊边的粗细立刻跟着变。
   * level=null 回到「按节点类型自动推断」，不是又设了一个新等级。
   * 宿主没升级到 items/level 时（旧进程）退回 PUT items/:id，改等级不该依赖版本。
   */
  const setLevel = async (item, nodeId, level) => {
    setBusy(true); setError('')
    try {
      let next
      try {
        next = await api('items/level', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id, nodeId, level }) })
      } catch (direct) {
        const patch = { ...item, nodes: (item.nodes || []).map(node => {
          if (nodeId && node.id !== nodeId) return node
          if (level === null) { const { level: _drop, ...rest } = node; return rest }
          return { ...node, level }
        }) }
        next = await api(`items/${encodeURIComponent(item.id)}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ item: patch }) }).catch(() => { throw direct })
      }
      setState(next)
      // 详情面板开着的时候同步刷新：用户刚点的那一档要立刻显示为选中
      setSelected(current => current ? next.items.find(entry => entry.id === current.id) || current : current)
      notify(level ? `已标记为「${LEVEL_LABELS[level]}」` : '已恢复自动等级')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const ungroup = async item => {
    setBusy(true); setError('')
    try {
      setState(await api('items/unlink', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id }) }))
      setSelected(null); notify('已拆开这一组记录')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
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
        h('p', null, `共 ${coverage.total} 项，已锚定 ${coverage.percent}%。只到月份或年份的不算锚定：让 Agent 去官网查确切日期，查不到就如实留空。`)),
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
      notify('已在新对话里填好草稿，补充内容后发送即可')
    } catch (e) {
      setAskError(`没能开新对话：${e.message}`)
    } finally { setAsking(false) }
  }

  /**
   * 站内提醒：用户点过「设置站内提醒」的事项，只要 7 天内有节点要到期，就在这里汇总出来。
   * 之前这个开关只是把 id 存进 state.reminders 就完事，从来没有任何地方去读它 ——
   * 名字叫提醒却什么都不提醒，比没有这个按钮更糟。现在至少在打开插件时能看到。
   */
  const reminderDue = React.useMemo(() => {
    const today = todayIso()
    const wanted = new Set(state?.reminders || [])
    if (!wanted.size) return []
    const rows = []
    for (const entry of timelineEntries(items)) {
      if (!wanted.has(entry.item.id)) continue
      const mark = nextMark(entry, today)
      if (!mark) continue
      const offset = daysBetween(today, mark.date)
      if (offset > 7) continue
      rows.push({ item: entry.item, mark, offset })
    }
    return rows.sort((a, b) => a.mark.date.localeCompare(b.mark.date))
  }, [items, (state?.reminders || []).join('\u0000'), todayIso()])

  const navigation = h('nav', { className: 'cc-side-nav', 'aria-label': '主导航' }, [
    ['calendar', '日历', 'calendar'], ['favorites', '已收藏', 'star'], ['manage', '数据维护', 'edit'],
  ].map(([id, label, icon]) => h('button', { key: id, className: view === id ? 'active' : '', onClick: () => setView(id), 'aria-current': view === id ? 'page' : undefined }, h(Icon, { name: icon }), h('span', null, label),
    // 提醒数挂在导航上：这是「我设的提醒真的有用」的唯一证据，藏在详情页里等于没做
    id === 'calendar' && reminderDue.length ? h('span', { className: 'cc-nav-badge', 'aria-label': `${reminderDue.length} 项即将到期` }, reminderDue.length) : null)))

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
    h('div', { className: 'cc-segment', role: 'group', 'aria-label': '视图模式' }, MODES.map(([value, label]) => h('button', { key: value, className: mode === value ? 'selected' : '', 'aria-pressed': mode === value, onClick: () => setMode(value) }, label))),
  )

  // 月历格里的标签：文字是「简称」而不是全标题（旧版只显示标题首字，等于没写），
  // 颜色按事项分，起止用一个小点/一条杠区分。悬浮出摘要卡，点击开详情。
  const EDGE_LABELS = { registration: '起', registration_deadline: '止', competition: '起', exam: '起', submission: '起', result: '出' }
  // 一格最多显示几条：多出来的收成「+N」。90px 高的格子里三行刚好，再多就开始糊成一片
  const VISIBLE_CHIPS = 3
  const eventChip = (item, node, edge = null) => {
    const confidence = confidenceLabel(item, node)
    const uncertain = node.confidence === 'predicted' || node.confidence === 'pending_confirmation'
    const edgeText = edge === 'end' ? '截止' : edge === 'start' ? '开始' : ''
    const alias = shortName(item)
    // 核验过期的日期不该看起来和刚查过的一样可信：给胶囊一个可勾的标记，样式上退一档
    const stale = verificationState(item, new Date(`${todayIso()}T00:00:00Z`)).state === 'stale'
    return h('button', {
      key: `${item.id}-${node.id}-${edge || 'day'}`,
      className: `cc-chip ${uncertain ? 'uncertain' : ''} ${item.demo ? 'demo' : ''} ${edge || ''}`,
      'data-color': node.color || tagColor(item),
      'data-level': levelOf(node, edge),
      'data-node': node.type,
      'data-edge': edge || undefined,
      'data-stale': stale ? 'true' : undefined,
      onClick: () => setSelected(item),
      onFocus: event => setHover({ item, node, x: 260, y: clampY(event.currentTarget) }),
      onBlur: () => setHover(null),
      title: `${item.title} · ${NODE_LABELS[node.type] || node.type}${edgeText ? `（${edgeText}）` : ''} · ${confidence.label}${stale ? ' · 日期很久没核对了' : ''}`,
      'aria-label': `${item.title}，${NODE_LABELS[node.type] || node.type}，${nodeRangeText(node)}${edgeText ? `，${edgeText}` : ''}，${confidence.label}`,
    }, h('span', { className: 'cc-chip-edge', 'aria-hidden': true }), h('span', { className: 'cc-chip-text' }, alias))
  }
  // 一格被多个事项覆盖时只染一次色：取最紧急的节点等级；截止日一律按最高等级算。
  // 用户手动标的 level 优先于按节点类型推断出来的默认档 —— 那是他自己对这个日子的判断。
  const levelOf = (node, edge) => nodeLevel(node, edge)
  const dayLevel = indexedNodes => indexedNodes.reduce((level, row) => Math.max(level, levelOf(row.node, row.edge)), 0)
  const cells = React.useMemo(() => monthCells(month), [month.getFullYear(), month.getMonth()])
  // 日期还没落到某一天的节点：不编日期，单独一条横带放在月历上方。
  // 放上面是因为它常常是本月的主要内容 —— 压在月历底下会让人以为这个月没事。
  const floating = React.useMemo(() => monthFloating(visible, month), [viewKey, month.getFullYear(), month.getMonth()])
  // 「全年滚动」那几条（没有统一档期、随时能报的）单独压成一行：
  // 它们每个月都命中，混在主列表里会把真正这个月要办的事挤下去。
  const floatingMain = floating.filter(row => row.kind !== 'year')
  const floatingRolling = floating.filter(row => row.kind === 'year')
  const floatingChip = ({ item, node, kind }) => h('button', {
    key: `${item.id}-${node.id}`,
    type: 'button',
    className: `cc-floating-chip ${node.confidence === 'predicted' || node.confidence === 'pending_confirmation' ? 'uncertain' : ''}`,
    'data-color': node.color || tagColor(item),
    'data-level': levelOf(node, null),
    'data-kind': kind,
    title: `${item.title} · ${NODE_LABELS[node.type] || node.type} · ${floatingWhen(node, kind)} · ${confidenceLabel(item, node).label}`,
    onClick: () => setSelected(item),
  }, h('span', { className: 'cc-chip-edge', 'aria-hidden': true }), h('span', { className: 'cc-floating-text' }, shortName(item)),
    kind === 'year' ? null : h('span', { className: 'cc-floating-when' }, floatingWhen(node, kind)),
    h('span', { className: 'cc-floating-type' }, NODE_LABELS[node.type] || node.type))
  const floatingBand = floating.length ? h('div', { className: 'cc-floating', 'aria-label': '本月日期还没定准的事项' },
    floatingMain.length ? h('div', { className: 'cc-floating-head' },
      h('span', { className: 'cc-floating-kicker' }, '还没落到某一天'),
      h('span', { className: 'cc-floating-hint' }, `这 ${floatingMain.length} 项只知道大致档期，点开可以补上具体日子`)) : null,
    floatingMain.length ? h('div', { className: 'cc-floating-list' }, [...floatingMain].sort((a, b) => levelOf(b.node, null) - levelOf(a.node, null) || (a.node.start || '').localeCompare(b.node.start || '')).map(floatingChip)) : null,
    floatingRolling.length ? h('div', { className: 'cc-floating-rolling' },
      h('span', { className: 'cc-floating-kicker' }, '全年滚动'),
      h('span', { className: 'cc-floating-hint' }, '这几项没有统一档期，随时能报，不占具体日子'),
      h('div', { className: 'cc-floating-list' }, floatingRolling.map(floatingChip))) : null) : null
  // 这个月有多少天是真的有安排（用来判断要不要给空月历一句解释）
  const busyDays = React.useMemo(() => {
    let count = 0
    for (const date of cells) if ((monthIndex.get(isoDate(date)) || []).length) count += 1
    return count
  }, [cells, monthIndex])
  // 长窗口（报名开一整月、省赛跨两个月）不占某一天的格子，也不在上面铺底色 ——
  // 试过用斜纹标出「这段时间都在办」，结果 4 条全年滚动的窗口把整张月历糊满，
  // 真实日期的对比度反而被压没了。它们只出现在上面的横带里，格子里只留真正的那一天。
  const calendar = React.useMemo(() => h('section', { className: 'cc-calendar', 'aria-label': monthTitle(month) },
    // 整月没有任何确定日期的安排时，别让人对着一片空白发懵 —— 说清楚是「没排」还是「还没定日子」。
    // 把模糊档期挤进格子会造出假日期，那才是更糟的。放在网格上面，否则网格比屏幕还高，看不到。
    busyDays === 0 && h('p', { className: 'cc-grid-empty' }, floating.length
      ? `这个月还没有落到某一天的安排。上面 ${floating.length} 项只有大致档期，点开可以补上具体日子。`
      : '这个月没有安排。'),
    h('div', { className: 'cc-calendar-legend', 'aria-label': '日历等级' }, [['1', '一般'], ['2', '准备'], ['3', '重要'], ['4', '截止']].map(([level, label]) => h('span', { key: level, 'data-level': level }, label))),
    h('div', { className: 'cc-weekdays' }, WEEKDAYS.map((name, index) => h('span', { key: name, className: index > 4 ? 'weekend' : '' }, name))),
    h('div', { className: 'cc-grid', role: 'group', 'aria-label': `${monthTitle(month)}，共 ${cells.length} 天` }, cells.map(date => {
      const iso = isoDate(date)
      const indexedNodes = monthIndex.get(iso) || []
      // 同一天可能既是某事的报名截止又是另一事的比赛开始；同一个事项只出一行，优先显示截止。
      const chips = monthChips(indexedNodes)
      const isToday = iso === today
      const level = dayLevel(indexedNodes)
      // 有安排的日子必须一眼看出来：加一个 has-events 类（左侧色条 + 更实的底色 + 计数角标），
      // 而不是只靠胶囊本身 —— 用户的原话是「这个日历目前还是很空，看不出重点」。
      return h('div', { key: iso, className: `cc-day ${date.getMonth() !== month.getMonth() ? 'outside' : ''} ${selectedDate === iso ? 'chosen' : ''} ${isToday ? 'today' : ''} ${chips.length ? 'has-events' : ''}`, 'data-level': level || undefined, 'data-count': chips.length || undefined },
        h('button', { className: 'cc-day-number', onClick: () => { setSelectedDate(iso); setMemoDraft(null); setEventDraft(null) }, 'aria-pressed': selectedDate === iso, 'aria-label': `${iso}，${chips.length} 项` }, date.getDate()),
        // 42 个格子各挂一个「+」，鼠标悬停才浮现；让它们留在 Tab 序列里会让键盘用户按 42 次才能离开月历。
        // 键盘路径是：Tab 到日期按钮 → 选中某天 → 侧栏顶部就有「新增」（openCalendarEvent）。
        h('button', { type: 'button', className: 'cc-day-add', tabIndex: -1, 'aria-hidden': true, 'data-date': iso, onClick: () => openCalendarEvent(iso) }, h(Icon, { name: 'plus' })),
        h('div', { className: 'cc-day-events' }, chips.slice(0, VISIBLE_CHIPS).map(({ item, node, edge }) => eventChip(item, node, edge)), chips.length > VISIBLE_CHIPS ? h('button', { type: 'button', className: 'cc-more', onClick: () => { setSelectedDate(iso); setSelected(null) }, 'aria-label': `${iso} 共 ${chips.length} 项，展开侧栏` }, `+${chips.length - VISIBLE_CHIPS}`) : null))
    }))), [cells, monthIndex, month, selectedDate, today, floating, busyDays])
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
            h('time', null, entry ? whenText(entry, next) : firstWindowText(item)),
            h('span', { className: 'cc-agenda-alias', 'aria-hidden': true }, item.category === 'memo' ? '备忘' : shortName(item)),
            h('strong', null, item.title),
            cardNote(item, cardsOf) && h('small', { className: 'cc-agenda-note' }, cardNote(item, cardsOf)),
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
      // 简称只在「和全名不一样」的时候才占一格，否则白占一行、还显得重复
      h('strong', null, item.title, shortName(item) !== item.title && h('span', { className: 'cc-list-alias' }, shortName(item))),
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
          h('small', null, cardNote(item, cardsOf) || item.organizer || item.description || '未填写主办方')),
        h('span', { className: `cc-confidence ${item.demo || entry.kind !== 'dated' ? 'uncertain' : ''}` }, entry.label))
    }) : h('div', { className: 'cc-empty small' }, '还没有安排。可以让 Agent 补几条，或自己新增。'))
  // 年视图：一屏 12 个小月历，有安排的日子直接上色 —— 用来回答「这一年到底有哪些比赛」。
  // 索引复用月历同一份 buildMonthIndex，所以「哪天进格子、哪天不进」跟月历完全一致，不会两套口径。
  const yearView = React.useMemo(() => {
    const year = month.getFullYear()
    const months = Array.from({ length: 12 }, (unused, index) => {
      const cursor = new Date(year, index, 1)
      const prefix = `${year}-${String(index + 1).padStart(2, '0')}`
      const rowsOf = buildMonthIndex(visible, cursor)
      const marks = new Map()
      // 月历索引取的是 42 天网格，会带上前后月的日子；年视图按自然月统计，只收本月那几天，
      // 否则同一场 2/28 的比赛会同时算进 2 月和 3 月，年度总数虚高。
      for (const [iso, rows] of rowsOf) {
        if (!iso.startsWith(prefix)) continue
        marks.set(iso, { count: rows.length, level: Math.max(...rows.map(row => levelOf(row.node, row.edge))) })
      }
      return { index, cells: yearMonthCells(year, index), marks }
    })
    const busy = months.reduce((sum, entry) => sum + entry.marks.size, 0)
    return { year, months, busy }
  }, [viewKey, month.getFullYear()])
  const yearDayCell = (year, index, marks) => (date, slot) => {
    if (date === null) return h('span', { key: `pad-${slot}`, className: 'cc-year-day empty' })
    const iso = isoDate(date)
    const mark = marks.get(iso)
    return h('button', {
      key: iso,
      type: 'button',
      className: `cc-year-day ${mark ? 'has-events' : ''}`,
      'data-level': mark?.level || undefined,
      'aria-label': mark ? `${iso}，${mark.count} 项` : iso,
      title: mark ? `${iso} · ${mark.count} 项` : iso,
      onClick: () => { setMonth(new Date(year, index, 1)); setSelectedDate(iso); setMode('month') },
    }, date.getDate())
  }
  const yearMode = h('section', { className: 'cc-year', 'aria-label': `${yearView.year} 年总览` },
    h('div', { className: 'cc-year-head' },
      h('div', null,
        h('h2', null, `${yearView.year} 年`),
        h('p', null, yearView.busy ? `这一年有 ${yearView.busy} 天排了事，点某个月就跳到那个月的月历。` : '这一年还没有落到具体日子的安排。')),
      h('div', { className: 'cc-year-actions' },
        h('button', { type: 'button', className: 'icon-button', 'aria-label': '上一年', onClick: () => setMonth(new Date(yearView.year - 1, month.getMonth(), 1)) }, h(Icon, { name: 'back' })),
        h('button', { type: 'button', className: 'cc-button', onClick: () => setMonth(new Date()) }, '回到今年'),
        h('button', { type: 'button', className: 'icon-button', 'aria-label': '下一年', onClick: () => setMonth(new Date(yearView.year + 1, month.getMonth(), 1)) }, h(Icon, { name: 'forward' })))),
    h('div', { className: 'cc-year-grid' },
      yearView.months.map(({ index, cells, marks }) => h('div', { key: index, className: `cc-year-month ${index === month.getMonth() ? 'current' : ''}` },
        h('button', { type: 'button', className: 'cc-year-label', onClick: () => { setMonth(new Date(yearView.year, index, 1)); setMode('month') } }, `${index + 1} 月`),
        h('div', { className: 'cc-year-days' }, cells.map(yearDayCell(yearView.year, index, marks)))))))
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
  const toolbarWithCalendar = view === 'calendar' && mode === 'month' ? h('div', { className: 'cc-month-head' }, h('div', null, h('h2', null, monthTitle(month)), profile.major && h('p', null, profileSummary)), h('div', { className: 'cc-month-actions' }, h('button', { className: 'icon-button', onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)), 'aria-label': '上个月' }, h(Icon, { name: 'back' })), h('button', { className: 'cc-button', onClick: () => setMonth(new Date()), 'aria-label': '返回本月' }, h(Icon, { name: 'today' }), '今天'), h('button', { className: 'cc-button', onClick: () => setMode('year'), 'aria-label': '看全年总览' }, '全年'), h('button', { className: 'icon-button', onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)), 'aria-label': '下个月' }, h(Icon, { name: 'forward' })))) : null
  // 提醒条：只在日历页出现，且只列 7 天内到期的。点一下直接开详情，用户能立刻决定去不去。
  const reminderBand = view === 'calendar' && reminderDue.length
    ? h('section', { className: 'cc-reminder-band', 'aria-label': '即将到期的提醒' },
      h('div', { className: 'cc-reminder-head' }, h('strong', null, '你设了提醒，这些快到了'),
        h('span', null, reminderDue.map(row => `${shortName(row.item)} ${row.offset === 0 ? '今天' : row.offset > 0 ? `${row.offset} 天后` : `已过 ${-row.offset} 天`}`).join(' · '))),
      h('div', { className: 'cc-reminder-list' }, reminderDue.slice(0, 4).map(row => h('button', {
        key: `${row.item.id}-${row.mark.date}`,
        className: 'cc-reminder-chip',
        'data-level': levelOf(row.mark.node, row.mark.edge),
        onClick: () => setSelected(row.item),
        title: `${row.item.title} · ${NODE_LABELS[row.mark.node.type] || row.mark.node.type} · ${row.mark.date}`,
      }, h('span', { className: 'cc-reminder-when' }, row.mark.date.slice(5).replace('-', '/')), h('span', null, shortName(row.item))))))
    : null

  const resultView = h(React.Fragment, null,
    view === 'calendar' && mode === 'year' ? yearMode : null,
    view === 'calendar' && mode === 'month' ? toolbarWithCalendar : null,
    reminderBand,
    view === 'calendar' && mode === 'month' ? h(React.Fragment, null,
      h('div', { className: 'cc-calendar-tools' }, h('button', { type: 'button', className: 'cc-button', 'aria-expanded': showTools, onClick: () => setShowTools(!showTools) }, showTools ? '收起工具' : '搜索与视图'),
        // 字号档位：一排小按钮，切一下就能看清 / 塞下更多
        h('div', { className: 'cc-density', role: 'group', 'aria-label': '月历字号' }, [['compact', '紧凑'], ['cozy', '标准'], ['roomy', '宽松']].map(([value, label]) => h('button', { key: value, type: 'button', className: density === value ? 'selected' : '', 'aria-pressed': density === value, onClick: () => setDensity(value) }, label)))),
      showTools && h(React.Fragment, null, toolbar, coverageHint, conversationHint),
      h('div', { className: 'cc-calendar-layout' }, h('div', { className: 'cc-calendar-stack' }, floatingBand, calendar), agenda)) : null,
    view !== 'calendar' || (mode !== 'month' && mode !== 'year') ? h(React.Fragment, null,
      showFilters && filterPanel,
      h('label', { className: 'cc-toggle cc-mobile-suitable' }, h('input', { type: 'checkbox', checked: filters.onlySuitable, onChange: event => setFilters(current => ({ ...current, onlySuitable: event.target.checked })) }), h('span', null, '只看适合我')),
      visible.length === 0 ? h('div', { className: 'cc-empty' }, h('div', { className: 'cc-empty-mark' }, '0'), h('h2', null, '没有找到匹配事项'), h('p', null, '尝试清除筛选，或调整关键词、类别与日期范围。'), h('button', { className: 'cc-button', onClick: clearFilters }, '清除筛选'))
        : mode === 'list' || view !== 'calendar' ? list : mode === 'upcoming' ? timeline : h('div', { className: 'cc-calendar-layout' }, calendar, agenda),
      suggestionPanel) : null,
  )
  const profileSetup = !profile.major && view === 'calendar' ? h('div', { className: 'cc-profile-banner' }, h('div', null, h('strong', null, '先完善个人档案'), h('p', null, '填写专业与关注方向，筛出更适合你的事项。')), h('button', { className: 'cc-button primary', onClick: () => setView('manage') }, '设置档案')) : null
  const blankItem = () => ({ id: '', title: '', category: 'competition', description: '', organizer: '', eligibility: '', majors: [], interests: [], years: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', notes: '', demo: false, nodes: [{ id: crypto.randomUUID(), type: 'registration', start: null, end: null, confidence: 'unknown', note: '' }] })
  const manage = view === 'manage' ? h(ManageView, { state, profile, busy, error, duplicates, onMerge: mergeDuplicates, onSaveProfile: patchProfile, onEdit: item => setEditing(item || blankItem()), onImport: () => importRef.current?.click(), onExport: () => exportFile('json') }) : null
  const detail = selected && h(Detail, { item: selected, cards: cardsOf.get(selected) || [selected], profile, busy, favorite: (cardsOf.get(selected) || [selected]).some(card => state.favorites.includes(card.id)), reminder: (cardsOf.get(selected) || [selected]).some(card => state.reminders.includes(card.id)), onClose: () => setSelected(null), onFavorite: () => toggleFavorite(selected), onReminder: () => toggleReminder(selected), onEdit: () => { setEditing(selected); setSelected(null) }, onUngroup: cardsOf.get(selected)?.length > 1 ? () => ungroup(selected) : null, onLevel: setLevel })
  const itemEditor = editing && h(ItemEditor, { item: editing, busy, onClose: () => setEditing(null), onSave: saveItem, onDelete: async item => { if (!window.confirm(`删除“${item.title}”？删掉后会有一条通知，8 秒内可以撤销。`)) return; try { setState(await api(`items/${encodeURIComponent(item.id)}`, { method: 'DELETE' })); setEditing(null); notify('事项已删除'); const snapshot = item; offerUndo(`已删除「${snapshot.title}」`, async () => { setState(await api('items', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ item: snapshot }) })) }) } catch (e) { setError(e.message) } } })

  if (loading && !state) return h('div', { className: 'cc-shell cc-state', role: 'status' }, '正在读取本地日历…')
  if (error && !state) return h('div', { className: 'cc-shell cc-state' }, h('h1', null, '无法读取日历'), h('p', null, error), h('button', { className: 'cc-button primary', onClick: load }, '重试'))

  return h('div', { className: 'cc-shell', 'data-density': density },
    h('style', null, styles),
    h('aside', { className: 'cc-sidebar' }, h('div', { className: 'cc-brand' }, h('span', { className: 'cc-brand-mark' }, 'C'), h('span', null, h('strong', null, '校历'), h('small', null, '赛事与证书'))), navigation, h('div', { className: 'cc-sidebar-foot' }, h('span', { className: 'cc-local-dot' }), '本地数据 · 手动维护')),
    h('main', { className: 'cc-main' }, h('header', { className: 'cc-topbar' }, h('div', null, h('p', { className: 'cc-eyebrow' }, 'CAMPUS OPPORTUNITIES'), h('h1', null, headerTitle)), h('div', { className: 'cc-top-actions' }, h(StarButton, { className: 'cc-button' }), h('button', { className: 'cc-button cc-refresh', onClick: () => load(), disabled: loading, 'aria-label': loading ? '正在刷新日历' : '刷新日历', title: '刷新日历' }, h('span', { 'aria-hidden': true }, loading ? '…' : '↻')), h('button', { className: 'cc-button', onClick: () => exportFile('ics') }, '导出 ICS'), view !== 'manage' && h('button', { className: 'cc-button primary', onClick: () => setEditing(blankItem()) }, h(Icon, { name: 'plus' }), '新增事项'))),
      error && h('div', { className: 'cc-alert', role: 'alert' }, error, h('button', { onClick: () => setError(''), 'aria-label': '关闭提示' }, h(Icon, { name: 'close' }))),
      // role=status + aria-live=polite：动态出现的提示对读屏器要播报，否则只有首次挂载才会读
      h('div', { className: 'cc-notice-slot', 'aria-live': 'polite', 'aria-atomic': 'true' },
        notice && h('div', { className: 'cc-notice', role: 'status' }, notice, h('button', { onClick: () => notify(''), 'aria-label': '关闭提示' }, h(Icon, { name: 'close' }))),
        undo && h('div', { className: 'cc-undo', role: 'status' }, h('span', null, undo.message),
          h('button', {
            type: 'button', className: 'cc-undo-action', onClick: async () => {
              dismissUndo()
              try { await undo.restore(); notify('已撤销删除') } catch (e) { setError(e.message) }
            },
          }, '撤销'),
          h('button', { type: 'button', className: 'cc-undo-close', onClick: dismissUndo, 'aria-label': '关闭撤销提示' }, h(Icon, { name: 'close' })))),
      view === 'manage' ? manage : h(React.Fragment, null, view === 'calendar' && mode === 'month' ? null : profileSetup, view === 'calendar' && mode === 'month' ? null : toolbar, view === 'calendar' && mode === 'month' ? null : conversationHint, resultView),
       memoDraft && h('div', { className: 'cc-memo-modal-backdrop', onClick: event => { if (event.target === event.currentTarget) setMemoDraft(null) } }, h('div', { className: 'cc-memo-modal', role: 'dialog', 'aria-modal': true, 'aria-label': memoDraft.id ? '编辑备忘' : '新增备忘', ref: memoDialogRef, tabIndex: -1 }, memoForm)),
      h('input', { ref: importRef, className: 'sr-only', type: 'file', accept: 'application/json,.json', onChange: importFile }),
      hover && (mode !== 'list' || view !== 'calendar') ? hoverCard : null,
    ), detail, itemEditor)
}

function ManageView({ state, profile, busy, error, duplicates = [], onMerge, onSaveProfile, onEdit, onImport, onExport }) {
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
    // 重复记录：同一赛事被写成多条时，先把「合并」摆出来，而不是让用户自己在几十行里找
    h('section', { className: 'cc-section' },
      h('div', { className: 'cc-section-head' }, h('div', null, h('h2', null, '重复记录'), h('p', null, duplicates.length ? `发现 ${duplicates.length} 组看起来是同一个赛事的记录：合并后月历只出现一次，节点全部保留。` : '没有发现可以合并的重复记录。同一年只保留一条，场次型考试（CSP、软考、四六级）不在此列。')), duplicates.length ? h('button', { className: 'cc-button primary', disabled: busy, onClick: () => onMerge() }, '全部合并') : null),
      duplicates.length ? h('div', { className: 'cc-dupe-list' }, duplicates.map((plan, index) => h('div', { className: 'cc-dupe-row', key: plan.key || index }, h('div', null, h('strong', null, plan.title || plan.titles?.[0] || '未命名'), h('small', null, `${(plan.ids || []).length} 条记录 · ${plan.nodeCount || 0} 个节点 · ${plan.labels?.join(' / ') || ''}`), h('ul', null, (plan.titles || []).map((title, row) => h('li', { key: row }, title)))), h('button', { className: 'cc-button', disabled: busy, onClick: () => onMerge(plan.key ? [plan.key] : undefined) }, '合并这组')))) : null),
    h('section', { className: 'cc-section' }, h('div', { className: 'cc-section-head' }, h('div', null, h('h2', null, '数据维护'), h('p', null, '录入可追溯来源的数据，或备份本地 JSON。')), h('div', { className: 'cc-row-actions' }, h('button', { className: 'cc-button', onClick: onImport }, '导入 JSON'), h('button', { className: 'cc-button', onClick: onExport }, '导出 JSON'), h('button', { className: 'cc-button primary', onClick: () => onEdit(null) }, h(Icon, { name: 'plus' }), '新增事项'))),
      h('div', { className: 'cc-data-list' }, state.items.map(item => h('div', { className: 'cc-data-row', key: item.id }, h('span', { className: `cc-tag ${item.category}`, 'data-color': tagColor(item) }, item.category === 'competition' ? '赛事' : '证书'), h('strong', null, item.title), h('span', { className: 'cc-confidence' }, confidenceLabel(item, item.nodes?.[0] || {}).label), h('button', { className: 'icon-button', 'aria-label': `编辑${item.title}`, onClick: () => onEdit(item) }, h(Icon, { name: 'edit' }))))),
      h('p', { className: 'cc-data-disclaimer' }, '没有赛事 API 或自动抓取。真实记录须填写官方来源 URL 与最近核验日期；预测日期需说明依据。站内提醒不等于系统通知。')),
  )
}

function Detail({ item, cards = [], profile, favorite, reminder, onClose, onFavorite, onReminder, onEdit, onUngroup, onLevel, busy }) {
  const fit = scoreFit(item, profile)
  const today = todayIso()
  const marks = item.nodes || []
  const alias = itemAlias(item)
  const dialogRef = useDialogFocus()
  // 核验日期不是「填过就行」：赛事日期一年一换，去年的核验今年等于没核验。
  const verify = verificationState(item, new Date(`${today}T00:00:00Z`))
  const verifyText = verify.state === 'unknown' ? '未核验'
    : verify.state === 'fresh' ? `${item.verifiedAt}（${verify.days} 天前）`
      : `${item.verifiedAt}（${verify.days} 天前，该重新核对）`
  return h('div', { className: 'cc-overlay', role: 'presentation', onMouseDown: event => { if (event.target === event.currentTarget) onClose() } }, h('section', { className: 'cc-dialog', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'cc-detail-title', ref: dialogRef, tabIndex: -1 },
    h('div', { className: 'cc-dialog-head' }, h('span', { className: `cc-tag ${item.category}`, 'data-color': tagColor(item) }, item.category === 'competition' ? '赛事' : '证书'), h('button', { className: 'icon-button', onClick: onClose, 'aria-label': '关闭详情' }, h(Icon, { name: 'close' })), h('h2', { id: 'cc-detail-title' }, item.title),
      item.demo && h('p', { className: 'cc-demo-notice' }, '这条是演示数据，不代表真实活动、近期报名或已核验安排')),
    h(Thumb, { item, size: 'hero' }),
    h('div', { className: 'cc-dialog-actions' }, h('button', { className: 'cc-button', onClick: onFavorite }, `${favorite ? '★' : '☆'} ${favorite ? '已收藏' : '收藏'}`), h('button', { className: 'cc-button', onClick: onReminder }, reminder ? '已设站内提醒' : '设置站内提醒'), h('button', { className: 'cc-button', onClick: onEdit }, '编辑')),
    h('dl', { className: 'cc-detail-grid' }, [['简介', item.description], ['适合人群', [...(item.majors || []), ...(item.years || []), ...(item.interests || [])].join('、') || item.eligibility], ['主办方', item.organizer], ['承办 / 账号', item.artist], ['地点', item.venue], ['报名条件', item.eligibility], ['适配度', `${fit.score}% · ${fit.reasons.join('、') || '暂无匹配信息'}`], ['报名状态', REGISTRATION_LABELS[item.registrationStatus] || '未知'], ['最近核验', verifyText], ['备注', item.notes]].map(([label, value]) => h('div', { key: label }, h('dt', null, label), h('dd', null, value || '未提供')))),
    // 核验过期要说清楚该怎么办，不能只给一个灰字日期让用户自己算
    verify.state !== 'fresh' && h('p', { className: 'cc-verify-hint', 'data-state': verify.state }, verify.state === 'unknown'
      ? '这条还没有核验日期。日期来自哪里、什么时候核对的，是这份日历唯一可信的依据。'
      : `上次核验是 ${verify.days} 天前。赛事日期每年都变，建议去官网重新确认一遍再信它。`),
    h('section', { className: 'cc-node-list' }, h('div', { className: 'cc-section-title' }, h('h3', null, '关键节点'), h('span', { className: 'cc-section-count' }, `${marks.length} 个${alias.alias !== item.title ? ` · 简称 ${alias.alias}` : ''}`)), marks.length ? marks.map(node => {
      const confidence = confidenceLabel(item, node)
      // 倒计时按「什么时候用得上」算：截止类节点挂在终点（最后一天），其余挂在起点。
      // 跨天报名期若按起点算，天天显示「已过 20 天」，反而盖住了真正要盯的截止日。
      const { from, to } = nodeWindow(node)
      const anchor = to && (node.type === 'registration_deadline' || node.type === 'submission') ? to : (from || to)
      const offset = anchor ? dayDistance(today, anchor) : null
      const rangeNote = from && to && from !== to && anchor === to ? '截止日' : ''
      return h('article', { key: node.id, 'data-color': node.color || tagColor(item), 'data-level': nodeLevel(node, null) },
        h('div', null, h('strong', null, NODE_LABELS[node.type] || node.type), h('span', { className: `cc-confidence ${confidence.label === '预测' || confidence.label === '待确认' || confidence.label === '日期未知' ? 'uncertain' : ''}` }, confidence.label)),
        h('p', null, nodeRangeText(node), offset !== null && offset !== undefined ? h('span', { className: 'cc-node-distance' }, ` · ${rangeNote ? `${rangeNote} ` : ''}${distanceText(offset)}`) : null),
        h('small', null, confidence.detail),
        node.color && h('small', null, `标签色：${node.color}`),
        // 用户自己给这个日子定重要程度：点一下，月历格的底色就跟着变，不用去编辑表单里翻
        onLevel && h('div', { className: 'cc-level-picker', role: 'group', 'aria-label': `${NODE_LABELS[node.type] || node.type}的重要程度` },
          h('span', { className: 'cc-level-label' }, '重要程度'),
          // 档位选中态要反映「当前生效的等级」：手动设过就用手动的，没设过就用按节点类型推断的，
          // 并用 .implied 标出来 —— 否则四个按钮全是未选中，用户看不出这件事现在到底算几级。
          [1, 2, 3, 4].map(level => h('button', {
            key: level, type: 'button', disabled: busy,
            className: `cc-level-option ${nodeLevel(node, null) === level ? 'selected' : ''} ${(node.level || 0) !== level && nodeLevel(node, null) === level ? 'implied' : ''}`,
            'data-level': level,
            'aria-pressed': nodeLevel(node, null) === level,
            title: LEVEL_HINTS[level],
            onClick: () => onLevel(item, node.id, (node.level || 0) === level ? null : level),
          }, h('span', { className: 'cc-level-dot', 'aria-hidden': true }), LEVEL_LABELS[level])),
          node.level
            ? h('button', { type: 'button', className: 'cc-level-reset', disabled: busy, onClick: () => onLevel(item, node.id, null) }, '回到自动')
            : h('span', { className: 'cc-level-auto' }, `自动算作「${LEVEL_LABELS[nodeLevel(node, null)]}」，点一下改`)))
    }) : h('p', { className: 'cc-node-empty' }, '还没有节点。')),
    h('footer', { className: 'cc-source' }, h('span', null, '官方来源'), item.sourceUrl && !item.demo ? h('a', { href: item.sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, item.sourceUrl) : h('span', null, item.demo ? '演示记录无官方来源' : '无来源 · 不得标记为已核验'),
      item.imageUrl && h('span', { className: 'cc-source-image' }, '宣传图：', h('a', { href: item.imageUrl, target: '_blank', rel: 'noopener noreferrer' }, '查看原图'))),
    // 一张卡可能由好几条记录拼起来：把原记录摊开，用户能看出「不是数据丢了，是合并展示了」
    cards.length > 1 && h('section', { className: 'cc-member-list' },
      h('div', { className: 'cc-section-title' }, h('h3', null, `同组记录 · ${cards.length} 条`), h('span', { className: 'cc-section-count' }, [[...new Set(cards.map(card => itemAlias(card).alias))].join(' / '), onUngroup && h('button', { type: 'button', className: 'text-button', onClick: onUngroup }, '全部拆开')].filter(Boolean))),
      cards.map(card => h('div', { className: 'cc-member-row', key: card.id, 'data-color': tagColor(card) }, h('strong', null, card.title), h('small', null, `${card.nodes?.length || 0} 个节点 · ${confidenceLabel(card, card.nodes?.[0] || {}).label}`))))))
}

function ItemEditor({ item, busy, onClose, onSave, onDelete }) {
  const [draft, setDraft] = React.useState(() => structuredClone(item))
  const [localError, setLocalError] = React.useState('')
  const dialogRef = useDialogFocus()
  const set = (key, value) => setDraft(current => ({ ...current, [key]: value }))
  const setNode = (index, key, value) => setDraft(current => ({ ...current, nodes: current.nodes.map((entry, row) => row === index ? { ...entry, [key]: value } : entry) }))
  const addNode = () => setDraft(current => ({ ...current, nodes: [...current.nodes, { id: crypto.randomUUID(), type: 'other', start: null, end: null, confidence: 'unknown', note: '' }] }))
  const removeNode = index => setDraft(current => ({ ...current, nodes: current.nodes.filter((_, row) => row !== index) }))
  const nodes = draft.nodes?.length ? draft.nodes : [{ id: crypto.randomUUID(), type: 'other', start: null, end: null, confidence: 'unknown', note: '' }]
  const submit = event => {
    event.preventDefault(); setLocalError('')
    const next = { ...draft, title: draft.title.trim(), alias: (draft.alias || '').trim().slice(0, 12), sourceUrl: (draft.sourceUrl || '').trim(), verifiedAt: draft.verifiedAt || '', imageUrl: (draft.imageUrl || '').trim(), nodes: nodes.map(entry => ({ ...entry, start: entry.start || null, end: entry.end || null })) }
    if (!next.alias) delete next.alias
    // 校验交给领域层同一份规则：宿主会用它拒收，表单再抄一遍迟早会漂。
    // 新建事项还没有 id，先补一个占位符，只为让校验跑完整（保存时宿主会分配真 id）。
    const probe = validateItem({ ...next, id: next.id || 'draft' })
    // 领域层的错误带 nodes[0] 这种前缀，是给日志看的；表单上直接把前缀去掉更好读
    if (!probe.ok) return setLocalError(probe.errors[0].replace(/^nodes\[\d+\]\s*/, ''))
    onSave(next)
  }
  const nodeTypeOptions = [['registration', '报名开始'], ['registration_deadline', '报名截止'], ['competition', '比赛日期'], ['exam', '考试日期'], ['submission', '材料提交'], ['result', '结果公布'], ['other', '其他']]
  const confidenceOptions = [['unknown', '日期未知'], ['official_confirmed', '官方已确认'], ['predicted', '预测'], ['pending_confirmation', '待确认']]
  const splitList = text => text.split(/[、,，]/).map(value => value.trim()).filter(Boolean)
  return h('div', { className: 'cc-overlay', role: 'presentation', onMouseDown: event => { if (event.target === event.currentTarget) onClose() } }, h('section', { className: 'cc-dialog editor', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'cc-editor-title', ref: dialogRef, tabIndex: -1 }, h('div', { className: 'cc-dialog-head' }, h('button', { className: 'icon-button', onClick: onClose, 'aria-label': '关闭表单' }, h(Icon, { name: 'close' })), h('h2', { id: 'cc-editor-title' }, draft.id ? '编辑事项' : '新增事项')),
    h('form', { className: 'cc-editor-form', onSubmit: submit },
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '基本信息'),
        h('label', { className: 'cc-field' }, h('span', null, '事项名称 *'), h('input', { required: true, maxLength: 200, value: draft.title, onChange: event => set('title', event.target.value) })),
        // 简称是月历格里唯一显示得下的字：默认给一个，用户想改成自己的叫法就改
        h('label', { className: 'cc-field' }, h('span', null, '日历简称（月历格里显示这个）'), h('input', { maxLength: 12, value: draft.alias ?? '', placeholder: `留空 = ${itemAlias(draft).alias}`, onChange: event => set('alias', event.target.value) })),
        h('label', { className: 'cc-field' }, h('span', null, '类别'), h('select', { value: draft.category, onChange: event => set('category', event.target.value) }, h('option', { value: 'competition' }, '赛事'), h('option', { value: 'certificate' }, '证书考试'))),
        h('label', { className: 'cc-field' }, h('span', null, '主办方'), h('input', { value: draft.organizer || '', maxLength: 200, onChange: event => set('organizer', event.target.value) })),
        h('label', { className: 'cc-field' }, h('span', null, '报名状态'), h('select', { value: draft.registrationStatus || 'unknown', onChange: event => set('registrationStatus', event.target.value) }, [['unknown', '未知'], ['not_open', '未开始'], ['open', '报名中'], ['closed', '已截止']].map(([value, label]) => h('option', { key: value, value }, label)))),
        h('label', { className: 'cc-field cc-span-all' }, h('span', null, '简介'), h('textarea', { value: draft.description || '', maxLength: 2000, rows: 2, onChange: event => set('description', event.target.value) }))),
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '适用范围'), h('label', { className: 'cc-field' }, h('span', null, '适配专业（逗号分隔）'), h('input', { value: (draft.majors || []).join('、'), onChange: event => set('majors', splitList(event.target.value)) })), h('label', { className: 'cc-field' }, h('span', null, '适用年级（逗号分隔）'), h('input', { value: (draft.years || []).join('、'), onChange: event => set('years', splitList(event.target.value)) })), h('label', { className: 'cc-field' }, h('span', null, '关注方向（逗号分隔）'), h('input', { value: (draft.interests || []).join('、'), onChange: event => set('interests', splitList(event.target.value)) })), h('label', { className: 'cc-field' }, h('span', null, '适用地区（逗号分隔）'), h('input', { value: (draft.regions || []).join('、'), onChange: event => set('regions', splitList(event.target.value)) })), h('label', { className: 'cc-field cc-span-all' }, h('span', null, '报名条件'), h('textarea', { rows: 2, maxLength: 2000, value: draft.eligibility || '', onChange: event => set('eligibility', event.target.value) }))),
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '来源与核验'), h('label', { className: 'cc-field' }, h('span', null, '官方来源 URL'), h('input', { type: 'url', placeholder: 'https://', value: draft.sourceUrl || '', onChange: event => set('sourceUrl', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '最近核验日期'), h('input', { type: 'date', value: draft.verifiedAt || '', onChange: event => set('verifiedAt', event.target.value) })), h('p', { className: 'cc-data-disclaimer cc-span-all' }, '官方确认必须有具体日期、HTTP(S) 来源和最近核验日期；插件不会自动访问来源。')),
      h('fieldset', { className: 'cc-editor-section' }, h('legend', null, '外观与地点'), h('label', { className: 'cc-field cc-span-all' }, h('span', null, '官方宣传图 URL'), h('input', { type: 'url', placeholder: 'https://', value: draft.imageUrl || '', onChange: event => set('imageUrl', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '承办 / 官方账号'), h('input', { maxLength: 120, value: draft.artist || '', onChange: event => set('artist', event.target.value) })), h('label', { className: 'cc-field' }, h('span', null, '比赛或考试地点'), h('input', { maxLength: 200, value: draft.venue || '', onChange: event => set('venue', event.target.value) })), h('p', { className: 'cc-data-disclaimer cc-span-all' }, '宣传图只接受 http(s) 直链，插件不下载也不缓存；没有官方图就留空，会显示色块占位。')),
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
