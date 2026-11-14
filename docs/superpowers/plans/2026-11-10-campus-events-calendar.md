# 大学生赛事与证书日历 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a DSH desktop bundle plugin for a local-first Chinese university competition and certificate calendar.

**Architecture:** A DSH host half registers a scoped API and persists validated JSON in the user data directory. A bundled vanilla JavaScript client renders the responsive calendar and talks only to that API. Pure domain modules own validation, filtering, profile fit, confidence labels, and ICS serialization.

**Tech Stack:** Node.js 20+, native Node test runner, esbuild, DSH Cordis bundle patch and `@deepseek-ai/dsh-client-runtime`; no UI framework or calendar dependency.

---

## File Map

- Create `package.json`: DSH package metadata, host/client exports, build and test scripts.
- Create `cordis.patch.yml`: one host mount row for the DSH sidebar entry.
- Create `src/domain/model.js`: enums, item/dataset validation, confidence rules.
- Create `src/domain/filter.js`: filter composition and profile-fit score/reasons.
- Create `src/domain/ics.js`: RFC 5545 serialization, escaping, line folding, null-date omission.
- Create `src/host/store.js`: user-data path, demo seed, atomic persistence and import/export validation.
- Create `src/host.js`: DSH webServer registration, bounded JSON requests, routes and errors.
- Create `src/client.js`: injected UI, API client, calendar/list/detail/forms.
- Create `src/styles.css`: scoped responsive UI and keyboard focus styling.
- Create `scripts/build.mjs`: bundle client with esbuild and emit CSS.
- Create `test/domain.test.js`: validation, filtering, credibility and ICS tests.
- Create `test/host.test.js`: store and API boundary tests using temporary directories.
- Create `README.md`: setup, package contract, data boundaries and developer commands.

## Task 1: Package and Host Contract

**Files:** `package.json`, `cordis.patch.yml`, `scripts/build.mjs`

- [ ] Step 1: Create `package.json` with name `dsh-campus-events-calendar`, version `0.1.0`, type `module`, main `src/host.js`, exports `.`, `./client` to `dist/client.js`, and `./cordis.patch.yml`; declare `dsh.bundle.patch` and `dsh.client` platform `web` injected through `@deepseek-ai/dsh-client-runtime`; require Node >=20 and DSH >=0.2.1-rc.5 <0.3.0; scripts `build: node scripts/build.mjs`, `test: node --test test/*.test.js`; devDependency `esbuild:^0.25.10`; files `src,dist,cordis.patch.yml,README.md`.
- [ ] Step 2: Create `cordis.patch.yml` with a single `insert` row: id `campus-events-calendar`, name `dsh-campus-events-calendar`.
- [ ] Step 3: Create `scripts/build.mjs`: use Node fs promises to create `dist`, call esbuild with `src/client.js`, bundle true, IIFE format, ES2020 target, output `dist/client.js`, then copy `src/styles.css` to `dist/client.css`.
- [ ] Step 4: Confirm all paths and package names align. Build verification is repeated after client entry is added in Task 6.

## Task 2: Domain Validation (TDD)

**Files:** `src/domain/model.js`, `test/domain.test.js`

- [ ] Step 1: Write tests that `official_confirmed` rejects missing/invalid official `sourceUrl` or `verifiedAt`; predicted nodes reject missing rationale; malformed date, reversed range and unknown enum reject; demo records never qualify for verified display.
- [ ] Step 2: Run `node --test test/domain.test.js`; confirm failures are caused by missing exports/behavior.
- [ ] Step 3: Implement `validateItem(input)` returning `{ok,value}` or `{ok:false,errors}`. Validate bounded strings, arrays, IDs, category/status enums, safe `http:`/`https:` URLs, real `YYYY-MM-DD` dates, and date order. Never upgrade demo confidence.
- [ ] Step 4: Write tests for `validateDataset(input)` schema version/profile/items/favorites/reminders, indexed per-item errors, null unknown dates, and payload limit.
- [ ] Step 5: Implement dataset validation; run focused tests and confirm all pass.

## Task 3: Filter and Suitability Logic (TDD)

**Files:** `src/domain/filter.js`, `test/domain.test.js`

- [ ] Step 1: Write tests with profile major `计算机科学`, province `浙江`, interest `创新创业`; verify keyword/category/major/province/status/date range and only-suitable filters compose with AND behavior.
- [ ] Step 2: Run focused test and confirm expected missing-function failure.
- [ ] Step 3: Implement `scoreFit(item,profile)` returning `{score,reasons}` with bounded score and no points for unknown profile fields; implement pure `filterItems(items,filters,profile)`.
- [ ] Step 4: Test null dates do not match date range, range intersections work, and suitability does not imply a match when fit is unknown/zero.
- [ ] Step 5: Run full domain test file; expect pass.

## Task 4: Confidence Labels and ICS (TDD)

**Files:** `src/domain/model.js`, `src/domain/ics.js`, `test/domain.test.js`

- [ ] Step 1: Write tests for official/predicted/pending/unknown/demo labels, and ensure official requires source plus checked date.
- [ ] Step 2: Write ICS tests for one-day and multi-day all-day event end-exclusive date, stable UID, text escaping, CRLF, UTF-8-safe 75-octet folding, and omission of null date nodes.
- [ ] Step 3: Run tests and confirm missing `confidenceLabel` and `toIcs` failures.
- [ ] Step 4: Implement `confidenceLabel(item,node)` and `toIcs(items,{now})`. Add DTSTAMP, stable UID and escaped source description; never infer dates or export unknown-date nodes.
- [ ] Step 5: Run domain tests; expect all pass, including line byte limits.

## Task 5: Local Store and Host API (TDD)

**Files:** `src/host/store.js`, `src/host.js`, `test/host.test.js`

- [ ] Step 1: Test fresh directory seeds clearly marked demo rows; existing valid storage remains unchanged; corrupt data returns recoverable error and is not overwritten.
- [ ] Step 2: Test create/update/delete/import/export/favorites/reminders and atomic write with a temporary injected data directory; invalid input rejects and failed replacement preserves prior state.
- [ ] Step 3: Run tests and confirm missing store functions fail as expected.
- [ ] Step 4: Implement injectable `dataDir`, `readState`, `writeState`, `importState`, `exportState`; use a sibling temp file and rename. Use only demo rows with `demo:true`, null event dates, nonverified confidence and explanatory notes.
- [ ] Step 5: Implement host default export with `inject:['webServer']`, `ctx.effect`, route prefix `/campus-calendar`, 2 MB body limit and structured JSON errors. Routes: GET/POST `/state`, POST/PUT/DELETE `/items`, POST `/import`, GET `/export.json`, GET `/export.ics`. Do not accept arbitrary paths or fetch remote URLs.
- [ ] Step 6: Test status codes, malformed/oversized JSON, and validation errors using fake req/res and temporary store.
- [ ] Step 7: Run `node --test test/*.test.js`; expect all domain/host tests pass.

## Task 6: Responsive Client UI

**Files:** `src/client.js`, `src/styles.css`, `scripts/build.mjs`

- [ ] Step 1: Add semantic app shell with navigation 日历/收藏/数据维护, month navigation, segmented month/list mode, search, filter disclosure, calendar grid, upcoming agenda, accessible detail dialog, profile editor and item form.
- [ ] Step 2: Add loading, retryable error and empty states; API writes refresh state and failed writes preserve the current form.
- [ ] Step 3: Render actual local month days and known event nodes; show undated records in a separate list, never on invented dates. Detail presents confidence, source, checked date, fit rationale and demo badge.
- [ ] Step 4: Add first-run profile fields for searchable/custom major, year, province, multi-select interests and types; allow later edits.
- [ ] Step 5: Wire category/major/province/status/date filters and only-suitable toggle to domain functions; persist favorites and clearly named in-plugin reminders.
- [ ] Step 6: Add item CRUD; confirmed status requires official URL and checked date. Show demo marker on every seed item.
- [ ] Step 7: Add JSON import/export and ICS download via Blob/object URL; announce results, show errors, and confirm destructive imports.
- [ ] Step 8: Style desktop month-first with upcoming agenda alongside; at max-width 760px use compact nav, full-width month/list toggle and collapsible filters. Verify 390px has no horizontal document overflow.
- [ ] Step 9: Run `npm run build` and `npm test`; expect bundles emitted and tests passing.

## Task 7: Documentation and Verification

**Files:** `README.md`, package and source/test files

- [ ] Step 1: Document Node requirements, DSH desktop profile install/activation, local data location, demo warning, JSON format, confidence rules, lack of real feed/OS notifications, and build/test commands.
- [ ] Step 2: Run `npm test`; expect all domain and host suites pass.
- [ ] Step 3: Run `npm run build`; expect no unresolved imports and both client outputs present.
- [ ] Step 4: Run `npm pack --dry-run`; verify package includes source, dist, patch, docs and excludes local user data/secrets.
- [ ] Step 5: Do not install into the existing DSH profile or restart the app without explicit request; validate package bundle mount contract and explain activation path.
- [ ] Step 6: If authorized DSH runtime is reachable, validate desktop UI and 390px layout; otherwise clearly state the live host integration gap and do not claim it was exercised.

## Spec Coverage

Profile, search/custom major, month/list, all filters, details and confidence, favorites/reminders, ICS, CRUD/JSON import/export, credibility constraints, demo labeling, empty/loading/error/a11y, DSH sidebar bundle, tests/build/package are covered in Tasks 1-7.

## Self-Review

- No TODO/TBD placeholders; concrete files, function names and commands are specified.
- Signatures `validateItem`, `validateDataset`, `scoreFit`, `filterItems`, `confidenceLabel`, and `toIcs` stay consistent.
- Unknown dates remain null in validation, filtering, display and ICS. Official confidence always needs URL and verification date; demo flag overrides.
- No online data, OS notification, login, cloud sync or unrelated service enters scope.
- The current working directory is not a Git repository; no commit or repository initialization is planned.
- The active user requested direct implementation; inline execution is recommended after plan approval.

Execution choices:
1. Subagent-driven: dispatch fresh subagents per task and review between tasks.
2. Inline: implement in this session with checkpoints.

The original request explicitly asks for direct implementation, so choose inline unless you prefer subagents.
