// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: inbox;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_queue_store.js

/**
 * @module fq_queue_store
 * @description المسؤولية الواحدة: **حيازة الطابور ونشره**. لا شبكة ولا
 * قرار إعادة محاولة — القرارات كلها في `fq_queue_model`.
 *
 * **أين يعيش الطابور**: مصفوفة في الصفحة، وصورةٌ منها في
 * `window._FQ_QUEUE` يقرؤها `fq_main` فيكتبها في `fq_queue.json` على
 * الجهاز. هذا هو الجسر القائم في المشروع (`CLAUDE.md` القسم ٤٫٣) لا آلية
 * رابعة: الصفحة تكتب في متغيّر عام، والسكربت الأم يقرؤه.
 *
 * **ولماذا محليًّا وقد كان ممنوعًا**: قرار المستخدم ٢٠٢٦-٠٩-٢٤ كان
 * «الحفظ في القاعدة لا محليًّا»، وهو **باقٍ على حاله**: المخرجات
 * المحفوظة لا نسخة لها على الجهاز. والمخزَّن هنا شيء آخر تمامًا — **ما لم
 * يصل بعد**، ويُمحى من الملف لحظة وصوله. نقضٌ جزئيّ مقصود وافق عليه
 * المستخدم ٢٠٢٦-٠٩-٢٥، ومسجَّل في `docs/الذاكرة.md`.
 *
 * **ولا يسمّي هذا الملف من يُرسل**: `fqEnqueue` تُعلن بـ
 * `fqQueueAnnounce` ومن يهمّه الأمر يسجّل نفسه بـ `fqOnQueueChange` —
 * نفس ما فعله `t4AnnounceChange` حين فُكّت حلقة الاعتماد في T4.
 * فالاعتماد نازل: model ← store ← flush ← view.
 */

function getQueueStoreCode() {
  return getQueueStoreCodePart1() +
    getQueueStoreCodePart2() +
    getQueueStoreCodePart3() +
    getQueueStoreCodePart4();
}

/** الجزء 1 من 4 من نصّ `getQueueStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueStoreCodePart1() {
  return `
// ═══ الطابور: الحيازة والنشر ═══
let FQ_QUEUE = [];
let FQ_Q_DROPPED = 0;
const FQ_Q_LISTENERS = [];

// ═══ مستمعون لا مستمع واحد ═══
// يهمّ التغيُّرَ أكثرُ من طرف: التفريغ يستيقظ، والشريط يُرسم، وتيوب T4
// يعيد رسم أسطره ليعلم أيّها لم يصل. ومتغيّر واحد يحمل دالة واحدة كان
// يجعل آخرَ مسجِّلٍ يمحو من قبله بصمت.
function fqOnQueueChange(fn) {
  if (typeof fn !== "function") return false;
  FQ_Q_LISTENERS.push(fn);
  return true;
}

// إخفاق مستمع لا يمنع من بعده: ثلاثتهم مستقلّون، وسقوط الرسم لا يجوز
// أن يوقف الإرسال.
function fqQueueAnnounce() {
  for (let i = 0; i < FQ_Q_LISTENERS.length; i++) {
    try { FQ_Q_LISTENERS[i](); }
    catch (e) { console.error("[fq_queue] مستمع: " + e.message); }
  }
}

// صورة الطابور للجسر. نصّ لا كائن: evaluateJavaScript يُرجع نصًّا،
// والتسلسل هنا مرّة واحدة أوضح من تسلسله في السكربت الأم.
function fqQueuePublish() {
  try {
    window._FQ_QUEUE = JSON.stringify(FQ_QUEUE);
  } catch (e) {
    console.error("[fq_queue] نشر: " + e.message);
  }
}
`;
}

/** الجزء 2 من 4 من نصّ `getQueueStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueStoreCodePart2() {
  return `
// ═══ الإقلاع من الملف ═══
// QUEUE_BOOT يحقنه fq_main من fq_queue.json كما يحقن SAVED_DATA تمامًا.
// غيابه أو عطبه ليس خطأً: طابور فارغ هو الحالة الغالبة.
function fqQueueInit() {
  const boot = (typeof QUEUE_BOOT !== "undefined" && QUEUE_BOOT) ? QUEUE_BOOT : [];
  FQ_QUEUE = Array.isArray(boot) ? boot : [];
  fqQueuePublish();
  return FQ_QUEUE.length;
}

function fqQueueDepth() { return FQ_QUEUE.length; }

function fqQueueBlockedCount() { return fqQueueCountBlocked(FQ_QUEUE); }

// ═══ هل لهذا المسار عنصر لم يصل بعد؟ ═══
// الحالة **تُشتقّ ولا تُخزَّن**: لو وُضعت علامة على السطر نفسه لوجب محوها
// عند الوصول وعند الفشل وعند إعادة المحاولة — وأول موضع يُنسى يترك سطرًا
// موسومًا بالانتظار وهو محفوظ. والطابور هو المصدر الوحيد، فالسؤال عنه
// لا يكذب أبدًا.
function fqQueueHasPath(path) {
  for (let i = 0; i < FQ_QUEUE.length; i++) {
    if (FQ_QUEUE[i].path === path) return true;
  }
  return false;
}

// عدد العناصر التي تبدأ مساراتها ببادئة — لعدّاد تيوب بعينه.
function fqQueueCountUnder(prefix) {
  let n = 0;
  for (let i = 0; i < FQ_QUEUE.length; i++) {
    if (String(FQ_QUEUE[i].path).indexOf(prefix) === 0) n++;
  }
  return n;
}

function fqQueueDropped() { return FQ_Q_DROPPED; }
`;
}

/** الجزء 3 من 4 من نصّ `getQueueStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueStoreCodePart3() {
  return `
// إزالةٌ بعد وصول. تفكّ من كان ينتظر هذا العنصر، فيصير جاهزًا في الدورة
// التالية مباشرة.
function fqQueueRemove(id) {
  for (let i = 0; i < FQ_QUEUE.length; i++) {
    if (FQ_QUEUE[i].id !== id) continue;
    FQ_QUEUE.splice(i, 1);
    fqQueueUnlock(FQ_QUEUE, id);
    fqQueuePublish();
    fqQueueAnnounce();
    return true;
  }
  return false;
}

// ═══ إسقاط السقف يجرّ لاحقيه معه ═══
// الأقدم يُسقط أولًا، والسابق أقدم من لاحقه دائمًا — فأول ما يُسقطه السقف
// قد يكون كتابةً ينتظرها حذف. وترك الحذف وحده يمحو الرحلة، فيخرج معه.
function fqQueueDropWithDependents(dropped) {
  let extra = 0;
  for (let i = 0; i < dropped.length; i++) {
    const r = fqQueueDropDependents(FQ_QUEUE, dropped[i].id);
    FQ_QUEUE = r.kept;
    extra += r.dropped.length;
  }
  return extra;
}

// يُستدعى بعد تعديل عنصر في مكانه (محاولة فاشلة)، فالمصفوفة نفسها تغيّرت.
function fqQueueTouch() {
  fqQueuePublish();
  fqQueueAnnounce();
}
`;
}

/** الجزء 4 من 4 من نصّ `getQueueStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueStoreCodePart4() {
  return `
// ═══ الإدراج — المدخل العامّ الوحيد ═══
// يُرجع فورًا ولا ينتظر شبكة: الانتظار هنا يعيد المشكلة التي جاء الطابور
// لحلّها. والإرسال يتكفّل به من سجّل نفسه بـ fqOnQueueChange.
function fqEnqueue(req) {
  if (!req || !req.path) {
    console.error("[fq_queue] إدراج بلا مسار — أُهمل");
    return { queued: false, id: "" };
  }
  const item = fqQueueItem(req);
  FQ_QUEUE.push(item);
  fqQueueApplyCap();
  fqQueuePublish();
  fqQueueAnnounce();
  return { queued: true, id: item.id };
}

// سقف الطابور: يُسقط الأقدم ومن يتبعه، ويعدّهم في FQ_Q_DROPPED.
function fqQueueApplyCap() {
  const capped = fqQueueCap(FQ_QUEUE, FQ_Q_LIMIT);
  if (!(capped.dropped > 0)) return;
  FQ_QUEUE = capped.kept;
  const extra = fqQueueDropWithDependents(capped.removed);
  FQ_Q_DROPPED += capped.dropped + extra;
  console.error("[fq_queue] تجاوز السقف — أُسقط " + (capped.dropped + extra));
}

fqQueueInit();
`;
}

module.exports = Object.freeze({ getQueueStoreCode });
