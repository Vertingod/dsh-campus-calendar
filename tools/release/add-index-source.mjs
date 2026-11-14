#!/usr/bin/env node
/**
 * 生成一个"自定义插件索引"，让 dsh 官方面板「插件 → 发现 → 索引源」能搜到自己还没进公共目录的插件。
 * 用法：
 *   node add-index-source.mjs --repos "https://github.com/A/r1;https://github.com/B/r2"
 *   node add-index-source.mjs                 # 读 release.config.json 的 url（单个插件仓库）
 *   node add-index-source.mjs --out <路径>    # 指定输出文件（默认 <仓库>/market/index.json）
 *
 * 重要事实（别踩坑）：
 *   「索引源」接受的是**指向 index.json 的 URL**，不是本地 json 文件路径，也不接受裸 GitHub 仓库地址。
 *   所以这里产出的是一个符合平台 catalog 格式的 json，你需要把它托管到任意 https 地址上
 *  （自己仓库的 raw.githubusercontent.com、gist、oss、Vercel 都可以），再把那个 URL 填进面板。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const arg = name => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined }
const cfgPath = path.join(process.cwd(), 'release.config.json')
const cfg = existsSync(cfgPath) ? JSON.parse((await readFile(cfgPath, 'utf8')).replace(/^\uFEFF/, '')) : {}

const repos = (arg('repos') || cfg.url || '').split(';').map(s => s.trim()).filter(Boolean)
if (!repos.length) {
  console.error('[index] 没有仓库：用 --repos "url1;url2"，或在 release.config.json 里配 url')
  process.exit(1)
}
const bad = repos.find(r => r.includes('<'))
if (bad) { console.error(`[index] 仓库地址还是占位符：${bad}`); process.exit(1) }

const VALID = ['agi','ui','usage','theme','model','identity','session','memory','tools','wsl','browser','vision','voice','docs','skill','workflow','git','notify','dev','security','remote','market','fun']
const items = repos.map(url => {
  const slug = url.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
  const name = slug.split('/').pop()
  const item = { url, name, slug }
  if (VALID.includes(cfg.category)) item.category = cfg.category
  const desc = cfg.description?.zh
  if (desc && !desc.startsWith('<')) { item.description = desc; item.descriptionEn = cfg.description?.en || undefined }
  if (item.descriptionEn === undefined) delete item.descriptionEn
  return item
})

const out = arg('out') || path.join(process.cwd(), 'market', 'index.json')
const payload = { name: 'my-dsh-plugins', items }
await mkdir(path.dirname(out), { recursive: true })
await writeFile(out, JSON.stringify(payload, null, 2) + '\n', 'utf8')

console.log(`[index] 已生成 ${out}（${items.length} 个插件）`)
console.log('[index] 下一步：把这个文件推到 GitHub，然后在 dsh 面板「插件 → 发现 → 索引源」填它的 https 直链，例如')
console.log(`        https://raw.githubusercontent.com/${items[0].slug}/main/market/index.json`)
console.log('[index] 注意：面板要的是 URL，不是本地路径；裸仓库地址也不行，必须指向 index.json。')