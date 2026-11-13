// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: key;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_secrets.js

/**
 * @module fq_secrets
 * @description يحمل إعدادات مشروع Firebase العامة ليصل تلقائياً لأي جهاز جديد.
 *
 * قرار صريح من المطوّر (تأكيد مباشر، أغسطس ٢٠٢٦): تضمين الرابط هنا
 * مباشرة بدل الاقتصار على Keychain وحده — الذي محلي لكل جهاز ولا
 * يُزامَن، وكان يمنع أي موظف غير المطوّر من الاتصال بالقاعدة. الرابط
 * نفسه المستخدم في setup_dev.js (سطر ٣٤) لتأسيس حساب المطوّر الأول.
 *
 * الآلية: fq_config.js (الأسطر ١٧-٤٠) يقرأ هذا الملف تلقائياً فقط إذا
 * كان Keychain الجهاز فارغاً، ثم يكتب القيمة في Keychain ذلك الجهاز
 * بنفسه — فالتعبئة تتم مرة واحدة لكل جهاز عند أول تشغيل، لا تكراراً
 * في كل مرة. هذا الملف لا يُقرأ مباشرة من أي مكان آخر في النظام.
 *
 * ملاحظة أمنية: هذا استثناء مقصود ومحدود لرابط فايربيز فقط. بقية
 * الأسرار (توكن GitHub وغيره) تبقى Keychain فقط كما في التصميم الأصلي.
 *
 * سياسة الأسرار — الفصل الحاسم بين صنفين:
 * (أ) معرّفات عميل عامة: رابط القاعدة، ومفتاح Web API لفايربيز. هذان
 *     ليسا سر تفويض؛ فايربيز نفسه يصنّفهما معرّفًا لا كلمة سر (توثيق
 *     فايربيز الرسمي)، والحماية الفعلية الوحيدة هي قواعد القاعدة، لا
 *     إخفاء هذين المعرّفين. لذلك يجوز تضمينهما نصًا صريحًا في الكود.
 * (ب) أسرار تفويض فعلية: أي refresh token، أي كلمة مرور، أي مفتاح
 *     حساب خدمة (service-account)، وأي توكن وصول شخصي (كتوكن GitHub).
 *     هذه ممنوعة منعًا باتًا من الظهور نصًا صريحًا في أي ملف، ومكانها
 *     الوحيد Keychain عبر fq_secrets_manager، بلا استثناء.
 * العبارة الحوكمية "never store secrets in code" في دستور المشروع
 * تخص الصنف (ب) حصرًا؛ الصنف (أ) ليس سرًا أصلًا فلا يتعارض معها.
 */

const FIREBASE_URL = "https://hajjterminal-default-rtdb.firebaseio.com";
// مفتاح Web API معرّف عام للمشروع وليس سر تفويض؛ الحماية الفعلية بقواعد القاعدة.
const FIREBASE_API_KEY = "AIzaSyBl2w7YZJ6IhkEGWkh6UBMt--SmF4vWJmw";

const secretsManager = importModule("fq_secrets_manager");

/**
 * التحقق من اكتمال الإعداد — للاستخدام في التشخيص فقط.
 * @returns {boolean}
 */
function isConfigured() {
  return secretsManager.hasSecrets();
}

module.exports = Object.freeze({ FIREBASE_URL, FIREBASE_API_KEY, isConfigured });
