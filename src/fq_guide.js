// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: book;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_guide.js

// ═══ HTML دليل التسجيل ═══
/**
 * يُرجع HTML دليل التسجيل.
 * @returns {string}
 */
function getGuideHtml() {
  return getGuideHtmlPart1() +
    getGuideHtmlPart2() +
    getGuideHtmlPart3() +
    getGuideHtmlPart4() +
    getGuideHtmlPart5() +
    getGuideHtmlPart6() +
    getGuideHtmlPart7() +
    getGuideHtmlPart8();
}

/** الجزء 1 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart1() {
  return `
<div id="guidePanel" style="display:none">
<div class="app">

<div class="hd">
  <p>دليل تسجيل بيانات الحافلات — خطوة بخطوة</p>
</div>

<!-- أزرار التعديل والحفظ -->
<div class="gd-toolbar" id="gdToolbar">
  <button class="gd-tb-btn gd-tb-edit" id="gdEditBtn">
    <span>✏️</span> تعديل النص
  </button>
  <button class="gd-tb-btn gd-tb-save" id="gdSaveBtn" style="display:none">
    <span>💾</span> حفظ التعديل
  </button>
  <button class="gd-tb-btn gd-tb-cancel" id="gdCancelBtn" style="display:none">
    <span>✕</span> إلغاء
  </button>
  <button class="gd-tb-btn gd-tb-export" id="gdExportBtn">
    <span>📤</span> تصدير HTML
  </button>
</div>
<div class="gd-toast" id="gdToast"></div>

<!-- محتوى الدليل القابل للتعديل -->
<div id="gdContent">

<!-- ═══ القسم 1: التحقق ═══ -->
<div class="gd-section">  <div class="gd-sec-title">
    <span class="gd-sec-ic">🚌</span>
    أول ما توصل الحافلة: تحقّق من 4 أشياء
  </div>

  <div class="gd-alert gd-alert-warn">
    <strong>⚠️ مهم:</strong> اطلب تذكرة السفر من المندوب أو السائق، ثم تأكّد من الأشياء الأربعة التالية قبل ما تبدأ تسجّل.
  </div>

  <!-- 1 التاريخ -->
  <div class="gd-sub">الشيء الأول: التاريخ في التذكرة</div>
  <div class="gd-text">تأكّد أن تاريخ التذكرة يطابق تاريخ اليوم ويطابق جدول بن لادن أو قروب الواتساب.</div>
`;
}

/** الجزء 2 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart2() {
  return `
  <div class="gd-night">
    <div class="gd-night-hd">🌙 في نوبة الليل (B أو C) انتبه للتالي:</div>
    <div class="gd-night-row">
      <span>قبل الساعة ١٢ ليلًا</span>
      <span class="gd-arrow">←</span>
      <span>التاريخ = <strong>اليوم</strong></span>
    </div>
    <div class="gd-night-row">
      <span>بعد الساعة ١٢ ليلًا</span>
      <span class="gd-arrow">←</span>
      <span>التاريخ = <strong>غدًا</strong></span>
    </div>
  </div>

  <!-- 2 الوجهة -->
  <div class="gd-sub">الشيء الثاني: الوجهة</div>
  <div class="gd-text">يجب أن تكون التذكرة مكتوبًا فيها السفر من مدينة جدة إلى الدولة التي سيسافر إليها الركاب.</div>
  <div class="gd-action-stop">🛑 إذا لم يكن مكتوبًا "جدة" كمدينة المغادرة ← أوقف الحافلة ونسّق مع المشرف فورًا.</div>

  <!-- 3 وقت الإقلاع -->
  <div class="gd-sub">الشيء الثالث: وقت الإقلاع</div>
  <div class="gd-text">تأكّد أن وقت الإقلاع في التذكرة يطابق الوقت المسجّل في جدول بن لادن أو في قروب الواتساب.</div>

  <!-- 4 رقم الرحلة -->
  <div class="gd-sub">الشيء الرابع: رقم الرحلة</div>
  <div class="gd-text">تأكّد أن رقم الرحلة المكتوب في التذكرة موجود في جدول بن لادن أو أرسلناه في قروب الواتساب.</div>
  <div class="gd-action-stop">🛑 إذا الرحلة غير موجودة في جدول بن لادن أو قروب الواتساب ← أوقف الحافلة ونسّق مع المشرف.</div>

  <!-- مخطط قرار التحقق -->
  <div class="gd-flow">
    <div class="gd-flow-title">🔍 هل أبدأ التسجيل؟</div>
    <div class="gd-flow-q">هل البيانات الأربعة صحيحة؟<br><span class="gd-flow-hint">(التاريخ + الوجهة + وقت الإقلاع + رقم الرحلة)</span></div>
    <div class="gd-flow-split">
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-ok">✅ نعم</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-ok">✅ ابدأ التسجيل</div>
      </div>
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-stop">❌ لا</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-stop">🛑 أوقف ونسّق</div>
      </div>
    </div>
  </div>`;
}

/** الجزء 3 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart3() {
  return `
</div>

<!-- ═══ القسم 2: التسجيل ═══ -->
<div class="gd-section">
  <div class="gd-sec-title">
    <span class="gd-sec-ic">📝</span>
    ابدأ التسجيل بالترتيب
  </div>

  <div class="gd-step"><span class="gd-num">١</span><div><strong>رقم الرحلة:</strong> سجّل رقم الرحلة المكتوب في التذكرة والمطابق لجدول بن لادن وقروب الواتساب.</div></div>
  <div class="gd-step"><span class="gd-num">٢</span><div><strong>وقت الإقلاع:</strong> سجّله كما هو مكتوب في جدول بن لادن أو كما نُشر في قروب الواتساب.</div></div>
  <div class="gd-step"><span class="gd-num">٣</span><div><strong>عدد الركاب:</strong> اسأل المندوب أو السائق عن عدد الركاب، طابق العدد مع نظام نُسك، سجّل العدد بعد المطابقة.</div></div>
  <div class="gd-step"><span class="gd-num">٤</span><div><strong>الوجهة:</strong> سجّلها كما هي مكتوبة في التذكرة (مثال: باكستان، تركيا، أو أي دولة أخرى).</div></div>
  <div class="gd-step"><span class="gd-num">٥</span><div><strong>الفيزا:</strong> سجّل نوع الفيزا كما هو مكتوب فيها: عمرة أو سياحة.</div></div>
  <div class="gd-step"><span class="gd-num">٦</span><div><strong>الحملة:</strong> سجّل اسم الحملة كما هو مكتوب في الفيزا، وطابق اسم الحملة مع نظام نُسك.</div></div>
</div>

<!-- ═══ القسم 3: الحالة ═══ -->
<div class="gd-section">
  <div class="gd-sec-title">
    <span class="gd-sec-ic">📊</span>
    سابعًا: الحالة
  </div>

  <div class="gd-card gd-card-ok">
    <div class="gd-card-hd">✅ ١. مجدولة</div>
    <div class="gd-card-bd">يعني الرحلة موجودة ومسجّلة في جدول بن لادن أو قروب الواتساب.</div>
    <div class="gd-card-act gd-bg-ok">← سجّلها "مجدولة"</div>
  </div>

  <div class="gd-card gd-card-stop">
    <div class="gd-card-hd">❌ ٢. لا يوجد رحلة</div>
    <div class="gd-card-bd">يعني الركاب وصلوا إلى الفرز ومعهم تذكرة سفر أو رسالة أو ما عندهم شيء، لكن لا توجد لهم رحلة سوف تغادر من صالة الحج (مثال: حافلات نيجيريا أحيانًا توصل وما لهم رحلة).</div>
    <div class="gd-card-act gd-bg-stop">← سجّلها "لا يوجد رحلة" + لا تسمح بالدخول + نسّق مع المشرف</div>
  </div>

  <div class="gd-card gd-card-stop">
    <div class="gd-card-hd">🚫 ٣. ملغية</div>
    <div class="gd-card-bd">يعني الركاب وصلوا الفرز ومعهم تذاكر سفر صحيحة، لكن الرحلة نفسها ملغية حتى لو مسجّلة في جدول بن لادن أو الواتساب.</div>
    <div class="gd-card-act gd-bg-stop">← سجّلها "ملغية" + لا تسمح بالدخول + نسّق مع المشرف</div>
  </div>
`;
}

/** الجزء 4 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart4() {
  return `
  <div class="gd-card gd-card-stop">
    <div class="gd-card-hd">✈️ ٤. غادرت</div>
    <div class="gd-card-bd">يعني الحافلة وصلت متأخرة جدًّا وتكون الطائرة غادرت أو الكاونتر أُغلق.</div>
    <div class="gd-card-act gd-bg-stop">← سجّلها "غادرت" + لا تسمح بالدخول + نسّق مع المشرف</div>
  </div>

  <div class="gd-card gd-card-warn">
    <div class="gd-card-hd">🔄 ٥. مُعاد جدولتها</div>
    <div class="gd-card-bd">يعني الركاب وصلوا ومعهم تذاكر، لكن شركة الطيران غيّرت موعد الإقلاع أو رقم الرحلة.</div>
    <div class="gd-card-act gd-bg-warn">← سجّلها "معاد جدولتها" + نسّق مع المشرف</div>
  </div>

  <!-- مخطط الحالة -->
  <div class="gd-flow">
    <div class="gd-flow-title">🔍 مخطط قرار: الحالة</div>
    <div class="gd-flow-q">هل الرحلة موجودة في الجدول أو الواتساب؟</div>
    <div class="gd-flow-split">
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-stop">❌ لا</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-stop">🛑 "لا يوجد رحلة"<br>لا تسمح + نسّق</div>
      </div>
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-ok">✅ نعم</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-q" style="font-size:.75rem;padding:8px">ملغية؟ غادرت؟ تغيّر موعدها؟</div>
        <div class="gd-flow-split" style="margin-top:4px">
          <div class="gd-flow-branch">
            <div class="gd-flow-label gd-c-ok" style="font-size:.7rem">لا، تمام</div>
            <div class="gd-flow-arr">⬇</div>
            <div class="gd-flow-res gd-flow-ok">✅ "مجدولة"</div>
          </div>
          <div class="gd-flow-branch">
            <div class="gd-flow-label gd-c-stop" style="font-size:.7rem">نعم، مشكلة</div>
            <div class="gd-flow-arr">⬇</div>
            <div class="gd-flow-res gd-flow-stop">🛑 سجّل + نسّق</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ القسم 4: التفويج ═══ -->`;
}

/** الجزء 5 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart5() {
  return `
<div class="gd-section">
  <div class="gd-sec-title">
    <span class="gd-sec-ic">⏱️</span>
    ثامنًا: التفويج
  </div>

  <!-- شريط الوقت -->
  <div class="gd-timebar">
    <div class="gd-tz gd-tz-stop2">
      <strong>مبكر</strong>
      <span class="gd-tz-sub">٨+ ساعة</span>
      <span>🛑</span>
    </div>
    <div class="gd-tz gd-tz-ok">
      <strong>في الموعد</strong>
      <span class="gd-tz-sub">٤ - ٨ ساعات</span>
      <span>✅</span>
    </div>
    <div class="gd-tz gd-tz-warn">
      <strong>متأخر</strong>
      <span class="gd-tz-sub">٢ - ٤ ساعات</span>
      <span>⚠️</span>
    </div>
    <div class="gd-tz gd-tz-stop">
      <strong>خطر</strong>
      <span class="gd-tz-sub">أقل من ٢</span>
      <span>🛑</span>
    </div>
  </div>

  <div class="gd-card gd-card-stop">
    <div class="gd-card-hd">🛑 ١. مبكر (٨ ساعات أو أكثر)</div>
    <div class="gd-card-act gd-bg-stop">← أوقف الحافلة + لا تسمح بالدخول + نسّق مع المشرف</div>
  </div>

  <div class="gd-card gd-card-ok">
    <div class="gd-card-hd">✅ ٢. في الموعد (من ٤ إلى ٨ ساعات)</div>
    <div class="gd-card-bd">إذا الرحلة مسجّلة في جدول بن لادن أو قروب الواتساب ولا توجد أي ملاحظة عليها.</div>
    <div class="gd-card-act gd-bg-ok">← اسمح لهم بالدخول</div>
  </div>
`;
}

/** الجزء 6 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart6() {
  return `
  <div class="gd-card gd-card-warn">
    <div class="gd-card-hd">⚠️ ٣. متأخر</div>
    <div class="gd-card-act gd-bg-warn" style="margin-bottom:4px">من ٤ ساعات إلى ساعتين ← سجّله "متأخر" واسمح بالدخول</div>
    <div class="gd-card-act gd-bg-stop">أقل من ساعتين ← 🛑 أوقفه ولا تسمح بالدخول ونسّق مع المشرف</div>
  </div>

  <div class="gd-card gd-card-info">
    <div class="gd-card-hd">🔀 ٤. مشترك</div>
    <div class="gd-card-bd">يعني الحافلة فيها ركاب لأكثر من رحلة واحدة. ← إذا فيه رحلة على صالة غير صالة الحج، نسّق مع المشرفين قبل دخول الحافلة.</div>
  </div>

  <div class="gd-card gd-card-stop">
    <div class="gd-card-hd">⛔ ٥. خاطئ</div>
    <div class="gd-card-bd">صالة السفر الصحيحة هي صالة الحج. أما الصالة الخطأ فهي الصالة الشمالية وصالة ١. إذا التذكرة على صالة غير الحج وما فيه رحلة مشتركة على صالة الحج.</div>
    <div class="gd-card-act gd-bg-stop">← لا تسمح بالدخول + نسّق مع المشرف</div>
  </div>

  <!-- مخطط التفويج -->
  <div class="gd-flow">
    <div class="gd-flow-title">🔍 مخطط قرار: التفويج</div>
    <div class="gd-flow-q">كم الوقت المتبقي على الرحلة؟</div>
    <div class="gd-flow-arr">⬇</div>
    <div class="gd-flow-grid4">
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-stop" style="font-size:.7rem">٨+ ساعة</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-stop">🛑 أوقف</div>
      </div>
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-ok" style="font-size:.7rem">٤-٨ ساعات</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-ok">✅ اسمح</div>
      </div>
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-warn" style="font-size:.7rem">٢-٤ ساعات</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-warn">⚠️ متأخر<br>واسمح</div>
      </div>
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-stop" style="font-size:.7rem">أقل من ٢</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-stop">🛑 أوقف</div>
      </div>
    </div>
  </div>`;
}

/** الجزء 7 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart7() {
  return `
</div>

<!-- ═══ القسم 5: الكشف ═══ -->
<div class="gd-section">
  <div class="gd-sec-title">
    <span class="gd-sec-ic">📄</span>
    تاسعًا: الكشف
  </div>

  <div class="gd-text">اختر من القائمة التالية حسب صورة أو ورقة الكشف:</div>

  <div class="gd-alert gd-alert-info">
    <strong>📌 المعلومات الأربع التي تطابقها:</strong>
  </div>

  <div class="gd-match-grid">
    <div class="gd-match-item">عدد الركاب</div>
    <div class="gd-match-item">رقم الرحلة</div>
    <div class="gd-match-item">وقت الإقلاع</div>
    <div class="gd-match-item">اسم الحملة</div>
  </div>

  <div class="gd-text" style="font-size:.75rem;opacity:.7;text-align:center">طابق بين صورة ورقة التفويج من السائق والبيانات التي راح تسجّلها في قروب الواتساب</div>

  <div class="gd-card gd-card-ok">
    <div class="gd-card-hd">✅ ١. مطابق</div>
    <div class="gd-card-bd">يعني المعلومات الأربع كلها متطابقة بين صورة ورقة التفويج من السائق والبيانات التي راح تسجّلها في قروب الواتساب. إذا الأربعة صحيحة ← سجّله "مطابق".</div>
  </div>

  <div class="gd-card gd-card-stop">
    <div class="gd-card-hd">❌ ٢. غير مطابق</div>
    <div class="gd-card-bd">إذا اختلفت ولو معلومة واحدة فقط من الأربع ← سجّله "غير مطابق".</div>
  </div>

  <div class="gd-card gd-card-warn">
    <div class="gd-card-hd">📭 ٣. لا يوجد</div>
    <div class="gd-card-bd">لا يوجد ورقة أو صورة تفويج لهذه الحافلة مع السائق أو المندوب ← سجّله "لا يوجد".</div>
  </div>
`;
}

/** الجزء 8 من 8 من نصّ `getGuideHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideHtmlPart8() {
  return `
  <!-- مخطط الكشف -->
  <div class="gd-flow">
    <div class="gd-flow-title">🔍 مخطط قرار: الكشف</div>
    <div class="gd-flow-q">هل يوجد ورقة أو صورة تفويج؟</div>
    <div class="gd-flow-split">
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-warn">❌ لا</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-res gd-flow-warn">📭 "لا يوجد"</div>
      </div>
      <div class="gd-flow-branch">
        <div class="gd-flow-label gd-c-ok">✅ نعم</div>
        <div class="gd-flow-arr">⬇</div>
        <div class="gd-flow-q" style="font-size:.75rem;padding:8px">الأربع معلومات متطابقة؟</div>
        <div class="gd-flow-split" style="margin-top:4px">
          <div class="gd-flow-branch">
            <div class="gd-flow-label gd-c-ok" style="font-size:.7rem">✅ كلها</div>
            <div class="gd-flow-arr">⬇</div>
            <div class="gd-flow-res gd-flow-ok">✅ "مطابق"</div>
          </div>
          <div class="gd-flow-branch">
            <div class="gd-flow-label gd-c-stop" style="font-size:.7rem">❌ ولو واحدة</div>
            <div class="gd-flow-arr">⬇</div>
            <div class="gd-flow-res gd-flow-stop">❌ "غير مطابق"</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ملاحظة ختامية -->
  <div class="gd-alert gd-alert-ok" style="margin-top:16px">
    <strong>💡 تذكّر:</strong> إذا شكّيت في أي معلومة ← لا تتردد وتواصل مع المشرف فورًا. الخطأ في التسجيل أصعب من السؤال قبل التسجيل.
  </div>

</div>

</div><!-- إغلاق gdContent -->

</div>
</div>`;
}

// ═══ CSS دليل التسجيل ═══
/**
 * يُرجع CSS دليل التسجيل.
 * @returns {string}
 */
function getGuideStyles() {
  return getGuideStylesPart1() +
    getGuideStylesPart2() +
    getGuideStylesPart3() +
    getGuideStylesPart4() +
    getGuideStylesPart5() +
    getGuideStylesPart6();
}

/** الجزء 1 من 6 من نصّ `getGuideStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideStylesPart1() {
  return `
/* ═══ دليل التسجيل ═══ */

/* شريط الأدوات */
.gd-toolbar{
  display:flex;gap:8px;margin-bottom:12px;
}
.gd-tb-btn{
  flex:1;padding:10px 8px;border-radius:var(--r);
  border:1px solid var(--bd);background:var(--s1);
  color:var(--t2);font-size:.82rem;font-weight:600;
  font-family:'Tajawal',sans-serif;cursor:pointer;
  transition:all .2s;display:flex;align-items:center;
  justify-content:center;gap:6px;
}
.gd-tb-btn:active{transform:scale(.96)}
.gd-tb-edit{border-color:rgba(59,130,246,0.4);color:#2563eb}
.gd-tb-save{border-color:rgba(70,211,105,0.4);color:var(--ok)}
.gd-tb-cancel{border-color:rgba(229,9,20,0.05);color:var(--ac)}
.gd-tb-export{border-color:rgba(70,211,105,0.4);color:var(--ok)}

/* وضع التعديل */
.gd-editing .gd-toolbar{
  position:sticky;top:80px;z-index:10;
  background:rgba(0,0,0,0.9);
  padding:8px 0;margin:-8px 0 12px;
  -webkit-backdrop-filter:blur(12px);
  backdrop-filter:blur(12px);
}
.gd-editing [contenteditable="true"]{
  outline:1px dashed rgba(59,130,246,0.4);
  outline-offset:2px;border-radius:2px;
  min-height:1.5em;
}
.gd-editing [contenteditable="true"]:focus{
  outline:2px solid #2563eb;
  background:rgba(59,130,246,0.05);
}
`;
}

/** الجزء 2 من 6 من نصّ `getGuideStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideStylesPart2() {
  return `
/* رسالة تأكيد */
.gd-toast{
  position:fixed;bottom:calc(20px + var(--sab));
  left:50%;transform:translateX(-50%) translateY(80px);
  background:var(--ok);color:#fafafa;
  padding:12px 24px;border-radius:8px;
  font-size:.85rem;font-weight:700;
  z-index:100;opacity:0;
  transition:all .3s ease;
  pointer-events:none;
}
.gd-toast.show{
  opacity:1;transform:translateX(-50%) translateY(0);
}

.gd-section{margin-bottom:20px}

.gd-sec-title{
  display:flex;align-items:center;gap:8px;
  background:var(--ac);color:#fff;
  padding:10px 14px;border-radius:var(--r);
  font-size:.92rem;font-weight:700;
  margin-bottom:12px;
}
.gd-sec-ic{font-size:1.1rem}

.gd-sub{
  font-size:.88rem;font-weight:700;color:var(--tx);
  padding:8px 0 4px;margin:8px 0 4px;
  border-right:3px solid var(--ac);
  padding-right:10px;
}

.gd-text{
  font-size:.82rem;color:var(--t2);
  padding:4px 0;line-height:1.8;
}

/* صندوق نوبة الليل */
.gd-night{
  background:#f0f0fb;border-radius:var(--r);
  padding:12px 14px;margin:8px 0;
}`;
}

/** الجزء 3 من 6 من نصّ `getGuideStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideStylesPart3() {
  return `
.gd-night-hd{
  font-weight:700;font-size:.82rem;
  color:var(--am);margin-bottom:8px;
}
.gd-night-row{
  display:flex;align-items:center;gap:8px;
  padding:4px 0;font-size:.8rem;color:#1a1a1a;
}
.gd-arrow{color:var(--am);font-weight:800;font-size:1.1rem}

/* إجراء أوقف */
.gd-action-stop{
  background:rgba(229,9,20,0.06);
  border:1px solid var(--ac);
  border-radius:var(--r);
  padding:10px 12px;margin:6px 0;
  font-size:.82rem;font-weight:600;
  color:var(--ac);
}

/* تنبيهات */
.gd-alert{
  border-radius:var(--r);
  padding:10px 14px;margin:8px 0;
  font-size:.82rem;line-height:1.8;
}
.gd-alert-warn{background:rgba(245,197,24,0.1);border:1px solid var(--am);color:var(--am)}
.gd-alert-info{background:rgba(59,130,246,0.1);border:1px solid #2563eb;color:#2563eb}
.gd-alert-ok{background:rgba(22,163,74,0.08);border:1px solid var(--ok);color:var(--ok)}

/* خطوات التسجيل */
.gd-step{
  display:flex;align-items:flex-start;gap:10px;
  background:var(--s1);border:1px solid var(--bd);
  border-radius:var(--r);padding:10px 12px;
  margin-bottom:6px;font-size:.82rem;
  line-height:1.7;
}
.gd-num{
  background:var(--ac);color:#fff;
  min-width:24px;height:24px;
  border-radius:50%;display:flex;
  align-items:center;justify-content:center;
  font-size:.75rem;font-weight:700;flex-shrink:0;`;
}

/** الجزء 4 من 6 من نصّ `getGuideStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideStylesPart4() {
  return `
}

/* بطاقات الحالة */
.gd-card{
  border-radius:var(--r);
  padding:12px 14px;margin-bottom:8px;
  border:1px solid;
}
.gd-card-hd{font-size:.88rem;font-weight:700;margin-bottom:4px}
.gd-card-bd{font-size:.8rem;line-height:1.8;opacity:.85}
.gd-card-act{
  margin-top:6px;padding:8px 10px;
  border-radius:var(--r);
  font-size:.8rem;font-weight:700;
}

.gd-card-ok{background:rgba(70,211,105,0.08);border-color:rgba(22,163,74,0.15)}
.gd-card-ok .gd-card-hd{color:var(--ok)}

.gd-card-stop{background:rgba(229,9,20,0.05);border-color:rgba(229,9,20,0.05)}
.gd-card-stop .gd-card-hd{color:var(--ac)}

.gd-card-warn{background:rgba(245,197,24,0.08);border-color:rgba(245,197,24,0.3)}
.gd-card-warn .gd-card-hd{color:var(--am)}

.gd-card-info{background:rgba(59,130,246,0.08);border-color:rgba(59,130,246,0.3)}
.gd-card-info .gd-card-hd{color:#2563eb}

.gd-bg-ok{background:var(--ok);color:#fafafa}
.gd-bg-stop{background:var(--ac);color:#fff}
.gd-bg-warn{background:var(--am);color:#fafafa}

/* شريط الوقت */
.gd-timebar{
  display:grid;grid-template-columns:repeat(4,1fr);
  gap:4px;margin:12px 0;
  font-size:.72rem;font-weight:700;text-align:center;
}
.gd-tz{
  padding:10px 4px;border-radius:var(--r);
  display:flex;flex-direction:column;
  align-items:center;gap:2px;
}
.gd-tz-sub{font-size:.65rem;font-weight:400;opacity:.8}
.gd-tz-stop{background:rgba(229,9,20,0.05);color:var(--ac);border:1px solid rgba(229,9,20,0.05)}`;
}

/** الجزء 5 من 6 من نصّ `getGuideStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideStylesPart5() {
  return `
.gd-tz-stop2{background:rgba(229,9,20,0.25);color:var(--ac);border:1px solid rgba(229,9,20,0.05)}
.gd-tz-ok{background:rgba(70,211,105,0.12);color:var(--ok);border:1px solid rgba(22,163,74,0.15)}
.gd-tz-warn{background:rgba(245,197,24,0.12);color:var(--am);border:1px solid rgba(245,197,24,0.3)}

/* المطابقة */
.gd-match-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:6px;margin:8px 0;
}
.gd-match-item{
  background:rgba(59,130,246,0.1);
  border:1px solid rgba(59,130,246,0.3);
  border-radius:var(--r);padding:8px;
  text-align:center;font-size:.8rem;
  font-weight:700;color:#2563eb;
}

/* مخططات القرار */
.gd-flow{
  background:var(--s1);border:1px solid var(--bd);
  border-radius:var(--r);padding:14px;
  margin:12px 0;
}
.gd-flow-title{
  text-align:center;font-size:.88rem;
  font-weight:700;color:var(--ac);
  padding-bottom:10px;margin-bottom:10px;
  border-bottom:1px dashed var(--bd);
}
.gd-flow-q{
  background:rgba(245,197,24,0.1);
  border:1px solid rgba(245,197,24,0.3);
  border-radius:var(--r);
  padding:10px 12px;text-align:center;
  font-size:.82rem;font-weight:700;
  color:var(--am);margin-bottom:4px;
}
.gd-flow-hint{font-size:.7rem;font-weight:400;opacity:.7}
.gd-flow-arr{text-align:center;font-size:1.2rem;color:var(--t2);padding:2px 0}
.gd-flow-split{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.gd-flow-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.gd-flow-branch{text-align:center}
.gd-flow-label{font-size:.75rem;font-weight:600;padding:2px 0}
.gd-c-ok{color:var(--ok)}
.gd-c-stop{color:var(--ac)}`;
}

/** الجزء 6 من 6 من نصّ `getGuideStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideStylesPart6() {
  return `
.gd-c-warn{color:var(--am)}
.gd-flow-res{
  padding:8px 6px;border-radius:var(--r);
  font-size:.75rem;font-weight:700;
  line-height:1.5;
}
.gd-flow-ok{background:rgba(70,211,105,0.12);color:var(--ok);border:1px solid rgba(22,163,74,0.15)}
.gd-flow-stop{background:rgba(229,9,20,0.05);color:var(--ac);border:1px solid rgba(229,9,20,0.05)}
.gd-flow-warn{background:rgba(245,197,24,0.12);color:var(--am);border:1px solid rgba(245,197,24,0.3)}
`;
}

// ═══ كود جافاسكربت التبويب ═══
/**
 * يُرجع JavaScript دليل التسجيل.
 * @returns {string}
 */
function getGuideCode() {
  return getGuideCodePart1() +
    getGuideCodePart2() +
    getGuideCodePart3();
}

/** الجزء 1 من 3 من نصّ `getGuideCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideCodePart1() {
  return `
let guideTab=document.getElementById("guideTab");
let guidePanel=document.getElementById("guidePanel");
let gdContent=document.getElementById("gdContent");
let gdEditBtn=document.getElementById("gdEditBtn");
let gdSaveBtn=document.getElementById("gdSaveBtn");

// إخفاء أزرار التعديل والتصدير إذا الموظف لا يملك صلاحية
(function checkGuidePerms(){
  if (typeof can === "function" && !can("edit_guide")) {
    if (gdEditBtn) gdEditBtn.style.display = "none";
  }
  if (typeof can === "function" && !can("export_guide")) {
    const expBtn = document.getElementById("gdExportBtn");
    if (expBtn) expBtn.style.display = "none";
  }
})();
let gdCancelBtn=document.getElementById("gdCancelBtn");
let gdExportBtn=document.getElementById("gdExportBtn");
let gdToast=document.getElementById("gdToast");
let gdEditing=false;
let gdBackup="";

// ═══ تحميل المحتوى المحفوظ ═══
if(typeof SAVED_GUIDE==="string"&&SAVED_GUIDE.length>10&&gdContent){
  gdContent.innerHTML=SAVED_GUIDE;
}

// ═══ تبويب الدليل ═══
if(guideTab){guideTab.addEventListener("click",function(){
  if(typeof hideAllPanels==="function")hideAllPanels();
  guideTab.classList.add("tab-active");
  guidePanel.style.display="block";
})}
`;
}

/** الجزء 2 من 3 من نصّ `getGuideCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideCodePart2() {
  return `
// ═══ العناصر القابلة للتعديل ═══
const GD_EDITABLE=".gd-text,.gd-sub,.gd-card-hd,.gd-card-bd,.gd-card-act,"+
  ".gd-alert,.gd-night-hd,.gd-night-row span:first-child,"+
  ".gd-night-row span:last-child,.gd-action-stop,"+
  ".gd-sec-title,.gd-step>div,.gd-flow-title,.gd-flow-q,"+
  ".gd-flow-label,.gd-flow-res,.gd-match-item,.gd-tz,"+
  ".gd-flow-hint,.hd p";

function gdSetEditable(on){
  const els=gdContent.querySelectorAll(GD_EDITABLE);
  for(let i=0;i<els.length;i++){
    if(on){
      els[i].setAttribute("contenteditable","true");
    }else{
      els[i].removeAttribute("contenteditable");
    }
  }
}

// ═══ زر تعديل ═══
if(gdEditBtn){gdEditBtn.addEventListener("click",function(){
  gdEditing=true;
  gdBackup=gdContent.innerHTML;
  gdSetEditable(true);
  guidePanel.classList.add("gd-editing");
  gdEditBtn.style.display="none";
  gdSaveBtn.style.display="flex";
  gdCancelBtn.style.display="flex";
})}
`;
}

/** الجزء 3 من 3 من نصّ `getGuideCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getGuideCodePart3() {
  return `
// ═══ زر حفظ ═══
if(gdSaveBtn){gdSaveBtn.addEventListener("click",function(){
  gdSetEditable(false);
  guidePanel.classList.remove("gd-editing");
  gdEditing=false;
  gdEditBtn.style.display="flex";
  gdSaveBtn.style.display="none";
  gdCancelBtn.style.display="none";
  // تخزين المحتوى للحفظ عند الإغلاق
  window._FQ_GUIDE_HTML=gdContent.innerHTML;
  // رسالة تأكيد
  gdToast.textContent="✅ تم حفظ التعديل";
  gdToast.classList.add("show");
  setTimeout(function(){gdToast.classList.remove("show")},2000);
})}

// ═══ زر إلغاء ═══
if(gdCancelBtn){gdCancelBtn.addEventListener("click",function(){
  gdContent.innerHTML=gdBackup;
  gdSetEditable(false);
  guidePanel.classList.remove("gd-editing");
  gdEditing=false;
  gdEditBtn.style.display="flex";
  gdSaveBtn.style.display="none";
  gdCancelBtn.style.display="none";
  gdToast.textContent="↩️ تم إلغاء التعديل";
  gdToast.classList.add("show");
  setTimeout(function(){gdToast.classList.remove("show")},1500);
})}

// ═══ زر تصدير HTML ═══
if(gdExportBtn){gdExportBtn.addEventListener("click",function(){
  // حفظ أي تعديل حالي
  window._FQ_GUIDE_HTML=gdContent.innerHTML;
  // تعيين الإجراء
  window._FQ_ACTION="export_guide";
  // إظهار رسالة
  gdToast.textContent="📤 أغلق التطبيق لتصدير الملف";
  gdToast.classList.add("show");
  setTimeout(function(){gdToast.classList.remove("show")},2500);
})}
`;
}

module.exports = Object.freeze({ getGuideHtml, getGuideStyles, getGuideCode });
