// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: bell;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_toast.js

// ═══ نظام الإشعارات داخل الشاشة — Toast ═══

/**
 * يُرجع HTML نظام Toast.
 * @returns {string}
 */
function getToastHtml() {
  return `
<div id="toastWrap" class="toast-wrap"></div>
`;
}

/**
 * يُرجع CSS نظام Toast.
 * @returns {string}
 */
function getToastStyles() {
  return getToastStylesPart1() +
    getToastStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getToastStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getToastStylesPart1() {
  return `
/* ═══ نظام التوست ═══ */
.toast-wrap{
  position:fixed;
  top:env(safe-area-inset-top, 10px);
  left:50%;transform:translateX(-50%);
  z-index:99999;
  display:flex;flex-direction:column;gap:6px;
  pointer-events:none;
  width:calc(100% - 24px);
  max-width:460px;
}
.toast{
  pointer-events:auto;
  padding:10px 14px;
  border-radius:10px;
  background:#ffffff;color:#1a1a1a;
  font-family:Tajawal,sans-serif;
  font-size:13px;font-weight:600;
  display:flex;align-items:center;gap:8px;
  box-shadow:0 4px 16px rgba(0,0,0,0.06);
  border:1px solid rgba(0,0,0,0.05);
  direction:rtl;
  animation:toast-in 0.25s ease-out;
  max-width:100%;
}
@keyframes toast-in{
  from{opacity:0;transform:translateY(-12px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes toast-out{
  from{opacity:1;transform:translateY(0)}
  to{opacity:0;transform:translateY(-12px)}
}
.toast.out{animation:toast-out 0.2s ease-in forwards}
.toast-ic{
  width:20px;height:20px;
  display:flex;align-items:center;justify-content:center;
  font-size:14px;font-weight:900;
  border-radius:50%;flex-shrink:0;
}
.toast-msg{flex:1;line-height:1.4}
.toast.loading{background:#dbeafe;border-color:#2563eb}
.toast.loading .toast-ic{background:#2563eb;color:#1a1a1a}`;
}

/** الجزء 2 من 2 من نصّ `getToastStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getToastStylesPart2() {
  return `
.toast.loading .toast-spin{
  width:14px;height:14px;
  border:2px solid rgba(255,255,255,0.25);
  border-top-color:#1a1a1a;border-radius:50%;
  animation:toast-spin 0.7s linear infinite;
}
@keyframes toast-spin{to{transform:rotate(360deg)}}
.toast.success{background:#dcfce7;border-color:#16a34a}
.toast.success .toast-ic{background:#16a34a;color:#1a1a1a}
.toast.error{background:#fee2e2;border-color:#E50914}
.toast.error .toast-ic{background:#E50914;color:#fff}
.toast.info{background:#fafafa;border-color:#7c4dff}
.toast.info .toast-ic{background:#7c4dff;color:#1a1a1a}
`;
}

/**
 * يُرجع JavaScript نظام Toast.
 * @returns {string}
 */
function getToastCode() {
  return getToastCodePart1() +
    getToastCodePart2() +
    getToastCodePart3() +
    getToastCodePart4();
}

/** الجزء 1 من 4 من نصّ `getToastCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getToastCodePart1() {
  return `
// ═══ نظام التوست ═══
let toastWrap = document.getElementById("toastWrap");
let _toastLoadingEl = null;

function showToast(msg, type, duration) {
  if (!toastWrap) return;
  type = type || "info";
  const t = _toastBuild(msg, type);
  if (type === "loading") {
    _toastLoadingEl = t;
    // loading يبقى حتى يُستبدل بـ success/error
    return t;
  }
  _toastClearLoading();
  _toastAutoHide(t, duration || (type === "error" ? 3500 : 2000));
  return t;
}

// يبني عنصر التوست ويضيفه إلى الصفحة.
function _toastBuild(msg, type) {
  // إذا كان loading، نستبدل السابق
  if (type === "loading") _toastRemoveLoading();
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.innerHTML = _toastIcon(type) + '<div class="toast-msg">' + msg + '</div>';
  toastWrap.appendChild(t);
  return t;
}

// أيقونة التوست بحسب نوعه: دوّار للتحميل، وعلامة للنجاح والفشل، وحرف للمعلومة.
function _toastIcon(type) {
  if (type === "loading") return '<div class="toast-spin"></div>';
  if (type === "success") return '<div class="toast-ic">✓</div>';
  if (type === "error") return '<div class="toast-ic">✗</div>';
  return '<div class="toast-ic">i</div>';
}
`;
}

/** الجزء 2 من 4 من نصّ `getToastCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getToastCodePart2() {
  return `
// يزيل عنصر التحميل الحالي من الصفحة إن كان فيها.
function _toastRemoveLoading() {
  if (_toastLoadingEl && _toastLoadingEl.parentNode) {
    _toastLoadingEl.parentNode.removeChild(_toastLoadingEl);
  }
}

// إزالة أي loading سابق عند ظهور أي نتيجة (نجاح/فشل/معلومة).
// تُنادى بعد الرجوع المبكر لنوع loading في showToast، فأي نتيجة
// تعني انتهاء العملية ويجب أن تُنهي الدوّار — لا success/error فقط.
function _toastClearLoading() {
  if (_toastLoadingEl) {
    _toastRemoveLoading();
    _toastLoadingEl = null;
  }
}

// يُخفي التوست بعد مدّته، ثم يزيله بعد انتهاء حركة الخروج.
function _toastAutoHide(t, dur) {
  setTimeout(function(){
    t.classList.add("out");
    setTimeout(function(){
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 220);
  }, dur);
}

// إخفاء التوست من النوع loading يدوياً
function hideLoadingToast() {
  if (_toastLoadingEl && _toastLoadingEl.parentNode) {
    _toastLoadingEl.classList.add("out");
    setTimeout(function(){
      if (_toastLoadingEl && _toastLoadingEl.parentNode)
        _toastLoadingEl.parentNode.removeChild(_toastLoadingEl);
      _toastLoadingEl = null;
    }, 220);
  }
}
`;
}

/** الجزء 3 من 4 من نصّ `getToastCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getToastCodePart3() {
  return `
// ═══ بديل confirm — يعمل في WebView سكربتابل ═══
function fqConfirm(msg, title) {
  return new Promise(function(resolve){
    const d = _dlgParts("fqConfirm", false);
    if (!d.ov) { resolve(true); return; }
    _dlgShow(d, msg, title || "تأكيد");
    _dlgBind(d, resolve, function(yes) { return yes; });
  });
}

// عناصر حوار فوق الصفحة بمعرّفاتها المبنية من بادئته: الغطاء والعنوان والمتن
// والحقل (للإدخال وحده) وزرّا نعم ولا. تُجلب بهذا الترتيب.
function _dlgParts(prefix, withInput) {
  const d = {
    ov: document.getElementById(prefix + "Overlay"),
    ttl: document.getElementById(prefix + "Title"),
    bod: document.getElementById(prefix + "Body")
  };
  if (withInput) d.inp = document.getElementById(prefix + "Input");
  d.yesBtn = document.getElementById(prefix + "Yes");
  d.noBtn = document.getElementById(prefix + "No");
  return d;
}

// يملأ العنوان والمتن إن وُجدا، ثم يفتح الحوار.
function _dlgShow(d, msg, title) {
  if (d.ttl) d.ttl.textContent = title;
  if (d.bod) d.bod.textContent = msg || "";
  d.ov.classList.add("open");
}

// يربط زرّي الحوار: كلٌّ منهما يغلقه ويُزيل المستمعين ويُنهي الوعد بقيمة answer(نعم؟).
function _dlgBind(d, resolve, answer) {
  function cleanup(val) {
    d.ov.classList.remove("open");
    d.yesBtn.removeEventListener("click", onYes);
    d.noBtn.removeEventListener("click", onNo);
    resolve(val);
  }
  function onYes() { cleanup(answer(true)); }
  function onNo() { cleanup(answer(false)); }
  d.yesBtn.addEventListener("click", onYes);
  d.noBtn.addEventListener("click", onNo);
}
`;
}

/** الجزء 4 من 4 من نصّ `getToastCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getToastCodePart4() {
  return `
// ═══ بديل prompt — يعمل في WebView سكربتابل ═══
function fqPrompt(msg, title, defaultVal) {
  return new Promise(function(resolve){
    const d = _dlgParts("fqPrompt", true);
    if (!d.ov) { resolve(defaultVal || null); return; }
    if (d.ttl) d.ttl.textContent = title || "إدخال";
    if (d.bod) d.bod.textContent = msg || "";
    if (d.inp) d.inp.value = defaultVal || "";
    d.ov.classList.add("open");
    if (d.inp) setTimeout(function(){ d.inp.focus(); }, 100);
    _dlgBind(d, resolve, function(yes) { return yes && d.inp ? d.inp.value : null; });
  });
}
`;
}

module.exports = Object.freeze({
   getToastHtml,
  getToastStyles,
  getToastCode,
});
