/**
 * 月历格只放得下两三个汉字，放不下「全国大学生信息安全与对抗技术竞赛（ISCC）」。
 * 以前是把全名塞进去再靠 CSS 省略号截断，结果每个格子都只剩「起…」「蓝…」，
 * 看不出到底是什么比赛。这里改成主动给每个事项一个「简称」：
 *
 *   1. user 自己起的简称（item.alias）优先；
 *   2. 内置词典：常见赛事 / 证书的公认叫法（蓝桥杯、大创、国创、大挑、小挑、软考…）；
 *   3. 词典没命中就用自动缩写：去掉「全国大学生」「赛」这类套话，取有信息量的词。
 *
 * 词典按顺序匹配，越具体越靠前（「信息安全」要先于「计算机」，
 * 否则 CISCN 会被误认成计算机设计大赛）。
 */
export const ALIAS_DICTIONARY = [
  { family: 'lanqiao', test: /蓝桥杯/, alias: '蓝桥杯' },
  { family: 'internet-plus', test: /互联网\s*\+|国际大学生创新大赛/, alias: '国创' },
  { family: 'innovation-train', test: /创新创业训练|[(（]大创[)）]|大创项目/, alias: '大创' },
  { family: 'challenge-cup', test: /挑战杯.*(学术科技|课外学术)|课外学术科技作品/, alias: '大挑' },
  { family: 'challenge-cup-biz', test: /挑战杯.*(创青春|创业计划)|创青春/, alias: '小挑' },
  { family: 'challenge-cup', test: /挑战杯/, alias: '大挑' },
  // 省赛要排在 ACM 系列前面：广东省赛的英文缩写就是 GDCPC，别被 CCPC 抢走
  { family: 'guangdong-programming', test: /广东省.*程序设计|GDCPC|省赛通道/, alias: '省赛' },
  { family: 'ccpc', test: /CCPC|中国大学生程序设计竞赛/, alias: 'CCPC' },
  { family: 'icpc', test: /ICPC|国际大学生程序设计竞赛/, alias: 'ICPC' },
  { family: 'csp', test: /CSP/, alias: 'CSP' },
  { family: 'buaa-sofware', test: /软件设计大赛|中国软件杯|软件创新大赛/, alias: '软件杯' },
  { family: 'service-outsourcing', test: /服务外包/, alias: '服务外包' },
  { family: 'computer-design', test: /计算机设计大赛|4C/, alias: '计设赛' },
  { family: 'db-contest', test: /数据库/, alias: '数据库赛' },
  { family: 'tianchi', test: /天池/, alias: '天池赛' },
  { family: 'math-modeling', test: /数学建模/, alias: '数模' },
  { family: 'statistics-modeling', test: /统计建模/, alias: '统计建模' },
  { family: 'ruankao', test: /软件(?:水平)?考试|软考/, detail: /网络工程|网工/, alias: '软考网工', generic: '软考' },
  { family: 'ruankao', test: /软件(?:水平)?考试|软考/, detail: /程序员|网络管理员|软件设计师|系统集成/, alias: '软考中级', generic: '软考' },
  { family: 'ruankao', test: /软件(?:水平)?考试|软考/, detail: /信息安全|信安/, alias: '软考信安', generic: '软考' },
  { family: 'ruankao', test: /软件(?:水平)?考试|软考|专业技术资格/, alias: '软考' },
  { family: 'ncre', test: /NCRE|计算机等级考试/, alias: '国二', generic: 'NCRE' },
  { family: 'cet6', test: /CET-?\s*6|英语六级|大学英语六级/, alias: '六级', generic: 'CET6' },
  { family: 'cet4', test: /CET-?\s*4|英语四级|大学英语四级/, alias: '四级', generic: 'CET4' },
  { family: 'nisp', test: /NISP/, alias: 'NISP' },
  { family: 'cisp', test: /CISP/, alias: 'CISP' },
  { family: 'hw-ict', test: /华为\s*ICT/, alias: '华为ICT' },
  { family: 'ict-huawei', test: /ICT/, alias: 'ICT' },
  { family: 'ciscn', test: /CISCN|信息安全竞赛/, alias: 'CISCN' },
  { family: 'iscc', test: /ISCC|信息安全与对抗/, alias: 'ISCC' },
  { family: 'qiangwang-cup', test: /强网杯/, alias: '强网杯' },
  { family: 'wangding-cup', test: /网鼎杯/, alias: '网鼎杯' },
  { family: 'yangcheng-cup', test: /羊城杯/, alias: '羊城杯' },
  { family: 'yuwang-cup', test: /御网杯/, alias: '御网杯' },
  { family: 'xctf', test: /XCTF/, alias: 'XCTF' },
  { family: 'graduate-security', test: /研究生网络安全/, alias: '研信安' },
  { family: 'ctf', test: /CTF|攻防/, alias: 'CTF' },
  { family: 'career-fair', test: /招聘会|双选会|宣讲会/, alias: '招聘会' },
  { family: 'career-planning', test: /职业规划/, alias: '职规赛' },
  { family: 'volunteer', test: /志愿服务/, alias: '志愿赛' },
  { family: 'math-competition', test: /数学竞赛/, alias: '数学赛' },
  { family: 'english-competition', test: /英语演讲|英语竞赛|外研社/, alias: '英语赛' },
  { family: 'robot', test: /机器人/, alias: '机器人' },
  { family: 'ai-competition', test: /人工智能/, alias: 'AI赛' },
]

// 自动缩写时先剥掉的套话：它们几乎出现在每一个全名里，占了格子却不提供信息
const FILLER = [
  /^["“”'‘’「」《》\s]+/, /["“”'‘’「」《》\s]+$/,
  /全国大学生/g, /中国大学生/g, /全国/g, /中国/g, /省级/g, /广东(?:省)?/g,
  /全国软件和信息技术专业人才大赛/g,
]
const SUFFIX = /(大赛|竞赛|比赛|考试|赛事|挑战赛|认证|项目|计划|赛道)$/g
const BRACKET = /[（(][^）)]{0,40}[）)]/g

const MAX_ALIAS = 6

function readable(text) {
  if (!text) return ''
  // 字母数字（CET-6、ISCC、4C）要留至少 2 个字符才认，单个字母缩出来没有意义
  const ascii = text.replace(/[^\x21-\x7e]/g, '')
  if (/^[A-Za-z0-9+._-]+$/.test(text) && text.length >= 2) return text
  if (ascii.length >= 2 && ascii.length >= text.length - 2) {
    const chinese = text.replace(/[A-Za-z0-9\s+._-]+/g, '')
    return chinese ? `${chinese.slice(0, 2)}${ascii}`.slice(0, MAX_ALIAS) : ascii
  }
  return text
}

/** 词典未命中时的兜底：剥掉套话与后缀，取前 4 个汉字（字母词保留原样）。 */
export function autoAlias(title = '', { max = MAX_ALIAS } = {}) {
  let text = String(title || '').trim()
  if (!text) return ''
  text = text.replace(BRACKET, '')
  for (const rule of FILLER) text = text.replace(rule, '')
  text = text.replace(SUFFIX, '')
  text = text.trim()
  const words = text.split(/[\s·・/／|｜]+/).filter(Boolean)
  const first = readable(words[0] || text)
  if (!first) return ''
  return [...first].slice(0, max).join('')
}

/**
 * 事项属于哪个赛事「家族」（用于判断重复）；词典没命中就返回 null。
 * 标题优先：简介里顺手提了一句「和蓝桥杯一样」不该让事项变成蓝桥杯。
 */
export function aliasFamily(item = {}) {
  const title = item.title || ''
  const hit = ALIAS_DICTIONARY.find(rule => rule.test.test(title))
    || ALIAS_DICTIONARY.find(rule => rule.test.test(item.description || ''))
  return hit ? hit.family : null
}

/** 同一赛事的不同分项 / 不同赛道要分开叫（软考→信安 / 网工，已定级的不许往「智能缩写」退）。 */
function variantOf(item, title) {
  // 「软考中级·信息安全工程师」这类写法标题里没有「软考」二字，靠 description 认亲
  const family = ALIAS_DICTIONARY.find(rule => rule.test.test(title)) || ALIAS_DICTIONARY.find(rule => rule.test.test(item.description || ''))
  if (family && family.detail) return family
  if (!family) return null
  return ALIAS_DICTIONARY.find(rule => rule.detail && rule.family === family.family && rule.detail.test(title)) || null
}

/**
 * 一个事项在月历格里该怎么称呼。
 * 返回 { alias, source }：source = 'custom' | 'dictionary' | 'auto'，
 * 详情页可以据此告诉 user「这个是自动缩写，可以自己改」。
 */
export function itemAlias(item = {}, { max = MAX_ALIAS } = {}) {
  const custom = String(item.alias || '').trim()
  if (custom) return { alias: [...custom].slice(0, 12).join(''), source: 'custom' }
  const title = item.title || ''
  // 同一赛事有多个分项的（软考→信安 / 网工），先把更具体的那条挑出来
  const detailed = variantOf(item, title)
  if (detailed) return { alias: detailed.alias, source: 'dictionary', family: detailed.family }
  const same = rule => rule.test.test(title) || rule.test.test(item.description || '')
  const hit = ALIAS_DICTIONARY.find(rule => rule.test.test(title)) || ALIAS_DICTIONARY.find(same)
  if (hit) return { alias: hit.alias, source: 'dictionary', family: hit.family }
  return { alias: autoAlias(item.title, { max }), source: 'auto' }
}

export function aliasOf(item, options) {
  return itemAlias(item, options).alias
}
