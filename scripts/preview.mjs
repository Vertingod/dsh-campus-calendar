// 构建一次性预览包（写到被忽略的 .preview/ 目录），供浏览器做桌面 / 窄屏视觉验证
import { build } from 'esbuild'
import { mkdir, writeFile, copyFile } from 'node:fs/promises'

const title = '赛事日历预览'
const dir = '.preview'
await mkdir(dir, { recursive: true })
await build({
  entryPoints: ['test/preview-entry.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  outfile: `${dir}/preview.js`,
})
await copyFile('dist/client.js', `${dir}/client.js`)
await copyFile('dist/client.css', `${dir}/client.css`)
await writeFile(`${dir}/index.html`, `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="./client.css"></head><body style="margin:0;height:100vh"><div id="root" style="height:100vh"></div><script type="module" src="./preview.js"></script></body></html>`)
console.log(dir)
