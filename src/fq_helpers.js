// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_helpers.js

const cfg = importModule("fq_config");

// دالة تحويل رمز المطار لاسم الدولة
/**
 * يُرجع كود دالة تحويل رمز الدولة.
 * @returns {string}
 */
function getCountryNameFn() {
  return `
function countryName(code) {
  if (!code) return code;
  return COUNTRY[code.trim().toUpperCase()] || code;
}`;
}

// دالة تحويل رمز IATA لاسم المدينة + الدولة
/**
 * يُرجع كود دالة عرض اسم المطار بصيغة "المدينة - الدولة".
 * تستخدم كائن AIRPORTS المُحقَن في WebView من fq_main.
 * إذا الاختصار غير موجود → ترجع الاختصار كما هو (سلوك آمن).
 * @returns {string}
 */
function getAirportNameFn() {
  return `
function airportName(code) {
  if (!code) return code;
  const k = code.trim().toUpperCase();
  if (typeof AIRPORTS === "undefined" || !AIRPORTS[k]) return code;
  const a = AIRPORTS[k];
  if (a.c && a.d) return a.c + " - " + a.d;
  if (a.c) return a.c;
  return code;
}`;
}

// بناء كائن تاريخ كامل من سلسلة التاريخ ووقت الإقلاع
/**
 * يُرجع كود دالة بناء وقت المغادرة.
 * @returns {string}
 */
function getBuildDepTimeFn() {
  return `
function buildDepTime(dateStr, timeStr) {
  const dp = dateStr.split("-");
  const tp = timeStr.split(":");
  return new Date(
    parseInt(dp[0]), parseInt(dp[1]) - 1, parseInt(dp[2]),
    parseInt(tp[0]), parseInt(tp[1]) || 0, 0, 0
  );
}`;
}

// تنسيق الوقت المتبقي — ساعات ودقائق أو دقائق وثوانٍ
/**
 * يُرجع كود دالة تنسيق الوقت المتبقي.
 * @returns {string}
 */
function getFmtRemainFn() {
  return `
function fmtRemain(diff) {
  if (diff <= 0) return { text: "أقلعت", cls: "gone" };
  const totalMins = Math.floor(diff / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const secs = Math.floor((diff % 60000) / 1000);
  let cls = "";
  if (hrs < ${cfg.SOON_HOURS}) cls = "soon";
  else if (hrs < ${cfg.WARN_HOURS}) cls = "warn";
  const txt = hrs > 0
    ? hrs + " س " + mins + " د"
    : mins + " د " + secs + " ث";
  return { text: txt, cls: cls };
}`;
}

// حساب حالة التفويج بناءً على وقت الإقلاع
/**
 * يُرجع كود دالة التفويج.
 * @returns {string}
 */
function getGetTafweejFn() {
  return `
function getTafweej(depTime) {
  const diff = depTime.getTime() - Date.now();
  if (diff <= 0) return { label: "أقلعت", cls: "departed" };
  const hrs = diff / 3600000;
  const earlyHrs = (window._TF_EARLY !== undefined) ? window._TF_EARLY : ${cfg.TAFWEEJ_EARLY_HOURS};
  const ontimeHrs = (window._TF_ONTIME !== undefined) ? window._TF_ONTIME : ${cfg.TAFWEEJ_ONTIME_HOURS};
  if (hrs >= earlyHrs) return { label: "مبكر", cls: "early" };
  if (hrs >= ontimeHrs) return { label: "في الموعد", cls: "ontime" };
  return { label: "متأخر", cls: "late" };
}`;
}

// تعيين التاريخ الافتراضي = اليوم
/**
 * يُرجع كود دالة تهيئة التاريخ.
 * @returns {string}
 */
function getInitDateFn() {
  return `
(function() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  document.getElementById("dp").value = y + "-" + m + "-" + d;
})();`;
}

// عرض وإخفاء الأخطاء
/**
 * يُرجع كود دوال معالجة الأخطاء.
 * @returns {string}
 */
function getErrorFns() {
  return `
function showErr(m) {
  const el = document.getElementById("er");
  el.textContent = m;
  el.classList.add("on");
}
function hideErr() {
  document.getElementById("er").classList.remove("on");
}`;
}

/**
 * يُرجع كود دالة تهريب HTML المركزية للنافذة.
 * كل نص مصدره المستخدم أو قاعدة البيانات يجب أن يمر عبرها قبل الحقن في innerHTML.
 * @returns {string}
 */
function getEscapeFn() {
  return `
function fqEsc(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}`;
}

/**
 * ═══ هوية الرحلة — المصدر الوحيد في المشروع ═══
 *
 * كل رحلة تنتمي إلى مصدر واحد لا يختلط بغيره:
 *   "sch"   → تيوب جداول (terminal فارغ)
 *   "t1"    → صالة 1
 *   "north" → الصالة الشمالية
 *   "hall4" → صالة 4 (أمر المالك ٢٠٢٦-١٠-٠٣)
 *
 * المفتاح: <المصدر>_<التاريخ>_<رقم الرحلة>_<الوقت>
 *
 * لماذا المصدر جزء من الهوية: قبل ذلك كان المفتاح <التاريخ>_<الرقم>_<الوقت>،
 * فرحلة بنفس الرقم والوقت والتاريخ في جداول وفي صالة 1 تُنتج مفتاحًا واحدًا —
 * فتكتب إحداهما فوق الأخرى في القاعدة، أو يُسقطها الدمج بوصفها «مكررة».
 * بإدخال المصدر صارت المصادر مستقلة تمامًا ولا تسقط أي رحلة أبدًا.
 *
 * ⚠ لا تنسخ هذه الدالة. النسخة المتصفحية أدناه (getFlightKeyFn) في الملف
 * نفسه عمدًا ليظهر أي انحراف بينهما فورًا.
 */
function flightSource(flight) {
  const terminal = (flight && flight.terminal) || "";
  return (terminal === "t1" || terminal === "north" || terminal === "hall4") ? terminal : "sch";
}

/**
 * يبني مفتاح هوية الرحلة المعتمد في القاعدة وفي كل إزالة تكرار.
 * @param {Object} flight - كائن الرحلة
 * @returns {string} مفتاح آمن لفايربيس
 */
function flightKey(flight) {
  const raw = flightSource(flight)
    + "_" + ((flight && flight.date) || "")
    + "_" + ((flight && flight.flt) || "")
    + "_" + ((flight && flight.std) || "");
  return raw.replace(/[.#$[\]/]/g, "-");
}

/**
 * ═══ مكان حفظ الرحلة — لكل مصدر عقدة مستقلة في جذر القاعدة ═══
 *
 * أمر المالك ٢٠٢٦-٠٩-٢٨: «كل صالة ليس في نفس مكان حفظ الصالة الأخرى وليس
 * في نفس المكان». فالمصادر الأربعة أربع عقد متجاورة في الجذر، لا عقدة أمّ
 * واحدة تجمعها. وكانت كلها في `flights_data`، والفاصل علامة داخل السجلّ
 * وحدها — فكان حفظُ صالةٍ يعيد كتابة الصالتين الأخريين.
 *
 * والمفتاح داخل العقدة هو `flightKey` نفسه بلا تغيير، فبادئة المصدر فيه
 * تكفي لمعرفة عقدته من المفتاح وحده (`flightNodeOfKey`).
 *
 * ⚠ لا تكتب اسم عقدة رحلات نصًّا في أي ملف آخر. النسخة المتصفحية في
 * `getFlightKeyFn` أدناه مطابقة حرفيًّا.
 */
const FLIGHT_NODES = Object.freeze({ sch: "flights_sch", t1: "flights_t1", north: "flights_north", hall4: "flights_hall4" });

/**
 * عقدة الرحلة في القاعدة بحسب مصدرها.
 * @param {Object} flight - كائن الرحلة
 * @returns {string} اسم العقدة بلا شرطة في أوله
 */
function flightNode(flight) {
  return FLIGHT_NODES[flightSource(flight)];
}

/**
 * عقدة الرحلة من مفتاحها المخزَّن. مفتاحٌ بلا بادئة مصدر معروفة (الصيغة
 * القديمة قبل إدخال المصدر) لا عقدة له، فيُرجَع نصّ فارغ ولا يُخمَّن.
 * @param {string} key - مفتاح الرحلة
 * @returns {string} اسم العقدة، أو "" لمفتاح مجهول المصدر
 */
function flightNodeOfKey(key) {
  const prefix = String(key || "").split("_")[0];
  return Object.prototype.hasOwnProperty.call(FLIGHT_NODES, prefix) ? FLIGHT_NODES[prefix] : "";
}

/**
 * العقد الأربع بترتيب ثابت: جداول ثم صالة 1 ثم الشمالية ثم صالة 4.
 * @returns {string[]}
 */
function flightNodes() {
  return [FLIGHT_NODES.sch, FLIGHT_NODES.t1, FLIGHT_NODES.north, FLIGHT_NODES.hall4];
}

/**
 * يوزّع حمولة مفاتيح رحلات على عقدها — فيبني المستدعي حمولته بالمفاتيح
 * كما كان، ويُرسل لكل عقدة طلبًا بما يخصّها وحدها. والقيمة `null` (حذف)
 * تُوزَّع كغيرها. والمفتاح المجهول المصدر يُسقَط ولا يُكتب في عقدة مخمَّنة.
 * @param {Object} payload - { مفتاح: قيمة }
 * @returns {Object} { اسم العقدة: { مفتاح: قيمة } } — لا تظهر فيه عقدة بلا مفاتيح
 */
function splitByNode(payload) {
  const out = {};
  const keys = Object.keys(payload || {});
  for (let i = 0; i < keys.length; i++) {
    const node = flightNodeOfKey(keys[i]);
    if (!node) continue;
    if (!out[node]) out[node] = {};
    out[node][keys[i]] = payload[keys[i]];
  }
  return out;
}

/**
 * موضع رحلة الصالة: الصالة + التاريخ + رمز الشركة ورقم الرحلة، **بلا وقت**.
 * قاعدة المالك ٢٠٢٦-٠٩-٢٨: «لا يمكن أن تطير رحلتان بنفس الرقم ونفس الرمز
 * في يوم واحد بنفس الصالة». فبه تُعرف الرحلة التي تغيّر موعدها، ويبقى
 * `flightKey` مفتاح القاعدة يتبع الوقت. ورحلات الجداول لا موضع لها ("").
 * ⚠ نظيرها في المتصفح `fqFlightSlot` أدناه — لا تنسخ أيًّا منهما.
 * @param {Object} flight
 * @returns {string}
 */
function flightSlot(flight) {
  const source = flightSource(flight);
  if (source === "sch") return "";
  return source + "|" + ((flight && flight.date) || "") + "|" + ((flight && flight.flt) || "");
}

/**
 * علامة الرحلة المعدَّلة يدويًّا في حقل المصدر (`_src` في الذاكرة و`src` في
 * القاعدة). تكتبها نافذة التعديل، ويقرؤها زرّ تحديث الصالة فلا يغيّر وقت
 * رحلةٍ عدّلها موظف — قرار المالك ٢٠٢٦-٠٩-٣٠: «التعديل اليدوي يغلب».
 * ⚠ نظيرها في المتصفح `FQ_MANUAL_EDIT_SRC` أدناه — لا تكتب القيمة نصًّا.
 */
const MANUAL_EDIT_SRC = "manual_edited";

/**
 * أعدّل موظفٌ هذه الرحلة يدويًّا؟
 * @param {Object} flight
 * @returns {boolean}
 */
function isManualEdit(flight) {
  return !!flight && flight._src === MANUAL_EDIT_SRC;
}

/**
 * مفتاح كتابة الرحلة لمن لا يملك حذف الرحلات. النقل إلى مفتاح جديد يحمل null
 * للقديم، والطلب الجماعي ذرّيّ فيُرفض كله لمن لا يُسمح له بالحذف (قيس
 * بالمحاكي ٢٠٢٦-٠٩-٢٨). فيبقى السجلّ تحت مفتاحه المخزَّن ويتغيّر محتواه —
 * الحالة التي يعرفها العرف ١٩. ولا يُستعمل المخزَّن إن كان في عقدة أخرى، أو
 * كان مفتاحًا محسوبًا لسجلّ آخر في الحفظ نفسه، فلا يُكتب سجلّ فوق آخر.
 * ⚠ نظيرها في المتصفح `fqKeepStoredKey` — لا تنسخ أيًّا منهما.
 * @param {Object} flight
 * @param {Object<string, boolean>} taken - المفاتيح المحسوبة لكل رحلات الحفظ
 * @returns {string}
 */
function keepStoredKey(flight, taken) {
  const computed = flightKey(flight);
  const stored = flight && flight._fbKey;
  if (!stored || stored === computed || taken[stored]) return computed;
  if (flightNodeOfKey(stored) !== flightNodeOfKey(computed)) return computed;
  return stored;
}

/**
 * يُرجع نسخة المتصفح من دالة الهوية — مطابقة لـ flightKey أعلاه حرفيًّا.
 * تُحقن أولًا في الصفحة فتكون متاحة لكل الوحدات التالية.
 * @returns {string}
 */
function getFlightKeyFn() {
  return getFlightKeyFnPart1() +
    getFlightKeyFnPart2();
}

/** الجزء 1 من 2 من نصّ `getFlightKeyFn()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFlightKeyFnPart1() {
  return `
// ═══ هوية الرحلة — نسخة المتصفح، مطابقة لـ flightKey في fq_helpers.js ═══
function fqFlightSource(f){
  const t=(f&&f.terminal)||"";
  return (t==="t1"||t==="north"||t==="hall4")?t:"sch";
}
function fqFlightKey(f){
  const raw=fqFlightSource(f)+"_"+((f&&f.date)||"")+"_"+((f&&f.flt)||"")+"_"+((f&&f.std)||"");
  return raw.replace(/[.#$[\\]/]/g,"-");
}
// مفتاح العرض لإزالة التكرار — يشمل التاريخ والمصدر فلا تُطوى رحلتان
// ليومين مختلفين أو لمصدرين مختلفين في صف واحد
function fqDisplayKey(f){
  return fqFlightSource(f)+"|"+((f&&f.date)||"")+"|"+((f&&f.al)||"")+"|"+((f&&f.flt)||"")+"|"+((f&&f.std)||"");
}
// أينتمي هذا الكائن إلى تيوب جداول؟ (لا صالة)
function fqIsSchedule(f){ return fqFlightSource(f)==="sch"; }
// مفتاح الكتابة لمن لا يملك النقل — مطابق لـ keepStoredKey حرفيًّا
function fqKeepStoredKey(f, taken){
  const computed=fqFlightKey(f);
  const stored=f&&f._fbKey;
  if(!stored||stored===computed||taken[stored])return computed;
  if(fqFlightNodeOfKey(stored)!==fqFlightNodeOfKey(computed))return computed;
  return stored;
}
// علامة التعديل اليدوي في حقل المصدر — مطابقة لـ MANUAL_EDIT_SRC حرفيًّا
const FQ_MANUAL_EDIT_SRC="manual_edited";
// موضع رحلة الصالة بلا وقت — مطابق لـ flightSlot حرفيًّا. "" لرحلة الجداول
function fqFlightSlot(f){
  const s=fqFlightSource(f);
  if(s==="sch")return "";
  return s+"|"+((f&&f.date)||"")+"|"+((f&&f.flt)||"");
}`;
}

/** الجزء 2 من 2 من نصّ `getFlightKeyFn()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFlightKeyFnPart2() {
  return `
// ═══ مفتاح مخزَّن بالصيغة القديمة؟ ═══
// الصيغة المعتمدة تبدأ بالمصدر (الأربعة أعلاه في fqFlightSource حرفيًّا).
// وما قبلها كان <التاريخ>_<الرقم>_<الوقت> بلا مصدر، وهو ما وُجد له
// fq_migrate_flight_keys. يُعرَف بأنه لا يبدأ بأيّ من الأربعة.
// هنا لا في وحدة أخرى، لأن هوية الرحلة مالكها هذا الملف وحده (العرف ١٣).
function fqIsLegacyFlightKey(k){
  const s=String(k||"");
  return !(s.indexOf("sch_")===0||s.indexOf("t1_")===0||s.indexOf("north_")===0||s.indexOf("hall4_")===0);
}
function fqLegacyKeyCount(keys){
  let n=0,list=keys||[];
  for(let i=0;i<list.length;i++){ if(fqIsLegacyFlightKey(list[i]))n++; }
  return n;
}
// ═══ مكان حفظ الرحلة — مطابق لـ FLIGHT_NODES في fq_helpers.js حرفيًّا ═══
// لكل مصدر عقدة مستقلة في جذر القاعدة (أمر المالك ٢٠٢٦-٠٩-٢٨). لا تكتب
// اسم عقدة رحلات نصًّا في أي وحدة أخرى — استعمل هذه الدوال.
const FQ_FLIGHT_NODES={sch:"flights_sch",t1:"flights_t1",north:"flights_north",hall4:"flights_hall4"};
function fqFlightNode(f){ return FQ_FLIGHT_NODES[fqFlightSource(f)]; }
function fqFlightNodeOfKey(k){
  const p=String(k||"").split("_")[0];
  return Object.prototype.hasOwnProperty.call(FQ_FLIGHT_NODES,p)?FQ_FLIGHT_NODES[p]:"";
}
function fqFlightNodes(){ return [FQ_FLIGHT_NODES.sch,FQ_FLIGHT_NODES.t1,FQ_FLIGHT_NODES.north,FQ_FLIGHT_NODES.hall4]; }
function fqSplitByNode(payload){
  const out={},keys=Object.keys(payload||{});
  for(let i=0;i<keys.length;i++){
    const n=fqFlightNodeOfKey(keys[i]);
    if(!n)continue;
    if(!out[n])out[n]={};
    out[n][keys[i]]=payload[keys[i]];
  }
  return out;
}
`;
}

// تجميع كل الدوال المساعدة في نص واحد
/**
 * يُرجع كود كل دوال المساعدة مجمّعة.
 * @returns {string}
 */
function getAllHelpers() {
  return [
    getEscapeFn(),
    getFlightKeyFn(),
    getCountryNameFn(),
    getAirportNameFn(),
    getBuildDepTimeFn(),
    getFmtRemainFn(),
    getGetTafweejFn(),
    getInitDateFn(),
    getErrorFns(),
  ].join("\n");
}

module.exports = Object.freeze({
  getAllHelpers, getFlightKeyFn, flightKey, flightSource, flightSlot, keepStoredKey,
  MANUAL_EDIT_SRC, isManualEdit, flightNode, flightNodeOfKey, flightNodes, splitByNode,
});
