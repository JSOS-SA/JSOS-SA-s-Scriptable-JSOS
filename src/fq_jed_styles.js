// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_jed_styles.js

/**
 * @module fq_jed_styles
 * @description المسؤولية الواحدة: أنماط تيوب LIVE FLT. شاشة داكنة بخط
 * ثابت العرض تحاكي الطرفية، بأمر المالك ٢٠٢٦-١٠-٠٣.
 *
 * **ألوان الحالات هي ألوان الطرفية نفسها** (`STATUS_COLORS` في `board.py`
 * من مشروع الرحلات): STD أزرق · DAL برتقالي يومض · DEP أخضر · CNL أحمر
 * عريض يومض · DIV بنفسجي. والخلاف وحده أصفر عريض مع ⚠، والقيمة
 * المختارة أو المكتوبة باليد خضراء، والرحلة التي لم يعد يعرضها أي موقع
 * باهتة. فإن تغيّر لون في الطرفية فيتغيّر هنا أيضًا: لا مصدر مشترك بين
 * البرنامجين لأنهما في لغتين وجهازين.
 *
 * **النافذة**: مكوّن `.ef-*` العام، والصنف `jed-mov` يحصر فروقها فلا
 * تتسرّب إلى النوافذ الأخرى (الدرس ٢٨).
 */

/**
 * أنماط تيوب LIVE FLT.
 * @returns {string} نص CSS
 */
function getJedStyles() {
  return getJedStylesPart1() +
    getJedStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getJedStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedStylesPart1() {
  return `
/* ═══ LIVE FLT — محاكي الطرفية ═══ */
.jed-term{
  background:#0b0f14;color:#e5e7eb;border-radius:10px;
  padding:10px 8px 14px;margin:8px 6px 90px;
  font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;
  font-size:12px;line-height:1.5;
}
.jed-top{display:flex;justify-content:space-between;gap:8px;
  font-weight:700;border-bottom:1px solid #1f2937;padding-bottom:6px}
.jed-clock{color:#22d3ee;white-space:nowrap}
.jed-terms{display:flex;flex-direction:column;gap:4px;margin:8px 0}
.jed-tb{display:flex;justify-content:space-between;align-items:center;
  background:transparent;color:#e5e7eb;border:1px solid #1f2937;
  border-radius:6px;padding:8px;min-height:44px;font:inherit;text-align:right}
.jed-tb.on{background:#e5e7eb;color:#0b0f14;font-weight:700}
.jed-day{display:block;width:100%;min-height:44px;margin:4px 0;
  background:transparent;color:#e5e7eb;border:1px dashed #374151;
  border-radius:6px;font:inherit;font-weight:700;text-align:right;padding:8px}
.jed-day .jed-dim{font-weight:400}
.jed-src,.jed-note{margin:4px 0;font-size:11px}
.jed-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-top:6px}
.jed-tbl{width:100%;border-collapse:collapse;white-space:nowrap}
.jed-tbl th{font-weight:700;color:#f9fafb;border-bottom:1px solid #374151;
  padding:4px 3px;text-align:right}
.jed-tbl td{padding:7px 3px;border-bottom:1px solid #111827;
  border-left:1px solid #1f2937;text-align:right}
.jed-tbl td:last-child{border-left:0}
/* الضغط المطوّل يفتح التعديل، فلا تحديد نصّ ولا قائمة نسخ فوقه. */
.jed-tbl tr{cursor:pointer;-webkit-user-select:none;user-select:none;
  -webkit-touch-callout:none}
.jed-tbl s{text-decoration-thickness:2px}
.jed-tbl tr:active td{background:#111827}
.jed-dest{max-width:8.5em;overflow:hidden;text-overflow:ellipsis}
.jed-state{margin-top:8px;font-size:11px}

.jed-vt{display:flex;align-items:center;gap:10px;padding:8px 10px 0}
.jed-hidden{font-size:.7rem;color:var(--t2)}
/* زرّ الترحيل في الطرف الآخر من الصف، والصف يلتفّ في الشاشة الضيقة. */
.jed-vt{flex-wrap:wrap}
.jed-xfer{margin-inline-start:auto}
.jed-xfer.vt-active{border-color:#16a34a;color:#16a34a}
.jed-tb{flex-wrap:wrap;gap:4px}
.jed-walk{font-weight:700;color:#1d4ed8}
`;
}

/** الجزء 2 من 2 من نصّ `getJedStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedStylesPart2() {
  return `
/* الألوان — بترتيب الطرفية */
.jed-dim,.jed-gone td{color:#6b7280}
.jed-sch{color:#60a5fa}
.jed-dly{color:#fb923c}
.jed-dep{color:#4ade80}
.jed-cnl{color:#f87171;font-weight:700}
.jed-div{color:#e879f9}
.jed-cf{color:#facc15;font-weight:700}
/* المتأخرة والملغاة تومضان تنبيهًا حتى تتغيّر حالتهما (أمر المالك). */
@keyframes jedBlink{50%{opacity:0}}
.jed-blink{animation:jedBlink 1s steps(1) infinite}
.jed-ok{color:#4ade80}
.jed-bad{color:#facc15}

/* ═══ نافذة التفاصيل ═══ */
.jed-mov{z-index:9990}
.jed-mov .ef-close{width:44px;height:44px}
.jed-detail{font-size:14px}
.jed-fld{border-top:1px solid #e5e5e5;padding:8px 0}
.jed-fh{font-weight:700;margin-bottom:6px}
.jed-fh.jed-cf{color:#a16207}
.jed-fh.jed-ok{color:#15803d}
.jed-opt{display:block;width:100%;min-height:44px;margin:4px 0;padding:8px 10px;
  border:1px solid #d4d4d4;border-radius:8px;background:#fafafa;
  color:#1a1a1a;font:inherit;text-align:right}
.jed-opt.on{border-color:#15803d;background:#ecfdf5;font-weight:700}
.jed-msg{margin:6px 0;font-size:13px}
.jed-save{display:block;width:100%;min-height:44px;margin-top:8px;border:0;
  border-radius:8px;background:#2563eb;color:#fff;font:inherit;font-weight:700}
`;
}

module.exports = Object.freeze({ getJedStyles });
