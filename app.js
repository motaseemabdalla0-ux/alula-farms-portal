/* منصة بيانات المزارع — static build (GitHub Pages), password-protected.
   Layout mirrors the Agriculture Center platform (agriculture.rcu.gov.sa): icon rail, top bar, KPI tiles, progress rows.
   Every data file is AES-256-GCM encrypted (key = PBKDF2-SHA256 of the password); nothing is readable without it.
   Hash routes: #/ #/map #/farms #/farm/CODE #/wells #/meters #/sources */
(() => {
  "use strict";

  // ------------------------------------------------------------ icons (lucide, MIT)
  const P = {
    dashboard: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
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
  const AR = {
    North: "الشمال", South: "الجنوب", Full: "مؤجرة بالكامل", Partial: "مؤجرة جزئياً", Mixed: "مختلطة", "Not Leased": "غير مؤجرة",
    High: "عالية", Mid: "متوسطة", Medium: "متوسطة", Low: "منخفضة", Expropriated: "منزوعة", "Not Expropriated": "غير منزوعة",
    Working: "يعمل", "Not working": "لا يعمل", Yes: "نعم", No: "لا",
  };
  const t = (v) => (v === null || v === undefined || v === "" ? "—" : AR[String(v).trim()] ?? String(v));
  const fmt = (v, d = 0) => {
    if (v === null || v === undefined || v === "") return "—";
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: d }) : String(v);
  };
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const esc = (v) => String(v ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // platform palette: green #2E7D32, brown #6D4C41, gold #B8860B/#DAA520
  const C = { green: "#2E7D32", brown: "#6D4C41", gold: "#DAA520", red: "#C62828", sand: "#BCAAA4", gray: "#9CA3AF" };
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
  const scoped = (scope) => (scope === "all" ? FARMS : FARMS.filter((f) => f.in_plan));
  const bucket = (code) => {
    const prefix = (code.split("-")[0].replace(/[^A-Z0-9]/g, "_").slice(0, 12)) || "_";
    let s = 0;
    for (const ch of code) s += ch.codePointAt(0);
    return `${prefix}-${s % 8}`;
  };

  // ------------------------------------------------------------ router
  const app = document.getElementById("app");
  const PAGES = [
    ["/", "dashboard", "لوحة المؤشرات"], ["/map", "map", "الخريطة"], ["/farms", "sprout", "المزارع"],
    ["/wells", "droplet", "الآبار"], ["/meters", "zap", "العدادات"], ["/sources", "database", "مصادر البيانات"],
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
    const active = PAGES.find(([p]) => (p === "/" ? path === "/" : path.startsWith(p) || (p === "/farms" && path.startsWith("/farm/"))));
    document.querySelectorAll("#nav a, #mnav a").forEach((a) => a.classList.toggle("on", active && a.getAttribute("href") === `#${active[0]}`));
    document.getElementById("tb-page").textContent = active ? active[2] : "منصة بيانات المزارع";
    window.scrollTo(0, 0);
    try {
      if (path === "/") dashboard(params);
      else if (path === "/map") await mapPage(params);
      else if (path === "/farms") farmsPage(params);
      else if (path.startsWith("/farm/")) await farmPage(decodeURIComponent(path.slice(6)));
      else if (path === "/wells") await wellsPage(params);
      else if (path === "/meters") await metersPage(params);
      else if (path === "/sources") await sourcesPage();
      else app.innerHTML = `<p class="muted">الصفحة غير موجودة.</p>`;
    } catch (e) {
      app.innerHTML = `<div class="card"><b>تعذّر التحميل</b><p class="muted">${esc(e.message)}</p></div>`;
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
    `<section class="card ${opt.span || "c12"}"${opt.style ? ` style="${opt.style}"` : ""}><div class="sec-h"><h2>${ico(icon)}${title}</h2>${opt.action || ""}</div>${body}</section>`;
  const head = (title, sub = "", tools = "") => `<div class="head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${tools ? `<div class="tools">${tools}</div>` : ""}</div>`;
  const scopePick = (scope, path, params = {}) =>
    `<label class="pick"><span>النطاق:</span><select data-nav aria-label="النطاق"><option value="${href(path, { ...params, scope: undefined })}" ${scope !== "all" ? "selected" : ""}>المزارع المنزوعة</option><option value="${href(path, { ...params, scope: "all" })}" ${scope === "all" ? "selected" : ""}>كل المزارع (سجل الآبار)</option></select></label>`;
  // progress row: label + value, then an h-2 track with one or more segments
  function prow(label, value, segs, max) {
    const m = max || segs.reduce((s, x) => s + x.v, 0) || 1;
    return `<div class="prow"><div class="pl"><span>${esc(label)}</span><b>${value}</b></div><div class="ptrack">${segs
      .map((x) => `<span style="width:${Math.max(0, (x.v / m) * 100)}%;background:${x.c}" title="${esc(x.t || "")}"></span>`).join("")}</div></div>`;
  }
  const legend = (items) => `<div class="legend">${items.map(([l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join("")}</div>`;
  const ring = (p, color, label, value) =>
    `<div class="ring"><div class="r" style="background:conic-gradient(${color} ${p * 3.6}deg, var(--track) 0)"><b class="num">${value ?? `${fmt(p, 1)}%`}</b></div><span>${label}</span></div>`;
  function donut(items, center) {
    const total = items.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    const stops = items.map((x) => {
      const a = (acc / total) * 360;
      acc += x.value;
      return `${x.color} ${a}deg ${(acc / total) * 360}deg`;
    });
    return `<div class="donut"><div class="r" style="background:conic-gradient(${stops.join(",")})"><b class="num">${center ?? fmt(total)}<small>مزرعة</small></b></div><ul>${items
      .map((x) => `<li><span class="sw" style="background:${x.color}"></span><span>${esc(x.name)}</span><b class="num">${fmt(x.value)}</b><span class="muted num" style="width:38px;text-align:left;font-size:12px">${Math.round((x.value / total) * 100)}%</span></li>`)
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
      name: q === "—" ? "غير مصنفة (أغلبها الشمال)" : t(q), value: a.length, color: QUALITY[q] || NODATA,
    })).sort((a, b) => b.value - a.value);
    const lease = [...groupBy(F, (f) => f.lease_status || "—")].map(([l, a]) => ({
      name: l === "—" ? "غير محدد" : t(l), value: a.length, color: LEASE[l] || NODATA,
    })).sort((a, b) => b.value - a.value);
    const regions = [...groupBy(F, (f) => f.region || "غير محدد")]
      .map(([r, a]) => ({ r, n: a.length, a: sum(a, "wells_active"), i: sum(a, "wells_inactive") }))
      .sort((x, y) => (y.a + y.i) - (x.a + x.i)).filter((x) => x.a + x.i > 0).slice(0, 10);
    const regMax = Math.max(...regions.map((x) => x.a + x.i), 1);
    const top = [...prod].sort((a, b) => b.prod_total - a.prod_total).slice(0, 10);

    app.innerHTML = `
      ${head("لوحة مؤشرات المزارع", "بيانات المزارع المنزوعة في العلا: الخرائط، الآبار، العدادات، إنتاج التمور", scopePick(scope, "/"))}
      <div class="kpis k6">
        ${kpi("sprout", "عدد المزارع", fmt(F.length), `${fmt(T.mapped)} لها حدود على الخريطة`, { tint: "green", cls: "t-primary", subCls: "t-primary" })}
        ${kpi("ruler", "المساحة الإجمالية", `${fmt(T.area, 1)} <small>هـ</small>`, "هكتار")}
        ${kpi("palm", "أشجار النخيل", fmt(T.palms), F.length ? `${fmt(T.palms / F.length)} نخلة / مزرعة` : "")}
        ${kpi("box", "إنتاج التمور 2026", `${fmt(T.prod, 1)} <small>طن</small>`, `من ${fmt(prod.length)} مزرعة`, { tint: "beige", cls: "t-brown" })}
        ${kpi("droplet", "الآبار", fmt(T.wells), `${fmt(T.wa)} نشطة · ${fmt(T.wi)} متوقفة`, { subCls: T.wi ? "t-danger" : "" })}
        ${kpi("zap", "عدادات الكهرباء", fmt(T.meters), `${fmt(T.mw)} تعمل · ${fmt(T.mn)} لا تعمل`, { subCls: "t-primary" })}
      </div>
      <div class="grid12">
        ${card("trend", "إنتاج التمور حسب الدرجة (طن)", prod.length ? `
          <div class="grid12" style="margin:0">
            <div class="c6"><div class="sub-h">حسب الجهة</div>
              ${sides.map((x) => prow(`${t(x.s)} (${fmt(x.n)} مزرعة)`, `${fmt(x.g1 + x.g2 + x.g3, 1)} طن`, [{ v: x.g1, c: GRADE[0], t: "درجة أولى" }, { v: x.g2, c: GRADE[1], t: "درجة ثانية" }, { v: x.g3, c: GRADE[2], t: "درجة ثالثة" }], sideMax)).join("")}
              ${legend([["درجة أولى", GRADE[0]], ["درجة ثانية", GRADE[1]], ["درجة ثالثة (شيص)", GRADE[2]]])}
            </div>
            <div class="c6"><div class="sub-h">حسب الدرجة</div>
              ${prow("درجة أولى — جودة عالية", `${fmt(T.g1, 1)} / ${fmt(T.prod, 1)}`, [{ v: T.g1, c: GRADE[0] }], T.prod)}
              ${prow("درجة ثانية — متوسطة", `${fmt(T.g2, 1)} / ${fmt(T.prod, 1)}`, [{ v: T.g2, c: GRADE[1] }], T.prod)}
              ${prow("درجة ثالثة — شيص", `${fmt(T.g3, 1)} / ${fmt(T.prod, 1)}`, [{ v: T.g3, c: GRADE[2] }], T.prod)}
            </div>
          </div>` : `<p class="muted">لا توجد بيانات إنتاج لهذا النطاق.</p>`, { span: "c7" })}
        ${card("gauge", "مؤشرات التشغيل", `<div class="rings">
            ${ring(pct(T.mw, T.meters), C.green, "عدادات تعمل")}
            ${ring(pct(T.wa, T.wells), C.brown, "آبار نشطة")}
            ${ring(pct(T.mapped, F.length), C.gold, "مزارع لها حدود")}
          </div>
          <div class="strip" style="margin-top:16px"><div><b class="num">${fmt(prod.length)}</b><span>مزارع لها إنتاج</span></div><div><b class="num">${fmt(T.palms ? (T.prod * 1000) / T.palms : 0, 1)}</b><span>كجم / نخلة</span></div><div><b class="num">${fmt(F.filter((f) => f.deserted === "Yes").length)}</b><span>مرشحة للترك</span></div></div>`, { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("droplet", "الآبار حسب المنطقة", regions.length ? regions.map((r) => prow(r.r, `${fmt(r.a)} نشطة / ${fmt(r.a + r.i)}`, [{ v: r.a, c: C.green, t: "نشطة" }, { v: r.i, c: C.red, t: "متوقفة" }], regMax)).join("") + legend([["آبار نشطة", C.green], ["آبار متوقفة", C.red]]) : `<p class="muted">لا توجد آبار مسجلة لهذا النطاق.</p>`, { span: "c7" })}
        ${card("pie", "جودة التمور", donut(quality), { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("award", "أعلى 10 مزارع إنتاجاً", `<div class="scroll"><table class="tbl"><thead><tr><th>رمز المزرعة</th><th>المشروع</th><th>الجهة</th><th>النخيل</th><th>الإنتاج (طن)</th><th>الجودة</th></tr></thead><tbody>
          ${top.map((f) => `<tr><td>${farmLink(f.code)}</td><td>${esc(f.project)}</td><td>${t(f.side)}</td><td class="num">${fmt(f.date_trees)}</td><td class="num"><b>${fmt(f.prod_total, 2)}</b></td><td>${badge(f.prod_quality)}</td></tr>`).join("")}
          </tbody></table></div>`, { span: "c8", action: `<a class="link" href="#/farms?sort=prod_total&dir=desc">كل المزارع</a>` })}
        ${card("layers", "حالة التأجير", donut(lease), { span: "c4" })}
      </div>
      <p class="note">المصدر: ملفات الهيئة الملكية لمحافظة العلا. أُزيلت أسماء الملاك وأرقام التواصل من هذه النسخة.</p>`;
  }

  // ------------------------------------------------------------ farms list
  const COLS = [
    ["code", "رمز المزرعة"], ["project", "المشروع"], ["region", "المنطقة"], ["side", "الجهة"], ["area_ha", "المساحة (هـ)"], ["date_trees", "النخيل"],
    ["prod_total", "الإنتاج (طن)"], ["prod_quality", "الجودة"], ["wells_total", "الآبار"], ["meters_total", "العدادات"], ["lease_status", "التأجير"], ["source_count", "المصادر"],
  ];
  function filterFarms(p) {
    const scope = p.scope === "all" ? "all" : "plan";
    const q = (p.q || "").toLowerCase();
    let rows = scoped(scope).filter((f) =>
      (!q || [f.code, f.region, f.project, f.plot_code, f.cluster].some((v) => v && String(v).toLowerCase().includes(q))) &&
      (!p.side || f.side === p.side) && (!p.region || f.region === p.region) && (!p.lease || f.lease_status === p.lease) &&
      (!p.quality || f.prod_quality === p.quality) &&
      (!p.has || (p.has === "map" ? f.geometry_source : p.has === "production" ? f.prod_total != null : p.has === "meters" ? f.meters_total > 0 : f.wells_total > 0)));
    const sort = COLS.some((c) => c[0] === p.sort) ? p.sort : scope === "plan" ? "prod_total" : "code";
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
    const sel = (name, label, values) => values.length ? `<select class="field" name="${name}" aria-label="${label}"><option value="">${label}: الكل</option>${values.map((v) => `<option value="${esc(v)}" ${p[name] === v ? "selected" : ""}>${esc(t(v))}</option>`).join("")}</select>` : "";
    const cell = (f, k) => {
      if (k === "code") return farmLink(f.code);
      if (k === "project") return `<span class="trunc" style="display:inline-block">${esc(f.project)}</span>`;
      if (k === "side") return t(f.side);
      if (k === "prod_quality" || k === "lease_status") return badge(f[k]);
      if (k === "wells_total") return f.wells_total ? `${f.wells_total}${f.wells_inactive ? ` <span class="t-danger" style="font-size:12px">(${f.wells_inactive} متوقفة)</span>` : ""}` : "—";
      if (k === "meters_total") return f.meters_total ? `${f.meters_total}${f.meters_not_working ? ` <span class="t-danger" style="font-size:12px">(${f.meters_not_working} لا تعمل)</span>` : ""}` : "—";
      if (k === "prod_total") return `<b>${fmt(f.prod_total, 2)}</b>`;
      if (k === "area_ha") return fmt(f.area_ha, 2);
      if (k === "region") return esc(f.region);
      return fmt(f[k]);
    };
    app.innerHTML = `
      ${head("سجل المزارع", `<b class="num">${fmt(rows.length)}</b> مزرعة مطابقة`, `${scopePick(scope, "/farms", { q: p.q })}<button class="btn" id="csv">${ico("download")}تصدير CSV</button>`)}
      <form class="card filters" id="ff">
        <input class="field grow" name="q" value="${esc(p.q || "")}" placeholder="بحث: رمز، مشروع، منطقة…" />
        ${sel("side", "الجهة", opts("side"))}${sel("region", "المنطقة", opts("region"))}${sel("lease", "التأجير", opts("lease_status"))}${sel("quality", "الجودة", opts("prod_quality"))}
        <select class="field" name="has" aria-label="تحتوي على"><option value="">تحتوي على: أي</option>${[["map", "حدود على الخريطة"], ["production", "بيانات إنتاج"], ["meters", "عدادات"], ["wells", "آبار"]].map(([v, l]) => `<option value="${v}" ${p.has === v ? "selected" : ""}>${l}</option>`).join("")}</select>
        <button class="btn btn-primary">تطبيق</button><a class="btn" href="${href("/farms", { scope: p.scope })}">مسح</a>
      </form>
      <div class="card scroll" style="padding:0"><table class="tbl"><thead><tr>${COLS.map(([k, l]) => `<th><a href="${href("/farms", { ...p, sort: k, dir: sort === k && dir === -1 ? "asc" : "desc", page: undefined })}">${l} ${sort === k ? (dir === -1 ? "▼" : "▲") : ""}</a></th>`).join("")}</tr></thead>
      <tbody>${rows.slice((page - 1) * SIZE, page * SIZE).map((f) => `<tr>${COLS.map(([k]) => `<td class="${["area_ha", "date_trees", "prod_total", "wells_total", "meters_total", "source_count"].includes(k) ? "num" : ""}">${cell(f, k)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${COLS.length}" class="empty">لا توجد نتائج</td></tr>`}</tbody></table></div>
      ${pages > 1 ? `<div class="pager">${page > 1 ? `<a class="btn" href="${href("/farms", { ...p, page: page - 1 })}">السابق</a>` : ""}<span class="muted">صفحة <b class="num">${page}</b> من <b class="num">${pages}</b></span>${page < pages ? `<a class="btn" href="${href("/farms", { ...p, page: page + 1 })}">التالي</a>` : ""}</div>` : ""}`;
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
  const SAT = () => L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 20, maxNativeZoom: 19, attribution: "Esri World Imagery" });
  const OSM = () => L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 20, maxNativeZoom: 19, attribution: "© OpenStreetMap" });
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
  const popupRows = (rows) => `<table>${rows.map(([k, v]) => `<tr><td style="color:#6b7280;padding-left:12px">${k}</td><td><b>${v}</b></td></tr>`).join("")}</table>`;
  const farmPopup = (f) => `<div dir="rtl" style="min-width:220px"><div style="font-size:15px;font-weight:700">${esc(f.code)}</div><div style="color:#6b7280;margin-bottom:6px">${esc(f.project)}</div>${popupRows([
    ["الجهة", esc(t(f.side))], ["المساحة", `${fmt(f.area_ha, 2)} هـ`], ["النخيل", fmt(f.date_trees)], ["الإنتاج", `${fmt(f.prod_total, 2)} طن`], ["الجودة", esc(t(f.prod_quality))],
    ["التأجير", esc(t(f.lease_status))], ["الآبار", fmt(f.wells_total)], ["العدادات", fmt(f.meters_total)],
  ])}<a href="#/farm/${encodeURIComponent(f.code)}" style="display:inline-block;margin-top:8px;font-weight:700;color:${C.green}">فتح ملف المزرعة</a></div>`;
  const propsPopup = (title, p) => {
    const rows = Object.entries(p).filter(([k, v]) => !k.startsWith("_") && k !== "Name" && v !== null && v !== "").slice(0, 12).map(([k, v]) => [esc(k), esc(v)]);
    const link = p._farm;
    return `<div dir="rtl" style="max-width:300px"><b>${esc(title)}</b>${popupRows(rows)}${link ? `<a href="#/farm/${encodeURIComponent(link)}" style="font-weight:700;color:${C.green}">ملف المزرعة ${esc(link)}</a>` : ""}</div>`;
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
  const LEGENDS = {
    lease: [...Object.entries(LEASE).map(([k, c]) => [t(k), c]), ["غير محدد", NODATA]],
    quality: [["عالية", QUALITY.High], ["متوسطة", QUALITY.Medium], ["منخفضة", QUALITY.Low], ["غير مصنفة", NODATA]],
    side: [...Object.entries(SIDE).map(([k, c]) => [t(k), c]), ["غير محدد", NODATA]],
    production: [...PROD_STEPS.map(([m, c], i) => [i < PROD_STEPS.length - 1 ? `${m} – ${PROD_STEPS[i + 1][0]} طن` : `${m}+ طن`, c]), ["لا توجد بيانات", NODATA]],
  };
  const OVERLAY_COLORS = ["#7b4fa3", "#d0632a", "#2a8fa8", "#a83a6b", "#5d7d2a", "#8a6a2a", "#3a4fa8", "#a8762a", "#2aa86b", "#666"];

  async function mapPage(p) {
    const scope = p.scope === "all" ? "all" : "plan";
    const [shapes, layers] = await Promise.all([load("farm-shapes.json"), load("layers.json")]);
    app.innerHTML = `
      ${head("خريطة المزارع", "حدود المزارع على الصور الفضائية مع العدادات والآبار وطبقات التخطيط", scopePick(scope, "/map"))}
      <div class="mapbox"><div class="map" id="map"></div>
        <div class="card mpanel" id="mpanel">
          <form id="msearch" style="display:flex;gap:8px"><input class="field" style="flex:1;min-width:0" name="q" value="${esc(p.farm || "")}" placeholder="رمز المزرعة…" aria-label="بحث عن مزرعة" /><button class="btn btn-primary">بحث</button></form>
          <label style="display:block"><span class="muted" style="font-size:12px">تلوين المزارع حسب</span>
            <select id="mode" class="field" style="width:100%;margin-top:4px"><option value="lease">حالة التأجير</option><option value="production">كمية الإنتاج</option><option value="quality">جودة التمور</option><option value="side">الجهة (شمال / جنوب)</option></select></label>
          <div class="lg" id="lg"></div>
          <div class="sec"><div class="muted" style="font-size:12px;margin-bottom:6px">النقاط</div>
            <label><input type="checkbox" data-pt="meters" checked /><span class="sw" style="background:#f2c230;border-radius:50%"></span>عدادات الكهرباء</label>
            <label><input type="checkbox" data-pt="wells" /><span class="sw" style="background:#2a9fd6;border-radius:50%"></span>آبار المزارع (سجل الآبار)</label>
            <label><input type="checkbox" data-pt="newwells" /><span class="sw" style="background:#9b59d0;border-radius:50%"></span>الآبار الجديدة المحدّثة</label>
          </div>
          <details class="sec"><summary class="muted" style="cursor:pointer;font-size:12px">طبقات إضافية (${layers.length})</summary>
            <div style="margin-top:8px;display:grid;gap:4px">${layers.map((l) => `<label><input type="checkbox" data-ov="${esc(l.key)}" /><span style="flex:1">${esc(l.title)}</span><span class="muted num" style="font-size:12px">${fmt(l.features)}</span></label>`).join("")}</div></details>
          <div class="sec muted" style="font-size:12px" id="mcount"></div>
        </div>
        <button class="btn mtoggle" id="mtoggle">إخفاء اللوحة</button>
        <div class="card mstatus" id="mstatus" hidden></div>
      </div>`;
    const status = (msg) => {
      const el = document.getElementById("mstatus");
      if (!el) return;
      el.hidden = !msg;
      el.textContent = msg || "";
    };
    const el = document.getElementById("map");
    const map = L.map(el, { preferCanvas: true, zoomControl: false }).setView([26.7, 37.95], 11);
    L.control.zoom({ position: "topleft" }).addTo(map);
    const sat = SAT().addTo(map);
    L.control.layers({ "صور فضائية": sat, "خريطة شوارع": OSM() }, {}, { position: "topleft" }).addTo(map);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

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
    const farms = L.geoJSON(fc, {
      style: (f) => ({ color: colorBy(f.properties, mode), weight: 1.6, fillColor: colorBy(f.properties, mode), fillOpacity: 0.45 }),
      pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 4, color: "#fff", weight: 1, fillColor: colorBy(f.properties, mode), fillOpacity: 0.9 }),
      onEachFeature: (f, l) => {
        l.bindPopup(() => farmPopup(f.properties), { maxWidth: 320 });
        l.bindTooltip(f.properties.code, { sticky: true, direction: "top" });
        index.set(f.properties.code, l);
      },
    }).addTo(map);
    document.getElementById("mcount").innerHTML = `معروض <b class="num">${fmt(fc.features.length)}</b> مزرعة`;

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

    const drawLegend = () => (document.getElementById("lg").innerHTML = LEGENDS[mode].map(([l, c]) => `<span><span class="sw" style="background:${c}"></span>${l}</span>`).join(""));
    drawLegend();
    document.getElementById("mode").onchange = (e) => {
      mode = e.target.value;
      drawLegend();
      farms.eachLayer((l) => {
        const c = colorBy(l.feature.properties, mode);
        l.setStyle(l instanceof L.CircleMarker ? { fillColor: c } : { color: c, fillColor: c });
      });
    };
    document.getElementById("msearch").onsubmit = (e) => {
      e.preventDefault();
      const q = e.target.q.value.trim().toUpperCase();
      const hit = index.get(q) || [...index.entries()].find(([k]) => k.includes(q))?.[1];
      if (hit) {
        status("");
        zoomTo(hit);
      } else status(`لم يتم العثور على ${q} في هذا النطاق`);
    };
    document.getElementById("mtoggle").onclick = (e) => {
      const pnl = document.getElementById("mpanel");
      pnl.hidden = !pnl.hidden;
      e.target.textContent = pnl.hidden ? "إظهار اللوحة" : "إخفاء اللوحة";
    };

    const pts = {};
    async function togglePoints(kind, on) {
      if (!on) return pts[kind]?.remove();
      if (!pts[kind]) {
        status("جارٍ تحميل النقاط…");
        let feats = [];
        if (kind === "meters") feats = (await load("meters.json")).filter((m) => m.lat != null).map((m) => [m.lat, m.lng, { "رقم العداد": m.meter_no, الحالة: t(m.status), "مفصول؟": t(m.disconnected), _farm: m.farm_code }, `عداد ${m.meter_no}`, m.status === "Working" ? "#f2c230" : "#e0412f", 5]);
        else if (kind === "newwells") feats = (await load("wells.json")).filter((w) => w.lat != null).map((w) => [w.lat, w.lng, { التصنيف: w.category, "أقرب عداد": w.nearest_meter, _farm: w.farm_code }, w.name, "#9b59d0", 4]);
        else feats = (await load("well-points.json")).map(([code, lng, lat]) => {
          const f = BY_CODE.get(code) || {};
          return [lat, lng, { المنطقة: f.region, "آبار نشطة": f.wells_active, "آبار متوقفة": f.wells_inactive, _farm: code }, `آبار المزرعة ${code}`, f.wells_inactive && !f.wells_active ? "#e0412f" : "#2a9fd6", 3.5];
        });
        pts[kind] = L.layerGroup(feats.map(([lat, lng, props, title, fill, r]) =>
          L.circleMarker([lat, lng], { radius: r, color: "#1a1a1a", weight: 0.8, fillColor: fill, fillOpacity: 0.95 }).bindPopup(() => propsPopup(title, props))));
        status("");
      }
      pts[kind].addTo(map);
    }
    const ovs = {};
    async function toggleOverlay(key, on) {
      if (!on) return ovs[key]?.remove();
      if (!ovs[key]) {
        status("جارٍ تحميل الطبقة…");
        const i = layers.findIndex((l) => l.key === key);
        const color = OVERLAY_COLORS[i % OVERLAY_COLORS.length];
        ovs[key] = L.geoJSON(await load(`layers/${key}.json`), {
          style: () => ({ color, weight: 1.4, fillColor: color, fillOpacity: 0.12, dashArray: "4 3" }),
          pointToLayer: (_f, ll) => L.circleMarker(ll, { radius: 3, color, fillColor: color, fillOpacity: 0.8, weight: 1 }),
          onEachFeature: (f, l) => l.bindPopup(() => propsPopup(f.properties.Name || layers[i].title, f.properties)),
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
  const CAT = { masterplan: "المخطط والدراسات المالية", production: "تقارير الإنتاج", survey: "الحصر الميداني", wells: "الآبار", meters: "عدادات الكهرباء" };
  const dl = (rows) => `<dl class="dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v ?? "—"}</dd>`).join("")}</dl>`;

  async function farmPage(code) {
    const f = BY_CODE.get(code.toUpperCase());
    if (!f) {
      app.innerHTML = `<div class="card"><b>لا توجد مزرعة بالرمز ${esc(code)}</b><p><a class="link" href="#/farms">سجل المزارع</a></p></div>`;
      return;
    }
    document.getElementById("tb-page").textContent = `ملف المزرعة ${f.code}`;
    const [meters, wells, shapes, recBucket, farmLayers] = await Promise.all([
      load("meters.json"), load("wells.json"), load("farm-shapes.json"), load(`records/${bucket(f.code)}.json`), load("farm-layers.json"),
    ]);
    const M = meters.filter((m) => m.farm_code === f.code);
    const W = wells.filter((w) => w.farm_code === f.code);
    const shape = shapes.features.find((s) => s.properties.code === f.code);
    const recs = recBucket[f.code] || [];
    const lyrs = farmLayers[f.code] || [];
    const g = [f.prod_g1 || 0, f.prod_g2 || 0, f.prod_g3 || 0];

    app.innerHTML = `
      <a class="back" href="#/farms">${ico("arrow")}سجل المزارع</a>
      <div class="head"><div>
        <h1 class="num" style="direction:ltr;text-align:right">${esc(f.code)}</h1>
        <p>${esc([f.project, f.region].filter(Boolean).join(" · ") || "—")}</p>
        <div class="badges">
          ${f.side ? `<span class="badge">${t(f.side)}</span>` : ""}${f.cluster ? `<span class="badge">العنقود: ${esc(f.cluster)}</span>` : ""}
          ${f.lease_status ? `<span class="badge ${f.lease_status === "Full" ? "solid" : tone(f.lease_status)}">${t(f.lease_status)}</span>` : ""}
          ${f.expropriation ? `<span class="badge ${f.expropriation === "Expropriated" ? "gold" : ""}">${t(f.expropriation)}</span>` : ""}
          ${f.prod_quality ? badge(f.prod_quality, `جودة ${t(f.prod_quality)}`) : ""}${f.deserted === "Yes" ? `<span class="badge danger">مرشحة للترك وفق الدراسة</span>` : ""}
        </div></div>
        <div class="tools"><a class="btn btn-primary" href="${href("/map", { farm: f.code, scope: f.in_plan ? undefined : "all" })}">${ico("map")}عرض على الخريطة</a></div>
      </div>
      <div class="kpis k6">
        ${kpi("ruler", "المساحة", `${fmt(f.area_ha, 2)} <small>هـ</small>`, "", { tint: "green", cls: "t-primary" })}
        ${kpi("palm", "أشجار النخيل", fmt(f.date_trees), f.citrus_trees || f.mango_trees ? `حمضيات ${fmt(f.citrus_trees)} · مانجو ${fmt(f.mango_trees)}` : "")}
        ${kpi("box", "الإنتاج 2026", `${fmt(f.prod_total, 2)} <small>طن</small>`, f.prod_total != null && f.date_trees ? `${fmt((f.prod_total * 1000) / f.date_trees, 1)} كجم / نخلة` : "", { tint: "beige", cls: "t-brown" })}
        ${kpi("droplet", "الآبار", fmt(f.wells_total), f.wells_total ? `${fmt(f.wells_active)} نشطة · ${fmt(f.wells_inactive)} متوقفة` : "", { subCls: f.wells_inactive ? "t-danger" : "" })}
        ${kpi("zap", "عدادات الكهرباء", fmt(f.meters_total), f.meters_total ? `${fmt(f.meters_working)} تعمل · ${fmt(f.meters_not_working)} لا تعمل` : "", { subCls: f.meters_not_working ? "t-danger" : "t-primary" })}
        ${kpi("database", "مصادر البيانات", fmt(f.source_count), `${fmt(recs.length)} سجل`)}
      </div>
      <div class="grid12">
        ${card("pin", "الموقع والحدود", `<div class="farmmap" id="fmap"></div>
          <div class="legend"><span><i style="background:transparent;border:2px solid #f2c230"></i>حدود المزرعة${f.geometry_source ? ` (${esc(lyrs.find((l) => l[0] === f.geometry_source)?.[1] || f.geometry_source)})` : ""}</span>
          <span><i style="background:#f2c230;border-radius:50%"></i>عداد يعمل</span><span><i style="background:#e0412f;border-radius:50%"></i>عداد لا يعمل</span><span><i style="background:#2a9fd6;border-radius:50%"></i>بئر</span>
          ${f.lat != null ? `<span class="num">${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}</span>` : ""}</div>`, { span: "c7" })}
        ${card("info", "البيانات الأساسية", dl([
          ["رمز القطعة", esc(f.plot_code)], ["استخدام الأرض", esc(f.land_use)], ["المشروع", esc(f.project)], ["المنطقة", esc(f.region)], ["الجهة", t(f.side)],
          ["العنقود", esc(f.cluster)], ["حالة النزع", t(f.expropriation)], ["حالة التأجير", t(f.lease_status)], ["التصنيف", t(f.classification)], ["الأصناف", esc(f.varieties)],
        ]), { span: "c5" })}
      </div>
      <div class="grid12">
        ${card("trend", "إنتاج التمور 2026", f.prod_total != null ? `
          ${prow("درجة أولى", `${fmt(g[0], 2)} طن`, [{ v: g[0], c: GRADE[0] }], f.prod_total || 1)}
          ${prow("درجة ثانية", `${fmt(g[1], 2)} طن`, [{ v: g[1], c: GRADE[1] }], f.prod_total || 1)}
          ${prow("درجة ثالثة (شيص)", `${fmt(g[2], 2)} طن`, [{ v: g[2], c: GRADE[2] }], f.prod_total || 1)}
          <div class="kvrow"><span class="muted">الإجمالي</span><b class="num">${fmt(f.prod_total, 2)} طن</b></div>
          <div class="kvrow"><span class="muted">الجودة</span><b>${t(f.prod_quality)}</b></div>` : `<p class="muted">لا توجد بيانات إنتاج لهذه المزرعة.</p>`, { span: "c4" })}
        ${card("droplet", "الآبار", `
          ${prow("نشطة", `${fmt(f.wells_active)} / ${fmt(f.wells_total)}`, [{ v: f.wells_active || 0, c: C.green }], f.wells_total || 1)}
          ${prow("متوقفة", `${fmt(f.wells_inactive)} / ${fmt(f.wells_total)}`, [{ v: f.wells_inactive || 0, c: C.red }], f.wells_total || 1)}
          ${W.length ? `<ul class="wl">${W.map((w) => `<li><b>${esc(w.name)}</b><small>${esc(w.category)} · أقرب عداد <span class="num">${esc(w.nearest_meter)}</span> · يبعد <span class="num">${fmt(w.distance_farm_m)}</span> م</small></li>`).join("")}</ul>` : ""}`, { span: "c4" })}
        ${card("wallet", "التكاليف والعوائد (الدراسة)", f.capex != null || f.opex != null ? `
          <div class="strip"><div><b class="num">${fmt((f.capex || 0) / 1000, 1)}K</b><span>رأسمالية (ر.س)</span></div><div><b class="num">${fmt((f.opex || 0) / 1000, 1)}K</b><span>تشغيل سنوي</span></div><div><b class="num">${fmt((f.rev_y3 || 0) / 1000, 1)}K</b><span>إيراد السنة 3</span></div></div>
          <div class="kvrow"><span class="muted">مرشحة للترك؟</span><b>${t(f.deserted)}</b></div>` : `<p class="muted">لا توجد بيانات مالية.</p>`, { span: "c4" })}
      </div>
      <div class="grid12">
        ${card("zap", `عدادات الكهرباء (${M.length})`, M.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>رقم العداد</th><th>الحالة</th><th>مفصول؟</th><th>طريقة الربط</th><th>المسافة عن الحدود (م)</th><th>مرجع البئر</th><th>التفاصيل الكهربائية</th></tr></thead><tbody>
          ${M.map((m) => `<tr><td class="num"><b>${esc(m.meter_no)}</b></td><td>${badge(m.status)}</td><td>${t(m.disconnected)}</td><td>${esc(m.assignment)}</td><td class="num">${fmt(m.distance_m, 1)}</td><td>${esc(m.well_ref)}</td><td style="white-space:normal;min-width:240px;font-size:12px">${esc(m.details)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">لا توجد عدادات مرتبطة بهذه المزرعة.</p>`)}
      </div>
      <div class="grid12">
        ${card("table", "كل البيانات حسب المصدر", `<p class="muted" style="font-size:13px;margin-top:0">كل صف ورد عن هذه المزرعة في الملفات الأصلية (بدون بيانات التواصل الشخصية).</p>
          ${[...groupBy(recs, (r) => r.c)].map(([c, rs]) => `<div class="cat-h">${CAT[c] || esc(c)}</div>${rs.map((r) => {
            const e = Object.entries(r.d).filter(([k]) => !k.startsWith("col_"));
            const id = r.d["Power Meter No."] ?? r.d["Well Name"];
            return `<details class="rec"><summary><b>${esc(r.t)}${id != null ? `<span class="muted num" style="font-weight:400"> — ${esc(id)}</span>` : ""}</b><span class="muted" style="font-size:12px">${e.length} حقل</span></summary><div>
              <div class="muted num" style="font-size:12px;margin-bottom:8px;direction:ltr;text-align:right">${esc(r.f)}</div>
              <table class="tbl" dir="ltr"><tbody>${e.map(([k, v]) => `<tr><td class="muted" style="width:40%;white-space:normal">${esc(k)}</td><td style="white-space:normal">${esc(typeof v === "number" ? fmt(v, 3) : v)}</td></tr>`).join("")}</tbody></table></div></details>`;
          }).join("")}`).join("")}
          ${lyrs.length ? `<div class="cat-h">طبقات الخرائط</div><div class="badges">${lyrs.map(([k, title, type]) => `<span class="badge ${k === f.geometry_source ? "primary" : ""}">${esc(title)} · ${esc(type)}</span>`).join("")}</div>` : ""}`)}
      </div>`;

    const el = document.getElementById("fmap");
    const map = L.map(el, { preferCanvas: true });
    SAT().addTo(map);
    const group = L.featureGroup().addTo(map);
    if (shape) L.geoJSON(shape, { style: { color: "#f2c230", weight: 2.5, fillColor: "#f2c230", fillOpacity: 0.15 } }).addTo(group);
    for (const m of M) if (m.lat != null) L.circleMarker([m.lat, m.lng], { radius: 6, color: "#111", weight: 1, fillColor: m.status === "Working" ? "#f2c230" : "#e0412f", fillOpacity: 1 }).bindTooltip(`عداد ${m.meter_no} — ${t(m.status)}`).addTo(group);
    for (const w of W) if (w.lat != null) L.circleMarker([w.lat, w.lng], { radius: 6, color: "#111", weight: 1, fillColor: "#2a9fd6", fillOpacity: 1 }).bindTooltip(w.name).addTo(group);
    if (!shape && f.lat != null) L.circleMarker([f.lat, f.lng], { radius: 8, color: "#fff", weight: 2, fillColor: C.green, fillOpacity: 1 }).addTo(group);
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
    const regions = [...groupBy(F, (f) => f.region || "غير محدد")].map(([r, a]) => ({ r, a: sum(a, "wells_active"), i: sum(a, "wells_inactive") })).filter((x) => x.a + x.i).sort((x, y) => (y.a + y.i) - (x.a + x.i)).slice(0, 14);
    const regMax = Math.max(...regions.map((x) => x.a + x.i), 1);
    const W = { t: sum(F, "wells_total"), a: sum(F, "wells_active"), i: sum(F, "wells_inactive") };
    const chip = (on, h, l) => `<a href="${h}" class="chip ${on ? "on" : ""}">${l}</a>`;
    app.innerHTML = `
      ${head("الآبار", "أعداد الآبار لكل مزرعة من سجل آبار العلا، والآبار الجديدة الممسوحة حديثاً", scopePick(scope, "/wells"))}
      <div class="kpis k4">
        ${kpi("droplet", "إجمالي الآبار", fmt(W.t), `${fmt(F.filter((f) => f.wells_total > 0).length)} مزرعة لديها آبار`, { tint: "green", cls: "t-primary" })}
        ${kpi("trend", "آبار نشطة", fmt(W.a), `${fmt(pct(W.a, W.t), 1)}% من الإجمالي`, { subCls: "t-primary" })}
        ${kpi("gauge", "آبار متوقفة", fmt(W.i), `${fmt(pct(W.i, W.t), 1)}% من الإجمالي`, { tint: "beige", cls: "t-danger" })}
        ${kpi("pin", "آبار جديدة ممسوحة", fmt(wells.length), "من ملف Updated_Wells")}
      </div>
      <div class="grid12">${card("droplet", "الآبار حسب المنطقة", regions.length ? regions.map((r) => prow(r.r, `${fmt(r.a)} نشطة / ${fmt(r.a + r.i)}`, [{ v: r.a, c: C.green }, { v: r.i, c: C.red }], regMax)).join("") + legend([["آبار نشطة", C.green], ["آبار متوقفة", C.red]]) : `<p class="muted">لا توجد آبار مسجلة لهذا النطاق.</p>`)}</div>
      <div class="grid12">${card("pin", `الآبار الجديدة الممسوحة (${list.length})`, `
        <div class="chips" style="margin-bottom:12px">${chip(!p.category, href("/wells", { scope: p.scope }), "الكل")}${cats.map(([c, n]) => chip(p.category === c, href("/wells", { scope: p.scope, category: c }), `${esc(c)} (${n})`)).join("")}</div>
        <div class="scroll tall"><table class="tbl"><thead><tr><th>اسم البئر</th><th>التصنيف</th><th>أقرب مزرعة</th><th>المسافة عن المزرعة (م)</th><th>تطابق موثوق</th><th>أقرب عداد</th><th>المسافة عن العداد (م)</th></tr></thead><tbody>
        ${list.map((w) => `<tr><td>${esc(w.name)}</td><td><span class="badge">${esc(w.category)}</span></td><td>${w.farm_code ? farmLink(w.farm_code) : "—"}</td><td class="num">${fmt(w.distance_farm_m, 1)}</td><td>${w.confident === "Yes" ? `<span class="badge primary">نعم</span>` : `<span class="badge warn">لا</span>`}</td><td class="num">${esc(w.nearest_meter)}</td><td class="num">${fmt(w.distance_meter_m, 1)}</td></tr>`).join("")}
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
      ${head("عدادات الكهرباء", "مجمّعة من ملفات المخطط الرئيسي ومزارع الواحة و COD بعد إزالة التكرار")}
      <div class="kpis k4">
        ${kpi("zap", "إجمالي العدادات", fmt(all.length), `${fmt(new Set(all.map((m) => m.farm_code)).size)} مزرعة`, { tint: "green", cls: "t-primary" })}
        ${kpi("trend", "تعمل", fmt(working), `${fmt(pct(working, all.length), 1)}%`, { subCls: "t-primary" })}
        ${kpi("gauge", "لا تعمل", fmt(all.length - working), `${fmt(pct(all.length - working, all.length), 1)}%`, { tint: "beige", cls: "t-danger" })}
        ${kpi("info", "مفصولة", fmt(disc), "حسب الكشف الكهربائي")}
      </div>
      <form class="card filters" id="mf"><input class="field grow" name="q" value="${esc(p.q || "")}" placeholder="رقم العداد أو رمز المزرعة…" />
        <select class="field" name="status" aria-label="الحالة"><option value="">الحالة: الكل</option><option value="Working" ${p.status === "Working" ? "selected" : ""}>يعمل</option><option value="Not working" ${p.status === "Not working" ? "selected" : ""}>لا يعمل</option></select>
        <button class="btn btn-primary">تطبيق</button><a class="btn" href="#/meters">مسح</a></form>
      <div class="card scroll tall" style="padding:0"><table class="tbl"><thead><tr><th>رقم العداد</th><th>المزرعة</th><th>المشروع</th><th>الحالة</th><th>مفصول؟</th><th>طريقة الربط</th><th>المسافة (م)</th><th>المصدر</th><th>التفاصيل</th></tr></thead><tbody>
      ${rows.map((m) => `<tr><td class="num"><b>${esc(m.meter_no)}</b></td><td>${farmLink(m.farm_code)}</td><td class="trunc">${esc(BY_CODE.get(m.farm_code)?.project)}</td><td>${badge(m.status)}</td><td>${t(m.disconnected)}</td><td>${esc(m.assignment)}</td><td class="num">${fmt(m.distance_m, 1)}</td><td class="muted" style="font-size:12px">${esc(m.origin)}</td><td class="trunc" style="font-size:12px;max-width:280px" title="${esc(m.details)}">${esc(m.details)}</td></tr>`).join("") || `<tr><td colspan="9" class="empty">لا توجد نتائج</td></tr>`}
      </tbody></table></div>`;
    document.getElementById("mf").onsubmit = (e) => {
      e.preventDefault();
      location.hash = href("/meters", Object.fromEntries(new FormData(e.target)));
    };
  }

  // ------------------------------------------------------------ sources
  async function sourcesPage() {
    const s = await load("sources.json");
    const CATS = { masterplan: "المخطط/الدراسات", production: "الإنتاج", survey: "الحصر", wells: "الآبار", meters: "العدادات" };
    app.innerHTML = `
      ${head("مصادر البيانات", `آخر بناء: <span class="num">${esc(s.built_at.replace("T", " "))}</span>`)}
      <div class="grid12">${card("lock", "عن هذه النسخة", `<p style="margin:0;line-height:1.9;font-size:14px;color:var(--ink2)">نسخة محمية بكلمة مرور من منصة بيانات المزارع. البيانات مشفّرة (AES-256)، وأُزيلت منها أسماء ملاك المزارع وأرقام جوالاتهم.</p>`)}</div>
      <div class="grid12">${card("table", `الجداول (${s.sheets.length})`, `<div class="scroll"><table class="tbl"><thead><tr><th>المصدر</th><th>الفئة</th><th>الملف / الورقة</th><th>الصفوف</th></tr></thead><tbody>
        ${s.sheets.map((x) => `<tr><td><b>${esc(x.title)}</b></td><td><span class="badge">${CATS[x.category] || esc(x.category)}</span></td><td class="muted" dir="ltr" style="font-size:12px;white-space:normal">${esc(x.file)} › ${esc(x.sheet)}</td><td class="num">${fmt(x.rows)}</td></tr>`).join("")}</tbody></table></div>`)}</div>
      <div class="grid12">${card("layers", `طبقات الخرائط (${s.layers.length})`, `<div class="scroll"><table class="tbl"><thead><tr><th>الطبقة</th><th>الملف</th><th>الأشكال</th><th>مرتبطة بمزارع</th></tr></thead><tbody>
        ${s.layers.map((x) => `<tr><td><b>${esc(x.title)}</b></td><td class="muted" dir="ltr" style="font-size:12px;white-space:normal">${esc(x.file)}</td><td class="num">${fmt(x.features)}</td><td class="num">${fmt(x.linked)}</td></tr>`).join("")}</tbody></table></div>`)}</div>`;
  }

  // ------------------------------------------------------------ boot
  const rail = document.getElementById("rail");
  const mnav = document.getElementById("mnav");
  const tbEnd = document.getElementById("tb-end");
  mnav.innerHTML = PAGES.map(([p, i, l]) => `<a href="#${p}">${ico(i)}${l}</a>`).join("");
  hydrate();
  document.getElementById("tb-date").innerHTML = `${ico("calendar")}${new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "long", year: "numeric" })}`;
  document.getElementById("gsearch").onsubmit = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) location.hash = href("/farms", { scope: "all", q });
  };
  document.getElementById("print").onclick = () => window.print();
  document.getElementById("theme").onclick = () => {
    const attr = document.documentElement.getAttribute("data-theme");
    const dark = attr ? attr === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch { /* storage blocked */ }
  };
  document.getElementById("logout").onclick = () => {
    try { sessionStorage.removeItem("farms-key"); } catch { /* storage blocked */ }
    location.hash = "";
    location.reload();
  };

  async function start(builtHint) {
    const [fj, src] = await Promise.all([load("farms.json"), load("sources.json")]);
    FARMS = fj.rows.map((r) => Object.fromEntries(fj.cols.map((c, i) => [c, r[i]])));
    BY_CODE = new Map(FARMS.map((f) => [f.code, f]));
    const b = new Date(src.built_at || builtHint);
    document.getElementById("tb-updated").textContent = isNaN(b) ? "" : `${b.getDate()} ${b.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { month: "short" })}، ${String(b.getHours()).padStart(2, "0")}:${String(b.getMinutes()).padStart(2, "0")}`;
    rail.hidden = false;
    mnav.hidden = false;
    tbEnd.hidden = false;
    window.addEventListener("hashchange", route);
    route();
  }

  // The derived key (not the password) is kept for the browser session so reloads don't ask again.
  async function unlock() {
    const meta = await fetch("data/key.json").then((r) => r.json());
    try {
      const saved = sessionStorage.getItem("farms-key");
      if (saved) {
        const k = await crypto.subtle.importKey("raw", b64(saved), "AES-GCM", true, ["decrypt"]);
        await decrypt(b64(meta.check), k);
        KEY = k;
        return start();
      }
    } catch { /* fall through to the password form */ }
    document.getElementById("tb-page").textContent = "تسجيل الدخول";
    app.innerHTML = `
      <form id="login" class="card login">
        <div class="tb-ico">${ico("lock")}</div>
        <h1>منصة بيانات المزارع</h1>
        <p>المحتوى محمي. أدخل كلمة المرور للدخول.</p>
        <input class="field" type="password" name="pw" autocomplete="current-password" placeholder="كلمة المرور" aria-label="كلمة المرور" style="width:100%;text-align:center" autofocus />
        <button class="btn btn-primary" style="width:100%;margin-top:12px">دخول</button>
        <p id="lerr" class="t-danger" style="min-height:1.5em;margin:10px 0 0"></p>
      </form>`;
    const form = document.getElementById("login");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const err = document.getElementById("lerr");
      const btn = form.querySelector("button");
      btn.disabled = true;
      err.textContent = "جارٍ التحقق…";
      try {
        const k = await deriveKey(form.pw.value, meta);
        await decrypt(b64(meta.check), k);
        KEY = k;
        try { sessionStorage.setItem("farms-key", ub64(new Uint8Array(await crypto.subtle.exportKey("raw", k)))); } catch { /* storage blocked */ }
        app.innerHTML = `<p class="muted">جارٍ تحميل البيانات…</p>`;
        await start();
      } catch {
        err.textContent = "كلمة المرور غير صحيحة";
        btn.disabled = false;
        form.pw.select();
      }
    };
  }
  unlock().catch((e) => (app.innerHTML = `<div class="card"><b>تعذّر التحميل</b><p class="muted">${esc(e.message)}</p></div>`));
})();
