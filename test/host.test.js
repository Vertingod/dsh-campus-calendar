import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../src/host/store.js'
import { buildDraft, createCalendarSkillProvider, createHandler, normalizeToolSpec, readCalendarSkill, registerAddItemTool, registerSetProfileTool, requestRejection, resolveDefineTool } from '../src/host.js'

async function tempDir() { return mkdtemp(join(tmpdir(), 'campus-calendar-')) }

test('host plugin continues registering API when optional dsh-tools dependency is missing', async () => {
  const registeredRoutes = []
  const registeredTools = []
  const ctx = {
    tools: { register(spec) { registeredTools.push(spec); return () => {} } },
    webServer: { register(route) { registeredRoutes.push(route); return () => {} } },
    get() { return { requestRejection() { return false } } },
    effect(callback) { callback() },
  }

  await (await import('../src/host.js')).default.apply(ctx)

  assert.equal(registeredRoutes.length, 1, 'API route must register even when optional tool helper is unavailable')
  assert.equal(registeredRoutes[0].path, '/campus-calendar')
  assert.equal(registeredTools.length, 2, '事项工具与档案工具都要注册')
  const tool = registeredTools[0]
  assert.equal(tool.name, 'campus_calendar_add_item')
  assert.equal(tool.parameters.type, 'object', 'fallback must hand the host a JSON Schema object')
  assert.equal(tool.parameters.additionalProperties, false)
  assert.deepEqual(tool.parameters.required, ['title', 'category', 'nodes'])
  assert.equal(tool.parameters.properties.required, undefined, 'required flags belong in the array, not inside a property')
  assert.equal(typeof tool.output.render, 'function', 'host requires output.render')
  assert.equal(tool.output.schema.type, 'object')
  const rendered = tool.output.render({}, { ok: true, message: '已保存' })
  assert.equal(rendered[0].type, 'text')
  assert.match(rendered[0].text, /已保存/)
})

test('defineTool resolver falls back to a host-compatible normalizer when dependency is unavailable', async () => {
  const fallback = await resolveDefineTool(async () => { throw Object.assign(new Error('missing'), { code: 'ERR_MODULE_NOT_FOUND' }) })
  const spec = {
    name: 'fallback',
    parameters: {
      title: { type: 'string', required: true },
      category: { type: 'string', enum: ['competition', 'certificate'], required: true },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { ok: { type: 'boolean' } } } },
  }
  const normalized = fallback(spec)
  assert.deepEqual(normalized.parameters, {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      category: { type: 'string', enum: ['competition', 'certificate'] },
    },
    required: ['title', 'category'],
  })
  assert.equal(typeof normalized.output.render, 'function', 'normalizer must supply a default render')
  assert.deepEqual(normalized.output.render({}, { ok: true }), [{ type: 'text', text: JSON.stringify({ ok: true }, null, 2) }])
})

test('resolver prefers the real host defineTool when the package resolves', async () => {
  const real = spec => ({ ...spec, viaReal: true })
  const resolved = await resolveDefineTool(async () => ({ defineTool: real }))
  assert.equal(resolved, real)
})

test('host authorization rejects missing connection and delegates valid request checks', () => {
  assert.equal(requestRejection({ get() { return null } }, { headers: {} }), 403)
  const ctx = { get() { return { requestRejection({ headers }) { return headers.authorization ? false : 401 } } } }
  assert.equal(requestRejection(ctx, { headers: {} }), 401)
  assert.equal(requestRejection(ctx, { headers: { authorization: 'valid' } }), false)
})

test('fresh local store seeds clearly marked demo items and preserves saved state', async () => {
  const dir = await tempDir()
  try {
    const store = createStore({ dataDir: dir })
    const first = await store.readState()
    assert.ok(first.items.length > 0)
    assert.ok(first.items.every(item => item.demo === true && item.nodes.every(node => node.accuracy === 'month' && node.start && !node.end)), '演示事项用月份精度做锚点，首屏不留空日期')
    assert.ok(first.items.every(item => item.nodes.every(node => /演示用时间窗/.test(node.note))), '演示时间窗必须在 note 里说明不是真实安排')
    first.profile.major = '计算机科学'
    await store.writeState(first)
    const next = await createStore({ dataDir: dir }).readState()
    assert.equal(next.profile.major, '计算机科学')
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('concurrent store.addItem calls append without losing either item', async () => {
  const dir = await tempDir()
  try {
    const store = createStore({ dataDir: dir })
    const makeItem = (id, title) => ({ id, title, category: 'competition', nodes: [{ id: `${id}-node`, type: 'exam', start: null, end: null, confidence: 'unknown' }] })
    const [first, second] = await Promise.all([
      store.addItem(makeItem('add-a', '并发新增 A')),
      store.addItem(makeItem('add-b', '并发新增 B')),
    ])
    assert.ok(first.items.some(item => item.id === 'add-a'))
    assert.ok(second.items.some(item => item.id === 'add-b'))
    const saved = await store.readState()
    assert.ok(saved.items.some(item => item.id === 'add-a'))
    assert.ok(saved.items.some(item => item.id === 'add-b'))
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('store.addItem rejects invalid and duplicate items without corrupting state', async () => {
  const dir = await tempDir()
  try {
    const store = createStore({ dataDir: dir })
    const invalid = { id: 'invalid-add', title: '', category: 'competition', nodes: [] }
    await assert.rejects(store.addItem(invalid), /title|required|事项/i)
    const valid = { id: 'unique-add', title: '唯一事项', category: 'competition', nodes: [{ id: 'unique-node', type: 'exam', start: null, end: null, confidence: 'unknown' }] }
    await store.addItem(valid)
    await assert.rejects(store.addItem(valid), /ID 已存在/)
    const saved = await store.readState()
    assert.equal(saved.items.filter(item => item.id === 'unique-add').length, 1)
    await store.addItem({ ...valid, id: 'after-rejection', title: '拒绝后仍可新增' })
    assert.ok((await store.readState()).items.some(item => item.id === 'after-rejection'))
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('host add tool registers one scoped tool using the DSH tools service', async () => {
  const captured = []
  const defineTool = spec => spec
  const dir = await tempDir()
  const store = createStore({ dataDir: dir })
  const ctx = { tools: { register(spec) { captured.push(spec); return () => {} } } }
  registerAddItemTool(ctx, { store, defineTool })
  assert.equal(captured.length, 1)
  assert.equal(captured[0].name, 'campus_calendar_add_item')
  assert.equal(typeof captured[0].execute, 'function')
  assert.equal(captured[0].parameters.title.required, true, '必填标记写在属性项里，交给宿主 defineTool 转换')
  assert.equal(captured[0].parameters.nodes.required, true)
  assert.equal(captured[0].parameters.nodes.items.additionalProperties, false)
  assert.equal(typeof captured[0].output.render, 'function')
  assert.equal(captured[0].output.schema.additionalProperties, false)
  try {
    const result = await captured[0].execute({ title: '未日期事项', category: 'competition', nodes: [{ type: 'registration_deadline', confidence: 'pending_confirmation', note: '用户说下月中旬，日期不明确' }] }, { signal: new AbortController().signal })
    assert.equal(result.ok, true)
    assert.equal(result.item.nodes[0].start, null)
    assert.equal(result.confidenceSummary, '待确认')
    assert.match(result.message, /未访问来源链接/)
    assert.ok((await store.readState()).items.some(item => item.title === '未日期事项'))
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('add tool schema never ships boolean required anywhere', async () => {
  const captured = []
  registerAddItemTool({ tools: { register(spec) { captured.push(spec) } } }, { store: { async addItem() {} }, defineTool: normalizeToolSpec })
  const schema = captured[0].parameters
  const leaks = []
  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) return node.forEach((value, index) => walk(value, `${path}[${index}]`))
    for (const [key, value] of Object.entries(node)) {
      if (key === 'required' && !Array.isArray(value)) leaks.push(`${path}.required = ${JSON.stringify(value)}`)
      walk(value, `${path}.${key}`)
    }
  }
  walk(schema, 'parameters')
  assert.deepEqual(leaks, [], '属性级 required: true 必须提升为数组，否则模型接口报 true is not of type "array"')
  assert.deepEqual(schema.required, ['title', 'category', 'nodes'])
  assert.deepEqual(schema.properties.nodes.items.required, ['type', 'confidence'])
  assert.equal(schema.properties.nodes.items.properties.type.type, 'string')
  assert.ok(schema.properties.title && !('required' in schema.properties.title))
})

test('add tool storage failures do not expose local absolute paths', async () => {
  const captured = []
  const store = { async addItem() { throw new Error("EACCES: permission denied, open 'C:\\\\Users\\\\private\\\\state.json'") } }
  registerAddItemTool({ tools: { register(spec) { captured.push(spec) } } }, { store, defineTool: spec => spec })

  const result = await captured[0].execute({ title: '本地事项', category: 'competition', nodes: [{ type: 'exam', confidence: 'unknown' }] }, { signal: new AbortController().signal })
  assert.equal(result.ok, false)
  assert.match(result.error, /本地存储操作失败/)
  assert.doesNotMatch(result.error, /Users|state\.json|EACCES/)
})

test('corrupt storage is reported and remains untouched', async () => {
  const dir = await tempDir()
  try {
    const file = join(dir, 'state.json')
    await writeFile(file, '{broken', 'utf8')
    await assert.rejects(createStore({ dataDir: dir }).readState(), /损坏/)
    assert.equal(await readFile(file, 'utf8'), '{broken')
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('published skill parses frontmatter and carries the calendar tool contract', async () => {
  const skill = readCalendarSkill()
  assert.equal(skill.name, 'campus-calendar-add')
  assert.match(skill.description, /生成|档案/, 'description 应反映「问学业信息 → 生成个人日历」的用途')
  assert.ok(skill.body.length > 200, '正文应包含日期可信度规则与流程')
  assert.doesNotMatch(skill.body, /^---/m, 'frontmatter 不应残留在正文里')
})

test('skill provider lists one candidate and returns rewritten content for it', async () => {
  const provider = createCalendarSkillProvider()
  const list = await provider.list()
  assert.equal(list.length, 1)
  assert.equal(list[0].name, 'campus-calendar-add')
  assert.equal(list[0].invocation.modelInvocable, true)
  const loaded = await provider.get({ name: 'campus-calendar-add', locator: list[0].locator })
  assert.match(loaded.content, /在赛事日历插件里使用/)
  assert.match(loaded.content, /campus_calendar_add_item/)
  assert.equal(await provider.get({ name: 'unknown' }), undefined)
})

test('draft builder tells the model to look the dates up online before writing them', () => {
  const plan = buildDraft({ today: '2026-11-10' })
  assert.match(plan, /专业/, '默认草稿应先问学业信息')
  assert.match(plan, /campus_calendar_set_profile/, '生成日历前必须先写档案')
  assert.match(plan, /campus_calendar_add_item/)
  assert.match(plan, /今天是 2026-11-10/)
  assert.match(plan, /联网查/, '生成日历要先查官方公告，不能凭印象编日期')
  const add = buildDraft({ kind: 'add', today: '2026-11-10' })
  assert.match(add, /^\/campus-calendar-add /, '草稿应以 /skill 开头，模型收到即显式调用')
  assert.match(add, /今天是 2026-11-10/)
  assert.match(add, /联网查/, '单条录入也要先查官方公告')
  assert.match(add, /accuracy=exact/, '查到具体日子应该写 exact')
  assert.match(add, /accuracy=month/, '官方只说到月份时才降级用 month')
  assert.match(add, /不要编日期/)

  const semester = buildDraft({ kind: 'semester', text: '2027 春季学期', today: '2026-11-10', state: { profile: { major: '计算机科学', year: '大三', province: '广东', interests: ['程序设计'] } } })
  assert.match(semester, /时间范围：2027 春季学期/)
  assert.match(semester, /程序设计/)
  assert.match(semester, /联网查/)
  assert.match(semester, /predicted/, '按往届规律推算的必须标 predicted 并注明是推算')

  assert.equal(buildDraft({ kind: 'unknown-kind' }).startsWith('/campus-calendar-add '), true, '未知类型回落到「生成我的日历」草稿')
})

test('draft route returns a prompt for each ask kind', async () => {
  const dir = await tempDir()
  try {
    const handler = createHandler({ store: createStore({ dataDir: dir }) })
    const response = () => ({ statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v }, end(body) { this.body = body } })
    for (const kind of ['plan', 'add', 'semester', 'ask']) {
      const res = response()
      await handler({ method: 'GET', url: `/campus-calendar/draft?kind=${kind}`, headers: {} }, res)
      assert.equal(res.statusCode, 200)
      const body = JSON.parse(res.body)
      assert.equal(body.skill, 'campus-calendar-add')
      assert.match(body.prompt, /^\/campus-calendar-add /)
    }
    const res = response()
    await handler({ method: 'GET', url: '/campus-calendar/draft?kind=add&text=' + encodeURIComponent('程序设计校赛'), headers: {} }, res)
    assert.equal(res.statusCode, 200)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('host plugin registers the add skill through ctx.skills when available', async () => {
  const providers = []
  const ctx = {
    tools: { register() { return () => {} } },
    skills: { registerProvider(factory) { providers.push(factory()); return () => {} } },
    webServer: { register() { return () => {} } },
    get() { return { requestRejection() { return false } } },
    effect(callback) { callback() },
  }
  await (await import('../src/host.js')).default.apply(ctx)
  assert.equal(providers.length, 1)
  assert.equal(providers[0].name, 'campus-events-calendar')
  assert.equal((await providers[0].list())[0].name, 'campus-calendar-add')
})

test('memo routes create, update, and delete memos without mutating event records', async () => {
  const dir = await tempDir()
  try {
    const handler = createHandler({ store: createStore({ dataDir: dir }) })
    const response = () => ({ statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v }, end(body) { this.body = body } })
    const send = async (method, path, body) => {
      const res = response()
      const payload = Buffer.from(JSON.stringify(body ?? {}))
      await handler({ method, url: `/campus-calendar/${path}`, headers: {}, async *[Symbol.asyncIterator]() { yield payload } }, res)
      return res
    }
    const created = await send('POST', 'memos', { date: '2026-11-12', title: '交课程报告', description: '带签字页', level: 3 })
    assert.equal(created.statusCode, 200)
    const memoState = JSON.parse(created.body)
    const memo = memoState.items.find(item => item.category === 'memo')
    assert.equal(memo.title, '交课程报告')
    assert.equal(memo.nodes[0].start, '2026-11-12')
    const updated = await send('PUT', `memos/${memo.id}`, { date: '2026-11-13', title: '更新后的备忘', description: '', level: 2 })
    assert.equal(JSON.parse(updated.body).items.find(item => item.id === memo.id).title, '更新后的备忘')
    const event = memoState.items.find(item => item.category === 'competition')
    const forbidden = await send('PUT', `memos/${event.id}`, { date: '2026-11-14', title: '篡改赛事' })
    assert.equal(forbidden.statusCode, 404)
    const deleted = await send('DELETE', `memos/${memo.id}`)
    assert.equal(JSON.parse(deleted.body).items.some(item => item.id === memo.id), false)
    assert.ok(JSON.parse(deleted.body).items.some(item => item.id === event.id), 'memo API 不得删除赛事')
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('host routes expose state and reject invalid JSON and unsafe official records', async () => {
  const dir = await tempDir()
  try {
    const handler = createHandler({ store: createStore({ dataDir: dir }) })
    const response = (status = 0) => ({ statusCode: status, headers: {}, setHeader(k, v) { this.headers[k] = v }, end(body) { this.body = body } })
    const get = response()
    await handler({ method: 'GET', url: '/campus-calendar/state', headers: {} }, get)
    assert.equal(get.statusCode, 200)
    const outOfScope = response()
    await handler({ method: 'GET', url: '/campus-calendar-evil/state', headers: {} }, outOfScope)
    assert.equal(outOfScope.statusCode, 404)
    const bad = response()
    await handler({ method: 'POST', url: '/campus-calendar/items', headers: {}, async *[Symbol.asyncIterator]() { yield Buffer.from('{bad') } }, bad)
    assert.equal(bad.statusCode, 400)
    const invalid = response()
    const payload = Buffer.from(JSON.stringify({ item: { id: 'x', title: 'x', category: 'competition', nodes: [{ id: 'n', type: 'exam', start: '2027-01-01', end: null, confidence: 'official_confirmed' }] } }))
    await handler({ method: 'POST', url: '/campus-calendar/items', headers: {}, async *[Symbol.asyncIterator]() { yield payload } }, invalid)
    assert.equal(invalid.statusCode, 400)

    const state = JSON.parse(get.body)
    const demo = state.items[0]
    state.favorites = [demo.id]
    await createStore({ dataDir: dir }).writeState(state)
    const edited = { ...demo, title: '更新后的演示事项' }
    const put = response()
    const putBody = Buffer.from(JSON.stringify({ item: edited }))
    await handler({ method: 'PUT', url: `/campus-calendar/items/${demo.id}`, headers: {}, async *[Symbol.asyncIterator]() { yield putBody } }, put)
    assert.equal(put.statusCode, 200)
    assert.deepEqual(JSON.parse(put.body).favorites, [demo.id])
    assert.equal(JSON.parse(put.body).items[0].title, '更新后的演示事项')

    const oversized = response()
    await handler({ method: 'POST', url: '/campus-calendar/state', headers: {}, async *[Symbol.asyncIterator]() { yield Buffer.alloc(2 * 1024 * 1024 + 1) } }, oversized)
    assert.equal(oversized.statusCode, 413)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('import backs up first, and a broken payload leaves the existing data untouched', async () => {
  const dir = await tempDir()
  try {
    const store = createStore({ dataDir: dir })
    const handler = createHandler({ store })
    const response = () => ({ statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v }, end(body) { this.body = body } })
    const post = (url, text) => ({ method: 'POST', url, headers: {}, async *[Symbol.asyncIterator]() { yield Buffer.from(text) } })

    // 先写入一条能认出来的数据，导入失败后它必须原封不动
    const seeded = await store.readState()
    seeded.items = seeded.items.map((item, index) => index === 0 ? { ...item, title: '导入前的旧数据' } : item)
    await store.writeState(seeded)

    // 坏 JSON：请求体根本解析不了
    const broken = response()
    await handler(post('/campus-calendar/import', '{not json'), broken)
    assert.equal(broken.statusCode, 400)
    assert.equal((await store.readState()).items[0].title, '导入前的旧数据', '坏 JSON 不得改动原数据')
    assert.equal((await readdir(dir)).filter(name => name.startsWith('state.backup-')).length, 0, '解析都没过就不该留下备份')

    // 结构合法但内容被拒：校验失败同样不能碰原数据
    const rejected = response()
    await handler(post('/campus-calendar/import', JSON.stringify({ version: 1, items: [{ id: 'x' }] })), rejected)
    assert.equal(rejected.statusCode, 400)
    assert.equal((await store.readState()).items[0].title, '导入前的旧数据', '校验失败不得改动原数据')

    // 正常导入：返回体会带上备份文件名，磁盘上确实存在，内容是导入前的快照
    const good = await store.exportState()
    good.items = good.items.map((item, index) => index === 0 ? { ...item, title: '导入后的新数据' } : item)
    const res = response()
    await handler(post('/campus-calendar/import', JSON.stringify(good)), res)
    assert.equal(res.statusCode, 200)
    const body = JSON.parse(res.body)
    assert.match(body.backup, /state\.backup-import-.*\.json$/, '导入前必须留一份备份，并把文件名回给界面')
    const saved = JSON.parse(await readFile(body.backup, 'utf8'))
    assert.equal(saved.items[0].title, '导入前的旧数据', '备份里存的必须是导入前的内容')
    assert.equal((await store.readState()).items[0].title, '导入后的新数据')
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('backups are capped so the data directory does not grow without bound', async () => {
  const dir = await tempDir()
  try {
    const store = createStore({ dataDir: dir })
    await store.readState()
    for (let index = 0; index < 14; index++) {
      // 两套历史命名风格都要能被认出来并一起排序
      const day = String(index + 1).padStart(2, '0')
      await writeFile(join(dir, `state.backup-merge-2026-10-${day}T05-07-34-510Z.json`), '{}', 'utf8')
      await writeFile(join(dir, `state.json.before-refresh-2026-09-${day}T10-18-56.344Z.bak`), '{}', 'utf8')
    }
    await store.backup('cap')
    const left = (await readdir(dir)).filter(name => name !== 'state.json' && name !== 'state.json.tmp')
    assert.equal(left.length, 10, `只留最近 10 份，实际留下 ${left.length} 份：${left.join(', ')}`)
    assert.ok(left.some(name => name.includes('state.backup-cap-')), '最新的那份不能被自己清理掉')
    assert.ok(left.every(name => !name.includes('2026-09-01')), '最老的备份应当先被删')
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('set_profile writes only what the user said and never clears existing fields', async () => {
  const captured = []
  const dir = await tempDir()
  const store = createStore({ dataDir: dir })
  registerSetProfileTool({ tools: { register(spec) { captured.push(spec) } } }, { store, defineTool: spec => spec })
  try {
    await captured[0].execute({ major: '计算机科学', year: '大三', province: '广东', interests: ['程序设计', '程序设计', ' '] }, { signal: new AbortController().signal })
    let saved = (await store.readState()).profile
    assert.equal(saved.major, '计算机科学')
    assert.deepEqual(saved.interests, ['程序设计'], '去重并丢掉空白项')

    // 第二轮只说地区：专业和方向不能被清空
    await captured[0].execute({ province: '浙江' }, { signal: new AbortController().signal })
    saved = (await store.readState()).profile
    assert.equal(saved.province, '浙江')
    assert.equal(saved.major, '计算机科学')
    assert.deepEqual(saved.interests, ['程序设计'])

    const cancelled = new AbortController()
    cancelled.abort()
    const result = await captured[0].execute({ major: '法学' }, { signal: cancelled.signal })
    assert.equal(result.ok, false)
    assert.equal((await store.readState()).profile.major, '计算机科学', '取消后不得改动档案')
  } finally { await rm(dir, { recursive: true, force: true }) }
})