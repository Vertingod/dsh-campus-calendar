import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { toIcs } from './domain/ics.js'
import { TAG_COLORS, nodePrecision } from './domain/model.js'
import { createStore } from './host/store.js'
import { buildSuggestions } from './domain/suggest.js'

const MAX_BODY = 2 * 1024 * 1024
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
function validDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

async function readJson(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw Object.assign(new Error('请求内容超过 2 MB 限制'), { status: 413 })
    chunks.push(chunk)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') }
  catch { throw Object.assign(new Error('请求不是有效的 JSON'), { status: 400 }) }
}

function json(res, status, value) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(value))
}

// 注意：嵌套在 items 里的这一层按标准 JSON Schema 书写，必填只能用下面的 required 数组表达；
// 属性级 required: true 只允许出现在交给宿主 defineTool 的属性表（顶层）里。
const nodeProperties = {
  id: { type: 'string' },
  type: { type: 'string', enum: ['registration', 'registration_deadline', 'competition', 'exam', 'submission', 'result', 'other'] },
  start: { type: 'string', description: '窗口起点 YYYY-MM-DD。只知道月份就给该月 1 日并设 accuracy=month；只知道年份给该年 1 月 1 日并设 accuracy=year。实在没有时间线索才留空。' },
  end: { type: 'string', description: '窗口终点 YYYY-MM-DD；单日节点可省略。' },
  confidence: { type: 'string', enum: ['official_confirmed', 'predicted', 'pending_confirmation', 'unknown'] },
  note: { type: 'string', description: '推断依据或用户原话。粗粒度（month / year）日期必须写清凭什么这么推。' },
  accuracy: { type: 'string', enum: ['exact', 'range', 'month', 'year', 'unknown'], description: '时间精度：exact 具体某天、range 一段窗口、month 只知道月份、year 只知道年份/学期。不填会按起止日期推断。' },
  color: { type: 'string', enum: TAG_COLORS, description: '可选标签色（配色标识，不是可信度）。' },
}

// 宿主 defineTool 接收「属性表」，required 写在属性项里；下面由 normalizer 转成 JSON Schema。
const itemParameters = {
  id: { type: 'string', description: '可选稳定 ID；通常省略并由本地 store 生成。' },
  title: { type: 'string', description: '赛事、考试或证书事项名称。', required: true },
  category: { type: 'string', enum: ['competition', 'certificate'], required: true },
  description: { type: 'string' },
  organizer: { type: 'string' },
  eligibility: { type: 'string' },
  majors: { type: 'array', items: { type: 'string' } },
  years: { type: 'array', items: { type: 'string' } },
  interests: { type: 'array', items: { type: 'string' } },
  regions: { type: 'array', items: { type: 'string' } },
  registrationStatus: { type: 'string', enum: ['not_open', 'open', 'closed', 'unknown'] },
  sourceUrl: { type: 'string', description: '仅接收来源字符串；插件不会请求该 URL。' },
  verifiedAt: { type: 'string', description: '明确提供的核验日期 YYYY-MM-DD。' },
  imageUrl: { type: 'string', description: '官方宣传图 https 直链；没有就不填，不要找图凑。' },
  artist: { type: 'string', description: '主办方之外的承办单位 / 官方账号，可留空。' },
  venue: { type: 'string', description: '比赛或考试地点（城市 / 校区 / 线上），可留空。' },
  notes: { type: 'string' },
  demo: { type: 'boolean' },
  nodes: {
    type: 'array',
    required: true,
    items: {
      type: 'object',
      additionalProperties: false,
      properties: nodeProperties,
      required: ['type', 'confidence'],
    },
  },
}

const isPlainObject = value => !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * 宿主 defineTool 接收「属性表」：必填写成属性项上的 required: true。
 * 这里把它递归转成标准 JSON Schema —— 属性级 required 必须提升为父级 required 数组，
 * 否则布尔值会被原样发给模型接口，整轮请求报 `required: true is not of type "array"`，
 * 导致该 profile 下所有会话都无法对话。
 */
function toJsonSchema(properties = {}) {
  const required = []
  const cleaned = {}
  for (const [key, value] of Object.entries(properties)) {
    const { required: isRequired, ...rest } = isPlainObject(value) ? value : { type: value }
    if (isRequired === true) required.push(key)
    cleaned[key] = cleanSchemaNode(rest)
  }
  return { type: 'object', additionalProperties: false, properties: cleaned, ...(required.length ? { required } : {}) }
}

/** 递归清理子结构：布尔型 required 提升到父级数组，嵌套属性表按同样规则转换。 */
function cleanSchemaNode(node) {
  if (Array.isArray(node)) return node.map(cleanSchemaNode)
  if (!isPlainObject(node)) return node
  const out = {}
  const lifted = []
  for (const [key, value] of Object.entries(node)) {
    if (key === 'required') {
      if (Array.isArray(value)) out.required = [...value]
      continue
    }
    if (key === 'properties' && isPlainObject(value)) {
      const nested = toJsonSchema(value)
      out.properties = nested.properties
      if (nested.required) lifted.push(...nested.required)
      continue
    }
    out[key] = cleanSchemaNode(value)
  }
  if (lifted.length) out.required = [...new Set([...(out.required || []), ...lifted])]
  if (out.properties && !out.type) out.type = 'object'
  if (out.properties && out.additionalProperties === undefined) out.additionalProperties = false
  return out
}

const defaultRender = (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }]

/** 真实 defineTool 不可用时，按宿主契约（JSON Schema + output.render）自行规范化。 */
export function normalizeToolSpec(spec) {
  const parameters = spec.parameters?.type === 'object' && spec.parameters?.properties ? spec.parameters : toJsonSchema(spec.parameters)
  return {
    ...spec,
    parameters: cleanSchemaNode(parameters),
    output: { ...(spec.output || {}), render: spec.output?.render || defaultRender },
  }
}

export async function resolveDefineTool(importer = () => import('@deepseek-ai/dsh-tools')) {
  try {
    const tools = await importer()
    if (typeof tools.defineTool === 'function') return tools.defineTool
  } catch {}
  return normalizeToolSpec
}

export const profileParameters = {
  major: { type: 'string', description: '专业，如“计算机科学”。用户没说就留空，不要猜。' },
  year: { type: 'string', description: '年级，如“大三”“研一”。' },
  province: { type: 'string', description: '学校所在省份，如“广东”。' },
  interests: { type: 'array', items: { type: 'string' }, description: '关注方向，如“程序设计”“学术科研”。' },
  types: { type: 'array', items: { type: 'string' }, enum: ['competition', 'certificate'], description: '想关注的事项类型。' },
}

/**
 * 写入「这是我谁的日历」——生成个性化日历的前提。只写用户亲口说的字段：
 * 没问到的保持原值，问到的覆盖；空数组/空串不覆盖成空，避免把已有档案清掉。
 */
export function registerSetProfileTool(ctx, { store, defineTool }) {
  if (!ctx.tools || typeof ctx.tools.register !== 'function' || typeof defineTool !== 'function') return false
  ctx.tools.register(defineTool({
    name: 'campus_calendar_set_profile',
    description: '把用户的学业信息（专业、年级、地区、关注方向）写入本地校园日历档案。这是生成个性化日历的前提；只写用户亲口说过的内容，不要推断。不会访问任何网络。',
    parameters: profileParameters,
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        ok: { type: 'boolean' },
        profile: { type: 'object' },
        message: { type: 'string' },
        error: { type: 'string' },
      } },
      render: (_args, value) => [{ type: 'text', text: value?.message || (value?.ok ? '档案已保存。' : '档案未保存。') }],
    },
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      if (exec?.signal?.aborted) return { ok: false, error: '操作已取消', message: '档案未写入。' }
      const state = await store.readState()
      const next = structuredClone(state.profile || {})
      const text = value => typeof value === 'string' && value.trim() ? value.trim().slice(0, 100) : null
      for (const key of ['major', 'year', 'province']) {
        const value = text(args[key])
        if (value) next[key] = value
      }
      for (const key of ['interests', 'types']) {
        const list = Array.isArray(args[key]) ? args[key].map(value => text(value)).filter(Boolean) : []
        if (list.length) next[key] = [...new Set(list)]
      }
      if (!next.interests) next.interests = []
      if (!next.types) next.types = []
      try {
        const saved = await store.writeState({ ...state, profile: next })
        const summary = [saved.profile.major, saved.profile.year, saved.profile.province].filter(Boolean).join(' · ')
        return { ok: true, profile: saved.profile, message: `已保存你的学业档案${summary ? `：${summary}` : ''}${saved.profile.interests?.length ? ` · 关注${saved.profile.interests.join('、')}` : ''}。` }
      } catch (error) {
        return { ok: false, error: error.status === 400 ? error.message : '本地存储操作失败，请检查存储状态后重试。', message: '档案未保存。' }
      }
    },
  }))
  return true
}

/**
 * 精度缺省值按日期推断：有起止就给 range，有单边就给 exact，没日期才是 unknown。
 * 以前一律写 'unknown'，等于告诉展示层「这些日期不可细说」，
 * 结果所有事项都退化成「日期未知」—— 正是日历不好用的根因。
 */
function inferAccuracy(node = {}) {
  if (node.accuracy && node.accuracy !== 'unknown') return node.accuracy
  if (!node.start && !node.end) return 'unknown'
  return node.start && node.end && node.start !== node.end ? 'range' : 'exact'
}

export function registerAddItemTool(ctx, { store, defineTool }) {
  if (!ctx.tools || typeof ctx.tools.register !== 'function' || typeof defineTool !== 'function') return false
  ctx.tools.register(defineTool({
    name: 'campus_calendar_add_item',
    description: '在本地校园赛事日历中新增一个赛事、证书考试或关键节点。只新增单项；不会访问来源 URL。日期按精度阶梯如实记录：知道到日就写具体日期（accuracy=exact），知道一段窗口就写起止（range），只知道月份就写该月 1 日并标 accuracy=month，只知道年份/学期就标 accuracy=year，并配 confidence=predicted 在 note 里写依据。不要为了显得精确而编日期，也不要因为不够精确就把时间留空——日历只有带时间才有用。没有官方来源和核验日期时不可标记为官方已确认。',
    parameters: itemParameters,
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        ok: { type: 'boolean' },
        item: { type: 'object' },
        confidenceSummary: { type: 'string' },
        precisionSummary: { type: 'string' },
        message: { type: 'string' },
        error: { type: 'string' },
      } },
      render: (_args, value) => [{ type: 'text', text: value?.message || (value?.ok ? '已写入本地日历。' : '未写入日历。') }],
    },
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      if (exec?.signal?.aborted) return { ok: false, error: '操作已取消', message: '未写入事项。' }
      const normalized = {
        ...args,
        id: args.id || randomUUID(),
        sourceUrl: args.sourceUrl || '',
        verifiedAt: args.verifiedAt || '',
        description: args.description || '',
        organizer: args.organizer || '',
        eligibility: args.eligibility || '',
        majors: args.majors || [], years: args.years || [], interests: args.interests || [], regions: args.regions || [],
        registrationStatus: args.registrationStatus || 'unknown', notes: args.notes || '', demo: args.demo || false,
        imageUrl: args.imageUrl || '', artist: args.artist || '', venue: args.venue || '',
        nodes: args.nodes.map((node, index) => ({
          ...node,
          id: node.id || `node-${index + 1}`,
          start: node.start || null,
          end: node.end || null,
          note: node.note || '',
          accuracy: inferAccuracy(node),
        })),
      }
      try {
        const result = await store.addItem(normalized)
        const item = result.items.find(entry => entry.id === normalized.id)
        const labels = [...new Set(item.nodes.map(node => node.confidence === 'pending_confirmation' ? '待确认' : node.confidence === 'predicted' ? '预测' : node.confidence === 'official_confirmed' ? '官方已确认' : '日期未知'))]
        const precisionNames = { exact: '到日', range: '时间窗', month: '到月', year: '到年', unknown: '无日期' }
        const precisionSummary = [...new Set(item.nodes.map(node => precisionNames[nodePrecision(node)] || '无日期'))].join('、')
        return { ok: true, item, confidenceSummary: labels.join('、'), precisionSummary, message: `已在本地日历新增“${item.title}”；可信度：${labels.join('、')}；时间精度：${precisionSummary}。未访问来源链接。` }
      } catch (error) {
        const safeError = error.status === 400 ? error.message : '本地存储操作失败，请检查存储状态后重试。'
        return { ok: false, error: safeError, message: '未写入日历；请检查事项字段或本地存储状态后重试。' }
      }
    },
  }))
  return true
}

// ---------------------------------------------------------------------------
// 对话入口：插件自带一个 skill（skills/campus-calendar-add.md）。客户端点「问 Agent」
// 时向 /campus-calendar/draft 取一段草稿，再交给宿主 uiWorkspace 开新对话。
// 模型理解用户的话、追问缺失信息，最后调用 campus_calendar_add_item 写入本地。
// ---------------------------------------------------------------------------
const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')
const SKILL_FILE = join(SKILL_ROOT, 'campus-calendar-add.md')
const SKILL_NAME = 'campus-calendar-add'

let skillCache = null
export function readCalendarSkill(file = SKILL_FILE, root = SKILL_ROOT) {
  if (skillCache && file === SKILL_FILE) return skillCache
  const text = readFileSync(file, 'utf8')
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  const field = key => (m ? (m[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm')) || [])[1]?.trim().replace(/^(["'])(.*)\1$/, '$2') : undefined)
  const name = field('name') || SKILL_NAME
  const description = field('description') || '把用户描述的校园赛事、证书考试整理成结构化事项并写入本机日历。'
  const skill = { name, description, body: m ? text.slice(m[0].length) : text, dir: root, path: join(root, `${name}.md`) }
  if (file === SKILL_FILE) skillCache = skill
  return skill
}

/**
 * 插件自带的 skill 提供方，形状与 DSH ctx.skills 的 provider 契约一致：
 * list() 给摘要，get(candidate) 给正文。rank 靠后，用户在 ~/.dsh/skills 里的同名 skill 优先。
 */
export function createCalendarSkillProvider(root = SKILL_ROOT) {
  const file = join(root, 'campus-calendar-add.md')
  const summary = () => {
    const skill = readCalendarSkill(file, root)
    return {
      name: skill.name, description: skill.description, path: skill.path,
      invocation: { modelInvocable: true, userInvocable: true },
      source: 'bundled', provider: 'campus-events-calendar', rank: 600, locator: skill.dir,
      resourceBase: { kind: 'directory', path: skill.dir },
    }
  }
  return {
    name: 'campus-events-calendar',
    async list() { return [summary()] },
    async get(candidate) {
      if (!candidate || candidate.name !== summary().name) return undefined
      const skill = readCalendarSkill(file, root)
      const content = `${skill.body.trim()}\n\n---\n\n## 在赛事日历插件里使用\n\n- 本 skill 的目录是 \`${skill.dir}\`。\n- 写入工具是 \`campus_calendar_add_item\`，只需结构化字段：一次一条。先查稳定年度事项的往届节奏；有可靠月份依据就用 accuracy=month 与 confidence=predicted 写入并说明依据，只有完全无时间线索时才留空。\n- 写完后提醒用户回到「赛事日历」页点右上角刷新即可看到。\n`
      return { ...summary(), content }
    },
  }
}

const DRAFT_KINDS = ['plan', 'semester', 'add', 'ask']

/**
 * 生成填进输入框的草稿。草稿不直接发送：用户补完内容再发，模型按 skill 追问、落库。
 * kind: plan（问学业信息 → 生成一整份个人日历，默认）| semester（按学期铺一批）
 *       | add（记录单个指定事项）| ask（随便问）
 */
export function buildDraft({ kind = 'plan', text = '', today = new Date().toISOString().slice(0, 10), state } = {}) {
  if (!DRAFT_KINDS.includes(kind)) kind = 'plan'
  const profile = state?.profile || {}
  const known = [
    profile.major && `专业：${profile.major}`,
    profile.year && `年级：${profile.year}`,
    profile.province && `地区：${profile.province}`,
    profile.interests?.length && `关注方向：${profile.interests.join('、')}`,
  ].filter(Boolean).join(' ／ ')
  const semesterText = String(text).trim()
  const todayLine = `今天是 ${today}。`

  if (kind === 'plan') {
    return [
      `/${SKILL_NAME} 帮我生成一份属于我自己的赛事与证书日历。`,
      '',
      known
        ? `（我的档案里已经有：${known}。请你逐项跟我确认，缺的再问。）`
        : '先问我这几件事，一次问完，别逐个追问：',
      '',
      '1. 专业（以及大类，例如"计算机类"）',
      '2. 年级 / 学制（大一～研三 / 博士）',
      '3. 学校所在省份和城市（比赛认证有时按地区）',
      '4. 关注方向（例如：程序设计、学术科研、创新创业、职业发展、志愿服务）',
      '5. 我今年想要的目标（例如：打进国赛、过六级、拿奖学金）',
      '',
      '我答完以后：',
      '- 先用 campus_calendar_set_profile 把 1-4 写进档案，这是这份日历是我的的前提；',
      '- 再挑 6-10 个真正适合我这个专业/年级/地区的赛事和证书，逐个用 campus_calendar_add_item 写入，事项的 majors / years / regions / interests 要填对，日历才能判断适不适合我；',
      '- 每个事项给 1-3 个关键节点（报名开始 / 报名截止 / 考试或比赛日期）。',
      '',
      `${todayLine}日期原则（精度阶梯）：知道到日就写具体日期（accuracy=exact）；知道一段窗口就写起止（range）；只知道月份就写该月 1 日并标 accuracy=month；只知道年份或学期就标 accuracy=year。对有可靠历届规律的年度赛事/考试，主动给下一届月份窗口，confidence=predicted，并在 note 说明来源与规律；不要将“每年举办”直接推成具体月份，也不要编具体日。没有可靠时间线索才留 null + unknown。没有官方来源与核验日期不要标 official_confirmed。`,
      '写完告诉我写了哪几项、各自的时间精度（到日 / 到月 / 到年 / 待确认），以及回「赛事日历」页刷新查看。',
    ].join('\n')
  }
  if (kind === 'semester') {
    return [
      `/${SKILL_NAME} 按时间范围帮我安排一批校园事项，逐个用 campus_calendar_add_item 写进本地日历。`,
      '',
      `时间范围：${semesterText || '（例如：2027 年春季学期，2 月到 7 月）'}`,
      `关注方向：${profile.interests?.length ? profile.interests.join('、') : '（例如：程序设计、学术科研）'}`,
      `专业 / 年级：${[profile.major, profile.year].filter(Boolean).join(' · ') || '（例如：计算机科学 · 大三）'}`,
      `地区：${profile.province || '（省份）'}`,
      '',
      `${todayLine}档案里缺的信息先问我，问完整理后先用 campus_calendar_set_profile 存好。`,
      '每条给 1-3 个关键节点（报名开始 / 报名截止 / 考试或比赛日期）。',
      '日期原则（精度阶梯）：知道到日写具体日期（exact）；一段窗口写起止（range）；只知道月份写该月 1 日 + accuracy=month；只知道年份/学期用 accuracy=year。先查稳定年度赛事/考试的历届公告；有可靠月份规律就给下一届月份预测，标 predicted 并在 note 写依据，不能只因未公布就留空，也不能把“每年举办”直接推成具体月份或具体日。没有可靠时间线索才留 null + unknown。',
      '没有官方来源的不要标 official_confirmed。',
    ].join('\n')
  }
  if (kind === 'ask') {
    return [
      `/${SKILL_NAME} 我有个日历相关的需求：`,
      '',
      '',
      '',
      `${todayLine}如果目标不明确，先问我一个问题再动手。`,
    ].join('\n')
  }
  return [
    `/${SKILL_NAME} 帮我把下面这件事记到赛事日历：`,
    '',
    '事项：',
    '报名 / 考试时间：',
    '官方链接（有就填）：',
    '',
    `${todayLine}时间不确定就按精度写：只知道月份用 accuracy=month（写该月 1 日），只知道年份用 accuracy=year，并标 predicted + note 说明依据；只有完全没提过时间才留空。`,
  ].join('\n')
}

export function createHandler({ store = createStore() } = {}) {
  return async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname !== '/campus-calendar' && !url.pathname.startsWith('/campus-calendar/')) return json(res, 404, { error: '未找到此接口' })
    const route = url.pathname.replace(/^\/campus-calendar\/?/, '')
    try {
      if (req.method === 'GET' && route === 'state') return json(res, 200, await store.readState())
      if (req.method === 'GET' && route === 'export.json') {
        res.setHeader('content-disposition', 'attachment; filename="campus-events-calendar.json"')
        return json(res, 200, await store.exportState())
      }
      if (req.method === 'GET' && route === 'export.ics') {
        const state = await store.readState()
        res.statusCode = 200
        res.setHeader('content-type', 'text/calendar; charset=utf-8')
        res.setHeader('content-disposition', 'attachment; filename="campus-events-calendar.ics"')
        return res.end(toIcs(state.items))
      }
      if (req.method === 'GET' && route === 'suggestions') {
        const state = await store.readState()
        const category = url.searchParams.get('category') || ''
        return json(res, 200, { items: buildSuggestions({ items: state.items, profile: state.profile, category: ['competition', 'certificate'].includes(category) ? category : '' }) })
      }
      if (req.method === 'GET' && route === 'draft') {
        const url = new URL(req.url, 'http://localhost')
        const kind = url.searchParams.get('kind') || 'add'
        const text = (url.searchParams.get('text') || '').slice(0, 500)
        return json(res, 200, { skill: SKILL_NAME, prompt: buildDraft({ kind, text, state: await store.readState() }) })
      }
      if (req.method === 'POST' && route === 'import') return json(res, 200, await store.importState(await readJson(req)))
      if (req.method === 'POST' && route === 'state') return json(res, 200, await store.writeState(await readJson(req)))
      if (req.method === 'POST' && route === 'items') {
        const body = await readJson(req)
        return json(res, 200, await store.addItem(body.item))
      }
      if (req.method === 'POST' && route === 'memos') {
        const body = await readJson(req)
        const { date, title, description = '', level = 1 } = body
        if (!validDate(date) || typeof title !== 'string' || !title.trim() || title.length > 200 || typeof description !== 'string' || description.length > 2000 || ![1, 2, 3, 4].includes(level)) return json(res, 400, { error: '日期、标题、描述或等级无效' })
        return json(res, 200, await store.saveMemo({ date, title, description, level }))
      }
      if ((req.method === 'PUT' || req.method === 'DELETE') && route.startsWith('memos/')) {
        const id = decodeURIComponent(route.slice('memos/'.length))
        if (req.method === 'DELETE') return json(res, 200, await store.deleteMemo(id))
        const body = await readJson(req)
        const { date, title, description = '', level = 1 } = body
        if (!validDate(date) || typeof title !== 'string' || !title.trim() || title.length > 200 || typeof description !== 'string' || description.length > 2000 || ![1, 2, 3, 4].includes(level)) return json(res, 400, { error: '日期、标题、描述或等级无效' })
        return json(res, 200, await store.saveMemo({ id, date, title, description, level }))
      }
      if ((req.method === 'PUT' || req.method === 'DELETE') && route.startsWith('items/')) {
        const id = decodeURIComponent(route.slice('items/'.length))
        const state = await store.readState()
        const exists = state.items.some(item => item.id === id)
        if (!exists) return json(res, 404, { error: '事项不存在' })
        const body = req.method === 'PUT' ? await readJson(req) : null
        const items = req.method === 'DELETE' ? state.items.filter(item => item.id !== id) : state.items.map(item => item.id === id ? { ...body?.item, id } : item)
        const next = req.method === 'DELETE'
          ? { ...state, items, favorites: state.favorites.filter(value => value !== id), reminders: state.reminders.filter(value => value !== id) }
          : { ...state, items }
        return json(res, 200, await store.writeState(next))
      }
      return json(res, 404, { error: '未找到此接口' })
    } catch (error) {
      return json(res, error.status || 500, { error: error.message || '本地操作失败', ...(error.errors ? { errors: error.errors } : {}) })
    }
  }
}

export function requestRejection(ctx, req) {
  const connection = ctx.get('connection')
  if (typeof connection?.requestRejection !== 'function') return 403
  return connection.requestRejection({ headers: req.headers })
}

export const name = 'dsh-campus-calendar'
export default {
  inject: ['webServer', 'connection', 'tools', 'skills'],
  async apply(ctx) {
    const store = createStore()
    if (ctx.tools?.register) {
      // 同时做两件事：工具先按宿主契约（本地 normalizer）立即注册，避免 dsh-tools 的异步解析
      // 拖住整个插件启动；解析成功后用真正的 defineTool 重新注册，宿主按名字覆盖即可。
      const initial = registerAddItemTool(ctx, { store, defineTool: normalizeToolSpec }) && registerSetProfileTool(ctx, { store, defineTool: normalizeToolSpec })
      if (initial) {
        resolveDefineTool().then(defineTool => {
          if (defineTool === normalizeToolSpec) return
          registerAddItemTool(ctx, { store, defineTool })
          registerSetProfileTool(ctx, { store, defineTool })
        }).catch(() => {})
      }
    }
    // 把自带 skill 注册给模型：用户在对话里提「赛事日历」时能命中，/campus-calendar-add 也能显式调用
    if (ctx.skills?.registerProvider) {
      ctx.effect(() => ctx.skills.registerProvider(() => createCalendarSkillProvider()), 'campus calendar add skill')
    }
    const route = createHandler({ store })
    const handler = async (req, res) => {
      const rejection = requestRejection(ctx, req)
      if (rejection) return json(res, rejection, { error: '未授权' })
      return route(req, res)
    }
    ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/campus-calendar', handler }), 'campus events calendar API')
  },
}
