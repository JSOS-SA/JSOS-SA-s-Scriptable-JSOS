// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: desktop;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_v2_view_html.js

/**
 * بنية تيوب الرصد — قوائم لا جداول.
 *
 * المعرّفات كلّها محفوظة كما كانت (mon2IssuesBody وأخواتها) حتى لا ينكسر
 * أي مستهلك؛ ما تغيّر هو نوع الحاوية: كانت tbody داخل جدول عرضه ٧٢٠ نقطة،
 * وصارت قائمة تتمدّد بعرض الشاشة أيًّا كان.
 *
 * @returns {string} بنية تيوب الرصد الاحترافي.
 */
function getMonitorV2Html() {
  return getMonitorV2HtmlPart1() +
    getMonitorV2HtmlPart2() +
    getMonitorV2HtmlPart3();
}

/** الجزء 1 من 3 من نصّ `getMonitorV2Html()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getMonitorV2HtmlPart1() {
  return `
<section id="monPanel" class="mon2-panel" style="display:none" data-system="unknown" aria-label="تيوب الرصد">
  <header class="mon2-header">
    <span class="mon2-live" aria-hidden="true"></span>
    <div class="mon2-header-text">
      <h2>الرصد التشغيلي</h2>
      <p id="mon2SourceState">بانتظار المصدر</p>
    </div>
    <span id="mon2SystemBadge" class="mon2-badge mon2-off">غير معروف</span>
  </header>

  <div class="mon2-actions">
    <button type="button" id="mon2RefreshBtn">تحديث</button>
    <button type="button" id="mon2ExportBtn">تقرير JSON</button>
    <button type="button" id="mon2RetentionBtn">تنظيف القديم</button>
    <button type="button" id="mon2PackageBtn">سحب الحزمة: …</button>
  </div>

  <div id="mon2Banner" class="mon2-banner" role="status" aria-live="polite"></div>
`;
}

/** الجزء 2 من 3 من نصّ `getMonitorV2Html()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getMonitorV2HtmlPart2() {
  return `
  <div class="mon2-grid" id="mon2Metrics">
    <button type="button" class="mon2-card" data-detail="system">
      <span>حالة قناة الرصد</span>
      <span class="mon2-card-value"><i class="mon2-dot" aria-hidden="true"></i><strong id="mon2System">غير معروف</strong></span>
      <small>من العينة المتاحة</small>
    </button>
    <button type="button" class="mon2-card" data-detail="employees">
      <span>النشطون / المتأثرون</span>
      <span class="mon2-card-value"><i class="mon2-dot" aria-hidden="true"></i><strong id="mon2EmployeesMetric">٠ / ٠</strong></span>
      <small>نبضات معتمدة</small>
    </button>
    <button type="button" class="mon2-card" data-detail="errors">
      <span>أخطاء خلال دقيقتين</span>
      <span class="mon2-card-value"><i class="mon2-dot" aria-hidden="true"></i><strong id="mon2ErrorRate">—</strong></span>
      <small>لكل موظف نشط</small>
    </button>
    <button type="button" class="mon2-card" data-detail="latency">
      <span>الشبكة الوسيط / P95</span>
      <span class="mon2-card-value"><i class="mon2-dot" aria-hidden="true"></i><strong id="mon2Latency">—</strong></span>
      <small>ملي ثانية</small>
    </button>
    <button type="button" class="mon2-card" data-detail="queue">
      <span>الطوابير المتأخرة</span>
      <span class="mon2-card-value"><i class="mon2-dot" aria-hidden="true"></i><strong id="mon2Queue">٠</strong></span>
      <small>بانتظار الترحيل</small>
    </button>
    <button type="button" class="mon2-card" data-detail="release">
      <span>توزيع الإصدارات</span>
      <span class="mon2-card-value"><i class="mon2-dot" aria-hidden="true"></i><strong id="mon2Release">—</strong></span>
      <small>على الأجهزة</small>
    </button>
  </div>

  <div class="mon2-section">
    <div class="mon2-title"><h3>المشاكل المجمعة</h3><span id="mon2IssuesCount">٠</span></div>
    <div class="mon2-list" id="mon2IssuesBody"></div>
  </div>

  <div class="mon2-section">
    <div class="mon2-title"><h3>حالة الموظفين والأجهزة</h3><span id="mon2EmployeesCount">٠</span></div>
    <div class="mon2-list" id="mon2EmployeesBody"></div>
  </div>
`;
}

/** الجزء 3 من 3 من نصّ `getMonitorV2Html()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getMonitorV2HtmlPart3() {
  return `
  <div class="mon2-section">
    <div class="mon2-title"><h3>رحلات الدخول وربط الرصد</h3><span id="mon2JourneysCount">٠</span></div>
    <div class="mon2-list" id="mon2JourneysBody"></div>
  </div>

  <div class="mon2-section">
    <div class="mon2-title"><h3>طلبات ربط أجهزة الموظفين</h3><span id="mon2EnrollmentsCount">٠</span></div>
    <div class="mon2-list" id="mon2EnrollmentsBody"></div>
  </div>

  <div id="mon2Modal" class="mon2-modal" hidden>
    <div class="mon2-modal-card" role="dialog" aria-modal="true" aria-labelledby="mon2ModalTitle">
      <button type="button" id="mon2ModalClose" class="mon2-close" aria-label="إغلاق">×</button>
      <h3 id="mon2ModalTitle">التفاصيل</h3>
      <div id="mon2ModalBody"></div>
      <div id="mon2ModalActions" class="mon2-modal-actions"></div>
    </div>
  </div>
</section>`;
}

module.exports = Object.freeze({ getMonitorV2Html });
