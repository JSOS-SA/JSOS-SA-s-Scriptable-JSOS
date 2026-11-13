// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: layer-group;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_bulk_write.js

/**
 * @module fq_bulk_write
 * @description المسؤولية الواحدة: **حذف مفاتيح كثيرة في طلب واحد**.
 * لا DOM ولا رسائل للموظف ولا معرفة بمعنى المفاتيح.
 *
 * **العلّة التي جاءت لها**: كان الحذف يرسل طلبًا مستقلًّا لكل مفتاح، في
 * أربعة مواضع: `fq_parser` (حذف الجداول) و`fq_hall_add` (حذف الصالات)
 * و`fq_t4_store` (زر «جديد») و`fq_firebase_flights` (`deleteFlightsBatch`
 * — اسمها «دفعة» وكانت واحدةً واحدة). فمئة رحلة = مئة طلب متسلسل، وهو
 * ما جعل الحذف يتجاوز الدقيقة.
 *
 * **الحلّ من الوثائق لا من اجتهاد** — Firebase, Save Data (REST):
 * «Firebase also supports multi-path updates. This means that `PATCH` can
 * now update values at multiple locations in your Firebase database at the
 * same time». وحذفُ الطفل بإسناد `null`:
 * «You can also delete by specifying `null` as the value for another write
 * operation such as `set()` or `update()`… You can use this technique with
 * `update()` to delete multiple children in a single API call».
 * <https://firebase.google.com/docs/database/rest/save-data>
 *
 * **والنمط مستعمل في المستودع أصلًا**: `fq_migrate_flight_keys.js:179-206`
 * (`applyPlan`) يكتب المفاتيح الجديدة ويحذف القديمة بإسناد `null` في
 * `PATCH` واحد، وتعليقها يسمّيه «السلوك الموثَّق لـ REST». فهذه الوحدة
 * نقلُ نمطٍ مُثبَت إلى سياق الصفحة، لا اختراع.
 *
 * **النتيجة تفصل ثلاث حالات ولا تخلطها** — وهذا لبّ الوحدة:
 * `done` ما وصل القاعدة · `pending` ما دخل الطابور ولم يصل بعد ·
 * `failed` ما رُفض. خلطُها هو بعينه العطل الذي جعل الشاشة تقول «تم حذف
 * ١٠٠ رحلة» وهي في القاعدة كما كانت.
 *
 * **الواجهة — وهي كل ما يجب أن يعرفه المستدعي**:
 * ```
 * fqBulkDelete(basePath, keys, label)     // الشبكة أولًا ثم الطابور
 * fqBulkDeleteNow(basePath, keys)         // بلا طابور — لما لا يصحّ تأجيله
 *   → { ok, requests, done, pending, failed, error, kind }
 * ```
 * `basePath` بلا `.json` وبلا شرطة في آخره، مثل `/flights_sch`.
 * **لا ترمي أبدًا** — على نمط `fqRequest` و`fqSendOrQueue` تمامًا.
 *
 * **موضع الحقن ملزم**: بعد `fq_queue_submit` (تستدعي `fqSendOrQueue`)
 * وقبل كل ميزة تحذف. والاعتماد نازل: هذه الوحدة لا تستدعي أحدًا فوقها.
 */

function getBulkWriteCode() {
  return getBulkWriteCodePart1() +
    getBulkWriteCodePart2() +
    getBulkWriteCodePart3();
}

/** الجزء 1 من 3 من نصّ `getBulkWriteCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getBulkWriteCodePart1() {
  return `
// ═══ الحذف الجماعي: مفاتيح كثيرة في طلب واحد ═══
// سقف الدفعة. جسم الطلب يكبر بعدد المفاتيح، وطلبٌ بلا سقف يصير هو نفسه
// سبب المهلة التي جئنا نعالجها. والرقم هنا مقيس على أسوأ حالة في النظام:
// جدول يوم كامل لا يتجاوز بضع مئات من الرحلات.
const FQ_BULK_MAX = 500;
const FQ_BULK_TIMEOUT_MS = 20000;

// تقسيم المفاتيح دفعات متساوية. آخر دفعة أصغر أو مساوية، ومصفوفة فارغة
// تُعطي صفر دفعات فلا يُرسل طلب على لا شيء.
function fqBulkChunks(keys, size) {
  const max = (typeof size === "number" && size > 0) ? size : FQ_BULK_MAX;
  const out = [];
  for (let i = 0; i < keys.length; i += max) out.push(keys.slice(i, i + max));
  return out;
}

// جسم الحذف: كل مفتاح مُسنَد إليه null.
function fqBulkNulls(keys) {
  const payload = {};
  for (let i = 0; i < keys.length; i++) payload[keys[i]] = null;
  return payload;
}

// دفعة واحدة = طلب PATCH واحد على العقدة الأم. ويمرّ بالباب القائم
// fqSendOrQueue فيدخل الطابور عند انقطاع الشبكة — **طلبٌ واحد في الطابور
// لا مئة**، وإعادة إرساله متكافئة لأن إسناد null على مفتاح محذوف أصلًا
// لا يغيّر شيئًا.
function fqBulkSendQueued(basePath, keys, label) {
  return fqSendOrQueue({
    path: basePath + ".json",
    method: "PATCH",
    body: fqBulkNulls(keys),
    kind: "bulk",
    label: label || "حذف جماعي",
    timeoutMs: FQ_BULK_TIMEOUT_MS
  });
}
`;
}

/** الجزء 2 من 3 من نصّ `getBulkWriteCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getBulkWriteCodePart2() {
  return `
// ═══ نسخة بلا طابور ═══
// تخدم ما لا يصحّ تأجيله. مثاله الوحيد اليوم زر «جديد» في T4 (القرار ٥ في
// خطة الطابور): لو دخل المسح الشامل الطابور لَظهر للموظف أن كل شيء مُسح
// بينما الأسطر ما زالت في القاعدة، ثم تعود إليه بعد دقائق.
function fqBulkSendNow(basePath, keys) {
  return fqRequest({
    path: basePath + ".json",
    method: "PATCH",
    body: fqBulkNulls(keys),
    timeoutMs: FQ_BULK_TIMEOUT_MS
  });
}

// ═══ ثلاث حالات لا حالة واحدة ═══
// done وصل · pending في الطابور · failed رُفض. والمستدعي يبني رسالته من
// هذه الأعداد وحدها، فلا يقول «تمّ» عمّا لم يصل.
function fqBulkTallyFailure(out, res, count) {
  out.failed += count;
  if (!out.error) { out.error = res.error; out.kind = res.kind; }
}

function fqBulkTally(out, res, count) {
  out.requests++;
  if (res.ok && res.queued) out.pending += count;
  else if (res.ok) out.done += count;
  else fqBulkTallyFailure(out, res, count);
  return out;
}

// المحرّك الواحد: يقسّم، ويرسل بما سُلّم إليه، ويجمع. والفرق بين النسختين
// مُرسِلٌ واحد لا حلقة ثانية.
async function fqBulkEach(basePath, keys, send) {
  const out = { ok: true, requests: 0, done: 0, pending: 0, failed: 0, error: "", kind: "" };
  if (!keys || keys.length === 0) return out;
  const chunks = fqBulkChunks(keys, FQ_BULK_MAX);
  for (let i = 0; i < chunks.length; i++) {
    const res = await send(basePath, chunks[i]);
    fqBulkTally(out, res, chunks[i].length);
  }
  out.ok = (out.failed === 0);
  return out;
}`;
}

/** الجزء 3 من 3 من نصّ `getBulkWriteCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getBulkWriteCodePart3() {
  return `

// الباب المعتاد: الشبكة أولًا ثم الطابور.
async function fqBulkDelete(basePath, keys, label) {
  return await fqBulkEach(basePath, keys, function (base, chunk) {
    return fqBulkSendQueued(base, chunk, label);
  });
}

// بلا طابور — الشبكة أو الفشل الصريح.
async function fqBulkDeleteNow(basePath, keys) {
  return await fqBulkEach(basePath, keys, fqBulkSendNow);
}
`;
}

module.exports = Object.freeze({ getBulkWriteCode });
