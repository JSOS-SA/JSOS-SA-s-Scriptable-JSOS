// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: globe;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_countries.js

/**
 * @module fq_countries
 * @description قاموس رموز الدول الـ IATA وأسمائها العربية.
 * بيانات ثابتة (Static Lookup Table) — تُراجع وقت التأليف لا وقت التشغيل.
 * @module fq_countries
 */

// ════════════════════════════════════════════════
// 1. جدول البحث الثابت (Static Lookup — Information Hiding)
// ════════════════════════════════════════════════
const _COUNTRY_MAP = Object.freeze({
  // الشرق الأوسط
  "SA": "السعودية",   "AE": "الإمارات",    "KW": "الكويت",
  "QA": "قطر",        "BH": "البحرين",     "OM": "عُمان",
  "YE": "اليمن",      "IQ": "العراق",      "SY": "سوريا",
  "JO": "الأردن",     "LB": "لبنان",       "PS": "فلسطين",
  "EG": "مصر",        "LY": "ليبيا",       "TN": "تونس",
  "DZ": "الجزائر",    "MA": "المغرب",      "MR": "موريتانيا",
  "SD": "السودان",    "SO": "الصومال",     "DJ": "جيبوتي",
  "KM": "جزر القمر",  "IR": "إيران",       "TR": "تركيا",
  "PK": "باكستان",    "AF": "أفغانستان",
  // آسيا
  "IN": "الهند",      "CN": "الصين",       "JP": "اليابان",
  "KR": "كوريا الجنوبية", "TH": "تايلاند", "MY": "ماليزيا",
  "ID": "إندونيسيا",  "PH": "الفلبين",     "SG": "سنغافورة",
  "BD": "بنغلاديش",   "LK": "سريلانكا",    "NP": "نيبال",
  "MM": "ميانمار",    "VN": "فيتنام",      "KH": "كمبوديا",
  "AZ": "أذربيجان",   "KZ": "كازاخستان",   "UZ": "أوزبكستان",
  // أوروبا
  "GB": "بريطانيا",   "DE": "ألمانيا",     "FR": "فرنسا",
  "IT": "إيطاليا",    "ES": "إسبانيا",     "NL": "هولندا",
  "BE": "بلجيكا",     "CH": "سويسرا",      "AT": "النمسا",
  "SE": "السويد",     "NO": "النرويج",     "DK": "الدنمارك",
  "FI": "فنلندا",     "PL": "بولندا",      "RU": "روسيا",
  "GR": "اليونان",    "PT": "البرتغال",    "RO": "رومانيا",
  "CZ": "التشيك",     "HU": "المجر",       "SK": "سلوفاكيا",
  // أمريكا
  "US": "الولايات المتحدة", "CA": "كندا", "MX": "المكسيك",
  "BR": "البرازيل",   "AR": "الأرجنتين",   "CO": "كولومبيا",
  // أفريقيا
  "ET": "إثيوبيا",    "NG": "نيجيريا",     "ZA": "جنوب أفريقيا",
  "KE": "كينيا",      "TZ": "تنزانيا",     "GH": "غانا",
  "UG": "أوغندا",     "CM": "الكاميرون",   "SN": "السنغال",
  // أوقيانوسيا
  "AU": "أستراليا",   "NZ": "نيوزيلندا",
});

// ════════════════════════════════════════════════
// 2. جدول رموز المطارات → رمز الدولة
// ════════════════════════════════════════════════
const _AIRPORT_TO_COUNTRY = Object.freeze({
  // السعودية
  "RUH": "SA", "JED": "SA", "DMM": "SA", "MED": "SA",
  "TIF": "SA", "GIZ": "SA", "AHB": "SA", "HOF": "SA",
  "TUU": "SA", "URY": "SA", "AJF": "SA", "RAE": "SA",
  // الإمارات
  "DXB": "AE", "AUH": "AE", "SHJ": "AE",
  // الكويت، قطر، البحرين، عُمان
  "KWI": "KW", "DOH": "QA", "BAH": "BH",
  "MCT": "OM", "SLL": "OM", "DQM": "OM",
  // مصر، الأردن، لبنان
  "CAI": "EG", "AMM": "JO", "BEY": "LB",
  // العراق
  "BGW": "IQ", "BSR": "IQ", "EBL": "IQ",
  // باكستان، الهند
  "KHI": "PK", "LHE": "PK", "ISB": "PK",
  "DEL": "IN", "BOM": "IN", "HYD": "IN", "MAA": "IN",
  // المملكة المتحدة، ألمانيا، فرنسا
  "LHR": "GB", "LGW": "GB", "MAN": "GB",
  "FRA": "DE", "MUC": "DE", "DUS": "DE",
  "CDG": "FR", "ORY": "FR",
  // الولايات المتحدة
  "JFK": "US", "LAX": "US", "ORD": "US", "IAD": "US",
  // أستراليا، كندا
  "SYD": "AU", "MEL": "AU", "YYZ": "CA", "YVR": "CA",
  // إثيوبيا، كينيا
  "ADD": "ET", "NBO": "KE",
  // ماليزيا، إندونيسيا، تايلاند
  "KUL": "MY", "CGK": "ID", "BKK": "TH",
});

// ════════════════════════════════════════════════
// 3. الدوال العامة المُصدَّرة
// ════════════════════════════════════════════════

/**
 * إرجاع اسم الدولة من رمز المطار أو رمز الدولة.
 * @param {string} code - رمز المطار (3 أحرف) أو رمز الدولة (2 حرف)
 * @returns {string} اسم الدولة أو الرمز الأصلي إذا لم يُوجد
 */
function getCountryName(code) {
  if (!code || typeof code !== "string") return "";
  const upper = code.trim().toUpperCase();
  // بحث مباشر بالرمز الثنائي
  if (_COUNTRY_MAP[upper]) return _COUNTRY_MAP[upper];
  // بحث عبر رمز المطار
  const countryCode = _AIRPORT_TO_COUNTRY[upper];
  if (countryCode && _COUNTRY_MAP[countryCode]) return _COUNTRY_MAP[countryCode];
  return upper;
}

/**
 * إرجاع رمز الدولة من رمز المطار.
 * @param {string} airportCode - رمز المطار
 * @returns {string} رمز الدولة أو سلسلة فارغة
 */
function getCountryCode(airportCode) {
  if (!airportCode || typeof airportCode !== "string") return "";
  return _AIRPORT_TO_COUNTRY[airportCode.trim().toUpperCase()] || "";
}

// ════════════════════════════════════════════════
// 4. نقطة الدخول (إلزام القالب الثابت)
// ════════════════════════════════════════════════
class AppCoordinator {
  static async boot() {
    // وحدة بيانات ثابتة — لا تنفيذ عند الإقلاع
  }
}

try {
  // boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
  // لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
  // و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
  // ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
  AppCoordinator.boot().catch((bootError) => console.error(bootError));
} catch (e) {
  console.error(e);
}

module.exports = Object.freeze({ getCountryName, getCountryCode, COUNTRY: _COUNTRY_MAP });
