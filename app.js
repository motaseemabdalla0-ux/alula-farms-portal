/* منصة بيانات المزارع / Farms Data Platform — static build (GitHub Pages), password-protected, Arabic/English.
   Layout mirrors the Agriculture Center platform (agriculture.rcu.gov.sa): icon rail, top bar, KPI tiles, progress rows.
   Every data file is AES-256-GCM encrypted (key = PBKDF2-SHA256 of the password); nothing is readable without it.
   Hash routes: #/ #/map #/farms #/farm/CODE #/wells #/meters #/sources */
(() => {
  "use strict";
  const L_ = window.L; // Leaflet — its global is named L, which the translation helper below shadows

  // ------------------------------------------------------------ language
  let LANG = "ar";
  try { LANG = localStorage.getItem("lang") === "en" ? "en" : "ar"; } catch { /* storage blocked */ }
  const L = (ar, en) => (LANG === "en" ? en : ar);
  const DIR = () => (LANG === "en" ? "ltr" : "rtl");
  const NAME = "AlUla Expropriated Farms";
  const LOCALE = () => (LANG === "en" ? "en-GB" : "ar-SA-u-ca-gregory-nu-latn");

  // ------------------------------------------------------------ icons (lucide, MIT)
  const P = {
    dashboard: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    // electricity meters: lucide "plug-zap"
    meter: '<path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="m2 22 3-3"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m18 3-4 4h6l-4 4"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    palm: '<path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/><path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35"/><path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
    box: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/>',
    pie: '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    side: '<path d="m9 18 6-6-6-6"/>',
    measure: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 13.5 2 2"/><path d="m16.5 10.5 2 2"/>',
    home: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    sheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
    off: '<path d="M18.36 6.64A9 9 0 0 1 20.77 15"/><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"/><path d="M12 2v4"/><path d="m2 2 20 20"/>',
  };
  const ico = (n) => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
  const hydrate = (root = document) => root.querySelectorAll("[data-ico]").forEach((el) => {
    if (!el.querySelector("svg")) el.insertAdjacentHTML("afterbegin", ico(el.dataset.ico));
  });

  // ------------------------------------------------------------ crypto
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const ub64 = (u8) => btoa(String.fromCharCode(...u8));
  let KEY = null;
  async function deriveKey(password, meta) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64(meta.salt), iterations: meta.iter, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
  }
  async function decrypt(buf, key = KEY) {
    const u8 = new Uint8Array(buf);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: u8.slice(0, 12) }, key, u8.slice(12));
    return new TextDecoder().decode(plain);
  }

  // ------------------------------------------------------------ labels & formatting
  // Source values are English; in Arabic mode they are translated, in English mode shown as-is.
  const AR = {
    North: "الشمال", South: "الجنوب", Full: "مؤجرة بالكامل", Partial: "مؤجرة جزئياً", Mixed: "مختلطة", "Not Leased": "غير مؤجرة",
    High: "عالية", Mid: "متوسطة", Medium: "متوسطة", Low: "منخفضة", Expropriated: "منزوعة", "Not Expropriated": "غير منزوعة",
    Working: "يعمل", "Not working": "لا يعمل", Yes: "نعم", No: "لا",
  };
  const EN = { Full: "Fully leased", Partial: "Partially leased" };
  const t = (v) => {
    if (v === null || v === undefined || v === "") return "—";
    const s = String(v).trim();
    return LANG === "en" ? EN[s] ?? s : AR[s] ?? s;
  };
  // Source / layer titles are stored in Arabic by the export.
  const TITLE_EN = {
    "المخطط الرئيسي للمزارع المنزوعة V20": "Expropriated Farms Master Plan V20",
    "عدادات الكهرباء — المخطط الرئيسي": "Power meters — Master Plan",
    "تقرير إنتاج التمور 2026": "Date production report 2026",
    "تقرير إنتاج الشمال": "North production report",
    "تقرير إنتاج الجنوب": "South production report",
    "مزارع الواحة و COD — الحصر الميداني": "Oasis & COD farms — field survey",
    "مزارع الواحة و COD — خطة 3 سنوات": "Oasis & COD farms — 3-year plan",
    "عدادات الكهرباء — الواحة و COD": "Power meters — Oasis & COD",
    "دراسة التمور والحمضيات والمانجو": "Date, citrus & mango study",
    "عدادات الكهرباء — الدراسة المجمعة": "Power meters — combined study",
    "سجل الآبار حسب المزرعة": "Wells register by farm",
    "الآبار الجديدة (محدّث)": "New wells (updated)",
    "المزارع المؤجرة حسب العنقود": "Leased farms by cluster",
    "المزارع غير المؤجرة V3": "Not-leased farms V3",
    "حدود الدراسة والمصادر المجمعة": "Study boundaries & combined sources",
    "حدود المزارع — د. سيف": "Farm boundaries — Dr. Saif",
    "نقاط الآبار": "Well points",
    "حدود المعارض مع المزارع": "Galleries boundary with farms",
    "استخدام الأراضي DJI — فبراير 2024": "DJI land use — Feb 2024",
    "استخدام الأراضي — المحور 4 و 5": "Land use — Hubs 4 & 5",
    "استخدام الأراضي — WAF MUT": "Land use — WAF MUT",
    "حدود NPW": "NPW boundary",
    "القطع المقترحة — فبراير 2024": "Proposed plots — Feb 2024",
  };
  const tt = (s) => (LANG === "en" ? TITLE_EN[s] ?? s : s);
  const fmt = (v, d = 0) => {
    if (v === null || v === undefined || v === "") return "—";
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: d }) : String(v);
  };
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const esc = (v) => String(v ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // platform palette: green #2E7D32, brown #6D4C41, gold #B8860B/#DAA520
  const C = { green: "#2E7D32", brown: "#6D4C41", gold: "#DAA520", red: "#C62828", gray: "#9CA3AF" };
  const LEASE = { Full: C.green, Partial: C.gold, Mixed: "#E08E3C", "Not Leased": C.red };
  const QUALITY = { High: C.green, Medium: C.gold, Mid: C.gold, Low: C.red };
  const SIDE = { North: "#3A6EA5", South: C.brown };
  const NODATA = C.gray;
  const GRADE = [C.green, C.gold, C.brown];
  const tone = (v) => {
    const s = String(v || "").toLowerCase();
    if (["working", "full", "high", "yes"].includes(s)) return "primary";
    if (["not working", "not leased", "low"].includes(s)) return "danger";
    if (["partial", "mixed", "mid", "medium"].includes(s)) return "warn";
    return "";
  };
  const badge = (v, label) => (v ? `<span class="badge ${tone(v)}">${esc(label ?? t(v))}</span>` : "—");
  const farmLink = (c) => `<a class="link num" href="#/farm/${encodeURIComponent(c)}">${esc(c)}</a>`;
  const sum = (a, k) => a.reduce((s, x) => s + (Number(x[k]) || 0), 0);
  const U = { ha: () => L("هـ", "ha"), t: () => L("طن", "t"), farms: () => L("مزرعة", "farms") };

  // ------------------------------------------------------------ data
  const cache = {};
  const load = (name) => (cache[name] ??= fetch(`data/${name}.bin`)
    .then((r) => {
      if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
      return r.arrayBuffer();
    })
    .then((b) => decrypt(b))
    .then(JSON.parse));
  let FARMS = [];
  let BY_CODE = new Map();
  let BUILT = null;
  let STARTED = false;
  const scoped = (scope) => (scope === "all" ? FARMS : FARMS.filter((f) => f.in_plan));
  const bucket = (code) => {
    const prefix = (code.split("-")[0].replace(/[^A-Z0-9]/g, "_").slice(0, 12)) || "_";
    let s = 0;
    for (const ch of code) s += ch.codePointAt(0);
    return `${prefix}-${s % 8}`;
  };

  // ------------------------------------------------------------ router
  const app = document.getElementById("app");
  const PAGES = () => [
    ["/", "dashboard", L("لوحة المؤشرات", "Dashboard")], ["/map", "map", L("الخريطة", "Map")], ["/farms", "sprout", L("المزارع", "Farms")],
    ["/wells", "droplet", L("الآبار", "Wells")], ["/meters", "meter", L("العدادات", "Meters")],
  ];
  let cleanup = null;
  function parse() {
    const h = location.hash.replace(/^#/, "") || "/";
    const [path, qs] = h.split("?");
    return { path, params: Object.fromEntries(new URLSearchParams(qs || "")) };
  }
  const href = (path, params) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") p.set(k, v);
    const s = p.toString();
    return `#${path}${s ? "?" + s : ""}`;
  };
  async function route() {
    cleanup?.();
    cleanup = null;
    const { path, params } = parse();
    const active = PAGES().find(([p]) => (p === "/" ? path === "/" : path.startsWith(p) || (p === "/farms" && path.startsWith("/farm/"))));
    document.querySelectorAll("#nav a, #mnav a").forEach((a) => a.classList.toggle("on", !!active && a.getAttribute("href") === `#${active[0]}`));
    document.getElementById("tb-page").textContent = active ? active[2] : NAME;
    window.scrollTo(0, 0);
    try {
      if (path === "/") dashboard(params);
      else if (path === "/map") await mapPage(params);
      else if (path === "/farms") farmsPage(params);
      else if (path.startsWith("/farm/")) await farmPage(decodeURIComponent(path.slice(6)));
      else if (path === "/wells") await wellsPage(params);
      else if (path === "/meters") await metersPage(params);
      else app.innerHTML = `<p class="muted">${L("الصفحة غير موجودة.", "Page not found.")}</p>`;
    } catch (e) {
      app.innerHTML = `<div class="card"><b>${L("تعذّر التحميل", "Could not load")}</b><p class="muted">${esc(e.message)}</p></div>`;
    }
  }
  // <select data-nav> navigates to the selected option's value (used for the scope picker)
  document.addEventListener("change", (e) => {
    if (e.target.matches("select[data-nav]")) location.hash = e.target.value;
  });

  // ------------------------------------------------------------ shared UI (platform components)
  const kpi = (icon, label, value, sub = "", opt = {}) =>
    `<div class="kpi ${opt.tint || ""}"><div class="kl">${ico(icon)}<span>${label}</span></div><div class="kv ${opt.cls || ""}">${value}</div>${sub ? `<div class="ks ${opt.subCls || ""}">${sub}</div>` : ""}</div>`;
  const card = (icon, title, body, opt = {}) =>
    `<section class="card ${opt.span || "c12"}"><div class="sec-h"><h2>${ico(icon)}${title}</h2>${opt.action || ""}</div>${body}</section>`;
  const head = (title, sub = "", tools = "") => `<div class="head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${tools ? `<div class="tools">${tools}</div>` : ""}</div>`;
  const scopePick = (scope, path, params = {}) =>
    `<label class="pick"><span>${L("النطاق:", "Scope:")}</span><select data-nav aria-label="${L("النطاق", "Scope")}"><option value="${href(path, { ...params, scope: undefined })}" ${scope !== "all" ? "selected" : ""}>${L("المزارع المنزوعة", "Expropriated farms")}</option><option value="${href(path, { ...params, scope: "all" })}" ${scope === "all" ? "selected" : ""}>${L("كل المزارع (سجل الآبار)", "All farms (wells register)")}</option></select></label>`;
  function prow(label, value, segs, max) {
    const m = max || segs.reduce((s, x) => s + x.v, 0) || 1;
    return `<div class="prow"><div class="pl"><span>${esc(label)}</span><b>${value}</b></div><div class="ptrack">${segs
      .map((x) => `<span style="width:${Math.max(0, (x.v / m) * 100)}%;background:${x.c}" title="${esc(x.t || "")}"></span>`).join("")}</div></div>`;
  }
  const legend = (items) => `<div class="legend">${items.map(([l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join("")}</div>`;
  const ring = (p, color, label) =>
    `<div class="ring"><div class="r" style="background:conic-gradient(${color} ${p * 3.6}deg, var(--track) 0)"><b class="num">${fmt(p, 1)}%</b></div><span>${label}</span></div>`;
  function donut(items) {
    const total = items.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    const stops = items.map((x) => {
      const a = (acc / total) * 360;
      acc += x.value;
      return `${x.color} ${a}deg ${(acc / total) * 360}deg`;
    });
    return `<div class="donut"><div class="r" style="background:conic-gradient(${stops.join(",")})"><b class="num">${fmt(total)}<small>${U.farms()}</small></b></div><ul>${items
      .map((x) => `<li><span class="sw" style="background:${x.color}"></span><span>${esc(x.name)}</span><b class="num">${fmt(x.value)}</b><span class="muted num" style="width:38px;text-align:end;font-size:12px">${Math.round((x.value / total) * 100)}%</span></li>`)
      .join("")}</ul></div>`;
  }
  const groupBy = (arr, fn) => {
    const m = new Map();
    for (const x of arr) {
      const k = fn(x);
      m.set(k, [...(m.get(k) || []), x]);
    }
    return m;
  };
  const activeOf = (a, n) => L(`${fmt(a)} نشطة / ${fmt(n)}`, `${fmt(a)} active / ${fmt(n)}`);
  const GRADES = () => [L("درجة أولى", "Grade 1"), L("درجة ثانية", "Grade 2"), L("درجة ثالثة (شيص)", "Grade 3 (Shees)")];

  // ------------------------------------------------------------ interactivity helpers
  // Any element with data-go="#/route?…" navigates on click (dashboard drill-downs, map summary rows).
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-go]");
    if (el) location.hash = el.dataset.go;
  });
  const go = (path, params) => `data-go="${esc(href(path, params))}"`;
  const multi = (v) => (v ? String(v).split(",").filter(Boolean) : []);
  const SEL = new Set(); // farm codes selected for export (kept across filters/pages)

  // ------------------------------------------------------------ dashboard
  function dashboard(params) {
    const scope = params.scope === "all" ? "all" : "plan";
    const base = scoped(scope);
    const F = base.filter((f) => (!params.side || f.side === params.side) && (!params.region || f.region === params.region));
    const prod = F.filter((f) => f.prod_total != null);
    const T = {
      area: sum(F, "area_ha"), palms: sum(F, "date_trees"), prod: sum(prod, "prod_total"), g1: sum(prod, "prod_g1"), g2: sum(prod, "prod_g2"), g3: sum(prod, "prod_g3"),
      wells: sum(F, "wells_total"), wa: sum(F, "wells_active"), wi: sum(F, "wells_inactive"), meters: sum(F, "meters_total"), mw: sum(F, "meters_working"), mn: sum(F, "meters_not_working"),
      mapped: F.filter((f) => f.geometry_source).length,
    };
    // every drill-down keeps the dashboard's own filters
    const keep = { scope: params.scope, side: params.side, region: params.region };
    const sides = [...groupBy(prod, (f) => f.side || "")].map(([s, a]) => ({ s, g1: sum(a, "prod_g1"), g2: sum(a, "prod_g2"), g3: sum(a, "prod_g3"), n: a.length }));
    const sideMax = Math.max(...sides.map((x) => x.g1 + x.g2 + x.g3), 1e-9);
    const quality = [...groupBy(prod, (f) => f.prod_quality || "")].map(([q, a]) => ({
      key: q, name: q ? t(q) : L("غير مصنفة (أغلبها الشمال)", "Unclassified (mostly North)"), value: a.length, color: QUALITY[q] || NODATA,
    })).sort((a, b) => b.value - a.value);
    const lease = [...groupBy(F, (f) => f.lease_status || "")].map(([l, a]) => ({
      key: l, name: l ? t(l) : L("غير محدد", "Not specified"), value: a.length, color: LEASE[l] || NODATA,
    })).sort((a, b) => b.value - a.value);
    const regions = [...groupBy(F, (f) => f.region || "")]
      .map(([r, a]) => ({ r, a: sum(a, "wells_active"), i: sum(a, "wells_inactive") }))
      .filter((x) => x.a + x.i > 0).sort((x, y) => (y.a + y.i) - (x.a + x.i)).slice(0, 10);
    const regMax = Math.max(...regions.map((x) => x.a + x.i), 1);
    const top = [...prod].sort((a, b) => b.prod_total - a.prod_total).slice(0, 10);
    const G = GRADES();
    const opt = (k) => [...new Set(base.map((f) => f[k]).filter(Boolean))].sort();
    const dpick = (key, label, values) => `<label class="pick"><span>${label}</span><select data-nav aria-label="${label}"><option value="${href("/", { ...keep, [key]: undefined })}">${L("الكل", "All")}</option>${values
      .map((v) => `<option value="${href("/", { ...keep, [key]: v })}" ${params[key] === v ? "selected" : ""}>${esc(t(v))}</option>`).join("")}</select></label>`;

    app.innerHTML = `
      ${head(L("لوحة مؤشرات المزارع", "Farms Dashboard"), L("المزارع المنزوعة في العلا: الخرائط، الآبار، العدادات، إنتاج التمور — انقر على أي رقم أو شريط لعرض تفاصيله", "AlUla expropriated farms — click any figure or bar to drill down"),
        `<div class="dfilters">${scopePick(scope, "/", { side: params.side, region: params.region })}${opt("side").length ? dpick("side", L("الجهة:", "Side:"), opt("side")) : ""}${dpick("region", L("المنطقة:", "Region:"), opt("region"))}${params.side || params.region ? `<button class="clear" ${go("/", { scope: params.scope })}>${L("مسح", "Clear")}</button>` : ""}</div>`)}
      <div class="kpis k6">
        <div class="kpi green clickable" ${go("/farms", keep)}><div class="kl">${ico("sprout")}<span>${L("عدد المزارع", "Farms")}</span></div><div class="kv t-primary">${fmt(F.length)}</div><div class="ks t-primary">${L(`${fmt(T.mapped)} لها حدود على الخريطة`, `${fmt(T.mapped)} mapped`)}</div></div>
        <div class="kpi clickable" ${go("/farms", { ...keep, sort: "area_ha", dir: "desc" })}><div class="kl">${ico("ruler")}<span>${L("المساحة الإجمالية", "Total area")}</span></div><div class="kv">${fmt(T.area, 1)} <small>${U.ha()}</small></div><div class="ks">${L("هكتار", "hectares")}</div></div>
        <div class="kpi clickable" ${go("/farms", { ...keep, sort: "date_trees", dir: "desc" })}><div class="kl">${ico("palm")}<span>${L("أشجار النخيل", "Date palms")}</span></div><div class="kv">${fmt(T.palms)}</div><div class="ks">${F.length ? L(`${fmt(T.palms / F.length)} نخلة / مزرعة`, `${fmt(T.palms / F.length)} palms / farm`) : ""}</div></div>
        <div class="kpi beige clickable" ${go("/farms", { ...keep, has: "production", sort: "prod_total", dir: "desc" })}><div class="kl">${ico("box")}<span>${L("إنتاج التمور 2026", "Date production 2026")}</span></div><div class="kv t-brown">${fmt(T.prod, 1)} <small>${U.t()}</small></div><div class="ks">${L(`من ${fmt(prod.length)} مزرعة`, `from ${fmt(prod.length)} farms`)}</div></div>
        <div class="kpi clickable" ${go("/wells", { scope: params.scope })}><div class="kl">${ico("droplet")}<span>${L("الآبار", "Wells")}</span></div><div class="kv">${fmt(T.wells)}</div><div class="ks ${T.wi ? "t-danger" : ""}">${L(`${fmt(T.wa)} نشطة · ${fmt(T.wi)} متوقفة`, `${fmt(T.wa)} active · ${fmt(T.wi)} inactive`)}</div></div>
        <div class="kpi clickable" ${go("/meters", {})}><div class="kl">${ico("meter")}<span>${L("عدادات الكهرباء", "Power meters")}</span></div><div class="kv">${fmt(T.meters)}</div><div class="ks t-primary">${L(`${fmt(T.mw)} تعمل · ${fmt(T.mn)} لا تعمل`, `${fmt(T.mw)} working · ${fmt(T.mn)} not working`)}</div></div>
      </div>
      <div class="grid12">
        ${card("trend", L("إنتاج التمور حسب الدرجة (طن)", "Date production by grade (t)"), prod.length ? `
          <div class="grid12" style="margin:0">
            <div class="c6"><div class="sub-h">${L("حسب الجهة", "By side")}</div>
              ${sides.map((x) => clickRow(prow(`${x.s ? t(x.s) : L("غير محدد", "Not specified")} (${fmt(x.n)} ${U.farms()})`, `${fmt(x.g1 + x.g2 + x.g3, 1)} ${U.t()}`, [{ v: x.g1, c: GRADE[0], t: G[0] }, { v: x.g2, c: GRADE[1], t: G[1] }, { v: x.g3, c: GRADE[2], t: G[2] }], sideMax), x.s ? href("/", { ...keep, side: x.s }) : null)).join("")}
              ${legend(G.map((g, i) => [g, GRADE[i]]))}
            </div>
            <div class="c6"><div class="sub-h">${L("حسب الدرجة", "By grade")}</div>
              ${[[L("درجة أولى — جودة عالية", "Grade 1 — high quality"), T.g1, "High"], [L("درجة ثانية — متوسطة", "Grade 2 — medium"), T.g2, "Medium"], [L("درجة ثالثة — شيص", "Grade 3 — Shees (low)"), T.g3, "Low"]]
                .map(([lab, v, q], i) => clickRow(prow(lab, `${fmt(v, 1)} / ${fmt(T.prod, 1)}`, [{ v, c: GRADE[i] }], T.prod), href("/farms", { ...keep, quality: q }))).join("")}
            </div>
          </div>` : `<p class="muted">${L("لا توجد بيانات إنتاج لهذا النطاق.", "No production data for this scope.")}</p>`, { span: "c7" })}
        ${card("gauge", L("مؤشرات التشغيل", "Operational indicators"), `<div class="rings">
            <div class="ring clickable" ${go("/meters", { status: "Working" })}>${ringInner(pct(T.mw, T.meters), C.green, L("عدادات تعمل", "Meters working"))}</div>
            <div class="ring clickable" ${go("/wells", { scope: params.scope })}>${ringInner(pct(T.wa, T.wells), C.brown, L("آبار نشطة", "Wells active"))}</div>
            <div class="ring clickable" ${go("/map", { scope: params.scope })}>${ringInner(pct(T.mapped, F.length), C.gold, L("مزارع لها حدود", "Farms mapped"))}</div>
          </div>
          <div class="strip" style="margin-top:16px"><div class="clickable" ${go("/farms", { ...keep, has: "production" })}><b class="num">${fmt(prod.length)}</b><span>${L("مزارع لها إنتاج", "Producing farms")}</span></div><div><b class="num">${fmt(T.palms ? (T.prod * 1000) / T.palms : 0, 1)}</b><span>${L("كجم / نخلة", "kg / palm")}</span></div><div class="clickable" ${go("/farms", { ...keep, deserted: "Yes" })}><b class="num">${fmt(F.filter((f) => f.deserted === "Yes").length)}</b><span>${L("مرشحة للترك", "To be deserted")}</span></div></div>`, { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("droplet", L("الآبار حسب المنطقة", "Wells by region"), regions.length ? regions.map((r) => clickRow(prow(r.r || L("غير محدد", "Not specified"), activeOf(r.a, r.a + r.i), [{ v: r.a, c: C.green }, { v: r.i, c: C.red }], regMax), r.r ? href("/farms", { ...keep, region: r.r, has: "wells" }) : null)).join("") + legend([[L("آبار نشطة", "Active wells"), C.green], [L("آبار متوقفة", "Inactive wells"), C.red]]) : `<p class="muted">${L("لا توجد آبار مسجلة لهذا النطاق.", "No wells recorded for this scope.")}</p>`, { span: "c7" })}
        ${card("pie", L("جودة التمور", "Date quality"), donutLinks(quality, (x) => (x.key ? href("/farms", { ...keep, quality: x.key }) : href("/farms", { ...keep, has: "production" }))), { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("award", L("أعلى 10 مزارع إنتاجاً", "Top 10 producing farms"), `<div class="scroll"><table class="tbl"><thead><tr><th>${L("رمز المزرعة", "Farm code")}</th><th>${L("المشروع", "Project")}</th><th>${L("الجهة", "Side")}</th><th>${L("النخيل", "Palms")}</th><th>${L("الإنتاج (طن)", "Production (t)")}</th><th>${L("الجودة", "Quality")}</th></tr></thead><tbody>
          ${top.map((f) => `<tr class="clickable" ${go(`/farm/${encodeURIComponent(f.code)}`, {})}><td>${farmLink(f.code)}</td><td>${esc(f.project)}</td><td>${t(f.side)}</td><td class="num">${fmt(f.date_trees)}</td><td class="num"><b>${fmt(f.prod_total, 2)}</b></td><td>${badge(f.prod_quality)}</td></tr>`).join("")}
          </tbody></table></div>`, { span: "c8", action: `<a class="link" href="${href("/farms", { ...keep, sort: "prod_total", dir: "desc" })}">${L("كل المزارع", "All farms")}</a>` })}
        ${card("layers", L("حالة التأجير", "Lease status"), donutLinks(lease, (x) => (x.key ? href("/farms", { ...keep, lease: x.key }) : null)), { span: "c4" })}
      </div>`;
  }
  const clickRow = (html, target) => (target ? html.replace('<div class="prow">', `<div class="prow clickable" data-go="${esc(target)}">`) : html);
  const ringInner = (p, color, label) => `<div class="r" style="background:conic-gradient(${color} ${p * 3.6}deg, var(--track) 0)"><b class="num">${fmt(p, 1)}%</b></div><span>${label}</span>`;
  function donutLinks(items, target) {
    let i = 0;
    return donut(items).replace(/<li>/g, () => {
      const tg = target(items[i++]);
      return tg ? `<li class="clickable" data-go="${esc(tg)}">` : "<li>";
    });
  }

  // ------------------------------------------------------------ farms list (Agriculture Center IPM pattern)
  const COLS = () => [
    ["code", L("رمز المزرعة", "Farm code")], ["project", L("المشروع", "Project")], ["region", L("المنطقة", "Region")], ["side", L("الجهة", "Side")],
    ["area_ha", L("المساحة (هـ)", "Area (ha)")], ["date_trees", L("النخيل", "Palms")], ["prod_total", L("الإنتاج (طن)", "Production (t)")], ["prod_quality", L("الجودة", "Quality")],
    ["wells_total", L("الآبار", "Wells")], ["meters_total", L("العدادات", "Meters")], ["lease_status", L("التأجير", "Lease")],
  ];
  // filter fields shown in the drawer: [param, farm field, label]
  const FILTERS = () => [
    ["side", "side", L("الجهة", "Side")], ["region", "region", L("المنطقة", "Region")], ["lease", "lease_status", L("حالة التأجير", "Lease status")],
    ["quality", "prod_quality", L("جودة التمور", "Date quality")], ["expro", "expropriation", L("حالة النزع", "Expropriation")], ["has", null, L("تحتوي على", "Has")],
  ];
  const HAS = () => [["map", L("حدود على الخريطة", "Map boundary")], ["production", L("بيانات إنتاج", "Production data")], ["meters", L("عدادات كهرباء", "Power meters")], ["wells", L("آبار", "Wells")]];
  const hasTest = { map: (f) => !!f.geometry_source, production: (f) => f.prod_total != null, meters: (f) => f.meters_total > 0, wells: (f) => f.wells_total > 0 };
  function filterFarms(p, q = p.q) {
    const scope = p.scope === "all" ? "all" : "plan";
    const ql = (q || "").toLowerCase();
    const sets = Object.fromEntries(FILTERS().map(([k]) => [k, multi(p[k])]));
    let rows = scoped(scope).filter((f) =>
      (!ql || [f.code, f.region, f.project, f.plot_code, f.cluster].some((v) => v && String(v).toLowerCase().includes(ql))) &&
      FILTERS().every(([k, field]) => !sets[k].length || (field ? sets[k].includes(f[field] ?? "") : sets[k].every((h) => hasTest[h]?.(f)))) &&
      (!p.deserted || f.deserted === p.deserted));
    const sort = COLS().some((c) => c[0] === p.sort) ? p.sort : scope === "plan" ? "prod_total" : "code";
    const dir = p.dir === "asc" ? 1 : p.dir === "desc" ? -1 : sort === "code" ? 1 : -1;
    rows = rows.sort((a, b) => {
      const x = a[sort], y = b[sort];
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * dir;
    });
    return { rows, scope, sort, dir };
  }
  const statusCell = (v) => {
    if (!v) return `<span class="st none">—</span>`;
    const tn = tone(v);
    return `<span class="st ${tn === "primary" ? "ok" : tn === "danger" ? "bad" : tn === "warn" ? "mid" : "none"}">${esc(t(v))}</span>`;
  };

  function farmsPage(p) {
    const SIZE = 50;
    let { rows, scope, sort, dir } = filterFarms(p);
    let page = Math.max(1, Number(p.page) || 1);
    let query = p.q || "";
    const activeCount = FILTERS().reduce((n, [k]) => n + multi(p[k]).length, 0) + (p.deserted ? 1 : 0);
    const chips = [
      ...FILTERS().flatMap(([k, , label]) => multi(p[k]).map((v) => [k, v, `${label}: ${k === "has" ? HAS().find((h) => h[0] === v)?.[1] ?? v : t(v)}`])),
      ...(p.deserted ? [["deserted", p.deserted, L("مرشحة للترك", "To be deserted")]] : []),
    ];
    app.innerHTML = `<div id="farms-root">
      ${head(L("المزارع", "Farms"), L("حدد المزارع ثم اضغط «تصدير» لتنزيل بياناتها", "Select farms, then press Export to download their data"), scopePick(scope, "/farms", { ...p, page: undefined }))}
      <div class="list-card">
        <div class="list-bar">
          <label class="list-search">${ico("search")}<input id="fq" value="${esc(query)}" placeholder="${L("ابحث برمز المزرعة، المشروع، المنطقة، رمز القطعة", "Search by farm code, project, region, plot code")}" aria-label="${L("بحث", "Search")}" /></label>
          <button class="tbtn ghost" id="fbtn">${ico("filter")}${L("فلتر", "Filter")}${activeCount ? `<span class="cnt">${activeCount}</span>` : ""}</button>
          <div class="rel"><button class="tbtn" id="xbtn" ${SEL.size ? "" : "disabled"}>${ico("download")}${L("تصدير", "Export")}</button><div class="menu" id="xmenu" hidden></div></div>
        </div>
        ${chips.length ? `<div class="chips-bar">${chips.map(([k, v, label]) => `<span class="fchip">${esc(label)}<button data-rm="${esc(k)}" data-v="${esc(v)}" aria-label="${L("إزالة", "Remove")}">×</button></span>`).join("")}<button class="sel-line" style="border:0;padding:3px 6px;background:none;color:var(--main);font-weight:600;cursor:pointer" data-go="${esc(href("/farms", { scope: p.scope }))}">${L("مسح الكل", "Clear all")}</button></div>` : ""}
        <div class="sel-line" id="selline"></div>
        <div class="scroll"><table class="tbl ipm"><thead><tr><th style="width:40px"><input type="checkbox" id="selpage" aria-label="${L("تحديد الصفحة", "Select page")}" /></th>${COLS().map(([k, l]) => `<th><a href="${href("/farms", { ...p, sort: k, dir: sort === k && dir === -1 ? "asc" : "desc", page: undefined })}">${l} ${sort === k ? (dir === -1 ? "▼" : "▲") : "↕"}</a></th>`).join("")}</tr></thead><tbody id="ftb"></tbody></table></div>
        <div class="pager" id="fpager" style="padding:0 0 14px"></div>
      </div>
      <div id="drawer-root"></div></div>`;
    // listeners live on this page's own root, which is replaced on the next render (no build-up on #app)
    const root = document.getElementById("farms-root");

    const cell = (f, k) => {
      if (k === "code") return farmLink(f.code);
      if (k === "project") return `<span class="trunc" style="display:inline-block">${esc(f.project)}</span>`;
      if (k === "side") return t(f.side);
      if (k === "prod_quality" || k === "lease_status") return statusCell(f[k]);
      if (k === "wells_total") return f.wells_total ? `${f.wells_total}${f.wells_inactive ? ` <span class="t-danger">(${f.wells_inactive} ${L("متوقفة", "inactive")})</span>` : ""}` : "—";
      if (k === "meters_total") return f.meters_total ? `${f.meters_total}${f.meters_not_working ? ` <span class="t-danger">(${f.meters_not_working} ${L("لا تعمل", "not working")})</span>` : ""}` : "—";
      if (k === "prod_total") return `<b>${fmt(f.prod_total, 2)}</b>`;
      if (k === "area_ha") return fmt(f.area_ha, 2);
      if (k === "region") return esc(f.region);
      return fmt(f[k]);
    };
    const tb = document.getElementById("ftb");
    function renderRows() {
      const pages = Math.max(1, Math.ceil(rows.length / SIZE));
      page = Math.min(page, pages);
      const slice = rows.slice((page - 1) * SIZE, page * SIZE);
      tb.innerHTML = slice.map((f) => `<tr class="${SEL.has(f.code) ? "sel" : ""}"><td><input type="checkbox" data-code="${esc(f.code)}" ${SEL.has(f.code) ? "checked" : ""} aria-label="${esc(f.code)}" /></td>${COLS().map(([k]) => `<td class="${["area_ha", "date_trees", "prod_total", "wells_total", "meters_total"].includes(k) ? "num" : ""}">${cell(f, k)}</td>`).join("")}</tr>`).join("")
        || `<tr><td colspan="${COLS().length + 1}" class="empty">${L("لا توجد نتائج", "No results")}</td></tr>`;
      document.getElementById("fpager").innerHTML = pages > 1 ? `${page > 1 ? `<button class="tbtn" data-pg="${page - 1}">${L("السابق", "Previous")}</button>` : ""}<span class="muted">${L("صفحة", "Page")} <b class="num">${page}</b> ${L("من", "of")} <b class="num">${pages}</b></span>${page < pages ? `<button class="tbtn" data-pg="${page + 1}">${L("التالي", "Next")}</button>` : ""}` : "";
      const allOnPage = slice.length && slice.every((f) => SEL.has(f.code));
      document.getElementById("selpage").checked = !!allOnPage;
      renderSel();
    }
    function renderSel() {
      const inRows = rows.filter((f) => SEL.has(f.code)).length;
      document.getElementById("selline").innerHTML = `<span><b class="num">${fmt(SEL.size)}</b> ${L("محددة", "Selected")}</span><span class="muted">${L(`${fmt(rows.length)} مزرعة مطابقة`, `${fmt(rows.length)} matching farms`)}</span>
        ${rows.length && inRows < rows.length ? `<button id="selall">${L(`تحديد كل المطابقة (${fmt(rows.length)})`, `Select all matching (${fmt(rows.length)})`)}</button>` : ""}
        ${SEL.size ? `<button id="selnone">${L("إلغاء التحديد", "Clear selection")}</button>` : ""}`;
      document.getElementById("xbtn").disabled = !SEL.size;
    }
    renderRows();

    let tmr = null;
    document.getElementById("fq").addEventListener("input", (e) => {
      clearTimeout(tmr);
      tmr = setTimeout(() => {
        query = e.target.value;
        ({ rows } = filterFarms(p, query));
        page = 1;
        renderRows();
        history.replaceState(null, "", href("/farms", { ...p, q: query || undefined, page: undefined }));
      }, 200);
    });
    root.addEventListener("change", (e) => {
      if (e.target.matches("input[data-code]")) {
        e.target.checked ? SEL.add(e.target.dataset.code) : SEL.delete(e.target.dataset.code);
        e.target.closest("tr").classList.toggle("sel", e.target.checked);
        renderSel();
      } else if (e.target.id === "selpage") {
        rows.slice((page - 1) * SIZE, page * SIZE).forEach((f) => (e.target.checked ? SEL.add(f.code) : SEL.delete(f.code)));
        renderRows();
      }
    });
    root.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.pg) { page = Number(b.dataset.pg); renderRows(); window.scrollTo(0, 0); }
      else if (b.id === "selall") { rows.forEach((f) => SEL.add(f.code)); renderRows(); }
      else if (b.id === "selnone") { SEL.clear(); renderRows(); }
      else if (b.dataset.rm) {
        const left = b.dataset.rm === "deserted" ? [] : multi(p[b.dataset.rm]).filter((v) => v !== b.dataset.v);
        location.hash = href("/farms", { ...p, [b.dataset.rm]: left.join(",") || undefined, page: undefined });
      } else if (b.id === "fbtn") openDrawer();
      else if (b.id === "xbtn") {
        const m = document.getElementById("xmenu");
        m.hidden = !m.hidden;
        m.innerHTML = `
          <button data-x="xlsx">${ico("sheet")}<span>${L("ملف Excel", "Excel workbook")}<small>${L("المزارع + العدادات + الآبار", "Farms + meters + wells")}</small></span></button>
          <button data-x="csv">${ico("table")}<span>CSV<small>${L("بيانات المزارع فقط", "Farm data only")}</small></span></button>
          <button data-x="kml">${ico("globe")}<span>KML<small>${L("الحدود لـ Google Earth", "Boundaries for Google Earth")}</small></span></button>
          <button data-x="geojson">${ico("map")}<span>GeoJSON<small>${L("الحدود لبرامج GIS", "Boundaries for GIS")}</small></span></button>`;
      } else if (b.dataset.x) {
        document.getElementById("xmenu").hidden = true;
        exportFarms(b.dataset.x, FARMS.filter((f) => SEL.has(f.code)));
      }
    });

    function openDrawer() {
      const base = scoped(scope);
      const droot = document.getElementById("drawer-root");
      const sec = ([k, field, label]) => {
        const opts = field ? [...groupBy(base, (f) => f[field] ?? "")].filter(([v]) => v !== "").map(([v, a]) => [v, t(v), a.length]).sort((a, b) => String(a[1]).localeCompare(String(b[1])))
          : HAS().map(([v, l]) => [v, l, base.filter(hasTest[v]).length]);
        if (!opts.length) return "";
        const chosen = multi(p[k]);
        return `<div class="fsec ${chosen.length ? "open" : ""}" data-k="${k}"><div class="fsec-h"><span>${label}${chosen.length ? `<span class="cnt">${chosen.length}</span>` : ""}</span>${ico("chev")}</div>
          <div class="fsec-b"><label class="all"><input type="checkbox" data-all /> ${L("تحديد الكل", "Select all")}</label>
          ${opts.map(([v, l, n]) => `<label><input type="checkbox" value="${esc(v)}" ${chosen.includes(v) ? "checked" : ""} /> ${esc(l)}<small class="num">${fmt(n)}</small></label>`).join("")}</div></div>`;
      };
      droot.innerHTML = `<div class="drawer-bg" id="dbg"></div><aside class="drawer" role="dialog" aria-label="${L("الفلاتر", "Filters")}">
        <div class="drawer-h"><h2>${L("الفلاتر", "Filters")}</h2><button class="drawer-x" id="dx" aria-label="${L("إغلاق", "Close")}">✕</button></div>
        <div class="drawer-b">${FILTERS().map(sec).join("")}</div>
        <div class="drawer-f"><button class="reset" id="dreset">${L("إعادة تعيين", "Reset")}</button><button class="apply" id="dapply">${L("تطبيق", "Apply")}</button></div></aside>`;
      const close = () => (droot.innerHTML = "");
      droot.querySelectorAll(".fsec").forEach((s) => {
        const boxes = [...s.querySelectorAll(".fsec-b input:not([data-all])")];
        const all = s.querySelector("[data-all]");
        const sync = () => {
          all.checked = boxes.every((b) => b.checked);
          const n = boxes.filter((b) => b.checked).length;
          const h = s.querySelector(".fsec-h > span");
          h.querySelector(".cnt")?.remove();
          if (n) h.insertAdjacentHTML("beforeend", `<span class="cnt">${n}</span>`);
        };
        sync();
        s.querySelector(".fsec-h").onclick = () => s.classList.toggle("open");
        all.onchange = () => { boxes.forEach((b) => (b.checked = all.checked)); sync(); };
        boxes.forEach((b) => (b.onchange = sync));
      });
      document.getElementById("dbg").onclick = close;
      document.getElementById("dx").onclick = close;
      document.getElementById("dreset").onclick = () => droot.querySelectorAll(".fsec input").forEach((b) => (b.checked = false)) || droot.querySelectorAll(".fsec .cnt").forEach((c) => c.remove());
      document.getElementById("dapply").onclick = () => {
        const next = { scope: p.scope, q: query || undefined, sort: p.sort, dir: p.dir };
        droot.querySelectorAll(".fsec").forEach((s) => {
          const boxes = [...s.querySelectorAll(".fsec-b input:not([data-all])")];
          const on = boxes.filter((b) => b.checked).map((b) => b.value);
          // all ticked == no filter, like the platform's "Select All"
          next[s.dataset.k] = on.length && on.length < boxes.length ? on.join(",") : undefined;
        });
        close();
        location.hash = href("/farms", next);
      };
    }
  }

  // ------------------------------------------------------------ export of selected farms
  const loadScript = (src) => new Promise((ok, bad) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = () => bad(new Error(src));
    document.head.appendChild(s);
  });
  const download = (name, blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const FARM_COLS = () => [
    ["code", L("رمز المزرعة", "Farm code")], ["project", L("المشروع", "Project")], ["plot_code", L("رمز القطعة", "Plot code")], ["region", L("المنطقة", "Region")],
    ["side", L("الجهة", "Side")], ["cluster", L("العنقود", "Cluster")], ["land_use", L("استخدام الأرض", "Land use")], ["area_ha", L("المساحة (هـ)", "Area (ha)")],
    ["date_trees", L("النخيل", "Date palms")], ["citrus_trees", L("الحمضيات", "Citrus")], ["mango_trees", L("المانجو", "Mango")],
    ["prod_g1", L("درجة أولى (طن)", "Grade 1 (t)")], ["prod_g2", L("درجة ثانية (طن)", "Grade 2 (t)")], ["prod_g3", L("درجة ثالثة (طن)", "Grade 3 (t)")], ["prod_total", L("إجمالي الإنتاج (طن)", "Total production (t)")],
    ["prod_quality", L("الجودة", "Quality")], ["varieties", L("الأصناف", "Varieties")], ["wells_active", L("آبار نشطة", "Active wells")], ["wells_inactive", L("آبار متوقفة", "Inactive wells")],
    ["wells_total", L("إجمالي الآبار", "Total wells")], ["meters_total", L("العدادات", "Meters")], ["meters_working", L("عدادات تعمل", "Meters working")], ["meters_not_working", L("عدادات لا تعمل", "Meters not working")],
    ["lease_status", L("حالة التأجير", "Lease status")], ["expropriation", L("حالة النزع", "Expropriation")], ["deserted", L("مرشحة للترك", "To be deserted")],
    ["capex", L("التكلفة الرأسمالية (ر.س)", "CAPEX (SAR)")], ["opex", L("التشغيل السنوي (ر.س)", "OPEX/yr (SAR)")], ["rev_y3", L("إيراد السنة 3 (ر.س)", "Year-3 revenue (SAR)")],
    ["lat", L("خط العرض", "Latitude")], ["lng", L("خط الطول", "Longitude")],
  ];
  async function exportFarms(kind, list) {
    if (!list.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const codes = new Set(list.map((f) => f.code));
    const farmRows = list.map((f) => Object.fromEntries(FARM_COLS().map(([k, l]) => [l, f[k] ?? ""])));
    if (kind === "csv") {
      const keys = FARM_COLS().map((c) => c[1]);
      const q = (v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
      download(`alula-farms-${stamp}.csv`, new Blob(["﻿" + [keys.join(","), ...farmRows.map((r) => keys.map((k) => q(r[k])).join(","))].join("\r\n")], { type: "text/csv;charset=utf-8" }));
      return;
    }
    if (kind === "xlsx") {
      if (!window.XLSX) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
      const [meters, wells] = await Promise.all([load("meters.json"), load("wells.json")]);
      const mRows = meters.filter((m) => codes.has(m.farm_code)).map((m) => ({
        [L("رمز المزرعة", "Farm code")]: m.farm_code, [L("رقم العداد", "Meter no.")]: m.meter_no, [L("الحالة", "Status")]: t(m.status), [L("مفصول؟", "Disconnected?")]: t(m.disconnected),
        [L("خط العرض", "Latitude")]: m.lat, [L("خط الطول", "Longitude")]: m.lng, [L("التفاصيل", "Details")]: m.details ?? "",
      }));
      const wRows = wells.filter((w) => codes.has(w.farm_code)).map((w) => ({
        [L("رمز المزرعة", "Farm code")]: w.farm_code, [L("اسم البئر", "Well")]: w.name, [L("التصنيف", "Category")]: w.category,
        [L("خط العرض", "Latitude")]: w.lat, [L("خط الطول", "Longitude")]: w.lng, [L("أقرب عداد", "Nearest meter")]: w.nearest_meter ?? "",
      }));
      const wb = window.XLSX.utils.book_new();
      const add = (rows, name) => window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(rows.length ? rows : [{ "-": "" }]), name);
      add(farmRows, L("المزارع", "Farms"));
      add(mRows, L("العدادات", "Meters"));
      add(wRows, L("الآبار", "Wells"));
      if (LANG === "ar") wb.Workbook = { Views: [{ RTL: true }] };
      window.XLSX.writeFile(wb, `alula-farms-${stamp}.xlsx`);
      return;
    }
    const shapes = await load("farm-shapes.json");
    const byCode = new Map(shapes.features.map((s) => [s.properties.code, s.geometry]));
    const feats = list.map((f) => ({
      type: "Feature",
      properties: Object.fromEntries(FARM_COLS().filter(([k]) => !["lat", "lng"].includes(k)).map(([k]) => [k, f[k] ?? null])),
      geometry: byCode.get(f.code) || (f.lat != null ? { type: "Point", coordinates: [f.lng, f.lat] } : null),
    })).filter((x) => x.geometry);
    if (kind === "geojson") {
      download(`alula-farms-${stamp}.geojson`, new Blob([JSON.stringify({ type: "FeatureCollection", features: feats })], { type: "application/geo+json" }));
      return;
    }
    const x = (s) => String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);
    const ring = (r) => `<LinearRing><coordinates>${r.map((c) => c.join(",")).join(" ")}</coordinates></LinearRing>`;
    const poly = (p) => `<Polygon><outerBoundaryIs>${ring(p[0])}</outerBoundaryIs>${p.slice(1).map((r) => `<innerBoundaryIs>${ring(r)}</innerBoundaryIs>`).join("")}</Polygon>`;
    const geom = (g) => g.type === "Point" ? `<Point><coordinates>${g.coordinates.join(",")}</coordinates></Point>`
      : g.type === "Polygon" ? poly(g.coordinates) : g.type === "MultiPolygon" ? `<MultiGeometry>${g.coordinates.map(poly).join("")}</MultiGeometry>` : "";
    const kml = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${NAME}</name>
<Style id="f"><LineStyle><color>ff2fd2f2</color><width>2</width></LineStyle><PolyStyle><color>4d2fd2f2</color></PolyStyle></Style>
${feats.map((f) => `<Placemark><name>${x(f.properties.code)}</name><styleUrl>#f</styleUrl><ExtendedData>${Object.entries(f.properties).map(([k, v]) => `<Data name="${x(k)}"><value>${x(v)}</value></Data>`).join("")}</ExtendedData>${geom(f.geometry)}</Placemark>`).join("\n")}
</Document></kml>`;
    download(`alula-farms-${stamp}.kml`, new Blob([kml], { type: "application/vnd.google-earth.kml+xml" }));
  }

  // ------------------------------------------------------------ leaflet helpers
  const SAT = () => L_.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 20, maxNativeZoom: 17, attribution: "Esri World Imagery" });
  const OSM = () => L_.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 20, maxNativeZoom: 19, attribution: "© OpenStreetMap" });
  // Leaflet can initialise against a 0px-wide container; re-measure on resize and run `onFirstSize` once it is real.
  function watchSize(map, el, onFirstSize) {
    let done = false;
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      if (!done && map.getSize().x > 0) {
        done = true;
        onFirstSize();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }
  // pin-shaped markers with an icon (meters / wells)
  const MK = { "meter-ok": "meter", "meter-bad": "meter", well: "droplet", "well-off": "droplet", "well-new": "droplet" };
  const mkIcon = (kind) => L_.divIcon({ className: "mk-icon", html: `<div class="mk ${kind}">${ico(MK[kind])}</div>`, iconSize: [26, 26], iconAnchor: [13, 30], popupAnchor: [0, -28], tooltipAnchor: [12, -18] });
  const wellKind = (cat) => (cat === "Active" ? "well" : cat === "Inactive" ? "well-off" : "well-new");
  const fmtDist = (m) => (m < 1000 ? `${fmt(m, 1)} ${L("م", "m")}` : `${fmt(m / 1000, 2)} ${L("كم", "km")}`);
  const popupRows = (rows) => `<table>${rows.map(([k, v]) => `<tr><td style="color:#6b7280;padding-inline-end:12px">${k}</td><td><b>${v}</b></td></tr>`).join("")}</table>`;
  const farmPopup = (f) => `<div dir="${DIR()}" style="min-width:220px"><div style="font-size:15px;font-weight:700">${esc(f.code)}</div><div style="color:#6b7280;margin-bottom:6px">${esc(f.project)}</div>${popupRows([
    [L("الجهة", "Side"), esc(t(f.side))], [L("المساحة", "Area"), `${fmt(f.area_ha, 2)} ${U.ha()}`], [L("النخيل", "Palms"), fmt(f.date_trees)], [L("الإنتاج", "Production"), `${fmt(f.prod_total, 2)} ${U.t()}`],
    [L("الجودة", "Quality"), esc(t(f.prod_quality))], [L("التأجير", "Lease"), esc(t(f.lease_status))], [L("الآبار", "Wells"), fmt(f.wells_total)], [L("العدادات", "Meters"), fmt(f.meters_total)],
  ])}<a href="#/farm/${encodeURIComponent(f.code)}" style="display:inline-block;margin-top:8px;font-weight:700;color:${C.green}">${L("فتح ملف المزرعة", "Open farm profile")}</a></div>`;
  const propsPopup = (title, p) => {
    const rows = Object.entries(p).filter(([k, v]) => !k.startsWith("_") && k !== "Name" && v !== null && v !== "" && v !== undefined).slice(0, 12).map(([k, v]) => [esc(k), esc(v)]);
    const link = p._farm;
    return `<div dir="${DIR()}" style="max-width:300px"><b>${esc(title)}</b>${popupRows(rows)}${link ? `<a href="#/farm/${encodeURIComponent(link)}" style="font-weight:700;color:${C.green}">${L("ملف المزرعة", "Farm profile")} ${esc(link)}</a>` : ""}</div>`;
  };
  // point-in-polygon (ray casting) for GeoJSON Polygon / MultiPolygon, coordinates in [lng, lat]
  const inRing = (pt, ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const inGeom = (pt, g) => g.type === "Polygon" ? inRing(pt, g.coordinates[0]) && !g.coordinates.slice(1).some((h) => inRing(pt, h))
    : g.type === "MultiPolygon" ? g.coordinates.some((p) => inGeom(pt, { type: "Polygon", coordinates: p })) : false;
  // "26.6897, 37.9071" / "37.9071 26.6897" / 26°41'23"N 37°54'26"E  ->  [lat, lng]
  function parseCoords(s) {
    const dms = [...s.matchAll(/(\d+(?:\.\d+)?)\s*°\s*(?:(\d+(?:\.\d+)?)\s*['′]\s*)?(?:(\d+(?:\.\d+)?)\s*["″]\s*)?([NSEW])?/gi)];
    let nums;
    if (dms.length >= 2) nums = dms.slice(0, 2).map((m) => (+m[1] + (+m[2] || 0) / 60 + (+m[3] || 0) / 3600) * (/[SW]/i.test(m[4] || "") ? -1 : 1));
    else nums = (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).slice(0, 2);
    if (nums.length < 2 || nums.some((n) => !Number.isFinite(n))) return null;
    let [a, b] = nums;
    // AlUla: lat ≈ 26, lng ≈ 38 — if the first number looks like a longitude, swap
    if (Math.abs(a) > 90 || (a > 34 && b < 34)) [a, b] = [b, a];
    return Math.abs(a) <= 90 && Math.abs(b) <= 180 ? [a, b] : null;
  }

  // ------------------------------------------------------------ map page (Agriculture Center "Main Map" layout)
  const PROD_STEPS = [[0, "#EFEBE9"], [0.5, "#D7CCC8"], [2, "#A1887F"], [5, "#66BB6A"], [10, C.green]];
  const prodBand = (v) => {
    if (v == null) return -1;
    let i = 0;
    PROD_STEPS.forEach(([m], k) => { if (v >= m) i = k; });
    return i;
  };
  // category of a farm under each colour mode -> [key, label, colour]
  const catOf = (f, mode) => {
    if (mode === "lease") return f.lease_status ? [f.lease_status, t(f.lease_status), LEASE[f.lease_status] || NODATA] : ["", L("غير محدد", "Not specified"), NODATA];
    if (mode === "quality") return f.prod_quality ? [f.prod_quality, t(f.prod_quality), QUALITY[f.prod_quality] || NODATA] : ["", L("غير مصنفة", "Unclassified"), NODATA];
    if (mode === "side") return f.side ? [f.side, t(f.side), SIDE[f.side] || NODATA] : ["", L("غير محدد", "Not specified"), NODATA];
    const b = prodBand(f.prod_total);
    if (b < 0) return ["none", L("لا توجد بيانات إنتاج", "No production data"), NODATA];
    const [m, c] = PROD_STEPS[b];
    return [String(b), b < PROD_STEPS.length - 1 ? `${m} – ${PROD_STEPS[b + 1][0]} ${U.t()}` : `${m}+ ${U.t()}`, c];
  };
  const OVERLAY_COLORS = ["#7b4fa3", "#d0632a", "#2a8fa8", "#a83a6b", "#5d7d2a", "#8a6a2a", "#3a4fa8", "#a8762a", "#2aa86b", "#666"];

  async function mapPage(p) {
    const scope = p.scope === "all" ? "all" : "plan";
    const [shapes, layers, meters, wells, wpts] = await Promise.all([load("farm-shapes.json"), load("layers.json"), load("meters.json"), load("wells.json"), load("well-points.json")]);
    let mode = p.color || "lease";
    const hidden = new Set();
    const show = { meterOk: true, meterBad: true, wellReg: true, wellActive: true, wellInactive: true, wellOther: true };
    app.innerHTML = `
      <div class="crumb"><b>${L("لوحة المؤشرات", "Dashboard")}</b> &gt;&gt; ${L("الخريطة الرئيسية", "Main map")}</div>
      <div class="mapwrap" id="mapwrap">
        <aside class="mside" id="mside"></aside>
        <div class="mmain">
          <div class="map" id="map"></div>
          <button class="mside-tab" id="mtab" aria-label="${L("إظهار/إخفاء اللوحة", "Toggle panel")}">${ico("side")}</button>
          <div class="mtop">
            <form class="pill" id="msearch">
              <select id="stype" aria-label="${L("نوع البحث", "Search type")}"><option value="farm">${L("رقم المزرعة", "Farm code")}</option><option value="meter">${L("رقم العداد", "Meter no.")}</option><option value="coord">${L("الإحداثيات", "Coordinates")}</option></select>
              <span class="sep"></span>${ico("search")}<input id="sq" value="${esc(p.farm || "")}" placeholder="${L("أدخل رقم المزرعة", "Enter the farm code")}" aria-label="${L("بحث", "Search")}" /><button>${L("بحث", "Go")}</button>
            </form>
            <label class="pill"><select data-nav aria-label="${L("النطاق", "Scope")}"><option value="${href("/map", { color: p.color })}" ${scope !== "all" ? "selected" : ""}>${L("المزارع المنزوعة", "Expropriated farms")}</option><option value="${href("/map", { scope: "all", color: p.color })}" ${scope === "all" ? "selected" : ""}>${L("كل المزارع (سجل الآبار)", "All farms (wells register)")}</option></select></label>
            <label class="pill"><select id="mode" aria-label="${L("تلوين المزارع", "Colour farms")}">${[["lease", L("حالة التأجير", "Lease status")], ["production", L("كمية الإنتاج", "Production")], ["quality", L("جودة التمور", "Date quality")], ["side", L("الجهة", "Side")]].map(([v, l]) => `<option value="${v}" ${mode === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
          </div>
          <div class="mtools">
            <div class="tgroup"><button id="zin" title="${L("تكبير", "Zoom in")}">+</button><button id="zout" title="${L("تصغير", "Zoom out")}">−</button><button id="zfit" title="${L("عرض كل المزارع", "Fit all farms")}">${ico("home")}</button></div>
            <div class="tgroup"><button id="tmeasure" title="${L("قياس المسافة بين نقطتين", "Measure distance between two points")}">${ico("measure")}</button><button id="tbase" title="${L("تبديل الخريطة الأساسية", "Switch basemap")}">${ico("globe")}</button></div>
          </div>
          <div class="mhint" id="mhint" hidden></div>
        </div>
      </div>`;

    const el = document.getElementById("map");
    const wrap = document.getElementById("mapwrap");
    const map = L_.map(el, { preferCanvas: true, zoomControl: false, attributionControl: true }).setView([26.7, 37.95], 11);
    const sat = SAT().addTo(map);
    const osm = OSM();
    L_.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

    // ---- farms
    const index = new Map();
    const withShape = new Set(shapes.features.map((f) => f.properties.code));
    const feats = [
      ...shapes.features.filter((s) => scope === "all" || BY_CODE.get(s.properties.code)?.in_plan).map((s) => ({ ...s, properties: BY_CODE.get(s.properties.code) })),
      ...(scope === "all" ? FARMS.filter((f) => !withShape.has(f.code) && f.lat != null).map((f) => ({ type: "Feature", properties: f, geometry: { type: "Point", coordinates: [f.lng, f.lat] } })) : []),
    ];
    const all = L_.geoJSON({ type: "FeatureCollection", features: feats }, {
      style: (f) => { const c = catOf(f.properties, mode)[2]; return { color: c, weight: 1.6, fillColor: c, fillOpacity: 0.45 }; },
      pointToLayer: (f, ll) => L_.circleMarker(ll, { radius: 4, color: "#fff", weight: 1, fillColor: catOf(f.properties, mode)[2], fillOpacity: 0.9 }),
      onEachFeature: (f, l) => {
        l.bindPopup(() => farmPopup(f.properties), { maxWidth: 320 });
        l.bindTooltip(f.properties.code, { sticky: true, direction: "top" });
        index.set(f.properties.code, l);
      },
    });
    const farmsLayer = L_.featureGroup().addTo(map);
    function refreshFarms() {
      all.eachLayer((l) => {
        const [k, , c] = catOf(l.feature.properties, mode);
        l.setStyle(l instanceof L_.CircleMarker ? { fillColor: c } : { color: c, fillColor: c });
        if (hidden.has(k)) farmsLayer.removeLayer(l);
        else farmsLayer.addLayer(l);
      });
    }
    refreshFarms();

    // ---- point layers with icons
    const meterIdx = new Map();
    const mOk = L_.layerGroup(), mBad = L_.layerGroup();
    for (const m of meters) {
      if (m.lat == null) continue;
      const ok = m.status === "Working";
      const mk = L_.marker([m.lat, m.lng], { icon: mkIcon(ok ? "meter-ok" : "meter-bad"), title: m.meter_no })
        .bindPopup(() => propsPopup(`${L("عداد", "Meter")} ${m.meter_no}`, { [L("المزرعة", "Farm")]: m.farm_code, [L("الحالة", "Status")]: t(m.status), [L("مفصول؟", "Disconnected?")]: t(m.disconnected), [L("الإحداثيات", "Coordinates")]: `${m.lat.toFixed(6)}, ${m.lng.toFixed(6)}`, _farm: m.farm_code }));
      (ok ? mOk : mBad).addLayer(mk);
      meterIdx.set(m.meter_no.toUpperCase(), mk);
    }
    const wReg = L_.layerGroup(wpts.map(([code, lng, lat]) => {
      const f = BY_CODE.get(code) || {};
      return L_.marker([lat, lng], { icon: mkIcon(f.wells_active ? "well" : "well-off") })
        .bindPopup(() => propsPopup(`${L("آبار المزرعة", "Wells of farm")} ${code}`, { [L("آبار نشطة", "Active wells")]: f.wells_active, [L("آبار متوقفة", "Inactive wells")]: f.wells_inactive, [L("المنطقة", "Region")]: f.region, _farm: code }));
    }));
    const wGroups = { Active: L_.layerGroup(), Inactive: L_.layerGroup(), other: L_.layerGroup() };
    for (const w of wells) {
      if (w.lat == null) continue;
      const g = w.category === "Active" || w.category === "Inactive" ? w.category : "other";
      wGroups[g].addLayer(L_.marker([w.lat, w.lng], { icon: mkIcon(wellKind(w.category)) })
        .bindPopup(() => propsPopup(w.name, { [L("التصنيف", "Category")]: w.category, [L("المزرعة", "Farm")]: w.farm_code, [L("أقرب عداد", "Nearest meter")]: w.nearest_meter, _farm: w.farm_code })));
    }
    const pointLayers = { meterOk: mOk, meterBad: mBad, wellReg: wReg, wellActive: wGroups.Active, wellInactive: wGroups.Inactive, wellOther: wGroups.other };
    // icons only from street-level zoom: at overview they pile up and hide the farm boundaries
    const ICON_ZOOM = 14;
    const refreshPoints = () => Object.entries(pointLayers).forEach(([k, lyr]) => (show[k] && map.getZoom() >= ICON_ZOOM ? lyr.addTo(map) : lyr.remove()));
    map.on("zoomend", refreshPoints);
    refreshPoints();

    // ---- side panel (summary + legend toggles, like the platform's "Main Map" panel)
    const ovOn = new Set();
    const ovLayers = {};
    function renderSide() {
      const inScope = feats.map((f) => f.properties);
      const cats = [...groupBy(inScope, (f) => catOf(f, mode)[0])].map(([k, a]) => [k, catOf(a[0], mode)[1], catOf(a[0], mode)[2], a.length]).sort((a, b) => b[3] - a[3]);
      const ptRow = (key, kind, label, n) => `<div class="mrow ${show[key] ? "" : "off"}" data-pt="${key}"><span class="ico-b mk ${kind}" style="transform:none;border-radius:6px;border:0;box-shadow:none">${ico(MK[kind])}</span><b class="num">${fmt(n)}</b><span>${label}</span></div>`;
      document.getElementById("mside").innerHTML = `
        <h1>${L("الخريطة الرئيسية", "Main map")}</h1>
        <div class="mcard"><div class="mcard-h"><span>${L("المزارع", "Farms")}</span><span class="cnt num">${fmt(inScope.length)}</span></div>
          <div class="msub">${document.querySelector(`#mode option[value="${mode}"]`)?.textContent || ""} — ${L("انقر للإظهار/الإخفاء", "click to show/hide")}</div>
          ${cats.map(([k, label, c, n]) => `<div class="mrow ${hidden.has(k) ? "off" : ""}" data-cat="${esc(k)}"><span class="dot" style="background:${c}"></span><b class="num">${fmt(n)}</b><span>${esc(label)}</span></div>`).join("")}
        </div>
        <div class="mcard"><div class="mcard-h"><span>${L("عدادات الكهرباء", "Power meters")}</span><span class="cnt num">${fmt(mOk.getLayers().length + mBad.getLayers().length)}</span></div>
          ${ptRow("meterOk", "meter-ok", L("تعمل", "Working"), mOk.getLayers().length)}${ptRow("meterBad", "meter-bad", L("لا تعمل", "Not working"), mBad.getLayers().length)}
        </div>
        <div class="mcard"><div class="mcard-h"><span>${L("الآبار داخل المزارع", "Wells inside farms")}</span><span class="cnt num">${fmt(wReg.getLayers().length + wells.length)}</span></div>
          <div class="msub">${L("الآبار الواقعة داخل حدود المزارع أو على بعد 10 م منها. تظهر الأيقونات عند التكبير.", "Wells inside farm boundaries or within 10 m. Icons appear when you zoom in.")}</div>
          ${ptRow("wellActive", "well", L("آبار ممسوحة — نشطة", "Surveyed — active"), wGroups.Active.getLayers().length)}
          ${ptRow("wellInactive", "well-off", L("آبار ممسوحة — متوقفة", "Surveyed — inactive"), wGroups.Inactive.getLayers().length)}
          ${ptRow("wellOther", "well-new", L("آبار ممسوحة — خارج النطاق", "Surveyed — out of scope"), wGroups.other.getLayers().length)}
          ${ptRow("wellReg", "well", L("مواقع آبار سجل الآبار", "Wells-register locations"), wReg.getLayers().length)}
        </div>
        <div class="mcard"><div class="mcard-h"><span>${L("طبقات إضافية", "Extra layers")}</span><span class="cnt num">${layers.length}</span></div>
          ${layers.map((l, i) => `<label class="mrow" style="cursor:pointer"><input type="checkbox" data-ov="${esc(l.key)}" ${ovOn.has(l.key) ? "checked" : ""} style="accent-color:var(--main)" /><span class="dot" style="background:${OVERLAY_COLORS[i % OVERLAY_COLORS.length]}"></span><span style="flex:1">${esc(tt(l.title))}</span><small class="muted num">${fmt(l.features)}</small></label>`).join("")}
        </div>`;
    }
    renderSide();
    const side = document.getElementById("mside");
    side.addEventListener("click", (e) => {
      const c = e.target.closest("[data-cat]");
      const pt = e.target.closest("[data-pt]");
      if (c) { hidden.has(c.dataset.cat) ? hidden.delete(c.dataset.cat) : hidden.add(c.dataset.cat); refreshFarms(); renderSide(); }
      if (pt) { show[pt.dataset.pt] = !show[pt.dataset.pt]; refreshPoints(); renderSide(); }
    });
    side.addEventListener("change", async (e) => {
      const key = e.target.dataset.ov;
      if (!key) return;
      if (!e.target.checked) { ovOn.delete(key); ovLayers[key]?.remove(); return; }
      ovOn.add(key);
      if (!ovLayers[key]) {
        const i = layers.findIndex((l) => l.key === key);
        const color = OVERLAY_COLORS[i % OVERLAY_COLORS.length];
        ovLayers[key] = L_.geoJSON(await load(`layers/${key}.json`), {
          style: () => ({ color, weight: 1.4, fillColor: color, fillOpacity: 0.12, dashArray: "4 3" }),
          pointToLayer: (_f, ll) => L_.circleMarker(ll, { radius: 3, color, fillColor: color, fillOpacity: 0.8, weight: 1 }),
          onEachFeature: (f, l) => l.bindPopup(() => propsPopup(f.properties.Name || tt(layers[i].title), f.properties)),
        });
      }
      ovLayers[key].addTo(map);
      farmsLayer.bringToFront();
    });
    document.getElementById("mtab").onclick = () => { side.classList.toggle("closed"); setTimeout(() => map.invalidateSize(), 320); };
    document.getElementById("mode").onchange = (e) => {
      mode = e.target.value;
      hidden.clear();
      refreshFarms();
      renderSide();
      history.replaceState(null, "", href("/map", { scope: p.scope, color: mode === "lease" ? undefined : mode }));
    };

    // ---- tools
    const fitAll = () => farmsLayer.getBounds().isValid() && map.fitBounds(farmsLayer.getBounds(), { padding: [30, 30] });
    document.getElementById("zin").onclick = () => map.zoomIn();
    document.getElementById("zout").onclick = () => map.zoomOut();
    document.getElementById("zfit").onclick = fitAll;
    document.getElementById("tbase").onclick = () => {
      if (map.hasLayer(sat)) { map.removeLayer(sat); osm.addTo(map); } else { map.removeLayer(osm); sat.addTo(map); }
    };
    const hint = document.getElementById("mhint");
    const say = (html) => { hint.hidden = !html; hint.innerHTML = html || ""; };

    // distance between two clicked points
    let measuring = false;
    const mLayer = L_.layerGroup().addTo(map);
    let mPts = [];
    const mDot = (ll) => L_.circleMarker(ll, { radius: 6, color: "#fff", weight: 2, fillColor: "#298459", fillOpacity: 1, interactive: false });
    function setMeasure(on) {
      measuring = on;
      wrap.classList.toggle("measuring", on);
      document.getElementById("tmeasure").classList.toggle("on", on);
      mLayer.clearLayers();
      mPts = [];
      say(on ? `${ico("measure")} ${L("انقر على النقطة الأولى في الخريطة", "Click the first point on the map")} <button id="mclose">${L("إغلاق", "Close")}</button>` : "");
    }
    document.getElementById("tmeasure").onclick = () => setMeasure(!measuring);
    hint.addEventListener("click", (e) => {
      if (e.target.id === "mclose") setMeasure(false);
      if (e.target.id === "mnew") setMeasure(true);
    });
    map.on("click", (e) => {
      if (!measuring) return;
      if (mPts.length === 2) { mLayer.clearLayers(); mPts = []; }
      mPts.push(e.latlng);
      mDot(e.latlng).addTo(mLayer);
      if (mPts.length === 1) {
        say(`${ico("measure")} ${L("انقر على النقطة الثانية", "Click the second point")} <button id="mclose">${L("إغلاق", "Close")}</button>`);
        return;
      }
      const d = map.distance(mPts[0], mPts[1]);
      L_.polyline(mPts, { color: "#ffffff", weight: 5, opacity: 0.9, interactive: false }).addTo(mLayer);
      L_.polyline(mPts, { color: "#298459", weight: 3, dashArray: "6 6", interactive: false }).addTo(mLayer);
      const mid = L_.latLng((mPts[0].lat + mPts[1].lat) / 2, (mPts[0].lng + mPts[1].lng) / 2);
      L_.tooltip({ permanent: true, direction: "top", className: "measure-tip" }).setLatLng(mid).setContent(fmtDist(d)).addTo(mLayer);
      say(`${L("المسافة", "Distance")}: <b class="num">${fmtDist(d)}</b> <button id="mnew">${L("قياس جديد", "New measurement")}</button><button id="mclose">${L("إغلاق", "Close")}</button>`);
    });
    // farm / meter popups must not swallow measuring clicks
    farmsLayer.on("click", (e) => { if (measuring) { e.layer.closePopup(); map.fire("click", { latlng: e.latlng }); } });

    // ---- search: farm code / meter number / coordinates
    const sq = document.getElementById("sq");
    const stype = document.getElementById("stype");
    const PH = { farm: L("أدخل رقم المزرعة", "Enter the farm code"), meter: L("أدخل رقم العداد", "Enter the meter number"), coord: L("مثال: 26.6897, 37.9071", "e.g. 26.6897, 37.9071") };
    stype.onchange = () => { sq.placeholder = PH[stype.value]; sq.value = ""; sq.focus(); };
    const pinLayer = L_.layerGroup().addTo(map);
    const zoomTo = (l) => {
      if (l.getBounds) map.fitBounds(l.getBounds(), { maxZoom: 17, padding: [60, 60] });
      else map.setView(l.getLatLng(), 17);
      setTimeout(() => l.openPopup(), 350);
    };
    function runSearch() {
      const q = sq.value.trim();
      if (!q) return;
      pinLayer.clearLayers();
      if (stype.value === "farm") {
        const Q = q.toUpperCase();
        const hit = index.get(Q) || [...index.entries()].find(([k]) => k.includes(Q))?.[1];
        if (!hit) return say(`${L("لم يتم العثور على المزرعة", "Farm not found")}: ${esc(q)} <button id="mclose">${L("إغلاق", "Close")}</button>`);
        if (!farmsLayer.hasLayer(hit)) { hidden.clear(); refreshFarms(); renderSide(); }
        say("");
        zoomTo(hit);
      } else if (stype.value === "meter") {
        const Q = q.toUpperCase().replace(/\s+/g, "");
        const hit = meterIdx.get(Q) || [...meterIdx.entries()].find(([k]) => k.includes(Q))?.[1];
        if (!hit) return say(`${L("لم يتم العثور على العداد", "Meter not found")}: ${esc(q)} <button id="mclose">${L("إغلاق", "Close")}</button>`);
        show.meterOk = show.meterBad = true;
        refreshPoints();
        renderSide();
        say("");
        map.setView(hit.getLatLng(), 17);
        setTimeout(() => hit.openPopup(), 350);
      } else {
        const ll = parseCoords(q);
        if (!ll) return say(`${L("صيغة الإحداثيات غير صحيحة — مثال: 26.6897, 37.9071", "Invalid coordinates — e.g. 26.6897, 37.9071")} <button id="mclose">${L("إغلاق", "Close")}</button>`);
        const pt = [ll[1], ll[0]];
        const inside = feats.find((f) => f.geometry.type !== "Point" && inGeom(pt, f.geometry));
        const html = `<div dir="${DIR()}"><b>${L("الإحداثيات", "Coordinates")}</b><div class="num">${ll[0].toFixed(6)}, ${ll[1].toFixed(6)}</div>${inside
          ? `<div style="margin-top:6px">${L("تقع داخل المزرعة", "Inside farm")} <a href="#/farm/${encodeURIComponent(inside.properties.code)}" style="font-weight:700;color:${C.green}">${esc(inside.properties.code)}</a></div>`
          : `<div style="margin-top:6px;color:#6b7280">${L("لا تقع داخل حدود أي مزرعة", "Not inside any farm boundary")}</div>`}</div>`;
        L_.marker(ll, { icon: L_.divIcon({ className: "mk-icon", html: '<div class="coord-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(pinLayer).bindPopup(html).openPopup();
        map.setView(ll, 17);
        say("");
      }
    }
    document.getElementById("msearch").onsubmit = (e) => { e.preventDefault(); runSearch(); };

    const stop = watchSize(map, el, () => {
      const target = p.farm && index.get(p.farm.toUpperCase());
      if (target) zoomTo(target);
      else fitAll();
    });
    cleanup = () => {
      stop();
      map.remove();
    };
  }

  // ------------------------------------------------------------ farm page
  const dl = (rows) => `<dl class="dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v ?? "—"}</dd>`).join("")}</dl>`;

  async function farmPage(code) {
    const f = BY_CODE.get(code.toUpperCase());
    if (!f) {
      app.innerHTML = `<div class="card"><b>${L("لا توجد مزرعة بالرمز", "No farm with code")} ${esc(code)}</b><p><a class="link" href="#/farms">${L("سجل المزارع", "Farms register")}</a></p></div>`;
      return;
    }
    document.getElementById("tb-page").textContent = `${L("ملف المزرعة", "Farm profile")} ${f.code}`;
    const [meters, wells, shapes, farmLayers] = await Promise.all([
      load("meters.json"), load("wells.json"), load("farm-shapes.json"), load("farm-layers.json"),
    ]);
    const M = meters.filter((m) => m.farm_code === f.code);
    const W = wells.filter((w) => w.farm_code === f.code);
    const shape = shapes.features.find((s) => s.properties.code === f.code);
    const lyrs = farmLayers[f.code] || [];
    const g = [f.prod_g1 || 0, f.prod_g2 || 0, f.prod_g3 || 0];
    const G = GRADES();

    app.innerHTML = `
      <a class="back" href="#/farms">${ico("arrow")}${L("سجل المزارع", "Farms register")}</a>
      <div class="head"><div>
        <h1 class="num" style="direction:ltr;text-align:start">${esc(f.code)}</h1>
        <p>${esc([f.project, f.region].filter(Boolean).join(" · ") || "—")}</p>
        <div class="badges">
          ${f.side ? `<span class="badge">${t(f.side)}</span>` : ""}${f.cluster ? `<span class="badge">${L("العنقود", "Cluster")}: ${esc(f.cluster)}</span>` : ""}
          ${f.lease_status ? `<span class="badge ${f.lease_status === "Full" ? "solid" : tone(f.lease_status)}">${t(f.lease_status)}</span>` : ""}
          ${f.expropriation ? `<span class="badge ${f.expropriation === "Expropriated" ? "gold" : ""}">${t(f.expropriation)}</span>` : ""}
          ${f.prod_quality ? badge(f.prod_quality, L(`جودة ${t(f.prod_quality)}`, `${t(f.prod_quality)} quality`)) : ""}${f.deserted === "Yes" ? `<span class="badge danger">${L("مرشحة للترك وفق الدراسة", "To be deserted (study)")}</span>` : ""}
        </div></div>
        <div class="tools"><a class="btn btn-primary" href="${href("/map", { farm: f.code, scope: f.in_plan ? undefined : "all" })}">${ico("map")}${L("عرض على الخريطة", "Show on map")}</a></div>
      </div>
      <div class="kpis k6">
        ${kpi("ruler", L("المساحة", "Area"), `${fmt(f.area_ha, 2)} <small>${U.ha()}</small>`, "", { tint: "green", cls: "t-primary" })}
        ${kpi("palm", L("أشجار النخيل", "Date palms"), fmt(f.date_trees), f.citrus_trees || f.mango_trees ? L(`حمضيات ${fmt(f.citrus_trees)} · مانجو ${fmt(f.mango_trees)}`, `Citrus ${fmt(f.citrus_trees)} · Mango ${fmt(f.mango_trees)}`) : "")}
        ${kpi("box", L("الإنتاج 2026", "Production 2026"), `${fmt(f.prod_total, 2)} <small>${U.t()}</small>`, f.prod_total != null && f.date_trees ? L(`${fmt((f.prod_total * 1000) / f.date_trees, 1)} كجم / نخلة`, `${fmt((f.prod_total * 1000) / f.date_trees, 1)} kg / palm`) : "", { tint: "beige", cls: "t-brown" })}
        ${kpi("droplet", L("الآبار", "Wells"), fmt(f.wells_total), f.wells_total ? L(`${fmt(f.wells_active)} نشطة · ${fmt(f.wells_inactive)} متوقفة`, `${fmt(f.wells_active)} active · ${fmt(f.wells_inactive)} inactive`) : "", { subCls: f.wells_inactive ? "t-danger" : "" })}
        ${kpi("meter", L("عدادات الكهرباء", "Power meters"), fmt(f.meters_total), f.meters_total ? L(`${fmt(f.meters_working)} تعمل · ${fmt(f.meters_not_working)} لا تعمل`, `${fmt(f.meters_working)} working · ${fmt(f.meters_not_working)} not working`) : "", { subCls: f.meters_not_working ? "t-danger" : "t-primary" })}
        ${kpi("layers", L("حالة التأجير", "Lease status"), f.lease_status ? t(f.lease_status) : "—", f.expropriation ? t(f.expropriation) : "", { cls: f.lease_status === "Full" ? "t-primary" : f.lease_status === "Not Leased" ? "t-danger" : "" })}
      </div>
      <div class="grid12">
        ${card("pin", L("الموقع والحدود", "Location & boundary"), `<div class="farmmap" id="fmap"></div>
          <div class="legend"><span><i style="background:transparent;border:2px solid #f2c230"></i>${L("حدود المزرعة", "Farm boundary")}${f.geometry_source ? ` (${esc(tt(lyrs.find((l) => l[0] === f.geometry_source)?.[1] || f.geometry_source))})` : ""}</span>
          <span><i style="background:#e0a800;border-radius:50%"></i>${L("عداد يعمل", "Meter working")}</span><span><i style="background:#c62828;border-radius:50%"></i>${L("عداد لا يعمل", "Meter not working")}</span><span><i style="background:#1e88e5;border-radius:50%"></i>${L("بئر", "Well")}</span>
          ${f.lat != null ? `<span class="num">${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}</span>` : ""}</div>`, { span: "c7" })}
        ${card("info", L("البيانات الأساسية", "Basic information"), dl([
          [L("رمز القطعة", "Plot code"), esc(f.plot_code)], [L("استخدام الأرض", "Land use"), esc(f.land_use)], [L("المشروع", "Project"), esc(f.project)], [L("المنطقة", "Region"), esc(f.region)],
          [L("الجهة", "Side"), t(f.side)], [L("العنقود", "Cluster"), esc(f.cluster)], [L("حالة النزع", "Expropriation"), t(f.expropriation)], [L("حالة التأجير", "Lease status"), t(f.lease_status)],
          [L("التصنيف", "Classification"), t(f.classification)], [L("الأصناف", "Varieties"), esc(f.varieties)],
        ]), { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("trend", L("إنتاج التمور 2026", "Date production 2026"), f.prod_total != null ? `
          ${g.map((v, i) => prow(G[i], `${fmt(v, 2)} ${U.t()}`, [{ v, c: GRADE[i] }], f.prod_total || 1)).join("")}
          <div class="kvrow"><span class="muted">${L("الإجمالي", "Total")}</span><b class="num">${fmt(f.prod_total, 2)} ${U.t()}</b></div>
          <div class="kvrow"><span class="muted">${L("الجودة", "Quality")}</span><b>${t(f.prod_quality)}</b></div>` : `<p class="muted">${L("لا توجد بيانات إنتاج لهذه المزرعة.", "No production data for this farm.")}</p>`, { span: "c4" })}
        ${card("droplet", L("الآبار", "Wells"), `
          ${prow(L("نشطة", "Active"), `${fmt(f.wells_active)} / ${fmt(f.wells_total)}`, [{ v: f.wells_active || 0, c: C.green }], f.wells_total || 1)}
          ${prow(L("متوقفة", "Inactive"), `${fmt(f.wells_inactive)} / ${fmt(f.wells_total)}`, [{ v: f.wells_inactive || 0, c: C.red }], f.wells_total || 1)}
          ${W.length ? `<ul class="wl">${W.map((w) => `<li><b>${esc(w.name)}</b><small>${esc(w.category)} · ${L("أقرب عداد", "nearest meter")} <span class="num">${esc(w.nearest_meter)}</span> · ${L("يبعد", "at")} <span class="num">${fmt(w.distance_farm_m)}</span> ${L("م", "m")}</small></li>`).join("")}</ul>` : ""}`, { span: "c4" })}
        ${card("wallet", L("التكاليف والعوائد (الدراسة)", "Costs & returns (study)"), f.capex != null || f.opex != null ? `
          <div class="strip"><div><b class="num">${fmt((f.capex || 0) / 1000, 1)}K</b><span>${L("رأسمالية (ر.س)", "CAPEX (SAR)")}</span></div><div><b class="num">${fmt((f.opex || 0) / 1000, 1)}K</b><span>${L("تشغيل سنوي", "OPEX / year")}</span></div><div><b class="num">${fmt((f.rev_y3 || 0) / 1000, 1)}K</b><span>${L("إيراد السنة 3", "Year-3 revenue")}</span></div></div>
          <div class="kvrow"><span class="muted">${L("مرشحة للترك؟", "To be deserted?")}</span><b>${t(f.deserted)}</b></div>` : `<p class="muted">${L("لا توجد بيانات مالية.", "No financial data.")}</p>`, { span: "c4" })}
      </div>
      <div class="grid12">
        ${card("meter", `${L("عدادات الكهرباء", "Power meters")} (${M.length})`, M.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>${L("رقم العداد", "Meter no.")}</th><th>${L("الحالة", "Status")}</th><th>${L("مفصول؟", "Disconnected?")}</th><th>${L("طريقة الربط", "Assignment")}</th><th>${L("المسافة عن الحدود (م)", "Distance to boundary (m)")}</th><th>${L("مرجع البئر", "Well ref.")}</th><th>${L("التفاصيل الكهربائية", "Electrical details")}</th></tr></thead><tbody>
          ${M.map((m) => `<tr><td class="num"><b>${esc(m.meter_no)}</b></td><td>${badge(m.status)}</td><td>${t(m.disconnected)}</td><td>${esc(m.assignment)}</td><td class="num">${fmt(m.distance_m, 1)}</td><td>${esc(m.well_ref)}</td><td style="white-space:normal;min-width:240px;font-size:12px">${esc(m.details)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">${L("لا توجد عدادات مرتبطة بهذه المزرعة.", "No meters linked to this farm.")}</p>`)}
      </div>
`;

    const el = document.getElementById("fmap");
    const map = L_.map(el, { preferCanvas: true });
    SAT().addTo(map);
    const group = L_.featureGroup().addTo(map);
    if (shape) L_.geoJSON(shape, { style: { color: "#f2c230", weight: 2.5, fillColor: "#f2c230", fillOpacity: 0.15 } }).addTo(group);
    for (const m of M) if (m.lat != null) L_.marker([m.lat, m.lng], { icon: mkIcon(m.status === "Working" ? "meter-ok" : "meter-bad") }).bindTooltip(`${L("عداد", "Meter")} ${m.meter_no} — ${t(m.status)}`).addTo(group);
    for (const w of W) if (w.lat != null) L_.marker([w.lat, w.lng], { icon: mkIcon(wellKind(w.category)) }).bindTooltip(`${w.name} — ${w.category}`).addTo(group);
    if (!shape && f.lat != null) L_.circleMarker([f.lat, f.lng], { radius: 8, color: "#fff", weight: 2, fillColor: C.green, fillOpacity: 1 }).addTo(group);
    const fit = () => (group.getBounds().isValid() ? map.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 17 }) : map.setView([26.7, 37.95], 11));
    fit();
    const stop = watchSize(map, el, fit);
    cleanup = () => {
      stop();
      map.remove();
    };
  }

  // ------------------------------------------------------------ wells
  async function wellsPage(p) {
    const scope = p.scope === "all" ? "all" : "plan";
    const F = scoped(scope);
    const wells = await load("wells.json");
    const cats = [...groupBy(wells, (w) => w.category)].map(([c, a]) => [c, a.length]).sort((a, b) => b[1] - a[1]);
    const list = p.category ? wells.filter((w) => w.category === p.category) : wells;
    const regions = [...groupBy(F, (f) => f.region || L("غير محدد", "Not specified"))].map(([r, a]) => ({ r, a: sum(a, "wells_active"), i: sum(a, "wells_inactive") })).filter((x) => x.a + x.i).sort((x, y) => (y.a + y.i) - (x.a + x.i)).slice(0, 14);
    const regMax = Math.max(...regions.map((x) => x.a + x.i), 1);
    const W = { t: sum(F, "wells_total"), a: sum(F, "wells_active"), i: sum(F, "wells_inactive") };
    const chip = (on, h, l) => `<a href="${h}" class="chip ${on ? "on" : ""}">${l}</a>`;
    const ofTotal = (v) => L(`${fmt(pct(v, W.t), 1)}% من الإجمالي`, `${fmt(pct(v, W.t), 1)}% of total`);
    app.innerHTML = `
      ${head(L("الآبار", "Wells"), L("أعداد الآبار لكل مزرعة من سجل آبار العلا، والآبار الجديدة الممسوحة حديثاً", "Well counts per farm from the AlUla wells register, plus newly surveyed wells"), scopePick(scope, "/wells"))}
      <div class="kpis k4">
        ${kpi("droplet", L("إجمالي الآبار", "Total wells"), fmt(W.t), L(`${fmt(F.filter((f) => f.wells_total > 0).length)} مزرعة لديها آبار`, `${fmt(F.filter((f) => f.wells_total > 0).length)} farms with wells`), { tint: "green", cls: "t-primary" })}
        ${kpi("trend", L("آبار نشطة", "Active wells"), fmt(W.a), ofTotal(W.a), { subCls: "t-primary" })}
        ${kpi("off", L("آبار متوقفة", "Inactive wells"), fmt(W.i), ofTotal(W.i), { tint: "beige", cls: "t-danger" })}
        ${kpi("pin", L("آبار جديدة ممسوحة", "Newly surveyed wells"), fmt(wells.length), L("من ملف Updated_Wells", "from Updated_Wells"))}
      </div>
      <div class="grid12">${card("droplet", L("الآبار حسب المنطقة", "Wells by region"), regions.length ? regions.map((r) => prow(r.r, activeOf(r.a, r.a + r.i), [{ v: r.a, c: C.green }, { v: r.i, c: C.red }], regMax)).join("") + legend([[L("آبار نشطة", "Active wells"), C.green], [L("آبار متوقفة", "Inactive wells"), C.red]]) : `<p class="muted">${L("لا توجد آبار مسجلة لهذا النطاق.", "No wells recorded for this scope.")}</p>`)}</div>
      <div class="grid12">${card("pin", `${L("الآبار الجديدة الممسوحة", "Newly surveyed wells")} (${list.length})`, `
        <div class="chips" style="margin-bottom:12px">${chip(!p.category, href("/wells", { scope: p.scope }), L("الكل", "All"))}${cats.map(([c, n]) => chip(p.category === c, href("/wells", { scope: p.scope, category: c }), `${esc(c)} (${n})`)).join("")}</div>
        <div class="scroll tall"><table class="tbl"><thead><tr><th>${L("اسم البئر", "Well")}</th><th>${L("التصنيف", "Category")}</th><th>${L("أقرب مزرعة", "Nearest farm")}</th><th>${L("المسافة عن المزرعة (م)", "Distance to farm (m)")}</th><th>${L("تطابق موثوق", "Confident match")}</th><th>${L("أقرب عداد", "Nearest meter")}</th><th>${L("المسافة عن العداد (م)", "Distance to meter (m)")}</th></tr></thead><tbody>
        ${list.map((w) => `<tr><td>${esc(w.name)}</td><td><span class="badge">${esc(w.category)}</span></td><td>${w.farm_code ? farmLink(w.farm_code) : "—"}</td><td class="num">${fmt(w.distance_farm_m, 1)}</td><td>${w.confident === "Yes" ? `<span class="badge primary">${t("Yes")}</span>` : `<span class="badge warn">${t("No")}</span>`}</td><td class="num">${esc(w.nearest_meter)}</td><td class="num">${fmt(w.distance_meter_m, 1)}</td></tr>`).join("")}
        </tbody></table></div>`)}</div>`;
  }

  // ------------------------------------------------------------ meters
  async function metersPage(p) {
    const all = await load("meters.json");
    const q = (p.q || "").toUpperCase();
    const rows = all.filter((m) => (!p.status || m.status === p.status) && (!q || m.meter_no.toUpperCase().includes(q) || m.farm_code.includes(q)));
    const working = all.filter((m) => m.status === "Working").length;
    const disc = all.filter((m) => m.disconnected === "Yes").length;
    app.innerHTML = `
      ${head(L("عدادات الكهرباء", "Power meters"), L("مجمّعة من ملفات المخطط الرئيسي ومزارع الواحة و COD بعد إزالة التكرار", "Merged from the Master Plan and Oasis & COD files, duplicates removed"))}
      <div class="kpis k4">
        ${kpi("meter", L("إجمالي العدادات", "Total meters"), fmt(all.length), L(`${fmt(new Set(all.map((m) => m.farm_code)).size)} مزرعة`, `${fmt(new Set(all.map((m) => m.farm_code)).size)} farms`), { tint: "green", cls: "t-primary" })}
        ${kpi("trend", L("تعمل", "Working"), fmt(working), `${fmt(pct(working, all.length), 1)}%`, { subCls: "t-primary" })}
        ${kpi("off", L("لا تعمل", "Not working"), fmt(all.length - working), `${fmt(pct(all.length - working, all.length), 1)}%`, { tint: "beige", cls: "t-danger" })}
        ${kpi("info", L("مفصولة", "Disconnected"), fmt(disc), L("حسب الكشف الكهربائي", "per electrical inspection"))}
      </div>
      <form class="card filters" id="mf"><input class="field grow" name="q" value="${esc(p.q || "")}" placeholder="${L("رقم العداد أو رمز المزرعة…", "Meter no. or farm code…")}" />
        <select class="field" name="status" aria-label="${L("الحالة", "Status")}"><option value="">${L("الحالة: الكل", "Status: all")}</option><option value="Working" ${p.status === "Working" ? "selected" : ""}>${t("Working")}</option><option value="Not working" ${p.status === "Not working" ? "selected" : ""}>${t("Not working")}</option></select>
        <button class="btn btn-primary">${L("تطبيق", "Apply")}</button><a class="btn" href="#/meters">${L("مسح", "Clear")}</a></form>
      <div class="card scroll tall" style="padding:0"><table class="tbl"><thead><tr><th>${L("رقم العداد", "Meter no.")}</th><th>${L("المزرعة", "Farm")}</th><th>${L("المشروع", "Project")}</th><th>${L("الحالة", "Status")}</th><th>${L("مفصول؟", "Disconnected?")}</th><th>${L("طريقة الربط", "Assignment")}</th><th>${L("المسافة (م)", "Distance (m)")}</th><th>${L("المصدر", "Source")}</th><th>${L("التفاصيل", "Details")}</th></tr></thead><tbody>
      ${rows.map((m) => `<tr><td class="num"><b>${esc(m.meter_no)}</b></td><td>${farmLink(m.farm_code)}</td><td class="trunc">${esc(BY_CODE.get(m.farm_code)?.project)}</td><td>${badge(m.status)}</td><td>${t(m.disconnected)}</td><td>${esc(m.assignment)}</td><td class="num">${fmt(m.distance_m, 1)}</td><td class="muted" style="font-size:12px">${esc(m.origin)}</td><td class="trunc" style="font-size:12px;max-width:280px" title="${esc(m.details)}">${esc(m.details)}</td></tr>`).join("") || `<tr><td colspan="9" class="empty">${L("لا توجد نتائج", "No results")}</td></tr>`}
      </tbody></table></div>`;
    document.getElementById("mf").onsubmit = (e) => {
      e.preventDefault();
      location.hash = href("/meters", Object.fromEntries(new FormData(e.target)));
    };
  }

  // ------------------------------------------------------------ chrome (top bar, rail) in the current language
  const rail = document.getElementById("rail");
  const mnav = document.getElementById("mnav");
  const tbTools = document.getElementById("tb-end");
  function applyLang() {
    const html = document.documentElement;
    html.lang = LANG;
    html.dir = DIR();
    document.title = NAME;
    document.getElementById("tb-sub").textContent = L(`${NAME} · المزارع المنزوعة في العلا`, NAME);
    document.getElementById("tb-upd-l").textContent = L("آخر تحديث", "Last updated");
    document.getElementById("tb-date").innerHTML = `${ico("calendar")}${new Date().toLocaleDateString(LOCALE(), { day: "numeric", month: "long", year: "numeric" })}`;
    const search = document.querySelector("#gsearch input");
    search.placeholder = L("ابحث برمز المزرعة…", "Search farm code…");
    search.setAttribute("aria-label", L("بحث", "Search"));
    const label = (id, text) => {
      const el = document.getElementById(id);
      el.title = text;
      el.setAttribute("aria-label", text);
    };
    label("print", L("طباعة", "Print"));
    label("logout", L("تسجيل الخروج", "Sign out"));
    label("lang", L("English", "العربية"));
    document.getElementById("lang").textContent = L("EN", "ع");
    const pages = PAGES();
    document.querySelectorAll("#nav a").forEach((a) => {
      const pg = pages.find(([p]) => `#${p}` === a.getAttribute("href"));
      if (pg) {
        a.title = pg[2];
        a.setAttribute("aria-label", pg[2]);
      }
    });
    mnav.innerHTML = pages.map(([p, i, l]) => `<a href="#${p}">${ico(i)}${l}</a>`).join("");
    if (BUILT && !isNaN(BUILT)) {
      const hm = `${String(BUILT.getHours()).padStart(2, "0")}:${String(BUILT.getMinutes()).padStart(2, "0")}`;
      document.getElementById("tb-updated").textContent = `${BUILT.toLocaleDateString(LOCALE(), { day: "numeric", month: "short" })}${L("، ", ", ")}${hm}`;
    }
  }

  // ------------------------------------------------------------ boot
  hydrate();
  applyLang();
  document.getElementById("gsearch").onsubmit = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) location.hash = href("/farms", { scope: "all", q });
  };
  document.getElementById("print").onclick = () => window.print();
  document.getElementById("lang").onclick = () => {
    LANG = LANG === "en" ? "ar" : "en";
    try { localStorage.setItem("lang", LANG); } catch { /* storage blocked */ }
    applyLang();
    if (STARTED) route();
    else showLogin();
  };
  document.getElementById("logout").onclick = () => {
    try { sessionStorage.removeItem("farms-key"); } catch { /* storage blocked */ }
    location.hash = "";
    location.reload();
  };

  async function start() {
    const [fj, src] = await Promise.all([load("farms.json"), load("sources.json")]);
    FARMS = fj.rows.map((r) => Object.fromEntries(fj.cols.map((c, i) => [c, r[i]])));
    BY_CODE = new Map(FARMS.map((f) => [f.code, f]));
    BUILT = new Date(src.built_at);
    STARTED = true;
    applyLang();
    rail.hidden = false;
    mnav.hidden = false;
    tbTools.hidden = false;
    window.addEventListener("hashchange", route);
    route();
  }

  let META = null;
  function showLogin() {
    document.getElementById("tb-page").textContent = L("تسجيل الدخول", "Sign in");
    app.innerHTML = `
      <form id="login" class="card login">
        <div class="tb-ico">${ico("lock")}</div>
        <h1 class="num">${NAME}</h1>
        <p>${L("المحتوى محمي. أدخل كلمة المرور للدخول.", "This content is protected. Enter the password to continue.")}</p>
        <input class="field" type="password" name="pw" autocomplete="current-password" placeholder="${L("كلمة المرور", "Password")}" aria-label="${L("كلمة المرور", "Password")}" style="width:100%;text-align:center" autofocus />
        <button class="btn btn-primary" style="width:100%;margin-top:12px">${L("دخول", "Sign in")}</button>
        <p id="lerr" class="t-danger" style="min-height:1.5em;margin:10px 0 0"></p>
      </form>`;
    const form = document.getElementById("login");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const err = document.getElementById("lerr");
      const btn = form.querySelector("button");
      btn.disabled = true;
      err.textContent = L("جارٍ التحقق…", "Checking…");
      try {
        const k = await deriveKey(form.pw.value, META);
        await decrypt(b64(META.check), k);
        KEY = k;
        try { sessionStorage.setItem("farms-key", ub64(new Uint8Array(await crypto.subtle.exportKey("raw", k)))); } catch { /* storage blocked */ }
        app.innerHTML = `<p class="muted">${L("جارٍ تحميل البيانات…", "Loading data…")}</p>`;
        await start();
      } catch {
        err.textContent = L("كلمة المرور غير صحيحة", "Incorrect password");
        btn.disabled = false;
        form.pw.select();
      }
    };
  }

  // The derived key (not the password) is kept for the browser session so reloads don't ask again.
  async function unlock() {
    META = await fetch("data/key.json").then((r) => r.json());
    try {
      const saved = sessionStorage.getItem("farms-key");
      if (saved) {
        const k = await crypto.subtle.importKey("raw", b64(saved), "AES-GCM", true, ["decrypt"]);
        await decrypt(b64(META.check), k);
        KEY = k;
        return start();
      }
    } catch { /* fall through to the password form */ }
    showLogin();
  }
  unlock().catch((e) => (app.innerHTML = `<div class="card"><b>${L("تعذّر التحميل", "Could not load")}</b><p class="muted">${esc(e.message)}</p></div>`));
})();
