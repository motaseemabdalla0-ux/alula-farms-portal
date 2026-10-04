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
    ["/wells", "droplet", L("الآبار", "Wells")], ["/meters", "meter", L("العدادات", "Meters")], ["/sources", "database", L("مصادر البيانات", "Data sources")],
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
    document.getElementById("tb-page").textContent = active ? active[2] : L("منصة بيانات المزارع", "Farms Data Platform");
    window.scrollTo(0, 0);
    try {
      if (path === "/") dashboard(params);
      else if (path === "/map") await mapPage(params);
      else if (path === "/farms") farmsPage(params);
      else if (path.startsWith("/farm/")) await farmPage(decodeURIComponent(path.slice(6)));
      else if (path === "/wells") await wellsPage(params);
      else if (path === "/meters") await metersPage(params);
      else if (path === "/sources") await sourcesPage();
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

  // ------------------------------------------------------------ dashboard
  function dashboard(params) {
    const scope = params.scope === "all" ? "all" : "plan";
    const F = scoped(scope);
    const prod = F.filter((f) => f.prod_total != null);
    const T = {
      area: sum(F, "area_ha"), palms: sum(F, "date_trees"), prod: sum(prod, "prod_total"), g1: sum(prod, "prod_g1"), g2: sum(prod, "prod_g2"), g3: sum(prod, "prod_g3"),
      wells: sum(F, "wells_total"), wa: sum(F, "wells_active"), wi: sum(F, "wells_inactive"), meters: sum(F, "meters_total"), mw: sum(F, "meters_working"), mn: sum(F, "meters_not_working"),
      mapped: F.filter((f) => f.geometry_source).length,
    };
    const sides = [...groupBy(prod, (f) => f.side || "—")].map(([s, a]) => ({ s, g1: sum(a, "prod_g1"), g2: sum(a, "prod_g2"), g3: sum(a, "prod_g3"), n: a.length }));
    const sideMax = Math.max(...sides.map((x) => x.g1 + x.g2 + x.g3), 1e-9);
    const quality = [...groupBy(prod, (f) => f.prod_quality || "—")].map(([q, a]) => ({
      name: q === "—" ? L("غير مصنفة (أغلبها الشمال)", "Unclassified (mostly North)") : t(q), value: a.length, color: QUALITY[q] || NODATA,
    })).sort((a, b) => b.value - a.value);
    const lease = [...groupBy(F, (f) => f.lease_status || "—")].map(([l, a]) => ({
      name: l === "—" ? L("غير محدد", "Not specified") : t(l), value: a.length, color: LEASE[l] || NODATA,
    })).sort((a, b) => b.value - a.value);
    const regions = [...groupBy(F, (f) => f.region || L("غير محدد", "Not specified"))]
      .map(([r, a]) => ({ r, a: sum(a, "wells_active"), i: sum(a, "wells_inactive") }))
      .filter((x) => x.a + x.i > 0).sort((x, y) => (y.a + y.i) - (x.a + x.i)).slice(0, 10);
    const regMax = Math.max(...regions.map((x) => x.a + x.i), 1);
    const top = [...prod].sort((a, b) => b.prod_total - a.prod_total).slice(0, 10);
    const G = GRADES();

    app.innerHTML = `
      ${head(L("لوحة مؤشرات المزارع", "Farms Dashboard"), L("بيانات المزارع المنزوعة في العلا: الخرائط، الآبار، العدادات، إنتاج التمور", "AlUla expropriated farms: maps, wells, meters and date production"), scopePick(scope, "/"))}
      <div class="kpis k6">
        ${kpi("sprout", L("عدد المزارع", "Farms"), fmt(F.length), L(`${fmt(T.mapped)} لها حدود على الخريطة`, `${fmt(T.mapped)} mapped with boundaries`), { tint: "green", cls: "t-primary", subCls: "t-primary" })}
        ${kpi("ruler", L("المساحة الإجمالية", "Total area"), `${fmt(T.area, 1)} <small>${U.ha()}</small>`, L("هكتار", "hectares"))}
        ${kpi("palm", L("أشجار النخيل", "Date palms"), fmt(T.palms), F.length ? L(`${fmt(T.palms / F.length)} نخلة / مزرعة`, `${fmt(T.palms / F.length)} palms / farm`) : "")}
        ${kpi("box", L("إنتاج التمور 2026", "Date production 2026"), `${fmt(T.prod, 1)} <small>${U.t()}</small>`, L(`من ${fmt(prod.length)} مزرعة`, `from ${fmt(prod.length)} farms`), { tint: "beige", cls: "t-brown" })}
        ${kpi("droplet", L("الآبار", "Wells"), fmt(T.wells), L(`${fmt(T.wa)} نشطة · ${fmt(T.wi)} متوقفة`, `${fmt(T.wa)} active · ${fmt(T.wi)} inactive`), { subCls: T.wi ? "t-danger" : "" })}
        ${kpi("meter", L("عدادات الكهرباء", "Power meters"), fmt(T.meters), L(`${fmt(T.mw)} تعمل · ${fmt(T.mn)} لا تعمل`, `${fmt(T.mw)} working · ${fmt(T.mn)} not working`), { subCls: "t-primary" })}
      </div>
      <div class="grid12">
        ${card("trend", L("إنتاج التمور حسب الدرجة (طن)", "Date production by grade (t)"), prod.length ? `
          <div class="grid12" style="margin:0">
            <div class="c6"><div class="sub-h">${L("حسب الجهة", "By side")}</div>
              ${sides.map((x) => prow(`${t(x.s)} (${fmt(x.n)} ${U.farms()})`, `${fmt(x.g1 + x.g2 + x.g3, 1)} ${U.t()}`, [{ v: x.g1, c: GRADE[0], t: G[0] }, { v: x.g2, c: GRADE[1], t: G[1] }, { v: x.g3, c: GRADE[2], t: G[2] }], sideMax)).join("")}
              ${legend(G.map((g, i) => [g, GRADE[i]]))}
            </div>
            <div class="c6"><div class="sub-h">${L("حسب الدرجة", "By grade")}</div>
              ${prow(L("درجة أولى — جودة عالية", "Grade 1 — high quality"), `${fmt(T.g1, 1)} / ${fmt(T.prod, 1)}`, [{ v: T.g1, c: GRADE[0] }], T.prod)}
              ${prow(L("درجة ثانية — متوسطة", "Grade 2 — medium"), `${fmt(T.g2, 1)} / ${fmt(T.prod, 1)}`, [{ v: T.g2, c: GRADE[1] }], T.prod)}
              ${prow(L("درجة ثالثة — شيص", "Grade 3 — Shees (low)"), `${fmt(T.g3, 1)} / ${fmt(T.prod, 1)}`, [{ v: T.g3, c: GRADE[2] }], T.prod)}
            </div>
          </div>` : `<p class="muted">${L("لا توجد بيانات إنتاج لهذا النطاق.", "No production data for this scope.")}</p>`, { span: "c7" })}
        ${card("gauge", L("مؤشرات التشغيل", "Operational indicators"), `<div class="rings">
            ${ring(pct(T.mw, T.meters), C.green, L("عدادات تعمل", "Meters working"))}
            ${ring(pct(T.wa, T.wells), C.brown, L("آبار نشطة", "Wells active"))}
            ${ring(pct(T.mapped, F.length), C.gold, L("مزارع لها حدود", "Farms mapped"))}
          </div>
          <div class="strip" style="margin-top:16px"><div><b class="num">${fmt(prod.length)}</b><span>${L("مزارع لها إنتاج", "Producing farms")}</span></div><div><b class="num">${fmt(T.palms ? (T.prod * 1000) / T.palms : 0, 1)}</b><span>${L("كجم / نخلة", "kg / palm")}</span></div><div><b class="num">${fmt(F.filter((f) => f.deserted === "Yes").length)}</b><span>${L("مرشحة للترك", "To be deserted")}</span></div></div>`, { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("droplet", L("الآبار حسب المنطقة", "Wells by region"), regions.length ? regions.map((r) => prow(r.r, activeOf(r.a, r.a + r.i), [{ v: r.a, c: C.green }, { v: r.i, c: C.red }], regMax)).join("") + legend([[L("آبار نشطة", "Active wells"), C.green], [L("آبار متوقفة", "Inactive wells"), C.red]]) : `<p class="muted">${L("لا توجد آبار مسجلة لهذا النطاق.", "No wells recorded for this scope.")}</p>`, { span: "c7" })}
        ${card("pie", L("جودة التمور", "Date quality"), donut(quality), { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("award", L("أعلى 10 مزارع إنتاجاً", "Top 10 producing farms"), `<div class="scroll"><table class="tbl"><thead><tr><th>${L("رمز المزرعة", "Farm code")}</th><th>${L("المشروع", "Project")}</th><th>${L("الجهة", "Side")}</th><th>${L("النخيل", "Palms")}</th><th>${L("الإنتاج (طن)", "Production (t)")}</th><th>${L("الجودة", "Quality")}</th></tr></thead><tbody>
          ${top.map((f) => `<tr><td>${farmLink(f.code)}</td><td>${esc(f.project)}</td><td>${t(f.side)}</td><td class="num">${fmt(f.date_trees)}</td><td class="num"><b>${fmt(f.prod_total, 2)}</b></td><td>${badge(f.prod_quality)}</td></tr>`).join("")}
          </tbody></table></div>`, { span: "c8", action: `<a class="link" href="#/farms?sort=prod_total&dir=desc">${L("كل المزارع", "All farms")}</a>` })}
        ${card("layers", L("حالة التأجير", "Lease status"), donut(lease), { span: "c4" })}
      </div>
      <p class="note">${L("المصدر: ملفات الهيئة الملكية لمحافظة العلا. أُزيلت أسماء الملاك وأرقام التواصل من هذه النسخة.", "Source: Royal Commission for AlUla files. Owner names and contact numbers are removed from this copy.")}</p>`;
  }

  // ------------------------------------------------------------ farms list
  const COLS = () => [
    ["code", L("رمز المزرعة", "Farm code")], ["project", L("المشروع", "Project")], ["region", L("المنطقة", "Region")], ["side", L("الجهة", "Side")],
    ["area_ha", L("المساحة (هـ)", "Area (ha)")], ["date_trees", L("النخيل", "Palms")], ["prod_total", L("الإنتاج (طن)", "Production (t)")], ["prod_quality", L("الجودة", "Quality")],
    ["wells_total", L("الآبار", "Wells")], ["meters_total", L("العدادات", "Meters")], ["lease_status", L("التأجير", "Lease")], ["source_count", L("المصادر", "Sources")],
  ];
  function filterFarms(p) {
    const scope = p.scope === "all" ? "all" : "plan";
    const q = (p.q || "").toLowerCase();
    let rows = scoped(scope).filter((f) =>
      (!q || [f.code, f.region, f.project, f.plot_code, f.cluster].some((v) => v && String(v).toLowerCase().includes(q))) &&
      (!p.side || f.side === p.side) && (!p.region || f.region === p.region) && (!p.lease || f.lease_status === p.lease) &&
      (!p.quality || f.prod_quality === p.quality) &&
      (!p.has || (p.has === "map" ? f.geometry_source : p.has === "production" ? f.prod_total != null : p.has === "meters" ? f.meters_total > 0 : f.wells_total > 0)));
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
  function farmsPage(p) {
    const { rows, scope, sort, dir } = filterFarms(p);
    const SIZE = 50;
    const pages = Math.max(1, Math.ceil(rows.length / SIZE));
    const page = Math.min(pages, Math.max(1, Number(p.page) || 1));
    const base = scoped(scope);
    const opts = (k) => [...new Set(base.map((f) => f[k]).filter(Boolean))].sort();
    const all = L("الكل", "All");
    const sel = (name, label, values) => values.length ? `<select class="field" name="${name}" aria-label="${label}"><option value="">${label}: ${all}</option>${values.map((v) => `<option value="${esc(v)}" ${p[name] === v ? "selected" : ""}>${esc(t(v))}</option>`).join("")}</select>` : "";
    const cell = (f, k) => {
      if (k === "code") return farmLink(f.code);
      if (k === "project") return `<span class="trunc" style="display:inline-block">${esc(f.project)}</span>`;
      if (k === "side") return t(f.side);
      if (k === "prod_quality" || k === "lease_status") return badge(f[k]);
      if (k === "wells_total") return f.wells_total ? `${f.wells_total}${f.wells_inactive ? ` <span class="t-danger" style="font-size:12px">(${f.wells_inactive} ${L("متوقفة", "inactive")})</span>` : ""}` : "—";
      if (k === "meters_total") return f.meters_total ? `${f.meters_total}${f.meters_not_working ? ` <span class="t-danger" style="font-size:12px">(${f.meters_not_working} ${L("لا تعمل", "not working")})</span>` : ""}` : "—";
      if (k === "prod_total") return `<b>${fmt(f.prod_total, 2)}</b>`;
      if (k === "area_ha") return fmt(f.area_ha, 2);
      if (k === "region") return esc(f.region);
      return fmt(f[k]);
    };
    app.innerHTML = `
      ${head(L("سجل المزارع", "Farms register"), L(`<b class="num">${fmt(rows.length)}</b> مزرعة مطابقة`, `<b class="num">${fmt(rows.length)}</b> matching farms`), `${scopePick(scope, "/farms", { q: p.q })}<button class="btn" id="csv">${ico("download")}${L("تصدير CSV", "Export CSV")}</button>`)}
      <form class="card filters" id="ff">
        <input class="field grow" name="q" value="${esc(p.q || "")}" placeholder="${L("بحث: رمز، مشروع، منطقة…", "Search: code, project, region…")}" />
        ${sel("side", L("الجهة", "Side"), opts("side"))}${sel("region", L("المنطقة", "Region"), opts("region"))}${sel("lease", L("التأجير", "Lease"), opts("lease_status"))}${sel("quality", L("الجودة", "Quality"), opts("prod_quality"))}
        <select class="field" name="has" aria-label="${L("تحتوي على", "Has")}"><option value="">${L("تحتوي على: أي", "Has: any")}</option>${[["map", L("حدود على الخريطة", "Map boundary")], ["production", L("بيانات إنتاج", "Production data")], ["meters", L("عدادات", "Meters")], ["wells", L("آبار", "Wells")]].map(([v, l]) => `<option value="${v}" ${p.has === v ? "selected" : ""}>${l}</option>`).join("")}</select>
        <button class="btn btn-primary">${L("تطبيق", "Apply")}</button><a class="btn" href="${href("/farms", { scope: p.scope })}">${L("مسح", "Clear")}</a>
      </form>
      <div class="card scroll" style="padding:0"><table class="tbl"><thead><tr>${COLS().map(([k, l]) => `<th><a href="${href("/farms", { ...p, sort: k, dir: sort === k && dir === -1 ? "asc" : "desc", page: undefined })}">${l} ${sort === k ? (dir === -1 ? "▼" : "▲") : ""}</a></th>`).join("")}</tr></thead>
      <tbody>${rows.slice((page - 1) * SIZE, page * SIZE).map((f) => `<tr>${COLS().map(([k]) => `<td class="${["area_ha", "date_trees", "prod_total", "wells_total", "meters_total", "source_count"].includes(k) ? "num" : ""}">${cell(f, k)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="12" class="empty">${L("لا توجد نتائج", "No results")}</td></tr>`}</tbody></table></div>
      ${pages > 1 ? `<div class="pager">${page > 1 ? `<a class="btn" href="${href("/farms", { ...p, page: page - 1 })}">${L("السابق", "Previous")}</a>` : ""}<span class="muted">${L("صفحة", "Page")} <b class="num">${page}</b> ${L("من", "of")} <b class="num">${pages}</b></span>${page < pages ? `<a class="btn" href="${href("/farms", { ...p, page: page + 1 })}">${L("التالي", "Next")}</a>` : ""}</div>` : ""}`;
    document.getElementById("ff").onsubmit = (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      location.hash = href("/farms", { ...fd, scope: p.scope, sort: p.sort, dir: p.dir });
    };
    document.getElementById("csv").onclick = () => {
      const keys = ["code", "project", "plot_code", "region", "side", "cluster", "land_use", "area_ha", "date_trees", "citrus_trees", "mango_trees", "prod_g1", "prod_g2", "prod_g3", "prod_total", "prod_quality", "varieties", "wells_active", "wells_inactive", "wells_total", "meters_total", "meters_working", "meters_not_working", "lease_status", "expropriation", "deserted", "capex", "opex", "rev_y3", "lat", "lng"];
      const q = (v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
      const csv = "﻿" + [keys.join(","), ...rows.map((f) => keys.map((k) => q(f[k])).join(","))].join("\r\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = `farms-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
  }

  // ------------------------------------------------------------ leaflet helpers
  const SAT = () => L_.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 20, maxNativeZoom: 19, attribution: "Esri World Imagery" });
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
  const popupRows = (rows) => `<table>${rows.map(([k, v]) => `<tr><td style="color:#6b7280;padding-inline-end:12px">${k}</td><td><b>${v}</b></td></tr>`).join("")}</table>`;
  const farmPopup = (f) => `<div dir="${DIR()}" style="min-width:220px"><div style="font-size:15px;font-weight:700">${esc(f.code)}</div><div style="color:#6b7280;margin-bottom:6px">${esc(f.project)}</div>${popupRows([
    [L("الجهة", "Side"), esc(t(f.side))], [L("المساحة", "Area"), `${fmt(f.area_ha, 2)} ${U.ha()}`], [L("النخيل", "Palms"), fmt(f.date_trees)], [L("الإنتاج", "Production"), `${fmt(f.prod_total, 2)} ${U.t()}`],
    [L("الجودة", "Quality"), esc(t(f.prod_quality))], [L("التأجير", "Lease"), esc(t(f.lease_status))], [L("الآبار", "Wells"), fmt(f.wells_total)], [L("العدادات", "Meters"), fmt(f.meters_total)],
  ])}<a href="#/farm/${encodeURIComponent(f.code)}" style="display:inline-block;margin-top:8px;font-weight:700;color:${C.green}">${L("فتح ملف المزرعة", "Open farm profile")}</a></div>`;
  const propsPopup = (title, p) => {
    const rows = Object.entries(p).filter(([k, v]) => !k.startsWith("_") && k !== "Name" && v !== null && v !== "").slice(0, 12).map(([k, v]) => [esc(k), esc(v)]);
    const link = p._farm;
    return `<div dir="${DIR()}" style="max-width:300px"><b>${esc(title)}</b>${popupRows(rows)}${link ? `<a href="#/farm/${encodeURIComponent(link)}" style="font-weight:700;color:${C.green}">${L("ملف المزرعة", "Farm profile")} ${esc(link)}</a>` : ""}</div>`;
  };

  // ------------------------------------------------------------ map page
  const PROD_STEPS = [[0, "#EFEBE9"], [0.5, "#D7CCC8"], [2, "#A1887F"], [5, "#66BB6A"], [10, C.green]];
  const prodColor = (v) => {
    if (v == null) return NODATA;
    let c = PROD_STEPS[0][1];
    for (const [m, col] of PROD_STEPS) if (v >= m) c = col;
    return c;
  };
  const colorBy = (f, mode) => mode === "lease" ? LEASE[f.lease_status] || NODATA : mode === "quality" ? QUALITY[f.prod_quality] || NODATA : mode === "side" ? SIDE[f.side] || NODATA : prodColor(f.prod_total);
  const LEGENDS = () => ({
    lease: [...Object.entries(LEASE).map(([k, c]) => [t(k), c]), [L("غير محدد", "Not specified"), NODATA]],
    quality: [[t("High"), QUALITY.High], [t("Medium"), QUALITY.Medium], [t("Low"), QUALITY.Low], [L("غير مصنفة", "Unclassified"), NODATA]],
    side: [...Object.entries(SIDE).map(([k, c]) => [t(k), c]), [L("غير محدد", "Not specified"), NODATA]],
    production: [...PROD_STEPS.map(([m, c], i) => [i < PROD_STEPS.length - 1 ? `${m} – ${PROD_STEPS[i + 1][0]} ${U.t()}` : `${m}+ ${U.t()}`, c]), [L("لا توجد بيانات", "No data"), NODATA]],
  });
  const OVERLAY_COLORS = ["#7b4fa3", "#d0632a", "#2a8fa8", "#a83a6b", "#5d7d2a", "#8a6a2a", "#3a4fa8", "#a8762a", "#2aa86b", "#666"];

  async function mapPage(p) {
    const scope = p.scope === "all" ? "all" : "plan";
    const [shapes, layers] = await Promise.all([load("farm-shapes.json"), load("layers.json")]);
    app.innerHTML = `
      ${head(L("خريطة المزارع", "Farms map"), L("حدود المزارع على الصور الفضائية مع العدادات والآبار وطبقات التخطيط", "Farm boundaries on satellite imagery with meters, wells and planning layers"), scopePick(scope, "/map"))}
      <div class="mapbox"><div class="map" id="map"></div>
        <div class="card mpanel" id="mpanel">
          <form id="msearch" style="display:flex;gap:8px"><input class="field" style="flex:1;min-width:0" name="q" value="${esc(p.farm || "")}" placeholder="${L("رمز المزرعة…", "Farm code…")}" aria-label="${L("بحث عن مزرعة", "Find a farm")}" /><button class="btn btn-primary">${L("بحث", "Find")}</button></form>
          <label style="display:block"><span class="muted" style="font-size:12px">${L("تلوين المزارع حسب", "Colour farms by")}</span>
            <select id="mode" class="field" style="width:100%;margin-top:4px"><option value="lease">${L("حالة التأجير", "Lease status")}</option><option value="production">${L("كمية الإنتاج", "Production")}</option><option value="quality">${L("جودة التمور", "Date quality")}</option><option value="side">${L("الجهة (شمال / جنوب)", "Side (North / South)")}</option></select></label>
          <div class="lg" id="lg"></div>
          <div class="sec"><div class="muted" style="font-size:12px;margin-bottom:6px">${L("النقاط", "Points")}</div>
            <label><input type="checkbox" data-pt="meters" checked /><span class="sw" style="background:#f2c230;border-radius:50%"></span>${L("عدادات الكهرباء", "Power meters")}</label>
            <label><input type="checkbox" data-pt="wells" /><span class="sw" style="background:#2a9fd6;border-radius:50%"></span>${L("آبار المزارع (سجل الآبار)", "Farm wells (wells register)")}</label>
            <label><input type="checkbox" data-pt="newwells" /><span class="sw" style="background:#9b59d0;border-radius:50%"></span>${L("الآبار الجديدة المحدّثة", "Newly surveyed wells")}</label>
          </div>
          <details class="sec"><summary class="muted" style="cursor:pointer;font-size:12px">${L("طبقات إضافية", "Extra layers")} (${layers.length})</summary>
            <div style="margin-top:8px;display:grid;gap:4px">${layers.map((l) => `<label><input type="checkbox" data-ov="${esc(l.key)}" /><span style="flex:1">${esc(tt(l.title))}</span><span class="muted num" style="font-size:12px">${fmt(l.features)}</span></label>`).join("")}</div></details>
          <div class="sec muted" style="font-size:12px" id="mcount"></div>
        </div>
        <button class="btn mtoggle" id="mtoggle">${L("إخفاء اللوحة", "Hide panel")}</button>
        <div class="card mstatus" id="mstatus" hidden></div>
      </div>`;
    const status = (msg) => {
      const el = document.getElementById("mstatus");
      if (!el) return;
      el.hidden = !msg;
      el.textContent = msg || "";
    };
    const el = document.getElementById("map");
    const map = L_.map(el, { preferCanvas: true, zoomControl: false }).setView([26.7, 37.95], 11);
    const corner = LANG === "en" ? "topright" : "topleft"; // opposite side from the filter panel
    L_.control.zoom({ position: corner }).addTo(map);
    const sat = SAT().addTo(map);
    L_.control.layers({ [L("صور فضائية", "Satellite")]: sat, [L("خريطة شوارع", "Streets")]: OSM() }, {}, { position: corner }).addTo(map);
    L_.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

    let mode = "lease";
    const index = new Map();
    const withShape = new Set(shapes.features.map((f) => f.properties.code));
    const fc = {
      type: "FeatureCollection",
      features: [
        ...shapes.features.filter((s) => scope === "all" || BY_CODE.get(s.properties.code)?.in_plan).map((s) => ({ ...s, properties: BY_CODE.get(s.properties.code) })),
        ...(scope === "all" ? FARMS.filter((f) => !withShape.has(f.code) && f.lat != null).map((f) => ({ type: "Feature", properties: f, geometry: { type: "Point", coordinates: [f.lng, f.lat] } })) : []),
      ],
    };
    const farms = L_.geoJSON(fc, {
      style: (f) => ({ color: colorBy(f.properties, mode), weight: 1.6, fillColor: colorBy(f.properties, mode), fillOpacity: 0.45 }),
      pointToLayer: (f, ll) => L_.circleMarker(ll, { radius: 4, color: "#fff", weight: 1, fillColor: colorBy(f.properties, mode), fillOpacity: 0.9 }),
      onEachFeature: (f, l) => {
        l.bindPopup(() => farmPopup(f.properties), { maxWidth: 320 });
        l.bindTooltip(f.properties.code, { sticky: true, direction: "top" });
        index.set(f.properties.code, l);
      },
    }).addTo(map);
    document.getElementById("mcount").innerHTML = L(`معروض <b class="num">${fmt(fc.features.length)}</b> مزرعة`, `Showing <b class="num">${fmt(fc.features.length)}</b> farms`);

    const zoomTo = (l) => {
      if (l.getBounds) map.fitBounds(l.getBounds(), { maxZoom: 17, padding: [60, 60] });
      else map.setView(l.getLatLng(), 17);
      setTimeout(() => l.openPopup(), 350);
    };
    const stop = watchSize(map, el, () => {
      const target = p.farm && index.get(p.farm.toUpperCase());
      if (target) zoomTo(target);
      else if (farms.getBounds().isValid()) map.fitBounds(farms.getBounds(), { padding: [30, 30] });
    });
    cleanup = () => {
      stop();
      map.remove();
    };

    const drawLegend = () => (document.getElementById("lg").innerHTML = LEGENDS()[mode].map(([l, c]) => `<span><span class="sw" style="background:${c}"></span>${l}</span>`).join(""));
    drawLegend();
    document.getElementById("mode").onchange = (e) => {
      mode = e.target.value;
      drawLegend();
      farms.eachLayer((l) => {
        const c = colorBy(l.feature.properties, mode);
        l.setStyle(l instanceof L_.CircleMarker ? { fillColor: c } : { color: c, fillColor: c });
      });
    };
    document.getElementById("msearch").onsubmit = (e) => {
      e.preventDefault();
      const q = e.target.q.value.trim().toUpperCase();
      const hit = index.get(q) || [...index.entries()].find(([k]) => k.includes(q))?.[1];
      if (hit) {
        status("");
        zoomTo(hit);
      } else status(L(`لم يتم العثور على ${q} في هذا النطاق`, `${q} not found in this scope`));
    };
    document.getElementById("mtoggle").onclick = (e) => {
      const pnl = document.getElementById("mpanel");
      pnl.hidden = !pnl.hidden;
      e.target.textContent = pnl.hidden ? L("إظهار اللوحة", "Show panel") : L("إخفاء اللوحة", "Hide panel");
    };

    const pts = {};
    async function togglePoints(kind, on) {
      if (!on) return pts[kind]?.remove();
      if (!pts[kind]) {
        status(L("جارٍ تحميل النقاط…", "Loading points…"));
        let feats = [];
        if (kind === "meters") feats = (await load("meters.json")).filter((m) => m.lat != null).map((m) => [m.lat, m.lng, { [L("رقم العداد", "Meter no.")]: m.meter_no, [L("الحالة", "Status")]: t(m.status), [L("مفصول؟", "Disconnected?")]: t(m.disconnected), _farm: m.farm_code }, `${L("عداد", "Meter")} ${m.meter_no}`, m.status === "Working" ? "#f2c230" : "#e0412f", 5]);
        else if (kind === "newwells") feats = (await load("wells.json")).filter((w) => w.lat != null).map((w) => [w.lat, w.lng, { [L("التصنيف", "Category")]: w.category, [L("أقرب عداد", "Nearest meter")]: w.nearest_meter, _farm: w.farm_code }, w.name, "#9b59d0", 4]);
        else feats = (await load("well-points.json")).map(([code, lng, lat]) => {
          const f = BY_CODE.get(code) || {};
          return [lat, lng, { [L("المنطقة", "Region")]: f.region, [L("آبار نشطة", "Active wells")]: f.wells_active, [L("آبار متوقفة", "Inactive wells")]: f.wells_inactive, _farm: code }, `${L("آبار المزرعة", "Wells of farm")} ${code}`, f.wells_inactive && !f.wells_active ? "#e0412f" : "#2a9fd6", 3.5];
        });
        pts[kind] = L_.layerGroup(feats.map(([lat, lng, props, title, fill, r]) =>
          L_.circleMarker([lat, lng], { radius: r, color: "#1a1a1a", weight: 0.8, fillColor: fill, fillOpacity: 0.95 }).bindPopup(() => propsPopup(title, props))));
        status("");
      }
      pts[kind].addTo(map);
    }
    const ovs = {};
    async function toggleOverlay(key, on) {
      if (!on) return ovs[key]?.remove();
      if (!ovs[key]) {
        status(L("جارٍ تحميل الطبقة…", "Loading layer…"));
        const i = layers.findIndex((l) => l.key === key);
        const color = OVERLAY_COLORS[i % OVERLAY_COLORS.length];
        ovs[key] = L_.geoJSON(await load(`layers/${key}.json`), {
          style: () => ({ color, weight: 1.4, fillColor: color, fillOpacity: 0.12, dashArray: "4 3" }),
          pointToLayer: (_f, ll) => L_.circleMarker(ll, { radius: 3, color, fillColor: color, fillOpacity: 0.8, weight: 1 }),
          onEachFeature: (f, l) => l.bindPopup(() => propsPopup(f.properties.Name || tt(layers[i].title), f.properties)),
        });
        status("");
      }
      ovs[key].addTo(map);
      farms.bringToFront();
    }
    document.querySelectorAll("[data-pt]").forEach((cb) => (cb.onchange = () => togglePoints(cb.dataset.pt, cb.checked)));
    document.querySelectorAll("[data-ov]").forEach((cb) => (cb.onchange = () => toggleOverlay(cb.dataset.ov, cb.checked)));
    togglePoints("meters", true);
  }

  // ------------------------------------------------------------ farm page
  const CAT = () => ({
    masterplan: L("المخطط والدراسات المالية", "Master plan & financial studies"), production: L("تقارير الإنتاج", "Production reports"),
    survey: L("الحصر الميداني", "Field survey"), wells: L("الآبار", "Wells"), meters: L("عدادات الكهرباء", "Power meters"),
  });
  const dl = (rows) => `<dl class="dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v ?? "—"}</dd>`).join("")}</dl>`;

  async function farmPage(code) {
    const f = BY_CODE.get(code.toUpperCase());
    if (!f) {
      app.innerHTML = `<div class="card"><b>${L("لا توجد مزرعة بالرمز", "No farm with code")} ${esc(code)}</b><p><a class="link" href="#/farms">${L("سجل المزارع", "Farms register")}</a></p></div>`;
      return;
    }
    document.getElementById("tb-page").textContent = `${L("ملف المزرعة", "Farm profile")} ${f.code}`;
    const [meters, wells, shapes, recBucket, farmLayers] = await Promise.all([
      load("meters.json"), load("wells.json"), load("farm-shapes.json"), load(`records/${bucket(f.code)}.json`), load("farm-layers.json"),
    ]);
    const M = meters.filter((m) => m.farm_code === f.code);
    const W = wells.filter((w) => w.farm_code === f.code);
    const shape = shapes.features.find((s) => s.properties.code === f.code);
    const recs = recBucket[f.code] || [];
    const lyrs = farmLayers[f.code] || [];
    const g = [f.prod_g1 || 0, f.prod_g2 || 0, f.prod_g3 || 0];
    const G = GRADES();
    const cats = CAT();

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
        ${kpi("database", L("مصادر البيانات", "Data sources"), fmt(f.source_count), L(`${fmt(recs.length)} سجل`, `${fmt(recs.length)} records`))}
      </div>
      <div class="grid12">
        ${card("pin", L("الموقع والحدود", "Location & boundary"), `<div class="farmmap" id="fmap"></div>
          <div class="legend"><span><i style="background:transparent;border:2px solid #f2c230"></i>${L("حدود المزرعة", "Farm boundary")}${f.geometry_source ? ` (${esc(tt(lyrs.find((l) => l[0] === f.geometry_source)?.[1] || f.geometry_source))})` : ""}</span>
          <span><i style="background:#f2c230;border-radius:50%"></i>${L("عداد يعمل", "Meter working")}</span><span><i style="background:#e0412f;border-radius:50%"></i>${L("عداد لا يعمل", "Meter not working")}</span><span><i style="background:#2a9fd6;border-radius:50%"></i>${L("بئر", "Well")}</span>
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
      <div class="grid12">
        ${card("table", L("كل البيانات حسب المصدر", "All data by source"), `<p class="muted" style="font-size:13px;margin-top:0">${L("كل صف ورد عن هذه المزرعة في الملفات الأصلية (بدون بيانات التواصل الشخصية).", "Every row about this farm in the original files (personal contact data removed).")}</p>
          ${[...groupBy(recs, (r) => r.c)].map(([c, rs]) => `<div class="cat-h">${cats[c] || esc(c)}</div>${rs.map((r) => {
            const e = Object.entries(r.d).filter(([k]) => !k.startsWith("col_"));
            const id = r.d["Power Meter No."] ?? r.d["Well Name"];
            return `<details class="rec"><summary><b>${esc(tt(r.t))}${id != null ? `<span class="muted num" style="font-weight:400"> — ${esc(id)}</span>` : ""}</b><span class="muted" style="font-size:12px">${e.length} ${L("حقل", "fields")}</span></summary><div>
              <div class="muted num" style="font-size:12px;margin-bottom:8px;direction:ltr;text-align:start">${esc(r.f)}</div>
              <table class="tbl" dir="ltr"><tbody>${e.map(([k, v]) => `<tr><td class="muted" style="width:40%;white-space:normal">${esc(k)}</td><td style="white-space:normal">${esc(typeof v === "number" ? fmt(v, 3) : v)}</td></tr>`).join("")}</tbody></table></div></details>`;
          }).join("")}`).join("")}
          ${lyrs.length ? `<div class="cat-h">${L("طبقات الخرائط", "Map layers")}</div><div class="badges">${lyrs.map(([k, title, type]) => `<span class="badge ${k === f.geometry_source ? "primary" : ""}">${esc(tt(title))} · ${esc(type)}</span>`).join("")}</div>` : ""}`)}
      </div>`;

    const el = document.getElementById("fmap");
    const map = L_.map(el, { preferCanvas: true });
    SAT().addTo(map);
    const group = L_.featureGroup().addTo(map);
    if (shape) L_.geoJSON(shape, { style: { color: "#f2c230", weight: 2.5, fillColor: "#f2c230", fillOpacity: 0.15 } }).addTo(group);
    for (const m of M) if (m.lat != null) L_.circleMarker([m.lat, m.lng], { radius: 6, color: "#111", weight: 1, fillColor: m.status === "Working" ? "#f2c230" : "#e0412f", fillOpacity: 1 }).bindTooltip(`${L("عداد", "Meter")} ${m.meter_no} — ${t(m.status)}`).addTo(group);
    for (const w of W) if (w.lat != null) L_.circleMarker([w.lat, w.lng], { radius: 6, color: "#111", weight: 1, fillColor: "#2a9fd6", fillOpacity: 1 }).bindTooltip(w.name).addTo(group);
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

  // ------------------------------------------------------------ sources
  async function sourcesPage() {
    const s = await load("sources.json");
    const CATS = { masterplan: L("المخطط/الدراسات", "Master plan / studies"), production: L("الإنتاج", "Production"), survey: L("الحصر", "Survey"), wells: L("الآبار", "Wells"), meters: L("العدادات", "Meters") };
    app.innerHTML = `
      ${head(L("مصادر البيانات", "Data sources"), `${L("آخر بناء", "Last build")}: <span class="num">${esc(s.built_at.replace("T", " "))}</span>`)}
      <div class="grid12">${card("lock", L("عن هذه النسخة", "About this copy"), `<p style="margin:0;line-height:1.9;font-size:14px;color:var(--ink2)">${L("نسخة محمية بكلمة مرور من منصة بيانات المزارع. البيانات مشفّرة (AES-256)، وأُزيلت منها أسماء ملاك المزارع وأرقام جوالاتهم.", "A password-protected copy of the Farms Data Platform. Data is encrypted (AES-256); farm owner names and mobile numbers are removed.")}</p>`)}</div>
      <div class="grid12">${card("table", `${L("الجداول", "Tables")} (${s.sheets.length})`, `<div class="scroll"><table class="tbl"><thead><tr><th>${L("المصدر", "Source")}</th><th>${L("الفئة", "Category")}</th><th>${L("الملف / الورقة", "File / sheet")}</th><th>${L("الصفوف", "Rows")}</th></tr></thead><tbody>
        ${s.sheets.map((x) => `<tr><td><b>${esc(tt(x.title))}</b></td><td><span class="badge">${CATS[x.category] || esc(x.category)}</span></td><td class="muted" dir="ltr" style="font-size:12px;white-space:normal">${esc(x.file)} › ${esc(x.sheet)}</td><td class="num">${fmt(x.rows)}</td></tr>`).join("")}</tbody></table></div>`)}</div>
      <div class="grid12">${card("layers", `${L("طبقات الخرائط", "Map layers")} (${s.layers.length})`, `<div class="scroll"><table class="tbl"><thead><tr><th>${L("الطبقة", "Layer")}</th><th>${L("الملف", "File")}</th><th>${L("الأشكال", "Features")}</th><th>${L("مرتبطة بمزارع", "Linked to farms")}</th></tr></thead><tbody>
        ${s.layers.map((x) => `<tr><td><b>${esc(tt(x.title))}</b></td><td class="muted" dir="ltr" style="font-size:12px;white-space:normal">${esc(x.file)}</td><td class="num">${fmt(x.features)}</td><td class="num">${fmt(x.linked)}</td></tr>`).join("")}</tbody></table></div>`)}</div>`;
  }

  // ------------------------------------------------------------ chrome (top bar, rail) in the current language
  const rail = document.getElementById("rail");
  const mnav = document.getElementById("mnav");
  const tbTools = document.getElementById("tb-end");
  function applyLang() {
    const html = document.documentElement;
    html.lang = LANG;
    html.dir = DIR();
    document.title = L("منصة بيانات المزارع", "Farms Data Platform");
    document.getElementById("tb-sub").textContent = L("بيانات المزارع المنزوعة — العلا", "Expropriated farms data — AlUla");
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
        <h1>${L("منصة بيانات المزارع", "Farms Data Platform")}</h1>
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
