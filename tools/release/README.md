# dsh 插件发布工作流（起点仓库）

这个目录里的 `tools/release/` 是**通用发布工具层**：任何 dsh 插件仓库装上它，就具备和市场头部插件一样的发布能力。

```
新插件开发完
   │
   ├─ 0. scaffold-release.mjs   把工具层装进新仓库（一次性）
   ├─ 1. release:check          21 项发布前自检（全绿才继续）
   ├─ 2. gh repo create         建仓 + 推代码 + 加 dsh-plugin topic
   ├─ 3. 截图                   docs/screenshots/ + screenshots.json
   ├─ 4. release:entry          生成 awesome-dsh-plugin 目录条目 → 提 PR
   ├─ 5. release:star           插件内「★ 点个 Star」入口 → 指向 GitHub
   └─ 6. release:pack / publish 打包发版 → 目录收录 → 市场可搜到
```

## 一分钟装配到新插件

```powershell
node "C:\Users\21232\Desktop\项目\dsh 插件\tools\release\scaffold-release.mjs" `
  --target "C:\path\to\你的新插件" --owner <你的GitHub账号> `
  --category tools --desc-zh "<60–160字简介>" --desc-en "<English description.>"
```

装配后在新插件目录里：

```powershell
npm run release:check    # 自检
npm run release:entry    # 生成市场条目
npm run release:star     # 接入 Star 引导
npm run release:pack     # 打包冒烟
```

## 多仓库维护

工具层改了之后，把改动同步到所有插件仓库：

```powershell
node tools/release/sync-release-kit.mjs --repos "C:\a;C:\b"
# 或写 tools/release/kit-targets.txt（一行一个路径）
```

## Agent 自动命中

`~/.dsh/skills/dsh-plugin-release/SKILL.md` 已登记这套流程。下次对新插件说「发布这个插件」，agent 会直接按这份清单执行，不需要重新摸索。

## 文件索引

| 文件 | 作用 |
| --- | --- |
| `scaffold-release.mjs` | 把工具层装进任意插件仓库（幂等） |
| `sync-release-kit.mjs` | 批量同步工具层到多个仓库 |
| `preflight.mjs` | 21 项发布前自检，`--strict` 时警告也算失败 |
| `market-entry.mjs` | 生成 `data/plugins/<owner>__<repo>.yml` 目录条目 |
| `star-entry.mjs` | 生成 Star 引导组件并接入 client 入口 |
| `pack.mjs` | `npm pack` + 临时目录安装冒烟，校验产物齐全 |
| `init-config.mjs` | 生成 `release.config.json` |
| `docs/RELEASE.md` | P0–P6 完整阶段手册 |
| `scripts/run-release.ps1` | 一键串联 build → test → preflight → entry → star |
