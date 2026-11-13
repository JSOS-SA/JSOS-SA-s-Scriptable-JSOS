// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: exchange-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_firebase_rest.js

/**
 * @module fq_firebase_rest
 * @description بوابة Realtime Database الأصلية. كل طلب يحمل Firebase ID token،
 * ويجدد الرمز ويعيد الطلب مرة واحدة عند رفض الجلسة.
 */

const firebaseAuth = importModule("fq_firebase_auth");

function _path(path) {
  const clean = String(path || "").replace(/^\/+|\/+$/g, "");
  return `${clean}.json`;
}

/**
 * يفحص الوصول إلى القاعدة الرئيسة بقراءة سطحية.
 * @returns {Promise<boolean>} true إن وصل الطلب ونجح
 */
async function ping() {
  const result = await firebaseAuth.sendDatabaseRequest({
    path: ".json?shallow=true&timeout=5s", method: "GET", body: null, timeoutSeconds: 8, forceRefresh: false,
  });
  return result.ok;
}

/**
 * يقرأ عقدة من القاعدة. «فارغ» و«معطوب» جوابان: العقدة المعدومة ok مع data بقيمة null، والفشل ok بقيمة false.
 * @param {string} path المسار بلا امتداد .json
 * @returns {Promise<{ok: boolean, data?: *, error?: string, status?: number}>} النتيجة
 */
async function readData(path) {
  const result = await firebaseAuth.sendDatabaseRequest({ path: _path(path), method: "GET", body: null, timeoutSeconds: 10, forceRefresh: false });
  if (result.ok) return { ok: true, data: result.data };
  return { ok: false, error: result.error, status: result.status };
}

/**
 * يكتب عقدة كاملة بطلب PUT.
 * @param {string} path المسار بلا امتداد .json
 * @param {*} data القيمة
 * @returns {Promise<boolean>} نجاح الطلب
 */
async function writeData(path, data) {
  const result = await firebaseAuth.sendDatabaseRequest({ path: _path(path), method: "PUT", body: data, timeoutSeconds: 10, forceRefresh: false });
  return result.ok;
}

/**
 * يحدّث أبناء عقدة بطلب PATCH.
 * @param {string} path المسار بلا امتداد .json
 * @param {Object} data الأبناء وقيمها، و null تحذف الابن
 * @returns {Promise<boolean>} نجاح الطلب
 */
async function patchData(path, data) {
  const result = await firebaseAuth.sendDatabaseRequest({ path: _path(path), method: "PATCH", body: data, timeoutSeconds: 10, forceRefresh: false });
  return result.ok;
}

/**
 * يضيف ابنًا بمفتاح يولّده الخادم بطلب POST.
 * @param {string} path المسار بلا امتداد .json
 * @param {*} data القيمة
 * @returns {Promise<{ok: boolean, key?: string, error?: string, status?: number}>} النتيجة ومعها المفتاح عند النجاح
 */
async function pushData(path, data) {
  const result = await firebaseAuth.sendDatabaseRequest({ path: _path(path), method: "POST", body: data, timeoutSeconds: 10, forceRefresh: false });
  if (result.ok && result.data && result.data.name) {
    return { ok: true, key: result.data.name };
  }
  return { ok: false, error: result.error, status: result.status };
}

/**
 * يحذف عقدة بطلب DELETE. والحذف على مسار غير موجود ينجح أيضًا بنصّ وثائق Firebase، فالنجاح لا يثبت أن شيئًا حُذف.
 * @param {string} path المسار بلا امتداد .json
 * @returns {Promise<boolean>} نجاح الطلب
 */
async function deleteData(path) {
  const result = await firebaseAuth.sendDatabaseRequest({ path: _path(path), method: "DELETE", body: null, timeoutSeconds: 10, forceRefresh: false });
  return result.ok;
}

module.exports = Object.freeze({
  ping, readData, writeData, patchData, pushData, deleteData,
});
