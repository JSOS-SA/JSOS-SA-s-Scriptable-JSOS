// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: list-ol;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_keys_scan.js

/**
 * @module fq_keys_scan
 * @description المسؤولية الواحدة: **قراءة مفاتيح مسارٍ بلا محتواها،
 * والمقارنة بها**. لا كتابة ولا DOM ولا رسائل للموظف.
 *
 * **العلّة التي جاءت لها**: كانت رسالة الحذف تُبنى من عدد ما اختفى **من
 * الشاشة**، لا ممّا اختفى من القاعدة. فالنظام يقول «تم حذف ١٠٠ رحلة من
 * القاعدة» ثم تعود المئة عند أول تحديث. والدليل الوحيد على الحذف هو أن
 * تسأل القاعدة: هل بقي هذا المفتاح؟
 *
 * **ولماذا لا يكفي `dRes.ok`** — بنصّ الوثائق، الحذفُ على مسار غير موجود
 * **ينجح**:
 * «A successful `DELETE` request will be indicated by a `200 OK` HTTP
 * status code with a response containing JSON `null`.»
 * <https://firebase.google.com/docs/database/rest/save-data>
 * فمفتاحٌ خاطئ يُحذف «بنجاح» بينما السجل الحقيقي باقٍ. لا يكشفه إلا
 * القراءة بعده.
 *
 * **والقراءة رخيصة لأنها سطحية** — Firebase, Retrieve Data (REST):
 * «This is an advanced feature, designed to help you work with large
 * datasets without needing to download everything. To use it, add
 * `shallow=true` as a parameter. This will limit the depth of the data
 * returned.»
 * <https://firebase.google.com/docs/database/rest/retrieve-data>
 * فطلبٌ واحد يُرجع المفاتيح وحدها، لا الرحلات بمحتواها.
 *
 * **والنمط مستعمل في المستودع أصلًا**: `t4ListKeys` في `fq_t4_store`
 * تقرأ بـ `shallow=true` منذ المرحلة الثالثة.
 *
 * **الواجهة — وهي كل ما يجب أن يعرفه المستدعي**:
 * ```
 * fqScanKeys(basePath)            → { ok, keys, error }
 * fqKeysRemaining(present, wanted) → المفاتيح المطلوبة التي ما زالت موجودة
 * ```
 * `basePath` بلا `.json`، مثل `/flights_sch`.
 * **لا ترمي أبدًا** — على نمط `fqRequest` تمامًا.
 *
 * **موضع الحقن ملزم**: بعد `fq_net_request` (تستدعي `fqRequest`) وقبل كل
 * من يتحقّق. والاعتماد نازل: هذه الوحدة لا تستدعي أحدًا فوقها.
 */

function getKeysScanCode() {
  return `
// ═══ مفاتيح المسار بلا محتواها ═══
const FQ_SCAN_TIMEOUT_MS = 15000;

// shallow=true يُرجع كائنًا مفاتيحه أسماء الأبناء وقيمها true — فالمحتوى
// لا يُنزَّل أصلًا. ومسار فارغ يُرجع null، وهو ليس فشلًا بل «لا شيء هنا».
async function fqScanKeys(basePath) {
  const res = await fqRequest({
    path: basePath + ".json?shallow=true",
    method: "GET",
    timeoutMs: FQ_SCAN_TIMEOUT_MS
  });
  if (!res.ok) return { ok: false, keys: [], error: res.error };
  return { ok: true, keys: res.data ? Object.keys(res.data) : [], error: "" };
}

// ═══ ما بقي هو ما لم يُحذف ═══
// دالة خالصة: تأخذ ما في القاعدة الآن وما طُلب حذفه، وتُرجع ما تخلّف.
// تُختبر بلا شبكة ولا صفحة، وهي وحدها التي تقرّر صدق رسالة الحذف.
function fqKeysRemaining(present, wanted) {
  const index = {};
  const list = present || [];
  for (let i = 0; i < list.length; i++) index[list[i]] = true;
  const left = [];
  const ask = wanted || [];
  for (let j = 0; j < ask.length; j++) {
    if (index[ask[j]]) left.push(ask[j]);
  }
  return left;
}
`;
}

module.exports = Object.freeze({ getKeysScanCode });
