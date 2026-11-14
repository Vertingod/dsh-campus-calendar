#!/usr/bin/env node
/**
 * 把 tools/release/ + docs/RELEASE.md + release.config.json 骨架装进任意 dsh 插件仓库。
 * 用法（在目标插件仓库根目录执行，或 --target 指定）：
 *   node scaffold-release.mjs --target "C:\path\to\new-plugin" --owner yourname
 *   node scaffold-release.mjs --target . --owner yourname --category tools \
 *     --desc-zh "..." --desc-en "..."
 * 幂等：已有文件默认跳过（--force 覆盖），不会删除任何东西。
 * 装完自动给 package.json 补 release:* scripts 与 repository 字段（缺什么补什么）。
 */
import { readFile, writeFile, mkdir, cp, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))          // .../tools/release
const kitRoot = path.resolve(here, '../..')                        // 工具层所在的插件根
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : fallback
}
const force = process.argv.includes('--force')

const target = path.resolve(arg('target', process.cwd()))
const owner = arg('owner')
if (!existsSync(path.join(target, 'package.json'))) {
  console.error(`[scaffold] ${target} 下没有 package.json —— 请指向插件仓库根目录，或用 --target 指定`)
  process.exit(1)
}
const pkgPath = path.join(target, 'package.json')
// PowerShell / Notepad 会写 UTF-8 BOM，JSON.parse 会因此报 Unexpected token
const readJson = async file => JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''))
const pkg = await readJson(pkgPath)
const pluginName = pkg.name
const repoSlug = owner ? `${owner}/${pluginName}` : arg('repo-slug')

const log = []
async function put(rel, content) {
  const dest = path.join(target, rel)
  if (existsSync(dest) && !force) { log.push(`skip  ${rel}（已存在）`); return }
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, content, 'utf8')
  log.push(`write ${rel}`)
}

// 1. 工具层：整目录复制（scaffold 自身不复制，避免自引用）
await mkdir(path.join(target, 'tools/release'), { recursive: true })
for (const file of ['preflight.mjs', 'market-entry.mjs', 'star-entry.mjs', 'pack.mjs', 'init-config.mjs']) {
  await put(`tools/release/${file}`, await readFile(path.join(here, file), 'utf8'))
}
// 2. 阶段文档
await put('docs/RELEASE.md', await readFile(path.join(kitRoot, 'docs/RELEASE.md'), 'utf8'))
// 3. 发布配置骨架
if (!existsSync(path.join(target, 'release.config.json')) || force) {
  await put('release.config.json', JSON.stringify({
    url: repoSlug ? `https://github.com/${repoSlug}` : 'https://github.com/<OWNER>/<REPO>',
    category: arg('category', '<ui|tools|session|workflow|dev|model|memory|theme|skill|notify|fun|browser|vision|git|docs|voice|security|remote|market|identity|wsl|usage|agi>'),
    description: { zh: arg('desc-zh', '<60–160 字中文简介>'), en: arg('desc-en', '<English description.>') },
    star: { copyZh: `★ 给 ${pluginName} 点个 Star`, copyEn: '★ Star on GitHub', remindOnce: true },
    npmPublish: true,
    releaseTag: 'v0.1.0',
  }, null, 2) + '\n')
} else log.push('skip  release.config.json（已存在）')
// 4. 截图声明占位 + 图片目录
await put('screenshots.json', JSON.stringify(['docs/screenshots/01-overview.png'], null, 2) + '\n')
await mkdir(path.join(target, 'docs/screenshots'), { recursive: true })
// 5. 许可证
await put('LICENSE', (await readFile(path.join(kitRoot, 'LICENSE'), 'utf8')).replace('<OWNER>', owner || '<OWNER>'))

// 6. package.json 补齐
const changed = []
const scripts = {
  'release:check': 'node tools/release/preflight.mjs',
  'release:entry': 'node tools/release/market-entry.mjs',
  'release:star': 'node tools/release/star-entry.mjs',
  'release:pack': 'node tools/release/pack.mjs',
}
pkg.scripts = pkg.scripts || {}
for (const [k, v] of Object.entries(scripts)) if (!pkg.scripts[k]) { pkg.scripts[k] = v; changed.push(`scripts.${k}`) }
if (repoSlug && (!pkg.repository || !pkg.repository.url?.includes('github.com'))) {
  pkg.repository = { type: 'git', url: `git+https://github.com/${repoSlug}.git` }
  pkg.bugs = { url: `https://github.com/${repoSlug}/issues` }
  pkg.homepage = `https://github.com/${repoSlug}#readme`
  changed.push('repository/bugs/homepage')
}
if (!pkg.license) { pkg.license = 'MIT'; changed.push('license') }
if (!pkg.keywords?.includes('dsh-plugin')) { pkg.keywords = [...(pkg.keywords || []), 'dsh', 'dsh-plugin'] ; changed.push('keywords') }
if (changed.length) await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')

console.log(log.join('\n'))
console.log(changed.length ? `package.json 已补: ${changed.join(', ')}` : 'package.json 无需改动')
console.log(`\n[scaffold] 完成。下一步在 ${target}：`)
console.log('  1. 填 release.config.json（category + 双语简介 + url）')
console.log('  2. npm run build && npm test')
console.log('  3. npm run release:check   # 全绿再往下走')
console.log('  4. 截图存 docs/screenshots/ 并更新 screenshots.json')
console.log('  5. npm run release:entry / npm run release:star，按 docs/RELEASE.md 走 P1–P5')
