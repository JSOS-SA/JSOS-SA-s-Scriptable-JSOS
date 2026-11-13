// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: window-maximize;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_modal.js

/**
 * @module fq_t4_modal
 * @description المسؤولية الواحدة: فتح نافذة نموذج T4 وإغلاقها. لا تعرف
 * ما داخل النموذج ولا تحفظ ولا تنسخ.
 *
 * **لماذا وُجدت**: كان النموذج رصيفًا مثبَّتًا فوق الشريط السفلي، فكان
 * ينزل مع الإصبع حين تظهر لوحة المفاتيح (علّة WebKit ١٩١٢٠٤). أُلغي
 * الرصيف بطلب المستخدم ٢٠٢٦-٠٩-٢٤ وصار النموذج يُفتح في نافذة. ولمّا
 * لم يبقَ شيء مثبَّت يحمل حقلًا، لم يبقَ ما تسحبه لوحة المفاتيح.
 *
 * **الإغلاق بزر ✕ وحده**، باختيار المستخدم صراحةً. وهذا يخالف نمط
 * `fq_editflight` القائم الذي يُغلق بالنقر خارج النافذة أيضًا،
 * والمخالفة مقصودة: النموذج يحمل إدخالًا غير محفوظ، ونقرة خطأ على
 * الخلفية كانت ستُضيعه.
 *
 * أدنى من `fq_t4_view`: لا تستدعيه ولا تعرف باسمه. الربط عنده، وهو من
 * يقرّر ما يفعله عند الفتح.
 */

function getT4ModalCode() {
  return `
// ═══ T4: نافذة النموذج ═══
// الصنف open وحده يفتح ويغلق: المكوّن العام مخفيّ بـ display:none
// و.open تجعله flex. ولا aria-hidden معه — توثيق MDN ينصّ على أنه
// «should not be added» مع display:none لأن العنصر خرج من شجرة الوصول
// أصلًا، فإضافته سطرٌ لا أثر له.
function t4OpenModal() {
  const ov = t4El("t4Modal");
  if (!t4Assert(ov, "t4OpenModal: العنصر t4Modal مفقود — النموذج لا يُفتح")) return;
  ov.classList.add("open");
}

function t4CloseModal() {
  const ov = t4El("t4Modal");
  if (!t4Assert(ov, "t4CloseModal: العنصر t4Modal مفقود")) return;
  ov.classList.remove("open");
  // القائمة المنسدلة تُغلق مع النافذة: لو بقيت مفتوحة لعادت ظاهرة عند
  // الفتح التالي بنتائج بحثٍ قديم لا يخصّ ما سيكتبه المستخدم.
  t4CloseDd();
}
`;
}

module.exports = Object.freeze({ getT4ModalCode });
