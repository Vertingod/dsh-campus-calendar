#!/usr/bin/env node
/**
 * Star 引导接入 —— 在插件前端半区插入 GitHub 跳转按钮。
 * 用法：node tools/release/star-entry.mjs [--repo https://github.com/owner/repo] [--target src/client.js]
 * 行为（幂等，可重复执行）：
 *   1. 生成 src/star-entry.js（常量 + 按钮 + 一次性弱提示）；
 *   2. 若目标文件尚未 import，则在文件顶部追加 import 与挂载调用点注释。
 * 之后需要人工把 <StarButton /> 或 mountStarButton() 放进设置卡/标题行的 JSX/h() 树中，
 * 工具会在输出里给出目标插入建议。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(fileURLToPath(import.meta.url), '../../..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const arg = name => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined }

const repoUrl = arg('repo') || pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '')
if (!repoUrl) { console.error('[star-entry] 缺少仓库地址（--repo 或 package.json.repository）'); process.exit(1) }
const pluginName = pkg.name
const target = arg('target') || 'src/client.js'

const entrySource = `/**
 * Star 引导入口（由 tools/release/star-entry.mjs 生成，可改文案后手工维护）。
 * 渲染层与本插件 client 一致：React.createElement。
 * 用法一：把 <StarButton /> 放进设置卡标题行 / 顶栏动作区；
 * 用法二：在核心功能首次成功后调用 maybeRemindStar()，最多提示一次。
 */
import React from 'react'

const h = React.createElement

export const REPO_URL = '${repoUrl}'
export const STAR_URL = REPO_URL + '/stargazers'
export const STAR_COPY = {
  zh: '★ 给 ${pluginName} 点个 Star',
  en: '★ Star on GitHub',
}
const MARK_KEY = 'dsh-star-reminded:${pluginName}'

/** 跳转按钮：新标签页打开仓库，带 noreferrer，不接管宿主页面。 */
export function StarButton(props = {}) {
  return h('button', {
    type: 'button',
    className: props.className || 'cc-button',
    title: STAR_COPY.zh,
    'aria-label': STAR_COPY.zh,
    onClick: () => window.open(STAR_URL, '_blank', 'noreferrer'),
  }, STAR_COPY.zh)
}

/** 一次性弱提示：写过标记就永不打扰；隐私模式静默降级。 */
export function maybeRemindStar() {
  try {
    if (localStorage.getItem(MARK_KEY)) return
    localStorage.setItem(MARK_KEY, '1')
    setTimeout(() => {
      const bar = document.createElement('div')
      bar.textContent = STAR_COPY.zh + ' →'
      Object.assign(bar.style, {
        position: 'fixed', right: '16px', bottom: '16px', zIndex: '99999',
        background: 'rgba(29,106,90,.92)', color: '#fff', padding: '8px 14px',
        borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
      })
      bar.onclick = () => { window.open(STAR_URL, '_blank', 'noreferrer'); bar.remove() }
      document.body.appendChild(bar)
      setTimeout(() => bar.remove(), 8000)
    }, 2000)
  } catch { /* localStorage 不可用时静默 */ }
}
`
await writeFile(path.join(root, 'src/star-entry.js'), entrySource, 'utf8')

let targetText = await readFile(path.join(root, target), 'utf8')
const marker = `from './star-entry.js'`
if (!targetText.includes(marker)) {
  targetText = `import { StarButton, maybeRemindStar } from './star-entry.js'\n` + targetText
  await writeFile(path.join(root, target), targetText, 'utf8')
  console.log(`[star-entry] 已在 ${target} 顶部加入 import。`)
} else {
  console.log(`[star-entry] ${target} 已引用 star-entry.js，跳过。`)
}
console.log(`
[star-entry] 完成清单：
  1. 已生成 src/star-entry.js（REPO_URL=${repoUrl}）。
  2. 在设置卡/标题行插入 StarButton：h('div', { className: 'cc-feedback-links' }, h(StarButton))。
  3. 在核心功能首次成功后调用 maybeRemindStar()（最多一次，localStorage 标记）。
  4. 重新 npm run build，确认按钮可见可点、新标签页打开且带 noreferrer。
`)
