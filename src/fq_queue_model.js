// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: calculator;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_queue_model.js

/**
 * @module fq_queue_model
 * @description المسؤولية الواحدة: **قواعد الطابور، خالصةً**. لا DOM ولا
 * شبكة ولا مؤقتات ولا تخزين — دوالّ تأخذ قيمًا وتُرجع قيمًا.
 *
 * ولهذا العزل ثمنٌ وفائدة: الفائدة أن هذه الوحدة **الوحيدة** في عائلة
 * الطابور التي تُختبر بلا صفحة ولا قاعدة، فتُقاس قراراتها مباشرة كما
 * تُقاس مخرجات `fq_t4_text`. وهو نفس ما كانت تفعله `fq_monitor_model` في طبقة
 * الرصد (نُقلت إلى attic في ٢٠٢٦-٠٩-٣٠)، والسابقة في المشروع لا اختراع.
 *
 * **الأرقام هنا مأخوذة من الرصد لا من تقدير**: إعدادات الرصد في `fq_monitor_base`
 * تستعمل سقفًا ٥٠٠ وحدَّ رفضٍ ٥. السقف هنا **٣٠٠** لأن هذه سجلات عمل
 * يكتبها موظف بيده لا أحداث تتبّع تتولّد آليًّا، فبلوغ ٣٠٠ يعني خللًا
 * طويلًا يستحقّ أن يُرى لا أن يُبتلع.
 */

function getQueueModelCode() {
  return getQueueModelCodePart1() +
    getQueueModelCodePart2() +
    getQueueModelCodePart3() +
    getQueueModelCodePart4() +
    getQueueModelCodePart5();
}

/** الجزء 1 من 5 من نصّ `getQueueModelCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueModelCodePart1() {
  return `
// ═══ الطابور: القواعد الخالصة ═══
const FQ_Q_LIMIT = 300;
const FQ_Q_MAX_ATTEMPTS = 5;
const FQ_Q_BACKOFF_BASE_MS = 2000;
const FQ_Q_BACKOFF_MAX_MS = 60000;

// معرّف داخلي للعنصر — للعرض والإزالة، لا يُرسل إلى القاعدة.
function fqQueueId() {
  return Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 5);
}

// ═══ العنصر يُبنى مرّة واحدة عند الإدراج ═══
// **والمسار جزء منه لا يُعاد حسابه**: مفاتيح مثل t4NewKey و مفتاح سجل
// التدقيق تُولَّد بالوقت والعشوائية لحظة النداء. لو أُعيد توليدها عند كل
// محاولة إرسال لأنتجت المحاولة الثانية سجلًّا ثانيًا بدل تصحيح الأول.
// بتجميد المسار هنا تصير إعادة الإرسال **متكافئة**: PUT أو PATCH على
// المفتاح نفسه يكتب فوق نفسه مهما تكرّر.
function fqQueueItem(req) {
  return {
    id: fqQueueId(),
    path: req.path,
    method: req.method || "PUT",
    body: (req.body === undefined) ? null : req.body,
    kind: req.kind || "",
    label: req.label || "",
    at: Date.now(),
    attempts: 0,
    nextAt: 0,
    blocked: false,
    // ═══ عنصر مرتبط بما قبله ═══
    // مُعرِّف عنصرٍ **يجب أن يصل أولًا**، أو سلسلة فارغة إن كان مستقلًّا.
    // ولد هذا من تعديل رحلة يغيّر مفتاحها: كتابةُ المفتاح الجديد ثم حذف
    // القديم. والترتيب وحده لا يكفي — العنصر المعزول تتخطّاه fqQueueNext،
    // فلو عُزلت الكتابة ومضى الحذف **اختفت الرحلة**. فالارتباط شرطٌ لا
    // ترتيب: ما دام after غير فارغ فالعنصر لا يُرسل البتّة.
    after: req.after || "",
    error: ""
  };
}
`;
}

/** الجزء 2 من 5 من نصّ `getQueueModelCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueModelCodePart2() {
  return `
// ═══ السقف: يُسقط الأقدم لا الأحدث ═══
// الأحدث أقرب إلى ما ينتظره الموظف على الشاشة الآن، والأقدم أقرب إلى ما
// نسيه. وهذا اتجاه slice(-limit) نفسه في _applyQueueLimit بطبقة الرصد.
function fqQueueCap(list, limit) {
  const max = (typeof limit === "number" && limit > 0) ? limit : FQ_Q_LIMIT;
  const over = list.length - max;
  // removed: المُسقَطون أنفسهم لا عددهم — يحتاجهم المستدعي ليُسقط من كان
  // ينتظرهم (fqQueueDropDependents).
  if (over <= 0) return { kept: list, dropped: 0, removed: [] };
  return { kept: list.slice(over), dropped: over, removed: list.slice(0, over) };
}

// العابر وحده يُعاد. والممنوع والمعطوب إعادتهما عبثٌ يسدّ ما خلفهما.
function fqQueueRetryable(kind) {
  return kind === "transient";
}

// تراجع أُسّي بسقف: المحاولة الأولى بعد ثانيتين والثانية بعد أربع، فلا
// يُلحّ على شبكة غائبة، ولا يتجاوز الانتظار دقيقة فيبدو الطابور معطَّلًا.
function fqQueueBackoffMs(attempts) {
  const n = (typeof attempts === "number" && attempts > 0) ? attempts : 1;
  const wait = FQ_Q_BACKOFF_BASE_MS * Math.pow(2, n - 1);
  return wait > FQ_Q_BACKOFF_MAX_MS ? FQ_Q_BACKOFF_MAX_MS : wait;
}
`;
}

/** الجزء 3 من 5 من نصّ `getQueueModelCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueModelCodePart3() {
  return `
// ═══ ما يصير بالعنصر بعد محاولة فاشلة ═══
// يُرجع العنصر نفسه معدَّلًا: إمّا موعدًا جديدًا، أو معزولًا.
// العزل لا يعني الحذف — العنصر يبقى ظاهرًا بسببه، لأن اختفاء عمل الموظف
// بلا أثر هو بالضبط ما بُني الطابور لمنعه.
function fqQueueAfterFailure(item, kind, error) {
  item.attempts += 1;
  item.error = error || "";
  if (!fqQueueRetryable(kind) || item.attempts >= FQ_Q_MAX_ATTEMPTS) {
    item.blocked = true;
    item.nextAt = 0;
    return item;
  }
  item.nextAt = Date.now() + fqQueueBackoffMs(item.attempts);
  return item;
}

// العنصر جاهز للإرسال إن لم يكن معزولًا، ولم ينتظر سابقًا له، وحلّ موعده.
// و after يُمحى لحظة وصول السابق (fqQueueUnlock)، فالجاهزية تُقرأ من
// العنصر نفسه ولا تحتاج البحث في القائمة كلها عند كل دورة.
function fqQueueReady(item, now) {
  if (!item || item.blocked) return false;
  if (item.after) return false;
  return (item.nextAt || 0) <= now;
}

// ═══ وصل السابق فانفكّ اللاحق ═══
// تُستدعى بعد إزالة عنصر **وصل فعلًا**. أمّا العنصر الذي يخرج بلا وصول
// (إسقاط السقف) فله fqQueueDropDependents: لاحقُه لا يُفَكّ بل يُزال معه.
function fqQueueUnlock(list, doneId) {
  let n = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].after !== doneId) continue;
    list[i].after = "";
    n++;
  }
  return n;
}
`;
}

/** الجزء 4 من 5 من نصّ `getQueueModelCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueModelCodePart4() {
  return `
// ═══ مات السابق فيموت اللاحق ═══
// إزالة لا عزل: حذفُ مفتاحٍ لم تُكتب نسخته الجديدة قطّ يمحو الرحلة.
// وأسلم فشلٍ هنا أن يبقى المخزون كما كان وكأنّ التعديل لم يقع.
// وتتسلسل: لاحقُ اللاحق يموت أيضًا، فلا يبقى في الطابور يتيمٌ ينتظر أبدًا.
function fqQueueDropDependents(list, deadId) {
  let kept = [];
  let dropped = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].after === deadId) dropped.push(list[i]);
    else kept.push(list[i]);
  }
  for (let j = 0; j < dropped.length; j++) {
    const deeper = fqQueueDropDependents(kept, dropped[j].id);
    kept = deeper.kept;
    dropped = dropped.concat(deeper.dropped);
  }
  return { kept: kept, dropped: dropped };
}

// أول عنصر جاهز **بترتيب الإدراج**. لا يقفز أحدٌ فوق أحد: الترتيب هو ما
// يمنع وصول حذفِ مفتاحٍ قبل كتابته.
function fqQueueNext(list, now) {
  for (let i = 0; i < list.length; i++) {
    if (fqQueueReady(list[i], now)) return list[i];
  }
  return null;
}

function fqQueueCountBlocked(list) {
  let n = 0;
  for (let i = 0; i < list.length; i++) if (list[i].blocked) n++;
  return n;
}

// كم عنصرًا سيصل بمرور الوقت وحده؟ (لا يحسب nextAt: من ينتظر موعدًا هو
// من يحتاج المؤقت أصلًا.) وهذا ما يقرّر حياة المؤقت: طابورٌ كلّه معزول،
// أو لاحقٌ ينتظر سابقًا معزولًا، لا يفيده مرور الوقت في شيء.
function fqQueueCountSendable(list) {
  let n = 0;
  for (let i = 0; i < list.length; i++) {
    if (!list[i].blocked && !list[i].after) n++;
  }
  return n;
}
`;
}

/** الجزء 5 من 5 من نصّ `getQueueModelCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueModelCodePart5() {
  return `
// نصّ ما يراه الموظف. المعزول يُسمّى «متوقّف» لا «قيد الإرسال»، فالفرق
// بينهما هو الفرق بين انتظارٍ ينتهي وانتظارٍ لا ينتهي بلا تدخّل.
function fqQueueStatusText(depth, blocked) {
  if (depth <= 0) return "";
  if (blocked >= depth) return blocked + " متوقّفة — تحتاج تدخّلًا";
  if (blocked > 0) return (depth - blocked) + " قيد الإرسال · " + blocked + " متوقّفة";
  return depth + " قيد الإرسال";
}
`;
}

module.exports = Object.freeze({ getQueueModelCode });
