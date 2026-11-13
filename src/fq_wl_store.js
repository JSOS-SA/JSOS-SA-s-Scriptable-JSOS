// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: database;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_wl_store.js

/**
 * @module fq_wl_store
 * @description المسؤولية الواحدة: تخزين مدخلات نموذج T4 في قاعدة البيانات
 * واسترجاعها. لا يعرف شيئًا عن الواجهة ولا عن شكل النص.
 *
 * المسار: reg_data/wl_reports — مشترك بين كل الموظفين، وجارٌ لمسار نموذج
 * F (reg_data/t4_reports) لا فرعٌ منه. الفصل مقصود بقرار المستخدم
 * ٢٠٢٦-٠٩-٢٦: «كل نموذج مستقل في قسم». وعليه فزر «جديد» في قسم لا يمسّ
 * سطرًا واحدًا من القسم الآخر.
 *
 * ═══ قواعد الأمان: قُرئت، ونسختها في docs/قواعد-الأمان-القاعدة-الرئيسة.md ═══
 * القاعدة تحت reg_data واحدة بحرف بدل على مستويين (قسم ثم سطر)، فهذا
 * المسار مشمول بها كما يشمل مسار نموذج F تمامًا، بلا قاعدة جديدة.
 * وثلاثة قيود منها تفسّر تصميم ما دونها:
 *   ١) لا إذن كتابة على مستوى القسم، فإفراغ عقدة القسم مرفوض لكل
 *      الحسابات. أمّا PATCH الجماعي بقيم null فيُقيَّم عند كل ابن على حدة
 *      فينجح — وهذا فرقٌ صُحِّح بالتجربة لا بالقراءة (الدرس ٤٤).
 *   ٢) الموظف لا يُقبل سطره إلا إن حمل recordedByEmpId برقمه، ولذلك
 *      يكتبه wlBuildEntry عند الإنشاء.
 *   ٣) الحذف مسموح للجميع في قسمَي T4 وحدهما — أمر المالك ٢٠٢٦-٠٩-٢٦.
 *      وخارجهما يبقى محصورًا بالمطوّر والمشرف، موافقةً لمصفوفة
 *      fq_permissions التي تمنع الموظف من حذف سجلّ تسجيل.
 *
 * ═══ كيف يُتحقَّق من هذا كلّه ═══
 * مفتاح حساب الخدمة **يتجاوز القواعد**، فلا يُثبت إذن الموظف أبدًا.
 * والتحقّق الصحيح بمحاكي Firebase الرسمي وحسابات وهمية لكل دور:
 * npm run rules — تسع عشرة حالة، أُثبتت حمراء بكسرين متعمَّدين.
 *
 * ═══ ما لا يُنسخ ═══
 * البوابة (t4Allowed) والمفتاح (t4NewKey) وتحويل الكائن إلى قائمة
 * (t4RowsFromData) وبصمة الكاتب (t4Author) تُستدعى من `fq_t4_store` ولا
 * تُنسخ هنا: نسخة ثانية من قاعدة واحدة تنحرف مع الوقت (الدرس ١٢).
 *
 * والصلاحيات هي صلاحيات T4 نفسها (t4_read و t4_write و t4_delete
 * و t4_delete_all) — النموذجان في تيوب واحد ولأصحاب العمل أنفسهم، فمفاتيح
 * جديدة كانت ستعني منعًا صامتًا لمن لم يُذكر فيها.
 */

function getWlStoreCode() {
  return getWlStoreCodePart1() +
    getWlStoreCodePart2() +
    getWlStoreCodePart3();
}

/** الجزء 1 من 3 من نصّ `getWlStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlStoreCodePart1() {
  return `
// ═══ T4 (منطقة الاستقبال): طبقة القاعدة ═══
const WL_DB_PATH = "/reg_data/wl_reports";
const WL_TIMEOUT_MS = 12000;

function wlPath(key) { return WL_DB_PATH + "/" + key + ".json"; }

// يقرأ كل المدخلات مرتّبة بزمن الإضافة، ولا يبتلع سبب الفشل أبدًا.
async function wlFetchAll() {
  if (!t4Allowed("t4_read")) return { ok: false, entries: [], error: t4Denied().error };
  try {
    const resp = await fbFetchTimeout(FB_URL + WL_DB_PATH + ".json", null, WL_TIMEOUT_MS);
    return { ok: true, entries: t4RowsFromData(await resp.json()), error: "" };
  } catch (e) {
    return { ok: false, entries: [], error: (e && e.message) ? e.message : String(e) };
  }
}

// الشبكة أولًا، والطابور عند تعذّرها وحده. والمفتاح جاهز قبل الإدراج،
// فإعادة الإرسال تكتب فوق نفسها ولا تُنشئ سطرًا ثانيًا.
async function wlPutEntry(key, entry) {
  if (!t4Allowed("t4_write")) return t4Denied();
  return await fqSendOrQueue({
    path: wlPath(key), method: "PATCH", body: entry,
    kind: "wl", label: "حفظ سطر T4"
  });
}

async function wlDeleteEntry(key) {
  if (!t4Allowed("t4_delete")) return t4Denied();
  return await fqSendOrQueue({
    path: wlPath(key), method: "DELETE", body: null,
    kind: "wl", label: "حذف سطر T4"
  });
}

// حذف بلا طابور — يخدم «جديد» وحده: لو دخل الطابور لَظهر للموظف أن كل
// شيء مُسح بينما الأسطر ما زالت في القاعدة، ثم تعود إليه بعد دقائق.
async function wlDeleteDirect(key) {
  return await fqRequest({ path: wlPath(key), method: "DELETE", body: null });
}
`;
}

/** الجزء 2 من 3 من نصّ `getWlStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlStoreCodePart2() {
  return `
// هل هذا السطر ما زال في الطابور؟ الحالة مشتقّة من الطابور لا مخزَّنة على
// السطر، فلا تبقى علامة انتظار على سطر وصل.
function wlIsPending(key) {
  if (!key || typeof fqQueueHasPath !== "function") return false;
  return fqQueueHasPath(wlPath(key));
}

function wlPendingCount() {
  if (typeof fqQueueCountUnder !== "function") return 0;
  return fqQueueCountUnder(WL_DB_PATH + "/");
}

// مفاتيح كل الأسطر بلا محتواها (shallow=true من توثيق Firebase REST).
// تشمل السطر بلا رقم رحلة، فلا يبقى بعد «جديد» سجلّ يتيم.
async function wlListKeys() {
  if (!t4Allowed("t4_delete_all")) return { ok: false, keys: [], error: t4Denied().error };
  try {
    const resp = await fbFetchTimeout(FB_URL + WL_DB_PATH + ".json?shallow=true", null, WL_TIMEOUT_MS);
    const data = await resp.json();
    return { ok: true, keys: data ? Object.keys(data) : [], error: "" };
  } catch (e) {
    return { ok: false, keys: [], error: (e && e.message) ? e.message : String(e) };
  }
}

// سطرًا سطرًا: لا يتوقف عند أول فشل، فبقاء سطر واحد لا يبرّر ترك الباقي.
async function wlDeleteOneByOne(keys) {
  const tally = { deleted: 0, failed: 0, lastError: "" };
  for (let i = 0; i < keys.length; i++) {
    const res = await wlDeleteDirect(keys[i]);
    if (res && res.ok) { tally.deleted++; continue; }
    tally.failed++;
    tally.lastError = (res && res.error) ? res.error : "سبب غير معروف";
  }
  return tally;
}
`;
}

/** الجزء 3 من 3 من نصّ `getWlStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlStoreCodePart3() {
  return `
// ═══ الحذف الجماعي مع الحارس نفسه الذي يحرس نموذج F ═══
// مُجرَّبٌ على محاكي Firebase الرسمي (٢٠٢٦-٠٩-٢٦): هذا الطلب ينجح لكل
// الحسابات بعد إذن الحذف للجميع، فالقاعدة تُقيَّم عند كل ابن لا عند العقدة
// الأم. والحارس يبقى لتغيّرٍ محتمل في القواعد لا لحالةٍ قائمة، ويُسجَّل
// السبب صراحةً في السجل. التحقّق: npm run rules — القسم [د].
async function wlDeleteKeys(keys) {
  const bulk = await fqBulkDeleteNow(WL_DB_PATH, keys);
  if (bulk.kind !== "denied") {
    return { deleted: bulk.done, failed: bulk.failed, lastError: bulk.error };
  }
  console.warn("[fq_wl] رُفض الحذف الجماعي على العقدة الأم، عودة إلى الحذف سطرًا سطرًا: " + bulk.error);
  return await wlDeleteOneByOne(keys);
}

// يحذف مخرجات هذا القسم وحدها — يخدم زر «جديد».
// يُرجع {ok, deleted, failed, error}: ok لا تصحّ إلا إن حُذف كل شيء.
async function wlDeleteAll() {
  if (!t4Allowed("t4_delete_all")) return t4Denied();
  // المسح الشامل يتطلّب طابورًا فارغًا: سطرٌ لم يصل بعدُ ليس في القائمة
  // التي يقرؤها wlListKeys، فلو مُسح الباقي لَعاد هو وحده بعد دقائق.
  const waiting = wlPendingCount();
  if (waiting > 0) {
    return {
      ok: false, deleted: 0, failed: 0,
      error: "لا يمكن المسح الآن: " + waiting + " سطرًا قيد الإرسال. انتظر وصولها ثم أعد المحاولة"
    };
  }
  const listed = await wlListKeys();
  if (!listed.ok) return { ok: false, deleted: 0, failed: 0, error: listed.error };
  const t = await wlDeleteKeys(listed.keys);
  return {
    ok: t.failed === 0,
    deleted: t.deleted,
    failed: t.failed,
    error: t.failed === 0 ? "" : "تعذّر حذف " + t.failed + " من " + listed.keys.length + " — " + t.lastError
  };
}
`;
}

module.exports = Object.freeze({ getWlStoreCode });
