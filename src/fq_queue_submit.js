// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: paper-plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_queue_submit.js

/**
 * @module fq_queue_submit
 * @description المسؤولية الواحدة: **باب واحد تسلّم إليه الميزةُ كتابةً
 * لا يجوز أن تضيع**. تحاول الشبكة أولًا، فإن تعذّرت أدرجت في الطابور.
 *
 * **لماذا وحدة لا سطران في كل ميزة**: القاعدة واحدة تتكرّر في خمسة
 * مواضع — جرّب، صنّف الفشل، أدرج العابر وحده، أرجع نجاحًا موسومًا.
 * وأُوّل من كتبها كان `t4SendOrQueue` داخل `fq_t4_store`. نسخُها خمس
 * مرّات يعني أن تغيير القاعدة يتطلّب خمسة تعديلات، وأوّلُ موضعٍ يُنسى
 * يصير ميزةً تضيّع عمل الموظف بصمت (الدرس ٣١).
 *
 * **اختبار الحذف**: لو حُذفت هذه الوحدة لعاد المنطق نفسه إلى خمسة
 * مستدعين، فهي ليست ممرًّا بل تكسب مكانها.
 *
 * **الواجهة — وهي كل ما يجب أن يعرفه المستدعي**:
 * ```
 * fqSendOrQueue({ path, method, body, kind, label })
 *   → { ok, queued, status, data, error, kind }
 * fqSendOrQueueChain([ طلبٌ أول، طلبٌ لا يصحّ إلا بعده ])
 *   → { ok, queued, status, data, error, kind }
 * ```
 * - **لا ترمي أبدًا** — على نمط `fqRequest` تمامًا.
 * - `ok:true, queued:true` تعني «عندي ولم يصل بعد»، و`ok:true` وحدها
 *   تعني «وصل». والمستدعي الذي يكتفي بـ `res.ok` يعمل صحيحًا في
 *   الحالتين، فلا يُجبَر أحد على معرفة الطابور ليستفيد منه.
 * - `denied` و`permanent` تبقيان فشلًا صريحًا: إدراج طلبٍ سترفضه القاعدة
 *   خمس مرّات يؤجّل الخبر السيّئ ولا يمنعه.
 *
 * **وما لا يمرّ من هنا، بقرار المستخدم ٢٠٢٦-٠٩-٢٥**:
 * - **المؤشرات الزمنية** (`flights_meta.lastUpdate`, `lastSeen`): طوابع
 *   «آخر تحديث»، وإعادة إرسال طابعٍ عمره دقائق تكتب فوق أحدث منه فيبدو
 *   النظام راجعًا إلى الوراء.
 * - **الأفعال الإدارية** (تغيير صلاحية · إيقاف النظام · حذف حساب):
 *   المشرف يقرّر بما يراه، و«تم إيقاف النظام» ولم يقع أخطر من فشلٍ صريح.
 * - **القراءات** و«جديد» في T4: مذكورتان في خطة الطابور القرار ٥.
 *
 * **الترتيب في `fq_main` ملزم**: بعد `fq_queue_store` (يستدعي `fqEnqueue`)
 * و`fq_net_request` (يستدعي `fqRequest`)، وقبل كل ميزة تستعمله.
 */

function getQueueSubmitCode() {
  return getQueueSubmitCodePart1() +
    getQueueSubmitCodePart2();
}

/** الجزء 1 من 2 من نصّ `getQueueSubmitCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueSubmitCodePart1() {
  return `
// ═══ تسليم كتابة: الشبكة أولًا ثم الطابور ═══
// done: كم طلبًا مضى فعلًا قبل هذه النتيجة. يحتاجه المستدعي ليفرّق بين
// «لم يقع شيء» و«وقع بعضه»، وهو ما يجعل رسالته صادقة.
function fqSubmitQueued(id, done) {
  return { ok: true, queued: true, id: id, done: done || 0, status: 0, data: null, error: "", kind: "" };
}

function fqSubmitDone(res, done) {
  res.queued = false;
  res.done = done;
  return res;
}

// نسخة الطلب كما يحفظها الطابور. موضع واحد يعرف حقول العنصر، فإضافة
// حقل لاحقًا لا تُنسى في أحد المستدعيَين.
function fqSubmitEnqueue(req, after) {
  return fqEnqueue({
    path: req.path, method: req.method, body: req.body,
    kind: req.kind, label: req.label, after: after || ""
  });
}

// محاولة واحدة، ثم القرار. تُرجع نتيجة الشبكة كما هي عند النجاح، ونتيجة
// موسومة queued عند الإدراج، والفشل الصريح كما جاء من الباب.
async function fqSendOrQueue(req) {
  const res = await fqRequest({
    path: req.path, method: req.method, body: req.body, timeoutMs: req.timeoutMs
  });
  if (res.ok) return fqSubmitDone(res, 1);
  if (!fqQueueRetryable(res.kind)) return fqSubmitDone(res, 0);
  const put = fqSubmitEnqueue(req, "");
  if (!put.queued) return fqSubmitDone(res, 0);
  return fqSubmitQueued(put.id, 0);
}
`;
}

/** الجزء 2 من 2 من نصّ `getQueueSubmitCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getQueueSubmitCodePart2() {
  return `
// ═══ سلسلة: طلبٌ لا يصحّ إلا بعد الذي قبله ═══
// مثاله الوحيد اليوم: تعديل رحلة يغيّر مفتاحها — تُكتب تحت المفتاح
// الجديد ثم يُحذف القديم. والحذف بلا كتابةٍ سبقته يمحو الرحلة.
//
// والسلسلة تُدرَج **كاملةً أو لا شيء**: إمّا مضت كلها على الشبكة، أو
// دخل أوّلُها الطابور ودخل ما بعده مرتبطًا به. ولا تُدرَج جزئيًّا أبدًا.
function fqChainRest(reqs, from, afterId) {
  let last = afterId;
  for (let i = from; i < reqs.length; i++) {
    const put = fqSubmitEnqueue(reqs[i], last);
    if (!put.queued) return "";
    last = put.id;
  }
  return last;
}

// ═══ كم مضى قبل الفشل، لا الفشلُ وحده ═══
// المستدعي يقرأ done ليعرف أيّ رسالة يعرض. ففشلُ الحذف بعد نجاح الكتابة
// **ليس** «لم يتغيّر شيء»: الرحلة كُتبت تحت مفتاحها الجديد فعلًا، وقولُ
// غير ذلك يترك الشاشة تخالف المخزون.
async function fqSendOrQueueChain(reqs) {
  if (!reqs || reqs.length === 0) {
    return { ok: true, queued: false, done: 0, status: 0, data: null, error: "", kind: "" };
  }
  let res = null;
  for (let i = 0; i < reqs.length; i++) {
    res = await fqRequest({
      path: reqs[i].path, method: reqs[i].method, body: reqs[i].body, timeoutMs: reqs[i].timeoutMs
    });
    if (!res.ok) return fqChainFailed(reqs, i, res);
  }
  return fqSubmitDone(res, reqs.length);
}

// الحلقة i من السلسلة فشلت (res ردّها): تُدرَج هي وما بعدها إن كان الفشل عابرًا.
function fqChainFailed(reqs, i, res) {
  // فشلٌ صريح: ما مضى مضى، وما بقي لا يُدرَج — فالسلسلة لا تُستأنف على
  // أساس خطأ لن يزول بالانتظار.
  if (!fqQueueRetryable(res.kind)) return fqSubmitDone(res, i);
  const head = fqSubmitEnqueue(reqs[i], "");
  if (!head.queued) return fqSubmitDone(res, i);
  if (!fqChainRest(reqs, i + 1, head.id)) return fqSubmitDone(res, i);
  return fqSubmitQueued(head.id, i);
}
`;
}

module.exports = Object.freeze({ getQueueSubmitCode });
