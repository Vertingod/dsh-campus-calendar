# DSH 插件开发与优化约定

本文件是**可复用的开发规则**，不描述本次改动。改动记录见文末「2026-11-11 优化记录」。

核心原则：先读现有文件与测试再动手；验收以 `npm test` + `npm run build` 的实际输出为准，不凭直觉宣布「应该没问题」。

## 1. 结构契约

```
package.json           # dsh.bundle.patch / dsh.client.inject / exports
cordis.patch.yml       # - insert: [{ id, name }]，name 必须等于 package.json 的 name
src/host.js            # 宿主侧：export default { inject, apply }
src/client.js          # 客户端：export { apply, inject }
src/domain/*.js        # 纯函数领域层，host 与 client 共用
dist/client.js         # 构建产物，客户端测试读的是它，不是 src
skills/*.md            # 随包 skill（ctx.skills.registerProvider）
test/*.test.js         # node --test
scripts/build.mjs      # esbuild 打包 client bundle
```

`package.json` 的 `dsh` 字段同时描述两端：

```json
"dsh": {
  "bundle": { "patch": "./cordis.patch.yml" },
  "client": { "platform": "web", "inject": ["@deepseek-ai/dsh-client-runtime"] }
}
```

## 2. defineTool 的 schema 陷阱（最容易炸掉整个 profile）

宿主 `defineTool` 接收的是**属性表**，不是 JSON Schema：

- 必填写在属性项上：`title: { type: 'string', required: true }`
- 而模型接口只认 `required: [...]` 数组。布尔值原样发出去会报
  `required: true is not of type "array"`，**该 profile 下所有会话都无法对话**。
- 所以交给模型前必须递归转换：属性级 `required: true` 提升到父级 `required` 数组。
  参考 `src/host.js:84` 的 `toJsonSchema` 与 `src/host.js:96` 的 `cleanSchemaNode`。
- 嵌套对象条目（如 `nodes.items`）用标准 JSON Schema 写法：`required` 直接写数组，并加 `additionalProperties: false`。
- 回归测试要能穿透整个 schema 断言「任何位置的 `required` 都不是布尔」，见 `test/host.test.js` 中的 `add tool schema never ships boolean required anywhere`。

`output.render` 必须存在，宿主靠它把结果转成消息块；缺了会静默不出结果。

## 3. 生命周期：所有注册都要可撤销

对每一个 `ctx.slots.inject` / `ctx.slots.register` / `ctx.webServer.register` / `ctx.skills.registerProvider`，都问一句：插件禁用或热重载时，这个注册能撤掉吗？

```js
ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({ ... }, Main)), 'main view')
ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/x', handler }), 'x api')
```

没包 `ctx.effect` 的注册会泄漏：热重载后主区叠出第二份组件，旧组件继续持有过期的 ctx。
测试里让 harness 记录 `effect` 调用次数即可断言，见 `test/dom-harness.js` 的 `effects` 数组。

## 4. 启动路径不要阻塞

`apply(ctx)` 里避免 `await` 慢操作（动态 `import()` 可选依赖、网络、大文件读）：

- 可选依赖解析失败要能降级，不能让整个插件起不来。
- 想让工具立即可用又不阻塞：先用本地 normalizer 同步注册，解析成功后用真正的 `defineTool` 再注册一次（按名字覆盖）。
- 同一模块已 `import` 过的东西，不要在热路径里再 `await import()`；esbuild 会保留成动态 import，多一次 promise 往返。

## 5. 客户端性能与坑

- 在「42 个格子」这类循环里调用的函数，不要把 `monthWindow()` 这类**与格子无关的不变量**放在循环体内重算；用 `useMemo` 取一次再闭包进去。
- 列表项 `key` 要全局唯一：`node.id` 在不同事项间可能重名，用 `` `${item.id}-${node.id}` ``。
- **变量名 `window` 是本文件级雷区**：esbuild 会把对浏览器 `window` 的引用改名为 `window2`，此时在同一函数里声明 `const window = ...`，会把 `window2.addEventListener` 变成不存在的本地变量，整棵组件树抛错、UI 停在加载态。用 `monthRange` 这类明确的名字。

## 6. 测试与验收

```bash
npm test          # node --test test/*.test.js
npm run build     # 生成 dist/client.js
```

**客户端测试读的是 `dist/client.js`**：改了 `src/client.js` 却没 `npm run build`，测试跑的还是旧包，会被误导成「修复失效」。改完必须给出实际输出证据（pass/fail 计数）。

## 7. 随包 skill

插件自带的 skill 通过 `ctx.skills.registerProvider` 注册，provider 需要 `list()` 摘要 + `get(candidate)` 正文，`rank` 靠后以便用户本地同名 skill 优先。正文要写清：工具名、参数结构、硬性规则（例如「模糊时间用更粗的精度记录，不许编造精确日，也不许因为不确定就留空」），以及写完后去哪儿看。

## 8. 优化时的检查顺序

1. 读 `package.json` + `cordis.patch.yml`，确认宿主契约没被改坏。
2. `npm test` 拿基线，记录 pass/fail 计数。
3. 读 host 侧：schema 转换、错误脱敏（不能把本地绝对路径透给模型）、并发串行化。
4. 读 client 侧：生命周期、重复计算、key 冲突、加载与错误态。
5. 小步改 + 每步 build & test，最后统一汇报改了什么、证据是什么。

---

## 2026-11-11 优化记录

基线：`npm test` 56/56 通过，`npm run build` 成功。

| 文件 | 问题 | 处理 |
| --- | --- | --- |
| `src/client.js:464` | `slots.inject('main')` 未包 `ctx.effect`，卸载/热重载时句柄泄漏并重复注册 | 包进 `ctx.effect`，并在 `test/dom-harness.js` 记录 `effects`、`test/client.test.js` 断言 |
| `src/client.js:152` | `itemMarksList` 在 42 个格子里各调一次 `monthWindow(month)` | 提到 `monthRange`（`useMemo`） |
| `src/client.js:253` | `spanBar` 用 `span.node.id` 做 key，跨事项可能重名 | 改为 `${item.id}-${node.id}`，并对 spans 去重 |
| `src/host/store.js:45` | 写失败清理分支里 `await import('node:fs/promises')` | 顶部静态导入 `unlink` |
| `src/host.js:440` | `apply` 里 `await resolveDefineTool()`，慢解析拖住整个插件启动 | 先用 `normalizeToolSpec` 立即注册，解析成功后再用真 `defineTool` 覆盖 |

回归：`npm run build` 成功，`npm test` 56/56 通过。
