// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: edit;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_wl_editor.js

/**
 * @module fq_wl_editor
 * @description المسؤولية الواحدة: لوحة تعديل مدخلات نموذج T4 — تعديل أي
 * حقل في أي سطر مسجَّل سابقًا، وحذف سطر.
 *
 * **خطوتان لا أربع (طلب المستخدم ٢٠٢٦-٠٩-٢٧)**: تُفتح اللوحة فتُفتح كل
 * الحقول، ويُغيَّر ما يُراد تغييره، ثم «تمّ» يحفظ ما تغيّر وحده ويقفل.
 * فلا زرّ «تعديل» على السطر ولا زرّ «حفظ»؛ الباقي «حذف» وحده. **وقسم
 * نموذج F لم يُمسّ** — المطلوب في مخرجات T4 وحدها بتصحيح المستخدم.
 *
 * **والعرض بترتيب المخرجات وتقسيمها نفسهما** (الطلب نفسه): عنوان الرحلة
 * وتحته أسطرها، من `wlGroupEntries` و`wlHeadFlight` لا من قاعدة ثانية
 * هنا. وكان سطرًا لكل تسجيل بترتيب تسجيله، فكان شكل الشاشة يتبدّل بين
 * القراءة والتعديل. وسطرا المجاميع ليسا في العنوان هنا: ما يُعدَّل هو
 * **سطر القاعدة** بمفتاحه، والمجاميع محسوبة من الأسطر لا مخزَّنة.
 * وعدد الأفراد حقل محرَّر كغيره، فخطأٌ فيه يُصحَّح ولا يلزم حذف السطر.
 *
 * كل سطر سجلّ مستقل في القاعدة، فالتعديل يمسّ مفتاحه وحده ولا يعيد كتابة
 * بقية المخرجات — وهذا ما يجعل عمل موظفَين في الوقت نفسه آمنًا.
 *
 * ولا يعرف المحرّر من يعرض المخرجات: بعد كل حفظ أو حذف ينادي
 * `wlAnnounceChange` وحدها، ومن يهمّه الأمر يسجّل نفسه بـ
 * `wlOnEditorChange`. وبهذا يبقى اتجاه الاعتماد نازلًا بلا حلقة.
 */

function getWlEditorCode() {
  return getWlEditorCodePart1() +
    getWlEditorCodePart2() +
    getWlEditorCodePart3() +
    getWlEditorCodePart4() +
    getWlEditorCodePart5() +
    getWlEditorCodePart6() +
    getWlEditorCodePart7();
}

/** الجزء 1 من 7 من نصّ `getWlEditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlEditorCodePart1() {
  return `
// ═══ T4: لوحة التعديل ═══
let WL_AFTER_CHANGE = null;

function wlOnEditorChange(fn) { WL_AFTER_CHANGE = fn; }

// لو لم يسجّل أحد نفسه، حُفظ التعديل في القاعدة ولم تتغيّر الشاشة —
// عطل صامت بامتياز. الشيكر يمنع سقوطه بلا أثر.
function wlAnnounceChange() {
  if (!t4Assert(typeof WL_AFTER_CHANGE === "function",
    "wlAnnounceChange: لا مستمع مسجَّل — المخرجات لن تُحدَّث")) return;
  WL_AFTER_CHANGE();
}

// الخيارات من WL_STATUSES نفسها التي تبني منها المخرجات وأزرار النموذج،
// فإضافة حالة في موضع ونسيانها في الآخر مستحيلة بنيويًّا.
function wlStatusOptions(current) {
  let h = "";
  for (let i = 0; i < WL_STATUSES.length; i++) {
    const code = WL_STATUSES[i];
    h += '<option value="' + code + '"' +
      (current === code ? " selected" : "") + '>' + code + '</option>';
  }
  return h;
}

function wlEditorInput(field, value, extra) {
  return '<input class="t4-ein ' + extra + '" data-f="' + field +
    '" value="' + t4Esc(value) + '">';
}
`;
}

/** الجزء 2 من 7 من نصّ `getWlEditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlEditorCodePart2() {
  return `
// ═══ كل الحقول مفتوحة، وزرّ الحذف وحده على السطر ═══
// طلب المستخدم ٢٠٢٦-٠٩-٢٧: «تمكين التعديل بمجرّد الضغط على أول زر تعديل،
// ونلغي زر التعديل الذي يظهر بجانب زر الحذف كي نختصر الخطوات ولا
// نكرّرها». فلا زرّ «تعديل» على السطر ولا زرّ «حفظ»: الحقول مفتوحة منذ
// فتح اللوحة، و«تمّ» في أسفل القسم هو الحافظ. وقسم نموذج F لم يُمسّ —
// المطلوب في مخرجات T4 وحدها بتصحيح المستخدم.
//
// والحالة «قيد الإرسال» تُحسب عند كل رسم من الطابور نفسه ولا تُخزَّن على
// السطر، فلا تبقى علامة انتظار على سطر وصل.
function wlEditorRowHtml(entry, idx) {
  const pending = wlIsPending(entry._key) ? " t4-pending" : "";
  return '<div class="t4-erow' + pending + '" data-idx="' + idx + '">' +
    '<input type="date" class="t4-ein wl-edate" data-f="dof" value="' +
      t4Esc(entry.dof) + '">' +
    wlEditorInput("flt", entry.flt, "") +
    wlEditorInput("std", entry.std, "t4-enarrow") +
    wlEditorInput("dest", entry.dest, "t4-ewide") +
    wlEditorInput("pax", entry.pax, "t4-enarrow") +
    wlEditorInput("ind", entry.ind, "t4-enarrow") +
    '<select class="t4-esel" data-f="sts">' + wlStatusOptions(entry.sts) + '</select>' +
    '<button type="button" class="t4-ebtn t4-edel" data-act="del">حذف</button>' +
    '</div>';
}
`;
}

/** الجزء 3 من 7 من نصّ `getWlEditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlEditorCodePart3() {
  return `
// ═══ الترتيب والتقسيم: نفسهما في القراءة والتعديل ═══
// طلب المستخدم ٢٠٢٦-٠٩-٢٧: «الحفاظ على الشكل والترتيب، عنوان وأسفله كل
// الأسطر الخاصة به، ولا تتغيّر حسب وقت التسجيل — فعلناها في قسم مدخلات
// F». فالتجميع من الدالة نفسها التي تبني بها المخرجات مجموعاتها،
// والعنوان من دالّة سطر الرحلة نفسها — لا قاعدة تجميع ثانية تنحرف عن
// الأولى. وسطرا المجاميع لا يُعرضان هنا: مجاميعُ محسوبة لا حقولَ تُحرَّر.
//
// والفهرس يُقرأ من WL_ENTRIES بـ indexOf لأن المجموعات تحمل المراجع
// نفسها لا نسخًا. ولا يُبنى فهرس ثانٍ: مصدر واحد للترقيم يمنع انحرافه.
function wlEditorGroupHtml(group) {
  let h = '<div class="t4-egroup">' +
    '<div class="t4-ehead">' + t4Esc(wlHeadFlight(group)) + '</div>';
  for (let i = 0; i < group.rows.length; i++) {
    h += wlEditorRowHtml(group.rows[i], WL_ENTRIES.indexOf(group.rows[i]));
  }
  return h + '</div>';
}

function wlRenderEditor() {
  const list = t4El("wlEditorList");
  if (!t4Assert(list, "wlRenderEditor: العنصر wlEditorList مفقود")) return;
  if (WL_ENTRIES.length === 0) {
    list.innerHTML = '<div class="t4-empty">لا مدخلات.</div>';
    return;
  }
  const groups = wlGroupEntries(WL_ENTRIES);
  let h = "";
  for (let i = 0; i < groups.length; i++) h += wlEditorGroupHtml(groups[i]);
  list.innerHTML = h;
}

function wlRowValues(row) {
  const vals = {};
  const fields = row.querySelectorAll("[data-f]");
  for (let i = 0; i < fields.length; i++) {
    vals[fields[i].getAttribute("data-f")] = String(fields[i].value || "").trim();
  }
  return vals;
}
`;
}

/** الجزء 4 من 7 من نصّ `getWlEditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlEditorCodePart4() {
  return `
// ═══ ولا يُكتب recordedByEmpId هنا، والسبب من القواعد نفسها ═══
// الكتابة PATCH فتُدمج، وما تراه القاعدة هو الناتج بعد الدمج، فالحقل
// المكتوب عند الإنشاء يبقى ويكفي شرطَها. ولو أُعيدت كتابته باسم المعدِّل
// لَما نفع: الشرط الثاني يقارن السطرَ القديم برقم المعدِّل، فتعديل موظفٍ
// سطرَ زميله مرفوض على كل حال. ومن عدّل يُعرف من حقل editedBy.
function wlEditPatch(vals) {
  return {
    dof: vals.dof, flt: vals.flt.toUpperCase(), std: vals.std,
    dest: vals.dest, pax: vals.pax, ind: vals.ind, sts: vals.sts,
    editedBy: t4Author().by,
    editedAt: new Date().toISOString()
  };
}

// اللازم في التعديل هو اللازم في الإدخال نفسه: قاعدة واحدة تُسأل في
// الموضعين، وإلا صار التعديل بابًا خلفيًّا يُخرج سطرًا ناقصًا. والعدد
// خرج من اللازم في ٢٠٢٦-٠٩-٢٦ بطلب المستخدم، فخرج من الموضعين معًا.
function wlEditValid(vals) {
  const form = { dof: vals.dof, flt: vals.flt, std: vals.std,
    dest: vals.dest, pax: vals.pax, sts: vals.sts };
  if (wlFormReady(form)) return true;
  if (typeof showToast === "function") {
    showToast("السطر فارغ — اكتب حقلًا واحدًا على الأقل", "error", 2500);
  }
  return false;
}
`;
}

/** الجزء 5 من 7 من نصّ `getWlEditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlEditorCodePart5() {
  return `
// ═══ «تمّ» يحفظ ما تغيّر وحده ═══
// لا سطرَ يُرسل إلى القاعدة إلا إن اختلفت قيمة من قيمه المخزَّنة: كتابةٌ
// لا تغيّر شيئًا تراكمُ بيانات بلا فائدة، وهو ممنوع بأمر المالك. والحقول
// السبعة هي المحرَّرة، فالمقارنة عليها لا على السجلّ كلّه (فيه من كتب
// ومتى، وهي تتغيّر بالتعديل نفسه).
const WL_EDIT_FIELDS = ["dof", "flt", "std", "dest", "pax", "ind", "sts"];

function wlRowChanged(entry, vals) {
  for (let i = 0; i < WL_EDIT_FIELDS.length; i++) {
    const f = WL_EDIT_FIELDS[i];
    if (String(entry[f] == null ? "" : entry[f]) !== vals[f]) return true;
  }
  return false;
}

function wlDirtyRows() {
  const list = t4El("wlEditorList");
  if (!t4Assert(list, "wlDirtyRows: العنصر wlEditorList مفقود")) return [];
  const rows = list.querySelectorAll(".t4-erow");
  const jobs = [];
  for (let i = 0; i < rows.length; i++) {
    const idx = parseInt(rows[i].getAttribute("data-idx"), 10);
    const entry = WL_ENTRIES[idx];
    const vals = wlRowValues(rows[i]);
    if (entry && wlRowChanged(entry, vals)) jobs.push({ idx: idx, vals: vals });
  }
  return jobs;
}

// لا تُحدَّث النسخة المعروضة إلا بعد قبول القاعدة: الشاشة تتبع القاعدة.
async function wlSaveOne(job) {
  const entry = WL_ENTRIES[job.idx];
  if (!t4Assert(entry && entry._key,
    "wlSaveOne: السطر " + job.idx + " بلا مفتاح قاعدة — لا يمكن تعديله")) return false;
  const patch = wlEditPatch(job.vals);
  const res = await wlPutEntry(entry._key, patch);
  if (!res || !res.ok) { t4ReportFailure("تعذّر التعديل", res); return false; }
  WL_ENTRIES[job.idx] = Object.assign({}, entry, patch);
  return true;
}
`;
}

/** الجزء 6 من 7 من نصّ `getWlEditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlEditorCodePart6() {
  return `
// العدد المحفوظ يُقال كما هو: «حُفظ ٢ من ٣» أصدق من «تمّ» على نصف عمل.
function wlReportSaved(total, done) {
  let okCount = 0;
  for (let i = 0; i < done.length; i++) { if (done[i]) okCount++; }
  if (typeof showToast !== "function") return okCount === total;
  if (okCount === total) showToast("حُفظ " + okCount + " سطرًا", "success", 1600);
  else showToast("حُفظ " + okCount + " من " + total + " سطرًا", "error", 3500);
  return okCount === total;
}

// الأسطر مستقلّة في القاعدة ولا يعتمد بعضها على بعض، فتُرسل معًا لا
// واحدًا بعد واحد — وهي القاعدة نفسها التي فرضها بطء الحذف سطرًا سطرًا.
// ويمرّ كل سطر ببابِ الكتابة نفسه، فطبقة الصلاحيات تبقى نقطة المنع
// الوحيدة ولا يُفتح لها طريق جانبيّ.
async function wlSaveAllEdits() {
  const jobs = wlDirtyRows();
  if (jobs.length === 0) return true;
  for (let i = 0; i < jobs.length; i++) {
    if (!wlEditValid(jobs[i].vals)) return false;
  }
  const done = await Promise.all(jobs.map(function(job) { return wlSaveOne(job); }));
  wlAnnounceChange();
  return wlReportSaved(jobs.length, done);
}

// السؤال يذكر الرحلة والعدد لا رقم السطر: الموظف يعرف رحلته لا ترتيبها.
async function wlConfirmRowDelete(entry) {
  if (typeof fqConfirm !== "function") return true;
  return await fqConfirm(
    "حذف السطر: " + entry.flt + " — " + entry.pax + "؟", "تأكيد الحذف");
}

function wlApplyDelete(idx) {
  WL_ENTRIES.splice(idx, 1);
  wlAnnounceChange();
  if (typeof showToast === "function") showToast("حُذف السطر", "success", 1600);
}
`;
}

/** الجزء 7 من 7 من نصّ `getWlEditorCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getWlEditorCodePart7() {
  return `
async function wlEditorDelete(idx) {
  const entry = WL_ENTRIES[idx];
  if (!t4Assert(entry && entry._key,
    "wlEditorDelete: السطر " + idx + " بلا مفتاح قاعدة — لا يمكن حذفه")) return;
  if (!(await wlConfirmRowDelete(entry))) return;
  const res = await wlDeleteEntry(entry._key);
  if (!res || !res.ok) { t4ReportFailure("تعذّر الحذف", res); return; }
  wlApplyDelete(idx);
}

// زرّ واحد على السطر منذ ٢٠٢٦-٠٩-٢٧: «حذف». وهو يكتب في القاعدة، فيحرسه
// t4Guard (القفل المشترك في fq_t4_report) كما كان يحرس «حفظ» قبله.
function wlBindEditor() {
  const list = t4El("wlEditorList");
  if (!t4Assert(list, "wlBindEditor: العنصر wlEditorList مفقود — زر الحذف معطَّل")) return;
  list.addEventListener("click", function(ev) {
    // نقرة خارج الأزرار حالة متوقَّعة لا خلل، فلا تأكيد عليها.
    const btn = ev.target.closest ? ev.target.closest('[data-act="del"]') : null;
    if (!btn) return;
    const row = btn.closest(".t4-erow");
    if (!t4Assert(row, "wlBindEditor: زر خارج أي سطر — بنية القائمة تغيّرت")) return;
    const idx = parseInt(row.getAttribute("data-idx"), 10);
    t4Guard(function () { return wlEditorDelete(idx); })
      .catch(function(e) { console.error("[fq_wl] editor", e); });
  });
}
`;
}

module.exports = Object.freeze({ getWlEditorCode });
