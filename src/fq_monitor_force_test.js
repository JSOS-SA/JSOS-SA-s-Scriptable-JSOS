// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: bolt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_force_test.js

/**
 * @module fq_monitor_force_test
 * @description سكربت تشخيص لمرّة واحدة — يجبر المسارات الثلاثة للرصد ويتحقق من الكتابة والترحيل.
 *
 * لا يعدّل أي ملف إنتاج. يستورد وحدات الرصد كما هي، يكتب ثلاثة سجلات إجبارية،
 * يستدعي endSession، ثم يعرض تقريرًا وينسخه إلى الحافظة.
 *
 * احذفه فور انتهاء التحقق. أداة تشخيص لا سلوك إنتاج.
 */

const OK = "✅";
const NO = "❌";
const WARN = "⚠️";

/**
 * يبني مسار ملف داخل مجلد المستندات المحلي.
 * @param {string} fileName
 * @returns {string}
 */
function _localPath(fileName) {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), fileName);
}

/**
 * يفحص وجود ملف محلي ويعيد حجمه بالبايت أو -1.
 * @param {string} fileName
 * @returns {{exists: boolean, size: number}}
 */
function _fileInfo(fileName) {
  const fm = FileManager.local();
  const p = _localPath(fileName);
  if (!fm.fileExists(p)) return { exists: false, size: -1 };
  try {
    return { exists: true, size: fm.fileSize(p) };
  } catch (e) {
    console.error(`[force_test] size ${fileName}: ${e.message}`);
    return { exists: true, size: -1 };
  }
}

/**
 * يقرأ ملخص الحالة الحالية بأمان.
 * @param {Object} monitor
 * @returns {Object}
 */
function _safeSummary(monitor) {
  try {
    return monitor.getSystemStatusSummary() || {};
  } catch (e) {
    console.error(`[force_test] summary: ${e.message}`);
    return {};
  }
}

/**
 * هل وحدة الرصد تُصدِّر كل الدوال المطلوبة؟
 * (الوثيقة «ينفّذ الإجبار والتحقق الكامل» كانت هنا وهي لـ `_runForceTest`،
 * فصار `tsc` يحسب هذه الدالة تُرجع `Promise<string>` فأبلغ ESLint عن «وعدٍ في
 * شرطٍ منطقيّ». تقرير التدقيق ٢٠٢٦-٠٩-٢٥، الفئة أ.)
 * @param {Object} monitor - وحدة الرصد المستوردة
 * @returns {boolean}
 */
function _monitorApiComplete(monitor) {
  return typeof monitor.startSession === "function" &&
    typeof monitor.logEvent === "function" &&
    typeof monitor.recordUiFailure === "function" &&
    typeof monitor.recordSyncFailure === "function" &&
    typeof monitor.endSession === "function";
}

function _importMonitorForTest(lines) {
  try {
    const monitor = importModule("fq_monitor");
    lines.push(`${OK} استيراد fq_monitor`);
    if (!_monitorApiComplete(monitor)) {
      lines.push(`${NO} دوال الرصد غير مكتملة في التصدير`);
      return null;
    }
    lines.push(`${OK} كل الدوال المطلوبة موجودة`);
    return monitor;
  } catch (error) {
    lines.push(`${NO} فشل استيراد fq_monitor: ${error.message}`);
    return null;
  }
}

function _appendFileStatus(lines, label, info, missingMark, missingText) {
  lines.push(`${info.exists ? OK : missingMark} ${label}: ${info.exists ? `${info.size} بايت` : missingText}`);
}

function _appendCoreSummary(lines, summary) {
  lines.push("جلسات: " + (summary.sessions || 0) +
    " | فاشلة: " + (summary.failedSessions || 0) +
    " | معلّقة: " + (summary.pendingEvents || 0));
}

function _appendBeforeState(lines, monitor) {
  const queue = _fileInfo("fq_monitor_queue.json");
  const state = _fileInfo("fq_monitor_state.json");
  lines.push(""); lines.push("── قبل الإجبار ──");
  _appendFileStatus(lines, "queue", queue, WARN, "غير موجود");
  _appendFileStatus(lines, "state", state, NO, "غير موجود");
  const summary = _safeSummary(monitor);
  lines.push("جلسات قبل: " + (summary.sessions || 0) +
    " | فاشلة: " + (summary.failedSessions || 0) +
    " | معلّقة: " + (summary.pendingEvents || 0));
}

function _startForceSession(lines, monitor) {
  try {
    const sessionNum = monitor.startSession();
    lines.push(""); lines.push(`${OK} startSession → رقم الجلسة ${sessionNum}`);
    return true;
  } catch (error) {
    lines.push(`${NO} startSession فشل: ${error.message}`);
    return false;
  }
}

function _forceCall(lines, label, successText, falseText, invoke) {
  try {
    const ok = invoke();
    lines.push(`${ok ? OK : WARN} ${label} → ${ok ? successText : falseText}`);
  } catch (error) {
    lines.push(`${NO} ${label} رمى: ${error.message}`);
  }
}

function _forceMonitorRecords(lines, monitor) {
  lines.push(""); lines.push("── إجبار التسجيل ──");
  _forceCall(lines, "logEvent", "كُتب", "رُفض (sanitize)", () => monitor.logEvent("force_diag_event", { source: "force_test", note: "اختبار تشخيصي يدوي" }));
  _forceCall(lines, "recordUiFailure", "كُتب", "فشل الكتابة", () => monitor.recordUiFailure("force_diag_ui", { reason: "manual_force_test", durationMs: 9999 }));
  _forceCall(lines, "recordSyncFailure", "كُتب", "فشل الكتابة", () => monitor.recordSyncFailure("force_diag_sync", { path: "/force_test", stage: "diag", code: "FORCE" }));
}

function _appendMidState(lines, monitor) {
  const queue = _fileInfo("fq_monitor_queue.json");
  const state = _fileInfo("fq_monitor_state.json");
  const summary = _safeSummary(monitor);
  lines.push(""); lines.push("── بعد الكتابة (قبل الترحيل) ──");
  _appendFileStatus(lines, "queue", queue, NO, "ما زال غير موجود");
  _appendFileStatus(lines, "state", state, NO, "غير موجود");
  lines.push("جلسات: " + (summary.sessions || 0) +
    " | فاشلة: " + (summary.failedSessions || 0) +
    " | معلّقة: " + (summary.pendingEvents || 0) +
    " | uiFailures: " + (summary.uiFailures || 0) +
    " | syncFailures: " + (summary.syncFailures || 0));
}

async function _flushForceSession(lines, monitor) {
  lines.push(""); lines.push("── الترحيل ──");
  try {
    const result = await monitor.endSession();
    lines.push(`${result.ok ? OK : WARN} endSession → sent=${result.sent} ok=${result.ok} purged=${result.purged}`);
  } catch (error) {
    lines.push(`${NO} endSession رمى: ${error.message}`);
  }
}

function _appendAfterState(lines, monitor) {
  const queue = _fileInfo("fq_monitor_queue.json");
  const summary = _safeSummary(monitor);
  lines.push(""); lines.push("── بعد الترحيل ──");
  lines.push((queue.exists ? WARN : OK) + " queue: " +
    (queue.exists ? `${queue.size} بايت (بقي شيء)` : "اختفى أو فارغ — طبيعي بعد ترحيل ناجح"));
  _appendCoreSummary(lines, summary);
}

function _appendForceInstructions(lines) {
  lines.push(""); lines.push("═══ ماذا تفعل الآن ═══");
  lines.push("1. صدّر القاعدة من فايربيس خلال دقيقة.");
  lines.push("2. ابحث تحت /audit_log/DEV001 عن مفاتيح تبدأ بـ mon_");
  lines.push("3. يجب أن ترى kind = event أو ui_failure أو sync_failure");
  lines.push("4. احذف هذا السكربت (fq_monitor_force_test) فور التحقق.");
}

/**
 * ينفّذ الإجبار والتحقق الكامل.
 * @returns {Promise<string>} تقرير الإجبار سطرًا سطرًا
 */
async function _runForceTest() {
  const lines = ["═══ إجبار مسارات الرصد ═══", `الوقت: ${new Date().toISOString()}`, ""];
  const monitor = _importMonitorForTest(lines);
  if (!monitor) return lines.join("\n");
  _appendBeforeState(lines, monitor);
  if (!_startForceSession(lines, monitor)) return lines.join("\n");
  _forceMonitorRecords(lines, monitor);
  _appendMidState(lines, monitor);
  await _flushForceSession(lines, monitor);
  _appendAfterState(lines, monitor);
  _appendForceInstructions(lines);
  return lines.join("\n");
}

/**
 * يعرض التقرير وينسخه.
 * @param {string} report
 * @returns {Promise<void>}
 */
async function _present(report) {
  Pasteboard.copyString(report);
  const a = new Alert();
  a.title = "إجبار الرصد — نتيجة";
  a.message = `${report}\n\n(نُسخ التقرير إلى الحافظة)`;
  a.addAction("حسنًا");
  await a.present();
}

class AppCoordinator {
  static async boot() {
    const report = await _runForceTest();
    await _present(report);
  }
}

try {
  await AppCoordinator.boot();
} catch (e) {
  console.error(`[force_test] boot: ${e.message}`);
  const a = new Alert();
  a.title = "تعذّر إجبار الرصد";
  a.message = e.message;
  a.addAction("حسنًا");
  await a.present();
} finally {
  // في finally لا بعد catch: لو رمى التنبيه نفسه لبقي السكربت بلا إعلام انتهاء
  // (CLAUDE.md القسم ١، القاعدة المعتمدة، الفقرة ٤).
  Script.complete();
}
