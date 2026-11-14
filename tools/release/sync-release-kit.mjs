#!/usr/bin/env node
/**
 * 把某个插件仓库的发布工具层同步到所有已装配的插件仓库。
 * 用法：node tools/release/sync-release-kit.mjs --repos "C:\a;C:\b;C:\c"
 * 或把仓库列表写进 tools/release/kit-targets.txt（一行一个路径，# 开头跳过）。
 * 行为：覆盖 tools/release/*.mjs 与 docs/RELEASE.md；不动 release.config.json / package.json / 截图。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const kitRoot = path.resolve(here, '../..')
const arg = name => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined }

const KIT_FILES = ['preflight.mjs', 'market-entry.mjs', 'star-entry.mjs', 'pack.mjs', 'init-config.mjs', 'scaffold-release.mjs', 'sync-release-kit.mjs']

let targets = (arg('repos') || '').split(';').map(s => s.trim()).filter(Boolean)
const listFile = path.join(here, 'kit-targets.txt')
if (!targets.length && existsSync(listFile)) {
  targets = (await readFile(listFile, 'utf8')).split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'))
}
if (!targets.length) {
  console.error('[sync] 没有目标仓库：用 --repos "a;b" 或写 tools/release/kit-targets.txt')
  process.exit(1)
}

for (const repo of targets) {
  if (!existsSync(path.join(repo, 'package.json'))) { console.log(`skip  ${repo}（不是插件仓库）`); continue }
  await mkdir(path.join(repo, 'tools/release'), { recursive: true })
  for (const f of KIT_FILES) {
    await writeFile(path.join(repo, 'tools/release', f), await readFile(path.join(here, f), 'utf8'), 'utf8')
  }
  await mkdir(path.join(repo, 'docs'), { recursive: true })
  await writeFile(path.join(repo, 'docs/RELEASE.md'), await readFile(path.join(kitRoot, 'docs/RELEASE.md'), 'utf8'), 'utf8')
  console.log(`sync  ${repo}`)
}
console.log('[sync] 完成。各仓库跑一次 npm run release:check 确认环境仍合规。')
