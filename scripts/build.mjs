import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { build } from 'esbuild'

await mkdir('dist', { recursive: true })
const result = await build({
  entryPoints: ['src/client.js'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  charset: 'utf8',
  external: ['react'],
  loader: { '.css': 'text' },
  outfile: 'dist/client.js',
  write: false,
})
const js = result.outputFiles?.find(file => file.path.endsWith('.js'))?.text
const css = await readFile('src/styles.css', 'utf8')
if (!js || js.trim() === 'undefined') throw new Error('Client JavaScript bundle output missing')
const wrapped = `window.__ModuleLoader__.load({id:"dsh-campus-events-calendar",factory:(require)=>{const module={exports:{}};const exports=module.exports;\n${js}\nreturn module.exports}})`
await writeFile('dist/client.js', wrapped, 'utf8')
await writeFile('dist/client.css', css, 'utf8')
