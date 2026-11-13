// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: lock;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_auth_additions.js

/**
 * @module fq_auth_additions
 * @description واجهة توافق لوحدة قديمة. أصبحت المصادقة من مسؤولية Firebase
 * Authentication، وأُوقف نقل الجلسة لأنه قد يسرّب رمزًا صالحًا بين الأجهزة.
 */

const fqAuth = importModule("fq_auth");
const HASH_SEED = 5381;

// للتوافق مع أدوات التشخيص فقط؛ لا تُستخدم لتخزين كلمات المرور أو التحقق منها.
/**
 * بصمة نصّية للتوافق مع أدوات التشخيص فقط، ولا تُستعمل لكلمات المرور.
 * @param {string} str النص
 * @param {string} salt الملح
 * @param {number} iterations عدد جولات الخلط، وواحدة إن غاب
 * @returns {string} البصمة
 */
function simpleHash(str, salt, iterations) {
  let hash = HASH_SEED;
  const value = `${String(str || "")}:${String(salt || "")}`;
  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) + hash) + value.charCodeAt(index);
    hash &= 0xFFFFFFFF;
  }
  const count = Number(iterations || 1);
  for (let index = 0; index < count; index++) {
    hash = ((hash << 5) + hash) ^ (hash >> 16);
    hash &= 0xFFFFFFFF;
  }
  return Math.abs(hash).toString(36) + value.length.toString(36);
}

/**
 * غلاف يفوّض التحقّق إلى verifyPassword في fq_auth.
 * @param {string} email البريد الإلكتروني
 * @param {string} password كلمة المرور
 * @returns {Promise<Object>} نتيجة fq_auth كما هي
 */
async function verifyPassword(email, password) {
  return await fqAuth.verifyPassword(email, password);
}

/**
 * نقل الجلسة موقوف منذ اعتماد Firebase Authentication.
 * @returns {Promise<null>} دائمًا null
 */
async function exportSessionForTransfer() {
  console.warn("[fq_auth_additions] نقل الجلسة موقوف مع Firebase Authentication.");
  return null;
}

/**
 * استيراد الجلسة موقوف منذ اعتماد Firebase Authentication.
 * @param {string} transferKey مفتاح النقل، ولا يُستعمل
 * @returns {Promise<boolean>} دائمًا false
 */
async function importSessionFromTransfer(transferKey) {
  if (transferKey) {
    console.warn("[fq_auth_additions] استيراد الجلسة موقوف مع Firebase Authentication.");
  }
  return false;
}

class AppCoordinator {
  static async boot() { /* وحدة توافق بلا إجراء إقلاع. */ }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((error) => console.error(error)); } catch (error) { console.error(error); }

module.exports = Object.freeze({
  simpleHash,
  verifyPassword,
  exportSessionForTransfer,
  importSessionFromTransfer,
});
