#!/usr/bin/env node
/**
 * 发布前自检（preflight）—— dsh 插件通用，任何插件仓库复制本目录即可复用。
 * 用法：node tools/release/preflight.mjs [--strict]
 * 退出码：0 = 全部通过（或仅 warn）；1 = 存在 fail（--strict 时 warn 也算失败）。
 * 检查项与 awesome-dsh-plugin 收录硬性要求对齐；只读检查，不改任何文件。
 */
import { readFile, stat, readdir } from 'node:fs/promises'
import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(fileURLToPath(import.meta.url), '../../..')
const args = process.argv.slice(2)
const strict = args.includes('--strict')

const checks = []
const ok = (id, pass, note = '') => checks.push({ id, level: pass ? 'pass' : 'fail', note })
const warn = (id, pass, note = '') => checks.push({ id, level: pass ? 'pass' : 'warn', note })

async function exists(rel) {
  try { await stat(path.join(root, rel)); return true } catch { return false }
}

let pkg
try { pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) }
catch (error) { console.error(`[preflight] package.json 解析失败: ${error.message}`); process.exit(1) }

// --- 硬性项（fail 级） -------------------------------------------------------
ok('dsh.bundle declared', Boolean(pkg.dsh?.bundle?.patch), pkg.dsh?.bundle?.patch || '缺少 dsh.bundle.patch（只写 dsh.client 无法安装，市场最常见退回原因）')
if (pkg.dsh?.bundle?.patch) ok('cordis.patch.yml exists', await exists(pkg.dsh.bundle.patch.replace(/^\.\//, '')))
ok('repository field', Boolean(pkg.repository?.url?.includes('github.com')), 'npm 映射与归属校验依赖 repository 字段')
ok('license declared', Boolean(pkg.license))
ok('LICENSE file', await exists('LICENSE'))
ok('README file', await exists('README.md'))
ok('icon declared', Boolean(pkg.icon) || Boolean(pkg.exports?.['./icon']), '市场卡片图标')
if (pkg.icon) {
  const iconPath = path.join(root, pkg.icon.replace(/^\.\//, ''))
  try { const s = await stat(iconPath); ok('icon exists', true); warn('icon <=256KB', s.size <= 256 * 1024, `${s.size} bytes`) }
  catch { ok('icon exists', false, pkg.icon) }
}
if (pkg.exports?.['./client']) {
  const clientPath = pkg.exports['./client'].replace(/^\.\//, '')
  try { const s = await stat(path.join(root, clientPath)); ok('client bundle built', s.size > 0, clientPath) }
  catch { ok('client bundle built', false, `${clientPath} 不存在——pnpm 从 GitHub 源码安装不执行构建，缺产物会导致用户启动崩溃`) }
}
ok('files whitelist', Array.isArray(pkg.files) && pkg.files.length > 0)

// --- 建议项（warn 级） -------------------------------------------------------
warn('bugs field', Boolean(pkg.bugs?.url))
warn('homepage field', Boolean(pkg.homepage))
warn('keywords contain dsh-plugin', (pkg.keywords || []).includes('dsh-plugin'))
warn('screenshots.json', await exists('screenshots.json'), '市场详情页轮播图声明（1–8 张仓库内相对路径）')
if (await exists('screenshots.json')) {
  try {
    const shots = JSON.parse(await readFile(path.join(root, 'screenshots.json'), 'utf8'))
    const bad = shots.filter(s => path.isAbsolute(s) || s.includes('..') || s.includes('\\') || /^[a-z]+:\/\//i.test(s) || s.includes('?') || s.includes('#') || s.includes('//'))
    ok('screenshots.json valid', Array.isArray(shots) && shots.length >= 1 && shots.length <= 8 && bad.length === 0,
      bad.length ? `非法路径: ${bad.join(', ')}` : `${shots.length} 张`)
    for (const s of shots) warn(`screenshot exists: ${s}`, await exists(s))
  } catch (error) { ok('screenshots.json valid', false, error.message) }
}
warn('description bilingual', /[一-龥]/.test(pkg.description || ''), '目录站 zh 描述优先；建议中英并列')

// --- 敏感信息扫描 ------------------------------------------------------------
const scanTargets = ['src', 'dist', 'scripts', 'tools', 'lib'].filter(dir => { try { return statSync(path.join(root, dir)).isDirectory() } catch { return false } })
const secrets = []
for (const dir of scanTargets) {
  for (const entry of await readdir(path.join(root, dir), { recursive: true })) {
    if (!/\.(js|mjs|cjs|json|css|yml|yaml)$/.test(entry)) continue
    let text; try { text = await readFile(path.join(root, dir, entry), 'utf8') } catch { continue }
    if (/(ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|api[_-]?key\s*[:=]\s*['"][^'"]{12,})/i.test(text)) secrets.push(`${dir}/${entry}`)
  }
}
ok('no hardcoded secrets', secrets.length === 0, secrets.join(', ') || '')

// --- 输出 --------------------------------------------------------------------
const failed = checks.filter(c => c.level === 'fail')
const warned = checks.filter(c => c.level === 'warn')
for (const c of checks) console.log(`${c.level === 'pass' ? '  ✓' : c.level === 'fail' ? '  ✗' : '  !'}  ${c.id}${c.note ? ` — ${c.note}` : ''}`)
console.log(`\n${checks.length - failed.length - warned.length} pass / ${failed.length} fail / ${warned.length} warn`)
if (failed.length || (strict && warned.length)) { console.log('PREFLIGHT FAILED'); process.exit(1) }
console.log('PREFLIGHT OK')
