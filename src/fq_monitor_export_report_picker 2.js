// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: file-export;

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

module.exports = Object.freeze({ exportMonitorReportWithPicker });
