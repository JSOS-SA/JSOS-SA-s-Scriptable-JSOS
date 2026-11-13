// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_config.js

// ═══ إعدادات النظام العامة ═══
const secretsManager = importModule("fq_secrets_manager");

// محاولة قراءة المفاتيح من Keychain، إذا لم توجد نحاول قراءتها من fq_secrets.js (للتوافق العكسي)
let _firebaseUrl = secretsManager.getFirebaseUrl();
let _firebaseApiKey = secretsManager.getFirebaseApiKey();
// قيم GitHub وتوقيع المطوّر لا تُقرأ هنا: لا يستعملها شيء في هذه الوحدة (أُزيلت ٢٠٢٦-١٠-٠٥)،
// ومن يحتاجها (`fq_installer`) يقرؤها من `fq_secrets_manager` مباشرة.

// أكمل كل قيمة ناقصة بصورة مستقلة؛ قد يحتوي جهاز قديم على الرابط دون مفتاح API.
if (!_firebaseUrl || !_firebaseApiKey) {
    try {
        const oldSecrets = importModule("fq_secrets");
        if (oldSecrets && oldSecrets.FIREBASE_URL) {
            secretsManager.saveAllSecrets({
                FIREBASE_URL: _firebaseUrl || oldSecrets.FIREBASE_URL,
                FIREBASE_API_KEY: _firebaseApiKey || oldSecrets.FIREBASE_API_KEY,
                GITHUB_OWNER: oldSecrets.GITHUB_OWNER || "",
                GITHUB_REPO: oldSecrets.GITHUB_REPO || "",
                GITHUB_BRANCH: oldSecrets.GITHUB_BRANCH || "main",
                GITHUB_TOKEN: oldSecrets.GITHUB_TOKEN || "",
                DEV_SIGNATURE: oldSecrets.DEV_SIGNATURE || ""
            });
            // تحديث المتغيرات
            _firebaseUrl = secretsManager.getFirebaseUrl();
            _firebaseApiKey = secretsManager.getFirebaseApiKey();
        }
    } catch(e) { console.warn(`[fq_config] fq_secrets غير موجود أو Keychain فارغة: ${e.message}`); }
}

// عناوين الأعمدة المستخرجة من جدول الرحلات
const HEADS = ["A/L", "FLT NO.", "TO", "STD", "FLT Type", "DPAX"];

// روابط مكتبة استخراج بيانات البي دي اف
const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// مكتبة html2canvas للنسخ كصورة
const HTML2CANVAS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

// روابط الخطوط
const FONTS_CSS = "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap";

// حدود التصفية
const MAX_ROW_NUMBER = 200;
const MIN_CELLS_PER_ROW = 6;
const MIN_CELLS_FOR_PARSE = 8;

// حدود الوقت المتبقي (بالساعات)
const SOON_HOURS = 2;
const WARN_HOURS = 4;

// حدود التفويج (بالساعات)
const TAFWEEJ_EARLY_HOURS = 8;
const TAFWEEJ_ONTIME_HOURS = 4;

// رابط رحلات المغادرة — كايا
const KAIA_URL = "https://www.kaia.sa/ar-SA/Flights";

// فترات التحديث (بالمللي ثانية)
// SEARCH_DEBOUNCE_MS: مدّة الانتظار بعد توقّف الكتابة قبل تنفيذ البحث، وهي
// **الرقم الوحيد** لكل مربّعات البحث في النظام: الجداول، المباشر، شركات
// الطيران. كانت مكتوبة ٢٠٠ حرفيًّا داخل شاشتين و١٥٠ هنا — ثلاثة أرقام لمعنى
// واحد، فتغيير سرعة البحث كان يلزم في ثلاثة مواضع، ونسيان أحدها يجعل تيوبًا
// أسرع من آخر. وُحِّدت بقرار المالك ٢٠٢٦-٠٩-٢٥، ولا سبب مكتوب في المشروع كان
// يسوّغ الاختلاف.
// وهذه وحدها؛ ولا تُضمّ إليها التأخيرات التي تُشغَّل مرة واحدة عند فتح تيوب
// (مثل تأخير أول عرض في تيوب المباشر) — فتلك ليست انتظار كتابة.
const SEARCH_DEBOUNCE_MS = 150;
const COUNTDOWN_INTERVAL_MS = 1000;
const SIDEBAR_REFRESH_MS = 30000;
const FIREBASE_PING_MS = 30000;
const REG_SYNC_MS = 20000;
const AUTH_CHECK_MS = 30000;

// ═══ تيوب LIVE FLT — قاعدة رحلات الصالات الثلاث (٢٠٢٦-١٠-٠٣) ═══
// قاعدة مستقلة في مشروع locc-system، لا الرئيسة ولا الرصد، بأمر المالك. وفرع
// /jed مفتوح للقراءة والكتابة بلا دخول بنصّ أمره «لا تفعل المصادقة»، فلا رمز
// يُرسل إليها. والرابط معرّف عامّ من الصنف (أ) في fq_secrets، لا سرّ تفويض.
// والاستطلاع كل دقيقة: Request في الوثائق بلا بثّ، والجوالات ٢٢ تحت حدّ
// التنزيل المجاني، والحساب في `~/Desktop/رحلات_صالات_جدة/وثائق/الذاكرة.md`.
const JED_DB_URL = "https://locc-system-default-rtdb.firebaseio.com";
const JED_POLL_MS = 60000;
// مهلة انتظار ردّ الحاسوب على «ترحيل البيانات» (أمر المالك ٢٠٢٦-١٠-٠٥): الحاسوب
// يرفع كل ٣٠ ثانية، فدورتان ونصف قبل أن يُقال «لم يؤكد الحاسوب».
const JED_XFER_WAIT_MS = 90000;

// ═══ أوقات النوبات (بتنسيق 24) ═══
const SHIFT_A_START = "05:42";
const SHIFT_A_END   = "13:42";
const SHIFT_B_START = "13:42";
const SHIFT_B_END   = "21:42";

// ═══ اسم النظام ═══
const SYSTEM_NAME = "JEDCO SMART OPERATIONS HT";

// ═══ تصدير القيم (مع استخدام المتغيرات المستوردة) ═══
const FIREBASE_URL = _firebaseUrl;
const FIREBASE_API_KEY = _firebaseApiKey;

// ═══ بيانات المستخدم الحالي — تُملأ بعد المصادقة ═══
const _USER = {
    name: "—",
    role: "employee",
    empId: "",
    uuid: "",
    token: "",
    uid: "",
    email: "",
};

/**
 * يضع بيانات المستخدم الحالي في الذاكرة، ويملأ كل حقل غائب بقيمته الاحتياطية.
 * @param {Object} user بيانات المستخدم
 */
function setCurrentUser(user) {
    _USER.name  = user.name  || "—";
    _USER.role  = user.role  || "employee";
    _USER.empId = user.empId || "";
    _USER.uuid  = user.uuid  || "";
    _USER.token = user.token || "";
    _USER.uid   = user.uid   || "";
    _USER.email = user.email || "";
}

/**
 * يُرجع المستخدم الحالي من الذاكرة.
 * @returns {Object} المستخدم الحالي
 */
function getCurrentUser() { return _USER; }

module.exports = Object.freeze({
    HEADS,
    PDFJS_CDN,
    PDFJS_WORKER,
    HTML2CANVAS_CDN,
    FONTS_CSS,
    KAIA_URL,
    MAX_ROW_NUMBER,
    MIN_CELLS_PER_ROW,
    MIN_CELLS_FOR_PARSE,
    SOON_HOURS,
    WARN_HOURS,
    TAFWEEJ_EARLY_HOURS,
    TAFWEEJ_ONTIME_HOURS,
    SEARCH_DEBOUNCE_MS,
    COUNTDOWN_INTERVAL_MS,
    SIDEBAR_REFRESH_MS,
    FIREBASE_URL,
    FIREBASE_API_KEY,
    FIREBASE_PING_MS,
    REG_SYNC_MS,
    AUTH_CHECK_MS,
    JED_DB_URL,
    JED_POLL_MS,
    JED_XFER_WAIT_MS,
    SHIFT_A_START,
    SHIFT_A_END,
    SHIFT_B_START,
    SHIFT_B_END,
    SYSTEM_NAME,
    get USER_NAME() { return _USER.name; },
    get USER_ROLE() { return _USER.role; },
    get USER_EMP_ID() { return _USER.empId; },
    get USER_UUID() { return _USER.uuid; },
    get USER_TOKEN() { return _USER.token; },
    get USER_UID() { return _USER.uid; },
    get USER_EMAIL() { return _USER.email; },
    setCurrentUser,
    getCurrentUser,
});
