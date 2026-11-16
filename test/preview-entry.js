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

// 真实数据快照：从本机 state.json 摘典型条目（含同一赛事的重复记录、年度预测、日期未知），
// 只用于本地视觉核对「合并 + 简称」在真实密度下是否成立，不代表真实赛程已核实。
// 真实数据快照：由 node .snapshot-preview.mjs 从本机 state.json 生成（已去掉 demo 项）。
// 只用于本地视觉核对字体/密度/横带在真实数据下是否成立。
const real = {
  "version": 1,
  "profile": {
    "major": "网络空间安全",
    "year": "大三",
    "province": "广东",
    "interests": [
      "程序设计",
      "学术科研",
      "职业发展",
      "志愿服务"
    ],
    "types": [
      "competition",
      "certificate"
    ]
  },
  "items": [
    {
      "title": "中国大学生程序设计竞赛（CCPC）",
      "category": "competition",
      "organizer": "CCPC 组委会",
      "description": "ACM 赛制的五人组队程序设计竞赛，与 ICPC 亚洲区并列的国内顶级赛事，国奖对保研和大厂简历都有分量。",
      "majors": [
        "计算机科学",
        "计算机类",
        "软件工程",
        "人工智能"
      ],
      "years": [
        "大三",
        "大二"
      ],
      "regions": [
        "广东",
        "华南"
      ],
      "interests": [
        "程序设计"
      ],
      "registrationStatus": "not_open",
      "nodes": [
        {
          "id": "ccpc-net",
          "type": "registration",
          "start": "2027-09-18",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "规则写明每学年度 9 月举办网络预选赛；2027 年日期未公布，按 9 月中下旬周末推"
        },
        {
          "id": "ccpc-site",
          "type": "competition",
          "start": "2027-10-01",
          "end": "2027-12-31",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "规则写明 10—12 月举办 4 场分站赛 + 女生赛 + 高职赛，各站日期由承办校公布"
        },
        {
          "id": "ccpc-final",
          "type": "competition",
          "start": "2027-12-18",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "总决赛在 12 月中旬（参考 2026 赛季），具体以 ccpc.io 公告为准"
        }
      ],
      "notes": "按学年度组织：9 月网络赛，10—12 月分站赛，12 月总决赛。",
      "id": "28fe34c5-798e-452e-b59d-605d8dcf9bb3",
      "sourceUrl": "https://ccpc.io/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "alias": "CCPC"
    },
    {
      "category": "competition",
      "description": "华南理工大学承办的省级程序设计竞赛，难度介于校赛与 CCPC 分站赛之间，是练手和拿省级奖项的好机会。",
      "interests": [
        "程序设计"
      ],
      "majors": [
        "计算机科学",
        "计算机类",
        "软件工程",
        "人工智能"
      ],
      "nodes": [
        {
          "id": "gd-reg",
          "type": "registration",
          "start": "2027-04-01",
          "end": "2027-04-20",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "2026 年 4 月下旬发通知、5-17 比赛；2027 年按 4 月报名推"
        },
        {
          "id": "gd-comp",
          "type": "competition",
          "start": "2027-05-16",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "2026 年第二十三届为 2026-05-17（周日）；2027 年按 5 月第三个周日推"
        }
      ],
      "notes": "2026 年第二十三届于 5-17 举行。",
      "organizer": "广东省计算机学会",
      "registrationStatus": "not_open",
      "regions": [
        "广东"
      ],
      "title": "广东省大学生程序设计竞赛（GDCPC）",
      "years": [
        "大三",
        "大二"
      ],
      "id": "56f9fb7d-e5d1-4686-b86a-eca524375f79",
      "sourceUrl": "https://www.gdcomf.com/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "alias": "省赛"
    },
    {
      "category": "competition",
      "description": "用 CCF CSP 认证成绩作为程序设计能力的第三方证明，头部互联网企业校招简历常看它；大三正是刷一次好分数的时间点。",
      "interests": [
        "职业发展",
        "程序设计"
      ],
      "majors": [
        "计算机科学",
        "计算机类",
        "软件工程",
        "人工智能"
      ],
      "nodes": [
        {
          "id": "csp-44",
          "type": "exam",
          "start": "2026-12-13",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第 44 次 CSP 认证 2026-12-13（CCF 官网认证日历）"
        },
        {
          "id": "csp-45",
          "type": "exam",
          "start": "2027-03-28",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "2027 年考次未公布；2026 年为 3-29、5-31、9-13、12-13，按同节奏推 2027-03-28（周日）"
        },
        {
          "id": "csp-46",
          "type": "exam",
          "start": "2027-05-30",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "按 2026 年 5-31 的节奏推 2027-05-30（周日）"
        },
        {
          "id": "csp-47",
          "type": "exam",
          "start": "2027-09-12",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "按 2026 年 9-13 的节奏推 2027-09-12（周日）"
        },
        {
          "id": "csp-48",
          "type": "exam",
          "start": "2027-12-12",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "按 2026 年 12-13 的节奏推 2027-12-12（周日）"
        }
      ],
      "notes": "每年 3/5/9/12 月各一场，报满即考。",
      "organizer": "中国计算机学会（CCF）",
      "registrationStatus": "unknown",
      "regions": [
        "全国"
      ],
      "title": "CCF CSP 软件能力认证",
      "years": [
        "大三"
      ],
      "id": "5807a65e-a7e7-44e3-bdae-7a722f35c5bd",
      "sourceUrl": "https://cspro.org/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "alias": "CSP"
    },
    {
      "category": "competition",
      "description": "共青团中央与教育部等部门主办的大学生学术科技作品竞赛，分自然科学类学术论文、科技发明制作等类别；大三有科研经历正适合组队。",
      "interests": [
        "学术科研",
        "程序设计"
      ],
      "majors": [
        "计算机科学",
        "计算机类",
        "软件工程",
        "人工智能"
      ],
      "nodes": [
        {
          "id": "tzb-school",
          "type": "submission",
          "start": "2026-11-20",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "多校 2027 年挑战杯通知：院赛作品 2026-11-20 前报送，校决赛 2026-12"
        },
        {
          "id": "tzb-prov",
          "type": "competition",
          "start": "2027-02-01",
          "end": "2027-05-31",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "团省委通知：第十九届广东大学生课外学术科技作品竞赛定于 2027 年 2 月至 5 月举办"
        }
      ],
      "notes": "第十九届（2027）：校赛 2026-11 至 2027-01，省赛 2027-02 至 05。",
      "organizer": "共青团中央 / 中国科协 / 教育部",
      "registrationStatus": "open",
      "regions": [
        "广东",
        "全国"
      ],
      "title": "“挑战杯”全国大学生课外学术科技作品竞赛",
      "years": [
        "大三"
      ],
      "id": "2b12e460-4bd1-43a3-9756-228730b65b9e",
      "sourceUrl": "https://www.tiaozhanbei.net/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "alias": "大挑"
    },
    {
      "category": "competition",
      "description": "阿里云天池大数据竞赛平台上的算法与数据科学赛题，名次靠前有奖金与阿里云实习直通机会，是大厂简历的高说服力项。",
      "interests": [
        "职业发展",
        "学术科研"
      ],
      "majors": [
        "计算机科学",
        "计算机类",
        "人工智能",
        "软件工程"
      ],
      "nodes": [
        {
          "id": "tc-open",
          "type": "competition",
          "start": "2027-01-01",
          "end": "2027-12-31",
          "accuracy": "range",
          "confidence": "unknown",
          "note": "天池按赛题滚动开赛（算法/数据科学），没有统一年度档期；选定赛事后再补日期"
        }
      ],
      "notes": "平台常年滚动办赛。",
      "organizer": "阿里云",
      "registrationStatus": "unknown",
      "regions": [
        "全国"
      ],
      "title": "阿里云天池大数据竞赛",
      "years": [
        "大三"
      ],
      "id": "853c359c-4ddf-43b4-a976-378eb98fc220",
      "sourceUrl": "https://tianchi.aliyun.com/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "alias": "天池赛"
    },
    {
      "category": "competition",
      "description": "中国大学生服务外包创新创业大赛，企业真实命题 + 团队交付，比纯算法赛更接近工程与产品能力，对找实习有加分。",
      "interests": [
        "职业发展",
        "程序设计"
      ],
      "majors": [
        "计算机科学",
        "计算机类",
        "软件工程"
      ],
      "nodes": [
        {
          "id": "so-reg",
          "type": "registration",
          "start": "2027-02-11",
          "end": "2027-03-20",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "第十七届报名为 2026-02-11 至 03-20；2027 年按同窗口推"
        },
        {
          "id": "so-region",
          "type": "competition",
          "start": "2027-05-01",
          "end": "2027-06-30",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "区域赛初赛/决赛预计 2027 年 5—6 月"
        },
        {
          "id": "so-final",
          "type": "competition",
          "start": "2027-08-15",
          "end": "2027-08-20",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "全国总决赛预计 2027 年 8 月中旬"
        }
      ],
      "notes": "第十八届（2027）：报名 2027 年 2—3 月，国赛 8 月中旬。",
      "organizer": "教育部 / 商务部 / 无锡市人民政府",
      "registrationStatus": "not_open",
      "regions": [
        "广东",
        "全国"
      ],
      "title": "中国大学生服务外包创新创业大赛",
      "years": [
        "大三"
      ],
      "id": "a89f9480-c143-487f-90de-2771de52315b",
      "sourceUrl": "http://www.fwwb.org.cn/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "alias": "服务外包"
    },
    {
      "category": "competition",
      "description": "腾讯等企业支持的全国性志愿服务项目赛事/公益计划，与「志愿服务」方向对齐，同时是简历上的软性加分项。",
      "interests": [
        "志愿服务"
      ],
      "majors": [
        "计算机科学",
        "计算机类",
        "软件工程",
        "人工智能"
      ],
      "nodes": [
        {
          "id": "zy-reg",
          "type": "submission",
          "start": "2026-06-01",
          "end": "2026-06-30",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "第八届官方：申报 2026-06-01 至 06-30"
        },
        {
          "id": "zy-run",
          "type": "competition",
          "start": "2026-07-01",
          "end": "2026-12-31",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "第八届活动时间 2026 年 6 月—12 月"
        }
      ],
      "notes": "第八届（2026）申报 6 月，赛期 6—12 月。",
      "organizer": "共青团中央 / 中国青年志愿者协会",
      "registrationStatus": "closed",
      "regions": [
        "全国"
      ],
      "title": "中国青年志愿服务项目大赛",
      "years": [
        "大三",
        "大二"
      ],
      "id": "d7d8af42-d893-4a13-a5e6-5c427f502583",
      "sourceUrl": "http://zhijh.youth.cn/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "alias": "志愿赛"
    },
    {
      "title": "全国大学生数学建模竞赛（CUMCM）",
      "category": "competition",
      "organizer": "中国工业与应用数学学会（CSIAM）",
      "regions": [
        "广东"
      ],
      "majors": [
        "计算机科学"
      ],
      "years": [
        "大三"
      ],
      "interests": [
        "学术科研",
        "程序设计"
      ],
      "registrationStatus": "not_open",
      "sourceUrl": "http://www.mcm.edu.cn/",
      "description": "三天三夜团队赛，省级奖对保研加分明显，计算机学生通常承担编程与数据部分。",
      "nodes": [
        {
          "id": "mm-2027",
          "type": "competition",
          "start": "2027-09-09",
          "end": "2027-09-12",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "2026 年为 9-10 18:00 至 9-13 20:00（官方通知）；2027 年按 9 月第二周周四起推"
        },
        {
          "id": "mm-reg",
          "type": "registration",
          "start": "2027-06-01",
          "end": "2027-09-01",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "报名由各校教务/数学院组织，通常在 6—9 月初完成"
        }
      ],
      "notes": "每年 9 月中旬，72 小时连续赛。",
      "id": "aa09bbbd-53d5-4480-9b3d-98669b9f017a",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "数模"
    },
    {
      "category": "certificate",
      "interests": [
        "职业发展",
        "程序设计"
      ],
      "majors": [
        "计算机科学"
      ],
      "nodes": [
        {
          "id": "ncre-27a",
          "type": "exam",
          "start": "2027-03-27",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "2027 年 3 月批次日期未公布；近三年为 2024-03-23、2025-03-29、2026-03-28（均为 3 月最后一个周末），推 2027-03-27"
        },
        {
          "id": "ncre-27b",
          "type": "exam",
          "start": "2027-09-25",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "9 月批次按 9 月最后一个周末推（2026 年为 9-19 至 9-21）"
        },
        {
          "id": "ncre-27reg",
          "type": "registration",
          "start": "2026-12-20",
          "end": "2027-01-20",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "报名一般在考前 2—3 个月由各省陆续开放，2027 年 3 月批次预计 2026-12 至 2027-01"
        }
      ],
      "notes": "每年 3 月、9 月两次全国统考。",
      "organizer": "教育部教育考试院",
      "registrationStatus": "not_open",
      "sourceUrl": "https://ncre.neea.edu.cn/",
      "title": "全国计算机等级考试（NCRE 二级）",
      "years": [
        "大三"
      ],
      "id": "69c2d700-708d-4af6-8874-9c956262465b",
      "verifiedAt": "2026-11-16",
      "description": "",
      "eligibility": "",
      "regions": [],
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "国二"
    },
    {
      "category": "competition",
      "description": "面向学生的数据库/数据系统能力赛，国赛含金量较高，适合有志于后端与数据岗位的同学。",
      "interests": [
        "程序设计",
        "职业发展"
      ],
      "majors": [
        "计算机科学"
      ],
      "nodes": [
        {
          "id": "db-reg",
          "type": "registration",
          "start": "2027-04-01",
          "end": "2027-05-31",
          "accuracy": "range",
          "confidence": "unknown",
          "note": "2027 年赛程未公布；往年 4—5 月报名、暑期决赛，具体关注 CCF 数据库专委会公告"
        }
      ],
      "notes": "每年一届，赛程分初赛与决赛。",
      "organizer": "中国计算机学会数据库专委会",
      "registrationStatus": "unknown",
      "regions": [
        "广东"
      ],
      "sourceUrl": "http://dbsc.ccf.org.cn/",
      "title": "CCF 中国数据库系统大赛（CCF-DBC）",
      "years": [
        "大三"
      ],
      "id": "58d7c57a-cf50-4aee-ab7e-36f36d64c66b",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "数据库赛"
    },
    {
      "title": "“强网杯”全国网络安全挑战赛",
      "category": "competition",
      "description": "国内高水平网络安全挑战赛，含线上赛与线下赛（CTF/Real World），题目难度与业界认可度较高，适合作为进阶攻防训练和简历背书。",
      "organizer": "河南省委网信办 / 信息工程大学 / 郑州大学",
      "eligibility": "面向高校学生与网络安全从业者，学生组/公开组设置以当年通知为准。",
      "majors": [
        "网络空间安全",
        "计算机类"
      ],
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "程序设计",
        "职业发展"
      ],
      "regions": [
        "全国"
      ],
      "registrationStatus": "closed",
      "notes": "第十届（2026）：线上赛 10 月下旬，线下赛 11 月下旬。",
      "nodes": [
        {
          "id": "qw-online",
          "type": "competition",
          "start": "2026-10-24",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第十届官方通稿：线上赛 10 月下旬举行"
        },
        {
          "id": "qw-offline",
          "type": "competition",
          "start": "2026-11-21",
          "end": "2026-11-30",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "第十届官方通稿：线下赛、学院邀请赛 11 月下旬举办"
        },
        {
          "id": "qw-next",
          "type": "competition",
          "start": "2027-10-01",
          "end": "2027-11-30",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "第十一届时间未公布；按第十届 10 月线上、11 月线下的节奏推"
        }
      ],
      "id": "a7afbcb6-c68b-4c31-9e31-5e0c25c7e025",
      "sourceUrl": "https://www.qiangwangbei.com/",
      "verifiedAt": "2026-11-16",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "强网杯"
    },
    {
      "title": "“羊城杯”网络安全大赛",
      "category": "competition",
      "description": "粤港澳大湾区网络安全赛事，在广州举办，含 CTF/攻防对抗，参赛与本地安全企业曝光机会较多，适合积累实战与求职背书。",
      "organizer": "广州市委网信办",
      "eligibility": "面向高校学生及网络安全从业者，分组以当年通知为准。",
      "majors": [
        "网络空间安全",
        "计算机类"
      ],
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "程序设计",
        "职业发展"
      ],
      "regions": [
        "广东"
      ],
      "venue": "广州",
      "registrationStatus": "closed",
      "notes": "第七届（2026）决赛 11-07 于广州职业技术大学。",
      "nodes": [
        {
          "id": "yc-final",
          "type": "competition",
          "start": "2026-11-07",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第七届决赛 2026-11-07（南方都市报/信息时报报道）"
        },
        {
          "id": "yc-next",
          "type": "competition",
          "start": "2027-11-06",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "第八届未公布；按前几届秋季决赛的节奏推 2027-11 第一个周六"
        }
      ],
      "id": "2ef80c79-c8d4-4c06-87df-22b907ad80a1",
      "sourceUrl": "https://gzwxb.gov.cn/",
      "verifiedAt": "2026-11-16",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "alias": "羊城杯"
    },
    {
      "title": "全国大学生信息安全与对抗技术竞赛（ISCC）",
      "category": "competition",
      "description": "面向全国大学生的信息安全对抗赛，含线上挑战赛与线下对抗赛，侧重实战攻防，适合 CTF 战队以赛代练。",
      "organizer": "北京理工大学信息系统及安全对抗实验中心",
      "eligibility": "全国高校在校学生，个人/团队报名方式以当年通知为准。",
      "majors": [
        "网络空间安全",
        "计算机类"
      ],
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "程序设计",
        "学术科研"
      ],
      "regions": [
        "全国"
      ],
      "registrationStatus": "not_open",
      "notes": "线上挑战赛（破阵夺旗/无限擂台/数据安全）每年 5 月。",
      "nodes": [
        {
          "id": "iscc-reg",
          "type": "registration",
          "start": "2027-04-30",
          "end": "2027-05-07",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "第 22 届报名 2025-04-30 — 05-07；2027 年（第 24 届）按同节奏推"
        },
        {
          "id": "iscc-comp",
          "type": "competition",
          "start": "2027-05-08",
          "end": "2027-05-18",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "第 22 届校级赛 5/1—7、区域赛 5/10—15、总决赛 5/16—18；2027 年按 5 月中旬窗口推"
        }
      ],
      "id": "2e32cde2-760e-4505-a145-09df40e9a413",
      "sourceUrl": "https://www.isclab.org.cn/",
      "verifiedAt": "2026-11-16",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "ISCC"
    },
    {
      "title": "XCTF 国际网络攻防联赛（高校组）",
      "category": "competition",
      "description": "国内高校 CTF 战队常参加的联赛体系，全年多站分站赛与总决赛，适合长期训练、攒积分与战队排名。",
      "organizer": "XCTF 联赛组委会",
      "eligibility": "高校在校学生，以战队为单位参赛，具体以各分站赛通知为准。",
      "majors": [
        "网络空间安全",
        "计算机类"
      ],
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "程序设计",
        "职业发展"
      ],
      "regions": [
        "全国"
      ],
      "registrationStatus": "unknown",
      "notes": "分站赛全年滚动，各站独立报名。",
      "nodes": [
        {
          "id": "xctf-2027",
          "type": "competition",
          "start": "2027-01-01",
          "end": "2027-12-31",
          "accuracy": "range",
          "confidence": "unknown",
          "note": "联赛全年滚动开赛，没有统一的年度日期；具体站次看 xctf.org.cn 公告"
        }
      ],
      "id": "bfead412-a416-4c7f-b324-a0a687cd1ec2",
      "sourceUrl": "https://www.xctf.org.cn/",
      "verifiedAt": "2026-11-16",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "XCTF"
    },
    {
      "title": "华为 ICT 大赛（第十一届）",
      "category": "competition",
      "description": "华为面向全球大学生的 ICT 赛事，设网络、云、计算等赛道，按省赛—中国区总决赛—全球赛晋级；对进华为及 ICT 行业求职有直接背书。",
      "organizer": "华为技术有限公司",
      "eligibility": "全球高校在校学生，赛道与组队要求以当年通知为准。",
      "majors": [
        "网络空间安全",
        "计算机类"
      ],
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "职业发展",
        "程序设计"
      ],
      "regions": [
        "全国",
        "广东"
      ],
      "registrationStatus": "closed",
      "notes": "第十一届中国赛 2026-08 至 2027-04。",
      "nodes": [
        {
          "id": "ict-reg",
          "type": "registration_deadline",
          "start": "2026-10-31",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第十一届通知：实践赛报名 2026-08-31 — 10-31"
        },
        {
          "id": "ict-prov",
          "type": "competition",
          "start": "2026-11-01",
          "end": "2026-12-31",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "第十一届：省赛 2026 年 11—12 月"
        },
        {
          "id": "ict-final",
          "type": "competition",
          "start": "2027-03-01",
          "end": "2027-04-30",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "第十一届：中国总决赛 2027 年 3—4 月"
        },
        {
          "id": "ict-global",
          "type": "competition",
          "start": "2027-05-20",
          "end": "2027-05-31",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "第十一届：全球总决赛 2027 年 5 月，深圳"
        }
      ],
      "id": "9c0feb4e-5720-44de-b00f-a71af3c118e9",
      "sourceUrl": "https://e.huawei.com/cn/talent/ict-academy/",
      "verifiedAt": "2026-11-16",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "华为ICT"
    },
    {
      "title": "计算机技术与软件专业技术资格（水平）考试 · 信息安全工程师",
      "category": "certificate",
      "description": "全国计算机技术与软件专业技术资格（水平）考试的中级资格，偏信息安全工程与管理；国企、事业单位及部分安全岗位招聘认可，可作为求职背书。",
      "organizer": "工信部教育与考试中心",
      "eligibility": "不限学历与资历，可直接报考中级；以当年考务通知为准。",
      "majors": [
        "网络空间安全",
        "计算机类"
      ],
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "职业发展"
      ],
      "regions": [
        "全国",
        "广东"
      ],
      "sourceUrl": "https://www.ruankao.org.cn/",
      "registrationStatus": "not_open",
      "notes": "中级·信息安全工程师，上半年开考。",
      "nodes": [
        {
          "id": "rk-reg",
          "type": "registration",
          "start": "2027-03-15",
          "end": "2027-04-15",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "2027 年报名窗口预计 3 月中旬至 4 月中旬，各省错峰开放，不设补报"
        },
        {
          "id": "rk-exam",
          "type": "exam",
          "start": "2027-05-22",
          "end": "2027-05-23",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "近三年考试为 2024-05-25、2025-05-24、2026-05-23，逐年小幅前移，推 2027-05-22 至 23，以人社部年度考试计划为准"
        }
      ],
      "id": "16cfbe83-f169-47e8-bfbf-4d7c4030ee0d",
      "verifiedAt": "2026-11-16",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "软考信安"
    },
    {
      "title": "NISP 国家信息安全水平考试（二级）",
      "category": "certificate",
      "description": "中国信息安全测评中心推出的信息安全水平考试，分一级/二级，覆盖安全基础与实操；常作为安全岗实习与校招的加分项。",
      "organizer": "中国信息安全测评中心",
      "eligibility": "在校学生；级别与报考条件（是否需先取得一级）以官网通知为准。",
      "majors": [
        "网络空间安全",
        "计算机类"
      ],
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "职业发展"
      ],
      "regions": [
        "全国"
      ],
      "sourceUrl": "https://www.nisp.org.cn/",
      "registrationStatus": "unknown",
      "notes": "线上机考，每月最后一个周五。",
      "nodes": [
        {
          "id": "nisp-m",
          "type": "exam",
          "start": "2026-11-27",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "NISP 每月一次，固定最后一周周五 18:00—19:40；具体场次以报名系统为准"
        }
      ],
      "id": "7b8ec501-8317-46ef-8f01-0d919175a81e",
      "verifiedAt": "2026-11-16",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "NISP"
    },
    {
      "title": "全国大学生信息安全竞赛（创新实践能力赛）",
      "category": "competition",
      "organizer": "中国信息安全测评中心 / 教育部网络空间安全专业教指委",
      "description": "网络安全方向国内权威赛事，含线上初赛与线下总决赛，作品赛与创新实践赛并行。",
      "majors": [
        "网络空间安全",
        "计算机类",
        "软件工程",
        "信息安全"
      ],
      "years": [
        "大三",
        "大四",
        "研一",
        "研二"
      ],
      "regions": [
        "广东",
        "全国"
      ],
      "interests": [
        "程序设计",
        "学术科研",
        "职业发展"
      ],
      "nodes": [
        {
          "id": "cis-ddl",
          "type": "registration_deadline",
          "start": "2026-12-21",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第二十届通知：报名 2026-12-21 0 时截止"
        },
        {
          "id": "cis-pre",
          "type": "competition",
          "start": "2026-12-27",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第二十届初赛（线上）2026-12-27"
        },
        {
          "id": "cis-final",
          "type": "competition",
          "start": "2027-04-01",
          "end": "2027-06-30",
          "accuracy": "range",
          "confidence": "pending_confirmation",
          "note": "半决赛/总决赛时间以 ciscn.cn 参赛规程为准，暂按二季度窗口记"
        }
      ],
      "id": "2ffa69a8-307e-485e-be5c-2bec4d6ce4e0",
      "sourceUrl": "http://www.ciscn.cn/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "registrationStatus": "closed",
      "notes": "第二十届（2026-2027）。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "CISCN"
    },
    {
      "title": "中国大学生计算机设计大赛（4C）",
      "category": "competition",
      "organizer": "教育部高校计算机类专业教指委等",
      "description": "团队作品赛，设软件应用、物联网、大数据、人工智能等大类，省赛→国赛选拔。",
      "majors": [
        "网络空间安全",
        "计算机类",
        "软件工程"
      ],
      "years": [
        "大二",
        "大三",
        "大四"
      ],
      "regions": [
        "广东",
        "全国"
      ],
      "interests": [
        "程序设计",
        "学术科研"
      ],
      "nodes": [
        {
          "id": "4c-school",
          "type": "submission",
          "start": "2027-03-01",
          "end": "2027-04-30",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "校赛阶段每年 3—4 月：3 月报名与作品提交、4 月校决赛"
        },
        {
          "id": "4c-prov",
          "type": "competition",
          "start": "2027-05-01",
          "end": "2027-06-30",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "省赛每年 5—6 月，5 月底前完成上推"
        },
        {
          "id": "4c-final",
          "type": "competition",
          "start": "2027-07-01",
          "end": "2027-08-31",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "国赛决赛每年 7 月中旬至 8 月下旬，分 6 个决赛区"
        }
      ],
      "id": "39e1e456-2ae7-4206-ad0b-8aa0926d7c61",
      "sourceUrl": "https://jsjds.blcu.edu.cn/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "registrationStatus": "not_open",
      "notes": "校赛 4 月、省赛 5—6 月、国赛 7—8 月。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "计设赛"
    },
    {
      "title": "中国国际大学生创新大赛",
      "category": "competition",
      "organizer": "教育部",
      "description": "规模最大的创新创业赛事，设高教主赛道、青年红色筑梦之旅等，校级→省级→国赛三级。",
      "majors": [
        "网络空间安全",
        "计算机类",
        "软件工程"
      ],
      "years": [
        "大二",
        "大三",
        "大四",
        "研一"
      ],
      "regions": [
        "广东",
        "全国"
      ],
      "interests": [
        "程序设计",
        "职业发展",
        "志愿服务"
      ],
      "nodes": [
        {
          "id": "cy-school-1",
          "type": "submission",
          "start": "2026-11-10",
          "end": "2026-11-26",
          "accuracy": "range",
          "confidence": "official_confirmed",
          "note": "多校 2027 年校赛方案：校级初赛 2026-11-10 至 11-26"
        },
        {
          "id": "cy-school-2",
          "type": "competition",
          "start": "2026-12-17",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "校级决赛暂定 2026-12-17"
        },
        {
          "id": "cy-prov",
          "type": "competition",
          "start": "2027-07-01",
          "end": "2027-07-31",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "省赛往年安排在 7 月中旬；2027 年以省教育厅通知为准"
        }
      ],
      "id": "198b2a86-f4a5-4d76-8d7c-7f1179f939ca",
      "sourceUrl": "https://cy.ncss.cn/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "registrationStatus": "open",
      "notes": "校赛 11 月启动，次年 5 月决赛，省赛 7 月中旬。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "国创"
    },
    {
      "category": "competition",
      "description": "个人赛形式，设 C/C++、Java、Python 与网络安全等赛道，省赛通过可进国赛。",
      "majors": [
        "网络空间安全",
        "计算机类",
        "软件工程"
      ],
      "nodes": [
        {
          "id": "lq-ddl",
          "type": "registration_deadline",
          "start": "2026-12-18",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第十八届通知：软件赛/电子赛/人工智能赛报名 2026-10-08 10:00 — 2026-12-18 14:00"
        },
        {
          "id": "lq-prov",
          "type": "competition",
          "start": "2027-04-10",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第十八届省赛：C/C++、Java、Python 程序设计 2027-04-10（周六）9:00—13:00；Web 应用开发 2027-04-24；电子赛单片机 2027-04-11"
        },
        {
          "id": "lq-final",
          "type": "competition",
          "start": "2027-06-10",
          "end": "2027-06-20",
          "accuracy": "range",
          "confidence": "pending_confirmation",
          "note": "全国总决赛官方只写「2027 年 6 月中上旬」，未给具体日"
        }
      ],
      "organizer": "中国软件行业协会 / 蓝桥杯大赛组委会",
      "regions": [
        "广东",
        "全国"
      ],
      "title": "蓝桥杯全国软件和信息技术专业人才大赛",
      "years": [
        "大二",
        "大三",
        "大四"
      ],
      "interests": [
        "程序设计",
        "职业发展"
      ],
      "id": "bd310192-ec8e-41a8-a503-0f2f35917395",
      "sourceUrl": "https://dasai.lanqiao.cn/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "registrationStatus": "open",
      "notes": "第十八届。省赛各赛项日期不同，以官网为准。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "蓝桥杯"
    },
    {
      "category": "certificate",
      "description": "毕业与保研常见门槛，六级可多次刷分，建议大三上先稳过。",
      "majors": [
        "网络空间安全",
        "计算机类",
        "软件工程"
      ],
      "nodes": [
        {
          "id": "cet6-2026b",
          "type": "exam",
          "start": "2026-12-12",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "2026 年下半年笔试 2026-12-12（各校教务处转发考试院通知；口试 11-22）"
        },
        {
          "id": "cet6-2027a",
          "type": "exam",
          "start": "2027-06-19",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "2027 年上半年公告未发布；CET 固定在 6 月第三个周六（2026 年为 6-13），推 2027-06-19，以中国教育考试网为准"
        },
        {
          "id": "cet6-2027b",
          "type": "exam",
          "start": "2027-12-18",
          "end": null,
          "accuracy": "exact",
          "confidence": "predicted",
          "note": "2027 年下半年按 12 月第三个周六推 2027-12-18，以官网为准"
        }
      ],
      "organizer": "教育部教育考试院",
      "regions": [
        "广东"
      ],
      "sourceUrl": "https://cet.neea.edu.cn/",
      "title": "大学英语六级（CET-6）",
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "学术科研",
        "职业发展"
      ],
      "id": "e4f6bbc8-b6bf-4761-a1a1-43a8fb60b4d1",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "registrationStatus": "unknown",
      "notes": "每年 6 月、12 月各一次，笔试固定在第三个周六前后。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "六级"
    },
    {
      "category": "certificate",
      "description": "国家级网络安全方向职业资格，涵盖渗透测试、应急响应等，对网安就业方向权重高，建议大三下起准备。",
      "majors": [
        "网络空间安全",
        "信息安全",
        "计算机类"
      ],
      "nodes": [
        {
          "id": "cisp-m",
          "type": "exam",
          "start": "2027-01-01",
          "end": "2027-12-31",
          "accuracy": "range",
          "confidence": "unknown",
          "note": "CISP 系列不设全国统一考期，由授权培训机构按月开班；具体班次需咨询培训机构"
        }
      ],
      "organizer": "中国信息安全测评中心",
      "regions": [
        "广东"
      ],
      "title": "CISP / CISP-PTE 注册信息安全专业人员认证",
      "years": [
        "大三",
        "大四"
      ],
      "interests": [
        "职业发展"
      ],
      "id": "e0698cb1-fa34-4214-907d-7a84c7da9338",
      "sourceUrl": "https://www.cisp.org.cn/",
      "verifiedAt": "2026-11-16",
      "eligibility": "",
      "registrationStatus": "unknown",
      "notes": "需授权培训机构报名，考试时间随培训班次。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "CISP"
    },
    {
      "category": "competition",
      "title": "“网鼎杯”网络安全大赛",
      "authority": "国家网络安全等级保护与防线建设领域主管部门联合主办",
      "description": "国内规模最大的网络安全攻防赛事，设高校组（青龙组），是网安专业学生最有分量的 CTF 类经历之一。",
      "interests": [
        "程序设计",
        "职业发展"
      ],
      "majors": [
        "网络空间安全"
      ],
      "years": [
        "大三"
      ],
      "regions": [
        "全国",
        "广东"
      ],
      "registrationStatus": "unknown",
      "nodes": [
        {
          "id": "wd-reg",
          "type": "registration",
          "start": "2027-06-01",
          "end": "2027-08-31",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "赛制为两年一届，第四届在 2024 年 11 月，第五届预计 2026—2027 年；往年报名在 6—8 月，以官网公告为准"
        },
        {
          "id": "wd-comp",
          "type": "competition",
          "start": "2027-11-01",
          "end": "2027-11-30",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "历届决赛都在 11 月（2024 年第四届 11-25 闭幕），按此推 2027 年 11 月"
        }
      ],
      "id": "47c559c7-7a8d-4df3-9657-a0a53b9e13c6",
      "sourceUrl": "https://www.wangdingcup.com/",
      "verifiedAt": "2026-11-16",
      "organizer": "公安部 / 国家网络与信息安全信息通报中心",
      "eligibility": "",
      "notes": "原则上每两年一届：2018、2020、2022、2024（第四届）。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "网鼎杯"
    },
    {
      "category": "competition",
      "description": "高校创新创业训练最大的官方立项渠道，可自选网安课题（漏洞挖掘、隐私计算等）做大创，保研与学术科研履历的重要抓手。",
      "interests": [
        "学术科研",
        "程序设计"
      ],
      "majors": [
        "网络空间安全"
      ],
      "regions": [
        "全国",
        "广东"
      ],
      "registrationStatus": "not_open",
      "title": "大学生创新创业训练计划（大创项目）",
      "years": [
        "大三"
      ],
      "nodes": [
        {
          "id": "dc-reg",
          "type": "registration",
          "start": "2027-03-01",
          "end": "2027-03-31",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "各校一般在春季学期 3 月组织立项申报；具体以本校教务处通知为准"
        },
        {
          "id": "dc-mid",
          "type": "submission",
          "start": "2027-11-01",
          "end": "2027-11-30",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "中期检查通常安排在 11 月"
        }
      ],
      "id": "2a194f40-1f5c-4a83-93b0-817ec7b9f3ba",
      "sourceUrl": "",
      "verifiedAt": "2026-11-16",
      "organizer": "教育部高教司 / 各校教务处",
      "eligibility": "",
      "notes": "校级立项 3 月、中期检查 11 月，各校略有差异。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "大创"
    },
    {
      "category": "competition",
      "description": "中国研究生创新实践系列赛中的网络安全专项，本科阶段可组队参与开源情报或安全赛道的入门历练。",
      "interests": [
        "程序设计",
        "职业发展"
      ],
      "majors": [
        "网络空间安全"
      ],
      "regions": [
        "全国",
        "广东"
      ],
      "registrationStatus": "closed",
      "title": "中国研究生网络安全创新大赛",
      "years": [
        "大三"
      ],
      "nodes": [
        {
          "id": "gs-reg",
          "type": "registration_deadline",
          "start": "2026-10-18",
          "end": null,
          "accuracy": "exact",
          "confidence": "official_confirmed",
          "note": "第五届通知：官网报名 2026-06-18 至 2026-10-18 23:59"
        },
        {
          "id": "gs-next",
          "type": "registration",
          "start": "2027-06-18",
          "end": "2027-10-18",
          "accuracy": "range",
          "confidence": "predicted",
          "note": "第六届未公布；按第五届同窗口推（研究生赛事，本科生通常不可报名）"
        }
      ],
      "id": "a742553a-9ac1-4ae3-bfe0-912758550712",
      "sourceUrl": "https://cpipc.acge.org.cn/",
      "verifiedAt": "2026-11-16",
      "organizer": "教育部学位与研究生教育发展中心",
      "eligibility": "",
      "notes": "第五届（2026）报名 6-18 至 10-18。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "研信安"
    },
    {
      "category": "competition",
      "description": "广州市网信办指导、高校与安全企业联合举办的学生网络安全攻防赛，校赛/市赛层级，适合积累比赛手感与本地实习人脉。",
      "interests": [
        "程序设计",
        "职业发展",
        "志愿服务"
      ],
      "majors": [
        "网络空间安全"
      ],
      "regions": [
        "广东",
        "广州"
      ],
      "registrationStatus": "unknown",
      "title": "网络安全 CTF 实战赛事（校际 / 省市联赛）",
      "years": [
        "大三"
      ],
      "nodes": [
        {
          "id": "ctf-open",
          "type": "competition",
          "start": "2027-01-01",
          "end": "2027-12-31",
          "accuracy": "range",
          "confidence": "unknown",
          "note": "校际/省市 CTF 赛没有固定档期，按各赛事公告报名；有目标赛事时告诉我具体名字再补日期"
        }
      ],
      "id": "356bb5e2-ccda-4ab1-b7ca-39ca775d7271",
      "sourceUrl": "",
      "verifiedAt": "2026-11-16",
      "organizer": "各主办高校与安全企业",
      "eligibility": "",
      "notes": "不定期赛事，按具体比赛公告报名。",
      "demo": false,
      "imageUrl": "",
      "artist": "",
      "venue": "",
      "alias": "CTF"
    }
  ],
  "favorites": [],
  "reminders": []
}

// 建议接口回一点真数据，方便看「不知道该排什么？」这块的排版
const suggestions = [
  { id: 'sug-lanqiao', title: '蓝桥杯（C/C++、Java、Python 组）', category: 'competition', organizer: '工业和信息化部人才交流中心', regions: ['广东'], why: '个人赛制、周期长，适合边刷题边攒一次国赛经历', typical: '往年 10–12 月报名，次年 3–4 月省赛', ask: '帮我查一下下一届蓝桥杯的报名时间和省赛时间，写进赛事日历' },
  { id: 'sug-csp', title: 'CCF CSP 软件能力认证', category: 'certificate', organizer: '中国计算机学会（CCF）', regions: ['全国'], why: '一年多次场次，成绩可用于求职与部分院校复试', typical: '往年一年约 3 场，常排在 3 / 9 / 12 月', ask: '查一下今年接下来那场 CCF CSP 的认证时间和报名截止，写进赛事日历' },
]

// ?data=real 用真实数据快照；?month=2027-05 指定初始月份（真实数据的年份都在 2027）
// ?dupes=1 让重复记录接口回一组真数据：用来核对「重复记录」卡片和合并按钮在真实密度下的样子
const params = new URLSearchParams(location.search)
const dataset = params.get('data') === 'real' ? real : sample
const dupes = params.get('dupes') === '1' ? [
  { key: 'lanqiao@2027', family: 'lanqiao', primaryId: 'r-lanqiao-a', title: '蓝桥杯（C/C++、Java、Python 组）', nodeCount: 2, labels: ['报名开始', '比赛日期'],
    duplicates: ['r-lanqiao-b'], titles: ['蓝桥杯（C/C++、Java、Python 组）', '蓝桥杯全国软件和信息技术专业人才大赛'], ids: ['r-lanqiao-a', 'r-lanqiao-b'] },
  { key: 'math-modeling@2027', family: 'math-modeling', primaryId: 'r-math', title: '全国大学生数学建模竞赛', nodeCount: 1, labels: ['比赛日期'],
    duplicates: [], titles: ['全国大学生数学建模竞赛', '全国大学生数学建模竞赛（国赛）'], ids: ['r-math', 'r-math-b'] },
] : []

// 预览里的写接口是「真的写进内存副本」：标记重要程度后要能立刻看到格子变色、按钮选中，
// 否则这个交互在预览里永远点不动，等于没法验收。
let datasetLive = dataset
window.fetch = async (url, options = {}) => {
  let body
  const post = options.method === 'POST' && options.body
  const payload = post ? JSON.parse(options.body) : null
  if (url.includes('suggestions')) body = { items: suggestions }
  else if (url.includes('duplicates')) body = { duplicates: dupes, auto: true }
  else if (url.includes('/campus-calendar/items/level') && post) {
    datasetLive = {
      ...datasetLive,
      items: datasetLive.items.map(item => item.id !== payload.id ? item : {
        ...item,
        nodes: item.nodes.map(node => {
          if (payload.nodeId && node.id !== payload.nodeId) return node
          const { level: _old, ...rest } = node
          return payload.level ? { ...rest, level: Number(payload.level) } : rest
        }),
      }),
    }
    body = datasetLive
  } else if (url.includes('/campus-calendar/state') && post) {
    body = datasetLive = Object.assign({}, datasetLive, payload)
  } else body = datasetLive
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
