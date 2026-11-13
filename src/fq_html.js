// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_html.js

const icons = importModule("fq_icons");

/**
 * يبني هيكل الصفحة الرئيسة بخاناتها الفارغة التي يملؤها fq_main.
 * @returns {string} نص HTML
 */
function getHtml() {
  const ic = (n, sz) => icons.buildIcon(n, { size: sz || 18 });
  return getHtmlPart1(ic) +
    getHtmlPart2(ic) +
    getHtmlPart3() +
    getHtmlPart4(ic) +
    getHtmlPart5(ic) +
    getHtmlPart6(ic) +
    getHtmlPart7(ic) +
    getHtmlPart8(ic) +
    getHtmlPart9(ic) +
    getHtmlPart10();
}

/** الجزء 1 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart1(ic) {
  return `
<!-- ═══ الشريط العلوي الثابت — موقع النقطة واسم النظام ═══ -->
<div class="topbar" id="topbar">
  <div class="tb-inner">
    <span class="tb-icon">${ic("plane", 18)}</span>
    <span class="tb-title">JEDCO SMART OPERATIONS HT</span>
    <span class="tb-count" id="tbcount"></span>
    <span id="fbIndicator" class="fb-indicator">
      <span id="fbDot" class="fb-dot" title="اضغط لاختبار الاتصال"></span>
      <span id="fbLabel" class="fb-label">جارٍ الفحص</span>
    </span>
  </div>
</div>

<!-- ═══ اللوحات ═══ -->
<div id="regSlot"></div>
<div id="statsSlot"></div>
<div id="monSlot"></div>
<div id="profileSlot"></div>

<div id="notifPanel" style="display:none">
  <div class="app">
    <div class="hd"><p>سجل الإشعارات والتحديثات</p></div>
    <div class="notif-bar">
      <span id="notifCount" class="notif-count">0</span>
      <button id="notifRefreshBtn" class="notif-refresh">⟳ تحديث</button>
    </div>
    <div id="notifList"></div>
  </div>
</div>
`;
}

/** الجزء 2 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart2(ic) {
  return `
<div id="livePanel" style="display:none">
  <div class="app">
    <div class="hd"><p>رحلات المغادرة من كايا — مطار الملك عبدالعزيز</p></div>
    <div class="sbox on">
      <input type="text" id="liveInput"
        placeholder="ابحث برقم الرحلة أو الناقل أو الوجهة…"
        autocomplete="off">
    </div>
    <div class="lf-bar">
      <button class="lf-btn lf-active" data-lf="all">الكل</button>
      <button class="lf-btn" data-lf="flight">رقم الرحلة</button>
      <button class="lf-btn" data-lf="airline">الناقل</button>
      <button class="lf-btn" data-lf="dest">الوجهة</button>
    </div>
    <div class="view-toggle" id="lvVtoggle">
      <button class="vt-btn vt-active" id="lvHideDepBtn"
        title="إخفاء أو إظهار الرحلات المغادرة">
        <span class="vt-ic">${ic("eyeOff", 16)}</span>
        <span class="vt-lb">إظهار المغادرة</span>
      </button>
      <span id="liveAge" class="live-src"></span>
    </div>
    <div id="liveResults"></div>
    <div id="hallSlot"></div>
  </div>
</div>

<div id="alPanel" style="display:none">
  <div class="app">
    <div class="hd"><p>دليل شركات الطيران — المناولة والمعلومات</p></div>
    <div class="sbox on">
      <input type="text" id="alInput"
        placeholder="ابحث بالرمز أو الاسم أو البلد…"
        autocomplete="off">
    </div>
    <div class="lf-bar">
      <button class="al-btn al-active" data-ah="all">الكل</button>
      <button class="al-btn" data-ah="SGS">SGS</button>
      <button class="al-btn" data-ah="SWISSPORT">SWISSPORT</button>
    </div>
    <div class="live-info"><span id="alCount"></span></div>
    <div id="alResults"></div>
  </div>
</div>
`;
}

/** الجزء 3 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart3() {
  return `
<div id="t4Slot"></div>
<div id="jedSlot"></div>
<div id="guideSlot"></div>
<div id="dbSlot"></div>

<!-- ═══ لوحة الجداول الرئيسية ═══ -->
<div id="pdfPanel">
<div class="app">
  <div class="hd">
    <p>جداول الرحلات — بحث وإدارة</p>
  </div>

  <!-- حقل التاريخ مخفي (نُقل للقائمة الجانبية، يبقى مرجعاً للـparser) -->
  <input type="date" id="dp" style="display:none">

  <!-- قائمة الحذف المنبثقة -->
  <div class="fq-modal-overlay" id="fqModalOverlay">
    <div class="fq-modal">
      <div class="fq-modal-hdr">
        <span>حذف جداول</span>
        <button class="fq-modal-close" id="fqModalClose">&times;</button>
      </div>
      <div class="fq-modal-body" id="fqModalBody"></div>
      <div class="fq-modal-foot">
        <button class="fqa-btn fqa-delete" id="fqModalConfirm">
          حذف المحدد
        </button>
      </div>
    </div>
  </div>

  <div class="err" id="er"></div>
  <div class="ld" id="ld">
    <div class="sp"></div>
    <div>جارٍ استخراج الجدول...</div>
  </div>

  <div class="inf" id="nf"></div>

  <div class="sbox" id="sb">
    <input type="text" id="si"
      placeholder="ادخل رقم الرحلة" autocomplete="off">
  </div>
`;
}

/** الجزء 4 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart4(ic) {
  return `
  <!-- أزرار الفلترة الأساسية — ظاهرة دائماً -->
  <div class="filters" id="filters">
    <button class="fl-btn active" data-filter="all">الكل</button>
    <button class="fl-btn" data-filter="early">مبكر</button>
    <button class="fl-btn" data-filter="ontime">في الموعد</button>
    <button class="fl-btn" data-filter="late">متأخر</button>
  </div>

  <!-- أزرار العرض — ظاهرة دائماً بدون المقارنة -->
  <div class="view-toggle" id="vtoggle">
    <button class="vt-btn" id="vtbtn" title="مضغوط/موسّع">
      <span class="vt-ic">${ic("list", 16)}</span>
      <span class="vt-lb">مضغوط</span>
    </button>
    <button class="vt-btn" id="grpbtn" title="تجميع بالشركة">
      <span class="vt-ic">${ic("plane", 16)}</span>
      <span class="vt-lb">تجميع</span>
    </button>
    <button class="vt-btn" id="hideDepBtn" title="إخفاء الرحلات المغادرة">
      <span class="vt-ic">${ic("eyeOff", 16)}</span>
      <span class="vt-lb">إخفاء المغادرة</span>
    </button>
  </div>

  <div class="res" id="rs">
    <div class="res-h" id="rh"></div>
    <div id="rl"></div>
  </div>

  <div class="cpb" id="cp">
    <button id="cb">نسخ النتائج</button>
  </div>
</div>
</div>

<!-- خلفية معتمة للسايدبار -->
<div class="sb-overlay" id="sbov"></div>

<!-- القائمة الجانبية المحدّثة -->
<div class="sidebar" id="sbar">
  <div class="sb-hdr">
    <h2>لوحة التحكم</h2>
    <button class="sb-close" id="sbc">&times;</button>
  </div>
`;
}

/** الجزء 5 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart5(ic) {
  return `
  <div class="sb-list">

  <!-- حقل التاريخ -->
  <div class="sb-section">
    <div class="sb-section-title">${ic("calendar", 16)}<span> تاريخ الجدول</span></div>
    <input type="date" id="dpSide" class="sb-date-input">
  </div>

  <!-- رفع ملف PDF (نُقل من تيوب جداول) -->
  <div class="sb-section">
    <div class="sb-section-title">${ic("upload", 16)}<span> رفع جدول PDF</span></div>
    <div class="upload" id="uz">
      <span class="ic-up">${ic("upload", 28)}</span>
      <div class="lb">ارفع ملف الجدول PDF</div>
      <div class="hn">اختر التاريخ ثم ارفع الملف</div>
      <input type="file" accept="application/pdf" id="fi">
    </div>
  </div>

  <!-- قائمة الملفات المرفوعة -->
  <div class="sb-section">
    <div class="sb-section-title">${ic("folder", 16)}<span> الملفات المرفوعة</span></div>
    <div class="flist-wrap">
      <button class="flist-toggle" id="flistToggle">
        <span class="flt-arrow">◂</span>
        <span id="flistLabel">لا ملفات</span>
      </button>
      <div class="flist-body" id="flistBody">
        <div class="flist" id="flist"></div>
      </div>
    </div>
  </div>

  <!-- نموذج إضافة رحلة (نُقل فعلياً للقائمة الجانبية) -->
  <div class="sb-section">
    <div class="sb-section-title">${ic("plane", 16)}<span> إضافة رحلة</span></div>
    <div id="addFlightSlot"></div>
  </div>

  <!-- إضافة وجهة جديدة لملف المطارات -->
  <div class="sb-section">
    <div class="sb-section-title">${ic("building", 16)}<span> إضافة وجهة جديدة</span></div>
    <div id="addAirportSlot"></div>
  </div>
`;
}

/** الجزء 6 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart6(ic) {
  return `
  <!-- ٤ إحصائيات -->
  <div class="sb-section">
    <div class="sb-section-title">${ic("barChart", 16)}<span> الإحصائيات</span></div>
    <div class="sb-stats" id="sbStats">
      <div class="sb-stat-cell">
        <div class="sb-stat-val" id="sbStatUpcoming">—</div>
        <div class="sb-stat-lbl">رحلة قادمة</div>
      </div>
      <div class="sb-stat-cell">
        <div class="sb-stat-val" id="sbStatNearest">—</div>
        <div class="sb-stat-lbl">الأقرب</div>
      </div>
      <div class="sb-stat-cell">
        <div class="sb-stat-val" id="sbStatTopDest">—</div>
        <div class="sb-stat-lbl">أكثر وجهة</div>
      </div>
      <div class="sb-stat-cell">
        <div class="sb-stat-val" id="sbStatTotal">—</div>
        <div class="sb-stat-lbl">الإجمالي</div>
      </div>
    </div>
  </div>

  <!-- أزرار حفظ وتحديث وحذف -->
  <div class="sb-section">
    <div class="sb-section-title">${ic("bell", 16)}<span> الإشعارات</span></div>
    <div class="fq-actions-bar on">
      <button class="fqa-btn fqa-notif-toggle" id="notifToggleBtn">
        <span class="fqa-ic" id="notifToggleIc">${ic("bell", 16)}</span>
        <span id="notifToggleLb">إيقاف الإشعارات</span>
      </button>
    </div>
  </div>
`;
}

/** الجزء 7 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart7(ic) {
  return `
  <div class="sb-section">
    <div class="sb-section-title">${ic("settings", 16)}<span> إدارة البيانات</span></div>
    <div class="fq-actions-bar on" id="fqActionsBar">
      <button class="fqa-btn fqa-save" id="fqSaveBtn">
        <span class="fqa-ic">${ic("save", 16)}</span>
        <span>حفظ</span>
      </button>
      <button class="fqa-btn fqa-fb-refresh" id="fbRefreshBtn">
        <span>${ic("refresh", 16)} تحديث</span>
      </button>
      <button class="fqa-btn fqa-delete" id="fqDeleteBtn">
        <span class="fqa-ic">${ic("trash", 16)}</span>
        <span>حذف</span>
      </button>
    </div>
  </div>

  </div><!-- /sb-list -->
</div>

<!-- ═══ شريط التبويبات في الأسفل — ثابت ═══ -->`;
}

/** الجزء 8 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart8(ic) {
  return `
<div class="tabs-bar tabs-bottom">
  <!-- زر القائمة الجانبية كأول تبويب -->
  <button class="tab-btn tab-side" id="sbt">
    <span class="tab-ic">${ic("menu", 20)}</span>
    <span class="tab-lb">القائمة</span>
    <span class="badge" id="sbbadge"></span>
  </button>
  <button class="tab-btn tab-active" id="pdfTab">
    <span class="tab-ic">${ic("fileText", 20)}</span>
    <span class="tab-lb">جداول</span>
  </button>
  <button class="tab-btn" id="liveTab">
    <span class="tab-ic">${ic("clock", 20)}</span>
    <span class="tab-lb">كايا</span>
  </button>
  <button class="tab-btn" id="t4Tab">
    <span class="tab-ic">${ic("users", 20)}</span>
    <span class="tab-lb">T4</span>
  </button>
  <button class="tab-btn" id="jedTab">
    <span class="tab-ic">${ic("plane", 20)}</span>
    <span class="tab-lb">LIVE FLT</span>
  </button>
  <button class="tab-btn" id="alTab">
    <span class="tab-ic">${ic("plane", 20)}</span>
    <span class="tab-lb">ناقلين</span>
  </button>
  <button class="tab-btn" id="guideTab">
    <span class="tab-ic">${ic("bookOpen", 20)}</span>
    <span class="tab-lb">دليل</span>
  </button>
  <button class="tab-btn" id="dbTab">
    <span class="tab-ic">${ic("database", 20)}</span>
    <span class="tab-lb">القاعدة</span>
  </button>
  <button class="tab-btn" id="notifTab">
    <span class="tab-ic">${ic("bell", 20)}</span>
    <span class="tab-lb">إشعارات</span>
  </button>
  <button class="tab-btn" id="profileTab">
    <span class="tab-ic">${ic("user", 20)}</span>
    <span class="tab-lb">ملفي</span>
  </button>
  <button class="tab-btn" id="regTab">
    <span class="tab-ic">${ic("clipboardList", 20)}</span>`;
}

/** الجزء 9 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart9(ic) {
  return `
    <span class="tab-lb">تسجيل</span>
  </button>
  <button class="tab-btn" id="statsTab">
    <span class="tab-ic">${ic("barChart", 20)}</span>
    <span class="tab-lb">إحصائيات</span>
  </button>
  <button class="tab-btn" id="monTab">
    <span class="tab-ic">${ic("barChart", 20)}</span>
    <span class="tab-lb">الرصد</span>
  </button>
</div>

<!-- حاوية التوست -->
<div id="toastMount"></div>
<!-- شريط ما لم يصل إلى القاعدة بعد — عنصر عامّ كالتوست، يظهر في كل التيوبات -->
<div id="queueMount"></div>
<div id="editFlightMount"></div>

<!-- modal تأكيد بديل confirm (نسخة واحدة فقط) -->
<div id="fqConfirmOverlay" class="ef-overlay">
  <div class="ef-modal" style="max-width:380px">
    <div class="ef-hdr"><span id="fqConfirmTitle">تأكيد</span></div>
    <div class="ef-body" style="padding:20px;text-align:center">
      <div id="fqConfirmBody" style="font-size:14px;line-height:1.8"></div>
    </div>
    <div class="ef-foot">
      <button class="ef-btn ef-cancel" id="fqConfirmNo">إلغاء</button>
      <button class="ef-btn ef-save" id="fqConfirmYes">موافق</button>
    </div>
  </div>
</div>

<!-- modal إدخال بديل prompt (نسخة واحدة فقط) -->
<div id="fqPromptOverlay" class="ef-overlay">
  <div class="ef-modal" style="max-width:380px">
    <div class="ef-hdr"><span id="fqPromptTitle">إدخال</span></div>
    <div class="ef-body" style="padding:20px">
      <div id="fqPromptBody" style="font-size:13px;margin-bottom:10px"></div>
      <input type="text" id="fqPromptInput" class="reg-input" style="border-bottom-color:#2563eb">
    </div>
    <div class="ef-foot">
      <button class="ef-btn ef-cancel" id="fqPromptNo">إلغاء</button>
      <button class="ef-btn ef-save" id="fqPromptYes">موافق</button>
    </div>
  </div>`;
}

/** الجزء 10 من 10 من نصّ `getHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHtmlPart10() {
  return `
</div>

`;
}

module.exports = Object.freeze({ getHtml });
