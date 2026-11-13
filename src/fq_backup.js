// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: save;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_backup.js

/**
 * @module fq_backup
 * @description نظام النسخ الاحتياطي وتصدير البيانات.
 * [ملف شديد الحساسية - تفعيل بروتوكول منع تسريب البيانات Data Exfiltration Defense]
 * محمي بنظام الصلاحيات والتدقيق الأمني الصارم.
 */

const cfg = importModule("fq_config");
const permissions = importModule("fq_permissions");
const audit = importModule("fq_audit");

const BACKUP_TARGET_FILES = Object.freeze([
  "fq_data.json",
  "fq_auth_local.json",
  "fq_live_cache.json",
]);

async function _authorizeBackup() {
  const currentRole = cfg.getCurrentUser().role;
  if (permissions.can(currentRole, permissions.ACTIONS.BACKUP)) return true;

  console.error("[fq_backup] Security Halt: Unauthorized backup attempt blocked.");
  await audit.logAction(
    "security_violation",
    "محاولة غير مصرحة لتصدير ونسخ بيانات النظام"
  );
  return false;
}

function _collectBackupPayload(fm) {
  const docsDir = fm.documentsDirectory();
  const payload = {
    timestamp: new Date().toISOString(),
    system_version: "FQ-2026",
    data: {},
  };

  for (let i = 0; i < BACKUP_TARGET_FILES.length; i++) {
    const file = BACKUP_TARGET_FILES[i];
    const path = fm.joinPath(docsDir, file);
    if (fm.fileExists(path)) payload.data[file] = fm.readString(path);
  }
  return payload;
}

function _writeTemporaryBackup(fm, payload) {
  const backupFileName = `FQ_Backup_${Date.now()}.json`;
  const tempPath = fm.joinPath(
    FileManager.local().temporaryDirectory(),
    backupFileName
  );
  fm.writeString(tempPath, JSON.stringify(payload));
  return { backupFileName, tempPath };
}

async function _shareAndAudit(output) {
  await ShareSheet.present([output.tempPath]);
  await audit.logAction(
    "backup_system",
    "تم تصدير نسخة احتياطية من بيانات النظام",
    output.backupFileName
  );
}

/**
 * ═══ محرك التصدير الآمن (Secure Export Engine) ═══
 * @returns {Promise<boolean>}
 */
async function executeBackup() {
  try {
    if (!await _authorizeBackup()) return false;

    const fm = FileManager.local();
    const output = _writeTemporaryBackup(fm, _collectBackupPayload(fm));
    await _shareAndAudit(output);
    console.log("[fq_backup] Backup completed and audited securely.");
    return true;
  } catch (error) {
    console.error(`[fq_backup] Critical failure during backup process: ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// التصدير المجمد أمنياً (Immutable Exports)
// ════════════════════════════════════════════════
module.exports = Object.freeze({
  executeBackup
});
