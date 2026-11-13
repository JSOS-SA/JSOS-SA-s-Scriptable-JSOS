// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_addflight.js

// ═══ هيكل النموذج ═══
/**
 * يبني بنية نموذج إضافة رحلة يدوية.
 * @returns {string} نص HTML للنموذج
 */
function getAddFlightHtml() {
  return getAddFlightHtmlPart1() +
    getAddFlightHtmlPart2();
}

/** الجزء 1 من 2 من نصّ `getAddFlightHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightHtmlPart1() {
  return `
<div class="af-wrap">
  <button class="af-toggle" id="afToggle">
    <span class="af-ic">+</span>
    <span>إضافة رحلة يدوية</span>
  </button>
  <div class="af-form" id="afForm">
    <div class="af-row">
      <div class="af-field">
        <label>رمز الناقل</label>
        <input type="text" id="afAl" placeholder="SV"
          maxlength="3" autocomplete="off" dir="ltr">
      </div>
      <div class="af-field">
        <label>رقم الرحلة</label>
        <input type="text" id="afFlt" placeholder="302"
          maxlength="5" autocomplete="off" dir="ltr">
      </div>
    </div>
    <div class="af-row">
      <div class="af-field">
        <label>وقت الإقلاع</label>
        <input type="time" id="afTime" dir="ltr">
      </div>
      <div class="af-field af-dest-wrap">
        <label>الوجهة</label>
        <input type="text" id="afDest" placeholder="CAI أو القاهرة"
          autocomplete="off" dir="rtl">
        <div class="af-suggest" id="afSuggest"></div>
      </div>
    </div>
    <div class="af-row">
      <div class="af-field">
        <label>تظهر الرحلة في</label>
        <select id="afTerminal">
          <option value="">جداول</option>
          <option value="t1">صالة 1</option>
          <option value="north">الصالة الشمالية</option>
          <option value="hall4">صالة 4</option>
        </select>
      </div>
    </div>
    <div class="af-preview" id="afPreview">
      <span style="opacity:.5">المعاينة ستظهر هنا</span>
    </div>
    <button class="af-submit" id="afSubmit" disabled>`;
}

/** الجزء 2 من 2 من نصّ `getAddFlightHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightHtmlPart2() {
  return `
      إضافة الرحلة
    </button>
  </div>
</div>`;
}

// ═══ أنماط النموذج ═══
/**
 * يبني أنماط نموذج إضافة رحلة يدوية.
 * @returns {string} نص CSS
 */
function getAddFlightStyles() {
  return getAddFlightStylesPart1() +
    getAddFlightStylesPart2() +
    getAddFlightStylesPart3();
}

/** الجزء 1 من 3 من نصّ `getAddFlightStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightStylesPart1() {
  return `
/* ═══ إضافة رحلة يدوية ═══ */
.af-wrap{margin-top:8px}
.af-toggle{
  display:flex;align-items:center;gap:8px;
  background:var(--s1);border:1px solid var(--bd);
  border-radius:var(--r);padding:10px 14px;
  color:var(--ac);font-size:.78rem;font-weight:600;
  font-family:'Tajawal',sans-serif;
  cursor:pointer;width:100%;text-align:right;
  transition:all .2s;
}
.af-toggle:active{background:var(--bd)}
.af-ic{
  font-size:1.1rem;font-weight:700;
  width:24px;height:24px;
  display:flex;align-items:center;justify-content:center;
  background:var(--ac);color:#fff;
  border-radius:50%;transition:transform .2s;
}
.af-toggle.open .af-ic{transform:rotate(45deg)}
.af-form{
  display:none;
  padding:12px;margin-top:6px;
  background:var(--s1);border:1px solid var(--bd);
  border-radius:var(--r);
}
.af-form.open{display:block}
.af-row{display:flex;gap:8px;margin-bottom:8px}
.af-field{flex:1;display:flex;flex-direction:column;gap:4px}
.af-field label{
  font-size:.65rem;color:var(--t2);
  font-family:'Tajawal',sans-serif;
}
.af-field input, .af-field select{
  padding:8px 10px;
  background:var(--bg);border:1px solid var(--bd);
  border-radius:var(--r);
  color:var(--tx);font-family:'IBM Plex Mono',monospace;
  font-size:.82rem;outline:0;text-align:center;
}
.af-field select{-webkit-appearance:none;text-align-last:center}
.af-field input:focus, .af-field select:focus{border-color:var(--ac)}`;
}

/** الجزء 2 من 3 من نصّ `getAddFlightStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightStylesPart2() {
  return `
.af-preview{
  padding:8px;margin:8px 0;
  background:var(--bg);border-radius:var(--r);
  font-size:.7rem;color:var(--t2);
  min-height:24px;direction:rtl;
}
.af-preview .af-ok{color:#16a34a}
.af-preview .af-htag{
  font-family:'IBM Plex Mono',monospace;
  font-size:.6rem;font-weight:700;
  padding:2px 6px;border-radius:3px;
  display:inline-block;margin:0 4px;
}
.af-preview .af-htag.sgs{
  background:rgba(229,9,20,0.05);color:#E50914;
}
.af-preview .af-htag.swissport{
  background:rgba(37,99,235,0.1);color:#2563eb;
}
.af-submit{
  width:100%;padding:10px;
  background:var(--ac);color:#fff;
  border:none;border-radius:var(--r);
  font-family:'Tajawal',sans-serif;
  font-size:.85rem;font-weight:700;
  cursor:pointer;transition:all .15s;
}
.af-submit:active{transform:scale(.97);opacity:.8}
.af-submit:disabled{opacity:.4;cursor:default}

/* قائمة اقتراحات الوجهة */
.af-dest-wrap{position:relative}
.af-suggest{
  display:none;position:absolute;
  top:100%;left:0;right:0;z-index:10;
  background:var(--s1);border:1px solid var(--bd);
  border-radius:0 0 var(--r) var(--r);
  max-height:150px;overflow-y:auto;
  -webkit-overflow-scrolling:touch;
}
.af-suggest.open{display:block}`;
}

/** الجزء 3 من 3 من نصّ `getAddFlightStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightStylesPart3() {
  return `
.af-sug-item{
  padding:8px 10px;font-size:.75rem;
  cursor:pointer;direction:rtl;
  display:flex;justify-content:space-between;
  align-items:center;
  border-bottom:1px solid rgba(0,0,0,0.03);
}
.af-sug-item:active{background:var(--bd)}
.af-sug-item .af-sug-name{color:var(--tx)}
.af-sug-item .af-sug-code{
  font-family:'IBM Plex Mono',monospace;
  color:var(--ac);font-size:.7rem;font-weight:600;
}
`;
}

// ═══ كود التفاعل ═══
/**
 * يبني شيفرة الصفحة التي تشغّل نموذج إضافة رحلة يدوية.
 * @returns {string} نص JavaScript يعمل داخل الصفحة
 */
function getAddFlightCode() {
  return getAddFlightCodePart1() +
    getAddFlightCodePart2() +
    getAddFlightCodePart3() +
    getAddFlightCodePart4() +
    getAddFlightCodePart5() +
    getAddFlightCodePart6() +
    getAddFlightCodePart7() +
    getAddFlightCodePart8() +
    getAddFlightCodePart9() +
    getAddFlightCodePart10() +
    getAddFlightCodePart11() +
    getAddFlightCodePart12() +
    getAddFlightCodePart13() +
    getAddFlightCodePart14() +
    getAddFlightCodePart15() +
    getAddFlightCodePart16() +
    getAddFlightCodePart17() +
    getAddFlightCodePart18();
}

/** الجزء 1 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart1() {
  return `
// ═══ إضافة رحلة يدوية ═══
let afToggle=document.getElementById("afToggle");
let afForm=document.getElementById("afForm");
let afAl=document.getElementById("afAl");
let afFlt=document.getElementById("afFlt");
let afTime=document.getElementById("afTime");
let afDest=document.getElementById("afDest");
let afPreview=document.getElementById("afPreview");
let afSubmit=document.getElementById("afSubmit");
let afTerminal=document.getElementById("afTerminal");

// ═══ مكان ظهور الرحلة — اختيار الموظف (طلب المالك ٢٠٢٦-٠٩-٣٠) ═══
// القيمة هي حقل terminal نفسه: "" جداول، "t1" صالة 1، "north" الشمالية، "hall4" صالة 4.
// ومنه وحده تُحسب هوية الرحلة وعقدتها (fqFlightKey و fqFlightNode).
function afPickedTerminal(){
  return afTerminal?(afTerminal.value||""):"";
}
// اسم القسم للعرض من نصّ الخيار نفسه، فلا نسخة ثانية من الأسماء
function afTerminalLabel(){
  if(!afTerminal||afTerminal.selectedIndex<0)return "جداول";
  return afTerminal.options[afTerminal.selectedIndex].text;
}
// رحلة الصالة لها موضع واحد في اليوم: الصالة + التاريخ + الرقم (fqFlightSlot).
// قاعدة المالك: «لا يمكن أن تطير رحلتان بنفس الرقم ونفس الرمز في يوم واحد
// بنفس الصالة». فالإضافة اليدوية لا تُنشئ سطرًا ثانيًا في الموضع نفسه.
// ورحلة الجداول لا موضع لها ("") فلا تُمنع، كما كانت.
function afSlotTaken(flight){
  const slot=fqFlightSlot(flight);
  if(!slot||typeof DATA==="undefined")return false;
  for(let i=0;i<DATA.length;i++){
    if(fqFlightSlot(DATA[i])===slot)return true;
  }
  return false;
}
`;
}

/** الجزء 2 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart2() {
  return `
// طي/فتح
if(afToggle){afToggle.addEventListener("click",function(){
  const isOpen=afForm.classList.contains("open");
  if(isOpen){
    afForm.classList.remove("open");
    afToggle.classList.remove("open");
  }else{
    afForm.classList.add("open");
    afToggle.classList.add("open");
    afAl.focus();
  }
})}

// ═══ تاريخ بصيغة yyyy-mm-dd ═══
function _afDateStr(d){
  return d.getFullYear()+"-"+
    ("0"+(d.getMonth()+1)).slice(-2)+"-"+
    ("0"+d.getDate()).slice(-2);
}

// ═══ وقت الإقلاع اليوم من نصّ الوقت (دون ترحيل إلى الغد) ═══
function _afDeparture(td,time){
  const tp=time.split(":");
  return new Date(td.getFullYear(),td.getMonth(),td.getDate(),
    parseInt(tp[0]),parseInt(tp[1]||0));
}

// ═══ إن فات الوقت يُرحَّل إلى الغد؛ true إن رُحِّل ═══
function _afBumpPast(dep){
  if(dep.getTime()<Date.now()){
    dep.setDate(dep.getDate()+1);
    return true;
  }
  return false;
}
`;
}

/** الجزء 3 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart3() {
  return `
// ═══ قراءة حقول المعاينة ═══
function _afReadPreview(){
  const al=(afAl.value||"").toUpperCase().trim();
  const flt=(afFlt.value||"").trim();
  const time=(afTime.value||"").trim();
  const dest=(afDest.value||"").trim();
  return {al:al,flt:flt,time:time,dest:dest};
}

// ═══ المناولة ═══
function _afPushAirline(p,al){
  if(al&&typeof AIRLINES!=="undefined"&&AIRLINES[al]){
    const info=AIRLINES[al];
    const hc=info.handler==="SGS"?"sgs":"swissport";
    p.push(info.name+' <span class="af-htag '+hc+'">'+info.handler+'</span>');
  }else if(al){
    p.push('الناقل: '+al+' <span style="color:#ca8a04">(غير معروف)</span>');
  }
}

// ═══ رقم الرحلة ومكان ظهورها ═══
function _afPushFlight(p,form){
  if(form.al&&form.flt)p.push('رقم الرحلة: '+form.al+form.flt);
  if(form.al&&form.flt)p.push('تظهر في: <b>'+afTerminalLabel()+'</b>');
}

// ═══ نصّ الوجهة المعيَّنة من القائمة ═══
function _afResolvedInfo(){
  if(typeof AIRPORTS!=="undefined"&&AIRPORTS[_afResolvedCode]){
    const ap=AIRPORTS[_afResolvedCode];
    return ap.c+" — "+ap.d+" ("+_afResolvedCode+")";
  }
  const dn=typeof countryName==="function"?countryName(_afResolvedCode):_afResolvedCode;
  return dn+" ("+_afResolvedCode+")";
}
`;
}

/** الجزء 4 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart4() {
  return `
// ═══ سطر الوجهة المكتوبة: ثلاثة أحرف أو نصّ حرّ ═══
function _afTypedLine(dest){
  if(!/^[A-Z]{3}$/i.test(dest))
    return 'الوجهة: '+dest+' <span style="color:#ca8a04">(اختر من القائمة)</span>';
  const dup=dest.toUpperCase();
  if(typeof AIRPORTS!=="undefined"&&AIRPORTS[dup])
    return 'الوجهة: '+AIRPORTS[dup].c+" — "+AIRPORTS[dup].d+" ("+dup+")";
  if(typeof COUNTRY!=="undefined"&&COUNTRY[dup])
    return 'الوجهة: '+COUNTRY[dup]+" ("+dup+")";
  return 'الوجهة: '+dest;
}

// ═══ الوجهة ═══
function _afPushDest(p,dest){
  if(!dest)return;
  if(_afResolvedCode)p.push('الوجهة: '+_afResolvedInfo());
  else p.push(_afTypedLine(dest));
}

// ═══ سطرا التفويج والمتبقي ═══
function _afPushRemaining(p,dep,diff){
  const tf=getTafweej(dep);
  const tfc={early:"#16a34a",ontime:"#ca8a04",late:"#E50914"};
  p.push('التفويج: <span style="color:'+(tfc[tf.cls]||"#64748b")+'">'+tf.label+'</span>');
  const h=Math.floor(diff/3600000);
  const m=Math.floor((diff%3600000)/60000);
  p.push('المتبقي: '+h+' س '+m+' د');
}

// ═══ التفويج والوقت المتبقي ═══
function _afPushTime(p,time){
  if(!time)return;
  const dep=_afDeparture(new Date(),time);
  _afBumpPast(dep);
  const diff=dep.getTime()-Date.now();
  if(diff>0&&typeof getTafweej==="function")_afPushRemaining(p,dep,diff);
}
`;
}

/** الجزء 5 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart5() {
  return `
// ═══ هل الوجهة صالحة للإضافة؟ ═══
function _afDestOk(dest){
  if(_afResolvedCode)return true;
  return Boolean(dest&&/^[A-Z]{3}$/i.test(dest));
}

// ═══ عرض المعاينة وتفعيل زرّ الإضافة ═══
function _afPreviewShow(p,form){
  afPreview.innerHTML=p.length>0?p.join('<br>')
    :'<span style="opacity:.5">المعاينة ستظهر هنا</span>';
  afSubmit.disabled=!(form.al&&form.flt&&form.time&&_afDestOk(form.dest));
}

// ═══ حقول فارغة كلها: معاينة فارغة وزرّ معطَّل؛ true إن كانت كذلك ═══
function _afPreviewBlank(form){
  if(form.al||form.flt||form.time||form.dest)return false;
  afPreview.innerHTML='<span style="opacity:.5">المعاينة ستظهر هنا</span>';
  afSubmit.disabled=true;
  return true;
}

// معاينة حية
function afUpdate(){
  const form=_afReadPreview();
  if(_afPreviewBlank(form))return;
  const p=[];
  _afPushAirline(p,form.al);
  _afPushFlight(p,form);
  _afPushDest(p,form.dest);
  _afPushTime(p,form.time);
  _afPreviewShow(p,form);
}

if(afAl)afAl.addEventListener("input",function(){
  this.value=this.value.toUpperCase();afUpdate();
});
if(afFlt)afFlt.addEventListener("input",afUpdate);
if(afTime)afTime.addEventListener("input",afUpdate);
if(afTerminal)afTerminal.addEventListener("change",afUpdate);
if(afDest)afDest.addEventListener("input",function(){
  afSearchDest(this.value);
  afUpdate();
});
`;
}

/** الجزء 6 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart6() {
  return `
// ═══ بحث الوجهة في قاموس الدول ═══
let afSuggest=document.getElementById("afSuggest");
let _afResolvedCode="";

// ═══ رمز إياتا المطابق تمامًا في المطارات أو الدول ═══
function _afExactCode(upper){
  if(!/^[A-Z]{3}$/.test(upper))return "";
  if(typeof AIRPORTS!=="undefined"&&AIRPORTS[upper])return upper;
  if(typeof COUNTRY!=="undefined"&&COUNTRY[upper])return upper;
  return "";
}

// ═══ إضافة مقترح لم يُرَ من قبل ═══
function _afAddHit(bag,code,lbl){
  if(!bag.seen[code]){
    bag.seen[code]=true;
    bag.results.push({code:code,label:lbl});
  }
}

// ═══ هل يطابق المطار النصّ المبحوث (مدينة أو دولة)؟ ═══
function _afAirportMatch(ap,qL){
  const dL=(ap.d||"").toLowerCase();
  const cL=(ap.c||"").toLowerCase();
  return cL.indexOf(qL)!==-1||dL.indexOf(qL)!==-1;
}

// ═══ مقترحات المطارات (مدينة + دولة) ═══
function _afAirportHits(qL,bag){
  if(typeof AIRPORTS==="undefined")return;
  const aKeys=Object.keys(AIRPORTS);
  for(let i=0;i<aKeys.length;i++){
    const code=aKeys[i];
    const ap=AIRPORTS[code];
    if(_afAirportMatch(ap,qL))_afAddHit(bag,code,ap.c+(ap.c!==ap.d?" — "+ap.d:""));
    if(bag.results.length>=10)break;
  }
}
`;
}

/** الجزء 7 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart7() {
  return `
// ═══ مقترحات القاموس القديم إن قلّت مقترحات المطارات ═══
function _afCountryHits(qL,bag){
  if(!(bag.results.length<5&&typeof COUNTRY!=="undefined"))return;
  const cKeys=Object.keys(COUNTRY);
  for(let j=0;j<cKeys.length;j++){
    const c2=cKeys[j];
    const nm=COUNTRY[c2];
    if(nm.toLowerCase().indexOf(qL)!==-1&&!bag.seen[c2])_afAddHit(bag,c2,nm);
    if(bag.results.length>=10)break;
  }
}

// ═══ بحث بالعربي — أولًا في المطارات ثم القاموس القديم ═══
function _afCollectHits(qL){
  const bag={results:[],seen:{}};
  _afAirportHits(qL,bag);
  _afCountryHits(qL,bag);
  return bag;
}

// المطابقة وحدها بلا عنصر: تُرجع الرمز إن تعيّن، وإلا قائمة المقترحات (عشرة
// على الأكثر). يستعملها هذا الحقل وحقل الوجهة في تيوب LIVE FLT (fq_jed_modal)
// بطلب المالك ٢٠٢٦-١٠-٠٣: «مشابه تمامًا لحقل الوجهة داخل إضافة رحلة».
function afDestMatches(val){
  const q=(val||"").trim();
  if(!q||q.length<2)return {code:"",results:[]};
  const exact=_afExactCode(q.toUpperCase());
  if(exact)return {code:exact,results:[]};
  const bag=_afCollectHits(q.toLowerCase());
  // تطابق تام — تفعيل مباشر
  if(bag.results.length===1)return {code:bag.results[0].code,results:[]};
  return {code:"",results:bag.results};
}
`;
}

/** الجزء 8 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart8() {
  return `
// ═══ نصّ قائمة المقترحات ═══
function _afSuggestHtml(results){
  let h="";
  for(let r=0;r<results.length;r++){
    h+='<div class="af-sug-item" data-code="'+results[r].code
      +'" data-name="'+results[r].label+'">';
    h+='<span class="af-sug-name">'+results[r].label+'</span>';
    h+='<span class="af-sug-code">'+results[r].code+'</span>';
    h+='</div>';
  }
  return h;
}

// ═══ ربط النقر على المقترحات ═══
function _afBindSuggest(){
  const items=afSuggest.querySelectorAll(".af-sug-item");
  for(let si=0;si<items.length;si++){
    items[si].addEventListener("click",function(){
      const code=this.getAttribute("data-code");
      const name=this.getAttribute("data-name");
      afDest.value=name;
      _afResolvedCode=code;
      afSuggest.classList.remove("open");
      afUpdate();
    });
  }
}

// ═══ انتهى البحث بلا قائمة: تعيّن رمز أو لا مقترحات؛ true إن انتهى ═══
function _afSuggestDone(found){
  if(found.code){
    _afResolvedCode=found.code;afSuggest.classList.remove("open");afUpdate();return true;
  }
  if(found.results.length===0){afSuggest.classList.remove("open");return true}
  return false;
}
`;
}

/** الجزء 9 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart9() {
  return `
function afSearchDest(val){
  _afResolvedCode="";
  if(!afSuggest)return;
  const found=afDestMatches(val);
  if(_afSuggestDone(found))return;
  afSuggest.innerHTML=_afSuggestHtml(found.results);
  afSuggest.classList.add("open");
  _afBindSuggest();
}

// إغلاق الاقتراحات عند الضغط خارجها
document.addEventListener("click",function(e){
  if(afSuggest&&!e.target.closest(".af-dest-wrap")){
    afSuggest.classList.remove("open");
  }
});

// ═══ قراءة حقول الإضافة ═══
function _afReadSubmit(){
  const al=(afAl.value||"").toUpperCase().trim();
  const flt=(afFlt.value||"").trim();
  const time=(afTime.value||"").trim();
  const destRaw=(afDest.value||"").trim();
  return {al:al,flt:flt,time:time,destRaw:destRaw};
}

// ═══ رمز مطار باسمه العربي (مدينة أو دولة) ═══
function _afAirportCode(destRaw){
  if(typeof AIRPORTS==="undefined")return "";
  const aK=Object.keys(AIRPORTS);
  for(let ai=0;ai<aK.length;ai++){
    const ap=AIRPORTS[aK[ai]];
    if(ap.c===destRaw||ap.d===destRaw)return aK[ai];
  }
  return "";
}
`;
}

/** الجزء 10 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart10() {
  return `
// ═══ رمز دولة باسمها في القاموس القديم ═══
function _afCountryCode(destRaw){
  if(typeof COUNTRY==="undefined")return "";
  const cK=Object.keys(COUNTRY);
  for(let ci=0;ci<cK.length;ci++){
    if(COUNTRY[cK[ci]]===destRaw)return cK[ci];
  }
  return "";
}

// ═══ تحديد رمز إياتا ═══
function _afResolveDest(destRaw){
  let dest=_afResolvedCode;
  if(!dest){
    // محاولة أخيرة — إذا كتب 3 حروف إنجليزية
    const upper=destRaw.toUpperCase();
    if(/^[A-Z]{3}$/.test(upper))dest=upper;
  }
  if(!dest){
    // بحث بالاسم العربي — في المطارات أولًا
    dest=_afAirportCode(destRaw);
    if(!dest)dest=_afCountryCode(destRaw);
  }
  return dest;
}

// ═══ وقت الإقلاع وتاريخه للرحلة الجديدة ═══
function _afNewDeparture(time){
  const td=new Date();
  let ds=_afDateStr(td);
  const dep=_afDeparture(td,time);
  if(_afBumpPast(dep))ds=_afDateStr(dep);
  return {dep:dep,ds:ds};
}
`;
}

/** الجزء 11 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart11() {
  return `
// ═══ بناء كائن الرحلة ═══
function _afBuildFlight(f,dest,when){
  return {
    al:f.al, flt:f.al+f.flt, to:dest,
    std:f.time, type:"Manual", dpax:"",
    date:when.ds, depTime:when.dep,
    terminal:afPickedTerminal()   // هوية صريحة من اختيار الموظف لا ضمنية
  };
}

// ═══ رفض الرحلة المكرَّرة في موضعها: يُرجع true بعد الرسالة ═══
function _afSlotRefused(ctx){
  if(!afSlotTaken(ctx.flight))return false;
  afPreview.innerHTML='<span style="color:#E50914">الرحلة '+fqEsc(ctx.flight.flt)+' موجودة في '
    +ctx.placeLabel+' بتاريخ '+ctx.ds+' — لتعديلها اضغط عليها ضغطًا مطوّلًا في تيوب كايا</span>';
  return true;
}

// ═══ سياق الإضافة؛ null إن لم تُقبل الرحلة ═══
function _afPrepare(f){
  const dest=_afResolveDest(f.destRaw);
  if(!dest){
    afPreview.innerHTML='<span style="color:#E50914">لم أجد رمز وجهة — اختر من القائمة أو اكتب 3 حروف</span>';
    return null;
  }
  const when=_afNewDeparture(f.time);
  const flight=_afBuildFlight(f,dest,when);
  const ctx={flight:flight,dest:dest,time:f.time,dep:when.dep,ds:when.ds,placeLabel:afTerminalLabel()};
  return _afSlotRefused(ctx)?null:ctx;
}
`;
}

/** الجزء 12 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart12() {
  return `
// ═══ تفعيل فلتر الكل ═══
function _afActivateAllFilter(){
  const allBtns=document.querySelectorAll(".fl-btn");
  for(let fb=0;fb<allBtns.length;fb++){
    allBtns[fb].classList.remove("active");
    if(allBtns[fb].getAttribute("data-filter")==="all")
      allBtns[fb].classList.add("active");
  }
}

// ═══ عرض القائمة فورًا — تفعيل فلتر الكل وتنفيذ البحث ═══
function _afShowAll(flight){
  try{
    if(typeof activeFilter!=="undefined")activeFilter="all";
    _afActivateAllFilter();
    const si2=document.getElementById("si");
    if(si2)si2.value="";
    if(typeof doSearch==="function")doSearch();
    // رحلات الصالات لا تظهر في جداول، بل في أقسامها بتيوب كايا
    if(flight.terminal&&typeof hallRenderAll==="function")hallRenderAll();
  }catch(e){ console.error("[fq_addflight] refresh list: "+e.message); }
}

// ═══ إضافة لمصفوفة البيانات وتحديث الإحصائيات والقائمة ═══
function _afAddLocal(flight){
  if(typeof DATA!=="undefined")DATA.push(flight);
  // تحديث الإحصائيات والشريط الزمني
  try{
    if(typeof updateStats==="function")updateStats();
  }catch(e){ console.error("[fq_addflight] updateStats: "+e.message); }
  _afShowAll(flight);
}

// ═══ اسم الوجهة للعرض ═══
function _afDestName(dest){
  return typeof countryName==="function"?countryName(dest):dest;
}
`;
}

/** الجزء 13 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart13() {
  return `
// ═══ تأكيد بصري ═══
function _afConfirmButton(){
  afSubmit.textContent="تمت الإضافة ✓";
  afSubmit.style.background="#16a34a";
  setTimeout(function(){
    afSubmit.textContent="إضافة الرحلة";
    afSubmit.style.background="";
  },1200);
}

// ═══ إشعار فايربيس ═══
function _afNotifyAdded(ctx){
  if(typeof fbPushNotif==="function"){
    fbPushNotif({type:"flight_added",title:"إضافة رحلة يدوية",
      details:ctx.flight.flt+" → "+ctx.dn2+" | "+ctx.time+" | "+ctx.placeLabel,
      flightInfo:{flt:ctx.flight.flt,dest:ctx.dn2,std:ctx.time,date:ctx.ds,type:"يدوية"}});
  }
}

// ═══ سجلّ الرحلة المكتوب في القاعدة ═══
function _afRecord(ctx){
  const flight=ctx.flight;
  return {
    al:flight.al, flt:flight.flt, to:flight.to,
    std:ctx.time, type:"Manual", dpax:"",
    date:ctx.ds, depTime:ctx.dep.toISOString(),
    terminal:flight.terminal,
    src:"manual",
    updatedBy:FB_USER, updatedByRole:FB_ROLE,
    updatedByEmpId:FB_EMP_ID,
    updatedAt:new Date().toISOString()
  };
}
`;
}

/** الجزء 14 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart14() {
  return `
// على الطابور: الرحلة عملُ موظف. والمفتاح fbKey محسوب قبل
// الإدراج، فإعادة الإرسال تكتب فوق نفسها ولا تُنشئ رحلة ثانية.
function _afAddRequest(flight,payload){
  return {
    path: "/" + fqFlightNode(flight) + ".json", method: "PATCH", body: payload,
    kind: "flight", label: "إضافة رحلة " + flight.flt
  };
}

// المؤشر الزمني **خارج الطابور** بقرار المستخدم ٢٠٢٦-٠٩-٢٥:
// طابع «آخر تحديث» يُعاد بعد دقائق يكتب فوق أحدث منه.
function _afMetaRequest(){
  return {
    path:"/flights_meta.json", method:"PATCH", timeoutMs:10000,
    body:{lastUpdateBy:FB_USER,lastUpdateAt:new Date().toISOString()}
  };
}

// ═══ ما يُقال بعد الحفظ في القاعدة ═══
// لا يُقال «حُفظت» لِما لم يصل بعد: الشريط العام يعرض العدد،
// والرسالة هنا تقول الحقيقة.
function _afSavedToast(addResult){
  if(typeof showToast==="function")
    showToast(addResult.queued
      ? "الرحلة قيد الإرسال — ستصل عند عودة الاتصال"
      : "تم حفظ الرحلة في القاعدة",
      addResult.queued ? "info" : "success");
}

`;
}

/** الجزء 15 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart15() {
  return `
// ═══ فشل الحفظ: يُعرض ويُرجع true ═══
function _afSaveFailed(addResult){
  if(addResult.ok)return false;
  if(typeof showToast==="function")
    showToast("أُضيفت محلياً — فشل الحفظ: " + (addResult.error || ""), "error");
  return true;
}

// ═══ حمولة الكتابة: سجلّ الرحلة تحت مفتاحها ═══
function _afPayload(fbKey,ctx){
  const payload = {};
  payload[fbKey] = _afRecord(ctx);
  return payload;
}

// ═══ نجح الحفظ: يُثبَّت المفتاح ويُقال للموظف ═══
function _afSaved(ctx,fbKey,addResult){
  ctx.flight._fbKey = fbKey;
  _afSavedToast(addResult);
}
`;
}

/** الجزء 16 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart16() {
  return `
// ═══ حفظ فوري في القاعدة ═══
async function _afPersist(ctx){
  try{
    const fbKey = fqFlightKey(ctx.flight);
    const payload = _afPayload(fbKey,ctx);
    const addResult = await fqSendOrQueue(_afAddRequest(ctx.flight,payload));
    if (_afSaveFailed(addResult)) return;
    const metaRes = await fqRequest(_afMetaRequest());
    if (!metaRes.ok) console.warn("[fq_addflight] meta: " + metaRes.error);
    _afSaved(ctx,fbKey,addResult);
  }catch(e){
    if(typeof showToast==="function")
      showToast("أُضيفت محلياً — فشل الحفظ في القاعدة","error");
  }
}

// ═══ الحفظ في القاعدة أو التحذير من انقطاعها ═══
function _afSaveOrWarn(ctx){
  if(fbConnected){
    _afPersist(ctx);
  }else{
    // لا اتصال بالقاعدة: الإضافة محلية فقط وتزول عند إعادة التحميل —
    // الصمت هنا كان يوهم المستخدم بحفظ لم يقع (نجاح وهمي)
    if(typeof showToast==="function")
      showToast("لا اتصال بالقاعدة — الرحلة محلية وستزول عند إعادة التحميل","error",4500);
  }
}
`;
}

/** الجزء 17 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart17() {
  return `
// ═══ تفريغ الحقول — الناقل يبقى ═══
function _afClearForm(ctx){
  afFlt.value="";
  afTime.value="";
  afDest.value="";
  _afResolvedCode="";
  afPreview.innerHTML='<span class="af-ok">تمت إضافة '+fqEsc(ctx.flight.flt)
    +' إلى '+ctx.dn2+' — تظهر في '+ctx.placeLabel+'</span>';
  afSubmit.disabled=true;
}

// ═══ تحديث العدّاد ═══
function _afRefreshCounter(){
  const nf=document.getElementById("nf");
  if(nf)nf.innerHTML="إجمالي <b>"+DATA.length+"</b> رحلة مغادرة";
}

// ═══ تمرير للنتائج — نتائج جداول وحدها في هذه الصفحة ═══
function _afScrollToResults(flight){
  const rs2=document.getElementById("rs");
  if(rs2&&!flight.terminal)rs2.scrollIntoView({behavior:"smooth"});
}

// ═══ تنفيذ الإضافة بعد قبول الرحلة ═══
function _afApply(ctx){
  _afAddLocal(ctx.flight);
  ctx.dn2=_afDestName(ctx.dest);
  _afConfirmButton();
  _afNotifyAdded(ctx);
  _afSaveOrWarn(ctx);
  if(typeof auditLog==="function")
    auditLog("add_flight",ctx.flight.flt+" "+ctx.dn2,ctx.ds);
  _afClearForm(ctx);
  _afRefreshCounter();
  _afScrollToResults(ctx.flight);
}
`;
}

/** الجزء 18 من 18 من نصّ `getAddFlightCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddFlightCodePart18() {
  return `
// إضافة الرحلة
function _afSubmitClick(){
  const f=_afReadSubmit();
  if(!f.al||!f.flt||!f.time||!f.destRaw)return;
  const ctx=_afPrepare(f);
  if(ctx)_afApply(ctx);
}
if(afSubmit){afSubmit.addEventListener("click",_afSubmitClick)}
`;
}

module.exports = Object.freeze({
  getAddFlightHtml: getAddFlightHtml,
  getAddFlightStyles: getAddFlightStyles,
  getAddFlightCode: getAddFlightCode
});
