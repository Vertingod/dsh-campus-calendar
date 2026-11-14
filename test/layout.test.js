import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../dist/client.css', import.meta.url), 'utf8')
const client = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8')

function mediaBlock(query) {
  const start = css.indexOf(`@media(${query})`)
  if (start === -1) return ''
  let depth = 0
  let index = css.indexOf('{', start)
  const from = index
  for (; index < css.length; index++) {
    if (css[index] === '{') depth += 1
    else if (css[index] === '}') {
      depth -= 1
      if (depth === 0) return css.slice(from, index + 1)
    }
  }
  return ''
}

test('客户端 bundle 暴露 DSH 模块加载契约并声明样式注入', () => {
  assert.match(client, /__ModuleLoader__\.load\(/, 'bundle 必须通过 __ModuleLoader__ 注册')
  assert.match(client, /name:\s*"main"|name:"main"|name: "main"/, '必须注册 main 槽位')
  assert.match(client, /sidebar\.panellist/, '必须注册侧栏入口')
  assert.match(client, /className: "cc-shell"/, '根节点应带有作用域类，避免污染宿主样式')
})

test('学生事务工作台提供可信状态 token 和下一步议程层级', () => {
  assert.match(css, /--cc-teal:/, '主操作应使用语义青绿色令牌')
  assert.match(css, /--cc-amber:/, '待确认状态应有独立语义令牌')
  assert.match(css, /\.cc-agenda-kicker\{/, '近期行动列表应提供次级说明层级')
  assert.match(client, /下一步/, '议程标题应指向下一步动作')
  assert.match(client, /生成属于我的日历|问 Agent/, '页面应提供对话生成入口')
  assert.match(client, /startSession/, '对话入口应调用宿主 uiWorkspace 开新对话，而不是只给文字提示')
})

test('动效尊重 reduced motion 且深色主题只调整表面令牌', () => {
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, '应尊重减少动态效果偏好')
  assert.match(css, /--cc-paper-dark:/, '应定义深色表面令牌')
  assert.match(css, /--cc-on-paper-dark:/, '应定义深色文字令牌')
})

test('桌面布局为侧栏 + 主区，月历与议程并排', () => {
  assert.match(css, /\.cc-shell\{[^}]*grid-template-columns:214px minmax\(0,1fr\)/, '桌面外壳应为两栏')
  assert.match(css, /\.cc-calendar-layout\{[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(215px,260px\)/, '月历与议程应并排')
  assert.match(css, /\.cc-grid\{[^}]*grid-template-columns:repeat\(7/, '月历格应为 7 列')
  assert.match(css, /\.cc-shell \:focus-visible\{[^}]*outline/, '必须保留可见焦点样式')
})

test('760px 以下单列堆叠，390px 不产生横向滚动', () => {
  const narrow = mediaBlock('max-width:760px')
  assert.match(narrow, /\.cc-shell\{[^}]*grid-template-columns:1fr/, '窄屏外壳应为单列')
  assert.match(narrow, /\.cc-calendar-layout\{grid-template-columns:1fr;padding-top:4px\}/, '窄屏月历与议程应上下堆叠')
  assert.match(narrow, /\.cc-search\{flex-basis:100%/, '窄屏搜索框应占满一行')
  assert.match(narrow, /\.cc-side-nav button span\{[^}]*clip/, '窄屏导航应折叠为图标')
  assert.match(narrow, /\.cc-main\{padding:0 12px 24px\}/, '窄屏主区内边距应收紧')
  assert.match(narrow, /\.cc-filters\.expanded\{grid-template-columns:repeat\(2/, '窄屏筛选应为两列')
  assert.match(css, /\.cc-shell\{[^}]*overflow:auto\}/, '桌面外壳应自行滚动，不撑破宿主面板')
})
