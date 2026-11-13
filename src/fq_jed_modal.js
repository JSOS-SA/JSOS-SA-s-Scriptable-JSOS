// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_jed_modal.js

/**
 * @module fq_jed_modal
 * @description المسؤولية الواحدة: نافذتا الرحلة في تيوب LIVE FLT، في عنصر
 * `#jedModal` واحد:
 *
 * - **الضغط القصير ← نافذة الاختيار**: قيمة كل موقع تحت كل معلومة، والضغط
 *   على قيمة يجعلها المعتمدة (`source` = اسم الموقع).
 * - **الضغط المطوّل ← نافذة التعديل** (أمر المالك ٢٠٢٦-١٠-٠٣، واختياره
 *   «قصير للاختيار، مطوّل للتعديل»): الصالة قائمة منسدلة بأربع صالات منها
 *   صالة الحج، والحالة قائمة منسدلة، والوقتان خانتا وقت تفتحان عجلة الوقت
 *   في الجوال، والوجهة باقتراح حقل الوجهة في «إضافة رحلة» نفسه
 *   (`afDestMatches` في `fq_addflight` لا نسخة منه). وكل ما يُحفظ هنا
 *   `source` = `manual`، فيغلب في الطرفية حتى يختار أحد غيره.
 *
 * - **نافذة الوقت** (أمر المالك ٢٠٢٦-١٠-٠٥) أثناء الترحيل إلى كايا: أيّ الوقتين
 *   يُرحَّل، المجدول أم المتوقع. وكل ما يخصّ الترحيل يمرّ بـ `JED.walk` الذي
 *   تملكه `fq_jed_transfer`، فلا تعرف هذه الوحدة من فوقها (الاعتماد نازل).
 *
 * **«حفظ» لا يكتب إلا ما تغيّر**، وبطلب واحد لكل الرحلة: كتابةٌ لا تغيّر
 * شيئًا تراكمُ بيانات ممنوع بأمر المالك. والوجهة تُحفظ برمز المطار لا
 * باسمه، كي تعرضها الطرفية بملفها والجوال بملفه.
 *
 * **ونافذة التعديل لا يُعاد رسمها** حين يصل تحديث من القاعدة، وإلا ضاع ما
 * كتبه الموظف. ونافذة الاختيار تُعاد بآخر القيم.
 *
 * والنافذة مكوّن `.ef-*` العام، وحقول التعديل بأصناف `.t4-form-win` نفسها
 * التي تحملها نافذتا T4 (الدرس ٢٨: لا شكل حقول ثانٍ).
 */

/**
 * شيفرة نافذتي الرحلة التي تعمل داخل الصفحة.
 * @returns {string} نص JavaScript للمتصفح
 */
function getJedModalCode() {
  return getJedModalCodePart1() +
    getJedModalCodePart2() +
    getJedModalCodePart3() +
    getJedModalCodePart4() +
    getJedModalCodePart5() +
    getJedModalCodePart6() +
    getJedModalCodePart7() +
    getJedModalCodePart8() +
    getJedModalCodePart9();
}

/** الجزء 1 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart1() {
  return `
// ═══ LIVE FLT: نافذتا الرحلة ═══
function jedOpenNode() {
  return JED.open ? jedStore()[JED.open] : null;
}

function jedNum(n) {
  return String((n.n || [JED.open])[0]);
}

function jedShowModal(key, mode) {
  JED.open = key;
  JED.mode = mode;
  jedRenderModal();
  const ov = t4El("jedModal");
  if (t4Assert(ov, "jedShowModal: العنصر jedModal مفقود")) ov.classList.add("open");
}

function jedCloseModal() {
  const ov = t4El("jedModal");
  if (ov) ov.classList.remove("open");
  JED.open = null;
  JED.mode = "";
}

function jedRenderModal() {
  const box = t4El("jedDetail");
  if (!t4Assert(box, "jedRenderModal: العنصر jedDetail مفقود")) return;
  const n = jedOpenNode();
  if (!n) { jedModalGone(box); return; }
  jedModalTitle(n);
  box.innerHTML = jedModalNote() + jedModalBody(n);
}

`;
}

/** الجزء 2 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart2() {
  return `
// الرحلة المفتوحة خرجت من القائمة: أثناء الترحيل تُتخطّى إلى التالية، وإلا تُكتب رسالة.
function jedModalGone(box) {
  if (JED.walk && JED.walk.onGone) {
    JED.walk.onGone();   // خرجت أثناء تتابع الترحيل: تُتخطّى إلى التالية ولا تعلق النافذة
    return;
  }
  box.innerHTML = '<div class="jed-msg">خرجت هذه الرحلة من قائمة الصالة.</div>';
}

// عنوان النافذة: وضعها ثم أرقام الرحلة ووجهتها.
function jedModalTitle(n) {
  const title = t4El("jedModalTitle");
  if (title) {
    title.textContent = (JED.mode === "edit" ? "تعديل الرحلة " : "الرحلة ") +
      (n.n || []).join(" / ") + "   " + jedShown(n, "dest", ((n.f || {}).dest || {}).v);
  }
}

// ملاحظة تتابع الترحيل فوق المحتوى إن وُجدت.
function jedModalNote() {
  return JED.walk && JED.walk.note ? '<div class="jed-msg jed-walk">' + t4Esc(JED.walk.note) + "</div>" : "";
}

function jedModalBody(n) {
  return JED.mode === "edit" ? jedEditHtml(n) : JED.mode === "time" ? jedTimeHtml() : jedPickHtml(n);
}
`;
}

/** الجزء 3 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart3() {
  return `
// ═══ نافذة الوقت: أيّ الوقتين يُرحَّل إلى كايا ═══
function jedTimeHtml() {
  const c = (JED.walk && JED.walk.clock) || {};
  return '<button type="button" class="jed-opt" data-time="sched">○ المجدول ' + t4Esc(c.sched || "—") +
    "</button>" + '<button type="button" class="jed-opt" data-time="est">○ المتوقع ' +
    t4Esc(c.est || "—") + "</button>";
}

// يُستدعى عند وصول تحديث: نافذة الاختيار بآخر القيم، ونافذة التعديل لا تُمسّ.
function jedRefreshModal() {
  if (JED.open && JED.mode === "pick") jedRenderModal();
}

// ═══ نافذة الاختيار ═══
// مصدر القيمة المعتمدة كما يكتبه الخادم في حقل st.
const JED_HOW = { manual: " (مكتوبة باليد)", chosen: " (اختيارك)", rule: " (قاعدة شركة الطيران)",
  auto: " (تلقائيًا بعد موعد الإقلاع)" };
function jedPickField(n, field, title) {
  const r = (n.f || {})[field] || {};
  let h = '<div class="jed-fld">';
  if (r.st === "conflict") h += '<div class="jed-fh jed-cf">⚠ ' + title + ": خلاف بين المواقع</div>";
  else if (r.st === "manual" || r.st === "chosen" || r.st === "rule") {
    h += '<div class="jed-fh jed-ok">' + (r.st === "manual" ? "✎ " : "✓ ") + title + ": " +
      t4Esc(jedShown(n, field, r.v)) + JED_HOW[r.st] + "</div>";
  } else if (r.st === "auto") {
    h += '<div class="jed-fh">' + title + ": " + t4Esc(jedShown(n, field, r.v)) + JED_HOW.auto + "</div>";
  } else h += '<div class="jed-fh">' + title + ": " + t4Esc(jedShown(n, field, r.v)) + "</div>";
  const s = r.s || {};
  JED_SITE_ORDER.concat(JED_SITE_STOPPED).forEach(function(k) {
    if (!s[k]) return;
    const on = r.st === "chosen" && s[k] === r.v;
    h += '<button type="button" class="jed-opt' + (on ? " on" : "") + '" data-f="' + field +
      '" data-src="' + k + '" data-v="' + t4Esc(s[k]) + '">' + (on ? "● " : "○ ") +
      JED_SITES[k] + ": " + t4Esc(jedShown(n, field, s[k])) + "</button>";
  });
  return h + "</div>";
}

function jedPickHtml(n) {
  let h = '<div class="jed-msg">اضغط على القيمة الصحيحة المطابقة لموقع المطار الرسمي.' +
    " وللتعديل اضغط مطوّلًا على الرحلة في الجدول.</div>";
  if (n.c) h += '<div class="jed-msg">الكاونتر: ' + t4Esc(n.c) + "</div>";
  if (n.g) h += '<div class="jed-msg jed-cf">لم يعد أي موقع يعرض هذه الرحلة؛ هذا آخر ما عُرف عنها.</div>';
  JED_FIELDS.forEach(function(p) { h += jedPickField(n, p[0], p[1]); });
  return h;`;
}

/** الجزء 4 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart4() {
  return `
}

async function jedPick(field, value, source) {
  const key = JED.open;
  const n = jedOpenNode();
  if (!n) return false;
  const picks = jedSinglePick(field, value, source);
  if (!(await jedSaveChoices(jedNum(n), picks))) return jedSaveFailed();
  return jedAfterPick(field, value, key);
}

// اختيار حقلٍ واحد بقيمته ومصدرها.
function jedSinglePick(field, value, source) {
  const picks = {};
  picks[field] = { value: value, source: source };
  return picks;
}

// الحفظ لم يصل: رسالة خطأ، والنتيجة false.
function jedSaveFailed() {
  showToast("تعذّر الحفظ — تحقّق من الاتصال وأعد المحاولة", "error", 3000);
  return false;
}

// بعد حفظ اختيار: رسالة النجاح، وإبلاغ تتابع الترحيل إن كان قائمًا.
function jedAfterPick(field, value, key) {
  showToast("حُفظ — يظهر في الجدول وفي الحاسوب خلال دقيقة", "success", 3000);
  if (JED.walk && JED.walk.onPick) JED.walk.onPick(field, value, key);
  return true;
}

`;
}

/** الجزء 5 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart5() {
  return `
// ═══ نافذة التعديل ═══
function jedCurrent(n, field) {
  const r = (n.f || {})[field] || {};
  return r.st === "conflict" ? "" : (r.v == null ? "" : String(r.v));
}

function jedSelectHtml(id, list, current) {
  const known = list.some(function(o) { return o[0] === current; });
  let h = '<select class="t4-in" id="' + id + '">';
  if (!known) h += '<option value="" selected>— اختر —</option>';
  list.forEach(function(o) {
    h += '<option value="' + t4Esc(o[0]) + '"' + (o[0] === current ? " selected" : "") + ">" +
      t4Esc(o[1]) + "</option>";
  });
  return h + "</select>";
}

function jedDestLabel(code) {
  const ap = typeof AIRPORTS !== "undefined" ? AIRPORTS[code] : null;
  if (!ap) return code;
  return ap.c + (ap.c !== ap.d ? " — " + ap.d : "");
}
`;
}

/** الجزء 6 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart6() {
  return `
function jedEditHtml(n) {
  const dest = jedCurrent(n, "dest");
  const statuses = JED_STATUSES.map(function(s) { return [s[0], s[1] + " — " + s[0]]; });
  return '<div class="jed-msg">غيّر ما تريد ثم اضغط «حفظ». ما تحفظه هنا يغلب قيم المواقع' +
    " حتى يختار أحد غيره.</div>" +
    '<div class="t4-row"><label class="t4-lb" for="jedEdTerminal">الصالة</label>' +
    jedSelectHtml("jedEdTerminal", JED_EDIT_TERMS, jedCurrent(n, "terminal")) + "</div>" +
    '<div class="t4-row"><label class="t4-lb" for="jedEdSched">STD</label>' +
    '<input type="time" class="t4-in" id="jedEdSched" dir="ltr" value="' +
    t4Esc(jedClock(jedCurrent(n, "sched"))) + '"></div>' +
    '<div class="t4-row"><label class="t4-lb" for="jedEdEst">ETD</label>' +
    '<input type="time" class="t4-in" id="jedEdEst" dir="ltr" value="' +
    t4Esc(jedClock(jedCurrent(n, "est"))) + '"></div>' +
    '<div class="t4-row t4-rel"><label class="t4-lb" for="jedEdDest">الوجهة</label>' +
    '<input type="text" class="t4-in" id="jedEdDest" autocomplete="off" placeholder="CAI أو القاهرة"' +
    ' data-code="' + t4Esc(dest) + '" value="' + t4Esc(dest ? jedDestLabel(dest) : "") + '">' +
    '<div class="af-suggest" id="jedEdSuggest"></div></div>' +
    '<div class="t4-row"><label class="t4-lb" for="jedEdStatus">الحالة</label>' +
    jedSelectHtml("jedEdStatus", statuses, jedCurrent(n, "status")) + "</div>" +
    '<button type="button" class="jed-save" id="jedEdSave">حفظ</button>';
}

// اقتراح الوجهة: المطابقة من afDestMatches، والرسم هنا بأصناف قائمة «إضافة رحلة».
function jedDestInput(input) {
  const list = t4El("jedEdSuggest");
  if (!list) return;
  const found = afDestMatches(input.value);
  input.setAttribute("data-code", found.code);
  if (!found.results.length) { list.classList.remove("open"); return; }
  list.innerHTML = found.results.map(function(r) {
    return '<div class="af-sug-item" data-code="' + t4Esc(r.code) + '" data-name="' + t4Esc(r.label) +
      '"><span class="af-sug-name">' + t4Esc(r.label) + '</span><span class="af-sug-code">' +
      t4Esc(r.code) + "</span></div>";
  }).join("");
  list.classList.add("open");
}

function jedDestPick(item) {
  const input = t4El("jedEdDest");
  const list = t4El("jedEdSuggest");
  if (input) {
    input.value = item.getAttribute("data-name");
    input.setAttribute("data-code", item.getAttribute("data-code"));
  }
  if (list) list.classList.remove("open");`;
}

/** الجزء 7 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart7() {
  return `
}

function jedEditValue(id) {
  const el = t4El(id);
  return el ? String(el.value || "").trim() : "";
}

// ما تغيّر وحده، أو نصّ سبب الرفض.
function jedEditPicks(n) {
  const picks = {};
  const wanted = {
    terminal: jedEditValue("jedEdTerminal"),
    sched: jedEditValue("jedEdSched"),
    est: jedEditValue("jedEdEst"),
    dest: (t4El("jedEdDest") || { getAttribute: function() { return ""; } }).getAttribute("data-code") || "",
    status: jedEditValue("jedEdStatus")
  };
  if (!wanted.dest && jedEditValue("jedEdDest")) return "اختر الوجهة من القائمة";
  Object.keys(wanted).forEach(function(field) {
    let now = jedCurrent(n, field);
    if (field === "sched" || field === "est") now = jedClock(now);
    if (wanted[field] && wanted[field] !== now) picks[field] = { value: wanted[field], source: "manual" };
  });
  return picks;
}

`;
}

/** الجزء 8 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart8() {
  return `
async function jedEditSave() {
  const n = jedOpenNode();
  if (!n) return false;
  const picks = jedEditPicks(n);
  const refused = jedEditRefuse(picks);
  if (refused) return refused.result;
  if (!(await jedSaveChoices(jedNum(n), picks))) return jedSaveFailed();
  return jedEditDone();
}

// اختيارات لا تُحفظ: نصّ خطأ ← يُعرض ونتيجتها false، وفراغ ← «لم يتغيّر شيء» ونتيجته null.
// يُرجع {result} بعد عرض الرسالة، وundefined إن صحّت الاختيارات.
function jedEditRefuse(picks) {
  if (typeof picks === "string") { showToast(picks, "error", 2500); return { result: false }; }
  if (!Object.keys(picks).length) { showToast("لم يتغيّر شيء", "info", 2000); return { result: null }; }
  return undefined;
}

// بعد حفظ التعديل: رسالة النجاح ثم إغلاق النافذة.
function jedEditDone() {
  showToast("حُفظ — يظهر في الجدول وفي الحاسوب خلال دقيقة", "success", 3000);
  jedCloseModal();
  return true;
}
`;
}

/** الجزء 9 من 9 من نصّ `getJedModalCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedModalCodePart9() {
  return `
function jedModalClick(e) {
  const t = e.target;
  const item = t && t.closest ? t.closest(".af-sug-item") : null;
  if (item) { jedDestPick(item); return; }
  const b = t && t.closest ? t.closest("button") : null;
  if (!b) return;
  jedButtonClick(b);
}

// زرّ في النافذة: حفظ التعديل، أو اختيار وقت الترحيل، أو اختيار قيمة.
function jedButtonClick(b) {
  if (b.id === "jedEdSave") {
    jedEditSave().catch(function(err) { console.error("[fq_jed] حفظ التعديل", err); });
    return;
  }
  if (b.getAttribute("data-time")) {
    if (JED.walk && JED.walk.onTime) JED.walk.onTime(b.getAttribute("data-time"));
    return;
  }
  if (b.getAttribute("data-src")) {
    jedPick(b.getAttribute("data-f"), b.getAttribute("data-v"), b.getAttribute("data-src"))
      .catch(function(err) { console.error("[fq_jed] اختيار", err); });
  }
}

function jedBindModal() {
  const box = t4El("jedDetail");
  if (t4Assert(box, "jedBindModal: العنصر jedDetail مفقود")) {
    box.addEventListener("click", jedModalClick);
    box.addEventListener("input", function(e) {
      if (e.target && e.target.id === "jedEdDest") jedDestInput(e.target);
    });
  }
  // الإغلاق أثناء الترحيل يلغيه (أمر المالك): JED.walk يُبلَّغ بعد الإغلاق.
  t4OnClick("jedModalClose", function() {
    const walk = JED.walk;
    jedCloseModal();
    if (walk && walk.onClose) walk.onClose();
    return null;
  });
}
`;
}

module.exports = Object.freeze({ getJedModalCode });
