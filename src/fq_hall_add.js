// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: building;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_hall_add.js

const { AIRPORTS } = importModule("fq_airports");
const helpers = importModule("fq_helpers");
const statusEnum = importModule("fq_enum_status");

/**
 * @module fq_hall_add
 * @description ثلاثة أقسام مستقلة داخل تيوب كايا لإضافة رحلات "صالة 1" و"الصالة الشمالية" و"صالة 4"
 * مباشرة إلى نظام الرحلات (DATA)، مع فرض حقل terminal صراحة بحسب زر الاستخراج
 * الذي بدأ العملية — بلا اعتماد على الكشف التلقائي لفلتر كايا، ولمنع أي دمج
 * بين الأقسام. حقل terminal هذا يُفعّل تلقائيًا دالة _applyTerminalLogic
 * الموجودة مسبقًا وبلا تعديل في fq_reg_form.js (تُعيّن التفويج "خاطئ صالة 1"
 * أو "خاطئ الصالة الشمالية" عند العثور على رقم الرحلة في تيوب التسجيل).
 * طبقة عرض القوائم تُعيد استخدام buildMiniRow() من fq_search.js حرفيًا
 * لضمان نفس تصميم وبيانات تيوب جداول تمامًا (بما فيها العدّ التنازلي الحي).
 */

/**
 * يحوّل نتائج استخراج كايا الخام (fetchLiveFlights) إلى كائنات رحلة متوافقة
 * مع عقد البيانات المجمّد (al, flt, to, std)، مع فرض حقل الصالة صراحة.
 * إذا مُرِّر تاريخ صريح من تقويم القسم يُستخدم بدل الحساب التلقائي — لدعم
 * استخراج نفس الصالة بتواريخ مختلفة بلا حذف أي رحلات سابقة (مفاتيح منفصلة).
 * الوجهة تُحل من رمز IATA إن وُجد، وإلا من مطابقة الاسم العربي على قاموس
 * المطارات، وإلا يُستخدم الاسم العربي الخام نفسه — لا تُتجاوز أي رحلة فيها
 * رقم رحلة ووقت فقط بسبب غياب رمز IATA (السبب الفعلي للنقص الكبير المُبلَّغ).
 * @param {Object} rawFlight - رحلة خام واحدة من fetchLiveFlights()
 * @param {string} terminalKey - "t1" أو "north" أو "hall4"
 * @param {string} [useDate] - تاريخ صريح بصيغة YYYY-MM-DD من تقويم القسم
 * @returns {Object|null} الرحلة المبنيّة، أو null إن نقص رقمها أو وقتها
 */
function _buildHallFlight(rawFlight, terminalKey, useDate) {
  if (!rawFlight.flight || !rawFlight.time) return null;
  const destination = _hallResolveDest(rawFlight);
  if (!destination) return null;

  const when = useDate
    ? _hallDateFromExplicit(useDate, rawFlight.time)
    : _hallDateFromTime(rawFlight.time);
  const built = {
    al: rawFlight.airline || rawFlight.flight.substring(0, 2),
    flt: rawFlight.flight,
    to: destination,
    std: rawFlight.time,
    type: "KAIA",
    dpax: "",
    date: when.date,
    depTime: when.depTime,
    terminal: terminalKey,
    _src: "kaia_" + terminalKey,
  };
  // الحالة لا تُكتب إلا إن أعلنها المطار — حقلٌ فارغ في كل سطر تراكمُ بيانات
  const statusKey = _hallSiteStatus(rawFlight.status);
  if (statusKey) built._status = statusKey;
  return built;
}

// كلمات الحالة التي يلتقطها كاشط الموقع (STATUS_KEYWORDS في fq_live_scrape)
// مترجمةً إلى مفاتيح fq_enum_status. وما سواها (إركاب، البوابة، غادرت…)
// ليس تغييرًا في الجدول فلا يُحمل.
const _KAIA_STATUS = Object.freeze({
  "ملغاة": "canceled", "مُلغاة": "canceled", "Cancelled": "canceled",
  "متأخرة": "delayed", "مُتأخرة": "delayed", "Delayed": "delayed",
});

/**
 * مفتاح حالة المطار من كلمة الكاشط، أو "" لما لا يغيّر الجدول.
 * @param {string} word
 * @returns {string}
 */
function _hallSiteStatus(word) {
  return Object.prototype.hasOwnProperty.call(_KAIA_STATUS, word || "") ? _KAIA_STATUS[word] : "";
}

/**
 * يبني قائمة رحلات الصالة من النتائج الخام، ويعدّ ما تُجوز عنه.
 * (نُقلت هذه الوثيقة إلى صاحبها في ٢٠٢٦-٠٩-٢٥: كانت فوق دالةٍ أُدخِلت
 *  بينها وبين الدالة التي تصفها. تقرير التدقيق، الفئة أ.)
 * @param {Array} rawFlights - نتائج fetchLiveFlights() الخام
 * @param {string} terminalKey - "t1" أو "north" أو "hall4"
 * @param {string} [hallDate] - تاريخ صريح بصيغة YYYY-MM-DD من تقويم القسم
 * @returns {{flights:Array, skipped:number}}
 */
function buildHallFlights(rawFlights, terminalKey, hallDate) {
  const flights = [];
  let skipped = 0;
  if (!(rawFlights && rawFlights.length)) return { flights, skipped };

  const useDate = /^\d{4}-\d{2}-\d{2}$/.test(hallDate || "") ? hallDate : null;
  for (let i = 0; i < rawFlights.length; i++) {
    const flight = _buildHallFlight(rawFlights[i], terminalKey, useDate);
    if (flight) flights.push(flight);
    else skipped++;
  }
  return { flights, skipped };
}

/**
 * يحل وجهة الرحلة بأفضل مصدر متاح بالترتيب: رمز IATA المستخرج مباشرة من
 * البطاقة، وإلا مطابقة الاسم العربي (destName) على قاموس المطارات، وإلا
 * الاسم العربي الخام نفسه كما هو (يبقى قابلاً للعرض عبر _destCountryName
 * في تيوب التسجيل حتى بلا رمز مطابق — أفضل من إسقاط الرحلة بالكامل).
 * @param {Object} f - كائن رحلة خام من extractFromCard داخل fq_live.js
 * @returns {string}
 */
function _hallResolveDest(f) {
  if (f.dest) return f.dest.toUpperCase();
  if (f.destName) {
    const matched = _hallResolveByName(f.destName);
    return matched || f.destName;
  }
  return "";
}

/**
 * يطابق اسم مدينة عربي على قاموس المطارات (حقل c) — مطابقة تامة أو جزئية.
 * @param {string} name
 * @returns {string} رمز المطار إن وُجدت مطابقة، وإلا سلسلة فارغة
 */
function _hallResolveByName(name) {
  const clean = String(name || "").trim();
  if (!clean) return "";
  for (const code in AIRPORTS) {
    const c = AIRPORTS[code].c;
    if (c === clean || clean.indexOf(c) === 0 || c.indexOf(clean) === 0) return code;
  }
  return "";
}

/**
 * يبني تاريخ ووقت المغادرة من تاريخ صريح (من تقويم القسم) ووقت HH:MM.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:MM
 * @returns {{date:string, depTime:Date}}
 */
function _hallDateFromExplicit(dateStr, timeStr) {
  const parts = String(timeStr).split(":");
  const dParts = dateStr.split("-").map(Number);
  const dep = new Date(dParts[0], dParts[1] - 1, dParts[2],
    parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0);
  return { date: dateStr, depTime: dep };
}

/**
 * يحسب تاريخ ووقت المغادرة الكامل من وقت HH:MM فقط، بنفس أسلوب الإضافة
 * اليدوية الحالية في fq_addflight.js (يدوّر لليوم التالي إذا فات الوقت اليوم).
 * @param {string} timeStr - وقت بصيغة HH:MM
 * @returns {{date:string, depTime:Date}}
 */
function _hallDateFromTime(timeStr) {
  const now = new Date();
  const parts = String(timeStr).split(":");
  const dep = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
    parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0);
  if (dep.getTime() < Date.now()) dep.setDate(dep.getDate() + 1);
  return { date: _hallFmtDate(dep), depTime: dep };
}

/** @param {Date} d @returns {string} */
function _hallFmtDate(d) {
  return `${d.getFullYear()}-${(`0${d.getMonth() + 1}`).slice(-2)}-${(`0${d.getDate()}`).slice(-2)}`;
}

/**
 * حالة السطر بعد التحديث: ما أعلنه المطار يغلب. فإن لم يعلن شيئًا زالت
 * حالةٌ كان المطار مصدرها (ملغاة أو متأخرة)، وبقيت حالةٌ وضعها الموظف يدويًّا.
 * @param {string} before - حالة السطر الحالية
 * @param {string} fromSite - حالة المطار في هذا الجلب
 * @returns {string}
 */
function _hallNextStatus(before, fromSite) {
  if (fromSite) return fromSite;
  return statusEnum.SITE_STATUSES.indexOf(before) !== -1 ? "" : before;
}

/**
 * يطبّق جلب المطار على سطر موجود: الوقت في السطر نفسه، والحالة.
 * لا يلمس غيرهما، ويبقى `_fbKey` فينقل الحفظ السجلّ إلى مفتاحه الجديد.
 * ورحلةٌ عدّلها موظف يدويًّا يبقى وقتها كما كتبه — قرار المالك ٢٠٢٦-٠٩-٣٠:
 * «التعديل اليدوي يغلب». والحالة تُحدَّث لها كغيرها.
 * @param {Object} current - السطر الحالي
 * @param {Object} fresh - الرحلة نفسها كما جاءت من الموقع
 * @returns {{flight:Object, rescheduled:boolean, newStatus:string, cleared:string}}
 *   `cleared` = الحالة التي زالت في هذا الجلب (`"canceled"` أو `"delayed"`)، وفارغ إن لم تزل حالة.
 *   زوالها تغيير يُحفظ ويُعلَم به الموظف (قرار المالك ٢٠٢٦-١٠-١١).
 */
function _hallApplyUpdate(current, fresh) {
  const next = Object.assign({}, current);
  const rescheduled = fresh.std !== current.std && !helpers.isManualEdit(current);
  if (rescheduled) {
    next.std = fresh.std;
    next.depTime = fresh.depTime;
  }
  const before = current._status || "";
  const after = _hallNextStatus(before, fresh._status || "");
  if (after) next._status = after;
  else delete next._status;
  return {
    flight: next, rescheduled: rescheduled,
    newStatus: after !== before ? after : "",
    cleared: before && !after ? before : "",
  };
}

// فهرس مواضع رحلات الصالات في القائمة: الموضع ← رقم السطر.
function _hallSlotIndex(list) {
  const slots = {};
  for (let i = 0; i < list.length; i++) {
    const slot = helpers.flightSlot(list[i]);
    if (slot) slots[slot] = i;
  }
  return slots;
}

// شكل نتيجة الزرّين واحد، فالإشعار يقرأ الأعداد نفسها ولا يسأل أيّ زرّ ضُغط.
function _hallEmptyResult(merged) {
  return {
    merged: merged, added: 0, duplicates: 0, rescheduled: 0, canceled: 0, delayed: 0, skippedNew: 0,
    cleared: 0, clearedCanceled: 0, clearedDelayed: 0,
  };
}

/**
 * زرّ «إضافة» — مهمّة واحدة: يضيف الرحلات الجديدة ولا يلمس رحلةً موجودة.
 * «موجودة» = موضعها (`flightSlot`، بلا وقت) في الجدول، فرحلةٌ تغيّر موعدها
 * لا تُضاف سطرًا ثانيًا — تحديثها مهمّة زرّ التحديث. قرار المالك ٢٠٢٦-٠٩-٢٨:
 * «كل زر يعمل بمهمة واحدة».
 * @param {Array} existing - الرحلات الحالية (DATA الحيّة من الصفحة الرئيسية)
 * @param {Array} additions - رحلات الصالة من buildHallFlights
 * @returns {{merged:Array, added:number, duplicates:number, rescheduled:number, canceled:number, delayed:number, skippedNew:number, cleared:number, clearedCanceled:number, clearedDelayed:number}}
 *   `duplicates` = رحلات موجودة تُركت كما هي.
 */
function addHallFlights(existing, additions) {
  const merged = (existing || []).slice();
  const state = { slots: _hallSlotIndex(merged), out: _hallEmptyResult(merged) };
  for (let j = 0; j < additions.length; j++) _hallAddOne(state, additions[j]);
  return state.out;
}

/**
 * رحلة واحدة لزرّ «إضافة»: موضعها مشغول ← موجودة تُترك، وإلا تُضاف ويُحجز موضعها.
 * @param {{slots:Object, out:Object}} state - فهرس المواضع ونتيجة الدمج قيد البناء
 * @param {Object} flight
 */
function _hallAddOne(state, flight) {
  const slot = helpers.flightSlot(flight);
  if (Object.prototype.hasOwnProperty.call(state.slots, slot)) { state.out.duplicates++; return; }
  state.slots[slot] = state.out.merged.length;
  state.out.merged.push(flight);
  state.out.added++;
}

/**
 * زرّ «تحديث» — مهمّة واحدة: يحدّث الرحلات الموجودة في سطرها (الوقت،
 * و«ملغاة» و«متأخرة») ولا يضيف رحلة جديدة. ولا يحذف شيئًا: رحلة اختفت من
 * الموقع تبقى (قرار المالك ٢٠٢٦-٠٩-٢٨). المطابقة بـ `flightSlot` لا بالمفتاح،
 * فتغيّرُ الوقت تحديثٌ لا رحلة ثانية.
 * @param {Array} existing - الرحلات الحالية (DATA الحيّة من الصفحة الرئيسية)
 * @param {Array} fresh - رحلات الصالة من buildHallFlights
 * @returns {{merged:Array, added:number, duplicates:number, rescheduled:number, canceled:number, delayed:number, skippedNew:number, cleared:number, clearedCanceled:number, clearedDelayed:number}}
 *   `duplicates` = ما جاء بلا أي تغيير. `canceled` و`delayed` = ما صار كذلك
 *   في هذا الجلب. `cleared` = رحلات زالت حالتها (المطار رفع الإلغاء أو التأخر)،
 *   وفيها `clearedCanceled` و`clearedDelayed`. `skippedNew` = رحلات في الموقع ليست في الجدول — تُركت لزرّ الإضافة.
 */
function refreshHallFlights(existing, fresh) {
  const merged = (existing || []).slice();
  const state = { slots: _hallSlotIndex(merged), out: _hallEmptyResult(merged) };
  for (let j = 0; j < fresh.length; j++) _hallRefreshOne(state, fresh[j]);
  return state.out;
}

/**
 * رحلة واحدة لزرّ «تحديث»: ليست في الجدول ← تُترك لزرّ الإضافة، وإلا يُحدَّث سطرها في مكانه.
 * @param {{slots:Object, out:Object}} state - فهرس المواضع ونتيجة الدمج قيد البناء
 * @param {Object} flight
 */
function _hallRefreshOne(state, flight) {
  const slot = helpers.flightSlot(flight);
  if (!Object.prototype.hasOwnProperty.call(state.slots, slot)) { state.out.skippedNew++; return; }
  const merged = state.out.merged;
  const change = _hallApplyUpdate(merged[state.slots[slot]], flight);
  merged[state.slots[slot]] = change.flight;
  _hallCountChange(state.out, change);
}

/**
 * يعدّ أثر تحديث سطر واحد في نتيجة الدمج.
 * @param {Object} out - نتيجة refreshHallFlights قيد البناء
 * @param {{rescheduled:boolean, newStatus:string, cleared:string}} change
 */
function _hallCountChange(out, change) {
  if (change.rescheduled) out.rescheduled++;
  if (change.newStatus === "canceled") out.canceled++;
  if (change.newStatus === "delayed") out.delayed++;
  if (change.cleared) out.cleared++;
  if (change.cleared === "canceled") out.clearedCanceled++;
  if (change.cleared === "delayed") out.clearedDelayed++;
  if (!change.rescheduled && !change.newStatus && !change.cleared) out.duplicates++;
}

/**
 * تسمية الصالة للعرض في الإشعارات والسجلات.
 * @param {string} terminalKey - "t1" أو "north" أو "hall4"
 * @returns {string}
 */
function hallTerminalLabel(terminalKey) {
  if (terminalKey === "t1") return "صالة 1";
  if (terminalKey === "north") return "الصالة الشمالية";
  if (terminalKey === "hall4") return "صالة 4";
  return "";
}

/**
 * هيكل الأقسام الثلاثة — يُحقن داخل livePanel عبر hallSlot، كطبقة منفصلة تمامًا
 * تحت اللوحة الحية الحالية، بلا أي مساس بها.
 * @returns {string}
 */
function getHallAddHtml() {
  return `
<div class="live-section" id="hallSecT1">
  <div class="live-section-hd">
    <span class="live-section-title">رحلات صالة 1</span>
    <span class="live-section-count" id="hallCountT1">0 رحلة</span>
  </div>
  <div class="live-section-body">
    <input type="date" id="hallDateT1" style="width:100%;padding:8px;margin-bottom:8px;border-radius:8px;border:1px solid var(--bd);background:var(--s1);color:var(--t1)">
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="lf-btn lf-active live-act-btn" id="hallExtractT1" style="flex:1;min-width:0">&#9992; إضافة الرحلات الجديدة</button>
      <button class="lf-btn lf-active live-act-btn" id="hallRefreshT1" style="flex:1;min-width:0">&#10227; تحديث الرحلات الموجودة</button>
    </div>
    <button class="lf-btn live-clear-btn" id="hallDeleteT1" style="width:100%;margin-bottom:10px">&#128465; حذف كل رحلات صالة 1 المضافة من كايا</button>
    <div id="hallListT1"></div>
  </div>
</div>
<div class="live-section" id="hallSecNorth">
  <div class="live-section-hd">
    <span class="live-section-title">رحلات الصالة الشمالية</span>
    <span class="live-section-count" id="hallCountNorth">0 رحلة</span>
  </div>
  <div class="live-section-body">
    <input type="date" id="hallDateNorth" style="width:100%;padding:8px;margin-bottom:8px;border-radius:8px;border:1px solid var(--bd);background:var(--s1);color:var(--t1)">
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="lf-btn lf-active live-act-btn" id="hallExtractNorth" style="flex:1;min-width:0">&#9992; إضافة الرحلات الجديدة</button>
      <button class="lf-btn lf-active live-act-btn" id="hallRefreshNorth" style="flex:1;min-width:0">&#10227; تحديث الرحلات الموجودة</button>
    </div>
    <button class="lf-btn live-clear-btn" id="hallDeleteNorth" style="width:100%;margin-bottom:10px">&#128465; حذف كل رحلات الصالة الشمالية المضافة من كايا</button>
    <div id="hallListNorth"></div>
  </div>
</div>
<div class="live-section" id="hallSecHall4">
  <div class="live-section-hd">
    <span class="live-section-title">رحلات صالة 4</span>
    <span class="live-section-count" id="hallCountHall4">0 رحلة</span>
  </div>
  <div class="live-section-body">
    <input type="date" id="hallDateHall4" style="width:100%;padding:8px;margin-bottom:8px;border-radius:8px;border:1px solid var(--bd);background:var(--s1);color:var(--t1)">
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="lf-btn lf-active live-act-btn" id="hallExtractHall4" style="flex:1;min-width:0">&#9992; إضافة الرحلات الجديدة</button>
      <button class="lf-btn lf-active live-act-btn" id="hallRefreshHall4" style="flex:1;min-width:0">&#10227; تحديث الرحلات الموجودة</button>
    </div>
    <button class="lf-btn live-clear-btn" id="hallDeleteHall4" style="width:100%;margin-bottom:10px">&#128465; حذف كل رحلات صالة 4 المضافة من كايا</button>
    <div id="hallListHall4"></div>
  </div>
</div>`;
}

/**
 * لا حاجة لأنماط جديدة — القسمان يعيدان استخدام كامل أصناف live-section
 * (fq_live.js) وmini-row/mini-header (fq_styles.js) الموجودة عالميًا،
 * فتُطبَّق حركة الطي/الفتح تلقائيًا بلا أي كود إضافي.
 * @returns {string}
 */
function getHallAddStyles() {
  return "";
}

/**
 * الكود المحقون داخل WebView الرئيسي: يعرض رحلات كل صالة بنفس صفوف
 * تيوب جداول تمامًا عبر إعادة استخدام buildMiniRow()، ويربط زرّي
 * الاستخراج المستقلّين بنفس أسلوب زر "استخراج من المطار" الحالي.
 * @returns {string}
 */
function getHallAddCode() {
  return getHallAddCodePart1() +
    getHallAddCodePart2() +
    getHallAddCodePart3() +
    getHallAddCodePart4() +
    getHallAddCodePart5() +
    getHallAddCodePart6() +
    getHallAddCodePart7() +
    getHallAddCodePart8() +
    getHallAddCodePart9() +
    getHallAddCodePart10();
}

/** الجزء 1 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart1() {
  return `
let hallExtractT1    = document.getElementById("hallExtractT1");
let hallExtractNorth = document.getElementById("hallExtractNorth");
let hallRefreshT1    = document.getElementById("hallRefreshT1");
let hallRefreshNorth = document.getElementById("hallRefreshNorth");
let hallDeleteT1     = document.getElementById("hallDeleteT1");
let hallDeleteNorth  = document.getElementById("hallDeleteNorth");
let hallDateT1       = document.getElementById("hallDateT1");
let hallDateNorth    = document.getElementById("hallDateNorth");
let hallListT1       = document.getElementById("hallListT1");
let hallListNorth    = document.getElementById("hallListNorth");
let hallCountT1      = document.getElementById("hallCountT1");
let hallCountNorth   = document.getElementById("hallCountNorth");
let hallExtractHall4 = document.getElementById("hallExtractHall4");
let hallRefreshHall4 = document.getElementById("hallRefreshHall4");
let hallDeleteHall4  = document.getElementById("hallDeleteHall4");
let hallDateHall4    = document.getElementById("hallDateHall4");
let hallListHall4    = document.getElementById("hallListHall4");
let hallCountHall4   = document.getElementById("hallCountHall4");

// ═══ تقويم كل قسم — افتراضيًا اليوم، قابل للتغيير لاستخراج تواريخ أخرى ═══
function _hallTodayStr(){
  const d=new Date();
  return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
}
if(hallDateT1 && !hallDateT1.value)hallDateT1.value=_hallTodayStr();
if(hallDateNorth && !hallDateNorth.value)hallDateNorth.value=_hallTodayStr();
if(hallDateHall4 && !hallDateHall4.value)hallDateHall4.value=_hallTodayStr();

// التاريخ المختار في تقويم قسم الصالة — التاريخ الذي تُحفظ به رحلاته عند
// «إضافة». وبه تعرف نافذة التعديل رحلةَ بطاقة كايا العلوية، إذ لا تاريخ فيها.
function hallPickedDate(terminalKey){
  const el=terminalKey==="t1"?hallDateT1:(terminalKey==="north"?hallDateNorth:(terminalKey==="hall4"?hallDateHall4:null));
  return (el&&el.value)?el.value:_hallTodayStr();
}
`;
}

/** الجزء 2 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart2() {
  return `
// ═══ توسيع/طي صف مصغّر — نسخة معزولة بنطاق القسم فقط ═══
function _hallBindExpand(containerEl){
  const rows=containerEl.querySelectorAll(".mini-row");
  for(let i=0;i<rows.length;i++){
    rows[i].addEventListener("click",function(){
      const exp=this.querySelector(".mini-expand");
      if(!exp)return;
      const isOpen=exp.classList.contains("open");
      const allExp=containerEl.querySelectorAll(".mini-expand.open");
      for(let a=0;a<allExp.length;a++){
        allExp[a].classList.remove("open");
        allExp[a].parentElement.classList.remove("mini-open");
      }
      if(!isOpen){exp.classList.add("open");this.classList.add("mini-open");}
    });
  }
}

// ═══ إخفاء المغادرة — حالة مشتركة مع زر تيوب كايا، ومعيار الوقت نفسه المستعمل في تيوب جداول ═══
function _hallHideDeparted(){
  return typeof _lvHideDeparted!=="undefined" && _lvHideDeparted===true;
}

function _hallDropDeparted(items){
  if(!_hallHideDeparted())return items;
  const now=Date.now();
  return items.filter(function(d){
    return d.depTime && d.depTime.getTime()>now;
  });
}

// ═══ استعلام البحث ووضع الفلترة — مصدرهما حقل تيوب كايا وأزراره ═══
function _hallQuery(){
  if(typeof liveInput==="undefined"||!liveInput)return "";
  return (liveInput.value||"").trim().toLowerCase();
}

function _hallMode(){
  return (typeof liveFilterMode!=="undefined")?liveFilterMode:"all";
}

function _hallLower(v){
  return (v||"").toLowerCase();
}
`;
}

/** الجزء 3 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart3() {
  return `
function _hallAirportLower(code){
  return (typeof airportName==="function")?_hallLower(airportName(code)):"";
}

function _hallDestMatch(to,nm,q){
  return to.indexOf(q)!==-1||nm.indexOf(q)!==-1;
}

function _hallMatch(d,q,mode){
  const flt=_hallLower(d.flt);
  const al=_hallLower(d.al);
  const to=_hallLower(d.to);
  const nm=_hallAirportLower(d.to);
  if(mode==="flight")return flt.indexOf(q)!==-1;
  if(mode==="airline")return al.indexOf(q)!==-1;
  if(mode==="dest")return _hallDestMatch(to,nm,q);
  return flt.indexOf(q)!==-1||al.indexOf(q)!==-1||_hallDestMatch(to,nm,q);
}

function _hallFilterQuery(items){
  const q=_hallQuery();
  if(!q)return items;
  const mode=_hallMode();
  return items.filter(function(d){return _hallMatch(d,q,mode)});
}

// ═══ مفتاح إزالة التكرار للعرض — يشمل التاريخ ليطابق مفتاح الحفظ
// (flightKey في fq_helpers). قبل هذا الإصلاح كان المفتاح al+flt+std بلا
// تاريخ، فيطوي رحلتين ليومين مختلفين بنفس الرقم والوقت إلى واحدة، فتختفي
// رحلات اليوم الجديد رغم حفظها في القاعدة (السبب الأول للاختفاء المُبلَّغ). ═══
function _hallDedupeKey(d){
  return fqDisplayKey(d);
}

// ═══ نص الحالة الفارغة حسب سبب الفراغ ═══
function _hallEmptyMsg(){
  if(_hallQuery())return "لا توجد نتائج مطابقة";
  if(_hallHideDeparted())return "كل الرحلات المضافة غادرت — اضغط \\"إظهار المغادرة\\" لعرضها";
  return "لا توجد رحلات مضافة بعد";
}
`;
}

/** الجزء 4 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart4() {
  return `
// ═══ نص العدّاد — يظهر المخفي بسبب المغادرة صراحةً لا صامتًا،
// لأن العدد الظاهر أقلّ من المستخرَج كان يظهر بلا تفسير للمستخدم ═══
function _hallCountText(shown,hiddenDeparted){
  if(hiddenDeparted>0 && _hallHideDeparted()){
    return shown+" رحلة (+"+hiddenDeparted+" مخفية)";
  }
  return shown+" رحلة";
}

// ═══ عرض رحلات صالة واحدة — بنفس تصميم صفوف تيوب جداول تمامًا ═══
// رحلات صالة واحدة بلا مكرَّر (مفتاح العرض)
function _hallUniqueOf(terminalKey){
  const seen={};const items=[];
  for(let i=0;i<DATA.length;i++){
    const d=DATA[i];
    if(d.terminal!==terminalKey)continue;
    const dk=_hallDedupeKey(d);
    if(seen[dk])continue;
    seen[dk]=true;
    items.push(d);
  }
  return items;
}
`;
}

/** الجزء 5 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart5() {
  return `
function _hallRowsHtml(items){
  const now=Date.now();
  let h='<div class="mini-header"><span>ناقل</span><span>رحلة</span><span>وجهة</span>'
    +'<span>وقت</span><span>تفويج</span><span>مناولة</span><span>متبقي</span></div>';
  for(let j=0;j<items.length;j++)h+=buildMiniRow(items[j],now);
  return h;
}

function _hallSectionItems(terminalKey){
  let items=_hallFilterQuery(_hallUniqueOf(terminalKey));
  const beforeDrop=items.length;
  items=_hallDropDeparted(items);
  items.sort(function(a,b){return a.depTime.getTime()-b.depTime.getTime();});
  return{items:items,hiddenDeparted:beforeDrop-items.length};
}

function _hallPaintSection(listEl,items){
  if(items.length===0){
    listEl.innerHTML='<div class="nodata"><span class="ic">'+buildIcon("plane",22)+'</span>'
      +_hallEmptyMsg()+'</div>';
    return;
  }
  listEl.innerHTML=_hallRowsHtml(items);
  _hallBindExpand(listEl);
}

function _hallRenderSection(terminalKey,listEl,countEl){
  if(!listEl)return;
  if(typeof DATA==="undefined"||!DATA.length){
    listEl.innerHTML="";
    if(countEl)countEl.textContent="0 رحلة";
    return;
  }
  const sec=_hallSectionItems(terminalKey);
  if(countEl)countEl.textContent=_hallCountText(sec.items.length,sec.hiddenDeparted);
  _hallPaintSection(listEl,sec.items);
}
`;
}

/** الجزء 6 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart6() {
  return `
function hallRenderAll(){
  _hallRenderSection("t1",hallListT1,hallCountT1);
  _hallRenderSection("north",hallListNorth,hallCountNorth);
  _hallRenderSection("hall4",hallListHall4,hallCountHall4);
}
hallRenderAll();

// ═══ زرّا الاستخراج — نفس أسلوب زر "استخراج من المطار" الحالي حرفيًا،
// مع تمرير التاريخ المختار من تقويم القسم + تحذير المصدر حيّ عند اختلاف
// التاريخ عن اليوم (اللوحة الحية لا تحمل جدول يوم آخر — التاريخ يُطبع
// فقط على رحلات اللوحة الحالية) ═══
function _hallWarnIfDifferentDay(pickedDate){
  if(!pickedDate)return;
  if(pickedDate===_hallTodayStr())return;
  if(typeof showToast!=="function")return;
  showToast("المصدر حيّ للوحة اليوم — سيُطبع التاريخ "+pickedDate+" على رحلات الآن","info",3500);
}

function _hallStartExtract(actionName,btn,dateEl){
  if(!btn)return;
  const pickedDate=(dateEl&&dateEl.value)?dateEl.value:"";
  _hallWarnIfDifferentDay(pickedDate);
  window._FQ_ACTION=actionName;
  window._FQ_HALL_DATE=pickedDate;
  btn.textContent="جارٍ الإغلاق…";
  btn.style.opacity="0.5";
  setTimeout(function(){
    window.close();
    btn.textContent="أغلق الصفحة يدوياً (Close)";
  },500);
}
if(hallExtractT1){hallExtractT1.addEventListener("click",function(){
  _hallStartExtract("extract_t1",hallExtractT1,hallDateT1);
})}
if(hallExtractNorth){hallExtractNorth.addEventListener("click",function(){
  _hallStartExtract("extract_north",hallExtractNorth,hallDateNorth);
})}
if(hallExtractHall4){hallExtractHall4.addEventListener("click",function(){
  _hallStartExtract("extract_hall4",hallExtractHall4,hallDateHall4);
})}`;
}

/** الجزء 7 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart7() {
  return `
// ═══ زرّا التحديث — الجلب نفسه، ومهمّة واحدة (refreshHallFlights): يحدّث
// الموجود في سطره — الوقت، و«ملغاة» و«متأخرة» — ولا يضيف جديدًا، فالإضافة
// مهمّة الزرّ الذي بجانبه. قرار المالك ٢٠٢٦-٠٩-٢٨. ═══
if(hallRefreshT1){hallRefreshT1.addEventListener("click",function(){
  _hallStartExtract("refresh_t1",hallRefreshT1,hallDateT1);
})}
if(hallRefreshNorth){hallRefreshNorth.addEventListener("click",function(){
  _hallStartExtract("refresh_north",hallRefreshNorth,hallDateNorth);
})}
if(hallRefreshHall4){hallRefreshHall4.addEventListener("click",function(){
  _hallStartExtract("refresh_hall4",hallRefreshHall4,hallDateHall4);
})}
`;
}

/** الجزء 8 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart8() {
  return `
// ═══ حذف كل رحلات قسم — داخل المتصفح مباشرة، بنفس نمط fq_dbadmin.js ═══
// فحص صلاحية فوري + تأكيدان + حذف جماعي بطلب PATCH واحد (fqBulkDelete) +
// قراءة تأكيد واحدة + إزالة محلية من DATA وإعادة رسم فورية — بلا إغلاق
// صفحة وبلا انتظار.
// **كان** حذفًا تسلسليًّا فرديًّا: طلب DELETE لكل رحلة. أُلغي لأنه هو سبب
// طول الزمن، وبديله موثَّق («multi-path updates» بإسناد null) ومستعمل في
// المستودع أصلًا (fq_migrate_flight_keys.js:190-199).
// **ولا يُزال من الشاشة إلا ما زال من القاعدة**: res.ok لا يكفي، فالحذف
// على مسار غير موجود ينجح بنصّ الوثائق، فالقراءة بعده هي الدليل.
// الهوية من fqFlightKey المحقونة من fq_helpers — لا نسخة محلية، فالنسخ
// المحلية تنحرف عن المصدر بلا أن ينبّه شيء

// نصّ الموظف من أعداد القاعدة وحدها. دالة خالصة، فلا تنتفخ بها دالة الحذف.
function _hallDeleteText(c){
  if(c.pending>0)return{text:"الشبكة منقطعة — "+c.pending+" رحلة في الطابور لم تصل القاعدة بعد",kind:"error"};
  if(!c.checked)return{text:"أُرسل الحذف ولم يتأكّد من القاعدة",kind:"error"};
  if(c.left>0)return{text:"حُذف "+(c.asked-c.left)+" من "+c.asked+" — تعذّر حذف "+c.left,kind:"error"};
  return{text:"تم حذف "+c.asked+" رحلة",kind:"success"};
}

// ما بقي في القاعدة من المفاتيح المطلوبة. {left, checked}
async function _hallVerify(keys,pending,terminalKey){
  if(pending>0)return{left:keys,checked:false};
  var scan=await fqScanKeys("/"+FQ_FLIGHT_NODES[terminalKey]);
  if(!scan.ok)return{left:keys,checked:false};
  return{left:fqKeysRemaining(scan.keys,keys),checked:true};
}
`;
}

/** الجزء 9 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart9() {
  return `
// رحلات القسم المرشَّحة للحذف بعد فحص الصلاحية، أو null مع رسالة الخطأ.
function _hallDeletable(terminalKey){
  if(typeof can==="function"&&!can("delete_flight")){
    if(typeof showToast==="function")showToast("لا تملك صلاحية الحذف","error");
    return null;
  }
  if(typeof DATA==="undefined")return null;
  let toDelete=DATA.filter(function(f){return f.terminal===terminalKey});
  if(toDelete.length===0){
    if(typeof showToast==="function")showToast("لا توجد رحلات لحذفها","error");
    return null;
  }
  return toDelete;
}

async function _hallConfirmDelete(count,label){
  let ok1=await fqConfirm("سيُحذف "+count+" رحلة من "+label+" نهائيًا من قاعدة البيانات.","تأكيد الحذف");
  if(!ok1)return false;
  let ok2=await fqConfirm("تأكيد نهائي: هذه العملية لا يمكن التراجع عنها.","تأكيد أخير");
  return !!ok2;
}
async function _hallDeleteAndVerify(terminalKey,label,toDelete){
  if(typeof showToast==="function")showToast("جارٍ الحذف...","loading");
  let keys=[];
  for(let i=0;i<toDelete.length;i++)keys.push(fqFlightKey(toDelete[i]));
  // حذف صالة يقع في عقدتها وحدها، فلا يمسّ الجداول ولا الصالة الأخرى.
  let bulk=await fqBulkDelete("/"+FQ_FLIGHT_NODES[terminalKey],keys,"حذف "+label);
  let v=await _hallVerify(keys,bulk.pending,terminalKey);
  return{keys:keys,bulk:bulk,v:v};
}
`;
}

/** الجزء 10 من 10 من نصّ `getHallAddCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHallAddCodePart10() {
  return `
// ما اختفى من القاعدة فعلًا — وهو وحده ما يُزال من الشاشة ويُذكر في الرسالة.
function _hallRemoveGone(terminalKey,keys,left){
  let gone={};
  for(let g=0;g<keys.length;g++)gone[keys[g]]=true;
  for(let s=0;s<left.length;s++)delete gone[left[s]];
  for(let j=DATA.length-1;j>=0;j--){
    if(DATA[j].terminal===terminalKey&&gone[fqFlightKey(DATA[j])])DATA.splice(j,1);
  }
}

function _hallAnnounceDelete(terminalKey,label,deleted){
  if(typeof fbPushNotif==="function"){
    fbPushNotif({type:"hall_flights_deleted",title:"حذف "+label,details:deleted+" رحلة"});
  }
  if(typeof auditLog==="function")auditLog("delete_hall_flights",label,terminalKey);
}

function _hallAfterDelete(terminalKey,label,r){
  _hallRemoveGone(terminalKey,r.keys,r.v.left);
  hallRenderAll();
  if(typeof doSearch==="function")doSearch();
  _hallAnnounceDelete(terminalKey,label,r.keys.length-r.v.left.length);
  let msg=_hallDeleteText({asked:r.keys.length,left:r.v.left.length,pending:r.bulk.pending,checked:r.v.checked});
  if(typeof showToast==="function")showToast(msg.text,msg.kind);
}

async function _hallDeleteAll(terminalKey,label){
  let toDelete=_hallDeletable(terminalKey);
  if(!toDelete)return;
  if(!(await _hallConfirmDelete(toDelete.length,label)))return;
  let r=await _hallDeleteAndVerify(terminalKey,label,toDelete);
  _hallAfterDelete(terminalKey,label,r);
}
if(hallDeleteT1){hallDeleteT1.addEventListener("click",function(){
  _hallDeleteAll("t1","رحلات صالة 1");
})}
if(hallDeleteNorth){hallDeleteNorth.addEventListener("click",function(){
  _hallDeleteAll("north","رحلات الصالة الشمالية");
})}
if(hallDeleteHall4){hallDeleteHall4.addEventListener("click",function(){
  _hallDeleteAll("hall4","رحلات صالة 4");
})}
`;
}

class AppCoordinator {
  static async boot() {
    // وحدة مورّدة نصوص ودوال بناء بيانات فقط — لا إجراء إقلاع فعلي مطلوب هنا
  }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((e) => console.error(e)); } catch (e) { console.error(e); }

module.exports = Object.freeze({
  buildHallFlights,
  addHallFlights,
  refreshHallFlights,
  hallTerminalLabel,
  getHallAddHtml,
  getHallAddStyles,
  getHallAddCode,
});
