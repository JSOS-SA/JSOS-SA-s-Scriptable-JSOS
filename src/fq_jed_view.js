// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_jed_view.js

/**
 * @module fq_jed_view
 * @description المسؤولية الواحدة: عرض تيوب LIVE FLT وربطه — رأس الصالات،
 * والجدول، والعدّاد، وزرّ إخفاء الرحلات المقلعة، والضغطتان على الرحلة.
 *
 * **أربع وحدات، والاعتماد نازل** (نمط وحدات T4): `fq_jed_text` القواعد ←
 * `fq_jed_store` القاعدة ← `fq_jed_modal` النافذتان ← هذه. وهذه وحدها تعرف
 * الجميع، ولا يعرفها أحد: القاعدة تُعلن وصول التغيير بـ `jedOnChange`.
 *
 * **ما يُعاد استعماله ولا يُنسخ**: `wlTtd` للعدّاد (طلب المالك: «مشابه
 * تمامًا للعدّاد التنازلي في تيوب T4 كي لا تكرّره») بإيقاع
 * `COUNTDOWN_INTERVAL_MS` نفسه، و`fqBindLongPress` من `fq_editflight` للضغط
 * المطوّل، وزرّ `vt-btn` بنصّي زرّ «كايا» («إظهار المغادرة» و«إخفاء
 * المغادرة») ورسالتيه. فيُجمَّع بعد وحدات T4 ونموذج T4 و`fq_editflight`.
 *
 * **وزرّ «ترحيل البيانات»** يرسمه `jedSyncXferBtn` بنصّ `jedTransferLabel` من
 * `fq_jed_transfer`، ورأس الصالة المرحَّلة يحمل «✓ مُرحَّلة إلى كايا».
 *
 * **الرحلات المقلعة مخفية أصلًا** حتى يضغط الموظف الزرّ (أمر المالك
 * ٢٠٢٦-١٠-٠٣)، كتيوب «كايا». وأعداد الصالات في الرأس تبقى كاملة، كما في
 * الطرفية، وعدد المخفيّ مكتوب بجانب الزرّ.
 */

const jedViewCfg = importModule("fq_config");

/**
 * شيفرة عرض تيوب LIVE FLT وربطه التي تعمل داخل الصفحة.
 * @returns {string} نص JavaScript للمتصفح
 */
function getJedViewCode() {
  return getJedViewCodePart1() +
    getJedViewCodePart2() +
    getJedViewCodePart3() +
    getJedViewCodePart4() +
    getJedViewCodePart5() +
    getJedViewCodePart6() +
    getJedViewCodePart7() +
    getJedViewCodePart8() +
    getJedViewCodePart9();
}

/** الجزء 1 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart1() {
  return `
// ═══ LIVE FLT: العرض والربط ═══
function jedVisible() {
  const p = t4El("jedPanel");
  return Boolean(p && p.style.display === "block");
}

function jedPoll() {
  if (jedVisible()) jedSync().catch(function(e) { console.error("[fq_jed] استطلاع", e); });
}

function jedTd(c, extra) {
  const text = c.strike ? "<s>" + t4Esc(c.text) + "</s>" : t4Esc(c.text);
  return '<td class="' + c.cls + (extra ? " " + extra : "") + '">' + text + "</td>";
}

function jedRowHtml(day, row) {
  const n = row.n;
  return '<tr data-key="' + t4Esc(row.key) + '"' + (n.g ? ' class="jed-gone"' : "") + ">" +
    jedTd({ text: jedFirst(row), cls: "" }) + jedTd(jedStd(n)) + jedTd(jedEtd(n)) +
    jedTd(jedCell(n, "dest"), "jed-dest") + jedTd(jedCell(n, "status")) +
    '<td data-jttd="' + t4Esc(row.key) + '">' + t4Esc(jedTtd(day, n)) + "</td></tr>";
}

function jedLinkMark(t) {
  if (jedConfirmed(t)) return '<span class="jed-ok">✓ مُرحَّلة إلى كايا</span>';
  if (jedNoReply(t)) return '<span class="jed-cf">⚠ لم يردّ الحاسوب</span>';
  return jedLinked(t) ? '<span class="jed-dim">⏳ بانتظار الحاسوب</span>' : "";
}

function jedRenderTerms(day) {
  const box = t4El("jedTerms");
  if (!box) return;
  let h = "";
  JED_TERMS.forEach(function(t) {
    const rows = jedRows(((JED.days[day] || {})[t[0]]) || {});
    const bad = rows.filter(function(r) { return jedDisputed(r.n); }).length;
    h += '<button type="button" class="jed-tb' + (t[0] === JED.term ? " on" : "") +
      '" data-term="' + t[0] + '"><span>' + (t[0] === JED.term ? "◀ " : "") + t[1] +
      "  " + rows.length + " رحلة</span>" +
      jedLinkMark(t[0]) +
      (bad ? '<span class="jed-cf">⚠ ' + bad + " فيها خلاف</span>" : "") + "</button>";
  });
  box.innerHTML = h;
}
`;
}

/** الجزء 2 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart2() {
  return `
function jedRenderInfo(day) {
  jedRenderDayBtn(day);
  jedRenderSources();
  jedRenderNote(day);
}

// زرّ اليوم: اسم اليوم المعروض وتاريخه، وتلميح اليوم الآخر إن وُجد.
function jedRenderDayBtn(day) {
  const btn = t4El("jedDayBtn");
  if (!btn) return;
  const label = JED.dayIdx === 0 ? "اليوم" : "الغد";
  const other = JED.dayIdx === 0 ? "الغد" : "اليوم";
  btn.innerHTML = t4Esc(label + " " + day) +
    (jedDays().length > 1 ? '<span class="jed-dim">   اضغط هنا لعرض ' + other + "</span>" : "");
}

`;
}

/** الجزء 3 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart3() {
  return `
// حالة المواقع المصدر: خطؤها، أو آخر نجاحها، أو أنها لم تُجلب بعد.
function jedRenderSources() {
  const src = t4El("jedSources");
  if (!src) return;
  const s = (JED.meta && JED.meta.sources) || {};
  let h = "";
  JED_SITE_ORDER.forEach(function(k) { h += jedSourceHtml(k, s[k] || {}); });
  src.innerHTML = h;
}

function jedSourceHtml(k, i) {
  if (i.error) return '<span class="jed-bad">' + JED_SITES[k] + " ✗ تعذّر " + t4Esc(jedClockOf(i.tried)) + "</span>  ";
  if (i.ok) return '<span class="jed-ok">' + JED_SITES[k] + " ✓ " + t4Esc(jedClockOf(i.ok)) +
    (i.units_left == null ? "" : " — بقي " + t4Esc(i.units_left) + " وحدة") + "</span>  ";
  return '<span class="jed-dim">' + JED_SITES[k] + " … لم يُجلب بعد</span>  ";
}

// ملاحظة الرحلات التي لم يذكر أي موقع صالتها.
function jedRenderNote(day) {
  const note = t4El("jedNote");
  if (!note) return;
  const nt = (JED.meta && JED.meta.no_terminal && JED.meta.no_terminal[day]) || 0;
  note.innerHTML = '<span class="jed-dim">' + t4Esc(nt) + " رحلة لم يذكر أي موقع صالتها، فلا تظهر هنا</span>";
}

function jedRenderState() {
  const el = t4El("jedState");
  if (!el) return;
  const up = JED.meta && JED.meta.updated;
  el.innerHTML = JED.error
    ? '<span class="jed-cf">' + t4Esc(JED.error) + "</span>"
    : '<span class="jed-dim">آخر تحديث من الحاسوب ' + t4Esc(jedClockOf(up)) +
      " · يتحدّث وحده كل دقيقة</span>";
}
`;
}

/** الجزء 4 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart4() {
  return `
// زرّ الإخفاء بنصّي زرّ «كايا» وشكله (lvSyncHideBtn في fq_live_view).
function jedSyncHideBtn(hidden) {
  const btn = t4El("jedHideDepBtn");
  if (btn) {
    const lb = btn.querySelector(".vt-lb");
    btn.classList.toggle("vt-active", JED.hideDep);
    if (lb) lb.textContent = JED.hideDep ? "إظهار المغادرة" : "إخفاء المغادرة";
  }
  const count = t4El("jedHiddenCount");
  if (count) count.textContent = JED.hideDep && hidden ? hidden + " رحلة أقلعت مخفية" : "";
}

// زرّ الترحيل للصالة المفتوحة: نصّه من jedTransferLabel، والأخضر للمرحَّلة.
function jedSyncXferBtn(all) {
  const btn = t4El("jedTransferBtn");
  if (!btn) return;
  const lb = btn.querySelector(".vt-lb");
  const bad = all.filter(function(r) { return jedDisputed(r.n); }).length;
  btn.classList.toggle("vt-active", jedConfirmed(JED.term));
  if (lb) lb.textContent = jedTransferLabel(JED.term, bad);
}

function jedTableRows(all) {
  if (!JED.hideDep) return all;
  return all.filter(function(r) { return !jedDeparted(r.n); });
}

function jedEmptyText(all) {
  if (!JED.meta) return "جارٍ الجلب…";
  return all.length ? "كل رحلات هذه الصالة أقلعت، وهي مخفية." : "لا رحلات بعد لهذه الصالة في هذا اليوم.";
}
`;
}

/** الجزء 5 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart5() {
  return `
function jedRender() {
  const day = jedDay();
  jedRenderTerms(day);
  jedRenderInfo(day);
  const all = jedRows(jedStore());
  const rows = jedTableRows(all);
  jedSyncBtns(all, rows);
  jedRenderBody(day, all, rows);
  jedRenderState();
  jedTick();
  jedRefreshModal();
}

// زرّا الإخفاء والترحيل يتبعان ما في الجدول.
function jedSyncBtns(all, rows) {
  jedSyncHideBtn(all.length - rows.length);
  jedSyncXferBtn(all);
}

// صفوف الجدول، أو سطر الفراغ بسببه إن لم يبقَ صف.
function jedRenderBody(day, all, rows) {
  const body = t4El("jedBody");
  if (!body) return;
  body.innerHTML = rows.length
    ? rows.map(function(r) { return jedRowHtml(day, r); }).join("")
    : '<tr><td colspan="6" class="jed-dim">' + jedEmptyText(all) + "</td></tr>";
}

`;
}

/** الجزء 6 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart6() {
  return `
// العدّاد: يكتب خانات TTD وحدها ولا يعيد بناء الجدول (نمط wlTickTtd).
function jedTick() {
  if (!jedVisible()) return;
  const now = new Date();
  const clock = t4El("jedClock");
  const hm = wlPad2(now.getHours()) + ":" + wlPad2(now.getMinutes());
  if (clock && clock.textContent !== hm) clock.textContent = hm;
  jedTickCells(jedDay(), jedStore());
}

// خانات TTD الظاهرة: كلٌّ تُكتب قيمتها الجديدة إن تغيّرت.
function jedTickCells(day, store) {
  const cells = document.querySelectorAll("#jedBody [data-jttd]");
  for (let i = 0; i < cells.length; i++) {
    const n = store[cells[i].getAttribute("data-jttd")];
    if (!n) continue;
    const txt = jedTtd(day, n);
    if (cells[i].textContent !== txt) cells[i].textContent = txt;
  }
}

`;
}

/** الجزء 7 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart7() {
  return `
function jedToggleDeparted() {
  JED.hideDep = !JED.hideDep;
  showToast(JED.hideDep ? "تم إخفاء الرحلات المغادرة" : "تم إظهار الرحلات المغادرة", "info", 1500);
  jedRender();
  return null;
}
`;
}

/** الجزء 8 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart8() {
  return `
function jedBindTable() {
  const body = t4El("jedBody");
  if (!t4Assert(body, "jedBindTable: العنصر jedBody مفقود")) return;
  // الضغط القصير: نافذة الاختيار. والمطوّل يمنع القصير بعده (fqBindLongPress).
  body.addEventListener("click", function(e) {
    const tr = e.target && e.target.closest ? e.target.closest("tr[data-key]") : null;
    if (tr) jedShowModal(tr.getAttribute("data-key"), "pick");
  });
  fqBindLongPress(body, "tr[data-key]", function(row) {
    jedShowModal(row.getAttribute("data-key"), "edit");
    return true;
  });
}

// اختيار الصالة بالنقر على أزرارها.
function jedBindTerms() {
  const terms = t4El("jedTerms");
  if (t4Assert(terms, "jedBind: العنصر jedTerms مفقود")) terms.addEventListener("click", function(e) {
    const b = e.target && e.target.closest ? e.target.closest("[data-term]") : null;
    if (!b) return;
    JED.term = b.getAttribute("data-term");
    jedRender();
  });
}

`;
}

/** الجزء 9 من 9 من نصّ `getJedViewCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedViewCodePart9() {
  return `
function jedBind() {
  t4OnClick("jedTab", function() {
    showPanel("jedPanel", "jedTab");
    window.scrollTo({ top: 0, behavior: "smooth" });
    jedRender();
    return jedSync();
  });
  jedBindTerms();
  t4OnClick("jedDayBtn", function() {
    if (jedDays().length < 2) return null;
    JED.dayIdx = JED.dayIdx === 0 ? 1 : 0;
    jedRender();
    return jedSync();
  });
  t4OnClick("jedHideDepBtn", jedToggleDeparted);
  t4OnClick("jedTransferBtn", jedTransferStart);
  jedBindTable();
  jedBindModal();
  jedOnChange(jedRender);
  setInterval(jedTick, ${jedViewCfg.COUNTDOWN_INTERVAL_MS});
  setInterval(jedPoll, ${jedViewCfg.JED_POLL_MS});
}
jedBind();
`;
}

module.exports = Object.freeze({ getJedViewCode });
