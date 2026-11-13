// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: copy;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_reg_copy.js

// ═══ نسخ بيانات التسجيل + الحفظ المُجمَّع في القاعدة ═══
// المسؤولية الواحدة: تحويل النماذج إلى نص + حفظ المجموعة + النسخ أو الإرسال
// التعديلات المضافة:
//   - تجميع كل الرحلات تحت مفتاح مجموعة واحد (groupKey)
//   - تفريغ النموذج بعد النسخ — رحلة واحدة فارغة جاهزة
//   - إلغاء نافذة المشاركة المنبثقة: زرّا النسخ والواتساب أسفل النموذج مباشرة

/**
 * يُرجع نص JS لمنطق النسخ والمشاركة.
 * يعتمد على: regCopyBtn, regWaBtn, _collectForms, getShift, getShiftKey, addRegForm, updateRegCounter,
 *           regFormsContainer, _regFormId, loadRegHistory, FB_URL, FB_USER, FB_ROLE, FB_EMP_ID,
 *           fbConnected, showToast, fbPushNotif, auditLog
 * @returns {string}
 */
function getCopyCode() {
  return getCopyCodePart1() +
    getCopyCodePart2() +
    getCopyCodePart3() +
    getCopyCodePart4() +
    getCopyCodePart5() +
    getCopyCodePart6() +
    getCopyCodePart7();
}

/** الجزء 1 من 7 من نصّ `getCopyCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getCopyCodePart1() {
  return `
// ═══ بناء سطور رحلة واحدة كنص ═══
function _buildRowLines(r) {
  const lines = [
    "رقم الرحلة: " + (r.flt || ""),
    "التاريخ: " + (r.date || ""),
    "وقت الاقلاع: " + (r.std || ""),
    "عدد الركاب: " + (r.pax || ""),
    "الوجهة: " + (r.dest || ""),
    "الفيزا: " + _rowLabel(LBL.visa, r.visa),
    "اسم الحملة: " + (r.campaign || ""),
    "الحالة: " + _rowLabel(LBL.status, r.status),
    "التفويج: " + _rowLabel(LBL.tafweej, r.tafweej),
    "الكشف: " + _rowLabel(LBL.inspection, r.inspection)
  ];
  if (r.note && r.note.length > 0) lines.push("ملاحظة: " + r.note);
  return lines;
}

// تسمية القيمة من القاموس، وإلا القيمة نفسها، وإلا فراغ.
function _rowLabel(map, key) {
  return map[key] || key || "";
}

// ═══ بناء نص النسخ من صفوف الرحلات ═══
function _buildCopyText(rows) {
  const shift = getShift();
  const NL = String.fromCharCode(10);
  const header = "00" + shift.shift + "#";
  const blocks = [];
  for (let i = 0; i < rows.length; i++) {
    blocks.push(_buildRowLines(rows[i]).join(NL));
  }
  return header + NL + NL + blocks.join(NL + NL);
}

// ═══ حفظ النص في window للنسخ عبر سكربتابل ═══
function _copyViaScriptable(txt) {
  window._FQ_CLIPBOARD_TEXT = txt;
  window._FQ_CLIPBOARD_READY = true;
}
`;
}

/** الجزء 2 من 7 من نصّ `getCopyCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getCopyCodePart2() {
  return `
// ═══ هدف «تعديل البيانات» ═══
// null = الإرسال القادم تسجيل جديد. وبعد «تعديل البيانات» على تسجيل سابق:
// { key: مفتاحه، shiftKey: وردية قراءته، entry: محتواه كما قُرئ }، فيكتب الإرسال القادم فوقه
// بمفتاحه وورديته ويُبقي كاتبه الأصلي (قرار المالك ٢٠٢٦-١٠-١١). يُمسح عند الإرسال وعند مسح النماذج.
let _regEditTarget = null;

// ═══ بناء حمولة المجموعة الموحّدة (تعديل ١) ═══
function _buildGroupPayload(rows, shiftLabel, nowIso) {
  const flightsArr = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const clean = {};
    for (const k in r) {
      if (k === "note" && !r[k]) continue;
      clean[k] = r[k];
    }
    flightsArr.push(clean);
  }
  return {
    flights: flightsArr,
    shift: shiftLabel,
    recordedBy: FB_USER,
    recordedByRole: FB_ROLE,
    recordedByEmpId: FB_EMP_ID,
    recordedAt: nowIso
  };
}
`;
}

/** الجزء 3 من 7 من نصّ `getCopyCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getCopyCodePart3() {
  return `
// ═══ حمولة تعديل تسجيل سابق: الكاتب الأصلي ووردية التسجيل كما كانا + حقول المعدِّل ═══
function _buildEditedPayload(rows, original, nowIso) {
  const group = _buildGroupPayload(rows, original.shift || "", nowIso);
  const kept = ["recordedBy", "recordedByRole", "recordedByEmpId", "recordedAt"];
  for (let i = 0; i < kept.length; i++) {
    if (original[kept[i]] == null) delete group[kept[i]];
    else group[kept[i]] = original[kept[i]];
  }
  group.lastEditedBy = FB_USER;
  group.lastEditedByEmpId = FB_EMP_ID;
  group.lastEditedAt = nowIso;
  return group;
}

// ═══ حفظ المجموعة في القاعدة ═══
async function _saveGroupToFirebase(groupKey, groupEntry, shiftKey) {
  if (!fbConnected) return false;
  try {
    const payload = {};
    payload[groupKey] = groupEntry;
    // على الطابور: مجموعة تسجيلٍ كتبها موظف بيده لا يجوز أن تضيع
    // لانقطاع لحظي. و PATCH على groupKey نفسه يكتب فوق نفسه، فإعادة
    // الإرسال لا تُنشئ مجموعة ثانية.
    const res = await fqSendOrQueue({
      path: "/reg_data/" + shiftKey + ".json", method: "PATCH", body: payload,
      kind: "reg", label: "حفظ مجموعة تسجيل"
    });
    if (!res.ok) console.error("reg group save: " + res.error);
    return res.ok;
  } catch(e) {
    console.error("reg group save error", e);
    return false;
  }
}
`;
}

/** الجزء 4 من 7 من نصّ `getCopyCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getCopyCodePart4() {
  return `
// ═══ تفريغ النموذج بعد النسخ (تعديل ٢) ═══
function _resetFormsAfterCopy() {
  regFormsContainer.innerHTML = "";
  _regFormId = 0;
  _regEditTarget = null;
  addRegForm();
  updateRegCounter();
}

// ═══ نسخ النص للحافظة (محاولة navigator.clipboard أولاً) ═══
async function _tryClipboardCopy(txt) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(txt);
      return true;
    }
  } catch(e) { console.error("clipboard write error", e); }
  return false;
}

function _fallbackExecCopy(txt) {
  try {
    return _textareaExecCopy(txt);
  } catch(e) {
    console.error("execCommand copy error", e);
    return false;
  }
}

// حقل نصّ مؤقّت خارج الشاشة يُحدَّد نصّه ثم يُنسخ ويُزال. يُرجع نتيجة execCommand.
function _textareaExecCopy(txt) {
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

/** الجزء 5 من 7 من نصّ `getCopyCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getCopyCodePart5() {
  return `
// ═══ نسخ فوري داخل إيماءة النقر (متزامن أولاً ثم الواجهة الحديثة) ═══
function _copyNow(txt) {
  _copyViaScriptable(txt);
  const ok = _fallbackExecCopy(txt);
  _tryClipboardCopy(txt).catch(function(e){ console.error("clipboard async", e); });
  return ok;
}
`;
}

/** الجزء 6 من 7 من نصّ `getCopyCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getCopyCodePart6() {
  return `
// ═══ طلب جسر فتح واتساب من السكربت الأم ═══
function _openWhatsAppBridge(txt) {
  const encoded = encodeURIComponent(txt);
  if (encoded.length > 10000) return false;
  window._FQ_WA_SENT = true;
  window.location.href = "https://fq-bridge.invalid/wa?text=" + encoded;
  return true;
}

// ═══ حفظ المجموعة وتسجيلها ثم تفريغ النموذج ═══
// إن كان في _regEditTarget تسجيل سابق كُتب فوقه بمفتاحه وورديته (PATCH على المفتاح نفسه يستبدل ذلك
// التسجيل وحده)، وإلا مجموعة جديدة. الهدف يُستهلك هنا فلا يكتب إرسال لاحق فوقه.
async function _announceRegSave(info) {
  if (typeof fbPushNotif === "function") {
    await fbPushNotif({ type: "reg_submit", title: info.isEdit ? "تعديل تسجيل رحلات" : "تسجيل بيانات رحلات",
      details: info.count + " رحلة — " + info.shift });
  }
  if (typeof auditLog === "function") {
    await auditLog(info.isEdit ? "reg_edit" : "reg_save", info.count + " entries", info.shiftKey);
  }
}

async function _persistRegGroup(rows, shiftKey, shiftLabel) {
  const target = _regEditTarget;
  _regEditTarget = null;
  const nowIso = new Date().toISOString();
  const groupKey = target ? target.key : "g_" + Date.now().toString(36) + "_" +
    Math.random().toString(36).substr(2, 4);
  const groupEntry = target ? _buildEditedPayload(rows, target.entry, nowIso)
    : _buildGroupPayload(rows, shiftLabel, nowIso);
  const saveShiftKey = target ? target.shiftKey : shiftKey;
  const saved = await _saveGroupToFirebase(groupKey, groupEntry, saveShiftKey);
  await _announceRegSave({ isEdit: !!target, count: rows.length, shift: groupEntry.shift, shiftKey: saveShiftKey });
  return saved;
}

// ═══ رسالة النتيجة بحسب حالة الحفظ والنسخ ═══
// outcome: {saved, copied, isWa}
function _regResultToast(outcome, count) {
  if (typeof showToast !== "function") return;
  const head = outcome.saved ? "تم الحفظ — " + count + " رحلة" : "تعذّر الحفظ السحابي";
  const tail = outcome.isWa ? " — جارٍ فتح واتساب" : (outcome.copied ? " — نُسخت" : " — ستُنسخ عند الإغلاق");
  showToast(head + tail, outcome.saved ? "success" : "info", 2000);
}
`;
}

/** الجزء 7 من 7 من نصّ `getCopyCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getCopyCodePart7() {
  return `
// ═══ الدورة الموحّدة: نسخ ثم حفظ ثم تفريغ ═══
async function _runRegSubmit(isWa) {
  const rows = _collectForms();
  if (rows.length === 0) return _regNoForms();
  const c = _copyRows(rows);
  _regSavingToast();
  const saved = await _persistRegGroup(rows, getShiftKey(), "00" + getShift().shift + "#");
  _regFinish({ saved: saved, copied: c.copied, isWa: isWa }, rows.length);
  if (typeof loadRegHistory === "function") await loadRegHistory();
  _regWaTooLong(isWa, c.txt);
}

function _regNoForms() {
  if (typeof showToast === "function") showToast("لا توجد نماذج للنسخ", "error");
}

// نصّ الصفوف وقد نُسخ فورًا داخل إيماءة النقر.
function _copyRows(rows) {
  const txt = _buildCopyText(rows);
  return { txt: txt, copied: _copyNow(txt) };
}

function _regSavingToast() {
  if (typeof showToast === "function") showToast("جارٍ الحفظ في القاعدة...", "loading");
}

// بعد الحفظ: رسالة النتيجة ثم تفريغ النماذج.
function _regFinish(outcome, count) {
  _regResultToast(outcome, count);
  _resetFormsAfterCopy();
}

// واتساب: إن رفض الجسر النصّ لطوله يُقال ذلك صراحةً.
function _regWaTooLong(isWa, txt) {
  if (isWa && !_openWhatsAppBridge(txt) && typeof showToast === "function") {
    showToast("النص أطول من حد الإرسال — الصقه يدوياً", "error", 2500);
  }
}

// ═══ ربط الزرين الرئيسيين ═══
if (regCopyBtn) regCopyBtn.addEventListener("click", function(){
  _runRegSubmit(false).catch(function(e){ console.error("reg copy", e); });
});
if (regWaBtn) regWaBtn.addEventListener("click", function(){
  _runRegSubmit(true).catch(function(e){ console.error("reg wa", e); });
});
`;
}

module.exports = Object.freeze({
  getCopyCode,
});
