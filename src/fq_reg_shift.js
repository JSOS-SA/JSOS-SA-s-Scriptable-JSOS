// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: clock;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_reg_shift.js

// ═══ منطق الورديات + متغيرات WebView العامة ═══
// المسؤولية الواحدة: حساب الوردية الحالية (للسكربت ولـ WebView)

/**
 * يُرجع مفتاح الوردية الحالية للسكربت الأم (يُستخدم في fq_main).
 * @returns {string}
 */
function getCurrentShiftKey() {
  const now = new Date();
  const tm = now.getHours() * 60 + now.getMinutes();
  return `${_dateStamp(now)}_${_shiftLetter(tm)}`;
}

/**
 * حرف الوردية لدقيقة من اليوم: A من 05:42، و B من 13:42، و C من 21:42 إلى 05:42.
 * @param {number} tm الدقائق منذ منتصف الليل
 * @returns {string}
 */
function _shiftLetter(tm) {
  const aStart = 5 * 60 + 42;
  const aEnd   = 13 * 60 + 42;
  const bStart = 13 * 60 + 42;
  const bEnd   = 21 * 60 + 42;
  if (tm >= aStart && tm < aEnd) return "A";
  if (tm >= bStart && tm < bEnd) return "B";
  return "C";
}

/** التاريخ المحلي بصيغة YYYY-MM-DD. */
function _dateStamp(now) {
  const y = now.getFullYear();
  const mo = (`0${now.getMonth() + 1}`).slice(-2);
  const d = (`0${now.getDate()}`).slice(-2);
  return `${y}-${mo}-${d}`;
}

/**
 * يُرجع نص JS لتعريفات WebView المشتركة (getShift, getShiftKey, LBL, setShiftUI).
 * يُحقن مرة واحدة في WebView ويُستهلك من بقية الأجزاء.
 * @returns {string}
 */
function getShiftCode() {
  return getShiftCodePart1() +
    getShiftCodePart2();
}

/** الجزء 1 من 2 من نصّ `getShiftCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getShiftCodePart1() {
  return `
// ═══ مراجع DOM المشتركة ═══
let regTab = document.getElementById("regTab");
let regPanel = document.getElementById("regPanel");
let regFormsContainer = document.getElementById("regFormsContainer");
let regAddBtn = document.getElementById("regAddBtn");
let regCopyBtn = document.getElementById("regCopyBtn");
let regWaBtn = document.getElementById("regWaBtn");
let regResetBtn = document.getElementById("regResetBtn");
let regCounter = document.getElementById("regCounter");
let regShiftTitle = document.getElementById("regShiftTitle");
let regShiftStart = document.getElementById("regShiftStart");
let regShiftEnd = document.getElementById("regShiftEnd");
let regHistToggle = document.getElementById("regHistToggle");
let regHistList = document.getElementById("regHistList");
let regHistCount = document.getElementById("regHistCount");
let _regFormId = 0;
let _regSyncTimer = null;
`;
}

/** الجزء 2 من 2 من نصّ `getShiftCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getShiftCodePart2() {
  return `
// ═══ حساب الوردية ═══
function getShift() {
  const now = new Date();
  const tm = now.getHours() * 60 + now.getMinutes();
  const aStart = 342, aEnd = 822, bStart = 822, bEnd = 1302;
  if (tm >= aStart && tm < aEnd) return { shift: "A", start: "05:42", end: "13:42" };
  if (tm >= bStart && tm < bEnd) return { shift: "B", start: "13:42", end: "21:42" };
  return { shift: "C", start: "21:42", end: "05:42" };
}

function getShiftKey() {
  const s = getShift();
  const n = new Date();
  const y = n.getFullYear();
  const mo = ("0" + (n.getMonth()+1)).slice(-2);
  const d = ("0" + n.getDate()).slice(-2);
  return y + "-" + mo + "-" + d + "_" + s.shift;
}

(function setShiftUI(){
  const s = getShift();
  if (regShiftTitle) regShiftTitle.textContent = "SHIFT #00" + s.shift;
  if (regShiftStart) regShiftStart.textContent = s.start;
  if (regShiftEnd) regShiftEnd.textContent = s.end;
})();

// ═══ مرجع التسميات (مصدر الحقيقة الوحيد للقوائم) ═══
const LBL = {
  status: STATUS,
  visa: VISA,
  tafweej: TAFWEEJ,
  inspection: INSPECTION
};
`;
}

module.exports = Object.freeze({
  getCurrentShiftKey,
  getShiftCode,
});
