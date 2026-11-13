// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: chart-pie;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_stats_html.js

/**
 * @module fq_stats_html
 * @description هيكل HTML لوحة الإحصائيات فقط.
 */

const icons = importModule("fq_icons");

/**
 * يُرجع HTML لوحة الإحصائيات (تُحقن في WebView).
 * @returns {string}
 */
function getStatsHtml() {
  const ic = (n, sz) => icons.buildIcon(n, { size: sz || 24 });
  return getStatsHtmlPart1(ic) +
    getStatsHtmlPart2(ic) +
    getStatsHtmlPart3(ic);
}

/** الجزء 1 من 3 من نصّ `getStatsHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsHtmlPart1(ic) {
  return `
<div id="statsPanel" style="display:none">
<div class="app">

  <div class="st-period-bar">
    <button class="st-pd-btn st-pd-active" data-st-period="shift">الوردية</button>
    <button class="st-pd-btn" data-st-period="day">اليوم</button>
    <button class="st-pd-btn" data-st-period="week">الأسبوع</button>
    <button class="st-pd-btn" data-st-period="month">الشهر</button>
  </div>

  <div class="st-shift-badge" id="stShiftBadge">A</div>

  <div class="st-section-break">
    <span class="st-sb-num">١</span>
    <span class="st-sb-label">نظرة عامة</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-overview-card">
    <div class="st-ov-block">
      <div class="st-ov-icon">${ic("bus", 28)}</div>
      <div class="st-ov-num st-ov-num-bus" id="stOvBus">0</div>
      <div class="st-ov-label">حافلة</div>
    </div>
    <div class="st-ov-divider"></div>
    <div class="st-ov-block">
      <div class="st-ov-icon">${ic("users", 28)}</div>
      <div class="st-ov-num st-ov-num-pax" id="stOvPax">0</div>
      <div class="st-ov-label">راكب</div>
    </div>
  </div>

  <div class="st-section-break">
    <span class="st-sb-num">٢</span>
    <span class="st-sb-label">عدد الحافلات حسب التأشيرة</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-bus-card">
    <div class="st-card-head">
      <span class="st-ch-icon">${ic("bus", 22)}</span>
      <span class="st-ch-title">إجمالي حافلات المغادرة</span>
      <span class="st-ch-total" id="stBusTotal">0</span>
    </div>
    <div class="st-sub-grid" id="stBusByVisa"></div>
  </div>
`;
}

/** الجزء 2 من 3 من نصّ `getStatsHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsHtmlPart2(ic) {
  return `
  <div class="st-section-break">
    <span class="st-sb-num">٣</span>
    <span class="st-sb-label">عدد الركاب حسب التأشيرة</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-pax-card">
    <div class="st-card-head">
      <span class="st-ch-icon">${ic("users", 22)}</span>
      <span class="st-ch-title">إجمالي ركاب المغادرة</span>
      <span class="st-ch-total" id="stPaxTotal">0</span>
    </div>
    <div class="st-sub-grid" id="stPaxByVisa"></div>
  </div>

  <div class="st-section-break">
    <span class="st-sb-num">٤</span>
    <span class="st-sb-label">حالة التفويج</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-dist-card" id="stTafweejList"></div>

  <div class="st-section-break">
    <span class="st-sb-num">٥</span>
    <span class="st-sb-label">حالة الرحلة</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-dist-card" id="stStatusList"></div>

  <div class="st-section-break">
    <span class="st-sb-num">٦</span>
    <span class="st-sb-label">نتيجة الكشف</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-dist-card" id="stInspList"></div>
`;
}

/** الجزء 3 من 3 من نصّ `getStatsHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsHtmlPart3(ic) {
  return `
  <div class="st-section-break">
    <span class="st-sb-num">٧</span>
    <span class="st-sb-label">إحصائيات لكل رحلة</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-flt-card">
    <div class="st-flt-search-wrap">
      <span class="st-flt-search-ic">${ic("search", 16)}</span>
      <input type="text" class="st-flt-search" id="stFltSearch" placeholder="ابحث برقم الرحلة" autocomplete="off">
    </div>
    <div class="st-flt-list" id="stFltList"></div>
  </div>

  <div class="st-section-break">
    <span class="st-sb-num">٨</span>
    <span class="st-sb-label">تقرير نهاية الوردية</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-report-box">
    <pre class="st-rep-pre" id="stReportPre">—</pre>
    <div class="st-rep-actions">
      <button class="btn-pro btn-pro-pri" id="stCopyBtn">${ic("copy", 16)}<span>نسخ التقرير</span></button>
      <button class="btn-pro btn-pro-sec" id="stRefreshBtn">${ic("refresh", 16)}<span>تحديث</span></button>
    </div>
  </div>

  <div class="st-section-break">
    <span class="st-sb-num">٩</span>
    <span class="st-sb-label">أداء الموظفين</span>
    <span class="st-sb-line"></span>
  </div>
  <div class="st-emp-card" id="stEmpList"></div>

  <div class="st-last-update" id="stLastUpdate">—</div>

</div>
</div>`;
}

module.exports = Object.freeze({ getStatsHtml });
