// 只读检查：从 app.asar 中按路径取出某个文件的内容（不改动任何东西）
import { readFileSync, writeFileSync } from 'node:fs'

const [asarPath, innerPath, outPath] = process.argv.slice(2)
const buf = readFileSync(asarPath)
const jsonLength = buf.readUInt32LE(12)
const headerSize = 16 + jsonLength
const tree = JSON.parse(buf.subarray(16, 16 + jsonLength).toString('utf8'))

function resolveNode(path) {
  let node = tree
  for (const part of path.split('/')) {
    if (!node.files || !node.files[part]) return null
    node = node.files[part]
  }
  return node
}

function listAt(path) {
  const node = path ? resolveNode(path) : tree
  if (!node || !node.files) return []
  return Object.entries(node.files).map(([name, entry]) => `${name}${entry.files ? '/' : ''} ${entry.size ?? ''}`)
}

if (innerPath === '--list') {
  console.log(listAt(outPath || '').join('\n'))
} else {
  const node = resolveNode(innerPath)
  if (!node || node.files) throw new Error(`not a file: ${innerPath}`)
  const offset = headerSize + Number(node.offset)
  const text = buf.subarray(offset, offset + node.size).toString('utf8')
  if (outPath) writeFileSync(outPath, text, 'utf8')
  else process.stdout.write(text)
}
