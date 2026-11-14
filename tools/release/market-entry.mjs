#!/usr/bin/env node
/**
 * 生成 awesome-dsh-plugin 收录条目 —— 通用工具，任何插件仓库复制 tools/release/ 即可复用。
 * 用法：
 *   node tools/release/market-entry.mjs                       # 从 release.config.json 读取参数
 *   node tools/release/market-entry.mjs --category ui --desc-zh "..." --desc-en "..."
 * 产出：stdout 打印 data/plugins/<owner>__<repo>.yml 的完整内容，并写入 market/<owner>__<repo>.yml
 * 单独 PR 只含这一个文件；monorepo 子包传 --subpath packages/<name>。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(fileURLToPath(import.meta.url), '../../..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

// 参数优先级：CLI > release.config.json > package.json 推导
let cfg = {}
try { cfg = JSON.parse(await readFile(path.join(root, 'release.config.json'), 'utf8')) } catch {}
const arg = name => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined }

const repoUrl = arg('url') || cfg.url || pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '')
if (!repoUrl) { console.error('[market-entry] 无法确定仓库地址：请在 package.json.repository 或 release.config.json 提供 url'); process.exit(1) }
if (repoUrl.includes('<')) {
  console.error(`[market-entry] 仓库地址仍是占位符：${repoUrl}\n请先把 <OWNER> 换成你的 GitHub 账号（package.json.repository 与 release.config.json.url 两处），或传 --url https://github.com/<you>/<repo>`)
  process.exit(1)
}
const m = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/#]+?)(?:\/tree\/[^/]+\/(.+))?$/)
if (!m) { console.error(`[market-entry] url 必须是 https://github.com/<owner>/<repo> 或 .../tree/main/<subpath> 形式，得到: ${repoUrl}`); process.exit(1) }
const [, owner, repo, subPath] = m

const VALID_CATEGORIES = ['agi','ui','usage','theme','model','identity','session','memory','tools','wsl','browser','vision','voice','docs','skill','workflow','git','notify','dev','security','remote','market','fun']
const category = arg('category') || cfg.category
if (!category || !VALID_CATEGORIES.includes(category)) {
  console.error(`[market-entry] --category 必填，取值: ${VALID_CATEGORIES.join(' ')}\n（竞争度参考：ui/tools 最拥挤，browser/vision/wsl/agi 相对空白）`)
  process.exit(1)
}

const descZh = arg('desc-zh') || cfg.description?.zh
const descEn = arg('desc-en') || cfg.description?.en || (pkg.description && !/[一-龥]/.test(pkg.description) ? pkg.description : undefined)
if (!descEn) { console.error('[market-entry] 缺少英文简介（--desc-en 或 release.config.json.description.en）'); process.exit(1) }
if (descZh && (descZh.length < 20 || descZh.length > 200)) console.error(`[market-entry] 警告：中文简介 ${descZh.length} 字，建议 60–160 字`)
if (descEn.length > 500) console.error(`[market-entry] 警告：英文简介 ${descEn.length} 字符，目录硬上限 500，超长会截断`)

const quote = s => (s.includes(': ') ? `"${s.replace(/"/g, '\\"')}"` : s)
const name = subPath ? `${owner}/${repo}#${subPath}` : `${owner}/${repo}`
const fileName = subPath ? `${owner}__${repo}--${subPath.replace(/\//g, '-')}.yml` : `${owner}__${repo}.yml`

const shots = []
try { shots.push(...JSON.parse(await readFile(path.join(root, 'screenshots.json'), 'utf8'))) } catch {}

const yml = [
  `# awesome-dsh-plugin entry for ${name}`,
  `# 提交方式：把本文件放到目录仓库 data/plugins/${fileName}，一个 PR 只加这一个文件。`,
  `url: ${repoUrl}`,
  `name: ${name}`,
  `category: ${category}`,
  `description:`,
  `  en: ${quote(descEn.endsWith('.') ? descEn : descEn + '.')}`,
  descZh ? `  zh: ${quote(descZh)}` : null,
  shots.length ? `screenshots: [${shots.map(s => `'${s}'`).join(', ')}]` : null,
].filter(Boolean).join('\n') + '\n'

const outDir = path.join(root, 'market')
await mkdir(outDir, { recursive: true })
const outPath = path.join(outDir, fileName)
await writeFile(outPath, yml, 'utf8')
console.log(yml)
console.log(`[market-entry] 已写入 ${path.relative(root, outPath)}`)
console.log(`[market-entry] 下一步：fork awesome-dsh-plugin/awesome-dsh-plugin → 新建 data/plugins/${fileName}（粘贴本文件）→ node scripts/generate-readme.mjs → 提 PR（只含这一个文件）`)
