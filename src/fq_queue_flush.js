// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: cloud-upload-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_queue_flush.js

/**
 * @module fq_queue_flush
 * @description المسؤولية الواحدة: **إخراج ما في الطابور إلى القاعدة**.
 * لا يبني عنصرًا ولا يقرّر سقفًا — يأخذ القرار من `fq_queue_model`
 * والعناصر من `fq_queue_store`، ويرسل عبر الباب الواحد `fqRequest`.
 *
 * **عامل واحد متسلسل، بلا تزامن — وهذا أهمّ قرار في الوحدة كلها.**
 * لو أُرسل عنصران معًا لأمكن أن يسبق `DELETE` مفتاحٍ الـ`PATCH` الذي
 * قبله، فيعود السطر المحذوف من قبره. والترتيب المتسلسل يجعل هذا مستحيلًا
 * بنيويًّا لا بالانضباط. وطبقة الرصد لم تحتج هذا لأنها ترسل دفعتها في
 * **طلب واحد**، وهنا كل عنصر مسار مستقلّ.
 *
 * **ولا يُرسل شيء عند فشل عنصر أمامه**: الحلقة تقف عند أول إخفاق عابر،
 * فالشبكة الغائبة غائبة عن الجميع، ومواصلةُ الطرق عليها تستهلك ولا تُفيد.
 * أمّا المعزول فلا يوقف شيئًا — `fqQueueNext` تتجاوزه (وهو معنى ألّا يسدّ
 * ما خلفه).
 *
 * **والمؤقت لا يعمل على طابور فارغ**: يُنشأ عند أول إدراج ويُبطَل حين
 * يفرغ الطابور. مؤقتٌ دائم على صفحة فارغة كلفةٌ بلا مقابل.
 */

function getQueueFlushCode() {
  return getQueueFlushCodePart1() +
    getQueueFlushCodePart2() +
    getQueueFlushCodePart3() +
    getQueueFlushCodePart4();
}

/** الجزء 1 من 4 من نصّ `getQueueFlushCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueFlushCodePart1() {
  return `
// ═══ الطابور: التفريغ ═══
const FQ_Q_TICK_MS = 20000;
let FQ_Q_INFLIGHT = null;
let FQ_Q_TIMER = null;

// محاولة واحدة على عنصر واحد. تُرجع صنف الفشل أو سلسلة فارغة عند النجاح،
// فالحلقة تقرّر بها أتُكمل أم تقف.
async function fqQueueSendOne(item) {
  const res = await fqRequest({
    path: item.path, method: item.method, body: item.body
  });
  if (res.ok) {
    fqQueueRemove(item.id);
    return "";
  }
  fqQueueAfterFailure(item, res.kind, res.error);
  fqQueueTouch();
  return res.kind;
}

// ═══ الحلقة ═══
// كل دورة إمّا تُزيل عنصرًا (تقدُّم مؤكَّد) أو تقف، فلا دوران لا ينتهي.
// والوقوف عند أول إخفاق عابر مقصود: الشبكة الغائبة غائبة عن الجميع،
// ومواصلةُ الطرق عليها تستهلك ولا تُفيد. أمّا المعزول فلا يوقف شيئًا لأن
// fqQueueNext تتجاوزه — وهو معنى ألّا يسدّ ما خلفه.
// والحدّ الأقصى للدورات حزامُ أمان لا منطق: ناقلٌ يُرجع نجاحًا بلا إزالة
// خللٌ برمجيّ، والدوران الأبدي أسوأ تجسيد له.
async function fqQueueDrain() {
  const tally = { sent: 0, failed: 0 };
  let guard = FQ_Q_LIMIT * 2;
  while (guard-- > 0) {
    const item = fqQueueNext(FQ_QUEUE, Date.now());
    if (!item) break;
    if (!fqQueueTally(tally, await fqQueueSendOne(item))) break;
  }
  return { sent: tally.sent, failed: tally.failed, left: fqQueueDepth() };
}

// يعدّ نتيجة إرسالٍ واحد، ويُرجع true ما دام التفريغ يمضي (وصل العنصر).
function fqQueueTally(tally, kind) {
  if (kind === "") { tally.sent++; return true; }
  tally.failed++;
  return false;
}
`;
}

/** الجزء 2 من 4 من نصّ `getQueueFlushCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueFlushCodePart2() {
  return `
// ═══ نداء واحد مهما تعدّد المنادون ═══
// المؤقت والإدراج وعودة الاتصال وزرّ الموظف كلها تنادي هذه. ودخولان
// متوازيان يعنيان عاملين متزامنين — وهو ما مُنع في رأس الملف.
//
// **والمنادي الثاني ينضمّ إلى الجاري ولا يُصرَف بلا شيء.** كان يُرجع
// {sent:0} فورًا، فيظنّ المستدعي أن لا شيء أُرسل بينما التفريغ يعمل —
// وهذا ما جعل زرّ «أعد المحاولة» يُرجع نتيجة كاذبة. الوعد نفسه يُعاد،
// فيصف الجوابُ ما جرى فعلًا.
function fqQueueFlush() {
  if (FQ_Q_INFLIGHT) return FQ_Q_INFLIGHT;
  FQ_Q_INFLIGHT = fqQueueDrain().then(function (result) {
    FQ_Q_INFLIGHT = null;
    fqQueueTick();
    return result;
  }, function (error) {
    FQ_Q_INFLIGHT = null;
    fqQueueTick();
    throw error;
  });
  return FQ_Q_INFLIGHT;
}
`;
}

/** الجزء 3 من 4 من نصّ `getQueueFlushCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueFlushCodePart3() {
  return `
// ═══ المؤقت: يحيا مع الطابور ويموت معه ═══
function fqQueueStopTimer() {
  if (!FQ_Q_TIMER) return false;
  clearInterval(FQ_Q_TIMER);
  FQ_Q_TIMER = null;
  return true;
}

function fqQueueStartTimer() {
  if (FQ_Q_TIMER) return false;
  FQ_Q_TIMER = setInterval(function () {
    fqQueueFlush();
  }, FQ_Q_TICK_MS);
  return true;
}

// عنصر واحد يفيده مرور الوقت يكفي لإبقاء المؤقت. أمّا المعزول فينتظر
// تدخّلًا، واللاحق ينتظر سابقه لا الساعة — فطابورٌ لا سبيل فيه إلا هذين
// لا معنى لإيقاظه كل عشرين ثانية.
function fqQueueTick() {
  if (fqQueueCountSendable(FQ_QUEUE) > 0) fqQueueStartTimer();
  else fqQueueStopTimer();
}

// ═══ إعادة المحاولة بطلب الموظف ═══
// ترفع العزل عن الجميع وتُعيد العدّادات، فالزرّ يعني «حاول الآن من جديد»
// لا «حاول ما لم ييأس منه النظام».
function fqQueueRetryAll() {
  for (let i = 0; i < FQ_QUEUE.length; i++) {
    FQ_QUEUE[i].blocked = false;
    FQ_QUEUE[i].attempts = 0;
    FQ_QUEUE[i].nextAt = 0;
  }
  fqQueueTouch();
  return fqQueueFlush();
}
`;
}

/** الجزء 4 من 4 من نصّ `getQueueFlushCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueFlushCodePart4() {
  return `
// ═══ ما يجري عند كل تغيّر في الطابور ═══
// أمران: الشاشة تُحدَّث، والتفريغ يُوقَظ. والإيقاظ هنا لا في fqEnqueue
// وحدها ليشمل كل تغيّر — والشبكة حاضرة في الغالب، فالسطر يصل في أجزاء
// من الثانية ولا يرى الموظف علامة الانتظار أصلًا.
//
// وإيقاظٌ أثناء التفريغ لا يضرّ: fqQueueFlush ترجع فورًا وهي تعمل، فلا
// عامل ثانٍ. وهذا هو ما يجعل استدعاءها من ثلاثة مواضع آمنًا.
fqOnQueueChange(function () {
  if (typeof fqQueueRender === "function") fqQueueRender();
  fqQueueFlush().catch(function (e) {
    console.error("[fq_queue] تفريغ: " + (e && e.message ? e.message : e));
  });
});

fqQueueTick();
`;
}

module.exports = Object.freeze({ getQueueFlushCode });
