// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_sync.js
const localDiagnostics = importModule("fq_monitor_local");
localDiagnostics.start({});

// ═══ أداة مزامنة الملفات مع خادم التطوير المحلي ═══
const SERVER_URL = "http://192.168.1.100:8765";

const FILES = Object.freeze([
  "fq_secrets_manager.js","fq_config.js","fq_countries.js","fq_airports.js",
  "fq_airlines.js","fq_helpers.js","fq_styles.js","fq_html.js","fq_parser.js",
  "fq_search.js","fq_sidebar.js","fq_storage.js","fq_alerts.js",
  "fq_live.js","fq_live_store.js","fq_live_scrape.js","fq_live_view.js",
  "fq_addflight.js","fq_guide.js","fq_guide_data.js",
  "fq_export_guide.js","fq_firebase.js",
  "fq_firebase_rest.js","fq_firebase_flights.js","fq_firebase_reg.js",
  "fq_firebase_content.js","fq_firebase_webview.js",
  "fq_profile.js","fq_profile_store.js","fq_profile_html.js",
  "fq_profile_styles.js","fq_profile_code.js",
  "fq_stats.js","fq_stats_html.js","fq_stats_styles.js","fq_stats_code.js",
  "fq_logger.js",
  "fq_reg_html.js","fq_reg_styles.js","fq_reg_shift.js","fq_reg_form.js",
  "fq_reg_copy.js","fq_reg_history.js","fq_regmodel.js",
  "fq_widget.js","fq_report.js","fq_import.js","fq_data.js",
  "fq_delete.js","fq_backup.js","fq_permissions.js","fq_audit.js","fq_auth.js",
  "fq_toast.js","fq_snapshot.js","fq_editflight.js","fq_dbadmin.js","fq_main.js",
  "fq_data.json","fq_guide_data.json",
]);

// ═══ دوال I/O المحلية ═══
/**
 * يُرجع المسار المحلي لملف.
 * @param {string} name - اسم الملف
 * @returns {string}
 */
function getLocalPath(name) {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), name);
}
/**
 * يتحقق من وجود الملف محلياً.
 * @param {string} name - اسم الملف
 * @returns {boolean}
 */
function localExists(name) { return FileManager.local().fileExists(getLocalPath(name)); }
/**
 * يقرأ محتوى ملف محلي.
 * @param {string} name - اسم الملف
 * @returns {string|null}
 */
function readLocal(name) {
  const path = getLocalPath(name);
  if (!FileManager.local().fileExists(path)) return null;
  return FileManager.local().readString(path);
}
/**
 * يكتب محتوى ملف محلياً.
 * @param {string} name - اسم الملف
 * * @param {string} content - المحتوى
 * @returns {void}
 */
function writeLocal(name, content) {
  FileManager.local().writeString(getLocalPath(name), content);
}

// ═══ دوال الشبكة ═══
async function pullFile(name) {
  const req = new Request(`${SERVER_URL}/${name}`);
  req.timeoutInterval = 10;
  try {
    const content = await req.loadString();
    if (req.response.statusCode === 200) {
      writeLocal(name, content);
      return { name, ok: true, size: content.length };
    }
    return { name, ok: false, error: `HTTP ${req.response.statusCode}` };
  } catch (e) {
    return { name, ok: false, error: e.message };
  }
}
/**
 * يبني طلب رفع ملف إلى الخادم.
 * @param {string} name - اسم الملف
 * @param {string} content - المحتوى
 * @returns {Request}
 */
function _buildPushRequest(name, content) {
  const req = new Request(`${SERVER_URL}/${name}`);
  req.method = "PUT";
  req.headers = { "Content-Type": "text/plain; charset=utf-8" };
  req.body = content;
  req.timeoutInterval = 10;
  return req;
}
async function pushFile(name) {
  const content = readLocal(name);
  if (content === null) return { name, ok: false, error: "غير موجود محلياً" };
  const req = _buildPushRequest(name, content);
  try {
    await req.loadJSON();
    if (req.response.statusCode === 200) return { name, ok: true, size: content.length };
    return { name, ok: false, error: `HTTP ${req.response.statusCode}` };
  } catch (e) {
    return { name, ok: false, error: e.message };
  }
}
async function listRemote() {
  const req = new Request(`${SERVER_URL}/list`);
  req.timeoutInterval = 10;
  try {
    // رمز الحالة يُفحص قبل تحليل الردّ: صفحة خطأ من الخادم ليست قائمة ملفات.
    // والوثائق: «The response is not populated until the request has been completed».
    const text = await req.loadString();
    if (req.response.statusCode !== 200) return null;
    return JSON.parse(text);
  } catch (e) { return null; }
}

// ═══ handlers — كل خيار في دالة مستقلة ═══
function _buildResultMsg(label, results) {
  const ok   = results.filter(r => r.ok);
  const fail = results.filter(r => !r.ok);
  let msg = `${label + ok.length} ملف`;
  if (fail.length > 0) {
    msg += `\n\nفشل:\n${fail.map(r => `${r.name}: ${r.error}`).join("\n")}`;
  }
  return msg;
}

async function _showAlert(title, message) {
  const a = new Alert();
  a.title = title;
  a.message = message;
  a.addAction("حسناً");
  await a.present();
}

async function _handlePullAll() {
  const results = [];
  for (const f of FILES) results.push(await pullFile(f));
  await _showAlert("نتيجة السحب", _buildResultMsg("تم سحب ", results));
}

async function _handlePushAll() {
  const results = [];
  for (const f of FILES) {
    if (localExists(f)) results.push(await pushFile(f));
  }
  await _showAlert("نتيجة الدفع", _buildResultMsg("تم دفع ", results));
}

async function _handleStatus() {
  const remote = await listRemote();
  if (!remote) { await _showAlert("خطأ", "تعذر الاتصال بالخادم"); return; }
  const lines = FILES.map(name => {
    const loc = localExists(name);
    const rem = remote.find(f => f.name === name);
    const status = (loc && rem) ? "محلي + خادم" : loc ? "محلي فقط" : rem ? "خادم فقط" : "غير موجود";
    return `${name}\n  ${status}`;
  });
  await _showAlert(`حالة ${FILES.length} ملف`, lines.join("\n\n"));
}

/**
 * يعرض قائمة ملفات للاختيار منها.
 * @param {string} title - عنوان القائمة
 * @param {ReadonlyArray<string>} files - أسماء الملفات
 * @returns {Promise<number>} رقم الملف المختار، أو -1 عند الإلغاء
 */
async function _pickFile(title, files) {
  const pick = new Alert();
  pick.title = title;
  for (const f of files) pick.addAction(f);
  pick.addCancelAction("إلغاء");
  return await pick.present();
}

async function _handlePullOne() {
  const idx = await _pickFile("اختر ملفاً للسحب", FILES);
  if (idx === -1) return;
  const r = await pullFile(FILES[idx]);
  await _showAlert(r.ok ? "تم السحب" : "فشل",
    r.ok ? `${FILES[idx]} — ${r.size} بايت` : r.error);
}

async function _handlePushOne() {
  const localFiles = FILES.filter(f => localExists(f));
  if (localFiles.length === 0) { await _showAlert("لا توجد ملفات", "اسحب الملفات أولاً"); return; }
  const idx = await _pickFile("اختر ملفاً للدفع", localFiles);
  if (idx === -1) return;
  const r = await pushFile(localFiles[idx]);
  await _showAlert(r.ok ? "تم الدفع" : "فشل",
    r.ok ? `${localFiles[idx]} — ${r.size} بايت` : r.error);
}

/** @returns {Alert} القائمة الرئيسية بخياراتها الخمسة وزرّ الإلغاء. */
function _buildMenu() {
  const menu = new Alert();
  menu.title = "مزامنة الملفات";
  menu.message = `الخادم: ${SERVER_URL}\nعدد الملفات: ${FILES.length}`;
  menu.addAction("سحب كل الملفات من الحاسب");
  menu.addAction("دفع كل الملفات للحاسب");
  menu.addAction("عرض حالة الملفات");
  menu.addAction("سحب ملف واحد");
  menu.addAction("دفع ملف واحد");
  menu.addCancelAction("إلغاء");
  return menu;
}

// ═══ نقطة الدخول الرئيسية — C≤6 ═══
async function main() {
  const choice = await _buildMenu().present();
  if (choice === -1) return;
  const handlers = [_handlePullAll, _handlePushAll, _handleStatus, _handlePullOne, _handlePushOne];
  if (handlers[choice]) await handlers[choice]();
}

// ═══ نقطة الدخول — حراسة الوعد في المستوى الأعلى (نمط fq_widget.run) ═══
try {
  localDiagnostics.record("operation", { action: "fq_sync", phase: "start", status: "running", descriptionAr: "بدأ السكربت المستقل" });
  await main();
} catch (error) {
  localDiagnostics.recordError(error, { action: "fq_sync" });
  const message = (error && error.message) || String(error);
  console.error(`[fq_sync] خطأ غير معالج: ${message}`);
  const alert = new Alert();
  alert.title = "توقفت المزامنة";
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
} finally {
  localDiagnostics.record("operation", { action: "fq_sync", phase: "end", status: "returned", descriptionAr: "انتهى السكربت؛ تفاصيل النجاح تعتمد على مخرجاته" });
  localDiagnostics.flush();
  Script.complete();
}
