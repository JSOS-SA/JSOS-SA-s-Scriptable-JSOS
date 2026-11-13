// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: user-circle;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_profile.js

// ═══ الغلاف الجامع للملف الشخصي (Facade) ═══
// يحفظ عقد التصدير الخماسي كما كان، ويوزّع المسؤوليات على أربع وحدات:
//   fq_profile_store  → قراءة/حفظ محلي
//   fq_profile_html   → هيكل الواجهة
//   fq_profile_styles → التنسيقات
//   fq_profile_code   → كود المتصفح المحقون
const store  = importModule("fq_profile_store");
const html   = importModule("fq_profile_html");
const styles = importModule("fq_profile_styles");
const code   = importModule("fq_profile_code");

module.exports = Object.freeze({
  loadProfile:      store.loadProfile,
  saveProfile:      store.saveProfile,
  getProfileHtml:   html.getProfileHtml,
  getProfileStyles: styles.getProfileStyles,
  getProfileCode:   code.getProfileCode,
});
