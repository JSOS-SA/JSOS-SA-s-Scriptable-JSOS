// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: building;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_add_airport.js

/**
 * @module fq_add_airport
 * @description إضافة وجهة جديدة (رمز/مدينة/دولة) دائمة إلى fq_airports.js
 * من داخل القائمة الجانبية، مع كتابة آمنة (نسخة احتياطية + كتابة مؤقتة +
 * استبدال + تحقق + تراجع تلقائي عند الفشل) وتحديث فوري في الذاكرة الحية
 * بلا انتظار إعادة تشغيل — استنادًا حصريًا لوثائق Scriptable الرسمية:
 * module.filename (docs.scriptable.app/module) وFileManager
 * (docs.scriptable.app/filemanager)، ونمط كشف iCloud الموثّق مجتمعيًا.
 */

/**
 * يحدد مسارات ملف المطارات والنسخة الاحتياطية والملف المؤقت، ونوع
 * FileManager الصحيح (محلي أو iCloud) دون تخمين — عبر فحص module.filename
 * الخاص بهذه الوحدة نفسها (تعيش في نفس مجلد fq_airports.js حتمًا).
 * @returns {{fm:FileManager, path:string, bakPath:string, tmpPath:string}}
 */
function _airportPaths() {
  const useIcloud = module.filename.indexOf("Documents/iCloud~") !== -1;
  const fm = useIcloud ? FileManager.iCloud() : FileManager.local();
  const myDir = module.filename.substring(0, module.filename.lastIndexOf("/"));
  const path = fm.joinPath(myDir, "fq_airports.js");
  const bakPath = `${path}.bak`;
  const tmpPath = `${path}.new`;
  return { fm, path, bakPath, tmpPath };
}

/**
 * يتحقق من صحة حقول الوجهة الثلاثة قبل أي محاولة كتابة.
 * @param {string} code - رمز الوجهة (يُتوقع 3 أحرف لاتينية)
 * @param {string} city - اسم المدينة
 * @param {string} country - اسم الدولة
 * @returns {{valid:boolean, error:string, code:string}}
 */
function _validateAirportInput(code, city, country) {
  const up = String(code || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(up)) {
    return { valid: false, error: "رمز الوجهة يجب أن يكون 3 أحرف لاتينية فقط (مثال: JED)", code: up };
  }
  if (!String(city || "").trim()) {
    return { valid: false, error: "اسم المدينة مطلوب", code: up };
  }
  if (!String(country || "").trim()) {
    return { valid: false, error: "اسم الدولة مطلوب", code: up };
  }
  return { valid: true, error: "", code: up };
}

/**
 * يدرج سطر رحلة جديد قبل آخر "};" المُغلقة لكائن AIRPORTS مباشرة،
 * بلا مساس بأي حرف آخر في الملف (تعليقات التقسيم الإقليمية محفوظة كاملة).
 * @param {string} content - محتوى fq_airports.js الحالي كاملاً
 * @param {AirportEntry} entry - الوجهة بعد التحقق
 * @returns {string|null} المحتوى الجديد، أو null إن لم تُوجد نقطة الارتساء المتوقعة
 */
function _insertAirportEntry(content, entry) {
  const anchor = "};\n\nmodule.exports = { AIRPORTS };";
  const anchorIndex = content.lastIndexOf(anchor);
  if (anchorIndex === -1) return null;
  const cSafe = String(entry.city).replace(/"/g, '\\"');
  const dSafe = String(entry.country).replace(/"/g, '\\"');
  const newLine = `  ${entry.code}: { d: "${dSafe}", c: "${cSafe}" },\n`;
  return content.slice(0, anchorIndex) + newLine + content.slice(anchorIndex);
}

/**
 * يُعيد ملف المطارات من نسخته الاحتياطية عند فشل الكتابة.
 * @param {Object} paths - مخرجات _airportPaths()
 * @returns {void}
 */
function _rollbackAirportsFile(paths) {
  const { fm, path, bakPath } = paths;
  try {
    if (!fm.fileExists(bakPath)) return;
    if (fm.fileExists(path)) fm.remove(path);
    fm.copy(bakPath, path);
  } catch (error) {
    console.error(`فشل التراجع أيضًا: ${error.message}`);
  }
}

/**
 * يحفظ نسخة احتياطية، ويكتب ملفًا مؤقتًا، ثم يستبدل به الملف دفعة واحدة. يرمي عند أي فشل،
 * والتراجع عند المستدعي.
 * @param {Object} paths - مخرجات _airportPaths()
 * @param {string} newContent - النص الكامل الجديد للملف
 * @returns {void}
 */
function _replaceWithBackup(paths, newContent) {
  const { fm, path, bakPath, tmpPath } = paths;
  if (fm.fileExists(bakPath)) fm.remove(bakPath);
  fm.copy(path, bakPath);
  if (fm.fileExists(tmpPath)) fm.remove(tmpPath);
  fm.writeString(tmpPath, newContent);
  fm.move(tmpPath, path);
}

/**
 * كتابة آمنة لملف المطارات: نسخة احتياطية، كتابة لملف مؤقت، استبدال
 * دفعة واحدة عبر move (يستبدل الوجهة بأمان خلافًا لـ copy التي تفشل إن
 * كانت الوجهة موجودة — موثَّق رسميًا)، ثم تحقق نصي، وتراجع فوري عند الفشل.
 * (نُقلت هذه الوثيقة إلى صاحبها في ٢٠٢٦-٠٩-٢٥: كانت فوق دالةٍ أُدخِلت
 *  بينها وبين الدالة التي تصفها، والوثيقة الكاذبة تُعمي أدوات الفحص لا
 *  القارئَ وحده. تقرير التدقيق ٢٠٢٦-٠٩-٢٥، الفئة أ.)
 * @param {Object} paths - مخرجات _airportPaths()
 * @param {string} newContent - النص الكامل الجديد للملف
 * @param {string} expectedMarker - نص يجب أن يظهر في الملف بعد الكتابة للتحقق
 * @returns {{success:boolean, error:string}}
 */
function _writeAirportsFileSafe(paths, newContent, expectedMarker) {
  try {
    _replaceWithBackup(paths, newContent);
    const verify = paths.fm.readString(paths.path);
    if (!verify || verify.indexOf(expectedMarker) === -1) throw new Error("فشل التحقق بعد الكتابة");
    return { success: true, error: "" };
  } catch (error) {
    _rollbackAirportsFile(paths);
    return { success: false, error: error.message };
  }
}

/**
 * وجهة بعد التحقق: الرمز بحروف كبيرة، والمدينة والدولة بلا فراغ في الطرفين.
 * @typedef {{code: string, city: string, country: string}} AirportEntry
 */

/** @returns {{success: boolean, message: string, code: string}} نتيجة فشل. */
function _airportFailure(code, message) {
  return { success: false, message: message, code: code };
}

/**
 * يقرأ ملف المطارات ويدرج الوجهة ويكتبه بأمان.
 * @param {AirportEntry} entry - الوجهة
 * @returns {Promise<string>} سبب الفشل للموظف، أو نص فارغ عند النجاح
 */
async function _writeAirportEntry(entry) {
  const paths = _airportPaths();
  if (!paths.fm.fileExists(paths.path)) return "تعذّر إيجاد ملف الوجهات في المسار المتوقع";
  await paths.fm.downloadFileFromiCloud(paths.path);
  const updated = _insertAirportEntry(paths.fm.readString(paths.path), entry);
  if (!updated) return "تعذّر تحديد موضع الإدراج في الملف — لم يُكتب شيء";
  const result = _writeAirportsFileSafe(paths, updated, `${entry.code}: { d: "`);
  return result.success ? "" : `فشلت الكتابة الآمنة: ${result.error}`;
}

/**
 * الدالة الرئيسية: تتحقق، تقرأ، تُدرج، تكتب بأمان، ثم تُحدّث الكائن الحي
 * airportsModule.AIRPORTS في الذاكرة فورًا (بلا انتظار أي إعادة استيراد).
 * @param {{code: string, city: string, country: string}} input - ما أدخله الموظف كما وصل من الصفحة
 * @param {Object} airportsModule - الوحدة المستوردة عبر importModule("fq_airports")
 * @returns {Promise<{success:boolean, message:string, code:string}>}
 */
async function addAirportDestination(input, airportsModule) {
  const v = _validateAirportInput(input.code, input.city, input.country);
  if (!v.valid) return _airportFailure(v.code, v.error);
  if (airportsModule.AIRPORTS[v.code]) {
    return _airportFailure(v.code, `الرمز ${v.code} مسجَّل مسبقًا في ملف الوجهات`);
  }

  const entry = { code: v.code, city: String(input.city).trim(), country: String(input.country).trim() };
  const failure = await _writeAirportEntry(entry);
  if (failure) return _airportFailure(v.code, failure);

  // تحديث فوري في الذاكرة الحية — يظهر في الصفحة التالية بلا انتظار
  airportsModule.AIRPORTS[v.code] = { d: entry.country, c: entry.city };
  return { success: true, message: `أُضيفت الوجهة ${v.code} بنجاح`, code: v.code };
}

/**
 * هيكل نموذج إضافة الوجهة — يُحقن داخل addAirportSlot بالقائمة الجانبية.
 * @returns {string}
 */
function getAddAirportHtml() {
  return `
<div class="af-wrap">
  <button class="af-toggle" id="apToggle">
    <span class="af-ic">+</span>
    <span>إضافة وجهة جديدة</span>
  </button>
  <div class="af-form" id="airportForm">
    <div class="af-field">
      <label>رمز الوجهة</label>
      <input type="text" id="apCode" placeholder="JED"
        maxlength="3" autocomplete="off" dir="ltr" style="text-transform:uppercase">
    </div>
    <div class="af-field">
      <label>اسم المدينة</label>
      <input type="text" id="apCity" placeholder="جدة" autocomplete="off" dir="rtl">
    </div>
    <div class="af-field">
      <label>اسم الدولة</label>
      <input type="text" id="apCountry" placeholder="السعودية" autocomplete="off" dir="rtl">
    </div>
    <button class="af-submit" id="apSubmit">حفظ الوجهة في الملف</button>
    <div id="apStatus" style="font-size:12px;margin-top:6px;color:var(--t2)"></div>
  </div>
</div>`;
}

/**
 * لا حاجة لأنماط جديدة — إعادة استخدام كاملة لأصناف af-input/lf-btn
 * الموجودة عالميًا في fq_styles.js.
 * @returns {string}
 */
function getAddAirportStyles() {
  return "";
}

/**
 * الكود المحقون: تحقق أولي في المتصفح (تجربة أسرع للمستخدم)، ثم تمرير
 * البيانات للسكربت الأم عبر _FQ_ACTION/_FQ_NEW_AIRPORT — الكتابة الفعلية
 * للملف تتطلب FileManager وهي متاحة فقط في السكربت الأم، فلا مفر من
 * إغلاق الصفحة هنا (خلافًا لحذف كايا الذي لا يحتاج FileManager إطلاقًا).
 * @returns {string}
 */
function getAddAirportCode() {
  return getAddAirportCodePart1() +
    getAddAirportCodePart2();
}

/** الجزء 1 من 2 من نصّ `getAddAirportCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddAirportCodePart1() {
  return `
let apToggle  = document.getElementById("apToggle");
const apForm    = document.getElementById("airportForm");
let apCode    = document.getElementById("apCode");
let apCity    = document.getElementById("apCity");
let apCountry = document.getElementById("apCountry");
let apSubmit  = document.getElementById("apSubmit");
let apStatus  = document.getElementById("apStatus");

// طي/فتح — نفس منطق afToggle في نموذج إضافة رحلة حرفيًا
if(apToggle){apToggle.addEventListener("click",function(){
  const isOpen=apForm.classList.contains("open");
  if(isOpen){
    apForm.classList.remove("open");
    apToggle.classList.remove("open");
  }else{
    apForm.classList.add("open");
    apToggle.classList.add("open");
    apCode.focus();
  }
})}

function _apShowStatus(msg,isError){
  if(!apStatus)return;
  apStatus.textContent=msg;
  apStatus.style.color=isError?"#E50914":"#16a34a";
}

// حقول النموذج منقّاة: الرمز بحروف كبيرة، والمدينة والدولة بلا فراغ طرفيّ.
function _apReadForm(){
  return {
    code:(apCode&&apCode.value||"").trim().toUpperCase(),
    city:(apCity&&apCity.value||"").trim(),
    country:(apCountry&&apCountry.value||"").trim()
  };
}
`;
}

/** الجزء 2 من 2 من نصّ `getAddAirportCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getAddAirportCodePart2() {
  return `
// رسالة أول خطأ في الحقول، و"" إن صحّت كلها.
function _apFormError(f){
  if(!/^[A-Z]{3}$/.test(f.code))return "رمز الوجهة يجب أن يكون 3 أحرف لاتينية (مثال: JED)";
  if(!f.city)return "اسم المدينة مطلوب";
  if(!f.country)return "اسم الدولة مطلوب";
  if(typeof AIRPORTS!=="undefined"&&AIRPORTS[f.code])return "الرمز "+f.code+" مسجَّل مسبقًا";
  return "";
}

if(apSubmit){apSubmit.addEventListener("click",function(){
  const f=_apReadForm();
  const err=_apFormError(f);
  if(err){_apShowStatus(err,true);return}
  _apShowStatus("جارٍ الحفظ في الملف…",false);
  window._FQ_ACTION="add_airport";
  window._FQ_NEW_AIRPORT=JSON.stringify({code:f.code,city:f.city,country:f.country});
  apSubmit.disabled=true;
  setTimeout(function(){
    window.close();
  },400);
})}
`;
}

class AppCoordinator {
  static async boot() {
    // وحدة مورّدة نصوص ودوال قراءة/كتابة فقط — لا إجراء إقلاع فعلي مطلوب هنا
  }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((e) => console.error(e)); } catch (e) { console.error(e); }

module.exports = Object.freeze({
  addAirportDestination,
  getAddAirportHtml,
  getAddAirportStyles,
  getAddAirportCode,
});
