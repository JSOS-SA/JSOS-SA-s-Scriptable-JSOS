// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_device.js

/**
 * ربط الجهاز والنبضة وأوامر التشخيص.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_identity_read.js
 *   fq_monitor_request_enrollment.js
 *   fq_monitor_verify_employee_link.js
 *   fq_monitor_diagnostic_snapshot.js
 *   fq_monitor_write_command_result.js
 *   fq_monitor_poll_command.js
 *   fq_monitor_write_heartbeat.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorNet = importModule("fq_monitor_net");
const monitorBase = importModule("fq_monitor_base");
const monitorAuth = importModule("fq_monitor_auth");
const monitorJourney = importModule("fq_monitor_journey");
const monitorQueue = importModule("fq_monitor_queue");
const cfg = importModule("fq_config");

// ════════════════════════════════════════════════
// كان ملف fq_monitor_identity_read.js
// ════════════════════════════════════════════════

/**
 * يقرأ هوية الرصد الخاصة بالجلسة الحالية من identities/{uid}.
 * القاعدة تسمح لكل جهاز بقراءة هويته هو فقط.
 * @param {Object} session جلسة الرصد الحالية
 * @returns {Promise<Object|null>} الهوية أو null عند الغياب أو تعذّر القراءة
 */
async function readOwnMonitorIdentity(session) {
  if (!(session && session.uid)) return null;
  const path = `identities/${monitorBase.makeMonitorSafeId(session.uid)}`;
  const result = await monitorNet.monitorRequest({ path: path, method: "GET" });
  return result && result.ok === true && result.data ? result.data : null;
}

/**
 * هوية معتمدة ومطابقة للموظف والجهاز الحاليين.
 * الدور ليس معيارًا هنا؛ اختلافه انحراف يُعالج في النبض لا في الطلب.
 * @param {Object|null} identity
 * @param {string} safeEmpId
 * @param {string} deviceId
 * @returns {boolean}
 */
function isIdentityApprovedFor(identity, safeEmpId, deviceId) {
  return Boolean(identity) &&
    identity.approved === true &&
    identity.empId === safeEmpId &&
    identity.deviceId === deviceId;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_request_enrollment.js
// ════════════════════════════════════════════════

/**
 * يكتب طلب ربط جهاز واحد بعد نجاح دخول النظام،
 * ويمتنع عن إعادة الكتابة إذا كانت الهوية معتمدة ومطابقة.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
async function requestMonitorEnrollment(user) {
  if (!(user && user.empId)) return { ok: false, error: "MISSING_MAIN_IDENTITY" };
  const session = await monitorAuth.getMonitorAuthSession(false);
  if (!session) return { ok: false, error: "MONITOR_AUTH_UNAVAILABLE" };
  const deviceId = monitorBase.getMonitorDeviceId();
  const identity = await readOwnMonitorIdentity(session);
  if (isIdentityApprovedFor(identity, monitorBase.makeMonitorSafeId(user.empId), deviceId)) {
    return { ok: true, alreadyApproved: true, uid: session.uid };
  }
  const payload = {
    monitorUid: session.uid,
    empId: monitorBase.makeMonitorSafeId(user.empId),
    roleClaim: String(user.role || "employee").substring(0, 40),
    deviceId: deviceId,
    model: String(Device.model()).substring(0, 80),
    osVersion: String(Device.systemVersion()).substring(0, 40),
    systemVersion: monitorBase.getReleaseVersion().systemVersion,
    requestedAt: { ".sv": "timestamp" },
    state: "pending",
  };
  return await monitorNet.monitorRequest({ path: `enrollment_requests/${monitorBase.makeMonitorSafeId(session.uid)}`, method: "PUT", body: payload });
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_verify_employee_link.js
// ════════════════════════════════════════════════

function _recordLinkCheckpoint(details) {
  monitorJourney.recordMonitorAuthCheckpoint(details);
}

/** @param {{empId: string, deviceId: string}} link */
function _identityMatches(identity, link) {
  const data = identity.ok ? identity.data : null;
  if (data === null || data === undefined || data.approved !== true) return false;
  return data.empId === link.empId && data.deviceId === link.deviceId;
}

/** @param {{empId: string, deviceId: string, monitorUid: string}} link */
function _runtimeMatches(runtime, link) {
  const data = runtime.ok ? runtime.data : null;
  if (!data) return false;
  return data.empId === link.empId &&
    data.deviceId === link.deviceId &&
    data.monitorUid === link.monitorUid;
}

/**
 * @param {{stageId: string, label: string, path: string}} stage
 * @param {{passed: boolean, code: string, message: string}} outcome
 */
function _checkpointResult(stage, outcome) {
  return {
    stageId: stage.stageId,
    phase: "monitor_link",
    label: stage.label,
    path: stage.path,
    status: outcome.passed ? "passed" : "failed",
    code: outcome.passed ? "" : outcome.code,
    message: outcome.message,
  };
}

function _pendingCheckpoint(stage) {
  return { stageId: stage.stageId, phase: "monitor_link", label: stage.label, path: stage.path, status: "pending" };
}

function _linkError(result, fallback) {
  return result.error || fallback;
}

function _linkResult(ok, runtime) {
  return {
    ok: ok,
    error: ok ? "" : _linkError(runtime, "HEARTBEAT_READBACK_MISMATCH"),
  };
}

/** معرّفات الربط ومساراته، بترتيب قراءتها قبل التقسيم. */
function _linkContext(user, session) {
  const empId = monitorBase.makeMonitorSafeId(user ? user.empId : "");
  const deviceId = monitorBase.makeMonitorSafeId(monitorBase.getMonitorDeviceId());
  const monitorUid = session ? session.uid : "";
  const safeUid = monitorBase.makeMonitorSafeId(monitorUid);
  const identityPath = `/identities/${safeUid}`;
  const runtimePath = `/runtime/${empId}/${deviceId}`;
  return { empId, deviceId, monitorUid, safeUid, identityPath, runtimePath, completePath: `${identityPath} → ${runtimePath}` };
}

/** يميز فشل القراءة عن نتيجة قراءة ناجحة تثبت عدم تطابق الهوية. */
function _identityFailureMessage(identity) {
  if (identity.ok) return "هوية الرصد غير معتمدة أو لا تطابق الموظف والجهاز.";
  if (identity.error === "MONITOR_AUTH_UNAVAILABLE") return "جلسة الرصد غير متاحة؛ تعذر التحقق من الهوية.";
  if (identity.status === 401 || identity.status === 403) return "رُفض طلب قراءة هوية الرصد؛ تعذر التحقق من اعتمادها.";
  return "تعذر قراءة هوية الرصد؛ لا تتوافر نتيجة للحكم على اعتمادها أو تطابقها.";
}

/** المرحلة الأولى: اعتماد هوية الرصد. @returns {Promise<{ok: boolean, result: Object}>} */
async function _checkIdentityStage(link, session) {
  const stage = { stageId: "monitor_identity_approval", label: "اعتماد هوية الرصد", path: link.identityPath };
  _recordLinkCheckpoint(_pendingCheckpoint(stage));
  const identity = session
    ? await monitorNet.monitorRequest({ path: `identities/${link.safeUid}`, method: "GET" })
    : { ok: false, error: "MONITOR_AUTH_UNAVAILABLE" };
  const identityOk = _identityMatches(identity, link);
  _recordLinkCheckpoint(_checkpointResult(stage, {
    passed: identityOk,
    code: _linkError(identity, "IDENTITY_NOT_APPROVED"),
    message: identityOk ? "تطابقت هوية الموظف والجهاز." : _identityFailureMessage(identity),
  }));
  return { ok: identityOk, result: identity };
}

/** يختم الربط فاشلًا عند الهوية، دون قراءة النبض. */
function _stopLinkAtIdentity(link, identity) {
  _recordLinkCheckpoint(_checkpointResult(
    { stageId: "monitor_employee_link_complete", label: "اكتمال ربط الرصد بالموظف", path: link.completePath },
    { passed: false, code: "MONITOR_LINK_INCOMPLETE", message: "توقف الربط: " + _identityFailureMessage(identity) }
  ));
  return { ok: false, error: _linkError(identity, "IDENTITY_NOT_APPROVED") };
}

/** المرحلة الثانية: قراءة النبض ومطابقته، ثم ختم الربط. */
async function _checkHeartbeatStage(link) {
  const stage = { stageId: "monitor_heartbeat_readback", label: "التحقق من نبض الموظف", path: link.runtimePath };
  _recordLinkCheckpoint(_pendingCheckpoint(stage));
  const runtime = await monitorNet.monitorRequest({
    path: `runtime/${link.empId}/${link.deviceId}`, method: "GET",
  });
  const runtimeOk = _runtimeMatches(runtime, link);
  _recordLinkCheckpoint(_checkpointResult(stage, {
    passed: runtimeOk,
    code: _linkError(runtime, "HEARTBEAT_READBACK_MISMATCH"),
    message: runtimeOk ? "نجحت قراءة النبض وتطابق الموظف والجهاز." : "فشلت قراءة النبض أو لم تتطابق بيانات الربط.",
  }));
  _recordLinkCheckpoint(_checkpointResult(
    { stageId: "monitor_employee_link_complete", label: "اكتمال ربط الرصد بالموظف", path: link.completePath },
    { passed: runtimeOk, code: "MONITOR_LINK_INCOMPLETE", message: "" }
  ));
  return _linkResult(runtimeOk, runtime);
}

/**
 * يتحقق بقراءة مستقلة من هوية الرصد ونبض الموظف والجهاز.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
async function verifyMonitorEmployeeLink(user) {
  const session = await monitorAuth.getMonitorAuthSession(false);
  const link = _linkContext(user, session);
  const identity = await _checkIdentityStage(link, session);
  if (!identity.ok) return _stopLinkAtIdentity(link, identity.result);
  return await _checkHeartbeatStage(link);
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_diagnostic_snapshot.js
// ════════════════════════════════════════════════

/** @returns {Object} لقطة تشخيصية صغيرة من الجهاز الحالي. */
function buildMonitorDiagnosticSnapshot() {
  const queue = monitorQueue.readMonitorQueue();
  return Object.freeze({
    queueDepth: queue.length,
    queueStatus: monitorQueue.readMonitorQueueStatus(),
    network: monitorNet.readMonitorNetworkStats(),
    release: monitorBase.getReleaseVersion(),
    device: { model: String(Device.model()), osVersion: String(Device.systemVersion()) },
    capturedAt: new Date().toISOString(),
  });
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_write_command_result.js
// ════════════════════════════════════════════════

/**
 * يكتب نتيجة أمر تشخيصي واحد.
 * @param {Object} command
 * @returns {Promise<Object>}
 */
async function writeMonitorCommandResult(command) {
  const user = cfg.getCurrentUser() || {};
  const session = await monitorAuth.getMonitorAuthSession(false);
  if (!session || !(command && command.commandId)) return { ok: false, error: "INVALID_COMMAND_CONTEXT" };
  const empId = monitorBase.makeMonitorSafeId(user.empId);
  const payload = {
    commandId: monitorBase.makeMonitorSafeId(command.commandId),
    type: "REQUEST_DIAGNOSTIC",
    monitorUid: session.uid,
    empId: empId,
    deviceId: monitorBase.getMonitorDeviceId(),
    state: "completed",
    completedAt: { ".sv": "timestamp" },
    systemVersion: monitorBase.getReleaseVersion().systemVersion,
    queueDepth: monitorQueue.readMonitorQueue().length,
    summary: "diagnostic_snapshot_ready",
    details: buildMonitorDiagnosticSnapshot(),
  };
  return await monitorNet.monitorRequest({ path: `results/${empId}/${payload.commandId}`, method: "PUT", body: payload });
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_poll_command.js
// ════════════════════════════════════════════════

function _isActionableCommand(command) {
  if (command.type !== "REQUEST_DIAGNOSTIC") return false;
  if (command.state !== "requested") return false;
  return Number(command.expiresAt) > Date.now();
}

function _isCompletedResult(result) {
  return Boolean(result.ok && result.data && result.data.state === "completed");
}

function _commandResult(result) {
  return { ok: result.ok === true, applied: result.ok ? 1 : 0 };
}

function _currentEmployee() {
  return cfg.getCurrentUser() || {};
}

function _commandHistoryLimit() {
  return Number(monitorBase.getMonitorRemoteConfig().commandHistoryLimit) || 20;
}

function _hasCommandResponse(response) {
  return Boolean(response.ok && response.data);
}

function _commandFromData(data, key) {
  const command = data[key] || {};
  command.commandId = command.commandId || key;
  return command;
}

async function _readCommandResult(empId, commandId) {
  return await monitorNet.monitorRequest({
    path: `results/${empId}/${monitorBase.makeMonitorSafeId(commandId)}`,
    method: "GET",
  });
}

async function _readCommands(empId) {
  // علامتا الاقتباس محظورتان خامًا في الروابط — ترميزهما قياسي وتفكّه Firebase
  return await monitorNet.monitorRequest({
    path: `commands/${empId}`, method: "GET",
    query: `orderBy=${encodeURIComponent('"$key"')}&limitToLast=${_commandHistoryLimit()}`,
  });
}

/** ينفّذ أحدث أمر صالح لم تُكتب نتيجته بعد، وأمرًا واحدًا فقط. */
async function _applyFirstActionable(empId, data) {
  const keys = Object.keys(data).sort().reverse();
  for (let index = 0; index < keys.length; index++) {
    const command = _commandFromData(data, keys[index]);
    if (!_isActionableCommand(command)) continue;
    if (_isCompletedResult(await _readCommandResult(empId, command.commandId))) continue;
    return _commandResult(await writeMonitorCommandResult(command));
  }
  return { ok: true, applied: 0 };
}

/** @returns {Promise<Object>} نتيجة فحص وتنفيذ أحدث أمر تشخيصي صالح. */
async function pollMonitorCommand() {
  const user = _currentEmployee();
  if (!user.empId) return { ok: false, applied: 0 };
  const empId = monitorBase.makeMonitorSafeId(user.empId);
  const response = await _readCommands(empId);
  if (!_hasCommandResponse(response)) return { ok: response.ok, applied: 0 };
  return await _applyFirstActionable(empId, response.data);
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_write_heartbeat.js
// ════════════════════════════════════════════════

function _heartbeatText(source, key, maxLength) {
  return String(source[key] || "").substring(0, maxLength);
}

function _heartbeatNumber(source, key) {
  return Number(source[key] || 0);
}

function _latestFingerprint(history) {
  if (!history.length) return "";
  const latest = history[history.length - 1];
  return (latest && latest.fingerprint) ? latest.fingerprint : "";
}

/**
 * قاعدة runtime تشترط تطابق الدور المرسل مع identities/{uid}/role حرفيًّا،
 * فالمصدر الصحيح للنبض هو الهوية المعتمدة، ودور النظام الحي احتياط عند غيابها.
 * @param {Object|null} identity @param {Object} user @returns {string}
 */
function _heartbeatRole(identity, user) {
  const identityRole = (identity && identity.role) ? String(identity.role) : "";
  return (identityRole || String(user.role || "employee")).substring(0, 40);
}

/** @param {{session: Object, deviceId: string, identity: (Object|null)}} link */
function _buildHeartbeatPayload(user, link) {
  const session = link.session;
  const deviceId = link.deviceId;
  const queueStatus = monitorQueue.readMonitorQueueStatus();
  const networkStats = monitorNet.readMonitorNetworkStats();
  const history = monitorQueue.readMonitorHistory();
  return {
    monitorUid: session.uid,
    empId: monitorBase.makeMonitorSafeId(user.empId),
    deviceId: deviceId,
    role: _heartbeatRole(link.identity, user),
    model: String(Device.model()).substring(0, 80),
    osVersion: String(Device.systemVersion()).substring(0, 40),
    systemVersion: monitorBase.getReleaseVersion().systemVersion,
    lastSeenAt: { ".sv": "timestamp" },
    queueDepth: monitorQueue.readMonitorQueue().length,
    queueLateReason: _heartbeatText(queueStatus, "lateReason", 160),
    lastFlushedCount: _heartbeatNumber(queueStatus, "lastFlushedCount"),
    lastFlushAt: _heartbeatText(queueStatus, "lastFlushAt", 40),
    lastFlushFailure: _heartbeatText(queueStatus, "lastFailureReason", 160),
    currentFlushFailure: _heartbeatText(queueStatus, "currentFailureReason", 160),
    lastFailureAt: _heartbeatText(queueStatus, "lastFailureAt", 40),
    lastFailureStatus: _heartbeatNumber(queueStatus, "lastFailureStatus"),
    recoveredAt: _heartbeatText(queueStatus, "recoveredAt", 40),
    consecutiveFlushFailures: _heartbeatNumber(queueStatus, "consecutiveFlushFailures"),
    droppedCount: _heartbeatNumber(queueStatus, "droppedCount"),
    overflowReason: _heartbeatText(queueStatus, "overflowReason", 80),
    overflowAt: _heartbeatText(queueStatus, "overflowAt", 40),
    networkMedianMs: _heartbeatNumber(networkStats, "medianMs"),
    networkP95Ms: _heartbeatNumber(networkStats, "p95Ms"),
    networkSampleCount: _heartbeatNumber(networkStats, "count"),
    networkLastStatus: _heartbeatNumber(networkStats, "lastStatus"),
    lastFingerprint: _latestFingerprint(history),
  };
}

/** يكتب نبض جهاز واحد إلى قاعدة الرصد. */
async function writeMonitorHeartbeat(user) {
  if (!(user && user.empId)) return { ok: false, error: "MISSING_MAIN_IDENTITY" };
  const session = await monitorAuth.getMonitorAuthSession(false);
  if (!session) return { ok: false, error: "MONITOR_AUTH_UNAVAILABLE" };

  const deviceId = monitorBase.getMonitorDeviceId();
  const identity = await readOwnMonitorIdentity(session);
  const payload = _buildHeartbeatPayload(user, { session, deviceId, identity });
  const path = "runtime/" + monitorBase.makeMonitorSafeId(user.empId) +
    "/" + monitorBase.makeMonitorSafeId(deviceId);
  return await monitorNet.monitorRequest({ path: path, method: "PUT", body: payload });
}

module.exports = Object.freeze({
  readOwnMonitorIdentity,
  isIdentityApprovedFor,
  requestMonitorEnrollment,
  verifyMonitorEmployeeLink,
  buildMonitorDiagnosticSnapshot,
  writeMonitorCommandResult,
  pollMonitorCommand,
  writeMonitorHeartbeat,
});
