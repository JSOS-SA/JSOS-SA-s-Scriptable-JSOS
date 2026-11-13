// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: satellite-dish;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_live_scrape.js

/**
 * @module fq_live_scrape
 * @description طبقة كشط الرحلات الحية من موقع كايا عبر WebView مرئي.
 * تحقن زر استخراج في صفحة كايا، تنتظر وصول البيانات، ثم تقرأ النتيجة.
 * لا تعرف شيئاً عن عرض الواجهة الرئيسية.
 */

const cfg = importModule("fq_config");
const store = importModule("fq_live_store");

// ═══ سكرِبت الحقن — يُضاف داخل صفحة كايا ═══
function injectionScript() {
  return injectionScriptPart1() +
    injectionScriptPart2() +
    injectionScriptPart3() +
    injectionScriptPart4() +
    injectionScriptPart5() +
    injectionScriptPart6() +
    injectionScriptPart7() +
    injectionScriptPart8() +
    injectionScriptPart9() +
    injectionScriptPart10();
}

/** الجزء 1 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart1() {
  return `
// ═══ إغلاق كوكيز ═══
function _fqCloseCookies(){
  const cookieBtns = document.querySelectorAll(
    '[id*="CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"],' +
    '[id*="CybotCookiebotDialogBodyButtonAccept"],' +
    'button[id*="accept"], a[id*="accept"]'
  );
  for(let i=0;i<cookieBtns.length;i++){
    try{cookieBtns[i].click()}catch(e){ console.warn("[fq_live] cookie click skipped: "+e.message); }
  }
}

// ═══ زر الاستخراج العائم ═══
function _fqBuildButton(){
  const btn=document.createElement('div');
  btn.id='fq-extract-btn';
  btn.innerHTML='<div style="'
    +'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);'
    +'z-index:999999;display:flex;flex-direction:column;align-items:center;gap:8px;'
    +'"><div id="fq-status" style="'
    +'background:rgba(0,0,0,0.85);color:#1a1a1a;padding:8px 16px;'
    +'border-radius:8px;font-size:13px;font-family:system-ui;'
    +'display:none;text-align:center;direction:rtl;'
    +'"></div>'
    +'<button id="fq-go" style="'
    +'background:#E50914;color:#fff;border:none;'
    +'padding:14px 32px;border-radius:12px;'
    +'font-size:16px;font-weight:700;font-family:system-ui;'
    +'box-shadow:0 4px 20px rgba(229,9,20,0.05);'
    +'cursor:pointer;direction:rtl;'
    +'">استخراج الرحلات</button></div>';
  document.body.appendChild(btn);
}
`;
}

/** الجزء 2 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart2() {
  return `
// ═══ انتظار وصول بيانات الرحلات فعليًا ═══
// الموقع يحمّل بيانات الرحلات بطلب غير متزامن بعد تحميل الصفحة (Next.js) —
// ننتظر ظهور "متجهة إلى" في نص الصفحة قبل أي محاولة تحميل/استخراج،
// بدل الاعتماد على انتظار تحميل الصفحة فقط (لا يضمن وصول البيانات).
function _fqWaitForContent(done){
  let attempts=0;
  let maxAttempts=30;
  function check(){
    let hasContent=(document.body.innerText||"").indexOf("متجهة إلى")!==-1;
    attempts++;
    if(hasContent||attempts>=maxAttempts){
      done();
    }else{
      setTimeout(check,300);
    }
  }
  check();
}

// البحث عن زر/رابط "عرض المزيد" في الصفحة الحالية
function _fqFindMoreButton(){
  let all=document.querySelectorAll('button,a,div[role="button"]');
  for(let i=0;i<all.length;i++){
    let t=(all[i].textContent||"").trim();
    if(t.indexOf("عرض المزيد")!==-1||t==="المزيد")return all[i];
  }
  return null;
}
`;
}

/** الجزء 3 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart3() {
  return `
// النقر على «عرض المزيد» وإظهار رقم الجولة
function _fqClickMore(btn,round,show){
  show('جارٍ تحميل كل رحلات اليوم… (جولة '+round+')');
  try{btn.click()}catch(e){ console.warn("[fq_live] more-button click skipped: "+e.message); }
}

// ═══ تحميل كل رحلات اليوم قبل الاستخراج ═══
// كايا تعرض دفعة أولى فقط، وتتطلب الضغط على زر "عرض المزيد" بشكل متكرر
// لإظهار الباقي (زر تحميل إضافي، وليس تمريرًا لا نهائيًا) — نبحث عنه
// وننقر عليه، وننتظر، ونكرر حتى يختفي الزر ٣ مرات متتالية أو نصل سقف أمان.
function _fqLoadAllFlights(done,show){
  let round=0;
  let maxRounds=80;
  let noBtnStreak=0;
  function tick(){
    window.scrollTo(0,document.body.scrollHeight);
    round++;
    setTimeout(function(){
      let btn=_fqFindMoreButton();
      if(btn){
        noBtnStreak=0;
        _fqClickMore(btn,round,show);
      }else{
        noBtnStreak++;
      }
      if(noBtnStreak>=3||round>=maxRounds){
        window.scrollTo(0,0);
        done();
      }else{
        tick();
      }
    },600);
  }
  tick();
}
`;
}

/** الجزء 4 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart4() {
  return `
// جمع رحلات المطابقات: كل مطابقة تُبنى رحلة، وتُوسم بالصالة النشطة، وتُسقَط المكرَّرة
function _fqCollect(matches,activeTerminal){
  let seen={};
  let flights=[];
  for(let i=0;i<matches.length;i++){
    let f=_fqBuildFlight(matches[i]);
    if(!f)continue;
    if(activeTerminal)f.terminal=activeTerminal;
    if(_fqIsNew(f,seen))flights.push(f);
  }
  return flights;
}

// ═══ استخراج كل الرحلات — بالاعتماد على معالم نصية ثابتة، لا حدود DOM ═══
// كل بطاقة في كايا تسير بالترتيب: [وقت] ... متجهة إلى [مدينة] [رمز؟] ...
// معلومات الرحلة [شركة][رقم] — مؤكَّد من لقطات شاشة فعلية للموقع.
// العمل على نص الصفحة المسطّح بدل الصعود بين عناصر DOM (findCard القديمة)
// يتجنّب دمج عدة بطاقات في نتيجة واحدة، وهو ما كان يُسقط أغلب الرحلات.
function _fqExtractFlights(show){
  let activeTerminal=_fqDetectTerminal();
  let pageText=(document.body.innerText||document.body.textContent||"").replace(/[ \t]+/g," ");
  let matches=_fqMatchCards(pageText);
  let flights=_fqCollect(matches,activeTerminal);
  show('جارٍ الاستخراج… تم العثور على '+flights.length+' رحلة — صالة: '+(activeTerminal||'الكل'));
  return flights;
}

// نمط بطاقة رحلة واحدة — مبني ومختبَر على نصوص فعلية من كايا (لقطات شاشة
// مرفقة). التقاط اسم المدينة جشع (Greedy) لا كسول، لالتقاط الاسم كاملاً
// بدل حرفين فقط. حارس (?!متجهة إلى) يمنع فجوات البحث من تجاوز بداية
// بطاقة تالية — إن فشلت مطابقة رقم رحلة بطاقة ما، تُسقَط هذه البطاقة
// بأمان بدل دمج بياناتها مع البطاقة التالية.
// انتبه: \\\\ مطلوبة (سلسلة نص محقونة داخل قالب، وليست regex مباشر).
const _FQ_CARD_PATTERN=new RegExp(
  '(\\\\d{1,2}:\\\\d{2})[\\\\s\\\\S]{0,80}?متجهة إلى\\\\s+'+
  '([\\\\u0600-\\\\u06FF][\\\\u0600-\\\\u06FF ]*)\\\\s*([A-Z]{3})?'+
  '(?:(?!متجهة إلى)[\\\\s\\\\S]){0,250}?معلومات الرحلة'+
  '(?:(?!متجهة إلى)[\\\\s\\\\S]){0,60}?([A-Z][A-Z0-9]|[0-9][A-Z])\\\\s?(\\\\d{2,5})','g'
);
`;
}

/** الجزء 5 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart5() {
  return `
// تشغيل النمط على كامل نص الصفحة وإرجاع كل المطابقات
function _fqMatchCards(pageText){
  let out=[];
  let m;
  _FQ_CARD_PATTERN.lastIndex=0;
  while((m=_FQ_CARD_PATTERN.exec(pageText))!==null){
    out.push(m);
    if(m.index===_FQ_CARD_PATTERN.lastIndex)_FQ_CARD_PATTERN.lastIndex++;
  }
  return out;
}

// إسقاط الأصفار البادئة من رقم الرحلة — شاشات المطار تعرضه مبطَّناً بأربع
// خانات بينما الرقم التشغيلي من خانة إلى أربع خانات بلا تبطين.
// يُعاد الرقم كما هو إذا كان أصفاراً كلها (حماية من إفراغ القيمة).
function _fqNormNum(num){
  let s=String(num||"");
  let trimmed=s.replace(/^0+/,"");
  return trimmed.length>0?trimmed:s;
}
`;
}

/** الجزء 6 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart6() {
  return `
// إضافة الوجهة (الرمز والاسم) إن وُجدتا في المطابقة
function _fqAddDest(f,m){
  let destName=(m[2]||"").trim();
  let destCode=m[3]||"";
  if(destCode)f.dest=destCode;
  if(destName)f.destName=destName;
}

// بناء كائن رحلة واحد من نتيجة مطابقة واحدة
function _fqBuildFlight(m){
  let time=m[1];
  let airline=m[4]||"";
  let flightNum=_fqNormNum(m[5]||"");
  if(!time||!airline||!flightNum)return null;
  let f={time:time,flight:airline+flightNum,airline:airline,raw:m[0].substring(0,300)};
  _fqAddDest(f,m);
  f.status=_fqMatchStatus(m[0]);
  return f;
}

const _FQ_STATUS_WORDS=[
  "غادرت","الإتجاه الى البوابة","الاتجاه إلى البوابة",
  "إنهاء الإجراءات","إركاب","ملغاة","مُلغاة",
  "متأخرة","مُتأخرة","البوابة","نداء أخير",
  "مجدولة","مُجدولة",
  "Boarding","Departed","Cancelled","Delayed",
  "Scheduled","Gate","Final","Check-in","Closed"
];

// أول كلمة حالة موجودة ضمن نص البطاقة المطابقة
function _fqMatchStatus(txt){
  for(let s=0;s<_FQ_STATUS_WORDS.length;s++){
    if(txt.indexOf(_FQ_STATUS_WORDS[s])!==-1)return _FQ_STATUS_WORDS[s];
  }
  return "";
}
`;
}

/** الجزء 7 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart7() {
  return `
// منع تكرار نفس الرحلة (شركة+رقم@وقت@وجهة)
function _fqIsNew(f,seen){
  let key=f.flight+"@"+f.time+"@"+(f.dest||f.destName||"");
  if(seen[key])return false;
  seen[key]=true;
  return true;
}
`;
}

/** الجزء 8 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart8() {
  return `
// البحث في selects عن option محدّدة
function _fqSelectTerminal(){
  let selects=document.querySelectorAll('select');
  for(let s=0;s<selects.length;s++){
    let sel=selects[s];
    let optTxt=sel.options&&sel.selectedIndex>=0
      ? (sel.options[sel.selectedIndex].textContent||"")
      : "";
    let m=_fqMatchTerminal(optTxt);
    if(m)return m;
  }
  return "";
}

// البحث في الأزرار/التابات النشطة (active/selected)
function _fqButtonTerminal(){
  let activeBtns=document.querySelectorAll(
    '.active,.selected,[aria-selected="true"],[data-active="true"]'
  );
  for(let b=0;b<activeBtns.length;b++){
    let bt=(activeBtns[b].textContent||"").trim();
    if(bt.length>40)continue;
    let mb=_fqMatchTerminal(bt);
    if(mb)return mb;
  }
  return "";
}

// ═══ كشف الصالة المُختارة من فلتر كايا ═══
// كايا يستخدم قائمة منسدلة لاختيار الصالة. نقرأ القيمة النشطة.
// المخرجات: "hajj" | "t1" | "north" | "hall4" | "" (الكل/غير محدّد)
function _fqDetectTerminal(){
  // البحث عن أي عنصر يحوي اسم صالة في النص الظاهر
  // الأنماط المتوقعة: select option، أو زر مُفعَّل، أو نص في الفلتر
  let txt=(document.body.textContent||"");
  let m=_fqSelectTerminal();
  if(m)return m;
  return _fqButtonTerminal();
}
`;
}

/** الجزء 9 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart9() {
  return `
// مطابقة نص الصالة على المفاتيح المعتمدة
function _fqMatchTerminal(t){
  if(!t)return "";
  if(t.indexOf("الحج")!==-1)return "hajj";
  if(t.indexOf("الشمال")!==-1)return "north";
  if(t.indexOf("صالة 1")!==-1||t.indexOf("صالة ١")!==-1)return "t1";
  if(t.indexOf("صالة 4")!==-1||t.indexOf("صالة ٤")!==-1)return "hall4";
  return "";
}

// ═══ استخراج بعد انتهاء التحميل ═══
function _fqRunExtract(show,goBtn){
  try{
    let flights=_fqExtractFlights(show);
    if(flights.length===0){
      show('لم تُعثر على رحلات — تأكد من ظهورها في الصفحة');
      goBtn.style.display='block';
      return;
    }
    // حفظ في متغير عام يقرأه سكرِبتابل
    window._FQ_EXTRACTED=JSON.stringify(flights);
    show('تم استخراج '+flights.length+' رحلة — أغلق الصفحة');
  }catch(e){
    show('خطأ: '+e.message);
    goBtn.style.display='block';
  }
}
`;
}

/** الجزء 10 من 10 من نصّ `injectionScript()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function injectionScriptPart10() {
  return `
(function(){
  _fqCloseCookies();

  // منع التكرار
  if(document.getElementById('fq-extract-btn'))return;

  _fqBuildButton();

  let statusEl=document.getElementById('fq-status');
  let goBtn=document.getElementById('fq-go');

  function showStatus(msg){
    statusEl.textContent=msg;
    statusEl.style.display='block';
  }

  goBtn.addEventListener('click',function(){
    goBtn.style.display='none';
    showStatus('جارٍ تحميل بيانات الرحلات…');
    _fqWaitForContent(function(){
      _fqLoadAllFlights(function(){
        showStatus('جارٍ الاستخراج…');
        setTimeout(function(){_fqRunExtract(showStatus,goBtn);},300);
      },showStatus);
    });
  });
})();
void(0);
`;
}

// ═══ جلب الرحلات — ويب فيو مرئي ═══
/**
 * يفتح صفحة الرحلات الحيّة في نافذة ويب مرئية ويستخرج رحلاتها.
 * @returns {Promise<Object[]>} الرحلات المستخرجة
 */
async function fetchLiveFlights() {
  const wv = new WebView();
  // الوعد الموثق يكتمل بعد التحميل؛ طريقة النسخة المنشأة تقبل الرابط وحده.
  await wv.loadURL(cfg.KAIA_URL);

  // حقن زر الاستخراج فوراً بعد التحميل الفعلي
  await _injectExtractButton(wv);

  // عرض الصفحة — المستخدم يرى كايا ويضغط الزر
  await wv.present(true);

  // بعد الإغلاق — قراءة البيانات المُستخرجة
  return await _readExtractedFlights(wv);
}

async function _injectExtractButton(wv) {
  try {
    await wv.evaluateJavaScript(injectionScript());
  } catch(e) {
    console.error(`fq_live inject: ${e}`);
  }
}

async function _readExtractedFlights(wv) {
  let flights = [];
  try {
    const raw = await wv.evaluateJavaScript(
      "window._FQ_EXTRACTED || '[]'"
    );
    if (raw && raw !== "[]") {
      flights = JSON.parse(raw);
      // حفظ محليًا
      store.saveLive(flights);
    }
  } catch(e) {
    console.error(`fq_live fetchLiveFlights: ${e}`);
  }

  return flights;
}

module.exports = Object.freeze({ fetchLiveFlights });
