// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: edit;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_editor.js

/**
 * @module fq_t4_editor
 * @description المسؤولية الواحدة: لوحة تعديل مدخلات نموذج F — تعديل أي
 * حقل في أي سطر مسجَّل سابقًا، وحذف سطر.
 *
 * **خطوتان لا أربع (طلب المستخدم ٢٠٢٦-٠٩-٢٧)**: الحقول مفتوحة منذ فتح
 * اللوحة، ولا زرّ «تعديل» ولا «حفظ» على السطر — «حذف» وحده، و«تمّ» في
 * أسفل القسم يحفظ ما تغيّر ويقفل. وهذا ينقض ما كان قبل اليوم من قفل
 * السطر وفتحه سطرًا سطرًا، وهو نفسه ما فُعل في قسم مخرجات نموذج T4.
 *
 * والعرض بترتيب المخرجات وتقسيمها نفسهما: التجميع والعنوان من
 * `fq_t4_text` لا من قاعدة ثانية هنا.
 *
 * كل سطر سجلّ مستقل في القاعدة، فالتعديل يمسّ مفتاحه وحده ولا يعيد كتابة
 * بقية المخرجات — وهذا ما يجعل عمل موظفَين في الوقت نفسه آمنًا.
 *
 * ولا يعرف المحرّر متى يظهر ولا متى يُخفى: التبديل بينه وبين نص
 * المخرجات في `fq_t4_view` لأنه يملك الزر والنص معًا. كان هنا
 * `t4ToggleEditor` فصار المحرّر يمسّ عنصرًا ليس من مسؤوليته.
 *
 * لا يعرف المحرّر من يعرض المخرجات. بعد كل حفظ أو حذف ينادي
 * `t4AnnounceChange` وحدها، ومن يهمّه الأمر يسجّل نفسه بـ
 * `t4OnEditorChange`. هذا مقصود: كان المحرّر يستدعي `t4Render` في
 * `fq_t4_view` وهي وحدة أعلى منه، فكانت حلقة اعتماد.
 */

function getT4EditorCode() {
  return getT4EditorCodePart1() +
    getT4EditorCodePart2() +
    getT4EditorCodePart3() +
    getT4EditorCodePart4() +
    getT4EditorCodePart5() +
    getT4EditorCodePart6() +
    getT4EditorCodePart7();
}

/** الجزء 1 من 7 من نصّ `getT4EditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4EditorCodePart1() {
  return `
// ═══ T4: لوحة التعديل ═══

// ═══ إعلان التغيير — من يعرض المخرجات يسجّل نفسه هنا ═══
// المحرّر لا يسمّي العارض ولا يستدعيه، فاتجاه الاعتماد يبقى نازلًا.
// كان يستدعي t4Render مباشرة، والعارض يستدعي المحرّر، فكانت حلقة.
let T4_AFTER_CHANGE = null;

function t4OnEditorChange(fn) { T4_AFTER_CHANGE = fn; }

// لو لم يسجّل أحد نفسه، حُفظ التعديل في القاعدة ولم تتغيّر الشاشة —
// عطل صامت بامتياز. الشيكر يمنع سقوطه بلا أثر.
function t4AnnounceChange() {
  if (!t4Assert(typeof T4_AFTER_CHANGE === "function",
    "t4AnnounceChange: لا مستمع مسجَّل — المخرجات لن تُحدَّث")) return;
  T4_AFTER_CHANGE();
}

function t4StatusOption(value, label, current) {
  return '<option value="' + value + '"' +
    (current === value ? " selected" : "") + '>' + label + '</option>';
}

// ═══ خطوتان لا أربع (طلب المستخدم ٢٠٢٦-٠٩-٢٧) ═══
// «الغاء زر التعديل الذي يظهر بجانب زر حذف، كما فعلنا في قسم مخرجات T4».
// فالحقول تُرسم **مفتوحة** منذ فتح اللوحة، ولا زرّ «تعديل» ولا «حفظ» على
// السطر — الباقي «حذف» وحده، و«تمّ» في أسفل القسم يحفظ ما تغيّر.
// وهذا ينقض ما كان قبل اليوم: «كل سطر يُرسم في الحالة المحفوظة: حقول
// مقفلة وزر تعديل».
//`;
}

/** الجزء 2 من 7 من نصّ `getT4EditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4EditorCodePart2() {
  return `
// ═══ علامة «قيد الإرسال» ═══
// محفوظ **عندي** ولم يصل القاعدة بعد. بدونها يرى الموظف سطرًا يبدو
// محفوظًا تمامًا كغيره وهو لم يُرسل. والصنف يُحسب عند كل رسم من الطابور
// نفسه (t4IsPending) ولا يُخزَّن على السطر، فلا تبقى علامة على سطر وصل.
function t4EditorInput(field, value, extra) {
  return '<input class="t4-ein ' + extra + '" data-f="' + field +
    '" value="' + t4Esc(value) + '">';
}

function t4EditorRowHtml(entry, idx) {
  const pending = t4IsPending(entry._key) ? " t4-pending" : "";
  return '<div class="t4-erow' + pending + '" data-idx="' + idx + '">' +
    t4EditorInput("flt", entry.flt, "") +
    t4EditorInput("std", entry.std, "t4-enarrow") +
    t4EditorInput("newStd", entry.newStd, "t4-enarrow") +
    t4EditorInput("dest", entry.dest, "t4-ewide") +
    t4EditorInput("pax", entry.pax, "t4-enarrow") +
    '<select class="t4-esel" data-f="status">' +
      t4StatusOption("red", "🔴", entry.status) +
      t4StatusOption("green", "✅", entry.status) +
      t4StatusOption("yellow", "🟡", entry.status) +
      t4StatusOption("x", "❌", entry.status) +
    '</select>' +
    '<button type="button" class="t4-ebtn t4-edel" data-act="del">حذف</button>' +
    '</div>';
}
`;
}

/** الجزء 3 من 7 من نصّ `getT4EditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4EditorCodePart3() {
  return `
// ═══ الترتيب والتقسيم: نفسهما في القراءة والتعديل ═══
// طلب المستخدم ٢٠٢٦-٠٩-٢٥: «يجب أن تظهر بنفس الترتيب ولا يتغير الترتيب».
// فالتجميع هنا من t4GroupEntries نفسها التي يبني بها t4BuildText النص،
// والعنوان من t4HeadLine نفسها — لا قاعدة تجميع ثانية تنحرف عن الأولى.
// وكانت القائمة قبل ذلك تسرد T4_ENTRIES بترتيب الإدخال بلا عناوين، فكان
// شكل الشاشة يتبدّل بين الوضعين.
//
// الفهرس يُقرأ من T4_ENTRIES بـ indexOf لأن المجموعات تحمل المراجع
// نفسها لا نسخًا. ولا يُبنى فهرس ثانٍ: مصدر واحد للترقيم يمنع انحرافه.
function t4EditorGroupHtml(group) {
  let h = '<div class="t4-egroup">' +
    '<div class="t4-ehead">' + t4OutputHtml(t4HeadLine(group)) + '</div>';
  for (let i = 0; i < group.rows.length; i++) {
    h += t4EditorRowHtml(group.rows[i], T4_ENTRIES.indexOf(group.rows[i]));
  }
  return h + '</div>';
}

function t4RenderEditor() {
  const list = t4El("t4EditorList");
  if (!t4Assert(list, "t4RenderEditor: العنصر t4EditorList مفقود")) return;
  if (T4_ENTRIES.length === 0) {
    list.innerHTML = '<div class="t4-empty">لا مدخلات.</div>';
    return;
  }
  const groups = t4GroupEntries(T4_ENTRIES);
  let h = "";
  for (let i = 0; i < groups.length; i++) h += t4EditorGroupHtml(groups[i]);
  list.innerHTML = h;
}

function t4RowValues(row) {
  const vals = {};
  const fields = row.querySelectorAll("[data-f]");
  for (let i = 0; i < fields.length; i++) {
    vals[fields[i].getAttribute("data-f")] = String(fields[i].value || "").trim();
  }
  return vals;
}
`;
}

/** الجزء 4 من 7 من نصّ `getT4EditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4EditorCodePart4() {
  return `
// newStd يُكتب دائمًا هنا ولو كان فارغًا، بخلاف الإنشاء: إفراغُه هو
// السبيل الوحيد إلى إلغاء تأخيرٍ سُجِّل خطأً، والسطر لا يُرسل أصلًا إلا
// إن تغيّر أحد حقوله — فلا يُكتب فراغ إلا حيث كان قبله وقت.
function t4EditPatch(vals) {
  return {
    flt: vals.flt.toUpperCase(), std: vals.std, newStd: vals.newStd,
    dest: vals.dest, pax: vals.pax, status: vals.status,
    editedBy: t4Author().by,
    editedAt: new Date().toISOString()
  };
}

function t4EditValid(vals) {
  if (vals.flt && vals.pax) return true;
  if (typeof showToast === "function") showToast("رقم الرحلة والعدد مطلوبان", "error", 2500);
  return false;
}
`;
}

/** الجزء 5 من 7 من نصّ `getT4EditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4EditorCodePart5() {
  return `
// ═══ «تمّ» لا يكتب إلا ما تغيّر ═══
// كتابةٌ لا تغيّر شيئًا تراكمُ بيانات، وهو ممنوع بأمر المالك. فتُقارَن
// الحقول الخمسة بالمخزَّن، ولا يُرسل إلا السطر الذي اختلف أحدها فيه.
const T4_EDIT_FIELDS = ["flt", "std", "newStd", "dest", "pax", "status"];

function t4RowChanged(entry, vals) {
  for (let i = 0; i < T4_EDIT_FIELDS.length; i++) {
    const f = T4_EDIT_FIELDS[i];
    if (String(entry[f] == null ? "" : entry[f]) !== vals[f]) return true;
  }
  return false;
}

function t4DirtyRows() {
  const list = t4El("t4EditorList");
  if (!t4Assert(list, "t4DirtyRows: العنصر t4EditorList مفقود")) return [];
  const rows = list.querySelectorAll(".t4-erow");
  const jobs = [];
  for (let i = 0; i < rows.length; i++) {
    const idx = parseInt(rows[i].getAttribute("data-idx"), 10);
    const entry = T4_ENTRIES[idx];
    const vals = t4RowValues(rows[i]);
    if (entry && t4RowChanged(entry, vals)) jobs.push({ idx: idx, vals: vals });
  }
  return jobs;
}

// الباب واحد: كل سطر يمرّ بـ t4PutEntry نفسها، فتبقى طبقة الصلاحيات
// نقطة المنع الوحيدة ولو تعدّدت الأسطر.
async function t4SaveOne(job) {
  const entry = T4_ENTRIES[job.idx];
  if (!t4Assert(entry && entry._key,
    "t4SaveOne: السطر " + job.idx + " بلا مفتاح قاعدة — لا يمكن تعديله")) return false;
  const patch = t4EditPatch(job.vals);
  const res = await t4PutEntry(entry._key, patch);
  if (!res || !res.ok) { t4ReportFailure("تعذّر التعديل", res); return false; }
  T4_ENTRIES[job.idx] = Object.assign({}, entry, patch);
  return true;
}
`;
}

/** الجزء 6 من 7 من نصّ `getT4EditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4EditorCodePart6() {
  return `
// العدد يُقال كما هو. «حُفظ ٢ من ٣» أصدق من «تمّ» على عملٍ لم يتمّ.
function t4ReportSaved(total, done) {
  let okCount = 0;
  for (let i = 0; i < done.length; i++) { if (done[i]) okCount++; }
  if (typeof showToast !== "function") return okCount === total;
  if (okCount === total) showToast("حُفظ " + okCount + " سطرًا", "success", 1600);
  else showToast("حُفظ " + okCount + " من " + total + " سطرًا", "error", 3500);
  return okCount === total;
}

// الأسطر مستقلّة لا يعتمد بعضها على بعض، فتُرسل معًا لا واحدًا بعد واحد.
// وسطرٌ أُفرغ يُرفض **قبل** أي كتابة، فلا يُحفظ نصف تعديل.
async function t4SaveAllEdits() {
  const jobs = t4DirtyRows();
  if (jobs.length === 0) return true;
  for (let i = 0; i < jobs.length; i++) {
    if (!t4EditValid(jobs[i].vals)) return false;
  }
  const done = await Promise.all(jobs.map(function(job) { return t4SaveOne(job); }));
  t4AnnounceChange();
  return t4ReportSaved(jobs.length, done);
}

async function t4ConfirmEntryDelete(entry) {
  return (typeof fqConfirm === "function")
    ? await fqConfirm("حذف السطر: " + entry.flt + " — " + entry.pax + "؟", "تأكيد الحذف")
    : true;
}

async function t4EditorDelete(idx) {
  const entry = T4_ENTRIES[idx];
  if (!t4Assert(entry && entry._key,
    "t4EditorDelete: السطر " + idx + " بلا مفتاح قاعدة — لا يمكن حذفه")) return;
  if (!(await t4ConfirmEntryDelete(entry))) return;
  const res = await t4DeleteEntry(entry._key);
  if (!res || !res.ok) { t4ReportFailure("تعذّر الحذف", res); return; }
  T4_ENTRIES.splice(idx, 1);
  t4AnnounceChange();
  if (typeof showToast === "function") showToast("حُذف السطر", "success", 1600);
}
`;
}

/** الجزء 7 من 7 من نصّ `getT4EditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4EditorCodePart7() {
  return `
// لم يبقَ على السطر إلا «حذف»، وهو يكتب في القاعدة فيمرّ بالقفل المشترك
// t4Guard في fq_t4_report. أمّا الحفظ فمن زرّ «تمّ» في fq_t4_view.
function t4BindEditor() {
  const list = t4El("t4EditorList");
  if (!t4Assert(list, "t4BindEditor: العنصر t4EditorList مفقود — زر الحذف معطَّل")) return;
  list.addEventListener("click", function(ev) {
    // نقرة خارج الأزرار حالة متوقَّعة لا خلل، فلا تأكيد عليها.
    const btn = ev.target.closest ? ev.target.closest('[data-act="del"]') : null;
    if (!btn) return;
    const row = btn.closest(".t4-erow");
    if (!t4Assert(row, "t4BindEditor: زر خارج أي سطر — بنية القائمة تغيّرت")) return;
    const idx = parseInt(row.getAttribute("data-idx"), 10);
    t4Guard(function () { return t4EditorDelete(idx); })
      .catch(function(e) { console.error("[fq_t4] editor", e); });
  });
}

`;
}

module.exports = Object.freeze({ getT4EditorCode });
