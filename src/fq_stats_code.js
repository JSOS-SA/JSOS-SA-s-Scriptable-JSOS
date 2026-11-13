// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: code;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_stats_code.js

/**
 * @module fq_stats_code
 * @description كود JavaScript المحقون في WebView للوحة الإحصائيات فقط.
 * يستخدم المتغيرات المحقونة: STATUS, VISA, TAFWEEJ, INSPECTION (من fq_enum_*).
 */

/**
 * يُرجع JavaScript لوحة الإحصائيات (تُحقن في WebView).
 * @returns {string}
 */
function getStatsCode() {
  return getStatsCodePart1() +
    getStatsCodePart2() +
    getStatsCodePart3() +
    getStatsCodePart4() +
    getStatsCodePart5() +
    getStatsCodePart6() +
    getStatsCodePart7() +
    getStatsCodePart8() +
    getStatsCodePart9() +
    getStatsCodePart10() +
    getStatsCodePart11() +
    getStatsCodePart12() +
    getStatsCodePart13() +
    getStatsCodePart14() +
    getStatsCodePart15();
}

/** الجزء 1 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart1() {
  return `
// ═══ متغيرات الحالة المحلية للوحة ═══
let _stPeriod = "shift";
let _stPollTimer = null;

// ═══ مفتاح الوردية الحالية ═══
function _stGetShiftInfo() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const tm = h * 60 + m;
  let shift;
  if (tm >= (5*60+42) && tm < (13*60+42)) shift = "A";
  else if (tm >= (13*60+42) && tm < (21*60+42)) shift = "B";
  else shift = "C";
  const y = now.getFullYear();
  const mo = ("0" + (now.getMonth()+1)).slice(-2);
  const d = ("0" + now.getDate()).slice(-2);
  return { key: y+"-"+mo+"-"+d+"_"+shift, shift: shift, date: y+"-"+mo+"-"+d };
}

// ═══ تاريخ بصيغة yyyy-mm-dd ═══
function _stYmd(dt) {
  const y = dt.getFullYear();
  const mo = ("0" + (dt.getMonth()+1)).slice(-2);
  const d = ("0" + dt.getDate()).slice(-2);
  return y+"-"+mo+"-"+d;
}

// ═══ نطاق التواريخ حسب الفترة ═══
function _stGetDateRange(period) {
  const now = new Date();
  const today = _stYmd(now);
  if (period === "week") return { from: _stYmd(new Date(now.getTime() - 6*86400000)), to: today };
  if (period === "month") return { from: _stYmd(new Date(now.getTime() - 29*86400000)), to: today };
  return { from: today, to: today };
}
`;
}

/** الجزء 2 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart2() {
  return `
// ═══ تحويل خريطة فايربيس إلى مصفوفة تسجيلات ═══
function _stFbMapToRecords(fbMap) {
  if (!fbMap || typeof fbMap !== "object") return [];
  const arr = [];
  for (const k in fbMap) {
    if (Object.prototype.hasOwnProperty.call(fbMap, k) && fbMap[k] && typeof fbMap[k] === "object") {
      const rec = fbMap[k];
      rec._key = k;
      arr.push(rec);
    }
  }
  return arr;
}

// ═══ قراءة وردية واحدة من فايربيس ═══
async function _stFetchShift(shiftKey) {
  if (typeof FB_URL === "undefined" || !FB_URL) return [];
  try {
    const resp = await fbFetchTimeout(FB_URL + "/reg_data/" + shiftKey + ".json", null, 12000);
    if (!resp.ok) return [];
    const data = await resp.json();
    return _stFbMapToRecords(data);
  } catch(e) {
    console.error("stats#fetchShift", e);
    return [];
  }
}
`;
}

/** الجزء 3 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart3() {
  return `
// ═══ هل تاريخ الوردية داخل النطاق؟ ═══
function _stInRange(shiftKey, fromDate, toDate) {
  const datePart = shiftKey.split("_")[0];
  if (fromDate && datePart < fromDate) return false;
  if (toDate && datePart > toDate) return false;
  return true;
}

// ═══ تسجيلات وردية واحدة موسومة بمفتاحها ═══
function _stTagShift(all, shiftKey) {
  const recs = _stFbMapToRecords(all[shiftKey]);
  for (let i = 0; i < recs.length; i++) recs[i]._shiftKey = shiftKey;
  return recs;
}

// ═══ تسجيلات الورديات الواقعة في النطاق ═══
function _stCollectRange(all, fromDate, toDate) {
  let arr = [];
  for (const shiftKey in all) {
    if (!Object.prototype.hasOwnProperty.call(all, shiftKey)) continue;
    if (!_stInRange(shiftKey, fromDate, toDate)) continue;
    arr = arr.concat(_stTagShift(all, shiftKey));
  }
  return arr;
}

// ═══ قراءة نطاق تاريخي من فايربيس ═══
async function _stFetchRange(fromDate, toDate) {
  if (typeof FB_URL === "undefined" || !FB_URL) return [];
  try {
    const resp = await fbFetchTimeout(FB_URL + "/reg_data.json", null, 15000);
    if (!resp.ok) return [];
    const all = await resp.json();
    if (!all || typeof all !== "object") return [];
    return _stCollectRange(all, fromDate, toDate);
  } catch(e) {
    console.error("stats#fetchRange", e);
    return [];
  }
}

`;
}

/** الجزء 4 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart4() {
  return `
// ═══ تحميل تسجيلات حسب الفترة ═══
async function _stLoadRecords(period) {
  const info = _stGetShiftInfo();
  if (period === "shift") return await _stFetchShift(info.key);
  const range = _stGetDateRange(period);
  return await _stFetchRange(range.from, range.to);
}

// ═══ صف توزيع واحد ═══
function _stDistRow(label, count, bar) {
  const pct = bar.max > 0 ? Math.round((count / bar.max) * 100) : 0;
  return '<div class="st-dist-row">' +
    '<span class="st-dist-label">' + label + '</span>' +
    '<div class="st-dist-bar"><div class="st-dist-bar-fill ' + bar.cls + '" style="width:' + pct + '%"></div></div>' +
    '<span class="st-dist-value">' + count + '</span>' +
    '</div>';
}
`;
}

/** الجزء 5 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart5() {
  return `
// ═══ رسم توزيع التفويج (يقرأ مفاتيح TAFWEEJ المحقون) ═══
function _stRenderTafweej(stats) {
  const t = stats.tafweej || {};
  const max = stats.totalBus || 1;
  const keys = Object.keys(TAFWEEJ);
  let html = "";
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    html += _stDistRow(TAFWEEJ[k], t[k] || 0, { max: max, cls: "st-bar-tafweej" });
  }
  document.getElementById("stTafweejList").innerHTML = html;
}

// ═══ رسم توزيع الحالة (يقرأ STATUS المحقون) ═══
function _stRenderStatus(stats) {
  const s = stats.status || {};
  const max = stats.totalBus || 1;
  const keys = Object.keys(STATUS);
  let html = "";
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    html += _stDistRow(STATUS[k], s[k] || 0, { max: max, cls: "st-bar-status" });
  }
  document.getElementById("stStatusList").innerHTML = html;
}

// ═══ رسم توزيع الكشف (يقرأ INSPECTION المحقون) ═══
function _stRenderInsp(stats) {
  const ins = stats.inspection || {};
  const max = stats.totalBus || 1;
  const keys = Object.keys(INSPECTION);
  let html = "";
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    html += _stDistRow(INSPECTION[k], ins[k] || 0, { max: max, cls: "st-bar-kashf" });
  }
  document.getElementById("stInspList").innerHTML = html;
}
`;
}

/** الجزء 6 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart6() {
  return `
// ═══ بطاقة فرعية واحدة ═══
function _stSubItem(label, value) {
  return '<div class="st-sub-item"><div class="st-sub-label">' + label + '</div><div class="st-sub-value">' + (value || 0) + '</div></div>';
}

// ═══ بطاقات التأشيرة من خريطة أعداد (يقرأ VISA المحقون) ═══
function _stVisaCards(counts) {
  const visaKeys = Object.keys(VISA);
  let html = "";
  for (let i = 0; i < visaKeys.length; i++) html += _stSubItem(VISA[visaKeys[i]], counts[visaKeys[i]]);
  return html;
}

// ═══ رسم بطاقات التأشيرة ═══
function _stRenderVisa(stats) {
  document.getElementById("stOvBus").textContent = stats.totalBus || 0;
  document.getElementById("stOvPax").textContent = stats.totalPax || 0;
  document.getElementById("stBusTotal").textContent = stats.totalBus || 0;
  document.getElementById("stPaxTotal").textContent = stats.totalPax || 0;
  document.getElementById("stBusByVisa").innerHTML = _stVisaCards(stats.busByVisa || {});
  document.getElementById("stPaxByVisa").innerHTML = _stVisaCards(stats.paxByVisa || {});
}
`;
}

/** الجزء 7 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart7() {
  return `
// ═══ صف تفصيل واحد (فارغ إن لا حافلات ولا ركاب) ═══
function _stFltDetailRow(f, k) {
  const b = f.tafweejBus[k] || 0;
  const p = f.tafweejPax[k] || 0;
  if (b === 0 && p === 0) return "";
  return '<div class="st-flt-detail-row">' +
    '<span class="st-flt-d-label">' + TAFWEEJ[k] + '</span>' +
    '<span class="st-flt-d-bus">' + b + '</span>' +
    '<span class="st-flt-d-pax">' + p + '</span></div>';
}

// ═══ جدول تفصيل الرحلة: الرأس والصفوف والإجمالي ═══
function _stFltDetailRows(f) {
  const keys = Object.keys(TAFWEEJ);
  let rows = '<div class="st-flt-detail-head">' +
    '<span class="st-flt-dh-label">الحالة</span>' +
    '<span class="st-flt-dh-bus">حافلات</span>' +
    '<span class="st-flt-dh-pax">ركاب</span></div>';
  for (let i = 0; i < keys.length; i++) rows += _stFltDetailRow(f, keys[i]);
  return rows + '<div class="st-flt-detail-row st-flt-total">' +
    '<span class="st-flt-d-label">الإجمالي</span>' +
    '<span class="st-flt-d-bus">' + f.totalBus + '</span>' +
    '<span class="st-flt-d-pax">' + f.totalPax + '</span></div>';
}

// ═══ بناء صف رحلة واحدة ═══
function _stBuildFltItem(f) {
  const rows = _stFltDetailRows(f);
  const dest = f.dest ? f.dest : "—";
  return '<div class="st-flt-item" data-flt="' + f.flt + '">' +
    '<div class="st-flt-head">' +
      '<span class="st-flt-num">' + f.flt + '</span>' +
      '<span class="st-flt-name">' + dest + '</span>' +
      '<span class="st-flt-bus-count">' + f.totalBus + ' 🚌</span>' +
      '<span class="st-flt-toggle">▼</span>' +
    '</div>' +
    '<div class="st-flt-body">' + rows + '</div>' +
  '</div>';
}
`;
}

/** الجزء 8 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart8() {
  return `
// ═══ رسم قائمة الرحلات ═══
function _stRenderFlights(stats) {
  const flts = stats.byFlight || [];
  const box = document.getElementById("stFltList");
  if (flts.length === 0) {
    box.innerHTML = '<div class="st-empty">لا توجد رحلات مسجّلة في هذه الفترة</div>';
    return;
  }
  let html = "";
  for (let i = 0; i < flts.length; i++) html += _stBuildFltItem(flts[i]);
  box.innerHTML = html;
}

// ═══ صف موظف واحد ═══
function _stEmpRow(e) {
  const idTxt = e.empId ? e.empId : "—";
  return '<div class="st-emp-row">' +
    '<div class="st-emp-info">' +
      '<span class="st-emp-name">' + e.name + '</span>' +
      '<span class="st-emp-id">' + idTxt + '</span>' +
    '</div>' +
    '<div class="st-emp-stats">' +
      '<span class="st-emp-stat">حافلات: <strong>' + e.buses + '</strong></span>' +
      '<span class="st-emp-stat">ركاب: <strong>' + e.pax + '</strong></span>' +
    '</div>' +
  '</div>';
}

// ═══ رسم أداء الموظفين ═══
function _stRenderEmployees(stats) {
  const emps = stats.byEmployee || [];
  const box = document.getElementById("stEmpList");
  if (emps.length === 0) {
    box.innerHTML = '<div class="st-empty">لا توجد بيانات موظفين</div>';
    return;
  }
  let html = "";
  for (let i = 0; i < emps.length; i++) html += _stEmpRow(emps[i]);
  box.innerHTML = html;
}
`;
}

/** الجزء 9 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart9() {
  return `
// ═══ رسم التقرير ═══
function _stRenderReport(stats) {
  const info = _stGetShiftInfo();
  const txt = buildShiftReport(stats, info.shift, new Date());
  document.getElementById("stReportPre").textContent = txt;
}

// ═══ التحديث الكامل ═══
function _stRenderAll(stats) {
  _stRenderVisa(stats);
  _stRenderTafweej(stats);
  _stRenderStatus(stats);
  _stRenderInsp(stats);
  _stRenderFlights(stats);
  _stRenderEmployees(stats);
  _stRenderReport(stats);
  const now = new Date();
  document.getElementById("stLastUpdate").textContent =
    "آخر تحديث: " + now.toLocaleTimeString("ar-SA");
}

// ═══ دورة التحميل والرسم ═══
async function _stReload() {
  try {
    const records = await _stLoadRecords(_stPeriod);
    const stats = aggregateStats(records);
    _stRenderAll(stats);
  } catch(e) {
    console.error("stats#reload", e);
  }
}

// ═══ هل لوحة الإحصائيات ظاهرة؟ ═══
function _stIsPanelVisible() {
  const p = document.getElementById("statsPanel");
  return !!p && p.style.display !== "none";
}
`;
}

/** الجزء 10 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart10() {
  return `
// ═══ بدء/إيقاف polling ═══
function _stStartPolling() {
  _stStopPolling();
  _stPollTimer = setInterval(function() {
    if (!_stIsPanelVisible()) { _stStopPolling(); return; }
    _stReload();
  }, 10000);
}
function _stStopPolling() {
  if (_stPollTimer) {
    clearInterval(_stPollTimer);
    _stPollTimer = null;
  }
}

// ═══ حقل نصّ مخفي محدَّد للنسخ ═══
function _stMakeCopyArea(txt) {
  const ta = document.createElement("textarea");
  ta.value = txt;
  ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  return ta;
}

// ═══ fallback نسخ بـ execCommand إذا فشل navigator.clipboard ═══
function _stFallbackCopy(txt) {
  try {
    const ta = _stMakeCopyArea(txt);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch(e) {
    console.error("stats#fallback", e);
    return false;
  }
}
`;
}

/** الجزء 11 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart11() {
  return `
// ═══ نصّ التقرير المعروض ═══
function _stReportTextOf(preEl) {
  return preEl ? preEl.textContent : "";
}

// ═══ هل التقرير لم يُحمَّل بعد؟ ═══
function _stReportEmpty(preEl) {
  const txt = _stReportTextOf(preEl);
  return !txt || txt === "—";
}

// ═══ إشعار إن وُجدت showToast ═══
function _stNotify(msg, kind) {
  if (typeof showToast === "function") showToast(msg, kind);
}

`;
}

/** الجزء 12 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart12() {
  return `
// ═══ كتابة النص في الحافظة؛ true إن نجحت ═══
async function _stClipboardWrite(txt) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(txt);
      return true;
    }
  } catch(e) { console.error("stats#copy", e); }
  return false;
}

// ═══ ختام النسخ: بديل execCommand ثم حفظ احتياطي ثم إشعار ═══
function _stCopyDone(txt, copied) {
  if (!copied) copied = _stFallbackCopy(txt);
  // حفظ في window احتياطاً (يقرأه fq_main عند الإغلاق)
  window._FQ_CLIPBOARD_TEXT = txt;
  window._FQ_CLIPBOARD_READY = true;
  _stNotify(copied ? "تم نسخ التقرير" : "تم تجهيز التقرير للنسخ", copied ? "success" : "info");
}

// ═══ نسخ التقرير ═══
async function _stCopyReport() {
  const preEl = document.getElementById("stReportPre");
  // إذا التقرير لم يُحمَّل بعد — نُحمّله أولاً
  if (_stReportEmpty(preEl)) {
    _stNotify("جارٍ تحميل التقرير...", "loading");
    await _stReload();
    if (_stReportEmpty(preEl)) { _stNotify("لا يوجد تقرير للنسخ", "error"); return; }
  }
  const txt = _stReportTextOf(preEl);
  const copied = await _stClipboardWrite(txt);
  _stCopyDone(txt, copied);
}
`;
}

/** الجزء 13 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart13() {
  return `
// ═══ ربط تيوب الإحصائيات: يفتح اللوحة ويحمّل ويبدأ الاستطلاع ═══
function _stBindTab(statsTab, statsPanel) {
  statsTab.addEventListener("click", async function() {
    if (typeof hideAllPanels === "function") hideAllPanels();
    statsTab.classList.add("tab-active");
    statsPanel.style.display = "block";
    const info = _stGetShiftInfo();
    const badge = document.getElementById("stShiftBadge");
    if (badge) badge.textContent = info.shift;
    await _stReload();
    _stStartPolling();
  });
}

// ═══ ربط أزرار الفترة ═══
function _stBindPeriod() {
  const pdBtns = document.querySelectorAll(".st-pd-btn");
  for (let i = 0; i < pdBtns.length; i++) {
    pdBtns[i].addEventListener("click", async function() {
      const btns = document.querySelectorAll(".st-pd-btn");
      for (let j = 0; j < btns.length; j++) btns[j].classList.remove("st-pd-active");
      this.classList.add("st-pd-active");
      _stPeriod = this.getAttribute("data-st-period");
      await _stReload();
    });
  }
}

// ═══ ربط زرَّي النسخ والتحديث ═══
function _stBindButtons() {
  const copyBtn = document.getElementById("stCopyBtn");
  if (copyBtn) copyBtn.addEventListener("click", _stCopyReport);

  const refBtn = document.getElementById("stRefreshBtn");
  if (refBtn) refBtn.addEventListener("click", async function() {
    _stNotify("جارٍ التحديث...", "loading");
    await _stReload();
    if (typeof showToast === "function") showToast("تم التحديث", "success", 1200);
  });
}

`;
}

/** الجزء 14 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart14() {
  return `
// ═══ ربط طيّ تفصيل الرحلة وفتحه ═══
function _stBindFltToggle() {
  document.addEventListener("click", function(e) {
    const head = e.target.closest(".st-flt-head");
    if (!head) return;
    const item = head.parentElement;
    if (item) item.classList.toggle("st-open");
  });
}

// ═══ ربط بحث الرحلات ═══
function _stBindFltSearch() {
  const fltSearch = document.getElementById("stFltSearch");
  if (!fltSearch) return;
  fltSearch.addEventListener("input", function() {
    const q = this.value.trim().toUpperCase();
    const items = document.querySelectorAll(".st-flt-item");
    for (let i = 0; i < items.length; i++) {
      const fltVal = items[i].getAttribute("data-flt") || "";
      items[i].style.display = (q === "" || fltVal.indexOf(q) !== -1) ? "" : "none";
    }
  });
}

`;
}

/** الجزء 15 من 15 من نصّ `getStatsCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsCodePart15() {
  return `
// ═══ إيقاف polling عند الانتقال لتيوب آخر ═══
function _stBindStopOnTabs() {
  const allTabIds = ["sbt","pdfTab","liveTab","alTab","guideTab","dbTab","notifTab","profileTab","regTab"];
  for (let ti = 0; ti < allTabIds.length; ti++) {
    const tEl = document.getElementById(allTabIds[ti]);
    if (tEl) tEl.addEventListener("click", function() { _stStopPolling(); });
  }
}

// ═══ ربط الأحداث ═══
function _stBindEvents() {
  const statsTab = document.getElementById("statsTab");
  const statsPanel = document.getElementById("statsPanel");
  if (!statsTab || !statsPanel) return;
  _stBindTab(statsTab, statsPanel);
  _stBindPeriod();
  _stBindButtons();
  _stBindFltToggle();
  _stBindFltSearch();
  _stBindStopOnTabs();
}

_stBindEvents();
`;
}

module.exports = Object.freeze({ getStatsCode });
