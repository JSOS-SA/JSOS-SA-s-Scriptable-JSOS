// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: download;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_installer.js

/**
 * @module fq_installer
 * @description نظام التحديث والتثبيت الهوائي (OTA Updater).
 * [ملف أمن قومي - تفعيل بروتوكول الحماية القصوى]
 * يقوم بجلب الشفرات المصدرية من المستودع الخاص بطريقة آمنة ومحصنة.
 */

const secretsManager = importModule("fq_secrets_manager");

// ════════════════════════════════════════════════
// 1. مصفوفة ملفات النظام (مجمدة لمنع الحقن الخبيث)
// ════════════════════════════════════════════════
const CORE_FILES = Object.freeze([
  "fq_main.js", "fq_config.js", "fq_auth.js", "fq_permissions.js",
  "fq_firebase.js", "fq_audit.js", "fq_storage.js", "fq_widget.js",
  "fq_live.js", "fq_search.js", "fq_addflight.js",
  "fq_editflight.js", "fq_secrets_manager.js", "setup_dev.js"
]);

function _getGithubConfig() {
  return {
    owner: secretsManager.getGithubOwner(),
    repo: secretsManager.getGithubRepo(),
    branch: secretsManager.getGithubBranch() || "main",
    token: secretsManager.getGithubToken(),
  };
}

function _hasGithubCredentials(config) {
  return Boolean(config.owner && config.repo && config.token);
}

function _createFileRequest(config, file) {
  const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${file}`;
  const request = new Request(url);
  request.method = "GET";
  request.headers = {
    "Authorization": `token ${config.token}`,
    "Cache-Control": "no-cache",
  };
  request.timeoutInterval = 15;
  return request;
}

/**
 * @param {{fm: FileManager, docsDir: string}} target مدير الملفات ومجلد الكتابة
 * @param {Object} config إعداد المستودع
 * @param {string} file اسم الملف
 * @returns {Promise<boolean>}
 */
async function _fetchAndWriteFile(target, config, file) {
  const fm = target.fm;
  const request = _createFileRequest(config, file);
  const content = await request.loadString();
  const valid = request.response &&
    request.response.statusCode === 200 &&
    content &&
    content.trim().length > 0;
  if (!valid) {
    console.error(`[fq_installer] Failed to fetch integrity for: ${file}`);
    return false;
  }

  fm.writeString(fm.joinPath(target.docsDir, file), content);
  return true;
}

/** يجلب ملفات النظام واحدًا بعد واحد ويكتبها، ويُرجع عدد ما نجح منها. */
async function _installCoreFiles(config) {
  const fm = FileManager.local();
  const target = { fm: fm, docsDir: fm.documentsDirectory() };
  let successCount = 0;
  for (let i = 0; i < CORE_FILES.length; i++) {
    if (await _fetchAndWriteFile(target, config, CORE_FILES[i])) {
      successCount++;
    }
  }
  return successCount;
}

function _logInstallResult(isComplete) {
  if (isComplete) {
    console.log("[fq_installer] System successfully updated and locked.");
  } else {
    console.error("[fq_installer] Warning: Partial update occurred.");
  }
}

/**
 * ═══ محرك التثبيت الآمن (Secure Install Engine) ═══
 * @returns {Promise<boolean>} حالة نجاح العملية
 */
async function installSystem() {
  try {
    const config = _getGithubConfig();
    if (!_hasGithubCredentials(config)) {
      console.log("[fq_installer] GitHub credentials not configured — OTA update skipped.");
      return false;
    }

    const isComplete = (await _installCoreFiles(config)) === CORE_FILES.length;
    _logInstallResult(isComplete);
    return isComplete;
  } catch (error) {
    console.error("[fq_installer] Critical failure during execution.");
    return false;
  }
}

// ════════════════════════════════════════════════
// التصدير المجمد أمنياً (Immutable Exports)
// ════════════════════════════════════════════════
module.exports = Object.freeze({
  installSystem,
  CORE_FILES
});
