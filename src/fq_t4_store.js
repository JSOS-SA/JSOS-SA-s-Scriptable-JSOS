// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: database;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_store.js

/**
 * @module fq_t4_store
 * @description المسؤولية الواحدة: تخزين مدخلات T4 في قاعدة البيانات
 * واسترجاعها. لا يعرف شيئًا عن الواجهة ولا عن شكل النص.
 *
 * المسار: reg_data/t4_reports — مشترك بين كل الموظفين.
 * اختير reg_data لأنه مسار مُثبَت عمليًّا في تيوب التسجيل؛ ولا نسخة من
 * قواعد أمان Firebase في المستودع، فلا سبيل للتحقّق من مسار جديد قبل
 * تجربته على الجهاز (الدرس ١٤).
 *
 * كل سطر سجلّ مستقل بمفتاح خاص قابل للفرز نصيًّا، فإضافة موظفَين في وقت
 * واحد لا تتصادم، والتعديل والحذف يمسّان سطرهما وحده.
 */

function getT4StoreCode() {
  return getT4StoreCodePart1() +
    getT4StoreCodePart2() +
    getT4StoreCodePart3() +
    getT4StoreCodePart4() +
    getT4StoreCodePart5();
}

/** الجزء 1 من 5 من نصّ `getT4StoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StoreCodePart1() {
  return `
// ═══ T4: طبقة القاعدة ═══
const T4_DB_PATH = "/reg_data/t4_reports";
const T4_TIMEOUT_MS = 12000;

// ═══ بوابة الصلاحية — نقطة واحدة قبل القاعدة ═══
// الحَكَم هو جدول fq_permissions المركزي، ويُحقن في الصفحة دالةً can().
// الفحص هنا في طبقة القاعدة وحدها، فلا يمرّ إليها قراءة ولا كتابة ولا
// حذف بلا إذن مهما كثرت الأزرار التي تستدعيها لاحقًا.
// غياب الجدول لا يمنع: الصفحة حينها غير مكتملة الحقن، والمنع الحقيقي
// قواعد أمان Firebase لا الواجهة.
function t4Allowed(action) {
  if (typeof can !== "function") return true;
  return can(action) === true;
}

function t4Denied() {
  return { ok: false, status: 403, error: "الحساب لا يملك صلاحية هذا الإجراء في T4" };
}

// مفتاح قابل للفرز نصيًّا: الطابع الزمني ثم لاحقة عشوائية تمنع التصادم
// عند إضافتين في الجزء نفسه من الثانية.
function t4NewKey() {
  const stamp = new Date().toISOString().replace(/[.:]/g, "-");
  return stamp + "_" + Math.random().toString(36).substr(2, 4);
}

// يقرأ كل المدخلات مرتّبة بزمن الإضافة.
// يُرجع {ok, entries, error} ولا يبتلع سبب الفشل أبدًا.
// يحوّل كائن القاعدة إلى قائمة مرتّبة بالمفتاح، ويُسقط أي سجلّ بلا رقم رحلة.
function t4RowsFromData(data) {
  const keys = data ? Object.keys(data) : [];
  keys.sort();
  const list = [];
  for (let i = 0; i < keys.length; i++) {
    const rec = data[keys[i]];
    if (!rec || !rec.flt) continue;
    rec._key = keys[i];
    list.push(rec);
  }
  return list;
}
`;
}

/** الجزء 2 من 5 من نصّ `getT4StoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StoreCodePart2() {
  return `
async function t4FetchAll() {
  if (!t4Allowed("t4_read")) return { ok: false, entries: [], error: t4Denied().error };
  try {
    const resp = await fbFetchTimeout(FB_URL + T4_DB_PATH + ".json", null, T4_TIMEOUT_MS);
    return { ok: true, entries: t4RowsFromData(await resp.json()), error: "" };
  } catch (e) {
    return { ok: false, entries: [], error: (e && e.message) ? e.message : String(e) };
  }
}

function t4Path(key) { return T4_DB_PATH + "/" + key + ".json"; }

// ═══ الشبكة أولًا، والطابور عند تعذّرها وحده ═══
// القاعدة نفسها صارت في fq_queue_submit لأن خمس ميزات تحتاجها، وكانت
// مكتوبة هنا أوّلًا (t4SendOrQueue). نسخة واحدة لا خمس.
//
// والمفتاح جاهز قبل الإدراج (t4NewKey وُلّد عند الحفظ)، فالمسار ثابت
// وإعادة الإرسال تكتب فوق نفسها ولا تُنشئ سطرًا ثانيًا.
//
// يكتب أو يعدّل سطرًا واحدًا.
async function t4PutEntry(key, entry) {
  if (!t4Allowed("t4_write")) return t4Denied();
  return await fqSendOrQueue({
    path: t4Path(key), method: "PATCH", body: entry,
    kind: "t4", label: "حفظ سطر T4"
  });
}

// يحذف سطرًا واحدًا.
async function t4DeleteEntry(key) {
  if (!t4Allowed("t4_delete")) return t4Denied();
  return await fqSendOrQueue({
    path: t4Path(key), method: "DELETE", body: null,
    kind: "t4", label: "حذف سطر T4"
  });
}

// حذف بلا طابور — يخدم «جديد» وحده (القرار ٥ في خطة الطابور).
// المسح الشامل يتطلّب شبكة حاضرة: لو دخل الطابور لَظهر للموظف أن كل شيء
// مُسح بينما الأسطر ما زالت في القاعدة، ثم تعود إليه بعد دقائق.
async function t4DeleteDirect(key) {
  return await fqRequest({ path: t4Path(key), method: "DELETE", body: null });
}
`;
}

/** الجزء 3 من 5 من نصّ `getT4StoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StoreCodePart3() {
  return `
// هل هذا السطر ما زال في الطابور؟ الحالة مشتقّة من الطابور لا مخزَّنة
// على السطر، فلا تبقى علامة انتظار على سطر وصل.
function t4IsPending(key) {
  if (!key || typeof fqQueueHasPath !== "function") return false;
  return fqQueueHasPath(t4Path(key));
}

function t4PendingCount() {
  if (typeof fqQueueCountUnder !== "function") return 0;
  return fqQueueCountUnder(T4_DB_PATH + "/");
}

// مفاتيح كل الأسطر المخزَّنة، بلا محتواها (shallow=true من توثيق Firebase REST).
// تشمل حتى السطر الذي لا رقم رحلة فيه، فلا يبقى بعد «جديد» سجلّ يتيم.
// يُرجع {ok, keys, error}.
async function t4ListKeys() {
  if (!t4Allowed("t4_delete_all")) return { ok: false, keys: [], error: t4Denied().error };
  try {
    const resp = await fbFetchTimeout(FB_URL + T4_DB_PATH + ".json?shallow=true", null, T4_TIMEOUT_MS);
    const data = await resp.json();
    return { ok: true, keys: data ? Object.keys(data) : [], error: "" };
  } catch (e) {
    return { ok: false, keys: [], error: (e && e.message) ? e.message : String(e) };
  }
}

// سطرًا سطرًا: لا يتوقف عند أول فشل، فبقاء سطر واحد لا يبرّر ترك الباقي.
// بقي بوصفه المسار المُثبَت على الجهاز — انظر t4DeleteKeys أدناه.
async function t4DeleteOneByOne(keys) {
  const tally = { deleted: 0, failed: 0, lastError: "" };
  for (let i = 0; i < keys.length; i++) {
    const res = await t4DeleteDirect(keys[i]);
    if (res && res.ok) { tally.deleted++; continue; }
    tally.failed++;
    tally.lastError = (res && res.error) ? res.error : "سبب غير معروف";
  }
  return tally;
}

// ═══ الحذف الجماعي مع حارس مصرَّح به ═══
// الأصل طلب PATCH واحد بإسناد null (fqBulkDeleteNow — بلا طابور، القرار ٥).
//`;
}

/** الجزء 4 من 5 من نصّ `getT4StoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StoreCodePart4() {
  return `
// ═══ صُحِّح الفهم في ٢٠٢٦-٠٩-٢٦ بتجربة على محاكي Firebase الرسمي ═══
// كان مكتوبًا هنا أن «حذف العقدة الأم بطلب واحد مرفوض، والـ PATCH الجماعي
// يقع عليها فقد يُرفض مثلها». والتجربة فرّقت بين أمرين كانا مخلوطين:
//   • **إفراغ عقدة القسم** (DELETE عليها = إسناد null لها): مرفوض لكل
//     الحسابات، لأن لا إذن كتابة على مستوى القسم. وهذا كان سبب العطل.
//   • **PATCH جماعي بمفاتيح وقيم null**: تُقيَّم القاعدة عند كل ابن على
//     حدة، فيُسمح لمن يُسمح له بحذف تلك الأسطر. وكان ينجح للمطوّر من
//     البداية، ويُرفض للموظف لأن الحذف نفسه كان ممنوعًا عليه — لا لأنه
//     وقع على العقدة الأم.
// فبعد إذن الحذف للجميع (أمر المالك ٢٠٢٦-٠٩-٢٦) صار المسار الجماعي ينجح
// للجميع، ويندر أن يعمل الحارس. **ويبقى الحارس** لأنه يحمي من تغيّرٍ في
// القواعد لا من حالةٍ واحدة، ويُسجَّل السبب صراحةً فلا يُبتلع الخبر.
// التحقّق: npm run rules — القسم [د].
//
// ولا يقع هذا الحارس على عقد الرحلات (flights_sch و flights_t1 و flights_north،
// وكانت flights_data): الكتابة الجماعية على العقدة الأم مُثبَتة عمليًّا —
// حفظ الجداول في fq_parser يفعلها في كل حفظ وينجح.
async function t4DeleteKeys(keys) {
  const bulk = await fqBulkDeleteNow(T4_DB_PATH, keys);
  if (bulk.kind !== "denied") {
    return { deleted: bulk.done, failed: bulk.failed, lastError: bulk.error };
  }
  console.warn("[fq_t4] رُفض الحذف الجماعي على العقدة الأم، عودة إلى الحذف سطرًا سطرًا: " + bulk.error);
  return await t4DeleteOneByOne(keys);
}
`;
}

/** الجزء 5 من 5 من نصّ `getT4StoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StoreCodePart5() {
  return `
// يحذف المخرجات كلها — يخدم زر «جديد».
// **لا يُحذف بـ DELETE على العقدة الأم**: مُجرَّبٌ على المحاكي أن إفراغ
// عقدة القسم مرفوض لكل الحسابات بلا استثناء، فكان «جديد» يفشل بـ «الحساب
// لا يملك صلاحية». والبديل PATCH جماعي بإسناد null لكل مفتاح
// (t4DeleteKeys)، وله حارسٌ يعود إلى الحذف سطرًا سطرًا إن رُفض هو الآخر.
// يُرجع {ok, deleted, failed, error}: ok لا تصحّ إلا إن حُذف كل شيء.
async function t4DeleteAll() {
  if (!t4Allowed("t4_delete_all")) return t4Denied();
  // المسح الشامل يتطلّب طابورًا فارغًا: سطرٌ لم يصل بعدُ ليس في القائمة
  // التي يقرؤها t4ListKeys، فلو مُسح الباقي لَعاد هو وحده بعد دقائق
  // وظهر للموظف أنّ «جديد» لم يعمل.
  const waiting = t4PendingCount();
  if (waiting > 0) {
    return {
      ok: false, deleted: 0, failed: 0,
      error: "لا يمكن المسح الآن: " + waiting + " سطرًا قيد الإرسال. انتظر وصولها ثم أعد المحاولة"
    };
  }
  const listed = await t4ListKeys();
  if (!listed.ok) return { ok: false, deleted: 0, failed: 0, error: listed.error };
  const t = await t4DeleteKeys(listed.keys);
  return {
    ok: t.failed === 0,
    deleted: t.deleted,
    failed: t.failed,
    error: t.failed === 0 ? "" : "تعذّر حذف " + t.failed + " من " + listed.keys.length + " — " + t.lastError
  };
}

// بصمة من يكتب، تُضاف إلى كل سطر ليُعرف صاحبه في التخزين المشترك.
function t4Author() {
  return {
    by: (typeof FB_USER !== "undefined" ? FB_USER : ""),
    byEmpId: (typeof FB_EMP_ID !== "undefined" ? FB_EMP_ID : "")
  };
}
`;
}

module.exports = Object.freeze({ getT4StoreCode });
