#!/usr/bin/env node
/**
 * 把已发布到 GitHub 的插件仓库加进 dsh 客户端自己的插件发现索引（不用等目录 PR 合并）。
 * 用法：node tools/release/add-index-source.mjs --repo https://github.com/<owner>/<repo>[#subpath] [--json]
 * 原理：dsh-m 面板「设置 → 索引源(Index sources)」可加自定义 catalog，每条索引项形如
 *   { url, name?, category?, description? }；本脚本把条目合并进已有的自定义索引文件（幂等，按 url 去重）。
 * 默认写入本机 dsh 桌面配置；--json 时只打印合并结果，便于人工粘到面板里。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const arg = name => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined }
const repo = arg('repo') || (await readJson(path.join(process.cwd(), 'release.config.json')))?.url
if (!repo) { console.error('[index] 用 --repo https://github.com/<owner>/<repo> 指定'); process.exit(1) }
if (repo.includes('<')) { console.error('[index] 仓库地址还是占位符，先把 <OWNER> 换成真实账号'); process.exit(1) }

const VALID = ['agi','ui','usage','theme','model','identity','session','memory','tools','wsl','browser','vision','voice','docs','skill','workflow','git','notify','dev','security','remote','market','fun']
const local = await readJson(path.join(process.cwd(), 'release.config.json')).catch(() => ({}))
const name = repo.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
const entry = { url: repo, name, category: local.category, description: local.description?.zh }
if (!VALID.includes(entry.category)) delete entry.category

const outFile = path.join(os.homedir(), '.dsh', 'profiles', 'desktop', 'plugin-index-sources.json')
const existing = existsSync(outFile) ? (await readJson(outFile)) : { sources: [] }
const merged = existing.sources.filter(s => s.url !== repo).concat(entry)
const payload = { sources: merged }

if (process.argv.includes('--json')) { console.log(JSON.stringify(payload, null, 2)); process.exit(0) }
await mkdir(path.dirname(outFile), { recursive: true })
await writeFile(outFile, JSON.stringify(payload, null, 2) + '\n', 'utf8')
console.log(`[index] 已写入 ${outFile}（${merged.length} 条）`)
console.log('[index] 打开 dsh 插件面板 → 设置 → 索引源 → 添加文件路径即可在 Discover 里直接搜到自己的插件')

async function readJson(file) {
  const raw = await readFile(file, 'utf8')
  return JSON.parse(raw.replace(/^\uFEFF/, ''))
}
