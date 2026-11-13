// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: chart-bar;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_stats_aggregator.js

/**
 * @module fq_stats_aggregator
 * @description وحدة الحساب النقي للإحصائيات.
 * تُحقن داخل WebView كنص JS. كل دوالها نقية (Pure Functions):
 * تستقبل مصفوفة تسجيلات وتُرجع كائن إحصائيات بدون أي تأثير جانبي.
 *
 * تعتمد على المتغيرات المحقونة قبلها في WebView:
 * STATUS, VISA, TAFWEEJ, INSPECTION (من ملفات fq_enum_*).
 * لا تعيد تعريف هذه القوائم — مصدر واحد للحقيقة.
 */

/**
 * يُرجع كود JavaScript لدوال الحساب النقية، يُحقن في WebView.
 * @returns {string}
 */
function getAggregatorCode() {
  return getAggregatorCodePart1() +
    getAggregatorCodePart2() +
    getAggregatorCodePart3() +
    getAggregatorCodePart4();
}

/** الجزء 1 من 4 من نصّ `getAggregatorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAggregatorCodePart1() {
  return `
// ═══ بناء كائن صفر للتوزيعات ═══
function _statsZeroByKeys(keys) {
  const o = {};
  for (let i = 0; i < keys.length; i++) o[keys[i]] = 0;
  return o;
}

// ═══ تحويل عدد الركاب لرقم آمن ═══
function _statsToInt(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

// ═══ حساب توزيع حقل واحد بعدّ التسجيلات ═══
function _statsCountBy(records, field, validKeys) {
  const dist = _statsZeroByKeys(validKeys);
  for (let i = 0; i < records.length; i++) {
    const v = records[i][field];
    if (v && Object.prototype.hasOwnProperty.call(dist, v)) dist[v]++;
  }
  return dist;
}

// ═══ توزيع التأشيرة بحساب الحافلات والركاب ═══
function _statsByVisa(records) {
  const visaKeys = Object.keys(VISA);
  const bus = _statsZeroByKeys(visaKeys);
  const pax = _statsZeroByKeys(visaKeys);
  for (let i = 0; i < records.length; i++) _statsVisaAdd(bus, pax, records[i]);
  return { bus: bus, pax: pax };
}

// يعدّ تسجيلًا واحدًا: حافلة وركّابه، إن كانت تأشيرته من المعروفة.
function _statsVisaAdd(bus, pax, r) {
  const v = r.visa;
  const p = _statsToInt(r.pax);
  if (v && Object.prototype.hasOwnProperty.call(bus, v)) {
    bus[v]++;
    pax[v] += p;
  }
}
`;
}

/** الجزء 2 من 4 من نصّ `getAggregatorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAggregatorCodePart2() {
  return `
// ═══ أداء الموظفين ═══
function _statsByEmployee(records) {
  const emp = {};
  for (let i = 0; i < records.length; i++) _statsEmpAdd(emp, records[i]);
  return _statsRankBy(emp, "buses");
}

// يعدّ تسجيلًا واحدًا على موظفه (الاسم ورقمه معًا مفتاحٌ).
function _statsEmpAdd(emp, r) {
  const name = r.recordedBy || "غير معروف";
  const id = r.recordedByEmpId || "";
  const p = _statsToInt(r.pax);
  const k = name + "||" + id;
  if (!emp[k]) emp[k] = { name: name, empId: id, buses: 0, pax: 0 };
  emp[k].buses++;
  emp[k].pax += p;
}

// قيم الجدول مرتّبة تنازليًّا بحقلٍ عدديّ.
function _statsRankBy(map, field) {
  const arr = [];
  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) arr.push(map[key]);
  }
  arr.sort(function(a, b) { return b[field] - a[field]; });
  return arr;
}
`;
}

/** الجزء 3 من 4 من نصّ `getAggregatorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAggregatorCodePart3() {
  return `
// ═══ إحصائيات لكل رحلة (FLT) ═══
function _statsByFlight(records) {
  const tafweejKeys = Object.keys(TAFWEEJ);
  const flts = {};
  for (let i = 0; i < records.length; i++) _statsFlightAdd(flts, records[i], tafweejKeys);
  return _statsRankBy(flts, "totalBus");
}

// يعدّ تسجيلًا واحدًا على رحلته (رمزها بحروف كبيرة)، وينشئ سطرها عند أول تسجيل. بلا رمز: يُتجاوز.
function _statsFlightAdd(flts, r, tafweejKeys) {
  const flt = (r.flt || "").toString().trim().toUpperCase();
  if (!flt) return;
  if (!flts[flt]) {
    flts[flt] = {
      flt: flt,
      dest: r.dest || "",
      totalBus: 0,
      totalPax: 0,
      tafweejBus: _statsZeroByKeys(tafweejKeys),
      tafweejPax: _statsZeroByKeys(tafweejKeys)
    };
  }
  _statsFlightCount(flts[flt], r);
}

function _statsFlightCount(row, r) {
  const p = _statsToInt(r.pax);
  const t = r.tafweej || "";
  row.totalBus++;
  row.totalPax += p;
  if (t && Object.prototype.hasOwnProperty.call(row.tafweejBus, t)) {
    row.tafweejBus[t]++;
    row.tafweejPax[t] += p;
  }
  if (!row.dest && r.dest) row.dest = r.dest;
}
`;
}

/** الجزء 4 من 4 من نصّ `getAggregatorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAggregatorCodePart4() {
  return `
// ═══ حساب إجمالي الركاب ═══
function _statsTotalPax(records) {
  let total = 0;
  for (let i = 0; i < records.length; i++) {
    total += _statsToInt(records[i].pax);
  }
  return total;
}

/**
 * الدالة الرئيسة — تجمّع كل الإحصائيات من مصفوفة تسجيلات.
 * نقية: لا تعدّل المدخلات ولا تستخدم متغيرات خارجية متغيرة.
 */
function aggregateStats(records) {
  if (!Array.isArray(records)) records = [];
  const byVisa = _statsByVisa(records);
  const statusKeys = Object.keys(STATUS);
  const tafweejKeys = Object.keys(TAFWEEJ);
  const inspectionKeys = Object.keys(INSPECTION);
  return {
    totalBus: records.length,
    totalPax: _statsTotalPax(records),
    busByVisa: byVisa.bus,
    paxByVisa: byVisa.pax,
    tafweej: _statsCountBy(records, "tafweej", tafweejKeys),
    status: _statsCountBy(records, "status", statusKeys),
    inspection: _statsCountBy(records, "inspection", inspectionKeys),
    byEmployee: _statsByEmployee(records),
    byFlight: _statsByFlight(records)
  };
}
`;
}

class AppCoordinator {
  static async boot() {
    // وحدة كود WebView — لا تنفيذ في Scriptable
  }
}

try {
  // boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
  // لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
  // و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
  // ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
  AppCoordinator.boot().catch((bootError) => console.error(bootError));
} catch (e) {
  console.error(e);
}

module.exports = Object.freeze({ getAggregatorCode });
