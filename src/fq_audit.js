// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: clipboard-check;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_audit.js

// ═══ سجل التدقيق — Audit Log ═══
// يسجّل كل العمليات الحساسة في فايربيس
// المطوّر فقط يقرأ السجل الكامل

const cfg = importModule("fq_config");
const firebaseAuth = importModule("fq_firebase_auth");
// تم تحديث الاستيراد: fq_secrets -> fq_config

// ═══ تسجيل عملية في السجل ═══
/**
 * يكتب عملية في سجلّ التدقيق باسم المستخدم الحالي.
 * @param {string} action اسم العملية
 * @param {string} details تفاصيلها، وتُكتب فارغة إن غابت
 * @param {string} targetId معرّف ما وقعت عليه العملية، وفارغ إن غاب
 * @returns {Promise<boolean>} نجاح الكتابة، و false عند أي فشل
 */
async function logAction(action, details, targetId) {
  try {
    const user = cfg.getCurrentUser();
    const entry = {
      action: action,
      details: details || "",
      targetId: targetId || "",
      userName: user.name,
      userRole: user.role,
      userEmpId: user.empId,
      userUuid: user.uuid,
      userUid: user.uid,
      timestamp: new Date().toISOString(),
      serverTime: { ".sv": "timestamp" },
    };
    const key = Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
    const result = await firebaseAuth.sendDatabaseRequest({
      path: `audit_log/${user.empId || "unknown"}/${key}.json`,
      method: "PUT", body: entry, timeoutSeconds: 8, forceRefresh: false,
    });
    return result.ok;
  } catch (e) {
    return false;
  }
}

// ═══ كود جافاسكربت — تسجيل من الواجهة ═══
/**
 * يبني شيفرة الصفحة التي تكتب في سجلّ التدقيق عبر الطابور.
 * @returns {string} نص JavaScript يعمل داخل الصفحة
 */
function getAuditCode() {
  return `
// ═══ سجل التدقيق على الطابور ═══
// كان أكثر المواضع ضررًا بلا طابور: يبتلع الفشل ويُرجع false، فحدثٌ
// حسّاس يختفي بلا أن يعلم به أحد. والمفتاح يُولَّد هنا مرّة واحدة
// ويُجمَّد في العنصر، فإعادة الإرسال تكتب فوق نفسها ولا تُنشئ سجلًّا ثانيًا.
//
// وشرط fbConnected باقٍ: الطابور يعالج **انقطاعًا أثناء العمل**، أمّا
// جلسة بلا اتصال أصلًا فلا هوية فيها ولا صلاحية، وإدراج سجلّ تدقيق
// بلا مستخدم موثَّق يملأ الطابور بما لن تقبله القاعدة.
async function auditLog(action, details, targetId) {
  if (!fbConnected) return false;
  try {
    let entry = {
      action: action,
      details: details || "",
      targetId: targetId || "",
      userName: FB_USER,
      userRole: FB_ROLE,
      userEmpId: FB_EMP_ID || "",
      userUuid: FB_UUID || "",
      userUid: FB_UID || "",
      timestamp: new Date().toISOString()
    };
    let key = Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
    let res = await fqSendOrQueue({
      path: "/audit_log/" + (FB_EMP_ID || "unknown") + "/" + key + ".json",
      method: "PUT", body: entry, timeoutMs: 10000,
      kind: "audit", label: "سجل تدقيق: " + action
    });
    return res.ok;
  } catch(e) { return false; }
}
`;
}

module.exports = Object.freeze({ logAction, getAuditCode });
