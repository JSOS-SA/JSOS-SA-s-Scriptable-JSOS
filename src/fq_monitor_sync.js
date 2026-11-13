// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: cloud-upload-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_sync.js

/**
 * @module fq_monitor_sync
 * @description ترحيل الرصد سحابيًا — الشبكة وحدها.
 * المسؤولية الواحدة: إرسال دفعة سجلات واحدة إلى القاعدة وإرجاع نتيجة صادقة.
 *
 * لا تقرأ طابورًا ولا تحذف سجلًا ولا تحسب شيئًا: تستلم ما تُرسله، وتقول
 * أنجح الطلب أم لا. قرار حذف المُرحَّل يبقى عند المنسّق، لأن الحذف بناءً
 * على طلب لم يُتحقَّق من حالته هو أشيع سبب لضياع السجلات صامتًا.
 */

const firebaseAuth = importModule("fq_firebase_auth");

const REQUEST_TIMEOUT_SECONDS = 12;
const AUDIT_PATH = "/audit_log/";
const HTTP_OK = 200;

/**
 * يرحّل دفعة سجلات بطلب تحديث جزئي واحد.
 * طلب واحد لا خمسون: التحديث الجزئي متعدّد المسارات هو النمط المعتمد
 * في دستور المشروع للترحيل الجماعي، وإطلاق طلبات متزامنة أنتج عناقيد
 * أخطاء موثّقة في الدروس المستفادة.
 * @param {string} safeEmpId - معرّف الموظف بعد التنظيف
 * @param {Object} payload - خريطة المفاتيح إلى السجلات
 * @returns {Promise<boolean>} true إذا أكّد الخادم النجاح
 */
async function patchBatch(safeEmpId, payload) {
  const result = await firebaseAuth.databaseRequest(
    `${AUDIT_PATH + safeEmpId}.json`, "PATCH", payload,
    REQUEST_TIMEOUT_SECONDS, false
  );
  return result.ok && result.status === HTTP_OK;
}

class AppCoordinator {
  static async boot() {
    // وحدة شبكة — لا إجراء إقلاع
  }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((e) => console.error(e)); } catch (e) { console.error(e); }

module.exports = Object.freeze({ patchBatch });
