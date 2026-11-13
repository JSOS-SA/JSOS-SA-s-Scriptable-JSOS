// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: clipboard-list;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_regmodel.js

// ═══ غلاف نموذج تسجيل بيانات الرحلات ═══
// المسؤولية الواحدة: تجميع وحدات التسجيل المُفكَّكة وإعادة تصدير الواجهة الأصلية
// واجهة التصدير الأصلية محفوظة 100%:
//   getRegModelHtml, getRegModelStyles, getRegModelCode, getFormTemplate, getCurrentShiftKey

const regHtml = importModule("fq_reg_html");
const regStyles = importModule("fq_reg_styles");
const regShift = importModule("fq_reg_shift");
const regForm = importModule("fq_reg_form");
const regCopy = importModule("fq_reg_copy");
const regHistory = importModule("fq_reg_history");

/**
 * يُجمّع كل أجزاء JS لتبويب التسجيل بترتيب التبعيات الصحيح.
 * shift يجب أن يأتي أولاً (يُعرّف المتغيرات المشتركة)
 * form ثانياً (يعرّف addRegForm, _collectForms المستخدمة في copy)
 * copy ثالثاً (يستخدم addRegForm من form)
 * history رابعاً (يستخدم loadRegHistory المعرّفة فيه ويُربط بـ regTab)
 * @returns {string}
 */
function getRegModelCode() {
  return regShift.getShiftCode()
    + regForm.getFormCode()
    + regCopy.getCopyCode()
    + regHistory.getHistoryCode();
}

module.exports = Object.freeze({
  getRegModelHtml: regHtml.getRegModelHtml,
  getRegModelStyles: regStyles.getRegModelStyles,
  getRegModelCode: getRegModelCode,
  getFormTemplate: regHtml.getFormTemplate,
  getCurrentShiftKey: regShift.getCurrentShiftKey,
});
