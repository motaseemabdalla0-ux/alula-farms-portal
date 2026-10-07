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
    polygon: '<path d="M12 3 21 9.5 17.5 20h-11L3 9.5Z"/><circle cx="12" cy="3" r="1.5"/><circle cx="21" cy="9.5" r="1.5"/><circle cx="17.5" cy="20" r="1.5"/><circle cx="6.5" cy="20" r="1.5"/><circle cx="3" cy="9.5" r="1.5"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
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
    // regions
    "Al Hijr": "الحجر", "Al Udhayb": "العذيب", AlUla: "العلا", Mughayra: "المغيرة", Shalal: "شلال",
    // projects
    "Abercrombie and Kent - Zone 1": "أبركرومبي آند كنت — المنطقة 1", "Alatheeb Equestrian Village": "قرية العذيب للفروسية", "Almahash Area": "منطقة المحاش",
    "Aman Hegra - Zone 2": "أمان الحجر — المنطقة 2", "Beet Algazaz": "بيت القزاز", "COD Area": "منطقة COD", "Canyon Resort - Zone 3": "منتجع الوادي — المنطقة 3",
    "Dadan Area": "منطقة دادان", "Estate Homes - Zone 3": "إستيت هومز — المنطقة 3", "Fire Station - Zone 1": "محطة الدفاع المدني — المنطقة 1",
    "Icense Museum & Gardens - Zone 4": "متحف وحدائق البخور — المنطقة 4", "Jabal Ikmah Area - Zone 4": "منطقة جبل عكمة — المنطقة 4",
    "Part of Tram Puffer - Zone 2": "النطاق الفاصل للترام — المنطقة 2", "Qaraqir - Ashar Staff accom - Zone 2": "قراقر — سكن موظفي عشار — المنطقة 2",
    "Six Senses - Zone 1": "سكس سينسز — المنطقة 1", "Special Projects - Zone 4": "مشاريع خاصة — المنطقة 4", "Special Projects / Future Deserted": "مشاريع خاصة / متروكة مستقبلاً",
    "Technical College": "الكلية التقنية", "Villa Hegra": "فيلا الحجر", "Wadi AlFann - Zone 5": "وادي الفن — المنطقة 5", "Zone 3": "المنطقة 3", "Zone 4": "المنطقة 4",
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
  // Royal Commission for AlUla palette — no red: "bad" states use Dadan Ochre
  const C = { green: "#14332D", brown: "#805E45", gold: "#BA9863", red: "#D08B67", gray: "#E2C6AA", main: "#986018", ink: "#3D3936", plum: "#402022", yellow: "#D6AD68" };
  const LEASE = { Full: C.green, Partial: C.yellow, Mixed: C.brown, "Not Leased": C.red };
  const QUALITY = { High: C.green, Medium: C.gold, Mid: C.gold, Low: C.red };
  const SIDE = { North: C.main, South: C.green };
  const NODATA = C.gray;
  const GRADE = [C.green, C.gold, C.red];
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
  // the site covers the expropriated farms only
  const scoped = () => FARMS.filter((f) => f.in_plan);
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
    ["/wells", "droplet", L("الآبار", "Wells")], ["/meters", "meter", L("العدادات", "Meters")], ["/review", "alert", L("مراجعة البيانات", "Data review")],
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
  // placeholder blocks shown while a page's data is decrypted
  const SKEL = `<div class="skel-page" aria-busy="true"><div class="skel h1"></div><div class="skel-row"><div class="skel kpi"></div><div class="skel kpi"></div><div class="skel kpi"></div></div><div class="skel block"></div></div>`;
  let lastPath = "";
  // columns may grow but never shrink between renders, so sorting does not make them jump
  const COLW = {};
  const lockCols = (table) => table?.querySelectorAll("thead th").forEach((th, i) => {
    const key = `${lastPath}|${i}`;
    if (COLW[key]) th.style.minWidth = `${COLW[key]}px`;
    const w = Math.ceil(th.getBoundingClientRect().width);
    if (w > (COLW[key] || 0)) { COLW[key] = w; th.style.minWidth = `${w}px`; }
  });
  async function route() {
    cleanup?.();
    cleanup = null;
    const { path, params } = parse();
    const active = PAGES().find(([p]) => (p === "/" ? path === "/" : path.startsWith(p) || (p === "/farms" && path.startsWith("/farm/"))));
    document.querySelectorAll("#nav a, #mnav a").forEach((a) => a.classList.toggle("on", !!active && a.getAttribute("href") === `#${active[0]}`));
    const samePage = path === lastPath;
    lastPath = path;
    const keepY = samePage ? window.scrollY : 0;
    if (!samePage) window.scrollTo(0, 0);
    if (path !== "/" && path !== "/farms" && path !== "/review") app.innerHTML = SKEL;
    try {
      if (path === "/") dashboard(params);
      else if (path === "/map") await mapPage(params);
      else if (path === "/farms") { farmsPage(params); if (samePage) window.scrollTo(0, keepY); }
      else if (path.startsWith("/farm/")) await farmPage(decodeURIComponent(path.slice(6)));
      else if (path === "/wells") await wellsPage(params);
      else if (path === "/meters") await metersPage(params);
      else if (path === "/review") reviewPage(params);
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
    `<div class="kpi ${opt.tint || ""}"${opt.tip ? tipAttrs(label, opt.tip) : ""}><div class="kl">${chip(icon, "ic sm")}<span>${label}</span></div><div class="kv ${opt.cls || ""}">${value}</div>${sub ? `<div class="ks ${opt.subCls || ""}">${sub}</div>` : ""}</div>`;
  const PAGE_SIZES = [5, 10, 25, 50];
  let PAGE_SIZE = 10;
  try { const v = +localStorage.getItem("page-size"); if (PAGE_SIZES.includes(v)) PAGE_SIZE = v; } catch { /* storage blocked */ }
  const setPageSize = (v) => { PAGE_SIZE = +v; try { localStorage.setItem("page-size", String(PAGE_SIZE)); } catch { /* storage blocked */ } };
  // attr: data attribute the page buttons carry ("pg" or "lpg"); pages shown: first, current ±1, last
  function pagerHtml(page, total, attr) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const btns = nums.map((n, i) => `${i && n - nums[i - 1] > 1 ? `<span class="pg-gap">…</span>` : ""}<button class="pg ${n === page ? "on" : ""}" data-${attr}="${n}" ${n === page ? 'aria-current="page"' : ""}>${fmt(n)}</button>`).join("");
    const arrow = `<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
    return `<div class="pg-size"><span>${L("حجم الصفحة", "Page Size")}</span><select data-psize aria-label="${L("حجم الصفحة", "Page size")}">${PAGE_SIZES.map((v) => `<option ${v === PAGE_SIZE ? "selected" : ""}>${v}</option>`).join("")}</select><span>${L(`من ${fmt(total)}`, `From ${fmt(total)}`)}</span></div>
      <div class="pg-nums"><button class="pg arr prev" data-${attr}="${page - 1}" ${page <= 1 ? "disabled" : ""} aria-label="${L("السابق", "Previous")}">${arrow}</button>${btns}<button class="pg arr next" data-${attr}="${page + 1}" ${page >= pages ? "disabled" : ""} aria-label="${L("التالي", "Next")}">${arrow}</button></div>`;
  }
  const sortIco = (state) => `<span class="sarr ${state || ""}" aria-hidden="true"><svg viewBox="0 0 16 16"><path class="up" d="M5 13V3M2.5 5.5 5 3l2.5 2.5"/><path class="dn" d="M11 3v10M8.5 10.5 11 13l2.5-2.5"/></svg></span>`;
  const ICON_TONE = {
    sprout: "#14332D", palm: "#14332D", gauge: "#14332D", droplet: "#14332D", ruler: "#805E45", info: "#805E45", layers: "#805E45",
    box: "#986018", trend: "#986018", wallet: "#986018", pie: "#BA9863", award: "#BA9863", meter: "#BA9863", pin: "#D08B67", alert: "#D08B67", table: "#3D3936",
  };
  const chip = (icon, cls = "ic") => `<span class="${cls}" style="--c:${ICON_TONE[icon] || "#986018"}">${ico(icon)}</span>`;
  const card = (icon, title, body, opt = {}) =>
    `<section class="card ${opt.span || "c12"}"${opt.tip ? tipAttrs(title, opt.tip) : ""}><div class="sec-h"><h2>${chip(icon)}${title}${opt.tip ? `<span class="tip-dot" aria-hidden="true">${ico("info")}</span>` : ""}</h2>${opt.action || ""}</div>${opt.insight ? `<p class="insight">${ico("trend")}<span>${opt.insight}</span></p>` : ""}${body}</section>`;
  const head = (title, sub = "", tools = "") => `<div class="head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${tools ? `<div class="tools">${tools}</div>` : ""}</div>`;
  const scopePick = () => "";
  function prow(label, value, segs, max) {
    const m = max || segs.reduce((s, x) => s + x.v, 0) || 1;
    return `<div class="prow"><div class="pl"><span>${esc(label)}</span><b>${value}</b></div><div class="ptrack">${segs
      .map((x) => `<span style="width:${Math.max(0, (x.v / m) * 100)}%;background:${x.c}"${x.hl ? ` data-hl="${x.hl}"` : ""}></span>`).join("")}</div></div>`;
  }
  const legend = (items) => `<div class="legend">${items.map(([l, c, hl]) => `<span${hl ? ` data-hl="${hl}"` : ""}><i style="background:${c}"></i>${l}</span>`).join("")}</div>`;
  const ring = (p, color, label) =>
    `<div class="ring"><div class="r" style="background:conic-gradient(${color} ${p * 3.6}deg, var(--track) 0)"><b class="num">${fmt(p, 1)}%</b></div><span>${label}</span></div>`;
  function donut(items, group = "") {
    const total = items.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    const stops = items.map((x) => {
      const a = (acc / total) * 360;
      acc += x.value;
      return `${x.color} ${a}deg ${(acc / total) * 360}deg`;
    });
    const share = (x) => Math.round((x.value / total) * 100);
    const say = (x) => L(`${fmt(x.value)} مزرعة — ${share(x)}% من ${fmt(total)} مزرعة. انقر لعرضها.`, `${fmt(x.value)} farms — ${share(x)}% of ${fmt(total)}. Click to list them.`);
    const slices = JSON.stringify(items.map((x) => [x.value, x.name, say(x), group ? `${group}:${x.key ?? ""}` : "", x.color]));
    return `<div class="donut"><div class="r" data-slices="${esc(slices)}" style="background:conic-gradient(${stops.join(",")})"><b class="num">${fmt(total)}<small>${U.farms()}</small></b></div><ul>${items
      .map((x) => `<li${tipAttrs(x.name, say(x), { hl: group ? `${group}:${x.key ?? ""}` : "" })}><span class="sw" style="background:${x.color}"></span><span>${esc(x.name)}</span><b class="num">${fmt(x.value)}</b><span class="muted num" style="width:38px;text-align:end;font-size:12px">${Math.round((x.value / total) * 100)}%</span></li>`)
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
  // On the dashboard a farm list opens in a side panel instead of leaving the page.
  document.addEventListener("click", (e) => {
    let el = e.target.closest("[data-go]");
    const ring = e.target.closest(".donut .r[data-slices]");
    if (!el && ring) { const k = sliceAt(ring, e.clientX, e.clientY); el = k >= 0 ? ring.closest(".donut").querySelectorAll("li")[k] : null; if (el && !el.dataset.go) el = null; }
    if (!el) return;
    const go = el.dataset.go;
    const onDash = (location.hash.replace(/^#/, "") || "/").split("?")[0] === "/";
    if (onDash && /^#\/farms(\?|$)/.test(go)) return openDrill(go, el.dataset.tipT || el.querySelector("span:not(.sw)")?.textContent || L("المزارع", "Farms"));
    location.hash = go;
  });
  function openDrill(go, title) {
    const q = Object.fromEntries(new URLSearchParams(go.split("?")[1] || ""));
    const { rows } = filterFarms(q);
    const list = [...rows].sort((a, b) => (b.prod_total ?? -1) - (a.prod_total ?? -1));
    let root = document.getElementById("drill-root");
    if (!root) { root = document.createElement("div"); root.id = "drill-root"; document.body.appendChild(root); }
    const MAX = 150;
    root.innerHTML = `<div class="drawer-bg" data-dclose></div><aside class="drawer drill" role="dialog" aria-label="${esc(title)}">
      <div class="drawer-h"><h2>${esc(title)}</h2><button class="drawer-x" data-dclose aria-label="${L("إغلاق", "Close")}">✕</button></div>
      <div class="drill-sum"><div><b class="num">${fmt(list.length)}</b><span>${L("مزرعة", "farms")}</span></div><div><b class="num">${fmt(sum(list, "prod_total"), 1)}</b><span>${L("طن إنتاج", "t produced")}</span></div><div><b class="num">${fmt(sum(list, "area_ha"), 1)}</b><span>${L("هكتار", "ha")}</span></div></div>
      <div class="drawer-b"><ul class="drill-list">${list.slice(0, MAX).map((f) => `<li><a class="link num" href="#/farm/${encodeURIComponent(f.code)}">${esc(f.code)}</a><span class="trunc">${esc(t(f.project))}</span><b class="num">${f.prod_total != null ? `${fmt(f.prod_total, 1)} ${U.t()}` : "—"}</b>${statusCell(f.lease_status)}</li>`).join("") || `<li class="muted">${L("لا توجد مزارع", "No farms")}</li>`}</ul>
        ${list.length > MAX ? `<p class="muted" style="font-size:13px">${L(`تُعرض أول ${MAX} مزرعة — افتح القائمة لرؤية الكل.`, `Showing the first ${MAX} — open the list to see all.`)}</p>` : ""}</div>
      <div class="drawer-f"><button class="reset" data-dx>${L("تصدير Excel", "Export Excel")}</button><button class="apply" data-dopen>${L("فتح في قائمة المزارع", "Open in farms list")}</button></div></aside>`;
    const close = () => (root.innerHTML = "");
    root.querySelectorAll("[data-dclose]").forEach((b) => (b.onclick = close));
    root.querySelector("[data-dx]").onclick = () => exportFarms("xlsx", list);
    root.querySelector("[data-dopen]").onclick = () => { close(); location.hash = go; };
    root.querySelectorAll(".drill-list a").forEach((a) => a.addEventListener("click", close));
    const esc_ = (e) => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc_); } };
    document.addEventListener("keydown", esc_);
  }
  const go = (path, params) => `data-go="${esc(href(path, params))}"`;
  const multi = (v) => (v ? String(v).split(",").filter(Boolean) : []);
  const SEL = new Set(); // farm codes selected for export (kept across filters/pages)

  // ------------------------------------------------------------ dashboard
  function dashboard(params) {
    const scope = "plan";
    const base = scoped(scope);
    const F = base;
    const prod = F.filter((f) => f.prod_total != null);
    const T = {
      area: sum(F, "area_ha"), palms: sum(F, "date_trees"), prod: sum(prod, "prod_total"), g1: sum(prod, "prod_g1"), g2: sum(prod, "prod_g2"), g3: sum(prod, "prod_g3"),
      wells: sum(F, "wells_total"), wa: sum(F, "wells_active"), wi: sum(F, "wells_inactive"), meters: sum(F, "meters_total"), mw: sum(F, "meters_working"), mn: sum(F, "meters_not_working"),
      mapped: F.filter((f) => f.geometry_source).length, leased: F.filter((f) => LEASED.has(f.lease_status)).length,
    };
    // every drill-down keeps the dashboard's own filters
    const keep = {};
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
    const top = [...prod].sort((a, b) => b.prod_total - a.prod_total).slice(0, 5);
    const G = GRADES();
    // one-line takeaways shown under each card title
    const south = sides.find((x) => x.s === "South") || { g1: 0, g2: 0, g3: 0, n: 0 };
    const worstReg = [...regions].sort((a, b) => b.i - a.i)[0];
    const top5 = top.reduce((a, f) => a + (f.prod_total || 0), 0);
    const unq = quality.find((q) => !q.key);
    const notLeased = lease.find((x) => x.key === "Not Leased");
    const INS = {
      prod: L(`الجنوب ينتج ${fmt(pct(south.g1 + south.g2 + south.g3, T.prod), 0)}% من التمور بـ ${fmt(pct(south.n, prod.length), 0)}% فقط من المزارع المنتجة`, `The south grows ${fmt(pct(south.g1 + south.g2 + south.g3, T.prod), 0)}% of the dates with only ${fmt(pct(south.n, prod.length), 0)}% of producing farms`),
      ops: L(`${fmt(T.mn)} عدادات لا تعمل و ${fmt(T.wi)} بئراً متوقفة تحتاج متابعة`, `${fmt(T.mn)} meters not working and ${fmt(T.wi)} inactive wells need follow-up`),
      quality: unq ? L(`${fmt(pct(unq.value, prod.length), 0)}% من المزارع المنتجة بلا تصنيف جودة`, `${fmt(pct(unq.value, prod.length), 0)}% of producing farms have no quality grade`) : "",
      lease: notLeased ? L(`${fmt(pct(notLeased.value, F.length), 0)}% من المزارع ما زالت غير مؤجرة`, `${fmt(pct(notLeased.value, F.length), 0)}% of the farms are still not leased`) : "",
      wells: worstReg ? L(`${t(worstReg.r)} فيها أكبر عدد من الآبار المتوقفة (${fmt(worstReg.i)})`, `${t(worstReg.r)} has the most inactive wells (${fmt(worstReg.i)})`) : "",
      top: L(`أعلى 5 مزارع تنتج ${fmt(pct(top5, T.prod), 0)}% من كل الإنتاج`, `The top 5 farms grow ${fmt(pct(top5, T.prod), 0)}% of all production`),
    };

    app.innerHTML = `
      ${head(L("لوحة مؤشرات المزارع المنزوعة", "AlUla Expropriated Farms Dashboard"), L("انقر على أي رقم أو شريط لعرض المزارع التي خلفه", "Click any figure or bar to see the farms behind it"))}
      <div class="kpis k6">
        <div class="kpi green clickable" ${go("/farms", keep)} ${tipAttrs(L("عدد المزارع", "Farms"), L(`كل المزارع المنزوعة في المخطط. منها ${fmt(T.leased)} مؤجرة (كلياً أو جزئياً) و ${fmt(F.length - T.leased)} غير مؤجرة. انقر لعرض القائمة.`, `All expropriated farms in the plan: ${fmt(T.leased)} leased (fully or partly) and ${fmt(F.length - T.leased)} not leased. Click to list them.`))}><div class="kl">${chip("sprout", "ic sm")}<span>${L("عدد المزارع", "Farms")}</span></div><div class="kv t-primary">${fmt(F.length)}</div><div class="ks t-primary">${L(`${fmt(T.leased)} مؤجرة · ${fmt(F.length - T.leased)} غير مؤجرة`, `${fmt(T.leased)} leased · ${fmt(F.length - T.leased)} not`)}</div></div>
        <div class="kpi clickable" ${go("/farms", { ...keep, sort: "area_ha", dir: "desc" })} ${tipAttrs(L("المساحة الإجمالية", "Total area"), L(`مجموع مساحات المزارع محسوبة من حدودها على الخريطة. الهكتار = 10,000 م². متوسط المزرعة ${fmt(T.area / (F.length || 1), 2)} هكتار.`, `Sum of farm areas measured from their map boundaries (1 ha = 10,000 m²). Average farm: ${fmt(T.area / (F.length || 1), 2)} ha.`))}><div class="kl">${chip("ruler", "ic sm")}<span>${L("المساحة الإجمالية", "Total area")}</span></div><div class="kv">${fmt(T.area, 0)} <small>${L("هكتار", "ha")}</small></div><div class="ks">${F.length ? L(`${fmt(T.area / F.length, 2)} هكتار / مزرعة`, `${fmt(T.area / F.length, 2)} ha / farm`) : ""}</div></div>
        <div class="kpi clickable" ${go("/farms", { ...keep, sort: "date_trees", dir: "desc" })} ${tipAttrs(L("أشجار النخيل", "Date palms"), L("عدد أشجار النخيل المسجّلة في كل المزارع، وتحته متوسط عدد النخيل في المزرعة الواحدة.", "Date palms recorded across all farms, with the average per farm below."))}><div class="kl">${chip("palm", "ic sm")}<span>${L("أشجار النخيل", "Date palms")}</span></div><div class="kv">${fmt(T.palms)}</div><div class="ks">${F.length ? L(`${fmt(T.palms / F.length)} نخلة / مزرعة`, `${fmt(T.palms / F.length)} palms / farm`) : ""}</div></div>
        <div class="kpi beige clickable" ${go("/farms", { ...keep, has: "production", sort: "prod_total", dir: "desc" })} ${tipAttrs(L("إنتاج التمور 2026", "Date production 2026"), L(`إجمالي ما أنتجته المزارع من التمور في موسم 2026 بالطن، من ${fmt(prod.length)} مزرعة لها بيانات إنتاج.`, `Total dates produced in the 2026 season, in tonnes, from ${fmt(prod.length)} farms with production data.`))}><div class="kl">${chip("box", "ic sm")}<span>${L("إنتاج التمور 2026", "Date production 2026")}</span></div><div class="kv t-brown">${fmt(T.prod, 1)} <small>${U.t()}</small></div><div class="ks">${L(`من ${fmt(prod.length)} مزرعة`, `from ${fmt(prod.length)} farms`)}</div></div>
        <div class="kpi clickable" ${go("/wells", { scope: params.scope })} ${tipAttrs(L("الآبار", "Wells"), L(`عدد الآبار في سجل آبار المزارع: ${fmt(T.wa)} نشطة تعمل الآن و ${fmt(T.wi)} متوقفة.`, `Wells in the farms register: ${fmt(T.wa)} active and ${fmt(T.wi)} inactive.`))}><div class="kl">${chip("droplet", "ic sm")}<span>${L("الآبار", "Wells")}</span></div><div class="kv">${fmt(T.wells)}</div><div class="ks ${T.wi ? "t-danger" : ""}">${L(`${fmt(T.wa)} نشطة · ${fmt(T.wi)} متوقفة`, `${fmt(T.wa)} active · ${fmt(T.wi)} inactive`)}</div></div>
        <div class="kpi clickable" ${go("/meters", {})} ${tipAttrs(L("عدادات الكهرباء", "Power meters"), L(`عدادات الكهرباء المرتبطة بالمزارع: ${fmt(T.mw)} تعمل و ${fmt(T.mn)} لا تعمل حسب الكشف الكهربائي.`, `Power meters linked to the farms: ${fmt(T.mw)} working and ${fmt(T.mn)} not working per inspection.`))}><div class="kl">${chip("meter", "ic sm")}<span>${L("عدادات الكهرباء", "Power meters")}</span></div><div class="kv">${fmt(T.meters)}</div><div class="ks t-primary">${L(`${fmt(T.mw)} تعمل · ${fmt(T.mn)} لا تعمل`, `${fmt(T.mw)} working · ${fmt(T.mn)} not working`)}</div></div>
      </div>
      <div class="grid12">
        ${card("trend", L("إنتاج التمور حسب الدرجة (طن)", "Date production by grade (t)"), prod.length ? `
          <div class="grid12" style="margin:0">
            <div class="c6"><div class="sub-h">${L("حسب الجهة", "By side")}</div>
              ${sides.map((x) => tipOn(clickRow(prow(`${x.s ? t(x.s) : L("غير محدد", "Not specified")} (${fmt(x.n)} ${U.farms()})`, `${fmt(x.g1 + x.g2 + x.g3, 1)} ${U.t()}`, [{ v: x.g1, c: GRADE[0], hl: "grade:1" }, { v: x.g2, c: GRADE[1], hl: "grade:2" }, { v: x.g3, c: GRADE[2], hl: "grade:3" }], T.prod), x.s ? href("/farms", { side: x.s, has: "production" }) : null), x.s ? t(x.s) : L("غير محدد", "Not specified"), L(`${fmt(x.g1 + x.g2 + x.g3, 1)} طن من ${fmt(x.n)} مزرعة: درجة أولى ${fmt(x.g1, 1)}، ثانية ${fmt(x.g2, 1)}، ثالثة ${fmt(x.g3, 1)} طن. انقر لعرض المزارع.`, `${fmt(x.g1 + x.g2 + x.g3, 1)} t from ${fmt(x.n)} farms: grade 1 ${fmt(x.g1, 1)}, grade 2 ${fmt(x.g2, 1)}, grade 3 ${fmt(x.g3, 1)} t. Click to list the farms.`), { rows: [[G[0], `${fmt(x.g1, 1)} ${U.t()}`, GRADE[0]], [G[1], `${fmt(x.g2, 1)} ${U.t()}`, GRADE[1]], [G[2], `${fmt(x.g3, 1)} ${U.t()}`, GRADE[2]], [L("متوسط المزرعة", "Average per farm"), `${fmt((x.g1 + x.g2 + x.g3) / (x.n || 1), 2)} ${U.t()}`, ""], [L("نصيبها من الإنتاج", "Share of production"), `${fmt(pct(x.g1 + x.g2 + x.g3, T.prod), 0)}%`, ""]] })).join("")}
              ${tipOn(clickRow(prow(`${L("الإجمالي", "Total")} (${fmt(prod.length)} ${U.farms()})`, `<b>${fmt(T.prod, 1)} ${U.t()}</b>`, [{ v: T.g1, c: GRADE[0], hl: "grade:1" }, { v: T.g2, c: GRADE[1], hl: "grade:2" }, { v: T.g3, c: GRADE[2], hl: "grade:3" }], T.prod), href("/farms", { has: "production" })), L("الإجمالي", "Total"), L(`كل إنتاج المزارع ${fmt(T.prod, 1)} طن. الألوان داخل الشريط تبين نصيب كل درجة من الإجمالي.`, `All farms: ${fmt(T.prod, 1)} t. The colours inside the bar show each grade's share.`), { rows: [[G[0], `${fmt(T.g1, 1)} ${U.t()}`, GRADE[0]], [G[1], `${fmt(T.g2, 1)} ${U.t()}`, GRADE[1]], [G[2], `${fmt(T.g3, 1)} ${U.t()}`, GRADE[2]]] })}
            </div>
            <div class="c6"><div class="sub-h">${L("حسب الدرجة", "By grade")}</div>
              ${[[L("درجة أولى — جودة عالية", "Grade 1 — high quality"), T.g1, "High"], [L("درجة ثانية — متوسطة", "Grade 2 — medium"), T.g2, "Medium"], [L("درجة ثالثة — شيص", "Grade 3 — Shees (low)"), T.g3, "Low"]]
                .map(([lab, v, q], i) => tipOn(clickRow(prow(lab, `${fmt(v, 1)} ${U.t()} (${fmt(pct(v, T.prod), 0)}%)`, [{ v, c: GRADE[i] }], T.prod), href("/farms", { ...keep, quality: q })), lab, L(`${fmt(v, 1)} طن، أي ${fmt(pct(v, T.prod), 0)}% من كل الإنتاج. انقر لعرض المزارع بهذه الجودة.`, `${fmt(v, 1)} t, ${fmt(pct(v, T.prod), 0)}% of all production. Click to list farms of this quality.`), { hl: `grade:${i + 1}`, rows: sides.map((x) => [x.s ? t(x.s) : L("غير محدد", "Not specified"), `${fmt([x.g1, x.g2, x.g3][i], 1)} ${U.t()}`, ""]) })).join("")}
            </div>
          </div>${legend(G.map((g, i) => [g, GRADE[i], `grade:${i + 1}`]))}` : `<p class="muted">${L("لا توجد بيانات إنتاج لهذا النطاق.", "No production data for this scope.")}</p>`, { span: "c7", insight: INS.prod, tip: L("كمية التمور المنتجة مقسّمة حسب الجهة وحسب الدرجة. الدرجة الأولى أعلى جودة والثالثة (الشيص) أقلها. طول الشريط = نصيبه من الإجمالي.", "Dates produced, split by side and by grade. Grade 1 is the best quality, grade 3 (Shees) the lowest. Bar length = share of the total.") })}
        ${card("gauge", L("مؤشرات التشغيل", "Operational indicators"), `<div class="rings">
            <div class="ring clickable" ${go("/meters", { status: "Working" })}${tipAttrs(L("عدادات تعمل", "Meters working"), L(`${fmt(T.mw)} من ${fmt(T.meters)} عداد تعمل. كلما امتلأت الدائرة كان الوضع أفضل.`, `${fmt(T.mw)} of ${fmt(T.meters)} meters work. The fuller the ring, the better.`))}>${ringInner(pct(T.mw, T.meters), C.green, L("عدادات تعمل", "Meters working"))}</div>
            <div class="ring clickable" ${go("/wells", { scope: params.scope })}${tipAttrs(L("آبار نشطة", "Wells active"), L(`${fmt(T.wa)} من ${fmt(T.wells)} بئر نشطة، والباقي متوقف.`, `${fmt(T.wa)} of ${fmt(T.wells)} wells are active; the rest are inactive.`))}>${ringInner(pct(T.wa, T.wells), C.brown, L("آبار نشطة", "Wells active"))}</div>
            <div class="ring clickable" ${go("/farms", { lease: "Full,Partial,Mixed" })}${tipAttrs(L("مزارع مؤجرة", "Farms leased"), L(`${fmt(T.leased)} مزرعة مؤجرة من ${fmt(F.length)}. النسبة المنخفضة تعني أن أغلب المزارع ما زالت غير مؤجرة.`, `${fmt(T.leased)} of ${fmt(F.length)} farms are leased. A low share means most farms are still unleased.`))}>${ringInner(pct(T.leased, F.length), C.gold, L("مزارع مؤجرة", "Farms leased"))}</div>
          </div>
          <div class="strip" style="margin-top:16px"><div class="clickable" ${go("/farms", { ...keep, has: "production" })}${tipAttrs(L("مزارع لها إنتاج", "Producing farms"), L("عدد المزارع التي سُجّل لها إنتاج تمور هذا الموسم.", "Farms with recorded date production this season."))}><b class="num">${fmt(prod.length)}</b><span>${L("مزارع لها إنتاج", "Producing farms")}</span></div><div${tipAttrs(L("كجم / نخلة", "kg / palm"), L("متوسط إنتاج النخلة الواحدة من التمور بالكيلوجرام (الإنتاج ÷ عدد النخيل).", "Average dates per palm in kg (production ÷ palms)."))}><b class="num">${fmt(T.palms ? (T.prod * 1000) / T.palms : 0, 1)}</b><span>${L("كجم / نخلة", "kg / palm")}</span></div><div class="clickable" ${go("/farms", { ...keep, deserted: "Yes" })}${tipAttrs(L("مرشحة للترك", "To be deserted"), L("مزارع أوصت الدراسة بتركها لضعف جدواها. انقر لعرضها.", "Farms the study recommends deserting. Click to list them."))}><b class="num">${fmt(F.filter((f) => f.deserted === "Yes").length)}</b><span>${L("مرشحة للترك", "To be deserted")}</span></div></div>`, { span: "c5", insight: INS.ops, tip: L("ثلاث نسب سريعة لحالة المزارع: العدادات التي تعمل، والآبار النشطة، والمزارع المؤجرة. وتحتها أرقام مختصرة عن الإنتاج.", "Three quick health ratios: working meters, active wells and leased farms, with short production figures below.") })}
      </div>
      <div class="grid12">
        ${card("pie", L("جودة التمور", "Date quality"), donutLinks(quality, (x) => href("/farms", { ...keep, quality: x.key || "none", has: "production" }), "quality"), { span: "c6", insight: INS.quality, tip: L("توزيع المزارع المنتجة حسب جودة تمورها. «غير مصنفة» أي لم تُسجّل جودتها، وأغلبها مزارع الشمال.", "Producing farms by date quality. “Unclassified” means no quality was recorded (mostly northern farms).") })}
        ${card("layers", L("حالة التأجير", "Lease status"), donutLinks(lease, (x) => href("/farms", { ...keep, lease: x.key || "none" }), "lease"), { span: "c6", insight: INS.lease, tip: L("كم مزرعة مؤجرة وكم غير مؤجرة. «مختلطة» أي بعض قطع المزرعة مؤجرة كلياً وبعضها جزئياً.", "How many farms are leased or not. “Mixed” means some plots are fully leased and others partly.") })}
      </div>
      <div class="grid12">
        ${card("droplet", L("الآبار حسب المنطقة", "Wells by region"), regions.length ? regions.map((r) => tipOn(clickRow(prow(r.r ? t(r.r) : L("غير محدد", "Not specified"), activeOf(r.a, r.a + r.i), [{ v: r.a, c: C.green }, { v: r.i, c: C.red }], regMax), r.r ? href("/farms", { ...keep, region: r.r, has: "wells" }) : null), r.r ? t(r.r) : L("غير محدد", "Not specified"), L(`${fmt(r.a + r.i)} بئر: ${fmt(r.a)} نشطة (الجزء الأخضر) و ${fmt(r.i)} متوقفة (الجزء البني). انقر لعرض مزارع المنطقة.`, `${fmt(r.a + r.i)} wells: ${fmt(r.a)} active (green) and ${fmt(r.i)} inactive (ochre). Click to list the farms.`), { rows: [[L("نشطة", "Active"), fmt(r.a), C.green], [L("متوقفة", "Inactive"), fmt(r.i), C.red], [L("نسبة النشطة", "Active share"), `${fmt(pct(r.a, r.a + r.i), 0)}%`, ""]] })).join("") + legend([[L("آبار نشطة", "Active wells"), C.green], [L("آبار متوقفة", "Inactive wells"), C.red]]) : `<p class="muted">${L("لا توجد آبار مسجلة لهذا النطاق.", "No wells recorded for this scope.")}</p>`, { span: "c5", insight: INS.wells, tip: L("عدد الآبار في كل منطقة. الجزء الأخضر من الشريط آبار نشطة، والجزء البني آبار متوقفة.", "Wells per region. The green part of each bar is active wells, the ochre part inactive.") })}
        ${card("award", L("أعلى 5 مزارع إنتاجاً", "Top 5 producing farms"), `<div class="scroll"><table class="tbl"><thead><tr><th>${L("رمز المزرعة", "Farm code")}</th><th>${L("المشروع", "Project")}</th><th>${L("الجهة", "Side")}</th><th>${L("النخيل", "Palms")}</th><th>${L("الإنتاج (طن)", "Production (t)")}</th><th>${L("الجودة", "Quality")}</th></tr></thead><tbody>
          ${top.map((f) => `<tr class="clickable" ${go(`/farm/${encodeURIComponent(f.code)}`, {})}${tipAttrs(f.code, L(`${fmt(f.prod_total, 1)} طن من ${fmt(f.date_trees)} نخلة. انقر لفتح ملف المزرعة.`, `${fmt(f.prod_total, 1)} t from ${fmt(f.date_trees)} palms. Click to open the farm profile.`), { rows: [[L("الإنتاج", "Production"), `${fmt(f.prod_total, 1)} ${U.t()}`, ""], [L("كجم / نخلة", "kg / palm"), fmt(f.date_trees ? (f.prod_total * 1000) / f.date_trees : 0, 1), ""], [L("مقارنة بمتوسط المزرعة", "vs average farm"), `×${fmt(f.prod_total / ((T.prod / (prod.length || 1)) || 1), 1)}`, ""], [L("الجودة", "Quality"), t(f.prod_quality), QUALITY[f.prod_quality] || ""]] })}><td>${farmLink(f.code)}</td><td>${esc(t(f.project))}</td><td>${t(f.side)}</td><td class="num">${fmt(f.date_trees)}</td><td class="num"><b>${fmt(f.prod_total, 2)}</b></td><td>${badge(f.prod_quality)}</td></tr>`).join("")}
          </tbody></table></div>`, { span: "c7", insight: INS.top, tip: L("أكثر خمس مزارع إنتاجاً للتمور هذا الموسم. انقر على أي صف لفتح ملف المزرعة.", "The five farms that produced the most dates this season. Click a row to open its profile."), action: `<a class="link" href="${href("/farms", { ...keep, sort: "prod_total", dir: "desc" })}">${L("كل المزارع", "All farms")}</a>` })}
      </div>`;
    animateIn(app);
  }
  // numbers count up and bars grow on the first dashboard view of the session (skipped for reduced motion)
  let animated = false;
  function animateIn(root) {
    if (animated || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animated = true;
    root.classList.add("anim");
    setTimeout(() => root.classList.remove("anim"), 1200);
    root.querySelectorAll(".kpi .kv, .strip b").forEach((el) => {
      const node = [...el.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.textContent));
      if (!node) return;
      const raw = node.textContent.trim();
      const target = parseFloat(raw.replace(/,/g, ""));
      if (!isFinite(target)) return;
      const dec = (raw.split(".")[1] || "").replace(/\D/g, "").length;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 700);
        node.textContent = `${fmt(target * (1 - Math.pow(1 - k, 3)), dec)} `;
        if (k < 1) requestAnimationFrame(step);
        else node.textContent = `${raw} `;
      };
      requestAnimationFrame(step);
    });
  }
  // adds a hover explanation to the first element of an HTML snippet
  // extra.rows: [[label, value, colour]] drawn as a small breakdown; extra.hl: linked-highlight key ("group:key")
  const tipAttrs = (title, text, extra = {}) => ` data-tip-t="${esc(title)}" data-tip="${esc(text)}"${extra.rows ? ` data-tip-rows="${esc(JSON.stringify(extra.rows))}"` : ""}${extra.hl ? ` data-hl="${esc(extra.hl)}"` : ""}`;
  const tipOn = (html, title, text, extra) => html.replace(/^(\s*<[a-z0-9]+)/i, `$1${tipAttrs(title, text, extra)}`);
  const clickRow = (html, target) => (target ? html.replace('<div class="prow">', `<div class="prow clickable" data-go="${esc(target)}">`) : html);
  const ringInner = (p, color, label) => `<div class="r" style="background:conic-gradient(${color} ${p * 3.6}deg, var(--track) 0)"><b class="num">${fmt(p, 1)}%</b></div><span>${label}</span>`;
  function donutLinks(items, target, group = "") {
    let i = 0;
    return donut(items, group).replace(/<li /g, () => {
      const tg = target(items[i++]);
      return tg ? `<li class="clickable" data-go="${esc(tg)}" ` : "<li ";
    });
  }

  // ------------------------------------------------------------ farms list (Agriculture Center IPM pattern)
  const COLS = () => [
    ["code", L("رمز المزرعة", "Farm code")], ["project", L("المشروع", "Project")], ["region", L("المنطقة", "Region")], ["side", L("الجهة", "Side")],
    ["area_ha", L("المساحة (هـ)", "Area (ha)")], ["date_trees", L("النخيل", "Palms")], ["prod_total", L("الإنتاج (طن)", "Production (t)")], ["prod_quality", L("الجودة", "Quality")],
    ["wells_total", L("الآبار", "Wells")], ["meters_total", L("العدادات", "Meters")], ["lease_status", L("التأجير", "Lease")],
  ];
  // columns the viewer turned off (kept per browser); region and wells are mostly empty, so they start hidden
  let HIDDEN_COLS = ["region", "wells_total"];
  try { const v = JSON.parse(localStorage.getItem("farms-cols-hidden") || "null"); if (Array.isArray(v)) HIDDEN_COLS = v; } catch { /* storage blocked */ }
  const VCOLS = () => COLS().filter(([k]) => k === "code" || !HIDDEN_COLS.includes(k));
  // filter fields shown in the drawer: [param, farm field, label]
  const FILTERS = () => [
    ["side", "side", L("الجهة", "Side")], ["region", "region", L("المنطقة", "Region")], ["lease", "lease_status", L("حالة التأجير", "Lease status")],
    ["cluster", "cluster", L("العنقود", "Cluster")], ["quality", "prod_quality", L("جودة التمور", "Date quality")], ["expro", "expropriation", L("حالة النزع", "Expropriation")], ["has", null, L("تحتوي على", "Has")],
  ];
  // cluster codes are "1".."7" and "COD"
  const clName = (v) => (/^\d+$/.test(v) ? L(`العنقود ${v}`, `Cluster ${v}`) : t(v));
  const fLabel = (k, v) => (v === "none" ? L("غير محدد", "Not specified") : k === "cluster" ? clName(v) : t(v));
  const HAS = () => [["map", L("حدود على الخريطة", "Map boundary")], ["production", L("بيانات إنتاج", "Production data")], ["meters", L("عدادات كهرباء", "Power meters")], ["wells", L("آبار", "Wells")]];
  const hasTest = { map: (f) => !!f.geometry_source, production: (f) => f.prod_total != null, meters: (f) => f.meters_total > 0, wells: (f) => f.wells_total > 0 };
  function filterFarms(p, q = p.q) {
    const scope = "plan";
    const ql = (q || "").toLowerCase();
    const sets = Object.fromEntries(FILTERS().map(([k]) => [k, multi(p[k])]));
    let rows = scoped(scope).filter((f) =>
      (!ql || [f.code, f.region, f.project, f.plot_code, f.cluster].some((v) => v && String(v).toLowerCase().includes(ql))) &&
      FILTERS().every(([k, field]) => !sets[k].length || (field ? sets[k].includes(f[field] ?? "") || (sets[k].includes("none") && !f[field]) : sets[k].every((h) => hasTest[h]?.(f)))) &&
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
    let { rows, scope, sort, dir } = filterFarms(p);
    let page = Math.max(1, Number(p.page) || 1);
    let query = p.q || "";
    const activeCount = FILTERS().reduce((n, [k]) => n + multi(p[k]).length, 0) + (p.deserted ? 1 : 0);
    const chips = [
      ...FILTERS().flatMap(([k, , label]) => multi(p[k]).map((v) => [k, v, k === "cluster" ? clName(v) : `${label}: ${k === "has" ? HAS().find((h) => h[0] === v)?.[1] ?? v : fLabel(k, v)}`])),
      ...(p.deserted ? [["deserted", p.deserted, L("مرشحة للترك", "To be deserted")]] : []),
    ];
    app.innerHTML = `<div id="farms-root">
      ${head(L("المزارع", "Farms"), L("حدد المزارع ثم اضغط «تصدير» لتنزيل بياناتها", "Select farms, then press Export to download their data"), scopePick(scope, "/farms", { ...p, page: undefined }))}
      <div class="list-card">
        <div class="list-bar">
          <label class="list-search">${ico("search")}<input id="fq" value="${esc(query)}" placeholder="${L("ابحث برمز المزرعة، المشروع، المنطقة، رمز القطعة", "Search by farm code, project, region, plot code")}" aria-label="${L("بحث", "Search")}" /></label>
          <div class="rel"><button class="tbtn ghost" id="cbtn">${ico("table")}${L("الأعمدة", "Columns")}</button><div class="menu cols-menu" id="cmenu" hidden>${COLS().filter(([k]) => k !== "code").map(([k, l]) => `<label><input type="checkbox" data-col="${k}" ${HIDDEN_COLS.includes(k) ? "" : "checked"} /> ${l}</label>`).join("")}</div></div>
          <button class="tbtn ghost" id="fbtn">${ico("filter")}${L("فلتر", "Filter")}${activeCount ? `<span class="cnt">${activeCount}</span>` : ""}</button>
          <div class="rel"><button class="tbtn" id="xbtn" ${SEL.size ? "" : "disabled"}>${ico("download")}${L("تصدير", "Export")}</button><div class="menu" id="xmenu" hidden></div></div>
        </div>
        ${chips.length ? `<div class="chips-bar">${chips.map(([k, v, label]) => `<span class="fchip">${esc(label)}<button data-rm="${esc(k)}" data-v="${esc(v)}" aria-label="${L("إزالة", "Remove")}">×</button></span>`).join("")}<button class="sel-line" style="border:0;padding:3px 6px;background:none;color:var(--main);font-weight:600;cursor:pointer" data-go="${esc(href("/farms", { scope: p.scope }))}">${L("مسح الكل", "Clear all")}</button></div>` : ""}
        <div class="sel-line" id="selline"></div>
        <div class="scroll"><table class="tbl ipm"><thead><tr><th style="width:40px"><input type="checkbox" id="selpage" aria-label="${L("تحديد الصفحة", "Select page")}" /></th>${VCOLS().map(([k, l]) => `<th><a href="${href("/farms", { ...p, sort: k, dir: sort === k && dir === -1 ? "asc" : "desc", page: undefined })}">${l} ${sortIco(sort === k ? (dir === -1 ? "desc" : "asc") : "")}</a></th>`).join("")}</tr></thead><tbody id="ftb"></tbody></table></div>
        <div class="pager2" id="fpager"></div>
      </div>
      <div id="drawer-root"></div></div>`;
    // listeners live on this page's own root, which is replaced on the next render (no build-up on #app)
    const root = document.getElementById("farms-root");

    const cell = (f, k) => {
      if (k === "code") return farmLink(f.code);
      if (k === "project") return `<span class="trunc" style="display:inline-block">${esc(t(f.project))}</span>`;
      if (k === "side") return t(f.side);
      if (k === "prod_quality" || k === "lease_status") return statusCell(f[k]);
      if (k === "wells_total") return f.wells_total ? `${f.wells_total}${f.wells_inactive ? ` <span class="t-danger">(${f.wells_inactive} ${L("متوقفة", "inactive")})</span>` : ""}` : "—";
      if (k === "meters_total") return f.meters_total ? `${f.meters_total}${f.meters_not_working ? ` <span class="t-danger">(${f.meters_not_working} ${L("لا تعمل", "not working")})</span>` : ""}` : "—";
      if (k === "prod_total") return `<b>${fmt(f.prod_total, 2)}</b>`;
      if (k === "area_ha") return fmt(f.area_ha, 2);
      if (k === "region") return esc(t(f.region));
      return fmt(f[k]);
    };
    const tb = document.getElementById("ftb");
    function renderRows() {
      const SIZE = PAGE_SIZE;
      const pages = Math.max(1, Math.ceil(rows.length / SIZE));
      page = Math.min(page, pages);
      const slice = rows.slice((page - 1) * SIZE, page * SIZE);
      tb.innerHTML = slice.map((f) => `<tr class="${SEL.has(f.code) ? "sel" : ""}"><td class="cb"><input type="checkbox" data-code="${esc(f.code)}" ${SEL.has(f.code) ? "checked" : ""} aria-label="${esc(f.code)}" /></td>${VCOLS().map(([k, l]) => `<td data-l="${esc(l)}" class="${["area_ha", "date_trees", "prod_total", "wells_total", "meters_total"].includes(k) ? "num" : ""}">${cell(f, k)}</td>`).join("")}</tr>`).join("")
        || `<tr><td colspan="${VCOLS().length + 1}" class="empty">${L("لا توجد نتائج", "No results")}</td></tr>`;
      document.getElementById("fpager").innerHTML = pagerHtml(page, rows.length, "pg");
      const allOnPage = slice.length && slice.every((f) => SEL.has(f.code));
      document.getElementById("selpage").checked = !!allOnPage;
      renderSel();
      lockCols(root.querySelector("table"));
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
      if (e.target.dataset.col) {
        const k = e.target.dataset.col;
        HIDDEN_COLS = e.target.checked ? HIDDEN_COLS.filter((x) => x !== k) : [...HIDDEN_COLS, k];
        try { localStorage.setItem("farms-cols-hidden", JSON.stringify(HIDDEN_COLS)); } catch { /* storage blocked */ }
        farmsPage(p);
        document.getElementById("cmenu").hidden = false;
        return;
      }
      if (e.target.hasAttribute("data-psize")) { setPageSize(e.target.value); page = 1; renderRows(); return; }
      if (e.target.matches("input[data-code]")) {
        e.target.checked ? SEL.add(e.target.dataset.code) : SEL.delete(e.target.dataset.code);
        e.target.closest("tr").classList.toggle("sel", e.target.checked);
        renderSel();
      } else if (e.target.id === "selpage") {
        rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).forEach((f) => (e.target.checked ? SEL.add(f.code) : SEL.delete(f.code)));
        renderRows();
      }
    });
    root.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.id === "cbtn") { const m = document.getElementById("cmenu"); m.hidden = !m.hidden; return; }
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
        const opts = field ? [...groupBy(base, (f) => f[field] ?? "")].filter(([v]) => v !== "").map(([v, a]) => [v, fLabel(k, v), a.length]).sort((a, b) => String(a[1]).localeCompare(String(b[1]), undefined, { numeric: true }))
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

  // ------------------------------------------------------------ shared list toolbar (same search / Filter / Export pattern as the farms list)
  // cfg: { rows, key(r), cols: [[id, label, html(r), sortVal(r), num]], text(r), filters: [[id, label, value(r), name(v)]],
  //        exports: [[kind, label, hint, icon]], onExport(kind, rows), placeholder, size, init: {q, f: {id: [values]}} }
  const drawerHtml = (sections) => `<div class="drawer-bg" data-dclose></div><aside class="drawer" role="dialog" aria-label="${L("الفلاتر", "Filters")}">
    <div class="drawer-h"><h2>${L("الفلاتر", "Filters")}</h2><button class="drawer-x" data-dclose aria-label="${L("إغلاق", "Close")}">✕</button></div>
    <div class="drawer-b">${sections.map(([k, label, opts, chosen]) => opts.length ? `<div class="fsec ${chosen.length ? "open" : ""}" data-k="${esc(k)}"><div class="fsec-h"><span>${label}${chosen.length ? `<span class="cnt">${chosen.length}</span>` : ""}</span>${ico("chev")}</div>
      <div class="fsec-b"><label class="all"><input type="checkbox" data-all /> ${L("تحديد الكل", "Select all")}</label>
      ${opts.map(([v, l, n]) => `<label><input type="checkbox" value="${esc(v)}" ${chosen.includes(v) ? "checked" : ""} /> ${esc(l)}<small class="num">${fmt(n)}</small></label>`).join("")}</div></div>` : "").join("")}</div>
    <div class="drawer-f"><button class="reset" data-dreset>${L("إعادة تعيين", "Reset")}</button><button class="apply" data-dapply>${L("تطبيق", "Apply")}</button></div></aside>`;
  // wires a drawer rendered into droot; onApply receives {sectionId: [values]} (all ticked == no filter)
  function wireDrawer(droot, onApply) {
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
    droot.querySelectorAll("[data-dclose]").forEach((b) => (b.onclick = close));
    droot.querySelector("[data-dreset]").onclick = () => { droot.querySelectorAll(".fsec input").forEach((b) => (b.checked = false)); droot.querySelectorAll(".fsec .cnt").forEach((c) => c.remove()); };
    droot.querySelector("[data-dapply]").onclick = () => {
      const out = {};
      droot.querySelectorAll(".fsec").forEach((s) => {
        const boxes = [...s.querySelectorAll(".fsec-b input:not([data-all])")];
        const on = boxes.filter((b) => b.checked).map((b) => b.value);
        out[s.dataset.k] = on.length && on.length < boxes.length ? on : [];
      });
      close();
      onApply(out);
    };
  }

  function listTool(host, cfg) {
    let q = cfg.init?.q || "";
    const fsel = Object.fromEntries((cfg.filters || []).map(([k]) => [k, cfg.init?.f?.[k] || []]));
    const sel = new Set();
    let page = 1;
    let sort = null, dir = -1;
    let rows = [];
    const valOf = (r, k) => String((cfg.filters.find((f) => f[0] === k)[2])(r) ?? "");
    function compute() {
      const ql = q.trim().toLowerCase();
      rows = cfg.rows.filter((r) => (!ql || cfg.text(r).toLowerCase().includes(ql)) && Object.entries(fsel).every(([k, vs]) => !vs.length || vs.includes(valOf(r, k))));
      if (sort) {
        const c = cfg.cols.find((x) => x[0] === sort);
        const sv = c[3] || ((r) => r[sort]);
        rows.sort((a, b) => { const x = sv(a), y = sv(b); return x == null ? 1 : y == null ? -1 : (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * -dir; });
      }
    }
    const nf = () => Object.values(fsel).reduce((n, v) => n + v.length, 0);
    host.innerHTML = `<div class="list-card">
      <div class="list-bar">
        <label class="list-search">${ico("search")}<input data-lq value="${esc(q)}" placeholder="${esc(cfg.placeholder || L("بحث", "Search"))}" aria-label="${L("بحث", "Search")}" /></label>
        ${cfg.filters?.length ? `<button class="tbtn ghost" data-lf>${ico("filter")}${L("فلتر", "Filter")}<span class="cnt" data-lfc hidden></span></button>` : ""}
        ${cfg.exports?.length ? `<div class="rel"><button class="tbtn" data-lx disabled>${ico("download")}${L("تصدير", "Export")}</button><div class="menu" data-lxm hidden></div></div>` : ""}
      </div>
      <div data-lchips></div>
      <div class="sel-line" data-lsel></div>
      <div class="scroll"><table class="tbl ipm"><thead><tr>${cfg.exports?.length ? `<th style="width:40px"><input type="checkbox" data-lpage aria-label="${L("تحديد الصفحة", "Select page")}" /></th>` : ""}${cfg.cols.map(([k, l]) => `<th><a href="javascript:void 0" data-lsort="${esc(k)}">${l} <span data-larrow="${esc(k)}">${sortIco("")}</span></a></th>`).join("")}</tr></thead><tbody data-ltb></tbody></table></div>
      <div class="pager2" data-lpager></div>
    </div><div data-ldrawer></div>`;
    const $ = (a) => host.querySelector(`[${a}]`);
    function render() {
      const SIZE = PAGE_SIZE;
      const pages = Math.max(1, Math.ceil(rows.length / SIZE));
      page = Math.min(page, pages);
      const slice = rows.slice((page - 1) * SIZE, page * SIZE);
      const cb = !!cfg.exports?.length;
      $("data-ltb").innerHTML = slice.map((r) => { const k = cfg.key(r); return `<tr class="${sel.has(k) ? "sel" : ""}">${cb ? `<td class="cb"><input type="checkbox" data-lrow="${esc(k)}" ${sel.has(k) ? "checked" : ""} aria-label="${esc(k)}" /></td>` : ""}${cfg.cols.map(([, l, h, , num]) => `<td data-l="${esc(l)}" class="${num ? "num" : ""}">${h(r)}</td>`).join("")}</tr>`; }).join("")
        || `<tr><td colspan="${cfg.cols.length + (cb ? 1 : 0)}" class="empty">${L("لا توجد نتائج", "No results")}</td></tr>`;
      $("data-lpager").innerHTML = pagerHtml(page, rows.length, "lpg");
      if (cb) $("data-lpage").checked = !!slice.length && slice.every((r) => sel.has(cfg.key(r)));
      host.querySelectorAll("[data-larrow]").forEach((a) => (a.innerHTML = sortIco(sort === a.dataset.larrow ? (dir === -1 ? "desc" : "asc") : "")));
      const chips = Object.entries(fsel).flatMap(([k, vs]) => { const f = cfg.filters.find((x) => x[0] === k); return vs.map((v) => [k, v, `${f[1]}: ${f[3] ? f[3](v) : t(v)}`]); });
      $("data-lchips").innerHTML = chips.length ? `<div class="chips-bar">${chips.map(([k, v, l]) => `<span class="fchip">${esc(l)}<button data-lrm="${esc(k)}" data-v="${esc(v)}" aria-label="${L("إزالة", "Remove")}">×</button></span>`).join("")}<button class="sel-line" data-lclear style="border:0;padding:3px 6px;background:none;color:var(--main);font-weight:600;cursor:pointer">${L("مسح الكل", "Clear all")}</button></div>` : "";
      const fc = $("data-lfc");
      if (fc) { fc.hidden = !nf(); fc.textContent = nf(); }
      const inRows = rows.filter((r) => sel.has(cfg.key(r))).length;
      $("data-lsel").innerHTML = `${cb ? `<span><b class="num">${fmt(sel.size)}</b> ${L("محددة", "Selected")}</span>` : ""}<span class="muted">${L(`${fmt(rows.length)} نتيجة`, `${fmt(rows.length)} results`)}</span>
        ${cb && rows.length && inRows < rows.length ? `<button data-lall>${L(`تحديد كل المطابقة (${fmt(rows.length)})`, `Select all matching (${fmt(rows.length)})`)}</button>` : ""}
        ${sel.size ? `<button data-lnone>${L("إلغاء التحديد", "Clear selection")}</button>` : ""}`;
      const x = $("data-lx");
      if (x) x.disabled = !sel.size;
      cfg.onChange?.({ q, f: fsel });
      lockCols(host.querySelector("table"));
    }
    const refresh = () => { compute(); page = 1; render(); };
    let tmr;
    $("data-lq").addEventListener("input", (e) => { clearTimeout(tmr); tmr = setTimeout(() => { q = e.target.value; refresh(); }, 200); });
    host.addEventListener("change", (e) => {
      if (e.target.dataset.lrow != null) { e.target.checked ? sel.add(e.target.dataset.lrow) : sel.delete(e.target.dataset.lrow); render(); }
      else if (e.target.hasAttribute("data-psize")) { setPageSize(e.target.value); page = 1; render(); }
      else if (e.target.hasAttribute("data-lpage")) { rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).forEach((r) => (e.target.checked ? sel.add(cfg.key(r)) : sel.delete(cfg.key(r)))); render(); }
    });
    host.addEventListener("click", (e) => {
      const s = e.target.closest("[data-lsort]");
      if (s) { e.preventDefault(); dir = sort === s.dataset.lsort ? -dir : -1; sort = s.dataset.lsort; compute(); render(); return; }
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.lpg) { page = +b.dataset.lpg; render(); }
      else if (b.hasAttribute("data-lall")) { rows.forEach((r) => sel.add(cfg.key(r))); render(); }
      else if (b.hasAttribute("data-lnone")) { sel.clear(); render(); }
      else if (b.dataset.lrm) { fsel[b.dataset.lrm] = fsel[b.dataset.lrm].filter((v) => v !== b.dataset.v); refresh(); }
      else if (b.hasAttribute("data-lclear")) { Object.keys(fsel).forEach((k) => (fsel[k] = [])); refresh(); }
      else if (b.hasAttribute("data-lf")) {
        const dr = $("data-ldrawer");
        dr.innerHTML = drawerHtml(cfg.filters.map(([k, label, fn, name]) => [k, label, [...groupBy(cfg.rows, (r) => String(fn(r) ?? ""))].filter(([v]) => v !== "").map(([v, a]) => [v, name ? name(v) : t(v), a.length]).sort((a, c) => String(a[1]).localeCompare(String(c[1]), undefined, { numeric: true })), fsel[k]]));
        wireDrawer(dr, (out) => { Object.assign(fsel, out); refresh(); });
      } else if (b.hasAttribute("data-lx")) {
        const m = $("data-lxm");
        m.hidden = !m.hidden;
        m.innerHTML = cfg.exports.map(([k, l, h, i]) => `<button data-lxk="${k}">${ico(i)}<span>${l}<small>${h}</small></span></button>`).join("");
      } else if (b.dataset.lxk) { $("data-lxm").hidden = true; cfg.onExport(b.dataset.lxk, cfg.rows.filter((r) => sel.has(cfg.key(r)))); }
    });
    compute();
    render();
  }
  // plain table export (xlsx / csv) for lists that are not farms
  async function exportRows(kind, name, cols, rows) {
    if (!rows.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const data = rows.map((r) => Object.fromEntries(cols.map(([l, fn]) => [l, fn(r) ?? ""])));
    if (kind === "csv") {
      const q = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
      const nl = String.fromCharCode(13, 10);
      download(`${name}-${stamp}.csv`, new Blob(["﻿" + [cols.map((c) => q(c[0])).join(","), ...data.map((r) => cols.map((c) => q(r[c[0]])).join(","))].join(nl)], { type: "text/csv;charset=utf-8" }));
      return;
    }
    const TITLES = { "alula-wells": L("الآبار الممسوحة", "Surveyed wells"), "alula-meters": L("عدادات الكهرباء", "Power meters") };
    await styledBook([{ name: TITLES[name] || name, title: TITLES[name] || name, rows: data }], `${name}-${stamp}.xlsx`);
  }
  const XLS_CSV = () => [["xlsx", L("ملف Excel", "Excel workbook"), L("الصفوف المحددة", "Selected rows"), "sheet"], ["csv", "CSV", L("الصفوف المحددة", "Selected rows"), "table"]];
  const FARM_EXPORTS = () => [["xlsx", L("ملف Excel", "Excel workbook"), L("المزارع + العدادات + الآبار", "Farms + meters + wells"), "sheet"], ["csv", "CSV", L("بيانات المزارع فقط", "Farm data only"), "table"], ["kml", "KML", L("الحدود لـ Google Earth", "Boundaries for Google Earth"), "globe"], ["geojson", "GeoJSON", L("الحدود لبرامج GIS", "Boundaries for GIS"), "map"]];

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
    ["side", L("الجهة", "Side")], ["cluster", L("العنقود", "Cluster")], ["land_use", L("استخدام الأرض", "Land use")], ["area_ha", L("المساحة المحسوبة (هـ)", "Calculated area (ha)")], ["calc_area_m2", L("المساحة المحسوبة (م²)", "Calculated area (m²)")], ["calc_perim_m", L("المحيط (م)", "Perimeter (m)")], ["area_reg", L("المساحة المسجلة (هـ)", "Registered area (ha)")],
    ["date_trees", L("النخيل", "Date palms")], ["citrus_trees", L("الحمضيات", "Citrus")], ["mango_trees", L("المانجو", "Mango")],
    ["prod_g1", L("درجة أولى (طن)", "Grade 1 (t)")], ["prod_g2", L("درجة ثانية (طن)", "Grade 2 (t)")], ["prod_g3", L("درجة ثالثة (طن)", "Grade 3 (t)")], ["prod_total", L("إجمالي الإنتاج (طن)", "Total production (t)")],
    ["prod_quality", L("الجودة", "Quality")], ["varieties", L("الأصناف", "Varieties")], ["wells_active", L("آبار نشطة", "Active wells")], ["wells_inactive", L("آبار متوقفة", "Inactive wells")],
    ["wells_total", L("إجمالي الآبار", "Total wells")], ["meters_total", L("العدادات", "Meters")], ["meters_working", L("عدادات تعمل", "Meters working")], ["meters_not_working", L("عدادات لا تعمل", "Meters not working")],
    ["lease_status", L("حالة التأجير", "Lease status")], ["expropriation", L("حالة النزع", "Expropriation")], ["deserted", L("مرشحة للترك", "To be deserted")],
    ["capex", L("التكلفة الرأسمالية (ر.س)", "CAPEX (SAR)")], ["opex", L("التشغيل السنوي (ر.س)", "OPEX/yr (SAR)")], ["rev_y3", L("إيراد السنة 3 (ر.س)", "Year-3 revenue (SAR)")],
    ["lat", L("خط العرض (المركز)", "Latitude (centre)")], ["lng", L("خط الطول (المركز)", "Longitude (centre)")],
  ];
  // Branded workbook: title band, export date + row count, dark header row, banded rows, borders,
  // number formats, sized columns, auto-filter, frozen header and right-to-left sheets in Arabic.
  const XLSX_SRC = "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js";
  async function styledBook(sheets, fileName) {
    if (!window.XLSX || !window.XLSX.__styled) { await loadScript(XLSX_SRC); window.XLSX.__styled = true; }
    const X = window.XLSX;
    const wb = X.utils.book_new();
    const font = "Arial"; // RCU business-document font
    const border = { top: { style: "thin", color: { rgb: "E2D9CE" } }, bottom: { style: "thin", color: { rgb: "E2D9CE" } }, left: { style: "thin", color: { rgb: "E2D9CE" } }, right: { style: "thin", color: { rgb: "E2D9CE" } } };
    const align = { horizontal: LANG === "ar" ? "right" : "left", vertical: "center", wrapText: false };
    const stamp = new Date().toLocaleDateString(LOCALE(), { day: "numeric", month: "long", year: "numeric" });
    const COORD = /خط العرض|خط الطول|latitude|longitude/i; // coordinates keep 6 decimals
    for (const { name, title, rows } of sheets) {
      const cols = rows.length ? Object.keys(rows[0]) : ["-"];
      const aoa = [[title], [L(`${NAME} · تاريخ التصدير: ${stamp} · عدد الصفوف: ${rows.length}`, `${NAME} · Exported ${stamp} · ${rows.length} rows`)], [], cols, ...rows.map((r) => cols.map((c) => r[c] ?? ""))];
      const ws = X.utils.aoa_to_sheet(aoa);
      const last = Math.max(0, cols.length - 1);
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: last } }, { s: { r: 1, c: 0 }, e: { r: 1, c: last } }];
      const set = (r, c, st) => { const a = X.utils.encode_cell({ r, c }); ws[a] = ws[a] || { t: "s", v: "" }; ws[a].s = st; };
      for (let c = 0; c <= last; c++) {
        set(0, c, { font: { name: font, sz: 16, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "3D3936" } }, alignment: { ...align, vertical: "center" } });
        set(1, c, { font: { name: font, sz: 10, color: { rgb: "805E45" } }, fill: { fgColor: { rgb: "F8F4EF" } }, alignment: align });
        set(3, c, { font: { name: font, sz: 11, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "986018" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border });
      }
      rows.forEach((r, i) => cols.forEach((c, j) => {
        const v = r[c];
        const isNum = typeof v === "number";
        set(4 + i, j, {
          font: { name: font, sz: 10, color: { rgb: "3D3936" }, bold: j === 0 },
          fill: { fgColor: { rgb: i % 2 ? "FBF8F4" : "FFFFFF" } },
          alignment: isNum ? { horizontal: "center", vertical: "center" } : align,
          border,
          numFmt: isNum ? (COORD.test(c) ? "0.000000" : Number.isInteger(v) ? "#,##0" : "#,##0.00") : undefined,
        });
      }));
      ws["!cols"] = cols.map((c) => ({ wch: Math.min(48, Math.max(10, String(c).length + 2, ...rows.slice(0, 400).map((r) => String(r[c] ?? "").length + 2))) }));
      ws["!rows"] = [{ hpt: 30 }, { hpt: 18 }, { hpt: 6 }, { hpt: 30 }];
      ws["!autofilter"] = { ref: X.utils.encode_range({ s: { r: 3, c: 0 }, e: { r: 3 + Math.max(rows.length, 1), c: last } }) };
      ws["!freeze"] = { xSplit: 0, ySplit: 4 };
      X.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    }
    wb.Workbook = { Views: [{ RTL: LANG === "ar" }] };
    X.writeFile(wb, fileName);
  }

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
      const [meters, wells] = await Promise.all([load("meters.json"), load("wells.json")]);
      const mRows = meters.filter((m) => codes.has(m.farm_code)).map((m) => ({
        [L("رمز المزرعة", "Farm code")]: m.farm_code, [L("رقم العداد", "Meter no.")]: m.meter_no, [L("الحالة", "Status")]: t(m.status), [L("مفصول؟", "Disconnected?")]: t(m.disconnected),
        [L("خط العرض", "Latitude")]: m.lat, [L("خط الطول", "Longitude")]: m.lng, [L("التفاصيل", "Details")]: m.details ?? "",
      }));
      const wRows = wells.filter((w) => codes.has(w.farm_code)).map((w) => ({
        [L("رمز المزرعة", "Farm code")]: w.farm_code, [L("اسم البئر", "Well")]: w.name, [L("التصنيف", "Category")]: w.category,
        [L("خط العرض", "Latitude")]: w.lat, [L("خط الطول", "Longitude")]: w.lng, [L("أقرب عداد", "Nearest meter")]: w.nearest_meter ?? "",
      }));
      // translate coded values so the sheet reads naturally
      const nice = farmRows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "string" && v ? t(v) : v])));
      await styledBook([
        { name: L("المزارع", "Farms"), title: L("بيانات المزارع المنزوعة", "Expropriated farms"), rows: nice },
        { name: L("العدادات", "Meters"), title: L("عدادات الكهرباء", "Power meters"), rows: mRows },
        { name: L("الآبار", "Wells"), title: L("الآبار الممسوحة", "Surveyed wells"), rows: wRows },
      ], `alula-farms-${stamp}.xlsx`);
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
  const mkIcon = (kind) => L_.divIcon({ className: "mk-icon", html: `<div class="mk ${kind} ${kind.startsWith("meter") ? "sq" : ""}">${ico(MK[kind])}</div>`, iconSize: [26, 26], iconAnchor: [13, 30], popupAnchor: [0, -28], tooltipAnchor: [12, -18] });
  const wellKind = (cat) => (cat === "Active" ? "well" : cat === "Inactive" ? "well-off" : "well-new");
  // geodesic polygon area (m²) on the WGS84 sphere, same formula as Leaflet.draw
  const geoArea = (pts) => {
    const R = 6378137, d = Math.PI / 180;
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i], p2 = pts[(i + 1) % pts.length];
      a += (p2.lng - p1.lng) * d * (2 + Math.sin(p1.lat * d) + Math.sin(p2.lat * d));
    }
    return Math.abs((a * R * R) / 2);
  };
  const fmtArea = (m2) => (m2 < 10000 ? `${fmt(m2, 0)} ${L("م²", "m²")}` : `${fmt(m2 / 10000, 2)} ${L("هكتار", "ha")} (${fmt(m2, 0)} ${L("م²", "m²")})`);
  const fmtDist = (m) => (m < 1000 ? `${fmt(m, 1)} ${L("م", "m")}` : `${fmt(m / 1000, 2)} ${L("كم", "km")}`);
  const popupRows = (rows) => `<table>${rows.map(([k, v]) => `<tr><td style="color:#6b7280;padding-inline-end:12px">${k}</td><td><b>${v}</b></td></tr>`).join("")}</table>`;
  const farmPopup = (f) => `<div dir="${DIR()}" style="min-width:220px"><a href="#/farm/${encodeURIComponent(f.code)}" title="${L("فتح ملف المزرعة", "Open farm profile")}" style="font-size:15px;font-weight:700;color:${C.green};text-decoration:underline">${esc(f.code)}</a><div style="color:#6b7280;margin-bottom:6px">${esc(t(f.project))}</div>${popupRows([
    [L("العنقود", "Cluster"), f.cluster ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${CLUSTER[f.cluster] || NODATA};vertical-align:middle;margin-inline-end:4px"></span>${esc(clName(f.cluster))}` : L("خارج العناقيد", "No cluster")], [L("الجهة", "Side"), esc(t(f.side))], [L("المساحة", "Area"), `${fmt(f.area_ha, 2)} ${U.ha()}`], [L("النخيل", "Palms"), fmt(f.date_trees)], [L("الإنتاج", "Production"), `${fmt(f.prod_total, 2)} ${U.t()}`],
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

  // ------------------------------------------------------------ data review: area differences, data gaps, alerts
  const LEASED = new Set(["Full", "Partial", "Mixed"]);
  const areaDiff = (f) => (f.calc_area_m2 != null && f.area_reg > 0 ? Math.round(((f.calc_area_m2 / 10000 - f.area_reg) / f.area_reg) * 1000) / 10 || 0 : null);
  const GAPS = () => [
    ["boundary", L("بدون حدود على الخريطة", "No map boundary"), (f) => f.calc_area_m2 == null],
    ["production", L("بدون بيانات إنتاج", "No production data"), (f) => f.prod_total == null],
    ["meters", L("بدون عداد كهرباء", "No power meter"), (f) => !f.meters_total],
    ["wells", L("بدون آبار مسجلة", "No wells recorded"), (f) => !f.wells_total],
    ["lease", L("حالة التأجير غير محددة", "Lease status missing"), (f) => !f.lease_status],
    ["trees", L("عدد النخيل غير مسجل", "Palm count missing"), (f) => f.date_trees == null],
  ];
  const ALERTS = () => [
    ["meter", L("مزارع مؤجرة بها عداد لا يعمل", "Leased farms with a meter not working"), (f) => LEASED.has(f.lease_status) && f.meters_not_working > 0, C.red],
    ["well", L("مزارع مؤجرة بها آبار متوقفة", "Leased farms with inactive wells"), (f) => LEASED.has(f.lease_status) && f.wells_inactive > 0, "#805E45"],
    ["noprod", L("مزارع مؤجرة بدون بيانات إنتاج", "Leased farms without production data"), (f) => LEASED.has(f.lease_status) && f.prod_total == null, C.gold],
    ["area", L("فرق المساحة أكبر من 20٪", "Area difference above 20%"), (f) => Math.abs(areaDiff(f) ?? 0) > 20, "#402022"],
  ];

  function reviewPage(p) {
    const tab = ["area", "gaps", "alerts"].includes(p.tab) ? p.tab : "alerts";
    const F = scoped();
    const th = [5, 10, 20, 50].includes(+p.th) ? +p.th : 10;
    const A = ALERTS();
    const G = GAPS();
    const alertK = A.some((a) => a[0] === p.alert) ? p.alert : (A.find((a) => F.some(a[2])) || A[0])[0];
    const gapK = G.some((g) => g[0] === p.gap) ? p.gap : "";
    const chip = (on, h, l) => `<a href="${h}" class="chip ${on ? "on" : ""}">${l}</a>`;
    const cnt = (fn) => F.filter(fn).length;
    let list, title, extra = "";
    if (tab === "area") {
      list = F.filter((f) => Math.abs(areaDiff(f) ?? 0) > th).sort((a, b) => Math.abs(areaDiff(b)) - Math.abs(areaDiff(a)));
      title = L(`المزارع التي يختلف فيها فرق المساحة بأكثر من ${th}٪`, `Farms whose area differs by more than ${th}%`);
      extra = `<div class="chips" style="margin-bottom:12px"><span class="muted" style="align-self:center">${L("الحد الأدنى للفرق:", "Minimum difference:")}</span>${[5, 10, 20, 50].map((v) => chip(th === v, href("/review", { tab, th: v }), `${v}%`)).join("")}</div>`;
    } else if (tab === "gaps") {
      const sel = gapK ? G.filter((g) => g[0] === gapK) : G;
      list = F.filter((f) => sel.some((g) => g[2](f)));
      title = gapK ? G.find((g) => g[0] === gapK)[1] : L("كل مزرعة ينقصها بند واحد على الأقل", "Every farm missing at least one item");
    } else {
      const a = A.find((x) => x[0] === alertK);
      list = F.filter(a[2]);
      title = a[1];
    }
    const diffCell = (f) => { const d = areaDiff(f); return d == null ? "—" : `<b style="color:${d > 0 ? C.green : d < 0 ? C.red : "inherit"}" dir="ltr">${d > 0 ? "+" : ""}${fmt(d, 1)}%</b>`; };
    const missing = (f) => G.filter((g) => g[2](f)).map((g) => `<span class="badge danger" style="margin:1px">${g[1]}</span>`).join("") || `<span class="muted">✓</span>`;
    const cols = [
      ["code", L("رمز المزرعة", "Farm code"), (f) => farmLink(f.code)],
      ["cluster", L("العنقود", "Cluster"), (f) => (f.cluster ? esc(clName(f.cluster)) : "—")],
      ["lease_status", L("التأجير", "Lease"), (f) => statusCell(f.lease_status)],
      ...(tab === "area" ? [
        ["area_reg", L("المسجلة (هـ)", "Registered (ha)"), (f) => fmt(f.area_reg, 2), null, true],
        ["area_ha", L("المحسوبة (هـ)", "Calculated (ha)"), (f) => fmt(f.area_ha, 2), null, true],
        ["diff", L("الفرق ٪", "Difference %"), diffCell, (f) => Math.abs(areaDiff(f) ?? 0), true],
      ] : tab === "gaps" ? [
        ["gaps", L("البيانات الناقصة", "Missing data"), missing, (f) => G.filter((g) => g[2](f)).length],
      ] : [
        ["meters_total", L("العدادات (لا تعمل)", "Meters (not working)"), (f) => `${fmt(f.meters_total)} (${fmt(f.meters_not_working)})`, (f) => f.meters_not_working, true],
        ["wells_total", L("الآبار (متوقفة)", "Wells (inactive)"), (f) => `${fmt(f.wells_total)} (${fmt(f.wells_inactive)})`, (f) => f.wells_inactive, true],
        ["prod_total", L("الإنتاج (طن)", "Production (t)"), (f) => fmt(f.prod_total, 2), null, true],
        ["diff", L("فرق المساحة", "Area diff."), diffCell, (f) => Math.abs(areaDiff(f) ?? 0), true],
      ]),
    ];
    app.innerHTML = `
      ${head(L("مراجعة البيانات", "Data review"), L("التنبيهات ونواقص البيانات وفروقات المساحة للمزارع المنزوعة — انقر على أي بند لعرض مزارعه", "Alerts, data gaps and area differences for the expropriated farms — click any item to list its farms"))}
      <div class="grid12">
        ${card("alert", L("التنبيهات", "Alerts"), `<div class="alerts">${[...A].sort((a, b) => cnt(b[2]) - cnt(a[2])).map(([k, l, fn, c]) => `<a class="alert-i ${tab === "alerts" && k === alertK ? "on" : ""} ${cnt(fn) ? "" : "zero"}" href="${href("/review", { tab: "alerts", alert: k })}" style="--c:${c}"><b class="num">${fmt(cnt(fn))}</b><span>${l}</span></a>`).join("")}</div>`, { span: "c7", tip: L("حالات تحتاج متابعة، مثل مزارع مؤجرة بها عداد لا يعمل أو آبار متوقفة. انقر على أي بطاقة لعرض مزارعها في القائمة.", "Cases that need follow-up, such as leased farms with a broken meter or inactive wells. Click a tile to list its farms.") })}
        ${card("info", L("نواقص البيانات", "Data gaps"), `${G.filter((g) => F.some(g[2])).map(([k, l, fn]) => `<a class="gap-i ${tab === "gaps" && k === gapK ? "on" : ""}" href="${href("/review", { tab: "gaps", gap: k })}"><span>${l}</span><b class="num ${cnt(fn) ? "t-danger" : "t-primary"}">${fmt(cnt(fn))}</b><small class="muted num">/ ${fmt(F.length)}</small></a>`).join("")}
          <a class="link" style="display:inline-block;margin-top:8px" href="${href("/review", { tab: "gaps" })}">${L("كل المزارع التي بها نواقص", "All farms with gaps")}</a>`, { span: "c5", tip: L("بيانات لم تُسجّل للمزارع بعد. الرقم = عدد المزارع التي ينقصها هذا البند من أصل كل المزارع.", "Data not yet recorded. The number = farms missing that item out of all farms.") })}
      </div>
      <div class="chips" style="margin-bottom:12px">${[["alerts", L("التنبيهات", "Alerts")], ["gaps", L("نواقص البيانات", "Data gaps")], ["area", L("فروقات المساحة", "Area differences")]].map(([k, l]) => chip(tab === k, href("/review", { tab: k }), l)).join("")}</div>
      <h2 class="sec-title">${ico("table")}${title} <span class="muted num">(${fmt(list.length)})</span></h2>
      ${extra}
      <div id="rl"></div>`;
    listTool(document.getElementById("rl"), {
      rows: list, key: (f) => f.code, placeholder: L("ابحث برمز المزرعة أو المشروع أو المنطقة", "Search farm code, project or region"),
      text: (f) => [f.code, f.project, f.region].join(" "),
      cols,
      filters: [["side", L("الجهة", "Side"), (f) => f.side], ["cluster", L("العنقود", "Cluster"), (f) => f.cluster, clName], ["lease", L("حالة التأجير", "Lease status"), (f) => f.lease_status], ["region", L("المنطقة", "Region"), (f) => f.region, (v) => v]],
      exports: FARM_EXPORTS(),
      onExport: (kind, rs) => exportFarms(kind, rs),
    });
  }

  // ------------------------------------------------------------ map page (Agriculture Center "Main Map" layout)
  const PROD_STEPS = [[0, "#E2C6AA"], [0.5, "#D6AD68"], [2, "#BA9863"], [5, "#986018"], [10, C.green]];
  const prodBand = (v) => {
    if (v == null) return -1;
    let i = 0;
    PROD_STEPS.forEach(([m], k) => { if (v >= m) i = k; });
    return i;
  };
  // cluster colours as styled in "AlUla Expropriated Farms Master Plan V19.kmz" (style_cluster_1..7, style_tab_cod; outline #333333)
  const CLUSTER = { 1: "#E07814", 2: "#E85DB3", 3: "#2BA0E0", 4: "#CF3F3F", 5: "#F0D417", 6: "#6EBF4F", 7: "#8F8F8F", COD: "#FF0000" };
  const CLUSTER_LINE = "#333333";
  const CL_KEYS = ["1", "2", "3", "4", "5", "6", "7", "COD"];
  const CLUSTER_X = ["#3D3936", "#805E45", "#14332D", "#BA9863"];
  // category of a farm under each colour mode -> [key, label, colour]
  const catOf = (f, mode) => {
    if (mode === "lease") return f.lease_status ? [f.lease_status, t(f.lease_status), LEASE[f.lease_status] || NODATA] : ["", L("غير محدد", "Not specified"), NODATA];
    if (mode === "quality") return f.prod_quality ? [f.prod_quality, t(f.prod_quality), QUALITY[f.prod_quality] || NODATA] : ["", L("غير مصنفة", "Unclassified"), NODATA];
    if (mode === "cluster") return f.cluster ? [f.cluster, clName(f.cluster), CLUSTER[f.cluster] || CLUSTER_X[[...f.cluster].reduce((h, ch) => h + ch.charCodeAt(0), 0) % CLUSTER_X.length]] : ["", L("خارج العناقيد", "No cluster"), NODATA];
    if (mode === "side") return f.side ? [f.side, t(f.side), SIDE[f.side] || NODATA] : ["", L("غير محدد", "Not specified"), NODATA];
    const b = prodBand(f.prod_total);
    if (b < 0) return ["none", L("لا توجد بيانات إنتاج", "No production data"), NODATA];
    const [m, c] = PROD_STEPS[b];
    return [String(b), b < PROD_STEPS.length - 1 ? `${m} – ${PROD_STEPS[b + 1][0]} ${U.t()}` : `${m}+ ${U.t()}`, c];
  };
  const OVERLAY_COLORS = ["#402022", "#D08B67", "#14332D", "#986018", "#D6AD68", "#805E45", "#3D3936", "#BA9863", "#E2C6AA", "#6E6A66"];

  async function mapPage(p) {
    const scope = "plan";
    const [shapes, layers, meters, wells, wpts] = await Promise.all([load("farm-shapes.json"), load("layers.json"), load("meters.json"), load("wells.json"), load("well-points.json")]);
    let mode = p.color || "lease";
    const hidden = new Set();
    // clusters picked in the side panel: only their farms are shown, coloured by cluster
    const clOn = new Set(multi(p.cl));
    // wells and meters stay off until ticked in the side panel
    const show = { meterOk: false, meterBad: false, wellReg: false, wellActive: false, wellInactive: false, wellOther: false };
    app.innerHTML = `
      <div class="crumb"><b>${L("لوحة المؤشرات", "Dashboard")}</b> &gt;&gt; ${L("الخريطة الرئيسية", "Main map")}</div>
      <div class="mapwrap" id="mapwrap">
        <aside class="mside closed" id="mside"></aside>
        <div class="mmain">
          <div class="map" id="map"></div>
          <button class="mside-tab" id="mtab" aria-label="${L("إظهار/إخفاء قائمة الفلتر", "Show/hide filter panel")}" title="${L("قائمة الفلتر", "Filter panel")}">${ico("chev")}</button>
          <div class="mtop">
            <form class="pill" id="msearch">
              <select id="stype" aria-label="${L("نوع البحث", "Search type")}"><option value="farm">${L("رقم المزرعة", "Farm code")}</option><option value="meter">${L("رقم العداد", "Meter no.")}</option><option value="coord">${L("الإحداثيات", "Coordinates")}</option></select>
              <span class="sep"></span>${ico("search")}<input id="sq" value="${esc(p.farm || "")}" placeholder="${L("أدخل رقم المزرعة", "Enter the farm code")}" aria-label="${L("بحث", "Search")}" /><button>${L("بحث", "Go")}</button>
            </form>
            <label class="pill"><select id="mode" aria-label="${L("تلوين المزارع", "Colour farms")}">${[["lease", L("حالة التأجير", "Lease status")], ["production", L("كمية الإنتاج", "Production")], ["quality", L("جودة التمور", "Date quality")], ["side", L("الجهة", "Side")], ["cluster", L("العنقود", "Cluster")]].map(([v, l]) => `<option value="${v}" ${mode === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
          </div>
          <div class="mtools">
            <div class="tgroup"><button id="zin" title="${L("تكبير", "Zoom in")}">+</button><button id="zout" title="${L("تصغير", "Zoom out")}">−</button><button id="zfit" title="${L("عرض كل المزارع", "Fit all farms")}">${ico("home")}</button></div>
            <div class="tgroup"><button id="tmeasure" title="${L("قياس المسافة بين نقطتين", "Measure distance between two points")}">${ico("measure")}</button><button id="tarea" title="${L("قياس المساحة", "Measure area")}">${ico("polygon")}</button><button id="tbase" title="${L("تبديل الخريطة الأساسية", "Switch basemap")}">${ico("globe")}</button></div>
          </div>
          <div class="mhint" id="mhint" hidden></div>
          <div class="mlegend" id="mlegend"></div>
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
      style: (f) => ({ fillColor: catOf(f.properties, mode)[2], fillOpacity: 0.8, weight: 1.4, color: "#ffffff" }),
      pointToLayer: (f, ll) => L_.circleMarker(ll, { radius: 4, color: "#fff", weight: 1, fillColor: catOf(f.properties, mode)[2], fillOpacity: 0.9 }),
      onEachFeature: (f, l) => {
        l.bindPopup(() => farmPopup(f.properties), { maxWidth: 320 });
        l.bindTooltip(f.properties.code, { sticky: true, direction: "top", className: "farm-tip", offset: [0, -8] });
        l.on("mouseover", () => l.setStyle({ weight: 3, color: "#ffffff" }));
        l.on("mouseout", () => refreshFarms());
        index.set(f.properties.code, l);
      },
    });
    const farmsLayer = L_.featureGroup().addTo(map);
    function refreshFarms() {
      all.eachLayer((l) => {
        const fp = l.feature.properties;
        const [k, , c0] = catOf(fp, mode);
        const c = clOn.size ? catOf(fp, "cluster")[2] : c0;
        // zoomed out, a white outline swamps small farms (they read as white specks): outline in the fill colour instead
        const far = map.getZoom() < 14;
        l.setStyle({ fillColor: c, color: clOn.size || mode === "cluster" ? CLUSTER_LINE : far ? c : "#ffffff", weight: far ? 2 : 1.4 });
        if (clOn.size ? !clOn.has(fp.cluster) : hidden.has(k)) farmsLayer.removeLayer(l);
        else farmsLayer.addLayer(l);
      });
      map.fire("farmsrefresh");
    }
    refreshFarms();
    let lastFar = map.getZoom() < 14;
    map.on("zoomend", () => { const far = map.getZoom() < 14; if (far !== lastFar) { lastFar = far; refreshFarms(); } });

    // ---- farm name labels (clickable -> farm profile), shown when zoomed in
    const LABEL_ZOOM = 15;
    const labels = L_.layerGroup();
    function refreshLabels() {
      labels.clearLayers();
      if (map.getZoom() < LABEL_ZOOM) return labels.remove();
      const view = map.getBounds().pad(0.2);
      farmsLayer.eachLayer((l) => {
        const ll = l.getBounds ? l.getBounds().getCenter() : l.getLatLng();
        if (!view.contains(ll)) return;
        const code = l.feature.properties.code;
        L_.marker(ll, { icon: L_.divIcon({ className: "flabel-icon", html: `<a class="flabel" href="#/farm/${encodeURIComponent(code)}" title="${L("فتح ملف المزرعة", "Open farm profile")}">${esc(code)}</a>`, iconSize: null }), keyboard: false, zIndexOffset: 500 }).addTo(labels);
      });
      labels.addTo(map);
    }
    // farm codes show on hover only (tooltip); permanent labels cluttered the imagery

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
    const refreshPoints = () => Object.entries(pointLayers).forEach(([k, lyr]) => (show[k] ? lyr.addTo(map) : lyr.remove()));
    map.on("zoomend", refreshPoints);
    refreshPoints();

    // ---- side panel (summary + legend toggles, like the platform's "Main Map" panel)
    const ovOn = new Set();
    const ovLayers = {};
    // each panel card: header checkbox turns the whole group on/off, the title folds the card open/closed
    const openCards = new Set(["farms"]);
    const mcard = (id, title, count, state, body) => `<div class="mcard ${openCards.has(id) ? "open" : ""}" data-card="${id}">
      <div class="mcard-h"><input type="checkbox" data-master="${id}" data-state="${state}" ${state === "all" ? "checked" : ""} aria-label="${esc(title)}" /><button class="mcard-t" data-fold="${id}" aria-expanded="${openCards.has(id)}"${tipAttrs(title, { farms: L("المزارع ملوّنة حسب الخيار المختار أعلى الخريطة. انقر على أي فئة لإخفائها أو إظهارها.", "Farms coloured by the option chosen above the map. Click a category to hide or show it."), clusters: L("حدّد عنقوداً أو أكثر لعرض مزارعه فقط، ملوّنة بلون العنقود المعتمد.", "Tick clusters to show only their farms, in the approved cluster colours."), meters: L("أماكن عدادات الكهرباء: المربع الأخضر يعمل والبني لا يعمل.", "Power meter locations: green square working, ochre not working."), wells: L("الآبار داخل المزارع أو على بعد 10 م منها: الأخضر نشط والبني متوقف.", "Wells inside farms or within 10 m: green active, ochre inactive."), layers: L("طبقات خرائط إضافية من ملفات المشروع، تظهر فوق صورة القمر الصناعي.", "Extra map layers from the project files, drawn over the satellite image.") }[id] || "")}>${esc(title)}</button><span class="cnt num">${fmt(count)}</span><button class="mcard-c" data-fold="${id}" aria-label="${L("فتح/طي", "Expand/collapse")}">${ico("chev")}</button></div>
      <div class="mcard-b">${body}</div></div>`;
    const stateOf = (on, total) => (on === 0 ? "none" : on === total ? "all" : "some");
    const WELL_KEYS = ["wellActive", "wellInactive", "wellOther", "wellReg"];
    function renderSide() {
      const inScope = feats.map((f) => f.properties);
      const cats = [...groupBy(inScope, (f) => catOf(f, mode)[0])].map(([k, a]) => [k, catOf(a[0], mode)[1], catOf(a[0], mode)[2], a.length]).sort((a, b) => mode === "cluster" ? (!a[0]) - (!b[0]) || a[0].localeCompare(b[0], undefined, { numeric: true }) : b[3] - a[3]);
      const ptRow = (key, kind, label, n) => `<div class="mrow ${show[key] ? "" : "off"}" data-pt="${key}"><span class="ico-b mk mini ${kind}" style="width:26px;height:26px">${ico(MK[kind])}</span><b class="num">${fmt(n)}</b><span>${label}</span></div>`;
      const clKeys = CL_KEYS.filter((k) => feats.some((f) => f.properties.cluster === k));
      document.getElementById("mside").innerHTML = `
        <h1>${L("الخريطة الرئيسية", "Main map")}</h1>
        ${mcard("farms", L("المزارع", "Farms"), inScope.length, stateOf(cats.filter((c) => !hidden.has(c[0])).length, cats.length), `
          <div class="msub">${document.querySelector(`#mode option[value="${mode}"]`)?.textContent || ""} — ${L("انقر للإظهار/الإخفاء", "click to show/hide")}</div>
          ${cats.map(([k, label, c, n]) => `<div class="mrow ${hidden.has(k) ? "off" : ""}" data-cat="${esc(k)}"><span class="dot" style="background:${c}"></span><b class="num">${fmt(n)}</b><span>${esc(label)}</span></div>`).join("")}`)}
        ${mcard("clusters", L("العناقيد", "Clusters"), feats.filter((f) => f.properties.cluster).length, stateOf(clKeys.filter((k) => clOn.has(k)).length, clKeys.length), `
          <div class="msub">${L("حدّد عنقوداً أو أكثر لعرض مزارعه ملوّنة بلون العنقود", "Tick one or more clusters to show their farms in the cluster colour")}</div>
          ${clKeys.map((k) => `<label class="mrow" style="cursor:pointer"><input type="checkbox" data-cl="${k}" ${clOn.has(k) ? "checked" : ""} style="accent-color:${CLUSTER[k]}" /><span class="dot" style="background:${CLUSTER[k]}"></span><b class="num">${fmt(feats.filter((f) => f.properties.cluster === k).length)}</b><span>${clName(k)}</span></label>`).join("")}`)}
        ${mcard("meters", L("عدادات الكهرباء", "Power meters"), mOk.getLayers().length + mBad.getLayers().length, stateOf([show.meterOk, show.meterBad].filter(Boolean).length, 2),
          ptRow("meterOk", "meter-ok", L("تعمل", "Working"), mOk.getLayers().length) + ptRow("meterBad", "meter-bad", L("لا تعمل", "Not working"), mBad.getLayers().length))}
        ${mcard("wells", L("الآبار داخل المزارع", "Wells inside farms"), wReg.getLayers().length + wells.length, stateOf(WELL_KEYS.filter((k) => show[k]).length, 4), `
          <div class="msub">${L("الآبار الواقعة داخل حدود المزارع أو على بعد 10 م منها. حدّد النوع لإظهاره على الخريطة.", "Wells inside farm boundaries or within 10 m. Tick a type to show it on the map.")}</div>
          ${ptRow("wellActive", "well", L("آبار ممسوحة — نشطة", "Surveyed — active"), wGroups.Active.getLayers().length)}
          ${ptRow("wellInactive", "well-off", L("آبار ممسوحة — متوقفة", "Surveyed — inactive"), wGroups.Inactive.getLayers().length)}
          ${ptRow("wellOther", "well-new", L("آبار ممسوحة — خارج النطاق", "Surveyed — out of scope"), wGroups.other.getLayers().length)}
          ${ptRow("wellReg", "well", L("مواقع آبار سجل الآبار", "Wells-register locations"), wReg.getLayers().length)}`)}
        ${mcard("layers", L("طبقات إضافية", "Extra layers"), layers.length, stateOf(layers.filter((l) => ovOn.has(l.key)).length, layers.length),
          layers.map((l, i) => `<label class="mrow" style="cursor:pointer"><input type="checkbox" data-ov="${esc(l.key)}" ${ovOn.has(l.key) ? "checked" : ""} style="accent-color:var(--main)" /><span class="dot" style="background:${OVERLAY_COLORS[i % OVERLAY_COLORS.length]}"></span><span style="flex:1">${esc(tt(l.title))}</span><small class="muted num">${fmt(l.features)}</small></label>`).join(""))}`;
      document.querySelectorAll("#mside [data-master]").forEach((b) => (b.indeterminate = b.dataset.state === "some"));
    }
    renderSide();
    let legendOpen = window.innerWidth > 767; // folded on phones so it does not cover the map
    function renderLegend() {
      const lg = document.getElementById("mlegend");
      const title = clOn.size ? L("العنقود", "Cluster") : document.querySelector(`#mode option[value="${mode}"]`)?.textContent || "";
      const farmsIn = feats.map((f) => f.properties);
      const items = clOn.size
        ? CL_KEYS.filter((k) => clOn.has(k)).map((k) => [clName(k), CLUSTER[k]])
        : [...groupBy(farmsIn, (f) => catOf(f, mode)[0])].map(([k, a]) => [catOf(a[0], mode)[1], catOf(a[0], mode)[2], k]).filter((x) => !hidden.has(x[2])).sort((a, b) => (mode === "production" ? String(a[2]).localeCompare(String(b[2])) : 0));
      const PT = [["meterOk", "meter-ok", L("عداد يعمل", "Meter working")], ["meterBad", "meter-bad", L("عداد لا يعمل", "Meter not working")], ["wellActive", "well", L("بئر نشط", "Active well")], ["wellInactive", "well-off", L("بئر متوقف", "Inactive well")], ["wellOther", "well-new", L("بئر خارج النطاق", "Out-of-scope well")], ["wellReg", "well", L("موقع بئر (السجل)", "Well location (register)")]].filter(([k]) => show[k]);
      lg.innerHTML = `<button class="mlegend-h" id="mlegend-h" aria-expanded="${legendOpen}">${L("دليل الخريطة", "Legend")}${ico("chev")}</button>
        <div class="mlegend-b" ${legendOpen ? "" : "hidden"}>
          <div class="mlegend-t">${L("المزارع", "Farms")} — ${esc(title)}</div>
          ${items.map(([l, c]) => `<div class="mlegend-i"><span class="sw" style="background:${c}"></span>${esc(l)}</div>`).join("")}
          ${PT.length ? `<div class="mlegend-t">${L("النقاط", "Points")}</div>${PT.map(([, kind, l]) => `<div class="mlegend-i"><span class="mk ${kind} mini">${ico(MK[kind])}</span>${l}</div>`).join("")}` : `<div class="mlegend-n">${L("فعّل الآبار والعدادات من قائمة الفلتر", "Turn on wells and meters from the filter panel")}</div>`}
        </div>`;
      document.getElementById("mlegend-h").onclick = () => { legendOpen = !legendOpen; renderLegend(); };
    }
    const _renderSide = renderSide;
    renderSide = () => { _renderSide(); renderLegend(); };
    renderLegend();
    const side = document.getElementById("mside");
    side.addEventListener("click", (e) => {
      const c = e.target.closest("[data-cat]");
      const pt = e.target.closest("[data-pt]");
      if (c) { hidden.has(c.dataset.cat) ? hidden.delete(c.dataset.cat) : hidden.add(c.dataset.cat); refreshFarms(); renderSide(); }
      if (pt) { show[pt.dataset.pt] = !show[pt.dataset.pt]; refreshPoints(); renderSide(); }
      const fold = e.target.closest("[data-fold]");
      if (fold) { const id = fold.dataset.fold; openCards.has(id) ? openCards.delete(id) : openCards.add(id); fold.closest(".mcard").classList.toggle("open"); fold.closest(".mcard").querySelector(".mcard-t").setAttribute("aria-expanded", openCards.has(id)); }
    });
    side.addEventListener("change", async (e) => {
      const ms = e.target.dataset.master;
      if (ms) {
        // header checkbox: a partly-on group switches fully on, a fully-on group switches off
        const on = e.target.dataset.state !== "all";
        openCards.add(ms);
        if (ms === "farms") { hidden.clear(); if (!on) feats.forEach((f) => hidden.add(catOf(f.properties, mode)[0])); refreshFarms(); renderSide(); }
        else if (ms === "clusters") { clOn.clear(); if (on) CL_KEYS.forEach((k) => feats.some((f) => f.properties.cluster === k) && clOn.add(k)); applyClusters(); }
        else if (ms === "meters" || ms === "wells") { (ms === "meters" ? ["meterOk", "meterBad"] : WELL_KEYS).forEach((k) => (show[k] = on)); refreshPoints(); renderSide(); }
        else if (ms === "layers") {
          for (const b of side.querySelectorAll("input[data-ov]")) if (b.checked !== on) { b.checked = on; b.dispatchEvent(new Event("change", { bubbles: true })); }
          renderSide();
        }
        return;
      }
      if (e.target.dataset.cl) { e.target.checked ? clOn.add(e.target.dataset.cl) : clOn.delete(e.target.dataset.cl); return applyClusters(); }
      const key = e.target.dataset.ov;
      if (!key) return;
      if (!e.target.checked) { ovOn.delete(key); ovLayers[key]?.remove(); syncMaster(); return; }
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
      syncMaster();
    });
    // keep the "Extra layers" header checkbox in step without re-rendering (re-rendering would drop focus mid-click)
    function syncMaster() {
      const b = side.querySelector('[data-master="layers"]');
      if (!b) return;
      const st = stateOf(layers.filter((l) => ovOn.has(l.key)).length, layers.length);
      b.dataset.state = st; b.checked = st === "all"; b.indeterminate = st === "some";
    }
    document.getElementById("mtab").onclick = () => { side.classList.toggle("closed"); setTimeout(() => map.invalidateSize(), 320); };
    document.getElementById("mode").onchange = (e) => {
      mode = e.target.value;
      hidden.clear();
      refreshFarms();
      renderSide();
      history.replaceState(null, "", href("/map", { scope: p.scope, color: mode === "lease" ? undefined : mode, cl: [...clOn].join(",") || undefined }));
    };

    // ---- tools
    function applyClusters() {
      refreshFarms(); renderSide();
      fitAll();
      history.replaceState(null, "", href("/map", { scope: p.scope, color: mode === "lease" ? undefined : mode, cl: [...clOn].join(",") || undefined }));
    }
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
    const mDot = (ll) => L_.circleMarker(ll, { radius: 6, color: "#fff", weight: 2, fillColor: "#986018", fillOpacity: 1, interactive: false });
    function setMeasure(on) {
      if (on && areaOn) setArea(false);
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
      L_.polyline(mPts, { color: "#986018", weight: 3, dashArray: "6 6", interactive: false }).addTo(mLayer);
      const mid = L_.latLng((mPts[0].lat + mPts[1].lat) / 2, (mPts[0].lng + mPts[1].lng) / 2);
      L_.tooltip({ permanent: true, direction: "top", className: "measure-tip" }).setLatLng(mid).setContent(fmtDist(d)).addTo(mLayer);
      say(`${L("المسافة", "Distance")}: <b class="num">${fmtDist(d)}</b> <button id="mnew">${L("قياس جديد", "New measurement")}</button><button id="mclose">${L("إغلاق", "Close")}</button>`);
    });
    // ---- area tool: click corners, the polygon and its geodesic area update after each click
    let areaOn = false;
    let aPts = [];
    const aLayer = L_.layerGroup().addTo(map);
    const aMsg = () => `${ico("polygon")} ${aPts.length < 3 ? L(`انقر على أركان المساحة في الخريطة (${aPts.length} من 3 على الأقل)`, `Click the corners of the area on the map (${aPts.length} of at least 3)`) : `${L("المساحة", "Area")}: <b class="num">${fmtArea(geoArea(aPts))}</b> · ${L("المحيط", "Perimeter")}: <b class="num">${fmtDist(aPts.reduce((s, q, i) => s + map.distance(q, aPts[(i + 1) % aPts.length]), 0))}</b>`}
      ${aPts.length ? `<button id="aundo">${L("تراجع", "Undo")}</button><button id="anew">${L("قياس جديد", "New")}</button>` : ""}<button id="aclose">${L("إغلاق", "Close")}</button>`;
    function drawArea() {
      aLayer.clearLayers();
      aPts.forEach((q) => mDot(q).addTo(aLayer));
      if (aPts.length >= 2) L_.polyline(aPts, { color: "#986018", weight: 3, dashArray: "6 6", interactive: false }).addTo(aLayer);
      if (aPts.length >= 3) {
        const poly = L_.polygon(aPts, { color: "#986018", weight: 3, fillColor: "#986018", fillOpacity: 0.2, interactive: false }).addTo(aLayer);
        L_.tooltip({ permanent: true, direction: "center", className: "measure-tip" }).setLatLng(poly.getBounds().getCenter()).setContent(fmtArea(geoArea(aPts))).addTo(aLayer);
      }
      say(aMsg());
    }
    function setArea(on) {
      if (on && measuring) setMeasure(false);
      areaOn = on;
      aPts = [];
      aLayer.clearLayers();
      wrap.classList.toggle("measuring", on);
      document.getElementById("tarea").classList.toggle("on", on);
      on ? map.doubleClickZoom.disable() : map.doubleClickZoom.enable();
      on ? drawArea() : say("");
    }
    document.getElementById("tarea").onclick = () => setArea(!areaOn);
    hint.addEventListener("click", (e) => {
      if (e.target.id === "aclose") setArea(false);
      if (e.target.id === "anew") { aPts = []; drawArea(); }
      if (e.target.id === "aundo") { aPts.pop(); drawArea(); }
    });
    // a click on a farm can reach both the farm layer and the map: count it once
    const addPt = (ll) => { const last = aPts[aPts.length - 1]; if (last && last.equals(ll)) return; aPts.push(ll); drawArea(); };
    map.on("click", (e) => areaOn && addPt(e.latlng));
    farmsLayer.on("click", (e) => { if (areaOn) { e.layer.closePopup(); addPt(e.latlng); } });
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
        if (!farmsLayer.hasLayer(hit)) { hidden.clear(); clOn.clear(); refreshFarms(); renderSide(); }
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

  const coordBlock = (f) => {
    if (f.lat == null) return "";
    const c6 = (v) => v.toFixed(6);
    return `<div class="coord-top">
        <div><small>${L("مركز المزرعة (خط العرض، خط الطول)", "Farm centre (lat, lng)")}</small><b class="num" dir="ltr">${c6(f.lat)}, ${c6(f.lng)}</b></div>
        ${f.calc_perim_m != null ? `<div><small>${L("المحيط", "Perimeter")}</small><b class="num">${fmt(f.calc_perim_m, 0)} ${L("م", "m")}</b></div>` : ""}
        <div class="coord-btns">
          <button class="btn sm" data-copy="${c6(f.lat)}, ${c6(f.lng)}">${ico("link")}${L("نسخ الإحداثيات", "Copy")}</button>
          <a class="btn sm" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${c6(f.lat)},${c6(f.lng)}">${ico("globe")}${L("خرائط Google", "Google Maps")}</a>
        </div>
      </div>`;
  };
  // definition list without the rows that have no value
  const dlFilled = (rows) => dl(rows.filter(([, v]) => v != null && v !== "" && v !== "—" && v !== "N/A"));
  const empty = (msg) => `<div class="empty-note">${ico("info")}<span>${msg}</span></div>`;

  async function farmPage(code) {
    const f = BY_CODE.get(code.toUpperCase());
    if (!f) {
      app.innerHTML = `<div class="card"><b>${L("لا توجد مزرعة بالرمز", "No farm with code")} ${esc(code)}</b><p><a class="link" href="#/farms">${L("سجل المزارع", "Farms register")}</a></p></div>`;
      return;
    }
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
      <div class="print-only print-head"><b>${NAME}</b><span>${L("ملف مزرعة", "Farm sheet")} · ${new Date().toLocaleDateString(LANG === "ar" ? "ar-SA" : "en-GB")}</span></div>
      <div class="head"><div>
        <h1 class="num" style="direction:ltr;text-align:start">${esc(f.code)}</h1>
        <p>${esc([f.project, f.region].filter(Boolean).map(t).join(" · ") || "—")}</p>
        <div class="badges">
          ${f.side ? `<span class="badge">${t(f.side)}</span>` : ""}${f.cluster ? `<span class="badge">${L("العنقود", "Cluster")}: ${esc(f.cluster)}</span>` : ""}
          ${f.lease_status ? `<span class="badge ${f.lease_status === "Full" ? "solid" : tone(f.lease_status)}">${t(f.lease_status)}</span>` : ""}
          ${f.expropriation ? `<span class="badge ${f.expropriation === "Expropriated" ? "gold" : ""}">${t(f.expropriation)}</span>` : ""}
          ${f.prod_quality ? badge(f.prod_quality, L(`جودة ${t(f.prod_quality)}`, `${t(f.prod_quality)} quality`)) : ""}${f.deserted === "Yes" ? `<span class="badge danger">${L("مرشحة للترك وفق الدراسة", "To be deserted (study)")}</span>` : ""}
        </div></div>
        <div class="tools">
          <button class="btn" data-copy="${esc(location.href.split("#")[0] + "#/farm/" + encodeURIComponent(f.code))}">${ico("link")}${L("نسخ رابط المزرعة", "Copy farm link")}</button>
          <button class="btn" id="fprint">${ico("printer")}${L("طباعة / PDF", "Print / PDF")}</button>
          <a class="btn btn-primary" href="${href("/map", { farm: f.code })}">${ico("map")}${L("عرض على الخريطة", "Show on map")}</a></div>
      </div>
      <div class="kpis k6">
        ${tipOn(kpi("ruler", L("المساحة المحسوبة", "Calculated area"), `${fmt(f.area_ha, 2)} <small>${U.ha()}</small>`, f.calc_area_m2 != null ? `${fmt(f.calc_area_m2, 0)} ${L("م²", "m²")}${f.area_reg != null ? ` · ${L("المسجلة", "registered")} ${fmt(f.area_reg, 2)} ${U.ha()}` : ""}` : L("لا توجد حدود — المساحة المسجلة", "No boundary — registered area"), { tint: "green", cls: "t-primary" }), L("المساحة المحسوبة", "Calculated area"), L("مساحة المزرعة مقيسة من حدودها المرسومة على الخريطة. تحتها المساحة نفسها بالمتر المربع والمساحة المسجلة في الملفات للمقارنة.", "The farm area measured from its boundary on the map, with the same area in m² and the registered area for comparison."))}
        ${tipOn(kpi("palm", L("أشجار النخيل", "Date palms"), fmt(f.date_trees), f.citrus_trees || f.mango_trees ? L(`حمضيات ${fmt(f.citrus_trees)} · مانجو ${fmt(f.mango_trees)}`, `Citrus ${fmt(f.citrus_trees)} · Mango ${fmt(f.mango_trees)}`) : ""), L("أشجار النخيل", "Date palms"), L("عدد النخيل المسجّل في المزرعة، وتحته الأشجار الأخرى إن وُجدت.", "Date palms recorded on the farm, with any other trees below."))}
        ${tipOn(kpi("box", L("الإنتاج 2026", "Production 2026"), `${fmt(f.prod_total, 2)} <small>${U.t()}</small>`, f.prod_total != null && f.date_trees ? L(`${fmt((f.prod_total * 1000) / f.date_trees, 1)} كجم / نخلة`, `${fmt((f.prod_total * 1000) / f.date_trees, 1)} kg / palm`) : "", { tint: "beige", cls: "t-brown" }), L("الإنتاج 2026", "Production 2026"), L("ما أنتجته المزرعة من التمور في موسم 2026، وتحته متوسط إنتاج النخلة الواحدة.", "Dates produced in the 2026 season, with the average per palm below."))}
        ${tipOn(kpi("droplet", L("الآبار", "Wells"), fmt(f.wells_total || W.length || 0), f.wells_total ? L(`${fmt(f.wells_active)} نشطة · ${fmt(f.wells_inactive)} متوقفة`, `${fmt(f.wells_active)} active · ${fmt(f.wells_inactive)} inactive`) : W.length ? L(`آبار ممسوحة: ${fmt(W.filter((w) => w.category === "Active").length)} نشطة`, `surveyed: ${fmt(W.filter((w) => w.category === "Active").length)} active`) : L("لا آبار مسجلة", "No wells recorded"), { subCls: f.wells_inactive ? "t-danger" : "" }), L("الآبار", "Wells"), L("آبار المزرعة من سجل الآبار (النشطة والمتوقفة)، أو الآبار الممسوحة داخل حدودها إن لم يكن لها سجل.", "Wells from the register (active and inactive), or surveyed wells inside the boundary when there is no register entry."))}
        ${tipOn(kpi("meter", L("عدادات الكهرباء", "Power meters"), fmt(f.meters_total), f.meters_total ? L(`${fmt(f.meters_working)} تعمل · ${fmt(f.meters_not_working)} لا تعمل`, `${fmt(f.meters_working)} working · ${fmt(f.meters_not_working)} not working`) : "", { subCls: f.meters_not_working ? "t-danger" : "t-primary" }), L("عدادات الكهرباء", "Power meters"), L("عدادات الكهرباء المرتبطة بالمزرعة وحالتها حسب الكشف الكهربائي.", "Power meters linked to the farm and their status per inspection."))}
        ${tipOn(kpi("layers", L("حالة التأجير", "Lease status"), f.lease_status ? `<span class="kv-badge" style="--c:${LEASE[f.lease_status] || NODATA}">${t(f.lease_status)}</span>` : "—", f.expropriation ? t(f.expropriation) : ""), L("حالة التأجير", "Lease status"), L("هل المزرعة مؤجرة: بالكامل، جزئياً، مختلطة (قطع مؤجرة كلياً وأخرى جزئياً)، أو غير مؤجرة.", "Whether the farm is leased: fully, partly, mixed (some plots fully and others partly), or not leased."))}
      </div>
      <div class="grid12">
        ${card("pin", L("الموقع والحدود", "Location & boundary"), `<div class="farmmap" id="fmap"></div>
          <div class="legend"><span><i style="background:transparent;border:2px solid #D6AD68"></i>${L("حدود المزرعة", "Farm boundary")}${f.geometry_source ? ` (${esc(tt(lyrs.find((l) => l[0] === f.geometry_source)?.[1] || f.geometry_source))})` : ""}</span>
          <span><i style="background:#14332D;border-radius:3px"></i>${L("عداد يعمل", "Meter working")}</span><span><i style="background:#D08B67;border-radius:3px"></i>${L("عداد لا يعمل", "Meter not working")}</span><span><i style="background:#14332D;border-radius:50%"></i>${L("بئر نشط", "Active well")}</span><span><i style="background:#D08B67;border-radius:50%"></i>${L("بئر متوقف", "Inactive well")}</span>
</div>${coordBlock(f)}`, { span: "c7", tip: L("صورة جوية لحدود المزرعة وما فيها من عدادات وآبار، وتحتها إحداثيات مركز المزرعة ومحيطها.", "Aerial view of the farm boundary with its meters and wells, and the farm centre coordinates and perimeter below.") })}
        ${card("info", L("البيانات الأساسية", "Basic information"), dlFilled([
          [L("رمز القطعة", "Plot code"), esc(f.plot_code)], [L("استخدام الأرض", "Land use"), esc(f.land_use)], [L("المشروع", "Project"), esc(t(f.project))], [L("المنطقة", "Region"), esc(t(f.region))],
          [L("الجهة", "Side"), t(f.side)], [L("العنقود", "Cluster"), f.cluster ? esc(clName(f.cluster)) : ""], [L("حالة النزع", "Expropriation"), t(f.expropriation)], [L("حالة التأجير", "Lease status"), t(f.lease_status)],
          [L("التصنيف", "Classification"), t(f.classification)], [L("الأصناف", "Varieties"), esc(f.varieties)],
        ]), { span: "c5", tip: L("بيانات التعريف بالمزرعة من ملفات المخطط. الحقول الفارغة لا تظهر.", "Identification details from the plan files. Empty fields are hidden.") })}
      </div>
      <div class="grid12">
        ${card("trend", L("إنتاج التمور 2026", "Date production 2026"), f.prod_total ? `
          ${g.map((v, i) => prow(G[i], `${fmt(v, 2)} ${U.t()}`, [{ v, c: GRADE[i] }], f.prod_total || 1)).join("")}
          <div class="kvrow"><span class="muted">${L("الإجمالي", "Total")}</span><b class="num">${fmt(f.prod_total, 2)} ${U.t()}</b></div>
          <div class="kvrow"><span class="muted">${L("الجودة", "Quality")}</span><b>${t(f.prod_quality)}</b></div>` : empty(f.prod_total === 0 ? L("لا يوجد إنتاج مسجّل لهذا الموسم.", "No production recorded this season.") : L("لا توجد بيانات إنتاج لهذه المزرعة.", "No production data for this farm.")), { span: "c4", tip: L("إنتاج المزرعة مقسّماً حسب الدرجة: الأولى أعلى جودة والثالثة (الشيص) أقلها.", "The farm\u2019s production by grade: grade 1 is the best quality, grade 3 (Shees) the lowest.") })}
        ${card("droplet", L("الآبار", "Wells"), !f.wells_total && !W.length ? empty(L("لا توجد آبار مسجلة لهذه المزرعة.", "No wells recorded for this farm.")) : `
          ${!f.wells_total ? "" : prow(L("نشطة", "Active"), `${fmt(f.wells_active)} / ${fmt(f.wells_total)}`, [{ v: f.wells_active || 0, c: C.green }], f.wells_total || 1)}
          ${!f.wells_total ? "" : prow(L("متوقفة", "Inactive"), `${fmt(f.wells_inactive)} / ${fmt(f.wells_total)}`, [{ v: f.wells_inactive || 0, c: C.red }], f.wells_total || 1)}
          ${W.length ? `<ul class="wl">${W.map((w) => `<li><b>${esc(w.name)}</b><small>${esc(w.category)} · ${L("أقرب عداد", "nearest meter")} <span class="num">${esc(w.nearest_meter)}</span> · ${L("يبعد", "at")} <span class="num">${fmt(w.distance_farm_m)}</span> ${L("م", "m")}</small></li>`).join("")}</ul>` : ""}`, { span: "c4", tip: L("آبار المزرعة: أعداد السجل (نشطة ومتوقفة) وقائمة الآبار الممسوحة داخل حدودها أو على بعد 10 م منها.", "Register counts (active / inactive) and the surveyed wells inside the boundary or within 10 m.") })}
        ${card("wallet", L("التكاليف والعوائد (الدراسة)", "Costs & returns (study)"), f.capex != null || f.opex != null ? `
          <div class="strip"><div><b class="num">${fmt((f.capex || 0) / 1000, 1)}K</b><span>${L("رأسمالية (ر.س)", "CAPEX (SAR)")}</span></div><div><b class="num">${fmt((f.opex || 0) / 1000, 1)}K</b><span>${L("تشغيل سنوي", "OPEX / year")}</span></div><div><b class="num">${fmt((f.rev_y3 || 0) / 1000, 1)}K</b><span>${L("إيراد السنة 3", "Year-3 revenue")}</span></div></div>
          <div class="kvrow"><span class="muted">${L("مرشحة للترك؟", "To be deserted?")}</span><b>${t(f.deserted)}</b></div>` : empty(L("لا توجد بيانات مالية.", "No financial data.")), { span: "c4", tip: L("أرقام دراسة الجدوى: التكلفة الرأسمالية، والتشغيل السنوي، والإيراد المتوقع في السنة الثالثة (K = ألف ريال).", "Feasibility study figures: capital cost, yearly operating cost and expected year-3 revenue (K = thousand SAR).") })}
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
    if (shape) L_.geoJSON(shape, { style: { color: "#D6AD68", weight: 2.5, fillColor: "#D6AD68", fillOpacity: 0.15 } }).addTo(group);
    for (const m of M) if (m.lat != null) L_.marker([m.lat, m.lng], { icon: mkIcon(m.status === "Working" ? "meter-ok" : "meter-bad") }).bindTooltip(`${L("عداد", "Meter")} ${m.meter_no} — ${t(m.status)}`).addTo(group);
    for (const w of W) if (w.lat != null) L_.marker([w.lat, w.lng], { icon: mkIcon(wellKind(w.category)) }).bindTooltip(`${w.name} — ${w.category}`).addTo(group);
    if (!shape && f.lat != null) L_.circleMarker([f.lat, f.lng], { radius: 8, color: "#fff", weight: 2, fillColor: C.green, fillOpacity: 1 }).addTo(group);
    const fit = () => (group.getBounds().isValid() ? map.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 17 }) : map.setView([26.7, 37.95], 11));
    fit();
    const stop = watchSize(map, el, fit);
    const onClick = (e) => {
      const cp = e.target.closest("[data-copy]");
      if (cp) navigator.clipboard?.writeText(cp.dataset.copy).then(() => { const o = cp.innerHTML; cp.textContent = L("تم النسخ ✓", "Copied ✓"); setTimeout(() => (cp.innerHTML = o), 1500); });
      if (e.target.closest("#fprint")) { map.invalidateSize(); fit(); setTimeout(() => window.print(), 600); }
    };
    app.addEventListener("click", onClick);
    cleanup = () => {
      stop();
      app.removeEventListener("click", onClick);
      map.remove();
    };
  }

  // ------------------------------------------------------------ wells
  async function wellsPage(p) {
    const scope = "plan";
    const F = scoped(scope);
    const wells = await load("wells.json");
    const cats = [...groupBy(wells, (w) => w.category)].map(([c, a]) => [c, a.length]).sort((a, b) => b[1] - a[1]);
    const regions = [...groupBy(F, (f) => f.region || L("غير محدد", "Not specified"))].map(([r, a]) => ({ r, a: sum(a, "wells_active"), i: sum(a, "wells_inactive") })).filter((x) => x.a + x.i).sort((x, y) => (y.a + y.i) - (x.a + x.i)).slice(0, 14);
    const regMax = Math.max(...regions.map((x) => x.a + x.i), 1);
    const W = { t: sum(F, "wells_total"), a: sum(F, "wells_active"), i: sum(F, "wells_inactive") };
    const ofTotal = (v) => L(`${fmt(pct(v, W.t), 1)}% من الإجمالي`, `${fmt(pct(v, W.t), 1)}% of total`);
    app.innerHTML = `
      ${head(L("الآبار", "Wells"), L("أعداد الآبار لكل مزرعة من سجل آبار العلا، والآبار الجديدة الممسوحة حديثاً", "Well counts per farm from the AlUla wells register, plus newly surveyed wells"), scopePick(scope, "/wells"))}
      <div class="kpis k4">
        ${kpi("droplet", L("إجمالي الآبار", "Total wells"), fmt(W.t), L(`${fmt(F.filter((f) => f.wells_total > 0).length)} مزرعة لديها آبار`, `${fmt(F.filter((f) => f.wells_total > 0).length)} farms with wells`), { tint: "green", cls: "t-primary" })}
        ${kpi("trend", L("آبار نشطة", "Active wells"), fmt(W.a), ofTotal(W.a), { subCls: "t-primary" })}
        ${kpi("off", L("آبار متوقفة", "Inactive wells"), fmt(W.i), ofTotal(W.i), { tint: "beige", cls: "t-danger" })}
        ${kpi("pin", L("آبار جديدة ممسوحة", "Newly surveyed wells"), fmt(wells.length), L("من ملف Updated_Wells", "from Updated_Wells"))}
      </div>
      <div class="grid12">${card("droplet", L("الآبار حسب المنطقة", "Wells by region"), regions.length ? regions.map((r) => prow(t(r.r), activeOf(r.a, r.a + r.i), [{ v: r.a, c: C.green }, { v: r.i, c: C.red }], regMax)).join("") + legend([[L("آبار نشطة", "Active wells"), C.green], [L("آبار متوقفة", "Inactive wells"), C.red]]) : `<p class="muted">${L("لا توجد آبار مسجلة لهذا النطاق.", "No wells recorded for this scope.")}</p>`)}</div>
      <h2 class="sec-title">${ico("pin")}${L("الآبار الجديدة الممسوحة", "Newly surveyed wells")}</h2>
      <div id="wl"></div>`;
    const confName = (v) => (v === "Yes" ? L("نعم", "Yes") : L("لا", "No"));
    listTool(document.getElementById("wl"), {
      rows: wells, key: (w) => w.name, placeholder: L("ابحث باسم البئر أو رمز المزرعة أو العداد", "Search well name, farm code or meter"),
      text: (w) => [w.name, w.farm_code, w.nearest_meter, w.category].join(" "),
      cols: [
        ["name", L("اسم البئر", "Well"), (w) => esc(w.name)],
        ["category", L("التصنيف", "Category"), (w) => `<span class="badge">${esc(w.category)}</span>`],
        ["farm_code", L("المزرعة", "Farm"), (w) => (w.farm_code ? farmLink(w.farm_code) : "—")],
        ["cluster", L("العنقود", "Cluster"), (w) => esc(BY_CODE.get(w.farm_code)?.cluster ? clName(BY_CODE.get(w.farm_code).cluster) : "—"), (w) => BY_CODE.get(w.farm_code)?.cluster],
        ["distance_farm_m", L("المسافة عن المزرعة (م)", "Distance to farm (m)"), (w) => fmt(w.distance_farm_m, 1), null, true],
        ["confident", L("تطابق موثوق", "Confident match"), (w) => (w.confident === "Yes" ? `<span class="badge primary">${t("Yes")}</span>` : `<span class="badge warn">${t("No")}</span>`)],
        ["nearest_meter", L("أقرب عداد", "Nearest meter"), (w) => esc(w.nearest_meter), null, true],
        ["distance_meter_m", L("المسافة عن العداد (م)", "Distance to meter (m)"), (w) => fmt(w.distance_meter_m, 1), null, true],
      ],
      filters: [["category", L("التصنيف", "Category"), (w) => w.category, (v) => v], ["cluster", L("العنقود", "Cluster"), (w) => BY_CODE.get(w.farm_code)?.cluster, clName], ["confident", L("تطابق موثوق", "Confident match"), (w) => w.confident, confName]],
      init: { f: { category: multi(p.category) } },
      exports: XLS_CSV(),
      onExport: (kind, rs) => exportRows(kind, "alula-wells", [[L("اسم البئر", "Well"), (w) => w.name], [L("التصنيف", "Category"), (w) => w.category], [L("المزرعة", "Farm"), (w) => w.farm_code], [L("خط العرض", "Latitude"), (w) => w.lat], [L("خط الطول", "Longitude"), (w) => w.lng], [L("المسافة عن المزرعة (م)", "Distance to farm (m)"), (w) => w.distance_farm_m], [L("أقرب عداد", "Nearest meter"), (w) => w.nearest_meter], [L("المسافة عن العداد (م)", "Distance to meter (m)"), (w) => w.distance_meter_m]], rs),
    });
  }

  // ------------------------------------------------------------ meters
  async function metersPage(p) {
    const all = await load("meters.json");
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
      <div id="ml"></div>`;
    const fc = (m) => BY_CODE.get(m.farm_code) || {};
    listTool(document.getElementById("ml"), {
      rows: all, key: (m) => m.meter_no, placeholder: L("ابحث برقم العداد أو رمز المزرعة", "Search meter no. or farm code"),
      text: (m) => [m.meter_no, m.farm_code, fc(m).project].join(" "),
      cols: [
        ["meter_no", L("رقم العداد", "Meter no."), (m) => `<b>${esc(m.meter_no)}</b>`, null, true],
        ["farm_code", L("المزرعة", "Farm"), (m) => farmLink(m.farm_code)],
        ["project", L("المشروع", "Project"), (m) => `<span class="trunc" style="display:inline-block">${esc(t(fc(m).project))}</span>`, (m) => fc(m).project],
        ["cluster", L("العنقود", "Cluster"), (m) => (fc(m).cluster ? esc(clName(fc(m).cluster)) : "—"), (m) => fc(m).cluster],
        ["status", L("الحالة", "Status"), (m) => badge(m.status)],
        ["disconnected", L("مفصول؟", "Disconnected?"), (m) => t(m.disconnected)],
        ["distance_m", L("المسافة (م)", "Distance (m)"), (m) => fmt(m.distance_m, 1), null, true],
        ["details", L("التفاصيل", "Details"), (m) => `<span class="trunc" style="display:inline-block;font-size:12px;max-width:280px" title="${esc(m.details)}">${esc(m.details)}</span>`],
      ],
      filters: [["status", L("الحالة", "Status"), (m) => m.status], ["disconnected", L("مفصول؟", "Disconnected?"), (m) => m.disconnected], ["cluster", L("العنقود", "Cluster"), (m) => fc(m).cluster, clName], ["side", L("الجهة", "Side"), (m) => fc(m).side]],
      init: { q: p.q || "", f: { status: multi(p.status) } },
      exports: XLS_CSV(),
      onExport: (kind, rs) => exportRows(kind, "alula-meters", [[L("رقم العداد", "Meter no."), (m) => m.meter_no], [L("المزرعة", "Farm"), (m) => m.farm_code], [L("الحالة", "Status"), (m) => t(m.status)], [L("مفصول؟", "Disconnected?"), (m) => t(m.disconnected)], [L("خط العرض", "Latitude"), (m) => m.lat], [L("خط الطول", "Longitude"), (m) => m.lng], [L("التفاصيل", "Details"), (m) => m.details]], rs),
    });
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
    // the top bar is the brand bar (project + Royal Commission); every page carries its own heading
    document.getElementById("tb-page").textContent = L("المزارع المنزوعة في العلا", NAME);
    document.getElementById("tb-sub").textContent = L(NAME, "Royal Commission for AlUla");
    document.getElementById("tb-upd-l").textContent = L("آخر تحديث للبيانات", "Data last updated");
    document.querySelectorAll(".tb-logo").forEach((i) => (i.alt = L("الهيئة الملكية لمحافظة العلا", "Royal Commission for AlUla")));
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
    mnav.innerHTML = pages.map(([p, i, l]) => `<a href="#${p}" aria-label="${esc(l)}">${ico(i)}<span>${l}</span></a>`).join("");
    if (BUILT && !isNaN(BUILT)) {
      const hm = `${String(BUILT.getHours()).padStart(2, "0")}:${String(BUILT.getMinutes()).padStart(2, "0")}`;
      document.getElementById("tb-updated").textContent = BUILT.toLocaleDateString(LOCALE(), { day: "numeric", month: "long", year: "numeric" });
      document.getElementById("tb-updated").title = hm;
    }
  }

  // ------------------------------------------------------------ hover explanations
  const tipEl = document.createElement("div");
  tipEl.className = "tip";
  tipEl.setAttribute("role", "tooltip");
  tipEl.hidden = true;
  document.body.appendChild(tipEl);
  let tipKey = "";
  const sliceAt = (d, x, y) => {
    const r = d.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    const rad = Math.hypot(dx, dy);
    if (rad < r.width * 0.3 || rad > r.width / 2) return -1;
    const ang = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360; // 0° at the top, clockwise like conic-gradient
    const sl = JSON.parse(d.dataset.slices);
    const tot = sl.reduce((a, q) => a + q[0], 0) || 1;
    let acc = 0;
    for (let k = 0; k < sl.length; k++) { acc += sl[k][0]; if (ang <= (acc / tot) * 360) return k; }
    return -1;
  };
  const hintFor = (el) => {
    const g = el?.closest("[data-go]")?.dataset.go || "";
    return g.startsWith("#/farm/") ? L("انقر لفتح ملف المزرعة", "Click to open the farm profile") : g.startsWith("#/farms") ? L("انقر لعرض هذه المزارع", "Click to see these farms") : g ? L("انقر لفتح التفاصيل", "Click for details") : "";
  };
  // returns { title, text, rows, hint, hl }
  function tipFor(target, x, y) {
    const d = target.closest?.(".donut .r[data-slices]");
    if (d) {
      const k = sliceAt(d, x, y);
      if (k >= 0) {
        const [, title, text, hl] = JSON.parse(d.dataset.slices)[k];
        return { title, text, hl, hint: hintFor(d.closest(".donut").querySelectorAll("li")[k]) };
      }
    }
    const el = target.closest?.("[data-tip]");
    const hlEl = target.closest?.("[data-hl]");
    if (!el) return hlEl ? { hl: hlEl.dataset.hl } : null;
    return { title: el.dataset.tipT || "", text: el.dataset.tip, rows: el.dataset.tipRows ? JSON.parse(el.dataset.tipRows) : null, hint: hintFor(el), hl: (hlEl || el).dataset.hl || "" };
  }
  const clean = (txt) => String(txt || "").replace(/\s*(انقر|Click)[^.،]*\.?\s*$/u, "");
  function showTip(t, x, y) {
    highlight(t?.hl || "");
    if (!t || !t.text) { tipEl.hidden = true; tipKey = ""; return; }
    const key = [t.title, t.text, t.hint].join("|");
    if (key !== tipKey) {
      tipEl.innerHTML = `${t.title ? `<b>${esc(t.title)}</b>` : ""}<span>${esc(clean(t.text))}</span>${t.rows ? `<dl>${t.rows.map(([l, v, c]) => `<dt>${c ? `<i style="background:${c}"></i>` : ""}${esc(l)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : ""}${t.hint ? `<em>${ico("arrow")}${esc(t.hint)}</em>` : ""}`;
      tipKey = key;
    }
    tipEl.hidden = false;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let left = x + 14, top = y + 18;
    if (left + w > innerWidth - 8) left = x - w - 14;
    if (top + h > innerHeight - 8) top = y - h - 14;
    tipEl.style.left = `${Math.max(8, left)}px`;
    tipEl.style.top = `${Math.max(8, top)}px`;
  }
  // linked highlight: the hovered category lights up everywhere on the page, its siblings dim
  let hlKey = "";
  function highlight(key) {
    if (key === hlKey) return;
    hlKey = key;
    document.querySelectorAll(".hl-on, .hl-dim").forEach((e) => e.classList.remove("hl-on", "hl-dim"));
    document.querySelectorAll(".donut .r[data-base]").forEach((r) => { r.style.background = r.dataset.base; r.removeAttribute("data-base"); });
    if (!key) return;
    const group = key.split(":")[0] + ":";
    document.querySelectorAll("[data-hl]").forEach((e) => { if (e.dataset.hl.startsWith(group)) e.classList.add(e.dataset.hl === key ? "hl-on" : "hl-dim"); });
    document.querySelectorAll(".donut .r[data-slices]").forEach((r) => {
      const sl = JSON.parse(r.dataset.slices);
      if (!sl.some((q) => q[3] && q[3].startsWith(group))) return;
      const tot = sl.reduce((a, q) => a + q[0], 0) || 1;
      let acc = 0;
      const stops = sl.map((q) => { const a = (acc / tot) * 360; acc += q[0]; return `${q[3] === key ? q[4] : `${q[4]}38`} ${a}deg ${(acc / tot) * 360}deg`; });
      r.dataset.base = r.style.background;
      r.style.background = `conic-gradient(${stops.join(",")})`;
    });
  }
  document.addEventListener("mousemove", (e) => showTip(e.target.closest?.(".leaflet-container") ? null : tipFor(e.target, e.clientX, e.clientY), e.clientX, e.clientY));
  document.addEventListener("mouseleave", () => showTip(null));
  document.addEventListener("scroll", () => { tipEl.hidden = true; tipKey = ""; }, true);
  window.addEventListener("hashchange", () => showTip(null));

  // phones have no hover: tapping the ⓘ in a card header shows that card's explanation
  document.addEventListener("click", (e) => {
    const dot = e.target.closest?.(".tip-dot");
    if (!dot) { if (!tipEl.hidden && matchMedia("(hover: none)").matches) showTip(null); return; }
    e.stopPropagation();
    const el = dot.closest("[data-tip]"); const r = dot.getBoundingClientRect();
    showTip({ title: el.dataset.tipT || "", text: el.dataset.tip }, r.left, r.bottom);
  }, true);
  document.addEventListener("focusin", (e) => { const el = e.target.closest?.("[data-tip]"); if (!el) return showTip(null); const r = el.getBoundingClientRect(); showTip({ title: el.dataset.tipT || "", text: el.dataset.tip }, r.left + 10, r.bottom - 10); });

  // ------------------------------------------------------------ boot
  hydrate();
  applyLang();
  document.getElementById("gsearch").onsubmit = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) location.hash = href("/farms", { q });
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
    // area and location measured from the boundary win over the registered values; the registered area is kept as area_reg
    for (const f of FARMS) {
      f.area_reg = f.area_ha;
      if (f.calc_area_m2 != null) f.area_ha = Math.round(f.calc_area_m2 / 100) / 100;
      if (f.c_lat != null) { f.lat = f.c_lat; f.lng = f.c_lng; }
    }
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
    app.innerHTML = `
      <div class="login-wrap">
      <div class="login-brand" aria-hidden="true"><img src="assets/rcu-logo-v-white.png" alt="" /><b>${L("المزارع المنزوعة في العلا", NAME)}</b><span>${L(NAME, "Royal Commission for AlUla")}</span></div>
      <form id="login" class="card login">
        <div class="tb-ico">${ico("lock")}</div>
        <h1>${L("تسجيل الدخول", "Sign in")}</h1>
        <p>${L("المحتوى محمي. أدخل كلمة المرور للدخول.", "This content is protected. Enter the password to continue.")}</p>
        <input class="field" type="password" name="pw" autocomplete="current-password" placeholder="${L("كلمة المرور", "Password")}" aria-label="${L("كلمة المرور", "Password")}" style="width:100%;text-align:center" autofocus />
        <button class="btn btn-primary" style="width:100%;margin-top:12px">${L("دخول", "Sign in")}</button>
        <p id="lerr" class="t-danger" style="min-height:1.5em;margin:10px 0 0"></p>
      </form></div>`;
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
        app.innerHTML = SKEL;
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
