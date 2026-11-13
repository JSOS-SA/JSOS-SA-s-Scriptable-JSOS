// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_parser.js

const cfg = importModule("fq_config");

/**
 * يُرجع كود JavaScript معالج ملفات PDF وعرض الجداول للحقن في WebView.
 * @returns {string}
 */
function getParserCode() {
  return getParserCodePart1() +
    getParserCodePart2() +
    getParserCodePart3() +
    getParserCodePart4() +
    getParserCodePart5() +
    getParserCodePart6() +
    getParserCodePart7() +
    getParserCodePart8() +
    getParserCodePart9() +
    getParserCodePart10() +
    getParserCodePart11() +
    getParserCodePart12() +
    getParserCodePart13() +
    getParserCodePart14() +
    getParserCodePart15() +
    getParserCodePart16() +
    getParserCodePart17() +
    getParserCodePart18() +
    getParserCodePart19() +
    getParserCodePart20() +
    getParserCodePart21();
}

/** الجزء 1 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart1() {
  return `
// ═══ حالة البيانات ═══
window.DATA = [];
window.FILES = [];
let fileIdCounter = 0;
let TRACKED = [];          // <-- تم إضافة التعريف المفقود
let _hideDeparted = false; // <-- تم إضافة التعريف المفقود

// ═══ مراجع عناصر الواجهة ═══
let dp = document.getElementById("dp");
let dpSide = document.getElementById("dpSide");
let fi = document.getElementById("fi");

// مزامنة حقل التاريخ بين السايدبار والحقل الأصلي
if (dpSide) {
  const today = new Date();
  dpSide.value = today.getFullYear() + "-" +
    ("0"+(today.getMonth()+1)).slice(-2) + "-" +
    ("0"+today.getDate()).slice(-2);
  if (dp) dp.value = dpSide.value;
  dpSide.addEventListener("change", function(){
    if (dp) dp.value = dpSide.value;
  });
}
const flistEl = document.getElementById("flist");
let ld = document.getElementById("ld");
let nf = document.getElementById("nf");
let sb = document.getElementById("sb");
window.si = document.getElementById("si");
let rs = document.getElementById("rs");
let rh = document.getElementById("rh");
let rl = document.getElementById("rl");
let cp = document.getElementById("cp");
let cb = document.getElementById("cb");

// إعداد مكتبة البي دي اف
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "${cfg.PDFJS_WORKER}";
const workerOK = Promise.resolve();

// ═══ استماع لتغيير الملف ═══
fi.addEventListener("change", function() {
  if (fi.files.length > 0) processFile(fi.files[0]);
});
`;
}

/** الجزء 2 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart2() {
  return `
// ═══ عرض شارات الملفات المرفوعة ═══
function _fileBadge(f) {
  return '<div class="fbadge">' +
    '<span class="nm">' + f.name + "</span>" +
    '<span class="dt">' + f.date + "</span>" +
    '<span class="cnt">' + f.count + " رحلة</span>" +
    '<button class="rm" data-fid="' + f.id + '">' + "&times;</button></div>";
}

function renderFileList() {
  let h = "";
  for (let i = 0; i < FILES.length; i++) h += _fileBadge(FILES[i]);
  flistEl.innerHTML = h;
  const btns = flistEl.querySelectorAll(".rm");
  for (let j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function() {
      removeFile(parseInt(this.getAttribute("data-fid")));
    });
  }
}

// ═══ حذف ملف وكل رحلاته ═══
function removeFile(fid) {
  FILES = FILES.filter(function(f) { return f.id !== fid; });
  DATA = DATA.filter(function(d) { return d.fileId !== fid; });
  renderFileList();
  refreshUI();
}

// ═══ هل تعذّر الوصول إلى القاعدة عند الإقلاع؟ ═══
// SAVED_DATA === null صار يعني «تعذّرت القراءة» وحدها. والقاعدة الفارغة
// تأتي { flights: [] }. والتمييز يُحقَن من fq_main._savedPageDataJs.
function fqDbUnreachable() {
  return typeof SAVED_DATA_UNREACHABLE !== "undefined" && SAVED_DATA_UNREACHABLE === true;
}
`;
}

/** الجزء 3 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart3() {
  return `
// ═══ نصّ الشاشة الفارغة ═══
// الشاشة الفارغة لسببين مختلفين، ولا يجوز أن يتشابها: لا رحلات في القاعدة،
// أو تعذّر الوصول إليها. والثاني يُقال صريحًا فلا يظنّ الموظف أن الجدول ضاع.
function fqEmptyNotice() {
  if (!fqDbUnreachable()) {
    nf.classList.remove("on");
    return;
  }
  // نصّ ثابت بلا وسوم، فيُكتب بـ textContent لا innerHTML — لا مدخل لحقن.
  nf.textContent = "تعذّر الوصول إلى القاعدة — لم تُعرض بيانات قديمة من الجهاز";
  nf.classList.add("on");
}

// ═══ تحديث الواجهة بعد إضافة أو حذف ملف ═══
function _refreshBars() {
  if (typeof updateTopbar === "function") updateTopbar();
  if (typeof updateStats === "function") updateStats();
}

function _refreshEmpty(uzEl) {
  fqEmptyNotice();
  sb.classList.remove("on");
  rs.classList.remove("on");
  cp.classList.remove("on");
  if (uzEl) uzEl.classList.remove("compact");
  TRACKED = [];
  renderSidebar();
  _refreshBars();
}

function _refreshCount() {
  nf.innerHTML =
    'إجمالي <span>' + DATA.length + '</span> رحلة مغادرة من <span>' +
    FILES.length + "</span> ملف";
  nf.classList.add("on");
  sb.classList.add("on");
}
`;
}

/** الجزء 4 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart4() {
  return `
function _refreshFilled(uzEl) {
  // تقلّص منطقة الرفع عند وجود ملفات
  if (uzEl) uzEl.classList.add("compact");
  _refreshCount();
  // تحديث الشريط العلوي والإحصائيات والشريط الزمني
  _refreshBars();
  // تحديث القائمة الجانبية بكل الرحلات
  TRACKED = DATA.map(function(d) {
    return { al: d.al, flt: d.flt, std: d.std, depTime: d.depTime, date: d.date };
  });
  renderSidebar();
  if (si.value.trim()) doSearch();
}

function refreshUI() {
  const uzEl = document.getElementById("uz");
  if (DATA.length === 0) _refreshEmpty(uzEl);
  else _refreshFilled(uzEl);
}

// ═══ معالجة ملف البي دي اف ═══
const _pfTimeRe = /^\\d{1,2}:\\d{2}$/;

// تاريخ الجدول من الحقل، أو رسالة ويُرجع فارغًا.
function _pfDate() {
  hideErr();
  const dateVal = dp.value;
  if (!dateVal) {
    showErr("اختر تاريخ الجدول أولاً");
    fi.value = "";
  }
  return dateVal;
}
`;
}

/** الجزء 5 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart5() {
  return `
// الخلايا المرتّبة لكل صفحة: أسطر من الأعلى للأسفل، وكل سطر خلاياه من اليسار.
function _pfLineMap(content) {
  const lineMap = {};
  for (let k = 0; k < content.items.length; k++) {
    const item = content.items[k];
    const y = Math.round(item.transform[5] * 10) / 10;
    if (!lineMap[y]) lineMap[y] = [];
    lineMap[y].push({
      x: Math.round(item.transform[4]),
      text: item.str.trim()
    });
  }
  return lineMap;
}

function _pfPageRows(content, allRows) {
  const lineMap = _pfLineMap(content);
  // ترتيب الأسطر من الأعلى للأسفل
  const ys = Object.keys(lineMap).map(Number)
    .sort(function(a, b) { return b - a; });
  for (let i = 0; i < ys.length; i++) {
    const cells = lineMap[ys[i]]
      .sort(function(a, b) { return a.x - b.x; })
      .map(function(c) { return c.text; })
      .filter(function(t) { return t.length > 0; });
    if (cells.length >= ${cfg.MIN_CELLS_PER_ROW})
      allRows.push(cells);
  }
}

// استخراج النصوص من كل صفحة
async function _pfPdfRows(pdf) {
  const allRows = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    _pfPageRows(await page.getTextContent(), allRows);
  }
  return allRows;
}
`;
}

/** الجزء 6 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart6() {
  return `
// البحث عن عمود المغادرة بتتبع أنماط الوقت: موضع بدايته وعدد الأوقات.
function _pfTimeCols(row) {
  let depStart = -1;
  let timeCount = 0;
  for (let c = 0; c < row.length; c++) {
    if (_pfTimeRe.test(row[c])) {
      timeCount++;
      if (timeCount === 2) {
        depStart = c - 3;
        break;
      }
    }
  }
  return { depStart: depStart, timeCount: timeCount };
}

function _pfDep(row, s, ctx) {
  return {
    al: row[s],
    flt: row[s + 1],
    to: row[s + 2],
    std: row[s + 3],
    type: (row[s + 4] || "") +
      (row[s + 5] ? " " + row[s + 5] : ""),
    dpax: row[s + 6] || row[s + 5] || "",
    date: ctx.dateVal,
    depTime: buildDepTime(ctx.dateVal, row[s + 3]),
    fileId: ctx.fid
  };
}

function _pfAltFlight(row, c2, ctx) {
  const d2 = {
    al: row[c2 - 3], flt: row[c2 - 2],
    to: row[c2 - 1], std: row[c2],
    type: "", dpax: "",
    date: ctx.dateVal,
    depTime: buildDepTime(ctx.dateVal, row[c2]),
    fileId: ctx.fid
  };
  if (c2 + 1 < row.length) d2.type = row[c2 + 1];
  if (c2 + 2 < row.length) d2.type += " " + row[c2 + 2];
  if (c2 + 3 < row.length) d2.dpax = row[c2 + 3];
  return /\\d/.test(d2.flt) ? d2 : null;
}
`;
}

/** الجزء 7 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart7() {
  return `
// محاولة بديلة — وقت واحد فقط
function _pfAlt(row, ctx) {
  for (let c2 = 0; c2 < row.length; c2++) {
    if (_pfTimeRe.test(row[c2]) && c2 >= 3) return _pfAltFlight(row, c2, ctx);
  }
  return null;
}

function _pfRowFlight(row, ctx) {
  const cols = _pfTimeCols(row);
  if (cols.depStart >= 0 && cols.depStart + 5 < row.length) {
    const dep = _pfDep(row, cols.depStart, ctx);
    return (/\\d/.test(dep.flt) && _pfTimeRe.test(dep.std)) ? dep : null;
  }
  return cols.timeCount === 1 ? _pfAlt(row, ctx) : null;
}

function _pfRowOk(row) {
  if (row.length < ${cfg.MIN_CELLS_FOR_PARSE}) return false;
  const no = parseInt(row[0]);
  return !(isNaN(no) || no < 1 || no > ${cfg.MAX_ROW_NUMBER});
}

// تحليل كل صف واستخراج بيانات الرحلة
function _pfFlights(allRows, dateVal, fid) {
  const ctx = { dateVal: dateVal, fid: fid };
  const out = [];
  for (let r = 0; r < allRows.length; r++) {
    const flight = _pfRowOk(allRows[r]) ? _pfRowFlight(allRows[r], ctx) : null;
    if (flight) out.push(flight);
  }
  return out;
}
`;
}

/** الجزء 8 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart8() {
  return `
// إضافة الملف والرحلات
function _pfStore(file, rec) {
  FILES.push({
    id: rec.id, name: file.name,
    date: rec.date, count: rec.flights.length
  });
  for (let n = 0; n < rec.flights.length; n++) {
    DATA.push(rec.flights[n]);
  }

  renderFileList();
  refreshUI();
  fi.value = "";
  si.value = "";
  si.focus();
}

function _pfAdopt(file, dateVal, allRows) {
  ld.classList.remove("on");
  const fid = ++fileIdCounter;
  const newFlights = _pfFlights(allRows, dateVal, fid);
  if (newFlights.length === 0) {
    showErr("لم يُعثر على بيانات رحلات مغادرة في الملف");
    fi.value = "";
    return;
  }
  _pfStore(file, { id: fid, date: dateVal, flights: newFlights });
}

function _pfFail(e) {
  ld.classList.remove("on");
  showErr("خطأ: " + e.message);
  fi.value = "";
}
`;
}

/** الجزء 9 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart9() {
  return `
// ═══ معالجة ملف البي دي اف ═══
async function processFile(file) {
  const dateVal = _pfDate();
  if (!dateVal) return;
  ld.classList.add("on");

  try {
    await workerOK;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buf)
    }).promise;
    _pfAdopt(file, dateVal, await _pfPdfRows(pdf));
  } catch(e) {
    _pfFail(e);
  }
}

// ═══ استعادة البيانات المحفوظة عند بدء التشغيل ═══
// يستدعي باني الصفحة التهيئة بعد جاهزية مراجع البحث والعداد والقائمة الجانبية.
function _savedRow(f, fid, terminal) {
  return {
    al: f.al, flt: f.flt, to: f.to,
    std: f.std, type: f.type || "", dpax: f.dpax || "",
    date: f.date,
    depTime: new Date(f.depTime),
    fileId: fid,
    _fbKey: f._fbKey || null,
    _src: f._src || "local",
    terminal: terminal
  };
}
`;
}

/** الجزء 10 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart10() {
  return `
function _savedAddGroup(date, group) {
  fileIdCounter++;
  const fid = fileIdCounter;
  FILES.push({
    id: fid,
    name: "محفوظ — " + date,
    date: date,
    count: group.length
  });
  for (let j = 0; j < group.length; j++) {
    DATA.push(_savedRow(group[j], fid, group[j].terminal || ""));
  }
}

// تجميع الرحلات حسب التاريخ
// ═══ فصل المصادر قبل أي تجميع ═══
// رحلات الصالات (t1/north) لا تُنسب إلى ملف جدول إطلاقًا: نسبتها
// كانت تجعل "حذف ملف" يحذف رحلات الصالات من التاريخ نفسه، وتجعل
// عدّاد الملف يحسبها ضمن رحلات الجدول.
function _savedGroups(saved) {
  const dateGroups = {};
  for (let i = 0; i < saved.flights.length; i++) {
    const f = saved.flights[i];
    if (!fqIsSchedule(f)) {
      DATA.push(_savedRow(f, null, f.terminal));
      continue;
    }
    if (!dateGroups[f.date]) dateGroups[f.date] = [];
    dateGroups[f.date].push(f);
  }
  return dateGroups;
}

function _savedLoad(saved) {
  const dateGroups = _savedGroups(saved);
  for (const date in dateGroups) _savedAddGroup(date, dateGroups[date]);
  // تحديث حقل التاريخ بآخر تاريخ محفوظ
  dp.value = saved.flights[saved.flights.length - 1].date;
  renderFileList();
  refreshUI();
}
`;
}

/** الجزء 11 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart11() {
  return `
function fqInitSavedFlights() {
if (typeof SAVED_DATA !== 'undefined' && SAVED_DATA) {
  try {
    const _saved = SAVED_DATA;
    if (_saved.flights && _saved.flights.length > 0) _savedLoad(_saved);
  } catch(e) { console.error("[fq_parser] load saved: " + e.message); }
}

// ═══ تعذّر الوصول إلى القاعدة: يُقال صريحًا ═══
// الكتلة أعلاه لا تعمل إذا كان SAVED_DATA معدومًا، فلا يُنادى refreshUI عند
// الإقلاع، فتبقى الشاشة فارغة بلا سبب معلوم. وقناتان هنا لا واحدة: النصّ في
// شريط العدّاد لا يُكتَم، والتوست قد يُكتَم بتفضيل إيقاف الإشعارات.
if (fqDbUnreachable()) {
  refreshUI();
  if (typeof showToast === "function")
    showToast("تعذّر الوصول إلى القاعدة — أعد المحاولة بعد عودة الشبكة", "error");
}
}

// ═══ أزرار حذف وحفظ الجداول ═══
let fqActionsBar = document.getElementById("fqActionsBar");
let fqDeleteBtn = document.getElementById("fqDeleteBtn");
let fqSaveBtn = document.getElementById("fqSaveBtn");
let fqModalOverlay = document.getElementById("fqModalOverlay");
let fqModalBody = document.getElementById("fqModalBody");
let fqModalClose = document.getElementById("fqModalClose");
let fqModalConfirm = document.getElementById("fqModalConfirm");

// إظهار الأزرار عند وجود بيانات
function updateActionsBar() {
  if (fqActionsBar) {
    if (DATA.length > 0 || FILES.length > 0) {
      fqActionsBar.classList.add("on");
    } else {
      fqActionsBar.classList.remove("on");
    }
  }
}

// مراقبة تغيّر البيانات
const _actObs = new MutationObserver(updateActionsBar);
if (nf) _actObs.observe(nf, { childList: true, subtree: true, characterData: true });
setTimeout(updateActionsBar, 500);
`;
}

/** الجزء 12 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart12() {
  return `
function _delBtnHtml(icon, label) {
  return '<span class="fqa-ic">' + buildIcon(icon, 16) + '</span><span>' + label + '</span>';
}

function _delItemHtml(f) {
  return '<div class="fq-chk-item" data-fid="' + f.id + '">' +
    '<div class="fq-chk-box">' + buildIcon("check", 14) + '</div>' +
    '<div class="fq-chk-info">' +
    '<div class="fq-chk-name">' + f.name + '</div>' +
    '<div class="fq-chk-meta">' + f.date + ' — ' + f.count + ' رحلة</div>' +
    '</div></div>';
}

function _noTablesFlash() {
  fqDeleteBtn.textContent = "لا توجد جداول";
  setTimeout(function() {
    fqDeleteBtn.innerHTML = _delBtnHtml("trash", "حذف");
  }, 1000);
}

// تفاعل التحديد
function _bindCheckItems() {
  const items = fqModalBody.querySelectorAll(".fq-chk-item");
  for (let ci = 0; ci < items.length; ci++) {
    items[ci].addEventListener("click", function() {
      this.classList.toggle("checked");
    });
  }
}

// ═══ زر الحذف — قائمة منبثقة ═══
if (fqDeleteBtn) {
  fqDeleteBtn.addEventListener("click", function() {
    if (FILES.length === 0) return _noTablesFlash();
    // بناء قائمة الملفات مع مربعات تحديد
    let h = "";
    for (let fi = 0; fi < FILES.length; fi++) h += _delItemHtml(FILES[fi]);
    fqModalBody.innerHTML = h;
    _bindCheckItems();

    fqModalOverlay.classList.add("open");
  });
}
`;
}

/** الجزء 13 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart13() {
  return `
// إغلاق القائمة
if (fqModalClose) {
  fqModalClose.addEventListener("click", function() {
    fqModalOverlay.classList.remove("open");
  });
}
if (fqModalOverlay) {
  fqModalOverlay.addEventListener("click", function(e) {
    if (e.target === fqModalOverlay) fqModalOverlay.classList.remove("open");
  });
}

// ═══ الحذف من القاعدة: طلب واحد، ورسالةٌ من القاعدة لا من الشاشة ═══
// **قبلُ**: طلب DELETE مستقلّ لكل مفتاح — مئة رحلة = مئة طلب متسلسل،
// فتجاوز الحذف الدقيقة. ثم رسالةٌ تطبع عدد ما اختفى من **الشاشة**
// (deletedCount)، فيقول النظام «تم حذف ١٠٠ رحلة من القاعدة» وهي باقية.
//
// **الآن**: PATCH واحد بإسناد null (fqBulkDelete)، ثم قراءة shallow واحدة
// تُثبت ما اختفى فعلًا. والقراءة لازمة لا زائدة: الحذف على مسار غير موجود
// **ينجح** بنصّ الوثائق —
// «A successful DELETE request will be indicated by a 200 OK HTTP status
//  code with a response containing JSON null»
// <https://firebase.google.com/docs/database/rest/save-data>
// فمفتاحٌ خاطئ يُحذف «بنجاح» بينما السجل الحقيقي باقٍ، ولا يكشفه res.ok.

// ما زال في القاعدة بعد الحذف. عند تعذّر القراءة: الافتراض الآمن أن كل
// شيء باقٍ، ويُقال للموظف إن التأكّد تعذّر — لا أن الحذف نجح.
async function fqDeleteVerify(keys) {
  const scan = await fqScanKeys("/" + FQ_FLIGHT_NODES.sch);
  if (!scan.ok) return { checked: false, left: keys, error: scan.error };
  return { checked: true, left: fqKeysRemaining(scan.keys, keys), error: "" };
}

// المرحلة د: حجم مشكلة المفاتيح القديمة يُذكر بالاسم في رسالة الفشل، فلا
// يبقى «تعذّر الحذف» سببًا مجهولًا. الترحيل نفسه مؤجَّل بقرار المستخدم.
function fqDeleteLegacyNote(left) {
  const n = (typeof fqLegacyKeyCount === "function") ? fqLegacyKeyCount(left) : 0;
  return (n > 0) ? " · منها " + n + " بصيغة مفتاح قديمة تحتاج ترحيلًا" : "";
}
`;
}

/** الجزء 14 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart14() {
  return `
// دالة خالصة: أعداد القاعدة تدخل، ونصّ الموظف يخرج. لا شبكة ولا DOM،
// فتُختبر مباشرةً — وهي الفرق بين رسالة صادقة ورسالة تصف الشاشة.
function fqDeleteReport(counts, verify) {
  const stuck = verify.left.length + counts.keyless;
  if (counts.pending > 0) {
    return { text: "الشبكة منقطعة — " + counts.pending + " رحلة في الطابور لم تصل القاعدة بعد", kind: "error" };
  }
  if (!verify.checked) {
    return { text: "أُرسل الحذف ولم يتأكّد من القاعدة: " + verify.error, kind: "error" };
  }
  if (stuck === 0) {
    return { text: "تم حذف " + counts.asked + " رحلة من القاعدة", kind: "success" };
  }
  return {
    text: "حُذف " + (counts.asked - verify.left.length) + " من " + (counts.asked + counts.keyless) +
          " — تعذّر حذف " + stuck + fqDeleteLegacyNote(verify.left),
    kind: "error"
  };
}

// الأثر الجانبي بعد الحذف: طابع «آخر تحديث» والإشعار والتدقيق. وكلها
// تحمل **عدد ما اختفى من القاعدة**، لا عدد ما اختفى من الشاشة.
async function fqDeleteAftermath(gone) {
  const dMeta = await fqRequest({
    path: "/flights_meta.json", method: "PATCH", timeoutMs: 10000,
    body: { lastUpdateBy: FB_USER, lastUpdateAt: new Date().toISOString() }
  });
  if (!dMeta.ok) console.warn("[fq_parser] delete meta: " + dMeta.error);
  if (typeof fbPushNotif === "function")
    fbPushNotif({ type: "data_deleted", title: "حذف جداول", details: gone + " رحلة" });
  if (typeof auditLog === "function")
    auditLog("delete_flights", gone + " flights", "batch");
}
`;
}

/** الجزء 15 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart15() {
  return `
async function fqDeleteFlightsFromDb(keys, keyless) {
  if (typeof showToast === "function")
    showToast("جارٍ الحذف من القاعدة...", "loading");
  // حذف الجداول يقع في عقدة الجداول وحدها، فلا يمسّ رحلات الصالتين.
  const bulk = await fqBulkDelete("/" + FQ_FLIGHT_NODES.sch, keys, "حذف جداول");
  // ما دخل الطابور لم يصل بعد، فلا معنى لقراءة تأكيد عليه.
  const verify = (bulk.pending > 0)
    ? { checked: false, left: keys, error: "قيد الإرسال" }
    : await fqDeleteVerify(keys);
  const report = fqDeleteReport({ asked: keys.length, keyless: keyless, pending: bulk.pending }, verify);
  // النتيجة تُعرض **قبل** الأثر الجانبي: الطابع والإشعار والتدقيق ثلاثة
  // طلبات لا تخصّ الموظف، وتقديمها كان يُبقيه على «جارٍ الحذف...» ثوانٍ
  // إضافية بعد أن تمّ الحذف فعلًا.
  if (typeof showToast === "function") showToast(report.text, report.kind);
  await fqDeleteAftermath(keys.length - verify.left.length);
  return report;
}

function _delNeedPick() {
  fqModalConfirm.textContent = "حدد جدولًا أولًا";
  setTimeout(function() {
    fqModalConfirm.textContent = "حذف المحدد";
  }, 1000);
}

function _delOneFile(fid, acc) {
  const before = DATA.length;
  // جمع مفاتيح فايربيس قبل الحذف
  for (let fi2 = 0; fi2 < DATA.length; fi2++) {
    if (DATA[fi2].fileId !== fid) continue;
    if (DATA[fi2]._fbKey) acc.keys.push(DATA[fi2]._fbKey);
    else acc.keyless++;
  }
  FILES = FILES.filter(function(f) { return f.id !== fid; });
  DATA = DATA.filter(function(d) { return d.fileId !== fid; });
  acc.count += (before - DATA.length);
}
`;
}

/** الجزء 16 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart16() {
  return `
// رحلة بلا مفتاح قاعدة: تختفي من الشاشة ولا يُرسل لها طلب. كانت
// تُتجاهَل بصمت فتُحسب في رسالة النجاح، وهي أوضح صور «النجاح الوهمي».
function _delCollect(checked) {
  const acc = { count: 0, keys: [], keyless: 0 };
  for (let di = 0; di < checked.length; di++) {
    const fid = parseInt(checked[di].getAttribute("data-fid"));
    if (fid) _delOneFile(fid, acc);
  }
  return acc;
}

function _delAfterLocal() {
  renderFileList();
  refreshUI();
  fqModalOverlay.classList.remove("open");
  updateActionsBar();
}

// حذف من القاعدة أيضاً — الحذف متاح للجميع (قرار صريح: توسيع الصلاحية بدل تقييدها بدور لم يعد يصل إليه أحد)
function _delSend(acc) {
  if (!fbConnected) {
    if (typeof showToast === "function")
      showToast("تم حذف " + acc.count + " رحلة محلياً", "success");
    return;
  }
  fqDeleteFlightsFromDb(acc.keys, acc.keyless).catch(function(e) {
    console.error("[fq_parser] حذف الجداول: " + (e && e.message ? e.message : String(e)));
    if (typeof showToast === "function")
      showToast("تعذّر إتمام الحذف من القاعدة", "error");
  });
}

function _delBtnDone() {
  fqDeleteBtn.innerHTML = _delBtnHtml("check", "تم الحذف");
  fqDeleteBtn.style.borderColor = "#16a34a";
  fqDeleteBtn.style.color = "#16a34a";
  setTimeout(function() {
    fqDeleteBtn.innerHTML = _delBtnHtml("trash", "حذف");
    fqDeleteBtn.style.borderColor = "";
    fqDeleteBtn.style.color = "";
  }, 1500);
}
`;
}

/** الجزء 17 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart17() {
  return `
// تأكيد الحذف
if (fqModalConfirm) {
  fqModalConfirm.addEventListener("click", function() {
    const checked = fqModalBody.querySelectorAll(".fq-chk-item.checked");
    if (checked.length === 0) return _delNeedPick();
    const acc = _delCollect(checked);
    _delAfterLocal();
    _delSend(acc);

    _delBtnDone();
  });
}

// ═══ الشاشة الفارغة تُحفظ أيضًا ═══
// كانت الرسالة «لا توجد بيانات للحفظ» خروجًا بلا أثر، فيبقى ملف الجهاز
// محتفظًا بما حُذف، وتبقى الودجة تعرضه. والصواب أن يُعلَّم الحفظ فتلحق
// نسخة الجهاز بالشاشة. ولا يُرسل للقاعدة شيء: تفريغ القاعدة مهمّة زر
// الحذف بإسناد null، و PATCH بجسمٍ فارغ ليس حذفًا بحسب الوثائق.
// (تقرير التدقيق ٢٠٢٦-٠٩-٢٥، البند ٥.)
function _saveEmptyNote() {
  window._FQ_SAVE_NOW = true;
  if (typeof showToast === "function")
    showToast("لا توجد رحلات — حُدِّثت نسخة الجهاز لتوافق الشاشة", "info");
}

function _saveBegin() {
  if (typeof showToast === "function")
    showToast("جارٍ الحفظ...", "loading");

  // تعليم الحفظ المحلي
  window._FQ_SAVE_NOW = true;
  return { saved: false };
}

function _saveStamp(row) {
  row.updatedBy = FB_USER;
  row.updatedByRole = FB_ROLE;
  row.updatedByEmpId = FB_EMP_ID;
  row.updatedAt = new Date().toISOString();
}
`;
}

/** الجزء 18 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart18() {
  return `
function _saveRow(f) {
  const row = {};
  ["al", "flt", "to", "std", "type", "dpax", "date"].forEach(function(k) { row[k] = f[k] || ""; });
  row.depTime = f.depTime instanceof Date ? f.depTime.toISOString() : (f.depTime || "");
  // إسقاط terminal هنا كان السبب الرئيس لاختلاط الصالات بتيوب جداول:
  // الحفظ يمرّ على DATA كلها فيعيد كتابة رحلات الصالات بلا هويتها
  row.terminal = f.terminal || "";
  row.src = f._src || "pdf";
  _saveStamp(row);
  // حالة المطار (ملغاة، متأخرة) تُحمل وإلا محاها هذا الحفظ، فهو
  // يستبدل السجلّ كله. ولا حقل فارغ في غيرها (SITE_STATUSES).
  if (SITE_STATUSES.indexOf(f._status) !== -1) row.status = f._status;
  return row;
}

// من لا يملك حذف الرحلات لا يستطيع نقل سجلّ إلى مفتاح جديد: الطلب
// الجماعي ذرّيّ، وابنٌ بـ null يُرفض له فيُرفض الحفظ **كله** (قيس
// بالمحاكي ٢٠٢٦-٠٩-٢٨، npm run rules القسم [و]). فيبقى السجلّ تحت
// مفتاحه المخزَّن ويتغيّر محتواه — الحالة التي يعرفها العرف ١٩ — ونقله
// لحفظ مشرف أو مطوّر. قرار المالك ٢٠٢٦-٠٩-٢٨.
function _savePayload(canMove) {
  const payload = {};
  const taken = {};
  for (let ti = 0; ti < DATA.length; ti++) taken[fqFlightKey(DATA[ti])] = true;
  const writtenKeys = [];
  for (let i = 0; i < DATA.length; i++) {
    const key = canMove ? fqFlightKey(DATA[i]) : fqKeepStoredKey(DATA[i], taken);
    if (!key || key.length < 3) continue;
    writtenKeys[i] = key;
    payload[key] = _saveRow(DATA[i]);
  }
  return { payload: payload, writtenKeys: writtenKeys };
}
`;
}

/** الجزء 19 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart19() {
  return `
// ═══ الحفظ ينقل السجلّ ولا ينسخه ═══
// السجل المخزَّن بمفتاح يخالف المفتاح المحسوب — أي بالصيغة القديمة
// <التاريخ>_<الرقم>_<الوقت> قبل إدخال المصدر، وهي علّة
// fq_migrate_flight_keys — كان يُكتب تحت المفتاح الجديد **ويبقى
// القديم**، فيصير في القاعدة سجلّان لرحلة واحدة. ثم يُكتب _fbKey
// الجديد على الشاشة، فالحذف يقصد الجديد وحده ويعود القديم عند أول
// تحديث. وهذا بعينه «الجدول يعود بعد أن قيل إنه حُذف».
//
// الحلّ إسناد null للمفتاح القديم **في الطلب نفسه**: نمط
// fq_migrate_flight_keys.js:190-199 حرفيًّا وبحرسه نفسه — لا يُحذف
// مفتاحٌ هو هدفٌ لسجلّ آخر، حمايةً من محو سجلّ كُتب للتوّ. ويُشترط
// أن يكون البديل في الطلب فعلًا، فلا يُحذف سجلّ بلا نسخة تحلّ محلّه.
function _saveMoveOne(payload, d) {
  const oldKey = d._fbKey;
  const newKey = fqFlightKey(d);
  if (!oldKey || oldKey === newKey) return false;
  const has = Object.prototype.hasOwnProperty;
  if (!has.call(payload, newKey) || has.call(payload, oldKey)) return false;
  payload[oldKey] = null;
  return true;
}

function _saveMoved(payload) {
  let moved = 0;
  for (let mi = 0; mi < DATA.length; mi++) {
    if (_saveMoveOne(payload, DATA[mi])) moved++;
  }
  return moved;
}

function _saveLogMoved(moved) {
  if (moved > 0) console.log("[fq_parser] نُقل " + moved + " سجلًّا من مفتاح قديم إلى المعتمد");
}

// كل صالة في عقدتها (أمر المالك ٢٠٢٦-٠٩-٢٨): طلب لكل عقدة بما
// يخصّها، معًا. والنقل من مفتاح قديم يقع في عقدة المفتاح القديم.
function _saveRequests(payload) {
  const byNode = fqSplitByNode(payload);
  return Object.keys(byNode).map(function(n) {
    return fqRequest({ path: "/" + n + ".json", method: "PATCH", body: byNode[n], timeoutMs: 15000 });
  });
}
`;
}

/** الجزء 20 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart20() {
  return `
function _saveFirstFail(resps) {
  for (let ri = 0; ri < resps.length; ri++) {
    if (!resps[ri].ok) return resps[ri];
  }
  return { ok: true };
}

// كتابة مفتاح الهوية على كل رحلة بعد نجاح الحفظ — المفتاح الذي
// كُتبت تحته فعلًا، لا المحسوب: سجلّ الموظف المحفوظ تحت مفتاحه القديم
// يبقى _fbKey عليه، وإلا طابقت الشاشةُ مفتاحًا لا وجود له في القاعدة.
function _saveMarkKeys(writtenKeys) {
  for (let ki = 0; ki < DATA.length; ki++) {
    const kKey = writtenKeys[ki];
    if (kKey && kKey.length >= 3) DATA[ki]._fbKey = kKey;
  }
}

function _saveMetaReq() {
  return {
    path: "/flights_meta.json", method: "PATCH", timeoutMs: 10000,
    body: {
      totalFlights: DATA.length,
      lastUpdateBy: FB_USER,
      lastUpdateAt: new Date().toISOString()
    }
  };
}

function _saveMetaWarn(sMeta) {
  if (!sMeta.ok) console.warn("[fq_parser] save meta: " + sMeta.error);
}

// حفظ في القاعدة فوراً: التخطيط المتزامن أولًا (يرمي كما كان قبل أي انتظار)، ثم الإرسال في المعالج نفسه.
function _savePlan() {
  const canMove = can("delete_flight");
  const plan = _savePayload(canMove);
  _saveLogMoved(canMove ? _saveMoved(plan.payload) : 0);
  return plan;
}
`;
}

/** الجزء 21 من 21 من نصّ `getParserCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getParserCodePart21() {
  return `
// بعد ردّ العقد: أول فشل يُسقط الحفظ، وإلا تُعلَّم المفاتيح ويُرفع st.saved قبل طلب الطابع كما كان.
function _saveCommit(st, plan, resps) {
  if (!_saveFirstFail(resps).ok) return false;
  _saveMarkKeys(plan.writtenKeys);
  st.saved = true;
  return true;
}

function _saveFinish(saved) {
  if (typeof showToast === "function") {
    if (saved) showToast("تم حفظ " + DATA.length + " رحلة في القاعدة", "success");
    else showToast("تم الحفظ محلياً — فشل حفظ القاعدة", "error");
  }

  if (typeof fbPushNotif === "function" && saved) {
    fbPushNotif({ type: "data_updated", title: "حفظ بيانات الرحلات",
      details: DATA.length + " رحلة" });
  }
  if (typeof auditLog === "function")
    auditLog("save_flights", DATA.length + " flights", "manual");
}

// ═══ زر الحفظ — يحفظ فورياً في القاعدة ═══
if (fqSaveBtn) {
  fqSaveBtn.addEventListener("click", async function() {
    if (DATA.length === 0) return _saveEmptyNote();
    const st = _saveBegin();
    try {
      const plan = fbConnected ? _savePlan() : null;
      const resps = plan ? await Promise.all(_saveRequests(plan.payload)) : null;
      if (resps && _saveCommit(st, plan, resps)) _saveMetaWarn(await fqRequest(_saveMetaReq()));
    } catch(e) { console.error("[fq_parser] fb save: " + e.message); }
    _saveFinish(st.saved);
  });
}`;
}

module.exports = Object.freeze({ getParserCode });
