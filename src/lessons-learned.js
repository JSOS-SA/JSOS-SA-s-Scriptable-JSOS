// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: list-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: lessons-learned.js

// ═══ إدارة نماذج تسجيل الرحلات (نص JS لـ WebView) ═══
// المسؤولية الواحدة: إضافة/حذف/تعبئة نماذج الرحلات داخل WebView

/** جزء 1 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart1() {
  return `
// ═══ سجل مؤقتات عداد التفويج التنازلي (myId → intervalId) — يُنظَّف عند حذف النموذج أو إعادة الضبط ═══
var _hintTimers = {};

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
  var t = flight.depTime instanceof Date ? flight.depTime : new Date(flight.depTime);
  if (t.getTime() < Date.now()) return "departed";
  return "scheduled";
}

// ═══ تصنيف التفويج بناء على dep ═══
function _computeAutoTafweejFromDep(dep) {
  if (!dep) return "ontime";
  if (isNaN(dep.getTime())) return "ontime";
  var diffH = (dep.getTime() - Date.now()) / 3600000;
  var earlyHrs = (window._TF_EARLY !== undefined) ? window._TF_EARLY : 8;
  var ontimeHrs = (window._TF_ONTIME !== undefined) ? window._TF_ONTIME : 4;
  if (diffH < 0) return "late";
  if (diffH >= earlyHrs) return "early";
  if (diffH >= ontimeHrs) return "ontime";
  return "late";
}

function _computeAutoTafweej(depTime) {
  if (!depTime) return "ontime";
  var t = depTime instanceof Date ? depTime : new Date(depTime);
  return _computeAutoTafweejFromDep(t);
}

`;
}

/** جزء 2 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart2() {
  return `// ═══ تنظيف رقم الرحلة المكتوب لأرقام فقط (مساعد داخلي) ═══
// يُستعمل أيضاً لتنظيف flt المخزَّن في الرحلة (لتوحيد أساس المقارنة).
function _cleanFlightNum(v) {
  return String(v || "").replace(/\\D/g, "");
}

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
  var out = [];
  if (typeof DATA === "undefined") return out;
  for (var i = 0; i < DATA.length; i++) {
    var f = DATA[i];
    if (_flightMatchesDigits(f, clean)) out.push(f);
    if (out.length >= 10) break;
  }
  return out;
}

// ═══ تصفية الرحلات المطابقة بحسب التاريخ إن وُجد ═══
// بدون تاريخ: تُعاد كل المطابقات كما هي (تحديد القرار للمستدعي).
function _matchesForDate(matches, dateStr) {
  if (!dateStr) return matches;
  var out = [];
  for (var i = 0; i < matches.length; i++) {
    if (matches[i].date === dateStr) out.push(matches[i]);
  }
  return out;
}

// ═══ الرقم الصافي للرحلة (بعد نزع رمز الناقل والأصفار البادئة) ═══
// نزع الرمز نصياً لا بحذف الحروف، لأن رموز الناقلين قد تكون حرفاً ورقماً
`;
}

/** جزء 3 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart3() {
  return `// (مثل جي تسعة)، فحذف الحروف وحده يُبقي رقم الرمز ملتصقاً برقم الرحلة.
// نفس معيار العزل المستعمل في fq_editflight.js لتوحيد السلوك.
function _pureFlightNum(flight) {
  if (!flight) return "";
  var raw = String(flight.flt || "");
  var al = String(flight.al || "");
  if (al && raw.toUpperCase().indexOf(al.toUpperCase()) === 0) {
    raw = raw.substring(al.length);
  }
  var digits = _cleanFlightNum(raw);
  var trimmed = digits.replace(/^0+/, "");
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
  var up = String(code).toUpperCase();
  if (typeof AIRPORTS !== "undefined" && AIRPORTS[up]) {
    var a = AIRPORTS[up];
    if (a.c && a.d) return a.c + " - " + a.d;
    if (a.c) return a.c;
    return a.country || up;
  }
  if (typeof COUNTRY !== "undefined" && COUNTRY[up]) return COUNTRY[up];
  if (typeof countryName === "function") return countryName(up);
  return up;
}

// ═══ تعقيم نص قبل حقنه في HTML (مساعد داخلي لقائمة اختيار الرحلة) ═══
function _escFlt(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
`;
}

/** جزء 4 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart4() {
  return `    .replace(/>/g, "&gt;")
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
  var code = _escFlt(_flightDisplayCode(flight));
  var destText = _escFlt(_destCountryName(flight.to));
  return '<div class="reg-flt-dd-item" data-idx="' + idx + '">' +
    '<span class="reg-flt-dd-code">' + code + '</span>' +
    '<span class="reg-flt-dd-dest">' + destText + '</span>' +
    '</div>';
}

// ═══ عرض قائمة اختيار رقم الرحلة عند وجود أكثر من رحلة بنفس الرقم ═══
// مراجع الحقول تُقرأ من dd._fields (مُعيَّنة مرة واحدة في addRegForm).
function _renderFltDropdown(dd, matches) {
  if (!dd) return;
  var f = dd._fields || {};
  var h = "";
  for (var i = 0; i < matches.length; i++) h += _fltDropdownItemHtml(matches[i], i);
  dd.innerHTML = h;
  dd.classList.add("open");
  var items = dd.querySelectorAll(".reg-flt-dd-item");
  for (var j = 0; j < items.length; j++) {
    items[j].addEventListener("click", function(){
      var idx = parseInt(this.getAttribute("data-idx"), 10);
      var flight = matches[idx];
      if (!flight) return;
      _closeFltDropdown(dd);
      _applyFlightToForm(flight, f.fltInput, f.stdInput, f.destInput, f.statusSel, f.tafweejSel, f.hint, f.dateInput);
    });
  }
`;
}

/** جزء 5 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart5() {
  return `}

// ═══ معالجة كتابة رقم الرحلة: بحث حي بالاحتواء، حد أدنى رقمان ═══
// لا تعبئة تلقائية أبداً من الكتابة وحدها — القائمة تُعرض دوماً عند وجود
// رحلة واحدة فأكثر تحتوي الرقم المكتوب، وتُحدَّث مع كل رقم يُضاف أو يُحذف.
// التطبيق الفعلي يحدث فقط بنقرة صريحة على عنصر (داخل _renderFltDropdown).
// يُرجع: "listed" (عُرضت قائمة) / "none" (لا فعل، أقل من رقمين أو لا تطابق).
function _handleFlightNumberInput(rawValue, dd) {
  var f = (dd && dd._fields) || {};
  var clean = _cleanFlightNum(rawValue);
  if (clean.length < 2) { _closeFltDropdown(dd); return "none"; }
  var candidates = _matchesForDate(_searchFlightsByDigits(clean), f.dateInput ? f.dateInput.value : "");
  if (candidates.length === 0) { _closeFltDropdown(dd); return "none"; }
  _renderFltDropdown(dd, candidates);
  return "listed";
}

// ═══ تنسيق الوقت المتبقي بصيغة عداد تنازلي س:د:ث ═══
function _formatCountdown(diffHours) {
  var totalSeconds = Math.max(0, Math.round(diffHours * 3600));
  var hh = Math.floor(totalSeconds / 3600);
  var mm = Math.floor((totalSeconds % 3600) / 60);
  var ss = totalSeconds % 60;
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  return pad(hh) + ":" + pad(mm) + ":" + pad(ss);
}

// ═══ تصنيف التفويج إلى فئة (مستخرج من _updateTafweejHint) ═══
function _classifyTafweej(diff, earlyH, ontimeH) {
  if (diff < 0) return { cls: "reg-hint-late", text: "غادرت (منذ " + Math.abs(Math.floor(diff)) + " ساعة)" };
  var cd = _formatCountdown(diff);
  if (diff > earlyH) return { cls: "reg-hint-early", text: "مبكر (+" + cd + ")" };
  if (diff >= ontimeH) return { cls: "reg-hint-ontime", text: "في الموعد (" + cd + ")" };
  if (diff >= 2) return { cls: "reg-hint-late", text: "متأخر (" + cd + ")" };
  return { cls: "reg-hint-early", text: "خطر (" + cd + ")" };
}

// ═══ بناء كائن Date من تاريخ ووقت ═══
// dateStr بصيغة YYYY-MM-DD، timeStr بصيغة HH:MM
// إذا كان dateStr فارغاً نستخدم تاريخ اليوم.
`;
}

/** جزء 6 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart6() {
  return `// لا قفز تلقائي ٢٤ ساعة — التاريخ يحدد اليوم بدقة.
function _buildDepFromDateTime(dateStr, timeStr) {
  if (!timeStr) return null;
  var tp = timeStr.split(":");
  var hh = parseInt(tp[0]||"0");
  var mm = parseInt(tp[1]||"0");
  if (dateStr) {
    var dp = dateStr.split("-");
    if (dp.length === 3) {
      var y = parseInt(dp[0]);
      var mo = parseInt(dp[1]) - 1;
      var d = parseInt(dp[2]);
      return new Date(y, mo, d, hh, mm, 0);
    }
  }
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
}

// ═══ تلميح التفويج ═══
function _updateTafweejHint(stdInput, hint, dateInput) {
  if (!stdInput) return;
  if (!hint) return;
  if (!stdInput.value) return;
  var dateStr = (dateInput && dateInput.value) ? dateInput.value : "";
  var dep = _buildDepFromDateTime(dateStr, stdInput.value);
  if (!dep) return;
  var diff = (dep.getTime() - Date.now()) / 3600000;
  var earlyH = (window._TF_EARLY !== undefined) ? window._TF_EARLY : 8;
  var ontimeH = (window._TF_ONTIME !== undefined) ? window._TF_ONTIME : 4;
  var c = _classifyTafweej(diff, earlyH, ontimeH);
  hint.className = "reg-tafweej-hint";
  hint.textContent = c.text;
  hint.classList.add(c.cls);
}

// ═══ عداد النماذج المسجّلة ═══
function updateRegCounter() {
  var count = regFormsContainer.querySelectorAll(".reg-form").length;
  if (regCounter) regCounter.textContent = count + " رحلة مسجّلة";
`;
}

/** جزء 7 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart7() {
  return `}

// ═══ كشف صالة الرحلة وتطبيق منطقها على التفويج فقط ═══
// إذا الرحلة في صالة 1 أو الشمالية → التفويج "خاطئ صالة X"، وحقل الوجهة
// يبقى دائمًا اسم المدينة الحقيقي (يُعبَّأ لاحقًا في _refillFromFlight)
// إذا الرحلة في صالة الحج أو غير محددة → السلوك الافتراضي
function _applyTerminalLogic(flight, destInput, tafweejSel) {
  var t = (flight && flight.terminal) || "";
  if (t === "t1") {
    if (tafweejSel) tafweejSel.value = "wrong_t1";
    return true;
  }
  if (t === "north") {
    if (tafweejSel) tafweejSel.value = "wrong_north";
    return true;
  }
  return false;
}

// ═══ تعبئة الحقول من بيانات الرحلة (مساعد مشترك) ═══
// يُستعمل عند الكتابة برقم الرحلة وعند تغيير تاريخها لتجنّب تكرار المنطق.
// يرجع true إذا الصالة "خطأ" (لتجاوز إعادة حساب التفويج لاحقاً).
// حقل الوجهة يُعبَّأ دائمًا باسم المدينة الحقيقي — بصرف النظر عن حالة الصالة.
function _refillFromFlight(flight, stdInput, destInput, tafweejSel) {
  if (!flight) return false;
  if (stdInput && flight.std) stdInput.value = flight.std;
  var isWrong = _applyTerminalLogic(flight, destInput, tafweejSel);
  if (destInput) destInput.value = _destCountryName(flight.to);
  return isWrong;
}

// ═══ تطبيق التصنيف التلقائي للتفويج والحالة (مستخرج لخفض التعقيد الدوري) ═══
function _applyDerivedStatus(dep, statusSel, tafweejSel, isWrongTerminal) {
  if (!isWrongTerminal && tafweejSel) tafweejSel.value = _computeAutoTafweejFromDep(dep);
  if (statusSel) statusSel.value = _computeAutoStatusFromDep(dep);
}

// ═══ تطبيق رحلة مختارة على الحقول (مشترك بين التعبئة التلقائية واختيار القائمة) ═══
function _applyFlightToForm(flight, fltInput, stdInput, destInput, statusSel, tafweejSel, hint, dateInput) {
  if (!flight || !fltInput) return;
`;
}

/** جزء 8 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart8() {
  return `  var displayCode = _flightDisplayCode(flight);
  if (displayCode) fltInput.value = displayCode;
  var isWrongTerminal = _refillFromFlight(flight, stdInput, destInput, tafweejSel);
  var dep = _buildDepFromDateTime(dateInput ? dateInput.value : "", stdInput ? stdInput.value : "");
  _applyDerivedStatus(dep, statusSel, tafweejSel, isWrongTerminal);
  _updateTafweejHint(stdInput, hint, dateInput);
  if (typeof showToast === "function") showToast("تم تعبئة بيانات " + flight.flt, "info", 1500);
}

// ═══ ربط حدث رقم الرحلة (بحث حي بالاحتواء بدءاً من رقمين) ═══
// كل ضغطة رقم تعيد البحث وتحدّث القائمة — لا تعبئة تلقائية من الكتابة وحدها
// مهما كان عدد المطابقات؛ التطبيق فقط بنقرة صريحة على عنصر من القائمة.
function _bindFltAutoFill(form, fltInput, stdInput, destInput, statusSel, tafweejSel, hint, dateInput, dd) {
  if (!fltInput) return;
  fltInput.addEventListener("input", function(){
    _handleFlightNumberInput(this.value, dd);
  });
}

// ═══ ربط حدث وقت الإقلاع (تحديث تلميح التفويج) ═══
function _bindStdChange(stdInput, hint, tafweejSel, dateInput, statusSel) {
  if (!stdInput || !hint) return;
  stdInput.addEventListener("change", function(){
    _updateTafweejHint(stdInput, hint, dateInput);
    var dep = _buildDepFromDateTime(dateInput ? dateInput.value : "", stdInput.value);
    if (tafweejSel) tafweejSel.value = _computeAutoTafweejFromDep(dep);
    if (statusSel) statusSel.value = _computeAutoStatusFromDep(dep);
  });
}

// ═══ ربط حدث تاريخ الإقلاع (تحديث التلميح + إعادة بحث الرحلة) ═══
// إذا كان رقم الرحلة مكتوباً وظهرت قائمة على التاريخ الجديد → تبقى القائمة معروضة (لا سقوط احتياطي).
// غير ذلك (فارغ/أقل من رقمين/لا تطابق) → تحديث التلميح والحالة بالوقت الحالي فقط.
function _bindDateChange(dateInput, fltInput, stdInput, destInput, statusSel, tafweejSel, hint, dd) {
  if (!dateInput) return;
  dateInput.addEventListener("change", function(){
    var result = (fltInput && fltInput.value) ? _handleFlightNumberInput(fltInput.value, dd) : "none";
    if (result === "listed") return;
    _updateTafweejHint(stdInput, hint, dateInput);
    var dep = _buildDepFromDateTime(dateInput.value, stdInput ? stdInput.value : "");
`;
}

/** جزء 9 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart9() {
  return `    _applyDerivedStatus(dep, statusSel, tafweejSel, false);
  });
}

// ═══ تعبئة قيم مسبقة ═══
function _applyPrefill(form, prefill, stdInput, hint, dateInput) {
  if (!prefill) return;
  var keys = ["flt","std","date","status","dest","pax","visa","campaign","tafweej","inspection","note"];
  for (var k = 0; k < keys.length; k++) {
    var el = form.querySelector('[data-key="' + keys[k] + '"]');
    if (el && prefill[keys[k]] !== undefined) el.value = prefill[keys[k]];
  }
  _updateTafweejHint(stdInput, hint, dateInput);
}

// ═══ تنسيق تاريخ اليوم بصيغة YYYY-MM-DD ═══
function _todayIsoDate() {
  var n = new Date();
  var mo = ("0" + (n.getMonth()+1)).slice(-2);
  var d = ("0" + n.getDate()).slice(-2);
  return n.getFullYear() + "-" + mo + "-" + d;
}

// ═══ إضافة نموذج رحلة جديد ═══
function addRegForm(prefill) {
  _regFormId++;
  var myId = _regFormId;
  var tpl = FORM_TEMPLATE;
  tpl = tpl.replace(/__ID__/g, myId);
  tpl = tpl.replace(/__NUM__/g, String(myId).padStart(2, "0"));
  regFormsContainer.insertAdjacentHTML("beforeend", tpl);
  updateRegCounter();

  var form = regFormsContainer.querySelector('[data-form-id="' + myId + '"]');
  if (!form) return;

  var fltInput = form.querySelector('[data-key="flt"]');
  var stdInput = form.querySelector('[data-key="std"]');
  var dateInput = form.querySelector('[data-key="date"]');
  var destInput = form.querySelector('[data-key="dest"]');
`;
}

/** جزء 10 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart10() {
  return `  var statusSel = form.querySelector('[data-key="status"]');
  var tafweejSel = form.querySelector('[data-key="tafweej"]');
  var hint = form.querySelector('[data-hint="' + myId + '"]');
  var delBtn = form.querySelector('[data-del="' + myId + '"]');
  var fltDd = form.querySelector('[data-fltdd="' + myId + '"]');
  if (fltDd) {
    fltDd._fields = {
      fltInput: fltInput, stdInput: stdInput, destInput: destInput,
      statusSel: statusSel, tafweejSel: tafweejSel, hint: hint, dateInput: dateInput
    };
  }

  // تعبئة التاريخ افتراضياً بتاريخ اليوم
  if (dateInput && !dateInput.value) dateInput.value = _todayIsoDate();

  // عداد تنازلي حي — يُحدِّث التلميح كل ثانية بلا انتظار حدث تغيير
  _hintTimers[myId] = setInterval(function(){
    _updateTafweejHint(stdInput, hint, dateInput);
  }, 1000);

  if (delBtn) {
    delBtn.addEventListener("click", function(){
      if (_hintTimers[myId]) { clearInterval(_hintTimers[myId]); delete _hintTimers[myId]; }
      form.style.opacity = "0";
      form.style.transform = "scale(0.95)";
      setTimeout(function(){ if (form.parentNode) form.remove(); }, 200);
      updateRegCounter();
    });
  }

  _bindFltAutoFill(form, fltInput, stdInput, destInput, statusSel, tafweejSel, hint, dateInput, fltDd);
  _bindStdChange(stdInput, hint, tafweejSel, dateInput, statusSel);
  _bindDateChange(dateInput, fltInput, stdInput, destInput, statusSel, tafweejSel, hint, fltDd);
  _applyPrefill(form, prefill, stdInput, hint, dateInput);
}

// ═══ جمع كل القيم من النماذج ═══
function _collectForms() {
  var forms = regFormsContainer.querySelectorAll(".reg-form");
  var list = [];
`;
}

/** جزء 11 من نص منطق النماذج، يُجمع في getFormCode بالترتيب. */
function _formCodePart11() {
  return `  for (var i = 0; i < forms.length; i++) {
    var inputs = forms[i].querySelectorAll("[data-key]");
    var row = {};
    for (var j = 0; j < inputs.length; j++) {
      row[inputs[j].getAttribute("data-key")] = (inputs[j].value || "").trim();
    }
    list.push(row);
  }
  return list;
}

// ═══ إغلاق قائمة اختيار رقم الرحلة عند الضغط خارج الحقل ═══
document.addEventListener("click", function(e){
  var openList = regFormsContainer.querySelectorAll(".reg-flt-dd.open");
  for (var i = 0; i < openList.length; i++) {
    var dd = openList[i];
    var field = dd.closest(".reg-field");
    if (field && !field.contains(e.target)) _closeFltDropdown(dd);
  }
});

// ═══ ربط أزرار الإضافة وإعادة الضبط ═══
if (regAddBtn) regAddBtn.addEventListener("click", function(){ addRegForm(); });

if (regResetBtn) {
  regResetBtn.addEventListener("click", async function() {
    if (!(await fqConfirm("مسح النماذج المعروضة؟ (لن تُمسح من القاعدة)"))) return;
    for (var tmrId in _hintTimers) { clearInterval(_hintTimers[tmrId]); }
    _hintTimers = {};
    regFormsContainer.innerHTML = "";
    _regFormId = 0;
    updateRegCounter();
  });
}
`;
}

/**
 * يُرجع نص JS لمنطق إدارة النماذج (إضافة، حذف، تعبئة تلقائية، عداد).
 * يعتمد على متغيرات regFormsContainer و _regFormId المُعرَّفة في getShiftCode.
 * @returns {string}
 */
function getFormCode() {
  return [_formCodePart1(), _formCodePart2(), _formCodePart3(), _formCodePart4(), _formCodePart5(), _formCodePart6(), _formCodePart7(), _formCodePart8(), _formCodePart9(), _formCodePart10(), _formCodePart11()].join("");
}

module.exports = {
  getFormCode,
};
