// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: fingerprint;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_capture.js

/**
 * التقاط الأخطاء.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_build_fingerprint.js
 *   fq_monitor_normalize_error.js
 *   fq_monitor_parse_stack.js
 *   fq_monitor_start_trace.js
 *   fq_monitor_capture_error.js
 *   fq_monitor_console_error.js
 *   fq_monitor_install_console_capture.js
 *   fq_monitor_install_logger_capture.js
 *   fq_monitor_drain_web_errors.js
 *   fq_monitor_web_capture_code.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorBase = importModule("fq_monitor_base");
const cfg = importModule("fq_config");
const monitorQueue = importModule("fq_monitor_queue");
const logger = importModule("fq_logger");
let localErrorObserver = null;
/** يربط التسجيل المحلي دون إرسال تفاصيله الجديدة إلى الشبكة. */
function setLocalErrorObserver(observer) { localErrorObserver = observer; }

// ════════════════════════════════════════════════
// كان ملف fq_monitor_build_fingerprint.js
// ════════════════════════════════════════════════

/**
 * يبني بصمة FNV-1a ثابتة من هوية المشكلة.
 * @param {Object} parts
 * @returns {string}
 */
function buildMonitorFingerprint(parts) {
  const source = [parts.type, parts.message, parts.fileName, parts.functionName, parts.line, parts.systemVersion].join("|").toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fp_${_hex8(hash)}`;
}

// ═══ ثمانيةُ محارف بلا padStart ═══
// `padStart` من ECMAScript 2017، ووثائق Scriptable تضمن ES6 وحده:
// «JavaScriptCore, which supports ECMAScript 6». <https://docs.scriptable.app/>
function _hex8(value) {
  let out = (value >>> 0).toString(16);
  while (out.length < 8) out = "0" + out;
  return out;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_normalize_error.js
// ════════════════════════════════════════════════

function _serializeErrorObject(value) {
  const direct = value.message || value.error || value.reason || "";
  if (direct) return String(direct);
  try {
    return JSON.stringify(value);
  } catch (serializationError) {
    return "Unserializable error object";
  }
}

function _monitorErrorMessage(value) {
  if (value === null || value === undefined) return "Unknown error";
  if (typeof value === "object") return _serializeErrorObject(value);
  return String(value);
}

/**
 * يحوّل قيمة خطأ واحدة إلى شكل ثابت.
 * @param {*} value
 * @returns {Object}
 */
function normalizeMonitorError(value) {
  if (value instanceof Error) {
    return {
      type: value.name || "Error",
      message: value.message || String(value),
      stack: value.stack || "",
    };
  }

  const message = _monitorErrorMessage(value);
  const generated = new Error(message);
  return { type: "Error", message: message, stack: generated.stack || "" };
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_parse_stack.js
// ════════════════════════════════════════════════

function _parseMonitorStackLine(value) {
  const line = String(value || "").trim();
  const match = line.match(/(?:at\s+)?([^@\s(]+)?(?:@|\s+\()?(.+?):(\d+):(\d+)\)?$/);
  if (!match) return null;
  return {
    functionName: match[1] || "unknown",
    fileName: match[2] || "unknown",
    line: Number(match[3]) || 0,
    column: Number(match[4]) || 0,
  };
}

function _isApplicationFrame(item) {
  return item.fileName.indexOf("fq_monitor_") === -1;
}

/**
 * يستخرج أول موضع غير تابع لوحدات الرصد من مكدس واحد.
 * @param {string} stack
 * @returns {Object}
 */
function parseMonitorStack(stack) {
  const lines = String(stack || "").split("\n");
  let fallback = null;
  for (let index = 0; index < lines.length; index++) {
    const item = _parseMonitorStackLine(lines[index]);
    if (!item) continue;
    if (!fallback) fallback = item;
    if (_isApplicationFrame(item)) return item;
  }
  return fallback || {
    functionName: "unknown", fileName: "unknown", line: 0, column: 0,
  };
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_start_trace.js
// ════════════════════════════════════════════════

/**
 * ينشئ سياق تتبع لعملية واحدة.
 * @param {string} operationName
 * @returns {Object}
 */
function startMonitorTrace(operationName) {
  return Object.freeze({
    sessionId: monitorBase.getMonitorRuntimeSession(),
    traceId: UUID.string(),
    operationId: UUID.string(),
    operationName: String(operationName || "unknown_operation").substring(0, 80),
    startedAt: Date.now(),
  });
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_capture_error.js
// ════════════════════════════════════════════════

function _detail(details, key, fallback) {
  return details[key] || fallback;
}

function _detailString(details, key) {
  return String(details[key] || "");
}

function _detailNumber(details, key) {
  return Number(details[key]) || 0;
}

function _monitorCode(details, location) {
  return {
    fileName: _detail(details, "fileName", location.fileName),
    functionName: _detail(details, "functionName", location.functionName),
    line: _detail(details, "line", location.line),
    column: _detail(details, "column", location.column),
    runtime: _detail(details, "runtime", "scriptable"),
  };
}

function _monitorContext(details) {
  return {
    tab: _detailString(details, "tab"),
    action: _detailString(details, "action"),
    stage: _detailString(details, "stage"),
    breadcrumb: monitorBase.redactMonitorText(_detailString(details, "breadcrumb")),
  };
}

function _monitorNetwork(details) {
  return {
    method: _detailString(details, "method"),
    path: monitorBase.redactMonitorText(_detailString(details, "path")),
    status: _detailNumber(details, "status"),
    durationMs: _detailNumber(details, "durationMs"),
    attempts: _detailNumber(details, "attempts"),
  };
}

function _monitorActor(user) {
  return {
    empId: String(user.empId || "unknown"),
    role: String(user.role || "employee"),
  };
}

function _monitorDevice() {
  return {
    deviceId: monitorBase.getMonitorDeviceId(),
    model: Device.model(),
    osVersion: Device.systemVersion(),
  };
}

function _monitorImpact() {
  return {
    firstSeenAt: Date.now(),
    lastSeenAt: Date.now(),
    occurrences: 1,
    affectedUsers: 1,
  };
}

/** @param {{normalized: Object, message: string, code: Object, release: Object}} parts */
function _buildFingerprint(parts) {
  return buildMonitorFingerprint({
    type: parts.normalized.type,
    message: parts.message,
    fileName: parts.code.fileName,
    functionName: parts.code.functionName,
    line: parts.code.line,
    systemVersion: parts.release.systemVersion,
  });
}

/** يبلّغ المسجّل المحلي بالخطأ ما لم يكن قد سُجّل محليًا، وفشله لا يوقف الالتقاط. */
function _notifyLocalObserver(error, details) {
  if (details.localHandled || typeof localErrorObserver !== "function") return;
  try { localErrorObserver(error, details); }
  catch (observerError) { console.warn("تعذر تسجيل الخطأ محليًا"); }
}

/**
 * أجزاء سجل الخطأ بترتيب حسابها نفسه: النوع والموضع والإصدار والتتبع والمستخدم والرسالة والشيفرة.
 * @returns {{normalized: Object, release: Object, trace: Object, user: Object, message: string, code: Object}}
 */
function _errorParts(error, details) {
  const normalized = normalizeMonitorError(error);
  const location = parseMonitorStack(normalized.stack);
  const release = monitorBase.getReleaseVersion();
  const trace = startMonitorTrace(_detail(details, "operation", details.stage));
  const user = cfg.getCurrentUser() || {};
  const message = monitorBase.redactMonitorText(normalized.message);
  const code = _monitorCode(details, location);
  return { normalized: normalized, release: release, trace: trace, user: user, message: message, code: code };
}

/**
 * يحوّل خطأ واحدًا إلى سجل موحد ويكتبه محليًا.
 * @param {*} error
 * @param {Object} context
 * @returns {boolean}
 */
function captureMonitorError(error, context) {
  const details = context || {};
  _notifyLocalObserver(error, details);
  const parts = _errorParts(error, details);
  const now = Date.now();

  return monitorQueue.writeMonitorEvent({
    schemaVersion: parts.release.schemaVersion,
    eventId: parts.trace.operationId,
    fingerprint: _buildFingerprint(parts),
    occurredAt: now,
    severity: _detail(details, "severity", "error"),
    category: _detail(details, "category", "application"),
    scope: "unknown",
    issueState: "new",
    exception: {
      type: parts.normalized.type,
      message: parts.message,
      stacktrace: monitorBase.redactMonitorText(parts.normalized.stack),
    },
    code: parts.code,
    context: _monitorContext(details),
    correlation: parts.trace,
    release: parts.release,
    actor: _monitorActor(parts.user),
    device: _monitorDevice(),
    network: _monitorNetwork(details),
    impact: _monitorImpact(),
    redactedFields: monitorBase.getForbiddenMonitorFields(),
  });
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_console_error.js
// ════════════════════════════════════════════════

// الأصلية وعلامة الانشغال تُحفظان على كائن `console` نفسه لا على `globalThis`:
// الثاني من ECMAScript 2020 والوثائق تضمن السادس وحده، و`console` واجهة موثَّقة
// واحدة للسكربت كله، فلا يُثبَّت الملتقط مرتين ولو حُمِّلت الوحدة مرتين (قرار المالك ٢٠٢٦-١٠-٠٥).
// والاسمان بالأقواس لأنهما ليسا من دوال `console` الموثَّقة، فلا تعرفهما تعريفات الأنواع.
const CONSOLE_ORIGINAL_KEY = "__fqMonitorOriginalConsoleError";
const CONSOLE_BUSY_KEY = "__fqMonitorConsoleCaptureBusy";

/**
 * أول خطأ بين قيم نداء console.error، والقيم كلها نصًّا واحدًا تفصلها مسافة.
 * @param {Array<*>} values
 * @returns {{captured: (Error|null), message: string}}
 */
function _consoleErrorParts(values) {
  let captured = null;
  let message = "";
  for (let index = 0; index < values.length; index++) {
    if (!captured && values[index] instanceof Error) captured = values[index];
    message += (index > 0 ? " " : "") + String(values[index]);
  }
  return { captured: captured, message: message };
}

/**
 * يسجل استدعاء console.error واحدًا ثم يمرره للسجل الأصلي.
 * @param {...*} values
 * @returns {void}
 */
function captureMonitorConsoleError(...values) {
  const original = console[CONSOLE_ORIGINAL_KEY];
  if (typeof original === "function") original.apply(console, values);
  if (console[CONSOLE_BUSY_KEY] === true) return;
  console[CONSOLE_BUSY_KEY] = true;
  try {
    const parts = _consoleErrorParts(values);
    // الخطأ يُنشأ هنا لا في المساعد: موضعه في التتبّع هو ما تنسبه لوحة الرصد إليه.
    captureMonitorError(parts.captured || new Error(parts.message), { category: "console", stage: "console.error" });
  } finally {
    console[CONSOLE_BUSY_KEY] = false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_install_console_capture.js
// ════════════════════════════════════════════════

/** @returns {boolean} true عند تثبيت ملتقط console.error أو وجوده مسبقًا. */
function installMonitorConsoleCapture() {
  if (console[CONSOLE_ORIGINAL_KEY]) return true;
  try {
    console[CONSOLE_ORIGINAL_KEY] = console.error.bind(console);
    console[CONSOLE_BUSY_KEY] = false;
    console.error = captureMonitorConsoleError;
    return true;
  } catch (error) {
    console.warn(`[fq_monitor_install_console_capture] ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_install_logger_capture.js
// ════════════════════════════════════════════════

let installed = false;

/** @returns {boolean} true عند ربط مسجل النظام بطابور الرصد. */
function installMonitorLoggerCapture() {
  if (installed) return true;
  if (typeof logger.setErrorObserver !== "function") return false;
  const ok = logger.setErrorObserver((source, error, localHandled) => {
    captureMonitorError(error, {
      category: "application",
      localHandled: localHandled === true,
      stage: String(source || "logger"),
      breadcrumb: String(source || "logger")
    });
  });
  installed = ok === true;
  return installed;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_drain_web_errors.js
// ════════════════════════════════════════════════

/**
 * يقرأ أخطاء الصفحة المتراكمة ويفرّغها. `useCallback` صحيح لأن الشيفرة تستدعي `completion`
 * (الوثائق: «evaluation will only complete after the globally available completion function is called»).
 * @param {WebView} webView
 * @returns {Promise<Array<Object>>}
 */
async function _readWebErrorRows(webView) {
  const script = "(function(){const a=Array.isArray(window._FQ_MON_WEB_ERRORS)?window._FQ_MON_WEB_ERRORS:[];window._FQ_MON_WEB_ERRORS=[];completion(JSON.stringify(a));})();";
  const raw = await webView.evaluateJavaScript(script, true);
  return raw ? JSON.parse(raw) : [];
}

/** يضع تتبّع الصفحة على الخطأ إن وُجد، ويُرجع الخطأ نفسه. */
function _withStack(error, stack) {
  if (stack) error.stack = stack;
  return error;
}

/**
 * ينقل أخطاء WebView المتراكمة إلى الطابور المحلي مرة واحدة.
 * @param {WebView} webView
 * @returns {Promise<number>}
 */
async function drainMonitorWebErrors(webView) {
  try {
    const rows = await _readWebErrorRows(webView);
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index] || {};
      // الخطأ يُنشأ هنا لا في المساعد: موضعه في التتبّع هو ما تنسبه لوحة الرصد إليه.
      const error = _withStack(new Error(row.message || row.type || "WebView error"), row.stack);
      captureMonitorError(error, { category: row.type || "webview", runtime: "webview", fileName: row.fileName, line: row.line, column: row.column, stage: "webview" });
    }
    return rows.length;
  } catch (error) {
    console.error(`[fq_monitor_drain_web_errors] ${error.message}`);
    return 0;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_web_capture_code.js
// ════════════════════════════════════════════════

/** @returns {string} كتلة مستقلة تسبق بقية أكواد WebView. */
function getMonitorWebCaptureCode() {
  return [
    "window._FQ_MON_WEB_ERRORS=[];",
    "let _FQ_MON_WEB_LAST={key:'',time:0};",
    "function _fqMonText(v){return v===null||v===undefined?'':String(v).substring(0,8000);}",
    "function _fqMonPushWebError(x){if(!x)return;const key=_fqMonText(x.type)+'|'+_fqMonText(x.message)+'|'+_fqMonText(x.stack).substring(0,240);const now=Date.now();if(_FQ_MON_WEB_LAST.key===key&&now-_FQ_MON_WEB_LAST.time<1000)return;_FQ_MON_WEB_LAST={key:key,time:now};_FQ_MON_WEB_ERRORS.push(x);if(_FQ_MON_WEB_ERRORS.length>50)_FQ_MON_WEB_ERRORS.shift();}",
    "function _fqMonWindowError(e){_fqMonPushWebError({type:'window.error',message:_fqMonText(e&&e.message),stack:_fqMonText(e&&e.error&&e.error.stack),fileName:_fqMonText(e&&e.filename),line:Number(e&&e.lineno)||0,column:Number(e&&e.colno)||0,runtime:'webview',occurredAt:Date.now()});}",
    "function _fqMonUnhandled(e){const r=e&&e.reason;_fqMonPushWebError({type:'unhandledrejection',message:_fqMonText(r&&r.message?r.message:r),stack:_fqMonText(r&&r.stack),fileName:'webview',line:0,column:0,runtime:'webview',occurredAt:Date.now()});}",
    "window.addEventListener('error',_fqMonWindowError);",
    "window.addEventListener('unhandledrejection',_fqMonUnhandled);",
  ].join("\n");
}

module.exports = Object.freeze({
  setLocalErrorObserver,
  buildMonitorFingerprint,
  normalizeMonitorError,
  parseMonitorStack,
  startMonitorTrace,
  captureMonitorError,
  captureMonitorConsoleError,
  installMonitorConsoleCapture,
  installMonitorLoggerCapture,
  drainMonitorWebErrors,
  getMonitorWebCaptureCode,
});
