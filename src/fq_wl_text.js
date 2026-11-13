// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: align-left;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_wl_text.js

/**
 * @module fq_wl_text
 * @description المسؤولية الواحدة: حالات نموذج T4 ونصّ مخرجاته. دوال خالصة
 * بلا DOM وبلا شبكة، فهي وحدها القابلة للاختبار مباشرة.
 *
 * ═══ ما هذا النموذج ولماذا وحداته منفصلة عن وحدات نموذج F ═══
 * تيوب T4 فيه علامتان عائمتان: «F» تفتح نموذج أعداد الركاب القائم،
 * و«T4» تفتح هذا النموذج. وقرار المستخدم ٢٠٢٦-٠٩-٢٦: «الأفضل أن تفصل
 * المخرجات ليكون كل نموذج مستقل في قسم داخل تيوب T4». فلكلٍّ قسم مخرجات
 * وأزرار ومسار قاعدة مستقلّ، ولا يمسّ «جديد» في أحدهما مخرجات الآخر.
 *
 * والبادئة هنا `wl` لا `t4`: البادئة الثانية محجوزة بكاملها لنموذج F،
 * واسمان متشابهان في نطاق واحد يصطدمان. و`wl` من Welcome Lounge، وهي
 * مادّة هذا النموذج: عدد المسافرين في منطقة الاستقبال وحالتهم.
 *
 * ═══ الشكل الذي حدّده المستخدم ٢٠٢٦-٠٩-٢٦ — كتلة لكل رحلة ═══
 * ألغى هذا القرار شكلَ «سطر واحد لكل تسجيل» الذي كان قبله في اليوم نفسه.
 *
 *   FLT NO SM990 | DEST Alexandria | STD 02:20
 *   TTD 04:50 | WL PAX 40 | APV PAX 80
 *   HLD PAX 80 | IND PAX 8 | BUS CNT 5 | BUS HLD 2
 *   - 40 | WL
 *   - 45 | APV
 *
 *   FLT NO SV800 | DEST Jakarta | STD 23:40
 *   ...
 *
 * وبين كل رحلة ورحلة سطر فارغ. والاختصارات كما أملاها المستخدم:
 *
 * | الاختصار | معناه |
 * |---|---|
 * | `TTD` | الوقت المتبقي على الإقلاع من الآن، عدّادًا تنازليًّا `HH:MM` |
 * | `WL PAX` · `APV PAX` · `HLD PAX` | مجموع الأعداد المسجَّلة بتلك الحالة |
 * | `IND PAX` | مجموع عدد الأفراد المسجَّل للرحلة |
 * | `BUS CNT` | عدد كل الأسطر المسجَّلة للرحلة |
 * | `BUS HLD` | عدد الأسطر المسجَّلة بحالة `HLD` |
 *
 * **وثلاثة قيود صرّح بها المستخدم بعد سؤاله، فلا تُنقض بالاستنتاج:**
 *
 * ١) `BUS CNT` يحسب **كل** الأسطر بلا استثناء — ولا يستثني `ENR`. (كان في
 *    مثاله الثالث ٦ لثمانية أسطر، فبيّن أن الرقم في المثال سهو.)
 * ٢) الأسطر داخل الكتلة **بترتيب تسجيلها** لا مرتَّبة بالحالة، فتسلسل
 *    الحالات هو الخبر نفسه.
 * ٣) التجميع **بالرحلة والتاريخ معًا**: الرحلة نفسها في يومين كتلتان، فلا
 *    تختلط أعداد يومين في عنوان واحد. والتاريخ لا يظهر في النص.
 *
 * و`TTD` **هو الوقت المتبقي نفسه** الذي تعرضه جداول الرحلات في عمود
 * «متبقي» (`fmtRemain` في `fq_helpers`): الفرق في الصياغة وحدها — هناك
 * «٤ س ٥٠ د» وهنا `04:50` كما طلب المستخدم. والحساب من التاريخ والوقت
 * المسجَّلين في السطر، فهو مطابق للحظة الإقلاع نفسها التي تقيسها الجداول.
 * وبعد الإقلاع يُطبع `00:00` ولا يُطبع رقم سالب.
 */

function getWlTextCode() {
  return getWlTextCodePart1() +
    getWlTextCodePart2() +
    getWlTextCodePart3() +
    getWlTextCodePart4() +
    getWlTextCodePart5() +
    getWlTextCodePart6() +
    getWlTextCodePart7();
}

/** الجزء 1 من 7 من نصّ `getWlTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlTextCodePart1() {
  return `
// ═══ T4: حالات منطقة الاستقبال ═══
// الرمز نفسه هو المخزَّن وهو المطبوع — بخلاف نموذج F الذي يخزّن مفتاحًا
// ويطبع رمزًا تعبيريًّا. السبب أن المستخدم حدّد هذه الرموز نصًّا في
// المخرجات، فترجمتها إلى مفاتيح ثم إعادتها طبقةٌ بلا فائدة.
const WL_STATUSES = ["APV", "WL", "CNL", "HLD", "ENR", "HLD-WL", "IND WL"];

// المعنى العربي لكل رمز كما أملاه المستخدم. لا يظهر في المخرجات — هي
// بالإنجليزية — بل يُقرأ للمكفوفين على أزرار الحالة (aria-label).
const WL_STATUS_AR = {
  "APV": "تمت الموافقة بالتفريج",
  "WL": "تسكين في منطقة الاستقبال",
  "CNL": "الرحلة ملغاة",
  "HLD": "منطقة انتظار الحافلة",
  "ENR": "في الطريق من الفرز إلى الصالة",
  "HLD-WL": "انتظار في منطقة الاستقبال بعد استلام البوردنق",
  "IND WL": "أفراد في منطقة الاستقبال"
};

// الفاصل بين عنوان الرحلة وأسطر حافلاتها — طلب المستخدم ٢٠٢٦-٠٩-٢٦.\nconst WL_SEP = "———";\n\nfunction wlStatusLabel(code) {
  return WL_STATUS_AR[String(code || "").toUpperCase()] || "";
}

function wlIsStatus(value) {
  return WL_STATUSES.indexOf(String(value || "").toUpperCase()) >= 0;
}
`;
}

/** الجزء 2 من 7 من نصّ `getWlTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlTextCodePart2() {
  return `
// ═══ التجميع: بالرحلة والتاريخ معًا (اختيار المستخدم ٢٠٢٦-٠٩-٢٦) ═══
// الرقم وحده يدمج رحلتين في يومين مختلفين فتختلط أعدادهما في عنوان واحد.
function wlGroupKey(entry) {
  return String(entry.flt || "").toUpperCase() + " @ " + String(entry.dof || "");
}

// ترتيب الكتل بأول ظهور، وعنوان الكتلة من أول سطر فيها.
function wlGroupEntries(entries) {
  const order = [];
  const map = {};
  for (let i = 0; i < entries.length; i++) wlGroupAdd(map, order, entries[i]);
  const out = [];
  for (let j = 0; j < order.length; j++) out.push(map[order[j]]);
  return out;
}

// يضيف سطرًا إلى كتلته، وينشئ الكتلة بأول ظهور لمفتاحها.
function wlGroupAdd(map, order, e) {
  // لا يُسقَط سطرٌ بلا رقم رحلة: صار كل حقل اختياريًّا ٢٠٢٦-٠٩-٢٦،
  // وإسقاطه يُخفي سطرًا محفوظًا في القاعدة عن عين الموظف.
  if (!e) return;
  const key = wlGroupKey(e);
  if (!map[key]) {
    map[key] = { flt: e.flt, dof: e.dof, std: e.std, dest: e.dest, rows: [] };
    order.push(key);
  }
  map[key].rows.push(e);
}
`;
}

/** الجزء 3 من 7 من نصّ `getWlTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlTextCodePart3() {
  return `
// ═══ لحظة الإقلاع من التاريخ والوقت المسجَّلين ═══
// لا padStart هنا: هي من ECMAScript 2017 والوثائق لا تضمن إلا ES6.
function wlPad2(n) {
  return (n < 10 ? "0" : "") + n;
}

function wlDepTime(dof, std) {
  const dp = String(dof || "").split("-");
  const tp = String(std || "").split(":");
  if (dp.length < 3 || tp.length < 2) return null;
  const d = new Date(Number(dp[0]), Number(dp[1]) - 1, Number(dp[2]),
    Number(tp[0]), Number(tp[1]));
  if (isNaN(d.getTime())) return null;
  return d;
}

// TTD — عدّاد تنازلي HH:MM. وبعد الإقلاع 00:00 لا رقم سالب.
function wlTtd(dof, std, nowMs) {
  const dep = wlDepTime(dof, std);
  if (!dep) return "00:00";
  const ref = typeof nowMs === "number" ? nowMs : Date.now();
  const mins = Math.floor((dep.getTime() - ref) / 60000);
  if (mins <= 0) return "00:00";
  return wlPad2(Math.floor(mins / 60)) + ":" + wlPad2(mins % 60);
}

// ═══ الدلو: أين يُحسب السطر ═══
// حالة IND WL تُحسب في WL: هي أفراد ينتظرون في منطقة الاستقبال، فمكانهم
// مكان المسكَّنين فيها. وسائر الحالات تُحسب في نفسها.
function wlBucket(sts) {
  const up = String(sts || "").toUpperCase();
  return up === "IND WL" ? "WL" : up;
}
`;
}

/** الجزء 4 من 7 من نصّ `getWlTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlTextCodePart4() {
  return `
// ═══ سطر أفراد لا سطر حافلة ═══
// «IND PAX لا يحسب بسطر، أي BUS CNT لا يحسب اي سطر IND PAX أبدا» — تصريح
// المستخدم ٢٠٢٦-٠٩-٢٦. فالسطر الذي فيه عدد أفراد ليس حافلة: لا يُطبع له
// سطر في المخرجات ولا يُعَدّ في BUS CNT ولا في BUS HLD. والحالة IND WL
// تجعله سطر أفراد ولو تُرك حقل الأفراد فارغًا.
function wlIsInd(entry) {
  if (String(entry.ind || "").trim() !== "") return true;
  return String(entry.sts || "").toUpperCase() === "IND WL";
}

function wlBusRows(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    if (!wlIsInd(rows[i])) out.push(rows[i]);
  }
  return out;
}
`;
}

/** الجزء 5 من 7 من نصّ `getWlTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlTextCodePart5() {
  return `
// ═══ المجاميع والأعداد — قاعدة واحدة لكل حالة ═══
// وعدد الأفراد يُحسب في دلو حالته كما يُحسب عدد الحافلة في دلوها (تصريح
// المستخدم): فإن كانت IND WL أُضيف إلى WL PAX، وإن غُيّرت إلى APV رحل
// إلى APV PAX. فالجمع هنا على العددين معًا لا على عدد الحافلة وحده.
function wlSumPax(rows, sts) {
  let total = 0;
  for (let i = 0; i < rows.length; i++) {
    if (wlBucket(rows[i].sts) !== sts) continue;
    total += (Number(rows[i].pax) || 0) + (Number(rows[i].ind) || 0);
  }
  return total;
}

// عدد الحافلات بحالةٍ ما: أسطر الحافلات وحدها، فسطر الأفراد ليس حافلة.
function wlCountSts(rows, sts) {
  const bus = wlBusRows(rows);
  let n = 0;
  for (let i = 0; i < bus.length; i++) {
    if (wlBucket(bus[i].sts) === sts) n++;
  }
  return n;
}

// مجموع الأفراد للرحلة، أيًّا كانت حالاتهم. والفارغ صفر.
function wlSumInd(rows) {
  let total = 0;
  for (let i = 0; i < rows.length; i++) total += Number(rows[i].ind) || 0;
  return total;
}
`;
}

/** الجزء 6 من 7 من نصّ `getWlTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlTextCodePart6() {
  return `
// ═══ أسطر العنوان الأربعة (ترتيب المستخدم ٢٠٢٦-٠٩-٢٦) ═══
// كان ثلاثة، فالتفّ الثالث إلى أربعة عند لصقه في واتساب — وواتساب لا
// تُضبط أنماطه من هنا. فنقل المستخدم IND PAX إلى سطر رابع مستقلّ وقصّر
// الثالث، فصار الشكل هو نفسه في الشاشة وفي واتساب.
function wlHeadFlight(group) {
  return "FLT NO " + group.flt + " | DEST " + group.dest + " | STD " + group.std;
}

function wlHeadCounts(group, nowMs) {
  return "TTD " + wlTtd(group.dof, group.std, nowMs) +
    " | WL PAX " + wlSumPax(group.rows, "WL") +
    " | APV PAX " + wlSumPax(group.rows, "APV");
}

function wlHeadBuses(group) {
  return "HLD PAX " + wlSumPax(group.rows, "HLD") +
    " | BUS CNT " + wlBusRows(group.rows).length +
    " | BUS HLD " + wlCountSts(group.rows, "HLD");
}

function wlHeadInd(group) {
  return "IND PAX " + wlSumInd(group.rows);
}

// ═══ سطر تسجيل: شَرطة، مسافة، العدد، فاصل، الحالة ═══
// والعدد اختياري: إن تُرك فارغًا سقط من السطر ولم يُطبع مكانه فراغٌ
// معلَّق ولا صفرٌ لم يقله أحد — فالحافلة مسجَّلة وعددها غير معروف بعد.
function wlEntryLine(entry) {
  const pax = String(entry.pax == null ? "" : entry.pax).trim();
  const sts = String(entry.sts || "").toUpperCase();
  return pax ? "- " + pax + " | " + sts : "- | " + sts;
}

// ═══ كتلة رحلة واحدة: أربعة أسطر عنوان، فاصل، ثم سطر لكل حافلة ═══
// والفاصل لا يُطبع إن لم تكن تحته أسطر (رحلةٌ أفرادها فقط)، فلا يبقى
// خطٌّ معلَّق لا يفصل شيئًا عن شيء.
function wlGroupBlock(group, nowMs) {
  const lines = [wlHeadFlight(group), wlHeadCounts(group, nowMs),
    wlHeadBuses(group), wlHeadInd(group)];
  const bus = wlBusRows(group.rows);
  if (bus.length > 0) lines.push(WL_SEP);
  for (let i = 0; i < bus.length; i++) lines.push(wlEntryLine(bus[i]));
  return lines.join("\\n");
}
`;
}

/** الجزء 7 من 7 من نصّ `getWlTextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlTextCodePart7() {
  return `
// ═══ النص الكامل: كتلة لكل رحلة، يفصلها سطر فارغ ═══
function wlBuildText(entries, nowMs) {
  const groups = wlGroupEntries(entries);
  const blocks = [];
  for (let i = 0; i < groups.length; i++) blocks.push(wlGroupBlock(groups[i], nowMs));
  return blocks.join("\\n\\n");
}
`;
}

module.exports = Object.freeze({ getWlTextCode });
