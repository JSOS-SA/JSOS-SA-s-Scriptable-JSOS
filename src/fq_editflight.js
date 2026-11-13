// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: edit;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_editflight.js

// ═══ نموذج تعديل رحلة — يُفتح بالضغط المطوّل على بطاقة جداول، أو على صفّ صالة أو بطاقة في تيوب كايا ═══

const statusEnum = importModule("fq_enum_status");

/**
 * يبني بنية نافذة تعديل الرحلة.
 * @returns {string} نص HTML للنافذة
 */
function getEditFlightHtml() {
  return getEditFlightHtmlPart1() +
    getEditFlightHtmlPart2();
}

/** الجزء 1 من 2 من نصّ `getEditFlightHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightHtmlPart1() {
  return `
<div class="ef-overlay" id="efOverlay">
  <div class="ef-modal">
    <div class="ef-hdr">
      <span>تعديل بيانات الرحلة</span>
      <button class="ef-close" id="efClose">&times;</button>
    </div>
    <div class="ef-body">
      <div class="ef-row">
        <div class="ef-field">
          <label>رمز الناقل</label>
          <input type="text" id="efAl" dir="ltr" maxlength="3">
        </div>
        <div class="ef-field">
          <label>رقم الرحلة</label>
          <input type="text" id="efFlt" dir="ltr">
        </div>
      </div>
      <div class="ef-row">
        <div class="ef-field">
          <label>وقت الإقلاع</label>
          <input type="time" id="efStd" dir="ltr">
        </div>
        <div class="ef-field">
          <label>الوجهة (IATA)</label>
          <input type="text" id="efTo" dir="ltr" maxlength="3">
        </div>
      </div>
      <div class="ef-row">
        <div class="ef-field">
          <label>النوع</label>
          <input type="text" id="efType" dir="ltr">
        </div>
        <div class="ef-field">
          <label>عدد الركاب</label>
          <input type="number" id="efDpax" dir="ltr">
        </div>
      </div>
      <div class="ef-row">
        <div class="ef-field ef-field-wide">
          <label>التاريخ</label>
          <input type="date" id="efDate" dir="ltr">
        </div>
      </div>
      <div class="ef-row">
        <div class="ef-field ef-field-wide">`;
}

/** الجزء 2 من 2 من نصّ `getEditFlightHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightHtmlPart2() {
  return `
          <label>الحالة</label>
          <select id="efStatus">
            <option value="">— بدون تغيير —</option>
${statusEnum.buildStatusOptions(["rescheduled", "canceled", "departed"])}
          </select>
        </div>
      </div>
    </div>
    <div class="ef-foot">
      <button class="ef-btn ef-cancel" id="efCancel">إلغاء</button>
      <button class="ef-btn ef-save" id="efSave">حفظ التعديل</button>
    </div>
  </div>
</div>
`;
}

/**
 * يبني أنماط نافذة تعديل الرحلة.
 * @returns {string} نص CSS
 */
function getEditFlightStyles() {
  return getEditFlightStylesPart1() +
    getEditFlightStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getEditFlightStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightStylesPart1() {
  return `
/* ═══ نافذة تعديل الرحلة ═══ */
.ef-overlay{
  display:none;position:fixed;inset:0;
  background:rgba(255,255,255,0.85);z-index:9998;
  align-items:center;justify-content:center;
  padding:16px;backdrop-filter:blur(4px);
}
.ef-overlay.open{display:flex}
.ef-modal{
  background:#fff;border:1px solid rgba(0,0,0,0.05);
  border-radius:16px;width:100%;max-width:480px;
  max-height:85vh;overflow:hidden;display:flex;flex-direction:column;
  box-shadow:0 20px 60px rgba(0,0,0,0.6);
}
.ef-hdr{
  display:flex;justify-content:space-between;align-items:center;
  padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.05);
  font-family:Tajawal,sans-serif;font-size:16px;font-weight:700;color:#1a1a1a;
}
.ef-close{
  background:none;border:none;color:#666666;
  font-size:26px;cursor:pointer;width:32px;height:32px;
  display:flex;align-items:center;justify-content:center;
  border-radius:8px;
}
.ef-close:active{background:rgba(0,0,0,0.05)}
.ef-body{padding:16px;overflow-y:auto;flex:1}
.ef-row{display:flex;gap:10px;margin-bottom:10px}
.ef-field{flex:1;display:flex;flex-direction:column;gap:5px}
.ef-field-wide{width:100%}
.ef-field label{
  font-size:11px;color:#666666;font-weight:600;
  font-family:Tajawal,sans-serif;
}
.ef-field input, .ef-field select{
  padding:10px 12px;background:#fafafa;color:#1a1a1a;
  border:1px solid rgba(0,0,0,0.06);border-radius:8px;
  font-family:'IBM Plex Mono',monospace;font-size:14px;
  outline:none;-webkit-appearance:none;
}
.ef-field input:focus, .ef-field select:focus{border-color:#2563eb}
.ef-foot{
  display:flex;gap:10px;padding:14px 18px;
  border-top:1px solid rgba(0,0,0,0.05);
}`;
}

/** الجزء 2 من 2 من نصّ `getEditFlightStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightStylesPart2() {
  return `
.ef-btn{
  flex:1;padding:12px;border:none;border-radius:10px;
  font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;
  cursor:pointer;transition:all 0.15s;
}
.ef-btn:active{transform:scale(0.97)}
.ef-cancel{background:#fafafa;color:#1a1a1a}
.ef-save{background:#2563eb;color:#1a1a1a}
.ef-save:disabled{opacity:0.5}
`;
}

/**
 * يبني شيفرة الصفحة التي تشغّل نافذة تعديل الرحلة.
 * @returns {string} نص JavaScript يعمل داخل الصفحة
 */
function getEditFlightCode() {
  return getEditFlightCodePart1() +
    getEditFlightCodePart2() +
    getEditFlightCodePart3() +
    getEditFlightCodePart4() +
    getEditFlightCodePart5() +
    getEditFlightCodePart6() +
    getEditFlightCodePart7() +
    getEditFlightCodePart8() +
    getEditFlightCodePart9() +
    getEditFlightCodePart10() +
    getEditFlightCodePart11() +
    getEditFlightCodePart12();
}

/** الجزء 1 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart1() {
  return `
// ═══ تعديل رحلة — نافذة منبثقة ═══
let efOverlay = document.getElementById("efOverlay");
let efClose = document.getElementById("efClose");
let efCancel = document.getElementById("efCancel");
let efSave = document.getElementById("efSave");
let efAl = document.getElementById("efAl");
let efFlt = document.getElementById("efFlt");
let efStd = document.getElementById("efStd");
let efTo = document.getElementById("efTo");
let efType = document.getElementById("efType");
let efDpax = document.getElementById("efDpax");
let efDate = document.getElementById("efDate");
let efStatus = document.getElementById("efStatus");
let _efCurrentFlight = null;
let _efCurrentIdx = -1;

`;
}

/** الجزء 2 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart2() {
  return `
// حقول هوية الرحلة: الشركة والرقم والإقلاع
function _efFillIdentity(flight) {
  if (efAl) efAl.value = flight.al || "";
  const fltOnly = (flight.flt || "").replace(flight.al || "", "");
  if (efFlt) efFlt.value = fltOnly;
  if (efStd) efStd.value = flight.std || "";
}

// حقول التفاصيل: الوجهة والنوع والركاب والتاريخ والحالة
function _efFillDetails(flight) {
  if (efTo) efTo.value = flight.to || "";
  if (efType) efType.value = flight.type || "";
  if (efDpax) efDpax.value = flight.dpax || "";
  if (efDate) efDate.value = flight.date || "";
  if (efStatus) efStatus.value = "";
}

function openEditFlight(flight, idx) {
  if (typeof can === "function" && !can("edit_flight")) {
    if (typeof showToast === "function")
      showToast("لا تملك صلاحية التعديل", "error");
    return;
  }
  _efCurrentFlight = flight;
  _efCurrentIdx = idx;
  _efFillIdentity(flight);
  _efFillDetails(flight);
  efOverlay.classList.add("open");
}

function closeEditFlight() {
  efOverlay.classList.remove("open");
  _efCurrentFlight = null;
  _efCurrentIdx = -1;
}

if (efClose) efClose.addEventListener("click", closeEditFlight);
if (efCancel) efCancel.addEventListener("click", closeEditFlight);`;
}

/** الجزء 3 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart3() {
  return `
if (efOverlay) efOverlay.addEventListener("click", function(e){
  if (e.target === efOverlay) closeEditFlight();
});

// ═══ مفتاح الكتابة: النقل لمن يملك الحذف وحده ═══
// من يملك حذف الرحلات ينقل السجلّ إلى مفتاحه المحسوب ويحذف القديم. ومن لا
// يملكه يُبقيه تحت مفتاحه المخزَّن ويغيّر محتواه: قواعد عقد الرحلات ترفض
// حذفه، فكان النقل يكتب الجديد ويُرفض حذف القديم فيبقى في القاعدة سجلّان.
// قرار المالك ٢٠٢٦-٠٩-٢٨ في كل حفظ رحلات (fqKeepStoredKey في fq_helpers).
function _efCanMove() {
  return typeof can === "function" && can("delete_flight");
}
function _efWriteKey(f) {
  if (_efCanMove()) return fqFlightKey(f);
  const taken = {};
  for (let ti = 0; ti < DATA.length; ti++) {
    if (ti !== _efCurrentIdx) taken[fqFlightKey(DATA[ti])] = true;
  }
  return fqKeepStoredKey(f, taken);
}
`;
}

/** الجزء 4 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart4() {
  return `
// ═══ إشعار إن وُجدت showToast ═══
function _efNotify(msg, kind) {
  if (typeof showToast === "function") showToast(msg, kind);
}

// ═══ قراءة حقول النموذج ═══
function _efReadForm() {
  const al = (efAl.value || "").trim().toUpperCase();
  const fltNum = (efFlt.value || "").trim();
  return {
    al: al,
    flt: al + fltNum.replace(new RegExp("^" + al), ""),
    std: (efStd.value || "").trim(),
    to: (efTo.value || "").trim().toUpperCase(),
    type: (efType.value || "").trim(),
    dpax: (efDpax.value || "").trim(),
    date: (efDate.value || "").trim(),
    statusChange: (efStatus.value || "").trim()
  };
}

// ═══ رفض النموذج الناقص: يُرجع true بعد الإشعار ═══
function _efRejectIncomplete(form) {
  if (form.al && form.flt && form.std && form.to && form.date) return false;
  if (typeof hideLoadingToast === "function") hideLoadingToast();
  _efNotify("أكمل الحقول الأساسية", "error");
  return true;
}

// ═══ بناء depTime جديد ═══
function _efDepTime(form) {
  const tp = form.std.split(":");
  const dd = new Date(form.date + "T00:00:00");
  dd.setHours(parseInt(tp[0]||"0"), parseInt(tp[1]||"0"), 0, 0);
  return dd;
}
`;
}

/** الجزء 5 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart5() {
  return `
// ═══ الرحلة المعدَّلة محليًا ═══
function _efUpdatedFlight(form, old) {
  const dd = _efDepTime(form);
  return {
    al: form.al, flt: form.flt, to: form.to, std: form.std,
    type: form.type, dpax: form.dpax, date: form.date,
    depTime: dd,
    fileId: old.fileId,
    _fbKey: old._fbKey,
    // الصالة تُحمل وإلا صارت رحلة الصالة رحلةَ جداول في الذاكرة: تختفي من
    // قسمها في تيوب كايا، ويكتبها الحفظ عند الإغلاق في عقدة الجداول.
    terminal: (old && old.terminal) || "",
    _src: FQ_MANUAL_EDIT_SRC,
    // عقد القائمة: خيار «— بدون تغيير —» يعني الإبقاء على الحالة القديمة.
    // السلسلة القديمة كانت تدوس هذا الحساب بفرع else يفرض rescheduled دائمًا،
    // فتتحول رحلة ملغية إلى «معاد جدولتها» بمجرد الحفظ بلا لمس القائمة.
    _status: form.statusChange || (old._status || "rescheduled")
  };
}

// ═══ سياق الحفظ: الشكل والمعدَّلة والمفتاحان ═══
// لا تعديل محليًا قبل نجاح الكتابة — التعديل المبكر كان يجعل الشاشة
// تعرض ما لا تعرفه القاعدة عند فشل الشبكة، فيتباعد المعروض عن المخزون.
// والصالة تُورَّث من الرحلة الأصلية: تعديل رحلة صالة يبقيها في صالتها.
function _efPrepare(form) {
  const old = DATA[_efCurrentIdx];
  const updated = _efUpdatedFlight(form, old);
  const newKey = _efWriteKey({date:form.date, flt:form.flt, std:form.std, terminal:updated.terminal, _fbKey:old._fbKey});
  return { form: form, updated: updated, oldKey: old._fbKey, newKey: newKey };
}

// ═══ الحمولة المكتوبة في فايربيس ═══
function _efPayload(updated) {
  return {
    al: updated.al, flt: updated.flt, to: updated.to, std: updated.std,
    type: updated.type, dpax: updated.dpax, date: updated.date,
    depTime: updated.depTime.toISOString(),
    terminal: updated.terminal,
    src: FQ_MANUAL_EDIT_SRC,
    status: updated._status,
    updatedBy: FB_USER, updatedByRole: FB_ROLE,
    updatedByEmpId: FB_EMP_ID,
    updatedAt: new Date().toISOString()
  };
}
`;
}

/** الجزء 6 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart6() {
  return `
// ═══ كتابة الجديد ثم حذف القديم — سلسلة مرتبطة ═══
// تعديلٌ يغيّر رقم الرحلة أو وقتها أو تاريخها يغيّر مفتاحها، فيلزم
// كتابةٌ تحت المفتاح الجديد ثم حذفٌ للقديم. وقرار المستخدم
// ٢٠٢٦-٠٩-٢٥: الاثنان في الطابور **مربوطَين** — الحذف لا يُرسل
// البتّة قبل وصول الكتابة، ويُسقط معها إن سقطت. وإلا لأمكن أن تُعزل
// الكتابة ويمضي الحذف **فتختفي الرحلة**.
// وتعديلٌ لا يغيّر المفتاح لا حذف فيه أصلًا، فسلسلة من عنصر واحد.
function _efWrites(ctx, payload) {
  const writes = [{
    path: "/" + fqFlightNodeOfKey(ctx.newKey) + "/" + ctx.newKey + ".json", method: "PUT", body: payload,
    kind: "flight", label: "تعديل رحلة " + ctx.form.flt
  }];
  // مفتاح قديم بلا بادئة مصدر لا عقدة له، فلا يُرسل له حذف إلى مسار مخمَّن.
  // ومن لا يملك الحذف لا يُرسل له حذفٌ مرفوض سلفًا.
  if (_efCanMove() && ctx.oldKey && ctx.oldKey !== ctx.newKey && fqFlightNodeOfKey(ctx.oldKey)) {
    writes.push({
      path: "/" + fqFlightNodeOfKey(ctx.oldKey) + "/" + ctx.oldKey + ".json", method: "DELETE", body: null,
      kind: "flight", label: "حذف مفتاح قديم " + ctx.form.flt
    });
  }
  return writes;
}

// done تقول كم مضى فعلًا. صفرٌ يعني أن الكتابة نفسها أخفقت فلم
// يتغيّر شيء. أمّا فشلٌ بعدها (تعذّر حذف المفتاح القديم) فالرحلة
// مكتوبة تحت مفتاحها الجديد، وقولُ «لم يتغيّر شيء» حينها كذب يترك
// الشاشة تخالف المخزون — وهو سلوك ما قبل الطابور: تحذير لا توقّف.
function _efTotalFailure(res) {
  if (res.ok || res.done !== 0) return false;
  _efNotify("فشل الحفظ — لم يتغيّر شيء: " + (res.error || ""), "error");
  return true;
}

// ═══ تحذيرات المزامنة بعد الكتابة ═══
function _efSaveWarnings(res) {
  const syncWarnings = [];
  if (!res.ok) {
    syncWarnings.push("تعذر حذف المفتاح القديم");
    console.warn("[fq_editflight] old key: " + res.error);
  }
  if (res.queued) syncWarnings.push("قيد الإرسال — لم يصل القاعدة بعد");
  return syncWarnings;
}

`;
}

/** الجزء 7 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart7() {
  return `
// ═══ طلب مؤشر المزامنة ═══
// المؤشر الزمني خارج الطابور: طابع «آخر تحديث» يُعاد بعد دقائق
// يكتب فوق أحدث منه (قرار المستخدم ٢٠٢٦-٠٩-٢٥).
function _efMetaRequest() {
  return {
    path: "/flights_meta.json", method: "PATCH", timeoutMs: 10000,
    body: { lastUpdateBy: FB_USER, lastUpdateAt: new Date().toISOString() }
  };
}

function _efMetaWarn(metaRes, warnings) {
  if (metaRes.ok) return;
  warnings.push("تعذر تحديث مؤشر المزامنة");
  console.warn("[fq_editflight] meta: " + metaRes.error);
}
`;
}

/** الجزء 8 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart8() {
  return `
// ═══ إشعار التعديل وسجلّ التدقيق ═══
function _efNotifyEdited(ctx) {
  const f = ctx.form;
  if (typeof fbPushNotif === "function") {
    fbPushNotif({ type: "flight_edited", title: "تعديل رحلة",
      details: f.flt + " | " + f.std + " | " + f.to,
      flightInfo: {flt: f.flt, dest: f.to, std: f.std, date: f.date, type: f.type} });
  }
  if (typeof auditLog === "function") {
    auditLog("edit_flight", f.flt + " " + f.to, ctx.newKey);
  }
}

function _efRefreshAll() {
  if (typeof refreshUI === "function") refreshUI();
  // قوائم الصالات في تيوب كايا لا يرسمها refreshUI
  if (typeof hallRenderAll === "function") hallRenderAll();
  if (typeof updateStats === "function") updateStats();
}

function _efDoneToast(warnings) {
  if (typeof showToast !== "function") return;
  if (warnings.length > 0) {
    showToast("حُفظ التعديل؛ " + warnings.join("، "), "error", 4500);
  } else {
    showToast("تم حفظ التعديل بنجاح", "success");
  }
}

`;
}

/** الجزء 9 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart9() {
  return `
// الكتابة نجحت — الآن فقط يُعدَّل المعروض ليطابق المخزون
function _efFinish(ctx, warnings) {
  ctx.updated._fbKey = ctx.newKey;
  DATA[_efCurrentIdx] = ctx.updated;
  _efNotifyEdited(ctx);
  _efRefreshAll();
  _efDoneToast(warnings);
  closeEditFlight();
}

async function _efCommit(ctx) {
  const payload = _efPayload(ctx.updated);
  const saveResult = await fqSendOrQueueChain(_efWrites(ctx, payload));
  if (_efTotalFailure(saveResult)) return;
  const syncWarnings = _efSaveWarnings(saveResult);
  const metaRes = await fqRequest(_efMetaRequest());
  _efMetaWarn(metaRes, syncWarnings);
  _efFinish(ctx, syncWarnings);
}

async function _efSaveClick() {
  if (!_efCurrentFlight || _efCurrentIdx < 0) return;
  _efNotify("جارٍ حفظ التعديل...", "loading");
  const form = _efReadForm();
  if (_efRejectIncomplete(form)) return;
  const ctx = _efPrepare(form);
  try {
    await _efCommit(ctx);
  } catch(e) {
    _efNotify("فشل الحفظ: " + (e.message || e), "error");
  }
}

if (efSave) efSave.addEventListener("click", _efSaveClick);
`;
}

/** الجزء 10 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart10() {
  return `
// ═══ الضغط المطوّل يفتح النافذة — في تيوب جداول وفي قسمَي الصالتين بتيوب كايا ═══
// الرحلة تُعرف بمفتاح العرض (data-fkey = fqDisplayKey) لا بوقت إقلاعها:
// الوقت وحده كان يفتح أول رحلة تشاركه، ويكثر ذلك حين تكون الرحلة نفسها في
// الجداول وفي صالة. وقسما الصالتين يطويان المكرَّر على المفتاح نفسه ويُبقيان
// أوّله في DATA، فأوّل مطابقٍ هنا هو الصفّ الظاهر. وفي الجداول قد يقدّم
// الفرز نسخةً أخرى من المكرَّر — تطابقها في الرقم والوقت والتاريخ والمصدر.
function efFindFlightIndex(fkey) {
  if (!fkey) return -1;
  for (let i = 0; i < DATA.length; i++) {
    if (fqDisplayKey(DATA[i]) === fkey) return i;
  }
  return -1;
}

// صفّ جداول أو صفّ صالة: مفتاح العرض مكتوب عليه.
function efResolveKeyedRow(row) {
  const idx = efFindFlightIndex(row.getAttribute("data-fkey"));
  if (idx >= 0) return {idx: idx};
  console.error("[fq_editflight] لا رحلة بمفتاح الصف: " + row.getAttribute("data-fkey"));
  return {error: "تعذّر العثور على الرحلة"};
}

// اسم الصالة بحسب رمزها
function _efHallName(term) {
  return term === "t1" ? "صالة 1" : (term === "north" ? "الصالة الشمالية" : "صالة 4");
}

// بطاقة كايا العلوية صورةٌ من موقع المطار بلا تاريخ، فتُطابَق برحلة الصالة
// المحفوظة بموضعها (fqFlightSlot: الصالة + التاريخ + الرقم، بلا وقت) —
// والتاريخ المختار في تقويم قسم الصالة، وهو ما تُحفظ به رحلاته عند «إضافة».
function efResolveLiveCard(card) {
  const term = card.getAttribute("data-lv-term") || "";
  const flt = card.getAttribute("data-lv-flt") || "";
  if (term !== "t1" && term !== "north" && term !== "hall4") {
    return {error: "رحلات صالة الحج لا تُحفظ في النظام، فلا تُعدَّل"};
  }
  const date = typeof hallPickedDate === "function" ? hallPickedDate(term) : "";
  const slot = fqFlightSlot({terminal: term, date: date, flt: flt});
  for (let i = 0; i < DATA.length; i++) {
    if (fqFlightSlot(DATA[i]) === slot) return {idx: i};
  }
  return {error: "الرحلة " + flt + " غير محفوظة في " + _efHallName(term) + " بتاريخ " + date
    + " — أضفها أولًا بزرّ «إضافة الرحلات الجديدة»"};
}
`;
}

/** الجزء 11 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart11() {
  return `
// الحاوية تستمع لا الصفوف، فيبقى الربط بعد كل إعادة رسم للقائمة.
// الضغط المطوّل وحده، بلا معرفة بما يُفتح: onLongPress(row) تفتح ما تشاء،
// وتُرجع false إن لم تفتح شيئًا فلا يُمنع الضغط الذي بعدها. يستعملها تعديل
// الرحلة هنا وتيوب LIVE FLT (fq_jed_view) — موضعان، فهي مفصل حقيقي.
function _lpMissing(container, rowSelector) {
  if (container) return false;
  console.error("[fq_editflight] حاوية الضغط المطوّل غير موجودة: " + rowSelector);
  return true;
}

function fqBindLongPress(container, rowSelector, onLongPress) {
  if (_lpMissing(container, rowSelector)) return;
  let pressTimer = null;
  let opened = false;
  function cancelPress() {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  }
  container.addEventListener("touchstart", function(e) {
    opened = false;
    const row = e.target.closest(rowSelector);
    if (!row || !container.contains(row)) return;
    pressTimer = setTimeout(function() {
      pressTimer = null;
      if (onLongPress(row) === false) return;
      opened = true;
      row.style.transform = "scale(0.97)";
      setTimeout(function() { row.style.transform = ""; }, 150);
    }, 600);
  }, {passive: true});
  container.addEventListener("touchend", cancelPress);
  container.addEventListener("touchmove", cancelPress);
  container.addEventListener("touchcancel", cancelPress);
  // اللمسة التي فتحت النافذة لا تفتح معها تفاصيل الصف تحتها
  container.addEventListener("click", function(e) {
    if (!opened) return;
    opened = false;
    e.stopPropagation();
    e.preventDefault();
  }, true);
}
`;
}

/** الجزء 12 من 12 من نصّ `getEditFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getEditFlightCodePart12() {
  return `
// resolveRow(row) يُرجع {idx} للرحلة في DATA، أو {error} نصًّا يُقال للموظف.
function efBindLongPress(container, rowSelector, resolveRow) {
  fqBindLongPress(container, rowSelector, function(row) {
    const found = resolveRow(row);
    if (found.error) {
      if (typeof showToast === "function") showToast(found.error, "error", 4500);
      return false;
    }
    openEditFlight(DATA[found.idx], found.idx);
    return true;
  });
}

efBindLongPress(document.getElementById("rs"), "[data-fidx]", efResolveKeyedRow);
efBindLongPress(document.getElementById("hallListT1"), ".mini-row", efResolveKeyedRow);
efBindLongPress(document.getElementById("hallListNorth"), ".mini-row", efResolveKeyedRow);
efBindLongPress(document.getElementById("hallListHall4"), ".mini-row", efResolveKeyedRow);
efBindLongPress(document.getElementById("liveResults"), "[data-lv-flt]", efResolveLiveCard);
`;
}

module.exports = Object.freeze({
  getEditFlightHtml,
  getEditFlightStyles,
  getEditFlightCode,
});
