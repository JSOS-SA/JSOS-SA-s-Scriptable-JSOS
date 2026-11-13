// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: cloud-upload-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_session.js

/**
 * تشغيل الرصد بعد الدخول وإيقافه.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_schedule_flush.js
 *   fq_monitor_schedule_heartbeat.js
 *   fq_monitor_schedule_command_poll.js
 *   fq_monitor_refresh_webview_token.js
 *   fq_monitor_finish_session.js
 *   fq_monitor_start_after_login.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorBase = importModule("fq_monitor_base");
const monitorQueue = importModule("fq_monitor_queue");
const cfg = importModule("fq_config");
const monitorDevice = importModule("fq_monitor_device");
const monitorAuth = importModule("fq_monitor_auth");
const monitorCapture = importModule("fq_monitor_capture");
const monitorJourney = importModule("fq_monitor_journey");

// ════════════════════════════════════════════════
// كان ملف fq_monitor_schedule_flush.js
// ════════════════════════════════════════════════

let flushTimer = null;

/** @returns {Timer|null} مؤقت ترحيل الأحداث الدوري. */
function scheduleMonitorFlush() {
  if (flushTimer) return flushTimer;
  flushTimer = Timer.schedule(monitorBase.getMonitorRemoteConfig().flushIntervalMs, true, () => {
    monitorQueue.flushMonitorBatch().catch((error) => {
      console.error(`[fq_monitor_schedule_flush] ${error.message}`);
    });
  });
  return flushTimer;
}

/** @returns {boolean} true عند إيقاف مؤقت ترحيل الأحداث. */
function stopMonitorFlush() {
  if (!flushTimer) return false;
  const timer = flushTimer;
  flushTimer = null;
  try {
    timer.invalidate();
    return true;
  } catch (error) {
    console.error(`[fq_monitor_schedule_flush] stop ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_schedule_heartbeat.js
// ════════════════════════════════════════════════

let heartbeatTimer = null;

/** @returns {Timer|null} مؤقت نبض الرصد الدوري. */
function scheduleMonitorHeartbeat() {
  if (heartbeatTimer) return heartbeatTimer;
  heartbeatTimer = Timer.schedule(monitorBase.getMonitorRemoteConfig().heartbeatIntervalMs, true, () => {
    monitorDevice.writeMonitorHeartbeat(cfg.getCurrentUser() || {}).catch((error) => {
      console.error(`[fq_monitor_schedule_heartbeat] ${error.message}`);
    });
  });
  return heartbeatTimer;
}

/** @returns {boolean} true عند إيقاف مؤقت نبض الرصد. */
function stopMonitorHeartbeat() {
  if (!heartbeatTimer) return false;
  const timer = heartbeatTimer;
  heartbeatTimer = null;
  try {
    timer.invalidate();
    return true;
  } catch (error) {
    console.error(`[fq_monitor_schedule_heartbeat] stop ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_schedule_command_poll.js
// ════════════════════════════════════════════════

let commandTimer = null;

/** @returns {Timer|null} مؤقت فحص أوامر الرصد الآمنة. */
function scheduleMonitorCommandPoll() {
  if (commandTimer) return commandTimer;
  commandTimer = Timer.schedule(monitorBase.getMonitorRemoteConfig().commandPollIntervalMs, true, () => {
    monitorDevice.pollMonitorCommand().catch((error) => {
      console.error(`[fq_monitor_schedule_command_poll] ${error.message}`);
    });
  });
  return commandTimer;
}

/** @returns {boolean} true عند إيقاف مؤقت فحص أوامر الرصد. */
function stopMonitorCommandPoll() {
  if (!commandTimer) return false;
  const timer = commandTimer;
  commandTimer = null;
  try {
    timer.invalidate();
    return true;
  } catch (error) {
    console.error(`[fq_monitor_schedule_command_poll] stop ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_refresh_webview_token.js
// ════════════════════════════════════════════════

/**
 * يجدد توكن الرصد داخل WebView دون لمس توكن النظام.
 * @param {WebView} webView
 * @returns {Promise<boolean>}
 */
async function refreshMonitorWebViewToken(webView) {
  const session = await monitorAuth.getMonitorAuthSession(true);
  if (!(session && session.idToken)) return false;
  const token = JSON.stringify(session.idToken);
  await webView.evaluateJavaScript(`if(typeof window.fqUpdateMonitorToken==='function'){window.fqUpdateMonitorToken(${token});}void(0);`);
  return true;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_finish_session.js
// ════════════════════════════════════════════════

/** @returns {Promise<Object>} نتيجة إنهاء وترحيل جلسة رصد واحدة. */
async function finishMonitorSession() {
  stopMonitorHeartbeat();
  stopMonitorCommandPoll();
  // ‏يُوقَف المؤقت قبل الترحيل الأخير كي لا تتزاحم دفعتان على الطابور نفسه
  stopMonitorFlush();
  return await monitorQueue.flushMonitorBatch();
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_start_after_login.js
// ════════════════════════════════════════════════

let started = false;

/**
 * يبدأ رصدًا معزولًا مرة واحدة بعد نجاح مصادقة النظام.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
async function startMonitoringAfterLogin(user) {
  if (started) return { ok: true, alreadyStarted: true };
  started = true;
  try {
    return await runStartupSequence(user);
  } catch (error) {
    // فشل غير متوقع يجب ألا يترك الرصد معطلًا إلى الأبد داخل هذه الجلسة.
    started = false;
    console.error(`[fq_monitor_start_after_login] ${error.message}`);
    return { ok: false, error: error.message || "MONITOR_START_FAILED", started: false };
  }
}

const STARTUP_PATH = "fq_monitor_start_after_login.runStartupSequence";

/** مراحل التسلسل الثابتة: هويّة كل مرحلة واسمها ومسارها كما تظهر في دفتر الرحلات. */
const STAGE = Object.freeze({
  enter: { stageId: "monitor_start_enter", label: "بدء تسلسل الرصد", path: STARTUP_PATH },
  auth: { stageId: "monitor_anonymous_auth", label: "مصادقة الرصد المعزولة", path: "Firebase Auth (hajj-sc)" },
  flush: { stageId: "monitor_event_flush", label: "إرسال أحداث الرصد المؤجلة", path: "/events/{date}/{empId}/{eventId}" },
  exit: { stageId: "monitor_start_exit", label: "نهاية تسلسل الرصد", path: STARTUP_PATH },
});

const PENDING = Object.freeze({ status: "pending" });
const PASSED = Object.freeze({ status: "passed" });

/**
 * يسجّل نقطة تفتيش واحدة لمرحلة الربط في دفتر الرحلات.
 * @param {{stageId: string, label: string, path: string}} stage المرحلة
 * @param {{status: string, code?: string, message?: string}} outcome حالها
 * @returns {void}
 */
function _checkpoint(stage, outcome) {
  monitorJourney.recordMonitorAuthCheckpoint({
    stageId: stage.stageId,
    phase: "monitor_link",
    label: stage.label,
    path: stage.path,
    status: outcome.status,
    code: outcome.code || "",
    message: outcome.message || "",
  });
}

function _resultStatus(result) {
  return result.ok ? "passed" : "failed";
}

function _resultCode(result) {
  return result.error || "";
}

/** @returns {{status: string, code: string}} حال مرحلة من نتيجة {ok, error}. */
function _resultOutcome(result) {
  return { status: _resultStatus(result), code: _resultCode(result) };
}

/** @returns {{status: string, code?: string}} حال مرحلة المصادقة من الجلسة. */
function _sessionOutcome(session) {
  return session ? PASSED : { status: "failed", code: "MONITOR_AUTH_UNAVAILABLE" };
}

/** @returns {{status: string, code: string, message: string}} حال مرحلة الترحيل، ومعه عدد ما أُرسل. */
function _flushOutcome(result) {
  return {
    status: result.ok === false ? "failed" : "passed",
    code: _resultCode(result),
    message: `أُرسل ${_count(result.sent)} حدث.`,
  };
}

function _count(value) {
  return Number(value) || 0;
}

/**
 * ينفّذ مرحلة واحدة بين نقطتي تفتيش: «قيد التنفيذ» قبلها، وحالها بعدها.
 * @param {{stageId: string, label: string, path: string}} stage المرحلة
 * @param {() => Promise<any>} action عمل المرحلة
 * @param {(result: any) => Object} judge يحوّل نتيجة العمل إلى حال المرحلة
 * @returns {Promise<any>} نتيجة العمل كما هي
 */
async function _runStage(stage, action, judge) {
  _checkpoint(stage, PENDING);
  const result = await action();
  _checkpoint(stage, judge(result));
  return result;
}

/** يركّب التقاط الأخطاء ويهيّئ جلسة التشغيل قبل أي نداء للشبكة. */
function _prepareMonitorRuntime() {
  monitorCapture.installMonitorConsoleCapture();
  monitorCapture.installMonitorLoggerCapture();
  monitorBase.getMonitorRuntimeSession();
}

/**
 * مسارا طلب الربط والنبض كما يُكتبان في دفتر الرحلات.
 * @param {Object|null} session جلسة الرصد
 * @param {Object|null} user الموظف
 * @returns {{enrollment: string, runtime: string}}
 */
function _startupPaths(session, user) {
  const enrollment = "/enrollment_requests/" +
    monitorBase.makeMonitorSafeId(session === null || session === undefined ? undefined : session.uid);
  const runtime = "/runtime/" + monitorBase.makeMonitorSafeId(user === null || user === undefined ? undefined : user.empId) +
    "/" + monitorBase.makeMonitorSafeId(monitorBase.getMonitorDeviceId());
  return { enrollment, runtime };
}

/**
 * مرحلتا طلب الربط وكتابة النبض، بترتيبهما.
 * @param {Object} user الموظف
 * @param {{enrollment: string, runtime: string}} paths مساراهما
 * @returns {Promise<{enrollment: Object, heartbeat: Object}>} نتيجتاهما
 */
async function _registerDevice(user, paths) {
  const enrollment = await _runStage(
    { stageId: "monitor_enrollment_write", label: "طلب ربط الرصد", path: paths.enrollment },
    () => monitorDevice.requestMonitorEnrollment(user), _resultOutcome
  );
  const heartbeat = await _runStage(
    { stageId: "monitor_heartbeat_write", label: "كتابة نبض الموظف", path: paths.runtime },
    () => monitorDevice.writeMonitorHeartbeat(user), _resultOutcome
  );
  return { enrollment, heartbeat };
}

async function _publishJourneys(linkResult, user) {
  if (!linkResult.ok) {
    return { ok: false, published: 0, error: linkResult.error };
  }
  return await monitorJourney.publishMonitorAuthJourneys(user);
}

async function _activateMonitorSchedulers() {
  await monitorDevice.pollMonitorCommand();
  scheduleMonitorHeartbeat();
  scheduleMonitorCommandPoll();
  scheduleMonitorFlush();
}

/**
 * نقطة الخروج، ثم نشر الرحلات وتشغيل المؤقّتات إن نجح الربط وحده.
 * @param {Object} linkResult نتيجة التحقق من الربط
 * @param {Object} user الموظف
 * @returns {Promise<Object>} نتيجة النشر
 */
async function _closeStartup(linkResult, user) {
  _checkpoint(STAGE.exit, _resultOutcome(linkResult));
  const publishResult = await _publishJourneys(linkResult, user);
  if (linkResult.ok) await _activateMonitorSchedulers();
  return publishResult;
}

/** يُنفّذ تسلسل بدء الرصد الفعلي. */
async function runStartupSequence(user) {
  _checkpoint(STAGE.enter, PASSED);
  _prepareMonitorRuntime();
  const session = await _runStage(STAGE.auth, () => monitorAuth.getMonitorAuthSession(false), _sessionOutcome);
  const device = await _registerDevice(user, _startupPaths(session, user));
  const flushResult = await _runStage(STAGE.flush, () => monitorQueue.flushMonitorBatch(), _flushOutcome);
  const linkResult = await monitorDevice.verifyMonitorEmployeeLink(user);
  const publishResult = await _closeStartup(linkResult, user);

  return {
    ok: linkResult.ok,
    enrollment: device.enrollment.ok === true,
    heartbeat: device.heartbeat.ok === true,
    linked: linkResult.ok,
    journeysPublished: _count(publishResult.published),
    flushed: _count(flushResult.sent),
  };
}

module.exports = Object.freeze({
  scheduleMonitorFlush,
  stopMonitorFlush,
  scheduleMonitorHeartbeat,
  stopMonitorHeartbeat,
  scheduleMonitorCommandPoll,
  stopMonitorCommandPoll,
  refreshMonitorWebViewToken,
  finishMonitorSession,
  startMonitoringAfterLogin,
});
