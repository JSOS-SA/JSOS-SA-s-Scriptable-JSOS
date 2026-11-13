// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: eye;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_live_view.js

/**
 * @module fq_live_view
 * @description طبقة عرض الرحلات الحية داخل ويب فيو الأداة الرئيسية.
 * تُرجع نص JavaScript محقوناً (بحث، فلترة، تجميع حسب الصالة، بطاقات).
 * لا تعرف شيئاً عن الكشط ولا التخزين المحلي.
 */

// مدّة انتظار البحث تُقرأ من الإعدادات ولا تُكتب هنا رقمًا. وحدة الإعدادات
// لا تستورد هذه الوحدة ولا شيئًا يؤدّي إليها، فلا استيراد دائريّ.
const cfg = importModule("fq_config");

// ═══ كود الواجهة — داخل ويب فيو الأداة الرئيسية ═══
/**
 * يُرجع كود JavaScript نظام الرحلات الحية للحقن في WebView.
 * @returns {string}
 */
function getLiveCode() {
  return getLiveCodePart1() +
    getLiveCodePart2() +
    getLiveCodePart3() +
    getLiveCodePart4() +
    getLiveCodePart5() +
    getLiveCodePart6() +
    getLiveCodePart7() +
    getLiveCodePart8() +
    getLiveCodePart9() +
    getLiveCodePart10();
}

/** الجزء 1 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart1() {
  return `
// ═══ حقن CSS لأقسام الصالات ═══
(function _injectLiveTermCss(){
  if(document.getElementById("live-term-css"))return;
  const st=document.createElement("style");
  st.id="live-term-css";
  st.textContent=".live-section{margin-bottom:12px;border:1px solid rgba(0,0,0,0.08);border-radius:10px;overflow:hidden;background:#fff}"
    +".live-section-hd{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#fafafa;cursor:pointer;border-bottom:1px solid rgba(0,0,0,0.05);direction:rtl;font-family:Tajawal,sans-serif}"
    +".live-section-hd:active{background:#f0f0f0}"
    +".live-section-title{font-size:14px;font-weight:700;color:#1a1a1a}"
    +".live-section-count{font-size:12px;color:#E50914;background:rgba(229,9,20,0.08);padding:2px 8px;border-radius:10px;font-weight:700}"
    +".live-section-body{padding:8px}"
    +".live-section.live-collapsed .live-section-body{display:none}";
  document.head.appendChild(st);
})();

let liveFilterMode="all";
let liveSearchTimer=null;
let liveTab=document.getElementById("liveTab");
const livePdfTab=document.getElementById("pdfTab");
let livePanel=document.getElementById("livePanel");
let pdfPanel=document.getElementById("pdfPanel");
let liveInput=document.getElementById("liveInput");
let liveResults=document.getElementById("liveResults");
let liveAge=document.getElementById("liveAge");
const liveFilterBtns=document.querySelectorAll(".lf-btn[data-lf]");
`;
}

/** الجزء 2 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart2() {
  return `
// ═══ النقر على رأس قسم — طي/فتح ═══
document.addEventListener("click",function(e){
  const hd=e.target.closest(".live-section-hd");
  if(!hd)return;
  const sec=hd.parentElement;
  if(sec)sec.classList.toggle("live-collapsed");
});

// تبديل التبويبات
if(liveTab){liveTab.addEventListener("click",function(){
  if(typeof hideAllPanels==="function")hideAllPanels();
  liveTab.classList.add("tab-active");
  livePanel.style.display="block";
  doLiveSearch();
})}
if(livePdfTab){livePdfTab.addEventListener("click",function(){
  if(typeof hideAllPanels==="function")hideAllPanels();
  livePdfTab.classList.add("tab-active");
  pdfPanel.style.display="block";
})}

// فلترة
for(let lfi=0;lfi<liveFilterBtns.length;lfi++){
  liveFilterBtns[lfi].addEventListener("click",function(){
    liveFilterMode=this.getAttribute("data-lf");
    for(let x=0;x<liveFilterBtns.length;x++)
      liveFilterBtns[x].classList.remove("lf-active");
    this.classList.add("lf-active");
    const ph={all:"ابحث برقم الرحلة أو الناقل أو الوجهة…",
      flight:"رقم الرحلة مثل SV302",
      airline:"رمز الناقل مثل SV",
      dest:"رمز الوجهة مثل CAI"};
    if(liveInput)liveInput.placeholder=ph[liveFilterMode]||ph.all;
    lvRefreshAll();
  });
}

// بحث فوري
if(liveInput){liveInput.addEventListener("input",function(){
  clearTimeout(liveSearchTimer);
  liveSearchTimer=setTimeout(lvRefreshAll,${cfg.SEARCH_DEBOUNCE_MS});
})}
`;
}

/** الجزء 3 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart3() {
  return `
// قواعد لون الحالة بترتيبها: أول قاعدة يطابق نصُّ الحالة عربيَّها أو إنجليزيَّها تُحدّد اللون.
const LV_COLOR_RULES=[
  ["إركاب","Board","#ca8a04"],
  ["غادرت","Depart","#8b5cf6"],
  ["ملغ","Cancel","#dc2626"],
  ["متأخر","Delay","#dc2626"],
  ["نداء","Final","#E50914"],
  ["البوابة","Gate","#2563eb"],
  ["إنهاء","Check","#f59e0b"],
  ["أُغلق","Close","#6b7280"]
];

function lvColor(s){
  if(!s)return"#64748b";
  for(let i=0;i<LV_COLOR_RULES.length;i++){
    const r=LV_COLOR_RULES[i];
    if(s.indexOf(r[0])!==-1||s.indexOf(r[1])!==-1)return r[2];
  }
  return"#64748b";
}

// اسم الوجهة على البطاقة: اسم كايا ورمزها، وإلا اسمها من القاموس، وإلا "—".
function lvDestLabel(f){
  return f.destName
    ?f.destName+" "+(f.dest||"")
    :(f.dest?(typeof airportName==="function"?airportName(f.dest):countryName(f.dest)):"—");
}

// وقت الإقلاع على البطاقة، والمقدَّر إن اختلف عنه: الأصلي مشطوب ثم المقدَّر.
function lvTimeHtml(f){
  let tm=f.time||"—";
  if(f.estimated&&f.estimated!==f.time){
    tm='<span style="text-decoration:line-through;opacity:.5">'
      +f.time+'</span> '+f.estimated;
  }
  return tm;
}

`;
}

/** الجزء 4 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart4() {
  return `
function buildLvCard(f){
  let sc=lvColor(f.status);
  let dest=lvDestLabel(f);
  let tm=lvTimeHtml(f);
  return lvCardTop(f,sc,dest)+lvCardBottom(sc,tm);
}

// أعلى البطاقة: الناقلة، ثم رقم الرحلة وحالتها، ثم الوجهة.
function lvCardTop(f,sc,dest){
  // الصالة ورقم الرحلة على البطاقة: بهما يفتح الضغط المطوّل الرحلةَ المحفوظة
  // المطابقة في نافذة التعديل (fq_editflight)
  return '<div class="card" data-lv-term="'+fqEsc(f.terminal||"")+'" data-lv-flt="'+fqEsc(f.flight||"")+'">'
    +'<div class="bp-top">'
    +'<div class="bp-al" data-act="go-airline" data-val="'+(f.airline||"")+'" style="cursor:pointer">'+(f.airline||"—")+'</div>'
    +'<div class="bp-dot"></div>'
    +'<div class="bp-line"></div>'
    +'<div class="bp-flt">'
    +'<span class="bp-flt-num">'+(f.flight||"—")+'</span>'
    +'<span class="bp-flt-date" style="color:'+sc+'">'
    +(f.status||"مُجدولة")+'</span>'
    +'</div>'
    +'<div class="bp-line"></div>'
    +'<div class="bp-dot"></div>'
    +'<div class="bp-dest" data-act="go-dest" data-val="'+(f.destName||f.dest||"")+'" style="cursor:pointer">'+dest+'</div>'
    +'</div>';
}

// أسفل البطاقة: الوقت، ثم شريط التقدّم بلون الحالة.
function lvCardBottom(sc,tm){
  return '<div class="f"><span class="k">الوقت</span>'
    +'<span class="v">'+tm+'</span></div>'
    +'<div class="pbar"><div class="pbar-fill" style="'
    +'width:100%;background:'+sc+';opacity:.3"></div></div>'
    +'</div>';
}
`;
}

/** الجزء 5 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart5() {
  return `
// تفاعل في بطاقات الرحلات الحية
document.addEventListener("click",function(e){
  let el=e.target.closest("[data-act='go-airline']");
  if(el){lvGoSearch(el.getAttribute("data-val"));return}
  let el2=e.target.closest("[data-act='go-dest']");
  if(el2)lvGoSearch(el2.getAttribute("data-val"));
});

// ينتقل إلى تبويب الناقلين ويبحث عن الرمز، إن كان رمزًا صالحًا.
function lvGoSearch(code){
  if(code&&code!=="—"&&typeof alTab!=="undefined"){
    // انتقل لتبويب الناقلين وابحث عن الرمز
    alTab.click();
    setTimeout(function(){
      if(alInput){alInput.value=code;doAlSearch()}
    },100);
  }
}

// ═══ تسميات الصالات للعرض — hajj/t1/north/hall4 فقط، لا فئة أخرى ═══
function lvTerminalLabel(t){
  if(t==="hajj")return"صالة الحج";
  if(t==="t1")return"صالة 1";
  if(t==="north")return"الصالة الشمالية";
  if(t==="hall4")return"صالة 4";
  return"";
}
`;
}

/** الجزء 6 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart6() {
  return `
// ═══ تجميع الرحلات حسب الصالة — بلا فئة "غير محددة" (أُلغيت بقرار صريح) ═══
function lvGroupByTerminal(arr){
  let g={hajj:[],t1:[],north:[],hall4:[]};
  for(let i=0;i<arr.length;i++){
    let t=arr[i].terminal||"";
    if(g[t])g[t].push(arr[i]);
  }
  return g;
}

// ═══ بناء HTML لقسم صالة واحدة ═══
function lvBuildSection(key,label,flights){
  if(!flights||flights.length===0)return"";
  let h='<div class="live-section">';
  h+='<div class="live-section-hd" data-lv-section="'+key+'">';
  h+='<span class="live-section-title">'+label+'</span>';
  h+='<span class="live-section-count">'+flights.length+' رحلة</span>';
  h+='</div>';
  h+='<div class="live-section-body">';
  for(let i=0;i<flights.length;i++)h+=buildLvCard(flights[i]);
  h+='</div></div>';
  return h;
}
`;
}

/** الجزء 7 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart7() {
  return `
// ═══ إخفاء الرحلات المغادرة — يخص صالة 1 والصالة الشمالية وصالة 4 فقط ═══
// الحالة الابتدائية إخفاء دائم عند كل فتح للواجهة
let _lvHideDeparted=true;
let lvHideDepBtn=document.getElementById("lvHideDepBtn");

// رحلة مغادرة = حالتها تحمل كلمة الإقلاع بالعربية أو الإنجليزية
function lvIsDeparted(f){
  const s=f.status||"";
  return s.indexOf("غادرت")!==-1||s.indexOf("Departed")!==-1;
}

function lvDropDeparted(arr){
  if(!_lvHideDeparted)return arr;
  return arr.filter(function(f){return !lvIsDeparted(f)});
}

// مزامنة مظهر الزر مع الحالة — بلا تعشيش
function lvSyncHideBtn(){
  if(!lvHideDepBtn)return;
  const lb=lvHideDepBtn.querySelector(".vt-lb");
  if(!lb)return;
  if(_lvHideDeparted){
    lvHideDepBtn.classList.add("vt-active");
    lb.textContent="إظهار المغادرة";
    return;
  }
  lvHideDepBtn.classList.remove("vt-active");
  lb.textContent="إخفاء المغادرة";
}

if(lvHideDepBtn){lvHideDepBtn.addEventListener("click",function(){
  _lvHideDeparted=!_lvHideDeparted;
  lvSyncHideBtn();
  if(typeof showToast==="function"){
    showToast(_lvHideDeparted
      ?"تم إخفاء الرحلات المغادرة"
      :"تم إظهار الرحلات المغادرة","info",1500);
  }
  lvRefreshAll();
})}
`;
}

/** الجزء 8 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart8() {
  return `
function doLiveSearch(){
  if(!LIVE_DATA||LIVE_DATA.length===0){
    if(liveResults)liveResults.innerHTML="";
    return;
  }
  let q=liveInput?liveInput.value.trim().toLowerCase():"";
  let f=q?LIVE_DATA.filter(function(d){return lvMatches(d,q)}):LIVE_DATA;
  // ═══ تقسيم حسب الصالة — بلا قسم "غير محددة" (أُلغي بقرار صريح) ═══
  let groups=lvGroupShown(f);
  if(lvShownCount(groups)===0){
    liveResults.innerHTML="";
    return;
  }
  liveResults.innerHTML=lvBuildSections(groups);
}

`;
}

/** الجزء 9 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart9() {
  return `
// هل تطابق الرحلةُ نصَّ البحث بحسب وضع التصفية (رحلة / ناقلة / وجهة / كل النص)؟
function lvMatches(d,q){
  let fl=(d.flight||"").toLowerCase();
  let al=(d.airline||"").toLowerCase();
  let ds=(d.dest||"").toLowerCase();
  let dn=(d.destName||"").toLowerCase();
  let rw=(d.raw||"").toLowerCase();
  if(liveFilterMode==="flight")return fl.indexOf(q)!==-1;
  if(liveFilterMode==="airline")return al.indexOf(q)!==-1;
  if(liveFilterMode==="dest")
    return ds.indexOf(q)!==-1||dn.indexOf(q)!==-1;
  return rw.indexOf(q)!==-1;
}

// الرحلات مقسّمةً بحسب الصالة، وصالاتُ الجداول بلا ما غادر.
function lvGroupShown(f){
  let groups=lvGroupByTerminal(f);
  groups.t1=lvDropDeparted(groups.t1);
  groups.north=lvDropDeparted(groups.north);
  groups.hall4=lvDropDeparted(groups.hall4);
  return groups;
}

function lvShownCount(groups){
  return groups.hajj.length+groups.t1.length+groups.north.length+groups.hall4.length;
}

function lvBuildSections(groups){
  let h="";
  h+=lvBuildSection("hajj",lvTerminalLabel("hajj"),groups.hajj);
  h+=lvBuildSection("t1",lvTerminalLabel("t1"),groups.t1);
  h+=lvBuildSection("north",lvTerminalLabel("north"),groups.north);
  h+=lvBuildSection("hall4",lvTerminalLabel("hall4"),groups.hall4);
  return h;
}
`;
}

/** الجزء 10 من 10 من نصّ `getLiveCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getLiveCodePart10() {
  return `
// ═══ تحديث نتائج البحث وقوائم الصالات معاً ═══
function lvRefreshAll(){
  doLiveSearch();
  if(typeof hallRenderAll==="function")hallRenderAll();
}
lvSyncHideBtn();
setTimeout(doLiveSearch,300);

// عرض عمر البيانات
if(liveAge && typeof LIVE_AGE!=="undefined" && LIVE_AGE>0){
  liveAge.textContent="آخر تحديث منذ "+LIVE_AGE+" دقيقة";
}
`;
}

module.exports = Object.freeze({ getLiveCode });
