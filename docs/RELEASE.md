# 发布到 DSH 插件市场 + GitHub（可复用操作手册）

> 适用任意 dsh 插件。`tools/release/` 是随仓库复制的工具层：换一个插件，**用 `scaffold-release.mjs` 一键装过去**，再用 `sync-release-kit.mjs` 做多仓库同步。
> 顺序固定：**P0 本地合规 → P1 建仓推送 → P2 配图 → P3 市场收录 PR → P4 Star 引导 → P5 发版推广**。
> 已登记为 agent 技能 `~/.dsh/skills/dsh-plugin-release/SKILL.md`：以后直接说「发布这个插件」即可自动执行。

## 新插件从零到可发布（一条命令）

```powershell
node "C:\Users\21232\Desktop\项目\dsh 插件\tools\release\scaffold-release.mjs" `
  --target "C:\path\to\新插件" --owner <你的GitHub账号> `
  --category <类别> --desc-zh "<60–160字>" --desc-en "<English.>"
```

装进来的东西：`tools/release/`（全部脚本）、`docs/RELEASE.md`、`release.config.json`、`screenshots.json`、`docs/screenshots/`、`LICENSE`，并自动补 `package.json` 的 `release:*` scripts、`repository`/`bugs`/`homepage`、`license`、`keywords`。幂等：已存在的文件跳过，`--force` 才覆盖。
工具层升级后，用 `node tools/release/sync-release-kit.mjs --repos "C:\a;C:\b"` 同步到所有插件仓库。


## 一次性环境准备（只做一次）

```powershell
gh auth login          # GitHub CLI 登录（classic token，勾 public_repo 也行）
git config --global user.name  "<你的名字>"
git config --global user.email "<你的邮箱>"
```

## P0 本地合规

```powershell
npm run build && npm test          # 构建产物 dist/ 必须提交（GitHub 源码安装不执行构建）
node tools/release/init-config.mjs # 生成 release.config.json，填 category 与双语简介
npm run release:check              # preflight 自检，存在 ✗ 不得进入下一步
```

硬性项速记：`dsh.bundle.patch` 必须声明（只写 `dsh.client` 会被拒）；`repository` 必须指向最终仓库；`LICENSE`/`README.md`/图标必须存在；包内无密钥与本机路径。

## P1 建仓推送（收录要求仓库创建满 1 天，所以先建库）

```powershell
$repo = "<owner>/dsh-<name>"
gh repo create $repo --public --source . --push
# 打 topic（发现信号）
gh repo edit $repo --add-topic dsh-plugin --add-topic deepseek-harness --add-topic dsh
```

如果 package.json 里还是占位符 `<OWNER>`，此刻替换成真实 owner 并重新 `npm run release:check`。

## P2 配图

1. `npm run preview` → 起本地预览 → 浏览器 1280 宽度截 2–4 张真实界面图 → 存 `docs/screenshots/01-overview.png` 等（命名按"总览 → 配置 → 结果"叙事顺序）。
2. 根目录 `screenshots.json` 列出全部图片（1–8 张、仓库内相对路径、禁止绝对路径/反斜杠/`..`）。
3. README 首屏放第一张图（未策展时市场会从 README 抽图）。

## P3 市场收录（唯一入口是目录仓库 PR，站点无表单）

```powershell
npm run release:entry        # 生成 market/<owner>__<repo>.yml
gh repo fork awesome-dsh-plugin/awesome-dsh-plugin --clone
cd awesome-dsh-plugin
git checkout -b add-<owner>-<repo>
# 把 market/<owner>__<repo>.yml 复制为 data/plugins/<owner>__<repo>.yml
node scripts/generate-readme.mjs   # README 是生成的，禁止手改
git add data/plugins/<owner>__<repo>.yml README* && git commit -m "add <owner>/<repo>"
git push -u origin add-<owner>-<repo>
gh pr create --title "add <owner>/<repo>" --body "<功能一句话>；仓库满 1 天、dsh-plugin topic、dsh.bundle 声明、screenshots.json 就绪"
```

自检（逐条打勾）：一个 PR 只加自己那一条；`url` 与仓库地址逐字符一致；`category` 在清单内；描述无营销词且与代码相符；描述含 `: ` 已加引号。
合并后一天内：市场搜索可命中 → 卡片有图标 → 详情页有轮播图 → 一键安装成功。

## P4 Star 引导

```powershell
npm run release:star         # 生成 src/star-entry.js 并在 client 入口加 import
npm run build && npm test
```

人工收尾：在设置卡标题行（或关于弹窗）渲染 `StarButton`；核心功能首次成功后调用 `maybeRemindStar()`。文案改 `src/star-entry.js` 顶部常量。规则：`window.open(url,'_blank','noreferrer')`、最多提示一次、可关闭。
README 顶部加徽章：

```markdown
[![Star](https://img.shields.io/github/stars/<owner>/dsh-<name>?style=social)](https://github.com/<owner>/dsh-<name>/stargazers)
```

## P5 发版与推广

```powershell
npm run release:pack         # npm pack + 安装冒烟
npm publish                  # （可选但推荐：预构建安装免 allowBuilds 审批）
git tag v0.1.0 && git push --tags
gh release create v0.1.0 --notes "<变更>"   # 也可挂 prebuilt tarball
```

推广位（都来自同一 `repository` 常量，改地址只改一处）：
- 目录站详情页 `https://awesome-dsh-plugin.com/p/<owner>/<repo>/` → 记入作品集。
- README "我的其他插件" 互链区块。
- Release 页每次发版写清变更 + 一张新截图。

## P6 版本迭代"双写"清单

- [ ] `CHANGELOG.md` 更新
- [ ] `screenshots.json` 图片换成新版本截图
- [ ] `release.config.json` 简介仍与代码相符
- [ ] 目录条目 YAML 需要时更新（只改自己那一条）
- [ ] `npm run release:check` 全绿再发版
