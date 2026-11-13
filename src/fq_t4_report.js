// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: bug;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_report.js

/**
 * @module fq_t4_report
 * @description المسؤولية الواحدة: الإبلاغ في تيوب T4 — عن فشل عملية،
 * وعن خلل في البنية. لا يعرض شيئًا ولا يقرأ قاعدة ولا يبني نصًّا.
 *
 * وحدة الإبلاغ أدنى وحدات T4 قاطبةً: يستدعيها الجميع ولا تستدعي أحدًا.
 * ولهذا وُضعت في ملف مستقل — كانت `t4ReportFailure` في `fq_t4_view`،
 * فصار `fq_t4_editor` يستدعي وحدةً أعلى منه وتكوّنت حلقة اعتماد
 * (view ← editor ← view). نقلُها إلى الأسفل فكّ الحلقة.
 *
 * الفرق بين الدالتين مقصود ومبنيّ على الوثائق:
 * - `t4ReportFailure` لحالة متوقَّعة أخفقت (الشبكة، صلاحية مرفوضة).
 *   يراها المستخدم لأنها تخصّه، ويراها السجلّ للتشخيص.
 * - `t4Assert` لثابتٍ تضمنه البنية نفسها. غيابه خطأ برمجي لا يعني
 *   المستخدم في شيء، فيذهب إلى السجلّ وحده.
 *   توثيق Node لوحدة assert: «مجموعة دوال للتحقّق من الثوابت
 *   (verifying invariants)» — فالثوابت وحدها محلّ التأكيد، لا الحالات
 *   المتوقَّعة مثل حقل لم يكتب فيه المستخدم بعد.
 */

function getT4ReportCode() {
  return `
// ═══ T4: الإبلاغ ═══

// كل فشل يُظهر سببه الحقيقي. رسالة عامة تحوّل عطلًا واضحًا إلى لغز.
function t4ReportFailure(prefix, result) {
  const why = (result && result.error) ? result.error : "سبب غير معروف";
  if (typeof showToast === "function") showToast(prefix + ": " + why, "error", 4000);
  console.error("[fq_t4] " + prefix + " — " + why);
}

// شيكر الثوابت. يُبلّغ ولا يرمي ولا يوقف التنفيذ، فلا يُلغى طلبٌ قبل
// اكتماله بسبب تأكيد. والمُعاد قيمة منطقية ليحرسها النداء بـ return،
// فالخطأ يُسجَّل ثم يتوقّف المسار وحده بأمان بدل أن يسقط بصمت.
//
// السجلّ هو console.error لا console.assert: وثائق MDN تذكر أن مخرجات
// console.assert تختلف باختلاف المتصفح وقد لا تظهر في بعض السياقات،
// و WebView هنا سياق غير مضمون. و console.error مُجرَّب في هذا المشروع.
function t4Assert(ok, where) {
  if (!ok) console.error("[fq_t4] خلل بنية: " + where);
  return Boolean(ok);
}

// ═══ قفل واحد لكل ما يكتب في T4 ═══
// كان يحرس «نسخ» وحده، فنقرتان سريعتان على «حفظ» كانتا تُنشئان مفتاحين
// مختلفين لسطر واحد — سطران متطابقان في المخرجات المشتركة لا يمحوهما
// إلا الحذف يدويًّا. و«جديد» أخطر: مسحٌ يبدأ مرّتين بينما الأول يحذف.
//
// وموضعه هنا في أدنى وحدة لأن الكاتبَين في وحدتين (العارض والمحرّر)،
// وقفلٌ في إحداهما لا تراه الأخرى. والاعتماد يبقى نازلًا: كلتاهما
// تستدعيان fq_t4_report ولا العكس.
let T4_BUSY = false;

async function t4Guard(fn) {
  if (T4_BUSY) return false;
  T4_BUSY = true;
  try { return await fn(); }
  finally { T4_BUSY = false; }
}
`;
}

module.exports = Object.freeze({ getT4ReportCode });
