#!/usr/bin/env node
/**
 * 读取插件身份并生成 release.config.json 骨架（分类、双语文案、star 文案占位）。
 * 用法：node tools/release/init-config.mjs [--category tools] [--desc-zh "..."] [--desc-en "..."]
 * 之后手工改 release.config.json 即可，market-entry / star-entry / run-release 都读它。
 */
import { readFile, writeFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(fileURLToPath(import.meta.url), '../../..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const arg = name => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined }

const configPath = path.join(root, 'release.config.json')
let existing = {}
try { existing = JSON.parse(await readFile(configPath, 'utf8')) } catch {}

const repoUrl = (pkg.repository?.url || '').replace(/^git\+/, '').replace(/\.git$/, '')
const cfg = {
  url: existing.url || repoUrl || 'https://github.com/<OWNER>/<REPO>',
  category: arg('category') || existing.category || '<ui|tools|session|workflow|dev|model|memory|theme|skill|notify|fun|browser|vision|git|docs|voice|security|remote|market|identity|wsl|usage|agi>',
  description: {
    zh: arg('desc-zh') || existing.description?.zh || '<60–160 字中文简介：做什么 + 解决什么场景 + 一条差异化>',
    en: arg('desc-en') || existing.description?.en || (/[一-龥]/.test(pkg.description) ? '<one or two English sentences, ending with a period>' : pkg.description),
  },
  star: existing.star || {
    copyZh: `★ 给 ${pkg.name} 点个 Star`,
    copyEn: '★ Star on GitHub',
    remindOnce: true,
  },
  npmPublish: existing.npmPublish ?? true,
  releaseTag: existing.releaseTag ?? 'v0.1.0',
}
await writeFile(configPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8')
console.log(`[init-config] 已写入 release.config.json — 填好 category 与 description 后运行 npm run release:check`)
