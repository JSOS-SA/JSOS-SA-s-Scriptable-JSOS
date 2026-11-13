// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: passport;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_enum_visa.js

/**
 * @module fq_enum_visa
 * @description قاموس قيم نوع التأشيرة المعتمدة.
 * مصدر الحقيقة الوحيد لتسميات التأشيرة. يُحقن في WebView كمتغير VISA.
 */

const _VISA_MAP = Object.freeze({
  umrah:    "عمرة",
  tourism:  "سياحة",
  hajj:     "حج",
});

/**
 * يُرجع التسمية العربية لنوع التأشيرة.
 * @param {string} key - مفتاح التأشيرة الإنجليزي
 * @returns {string} التسمية العربية، أو سلسلة فارغة
 */
function getVisaLabel(key) {
  if (!key || typeof key !== "string") return "";
  return _VISA_MAP[key.trim()] || "";
}

/**
 * يُرجع كل مفاتيح التأشيرات.
 * @returns {string[]}
 */
function getAllVisaKeys() {
  return Object.keys(_VISA_MAP);
}

/**
 * يبني سلسلة خيارات HTML لـ select.
 * @param {string[]} [keys] - المفاتيح المطلوبة، افتراضياً الكل
 * @returns {string} سلسلة <option>
 */
function buildVisaOptions(keys) {
  const list = Array.isArray(keys) && keys.length > 0
    ? keys
    : getAllVisaKeys();
  let html = "";
  for (const k of list) {
    const lbl = _VISA_MAP[k];
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
  getVisaLabel,
  getAllVisaKeys,
  buildVisaOptions,
  VISA: _VISA_MAP,
});
