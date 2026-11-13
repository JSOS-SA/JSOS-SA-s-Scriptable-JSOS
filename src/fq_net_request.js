// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: exchange-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_net_request.js

/**
 * @module fq_net_request
 * @description المسؤولية الواحدة: **باب واحد** لكل طلب قاعدة يخرج من
 * الصفحة. لا يعرف شيئًا عن الواجهة ولا عن معنى البيانات.
 *
 * **لماذا وُجدت هذه الوحدة**: كان في الصفحة بابان. `fbSafeWrite` تُرجع
 * `{ok,...}` وتُستدعى في خمسة مواضع، و`fbFetchTimeout` تُستدعى خامًا في
 * الباقي من أربعة وأربعين نداءً فترمي عند الفشل أو تُهمَل نتيجتها. فأي
 * سياسة عامة — طابور أو إعادة محاولة أو تصنيف فشل — تُكتب في الأولى لا
 * تمرّ بها تسعة وثلاثون نداءً. الباب الواحد شرطٌ لأي تنظيم بعده.
 *
 * **ولا تكرّر الناقل**: `fbFetchTimeout` في `fq_firebase_webview` تبقى
 * الناقل الخام وحدها — هي صاحبة المهلة و`AbortController` وإلحاق رمز
 * المصادقة بالرابط. هذه الوحدة غلاف فوقها لا بديل عنها.
 *
 * **ثلاثة أصناف للفشل، لا صنف واحد**: الطابور لاحقًا يحتاج أن يعرف
 * أيُعيد المحاولة أم يتوقّف. والتصنيف مأخوذ من سلوك مُثبَت في المشروع لا
 * من اجتهاد: `_isDenialPermanent` في `fq_monitor_flush_batch` تعزل الدفعة
 * على ٤٠١/٤٠٣ المتكرّرة، وتُعيد ما سواها.
 *
 * | الصنف | متى | ماذا يفعل المستدعي |
 * |---|---|---|
 * | `transient` | شبكة، أو مهلة، أو ٥xx، أو حالة صفر | يُعاد لاحقًا |
 * | `permanent` | ٤٠٠ · ٤٠٤ · ٤٢٢ | لا يُعاد — الطلب نفسه معطوب |
 * | `denied` | ٤٠١ · ٤٠٣ | لا يُعاد بلا تدخّل — صلاحية أو جلسة |
 *
 * **والجلسة المنتهية لا تصل إلى هنا غالبًا** (٢٠٢٦-٠٩-٢٨): `fbFetchTimeout`
 * يجدّد الرمز عند أول رفض ويعيد الطلب مرّة قبل أن يُرجع شيئًا. فـ`denied`
 * هنا إمّا رفضُ صلاحية بعد رمزٍ جديد، وإمّا «تعذّر تجديد جلسة الدخول».
 *
 * **وتصحيح رسالة مضلِّلة** (المعلَّق ٧-١٤): `fbFetchTimeout` تصوغ «لا يملك
 * صلاحية **قراءة** هذا المسار» لكل رفض ٤٠١/٤٠٣ حتى لو كان الفعل حذفًا،
 * لأنها لا تعرف الفعل. وهذه الوحدة تعرفه، فتعيد الصياغة بالفعل الصحيح.
 * والشيفرة المشتركة لم تُمَسّ، فلا تتأثّر ميزة أخرى.
 *
 * **موضع الحقن ملزم**: بعد `getFirebaseCode` (صاحبة `FB_URL` و
 * `fbFetchTimeout`) وقبل كل من يستعملها. الصفحة نطاق واحد، والاعتماد
 * نازل دائمًا: هذه الوحدة لا تستدعي أحدًا فوقها.
 */

function getNetRequestCode() {
  return getNetRequestCodePart1() +
    getNetRequestCodePart2() +
    getNetRequestCodePart3();
}

/** الجزء 1 من 3 من نصّ `getNetRequestCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getNetRequestCodePart1() {
  return `
// ═══ باب الطلب الواحد ═══
const FQ_REQ_TIMEOUT_MS = 12000;

// أصناف الفشل الثلاثة — أسماء لا أرقام، فالمستدعي لا يقرأ رموز HTTP.
const FQ_FAIL_TRANSIENT = "transient";
const FQ_FAIL_PERMANENT = "permanent";
const FQ_FAIL_DENIED = "denied";

// رمز الحالة إن وُجد، وصفر إن كان العطل قبل وصول ردّ أصلًا.
function fqErrStatus(err) {
  return (err && typeof err.status === "number") ? err.status : 0;
}

// ٤٠١ و٤٠٣ صنف قائم بذاته: الطلب سليم والحساب ممنوع، فإعادته بلا تدخّل
// عبث. وما عداهما من أخطاء العميل عطبٌ في الطلب نفسه فلا يُعاد أبدًا.
// وكل ما سوى ذلك — شبكة، مهلة، خمسمئة، أو لا ردّ — عابر يُعاد.
function fqFailKind(err) {
  const status = fqErrStatus(err);
  if (status === 401 || status === 403) return FQ_FAIL_DENIED;
  if (status === 400 || status === 404 || status === 422) return FQ_FAIL_PERMANENT;
  return FQ_FAIL_TRANSIENT;
}

// اسم الفعل بالعربية، ليصف الرفضُ ما رُفض فعلًا لا «قراءة» دائمًا.
function fqActionWord(method) {
  if (method === "GET") return "قراءة";
  if (method === "DELETE") return "حذف";
  return "كتابة";
}

function fqFailMessage(err, method) {
  if (err && err.code === "PERMISSION_DENIED") {
    return "الحساب لا يملك صلاحية " + fqActionWord(method) + " هذا المسار";
  }
  if (err && err.message) return err.message;
  return String(err);
}

// جسم الطلب يُسلسَل هنا مرّة واحدة، فلا يكرّره كل مستدعٍ ولا ينسى الترويسة.
function fqRequestInit(method, body) {
  const init = { method: method };
  if (body === undefined || body === null) return init;
  init.headers = { "Content-Type": "application/json" };
  init.body = JSON.stringify(body);
  return init;`;
}

/** الجزء 2 من 3 من نصّ `getNetRequestCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getNetRequestCodePart2() {
  return `
}

// نصّ الردّ قد يكون فارغًا (حذف ناجح) أو غير جيسون. الفشل في التحليل
// ليس فشلًا في الطلب: البيانات تصير null والنتيجة تبقى ناجحة.
function fqParseBody(text) {
  if (!text) return null;
  try { return JSON.parse(text); }
  catch (parseError) {
    console.warn("[fq_net] تعذّر تحليل الردّ: " + parseError.message);
    return null;
  }
}

async function fqReadBody(resp) {
  if (!resp || typeof resp.text !== "function") return null;
  try { return fqParseBody(await resp.text()); }
  catch (readError) {
    console.warn("[fq_net] تعذّرت قراءة الردّ: " + readError.message);
    return null;
  }
}

function fqOkResult(resp, data) {
  const status = (resp && typeof resp.status === "number") ? resp.status : 200;
  return { ok: true, status: status, data: data, error: "", kind: "" };
}

function fqFailResult(err, method) {
  return {
    ok: false,
    status: fqErrStatus(err),
    data: null,
    error: fqFailMessage(err, method),
    kind: fqFailKind(err)
  };
}
`;
}

/** الجزء 3 من 3 من نصّ `getNetRequestCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getNetRequestCodePart3() {
  return `
// ═══ الباب نفسه ═══
// لا ترمي أبدًا: الفشل قيمة مُرجَعة. رمي الاستثناء يُلزم كل مستدعٍ بكتابة
// try/catch، ونسيانُه هو ما جعل نداءات كثيرة تُهمل نتيجتها بصمت.
// المسار نسبيّ من جذر القاعدة ويبدأ بشرطة مائلة، كما في fbSafeWrite.
async function fqRequest(options) {
  const opts = options || {};
  const method = opts.method || "GET";
  const wait = (typeof opts.timeoutMs === "number" && opts.timeoutMs > 0)
    ? opts.timeoutMs : FQ_REQ_TIMEOUT_MS;
  try {
    const resp = await fbFetchTimeout(
      FB_URL + opts.path, fqRequestInit(method, opts.body), wait
    );
    return fqOkResult(resp, await fqReadBody(resp));
  } catch (e) {
    return fqFailResult(e, method);
  }
}

// الاسم القديم يبقى بتوقيعه ونتيجته، فلا يتغيّر أيٌّ من مواضعه. وهو الآن
// غلاف رقيق لا نسخة ثانية من المنطق.
async function fbSafeWrite(path, method, body) {
  return await fqRequest({ path: path, method: method, body: body });
}
`;
}

module.exports = Object.freeze({ getNetRequestCode });
