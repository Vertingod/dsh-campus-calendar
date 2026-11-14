#!/usr/bin/env node
/**
 * 生成一个合规的 DSH 插件索引（format:1），让「插件 → 发现 → 添加索引源」能搜到自己的插件。
 *
 * 用法：
 *   node add-index-source.mjs                     # 单仓库（读 release.config.json + git HEAD）
 *   node add-index-source.mjs --repos "https://github.com/A/r1;https://github.com/B/r2"
 *   node add-index-source.mjs --npm               # 版本源用 npm 而不是 git（需已 npm publish）
 *   node add-index-source.mjs --out site/index.json --title "我的插件" --base-url https://cdn.example/dsh/
 *
 * 为什么必须这样写（踩过的坑都在这里）：
 *   1. 面板「索引源」要的是**指向索引文件的 https/http URL**，不是本地路径，也不是裸仓库地址。
 *   2. 索引有严格 schema（format:1），字段错一个整个文件被拒，错误显示在「管理索引源…」里。
 *   3. 版本源两种：npm（要真发布过）或 git（要 40 位 commit SHA）。没发 npm 也能用 git。
 *   4. 图标可以内联 data: URL（≤32KiB）或相对路径，相对路径相对索引 URL 解析。
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const arg = name => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined }
const flag = name => process.argv.includes(`--${name}`)

const cfgPath = path.join(process.cwd(), 'release.config.json')
const cfg = existsSync(cfgPath)
  ? JSON.parse((await readFile(cfgPath, 'utf8')).replace(/^\uFEFF/, ''))
  : {}

const VALID_CATEGORIES = ['agi','ui','usage','theme','model','identity','session','memory','tools','wsl','browser','vision','voice','docs','skill','workflow','git','notify','dev','security','remote','market','fun']

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

/** 收集一个仓库的信息：包名、版本、commit、描述、图标。 */
async function describeRepo(repoUrl, dir) {
  const pkgPath = path.join(dir, 'package.json')
  if (!existsSync(pkgPath)) throw new Error(`${dir} 里没有 package.json`)
  const pkg = JSON.parse((await readFile(pkgPath, 'utf8')).replace(/^\uFEFF/, ''))

  const commit = git(dir, 'rev-parse', 'HEAD')
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`拿不到 40 位 commit：${commit}`)

  // publishTimestamp 用该 commit 的时间，比"现在"更诚实
  const ts = Number(git(dir, 'log', '-1', '--format=%ct'))

  const rel = cfg.description || {}
  const zh = rel.zh && !rel.zh.startsWith('<') ? rel.zh : undefined
  const en = rel.en && !rel.en.startsWith('<') ? rel.en : undefined
  const description = zh ? { zh, ...(en ? { en } : {}) } : en
  if (description && !description.en) description.en = description.zh

  const entry = {
    name: pkg.name,
    title: { zh: pkg.name, en: pkg.name },
    repository: { url: repoUrl },
    versions: [
      flag('npm')
        ? { version: pkg.version, publishTimestamp: ts, source: { type: 'npm' }, engines: pkg.engines?.dsh ? { dsh: pkg.engines.dsh } : undefined }
        : { version: pkg.version, publishTimestamp: ts, source: { type: 'git', url: repoUrl, commit }, engines: pkg.engines?.dsh ? { dsh: pkg.engines.dsh } : undefined }
    ]
  }
  // title 用 owner/repo 更可读
  const slug = repoUrl.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
  entry.title = { zh: slug, en: slug }
  if (description) entry.description = description

  const category = cfg.category
  if (VALID_CATEGORIES.includes(category)) entry.metadata = { category }

  const homepage = pkg.homepage || repoUrl
  if (homepage && /^https?:\/\//.test(homepage)) entry.homepage = homepage

  // 图标：仓库根 icon.svg → 相对索引 URL 的路径（发布时一起放到同目录）
  if (existsSync(path.join(dir, 'icon.svg'))) {
    entry.icon = 'icons/icon.svg'
    entry.__iconSrc = path.join(dir, 'icon.svg')
  }
  if (entry.versions[0].engines === undefined) delete entry.versions[0].engines
  return entry
}

const reposArg = arg('repos')
const repos = reposArg
  ? reposArg.split(';').map(s => s.trim()).filter(Boolean).map(url => ({ url, dir: process.cwd() }))
  : (cfg.url ? [{ url: cfg.url, dir: process.cwd() }] : [])

if (!repos.length) {
  console.error('[index] 没有仓库：用 --repos "url1;url2"，或在 release.config.json 里配 url')
  process.exit(1)
}
const bad = repos.find(r => r.url.includes('<'))
if (bad) { console.error(`[index] 仓库地址还是占位符：${bad.url}，先把 <OWNER> 换成真实账号`); process.exit(1) }

const plugins = []
for (const r of repos) plugins.push(await describeRepo(r.url, r.dir))

const title = arg('title') || '我的 DSH 插件'
const index = {
  format: 1,
  title: { zh: title, en: title },
  metadata: { categories: { tools: { title: { zh: '工具与能力', en: 'Tools & Capabilities' } } } },
  plugins
}

const out = arg('out') || path.join(process.cwd(), 'market', 'index.json')
const iconsDir = path.join(path.dirname(out), 'icons')
const iconFiles = plugins.filter(p => p.__iconSrc).map(p => p.__iconSrc)
for (const p of plugins) delete p.__iconSrc

await mkdir(path.dirname(out), { recursive: true })
if (iconFiles.length) {
  await mkdir(iconsDir, { recursive: true })
  for (const src of iconFiles) {
    await writeFile(path.join(iconsDir, 'icon.svg'), await readFile(src))
  }
}
await writeFile(out, JSON.stringify(index, null, 2) + '\n', 'utf8')

console.log(`[index] 已生成 ${out}（${plugins.length} 个插件，格式 format:1）`)
for (const p of plugins) {
  const v = p.versions[0]
  const src = v.source.type === 'git' ? `git@${v.source.commit.slice(0, 7)}` : 'npm'
  console.log(`  - ${p.name} ${v.version} (${src})`)
}
const base = arg('base-url')
console.log('[index] 下一步：把 index.json 和 icons/ 一起推到 GitHub，然后在「插件 → 发现 → 添加索引源」填这个 URL：')
if (base) {
  console.log(`        ${base.replace(/\/$/, '')}/index.json`)
} else {
  const slug = repos[0].url.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
  console.log(`        https://raw.githubusercontent.com/${slug}/main/market/index.json`)
  console.log(`        （若本机直连 raw 不通，用 https://gh-proxy.com/https://raw.githubusercontent.com/${slug}/main/market/index.json）`)
}
console.log('[index] 注意：面板要的是 URL，不是本地路径；裸仓库地址也不行，必须指向 index.json 本体。')
