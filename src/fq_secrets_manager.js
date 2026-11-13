// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_secrets_manager.js

/**
 * @module fq_secrets_manager
 * @description مدير المفاتيح السريّة (Secrets Manager)
 * [ملف عالي الحساسية - HIGHLY SENSITIVE]
 * يعتمد حصرياً على واجهة Keychain للتخزين المشفر، ولا يكتب أي بيانات حساسة كملفات نصية.
 */

// ═══ أسماء المفاتيح في Keychain (ثوابت لا تُعدّل) ═══
const KEY_FIREBASE_URL = "fq_firebase_url";
const KEY_FIREBASE_API_KEY = "fq_firebase_api_key";
const KEY_GITHUB_OWNER = "fq_github_owner";
const KEY_GITHUB_REPO = "fq_github_repo";
const KEY_GITHUB_BRANCH = "fq_github_branch";
const KEY_GITHUB_TOKEN = "fq_github_token";
const KEY_DEV_SIGNATURE = "fq_dev_signature";

/**
 * ═══ حفظ جميع المفاتيح دفعة واحدة في الخزنة ═══
 * @param {Object} secrets كائن يحتوي على المفاتيح الجديدة
 */
// خريطة المفاتيح — بيانات ثابتة وقت التأليف
const _KEY_MAP = Object.freeze([
  ["FIREBASE_URL",     KEY_FIREBASE_URL],
  ["FIREBASE_API_KEY", KEY_FIREBASE_API_KEY],
  ["GITHUB_OWNER",     KEY_GITHUB_OWNER],
  ["GITHUB_REPO",      KEY_GITHUB_REPO],
  ["GITHUB_BRANCH",    KEY_GITHUB_BRANCH],
  ["GITHUB_TOKEN",     KEY_GITHUB_TOKEN],
  ["DEV_SIGNATURE",    KEY_DEV_SIGNATURE],
]);

/**
 * يحفظ جميع الأسرار في Keychain.
 * @param {Object} secrets - الأسرار
 * @returns {void}
 */
function saveAllSecrets(secrets) {
  if (!secrets || typeof secrets !== "object") return;
  try {
    for (const [srcKey, kcKey] of _KEY_MAP) {
      if (secrets[srcKey]) Keychain.set(kcKey, secrets[srcKey]);
    }
  } catch (error) {
    console.error(`[fq_secrets_manager] Critical Fault saving secrets: ${error.message}`);
  }
}

/**
 * ═══ قراءة مفتاح واحد بأمان (Fail-Safe) ═══
 * @param {string} key اسم المفتاح
 * @param {string} fallback القيمة الافتراضية عند الفشل
 * @returns {string}
 */
function _safeGet(key, fallback) {
  try {
    if (!Keychain.contains(key)) return fallback || "";
    return Keychain.get(key) || fallback || "";
  } catch (error) {
    // كتم الخطأ بوعي لمنع الانهيار، مع تسجيل خفي لا يكشف محتوى السر
    console.error(`[fq_secrets_manager] Error accessing keychain for key (${key}): ${error.message}`);
    return fallback || "";
  }
}

// ═══ واجهات قراءة المفاتيح الفردية ═══
/**
 * يُرجع رابط Firebase من Keychain.
 * @returns {string}
 */
function getFirebaseUrl() { return _safeGet(KEY_FIREBASE_URL, ""); }
/**
 * يُرجع مفتاح Firebase API من Keychain.
 * @returns {string}
 */
function getFirebaseApiKey() { return _safeGet(KEY_FIREBASE_API_KEY, ""); }
/**
 * يُرجع مالك مستودع GitHub من Keychain.
 * @returns {string}
 */
function getGithubOwner() { return _safeGet(KEY_GITHUB_OWNER, ""); }
/**
 * يُرجع اسم مستودع GitHub من Keychain.
 * @returns {string}
 */
function getGithubRepo() { return _safeGet(KEY_GITHUB_REPO, ""); }
/**
 * يُرجع فرع GitHub من Keychain.
 * @returns {string}
 */
function getGithubBranch() { return _safeGet(KEY_GITHUB_BRANCH, "main"); }
/**
 * يُرجع توكن GitHub من Keychain.
 * @returns {string}
 */
function getGithubToken() { return _safeGet(KEY_GITHUB_TOKEN, ""); }
/**
 * يُرجع توقيع المطوّر من Keychain.
 * @returns {string}
 */
function getDevSignature() { return _safeGet(KEY_DEV_SIGNATURE, ""); }

/**
 * ═══ التحقق من وجود تهيئة مسبقة ═══
 * @returns {boolean}
 */
function hasSecrets() {
  try {
    return Keychain.contains(KEY_FIREBASE_URL);
  } catch (error) {
    return false;
  }
}

/**
 * ═══ مسح جميع المفاتيح (يُستخدم بحذر شديد) ═══
 */
function clearAllSecrets() {
  const keys = [
    KEY_FIREBASE_URL,
    KEY_FIREBASE_API_KEY,
    KEY_GITHUB_OWNER,
    KEY_GITHUB_REPO,
    KEY_GITHUB_BRANCH,
    KEY_GITHUB_TOKEN,
    KEY_DEV_SIGNATURE
  ];

  for (let i = 0; i < keys.length; i++) {
    try {
      if (Keychain.contains(keys[i])) {
        Keychain.remove(keys[i]);
      }
    } catch (error) {
      console.error(`[fq_secrets_manager] Error removing key (${keys[i]})`);
    }
  }
}

module.exports = Object.freeze({
  saveAllSecrets,
  getFirebaseUrl,
  getFirebaseApiKey,
  getGithubOwner,
  getGithubRepo,
  getGithubBranch,
  getGithubToken,
  getDevSignature,
  hasSecrets,
  clearAllSecrets
});
