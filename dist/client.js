window.__ModuleLoader__.load({id:"dsh-campus-calendar",factory:(require)=>{const module={exports:{}};const exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.js
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);

// src/star-entry.js
var import_react = __toESM(require("react"), 1);
var h = import_react.default.createElement;
var REPO_URL = "https://github.com/Vertingod/dsh-campus-calendar";
var STAR_URL = REPO_URL + "/stargazers";
var STAR_COPY = {
  zh: "★ 给 dsh-campus-calendar 点个 Star",
  en: "★ Star on GitHub"
};
var MARK_KEY = "dsh-star-reminded:dsh-campus-calendar";
function StarButton(props = {}) {
  return h("button", {
    type: "button",
    className: props.className || "cc-button",
    title: STAR_COPY.zh,
    "aria-label": STAR_COPY.zh,
    onClick: () => window.open(STAR_URL, "_blank", "noreferrer")
  }, STAR_COPY.zh);
}
function maybeRemindStar() {
  try {
    if (localStorage.getItem(MARK_KEY)) return;
    localStorage.setItem(MARK_KEY, "1");
    setTimeout(() => {
      const bar = document.createElement("div");
      bar.textContent = STAR_COPY.zh + " →";
      Object.assign(bar.style, {
        position: "fixed",
        right: "16px",
        bottom: "16px",
        zIndex: "99999",
        background: "rgba(29,106,90,.92)",
        color: "#fff",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        fontFamily: "inherit"
      });
      bar.onclick = () => {
        window.open(STAR_URL, "_blank", "noreferrer");
        bar.remove();
      };
      document.body.appendChild(bar);
      setTimeout(() => bar.remove(), 8e3);
    }, 2e3);
  } catch {
  }
}

// src/client.js
var import_react2 = __toESM(require("react"), 1);

// src/styles.css
var styles_default = '/* ============================================================================\n   赛事与证书日历 · 样式表\n   设计约束（改之前先读一遍）：\n   1. 只在本插件作用域内（.cc-shell / .cc-overlay / .cc-memo-modal-backdrop），不污染宿主。\n   2. 三档文字色 + 一档强调色；格子底色只用「紧急程度」四级，不用来区分赛事。\n   3. 月历格里的字最小 10px，简称最宽 6 个汉字——放不下就说明简称起得不对。\n   4. 所有动效都必须能在 prefers-reduced-motion 下整体关掉。\n   ========================================================================== */\n\n:root{\n  /* 文字色三档都过 WCAG AA（白底）：ink 14.6 / body 8.6 / muted 5.2；faint 只留给装饰线与非文字图标。\n     旧的 muted #6b7f88 只有 4.19、faint #93a4ab 只有 2.58 —— 10-11px 的说明文字用它等于看不清。 */\n  --cc-ink:#1d2b31;--cc-body:#3d4f57;--cc-muted:#5d7078;--cc-faint:#7c8f97;\n  --cc-line:#e2eaec;--cc-line-strong:#cfdde0;\n  --cc-paper:#f4f7f8;--cc-white:#fff;--cc-surface:#fff;\n  --cc-green:#176f60;--cc-green-soft:#e8f3f0;\n  --cc-teal:#12786a;--cc-teal-soft:#e3f2ee;\n  --cc-amber:#9a6420;--cc-amber-soft:#fbf1df;\n  --cc-red:#a64037;--cc-red-soft:#fbe9e6;\n  --cc-l1:#eef5f9;--cc-l2:#d7e8fb;--cc-l3:#fbe3bf;--cc-l4:#f8c3b7;\n  /* 左侧竖条用的深色：底色很浅，条必须是能对比出来的同色系深色，否则等于没画 */\n  --cc-l1-line:#9fc0cf;--cc-l2-line:#5d9bd6;--cc-l3-line:#df9a33;--cc-l4-line:#d9664f;\n  --cc-radius:8px;--cc-radius-lg:14px;--cc-radius-pill:999px;\n  --cc-shadow-sm:0 1px 2px rgba(24,52,46,.06);\n  --cc-shadow:0 12px 32px rgba(20,44,39,.10);\n  --cc-shadow-lg:0 24px 60px rgba(16,38,33,.18);\n  --cc-ease:cubic-bezier(.2,.7,.3,1);\n  --cc-fast:.15s;--cc-mid:.24s;\n  --cc-paper-dark:#172421;--cc-surface-dark:#1c2a27;--cc-on-paper-dark:#e4efec;\n  --cc-muted-dark:#a5b6af;--cc-line-dark:#31413c;\n}\n\n/* ---------- 基础 ---------- */\n.cc-shell *{box-sizing:border-box}\n.cc-shell .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n.cc-shell{box-sizing:border-box;height:100%;min-height:520px;display:grid;grid-template-columns:214px minmax(0,1fr);color:var(--cc-ink);background:var(--cc-paper);font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;font-size:13px;line-height:1.5;color-scheme:light dark;overflow:auto}\n.cc-shell button,.cc-shell input,.cc-shell select,.cc-shell textarea{font-size:inherit}\n.cc-shell button{color:inherit;cursor:pointer;touch-action:manipulation;transition:background-color var(--cc-fast) ease,color var(--cc-fast) ease,border-color var(--cc-fast) ease,box-shadow var(--cc-fast) ease,opacity var(--cc-fast) ease,transform var(--cc-fast) var(--cc-ease)}\n.cc-shell button:active{transform:scale(.98)}\n.cc-shell :focus-visible{outline:2px solid var(--cc-teal);outline-offset:2px;border-radius:4px}\n\n/* ---------- 侧栏 ---------- */\n.cc-sidebar{display:flex;flex-direction:column;min-height:100%;padding:22px 14px 16px;background:#22343a;color:#eef5f5;position:relative;overflow:hidden}\n.cc-sidebar::after{content:"";position:absolute;inset:auto -40px -80px auto;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(22,140,120,.28),transparent 70%);pointer-events:none}\n.cc-brand{display:flex;align-items:center;gap:10px;padding:0 8px 24px}\n.cc-brand-mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid #9db4b7;border-radius:9px;font-family:Georgia,serif;font-size:18px;letter-spacing:.02em;transition:transform var(--cc-mid) var(--cc-ease)}\n.cc-brand:hover .cc-brand-mark{transform:rotate(-6deg) scale(1.04)}\n.cc-brand strong{display:block;font-size:14px;letter-spacing:.04em}\n.cc-brand small{display:block;color:#9fb4b8;font-size:11px;letter-spacing:.06em}\n.cc-side-nav{display:flex;flex-direction:column;gap:2px}\n.cc-side-nav button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:0;border-radius:9px;background:transparent;color:#c8d8d9;font-size:13px;text-align:left;position:relative}\n.cc-side-nav button svg{opacity:.8;transition:transform var(--cc-mid) var(--cc-ease)}\n.cc-side-nav button:hover{background:rgba(255,255,255,.07);color:#fff}\n.cc-side-nav button:hover svg{transform:scale(1.08)}\n.cc-side-nav button.active{background:rgba(255,255,255,.12);color:#fff;font-weight:500}\n.cc-side-nav button.active::before{content:"";position:absolute;left:-14px;top:50%;width:3px;height:18px;transform:translateY(-50%);border-radius:0 3px 3px 0;background:var(--cc-teal)}\n/* 提醒数：侧栏是深色底，用亮一档的青绿，别用红——红在这套色里代表「截止」 */\n.cc-nav-badge{margin-left:auto;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:color-mix(in srgb,var(--cc-teal) 78%,#fff);color:#062420;font-size:10.5px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}\n.cc-sidebar-foot{margin-top:auto;padding:14px 8px 0;border-top:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:8px;color:#9fb4b8;font-size:11px;letter-spacing:.03em}\n.cc-local-dot{width:7px;height:7px;border-radius:50%;background:#4fc3a1;box-shadow:0 0 0 0 rgba(79,195,161,.6);animation:cc-pulse 3.6s infinite}\n\n/* ---------- 主区 / 顶栏 ---------- */\n.cc-main{padding:0 28px 40px;min-width:0;animation:cc-fade .32s var(--cc-ease) both}\n.cc-topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 0 16px;border-bottom:1px solid var(--cc-line);flex-wrap:wrap}\n.cc-eyebrow{margin:0 0 2px;color:var(--cc-muted);font-size:10px;letter-spacing:.16em;text-transform:uppercase}\n.cc-topbar h1{margin:0;font-size:19px;font-weight:600;letter-spacing:.01em}\n.cc-top-actions,.cc-row-actions,.cc-month-actions,.cc-dialog-actions,.cc-form-actions,.cc-event-form-actions,.cc-memo-form-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.cc-grow{flex:1}\n\n/* ---------- 按钮 ---------- */\n.cc-button{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border:1px solid var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:var(--cc-surface);color:var(--cc-body);font-size:12.5px;line-height:1.3;box-shadow:var(--cc-shadow-sm)}\n.cc-button:hover{border-color:var(--cc-teal);color:var(--cc-green);background:#fafdfc}\n.cc-button:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}\n.cc-button.primary{border-color:transparent;background:var(--cc-green);color:#fff;font-weight:500}\n.cc-button.primary:hover{background:#12584c;color:#fff}\n.cc-button.danger{border-color:#eccac4;color:var(--cc-red)}\n.cc-button.danger:hover{background:var(--cc-red-soft);border-color:var(--cc-red);color:var(--cc-red)}\n.cc-button svg{flex:none}\n.icon-button,.cc-icon-button{display:inline-grid;place-items:center;width:30px;height:30px;padding:0;border:1px solid var(--cc-line-strong);border-radius:9px;background:var(--cc-surface);color:var(--cc-muted);font-size:15px;line-height:1}\n.icon-button:hover,.cc-icon-button:hover{border-color:var(--cc-teal);color:var(--cc-green)}\n.text-button{border:0;background:none;padding:2px 4px;color:var(--cc-green);font-size:12px}\n.text-button:hover{text-decoration:underline}\n.text-button.danger{color:var(--cc-red)}\n.cc-refresh svg,.cc-refresh span{display:inline-block}\n.cc-refresh:not(:disabled):hover span{animation:cc-spin .7s var(--cc-ease)}\n.cc-span{flex:1}\n\n/* ---------- 提示条 ---------- */\n.cc-alert,.cc-notice{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 0;padding:10px 14px;border-radius:10px;font-size:12.5px;animation:cc-slide-down .26s var(--cc-ease) both}\n.cc-alert{background:var(--cc-red-soft);color:#7d2a23;border:1px solid #f0c8c2}\n.cc-alert button,.cc-notice button{border:0;background:none;color:inherit;display:grid;place-items:center;opacity:.7}\n.cc-alert button:hover,.cc-notice button:hover{opacity:1}\n/* 通知会自动消失（4.5s），淡出比硬切更像「说完了」而不是「出错了」 */\n.cc-notice-slot{display:contents}\n.cc-notice{background:var(--cc-green-soft);color:#14584c;border:1px solid #cbe6df;animation:cc-slide-down .26s var(--cc-ease) both,cc-notice-out .4s var(--cc-ease) 4.1s both}\n@keyframes cc-notice-out{to{opacity:0;transform:translateY(-4px)}}\n/* 撤销条：比普通提示多留 8 秒，带一个明确的主按钮，视觉上要比绿色通知更「可点」 */\n.cc-undo{display:flex;align-items:center;gap:10px;margin:14px 0 0;padding:9px 12px 9px 14px;border-radius:10px;font-size:12.5px;background:var(--cc-surface);color:var(--cc-body);border:1px solid var(--cc-line-strong);box-shadow:0 8px 20px -14px rgba(20,40,45,.5);animation:cc-slide-down .26s var(--cc-ease) both}\n.cc-undo > span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.cc-undo-action{border:1px solid color-mix(in srgb,var(--cc-teal) 40%,transparent);background:color-mix(in srgb,var(--cc-teal) 10%,#fff);color:var(--cc-green);font-weight:600;padding:3px 12px;border-radius:7px;transition:background .16s var(--cc-ease),transform .16s var(--cc-ease)}\n.cc-undo-action:hover{background:color-mix(in srgb,var(--cc-teal) 18%,#fff);transform:translateY(-1px)}\n.cc-undo-close{border:0;background:none;color:var(--cc-muted);display:grid;place-items:center;padding:2px}\n.cc-undo-close:hover{color:var(--cc-ink)}\n/* 提醒条：7 天内到期的、用户自己设过提醒的事项 */\n.cc-reminder-band{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px;padding:10px 14px;border-radius:11px;border:1px solid color-mix(in srgb,var(--cc-teal) 26%,transparent);background:color-mix(in srgb,var(--cc-teal) 7%,#fff);animation:cc-slide-down .26s var(--cc-ease) both}\n.cc-reminder-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;min-width:0}\n.cc-reminder-head strong{font-size:12.5px;color:var(--cc-ink)}\n.cc-reminder-head span{font-size:11.5px;color:var(--cc-muted);font-variant-numeric:tabular-nums}\n.cc-reminder-list{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}\n.cc-reminder-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;border:1px solid color-mix(in srgb,var(--cc-teal) 30%,transparent);background:#fff;color:var(--cc-body);font-size:11.5px}\n.cc-reminder-chip:hover{border-color:var(--cc-teal);color:var(--cc-ink)}\n.cc-reminder-chip[data-level="4"]{border-color:color-mix(in srgb,var(--cc-l4-line) 55%,transparent);background:color-mix(in srgb,var(--cc-l4) 40%,#fff)}\n.cc-reminder-chip[data-level="3"]{border-color:color-mix(in srgb,var(--cc-l3-line) 45%,transparent);background:color-mix(in srgb,var(--cc-l3) 34%,#fff)}\n.cc-reminder-when{font-variant-numeric:tabular-nums;color:var(--cc-muted);font-size:11px}\n.cc-inline-error{margin:8px 0;color:var(--cc-red);font-size:12px}\n.cc-profile-banner,.cc-coverage-hint{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:16px 0;padding:14px 16px;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);background:var(--cc-surface);box-shadow:var(--cc-shadow-sm)}\n.cc-profile-banner strong,.cc-coverage-hint strong{display:block;font-size:13px}\n.cc-profile-banner p,.cc-coverage-hint p{margin:2px 0 0;color:var(--cc-muted);font-size:12px;max-width:62ch}\n\n/* ---------- 月份头 ---------- */\n.cc-month-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 0 6px}\n.cc-month-head h2{margin:0;font-size:22px;font-weight:600;letter-spacing:.01em}\n.cc-month-head p{margin:3px 0 0;color:var(--cc-muted);font-size:12px}\n.cc-calendar-tools{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0 12px}\n/* 字号档位（紧凑 / 标准 / 宽松）：只有月历格跟着变，其余界面不受影响 */\n.cc-density{display:inline-flex;padding:2px;border:1px solid var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:var(--cc-surface);gap:1px}\n.cc-density button{padding:3px 9px;border:0;border-radius:var(--cc-radius-pill);background:none;color:var(--cc-muted);font-size:11px;line-height:1.6;transition:background-color var(--cc-fast) ease,color var(--cc-fast) ease}\n.cc-density button:hover{color:var(--cc-ink)}\n.cc-density button.selected{background:var(--cc-teal-soft);color:var(--cc-green);font-weight:500}\n\n/* ---------- 工具条 / 搜索 ---------- */\n.cc-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 0 14px;animation:cc-slide-down .24s var(--cc-ease) both}\n.cc-search{position:relative;display:flex;align-items:center;gap:6px;flex:1 1 260px;max-width:360px;padding:0 10px;border:1px solid var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:var(--cc-surface);transition:border-color var(--cc-fast) ease,box-shadow var(--cc-fast) ease}\n.cc-search:focus-within{border-color:var(--cc-teal);box-shadow:0 0 0 3px rgba(22,140,120,.14)}\n.cc-search input{flex:1;min-width:0;border:0;outline:0;padding:8px 0;background:none;color:var(--cc-ink);font-size:12.5px}\n.cc-search > span[aria-hidden]{color:var(--cc-faint);font-size:15px}\n.cc-search button{border:0;background:none;display:grid;place-items:center;color:var(--cc-muted)}\n.cc-toggle{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:var(--cc-surface);font-size:12.5px;color:var(--cc-body);cursor:pointer}\n.cc-toggle input{accent-color:var(--cc-teal);margin:0}\n.cc-segment{display:inline-flex;padding:3px;border:1px solid var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:var(--cc-surface);gap:2px}\n.cc-segment button{border:0;border-radius:var(--cc-radius-pill);background:none;padding:5px 14px;font-size:12.5px;color:var(--cc-muted)}\n.cc-segment button:hover{color:var(--cc-ink)}\n.cc-segment button.selected{background:var(--cc-green);color:#fff;font-weight:500;box-shadow:0 2px 6px rgba(23,111,96,.24)}\n.cc-filters{display:none;gap:12px;padding:0 0 14px}\n.cc-filters.expanded{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));animation:cc-slide-down .24s var(--cc-ease) both}\n.cc-field{display:flex;flex-direction:column;gap:5px;min-width:0}\n.cc-field > span{color:var(--cc-muted);font-size:11px;letter-spacing:.02em}\n.cc-field input,.cc-field select,.cc-field textarea,.cc-event-form input,.cc-event-form select,.cc-event-form textarea,.cc-memo-form input,.cc-memo-form select,.cc-memo-form textarea{padding:8px 10px;border:1px solid var(--cc-line-strong);border-radius:8px;background:var(--cc-surface);color:var(--cc-ink);font-size:12.5px;min-width:0;transition:border-color var(--cc-fast) ease,box-shadow var(--cc-fast) ease}\n.cc-field input:focus,.cc-field select:focus,.cc-field textarea:focus,.cc-event-form input:focus,.cc-event-form select:focus,.cc-event-form textarea:focus,.cc-memo-form input:focus,.cc-memo-form select:focus,.cc-memo-form textarea:focus{outline:0;border-color:var(--cc-teal);box-shadow:0 0 0 3px rgba(22,140,120,.13)}\n.cc-field.compact{flex:1 1 150px}\n.cc-span-all{grid-column:1 / -1}\n.cc-mobile-suitable{display:none}\n\n/* ---------- 月历布局 ---------- */\n.cc-calendar-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(215px,260px);gap:20px;align-items:start;container-type:inline-size}\n/* 月历格的字号按「月历自己的宽度」算，不看窗口宽度：侧栏收起、DSH 分栏、小窗预览都能对上 */\n.cc-calendar{container-type:inline-size;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);background:var(--cc-surface);overflow:hidden;box-shadow:var(--cc-shadow-sm)}\n.cc-calendar-legend{display:flex;justify-content:flex-end;gap:12px;padding:10px 14px 4px;color:var(--cc-muted);font-size:10.5px;letter-spacing:.02em}\n.cc-calendar-legend span{display:inline-flex;align-items:center;gap:5px}\n.cc-calendar-legend span::before{content:"";width:9px;height:9px;border-radius:3px;background:var(--cc-l1)}\n.cc-calendar-legend span[data-level="2"]::before{background:var(--cc-l2)}\n.cc-calendar-legend span[data-level="3"]::before{background:var(--cc-l3)}\n.cc-calendar-legend span[data-level="4"]::before{background:var(--cc-l4)}\n/* 年视图：12 个小月历。它回答的是「这一年整体长什么样」，所以格子小、色块是唯一信息载体。 */\n.cc-year{display:flex;flex-direction:column;gap:16px;padding:2px 0 20px}\n.cc-year-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}\n.cc-year-head h2{margin:0;font-size:19px;letter-spacing:-.01em}\n.cc-year-head p{margin:4px 0 0;color:var(--cc-muted);font-size:12px;max-width:56ch}\n.cc-year-actions{display:flex;align-items:center;gap:6px}\n.cc-year-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:14px}\n.cc-year-month{display:flex;flex-direction:column;gap:5px;padding:9px 10px 11px;border:1px solid var(--cc-line);border-radius:10px;background:var(--cc-surface);transition:border-color var(--cc-fast) ease,box-shadow var(--cc-fast) ease}\n.cc-year-month.current{border-color:color-mix(in srgb,var(--cc-teal) 45%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--cc-teal) 18%,transparent)}\n.cc-year-label{align-self:flex-start;padding:2px 6px;border:0;border-radius:6px;background:none;color:var(--cc-body);font-size:11.5px;font-weight:600;letter-spacing:.04em;transition:background-color var(--cc-fast) ease,color var(--cc-fast) ease}\n.cc-year-label:hover{background:var(--cc-teal-soft);color:var(--cc-green)}\n.cc-year-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}\n.cc-year-day{position:relative;display:grid;place-items:center;aspect-ratio:1;min-width:0;padding:0;border:0;border-radius:4px;background:none;color:var(--cc-muted);font-size:9.5px;font-variant-numeric:tabular-nums;line-height:1;transition:background-color var(--cc-fast) ease,color var(--cc-fast) ease}\n.cc-year-day.empty{background:none;pointer-events:none}\n.cc-year-day.has-events{background:var(--cc-l1);color:var(--cc-ink);font-weight:600;cursor:pointer}\n.cc-year-day.has-events[data-level="2"]{background:var(--cc-l2)}\n.cc-year-day.has-events[data-level="3"]{background:var(--cc-l3)}\n.cc-year-day.has-events[data-level="4"]{background:var(--cc-l4)}\n.cc-year-day.has-events:hover{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--cc-teal) 55%,transparent)}\n.cc-year-day:not(.has-events):hover{background:var(--cc-paper);color:var(--cc-body)}\n.cc-weekdays{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));padding:6px 0 0;border-bottom:1px solid var(--cc-line)}\n.cc-weekdays span{padding:6px 8px;text-align:right;color:var(--cc-muted);font-size:10.5px;letter-spacing:.06em}\n.cc-weekdays span.weekend{color:var(--cc-muted)}\n.cc-grid{display:grid;grid-template-columns:repeat(7,minmax(78px,1fr));grid-auto-rows:minmax(92px,auto);background:var(--cc-line);gap:1px}\n.cc-day{position:relative;display:flex;flex-direction:column;gap:3px;padding:6px 6px 8px;background:var(--cc-surface);min-width:0;transition:background-color var(--cc-fast) ease}\n/* 有安排的日子必须一眼看出来：整格铺色 + 左侧竖条，而不是只在顶部留一层几乎看不见的渐变。\n   以前 4 档色只染顶部 62%，截图上等于没上色，用户的原话是「看不出重点」。 */\n.cc-day.has-events{background:var(--cc-l1)}\n.cc-day.has-events[data-level="1"]{background:var(--cc-l1);--cc-day-accent:var(--cc-l1-line)}\n.cc-day.has-events[data-level="2"]{background:var(--cc-l2);--cc-day-accent:var(--cc-l2-line)}\n.cc-day.has-events[data-level="3"]{background:var(--cc-l3);--cc-day-accent:var(--cc-l3-line)}\n.cc-day.has-events[data-level="4"]{background:var(--cc-l4);--cc-day-accent:var(--cc-l4-line)}\n.cc-day.has-events::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--cc-day-accent,var(--cc-teal));animation:cc-strip .28s var(--cc-ease) both}\n.cc-day.outside{background:#fafcfc;color:var(--cc-faint)}\n.cc-day.outside.has-events{background:color-mix(in srgb,var(--cc-l1) 55%,#fff)}\n.cc-day.outside .cc-day-number{color:var(--cc-faint)}\n.cc-day.chosen{box-shadow:inset 0 0 0 2px var(--cc-teal)}\n.cc-day:hover{filter:brightness(.985)}\n.cc-day-number{align-self:flex-end;width:24px;height:24px;display:grid;place-items:center;border:0;border-radius:50%;background:none;color:var(--cc-body);font-size:12px;font-variant-numeric:tabular-nums;transition:background-color var(--cc-fast) ease,color var(--cc-fast) ease}\n.cc-day.has-events .cc-day-number{color:var(--cc-ink);font-weight:600}\n.cc-day-number:hover{background:var(--cc-teal-soft);color:var(--cc-green)}\n.cc-day.today .cc-day-number{background:var(--cc-green);color:#fff;font-weight:600;animation:cc-pop .32s var(--cc-ease) both}\n.cc-day-add{position:absolute;top:5px;left:5px;width:20px;height:20px;display:grid;place-items:center;padding:0;border:1px dashed var(--cc-line-strong);border-radius:50%;background:rgba(255,255,255,.7);color:var(--cc-faint);opacity:0;transform:scale(.85);transition:opacity var(--cc-fast) ease,transform var(--cc-fast) var(--cc-ease),color var(--cc-fast) ease,border-color var(--cc-fast) ease}\n.cc-day-add svg{width:11px;height:11px}\n.cc-day:hover .cc-day-add,.cc-day-add:focus-visible{opacity:1;transform:none}\n.cc-day-add:hover{border-color:var(--cc-teal);color:var(--cc-green);background:var(--cc-teal-soft)}\n.cc-day-events{display:flex;flex-direction:column;gap:3px;min-height:0;overflow:hidden}\n\n/* 月历格里的标签：内容只有简称，颜色只表达「谁的事」，可读性优先于颜色编码。\n   所有事项都用同一种沉稳描边样式，只靠左侧圆点区分颜色 —— 以前的彩色实心块\n   十几行叠在一起像打翻的色卡，而且浅色块上的白字几乎看不清。 */\n.cc-chip{display:flex;align-items:center;gap:5px;width:100%;padding:1px 6px 1px 5px;border:1px solid color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 26%,transparent);border-radius:6px;background:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 8%,#fff);color:var(--cc-ink);font-size:11px;line-height:1.5;text-align:left;overflow:hidden;transition:transform var(--cc-fast) var(--cc-ease),box-shadow var(--cc-fast) ease,background-color var(--cc-fast) ease}\n.cc-chip:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(24,52,46,.14);background:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 14%,#fff)}\n.cc-chip[data-color="teal"],.cc-tag[data-color="teal"],.cc-tl-row[data-color="teal"]{--cc-chip:#168c78}\n.cc-chip[data-color="amber"],.cc-tag[data-color="amber"],.cc-tl-row[data-color="amber"]{--cc-chip:#a2741f}\n.cc-chip[data-color="rose"],.cc-tag[data-color="rose"],.cc-tl-row[data-color="rose"]{--cc-chip:#b05063}\n.cc-chip[data-color="violet"],.cc-tag[data-color="violet"],.cc-tl-row[data-color="violet"]{--cc-chip:#6d5fb0}\n.cc-chip[data-color="sky"],.cc-tag[data-color="sky"],.cc-tl-row[data-color="sky"]{--cc-chip:#2f7fa8}\n.cc-chip[data-color="olive"],.cc-tag[data-color="olive"],.cc-tl-row[data-color="olive"]{--cc-chip:#6c7f34}\n.cc-chip[data-color="slate"],.cc-tag[data-color="slate"],.cc-tl-row[data-color="slate"]{--cc-chip:#5b6d76}\n.cc-chip.uncertain{background:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 4%,#fff);border-style:dashed;border-color:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 42%,transparent)}\n.cc-chip.demo{background:transparent;border:1px dashed var(--cc-line-strong);color:var(--cc-muted)}\n.cc-chip-edge{flex:none;width:6px;height:6px;border-radius:50%;background:var(--cc-chip,var(--cc-teal))}\n.cc-chip.end .cc-chip-edge{border-radius:1px;width:5px;height:9px}\n.cc-chip[data-edge] .cc-chip-edge{animation:cc-dot .3s var(--cc-ease) both}\n.cc-chip-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;letter-spacing:.01em}\n/* 核验过期的日期不该和刚查过的一样可信：文字退成次要色，右边加一个空心点 */\n.cc-chip[data-stale] .cc-chip-text{color:var(--cc-muted);font-weight:400}\n.cc-chip[data-stale]::after{content:"";flex:none;width:4px;height:4px;border-radius:50%;border:1px solid var(--cc-muted);opacity:.75}\n.cc-verify-hint{margin:0 0 14px;padding:8px 11px;border-radius:8px;border:1px dashed color-mix(in srgb,var(--cc-line-strong) 75%,transparent);color:var(--cc-muted);font-size:12px;line-height:1.6}\n.cc-verify-hint[data-state="stale"]{border-color:color-mix(in srgb,var(--cc-l4-line) 55%,transparent);color:color-mix(in srgb,var(--cc-l4-line) 75%,var(--cc-ink));background:color-mix(in srgb,var(--cc-l4) 32%,transparent)}\n.cc-verify-hint[data-state="cooling"]{border-color:color-mix(in srgb,var(--cc-l3-line) 45%,transparent);background:color-mix(in srgb,var(--cc-l3) 26%,transparent)}\n/* 三档字号：格子高度、胶囊字号、日期数字一起走，标准档就是能舒服看清的下限 */\n.cc-shell[data-density="compact"] .cc-grid{grid-auto-rows:minmax(74px,auto)}\n.cc-shell[data-density="compact"] .cc-chip{font-size:10px;padding:0 4px;gap:4px;line-height:1.45;border-radius:5px}\n.cc-shell[data-density="compact"] .cc-chip-text{font-size:10px}\n.cc-shell[data-density="compact"] .cc-chip-edge{width:5px;height:5px}\n.cc-shell[data-density="compact"] .cc-day-number{width:20px;height:20px;font-size:11px}\n.cc-shell[data-density="roomy"] .cc-grid{grid-auto-rows:minmax(112px,auto)}\n.cc-shell[data-density="roomy"] .cc-chip{font-size:11.5px;padding:2px 7px}\n.cc-shell[data-density="roomy"] .cc-chip-text{font-size:11.5px}\n.cc-shell[data-density="roomy"] .cc-day-number{width:26px;height:26px;font-size:13px}\n/* 月历格窄的时候（约 760px 以下，七格每格不足 100px）自动收一号字，窗口再窄也不靠截断 */\n@container (max-width: 760px){.cc-chip{font-size:10px;padding:0 4px;gap:4px}}\n.cc-more{align-self:flex-start;margin-top:1px;padding:1px 6px;border:0;border-radius:var(--cc-radius-pill);background:none;color:var(--cc-muted);font-size:10.5px}\n\n/* ---------- 档期未定：只知道月份、还不知道哪一天的节点 ----------\n   以前这些被钉在 1 号和月末，把「不知道」伪装成「正好那天」。\n   现在它们不进格子，集中成月历下面的一条横带：诚实，而且一眼能看出这个月有几件事还要等日期。 */\n.cc-calendar-stack{display:flex;flex-direction:column;gap:12px;min-width:0}\n.cc-grid-empty{margin:0 0 10px;padding:9px 12px;border:1px dashed var(--cc-line-strong);border-radius:10px;background:color-mix(in srgb,var(--cc-paper) 60%,#fff);color:var(--cc-muted);font-size:12px;line-height:1.6}\n.cc-floating{display:flex;flex-direction:column;gap:9px;padding:12px 14px 13px;border:1px dashed var(--cc-line-strong);border-radius:var(--cc-radius-lg);background:color-mix(in srgb,var(--cc-paper) 70%,#fff)}\n.cc-floating-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;color:var(--cc-muted);font-size:11.5px}\n.cc-floating-kicker{color:var(--cc-ink);font-size:11px;font-weight:600;letter-spacing:.08em}\n.cc-floating-hint{color:var(--cc-muted)}\n.cc-floating-list{display:flex;flex-wrap:wrap;gap:6px}\n.cc-floating-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 30%,transparent);border-radius:var(--cc-radius-pill);background:#fff;color:var(--cc-ink);font-size:11.5px;animation:cc-pop-in .2s var(--cc-ease) both}\n.cc-floating-chip:hover{border-color:var(--cc-chip,var(--cc-teal));box-shadow:var(--cc-shadow-sm);transform:translateY(-1px)}\n.cc-floating-chip[data-level="3"]{border-color:color-mix(in srgb,var(--cc-l3-line) 55%,transparent)}\n.cc-floating-chip[data-level="4"]{border-color:color-mix(in srgb,var(--cc-l4-line) 60%,transparent);background:color-mix(in srgb,var(--cc-l4) 22%,#fff)}\n.cc-floating-chip.uncertain{border-style:dashed}\n.cc-floating-rolling{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:1px dashed color-mix(in srgb,var(--cc-line-strong) 60%,transparent)}\n.cc-floating-rolling .cc-floating-kicker{color:var(--cc-muted);letter-spacing:.04em}\n.cc-floating-rolling .cc-floating-chip{background:transparent;border-style:dotted;border-color:var(--cc-line-strong);color:var(--cc-muted);font-size:11px;padding:2px 8px}\n.cc-floating-rolling .cc-floating-chip .cc-floating-type{color:var(--cc-muted)}\n.cc-floating-chip .cc-chip-edge{width:6px;height:6px;border-radius:1px}\n.cc-floating-text{font-weight:600}\n.cc-floating-when{padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--cc-paper) 80%,#fff);color:var(--cc-body);font-size:10.5px;font-variant-numeric:tabular-nums}\n.cc-floating-chip[data-kind="span"] .cc-floating-when{font-style:italic}\n.cc-floating-type{color:var(--cc-muted);font-size:10.5px}\n\n/* ---------- 右侧议程 ---------- */\n.cc-agenda{position:sticky;top:12px;display:flex;flex-direction:column;gap:10px;padding:14px 14px 16px;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);background:var(--cc-surface);box-shadow:var(--cc-shadow-sm);max-height:calc(100vh - 40px);overflow:auto}\n.cc-agenda-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding-bottom:8px;border-bottom:1px solid var(--cc-line)}\n.cc-agenda-kicker{display:block;color:var(--cc-muted);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase}\n.cc-agenda-head h2{margin:2px 0 0;font-size:15px;font-weight:600}\n.cc-agenda-list{display:flex;flex-direction:column;gap:2px}\n.cc-agenda-row{display:flex;align-items:flex-start;gap:6px;padding:2px 0;border-radius:8px;transition:background-color var(--cc-fast) ease}\n.cc-agenda-row:hover{background:#f7fbfa}\n.cc-agenda-open{flex:1;min-width:0;display:grid;grid-template-columns:auto 1fr auto;gap:2px 8px;align-items:center;padding:7px 8px;border:0;border-radius:8px;background:none;text-align:left}\n.cc-agenda-open time{grid-column:1 / -1;color:var(--cc-muted);font-size:10.5px;font-variant-numeric:tabular-nums}\n.cc-agenda-alias{justify-self:start;padding:1px 7px;border-radius:var(--cc-radius-pill);background:var(--cc-teal-soft);color:var(--cc-green);font-size:10.5px;font-weight:500;letter-spacing:.02em;white-space:nowrap}\n.cc-agenda-open strong{font-size:12.5px;font-weight:500;line-height:1.4;overflow-wrap:anywhere}\n.cc-agenda-note{grid-column:1 / -1;color:var(--cc-muted);font-size:10.5px}\n.cc-agenda-memo .cc-agenda-alias{background:var(--cc-amber-soft);color:var(--cc-amber)}\n.cc-memo-delete{flex:none;width:22px;height:22px;margin-top:6px;border:0;border-radius:50%;background:none;color:var(--cc-faint);font-size:14px;line-height:1}\n.cc-memo-delete:hover{background:var(--cc-red-soft);color:var(--cc-red)}\n\n/* ---------- 可信度 / 标签 ---------- */\n.cc-confidence{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--cc-radius-pill);background:#eef3f4;color:var(--cc-muted);font-size:10.5px;white-space:nowrap}\n.cc-confidence.uncertain{background:var(--cc-amber-soft);color:var(--cc-amber)}\n.cc-confidence.demo{background:#eef3f4;color:var(--cc-muted)}\n.cc-confidence.memo{background:var(--cc-amber-soft);color:var(--cc-amber)}\n.cc-tag{display:inline-flex;align-items:center;padding:1px 8px;border-radius:var(--cc-radius-pill);background:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 12%,#fff);color:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 80%,#10201c);font-size:10.5px;white-space:nowrap}\n.cc-tag.certificate{background:var(--cc-amber-soft);color:var(--cc-amber)}\n\n/* ---------- 空状态 ---------- */\n.cc-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:56px 20px;color:var(--cc-muted);text-align:center}\n.cc-empty.small{padding:22px 12px;font-size:12px}\n.cc-empty-mark{width:52px;height:52px;display:grid;place-items:center;border:1px dashed var(--cc-line-strong);border-radius:50%;color:var(--cc-faint);font-size:20px}\n.cc-empty h2{margin:6px 0 0;font-size:15px;color:var(--cc-ink)}\n.cc-empty p{margin:0;max-width:44ch;font-size:12px}\n\n/* ---------- 列表 ---------- */\n.cc-list{display:flex;flex-direction:column;gap:1px;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);overflow:hidden;background:var(--cc-line)}\n.cc-list-row{display:grid;grid-template-columns:minmax(120px,150px) auto minmax(0,1fr) auto auto auto;align-items:center;gap:10px;padding:11px 16px;border:0;background:var(--cc-surface);text-align:left;transition:background-color var(--cc-fast) ease,padding-left var(--cc-fast) var(--cc-ease)}\n.cc-list-row:hover{background:#f7fbfa;padding-left:20px}\n.cc-list-row time{color:var(--cc-muted);font-size:11.5px;font-variant-numeric:tabular-nums}\n.cc-list-row strong{font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.cc-list-alias{padding:1px 7px;border-radius:var(--cc-radius-pill);background:var(--cc-teal-soft);color:var(--cc-green);font-size:10.5px;white-space:nowrap}\n.cc-category{color:var(--cc-muted);font-size:11px}\n\n/* ---------- 时间轴 ---------- */\n.cc-timeline{display:flex;flex-direction:column;gap:6px;padding:4px 0 0}\n.cc-tl-row{position:relative;display:grid;grid-template-columns:minmax(110px,132px) 44px minmax(0,1fr) auto;align-items:center;gap:12px;padding:10px 14px;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);background:var(--cc-surface);text-align:left;transition:border-color var(--cc-fast) ease,transform var(--cc-fast) var(--cc-ease),box-shadow var(--cc-fast) ease}\n.cc-tl-row::before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 3px 3px 0;background:var(--cc-chip,var(--cc-teal));opacity:.75}\n.cc-tl-row:hover{border-color:var(--cc-line-strong);transform:translateX(2px);box-shadow:var(--cc-shadow-sm)}\n.cc-tl-row.expected{background:linear-gradient(90deg,#fdfaf4,#fff 30%)}\n.cc-tl-date{display:flex;flex-direction:column;gap:1px;padding-left:6px}\n.cc-tl-date strong{font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}\n.cc-tl-date small{color:var(--cc-muted);font-size:10.5px}\n.cc-tl-body{display:flex;flex-direction:column;gap:2px;min-width:0}\n.cc-tl-title{font-size:13.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.cc-tl-body small{color:var(--cc-muted);font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n\n/* ---------- 缩略图 ---------- */\n.cc-thumb{display:block;border-radius:9px;object-fit:cover;background:#e8eff0;flex:none}\n.cc-thumb.placeholder{display:grid;place-items:center;color:#fff;font-weight:600;letter-spacing:.02em}\n.cc-thumb.placeholder[data-color="teal"]{background:linear-gradient(140deg,#1b9a83,#0f6a5a)}\n.cc-thumb.placeholder[data-color="amber"]{background:linear-gradient(140deg,#c4913a,#8d6119)}\n.cc-thumb.placeholder[data-color="rose"]{background:linear-gradient(140deg,#c2697a,#8e3d4e)}\n.cc-thumb.placeholder[data-color="violet"]{background:linear-gradient(140deg,#8477c6,#52459a)}\n.cc-thumb.placeholder[data-color="sky"]{background:linear-gradient(140deg,#4b9cc4,#236488)}\n.cc-thumb.placeholder[data-color="olive"]{background:linear-gradient(140deg,#8a9c4c,#5a6a26)}\n.cc-thumb.placeholder[data-color="slate"]{background:linear-gradient(140deg,#74868f,#45555d)}\n.cc-thumb.row{width:44px;height:44px;font-size:15px}\n.cc-thumb.card{width:56px;height:56px;font-size:17px}\n.cc-thumb.wide{width:100%;height:110px;border-radius:10px 10px 0 0;font-size:26px}\n.cc-thumb.hero{width:100%;height:172px;border-radius:0;font-size:40px}\n\n/* ---------- 悬浮卡 ---------- */\n.cc-hover-card{position:fixed;z-index:60;width:248px;padding-bottom:10px;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);background:var(--cc-surface);box-shadow:var(--cc-shadow);animation:cc-pop-in .18s var(--cc-ease) both;pointer-events:none;overflow:hidden}\n.cc-hover-card strong{display:block;padding:8px 12px 0;font-size:12.5px;line-height:1.4}\n.cc-hover-meta,.cc-hover-card p,.cc-hover-more{display:block;padding:2px 12px 0;color:var(--cc-muted);font-size:11px}\n.cc-hover-more{color:var(--cc-green)}\n\n/* ---------- 对话提示 / 建议 ---------- */\n.cc-conversation-hint{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:4px 0 16px;padding:16px 18px;border:1px solid #cfe4de;border-radius:var(--cc-radius-lg);background:linear-gradient(120deg,#eef7f4,#f8fbfa);animation:cc-slide-down .26s var(--cc-ease) both}\n.cc-conversation-hint strong{display:block;font-size:13.5px}\n.cc-conversation-hint p{margin:3px 0 0;color:var(--cc-body);font-size:12px;max-width:58ch}\n.cc-ask-actions{display:flex;gap:8px;flex-wrap:wrap}\n.cc-ask-error{flex-basis:100%;margin:0}\n.cc-suggest{margin:18px 0 0;padding:18px;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);background:var(--cc-surface)}\n.cc-suggest-head{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}\n.cc-suggest-head h2{margin:0;font-size:15px}\n.cc-suggest-head p{margin:3px 0 0;color:var(--cc-muted);font-size:12px}\n.cc-suggest-list{display:grid;gap:8px}\n.cc-suggest-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--cc-line);border-radius:10px}\n.cc-suggest-body{display:flex;flex-direction:column;gap:2px;min-width:0}\n.cc-suggest-body strong{font-size:13px}\n.cc-suggest-body small{color:var(--cc-muted);font-size:11.5px}\n.cc-suggest-typical,.cc-suggest-meta{color:var(--cc-muted)}\n.cc-suggest-row:hover{border-color:var(--cc-line-strong)}\n\n/* ---------- 数据维护 ---------- */\n.cc-manage{display:flex;flex-direction:column;gap:18px;padding-top:18px;animation:cc-fade .28s var(--cc-ease) both}\n.cc-section{padding:18px;border:1px solid var(--cc-line);border-radius:var(--cc-radius-lg);background:var(--cc-surface);box-shadow:var(--cc-shadow-sm)}\n.cc-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:14px}\n.cc-section-head h2{margin:0;font-size:15px}\n.cc-section-head p{margin:3px 0 0;color:var(--cc-muted);font-size:12px;max-width:66ch}\n.cc-profile-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}\n.cc-choice-set{margin:14px 0 0;padding:0;border:0;min-width:0}\n.cc-choice-set legend{padding:0 0 6px;color:var(--cc-muted);font-size:11px;letter-spacing:.02em}\n.cc-choice-grid{display:flex;flex-wrap:wrap;gap:6px}\n.cc-choice-grid label{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border:1px solid var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:var(--cc-surface);font-size:12px;cursor:pointer;transition:background-color var(--cc-fast) ease,border-color var(--cc-fast) ease,color var(--cc-fast) ease}\n.cc-choice-grid label:hover{border-color:var(--cc-teal)}\n.cc-choice-grid label:has(input:checked){background:var(--cc-teal-soft);border-color:var(--cc-teal);color:var(--cc-green);font-weight:500}\n.cc-choice-grid input{accent-color:var(--cc-teal);margin:0}\n.cc-data-list{display:flex;flex-direction:column;gap:1px;border:1px solid var(--cc-line);border-radius:10px;overflow:hidden;background:var(--cc-line);max-height:440px;overflow-y:auto}\n.cc-data-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:10px;padding:8px 12px;background:var(--cc-surface);transition:background-color var(--cc-fast) ease}\n.cc-data-row:hover{background:#f7fbfa}\n.cc-data-row strong{font-size:12.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.cc-data-disclaimer{margin:10px 0 0;color:var(--cc-muted);font-size:11px;line-height:1.6}\n\n/* 重复记录 */\n.cc-dupe-list{display:flex;flex-direction:column;gap:8px}\n.cc-dupe-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:12px;padding:12px 14px;border:1px dashed var(--cc-line-strong);border-radius:10px;background:#fbfdfd;animation:cc-slide-down .24s var(--cc-ease) both}\n.cc-dupe-row strong{font-size:12.5px}\n.cc-dupe-row small{display:block;margin-top:2px;color:var(--cc-muted);font-size:11px}\n.cc-dupe-row ul{margin:6px 0 0;padding-left:16px;color:var(--cc-muted);font-size:11.5px}\n.cc-dupe-row li{margin:1px 0}\n\n/* ---------- 弹层 / 详情 / 编辑 ---------- */\n.cc-overlay,.cc-memo-modal-backdrop{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;background:rgba(20,36,32,.42);backdrop-filter:blur(3px);animation:cc-fade .18s ease both}\n.cc-dialog{width:min(660px,100%);max-height:min(88vh,860px);overflow:auto;border-radius:var(--cc-radius-lg);background:var(--cc-surface);box-shadow:var(--cc-shadow-lg);animation:cc-dialog-in .26s var(--cc-ease) both}\n.cc-dialog.editor{width:min(760px,100%)}\n.cc-dialog-head{position:relative;display:flex;flex-direction:column;gap:8px;padding:18px 20px 12px}\n.cc-dialog-head .cc-tag{align-self:flex-start}\n.cc-dialog-head .icon-button{position:absolute;top:14px;right:14px}\n.cc-dialog-head h2{margin:0;font-size:19px;line-height:1.35;padding-right:40px}\n.cc-dialog-alias{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 10px;border-radius:10px;background:var(--cc-teal-soft);font-size:11.5px;color:var(--cc-body)}\n.cc-dialog-alias strong{font-size:12.5px;color:var(--cc-green);letter-spacing:.02em}\n.cc-dialog-alias small{color:var(--cc-muted)}\n.cc-dialog-actions{padding:12px 20px;border-bottom:1px solid var(--cc-line)}\n.cc-demo-notice{margin:0;padding:8px 10px;border-radius:8px;background:var(--cc-amber-soft);color:var(--cc-amber);font-size:11.5px}\n.cc-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px;margin:0;padding:16px 20px}\n.cc-detail-grid div{min-width:0}\n.cc-detail-grid dt{color:var(--cc-muted);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase}\n.cc-detail-grid dd{margin:2px 0 0;color:var(--cc-body);font-size:12.5px;overflow-wrap:anywhere}\n.cc-node-list{padding:14px 20px 18px;border-top:1px solid var(--cc-line)}\n.cc-section-title{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px}\n.cc-section-title h3{margin:0;font-size:13px;font-weight:600}\n.cc-section-count{color:var(--cc-muted);font-size:11px}\n.cc-node-list article{display:flex;flex-direction:column;gap:2px;padding:9px 12px;margin-bottom:6px;border:1px solid var(--cc-line);border-left:3px solid var(--cc-chip,var(--cc-teal));border-radius:8px;background:#fcfefe;animation:cc-slide-down .2s var(--cc-ease) both}\n.cc-node-list article > div{display:flex;align-items:center;justify-content:space-between;gap:8px}\n.cc-node-list article strong{font-size:12.5px}\n.cc-node-list article p{margin:0;color:var(--cc-body);font-size:12px}\n.cc-node-list article small{color:var(--cc-muted);font-size:11px}\n.cc-node-distance{color:var(--cc-green)}\n/* 重要程度选择器：四档色块，点一下就写回数据，月历格当格立刻变色。\n   色值必须和月历格同一套（--cc-l1..4 / --cc-l1-line..4），否则「点了没反应」的错觉会回来。 */\n.cc-level-picker{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:7px;padding-top:7px;border-top:1px dashed var(--cc-line)}\n.cc-level-label{color:var(--cc-muted);font-size:10.5px;letter-spacing:.06em}\n.cc-level-option{display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 7px;border:1px solid var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:var(--cc-surface);color:var(--cc-body);font-size:11px;transition:border-color var(--cc-fast) ease,background-color var(--cc-fast) ease,transform var(--cc-fast) var(--cc-ease)}\n.cc-level-option:hover{border-color:var(--cc-line-strong);transform:translateY(-1px)}\n.cc-level-dot{width:9px;height:9px;border-radius:3px;background:var(--cc-l1)}\n.cc-level-option[data-level="2"] .cc-level-dot{background:var(--cc-l2-line)}\n.cc-level-option[data-level="3"] .cc-level-dot{background:var(--cc-l3-line)}\n.cc-level-option[data-level="4"] .cc-level-dot{background:var(--cc-l4-line)}\n.cc-level-option[data-level="1"] .cc-level-dot{background:var(--cc-l1-line)}\n.cc-level-option[data-level="1"].selected{background:var(--cc-l1);border-color:var(--cc-l1-line);color:var(--cc-ink)}\n.cc-level-option[data-level="2"].selected{background:var(--cc-l2);border-color:var(--cc-l2-line);color:var(--cc-ink)}\n.cc-level-option[data-level="3"].selected{background:var(--cc-l3);border-color:var(--cc-l3-line);color:var(--cc-ink)}\n.cc-level-option[data-level="4"].selected{background:var(--cc-l4);border-color:var(--cc-l4-line);color:var(--cc-ink)}\n.cc-level-option.selected{font-weight:600;box-shadow:inset 0 0 0 1px currentColor}\n/* 没手动设过时，四档里会有一档是「系统按节点类型推出来的」，但**不能画成已被选中** ——\n   之前给了同样的填色，用户以为「已经默认好了、点不动」。改成：只有小方点是实色，\n   pill 本身保持中性 + 虚线边框 + 灰字，和用户亲手选的那一档一眼分得开。 */\n.cc-level-option.selected.implied{background:var(--cc-surface);border-style:dashed;border-color:color-mix(in srgb,var(--cc-line-strong) 90%,transparent);box-shadow:none;font-weight:400;color:var(--cc-muted)}\n.cc-level-option.selected.implied .cc-level-dot{box-shadow:0 0 0 2px color-mix(in srgb,currentColor 12%,transparent)}\n.cc-level-picker .cc-level-hint{color:var(--cc-muted);font-size:10.5px;margin-left:2px}\n.cc-level-reset{padding:2px 8px;border:1px dashed var(--cc-line-strong);border-radius:var(--cc-radius-pill);background:none;color:var(--cc-muted);font-size:10.5px}\n.cc-level-reset:hover{color:var(--cc-green);border-color:var(--cc-teal)}\n.cc-level-auto{color:var(--cc-muted);font-size:10.5px}\n.cc-node-empty{color:var(--cc-muted);font-size:12px}\n.cc-source{display:flex;flex-direction:column;gap:3px;padding:12px 20px 18px;border-top:1px solid var(--cc-line);color:var(--cc-muted);font-size:11.5px;overflow-wrap:anywhere}\n.cc-source a{color:var(--cc-green)}\n.cc-member-list{padding:14px 20px 20px;border-top:1px solid var(--cc-line);background:#fafcfc}\n.cc-member-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:7px 10px;margin-bottom:5px;border-radius:8px;background:var(--cc-surface);border-left:3px solid var(--cc-chip,var(--cc-teal))}\n.cc-member-row strong{font-size:12px;font-weight:500;overflow-wrap:anywhere}\n.cc-member-row small{flex:none;color:var(--cc-muted);font-size:10.5px}\n\n/* 编辑表单 */\n.cc-editor-form{display:flex;flex-direction:column;gap:16px;padding:4px 20px 20px}\n.cc-editor-section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px;border:1px solid var(--cc-line);border-radius:12px;min-width:0}\n.cc-editor-section legend{padding:0 6px;color:var(--cc-muted);font-size:11px;letter-spacing:.06em}\n.cc-editor-nodes{grid-template-columns:1fr}\n.cc-node-editor-head{display:flex;align-items:center;justify-content:space-between;gap:10px;grid-column:1 / -1;flex-wrap:wrap}\n.cc-editor-node{display:grid;grid-template-columns:1fr;gap:10px;padding:12px;border:1px dashed var(--cc-line-strong);border-radius:10px;min-width:0;background:#fcfefe}\n.cc-editor-node legend{padding:0 6px;color:var(--cc-muted);font-size:10.5px}\n.cc-editor-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:end}\n.cc-editor-row:has(> label:nth-child(3)){grid-template-columns:repeat(3,minmax(0,1fr))}\n.cc-form-actions{position:sticky;bottom:0;padding:12px 0 0;background:linear-gradient(180deg,transparent,var(--cc-surface) 40%)}\n\n/* 备忘 / 日程小表单 */\n.cc-memo-modal{width:min(460px,100%);border-radius:var(--cc-radius-lg);background:var(--cc-surface);box-shadow:var(--cc-shadow-lg);animation:cc-dialog-in .24s var(--cc-ease) both}\n.cc-memo-form{display:flex;flex-direction:column;gap:10px;padding:16px 18px 18px}\n.cc-memo-form-head,.cc-event-form-head{display:flex;align-items:center;justify-content:space-between;gap:10px}\n.cc-memo-form label,.cc-event-form label{display:flex;flex-direction:column;gap:4px;min-width:0}\n.cc-memo-form label > span,.cc-event-form label > span{color:var(--cc-muted);font-size:11px}\n.cc-event-form{display:flex;flex-direction:column;gap:10px;margin-top:12px;padding:12px;border:1px solid var(--cc-line);border-radius:12px;background:#fbfdfd;animation:cc-slide-down .24s var(--cc-ease) both}\n.cc-event-description{grid-column:1 / -1}\n\n/* 加载 / 出错 */\n.cc-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:320px;color:var(--cc-muted);font-size:13px}\n.cc-state h1{margin:0;font-size:17px;color:var(--cc-ink)}\n\n/* ---------- 动效 ---------- */\n@keyframes cc-fade{from{opacity:0}to{opacity:1}}\n@keyframes cc-slide-down{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}\n@keyframes cc-pop-in{from{opacity:0;transform:translateY(4px) scale(.98)}to{opacity:1;transform:none}}\n@keyframes cc-dialog-in{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}\n@keyframes cc-pop{0%{transform:scale(.7)}60%{transform:scale(1.08)}100%{transform:scale(1)}}\n@keyframes cc-dot{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:.9}}\n@keyframes cc-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}\n@keyframes cc-pulse{0%,100%{box-shadow:0 0 0 0 rgba(79,195,161,.55)}50%{box-shadow:0 0 0 5px rgba(79,195,161,0)}}\n/* 左侧竖条出现时从中间长出来：有安排的日子进入视野时会「亮一下」，比纯静态底色更容易被注意到 */\n@keyframes cc-strip{from{transform:scaleY(.2);opacity:0}to{transform:scaleY(1);opacity:1}}\n\n/* ---------- 响应式 ---------- */\n@media(max-width:1100px){\n  .cc-main{padding:0 18px 32px}\n  .cc-calendar-layout{grid-template-columns:minmax(0,1fr) minmax(200px,236px);gap:14px}\n  .cc-grid{grid-auto-rows:minmax(84px,auto)}\n  .cc-filters.expanded{grid-template-columns:repeat(2,minmax(0,1fr))}\n}\n@media(max-width:760px){\n  .cc-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}\n  .cc-sidebar{flex-direction:row;align-items:center;gap:10px;padding:10px 12px;min-height:0}\n  .cc-brand{padding:0;flex:none}\n  .cc-brand small{display:none}\n  .cc-side-nav{flex-direction:row;gap:2px;flex:1;min-width:0}\n  .cc-side-nav button{padding:8px;justify-content:center}\n  .cc-side-nav button span{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n  .cc-side-nav button.active::before{display:none}\n  .cc-sidebar-foot{display:none}\n  .cc-main{padding:0 12px 24px}\n  .cc-topbar{padding:14px 0 10px}\n  .cc-topbar h1{font-size:16px}\n  .cc-month-head{flex-wrap:wrap;align-items:flex-start}\n  .cc-month-head h2{font-size:18px}\n  .cc-calendar-layout{grid-template-columns:1fr;padding-top:4px}\n  .cc-agenda{position:static;max-height:none}\n  .cc-search{flex-basis:100%;max-width:none}\n  .cc-segment{width:100%}\n  .cc-segment button{flex:1}\n  .cc-filters.expanded{grid-template-columns:repeat(2,minmax(0,1fr))}\n  .cc-grid{grid-template-columns:repeat(7,minmax(40px,1fr));grid-auto-rows:minmax(62px,auto)}\n  .cc-day{padding:4px 3px 5px}\n  .cc-chip{font-size:10px;padding:1px 4px;gap:3px}\n  /* 窄屏没有 hover，42 个「+」全冒出来会把日历糊成一片；改成点某天后在侧栏里新增 */\n  .cc-day-add{display:none}\n  .cc-calendar-legend{display:none}\n  .cc-profile-form,.cc-editor-section,.cc-editor-row,.cc-editor-row:has(> label:nth-child(3)){grid-template-columns:1fr}\n  .cc-detail-grid{grid-template-columns:1fr}\n  .cc-list-row{grid-template-columns:minmax(0,1fr) auto;gap:4px 10px}\n  .cc-list-row time,.cc-list-alias{grid-row:2}\n  .cc-tl-row{grid-template-columns:minmax(84px,104px) 36px minmax(0,1fr);gap:8px}\n  .cc-tl-row > .cc-confidence{display:none}\n  .cc-dialog{padding-bottom:8px}\n  .cc-mobile-suitable{display:inline-flex}\n}\n@media(max-width:420px){\n  .cc-grid{grid-auto-rows:minmax(56px,auto)}\n  .cc-chip .cc-chip-text{font-size:9.5px}\n}\n\n/* ---------- 深色主题：只换表面与文字令牌 ---------- */\n@media(prefers-color-scheme:dark){\n  :root{\n    --cc-ink:#e6f0ed;--cc-body:#c3d3ce;--cc-muted:#93a7a0;--cc-faint:#7b8f89;\n    --cc-line:#2b3a36;--cc-line-strong:#3a4c47;\n    --cc-paper:#111b19;--cc-white:#1a2724;--cc-surface:#1a2724;\n    --cc-l1:#1b2a30;--cc-l2:#1d3446;--cc-l3:#3a2f1c;--cc-l4:#4a2a24;\n    --cc-l1-line:#3f6473;--cc-l2-line:#4d86bb;--cc-l3-line:#a8792c;--cc-l4-line:#b45a44;\n    --cc-green:#3fb79a;--cc-green-soft:#173029;--cc-teal:#3fb79a;--cc-teal-soft:#17302c;\n    --cc-amber:#d3a158;--cc-amber-soft:#332818;--cc-red:#e08074;--cc-red-soft:#3a2220;\n    --cc-shadow-sm:0 1px 2px rgba(0,0,0,.4);--cc-shadow:0 12px 32px rgba(0,0,0,.45);--cc-shadow-lg:0 24px 60px rgba(0,0,0,.55);\n  }\n  .cc-shell{background:var(--cc-paper);color:var(--cc-ink)}\n  .cc-sidebar{background:#0e1917}\n  .cc-chip,.cc-tag{background:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 20%,#0f1c19);color:#eaf5f1;border-color:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 38%,transparent)}\n  /* 档期未定条与空月提示都是「白底卡片」，深色下必须显式换底，否则字压在自己身上看不见 */\n  .cc-floating,.cc-grid-empty{background:color-mix(in srgb,var(--cc-surface) 82%,#0f1c19);border-color:var(--cc-line-strong)}\n  .cc-floating-chip{background:var(--cc-surface);border-color:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 42%,transparent);color:var(--cc-ink)}\n  .cc-floating-chip.uncertain{background:transparent}\n  .cc-floating-chip[data-level="4"]{background:color-mix(in srgb,var(--cc-l4) 55%,var(--cc-surface))}\n  .cc-chip:hover{background:color-mix(in srgb,var(--cc-chip,var(--cc-teal)) 30%,#0f1c19)}\n  .cc-chip.uncertain,.cc-chip.demo,.cc-tag.certificate{background:transparent}\n  .cc-day.outside{background:#0f1816}\n  .cc-day:hover{filter:brightness(1.08)}\n  .cc-day.has-events{background:color-mix(in srgb,var(--cc-l1) 80%,var(--cc-surface))}\n  .cc-day.has-events[data-level="2"]{background:color-mix(in srgb,var(--cc-l2) 80%,var(--cc-surface))}\n  .cc-day.has-events[data-level="3"]{background:color-mix(in srgb,var(--cc-l3) 80%,var(--cc-surface))}\n  .cc-day.has-events[data-level="4"]{background:color-mix(in srgb,var(--cc-l4) 80%,var(--cc-surface))}\n  .cc-day.has-events .cc-day-number{color:var(--cc-ink)}\n  .cc-day-add{background:rgba(20,36,32,.6)}\n  .cc-agenda-row:hover,.cc-list-row:hover,.cc-data-row:hover{background:#1e2f2b}\n  .cc-tl-row.expected{background:linear-gradient(90deg,#241f14,#1a2724 30%)}\n  .cc-node-list article,.cc-editor-node,.cc-event-form,.cc-member-list,.cc-dupe-row{background:#16211f}\n  .cc-choice-grid label{background:#1a2724}\n  .cc-segment,.cc-search,.cc-toggle,.cc-button{background:#1a2724}\n  .cc-button:hover{background:#20322e}\n  .cc-button.primary,.cc-segment button.selected,.cc-day.today .cc-day-number{background:var(--cc-green);color:#0b1513}\n  .cc-dialog-hero,.cc-thumb.placeholder{background:#20322e}\n  .cc-form-actions{background:linear-gradient(180deg,transparent,#1a2724 40%)}\n  .cc-conversation-hint{background:linear-gradient(120deg,#15221f,#182623);border-color:#2b443d}\n  .cc-data-list,.cc-list{background:var(--cc-line)}\n}\n\n/* ---------- 减少动态效果 ---------- */\n@media(prefers-reduced-motion:reduce){\n  .cc-shell *,.cc-overlay *,.cc-memo-modal-backdrop *{animation:none!important;transition:none!important;scroll-behavior:auto!important}\n  .cc-tl-row:hover,.cc-chip:hover,.cc-list-row:hover,.cc-side-nav button:hover svg,.cc-brand:hover .cc-brand-mark{transform:none}\n}\n';

// src/domain/model.js
var CATEGORIES = ["competition", "certificate", "memo"];
var NODE_TYPES = ["registration", "registration_deadline", "competition", "exam", "submission", "result", "other"];
var CONFIDENCE = ["official_confirmed", "predicted", "pending_confirmation", "unknown"];
var REGISTRATION_STATUS = ["not_open", "open", "closed", "unknown"];
var TAG_COLORS = ["teal", "amber", "rose", "violet", "sky", "olive", "slate"];
var PRECISION = ["exact", "range", "month", "year", "unknown"];
var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function confidenceLabel(item = {}, node = {}) {
  if (item.demo) return { label: "演示", detail: "演示用时间窗，不代表真实活动或官方安排。" };
  if (node.confidence === "official_confirmed" && (node.start || node.end) && validUrl(item.sourceUrl) && validDate(item.verifiedAt) && item.verifiedAt) return { label: "官方已确认", detail: `最近核验：${item.verifiedAt}` };
  if (node.confidence === "official_confirmed" || node.confidence === "pending_confirmation") return { label: "待确认", detail: node.note || "等待主办方发布正式日期。" };
  if (node.confidence === "predicted") return { label: "预测", detail: node.note || "依据往年安排推测，待官方确认。" };
  return { label: "日期未知", detail: node.note || "暂无可确认的日期。" };
}
function validDate(value) {
  if (value === null) return true;
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function nodePrecision(node = {}) {
  const start = node?.start || null;
  const end = node?.end || null;
  if (!start && !end) return "unknown";
  const declared = node?.accuracy;
  if (declared === "month" || declared === "year") return declared;
  if (declared === "range" && end && start !== end) return "range";
  return end && start !== end ? "range" : "exact";
}
function monthBounds(value) {
  const year = Number(String(value).slice(0, 4));
  const month = Number(String(value).slice(5, 7));
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return { from: `${prefix}-01`, to: `${prefix}-${String(last).padStart(2, "0")}` };
}
function nodeWindow(node = {}) {
  const precision = nodePrecision(node);
  const start = node?.start || node?.end || null;
  if (precision === "unknown" || !start) return { precision: "unknown", from: null, to: null };
  if (precision === "month") return { precision, ...monthBounds(start) };
  if (precision === "year") {
    const year = start.slice(0, 4);
    return { precision, from: `${year}-01-01`, to: `${year}-12-31` };
  }
  return { precision, from: start, to: node?.end || start };
}
var VERIFY_FRESH_DAYS = 90;
var VERIFY_STALE_DAYS = 180;
var DAY_MS = 864e5;
function verifiedAgeDays(item = {}, today = /* @__PURE__ */ new Date()) {
  const raw = typeof item?.verifiedAt === "string" ? item.verifiedAt.slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const then = Date.parse(`${raw}T00:00:00Z`);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (!Number.isFinite(then)) return null;
  return Math.max(0, Math.round((now - then) / DAY_MS));
}
function verificationState(item = {}, today = /* @__PURE__ */ new Date()) {
  const days = verifiedAgeDays(item, today);
  if (days === null) return { state: "unknown", days: null };
  if (days <= VERIFY_FRESH_DAYS) return { state: "fresh", days };
  if (days <= VERIFY_STALE_DAYS) return { state: "cooling", days };
  return { state: "stale", days };
}
function validImageUrl(value) {
  return typeof value === "string" && value.length <= 500 && validUrl(value);
}
function validUrl(value) {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
function text(value, max = 2e3) {
  return typeof value === "string" && value.length <= max;
}
function validateItem(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: ["事项必须是对象"] };
  if (!text(input.id, 100) || !input.id.trim()) errors.push("id 必填且不超过 100 字符");
  if (!text(input.title, 200) || !input.title.trim()) errors.push("title 必填且不超过 200 字符");
  if (!CATEGORIES.includes(input.category)) errors.push("category 无效");
  if (input.category === "memo") {
    if (input.memoLevel !== void 0 && ![1, 2, 3, 4].includes(input.memoLevel)) errors.push("memoLevel 必须是 1-4");
    if (input.nodes?.length !== 1) errors.push("备忘必须只有一个日期节点");
    else if (input.nodes[0]?.type !== "other" || !input.nodes[0]?.start || input.nodes[0]?.end) errors.push("备忘必须是单日日期节点");
  } else if (input.memoLevel !== void 0) errors.push("memoLevel 仅适用于备忘");
  if (input.demo !== void 0 && typeof input.demo !== "boolean") errors.push("demo 必须为布尔值");
  if (input.alias !== void 0 && input.alias !== "" && (!text(input.alias, 12) || !input.alias.trim())) errors.push("alias 必须是不超过 12 字符的非空文本");
  for (const field of ["description", "organizer", "eligibility", "notes"]) {
    if (input[field] !== void 0 && !text(input[field])) errors.push(`${field} 格式无效`);
  }
  for (const field of ["majors", "interests", "years", "regions"]) {
    if (input[field] !== void 0 && (!Array.isArray(input[field]) || input[field].some((value) => !text(value, 100)))) errors.push(`${field} 必须为字符串列表`);
  }
  if (input.group !== void 0 && (!text(input.group, 100) || !input.group.trim())) errors.push("group 必须是不超过 100 字符的事项 id");
  if (input.sourceUrl !== void 0 && input.sourceUrl !== "" && !validUrl(input.sourceUrl)) errors.push("sourceUrl 必须是 http 或 https URL");
  if (input.imageUrl !== void 0 && input.imageUrl !== "" && !validImageUrl(input.imageUrl)) errors.push("imageUrl 必须是 http 或 https 图片直链");
  if (input.artist !== void 0 && input.artist !== "" && !text(input.artist, 120)) errors.push("artist 格式无效");
  if (input.venue !== void 0 && input.venue !== "" && !text(input.venue, 200)) errors.push("venue 格式无效");
  if (input.verifiedAt !== void 0 && input.verifiedAt !== "" && !validDate(input.verifiedAt)) errors.push("verifiedAt 必须是 YYYY-MM-DD 日期");
  if (input.registrationStatus !== void 0 && !REGISTRATION_STATUS.includes(input.registrationStatus)) errors.push("registrationStatus 无效");
  if (!Array.isArray(input.nodes) || input.nodes.length > 100) errors.push("nodes 必须是最多 100 项的列表");
  else {
    const nodeIds = /* @__PURE__ */ new Set();
    input.nodes.forEach((node, index) => {
      const prefix = `nodes[${index}]`;
      if (!node || typeof node !== "object") {
        errors.push(`${prefix} 必须是对象`);
        return;
      }
      if (!text(node.id, 100) || !node.id.trim()) errors.push(`${prefix}.id 必填`);
      else if (nodeIds.has(node.id)) errors.push(`${prefix}.id 重复`);
      else nodeIds.add(node.id);
      if (!NODE_TYPES.includes(node.type)) errors.push(`${prefix}.type 无效`);
      if (!CONFIDENCE.includes(node.confidence)) errors.push(`${prefix}.confidence 无效`);
      const start = node.start ?? null;
      const end = node.end ?? null;
      if (!validDate(start) || !validDate(end)) errors.push(`${prefix} 日期必须是真实的 YYYY-MM-DD 或 null`);
      if (start && end && start > end) errors.push(`${prefix} 日期范围倒置`);
      if (input.demo && node.confidence === "official_confirmed") errors.push(`${prefix} 演示数据不能标记为官方已确认`);
      if (node.confidence === "official_confirmed" && (!validUrl(input.sourceUrl) || !validDate(input.verifiedAt) || !input.verifiedAt || !start && !end)) errors.push(`${prefix} 官方确认日期必须有日期、来源 URL 和核验日期`);
      if (node.confidence === "predicted" && (!text(node.note, 1e3) || !node.note.trim())) errors.push(`${prefix} 预测日期必须填写依据说明`);
      if (node.note !== void 0 && !text(node.note, 1e3)) errors.push(`${prefix}.note 格式无效`);
      if (node.accuracy !== void 0 && !PRECISION.includes(node.accuracy)) errors.push(`${prefix}.accuracy 无效`);
      if (node.color !== void 0 && node.color !== "" && !TAG_COLORS.includes(node.color)) errors.push(`${prefix}.color 无效`);
      if (node.level !== void 0 && ![1, 2, 3, 4].includes(node.level)) errors.push(`${prefix}.level 必须是 1-4`);
    });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: structuredClone(input) };
}

// src/domain/filter.js
function tagColor(item) {
  let hash = 0;
  for (const char of String(item?.id ?? item?.title ?? "")) hash = (hash * 31 + char.codePointAt(0)) % 1e5;
  return ["teal", "amber", "rose", "violet", "sky", "olive", "slate"][hash % 7];
}
function includesValue(values, value) {
  return Array.isArray(values) && values.includes(value);
}
function scoreFit(item, profile = {}) {
  let score2 = 0;
  const reasons = [];
  const rules = [
    ["major", item.majors, profile.major, 35, "专业匹配"],
    ["province", item.regions, profile.province, 15, "地区匹配"],
    ["interests", item.interests, profile.interests, 25, "关注方向匹配"],
    ["year", item.years, profile.year ?? profile.years, 15, "年级适配"],
    ["types", [item.category], profile.types, 10, "类别匹配"]
  ];
  for (const [kind, accepted, selected, weight, label] of rules) {
    if (kind === "interests" || kind === "types") {
      const choices = Array.isArray(selected) ? selected : [];
      if (choices.length && choices.some((value) => includesValue(accepted, value))) {
        score2 += weight;
        reasons.push(label);
      }
    } else if (selected && includesValue(accepted, selected)) {
      score2 += weight;
      reasons.push(label);
    }
  }
  return { score: Math.min(100, score2), reasons };
}
function matchesDate(item, from, to) {
  if (!from && !to) return true;
  return (item.nodes ?? []).some((node) => {
    const { precision, from: start, to: end } = nodeWindow(node);
    if (precision === "unknown" || !start || !end) return false;
    return (!from || end >= from) && (!to || start <= to);
  });
}
var DAY_MS2 = 864e5;
var LONG_SPAN_DAYS = 14;
var ROLLING_YEAR_DAYS = 300;
function spanDays(from, to) {
  if (!from || !to) return 0;
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.round((end - start) / DAY_MS2) + 1;
}
function buildMonthIndex(items = [], month = /* @__PURE__ */ new Date()) {
  const { startKey, endKey } = monthGridBounds(month);
  const index = /* @__PURE__ */ new Map();
  const push = (key, item, node, edge) => {
    if (key < startKey || key > endKey) return;
    const rows = index.get(key) || [];
    if (rows.some((row) => row.item.id === item.id && row.node.id === node.id && row.edge === edge)) return;
    rows.push({ item, node, edge });
    index.set(key, rows);
  };
  for (const item of items ?? []) {
    for (const node of item.nodes ?? []) {
      const { precision, from, to } = nodeWindow(node);
      if (precision === "unknown" || precision === "year" || precision === "month" || !from || !to) continue;
      if (spanDays(from, to) > LONG_SPAN_DAYS) continue;
      if (from > endKey || to < startKey) continue;
      push(from, item, node, from === to ? null : "start");
      if (to !== from) push(to, item, node, "end");
    }
  }
  return index;
}
function monthFloating(items = [], month = /* @__PURE__ */ new Date()) {
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = `${prefix}-01`;
  const monthEnd = `${prefix}-31`;
  const rows = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of items ?? []) {
    for (const node of item.nodes ?? []) {
      const { precision, from, to } = nodeWindow(node);
      if (!from) continue;
      let kind = null;
      if (precision === "month" && from.startsWith(prefix)) kind = "month";
      else if (precision === "range" && spanDays(from, to) > LONG_SPAN_DAYS && from <= monthEnd && to >= monthStart) {
        kind = spanDays(from, to) >= ROLLING_YEAR_DAYS ? "year" : "span";
      }
      if (!kind) continue;
      const key = `${item.id}:${node.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ item, node, edge: null, kind });
    }
  }
  return rows.sort((a, b) => (a.node.start || "").localeCompare(b.node.start || "") || (a.item.title || "").localeCompare(b.item.title || "", "zh-CN"));
}
function monthGridBounds(month = /* @__PURE__ */ new Date()) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - (first.getDay() + 6) % 7);
  const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 41);
  const fmt = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { start, last, startKey: fmt(start), endKey: fmt(last) };
}
function filterItems(items, filters = {}, profile = {}) {
  const query = String(filters.query ?? "").trim().toLocaleLowerCase();
  return (items ?? []).filter((item) => {
    if (query && ![item.title, item.alias, item.description, item.organizer, ...item.interests ?? [], ...item.majors ?? []].filter(Boolean).join(" ").toLocaleLowerCase().includes(query)) return false;
    if (filters.category && filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.major && filters.major !== "all" && !includesValue(item.majors, filters.major)) return false;
    if (filters.province && filters.province !== "all" && !includesValue(item.regions, filters.province)) return false;
    if (filters.status && filters.status !== "all" && item.registrationStatus !== filters.status) return false;
    if (!matchesDate(item, filters.from, filters.to)) return false;
    if (filters.onlySuitable && scoreFit(item, profile).score === 0) return false;
    return true;
  }).sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "zh-CN"));
}

// src/domain/alias.js
var ALIAS_DICTIONARY = [
  { family: "lanqiao", test: /蓝桥杯/, alias: "蓝桥杯" },
  { family: "internet-plus", test: /互联网\s*\+|国际大学生创新大赛/, alias: "国创" },
  { family: "innovation-train", test: /创新创业训练|[(（]大创[)）]|大创项目/, alias: "大创" },
  { family: "challenge-cup", test: /挑战杯.*(学术科技|课外学术)|课外学术科技作品/, alias: "大挑" },
  { family: "challenge-cup-biz", test: /挑战杯.*(创青春|创业计划)|创青春/, alias: "小挑" },
  { family: "challenge-cup", test: /挑战杯/, alias: "大挑" },
  // 省赛要排在 ACM 系列前面：广东省赛的英文缩写就是 GDCPC，别被 CCPC 抢走
  { family: "guangdong-programming", test: /广东省.*程序设计|GDCPC|省赛通道/, alias: "省赛" },
  { family: "ccpc", test: /CCPC|中国大学生程序设计竞赛/, alias: "CCPC" },
  { family: "icpc", test: /ICPC|国际大学生程序设计竞赛/, alias: "ICPC" },
  { family: "csp", test: /CSP/, alias: "CSP" },
  { family: "buaa-sofware", test: /软件设计大赛|中国软件杯|软件创新大赛/, alias: "软件杯" },
  { family: "service-outsourcing", test: /服务外包/, alias: "服务外包" },
  { family: "computer-design", test: /计算机设计大赛|4C/, alias: "计设赛" },
  { family: "db-contest", test: /数据库/, alias: "数据库赛" },
  { family: "tianchi", test: /天池/, alias: "天池赛" },
  { family: "math-modeling", test: /数学建模/, alias: "数模" },
  { family: "statistics-modeling", test: /统计建模/, alias: "统计建模" },
  { family: "ruankao", test: /软件(?:水平)?考试|软考/, detail: /网络工程|网工/, alias: "软考网工", generic: "软考" },
  { family: "ruankao", test: /软件(?:水平)?考试|软考/, detail: /程序员|网络管理员|软件设计师|系统集成/, alias: "软考中级", generic: "软考" },
  { family: "ruankao", test: /软件(?:水平)?考试|软考/, detail: /信息安全|信安/, alias: "软考信安", generic: "软考" },
  { family: "ruankao", test: /软件(?:水平)?考试|软考|专业技术资格/, alias: "软考" },
  { family: "ncre", test: /NCRE|计算机等级考试/, alias: "国二", generic: "NCRE" },
  { family: "cet6", test: /CET-?\s*6|英语六级|大学英语六级/, alias: "六级", generic: "CET6" },
  { family: "cet4", test: /CET-?\s*4|英语四级|大学英语四级/, alias: "四级", generic: "CET4" },
  { family: "nisp", test: /NISP/, alias: "NISP" },
  { family: "cisp", test: /CISP/, alias: "CISP" },
  { family: "hw-ict", test: /华为\s*ICT/, alias: "华为ICT" },
  { family: "ict-huawei", test: /ICT/, alias: "ICT" },
  { family: "ciscn", test: /CISCN|信息安全竞赛/, alias: "CISCN" },
  { family: "iscc", test: /ISCC|信息安全与对抗/, alias: "ISCC" },
  { family: "qiangwang-cup", test: /强网杯/, alias: "强网杯" },
  { family: "wangding-cup", test: /网鼎杯/, alias: "网鼎杯" },
  { family: "yangcheng-cup", test: /羊城杯/, alias: "羊城杯" },
  { family: "yuwang-cup", test: /御网杯/, alias: "御网杯" },
  { family: "xctf", test: /XCTF/, alias: "XCTF" },
  { family: "graduate-security", test: /研究生网络安全/, alias: "研信安" },
  { family: "ctf", test: /CTF|攻防/, alias: "CTF" },
  { family: "career-fair", test: /招聘会|双选会|宣讲会/, alias: "招聘会" },
  { family: "career-planning", test: /职业规划/, alias: "职规赛" },
  { family: "volunteer", test: /志愿服务/, alias: "志愿赛" },
  { family: "math-competition", test: /数学竞赛/, alias: "数学赛" },
  { family: "english-competition", test: /英语演讲|英语竞赛|外研社/, alias: "英语赛" },
  { family: "robot", test: /机器人/, alias: "机器人" },
  { family: "ai-competition", test: /人工智能/, alias: "AI赛" }
];
var FILLER = [
  /^["“”'‘’「」《》\s]+/,
  /["“”'‘’「」《》\s]+$/,
  /全国大学生/g,
  /中国大学生/g,
  /全国/g,
  /中国/g,
  /省级/g,
  /广东(?:省)?/g,
  /全国软件和信息技术专业人才大赛/g
];
var SUFFIX = /(大赛|竞赛|比赛|考试|赛事|挑战赛|认证|项目|计划|赛道)$/g;
var BRACKET = /[（(][^）)]{0,40}[）)]/g;
var MAX_ALIAS = 6;
function readable(text2) {
  if (!text2) return "";
  const ascii = text2.replace(/[^\x21-\x7e]/g, "");
  if (/^[A-Za-z0-9+._-]+$/.test(text2) && text2.length >= 2) return text2;
  if (ascii.length >= 2 && ascii.length >= text2.length - 2) {
    const chinese = text2.replace(/[A-Za-z0-9\s+._-]+/g, "");
    return chinese ? `${chinese.slice(0, 2)}${ascii}`.slice(0, MAX_ALIAS) : ascii;
  }
  return text2;
}
function autoAlias(title = "", { max = MAX_ALIAS } = {}) {
  let text2 = String(title || "").trim();
  if (!text2) return "";
  text2 = text2.replace(BRACKET, "");
  for (const rule of FILLER) text2 = text2.replace(rule, "");
  text2 = text2.replace(SUFFIX, "");
  text2 = text2.trim();
  const words = text2.split(/[\s·・/／|｜]+/).filter(Boolean);
  const first = readable(words[0] || text2);
  if (!first) return "";
  return [...first].slice(0, max).join("");
}
function variantOf(item, title) {
  const family = ALIAS_DICTIONARY.find((rule) => rule.test.test(title)) || ALIAS_DICTIONARY.find((rule) => rule.test.test(item.description || ""));
  if (family && family.detail) return family;
  if (!family) return null;
  return ALIAS_DICTIONARY.find((rule) => rule.detail && rule.family === family.family && rule.detail.test(title)) || null;
}
function itemAlias(item = {}, { max = MAX_ALIAS } = {}) {
  const custom = String(item.alias || "").trim();
  if (custom) return { alias: [...custom].slice(0, 12).join(""), source: "custom" };
  const title = item.title || "";
  const detailed = variantOf(item, title);
  if (detailed) return { alias: detailed.alias, source: "dictionary", family: detailed.family };
  const same = (rule) => rule.test.test(title) || rule.test.test(item.description || "");
  const hit = ALIAS_DICTIONARY.find((rule) => rule.test.test(title)) || ALIAS_DICTIONARY.find(same);
  if (hit) return { alias: hit.alias, source: "dictionary", family: hit.family };
  return { alias: autoAlias(item.title, { max }), source: "auto" };
}

// src/domain/merge.js
var MULTI_SESSION_FAMILIES = /* @__PURE__ */ new Set(["csp", "ruankao", "cet4", "cet6", "ncre", "nisp", "yuwang-cup", "yangcheng-cup", "ctf", "xctf", "hw-ict"]);
var NODE_WEIGHT = { registration_deadline: 5, competition: 4, exam: 4, submission: 3, registration: 2, result: 1, other: 0 };
function itemFamily(item = {}) {
  const { family, source } = itemAlias(item);
  if (source !== "auto" && family) return family;
  const key = `${item.title || ""}`.replace(/[（(].*?[）)]/g, "").replace(/\s+/g, "").toLowerCase();
  return `title:${key || item.id || ""}`;
}
function nodeKey(node = {}) {
  const { from, to } = nodeWindow(node);
  return `${node.type || "other"}:${from || ""}:${to || ""}`;
}
var CONFIDENCE_RANK = { official_confirmed: 3, pending_confirmation: 2, predicted: 1, unknown: 0 };
var rank = (value) => CONFIDENCE_RANK[value] || 0;
function sameOccurrence(a, b) {
  const windows = (item) => (item.nodes || []).map(nodeWindow).filter((win) => win.from && win.to);
  const left = windows(a);
  const right = windows(b);
  if (left.length && right.length) {
    return left.some((x) => right.some((y) => x.from.slice(0, 4) === y.from.slice(0, 4) && x.from <= y.to && y.from <= x.to));
  }
  if (!left.length && !right.length) {
    const short = (a.title || "").length <= (b.title || "").length ? a : b;
    const long = short === a ? b : a;
    const stripped = (short.title || "").replace(/[（(].*?[）)]/g, "").replace(/["“”'‘’「」]/g, "").trim();
    return !(short.nodes || []).some((node) => nodeWindow(node).from) && stripped.length > 1 && (long.title || "").includes(stripped);
  }
  return false;
}
function groupKey(family, item) {
  const stems = (item.nodes || []).map((node) => nodeWindow(node)).filter((win) => win.from).map((win) => win.from.slice(0, 4));
  if (MULTI_SESSION_FAMILIES.has(family)) return `${family}@${item.id}`;
  if (stems.length) return `${family}@${[...new Set(stems)].sort()[0]}`;
  return `${family}@none`;
}
function score(item = {}) {
  const filled = (item.nodes || []).filter((node) => nodeWindow(node).from);
  const weight = filled.reduce((sum, node) => sum + (NODE_WEIGHT[node.type] || 0), 0);
  const confidence = filled.reduce((sum, node) => sum + rank(node.confidence), 0);
  const bracket = /[（(]/.test(item.title || "") ? 0 : 1;
  return `${String(weight).padStart(4, "0")}.${String(confidence).padStart(4, "0")}.${bracket}`;
}
var compareScore = (a, b) => score(b).localeCompare(score(a)) || String(a.id).localeCompare(String(b.id));
function groupItems(items = []) {
  const buckets = /* @__PURE__ */ new Map();
  for (const item of items ?? []) {
    const family = item.category === "memo" ? `memo:${item.id}` : itemFamily(item);
    const list = buckets.get(family) || [];
    const hit = list.find((bucket) => bucket.cards.some((card) => sameOccurrence(card, item)));
    if (hit) {
      hit.cards.push(item);
      continue;
    }
    list.push({ key: groupKey(family, item), family, cards: [item] });
    buckets.set(family, list);
  }
  const groups = [];
  const duplicates = [];
  let auto = false;
  for (const [family, list] of buckets) {
    for (const bucket of list) {
      const cards = [...bucket.cards].sort(compareScore);
      const mergeable = cards.filter((card) => !card.demo && card.category !== "memo");
      if (mergeable.length > 1) {
        if (MULTI_SESSION_FAMILIES.has(family)) auto = true;
        else duplicates.push({ key: bucket.key, family, titles: cards.map((card) => card.title), ids: cards.map((card) => card.id) });
      }
      groups.push({ key: bucket.key, family, cards, primary: cards[0] });
    }
  }
  return { groups, duplicates, auto };
}
function mergeNodes(cards) {
  const seen = /* @__PURE__ */ new Map();
  for (const card of cards) {
    for (const node of card.nodes || []) {
      const key = nodeKey(node);
      const existing = seen.get(key);
      if (!existing || rank(node.confidence) > rank(existing.confidence) || !existing.note && node.note) seen.set(key, { ...node });
    }
  }
  return [...seen.values()].sort((a, b) => (nodeWindow(a).from || "9999").localeCompare(nodeWindow(b).from || "9999") || NODE_TYPES.indexOf(a.type) - NODE_TYPES.indexOf(b.type));
}
var mergeList = (cards, field) => [...new Set(cards.flatMap((card) => card[field] || []))];
function mergeCards(cards = []) {
  const sorted = [...cards].sort(compareScore);
  const primary = sorted[0];
  const nodes = mergeNodes(sorted);
  const nodeColor = [...nodes].sort((a, b) => (NODE_WEIGHT[b.type] || 0) - (NODE_WEIGHT[a.type] || 0))[0]?.color;
  const merged = {
    ...primary,
    nodes: nodes.map((node) => ({ ...node, color: node.color || nodeColor })),
    majors: mergeList(sorted, "majors"),
    years: mergeList(sorted, "years"),
    interests: mergeList(sorted, "interests"),
    regions: mergeList(sorted, "regions")
  };
  for (const field of ["description", "organizer", "eligibility", "sourceUrl", "verifiedAt", "imageUrl", "venue", "artist", "notes", "alias"]) {
    if (!merged[field]) merged[field] = sorted.find((card) => card[field])?.[field] || merged[field];
  }
  if (!merged.alias) delete merged.alias;
  return merged;
}
function resolveGroups(items = []) {
  const byId = new Map((items ?? []).map((item) => [item.id, item]));
  const members = /* @__PURE__ */ new Map();
  const roots = /* @__PURE__ */ new Map();
  const find = (id) => {
    const seen = /* @__PURE__ */ new Set();
    let current = id;
    while (byId.get(current)?.group && byId.has(byId.get(current).group) && !seen.has(current)) {
      seen.add(current);
      current = byId.get(current).group;
    }
    roots.set(id, current);
    return current;
  };
  for (const item of items ?? []) {
    const root = item.group ? find(item.id) : item.id;
    const list = members.get(root) || [];
    list.push(item);
    members.set(root, list);
  }
  return { members, primaryOf: find };
}
function assemble(cards, members) {
  const view = members && cards.length > 1 ? mergeCards(cards) : cards[0];
  return { view, cards, group: cards.length > 1 ? { primary: cards[0].id, members: cards.map((card) => card.id) } : null };
}
function buildViews(items = []) {
  const { members } = resolveGroups(items);
  const views = [];
  const viewById = /* @__PURE__ */ new Map();
  const cardsOf = /* @__PURE__ */ new Map();
  const groups = [];
  for (const [root, memberCards] of members) {
    if (memberCards.length > 1) {
      const cards = [...memberCards].sort(compareScore);
      const { view, group } = assemble(cards, true);
      views.push(view);
      cardsOf.set(view, cards);
      groups.push(group);
      for (const card of cards) viewById.set(card.id, view);
    }
  }
  const inGroup = new Set(views.flatMap((view) => cardsOf.get(view).map((card) => card.id)));
  const { groups: autoGroups } = groupItems((items ?? []).filter((item) => !inGroup.has(item.id)));
  for (const auto of autoGroups) {
    const cards = [...auto.cards].sort(compareScore);
    const { view } = assemble(cards, false);
    if (!view) continue;
    views.push(view);
    cardsOf.set(view, cards);
    groups.push(auto);
    for (const card of cards) viewById.set(card.id, view);
  }
  return { views, viewById, cardsOf, groups };
}

// src/domain/timeline.js
var DAY = 864e5;
function timelineEntries(items = []) {
  return (items ?? []).map((item) => {
    const nodes = item.nodes ?? [];
    const dated = nodes.map((node) => ({ node, window: nodeWindow(node) })).filter((entry) => entry.window.precision !== "unknown").sort((a, b) => a.window.from.localeCompare(b.window.from));
    if (dated.length) {
      const { node, window: window2 } = dated[0];
      return { item, node, key: window2.from, kind: "dated", precision: window2.precision, window: window2, label: confidenceLabel(item, node).label };
    }
    const hint = nodes.map((node) => expectedHint(node.note)).find(Boolean);
    const labels = [...new Set(nodes.map((node) => confidenceLabel(item, node).label))];
    return {
      item,
      node: nodes[0] || null,
      key: hint ? hint.key : "9999-12-31",
      kind: hint ? "expected" : "unknown",
      precision: "unknown",
      window: null,
      label: labels.join("/") || "日期未知",
      expected: hint ? hint.text : ""
    };
  });
}
function expectedHint(note) {
  const text2 = String(note ?? "");
  if (!text2) return null;
  const year = Number((text2.match(/(20\d{2})\s*年/) || [])[1]) || null;
  const semesters = [[/上半年|春季|3\s*月|4\s*月|5\s*月|6\s*月/, 3], [/下半年|秋季|9\s*月|10\s*月|11\s*月|12\s*月/, 9]];
  const semester = semesters.find(([re]) => re.test(text2));
  if (!semester && !year) return null;
  const base = year || (/* @__PURE__ */ new Date()).getFullYear();
  const month = semester ? semester[1] : 6;
  const key = `${base}-${String(month).padStart(2, "0")}-01`;
  return { key, text: text2 };
}
function monthWindow(month = /* @__PURE__ */ new Date()) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - (first.getDay() + 6) % 7);
  const days = Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  return {
    start: isoDate(days[0]),
    end: isoDate(days[41]),
    days: days.map((date) => ({ date, key: isoDate(date), inMonth: date.getMonth() === month.getMonth() }))
  };
}
function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function todayIso(now = /* @__PURE__ */ new Date()) {
  return isoDate(now);
}
function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);
}
function monthChips(rows = []) {
  const byItem = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const key = row.item.id;
    const current = byItem.get(key);
    if (!current) {
      byItem.set(key, row);
      continue;
    }
    const weight = (row2) => (row2.edge === "end" ? 20 : 0) + ({ registration_deadline: 4, competition: 3, exam: 3, submission: 2 }[row2.node?.type] || 1);
    if (weight(row) > weight(current)) byItem.set(key, row);
  }
  return [...byItem.values()].sort((a, b) => (b.edge === "end" ? 1 : 0) - (a.edge === "end" ? 1 : 0));
}
function itemMarks(item, { start, end, today } = {}) {
  const bars = [];
  const spans = [];
  for (const node of item.nodes ?? []) {
    const { precision, from, to } = nodeWindow(node);
    if (precision === "unknown" || !from || !to) continue;
    if (precision === "year") continue;
    if (start && to < start) continue;
    if (end && from > end) continue;
    const inWindow = (value) => (!start || value >= start) && (!end || value <= end);
    const days = Math.min(daysBetween(from, to) + 1, 366);
    if (days <= 1) {
      if (!inWindow(from)) continue;
      bars.push({ node, date: from, precision, edge: from === to ? null : "start", offset: today ? daysBetween(today, from) : null });
      continue;
    }
    spans.push({ node, from, to, precision, clippedFrom: start && from < start ? start : from, clippedTo: end && to > end ? end : to });
    if (inWindow(from)) bars.push({ node, date: from, precision, edge: "start", offset: today ? daysBetween(today, from) : null });
    if (to !== from && inWindow(to)) bars.push({ node, date: to, precision, edge: "end", offset: today ? daysBetween(today, to) : null });
  }
  return { bars, spans };
}
function dateCoverage(items = []) {
  const rows = (items ?? []).filter((item) => !item.demo);
  const dated = rows.filter((item) => (item.nodes ?? []).some((node) => nodePrecision(node) !== "unknown"));
  const total = rows.length;
  return { total, dated: dated.length, undated: total - dated.length, percent: total ? Math.round(dated.length / total * 100) : 0 };
}
function nextMark(entry, today) {
  const { bars } = itemMarks(entry.item, { today });
  const future = bars.filter((bar) => bar.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  return future[0] || null;
}

// src/client.js
var h2 = import_react2.default.createElement;
var API = "/campus-calendar";
var NODE_LABELS = { registration: "报名开始", registration_deadline: "报名截止", competition: "比赛日期", exam: "考试日期", submission: "材料提交", result: "结果公布", other: "其他节点" };
var REGISTRATION_LABELS = { open: "报名中", not_open: "尚未开放", closed: "已截止", unknown: "未知" };
var LEVEL_LABELS = { 1: "一般", 2: "准备", 3: "重要", 4: "截止" };
var LEVEL_HINTS = { 1: "知道就行", 2: "要开始准备", 3: "必须到场或提交", 4: "过了就没了" };
var WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
var MODES = [["month", "月历"], ["year", "全年"], ["upcoming", "时间轴"], ["list", "列表"]];
var majors = ["计算机科学", "软件工程", "电子信息", "机械工程", "自动化", "经济学", "管理学", "会计学", "法学", "英语", "医学", "设计学"];
var provinces = ["北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆"];
var directions = ["创新创业", "学术科研", "程序设计", "职业发展", "志愿服务", "艺术设计", "语言能力", "综合素质"];
function dateText(value) {
  return value ? `${Number(value.slice(5, 7))}月${Number(value.slice(8, 10))}日` : "日期未知";
}
function floatingWhen(node, kind) {
  const from = node.start || "";
  if (!from) return "日期未知";
  if (kind === "year") return "全年滚动";
  if (kind === "span" && node.end) {
    const sameYear2 = from.slice(0, 4) === node.end.slice(0, 4);
    const sameMonth = sameYear2 && from.slice(5, 7) === node.end.slice(5, 7);
    if (sameMonth) return `${Number(from.slice(5, 7))}月`;
    const left = `${sameYear2 ? "" : `${from.slice(0, 4)}年`}${Number(from.slice(5, 7))}月`;
    return `${left}—${Number(node.end.slice(5, 7))}月`;
  }
  return `${Number(from.slice(5, 7))}月`;
}
function autoLevel(node, edge) {
  const base = { registration_deadline: 4, competition: 3, exam: 3, submission: 2 }[node?.type] || (node?.type === "registration" ? 2 : 1);
  if (edge === "end" && (node?.type === "registration" || node?.type === "registration_deadline" || node?.type === "submission")) return 4;
  return base;
}
function nodeLevel(node, edge) {
  return node?.level || autoLevel(node, edge);
}
function monthTitle(date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}
function nodeDate(node) {
  return node.start || node.end || null;
}
function firstWindowText(item) {
  const nodes = (item.nodes || []).filter((node) => nodePrecision(node) !== "unknown");
  if (!nodes.length) return "日期未知";
  const earliest = [...nodes].sort((a, b) => (nodeWindow(a).from || "").localeCompare(nodeWindow(b).from || ""))[0];
  return windowText(earliest);
}
function sameYear(value) {
  return value.slice(0, 4) === todayIso().slice(0, 4);
}
function windowText(node) {
  const precision = nodePrecision(node);
  if (precision === "unknown") return "日期未知";
  const start = node.start || node.end;
  const yearPrefix = sameYear(start) ? "" : `${start.slice(0, 4)} 年 `;
  const coarseNote = node.confidence === "official_confirmed" ? "" : "（预计）";
  if (precision === "month") return `${yearPrefix}${Number(start.slice(5, 7))} 月${coarseNote}`;
  if (precision === "year") return `${start.slice(0, 4)} 年${coarseNote}`;
  if (precision === "range") return `${yearPrefix}${dateText(start)} – ${dateText(node.end || start)}`;
  return `${yearPrefix}${dateText(start)}`;
}
function nodeRangeText(node) {
  return windowText(node);
}
function dayDistance(today, date) {
  return daysBetween(today, date);
}
function distanceText(offset) {
  if (offset === null || offset === void 0) return "";
  if (offset === 0) return "今天";
  if (offset === 1) return "明天";
  if (offset === 2) return "后天";
  if (offset < 0) return `已过 ${-offset} 天`;
  if (offset <= 30) return `${offset} 天后`;
  if (offset <= 120) return `约 ${Math.round(offset / 7)} 周后`;
  return `约 ${Math.round(offset / 30)} 个月后`;
}
function whenText(entry, next, { distance = true, expectedStyle = "row" } = {}) {
  if (entry.kind === "dated") {
    const text2 = windowText(entry.node || {});
    return next && distance ? `${text2} · ${distanceText(next.offset)}` : text2;
  }
  if (entry.kind === "expected") {
    const title = monthTitle(/* @__PURE__ */ new Date(`${entry.key}T00:00:00`));
    return expectedStyle === "timeline" ? `${title}前后（预计）` : `预计 ${title}`;
  }
  return expectedStyle === "timeline" ? "日期待公布" : "日期未知";
}
function api(path, options = {}) {
  return fetch(`${API}/${path}`, options).then(async (response) => {
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload.error || `请求失败 (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return response.headers.get("content-type")?.includes("text/calendar") ? response.blob() : response.json();
  });
}
function loadErrorMessage(error) {
  if (error?.status === 404) return "宿主没有找到这个插件的接口：多半是 DSH 还在跑旧进程，重启 dsh web 后就好。";
  if (error?.status === 401 || error?.status === 403) return "没有权限读取日历数据，请确认已登录 DSH。";
  return error?.message || "读取日历失败";
}
function saveBlob(blob, name) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
}
function monthCells(date) {
  return monthWindow(date).days.map((day) => day.date);
}
function yearMonthCells(year, month) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= days; day++) cells.push(new Date(year, month, day));
  return cells;
}
function stored(key, allowed) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : "";
  } catch {
    return "";
  }
}
var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function useDialogFocus(active = true) {
  const ref = import_react2.default.useRef(null);
  const previous = import_react2.default.useRef(null);
  import_react2.default.useEffect(() => {
    const node = active ? ref.current : null;
    if (!node) return;
    previous.current = typeof document !== "undefined" ? document.activeElement : null;
    const list = () => [...node.querySelectorAll(FOCUSABLE)].filter((element) => element.getClientRects().length > 0);
    const first = list()[0];
    if (first) first.focus();
    else node.focus();
    const onKey = (event) => {
      if (event.key !== "Tab") return;
      const items = list();
      if (!items.length) return;
      const head = items[0];
      const tail = items[items.length - 1];
      const inside = node.contains(document.activeElement);
      if (event.shiftKey && (!inside || document.activeElement === head)) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && (!inside || document.activeElement === tail)) {
        event.preventDefault();
        head.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      const back = previous.current;
      if (back && typeof back.focus === "function" && document.contains(back)) back.focus();
    };
  }, [active]);
  return ref;
}
function clampY(element) {
  const rect = typeof element?.getBoundingClientRect === "function" ? element.getBoundingClientRect() : null;
  const top = rect ? rect.top + (rect.height || 0) / 2 : 200;
  const height = typeof window !== "undefined" ? window.innerHeight || 760 : 760;
  return Math.max(12, Math.min(top, height - 220));
}
function shortName(item) {
  return itemAlias(item).alias || (item.title || "").trim().slice(0, 6) || "未命名";
}
function cardNote(item, cardsOf) {
  const cards = cardsOf?.get(item);
  return cards && cards.length > 1 ? `合并了 ${cards.length} 条记录 · 共 ${(item.nodes || []).length} 个节点` : "";
}
function Icon({ name }) {
  const paths = { calendar: "M7 2v4m10-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z", star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z", edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z", plus: "M12 5v14M5 12h14", back: "M19 12H5m7 7-7-7 7-7", forward: "M5 12h14m-7-7 7 7-7 7", close: "M18 6 6 18M6 6l12 12", today: "M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" };
  return h2("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, h2("path", { d: paths[name] || paths.calendar }));
}
function Thumb({ item, size = "card" }) {
  const [broken, setBroken] = import_react2.default.useState(false);
  const color = tagColor(item);
  import_react2.default.useEffect(() => {
    setBroken(false);
  }, [item.id, item.imageUrl]);
  if (!item.imageUrl || broken) {
    return h2("div", { className: `cc-thumb placeholder ${size}`, "data-color": color, "aria-hidden": true }, h2("span", null, (item.title || "?").trim().slice(0, 1)));
  }
  return h2("img", { className: `cc-thumb ${size}`, src: item.imageUrl, alt: `${item.title} 宣传图`, loading: "lazy", referrerPolicy: "no-referrer", onError: () => setBroken(true) });
}
function App({ onAsk }) {
  const [state, setState] = import_react2.default.useState(null);
  const [error, setError] = import_react2.default.useState("");
  const [loading, setLoading] = import_react2.default.useState(true);
  const [view, setView] = import_react2.default.useState(() => stored("cc-view", ["calendar", "favorites", "manage"]) || "calendar");
  const [mode, setMode] = import_react2.default.useState(() => stored("cc-mode", MODES.map(([value]) => value)) || "month");
  import_react2.default.useEffect(() => {
    try {
      localStorage.setItem("cc-view", view);
    } catch {
    }
  }, [view]);
  import_react2.default.useEffect(() => {
    try {
      localStorage.setItem("cc-mode", mode);
    } catch {
    }
  }, [mode]);
  const [density, setDensity] = import_react2.default.useState(() => {
    try {
      return localStorage.getItem("cc-density") || "cozy";
    } catch {
      return "cozy";
    }
  });
  import_react2.default.useEffect(() => {
    try {
      localStorage.setItem("cc-density", density);
    } catch {
    }
  }, [density]);
  const [month, setMonth] = import_react2.default.useState(() => {
    const hit = typeof location !== "undefined" && /[?&]month=(\d{4})-(\d{2})/.exec(location.search || "");
    if (hit) {
      const date = new Date(Number(hit[1]), Number(hit[2]) - 1, 1);
      if (!Number.isNaN(date.getTime())) return date;
    }
    const saved = typeof localStorage !== "undefined" && /^(\d{4})-(\d{2})$/.exec(stored("cc-month") || "");
    if (saved) {
      const date = new Date(Number(saved[1]), Number(saved[2]) - 1, 1);
      if (!Number.isNaN(date.getTime())) return date;
    }
    return /* @__PURE__ */ new Date();
  });
  import_react2.default.useEffect(() => {
    try {
      localStorage.setItem("cc-month", `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`);
    } catch {
    }
  }, [month]);
  const [selectedDate, setSelectedDate] = import_react2.default.useState("");
  const [selected, setSelected] = import_react2.default.useState(null);
  const [filters, setFilters] = import_react2.default.useState({ query: "", category: "all", major: "all", province: "all", status: "all", from: "", to: "", onlySuitable: false });
  const [showFilters, setShowFilters] = import_react2.default.useState(false);
  const [showTools, setShowTools] = import_react2.default.useState(false);
  const [editing, setEditing] = import_react2.default.useState(null);
  const [busy, setBusy] = import_react2.default.useState(false);
  const [notice, setNotice] = import_react2.default.useState("");
  const [asking, setAsking] = import_react2.default.useState(false);
  const [askError, setAskError] = import_react2.default.useState("");
  const [suggestions, setSuggestions] = import_react2.default.useState([]);
  const [hover, setHover] = import_react2.default.useState(null);
  const [memoDraft, setMemoDraft] = import_react2.default.useState(null);
  const [eventDraft, setEventDraft] = import_react2.default.useState(null);
  const [duplicates, setDuplicates] = import_react2.default.useState([]);
  const importRef = import_react2.default.useRef(null);
  const noticeTimerRef = import_react2.default.useRef(null);
  const memoDialogRef = useDialogFocus(Boolean(memoDraft));
  const notify = import_react2.default.useCallback((message) => {
    setNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    if (!message) return;
    noticeTimerRef.current = setTimeout(() => setNotice(""), 4500);
  }, []);
  import_react2.default.useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);
  const [undo, setUndo] = import_react2.default.useState(null);
  const undoTimerRef = import_react2.default.useRef(null);
  const offerUndo = import_react2.default.useCallback((message, restore) => {
    setUndo({ message, restore });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndo(null), 8e3);
  }, []);
  const dismissUndo = import_react2.default.useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndo(null);
  }, []);
  import_react2.default.useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);
  const requestRef = import_react2.default.useRef({ generation: 0, controller: null });
  const lastFocusRefreshRef = import_react2.default.useRef(0);
  const editorRef = import_react2.default.useRef(null);
  const load = import_react2.default.useCallback(async ({ background = false } = {}) => {
    const generation = ++requestRef.current.generation;
    requestRef.current.controller?.abort();
    const controller = new AbortController();
    requestRef.current.controller = controller;
    if (!background) setLoading(true);
    setError("");
    try {
      const next = await api("state", { signal: controller.signal });
      if (generation === requestRef.current.generation && !controller.signal.aborted) setState(next);
    } catch (e) {
      if (!controller.signal.aborted && generation === requestRef.current.generation) setError(loadErrorMessage(e));
    } finally {
      if (generation === requestRef.current.generation && !controller.signal.aborted) setLoading(false);
    }
  }, []);
  import_react2.default.useEffect(() => {
    load();
    const request = requestRef.current;
    return () => request.controller?.abort();
  }, [load]);
  const editingRef = import_react2.default.useRef(editing);
  editingRef.current = editing;
  import_react2.default.useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "hidden" || editingRef.current || Date.now() - lastFocusRefreshRef.current < 3e4) return;
      lastFocusRefreshRef.current = Date.now();
      load({ background: true });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);
  import_react2.default.useEffect(() => {
    if (!selected) return;
    const onKey = (event) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);
  const profile = state?.profile || { major: "", year: "", province: "", interests: [], types: [] };
  const items = state?.items || [];
  const { views, viewById, cardsOf } = import_react2.default.useMemo(() => buildViews(items), [items]);
  const filtersKey = JSON.stringify(filters);
  const filtered = import_react2.default.useMemo(() => filterItems(views, filters, profile), [views, profile, filtersKey]);
  const favoritesKey = (state?.favorites || []).join("\0");
  const visible = import_react2.default.useMemo(() => {
    if (view !== "favorites") return filtered;
    const favorites = new Set(state?.favorites || []);
    return filtered.filter((entry) => cardsOf.get(entry)?.some((card) => favorites.has(card.id)) || favorites.has(entry.id));
  }, [filtered, view, favoritesKey, cardsOf]);
  const viewKey = import_react2.default.useMemo(() => visible.map((entry) => `${entry.id}#${(entry.nodes || []).map((node) => `${node.id}:${node.start}:${node.end}:${node.level || ""}`).join(",")}`).join("\0"), [visible]);
  const monthIndex = import_react2.default.useMemo(() => buildMonthIndex(visible, month), [viewKey, month.getFullYear(), month.getMonth()]);
  const today = todayIso();
  const eventsForDate = (date) => {
    const indexed = monthIndex.get(date) || [];
    const itemsById = new Map(indexed.map((row) => [row.item.id, row.item]));
    for (const item of visible) {
      if (item.category === "memo" && item.nodes?.some((node) => node.start === date)) itemsById.set(item.id, item);
    }
    return [...itemsById.values()];
  };
  const saveState = async (next) => {
    setBusy(true);
    setError("");
    try {
      setState(await api("state", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(next) }));
      notify("已保存");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const patchProfile = (patch) => saveState({ ...state, profile: { ...profile, ...patch } });
  const saveItem = async (item) => {
    setBusy(true);
    setError("");
    try {
      const next = await api(`items${item.id ? `/${encodeURIComponent(item.id)}` : ""}`, { method: item.id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ item }) });
      setState(next);
      setEditing(null);
      notify("事项已保存");
      maybeRemindStar();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const openCalendarEvent = (date) => {
    setSelectedDate(date);
    setError("");
    setEventDraft({ date, title: "", category: "competition", type: "competition", level: 2, description: "" });
  };
  const saveCalendarEvent = async (event) => {
    event.preventDefault();
    if (!eventDraft?.title?.trim()) return setError("请填写赛事或考试名称");
    const type = eventDraft.type;
    const item = {
      title: eventDraft.title.trim(),
      category: type === "exam" ? "certificate" : "competition",
      organizer: "",
      description: eventDraft.description.trim(),
      majors: [],
      interests: [],
      years: [],
      regions: [],
      registrationStatus: "unknown",
      nodes: [{ id: `node-${crypto.randomUUID()}`, type, start: eventDraft.date, end: null, accuracy: "exact", confidence: "pending_confirmation", note: "由用户在日历中手动添加；日期尚无官方来源核验。" }]
    };
    await saveItem(item);
    setEventDraft(null);
  };
  const saveMemo = async () => {
    if (!memoDraft?.title?.trim()) {
      setError("请填写备忘标题");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const body = { date: memoDraft.date, title: memoDraft.title, description: memoDraft.description, level: Number(memoDraft.level) };
      const next = await api(`memos${memoDraft.id ? `/${encodeURIComponent(memoDraft.id)}` : ""}`, { method: memoDraft.id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      setState(next);
      setMemoDraft(null);
      notify("备忘已保存");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const deleteMemo = async (memo) => {
    if (!window.confirm(`删除备忘“${memo.title}”？`)) return;
    setBusy(true);
    setError("");
    try {
      const next = await api(`memos/${encodeURIComponent(memo.id)}`, { method: "DELETE" });
      setState(next);
      setMemoDraft(null);
      notify("备忘已删除");
      const node = memo.nodes?.[0] || {};
      offerUndo(`已删除备忘「${memo.title}」`, async () => {
        setState(await api("memos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ date: node.start, title: memo.title, description: memo.description || "", level: memo.memoLevel || 1 }) }));
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const toggleFavorite = async (item) => {
    const favorites = state.favorites.includes(item.id) ? state.favorites.filter((id) => id !== item.id) : [...state.favorites, item.id];
    await saveState({ ...state, favorites });
  };
  const toggleReminder = async (item) => {
    if (!item.nodes?.some((node) => nodeDate(node))) return notify("该事项没有已知日期，暂不能设置提醒");
    const on = !state.reminders.includes(item.id);
    const reminders = on ? [...state.reminders, item.id] : state.reminders.filter((id) => id !== item.id);
    await saveState({ ...state, reminders });
    notify(on ? "已加入提醒：打开日历时，7 天内到期的会排在日历上方" : "已取消这项提醒");
  };
  const exportFile = async (type) => {
    try {
      const data = await api(`export.${type}`);
      const blob = type === "json" ? new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }) : data;
      saveBlob(blob, `campus-events-calendar.${type}`);
    } catch (e) {
      setError(e.message);
    }
  };
  const importFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError("导入文件不能超过 2 MB");
    if (!window.confirm("导入将替换当前事项和档案。建议先导出现有 JSON 备份。继续吗？")) return;
    try {
      const parsed = JSON.parse(await file.text());
      const { backup, ...next } = await api("import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed) });
      setState(next);
      const name = String(backup || "").split(/[\\/]/).pop();
      notify(name ? `JSON 导入完成，原数据已备份为 ${name}` : "JSON 导入完成");
    } catch (e) {
      setError(e.message);
    }
  };
  const clearFilters = () => setFilters({ query: "", category: "all", major: "all", province: "all", status: "all", from: "", to: "", onlySuitable: false });
  const refreshDuplicates = import_react2.default.useCallback(() => {
    fetch(`${API}/duplicates`, { headers: { accept: "application/json" } }).then((response) => response.ok ? response.json() : { duplicates: [] }).then((next) => setDuplicates(Array.isArray(next?.duplicates) ? next.duplicates : [])).catch(() => setDuplicates([]));
  }, []);
  const itemsKey = import_react2.default.useMemo(() => items.map((item) => item.id).sort().join("|"), [items]);
  import_react2.default.useEffect(() => {
    if (items.length) refreshDuplicates();
  }, [itemsKey, refreshDuplicates]);
  const mergeDuplicates = async (keys) => {
    const list2 = keys ? duplicates.filter((plan) => keys.includes(plan.key)) : duplicates;
    if (!list2.length) return;
    const nodes = list2.reduce((sum, plan) => sum + (plan.ids?.length || 0), 0);
    if (!window.confirm(`把 ${list2.length} 组、共 ${nodes} 条重复记录合并成 ${list2.length} 条？
合并前会自动备份当前 JSON，不会丢数据。`)) return;
    setBusy(true);
    setError("");
    try {
      const next = await api("duplicates/merge", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ keys: keys || void 0 }) });
      setState(next.state);
      setDuplicates([]);
      notify(`已合并 ${next.merged?.length || 0} 组重复记录${next.backup ? "，原文件已备份" : ""}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const setLevel = async (item, nodeId, level) => {
    setBusy(true);
    setError("");
    try {
      let next;
      try {
        next = await api("items/level", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id, nodeId, level }) });
      } catch (direct) {
        const patch = { ...item, nodes: (item.nodes || []).map((node) => {
          if (nodeId && node.id !== nodeId) return node;
          if (level === null) {
            const { level: _drop, ...rest } = node;
            return rest;
          }
          return { ...node, level };
        }) };
        next = await api(`items/${encodeURIComponent(item.id)}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ item: patch }) }).catch(() => {
          throw direct;
        });
      }
      setState(next);
      setSelected((current) => current ? next.items.find((entry) => entry.id === current.id) || current : current);
      notify(level ? `已标记为「${LEVEL_LABELS[level]}」` : "已恢复自动等级");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const ungroup = async (item) => {
    setBusy(true);
    setError("");
    try {
      setState(await api("items/unlink", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id }) }));
      setSelected(null);
      notify("已拆开这一组记录");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  import_react2.default.useEffect(() => {
    if (!state) return;
    let alive = true;
    api("suggestions").then((next) => {
      if (alive && Array.isArray(next?.items)) setSuggestions(next.items);
    }).catch(() => {
      if (alive) setSuggestions([]);
    });
    return () => {
      alive = false;
    };
  }, [state]);
  const hasRealItems = import_react2.default.useMemo(() => items.some((item) => !item.demo), [items]);
  const coverage = import_react2.default.useMemo(() => dateCoverage(items), [items]);
  const coverageHint = view === "calendar" && showTools && coverage.undated > 0 ? h2(
    "div",
    { className: "cc-coverage-hint", role: "status" },
    h2(
      "div",
      null,
      h2("strong", null, `还有 ${coverage.undated} 项没有时间锚点`),
      h2("p", null, `共 ${coverage.total} 项，已锚定 ${coverage.percent}%。只到月份或年份的不算锚定：让 Agent 去官网查确切日期，查不到就如实留空。`)
    ),
    h2("button", { type: "button", className: "cc-button", disabled: asking, onClick: () => askAgent("plan") }, asking ? "正在准备…" : "让 Agent 补时间")
  ) : null;
  const askAgent = async (kind = "add", text2 = "") => {
    if (asking) return;
    if (!onAsk) {
      setAskError("当前 DSH 版本没有提供开新对话的接口，无法一键发起。");
      return;
    }
    setAsking(true);
    setAskError("");
    try {
      const draft = await api(`draft?kind=${encodeURIComponent(kind)}&text=${encodeURIComponent(text2)}`);
      await onAsk(draft.prompt);
      notify("已在新对话里填好草稿，补充内容后发送即可");
    } catch (e) {
      setAskError(`没能开新对话：${e.message}`);
    } finally {
      setAsking(false);
    }
  };
  const reminderDue = import_react2.default.useMemo(() => {
    const today2 = todayIso();
    const wanted = new Set(state?.reminders || []);
    if (!wanted.size) return [];
    const rows = [];
    for (const entry of timelineEntries(items)) {
      if (!wanted.has(entry.item.id)) continue;
      const mark = nextMark(entry, today2);
      if (!mark) continue;
      const offset = daysBetween(today2, mark.date);
      if (offset > 7) continue;
      rows.push({ item: entry.item, mark, offset });
    }
    return rows.sort((a, b) => a.mark.date.localeCompare(b.mark.date));
  }, [items, (state?.reminders || []).join("\0"), todayIso()]);
  const navigation = h2("nav", { className: "cc-side-nav", "aria-label": "主导航" }, [
    ["calendar", "日历", "calendar"],
    ["favorites", "已收藏", "star"],
    ["manage", "数据维护", "edit"]
  ].map(([id, label, icon]) => h2(
    "button",
    { key: id, className: view === id ? "active" : "", onClick: () => setView(id), "aria-current": view === id ? "page" : void 0 },
    h2(Icon, { name: icon }),
    h2("span", null, label),
    // 提醒数挂在导航上：这是「我设的提醒真的有用」的唯一证据，藏在详情页里等于没做
    id === "calendar" && reminderDue.length ? h2("span", { className: "cc-nav-badge", "aria-label": `${reminderDue.length} 项即将到期` }, reminderDue.length) : null
  )));
  const headerTitle = view === "favorites" ? "已收藏事项" : view === "manage" ? "数据维护" : "赛事与证书日历";
  const profileSummary = profile.major ? `${profile.major}${profile.year ? ` · ${profile.year}` : ""}${profile.province ? ` · ${profile.province}` : ""}` : "尚未设置个人档案";
  const categorySelect = (label, value, options, key) => h2("label", { className: "cc-field compact", key }, h2("span", null, label), h2("select", { value, onChange: (event) => setFilters((current) => ({ ...current, [key]: event.target.value })) }, options.map(([v, name]) => h2("option", { key: v, value: v }, name))));
  const filterPanel = h2(
    "div",
    { className: `cc-filters ${showFilters ? "expanded" : ""}` },
    categorySelect("类别", filters.category, [["all", "全部类别"], ["competition", "赛事"], ["certificate", "证书"]], "category"),
    categorySelect("适配专业", filters.major, [["all", "全部专业"], ...majors.map((value) => [value, value]), ...profile.major && !majors.includes(profile.major) ? [[profile.major, profile.major]] : []], "major"),
    categorySelect("地区", filters.province, [["all", "全部地区"], ...provinces.map((value) => [value, value])], "province"),
    categorySelect("报名状态", filters.status, [["all", "全部状态"], ["open", "报名中"], ["not_open", "未开始"], ["closed", "已截止"], ["unknown", "未知"]], "status"),
    h2("label", { className: "cc-field compact", key: "from" }, h2("span", null, "开始日期"), h2("input", { type: "date", value: filters.from, onChange: (event) => setFilters((current) => ({ ...current, from: event.target.value })) })),
    h2("label", { className: "cc-field compact", key: "to" }, h2("span", null, "结束日期"), h2("input", { type: "date", value: filters.to, onChange: (event) => setFilters((current) => ({ ...current, to: event.target.value })) }))
  );
  const toolbar = h2(
    "div",
    { className: "cc-toolbar" },
    h2("label", { className: "cc-search" }, h2("span", { className: "sr-only" }, "搜索赛事或证书"), h2("span", { "aria-hidden": true }, "⌕"), h2("input", { value: filters.query, placeholder: "搜索赛事、证书、主办方…", onChange: (event) => setFilters((current) => ({ ...current, query: event.target.value })) }), filters.query && h2("button", { type: "button", "aria-label": "清除搜索", onClick: () => setFilters((current) => ({ ...current, query: "" })) }, h2(Icon, { name: "close" }))),
    h2("label", { className: "cc-toggle" }, h2("input", { type: "checkbox", checked: filters.onlySuitable, onChange: (event) => setFilters((current) => ({ ...current, onlySuitable: event.target.checked })) }), h2("span", null, "只看适合我")),
    h2("button", { className: "cc-button", onClick: () => setShowFilters(!showFilters), "aria-expanded": showFilters }, "筛选"),
    h2("div", { className: "cc-segment", role: "group", "aria-label": "视图模式" }, MODES.map(([value, label]) => h2("button", { key: value, className: mode === value ? "selected" : "", "aria-pressed": mode === value, onClick: () => setMode(value) }, label)))
  );
  const EDGE_LABELS = { registration: "起", registration_deadline: "止", competition: "起", exam: "起", submission: "起", result: "出" };
  const VISIBLE_CHIPS = 3;
  const eventChip = (item, node, edge = null) => {
    const confidence = confidenceLabel(item, node);
    const uncertain = node.confidence === "predicted" || node.confidence === "pending_confirmation";
    const edgeText = edge === "end" ? "截止" : edge === "start" ? "开始" : "";
    const alias = shortName(item);
    const stale = verificationState(item, /* @__PURE__ */ new Date(`${todayIso()}T00:00:00Z`)).state === "stale";
    return h2("button", {
      key: `${item.id}-${node.id}-${edge || "day"}`,
      className: `cc-chip ${uncertain ? "uncertain" : ""} ${item.demo ? "demo" : ""} ${edge || ""}`,
      "data-color": node.color || tagColor(item),
      "data-level": levelOf(node, edge),
      "data-node": node.type,
      "data-edge": edge || void 0,
      "data-stale": stale ? "true" : void 0,
      onClick: () => setSelected(item),
      onFocus: (event) => setHover({ item, node, x: 260, y: clampY(event.currentTarget) }),
      onBlur: () => setHover(null),
      title: `${item.title} · ${NODE_LABELS[node.type] || node.type}${edgeText ? `（${edgeText}）` : ""} · ${confidence.label}${stale ? " · 日期很久没核对了" : ""}`,
      "aria-label": `${item.title}，${NODE_LABELS[node.type] || node.type}，${nodeRangeText(node)}${edgeText ? `，${edgeText}` : ""}，${confidence.label}`
    }, h2("span", { className: "cc-chip-edge", "aria-hidden": true }), h2("span", { className: "cc-chip-text" }, alias));
  };
  const levelOf = (node, edge) => nodeLevel(node, edge);
  const dayLevel = (indexedNodes) => indexedNodes.reduce((level, row) => Math.max(level, levelOf(row.node, row.edge)), 0);
  const cells = import_react2.default.useMemo(() => monthCells(month), [month.getFullYear(), month.getMonth()]);
  const floating = import_react2.default.useMemo(() => monthFloating(visible, month), [viewKey, month.getFullYear(), month.getMonth()]);
  const floatingMain = floating.filter((row) => row.kind !== "year");
  const floatingRolling = floating.filter((row) => row.kind === "year");
  const floatingChip = ({ item, node, kind }) => h2(
    "button",
    {
      key: `${item.id}-${node.id}`,
      type: "button",
      className: `cc-floating-chip ${node.confidence === "predicted" || node.confidence === "pending_confirmation" ? "uncertain" : ""}`,
      "data-color": node.color || tagColor(item),
      "data-level": levelOf(node, null),
      "data-kind": kind,
      title: `${item.title} · ${NODE_LABELS[node.type] || node.type} · ${floatingWhen(node, kind)} · ${confidenceLabel(item, node).label}`,
      onClick: () => setSelected(item)
    },
    h2("span", { className: "cc-chip-edge", "aria-hidden": true }),
    h2("span", { className: "cc-floating-text" }, shortName(item)),
    kind === "year" ? null : h2("span", { className: "cc-floating-when" }, floatingWhen(node, kind)),
    h2("span", { className: "cc-floating-type" }, NODE_LABELS[node.type] || node.type)
  );
  const floatingBand = floating.length ? h2(
    "div",
    { className: "cc-floating", "aria-label": "本月日期还没定准的事项" },
    floatingMain.length ? h2(
      "div",
      { className: "cc-floating-head" },
      h2("span", { className: "cc-floating-kicker" }, "还没落到某一天"),
      h2("span", { className: "cc-floating-hint" }, `这 ${floatingMain.length} 项只知道大致档期，点开可以补上具体日子`)
    ) : null,
    floatingMain.length ? h2("div", { className: "cc-floating-list" }, [...floatingMain].sort((a, b) => levelOf(b.node, null) - levelOf(a.node, null) || (a.node.start || "").localeCompare(b.node.start || "")).map(floatingChip)) : null,
    floatingRolling.length ? h2(
      "div",
      { className: "cc-floating-rolling" },
      h2("span", { className: "cc-floating-kicker" }, "全年滚动"),
      h2("span", { className: "cc-floating-hint" }, "这几项没有统一档期，随时能报，不占具体日子"),
      h2("div", { className: "cc-floating-list" }, floatingRolling.map(floatingChip))
    ) : null
  ) : null;
  const busyDays = import_react2.default.useMemo(() => {
    let count = 0;
    for (const date of cells) if ((monthIndex.get(isoDate(date)) || []).length) count += 1;
    return count;
  }, [cells, monthIndex]);
  const calendar = import_react2.default.useMemo(() => h2(
    "section",
    { className: "cc-calendar", "aria-label": monthTitle(month) },
    // 整月没有任何确定日期的安排时，别让人对着一片空白发懵 —— 说清楚是「没排」还是「还没定日子」。
    // 把模糊档期挤进格子会造出假日期，那才是更糟的。放在网格上面，否则网格比屏幕还高，看不到。
    busyDays === 0 && h2("p", { className: "cc-grid-empty" }, floating.length ? `这个月还没有落到某一天的安排。上面 ${floating.length} 项只有大致档期，点开可以补上具体日子。` : "这个月没有安排。"),
    h2("div", { className: "cc-calendar-legend", "aria-label": "日历等级" }, [["1", "一般"], ["2", "准备"], ["3", "重要"], ["4", "截止"]].map(([level, label]) => h2("span", { key: level, "data-level": level }, label))),
    h2("div", { className: "cc-weekdays" }, WEEKDAYS.map((name, index) => h2("span", { key: name, className: index > 4 ? "weekend" : "" }, name))),
    h2("div", { className: "cc-grid", role: "group", "aria-label": `${monthTitle(month)}，共 ${cells.length} 天` }, cells.map((date) => {
      const iso = isoDate(date);
      const indexedNodes = monthIndex.get(iso) || [];
      const chips = monthChips(indexedNodes);
      const isToday = iso === today;
      const level = dayLevel(indexedNodes);
      return h2(
        "div",
        { key: iso, className: `cc-day ${date.getMonth() !== month.getMonth() ? "outside" : ""} ${selectedDate === iso ? "chosen" : ""} ${isToday ? "today" : ""} ${chips.length ? "has-events" : ""}`, "data-level": level || void 0, "data-count": chips.length || void 0 },
        h2("button", { className: "cc-day-number", onClick: () => {
          setSelectedDate(iso);
          setMemoDraft(null);
          setEventDraft(null);
        }, "aria-pressed": selectedDate === iso, "aria-label": `${iso}，${chips.length} 项` }, date.getDate()),
        // 42 个格子各挂一个「+」，鼠标悬停才浮现；让它们留在 Tab 序列里会让键盘用户按 42 次才能离开月历。
        // 键盘路径是：Tab 到日期按钮 → 选中某天 → 侧栏顶部就有「新增」（openCalendarEvent）。
        h2("button", { type: "button", className: "cc-day-add", tabIndex: -1, "aria-hidden": true, "data-date": iso, onClick: () => openCalendarEvent(iso) }, h2(Icon, { name: "plus" })),
        h2("div", { className: "cc-day-events" }, chips.slice(0, VISIBLE_CHIPS).map(({ item, node, edge }) => eventChip(item, node, edge)), chips.length > VISIBLE_CHIPS ? h2("button", { type: "button", className: "cc-more", onClick: () => {
          setSelectedDate(iso);
          setSelected(null);
        }, "aria-label": `${iso} 共 ${chips.length} 项，展开侧栏` }, `+${chips.length - VISIBLE_CHIPS}`) : null)
      );
    }))
  ), [cells, monthIndex, month, selectedDate, today, floating, busyDays]);
  const sortedItems = import_react2.default.useMemo(() => timelineEntries(visible).sort((a, b) => a.key.localeCompare(b.key) || (a.item.title || "").localeCompare(b.item.title || "", "zh-CN")), [visible]);
  const agendaItems = selectedDate ? eventsForDate(selectedDate) : sortedItems.map((entry) => entry.item);
  const eventForm = eventDraft && h2(
    "form",
    { className: "cc-event-form", onSubmit: saveCalendarEvent },
    h2("div", { className: "cc-event-form-head" }, h2("strong", null, "新增赛事 / 考试事项"), h2("button", { type: "button", className: "text-button", onClick: () => setEventDraft(null), "aria-label": "关闭新增事项" }, "×")),
    h2("label", null, h2("span", null, "日期"), h2("input", { type: "date", value: eventDraft.date, required: true, onChange: (event) => setEventDraft({ ...eventDraft, date: event.target.value }) })),
    h2("label", null, h2("span", null, "事项名称"), h2("input", { type: "text", name: "title", value: eventDraft.title, maxLength: 200, required: true, placeholder: "例如：蓝桥杯省赛", onChange: (event) => setEventDraft({ ...eventDraft, title: event.target.value }) })),
    h2("label", null, h2("span", null, "节点类型"), h2("select", { name: "type", value: eventDraft.type, onChange: (event) => setEventDraft({ ...eventDraft, type: event.target.value }) }, Object.entries(NODE_LABELS).filter(([type]) => !["other", "registration"].includes(type)).map(([type, label]) => h2("option", { key: type, value: type }, label)))),
    h2("label", null, h2("span", null, "重要等级"), h2("select", { value: eventDraft.level, onChange: (event) => setEventDraft({ ...eventDraft, level: Number(event.target.value) }) }, [["1", "一般"], ["2", "准备"], ["3", "重要"], ["4", "截止"]].map(([value, label]) => h2("option", { key: value, value: Number(value) }, label)))),
    h2("label", { className: "cc-event-description" }, h2("span", null, "简短说明"), h2("textarea", { rows: 2, maxLength: 500, value: eventDraft.description, placeholder: "可选，限 500 字", onChange: (event) => setEventDraft({ ...eventDraft, description: event.target.value }) })),
    error && h2("p", { className: "cc-inline-error", role: "alert" }, error),
    h2("div", { className: "cc-event-form-actions" }, h2("button", { type: "button", className: "cc-button", onClick: () => setEventDraft(null) }, "取消"), h2("button", { type: "submit", className: "cc-button primary", disabled: busy }, busy ? "保存中…" : "保存事项"))
  );
  const agenda = import_react2.default.useMemo(() => h2(
    "aside",
    { className: "cc-agenda" },
    h2("div", { className: "cc-agenda-head" }, h2("div", null, !selectedDate && h2("span", { className: "cc-agenda-kicker" }, "优先处理"), h2("h2", null, selectedDate ? dateText(selectedDate) : "下一步")), selectedDate && h2("button", { className: "text-button", onClick: () => openCalendarEvent(selectedDate) }, "＋ 新增赛事/考试")),
    agendaItems.length ? h2("div", { className: "cc-agenda-list" }, agendaItems.slice(0, 12).map((item) => {
      const entry = sortedItems.find((row) => row.item.id === item.id);
      const next = entry ? nextMark(entry, today) : null;
      const label = entry ? entry.label : confidenceLabel(item, item.nodes?.[0] || {}).label;
      return h2(
        "div",
        { key: item.id, className: `cc-agenda-row ${item.category === "memo" ? "cc-agenda-memo" : ""}` },
        h2(
          "button",
          { type: "button", className: "cc-agenda-open", onClick: () => item.category === "memo" ? setMemoDraft({ id: item.id, date: item.nodes?.[0]?.start || selectedDate, title: item.title, description: item.description || "", level: item.memoLevel || 1 }) : setSelected(item) },
          h2("time", null, entry ? whenText(entry, next) : firstWindowText(item)),
          h2("span", { className: "cc-agenda-alias", "aria-hidden": true }, item.category === "memo" ? "备忘" : shortName(item)),
          h2("strong", null, item.title),
          cardNote(item, cardsOf) && h2("small", { className: "cc-agenda-note" }, cardNote(item, cardsOf)),
          h2("span", { className: `cc-confidence ${item.category === "memo" ? "memo" : item.demo ? "demo" : entry && entry.kind !== "dated" ? "uncertain" : ""}` }, item.category === "memo" ? "备忘" : label)
        ),
        item.category === "memo" && h2("button", { type: "button", className: "cc-memo-delete", "aria-label": `删除备忘 ${item.title}`, onClick: () => deleteMemo(item) }, "×")
      );
    })) : h2("div", { className: "cc-empty small" }, selectedDate ? "这一天没有事项。" : "目前没有待办事项。"),
    selectedDate && eventForm
  ), [agendaItems, selectedDate, sortedItems, today, eventDraft, busy, error]);
  const memoForm = memoDraft && h2(
    "form",
    { className: "cc-memo-form", onSubmit: (event) => {
      event.preventDefault();
      saveMemo();
    } },
    h2("div", { className: "cc-memo-form-head" }, h2("strong", null, memoDraft.id ? "编辑备忘" : "新增备忘"), h2("button", { type: "button", className: "text-button", onClick: () => setMemoDraft(null), "aria-label": "关闭备忘表单" }, "×")),
    h2("label", null, h2("span", null, "日期"), h2("input", { type: "date", value: memoDraft.date, onChange: (event) => setMemoDraft({ ...memoDraft, date: event.target.value }), required: true })),
    h2("label", null, h2("span", null, "标题"), h2("input", { type: "text", value: memoDraft.title, placeholder: "记下这一天要做的事", maxLength: 200, onChange: (event) => setMemoDraft({ ...memoDraft, title: event.target.value }), required: true })),
    h2("label", null, h2("span", null, "等级"), h2("select", { value: memoDraft.level, onChange: (event) => setMemoDraft({ ...memoDraft, level: event.target.value }) }, [["1", "一般"], ["2", "准备"], ["3", "重要"], ["4", "截止"]].map(([value, label]) => h2("option", { key: value, value }, label)))),
    h2("label", null, h2("span", null, "备注"), h2("textarea", { value: memoDraft.description, rows: 2, onChange: (event) => setMemoDraft({ ...memoDraft, description: event.target.value }) })),
    h2("div", { className: "cc-memo-form-actions" }, memoDraft.id && h2("button", { type: "button", className: "text-button danger", onClick: () => deleteMemo(items.find((item) => item.id === memoDraft.id)) }, "删除"), h2("button", { type: "button", className: "cc-button", onClick: () => setMemoDraft(null) }, "取消"), h2("button", { type: "submit", className: "cc-button primary", disabled: busy }, busy ? "保存中…" : "保存备忘"))
  );
  const list = h2("div", { className: "cc-list" }, sortedItems.map((entry) => {
    const item = entry.item;
    const next = nextMark(entry, today);
    return h2(
      "button",
      { key: item.id, className: "cc-list-row", onClick: () => setSelected(item) },
      h2("time", null, whenText(entry, next)),
      h2("span", { className: `cc-tag ${item.category}`, "data-color": tagColor(item) }, item.category === "competition" ? "赛事" : "证书"),
      // 简称只在「和全名不一样」的时候才占一格，否则白占一行、还显得重复
      h2("strong", null, item.title, shortName(item) !== item.title && h2("span", { className: "cc-list-alias" }, shortName(item))),
      h2("span", { className: `cc-confidence ${item.demo || entry.kind !== "dated" ? "uncertain" : ""}` }, entry.label),
      h2("span", null, REGISTRATION_LABELS[item.registrationStatus] === "报名中" ? "报名中" : "")
    );
  }));
  const timeline = h2(
    "section",
    { className: "cc-timeline", "aria-label": "时间轴" },
    sortedItems.length ? sortedItems.map((entry) => {
      const { item } = entry;
      const next = nextMark(entry, today);
      const when = whenText(entry, next, { expectedStyle: "timeline" });
      const nodes = (item.nodes || []).filter((node) => node.start || node.end);
      return h2(
        "button",
        {
          key: item.id,
          className: `cc-tl-row ${entry.kind}`,
          "data-color": tagColor(item),
          onClick: () => setSelected(item),
          onFocus: (event) => setHover({ item, node: entry.node, x: 260, y: clampY(event.currentTarget) }),
          onBlur: () => setHover(null)
        },
        h2("span", { className: "cc-tl-date" }, h2("strong", null, when), h2("small", null, entry.kind === "dated" && nodes.length > 1 ? `${nodes.length} 个节点` : "")),
        h2(Thumb, { item, size: "row", key: "thumb" }),
        h2(
          "span",
          { className: "cc-tl-body" },
          h2("span", { className: "cc-tl-title" }, item.title),
          h2("small", null, cardNote(item, cardsOf) || item.organizer || item.description || "未填写主办方")
        ),
        h2("span", { className: `cc-confidence ${item.demo || entry.kind !== "dated" ? "uncertain" : ""}` }, entry.label)
      );
    }) : h2("div", { className: "cc-empty small" }, "还没有安排。可以让 Agent 补几条，或自己新增。")
  );
  const yearView = import_react2.default.useMemo(() => {
    const year = month.getFullYear();
    const months = Array.from({ length: 12 }, (unused, index) => {
      const cursor = new Date(year, index, 1);
      const prefix = `${year}-${String(index + 1).padStart(2, "0")}`;
      const rowsOf = buildMonthIndex(visible, cursor);
      const marks = /* @__PURE__ */ new Map();
      for (const [iso, rows] of rowsOf) {
        if (!iso.startsWith(prefix)) continue;
        marks.set(iso, { count: rows.length, level: Math.max(...rows.map((row) => levelOf(row.node, row.edge))) });
      }
      return { index, cells: yearMonthCells(year, index), marks };
    });
    const busy2 = months.reduce((sum, entry) => sum + entry.marks.size, 0);
    return { year, months, busy: busy2 };
  }, [viewKey, month.getFullYear()]);
  const yearDayCell = (year, index, marks) => (date, slot) => {
    if (date === null) return h2("span", { key: `pad-${slot}`, className: "cc-year-day empty" });
    const iso = isoDate(date);
    const mark = marks.get(iso);
    return h2("button", {
      key: iso,
      type: "button",
      className: `cc-year-day ${mark ? "has-events" : ""}`,
      "data-level": mark?.level || void 0,
      "aria-label": mark ? `${iso}，${mark.count} 项` : iso,
      title: mark ? `${iso} · ${mark.count} 项` : iso,
      onClick: () => {
        setMonth(new Date(year, index, 1));
        setSelectedDate(iso);
        setMode("month");
      }
    }, date.getDate());
  };
  const yearMode = h2(
    "section",
    { className: "cc-year", "aria-label": `${yearView.year} 年总览` },
    h2(
      "div",
      { className: "cc-year-head" },
      h2(
        "div",
        null,
        h2("h2", null, `${yearView.year} 年`),
        h2("p", null, yearView.busy ? `这一年有 ${yearView.busy} 天排了事，点某个月就跳到那个月的月历。` : "这一年还没有落到具体日子的安排。")
      ),
      h2(
        "div",
        { className: "cc-year-actions" },
        h2("button", { type: "button", className: "icon-button", "aria-label": "上一年", onClick: () => setMonth(new Date(yearView.year - 1, month.getMonth(), 1)) }, h2(Icon, { name: "back" })),
        h2("button", { type: "button", className: "cc-button", onClick: () => setMonth(/* @__PURE__ */ new Date()) }, "回到今年"),
        h2("button", { type: "button", className: "icon-button", "aria-label": "下一年", onClick: () => setMonth(new Date(yearView.year + 1, month.getMonth(), 1)) }, h2(Icon, { name: "forward" }))
      )
    ),
    h2(
      "div",
      { className: "cc-year-grid" },
      yearView.months.map(({ index, cells: cells2, marks }) => h2(
        "div",
        { key: index, className: `cc-year-month ${index === month.getMonth() ? "current" : ""}` },
        h2("button", { type: "button", className: "cc-year-label", onClick: () => {
          setMonth(new Date(yearView.year, index, 1));
          setMode("month");
        } }, `${index + 1} 月`),
        h2("div", { className: "cc-year-days" }, cells2.map(yearDayCell(yearView.year, index, marks)))
      ))
    )
  );
  const hoverCard = hover ? h2(
    "div",
    { className: "cc-hover-card", "aria-hidden": true, style: { top: `${hover.y}px`, left: `${hover.x}px` } },
    h2(Thumb, { item: hover.item, size: "wide" }),
    h2("strong", null, hover.item.title),
    h2("span", { className: "cc-hover-meta" }, `${NODE_LABELS[hover.node?.type] || "关键节点"} · ${nodeRangeText(hover.node || {})} · ${confidenceLabel(hover.item, hover.node || {}).label}`),
    h2("p", null, hover.item.organizer || "未填写主办方"),
    h2("span", { className: "cc-hover-more" }, "点击查看完整节点与来源")
  ) : null;
  const conversationHint = view === "calendar" ? h2(
    "aside",
    { className: "cc-conversation-hint", "aria-label": "用对话生成日历" },
    h2(
      "div",
      null,
      h2("strong", null, "让 Agent 生成属于我的日历"),
      h2("p", null, profile.major ? `档案：${profileSummary}。可以让 Agent 据此挑出适合你的赛事和证书。` : "告诉 Agent 你的专业、年级、地区，它会挑出适合你的赛事和证书，排进这份日历。")
    ),
    h2(
      "div",
      { className: "cc-ask-actions" },
      h2("button", { type: "button", className: "cc-button primary", disabled: asking, onClick: () => askAgent("plan") }, asking ? "正在打开…" : profile.major ? "生成我的日历" : "开始生成我的日历"),
      h2("button", { type: "button", className: "cc-button", disabled: asking, onClick: () => askAgent("semester") }, "按学期排一批"),
      h2("button", { type: "button", className: "cc-button", disabled: asking, onClick: () => askAgent("add") }, "记一个已定的")
    ),
    askError && h2("p", { className: "cc-inline-error cc-ask-error", role: "alert" }, askError)
  ) : null;
  const hasSuggestions = view === "calendar" && !hasRealItems && suggestions.length > 0;
  const demoIds = new Set(items.filter((item) => item.demo).map((item) => item.id));
  const shownSuggestions = hasSuggestions ? suggestions.filter((entry) => !demoIds.has(entry.id)) : [];
  const suggestionPanel = shownSuggestions.length ? h2(
    "section",
    { className: "cc-suggest", "aria-label": "可以补进来的事项" },
    h2("div", { className: "cc-suggest-head" }, h2("div", null, h2("h2", null, "不知道该排什么？"), h2("p", null, profile.major ? `按你的档案（${profileSummary}）挑的，时间以主办方当届公告为准。` : "先填档案，这里会更准。"))),
    h2("div", { className: "cc-suggest-list" }, shownSuggestions.map((entry) => h2(
      "article",
      { key: entry.id, className: "cc-suggest-row", "data-color": tagColor(entry) },
      h2("span", { className: "cc-tag", "data-color": tagColor(entry) }, entry.category === "competition" ? "赛事" : "证书"),
      h2("div", { className: "cc-suggest-body" }, h2("strong", null, entry.title), h2("small", null, entry.why), entry.typical && h2("small", { className: "cc-suggest-typical" }, `参考节奏：${entry.typical}`), h2("small", { className: "cc-suggest-meta" }, [entry.organizer, (entry.regions || []).join(" / ")].filter(Boolean).join(" · "))),
      h2("button", { type: "button", className: "cc-button", disabled: asking, onClick: () => askAgent("ask", entry.ask) }, "问 Agent")
    )))
  ) : null;
  const toolbarWithCalendar = view === "calendar" && mode === "month" ? h2("div", { className: "cc-month-head" }, h2("div", null, h2("h2", null, monthTitle(month)), profile.major && h2("p", null, profileSummary)), h2("div", { className: "cc-month-actions" }, h2("button", { className: "icon-button", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)), "aria-label": "上个月" }, h2(Icon, { name: "back" })), h2("button", { className: "cc-button", onClick: () => setMonth(/* @__PURE__ */ new Date()), "aria-label": "返回本月" }, h2(Icon, { name: "today" }), "今天"), h2("button", { className: "cc-button", onClick: () => setMode("year"), "aria-label": "看全年总览" }, "全年"), h2("button", { className: "icon-button", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)), "aria-label": "下个月" }, h2(Icon, { name: "forward" })))) : null;
  const reminderBand = view === "calendar" && reminderDue.length ? h2(
    "section",
    { className: "cc-reminder-band", "aria-label": "即将到期的提醒" },
    h2(
      "div",
      { className: "cc-reminder-head" },
      h2("strong", null, "你设了提醒，这些快到了"),
      h2("span", null, reminderDue.map((row) => `${shortName(row.item)} ${row.offset === 0 ? "今天" : row.offset > 0 ? `${row.offset} 天后` : `已过 ${-row.offset} 天`}`).join(" · "))
    ),
    h2("div", { className: "cc-reminder-list" }, reminderDue.slice(0, 4).map((row) => h2("button", {
      key: `${row.item.id}-${row.mark.date}`,
      className: "cc-reminder-chip",
      "data-level": levelOf(row.mark.node, row.mark.edge),
      onClick: () => setSelected(row.item),
      title: `${row.item.title} · ${NODE_LABELS[row.mark.node.type] || row.mark.node.type} · ${row.mark.date}`
    }, h2("span", { className: "cc-reminder-when" }, row.mark.date.slice(5).replace("-", "/")), h2("span", null, shortName(row.item)))))
  ) : null;
  const resultView = h2(
    import_react2.default.Fragment,
    null,
    view === "calendar" && mode === "year" ? yearMode : null,
    view === "calendar" && mode === "month" ? toolbarWithCalendar : null,
    reminderBand,
    view === "calendar" && mode === "month" ? h2(
      import_react2.default.Fragment,
      null,
      h2(
        "div",
        { className: "cc-calendar-tools" },
        h2("button", { type: "button", className: "cc-button", "aria-expanded": showTools, onClick: () => setShowTools(!showTools) }, showTools ? "收起工具" : "搜索与视图"),
        // 字号档位：一排小按钮，切一下就能看清 / 塞下更多
        h2("div", { className: "cc-density", role: "group", "aria-label": "月历字号" }, [["compact", "紧凑"], ["cozy", "标准"], ["roomy", "宽松"]].map(([value, label]) => h2("button", { key: value, type: "button", className: density === value ? "selected" : "", "aria-pressed": density === value, onClick: () => setDensity(value) }, label)))
      ),
      showTools && h2(import_react2.default.Fragment, null, toolbar, coverageHint, conversationHint),
      h2("div", { className: "cc-calendar-layout" }, h2("div", { className: "cc-calendar-stack" }, floatingBand, calendar), agenda)
    ) : null,
    view !== "calendar" || mode !== "month" && mode !== "year" ? h2(
      import_react2.default.Fragment,
      null,
      showFilters && filterPanel,
      h2("label", { className: "cc-toggle cc-mobile-suitable" }, h2("input", { type: "checkbox", checked: filters.onlySuitable, onChange: (event) => setFilters((current) => ({ ...current, onlySuitable: event.target.checked })) }), h2("span", null, "只看适合我")),
      visible.length === 0 ? h2("div", { className: "cc-empty" }, h2("div", { className: "cc-empty-mark" }, "0"), h2("h2", null, "没有找到匹配事项"), h2("p", null, "尝试清除筛选，或调整关键词、类别与日期范围。"), h2("button", { className: "cc-button", onClick: clearFilters }, "清除筛选")) : mode === "list" || view !== "calendar" ? list : mode === "upcoming" ? timeline : h2("div", { className: "cc-calendar-layout" }, calendar, agenda),
      suggestionPanel
    ) : null
  );
  const profileSetup = !profile.major && view === "calendar" ? h2("div", { className: "cc-profile-banner" }, h2("div", null, h2("strong", null, "先完善个人档案"), h2("p", null, "填写专业与关注方向，筛出更适合你的事项。")), h2("button", { className: "cc-button primary", onClick: () => setView("manage") }, "设置档案")) : null;
  const blankItem = () => ({ id: "", title: "", category: "competition", description: "", organizer: "", eligibility: "", majors: [], interests: [], years: [], regions: [], registrationStatus: "unknown", sourceUrl: "", verifiedAt: "", notes: "", demo: false, nodes: [{ id: crypto.randomUUID(), type: "registration", start: null, end: null, confidence: "unknown", note: "" }] });
  const manage = view === "manage" ? h2(ManageView, { state, profile, busy, error, duplicates, onMerge: mergeDuplicates, onSaveProfile: patchProfile, onEdit: (item) => setEditing(item || blankItem()), onImport: () => importRef.current?.click(), onExport: () => exportFile("json") }) : null;
  const detail = selected && h2(Detail, { item: selected, cards: cardsOf.get(selected) || [selected], profile, busy, favorite: (cardsOf.get(selected) || [selected]).some((card) => state.favorites.includes(card.id)), reminder: (cardsOf.get(selected) || [selected]).some((card) => state.reminders.includes(card.id)), onClose: () => setSelected(null), onFavorite: () => toggleFavorite(selected), onReminder: () => toggleReminder(selected), onEdit: () => {
    setEditing(selected);
    setSelected(null);
  }, onUngroup: cardsOf.get(selected)?.length > 1 ? () => ungroup(selected) : null, onLevel: setLevel });
  const itemEditor = editing && h2(ItemEditor, { item: editing, busy, onClose: () => setEditing(null), onSave: saveItem, onDelete: async (item) => {
    if (!window.confirm(`删除“${item.title}”？删掉后会有一条通知，8 秒内可以撤销。`)) return;
    try {
      setState(await api(`items/${encodeURIComponent(item.id)}`, { method: "DELETE" }));
      setEditing(null);
      notify("事项已删除");
      const snapshot = item;
      offerUndo(`已删除「${snapshot.title}」`, async () => {
        setState(await api("items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ item: snapshot }) }));
      });
    } catch (e) {
      setError(e.message);
    }
  } });
  if (loading && !state) return h2("div", { className: "cc-shell cc-state", role: "status" }, "正在读取本地日历…");
  if (error && !state) return h2("div", { className: "cc-shell cc-state" }, h2("h1", null, "无法读取日历"), h2("p", null, error), h2("button", { className: "cc-button primary", onClick: load }, "重试"));
  return h2(
    "div",
    { className: "cc-shell", "data-density": density },
    h2("style", null, styles_default),
    h2("aside", { className: "cc-sidebar" }, h2("div", { className: "cc-brand" }, h2("span", { className: "cc-brand-mark" }, "C"), h2("span", null, h2("strong", null, "校历"), h2("small", null, "赛事与证书"))), navigation, h2("div", { className: "cc-sidebar-foot" }, h2("span", { className: "cc-local-dot" }), "本地数据 · 手动维护")),
    h2(
      "main",
      { className: "cc-main" },
      h2("header", { className: "cc-topbar" }, h2("div", null, h2("p", { className: "cc-eyebrow" }, "CAMPUS OPPORTUNITIES"), h2("h1", null, headerTitle)), h2("div", { className: "cc-top-actions" }, h2(StarButton, { className: "cc-button" }), h2("button", { className: "cc-button cc-refresh", onClick: () => load(), disabled: loading, "aria-label": loading ? "正在刷新日历" : "刷新日历", title: "刷新日历" }, h2("span", { "aria-hidden": true }, loading ? "…" : "↻")), h2("button", { className: "cc-button", onClick: () => exportFile("ics") }, "导出 ICS"), view !== "manage" && h2("button", { className: "cc-button primary", onClick: () => setEditing(blankItem()) }, h2(Icon, { name: "plus" }), "新增事项"))),
      error && h2("div", { className: "cc-alert", role: "alert" }, error, h2("button", { onClick: () => setError(""), "aria-label": "关闭提示" }, h2(Icon, { name: "close" }))),
      // role=status + aria-live=polite：动态出现的提示对读屏器要播报，否则只有首次挂载才会读
      h2(
        "div",
        { className: "cc-notice-slot", "aria-live": "polite", "aria-atomic": "true" },
        notice && h2("div", { className: "cc-notice", role: "status" }, notice, h2("button", { onClick: () => notify(""), "aria-label": "关闭提示" }, h2(Icon, { name: "close" }))),
        undo && h2(
          "div",
          { className: "cc-undo", role: "status" },
          h2("span", null, undo.message),
          h2("button", {
            type: "button",
            className: "cc-undo-action",
            onClick: async () => {
              dismissUndo();
              try {
                await undo.restore();
                notify("已撤销删除");
              } catch (e) {
                setError(e.message);
              }
            }
          }, "撤销"),
          h2("button", { type: "button", className: "cc-undo-close", onClick: dismissUndo, "aria-label": "关闭撤销提示" }, h2(Icon, { name: "close" }))
        )
      ),
      view === "manage" ? manage : h2(import_react2.default.Fragment, null, view === "calendar" && mode === "month" ? null : profileSetup, view === "calendar" && mode === "month" ? null : toolbar, view === "calendar" && mode === "month" ? null : conversationHint, resultView),
      memoDraft && h2("div", { className: "cc-memo-modal-backdrop", onClick: (event) => {
        if (event.target === event.currentTarget) setMemoDraft(null);
      } }, h2("div", { className: "cc-memo-modal", role: "dialog", "aria-modal": true, "aria-label": memoDraft.id ? "编辑备忘" : "新增备忘", ref: memoDialogRef, tabIndex: -1 }, memoForm)),
      h2("input", { ref: importRef, className: "sr-only", type: "file", accept: "application/json,.json", onChange: importFile }),
      hover && (mode !== "list" || view !== "calendar") ? hoverCard : null
    ),
    detail,
    itemEditor
  );
}
function ManageView({ state, profile, busy, error, duplicates = [], onMerge, onSaveProfile, onEdit, onImport, onExport }) {
  const savedProfile = import_react2.default.useMemo(() => ({ ...profile, interests: [...profile.interests || []], types: [...profile.types || []] }), [profile.major, profile.year, profile.province, (profile.interests || []).join("\0"), (profile.types || []).join("\0")]);
  const [changes, setChanges] = import_react2.default.useState({});
  import_react2.default.useEffect(() => {
    setChanges({});
  }, [profile.major, profile.year, profile.province, (profile.interests || []).join("\0"), (profile.types || []).join("\0")]);
  const draft = { ...savedProfile, ...changes };
  const setField = (key, value) => setChanges((current) => ({ ...current, [key]: value }));
  const toggleField = (key, value) => setChanges((current) => {
    const list = (current[key] ?? draft[key]) || [];
    return { ...current, [key]: list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value] };
  });
  return h2(
    "div",
    { className: "cc-manage" },
    h2(
      "section",
      { className: "cc-section" },
      h2("div", { className: "cc-section-head" }, h2("div", null, h2("h2", null, "个人档案"), h2("p", null, "档案用于计算适配度，数据仅存本机。")), h2("button", { className: "cc-button primary", disabled: busy, onClick: () => onSaveProfile(draft) }, "保存档案")),
      h2("div", { className: "cc-profile-form" }, h2("label", { className: "cc-field" }, h2("span", null, "专业（可搜索或自定义）"), h2("input", { list: "cc-major-options", value: draft.major || "", maxLength: 100, onChange: (event) => setField("major", event.target.value), placeholder: "输入或选择专业" }), h2("datalist", { id: "cc-major-options" }, majors.map((value) => h2("option", { key: value, value })))), h2("label", { className: "cc-field" }, h2("span", null, "年级"), h2("select", { value: draft.year || "", onChange: (event) => setField("year", event.target.value) }, [["", "请选择"], ...["大一", "大二", "大三", "大四", "研一", "研二", "研三", "博士"].map((value) => [value, value])].map(([value, label]) => h2("option", { key: value, value }, label)))), h2("label", { className: "cc-field" }, h2("span", null, "学校所在省份"), h2("select", { value: draft.province || "", onChange: (event) => setField("province", event.target.value) }, [["", "请选择"], ...provinces.map((value) => [value, value])].map(([value, label]) => h2("option", { key: value, value }, label))))),
      h2("fieldset", { className: "cc-choice-set" }, h2("legend", null, "关注方向"), h2("div", { className: "cc-choice-grid" }, directions.map((value) => h2("label", { key: value }, h2("input", { type: "checkbox", checked: (draft.interests || []).includes(value), onChange: () => toggleField("interests", value) }), h2("span", null, value))))),
      h2("fieldset", { className: "cc-choice-set" }, h2("legend", null, "感兴趣的类型"), h2("div", { className: "cc-choice-grid" }, [["competition", "赛事"], ["certificate", "证书考试"]].map(([value, label]) => h2("label", { key: value }, h2("input", { type: "checkbox", checked: (draft.types || []).includes(value), onChange: () => toggleField("types", value) }), h2("span", null, label))))),
      error && h2("p", { className: "cc-inline-error", role: "alert" }, error)
    ),
    // 重复记录：同一赛事被写成多条时，先把「合并」摆出来，而不是让用户自己在几十行里找
    h2(
      "section",
      { className: "cc-section" },
      h2("div", { className: "cc-section-head" }, h2("div", null, h2("h2", null, "重复记录"), h2("p", null, duplicates.length ? `发现 ${duplicates.length} 组看起来是同一个赛事的记录：合并后月历只出现一次，节点全部保留。` : "没有发现可以合并的重复记录。同一年只保留一条，场次型考试（CSP、软考、四六级）不在此列。")), duplicates.length ? h2("button", { className: "cc-button primary", disabled: busy, onClick: () => onMerge() }, "全部合并") : null),
      duplicates.length ? h2("div", { className: "cc-dupe-list" }, duplicates.map((plan, index) => h2("div", { className: "cc-dupe-row", key: plan.key || index }, h2("div", null, h2("strong", null, plan.title || plan.titles?.[0] || "未命名"), h2("small", null, `${(plan.ids || []).length} 条记录 · ${plan.nodeCount || 0} 个节点 · ${plan.labels?.join(" / ") || ""}`), h2("ul", null, (plan.titles || []).map((title, row) => h2("li", { key: row }, title)))), h2("button", { className: "cc-button", disabled: busy, onClick: () => onMerge(plan.key ? [plan.key] : void 0) }, "合并这组")))) : null
    ),
    h2(
      "section",
      { className: "cc-section" },
      h2("div", { className: "cc-section-head" }, h2("div", null, h2("h2", null, "数据维护"), h2("p", null, "录入可追溯来源的数据，或备份本地 JSON。")), h2("div", { className: "cc-row-actions" }, h2("button", { className: "cc-button", onClick: onImport }, "导入 JSON"), h2("button", { className: "cc-button", onClick: onExport }, "导出 JSON"), h2("button", { className: "cc-button primary", onClick: () => onEdit(null) }, h2(Icon, { name: "plus" }), "新增事项"))),
      h2("div", { className: "cc-data-list" }, state.items.map((item) => h2("div", { className: "cc-data-row", key: item.id }, h2("span", { className: `cc-tag ${item.category}`, "data-color": tagColor(item) }, item.category === "competition" ? "赛事" : "证书"), h2("strong", null, item.title), h2("span", { className: "cc-confidence" }, confidenceLabel(item, item.nodes?.[0] || {}).label), h2("button", { className: "icon-button", "aria-label": `编辑${item.title}`, onClick: () => onEdit(item) }, h2(Icon, { name: "edit" }))))),
      h2("p", { className: "cc-data-disclaimer" }, "没有赛事 API 或自动抓取。真实记录须填写官方来源 URL 与最近核验日期；预测日期需说明依据。站内提醒不等于系统通知。")
    )
  );
}
function Detail({ item, cards = [], profile, favorite, reminder, onClose, onFavorite, onReminder, onEdit, onUngroup, onLevel, busy }) {
  const fit = scoreFit(item, profile);
  const today = todayIso();
  const marks = item.nodes || [];
  const alias = itemAlias(item);
  const dialogRef = useDialogFocus();
  const verify = verificationState(item, /* @__PURE__ */ new Date(`${today}T00:00:00Z`));
  const verifyText = verify.state === "unknown" ? "未核验" : verify.state === "fresh" ? `${item.verifiedAt}（${verify.days} 天前）` : `${item.verifiedAt}（${verify.days} 天前，该重新核对）`;
  return h2("div", { className: "cc-overlay", role: "presentation", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  } }, h2(
    "section",
    { className: "cc-dialog", role: "dialog", "aria-modal": true, "aria-labelledby": "cc-detail-title", ref: dialogRef, tabIndex: -1 },
    h2(
      "div",
      { className: "cc-dialog-head" },
      h2("span", { className: `cc-tag ${item.category}`, "data-color": tagColor(item) }, item.category === "competition" ? "赛事" : "证书"),
      h2("button", { className: "icon-button", onClick: onClose, "aria-label": "关闭详情" }, h2(Icon, { name: "close" })),
      h2("h2", { id: "cc-detail-title" }, item.title),
      item.demo && h2("p", { className: "cc-demo-notice" }, "这条是演示数据，不代表真实活动、近期报名或已核验安排")
    ),
    h2(Thumb, { item, size: "hero" }),
    h2("div", { className: "cc-dialog-actions" }, h2("button", { className: "cc-button", onClick: onFavorite }, `${favorite ? "★" : "☆"} ${favorite ? "已收藏" : "收藏"}`), h2("button", { className: "cc-button", onClick: onReminder }, reminder ? "已设站内提醒" : "设置站内提醒"), h2("button", { className: "cc-button", onClick: onEdit }, "编辑")),
    h2("dl", { className: "cc-detail-grid" }, [["简介", item.description], ["适合人群", [...item.majors || [], ...item.years || [], ...item.interests || []].join("、") || item.eligibility], ["主办方", item.organizer], ["承办 / 账号", item.artist], ["地点", item.venue], ["报名条件", item.eligibility], ["适配度", `${fit.score}% · ${fit.reasons.join("、") || "暂无匹配信息"}`], ["报名状态", REGISTRATION_LABELS[item.registrationStatus] || "未知"], ["最近核验", verifyText], ["备注", item.notes]].map(([label, value]) => h2("div", { key: label }, h2("dt", null, label), h2("dd", null, value || "未提供")))),
    // 核验过期要说清楚该怎么办，不能只给一个灰字日期让用户自己算
    verify.state !== "fresh" && h2("p", { className: "cc-verify-hint", "data-state": verify.state }, verify.state === "unknown" ? "这条还没有核验日期。日期来自哪里、什么时候核对的，是这份日历唯一可信的依据。" : `上次核验是 ${verify.days} 天前。赛事日期每年都变，建议去官网重新确认一遍再信它。`),
    h2("section", { className: "cc-node-list" }, h2("div", { className: "cc-section-title" }, h2("h3", null, "关键节点"), h2("span", { className: "cc-section-count" }, `${marks.length} 个${alias.alias !== item.title ? ` · 简称 ${alias.alias}` : ""}`)), marks.length ? marks.map((node) => {
      const confidence = confidenceLabel(item, node);
      const { from, to } = nodeWindow(node);
      const anchor = to && (node.type === "registration_deadline" || node.type === "submission") ? to : from || to;
      const offset = anchor ? dayDistance(today, anchor) : null;
      const rangeNote = from && to && from !== to && anchor === to ? "截止日" : "";
      return h2(
        "article",
        { key: node.id, "data-color": node.color || tagColor(item), "data-level": nodeLevel(node, null) },
        h2("div", null, h2("strong", null, NODE_LABELS[node.type] || node.type), h2("span", { className: `cc-confidence ${confidence.label === "预测" || confidence.label === "待确认" || confidence.label === "日期未知" ? "uncertain" : ""}` }, confidence.label)),
        h2("p", null, nodeRangeText(node), offset !== null && offset !== void 0 ? h2("span", { className: "cc-node-distance" }, ` · ${rangeNote ? `${rangeNote} ` : ""}${distanceText(offset)}`) : null),
        h2("small", null, confidence.detail),
        node.color && h2("small", null, `标签色：${node.color}`),
        // 用户自己给这个日子定重要程度：点一下，月历格的底色就跟着变，不用去编辑表单里翻
        onLevel && h2(
          "div",
          { className: "cc-level-picker", role: "group", "aria-label": `${NODE_LABELS[node.type] || node.type}的重要程度` },
          h2("span", { className: "cc-level-label" }, "重要程度"),
          // 档位选中态要反映「当前生效的等级」：手动设过就用手动的，没设过就用按节点类型推断的，
          // 并用 .implied 标出来 —— 否则四个按钮全是未选中，用户看不出这件事现在到底算几级。
          [1, 2, 3, 4].map((level) => h2("button", {
            key: level,
            type: "button",
            disabled: busy,
            className: `cc-level-option ${nodeLevel(node, null) === level ? "selected" : ""} ${(node.level || 0) !== level && nodeLevel(node, null) === level ? "implied" : ""}`,
            "data-level": level,
            "aria-pressed": nodeLevel(node, null) === level,
            title: LEVEL_HINTS[level],
            onClick: () => onLevel(item, node.id, (node.level || 0) === level ? null : level)
          }, h2("span", { className: "cc-level-dot", "aria-hidden": true }), LEVEL_LABELS[level])),
          node.level ? h2("button", { type: "button", className: "cc-level-reset", disabled: busy, onClick: () => onLevel(item, node.id, null) }, "回到自动") : h2("span", { className: "cc-level-auto" }, `自动算作「${LEVEL_LABELS[nodeLevel(node, null)]}」，点一下改`)
        )
      );
    }) : h2("p", { className: "cc-node-empty" }, "还没有节点。")),
    h2(
      "footer",
      { className: "cc-source" },
      h2("span", null, "官方来源"),
      item.sourceUrl && !item.demo ? h2("a", { href: item.sourceUrl, target: "_blank", rel: "noopener noreferrer" }, item.sourceUrl) : h2("span", null, item.demo ? "演示记录无官方来源" : "无来源 · 不得标记为已核验"),
      item.imageUrl && h2("span", { className: "cc-source-image" }, "宣传图：", h2("a", { href: item.imageUrl, target: "_blank", rel: "noopener noreferrer" }, "查看原图"))
    ),
    // 一张卡可能由好几条记录拼起来：把原记录摊开，用户能看出「不是数据丢了，是合并展示了」
    cards.length > 1 && h2(
      "section",
      { className: "cc-member-list" },
      h2("div", { className: "cc-section-title" }, h2("h3", null, `同组记录 · ${cards.length} 条`), h2("span", { className: "cc-section-count" }, [[...new Set(cards.map((card) => itemAlias(card).alias))].join(" / "), onUngroup && h2("button", { type: "button", className: "text-button", onClick: onUngroup }, "全部拆开")].filter(Boolean))),
      cards.map((card) => h2("div", { className: "cc-member-row", key: card.id, "data-color": tagColor(card) }, h2("strong", null, card.title), h2("small", null, `${card.nodes?.length || 0} 个节点 · ${confidenceLabel(card, card.nodes?.[0] || {}).label}`)))
    )
  ));
}
function ItemEditor({ item, busy, onClose, onSave, onDelete }) {
  const [draft, setDraft] = import_react2.default.useState(() => structuredClone(item));
  const [localError, setLocalError] = import_react2.default.useState("");
  const dialogRef = useDialogFocus();
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const setNode = (index, key, value) => setDraft((current) => ({ ...current, nodes: current.nodes.map((entry, row) => row === index ? { ...entry, [key]: value } : entry) }));
  const addNode = () => setDraft((current) => ({ ...current, nodes: [...current.nodes, { id: crypto.randomUUID(), type: "other", start: null, end: null, confidence: "unknown", note: "" }] }));
  const removeNode = (index) => setDraft((current) => ({ ...current, nodes: current.nodes.filter((_, row) => row !== index) }));
  const nodes = draft.nodes?.length ? draft.nodes : [{ id: crypto.randomUUID(), type: "other", start: null, end: null, confidence: "unknown", note: "" }];
  const submit = (event) => {
    event.preventDefault();
    setLocalError("");
    const next = { ...draft, title: draft.title.trim(), alias: (draft.alias || "").trim().slice(0, 12), sourceUrl: (draft.sourceUrl || "").trim(), verifiedAt: draft.verifiedAt || "", imageUrl: (draft.imageUrl || "").trim(), nodes: nodes.map((entry) => ({ ...entry, start: entry.start || null, end: entry.end || null })) };
    if (!next.alias) delete next.alias;
    const probe = validateItem({ ...next, id: next.id || "draft" });
    if (!probe.ok) return setLocalError(probe.errors[0].replace(/^nodes\[\d+\]\s*/, ""));
    onSave(next);
  };
  const nodeTypeOptions = [["registration", "报名开始"], ["registration_deadline", "报名截止"], ["competition", "比赛日期"], ["exam", "考试日期"], ["submission", "材料提交"], ["result", "结果公布"], ["other", "其他"]];
  const confidenceOptions = [["unknown", "日期未知"], ["official_confirmed", "官方已确认"], ["predicted", "预测"], ["pending_confirmation", "待确认"]];
  const splitList = (text2) => text2.split(/[、,，]/).map((value) => value.trim()).filter(Boolean);
  return h2("div", { className: "cc-overlay", role: "presentation", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  } }, h2(
    "section",
    { className: "cc-dialog editor", role: "dialog", "aria-modal": true, "aria-labelledby": "cc-editor-title", ref: dialogRef, tabIndex: -1 },
    h2("div", { className: "cc-dialog-head" }, h2("button", { className: "icon-button", onClick: onClose, "aria-label": "关闭表单" }, h2(Icon, { name: "close" })), h2("h2", { id: "cc-editor-title" }, draft.id ? "编辑事项" : "新增事项")),
    h2(
      "form",
      { className: "cc-editor-form", onSubmit: submit },
      h2(
        "fieldset",
        { className: "cc-editor-section" },
        h2("legend", null, "基本信息"),
        h2("label", { className: "cc-field" }, h2("span", null, "事项名称 *"), h2("input", { required: true, maxLength: 200, value: draft.title, onChange: (event) => set("title", event.target.value) })),
        // 简称是月历格里唯一显示得下的字：默认给一个，用户想改成自己的叫法就改
        h2("label", { className: "cc-field" }, h2("span", null, "日历简称（月历格里显示这个）"), h2("input", { maxLength: 12, value: draft.alias ?? "", placeholder: `留空 = ${itemAlias(draft).alias}`, onChange: (event) => set("alias", event.target.value) })),
        h2("label", { className: "cc-field" }, h2("span", null, "类别"), h2("select", { value: draft.category, onChange: (event) => set("category", event.target.value) }, h2("option", { value: "competition" }, "赛事"), h2("option", { value: "certificate" }, "证书考试"))),
        h2("label", { className: "cc-field" }, h2("span", null, "主办方"), h2("input", { value: draft.organizer || "", maxLength: 200, onChange: (event) => set("organizer", event.target.value) })),
        h2("label", { className: "cc-field" }, h2("span", null, "报名状态"), h2("select", { value: draft.registrationStatus || "unknown", onChange: (event) => set("registrationStatus", event.target.value) }, [["unknown", "未知"], ["not_open", "未开始"], ["open", "报名中"], ["closed", "已截止"]].map(([value, label]) => h2("option", { key: value, value }, label)))),
        h2("label", { className: "cc-field cc-span-all" }, h2("span", null, "简介"), h2("textarea", { value: draft.description || "", maxLength: 2e3, rows: 2, onChange: (event) => set("description", event.target.value) }))
      ),
      h2("fieldset", { className: "cc-editor-section" }, h2("legend", null, "适用范围"), h2("label", { className: "cc-field" }, h2("span", null, "适配专业（逗号分隔）"), h2("input", { value: (draft.majors || []).join("、"), onChange: (event) => set("majors", splitList(event.target.value)) })), h2("label", { className: "cc-field" }, h2("span", null, "适用年级（逗号分隔）"), h2("input", { value: (draft.years || []).join("、"), onChange: (event) => set("years", splitList(event.target.value)) })), h2("label", { className: "cc-field" }, h2("span", null, "关注方向（逗号分隔）"), h2("input", { value: (draft.interests || []).join("、"), onChange: (event) => set("interests", splitList(event.target.value)) })), h2("label", { className: "cc-field" }, h2("span", null, "适用地区（逗号分隔）"), h2("input", { value: (draft.regions || []).join("、"), onChange: (event) => set("regions", splitList(event.target.value)) })), h2("label", { className: "cc-field cc-span-all" }, h2("span", null, "报名条件"), h2("textarea", { rows: 2, maxLength: 2e3, value: draft.eligibility || "", onChange: (event) => set("eligibility", event.target.value) }))),
      h2("fieldset", { className: "cc-editor-section" }, h2("legend", null, "来源与核验"), h2("label", { className: "cc-field" }, h2("span", null, "官方来源 URL"), h2("input", { type: "url", placeholder: "https://", value: draft.sourceUrl || "", onChange: (event) => set("sourceUrl", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "最近核验日期"), h2("input", { type: "date", value: draft.verifiedAt || "", onChange: (event) => set("verifiedAt", event.target.value) })), h2("p", { className: "cc-data-disclaimer cc-span-all" }, "官方确认必须有具体日期、HTTP(S) 来源和最近核验日期；插件不会自动访问来源。")),
      h2("fieldset", { className: "cc-editor-section" }, h2("legend", null, "外观与地点"), h2("label", { className: "cc-field cc-span-all" }, h2("span", null, "官方宣传图 URL"), h2("input", { type: "url", placeholder: "https://", value: draft.imageUrl || "", onChange: (event) => set("imageUrl", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "承办 / 官方账号"), h2("input", { maxLength: 120, value: draft.artist || "", onChange: (event) => set("artist", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "比赛或考试地点"), h2("input", { maxLength: 200, value: draft.venue || "", onChange: (event) => set("venue", event.target.value) })), h2("p", { className: "cc-data-disclaimer cc-span-all" }, "宣传图只接受 http(s) 直链，插件不下载也不缓存；没有官方图就留空，会显示色块占位。")),
      h2(
        "fieldset",
        { className: "cc-editor-section cc-editor-nodes" },
        h2("legend", null, "关键节点"),
        h2("div", { className: "cc-node-editor-head" }, h2("span", { className: "cc-data-disclaimer" }, "日期不明确时留空，并标记为待确认。"), h2("button", { type: "button", className: "cc-button", onClick: addNode }, h2(Icon, { name: "plus" }), "添加节点")),
        nodes.map((entry, index) => h2(
          "fieldset",
          { className: "cc-editor-node", key: entry.id },
          h2("legend", null, `节点 ${index + 1}`),
          h2("div", { className: "cc-editor-row" }, h2("label", { className: "cc-field" }, h2("span", null, "节点类型"), h2("select", { value: entry.type, onChange: (event) => setNode(index, "type", event.target.value) }, nodeTypeOptions.map(([value, label]) => h2("option", { key: value, value }, label)))), h2("label", { className: "cc-field" }, h2("span", null, "可信度"), h2("select", { value: entry.confidence, onChange: (event) => setNode(index, "confidence", event.target.value) }, confidenceOptions.map(([value, label]) => h2("option", { key: value, value }, label))))),
          h2("div", { className: "cc-editor-row" }, h2("label", { className: "cc-field" }, h2("span", null, "开始日期"), h2("input", { type: "date", value: entry.start || "", onChange: (event) => setNode(index, "start", event.target.value || null) })), h2("label", { className: "cc-field" }, h2("span", null, "结束日期"), h2("input", { type: "date", value: entry.end || "", onChange: (event) => setNode(index, "end", event.target.value || null) })), h2("label", { className: "cc-field" }, h2("span", null, "日期精度"), h2("select", { value: entry.accuracy || "exact", onChange: (event) => setNode(index, "accuracy", event.target.value) }, [["exact", "精确日期"], ["range", "日期范围"], ["month", "仅月份"], ["year", "仅年份"], ["unknown", "未知"]].map(([value, label]) => h2("option", { key: value, value }, label))))),
          h2("label", { className: "cc-field" }, h2("span", null, entry.confidence === "predicted" ? "推测依据 *" : "说明"), h2("textarea", { rows: 2, maxLength: 1e3, value: entry.note || "", onChange: (event) => setNode(index, "note", event.target.value), placeholder: "如：根据往年公告时间推测，待官方确认" })),
          h2("div", { className: "cc-editor-row" }, h2("label", { className: "cc-field" }, h2("span", null, "标签色"), h2("select", { value: entry.color || "", onChange: (event) => setNode(index, "color", event.target.value) }, [["", "自动"], ...["teal", "amber", "rose", "violet", "sky", "olive", "slate"].map((value) => [value, value])].map(([value, label]) => h2("option", { key: value, value }, label))))),
          nodes.length > 1 && h2("button", { type: "button", className: "cc-button danger", onClick: () => removeNode(index) }, "删除此节点")
        ))
      ),
      h2("label", { className: "cc-field" }, h2("span", null, "备注"), h2("textarea", { rows: 2, maxLength: 2e3, value: draft.notes || "", onChange: (event) => set("notes", event.target.value) })),
      localError && h2("p", { className: "cc-inline-error", role: "alert" }, localError),
      h2("div", { className: "cc-form-actions" }, draft.id && !draft.demo && h2("button", { type: "button", className: "cc-button danger", onClick: () => onDelete(draft) }, "删除事项"), h2("span", { className: "cc-grow" }), h2("button", { type: "button", className: "cc-button", onClick: onClose }, "取消"), h2("button", { type: "submit", className: "cc-button primary", disabled: busy }, busy ? "保存中…" : "保存事项"))
    )
  ));
}
function SidebarIcon() {
  return h2(Icon, { name: "calendar" });
}
var inject = ["slots", "uiWorkspace"];
function apply(ctx) {
  const workspace = ctx.uiWorkspace || ctx.get?.("uiWorkspace");
  const onAsk = workspace && typeof workspace.startSession === "function" ? (prompt) => workspace.startSession(void 0, { prompt, whenDraftExists: "replace" }) : void 0;
  const Main = () => h2(App, { onAsk });
  ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "campus-events-calendar" }, Main)), "campus events calendar main view");
  ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: "campus-events-calendar", order: 6, label: () => "赛事日历" }, SidebarIcon)), "campus events calendar sidebar entry");
}

return module.exports}})