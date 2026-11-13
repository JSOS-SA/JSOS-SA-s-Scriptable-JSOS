// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: list-ul;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_enum_status.js

/**
 * @module fq_enum_status
 * @description قاموس قيم حالة الرحلة المعتمدة في النظام.
 * بيانات ثابتة (Static Lookup Table) — مصدر الحقيقة الوحيد لتسميات الحالة.
 * يُحقن الكائن الخام في WebView كمتغير STATUS، وتُستخدم الدوال داخل Scriptable.
 */

// ════════════════════════════════════════════════
// 1. جدول البحث الثابت (Single Source of Truth)
// ════════════════════════════════════════════════
const _STATUS_MAP = Object.freeze({
  scheduled:    "مجدولة",
  unscheduled:  "غير مجدولة",
  departed:     "غادرت",
  canceled:     "ملغية",
  rescheduled:  "معاد جدولتها",
  delayed:      "متأخرة",
});

/**
 * الحالتان اللتان يحملهما تحديث رحلات الصالة من موقع المطار، وهما وحدهما
 * ما يُقرأ من حقل `status` في القاعدة ويُكتب إليه عند الحفظ.
 * لماذا لا كل القاموس: نافذة تعديل الرحلة تكتب `rescheduled` عند كل تعديل
 * يدوي، ولو قُرئ لصار «معاد جدولتها» حالةً دائمة لا تتحوّل إلى «غادرت»
 * في تيوب التسجيل. فالقراءة محصورة فيما يُعلنه المطار.
 */
const SITE_STATUSES = Object.freeze(["canceled", "delayed"]);

// ════════════════════════════════════════════════
// 2. دوال الوصول الآمنة (Information Hiding)
// ════════════════════════════════════════════════

/**
 * يُرجع التسمية العربية لقيمة حالة الرحلة.
 * @param {string} key - مفتاح الحالة الإنجليزي (مثل: "scheduled")
 * @returns {string} التسمية العربية، أو سلسلة فارغة إذا كان المفتاح غير صالح
 */
function getStatusLabel(key) {
  if (!key || typeof key !== "string") return "";
  return _STATUS_MAP[key.trim()] || "";
}

/**
 * يُرجع كل مفاتيح الحالات المعرّفة.
 * @returns {string[]} مصفوفة بمفاتيح القائمة
 */
function getAllStatusKeys() {
  return Object.keys(_STATUS_MAP);
}

/**
 * يبني سلسلة خيارات HTML لـ select من مفاتيح محددة.
 * يُستخدم في getFormTemplate وgetEditFlightHtml لتوليد <option> ديناميكياً.
 * @param {string[]} [keys] - المفاتيح المطلوبة، افتراضياً كل المفاتيح
 * @returns {string} سلسلة <option> جاهزة للحقن في select
 */
function buildStatusOptions(keys) {
  const list = Array.isArray(keys) && keys.length > 0
    ? keys
    : getAllStatusKeys();
  let html = "";
  for (const k of list) {
    const lbl = _STATUS_MAP[k];
    if (!lbl) continue;
    html += `<option value="${k}">${lbl}</option>`;
  }
  return html;
}

// ════════════════════════════════════════════════
// 3. نقطة الدخول (إلزام القالب الثابت)
// ════════════════════════════════════════════════
class AppCoordinator {
  static async boot() {
    // وحدة بيانات ثابتة — لا تنفيذ عند الإقلاع
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

module.exports = Object.freeze({
  getStatusLabel,
  getAllStatusKeys,
  buildStatusOptions,
  STATUS: _STATUS_MAP,
  SITE_STATUSES,
});
