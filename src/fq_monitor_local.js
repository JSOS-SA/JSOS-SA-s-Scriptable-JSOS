// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: file-alt;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_local.js

/** السجل التشخيصي المحلي؛ لا يستورد شبكة أو طابور الرصد السحابي. */
const RETENTION_MS = 48 * 60 * 60 * 1000;
const LIMITS = Object.freeze({ activity: 20 * 1024 * 1024, error: 5 * 1024 * 1024 });

/** يحجب الأسرار من النصوص التشخيصية، ولا يقبل أجسام طلبات أو قيم حقول. */
function cleanText(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/(bearer\s+)[^\s"']+/gi, "$1[محجوب]")
    .replace(/((?:password|pass|refreshToken|idToken|monitorToken|accessToken|apiKey|api_key|secret|authorization|auth|cookie|id_token|refresh_token|key)\s*["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&}\]]+)/gi, "$1[محجوب]")
    .replace(/\b[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{10,}\b/g, "[رمز محجوب]")
    .substring(0, 2000);
}

/** ينسخ الحقول المسموح بها فقط؛ النص المكتوب والمدخلات والأسرار خارج الواجهة. */
function safeRecord(row) {
  const allowed = ["eventId", "operationId", "parentOperationId", "sessionId", "empId", "deviceId", "kind", "phase", "status", "action", "descriptionAr", "elementId", "elementPath", "elementLabelAr", "attributeName", "addedCount", "removedCount", "tag", "inputType", "length", "changeType", "scrollX", "scrollY", "occurredAt", "durationMs", "code", "httpStatus", "method", "path", "attempts", "service", "fileName", "functionName", "line", "column", "message", "stack", "originalMessage", "originalStack", "originalType", "errorType", "measurementKnown", "runtime", "count", "savedAt"];
  const out = {};
  if (!row || typeof row !== "object") return out;
  allowed.forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) return;
    const value = row[key];
    if (typeof value === "string") out[key] = cleanText(value);
    else if (typeof value === "number" && isFinite(value)) out[key] = value;
    else if (typeof value === "boolean" || value === null) out[key] = value;
  });
  return out;
}

/** يختصر الحقول المتكررة داخل دفعة محدودة دون حذف حدث أو قيمة مسموحة. */
function packLocalEvents(events) {
  const keys = []; const strings = []; const frequencies = Object.create(null);
  events.forEach(function (row) {
    Object.keys(row).forEach(function (key) {
      if (keys.indexOf(key) < 0) keys.push(key);
      if (typeof row[key] === "string") frequencies[row[key]] = (frequencies[row[key]] || 0) + 1;
    });
  });
  Object.keys(frequencies).forEach(function (value) { if (frequencies[value] > 1 && value.length > 12) strings.push(value); });
  const rows = events.map(function (row) {
    const values = [];
    Object.keys(row).forEach(function (key) {
      const value = row[key]; const index = typeof value === "string" ? strings.indexOf(value) : -1;
      values.push(keys.indexOf(key), index < 0 ? value : [index]);
    });
    return values;
  });
  return { keys: keys, strings: strings, rows: rows };
}
/** يفك التنسيق الجديد ويتحقق من مراجع القاموس قبل قبول الملف. */
function unpackLocalEvents(packed) {
  if (!packed || !Array.isArray(packed.keys) || !Array.isArray(packed.strings) || !Array.isArray(packed.rows) || packed.rows.length > 250) throw new Error("قاموس سجل غير صالح");
  return packed.rows.map(function (values) {
    if (!Array.isArray(values) || values.length % 2) throw new Error("صف سجل غير صالح");
    const row = Object.create(null);
    for (let i = 0; i < values.length; i += 2) {
      const key = packed.keys[values[i]]; const value = values[i + 1];
      if (typeof key !== "string") throw new Error("مرجع حقل غير صالح");
      if (Array.isArray(value) && (value.length !== 1 || typeof packed.strings[value[0]] !== "string")) throw new Error("مرجع نص غير صالح");
      row[key] = Array.isArray(value) ? packed.strings[value[0]] : value;
    }
    return safeRecord(row);
  });
}
/** قياس الترميز الفعلي بالواجهة الرسمية؛ الدفعات محدودة لتجنب مصفوفة بايتات كبيرة. */
function localTextBytes(text) {
  const data = Data.fromString(text);
  if (!data) throw new Error("تعذر قياس بيانات السجل");
  return data.getBytes().length;
}

/** يشرح سبب الحفظ الحالي بالعربية دون تحويل الفجوة التاريخية إلى عطل حالي. */
function storageFailureAr(reason) {
  const messages = { capacity: "المساحة المتبقية لا تكفي لحفظ الدفعة", write_failure: "تعذرت كتابة الدفعة أو إثبات حفظها", storage_not_ready: "مجلد التسجيل غير جاهز" };
  return messages[reason] || "لا فشل حفظ حالي مسجل؛ لا ينفي ذلك فجوة سابقة";
}

// ═══ المسجِّل: حالة واحدة تُنشأ في createRecorder ولا تخرج منه، ودوال الملف تأخذها وسيطًا ═══

const DIR_NAME = "fq_local_diagnostics_v1";
const BATCH_LIMIT = 250;
const PENDING_LIMITS = Object.freeze({ activity: 2000, error: 250 });
const CATEGORIES = ["activity", "error"];
const SCOPE_AR = "عدادات الفشل والفجوات تخص التشغيل الحالي؛ لا تعيد بناء أحداث لم تحفظ في تشغيل سابق";
const SECTIONS_AR = Object.freeze({
  operations: { kind: "operation", descriptionAr: "تسلسل الإجراءات؛ البداية والنهاية تحملان معرف العملية نفسه" },
  interactions: { kind: "interaction", descriptionAr: "حدوث التفاعل وموضعه دون النص المكتوب" },
  errors: { kind: "error", descriptionAr: "الأخطاء وأدلتها الأصلية المتاحة بعد حجب الأسرار" },
});
const FIELD_DESCRIPTIONS_AR = Object.freeze({ eventPeriod: "فترة وقوع الأحداث الموجودة فعلًا في هذا التقرير، وليست تاريخ ختم الإصدار", savedPeriod: "فترة حفظ الأحداث الموجودة؛ وقت الحفظ هو أساس مدة اليومين", storageFormatVersion: "تنسيق ملفات الحفظ الداخلي؛ التقرير يعيد الأحداث مفصلة دون اختصار حقولها", blockedActivityBytes: "حجم آخر دفعة نشاط رفضت لعدم كفاية المساحة", lastSavedAt: "وقت آخر حفظ ناجح في التشغيل الحالي، أو قيمة خالية إن لم يسجل", eventId: "معرف الحدث؛ إعادة نقله لا تنشئ حدثًا آخر", operationId: "معرف العملية الذي يربط بدءها ونتيجتها وخطأها", parentOperationId: "العملية التي استدعت هذه الخطوة إن كان الربط متاحًا", occurredAt: "وقت وقوع الحدث حسب ساعة الجهاز", savedAt: "وقت حفظ السجل؛ منه تحسب مدة الاحتفاظ", durationMs: "مدة الاستدعاء بالمللي ثانية، لا زمن تنفيذ الخادم وحده", length: "طول النص بعد التغيير؛ النص نفسه غير محفوظ", httpStatus: "حالة الاستجابة إن توفرت، وإلا قيمة خالية", stack: "التتبع المتاح؛ قد يشير إلى الالتقاط لا موضع الخطأ الأصلي", originalStack: "التتبع الأصلي إذا احتفظ به موضع الفشل", runtime: "سياق تنفيذ الحدث", status: "نتيجة الاستدعاء حسب الدليل، لا مجرد غياب استثناء" });
const STATUS_DESCRIPTIONS_AR = Object.freeze({ running: "بدأ ولم تسجل نتيجة بعد", returned: "عاد الاستدعاء دون دليل نجاح بعيد", succeeded: "نتيجة نجاح صريحة من واجهة الإجراء", failed: "فشل صريح أو استثناء", queued: "بانتظار الإرسال؛ لم يثبت نجاح الخادم", cancelled: "ألغي الإجراء", not_confirmed: "عاد الاستدعاء بقيمة نفي؛ لا يحدد ذلك وحده إلغاءً أو فشلًا" });
const EXPLANATION_AR = "السجلات محلية؛ الوقتان يميزان وقوع الحدث وحفظه. لا تحفظ النصوص المكتوبة. وجود فجوة أو إغلاق قسري يمنع ادعاء اكتمال التسجيل.";

/**
 * حالة المسجِّل كلها؛ الجذر يُحسب قبل معرّف الجلسة كما في الترتيب الأصلي.
 * والساعة والمعرّف يُناديان منفردين كما يمرّرهما المستدعي، لا دالتين على كائن الحالة.
 */
function _newState(options) {
  const fm = options.fm;
  const now = options.now;
  const uuid = options.uuid;
  return {
    fm: fm, now: function () { return now(); }, uuid: function () { return uuid(); }, root: fm.joinPath(fm.documentsDirectory(), DIR_NAME),
    meta: { sessionId: uuid(), empId: "", deviceId: "" }, sequence: 0, pending: [], storageReady: false,
    accepted: {}, savedBatches: {}, fileMetadata: {},
    usage: { activity: 0, error: 0 }, blockedBytes: { activity: 0, error: 0 }, currentFailures: { activity: "", error: "" },
    rejectedIds: Object.create(null), lastSavedAt: null,
    coverage: { writeFailures: 0, rejected: 0, expired: 0, malformed: 0, lastError: "", stoppedActivity: false, stoppedErrors: false },
  };
}

function _path(st, name) { return st.fm.joinPath(st.root, name); }
function _failure(st, error) { st.coverage.writeFailures++; st.coverage.lastError = cleanText(error && error.message || error); }
function _malformed(st, error) { st.coverage.malformed++; st.coverage.lastError = cleanText(error.message); }
function _stoppedKey(category) { return category === "error" ? "stoppedErrors" : "stoppedActivity"; }
function _remaining(st, category) { return Math.max(0, LIMITS[category] - st.usage[category]); }
function _files(st) { return st.fm.listContents(st.root).filter(function (name) { return /^(?:activity|error)_[A-Za-z0-9_-]+\.json$/.test(name); }); }
function _safeName(text) { return text.replace(/[^A-Za-z0-9_-]/g, "-"); }

function _rejectRows(st, rows) {
  rows.forEach(function (row) {
    if (st.rejectedIds[row.eventId]) return;
    st.rejectedIds[row.eventId] = true; st.coverage.rejected++;
  });
}

function _readFile(st, name) {
  if (!st.fm.fileExists(_path(st, name))) throw new Error("ملف السجل غير موجود");
  const raw = st.fm.readString(_path(st, name));
  const data = JSON.parse(raw);
  if (data && data.localSchemaVersion === "1.1.0") data.events = unpackLocalEvents(data.packed);
  if (!data || ["1.0.0", "1.1.0"].indexOf(data.localSchemaVersion) < 0 || !Array.isArray(data.events) || typeof data.savedAt !== "number") throw new Error("سجل محلي غير صالح");
  return data;
}

function _storedSize(st, name) {
  // حجم مدير الملفات على الهاتف مقرب بالكيلوبايت؛ النص المقروء يقيس البايتات دون التقريب.
  return localTextBytes(st.fm.readString(_path(st, name)));
}

function _start(st, metadata) {
  st.meta = Object.assign(st.meta, metadata || {});
  try {
    if (!st.fm.isDirectory(st.root)) st.fm.createDirectory(st.root, true);
    st.storageReady = true;
    _cleanup(st);
  } catch (error) { _failure(st, error); }
  return Object.assign({}, st.meta);
}

// ─── التنظيف: حجم كل ملف أو انتهاؤه، ثم حالة السعة ───

function _fileInfo(st, name) {
  if (st.fileMetadata[name]) return st.fileMetadata[name];
  const data = _readFile(st, name);
  const info = { savedAt: data.savedAt, count: data.events.length, size: _storedSize(st, name) };
  st.fileMetadata[name] = info;
  return info;
}

function _accountFile(st, name) {
  const category = name.indexOf("error_") === 0 ? "error" : "activity";
  try {
    const info = _fileInfo(st, name);
    if (info.savedAt > 0 && st.now() - info.savedAt >= RETENTION_MS) {
      st.fm.remove(_path(st, name)); st.coverage.expired += info.count;
      delete st.fileMetadata[name];
    } else { st.usage[category] += info.size; }
  } catch (error) { _malformed(st, error); st.usage[category] += _storedSize(st, name); }
}

function _refreshCapacity(st) {
  CATEGORIES.forEach(function (category) {
    if (st.currentFailures[category] === "capacity" && st.usage[category] + st.blockedBytes[category] <= LIMITS[category]) st.currentFailures[category] = "";
  });
  st.coverage.stoppedActivity = st.usage.activity >= LIMITS.activity || st.currentFailures.activity === "capacity";
  st.coverage.stoppedErrors = st.usage.error >= LIMITS.error || st.currentFailures.error === "capacity";
}

function _cleanup(st) {
  if (!st.storageReady) return false;
  st.usage.activity = 0; st.usage.error = 0;
  try {
    _files(st).forEach(function (name) { _accountFile(st, name); });
    _refreshCapacity(st);
    return true;
  } catch (error) { _failure(st, error); return false; }
}

// ─── الحفظ: `job` = { category, rows, batchId } ───

/** ملف الدفعة الموجود بمعرّفاتها نفسها يكفي؛ والمعطوب يُترك ويُكتب باسم إعادة. يرمي عند التعارض. */
function _saveTarget(st, job) {
  const name = job.category + "_" + _safeName(job.batchId) + ".json";
  if (!st.fm.fileExists(_path(st, name))) return { name: name };
  let old = null;
  try { old = _readFile(st, name); }
  catch (error) {
    st.coverage.malformed++;
    return { name: job.category + "_" + _safeName(job.batchId) + "_retry_" + _safeName(st.uuid()) + ".json" };
  }
  if (old.batchId !== job.batchId || old.events.length !== job.rows.length || old.events.some(function (event, index) { return event.eventId !== job.rows[index].eventId; })) throw new Error("تعارض معرّف دفعة محلية");
  return { existing: true };
}

function _rejectForCapacity(st, job, bytes) {
  st.blockedBytes[job.category] = bytes; st.currentFailures[job.category] = "capacity";
  st.coverage[_stoppedKey(job.category)] = true;
  _rejectRows(st, job.rows);
  return false;
}

function _commitSaved(st, job, saved) {
  const measuredSize = _storedSize(st, saved.name);
  st.usage[job.category] += measuredSize;
  st.fileMetadata[saved.name] = { savedAt: saved.savedAt, count: job.rows.length, size: measuredSize };
  st.savedBatches[job.category + job.batchId] = true;
  st.currentFailures[job.category] = ""; st.blockedBytes[job.category] = 0; st.lastSavedAt = saved.savedAt;
  st.coverage[_stoppedKey(job.category)] = false;
  return true;
}

/** يكتب الدفعة ثم يقرؤها ليثبت حفظها، أو يرفضها لعدم كفاية المساحة. */
function _writeBatch(st, job, name) {
  const savedAt = st.now();
  const events = job.rows.map(function (row) { return Object.assign(safeRecord(row), { savedAt: savedAt }); });
  const text = JSON.stringify({ localSchemaVersion: "1.1.0", batchId: job.batchId, savedAt: savedAt, packed: packLocalEvents(events) });
  const bytes = localTextBytes(text);
  if (st.usage[job.category] + bytes > LIMITS[job.category]) return _rejectForCapacity(st, job, bytes);
  st.fm.writeString(_path(st, name), text);
  const check = _readFile(st, name);
  if (check.batchId !== job.batchId || JSON.stringify(check.events) !== JSON.stringify(events)) throw new Error("تعذر إثبات حفظ الدفعة المحلية");
  return _commitSaved(st, job, { name: name, savedAt: savedAt });
}

function _saveOnce(st, job) {
  const target = _saveTarget(st, job);
  if (!target.existing) return _writeBatch(st, job, target.name);
  st.savedBatches[job.category + job.batchId] = true;
  return true;
}

function _save(st, job) {
  if (!st.storageReady || !job.rows.length) { st.currentFailures[job.category] = "storage_not_ready"; return false; }
  if (st.savedBatches[job.category + job.batchId]) return true;
  try { return _saveOnce(st, job); }
  catch (error) { st.currentFailures[job.category] = "write_failure"; _failure(st, error); return false; }
}

// ─── التسجيل والتفريغ ودفعات الصفحة ───

function _byKind(rows) {
  return { errors: rows.filter(function (row) { return row.kind === "error"; }), activity: rows.filter(function (row) { return row.kind !== "error"; }) };
}

function _record(st, kind, details) {
  const category = kind === "error" ? "error" : "activity";
  if (st.pending.filter(function (row) { return (row.kind === "error") === (kind === "error"); }).length >= PENDING_LIMITS[category]) { st.coverage.rejected++; return false; }
  st.sequence++;
  st.pending.push(Object.assign(safeRecord(details || {}), st.meta, { eventId: st.meta.sessionId + "_native_" + st.sequence, kind: kind, runtime: "scriptable", occurredAt: st.now() }));
  return true;
}

/** يحفظ جزءًا على دفعات محدودة ويزيل المحفوظ من الانتظار؛ يقف عند أول دفعة لم تُحفظ. */
function _flushPart(st, category, part) {
  for (let offset = 0; offset < part.length; offset += BATCH_LIMIT) {
    const chunk = part.slice(offset, offset + BATCH_LIMIT);
    if (!_save(st, { category: category, rows: chunk, batchId: chunk[0].eventId + "_" + chunk[chunk.length - 1].eventId })) return false;
    const ids = {};
    chunk.forEach(function (row) { ids[row.eventId] = true; });
    st.pending = st.pending.filter(function (row) { return !ids[row.eventId]; });
  }
  return true;
}

function _flush(st) {
  if (!st.pending.length) return true;
  const split = _byKind(st.pending.slice());
  // الجزآن يُحفظان كلاهما ولو فشل الأول.
  const activityOk = _flushPart(st, "activity", split.activity);
  const errorsOk = _flushPart(st, "error", split.errors);
  return activityOk && errorsOk;
}

function _validPageBatch(batch) {
  return Boolean(batch) && typeof batch.batchId === "string" && Array.isArray(batch.events) && batch.events.length <= BATCH_LIMIT;
}

/** يحفظ صفوف الصفحة في ملفين بحسب النوع؛ الجزآن يُحفظان كلاهما ولو فشل الأول. */
function _savePageRows(st, batchId, rows) {
  const split = _byKind(rows);
  const activityOk = !split.activity.length || _save(st, { category: "activity", rows: split.activity, batchId: batchId + "_activity" });
  const errorsOk = !split.errors.length || _save(st, { category: "error", rows: split.errors, batchId: batchId + "_error" });
  return activityOk && errorsOk;
}

function _ingestFailure(st, batchId) {
  return { ok: false, reason: st.currentFailures.activity || st.currentFailures.error || st.coverage.lastError || "حد التخزين أو فشل الحفظ", batchId: batchId };
}

function _ingest(st, batch) {
  if (!_validPageBatch(batch)) return { ok: false, reason: "دفعة صفحة غير صالحة" };
  if (st.accepted[batch.batchId]) return { ok: true, batchId: batch.batchId };
  const rows = batch.events.map(function (row) { return Object.assign(safeRecord(row), st.meta, { runtime: "webview" }); });
  if (rows.some(function (row) { return !row.eventId; })) return { ok: false, reason: "معرّف حدث غائب" };
  if (!_savePageRows(st, batch.batchId, rows)) return _ingestFailure(st, batch.batchId);
  st.accepted[batch.batchId] = true;
  return { ok: true, batchId: batch.batchId };
}

// ─── الحالة والتقرير ───

function _storageState(st) {
  return { currentActivityFailure: st.currentFailures.activity, currentErrorFailure: st.currentFailures.error,
    currentActivityFailureAr: storageFailureAr(st.currentFailures.activity), currentErrorFailureAr: storageFailureAr(st.currentFailures.error),
    lastSavedAt: st.lastSavedAt, blockedActivityBytes: st.blockedBytes.activity, blockedErrorBytes: st.blockedBytes.error,
    remainingActivityBytes: _remaining(st, "activity"), remainingErrorBytes: _remaining(st, "error") };
}

/** أحداث الملفات المحفوظة بلا تكرار، مرتبة بوقت الوقوع ثم بالمعرّف. */
function _collectRows(st) {
  const rows = [];
  const seen = {};
  if (st.storageReady) _files(st).forEach(function (name) {
    try { _readFile(st, name).events.forEach(function (row) { if (!seen[row.eventId]) { seen[row.eventId] = true; rows.push(safeRecord(row)); } }); }
    catch (error) { _malformed(st, error); }
  });
  rows.sort(function (a, b) { return a.occurredAt - b.occurredAt || String(a.eventId).localeCompare(String(b.eventId)); });
  return rows;
}

function _span(values) {
  if (!values.length) return { firstUtc: null, lastUtc: null };
  return { firstUtc: new Date(values.reduce(function (a, b) { return Math.min(a, b); })).toISOString(), lastUtc: new Date(values.reduce(function (a, b) { return Math.max(a, b); })).toISOString() };
}

function _complete(st) {
  return st.pending.length === 0 && st.coverage.rejected === 0 && st.coverage.writeFailures === 0 && st.coverage.malformed === 0;
}

function _coverageReport(st) {
  return Object.assign({}, st.coverage, { scopeAr: SCOPE_AR, currentActivityFailureAr: storageFailureAr(st.currentFailures.activity), currentErrorFailureAr: storageFailureAr(st.currentFailures.error), currentActivityFailure: st.currentFailures.activity, currentErrorFailure: st.currentFailures.error, blockedActivityBytes: st.blockedBytes.activity, blockedErrorBytes: st.blockedBytes.error, lastSavedAt: st.lastSavedAt, remainingActivityBytes: _remaining(st, "activity"), remainingErrorBytes: _remaining(st, "error"), pending: st.pending.length, complete: _complete(st) });
}

function _sections(rows) {
  const out = {};
  Object.keys(SECTIONS_AR).forEach(function (key) {
    const section = SECTIONS_AR[key];
    out[key] = { descriptionAr: section.descriptionAr, eventIds: rows.filter(function (row) { return row.kind === section.kind; }).map(function (row) { return row.eventId; }) };
  });
  return out;
}

function _readReport(st) {
  _flush(st); _cleanup(st);
  const rows = _collectRows(st);
  return { localSchemaVersion: "1.0.0", storageFormatVersion: "1.1.0",
    eventPeriod: _span(rows.map(function (row) { return row.occurredAt; })), savedPeriod: _span(rows.map(function (row) { return row.savedAt; })),
    retentionHours: 48, textValuesRecorded: false, uploadEnabled: false, session: Object.assign({}, st.meta), limitsBytes: LIMITS, usageBytes: Object.assign({}, st.usage),
    coverage: _coverageReport(st), events: rows, sections: _sections(rows),
    fieldDescriptionsAr: Object.assign({}, FIELD_DESCRIPTIONS_AR), statusDescriptionsAr: Object.assign({}, STATUS_DESCRIPTIONS_AR), explanationAr: EXPLANATION_AR };
}

/** ينشئ مهايئًا قابلًا للاختبار بواجهات الملفات والساعة نفسها. @param {Object} options */
function createRecorder(options) {
  const st = _newState(options);
  return Object.freeze({
    start: function (metadata) { return _start(st, metadata); },
    record: function (kind, details) { return _record(st, kind, details); },
    flush: function () { return _flush(st); },
    ingest: function (batch) { return _ingest(st, batch); },
    cleanup: function () { return _cleanup(st); },
    getStorageState: function () { return _storageState(st); },
    readReport: function () { return _readReport(st); },
  });
}

// ═══ مراقبة استدعاءات الوحدات ═══

/** نتيجة الاستدعاء حسب الدليل الذي يُرجعه، لا مجرد غياب استثناء. */
function _operationStatus(value, error) {
  const v = value || {};
  if (error || v.ok === false || v.success === false) return "failed";
  if (value === false) return "not_confirmed";
  if (v.cancelled === true) return "cancelled";
  if (v.queued === true) return "queued";
  if (v.ok === true || v.success === true) return "succeeded";
  return "returned";
}

function _operationEnd(value, error) {
  const v = value || {};
  return { phase: "end", status: _operationStatus(value, error), httpStatus: typeof v.status === "number" && v.status > 0 ? v.status : null, code: typeof v.error === "string" ? v.error : "" };
}

/** طلبات الشبكة تُسجَّل بطريقتها ومسارها دون معاملات العنوان. */
function _addRequestFields(context, key, first) {
  if (!/Request|fetch|refreshSession/i.test(key) || !first || typeof first !== "object") return;
  context.method = typeof first.method === "string" ? first.method : "";
  context.path = typeof first.path === "string" ? first.path.split("?")[0] : "";
}

/** يسجل نهاية الاستدعاء وخطأه إن وُجد، ويُرجع القيمة كما هي. `call` = { context, began }. */
function _finishOperation(call, value, error) {
  record("operation", Object.assign({}, call.context, _operationEnd(value, error), { durationMs: Date.now() - call.began, descriptionAr: "انتهى الاستدعاء؛ العودة وحدها لا تثبت النجاح البعيد" }));
  if (error) recordError(error, call.context);
  return value;
}

function _observedFunction(name, source, key) {
  const original = source[key];
  return function () {
    const call = { context: { operationId: UUID.string(), action: name + "." + key, fileName: name + ".js", functionName: key }, began: Date.now() };
    _addRequestFields(call.context, key, arguments[0]);
    record("operation", Object.assign({}, call.context, { phase: "start", status: "running", descriptionAr: "بدأ استدعاء وحدة النظام" }));
    try {
      const value = original.apply(source, arguments);
      if (value && typeof value.then === "function") return value.then(function (answer) { return _finishOperation(call, answer, null); }, function (error) { _finishOperation(call, null, error); throw error; });
      return _finishOperation(call, value, null);
    } catch (error) { _finishOperation(call, null, error); throw error; }
  };
}

let recorder = null;
/** يحفظ حدود استدعاء الوحدة ونتيجته دون تغيير معطياته أو طباعة مدخلاته. */
function observeModule(name, source) {
  const result = {};
  Object.keys(source).forEach(function (key) {
    const original = source[key];
    result[key] = typeof original !== "function" || /^(?:get|build|setErrorObserver|setLocalErrorObserver)/.test(key) ? original : _observedFunction(name, source, key);
  });
  return Object.freeze(result);
}
function current() {
  if (!recorder) recorder = createRecorder({ fm: FileManager.local(), now: function () { return Date.now(); }, uuid: function () { return UUID.string(); } });
  return recorder;
}
/** يبدأ جلسة تسجيل محلية؛ لا يكتب أي طلب شبكة. */
function start(metadata) { return current().start(metadata); }
/** يسجل وصف إجراء دون مدخلاته أو نصوص الحقول. */
function record(kind, details) { return current().record(kind, details); }

function _measuredStatus(source) { return typeof source.status === "number" && source.status > 0; }

function _errorOwnFields(source, error) {
  return { descriptionAr: source.code === "NETWORK_ERROR" ? "تعذر إتمام طلب الشبكة؛ لا توجد حالة استجابة مسجلة في هذا الخطأ، والسبب الأصلي المتاح مرفق" : "وقع خطأ في الإجراء؛ الرسالة والتتبع المتاحان أدلة، ولا يحدد السبب الجذري بالتخمين", message: source.message || String(error), stack: source.stack || "", errorType: source.name || "غير معروف", code: source.code || "", httpStatus: _measuredStatus(source) ? source.status : null };
}

function _errorOriginalFields(source, original) {
  return { originalMessage: original.message || "", originalStack: original.stack || "", originalType: original.name || "", measurementKnown: _measuredStatus(source) };
}

/** يسجل الخطأ الأصلي والحقول التشخيصية المتاحة فقط. */
function recordError(error, details) {
  const source = error || {};
  const original = source.originalError || {};
  return record("error", Object.assign({}, details || {}, _errorOwnFields(source, error), _errorOriginalFields(source, original)));
}
/** يحفظ دفعة التطبيق المحتجزة. */
function flush() { return current().flush(); }
/** يحفظ دفعة الصفحة ويؤكدها بعد القراءة فقط. */
function ingest(batch) { return current().ingest(batch); }
/** يقرأ حالة الحفظ الحالية دون تحميل جميع أحداث التقرير. */
function getStorageState() { return current().getStorageState(); }
/** ينظف السجلات الجديدة المنتهية وحدها. */
function cleanup() { return current().cleanup(); }
/** يبني بيانات التقرير المحلية مع بيان التغطية. */
function readReport() { return current().readReport(); }
module.exports = Object.freeze({ createRecorder: createRecorder, observeModule: observeModule, cleanText: cleanText, start: start, record: record, recordError: recordError, flush: flush, ingest: ingest, cleanup: cleanup, getStorageState: getStorageState, readReport: readReport });
