// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: file-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_stats_report.js

/**
 * @module fq_stats_report
 * @description وحدة توليد نص تقرير نهاية الوردية.
 * تُحقن داخل WebView كنص JS. تستخدم المتغير المحقون TAFWEEJ
 * لقراءة المفاتيح المعتمدة دون إعادة تعريفها.
 *
 * القالب الإنجليزي ثابت ومعتمد. أي تغيير في المفاتيح يجب أن يتم
 * في fq_enum_tafweej.js فقط — هذا الملف يقرأ ولا يعرّف.
 */

/**
 * يُرجع كود JavaScript لتوليد التقرير، يُحقن في WebView.
 * @returns {string}
 */
function getReportCode() {
  return getReportCodePart1() +
    getReportCodePart2();
}

/** الجزء 1 من 2 من نصّ `getReportCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getReportCodePart1() {
  return `
// ═══ تنسيق التاريخ DD/MM/YYYY ═══
function _reportFmtDate(d) {
  if (!d) d = new Date();
  const dd = ("0" + d.getDate()).slice(-2);
  const mm = ("0" + (d.getMonth() + 1)).slice(-2);
  const yy = d.getFullYear();
  return dd + "/" + mm + "/" + yy;
}

// ═══ بناء سطر بند رقمي ═══
function _reportLine(label, value) {
  return "\\t•\\t" + label + " = " + value;
}

// ═══ خريطة قيم التفويج إلى أسماء التقرير الإنجليزية ═══
// المفاتيح هي مفاتيح TAFWEEJ من fq_enum_tafweej (مصدر الحقيقة)
// القيم هي الأسماء المعتمدة في تقرير HT Check Point
const REPORT_TAFWEEJ_LABELS = {
  ontime: "Minutes",
  early: "Early",
  late: "Late",
  wrong_t1: "Wrong T1",
  wrong_north: "Wrong North",
  wrong_hall4: "خاطئ صالة 4",
  wrong: "Wrong",
  shared: "Mix",
  stumbler: "Stumbler"
};
`;
}

/** الجزء 2 من 2 من نصّ `getReportCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getReportCodePart2() {
  return `
/**
 * يبني نص تقرير نهاية الوردية بالقالب المعتمد.
 * يستخدم مفاتيح TAFWEEJ المحقونة من fq_enum_tafweej لضمان التزامن.
 *
 * @param {object} stats - كائن الإحصائيات من aggregateStats
 * @param {string} shiftCode - رمز الوردية (A | B | C)
 * @param {Date} [date] - التاريخ، افتراضياً اليوم
 * @returns {string} نص التقرير الجاهز للنسخ
 */
function buildShiftReport(stats, shiftCode, date) {
  const s = stats || {};
  const head = [_reportFmtDate(date), "HT Check Point – Shift ( " + (shiftCode || "—") + " )"];
  const lines = head.concat(_reportBusLines(s), _reportPaxLines(s), _reportTafweejLines(s.tafweej || {}));
  return lines.join(String.fromCharCode(10));
}

// القسم 1: الحافلات المغادرة، إجماليًّا ثم بحسب نوع التأشيرة.
function _reportBusLines(s) {
  const bv = s.busByVisa || {};
  return ["1\\uFE0F\\u20E3 Departure Buses:",
    _reportLine("Dep. Buses", s.totalBus || 0),
    _reportLine("Umrah Buses", bv.umrah || 0),
    _reportLine("Tourist Buses", bv.tourism || 0)];
}

// القسم 2: الركّاب المغادرون، إجماليًّا ثم بحسب نوع التأشيرة.
function _reportPaxLines(s) {
  const pv = s.paxByVisa || {};
  return ["2\\uFE0F\\u20E3 Departure PAX (Approx.):",
    _reportLine("Dep. PAX", s.totalPax || 0),
    _reportLine("Umrah PAX", pv.umrah || 0),
    _reportLine("Tourist PAX", pv.tourism || 0)];
}

// القسم 3: حالة الصعود، سطر لكل حالة تفويج.
function _reportTafweejLines(tw) {
  const out = ["3\\uFE0F\\u20E3 Bus Boarding Situation:"];
  // المرور بترتيب TAFWEEJ المحقون من fq_enum_tafweej
  const tafweejKeys = Object.keys(TAFWEEJ);
  for (let i = 0; i < tafweejKeys.length; i++) {
    const k = tafweejKeys[i];
    const lbl = REPORT_TAFWEEJ_LABELS[k] || k;
    out.push(_reportLine(lbl, tw[k] || 0));
  }
  return out;
}
`;
}

class AppCoordinator {
  static async boot() {
    // وحدة كود WebView
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

module.exports = Object.freeze({ getReportCode });
