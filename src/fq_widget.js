// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_widget.js

/**
 * @module fq_widget
 * @description وحدة الودجت (Widget) المسؤولة عن عرض حالة الرحلات على شاشة النظام.
 * محصنة ضد تسرب الذاكرة ومجهزة بآلية التدهور الرشيق للعمل دون اتصال.
 */

const storage = importModule("fq_storage");
const alerts = importModule("fq_alerts");

// ═══ ألوان الواجهة ═══
const C = {
  bg: new Color("#fafafa"),
  card: new Color("#1a1a1a"),
  ac: new Color("#E50914"),
  tx: new Color("#1a1a1a"),
  dm: new Color("#888888"),
  am: new Color("#ca8a04"),
  ok: new Color("#16a34a"),
  bd: new Color("#e5e5e5"),
};

// ═══ دوال مساعدة للودجت ═══
/**
 * يُرجع تدرّج خلفية الودجة.
 * كانت الوثيقة تصرّح بوسيط `mins` لا وجود له، وبنوع إرجاع `string` مع أن
 * الدالة تُرجع `LinearGradient` — فأبلغ `tsc` عن خمسة مواضع إسنادٍ سليمة
 * على أنها خطأ. (تقرير التدقيق ٢٠٢٦-٠٩-٢٥، الفئة أ.)
 * @returns {LinearGradient}
 */
function timeGradient() {
  const g = new LinearGradient();
  g.locations = [0, 1];
  g.colors = [new Color("#fafafa"), new Color("#fafafa")];
  return g;
}

/**
 * يُرجع الرحلات القادمة المرتبة.
 * @param {Array} flights - الرحلات
 * @returns {Array}
 */
function getUpcoming(flights) {
  if (!flights || !Array.isArray(flights)) return [];
  const now = new Date();
  return flights
    .filter(f => new Date(f.depTime) > now)
    // getTime() صريحٌ: طرح تاريخٍ من تاريخ يعمل بتحويل valueOf الضمنيّ،
    // لكنه ليس تعبيرًا حسابيًّا صحيحًا، وترفضه أداة الفحص بحق.
    .sort((a, b) => new Date(a.depTime).getTime() - new Date(b.depTime).getTime());
}

/**
 * يضيف نصًّا بخطّه ولونه إلى ودجة أو حاوية.
 * @param {ListWidget|WidgetStack} parent
 * @param {string} text
 * @param {{font: Font, color: Color}} look
 * @returns {WidgetText}
 */
function _addStyledText(parent, text, look) {
  const item = parent.addText(text);
  item.font = look.font;
  item.textColor = look.color;
  return item;
}

/** ودجة جديدة بخلفيتها المتدرّجة؛ والحشوة لكل مقاس عند مستدعيه. */
function _newWidget() {
  const w = new ListWidget();
  w.backgroundGradient = timeGradient();
  return w;
}

function _addFlightRow(widget, flight, flightGap) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  _addStyledText(row, flight.flt, { font: Font.boldSystemFont(14), color: C.tx });
  row.addSpacer(flightGap);
  _addStyledText(row, flight.to, { font: Font.systemFont(12), color: C.dm });
  row.addSpacer();
  _addStyledText(row, flight.std, { font: Font.systemFont(14), color: C.am });
}

/** رأس الودجة: الطائرة واسم النظام في سطر واحد. يتقاسمه الفارغ والكبير. */
function _addBrandHeader(widget) {
  const header = widget.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();
  const icon = header.addText("✈️");
  icon.font = Font.systemFont(16);
  header.addSpacer(6);
  _addStyledText(header, "Flight Query", { font: Font.boldSystemFont(16), color: C.ac });
  return header;
}

function _addLargeHeader(widget, totalFlights) {
  const header = _addBrandHeader(widget);
  header.addSpacer();
  _addStyledText(header, `${totalFlights} رحلة`, { font: Font.systemFont(14), color: C.ok });
}

function _addFlightDivider(widget, spacing) {
  widget.addSpacer(spacing);
  const divider = widget.addStack();
  divider.size = new Size(0, 1);
  divider.backgroundColor = C.bd;
  widget.addSpacer(spacing);
}

// ═══ بناء واجهات الودجت بأحجامها ═══

/**
 * يبني ودجت فارغ عند غياب البيانات.
 * @returns {ListWidget}
 */
function buildEmpty() {
  const w = _newWidget();
  w.setPadding(16, 16, 16, 16);
  _addBrandHeader(w);
  w.addSpacer();
  const msg = _addStyledText(w, "لا توجد رحلات مجدولة حالياً", { font: Font.systemFont(14), color: C.dm });
  msg.centerAlignText();
  w.addSpacer();
  return w;
}

/**
 * يبني الودجت الصغير.
 * @param {Object} data - البيانات
 * @returns {ListWidget}
 */
function buildSmall(data) {
  const w = _newWidget();
  w.setPadding(12, 12, 12, 12);
  const icon = w.addText("✈️");
  icon.font = Font.systemFont(18);
  w.addSpacer(8);
  _addStyledText(w, String(data.totalFlights || 0), { font: Font.boldSystemFont(24), color: C.tx });
  _addStyledText(w, "رحلة اليوم", { font: Font.systemFont(12), color: C.dm });
  return w;
}

// سطر «لا قادمة» يضبط اللون قبل الخطّ — ترتيبه الأصلي محفوظ فلا يمرّ بـ _addStyledText.
function _addNoUpcoming(widget) {
  const msg = widget.addText("لا توجد رحلات قادمة");
  msg.textColor = C.dm;
  msg.font = Font.systemFont(12);
}

/** صفوف المتوسطة: بين كل رحلتين مسافة. */
function _addMediumRows(widget, upcoming) {
  for (let i = 0; i < upcoming.length; i++) {
    _addFlightRow(widget, upcoming[i], 6);
    if (i < upcoming.length - 1) widget.addSpacer(6);
  }
}

/**
 * يبني الودجت المتوسط.
 * @param {Object} data - البيانات
 * @returns {ListWidget}
 */
function buildMedium(data) {
  const w = _newWidget();
  w.setPadding(14, 16, 14, 16);
  _addStyledText(w, "✈️ Flight Query - الرحلات القادمة", { font: Font.boldSystemFont(14), color: C.ac });
  w.addSpacer(8);
  const upcoming = getUpcoming(data.flights).slice(0, 2);
  if (upcoming.length === 0) _addNoUpcoming(w);
  else _addMediumRows(w, upcoming);
  return w;
}

/**
 * يبني الودجت الكبير.
 * @param {Object} data - البيانات
 * @returns {ListWidget}
 */
function buildLarge(data) {
  const w = _newWidget();
  w.setPadding(14, 16, 12, 16);
  _addLargeHeader(w, data.totalFlights);
  w.addSpacer(12);

  const upcoming = getUpcoming(data.flights).slice(0, 5);
  for (let i = 0; i < upcoming.length; i++) {
    _addFlightRow(w, upcoming[i], 8);
    if (i < upcoming.length - 1) _addFlightDivider(w, 8);
  }
  return w;
}

// ═══ دوال مساعدة لـ run() ═══
function _selectWidget(data) {
  if (!(data && data.flights) || data.flights.length === 0) return buildEmpty();
  const family = config.widgetFamily;
  if (family === "small") return buildSmall(data);
  if (family === "large") return buildLarge(data);
  return buildMedium(data);
}

function _setWidgetUrl(w, data) {
  const upcoming = getUpcoming(data ? data.flights : []);
  w.url = upcoming.length > 0
    ? `scriptable:///run/fq_main?search=${encodeURIComponent(upcoming[0].flt)}`
    : "scriptable:///run/fq_main";
}

function _buildErrorWidget() {
  const w = new ListWidget();
  w.backgroundColor = new Color("#fafafa");
  const t = w.addText("⚠️ عطل في الودجت");
  t.textColor = new Color("#E50914");
  t.font = Font.boldSystemFont(14);
  return w;
}

function _hasFlights(data) {
  return Boolean(data && data.flights && data.flights.length > 0);
}

async function _scheduleAlertsIfNeeded(data) {
  if (_hasFlights(data) && typeof alerts.scheduleAlerts === "function") {
    await alerts.scheduleAlerts(data.flights);
  }
}

function _setWidgetRefresh(widget) {
  const next = new Date();
  next.setMinutes(next.getMinutes() + 5);
  widget.refreshAfterDate = next;
}

function _installWidget(data) {
  const widget = _selectWidget(data);
  _setWidgetUrl(widget, data);
  _setWidgetRefresh(widget);
  Script.setWidget(widget);
}

async function _presentInApp(data) {
  const widget = _hasFlights(data) ? buildMedium(data) : buildEmpty();
  await widget.presentMedium();
}

// ═══ نقطة الدخول — C≤7 ═══
/**
 * نقطة دخول الودجة: تقرأ نسخة الجهاز وتعرض الودجة أو معاينتها، وتُعلم Scriptable بالانتهاء في finally.
 */
async function run() {
  try {
    const data = storage.loadFlights();
    await _scheduleAlertsIfNeeded(data);
    if (config.runsInWidget) _installWidget(data);
    else await _presentInApp(data);
  } catch (error) {
    console.error(`[fq_widget] Critical Error: ${error.message}`);
    if (config.runsInWidget) Script.setWidget(_buildErrorWidget());
  } finally {
    Script.complete();
  }
}

module.exports = Object.freeze({ run });

// تنفيذ تلقائي إذا تم تشغيل السكربت كواجهة أساسية
if (config.runsInWidget || config.runsInApp) {
  // run() غير متزامنة، وتركها سائبةً يجعل أي رفضٍ فيها يُبتلَع صامتًا فتبقى
  // الودجة فارغة بلا سببٍ معلوم. و .catch() إلزاميّ لكل وعد غير منتظَر
  // (CLAUDE.md القسم ١، الخيار أ). كشفه @typescript-eslint/no-floating-promises.
  run().catch((runError) => console.error(`[fq_widget] ${runError}`));
}
