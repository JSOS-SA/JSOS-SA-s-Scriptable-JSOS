// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: paint-brush;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_profile_styles.js

/**
 * @module fq_profile_styles
 * @description تنسيقات CSS للملف الشخصي فقط.
 */

/**
 * يُرجع CSS الملف الشخصي.
 * @returns {string}
 */
function getProfileStyles() {
  return getProfileStylesPart1() +
    getProfileStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getProfileStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileStylesPart1() {
  return `
.pf-card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;text-align:center}
.pf-avatar-wrap{margin-bottom:12px}
.pf-avatar{width:80px;height:80px;border-radius:50%;background:#fafafa;border:2px solid #e5e5e5;display:inline-flex;align-items:center;justify-content:center;overflow:hidden}
.pf-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.pf-avatar-icon{font-size:32px}
.pf-name{font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:4px}
.pf-role{font-size:12px;font-weight:600;padding:3px 10px;border-radius:10px;display:inline-block;margin-bottom:10px}
.pf-detail{font-size:13px;color:rgba(85,85,85,1);margin-bottom:4px;direction:rtl}
.pf-edit-bar{display:flex;gap:8px;justify-content:center;margin-top:12px}
.pf-edit-btn,.pf-save-btn{
  padding:8px 16px;border:none;border-radius:8px;
  font-family:Tajawal,sans-serif;font-size:13px;font-weight:600;cursor:pointer;
}
.pf-edit-btn{background:#fafafa;color:#1a1a1a}
.pf-save-btn{background:#16a34a;color:#fafafa}
.pf-edit-form{background:#fff;border-radius:12px;padding:14px;margin-bottom:12px}
.pf-field{margin-bottom:10px;direction:rtl}
.pf-field label{display:block;font-size:11px;color:#666666;margin-bottom:4px;font-weight:600}
.pf-field input,.pf-field select{
  width:100%;padding:10px;background:#fafafa;color:#1a1a1a;
  border:1px solid rgba(0,0,0,0.06);border-radius:8px;
  font-family:Tajawal,sans-serif;font-size:14px;outline:none;
  -webkit-appearance:none;
}
.pf-field input:focus,.pf-field select:focus{border-color:#2563eb}
.pf-team-title{font-size:14px;font-weight:700;color:#1a1a1a;padding:12px 0 8px;direction:rtl}
.pf-team-card{
  background:#fff;border-radius:8px;padding:10px;
  margin-bottom:6px;border-right:3px solid #2563eb;direction:rtl;
  cursor:pointer;transition:all 0.15s;
}
.pf-team-card:active{transform:scale(0.98)}
.pf-team-card.expanded{background:#ffffff}
.pf-team-avatar{width:40px;height:40px;border-radius:50%;background:#fafafa;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.pf-team-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.pf-team-info{flex:1;text-align:right}
.pf-team-name{font-size:13px;font-weight:700;color:#1a1a1a}
.pf-team-meta{font-size:11px;color:rgba(119,119,119,1)}
.pf-team-expand{
  display:none;padding:10px 0 0;
  border-top:1px solid rgba(0,0,0,0.05);
  margin-top:8px;
}
.pf-team-card.expanded .pf-team-expand{display:block}`;
}

/** الجزء 2 من 2 من نصّ `getProfileStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileStylesPart2() {
  return `
.pf-dev-btn{
  display:block;width:100%;padding:12px;margin-bottom:8px;
  border:1px solid rgba(0,0,0,0.06);border-radius:10px;
  background:#fff;color:#1a1a1a;
  font-family:Tajawal,sans-serif;font-size:14px;font-weight:600;
  cursor:pointer;text-align:center;
}
.pf-dev-btn:active{transform:scale(0.97)}
.pf-dev-danger{border-color:#E50914;color:#E50914}
.pf-role-toggle{
  display:inline-block;padding:6px 12px;
  border:1px solid #2563eb;border-radius:6px;
  background:none;color:#2563eb;
  font-family:Tajawal,sans-serif;font-size:12px;font-weight:600;
  cursor:pointer;margin:4px 2px;
}
.pf-role-toggle:active{background:rgba(74,158,255,0.15)}
.pf-freeze-btn{border-color:#E50914;color:#E50914}
.pf-freeze-btn:active{background:rgba(229,9,20,0.05)}
`;
}

module.exports = Object.freeze({ getProfileStyles });
