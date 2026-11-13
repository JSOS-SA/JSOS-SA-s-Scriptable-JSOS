// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_jed_text.js

/**
 * @module fq_jed_text
 * @description المسؤولية الواحدة: قواعد عرض تيوب LIVE FLT — نصّ يدخل ونصّ
 * يخرج، بلا عنصر في الصفحة ولا شبكة (نمط `fq_t4_text`). فتُختبر وحدها.
 *
 * **منقولة من شاشة الطرفية** (`board.py` و`cleanup.py` و`merge.py` في
 * `~/Desktop/رحلات_صالات_جدة`) لأن المالك طلب «نفس الأسلوب والبيانات
 * والشكل». فإن تغيّرت قاعدة هناك فتتغيّر هنا: البرنامجان بلغتين على
 * جهازين، فلا مصدر مشترك بينهما. والمطابقة قيست ٢٠٢٦-١٠-٠٣ على ٢٥٥ رحلة
 * خانةً خانة.
 *
 * - **الحالة برمز إنجليزي ولون** (أمر المالك ٢٠٢٦-١٠-٠٣، الجولة الثانية):
 *   DEP أخضر · STD أزرق · DAL برتقالي يومض · CNL أحمر يومض · DIV بنفسجي.
 *   والقيمة المخزَّنة تبقى عربية كما يكتبها الجامع؛ الرمز عرضٌ لا بيانات.
 * - **الوجهة بالاسم الإنجليزي من ملف مدن التطبيق** (`AIRPORTS[code].en`،
 *   اختيار المالك)، وعند غيابه رمز المطار — قاعدة تيوب T4 نفسها.
 * - **ETD** لا يظهر إلا إذا تغيّر موعد الإقلاع، و**STD** يُشطب حينها كشطب
 *   مخرجات نموذج F، ولا يُشطب «⚠ خلاف» لأنه ليس موعدًا.
 * - **TTD** من وقت الإقلاع المتوقع وإلا المجدول، وأبعدها عند الخلاف، ورحلة
 *   مجدولة بعد ١٨:٠٠ تأخّرت إلى ما قبل ٠٦:٠٠ وقتُها في اليوم التالي.
 *   والعدّاد `wlTtd` من تيوب T4 لا نسخة منه (طلب المالك).
 * - **استنتاج**: `wlTtd` يحسب بساعة الجوال، والأوقات بتوقيت جدة؛ فيصحّ ما
 *   دام الجوال على توقيت السعودية.
 */

/**
 * شيفرة قواعد العرض التي تعمل داخل الصفحة.
 * @returns {string} نص JavaScript للمتصفح
 */
function getJedTextCode() {
  return getJedTextCodePart1() +
    getJedTextCodePart2() +
    getJedTextCodePart3() +
    getJedTextCodePart4() +
    getJedTextCodePart5() +
    getJedTextCodePart6();
}

/** الجزء 1 من 6 من نصّ `getJedTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTextCodePart1() {
  return `
// ═══ LIVE FLT: قواعد العرض ═══
const JED_TERMS = [["N", "الصالة الشمالية"], ["1", "صالة ١"], ["4", "صالة ٤"]];
// قائمة الصالة في نافذة التعديل بترتيب المالك وأسمائه، ومعها صالة الحج.
const JED_EDIT_TERMS = [["1", "صالة 1"], ["N", "الصالة الشمالية"], ["4", "صالة 4"],
  ["H", "صالة الحج والعمرة"]];
const JED_FIELDS = [["terminal", "الصالة"], ["sched", "المجدول"], ["est", "المتوقع"],
  ["dest", "الوجهة"], ["status", "الحالة"]];
// ترتيب المواقع ترتيب SOURCE_ORDER في merge.py بالطرفية.
const JED_SITE_ORDER = ["jeddah", "kupi", "aerodatabox"];
// مواقع أُوقف جلبها (STOPPED_SOURCES في common.py): لا تظهر في رأس التبويب، وتظهر
// قيمها في تفاصيل رحلة رُئيت فيها قبل الإيقاف. إكسيجو أوقفه المالك ٢٠٢٦-١٠-٠٥.
const JED_SITE_STOPPED = ["ixigo"];
const JED_SITES = { ixigo: "إكسيجو", jeddah: "جدة إيربورت", kupi: "كوبي",
  aerodatabox: "إيرو داتا بوكس" };
// [القيمة كما يكتبها الجامع، الرمز المعروض، صنف اللون]
const JED_STATUSES = [["مجدولة", "STD", "jed-sch"], ["متأخرة", "DAL", "jed-dly jed-blink"],
  ["أقلعت", "DEP", "jed-dep"], ["ألغيت", "CNL", "jed-cnl jed-blink"], ["تحوّلت", "DIV", "jed-div"]];
const JED_DEPARTED = "أقلعت";

function jedStatus(value) {
  for (let i = 0; i < JED_STATUSES.length; i++) if (JED_STATUSES[i][0] === value) return JED_STATUSES[i];
  return null;
}

function jedIsDay(d) {
  const p = String(d).split("-");
  return p.length === 3 && p[0].length === 4 && p[1].length === 2 && p[2].length === 2 &&
    !isNaN(Number(p[0])) && !isNaN(Number(p[1])) && !isNaN(Number(p[2]));
}

function jedTimes(r) {
  if (!r) return [];
  if (r.v) return [r.v];
  const out = [];
  const s = r.s || {};
  for (const k in s) if (Object.prototype.hasOwnProperty.call(s, k) && s[k]) out.push(s[k]);
  return out;
}

function jedSortTime(n) {
  const t = jedTimes(n.f && n.f.sched);
  return t.length ? t.slice().sort()[0] : "99:99";
}
`;
}

/** الجزء 2 من 6 من نصّ `getJedTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTextCodePart2() {
  return `
function jedFirst(row) {
  return String((row.n.n || [row.key])[0]);
}

// المتساوي في الوقت برقمه الأول، كما في merge_day بالطرفية.
function jedRows(store) {
  const rows = [];
  for (const k in store) {
    if (Object.prototype.hasOwnProperty.call(store, k) && !store[k].x) rows.push({ key: k, n: store[k] });
  }
  rows.sort(function(a, b) {
    const x = jedSortTime(a.n) + " " + jedFirst(a), y = jedSortTime(b.n) + " " + jedFirst(b);
    return x < y ? -1 : x > y ? 1 : 0;
  });
  return rows;
}

function jedDisputed(n) {
  const f = n.f || {};
  for (let i = 0; i < JED_FIELDS.length; i++) {
    const r = f[JED_FIELDS[i][0]];
    if (r && r.st === "conflict") return true;
  }
  return false;
}

// أقلعت بقيمة متفق عليها أو مختارة، لا مختلفًا عليها (departed في board.py).
function jedDeparted(n) {
  const r = (n.f || {}).status || {};
  return r.st !== "conflict" && r.v === JED_DEPARTED;
}
`;
}

/** الجزء 3 من 6 من نصّ `getJedTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTextCodePart3() {
  return `
function jedShown(n, field, value) {
  if (value == null || value === "") return "—";
  if (field === "dest") return jedShownDest(value);
  if (field === "status") return jedShownStatus(value);
  if (field === "terminal") return jedShownTerminal(value);
  return value;
}

// الوجهة باسمها الإنجليزي من قاموس المطارات، وبرمزها إن غابت.
function jedShownDest(value) {
  const ap = typeof AIRPORTS !== "undefined" ? AIRPORTS[value] : null;
  return (ap && ap.en) || value;
}

function jedShownStatus(value) {
  const st = jedStatus(value);
  return st ? st[1] : value;
}

// الصالة باسمها من قائمة التحرير، وبقيمتها إن لم تُوجد فيها.
function jedShownTerminal(value) {
  for (let i = 0; i < JED_EDIT_TERMS.length; i++) {
    if (JED_EDIT_TERMS[i][0] === value) return JED_EDIT_TERMS[i][1];
  }
  return value;
}

// نصّ الخانة وصنفها: خلاف، أو مكتوبة باليد، أو مختارة أو بقاعدة شركة الطيران، أو متفق عليها.
// و«أقلعت» التلقائية بعد موعد الإقلاع (auto) تظهر كالمتفق عليها.
function jedCell(n, field) {
  const r = (n.f || {})[field] || {};
  if (r.st === "conflict") return { text: "⚠ خلاف", cls: "jed-cf" };
  const text = jedShown(n, field, r.v);
  const st = field === "status" ? jedStatus(r.v) : null;
  const cls = st ? st[2] : "";
  const mark = jedCellMark(r.st);
  if (mark) return { text: mark + text, cls: cls || "jed-ok" };
  return { text: text, cls: cls };
}

`;
}

/** الجزء 4 من 6 من نصّ `getJedTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTextCodePart4() {
  return `
// علامة الخانة: ✎ لما كُتب باليد، و✓ لما اختير أو جاءت به قاعدة، وفراغ لغير ذلك.
function jedCellMark(st) {
  if (st === "manual") return "✎";
  if (st === "chosen" || st === "rule") return "✓";
  return "";
}

// ETD لا يظهر إلا إذا تغيّر موعد الإقلاع (أمر المالك ٢٠٢٦-١٠-٠٣).
function jedEtd(n) {
  const f = n.f || {};
  const est = f.est || {}, sched = f.sched || {};
  if (est.st !== "conflict" && (est.v == null || est.v === sched.v)) return { text: "", cls: "" };
  return jedCell(n, "est");
}

// STD يُشطب إذا تغيّر الإقلاع، ولا يُشطب إلا وقت معروف (sched_cell في board.py).
function jedStd(n) {
  const c = jedCell(n, "sched");
  const f = n.f || {};
  c.strike = Boolean(jedEtd(n).text) && (f.est || {}).st !== "conflict" &&
    (f.sched || {}).st !== "conflict";
  return c;
}

function jedIsClock(c) {
  const p = String(c).split(":");
  return p.length === 2 && p[1].length === 2 && !isNaN(Number(p[0])) && !isNaN(Number(p[1]));
}

// الوقت بخانتين للساعة كما تقبله خانة الوقت في الصفحة: 9:05 ← 09:05.
function jedClock(c) {
  const s = String(c || "");
  if (!jedIsClock(s)) return "";
  return s.length === 4 ? "0" + s : s;
}

function jedNextDay(day) {
  const p = day.split("-");
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + 1);
  return d.getFullYear() + "-" + wlPad2(d.getMonth() + 1) + "-" + wlPad2(d.getDate());
}

`;
}

/** الجزء 5 من 6 من نصّ `getJedTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTextCodePart5() {
  return `
// لحظة الإقلاع {dof, clock} بقاعدة departure_moment في cleanup.py.
function jedDeparture(day, n) {
  const f = n.f || {};
  const clocks = jedDepartureClocks(f);
  const sched = jedTimes(f.sched).slice().sort();
  let best = null;
  for (let i = 0; i < clocks.length; i++) {
    const c = jedClock(clocks[i]);
    if (!c) return null;
    const dof = (sched.length && sched[0] >= "18:00" && c < "06:00") ? jedNextDay(day) : day;
    if (!best || dof + c > best.dof + best.clock) best = { dof: dof, clock: c };
  }
  return best;
}

// أوقات الإقلاع المقدَّرة، وإن لم توجد فالمجدولة.
function jedDepartureClocks(f) {
  let clocks = jedTimes(f.est);
  if (!clocks.length) clocks = jedTimes(f.sched);
  return clocks;
}
`;
}

/** الجزء 6 من 6 من نصّ `getJedTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTextCodePart6() {
  return `
function jedTtd(day, n) {
  const dep = jedDeparture(day, n);
  return dep ? wlTtd(dep.dof, dep.clock) : "—";
}

function jedClockOf(stamp) {
  return stamp ? String(stamp).slice(11, 16) : "—";
}
`;
}

module.exports = Object.freeze({ getJedTextCode });
