// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: file-export;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_dashboard.js

/**
 * تجهيز لوحة الرصد وتصدير تقريرها.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_export_report_picker.js
 *   fq_monitor_export_report.js
 *   fq_monitor_build_boot_data.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorBase = importModule("fq_monitor_base");
const cfg = importModule("fq_config");
const perms = importModule("fq_permissions");
const monitorAuth = importModule("fq_monitor_auth");
const monitorQueue = importModule("fq_monitor_queue");
const monitorNet = importModule("fq_monitor_net");
const monitorJourney = importModule("fq_monitor_journey");

// ════════════════════════════════════════════════
// كان ملف fq_monitor_export_report_picker.js
// ════════════════════════════════════════════════

/**
 * يفتح منتقي الملفات ليختار المستخدم مكان حفظ تقرير الرصد.
 * @param {string} serialized
 * @param {string} name
 * @returns {Promise<Object>}
 */
async function exportMonitorReportWithPicker(serialized, name) {
  try {
    const paths = await DocumentPicker.exportString(String(serialized || ""), String(name || "monitor.json"));
    return { ok: true, name: String(name || "monitor.json"), paths: paths || [] };
  } catch (error) {
    return { ok: false, name: String(name || "monitor.json"), error: error.message || "EXPORT_CANCELLED" };
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_export_report.js
// ════════════════════════════════════════════════

/** حقل سرّي في التقرير يمنع تصديره كلّه. */
const SECRET_FIELD_PATTERN = /"(?:idToken|refreshToken|monitorToken|accessToken|password|authorization|apiKey|secret|cookie|id_token|refresh_token)"\s*:/i;


/** مفاتيح لا يحملها حدث محلي: قيم الحقول وأجسام البيانات. */
const FORBIDDEN_EVENT_KEYS = ["value", "text", "body", "arguments", "innerHTML", "outerHTML", "inputValue"];

/** عقد التقرير المحلي وسياسة خصوصيته: الإصدار، ومصفوفة الأحداث، والتغطية، ومنع الرفع وتسجيل النصوص. */
function _localContractValid(report, local) {
  return ["1.3.0", "1.4.0"].indexOf(report.reportSchemaVersion) >= 0 && local.localSchemaVersion === "1.0.0" &&
    Array.isArray(local.events) && !!local.coverage && local.uploadEnabled === false && local.textValuesRecorded === false;
}

/** سبب رفض حدث واحد، أو نص فارغ إن كان صالحًا. `ids` المعرفات التي سبقته. */
function _eventRowReason(row, ids) {
  if (!row || typeof row.eventId !== "string" || ids[row.eventId] || typeof row.occurredAt !== "number" || typeof row.savedAt !== "number") return "حدث بلا معرف أو وقت موثوق أو بمعرف مكرر";
  if (FORBIDDEN_EVENT_KEYS.some((key) => Object.prototype.hasOwnProperty.call(row, key))) return "التقرير يحتوي قيمة حقل أو جسم بيانات غير مسموح";
  return "";
}

/** سبب رفض أول حدث غير صالح بالترتيب، أو نص فارغ. */
function _eventsReason(events) {
  const ids = {};
  for (let index = 0; index < events.length; index++) {
    const reason = _eventRowReason(events[index], ids);
    if (reason) return reason;
    ids[events[index].eventId] = true;
  }
  return "";
}

/** يتحقق من عقد التقرير الجديد قبل فتح منتقي الحفظ؛ النسخة القديمة تبقى مقبولة. */
function validateMonitorReport(report) {
  if (!report || typeof report !== "object") return { ok: false, reason: "التقرير ليس سجلًا منظمًا" };
  if (!report.localDiagnostics) return { ok: true, legacy: true };
  const local = report.localDiagnostics;
  if (!_localContractValid(report, local)) return { ok: false, reason: "بنية التقرير المحلي أو سياسة الخصوصية غير صالحة" };
  const reason = _eventsReason(local.events);
  if (reason) return { ok: false, reason: reason };
  return { ok: true, legacy: false };
}

/**
 * اسم ملف التقرير: التاريخ والوقت والإصدار.
 * @returns {string}
 */
function _reportFileName() {
  const release = monitorBase.getReleaseVersion().systemVersion.replace(/[^0-9A-Za-z._-]/g, "-");
  const stamp = new Date().toISOString().replace(/:/g, "-").replace(/\.\d{3}Z$/, "Z");
  return `monitor-status_${stamp}_AST_v${release}.json`;
}

/**
 * يحلّل التقرير ويتحقق منه ويُسلسله للحفظ. المرفوض أو الحامل لحقل سري ← نص فارغ.
 * وخطأ التحليل يُرمى إلى المستدعي.
 * @param {string} rawJson
 * @returns {string}
 */
function _validatedJson(rawJson) {
  const report = JSON.parse(String(rawJson));
  const validation = validateMonitorReport(report);
  if (!validation.ok) { console.error("[fq_monitor_export_report] " + validation.reason); return ""; }
  const serialized = JSON.stringify(report, null, 2);
  return SECRET_FIELD_PATTERN.test(serialized) ? "" : serialized;
}

/**
 * يحفظ تقرير رصد JSON واحد باسم التاريخ والوقت والإصدار.
 * @param {string} rawJson
 * @returns {Promise<string>} اسم الملف أو نص فارغ
 */
async function exportMonitorReport(rawJson) {
  if (!rawJson || String(rawJson).length < 3) return "";
  try {
    const serialized = _validatedJson(rawJson);
    if (!serialized) return "";
    const exported = await exportMonitorReportWithPicker(serialized, _reportFileName());
    return exported.ok ? exported.name : "";
  } catch (error) {
    console.error(`[fq_monitor_export_report] ${error.message}`);
    return "";
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_build_boot_data.js
// ════════════════════════════════════════════════

/**
 * نقطة التفريغ الثالثة: تيوب الرصد يعرض الدفتر، فلا يُقرأ قبل أن يُكتب
 * المحتجَز، وإلا رأى المطوّر رحلةً ناقصة الخطوات.
 * @returns {Object} دفتر الرحلات بعد كتابة كل ما احتُجز.
 */
function _readFlushedJourneys() {
  monitorJourney.flushMonitorAuthCheckpoints();
  return monitorJourney.readMonitorAuthJourneys();
}

/** @returns {Promise<Object>} بيانات إقلاع تيوب الرصد بلا بيانات التيوبات الأخرى. */
async function buildMonitorBootData() {
  const user = cfg.getCurrentUser() || {};
  const session = await monitorAuth.getMonitorAuthSession(false);
  const settings = monitorBase.getMonitorRemoteConfig();
  return {
    empId: String(user.empId || ""),
    role: String(user.role || "employee"),
    // من جدول الصلاحيات لا من اسم الدور: المشرف مساوٍ للمطوّر — قرار المالك ٢٠٢٦-٠٩-٢٩.
    canMonitor: perms.can(String(user.role || "employee"), "view_monitor"),
    deviceId: monitorBase.getMonitorDeviceId(),
    databaseUrl: settings.databaseUrl,
    reportTimeZone: settings.reportTimeZone || "Asia/Riyadh",
    monitorToken: session ? session.idToken : "",
    monitorUid: session ? session.uid : "",
    heartbeatFreshMs: settings.heartbeatFreshMs,
    heartbeatLateMs: settings.heartbeatLateMs,
    release: monitorBase.getReleaseVersion(),
    retention: monitorBase.getMonitorRetentionPolicy(),
    localRows: monitorQueue.readMonitorHistory().slice(-100),
    localAuthJourneys: monitorJourney.summarizeMonitorAuthJourneys(_readFlushedJourneys()),
    queueDepth: monitorQueue.readMonitorQueue().length,
    queueStatus: monitorQueue.readMonitorQueueStatus(),
    networkStats: monitorNet.readMonitorNetworkStats(),
    generatedAt: Date.now(),
  };
}

/** يعيد هوية جهاز الرصد القائمة للسجل المحلي دون أسرار. */
function getLocalDeviceId() { return monitorBase.getMonitorDeviceId(); }

module.exports = Object.freeze({
  validateMonitorReport,
  getLocalDeviceId,
  exportMonitorReportWithPicker,
  exportMonitorReport,
  buildMonitorBootData,
});
