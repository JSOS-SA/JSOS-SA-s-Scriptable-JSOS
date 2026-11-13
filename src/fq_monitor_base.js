// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: database;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_base.js

/**
 * الأساس المشترك: إعدادات الرصد ورقم الجهاز والإصدار وتنظيف النصوص.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_remote_config.js
 *   fq_monitor_safe_id.js
 *   fq_monitor_get_device_id.js
 *   fq_monitor_release_version.js
 *   fq_monitor_retention_policy.js
 *   fq_monitor_runtime_session.js
 *   fq_monitor_forbidden_fields.js
 *   fq_monitor_redact_text.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

// ════════════════════════════════════════════════
// كان ملف fq_monitor_remote_config.js
// ════════════════════════════════════════════════

const MONITOR_REMOTE_CONFIG = Object.freeze({
  databaseUrl: "https://hajj-sc-default-rtdb.firebaseio.com",
  apiKey: "AIzaSyBUHqB8nRJo-ld8MkwroG2Ap-nSSp0uVak",
  projectId: "hajj-sc",
  reportTimeZone: "Asia/Riyadh",
  requestTimeoutSeconds: 12,
  tokenRefreshMarginMs: 300000,
  heartbeatFreshMs: 90000,
  heartbeatLateMs: 300000,
  heartbeatIntervalMs: 60000,
  commandPollIntervalMs: 25000,
  commandHistoryLimit: 20,
  batchSize: 25,
  queueLimit: 500,
  // ‏عدد مرات الرفض المتتالية قبل عزل الدفعة: الرفض العارض يُعاد، والدائم يُسقط كي لا يسدّ ما خلفه
  flushDenialLimit: 5,
  // ‏دورة التفريغ الحي: أقل من دقيقة كي يظهر الحدث في القاعدة خلال دقيقة من وقوعه
  flushIntervalMs: 30000,
});

/**
 * يعيد الإعدادات العامة لمشروع الرصد المستقل.
 * مفتاح Web API معرّف عام؛ لا يمنح صلاحية من دون المصادقة والقواعد.
 * @returns {Object}
 */
function getMonitorRemoteConfig() {
  return MONITOR_REMOTE_CONFIG;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_safe_id.js
// ════════════════════════════════════════════════

/** @param {*} value @returns {string} معرّف صالح لمسار Firebase. */
function makeMonitorSafeId(value) {
  const raw = value === null || value === undefined || value === "" ? "unknown" : String(value);
  const safe = raw.replace(/[.#$[\]/]/g, "-").substring(0, 120);
  return safe.length ? safe : "unknown";
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_get_device_id.js
// ════════════════════════════════════════════════

const DEVICE_ID_KEY = "fq_monitor_v2_device_id";

/** @returns {string} معرّف محلي ثابت للرصد لا يكشف معرّف النظام. */
function getMonitorDeviceId() {
  try {
    if (Keychain.contains(DEVICE_ID_KEY)) return Keychain.get(DEVICE_ID_KEY);
    const deviceId = UUID.string().replace(/[.#$[\]/]/g, "-");
    Keychain.set(DEVICE_ID_KEY, deviceId);
    return deviceId;
  } catch (error) {
    console.error(`[fq_monitor_get_device_id] ${error.message}`);
    return "unknown-device";
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_release_version.js
// ════════════════════════════════════════════════

const RELEASE = Object.freeze({
  systemVersion: "2026.08.26.1-audit.fixes",
  schemaVersion: "2.1.0",
  reportSchemaVersion: "1.4.0",
  buildId: "local-recording-repair-1",
  environment: "production",
});

/** @returns {Object} الإصدار المركزي وعقود مخطط الرصد. */
function getReleaseVersion() {
  return RELEASE;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_retention_policy.js
// ════════════════════════════════════════════════

/** @returns {Object} سياسة الاحتفاظ المحدودة لمساحة قاعدة الرصد. */
function getMonitorRetentionPolicy() {
  return Object.freeze({ eventsDays: 30, authJourneysDays: 30, controlAuditDays: 0 });
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_runtime_session.js
// ════════════════════════════════════════════════

let runtimeSessionId = "";

/** @returns {string} معرّف جلسة الرصد الحالية داخل تشغيل واحد. */
function getMonitorRuntimeSession() {
  if (!runtimeSessionId) runtimeSessionId = UUID.string();
  return runtimeSessionId;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_forbidden_fields.js
// ════════════════════════════════════════════════

const FORBIDDEN_FIELDS = Object.freeze([
  "password", "pass", "idToken", "refreshToken", "token",
  "authorization", "apiKey", "secret", "cookie", "auth",
]);

/** @returns {Array<string>} أسماء الحقول التي لا تدخل سجل الرصد. */
function getForbiddenMonitorFields() {
  return FORBIDDEN_FIELDS.slice();
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_redact_text.js
// ════════════════════════════════════════════════

/** أسماء الحقول التي تُعتبر أسرارًا ويجب حجب قيمتها دائمًا. */
const SECRET_KEYS = "password|refreshToken|idToken|monitorToken|accessToken|apiKey|api_key|secret|authorization|auth_token|id_token|refresh_token";

/**
 * يحجب الرموز والأسرار المحتملة من نص رصد واحد.
 * يغطي أربع صيغ: قيمة JSON مقتبسة، قيمة حرة بعد نقطتين أو مساواة،
 * بارامتر auth في أي موضع من النص، وترويسة Bearer.
 * @param {*} value
 * @returns {string}
 */
function redactMonitorText(value) {
  const input = value === null || value === undefined ? "" : String(value);
  return input
    .replace(/(bearer\s+)[a-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(new RegExp(`(["']?(?:${SECRET_KEYS})["']?\\s*[:=]\\s*)(["'])[^"']*\\2`, "gi"), '$1$2[REDACTED]$2')
    .replace(new RegExp(`((?:${SECRET_KEYS})\\s*[:=]\\s*)[^\\s,;}\\)\\]&]+`, "gi"), "$1[REDACTED]")
    .replace(/(\bauth=)[^&\s"']+/gi, "$1[REDACTED]")
    .substring(0, 8000);
}

module.exports = Object.freeze({
  getMonitorRemoteConfig,
  makeMonitorSafeId,
  getMonitorDeviceId,
  getReleaseVersion,
  getMonitorRetentionPolicy,
  getMonitorRuntimeSession,
  getForbiddenMonitorFields,
  redactMonitorText,
});
