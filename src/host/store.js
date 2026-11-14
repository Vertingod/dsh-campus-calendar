import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { validateDataset } from '../domain/model.js'

/** 演示数据用「未来某月 1 日 + 月份精度」，让首屏不是两条空日期；月份随时间推移自动前移。 */
function monthStart(monthsAhead) {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
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
      await unlink(temp).catch(() => {})
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
  async function importState(input) {
    const result = validateDataset(input)
    if (!result.ok) throw Object.assign(new Error(result.errors.join('；')), { status: 400, errors: result.errors })
    return writeState(result.value)
  }
  return { file, readState, writeState, addItem, saveMemo, deleteMemo, importState, async exportState() { return readState() } }
}
