// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: clipboard-check;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_enum_inspection.js

/**
 * @module fq_enum_inspection
 * @description قاموس قيم نتيجة الكشف المعتمدة.
 * مصدر الحقيقة الوحيد لتسميات الكشف. يُحقن في WebView كمتغير INSPECTION.
 */

const _INSPECTION_MAP = Object.freeze({
  matching:     "مطابق",
  nonmatching:  "غير مطابق",
  none:         "لا يوجد",
});

/**
 * يُرجع التسمية العربية لقيمة الكشف.
 * @param {string} key - مفتاح الكشف الإنجليزي
 * @returns {string} التسمية العربية، أو سلسلة فارغة
 */
function getInspectionLabel(key) {
  if (!key || typeof key !== "string") return "";
  return _INSPECTION_MAP[key.trim()] || "";
}

/**
 * يُرجع كل مفاتيح الكشف.
 * @returns {string[]}
 */
function getAllInspectionKeys() {
  return Object.keys(_INSPECTION_MAP);
}

/**
 * يبني سلسلة خيارات HTML لـ select.
 * @param {string[]} [keys] - المفاتيح المطلوبة، افتراضياً الكل
 * @returns {string} سلسلة <option>
 */
function buildInspectionOptions(keys) {
  const list = Array.isArray(keys) && keys.length > 0
    ? keys
    : getAllInspectionKeys();
  let html = "";
  for (const k of list) {
    const lbl = _INSPECTION_MAP[k];
    if (!lbl) continue;
    html += `<option value="${k}">${lbl}</option>`;
  }
  return html;
}

class AppCoordinator {
  static async boot() {
    // وحدة بيانات ثابتة
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
  getInspectionLabel,
  getAllInspectionKeys,
  buildInspectionOptions,
  INSPECTION: _INSPECTION_MAP,
});
