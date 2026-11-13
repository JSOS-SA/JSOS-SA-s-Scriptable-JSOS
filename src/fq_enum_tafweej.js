// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: stream;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_enum_tafweej.js

/**
 * @module fq_enum_tafweej
 * @description قاموس قيم التفويج المعتمدة.
 * يصف ما حدث للحافلة عند بوابة المغادرة.
 * مصدر الحقيقة الوحيد لتسميات التفويج. يُحقن في WebView كمتغير TAFWEEJ.
 *
 * ملاحظة: قيمة "stumbler" (متعثر) تصف الحافلة التي وصلت لكن لم يُسمح بدخولها
 * بسبب إغلاق بوابات السفر أو انتهاء الوقت أو عدم وجود رحلة.
 */

const _TAFWEEJ_MAP = Object.freeze({
  ontime:      "في الموعد",
  early:       "مبكر",
  late:        "متأخر",
  shared:      "مشترك",
  wrong_t1:    "خاطئ صالة 1",
  wrong_north: "خاطئ الصالة الشمالية",
  wrong_hall4: "خاطئ صالة 4",
  wrong:       "خاطئ",
  stumbler:    "متعثر",
});

/**
 * يُرجع التسمية العربية لقيمة التفويج.
 * @param {string} key - مفتاح التفويج الإنجليزي
 * @returns {string} التسمية العربية، أو سلسلة فارغة
 */
function getTafweejLabel(key) {
  if (!key || typeof key !== "string") return "";
  return _TAFWEEJ_MAP[key.trim()] || "";
}

/**
 * يُرجع كل مفاتيح التفويج.
 * @returns {string[]}
 */
function getAllTafweejKeys() {
  return Object.keys(_TAFWEEJ_MAP);
}

/**
 * يبني سلسلة خيارات HTML لـ select.
 * @param {string[]} [keys] - المفاتيح المطلوبة، افتراضياً الكل
 * @returns {string} سلسلة <option>
 */
function buildTafweejOptions(keys) {
  const list = Array.isArray(keys) && keys.length > 0
    ? keys
    : getAllTafweejKeys();
  let html = "";
  for (const k of list) {
    const lbl = _TAFWEEJ_MAP[k];
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
  getTafweejLabel,
  getAllTafweejKeys,
  buildTafweejOptions,
  TAFWEEJ: _TAFWEEJ_MAP,
});
