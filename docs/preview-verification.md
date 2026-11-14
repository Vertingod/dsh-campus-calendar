# 视觉验证说明

`scripts/preview.mjs` 会把 `test/preview-entry.js` 与真实构建产物 `dist/client.js`、`dist/client.css`
打包到 `.preview/`（该目录只用于本地人工检查，不进入 npm 包）：

```powershell
npm run build
node scripts/preview.mjs
```

然后在 `.preview/` 起一个静态服务打开 `index.html`，用浏览器检查：

- 桌面 1280px：月历格 + 近期事项并排，`.cc-shell` 无横向滚动；
- 窄屏 390px：侧栏变横向图标导航、筛选/月历/列表按钮全宽、日程区转双列，`documentElement.scrollWidth === clientWidth`。

预览数据里四条标 `demo`（空日期事项、有具体日期事项、多天窗口事项、「只到月份」的预测事项），另有一条不标 `demo` 的「时间待补」事项，用来让覆盖率提示条出现。检查四件事：

- 日期未知的事项不进月历格，只在时间轴写「日期待公布」；
- 月份精度在月历里是一条连续色条铺满整月，标题只出现在该月 1 日，时间列写「M 月（预计）」而不是编出来的某天；
- 多天窗口（如 11/8–11/17）在月历里同样是一条连续色条 + 起点一个标题，不会每格重复同一行字；
- 顶部出现「还有 N 项没有时间锚点 · 已锚定 P%」提示条，并带「让 Agent 补时间」按钮。
