// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: cloud-upload-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_publish.js
const localDiagnostics = importModule("fq_monitor_local");
localDiagnostics.start({});

/**
 * @module fq_publish
 * @description ينشر تلقائيًا ملفات fq_*.js المسموح بها إلى قاعدة البيانات.
 * البيان السحابي لا يتضمن إلا الملفات التي نجح رفعها، ويعرض السكربت تقريرًا
 * تفصيليًا بالملفات الناجحة والفاشلة والمحظورة بعد انتهاء المحاولة.
 */

const cfg = importModule("fq_config");
const auth = importModule("fq_auth");
const firebaseAuth = importModule("fq_firebase_auth");

const PACKAGE_ROOT = "script_package";
const MANIFEST_KEY = "_manifest";
const REQUEST_TIMEOUT_SECONDS = 15;
const CONCURRENCY = 4;
const MIN_CONTENT_LENGTH = 20;
const PUBLISHABLE_NAME_PATTERN = /^fq_[a-z0-9_]+\.js$/;
const BLOCKED_NAMES = Object.freeze({
  "setup_dev.js": true,
  "fq_publish.js": true,
  "fq_monitor_force_test.js": true,
  // DATA_ONLY: محتوى بيانات خام وليس JavaScript قابلًا للتنفيذ.
  "fq_data.js": true,
  "fq_guide_data.js": true,
});

async function assertDeveloper() {
  try {
    const token = await firebaseAuth.getValidIdToken(false);
    const account = await firebaseAuth.lookupAccount(token);
    return Boolean(
      account && account.emailVerified === true &&
      account.localId === auth.SOLE_DEVELOPER_UID
    );
  } catch (error) {
    console.error(`[fq_publish] auth ${error.message}`);
    return false;
  }
}

function normalizeScriptName(rawName) {
  if (typeof rawName !== "string") return null;
  let name = rawName.trim();
  if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) return null;
  if (!/\.js$/i.test(name)) name += ".js";
  return name.replace(/\.js$/i, ".js").toLowerCase();
}

function isBlockedName(name) {
  return Boolean(name && BLOCKED_NAMES[name]);
}

function isPublishableName(name) {
  return Boolean(name && PUBLISHABLE_NAME_PATTERN.test(name) && !isBlockedName(name));
}

function listNames(location) {
  try {
    return location.fm.listContents(location.dir) || [];
  } catch (error) {
    console.error(`[fq_publish] list ${error.message}`);
    return [];
  }
}

function countRelevantNames(rawNames) {
  let count = 0;
  for (let index = 0; index < rawNames.length; index++) {
    const name = normalizeScriptName(rawNames[index]);
    if (isPublishableName(name) || isBlockedName(name)) count++;
  }
  return count;
}

/**
 * يضيف مجلد المستندات لمدير ملفات إلى المرشّحين؛ وفشلُ فتحه يُسجَّل ولا يوقف الباقي.
 * @param {Object[]} candidates
 * @param {string} label اسمه في السجلّ
 * @param {() => FileManager} open
 */
function pushLocation(candidates, label, open) {
  try {
    const fm = open();
    candidates.push({ fm: fm, dir: fm.documentsDirectory() });
  } catch (error) {
    console.error(`[fq_publish] ${label} fm ${error.message}`);
  }
}

function resolveScriptsLocation() {
  const candidates = [];
  pushLocation(candidates, "local", () => FileManager.local());
  pushLocation(candidates, "icloud", () => FileManager.iCloud());
  return richestLocation(candidates);
}

/** المرشّح الذي فيه أكثر ملفات الحزمة؛ وعند التساوي الأول. */
function richestLocation(candidates) {
  let best = null;
  let bestCount = -1;
  for (let index = 0; index < candidates.length; index++) {
    const count = countRelevantNames(listNames(candidates[index]));
    if (count > bestCount) {
      best = candidates[index];
      bestCount = count;
    }
  }
  return best;
}

/**
 * يصنّف اسمًا واحدًا من المجلد: محظورًا أو قابلًا للنشر، أو يتركه. والاسم المكرَّر بعد
 * التسوية يُحسب أول مرة فقط.
 * @param {{seen: Object, files: Object[], blocked: string[]}} found
 * @param {string} rawName
 */
function addFoundName(found, rawName) {
  const normalized = normalizeScriptName(rawName);
  if (!normalized || found.seen[normalized]) return;
  if (isBlockedName(normalized)) found.blocked.push(normalized);
  else if (isPublishableName(normalized)) found.files.push({ name: normalized, rawName: rawName });
  else return;
  found.seen[normalized] = true;
}

function inspectLocalPackage() {
  const location = resolveScriptsLocation();
  if (!location) return { location: null, files: [], blocked: [] };
  const found = { seen: {}, files: [], blocked: [] };
  listNames(location).forEach((rawName) => addFoundName(found, rawName));
  found.files.sort((left, right) => left.name.localeCompare(right.name));
  found.blocked.sort();
  return { location: location, files: found.files, blocked: found.blocked };
}

/** أسماء الملف المحتملة على القرص بترتيب التجربة، بلا فارغ ولا مكرَّر. */
function pathCandidates(file) {
  const withoutExtension = file.name.replace(/\.js$/i, "");
  const unique = [];
  [file.rawName, file.name, withoutExtension].forEach((candidate) => {
    if (candidate && unique.indexOf(candidate) < 0) unique.push(candidate);
  });
  return unique;
}

/** مسار المرشّح إن كان ملفًا ونُزِّل، وإلا null (والخطأ يُسجَّل). */
async function tryCandidatePath(location, candidate) {
  const path = location.fm.joinPath(location.dir, candidate);
  try {
    if (!location.fm.fileExists(path) || location.fm.isDirectory(path)) return null;
    await location.fm.downloadFileFromiCloud(path);
    return path;
  } catch (error) {
    console.error(`[fq_publish] path ${candidate} ${error.message}`);
    return null;
  }
}

async function resolveScriptPath(location, file) {
  const candidates = pathCandidates(file);
  for (let index = 0; index < candidates.length; index++) {
    const path = await tryCandidatePath(location, candidates[index]);
    if (path) return { ok: true, path: path };
  }
  return { ok: false, error: "تعذر العثور على الملف أو تنزيله" };
}

async function readSourceFile(location, file) {
  const resolved = await resolveScriptPath(location, file);
  if (!resolved.ok) return resolved;
  try {
    const content = location.fm.readString(resolved.path);
    if (!content || content.length < MIN_CONTENT_LENGTH) {
      return { ok: false, error: "المحتوى فارغ أو أقصر من الحد الأدنى" };
    }
    return { ok: true, content: content };
  } catch (error) {
    console.error(`[fq_publish] read ${file.name} ${error.message}`);
    return { ok: false, error: `تعذرت قراءة الملف: ${error.message}` };
  }
}

function safeKey(name) {
  return String(name || "").replace(/[.#$[\]/]/g, "-");
}

async function putNode(path, body) {
  return await firebaseAuth.sendDatabaseRequest({
    path: `${path}.json`, method: "PUT", body, timeoutSeconds: REQUEST_TIMEOUT_SECONDS, forceRefresh: false,
  });
}

// ═══ تكرار مقصود ومحسوم — لا تُوحَّد هذه الدالة مع نظيرتها ═══
// نظيرتها المنطقية مضمَّنة في `downloadFiles` في `fq_bootstrap.js`، وهي
// المنطق نفسه حرفيًّا (مؤشّر مشترك + عاملون بعدد `Math.min(limit, len)` +
// `Promise.all`). وقد فُحص التوحيد في المرحلة ٥ (٢٠٢٦-٠٩-٢٥) و**رُفض**:
//
// `fq_bootstrap` هو السكربت الذي يجلب الحزمة إلى جهاز قد لا تكون عليه. ولذلك
// هو مستقلّ بقصد: يستورد `fq_config` داخل `try/catch` وله رابط احتياطي، وفيه
// `isMissingModuleError` مكتوبة خصيصًا لحالة غياب الوحدة. فاستيراد وحدة جديدة
// استيرادًا إلزاميًّا يجعل غيابَها يُسقط التحديث كلّه — ووثائق Scriptable
// <https://docs.scriptable.app/module/> تنصّ أن `importModule` يبحث في مسارات
// مرتَّبة، والكود نفسه يفحص نصّ الخطأ «No file to import».
//
// والبديل الوسط (وحدة يستوردها `fq_publish` وحده) لا يزيل التكرار — يُبقي
// نسختين ويضيف ملفًا وبصمةً. فالتكرار هنا **كلفةُ استقلالِ الإقلاع**، وهي
// أرخص من تعطيل التحديث على جهاز جديد.
//
// **عند تعديل أيٍّ منهما عدّل الأخرى.** قرار المالك ٢٠٢٦-٠٩-٢٥.
async function mapPool(items, limit, worker) {
  const results = [];
  let cursor = 0;
  async function runOne() {
    while (cursor < items.length) {
      const current = cursor;
      cursor++;
      results[current] = await worker(items[current]);
    }
  }
  const runners = [];
  const count = Math.min(limit, items.length);
  for (let index = 0; index < count; index++) runners.push(runOne());
  await Promise.all(runners);
  return results;
}

async function publishFile(inventory, file, timestamp) {
  const source = await readSourceFile(inventory.location, file);
  if (!source.ok) return { name: file.name, ok: false, error: source.error };
  const body = {
    name: file.name,
    content: source.content,
    bytes: source.content.length,
    updatedAt: timestamp,
  };
  const result = await putNode(`${PACKAGE_ROOT}/${safeKey(file.name)}`, body);
  return { name: file.name, ok: result.ok, error: result.error };
}

async function publishManifest(successfulNames, timestamp) {
  if (successfulNames.length === 0) {
    return { ok: false, error: "لم يُكتب البيان لأن جميع الملفات فشلت" };
  }
  const manifest = {
    updatedAt: timestamp,
    count: successfulNames.length,
    files: successfulNames,
    by: "fq_publish",
  };
  return await putNode(`${PACKAGE_ROOT}/${MANIFEST_KEY}`, manifest);
}

/** يفرز نتائج الرفع إلى ناجح (أسماء) وفاشل (اسم وسبب)، مرتّبين بالاسم. */
function splitOutcomes(outcomes) {
  const successful = [];
  const failed = [];
  for (let index = 0; index < outcomes.length; index++) {
    const outcome = outcomes[index];
    if (outcome.ok) successful.push(outcome.name);
    else failed.push({ name: outcome.name, error: outcome.error || "فشل غير محدد" });
  }
  successful.sort();
  failed.sort((left, right) => left.name.localeCompare(right.name));
  return { successful: successful, failed: failed };
}

async function publishAll(inventory) {
  const timestamp = new Date().toISOString();
  const outcomes = await mapPool(inventory.files, CONCURRENCY, (file) => publishFile(inventory, file, timestamp));
  const split = splitOutcomes(outcomes);
  const manifest = await publishManifest(split.successful, timestamp);
  return {
    detected: inventory.files.length + inventory.blocked.length,
    attempted: inventory.files.length,
    successful: split.successful,
    failed: split.failed,
    blocked: inventory.blocked.slice(),
    manifest: manifest,
  };
}

async function showMessage(title, message) {
  const alert = new Alert();
  alert.title = title;
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
}

function addSectionHeader(table, title) {
  const row = new UITableRow();
  row.isHeader = true;
  row.addText(title);
  table.addRow(row);
}

function addReportRow(table, title, subtitle) {
  const row = new UITableRow();
  row.height = subtitle ? 58 : 44;
  row.addText(title, subtitle || "");
  table.addRow(row);
}

function addReportSection(table, title, entries) {
  addSectionHeader(table, `${title} (${entries.length})`);
  if (entries.length === 0) {
    addReportRow(table, "لا يوجد", "");
    return;
  }
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (typeof entry === "string") addReportRow(table, entry, "");
    else addReportRow(table, entry.name, entry.error || "");
  }
}

async function showPublishReport(report) {
  const table = new UITable();
  table.showSeparators = true;
  addSectionHeader(table, "ملخص النشر");
  addReportRow(table, `المكتشف: ${report.detected}`, `المحاولة: ${report.attempted}`);
  const manifestText = report.manifest.ok ? "نجح تحديث _manifest" : "فشل تحديث _manifest";
  addReportRow(table, manifestText, report.manifest.error || "");
  addReportSection(table, "نجح رفعها", report.successful);
  addReportSection(table, "فشل رفعها", report.failed);
  addReportSection(table, "مُنعت من الرفع", report.blocked);
  await table.present(true);
}

/** شرطا النشر: حساب المطوّر ورابط القاعدة. وعند غياب أحدهما يُقال للمطوّر لماذا. */
async function canPublish() {
  if (!(await assertDeveloper())) {
    await showMessage("مرفوض", "النشر للمطوّر فقط. سجّل دخولًا كمطوّر ثم أعد المحاولة.");
    return false;
  }
  if (!cfg.FIREBASE_URL) {
    await showMessage("لا رابط قاعدة", "اضبط رابط القاعدة قبل النشر.");
    return false;
  }
  return true;
}

async function showNoFiles(inventory) {
  const blockedText = inventory.blocked.length ? `\nالمحظور المكتشف: ${inventory.blocked.join("، ")}` : "";
  await showMessage("لا ملفات", `لم يُعثر على ملفات fq_ مسموح بها في مجلد سكربتابل.${blockedText}`);
}

/** يعرض عدد ما سيُرفع وما سيُمنع، ويُرجع صدقًا إن اختار المطوّر «انشر الآن». */
async function confirmPublish(inventory) {
  const confirm = new Alert();
  confirm.title = "نشر الحزمة";
  confirm.message =
    "سيُرفع " + inventory.files.length + " ملفًا يبدأ اسمه بـ fq_.\n" +
    "سيُمنع " + inventory.blocked.length + " ملفًا محظورًا مكتشفًا.\n" +
    "تُكتشف ملفات fq_ الجديدة تلقائيًا في كل تشغيل.";
  confirm.addAction("انشر الآن");
  confirm.addCancelAction("إلغاء");
  return (await confirm.present()) === 0;
}

async function main() {
  if (!(await canPublish())) return;
  const inventory = inspectLocalPackage();
  if (inventory.files.length === 0) {
    await showNoFiles(inventory);
    return;
  }
  if (!(await confirmPublish(inventory))) return;
  const report = await publishAll(inventory);
  await showPublishReport(report);
}

try {
  localDiagnostics.record("operation", { action: "fq_publish", phase: "start", status: "running", descriptionAr: "بدأ السكربت المستقل" });
  await main();
} catch (error) {
  localDiagnostics.recordError(error, { action: "fq_publish" });
  console.error(`[fq_publish] fatal ${error.message}`);
  await showMessage("تعذر النشر", error.message || "حدث خطأ غير متوقع.");
} finally {
  localDiagnostics.record("operation", { action: "fq_publish", phase: "end", status: "returned", descriptionAr: "انتهى السكربت؛ تفاصيل النجاح تعتمد على مخرجاته" });
  localDiagnostics.flush();
  Script.complete();
}
