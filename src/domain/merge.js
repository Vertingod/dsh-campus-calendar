import { itemAlias } from './alias.js'
import { NODE_TYPES, confidenceLabel, nodeWindow } from './model.js'

/**
 * 同一个赛事在日历里出现好几次，几乎全是「同一件事被写进了多条记录」：
 * 蓝桥杯三条（C/C++ 组、Java/Python 赛道、无组别）、CET-6 四条、CISCN 三条……
 * 它们的 title 各不相同，但指向同一个赛事。所以判重不能抠标题，
 * 要先认出「这是哪个赛事」（family），再看两条记录是不是在讲同一届。
 *
 * 另一类「重复」是正常的、不能合并的：CCF CSP 一年考四场，
 * 软考一年两次。这些出现多次的是场次，不是重复记录。
 */
export const MULTI_SESSION_FAMILIES = new Set(['csp', 'ruankao', 'cet4', 'cet6', 'ncre', 'nisp', 'yuwang-cup', 'yangcheng-cup', 'ctf', 'xctf', 'hw-ict'])

const NODE_WEIGHT = { registration_deadline: 5, competition: 4, exam: 4, submission: 3, registration: 2, result: 1, other: 0 }

/**
 * 同一个赛事的不同分项要分开叫（软考信安 ≠ 软考网工），别名和家族的归属要一致：
 * 只有「确实认得出来是谁」时才用它的 family，认不出来就退回归一化标题，
 * 否则「软考」和「软考信安」会共用一个家族，被误当成同一届合并掉。
 */
export function itemFamily(item = {}) {
  const { family, source } = itemAlias(item)
  if (source !== 'auto' && family) return family
  const key = `${item.title || ''}`.replace(/[（(].*?[）)]/g, '').replace(/\s+/g, '').toLowerCase()
  return `title:${key || item.id || ''}`
}

function nodeKey(node = {}) {
  const { from, to } = nodeWindow(node)
  return `${node.type || 'other'}:${from || ''}:${to || ''}`
}

const CONFIDENCE_RANK = { official_confirmed: 3, pending_confirmation: 2, predicted: 1, unknown: 0 }
const rank = value => CONFIDENCE_RANK[value] || 0

/**
 * 同一个赛事里，两条记录是不是在讲「同一届」。
 * 有日期就按窗口判：任意两个节点窗口重叠（同一年）就算同一届。
 * 都没日期时，只有一条完全没有独立信息（节点全空 / 标题是它的子串）才可能被并进去 ——
 * 宁可漏合一两条，也不要把不同届的两条合成一条。
 */
export function sameOccurrence(a, b) {
  const windows = item => (item.nodes || []).map(nodeWindow).filter(win => win.from && win.to)
  const left = windows(a)
  const right = windows(b)
  if (left.length && right.length) {
    return left.some(x => right.some(y => x.from.slice(0, 4) === y.from.slice(0, 4) && x.from <= y.to && y.from <= x.to))
  }
  if (!left.length && !right.length) {
    const short = (a.title || '').length <= (b.title || '').length ? a : b
    const long = short === a ? b : a
    const stripped = (short.title || '').replace(/[（(].*?[）)]/g, '').replace(/["“”'‘’「」]/g, '').trim()
    return !(short.nodes || []).some(node => nodeWindow(node).from) && stripped.length > 1 && (long.title || '').includes(stripped)
  }
  return false
}

function groupKey(family, item) {
  const stems = (item.nodes || []).map(node => nodeWindow(node)).filter(win => win.from).map(win => win.from.slice(0, 4))
  if (MULTI_SESSION_FAMILIES.has(family)) return `${family}@${item.id}`
  // 一年一届的赛事：同一年的多条记录归到同一张卡里（两年各一条时不会互相吞掉）
  if (stems.length) return `${family}@${[...new Set(stems)].sort()[0]}`
  return `${family}@none`
}

/** 一条记录「作为主卡」的分量：节点越多、越权威、标题越干净，越适合当代表。 */
export function score(item = {}) {
  const filled = (item.nodes || []).filter(node => nodeWindow(node).from)
  const weight = filled.reduce((sum, node) => sum + (NODE_WEIGHT[node.type] || 0), 0)
  const confidence = filled.reduce((sum, node) => sum + rank(node.confidence), 0)
  const bracket = /[（(]/.test(item.title || '') ? 0 : 1
  return `${String(weight).padStart(4, '0')}.${String(confidence).padStart(4, '0')}.${bracket}`
}

const compareScore = (a, b) => score(b).localeCompare(score(a)) || String(a.id).localeCompare(String(b.id))

/**
 * 把整套事项归成「一个赛事 = 一张卡」。
 * 返回 { groups, duplicates, auto }：
 *   groups     — 每个赛事的展示组，cards 是这条赛事的全部记录
 *   duplicates — 可以安全合并的记录组（只含非演示、非备忘）
 *   auto       — 只有多场次赛事出现多条时才为 true（它们本来就该有多条）
 */
export function groupItems(items = []) {
  const buckets = new Map()
  for (const item of items ?? []) {
    const family = item.category === 'memo' ? `memo:${item.id}` : itemFamily(item)
    const list = buckets.get(family) || []
    const hit = list.find(bucket => bucket.cards.some(card => sameOccurrence(card, item)))
    if (hit) { hit.cards.push(item); continue }
    list.push({ key: groupKey(family, item), family, cards: [item] })
    buckets.set(family, list)
  }
  const groups = []
  const duplicates = []
  let auto = false
  for (const [family, list] of buckets) {
    for (const bucket of list) {
      const cards = [...bucket.cards].sort(compareScore)
      const mergeable = cards.filter(card => !card.demo && card.category !== 'memo')
      if (mergeable.length > 1) {
        if (MULTI_SESSION_FAMILIES.has(family)) auto = true
        else duplicates.push({ key: bucket.key, family, titles: cards.map(card => card.title), ids: cards.map(card => card.id) })
      }
      groups.push({ key: bucket.key, family, cards, primary: cards[0] })
    }
  }
  return { groups, duplicates, auto }
}

function mergeNodes(cards) {
  const seen = new Map()
  for (const card of cards) {
    for (const node of card.nodes || []) {
      const key = nodeKey(node)
      const existing = seen.get(key)
      // 同一个节点在多条记录里各写了一份：保留可信度更高、说明更完整的那份
      if (!existing || rank(node.confidence) > rank(existing.confidence) || (!existing.note && node.note)) seen.set(key, { ...node })
    }
  }
  return [...seen.values()].sort((a, b) => (nodeWindow(a).from || '9999').localeCompare(nodeWindow(b).from || '9999') || NODE_TYPES.indexOf(a.type) - NODE_TYPES.indexOf(b.type))
}

const mergeList = (cards, field) => [...new Set(cards.flatMap(card => card[field] || []))]

/**
 * 把一组记录合成一条：主卡（最完整的那条）作底，节点去重后合并，
 * 简介 / 主办方 / 来源 / 适用范围按「主卡优先、缺了才补」合并，标签色统一取最紧急的那个。
 * view 只用于展示与导出（ICS），不会写回数据文件。
 */
export function mergeCards(cards = []) {
  const sorted = [...cards].sort(compareScore)
  const primary = sorted[0]
  const nodes = mergeNodes(sorted)
  const nodeColor = [...nodes].sort((a, b) => (NODE_WEIGHT[b.type] || 0) - (NODE_WEIGHT[a.type] || 0))[0]?.color
  const merged = {
    ...primary,
    nodes: nodes.map(node => ({ ...node, color: node.color || nodeColor })),
    majors: mergeList(sorted, 'majors'),
    years: mergeList(sorted, 'years'),
    interests: mergeList(sorted, 'interests'),
    regions: mergeList(sorted, 'regions'),
  }
  for (const field of ['description', 'organizer', 'eligibility', 'sourceUrl', 'verifiedAt', 'imageUrl', 'venue', 'artist', 'notes', 'alias']) {
    if (!merged[field]) merged[field] = sorted.find(card => card[field])?.[field] || merged[field]
  }
  if (!merged.alias) delete merged.alias
  return merged
}

/**
 * 组员 / 主卡：不改动已有记录，「合并」等于给成员打上 group = 主卡 id。
 * 展示层按主卡归一，数据里永远是原来那几条 —— 所以合并是可撤销的，删东西才是不可撤销的。
 */
export function resolveGroups(items = []) {
  const byId = new Map((items ?? []).map(item => [item.id, item]))
  const members = new Map()
  const roots = new Map()
  const find = id => {
    const seen = new Set()
    let current = id
    while (byId.get(current)?.group && byId.has(byId.get(current).group) && !seen.has(current)) {
      seen.add(current)
      current = byId.get(current).group
    }
    roots.set(id, current)
    return current
  }
  for (const item of items ?? []) {
    const root = item.group ? find(item.id) : item.id
    const list = members.get(root) || []
    list.push(item)
    members.set(root, list)
  }
  return { members, primaryOf: find }
}

function assemble(cards, members) {
  const view = (members && cards.length > 1) ? mergeCards(cards) : cards[0]
  return { view, cards, group: cards.length > 1 ? { primary: cards[0].id, members: cards.map(card => card.id) } : null }
}

/**
 * 展示层要用的全部派生数据：
 *   views     — 每张卡（一个赛事）一条，多个备选视图复用同一份引用
 *   viewById  — 记录 id → 它所在卡片的视图（点哪条都打开同一张卡）
 *   cardsOf   — 视图 → 这个赛事下的原始记录（详情里「含 N 条记录」展开用）
 * 手动建组（item.group）优先；没建组时，已合并的组不再被自动归并二次猜一遍。
 */
export function buildViews(items = []) {
  const { members } = resolveGroups(items)
  const views = []
  const viewById = new Map()
  const cardsOf = new Map()
  const groups = []
  for (const [root, memberCards] of members) {
    if (memberCards.length > 1) {
      const cards = [...memberCards].sort(compareScore)
      const { view, group } = assemble(cards, true)
      views.push(view); cardsOf.set(view, cards); groups.push(group)
      for (const card of cards) viewById.set(card.id, view)
    }
  }
  // 已经被手动并进某张卡的记录，不再参与自动判重
  const inGroup = new Set(views.flatMap(view => cardsOf.get(view).map(card => card.id)))
  const { groups: autoGroups } = groupItems((items ?? []).filter(item => !inGroup.has(item.id)))
  for (const auto of autoGroups) {
    const cards = [...auto.cards].sort(compareScore)
    const { view } = assemble(cards, false)
    if (!view) continue
    views.push(view); cardsOf.set(view, cards); groups.push(auto)
    for (const card of cards) viewById.set(card.id, view)
  }
  return { views, viewById, cardsOf, groups }
}

/**
 * 真正写回数据的合并：主卡留下（节点合并成一条），成员删除。
 * 只有在用户明确要「删除重复记录」时才用，并且调用方必须先备份。
 */
export function buildMergedDataset(state, plans = []) {
  const items = state.items ?? []
  const byId = new Map(items.map(item => [item.id, item]))
  const remove = new Set()
  const replace = new Map()
  const moved = new Map()
  for (const plan of plans) {
    const cards = plan.ids.map(id => byId.get(id)).filter(Boolean)
    if (cards.length < 2) continue
    const merged = mergeCards(cards)
    delete merged.group
    replace.set(merged.id, merged)
    for (const card of cards) {
      if (card.id === merged.id) continue
      remove.add(card.id)
      moved.set(card.id, merged.id)
      if (card.alias) merged.alias = card.alias
    }
    if (!merged.alias) delete merged.alias
  }
  const keep = id => !remove.has(id)
  // 被删掉的那条如果更早就被收藏 / 提醒了，要跟着搬到留下来的主卡上，不能悄悄消失
  const lift = list => [...new Set((list ?? []).map(id => moved.get(id) ?? id).filter(keep))]
  const next = {
    version: 1,
    profile: state.profile,
    items: items.filter(item => keep(item.id)).map(item => replace.get(item.id) || item),
    favorites: lift(state.favorites),
    reminders: lift(state.reminders),
  }
  return { dataset: next, removed: [...remove], merged: [...replace.values()], moved }
}

/** 合并预览用的一句话摘要：并了哪些、剩几个节点、覆盖哪些时间。 */
export function mergeSummary(plan, items = []) {
  const byId = new Map(items.map(item => [item.id, item]))
  const cards = plan.ids.map(id => byId.get(id)).filter(Boolean)
  const merged = mergeCards(cards)
  const windows = merged.nodes.map(nodeWindow).filter(win => win.from)
  return {
    primaryId: merged.id,
    title: merged.title,
    nodeCount: merged.nodes.length,
    from: windows.map(win => win.from).sort()[0] || null,
    to: windows.map(win => win.to).sort().pop() || null,
    labels: [...new Set(merged.nodes.map(node => confidenceLabel(merged, node).label))],
  }
}
