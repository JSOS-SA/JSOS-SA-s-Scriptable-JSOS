// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: list-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_reg_form.js

// ═══ إدارة نماذج تسجيل الرحلات (نص JS لـ WebView) ═══
// المسؤولية الواحدة: إضافة/حذف/تعبئة نماذج الرحلات داخل WebView

/**
 * يُرجع نص JS لمنطق إدارة النماذج (إضافة، حذف، تعبئة تلقائية، عداد).
 * يعتمد على متغيرات regFormsContainer و _regFormId المُعرَّفة في getShiftCode.
 * @returns {string}
 */
function getFormCode() {
  return getFormCodePart1() +
    getFormCodePart2() +
    getFormCodePart3() +
    getFormCodePart4() +
    getFormCodePart5() +
    getFormCodePart6() +
    getFormCodePart7() +
    getFormCodePart8() +
    getFormCodePart9() +
    getFormCodePart10() +
    getFormCodePart11() +
    getFormCodePart12() +
    getFormCodePart13() +
    getFormCodePart14();
}

/** الجزء 1 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart1() {
  return `
// ═══ سجل مؤقتات عداد التفويج التنازلي (myId → intervalId) — يُنظَّف عند حذف النموذج أو إعادة الضبط ═══
let _hintTimers = {};

// ═══ حسابات تلقائية ═══
// ═══ حساب الحالة التلقائية (departed إذا كان dep قد مضى) ═══
function _computeAutoStatusFromDep(dep) {
  if (!dep) return "scheduled";
  if (dep.getTime() < Date.now()) return "departed";
  return "scheduled";
}

function _computeAutoStatus(flight) {
  if (!flight) return "unscheduled";
  if (flight._status) return flight._status;
  if (!flight.depTime) return "scheduled";
  const t = flight.depTime instanceof Date ? flight.depTime : new Date(flight.depTime);
  if (t.getTime() < Date.now()) return "departed";
  return "scheduled";
}

// ═══ تصنيف التفويج بناء على dep ═══
function _computeAutoTafweejFromDep(dep) {
  if (!dep) return "ontime";
  if (isNaN(dep.getTime())) return "ontime";
  const diffH = (dep.getTime() - Date.now()) / 3600000;
  const earlyHrs = (window._TF_EARLY !== undefined) ? window._TF_EARLY : 8;
  const ontimeHrs = (window._TF_ONTIME !== undefined) ? window._TF_ONTIME : 4;
  if (diffH < 0) return "late";
  if (diffH >= earlyHrs) return "early";
  if (diffH >= ontimeHrs) return "ontime";
  return "late";
}

function _computeAutoTafweej(depTime) {
  if (!depTime) return "ontime";
  const t = depTime instanceof Date ? depTime : new Date(depTime);
  return _computeAutoTafweejFromDep(t);
}

// ═══ تنظيف رقم الرحلة المكتوب لأرقام فقط (مساعد داخلي) ═══
// يُستعمل أيضاً لتنظيف flt المخزَّن في الرحلة (لتوحيد أساس المقارنة).
function _cleanFlightNum(v) {
  return String(v || "").replace(/\\D/g, "");
}
`;
}

/** الجزء 2 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart2() {
  return `
// ═══ مطابقة رقم مكتوب على رحلة واحدة ═══
// مساران: الرقم الصافي (مئة وخمسون) والرمز الكامل بأرقامه (تسعة ومئة وخمسون)
// حتى يجد الموظف الرحلة سواء كتب الرقم وحده أو كتبه مع رقم رمز الناقل.
function _flightMatchesDigits(flight, clean) {
  if (_pureFlightNum(flight).indexOf(clean) !== -1) return true;
  return _cleanFlightNum(_flightDisplayCode(flight)).indexOf(clean) !== -1;
}

// ═══ بحث الرحلات باحتواء الرقم المكتوب في أي موضع (حد أقصى 10 نتائج) ═══
// نمط مطابق لِـ afSearchDest في fq_addflight.js لضمان الاتساق.
function _searchFlightsByDigits(clean) {
  const out = [];
  if (typeof DATA === "undefined") return out;
  for (let i = 0; i < DATA.length; i++) {
    const f = DATA[i];
    if (_flightMatchesDigits(f, clean)) out.push(f);
    if (out.length >= 10) break;
  }
  return out;
}

// ═══ تصفية الرحلات المطابقة بحسب التاريخ إن وُجد ═══
// بدون تاريخ: تُعاد كل المطابقات كما هي (تحديد القرار للمستدعي).
function _matchesForDate(matches, dateStr) {
  if (!dateStr) return matches;
  const out = [];
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].date === dateStr) out.push(matches[i]);
  }
  return out;
}
`;
}

/** الجزء 3 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart3() {
  return `
// ═══ الرقم الصافي للرحلة (بعد نزع رمز الناقل والأصفار البادئة) ═══
// نزع الرمز نصياً لا بحذف الحروف، لأن رموز الناقلين قد تكون حرفاً ورقماً
// (مثل جي تسعة)، فحذف الحروف وحده يُبقي رقم الرمز ملتصقاً برقم الرحلة.
// نفس معيار العزل المستعمل في fq_editflight.js لتوحيد السلوك.
function _pureFlightNum(flight) {
  if (!flight) return "";
  let raw = String(flight.flt || "");
  const al = String(flight.al || "");
  if (al && raw.toUpperCase().indexOf(al.toUpperCase()) === 0) {
    raw = raw.substring(al.length);
  }
  const digits = _cleanFlightNum(raw);
  const trimmed = digits.replace(/^0+/, "");
  return trimmed.length > 0 ? trimmed : digits;
}

// ═══ بناء رمز عرض الرحلة (رمز الشركة + الرقم الصافي) ═══
// يمنع الدمج المزدوج لو كان flt المخزَّن يحوي رمز الشركة مسبقاً ضمن النص.
function _flightDisplayCode(flight) {
  if (!flight) return "";
  return (flight.al || "") + _pureFlightNum(flight);
}

function _destCountryName(code) {
  if (!code) return "";
  const up = String(code).toUpperCase();
  if (typeof AIRPORTS !== "undefined" && AIRPORTS[up]) return _airportLabel(AIRPORTS[up], up);
  if (typeof COUNTRY !== "undefined" && COUNTRY[up]) return COUNTRY[up];
  if (typeof countryName === "function") return countryName(up);
  return up;
}

// وجهة المطار: «دولة - مدينة»، أو الدولة وحدها، أو اسم الدولة الاحتياطي، أو الرمز.
function _airportLabel(a, up) {
  if (a.c && a.d) return a.c + " - " + a.d;
  if (a.c) return a.c;
  return a.country || up;
}
`;
}

/** الجزء 4 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart4() {
  return `
// ═══ تعقيم نص قبل حقنه في HTML (مساعد داخلي لقائمة اختيار الرحلة) ═══
function _escFlt(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ═══ إغلاق قائمة اختيار رقم الرحلة وتفريغ محتواها ═══
function _closeFltDropdown(dd) {
  if (!dd) return;
  dd.classList.remove("open");
  dd.innerHTML = "";
}

// ═══ بناء عنصر واحد في قائمة اختيار رقم الرحلة ═══
function _fltDropdownItemHtml(flight, idx) {
  const code = _escFlt(_flightDisplayCode(flight));
  const destText = _escFlt(_destCountryName(flight.to));
  return '<div class="reg-flt-dd-item" data-idx="' + idx + '">' +
    '<span class="reg-flt-dd-code">' + code + '</span>' +
    '<span class="reg-flt-dd-dest">' + destText + '</span>' +
    '</div>';
}
`;
}

/** الجزء 5 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart5() {
  return `
// ═══ عرض قائمة اختيار رقم الرحلة عند وجود أكثر من رحلة بنفس الرقم ═══
// مراجع الحقول تُقرأ من dd._fields (مُعيَّنة مرة واحدة في addRegForm).
function _renderFltDropdown(dd, matches) {
  if (!dd) return;
  const f = dd._fields || {};
  let h = "";
  for (let i = 0; i < matches.length; i++) h += _fltDropdownItemHtml(matches[i], i);
  dd.innerHTML = h;
  dd.classList.add("open");
  const items = dd.querySelectorAll(".reg-flt-dd-item");
  for (let j = 0; j < items.length; j++) {
    items[j].addEventListener("click", function(){
      const idx = parseInt(this.getAttribute("data-idx"), 10);
      const flight = matches[idx];
      if (!flight) return;
      _closeFltDropdown(dd);
      _applyFlightToForm(flight, f);
    });
  }
}

// ═══ معالجة كتابة رقم الرحلة: بحث حي بالاحتواء، حد أدنى رقمان ═══
// لا تعبئة تلقائية أبداً من الكتابة وحدها — القائمة تُعرض دوماً عند وجود
// رحلة واحدة فأكثر تحتوي الرقم المكتوب، وتُحدَّث مع كل رقم يُضاف أو يُحذف.
// التطبيق الفعلي يحدث فقط بنقرة صريحة على عنصر (داخل _renderFltDropdown).
// يُرجع: "listed" (عُرضت قائمة) / "none" (لا فعل، أقل من رقمين أو لا تطابق).
function _handleFlightNumberInput(rawValue, dd) {
  const f = (dd && dd._fields) || {};
  const clean = _cleanFlightNum(rawValue);
  if (clean.length < 2) return _fltListNone(dd);
  const candidates = _matchesForDate(_searchFlightsByDigits(clean), f.dateInput ? f.dateInput.value : "");
  if (candidates.length === 0) return _fltListNone(dd);
  _renderFltDropdown(dd, candidates);
  return "listed";
}

// لا قائمة تُعرض: تُغلق القائمة المفتوحة، والنتيجة "none".
function _fltListNone(dd) {
  _closeFltDropdown(dd);
  return "none";
}
`;
}

/** الجزء 6 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart6() {
  return `
// ═══ تنسيق الوقت المتبقي بصيغة عداد تنازلي س:د:ث ═══
function _formatCountdown(diffHours) {
  const totalSeconds = Math.max(0, Math.round(diffHours * 3600));
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  return pad(hh) + ":" + pad(mm) + ":" + pad(ss);
}

// ═══ تصنيف التفويج إلى فئة (مستخرج من _updateTafweejHint) ═══
function _classifyTafweej(diff, earlyH, ontimeH) {
  if (diff < 0) return { cls: "reg-hint-late", text: "غادرت (منذ " + Math.abs(Math.floor(diff)) + " ساعة)" };
  const cd = _formatCountdown(diff);
  if (diff > earlyH) return { cls: "reg-hint-early", text: "مبكر (+" + cd + ")" };
  if (diff >= ontimeH) return { cls: "reg-hint-ontime", text: "في الموعد (" + cd + ")" };
  if (diff >= 2) return { cls: "reg-hint-late", text: "متأخر (" + cd + ")" };
  return { cls: "reg-hint-early", text: "خطر (" + cd + ")" };
}

// ═══ بناء كائن Date من تاريخ ووقت ═══
// dateStr بصيغة YYYY-MM-DD، timeStr بصيغة HH:MM
// إذا كان dateStr فارغاً نستخدم تاريخ اليوم.
// لا قفز تلقائي ٢٤ ساعة — التاريخ يحدد اليوم بدقة.
function _buildDepFromDateTime(dateStr, timeStr) {
  if (!timeStr) return null;
  const tp = timeStr.split(":");
  const hh = parseInt(tp[0]||"0");
  const mm = parseInt(tp[1]||"0");
  const dp = dateStr ? dateStr.split("-") : [];
  if (dp.length === 3) return new Date(parseInt(dp[0]), parseInt(dp[1]) - 1, parseInt(dp[2]), hh, mm, 0);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
}
`;
}

/** الجزء 7 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart7() {
  return `
// ═══ تلميح التفويج ═══
function _updateTafweejHint(stdInput, hint, dateInput) {
  if (!stdInput || !hint || !stdInput.value) return;
  const dateStr = (dateInput && dateInput.value) ? dateInput.value : "";
  const dep = _buildDepFromDateTime(dateStr, stdInput.value);
  if (!dep) return;
  const diff = (dep.getTime() - Date.now()) / 3600000;
  const c = _tafweejClassOf(diff);
  hint.className = "reg-tafweej-hint";
  hint.textContent = c.text;
  hint.classList.add(c.cls);
}

// تصنيف الفارق بحدّي التفويج المبكر والموعد (الافتراضيان ٨ و٤ ساعات).
function _tafweejClassOf(diff) {
  const earlyH = (window._TF_EARLY !== undefined) ? window._TF_EARLY : 8;
  const ontimeH = (window._TF_ONTIME !== undefined) ? window._TF_ONTIME : 4;
  return _classifyTafweej(diff, earlyH, ontimeH);
}

// ═══ عداد النماذج المسجّلة ═══
function updateRegCounter() {
  const count = regFormsContainer.querySelectorAll(".reg-form").length;
  if (regCounter) regCounter.textContent = count + " رحلة مسجّلة";
}

// ═══ كشف صالة الرحلة وتطبيق منطقها على التفويج فقط ═══
// إذا الرحلة في صالة 1 أو الشمالية أو صالة 4 → التفويج "خاطئ صالة X"، وحقل الوجهة
// يبقى دائمًا اسم المدينة الحقيقي (يُعبَّأ لاحقًا في _refillFromFlight)
// إذا الرحلة في صالة الحج أو غير محددة → السلوك الافتراضي
const FORM_WRONG_TERMINAL = { t1: "wrong_t1", north: "wrong_north", hall4: "wrong_hall4" };

function _applyTerminalLogic(flight, destInput, tafweejSel) {
  const t = (flight && flight.terminal) || "";
  if (!Object.prototype.hasOwnProperty.call(FORM_WRONG_TERMINAL, t)) return false;
  if (tafweejSel) tafweejSel.value = FORM_WRONG_TERMINAL[t];
  return true;
}
`;
}

/** الجزء 8 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart8() {
  return `
// ═══ تعبئة الحقول من بيانات الرحلة (مساعد مشترك) ═══
// يُستعمل عند الكتابة برقم الرحلة وعند تغيير تاريخها لتجنّب تكرار المنطق.
// يرجع true إذا الصالة "خطأ" (لتجاوز إعادة حساب التفويج لاحقاً).
// حقل الوجهة يُعبَّأ دائمًا باسم المدينة الحقيقي — بصرف النظر عن حالة الصالة.
// f: حقول النموذج (fltInput وstdInput وdestInput وstatusSel وtafweejSel وhint وdateInput).
function _refillFromFlight(flight, f) {
  if (!flight) return false;
  if (f.stdInput && flight.std) f.stdInput.value = flight.std;
  const isWrong = _applyTerminalLogic(flight, f.destInput, f.tafweejSel);
  if (f.destInput) f.destInput.value = _destCountryName(flight.to);
  return isWrong;
}

// ═══ تطبيق التصنيف التلقائي للتفويج والحالة (مستخرج لخفض التعقيد الدوري) ═══
function _applyDerivedStatus(dep, f, isWrongTerminal) {
  if (!isWrongTerminal && f.tafweejSel) f.tafweejSel.value = _computeAutoTafweejFromDep(dep);
  if (f.statusSel) f.statusSel.value = _computeAutoStatusFromDep(dep);
}

// ═══ تطبيق رحلة مختارة على الحقول (مشترك بين التعبئة التلقائية واختيار القائمة) ═══
function _applyFlightToForm(flight, f) {
  if (!flight || !f.fltInput) return;
  const displayCode = _flightDisplayCode(flight);
  if (displayCode) f.fltInput.value = displayCode;
  const isWrongTerminal = _refillFromFlight(flight, f);
  const dep = _buildDepFromDateTime(f.dateInput ? f.dateInput.value : "", f.stdInput ? f.stdInput.value : "");
  _applyDerivedStatus(dep, f, isWrongTerminal);
  _updateTafweejHint(f.stdInput, f.hint, f.dateInput);
  if (typeof showToast === "function") showToast("تم تعبئة بيانات " + flight.flt, "info", 1500);
}

// ═══ ربط حدث رقم الرحلة (بحث حي بالاحتواء بدءاً من رقمين) ═══
// كل ضغطة رقم تعيد البحث وتحدّث القائمة — لا تعبئة تلقائية من الكتابة وحدها
// مهما كان عدد المطابقات؛ التطبيق فقط بنقرة صريحة على عنصر من القائمة.
function _bindFltAutoFill(f, dd) {
  if (!f.fltInput) return;
  f.fltInput.addEventListener("input", function(){
    _handleFlightNumberInput(this.value, dd);
  });
}
`;
}

/** الجزء 9 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart9() {
  return `
// ═══ ربط حدث وقت الإقلاع (تحديث تلميح التفويج) ═══
function _bindStdChange(f) {
  if (!f.stdInput || !f.hint) return;
  f.stdInput.addEventListener("change", function(){
    _updateTafweejHint(f.stdInput, f.hint, f.dateInput);
    const dep = _buildDepFromDateTime(f.dateInput ? f.dateInput.value : "", f.stdInput.value);
    if (f.tafweejSel) f.tafweejSel.value = _computeAutoTafweejFromDep(dep);
    if (f.statusSel) f.statusSel.value = _computeAutoStatusFromDep(dep);
  });
}

// ═══ ربط حدث تاريخ الإقلاع (تحديث التلميح + إعادة بحث الرحلة) ═══
// إذا كان رقم الرحلة مكتوباً وظهرت قائمة على التاريخ الجديد → تبقى القائمة معروضة (لا سقوط احتياطي).
// غير ذلك (فارغ/أقل من رقمين/لا تطابق) → تحديث التلميح والحالة بالوقت الحالي فقط.
function _bindDateChange(f, dd) {
  if (!f.dateInput) return;
  f.dateInput.addEventListener("change", function(){
    const result = (f.fltInput && f.fltInput.value) ? _handleFlightNumberInput(f.fltInput.value, dd) : "none";
    if (result === "listed") return;
    _updateTafweejHint(f.stdInput, f.hint, f.dateInput);
    const dep = _buildDepFromDateTime(f.dateInput.value, f.stdInput ? f.stdInput.value : "");
    _applyDerivedStatus(dep, f, false);
  });
}

// ═══ تعبئة قيم مسبقة ═══
function _applyPrefill(form, prefill, f) {
  if (!prefill) return;
  const keys = ["flt","std","date","status","dest","pax","visa","campaign","tafweej","inspection","note"];
  for (let k = 0; k < keys.length; k++) {
    const el = form.querySelector('[data-key="' + keys[k] + '"]');
    if (el && prefill[keys[k]] !== undefined) el.value = prefill[keys[k]];
  }
  _updateTafweejHint(f.stdInput, f.hint, f.dateInput);
}

// ═══ تنسيق تاريخ اليوم بصيغة YYYY-MM-DD ═══
function _todayIsoDate() {
  const n = new Date();
  const mo = ("0" + (n.getMonth()+1)).slice(-2);
  const d = ("0" + n.getDate()).slice(-2);
  return n.getFullYear() + "-" + mo + "-" + d;
}
`;
}

/** الجزء 10 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart10() {
  return `
// ═══ إضافة نموذج رحلة جديد ═══
function addRegForm(prefill) {
  _regFormId++;
  const myId = _regFormId;
  _insertRegForm(myId);
  updateRegCounter();

  const form = regFormsContainer.querySelector('[data-form-id="' + myId + '"]');
  if (!form) return;

  const f = _formFields(form, myId);
  _setupRegForm(form, myId, f);
  _applyPrefill(form, prefill, f);
}

// يُدخل قالب النموذج برقمه إلى الحاوية.
function _insertRegForm(myId) {
  let tpl = FORM_TEMPLATE;
  tpl = tpl.replace(/__ID__/g, myId);
  tpl = tpl.replace(/__NUM__/g, String(myId).padStart(2, "0"));
  regFormsContainer.insertAdjacentHTML("beforeend", tpl);
}

`;
}

/** الجزء 11 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart11() {
  return `
// حقول النموذج الجديد، تُجلب بهذا الترتيب.
function _formFields(form, myId) {
  const fltInput = form.querySelector('[data-key="flt"]');
  const stdInput = form.querySelector('[data-key="std"]');
  const dateInput = form.querySelector('[data-key="date"]');
  const destInput = form.querySelector('[data-key="dest"]');
  const statusSel = form.querySelector('[data-key="status"]');
  const tafweejSel = form.querySelector('[data-key="tafweej"]');
  const hint = form.querySelector('[data-hint="' + myId + '"]');
  return {
    fltInput: fltInput, stdInput: stdInput, destInput: destInput,
    statusSel: statusSel, tafweejSel: tafweejSel, hint: hint, dateInput: dateInput
  };
}

`;
}

/** الجزء 12 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart12() {
  return `
// يهيّئ النموذج: قائمة الرحلات وحقولها، وتاريخ اليوم، وعدّاد التلميح، وزرّ الحذف، وربط الأحداث.
function _setupRegForm(form, myId, f) {
  const delBtn = form.querySelector('[data-del="' + myId + '"]');
  const fltDd = form.querySelector('[data-fltdd="' + myId + '"]');
  if (fltDd) fltDd._fields = f;

  // تعبئة التاريخ افتراضياً بتاريخ اليوم
  if (f.dateInput && !f.dateInput.value) f.dateInput.value = _todayIsoDate();

  // عداد تنازلي حي — يُحدِّث التلميح كل ثانية بلا انتظار حدث تغيير
  _hintTimers[myId] = setInterval(function(){
    _updateTafweejHint(f.stdInput, f.hint, f.dateInput);
  }, 1000);
  _bindRegDelete(form, myId, delBtn);

  _bindFltAutoFill(f, fltDd);
  _bindStdChange(f);
  _bindDateChange(f, fltDd);
}

// زرّ حذف النموذج: يوقف عدّاده ويخفيه بحركة ثم يزيله ويحدّث العدّاد.
function _bindRegDelete(form, myId, delBtn) {
  if (delBtn) {
    delBtn.addEventListener("click", function(){
      if (_hintTimers[myId]) { clearInterval(_hintTimers[myId]); delete _hintTimers[myId]; }
      form.style.opacity = "0";
      form.style.transform = "scale(0.95)";
      setTimeout(function(){ if (form.parentNode) form.remove(); }, 200);
      updateRegCounter();
    });
  }
}

`;
}

/** الجزء 13 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart13() {
  return `
// ═══ جمع كل القيم من النماذج ═══
function _collectForms() {
  const forms = regFormsContainer.querySelectorAll(".reg-form");
  const list = [];
  for (let i = 0; i < forms.length; i++) {
    const inputs = forms[i].querySelectorAll("[data-key]");
    const row = {};
    for (let j = 0; j < inputs.length; j++) {
      row[inputs[j].getAttribute("data-key")] = (inputs[j].value || "").trim();
    }
    list.push(row);
  }
  return list;
}

// ═══ إغلاق قائمة اختيار رقم الرحلة عند الضغط خارج الحقل ═══
document.addEventListener("click", function(e){
  const openList = regFormsContainer.querySelectorAll(".reg-flt-dd.open");
  for (let i = 0; i < openList.length; i++) {
    const dd = openList[i];
    const field = dd.closest(".reg-field");
    if (field && !field.contains(e.target)) _closeFltDropdown(dd);
  }
});
`;
}

/** الجزء 14 من 14 من نصّ `getFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getFormCodePart14() {
  return `
// ═══ ربط أزرار الإضافة وإعادة الضبط ═══
if (regAddBtn) regAddBtn.addEventListener("click", function(){ addRegForm(); });

if (regResetBtn) {
  regResetBtn.addEventListener("click", async function() {
    if (!(await fqConfirm("مسح النماذج المعروضة؟ (لن تُمسح من القاعدة)"))) return;
    for (const tmrId in _hintTimers) { clearInterval(_hintTimers[tmrId]); }
    _hintTimers = {};
    regFormsContainer.innerHTML = "";
    _regFormId = 0;
    _regEditTarget = null;
    updateRegCounter();
  });
}
`;
}

module.exports = Object.freeze({
  getFormCode,
});
