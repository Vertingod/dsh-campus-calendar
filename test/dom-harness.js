import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import React from 'react'
import { createRoot } from 'react-dom/client'

export const fixture = {
  version: 1,
  profile: { major: '', year: '', province: '', interests: [], types: [] },
  favorites: [], reminders: [],
  items: [
    { id: 'demo-a', title: '演示 · 创新挑战赛', category: 'competition', demo: true, majors: [], years: [], interests: [], regions: [], registrationStatus: 'unknown', sourceUrl: '', verifiedAt: '', nodes: [{ id: 'node-a', type: 'exam', start: null, end: null, confidence: 'unknown', note: '演示数据' }] },
    { id: 'known-b', title: '示例 · 有日期事项', category: 'certificate', demo: true, majors: ['计算机科学'], years: [], interests: ['创新创业'], regions: [], registrationStatus: 'open', sourceUrl: '', verifiedAt: '', nodes: [{ id: 'node-b', type: 'registration_deadline', start: '2026-11-20', end: null, confidence: 'pending_confirmation', note: '演示数据，日期仅用于界面校验' }] },
  ],
}

export async function waitFor(predicate, message = 'UI did not reach the expected state') {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (predicate()) return
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  assert.fail(message)
}

let mountCounter = 0

async function loadPlugin(window) {
  let plugin
  window.__ModuleLoader__ = {
    load({ factory }) {
      plugin = factory(specifier => {
        if (specifier === 'react') return React
        throw new Error(`Unexpected import: ${specifier}`)
      })
    },
  }
  const source = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8')
  // 每次挂载都用独立 URL 求值，避免 data: URL 模块缓存让第二次挂载拿不到 factory
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${mountCounter++}`
  await import(url)
  assert.ok(plugin?.apply, 'bundle must export apply')
  assert.ok(plugin?.inject.includes('slots'), 'bundle must inject slots')
  return plugin
}

/**
 * Render the built DSH client bundle into a jsdom document.
 * `respond` decides what the fake host API returns for each request.
 */
export async function mountClient(respond, { workspace } = {}) {
  // 让 @testing-library/dom 的 act 环境指向 React.act，update() 才可靠地冲刷状态更新
  if (!globalThis.IS_REACT_ACT_ENVIRONMENT) globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const dom = new JSDOM('<!doctype html><html lang="zh"><body><div id="root"></div></body></html>', { url: 'http://localhost/' })
  const { window } = dom
  globalThis.window = window
  globalThis.document = window.document
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: window.navigator })
  globalThis.confirm = () => true
  globalThis.URL.createObjectURL = () => 'blob:mock'
  globalThis.URL.revokeObjectURL = () => {}
  globalThis.fetch = async (url, options = {}) => respond(String(url), options, window)

  const plugin = await loadPlugin(window)
  const registrations = []
  const effects = []
  plugin.apply({
    ...(workspace ? { uiWorkspace: workspace } : {}),
    slots: {
      inject(_slot, callback) { callback() },
      register(config, component) { registrations.push({ config, component }) },
    },
    effect(fn) { effects.push(fn); return fn() },
  })
  const main = registrations.find(entry => entry.config.name === 'main')
  const sidebar = registrations.find(entry => entry.config.name === 'sidebar.panellist')
  assert.ok(main, 'bundle must register the main slot')
  assert.ok(sidebar, 'bundle must register the sidebar entry')

  const root = createRoot(window.document.getElementById('root'))
  await React.act(async () => { root.render(React.createElement(main.component)) })
  await waitFor(() => !window.document.body.textContent.includes('正在读取本地日历…'), 'initial load never finished')

  return {
    window,
    document: window.document,
    registrations,
    effects,
    sidebar,
    update: React.act,
    async unmount() {
      root.unmount()
      await new Promise(resolve => setTimeout(resolve, 20))
      dom.window.close()
      delete globalThis.window
      delete globalThis.document
      delete globalThis.navigator
      delete globalThis.confirm
      delete globalThis.fetch
      delete globalThis.IS_REACT_ACT_ENVIRONMENT
    },
  }
}

export function jsonResponse(value, type = 'application/json') {
  return {
    ok: true,
    status: 200,
    headers: { get: () => type },
    json: async () => structuredClone(value),
    blob: async () => new Blob([JSON.stringify(value)], { type }),
  }
}

function reactProps(element) {
  const key = element && Object.keys(element).find(name => name.startsWith('__reactProps'))
  return (key && element[key]) || {}
}

/**
 * jsdom 只派发非组合（legacy）input 事件，React 的 value tracker 会因「值未变化」丢弃它，
 * 因此 onChange 永远不触发。这里先显示地改 DOM 值，再调用 React 记在元素上的 onChange，
 * 等价于浏览器里真实用户键入后的行为，避免测试绕开受控输入本身。
 */
function commitValue(element, value) {
  const props = reactProps(element)
  element.value = value
  if (typeof props.onChange === 'function') {
    props.onChange({ target: element, currentTarget: element })
    return
  }
  const window = element.ownerDocument.defaultView
  element.dispatchEvent(new window.Event('input', { bubbles: true }))
  element.dispatchEvent(new window.Event('change', { bubbles: true }))
}

export function typeInto(element, value) {
  commitValue(element, value)
}

export function selectOption(element, value) {
  commitValue(element, value)
}

export function click(element) {
  assert.ok(element, 'element to click is missing')
  element.click()
}

export function toggleCheckbox(element) {
  commitValue(element, !element.checked)
}

export function submitForm(form) {
  reactProps(form).onSubmit?.({ preventDefault() {}, target: form, currentTarget: form })
}

export function reactValue(element) {
  return reactProps(element).value
}
