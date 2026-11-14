#!/usr/bin/env node
/**
 * 打包校验 —— 生成 npm 包并模拟市场一键安装路径做冒烟验证。
 * 用法：node tools/release/pack.mjs
 * 产出：<pkg>-<version>.tgz + 安装冒烟结果（把 tgz 装进临时目录，核对随包文件）。
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(import.meta.url), '../../..')
const require = createRequire(import.meta.url)
const { name, version } = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

// Windows 上 npm 是 npm.cmd，路径含空格时必须整串加引号走 cmd；tgz 先拷到无空格临时目录再装
const npm = (args, cwd) => {
  if (process.platform !== 'win32') return execFileSync('npm', args, { cwd, encoding: 'utf8' })
  const cmd = ['npm', ...args.map(a => (/\s/.test(a) ? `"${a}"` : a))].join(' ')
  return execFileSync('cmd', ['/c', cmd], { cwd, encoding: 'utf8' })
}
const run = args => execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8' })

console.log('[pack] npm pack ...')
const out = npm(['pack'], root)
const tgzName = out.trim().split(/\r?\n/).pop()
console.log(`[pack] 产物: ${tgzName}`)

const tmp = mkdtempSync(path.join(tmpdir(), 'dsh-pack-check-'))
const tgz = path.join(tmp, path.basename(tgzName))
copyFileSync(path.join(root, tgzName), tgz)
console.log(`[pack] 冒烟安装到 ${tmp} ...`)
npm(['init', '-y'], tmp)
npm(['install', '--ignore-scripts', tgzName], tmp)

const installed = path.join(tmp, 'node_modules', name)
const files = readdirSync(installed, { recursive: true }).map(f => String(f).replace(/\\/g, '/'))
const mustHave = ['package.json', 'cordis.patch.yml']
const pkg = JSON.parse(readFileSync(path.join(installed, 'package.json'), 'utf8'))
if (pkg.dsh?.bundle?.patch) mustHave.push(pkg.dsh.bundle.patch.replace(/^\.\//, ''))
if (pkg.exports?.['./client']) mustHave.push(pkg.exports['./client'].replace(/^\.\//, ''))
const missing = mustHave.filter(f => !files.includes(f))
if (missing.length) {
  console.error(`[pack] FAIL 包内缺少: ${missing.join(', ')}`)
  process.exit(1)
}
console.log(`[pack] OK — ${name}@${version} 共 ${files.length} 个文件，宿主入口与 client 产物齐全。`)
console.log('[pack] 建议：发版前再跑一次 npm test 全量回归。')
