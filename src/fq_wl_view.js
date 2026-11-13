// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: eye;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_wl_view.js

/**
 * @module fq_wl_view
 * @description المسؤولية الواحدة: ربط قسم نموذج T4 — عرض مخرجاته، وأفعال
 * أزراره (نسخ، إرسال إلى واتساب، تعديل، جديد)، وفتح نافذته.
 *
 * يجمع بين الوحدات ولا يكرّر منطقها: النص من `fq_wl_text`، والقاعدة من
 * `fq_wl_store`، والنموذج من `fq_wl_form`، والتعديل من `fq_wl_editor`،
 * والإبلاغ والقفل والحافظة من وحدات نموذج F المشتركة.
 *
 * هذه أعلى وحدات النموذج: تستدعي ما تحتها ولا يستدعيها شيء.
 *
 * **ولا يُلمس `fq_t4_view`**: تحميل هذا القسم عند فتح التيوب يُربط هنا
 * بمستمع ثانٍ على زرّ التيوب نفسه. ولو نُودي `wlLoad` من هناك لصار نموذج
 * F يعرف نموذج T4 ويعتمد عليه، وانقلب اتجاه الاعتماد.
 */

// الإيقاع من الإعدادات نفسها التي تدقّ بها عدّادات الجداول، لا رقمًا
// مكرَّرًا هنا. وهو يُحقن وقت البناء: الاسم ليس متغيّرًا عامًّا في الصفحة.
const wlCfg = importModule("fq_config");

/**
 * يبني شيفرة الصفحة التي تربط نموذج T4 وتعرض مخرجاته.
 * @returns {string} نص JavaScript يعمل داخل الصفحة
 */
function getWlViewCode() {
  return getWlViewCodePart1() +
    getWlViewCodePart2() +
    getWlViewCodePart3() +
    getWlViewCodePart4() +
    getWlViewCodePart5() +
    getWlViewCodePart6() +
    getWlViewCodePart7() +
    getWlViewCodePart8() +
    getWlViewCodePart9() +
    getWlViewCodePart10();
}

/** الجزء 1 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart1() {
  return `
// ═══ T4: الحالة المعروضة ═══
let WL_ENTRIES = [];
let WL_LOADED = false;
let WL_EDITING = false;

// ═══ العرض ═══
function wlPendingNote() {
  const waiting = wlPendingCount();
  if (waiting <= 0) return "";
  return " · " + waiting + " قيد الإرسال";
}

function wlRenderMeta() {
  const meta = t4El("wlMeta");
  if (!t4Assert(meta, "wlRenderMeta: العنصر wlMeta مفقود")) return;
  if (!WL_LOADED) { meta.textContent = "جارٍ التحميل…"; return; }
  meta.textContent = WL_ENTRIES.length + " سطرًا" + wlPendingNote();
}

// ═══ الالتفاف عند الفاصل وحده، لا داخل الاختصار ═══
// الصندوق أضيق من السطر فيلتفّ، وكان يلتفّ داخل الاختصار نفسه فيصير
// BUS HLD 0 سطرين: BUS ثم HLD 0 (طلب المستخدم ٢٠٢٦-٠٩-٢٦ أن يبقى واحدًا).
// فكل مقطع بين فاصلين يُلفّ في عنصر لا يُكسر، فلا يجد المتصفح موضعًا
// للالتفاف إلا الفاصل. **والنصّ المنسوخ لا يُمسّ**: هذا عرضٌ لا بناء،
// والحافظة تأخذ مخرجات wlBuildText نفسها بمسافاتها العادية.
function wlNoWrapLine(line) {
  const parts = line.split(" | ");
  for (let i = 0; i < parts.length; i++) {
    const mark = parts[i].indexOf("TTD ") === 0 ? ' data-ttd="1"' : "";
    parts[i] = '<span class="t4-nw"' + mark + ">" + t4Esc(parts[i]) + "</span>";
  }
  return parts.join(" | ");
}

function wlOutputHtml(txt) {
  const lines = txt.split("\\n");
  for (let i = 0; i < lines.length; i++) lines[i] = wlNoWrapLine(lines[i]);
  return lines.join("\\n");
}
`;
}

/** الجزء 2 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart2() {
  return `
// ═══ كل سطر عنوان يبقى سطرًا واحدًا (طلب المستخدم ٢٠٢٦-٠٩-٢٦) ═══
// منعُ الكسر داخل الاختصار وحده لم يكفِ: بقي الفاصل موضعًا للالتفاف فتصير
// الأسطر الثلاثة أربعة. فالصندوق لا يلتفّ أصلًا (white-space:pre في الأنماط)،
// والخط يصغر بقدر ما يلزم ليتّسع أطول سطر، بحدٍّ أدنى يبقى مقروءًا.
// وهو عرضٌ لا بناء: النصّ المنسوخ لا يتأثّر بحجم الخط.
const WL_FONT_MAX = 14;
const WL_FONT_MIN = 8;

function wlFitOutput(out) {
  if (!out || !out.style || typeof out.clientWidth !== "number") return;
  // لوحة مخفية عرضها صفر: القياس كاذب فيُنزل الخط إلى الحدّ الأدنى. يُؤجَّل
  // إلى أن تظهر — والتحميل عند فتح التيوب يعيد الرسم فيُقاس حينها.
  if (out.clientWidth === 0) return;
  let size = WL_FONT_MAX;
  out.style.fontSize = size + "px";
  while (out.scrollWidth > out.clientWidth && size > WL_FONT_MIN) {
    size -= 0.5;
    out.style.fontSize = size + "px";
  }
}
`;
}

/** الجزء 3 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart3() {
  return `
// ═══ عدّاد TTD حيّ لا رقم مجمَّد (طلب المستخدم ٢٠٢٦-٠٩-٢٦) ═══
// كالعدّادات التي بجانب كل رحلة في الجداول، وبالإيقاع نفسه. ولا يُعاد
// بناء الصندوق كل ثانية: يُكتب نصّ مقاطع TTD وحدها، فلا ترتعش الشاشة
// ولا يُعاد قياس الخط بلا داع. والمقطع الترتيبي n يخصّ الرحلة n لأن
// الاثنين من wlGroupEntries نفسها وبترتيبها؛ فإن اختلف العددان تُرك
// التحديث إلى إعادة الرسم القادمة ولا يُكتب رقمٌ في غير موضعه.
// المقطع الترتيبي n يخصّ الرحلة n لأن الاثنين من wlGroupEntries نفسها
// وبترتيبها؛ فإن اختلف العددان تُرك التحديث إلى إعادة الرسم القادمة ولا
// يُكتب رقمٌ في غير موضعه.
function wlTtdTargets(out) {
  const spans = out.querySelectorAll("[data-ttd]");
  const groups = wlGroupEntries(WL_ENTRIES);
  if (spans.length === 0 || spans.length !== groups.length) return null;
  return { spans: spans, groups: groups };
}

// يُرجع: هل تغيّر عرض النصّ؟ فالخط لا يُعاد قياسه إلا عند تغيّر العرض.
function wlWriteTtd(span, group) {
  const txt = "TTD " + wlTtd(group.dof, group.std);
  if (span.textContent === txt) return false;
  const wider = span.textContent.length !== txt.length;
  span.textContent = txt;
  return wider;
}

function wlTickTtd() {
  const out = t4El("wlOut");
  if (!out || !out.querySelectorAll) return;
  const t = wlTtdTargets(out);
  if (!t) return;
  let wider = false;
  for (let i = 0; i < t.spans.length; i++) {
    if (wlWriteTtd(t.spans[i], t.groups[i])) wider = true;
  }
  if (wider) wlFitOutput(out);
}

function wlRenderOutput() {
  const out = t4El("wlOut");
  if (!t4Assert(out, "wlRenderOutput: العنصر wlOut مفقود")) return;
  const txt = wlBuildText(WL_ENTRIES);
  if (txt) out.innerHTML = wlOutputHtml(txt);
  else out.innerHTML = '<span class="t4-empty">لا مخرجات بعد.</span>';
  wlFitOutput(out);`;
}

/** الجزء 4 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart4() {
  return `
}

function wlRender() {
  wlRenderOutput();
  wlRenderMeta();
  if (WL_EDITING) wlRenderEditor();
}

// ═══ المخرجات والمحرّر — موضع واحد لا قسمان ═══
// العنصران متجاوران في البنية وواحد منهما يظهر: النص أو الحقول. والزر
// نفسه هو مخرج العودة: «تعديل» ← «تمّ».
function wlApplyEditMode() {
  const out = t4El("wlOut");
  const editor = t4El("wlEditor");
  const btn = t4El("wlEditBtn");
  if (!t4Assert(out && editor && btn,
    "wlApplyEditMode: عنصر من (wlOut، wlEditor، wlEditBtn) مفقود")) return;
  // سلسلة فارغة لا "block": تعيد <pre> إلى عرضه الأصلي من الأنماط.
  out.style.display = WL_EDITING ? "none" : "";
  editor.style.display = WL_EDITING ? "block" : "none";
  // الاسم في عنصره لا في الزر كلّه: الزر يحمل أيقونة بعد توحيد الشكل.
  t4BtnLabel(btn, WL_EDITING ? "تمّ" : "تعديل");
  if (WL_EDITING) wlRenderEditor();
}
`;
}

/** الجزء 5 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart5() {
  return `
// ═══ «تمّ» يحفظ قبل أن يقفل (طلب المستخدم ٢٠٢٦-٠٩-٢٧) ═══
// الفتح لا نتيجة له تُعلَن، فلا يُرجع صوابًا ولا خطأً ولا يُلوَّن زرّه.
// أمّا الإغلاق فيكتب في القاعدة: فإن أخفق بقيت اللوحة مفتوحة واحمرّ
// الزر، ولا يُقال «تمّ» على عملٍ لم يتمّ.
async function wlToggleEdit() {
  if (!WL_EDITING) { WL_EDITING = true; wlApplyEditMode(); return null; }
  const ok = await t4Guard(wlSaveAllEdits);
  if (!ok) return false;
  WL_EDITING = false;
  wlApplyEditMode();
  return true;
}

async function wlLoad() {
  const res = await wlFetchAll();
  WL_LOADED = true;
  if (!res.ok) { t4ReportFailure("تعذّر تحميل مخرجات T4", res); wlRender(); return false; }
  WL_ENTRIES = res.entries;
  wlRender();
  return true;
}

// ═══ الحفظ ═══`;
}

/** الجزء 6 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart6() {
  return `
// ═══ recordedByEmpId شرطٌ في قواعد الأمان لا حقلٌ للزينة ═══
// قُرئت قواعد القاعدة الحيّة في ٢٠٢٦-٠٩-٢٦ (نسختها في
// docs/قواعد-الأمان-القاعدة-الرئيسة.md). وشرط الكتابة تحت
// reg_data/<قسم>/<سطر> لمن ليس مطوّرًا ولا مشرفًا هو أن يساوي هذا الحقل
// رقمَ الموظف الكاتب. فالسطر الذي لا يحمله **ترفضه القاعدة** ويرى الموظف
// «رفض صلاحية». والعطل لا يظهر للمطوّر أبدًا لأن شرطه يمرّ بفرعٍ آخر.
// والاسم ليس اختيارًا منّي: هو الاسم الذي يكتبه تيوب التسجيل نفسه على
// المسار الأخ (fq_firebase_reg و fq_reg_copy)، ولأجله كُتبت القاعدة.
function wlBuildEntry(form) {
  const author = t4Author();
  return {
    dof: form.dof, flt: form.flt, std: form.std, dest: form.dest,
    pax: form.pax, ind: form.ind, sts: form.sts,
    by: author.by, byEmpId: author.byEmpId,
    recordedByEmpId: author.byEmpId,
    at: new Date().toISOString()
  };
}

// النموذج الناقص يُفقَد بلا أثر لولا هذه الرسالة، فهي ليست تزيينًا.
function wlWarnIncomplete() {
  if (typeof showToast === "function") {
    showToast("النموذج فارغ — اكتب حقلًا واحدًا على الأقل", "error", 2800);
  }
  return false;
}

// لا يُستدعى إلا بعد وصول السطر إلى القاعدة: الشاشة تتبع القاعدة لا العكس.
// ونسخةٌ جديدة لا تعديلٌ على الوسيط، فالمفتاح للعرض ولا يُرسَل في الحمولة.
function wlCommitSaved(entry, key) {
  WL_ENTRIES.push(Object.assign({}, entry, { _key: key }));
  wlResetAfterSave();
  wlRender();
}

async function wlSaveCurrentForm() {
  const form = wlReadForm();
  if (!wlFormReady(form)) return wlWarnIncomplete();
  const entry = wlBuildEntry(form);
  const key = t4NewKey();
  const res = await wlPutEntry(key, entry);
  if (!res || !res.ok) { t4ReportFailure("تعذّر الحفظ", res); return false; }
  wlCommitSaved(entry, key);
  return true;`;
}

/** الجزء 7 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart7() {
  return `
}

// ═══ «نسخ» و«إرسال إلى واتساب»: خطوات واحدة وآخرها يختلف ═══
// كلاهما يحفظ الإدخال الحالي إن كان مكتملًا، ثم ينسخ مخرجات هذا القسم
// وحدها. والواتساب يزيد فتحَ التطبيق بالنص نفسه. وآليات النسخ الثلاث في
// t4WriteClipboard، وجسر الواتساب هو جسر تيوب التسجيل نفسه — لا نسخة ثانية
// من أيٍّ منهما. والنسخ يسبق الفتح دائمًا: لو رفض الجسر النصّ لبقي منسوخًا.
async function wlOutputForShare() {
  if (wlFormReady(wlReadForm()) && !(await wlSaveCurrentForm())) return "";
  const txt = wlBuildText(WL_ENTRIES);
  if (!txt && typeof showToast === "function") showToast("لا مخرجات لنسخها", "error", 2000);
  return txt;
}

// الجسر يرفض النصّ الطويل جدًّا (رابط واتساب له سقف)، فيُقال ذلك صراحةً
// ولا يُترك الموظف أمام زرٍّ لم يفعل شيئًا.
function wlOpenWhatsApp(txt) {
  if (typeof _openWhatsAppBridge === "function" && _openWhatsAppBridge(txt)) return;
  if (typeof showToast === "function") {
    showToast("النص أطول من حد الإرسال — الصقه يدوياً", "error", 2500);
  }
}

async function wlShareBody(viaWhatsApp) {
  const txt = await wlOutputForShare();
  if (!txt) return false;
  t4WriteClipboard(txt);
  if (viaWhatsApp) wlOpenWhatsApp(txt);
  if (typeof showToast === "function") {
    showToast(viaWhatsApp ? "نُسخت المخرجات — جارٍ فتح واتساب" : "نُسخت المخرجات", "success", 1800);
  }
  return true;
}

async function wlCopyAction() {
  return await t4Guard(function () { return wlShareBody(false); });
}

async function wlWhatsAppAction() {
  return await t4Guard(function () { return wlShareBody(true); });
}
`;
}

/** الجزء 8 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart8() {
  return `
// ═══ «جديد»: يمسح مخرجات هذا القسم وحدها ═══
// فشل المسح: يُبلَّغ السبب، وإن حُذف بعض الأسطر فما بقي في القاعدة يجب أن
// يظهر كما هو لا كما نتوقّعه، فتُعاد قراءته.
async function wlAfterFailedWipe(res) {
  t4ReportFailure("تعذّر المسح", res);
  if (res && res.deleted > 0) await wlLoad();
}

function wlNoteEmpty() {
  if (typeof showToast === "function") showToast("المخرجات فارغة أصلًا", "info", 1800);
  return false;
}

// نصّ السؤال يذكر العدد ومن يراه: المسح يقع على مخرجات الجميع لا على
// نسخةٍ في هذا الجهاز. وغياب نافذة التأكيد لا يمنع المسح بل يمضي فيه.
async function wlConfirmWipe() {
  if (typeof fqConfirm !== "function") return true;
  return await fqConfirm(
    "سيُحذف " + WL_ENTRIES.length +
    " سطرًا من مخرجات نموذج T4، ويراه كل الموظفين فارغًا. متابعة؟",
    "بدء مخرجات جديدة");
}

function wlAfterWipe() {
  WL_ENTRIES = [];
  wlRender();
  if (typeof showToast === "function") showToast("بدأت مخرجات جديدة", "success", 1800);
}

async function wlNewBody() {
  if (WL_ENTRIES.length === 0) return wlNoteEmpty();
  if (!(await wlConfirmWipe())) return false;
  const res = await wlDeleteAll();
  if (!res || !res.ok) { await wlAfterFailedWipe(res); return false; }
  wlAfterWipe();
  return true;
}

// القفل يحيط بالتأكيد أيضًا لا بالحذف وحده: نافذتا تأكيد مفتوحتان معًا
// تعنيان مسحَين متتاليَين، والثاني يعمل على قاعدة أفرغها الأول.
async function wlNewAction() {
  return await t4Guard(wlNewBody);
}
`;
}

/** الجزء 9 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart9() {
  return `
// ═══ الربط ═══
// زرّا القسم وزرّا النافذة فعلٌ واحد لا فعلان (اختيار المستخدم
// ٢٠٢٦-٠٩-٢٦ حين سُئل): «نفس عمل زرّي النافذة» — يُحفظ المكتوب في
// النافذة إن كان فيها إدخال، ثم تُنسخ المخرجات كاملة. فالدالة واحدة
// تُربط بزرّين، ولا نسخة ثانية من المنطق.
function wlBindButtons() {
  t4OnClick("wlCopyBtn", wlCopyAction);
  t4OnClick("wlWaBtn", wlWhatsAppAction);
  t4OnClick("wlSecCopyBtn", wlCopyAction);
  t4OnClick("wlSecWaBtn", wlWhatsAppAction);
  window.addEventListener("resize", function() { wlFitOutput(t4El("wlOut")); });
  setInterval(wlTickTtd, ${wlCfg.COUNTDOWN_INTERVAL_MS});
  t4OnClick("wlNewBtn", wlNewAction);
  t4OnClick("wlEditBtn", wlToggleEdit);
  t4OnClick("wlRefreshBtn", wlLoad);
}

// العلامة العائمة تظهر في كل التيوبات، فقد تُفتح النافذة قبل أن يُفتح
// تيوب T4 مرّة واحدة — وعندها تكون WL_ENTRIES فارغة لا لأن القاعدة فارغة
// بل لأنها لم تُقرأ بعد. ولو نُسخت حينها لخرجت مخرجات ناقصة.
function wlBindModal() {
  t4OnClick("wlFab", function() {
    wlOpenModal();
    if (WL_LOADED) return null;
    return wlLoad();
  });
  t4OnClick("wlModalClose", wlCloseModal);
}

// مستمع ثانٍ على زرّ التيوب نفسه: فتح التيوب يحمّل القسمين معًا، ويبقى
// اتجاه الاعتماد نازلًا لأن fq_t4_view لا يعرف هذه الوحدة ولا يناديها.
function wlBindTab() {
  t4OnClick("t4Tab", wlLoad);
}

wlOnEditorChange(wlRender);

// وصول السطر يمحو علامته: العلامة مشتقّة من الطابور، فلا بدّ من إعادة
// رسم عند كل تغيّر فيه — وإلا بقيت «قيد الإرسال» على سطر وصل.
if (typeof fqOnQueueChange === "function") fqOnQueueChange(wlRender);

wlBindForm();
wlBindEditor();
wlBindButtons();
wlBindTab();`;
}

/** الجزء 10 من 10 من نصّ `getWlViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlViewCodePart10() {
  return `
wlBindModal();
wlRender();
`;
}

module.exports = Object.freeze({ getWlViewCode });
