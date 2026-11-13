// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: eye;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_view.js

/**
 * @module fq_t4_view
 * @description المسؤولية الواحدة: ربط تيوب T4 — عرض المخرجات، وأفعال
 * الأزرار الثلاثة (نسخ، تعديل، جديد)، وفتح التيوب.
 *
 * يجمع بين الوحدات ولا يكرّر منطقها: النص من `fq_t4_text`، والقاعدة من
 * `fq_t4_store`، والنموذج من `fq_t4_form`، والتعديل من `fq_t4_editor`،
 * والإبلاغ من `fq_t4_report`.
 *
 * هذه أعلى وحدات T4: تستدعي ما تحتها ولا يستدعيها شيء. ولذلك يسجّل
 * `t4Render` عند المحرّر بـ `t4OnEditorChange` بدل أن يناديه المحرّر
 * باسمه — وإلا عادت حلقة الاعتماد التي فُكّت.
 */

function getT4ViewCode() {
  return getT4ViewCodePart1() +
    getT4ViewCodePart2() +
    getT4ViewCodePart3() +
    getT4ViewCodePart4() +
    getT4ViewCodePart5() +
    getT4ViewCodePart6() +
    getT4ViewCodePart7() +
    getT4ViewCodePart8() +
    getT4ViewCodePart9();
}

/** الجزء 1 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart1() {
  return `
// ═══ T4: الحالة المعروضة ═══
let T4_ENTRIES = [];
let T4_LOADED = false;
// القفل T4_BUSY ومُغلِّفه t4Guard في fq_t4_report — يتقاسمهما العارض
// والمحرّر، فلا نسختان لقفل واحد.

// الإبلاغ عن الفشل في وحدة fq_t4_report — وحدة أدنى يستدعيها العارض
// والمحرّر معًا، فلا يستدعي المحرّر وحدةً أعلى منه.

// ═══ العرض ═══
// حرّاس العناصر هنا شيكر لا صمت: البنية في fq_t4_html تضمن وجود كل
// مُعرِّف منها، فغيابه خلل برمجي يُسجَّل ثم يتوقّف المسار وحده بأمان.
function t4RenderMeta() {
  const meta = t4El("t4Meta");
  if (!t4Assert(meta, "t4RenderMeta: العنصر t4Meta مفقود")) return;
  if (!T4_LOADED) { meta.textContent = "جارٍ التحميل…"; return; }
  meta.textContent = T4_ENTRIES.length +
    " سطرًا في " + t4GroupEntries(T4_ENTRIES).length + " رحلة" + t4PendingNote();
}

// ═══ الحالة الثالثة في العدّاد ═══
// الشريط العام يقول «كم في الطابور كلّه»، وهذا يقول «كم منها من T4».
// وبلا هذا يرى الموظف رقمًا في الشريط ولا يعرف أيّ تيوب يعنيه.
// وتُحذف الإضافة تمامًا عند الصفر: عدّاد يقول «٠ قيد الإرسال» ضجيج دائم.
function t4PendingNote() {
  const waiting = t4PendingCount();
  if (waiting <= 0) return "";
  return " · " + waiting + " قيد الإرسال";
}

function t4RenderOutput() {
  const out = t4El("t4Out");
  if (!t4Assert(out, "t4RenderOutput: العنصر t4Out مفقود")) return;
  const txt = t4BuildText(T4_ENTRIES);
  if (txt) out.innerHTML = t4OutputHtml(txt);
  else out.innerHTML = '<span class="t4-empty">لا مخرجات بعد.</span>';
}

function t4Render() {
  t4RenderOutput();
  t4RenderMeta();
  if (T4_EDITING) t4RenderEditor();
}
`;
}

/** الجزء 2 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart2() {
  return `
// ═══ المخرجات والمحرّر — موضع واحد لا قسمان ═══
// طلب المستخدم ٢٠٢٦-٠٩-٢٤: «عند الضغط على تعديل تُفتح حقول التعديل في
// قسم المخرجات نفسه ولا يُفتح قسم جديد». فالعنصران متجاوران في البنية
// وواحد منهما يظهر: النص أو الحقول. وكانت الأسطر قبل ذلك تظهر مرّتين،
// نصًّا فوق وحقولًا تحت.
//
// والزر نفسه هو مخرج العودة (اختيار المستخدم): «تعديل» ← «تمّ». فلو
// بقي اسمه «تعديل» وهو مفتوح لبدا أنه لا يفعل شيئًا عند الضغط الثاني.
let T4_EDITING = false;

function t4ApplyEditMode() {
  const out = t4El("t4Out");
  const editor = t4El("t4Editor");
  const btn = t4El("t4EditBtn");
  if (!t4Assert(out && editor && btn,
    "t4ApplyEditMode: عنصر من (t4Out، t4Editor، t4EditBtn) مفقود")) return;
  // سلسلة فارغة لا "block": تعيد <pre> إلى عرضه الأصلي من الأنماط.
  out.style.display = T4_EDITING ? "none" : "";
  editor.style.display = T4_EDITING ? "block" : "none";
  // الاسم في عنصره لا في الزر كلّه: الزر يحمل أيقونة بعد توحيد الشكل.
  t4BtnLabel(btn, T4_EDITING ? "تمّ" : "تعديل");
  if (T4_EDITING) t4RenderEditor();
}

// الفتح تبديلُ عرضٍ لا نتيجة له، فيُرجع null ولا يُلوَّن زرّه. و«تمّ»
// فعلٌ يكتب: يحفظ ما تغيّر، وإن أخفق بقيت اللوحة مفتوحة واحمرّ الزر —
// لا يُقال «تمّ» على عملٍ لم يتمّ.
async function t4ToggleEdit() {
  if (!T4_EDITING) { T4_EDITING = true; t4ApplyEditMode(); return null; }
  const ok = await t4Guard(t4SaveAllEdits);
  if (!ok) return false;
  T4_EDITING = false;
  t4ApplyEditMode();
  return true;
}

async function t4Load() {
  const res = await t4FetchAll();
  T4_LOADED = true;
  if (!res.ok) { t4ReportFailure("تعذّر تحميل مخرجات T4", res); t4Render(); return false; }
  T4_ENTRIES = res.entries;
  t4Render();
  return true;
}
`;
}

/** الجزء 3 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart3() {
  return `
// ═══ الحفظ ═══
async function t4SaveCurrentForm() {
  const form = t4ReadForm();
  if (!t4FormReady(form)) return t4SaveIncomplete();
  const entry = t4BuildEntry(form);
  const key = t4NewKey();
  const res = await t4PutEntry(key, entry);
  if (!res || !res.ok) return t4SaveFailed(res);
  return t4AfterSave(entry, key);
}

function t4SaveIncomplete() {
  if (typeof showToast === "function") showToast("أكمل رقم الرحلة والعدد والحالة", "error", 2500);
  return false;
}

function t4SaveFailed(res) {
  t4ReportFailure("تعذّر الحفظ", res);
  return false;
}

// سطر المخرجات من النموذج، بكاتبه ولحظة كتابته.
function t4BuildEntry(form) {
  const author = t4Author();
  const entry = {
    flt: form.flt, std: form.std, dest: form.dest,
    pax: form.pax, status: form.status, date: form.date,
    by: author.by, byEmpId: author.byEmpId,
    at: new Date().toISOString()
  };
  // الوقت الجديد لا يُكتب إلا إن سُجِّل: حقلٌ فارغ في كل سطر تراكمُ
  // بيانات لا أثر لها، وهو ممنوع بأمر المالك.
  if (form.newStd) entry.newStd = form.newStd;
  return entry;
}

// بعد نجاح الكتابة في القاعدة: السطر يدخل القائمة بمفتاحه، ويُفرَّغ النموذج وتُعاد الرسم.
function t4AfterSave(entry, key) {
  entry._key = key;
  T4_ENTRIES.push(entry);
  t4ResetAfterSave();
  t4Render();
  return true;
}
`;
}

/** الجزء 4 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart4() {
  return `
// ═══ النسخ — ثلاث آليات كما في تيوب التسجيل ═══
// ١) متغيّر الجسر: ينسخه السكربت الأم عبر Pasteboard عند إغلاق النافذة.
// ٢) execCommand: نسخ فوري داخل إيماءة النقر.
// ٣) واجهة الحافظة الحديثة: غير متزامنة، ولها .catch إلزامي.
function t4WriteClipboard(txt) {
  window._FQ_CLIPBOARD_TEXT = txt;
  window._FQ_CLIPBOARD_READY = true;
  const ok = t4ExecCopy(txt);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).catch(function(e) {
      console.error("[fq_t4] clipboard", e);
    });
  }
  return ok;
}

// الآلية ٢: نسخ فوري بحقل نصّ مؤقّت وexecCommand. يُرجع نجاحه، والفشل يُسجَّل ولا يرمي.
function t4ExecCopy(txt) {
  let ok = false;
  try { ok = t4TextareaCopy(txt); } catch (e) { console.error("[fq_t4] execCommand", e); }
  return ok;
}

// حقل نصّ مؤقّت خارج الشاشة يُحدَّد نصّه ثم يُنسخ ويُزال. يُرجع نتيجة execCommand.
function t4TextareaCopy(txt) {
  const ta = document.createElement("textarea");
  ta.value = txt;
  ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}
`;
}

/** الجزء 5 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart5() {
  return `
// ═══ «نسخ» و«إرسال إلى واتساب»: خطوات واحدة وآخرها يختلف ═══
// أُضيف زرّ الواتساب إلى نموذج F وقسمه في ٢٠٢٦-٠٩-٢٧ بطلب المستخدم:
// «أضف الأزرار التي أُضيفت في قسم T4، فقط الأزرار وليس تغيير النموذج».
// فالنموذج وحقوله لم تُمسّ، والمضاف زرّ في النافذة وزرّان في القسم.
//
// كلاهما يحفظ الإدخال الحالي إن كان مكتملًا، ثم ينسخ مخرجات هذا القسم
// وحدها. والواتساب يزيد فتحَ التطبيق بالنص نفسه. **وجسر الواتساب هو جسر
// تيوب التسجيل نفسه** لا نسخة ثانية منه. والنسخ يسبق الفتح دائمًا: لو
// رفض الجسر النصّ لبقي منسوخًا.
async function t4OutputForShare() {
  if (t4FormReady(t4ReadForm()) && !(await t4SaveCurrentForm())) return "";
  const txt = t4BuildText(T4_ENTRIES);
  if (!txt && typeof showToast === "function") showToast("لا مخرجات لنسخها", "error", 2000);
  return txt;
}

// الجسر يرفض النصّ الطويل جدًّا (رابط واتساب له سقف)، فيُقال ذلك صراحةً
// ولا يُترك الموظف أمام زرٍّ لم يفعل شيئًا.
function t4OpenWhatsApp(txt) {
  if (typeof _openWhatsAppBridge === "function" && _openWhatsAppBridge(txt)) return;
  if (typeof showToast === "function") {
    showToast("النص أطول من حد الإرسال — الصقه يدوياً", "error", 2500);
  }
}

async function t4ShareBody(viaWhatsApp) {
  const txt = await t4OutputForShare();
  if (!txt) return false;
  t4WriteClipboard(txt);
  if (viaWhatsApp) t4OpenWhatsApp(txt);
  if (typeof showToast === "function") {
    showToast(viaWhatsApp ? "نُسخت المخرجات — جارٍ فتح واتساب" : "نُسخت المخرجات", "success", 1800);
  }
  return true;
}

async function t4CopyAction() {
  return await t4Guard(function () { return t4ShareBody(false); });
}

async function t4WhatsAppAction() {
  return await t4Guard(function () { return t4ShareBody(true); });
}
`;
}

/** الجزء 6 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart6() {
  return `
// زر «جديد»: يمسح المخرجات المشتركة كلها بعد تأكيد صريح.
// فشل المسح: يُبلَّغ السبب، وإن حُذف بعض الأسطر فما بقي في القاعدة يجب أن
// يظهر كما هو لا كما نتوقّعه، فتُعاد قراءته.
async function t4AfterFailedWipe(res) {
  t4ReportFailure("تعذّر المسح", res);
  if (res && res.deleted > 0) await t4Load();
}

async function t4NewBody() {
  if (T4_ENTRIES.length === 0) return t4NothingToWipe();
  const confirmed = (typeof fqConfirm === "function")
    ? await fqConfirm(t4WipeMessage(), "بدء مخرجات جديدة")
    : true;
  if (!confirmed) return false;
  const res = await t4DeleteAll();
  if (!res || !res.ok) { await t4AfterFailedWipe(res); return false; }
  return t4WipeDone();
}

function t4NothingToWipe() {
  if (typeof showToast === "function") showToast("المخرجات فارغة أصلًا", "info", 1800);
  return false;
}

function t4WipeMessage() {
  return "سيُحذف " + T4_ENTRIES.length +
    " سطرًا من المخرجات المشتركة، ويراه كل الموظفين فارغًا. متابعة؟";
}

// بعد نجاح المسح في القاعدة: تُفرَّغ القائمة وتُعاد الرسم ويُبلَّغ الموظف.
function t4WipeDone() {
  T4_ENTRIES = [];
  t4Render();
  if (typeof showToast === "function") showToast("بدأت مخرجات جديدة", "success", 1800);
  return true;
}

// القفل يحيط بالتأكيد أيضًا لا بالحذف وحده: نافذتا تأكيد مفتوحتان معًا
// تعنيان مسحَين متتاليَين، والثاني يعمل على قاعدة أفرغها الأول.
async function t4NewAction() {
  return await t4Guard(t4NewBody);
}
`;
}

/** الجزء 7 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart7() {
  return `
// ═══ الربط ═══
// نتيجة الفعل تُلوّن زرّه (طلب المستخدم ٢٠٢٦-٠٩-٢٦)، والتلوين هنا في
// نقطة الربط وحدها: كل زرّ في النموذجين يمرّ من هنا، فلا يُنسى زرّ ولا
// يُكرَّر سطرٌ عند كل زر. والفشل المرميّ يُلوَّن أحمر أيضًا: سقوطٌ
// بصمت مع زرٍّ لا يتغيّر هو أسوأ ما يراه الموظف.
function t4OnClickRun(el, id, handler) {
  const result = handler();
  if (!result || typeof result.then !== "function") { t4FlashValue(el, result); return; }
  result.then(function(v) { t4FlashValue(el, v); }).catch(function(e) {
    console.error("[fq_t4] " + id, e);
    t4Flash(el, false);
  });
}

function t4OnClick(id, handler) {
  const el = t4El(id);
  if (!t4Assert(el, "t4OnClick: الزر " + id + " مفقود — لن يستجيب")) return;
  el.addEventListener("click", function() { t4OnClickRun(el, id, handler); });
}

// زرّا القسم وزرّا النافذة فعلٌ واحد لا فعلان: الدالّتان نفساهما تُربطان
// بأربعة أزرار، كما في قسم نموذج T4 سواءً بسواء.
function t4BindButtons() {
  t4OnClick("t4CopyBtn", t4CopyAction);
  t4OnClick("t4WaBtn", t4WhatsAppAction);
  t4OnClick("t4SecCopyBtn", t4CopyAction);
  t4OnClick("t4SecWaBtn", t4WhatsAppAction);
  t4OnClick("t4NewBtn", t4NewAction);
  t4OnClick("t4EditBtn", t4ToggleEdit);
  t4OnClick("t4RefreshBtn", t4Load);
}
`;
}

/** الجزء 8 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart8() {
  return `
// ═══ طيّ قسم مخرجات نموذج F (طلب المستخدم ٢٠٢٦-٠٩-٢٦) ═══
// مطويٌّ عند كل فتح للتيوب لا مرّة واحدة: هذا نصّ الطلب — «اجعله مخفيًّا،
// وعند الضغط عليه يظهر». ولا يُحفظ اختياره لأنه لم يُطلب.
let T4_SEC_OPEN = false;

function t4ApplySection() {
  const sec = t4El("t4Sec");
  const hd = t4El("t4SecHd");
  if (!t4Assert(sec && hd, "t4ApplySection: عنصر من (t4Sec، t4SecHd) مفقود")) return;
  if (T4_SEC_OPEN) sec.classList.add("open");
  else sec.classList.remove("open");
  hd.setAttribute("aria-expanded", T4_SEC_OPEN ? "true" : "false");
}

function t4ToggleSection() {
  T4_SEC_OPEN = !T4_SEC_OPEN;
  t4ApplySection();
}

// زرّ التحديث داخل الرأس: نقرةٌ عليه تحدّث ولا تطوي القسم من تحت اليد.
function t4BindSection() {
  const hd = t4El("t4SecHd");
  if (!t4Assert(hd, "t4BindSection: العنصر t4SecHd مفقود")) return;
  hd.addEventListener("click", function(ev) {
    const t = ev && ev.target;
    if (t && t.closest && t.closest(".t4-refresh")) return;
    t4ToggleSection();
  });
}

function t4BindTab() {
  t4OnClick("t4Tab", function() {
    showPanel("t4Panel", "t4Tab");
    t4CloseDd();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return t4Load();
  });
}
`;
}

/** الجزء 9 من 9 من نصّ `getT4ViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4ViewCodePart9() {
  return `
// العلامة العائمة تظهر في كل التيوبات، فقد تُفتح النافذة قبل أن يُفتح
// تيوب T4 مرّة واحدة — وعندها تكون T4_ENTRIES فارغة لا لأن القاعدة
// فارغة بل لأنها لم تُقرأ بعد. ولو نُسخت حينها لخرجت مخرجات ناقصة.
// فالفتح يُحمّل أولًا إن لم يكن حُمِّل. والوحدة fq_t4_modal لا تعرف
// شيئًا من هذا: هي تفتح وتغلق، والقرار هنا حيث تُعرف حالة التحميل.
function t4BindModal() {
  t4OnClick("t4Fab", function() {
    t4OpenModal();
    if (T4_LOADED) return null;
    return t4Load();
  });
  t4OnClick("t4ModalClose", t4CloseModal);
}

// المحرّر لا يعرف من يعرض المخرجات. العارض هو من يسجّل نفسه عنده،
// فيبقى اتجاه الاعتماد نازلًا: view ← editor، بلا عودة.
t4OnEditorChange(t4Render);

// ═══ وصول السطر يمحو علامته ═══
// العلامة مشتقّة من الطابور، فلا بدّ من إعادة رسم عند كل تغيّر فيه —
// وإلا بقيت «قيد الإرسال» على سطر وصل حتى يفتح الموظف التيوب من جديد.
// والطابور هو المُعلن، وT4 يسجّل نفسه عنده: نفس اتجاه t4OnEditorChange.
if (typeof fqOnQueueChange === "function") fqOnQueueChange(t4Render);

t4BindForm();
t4BindEditor();
t4BindButtons();
t4BindSection();
t4BindTab();
t4BindModal();
t4Render();
`;
}

module.exports = Object.freeze({ getT4ViewCode });
