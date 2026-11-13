// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: hdd;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_queue_file.js

/**
 * @module fq_queue_file
 * @description المسؤولية الواحدة: **ملف الطابور على الجهاز**. قراءةً
 * وكتابةً، لا أكثر. لا يعرف ما معنى العنصر ولا متى يُرسل.
 *
 * **وهذا هو باب التخزين المحلي الوحيد للطابور في المشروع.** حصرُه في ملف
 * واحد مقصود: فحصٌ دائم يُحمَرّ إن ظهر `FileManager` أو `localStorage` في
 * وحدات الطابور الأخرى أو في وحدات T4. والباب الواحد يجعل السياسة قابلة
 * للتغيير من مكان واحد، ويجعل خرقها مرئيًّا.
 *
 * **الملف في `documentsDirectory` لا في الكاش** — لنفس سبب
 * `fq_monitor_store` (في attic منذ ٢٠٢٦-٠٩-٣٠): النظام يحذف الكاش متى شاء، وما يُحذف هنا عملُ موظف
 * لم يصل إلى القاعدة بعد.
 *
 * **ولا يُكتب إلا مصفوفة**: أي شيء آخر يعني عطبًا في الجسر، وكتابته تُفسد
 * الإقلاع التالي. فالرفض هنا أرخص من التشخيص لاحقًا.
 */

const QUEUE_FILE = "fq_queue.json";

/**
 * يبني مسار ملف الطابور داخل مجلد المستندات المحلي.
 * @returns {string} المسار الكامل
 */
function _queuePath() {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), QUEUE_FILE);
}

/**
 * يقرأ طابور الطلبات المؤجَّلة من الجهاز.
 * @returns {Array} العناصر، ومصفوفة فارغة عند الغياب أو العطب
 */
function readQueue() {
  try {
    const fm = FileManager.local();
    const path = _queuePath();
    if (!fm.fileExists(path)) return [];
    const parsed = JSON.parse(fm.readString(path));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[fq_queue_file] قراءة: ${error.message}`);
    return [];
  }
}

/**
 * يستبدل ملف الطابور كاملًا.
 * @param {Array} entries - العناصر المؤجَّلة
 * @returns {boolean} true عند النجاح
 */
function writeQueue(entries) {
  if (!Array.isArray(entries)) return false;
  try {
    FileManager.local().writeString(_queuePath(), JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error(`[fq_queue_file] كتابة: ${error.message}`);
    return false;
  }
}

/**
 * يحوّل صورة الطابور القادمة من الصفحة نصًّا إلى مصفوفة ثم يكتبها.
 * الجسر يُرجع نصًّا دائمًا، والنصّ الفارغ حالة متوقَّعة لا عطل.
 * @param {string} raw - محتوى window._FQ_QUEUE
 * @returns {number} عدد العناصر المكتوبة، و-1 عند تعذّر التحويل
 */
function persistRaw(raw) {
  if (!raw || String(raw).length < 2) return writeQueue([]) ? 0 : -1;
  let parsed;
  try {
    parsed = JSON.parse(String(raw));
  } catch (error) {
    console.error(`[fq_queue_file] تحويل: ${error.message}`);
    return -1;
  }
  if (!Array.isArray(parsed)) return -1;
  return writeQueue(parsed) ? parsed.length : -1;
}

module.exports = Object.freeze({ readQueue, writeQueue, persistRaw });
