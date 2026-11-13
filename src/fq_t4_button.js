// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: hand-pointer;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_button.js

/**
 * @module fq_t4_button
 * @description المسؤولية الواحدة: أزرار الأفعال في تيوب T4 ونافذتيه —
 * كتابة اسم الزر، وإظهار نتيجة الضغطة بلونه.
 *
 * **لماذا وحدة مستقلة؟** النموذجان يتقاسمان هذين السلوكين: نموذج F في
 * `fq_t4_view` ونموذج T4 في `fq_wl_view`. ولو سكن أحدهما في أحد
 * العارضَين لاستدعى العارضُ الآخر عارضًا نظيره، وانقلب اتجاه الاعتماد
 * الذي فُكَّت حلقته من قبل. فالموضع الصحيح وحدة أدنى منهما معًا.
 *
 * **اللون يقول ما حدث (طلب المستخدم ٢٠٢٦-٠٩-٢٦)**: أخضر إن نجح الفعل،
 * أحمر إن أخفق، ثم يعود الزر إلى لونه — وهو ما اختاره المستخدم حين
 * سُئل: «مؤقّت ثم يعود». والمدّة أطول قليلًا من الرسالة الخاطفة (١٨٠٠
 * مللي ثانية) فيلحقها الطرف الذي يقرأ الزر لا الرسالة.
 *
 * **ولا يُلوَّن إلا زرُّ فعلٍ يعرف نتيجته**: الدالة التي لا تُرجع
 * صوابًا ولا خطأً — «تعديل» مثلًا، وهو تبديل عرضٍ لا فعلٌ يخفق — لا
 * تُلوَّن أصلًا. فاللون علامة صدق لا زينة تظهر مع كل ضغطة.
 *
 * **والاسم يُكتب في عنصره لا في الزر كلّه**: الزر صار يحمل أيقونة
 * بجانب اسمه بعد توحيد الشكل مع أزرار تيوب القائمة، وكتابة النصّ في
 * الزر نفسه تمحو الأيقونة معه. وهذه علّة وقعت فعلًا قبل هذا الفصل.
 */

function getT4ButtonCode() {
  return `
// ═══ T4: اسم الزر ولونه ═══

// الاسم في عنصره الخاص: الكتابة في الزر كلّه تمحو أيقونته. والبديل
// عند غياب العنصر هو الزر نفسه، فزرٌّ بلا أيقونة يبقى يعمل.
function t4BtnLabel(el, text) {
  if (!el) return;
  const lb = el.querySelector ? el.querySelector(".fqa-lb") : null;
  if (lb) lb.textContent = text;
  else el.textContent = text;
}

const T4_FLASH_MS = 1800;

function t4ClearFlash(el) {
  el.classList.remove("t4a-ok");
  el.classList.remove("t4a-bad");
}

// الشرط على fqa-btn لا على وجود العنصر وحده: أزرار الحالة والقائمة
// المنسدلة والإغلاق ليست أزرار أفعال، فلا يعني لونُها نجاحًا ولا فشلًا.
function t4Flash(el, ok) {
  if (!el || !el.classList) return;
  if (!el.classList.contains("fqa-btn")) return;
  t4ClearFlash(el);
  el.classList.add(ok ? "t4a-ok" : "t4a-bad");
  setTimeout(function() { t4ClearFlash(el); }, T4_FLASH_MS);
}

// القيمة وحدها هي الحَكَم: undefined و null تعنيان «لا نتيجة تُعلن».
function t4FlashValue(el, value) {
  if (value === true || value === false) t4Flash(el, value);
}
`;
}

module.exports = Object.freeze({ getT4ButtonCode });
