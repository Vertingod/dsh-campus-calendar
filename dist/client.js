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
var styles_default = ':root{--cc-ink:#202d35;--cc-muted:#64767e;--cc-line:#dce5e7;--cc-paper:#f3f6f7;--cc-white:#fff;--cc-green:#176f60;--cc-green-soft:#e9f4f1;--cc-teal:#168c78;--cc-amber:#9a6420;--cc-amber-soft:#fbf1df;--cc-red:#a64037;--cc-radius:6px;--cc-paper-dark:#172421;--cc-surface-dark:#202d2a;--cc-on-paper-dark:#e1ece8;--cc-muted-dark:#a5b6af;--cc-line-dark:#374540;--cc-shadow:0 12px 32px rgba(20,44,39,.10)}\n.cc-shell *{box-sizing:border-box}.cc-shell .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.cc-shell{box-sizing:border-box;height:100%;min-height:520px;display:grid;grid-template-columns:214px minmax(0,1fr);color:var(--cc-ink);background:var(--cc-paper);font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:13px;line-height:1.5;color-scheme:light dark;overflow:auto}.cc-shell button,.cc-shell input,.cc-shell select,.cc-shell textarea{font:inherit}.cc-shell button{color:inherit;cursor:pointer;touch-action:manipulation;transition:background-color .16s ease,color .16s ease,border-color .16s ease,opacity .16s ease,transform .16s ease}.cc-shell button:active{transform:scale(.985)}.cc-shell :focus-visible{outline:2px solid var(--cc-teal);outline-offset:2px}.cc-sidebar{display:flex;flex-direction:column;min-height:100%;padding:24px 14px 16px;background:#26383e;color:#edf4f5}.cc-brand{display:flex;align-items:center;gap:10px;padding:0 8px 27px}.cc-brand-mark{width:35px;height:35px;display:grid;place-items:center;border:1px solid #aabdc0;font-family:Georgia,serif;font-size:20px}.cc-brand strong,.cc-brand small{display:block}.cc-brand strong{font-size:14px;line-height:1.3}.cc-brand small{margin-top:2px;color:#c0cdcf;font-size:11px}.cc-side-nav{display:grid;gap:4px}.cc-side-nav button{height:42px;padding:0 10px;display:flex;align-items:center;gap:10px;border:0;border-radius:4px;background:transparent;color:#dae4e5;text-align:left}.cc-side-nav button:hover,.cc-side-nav button.active{background:#3b555a;color:white}.cc-side-nav button.active{box-shadow:inset 3px 0 var(--cc-teal)}.cc-sidebar-foot{margin-top:auto;padding:12px 8px 0;border-top:1px solid #4b6063;color:#bfccce;font-size:11px}.cc-local-dot{display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:50%;background:#53b69f}.cc-main{min-width:0;padding:0 28px 36px}.cc-topbar{min-height:82px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--cc-line)}.cc-eyebrow{margin:0 0 2px;color:#71838a;font-size:9px;font-weight:700;letter-spacing:1px}.cc-topbar h1{margin:0;font-size:21px;font-weight:650;line-height:1.25}.cc-top-actions,.cc-row-actions,.cc-month-actions,.cc-dialog-actions{display:flex;align-items:center;gap:7px}.cc-button,.icon-button{min-height:36px;padding:0 11px;border:1px solid #c9d6d9;border-radius:4px;background:#fff;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}.cc-button:hover,.icon-button:hover{border-color:#83aaa3;background:#eef6f4}.cc-button.primary{border-color:var(--cc-green);background:var(--cc-green);color:#fff}.cc-button.primary:hover{background:#125b4f}.cc-button.danger{border-color:#e4c3be;color:var(--cc-red)}.icon-button{width:38px;padding:0}.cc-alert,.cc-notice{margin-top:12px;padding:9px 12px;border:1px solid #e1bab2;border-radius:4px;background:#fff1ed;color:#762c24;display:flex;justify-content:space-between;align-items:center}.cc-notice{border-color:#c5ddd5;background:#edf7f3;color:#1e6458}.cc-alert button,.cc-notice button{border:0;background:none}.cc-profile-banner{margin-top:17px;padding:13px 15px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--cc-line);background:#fff}.cc-profile-banner strong{font-size:13px}.cc-profile-banner p{margin:3px 0 0;color:var(--cc-muted);font-size:12px}.cc-month-head{padding:21px 0 15px;display:flex;align-items:center;justify-content:space-between;gap:12px}.cc-month-head h2{margin:0;font-size:19px;font-weight:650}.cc-month-head p{margin:3px 0 0;color:var(--cc-muted);font-size:11px}.cc-month-actions{gap:5px}.cc-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--cc-line)}.cc-search{height:36px;min-width:180px;max-width:380px;flex:1;display:flex;align-items:center;gap:8px;padding:0 9px;border:1px solid #ced9dc;border-radius:4px;background:white;color:#6e7b71}.cc-search input{width:100%;min-width:0;border:0;outline:0!important;color:var(--cc-ink);background:transparent}.cc-search button{border:0;background:none;display:flex}.cc-toggle{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:#45564a}.cc-toggle input,.cc-choice-grid input{accent-color:var(--cc-green)}.cc-segment{height:36px;display:flex;padding:2px;border:1px solid #ced8cf;border-radius:4px;background:white}.cc-segment button{min-width:48px;border:0;border-radius:3px;background:transparent;font-size:12px}.cc-segment button.selected{background:#e6eee6;color:#234a34;font-weight:600}.cc-filters{display:none;padding:12px 0;grid-template-columns:repeat(6,minmax(100px,1fr));gap:8px;border-bottom:1px solid var(--cc-line)}.cc-filters.expanded{display:grid}.cc-field{display:grid;gap:5px;color:#526057;font-size:11px}.cc-field input,.cc-field select,.cc-field textarea{width:100%;min-width:0;padding:8px;border:1px solid #cdd7ce;border-radius:4px;background:#fff;color:var(--cc-ink);font-size:12px}.cc-field textarea{resize:vertical}.cc-field.compact{gap:3px}.cc-field.compact input,.cc-field.compact select{height:32px;padding:4px 6px}.cc-calendar-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(215px,260px);gap:17px;padding-top:13px}.cc-calendar{min-width:0}.cc-weekdays,.cc-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.cc-weekdays{height:29px;align-items:center;text-align:center;color:#657269;font-size:11px;font-weight:600}.cc-weekdays .weekend{color:#8a7660}.cc-grid{grid-auto-rows:minmax(78px,1fr);border-top:1px solid var(--cc-line);border-left:1px solid var(--cc-line)}.cc-day{min-width:0;padding:4px;border-right:1px solid var(--cc-line);border-bottom:1px solid var(--cc-line);background:#fff}.cc-day.outside{background:#f0f3f3;color:#a8b0a9}.cc-day.chosen{box-shadow:inset 0 0 0 2px #63a596}.cc-day-number{width:25px;height:24px;border:0;border-radius:50%;background:transparent;text-align:center;font-size:11px}.cc-day-number:hover{background:var(--cc-day-hover,#e8efe7)}.cc-day-events{display:grid;gap:3px;margin-top:2px}.cc-chip{display:flex;align-items:center;gap:3px;min-width:0;overflow:hidden;padding:3px 4px;border:0;border-left:2px solid #43877b;border-radius:2px;background:#eaf5f2;color:#28574f;text-align:left;font-size:10px}.cc-chip-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cc-chip-edge{flex:none;padding:0 2px;border-radius:2px;background:rgba(40,87,79,.12);font-size:9px;line-height:1.4}.cc-chip[data-edge="end"]{font-weight:650}.cc-chip[data-edge="end"] .cc-chip-edge{background:#a64037;color:#fff}.cc-chip[data-node="registration_deadline"]{border-left-color:#a64037}.cc-chip.uncertain{border-left-color:#c1873c;background:#fff3e1;color:#7a4d18}.cc-chip.uncertain[data-edge="end"] .cc-chip-edge{background:#9a6420}.cc-more{padding:0 4px;color:#657269;font-size:10px}.cc-agenda{min-width:0;padding-left:15px;border-left:1px solid var(--cc-line)}.cc-agenda-head{min-height:32px;display:flex;align-items:center;justify-content:space-between}.cc-agenda-head h2{margin:0;font-size:15px;font-weight:650}.cc-agenda-kicker{display:block;margin:0 0 3px;color:#718188;font-size:10px;font-weight:600;letter-spacing:.2px}.text-button{padding:4px;border:0;background:transparent;color:#236d61;font-size:11px}.cc-agenda-list{display:grid;align-content:start}.cc-agenda-row{display:grid;gap:4px;padding:12px 0;border:0;border-bottom:1px solid #e1e6e1;background:transparent;text-align:left}.cc-agenda-row:hover{background:rgba(22,140,120,.045)}.cc-agenda-row time{color:#647168;font-size:10px}.cc-agenda-row strong{font-size:12px;font-weight:650}.cc-confidence{display:inline-flex;align-items:center;width:max-content;padding:2px 6px;border:1px solid #d6ddd6;border-radius:3px;color:#526158;font-size:10px;line-height:1.5}.cc-confidence.uncertain{border-color:#ebd2ae;background:#fff5e7;color:#8b5519}.cc-confidence.demo{border-color:#c9d8cc;background:#edf4ee;color:#385b40}.cc-empty{min-height:240px;display:grid;place-content:center;justify-items:center;gap:7px;text-align:center}.cc-empty.small{min-height:90px;color:#7a867c;font-size:11px}.cc-empty-mark{width:30px;height:30px;display:grid;place-items:center;border:1px solid #bac9bb;border-radius:50%;color:#58705d}.cc-empty h2{margin:3px 0 0;font-size:15px}.cc-empty p{max-width:320px;margin:0;color:#6d7970;font-size:12px}.cc-list{display:grid;padding-top:7px}.cc-list-row{min-height:50px;display:grid;grid-template-columns:90px 55px minmax(120px,1fr) 95px 70px;align-items:center;gap:10px;padding:7px 4px;border:0;border-bottom:1px solid var(--cc-line);background:transparent;text-align:left}.cc-list-row:hover{background:#fff}.cc-list-row time{color:#657269;font-size:11px}.cc-list-row strong{font-size:12px}.cc-category{width:max-content;padding:2px 6px;border-radius:3px;background:#eaf1ea;color:#3a6245;font-size:10px}.cc-category.certificate{background:#eaf1f4;color:#3c6170}.cc-manage{display:grid;gap:18px;padding-top:18px}.cc-section{padding:16px;border:1px solid var(--cc-line);background:#fff}.cc-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}.cc-section-head h2{margin:0;font-size:16px;font-weight:650}.cc-section-head p{margin:3px 0 0;color:var(--cc-muted);font-size:11px}.cc-profile-form{display:grid;grid-template-columns:1.3fr .8fr 1fr;gap:12px}.cc-choice-set{margin:14px 0 0;padding:0;border:0}.cc-choice-set legend{margin-bottom:7px;color:#526057;font-size:11px}.cc-choice-grid{display:flex;flex-wrap:wrap;gap:7px}.cc-choice-grid label{display:inline-flex;align-items:center;gap:5px;min-height:36px;padding:5px 8px;border:1px solid #d5ded5;border-radius:4px;background:#fbfcfa;color:#46554a;font-size:11px}.cc-data-list{display:grid}.cc-data-row{min-height:44px;display:grid;grid-template-columns:50px minmax(100px,1fr) 95px 38px;align-items:center;gap:8px;border-bottom:1px solid #e6eae6}.cc-data-row strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.cc-data-disclaimer{margin:12px 0 0;color:#68756d;font-size:11px}.cc-inline-error{color:#a03c32;font-size:11px}.cc-overlay{position:fixed;inset:0;z-index:1000;display:flex;justify-content:flex-end;background:#17221d66}.cc-dialog{width:min(560px,100%);height:100%;overflow:auto;padding:22px;background:#f9faf7;box-shadow:var(--cc-shadow)}.cc-dialog-head{display:grid;grid-template-columns:1fr 38px;align-items:start;gap:10px}.cc-dialog-head .cc-category{grid-column:1}.cc-dialog-head .icon-button{grid-column:2;grid-row:1}.cc-dialog-head h2{grid-column:1/-1;margin:4px 0 0;font-size:21px;line-height:1.35}.cc-demo-notice{grid-column:1/-1;margin:0;padding:8px;border:1px solid #e1ceaa;background:#fff6e6;color:#79521b;font-size:11px}.cc-dialog-actions{flex-wrap:wrap;margin:15px 0;padding:12px 0;border-top:1px solid var(--cc-line);border-bottom:1px solid var(--cc-line)}.cc-detail-grid{display:grid;grid-template-columns:95px 1fr;gap:11px 10px;margin:14px 0}.cc-detail-grid dt{color:#6a766d;font-size:11px}.cc-detail-grid dd{margin:0;overflow-wrap:anywhere;font-size:12px}.cc-node-list{margin-top:18px}.cc-node-list h3{margin:0 0 5px;font-size:15px}.cc-node-list article{padding:10px 0;border-bottom:1px solid var(--cc-line)}.cc-node-list article>div{display:flex;align-items:center;justify-content:space-between;gap:8px}.cc-node-list article strong{font-size:12px}.cc-node-list article p{margin:4px 0;color:#36443a;font-size:12px}.cc-node-list article small{display:block;color:#707c73;font-size:10px}.cc-source{display:grid;gap:5px;margin-top:15px;padding-top:12px;border-top:1px solid var(--cc-line);font-size:11px}.cc-source>span:first-child{color:#707c73}.cc-source a{color:#315f48;overflow-wrap:anywhere}.cc-dialog.editor{width:min(680px,100%)}.cc-editor-form{display:grid;gap:12px;padding-top:14px}.cc-editor-section{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px;border:1px solid var(--cc-line);border-radius:4px;background:var(--cc-paper)}.cc-editor-section>legend{padding:0 5px;color:var(--cc-muted);font-size:11px;font-weight:650}.cc-editor-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cc-node-editor-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.cc-node-editor-head strong{font-size:12px}.cc-editor-node{display:grid;gap:9px;padding:11px;border:1px solid var(--cc-line)}.cc-editor-node legend{padding:0 5px;color:#48584c;font-size:11px}.cc-form-actions{display:flex;align-items:center;gap:8px;padding-top:8px}.cc-grow{flex:1}.cc-mobile-suitable{display:none}.cc-conversation-hint{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;margin:12px 0 2px;padding:10px 12px;border:1px solid #c9ddd8;border-radius:4px;background:linear-gradient(110deg,#f1f8f6,#fff)}.cc-conversation-hint strong{display:block;font-size:12px}.cc-conversation-hint p{margin:2px 0 0;color:#526a67;font-size:11px}.cc-conversation-hint code{font-size:10px;color:#376b62}.cc-ask-actions{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;grid-column:1/-1}.cc-ask-actions .cc-button{min-height:34px;padding:0 10px;font-size:11px;white-space:nowrap}.cc-ask-error{margin:6px 0 0;font-size:11px}.cc-state{display:grid;align-content:center;justify-items:center;gap:10px;height:100%;padding:24px;text-align:center}.cc-state h1{margin:0;font-size:21px}.cc-state p{max-width:460px;color:#6d7970}.cc-refresh{display:inline-flex;align-items:center;justify-content:center;min-width:38px;min-height:38px}.cc-tag[data-color=teal],.cc-chip[data-color=teal],.cc-span[data-color=teal],.cc-thumb[data-color=teal]{--cc-tag:#168c78;--cc-tag-soft:#e6f5f1}.cc-tag[data-color=amber],.cc-chip[data-color=amber],.cc-span[data-color=amber],.cc-thumb[data-color=amber]{--cc-tag:#9a6420;--cc-tag-soft:#fdf2df}.cc-tag[data-color=rose],.cc-chip[data-color=rose],.cc-span[data-color=rose],.cc-thumb[data-color=rose]{--cc-tag:#a6435a;--cc-tag-soft:#fbe9ee}.cc-tag[data-color=violet],.cc-chip[data-color=violet],.cc-span[data-color=violet],.cc-thumb[data-color=violet]{--cc-tag:#6a4fa8;--cc-tag-soft:#efeaf9}.cc-tag[data-color=sky],.cc-chip[data-color=sky],.cc-span[data-color=sky],.cc-thumb[data-color=sky]{--cc-tag:#2c6f95;--cc-tag-soft:#e6f1f7}.cc-tag[data-color=olive],.cc-chip[data-color=olive],.cc-span[data-color=olive],.cc-thumb[data-color=olive]{--cc-tag:#5f7430;--cc-tag-soft:#eef3e2}.cc-tag[data-color=slate],.cc-chip[data-color=slate],.cc-span[data-color=slate],.cc-thumb[data-color=slate]{--cc-tag:#4b6068;--cc-tag-soft:#eceff0}.cc-tag{display:inline-flex;align-items:center;width:max-content;padding:2px 7px;border-radius:3px;background:var(--cc-tag-soft,#eaf1ea);color:var(--cc-tag,#3a6245);font-size:10px;font-weight:600;letter-spacing:.2px}.cc-thumb{display:block;flex:none;overflow:hidden;border-radius:4px;background:var(--cc-tag-soft,#e8efec)}.cc-thumb img{display:block;width:100%;height:100%;object-fit:cover}.cc-thumb.row{width:52px;height:40px}.cc-thumb.wide{width:100%;height:104px;border-radius:3px}.cc-thumb.hero{width:100%;aspect-ratio:16/7;max-height:220px}.cc-thumb.placeholder{display:grid;place-items:center;background:linear-gradient(135deg,var(--cc-tag-soft,#e8efec),#fff);color:var(--cc-tag,#3a6245);font-family:Georgia,serif}.cc-thumb.placeholder span{font-size:16px;line-height:1}.cc-thumb.placeholder.hero span{font-size:34px}.cc-thumb.placeholder.wide span{font-size:26px}.cc-day.today .cc-day-number{background:var(--cc-teal);color:#fff;font-weight:700}.cc-day-marks{display:grid;gap:2px;margin-top:2px}.cc-span{display:block;min-width:0;height:4px;padding:0;border:0;border-radius:2px;background:var(--cc-tag,#43877b);opacity:.75}.cc-span:hover{opacity:1}.cc-span span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.cc-chip[data-color]{border-left-color:var(--cc-tag,#43877b);background:var(--cc-tag-soft,#eaf5f2);color:#26423d}.cc-chip.uncertain[data-color]{background:#fff3e1;border-left-color:#c1873c;color:#7a4d18}.cc-timeline{display:grid;gap:2px;padding-top:8px}.cc-tl-row{display:grid;grid-template-columns:118px 52px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:60px;padding:9px 8px;border:0;border-bottom:1px solid var(--cc-line);background:transparent;text-align:left}.cc-tl-row:hover,.cc-tl-row:focus-visible{background:#fff;box-shadow:inset 3px 0 var(--cc-tag,#43877b)}.cc-tl-date{display:grid;gap:1px;min-width:0}.cc-tl-date strong{font-size:12px;font-weight:650;font-variant-numeric:tabular-nums}.cc-tl-date small{color:var(--cc-muted);font-size:10px}.cc-tl-body{display:grid;gap:2px;min-width:0}.cc-tl-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:650}.cc-tl-body small{overflow:hidden;color:var(--cc-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}.cc-tl-row.unknown .cc-tl-title{color:#4b5b56}.cc-tl-row.past{opacity:.62}.cc-hover-card{position:fixed;z-index:60;width:264px;display:grid;gap:6px;padding:10px;border:1px solid var(--cc-line);border-radius:6px;background:#fff;box-shadow:var(--cc-shadow);pointer-events:none}.cc-hover-card strong{font-size:12px;line-height:1.4}.cc-hover-meta{color:var(--cc-muted);font-size:10px}.cc-hover-card p{margin:0;color:#526a67;font-size:11px;line-height:1.45}.cc-hover-more{color:#236d61;font-size:10px}.cc-suggest{margin-top:18px;padding:14px 16px;border:1px solid var(--cc-line);border-radius:6px;background:linear-gradient(180deg,#fbfdfc,#fff)}.cc-suggest-head h2{margin:0;font-size:15px;font-weight:650}.cc-suggest-head p{margin:3px 0 10px;color:var(--cc-muted);font-size:11px}.cc-suggest-list{display:grid;gap:8px}.cc-suggest-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;padding:9px 10px;border:1px solid #e4ebe8;border-radius:5px;background:#fff}.cc-suggest-body{display:grid;gap:2px;min-width:0}.cc-suggest-body strong{font-size:12px}.cc-suggest-body small{color:var(--cc-muted);font-size:11px;line-height:1.45}.cc-suggest-meta{color:#7d8b85!important;font-size:10px!important}.cc-suggest-row .cc-button{min-height:32px;padding:0 10px;font-size:11px;white-space:nowrap}.cc-node-distance{margin-left:6px;color:#236d61;font-size:10px}.cc-node-empty{margin:0;color:var(--cc-muted);font-size:11px}.cc-source-image{margin-left:8px;font-size:11px}\n@media(max-width:1100px){.cc-shell{grid-template-columns:180px minmax(0,1fr)}.cc-main{padding-right:18px;padding-left:18px}.cc-calendar-layout{grid-template-columns:minmax(0,1fr) 210px;gap:12px}.cc-agenda{padding-left:11px}.cc-filters{grid-template-columns:repeat(3,minmax(100px,1fr))}.cc-grid{grid-auto-rows:minmax(70px,1fr)}}\n@media(max-width:760px){.cc-tl-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"date conf" "body body";row-gap:4px}.cc-tl-date{grid-area:date}.cc-tl-row>.cc-thumb{display:none}.cc-tl-body{grid-area:body}.cc-tl-row>.cc-confidence{grid-area:conf}.cc-suggest{padding:12px}.cc-suggest-row{grid-template-columns:minmax(0,1fr) auto}.cc-suggest-row>.cc-tag{display:none}.cc-hover-card{display:none}.cc-shell{min-height:100%;height:auto;grid-template-columns:1fr;overflow:visible}.cc-sidebar{position:sticky;top:0;z-index:20;min-height:0;height:auto;display:flex;flex-direction:row;align-items:center;justify-content:space-between;padding:8px 12px}.cc-brand{padding:0}.cc-brand-mark{width:30px;height:30px}.cc-brand small,.cc-sidebar-foot{display:none}.cc-side-nav{display:flex;gap:4px}.cc-side-nav button{width:42px;height:42px;justify-content:center;padding:0}.cc-side-nav button span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.cc-main{padding:0 12px 24px}.cc-topbar{min-height:68px}.cc-eyebrow{font-size:8px}.cc-topbar h1{font-size:17px}.cc-top-actions{gap:5px}.cc-top-actions .cc-button{min-height:38px;padding:0 8px;font-size:11px}.cc-month-head{padding:15px 0 11px}.cc-month-head h2{font-size:17px}.cc-month-head p{font-size:10px}.cc-toolbar{gap:6px}.cc-search{flex-basis:100%;max-width:none}.cc-toolbar>.cc-toggle{display:none}.cc-toolbar>.cc-button{flex:1}.cc-segment{flex:1}.cc-segment button{flex:1;min-height:38px}.cc-mobile-suitable{display:flex;padding:8px 0}.cc-filters.expanded{grid-template-columns:repeat(2,minmax(0,1fr))}.cc-calendar-layout{grid-template-columns:1fr;padding-top:4px}.cc-grid{grid-auto-rows:minmax(61px,1fr)}.cc-day{padding:2px}.cc-day-number{width:32px;height:32px}.cc-chip{font-size:9px;padding:2px}.cc-agenda{padding:12px 0 0;border-left:0;border-top:1px solid var(--cc-line)}.cc-agenda-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 12px}.cc-agenda-row{padding:9px 4px}.cc-list-row{grid-template-columns:62px 48px minmax(0,1fr);gap:6px}.cc-list-row .cc-confidence{grid-column:3;grid-row:2}.cc-list-row>span:last-child{display:none}.cc-profile-form{grid-template-columns:1fr}.cc-section{padding:12px}.cc-section-head{align-items:flex-start;flex-direction:column}.cc-row-actions{width:100%;flex-wrap:wrap}.cc-data-row{grid-template-columns:44px minmax(0,1fr) 70px 38px}.cc-dialog{padding:16px}.cc-detail-grid{grid-template-columns:78px 1fr}.cc-editor-row,.cc-editor-section{grid-template-columns:1fr}.cc-conversation-hint{grid-template-columns:1fr}.cc-conversation-hint .cc-button{width:100%}.cc-topbar .cc-button.primary svg{display:none}}\n@media(prefers-color-scheme:dark){.cc-hover-card,.cc-suggest,.cc-tl-row:hover,.cc-tl-row:focus-visible,.cc-suggest-row{background:#243330;color:var(--cc-ink);border-color:var(--cc-line)}.cc-suggest{background:#1e2b28}.cc-thumb.placeholder{background:linear-gradient(135deg,#2a3a36,#202d2a)}.cc-chip[data-color]{color:#dbe8e4}.cc-shell{--cc-ink:var(--cc-on-paper-dark);--cc-muted:var(--cc-muted-dark);--cc-line:var(--cc-line-dark);--cc-paper:var(--cc-paper-dark);--cc-white:#26322e;--cc-green:#4bb49f;--cc-green-soft:#25453d;--cc-teal:#60ccb5;--cc-amber:#e2b76d;--cc-amber-soft:#473921;--cc-red:#ff9589;color-scheme:dark}.cc-sidebar{background:#101a18;color:#e6efec}.cc-side-nav button{color:#c2d0cc}.cc-side-nav button:hover,.cc-side-nav button.active{background:#283d38}.cc-profile-banner,.cc-section,.cc-day,.cc-search,.cc-segment,.cc-button,.cc-icon-button,.cc-editor-section{background:#202d2a;color:var(--cc-ink);border-color:var(--cc-line)}.cc-day.outside{background:#1b2825}.cc-chip{background:#1e4039;color:#c9ece4;border-left-color:var(--cc-teal)}.cc-chip.uncertain{background:#41341f;color:#f2d7a4;border-left-color:var(--cc-amber)}.cc-confidence{color:#c6d6d0;border-color:#485b54}.cc-confidence.uncertain{background:#43351e;color:#f2d59a}.cc-confidence.demo{background:#234038;color:#c9e6dc}.cc-category{background:#25463e;color:#d3ece4}.cc-category.certificate{background:#2d4149;color:#d4e7ee}.cc-editor-section{background:#1c2a26}.cc-conversation-hint{background:linear-gradient(110deg,#1d3933,#202d2a);border-color:#3c6e62}.cc-conversation-hint p{color:#c0d4cd}.cc-conversation-hint code{color:#82dec9}.cc-notice{background:#1f3c34;color:#bde7dc;border-color:#3d7164}.cc-alert{background:#472925;color:#ffd5ce;border-color:#78443d}}\n@media(prefers-reduced-motion:reduce){.cc-shell *, .cc-shell *::before,.cc-shell *::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}.cc-shell button:active{transform:none}}\n.cc-coverage-hint{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:0 0 14px;padding:12px 14px;border:1px solid #d9b26a;border-radius:12px;background:var(--cc-amber-soft);color:var(--cc-ink)}\n.cc-coverage-hint strong{display:block;font-size:13px}\n.cc-coverage-hint p{margin:3px 0 0;font-size:12px;line-height:1.5;color:var(--cc-muted);max-width:64ch}\n.cc-suggest-typical{display:block;margin-top:4px;font-size:12px;color:var(--cc-amber)}\n@media(prefers-color-scheme:dark){.cc-coverage-hint{background:#41341f;border-color:#7a6234;color:#f6e6c8}.cc-coverage-hint p{color:#e2cfa8}.cc-suggest-typical{color:var(--cc-amber)}}\n\n/* ---------------------------------------------------------------\n   月历格分级底色（迁移自 calendar-events-plugin.html 的 l1–l4 配色）\n   规则：一格被若干事项的窗口覆盖时，取其中最紧急那一个的等级染色。\n   l1 一般（有事项）→ l2 需准备/考试 → l3 比赛日 → l4 报名截止（最深）\n   颜色只作底纹，字号与文字色不变，避免阅读负担。\n   --------------------------------------------------------------- */\n:root{--cc-l1:#eef4fb;--cc-l2:#cfe1f5;--cc-l3:#f6d9b6;--cc-l4:#f3b6a8;--cc-l4-ink:#7c2318;--cc-day-hover:rgba(29,36,48,.06)}\n.cc-day{background:#fff}\n.cc-calendar-layout{grid-template-columns:minmax(0,1fr) 286px;gap:22px;align-items:start}.cc-calendar{background:#fff;border:1px solid var(--cc-line);border-radius:6px;padding:12px}.cc-calendar-legend{display:flex;justify-content:flex-end;gap:12px;margin-bottom:9px}.cc-calendar-legend span{display:flex;align-items:center;gap:5px;color:var(--cc-muted);font-size:10px}.cc-calendar-legend span:before{content:"";width:9px;height:9px;border-radius:2px;background:var(--cc-l1)}.cc-calendar-legend [data-level="2"]:before{background:var(--cc-l2)}.cc-calendar-legend [data-level="3"]:before{background:var(--cc-l3)}.cc-calendar-legend [data-level="4"]:before{background:var(--cc-l4)}\n.cc-day{position:relative}.cc-day-add{position:absolute;top:5px;right:5px;width:22px;height:22px;display:grid;place-items:center;border:1px solid transparent;border-radius:50%;background:transparent;color:var(--cc-muted);opacity:0;font-size:16px;line-height:1}.cc-day:hover .cc-day-add,.cc-day:focus-within .cc-day-add{opacity:1}.cc-day-add:hover{background:#fff;border-color:var(--cc-line);color:var(--cc-green)}\n.cc-agenda{border-left:1px solid var(--cc-line);padding-left:18px}.cc-agenda-head{align-items:center}.cc-agenda-row{display:flex;align-items:stretch;gap:2px;border-bottom:1px solid var(--cc-line)}.cc-agenda-open{flex:1;min-width:0;display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:9px 4px;border:0;background:transparent;text-align:left}.cc-agenda-open time{grid-column:1/-1;color:var(--cc-muted);font-size:11px}.cc-agenda-open strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cc-agenda-open .cc-confidence{align-self:center;font-size:10px}.cc-memo-delete{align-self:center;width:28px;height:28px;border:0;background:transparent;color:var(--cc-muted);font-size:18px}.cc-memo-delete:hover{color:var(--cc-red)}.cc-confidence.memo{background:#edf2fb;color:#49648b}\n.cc-memo-modal-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:18px;background:rgba(14,25,31,.36)}.cc-memo-modal{width:min(430px,100%);padding:18px;background:var(--cc-white);border:1px solid var(--cc-line);border-radius:6px;box-shadow:var(--cc-shadow)}.cc-memo-form{display:grid;gap:12px}.cc-memo-form-head,.cc-memo-form-actions{display:flex;align-items:center;gap:8px}.cc-memo-form-head{justify-content:space-between}.cc-memo-form label{display:grid;gap:4px;color:var(--cc-muted);font-size:11px}.cc-memo-form input,.cc-memo-form select,.cc-memo-form textarea{width:100%;min-height:38px;padding:7px 9px;border:1px solid var(--cc-line);border-radius:4px;background:var(--cc-white);color:var(--cc-ink)}.cc-memo-form textarea{resize:vertical}.cc-memo-form-actions{justify-content:flex-end}.cc-memo-form-actions .danger{margin-right:auto;color:var(--cc-red)}\n.cc-event-form{display:grid;gap:9px;margin-top:12px;padding:12px;border:1px solid var(--cc-line);border-radius:5px;background:var(--cc-white)}.cc-event-form-head,.cc-event-form-actions{display:flex;align-items:center;gap:8px}.cc-event-form-head{justify-content:space-between}.cc-event-form-head strong{font-size:12px}.cc-event-form label{display:grid;gap:3px;color:var(--cc-muted);font-size:10px}.cc-event-form input,.cc-event-form select,.cc-event-form textarea{width:100%;min-width:0;min-height:34px;padding:6px 8px;border:1px solid var(--cc-line);border-radius:4px;background:var(--cc-white);color:var(--cc-ink);font-size:12px}.cc-event-form textarea{resize:vertical}.cc-event-form-actions{justify-content:flex-end}.cc-event-form-actions .cc-button{min-height:34px;padding:0 10px;font-size:11px}.cc-event-description{grid-column:1/-1}.cc-event-form .cc-inline-error{margin:0;color:var(--cc-red);font-size:11px}\n@media(max-width:1100px){.cc-calendar-layout{grid-template-columns:minmax(0,1fr) 238px;gap:12px}}\n@media(max-width:760px){.cc-calendar{padding:5px}.cc-calendar-layout{grid-template-columns:1fr;gap:8px}.cc-agenda{padding:12px 0 0;border-left:0;border-top:1px solid var(--cc-line)}.cc-day-add{opacity:1;width:18px;height:18px;top:2px;right:2px}.cc-memo-modal-backdrop{align-items:end;padding:0}.cc-memo-modal{width:100%;border-radius:8px 8px 0 0;padding:16px 16px max(16px,env(safe-area-inset-bottom))}.cc-event-form{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px;padding:10px}.cc-event-form-head,.cc-event-description,.cc-event-form-actions,.cc-event-form>.cc-inline-error{grid-column:1/-1}.cc-event-form input,.cc-event-form select{min-height:38px}}\n.cc-day[data-level="1"]{background:var(--cc-l1)}\n.cc-day[data-level="2"]{background:var(--cc-l2);border-color:#a9c8e6}\n.cc-day[data-level="3"]{background:var(--cc-l3);border-color:#e0bb8a}\n.cc-day[data-level="4"]{background:var(--cc-l4);border-color:#e09a8a;color:var(--cc-l4-ink)}\n.cc-day[data-level="4"] .cc-day-number:hover{background:rgba(255,255,255,.55)}\n/* 选中态在白底和彩底上都要能看见，所以用内描边而不是换底色 */\n.cc-day.chosen{box-shadow:inset 0 0 0 2px #63a596}\n.cc-day[data-level] .cc-day-number{color:inherit}\n/* 彩底格里的半透明小块代替纯白块，避免把底纹切碎 */\n.cc-day[data-level] .cc-chip{background:rgba(255,255,255,.72)}\n.cc-day[data-level] .cc-chip.uncertain{background:rgba(255,246,231,.85)}\n.cc-day[data-level] .cc-span{opacity:.9}\n@media(prefers-color-scheme:dark){\n  :root{--cc-l1:#22303c;--cc-l2:#2b4258;--cc-l3:#4a3a24;--cc-l4:#5b2f28;--cc-l4-ink:#ffe2d9;--cc-day-hover:rgba(255,255,255,.08)}\n  .cc-calendar-tools{display:flex;justify-content:flex-end;margin:8px 0}\n  .cc-day[data-level="1"]{background:var(--cc-l1)}\n  .cc-day[data-level="2"]{background:var(--cc-l2);border-color:#3d5a74}\n  .cc-day[data-level="3"]{background:var(--cc-l3);border-color:#6d5433}\n  .cc-day[data-level="4"]{background:var(--cc-l4);border-color:#7d453b;color:var(--cc-l4-ink)}\n  .cc-day[data-level] .cc-chip{background:rgba(0,0,0,.28);color:var(--cc-ink)}\n  .cc-day[data-level] .cc-chip.uncertain{background:rgba(0,0,0,.34)}\n  .cc-day.chosen{box-shadow:inset 0 0 0 2px var(--cc-teal)}\n}\n';

// src/domain/model.js
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
function validUrl(value) {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
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
  let score = 0;
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
        score += weight;
        reasons.push(label);
      }
    } else if (selected && includesValue(accepted, selected)) {
      score += weight;
      reasons.push(label);
    }
  }
  return { score: Math.min(100, score), reasons };
}
function matchesDate(item, from, to) {
  if (!from && !to) return true;
  return (item.nodes ?? []).some((node) => {
    const { precision, from: start, to: end } = nodeWindow(node);
    if (precision === "unknown" || !start || !end) return false;
    return (!from || end >= from) && (!to || start <= to);
  });
}
function buildMonthIndex(items = [], month = /* @__PURE__ */ new Date()) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - (first.getDay() + 6) % 7);
  const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 41);
  const startKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endKey = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  const index = /* @__PURE__ */ new Map();
  const push = (key, item, node, edge) => {
    if (key < startKey || key > endKey) return;
    const rows = index.get(key) || [];
    if (rows.some((row) => row.item.id === item.id && row.node.id === node.id)) return;
    rows.push({ item, node, edge });
    index.set(key, rows);
  };
  for (const item of items ?? []) {
    for (const node of item.nodes ?? []) {
      const { precision, from, to } = nodeWindow(node);
      if (precision === "unknown" || precision === "year" || !from || !to) continue;
      if (from > endKey || to < startKey) continue;
      push(from, item, node, from === to ? null : "start");
      if (to !== from) push(to, item, node, "end");
    }
  }
  return index;
}
function filterItems(items, filters = {}, profile = {}) {
  const query = String(filters.query ?? "").trim().toLocaleLowerCase();
  return (items ?? []).filter((item) => {
    if (query && ![item.title, item.description, item.organizer, ...item.interests ?? [], ...item.majors ?? []].filter(Boolean).join(" ").toLocaleLowerCase().includes(query)) return false;
    if (filters.category && filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.major && filters.major !== "all" && !includesValue(item.majors, filters.major)) return false;
    if (filters.province && filters.province !== "all" && !includesValue(item.regions, filters.province)) return false;
    if (filters.status && filters.status !== "all" && item.registrationStatus !== filters.status) return false;
    if (!matchesDate(item, filters.from, filters.to)) return false;
    if (filters.onlySuitable && scoreFit(item, profile).score === 0) return false;
    return true;
  }).sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "zh-CN"));
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
  const text = String(note ?? "");
  if (!text) return null;
  const year = Number((text.match(/(20\d{2})\s*年/) || [])[1]) || null;
  const semesters = [[/上半年|春季|3\s*月|4\s*月|5\s*月|6\s*月/, 3], [/下半年|秋季|9\s*月|10\s*月|11\s*月|12\s*月/, 9]];
  const semester = semesters.find(([re]) => re.test(text));
  if (!semester && !year) return null;
  const base = year || (/* @__PURE__ */ new Date()).getFullYear();
  const month = semester ? semester[1] : 6;
  const key = `${base}-${String(month).padStart(2, "0")}-01`;
  return { key, text };
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
var WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
var majors = ["计算机科学", "软件工程", "电子信息", "机械工程", "自动化", "经济学", "管理学", "会计学", "法学", "英语", "医学", "设计学"];
var provinces = ["北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆"];
var directions = ["创新创业", "学术科研", "程序设计", "职业发展", "志愿服务", "艺术设计", "语言能力", "综合素质"];
function dateText(value) {
  return value ? `${Number(value.slice(5, 7))}月${Number(value.slice(8, 10))}日` : "日期未知";
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
    const text = windowText(entry.node || {});
    return next && distance ? `${text} · ${distanceText(next.offset)}` : text;
  }
  if (entry.kind === "expected") {
    const title = monthTitle(/* @__PURE__ */ new Date(`${entry.key}T00:00:00`));
    return expectedStyle === "timeline" ? `${title}前后（预计）` : `预计 ${title}`;
  }
  return expectedStyle === "timeline" ? "日期待公布" : "日期未知";
}
function api(path, options = {}) {
  return fetch(`${API}/${path}`, options).then(async (response) => {
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `请求失败 (${response.status})`);
    return response.headers.get("content-type")?.includes("text/calendar") ? response.blob() : response.json();
  });
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
function clampY(element) {
  const rect = typeof element?.getBoundingClientRect === "function" ? element.getBoundingClientRect() : null;
  const top = rect ? rect.top + (rect.height || 0) / 2 : 200;
  const height = typeof window !== "undefined" ? window.innerHeight || 760 : 760;
  return Math.max(12, Math.min(top, height - 220));
}
function Icon({ name }) {
  const paths = { calendar: "M7 2v4m10-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z", star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z", edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z", plus: "M12 5v14M5 12h14", back: "M19 12H5m7 7-7-7 7-7", forward: "M5 12h14m-7-7 7 7-7 7", close: "M18 6 6 18M6 6l12 12" };
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
  const [view, setView] = import_react2.default.useState("calendar");
  const [mode, setMode] = import_react2.default.useState("month");
  const [month, setMonth] = import_react2.default.useState(() => /* @__PURE__ */ new Date());
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
  const importRef = import_react2.default.useRef(null);
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
      if (!controller.signal.aborted && generation === requestRef.current.generation) setError(e.message);
    } finally {
      if (generation === requestRef.current.generation && !controller.signal.aborted) setLoading(false);
    }
  }, []);
  import_react2.default.useEffect(() => {
    load();
    return () => {
      requestRef.current.generation++;
      requestRef.current.controller?.abort();
    };
  }, [load]);
  import_react2.default.useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "hidden" || editing || Date.now() - lastFocusRefreshRef.current < 3e4) return;
      lastFocusRefreshRef.current = Date.now();
      load({ background: true });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [editing, load]);
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
  const filtersKey = JSON.stringify(filters);
  const filtered = import_react2.default.useMemo(() => filterItems(items, filters, profile), [items, profile, filtersKey]);
  const favoritesKey = (state?.favorites || []).join("\0");
  const visible = import_react2.default.useMemo(() => view === "favorites" ? filtered.filter((item) => state?.favorites?.includes(item.id)) : filtered, [filtered, view, favoritesKey]);
  const monthIndex = import_react2.default.useMemo(() => buildMonthIndex(visible, month), [visible, month.getFullYear(), month.getMonth()]);
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
      setNotice("已保存");
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
      setNotice("事项已保存");
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
      setNotice("备忘已保存");
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
      setState(await api(`memos/${encodeURIComponent(memo.id)}`, { method: "DELETE" }));
      setMemoDraft(null);
      setNotice("备忘已删除");
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
    if (!item.nodes?.some((node) => nodeDate(node))) return setNotice("该事项没有已知日期，暂不能设置提醒");
    const reminders = state.reminders.includes(item.id) ? state.reminders.filter((id) => id !== item.id) : [...state.reminders, item.id];
    await saveState({ ...state, reminders });
    setNotice("站内提醒偏好已保存；不会发送系统通知");
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
      setState(await api("import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed) }));
      setNotice("JSON 导入完成");
    } catch (e) {
      setError(e.message);
    }
  };
  const clearFilters = () => setFilters({ query: "", category: "all", major: "all", province: "all", status: "all", from: "", to: "", onlySuitable: false });
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
      h2("p", null, `共 ${coverage.total} 项，已锚定 ${coverage.percent}%。只到月份或年份也算数：让 Agent 按往年节奏补一轮，再按主办方公告校对。`)
    ),
    h2("button", { type: "button", className: "cc-button", disabled: asking, onClick: () => askAgent("plan") }, asking ? "正在准备…" : "让 Agent 补时间")
  ) : null;
  const askAgent = async (kind = "add", text = "") => {
    if (asking) return;
    if (!onAsk) {
      setAskError("当前 DSH 版本没有提供开新对话的接口，无法一键发起。");
      return;
    }
    setAsking(true);
    setAskError("");
    try {
      const draft = await api(`draft?kind=${encodeURIComponent(kind)}&text=${encodeURIComponent(text)}`);
      await onAsk(draft.prompt);
      setNotice("已在新对话里填好草稿，补充内容后发送即可");
    } catch (e) {
      setAskError(`没能开新对话：${e.message}`);
    } finally {
      setAsking(false);
    }
  };
  const navigation = h2("nav", { className: "cc-side-nav", "aria-label": "主导航" }, [
    ["calendar", "日历", "calendar"],
    ["favorites", "已收藏", "star"],
    ["manage", "数据维护", "edit"]
  ].map(([id, label, icon]) => h2("button", { key: id, className: view === id ? "active" : "", onClick: () => setView(id), "aria-current": view === id ? "page" : void 0 }, h2(Icon, { name: icon }), h2("span", null, label))));
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
    h2("div", { className: "cc-segment", role: "group", "aria-label": "视图模式" }, h2("button", { className: mode === "upcoming" ? "selected" : "", onClick: () => setMode("upcoming") }, "时间轴"), h2("button", { className: mode === "month" ? "selected" : "", onClick: () => setMode("month") }, "月历"), h2("button", { className: mode === "list" ? "selected" : "", onClick: () => setMode("list") }, "列表"))
  );
  const EDGE_LABELS = { registration: "起", registration_deadline: "止", competition: "起", exam: "起", submission: "起", result: "出" };
  const eventChip = (item, node, edge = null) => {
    const confidence = confidenceLabel(item, node);
    const uncertain = node.confidence === "predicted" || node.confidence === "pending_confirmation";
    const edgeText = edge === "end" ? "截止" : edge === "start" ? "开始" : "";
    return h2("button", {
      key: `${item.id}-${node.id}-${edge || "day"}`,
      className: `cc-chip ${uncertain ? "uncertain" : ""} ${item.demo ? "demo" : ""}`,
      "data-color": node.color || tagColor(item),
      "data-node": node.type,
      "data-edge": edge || void 0,
      onClick: () => setSelected(item),
      onFocus: (event) => setHover({ item, node, x: 260, y: clampY(event.currentTarget) }),
      onBlur: () => setHover(null),
      title: `${item.title} · ${NODE_LABELS[node.type] || node.type}${edgeText ? `（${edgeText}）` : ""} · ${confidence.label}`,
      "aria-label": `${item.title}，${NODE_LABELS[node.type] || node.type}，${nodeRangeText(node)}${edgeText ? `，${edgeText}` : ""}，${confidence.label}`
    }, edge && h2("span", { className: "cc-chip-edge", "aria-hidden": true }, EDGE_LABELS[node.type] && edge === "start" ? EDGE_LABELS[node.type] : edge === "end" ? "止" : ""), h2("span", { className: "cc-chip-text" }, item.title));
  };
  const levelOf = (node, edge) => edge === "end" ? 4 : { registration_deadline: 4, competition: 3, exam: 3, submission: 2 }[node?.type] || (node?.type === "registration" ? 2 : 1);
  const dayLevel = (indexedNodes) => indexedNodes.reduce((level, row) => Math.max(level, levelOf(row.node, row.edge)), 0);
  const cells = import_react2.default.useMemo(() => monthCells(month), [month.getFullYear(), month.getMonth()]);
  const calendar = import_react2.default.useMemo(() => h2(
    "section",
    { className: "cc-calendar", "aria-label": monthTitle(month) },
    h2("div", { className: "cc-calendar-legend", "aria-label": "日历等级" }, [["1", "一般"], ["2", "准备"], ["3", "重要"], ["4", "截止"]].map(([level, label]) => h2("span", { key: level, "data-level": level }, label))),
    h2("div", { className: "cc-weekdays" }, WEEKDAYS.map((name, index) => h2("span", { key: name, className: index > 4 ? "weekend" : "" }, name))),
    h2("div", { className: "cc-grid" }, cells.map((date) => {
      const iso = isoDate(date);
      const indexedNodes = monthIndex.get(iso) || [];
      const chips = monthChips(indexedNodes);
      const isToday = iso === today;
      const level = dayLevel(indexedNodes);
      return h2(
        "div",
        { key: iso, className: `cc-day ${date.getMonth() !== month.getMonth() ? "outside" : ""} ${selectedDate === iso ? "chosen" : ""} ${isToday ? "today" : ""}`, "data-level": level || void 0 },
        h2("button", { className: "cc-day-number", onClick: () => {
          setSelectedDate(iso);
          setMemoDraft(null);
          setEventDraft(null);
        }, "aria-pressed": selectedDate === iso, "aria-label": `${iso}，${chips.length} 项` }, date.getDate()),
        h2("button", { type: "button", className: "cc-day-add", "aria-label": `在 ${iso} 新增赛事或考试事项`, onClick: () => openCalendarEvent(iso) }, "+"),
        h2("div", { className: "cc-day-events" }, chips.slice(0, 3).map(({ item, node, edge }) => eventChip(item, node, edge)), chips.length > 3 ? h2("span", { className: "cc-more" }, `+${chips.length - 3} 项`) : null)
      );
    }))
  ), [cells, monthIndex, month, selectedDate, today]);
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
          h2("strong", null, item.title),
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
      h2("strong", null, item.title),
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
          h2("small", null, item.organizer || item.description || "未填写主办方")
        ),
        h2("span", { className: `cc-confidence ${item.demo || entry.kind !== "dated" ? "uncertain" : ""}` }, entry.label)
      );
    }) : h2("div", { className: "cc-empty small" }, "还没有安排。可以让 Agent 补几条，或自己新增。")
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
  const toolbarWithCalendar = view === "calendar" && mode === "month" ? h2("div", { className: "cc-month-head" }, h2("div", null, h2("h2", null, monthTitle(month)), profile.major && h2("p", null, profileSummary)), h2("div", { className: "cc-month-actions" }, h2("button", { className: "icon-button", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)), "aria-label": "上个月" }, h2(Icon, { name: "back" })), h2("button", { className: "cc-button", onClick: () => setMonth(/* @__PURE__ */ new Date()), "aria-label": "返回本月" }, "今天"), h2("button", { className: "icon-button", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)), "aria-label": "下个月" }, h2(Icon, { name: "forward" })))) : null;
  const resultView = h2(
    import_react2.default.Fragment,
    null,
    view === "calendar" && mode === "month" ? toolbarWithCalendar : null,
    view === "calendar" && mode === "month" ? h2(
      import_react2.default.Fragment,
      null,
      h2("div", { className: "cc-calendar-tools" }, h2("button", { type: "button", className: "cc-button", "aria-expanded": showTools, onClick: () => setShowTools(!showTools) }, showTools ? "收起工具" : "搜索与视图")),
      showTools && h2(import_react2.default.Fragment, null, toolbar, coverageHint, conversationHint),
      h2("div", { className: "cc-calendar-layout" }, calendar, agenda)
    ) : null,
    view !== "calendar" || mode !== "month" ? h2(
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
  const manage = view === "manage" ? h2(ManageView, { state, profile, busy, error, onSaveProfile: patchProfile, onEdit: (item) => setEditing(item || blankItem()), onImport: () => importRef.current?.click(), onExport: () => exportFile("json") }) : null;
  const detail = selected && h2(Detail, { item: selected, profile, favorite: state.favorites.includes(selected.id), reminder: state.reminders.includes(selected.id), onClose: () => setSelected(null), onFavorite: () => toggleFavorite(selected), onReminder: () => toggleReminder(selected), onEdit: () => {
    setEditing(selected);
    setSelected(null);
  } });
  const itemEditor = editing && h2(ItemEditor, { item: editing, busy, onClose: () => setEditing(null), onSave: saveItem, onDelete: async (item) => {
    if (!window.confirm(`删除“${item.title}”？此操作不能撤销。`)) return;
    try {
      setState(await api(`items/${encodeURIComponent(item.id)}`, { method: "DELETE" }));
      setEditing(null);
    } catch (e) {
      setError(e.message);
    }
  } });
  if (loading && !state) return h2("div", { className: "cc-shell cc-state", role: "status" }, "正在读取本地日历…");
  if (error && !state) return h2("div", { className: "cc-shell cc-state" }, h2("h1", null, "无法读取日历"), h2("p", null, error), h2("button", { className: "cc-button primary", onClick: load }, "重试"));
  return h2(
    "div",
    { className: "cc-shell" },
    h2("style", null, styles_default),
    h2("aside", { className: "cc-sidebar" }, h2("div", { className: "cc-brand" }, h2("span", { className: "cc-brand-mark" }, "C"), h2("span", null, h2("strong", null, "校历"), h2("small", null, "赛事与证书"))), navigation, h2("div", { className: "cc-sidebar-foot" }, h2("span", { className: "cc-local-dot" }), "本地数据 · 手动维护")),
    h2(
      "main",
      { className: "cc-main" },
      h2("header", { className: "cc-topbar" }, h2("div", null, h2("p", { className: "cc-eyebrow" }, "CAMPUS OPPORTUNITIES"), h2("h1", null, headerTitle)), h2("div", { className: "cc-top-actions" }, h2(StarButton, { className: "cc-button" }), h2("button", { className: "cc-button cc-refresh", onClick: () => load(), disabled: loading, "aria-label": loading ? "正在刷新日历" : "刷新日历", title: "刷新日历" }, h2("span", { "aria-hidden": true }, loading ? "…" : "↻")), h2("button", { className: "cc-button", onClick: () => exportFile("ics") }, "导出 ICS"), view !== "manage" && h2("button", { className: "cc-button primary", onClick: () => setEditing(blankItem()) }, h2(Icon, { name: "plus" }), "新增事项"))),
      error && h2("div", { className: "cc-alert", role: "alert" }, error, h2("button", { onClick: () => setError(""), "aria-label": "关闭提示" }, h2(Icon, { name: "close" }))),
      notice && h2("div", { className: "cc-notice", role: "status" }, notice, h2("button", { onClick: () => setNotice(""), "aria-label": "关闭提示" }, h2(Icon, { name: "close" }))),
      view === "manage" ? manage : h2(import_react2.default.Fragment, null, view === "calendar" && mode === "month" ? null : profileSetup, view === "calendar" && mode === "month" ? null : toolbar, view === "calendar" && mode === "month" ? null : conversationHint, resultView),
      memoDraft && h2("div", { className: "cc-memo-modal-backdrop", onClick: (event) => {
        if (event.target === event.currentTarget) setMemoDraft(null);
      } }, h2("div", { className: "cc-memo-modal", role: "dialog", "aria-modal": true, "aria-label": memoDraft.id ? "编辑备忘" : "新增备忘" }, memoForm)),
      h2("input", { ref: importRef, className: "sr-only", type: "file", accept: "application/json,.json", onChange: importFile }),
      hover && (mode !== "list" || view !== "calendar") ? hoverCard : null
    ),
    detail,
    itemEditor
  );
}
function ManageView({ state, profile, busy, error, onSaveProfile, onEdit, onImport, onExport }) {
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
    h2(
      "section",
      { className: "cc-section" },
      h2("div", { className: "cc-section-head" }, h2("div", null, h2("h2", null, "数据维护"), h2("p", null, "录入可追溯来源的数据，或备份本地 JSON。")), h2("div", { className: "cc-row-actions" }, h2("button", { className: "cc-button", onClick: onImport }, "导入 JSON"), h2("button", { className: "cc-button", onClick: onExport }, "导出 JSON"), h2("button", { className: "cc-button primary", onClick: () => onEdit(null) }, h2(Icon, { name: "plus" }), "新增事项"))),
      h2("div", { className: "cc-data-list" }, state.items.map((item) => h2("div", { className: "cc-data-row", key: item.id }, h2("span", { className: `cc-tag ${item.category}`, "data-color": tagColor(item) }, item.category === "competition" ? "赛事" : "证书"), h2("strong", null, item.title), h2("span", { className: "cc-confidence" }, confidenceLabel(item, item.nodes?.[0] || {}).label), h2("button", { className: "icon-button", "aria-label": `编辑${item.title}`, onClick: () => onEdit(item) }, h2(Icon, { name: "edit" }))))),
      h2("p", { className: "cc-data-disclaimer" }, "没有赛事 API 或自动抓取。真实记录须填写官方来源 URL 与最近核验日期；预测日期需说明依据。站内提醒不等于系统通知。")
    )
  );
}
function Detail({ item, profile, favorite, reminder, onClose, onFavorite, onReminder, onEdit }) {
  const fit = scoreFit(item, profile);
  const today = todayIso();
  const marks = item.nodes || [];
  return h2("div", { className: "cc-overlay", role: "presentation", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  } }, h2(
    "section",
    { className: "cc-dialog", role: "dialog", "aria-modal": true, "aria-labelledby": "cc-detail-title" },
    h2("div", { className: "cc-dialog-head" }, h2("span", { className: `cc-tag ${item.category}`, "data-color": tagColor(item) }, item.category === "competition" ? "赛事" : "证书"), h2("button", { className: "icon-button", onClick: onClose, "aria-label": "关闭详情" }, h2(Icon, { name: "close" })), h2("h2", { id: "cc-detail-title" }, item.title), item.demo && h2("p", { className: "cc-demo-notice" }, "这条是演示数据，不代表真实活动、近期报名或已核验安排")),
    h2(Thumb, { item, size: "hero" }),
    h2("div", { className: "cc-dialog-actions" }, h2("button", { className: "cc-button", onClick: onFavorite }, `${favorite ? "★" : "☆"} ${favorite ? "已收藏" : "收藏"}`), h2("button", { className: "cc-button", onClick: onReminder }, reminder ? "已设站内提醒" : "设置站内提醒"), h2("button", { className: "cc-button", onClick: onEdit }, "编辑")),
    h2("dl", { className: "cc-detail-grid" }, [["简介", item.description], ["适合人群", [...item.majors || [], ...item.years || [], ...item.interests || []].join("、") || item.eligibility], ["主办方", item.organizer], ["承办 / 账号", item.artist], ["地点", item.venue], ["报名条件", item.eligibility], ["适配度", `${fit.score}% · ${fit.reasons.join("、") || "暂无匹配信息"}`], ["报名状态", REGISTRATION_LABELS[item.registrationStatus] || "未知"], ["最近核验", item.verifiedAt || "未核验"], ["备注", item.notes]].map(([label, value]) => h2("div", { key: label }, h2("dt", null, label), h2("dd", null, value || "未提供")))),
    h2("section", { className: "cc-node-list" }, h2("h3", null, "关键节点"), marks.length ? marks.map((node) => {
      const confidence = confidenceLabel(item, node);
      const { from, to } = nodeWindow(node);
      const anchor = to && (node.type === "registration_deadline" || node.type === "submission") ? to : from || to;
      const offset = anchor ? dayDistance(today, anchor) : null;
      const rangeNote = from && to && from !== to && anchor === to ? "截止日" : "";
      return h2(
        "article",
        { key: node.id, "data-color": node.color || tagColor(item) },
        h2("div", null, h2("strong", null, NODE_LABELS[node.type] || node.type), h2("span", { className: `cc-confidence ${confidence.label === "预测" || confidence.label === "待确认" || confidence.label === "日期未知" ? "uncertain" : ""}` }, confidence.label)),
        h2("p", null, nodeRangeText(node), offset !== null && offset !== void 0 ? h2("span", { className: "cc-node-distance" }, ` · ${rangeNote ? `${rangeNote} ` : ""}${distanceText(offset)}`) : null),
        h2("small", null, confidence.detail),
        node.color && h2("small", null, `标签色：${node.color}`)
      );
    }) : h2("p", { className: "cc-node-empty" }, "还没有节点。")),
    h2(
      "footer",
      { className: "cc-source" },
      h2("span", null, "官方来源"),
      item.sourceUrl && !item.demo ? h2("a", { href: item.sourceUrl, target: "_blank", rel: "noopener noreferrer" }, item.sourceUrl) : h2("span", null, item.demo ? "演示记录无官方来源" : "无来源 · 不得标记为已核验"),
      item.imageUrl && h2("span", { className: "cc-source-image" }, "宣传图：", h2("a", { href: item.imageUrl, target: "_blank", rel: "noopener noreferrer" }, "查看原图"))
    )
  ));
}
function ItemEditor({ item, busy, onClose, onSave, onDelete }) {
  const [draft, setDraft] = import_react2.default.useState(() => structuredClone(item));
  const [localError, setLocalError] = import_react2.default.useState("");
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const setNode = (index, key, value) => setDraft((current) => ({ ...current, nodes: current.nodes.map((entry, row) => row === index ? { ...entry, [key]: value } : entry) }));
  const addNode = () => setDraft((current) => ({ ...current, nodes: [...current.nodes, { id: crypto.randomUUID(), type: "other", start: null, end: null, confidence: "unknown", note: "" }] }));
  const removeNode = (index) => setDraft((current) => ({ ...current, nodes: current.nodes.filter((_, row) => row !== index) }));
  const nodes = draft.nodes?.length ? draft.nodes : [{ id: crypto.randomUUID(), type: "other", start: null, end: null, confidence: "unknown", note: "" }];
  const submit = (event) => {
    event.preventDefault();
    setLocalError("");
    if (!draft.title.trim()) return setLocalError("请填写事项名称。");
    if (!nodes.length) return setLocalError("至少保留一个关键节点。");
    if (nodes.some((entry) => entry.confidence === "official_confirmed") && (!draft.sourceUrl || !draft.verifiedAt)) return setLocalError("官方确认日期必须填写来源 URL 和最近核验日期。");
    if (nodes.some((entry) => entry.confidence === "predicted" && !entry.note?.trim())) return setLocalError("每个预测日期都必须说明推测依据。");
    if (draft.imageUrl && !/^https?:\/\//i.test(draft.imageUrl.trim())) return setLocalError("宣传图必须是 http 或 https 直链；没有就留空。");
    const next = { ...draft, title: draft.title.trim(), sourceUrl: draft.sourceUrl || "", verifiedAt: draft.verifiedAt || "", imageUrl: (draft.imageUrl || "").trim(), nodes: nodes.map((entry) => ({ ...entry, start: entry.start || null, end: entry.end || null })) };
    onSave(next);
  };
  const nodeTypeOptions = [["registration", "报名开始"], ["registration_deadline", "报名截止"], ["competition", "比赛日期"], ["exam", "考试日期"], ["submission", "材料提交"], ["result", "结果公布"], ["other", "其他"]];
  const confidenceOptions = [["unknown", "日期未知"], ["official_confirmed", "官方已确认"], ["predicted", "预测"], ["pending_confirmation", "待确认"]];
  const splitList = (text) => text.split(/[、,，]/).map((value) => value.trim()).filter(Boolean);
  return h2("div", { className: "cc-overlay", role: "presentation", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  } }, h2(
    "section",
    { className: "cc-dialog editor", role: "dialog", "aria-modal": true, "aria-labelledby": "cc-editor-title" },
    h2("div", { className: "cc-dialog-head" }, h2("button", { className: "icon-button", onClick: onClose, "aria-label": "关闭表单" }, h2(Icon, { name: "close" })), h2("h2", { id: "cc-editor-title" }, draft.id ? "编辑事项" : "新增事项")),
    h2(
      "form",
      { className: "cc-editor-form", onSubmit: submit },
      h2("fieldset", { className: "cc-editor-section" }, h2("legend", null, "基本信息"), h2("label", { className: "cc-field" }, h2("span", null, "事项名称 *"), h2("input", { required: true, maxLength: 200, value: draft.title, onChange: (event) => set("title", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "类别"), h2("select", { value: draft.category, onChange: (event) => set("category", event.target.value) }, h2("option", { value: "competition" }, "赛事"), h2("option", { value: "certificate" }, "证书考试"))), h2("label", { className: "cc-field" }, h2("span", null, "主办方"), h2("input", { value: draft.organizer || "", maxLength: 200, onChange: (event) => set("organizer", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "报名状态"), h2("select", { value: draft.registrationStatus || "unknown", onChange: (event) => set("registrationStatus", event.target.value) }, [["unknown", "未知"], ["not_open", "未开始"], ["open", "报名中"], ["closed", "已截止"]].map(([value, label]) => h2("option", { key: value, value }, label)))), h2("label", { className: "cc-field", style: { gridColumn: "1 / -1" } }, h2("span", null, "简介"), h2("textarea", { value: draft.description || "", maxLength: 2e3, rows: 2, onChange: (event) => set("description", event.target.value) }))),
      h2("fieldset", { className: "cc-editor-section" }, h2("legend", null, "适用范围"), h2("label", { className: "cc-field" }, h2("span", null, "适配专业（逗号分隔）"), h2("input", { value: (draft.majors || []).join("、"), onChange: (event) => set("majors", splitList(event.target.value)) })), h2("label", { className: "cc-field" }, h2("span", null, "适用年级（逗号分隔）"), h2("input", { value: (draft.years || []).join("、"), onChange: (event) => set("years", splitList(event.target.value)) })), h2("label", { className: "cc-field" }, h2("span", null, "关注方向（逗号分隔）"), h2("input", { value: (draft.interests || []).join("、"), onChange: (event) => set("interests", splitList(event.target.value)) })), h2("label", { className: "cc-field" }, h2("span", null, "适用地区（逗号分隔）"), h2("input", { value: (draft.regions || []).join("、"), onChange: (event) => set("regions", splitList(event.target.value)) })), h2("label", { className: "cc-field", style: { gridColumn: "1 / -1" } }, h2("span", null, "报名条件"), h2("textarea", { rows: 2, maxLength: 2e3, value: draft.eligibility || "", onChange: (event) => set("eligibility", event.target.value) }))),
      h2("fieldset", { className: "cc-editor-section" }, h2("legend", null, "来源与核验"), h2("label", { className: "cc-field" }, h2("span", null, "官方来源 URL"), h2("input", { type: "url", placeholder: "https://", value: draft.sourceUrl || "", onChange: (event) => set("sourceUrl", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "最近核验日期"), h2("input", { type: "date", value: draft.verifiedAt || "", onChange: (event) => set("verifiedAt", event.target.value) })), h2("p", { className: "cc-data-disclaimer", style: { gridColumn: "1 / -1" } }, "官方确认必须有具体日期、HTTP(S) 来源和最近核验日期；插件不会自动访问来源。")),
      h2("fieldset", { className: "cc-editor-section" }, h2("legend", null, "外观与地点"), h2("label", { className: "cc-field", style: { gridColumn: "1 / -1" } }, h2("span", null, "官方宣传图 URL"), h2("input", { type: "url", placeholder: "https://", value: draft.imageUrl || "", onChange: (event) => set("imageUrl", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "承办 / 官方账号"), h2("input", { maxLength: 120, value: draft.artist || "", onChange: (event) => set("artist", event.target.value) })), h2("label", { className: "cc-field" }, h2("span", null, "比赛或考试地点"), h2("input", { maxLength: 200, value: draft.venue || "", onChange: (event) => set("venue", event.target.value) })), h2("p", { className: "cc-data-disclaimer", style: { gridColumn: "1 / -1" } }, "宣传图只接受 http(s) 直链，插件不下载也不缓存；没有官方图就留空，会显示色块占位。")),
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