// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: book;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_firebase_content.js

// ═══ محتوى القاعدة: الدليل + الإشعارات + المستخدمون ═══
// المسؤولية الواحدة: عمليات الدليل ودفع الإشعارات وبيانات المستخدمين.
const cfg = importModule("fq_config");
const perms = importModule("fq_permissions");
const rest = importModule("fq_firebase_rest");

/**
 * يكتب إشعارًا جديدًا في القاعدة باسم المستخدم الحالي.
 * @param {Object} entry محتوى الإشعار
 * @returns {Promise<boolean>} نجاح الكتابة
 */
async function pushNotification(entry) {
  const user = cfg.getCurrentUser();
  const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const payload = Object.assign({}, entry, {
    userUid: user.uid,
    empId: entry.empId || user.empId,
  });
  return await rest.writeData(`notifications/${key}`, payload);
}

/**
 * يحفظ دليل التسجيل في القاعدة، ثم يكتب إشعار التحديث إن نجح الحفظ.
 * @param {string} html محتوى الدليل
 * @returns {Promise<boolean>} نجاح الحفظ، و false إن لم يملك المستخدم الصلاحية
 */
async function saveGuide(html) {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "edit_guide")) return false;
  const ok = await rest.writeData("guide_data", {
    html: html, updatedBy: user.name,
    updatedAt: new Date().toISOString(),
  });
  if (ok) await pushNotification({
    type: "guide_updated", title: "تحديث دليل التسجيل",
    details: `تم تحديث الدليل من ${user.name}`,
    user: user.name, role: user.role,
    time: new Date().toISOString(),
  });
  return ok;
}

/**
 * يقرأ دليل التسجيل من القاعدة.
 * @returns {Promise<Object|null>} الدليل، و null عند الفشل أو الغياب
 */
async function loadGuide() {
  const result = await rest.readData("guide_data");
  if (!result.ok || !result.data) return null;
  return result.data;
}

/**
 * يحدّث ملف المستخدم في القاعدة. يحقّ للمستخدم ملفه وحده، وللمشرف فما فوق كل ملف.
 * @param {string} empId الرقم الوظيفي
 * @param {Object} data الحقول المحدَّثة
 * @returns {Promise<boolean>} نجاح الكتابة، و false عند المنع
 */
async function saveProfile(empId, data) {
  const user = cfg.getCurrentUser();
  const safeId = (empId || "").replace(/[.#$[\]/]/g, "-");
  if (!safeId) return false;
  if (!perms.can(user.role, "edit_other_profile") && user.empId !== empId) return false;
  const payload = Object.assign({}, data, {
    lastUpdatedBy: user.name,
    lastUpdatedAt: new Date().toISOString(),
  });
  return await rest.patchData(`users/${safeId}`, payload);
}

/**
 * يقرأ ملف مستخدم من القاعدة برقمه الوظيفي.
 * @param {string} empId الرقم الوظيفي
 * @returns {Promise<Object|null>} الملف، و null عند الفشل
 */
async function loadProfile(empId) {
  const safeId = (empId || "").replace(/[.#$[\]/]/g, "-");
  if (!safeId) return null;
  const result = await rest.readData(`users/${safeId}`);
  if (!result.ok) return null;
  return result.data;
}

/**
 * يقرأ كل المستخدمين لمن يملك صلاحية عرض الفريق.
 * @returns {Promise<Object[]>} القائمة، وكل عنصر يحمل مفتاحه في _key، وفارغة عند المنع أو الفشل
 */
async function loadAllUsers() {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "view_team")) return [];
  const result = await rest.readData("users");
  if (!result.ok || !result.data) return [];
  return _usersWithKeys(result.data);
}

/** يحوّل عقدة المستخدمين قائمةً، كل عنصر بمفتاحه في `_key`، ويُسقط الفارغ. */
function _usersWithKeys(data) {
  const keys = Object.keys(data);
  const list = [];
  for (let i = 0; i < keys.length; i++) {
    const u = data[keys[i]];
    if (!u) continue;
    list.push(Object.assign({ _key: keys[i] }, u));
  }
  return list;
}

module.exports = Object.freeze({
  pushNotification,
  saveGuide, loadGuide,
  saveProfile, loadProfile, loadAllUsers,
});
