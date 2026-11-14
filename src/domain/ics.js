import { nodePrecision, nodeWindow } from './model.js'

function escapeText(value) {
  return String(value ?? '').replace(/[\\,;]/g, '\\$&').replace(/\r?\n/g, '\\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
}
function foldLine(line) {
  const output = []
  let current = ''
  let bytes = 0
  const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' })
  for (const { segment } of segmenter.segment(line)) {
    const size = Buffer.byteLength(segment, 'utf8')
    if (bytes + size > 75 && current) {
      output.push(current)
      current = ' '
      bytes = 1
    }
    current += segment
    bytes += size
  }
  output.push(current)
  return output.join('\r\n')
}

function dateValue(value) {
  return value ? value.replaceAll('-', '') : null
}

/**
 * 全天事件的 SUMMARY。邀请本身就意味着「日期已知」，所以可信度必须留在标题里：
 * 只凭第三方文章或用户口述的日期，导进日历软件后看不见「待确认」，等于被默默升级成确定日期。
 * 只到月/年的窗口再标一次精度：否则一个月的长条看起来像「活动持续了一整月」。
 */
export function icsLabel(item, node = {}) {
  const prefix = item.demo ? '【演示】' : node.confidence === 'official_confirmed' ? '' : node.confidence === 'predicted' ? '【推测日期】' : '【待确认】'
  const precision = nodePrecision(node)
  const scope = precision === 'month' ? '（月份待定）' : precision === 'year' ? '（年份待定）' : ''
  return `${prefix}${item.title}${scope}`
}

export function toIcs(items = [], { now = new Date() } = {}) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DSH//Campus Events Calendar//ZH', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const item of items) {
    for (const node of item.nodes ?? []) {
      const { precision, from, to } = nodeWindow(node)
      if (precision === 'unknown' || !from || !to) continue
      const endExclusive = new Date(`${to}T00:00:00Z`)
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)
      const uid = `${escapeText(item.id)}-${escapeText(node.id)}@dsh-campus-calendar`
      const title = icsLabel(item, node)
      lines.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${now.toISOString().replaceAll(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`, `DTSTART;VALUE=DATE:${dateValue(from)}`, `DTEND;VALUE=DATE:${endExclusive.toISOString().slice(0, 10).replaceAll('-', '')}`, `SUMMARY:${escapeText(title)} · ${escapeText(node.type)}`)
      if (item.sourceUrl && !item.demo) lines.push(`URL:${escapeText(item.sourceUrl)}`)
      if (item.demo) lines.push(`DESCRIPTION:${escapeText(`演示数据，不代表真实活动。${node.note || ''}`)}`)
      else if (node.note) lines.push(`DESCRIPTION:${escapeText(node.note)}`)
      lines.push('END:VEVENT')
    }
  }
  lines.push('END:VCALENDAR')
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}
