/**
 * Star 引导入口（由 tools/release/star-entry.mjs 生成，可改文案后手工维护）。
 * 渲染层与本插件 client 一致：React.createElement。
 * 用法一：把 <StarButton /> 放进设置卡标题行 / 顶栏动作区；
 * 用法二：在核心功能首次成功后调用 maybeRemindStar()，最多提示一次。
 */
import React from 'react'

const h = React.createElement

export const REPO_URL = 'https://github.com/Vertingod/dsh-campus-calendar'
export const STAR_URL = REPO_URL + '/stargazers'
export const STAR_COPY = {
  zh: '★ 给 dsh-campus-calendar 点个 Star',
  en: '★ Star on GitHub',
}
const MARK_KEY = 'dsh-star-reminded:dsh-campus-calendar'

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
