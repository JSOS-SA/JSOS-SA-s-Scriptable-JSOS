// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: hdd;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_store.js

/**
 * @module fq_monitor_store
 * @description تخزين الرصد المحلي — التخزين وحده.
 * المسؤولية الواحدة: قراءة طابور الأحداث وحالة العدّادات وكتابتهما.
 *
 * لا منطق مجال هنا ولا حساب ولا شبكة: هذه الوحدة لا تعرف ما معنى السجل،
 * تعرف فقط أين يُحفظ وكيف يُقرأ.
 *
 * الملفات في مجلد المستندات المحلي لا في الكاش، لأن النظام يحذف الكاش
 * متى شاء فيختفي سجل الرصد قبل قراءته.
 */

const QUEUE_FILE = "fq_monitor_queue.json";
const STATE_FILE = "fq_monitor_state.json";
const HISTORY_FILE = "fq_monitor_history.json";

/**
 * يبني مسار ملف داخل مجلد المستندات المحلي.
 * @param {string} fileName - اسم الملف
 * @returns {string} المسار الكامل
 */
function _path(fileName) {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), fileName);
}

/**
 * يقرأ ملف JSON محليًا ويُرجع بديلًا عند أي عطب.
 * @param {string} fileName - اسم الملف
 * @param {*} fallback - القيمة البديلة
 * @returns {*} المحتوى أو البديل
 */
function _readJson(fileName, fallback) {
  const fm = FileManager.local();
  const filePath = _path(fileName);
  if (!fm.fileExists(filePath)) return fallback;
  try {
    const parsed = JSON.parse(fm.readString(filePath));
    return parsed === null ? fallback : parsed;
  } catch (e) {
    console.error(`[fq_monitor_store] read ${fileName}: ${e.message}`);
    return fallback;
  }
}

/**
 * يكتب قيمة في ملف JSON محلي.
 * @param {string} fileName - اسم الملف
 * @param {*} value - القيمة
 * @returns {boolean} true عند النجاح
 */
function _writeJson(fileName, value) {
  try {
    FileManager.local().writeString(_path(fileName), JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[fq_monitor_store] write ${fileName}: ${e.message}`);
    return false;
  }
}

/**
 * يقرأ طابور الأحداث.
 * @returns {Array} السجلات، ومصفوفة فارغة عند أي عطب
 */
function readQueue() {
  const data = _readJson(QUEUE_FILE, []);
  return Array.isArray(data) ? data : [];
}

/**
 * يكتب طابور الأحداث.
 * @param {Array} entries - السجلات
 * @returns {boolean} true عند النجاح
 */
function writeQueue(entries) {
  return _writeJson(QUEUE_FILE, entries);
}

/**
 * يقرأ حالة العدّادات.
 * @returns {Object} الحالة، وكائن فارغ عند أي عطب
 */
function readState() {
  const data = _readJson(STATE_FILE, {});
  return (data && typeof data === "object") ? data : {};
}

/**
 * يكتب حالة العدّادات.
 * @param {Object} state - الحالة
 * @returns {boolean} true عند النجاح
 */
function writeState(state) {
  return _writeJson(STATE_FILE, state);
}

/**
 * يقرأ سجل العرض المحلي (لا يُفرَّغ عند الترحيل).
 * @returns {Array}
 */
function readHistory() {
  const data = _readJson(HISTORY_FILE, []);
  return Array.isArray(data) ? data : [];
}

/**
 * يكتب سجل العرض المحلي.
 * @param {Array} entries
 * @returns {boolean}
 */
function writeHistory(entries) {
  return _writeJson(HISTORY_FILE, entries);
}

class AppCoordinator {
  static async boot() {
    // وحدة تخزين — لا إجراء إقلاع
  }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((e) => console.error(e)); } catch (e) { console.error(e); }

module.exports = Object.freeze({
  readQueue,
  writeQueue,
  readState,
  writeState,
  readHistory,
  writeHistory,
});
