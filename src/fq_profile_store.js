// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: database;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_profile_store.js

/**
 * @module fq_profile_store
 * @description قراءة وحفظ بيانات الملف الشخصي محلياً فقط.
 */

const PROFILE_FILE = "fq_profile_data.json";

/**
 * يُرجع مسار ملف بيانات الملف الشخصي.
 * @returns {string}
 */
function getProfilePath() {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), PROFILE_FILE);
}

/**
 * يقرأ بيانات الملف الشخصي المحفوظة.
 * @returns {Object|null}
 */
function loadProfile() {
  const fm = FileManager.local();
  const path = getProfilePath();
  if (!fm.fileExists(path)) return null;
  try {
    return JSON.parse(fm.readString(path));
  } catch (e) { console.warn(`[fq_profile] Profile load failed: ${e.message}`); return null; }
}

/**
 * يحفظ بيانات الملف الشخصي.
 * @param {Object} data - البيانات
 * @returns {void}
 */
function saveProfile(data) {
  const fm = FileManager.local();
  fm.writeString(getProfilePath(), JSON.stringify(data));
}

module.exports = Object.freeze({ loadProfile, saveProfile });
