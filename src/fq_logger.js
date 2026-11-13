// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: bug;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_logger.js

// ═══ وحدة تسجيل الأخطاء — fq_logger.js ═══
// تكتب الأخطاء في ملف محلي وتعرض آخر الأخطاء عند الطلب

const LOG_FILE = "fq_error_log.json";
const MAX_ENTRIES = 100;

// مراقب اختياري لأخطاء النظام. يبقى داخل الوحدة حتى يظل غلاف exports قابلاً للتجميد.
let _errorObserver = null;
let _localErrorObserver = null;

/**
 * يضبط مراقبًا اختياريًا يُستدعى بعد حفظ الخطأ محليًا.
 * @param {Function|null} observer
 * @returns {boolean}
 */
function setErrorObserver(observer) {
  if (observer !== null && typeof observer !== "function") return false;
  _errorObserver = observer;
  return true;
}

/** يربط ملتقطًا محليًا مستقلًا عن طابور الشبكة منذ دخول السكربت. @param {Function|null} observer */
function setLocalErrorObserver(observer) {
  if (observer !== null && typeof observer !== "function") return false;
  _localErrorObserver = observer;
  return true;
}

/**
 * يُرجع مسار ملف سجل الأخطاء.
 * @returns {string}
 */
function getLogPath() {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), LOG_FILE);
}

// قراءة سجل الأخطاء
/**
 * يقرأ سجل الأخطاء المحفوظ.
 * @returns {Array}
 */
function readLog() {
  const fm = FileManager.local();
  const path = getLogPath();
  if (!fm.fileExists(path)) return [];
  try {
    const data = JSON.parse(fm.readString(path));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("[fq_logger] Log parse failed.");
    return [];
  }
}

// كتابة خطأ في السجل
/**
 * يُسجّل حدثاً في السجل.
 * @param {string} source - المصدر
 * * @param {string} message - الرسالة
 * * @param {string} details - التفاصيل
 * @returns {void}
 */
function log(source, message, details) {
  const entry = {
    time: new Date().toISOString(),
    source: source || "unknown",
    message: message || "",
    details: details || ""
  };
  const logs = readLog();
  logs.unshift(entry);
  // الاحتفاظ بآخر 100 خطأ فقط
  if (logs.length > MAX_ENTRIES) {
    logs.splice(MAX_ENTRIES);
  }
  const fm = FileManager.local();
  fm.writeString(getLogPath(), JSON.stringify(logs));
}

// تسجيل خطأ من كائن Error
/**
 * يستخرج نصّ الخطأ وتفصيله من كائن Error أو من أي قيمة أخرى.
 * @param {*} error - الخطأ أو أي قيمة
 * @returns {{message: string, details: string}}
 */
function _errorFields(error) {
  if (error && typeof error === "object") {
    return { message: error.message || String(error), details: error.stack || "" };
  }
  return { message: String(error), details: "" };
}

function _notifyOneErrorObserver(observer, source, error) {
  if (typeof observer !== "function") return;
  try { observer(source, error, typeof _localErrorObserver === "function"); }
  catch (observerError) {
    const message = (observerError && observerError.message) ? observerError.message : String(observerError);
    console.warn(`[fq_logger] Error observer failed: ${message}`);
  }
}

function _notifyErrorObserver(source, error) {
  _notifyOneErrorObserver(_localErrorObserver, source, error);
  _notifyOneErrorObserver(_errorObserver, source, error);
}

/**
 * يُسجّل خطأ من كائن Error.
 * (نُقلت هذه الوثيقة إلى صاحبها في ٢٠٢٦-٠٩-٢٥: كانت فوق دالةٍ أُدخِلت
 *  بينها وبين الدالة التي تصفها. تقرير التدقيق، الفئة أ.)
 * @param {string} source - المصدر
 * @param {*} error - الخطأ
 * @returns {void}
 */
function logError(source, error) {
  const fields = _errorFields(error);
  try { log(source, fields.message, fields.details); }
  finally { _notifyErrorObserver(source, error); }
}

// عرض آخر الأخطاء
/**
 * يُرجع آخر N خطأ.
 * @param {number} count - العدد
 * @returns {Array}
 */
function getRecentErrors(count) {
  const logs = readLog();
  return logs.slice(0, count || 10);
}

// مسح السجل
/**
 * يمسح سجل الأخطاء.
 * @returns {void}
 */
function clearLog() {
  const fm = FileManager.local();
  const path = getLogPath();
  if (fm.fileExists(path)) {
    fm.writeString(path, "[]");
  }
}

module.exports = Object.freeze({ log, logError, getRecentErrors, clearLog, readLog, setErrorObserver, setLocalErrorObserver });
