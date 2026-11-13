// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: keyboard;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_form.js

/**
 * @module fq_t4_form
 * @description المسؤولية الواحدة: نموذج الإدخال في T4 — قراءته وتفريغه،
 * وقائمة رقم الرحلة المنسدلة التي تملأ الوقت والوجهة.
 *
 * القائمة المنسدلة هي قائمة تيوب التسجيل نفسها بطلب المستخدم، فمنطق
 * البحث يُستدعى من `fq_reg_form` ولا يُنسخ هنا. نسخة ثانية من قاعدة
 * واحدة تنحرف مع الوقت (الدرس ١٢)، و`tools/check-t4-output.js` يُحمَرّ
 * إن أُعيدت تسمية أي من الدوال المستدعاة.
 */

function getT4FormCode() {
  return getT4FormCodePart1() +
    getT4FormCodePart2() +
    getT4FormCodePart3() +
    getT4FormCodePart4() +
    getT4FormCodePart5() +
    getT4FormCodePart6() +
    getT4FormCodePart7();
}

/** الجزء 1 من 7 من نصّ `getT4FormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4FormCodePart1() {
  return `
// ═══ T4: النموذج ═══
let T4_STATUS = "";

function t4El(id) { return document.getElementById(id); }

function t4Esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ═══ الشطب على الشاشة (اختيار المستخدم ٢٠٢٦-٠٩-٢٧) ═══
// النصّ المبنيّ يحمل علامتَي ~ حول وقت الإقلاع القديم — وهي علامة الشطب
// التي يفهمها واتساب. وهنا وحدها تصير شطبًا مرئيًّا — في صندوق المخرجات
// وفي عناوين لوحة التعديل معًا. وموضعها هنا لا في العارض لأن الاثنين
// يستعملانها، والاعتماد نازل دائمًا فلا يستدعي المحرّرُ العارضَ. وهي
// جارةُ t4Esc عمدًا: كلتاهما نصٌّ يدخل ونصٌّ آمن يخرج بلا عنصر يُلمَس.
// **وهو عرضٌ لا بناء**: الحافظة وواتساب يأخذان نصّ t4BuildText نفسه،
// فلا يُمرَّر ناتج هذه الدالة إلى t4WriteClipboard أبدًا.
// وعددٌ فرديّ من العلامات يعني نصًّا غير متوازن، فيُعرض كما هو بلا شطب.
function t4OutputHtml(txt) {
  const parts = String(txt).split("~");
  if (parts.length % 2 === 0) return t4Esc(txt);
  let h = "";
  for (let i = 0; i < parts.length; i++) {
    h += (i % 2 === 1) ? "<s>" + t4Esc(parts[i]) + "</s>" : t4Esc(parts[i]);
  }
  return h;
}
`;
}

/** الجزء 2 من 7 من نصّ `getT4FormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4FormCodePart2() {
  return `
// ═══ البحث عن الرحلات — مُفوَّض إلى تيوب التسجيل ═══
function t4FlightCode(flight) {
  if (typeof _flightDisplayCode === "function") return _flightDisplayCode(flight);
  return String((flight && flight.al) || "") + String((flight && flight.flt) || "");
}

function t4LookupFlights(raw, dateStr) {
  if (typeof _cleanFlightNum !== "function" || typeof _searchFlightsByDigits !== "function") {
    if (typeof showToast === "function") showToast("تعذّر الوصول إلى قائمة الرحلات", "error", 2500);
    return [];
  }
  const clean = _cleanFlightNum(raw);
  if (clean.length < 2) return [];
  let found = _searchFlightsByDigits(clean);
  if (typeof _matchesForDate === "function") found = _matchesForDate(found, dateStr || "");
  return found;
}
`;
}

/** الجزء 3 من 7 من نصّ `getT4FormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4FormCodePart3() {
  return `
// ═══ القائمة المنسدلة ═══
function t4CloseDd() {
  const dd = t4El("t4FltDd");
  if (!t4Assert(dd, "t4CloseDd: العنصر t4FltDd مفقود")) return;
  dd.classList.remove("open");
  dd.innerHTML = "";
}

function t4DdItemHtml(flight, idx) {
  return '<div class="t4-dd-item" data-idx="' + idx + '">' +
    '<span class="t4-dd-code">' + t4Esc(t4FlightCode(flight)) + '</span>' +
    '<span class="t4-dd-dest">' + t4Esc(t4DestName(flight.to)) +
    " · " + t4Esc(flight.std || "") + '</span></div>';
}

function t4RenderDd(matches) {
  const dd = t4El("t4FltDd");
  if (!t4Assert(dd, "t4RenderDd: العنصر t4FltDd مفقود")) return;
  let h = "";
  for (let i = 0; i < matches.length; i++) h += t4DdItemHtml(matches[i], i);
  dd.innerHTML = h;
  dd.classList.add("open");
  const items = dd.querySelectorAll(".t4-dd-item");
  for (let j = 0; j < items.length; j++) {
    items[j].addEventListener("click", function() {
      const flight = matches[parseInt(this.getAttribute("data-idx"), 10)];
      if (!t4Assert(flight, "t4RenderDd: data-idx لا يقابل رحلة في القائمة")) return;
      t4CloseDd();
      t4ApplyFlight(flight);
    });
  }
}

// لا تعبئة من الكتابة وحدها — التعبئة بنقرة صريحة على عنصر، كما في تيوب
// التسجيل، لئلا يُملأ حقل بقيمة لم يخترها المستخدم.
function t4ApplyFlight(flight) {
  const fltIn = t4El("t4Flt");
  const stdIn = t4El("t4Std");
  const destIn = t4El("t4Dest");
  if (fltIn) fltIn.value = t4FlightCode(flight);
  if (stdIn) stdIn.value = flight.std || "";
  if (destIn) destIn.value = t4DestName(flight.to);
  if (typeof showToast === "function") {
    showToast("تم تعبئة بيانات " + t4FlightCode(flight), "info", 1500);
  }`;
}

/** الجزء 4 من 7 من نصّ `getT4FormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4FormCodePart4() {
  return `
}

function t4ShowMatches() {
  const fltIn = t4El("t4Flt");
  const dateIn = t4El("t4Date");
  if (!t4Assert(fltIn, "t4ShowMatches: الحقل t4Flt مفقود")) return;
  // حقل فارغ حالة متوقَّعة — المستخدم لم يكتب بعد — لا خلل يُؤكَّد عليه.
  if (!fltIn.value) { t4CloseDd(); return; }
  const matches = t4LookupFlights(fltIn.value, dateIn ? dateIn.value : "");
  if (matches.length === 0) t4CloseDd(); else t4RenderDd(matches);
}

// ═══ قراءة النموذج ═══
function t4FieldValue(id) {
  const el = t4El(id);
  return el ? String(el.value || "").trim() : "";
}

function t4ReadForm() {
  return {
    flt: t4FieldValue("t4Flt").toUpperCase(),
    std: t4FieldValue("t4Std"),
    newStd: t4FieldValue("t4New"),
    dest: t4FieldValue("t4Dest"),
    pax: t4FieldValue("t4Pax"),
    status: T4_STATUS,
    date: t4FieldValue("t4Date")
  };
}

function t4FormReady(form) {
  return Boolean(form.flt && form.pax && form.status);
}
`;
}

/** الجزء 5 من 7 من نصّ `getT4FormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4FormCodePart5() {
  return `
// بعد كل حفظ يعود النموذج نظيفًا وجاهزًا لتسجيل جديد: رقم الرحلة والوقت
// والوقت الجديد والوجهة والعدد والحالة تُفرَّغ كلها، والقائمة المنسدلة
// تُغلق. وتفريغ الوقت الجديد لازم لا تحسين: بقاؤه يجعل الرحلة التالية
// تظهر متأخّرة وهي ليست كذلك.
// التاريخ وحده يبقى لأنه تاريخ الوردية التي يعمل عليها الموظف، وإعادة
// اختياره عند كل سطر عملٌ زائد. وهو قابل للتغيير يدويًّا في أي وقت.
function t4ResetAfterSave() {
  const ids = ["t4Flt", "t4Std", "t4New", "t4Dest", "t4Pax"];
  for (let i = 0; i < ids.length; i++) {
    const el = t4El(ids[i]);
    if (el) el.value = "";
  }
  T4_STATUS = "";
  t4PaintStatus();
  t4CloseDd();
}

function t4PaintStatus() {
  const group = t4El("t4StGroup");
  if (!t4Assert(group, "t4PaintStatus: العنصر t4StGroup مفقود")) return;
  const btns = group.querySelectorAll(".t4-st");
  for (let i = 0; i < btns.length; i++) {
    if (btns[i].getAttribute("data-st") === T4_STATUS) btns[i].classList.add("on");
    else btns[i].classList.remove("on");
  }
}

function t4TodayValue() {
  const now = new Date();
  const mm = now.getMonth() + 1;
  const dd = now.getDate();
  return now.getFullYear() + "-" + (mm < 10 ? "0" + mm : mm) + "-" + (dd < 10 ? "0" + dd : dd);
}
`;
}

/** الجزء 6 من 7 من نصّ `getT4FormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4FormCodePart6() {
  return `
// ═══ الربط — كل رابط مسؤولية واحدة ═══
function t4InitDate() {
  const dateIn = t4El("t4Date");
  if (!t4Assert(dateIn, "t4InitDate: الحقل t4Date مفقود")) return;
  // حقل فيه تاريخ سلفًا حالة متوقَّعة — لا يُداس على اختيار المستخدم.
  if (!dateIn.value) dateIn.value = t4TodayValue();
}

function t4BindFlightSearch() {
  const fltIn = t4El("t4Flt");
  const dateIn = t4El("t4Date");
  if (!t4Assert(fltIn && dateIn,
    "t4BindFlightSearch: t4Flt أو t4Date مفقود — البحث عن الرحلات معطَّل")) return;
  fltIn.addEventListener("input", t4ShowMatches);
  dateIn.addEventListener("change", t4ShowMatches);
}

function t4ToggleStatus(value) {
  T4_STATUS = (T4_STATUS === value) ? "" : value;
  t4PaintStatus();
}

function t4BindStatusButtons() {
  const group = t4El("t4StGroup");
  if (!t4Assert(group, "t4BindStatusButtons: العنصر t4StGroup مفقود — أزرار الحالة معطَّلة")) return;
  group.addEventListener("click", function(ev) {
    const btn = ev.target.closest ? ev.target.closest(".t4-st") : null;
    if (btn) t4ToggleStatus(btn.getAttribute("data-st"));
  });
}

function t4ClickedInsideDd(target) {
  if (!target.closest) return false;
  return Boolean(target.closest("#t4FltDd") || target.closest("#t4Flt"));
}
`;
}

/** الجزء 7 من 7 من نصّ `getT4FormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4FormCodePart7() {
  return `
// التأكيد هنا مرّة واحدة عند الربط، لا داخل المستمع: المستمع يعمل عند
// كل نقرة في المستند، وتأكيدٌ فيه يملأ السجلّ بآلاف السطور عن خلل واحد.
function t4BindOutsideClick() {
  if (!t4Assert(t4El("t4FltDd"),
    "t4BindOutsideClick: العنصر t4FltDd مفقود — القائمة لن تُغلق بالنقر خارجها")) return;
  document.addEventListener("click", function(ev) {
    // قائمة مغلقة حالة متوقَّعة، وهي الغالبة.
    const dd = t4El("t4FltDd");
    if (!dd || !dd.classList.contains("open")) return;
    if (!t4ClickedInsideDd(ev.target)) t4CloseDd();
  });
}

function t4BindForm() {
  t4InitDate();
  t4BindFlightSearch();
  t4BindStatusButtons();
  t4BindOutsideClick();
}
`;
}

module.exports = Object.freeze({ getT4FormCode });
