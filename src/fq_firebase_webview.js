// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: code;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_firebase_webview.js

// ═══ كود فايربيس المحقون داخل WebView ═══
// المسؤولية الواحدة: توليد نص JS للاتصال بالقاعدة من داخل الواجهة (fetch).
const cfg = importModule("fq_config");

/**
 * يبني شيفرة الصفحة الخاصة بالقاعدة: الناقل fbFetchTimeout وتجديد الجلسة وفحص الاتصال والمزامنة.
 * @returns {string} نص JavaScript يعمل داخل الصفحة
 */
function getFirebaseCode() {
  const user = cfg.getCurrentUser();
  const firebaseUrlJson = JSON.stringify(cfg.FIREBASE_URL || "");
  const roleJson = JSON.stringify(user.role || "employee");
  const nameJson = JSON.stringify(user.name || "");
  const empIdJson = JSON.stringify(user.empId || "");
  const uuidJson = JSON.stringify(user.uuid || "");
  const uidJson = JSON.stringify(user.uid || "");
  const emailJson = JSON.stringify(user.email || "");
  const idTokenJson = JSON.stringify(user.token || "");
  return getFirebaseCodePart1({ firebaseUrlJson, roleJson, nameJson, empIdJson, uuidJson, uidJson, emailJson, idTokenJson }) +
    getFirebaseCodePart2() +
    getFirebaseCodePart3() +
    getFirebaseCodePart4() +
    getFirebaseCodePart5() +
    getFirebaseCodePart6() +
    getFirebaseCodePart7() +
    getFirebaseCodePart8() +
    getFirebaseCodePart9() +
    getFirebaseCodePart10() +
    getFirebaseCodePart11() +
    getFirebaseCodePart12() +
    getFirebaseCodePart13() +
    getFirebaseCodePart14() +
    getFirebaseCodePart15() +
    getFirebaseCodePart16() +
    getFirebaseCodePart17();
}

/** الجزء 1 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart1({ firebaseUrlJson, roleJson, nameJson, empIdJson, uuidJson, uidJson, emailJson, idTokenJson }) {
  return `
const FB_URL = ${firebaseUrlJson};
const FB_ROLE = ${roleJson};
const FB_USER = ${nameJson};
const FB_EMP_ID = ${empIdJson};
const FB_UUID = ${uuidJson};
const FB_UID = ${uidJson};
const FB_EMAIL = ${emailJson};
let FB_AUTH_TOKEN = ${idTokenJson};
const FB_HEALTH_PATH = "/flights_meta.json?shallow=true&timeout=5s";
let fbDot = document.getElementById("fbDot");
`;
}

/** الجزء 2 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart2() {
  return `
// ═══ مدير اللوحات المركزي — يحل تداخل التبويبات ═══
function _fbStopRegSync() {
  // إيقاف مؤقت تسجيل النوبة
  if (typeof _regSyncTimer !== "undefined" && _regSyncTimer) {
    clearInterval(_regSyncTimer);
    _regSyncTimer = null;
  }
}
function _fbById(ids, act) {
  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i]);
    if (el) act(el);
  }
}
function hideAllPanels() {
  _fbStopRegSync();
  _fbById([
    "pdfPanel","livePanel","alPanel","guidePanel","t4Panel","jedPanel",
    "notifPanel","profilePanel","regPanel","dbPanel","statsPanel","monPanel"
  ], function(p) { p.style.display = "none"; });
  _fbById([
    "pdfTab","liveTab","alTab","guideTab","t4Tab","jedTab",
    "notifTab","profileTab","regTab","dbTab","statsTab","monTab"
  ], function(t) { t.classList.remove("tab-active"); });
  // إغلاق نافذة مشاركة النموذج إن كانت مفتوحة
  const shareOv = document.getElementById("regShareOverlay");
  if (shareOv && shareOv.parentNode) shareOv.parentNode.removeChild(shareOv);
}
function showPanel(panelId, tabId) {
  hideAllPanels();
  const p = document.getElementById(panelId);
  if (p) p.style.display = "block";
  const t = document.getElementById(tabId);
  if (t) t.classList.add("tab-active");
}
let fbLabel = document.getElementById("fbLabel");
let fbConnected = false;
let fbLastUpdate = "";
`;
}

/** الجزء 3 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart3() {
  return `
// ═══ قاطع دائرة خفيف لفحص الاتصال (نسخة fetch مكافئة لـ circuit-breaker-SKILL.md) ═══
// الصنف الموثَّق رسمياً في المشروع مبني على Request+Timer (سياق سكربتابل الأصلي)،
// وهما غير متاحين هنا داخل WebView — هذه نسخة مكافئة بـfetch+AbortController بنفس
// المفهوم: انقطاع عابر واحد (متوقع داخل مبنى المطار) لا يقلب الشارة حمراء فوراً؛
// يلزم فشلان متتاليان بالفحص التلقائي الدوري قبل إعلان الانقطاع.
const CB_FAILURE_THRESHOLD = 2;
let _cbFailureCount = 0;

// ═══ طلب فحص خام واحد لقاعدة فايربيز (بلا تحديث واجهة) ═══
// كل التهيئة داخل try: إنشاء AbortController أو setTimeout قد يرمي في بعض
// بيئات WebView، وخروجه غير الملتقط كان يُخفق الفحص كاملاً فيعلق الدوّار
// ويُبقي fbConnected خطأً أبداً. آخر خطأ يُحفظ في window للتشخيص من الواجهة.
async function _pingFirebase() {
  try {
    // لا نفحص جذر القاعدة؛ قواعد الإنتاج تمنع قراءته عمدًا.
    // flights_meta مسار مسموح لكل مستخدم موثّق، لذلك يعكس الاتصال الحقيقي.
    await fbFetchTimeout(FB_URL + FB_HEALTH_PATH, null, 6000);
    window._FQ_LAST_PING_ERR = "";
    return true;
  } catch(e) {
    const msg = (e && e.message) ? e.message : String(e);
    window._FQ_LAST_PING_ERR = msg;
    // ═══ الإصلاح: AbortError متوقّع عند إغلاق النافذة أو انتهاء المهلة —
    // كان يظهر للمستخدم كخطأ "Fetch is aborted" مربك بلا سبب حقيقي.
    // لا يُرفع للمستخدم؛ يبقى فقط في window._FQ_LAST_PING_ERR للتشخيص. ═══
    const isAbort = (e && (e.name === "AbortError" || e.code === "TIMEOUT")) ||
                  msg.indexOf("abort") !== -1 ||
                  msg.indexOf("Abort") !== -1;
    if (!isAbort) console.error("[fq_firebase] ping: " + msg);
    return false;
  }
}

// ═══ تحديث شارة الاتصال المرئية ═══
function _setConnectionUi(ok) {
  if (!fbDot) return;
  fbDot.style.background = ok ? "#16a34a" : "#E50914";
  fbDot.style.boxShadow = ok ? "0 0 8px #16a34a" : "0 0 8px #E50914";
  if (fbLabel) fbLabel.textContent = ok ? "متصل" : "غير متصل";
  fbConnected = ok;
}
`;
}

/** الجزء 4 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart4() {
  return `
// ═══ الفحص التلقائي الدوري — مخفَّف بقاطع الدائرة ═══
async function checkFirebase() {
  if (!fbDot) return;
  const ok = await _pingFirebase();
  if (ok) {
    _cbFailureCount = 0;
    _setConnectionUi(true);
  } else {
    _cbFailureCount++;
    _setConnectionUi(_cbFailureCount < CB_FAILURE_THRESHOLD);
  }
}

// ═══ الفحص اليدوي الفوري (ضغطة المستخدم) — نتيجة صادقة مباشرة بلا تخفيف ═══
async function checkFirebaseNow() {
  if (!fbDot) return false;
  const ok = await _pingFirebase();
  _cbFailureCount = ok ? 0 : CB_FAILURE_THRESHOLD;
  _setConnectionUi(ok);
  return ok;
}

function _fbPingToast(ok) {
  if (typeof hideLoadingToast === "function") hideLoadingToast();
  if (typeof showToast !== "function") return;
  if (ok) return showToast("الاتصال ناجح — القاعدة متصلة", "success");
  showToast("فشل الاتصال بالقاعدة — " + (window._FQ_LAST_PING_ERR || "سبب غير معروف"), "error", 4000);
}

if (fbDot) {
  fbDot.style.cursor = "pointer";
  fbDot.addEventListener("click", async function(){
    if (typeof showToast === "function")
      showToast("جارٍ اختبار الاتصال...", "loading");
    let ok = false;
    try {
      ok = await checkFirebaseNow();
    } catch(e) {
      window._FQ_LAST_PING_ERR = (e && e.message) ? e.message : String(e);
    }
    // إخفاء الدوّار في كل الأحوال — نجاحاً أو فشلاً أو استثناءً
    _fbPingToast(ok);
  });
}
`;
}

/** الجزء 5 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart5() {
  return `
let _fbSyncLock = false;
// قراءة عقد الرحلات كلها معًا؛ تعذّرُ واحدةٍ يُسقط المزامنة ولا يُكمل بقائمة ناقصة صالةً
// (كل صالة في عقدتها: أمر المالك ٢٠٢٦-٠٩-٢٨). وتُرجع null عند تعذّر أيّ عقدة.
async function _fbReadNodes() {
  const nodeResps = await Promise.all(fqFlightNodes().map(function(n) {
    return fbFetchTimeout(FB_URL + "/" + n + ".json", null, 15000);
  }));
  const remote = {};
  for (let ni = 0; ni < nodeResps.length; ni++) {
    if (!nodeResps[ni].ok) return null;
    const part = await nodeResps[ni].json();
    if (part) Object.assign(remote, part);
  }
  return remote;
}

// يقبل طابع التحديث الجديد ويحفظ السابق لإعادته إن تعذّرت القراءة.
let _fbPrevUpdate = "";
function _fbTakeMeta(meta) {
  if (!meta || !meta.lastUpdateAt || meta.lastUpdateAt === fbLastUpdate) return false;
  _fbPrevUpdate = fbLastUpdate;
  fbLastUpdate = meta.lastUpdateAt;
  return true;
}

// الطابع يعود كما كان، وإلا عُدّ هذا التحديث مقروءًا فتخطّته المزامنة التالية.
function _fbSyncRollback() {
  fbLastUpdate = _fbPrevUpdate;
  return false;
}

function _fbSyncError(e) {
  console.error("[fq_firebase] sync: " + e.message);
  return false;
}
`;
}

/** الجزء 6 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart6() {
  return `
async function fbSyncData() {
  if (_fbSyncLock || !fbConnected) return false;
  _fbSyncLock = true;
  try {
    const meta = await (await fbFetchTimeout(FB_URL + "/flights_meta.json", null, 12000)).json();
    if (!_fbTakeMeta(meta)) return true;
    const remote = await _fbReadNodes();
    return remote ? (_fbMerge(remote), true) : _fbSyncRollback();
  } catch(e) {
    return _fbSyncError(e);
  } finally {
    _fbSyncLock = false;
  }
}

// ═══ الفهرس يحمل العنوانين: المحسوب والمخزَّن ═══
// كان يحمل المحسوب وحده (fqFlightKey)، والمقارنة تجري ضدّ مفتاح القاعدة المخزَّن.
// فمتى اختلفا حكمت الدالة بأن الرحلة جديدة وأضافتها وهي موجودة أصلًا — فتتضاعف القائمة.
// ويختلفان في حالتين واقعتين:
//   ١) سجل مخزَّن بصيغة مفتاح قديمة (<التاريخ>_<الرقم>_<الوقت>).
//   ٢) رحلة عُدِّل وقتها أو رقمها: updateFlight يُبقي المفتاح ويغيّر المحتوى،
//      فيتغيّر المحسوب ويثبت المخزَّن.
// قيس في ٢٠٢٦-٠٩-٢٥: ١٤٤ من ١٤٥ سجلًّا بصيغة قديمة، فأضافت المزامنة ١٤٤ نسخة،
// فصارت القائمة ٢٨٩ لـ١٤٤ رحلة. والتفصيل في رحلات_صالات_جدة/وثائق/تسليم-الحج.md.
// ورحلة صالة تغيّر موعدها على جهاز زميل (زرّ التحديث) يتغيّر مفتاحها، فبلا
// موضعها (slot) تُضاف سطرًا ثانيًا هنا ثم يعيد حفظُ الإغلاق كتابة القديم.
function _fbIndexData() {
  const maps = { local: {}, slot: {} };
  for (let i = 0; i < DATA.length; i++) {
    const d = DATA[i];
    maps.local[fqFlightKey(d)] = i;
    if (d._fbKey) maps.local[d._fbKey] = i;
    const sl = fqFlightSlot(d);
    if (sl) maps.slot[sl] = i;
  }
  return maps;
}

function _fbFindHit(maps, fk, rf) {
  const rSlot = fqFlightSlot(rf);
  const own = Object.prototype.hasOwnProperty;
  if (own.call(maps.local, fk)) return maps.local[fk];
  return rSlot && own.call(maps.slot, rSlot) ? maps.slot[rSlot] : -1;
}
`;
}

/** الجزء 7 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart7() {
  return `
function _fbCopyFields(row, rf) {
  row.al = rf.al || row.al;
  row.to = rf.to || row.to;
  row.std = rf.std || row.std;
  row.type = rf.type || row.type;
  row.dpax = rf.dpax || row.dpax;
}

function _fbUpdateLocal(row, rf, fk) {
  _fbCopyFields(row, rf);
  row._fbKey = fk;
  row._src = rf.src || "fb";
  if (rf.depTime) row.depTime = new Date(rf.depTime);
  // القاعدة هي الحَكَم في حالة المطار: تُحمل إن وُجدت، وتزول إن زالت.
  // وحالةٌ وضعها الموظف يدويًّا لا تُمسّ (SITE_STATUSES وحدها).
  if (SITE_STATUSES.indexOf(rf.status) !== -1) row._status = rf.status;
  else if (SITE_STATUSES.indexOf(row._status) !== -1) delete row._status;
}

function _fbNewRow(rf, fk) {
  const row = { _fbKey: fk };
  ["al", "flt", "to", "std", "type", "dpax", "date"].forEach(function(k) { row[k] = rf[k] || ""; });
  row.depTime = rf.depTime ? new Date(rf.depTime) : null;
  // بلا terminal كانت رحلة صالة يضيفها زميل تصل إلى هذا الجهاز فتسقط في تيوب جداول
  row.terminal = rf.terminal || "";
  row._status = SITE_STATUSES.indexOf(rf.status) !== -1 ? rf.status : "";
  row._src = rf.src || "fb";
  row.updatedBy = rf.updatedBy || "";
  return row;
}

function _fbApplyOne(out, fk, rf) {
  if (!rf || !rf.flt) return;
  const hit = _fbFindHit(out.maps, fk, rf);
  if (hit >= 0) {
    _fbUpdateLocal(DATA[hit], rf, fk);
    out.updated++;
    return;
  }
  if (!out.groups[rf.date]) out.groups[rf.date] = [];
  out.groups[rf.date].push(_fbNewRow(rf, fk));
  out.added++;
}
`;
}

/** الجزء 8 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart8() {
  return `
function _fbApplyRemote(remote, maps) {
  const out = { added: 0, updated: 0, groups: {}, maps: maps };
  const fbKeys = Object.keys(remote);
  for (let j = 0; j < fbKeys.length; j++) _fbApplyOne(out, fbKeys[j], remote[fbKeys[j]]);
  return out;
}

// ═══ رحلات الصالات تدخل DATA بلا fileId ولا تُحسب في قائمة الملفات ═══
function _fbPlaceHalls(groups) {
  for (const dt2 in groups) {
    const keepSch = [];
    for (let hi = 0; hi < groups[dt2].length; hi++) {
      const hf = groups[dt2][hi];
      if (fqIsSchedule(hf)) { keepSch.push(hf); continue; }
      hf.fileId = null;
      DATA.push(hf);
    }
    groups[dt2] = keepSch;
  }
}

function _fbFileIdFor(dt, count) {
  let existFid = -1;
  for (let fi = 0; fi < FILES.length; fi++) {
    if (FILES[fi].date === dt) { existFid = FILES[fi].id; break; }
  }
  if (existFid < 0) {
    fileIdCounter++;
    existFid = fileIdCounter;
    FILES.push({
      id: existFid, name: "قاعدة البيانات — " + dt,
      date: dt, count: count, _src: "fb"
    });
  }
  return existFid;
}
`;
}

/** الجزء 9 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart9() {
  return `
function _fbPlaceSchedules(groups) {
  for (const dt in groups) {
    if (groups[dt].length === 0) continue;
    const fid = _fbFileIdFor(dt, groups[dt].length);
    for (let gi = 0; gi < groups[dt].length; gi++) {
      groups[dt][gi].fileId = fid;
      DATA.push(groups[dt][gi]);
    }
  }
}

function _fbAnnounceSync(out) {
  if (out.added <= 0 && out.updated <= 0) return;
  if (typeof renderFileList === "function") renderFileList();
  if (typeof refreshUI === "function") refreshUI();
  if (typeof showToast === "function")
    showToast("تحديث: " + out.added + " جديدة، " + out.updated + " محدّثة", "success");
}

function _fbMerge(remote) {
  if (Object.keys(remote).length === 0) return;
  const out = _fbApplyRemote(remote, _fbIndexData());
  _fbPlaceHalls(out.groups);
  _fbPlaceSchedules(out.groups);
  _fbAnnounceSync(out);
}

let fbRefreshBtn = document.getElementById("fbRefreshBtn");
if (fbRefreshBtn) {
  fbRefreshBtn.addEventListener("click", async function(){
    if (typeof showToast === "function")
      showToast("جارٍ التحديث من القاعدة...", "loading");
    fbRefreshBtn.disabled = true;
    fbLastUpdate = "";
    const refreshed = await fbSyncData();
    fbRefreshBtn.disabled = false;
    if (typeof hideLoadingToast === "function") hideLoadingToast();
    if (typeof showToast === "function") {
      if (refreshed) showToast("تم التحديث", "success");
      else showToast("تعذر التحديث من القاعدة", "error");
    }
  });
}
`;
}

/** الجزء 10 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart10() {
  return `
let notifTab = document.getElementById("notifTab");
let notifPanel = document.getElementById("notifPanel");
let notifList = document.getElementById("notifList");
let notifCount = document.getElementById("notifCount");

if (notifTab) {
  notifTab.addEventListener("click", function(){
    if (typeof hideAllPanels === "function") hideAllPanels();
    notifTab.classList.add("tab-active");
    notifPanel.style.display = "block";
    loadNotifications();
  });
}

let notifRefreshBtn = document.getElementById("notifRefreshBtn");
if (notifRefreshBtn) {
  notifRefreshBtn.addEventListener("click", function(){ loadNotifications(); });
}

// أيقونة كل نوع إشعار ولونها؛ ما عداها يأخذ clipboard الأصفر.
const FQ_NTF_STYLES = {
  schedule_added: ["fileText", "#16a34a"], flight_added: ["plane", "#2563eb"],
  flight_edited: ["edit", "#ff9800"], data_updated: ["refresh", "#ca8a04"],
  data_deleted: ["trash", "#E50914"], alert_4h: ["alertTriangle", "#ca8a04"],
  alert_2h: ["alertTriangle", "#E50914"], guide_updated: ["bookOpen", "#9b59b6"],
  user_started: ["user", "#7c4dff"], reg_submit: ["clipboardList", "#E50914"],
  profile_updated: ["user", "#00bcd4"]
};

function _fbNtfStyle(type) {
  const known = Object.prototype.hasOwnProperty.call(FQ_NTF_STYLES, type);
  const st = known ? FQ_NTF_STYLES[type] : ["clipboard", "#ca8a04"];
  return { icon: st[0], color: st[1] };
}

function _fbNtfTime(n) {
  if (!n.time) return "";
  const td = new Date(n.time);
  return td.toLocaleDateString("ar-SA") + " " +
    td.toLocaleTimeString("ar-SA", {hour:"2-digit",minute:"2-digit",hour12:false});
}
`;
}

/** الجزء 11 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart11() {
  return `
function _fbNtfUser(n) {
  if (!n.user) return "";
  return '<div class="ntf-user">'+buildIcon("user",12)+' '+fqEsc(n.user)+(n.role?' <span class="ntf-user-role">('+fqEsc(n.role)+')</span>':'')+'</div>';
}

function _fbNtfDetails(n) {
  return n.details ? '<div class="ntf-details">'+fqEsc(n.details)+'</div>' : "";
}

function _fbNtfRow(iconName, val, bold) {
  if (!val) return "";
  return '<div class="ntf-flight-row">'+buildIcon(iconName,12)+' '+(bold ? '<b>'+fqEsc(val)+'</b>' : fqEsc(val))+'</div>';
}

function _fbNtfFlight(fi) {
  if (!fi) return "";
  return '<div class="ntf-flight">' + _fbNtfRow("plane", fi.flt, true) + _fbNtfRow("folder", fi.dest) +
    _fbNtfRow("clock", fi.std) + _fbNtfRow("calendar", fi.date) + '</div>';
}

function _fbNtfCard(n) {
  const st = _fbNtfStyle(n.type);
  const typeIcon = buildIcon(st.icon, 16);
  const timeStr = _fbNtfTime(n);
  return '<div class="ntf-card" style="border-right:3px solid '+st.color+'">' +
    '<div class="ntf-hdr">' +
    '<span class="ntf-title" style="color:'+st.color+'">'+typeIcon+" "+fqEsc(n.title || "إشعار")+'</span>' +
    '<span class="ntf-time">'+timeStr+'</span>' +
    '</div>' + _fbNtfUser(n) + _fbNtfDetails(n) + _fbNtfFlight(n.flightInfo) + '</div>';
}

function _fbNtfSay(cls, text) {
  notifList.innerHTML = '<div class="' + cls + '">' + text + '</div>';
}
`;
}

/** الجزء 12 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart12() {
  return `
function _fbNtfRender(data) {
  if (!data) {
    _fbNtfSay("ntf-loading", "لا توجد إشعارات");
    if (notifCount) notifCount.textContent = "0";
    return;
  }
  const keys = Object.keys(data).sort(function(a,b){
    return (data[b].time || "").localeCompare(data[a].time || "");
  }).slice(0, 50);
  if (notifCount) notifCount.textContent = keys.length;
  let h = "";
  for (let i = 0; i < keys.length; i++) h += _fbNtfCard(data[keys[i]]);
  notifList.innerHTML = h;
}

async function loadNotifications() {
  if (!notifList) return;
  _fbNtfSay("ntf-loading", "جارٍ التحميل...");
  try {
    const resp = await fbFetchTimeout(FB_URL + "/notifications.json", null, 12000);
    if (!resp.ok) return _fbNtfSay("ntf-error", "تعذر التحميل");
    _fbNtfRender(await resp.json());
  } catch(e) {
    _fbNtfSay("ntf-error", "خطأ: " + e.message);
  }
}

// ═══ بوابة الشبكة الوحيدة داخل WebView: مهلة + فحص HTTP ═══
function _fbNetworkError(message, code, status) {
  const err = new Error(message);
  err.code = code || "NETWORK_ERROR";
  if (typeof status === "number") err.status = status;
  return err;
}

function _fbAuthenticatedUrl(url) {
  if (String(url).indexOf(FB_URL) !== 0) return url;
  if (!FB_AUTH_TOKEN) {
    throw _fbNetworkError("جلسة الدخول غير متوفرة", "AUTH_REQUIRED", 401);
  }
  if (/[?&]auth=/.test(url)) return url;
  return url + (url.indexOf("?") === -1 ? "?" : "&") +
    "auth=" + encodeURIComponent(FB_AUTH_TOKEN);
}
`;
}

/** الجزء 13 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart13() {
  return `
// يستدعيه سكربت Scriptable الأم بعد تجديد Firebase ID token من Keychain.
// رمز التجديد لا يدخل WebView مطلقًا؛ يبقى في الخزنة المشفّرة.
function fqUpdateFirebaseToken(token) {
  if (typeof token !== "string" || token.length === 0) return false;
  FB_AUTH_TOKEN = token;
  window._FQ_AUTH_EXPIRED = false;
  _cbFailureCount = 0;
  _fbFinishRenew(true);
  checkFirebase();
  return true;
}
window.fqUpdateFirebaseToken = fqUpdateFirebaseToken;

// ═══ تجديد الجلسة من داخل الصفحة عند أول رفض ═══
// رمز الدخول يعيش ساعة («Firebase ID tokens are short lived and last for an
// hour» — وثائق Firebase). ومؤقّت التجديد في fq_main لا يعمل والتطبيق في
// الخلفية — وهذا من تجربة مجتمع Scriptable، فوثائقه لا تذكر الخلفية أصلًا.
// فعند العودة يصل أول طلب برمز منتهٍ فيُرفض ٤٠١ بنصّ «Permission denied»
// نفسه الذي يُرفض به الممنوع حقًّا (مُجرَّب على القاعدة).
// فتطلب الصفحة رمزًا جديدًا بعنوان وهمي يعترضه shouldAllowRequest في
// fq_main — الجسر نفسه الذي يفتح واتساب — فيجدّد السكربت الرمز من Keychain
// ويحقنه بـ fqUpdateFirebaseToken. ورمز التجديد لا يدخل الصفحة أبدًا.
const FB_RENEW_BRIDGE = "https://fq-bridge.invalid/auth-renew";
const FB_RENEW_WAIT_MS = 15000;
// رمزٌ جُدِّد قبل أقلّ من خمس دقائق ليس منتهيًا، فالرفض بعده رفضُ صلاحية
// حقيقي ولا يُجدَّد له ثانيةً — وإلا صار كل رفض مقصود طلبَ تجديد.
const FB_RENEW_FRESH_MS = 5 * 60 * 1000;
let _fbRenewPending = null;
let _fbRenewResolve = null;
let _fbRenewedAt = 0;

function _fbFinishRenew(ok) {
  const resolve = _fbRenewResolve;
  _fbRenewResolve = null;
  _fbRenewPending = null;
  if (ok) _fbRenewedAt = Date.now();
  if (resolve) resolve(ok);
}
`;
}

/** الجزء 14 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart14() {
  return `
// طلبٌ واحد مهما تزامن الرفض: كل من يُرفض أثناء الانتظار ينتظر الوعد نفسه.
// ويُحسم بـ true عند وصول الرمز، وبـ false بعد المهلة — لا يبقى معلَّقًا.
function fqRenewAuthToken() {
  if (_fbRenewPending) return _fbRenewPending;
  _fbRenewPending = new Promise(function(resolve) {
    _fbRenewResolve = resolve;
    setTimeout(function() {
      if (_fbRenewResolve === resolve) _fbFinishRenew(false);
    }, FB_RENEW_WAIT_MS);
  });
  window.location.href = FB_RENEW_BRIDGE + "?t=" + Date.now();
  return _fbRenewPending;
}

function _fbIsAuthRejection(e) {
  if (!e) return false;
  return e.code === "AUTH_EXPIRED" || e.code === "PERMISSION_DENIED" || e.code === "AUTH_REQUIRED";
}

function _fbTokenIsFresh() {
  return _fbRenewedAt > 0 && (Date.now() - _fbRenewedAt) < FB_RENEW_FRESH_MS;
}

// الناقل كما يراه كل مستدعٍ: عند الرفض يجدّد الرمز مرّة ويعيد الطلب مرّة.
// والرفض بعد رمزٍ جديد يُرمى كما هو، فرسالته صادقة: صلاحية لا جلسة.
// والرمز الذي أُرسل به الطلب يُحفظ قبل الإرسال: ردٌّ متأخّر لطلبٍ خرج بالرمز
// القديم قد يصل بعد أن تجدّد الرمز، فرفضه رفضُ رمزٍ قديم يُعاد فورًا بالجديد
// بلا طلب تجديد ثانٍ — لا رفضُ صلاحية لمجرّد أن الرمز الحاليّ جديد.
async function fbFetchTimeout(url, opts, ms) {
  const sentToken = FB_AUTH_TOKEN;
  try {
    return await _fbFetchOnce(url, opts, ms);
  } catch (e) {
    if (!_fbIsAuthRejection(e) || String(url).indexOf(FB_URL) !== 0) throw e;
    if (FB_AUTH_TOKEN && FB_AUTH_TOKEN !== sentToken) return await _fbFetchOnce(url, opts, ms);
    if (_fbTokenIsFresh()) throw e;
    const renewed = await fqRenewAuthToken();
    if (!renewed) {
      throw _fbNetworkError("تعذّر تجديد جلسة الدخول — أعد المحاولة بعد لحظة", "AUTH_EXPIRED", e.status);
    }
    return await _fbFetchOnce(url, opts, ms);
  }
}
`;
}

/** الجزء 15 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart15() {
  return `
function _fbCopyOptions(source) {
  const options = {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) options[key] = source[key];
  }
  return options;
}

// مهلة الطلب: AbortController حيث يوجد، وإلا سباق وعد. تُرجع المؤقّت والوعد.
function _fbTimeoutGuard(options, wait) {
  const guard = { tmr: null, timeoutPromise: null };
  if (!options.signal && typeof AbortController === "function") {
    const ctrl = new AbortController();
    options.signal = ctrl.signal;
    guard.tmr = setTimeout(function(){ ctrl.abort(); }, wait);
  } else if (!options.signal) {
    guard.timeoutPromise = new Promise(function(resolve, reject){
      guard.tmr = setTimeout(function(){
        reject(_fbNetworkError("انتهت مهلة الاتصال", "TIMEOUT"));
      }, wait);
    });
  }
  return guard;
}

function _fbWaitMs(ms) {
  return (typeof ms === "number" && ms > 0) ? ms : 12000;
}

function _fbStatusOf(resp) {
  return resp && typeof resp.status === "number" ? resp.status : 0;
}

function _fbStatusError(status, errorBody) {
  if (status !== 401 && status !== 403) return _fbNetworkError("HTTP " + status, "HTTP_ERROR", status);
  if (/permission\\s+denied/i.test(errorBody)) {
    return _fbNetworkError("الحساب لا يملك صلاحية قراءة هذا المسار", "PERMISSION_DENIED", status);
  }
  window._FQ_AUTH_EXPIRED = true;
  return _fbNetworkError("تعذّر اعتماد جلسة الدخول", "AUTH_EXPIRED", status);
}

async function _fbErrorBody(resp) {
  try { return await resp.text(); }
  catch(readError) { return ""; }
}
`;
}

/** الجزء 16 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart16() {
  return `
// الإلغاء بمهلتنا يصير خطأ «انتهت مهلة الاتصال»، وغيره يمرّ كما هو.
function _fbAbortAsTimeout(e) {
  return e && e.name === "AbortError" ? _fbNetworkError("انتهت مهلة الاتصال", "TIMEOUT") : e;
}

async function _fbFetchOnce(url, opts, ms) {
  const options = _fbCopyOptions(opts || {});
  const guard = _fbTimeoutGuard(options, _fbWaitMs(ms));
  try {
    const requestPromise = fetch(_fbAuthenticatedUrl(url), options);
    const resp = guard.timeoutPromise
      ? await Promise.race([requestPromise, guard.timeoutPromise])
      : await requestPromise;
    if (resp && resp.ok) return resp;
    throw _fbStatusError(_fbStatusOf(resp), (resp && typeof resp.text === "function") ? await _fbErrorBody(resp) : "");
  } catch(e) {
    throw _fbAbortAsTimeout(e);
  } finally {
    if (guard.tmr) clearTimeout(guard.tmr);
  }
}

// note = {type, title, details, flightInfo?} — كائن واحد بدل أربعة مدخلات (حدّ المدخلات ثلاثة)
async function fbPushNotif(note) {
  if (!fbConnected) return;
  const key = Date.now().toString(36) + Math.random().toString(36).substr(2,4);
  const entry = {
    type: note.type, title: note.title, details: note.details,
    user: FB_USER, role: FB_ROLE, empId: FB_EMP_ID, userUid: FB_UID,
    time: new Date().toISOString()
  };
  if (note.flightInfo) entry.flightInfo = note.flightInfo;
  const res = await fqRequest({
    path: "/notifications/" + key + ".json", method: "PUT", body: entry
  });
  if (!res.ok) console.error("fbPushNotif: " + res.error);
}

// ═══ fbSafeWrite انتقلت إلى fq_net_request ═══
// كانت هنا، وصارت غلافًا رقيقًا فوق fqRequest في وحدة fq_net_request.
// لم تُترك نسخة: تعريفان بالاسم نفسه في نطاق الصفحة الواحد يغلب أحدهما
// الآخر بصمت بحسب ترتيب التجميع، وهو أسوأ من الخطأ الظاهر.
// وهذا الملف يبقى مالك الناقل الخام fbFetchTimeout وحده.

// ═══ نافذة تأكيد بديلة عن confirm ═══
// ملاحظة: تم إزالة دالة fqConfirm من هنا لأنها موجودة في fq_toast.js
`;
}

/** الجزء 17 من 17 من نصّ `getFirebaseCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFirebaseCodePart17() {
  return `
// ═══ نافذة إدخال بديلة عن prompt ═══
// ملاحظة: تم إزالة دالة fqPrompt من هنا لأنها موجودة في fq_toast.js

// ═══ قفل المزامنة لمنع التداخل ═══
// تم إزالة التعريف المكرر لـ _fbSyncLock
// ═══ تبويب الجداول الرئيسي ═══
let pdfTab = document.getElementById("pdfTab");
if (pdfTab) {
  pdfTab.addEventListener("click", function(){
    hideAllPanels();
    pdfTab.classList.add("tab-active");
    const pdfPanel = document.getElementById("pdfPanel");
    if (pdfPanel) pdfPanel.style.display = "block";
  });
}

checkFirebase();
setInterval(checkFirebase, ${cfg.FIREBASE_PING_MS});
setInterval(fbSyncData, ${cfg.FIREBASE_PING_MS});
`;
}

module.exports = Object.freeze({ getFirebaseCode });
