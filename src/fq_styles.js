// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_styles.js

/**
 * يبني الأنماط العامة للصفحة.
 * @returns {string} نص CSS
 */
function getStyles() {
  return getStylesPart1() +
    getStylesPart2() +
    getStylesPart3() +
    getStylesPart4() +
    getStylesPart5() +
    getStylesPart6() +
    getStylesPart7() +
    getStylesPart8() +
    getStylesPart9() +
    getStylesPart10() +
    getStylesPart11() +
    getStylesPart12() +
    getStylesPart13() +
    getStylesPart14() +
    getStylesPart15() +
    getStylesPart16() +
    getStylesPart17() +
    getStylesPart18() +
    getStylesPart19() +
    getStylesPart20() +
    getStylesPart21() +
    getStylesPart22() +
    getStylesPart23() +
    getStylesPart24() +
    getStylesPart25() +
    getStylesPart26() +
    getStylesPart27() +
    getStylesPart28();
}

/** الجزء 1 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart1() {
  return `
*{margin:0;padding:0;box-sizing:border-box;
  -webkit-tap-highlight-color:transparent}

:root{
  --bg:#fafafa;
  --s1:#ffffff;
  --s2:#ffffff;
  --bd:#e5e5e5;
  --ac:#E50914;
  --ac2:#C1111A;
  --tx:#1a1a1a;
  --t2:#555555;
  --ok:#16a34a;
  --am:#ca8a04;
  --r:4px;
  --sh:0 2px 8px rgba(0,0,0,0.08);
  /* ارتفاع شريط التبويبات السفلي — مصدر واحد لا يُكرَّر.
     يستعمله body ليحجز مكانه، وتستعمله لوحة T4 لتثبّت نموذجها فوقه. */
  --tabsH:72px;
  /* هوامش المنطقة الآمنة */
  --sat:env(safe-area-inset-top,0px);
  --sab:env(safe-area-inset-bottom,0px);
  --sar:env(safe-area-inset-right,0px);
  --sal:env(safe-area-inset-left,0px);
}

body{
  font-family:'Tajawal',sans-serif;
  background:var(--bg);color:var(--tx);
  min-height:100vh;min-height:100dvh;
  overflow-x:hidden;
}
`;
}

/** الجزء 2 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart2() {
  return `
/* ═══ الشريط العلوي الثابت ═══ */
.topbar{
  position:sticky;top:0;z-index:20;
  padding:calc(12px + var(--sat)) 16px 12px;
  background:rgba(255,255,255,0.85);
  -webkit-backdrop-filter:blur(16px);
  backdrop-filter:blur(16px);
  border-bottom:1px solid rgba(0,0,0,0.05);
}
.tb-inner{display:flex;align-items:center;
  max-width:560px;margin:0 auto;gap:8px}
.tb-icon{font-size:1.1rem}
.tb-title{font-size:1.1rem;font-weight:800;
  color:var(--ac);letter-spacing:.5px;flex:1}
.tb-count{font-family:'IBM Plex Mono',monospace;
  font-size:.82rem;font-weight:600;color:var(--t2);
  background:rgba(229,9,20,0.05);
  padding:4px 12px;border-radius:12px}
.tb-count:empty{display:none}

/* ═══ الحاوية الرئيسية ═══ */
.app{max-width:560px;margin:0 auto;
  padding:8px 16px calc(32px + var(--sab));
  position:relative;z-index:1}

/* ═══ الترويسة ═══ */
.hd{text-align:center;padding:8px 0 12px}
.hd p{color:var(--t2);font-size:.82rem}
`;
}

/** الجزء 3 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart3() {
  return `
/* ═══ حقل التاريخ ═══ */
.date-row{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.date-row label{font-size:.82rem;font-weight:700;
  color:var(--t2);white-space:nowrap}
.date-row input[type="date"]{
  flex:1;padding:12px 16px;border-radius:var(--r);
  border:1px solid var(--bd);
  background:var(--s1);
  color:var(--tx);font-family:'IBM Plex Mono',monospace;
  font-size:.9rem;outline:0;direction:ltr;text-align:center;
  transition:all .3s ease;
}
.date-row input[type="date"]:focus{
  border-color:var(--ac);
  box-shadow:0 0 0 3px rgba(229,9,20,0.05);
}

/* ═══ منطقة الرفع ═══ */
.upload{
  border:2px dashed var(--bd);border-radius:var(--r);
  padding:32px 16px;text-align:center;cursor:pointer;
  background:var(--s1);
  position:relative;transition:all .3s ease;
}
.upload:active{
  border-color:var(--ac);
  background:rgba(229,9,20,0.05);
  transform:scale(.97);
}
.upload .ic{font-size:2.6rem;display:block;margin-bottom:8px}
.upload .lb{font-size:.9rem;font-weight:700}
.upload .hn{font-size:.82rem;color:var(--t2);margin-top:8px}
.upload input{position:absolute;inset:0;opacity:0;cursor:pointer}
/* حالة مضغوطة عند وجود ملفات */
.upload.compact{padding:12px 16px;
  display:flex;align-items:center;gap:8px;text-align:right}
.upload.compact .ic{font-size:1.1rem;margin-bottom:0}
.upload.compact .lb{font-size:.82rem}
.upload.compact .hn{display:none}
`;
}

/** الجزء 4 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart4() {
  return `
/* ═══ قائمة الملفات ═══ */
.flist-wrap{margin-top:8px}
.flist-toggle{
  display:none;background:var(--s1);border:1px solid var(--bd);
  border-radius:var(--r);padding:8px 14px;
  color:var(--t2);font-size:.75rem;font-weight:600;
  font-family:'Tajawal',sans-serif;
  cursor:pointer;width:100%;text-align:right;
  transition:all .2s}
.flist-toggle.on{display:flex;align-items:center;gap:6px}
.flist-toggle .flt-arrow{transition:transform .2s;font-size:.7rem}
.flist-toggle.open .flt-arrow{transform:rotate(90deg)}
.flist-body{display:none;margin-top:6px}
.flist-body.open{display:block}
.flist{margin-top:0}
.fbadge{
  display:flex;align-items:center;gap:8px;
  background:var(--s1);
  border:1px solid var(--bd);border-radius:var(--r);
  padding:12px 16px;margin-bottom:8px;
  transition:all .2s ease;
}
.fbadge:active{transform:scale(.97)}
.fbadge .nm{flex:1;font-weight:500;font-size:.82rem;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fbadge .dt{color:var(--ac);font-size:.75rem;
  font-family:'IBM Plex Mono',monospace;flex-shrink:0}
.fbadge .cnt{color:var(--t2);font-size:.75rem;flex-shrink:0}
.fbadge .rm{background:0;border:0;color:var(--ac);
  font-size:1.1rem;cursor:pointer;
  min-width:44px;min-height:44px;
  display:flex;align-items:center;justify-content:center;
  transition:transform .2s}
.fbadge .rm:active{transform:scale(1.3)}
`;
}

/** الجزء 5 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart5() {
  return `
/* ═══ التحميل ═══ */
.ld{display:none;text-align:center;padding:32px}
.ld.on{display:block}
.sp{
  width:40px;height:40px;
  border:3px solid rgba(229,9,20,0.05);
  border-top-color:var(--ac);border-radius:50%;
  animation:spn .7s linear infinite;margin:0 auto 12px;
}
@keyframes spn{to{transform:rotate(360deg)}}

/* ═══ الأخطاء ═══ */
.err{
  display:none;
  background:rgba(229,9,20,0.06);
  border:1px solid rgba(229,9,20,0.05);
  border-radius:var(--r);padding:12px;margin-top:8px;
  color:var(--ac);font-size:.82rem;
}
.err.on{display:block;animation:shk .3s ease}
@keyframes shk{
  0%,100%{transform:translateX(0)}
  25%{transform:translateX(-4px)}
  75%{transform:translateX(4px)}
}

/* ═══ حقل البحث ═══ */
.sbox{display:none;position:sticky;top:0;z-index:10;
  background:rgba(255,255,255,0.85);
  -webkit-backdrop-filter:blur(16px);
  backdrop-filter:blur(16px);
  padding:12px 0 8px;
}
`;
}

/** الجزء 6 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart6() {
  return `
/* ═══ أزرار الفلترة ═══ */
.filters{display:flex;
  gap:8px;margin-bottom:8px;overflow-x:auto;
  -webkit-overflow-scrolling:touch;padding:4px 0}
.fl-btn{background:var(--s1);border:1px solid var(--bd);
  border-radius:16px;padding:8px 16px;
  color:var(--t2);font-family:'Tajawal',sans-serif;
  font-size:.75rem;font-weight:700;cursor:pointer;
  white-space:nowrap;transition:all .2s ease}
.fl-btn.active{background:var(--ac);border-color:var(--ac);
  color:#fff}
.fl-btn:active{transform:scale(.95)}

/* ═══ تبديل العرض ═══ */
.view-toggle{display:flex;gap:8px;margin-bottom:8px;
  text-align:left}
.vt-btn{background:var(--s1);border:1px solid var(--bd);
  border-radius:var(--r);
  padding:6px 10px;min-width:44px;
  color:var(--t2);font-size:.7rem;cursor:pointer;
  display:flex;flex-direction:column;
  align-items:center;gap:2px;
  font-family:'Tajawal',sans-serif}
.vt-btn .vt-ic{font-size:.9rem;line-height:1}
.vt-btn .vt-lb{font-size:.55rem;white-space:nowrap}
.sbox.on{display:block}
.sbox input{
  width:100%;padding:12px 16px;border-radius:var(--r);
  border:1px solid var(--bd);
  background:var(--s1);
  color:var(--tx);font-family:'IBM Plex Mono',monospace;
  font-size:1.1rem;font-weight:600;letter-spacing:2px;
  outline:0;text-align:center;direction:ltr;
  transition:all .3s ease;
}
.sbox input:focus{
  border-color:var(--ac);
  box-shadow:0 0 0 3px rgba(229,9,20,0.05);
}
.sbox input::placeholder{color:var(--t2);
  font-family:'Tajawal',sans-serif;font-size:.82rem;letter-spacing:0}
`;
}

/** الجزء 7 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart7() {
  return `
/* ═══ المعلومات ═══ */
.inf{
  display:none;
  background:var(--s1);
  border:1px solid var(--bd);border-radius:var(--r);
  padding:12px;margin-bottom:12px;
  font-size:.82rem;color:var(--t2);text-align:center;
}
.inf.on{display:block}
.inf span{color:var(--ac);font-weight:700}

/* ═══ النتائج ═══ */
.res{display:none;margin-top:12px}
.res.on{display:block}
.res-h{font-size:.82rem;color:var(--t2);
  margin-bottom:12px;text-align:center}
.res-h b{color:var(--ac)}
`;
}

/** الجزء 8 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart8() {
  return `
/* ═══ بطاقة الرحلة ═══ */
.card{
  background:var(--s1);
  border:1px solid var(--bd);
  border-radius:var(--r);padding:16px;margin-bottom:12px;
  box-shadow:var(--sh);
  animation:fu .25s cubic-bezier(0.32,0.94,0.6,1) both;
  transition:transform 250ms cubic-bezier(0.32,0.94,0.6,1);
}
.card:active{transform:scale(.97)}
.card:nth-child(2){animation-delay:.05s}
.card:nth-child(3){animation-delay:.1s}
.card:nth-child(4){animation-delay:.15s}
.card:nth-child(5){animation-delay:.2s}
@keyframes fu{
  from{opacity:0;transform:translateY(16px) scale(.97)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
.card .rn{font-size:.75rem;color:var(--t2);margin-bottom:8px}
.card .f{
  display:flex;justify-content:space-between;align-items:center;
  padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);
  font-size:.9rem;
}
.card .f:last-child{border:0}
.card .k{color:var(--t2);font-weight:500}
.card .v{font-weight:700;font-family:'IBM Plex Mono',monospace;
  direction:ltr;text-align:left}
.card .v.hl{color:var(--ac)}
.card-date{color:var(--t2);font-size:.75rem;margin-inline-start:8px}
`;
}

/** الجزء 9 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart9() {
  return `
/* ═══ بطاقة الصعود — Boarding Pass ═══ */
.bp-top{display:flex;align-items:center;margin-bottom:12px;
  padding-bottom:12px;border-bottom:2px dashed var(--bd);position:relative}
.bp-al{font-family:'IBM Plex Mono',monospace;
  font-size:.82rem;font-weight:700;color:var(--t2);
  min-width:32px;text-align:center}
.bp-flt{flex:1;text-align:center}
.bp-flt-num{font-family:'IBM Plex Mono',monospace;
  font-size:1.4rem;font-weight:800;color:var(--ac);
  display:block;letter-spacing:1px}
.bp-flt-date{font-size:.7rem;color:var(--t2);display:block;margin-top:2px}
.bp-dest{font-size:.82rem;font-weight:700;color:var(--tx);
  min-width:60px;text-align:center}
.bp-dot{width:8px;height:8px;border-radius:50%;
  border:2px solid var(--bd);flex-shrink:0}
.bp-line{flex:1;height:0;border-top:1px dashed var(--bd);margin:0 4px}

/* ═══ شريط التقدم ═══ */
.pbar{height:3px;border-radius:2px;margin-top:12px;
  background:rgba(0,0,0,0.05);overflow:hidden}
.pbar-fill{height:100%;border-radius:2px;
  transition:width 1s ease,background .5s ease}

/* ═══ الوضع المضغوط ═══ */
.card.compact-view{padding:8px 16px}
.card.compact-view .bp-top{margin-bottom:0;padding-bottom:0;
  border-bottom:0}
.card.compact-view .f,.card.compact-view .cdf,
.card.compact-view .pbar,.card.compact-view .rn{display:none}
.card.compact-view .bp-flt-num{font-size:.9rem}

.nodata{text-align:center;padding:32px;color:var(--t2)}
.nodata .ic{font-size:2.2rem;display:block;margin-bottom:8px}
`;
}

/** الجزء 10 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart10() {
  return `
/* ═══ العد التنازلي ═══ */
.cdf{
  background:rgba(229,9,20,0.06);border-radius:var(--r);
  padding:8px 12px;margin:8px 0;
  border:1px solid rgba(229,9,20,0.06);
}
.cd{font-family:'IBM Plex Mono',monospace;
  font-weight:700;color:var(--ac);font-size:.9rem}
.cd.soon{
  color:var(--ac);
  animation:pulse 1s ease infinite;
  text-shadow:0 0 12px rgba(229,9,20,0.05);
}
.cd.warn{color:var(--am);
  text-shadow:0 0 8px rgba(245,197,24,0.2)}
.cd.gone{color:rgba(136,136,136,1);font-style:italic;font-weight:500}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* ═══ بطاقة المُقلعة ═══ */
.card-dep{opacity:.35;border-color:rgba(0,0,0,0.06);
  box-shadow:none}
.dep-badge{
  display:inline-block;padding:4px 12px;border-radius:var(--r);
  background:rgba(0,0,0,0.05);color:rgba(119,119,119,1);
  font-size:.75rem;font-weight:700;margin-inline-start:8px;
  letter-spacing:.3px;
}
`;
}

/** الجزء 11 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart11() {
  return `
/* ═══ زر النسخ ═══ */
.cpb{display:none;text-align:center;margin-top:16px}
.cpb.on{display:block}
.cpb button{
  padding:12px 32px;border-radius:var(--r);border:0;
  background:var(--ac);color:#fff;
  font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:800;
  cursor:pointer;letter-spacing:.3px;
  box-shadow:0 4px 16px rgba(229,9,20,0.05);
  transition:all .2s ease;
}
.cpb button:active{transform:scale(.95);
  background:var(--ac2)}
.cpb button.ok{
  background:var(--ok);
  box-shadow:0 4px 16px rgba(22,163,74,0.15);
}

/* ═══ زر القائمة الجانبية ═══ */
.sb-toggle{
  position:fixed;
  top:calc(16px + var(--sat));
  right:calc(16px + var(--sar));
  z-index:100;
  width:46px;height:46px;border-radius:var(--r);
  border:1px solid var(--bd);
  background:var(--s1);
  color:var(--tx);font-size:1.1rem;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .2s ease;
  box-shadow:var(--sh);
}
.sb-toggle:active{transform:scale(.9)}
.sb-toggle .badge{
  position:absolute;top:-4px;left:-4px;
  min-width:20px;height:20px;border-radius:10px;
  background:var(--ac);
  color:#fff;font-size:.75rem;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  padding:0 4px;box-shadow:0 2px 8px rgba(229,9,20,0.05);
}
.sb-toggle .badge:empty{display:none}
`;
}

/** الجزء 12 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart12() {
  return `
/* ═══ القائمة الجانبية ═══ */
.sidebar{
  position:fixed;top:0;right:-320px;z-index:99;
  width:300px;max-width:85vw;height:100vh;height:100dvh;
  background:var(--s1);
  border-left:1px solid var(--bd);
  transition:right .35s cubic-bezier(.16,1,.3,1);
  display:flex;flex-direction:column;overflow:hidden;
}
.sidebar.open{right:0}
.sb-hdr{
  padding:calc(16px + var(--sat)) 16px 16px;
  border-bottom:1px solid var(--bd);
  display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;
}
.sb-hdr h2{
  font-size:1.1rem;font-weight:800;
  color:var(--ac);
}
.sb-close{
  background:rgba(255,255,255,.06);border:0;
  color:var(--t2);font-size:1.5rem;cursor:pointer;
  width:44px;height:44px;
  display:flex;align-items:center;justify-content:center;
  border-radius:var(--r);transition:all .2s;
}
.sb-close:active{background:rgba(255,255,255,.12);
  transform:scale(.9)}`;
}

/** الجزء 13 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart13() {
  return `
/* ═══ عدّاد الرحلة الأقرب ═══ */
.sb-hero{display:none;padding:16px;
  background:linear-gradient(135deg,rgba(229,9,20,0.05),rgba(229,9,20,0.04));
  border-bottom:1px solid var(--bd);flex-shrink:0;text-align:center}
.sb-hero.on{display:block}
.sb-hero-flt{font-family:'IBM Plex Mono',monospace;
  font-size:.82rem;font-weight:700;color:var(--t2)}
.sb-hero-dest{font-size:.75rem;color:var(--t2);margin-top:2px}
.sb-hero-time{font-family:'IBM Plex Mono',monospace;
  font-size:1.6rem;font-weight:800;color:var(--ac);
  margin-top:8px;letter-spacing:2px}
.sb-hero-label{font-size:.7rem;color:var(--t2);margin-top:4px}

.sb-list{flex:1;overflow-y:auto;padding:12px;
  -webkit-overflow-scrolling:touch}
.sb-empty{text-align:center;padding:32px 12px;
  color:var(--t2);font-size:.82rem}

.sb-item{
  background:var(--bg);
  border:1px solid var(--bd);
  border-radius:var(--r);padding:16px;margin-bottom:8px;
  position:relative;transition:all .2s ease;
  box-shadow:0 2px 8px rgba(0,0,0,0.08);
}
.sb-item:active{transform:scale(.97)}
.sb-item-gone{opacity:.35;border-color:rgba(0,0,0,0.06);
  box-shadow:none;transition:opacity .5s ease}
.sb-item .sb-flt{font-family:'IBM Plex Mono',monospace;
  font-size:.9rem;font-weight:700;color:var(--tx)}
.sb-item .sb-std{font-family:'IBM Plex Mono',monospace;
  font-size:.82rem;color:var(--t2);margin-top:4px}
.sb-item .sb-remain{font-family:'IBM Plex Mono',monospace;
  font-size:.82rem;font-weight:600;color:var(--ac);margin-top:4px}
.sb-item .sb-remain.soon{color:var(--ac);
  text-shadow:0 0 8px rgba(229,9,20,0.05)}
.sb-item .sb-remain.warn{color:var(--am)}
.sb-item .sb-remain.gone{color:rgba(136,136,136,1);font-style:italic}

.sb-tafweej{
  display:inline-block;margin-top:8px;
  padding:4px 12px;border-radius:var(--r);
  font-size:.75rem;font-weight:700;
  letter-spacing:.3px;
}`;
}

/** الجزء 14 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart14() {
  return `
.sb-tafweej.early{background:rgba(22,163,74,0.08);color:var(--ok);
  box-shadow:inset 0 0 0 1px rgba(22,163,74,0.1)}
.sb-tafweej.ontime{background:rgba(22,163,74,0.08);color:var(--ok);
  box-shadow:inset 0 0 0 1px rgba(22,163,74,0.1)}
.sb-tafweej.late{background:rgba(229,9,20,0.1);color:var(--ac);
  box-shadow:inset 0 0 0 1px rgba(229,9,20,.3)}
.sb-tafweej.departed{background:rgba(255,255,255,.08);color:rgba(136,136,136,1);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.15)}

.sb-rm{
  position:absolute;top:8px;left:8px;
  background:rgba(255,255,255,.05);border:0;
  color:var(--t2);font-size:1.1rem;cursor:pointer;
  width:44px;height:44px;
  display:flex;align-items:center;justify-content:center;
  border-radius:var(--r);transition:all .2s;
}
.sb-rm:active{background:rgba(229,9,20,.15);
  color:var(--ac);transform:scale(.85)}

/* ═══ خلفية معتمة — تخفي محتوى تيوب جداول خلف القائمة الجانبية ═══ */
.sb-overlay{position:fixed;inset:0;z-index:98;
  background:rgba(0,0,0,0.5);
  opacity:0;pointer-events:none;
  transition:opacity .3s ease}
.sb-overlay.open{opacity:1;pointer-events:auto}

.sb-clear{flex-shrink:0;
  padding:12px 16px calc(12px + var(--sab));
  border-top:1px solid var(--bd);text-align:center}
.sb-clear button{
  width:100%;padding:12px;border-radius:var(--r);
  background:rgba(229,9,20,.1);color:var(--ac);
  font-family:'Tajawal',sans-serif;font-size:.82rem;
  font-weight:700;cursor:pointer;
  border:1px solid rgba(229,9,20,0.1);
  transition:all .2s;
}
.sb-clear button:active{
  background:rgba(229,9,20,0.1);transform:scale(.97)}
`;
}

/** الجزء 15 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart15() {
  return `
/* ═══ تجميع حسب الشركة ═══ */
.grp-header{display:flex;align-items:center;gap:8px;
  padding:12px 16px;margin-bottom:4px;
  background:var(--s1);border:1px solid var(--bd);
  border-radius:var(--r);cursor:pointer;
  transition:all .2s ease}
.grp-header:active{transform:scale(.98)}
.grp-name{font-family:'IBM Plex Mono',monospace;
  font-size:.9rem;font-weight:700;color:var(--tx)}
.grp-count{font-size:.75rem;color:var(--t2);flex:1}
.grp-arrow{color:var(--ac);font-size:.9rem}
.grp-body{margin-bottom:12px}

/* ═══ انتقال النتائج ═══ */
#rl{transition:opacity .2s ease}

/* ═══ أزرار التحكم متعددة ═══ */
`;
}

/** الجزء 16 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart16() {
  return `
/* ═══ صفوف القائمة المضغوطة ═══ */
.mini-row{
  background:var(--s1);
  border:1px solid var(--bd);
  border-radius:var(--r);
  margin:0 0 3px;
  cursor:pointer;
  transition:all .15s;
  -webkit-tap-highlight-color:transparent;
  overflow:hidden;
}
.mini-row:active{background:var(--bd)}
.mini-row.mini-dep{opacity:.4}
/* رحلة ألغاها المطار: رقمها ووقتها مشطوبان، وكلمة «ملغية» بالأحمر في خانة التفويج */
.mini-row.mini-cancel .mini-flt,.mini-row.mini-cancel .mini-std{text-decoration:line-through}
.mini-row.mini-open{border-color:var(--ac)}
.mini-main{
  display:grid;
  grid-template-columns: 28px 42px 54px 38px 36px 58px 1fr;
  align-items:center;
  gap:0;padding:7px 6px;
  font-size:.65rem;
  direction:ltr;
}
.mini-al{
  font-family:'IBM Plex Mono',monospace;
  font-weight:700;color:var(--ac);
  font-size:.65rem;text-align:center;
}
.mini-flt{
  font-family:'IBM Plex Mono',monospace;
  font-weight:600;color:var(--tx);
  font-size:.65rem;text-align:center;
}
.mini-dest{
  color:var(--t2);font-size:.58rem;
  text-align:center;
  overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;direction:rtl;
}
.mini-std{
  font-family:'IBM Plex Mono',monospace;
  color:var(--tx);font-size:.65rem;
  font-weight:500;text-align:center;
}`;
}

/** الجزء 17 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart17() {
  return `
.mini-tf{
  font-size:.55rem;font-weight:700;
  text-align:center;
}
.mini-handler{
  font-family:'IBM Plex Mono',monospace;
  font-size:.52rem;font-weight:700;
  padding:2px 3px;border-radius:3px;
  text-align:center;
}
.mini-handler.sgs{background:rgba(229,9,20,0.05);color:#E50914}
.mini-handler.swissport{background:rgba(37,99,235,0.1);color:#2563eb}
.mini-rm{
  font-family:'IBM Plex Mono',monospace;
  font-size:.58rem;font-weight:600;
  text-align:left;white-space:nowrap;
}

/* رأس الأعمدة */
.mini-header{
  display:grid;
  grid-template-columns: 28px 42px 54px 38px 36px 58px 1fr;
  gap:0;padding:5px 6px;
  font-size:.5rem;color:var(--t2);
  font-weight:600;
  border-bottom:1px solid var(--bd);
  margin-bottom:4px;
  direction:ltr;
  position:sticky;top:0;
  background:var(--bg);z-index:2;
}
.mini-header span{text-align:center}

/* قسم التوسيع */
.mini-expand{
  display:none;
  padding:0 10px 8px;
  border-top:1px solid var(--bd);
  direction:rtl;
}
.mini-expand.open{display:block}
.mini-det{
  display:flex;justify-content:space-between;
  padding:3px 0;font-size:.65rem;
  border-bottom:1px solid rgba(0,0,0,0.03);`;
}

/** الجزء 18 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart18() {
  return `
}
.mini-det span:first-child{color:var(--t2)}
.mini-det span:last-child{
  color:var(--tx);font-weight:500;
  font-family:'IBM Plex Mono',monospace;
}

/* ═══ أزرار حذف وحفظ الجداول ═══ */
.fq-actions-bar{
  display:none;gap:8px;margin-top:8px;
}
.fq-actions-bar.on{display:flex}
.fqa-btn{
  flex:1;display:flex;align-items:center;
  justify-content:center;gap:6px;
  padding:10px;border-radius:var(--r);
  font-family:'Tajawal',sans-serif;
  font-size:.78rem;font-weight:600;
  cursor:pointer;transition:all .15s;
  border:1px solid var(--bd);
}
.fqa-btn:active{transform:scale(.97)}
.fqa-save{
  background:rgba(22,163,74,0.08);
  color:#16a34a;border-color:rgba(22,163,74,0.15);
}
.fqa-delete{
  background:rgba(229,9,20,0.06);
  color:#E50914;border-color:rgba(229,9,20,0.05);
}
.fqa-ic{font-size:1rem}
`;
}

/** الجزء 19 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart19() {
  return `
/* ═══ القائمة المنبثقة ═══ */
.fq-modal-overlay{
  display:none;position:fixed;inset:0;
  background:rgba(255,255,255,0.85);z-index:9999;
  align-items:center;justify-content:center;
  padding:20px;
}
.fq-modal-overlay.open{display:flex}
.fq-modal{
  background:var(--s1);border:1px solid var(--bd);
  border-radius:12px;width:100%;max-width:400px;
  max-height:70vh;display:flex;flex-direction:column;
  overflow:hidden;
}
.fq-modal-hdr{
  display:flex;justify-content:space-between;
  align-items:center;padding:14px 16px;
  border-bottom:1px solid var(--bd);
  font-weight:700;font-size:.9rem;
  color:var(--tx);
}
.fq-modal-close{
  background:0;border:0;color:var(--t2);
  font-size:1.4rem;cursor:pointer;
  width:36px;height:36px;
  display:flex;align-items:center;justify-content:center;
}
.fq-modal-body{
  flex:1;overflow-y:auto;padding:12px 16px;
  -webkit-overflow-scrolling:touch;
}
.fq-modal-foot{
  padding:12px 16px;border-top:1px solid var(--bd);
}
.fq-modal-foot .fqa-btn{width:100%}
.fq-chk-item{
  display:flex;align-items:center;gap:10px;
  padding:10px 0;
  border-bottom:1px solid rgba(0,0,0,0.03);
  cursor:pointer;
}
.fq-chk-item:active{opacity:.7}`;
}

/** الجزء 20 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart20() {
  return `
.fq-chk-box{
  width:22px;height:22px;
  border:2px solid var(--bd);border-radius:4px;
  display:flex;align-items:center;justify-content:center;
  font-size:.8rem;color:transparent;
  transition:all .15s;flex-shrink:0;
}
.fq-chk-item.checked .fq-chk-box{
  border-color:#E50914;background:rgba(229,9,20,0.05);
  color:#E50914;
}
.fq-chk-info{flex:1;direction:rtl}
.fq-chk-name{font-size:.78rem;font-weight:600;color:var(--tx)}
.fq-chk-meta{font-size:.65rem;color:var(--t2);margin-top:2px}

/* ═══ تقليل الحركة ═══ */
@media(prefers-reduced-motion:reduce){
  *{animation-duration:0s !important;
    transition-duration:0s !important}
}
`;
}

/** الجزء 21 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart21() {
  return `
/* ═══ شريط التبويبات ═══ */
.tabs-bar{
  display:flex;gap:0;
  max-width:560px;margin:0 auto;
  padding:0 12px;
  background:var(--bg);
}
.tab-btn{
  flex:1;padding:8px 4px;
  background:transparent;border:none;
  color:var(--t2);font-size:.72rem;
  font-family:'Tajawal',sans-serif;
  font-weight:600;cursor:pointer;
  border-bottom:2px solid transparent;
  transition:all .2s;
  display:flex;flex-direction:column;
  align-items:center;gap:2px;
}
.tab-btn .tab-ic{font-size:1.1rem;line-height:1}
.tab-btn .tab-lb{font-size:.68rem}
.tab-btn.tab-active{
  color:var(--ac);
  border-bottom-color:var(--ac);
}
`;
}

/** الجزء 22 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart22() {
  return `
/* ═══ فلترة الرحلات الحية ═══ */
.lf-bar{
  display:flex;gap:6px;
  padding:0 16px;margin-bottom:12px;
  max-width:560px;margin-left:auto;margin-right:auto;
}
.lf-btn{
  flex:1;padding:8px 4px;
  border-radius:var(--r);
  border:1px solid var(--bd);
  background:transparent;
  color:var(--t2);font-size:.78rem;
  font-family:'Tajawal',sans-serif;
  font-weight:500;cursor:pointer;
  transition:all .2s;
}
.lf-btn.lf-active{
  background:var(--ac);
  color:#fff;border-color:var(--ac);
}

/* ═══ معلومات الرحلات الحية ═══ */
.live-info{
  display:flex;justify-content:space-between;
  align-items:center;
  padding:8px 16px;
  max-width:560px;margin:0 auto;
  font-size:.75rem;color:var(--t2);
}
.live-src{
  opacity:.6;font-size:.7rem;
}
/* صف زر الإخفاء ونص آخر تحديث — سطر واحد بلا التفاف */
#lvVtoggle{
  justify-content:space-between;align-items:center;
  padding:0 16px;max-width:560px;margin:0 auto 6px;
}
#lvVtoggle .live-src{white-space:nowrap}
`;
}

/** الجزء 23 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart23() {
  return `
/* ═══ أزرار شركات الطيران ═══ */
.al-btn{
  flex:1;padding:8px 4px;
  border-radius:var(--r);
  border:1px solid var(--bd);
  background:transparent;
  color:var(--t2);font-size:.78rem;
  font-family:'Tajawal',sans-serif;
  font-weight:500;cursor:pointer;
  transition:all .2s;
}
.al-btn.al-active{
  background:var(--ac);
  color:#fff;border-color:var(--ac);
}

/* بطاقة ناقل */
.al-card{
  background:var(--s1);
  border:1px solid var(--bd);
  border-radius:var(--r);
  padding:12px 14px;
  margin:0 16px 8px;
  max-width:528px;
  margin-left:auto;margin-right:auto;
  display:flex;align-items:center;gap:10px;
}
.al-code{
  font-family:'IBM Plex Mono',monospace;
  font-size:1.1rem;font-weight:700;
  color:var(--ac);min-width:36px;
  text-align:center;cursor:pointer;
  transition:transform .15s;
}
.al-code:active{transform:scale(1.2)}
.al-info{flex:1}
.al-name{font-size:.85rem;font-weight:600;color:var(--tx)}
.al-country{
  font-size:.72rem;color:var(--t2);margin-top:2px;
  cursor:pointer;display:inline-block;
  padding:2px 6px;border-radius:3px;
  transition:all .15s;
}
.al-country:active{background:rgba(0,0,0,0.06)}`;
}

/** الجزء 24 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart24() {
  return `
.al-handler{
  font-family:'IBM Plex Mono',monospace;
  font-size:.68rem;font-weight:600;
  padding:4px 8px;border-radius:var(--r);
  cursor:pointer;transition:all .15s;
}
.al-handler:active{transform:scale(1.1)}
.al-handler.sgs{background:rgba(229,9,20,0.05);color:#E50914}
.al-handler.swissport{background:rgba(37,99,235,0.1);color:#2563eb}

/* ═══ فئات مساعدة ═══ */
.hidden{display:none}
.fb-indicator{
  position:absolute;left:12px;top:50%;transform:translateY(-50%);
  display:flex;align-items:center;gap:5px;direction:rtl;
}
.fb-dot{
  width:10px;height:10px;border-radius:50%;
  background:#E50914;box-shadow:0 0 6px #E50914;
  display:inline-block;transition:all 0.4s ease;
}
.fb-label{
  font-size:9px;color:rgba(119,119,119,1);
  font-family:Tajawal,sans-serif;
}
/* شريط الإشعارات */
.notif-bar{display:flex;justify-content:space-between;align-items:center;padding:8px 0}
.notif-count{font-size:13px;opacity:0.6}
.notif-refresh{
  background:none;border:1px solid #16a34a;color:#16a34a;
  border-radius:6px;padding:6px 14px;font-family:Tajawal,sans-serif;
  font-size:13px;cursor:pointer;
}
/* أزرار الرحلات الحية */
.live-act-btn{padding:8px 6px}
.live-clear-btn{padding:8px 6px;border-color:#E50914;color:#E50914}
/* زر تحديث فايربيس */
.fqa-fb-refresh{border-color:#16a34a;color:#16a34a}
/* عناصر الإشعارات الديناميكية */
.ntf-loading{text-align:center;padding:20px;opacity:0.5}
.ntf-error{text-align:center;padding:20px;color:#E50914}
.ntf-card{background:#fff;border-radius:8px;padding:12px;margin-bottom:8px}
.ntf-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.ntf-title{font-size:14px;font-weight:700}
.ntf-time{font-size:11px;opacity:0.5}`;
}

/** الجزء 25 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart25() {
  return `
.ntf-user{font-size:12px;opacity:0.7;margin-bottom:4px}
.ntf-user-role{opacity:0.5}
.ntf-details{font-size:12px;opacity:0.8}
.ntf-flight{background:#fafafa;border-radius:6px;padding:8px;margin-top:6px;font-size:12px;direction:rtl}
.ntf-flight-row{margin-bottom:3px}
/* عناصر الملف الشخصي */
.pf-team-title{
  padding:12px 0 8px;font-size:14px;font-weight:700;
  color:#ca8a04;border-top:1px solid #cccccc;margin-top:12px;
}
.pf-team-avatar-icon{font-size:18px}

/* ═══ تبويبات سفلية ثابتة ═══ */
.tabs-bottom{
  position:fixed !important;
  bottom:0;left:0;right:0;
  z-index:50;
  /* بلا --sab: المنطقة الآمنة كانت تضيف ٣٤ بكسل شريطًا أسود فارغًا
     أسفل الأيقونات على الآيفون (قيس: ٨٣ بكسل بدل ٤٩). */
  padding:4px 0;
  background:rgba(0,0,0,0.92);
  -webkit-backdrop-filter:blur(20px);
  backdrop-filter:blur(20px);
  border-top:1px solid rgba(0,0,0,0.05);
  display:flex;gap:0;
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  scrollbar-width:none;
}
.tabs-bottom::-webkit-scrollbar{display:none}
.tabs-bottom .tab-btn{
  flex:0 0 auto;
  min-width:56px;
  padding:6px 4px 4px;
  border-bottom:none;
  border-top:2px solid transparent;
  font-size:.64rem;
}
.tabs-bottom .tab-btn.tab-active{
  border-top-color:var(--ac);
  border-bottom:none;
}
.tabs-bottom .tab-btn .tab-ic{font-size:.95rem}
.tabs-bottom .tab-btn .tab-lb{font-size:.6rem}
.tab-side{position:relative}`;
}

/** الجزء 26 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart26() {
  return `
.tab-side .badge{
  position:absolute;top:2px;right:2px;
  font-size:8px;background:#E50914;color:#fff;
  border-radius:50%;min-width:14px;height:14px;
  display:flex;align-items:center;justify-content:center;
}
.tab-side .badge:empty{display:none}

/* تعويض ارتفاع الشريط السفلي.
   بلا --sab بعد أن رُفعت المنطقة الآمنة من حشوة الشريط نفسه: حجزُ ما
   لم يعد الشريط يشغله يترك فراغًا ميتًا أسفل كل تيوب. */
body{
  padding-bottom:var(--tabsH) !important;
}

/* النقطة — موقع واضح بجانب الاسم */
.fb-indicator{
  position:relative !important;
  left:auto !important;top:auto !important;
  transform:none !important;
  display:flex;align-items:center;gap:5px;direction:rtl;
  margin-right:4px;
}
.fb-dot{
  width:10px;height:10px;border-radius:50%;
  background:#E50914;box-shadow:0 0 8px #E50914;
  display:inline-block;transition:all 0.4s ease;
  cursor:pointer;
}
.fb-label{
  font-size:9px;color:rgba(119,119,119,1);
  font-family:Tajawal,sans-serif;
}
`;
}

/** الجزء 27 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart27() {
  return `
/* ═══ السايدبار الجديد ═══ */
.sb-section{
  padding:12px 16px;
  border-bottom:1px solid rgba(0,0,0,0.05);
}
.sb-section-title{
  font-size:12px;font-weight:700;color:#666666;
  margin-bottom:8px;direction:rtl;
}
.sb-date-input{
  width:100%;padding:10px 12px;
  background:#fff;border:1px solid rgba(0,0,0,0.06);
  border-radius:8px;color:#1a1a1a;
  font-family:'IBM Plex Mono',monospace;font-size:14px;
  direction:ltr;text-align:center;outline:none;
  -webkit-appearance:none;
}
.sb-date-input:focus{border-color:#E50914}
.sb-stats{
  display:grid;grid-template-columns:1fr 1fr;gap:8px;
}
.sb-stat-cell{
  background:#fff;padding:10px;border-radius:8px;
  text-align:center;
  border:1px solid rgba(0,0,0,0.05);
}
.sb-stat-val{
  font-family:'IBM Plex Mono',monospace;
  font-size:16px;font-weight:700;color:#1a1a1a;
}
.sb-stat-lbl{
  font-size:10px;color:#666666;margin-top:2px;
}
/* أزرار الحفظ/التحديث/الحذف في السايدبار */
.fq-actions-bar.on{
  display:flex;gap:8px;flex-wrap:wrap;
}
.fqa-btn{
  flex:1;padding:10px;border:1px solid rgba(0,0,0,0.06);
  border-radius:8px;background:#fff;color:#1a1a1a;
  font-family:Tajawal,sans-serif;font-size:13px;font-weight:600;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
  transition:all 0.15s;
}
.fqa-btn:active{transform:scale(0.95)}`;
}

/** الجزء 28 من 28 من نصّ `getStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getStylesPart28() {
  return `
.fqa-save{border-color:#16a34a;color:#16a34a}
.fqa-delete{border-color:#E50914;color:#E50914}
.fqa-fb-refresh{border-color:#2563eb;color:#2563eb}

/* ═══ زر إخفاء المغادرة ═══ */
#hideDepBtn.vt-active{
  background:rgba(229,9,20,0.05);color:#E50914;
  border-color:#E50914;
}

/* ═══ إلغاء الزووم — التمرير فقط ═══ */
html{touch-action:pan-y}
`;
}

module.exports = Object.freeze({ getStyles });
