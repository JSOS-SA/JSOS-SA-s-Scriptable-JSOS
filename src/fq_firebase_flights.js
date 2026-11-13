// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: plane-departure;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_firebase_flights.js

// ═══ عمليات الرحلات على القاعدة ═══
// المسؤولية الواحدة: حفظ/تحميل/تعديل/حذف بيانات الرحلات في فايربيس.
const cfg = importModule("fq_config");
const perms = importModule("fq_permissions");
const rest = importModule("fq_firebase_rest");
const content = importModule("fq_firebase_content");
const helpers = importModule("fq_helpers");
const statusEnum = importModule("fq_enum_status");

// ═══ حفظ الرحلات — الهوية من المصدر الوحيد في fq_helpers ═══
// المفتاح يشمل المصدر (sch/t1/north) فلا تتصادم رحلة جداول مع رحلة صالة
// تحمل نفس الرقم والتاريخ والوقت، ولا تسقط أي منهما.
function _flightKey(flight) {
  return helpers.flightKey(flight);
}

function _flightValue(flight, key, fallback) {
  return flight[key] || fallback;
}

function _serializeDepartureTime(value) {
  return value instanceof Date ? value.toISOString() : (value || "");
}

// حالة يعلنها المطار (ملغاة، متأخرة) أو "" — وما سواها لا يُقرأ ولا يُكتب.
// السبب في fq_enum_status عند SITE_STATUSES.
function _siteStatus(value) {
  return statusEnum.SITE_STATUSES.indexOf(value) !== -1 ? value : "";
}

function _serializeFlight(flight, user) {
  const out = {
    al: _flightValue(flight, "al", ""), flt: _flightValue(flight, "flt", ""), to: _flightValue(flight, "to", ""),
    std: _flightValue(flight, "std", ""), type: _flightValue(flight, "type", ""), dpax: _flightValue(flight, "dpax", ""),
    date: _flightValue(flight, "date", ""),
    depTime: _serializeDepartureTime(flight.depTime),
    terminal: _flightValue(flight, "terminal", ""),
    src: _flightValue(flight, "_src", "pdf"),
    updatedBy: user.name, updatedByRole: user.role, updatedByEmpId: user.empId,
    updatedAt: new Date().toISOString(),
  };
  // لا حقل فارغ في كل سطر — تراكمُ بيانات ممنوع بأمر المالك
  const status = _siteStatus(flight._status);
  if (status) out.status = status;
  return out;
}

function _buildFlightsPayload(flights, user) {
  // من لا يملك الحذف لا ينقل: السبب عند keepStoredKey في fq_helpers
  const canMove = perms.can(user.role, "delete_flight");
  const taken = {};
  for (let t = 0; t < flights.length; t++) taken[_flightKey(flights[t])] = true;
  const payload = {};
  for (let i = 0; i < flights.length; i++) {
    const key = canMove ? _flightKey(flights[i]) : helpers.keepStoredKey(flights[i], taken);
    if (!key || key.length < 3) continue;
    payload[key] = _serializeFlight(flights[i], user);
  }
  if (canMove) _moveRenamedKeys(flights, payload);
  return payload;
}

// ═══ الحفظ ينقل السجلّ ولا ينسخه (العرف ١٥) ═══
// رحلةٌ تغيّر وقتها يتغيّر مفتاحها، فلو كُتبت تحت الجديد وبقي القديم صار في
// القاعدة سجلّان لرحلة واحدة وعاد الموعد القديم عند أول قراءة. فيُسنَد null
// للمفتاح المخزَّن في الطلب نفسه — نظير fq_parser في الصفحة حرفيًّا وبحرسه:
// البديل في الطلب فعلًا، ولا يُحذف مفتاحٌ هو هدفٌ لسجلّ آخر.
function _moveRenamedKeys(flights, payload) {
  const has = (key) => Object.prototype.hasOwnProperty.call(payload, key);
  for (let i = 0; i < flights.length; i++) {
    const oldKey = flights[i]._fbKey;
    const newKey = _flightKey(flights[i]);
    if (!oldKey || oldKey === newKey || !has(newKey) || has(oldKey)) continue;
    payload[oldKey] = null;
  }
}

function _buildScheduleDatesPayload(files, user) {
  const payload = {};
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.date) continue;
    payload[file.date.replace(/[.#$[\]/]/g, "-")] = {
      fileName: file.name, count: file.count,
      uploadedBy: user.name, uploadedByEmpId: user.empId,
      uploadedAt: new Date().toISOString(),
    };
  }
  return payload;
}

/**
 * يكتب كل عقدة بما يخصّها وحدها — طلب PATCH لكل عقدة فيها مفاتيح، معًا.
 * العقد مستقلة لا يعتمد بعضها على بعض، فلا معنى لانتظار واحدة قبل أخرى.
 * @param {Object} payload - { مفتاح: قيمة }
 * @returns {Promise<boolean>} نجحت كل العقد. حمولة فارغة نجاحٌ بلا طلب.
 */
async function _patchByNode(payload) {
  const byNode = helpers.splitByNode(payload);
  const nodes = Object.keys(byNode);
  const results = await Promise.all(nodes.map((node) => rest.patchData(node, byNode[node])));
  return results.every((ok) => ok);
}

/**
 * يحفظ الرحلات، كلُّ رحلة في عقدة صالتها.
 * @param {Array} flights - الرحلات (العدد في flights_meta يُحسب منها كلها)
 * @param {Array} files - ملفات الجداول لسجلّ التواريخ
 * @param {string} [onlyTerminal] - "sch" أو "t1" أو "north" أو "hall4": تُكتب رحلات هذه
 *   الصالة وحدها. استخراجُ صالةٍ لا يمسّ غيرها — كان يعيد كتابة الصالات
 *   الثلاث فيمحو اسم من أدخل رحلات الجداول ووقتها (قيس ٢٠٢٦-٠٩-٢٨).
 * @returns {Promise<boolean>}
 */
async function saveFlightsToFirebase(flights, files, onlyTerminal) {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "upload_pdf")) {
    console.error(`[fq_firebase_flights] saveFlightsToFirebase denied for role: ${user.role || "unknown"}`);
    return false;
  }

  // ═══ القائمة الفارغة لا يُرسل لها PATCH ═══
  // `PATCH` بجسمٍ فارغ ليس حذفًا بحسب الوثائق، فهو لا يُفرِّغ العقدة ولا
  // أثر له. وتفريغ العقدة مهمّة مسار الحذف (`fqBulkDelete` بإسناد `null`)
  // لا مسار الحفظ. فيُتجاوَز الطلب ويُكتفى بتحديث `flights_meta` ليصير
  // العدد صفرًا صادقًا. (تقرير التدقيق ٢٠٢٦-٠٩-٢٥، البند ٤.)
  const toWrite = onlyTerminal
    ? flights.filter((f) => helpers.flightSource(f) === onlyTerminal)
    : flights;
  const ok = toWrite.length > 0
    ? await _patchByNode(_buildFlightsPayload(toWrite, user))
    : true;
  if (files && files.length > 0) {
    await rest.patchData("schedule_dates", _buildScheduleDatesPayload(files, user));
  }
  await rest.patchData("flights_meta", {
    totalFlights: flights.length,
    lastUpdateBy: user.name,
    lastUpdateAt: new Date().toISOString(),
  });
  return ok;
}

function _deserializeDepartureTime(value) {
  return value ? new Date(value) : null;
}

function _deserializeFlight(key, flight) {
  if (!flight) return null;
  const out = {
    _fbKey: key,
    al: _flightValue(flight, "al", ""), flt: _flightValue(flight, "flt", ""), to: _flightValue(flight, "to", ""),
    std: _flightValue(flight, "std", ""), type: _flightValue(flight, "type", ""), dpax: _flightValue(flight, "dpax", ""),
    date: _flightValue(flight, "date", ""),
    depTime: _deserializeDepartureTime(flight.depTime),
    terminal: _flightValue(flight, "terminal", ""),
    _src: _flightValue(flight, "src", "fb"),
    updatedBy: _flightValue(flight, "updatedBy", ""), updatedByRole: _flightValue(flight, "updatedByRole", ""),
  };
  const status = _siteStatus(flight.status);
  if (status) out._status = status;
  return out;
}

/**
 * يقرأ رحلات القاعدة، **ويفرّق** بين «القاعدة فارغة» و«تعذّرت القراءة».
 *
 * ═══ لماذا التفريق إلزاميّ ═══
 * كان السطر `if (!result.ok || !result.data) return null;` يدمج الحالتين،
 * فصار الاستدعاء لا يعرف هل القاعدة خالية أم أنّ الشبكة سقطت. وبنى
 * `fq_main._savedPageDataJs` على ذلك سقوطًا إلى نسخة الجهاز، فكان حذف **كل**
 * الرحلات يُتبَع بعودتها عند أول تشغيل. (تقرير التدقيق ٢٠٢٦-٠٩-٢٥، البند ١.)
 *
 * والمعلومة موجودة في الطبقة الأدنى ولم تكن تُستعمل:
 * `fq_firebase_rest.readData` يُرجع `{ ok: true, data: null }` للعقدة
 * المعدومة، و`{ ok: false, error, status }` للفشل. وذلك موافقٌ للوثائق:
 * «Firebase Realtime Database … a `GET` … returns `null` if no data exists
 *  at the specified location».
 * <https://firebase.google.com/docs/database/rest/retrieve-data>
 *
 * @returns {Promise<{flights: Array}|null>} قائمة الرحلات — وقد تكون فارغة —
 *   أو `null` **للفشل وحده**.
 */
async function loadFlightsFromFirebase() {
  // العقد كلها تُقرأ معًا، وتعذّرُ واحدةٍ منها فشلٌ للكل: قائمةٌ ناقصة
  // صالةً كاملة تُعرض كأنها كاملة فيُحفظ فوقها — والتفريق بين «فارغ»
  // و«معطوب» (العرف ١٧) يبقى محفوظًا لكل عقدة.
  const results = await Promise.all(helpers.flightNodes().map((node) => rest.readData(node)));
  if (results.some((r) => !r.ok)) return null;

  const flights = [];
  for (let n = 0; n < results.length; n++) {
    const data = results[n].data;
    const keys = data ? Object.keys(data) : [];
    for (let i = 0; i < keys.length; i++) {
      const flight = _deserializeFlight(keys[i], data[keys[i]]);
      if (flight) flights.push(flight);
    }
  }
  return { flights: flights };
}

// عقدة المفتاح، أو الفشل صريحًا لمفتاح مجهول المصدر: لا يُكتب في عقدة مخمَّنة.
function _nodeOfKeyOrNull(fbKey) {
  const node = helpers.flightNodeOfKey(fbKey);
  if (!node) console.error(`[fq_firebase_flights] مفتاح بلا مصدر معروف: ${fbKey}`);
  return node || null;
}

/**
 * يحدّث رحلة في عقدة صالتها بمفتاحها المخزَّن.
 * @param {string} fbKey مفتاح الرحلة في القاعدة
 * @param {Object} newData الحقول المحدَّثة
 * @returns {Promise<boolean>} نجاح الكتابة، و false عند المنع أو مفتاح بلا مصدر
 */
async function updateFlight(fbKey, newData) {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "edit_flight")) return false;
  const payload = Object.assign({}, newData, {
    updatedBy: user.name, updatedByRole: user.role,
    updatedByEmpId: user.empId, updatedAt: new Date().toISOString(),
  });
  const node = _nodeOfKeyOrNull(fbKey);
  if (!node) return false;
  return await rest.patchData(`${node}/${fbKey}`, payload);
}

/**
 * يحذف رحلة من عقدة صالتها ويكتب إشعار الحذف.
 * @param {string} fbKey مفتاح الرحلة في القاعدة
 * @returns {Promise<boolean>} نجاح الحذف، و false عند المنع أو مفتاح بلا مصدر
 */
async function deleteFlight(fbKey) {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "delete_flight")) return false;
  const node = _nodeOfKeyOrNull(fbKey);
  if (!node) return false;
  const ok = await rest.deleteData(`${node}/${fbKey}`);
  await content.pushNotification({
    type: "data_deleted", title: "حذف رحلة",
    details: fbKey, user: user.name, role: user.role,
    time: new Date().toISOString(),
  });
  return ok;
}

/**
 * يحذف عدة رحلات في طلب PATCH **واحد** بإسناد null لكل مفتاح.
 *
 * كانت الدالة تُسمّى «دفعة» وهي ترسل طلب DELETE مستقلًّا لكل مفتاح، فمئة
 * رحلة كانت مئة طلب متسلسل. والحذف الجماعي سلوك موثَّق:
 * «Firebase also supports multi-path updates… PATCH can now update values
 *  at multiple locations», و«You can also delete by specifying null as the
 *  value for another write operation such as set() or update()».
 * <https://firebase.google.com/docs/database/rest/save-data>
 * وهو نمطٌ مستعمل في المستودع أصلًا: `fq_migrate_flight_keys.js` دالة
 * `applyPlan`.
 *
 * @param {string[]} fbKeys - مفاتيح الرحلات، من أي صالة — تُوزَّع على عقدها
 * @returns {Promise<boolean>} نجاح الطلب. القائمة الفارغة نجاحٌ بلا طلب.
 */
async function deleteFlightsBatch(fbKeys) {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "delete_flight")) return false;
  if (!fbKeys || fbKeys.length === 0) return true;
  const payload = {};
  for (let i = 0; i < fbKeys.length; i++) payload[fbKeys[i]] = null;
  return await _patchByNode(payload);
}

/**
 * يحذف عقد الرحلات كلها. لمن يملك `delete_database` في مصفوفة الصلاحيات
 * (المطوّر والمشرف، قرار المالك ٢٠٢٦-٠٩-٢٩).
 * @returns {Promise<boolean>} true إن نجح حذف العقد كلها
 */
async function clearAllFlights() {
  const user = cfg.getCurrentUser();
  if (!perms.can(user.role, "delete_database")) return false;
  const results = await Promise.all(helpers.flightNodes().map((node) => rest.deleteData(node)));
  return results.every((ok) => ok);
}

module.exports = Object.freeze({
  saveFlightsToFirebase, loadFlightsFromFirebase,
  updateFlight, deleteFlight, deleteFlightsBatch, clearAllFlights,
});
