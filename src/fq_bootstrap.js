// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: cloud-download-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_bootstrap.js
// المثبت قد يبدأ منفردًا قبل تنزيل الوحدات؛ التسجيل اختياري ولا يمنع التثبيت.
function _optionalLocalDiagnostics() {
  try {
    const recorder = importModule("fq_monitor_local");
    recorder.start({});
    return recorder;
  } catch (error) {
    console.warn("التسجيل المحلي غير متاح للمثبت المنفرد");
    return { record: function () {}, recordError: function () {}, flush: function () {} };
  }
}
const localDiagnostics = _optionalLocalDiagnostics();
let localInstallOperation = "";

/**
 * @module fq_bootstrap
 * @description إقلاع/تحديث حزمة النظام على جهاز الموظف.
 * يسحب الملفات من مسار script_package في القاعدة حسب البيان (_manifest)
 * الذي يحدّثه المطوّر عبر fq_publish بعد كل تطوير.
 *
 * الأمان:
 * - يقبل فقط ملفات fq_*.js غير المحظورة، حتى لو احتوى البيان على غيرها.
 * - لا يمسّ جلسات الدخول ولا معرّف الجهاز ولا ملفات الرصد المحلية.
 * - لا يغيّر الصلاحيات ولا يرقّي الدور.
 * - مهلة صريحة وفحص رمز الحالة قبل الكتابة.
 */

// رابط القاعدة المعتمد للنظام — جاهز دون لصق يدوي عند أول تثبيت
const FIREBASE_URL_FALLBACK = "https://hajjterminal-default-rtdb.firebaseio.com";
const FIREBASE_URL_KEY = "fq_firebase_url";

const PACKAGE_ROOT = "script_package";
const MANIFEST_KEY = "_manifest";
const REQUEST_TIMEOUT_SECONDS = 15;
const CONCURRENCY = 4;
const MIN_CONTENT_LENGTH = 40;
const NAME_PATTERN = /^fq_[a-z0-9_]+\.js$/;

const BLOCKED_NAMES = Object.freeze({
  "setup_dev.js": true,
  "fq_publish.js": true,
  "fq_monitor_force_test.js": true,
  // DATA_ONLY: لا تُكتب في مجلد سكربتات Scriptable كملفات .js.
  "fq_data.js": true,
  "fq_guide_data.js": true,
});

const PROTECTED_LOCAL = Object.freeze([
  "fq_auth_local.json",
  "fq_device_id.json",
  "fq_monitor_queue.json",
  "fq_monitor_state.json",
  "fq_monitor_history.json",
  // طابور الطلبات المؤجَّلة: فيه عمل موظف لم يصل إلى القاعدة بعد،
  // فسحبُ نسخة فوقه يمحو ما لا نسخة له في أي مكان.
  "fq_queue.json",
  "fq_started_flag.json",
]);

/**
 * هل الخطأ سببه غياب الوحدة لا عطبٌ فيها؟
 * @param {Error} error - الخطأ الملقى من importModule
 * @returns {boolean}
 */
function isMissingModuleError(error) {
  const message = (error && error.message) ? String(error.message) : "";
  return message.indexOf("No file to import") >= 0;
}

/**
 * يحلّ رابط القاعدة: إعداد محلي إن وُجد، ثم الثابت، ثم طلب من المستخدم.
 *
 * كانت هذه الوثيقة موضوعةً فوق `isMissingModuleError` — دالةٌ أُدخِلت بين
 * التعليق وصاحبه. ولم يكن ذلك خطأً في الوثيقة وحدها: صار `tsc` يحسب
 * `isMissingModuleError` تُرجع `Promise<string>`، فأبلغ ESLint عن «وعدٍ في
 * شرطٍ منطقيّ» في `resolveFirebaseUrl`. فالوثيقة الكاذبة تُعمي الأدوات، لا
 * القارئ وحده. (تقرير التدقيق ٢٠٢٦-٠٩-٢٥، الفئة أ.)
 *
 * @returns {Promise<string>}
 */
async function resolveFirebaseUrl() {
  const fromConfig = _urlFromConfig();
  if (fromConfig !== null) return fromConfig;
  if (FIREBASE_URL_FALLBACK && FIREBASE_URL_FALLBACK.indexOf("http") === 0) {
    return FIREBASE_URL_FALLBACK.replace(/\/$/, "");
  }
  return _askForFirebaseUrl();
}

/**
 * يقرأ رابط القاعدة من fq_config إن وُجد. يُرجع null إن لم يوجد إعداد، فيكمل الحلّ.
 * @returns {string|null}
 */
function _urlFromConfig() {
  try {
    const cfg = importModule("fq_config");
    if (cfg && cfg.FIREBASE_URL) return String(cfg.FIREBASE_URL).replace(/\/$/, "");
  } catch (error) {
    if (isMissingModuleError(error)) {
      console.log("[fq_bootstrap] fq_config غير موجود؛ استخدام الرابط الاحتياطي.");
    } else {
      console.error(`[fq_bootstrap] config ${error.message}`);
    }
  }
  return null;
}

/**
 * يطلب من المستخدم لصق رابط القاعدة. لا يُستعمل إلا إن غاب الثابت والإعداد معًا.
 * @returns {Promise<string>}
 */
async function _askForFirebaseUrl() {
  const a = new Alert();
  a.title = "رابط القاعدة";
  a.message = "الصق رابط قاعدة النظام (مرة واحدة عند أول تثبيت).";
  a.addTextField("https://....firebaseio.com", "");
  a.addAction("متابعة");
  a.addCancelAction("إلغاء");
  if ((await a.present()) !== 0) return "";
  return (a.textFieldValue(0) || "").trim().replace(/\/$/, "");
}

/**
 * يحفظ رابط القاعدة العام محليًا بعد التثبيت الأول.
 * لا تُحفظ هنا مفاتيح API أو رموز GitHub؛ المطلوب فقط أن تتمكن الحزمة
 * التي نُزّلت للتو من بناء طلبات قاعدة البيانات عند تشغيل fq_main.
 * @param {string} base
 * @returns {boolean}
 */
function persistFirebaseUrl(base) {
  if (base == null || base.indexOf("https://") !== 0) return false;
  try {
    Keychain.set(FIREBASE_URL_KEY, base.replace(/\/$/, ""));
    return true;
  } catch (error) {
    console.error(`[fq_bootstrap] حفظ رابط القاعدة ${error.message}`);
    return false;
  }
}

/**
 * طلب جيسون مع مهلة وفحص حالة.
 * @param {string} url
 * @returns {Promise<{ok: boolean, data?: any, error?: string, code?: string}>}
 */
async function fetchJson(url) {
  const req = _buildRequest(url);
  try {
    const text = await req.loadString();
    return _jsonResult(text, req.response == null ? undefined : req.response.statusCode);
  } catch (e) {
    return {
      ok: false,
      error: (e && e.message) ? e.message : "شبكة",
      code: "NETWORK",
    };
  }
}

/**
 * يبني طلب GET بمهلة وترويسة تمنع الكاش.
 * @param {string} url
 * @returns {Request}
 */
function _buildRequest(url) {
  const req = new Request(url);
  req.method = "GET";
  req.timeoutInterval = REQUEST_TIMEOUT_SECONDS;
  req.headers = { "Cache-Control": "no-cache" };
  return req;
}

/**
 * يفسّر جواب الطلب: حالة غير 200 أو فارغ أو JSON صالح.
 * @param {string} text
 * @param {number|undefined} code
 * @returns {{ok: boolean, data?: any, error?: string, code?: string}}
 */
function _jsonResult(text, code) {
  if (code !== 200) return { ok: false, error: `حالة ${code}`, code: "HTTP" };
  if (!text || text === "null") return { ok: false, error: "فارغ", code: "EMPTY" };
  return { ok: true, data: JSON.parse(text) };
}

/**
 * هل الاسم مسموح للكتابة؟
 * @param {string} name
 * @returns {boolean}
 */
function isSafeName(name) {
  if (!name || typeof name !== "string") return false;
  if (name.indexOf("..") >= 0 || name.indexOf("/") >= 0 || name.indexOf("\\") >= 0) {
    return false;
  }
  if (BLOCKED_NAMES[name]) return false;
  if (PROTECTED_LOCAL.indexOf(name) >= 0) return false;
  return NAME_PATTERN.test(name);
}

/**
 * يحدد مساحة السكربتات التي يستخدمها Scriptable فعليًا.
 * عند تفعيل iCloud تكون هي مساحة السكربتات المرئية والقابلة للتشغيل؛
 * ويُستخدم التخزين المحلي فقط عند عدم توفر iCloud.
 * @returns {{fm: FileManager, dir: string, label: string}|null}
 */
function resolveScriptStorage() {
  try {
    const fm = FileManager.iCloud();
    return { fm: fm, dir: fm.documentsDirectory(), label: "iCloud" };
  } catch (iCloudError) {
    console.log("[fq_bootstrap] iCloud غير متاح؛ استخدام التخزين المحلي.");
  }
  try {
    const fm = FileManager.local();
    return { fm: fm, dir: fm.documentsDirectory(), label: "محلي" };
  } catch (localError) {
    console.error(`[fq_bootstrap] تعذّر فتح مساحة السكربتات ${localError.message}`);
    return null;
  }
}

/**
 * هل هذا المحتوى شيفرةٌ صالحة لاسمٍ آمن؟ يمنع صفحة HTML أو نصًّا أقصر من الحدّ.
 * @param {string} name - اسم الملف
 * @param {string} content - محتواه
 * @returns {boolean}
 */
function isValidScriptContent(name, content) {
  if (!isSafeName(name)) return false;
  if (!content || content.trim().length < MIN_CONTENT_LENGTH) return false;
  const head = content.trim().slice(0, 40).toLowerCase();
  if (head.indexOf("<!doctype") === 0 || head.indexOf("<html") === 0) return false;
  return true;
}

/**
 * يكتب ملف شيفرة في مساحة سكربتات Scriptable ثم يتحقق من وجوده.
 * (نُقلت هذه الوثيقة إلى صاحبها في ٢٠٢٦-٠٩-٢٥: كانت فوق دالةٍ أُدخِلت
 *  بينها وبين الدالة التي تصفها، والوثيقة الكاذبة تُعمي أدوات الفحص لا
 *  القارئَ وحده. تقرير التدقيق ٢٠٢٦-٠٩-٢٥، الفئة أ.)
 * @param {{fm: FileManager, dir: string}} storage
 * @param {string} name
 * @param {string} content
 * @returns {boolean}
 */
function writeScriptFile(storage, name, content) {
  if (!storage) return false;
  if (!isValidScriptContent(name, content)) return false;
  try {
    const path = storage.fm.joinPath(storage.dir, name);
    storage.fm.writeString(path, content);
    return storage.fm.fileExists(path);
  } catch (e) {
    console.error(`[fq_bootstrap] write ${name} ${e.message}`);
    return false;
  }
}

/**
 * يقرأ قائمة الملفات من البيان السحابي.
 * @param {string} base
 * @returns {Promise<string[]>}
 */
async function loadManifestFiles(base) {
  const res = await fetchJson(`${base}/${PACKAGE_ROOT}/${MANIFEST_KEY}.json`);
  if (!res.ok || !res.data || !Array.isArray(res.data.files)) return [];
  const list = [];
  const seen = {};
  for (let i = 0; i < res.data.files.length; i++) {
    const n = res.data.files[i];
    if (isSafeName(n) && !seen[n]) {
      list.push(n);
      seen[n] = true;
    }
  }
  return list;
}

/**
 * يسحب ملفًا واحدًا من script_package.
 * @param {string} base
 * @param {string} name
 * @returns {Promise<{ok: boolean, content?: string, error?: string}>}
 */
async function fetchPackageFile(base, name) {
  if (!isSafeName(name)) return { ok: false, error: "اسم غير مسموح" };
  const key = name.replace(/[.#$[\]/]/g, "-");
  const res = await fetchJson(`${base}/${PACKAGE_ROOT}/${key}.json`);
  if (!res.ok) return { ok: false, error: res.error || "فشل" };
  const content = res.data == null ? undefined : res.data.content;
  if (!content || String(content).length < MIN_CONTENT_LENGTH) {
    return { ok: false, error: "محتوى ناقص" };
  }
  return { ok: true, content: String(content) };
}

/**
 * يفسّر جواب المسار الرسمي لسياسة السحب.
 * @param {{ok: boolean, data?: any, error?: string, code?: string}} result
 * @returns {{ok: boolean, allowed?: boolean, error?: string}}
 */
function _officialPullPolicy(result) {
  if (!result.data || typeof result.data !== "object" || typeof result.data.allowed !== "boolean") {
    return { ok: false, error: "سياسة السحب غير صالحة." };
  }
  return { ok: true, allowed: result.data.allowed };
}

function _legacyPullPolicy(result) {
  if (result.ok && typeof result.data === "boolean") return { ok: true, allowed: result.data };
  if (result.code === "EMPTY") return { ok: true, allowed: true };
  return { ok: false, error: result.error || "تعذّر قراءة سياسة السحب." };
}

/**
 * يقرأ سياسة سحب الحزمة من المسار الرسمي الواحد.
 * يرجع نتيجة صريحة حتى لا يتحول فشل الشبكة إلى سماح غير مقصود.
 * (نُقلت هذه الوثيقة إلى صاحبها في ٢٠٢٦-٠٩-٢٥: كانت فوق دالةٍ أُدخِلت
 *  بينها وبين الدالة التي تصفها، والوثيقة الكاذبة تُعمي أدوات الفحص لا
 *  القارئَ وحده. تقرير التدقيق ٢٠٢٦-٠٩-٢٥، الفئة أ.)
 * @param {string} base - جذر القاعدة
 * @returns {Promise<{ok: boolean, allowed?: boolean, error?: string}>}
 */
async function readPackagePullPolicy(base) {
  const root = base.replace(/\/$/, "");
  const ctrl = await fetchJson(`${root}/system_status/package_control.json`);
  if (ctrl.ok) return _officialPullPolicy(ctrl);

  // توافق انتقالي فقط عندما لا يكون المسار الرسمي قد أُنشئ بعد.
  // أخطاء الشبكة وHTTP لا تنتقل إلى المسار القديم، كي يبقى القرار آمنًا.
  if (ctrl.code !== "EMPTY") {
    return { ok: false, error: ctrl.error || "تعذّر قراءة سياسة السحب." };
  }
  return _legacyPullPolicy(await fetchJson(`${root}/system_status/packagePullAllowed.json`));
}

async function showMessage(title, message) {
  const alert = new Alert();
  alert.title = title;
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
}

async function confirmUpdate(fileCount) {
  const alert = new Alert();
  alert.title = "تحديث النظام";
  alert.message =
    "سيتم سحب " + fileCount + " ملفًا من القاعدة.\n" +
    "الملفات المعدَّلة تُستبدل والجديدة تُضاف.\n" +
    "جلسات الدخول المحلية لن تُمس.";
  alert.addAction("ابدأ");
  alert.addCancelAction("إلغاء");
  return (await alert.present()) === 0;
}

async function downloadOne(base, name) {
  const result = await fetchPackageFile(base, name);
  if (!result.ok) return { name: name, ok: false, error: result.error || "فشل السحب" };
  if (!isValidScriptContent(name, result.content)) {
    return { name: name, ok: false, error: "محتوى غير صالح" };
  }
  // لا كتابة على القرص هنا: المحتوى يُحتجز حتى نجاح المجموعة كاملة (تحديث ذرّي).
  return { name: name, ok: true, content: result.content };
}

async function downloadFiles(base, files, storage) {
  const outcomes = [];
  let cursor = 0;
  async function runOne() {
    while (cursor < files.length) {
      const index = cursor;
      cursor++;
      outcomes[index] = await downloadOne(base, files[index]);
    }
  }
  const runners = [];
  const count = Math.min(CONCURRENCY, files.length);
  for (let index = 0; index < count; index++) runners.push(runOne());
  await Promise.all(runners);
  return commitDownloads(outcomes, storage);
}

/**
 * يستخرج معرّف الإصدار من سطر بصمة الملف.
 * @param {string} content
 * @returns {string} المعرّف أو سلسلة فارغة إن غاب السطر.
 */
function extractReleaseId(content) {
  const match = String(content || "").match(/^\/\/ FQ-RELEASE:\s*([^\s|]+)/m);
  return match ? match[1] : "";
}

/**
 * يجرد بصمات الإصدار من نتائج الدفعة، ويجمع أسماء ما لا بصمة له.
 * كان `tsc` يحسب نوع الإرجاع من دالةٍ أخرى، فيُبلغ أن `ids` و`missing`
 * غير موجودتين. (تقرير التدقيق ٢٠٢٦-٠٩-٢٥، الفئة أ.)
 * @param {Array<{ok: boolean, name?: string, content?: string}>} outcomes
 * @returns {{ids: Object<string, number>, missing: string[]}}
 */
function _releaseIdsFromOutcomes(outcomes) {
  /** @type {Object<string, number>} قاموس يعد الملفات لكل معرّف إصدار. */
  const ids = {};
  const missing = [];
  for (let index = 0; index < outcomes.length; index++) {
    const outcome = outcomes[index];
    if (!outcome.ok || !outcome.name || outcome.name.slice(-3) !== ".js") continue;
    const id = extractReleaseId(outcome.content);
    if (!id) missing.push(outcome.name);
    else ids[id] = (ids[id] || 0) + 1;
  }
  return { ids: ids, missing: missing };
}

function _missingReleaseError(missing) {
  const suffix = missing.length > 3 ? " وغيرها" : "";
  return `ملفات بلا بصمة إصدار: ${missing.slice(0, 3).join("، ")}${suffix}`;
}

/**
 * يتحقق أن كل ملفات الدفعة تحمل معرّف إصدار واحدًا.
 * هذه بوابة نزاهة عند التثبيت: الذرية وحدها تمنع التحديث الجزئي لكنها لا تمنع
 * وصول خليط من إصدارين، وهو عطب صامت يصعب تشخيصه بعد وقوعه.
 * ملاحظة صريحة على حدود الحماية: هذا الفحص يكشف الخلط والتلف والحذف، ولا يكشف
 * تزويرًا متعمدًا يعيد كتابة سطر البصمة أيضًا. الحماية الكاملة من ذلك تتطلب
 * مانفستًا موقّعًا بمفتاح عام، وهو خارج قدرات بيئة Scriptable الحالية.
 *
 * كانت هذه الوثيقة مستقرّةً فوق `_releaseIdsFromOutcomes` مع وثيقةٍ ثانية
 * تحتها، فلم تُبلّغ عنها الأدوات. أُعيدت إلى صاحبتها في المرحلة ٥.
 *
 * @param {Array} outcomes
 * @returns {{ok: boolean, error: string, releaseId: string}}
 */
function verifyBatchReleaseConsistency(outcomes) {
  const scan = _releaseIdsFromOutcomes(outcomes);
  const distinct = Object.keys(scan.ids);
  if (scan.missing.length > 0) return { ok: false, error: _missingReleaseError(scan.missing), releaseId: "" };
  if (distinct.length > 1) return { ok: false, error: `اختلاط إصدارات في الدفعة: ${distinct.join("، ")}`, releaseId: "" };
  return { ok: true, error: "", releaseId: distinct[0] || "" };
}

/**
 * تجزئة SHA-256 نقية بجافاسكريبت (FIPS 180-4)، بلا اعتماد على واجهة تجزئة
 * أصيلة — لأن Scriptable لا يوفر أي دالة تجزئة ضمن واجهاته المعتمدة، وقائمة
 * الواجهات المسموحة تمنع اختراع واجهة غير موثقة.
 * @param {string} message نص UTF-8.
 * @returns {string} بصمة سداسية عشرية بطول 64 محرفًا.
 */
const SHA256_K = Object.freeze([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
]);

function _shaRightRotate(value, amount) {
  return (value >>> amount) | (value << (32 - amount));
}

function _appendShaUtf8CodePoint(bytes, code) {
  if (code < 0x80) bytes.push(code);
  else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
  else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
  else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
}

function _shaUtf8Bytes(message) {
  const bytes = [];
  for (let index = 0; index < message.length; index++) {
    const code = message.codePointAt(index);
    if (code > 0xffff) index++;
    _appendShaUtf8CodePoint(bytes, code);
  }
  return bytes;
}

function _shaPad(bytes) {
  const bitLength = bytes.length * 8;
  const padded = bytes.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  for (let index = 7; index >= 0; index--) {
    padded.push(index >= 4 ? 0 : (bitLength >>> (8 * index)) & 0xff);
  }
  return padded;
}

function _shaSchedule(bytes, chunkStart) {
  const words = new Array(64).fill(0);
  for (let index = 0; index < 16; index++) {
    const offset = chunkStart + index * 4;
    words[index] = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
  }
  for (let index = 16; index < 64; index++) {
    const s0 = _shaRightRotate(words[index - 15], 7) ^ _shaRightRotate(words[index - 15], 18) ^ (words[index - 15] >>> 3);
    const s1 = _shaRightRotate(words[index - 2], 17) ^ _shaRightRotate(words[index - 2], 19) ^ (words[index - 2] >>> 10);
    words[index] = (words[index - 16] + s0 + words[index - 7] + s1) | 0;
  }
  return words;
}

function _shaCompress(state, words) {
  let v = state;
  for (let index = 0; index < 64; index++) v = _shaRoundStep(v, index, words[index]);
  return v.map((value, i) => (state[i] + value) | 0);
}

/**
 * جولة واحدة من ضغط SHA-256 على الحالة الثمانية.
 * @param {number[]} v - الحالة [a..h] قبل الجولة
 * @param {number} index - رقم الجولة لاختيار الثابت
 * @param {number} word - كلمة الجدول لهذه الجولة
 * @returns {number[]} الحالة بعد الجولة
 */
function _shaRoundStep(v, index, word) {
  const a = v[0], b = v[1], c = v[2], d = v[3], e = v[4], f = v[5], g = v[6], h = v[7];
  const S1 = _shaRightRotate(e,6) ^ _shaRightRotate(e,11) ^ _shaRightRotate(e,25);
  const ch = (e & f) ^ (~e & g);
  const temp1 = (h + S1 + ch + SHA256_K[index] + word) | 0;
  const S0 = _shaRightRotate(a,2) ^ _shaRightRotate(a,13) ^ _shaRightRotate(a,22);
  const maj = (a & b) ^ (a & c) ^ (b & c);
  const temp2 = (S0 + maj) | 0;
  return [(temp1 + temp2) | 0, a, b, c, (d + temp1) | 0, e, f, g];
}

// ═══ ثمانيةُ محارف بلا padStart ═══
// `padStart` من ECMAScript 2017، ووثائق Scriptable تضمن ES6 وحده:
// «Scriptable uses Apple's JavaScriptCore, which supports ECMAScript 6».
// <https://docs.scriptable.app/>
// فبدل رفع `lib` في `jsconfig.json` — وهو إخفاءٌ للخطأ لا معالجةٌ له —
// يُكتَب المكافئ بـ ES5/ES6. (قرار المالك ٢٠٢٦-٠٩-٢٥.)
function _hex8(value) {
  let out = (value >>> 0).toString(16);
  while (out.length < 8) out = "0" + out;
  return out;
}

function _shaHex(state) {
  return state.map((value) => _hex8(value)).join("");
}

function sha256Hex(message) {
  const bytes = _shaPad(_shaUtf8Bytes(message));
  let state = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
    state = _shaCompress(state, _shaSchedule(bytes, chunkStart));
  }
  return _shaHex(state);
}

/**
 * يتحقق من بصمة كل ملف منزَّل مقابل fq_release_manifest.js إن وصل ضمن نفس
 * الدفعة. هذا يكشف ملفًا مبدَّلًا وسط دفعة تحوي مانفستًا شرعيًا؛ لا يكشف
 * تزويرًا يعيد كتابة المانفست نفسه أيضًا — تلك حماية كاملة تحتاج توقيعًا
 * بمفتاح عام، خارج قدرات بيئة Scriptable الحالية، وتبقى فجوة موثَّقة صراحة.
 * @param {Array} outcomes
 * @returns {{ok: boolean, error: string, checked: number}}
 */
function verifyBatchFileHashes(outcomes) {
  const manifestOutcome = outcomes.filter((o) => o.name === "fq_release_manifest.js")[0];
  if (!manifestOutcome) return { ok: true, error: "", checked: 0 };
  const expected = _expectedHashes(manifestOutcome.content);
  if (!expected) return { ok: false, error: "تعذر قراءة بصمات المانفست المنزَّل", checked: 0 };
  const scan = _hashMismatches(outcomes, expected);
  if (scan.mismatched.length > 0) {
    return { ok: false, error: `بصمة غير مطابقة: ${_namesHead(scan.mismatched)}`, checked: scan.checked };
  }
  return { ok: true, error: "", checked: scan.checked };
}

/**
 * يستخرج بصمات المانفست المنزَّل: اسم الملف ← sha256.
 * @param {string} manifestContent
 * @returns {Object<string, string>|null} null إن لم تُعثر كتلة البصمات
 */
function _expectedHashes(manifestContent) {
  const match = manifestContent.match(/const FILE_HASHES = Object\.freeze\(\{([\s\S]*?)\}\);/);
  if (!match) return null;
  const expected = {};
  const entryPattern = /"([^"]+\.js)":\s*"([0-9a-f]{64})"/g;
  let entry;
  while ((entry = entryPattern.exec(match[1])) !== null) expected[entry[1]] = entry[2];
  return expected;
}

/**
 * يقارن بصمة كل ملف في الدفعة بما في المانفست، ويجمع المخالفين.
 * @param {Array} outcomes
 * @param {Object<string, string>} expected
 * @returns {{checked: number, mismatched: string[]}}
 */
function _hashMismatches(outcomes, expected) {
  const mismatched = [];
  let checked = 0;
  for (let index = 0; index < outcomes.length; index++) {
    const outcome = outcomes[index];
    if (!outcome.ok || !expected[outcome.name]) continue;
    checked++;
    if (sha256Hex(outcome.content) !== expected[outcome.name]) mismatched.push(outcome.name);
  }
  return { checked: checked, mismatched: mismatched };
}

/**
 * أول ثلاثة أسماء في نص الخطأ، مع «وغيرها» إن زادت.
 * @param {string[]} names
 * @returns {string}
 */
function _namesHead(names) {
  return names.slice(0, 3).join("، ") + (names.length > 3 ? " وغيرها" : "");
}

/**
 * يكتب الملفات على القرص فقط بعد نجاح تنزيل المجموعة كاملة.
 * أي فشل تنزيل واحد يُلغي الكتابة كليًا ويُبقي الإصدار القديم سليمًا.
 *
 * كانت هذه الوثيقة مستقرّةً فوق `extractReleaseId` — أي على بُعد نحو مئتي سطر
 * من صاحبتها، ملتصقةً بوثيقةٍ أخرى فلم تُبلّغ عنها الأدوات. وهو نمط الدرس ٣٥
 * نفسه الذي أعمى الأدوات في ٣٥ موضعًا في ٢٠٢٦-٠٩-٢٥. أُعيدت إلى مكانها.
 *
 * @param {Array} outcomes
 * @param {{fm: FileManager, dir: string}} storage
 * @returns {Array}
 */
function commitDownloads(outcomes, storage) {
  if (outcomes.some((outcome) => !outcome.ok)) return _atomicFailure(outcomes);
  const consistency = verifyBatchReleaseConsistency(outcomes);
  if (!consistency.ok) return _rejectBatch(outcomes, consistency);
  const hashCheck = verifyBatchFileHashes(outcomes);
  if (!hashCheck.ok) return _rejectBatch(outcomes, hashCheck);
  return _writeAll(outcomes, storage);
}

/**
 * نتيجة الدفعة حين فشل تنزيل ملف: الفاشل بخطئه، والباقي بسبب الإلغاء.
 * @param {Array} outcomes
 * @returns {Array}
 */
function _atomicFailure(outcomes) {
  return outcomes.map((outcome) => {
    if (!outcome.ok) return { name: outcome.name, ok: false, error: outcome.error };
    return { name: outcome.name, ok: false, error: "أُلغيت الكتابة لفشل ملف آخر (تحديث ذرّي)" };
  });
}

/**
 * يُلغي الدفعة كلها بعد رفض التحقق، ويسجّل سببه على وحدة التحكم.
 * @param {Array} outcomes
 * @param {{error: string}} failure
 * @returns {Array}
 */
function _rejectBatch(outcomes, failure) {
  console.error(`[fq_bootstrap] ${failure.error}`);
  return outcomes.map((outcome) => ({ name: outcome.name, ok: false, error: `أُلغيت الكتابة: ${failure.error}` }));
}

/**
 * يكتب كل ملف في مساحة السكربتات بعد نجاح التحقق.
 * @param {Array} outcomes
 * @param {{fm: FileManager, dir: string}} storage
 * @returns {Array}
 */
function _writeAll(outcomes, storage) {
  return outcomes.map((outcome) => {
    if (!writeScriptFile(storage, outcome.name, outcome.content)) {
      return { name: outcome.name, ok: false, error: "تعذرت كتابة الملف" };
    }
    return { name: outcome.name, ok: true };
  });
}

async function showInstallReport(outcomes, storageLabel) {
  const failed = outcomes.filter((outcome) => !outcome.ok);
  const okCount = outcomes.length - failed.length;
  const alert = new Alert();
  alert.title = failed.length === 0 ? "اكتمل التحديث" : "تحديث جزئي";
  alert.message =
    "نجاح: " + okCount + " / " + outcomes.length +
    "\nحُفظت الملفات في مساحة سكربتات " + storageLabel + "." +
    "\n\nشغّل fq_main ثم ادخل برقمك وكلمة المرور." +
    _failureNote(failed);
  alert.addAction("حسنًا");
  await alert.present();
}

/**
 * قائمة الملفات الفاشلة في التقرير: ثمانية كحدّ، ثم «…» إن زادت.
 * @param {Array} failed
 * @returns {string}
 */
function _failureNote(failed) {
  if (failed.length === 0) return "";
  const lines = failed.slice(0, 8).map((item) => `${item.name} (${item.error})`);
  return `\n\nفشل:\n${lines.join("\n")}` + (failed.length > 8 ? "\n…" : "");
}

async function installOrUpdate() {
  localInstallOperation = UUID.string();
  localDiagnostics.record("operation", { operationId: localInstallOperation, action: "fq_bootstrap", phase: "start", status: "running", descriptionAr: "بدأ سكربت تحديث الحزمة" });
  const base = await _resolveBase();
  if (base === null) return;
  const files = await _pullableFiles(base);
  if (files === null) return;
  if (!(await confirmUpdate(files.length))) return;
  const storage = await _storageOrMessage();
  if (!storage) return;
  await showInstallReport(await downloadFiles(base, files, storage), storage.label);
}

/**
 * يحلّ رابط القاعدة ويتحقق منه ويحفظه، ويعرض الرسالة عند الفشل.
 * @returns {Promise<string|null>} الرابط، أو null إن توقّف التثبيت
 */
async function _resolveBase() {
  const base = await resolveFirebaseUrl();
  if (base == null || base.indexOf("http") !== 0) {
    await showMessage("توقف", "رابط القاعدة غير صالح.");
    return null;
  }
  if (!persistFirebaseUrl(base)) {
    await showMessage("تعذر التهيئة", "تعذّر حفظ إعداد اتصال قاعدة البيانات على هذا الجهاز.");
    return null;
  }
  return base;
}

/**
 * يتحقق من سماح السحب من القاعدة، ويعرض سبب المنع إن وُجد.
 * @param {string} base
 * @returns {Promise<boolean>}
 */
async function _pullAllowed(base) {
  const pullPolicy = await readPackagePullPolicy(base);
  if (!pullPolicy.ok) {
    await showMessage(
      "تعذر التحقق",
      "لم يمكن التحقق من سماح سحب الملفات. لم يبدأ أي تنزيل.\nأعد المحاولة عند استقرار الاتصال."
    );
    return false;
  }
  if (!pullPolicy.allowed) {
    await showMessage("السحب موقوف", "أوقف المطوّر سحب ملفات النظام من القاعدة.\nراجع المطوّر عند الحاجة.");
    return false;
  }
  return true;
}

/**
 * قائمة ملفات الحزمة بعد التحقق من السماح، أو null إن توقّف التثبيت.
 * @param {string} base
 * @returns {Promise<string[]|null>}
 */
async function _pullableFiles(base) {
  if (!(await _pullAllowed(base))) return null;
  const files = await loadManifestFiles(base);
  if (files.length === 0) {
    await showMessage("لا حزمة", "لم يُعثر على بيان نشر. اطلب من المطوّر تشغيل fq_publish أولًا.");
    return null;
  }
  return files;
}

/**
 * مساحة السكربتات، أو null بعد عرض رسالة الخطأ.
 * @returns {Promise<{fm: FileManager, dir: string, label: string}|null>}
 */
async function _storageOrMessage() {
  const storage = resolveScriptStorage();
  if (!storage) await showMessage("تعذر التثبيت", "تعذّر الوصول إلى مساحة سكربتات Scriptable على هذا الجهاز.");
  return storage;
}

try {
  await installOrUpdate();
} catch (error) {
  localDiagnostics.recordError(error, { action: "fq_bootstrap" });
  console.error(`[fq_bootstrap] fatal ${error.message}`);
  await showMessage("تعذر التحديث", error.message || "حدث خطأ غير متوقع.");
} finally {
  localDiagnostics.record("operation", { operationId: localInstallOperation, action: "fq_bootstrap", phase: "end", status: "returned", descriptionAr: "انتهى السكربت؛ لا يدل ذلك وحده على نجاح التثبيت" });
  localDiagnostics.flush();
  Script.complete();
}
