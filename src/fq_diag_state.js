// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: stethoscope;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_diag_state.js

/**
 * @module fq_diag_state
 * @description سكربت تشخيص لمرّة واحدة — يقول أي الملفات مركَّب فعلًا وأيها قديم.
 *
 * لا يعدّل شيئًا ولا يكتب في القاعدة. يقرأ مجلد سكريبتات iCloud نصًّا،
 * ويستورد الوحدات ويسأل عن سلوكها، ثم يعرض تقريرًا وينسخه إلى الحافظة.
 *
 * سبب وجوده: «التشخيص قبل الإصلاح» — تغيير الملفات بلا معرفة الحالة الفعلية
 * تخمين، والدستور يمنع التخمين.
 *
 * احذفه بعد حلّ المشكلة، فهو أداة تشخيص لا سلوك إنتاج.
 */

const OK = "✅";
const NO = "❌";
const OLD = "⚠️";

// كل ملف وعلامته النصّية التي لا توجد إلا في النسخة الجديدة
const EXPECTED_FILES = [
  { file: "fq_auth.js", marker: "SOLE_DEVELOPER_UID", label: "بوابة الدخول" },
  { file: "fq_main.js", marker: "monitorSession.startMonitoringAfterLogin", label: "الملف الرئيسي" },
  { file: "fq_permissions.js", marker: "أُعيدا إلى المشرف فأعلى", label: "الصلاحيات" },
  { file: "fq_auth_additions.js", marker: "نقل الجلسة موقوف", label: "إضافات المصادقة" },
  { file: "fq_monitor_session.js", marker: "startMonitoringAfterLogin", label: "تشغيل الرصد" },
  { file: "fq_monitor_queue.js", marker: "flushMonitorBatch", label: "طابور الرصد" },
  { file: "fq_monitor_net.js", marker: "monitorRequest", label: "شبكة الرصد" },
];

/**
 * يقرأ ملفًا من مجلد سكريبتات iCloud بعد ضمان تنزيله.
 * @param {string} fileName - اسم الملف
 * @returns {Promise<string|null>} المحتوى أو null إذا لم يوجد
 */
async function _readScript(fileName) {
  const fm = FileManager.iCloud();
  const filePath = fm.joinPath(fm.documentsDirectory(), fileName);
  if (!fm.fileExists(filePath)) return null;
  try {
    await fm.downloadFileFromiCloud(filePath);
    return fm.readString(filePath);
  } catch (e) {
    console.error(`[fq_diag] read ${fileName}: ${e.message}`);
    throw e;
  }
}

/**
 * يفحص ملفًا واحدًا: موجود؟ وهل هو النسخة الجديدة؟
 * @param {{file: string, marker: string, label: string}} spec - وصف الملف
 * @returns {Promise<string>} سطر التقرير
 */
async function _checkFile(spec) {
  let content;
  try { content = await _readScript(spec.file); }
  catch (error) { return `${OLD} ${spec.file} — تعذرت القراءة؛ لا حكم على النسخة`; }
  if (content === null) return `${NO} ${spec.file} — غير موجود في المجلد المفحوص`;
  if (content.indexOf(spec.marker) === -1) {
    return `${OLD} ${spec.file} — موجود لكن علامة الفحص غير متاحة؛ لا يثبت أنه قديم`;
  }
  return `${OK} ${spec.file} — موجود وتتوفر علامة متوقعة؛ لا يثبت تطابق البصمة`;
}

/**
 * يفحص كل الملفات المتوقّعة.
 * @returns {Promise<Array<string>>} أسطر التقرير
 */
async function _checkAllFiles() {
  const lines = [];
  for (let i = 0; i < EXPECTED_FILES.length; i++) {
    lines.push(await _checkFile(EXPECTED_FILES[i]));
  }
  return lines;
}

/**
 * يستورد وحدة بأمان دون إسقاط السكربت إن كانت غائبة.
 * @param {string} name - اسم الوحدة
 * @returns {Object|null} الوحدة أو null
 */
function _safeImport(name) {
  try {
    return importModule(name);
  } catch (e) {
    console.error(`[fq_diag] import ${name}: ${e.message}`);
    return null;
  }
}

/**
 * يفحص سلوك وحدة الصلاحيات فعليًا لا نصًّا.
 * @returns {Array<string>} أسطر التقرير
 */
function _checkPermissions() {
  const perms = _safeImport("fq_permissions");
  if (!perms || typeof perms.can !== "function") {
    return [`${NO} fq_permissions — لم تُستورد`];
  }
  const closed = perms.can("employee", "delete_flight") === false;
  return [
    `${closed ? OK : OLD} حذف الرحلة أمام الموظف: ${closed ? "مغلق" : "مفتوح"}`,
    (Object.isFrozen(perms.MATRIX) ? OK : OLD) + " جدول الصلاحيات مجمَّد: " +
      (Object.isFrozen(perms.MATRIX) ? "نعم" : "لا"),
  ];
}

/**
 * يفحص أن بوابة الدخول ووحدة الرصد مُصدَّرتان.
 * @returns {Array<string>} أسطر التقرير
 */
function _checkModules() {
  const auth = _safeImport("fq_auth");
  const monitor = _safeImport("fq_monitor_dashboard");
  return [
    `${auth && typeof auth.authGate === "function" ? OK : NO} fq_auth.authGate مُصدَّرة`,
    (monitor && typeof monitor.buildMonitorBootData === "function" ? OK : NO) +
      " fq_monitor.buildMonitorBootData مُصدَّرة",
  ];
}

/**
 * يفحص ملفات الحالة المحلية التي يُنشئها النظام وقت التشغيل.
 * @returns {Array<string>} أسطر التقرير
 */
function _checkLocalState() {
  const fm = FileManager.local();
  const dir = fm.documentsDirectory();
  const names = ["fq_auth_local.json", "fq_device_id.json", "fq_monitor_queue.json", "fq_monitor_state.json"];
  const lines = [];
  for (let i = 0; i < names.length; i++) {
    const exists = fm.fileExists(fm.joinPath(dir, names[i]));
    lines.push(`${exists ? OK : "▫️"} ${names[i]}: ${exists ? "موجود" : "غير موجود بعد"}`);
  }
  return lines;
}

/**
 * يبني نصّ التقرير الكامل.
 * @returns {Promise<string>} التقرير
 */
async function _buildReport() {
  // الفحوص بترتيب أقسامها: الملفات، ثم الوحدات، ثم الصلاحيات، ثم الحالة المحلية.
  const files = (await _checkAllFiles()).join("\n");
  return [
    "═══ ملفات السكربتات ═══", files,
    "\n═══ سلوك الوحدات ═══", _checkModules().join("\n"), _checkPermissions().join("\n"),
    "\n═══ الحالة المحلية ═══", _checkLocalState().join("\n"),
    "\n═══ السياق ═══", `runsInApp: ${String(config.runsInApp)}`,
  ].join("\n");
}

/**
 * يعرض التقرير وينسخه إلى الحافظة.
 * @param {string} report - نصّ التقرير
 * @returns {Promise<void>}
 */
async function _presentReport(report) {
  Pasteboard.copyString(report);
  const a = new Alert();
  a.title = "تشخيص حالة التركيب";
  a.message = `${report}\n\n(نُسخ التقرير إلى الحافظة)`;
  a.addAction("حسنًا");
  await a.present();
}

class AppCoordinator {
  static async boot() {
    await _presentReport(await _buildReport());
  }
}

try {
  await AppCoordinator.boot();
} catch (e) {
  console.error(`[fq_diag] boot: ${e.message}`);
  const a = new Alert();
  a.title = "تعذّر التشخيص";
  a.message = e.message;
  a.addAction("حسنًا");
  await a.present();
} finally {
  // في finally لا بعد catch: لو رمى التنبيه نفسه لبقي السكربت بلا إعلام انتهاء
  // (CLAUDE.md القسم ١، القاعدة المعتمدة، الفقرة ٤).
  Script.complete();
}
