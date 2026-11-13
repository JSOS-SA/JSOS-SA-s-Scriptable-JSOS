// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: cube;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_model.js

/**
 * @module fq_monitor_model
 * @description نموذج الرصد — الدوال الخالصة وحدها.
 * المسؤولية الواحدة: تحويل القيم وبناء السجلات وحساب الأرقام.
 *
 * لا تستورد شيئًا، ولا تلمس ملفًا ولا شبكة ولا واجهة نظام. هذا مقصود:
 * الطبقة الوحيدة القابلة للاختبار فعليًا في بيئة بلا إطار اختبار هي
 * الطبقة الخالية من الآثار الجانبية.
 */

// ════════════════════════════════════════════════
// 1. الحدود والثوابت
// ════════════════════════════════════════════════

const MONITOR_LIMITS = Object.freeze({
  MAX_NAME_LENGTH: 40,
  MAX_VALUE_LENGTH: 100,
  MAX_PARAM_COUNT: 25,
  MAX_QUEUE_ENTRIES: 500,
  MAX_EVENT_AGE_DAYS: 7,
  BATCH_SIZE: 50,
  SLOW_PHASE_MS: 3000,
  MS_PER_DAY: 86400000,
  PERCENT_FACTOR: 100,
  RESERVED_NAME_PREFIX: "firebase_",
  SAFE_ID_REGEX: /[.#$[\]/]/g,
  BATCH_KEY_PREFIX: "mon_",
});

const EVENT_KIND = Object.freeze({
  EVENT: "event",
  UI_FAILURE: "ui_failure",
  SYNC_FAILURE: "sync_failure",
  FILE_FAILURE: "file_failure",
});

// ════════════════════════════════════════════════
// 2. تحويل القيم
// ════════════════════════════════════════════════

/**
 * يقصّ قيمة إلى نصّ ضمن حدّ أقصى بلا رمي خطأ على الأنواع غير النصّية.
 * @param {*} value - القيمة الخام
 * @param {number} maxLength - الحدّ الأقصى للطول
 * @returns {string} النصّ المقصوص
 */
function truncate(value, maxLength) {
  const text = (value === null || value === undefined) ? "" : String(value);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength);
}

/**
 * ينظّف اسم الحدث: بلا مسافات، وبلا البادئة المحجوزة، وضمن الحدّ.
 * @param {string} name - الاسم الخام
 * @returns {string} الاسم النظيف، أو نصّ فارغ إن كان مرفوضًا
 */
function sanitizeName(name) {
  const raw = truncate(name, MONITOR_LIMITS.MAX_NAME_LENGTH).trim();
  if (!raw) return "";
  if (raw.indexOf(MONITOR_LIMITS.RESERVED_NAME_PREFIX) === 0) return "";
  return raw.replace(/\s+/g, "_");
}

/**
 * ينظّف معلمات الحدث: عدد محدود، وقيم مقصوصة، وبلا تداخل.
 * التسطيح مقصود لأن القيم المتداخلة تكسر الكتابة في قاعدة مسطّحة.
 * @param {Object} params - المعلمات الخام
 * @returns {Object} معلمات آمنة للتسلسل
 */
function sanitizeParams(params) {
  const safe = {};
  if (!params || typeof params !== "object") return safe;
  const keys = Object.keys(params).slice(0, MONITOR_LIMITS.MAX_PARAM_COUNT);
  for (let i = 0; i < keys.length; i++) {
    const key = sanitizeName(keys[i]);
    if (key) safe[key] = truncate(params[keys[i]], MONITOR_LIMITS.MAX_VALUE_LENGTH);
  }
  return safe;
}

/**
 * ينظّف معرّف الموظف من الرموز المحجوزة في مسارات فايربيس.
 * @param {string} empId - المعرّف الخام
 * @returns {string} المعرّف الآمن
 */
function safeId(empId) {
  return (empId || "unknown").replace(MONITOR_LIMITS.SAFE_ID_REGEX, "-");
}

// ════════════════════════════════════════════════
// 3. بناء السجلات
// ════════════════════════════════════════════════

/**
 * يبني سجل حدث موحّد الشكل.
 * الهوية تُمرَّر ولا تُقرأ من الإعدادات، كي تبقى الدالة خالصة وقابلة للاختبار.
 * @param {string} kind - نوع الحدث من EVENT_KIND
 * @param {string} name - اسم الحدث
 * @param {{params: Object, empId: string, role: string, at: number}} details - التفاصيل والهوية واللحظة
 * @returns {Object} السجل الجاهز للتخزين
 */
function buildEntry(kind, name, details) {
  const at = details.at;
  return {
    kind: kind,
    name: sanitizeName(name) || "unnamed",
    params: sanitizeParams(details.params),
    empId: details.empId || "unknown",
    role: details.role || "employee",
    time: new Date(at).toISOString(),
    at: at,
  };
}

/**
 * يضيف وسم البطء إلى المعلمات بحسب زمن المرحلة.
 * @param {Object} params - المعلمات المنظّفة
 * @param {number} durationMs - زمن المرحلة بالمللي ثانية
 * @returns {Object} نسخة جديدة موسومة
 */
function withSlowFlag(params, durationMs) {
  const flagged = Object.assign({}, params);
  flagged.slow = (Number(durationMs) > MONITOR_LIMITS.SLOW_PHASE_MS) ? "1" : "0";
  return flagged;
}

/**
 * يبني خريطة الترحيل الجماعي: مفتاح فريد لكل سجل.
 * @param {Array} batch - الدفعة
 * @returns {Object} خريطة المفاتيح إلى السجلات
 */
function buildFanOut(batch) {
  const payload = {};
  for (let i = 0; i < batch.length; i++) {
    payload[`${MONITOR_LIMITS.BATCH_KEY_PREFIX + batch[i].at.toString(36)}_${i.toString(36)}`] = batch[i];
  }
  return payload;
}

// ════════════════════════════════════════════════
// 4. حساب الأرقام
// ════════════════════════════════════════════════

/**
 * يقصّ الطابور إلى سقفه بحذف الأقدم.
 * @param {Array} entries - السجلات
 * @returns {Array} السجلات ضمن السقف
 */
function capQueue(entries) {
  const overflow = entries.length - MONITOR_LIMITS.MAX_QUEUE_ENTRIES;
  if (overflow <= 0) return entries;
  return entries.slice(overflow);
}

/**
 * يُرجع السجلات التي لم ينتهِ عمرها.
 * @param {Array} entries - السجلات
 * @param {number} maxAgeDays - أقصى عمر باليوم
 * @param {number} nowMs - اللحظة المرجعية
 * @returns {Array} السجلات الباقية
 */
function dropExpired(entries, maxAgeDays, nowMs) {
  const cutoff = nowMs - (maxAgeDays * MONITOR_LIMITS.MS_PER_DAY);
  return entries.filter((entry) => entry && typeof entry.at === "number" && entry.at >= cutoff);
}

/**
 * يعدّ سجلات نوع معيّن.
 * @param {Array} entries - السجلات
 * @param {string} kind - النوع المطلوب
 * @returns {number} العدد
 */
function countKind(entries, kind) {
  return entries.filter((entry) => entry && entry.kind === kind).length;
}

/**
 * يحسب معدّل الجلسات الخالية من الإخفاق نسبةً مئوية.
 * مكافئ محلي لمؤشر CFSR في دراسة الجدوى، محسوب من عدّاداتك أنت.
 * @param {number} sessions - إجمالي الجلسات
 * @param {number} failedSessions - الجلسات التي سُجّل فيها إخفاق
 * @returns {number} النسبة المئوية
 */
function failureFreeRate(sessions, failedSessions) {
  if (!sessions || sessions <= 0) return MONITOR_LIMITS.PERCENT_FACTOR;
  const healthy = sessions - failedSessions;
  return Math.round((healthy / sessions) * MONITOR_LIMITS.PERCENT_FACTOR);
}

/**
 * يبني الملخّص الإحصائي من الحالة والطابور.
 * @param {Object} state - حالة العدّادات
 * @param {Array} entries - سجلات الطابور
 * @returns {Object} الملخّص
 */
function buildSummary(state, entries) {
  return {
    sessions: state.sessions || 0,
    failedSessions: state.failedSessions || 0,
    failureFreeSessionRate: failureFreeRate(state.sessions, state.failedSessions || 0),
    pendingEvents: entries.length,
    uiFailures: state.totalUiFailures || 0,
    syncFailures: state.totalSyncFailures || 0,
    fileFailures: state.totalFileFailures || 0,
    events: state.totalEvents || 0,
    lastFlushAt: state.lastFlushAt || "",
    currentSession: state.sessions || 0,
  };
}

// ════════════════════════════════════════════════
// 5. نقطة الدخول
// ════════════════════════════════════════════════
class AppCoordinator {
  static async boot() {
    // نموذج خالص — لا إجراء إقلاع
  }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((e) => console.error(e)); } catch (e) { console.error(e); }

module.exports = Object.freeze({
  MONITOR_LIMITS,
  EVENT_KIND,
  truncate,
  sanitizeName,
  sanitizeParams,
  safeId,
  buildEntry,
  withSlowFlag,
  buildFanOut,
  capQueue,
  dropExpired,
  countKind,
  failureFreeRate,
  buildSummary,
});
