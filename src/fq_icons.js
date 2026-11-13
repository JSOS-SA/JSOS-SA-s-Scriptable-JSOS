// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: shapes;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_icons.js

/**
 * @module fq_icons
 * @description مكتبة الأيقونات الاحترافية — Lucide SVG inline.
 * كل أيقونة 24x24 viewBox مع stroke-current لتلوينها عبر CSS.
 * مصدر الحقيقة الوحيد لأيقونات الواجهة. لا تكرار.
 *
 * البديل الكامل لكل الإيموجي في الواجهات داخل WebView.
 * الإيموجي تبقى في إشعارات iOS وودجت لأن SVG لا يعمل هناك.
 */

// ════════════════════════════════════════════════
// 1. مكتبة مسارات SVG (Path Data) — Lucide Icons
// ════════════════════════════════════════════════
const _ICON_PATHS = Object.freeze({
  // الشريط السفلي
  menu:           '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  fileText:       '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/>',
  clock:          '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  plane:          '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  bookOpen:       '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  database:       '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  bell:           '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user:           '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  clipboardList:  '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  barChart:       '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h2"/><path d="M11 12h2"/><path d="M15 8h2"/>',

  // الإحصائيات
  bus:            '<path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M7 18H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2"/><path d="M9 18h6"/><path d="M5 22v-4"/><path d="M19 22v-4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  users:          '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  search:         '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  clipboard:      '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  refresh:        '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  download:       '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',

  // النموذج والتسجيل
  check:          '<polyline points="20 6 9 17 4 12"/>',
  checkCircle:    '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alertTriangle:  '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  edit:           '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash:          '<polyline points="3 6 5 6 21 6"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  save:           '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  copy:           '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  plus:           '<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>',
  x:              '<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>',
  send:           '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  settings:       '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  calendar:       '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  folder:         '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  eye:            '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:         '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  upload:         '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  smartphone:     '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  building:       '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  filter:         '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  chevronDown:    '<polyline points="6 9 12 15 18 9"/>',
  chevronUp:      '<polyline points="18 15 12 9 6 15"/>',
  chevronLeft:    '<polyline points="15 18 9 12 15 6"/>',
  chevronRight:   '<polyline points="9 18 15 12 9 6"/>',
  arrowLeft:      '<line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  info:           '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  helpCircle:     '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  fileSpreadsheet:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
  pieChart:       '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  trendingUp:     '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  list:           '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
  shield:         '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
});

// ════════════════════════════════════════════════
// 2. الإعدادات الافتراضية
// ════════════════════════════════════════════════
const DEFAULT_SIZE = 20;
const DEFAULT_STROKE = 2;

// ════════════════════════════════════════════════
// 3. دوال البناء (Information Hiding)
// ════════════════════════════════════════════════

/**
 * يبني نص أيقونة SVG كاملة جاهزة للحقن في HTML.
 * @param {string} name - اسم الأيقونة من _ICON_PATHS
 * @param {object} [opts] - خيارات
 * @param {number} [opts.size=20] - الحجم بالـ px
 * @param {number} [opts.stroke=2] - عرض الخط
 * @param {string} [opts.cls=""] - كلاسات CSS إضافية
 * @returns {string} نص SVG كامل، أو سلسلة فارغة لاسم غير معروف
 */
function buildIcon(name, opts) {
  if (!name || typeof name !== "string") return "";
  const path = _ICON_PATHS[name];
  if (!path) return "";
  const o = opts || {};
  const size = o.size || DEFAULT_SIZE;
  const stroke = o.stroke || DEFAULT_STROKE;
  const cls = o.cls ? ` class="ic ${o.cls}"` : ' class="ic"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + cls +
    ' width="' + size + '" height="' + size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + stroke +
    '" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}

/**
 * يُرجع كل أسماء الأيقونات المتاحة.
 * @returns {string[]}
 */
function getAllIconNames() {
  return Object.keys(_ICON_PATHS);
}

/**
 * يُرجع كود JavaScript لحقن مكتبة الأيقونات داخل WebView.
 * يحقن كائن ICONS ودالة buildIcon ليتمكن أي ملف محقون من استخدامها.
 * @returns {string}
 */
function getIconsCode() {
  return `
// ═══ مكتبة الأيقونات داخل WebView ═══
const ICONS = ${JSON.stringify(_ICON_PATHS)};

/**
 * بناء أيقونة SVG كاملة من اسم الأيقونة.
 * @param {string} name - اسم الأيقونة
 * @param {number} [size=20] - الحجم
 * @param {string} [cls=""] - كلاسات إضافية
 * @returns {string} SVG HTML
 */
function buildIcon(name, size, cls) {
  if (!name || !ICONS[name]) return "";
  const s = size || 20;
  const c = cls ? ' class="ic ' + cls + '"' : ' class="ic"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + c +
    ' width="' + s + '" height="' + s +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
}
`;
}

/**
 * يُرجع CSS الأساسي لتنسيق الأيقونات في كل النظام.
 * @returns {string}
 */
function getIconsStyles() {
  return getIconsStylesPart1() +
    getIconsStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getIconsStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getIconsStylesPart1() {
  return `
/* ═══ نظام الأيقونات الموحّد ═══ */
.ic{display:inline-block;vertical-align:middle;flex-shrink:0;line-height:0;color:currentColor}
.ic-sm{width:16px;height:16px}
.ic-md{width:20px;height:20px}
.ic-lg{width:24px;height:24px}
.ic-xl{width:32px;height:32px}

/* ألوان مساعدة */
.ic-pri{color:#E50914}
.ic-bl{color:#0369a1}
.ic-ok{color:#16a34a}
.ic-am{color:#ca8a04}
.ic-pu{color:#7c3aed}
.ic-mut{color:#888}

/* ═══ الشريط السفلي — الأيقونات ضمن الزر ═══ */
.tab-btn .ic{margin-bottom:2px}
.tab-btn.tab-active .ic{color:#E50914}

/* ═══ الأزرار الاحترافية ═══ */
.btn-pro{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:10px 16px;border-radius:8px;border:1px solid transparent;
  font-family:Tajawal,sans-serif;font-size:.88rem;font-weight:700;
  cursor:pointer;transition:all .15s;line-height:1;min-height:40px;
  -webkit-tap-highlight-color:transparent;
}
.btn-pro:active{transform:scale(0.97)}
.btn-pro-pri{background:#E50914;color:#fff;border-color:#E50914}
.btn-pro-pri:active{background:#C1111A;border-color:#C1111A}
.btn-pro-sec{background:#fff;color:#1a1a1a;border-color:#e5e5e5}
.btn-pro-sec:active{background:#f5f5f5}
.btn-pro-ok{background:#16a34a;color:#fff;border-color:#16a34a}
.btn-pro-ok:active{background:#15803d}
.btn-pro-warn{background:#ca8a04;color:#fff;border-color:#ca8a04}
.btn-pro-danger{background:#dc2626;color:#fff;border-color:#dc2626}
.btn-pro-ghost{background:transparent;color:#1a1a1a;border-color:transparent}
.btn-pro-ghost:active{background:#f5f5f5}

/* أحجام الأزرار */
.btn-pro-sm{padding:6px 12px;font-size:.78rem;min-height:32px}
.btn-pro-lg{padding:14px 20px;font-size:.95rem;min-height:48px}
`;
}

/** الجزء 2 من 2 من نصّ `getIconsStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getIconsStylesPart2() {
  return `
/* ═══ بطاقات احترافية ═══ */
.card-pro{
  background:#fff;border:1px solid #e5e5e5;border-radius:8px;
  padding:14px;box-shadow:0 1px 3px rgba(0,0,0,0.04);
  transition:box-shadow .15s;
}
.card-pro:active{box-shadow:0 2px 6px rgba(0,0,0,0.08)}

/* ═══ شارات الحالة ═══ */
.badge-pro{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:12px;
  font-family:'IBM Plex Mono',monospace;font-size:.72rem;font-weight:700;
}
.badge-pri{background:rgba(229,9,20,0.1);color:#E50914}
.badge-bl{background:rgba(3,105,161,0.1);color:#0369a1}
.badge-ok{background:rgba(22,163,74,0.1);color:#16a34a}
.badge-am{background:rgba(202,138,4,0.1);color:#ca8a04}
.badge-mut{background:#f5f5f5;color:#555}
`;
}

// ════════════════════════════════════════════════
// 4. نقطة الدخول
// ════════════════════════════════════════════════
class AppCoordinator {
  static async boot() {
    // وحدة بيانات ثابتة
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

module.exports = Object.freeze({
  buildIcon,
  getAllIconNames,
  getIconsCode,
  getIconsStyles,
  ICONS: _ICON_PATHS,
});
