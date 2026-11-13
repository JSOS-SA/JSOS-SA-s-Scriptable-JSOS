// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: paint-brush;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_stats_styles.js

/**
 * @module fq_stats_styles
 * @description تنسيقات CSS لوحة الإحصائيات فقط.
 */

/**
 * يُرجع CSS لوحة الإحصائيات.
 * @returns {string}
 */
function getStatsStyles() {
  return getStatsStylesPart1() +
    getStatsStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getStatsStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsStylesPart1() {
  return `
/* ═══ تيوب الإحصائيات ═══ */
.st-period-bar{display:flex;gap:6px;margin-bottom:12px;padding:0 4px}
.st-pd-btn{flex:1;padding:10px 4px;border-radius:4px;border:1px solid #e5e5e5;background:#fff;color:#555;font-size:.82rem;font-family:Tajawal,sans-serif;font-weight:600;cursor:pointer;transition:all .2s}
.st-pd-btn.st-pd-active{background:#E50914;color:#fff;border-color:#E50914;font-weight:700}
.st-shift-badge{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:.78rem;font-weight:700;color:#fff;background:#E50914;padding:4px 12px;border-radius:12px;margin:0 4px 16px}

.st-section-break{display:flex;align-items:center;gap:10px;margin:24px 0 12px;padding:0 4px}
.st-sb-num{font-family:'IBM Plex Mono',monospace;font-size:.78rem;font-weight:700;color:#fff;background:#E50914;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.st-sb-label{font-size:.95rem;font-weight:800;color:#1a1a1a;flex-shrink:0}
.st-sb-line{flex:1;height:2px;background:linear-gradient(to left,#e5e5e5 0%,transparent 100%);border-radius:2px}

.st-overview-card{background:#fff;border:1px solid #e5e5e5;border-radius:4px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:grid;grid-template-columns:1fr 1px 1fr;gap:16px;align-items:center}
.st-ov-block{text-align:center}
.st-ov-icon{font-size:1.6rem;margin-bottom:6px}
.st-ov-num{font-family:'IBM Plex Mono',monospace;font-size:2rem;font-weight:700;line-height:1;margin-bottom:4px}
.st-ov-num-bus{color:#E50914}
.st-ov-num-pax{color:#0369a1}
.st-ov-label{font-size:.78rem;font-weight:700;color:#555}
.st-ov-divider{width:1px;height:80%;background:#e5e5e5}

.st-bus-card{background:#fff;border:1px solid #e5e5e5;border-right:4px solid #E50914;border-radius:4px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.st-pax-card{background:#fff;border:1px solid #e5e5e5;border-right:4px solid #0369a1;border-radius:4px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.st-card-head{display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px dashed #e5e5e5}
.st-ch-icon{font-size:1.3rem}
.st-ch-title{font-size:.92rem;font-weight:700;color:#1a1a1a;flex:1}
.st-ch-total{font-family:'IBM Plex Mono',monospace;font-size:1.4rem;font-weight:700}
.st-bus-card .st-ch-total{color:#E50914}
.st-pax-card .st-ch-total{color:#0369a1}

.st-sub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.st-sub-item{background:#fafafa;border-radius:4px;padding:10px 6px;text-align:center;border:1px solid transparent}
.st-sub-label{font-size:.72rem;color:#555;font-weight:600;margin-bottom:4px}
.st-sub-value{font-family:'IBM Plex Mono',monospace;font-size:1.1rem;font-weight:700;color:#1a1a1a}

.st-dist-card{background:#fff;border:1px solid #e5e5e5;border-radius:4px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:flex;flex-direction:column;gap:6px}
.st-dist-row{display:grid;grid-template-columns:90px 1fr 40px;gap:10px;align-items:center;padding:8px 10px;background:#fafafa;border-radius:4px}
.st-dist-label{font-size:.85rem;color:#1a1a1a;font-weight:600}
.st-dist-bar{height:6px;background:#eee;border-radius:3px;overflow:hidden}
.st-dist-bar-fill{height:100%;border-radius:3px;transition:width .4s ease}
.st-bar-tafweej{background:#E50914}
.st-bar-status{background:#16a34a}
.st-bar-kashf{background:#0369a1}
.st-dist-value{font-family:'IBM Plex Mono',monospace;font-size:.92rem;font-weight:700;color:#1a1a1a;text-align:left}

.st-flt-card{background:#fff;border:1px solid #e5e5e5;border-radius:4px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}`;
}

/** الجزء 2 من 2 من نصّ `getStatsStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStatsStylesPart2() {
  return `
.st-flt-search-wrap{position:relative;margin-bottom:10px}
.st-flt-search-ic{position:absolute;top:50%;right:12px;transform:translateY(-50%);color:#888;pointer-events:none;line-height:0}
.st-flt-search{width:100%;padding:10px 36px 10px 12px;border:1px solid #e5e5e5;border-radius:4px;background:#fafafa;font-family:'IBM Plex Mono',monospace;font-size:.88rem;color:#1a1a1a;outline:0;direction:ltr;box-sizing:border-box;text-align:right}
.st-flt-search:focus{border-color:#E50914;background:#fff}
.st-flt-list{display:flex;flex-direction:column;gap:8px}
.st-flt-item{background:#fafafa;border:1px solid #e5e5e5;border-right:4px solid #7c3aed;border-radius:4px;overflow:hidden}
.st-flt-head{display:grid;grid-template-columns:auto 1fr auto auto;gap:10px;align-items:center;padding:10px 12px;cursor:pointer}
.st-flt-num{font-family:'IBM Plex Mono',monospace;font-size:.95rem;font-weight:700;color:#7c3aed;background:rgba(124,58,237,0.08);padding:3px 10px;border-radius:10px;letter-spacing:.5px}
.st-flt-name{font-size:.78rem;color:#555;font-weight:600}
.st-flt-bus-count{font-family:'IBM Plex Mono',monospace;font-size:.85rem;font-weight:700;color:#E50914}
.st-flt-toggle{font-size:.75rem;color:#555;transition:transform .2s}
.st-flt-item.st-open .st-flt-toggle{transform:rotate(180deg)}
.st-flt-body{display:none;padding:0 12px 12px;border-top:1px dashed #e5e5e5}
.st-flt-item.st-open .st-flt-body{display:block}
.st-flt-detail-head{display:grid;grid-template-columns:90px 1fr 1fr;gap:8px;padding:6px 0;border-bottom:2px solid #e5e5e5;margin-top:8px}
.st-flt-dh-label{font-size:.7rem;color:#888;font-weight:600}
.st-flt-dh-bus{font-size:.7rem;color:#E50914;font-weight:700;text-align:center}
.st-flt-dh-pax{font-size:.7rem;color:#0369a1;font-weight:700;text-align:center}
.st-flt-detail-row{display:grid;grid-template-columns:90px 1fr 1fr;gap:8px;padding:8px 0;border-bottom:1px dashed rgba(0,0,0,0.06);align-items:center}
.st-flt-detail-row:last-child{border-bottom:none}
.st-flt-d-label{font-size:.78rem;color:#1a1a1a;font-weight:600}
.st-flt-d-bus{font-family:'IBM Plex Mono',monospace;font-size:.82rem;color:#E50914;font-weight:700;text-align:center}
.st-flt-d-pax{font-family:'IBM Plex Mono',monospace;font-size:.82rem;color:#0369a1;font-weight:700;text-align:center}
.st-flt-total{border-top:2px solid #e5e5e5;margin-top:6px;padding-top:8px}
.st-flt-total .st-flt-d-label{font-weight:800}
.st-flt-total .st-flt-d-bus,.st-flt-total .st-flt-d-pax{font-size:.95rem}

.st-report-box{background:#fff;border:1px solid #e5e5e5;border-radius:4px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.st-rep-pre{font-family:'IBM Plex Mono',monospace;font-size:.82rem;background:#1a1a1a;color:#e5e5e5;padding:14px;border-radius:4px;white-space:pre-wrap;direction:ltr;text-align:left;line-height:1.7;margin-bottom:12px;overflow-x:auto}
.st-rep-actions{display:flex;gap:8px}

.st-emp-card{background:#fff;border:1px solid #e5e5e5;border-radius:4px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:flex;flex-direction:column;gap:8px}
.st-emp-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:10px 12px;background:#fafafa;border-radius:4px;border-right:3px solid #E50914}
.st-emp-info{display:flex;flex-direction:column;gap:2px}
.st-emp-name{font-size:.88rem;font-weight:700;color:#1a1a1a}
.st-emp-id{font-size:.7rem;color:#888;font-family:'IBM Plex Mono',monospace}
.st-emp-stats{display:flex;flex-direction:column;gap:3px;align-items:flex-end}
.st-emp-stat{font-family:'IBM Plex Mono',monospace;font-size:.74rem;color:#555}
.st-emp-stat strong{color:#E50914;font-weight:700}

.st-last-update{text-align:center;font-size:.72rem;color:#888;margin-top:16px;padding:8px;font-family:'IBM Plex Mono',monospace}
.st-empty{text-align:center;color:#888;padding:20px;font-size:.85rem}
`;
}

module.exports = Object.freeze({ getStatsStyles });
