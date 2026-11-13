// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: users;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_html.js

/**
 * @module fq_t4_html
 * @description المسؤولية الواحدة: بنية لوحة T4 في الصفحة. لا منطق ولا
 * أنماط — المعرّفات هنا هي العقد بين البنية وبقية وحدات T4.
 *
 * **ثلاث كتل مستقلة يُصدرها هذا الملف، ومواضعها مقصودة:**
 *
 * ١) `#t4Panel` — المخرجات والمحرّر. تُخفى بـ `display:none` عند
 *    الانتقال إلى تيوب آخر، كبقية اللوحات.
 *
 * ٢) `#t4Fab` — علامة الوصول السريع. **خارج اللوحة عمدًا**: طلب
 *    المستخدم ٢٠٢٦-٠٩-٢٤ أن تبقى ظاهرة في كل التيوبات، فلو وُضعت
 *    داخل اللوحة لاختفت معها. والفتحة `t4Slot` في `fq_html.js` على
 *    مستوى `body` مباشرةً، فما يخرج من هنا خارج الوسم يبقى عامًّا.
 *
 * ٣) `#t4Modal` — النافذة التي تحمل النموذج. خارج اللوحة للسبب نفسه:
 *    تُفتح من أي تيوب. وتستعمل **مكوّن النوافذ نفسه** `.ef-*` الذي
 *    تستعمله نافذتا `fqConfirm` و`fqPrompt` في `fq_html.js` — بطلب
 *    المستخدم ٢٠٢٦-٠٩-٢٤: «نفس حجم وموقع نافذة تأكيد الحذف». فلا
 *    نافذة رابعة في المشروع، والصنف `t4-mov` يحمل فرقين لا غير.
 *    والصنف `t4-form-win` معه يحمل شكل الحقول المشترك مع نافذة نموذج T4.
 *
 * ٤) **نموذج T4 (٢٠٢٦-٠٩-٢٦)** — قسمه ونافذته وعلامته من `fq_wl_html`،
 *    ويُوضعان هنا لأن موضعهما من هذه البنية: القسم **داخل** اللوحة تحت
 *    قسم نموذج F، والعلامة والنافذة **خارجها**. وفتحة `t4Slot` واحدة،
 *    فمن يملأها هو من يرتّب ما فيها.
 *
 * والنموذج داخل النافذة لا على الشاشة: بديل الرصيف المثبَّت الذي
 * أُلغي بطلب المستخدم لأنه كان ينزل مع السحب حين تظهر لوحة المفاتيح.
 *
 * **توزيع الأزرار الثلاثة بطلب المستخدم ٢٠٢٦-٠٩-٢٤**: «نسخ» يبقى في
 * النافذة لأنه يحفظ ما كُتب فيها ثم ينسخ. أما «تعديل» و«جديد» فتعملان
 * على المخرجات المحفوظة لا على النموذج، فمكانهما في اللوحة تحت
 * المخرجات مباشرةً.
 *
 * **قسم مخرجات نموذج F مطويّ** (طلب المستخدم ٢٠٢٦-٠٩-٢٦: «اجعله مخفيًّا،
 * وعند الضغط عليه يظهر… كي لا يأخذ مساحة بلا فائدة»). فالقسم كلّه في
 * `#t4Sec`، ورأسه `#t4SecHd` هو المفتاح، وجسمه `#t4SecBody`. والمطويّ هو
 * الأصل في الأنماط لا في الشيفرة: لو تعطّل الربط بقي مطويًّا كما طُلب.
 *
 * **وأزرار الأفعال تحمل `fqa-btn`** — شكل أزرار تيوب القائمة نفسه
 * (الطلب نفسه)، وفي كل زرٍّ عنصر `fqa-lb` يحمل اسمه وحده لأن الكتابة
 * في الزر كلّه تمحو أيقونته. ولونها عند النجاح والفشل من `fq_t4_button`.
 *
 * **المخرجات والمحرّر في الموضع نفسه، لا قسمان** (طلب المستخدم
 * ٢٠٢٦-٠٩-٢٤): `#t4Out` و`#t4Editor` متجاوران هنا وواحد منهما يظهر في
 * كل حالة، فيحلّ المحرّر محلّ النص بدل أن يُفتح قسم ثانٍ تحته تتكرّر
 * فيه الأسطر مرّتين. من يبدّل بينهما `fq_t4_view` — فهو صاحب القرار
 * لأنه يملك الزر والنص معًا.
 */

const icons = importModule("fq_icons");
const wlHtml = importModule("fq_wl_html");

/**
 * يبني بنية تيوب T4: قسما المخرجات والنافذتان والعلامتان العائمتان.
 * @returns {string} نص HTML
 */
function getT4Html() {
  const ic = (n, sz) => icons.buildIcon(n, { size: sz || 18 });
  return getT4HtmlPart1(ic) +
    getT4HtmlPart2() +
    getT4HtmlPart3(ic);
}

/** الجزء 1 من 3 من نصّ `getT4Html()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4HtmlPart1(ic) {
  return `
<div id="t4Panel" style="display:none">
<div class="app">
  <div class="hd"><p>T4 — أعداد الركاب وحالتهم</p></div>

  <div class="t4-sec" id="t4Sec">
    <div class="t4-out-hd t4-sec-hd" id="t4SecHd" role="button" tabindex="0"
      aria-controls="t4SecBody" aria-expanded="false">
      <span class="t4-sec-arrow">◂</span>
      <span>مخرجات نموذج F</span>
      <span class="t4-out-meta" id="t4Meta"></span>
      <button type="button" class="t4-refresh" id="t4RefreshBtn"
        aria-label="تحديث مخرجات نموذج F">⟳</button>
    </div>
    <div class="t4-sec-body" id="t4SecBody">
      <pre class="t4-out" id="t4Out"></pre>
      <div class="t4-editor" id="t4Editor" style="display:none">
        <div class="t4-editor-hd">تعديل المدخلات — غيّر ما تشاء ثم اضغط «تمّ»</div>
        <div id="t4EditorList"></div>
      </div>

      <div class="fq-actions-bar on t4-out-btns">
        <button type="button" class="fqa-btn t4a-edit" id="t4EditBtn">
          <span class="fqa-ic">${ic("edit", 16)}</span><span class="fqa-lb">تعديل</span>
        </button>
        <button type="button" class="fqa-btn t4a-new" id="t4NewBtn">
          <span class="fqa-ic">${ic("trash", 16)}</span><span class="fqa-lb">جديد</span>
        </button>
        <button type="button" class="fqa-btn t4a-copy" id="t4SecCopyBtn">
          <span class="fqa-ic">${ic("clipboard", 16)}</span><span class="fqa-lb">نسخ</span>
        </button>
        <button type="button" class="fqa-btn t4a-wa" id="t4SecWaBtn">
          <span class="fqa-ic">${ic("send", 16)}</span><span class="fqa-lb">إرسال إلى واتساب</span>
        </button>
      </div>
    </div>
  </div>
${wlHtml.getWlSectionHtml()}
</div>
</div>

<button type="button" class="t4-fab" id="t4Fab"
  aria-label="فتح نموذج T4" aria-haspopup="dialog">F</button>
`;
}

/** الجزء 2 من 3 من نصّ `getT4Html()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4HtmlPart2() {
  return `
<div class="ef-overlay t4-mov t4-form-win" id="t4Modal">
  <div class="ef-modal" role="dialog" aria-modal="true" aria-labelledby="t4ModalTitle">
    <div class="ef-hdr">
      <span id="t4ModalTitle">T4 — تسجيل أعداد الركاب</span>
      <button type="button" class="ef-close" id="t4ModalClose"
        aria-label="إغلاق النافذة">&times;</button>
    </div>
    <div class="ef-body">
      <div class="t4-row">
        <label class="t4-lb" for="t4Date">التاريخ</label>
        <input type="date" id="t4Date" class="t4-in">
      </div>

      <div class="t4-row t4-rel">
        <label class="t4-lb" for="t4Flt">رقم الرحلة</label>
        <input type="text" id="t4Flt" class="t4-in" autocomplete="off"
          placeholder="اكتب رقمين فأكثر…">
        <div class="t4-dd" id="t4FltDd"></div>
      </div>

      <div class="t4-row">
        <label class="t4-lb" for="t4Std">وقت الإقلاع</label>
        <input type="text" id="t4Std" class="t4-in" placeholder="تُملأ من الرحلة">
      </div>

      <div class="t4-row">
        <label class="t4-lb" for="t4New">الوقت الجديد</label>
        <input type="text" id="t4New" class="t4-in" placeholder="اتركه فارغًا إن لم تتأخّر">
      </div>

      <div class="t4-row">
        <label class="t4-lb" for="t4Dest">الوجهة</label>
        <input type="text" id="t4Dest" class="t4-in" placeholder="تُملأ من الرحلة">
      </div>

      <div class="t4-row">
        <label class="t4-lb" for="t4Pax">عدد الركاب</label>
        <input type="number" id="t4Pax" class="t4-in" inputmode="numeric" min="0"
          placeholder="اكتب العدد">
      </div>
`;
}

/** الجزء 3 من 3 من نصّ `getT4Html()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4HtmlPart3(ic) {
  return `
      <div class="t4-row">
        <span class="t4-lb">حالة الركاب</span>
        <div class="t4-st-group" id="t4StGroup">
          <button type="button" class="t4-st" data-st="red">🔴</button>
          <button type="button" class="t4-st" data-st="green">✅</button>
          <button type="button" class="t4-st" data-st="yellow">🟡</button>
          <button type="button" class="t4-st" data-st="x">❌</button>
        </div>
      </div>

      <div class="fq-actions-bar on">
        <button type="button" class="fqa-btn t4a-copy" id="t4CopyBtn">
          <span class="fqa-ic">${ic("clipboard", 16)}</span><span class="fqa-lb">نسخ</span>
        </button>
        <button type="button" class="fqa-btn t4a-wa" id="t4WaBtn">
          <span class="fqa-ic">${ic("send", 16)}</span><span class="fqa-lb">إرسال إلى واتساب</span>
        </button>
      </div>
    </div>
  </div>
</div>
${wlHtml.getWlOuterHtml()}
`;
}

module.exports = Object.freeze({ getT4Html });
