// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: paint-brush;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_v2_view_styles.js

/**
 * تنسيق تيوب الرصد — مبنيّ لشاشة الآيفون أوّلًا.
 *
 * ثلاث قواعد تحكم هذا الملف:
 * ١) لا جدول عريض: الجدول القديم كان بعرض ٧٢٠ نقطة داخل شاشة ٣٩٠، فكان يُقصّ حتمًا.
 * ٢) لا فراغ بين الصفوف والأعمدة: الفصل شعرة واحدة، والخلفية تحتها هي الفاصل.
 * ٣) اللون لا يقوم وحده: كل مؤشر ملوّن مقرون بكلمته، فمن لا يميّز الألوان يقرأ الحالة.
 *
 * @returns {string} تنسيق تيوب الرصد الجديد فقط.
 */
function getMonitorV2Styles() {
  return getMonitorV2StylesPart1() +
    getMonitorV2StylesPart2();
}

/** الجزء 1 من 2 من نصّ `getMonitorV2Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getMonitorV2StylesPart1() {
  return `
.mon2-panel{color:#162033;background:#eaecf0;-webkit-text-size-adjust:100%}
.mon2-panel,.mon2-panel *{box-sizing:border-box}
.mon2-header{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#fff;border-block-end:1px solid #eaecf0}
.mon2-header h2{margin:0;font-size:.94rem;color:#101828;line-height:1.25}
.mon2-header p{margin:2px 0 0;font-size:.63rem;color:#667085;line-height:1.4}
.mon2-header-text{flex-grow:1;min-inline-size:0}
.mon2-live{inline-size:9px;block-size:9px;border-radius:999px;background:#98a2b3;flex-shrink:0}
.mon2-panel[data-system='healthy'] .mon2-live{background:#22c55e}
.mon2-panel[data-system='degraded'] .mon2-live{background:#eab308}
.mon2-panel[data-system='down'] .mon2-live{background:#ef4444}
.mon2-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:#eaecf0;border-block-end:1px solid #eaecf0}
.mon2-actions button{block-size:44px;border:0;background:#fff;color:#5b21b6;font:700 .69rem/1.2 inherit;padding:0 2px}
.mon2-actions button:active{background:#f5f3ff}
.mon2-actions button:focus-visible,.mon2-card:focus-visible,.mon2-row:focus-visible{outline:2px solid #5b21b6;outline-offset:-2px}
.mon2-banner{display:none;padding:9px 14px;background:#fff7ed;color:#9a3412;font-size:.7rem;border-block-end:1px solid #eaecf0}
.mon2-banner.show{display:block}
.mon2-banner[data-tone='bad']{background:#fee2e2;color:#991b1b}
.mon2-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:#eaecf0;border-block-end:1px solid #eaecf0}
.mon2-card{display:flex;flex-direction:column;gap:3px;min-block-size:60px;padding:9px 10px 10px;border:0;border-radius:0;background:#fff;text-align:start;font:inherit;color:inherit}
.mon2-card span{font-size:.6rem;color:#667085;line-height:1.3}
.mon2-card strong{font-size:.85rem;color:#101828;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-inline-size:0}
.mon2-card-value{display:flex;align-items:center;gap:5px}
.mon2-card small{font-size:.56rem;font-weight:700;color:#98a2b3}
.mon2-dot{inline-size:7px;block-size:7px;border-radius:999px;background:#98a2b3;flex-shrink:0}
.mon2-card[data-level='ok'] .mon2-dot,.mon2-dot[data-level='ok']{background:#22c55e}
.mon2-card[data-level='warn'] .mon2-dot,.mon2-dot[data-level='warn']{background:#eab308}
.mon2-card[data-level='bad'] .mon2-dot,.mon2-dot[data-level='bad']{background:#ef4444}
.mon2-card[data-level='info'] .mon2-dot,.mon2-dot[data-level='info']{background:#818cf8}
.mon2-card[data-level='ok'] small{color:#22c55e}
.mon2-card[data-level='warn'] small{color:#eab308}
.mon2-card[data-level='bad'] small{color:#ef4444}
.mon2-section{margin:0}
.mon2-title{display:flex;justify-content:space-between;align-items:center;block-size:30px;padding:0 12px;background:#f9fafb;border-block:1px solid #eaecf0}
.mon2-title h3{margin:0;font-size:.72rem;font-weight:700;color:#344054}
.mon2-title span{font-size:.63rem;font-weight:700;color:#667085;background:#f2f4f7;border-radius:999px;padding:2px 8px}
.mon2-list{display:flex;flex-direction:column;gap:1px;background:#eaecf0}
.mon2-row{display:flex;align-items:center;gap:9px;min-block-size:44px;padding:7px 12px;background:#fff;border:0;inline-size:100%;text-align:start;font:inherit;color:inherit}
.mon2-bar{inline-size:3px;align-self:stretch;border-radius:2px;background:#98a2b3;flex-shrink:0}
.mon2-bar[data-level='ok']{background:#22c55e}
.mon2-bar[data-level='warn']{background:#eab308}
.mon2-bar[data-level='bad']{background:#ef4444}
.mon2-bar[data-level='info']{background:#818cf8}
.mon2-main{display:flex;flex-direction:column;gap:2px;flex-grow:1;min-inline-size:0}
.mon2-line{display:flex;align-items:center;flex-wrap:wrap;column-gap:6px;row-gap:3px;min-inline-size:0}
.mon2-strong{font-size:.75rem;font-weight:700;color:#101828;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`;
}

/** الجزء 2 من 2 من نصّ `getMonitorV2Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getMonitorV2StylesPart2() {
  return `
.mon2-meta{font-size:.6rem;color:#667085;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mon2-tail{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
.mon2-tail strong{font-size:.8rem;color:#101828}
.mon2-tail span{font-size:.54rem;color:#98a2b3}
.mon2-id{font-size:.72rem;font-weight:700;color:#101828;min-inline-size:52px;flex-shrink:0}
.mon2-when{font-size:.6rem;color:#98a2b3;flex-shrink:0}
.mon2-pair{display:flex;flex-direction:column;gap:3px;flex-shrink:0}
.mon2-clickable{cursor:pointer}
.mon2-clickable:active{background:#f5f3ff}
.mon2-badge{display:inline-block;max-inline-size:100%;padding:2px 7px;border-radius:999px;font-size:.6rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mon2-ok{background:#dcfce7;color:#166534}
.mon2-warn{background:#fef9c3;color:#854d0e}
.mon2-bad{background:#fee2e2;color:#991b1b}
.mon2-info{background:#e0e7ff;color:#3730a3}
.mon2-off{background:#f2f4f7;color:#667085}
.mon2-empty{display:flex;align-items:center;gap:8px;min-block-size:44px;padding:0 12px;background:#fff;color:#98a2b3;font-size:.68rem}
.mon2-modal{position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:9999;display:flex;align-items:flex-end;justify-content:center}
.mon2-modal[hidden]{display:none}
.mon2-modal-card{position:relative;background:#fff;border-start-start-radius:16px;border-start-end-radius:16px;inline-size:100%;max-block-size:88vh;overflow:auto;padding:16px 14px 22px}
.mon2-close{position:absolute;inset-inline-start:12px;inset-block-start:10px;border:0;background:#f2f4f7;border-radius:999px;inline-size:44px;block-size:44px;font-size:1.2rem;color:#344054}
.mon2-modal-card h3{margin:6px 44px 10px 0;font-size:.9rem;color:#101828}
.mon2-detail-row{display:grid;grid-template-columns:120px 1fr;gap:8px;padding:8px 0;border-block-end:1px solid #f2f4f7;font-size:.7rem}
.mon2-detail-row b{color:#667085;font-weight:600}
.mon2-stack{direction:ltr;text-align:left;white-space:pre-wrap;overflow:auto;background:#111827;color:#e5e7eb;border-radius:9px;padding:10px;font:11px/1.55 monospace}
.mon2-step{margin-block-start:10px;border:1px solid #e4e7ec;border-inline-end-width:4px;border-radius:10px;padding:8px}
.mon2-step-ok{border-inline-end-color:#22c55e}
.mon2-step-warn{border-inline-end-color:#eab308}
.mon2-step-bad{border-inline-end-color:#ef4444}
.mon2-step-info{border-inline-end-color:#818cf8}
.mon2-modal-actions{display:flex;gap:8px;flex-wrap:wrap;margin-block-start:13px}
.mon2-modal-actions button{border:0;border-radius:9px;min-block-size:44px;padding:8px 12px;background:#ede9fe;color:#5b21b6;font:700 .72rem/1.2 inherit}
@media(prefers-reduced-motion:reduce){.mon2-panel *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
@media(min-width:700px){.mon2-grid{grid-template-columns:repeat(6,minmax(0,1fr))}.mon2-modal{align-items:center}.mon2-modal-card{inline-size:min(720px,100%);border-radius:16px}}
`;
}

module.exports = Object.freeze({ getMonitorV2Styles });
