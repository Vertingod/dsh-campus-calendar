// 静态文件服务器：只服务被忽略的 .preview/ 目录，供本地视觉验证使用
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const root = resolve('.preview')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' }

createServer(async (req, res) => {
  try {
    const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const path = resolve(root, `.${requested === '/' ? '/index.html' : requested}`)
    if (path !== root && !path.startsWith(`${root}${sep}`)) throw new Error('Bad path')
    const body = await readFile(path)
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(4178, '127.0.0.1', () => console.log('preview: http://127.0.0.1:4178/'))
