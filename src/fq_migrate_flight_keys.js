// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-orange; icon-glyph: key;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_migrate_flight_keys.js

/**
 * @module fq_migrate_flight_keys
 * @description ترحيل مفاتيح flights_data إلى الهوية الجديدة التي تشمل المصدر،
 * واسترداد حقل terminal الضائع من حقل src.
 *
 * ═══ لماذا ═══
 * المفتاح القديم: <التاريخ>_<الرقم>_<الوقت> — بلا مصدر. فرحلة في تيوب جداول
 * ورحلة في صالة 1 بنفس الرقم والتاريخ والوقت تُنتجان مفتاحًا واحدًا، فتكتب
 * إحداهما فوق الأخرى. والأسوأ: حفظ الجدول كان يعيد كتابة رحلات الصالات بلا
 * حقل terminal، فتفقد هويتها وتظهر داخل تيوب جداول.
 *
 * المفتاح الجديد: <المصدر>_<التاريخ>_<الرقم>_<الوقت>  حيث المصدر sch|t1|north.
 *
 * ═══ كيف يُسترد ما ضاع ═══
 * حقل src في القاعدة نجا من العطل: رحلات الصالات كُتبت دائمًا بـ
 * src = "kaia_t1" أو "kaia_north" (انظر _buildHallFlight في fq_hall_add.js).
 * فحتى الرحلات التي فقدت terminal يمكن ردّها إلى صالتها من src.
 *
 * ═══ الأمان ═══
 * - للمطوّر وحده.
 * - نسخة احتياطية كاملة قبل أي كتابة، في ملف محلي على الجهاز.
 *   ولماذا محليًّا لا في القاعدة: مسارات القاعدة المسموح بها محدودة
 *   (users, flights_data, flights_meta, audit_log, notifications,
 *   guide_data, script_package, system_status, system_emergency_stop)،
 *   وأي مسار جديد ترفضه قواعد الأمان. حاولتُ أولًا الكتابة تحت
 *   flights_data_backup فرُفضت على الجهاز — والملف المحلي لا يعتمد
 *   على القواعد أصلًا، ويُقرأ للاستعادة من هذا السكربت نفسه.
 * - الكتابة والحذف في طلب PATCH واحد: إمّا أن ينجح كله أو لا شيء.
 * - لا تُسقط أي رحلة: التصادمات تُرصد وتُعرض ولا تُكتب فوق بعضها.
 * - قابل للتكرار بلا ضرر: تشغيله مرة ثانية لا يفعل شيئًا.
 * - كل فشل يعرض سببه الحقيقي (رمز HTTP)، لا رسالة عامة.
 */

const auth = importModule("fq_auth");
const firebaseAuth = importModule("fq_firebase_auth");
const rest = importModule("fq_firebase_rest");
const helpers = importModule("fq_helpers");

const FLIGHTS_PATH = "flights_data";
const BACKUP_PREFIX = "fq_flights_backup_";

// ═══ الصلاحية — نفس فحص fq_publish حرفيًّا ═══
/**
 * يتحقق أن المستخدم الحالي هو المطوّر الوحيد.
 * @returns {Promise<boolean>}
 */
async function assertDeveloper() {
  try {
    const token = await firebaseAuth.getValidIdToken(false);
    const account = await firebaseAuth.lookupAccount(token);
    return Boolean(
      account && account.emailVerified === true &&
      account.localId === auth.SOLE_DEVELOPER_UID
    );
  } catch (error) {
    console.error(`[fq_migrate] auth ${error.message}`);
    return false;
  }
}

// ═══ استرداد الصالة ═══
/**
 * يستنتج صالة الرحلة من terminal إن وُجد، وإلا من src الذي نجا من العطل.
 * @param {Object} record - سجل رحلة كما هو في القاعدة
 * @returns {string} "t1" أو "north" أو "" لتيوب جداول
 */
function recoverTerminal(record) {
  const terminal = (record && record.terminal) || "";
  if (terminal === "t1" || terminal === "north") return terminal;
  const src = (record && record.src) || "";
  if (src === "kaia_t1") return "t1";
  if (src === "kaia_north") return "north";
  return "";
}

// ═══ التحليل — بلا أي كتابة ═══
/**
 * يحوّل سجلًا واحدًا إلى بند خطة، أو null إن كان بلا رحلة.
 * @param {string} oldKey
 * @param {Object} record
 * @returns {{oldKey:string, newKey:string, terminal:string, record:Object}|null}
 */
function planItem(oldKey, record) {
  if (!record || !record.flt) return null;
  const terminal = recoverTerminal(record);
  const newKey = helpers.flightKey({
    date: record.date, flt: record.flt, std: record.std, terminal: terminal,
  });
  return { oldKey: oldKey, newKey: newKey, terminal: terminal, record: record };
}

/** أهذا السجل على الهوية الجديدة بالفعل؟ */
function alreadyMigrated(item) {
  return item.newKey === item.oldKey && ((item.record.terminal) || "") === item.terminal;
}

/** أاستُردت صالة هذا السجل من حقل src؟ */
function terminalRecovered(item) {
  return item.terminal !== ((item.record.terminal) || "");
}

/**
 * يبني خطة الترحيل من محتوى القاعدة الحالي.
 *
 * كانت هذه الوثيقة مستقرّةً فوق `planItem` — دالةٌ أُدخِلت بين التعليق
 * وصاحبه — وتحتها وثيقةٌ ثانية فلم تُبلّغ عنها الأدوات. أُعيدت في المرحلة ٥.
 *
 * @param {Object} data - محتوى flights_data
 * @returns {{plan:Array, unchanged:number, collisions:Array, recovered:number, total:number}}
 */
function buildPlan(data) {
  const keys = Object.keys(data || {});
  const acc = { plan: [], collisions: [], targets: {}, unchanged: 0, recovered: 0 };
  for (let i = 0; i < keys.length; i++) addPlanItem(acc, planItem(keys[i], data[keys[i]]));
  return { plan: acc.plan, unchanged: acc.unchanged, collisions: acc.collisions, recovered: acc.recovered, total: keys.length };
}

/**
 * يعدّ بندًا واحدًا: مستردًّا من src، وسليمًا أو مُدرَجًا في الخطة. والسجل بلا رحلة يُترك.
 * @param {{plan:Array, collisions:Array, targets:Object, unchanged:number, recovered:number}} acc
 * @param {Object|null} item من planItem
 */
function addPlanItem(acc, item) {
  if (!item) return;
  if (terminalRecovered(item)) acc.recovered++;
  if (alreadyMigrated(item)) acc.unchanged++;
  else placePlanItem(acc, item);
}

/** يُدرج البند في الخطة، إلا إن سبقه سجلٌّ إلى المفتاح نفسه فيُرصد تصادمًا ولا يُكتب فوقه. */
function placePlanItem(acc, item) {
  const first = acc.targets[item.newKey];
  if (first) {
    acc.collisions.push({ newKey: item.newKey, first: first, second: item.oldKey });
    return;
  }
  acc.targets[item.newKey] = item.oldKey;
  acc.plan.push(item);
}

// ═══ النسخة الاحتياطية المحلية ═══
/**
 * يكتب محتوى flights_data كاملًا في ملف محلي على الجهاز.
 * @param {Object} data - محتوى flights_data
 * @returns {{ok:boolean, path:string, error:string}}
 */
function writeBackup(data) {
  try {
    const fm = FileManager.local();
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const path = fm.joinPath(fm.documentsDirectory(), `${BACKUP_PREFIX}${stamp}.json`);
    fm.writeString(path, JSON.stringify(data));
    if (!fm.fileExists(path)) return { ok: false, path: "", error: "كُتب الملف ولم يُعثر عليه بعدها" };
    return { ok: true, path: path, error: "" };
  } catch (error) {
    return { ok: false, path: "", error: (error && error.message) || String(error) };
  }
}

/**
 * يسرد ملفات النسخ الاحتياطية المحلية، الأحدث أولًا.
 * @returns {Array<string>} أسماء الملفات
 */
function listBackups() {
  try {
    const fm = FileManager.local();
    return fm.listContents(fm.documentsDirectory())
      .filter((name) => name.indexOf(BACKUP_PREFIX) === 0 && name.lastIndexOf(".json") > 0)
      .sort()
      .reverse();
  } catch (error) {
    console.error(`[fq_migrate] listBackups ${error.message}`);
    return [];
  }
}

// ═══ التنفيذ ═══
/**
 * يكتب المفاتيح الجديدة ويحذف القديمة في طلب PATCH واحد، فإمّا أن ينجح
 * كله أو لا يقع شيء. الحذف بإسناد null هو السلوك الموثَّق لـ REST في
 * Realtime Database.
 * @param {Array} plan - خطة الترحيل من buildPlan
 * @returns {Promise<{written:boolean, migrated:number, removed:number, error:string}>}
 */
async function applyPlan(plan) {
  const payload = newKeysPayload(plan);
  const removed = removeOldKeys(plan, payload);
  const result = await firebaseAuth.sendDatabaseRequest({ path: `${FLIGHTS_PATH}.json`, method: "PATCH", body: payload, timeoutSeconds: 30, forceRefresh: false });
  if (!result.ok) {
    return { written: false, migrated: 0, removed: 0, error: result.error || `HTTP ${result.status}` };
  }
  return { written: true, migrated: plan.length, removed: removed, error: "" };
}

/** السجلات تحت مفاتيحها الجديدة، كلٌّ بصالته وختم ترحيله. */
function newKeysPayload(plan) {
  const payload = {};
  const stamp = new Date().toISOString();
  for (let i = 0; i < plan.length; i++) {
    const item = plan[i];
    const copy = Object.assign({}, item.record);
    copy.terminal = item.terminal;
    copy.migratedAt = stamp;
    payload[item.newKey] = copy;
  }
  return payload;
}

/**
 * يُسند null للمفاتيح القديمة في الحمولة نفسها، ويُرجع عددها.
 * @param {Array} plan
 * @param {Object} payload تُعدَّل في مكانها
 * @returns {number}
 */
function removeOldKeys(plan, payload) {
  // حذف المفاتيح القديمة داخل الطلب نفسه، ما لم يكن المفتاح القديم هدفًا
  // لسجل آخر — حماية من حذف سجل كُتب للتوّ.
  let removed = 0;
  for (let j = 0; j < plan.length; j++) {
    const oldKey = plan[j].oldKey;
    if (oldKey === plan[j].newKey) continue;
    if (Object.prototype.hasOwnProperty.call(payload, oldKey)) continue;
    payload[oldKey] = null;
    removed++;
  }
  return removed;
}

// ═══ العرض ═══
async function showMessage(title, message) {
  const alert = new Alert();
  alert.title = title;
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
}

async function confirmPlan(summary) {
  const alert = new Alert();
  alert.title = "تأكيد الترحيل";
  alert.message = summary;
  alert.addAction("نفّذ الترحيل");
  alert.addCancelAction("إلغاء");
  return (await alert.present()) === 0;
}

/** عدد بنود الخطة لكل صالة؛ وما ليس t1 ولا north فهو جداول. */
function countByTerminal(plan) {
  const counts = { t1: 0, north: 0, sch: 0 };
  for (let i = 0; i < plan.length; i++) {
    if (plan[i].terminal === "t1") counts.t1++;
    else if (plan[i].terminal === "north") counts.north++;
    else counts.sch++;
  }
  return counts;
}

function summarize(analysis) {
  const lines = [
    `إجمالي السجلات: ${analysis.total}`,
    `ستُرحَّل: ${analysis.plan.length}`,
    `سليمة بالفعل: ${analysis.unchanged}`,
    `ستُسترد صالتها من src: ${analysis.recovered}`,
  ];
  if (analysis.collisions.length > 0) {
    lines.push(`⚠ تصادمات لن تُكتب: ${analysis.collisions.length}`);
  }
  const counts = countByTerminal(analysis.plan);
  lines.push("", `جداول: ${counts.sch} — صالة 1: ${counts.t1} — الشمالية: ${counts.north}`);
  return lines.join("\n");
}

// ═══ نقطة الدخول ═══
/**
 * يقرأ flights_data ويبني الخطة. يعرض سبب أي توقّف بنفسه.
 * @returns {Promise<{go:boolean, data:Object, analysis:Object}>}
 */
async function prepareMigration() {
  const stop = { go: false, data: null, analysis: null };
  const result = await rest.readData(FLIGHTS_PATH);
  if (!result.ok || !result.data) {
    await showMessage("تعذّرت القراءة", "لم تُقرأ flights_data من القاعدة.");
    return stop;
  }
  const analysis = buildPlan(result.data);
  if (analysis.plan.length === 0) {
    await showMessage("لا حاجة للترحيل", `كل السجلات (${analysis.total}) على الهوية الجديدة بالفعل.`);
    return stop;
  }
  return { go: true, data: result.data, analysis: analysis };
}

/** تقرير النجاح — نصّ واحد يجمع ما وقع وأين النسخة. */
function successReport(applied, backupPath) {
  return [
    `رُحِّل: ${applied.migrated} سجلًا`,
    `حُذفت مفاتيح قديمة: ${applied.removed}`,
    "",
    "النسخة الاحتياطية المحلية:",
    backupPath,
  ].join("\n");
}

async function main() {
  if (!(await assertDeveloper())) {
    await showMessage("مرفوض", "الترحيل للمطوّر وحده. سجّل دخولًا كمطوّر ثم أعد المحاولة.");
    return;
  }

  const prepared = await prepareMigration();
  if (!prepared.go) return;
  if (!(await confirmPlan(summarize(prepared.analysis)))) return;
  await executeMigration(prepared);
}

/** بعد التأكيد: النسخة الاحتياطية، ثم الطلب الذرّي، ثم التقرير. وأي توقّف يُقال سببه. */
async function executeMigration(prepared) {
  // نسخة احتياطية محلية قبل أي كتابة — لا تعتمد على الشبكة ولا على القواعد.
  const backup = writeBackup(prepared.data);
  if (!backup.ok) {
    await showMessage("توقّف الترحيل",
      `فشلت النسخة الاحتياطية المحلية. لم يُكتب شيء.\n\nالسبب: ${backup.error}`);
    return;
  }

  const applied = await applyPlan(prepared.analysis.plan);
  if (!applied.written) {
    await showMessage("فشل الترحيل",
      `لم يُكتب شيء — الطلب ذرّي فالقاعدة كما كانت.\n\nالسبب: ${applied.error}` +
      `\n\nالنسخة الاحتياطية: ${backup.path}`);
    return;
  }

  await showMessage("اكتمل الترحيل", successReport(applied, backup.path));
}

/**
 * يعرض النسخ المحلية ويُرجع اسم المختارة، أو "" عند الإلغاء.
 * @param {Array<string>} names
 * @returns {Promise<string>}
 */
async function pickBackup(names) {
  const picker = new Alert();
  picker.title = "استعادة نسخة احتياطية";
  picker.message = "ستُستبدل flights_data بالكامل بمحتوى الملف المختار.";
  for (let i = 0; i < names.length && i < 8; i++) picker.addDestructiveAction(names[i]);
  picker.addCancelAction("إلغاء");
  const choice = await picker.present();
  return choice < 0 ? "" : names[choice];
}

/**
 * يقرأ ملف نسخة محلية ويحلّله. FileManager يرمي خطأً عند الفشل بحسب
 * الوثائق، فالقراءة داخل try/catch.
 * @param {string} name
 * @returns {{ok:boolean, data:Object, error:string}}
 */
function readBackupFile(name) {
  try {
    const fm = FileManager.local();
    const path = fm.joinPath(fm.documentsDirectory(), name);
    return { ok: true, data: JSON.parse(fm.readString(path)), error: "" };
  } catch (error) {
    return { ok: false, data: null, error: (error && error.message) || String(error) };
  }
}

/** تأكيد صريح قبل استبدال flights_data كاملة. */
async function confirmRestore(name, count) {
  const confirm = new Alert();
  confirm.title = "تأكيد الاستعادة";
  confirm.message = `سيُستبدل محتوى flights_data بـ ${count} سجلًا من:\n${name}`;
  confirm.addDestructiveAction("استعِد الآن");
  confirm.addCancelAction("إلغاء");
  return (await confirm.present()) === 0;
}

/**
 * يعيد محتوى flights_data من نسخة احتياطية محلية. يستبدل المحتوى كاملًا.
 *
 * كانت هذه الوثيقة مستقرّةً فوق `pickBackup` مع وثيقةٍ ثانية تحتها، فلم
 * تُبلّغ عنها الأدوات. أُعيدت إلى صاحبتها في المرحلة ٥.
 *
 * @returns {Promise<void>}
 */
async function restore() {
  if (!(await assertDeveloper())) {
    await showMessage("مرفوض", "الاستعادة للمطوّر وحده.");
    return;
  }

  const chosen = await chooseBackupFile();
  if (!chosen) return;

  const count = Object.keys(chosen.file.data || {}).length;
  if (!(await confirmRestore(chosen.name, count))) return;
  await putBackup(chosen.file.data, count);
}

/** اسم النسخة المختارة، أو "" عند غياب النسخ (ويُقال له) أو الإلغاء. */
async function chooseBackupName() {
  const names = listBackups();
  if (names.length === 0) {
    await showMessage("لا نسخ احتياطية", "لم يُعثر على أي ملف نسخة احتياطية محلية على هذا الجهاز.");
    return "";
  }
  return pickBackup(names);
}

/** النسخة المختارة مقروءة: {name, file}، أو null إن لم تُختر أو تعذّرت قراءتها. */
async function chooseBackupFile() {
  const name = await chooseBackupName();
  if (!name) return null;
  const file = readBackupFile(name);
  if (!file.ok) {
    await showMessage("تعذّرت القراءة", `لم يُقرأ الملف: ${file.error}`);
    return null;
  }
  return { name: name, file: file };
}

/** يستبدل flights_data بمحتوى النسخة في طلب واحد، ثم يقول ما حدث. */
async function putBackup(data, count) {
  const result = await firebaseAuth.sendDatabaseRequest({ path: `${FLIGHTS_PATH}.json`, method: "PUT", body: data, timeoutSeconds: 30, forceRefresh: false });
  if (!result.ok) {
    await showMessage("فشلت الاستعادة", `السبب: ${result.error || `HTTP ${result.status}`}`);
    return;
  }
  await showMessage("اكتملت الاستعادة", `أُعيد ${count} سجلًا إلى flights_data.`);
}

/**
 * يعرض قائمة الإجراءات: ترحيل أو استعادة.
 * @returns {Promise<void>}
 */
async function chooseAction() {
  const menu = new Alert();
  menu.title = "ترحيل مفاتيح الرحلات";
  menu.message = "اختر الإجراء.";
  // كلا الإجراءين addAction: الوثائق تنص على لون addDestructiveAction فقط،
  // ولا تنص على ترقيمه حين يُخلط بـ addAction. تجنُّب الخلط يمنع الاعتماد
  // على استنتاج غير موثَّق في اختيار بين ترحيل واستعادة.
  menu.addAction("تحليل وترحيل");
  menu.addAction("استعادة نسخة احتياطية");
  menu.addCancelAction("إلغاء");
  const choice = await menu.present();
  if (choice === 0) await main();
  else if (choice === 1) await restore();
}

module.exports = Object.freeze({ recoverTerminal, buildPlan, applyPlan });

// ═══ نقطة الدخول — حراسة الوعد في المستوى الأعلى (نمط fq_widget.run) ═══
if (config.runsInApp) {
  try {
    await chooseAction();
  } catch (error) {
    const message = (error && error.message) || String(error);
    console.error(`[fq_migrate] خطأ غير معالج: ${message}`);
    const alert = new Alert();
    alert.title = "توقّف الترحيل";
    alert.message = message;
    alert.addAction("حسنًا");
    await alert.present();
  } finally {
    Script.complete();
  }
}
