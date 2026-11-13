// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: file-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_reg_html.js

// ═══ هيكل HTML لتبويب التسجيل ═══
// المسؤولية الواحدة: توفير قوالب HTML الثابتة (لوحة + قالب رحلة)
// لا منطق برمجي هنا — قوالب نصية فقط.

const statusEnum = importModule("fq_enum_status");
const visaEnum = importModule("fq_enum_visa");
const tafweejEnum = importModule("fq_enum_tafweej");
const inspectionEnum = importModule("fq_enum_inspection");

/**
 * يُرجع HTML لوحة التسجيل الكاملة.
 * @returns {string}
 */
function getRegModelHtml() {
  return getRegModelHtmlPart1() +
    getRegModelHtmlPart2();
}

/** الجزء 1 من 2 من نصّ `getRegModelHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getRegModelHtmlPart1() {
  return `
<div id="regPanel" style="display:none">
<div class="reg-app">

  <div class="reg-shift">
    <div class="reg-shift-bar"></div>
    <div class="reg-shift-body">
      <div class="reg-shift-info">
        <p class="reg-shift-label">الوردية الحالية</p>
        <h2 class="reg-shift-title" id="regShiftTitle">—</h2>
      </div>
      <div class="reg-shift-times">
        <div class="reg-time-box">
          <span class="reg-time-label">البداية</span>
          <span class="reg-time-val" id="regShiftStart">--:--</span>
        </div>
        <div class="reg-time-box">
          <span class="reg-time-label">النهاية</span>
          <span class="reg-time-val" id="regShiftEnd">--:--</span>
        </div>
      </div>
    </div>
  </div>

  <div class="reg-history-wrap">
    <button class="reg-history-toggle" id="regHistToggle">
      <span class="reg-hist-arrow">◂</span>
      <span>التسجيلات السابقة</span>
      <span class="reg-hist-count" id="regHistCount">0</span>
    </button>
    <div class="reg-history-body" id="regHistBody">
      <div id="regHistList"></div>
    </div>
  </div>

  <div id="regFormsContainer"></div>
`;
}

/** الجزء 2 من 2 من نصّ `getRegModelHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getRegModelHtmlPart2() {
  return `
  <div class="reg-actions">
    <button class="reg-btn reg-btn-add" id="regAddBtn">
      <span class="reg-btn-ic">+</span>
      إضافة رحلة جديدة
    </button>
    <button class="reg-btn reg-btn-copy" id="regCopyBtn">
      نسخ البيانات
    </button>
    <button class="reg-btn reg-btn-wa" id="regWaBtn">
      إرسال إلى واتساب
    </button>
    <button class="reg-btn reg-btn-reset" id="regResetBtn">
      إعادة ضبط
    </button>
  </div>

  <div class="reg-counter" id="regCounter">0 رحلة مسجّلة</div>

</div>
</div>`;
}

/**
 * يُرجع قالب نموذج رحلة واحدة (يُحقن ديناميكياً عند إضافة رحلة).
 * @returns {string}
 */
function getFormTemplate() {
  return getFormTemplatePart1() +
    getFormTemplatePart2();
}

/** الجزء 1 من 2 من نصّ `getFormTemplate()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormTemplatePart1() {
  return `
<div class="reg-form" data-form-id="__ID__">
  <div class="reg-form-hdr">
    <div class="reg-form-hdr-right">
      <div class="reg-form-dot"></div>
      <span class="reg-form-title">تسجيل رحلة <span class="reg-form-num">#__NUM__</span></span>
    </div>
    <button class="reg-form-del" data-del="__ID__">حذف</button>
  </div>

  <div class="reg-grid">
    <div class="reg-field">
      <label class="reg-label">رقم الرحلة</label>
      <input class="reg-input" type="text" placeholder="مثال: 800" data-key="flt" autocomplete="off" dir="ltr">
      <div class="reg-flt-dd" data-fltdd="__ID__"></div>
    </div>
    <div class="reg-field">
      <label class="reg-label">وقت الإقلاع</label>
      <input class="reg-input" type="time" data-key="std" dir="ltr">
    </div>
    <div class="reg-field">
      <label class="reg-label">تاريخ الإقلاع</label>
      <input class="reg-input" type="date" data-key="date" dir="ltr">
    </div>
    <div class="reg-field">
      <label class="reg-label">الحالة</label>
      <select class="reg-input" data-key="status">
${statusEnum.buildStatusOptions()}
      </select>
    </div>
    <div class="reg-field">
      <label class="reg-label">الوجهة</label>
      <input class="reg-input" type="text" placeholder="الدولة" data-key="dest" autocomplete="off">
    </div>
    <div class="reg-field">
      <label class="reg-label">عدد الركاب</label>
      <input class="reg-input" type="number" placeholder="0" data-key="pax" dir="ltr">
    </div>
    <div class="reg-field">
      <label class="reg-label">نوع التأشيرة</label>
      <select class="reg-input" data-key="visa">`;
}

/** الجزء 2 من 2 من نصّ `getFormTemplate()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormTemplatePart2() {
  return `
${visaEnum.buildVisaOptions()}
      </select>
    </div>
    <div class="reg-field reg-field-wide">
      <label class="reg-label">اسم الحملة</label>
      <input class="reg-input" type="text" placeholder="اسم الشركة أو الحملة" data-key="campaign" autocomplete="off">
    </div>
    <div class="reg-field">
      <label class="reg-label">التفويج</label>
      <select class="reg-input" data-key="tafweej">
${tafweejEnum.buildTafweejOptions()}
      </select>
      <div class="reg-tafweej-hint" data-hint="__ID__"></div>
    </div>
    <div class="reg-field">
      <label class="reg-label">الكشف</label>
      <select class="reg-input" data-key="inspection">
${inspectionEnum.buildInspectionOptions()}
      </select>
    </div>
    <div class="reg-field reg-field-wide">
      <label class="reg-label">ملاحظة (اختياري)</label>
      <input class="reg-input" type="text" placeholder="اكتب ملاحظة إن وجدت" data-key="note" autocomplete="off">
    </div>
  </div>
</div>`;
}

module.exports = Object.freeze({
  getRegModelHtml,
  getFormTemplate,
});
