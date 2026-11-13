// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: user-shield;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: setup_dev.js

/**
 * @module setup_dev
 * @description أداة التهيئة القديمة متوقفة بعد اعتماد Firebase Authentication.
 * لا تكتب كلمات مرور أو سجلات دخول موازية في Realtime Database.
 */

async function showMigrationNotice() {
  const alert = new Alert();
  alert.title = "تهيئة المطوّر انتقلت";
  alert.message =
    "لا تستخدم setup_dev بعد الآن. أنشئ حساب المطوّر من Firebase Authentication " +
    "ثم سجّل الدخول من fq_main بالبريد وكلمة المرور. لن يعدّل هذا الملف أي بيانات.";
  alert.addAction("حسنًا");
  await alert.present();
}

try { await showMigrationNotice(); }
catch (error) { console.error(`[setup_dev] ${error.message}`); }
finally { Script.complete(); }
