// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: keyboard;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_wl_form.js

/**
 * @module fq_wl_form
 * @description المسؤولية الواحدة: نموذج T4 — نافذته وقراءته وتفريغه،
 * وقائمة رقم الرحلة المنسدلة التي تملأ الوقت والوجهة.
 *
 * القائمة المنسدلة هي قائمة تيوب التسجيل نفسها، كما في نموذج F تمامًا
 * (طلب المستخدم ٢٠٢٦-٠٩-٢٦: «بنفس فكرة القائمة التي تظهر عند كتابة رقم
 * الرحلة وتعبئة الحقول تلقائيا»). ومنطق البحث يُستدعى من `fq_t4_form`
 * الذي يستدعيه بدوره من `fq_reg_form` — نسخة واحدة لا ثلاث (الدرس ١٢).
 *
 * **فتح النافذة وإغلاقها هنا لا في وحدة مستقلة**، بخلاف نموذج F الذي
 * أُفردت له `fq_t4_modal`. السبب أن الإغلاق يجب أن يُغلق القائمة المنسدلة
 * معه — وإلا عادت ظاهرة عند الفتح التالي بنتائج بحثٍ قديم — والقائمة من
 * مسؤولية هذه الوحدة. وهناك جاءت الوحدة المستقلة من تاريخٍ لا من حاجة.
 *
 * **الإغلاق بزر ✕ وحده**، كنافذة نموذج F: النموذج يحمل إدخالًا غير محفوظ،
 * ونقرة خطأ على الخلفية كانت ستُضيعه.
 */

function getWlFormCode() {
  return getWlFormCodePart1() +
    getWlFormCodePart2() +
    getWlFormCodePart3() +
    getWlFormCodePart4() +
    getWlFormCodePart5() +
    getWlFormCodePart6();
}

/** الجزء 1 من 6 من نصّ `getWlFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlFormCodePart1() {
  return `
// ═══ T4: النموذج ═══
let WL_STATUS = "";

// ═══ النافذة ═══
function wlOpenModal() {
  const ov = t4El("wlModal");
  if (!t4Assert(ov, "wlOpenModal: العنصر wlModal مفقود — النموذج لا يُفتح")) return;
  ov.classList.add("open");
}

function wlCloseModal() {
  const ov = t4El("wlModal");
  if (!t4Assert(ov, "wlCloseModal: العنصر wlModal مفقود")) return;
  ov.classList.remove("open");
  wlCloseDd();
}

// ═══ القائمة المنسدلة ═══
function wlCloseDd() {
  const dd = t4El("wlFltDd");
  if (!t4Assert(dd, "wlCloseDd: العنصر wlFltDd مفقود")) return;
  dd.classList.remove("open");
  dd.innerHTML = "";
}

function wlDdItemHtml(flight, idx) {
  return '<div class="t4-dd-item" data-idx="' + idx + '">' +
    '<span class="t4-dd-code">' + t4Esc(t4FlightCode(flight)) + '</span>' +
    '<span class="t4-dd-dest">' + t4Esc(t4DestName(flight.to)) +
    " · " + t4Esc(flight.std || "") + '</span></div>';
}
`;
}

/** الجزء 2 من 6 من نصّ `getWlFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlFormCodePart2() {
  return `
function wlRenderDd(matches) {
  const dd = t4El("wlFltDd");
  if (!t4Assert(dd, "wlRenderDd: العنصر wlFltDd مفقود")) return;
  let h = "";
  for (let i = 0; i < matches.length; i++) h += wlDdItemHtml(matches[i], i);
  dd.innerHTML = h;
  dd.classList.add("open");
  const items = dd.querySelectorAll(".t4-dd-item");
  for (let j = 0; j < items.length; j++) {
    items[j].addEventListener("click", function() {
      const flight = matches[parseInt(this.getAttribute("data-idx"), 10)];
      if (!t4Assert(flight, "wlRenderDd: data-idx لا يقابل رحلة في القائمة")) return;
      wlCloseDd();
      wlApplyFlight(flight);
    });
  }
}

// لا تعبئة من الكتابة وحدها — التعبئة بنقرة صريحة على عنصر، كما في نموذج
// F وتيوب التسجيل، لئلا يُملأ حقل بقيمة لم يخترها المستخدم.
function wlApplyFlight(flight) {
  const fltIn = t4El("wlFlt");
  const stdIn = t4El("wlStd");
  const destIn = t4El("wlDest");
  if (fltIn) fltIn.value = t4FlightCode(flight);
  if (stdIn) stdIn.value = flight.std || "";
  if (destIn) destIn.value = t4DestName(flight.to);
  if (typeof showToast === "function") {
    showToast("تم تعبئة بيانات " + t4FlightCode(flight), "info", 1500);
  }
}

function wlShowMatches() {
  const fltIn = t4El("wlFlt");
  const dofIn = t4El("wlDof");
  if (!t4Assert(fltIn, "wlShowMatches: الحقل wlFlt مفقود")) return;
  // حقل فارغ حالة متوقَّعة — المستخدم لم يكتب بعد — لا خلل يُؤكَّد عليه.
  if (!fltIn.value) { wlCloseDd(); return; }
  const matches = t4LookupFlights(fltIn.value, dofIn ? dofIn.value : "");
  if (matches.length === 0) wlCloseDd(); else wlRenderDd(matches);
}
`;
}

/** الجزء 3 من 6 من نصّ `getWlFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlFormCodePart3() {
  return `
// ═══ قراءة النموذج ═══
function wlFieldValue(id) {
  const el = t4El(id);
  return el ? String(el.value || "").trim() : "";
}

function wlReadForm() {
  return {
    dof: wlFieldValue("wlDof"),
    flt: wlFieldValue("wlFlt").toUpperCase(),
    std: wlFieldValue("wlStd"),
    dest: wlFieldValue("wlDest"),
    pax: wlFieldValue("wlPax"),
    ind: wlFieldValue("wlInd"),
    sts: WL_STATUS
  };
}
`;
}

/** الجزء 4 من 6 من نصّ `getWlFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlFormCodePart4() {
  return `
// ═══ لا حقل إلزاميّ (طلب المستخدم ٢٠٢٦-٠٩-٢٦) ═══
// «لا يشترط اي حقل إلزامي من حقول نموذج T4». فلا حقل بعينه يمنع الحفظ.
// **ويبقى شرطٌ واحد**: أن يكون في النموذج شيءٌ يُسجَّل. وتاريخ الرحلة
// خارج العدّ لأنه يبقى بعد كل حفظ، فلولا إخراجه لَحُفظ سطرٌ فارغ عند كل
// نقرة على «نسخ». وهذا حفظٌ للفراغ لا اشتراطُ حقل.
function wlFormReady(form) {
  return Boolean(form.flt || form.std || form.dest || form.pax || form.ind || form.sts);
}

// بعد كل حفظ يعود النموذج نظيفًا وجاهزًا لتسجيل جديد. وتاريخ الرحلة وحده
// يبقى لأنه تاريخ الوردية التي يعمل عليها الموظف، وإعادة اختياره عند كل
// سطر عملٌ زائد. وهو قابل للتغيير يدويًّا في أي وقت.
function wlResetAfterSave() {
  // وحقل الأفراد يُفرَّغ كغيره، ولزومًا لا تجميلًا: المخرجات تجمعه من
  // كل أسطر الرحلة، فبقاؤه في الحقل يُضيفه ثانيةً في السطر التالي.
  const ids = ["wlFlt", "wlStd", "wlDest", "wlPax", "wlInd"];
  for (let i = 0; i < ids.length; i++) {
    const el = t4El(ids[i]);
    if (el) el.value = "";
  }
  WL_STATUS = "";
  wlPaintStatus();
  wlCloseDd();
}

function wlPaintStatus() {
  const group = t4El("wlStGroup");
  if (!t4Assert(group, "wlPaintStatus: العنصر wlStGroup مفقود")) return;
  const btns = group.querySelectorAll(".t4-st");
  for (let i = 0; i < btns.length; i++) {
    if (btns[i].getAttribute("data-st") === WL_STATUS) btns[i].classList.add("on");
    else btns[i].classList.remove("on");
  }
}
`;
}

/** الجزء 5 من 6 من نصّ `getWlFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlFormCodePart5() {
  return `
// ═══ الربط — كل رابط مسؤولية واحدة ═══
function wlInitDate() {
  const dofIn = t4El("wlDof");
  if (!t4Assert(dofIn, "wlInitDate: الحقل wlDof مفقود")) return;
  // حقل فيه تاريخ سلفًا حالة متوقَّعة — لا يُداس على اختيار المستخدم.
  if (!dofIn.value) dofIn.value = t4TodayValue();
}

function wlBindFlightSearch() {
  const fltIn = t4El("wlFlt");
  const dofIn = t4El("wlDof");
  if (!t4Assert(fltIn && dofIn,
    "wlBindFlightSearch: wlFlt أو wlDof مفقود — البحث عن الرحلات معطَّل")) return;
  fltIn.addEventListener("input", wlShowMatches);
  dofIn.addEventListener("change", wlShowMatches);
}

// الرمز المخزَّن هو المعروض على الزر نفسه، فلا خريطة بين الاثنين تنحرف.
function wlToggleStatus(value) {
  WL_STATUS = (WL_STATUS === value) ? "" : value;
  wlPaintStatus();
}

function wlBindStatusButtons() {
  const group = t4El("wlStGroup");
  if (!t4Assert(group, "wlBindStatusButtons: العنصر wlStGroup مفقود — أزرار الحالة معطَّلة")) return;
  group.addEventListener("click", function(ev) {
    const btn = ev.target.closest ? ev.target.closest(".t4-st") : null;
    if (btn) wlToggleStatus(btn.getAttribute("data-st"));
  });
}

function wlClickedInsideDd(target) {
  if (!target.closest) return false;
  return Boolean(target.closest("#wlFltDd") || target.closest("#wlFlt"));
}
`;
}

/** الجزء 6 من 6 من نصّ `getWlFormCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlFormCodePart6() {
  return `
// التأكيد هنا مرّة واحدة عند الربط، لا داخل المستمع: المستمع يعمل عند كل
// نقرة في المستند، وتأكيدٌ فيه يملأ السجلّ بآلاف السطور عن خلل واحد.
function wlBindOutsideClick() {
  if (!t4Assert(t4El("wlFltDd"),
    "wlBindOutsideClick: العنصر wlFltDd مفقود — القائمة لن تُغلق بالنقر خارجها")) return;
  document.addEventListener("click", function(ev) {
    const dd = t4El("wlFltDd");
    if (!dd || !dd.classList.contains("open")) return;
    if (!wlClickedInsideDd(ev.target)) wlCloseDd();
  });
}

function wlBindForm() {
  wlInitDate();
  wlBindFlightSearch();
  wlBindStatusButtons();
  wlBindOutsideClick();
}
`;
}

module.exports = Object.freeze({ getWlFormCode });
