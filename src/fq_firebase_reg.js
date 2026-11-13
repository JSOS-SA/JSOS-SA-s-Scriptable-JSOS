// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: clipboard-list;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_firebase_reg.js

// ═══ عمليات التسجيلات على القاعدة ═══
// المسؤولية الواحدة: حفظ/تحميل/حذف تسجيلات الورديات في فايربيس.
const cfg = importModule("fq_config");
const perms = importModule("fq_permissions");
const rest = importModule("fq_firebase_rest");

/**
 * يحفظ تسجيلًا واحدًا في ورديته باسم المستخدم الحالي.
 * @param {string} shiftKey مفتاح الوردية
 * @param {string} entryKey مفتاح التسجيل
 * @param {Object} entry محتوى التسجيل
 * @returns {Promise<boolean>} نجاح الكتابة
 */
async function saveRegistration(shiftKey, entryKey, entry) {
  const user = cfg.getCurrentUser();
  const payload = Object.assign({}, entry, {
    recordedBy: user.name, recordedByRole: user.role,
    recordedByEmpId: user.empId, recordedAt: new Date().toISOString(),
  });
  return await rest.patchData(`reg_data/${shiftKey}/${entryKey}`, payload);
}

/**
 * يحفظ عدة تسجيلات في ورديته بطلب واحد، ويُسقط كل تسجيل بلا _key.
 * @param {string} shiftKey مفتاح الوردية
 * @param {Object[]} entries التسجيلات، وكل منها يحمل مفتاحه في _key
 * @returns {Promise<boolean>} نجاح الكتابة
 */
async function saveRegistrationsBatch(shiftKey, entries) {
  const user = cfg.getCurrentUser();
  const payload = {};
  const now = new Date().toISOString();
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e._key) continue;
    const copy = Object.assign({}, e, {
      recordedBy: e.recordedBy || user.name,
      recordedByRole: e.recordedByRole || user.role,
      recordedByEmpId: e.recordedByEmpId || user.empId,
      recordedAt: e.recordedAt || now,
    });
    delete copy._key;
    payload[e._key] = copy;
  }
  return await rest.patchData(`reg_data/${shiftKey}`, payload);
}

/**
 * يقرأ تسجيلات وردية من القاعدة.
 * @param {string} shiftKey مفتاح الوردية
 * @returns {Promise<Object[]>} القائمة، وكل عنصر يحمل مفتاحه في _key، وفارغة عند الفشل
 */
async function loadRegistrations(shiftKey) {
  const result = await rest.readData(`reg_data/${shiftKey}`);
  if (!result.ok || !result.data) return [];
  const keys = Object.keys(result.data);
  const list = [];
  for (let i = 0; i < keys.length; i++) {
    const e = result.data[keys[i]];
    if (!e) continue;
    list.push(Object.assign({ _key: keys[i] }, e));
  }
  return list;
}

/**
 * يحذف تسجيلًا واحدًا لمن يملك صلاحية الحذف.
 * @param {string} shiftKey مفتاح الوردية
 * @param {string} entryKey مفتاح التسجيل
 * @returns {Promise<boolean>} نجاح الحذف، و false عند المنع
 */
async function deleteRegistration(shiftKey, entryKey) {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "delete_reg")) return false;
  return await rest.deleteData(`reg_data/${shiftKey}/${entryKey}`);
}

module.exports = Object.freeze({
  saveRegistration, saveRegistrationsBatch, loadRegistrations, deleteRegistration,
});
