import * as React from 'react'
import { createRoot } from 'react-dom/client'

// 演示数据：全部标为 demo，避免预览被误当成真实日程。
// 日期用「今天 + N 天」算出来，保证时间轴的距离文案永远有内容可看，且不假装是真实赛程。
const day = offset => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
// 月份精度：给当月 1 日 + accuracy=month，展示层会铺成整月长条并写「M 月（预计）」，不编具体某天
const monthStart = offset => {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-01`
}

const sample = {
  "version": 1,
  "profile": {
    "major": "计算机科学",
    "year": "大三",
    "province": "广东",
    "interests": [
      "程序设计",
      "学术科研",
      "职业发展"
    ],
    "types": [
      "competition",
      "certificate"
    ]
  },
  "items": [
    {
      "id": "demo-competition",
      "title": "演示 · 大学生创新实践赛",
      "category": "competition",
      "description": "用于展示如何维护赛事事项；不代表真实活动。",
      "organizer": "演示主办方",
      "eligibility": "请替换为官方规则",
      "majors": [],
      "interests": [
        "创新创业"
      ],
      "years": [],
      "regions": [],
      "registrationStatus": "unknown",
      "sourceUrl": "",
      "verifiedAt": "",
      "notes": "演示数据。请录入官方来源和核验日期后再标注为官方确认。",
      "demo": true,
      "nodes": [
        {
          "id": "demo-registration",
          "type": "registration",
          "start": null,
          "end": null,
          "confidence": "unknown",
          "note": "仅为演示记录，无真实时间。"
        }
      ]
    },
    {
      "id": "demo-certificate",
      "title": "演示 · 专业能力证书考试",
      "category": "certificate",
      "description": "用于展示证书考试节点编辑方式；非真实考试安排。",
      "organizer": "演示考试机构",
      "eligibility": "请查阅官方报考条件",
      "majors": [],
      "interests": [
        "职业发展"
      ],
      "years": [],
      "regions": [],
      "registrationStatus": "unknown",
      "sourceUrl": "",
      "verifiedAt": "",
      "notes": "演示数据。日期留空，避免误解为近期考试安排。",
      "demo": true,
      "nodes": [
        {
          "id": "demo-exam",
          "type": "exam",
          "start": null,
          "end": null,
          "confidence": "unknown",
          "note": "无日期的演示记录。"
        }
      ]
    }
  ],
  "favorites": [],
  "reminders": []
};

// 建议接口回一点真数据，方便看「不知道该排什么？」这块的排版
const suggestions = [
  { id: 'sug-lanqiao', title: '蓝桥杯（C/C++、Java、Python 组）', category: 'competition', organizer: '工业和信息化部人才交流中心', regions: ['广东'], why: '个人赛制、周期长，适合边刷题边攒一次国赛经历', typical: '往年 10–12 月报名，次年 3–4 月省赛', ask: '帮我查一下下一届蓝桥杯的报名时间和省赛时间，写进赛事日历' },
  { id: 'sug-csp', title: 'CCF CSP 软件能力认证', category: 'certificate', organizer: '中国计算机学会（CCF）', regions: ['全国'], why: '一年多次场次，成绩可用于求职与部分院校复试', typical: '往年一年约 3 场，常排在 3 / 9 / 12 月', ask: '查一下今年接下来那场 CCF CSP 的认证时间和报名截止，写进赛事日历' },
]

window.fetch = async (url, options = {}) => {
  const body = url.includes('suggestions') ? { items: suggestions } : sample
  if (options.method === 'POST' && options.body && !url.includes('suggestions')) Object.assign(sample, JSON.parse(options.body))
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
}
window.__ModuleLoader__ = {
  load({ factory }) {
    const plugin = factory(name => name === 'react' ? React : (() => { throw new Error(`Unsupported preview import: ${name}`) })())
    const registrations = []
    const ctx = { slots: { inject(_slot, callback) { callback() }, register(config, component) { registrations.push({ config, component }) } }, effect(fn) { fn() } }
    plugin.apply(ctx)
    const main = registrations.find(entry => entry.config.name === 'main')
    createRoot(document.getElementById('root')).render(React.createElement(main.component))
  },
}

// 预览目录里 client.js 与 preview.js 同级；这里直接以外链方式加载真实构建产物
const script = document.createElement('script')
script.src = './client.js'
script.onerror = () => { document.body.dataset.previewError = 'client bundle failed to load' }
document.head.append(script)
