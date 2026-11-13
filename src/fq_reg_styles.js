// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: palette;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_reg_styles.js

// ═══ أنماط CSS لتبويب التسجيل ═══
// المسؤولية الواحدة: إرجاع نص CSS لتنسيق لوحة التسجيل ومكوّناتها

/**
 * يُرجع CSS كنص واحد لكل عناصر تبويب التسجيل.
 * @returns {string}
 */
function getRegModelStyles() {
  return getRegModelStylesPart1() +
    getRegModelStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getRegModelStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getRegModelStylesPart1() {
  return `
.reg-app{padding-bottom:20px}
.reg-shift{position:relative;overflow:hidden;background:#fff;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid rgba(0,0,0,0.06)}
.reg-shift-bar{position:absolute;top:0;left:0;width:100%;height:2px;background:linear-gradient(to right,transparent,#E50914,transparent);opacity:0.5}
.reg-shift-body{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.reg-shift-label{font-size:10px;color:#555555;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:2px}
.reg-shift-title{font-size:24px;font-weight:900;color:#1a1a1a;letter-spacing:0.05em}
.reg-shift-times{display:flex;gap:10px}
.reg-time-box{background:#fafafa;padding:8px 14px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);text-align:center}
.reg-time-label{display:block;font-size:9px;color:#777777;text-transform:uppercase}
.reg-time-val{display:block;font-size:15px;font-weight:700;color:#1a1a1a;font-family:'IBM Plex Mono',monospace}
.reg-history-wrap{background:#fff;border-radius:12px;margin-bottom:12px;overflow:hidden;border:1px solid rgba(0,0,0,0.06)}
.reg-history-toggle{width:100%;padding:12px 14px;display:flex;align-items:center;gap:8px;background:none;border:none;color:#1a1a1a;font-family:Tajawal,sans-serif;font-size:14px;font-weight:600;cursor:pointer;direction:rtl;text-align:right}
.reg-hist-arrow{color:#666666;font-size:12px;transition:transform 0.2s}
.reg-history-wrap.open .reg-hist-arrow{transform:rotate(-90deg)}
.reg-hist-count{margin-right:auto;background:#E50914;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700}
.reg-history-body{display:none;padding:0 12px 12px 12px;max-height:360px;overflow-y:auto;-webkit-overflow-scrolling:touch}
.reg-history-wrap.open .reg-history-body{display:block}
.reg-hist-item{background:#fafafa;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid #2563eb;direction:rtl;cursor:pointer;transition:transform 0.15s}
.reg-hist-item:active{transform:scale(0.98)}
.reg-hist-item-hdr{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:4px;font-family:Tajawal,sans-serif}
.reg-hist-item-who{font-size:11px;color:#666666}
.reg-hist-item-body{font-size:12px;color:#aaaaaa;margin-top:4px;line-height:1.5;font-family:Tajawal,sans-serif!important}
.reg-hist-flight-row{font-size:13px;font-weight:700;color:#1a1a1a;margin-top:6px;font-family:Tajawal,sans-serif}
.reg-hist-flight-sep{border-top:1px dashed #e5e5e5;margin:6px 0}
.reg-form{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid rgba(72,72,72,0.05);transition:border-color 0.3s,opacity 0.2s,transform 0.2s}
.reg-form:hover{border-color:rgba(232,15,22,0.2)}
.reg-form-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid rgba(0,0,0,0.06)}
.reg-form-hdr-right{display:flex;align-items:center;gap:10px}
.reg-form-dot{width:3px;height:24px;background:#E50914;border-radius:4px}
.reg-form-title{font-size:15px;font-weight:700;color:#1a1a1a}
.reg-form-num{font-size:13px;font-weight:400;color:#555555;margin-right:6px}
.reg-form-del{font-size:12px;color:#777777;background:none;border:none;cursor:pointer;font-family:Tajawal,sans-serif;transition:color 0.2s}
.reg-form-del:active{color:#E50914}
.reg-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.reg-field{display:flex;flex-direction:column;gap:4px;position:relative}
.reg-field-wide{grid-column:span 2}
.reg-label{font-size:10px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em}
.reg-input{width:100%;padding:10px 12px;background:#fafafa;color:#1a1a1a;border:none;border-bottom:2px solid #cccccc;border-radius:8px 8px 0 0;font-family:Tajawal,sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;-webkit-appearance:none}
.reg-input:focus{border-bottom-color:#E50914}
.reg-input::placeholder{color:#cccccc}
.reg-flt-dd{display:none;position:absolute;top:100%;right:0;left:0;z-index:30;margin-top:4px;background:#fff;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.08);max-height:220px;overflow-y:auto;-webkit-overflow-scrolling:touch}
.reg-flt-dd.open{display:block}
.reg-flt-dd-item{min-height:44px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:pointer;border-bottom:1px solid #f0f0f0;direction:rtl}
.reg-flt-dd-item:last-child{border-bottom:none}
.reg-flt-dd-item:active{background:#fafafa}`;
}

/** الجزء 2 من 2 من نصّ `getRegModelStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getRegModelStylesPart2() {
  return `
.reg-flt-dd-code{font-family:'IBM Plex Mono',monospace;font-weight:700;color:#1a1a1a;font-size:14px;direction:ltr}
.reg-flt-dd-dest{font-size:11px;color:#666666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reg-tafweej-hint{margin-top:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;display:inline-block}
.reg-hint-early{background:rgba(239,68,68,0.1);color:#dc2626}
.reg-hint-ontime{background:rgba(16,185,129,0.1);color:#10b981}
.reg-hint-late{background:rgba(245,197,24,0.1);color:#ca8a04}
.reg-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:16px}
.reg-btn{display:flex;align-items:center;gap:6px;padding:12px 20px;font-size:14px;font-weight:700;border:none;border-radius:12px;cursor:pointer;font-family:Tajawal,sans-serif;transition:all 0.15s}
.reg-btn:active{transform:scale(0.95)}
.reg-btn-add{background:#E50914;color:#fff}
.reg-btn-ic{font-size:18px;font-weight:900}
.reg-btn-copy{background:#fff;color:#1a1a1a;border:1px solid #e5e5e5}
.reg-btn-wa{background:#25D366;color:#fff}
.reg-btn-reset{background:#fafafa;color:#1a1a1a;border:1px solid rgba(72,72,72,0.3)}
.reg-counter{text-align:center;margin-top:12px;font-size:13px;color:#777777}
`;
}

module.exports = Object.freeze({
  getRegModelStyles,
});
