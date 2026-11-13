// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: chart-pie;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_stats.js

// ═══ الغلاف الجامع للوحة الإحصائيات (Facade) ═══
// يحفظ عقد التصدير الثلاثي كما كان، ويوزّع المسؤوليات على ثلاث وحدات:
//   fq_stats_html   → هيكل الواجهة
//   fq_stats_styles → التنسيقات
//   fq_stats_code   → كود المتصفح المحقون
const html   = importModule("fq_stats_html");
const styles = importModule("fq_stats_styles");
const code   = importModule("fq_stats_code");

module.exports = Object.freeze({
  getStatsHtml:   html.getStatsHtml,
  getStatsStyles: styles.getStatsStyles,
  getStatsCode:   code.getStatsCode,
});
