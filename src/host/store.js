import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, unlink as unlinkFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { validateDataset } from '../domain/model.js'

/** 备份保留份数：够回退最近几次操作，又不至于让数据目录变成垃圾场。 */
const BACKUP_KEEP = 10
/**
 * 从文件名里取时间。两套命名都在用，取不到就按 0 处理 —— 排序时被当成最老的一份，先删。
 *   state.backup-<reason>-2026-11-16T05-07-34-510Z.json（现在的 backup()）
 *   state.json.before-refresh-2026-11-13T10-18-56.344Z.bak（旧版本留下的）
 */
function backupStamp(name) {
  const iso = name.match(/(\d{4}-\d{2}-\d{2}T\d{2}[:-]\d{2}[:-]\d{2})/)
  const parsed = iso ? Date.parse(iso[1].replace(/T(\d{2})[:-](\d{2})[:-](\d{2})/, 'T$1:$2:$3Z')) : NaN
  return Number.isNaN(parsed) ? 0 : parsed
}

/** 演示数据用「未来某月 1 日 + 月份精度」，让首屏不是两条空日期；月份随时间推移自动前移。 */
function monthStart(monthsAhead) {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

/** 去掉分组标记：主卡 / 被拆出来的记录不该再挂着别的卡片的 id。 */
function stripGroup(item) {
  if (!item?.group) return item
  const { group, ...rest } = item
  return rest
}

const initial = () => ({
  version: 1,
  profile: { major: '', year: '', province: '', interests: [], types: [] },
  favorites: [], reminders: [],
  items: [
    { id: 'demo-competition', title: '演示 · 大学生创新实践赛', category: 'competition', description: '用于展示如何维护赛事事项；不代表真实活动。', organizer: '演示主办方', eligibility: '请替换为官方规则', majors: [], interests: ['创新创业'], years: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', notes: '演示数据。请录入官方来源和核验日期后再标注为官方确认。', demo: true, nodes: [{ id: 'demo-registration', type: 'registration', start: monthStart(2), end: null, accuracy: 'month', confidence: 'predicted', note: '演示用时间窗，非真实安排：示意「只知道月份也能排进日历」。' }] },
    { id: 'demo-certificate', title: '演示 · 专业能力证书考试', category: 'certificate', description: '用于展示证书考试节点编辑方式；非真实考试安排。', organizer: '演示考试机构', eligibility: '请查阅官方报考条件', majors: [], interests: ['职业发展'], years: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', notes: '演示数据。时间窗为演示用，不代表真实考试安排。', demo: true, nodes: [{ id: 'demo-exam', type: 'exam', start: monthStart(5), end: null, accuracy: 'month', confidence: 'predicted', note: '演示用时间窗，非真实安排：仅示意月份级锚点如何展示。' }] },
  ],
})

export function createStore({ dataDir = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'campus-events-calendar') } = {}) {
  const file = join(dataDir, 'state.json')
  let addQueue = Promise.resolve()
  async function readState() {
    await mkdir(dataDir, { recursive: true })
    let raw
    try { raw = await readFile(file, 'utf8') }
    catch (error) {
      if (error.code !== 'ENOENT') throw error
      const state = initial()
      await writeState(state)
      return state
    }
    let parsed
    try { parsed = JSON.parse(raw) } catch { throw new Error('本地数据文件已损坏，文件保留未覆盖；请先备份后修复或导入有效 JSON。') }
    const result = validateDataset(parsed)
    if (!result.ok) throw new Error(`本地数据校验失败，文件保留未覆盖：${result.errors.join('；')}`)
    return result.value
  }
  async function writeState(state) {
    const result = validateDataset(state)
    if (!result.ok) throw Object.assign(new Error(result.errors.join('；')), { status: 400 })
    await mkdir(dataDir, { recursive: true })
    const temp = `${file}.${process.pid}.${Date.now()}.tmp`
    try {
      await writeFile(temp, `${JSON.stringify(result.value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
      await rename(temp, file)
    } catch (error) {
      // 清理失败不能掩盖原始错误：临时文件残留只影响整洁度，写失败的真相更重要
      await unlinkFile(temp).catch(() => {})
      throw error
    }
    return result.value
  }
  async function addItem(input) {
    const operation = addQueue.then(async () => {
      const state = await readState()
      const item = { ...input, id: input?.id || randomUUID() }
      if (state.items.some(existing => existing.id === item.id)) throw Object.assign(new Error('事项 ID 已存在'), { status: 400 })
      return writeState({ ...state, items: [...state.items, item] })
    })
    addQueue = operation.catch(() => {})
    return operation
  }
  async function saveMemo({ id, date, title, description = '', level = 1 }) {
    const operation = addQueue.then(async () => {
      const state = await readState()
      const existing = id ? state.items.find(item => item.id === id && item.category === 'memo') : null
      if (id && !existing) throw Object.assign(new Error('备忘不存在'), { status: 404 })
      const memo = {
        id: existing?.id || randomUUID(), title: title.trim(), category: 'memo', memoLevel: level,
        description: description.trim(), demo: false,
        nodes: [{ id: existing?.nodes?.[0]?.id || randomUUID(), type: 'other', start: date, end: null, accuracy: 'exact', confidence: 'unknown' }],
      }
      if (!memo.title || memo.title.length > 200) throw Object.assign(new Error('标题必填且不超过 200 字'), { status: 400 })
      const items = existing ? state.items.map(item => item.id === id ? memo : item) : [...state.items, memo]
      return writeState({ ...state, items })
    })
    addQueue = operation.catch(() => {})
    return operation
  }
  async function deleteMemo(id) {
    const operation = addQueue.then(async () => {
      const state = await readState()
      if (!state.items.some(item => item.id === id && item.category === 'memo')) throw Object.assign(new Error('备忘不存在'), { status: 404 })
      return writeState({ ...state, items: state.items.filter(item => item.id !== id), favorites: state.favorites.filter(value => value !== id), reminders: state.reminders.filter(value => value !== id) })
    })
    addQueue = operation.catch(() => {})
    return operation
  }
  /**
   * 手动建组 / 拆组：只动被点的那几条记录，其余字段原样保留。
   * 组员指向的主卡必须在同一个数据集里，悬空引用会被 validateDataset 拦下。
   */
  async function relink({ primary, members = [] }) {
    const operation = addQueue.then(async () => {
      const state = await readState()
      const known = new Set(state.items.map(item => item.id))
      if (!known.has(primary)) throw Object.assign(new Error('主卡事项不存在'), { status: 404 })
      const list = [...new Set(members)].filter(id => id !== primary)
      for (const id of list) if (!known.has(id)) throw Object.assign(new Error('要合并的事项不存在'), { status: 404 })
      const items = state.items
        .filter(item => !list.includes(item.id))
        .map(item => item.id === primary ? stripGroup(item) : { ...item, group: primary })
      return writeState({ ...state, items })
    })
    addQueue = operation.catch(() => {})
    return operation
  }
  /** 把一条记录从卡片里拆出来：原来聚在它身上的记录改认上一级主卡，不会散成孤儿。 */
  async function unlink(id) {
    const operation = addQueue.then(async () => {
      const state = await readState()
      const target = state.items.find(item => item.id === id)
      if (!target) throw Object.assign(new Error('事项不存在'), { status: 404 })
      const items = state.items.map(item => {
        if (item.id === id) return stripGroup(item)
        if (item.group === id && target.group) return { ...item, group: target.group }
        return item
      })
      return writeState({ ...state, items })
    })
    addQueue = operation.catch(() => {})
    return operation
  }
  /** 改简称 / 清简称：只碰 alias 一个字段，其余原样不动。 */
  async function setAlias(id, alias) {
    const operation = addQueue.then(async () => {
      const state = await readState()
      if (!state.items.some(item => item.id === id)) throw Object.assign(new Error('事项不存在'), { status: 404 })
      const value = typeof alias === 'string' ? alias.trim() : ''
      const items = state.items.map(item => {
        if (item.id !== id) return item
        const { alias: _old, ...rest } = item
        return value ? { ...rest, alias: value } : rest
      })
      return writeState({ ...state, items })
    })
    addQueue = operation.catch(() => {})
    return operation
  }
  /**
   * 标重要程度：用户在月历里点开某场比赛就能把它标成一般/准备/重要/截止。
   * level 写在节点上（而不是事项上），因为同一个赛事「报名截止」和「比赛开始」本来就不是一个紧急度；
   * 传 null 表示回到自动推断。
   */
  async function setNodeLevel(id, nodeId, level) {
    const operation = addQueue.then(async () => {
      const state = await readState()
      const item = state.items.find(entry => entry.id === id)
      if (!item) throw Object.assign(new Error('事项不存在'), { status: 404 })
      if (nodeId && !item.nodes.some(node => node.id === nodeId)) throw Object.assign(new Error('节点不存在'), { status: 404 })
      const stamp = (node) => {
        if (nodeId && node.id !== nodeId) return node
        const { level: _old, ...rest } = node
        return level ? { ...rest, level: Number(level) } : rest
      }
      const items = state.items.map(entry => entry.id === id ? { ...entry, nodes: entry.nodes.map(stamp) } : entry)
      return writeState({ ...state, items })
    })
    addQueue = operation.catch(() => {})
    return operation
  }
  async function importState(input) {
    const result = validateDataset(input)
    if (!result.ok) throw Object.assign(new Error(result.errors.join('；')), { status: 400, errors: result.errors })
    return writeState(result.value)
  }
  /**
   * 合并重复记录是不可撤销的：动手前把当前数据整份复制到 state.backup-<时间戳>.json。
   * 备份失败就不写，宁可这次合并失败，也不让用户失去回退的路。
   */
  async function backup(reason = 'merge') {
    await mkdir(dataDir, { recursive: true })
    let raw
    try { raw = await readFile(file, 'utf8') } catch (error) { if (error.code === 'ENOENT') return null; throw error }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const target = join(dataDir, `state.backup-${reason}-${stamp}.json`)
    await writeFile(target, raw, 'utf8')
    await pruneBackups()
    return target
  }
  /**
   * 备份只留最近 BACKUP_KEEP 份。
   * 每次合并/导入都整份复制，不定期清理会在数据目录里堆出几十个几百 KB 的文件，
   * 而用户真正需要回退的永远是最近那几次。老的 `state.json.before-*.bak` 也一并算进来。
   */
  async function pruneBackups() {
    let names
    try { names = await readdir(dataDir) } catch { return [] }
    const backups = names
      .filter(name => /^state\.(backup-.+\.json|json\.before-.+\.bak)$/.test(name))
      .map(name => ({ name, at: backupStamp(name) }))
      .sort((a, b) => b.at - a.at)
    const removed = []
    for (const entry of backups.slice(BACKUP_KEEP)) {
      try { await unlinkFile(join(dataDir, entry.name)); removed.push(entry.name) } catch { /* 删不掉不影响这次写入 */ }
    }
    return removed
  }
  /** 一串修改要不要排队：合并会一次性删掉好几条，必须和单条写入共享同一个队列，否则会互相覆盖。 */
  async function transact(task) {
    const operation = addQueue.then(task)
    addQueue = operation.catch(() => {})
    return operation
  }
  return { file, dataDir, readState, writeState, addItem, saveMemo, deleteMemo, importState, backup, pruneBackups, transact, relink, unlink, setAlias, setNodeLevel, async exportState() { return readState() } }
}
