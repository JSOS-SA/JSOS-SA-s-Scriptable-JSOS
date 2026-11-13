// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: camera;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_snapshot.js

// ═══ نظام نسخ البطاقات كصورة ═══
// يستخدم html2canvas داخل WebView للحصول على base64
// ثم يُمرَّر لسكربتابل عبر window._FQ_SNAPSHOT ليُحفظ بـ Pasteboard.copyImage

/**
 * يُرجع CSS نظام نسخ البطاقات.
 * @returns {string}
 */
function getSnapshotStyles() {
  return getSnapshotStylesPart1() +
    getSnapshotStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getSnapshotStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSnapshotStylesPart1() {
  return `
/* ═══ قالب بطاقة الصورة ═══ */
.snap-card{
  position:fixed;top:-10000px;left:-10000px;
  width:580px;padding:32px 28px 28px 28px;
  background:#fafafa;border-radius:18px;
  font-family:Tajawal,sans-serif;
  color:#1a1a1a;direction:rtl;box-sizing:border-box;
}
.snap-hdr{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:10px;
}
.snap-hdr-left{
  font-family:'IBM Plex Mono',monospace;
  font-weight:700;font-size:22px;color:#1a1a1a;letter-spacing:0.05em;
}
.snap-flt{
  font-family:'IBM Plex Mono',monospace;
  font-weight:700;font-size:34px;color:#E50914;
  text-align:center;letter-spacing:0.03em;
}
.snap-date{
  text-align:center;font-size:13px;color:#666666;margin-top:2px;
}
.snap-hdr-right{
  font-family:'IBM Plex Mono',monospace;
  font-weight:700;font-size:22px;color:#1a1a1a;
}
.snap-dash{
  display:flex;align-items:center;gap:6px;margin:14px 0 6px 0;
}
.snap-dash-line{
  flex:1;height:0;border-top:2px dashed #e5e5e5;
}
.snap-dash-dot{
  width:8px;height:8px;border-radius:50%;background:#e5e5e5;
}
.snap-row{
  display:flex;justify-content:space-between;align-items:center;
  padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.05);
}
.snap-row:last-child{border-bottom:none}
.snap-row-val{font-size:22px;font-weight:700;color:#1a1a1a}
.snap-row-val.mono{font-family:'IBM Plex Mono',monospace;letter-spacing:0.02em}
.snap-row-val.danger{color:#E50914}`;
}

/** الجزء 2 من 2 من نصّ `getSnapshotStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSnapshotStylesPart2() {
  return `
.snap-row-lbl{font-size:16px;color:#888888;font-weight:500}
.snap-status-pill{
  display:inline-block;padding:4px 14px;
  background:rgba(245,197,24,0.2);color:#ca8a04;
  border-radius:6px;font-size:14px;font-weight:700;
  margin-top:6px;
}
.snap-row.has-border{
  border:2px solid rgba(229,9,20,0.05);
  border-radius:12px;padding:14px 16px;margin:8px 0;
}
.snap-progress{
  height:5px;background:#fafafa;border-radius:3px;margin-top:16px;overflow:hidden;
}
.snap-progress-fill{
  height:100%;background:linear-gradient(to left,#16a34a,#16a34a);
  border-radius:3px;width:75%;
}
`;
}

/**
 * يُرجع JavaScript نظام نسخ البطاقات.
 * @returns {string}
 */
function getSnapshotCode() {
  return getSnapshotCodePart1() +
    getSnapshotCodePart2() +
    getSnapshotCodePart3() +
    getSnapshotCodePart4() +
    getSnapshotCodePart5();
}

/** الجزء 1 من 5 من نصّ `getSnapshotCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSnapshotCodePart1() {
  return `
// ═══ مكتبة التقاط الصور ═══
// تحوّل عنصر HTML إلى data URL ثم تمرّره لسكربتابل

// بطاقة الرحلة كصورة
async function snapshotFlightCard(flight) {
  return await _doSnapshot(_buildFlightCardHtml(flight));
}

// بطاقة التسجيل كصورة
async function snapshotRegCard(reg) {
  return await _doSnapshot(_buildRegCardHtml(reg));
}

// غلاف البطاقة المؤقتة التي تُلتقط صورتها.
function _snapCardShell() {
  const div = document.createElement("div");
  div.className = "snap-card";
  div.id = "snapCardTemp";
  return div;
}

// خط الفصل المنقّط بين رأس البطاقة وصفوفها.
const SNAP_DASH_HTML = '<div class="snap-dash"><div class="snap-dash-dot"></div><div class="snap-dash-line"></div><div class="snap-dash-dot"></div></div>';

function _buildFlightCardHtml(f) {
  const div = _snapCardShell();
  const dest = (typeof airportName === "function")
    ? airportName(f.to)
    : ((typeof countryName === "function") ? countryName(f.to) : (f.to || "—"));
  const remaining = _calcRemaining(f.depTime);
  const progress = _calcProgress(f);
  div.innerHTML = _flightCardHead(f, dest) + _flightCardRows(f, remaining, progress);
  return div;
}
`;
}

/** الجزء 2 من 5 من نصّ `getSnapshotCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSnapshotCodePart2() {
  return `
// رأس بطاقة الرحلة: الوجهة، ثم الرمز والتاريخ والنوع، ثم الشركة.
function _flightCardHead(f, dest) {
  return '<div class="snap-hdr">' +
    '<div class="snap-hdr-left">' + dest + '</div>' +
    '<div style="flex:1;text-align:center">' +
    '<div class="snap-flt">' + (f.flt || "") + '</div>' +
    '<div class="snap-date">' + (f.date || "") + '</div>' +
    (f.type ? '<div class="snap-status-pill">' + f.type + '</div>' : '') +
    '</div>' +
    '<div class="snap-hdr-right">' + (f.al || "") + '</div>' +
    '</div>';
}

// صفوف بطاقة الرحلة، ثم شريط التقدّم.
function _flightCardRows(f, remaining, progress) {
  return SNAP_DASH_HTML +
    '<div class="snap-row"><div class="snap-row-val mono">' + (f.std || "—") + '</div><div class="snap-row-lbl">STD</div></div>' +
    '<div class="snap-row has-border"><div class="snap-row-val mono danger">' + remaining + '</div><div class="snap-row-lbl">المتبقي</div></div>' +
    '<div class="snap-row"><div class="snap-row-val mono">' + (f.type || "—") + '</div><div class="snap-row-lbl">FLT Type</div></div>' +
    '<div class="snap-row"><div class="snap-row-val mono">' + (f.dpax || "—") + '</div><div class="snap-row-lbl">DPAX</div></div>' +
    '<div class="snap-progress"><div class="snap-progress-fill" style="width:' + progress + '%"></div></div>';
}
`;
}

/** الجزء 3 من 5 من نصّ `getSnapshotCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSnapshotCodePart3() {
  return `
function _buildRegCardHtml(r) {
  const div = _snapCardShell();
  div.innerHTML = _regCardHead(r) + _regCardRows(r);
  return div;
}

// رأس بطاقة التسجيل: الوجهة، ثم الرمز والوردية، ثم الحملة.
function _regCardHead(r) {
  return '<div class="snap-hdr">' +
    '<div class="snap-hdr-left">' + (r.dest || "—") + '</div>' +
    '<div style="flex:1;text-align:center">' +
    '<div class="snap-flt">' + (r.flt || "") + '</div>' +
    '<div class="snap-date">' + (r.shift || "") + '</div>' +
    '</div>' +
    '<div class="snap-hdr-right">' + (r.campaign || "—") + '</div>' +
    '</div>';
}

// صفوف بطاقة التسجيل، وصفّ الملاحظة إن وُجدت.
function _regCardRows(r) {
  return SNAP_DASH_HTML +
    '<div class="snap-row"><div class="snap-row-val mono">' + (r.std || "—") + '</div><div class="snap-row-lbl">وقت الإقلاع</div></div>' +
    '<div class="snap-row"><div class="snap-row-val mono">' + (r.pax || "—") + '</div><div class="snap-row-lbl">عدد الركاب</div></div>' +
    '<div class="snap-row"><div class="snap-row-val">' + (r.visaLabel || "—") + '</div><div class="snap-row-lbl">الفيزا</div></div>' +
    '<div class="snap-row"><div class="snap-row-val">' + (r.statusLabel || "—") + '</div><div class="snap-row-lbl">الحالة</div></div>' +
    '<div class="snap-row"><div class="snap-row-val">' + (r.tafweejLabel || "—") + '</div><div class="snap-row-lbl">التفويج</div></div>' +
    '<div class="snap-row"><div class="snap-row-val">' + (r.inspectionLabel || "—") + '</div><div class="snap-row-lbl">الكشف</div></div>' +
    (r.note ? '<div class="snap-row"><div class="snap-row-val" style="font-size:16px">' + r.note + '</div><div class="snap-row-lbl">ملاحظة</div></div>' : '');
}

function _calcRemaining(depTime) {
  if (!depTime) return "—";
  const t = depTime instanceof Date ? depTime : new Date(depTime);
  if (isNaN(t.getTime())) return "—";
  const diff = t.getTime() - Date.now();
  if (diff <= 0) return "غادرت";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h + " س  " + m + " د";
}
`;
}

/** الجزء 4 من 5 من نصّ `getSnapshotCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSnapshotCodePart4() {
  return `
function _calcProgress(f) {
  if (!f || !f.depTime) return 50;
  const t = f.depTime instanceof Date ? f.depTime : new Date(f.depTime);
  const diff = t.getTime() - Date.now();
  if (diff <= 0) return 100;
  const hours = diff / 3600000;
  if (hours > 24) return 20;
  return Math.round(100 - (hours / 24) * 80);
}

// ═══ تحويل لـ dataURL باستخدام html2canvas ═══
async function _doSnapshot(cardEl) {
  return new Promise(function(resolve, reject){
    document.body.appendChild(cardEl);
    // انتظار فريم واحد لضمان التركيب
    setTimeout(function(){
      if (typeof html2canvas !== "function") {
        if (cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
        reject("html2canvas غير محمّلة");
        return;
      }
      html2canvas(cardEl, {
        backgroundColor: "#fafafa",
        scale: 2,
        logging: false,
        useCORS: true
      }).then(function(canvas){
        const dataUrl = canvas.toDataURL("image/png");
        if (cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
        resolve(dataUrl);
      }).catch(function(err){
        if (cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
        reject(err && err.message ? err.message : "فشل الالتقاط");
      });
    }, 50);
  });
}
`;
}

/** الجزء 5 من 5 من نصّ `getSnapshotCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSnapshotCodePart5() {
  return `
// ═══ تصدير الصورة لسكربتابل ═══
// يضع dataURL في window._FQ_SNAPSHOT ثم يستدعي window._FQ_SNAPSHOT_READY
async function exportSnapshotToClipboard(dataUrl) {
  window._FQ_SNAPSHOT = dataUrl;
  window._FQ_SNAPSHOT_READY = true;
  // انتظار قراءة سكربتابل
  let waited = 0;
  while (window._FQ_SNAPSHOT_READY && waited < 3000) {
    await new Promise(function(r){ setTimeout(r, 100); });
    waited += 100;
  }
  return !window._FQ_SNAPSHOT_READY;
}
`;
}

module.exports = Object.freeze({
  getSnapshotStyles,
  getSnapshotCode,
});
