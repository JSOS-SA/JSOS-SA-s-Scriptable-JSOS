// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: users;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_wl_html.js

/**
 * @module fq_wl_html
 * @description المسؤولية الواحدة: بنية نموذج T4 في الصفحة. لا منطق ولا
 * أنماط — المعرّفات هنا هي العقد بين البنية وبقية وحدات النموذج.
 *
 * **كتلتان يُصدرهما هذا الملف، ويضعهما `fq_t4_html` في موضعيهما:**
 *
 * ١) `getWlSectionHtml` — قسم المخرجات والمحرّر، **داخل** `#t4Panel` تحت
 *    قسم نموذج F. قرار المستخدم ٢٠٢٦-٠٩-٢٦: «كل نموذج مستقل في قسم داخل
 *    تيوب T4»، فلكلٍّ عنوانه وعدّاده وصندوقه وزرّا «تعديل» و«جديد».
 *
 * ٢) `getWlOuterHtml` — العلامة العائمة والنافذة، **خارج** اللوحة: تظهران
 *    في كل التيوبات كعلامة F تمامًا (طلب المستخدم: «بجانب علامة F عائمة»).
 *
 * والنافذة تستعمل **مكوّن النوافذ نفسه** `.ef-*` الذي تستعمله نافذة نموذج
 * F ونافذتا التأكيد والإدخال، وتحمل الصنف `t4-mov` نفسه. فلا نافذة خامسة
 * في المشروع، والفرقان اللذان يحملهما الصنف يخدمان النافذتين معًا.
 *
 * وكل حقل يحمل اسمه كما سمّاه المستخدم (DOF، FLT NO، STD، DEST، PAX،
 * STS) وتحته معناه بالعربية، فالموظف يرى الاسم الذي يخرج في النص والمعنى
 * الذي يعمل به في وقت واحد. وأزرار الحالة تحمل معناها في `aria-label`
 * ليقرأه قارئ الشاشة، فالرمز وحده لا يكفي من لا يراه.
 *
 * **ترتيب النافذة** (اختيار المستخدم ٢٠٢٦-٠٩-٢٦، لتقليل الفراغ): التاريخ
 * منفردًا، ثم رقم الرحلة بجانب الوقت، ثم الوجهة بجانب العدد، ثم الحالات،
 * ثم «نسخ» بجانب «إرسال إلى واتساب». والاسم فوق حقله لا بجانبه لأن نصف
 * العرض لا يتّسع لاسمٍ وحقل. والقائمة المنسدلة داخل زوج الرحلة والوقت
 * لتمتدّ بعرضه كلّه، فلا يُقطع اسم الوجهة.
 *
 * **وحقل `IND` أُضيف ٢٠٢٦-٠٩-٢٦ بإذن المستخدم** حين سُئل عن مصدر
 * `IND PAX` في المخرجات، فأجاب: «حقل جديد يُدخله الموظف». وهو **اختياري
 * وحده** من بين حقول النافذة: يُكتب مرّة واحدة لرحلة، والمخرجات تجمعه من
 * أسطرها، فالفارغ صفر. ولو كان لازمًا لَلزم الموظفَ تكرارُه على كل حافلة
 * فتضاعف المجموع. وموضعه **بعد** زوج الوجهة والعدد، فترتيب الحقول الذي
 * اختاره المستخدم باقٍ بحرفه ولم يُعَد ترتيبه.
 *
 * ولا منطق هنا: وحدة البنية نصٌّ، وما فيها من اختصارٍ للأيقونات نداءٌ
 * لوحدة الأيقونات لا قرار. وهو ما يحرسه فحص فصل المسؤوليات في
 * `tools/check-wl-form.js`.
 *
 * **أزرار الأفعال تحمل `fqa-btn`** — شكل أزرار تيوب القائمة نفسه بطلب
 * المستخدم ٢٠٢٦-٠٩-٢٦، وقاعدته في `fq_styles` وحدها فلا نسخة ثانية.
 * وفي كل زرٍّ عنصر `fqa-lb` يحمل اسمه وحده: الكتابةُ في الزر كلّه تمحو
 * أيقونته، فمن يغيّر الاسم يكتب في هذا العنصر عبر `t4BtnLabel`.
 *
 * **وزرّا «نسخ» و«إرسال إلى واتساب» في القسم أيضًا** (الطلب نفسه)،
 * بمُعرِّفين خاصّين بهما — `wlSecCopyBtn` و`wlSecWaBtn` — لأن مُعرِّف
 * النافذة لا يتكرّر في صفحة واحدة. والفعل واحد: `fq_wl_view` يربط
 * الأربعة بدالّتين لا بأربع.
 */

const wlIcons = importModule("fq_icons");

/**
 * يبني قسم مخرجات نموذج T4 داخل التيوب.
 * @returns {string} نص HTML
 */
function getWlSectionHtml() {
  const ic = (n) => wlIcons.buildIcon(n, { size: 16 });
  return `
  <div class="wl-sec">
    <div class="t4-out-hd">
      <span>مخرجات نموذج T4</span>
      <span class="t4-out-meta" id="wlMeta"></span>
      <button type="button" class="t4-refresh" id="wlRefreshBtn"
        aria-label="تحديث مخرجات نموذج T4">⟳</button>
    </div>
    <pre class="t4-out" id="wlOut"></pre>
    <div class="t4-editor" id="wlEditor" style="display:none">
      <div class="t4-editor-hd">تعديل المدخلات — غيّر ما تشاء ثم اضغط «تمّ»</div>
      <div id="wlEditorList"></div>
    </div>

    <div class="fq-actions-bar on t4-out-btns">
      <button type="button" class="fqa-btn t4a-edit" id="wlEditBtn">
        <span class="fqa-ic">${ic("edit")}</span><span class="fqa-lb">تعديل</span>
      </button>
      <button type="button" class="fqa-btn t4a-new" id="wlNewBtn">
        <span class="fqa-ic">${ic("trash")}</span><span class="fqa-lb">جديد</span>
      </button>
      <button type="button" class="fqa-btn t4a-copy" id="wlSecCopyBtn">
        <span class="fqa-ic">${ic("clipboard")}</span><span class="fqa-lb">نسخ</span>
      </button>
      <button type="button" class="fqa-btn t4a-wa" id="wlSecWaBtn">
        <span class="fqa-ic">${ic("send")}</span><span class="fqa-lb">إرسال إلى واتساب</span>
      </button>
    </div>
  </div>`;
}

/**
 * يبني نافذة نموذج T4 وعلامتها العائمة.
 * @returns {string} نص HTML
 */
function getWlOuterHtml() {
  const ic = wlIcons.buildIcon("clipboard", { size: 16 });
  const sendIc = wlIcons.buildIcon("send", { size: 16 });
  return getWlOuterHtmlPart1() +
    getWlOuterHtmlPart2(ic, sendIc);
}

/** الجزء 1 من 2 من نصّ `getWlOuterHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlOuterHtmlPart1() {
  return `
<button type="button" class="t4-fab wl-fab" id="wlFab"
  aria-label="فتح نموذج T4" aria-haspopup="dialog">T4</button>

<div class="ef-overlay t4-mov t4-form-win" id="wlModal">
  <div class="ef-modal" role="dialog" aria-modal="true" aria-labelledby="wlModalTitle">
    <div class="ef-hdr">
      <span id="wlModalTitle">T4 — تسجيل منطقة الاستقبال</span>
      <button type="button" class="ef-close" id="wlModalClose"
        aria-label="إغلاق النافذة">&times;</button>
    </div>
    <div class="ef-body">
      <div class="wl-cell wl-solo">
        <label class="t4-lb" for="wlDof">DOF<span class="wl-lb2">تاريخ الرحلة</span></label>
        <input type="date" id="wlDof" class="t4-in">
      </div>

      <div class="wl-pair t4-rel">
        <div class="wl-cell">
          <label class="t4-lb" for="wlFlt">FLT NO<span class="wl-lb2">رقم الرحلة</span></label>
          <input type="text" id="wlFlt" class="t4-in" autocomplete="off"
            placeholder="رقمان فأكثر…">
        </div>
        <div class="wl-cell">
          <label class="t4-lb" for="wlStd">STD<span class="wl-lb2">وقت الإقلاع المجدول</span></label>
          <input type="text" id="wlStd" class="t4-in" placeholder="تُملأ من الرحلة">
        </div>
        <div class="t4-dd" id="wlFltDd"></div>
      </div>

      <div class="wl-pair">
        <div class="wl-cell">
          <label class="t4-lb" for="wlDest">DEST<span class="wl-lb2">وجهة السفر</span></label>
          <input type="text" id="wlDest" class="t4-in" placeholder="تُملأ من الرحلة">
        </div>
        <div class="wl-cell">
          <label class="t4-lb" for="wlPax">PAX<span class="wl-lb2">عدد المسافرين في منطقة الاستقبال — اختياري</span></label>
          <input type="number" id="wlPax" class="t4-in" inputmode="numeric" min="0"
            placeholder="العدد">
        </div>
      </div>
`;
}

/** الجزء 2 من 2 من نصّ `getWlOuterHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlOuterHtmlPart2(ic, sendIc) {
  return `
      <div class="wl-cell wl-solo">
        <label class="t4-lb" for="wlInd">IND<span class="wl-lb2">عدد الأفراد — اختياري، يُكتب مرّة للرحلة</span></label>
        <input type="number" id="wlInd" class="t4-in" inputmode="numeric" min="0"
          placeholder="اتركه فارغًا إن لم يوجد">
      </div>

      <div class="wl-cell wl-solo">
        <span class="t4-lb">STS<span class="wl-lb2">الحالة</span></span>
        <div class="t4-st-group" id="wlStGroup">
          <button type="button" class="t4-st" data-st="APV" aria-label="تمت الموافقة بالتفريج">APV</button>
          <button type="button" class="t4-st" data-st="WL" aria-label="تسكين في منطقة الاستقبال">WL</button>
          <button type="button" class="t4-st" data-st="CNL" aria-label="الرحلة ملغاة">CNL</button>
          <button type="button" class="t4-st" data-st="HLD" aria-label="منطقة انتظار الحافلة">HLD</button>
          <button type="button" class="t4-st" data-st="ENR" aria-label="في الطريق من الفرز إلى الصالة">ENR</button>
          <button type="button" class="t4-st" data-st="HLD-WL" aria-label="انتظار في منطقة الاستقبال بعد استلام البوردنق">HLD-WL</button>
          <button type="button" class="t4-st" data-st="IND WL" aria-label="أفراد في منطقة الاستقبال">IND WL</button>
        </div>
      </div>

      <div class="fq-actions-bar on">
        <button type="button" class="fqa-btn t4a-copy" id="wlCopyBtn">
          <span class="fqa-ic">${ic}</span><span class="fqa-lb">نسخ</span>
        </button>
        <button type="button" class="fqa-btn t4a-wa" id="wlWaBtn">
          <span class="fqa-ic">${sendIc}</span><span class="fqa-lb">إرسال إلى واتساب</span>
        </button>
      </div>
    </div>
  </div>
</div>
`;
}

module.exports = Object.freeze({ getWlSectionHtml, getWlOuterHtml });
