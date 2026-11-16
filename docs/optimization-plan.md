# 优化执行计划（2026-11-16，自主推进）

依据 `docs/audit-2026-11-16.md`。每一步做完都跑 `node scripts/build.mjs` + `node --test test/*.test.js`，保持全绿；改 CSS 后加跑 `node scripts/preview.mjs`。

## 批次 A · P0（信任与数据安全）
- [x] A1 导入前自动备份：`src/host.js` 的 `POST import` 先 `store.backup('import')`，返回体带 `backup` 文件名；界面提示「原数据已备份为 …」。备份失败直接抛、不进替换。
- [x] A2 通知自动消失：`notify()` 统一 4.5s 清空，`.cc-notice` 配 `cc-notice-out` 淡出；通知容器加 `aria-live="polite" aria-atomic="true"`。
- [x] A3 弹层焦点管理：`useDialogFocus()` 打开时聚焦首个可聚焦元素、Tab/Shift+Tab 首尾循环、关闭后焦点还给触发元素。详情、编辑器、备忘三处都接了。
- [x] A4 `verifiedAt` 生命周期：`model.js` 加 `VERIFY_FRESH_DAYS=90`、`VERIFY_STALE_DAYS=180`、`verifiedAgeDays()`、`verificationState()`；详情页「最近核验（N 天前，该重新核对）」+ `.cc-verify-hint`；胶囊加 `data-stale` 视觉降级。

## 批次 B · P1（名不副实与规则漂移）
- [x] B1 站内提醒兑现：`reminderDue` 算 7 天内到期且设了提醒的事项 → 侧栏入口计数徽标 + 日历上方「你设了提醒，这些快到了」横条。
- [x] B2 client 侧复用 `validateItem`：表单保存前跑领域层同一份规则，第一条错误显示在表单顶部。手抄的四条规则已删。
- [x] B3 删死代码 `src/domain/recurrence.js` + `test/recurrence.test.js`（它会批量造 `accuracy:'month'` 占位节点，与「日期必须查」正相反）。
- [x] B4 `locale` 接线：**不移除**，改为补 `locale/en.json` —— 宿主 `readPluginMeta` 必须先解析 `locale/en.json` 才会枚举同目录语言包，原来只有 `zh.json` 导致中文名一直没生效。
- [x] B5 删除撤销：删除事项/备忘后出现独立撤销条（8 秒），点「撤销」重建记录。
- [x] B6 旧口径文案：覆盖率提示改成「只到月份或年份的不算锚定：让 Agent 去官网查确切日期」。

## 批次 C · P2（视觉与交互）
- [x] C1 对比度达标：muted → `#5d7078`（5.18/4.81）、teal → `#12786a`（5.36）、faint → `#7c8f97`（3.37，只留装饰）；20 处标签级正文从 faint 改 muted；深色主题实测已达标未改。
- [x] C2 隐形 Tab 按钮：`.cc-day-add` 改 `tabindex="-1"` + `aria-hidden`，键盘路径改为「Tab 到日期按钮 → 选中某天 → 侧栏新增」；`.cc-grid` 加 `role="group"` + 可读标签（未用 `role="grid"`：要求每格 gridcell 和方向键导航，这里的结构给不了）。
- [x] C3 视图状态记忆：`view`/`mode`/`month` 存 `localStorage`，值不在白名单就当没存过。
- [x] C4 年视图：12 个小月历一屏的年度热力墙，点某天跳回该月月历；统计按自然月裁剪，不重复计数。
- [x] C5 CSS 重排：同上下文重复选择器 48 → 0（`@media` 里的覆盖是必要的，只合并了真正重复的 `.cc-calendar`、`.cc-notice`）。

## 批次 D · P3（工程）
- [x] D2 备份文件统一清理：`backup()` 后跑 `pruneBackups()`，两套历史命名一起排序，只留最近 10 份。
- [x] D4 补测试：`test/host.test.js` 新增「导入先备份 / 坏 payload 不动原数据」「备份只留 10 份」两条。
- [x] D1 版本 → 0.3.0 + `CHANGELOG.md`。
- [x] D3 启动探活：`GET state` 失败时区分「宿主版本较旧」与一般错误。
- [x] D5 重截 `docs/screenshots/*`（发布前）。
