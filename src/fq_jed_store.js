// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_jed_store.js

/**
 * @module fq_jed_store
 * @description المسؤولية الواحدة: قاعدة رحلات الصالات لتيوب LIVE FLT —
 * الجلب والحفظ وحالة التيوب. لا يرسم شيئًا.
 *
 * **مصدر البيانات**: قاعدة `JED_DB_URL` المستقلة، يكتبها جامع الرحلات على
 * الحاسوب (`cloud.py` في `~/Desktop/رحلات_صالات_جدة`) كل نصف دقيقة:
 * - `jed/meta` ورقة صغيرة: ختم آخر تغيير لكل يوم وصالة `u[day][N|1|4]`،
 *   وحال المواقع `sources`، وعدد الرحلات بلا صالة `no_terminal[day]`.
 * - `jed/days/{day}/{N|1|4}/{key}` رحلة مختصرة بختم تحديثها `u`. الرحلة
 *   التي خرجت من الصالة تُكتب `{x:1,u}` علامةَ خروج لا حذفًا.
 * - `jed/choices/{day}/{num}/{field}` = `{value, source, at}` اختيارات
 *   الجوالات، ويدمجها الجامع مع اختيارات الطرفية والأحدث يغلب.
 *
 * **الجلب**: الصالة كاملة أول مرة، ثم ما ختمه أحدث مما عندنا فقط
 * (`orderBy="u"&startAt=`) — فتبقى القائمة كاملة ويصل كل تغيير، ويبقى
 * التنزيل تحت الحدّ المجاني لـ٢٢ جوالًا. والطلب يحتاج `.indexOn:["u"]` في
 * قواعد القاعدة، وقيس ٢٠٢٦-١٠-٠٣: بدونه يُرفض بـ٤٠٠ «Index not defined».
 *
 * **بلا رمز دخول**: الفرع مفتوح بأمر المالك، و`_fbFetchOnce` لا يضيف رمز
 * القاعدة الرئيسة إلا لروابطها (`_fbAuthenticatedUrl` يقارن ببداية
 * `FB_URL`). ولأن الفرع مفتوح للكتابة لأي أحد، لا يُوثق بمفتاح يوم لم يُفحص
 * شكله، وكل نصّ منه يمرّ بـ `t4Esc` قبل الصفحة في الوحدات التي ترسم.
 *
 * **الحفظ لا يمرّ بـ `fqSendOrQueue`** (العرف ١٥): ذاك باب القاعدة الرئيسة
 * وطابورها، وهذه قاعدة أخرى. فإن فشل الحفظ قيل ذلك صراحةً ولم يُحفظ شيء.
 *
 * **الترحيل إلى كايا** (أمر المالك ٢٠٢٦-١٠-٠٥): `jed/kaya/links/{N|1|4}` الصالات
 * المرحَّلة `{on, at}` ونتيجة الحاسوب `r` تحتها، و`jed/kaya/picks/{day}/{key}`
 * الوقت الذي اختاره المالك `{t: "sched"|"est", est}`. يكتب الجوال الطلب،
 * والحاسوب (`kaya_bridge.py` في `رحلات_صالات_جدة`) وحده يكتب في القاعدة
 * الرئيسة. ولا يُكتب اسم الموظف هنا: الفرع مفتوح لأي أحد.
 *
 * **الاعتماد نازل**: هذه الوحدة لا تعرف من يرسم. من يريد أن يعرف بوصول
 * تغيير يسجّل نفسه بـ `jedOnChange` (نمط `t4OnEditorChange`).
 */

const jedStoreCfg = importModule("fq_config");

/**
 * شيفرة قاعدة تيوب LIVE FLT التي تعمل داخل الصفحة.
 * @returns {string} نص JavaScript للمتصفح
 */
function getJedStoreCode() {
  return getJedStoreCodePart1() +
    getJedStoreCodePart2() +
    getJedStoreCodePart3() +
    getJedStoreCodePart4() +
    getJedStoreCodePart5();
}

/** الجزء 1 من 5 من نصّ `getJedStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedStoreCodePart1() {
  return `
// ═══ LIVE FLT: القاعدة ═══
const JED_URL = ${JSON.stringify(jedStoreCfg.JED_DB_URL)};
// days[day][terminal][key] = رحلة · stamps[day][terminal] = آخر ختم وصلنا
// hideDep: الرحلات التي أقلعت مخفية حتى يُظهرها الموظف (أمر المالك).
// links: الصالات المرحَّلة إلى كايا · walk: تتابع نوافذ الترحيل (fq_jed_transfer).
let JED = { meta: null, days: {}, stamps: {}, dayIdx: 0, term: "N", open: null,
  mode: "", busy: false, error: "", hideDep: true, listeners: [], links: {}, walk: null };

function jedGet(path, query) {
  const url = JED_URL + "/" + path + ".json" + (query || "");
  return _fbFetchOnce(url, {}, 15000).then(function(r) { return r.json(); });
}

function jedMerge(store, nodes) {
  let top = 0;
  for (const k in nodes) {
    if (!Object.prototype.hasOwnProperty.call(nodes, k)) continue;
    const n = nodes[k];
    if (!n) continue;
    if (n.u > top) top = n.u;
    if (n.x) delete store[k];
    else store[k] = n;
  }
  return top;
}

// الصالة كاملة إن لم تكن عندنا، وإلا ما ختمه بعد آخر ختم وصلنا فقط.
async function jedSyncTerm(day, t, remote) {
  const have = JED.days[day] && JED.days[day][t];
  const mine = (JED.stamps[day] || {})[t] || 0;
  if (have && mine >= remote) return;
  const query = have ? '?orderBy="u"&startAt=' + (mine + 1) : "";
  const nodes = await jedGet("jed/days/" + day + "/" + t, query);
  const top = jedMerge(jedTermStore(day, t), nodes || {});
  if (!JED.stamps[day]) JED.stamps[day] = {};
  JED.stamps[day][t] = Math.max(remote, top, mine);
}

`;
}

/** الجزء 2 من 5 من نصّ `getJedStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedStoreCodePart2() {
  return `
// مخزن الصالة في اليوم، يُنشأ هو ووعاء يومه إن غابا.
function jedTermStore(day, t) {
  if (!JED.days[day]) JED.days[day] = {};
  if (!JED.days[day][t]) JED.days[day][t] = {};
  return JED.days[day][t];
}

function jedDays() {
  const u = (JED.meta && JED.meta.u) || {};
  return Object.keys(u).filter(jedIsDay).sort();
}

function jedDay() {
  const list = jedDays();
  if (JED.dayIdx >= list.length) JED.dayIdx = 0;
  return list[JED.dayIdx] || "";
}

function jedStore() {
  return ((JED.days[jedDay()] || {})[JED.term]) || {};
}

// الأيام التي خرجت من الورقة (أمس) تُنسى هنا كما تُمحى من القاعدة.
function jedForgetOldDays() {
  const keep = jedDays();
  Object.keys(JED.days).forEach(function(d) {
    if (keep.indexOf(d) === -1) { delete JED.days[d]; delete JED.stamps[d]; }
  });
}

function jedOnChange(fn) { JED.listeners.push(fn); }

function jedAnnounce() {
  JED.listeners.forEach(function(fn) { fn(); });
}

`;
}

/** الجزء 3 من 5 من نصّ `getJedStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedStoreCodePart3() {
  return `
async function jedSync() {
  if (JED.busy) return;
  JED.busy = true;
  try {
    JED.meta = await jedGet("jed/meta", "");
    jedForgetOldDays();
    await Promise.all(jedSyncJobs(jedDay()));
    JED.error = "";
  } catch (e) {
    jedSyncFailed(e);
  } finally {
    JED.busy = false;
  }
  jedAnnounce();
}

// وعود جلب اليوم: صالةً صالةً بختمها في القاعدة، ومعها روابط الترحيل.
function jedSyncJobs(day) {
  const u = (JED.meta && JED.meta.u && JED.meta.u[day]) || {};
  return JED_TERMS.map(function(t) {
    return jedSyncTerm(day, t[0], u[t[0]] || 0);
  }).concat([jedReadLinks()]);
}

function jedSyncFailed(e) {
  console.error("[fq_jed] تعذّر الجلب", e);
  JED.error = "تعذّر الاتصال بقاعدة الرحلات — يُعاد خلال دقيقة، والمعروض آخر ما وصل.";
}
`;
}

/** الجزء 4 من 5 من نصّ `getJedStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedStoreCodePart4() {
  return `
// ═══ الترحيل إلى كايا ═══
async function jedReadLinks() {
  const links = await jedGet("jed/kaya/links", "");
  JED.links = (links && typeof links === "object") ? links : {};
  return JED.links;
}

function jedLinked(t) {
  const l = JED.links[t];
  return Boolean(l && l.on === true);
}

// ردّ الحاسوب على آخر طلب (r.at === at). قبله لا يُقال «مُرحَّلة»: الطلب في
// القاعدة، لكن لا أحد نقل شيئًا بعد.
function jedConfirmed(t) {
  const l = JED.links[t];
  return jedLinked(t) && Boolean(l.r && l.r.at === l.at);
}

// طلب الترحيل واختيارات الأوقات بطلب PATCH واحد متعدد المسارات.
// يُرجع ختم الطلب، أو صفرًا إن لم يصل (فلا يُقال «أُرسل»).
async function jedRequestTransfer(t, day, picks) {
  const at = Date.now();
  const body = {};
  body["links/" + t] = { on: true, at: at };
  Object.keys(picks).forEach(function(key) { body["picks/" + day + "/" + key] = picks[key]; });
  try {
    await _fbFetchOnce(JED_URL + "/jed/kaya.json", { method: "PATCH",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, 15000);
  } catch (e) {
    console.error("[fq_jed] تعذّر طلب الترحيل", e);
    return 0;
  }
  JED.links[t] = { on: true, at: at };
  return at;
}
`;
}

/** الجزء 5 من 5 من نصّ `getJedStoreCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getJedStoreCodePart5() {
  return `
// اختيارات رحلة واحدة بطلب واحد: { field: {value, source} }. الدمج عند الجامع
// كل نصف دقيقة، ثم يرفع الرحلة بقيمها الجديدة؛ فيُعاد الجلب بعد ٣٥ ثانية.
async function jedSaveChoices(num, picks) {
  const body = {};
  const at = Date.now();
  Object.keys(picks).forEach(function(field) {
    body[field] = { value: picks[field].value, source: picks[field].source, at: at };
  });
  const url = JED_URL + "/jed/choices/" + encodeURIComponent(jedDay()) + "/" +
    encodeURIComponent(num) + ".json";
  try {
    await _fbFetchOnce(url, { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body) }, 15000);
  } catch (e) {
    console.error("[fq_jed] تعذّر الحفظ", e);
    return false;
  }
  setTimeout(function() {
    jedSync().catch(function(err) { console.error("[fq_jed] جلب بعد الحفظ", err); });
  }, 35000);
  return true;
}
`;
}

module.exports = Object.freeze({ getJedStoreCode });
