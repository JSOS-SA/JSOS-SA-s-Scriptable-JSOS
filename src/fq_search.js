// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_search.js

const cfg = importModule("fq_config");

/**
 * يُرجع كود JavaScript محرك البحث والعرض للحقن في WebView.
 * @returns {string}
 */
function getSearchCode() {
  return getSearchCodePart1() +
    getSearchCodePart2() +
    getSearchCodePart3() +
    getSearchCodePart4() +
    getSearchCodePart5() +
    getSearchCodePart6() +
    getSearchCodePart7() +
    getSearchCodePart8() +
    getSearchCodePart9() +
    getSearchCodePart10() +
    getSearchCodePart11() +
    getSearchCodePart12() +
    getSearchCodePart13() +
    getSearchCodePart14() +
    getSearchCodePart15() +
    getSearchCodePart16() +
    getSearchCodePart17() +
    getSearchCodePart18() +
    getSearchCodePart19();
}

/** الجزء 1 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart1() {
  return `
// ═══ حالة العرض ═══
let activeFilter = "all";
let compactMode = false;
let groupMode = false;

// ═══ مراجع عناصر جديدة ═══
const filtersEl = document.getElementById("filters");
let vtbtn = document.getElementById("vtbtn");
let grpbtn = document.getElementById("grpbtn");
let tbcount = document.getElementById("tbcount");

// ═══ بحث فوري بتأخير ═══
let searchTimer = null;
si.addEventListener("input", function() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(doSearch, ${cfg.SEARCH_DEBOUNCE_MS});
});

// ═══ فلترة بالتفويج ═══
filtersEl.addEventListener("click", function(e) {
  const btn = e.target.closest(".fl-btn");
  if (!btn) return;
  activeFilter = btn.getAttribute("data-filter");
  const all = filtersEl.querySelectorAll(".fl-btn");
  for (let i = 0; i < all.length; i++) all[i].classList.remove("active");
  btn.classList.add("active");
  doSearch();
});

// ═══ تبديل العرض مضغوط/موسّع ═══
vtbtn.addEventListener("click", function() {
  compactMode = !compactMode;
  const ic = vtbtn.querySelector(".vt-ic");
  const lb = vtbtn.querySelector(".vt-lb");
  if (ic) ic.innerHTML = compactMode ? buildIcon("list", 16) : buildIcon("menu", 16);
  if (lb) lb.textContent = compactMode ? "موسّع" : "مضغوط";
  const cards = rl.querySelectorAll(".card");
  for (let i = 0; i < cards.length; i++) {
    if (compactMode) cards[i].classList.add("compact-view");
    else cards[i].classList.remove("compact-view");
  }
});
`;
}

/** الجزء 2 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart2() {
  return `
// ═══ تبديل التجميع حسب شركة الطيران ═══
grpbtn.addEventListener("click", function() {
  groupMode = !groupMode;
  grpbtn.style.background = groupMode ? "var(--ac)" : "var(--s1)";
  grpbtn.style.color = groupMode ? "#1a1a1a" : "var(--t2)";
  doSearch();
});

// ═══ تحديث الشريط العلوي ═══
function updateTopbar() {
  if (DATA.length === 0) { tbcount.textContent = ""; return; }
  const now = Date.now();
  let upcoming = 0;
  for (let i = 0; i < DATA.length; i++) {
    if (DATA[i].depTime.getTime() > now) upcoming++;
  }
  tbcount.textContent = upcoming + " رحلة";
}

// ═══ تحديث الملخص الإحصائي ═══
// نُقل المنطق إلى fq_sidebar.js → updateSidebarStats()
// الدالة تبقى فارغة لحماية fq_parser.js الذي يستدعيها بـ typeof === "function"
function updateStats() {
  // moved to sidebar — stats now rendered in #sbStats only
}

// ═══ حساب نسبة التقدم ═══
function calcProgress(diff) {
  if (diff <= 0) return { pct: 0, color: "rgba(0,0,0,0.06)" };
  const hrs = diff / 3600000;
  const pct = Math.min(100, (hrs / 12) * 100);
  let color;
  if (hrs < ${cfg.SOON_HOURS}) color = "#E50914";
  else if (hrs < ${cfg.WARN_HOURS}) color = "#ca8a04";
  else color = "#16a34a";
  return { pct: pct, color: color };
}

function _cardHead(d, i, departed) {
  const cmpCls = compactMode ? " compact-view" : "";
  return '<div class="card' +
    (departed ? " card-dep" : "") + cmpCls + '" data-fidx="' + i + '" data-dep="' + d.depTime.getTime() + '" data-fkey="' + fqEsc(fqDisplayKey(d)) + '">';
}
`;
}

/** الجزء 3 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart3() {
  return `
function _cardTop(d, flags) {
  return '<div class="bp-top">' +
    '<div class="bp-al">' + fqEsc(d.al) + '</div>' +
    '<div class="bp-dot"></div>' +
    '<div class="bp-line"></div>' +
    '<div class="bp-flt">' +
    '<span class="bp-flt-num">' + fqEsc(d.flt) + '</span>' +
    '<span class="bp-flt-date">' + fqEsc(d.date) +
    (flags.departed ? ' <span class="dep-badge">أقلعت</span>' : '') +
    (flags.consec ? ' <span class="dep-badge" style="background:rgba(245,197,24,0.15);color:#ca8a04">متتالية</span>' : '') +
    '</span></div>' +
    '<div class="bp-line"></div>' +
    '<div class="bp-dot"></div>' +
    '<div class="bp-dest">' + fqEsc(airportName(d.to)) + '</div>' +
    '</div>';
}

function _cardF(label, value) {
  return '<div class="f"><span class="k">' + label + '</span>' +
    '<span class="v">' + fqEsc(value) + '</span></div>';
}

// ═══ بناء بطاقة رحلة واحدة ═══
// ctx = { now, consecutive }: وقت العرض وخريطة الرحلات المتتالية.
function buildCardHtml(d, i, ctx) {
  const diff = d.depTime.getTime() - ctx.now;
  const departed = diff <= 0;
  const prog = calcProgress(diff);
  return _cardHead(d, i, departed) +
    _cardTop(d, { departed: departed, consec: !!(ctx.consecutive && ctx.consecutive[i]) }) +
    _cardF("STD", d.std) +
    '<div class="f cdf"><span class="k">المتبقي</span>' +
    '<span class="v cd" data-dep="' +
    d.depTime.getTime() + '"></span></div>' +
    _cardF("FLT Type", d.type) +
    _cardF("DPAX", d.dpax) +
    '<div class="pbar"><div class="pbar-fill" style="width:' +
    prog.pct + '%;background:' + prog.color + '"></div></div>' +
    '</div>';
}

// رمز المناولة
function _miniHandler(d) {
  return (typeof AIRLINES !== "undefined" && d.al && AIRLINES[d.al]) ? AIRLINES[d.al].handler : "—";
}
`;
}

/** الجزء 4 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart4() {
  return `
// ألوان التفويج
const _MINI_TF_COLORS = {
  early: "#16a34a",
  ontime: "#ca8a04",
  late: "#E50914",
  departed: "#64748b"
};

// حالة أعلنها المطار تحلّ محلّ التفويج: رحلة ملغاة لا تفويج لها، والمتأخرة
// وقتها في الموقع لم يتغيّر فتفويجها المحسوب منه مضلِّل. والتسمية من
// قاموس STATUS (fq_enum_status) لا نصّ مكرَّر.
function _miniStatus(d, departed) {
  const tf = departed ? { label: "أقلعت", cls: "departed" } : getTafweej(d.depTime);
  const siteStatus = (typeof SITE_STATUSES !== "undefined" && SITE_STATUSES.indexOf(d._status) !== -1) ? d._status : "";
  if (!siteStatus) return { tf: tf, color: _MINI_TF_COLORS[tf.cls] || "#64748b", siteStatus: siteStatus };
  return { tf: { label: STATUS[siteStatus], cls: siteStatus }, color: siteStatus === "canceled" ? "#E50914" : "#ea580c", siteStatus: siteStatus };
}

// الزمن المتبقي بصيغة س:دد:ثث
function _clockText(diff) {
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h + ":" + (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
}

function _miniMain(d, v) {
  const hCls = v.handler === "SGS" ? "sgs" : (v.handler === "SWISSPORT" ? "swissport" : "");
  return '<div class="mini-main">' +
    '<span class="mini-al">' + fqEsc(d.al) + '</span>' +
    '<span class="mini-flt">' + fqEsc(d.flt) + '</span>' +
    '<span class="mini-dest">' + fqEsc(airportName(d.to)) + '</span>' +
    '<span class="mini-std">' + fqEsc(d.std) + '</span>' +
    '<span class="mini-tf" style="color:' + v.color + '">' + v.tf.label + '</span>' +
    (hCls ? '<span class="mini-handler ' + hCls + '">' + fqEsc(v.handler) + '</span>' : '<span class="mini-handler">—</span>') +
    // المتبقي — آخر عمود مع ساعات ودقائق وثوانٍ
    '<span class="mini-rm cd" data-dep="' + d.depTime.getTime() + '">' + v.rmFull + '</span>' +
    '</div>';
}
`;
}

/** الجزء 5 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart5() {
  return `
// قسم التوسيع — مخفي
function _miniExpand(d) {
  return '<div class="mini-expand">' +
    '<div class="mini-det"><span>التاريخ</span><span>' + fqEsc(d.date) + '</span></div>' +
    '<div class="mini-det"><span>نوع الرحلة</span><span>' + (d.type || "—") + '</span></div>' +
    '<div class="mini-det"><span>الركاب</span><span>' + (d.dpax || "—") + '</span></div>' +
    '<div class="mini-det"><span>الوجهة</span><span>' + fqEsc(d.to) + ' — ' + fqEsc(airportName(d.to)) + '</span></div>' +
    '</div>';
}

// ═══ بناء صف مضغوط لعرض الكل ═══
function buildMiniRow(d, now) {
  const diff = d.depTime.getTime() - now;
  const departed = diff <= 0;
  const st = _miniStatus(d, departed);
  const v = { tf: st.tf, color: st.color, handler: _miniHandler(d), rmFull: departed ? "أقلعت" : _clockText(diff) };
  return '<div class="mini-row' + (departed ? " mini-dep" : "") + (st.siteStatus === "canceled" ? " mini-cancel" : "") + '" data-dep="' + d.depTime.getTime() + '" data-fkey="' + fqEsc(fqDisplayKey(d)) + '">' +
    _miniMain(d, v) + _miniExpand(d) + '</div>';
}

// استبعاد رحلات صالة 1 والصالة الشمالية وصالة 4 المضافة من كايا — تبقى فقط
// ضمن قوائمها الخاصة في تيوب كايا ولا تظهر في تيوب جداول إطلاقًا
function _notHall(d) {
  return d.terminal !== "t1" && d.terminal !== "north" && d.terminal !== "hall4";
}

// فلترة حسب التفويج
function _byTafweej(m) {
  const now2 = Date.now();
  return m.filter(function(d) {
    const diff = d.depTime.getTime() - now2;
    if (diff <= 0) return false;
    const tf = getTafweej(d.depTime);
    return tf.cls === activeFilter;
  });
}

// فلترة إخفاء المغادرة
function _futureOnly(m) {
  const now3 = Date.now();
  return m.filter(function(d) {
    return d.depTime.getTime() > now3;
  });
}
`;
}

/** الجزء 6 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart6() {
  return `
// ═══ إزالة التكرار — قبل التفرّع لا داخله ═══
// كانت داخل فرع «بلا نص بحث» وحده، فبمجرّد أن يكتب الموظف رقم رحلة
// يتوقّف الطيّ وتظهر الرحلة مرتين. وهو الذي أخفى عطل المزامنة أشهرًا:
// الشاشة بلا بحث مطويّة فتبدو سليمة، وعند البحث يظهر الخام.
// والمفتاح fqDisplayKey يشمل المصدر والتاريخ، فلا تُطوى رحلتان ليومين
// مختلفين ولا لصالتين مختلفتين في صف واحد. ولا يُستعمل al+flt+std
// (بلا تاريخ ولا مصدر) فهو يطوي رحلتين ليومين مختلفين في سطر.
function _dedupeDisplay(m) {
  const seen = {};
  const uniq = [];
  for (let du = 0; du < m.length; du++) {
    const dk = fqDisplayKey(m[du]);
    if (!seen[dk]) { seen[dk] = true; uniq.push(m[du]); }
  }
  return uniq;
}

// خط أنابيب العرض الواحد: يستعمله البحث وزر «نسخ النتائج» معًا، فلا ينسخ
// الزرّ رحلات لا تظهر على الشاشة (صالات كايا، والمغادرة المخفية، والتكرار).
function _visibleFlights(q) {
  let m = DATA.filter(_notHall);
  if (q) {
    m = m.filter(function(d) {
      return d.flt.indexOf(q) !== -1;
    });
  }
  if (activeFilter !== "all") m = _byTafweej(m);
  if (typeof _hideDeparted !== "undefined" && _hideDeparted && activeFilter === "all") m = _futureOnly(m);
  // ترتيب حسب الأقرب
  m.sort(function(a, b) {
    return a.depTime.getTime() - b.depTime.getTime();
  });
  return _dedupeDisplay(m);
}

function _searchNoData() {
  rs.classList.remove("on");
  cp.classList.remove("on");
}
`;
}

/** الجزء 7 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart7() {
  return `
function _searchEmpty() {
  rh.innerHTML = '<b>0</b> نتيجة';
  rl.innerHTML =
    '<div class="nodata"><span class="ic">' + buildIcon("info", 24) + '</span>' +
    'لا توجد نتائج</div>';
  cp.classList.remove("on");
}

function _searchHead(m) {
  rh.innerHTML = '<b>' + m.length + '</b> نتيجة';

  rl.style.opacity = "0";
  setTimeout(function() { rl.style.opacity = "1"; }, 50);
}

const _MINI_COLS = ["ناقل", "رحلة", "وجهة", "وقت", "تفويج", "مناولة", "متبقي"];

// رأس الأعمدة
function _miniHeader() {
  return '<div class="mini-header">' + _MINI_COLS.map(function(c) { return '<span>' + c + '</span>'; }).join("") + '</div>';
}

// عرض بدون نص بحث — قائمة مضغوطة
function _searchMini(m, now) {
  // الطيّ تمّ أعلاه لكل الحالات، فلا يُعاد هنا.
  let h = _miniHeader();
  for (let mi = 0; mi < m.length; mi++) {
    h += buildMiniRow(m[mi], now);
  }
  rl.innerHTML = h;
  cp.classList.add("on");
  updateCountdowns();
  bindMiniExpand();
}

// طي/فتح المجموعات
function _toggleGroup(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector(".grp-arrow");
  const closed = body.style.display === "none";
  body.style.display = closed ? "block" : "none";
  arrow.textContent = closed ? "▾" : "▸";
}
`;
}

/** الجزء 8 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart8() {
  return `
function _groupByAirline(m) {
  const groups = {};
  for (let g = 0; g < m.length; g++) {
    const airline = m[g].al;
    if (!groups[airline]) groups[airline] = [];
    groups[airline].push(m[g]);
  }
  return groups;
}

function _groupHtml(al, list, now) {
  let h = '<div class="grp-header" data-al="' + al + '">';
  h += '<span class="grp-name">' + al + '</span>';
  h += '<span class="grp-count">' + list.length + ' رحلة</span>';
  h += '<span class="grp-arrow">▾</span></div>';
  h += '<div class="grp-body">';
  for (let gi = 0; gi < list.length; gi++) {
    h += buildCardHtml(list[gi], gi, { now: now, consecutive: {} });
  }
  return h + '</div>';
}

function _groupsHtml(m, now) {
  const groups = _groupByAirline(m);
  let h = "";
  for (const al in groups) h += _groupHtml(al, groups[al], now);
  return h;
}

// التجميع حسب شركة الطيران
function _searchGrouped(m, now) {
  rl.innerHTML = _groupsHtml(m, now);
  const headers = rl.querySelectorAll(".grp-header");
  for (let gh = 0; gh < headers.length; gh++) {
    headers[gh].addEventListener("click", function() {
      _toggleGroup(this);
    });
  }
  cp.classList.add("on");
  updateCountdowns();
}
`;
}

/** الجزء 9 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart9() {
  return `
// كشف الرحلات المتتالية لنفس الوجهة
function _consecutiveMap(m) {
  const consecutive = {};
  for (let j = 0; j < m.length - 1; j++) {
    for (let k = j + 1; k < m.length; k++) {
      if (m[j].to === m[k].to && Math.abs(m[j].depTime.getTime() - m[k].depTime.getTime()) < 7200000) {
        consecutive[j] = true;
        consecutive[k] = true;
      }
    }
  }
  return consecutive;
}

// إشعار بحث عند استقرار النص
function _searchNotify(q, m) {
  if (!(q && m.length > 0 && typeof fbPushNotif === "function")) return;
  clearTimeout(window._fbSearchTimer);
  window._fbSearchTimer = setTimeout(function(){
    const first = m[0];
    const dn = typeof countryName === "function" ? countryName(first.to) : first.to;
    fbPushNotif({ type: "flight_search", title: "بحث عن رحلة",
      details: "بحث: " + q + " — " + m.length + " نتيجة",
      flightInfo: {flt: first.flt, dest: dn, std: first.std, date: first.date} });
  }, 3000);
}

function _searchCards(q, m, now) {
  const ctx = { now: now, consecutive: _consecutiveMap(m) };
  let h = "";
  for (let i = 0; i < m.length; i++) {
    h += buildCardHtml(m[i], i, ctx);
  }
  rl.innerHTML = h;
  cp.classList.add("on");
  updateCountdowns();
  _searchNotify(q, m);
}

function _searchRender(q, m, now) {
  if (!q) return _searchMini(m, now);
  if (groupMode && m.length > 0) return _searchGrouped(m, now);
  _searchCards(q, m, now);
}
`;
}

/** الجزء 10 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart10() {
  return `
// ═══ تنفيذ البحث ═══
function doSearch() {
  const q = si.value.trim();
  if (DATA.length === 0) return _searchNoData();
  const m = _visibleFlights(q);
  rs.classList.add("on");
  if (m.length === 0) return _searchEmpty();
  _searchHead(m);
  _searchRender(q, m, Date.now());
}

// ═══ تحديث العد التنازلي كل ثانية ═══
const _vibrated = {};

function _setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

function _setClass(el, cls) {
  if (el.className !== cls) el.className = cls;
}

// صفوف مضغوطة — صيغة HH:MM:SS
function _cdMini(el, diff) {
  if (diff <= 0) {
    _setText(el, "أقلعت");
    _setClass(el, "mini-rm cd gone");
    return;
  }
  _setText(el, _clockText(diff));
  const hrs = diff / 3600000;
  if (hrs < ${cfg.SOON_HOURS}) _setClass(el, "mini-rm cd soon");
  else if (hrs < ${cfg.WARN_HOURS}) _setClass(el, "mini-rm cd warn");
  else _setClass(el, "mini-rm cd");
}

// بطاقات عادية
function _cdNormal(el, diff) {
  const rm = fmtRemain(diff);
  _setText(el, rm.text);
  _setClass(el, "v cd " + rm.cls);
}
`;
}

/** الجزء 11 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart11() {
  return `
function _cdVibrate(depTs, diff) {
  if (diff > 0 && diff < 1800000 && !_vibrated[depTs]) {
    _vibrated[depTs] = true;
    if (navigator.vibrate) navigator.vibrate(200);
  }
}

function _cdTick(el, now) {
  const depTs = parseInt(el.getAttribute("data-dep"));
  if (!depTs) return;
  const diff = depTs - now;
  if (el.classList.contains("mini-rm")) _cdMini(el, diff);
  else _cdNormal(el, diff);
  _cdVibrate(depTs, diff);
}

function updateCountdowns() {
  const els = document.querySelectorAll(".cd");
  const now = Date.now();
  for (let i = 0; i < els.length; i++) _cdTick(els[i], now);
}

// ═══ إيماءة السحب على البطاقات ═══
let _swipeCard = null;
let _swipeStartX = 0;
let _swipeStartY = 0;
let _swipeLocked = false;
let _swipeDir = null;

document.addEventListener("touchstart", function(e) {
  const card = e.target.closest(".card");
  if (!card || card.classList.contains("card-dep")) return;
  _swipeCard = card;
  _swipeStartX = e.touches[0].clientX;
  _swipeStartY = e.touches[0].clientY;
  _swipeLocked = false;
  _swipeDir = null;
}, {passive: true});
`;
}

/** الجزء 12 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart12() {
  return `
// تحديد الاتجاه في أول 10px
function _swipeLock(dx, dy) {
  if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
    _swipeLocked = true;
    _swipeDir = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
  }
}

// ألوان الخلفية حسب الاتجاه
function _swipeColor(dx) {
  if (dx < -40) return "rgba(229,9,20,0.05)";
  return dx > 40 ? "rgba(70,211,105,0.15)" : "";
}

function _swipeMove(dx) {
  const clamp = Math.max(-120, Math.min(120, dx));
  _swipeCard.style.transform = "translateX(" + clamp + "px)";
  _swipeCard.style.background = _swipeColor(dx);
}

document.addEventListener("touchmove", function(e) {
  if (!_swipeCard) return;
  const dx = e.touches[0].clientX - _swipeStartX;
  if (!_swipeLocked) return _swipeLock(dx, e.touches[0].clientY - _swipeStartY);
  if (_swipeDir !== "h") return;
  e.preventDefault();
  _swipeMove(dx);
}, {passive: false});

// سحب يسار — حذف من TRACKED
function _swipeUntrack(dep) {
  if (!dep) return;
  for (let r = TRACKED.length - 1; r >= 0; r--) {
    if (TRACKED[r].depTime.getTime() === dep) {
      TRACKED.splice(r, 1);
      break;
    }
  }
  // ✅ إصلاح: التحقق من وجود الدالة قبل استدعائها
  if (typeof renderSidebar === "function") renderSidebar();
}
`;
}

/** الجزء 13 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart13() {
  return `
function _swipeLeft() {
  const cdEl = _swipeCard.querySelector(".cd");
  if (cdEl) _swipeUntrack(parseInt(cdEl.getAttribute("data-dep")));
  _swipeCard.style.transform = "translateX(-100%)";
  _swipeCard.style.opacity = "0";
  setTimeout(function() {
    if (_swipeCard) {
      _swipeCard.style.display = "none";
      _swipeCard = null;
    }
  }, 300);
}

function _swipeCopyText(card) {
  const fltEl = card.querySelector(".bp-flt-num");
  const destEl = card.querySelector(".bp-dest");
  const stdEl = card.querySelectorAll(".v")[0];
  let txt = "";
  if (fltEl) txt += fltEl.textContent;
  if (destEl) txt += " → " + destEl.textContent;
  if (stdEl) txt += " | " + stdEl.textContent;
  return txt;
}

// سحب يمين — نسخ بيانات الرحلة
function _swipeRight() {
  const txt = _swipeCopyText(_swipeCard);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt);
  }
  _swipeCard.style.transform = "";
  _swipeCard.style.background = "rgba(70,211,105,0.2)";
  setTimeout(function() {
    if (_swipeCard) {
      _swipeCard.style.background = "";
      _swipeCard = null;
    }
  }, 500);
}
`;
}

/** الجزء 14 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart14() {
  return `
// إرجاع البطاقة
function _swipeReset() {
  _swipeCard.style.transform = "";
  _swipeCard.style.background = "";
  _swipeCard = null;
}

document.addEventListener("touchend", function(e) {
  if (!_swipeCard || _swipeDir !== "h") {
    _swipeCard = null;
    return;
  }
  const dx = e.changedTouches[0].clientX - _swipeStartX;
  if (dx < -80) _swipeLeft();
  else if (dx > 80) _swipeRight();
  else _swipeReset();
}, {passive: true});

function _pbarDep(bar) {
  const card = bar.closest(".card");
  const cdEl = card && card.querySelector(".cd");
  return cdEl ? parseInt(cdEl.getAttribute("data-dep")) : 0;
}

function _pbarTick(bar, now) {
  const dep = _pbarDep(bar);
  if (!dep) return;
  const prog = calcProgress(dep - now);
  bar.style.width = prog.pct + "%";
  bar.style.background = prog.color;
}

// ═══ تحديث شريط التقدم كل 30 ثانية ═══
setInterval(function() {
  const bars = document.querySelectorAll(".pbar-fill");
  const now = Date.now();
  for (let i = 0; i < bars.length; i++) _pbarTick(bars[i], now);
}, 30000);
`;
}

/** الجزء 15 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart15() {
  return `
// ═══ نسخ النتائج — يطابق خط أنابيب العرض حرفيًا ═══
// كان النسخ يرشّح DATA الخام فينسخ رحلات لا تظهر على الشاشة:
// صالات كايا t1/north/hall4، والمغادرة المخفية، والتكرار — وبترتيب مختلف
function _copyText(m) {
  let t = "";
  for (let i = 0; i < m.length; i++) {
    const d = m[i];
    t += "[" + d.date + "] A/L: " + d.al +
      " | FLT: " + d.flt +
      " | TO: " + countryName(d.to) +
      " | STD: " + d.std +
      " | " + d.type +
      " | DPAX: " + d.dpax + "\\n";
  }
  return t;
}

// جواب الزرّ في موضع واحد لا موضعين. كانت كتلة «تم النسخ» مكتوبة مرتين
// — في فرع الحافظة وفي الفرع الاحتياطي — فأيّ تعديل على نصّ الزرّ أو مدّته
// كان يلزم في موضعين، ونسيان أحدهما يجعل الفرعين يتصرّفان تصرّفين.
function _copyFeedback(ok) {
  cb.textContent = ok ? "تم النسخ" : "تعذّر النسخ";
  cb.classList.toggle("ok", ok);
  setTimeout(function() {
    cb.textContent = "نسخ النتائج";
    cb.classList.remove("ok");
  }, 1200);
}
`;
}

/** الجزء 16 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart16() {
  return `
function _copyFallback(t) {
  const ta = document.createElement("textarea");
  ta.value = t;
  document.body.appendChild(ta);
  ta.select();
  const done = document.execCommand("copy");
  document.body.removeChild(ta);
  _copyFeedback(done !== false);
}

cb.addEventListener("click", function() {
  const t = _copyText(_visibleFlights(si.value.trim()));
  if (!(navigator.clipboard && navigator.clipboard.writeText)) return _copyFallback(t);
  // .catch إلزاميّ: writeText يُرفض عند منع الصلاحية أو خروج الصفحة من
  // التركيز، وبلا هذا الفرع كان الزرّ لا يتغيّر إطلاقًا — لا «تم النسخ»
  // ولا خطأ — فيُعيد الموظف الضغط ويلصق محتوى قديمًا وهو يظنّه الجديد.
  navigator.clipboard.writeText(t).then(function() {
    _copyFeedback(true);
  }).catch(function() {
    _copyFeedback(false);
  });
});

// ═══ توسيع/طي الصف المضغوط ═══
function bindMiniExpand() {
  const rows = rl.querySelectorAll(".mini-row");
  for (let ri = 0; ri < rows.length; ri++) {
    rows[ri].addEventListener("click", function() {
      const exp = this.querySelector(".mini-expand");
      if (!exp) return;
      const isOpen = exp.classList.contains("open");
      // طي كل المفتوحة
      const allExp = rl.querySelectorAll(".mini-expand.open");
      for (let ae = 0; ae < allExp.length; ae++) {
        allExp[ae].classList.remove("open");
        allExp[ae].parentElement.classList.remove("mini-open");
      }
      // فتح هذا فقط إذا كان مغلقًا
      if (!isOpen) {
        exp.classList.add("open");
        this.classList.add("mini-open");
      }
    });
  }
}
`;
}

/** الجزء 17 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart17() {
  return `
// ═══ سحب للأسفل لإظهار البحث ═══
let _pullStartY = 0;
let _pullActive = false;
document.addEventListener("touchstart", function(e) {
  if (window.scrollY === 0 && DATA.length > 0 && !sb.classList.contains("on")) {
    _pullStartY = e.touches[0].clientY;
    _pullActive = true;
  }
}, {passive: true});
document.addEventListener("touchmove", function(e) {
  if (!_pullActive) return;
  const dy = e.touches[0].clientY - _pullStartY;
  if (dy > 50 && window.scrollY === 0) {
    sb.classList.add("on");
    si.focus();
    _pullActive = false;
  }
}, {passive: true});
document.addEventListener("touchend", function() {
  _pullActive = false;
}, {passive: true});
`;
}

/** الجزء 18 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart18() {
  return `
// ═══ طي/فتح قائمة الملفات ═══
let flistToggle = document.getElementById("flistToggle");
let flistBody = document.getElementById("flistBody");
let flistLabel = document.getElementById("flistLabel");
if (flistToggle) {
  flistToggle.addEventListener("click", function() {
    const isOpen = flistBody.classList.contains("open");
    if (isOpen) {
      flistBody.classList.remove("open");
      flistToggle.classList.remove("open");
    } else {
      flistBody.classList.add("open");
      flistToggle.classList.add("open");
    }
  });
}
// تحديث زر الطي عند إضافة ملف
const _origObserver = new MutationObserver(function() {
  const flist = document.getElementById("flist");
  if (!flist || !flistToggle) return;
  const badges = flist.querySelectorAll(".fbadge");
  if (badges.length > 0) {
    flistToggle.classList.add("on");
    flistLabel.textContent = badges.length + " ملف مرفوع";
  } else {
    flistToggle.classList.remove("on");
    flistBody.classList.remove("open");
    flistToggle.classList.remove("open");
  }
});
const _flistEl = document.getElementById("flist");
if (_flistEl) {
  _origObserver.observe(_flistEl, { childList: true, subtree: true });
  const _initBadges = _flistEl.querySelectorAll(".fbadge");
  if (_initBadges.length > 0) {
    flistToggle.classList.add("on");
    flistLabel.textContent = _initBadges.length + " ملف مرفوع";
  }
}
`;
}

/** الجزء 19 من 19 من نصّ `getSearchCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSearchCodePart19() {
  return `
// ═══ زر إخفاء الرحلات المغادرة ═══
let hideDepBtn = document.getElementById("hideDepBtn");
// حالة إخفاء المغادرة يعرّفها معالج البيانات مرة واحدة.
if (hideDepBtn) {
  hideDepBtn.addEventListener("click", function(){
    _hideDeparted = !_hideDeparted;
    if (_hideDeparted) {
      hideDepBtn.classList.add("vt-active");
      hideDepBtn.querySelector(".vt-lb").textContent = "إظهار المغادرة";
      if (typeof showToast === "function")
        showToast("تم إخفاء الرحلات المغادرة", "info", 1500);
    } else {
      hideDepBtn.classList.remove("vt-active");
      hideDepBtn.querySelector(".vt-lb").textContent = "إخفاء المغادرة";
      if (typeof showToast === "function")
        showToast("تم إظهار كل الرحلات", "info", 1500);
    }
    if (typeof doSearch === "function") doSearch();
  });
}
`;
}

module.exports = Object.freeze({ getSearchCode });
