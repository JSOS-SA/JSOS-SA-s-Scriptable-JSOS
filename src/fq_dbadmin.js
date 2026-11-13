// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: server;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_dbadmin.js

// ═══ تبويب إدارة قاعدة البيانات ═══
// يظهر للجميع — التحكم للمشرف والمطوّر فقط

/**
 * يُرجع HTML لوحة إدارة قاعدة البيانات.
 * @returns {string}
 */
function getDbAdminHtml() {
  return `
<div id="dbPanel" style="display:none">
  <div class="app">
    <div class="hd"><p>قاعدة البيانات — عرض وإدارة</p></div>

    <!-- أقسام القاعدة -->
    <div class="db-tabs">
      <button class="db-tab db-tab-active" data-dbs="flights">الرحلات</button>
      <button class="db-tab" data-dbs="reg">التسجيلات</button>
      <button class="db-tab" data-dbs="notif">الإشعارات</button>
      <button class="db-tab" data-dbs="users">الموظفون</button>
    </div>

    <!-- شريط الأدوات -->
    <div class="db-bar">
      <button class="db-btn db-btn-refresh" id="dbRefresh">⟳ تحديث</button>
      <button class="db-btn db-btn-danger" id="dbClearAll" style="display:none">
        مسح القسم بالكامل
      </button>
      <span class="db-count" id="dbCount">0 سجل</span>
    </div>

    <!-- حقل بحث -->
    <div class="sbox on">
      <input type="text" id="dbSearch" placeholder="ابحث في البيانات..." autocomplete="off">
    </div>

    <!-- حاوية البيانات -->
    <div id="dbList" class="db-list"></div>
  </div>
</div>
`;
}

/**
 * يُرجع CSS لوحة إدارة قاعدة البيانات.
 * @returns {string}
 */
function getDbAdminStyles() {
  return getDbAdminStylesPart1() +
    getDbAdminStylesPart2();
}

/** الجزء 1 من 2 من نصّ `getDbAdminStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminStylesPart1() {
  return `
/* ═══ إدارة القاعدة ═══ */
.db-tabs{
  display:flex;gap:6px;overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  margin-bottom:10px;padding-bottom:4px;
}
.db-tab{
  padding:8px 14px;background:#fff;color:#666666;
  border:1px solid rgba(0,0,0,0.05);
  border-radius:10px;font-family:Tajawal,sans-serif;
  font-size:13px;font-weight:600;cursor:pointer;
  white-space:nowrap;flex-shrink:0;
}
.db-tab-active{background:#E50914;color:#fff;border-color:#E50914}
.db-bar{
  display:flex;align-items:center;gap:8px;
  margin-bottom:10px;flex-wrap:wrap;
}
.db-btn{
  padding:8px 12px;border:none;border-radius:8px;
  font-family:Tajawal,sans-serif;font-size:12px;font-weight:600;
  cursor:pointer;
}
.db-btn-refresh{background:#fafafa;color:#1a1a1a}
.db-btn-danger{background:#fee2e2;color:#dc2626;border:1px solid #E50914}
.db-count{
  margin-right:auto;color:#666666;font-size:12px;
  font-family:'IBM Plex Mono',monospace;
}
.db-list{margin-top:8px}
.db-item{
  background:#fff;border-radius:10px;padding:12px;
  margin-bottom:8px;border-right:3px solid #2563eb;
}
.db-item-hdr{
  display:flex;justify-content:space-between;
  align-items:center;gap:8px;margin-bottom:6px;
  direction:rtl;
}
.db-item-title{font-size:14px;font-weight:700;color:#1a1a1a}
.db-item-key{
  font-family:'IBM Plex Mono',monospace;
  font-size:10px;color:#777;
}`;
}

/** الجزء 2 من 2 من نصّ `getDbAdminStyles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminStylesPart2() {
  return `
.db-item-meta{
  font-size:11px;color:#666666;direction:rtl;
  margin-bottom:6px;
}
.db-item-body{
  background:#fafafa;padding:8px 10px;
  border-radius:6px;font-size:12px;color:#ccc;
  font-family:'IBM Plex Mono',monospace;
  word-break:break-all;direction:ltr;text-align:left;
  max-height:120px;overflow-y:auto;
}
.db-item-actions{
  display:flex;gap:6px;margin-top:8px;
}
.db-act{
  padding:6px 10px;border:none;border-radius:6px;
  font-family:Tajawal,sans-serif;font-size:11px;font-weight:600;
  cursor:pointer;
}
.db-act-edit{background:#dbeafe;color:#2563eb}
.db-act-del{background:#fee2e2;color:#dc2626}
.db-empty{
  text-align:center;padding:40px 20px;
  color:#777;font-size:13px;
}
`;
}

/**
 * يُرجع JavaScript لوحة إدارة قاعدة البيانات.
 * @returns {string}
 */
function getDbAdminCode() {
  return getDbAdminCodePart1() +
    getDbAdminCodePart2() +
    getDbAdminCodePart3() +
    getDbAdminCodePart4() +
    getDbAdminCodePart5() +
    getDbAdminCodePart6() +
    getDbAdminCodePart7() +
    getDbAdminCodePart8() +
    getDbAdminCodePart9() +
    getDbAdminCodePart10() +
    getDbAdminCodePart11();
}

/** الجزء 1 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart1() {
  return `
// ═══ تبويب إدارة القاعدة ═══
let dbTab = document.getElementById("dbTab");
let dbPanel = document.getElementById("dbPanel");
let dbRefresh = document.getElementById("dbRefresh");
let dbClearAll = document.getElementById("dbClearAll");
let dbSearch = document.getElementById("dbSearch");
let dbList = document.getElementById("dbList");
let dbCount = document.getElementById("dbCount");
const dbTabBtns = document.querySelectorAll(".db-tab");
let _dbCurrentSection = "flights";
let _dbCurrentData = {};
let _dbSearchTimer = null;

// ═══ تبويب القاعدة — لمن يملك view_database (المطوّر والمشرف، قرار المالك ٢٠٢٦-٠٩-٢٩) ═══
// يُسأل الجدول لا الدور، فلا يُفتح التبويب لدورٍ لا يعرفه الجدول.
function _dbCan(action) {
  return typeof can === "function" && can(action);
}
if (dbTab) {
  if (!_dbCan("view_database")) {
    dbTab.style.display = "none";
  }
  dbTab.addEventListener("click", function(){
    if (!_dbCan("view_database")) {
      if (typeof showToast === "function")
        showToast("لا تملك صلاحية هذا التبويب", "error");
      return;
    }
    if (typeof hideAllPanels === "function") hideAllPanels();
    dbTab.classList.add("tab-active");
    dbPanel.style.display = "block";
    loadDbSection(_dbCurrentSection);
  });
}

for (let dti = 0; dti < dbTabBtns.length; dti++) {
  dbTabBtns[dti].addEventListener("click", function(){
    for (let x = 0; x < dbTabBtns.length; x++)
      dbTabBtns[x].classList.remove("db-tab-active");
    this.classList.add("db-tab-active");
    _dbCurrentSection = this.getAttribute("data-dbs");
    if (dbSearch) dbSearch.value = "";
    loadDbSection(_dbCurrentSection);
  });
}
`;
}

/** الجزء 2 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart2() {
  return `
if (dbRefresh) dbRefresh.addEventListener("click", function(){
  loadDbSection(_dbCurrentSection);
});

// زر مسح القسم كاملاً — لمن يملك delete_database (تم إصلاح async)
function _updateClearAllVisibility() {
  if (!dbClearAll) return;
  if (_dbCan("delete_database")) {
    dbClearAll.style.display = "inline-block";
  } else {
    dbClearAll.style.display = "none";
  }
}

function _dbToast(msg, kind) {
  if (typeof showToast === "function") showToast(msg, kind);
}

function _dbSectionLabel(sect) {
  return ({flights:"الرحلات",reg:"التسجيلات",notif:"الإشعارات",users:"الموظفون"})[sect] || sect;
}

// الإذن أولًا؛ يُرجع {sect, label} أو null مع رسالة الرفض.
function _dbClearAllowed() {
  if (!_dbCan("delete_database")) {
    _dbToast("لا تملك صلاحية المسح", "error");
    return null;
  }
  return { sect: _dbCurrentSection, label: _dbSectionLabel(_dbCurrentSection) };
}

// مسارات المسح؛ أولها غير معرَّف إن لم يُعرف القسم.
function _dbClearPaths(sect) {
  return (sect === "flights") ? fqFlightNodes()
    : [({reg:"reg_data",notif:"notifications",users:"users"})[sect]];
}

function _dbWipeAll(paths) {
  return Promise.all(paths.map(function(p) {
    return fqRequest({path: "/" + p + ".json", method: "DELETE"});
  }));
}
`;
}

/** الجزء 3 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart3() {
  return `
// أول ردّ فاشل من الحذف المتوازي، أو {ok:true}.
function _dbFirstFailure(resps) {
  for (let wi = 0; wi < resps.length; wi++) {
    if (!resps[wi].ok) return resps[wi];
  }
  return { ok: true };
}

function _dbAnnounceClear(label, sect, path) {
  if (typeof fbPushNotif === "function") {
    fbPushNotif({ type: "data_deleted", title: "مسح قسم " + label,
      details: "تم مسح كل بيانات " + label + " من قاعدة البيانات" });
  }
  if (typeof auditLog === "function")
    auditLog("clear_section", sect, path);
}

function _dbClearDone(g, path, resps) {
  const wipeRes = _dbFirstFailure(resps);
  if (!wipeRes.ok) {
    _dbToast("فشل المسح: " + wipeRes.error, "error");
    return;
  }
  _dbAnnounceClear(g.label, g.sect, path);
  loadDbSection(g.sect);
  _dbToast("تم مسح القسم بالكامل", "success");
}

async function _dbClearSection() {
  const g = _dbClearAllowed();
  if (!g || !(await fqConfirm("تحذير: سيُمسح قسم (" + g.label + ") بالكامل من قاعدة البيانات. متابعة؟"))
    || !(await fqConfirm("تأكيد نهائي: هذه العملية لا يمكن التراجع عنها."))) return;
  _dbToast("جارٍ مسح القسم...", "loading");
  try {
    const paths = _dbClearPaths(g.sect);
    if (paths[0]) _dbClearDone(g, paths.join(","), await _dbWipeAll(paths));
  } catch(e) { _dbToast("فشل المسح", "error"); }
}

if (dbClearAll) {
  dbClearAll.addEventListener("click", _dbClearSection);
}
`;
}

/** الجزء 4 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart4() {
  return `
if (dbSearch) dbSearch.addEventListener("input", function(){
  clearTimeout(_dbSearchTimer);
  _dbSearchTimer = setTimeout(function(){
    _renderDbItems(_filterDbItems(_dbCurrentData));
  }, 200);
});

// محتوى مسار واحد، أو false عند تعذّر القراءة (والعقدة المعدومة null).
async function _dbLoadPath(path) {
  const resp = await fbFetchTimeout(FB_URL + "/" + path + ".json", null, 15000);
  if (!resp.ok) return false;
  return await resp.json();
}

// الرحلات في ثلاث عقد، كل صالة في عقدتها (أمر المالك ٢٠٢٦-٠٩-٢٨)، فتُقرأ
// الثلاث معًا وتُعرض قائمةً واحدة. والمفتاح يحمل مصدره فلا تتصادم.
async function _dbLoadFlights() {
  const parts = await Promise.all(fqFlightNodes().map(_dbLoadPath));
  let all = null;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === false) return false;
    if (parts[i]) all = Object.assign(all || {}, parts[i]);
  }
  return all;
}

function _dbSectionPath(section) {
  if (section === "reg") return "reg_data";
  if (section === "notif") return "notifications";
  if (section === "users") return "users";
  return "";
}

function _dbShowEmpty() {
  dbList.innerHTML = '<div class="db-empty">لا توجد بيانات في هذا القسم</div>';
  if (dbCount) dbCount.textContent = "0 سجل";
  _dbCurrentData = {};
}
`;
}

/** الجزء 5 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart5() {
  return `
function _dbShowLoaded(section, data) {
  if (data === false) {
    dbList.innerHTML = '<div class="db-empty">تعذر تحميل البيانات</div>';
    return;
  }
  if (!data) { _dbShowEmpty(); return; }
  _dbCurrentData = data;
  _renderDbItems(data);
  _dbLegacyNote(section, Object.keys(data));
}

async function loadDbSection(section) {
  _updateClearAllVisibility();
  if (!dbList) return;
  dbList.innerHTML = '<div class="db-empty">جارٍ التحميل...</div>';
  try {
    _dbShowLoaded(section, (section === "flights") ? await _dbLoadFlights() : await _dbLoadPath(_dbSectionPath(section)));
  } catch(e) { dbList.innerHTML = '<div class="db-empty">خطأ في التحميل</div>'; }
}

// ═══ حجم مشكلة المفاتيح القديمة: معروضٌ لا مخمَّن ═══
// الصيغة المعتمدة للمفتاح تبدأ بمصدر الرحلة (sch_ · t1_ · north_)، وما قبلها
// كان <التاريخ>_<الرقم>_<الوقت> بلا مصدر. والسجل المخزَّن بالصيغة القديمة
// لا يُصيبه الحذف إن كانت الشاشة تحمل المفتاح المحسوب، فيعود بعد التحديث.
// الترحيل الشامل مؤجَّل بقرار المستخدم ٢٠٢٦-٠٩-٢٥، لكن **الحجم لا يبقى
// مجهولًا**: يُعرض هنا للمطوّر، ويُذكر في رسالة فشل الحذف في fq_parser.
// ولا طلب إضافي: مفاتيح القسم محمَّلة أصلًا في loadDbSection.
function _dbLegacyNote(section, keys) {
  if (section !== "flights" || !dbCount) return 0;
  if (typeof fqLegacyKeyCount !== "function") return 0;
  const n = fqLegacyKeyCount(keys);
  if (n > 0) dbCount.textContent = keys.length + " سجل · " + n + " بصيغة مفتاح قديمة تحتاج ترحيلًا";
  return n;
}
`;
}

/** الجزء 6 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart6() {
  return `
function _filterDbItems(data) {
  const q = (dbSearch && dbSearch.value) ? dbSearch.value.trim().toLowerCase() : "";
  if (!q) return data;
  const filtered = {};
  const keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const str = JSON.stringify(data[k] || "").toLowerCase();
    if (k.toLowerCase().indexOf(q) !== -1 || str.indexOf(q) !== -1) {
      filtered[k] = data[k];
    }
  }
  return filtered;
}

// المفاتيح الظاهرة: الإشعارات من الأحدث وبحدّ ١٠٠.
function _dbVisibleKeys(data) {
  let keys = Object.keys(data || {});
  if (_dbCurrentSection === "notif") {
    keys.sort(function(a,b){
      return (data[b].time || "").localeCompare(data[a].time || "");
    });
    if (keys.length > 100) keys = keys.slice(0, 100);
  }
  return keys;
}

function _dbItemsHtml(data, keys) {
  let h = "";
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = data[k];
    if (!v) continue;
    h += _buildDbItem(k, v);
  }
  return h;
}
`;
}

/** الجزء 7 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart7() {
  return `
function _dbBindButtons(selector, handler) {
  const btns = dbList.querySelectorAll(selector);
  for (let bi = 0; bi < btns.length; bi++) {
    btns[bi].addEventListener("click", function(){
      const key = this.getAttribute("data-key");
      handler(key);
    });
  }
}

function _renderDbItems(data) {
  if (!dbList) return;
  const keys = _dbVisibleKeys(data);
  if (dbCount) dbCount.textContent = keys.length + " سجل";
  if (keys.length === 0) {
    dbList.innerHTML = '<div class="db-empty">لا توجد نتائج</div>';
    return;
  }
  dbList.innerHTML = _dbItemsHtml(data, keys);
  _dbBindButtons(".db-act-edit", _dbEditItem);
  _dbBindButtons(".db-act-del", _dbDeleteItem);
}

function _dbFlightInfo(value) {
  return {
    title: (value.al || "") + " " + (value.flt || "") + " → " + (value.to || ""),
    meta: (value.date || "") + " | " + (value.std || "") + " | " +
      (value.updatedBy ? "من " + value.updatedBy : ""),
    roleStyle: ""
  };
}

function _dbRegInfo(key, value) {
  const subCount = typeof value === "object" ? Object.keys(value).length : 0;
  return { title: "تسجيلات وردية: " + key, meta: subCount + " تسجيل", roleStyle: "" };
}

function _dbNotifInfo(value) {
  return {
    title: (value.title || "إشعار"),
    meta: (value.user ? "👤 " + value.user : "") + " | " +
      (value.time ? new Date(value.time).toLocaleString("ar-SA") : ""),
    roleStyle: ""
  };
}
`;
}

/** الجزء 8 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart8() {
  return `
function _dbUserInfo(key, value) {
  return {
    title: (value.name || key),
    roleStyle: ' style="border-right-color:' + roleLook(value.role).color + '"',
    meta: roleLook(value.role).label + " | " +
      (value.jobTitle || "") + " | #" + key
  };
}

function _dbItemInfo(key, value) {
  if (_dbCurrentSection === "flights") return _dbFlightInfo(value);
  if (_dbCurrentSection === "reg") return _dbRegInfo(key, value);
  if (_dbCurrentSection === "notif") return _dbNotifInfo(value);
  if (_dbCurrentSection === "users") return _dbUserInfo(key, value);
  return { title: "", meta: "", roleStyle: "" };
}

// أزرار التحكم — كلٌّ بإجرائه في مصفوفة الصلاحيات
function _dbActionsHtml(key) {
  const canEdit = _dbCan("edit_database") && _dbCurrentSection !== "reg";
  const canDelete = _dbCan("delete_database");
  if (!(canEdit || canDelete)) return "";
  let h = '<div class="db-item-actions">';
  if (canEdit) h += '<button class="db-act db-act-edit" data-key="' + key + '">تعديل</button>';
  if (canDelete) h += '<button class="db-act db-act-del" data-key="' + key + '">حذف</button>';
  return h + '</div>';
}

function _buildDbItem(key, value) {
  const info = _dbItemInfo(key, value);
  const hdr = '<div class="db-item-hdr">' +
    '<div class="db-item-title">' + info.title + '</div>' +
    '<div class="db-item-key">' + key + '</div>' +
    '</div>';
  let h = '<div class="db-item"' + info.roleStyle + '>' + hdr;
  if (info.meta) h += '<div class="db-item-meta">' + info.meta + '</div>';
  h += '<div class="db-item-body">' +
    _escapeHtml(JSON.stringify(value, null, 2).substring(0, 500)) +
    '</div>';
  h += _dbActionsHtml(key);
  return h + '</div>';
}
`;
}

/** الجزء 9 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart9() {
  return `
function _escapeHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function _dbDeletePath(key) {
  if (_dbCurrentSection === "flights") return fqFlightNodeOfKey(key);
  if (_dbCurrentSection === "reg") return "reg_data";
  if (_dbCurrentSection === "notif") return "notifications";
  if (_dbCurrentSection === "users") return "users";
  return "";
}

// الإذن قبل التأكيد؛ false مع رسالة الرفض.
function _dbDeleteAllowed() {
  if (_dbCan("delete_database")) return true;
  _dbToast("لا تملك صلاحية الحذف", "error");
  return false;
}

// رسالة «جارٍ الحذف» ثم مسار السجل؛ "" مع الرسالة إن لم يُعرف مصدره.
function _dbDeleteStart(key) {
  _dbToast("جارٍ الحذف...", "loading");
  const path = _dbDeletePath(key);
  // مفتاح رحلة بلا بادئة مصدر لا عقدة له، فلا يُرسل حذفٌ إلى مسار مخمَّن.
  if (!path) _dbToast("سجلّ بلا مصدر معروف — لم يُحذف", "error");
  return path;
}

function _dbDeleteDone(key, path, delRes) {
  if (!delRes.ok) {
    _dbToast("فشل الحذف: " + delRes.error, "error");
    return;
  }
  if (typeof fbPushNotif === "function")
    fbPushNotif({ type: "data_deleted", title: "حذف سجل", details: key });
  if (typeof auditLog === "function")
    auditLog("delete_item", path + "/" + key, key);
  loadDbSection(_dbCurrentSection);
  _dbToast("تم الحذف", "success");
}
`;
}

/** الجزء 10 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart10() {
  return `
async function _dbDeleteItem(key) {
  if (!_dbDeleteAllowed() || !(await fqConfirm("حذف السجل " + key + " من قاعدة البيانات؟"))) return;
  const path = _dbDeleteStart(key);
  if (!path) return;
  try { _dbDeleteDone(key, path, await fqRequest({path: "/" + path + "/" + key + ".json", method: "DELETE"})); }
  catch(e) { _dbToast("فشل الحذف", "error"); }
}

function _dbFlightRecord(key, v) {
  return {
    _fbKey: key,
    al: v.al || "", flt: v.flt || "", to: v.to || "",
    std: v.std || "", type: v.type || "", dpax: v.dpax || "",
    date: v.date || "",
    depTime: v.depTime ? new Date(v.depTime) : null
  };
}

function _dbDataIndex(key) {
  for (let di = 0; di < DATA.length; di++) {
    if (DATA[di]._fbKey === key) return di;
  }
  return -1;
}

// يفتح نموذج تعديل الرحلة الموجود؛ false إن لم يوجد السجل.
function _dbOpenFlightEditor(key) {
  const v = _dbCurrentData[key];
  if (!v) return false;
  const flight = _dbFlightRecord(key, v);
  // إضافة للـ DATA مؤقتاً للتعديل
  let existIdx = _dbDataIndex(key);
  if (existIdx < 0) {
    DATA.push(flight);
    existIdx = DATA.length - 1;
  }
  openEditFlight(DATA[existIdx], existIdx);
  return true;
}

function _dbEditPath() {
  if (_dbCurrentSection === "notif") return "notifications";
  if (_dbCurrentSection === "users") return "users";
  return _dbCurrentSection;
}
`;
}

/** الجزء 11 من 11 من نصّ `getDbAdminCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getDbAdminCodePart11() {
  return `
function _dbPutEdited(key, parsed) {
  _dbToast("جارٍ الحفظ...", "loading");
  return fqRequest({
    path: "/" + _dbEditPath() + "/" + key + ".json", method: "PUT", body: parsed
  });
}

function _dbSaved(key, putRes) {
  const path = _dbEditPath();
  if (!putRes.ok) {
    _dbToast("فشل الحفظ: " + putRes.error, "error");
    return;
  }
  if (typeof auditLog === "function")
    auditLog("edit_item", path + "/" + key, key);
  loadDbSection(_dbCurrentSection);
  _dbToast("تم الحفظ", "success");
}

// true إن انتهى التعديل هنا: رُفض الإذن، أو فُتح نموذج تعديل الرحلة الموجود.
function _dbEditHandled(key) {
  if (!_dbCan("edit_database")) {
    _dbToast("لا تملك صلاحية التعديل", "error");
    return true;
  }
  // للرحلات، نفتح نموذج تعديل الرحلة الموجود
  return _dbCurrentSection === "flights" && typeof openEditFlight === "function" && _dbOpenFlightEditor(key);
}

async function _dbEditItem(key) {
  if (_dbEditHandled(key)) return;
  // للإشعارات والتسجيلات — تعديل نصّي مباشر
  const current = JSON.stringify(_dbCurrentData[key] || {}, null, 2);
  const updated = await fqPrompt("تعديل JSON للسجل (احذر)", "تعديل", current);
  if (!updated || updated === current) return;
  try { _dbSaved(key, await _dbPutEdited(key, JSON.parse(updated))); }
  catch(e) { _dbToast("تنسيق JSON غير صالح", "error"); }
}
`;
}

module.exports = Object.freeze({
  getDbAdminHtml,
  getDbAdminStyles,
  getDbAdminCode,
});
