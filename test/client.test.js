import test from 'node:test'
import assert from 'node:assert/strict'
import { click, fixture, jsonResponse, mountClient, selectOption, submitForm, typeInto, waitFor } from './dom-harness.js'
import { validateDataset } from '../src/domain/model.js'
import { toIcs } from '../src/domain/ics.js'

const bodyText = document => document.body.textContent
const findButton = (scope, text) => [...scope.querySelectorAll('button')].find(button => button.textContent === text)
const findButtonContaining = (scope, text) => [...scope.querySelectorAll('button')].find(button => button.textContent.includes(text))
const navButton = (document, label) => findButtonContaining(document.querySelector('.cc-side-nav'), label)

/** 记录请求并回放宿主状态，写请求把 payload 当作新状态。 */
function host(initial = fixture) {
  const calls = []
  let state = structuredClone(initial)
  return {
    calls,
    get state() { return state },
    async respond(url, options = {}) {
      calls.push({ url, method: options.method || 'GET', body: options.body })
      if (url.endsWith('export.ics')) return jsonResponse('BEGIN:VCALENDAR', 'text/calendar')
      if (options.method === 'POST' && options.body) state = JSON.parse(options.body)
      return jsonResponse(state)
    },
  }
}

test('calendar adds a typed competition event in the selected-day sidebar', async () => {
  const calls = []
  let state = structuredClone(fixture)
  const view = await mountClient(async (url, options = {}) => {
    calls.push({ url, method: options.method || 'GET', body: options.body })
    if (url.endsWith('/state')) return jsonResponse(state)
    if (options.method === 'POST' && url.endsWith('/items')) {
      const item = { ...JSON.parse(options.body).item, id: 'event-ui-1' }
      state = { ...state, items: [...state.items, item] }
      return jsonResponse(state)
    }
    return jsonResponse(state)
  })
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))
  assert.equal(document.querySelector('.cc-timeline'), null, '默认主视图应直接进入月历')
  assert.equal(document.querySelector('.cc-coverage-hint'), null, '覆盖提示收在次级功能中，不挤占轻量月历')
  assert.equal(document.querySelector('.cc-conversation-hint'), null, 'Agent 引导应放在次级入口')
  const addEvent = document.querySelector('.cc-day.today .cc-day-add')
  const date = addEvent.getAttribute('data-date')
  await view.update(() => click(addEvent))
  await waitFor(() => document.querySelector('.cc-event-form'))
  const form = document.querySelector('.cc-event-form')
  assert.equal(form.closest('.cc-agenda') !== null, true, '新增表单应内嵌在当天侧栏，不用 modal')
  assert.equal(form.querySelector('input[type="date"]').value, date)
  assert.ok(form.querySelector('select[name="type"]'), '事项表单要有赛事/考试节点类型')
  await view.update(() => typeInto(form.querySelector('input[name="title"]'), '蓝桥杯省赛'))
  await view.update(() => selectOption(form.querySelector('select[name="type"]'), 'competition'))
  await view.update(() => submitForm(form))
  await waitFor(() => calls.some(call => call.url.endsWith('/items') && call.method === 'POST'))
  const payload = JSON.parse(calls.find(call => call.url.endsWith('/items') && call.method === 'POST').body).item
  assert.equal(payload.category, 'competition')
  assert.equal(payload.nodes[0].type, 'competition')
  assert.equal(payload.nodes[0].start, date)
  assert.equal(payload.nodes[0].confidence, 'pending_confirmation', '用户填写日期但未提供官方来源时不能伪标官方确认')
  assert.ok([...document.querySelectorAll('.cc-chip')].some(chip => chip.title.includes('蓝桥杯省赛')), '月历格显示简称，全名留在 title 里')
  assert.equal(document.querySelector('.cc-event-form'), null)
  await view.unmount()
})

test('built DSH client registers the main page and renders usable navigation and details', async () => {
  const view = await mountClient(async () => jsonResponse(fixture))
  const { document } = view
  assert.equal(view.sidebar.config.label(), '赛事日历')
  assert.equal(view.sidebar.config.id, 'campus-events-calendar')
  // 两处 slot 注册（主区 + 侧栏）都必须走 ctx.effect：否则热重载会叠出第二份注册
  assert.equal(view.effects.length >= 2, true, 'main 与 sidebar 的注册都要能随插件卸载而撤销')

  await waitFor(() => document.querySelector('.cc-calendar'))
  assert.equal(bodyText(document).includes('这条是演示数据'), false, '时间轴不该混入详情里的提示文本')

  // 展开工具后可切换时间轴；每一行带日期落点，点击进入详情
  assert.equal(document.querySelector('.cc-timeline'), null, '初始视图应为月历')
  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '时间轴')))
  const timelineRow = [...document.querySelectorAll('.cc-tl-row')].find(row => row.textContent.includes('示例 · 有日期事项'))
  assert.ok(timelineRow, '时间轴应列出有日期的事项')
  assert.match(timelineRow.textContent, /11月20日/)
  await view.update(() => click(timelineRow))
  await waitFor(() => document.querySelector('[role="dialog"]'))
  assert.match(document.querySelector('[role="dialog"]').textContent, /报名截止/)
  await view.update(() => click(document.querySelector('[aria-label="关闭详情"]')))
  await waitFor(() => !document.querySelector('[role="dialog"]'))

  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '月历')))
  await waitFor(() => document.querySelector('.cc-calendar'))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '列表')))
  await waitFor(() => document.querySelectorAll('.cc-list-row').length === 2)
  const datedRow = [...document.querySelectorAll('.cc-list-row')].find(row => row.textContent.includes('示例 · 有日期事项'))
  await view.update(() => click(datedRow))
  await waitFor(() => document.querySelector('[role="dialog"]'))

  const dialog = document.querySelector('[role="dialog"]')
  assert.match(dialog.textContent, /11月20日/)
  assert.match(dialog.textContent, /这条是演示数据/)
  assert.match(dialog.textContent, /演示记录无官方来源/)
  assert.equal(dialog.textContent.includes('官方已确认'), false)
  assert.equal(dialog.querySelectorAll('a').length, 0, '演示记录不应渲染官方链接')

  await view.update(() => click(document.querySelector('[aria-label="关闭详情"]')))
  await waitFor(() => !document.querySelector('[role="dialog"]'))

  await view.update(() => click(document.querySelector('.cc-top-actions .cc-button.primary')))
  await waitFor(() => document.querySelector('[aria-labelledby="cc-editor-title"]'))
  assert.ok(document.querySelector('[aria-labelledby="cc-editor-title"] input[type="url"]'))
  assert.equal([...document.querySelectorAll('[aria-labelledby="cc-editor-title"] label')].filter(label => label.textContent.includes('备注')).length, 1, '备注字段应只显示一次')
  await view.update(() => click(document.querySelector('.cc-node-editor-head .cc-button')))
  await waitFor(() => document.querySelectorAll('.cc-editor-node').length === 2)
  await view.update(() => click(document.querySelector('[aria-label="关闭表单"]')))
  await waitFor(() => !document.querySelector('[aria-labelledby="cc-editor-title"]'))

  await view.update(() => click(navButton(document, '数据维护')))
  await waitFor(() => document.querySelector('.cc-profile-form input[list="cc-major-options"]'))
  assert.ok(document.querySelectorAll('.cc-choice-set input[type="checkbox"]').length >= 10)
  await view.unmount()
})

test('undated items are listed as 日期未知 and never placed on a calendar day', async () => {
  const view = await mountClient(async () => jsonResponse(fixture))
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '时间轴')))
  const timelineRow = [...document.querySelectorAll('.cc-tl-row')].find(row => row.textContent.includes('演示 · 创新挑战赛'))
  assert.match(timelineRow.textContent, /日期待公布/, '没有日期的事项在时间轴里也要出现')
  const placeholder = timelineRow.querySelector('.cc-thumb')
  assert.ok(placeholder, '时间轴每行都有缩略图位')
  assert.match(placeholder.className, /placeholder/, '没有宣传图时显示占位块')
  assert.match(timelineRow.querySelector('.cc-confidence').textContent, /未知|待确认|演示/)
  assert.match(document.querySelector('.cc-tl-row.dated').textContent, /11月20日/)

  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '月历')))
  await waitFor(() => document.querySelector('.cc-calendar'))
  await waitFor(() => document.querySelectorAll('.cc-agenda-row').length > 0, '议程没有渲染')
  assert.equal(document.querySelectorAll('.cc-chip').length, 1, '只有有日期的事项可以进入月历格')
  // 月历格只放得下简称：文字是「示例」而不是全名，全名与全角标签留在 title / aria-label 里
  assert.match(document.querySelector('.cc-chip').title, /示例 · 有日期事项/)

  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '列表')))
  const undated = [...document.querySelectorAll('.cc-list-row')].find(row => row.textContent.includes('演示 · 创新挑战赛'))
  assert.match(undated.textContent, /日期未知/)

  await view.update(() => click(undated))
  await waitFor(() => document.querySelector('[role="dialog"]'))
  assert.match(document.querySelector('[role="dialog"]').textContent, /日期未知/)

  await view.update(() => click(findButtonContaining(document.querySelector('[role="dialog"]'), '站内提醒')))
  await waitFor(() => document.querySelector('[role="status"]')?.textContent.includes('暂不能设置提醒'))

  await view.unmount()
})

test('coarse month precision renders as 月（预计）, fills a month span, and the coverage hint names the gap', async () => {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const state = {
    version: 1,
    profile: { major: '计算机科学', year: '大三', province: '广东', interests: ['程序设计'], types: ['competition'] },
    favorites: [], reminders: [],
    items: [
      { id: 'month-c', title: '蓝桥杯省赛', category: 'competition', majors: [], years: [], interests: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', nodes: [{ id: 'n1', type: 'competition', start: `${month}-01`, end: null, accuracy: 'month', confidence: 'predicted', note: '往年三月省赛' }] },
      { id: 'year-e', title: '学院创新赛', category: 'competition', majors: [], years: [], interests: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', nodes: [{ id: 'n2', type: 'competition', start: `${now.getFullYear()}-01-01`, end: null, accuracy: 'year', confidence: 'predicted', note: '往年安排' }] },
      { id: 'vague-d', title: '还没说时间的比赛', category: 'competition', majors: [], years: [], interests: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', nodes: [{ id: 'n3', type: 'registration', start: null, end: null, confidence: 'unknown' }] },
    ],
  }
  const view = await mountClient(async () => jsonResponse(state))
  const { document } = view
  await waitFor(() => bodyText(document).includes('蓝桥杯省赛'))

  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  const hint = document.querySelector('.cc-coverage-hint')
  assert.ok(hint, '有缺口时要在日历页提示覆盖率')
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '时间轴')))
  assert.match(hint.textContent, /还有 1 项没有时间锚点/)
  assert.match(hint.textContent, /已锚定 67%/, '只到月/年的也算有锚点')
  assert.ok(findButton(hint, '让 Agent 补时间'), '缺口提示要给出下一步动作')

  const monthRow = [...document.querySelectorAll('.cc-tl-row')].find(row => row.textContent.includes('蓝桥杯省赛'))
  assert.match(monthRow.textContent, new RegExp(`${now.getMonth() + 1} 月（预计）`))
  assert.ok(!/\d+月\d+日/.test(monthRow.textContent), '只知道月份时不能渲染出具体某一天')
  const yearRow = [...document.querySelectorAll('.cc-tl-row')].find(row => row.textContent.includes('学院创新赛'))
  assert.match(yearRow.textContent, /年（预计）/)
  assert.match([...document.querySelectorAll('.cc-tl-row')].find(row => row.textContent.includes('还没说时间的比赛')).textContent, /日期待公布/)

  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '月历')))
  await waitFor(() => document.querySelector('.cc-calendar'))
  // 产品行为刻意的改动：只知道月份时不再编出「1 号 / 月末」两个格子，
  // 而是进「还没落到某一天」条 —— 月历格里每个点都必须对应真实的一天。
  assert.equal([...document.querySelectorAll('.cc-chip')].filter(chip => chip.title.includes('蓝桥杯省赛')).length, 0, '月份精度不进月历格')
  const floating = document.querySelector('.cc-floating')
  assert.ok(floating, '月份精度的事项要出现在模糊档期条里')
  assert.match(floating.textContent, /蓝桥杯/, '模糊档期条里用简称标出是哪件事')
  assert.match(floating.textContent, /还没落到某一天|只知道大致档期/)
  assert.match(floating.textContent, new RegExp(`${now.getMonth() + 1}月`), '只说到月份就只显示月份，不给日')
  assert.equal(document.querySelectorAll('.cc-span').length, 0, '月历格不再画逐日细条')
  const chips = [...document.querySelectorAll('.cc-chip')]
  assert.ok(!chips.some(chip => chip.textContent.includes('学院创新赛')), '年份精度不铺进月历格，也不该伪造某一天')
  await view.unmount()
})

test('filter panel uses simplified labels and filtering plus search narrow the result set', async () => {
  const view = await mountClient(async () => jsonResponse(fixture))
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '时间轴')))
  await view.update(() => click(findButton(document.querySelector('.cc-toolbar'), '筛选')))
  await waitFor(() => document.querySelector('.cc-filters.expanded'))
  const labels = [...document.querySelectorAll('.cc-filters .cc-field span')].map(node => node.textContent)
  assert.deepEqual(labels, ['类别', '适配专业', '地区', '报名状态', '开始日期', '结束日期'])
  assert.equal(document.querySelector('.cc-filters').textContent.includes('類別'), false)

  await view.update(() => selectOption(document.querySelector('.cc-filters select'), 'certificate'))
  await waitFor(() => document.querySelectorAll('.cc-tl-row').length === 1, '类别筛选未收窄时间轴')
  assert.match(document.querySelector('.cc-tl-row').textContent, /示例 · 有日期事项/)
  assert.match(bodyText(document), /示例 · 有日期事项/)

  await view.update(() => typeInto(document.querySelector('.cc-search input'), '无匹配结果的关键词'))
  await waitFor(() => document.querySelector('.cc-empty'), '搜索未出现空状态')
  assert.match(document.querySelector('.cc-empty').textContent, /没有找到匹配事项/)
  await view.update(() => click(findButton(document.querySelector('.cc-empty'), '清除筛选')))
  await waitFor(() => document.querySelector('.cc-tl-row'))

  await view.update(() => typeInto(document.querySelector('.cc-search input'), '挑战赛'))
  await waitFor(() => !document.querySelector('.cc-tl-row:nth-child(2)'), '标题搜索未收窄结果')
  assert.match(document.querySelector('.cc-tl-row').textContent, /演示 · 创新挑战赛/)

  await view.unmount()
})

test('favorites, in-plugin reminders and ICS export stay wired to the host API', async () => {
  const stub = host()
  const view = await mountClient(stub.respond)
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '列表')))
  await waitFor(() => document.querySelectorAll('.cc-list-row').length === 2)
  const datedRow = [...document.querySelectorAll('.cc-list-row')].find(row => row.textContent.includes('示例 · 有日期事项'))
  await view.update(() => click(datedRow))
  await waitFor(() => document.querySelector('[role="dialog"]'))

  await view.update(() => click(findButtonContaining(document.querySelector('[role="dialog"]'), '收藏')))
  await waitFor(() => stub.calls.some(call => call.method === 'POST' && call.url.endsWith('/campus-calendar/state')))
  assert.deepEqual(stub.state.favorites, ['known-b'])

  await view.update(() => click(findButtonContaining(document.querySelector('[role="dialog"]'), '站内提醒')))
  await waitFor(() => stub.state.reminders.length === 1)
  assert.deepEqual(stub.state.reminders, ['known-b'])
  await waitFor(() => document.querySelector('[role="status"]')?.textContent.includes('7 天内到期的会排在日历上方'))

  await view.update(() => click(document.querySelector('[aria-label="关闭详情"]')))
  await waitFor(() => !document.querySelector('[role="dialog"]'))

  await view.update(() => click(findButton(document.querySelector('.cc-top-actions'), '导出 ICS')))
  await waitFor(() => stub.calls.some(call => call.url.endsWith('/campus-calendar/export.ics')))

  await view.update(() => click(navButton(document, '已收藏')))
  await waitFor(() => !document.querySelector('.cc-calendar'), '收藏页未过滤掉未收藏事项')
  assert.match(document.querySelector('.cc-main').textContent, /示例 · 有日期事项/)

  await view.unmount()
})

test('a failed profile save keeps the typed draft and surfaces the host error', async () => {
  const view = await mountClient(async (url, options) => {
    if (options.method === 'POST') return { ok: false, status: 400, headers: { get: () => 'application/json' }, json: async () => ({ error: 'profile.major 必须是字符串' }), blob: async () => new Blob([]) }
    return jsonResponse(fixture)
  })
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(navButton(document, '数据维护')))
  await waitFor(() => document.querySelector('.cc-profile-form input[list="cc-major-options"]'))

  const majorInput = () => document.querySelector('.cc-profile-form input[list="cc-major-options"]')
  await view.update(() => typeInto(majorInput(), '计算机科学'))
  await view.update(() => click(findButton(document.querySelector('.cc-section'), '保存档案')))
  await waitFor(() => document.querySelector('.cc-section .cc-inline-error'), '宿主错误未显示')
  assert.match(document.querySelector('.cc-section .cc-inline-error').textContent, /profile\.major/)
  assert.equal(majorInput().value, '计算机科学', '保存失败后草稿必须保留')

  await view.unmount()
})

test('editor blocks unverifiable official dates and posts a valid draft to the items endpoint', async () => {
  const calls = []
  const view = await mountClient(async (url, options) => {
    calls.push({ url, method: options.method || 'GET', body: options.body })
    if (options.method === 'POST' && options.body) return jsonResponse({ ...fixture, items: [...fixture.items, JSON.parse(options.body).item] })
    return jsonResponse(fixture)
  })
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(document.querySelector('.cc-top-actions .cc-button.primary')))
  await waitFor(() => document.querySelector('[aria-labelledby="cc-editor-title"]'))
  const editor = () => document.querySelector('[aria-labelledby="cc-editor-title"]')
  await view.update(() => typeInto(editor().querySelector('input'), '新增 · 校赛报名'))

  const confidence = () => [...editor().querySelectorAll('select')].find(select => [...select.options].some(option => option.textContent === '官方已确认'))
  await view.update(() => selectOption(confidence(), 'official_confirmed'))
  await view.update(() => submitForm(editor().querySelector('form')))
  await waitFor(() => editor().querySelector('.cc-inline-error'), '缺少来源的官方日期未被前端拦下')
  // 文案来自领域层 validateItem：表单不再自己抄一套规则，两边措辞必须一致
  assert.match(editor().querySelector('.cc-inline-error').textContent, /官方确认日期必须有日期、来源 URL 和核验日期/)
  assert.equal(calls.some(call => call.method === 'POST'), false, '被拦下的事项不得发往宿主')

  await view.update(() => selectOption(confidence(), 'pending_confirmation'))
  await view.update(() => submitForm(editor().querySelector('form')))
  await waitFor(() => calls.some(call => call.method === 'POST' && call.url.endsWith('/campus-calendar/items')), '合法事项未提交')
  const posted = JSON.parse(calls.find(call => call.method === 'POST').body).item
  assert.equal(posted.title, '新增 · 校赛报名')
  assert.equal(posted.nodes[0].confidence, 'pending_confirmation')
  assert.equal(posted.demo, false)

  await view.unmount()
})

test('read failure shows a retry path and recovers once the host answers', async () => {
  let attempt = 0
  const view = await mountClient(async url => {
    // 重复记录是主流程之外的补充查询，只统计「读日历」本身请求了几次
    if (String(url).includes('duplicates')) return jsonResponse({ duplicates: [], auto: true })
    if (String(url).includes('suggestions')) return jsonResponse({ items: [] })
    attempt += 1
    if (attempt === 1) return { ok: false, status: 500, headers: { get: () => 'application/json' }, json: async () => ({ error: '本地文件损坏' }), blob: async () => new Blob([]) }
    return jsonResponse(fixture)
  })
  const { document } = view
  await waitFor(() => bodyText(document).includes('无法读取日历'))
  assert.match(bodyText(document), /本地文件损坏/)

  await view.update(() => click(findButton(document, '重试')))
  await waitFor(() => document.querySelector('.cc-calendar'))
  assert.equal(attempt, 2)

  await view.unmount()
})

test('详情里的四档重要程度会写回数据，没设过时把自动推断的那一档标出来', async () => {
  const calls = []
  let state = structuredClone(fixture)
  const view = await mountClient(async (url, options = {}) => {
    calls.push({ url, method: options.method || 'GET', body: options.body })
    if (String(url).includes('duplicates')) return jsonResponse({ duplicates: [], auto: true })
    if (options.method === 'POST' && url.endsWith('/items/level')) {
      const { id, nodeId, level } = JSON.parse(options.body)
      state = {
        ...state,
        items: state.items.map(item => item.id !== id ? item : {
          ...item,
          nodes: item.nodes.map(node => {
            if (nodeId && node.id !== nodeId) return node
            if (level === null) { const { level: _drop, ...rest } = node; return rest }
            return { ...node, level }
          }),
        }),
      }
      return jsonResponse(state)
    }
    return jsonResponse(state)
  })
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '列表')))
  await waitFor(() => document.querySelectorAll('.cc-list-row').length === 2)
  await view.update(() => click([...document.querySelectorAll('.cc-list-row')].find(row => row.textContent.includes('示例 · 有日期事项'))))
  await waitFor(() => document.querySelector('.cc-level-picker'))

  const picker = () => document.querySelector('.cc-level-picker')
  const options = () => [...picker().querySelectorAll('.cc-level-option')]
  // 报名截止默认就是最高一档：没手动设过时也要显示出来，否则四个按钮全是未选中，看不出算几级
  const implied = options().find(option => option.getAttribute('aria-pressed') === 'true')
  assert.equal(implied?.dataset.level, '4', '报名截止应自动推断为「截止」档')
  assert.match(implied.className, /implied/, '自动推断出来的档位要标成 implied，与用户手选区分开')
  assert.ok(picker().querySelector('.cc-level-auto'), '没手动设过时不给「自动」按钮，而是显示「自动」文案')

  await view.update(() => click(options().find(option => option.dataset.level === '2')))
  await waitFor(() => calls.some(call => call.method === 'POST' && call.url.endsWith('/items/level')), '点档位应写回宿主')
  const levelPost = calls.find(call => call.method === 'POST' && call.url.endsWith('/items/level'))
  assert.deepEqual(JSON.parse(levelPost.body), { id: 'known-b', nodeId: 'node-b', level: 2 }, '只改被点的那一档')
  await waitFor(() => options().find(option => option.dataset.level === '2').getAttribute('aria-pressed') === 'true', '保存后选中态应跟着变')
  assert.ok(picker().querySelector('.cc-level-reset'), '手动设过之后要能一键回自动')

  await view.update(() => click(picker().querySelector('.cc-level-reset')))
  await waitFor(() => state.items.find(item => item.id === 'known-b').nodes[0].level === undefined, '「自动」应把 level 从数据里删掉')
  await waitFor(() => options().find(option => option.dataset.level === '4').className.includes('implied'), '回到自动后重新按类型推断')

  await view.unmount()
})

test('旧宿主没有 items/level 接口时，改等级退回 PUT items/:id，不能让按钮点了没反应', async () => {
  const calls = []
  let state = structuredClone(fixture)
  let levelRouteHits = 0
  const view = await mountClient(async (url, options = {}) => {
    calls.push({ url, method: options.method || 'GET', body: options.body })
    if (String(url).includes('duplicates')) return jsonResponse({ duplicates: [], auto: true })
    // 模拟今天下午还在跑的旧 DSH 进程：接口是后来才加的，这个路由根本不存在
    if (url.endsWith('/items/level')) {
      levelRouteHits += 1
      return new Response(JSON.stringify({ error: '未找到此接口' }), { status: 404, headers: { 'content-type': 'application/json' } })
    }
    if (options.method === 'PUT' && url.includes('/items/')) {
      const { item } = JSON.parse(options.body)
      state = { ...state, items: state.items.map(entry => entry.id === item.id ? { ...item, id: entry.id } : entry) }
      return jsonResponse(state)
    }
    return jsonResponse(state)
  })
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '列表')))
  await waitFor(() => document.querySelectorAll('.cc-list-row').length === 2)
  await view.update(() => click([...document.querySelectorAll('.cc-list-row')].find(row => row.textContent.includes('示例 · 有日期事项'))))
  await waitFor(() => document.querySelector('.cc-level-picker'))

  await view.update(() => click([...document.querySelectorAll('.cc-level-picker .cc-level-option')].find(option => option.dataset.level === '3')))
  await waitFor(() => calls.some(call => call.method === 'PUT' && call.url.includes('/items/known-b')), '接口不在时应退回 PUT items/:id')
  assert.equal(levelRouteHits, 1, '先试新接口，失败才退回')
  const put = calls.find(call => call.method === 'PUT' && call.url.includes('/items/known-b'))
  assert.equal(JSON.parse(put.body).item.nodes[0].level, 3, '退回路径也要把等级写进节点')
  await waitFor(() => [...document.querySelectorAll('.cc-level-picker .cc-level-option')].find(option => option.dataset.level === '3').getAttribute('aria-pressed') === 'true', '退回路径同样要更新选中态')
  assert.equal(document.querySelector('.cc-error'), null, '退回成功不算报错')

  await view.unmount()
})

test('newer refresh response wins and manual refresh preserves an open editor draft', async () => {
  let stateReads = 0
  let resolveStale
  let resolveFresh
  const stale = new Promise(resolve => { resolveStale = resolve })
  const fresh = new Promise(resolve => { resolveFresh = resolve })
  const originalNow = Date.now
  let now = 0
  Date.now = () => now

  try {
    const view = await mountClient(async url => {
      if (!url.endsWith('/campus-calendar/state')) return jsonResponse(fixture)
      stateReads += 1
      if (stateReads === 1) return jsonResponse(fixture)
      if (stateReads === 2) return stale
      return fresh
    })
    const { document, window } = view
    await waitFor(() => document.querySelector('.cc-calendar'))

    await view.update(() => click(document.querySelector('.cc-top-actions .cc-button.primary')))
    await waitFor(() => document.querySelector('[aria-labelledby="cc-editor-title"]'))
    const title = document.querySelector('[aria-labelledby="cc-editor-title"] input')
    await view.update(() => typeInto(title, '保留中的草稿'))

    await view.update(() => click(document.querySelector('[aria-label="刷新日历"]')))
    assert.equal(stateReads, 2)
    resolveStale(jsonResponse(fixture))
    await new Promise(resolve => setTimeout(resolve, 10))
    assert.equal(document.querySelector('[aria-labelledby="cc-editor-title"] input').value, '保留中的草稿', '刷新不得丢失打开编辑器的本地草稿')
    await view.unmount()
  } finally {
    Date.now = originalNow
  }
})

test('stale focus refresh cannot overwrite a newer manual refresh', async () => {
  let stateReads = 0
  let resolveStale
  let resolveFresh
  const stale = new Promise(resolve => { resolveStale = resolve })
  const fresh = new Promise(resolve => { resolveFresh = resolve })
  const originalNow = Date.now
  let now = 30_001
  Date.now = () => now

  try {
    const view = await mountClient(async url => {
      if (!url.endsWith('/campus-calendar/state')) return jsonResponse(fixture)
      stateReads += 1
      if (stateReads === 1) return jsonResponse(fixture)
      if (stateReads === 2) return stale
      return fresh
    })
    const { document, window } = view
    await waitFor(() => document.querySelector('.cc-calendar'))

    await view.update(() => window.dispatchEvent(new window.Event('focus')))
    assert.equal(stateReads, 2)
    now += 30_001
    await view.update(() => click(document.querySelector('[aria-label="刷新日历"]')))
    assert.equal(stateReads, 3, '手动刷新应可取代仍在途的后台刷新')

    resolveFresh(jsonResponse({ ...fixture, items: [{ ...fixture.items[0], title: '最新响应' }] }))
    await waitFor(() => bodyText(document).includes('最新响应'))
    resolveStale(jsonResponse({ ...fixture, items: [{ ...fixture.items[0], title: '过期响应' }] }))
    await new Promise(resolve => setTimeout(resolve, 30))

    assert.equal(bodyText(document).includes('过期响应'), false, '过期响应不得覆盖新的日历状态')
    await view.unmount()
  } finally {
    Date.now = originalNow
  }
})

test('save feedback disables duplicate profile submissions and announces success', async () => {
  let resolveSave
  const pendingSave = new Promise(resolve => { resolveSave = resolve })
  const view = await mountClient(async (url, options = {}) => {
    if (url.endsWith('/campus-calendar/state') && options.method === 'POST') return pendingSave
    return jsonResponse(fixture)
  })
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar'))

  await view.update(() => click(navButton(document, '数据维护')))
  await waitFor(() => document.querySelector('.cc-profile-form'))
  await view.update(() => typeInto(document.querySelector('.cc-profile-form input[list="cc-major-options"]'), '计算机科学'))
  await view.update(() => click(findButton(document.querySelector('.cc-section'), '保存档案')))

  const saving = findButton(document.querySelector('.cc-section'), '保存档案')
  assert.ok(saving?.disabled, '保存请求期间应禁用重复提交')
  resolveSave(jsonResponse({ ...fixture, profile: { ...fixture.profile, major: '计算机科学' } }))
  await waitFor(() => document.querySelector('[role=status]')?.textContent.includes('已保存'))
  assert.equal(document.querySelector('[aria-label="刷新日历"]').getAttribute('aria-label'), '刷新日历')
  await view.unmount()
})

test('导出的数据集与 ICS 仍通过领域校验，且未给无日期事项编造日期', async () => {
  const ics = toIcs(fixture.items, { now: new Date('2026-11-10T00:00:00Z') })
  assert.match(ics, /BEGIN:VCALENDAR/)
  assert.equal(ics.split('BEGIN:VEVENT').length - 1, 1, '只有带日期的事项可进入 ICS')
  assert.match(ics, /SUMMARY:【演示】示例 · 有日期事项/)
  const plain = toIcs([{ id: 'pending', title: '待确认赛事', nodes: [{ id: 'n', type: 'exam', start: '2026-12-12', end: null, confidence: 'pending_confirmation' }] }], { now: new Date('2026-11-10T00:00:00Z') })
  assert.match(plain, /SUMMARY:【待确认】待确认赛事/, '没有官方来源的日期导出后必须仍看得出是待确认')
  assert.equal(validateDataset(fixture).ok, true)
})

test('问 Agent 按钮开新对话并填入草稿，不直接发送', async () => {
  const started = []
  const drafts = []
  const view = await mountClient(async (url, options = {}) => {
    if (url.includes('/campus-calendar/draft')) {
      drafts.push(url)
      return jsonResponse({ skill: 'campus-calendar-add', prompt: '/campus-calendar-add 帮我把下面这件事记到赛事日历：\n\n事项：' })
    }
    return jsonResponse(fixture)
  }, { workspace: { startSession(...args) { started.push(args) } } })
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar-tools button'))
  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '时间轴')))
  await waitFor(() => document.querySelector('.cc-ask-actions'))

  await view.update(() => click(findButtonContaining(document.querySelector('.cc-ask-actions'), '我的日历')))
  await waitFor(() => started.length === 1)
  assert.match(drafts[0], /kind=plan/, '主按钮应走「问学业信息 → 生成日历」')
  assert.equal(started[0][0], undefined)
  assert.match(started[0][1].prompt, /^\/campus-calendar-add /)
  assert.equal(started[0][1].whenDraftExists, 'replace', '已有草稿时应替换而不是拒绝')
  await waitFor(() => bodyText(document).includes('已在新对话里填好草稿'))

  await view.update(() => click(findButtonContaining(document.querySelector('.cc-ask-actions'), '按学期')))
  await waitFor(() => started.length === 2)
  assert.match(drafts[1], /kind=semester/)
  await view.unmount()
})

test('没有 uiWorkspace 时问 Agent 给出可读提示而不是静默失败', async () => {
  const view = await mountClient(async () => jsonResponse(fixture))
  const { document } = view
  await waitFor(() => document.querySelector('.cc-calendar-tools button'))
  await view.update(() => click(document.querySelector('.cc-calendar-tools button')))
  await view.update(() => click(findButton(document.querySelector('.cc-segment'), '时间轴')))
  await waitFor(() => document.querySelector('.cc-ask-actions'))
  await view.update(() => click(findButtonContaining(document.querySelector('.cc-ask-actions'), '我的日历')))
  await waitFor(() => document.querySelector('.cc-ask-error'))
  assert.match(document.querySelector('.cc-ask-error').textContent, /当前 DSH 版本/)
  await view.unmount()
})
