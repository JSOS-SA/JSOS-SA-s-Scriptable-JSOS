// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_storage.js

/**
 * @module fq_storage
 * @description وحدة التخزين المحلي الآمن (Local Storage) لبيانات الرحلات.
 * مسؤولة عن مزامنة البيانات للعمل دون اتصال (Offline) وتغذية الودجت.
 */

const FILE_NAME = "fq_data.json";

/**
 * يجلب المسار الآمن لملف البيانات المشترك.
 * @returns {string} مسار الملف المطلق في بيئة iOS.
 */
function getPath() {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), FILE_NAME);
}

/**
 * يحفظ بيانات الرحلات والملفات المرتبطة بها في التخزين المحلي.
 * يُستدعى عند التحديث أو قبل إغلاق التطبيق الرئيسي.
 * @param {Array} flights - مصفوفة الرحلات النشطة
 * @param {Array} files - مصفوفة الملفات المرفوعة
 * @returns {boolean} حالة النجاح
 */
function saveFlights(flights, files) {
  if (!flights || !files) return false;

  try {
    const fm = FileManager.local();
    const payload = {
      flights: flights.map(f => {
        // الحفاظ على الهيكل الدقيق لعقدة البيانات (Data Contract)
        return {
          al: f.al,
          flt: f.flt,
          to: f.to,
          std: f.std,
          type: f.type,
          dpax: f.dpax,
          date: f.date,
          depTime: f.depTime,
          terminal: f.terminal,
        };
      }),
      filesCount: files.length,
      totalFlights: flights.length,
      updatedAt: new Date().toISOString(),
    };

    fm.writeString(getPath(), JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error(`[fq_storage] Failed to save flights: ${e.message}`);
    return false;
  }
}

/**
 * يقرأ بيانات الرحلات من التخزين المحلي ويعيد بناء كائنات التاريخ.
 * يُستدعى عند الإقلاع البارد (Cold Boot) أو من الودجت.
 * @returns {Object|null} كائن البيانات أو null عند الفشل أو عدم وجود ملف
 */
function _restoreFlightDates(data) {
  if (!data || !Array.isArray(data.flights)) return data;
  for (let index = 0; index < data.flights.length; index++) {
    if (data.flights[index].depTime) data.flights[index].depTime = new Date(data.flights[index].depTime);
  }
  return data;
}

/**
 * يقرأ نسخة الجهاز من الرحلات للودجة، ويعيد أوقات الإقلاع تواريخ.
 * @returns {Object|null} البيانات، و null إن غاب الملف أو تعذّر تحليله
 */
function loadFlights() {
  const fm = FileManager.local();
  const path = getPath();
  if (!fm.fileExists(path)) return null;
  try { return _restoreFlightDates(JSON.parse(fm.readString(path))); }
  catch (error) {
    console.error(`[fq_storage] Failed to load flights: ${error.message}`);
    return null;
  }
}

module.exports = Object.freeze({ saveFlights, loadFlights, getPath });
