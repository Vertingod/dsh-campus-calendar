/**
 * 建议清单：当本地几乎没有事项时，客户端用这份清单告诉用户「可以问 Agent 补哪些」。
 *
 * 这里刻意**不是**一个赛事数据库：没有日期、没有官方链接，也没有可信度。
 * 每个条目只是「适合计算机/软件类大三学生的常见事项」这一类常识，
 * `typical` 是**往年的节奏**（通常几月报名、几月比赛），不是本届日期 ——
 * 展示层必须带「通常 / 往年」字样；写入事项时仍由 Agent 查证后经
 * campus_calendar_add_item 落库，带上真实或待确认的节点。
 */
export const SUGGESTIONS = [
  {
    id: 'sug-lanqiao',
    title: '蓝桥杯（C/C++、Java、Python 组）',
    category: 'competition',
    organizer: '工业和信息化部人才交流中心',
    interests: ['程序设计'],
    majors: ['计算机科学', '软件工程'],
    regions: ['广东'],
    why: '个人赛制、周期长，适合边刷题边攒一次国赛经历',
    typical: '往年 10–12 月报名，次年 3–4 月省赛',
    ask: '帮我查一下下一届蓝桥杯的报名时间和省赛时间，写进赛事日历',
  },
  {
    id: 'sug-csp',
    title: 'CCF CSP 软件能力认证',
    category: 'certificate',
    organizer: '中国计算机学会（CCF）',
    interests: ['程序设计', '职业发展'],
    majors: ['计算机科学', '软件工程'],
    regions: ['全国'],
    why: '一年多次场次，成绩可用于求职与部分院校复试',
    typical: '往年一年约 3 场，常排在 3 / 9 / 12 月',
    ask: '查一下今年接下来那场 CCF CSP 的认证时间和报名截止，写进赛事日历',
  },
  {
    id: 'sug-gdcpc',
    title: '广东省大学生程序设计竞赛（GDCPC）',
    category: 'competition',
    organizer: '广东省计算机学会',
    interests: ['程序设计'],
    majors: ['计算机科学', '软件工程'],
    regions: ['广东'],
    why: '省赛含金量高，通常由学校统一组队报名',
    typical: '往年 4–6 月，春季发通知、由学院组队',
    ask: '查一下下一届 GDCPC 的通知和报名方式，写进赛事日历',
  },
  {
    id: 'sug-tiaozhanbei',
    title: '「挑战杯」课外学术科技作品竞赛',
    category: 'competition',
    organizer: '共青团中央、教育部等',
    interests: ['学术科研'],
    majors: ['计算机科学', '软件工程'],
    regions: ['广东'],
    why: '以项目 + 指导老师推进，适合把课题组的东西包装成作品',
    typical: '往年秋季校内选拔，次年春季省赛、夏季国赛',
    ask: '查一下我们学校或广东省这一届挑战杯的校内选拔时间，写进赛事日历',
  },
  {
    id: 'sug-cet6',
    title: '英语六级（CET-6）',
    category: 'certificate',
    organizer: '教育部教育考试院',
    interests: ['职业发展'],
    majors: ['计算机科学', '软件工程'],
    regions: ['全国'],
    why: '多数大企业校招要求 425+，越早考出来越好',
    typical: '每年 6 月、12 月各考一次，报名提前 2–3 个月',
    ask: '查一下最近一次六级报名和考试时间，写进赛事日历',
  },
  {
    id: 'sug-tianchi',
    title: '阿里云天池 / 数据科学竞赛',
    category: 'competition',
    organizer: '阿里云天池、Kaggle 等平台',
    interests: ['学术科研', '职业发展'],
    majors: ['计算机科学', '软件工程'],
    regions: ['全国'],
    why: '线上赛、截止时间分散，适合和课程并行走',
    typical: '全年滚动开赛，单场通常持续 1–3 个月',
    ask: '帮我找几个正在报名或近期截止的数据科学比赛，写进赛事日历',
  },
]

/** 按档案给建议排序：匹配 {major, interests, province} 的排前面，最多给 6 条。 */
export function buildSuggestions({ items = [], profile = {}, limit = 6, category } = {}) {
  const owned = new Set(items.filter(item => !item.demo).map(item => item.title))
  const score = entry => {
    let value = 0
    if (profile.major && (entry.majors ?? []).includes(profile.major)) value += 2
    if (profile.province && (entry.regions ?? []).includes(profile.province)) value += 1
    for (const interest of profile.interests ?? []) if ((entry.interests ?? []).includes(interest)) value += 2
    return value
  }
  return SUGGESTIONS
    .filter(entry => !category || entry.category === category)
    .filter(entry => !owned.has(entry.title))
    .map(entry => ({ ...entry, fit: score(entry) }))
    .sort((a, b) => b.fit - a.fit || a.title.localeCompare(b.title, 'zh-CN'))
    .slice(0, limit)
}
