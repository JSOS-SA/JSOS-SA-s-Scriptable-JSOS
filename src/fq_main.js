// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: dePep-gray; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_main.js
const localMonitor = importModule("fq_monitor_local");
const localMonitorWeb = importModule("fq_monitor_local_web");
let localSession = localMonitor.start({});
const cfg = importModule("fq_config");
const countries = importModule("fq_countries");
const helpers = importModule("fq_helpers");
const styles = importModule("fq_styles");
const html = importModule("fq_html");
const parser = importModule("fq_parser");
const sidebar = importModule("fq_sidebar");      // ✅ تم التقديم قبل search
const search = importModule("fq_search");
const storage = localMonitor.observeModule("fq_storage", importModule("fq_storage"));
const alertsMod = localMonitor.observeModule("fq_alerts", importModule("fq_alerts"));
const live = localMonitor.observeModule("fq_live", importModule("fq_live"));
const hall = localMonitor.observeModule("fq_hall_add", importModule("fq_hall_add"));
const airlines = importModule("fq_airlines");
const addflight = localMonitor.observeModule("fq_addflight", importModule("fq_addflight"));
const airports = importModule("fq_airports");
const addAirport = localMonitor.observeModule("fq_add_airport", importModule("fq_add_airport"));
const guide = importModule("fq_guide");
const exportGuide = localMonitor.observeModule("fq_export_guide", importModule("fq_export_guide"));
const firebase = localMonitor.observeModule("fq_firebase", importModule("fq_firebase"));
const profile = localMonitor.observeModule("fq_profile", importModule("fq_profile"));
const logger = importModule("fq_logger");
// اسم واحد لكل وحدة رصد: الوثائق لا تذكر هل يعيد importModule النسخة المحمَّلة،
// فلو حُمِّلت الوحدة باسمين لربما صارت نسختين لا تريان محتجَز بعضهما.
const monitorSession = importModule("fq_monitor_session");
const monitorCapture = importModule("fq_monitor_capture");
const monitorJourney = importModule("fq_monitor_journey");
const monitorDashboard = importModule("fq_monitor_dashboard");
const monitorV2Html = importModule("fq_monitor_v2_view_html");
const monitorV2Styles = importModule("fq_monitor_v2_view_styles");
const monitorV2Code = importModule("fq_monitor_v2_view_code");
const regmodel = importModule("fq_regmodel");
const perms = importModule("fq_permissions");
const netRequest = importModule("fq_net_request");
const queueModel = importModule("fq_queue_model");
const queueStore = importModule("fq_queue_store");
const queueSubmit = importModule("fq_queue_submit");
const queueFlush = importModule("fq_queue_flush");
const queueView = importModule("fq_queue_view");
const queueFile = localMonitor.observeModule("fq_queue_file", importModule("fq_queue_file"));
const bulkWrite = importModule("fq_bulk_write");
const keysScan = importModule("fq_keys_scan");
const audit = localMonitor.observeModule("fq_audit", importModule("fq_audit"));
const auth = localMonitor.observeModule("fq_auth", importModule("fq_auth"));
const firebaseAuth = localMonitor.observeModule("fq_firebase_auth", importModule("fq_firebase_auth"));
const toast = importModule("fq_toast");
const snapshot = localMonitor.observeModule("fq_snapshot", importModule("fq_snapshot"));
const editflight = localMonitor.observeModule("fq_editflight", importModule("fq_editflight"));
const dbadmin = localMonitor.observeModule("fq_dbadmin", importModule("fq_dbadmin"));
const t4Html = importModule("fq_t4_html");
const t4Styles = importModule("fq_t4_styles");
const t4Report = importModule("fq_t4_report");
const t4Button = importModule("fq_t4_button");
const t4Text = importModule("fq_t4_text");
const t4Store = importModule("fq_t4_store");
const t4Form = importModule("fq_t4_form");
const t4Modal = importModule("fq_t4_modal");
const t4Editor = importModule("fq_t4_editor");
const t4View = importModule("fq_t4_view");
const wlText = importModule("fq_wl_text");
const wlStore = importModule("fq_wl_store");
const wlForm = importModule("fq_wl_form");
const wlEditor = importModule("fq_wl_editor");
const wlView = importModule("fq_wl_view");
const jedHtml = importModule("fq_jed_html");
const jedStyles = importModule("fq_jed_styles");
const jedText = importModule("fq_jed_text");
const jedStore = importModule("fq_jed_store");
const jedModal = importModule("fq_jed_modal");
const jedTransfer = importModule("fq_jed_transfer");
const jedView = importModule("fq_jed_view");
const statusEnum = importModule("fq_enum_status");
const visaEnum = importModule("fq_enum_visa");
const tafweejEnum = importModule("fq_enum_tafweej");
const inspectionEnum = importModule("fq_enum_inspection");
const stats = importModule("fq_stats");
const statsAgg = importModule("fq_stats_aggregator");
const statsRep = importModule("fq_stats_report");
const icons = importModule("fq_icons");

// Firebase ID tokens مدتها ساعة تقريبًا. نجددها مبكرًا داخل Scriptable
// ونرسل الرمز القصير الجديد فقط إلى WebView؛ refresh token يبقى في Keychain.
const WEBVIEW_AUTH_REFRESH_MS = 30 * 60 * 1000;
let _webViewAuthRefreshInProgress = false;

// ═══ كود شركات الطيران ═══
/**
 * يُرجع JavaScript نظام البحث في شركات الطيران.
 * @returns {string}
 */
function getAirlinesCode() {
  return getAirlinesCodePart1() +
    getAirlinesCodePart2() +
    getAirlinesCodePart3() +
    getAirlinesCodePart4();
}

/** الجزء 1 من 4 من نصّ `getAirlinesCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAirlinesCodePart1() {
  return `
let alTab=document.getElementById("alTab");
let alPanel=document.getElementById("alPanel");
let alInput=document.getElementById("alInput");
let alResults=document.getElementById("alResults");
let alCount=document.getElementById("alCount");
const alFilterBtns=document.querySelectorAll(".al-btn");
let alFilterMode="all";
let alSearchTimer=null;

if(alTab){alTab.addEventListener("click",function(){
  if(typeof hideAllPanels==="function")hideAllPanels();
  alTab.classList.add("tab-active");
  alPanel.style.display="block";
  doAlSearch();
})}

for(let airlineFilterIndex=0;airlineFilterIndex<alFilterBtns.length;airlineFilterIndex++){
  alFilterBtns[airlineFilterIndex].addEventListener("click",function(){
    alFilterMode=this.getAttribute("data-ah");
    for(let x=0;x<alFilterBtns.length;x++)
      alFilterBtns[x].classList.remove("al-active");
    this.classList.add("al-active");
    doAlSearch();
  });
}

if(alInput){alInput.addEventListener("input",function(){
  clearTimeout(alSearchTimer);
  alSearchTimer=setTimeout(doAlSearch,${cfg.SEARCH_DEBOUNCE_MS});
})}

function buildAlCard(code,al){
  const hCls=al.handler==="SGS"?"sgs":"swissport";
  let c='<div class="al-card">';
  c+='<div class="al-code" data-act="code" data-val="'+code+'">'+code+'</div>';
  c+='<div class="al-info">';
  c+='<div class="al-name">'+al.name+'</div>';
  if(al.country)c+='<div class="al-country" data-act="country" data-val="'+al.country+'">'+al.country+'</div>';
  c+='</div>';
  c+='<div class="al-handler '+hCls+'" data-act="handler" data-val="'+al.handler+'">'+al.handler+'</div>';
  c+='</div>';
  return c;
}
`;
}

/** الجزء 2 من 4 من نصّ `getAirlinesCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAirlinesCodePart2() {
  return `
// إبراز زرّ الفلتر المطابق للوضع
function _alHighlight(mode){
  for(let x=0;x<alFilterBtns.length;x++){
    alFilterBtns[x].classList.remove("al-active");
    if(alFilterBtns[x].getAttribute("data-ah")===mode)
      alFilterBtns[x].classList.add("al-active");
  }
}

// النقر على دولة: بحث بها وكل المناولين
function _alPickCountry(val){
  alInput.value=val;alFilterMode="all";
  _alHighlight("all");
  doAlSearch();window.scrollTo({top:0,behavior:"smooth"});
}

// النقر على مناول: تصفية به بلا نصّ بحث
function _alPickHandler(val){
  alInput.value="";alFilterMode=val;
  _alHighlight(val);
  doAlSearch();window.scrollTo({top:0,behavior:"smooth"});
}

// النقر على الرمز: نسخه وإظهار علامة قصيرة
function _alCopyCode(el,val){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(val);
  }
  el.style.color="#16a34a";el.innerHTML=buildIcon("check",14);
  setTimeout(function(){el.style.color="";el.textContent=val;},800);
}

document.addEventListener("click",function(e){
  let el=e.target.closest("[data-act]");
  if(!el)return;
  let act=el.getAttribute("data-act");
  let val=el.getAttribute("data-val");
  if(!act||!val)return;
  if(act==="country")_alPickCountry(val);
  else if(act==="handler")_alPickHandler(val);
  else if(act==="code")_alCopyCode(el,val);
});
`;
}

/** الجزء 3 من 4 من نصّ `getAirlinesCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAirlinesCodePart3() {
  return `
// هل تطابق الشركة نصّ البحث (الرمز أو الاسم أو الدولة أو المناول)؟
function _alMatches(k,al,q){
  return k.toLowerCase().indexOf(q)!==-1||
    al.name.toLowerCase().indexOf(q)!==-1||
    al.country.toLowerCase().indexOf(q)!==-1||
    al.handler.toLowerCase().indexOf(q)!==-1;
}

// الشركات المطابقة للفلتر والنصّ، مرتّبة بالرمز
function _alFilter(keys,q){
  let filtered=[];
  for(let i=0;i<keys.length;i++){
    let k=keys[i];let al=AIRLINES[k];
    if(alFilterMode!=="all"&&al.handler!==alFilterMode)continue;
    if(q&&!_alMatches(k,al,q))continue;
    filtered.push({code:k,data:al});
  }
  filtered.sort(function(a,b){return a.code.localeCompare(b.code);});
  return filtered;
}

`;
}

/** الجزء 4 من 4 من نصّ `getAirlinesCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAirlinesCodePart4() {
  return `
// نصّ العدّاد: «ن من م» عند وجود فلتر أو بحث، وإلا العدد الكلي
function _alCountText(filtered,keys,q){
  return q||alFilterMode!=="all"
    ?filtered.length+" من "+keys.length
    :keys.length+" شركة طيران";
}

// رسم النتائج أو رسالة «لا توجد نتائج»
function _alRender(filtered){
  if(filtered.length===0){
    alResults.innerHTML='<div class="nodata"><span class="ic">'+buildIcon("info",24)+'</span>لا توجد نتائج</div>';
    return;
  }
  let h="";
  for(let j=0;j<filtered.length;j++){
    h+=buildAlCard(filtered[j].code,filtered[j].data);
  }
  alResults.innerHTML=h;
}

function doAlSearch(){
  if(!AIRLINES){return}
  let q=alInput?alInput.value.trim().toLowerCase():"";
  let keys=Object.keys(AIRLINES);
  let filtered=_alFilter(keys,q);
  if(alCount)alCount.textContent=_alCountText(filtered,keys,q);
  _alRender(filtered);
}
doAlSearch();
`;
}

function _authErrorCode(error) {
  return error.code || "AUTH_GATE_EXCEPTION";
}

// مرحلة بوابة الدخول في دفتر الرصد، بحالاتها الثلاث: معلّقة ثم نجاح أو فشل.
const AUTH_GATE_STAGE = Object.freeze({ stageId: "main_auth_gate", phase: "authentication", label: "بوابة دخول النظام", path: "fq_auth.authGate" });

function _recordAuthGate(status, details) {
  monitorJourney.recordMonitorAuthCheckpoint(Object.assign({}, AUTH_GATE_STAGE, { status: status }, details));
}

/** تنبيه بزرّ «حسنًا» وحده. */
async function _showNotice(title, message) {
  const alert = new Alert();
  alert.title = title;
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
}

async function _handleMainAuthException(error) {
  const code = _authErrorCode(error);
  _recordAuthGate("failed", { code: code, message: error.message });
  monitorJourney.finishMonitorAuthJourney({ ok: false, code: code, message: error.message });
  logger.logError("main#auth", error);
  await _showNotice("فشل المصادقة", error.message || "خطأ غير متوقع");
  return { ok: false, user: null };
}

function _authRejectedMessage(result) {
  return (result && result.error) || "لم تكتمل المصادقة.";
}

function _handleMainAuthRejection(result) {
  const cancelled = Boolean(result && result.stop);
  const code = cancelled ? "USER_CANCELLED" : "AUTH_GATE_REJECTED";
  const message = _authRejectedMessage(result);
  _recordAuthGate(cancelled ? "skipped" : "failed", { code: code, message: message });
  monitorJourney.finishMonitorAuthJourney({ ok: false, cancelled: cancelled, code: code, message: message });
  return { ok: false, user: null };
}

async function _authenticateMain() {
  monitorJourney.startMonitorAuthJourney();
  _recordAuthGate("pending");
  let authResult;
  try { authResult = await auth.authGate(); }
  catch (error) { return await _handleMainAuthException(error); }
  if (!(authResult && authResult.ok)) return _handleMainAuthRejection(authResult);
  return _acceptMainAuth();
}

function _acceptMainAuth() {
  const user = cfg.getCurrentUser();
  _recordAuthGate("passed");
  monitorJourney.finishMonitorAuthJourney({ ok: true, empId: user.empId });
  return { ok: true, user: user };
}

async function _startMainMonitoring(user) {
  try { await monitorSession.startMonitoringAfterLogin(user); }
  catch (error) { logger.logError("main#monitor_start", error); }
}

async function _trackMainFirstRun(user) {
  try { await _trackFirstRun(user); }
  catch (error) { logger.logError("main#1", error); }
}

async function _loadMonitorBootData() {
  try { return await monitorDashboard.buildMonitorBootData(); }
  catch (error) { logger.logError("main#monitor_boot", error); return {}; }
}

function _autoSearchQuery() {
  if (args.queryParameters && args.queryParameters.search) return args.queryParameters.search;
  return "";
}

async function _runInitialSearch(webView, autoSearch) {
  if (autoSearch) {
    await webView.evaluateJavaScript(
      'setTimeout(function(){' +
      'if(typeof si!=="undefined"&&typeof doSearch==="function"){' +
      'si.value=' + JSON.stringify(String(autoSearch)) + ';' +
      'doSearch();}},500);void(0);'
    );
    return;
  }
  await webView.evaluateJavaScript(
    'setTimeout(function(){' +
    'if(typeof doSearch==="function"){doSearch();}' +
    '},500);void(0);'
  );
}

async function _presentMainWebView(webView) {
  const sessionRefreshTimer = _startWebViewSessionRefresh(webView);
  const localTimer = Timer.schedule(5000, true, () => {
    _persistLocalDiagnostics(webView).catch((error) => { localMonitor.recordError(error, { action: "local_bridge" }); });
  });
  try { await webView.present(true); }
  finally {
    if (sessionRefreshTimer) sessionRefreshTimer.invalidate();
    localTimer.invalidate();
    await _persistLocalDiagnostics(webView);
    localMonitor.flush();
  }
  await monitorCapture.drainMonitorWebErrors(webView);
}

async function _readLiveAction(webView) {
  try { return await webView.evaluateJavaScript("window._FQ_ACTION || ''"); }
  catch (error) { logger.logError("main#6", error); return ""; }
}

async function _handleClosedMainView(webView, user) {
  const liveAction = await _readLiveAction(webView);
  await _handleSnapshot(webView);
  await _handleClipboard(webView);
  await _handleNotifPref(webView);
  await _handleLiveAction(liveAction, webView, user);
}

async function main() {
  const authentication = await _authenticateMain();
  if (!authentication.ok) return;
  const user = authentication.user;
  localSession = localMonitor.start({ empId: String(user.empId || ""), deviceId: monitorDashboard.getLocalDeviceId() });

  // ═══ الرصد لا يقف أمام شاشة الموظف ═══
  // تسلسل الرصد سبعة طلبات متتابعة (مصادقة معزولة، طلب ربط، نبضة، تفريغ
  // دفعة، تحقّق ربط، نشر رحلات، سحب أوامر)، وكلها **تتبّع إداريّ لا يراه
  // الموظف ولا ينتظره**. وكان يُنتظَر قبل أن تُبنى الصفحة أصلًا، فيدفع
  // الموظفُ ثمنَ سبعة أشواط شبكة قبل أن يرى شيئًا.
  // يبدأ الآن ويمضي بالتوازي. و.catch() إلزامية لوعد لا يُنتظَر (البند ٣).
  //
  // **أثران مقبولان مصرَّح بهما**: (١) ملخّص رحلات المصادقة في تيوب الرصد
  // قد لا يحوي رحلة هذا التشغيل لحظةَ بناء الصفحة، لأنها ما زالت تُكتب —
  // وهي لوحة تشخيص للمطوّر تُحدَّث بنفسها. (٢) لو انتهت صلاحية رمز الرصد
  // في اللحظة نفسها، جاز أن يُجدَّد مرّتين — والرمز المخزَّن آخِرُ ما كُتب،
  // وكلا التجديدين صالح.
  _startMainMonitoring(user).catch((error) => logger.logError("main#monitor_start", error));

  const liveCache = _loadLiveCache();
  // ═══ المستقلّ يُطلب معًا لا واحدًا بعد واحد ═══
  // الأربعة لا يعتمد بعضها على بعض: حالة القفل، وعلَم أول تشغيل، وبيانات
  // الصفحة، وبيانات إقلاع الرصد. وكانت تُنتظَر تباعًا فيُجمَع زمنها، وهي
  // تُطلب الآن معًا فيصير زمنها زمنَ أبطئها وحده.
  // Promise.all من ECMAScript 6 (المواصفة، البند 25.4.4.1)، وهي داخل ما
  // تضمنه وثائق Scriptable: «JavaScriptCore, which supports ECMAScript 6».
  // ولا تحتاج .catch() هنا: كلٌّ من الأربعة يبتلع خطأه ويُرجع قيمة احتياطية.
  //
  // **ولا تتصادم على رمز النظام**: ثلاثة منها تطلب من القاعدة، وكانت
  // متتابعة فلا يجدّد الرمزَ إلا واحد. والتوازي كان يجوز أن يجدّده ثلاثة
  // معًا، لولا أن `_authenticateMain` أعلاه انتهى قبل سطر واحد وترك رمزًا
  // باقيًا له **خمس دقائق على الأقل** (`EXPIRY_SAFETY_SECONDS = 300` في
  // `fq_firebase_auth`)، وهذه القراءات تنتهي في ثوانٍ. فالتجديد لا يقع
  // داخلها أصلًا، والتصادم ممنوع بنيويًّا لا بالتمنّي.
  const [locked, , pageData, monitorBoot] = await Promise.all([
    _checkSystemLock(user),
    _trackMainFirstRun(user),
    _loadPageData(liveCache.liveFlights, liveCache.liveAge),
    _loadMonitorBootData(),
  ]);
  // القفل علامة حالة لا بوابة (قرار المالك في _checkSystemLock)، فهو يُرجع
  // false دائمًا. وبقاء الفحص هنا يحفظ المعنى لو تغيّر القرار يومًا.
  if (locked) return;
  const fullHtml = _buildFullHtml(pageData, monitorBoot);

  await _showMainView(new WebView(), fullHtml, user);
}

/** يحمّل الصفحة في الواجهة ويعرضها، ثم يعالج ما تركته الصفحة بعد إغلاقها. */
async function _showMainView(webView, fullHtml, user) {
  webView.shouldAllowRequest = (request) => _handleBridgeRequest(request, webView);
  await webView.loadHTML(fullHtml);
  await _runInitialSearch(webView, _autoSearchQuery());
  await _presentMainWebView(webView);
  await _handleClosedMainView(webView, user);
}

/**
 * يبدأ تجديد رمز المصادقة ما دامت واجهة النظام مفتوحة.
 * @param {WebView} webView واجهة النظام الحالية
 * @returns {Timer} المؤقت الواجب إيقافه عند إغلاق الواجهة
 */
function _startWebViewSessionRefresh(webView) {
  return Timer.schedule(WEBVIEW_AUTH_REFRESH_MS, true, () => {
    _refreshWebViewAuthToken(webView).catch((error) => {
      logger.logError("main#auth_refresh", error);
    });
    monitorSession.refreshMonitorWebViewToken(webView).catch((error) => {
      logger.logError("main#monitor_auth_refresh", error);
    });
    _persistQueue(webView).catch((error) => {
      logger.logError("main#queue_persist", error);
    });
  });
}

/**
 * ينقل صورة الطابور من الصفحة إلى ملف الجهاز.
 *
 * لا مؤقت جديد لهذا: المؤقت القائم لتجديد الجلسة يُبطَل في `finally` عند
 * إغلاق الواجهة، ومؤقتٌ ثانٍ يعني نقطة تسريب ثانية. والحدّ المصرَّح به أن
 * ما يُدرَج بين نبضتين يضيع لو قُتل التطبيق قسرًا — حدّ الجسر لا الطابور.
 * @param {WebView} webView واجهة النظام الحالية
 * @returns {Promise<number>} عدد العناصر المكتوبة، و-1 عند تعذّر التحويل
 */
async function _persistQueue(webView) {
  const raw = await webView.evaluateJavaScript("window._FQ_QUEUE || ''");
  return queueFile.persistRaw(raw);
}

/**
 * يجدد ID token من refresh token المحفوظ في Keychain ويحدث WebView حيًا.
 * لا يطلب من الموظف إعادة الدخول إلا إذا ألغى Firebase الجلسة فعليًا.
 * @param {WebView} webView واجهة النظام الحالية
 * @returns {Promise<boolean>} true عند تحديث الرمز
 */
async function _refreshWebViewAuthToken(webView) {
  if (_webViewAuthRefreshInProgress) return false;
  _webViewAuthRefreshInProgress = true;
  try {
    const token = await firebaseAuth.getValidIdToken(true);
    const user = cfg.getCurrentUser();
    cfg.setCurrentUser({
      name: user.name,
      role: user.role,
      empId: user.empId,
      uuid: user.uuid,
      uid: user.uid,
      email: user.email,
      token: token,
    });
    const tokenJson = JSON.stringify(token);
    await webView.evaluateJavaScript(
      'if(typeof window.fqUpdateFirebaseToken==="function"){' +
      'window.fqUpdateFirebaseToken(' + tokenJson + ');' +
      '}void(0);'
    );
    return true;
  } finally {
    _webViewAuthRefreshInProgress = false;
  }
}

// ═══ عنوان الجسر الداخلي لفتح واتساب من داخل نافذة العرض ═══
// نافذة الويب لا تفتح المخططات المخصصة بنفسها، فتُعترض هنا ويُفتح التطبيق من السكربت الأم
const FQ_WA_BRIDGE = "https://fq-bridge.invalid/wa?text=";

// ═══ عنوان الجسر الداخلي لتجديد رمز الدخول بطلب من الصفحة ═══
// الصفحة تطلبه عند أول رفض ٤٠١/٤٠٣ (fbFetchTimeout في fq_firebase_webview)،
// لأن المؤقّت أدناه لا يعمل والتطبيق في الخلفية فيعود الموظف برمز منتهٍ.
// التجديد نفسه هو _refreshWebViewAuthToken التي يستعملها المؤقّت، لا نسخة ثانية.
const FQ_AUTH_BRIDGE = "https://fq-bridge.invalid/auth-renew";

/**
 * يقرر السماح بطلبات نافذة العرض ويعترض طلبَي الجسر: واتساب وتجديد الرمز.
 * @param {Request} request الطلب الذي تحاول النافذة تحميله
 * @param {WebView} webView واجهة النظام التي يُحقن فيها الرمز الجديد
 * @returns {boolean} true للسماح، false لمنع التحميل بعد تنفيذ الجسر
 */
function _handleBridgeRequest(request, webView) {
  try {
    const url = (request && request.url) ? request.url : "";
    if (url.indexOf(FQ_AUTH_BRIDGE) === 0) return _renewFromBridge(webView);
    if (url.indexOf(FQ_WA_BRIDGE) !== 0) return true;
    _openWhatsApp(url);
    return false;
  } catch(e) {
    logger.logError("main#bridge", e);
    return true;
  }
}

/** طلب الصفحة تجديدَ الرمز: يمضي التجديد ويُمنع تحميل العنوان. */
function _renewFromBridge(webView) {
  // لا يُنتظَر: shouldAllowRequest تُرجع قيمة منطقية بنصّ الوثائق، فالتجديد
  // يمضي وحده و.catch() إلزامية لوعدٍ لا يُنتظَر (البند ٣).
  _refreshWebViewAuthToken(webView).catch((error) => {
    logger.logError("main#auth_bridge", error);
  });
  return false;
}

/** يفتح واتساب بالنصّ المحمول في عنوان الجسر، إن وُجد نصّ. */
function _openWhatsApp(url) {
  const text = decodeURIComponent(url.substring(FQ_WA_BRIDGE.length));
  if (text.length > 0) Safari.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
}

// ═══ Handler: نسخ الصورة ═══
async function _handleSnapshot(wv) {
  try {
    const snapReady = await wv.evaluateJavaScript("window._FQ_SNAPSHOT_READY || false");
    if (!snapReady) return;
    const dataUrl = await wv.evaluateJavaScript("window._FQ_SNAPSHOT || ''");
    await _copySnapshot(dataUrl);
    await wv.evaluateJavaScript("window._FQ_SNAPSHOT_READY = false; void(0);");
  } catch(e) { logger.logError("main#snap", e); }
}

/** ينسخ صورة اللقطة إلى الحافظة ويُعلم، إن كانت صورة فعلًا. */
async function _copySnapshot(dataUrl) {
  if (!(dataUrl && dataUrl.length > 100)) return;
  const b64 = dataUrl.split(",")[1];
  if (!b64) return;
  Pasteboard.copyImage(Image.fromData(Data.fromBase64String(b64)));
  await _notifyUser("📷 تم نسخ الصورة", "الصق الصورة في أي محادثة");
}

/** إشعار بعنوانه ونصّه وصوته الافتراضي، إن سمح الموظف بالإشعارات. */
async function _notifyUser(title, body) {
  const notification = new Notification();
  notification.title = title;
  notification.body = body;
  notification.sound = "default";
  await _scheduleNotifIfAllowed(notification);
}

// ═══ Handler: نسخ النص للحافظة ═══
async function _handleClipboard(wv) {
  try {
    const clipReady = await wv.evaluateJavaScript("window._FQ_CLIPBOARD_READY || false");
    if (!clipReady) return;
    const clipText = await wv.evaluateJavaScript("window._FQ_CLIPBOARD_TEXT || ''");
    const waIntent = await wv.evaluateJavaScript("window._FQ_WA_SENT || false");
    await _copyClipText(clipText, waIntent);
    await wv.evaluateJavaScript("window._FQ_CLIPBOARD_READY = false; window._FQ_WA_SENT = false; void(0);");
  } catch(e) { logger.logError("main#clipboard", e); }
}

/** ينسخ النصّ إلى الحافظة ويُعلم، إن كان أطول من خمسة أحرف. */
async function _copyClipText(clipText, waIntent) {
  if (!(clipText && clipText.length > 5)) return;
  Pasteboard.copyString(clipText);
  await _notifyUser("✓ تم النسخ", waIntent ? "تم إرسال البيانات عبر واتساب وحفظها في الحافظة" : "البيانات محفوظة في الحافظة — الصقها في واتساب");
}

// ═══ فحص تفضيل الإشعارات قبل جدولتها — قارئه الوحيد fq_alerts ═══
function _isNotifAllowed() {
  return alertsMod.isNotifAllowed((e) => logger.logError("main#notif_check", e));
}

async function _scheduleNotifIfAllowed(notification) {
  if (!_isNotifAllowed()) return;
  try {
    await notification.schedule();
  } catch (error) {
    // رفض إذن الإشعارات في iOS يصل برسالة Scriptable مضلِّلة نصّها
    // "Access to contacts is not granted" — ليس عطل نظام فلا يُرفع للرصد.
    // القاعدة نفسها المطبَّقة في fq_alerts._isPermissionDenialMessage.
    const message = (error && error.message) ? error.message : String(error);
    if (message.indexOf("not granted") === -1) throw error;
  }
}

// ═══ Handler: حفظ تفضيل الإشعارات في Keychain ═══
async function _disableNotifications() {
  Keychain.set("fq_notif_off", "1");
  try { await alertsMod.cancelAllAlerts(); } catch (error) { /* صلاحيات غير ممنوحة — صامت */ }
}

async function _applyNotificationPreference(pref) {
  if (pref === "off") { await _disableNotifications(); return; }
  if (pref === "on") Keychain.set("fq_notif_off", "0");
}

async function _handleNotifPref(wv) {
  try {
    const pref = await wv.evaluateJavaScript("window._FQ_NOTIF_PREF || ''");
    await wv.evaluateJavaScript("window._FQ_NOTIF_PREF = ''; void(0);");
    if (pref) await _applyNotificationPreference(pref);
  } catch (error) { logger.logError("main#notif_pref", error); }
}

// ═══ نص قراءة بيانات نافذة العرض ═══
/**
 * يبني نص القراءة المُقيَّم داخل نافذة العرض.
 * يُرجع نصاً دائماً عبر دالة الإنهاء العامة، لأن القيمة غير المعرَّفة
 * أو غير القابلة للترميز تُسقط التقييم بخطأ "نوع غير مدعوم".
 * أربع طبقات حماية: تنقية كل حقل إلى primitive، تحويل depTime إلى
 * ISO string داخل try مستقل، مغلّف _safeCall يبتلع أي رمي من completion
 * نفسها، وتحقق نوع مضاعف قبل الاستدعاء الفعلي.
 * @returns {string}
 */
function _buildReadDataScript() {
  return [
    '(function(){',
    // مغلّف لـ completion يضمن قيمة string حصراً ويبتلع أي رمي داخلي.
    'function _safeCall(v){try{completion(typeof v==="string"?v:"");}catch(_e){}}',
    // depTime من Date إلى ISO string حصراً — لا مرجع لكائن حي.
    'function _depIso(dep){',
    '  if(dep&&typeof dep.toISOString==="function"){try{return dep.toISOString();}catch(_1){return "";}}',
    '  return typeof dep==="string"?dep:"";',
    '}',
    // تنقية كل رحلة إلى primitives فقط (عقد البيانات المجمّد).
    'function _cleanRoute(x){return {al:String(x.al||""),flt:String(x.flt||""),to:String(x.to||""),',
    '  std:String(x.std||""),type:String(x.type||""),dpax:String(x.dpax||"")};}',
    'function _cleanFlight(x){',
    '  const dep=_depIso(x.depTime);const o=_cleanRoute(x);',
    '  o.date=String(x.date||"");o.depTime=dep;o.terminal=String(x.terminal||"");',
    '  o._status=String(x._status||"");',
    '  o._fbKey=(typeof x._fbKey==="string")?x._fbKey:null;o._src=String(x._src||"");',
    '  return o;',
    '}',
    // تنقية الملفات: id/count أرقام، name/date نصوص، لا مرجع لـ File object.
    'function _cleanFile(y){',
    '  return {id:Number(y.id)||0,name:String(y.name||""),date:String(y.date||""),count:Number(y.count)||0};',
    '}',
    'function _cleanAll(list,clean){',
    '  const out=[];',
    '  for(let i=0;i<list.length;i++)out.push(clean(list[i]||{}));',
    '  return out;',
    '}',
    'function _emit(){',
    '  const d=(typeof DATA!=="undefined"&&Array.isArray(DATA))?DATA:[];',
    '  const f=(typeof FILES!=="undefined"&&Array.isArray(FILES))?FILES:[];',
    '  const snap={flights:_cleanAll(d,_cleanFlight),files:_cleanAll(f,_cleanFile)};',
    // تسلسل نهائي ضمن try مستقل، مع تحقق نوع مضاعف قبل completion.
    '  let out="";',
    '  try{out=JSON.stringify(snap);}catch(_2){out="";}',
    '  _safeCall(typeof out==="string"?out:"");',
    '}',
    'try{_emit();}catch(_3){_safeCall("");}',
    '})();',
  ].join("");
}

// ═══ رفع الرحلات المحفوظة سحابياً ═══
/**
 * يرحّل الرحلات المحفوظة إلى القاعدة ويدفع إشعار التحديث.
 * فشل الترحيل يُسجَّل في طبقة الرصد لا يُبتلع صامتاً، لأن الحفظ المحلي
 * ينجح فيظنّ المستخدم أن البيانات وصلت السحابة وهي لم تصل.
 * @param {Object} parsed - البيانات المقروءة من نافذة العرض
 * @param {Object} user - المستخدم الحالي
 * @returns {Promise<void>}
 */
async function _syncSavedData(parsed, user) {
  try {
    await firebase.saveFlightsToFirebase(parsed.flights, parsed.files);
    await firebase.pushNotification({ type: "data_updated", title: "تحديث بيانات الرحلات",
      details: `${parsed.flights.length} رحلة`, user: user.name, role: user.role,
      time: new Date().toISOString() });
  } catch(fbErr) {
    logger.logError("main#12", fbErr);
  }
}

// ═══ إشعار اكتمال الحفظ ═══
/**
 * يعرض إشعار الحفظ إن كانت الإشعارات مسموحة.
 * @param {number} flightsCount - عدد الرحلات المحفوظة
 * @param {number} alertsCount - عدد التنبيهات المجدولة
 * @returns {Promise<void>}
 */
async function _notifySaved(flightsCount, alertsCount) {
  if (!_isNotifAllowed()) return;
  await _notifyUser(`✈ ${cfg.SYSTEM_NAME}`,
    `تم حفظ ${flightsCount} رحلة${alertsCount > 0 ? ` — ${alertsCount} تنبيه مُجدول` : ""}`);
}

// ═══ Handler: حفظ البيانات بعد الإغلاق ═══
async function _handleSaveData(wv, user) {
  const startedAt = Date.now();
  try {
    const rawData = await wv.evaluateJavaScript(_buildReadDataScript(), true);
    // الجسر الفارغ كان خروجاً صامتاً: البيانات لا تُحفظ ولا يعلم أحد.
    if (!rawData) {
      _captureEmptyBridge(startedAt);
      return;
    }
    await _saveClosedData(JSON.parse(rawData), user);
  } catch(e) {
    logger.logError("main#save_bridge", e);
  }
}

/** يرصد جسر حفظٍ عاد فارغًا، ومدّته منذ بدء القراءة. */
function _captureEmptyBridge(startedAt) {
  monitorCapture.captureMonitorError(new Error("empty_bridge_result"), {
    category: "webview_bridge", stage: "save_bridge", durationMs: Date.now() - startedAt
  });
}

/**
 * يحفظ ما قرأه الجسر عند الإغلاق: في الجهاز ثم في القاعدة، ثم التنبيهات والإشعار.
 * @param {{flights: Object[], files: Object[]}} parsed ما أرجعته الصفحة
 * @param {Object} user
 * @returns {Promise<void>}
 */
async function _saveClosedData(parsed, user) {
  // ═══ صفر رحلة ليس «لا بيانات» ═══
  // الجسر الفارغ (`!rawData` في _handleSaveData) هو حالة «لا نعلم»، وهي مرصودة.
  // وأمّا مصفوفة فارغة فهي **نتيجة حذفٍ مقصود**، ويجب أن تلحق بها نسخة الجهاز،
  // وإلّا بقيت ودجة الشاشة الرئيسية (`fq_widget.js:263`) تعرض ما حُذف.
  // وكان الشرط `length === 0` يخرج صامتًا فلا تُفرَّغ النسخة أبدًا.
  // (تقرير التدقيق ٢٠٢٦-٠٩-٢٥، البند ٤.)
  if (!Array.isArray(parsed.flights)) return;
  storage.saveFlights(parsed.flights, parsed.files);
  await _syncSavedData(parsed, user);
  if (parsed.flights.length === 0) return;
  const count = await alertsMod.scheduleAlerts(parsed.flights);
  await _notifySaved(parsed.flights.length, count);
}

// ═══ Handler: حفظ الدليل ═══
async function _handleSaveGuide(wv) {
  try {
    const guideHtml = await wv.evaluateJavaScript("window._FQ_GUIDE_HTML || ''");
    if (!guideHtml || guideHtml.length < 10) return;
    await _storeGuide(guideHtml);
  } catch(e) { logger.logError("main#13", e); }
}

/** يحفظ نصّ الدليل في الجهاز ثم في القاعدة. */
async function _storeGuide(guideHtml) {
  const fm = FileManager.local();
  fm.writeString(fm.joinPath(fm.documentsDirectory(), "fq_guide_data.json"),
    JSON.stringify({ html: guideHtml, updatedAt: new Date().toISOString() }));
  await firebase.saveGuide(guideHtml);
}

// عدد ما غيّره الجلب في الجدول. صفرٌ = لا كتابة أصلًا: إعادة كتابة سجلّات
// لم تتغيّر تراكمُ بيانات ممنوع بأمر المالك.
function _hallChangeCount(result) {
  return result.added + result.rescheduled + result.canceled + result.delayed + result.cleared;
}

// «أُضيفت ٢ · تغيّر موعد ١ · ملغاة ١ · متأخرة ١ · رُفع الإلغاء ١ · رُفع التأخر ١» —
// ما حدث بالأرقام، وما لم يحدث لا يُذكر.
function _hallChangeText(result, task) {
  const parts = [];
  if (result.added > 0) parts.push(`أُضيفت ${result.added}`);
  if (result.rescheduled > 0) parts.push(`تغيّر موعد ${result.rescheduled}`);
  if (result.canceled > 0) parts.push(`ملغاة ${result.canceled}`);
  if (result.delayed > 0) parts.push(`متأخرة ${result.delayed}`);
  if (result.clearedCanceled > 0) parts.push(`رُفع الإلغاء ${result.clearedCanceled}`);
  if (result.clearedDelayed > 0) parts.push(`رُفع التأخر ${result.clearedDelayed}`);
  if (parts.length > 0) return parts.join(" · ");
  // «إضافة» لا تنظر في المواعيد، فلا تدّعي أن الجدول مطابق للموقع
  return task === "add" ? "لا رحلات جديدة — كلها في الجدول" : "لا تغيير — الرحلات الموجودة مطابقة لموقع المطار";
}

// ما تركه الزرّ عمدًا لأنه مهمّة الزرّ الآخر — يُقال فلا يظنّ الموظف أنه ضاع.
function _hallLeftText(result) {
  if (result.skippedNew > 0) return ` — ${result.skippedNew} رحلة جديدة في الموقع: أضفها بزرّ «إضافة»`;
  if (result.duplicates > 0 && result.added > 0) return ` — ${result.duplicates} موجودة سابقًا`;
  return "";
}

/**
 * جلبٌ من موقع المطار دُمج في جدول صالة: ما يحتاجه الحفظ والإشعار معًا.
 * @typedef {{terminalKey: string, task: string, result: Object, built: Object, current: Object}} HallMerge
 */

/**
 * يحفظ الدمج في الجهاز ثم في عقدة الصالة. يُرجع صدقًا هل وصل الحفظ إلى القاعدة —
 * فلا يُقال «تغيّر موعد ١» على ما لم يُحفظ.
 * @param {HallMerge} merge
 * @param {Object} user
 * @returns {Promise<boolean>}
 */
async function _persistHallMerge(merge, user) {
  storage.saveFlights(merge.result.merged, merge.current.files || []);
  try {
    // رحلات هذه الصالة وحدها تُكتب في القاعدة، في عقدتها. القائمة كاملة
    // تبقى لنسخة الجهاز وللعدد في flights_meta.
    const saved = await firebase.saveFlightsToFirebase(merge.result.merged, merge.current.files || [], merge.terminalKey);
    if (!saved) return false;
    await firebase.pushNotification({
      type: "hall_flights_added", title: `رحلات ${hall.hallTerminalLabel(merge.terminalKey)} من موقع المطار`,
      details: _hallChangeText(merge.result), user: user.name, role: user.role,
      time: new Date().toISOString(),
    });
    return true;
  } catch (error) { logger.logError("main#hall_fb", error); return false; }
}

/**
 * يُعلم الموظف بما حدث بالأرقام، ويحذّر إن لم يصل الحفظ.
 * @param {HallMerge} merge
 * @param {boolean} saved
 */
async function _notifyHallMerge(merge, saved) {
  await _notifyUser(`✈ رحلات ${hall.hallTerminalLabel(merge.terminalKey)}`,
    (saved ? "" : "⚠ تعذّر الحفظ في القاعدة — لم يصل التغيير: ")
    + _hallChangeText(merge.result, merge.task)
    + _hallLeftText(merge.result)
    + (merge.built.skipped > 0 ? ` — تجاوز ${merge.built.skipped} لعدم وضوح الوجهة` : ""));
}

// لكل زرّ مهمّة واحدة (قرار المالك ٢٠٢٦-٠٩-٢٨): «إضافة» يضيف الجديد وحده،
// و«تحديث» يحدّث الموجود وحده. والجلب من الموقع واحد لهما.
const HALL_TASKS = Object.freeze({
  add: (flights, fresh) => hall.addHallFlights(flights, fresh),
  refresh: (flights, fresh) => hall.refreshHallFlights(flights, fresh),
});

/**
 * زرّ صالة: يجلب من موقع المطار، ويدمج بمهمّة الزرّ، ويحفظ إن تغيّر شيء، ثم يُعلم.
 * @param {string[]} hallAction [الصالة، المهمّة] من جدول HALL_ACTIONS
 */
async function _handleHallExtract(hallAction, wv, user) {
  try {
    await _runHallTask(hallAction, wv, user);
  } catch (error) { logger.logError("main#hall_extract", error); }
  await main();
}

/** مهمّة زرّ الصالة بلا حراستها: الجلب، فالدمج، فالحفظ إن تغيّر شيء، فالإشعار. */
async function _runHallTask(hallAction, wv, user) {
  const terminalKey = hallAction[0];
  const task = hallAction[1];
  const rawFlights = await live.fetchLiveFlights();
  const current = await _readHallPageState(wv);
  const built = hall.buildHallFlights(rawFlights, terminalKey, current.hallDate);
  if (!(built.flights.length > 0)) return;
  const merge = { terminalKey, task, result: HALL_TASKS[task](current.flights || [], built.flights), built, current };
  const saved = _hallChangeCount(merge.result) > 0 ? await _persistHallMerge(merge, user) : true;
  await _notifyHallMerge(merge, saved);
}

/** جدول الصفحة الحالي وملفاتها وتاريخ الصالة؛ وجدول فارغ إن لم تُرجع الصفحة شيئًا. */
async function _readHallPageState(wv) {
  const rawState = await wv.evaluateJavaScript("JSON.stringify({ flights: DATA, files: FILES, hallDate: window._FQ_HALL_DATE || '' })");
  return rawState ? JSON.parse(rawState) : { flights: [], files: [], hallDate: "" };
}

async function _handleExportGuide(wv) {
  try {
    const exportHtml = await wv.evaluateJavaScript("window._FQ_GUIDE_HTML || ''");
    if (exportHtml && exportHtml.length > 10) await _storeGuide(exportHtml);
    const fileName = await exportGuide.exportHtml(exportHtml);
    await _notifyUser("📤 تصدير الدليل", `تم تصدير ${fileName}`);
  } catch(e) { logger.logError("main#11", e); }
  await main();
}

// ═══ Handler: إضافة وجهة جديدة لملف المطارات — C≤6 ═══
async function _notifyAirportResult(result) {
  await _notifyUser(result.success ? "✅ وجهة جديدة" : "⚠️ لم تُضَف الوجهة", result.message);
}

async function _publishAddedAirport(input, result, user) {
  if (!result.success) return;
  try {
    await firebase.pushNotification({
      type: "airport_added", title: `إضافة وجهة ${result.code}`,
      details: `${input.city} - ${input.country}`,
      user: user.name, role: user.role, time: new Date().toISOString(),
    });
  } catch (error) { logger.logError("main#airport_fb", error); }
}

async function _handleAddAirport(wv, user) {
  try {
    const raw = await wv.evaluateJavaScript("window._FQ_NEW_AIRPORT || ''");
    const input = raw ? JSON.parse(raw) : null;
    if (input && input.code) {
      const result = await addAirport.addAirportDestination(input, airports);
      await _notifyAirportResult(result);
      await _publishAddedAirport(input, result, user);
    }
  } catch (error) { logger.logError("main#add_airport", error); }
  await main();
}

// زرّا كل صالة: الإجراء ← [الصالة، المهمّة]. جدولٌ لا شرطٌ لكل زرّ، كي لا
// تتضخّم الدالة أدناه بصالة جديدة (العرف ٥). صالة 4 بأمر المالك ٢٠٢٦-١٠-٠٣.
const HALL_ACTIONS = Object.freeze({
  extract_t1: ["t1", "add"], refresh_t1: ["t1", "refresh"],
  extract_north: ["north", "add"], refresh_north: ["north", "refresh"],
  extract_hall4: ["hall4", "add"], refresh_hall4: ["hall4", "refresh"],
});

// إجراءات تُنجز ثم تعيد بناء الواجهة (كلٌّ ينتهي بـ main)، فلا تُنهي الجلسة.
const REOPEN_ACTIONS = Object.freeze({
  export_guide: (wv) => _handleExportGuide(wv),
  add_airport: (wv, user) => _handleAddAirport(wv, user),
});

// ═══ Handler: إجراءات الرحلات الحية — C≤5 ═══
async function _handleLiveAction(liveAction, wv, user) {
  const hallAction = Object.prototype.hasOwnProperty.call(HALL_ACTIONS, liveAction) ? HALL_ACTIONS[liveAction] : null;
  if (hallAction) { await _handleHallExtract(hallAction, wv, user); return; }
  if (Object.prototype.hasOwnProperty.call(REOPEN_ACTIONS, liveAction)) { await REOPEN_ACTIONS[liveAction](wv, user); return; }
  if (liveAction === "mon_export_json") { await _handleMonExport(wv); }
  await _finishSession(wv, user);
}

/** خروج الموظف: حفظ البيانات والدليل، وسجلّ الإغلاق، ثم ترحيل الطابورين. */
async function _finishSession(wv, user) {
  await _handleSaveData(wv, user);
  await _handleSaveGuide(wv);
  await audit.logAction("session_end", "أغلق التطبيق");
  // مسار الخروج الحقيقي الوحيد: هنا يُطهَّر الطابور ويُرحَّل ما تجمّع.
  // وطابور الطلبات يُحفظ قبل طابور الرصد: ما فيه عمل موظف لم يصل، وما في
  // الثاني تتبّع. قراءة أخيرة تلتقط ما أُدرج بعد آخر نبضة للمؤقت.
  await _persistQueue(wv).catch((error) => {
    logger.logError("main#queue_persist_exit", error);
  });
  await monitorSession.finishMonitorSession();
}

/**
 * يحفظ تصدير الرصد من نافذة العرض إلى ملف جيسون في المستندات.
 * @param {WebView} wv
 * @returns {Promise<void>}
 */
async function _handleMonExport(wv) {
  try {
    if (!_canExportMonitor()) return;
    const raw = await wv.evaluateJavaScript("window._FQ_MON_EXPORT_JSON || ''");
    if (!raw || String(raw).length < 3) return;
    await _persistLocalDiagnostics(wv);
    const report = await _buildMonitorExport(wv, raw);
    const name = await monitorDashboard.exportMonitorReport(JSON.stringify(report));
    if (!name) return;
    await _showNotice("تم تصدير الرصد", `اخترت مكان حفظ التقرير عبر تطبيق الملفات:\n${name}`);
  } catch (e) {
    logger.logError("main#mon_export", e);
  }
}

/** ختم التقرير المصدَّر، بترتيب حقوله في التقرير. */
const LOCAL_REPORT_STAMP = Object.freeze({
  reportSchemaVersion: "1.4.0",
  systemBuildId: "local-recording-repair-1",
  versionMeaningAr: "ختم الإصدار وهوية البناء يصفان الشيفرة، ولا يمثلان بداية فترة حفظ الأحداث",
});

/**
 * تقرير الصفحة مع ختم الإصدار والتشخيص المحلي وتغطية الصفحة وملخّصه، ووقت التصدير.
 * @param {WebView} wv
 * @param {string} raw نصّ التقرير من الصفحة
 * @returns {Promise<Object>}
 */
async function _buildMonitorExport(wv, raw) {
  const report = JSON.parse(String(raw));
  Object.assign(report, LOCAL_REPORT_STAMP);
  report.localDiagnostics = localMonitor.readReport();
  report.localDiagnostics.pageCoverage = await wv.evaluateJavaScript("fqLocalCoverage()");
  report.summaryAr = _localReportSummary(report);
  _stampExportTime(report);
  return report;
}

/** وقت لقطة الصفحة يُحفظ، ووقت التصدير يحلّ محلّه، وعمر البيانات يُحسب منه. */
function _stampExportTime(report) {
  report.pageSnapshotGeneratedAtUtc = report.generatedAtUtc;
  const exportedAt = Date.now();
  report.generatedAtUtc = new Date(exportedAt).toISOString();
  if (!report.sources) return;
  report.sources.reportGeneratedAt = exportedAt;
  report.sources.dataAgeMs = report.sources.lastCloudRefreshAt ? Math.max(0, exportedAt - report.sources.lastCloudRefreshAt) : null;
}

/** هل يملك المستخدم الحالي تصدير الرصد؟ السؤال للجدول بـ can لا لاسم الدور. */
function _canExportMonitor() {
  const user = cfg.getCurrentUser() || {};
  return perms.can(user.role, "export_monitor");
}


// ═══ _checkSystemLock: قراءة حالة القفل دون منع الدخول ═══
// قرار المالك: من يملك رقم موظف وكلمة مرور يدخل حتى لو كان النظام «مقفلاً».
// القفل يبقى علامة حالة في القاعدة للمطوّر، ولا يُغلق البوابة على الموظفين.
async function _checkSystemLock(user) {
  try {
    const sysStatus = await firebase.readData("system_status");
    if (sysStatus.ok && sysStatus.data && sysStatus.data.locked === true) {
      console.log(
        "[main#lock] النظام مقفل في القاعدة بواسطة " +
        (sysStatus.data.lockedBy || "?") +
        " — الدخول مسموح لصاحب الحساب: " +
        ((user && user.empId) || "?")
      );
    }
  } catch (e) {
    logger.logError("main#lock", e);
  }
  return false;
}

// ═══ _trackFirstRun: تتبع أول تشغيل — C≤3 ═══
async function _trackFirstRun(user) {
  const fm  = FileManager.local();
  const fp  = fm.joinPath(fm.documentsDirectory(), "fq_started_flag.json");
  if (fm.fileExists(fp)) return;
  fm.writeString(fp, JSON.stringify({
    user: user.name, role: user.role, time: new Date().toISOString()
  }));
  await firebase.pushNotification({
    type: "user_started", title: "مستخدم جديد بدأ التشغيل",
    details: `${user.name} (${user.role})`,
    user: user.name, role: user.role, time: new Date().toISOString()
  });
}

// ═══ _loadLiveCache: تحميل كاش الرحلات — C≤3 ═══
function _loadLiveCache() {
  try {
    const cached = live.loadLive();
    if (cached && cached.flights && cached.flights.length > 0) {
      return { liveFlights: cached.flights, liveAge: cached.age || 0 };
    }
  } catch(e) { logger.logError("main#2", e); }
  return { liveFlights: [], liveAge: 0 };
}


// ═══ دوال تطبيع البيانات — بلا تعقيد ═══
function _normalizeFb(f) {
  return {
    _fbKey: f._fbKey, al: f.al, flt: f.flt, to: f.to,
    std: f.std, type: f.type || "", dpax: f.dpax || "",
    date: f.date, depTime: f.depTime, _src: f._src || "fb",
    terminal: f.terminal || "", _status: f._status || "",
  };
}
// `_normalizeLocal` حُذفت في ٢٠٢٦-٠٩-٢٥: كانت تُطبِّع نسخة الجهاز لعرضها في
// الصفحة، والصفحة لم تعد تقرأ نسخة الجهاز (قرار المالك: للودجة وحدها).
// والودجة تُطبِّع لنفسها في `fq_widget.js`.
function _loadLocalGuide() {
  try {
    const fm = FileManager.local();
    const p  = fm.joinPath(fm.documentsDirectory(), "fq_guide_data.json");
    if (!fm.fileExists(p)) return null;
    const d = JSON.parse(fm.readString(p));
    if (d && d.html && d.html.length > 10) {
      return `window.SAVED_GUIDE = ${JSON.stringify(d.html)};`;
    }
  } catch(e) { logger.logError("main#guide_local", e); }
  return null;
}


// ═══ _loadPageData: تحميل كل بيانات الصفحة — C≤8 ═══
function _basePageDataScripts(liveFlights, liveAge) {
  return {
    countriesJs: `window.COUNTRY = ${JSON.stringify(countries.COUNTRY)};`,
    liveDataJs: `window.LIVE_DATA = ${JSON.stringify(liveFlights)};window.LIVE_AGE = ${liveAge};`,
    airlinesJs: `window.AIRLINES = ${JSON.stringify(airlines.AIRLINES)};`,
    airportsJs: `window.AIRPORTS = ${JSON.stringify(airports.AIRPORTS)};`,
  };
}

/**
 * يبني سطر `SAVED_DATA` للصفحة من **القاعدة وحدها**.
 *
 * ═══ ثلاث حالات، لا حالتان ═══
 * | الحالة | ما يُحقَن |
 * |---|---|
 * | القاعدة قُرئت وفيها رحلات | `SAVED_DATA = { flights: [...] }` |
 * | القاعدة قُرئت وهي **فارغة** | `SAVED_DATA = { flights: [] }` |
 * | **تعذّرت** القراءة | `SAVED_DATA = null` مع `SAVED_DATA_UNREACHABLE = true` |
 *
 * وكان الموضع يخلط الفراغ بالفشل في نصٍّ واحد، ثم يسقط عند ذلك النص إلى
 * نسخة الجهاز، فكان حذف كل الرحلات يُتبَع بعودتها. وقرار المالك
 * **٢٠٢٦-٠٩-٢٥**: نسخة الجهاز **للودجة وحدها**، لا تقرأها الصفحة أبدًا،
 * وعند تعذّر القراءة تظهر رسالة صريحة بلا بياناتٍ قديمةٍ صامتة.
 * وهو امتدادٌ لقراره المسجَّل في `docs/الذاكرة.md:186` «القاعدة وحدها».
 *
 * @returns {Promise<string>} سطر جافاسكريبت يُحقَن في الصفحة
 */
async function _savedPageDataJs() {
  try {
    const data = await firebase.loadFlightsFromFirebase();
    if (data && data.flights) {
      return `window.SAVED_DATA = ${JSON.stringify({ flights: data.flights.map(_normalizeFb) })};`;
    }
  } catch (error) { logger.logError("main#3", error); }
  return "window.SAVED_DATA = null;window.SAVED_DATA_UNREACHABLE = true;";
}

async function _guidePageDataJs() {
  let guideDataJs = 'window.SAVED_GUIDE = "";';
  try {
    const remote = await firebase.loadGuide();
    if (remote && remote.html && remote.html.length > 10) {
      guideDataJs = `window.SAVED_GUIDE = ${JSON.stringify(remote.html)};`;
    } else {
      guideDataJs = _loadLocalGuide() || guideDataJs;
    }
  } catch (error) { logger.logError("main#5", error); }
  return guideDataJs;
}

// ═══ _loadPageData: تحميل كل بيانات الصفحة — C≤8 ═══
async function _loadPageData(liveFlights, liveAge) {
  const actor = cfg.getCurrentUser() || {};
  localSession = localMonitor.start({ empId: String(actor.empId || ""), deviceId: monitorDashboard.getLocalDeviceId() });
  const base = _basePageDataScripts(liveFlights, liveAge);
  // قراءتان مستقلّتان: الرحلات المحفوظة والدليل. كتابتهما في كائن واحد
  // بـ await لكلٍّ يجعلهما متتابعتين، فلا تبدأ الثانية قبل انتهاء الأولى.
  const [savedDataJs, guideDataJs] = await Promise.all([
    _savedPageDataJs(),
    _guidePageDataJs(),
  ]);
  return {
    countriesJs: base.countriesJs,
    liveDataJs: base.liveDataJs,
    airlinesJs: base.airlinesJs,
    airportsJs: base.airportsJs,
    savedDataJs: savedDataJs,
    guideDataJs: guideDataJs,
  };
}

// ═══ _buildFullHtml: تجميع HTML — C≤2 ═══
/**
 * @param {{countriesJs: string, liveDataJs: string, airlinesJs: string, airportsJs: string, savedDataJs: string, guideDataJs: string}} pageData
 *   بيانات الصفحة من _loadPageData، تُحقن أولًا بهذا الترتيب
 * @param {Object} [monitorBoot] بيانات إقلاع لوحة الرصد
 * @returns {string} نصّ الصفحة كاملًا
 */
function _buildFullHtml(pageData, monitorBoot) {
  // الترتيب ملزم: الشيفرة أولًا، ثم جسم الصفحة، ثم الوثيقة التي تجمعهما.
  const allScripts = _pageDataScripts(pageData)
    .concat(_pageCoreScripts(), _pageFeatureScripts(monitorBoot), "fqInitSavedFlights();")
    .join("\n");
  const rawHtml = _pageBodyHtml();
  return _pageDocument(rawHtml, allScripts);
}

/** تفضيل الإشعارات من Keychain (يُحقن في WebView)؛ غيابه أو فشل قراءته = مفعّلة. */
function _readNotifOffInitial() {
  return !alertsMod.isNotifAllowed((e) => logger.logError("main#notif_read", e));
}

/** بيانات الصفحة وقواميسها: تُحقن قبل أي شيفرة تقرؤها. */
function _pageDataScripts(pageData) {
  const notifOffInitial = _readNotifOffInitial();
  return [
    pageData.countriesJs, pageData.liveDataJs, pageData.airlinesJs, pageData.airportsJs, pageData.savedDataJs, pageData.guideDataJs,
    `window.PROFILE_DATA=${JSON.stringify(profile.loadProfile())};`,
    `window.STATUS=${JSON.stringify(statusEnum.STATUS)};`,
    `window.SITE_STATUSES=${JSON.stringify(statusEnum.SITE_STATUSES)};`,
    `window.VISA=${JSON.stringify(visaEnum.VISA)};`,
    `window.TAFWEEJ=${JSON.stringify(tafweejEnum.TAFWEEJ)};`,
    `window.INSPECTION=${JSON.stringify(inspectionEnum.INSPECTION)};`,
    `window.NOTIF_OFF_INITIAL=${notifOffInitial ? "true" : "false"};`,
  ];
}

/** نواة الصفحة: الأيقونات والقاعدة والصلاحيات وباب الطلب والطابور والمساعدات. */
function _pageCoreScripts() {
  return [
    icons.getIconsCode(),
    firebase.getFirebaseCode(),
    perms.getPermissionsJs(),
    toast.getToastCode(),
    // باب الطلب الواحد: بعد صاحب FB_URL و fbFetchTimeout، وقبل كل من يطلب
    // من القاعدة. الصفحة نطاق واحد، فالترتيب هو الاعتماد.
    netRequest.getNetRequestCode(),
    // الطابور فوق الباب مباشرةً، واعتماده نازل:
    // قواعد ← حيازة ← تسليم ← تفريغ ← عرض.
    // و QUEUE_BOOT قبلها كلها لأن الحيازة تقرؤه في سطرها الأخير.
    `window.QUEUE_BOOT=${JSON.stringify(queueFile.readQueue())};`,
    queueModel.getQueueModelCode(),
    queueStore.getQueueStoreCode(),
    queueSubmit.getQueueSubmitCode(),
    queueFlush.getQueueFlushCode(),
    queueView.getQueueViewCode(),
    // الكتابة الجماعية والقراءة السطحية: الأولى فوق باب التسليم
    // (fqSendOrQueue)، والثانية فوق باب الطلب (fqRequest). وكلتاهما قبل
    // كل من يحذف أو يتحقّق — parser و hall و t4Store أدناه.
    bulkWrite.getBulkWriteCode(),
    keysScan.getKeysScanCode(),
    audit.getAuditCode(),
    helpers.getAllHelpers(),
  ];
}

/** شيفرة الميزات فوق النواة، بترتيب اعتمادها النازل. */
function _pageFeatureScripts(monitorBoot) {
  return [
    parser.getParserCode(), search.getSearchCode(), sidebar.getSidebarCode(),
    live.getLiveCode(), hall.getHallAddCode(), guide.getGuideCode(),
    getAirlinesCode(), addflight.getAddFlightCode(), addAirport.getAddAirportCode(), profile.getProfileCode(),
    `window.FORM_TEMPLATE=${JSON.stringify(regmodel.getFormTemplate())};`,
    regmodel.getRegModelCode(), editflight.getEditFlightCode(),
    dbadmin.getDbAdminCode(), snapshot.getSnapshotCode(),
    t4Report.getT4ReportCode(),
    // أزرار الأفعال: اسم الزر ولونه. يتقاسمها العارضان فتُجمَّع قبلهما.
    t4Button.getT4ButtonCode(),
    t4Text.getT4TextCode(), t4Store.getT4StoreCode(), t4Form.getT4FormCode(),
    t4Modal.getT4ModalCode(),
    t4Editor.getT4EditorCode(), t4View.getT4ViewCode(),
    // نموذج T4 بعد نموذج F كاملًا: يستدعي مساعديه (t4El و t4Esc و t4Assert
    // و t4Guard و t4LookupFlights و t4WriteClipboard) ولا يستدعيه أحد منها.
    wlText.getWlTextCode(), wlStore.getWlStoreCode(), wlForm.getWlFormCode(),
    wlEditor.getWlEditorCode(), wlView.getWlViewCode(),
    // تيوب LIVE FLT بعد نموذج T4: يستدعي wlTtd و wlPad2 منه، و t4El و t4Esc
    // و t4OnClick من نموذج F، و fqBindLongPress و afDestMatches من تعديل
    // الرحلة وإضافتها أعلاه. ولا يستدعيه أحد. وترتيبه نازل: قواعد ← قاعدة
    // ← نافذتان ← الترحيل إلى كايا ← عرض.
    jedText.getJedTextCode(), jedStore.getJedStoreCode(), jedModal.getJedModalCode(),
    jedTransfer.getJedTransferCode(),
    jedView.getJedViewCode(),
    statsAgg.getAggregatorCode(), statsRep.getReportCode(), stats.getStatsCode(),
    `window.__monV2Boot=${JSON.stringify(monitorBoot || {})};`,
    monitorV2Code.getMonitorV2Code(),
  ];
}

// خانات الصفحة الفارغة وما يملؤها، بترتيب الملء. القيمة دالة لا نصّ، فلا يُبنى
// جزءٌ قبل دوره.
const SLOT_FILLS = Object.freeze([
  { id: "addFlightSlot", fill: () => addflight.getAddFlightHtml() },
  { id: "addAirportSlot", fill: () => addAirport.getAddAirportHtml() },
  { id: "guideSlot", fill: () => guide.getGuideHtml() },
  { id: "profileSlot", fill: () => profile.getProfileHtml() },
  { id: "regSlot", fill: () => regmodel.getRegModelHtml() },
  { id: "statsSlot", fill: () => stats.getStatsHtml() },
  { id: "monSlot", fill: () => monitorV2Html.getMonitorV2Html() },
  { id: "dbSlot", fill: () => dbadmin.getDbAdminHtml() },
  { id: "t4Slot", fill: () => t4Html.getT4Html() },
  { id: "jedSlot", fill: () => jedHtml.getJedHtml() },
  { id: "hallSlot", fill: () => hall.getHallAddHtml() },
  { id: "toastMount", fill: () => toast.getToastHtml() },
  { id: "queueMount", fill: () => queueView.getQueueViewHtml() },
  { id: "editFlightMount", fill: () => editflight.getEditFlightHtml() },
]);

/** جسم الصفحة: قالب fq_html وقد مُلئت كل خانة بنصّ ميزتها. */
function _pageBodyHtml() {
  return SLOT_FILLS.reduce(
    (page, slot) => page.replace(`<div id="${slot.id}"></div>`, slot.fill()),
    html.getHtml());
}

/** الوثيقة كاملة: الرأس والأنماط، ثم الجسم، ثم شيفرة الرصد، ثم شيفرة الصفحة. */
function _pageDocument(rawHtml, allScripts) {
  return [
    '<!DOCTYPE html>', '<html lang="ar" dir="rtl">', '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">',
    `<title>${cfg.SYSTEM_NAME}</title>`,
    '<script>', localMonitorWeb.getLocalCaptureCode(localSession), '</script>',
    `<script src="${cfg.PDFJS_CDN}"></script>`,
    `<script src="${cfg.HTML2CANVAS_CDN}"></script>`,
    '<style>',
    `@import url("${cfg.FONTS_CSS}");`,
    styles.getStyles(), addflight.getAddFlightStyles(), addAirport.getAddAirportStyles(), guide.getGuideStyles(),
    profile.getProfileStyles(), regmodel.getRegModelStyles(), toast.getToastStyles(),
    queueView.getQueueViewStyles(),
    editflight.getEditFlightStyles(), dbadmin.getDbAdminStyles(), snapshot.getSnapshotStyles(),
    stats.getStatsStyles(),
    hall.getHallAddStyles(),
    t4Styles.getT4Styles(),
    jedStyles.getJedStyles(),
    icons.getIconsStyles(),
    monitorV2Styles.getMonitorV2Styles(),
    '</style>', '</head>', '<body>', rawHtml,
    '<script>', monitorCapture.getMonitorWebCaptureCode(), '</script>',
    '<script>', 'fqLocalObserveChanges();', _localOperationBindings(allScripts), allScripts, '</script>', '</body>', '</html>',
  ].join("\n");
}



let _localDrainPromise = null;
/** يمنع تداخل دفعات الجسر، ويتيح انتظار العمل القائم عند الإغلاق. */
function _persistLocalDiagnostics(webView) {
  if (_localDrainPromise) return _localDrainPromise;
  _localDrainPromise = _drainLocalDiagnostics(webView).then((result) => {
    _localDrainPromise = null;
    return result;
  }, (error) => {
    _localDrainPromise = null;
    throw error;
  });
  return _localDrainPromise;
}
/** قناة لها دفعتها وتأكيدها؛ النشاط المرفوض لا يحجز الأخطاء اللاحقة. */
async function _drainLocalChannel(webView, channel) {
  for (let index = 0; index < 8; index++) {
    const raw = await webView.evaluateJavaScript("JSON.stringify(fqLocalTakeBatch(" + JSON.stringify(channel) + "))");
    const batch = raw ? JSON.parse(raw) : null;
    if (!batch) return true;
    if (!(await _ingestPageBatch(webView, batch))) return false;
  }
  return true;
}
/** يحفظ دفعة واحدة ثم يؤكدها في الصفحة؛ المرفوضة تُعدّ فشل نقل. يرمي إن لم تؤكِّد الصفحة المحفوظة. */
async function _ingestPageBatch(webView, batch) {
  const result = localMonitor.ingest(batch);
  if (!result.ok) {
    await webView.evaluateJavaScript("FQ_LOCAL_COVERAGE.transportFailures++;fqLocalNotice();true;");
    return false;
  }
  const confirmed = await webView.evaluateJavaScript("fqLocalAcknowledge(" + JSON.stringify(result.batchId) + ")");
  if (confirmed !== true) throw new Error("تعذر تأكيد دفعة محفوظة في الصفحة");
  return true;
}
/** ينقل دفعات الصفحة دون إسقاطها قبل إثبات الكتابة. */
async function _drainLocalDiagnostics(webView) {
  try {
    localMonitor.flush(); localMonitor.cleanup();
    const errors = await _drainLocalChannel(webView, "error");
    const activity = await _drainLocalChannel(webView, "activity");
    const state = localMonitor.getStorageState();
    await webView.evaluateJavaScript("fqLocalStorageStatus(" + JSON.stringify(state) + ")");
    return errors && activity;
  } catch (error) {
    localMonitor.recordError(error, { action: "local_bridge" });
    return false;
  }
}

/** يربط الإجراءات المولدة القائمة؛ قائمة التغطية الفعلية تصدر مع التقرير. */
function _localOperationBindings(scripts) {
  const names = [];
  const pattern = /(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let match;
  while ((match = pattern.exec(scripts))) {
    const name = match[1];
    if (/^(?:get|mon2|fqLocal|_fqMon|fqUpdate)/.test(name)) continue;
    if (/^(?:save|delete|remove|clear|add|edit|submit|import|export|load|fetch|sync|refresh|check|showPanel|hideAllPanels|doSearch|auditLog|fqRequest|fqSendOrQueue|fqBulkDelete|fbFetch|jedGet|jedSave|t4Save|wlSave|regSave)/i.test(name) && names.indexOf(name) < 0) names.push(name);
  }
  return "\nfqLocalInstallOperations(" + JSON.stringify(names) + ");";
}

/** ملخص عربي يميز الحالة الحالية عن تاريخ الأخطاء، دون اختلاق السبب. */
function _localReportSummary(report) {
  const local = report.localDiagnostics;
  return {
    currentState: "حالة قناة الرصد الحالية مبنية على آخر قراءة ومؤشرات الترحيل، لا وجود خطأ تاريخي وحده",
    activityEvents: local.events.filter((event) => event.kind !== "error").length,
    errorEvents: local.events.filter((event) => event.kind === "error").length,
    writingPolicy: "سجل حدوث الكتابة والحقل وطول النص فقط؛ النص المكتوب غير محفوظ",
    retentionPolicy: "حذف السجلات المحلية الجديدة بعد ٤٨ ساعة من الحفظ عند تشغيل التنظيف",
    scope: "محلي خلال تجربة النسخة؛ لا إرسال للسجلات الجديدة إلى القاعدة",
    evidenceLimits: "ما ليس له قياس أو مصدر موثوق يذكر أنه غير متاح؛ السبب الجذري لا يستنتج من رسالة عامة",
  };
}

// ═══ نقطة الدخول — حراسة الوعد في المستوى الأعلى (نمط fq_widget.run) ═══
try {
  logger.setLocalErrorObserver((source, error) => localMonitor.recordError(error, { action: String(source || "logger") }));
  monitorCapture.setLocalErrorObserver((error, details) => localMonitor.recordError(error, details));
  await main();
} catch (error) {
  const message = (error && error.message) || String(error);
  logger.logError("main#top", error);
  const alert = new Alert();
  alert.title = "توقف النظام";
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
} finally {
  localMonitor.flush();
  Script.complete();
}
