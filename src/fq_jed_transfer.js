// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_jed_transfer.js

/**
 * @module fq_jed_transfer
 * @description المسؤولية الواحدة: زرّ «ترحيل البيانات» في تيوب LIVE FLT —
 * ينقل الصالة المفتوحة إلى قائمتها في تيوب كايا (أمر المالك ٢٠٢٦-١٠-٠٥،
 * والخطة `~/.claude/plans/elegant-napping-bird.md`).
 *
 * **التتابع** بعد التأكيد، في نافذة الرحلة نفسها (`fq_jed_modal`):
 * ١) كل رحلة فيها «⚠ خلاف»، واحدة بعد الأخرى: إذا حُسم كل خلاف فيها تُفتح التالية.
 * ٢) كل رحلة موعدها المتوقع غير المجدول: أيّ الوقتين يُرحَّل (وقت واحد في كايا،
 *    ولا حقل جديد في القاعدة الرئيسة — قرار المالك).
 * ٣) طلب واحد إلى قاعدة LIVE FLT، ثم انتظار ردّ الحاسوب حتى دقيقة ونصف.
 * والإغلاق بعلامة × في منتصف التتابع يلغيه، وما حُسم من خلاف يبقى محفوظًا.
 *
 * **الجوال لا يكتب في القاعدة الرئيسة هنا.** الحاسوب (`kaya_bridge.py`) ينقل
 * ويتابع كل تغيير لليوم والغد ولكل يوم جديد، ولا يحذف رحلة من كايا أبدًا.
 *
 * **الاعتماد نازل**: تعرف `fq_jed_text` و`fq_jed_store` و`fq_jed_modal`، ولا
 * يعرفها إلا `fq_jed_view`. والنافذة تبلّغ هذه الوحدة عبر دوال `JED.walk`.
 */

const jedXferCfg = importModule("fq_config");

/**
 * شيفرة زرّ الترحيل التي تعمل داخل الصفحة.
 * @returns {string} نص JavaScript للمتصفح
 */
function getJedTransferCode() {
  return getJedTransferCodePart1() +
    getJedTransferCodePart2() +
    getJedTransferCodePart3() +
    getJedTransferCodePart4() +
    getJedTransferCodePart5() +
    getJedTransferCodePart6() +
    getJedTransferCodePart7() +
    getJedTransferCodePart8() +
    getJedTransferCodePart9() +
    getJedTransferCodePart10();
}

/** الجزء 1 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart1() {
  return `
// ═══ LIVE FLT: الترحيل إلى كايا ═══
const JED_XFER_WAIT_MS = ${jedXferCfg.JED_XFER_WAIT_MS};
const JED_XFER_POLL_MS = 5000;
const JED_WAITING = {};

function jedConflictFields(n) {
  return JED_FIELDS.map(function(p) { return p[0]; }).filter(function(field) {
    return ((n.f || {})[field] || {}).st === "conflict";
  });
}

// الوقتان بعد ما حُسم في هذا التتابع، أو null إن لم يختلف المتوقع عن المجدول.
function jedClockPair(n, chosen) {
  const f = n.f || {};
  function pick(field) {
    if (chosen[field]) return chosen[field];
    const r = f[field] || {};
    return r.st === "conflict" ? "" : r.v;
  }
  const sched = jedClock(pick("sched")), est = jedClock(pick("est"));
  return sched && est && est !== sched ? { sched: sched, est: est } : null;
}

function jedTermName(t) {
  for (let i = 0; i < JED_TERMS.length; i++) if (JED_TERMS[i][0] === t) return JED_TERMS[i][1];
  return t;
}

function jedTransferAsk(t, counts, linked) {
  const name = jedTermName(t);
  let msg = linked
    ? "رحلات " + name + " مُرحَّلة. ستُعرض " + counts.conflicts + " رحلة فيها خلاف واحدة بعد الأخرى لتحسمها، ثم تنتقل إلى كايا."
    : "ستُرحَّل رحلات " + name + " إلى تيوب كايا، ويستمر تحديثها تلقائيًا كل يوم.";
  if (!linked && counts.conflicts) msg += " تحسم أولًا " + counts.conflicts + " رحلة فيها خلاف.";
  if (!linked && counts.timed) msg += " ثم تختار الوقت لـ " + counts.timed + " رحلة تغيّر موعدها.";
  return fqConfirm(msg, "ترحيل البيانات");
}
`;
}

/** الجزء 2 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart2() {
  return `
// الضغط على الزرّ.
async function jedTransferStart() {
  if (JED.walk || JED_WAITING[JED.term]) return null;
  const p = jedTransferPlan();
  const early = jedTransferEarly(p);
  if (early) return early.result;
  // بعد الترحيل يُكتب المتوقع الجديد تلقائيًا (قرار المالك)، فلا تُسأل الأوقات إلا أول مرة.
  p.times = p.linked ? [] : jedTimedKeys(p.rows);
  if (!(await jedTransferAsk(p.term, { conflicts: p.conflicts.length, timed: p.times.length }, p.linked))) return null;
  return jedWalkBegin(p);
}

`;
}

/** الجزء 3 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart3() {
  return `
// يومُ الصالة المفتوحة وصفوفها.
function jedTransferPlan() {
  const day = jedDay(), t = JED.term, store = jedStore();
  const rows = jedRows(store);
  return { day: day, term: t, rows: rows };
}

// حالتان لا يُسأل فيهما شيء: لا رحلات، أو مُرحَّلة ولا خلاف ينتظر. يُرجع {result} بعد التصرّف فيهما،
// وundefined إن لزم السؤال. ويكمل الخطةَ بحالة الربط ومفاتيح الخلافات.
function jedTransferEarly(p) {
  if (!p.day || !p.rows.length) { showToast("لا رحلات في هذه الصالة لترحيلها", "error", 2500); return { result: null }; }
  p.linked = jedLinked(p.term);
  p.conflicts = p.rows.filter(function(r) { return jedDisputed(r.n); }).map(function(r) { return r.key; });
  if (p.linked && !p.conflicts.length) return { result: jedTransferLinkedIdle(p.term, p.day) };
  return undefined;
}

// مُرحَّلة ولا خلاف: يُعاد الطلب إن لم يردّ الحاسوب، وإلا تُقال حالة الصالة.
function jedTransferLinkedIdle(t, day) {
  // لم يردّ الحاسوب على الطلب السابق: يُعاد الطلب بختم جديد، والأوقات محفوظة في القاعدة.
  if (jedNoReply(t)) return jedTransferSend({ term: t, day: day, picks: {} });
  showToast(jedConfirmed(t) ? "الصالة مُرحَّلة والتحديث تلقائي — لا خلاف ينتظر الحسم"
    : "طلب الترحيل أُرسل وينتظر ردّ الحاسوب", "info", 3000);
  return null;
}

`;
}

/** الجزء 4 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart4() {
  return `
// مفاتيح رحلات بلا خلاف يختلف متوقعها عن مجدولها.
function jedTimedKeys(rows) {
  return rows.filter(function(r) {
    return !jedDisputed(r.n) && jedClockPair(r.n, {});
  }).map(function(r) { return r.key; });
}

// يبدأ تتابع الحسم والترحيل على الصالة.
function jedWalkBegin(p) {
  JED.walk = { day: p.day, term: p.term, conflicts: p.conflicts, ci: 0, times: p.times, ti: 0,
    timesAdded: false, chosen: {}, picks: {}, linked: p.linked, note: "", clock: null,
    onPick: jedWalkPicked, onTime: jedWalkTimed, onClose: jedWalkClosed, onGone: jedWalkNext };
  jedRender();
  jedWalkNext();
  return null;
}

// رحلات حُسم خلافها ويختلف متوقعها عن مجدولها: تُسأل أوقاتها بعد الخلافات.
function jedWalkAddResolvedTimes(w) {
  if (w.timesAdded) return;
  w.timesAdded = true;
  const store = jedStore();
  w.conflicts.forEach(function(key) {
    if (store[key] && jedClockPair(store[key], w.chosen[key] || {})) w.times.push(key);
  });
}
`;
}

/** الجزء 5 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart5() {
  return `
function jedWalkNext() {
  const w = JED.walk;
  if (!w) return;
  const store = jedStore();
  jedWalkSkipGone(w, store);
  if (w.ci < w.conflicts.length) return jedWalkAsk(w);
  if (jedWalkTimes(w, store)) return;
  jedWalkFinish(w);
}

// رحلة خرجت من الصالة أثناء التتابع تُتخطّى، فلا تعلق النافذة عليها.
function jedWalkSkipGone(w, store) {
  while (w.ci < w.conflicts.length && !store[w.conflicts[w.ci]]) w.ci++;
}

// يعرض الخلاف الحالي لتُحسم قيمه.
function jedWalkAsk(w) {
  w.note = "الخلاف " + (w.ci + 1) + " من " + w.conflicts.length + " — اضغط القيمة الصحيحة لكل معلومة عليها ⚠";
  jedShowModal(w.conflicts[w.ci], "pick");
}

`;
}

/** الجزء 6 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart6() {
  return `
// بعد الخلافات: أوقات ما حُسم، ثم أول رحلة يُسأل وقتها. يُرجع true إن عُرض سؤالُ وقت.
function jedWalkTimes(w, store) {
  jedWalkAddResolvedTimes(w);
  while (w.ti < w.times.length) {
    if (jedWalkTimeAsk(w, store)) return true;
    w.ti++;
  }
  return false;
}

// يعرض سؤال وقت الرحلة الحالية إن كان لها وقتان مختلفان. يُرجع هل عُرض.
function jedWalkTimeAsk(w, store) {
  const key = w.times[w.ti];
  const pair = store[key] ? jedClockPair(store[key], w.chosen[key] || {}) : null;
  if (!pair) return false;
  w.clock = pair;
  w.note = "الوقت " + (w.ti + 1) + " من " + w.times.length + " — أيّ وقت يُرحَّل إلى كايا؟";
  jedShowModal(key, "time");
  return true;
}

// انتهى الحسم والأوقات: يُغلق التتابع وتُرسل الطلبات.
function jedWalkFinish(w) {
  JED.walk = null;
  jedCloseModal();
  jedTransferSend(w).catch(function(e) { console.error("[fq_jed] الترحيل", e); });
}

`;
}

/** الجزء 7 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart7() {
  return `
// key: الرحلة التي حُفظ لها الاختيار، لا المفتوحة الآن — فضغطتان سريعتان لا
// تُنسب ثانيتهما إلى الرحلة التالية إن تقدّم التتابع قبل وصول حفظها.
function jedWalkPicked(field, value, key) {
  const w = JED.walk;
  const n = jedStore()[key];
  if (!w || !n || w.conflicts[w.ci] !== key) return;
  const left = jedWalkChoose(w, n, { field: field, value: value });
  if (left.length) return;
  w.ci++;
  jedWalkNext();
}

// يسجّل اختيارَ الرحلة الحالية في الخلافات ويُظهره فورًا. يُرجع حقولها التي بقي فيها خلاف.
function jedWalkChoose(w, n, pick) {
  const key = w.conflicts[w.ci];
  if (!w.chosen[key]) w.chosen[key] = {};
  w.chosen[key][pick.field] = pick.value;
  const left = jedConflictFields(n).filter(function(f) { return !w.chosen[key][f]; });
  // الحسم يظهر فورًا ولا ينتظر دورة الحاسوب (نحو دقيقة)، وإلا بقي الزرّ يعدّ
  // الرحلة خلافًا وسألها مرة ثانية. ونسخة الحاسوب تحلّ محلّ هذه عند وصولها.
  const r = n.f[pick.field];
  n.f[pick.field] = { v: pick.value, st: "chosen", s: r.s };
  return left;
}

`;
}

/** الجزء 8 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart8() {
  return `
function jedWalkTimed(which) {
  const w = JED.walk;
  if (!w || !w.clock || (which !== "sched" && which !== "est")) return;
  w.picks[w.times[w.ti]] = { t: which, est: w.clock.est };
  w.ti++;
  jedWalkNext();
}

function jedWalkClosed() {
  const w = JED.walk;
  JED.walk = null;
  jedRender();
  if (!w) return;
  showToast(w.linked ? "توقّف الحسم — ما حسمته محفوظ" :
    "أُلغي الترحيل — لم يُنقل شيء، وما حسمته من خلاف محفوظ", "info", 3000);
}

function jedSleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

// ردّ الحاسوب على هذا الطلب بعينه (r.at === at)، أو null بعد المهلة.
async function jedWaitResult(t, at) {
  const until = Date.now() + JED_XFER_WAIT_MS;
  while (Date.now() < until) {
    await jedSleep(JED_XFER_POLL_MS);
    try {
      const l = (await jedReadLinks())[t];
      if (l && l.r && l.r.at === at) return l.r;
    } catch (e) {
      console.error("[fq_jed] قراءة ردّ الترحيل", e);
    }
  }
  return null;
}

function jedResultText(r) {
  const parts = ["رُحّلت " + r.added + " رحلة"];
  if (r.updated) parts.push("حُدّثت " + r.updated);
  if (r.existing) parts.push(r.existing + " موجودة سابقًا في كايا تُركت كما هي");
  if (r.conflict) parts.push(r.conflict + " فيها خلاف تنتظر الحسم");
  return parts.join(" · ");`;
}

/** الجزء 9 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart9() {
  return `
}

async function jedTransferSend(w) {
  jedTransferBegin(w);
  const at = await jedRequestTransfer(w.term, w.day, w.picks);
  if (!at) return jedTransferNotSent(w);
  showToast("أُرسل الطلب — ينتظر الحاسوب", "loading");
  const r = await jedWaitResult(w.term, at);
  jedTransferEnd(w, r);
}

`;
}

/** الجزء 10 من 10 من نصّ `getJedTransferCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedTransferCodePart10() {
  return `
// بدء الإرسال: الصالة بانتظار الحاسوب، وتُرسم الصفحة، ويُقال إن الإرسال جارٍ.
function jedTransferBegin(w) {
  JED_WAITING[w.term] = true;
  jedRender();
  showToast("جارٍ إرسال طلب الترحيل…", "loading");
}

// تعذّر الإرسال: تنتهي الصالة من الانتظار ويُقال السبب.
function jedTransferNotSent(w) {
  delete JED_WAITING[w.term];
  jedRender();
  showToast("تعذّر إرسال الطلب — تحقّق من الاتصال وأعد المحاولة", "error", 3500);
}

// انتهى الانتظار: يُقال ردّ الحاسوب، أو أنه لم يردّ.
function jedTransferEnd(w, r) {
  delete JED_WAITING[w.term];
  jedRender();
  if (r) showToast(jedResultText(r), "success", 6000);
  else showToast("لم يردّ الحاسوب على الطلب — اضغط الزرّ لإعادته", "error", 6000);
}

// طلبٌ مضت عليه المهلة بلا ردّ. يُقاس بعمر الطلب لا بذاكرة الصفحة، فيبقى ظاهرًا
// بعد إغلاق التطبيق وفتحه، ولا يبقى الزرّ «بانتظار الحاسوب» بلا نهاية.
function jedNoReply(t) {
  const l = JED.links[t];
  return jedLinked(t) && !jedConfirmed(t) && Date.now() - l.at > JED_XFER_WAIT_MS;
}

// نصّ الزرّ للصالة المفتوحة.
function jedTransferLabel(t, disputed) {
  if (JED.walk) return "جارٍ الترحيل…";
  if (JED_WAITING[t]) return "بانتظار الحاسوب…";
  if (!jedLinked(t)) return "ترحيل البيانات";
  if (jedNoReply(t)) return "لم يردّ الحاسوب — اضغط لإعادة الطلب";
  if (!jedConfirmed(t)) return "طُلب الترحيل — بانتظار الحاسوب";
  return disputed ? "مُرحَّلة ✓ · " + disputed + " خلاف ينتظر الحسم" : "مُرحَّلة ✓ — التحديث تلقائي";
}
`;
}

module.exports = Object.freeze({ getJedTransferCode });
