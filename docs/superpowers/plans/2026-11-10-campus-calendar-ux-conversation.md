# Campus Calendar UX and Conversation Add Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Refine the campus calendar into an action-oriented student affairs workspace, reduce avoidable client work, and let DSH conversations add one validated item locally through a host agent tool.

**Architecture:** Keep the existing host/client/domain split. Introduce one shared serialized `addItem` mutation used by both the HTTP add route and the DSH host tool, with existing `validateItem` remaining the schema gate. The browser remains a calendar UI; DSH's current agent extracts structured arguments and invokes a narrowly scoped host tool. The client uses memoized month/date indexes, explicit stale-request protection, and preserves unsaved drafts.

**Tech Stack:** Node.js 20+, DSH Cordis host plugins, `@deepseek-ai/dsh-tools` `defineTool`, React supplied by the DSH client module table, esbuild, Node test runner, jsdom.

---

## File Map

- Modify `src/host/store.js`: serialize add-item mutations per store instance; validate then append into the latest state, preserving unrelated concurrent changes and atomic replacement.
- Modify `src/host.js`: share addItem between POST `/items` and host tool; register the narrowly scoped DSH agent tool with `ctx.tools.register(defineTool(...))` using host-side `tools` injection and JSON-safe output.
- Modify `src/client.js`: workspace visual hierarchy, grouped editor, refresh affordance/focus refresh, stale request guards, memoized calendar index, stable callbacks, and draft safety.
- Modify `src/styles.css`: semantic tokens, workspace density, next-action presentation, grouped editor, theme-aware surfaces, reduced motion and focus/touch states.
- Modify `test/host.test.js`: shared-add atomicity, DSH tool registration/execution, confidence rules, rejected multi-item/invalid payloads, storage failure, no external requests.
- Modify `test/client.test.js`: preserve current regression tests; add refresh/stale-response, draft safety, grouped editor, loading/error feedback, and host tool vocabulary/receipt affordance checks.
- Modify `test/layout.test.js`: test light/dark token contrast assumptions, compact layouts, 390px overflow, reduced-motion and focus rules.
- Create `test/performance.test.js`: deterministic 1,000-item filter/date-index benchmark repeated 100 times; report p50/p95 without relying on wall-clock CI pass thresholds except the stated target on a recorded local run.
- Modify `README.md`: describe DSH tool, usage examples, date trust contract, local behavior, test and performance commands.
- Modify `.superpowers/sdd/2026-11-10-campus-events-calendar/progress.md`: record implementation and verification evidence.

## Task 1: Serialized Local Add Service

**Files:** `src/host/store.js`, `test/host.test.js`

- [ ] Step 1: Add a failing test that runs two `store.addItem` calls concurrently against separate valid items and asserts both are present in the returned/persisted dataset, with distinct IDs and no lost update.
- [ ] Step 2: Run `node --test test/host.test.js`; confirm it fails because `addItem` is not exported.
- [ ] Step 3: Implement `addItem(input)` in `createStore`: keep a promise-tail queue per store instance; in the queued operation read the latest valid dataset, assign `randomUUID()` only if input has no ID, reject duplicate IDs, append one item, then call existing atomic `writeState`; resolve with the written state. On queue rejection, reset the tail to a fulfilled sentinel so later adds can proceed.
- [ ] Step 4: Add tests that malformed items reject without changing saved state, caller-supplied duplicate IDs reject, and a failing write does not poison the queue.
- [ ] Step 5: Run `node --test test/host.test.js`; expect all host tests pass.

## Task 2: Host-Side DSH Add Tool

**Files:** `src/host.js`, `test/host.test.js`

- [ ] Step 1: Export a `registerAddItemTool(ctx, { store })` test seam; write a fake tools registry that captures `defineTool` specs, fake systemPrompt when available, and invoke the captured execute method. Assert the current DSH host contract registers one tool named `campus_calendar_add_item`.
- [ ] Step 2: Run `node --test test/host.test.js`; verify the registration test fails before implementation.
- [ ] Step 3: Import `defineTool` from `@deepseek-ai/dsh-tools`; add `tools` to host plugin inject list. Define a strict object parameter schema with required `title`, `category`, `nodes`; properties are bounded strings/enums/arrays and nodes have bounded type, date, confidence, note fields. Set `additionalProperties:false` at item and node level. Do not accept a free-text prompt field.
- [ ] Step 4: Implement execute: check `exec.signal` before write; reject arrays/multiple items, empty title, invalid category, invalid nodes; normalize only absent optional fields to existing schema defaults without inventing dates; if a source exists require http/https and do not fetch it; reject `official_confirmed` unless item has a valid URL, valid verifiedAt, and concrete node date; reject `predicted` without a nonempty rationale; reject `demo:true` with official confidence; call shared `store.addItem` and return only plain JSON `{ok:true,item,confidenceSummary,message}`. Convert validation/storage errors into concise model-readable JSON without stack traces or absolute paths.
- [ ] Step 5: Add tests for missing `tools` service (registration remains a safe no-op or host init returns a clear error according to local plugin conventions), valid auto-ID creation, supplied ID creation, unknown date with `pending_confirmation` and null date, rejection of `official_confirmed` without evidence, predicted without rationale, array/multiple item, cancellation before mutation, disk error, and no network calls.
- [ ] Step 6: Modify the POST `/items` route to call `store.addItem(body.item)` so the UI and tool share the same serialized add mutation; keep auth middleware and response shape unchanged.
- [ ] Step 7: Run `node --test test/host.test.js`; expect all registration and host route tests pass.

## Task 3: Workbench UI Tokens and Hierarchy

**Files:** `src/styles.css`, `src/client.js`, `test/layout.test.js`

- [ ] Step 1: Write CSS contract tests for workspace surface tokens, primary teal action, amber uncertainty token, next-action section, visible focus, `prefers-reduced-motion`, and no new fixed-width mobile overflow.
- [ ] Step 2: Run `node --test test/layout.test.js`; confirm expected token/structure failures.
- [ ] Step 3: Add CSS custom properties for light and dark values, selected by `:root` plus `@media(prefers-color-scheme:dark)`; preserve explicit host theme where available by reading the nearest DSH theme data attribute/class, avoiding a hardcoded light override.
- [ ] Step 4: Restyle topbar/month heading/search/filter bar into a compact hierarchy, preserve current sidebar structure, promote the agenda heading to “下一步” on the calendar screen, and use accessible textual confidence labels.
- [ ] Step 5: Add a compact “从 DSH 对话添加” help region containing one actionable example and the tool name; do not add a fake chat composer. Hide the descriptive example behind a disclosure on narrow viewports while keeping the tool affordance visible.
- [ ] Step 6: Group editor fields into semantic fieldsets/sections: 基本信息, 适用范围, 来源与核验, 关键节点; keep labels and existing field values/validation; add inline helper copy only where trust rules need explanation.
- [ ] Step 7: Add pressed/disabled/focus-visible states and reduced-motion styles; keep transitions limited to color/opacity/transform and duration 150–220ms.
- [ ] Step 8: Run `node --test test/layout.test.js`; expect all CSS contracts pass.

## Task 4: Calendar Model and Render Cost

**Files:** `src/client.js`, `src/domain/filter.js`, `test/client.test.js`, `test/performance.test.js`

- [ ] Step 1: Add a pure exported `buildMonthIndex(items, month)` helper in `src/domain/filter.js` that returns `Map<YYYY-MM-DD, Array<{item,node}>>`; include only concrete start/end ranges and index each calendar day once, without placing null dates.
- [ ] Step 2: Add unit tests for one-day nodes, multi-day inclusive ranges, unknown-date omission, duplicate item nodes, and adjacent-month cells.
- [ ] Step 3: Run `node --test test/domain.test.js`; confirm the new helper tests fail until the helper exists.
- [ ] Step 4: Implement the date index by visiting each known node and its bounded day range; cap expansion to 366 days per node to avoid pathological date ranges, report validation error for ranges exceeding that cap at item validation instead of silently iterating.
- [ ] Step 5: In `App`, memoize filtered/visible items, month cells and month index on their relevant dependencies; derive `eventsForDate` from the index. Preserve agenda separately so undated items remain visible. Use stable callbacks for load/save where consumed by effects.
- [ ] Step 6: Add AbortController plus request generation ID to `load`; discard stale responses, abort previous request on refresh/unmount, and do not refresh while an editor has dirty local draft. Add visible refresh button and a focus handler throttled to once per 30 seconds, with no interval polling.
- [ ] Step 7: Add tests that stale fetch A cannot overwrite newer fetch B, focus refresh is throttled, manual refresh updates state, and refresh leaves dirty editor draft unchanged.
- [ ] Step 8: Create deterministic 1,000-item benchmark fixtures; run 100 samples of `filterItems` + `buildMonthIndex`, report p50/p95 in test output; target p95 <16ms on the recorded environment, but keep CI correctness tests deterministic and avoid flaky hard failures on shared runners.
- [ ] Step 9: Run `node --test test/domain.test.js test/client.test.js test/performance.test.js`; expect all pass and record benchmark output.

## Task 5: Single-Item Conversation Tool Semantics Tests

**Files:** `test/host.test.js`, `src/host.js`

- [ ] Step 1: Add table-driven payload tests for the example “I registered for the campus contest; deadline is mid-next-month”: the agent tool payload must contain one item, deadline `start:null,end:null`, confidence `pending_confirmation`, note with the user's approximate phrase, and `registrationStatus` consistent only with explicit user text.
- [ ] Step 2: Add a tool response test that asserts it says the record was saved locally, lists null/uncertain date, and never claims official verification or source browsing.
- [ ] Step 3: Add explicit-date-without-source test: allowed only as `pending_confirmation` or `unknown`; official confidence must reject.
- [ ] Step 4: Verify request-cancelled before mutation yields no added row; a store write failure yields a recoverable message.
- [ ] Step 5: Run `node --test test/host.test.js`; expect all tool behavior tests pass.

## Task 6: Client Feedback, Accessibility, and Failure Recovery

**Files:** `src/client.js`, `src/styles.css`, `test/client.test.js`

- [ ] Step 1: Add tests that save buttons become disabled with busy label, failed save shows nearby `role=alert`, success appears as `role=status`, refresh button exposes `aria-label`, and editor draft remains intact through refresh failure.
- [ ] Step 2: Implement one shared status message region with `aria-live=polite`; add busy label and disable duplicate submissions; ensure failed writes keep editor open and local values unchanged.
- [ ] Step 3: Ensure detail dialog returns focus to its opener on close and Escape closes the active dialog; keep focus trap if existing shell provides it, otherwise add a bounded dialog focus cycle without adding a dependency.
- [ ] Step 4: Add minimum 44px touch targets for icon buttons on narrow screens while preserving compact desktop sizing; ensure labels remain visible for primary navigation at desktop and accessible names exist for icon-only narrow nav.
- [ ] Step 5: Run `node --test test/client.test.js test/layout.test.js`; expect all accessibility and feedback tests pass.

## Task 7: Documentation, Packaging, and Verification

**Files:** `README.md`, `package.json`, `scripts/build.mjs`, source/test files, progress ledger

- [ ] Step 1: Document tool name, a safe natural-language example, local auto-add behavior, unknown-date handling, official confidence requirements, refusal of multi-item/destructive requests, and no model/API/network fetch from the plugin.
- [ ] Step 2: Add performance benchmark command and explain measured environment and p50/p95 interpretation.
- [ ] Step 3: Run `node --test test/*.test.js`; expect all domain, host, client, layout, and benchmark correctness tests pass.
- [ ] Step 4: Run `npm run build`; verify `dist/client.js` and `dist/client.css` are nonempty and `node --check` for host, client, and build files succeeds.
- [ ] Step 5: Run `npm pack --dry-run`; verify only source, dist, patch, README and package metadata are included.
- [ ] Step 6: Run `.preview` browser test at 1280px and 390px, capture screenshots, check `documentElement.scrollWidth === innerWidth`, test editor/error states, test reduced-motion and dark mode.
- [ ] Step 7: Inspect the live DSH tool contract in host integration tests; do not install into existing profile or restart DSH without explicit request. Record that real runtime invocation still requires profile installation if not done.
- [ ] Step 8: Update progress ledger with changed files, exact test counts, build/pack outputs, benchmark p50/p95, responsive evidence, and any host-integration gap.
