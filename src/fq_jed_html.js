// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_jed_html.js

/**
 * @module fq_jed_html
 * @description المسؤولية الواحدة: بنية تيوب LIVE FLT في الصفحة. لا منطق
 * ولا أنماط — المعرّفات هنا هي العقد بين البنية و`fq_jed_view`.
 *
 * التيوب يعرض رحلات المغادرة للصالات الثلاث (الشمالية وصالة ١ وصالة ٤)
 * كما تعرضها شاشة الطرفية في برنامج `~/Desktop/رحلات_صالات_جدة` بأمر
 * المالك ٢٠٢٦-١٠-٠٣: «كأنها محاكي للطرفية وبألوان مختلفة لكل حالة».
 *
 * **كتلتان، وموضعهما مقصود** (النمط نفسه في `fq_t4_html`):
 * ١) `#jedPanel` — اللوحة، تُخفى بـ `display:none` كبقية اللوحات.
 * ٢) `#jedModal` — نافذة تفاصيل الرحلة، **خارج اللوحة** وعلى مستوى
 *    `body`، وتستعمل مكوّن النوافذ `.ef-*` نفسه (الدرس ٢٨: لا نافذة رابعة)،
 *    والصنف `jed-mov` يحمل فروقها وحده.
 *
 * **أعمدة الجدول بأسماء المالك**: FLT NO · STD · ETD · DEST · STS · TTD،
 * وأُلغي عمودا البوابة والمواقع. وترتيبها من اليمين لأن الصفحة `rtl`،
 * فأول عمود (رقم الرحلة) في أقصى اليمين كما في الطرفية.
 *
 * **زرّ «إظهار المغادرة» في بداية التيوب** (أمر المالك ٢٠٢٦-١٠-٠٣) بصنف
 * `vt-btn` وأيقونة زرّ «كايا» نفسهما، ومفعَّلًا أصلًا لأن المقلعة مخفية.
 * **وزرّ «ترحيل البيانات» بجانبه** (أمر المالك ٢٠٢٦-١٠-٠٥) بالصنف نفسه، يعمل
 * على الصالة المفتوحة وحدها، ومنطقه في `fq_jed_transfer`.
 * **والنافذة تحمل `t4-form-win`** فتأخذ حقول التعديل شكل حقول نافذتي T4.
 */

const icons = importModule("fq_icons");

/**
 * بنية لوحة LIVE FLT ونافذة تفاصيل الرحلة.
 * @returns {string} نص HTML
 */
function getJedHtml() {
  return `
<div id="jedPanel" style="display:none">
  <div class="view-toggle jed-vt">
    <button class="vt-btn vt-active" id="jedHideDepBtn" type="button"
      title="إخفاء أو إظهار الرحلات المغادرة">
      <span class="vt-ic">${icons.buildIcon("eyeOff", { size: 16 })}</span>
      <span class="vt-lb">إظهار المغادرة</span>
    </button>
    <span class="jed-hidden" id="jedHiddenCount"></span>
    <button class="vt-btn jed-xfer" id="jedTransferBtn" type="button"
      title="ترحيل رحلات الصالة المفتوحة إلى تيوب كايا">
      <span class="vt-ic">${icons.buildIcon("send", { size: 16 })}</span>
      <span class="vt-lb">ترحيل البيانات</span>
    </button>
  </div>
  <div class="jed-term">
    <div class="jed-top">
      <span class="jed-title">LIVE FLT · رحلات المغادرة · مطار الملك عبدالعزيز</span>
      <span class="jed-clock" id="jedClock"></span>
    </div>
    <div class="jed-terms" id="jedTerms"></div>
    <button type="button" class="jed-day" id="jedDayBtn"></button>
    <div class="jed-src" id="jedSources"></div>
    <div class="jed-note" id="jedNote"></div>
    <div class="jed-wrap">
      <table class="jed-tbl">
        <thead><tr>
          <th>FLT NO</th><th>STD</th><th>ETD</th><th>DEST</th><th>STS</th><th>TTD</th>
        </tr></thead>
        <tbody id="jedBody"></tbody>
      </table>
    </div>
    <div class="jed-state" id="jedState"></div>
  </div>
</div>
<div class="ef-overlay jed-mov t4-form-win" id="jedModal">
  <div class="ef-modal" role="dialog" aria-modal="true" aria-labelledby="jedModalTitle">
    <div class="ef-hdr">
      <span id="jedModalTitle">تفاصيل الرحلة</span>
      <button type="button" class="ef-close" id="jedModalClose"
        aria-label="إغلاق النافذة">&times;</button>
    </div>
    <div class="ef-body jed-detail" id="jedDetail"></div>
  </div>
</div>
`;
}

module.exports = Object.freeze({ getJedHtml });
