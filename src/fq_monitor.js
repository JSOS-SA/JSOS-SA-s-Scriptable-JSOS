// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: heartbeat;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor.js

/**
 * @module fq_monitor
 * @description الغلاف الجامع لطبقة الرصد (Facade).
 * المسؤولية الواحدة: تنسيق الوحدات الثلاث وتقديم واجهة واحدة للسكربت الأم،
 * على نفس نمط fq_firebase و fq_stats و fq_profile في هذا النظام.
 *
 * الوحدات:
 *   fq_monitor_model → الدوال الخالصة: تنقية وبناء وحساب
 *   fq_monitor_store → التخزين المحلي: طابور وحالة
 *   fq_monitor_sync  → الشبكة: ترحيل دفعة واحدة
 *
 * اتجاه الاعتماد أحادي: النموذج لا يستورد أحدًا، والتخزين والشبكة لا
 * يستوردان بعضهما، وهذا الغلاف وحده يعرف الثلاثة. فلا دورة استيراد.
 *
 * ما لا يُقاس في هذه البيئة، وأُصرّح به بدل إيهام القياس: زمن الإطارات
 * الرسومية، وعدم استجابة التطبيق، واستنفاد الذاكرة، ومسارات التتبع الأصلية.
 */

const cfg = importModule("fq_config");
const model = importModule("fq_monitor_model");
const store = importModule("fq_monitor_store");
const sync = importModule("fq_monitor_sync");

// ════════════════════════════════════════════════
// 1. مساعدات المنسّق الخاصة
// ════════════════════════════════════════════════

/**
 * يجمع هوية صاحب السجل واللحظة الحالية.
 * قراءة السياق معزولة هنا كي يبقى النموذج خالصًا بلا اعتماد على الإعدادات.
 * @param {Object} params - معلمات الحدث
 * @returns {{params: Object, empId: string, role: string, at: number}} تفاصيل البناء
 */
function _details(params) {
  const user = cfg.getCurrentUser();
  return { params: params, empId: user.empId, role: user.role, at: Date.now() };
}

/**
 * يضيف سجلًا إلى الطابور ضمن السقف الحلقي.
 * @param {Object} entry - السجل
 * @returns {boolean} true عند النجاح
 */
function _append(entry) {
  const queue = store.readQueue();
  queue.push(entry);
  const ok = store.writeQueue(model.capQueue(queue));
  // سجل عرض لا يُفرَّغ مع الترحيل حتى يبقى الجدول عاكسًا للأرقام
  try {
    const hist = store.readHistory();
    hist.push(entry);
    store.writeHistory(model.capQueue(hist).slice(-40));
  } catch (e) {
    console.error(`[fq_monitor] history ${e.message}`);
  }
  return ok;
}

/**
 * يوسم الجلسة الجارية معطوبة مرّة واحدة مهما تعدّدت إخفاقاتها.
 * العدّ مرّة واحدة مقصود: المؤشر يقيس الجلسات لا الأخطاء، وجلسة فيها
 * خمسة إخفاقات تبقى جلسة معطوبة واحدة.
 * @returns {void}
 */
function _markSessionFailed() {
  const state = store.readState();
  if (state.currentSessionFailed === true) return;
  state.currentSessionFailed = true;
  state.failedSessions = (state.failedSessions || 0) + 1;
  store.writeState(state);
}

/**
 * يقرأ سياق الجهاز للتشخيص.
 * @returns {{device: string, os: string}} طراز الجهاز ونسخة النظام
 */
function _deviceContext() {
  const max = model.MONITOR_LIMITS.MAX_VALUE_LENGTH;
  return {
    device: model.truncate(Device.model(), max),
    os: model.truncate(Device.systemVersion(), max),
  };
}

// ════════════════════════════════════════════════
// 2. تسجيل الأحداث
// ════════════════════════════════════════════════

/**
 * يسجّل حدثًا سلوكيًا في الطابور المحلي.
 * @param {string} name - اسم الحدث
 * @param {Object} params - معلمات وصفية اختيارية
 * @returns {boolean} true إذا سُجّل، و false إذا رُفض الاسم أو تعذّرت الكتابة
 */
function logEvent(name, params) {
  // الرفض صامت بقرار مقصود: حدث مخالف للقيود لا يستحق إسقاط سير عمل التفويج.
  if (!model.sanitizeName(name)) return false;
  const ok = _append(model.buildEntry(model.EVENT_KIND.EVENT, name, _details(params)));
  if (ok) {
    const state = store.readState();
    state.totalEvents = (state.totalEvents || 0) + 1;
    store.writeState(state);
  }
  return ok;
}

/**
 * يسجّل إخفاق واجهة: فشل جسر نافذة العرض أو مرحلة تجاوزت الزمن المقبول.
 * @param {string} screenId - معرّف الشاشة أو المرحلة
 * @param {Object} metrics - مقاييس مثل durationMs و reason
 * @returns {boolean} true إذا سُجّل
 */
function recordUiFailure(screenId, metrics) {
  const source = Object.assign({}, metrics, _deviceContext());
  const params = model.withSlowFlag(source, metrics == null ? undefined : metrics.durationMs);
  _markSessionFailed();
  const ok = _append(model.buildEntry(model.EVENT_KIND.UI_FAILURE, screenId, _details(params)));
  if (ok) {
    const state = store.readState();
    state.totalUiFailures = (state.totalUiFailures || 0) + 1;
    store.writeState(state);
  }
  return ok;
}

/**
 * يسجّل إخفاق مزامنة: فشل طلب شبكي أو حالة رد غير ناجحة.
 * @param {string} code - رمز الحالة أو اسم العطب
 * @param {Object} context - سياق مثل path و stage
 * @returns {boolean} true إذا سُجّل
 */
function recordSyncFailure(code, context) {
  const params = Object.assign({}, context, { code: code });
  _markSessionFailed();
  const ok = _append(model.buildEntry(model.EVENT_KIND.SYNC_FAILURE, "sync_failure", _details(params)));
  if (ok) {
    const state = store.readState();
    state.totalSyncFailures = (state.totalSyncFailures || 0) + 1;
    store.writeState(state);
  }
  return ok;
}

/**
 * يسجّل إخفاق ملف أو وحدة.
 * @param {string} fileName - اسم الملف
 * @param {Object} context - السبب والمرحلة
 * @returns {boolean}
 */
function recordFileFailure(fileName, context) {
  const params = Object.assign({}, context, { file: fileName });
  _markSessionFailed();
  const ok = _append(model.buildEntry(model.EVENT_KIND.FILE_FAILURE, fileName || "unknown_file", _details(params)));
  if (ok) {
    const state = store.readState();
    state.totalFileFailures = (state.totalFileFailures || 0) + 1;
    store.writeState(state);
  }
  return ok;
}

// ════════════════════════════════════════════════
// 3. دورة حياة الجلسة
// ════════════════════════════════════════════════

/**
 * يفتح جلسة جديدة ويزيد عدّاد الجلسات.
 * @returns {number} رقم الجلسة الحالي
 */
function startSession() {
  const state = store.readState();
  state.sessions = (state.sessions || 0) + 1;
  state.currentSessionFailed = false;
  state.sessionStartedAt = new Date().toISOString();
  store.writeState(state);
  return state.sessions;
}

/**
 * يُنهي الجلسة: تطهير المنتهي ثم محاولة ترحيل واحدة.
 * @returns {Promise<{sent: number, ok: boolean, purged: number}>} الحصيلة
 */
async function endSession() {
  const purged = clearOldEvents(model.MONITOR_LIMITS.MAX_EVENT_AGE_DAYS);
  const result = await sendBatchToFirebase();
  return { sent: result.sent, ok: result.ok, purged: purged };
}

// ════════════════════════════════════════════════
// 4. إدارة الطابور والملخّص
// ════════════════════════════════════════════════

/**
 * يُرجع السجلات المعلّقة، الأحدث أولًا.
 * @param {number} limit - العدد الأقصى المطلوب
 * @returns {Array} السجلات
 */
function getPendingEvents(limit) {
  // للعرض: سجل التاريخ الذي لا يُفرَّغ مع الترحيل، ثم الطابور إن لزم
  const hist = store.readHistory();
  const src = hist.length > 0 ? hist : store.readQueue();
  const count = (typeof limit === "number" && limit > 0) ? limit : src.length;
  return src.slice(-count).reverse();
}

/**
 * يحذف السجلات المنتهية محليًا.
 * بديل عن سياسة الحذف التلقائي السحابية، إذ لا توفّرها قاعدة الوقت الحقيقي.
 * @param {number} maxAgeDays - أقصى عمر باليوم
 * @returns {number} عدد السجلات المحذوفة
 */
function clearOldEvents(maxAgeDays) {
  const days = (typeof maxAgeDays === "number" && maxAgeDays > 0)
    ? maxAgeDays
    : model.MONITOR_LIMITS.MAX_EVENT_AGE_DAYS;
  const queue = store.readQueue();
  const kept = model.dropExpired(queue, days, Date.now());
  if (kept.length === queue.length) return 0;
  store.writeQueue(kept);
  return queue.length - kept.length;
}

/**
 * يُرجع الملخّص الإحصائي المحسوب محليًا بلا أي طلب شبكي.
 * @returns {Object} الملخّص
 */
function getSystemStatusSummary() {
  return model.buildSummary(store.readState(), store.readQueue());
}

// ════════════════════════════════════════════════
// 5. الترحيل
// ════════════════════════════════════════════════

/**
 * يثبت نجاح الترحيل: يحذف المُرحَّل ويسجّل لحظة الترحيل.
 * @param {Array} queue - الطابور الكامل
 * @param {number} sentCount - عدد ما رُحّل
 * @returns {void}
 */
function _commitFlush(queue, sentCount) {
  store.writeQueue(queue.slice(sentCount));
  const state = store.readState();
  state.lastFlushAt = new Date().toISOString();
  store.writeState(state);
}

/**
 * يرحّل أقدم دفعة إلى القاعدة، ولا يحذف شيئًا إلا بعد تأكيد الخادم.
 * الفشل يُبقي الدفعة مكانها لتُرحَّل لاحقًا — الرصد لا يفقد بياناته بصمت.
 * @returns {Promise<{sent: number, ok: boolean}>} حصيلة الترحيل
 */
async function sendBatchToFirebase() {
  const queue = store.readQueue();
  if (queue.length === 0) return { sent: 0, ok: true };
  const batch = queue.slice(0, model.MONITOR_LIMITS.BATCH_SIZE);
  const target = model.safeId(cfg.getCurrentUser().empId);
  const ok = await sync.patchBatch(target, model.buildFanOut(batch));
  if (!ok) return { sent: 0, ok: false };
  _commitFlush(queue, batch.length);
  return { sent: batch.length, ok: true };
}

// ════════════════════════════════════════════════
// 6. نقطة الدخول
// ════════════════════════════════════════════════
class AppCoordinator {
  static async boot() {
    // غلاف جامع — الجلسة تُفتح من السكربت الأم لا عند الإقلاع المباشر
  }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((e) => console.error(e)); } catch (e) { console.error(e); }

module.exports = Object.freeze({
  EVENT_KIND: model.EVENT_KIND,
  logEvent,
  recordUiFailure,
  recordSyncFailure,
  recordFileFailure,
  startSession,
  endSession,
  getPendingEvents,
  clearOldEvents,
  getSystemStatusSummary,
  sendBatchToFirebase,
});
