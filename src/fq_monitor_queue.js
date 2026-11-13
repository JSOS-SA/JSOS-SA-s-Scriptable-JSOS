// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: inbox;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_queue.js

/**
 * طابور الرصد على الجهاز وإرساله.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_queue_read.js
 *   fq_monitor_queue_write.js
 *   fq_monitor_read_queue_status.js
 *   fq_monitor_write_queue_status.js
 *   fq_monitor_history_read.js
 *   fq_monitor_history_write.js
 *   fq_monitor_write_event.js
 *   fq_monitor_flush_batch.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorBase = importModule("fq_monitor_base");
const cfg = importModule("fq_config");
const monitorAuth = importModule("fq_monitor_auth");
const monitorNet = importModule("fq_monitor_net");

// ════════════════════════════════════════════════
// كان ملف fq_monitor_queue_read.js
// ════════════════════════════════════════════════

const QUEUE_FILE = "fq_monitor_v2_queue.json";

/** @returns {Array} طابور الرصد المستقل. */
function readMonitorQueue() {
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), QUEUE_FILE);
    if (!manager.fileExists(path)) return [];
    const parsed = JSON.parse(manager.readString(path));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[fq_monitor_queue_read] ${error.message}`);
    return [];
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_queue_write.js
// ════════════════════════════════════════════════

/**
 * يستبدل طابور الرصد المستقل ذريًا على مستوى الملف.
 * @param {Array} entries
 * @returns {boolean}
 */
function writeMonitorQueue(entries) {
  if (!Array.isArray(entries)) return false;
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), QUEUE_FILE);
    manager.writeString(path, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error(`[fq_monitor_queue_write] ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_read_queue_status.js
// ════════════════════════════════════════════════

const STATUS_FILE = "fq_monitor_v2_queue_status.json";

/** @returns {Object} آخر حالة محلية معروفة لطابور الرصد. */
function readMonitorQueueStatus() {
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), STATUS_FILE);
    return manager.fileExists(path) ? JSON.parse(manager.readString(path)) : {};
  } catch (error) {
    console.error(`[fq_monitor_read_queue_status] ${error.message}`);
    return { lastFailureReason: error.message };
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_write_queue_status.js
// ════════════════════════════════════════════════

/**
 * يحفظ حالة طابور الرصد المحلية الأخيرة.
 * @param {Object} status
 * @returns {boolean}
 */
function writeMonitorQueueStatus(status) {
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), STATUS_FILE);
    const current = manager.fileExists(path) ? JSON.parse(manager.readString(path)) : {};
    const next = Object.assign({}, current, status || {}, { updatedAt: new Date().toISOString(), updatedAtMs: Date.now() });
    manager.writeString(path, JSON.stringify(next));
    return true;
  } catch (error) {
    console.error(`[fq_monitor_write_queue_status] ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_history_read.js
// ════════════════════════════════════════════════

const HISTORY_FILE = "fq_monitor_v2_history.json";

/** @returns {Array} سجل العرض المحلي للرصد الجديد. */
function readMonitorHistory() {
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), HISTORY_FILE);
    if (!manager.fileExists(path)) return [];
    const parsed = JSON.parse(manager.readString(path));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[fq_monitor_history_read] ${error.message}`);
    return [];
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_history_write.js
// ════════════════════════════════════════════════

const HISTORY_LIMIT = 100;

/**
 * يحفظ آخر سجلات العرض الجديدة محليًا.
 * @param {Array} entries
 * @returns {boolean}
 */
function writeMonitorHistory(entries) {
  if (!Array.isArray(entries)) return false;
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), HISTORY_FILE);
    const capped = entries.length > HISTORY_LIMIT ? entries.slice(-HISTORY_LIMIT) : entries;
    manager.writeString(path, JSON.stringify(capped));
    return true;
  } catch (error) {
    console.error(`[fq_monitor_history_write] ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_write_event.js
// ════════════════════════════════════════════════

function _applyQueueLimit(queue, limit) {
  const droppedNow = Math.max(0, queue.length - limit);
  return {
    droppedNow: droppedNow,
    kept: droppedNow > 0 ? queue.slice(-limit) : queue,
  };
}

function _buildQueueStatus(kept, droppedNow, currentStatus) {
  const overflowed = droppedNow > 0;
  return {
    queueDepth: kept.length,
    lateReason: kept.length > 0 ? "AWAITING_FLUSH" : "",
    lastQueuedAt: new Date().toISOString(),
    droppedCount: Number(currentStatus.droppedCount || 0) + droppedNow,
    lastDroppedCount: droppedNow,
    overflowReason: overflowed ? "LOCAL_QUEUE_LIMIT" : currentStatus.overflowReason || "",
    overflowAt: overflowed ? new Date().toISOString() : currentStatus.overflowAt || "",
  };
}

/**
 * يكتب حدثًا واحدًا محليًا قبل أي محاولة شبكة.
 * @param {Object} event
 * @returns {boolean}
 */
function writeMonitorEvent(event) {
  if (!(event && event.eventId)) return false;
  const queued = _enqueueBounded(event);
  const currentStatus = readMonitorQueueStatus();
  writeMonitorQueueStatus(_buildQueueStatus(queued.bounded.kept, queued.bounded.droppedNow, currentStatus));
  const historyOk = _appendHistory(event);
  return queued.ok && historyOk;
}

/** يضيف الحدث إلى الطابور ويقصّه إلى حدّه ويكتبه. @returns {{ok: boolean, bounded: Object}} */
function _enqueueBounded(event) {
  const limit = monitorBase.getMonitorRemoteConfig().queueLimit;
  const queue = readMonitorQueue();
  queue.push(event);
  const bounded = _applyQueueLimit(queue, limit);
  return { ok: writeMonitorQueue(bounded.kept), bounded: bounded };
}

/** يضيف الحدث إلى سجل العرض المحلي ويكتبه. @returns {boolean} */
function _appendHistory(event) {
  const history = readMonitorHistory();
  history.push(event);
  return writeMonitorHistory(history);
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_flush_batch.js
// ════════════════════════════════════════════════

function _nextFailureCount() {
  const status = readMonitorQueueStatus();
  return Number(status.consecutiveFlushFailures || 0) + 1;
}

function _writeEmptyQueueStatus() {
  const status = readMonitorQueueStatus();
  writeMonitorQueueStatus({
    queueDepth: 0,
    lateReason: "",
    currentFailureReason: "",
    consecutiveFlushFailures: 0,
    recoveredAt: status.currentFailureReason ? new Date().toISOString() : status.recoveredAt || "",
    lastFlushNote: "EMPTY_QUEUE",
  });
}

function _writeAuthFailure(queueLength) {
  writeMonitorQueueStatus({
    queueDepth: queueLength,
    lateReason: "MONITOR_AUTH_UNAVAILABLE",
    currentFailureReason: "MONITOR_AUTH_UNAVAILABLE",
    lastFailureReason: "MONITOR_AUTH_UNAVAILABLE",
    lastFailureAt: new Date().toISOString(),
    lastFailureStatus: 0,
    consecutiveFlushFailures: _nextFailureCount(),
    recoveredAt: "",
  });
}

/**
 * حدث واحد جاهز للإرسال، ومفتاحه في القاعدة بتاريخه ورقم الموظف.
 * @param {Object} raw الحدث كما في الطابور
 * @param {{session: Object, empId: string, deviceId: string}} identity
 * @returns {{key: string, event: Object}}
 */
function _flushEntry(raw, identity) {
  const event = Object.assign({}, raw, {
    monitorUid: identity.session.uid, serverAt: { ".sv": "timestamp" },
  });
  event.actor = Object.assign({}, event.actor, { empId: identity.empId });
  event.device = Object.assign({}, event.device, { deviceId: identity.deviceId });
  const occurredAt = event.occurredAt || Date.now();
  const dateBucket = new Date(occurredAt).toISOString().slice(0, 10);
  const eventId = monitorBase.makeMonitorSafeId(event.eventId);
  return { key: `events/${dateBucket}/${identity.empId}/${eventId}`, event: event };
}

/** @param {{session: Object, empId: string, deviceId: string}} identity */
function _buildFlushPayload(batch, identity) {
  const payload = {};
  for (let index = 0; index < batch.length; index++) {
    const entry = _flushEntry(batch[index], identity);
    payload[entry.key] = entry.event;
  }
  return payload;
}

function _writeRemoteFailure(queueLength, result) {
  const reason = result.error || "FLUSH_FAILED";
  writeMonitorQueueStatus({
    queueDepth: queueLength,
    lateReason: reason,
    currentFailureReason: reason,
    lastFailureReason: reason,
    lastFailureAt: new Date().toISOString(),
    lastFailureStatus: result.status || 0,
    consecutiveFlushFailures: _nextFailureCount(),
    recoveredAt: "",
  });
}

function _writeRewriteFailure(queueLength) {
  writeMonitorQueueStatus({
    queueDepth: queueLength,
    lateReason: "LOCAL_QUEUE_REWRITE_FAILED",
    currentFailureReason: "LOCAL_QUEUE_REWRITE_FAILED",
    lastFailureReason: "LOCAL_QUEUE_REWRITE_FAILED",
    lastFailureAt: new Date().toISOString(),
    consecutiveFlushFailures: _nextFailureCount(),
    recoveredAt: "",
  });
}

/**
 * الرفض وحده يُعزل — وانقطاع الشبكة لا يُعزل أبدًا لأنه عارض والحدث لم يُفقد.
 * @param {Object} result @returns {boolean}
 */
function _isDenialPermanent(result) {
  if (!result.denied) return false;
  return _nextFailureCount() >= monitorBase.getMonitorRemoteConfig().flushDenialLimit;
}

function _writeQuarantineStatus(remainingLength, droppedNow) {
  const status = readMonitorQueueStatus();
  const now = new Date().toISOString();
  writeMonitorQueueStatus({
    queueDepth: remainingLength,
    lateReason: remainingLength > 0 ? "AWAITING_FLUSH" : "",
    currentFailureReason: "",
    lastFailureReason: "FLUSH_BATCH_QUARANTINED",
    lastFailureAt: now,
    consecutiveFlushFailures: 0,
    droppedCount: Number(status.droppedCount || 0) + droppedNow,
    lastDroppedCount: droppedNow,
    overflowReason: "REMOTE_DENIAL_QUARANTINE",
    overflowAt: now,
    recoveredAt: now,
  });
}

/**
 * يُسقط دفعة رفضتها القاعدة رفضًا متكررًا، فيفتح الطابور لما خلفها.
 * الإسقاط معلن في droppedCount ولا يُبتلع صامتًا.
 * @param {Array} queue @param {number} batchLength @returns {Object}
 */
function _quarantineBatch(queue, batchLength) {
  const remaining = queue.slice(batchLength);
  if (!writeMonitorQueue(remaining)) {
    _writeRewriteFailure(queue.length);
    return { ok: false, sent: 0, error: "LOCAL_QUEUE_REWRITE_FAILED" };
  }
  _writeQuarantineStatus(remaining.length, batchLength);
  return { ok: false, sent: 0, dropped: batchLength, error: "FLUSH_BATCH_QUARANTINED" };
}

function _writeFlushSuccess(remaining, sentCount) {
  writeMonitorQueueStatus({
    queueDepth: remaining.length,
    lateReason: remaining.length > 0 ? "PARTIAL_FLUSH_REMAINING" : "",
    lastFlushedCount: sentCount,
    lastFlushAt: new Date().toISOString(),
    currentFailureReason: "",
    consecutiveFlushFailures: 0,
    recoveredAt: new Date().toISOString(),
  });
}

function _flushEmptyQueue() {
  _writeEmptyQueueStatus();
  return { ok: true, sent: 0 };
}

function _flushAuthUnavailable(queueLength) {
  _writeAuthFailure(queueLength);
  return { ok: false, sent: 0, error: "MONITOR_AUTH_UNAVAILABLE" };
}

/** أول دفعة من الطابور وحمولتها بهوية الموظف والجهاز. @returns {{batch: Array, payload: Object}} */
function _buildBatch(queue, session) {
  const user = cfg.getCurrentUser() || {};
  const empId = monitorBase.makeMonitorSafeId(user.empId);
  const deviceId = monitorBase.getMonitorDeviceId();
  const batch = queue.slice(0, monitorBase.getMonitorRemoteConfig().batchSize);
  return { batch: batch, payload: _buildFlushPayload(batch, { session, empId, deviceId }) };
}

/** رفضٌ متكرر يعزل الدفعة، وما سواه فشلٌ عارض يُسجَّل والطابور باقٍ. */
function _flushRemoteFailure(queue, batchLength, result) {
  if (_isDenialPermanent(result)) return _quarantineBatch(queue, batchLength);
  _writeRemoteFailure(queue.length, result);
  return { ok: false, sent: 0, error: result.error, status: result.status };
}

/** يحذف الدفعة المرسلة من الطابور بعد تأكيد القاعدة. */
function _flushCommit(queue, batchLength) {
  const remaining = queue.slice(batchLength);
  if (!writeMonitorQueue(remaining)) {
    _writeRewriteFailure(queue.length);
    return { ok: false, sent: batchLength, error: "LOCAL_QUEUE_REWRITE_FAILED", resendRisk: true };
  }
  _writeFlushSuccess(remaining, batchLength);
  return { ok: true, sent: batchLength };
}

/** @returns {Promise<Object>} نتيجة ترحيل دفعة واحدة مؤكدة. */
async function flushMonitorBatch() {
  const queue = readMonitorQueue();
  if (queue.length === 0) return _flushEmptyQueue();
  const session = await monitorAuth.getMonitorAuthSession(false);
  if (!session) return _flushAuthUnavailable(queue.length);
  const built = _buildBatch(queue, session);
  const result = await monitorNet.monitorRequest({ path: "", method: "PATCH", body: built.payload });
  if (!result.ok) return _flushRemoteFailure(queue, built.batch.length, result);
  return _flushCommit(queue, built.batch.length);
}

module.exports = Object.freeze({
  readMonitorQueue,
  writeMonitorQueue,
  readMonitorQueueStatus,
  writeMonitorQueueStatus,
  readMonitorHistory,
  writeMonitorHistory,
  writeMonitorEvent,
  flushMonitorBatch,
});
