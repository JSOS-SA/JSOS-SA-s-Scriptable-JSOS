// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: link;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_net.js

/**
 * الاتصال بقاعدة الرصد وقياس الشبكة.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_build_url.js
 *   fq_monitor_record_network_sample.js
 *   fq_monitor_read_network_stats.js
 *   fq_monitor_request.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorBase = importModule("fq_monitor_base");
const monitorAuth = importModule("fq_monitor_auth");

// ════════════════════════════════════════════════
// كان ملف fq_monitor_build_url.js
// ════════════════════════════════════════════════

/**
 * يبني رابط REST لقاعدة الرصد فقط.
 * @param {string} path
 * @param {string} idToken
 * @param {string} [query] معاملات استعلام Firebase مثل orderBy و limitToLast.
 * @returns {string}
 */
function buildMonitorUrl(path, idToken, query) {
  const settings = monitorBase.getMonitorRemoteConfig();
  const base = settings.databaseUrl.charAt(settings.databaseUrl.length - 1) === "/"
    ? settings.databaseUrl.slice(0, -1) : settings.databaseUrl;
  const normalized = String(path || "").replace(/^\/+/, "");
  const resource = `/${normalized}`;
  const suffix = query ? `&${String(query)}` : "";
  return `${base + resource}.json?auth=${encodeURIComponent(idToken)}${suffix}`;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_record_network_sample.js
// ════════════════════════════════════════════════

const SAMPLE_FILE = "fq_monitor_v2_network_samples.json";
const MAX_SAMPLES = 160;

/** @param {{key: string, fallback: string, max: number}} field */
function _sampleText(sample, field) {
  const value = sample[field.key] || field.fallback;
  return String(value).substring(0, field.max);
}

function _sampleNumber(sample, key) {
  return Number(sample[key] || 0);
}

function _normalizeNetworkSample(sample) {
  const value = sample || {};
  return {
    at: Date.now(),
    path: _sampleText(value, { key: "path", fallback: "", max: 160 }),
    method: _sampleText(value, { key: "method", fallback: "GET", max: 12 }),
    status: _sampleNumber(value, "status"),
    ok: Boolean(value.ok),
    durationMs: Math.max(0, _sampleNumber(value, "durationMs")),
    error: _sampleText(value, { key: "error", fallback: "", max: 120 }),
  };
}

/**
 * يسجل عينة زمن شبكة واحدة محليًا دون أي توكن أو سر.
 * @param {Object} sample
 * @returns {boolean}
 */
function recordMonitorNetworkSample(sample) {
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), SAMPLE_FILE);
    const list = manager.fileExists(path)
      ? JSON.parse(manager.readString(path))
      : [];
    list.push(_normalizeNetworkSample(sample));
    manager.writeString(path, JSON.stringify(list.slice(-MAX_SAMPLES)));
    return true;
  } catch (error) {
    console.error(`[fq_monitor_record_network_sample] ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_read_network_stats.js
// ════════════════════════════════════════════════

const WINDOW_MS = 30 * 60 * 1000;

/**
 * تعريف واحد ثابت للوسيط والمئين فوق قيم مرتّبة تصاعديًا.
 * الوسيط لعدد زوجي هو متوسط العنصرين الأوسطين، لا الأدنى منهما.
 * @param {Array<number>} sorted
 * @param {number} fraction
 * @returns {number}
 */
function percentileOf(sorted, fraction) {
  const count = sorted.length;
  if (!count) return 0;
  if (count === 1) return sorted[0];
  const position = (count - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

/** @returns {Array<Object>} العينات المحفوظة، ويرمي إن كان الملف معطوبًا. */
function _readNetworkSamples() {
  const manager = FileManager.local();
  const path = manager.joinPath(manager.documentsDirectory(), SAMPLE_FILE);
  return manager.fileExists(path) ? JSON.parse(manager.readString(path)) : [];
}

/** @returns {Array<number>} أزمنة العينات الموجبة في آخر نافذة، مرتّبة تصاعديًا. */
function _recentDurations(items) {
  const cutoff = Date.now() - WINDOW_MS;
  return items
    .filter((item) => Number(item.at || 0) >= cutoff && Number(item.durationMs || 0) > 0)
    .map((item) => Number(item.durationMs || 0))
    .sort((a, b) => a - b);
}

/** @returns {Object} إحصاءات زمن الشبكة من العينات المحلية الحديثة. */
function readMonitorNetworkStats() {
  try {
    const items = _readNetworkSamples();
    const values = _recentDurations(items);
    const last = items.length ? items[items.length - 1] : null;
    return Object.freeze({ count: values.length, medianMs: percentileOf(values, 0.5), p95Ms: percentileOf(values, 0.95), lastStatus: last ? Number(last.status || 0) : 0, lastError: last ? String(last.error || "") : "" });
  } catch (error) {
    console.error(`[fq_monitor_read_network_stats] ${error.message}`);
    return Object.freeze({ count: 0, medianMs: 0, p95Ms: 0, lastStatus: 0, lastError: error.message });
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_request.js
// ════════════════════════════════════════════════

const HTTP_UNAUTHORIZED = 401;

function _requestStatus(request) {
  return request.response ? request.response.statusCode : 0;
}

function _requestOk(status) {
  return status >= 200 && status < 300;
}

function _requestError(ok, status) {
  return ok ? "" : `HTTP_${status}`;
}

/**
 * @param {{options: Object, request: Request, startedAt: number}} ctx سياق الطلب الواحد
 * @param {{status: number, ok: boolean, error: string}} outcome
 */
function _recordRequestSample(ctx, outcome) {
  recordMonitorNetworkSample({
    path: ctx.options.path,
    method: ctx.request.method,
    status: outcome.status,
    ok: outcome.ok,
    durationMs: Date.now() - ctx.startedAt,
    error: outcome.error,
  });
}

/** @param {{status: number, data: *, ok: boolean, denied: boolean, error: string}} outcome */
function _responseResult(session, outcome) {
  return {
    ok: outcome.ok, status: outcome.status, data: outcome.data, uid: session.uid,
    denied: outcome.denied, error: outcome.error,
  };
}

function _createMonitorRequest(options, session, settings) {
  // تمرير معامل الاستعلام إلى الباني — إسقاطه كان يجعل limitToLast إعدادًا ميتًا وقراءة الأوامر بلا سقف
  const request = new Request(buildMonitorUrl(options.path, session.idToken, options.query));
  request.method = options.method || "GET";
  request.timeoutInterval = settings.requestTimeoutSeconds;
  if (options.body !== undefined && options.body !== null) {
    request.headers = { "Content-Type": "application/json" };
    request.body = JSON.stringify(options.body);
  }
  return request;
}

async function _send(options, isRetry) {
  const settings = monitorBase.getMonitorRemoteConfig();
  const session = await monitorAuth.getMonitorAuthSession(
    isRetry || Boolean(options.forceRefresh)
  );
  const startedAt = Date.now();
  if (!session) {
    return { ok: false, status: 0, data: null, uid: "", denied: false, error: "MONITOR_AUTH_UNAVAILABLE" };
  }

  const ctx = { options, session, startedAt, isRetry, request: _createMonitorRequest(options, session, settings) };
  // المحاولة كلها داخل try، ومنها الإعادة بعد ٤٠١: فشلُ تسجيل الدخول في الإعادة يُلتقط هنا
  // ويُسجَّل عيّنةً فاشلة للطلب الأول، كما كان قبل التقسيم.
  try {
    return await _loadAndAnswer(ctx);
  } catch (error) {
    return _failedResponse(ctx, error);
  }
}

/** يرسل الطلب ويقرأ ردّه، ويعيده مرة واحدة بجلسة مجدَّدة عند ٤٠١. */
async function _loadAndAnswer(ctx) {
  const text = await ctx.request.loadString();
  const status = _requestStatus(ctx.request);
  const data = text ? JSON.parse(text) : null;
  const ok = _requestOk(status);
  const outcome = { status, data, ok, denied: status === HTTP_UNAUTHORIZED, error: _requestError(ok, status) };
  _recordRequestSample(ctx, outcome);
  if (outcome.denied && !ctx.isRetry) return await _send(ctx.options, true);
  if (outcome.denied) console.error(`[fq_monitor_request] رفض صلاحية على ${ctx.options.path}`);
  return _responseResult(ctx.session, outcome);
}

/** نتيجة طلب انقطع أو تعذّر تحليل ردّه، مع عيّنة فاشلة. */
function _failedResponse(ctx, error) {
  const reason = error.message || "MONITOR_NETWORK_ERROR";
  const outcome = { status: 0, data: null, ok: false, denied: false, error: reason };
  _recordRequestSample(ctx, outcome);
  return _responseResult(ctx.session, outcome);
}

/**
 * ينفذ طلبًا واحدًا على قاعدة الرصد ويعيد نتيجة صريحة.
 * @param {Object} options خيارات الطلب: path و method و body و query و forceRefresh
 * @returns {Promise<Object>}
 */
async function monitorRequest(options) {
  return await _send(options || {}, false);
}

module.exports = Object.freeze({
  buildMonitorUrl,
  recordMonitorNetworkSample,
  readMonitorNetworkStats,
  monitorRequest,
});
