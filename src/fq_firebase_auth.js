// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: user-shield;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_firebase_auth.js

/**
 * @module fq_firebase_auth
 * @description عميل Firebase Authentication الرسمي عبر REST في بيئة Scriptable.
 * يحتفظ برمز التجديد داخل Keychain فقط، ويجدد رمز الهوية قبل انتهائه.
 */

const cfg = importModule("fq_config");

const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const TOKEN_BASE_URL = "https://securetoken.googleapis.com/v1";
const REQUEST_TIMEOUT_SECONDS = 12;
const EXPIRY_SAFETY_SECONDS = 300;

const KEY_ID_TOKEN = "fq_auth_id_token";
const KEY_REFRESH_TOKEN = "fq_auth_refresh_token";
const KEY_TOKEN_EXPIRY = "fq_auth_token_expiry";
const KEY_UID = "fq_auth_uid";
const KEY_EMAIL = "fq_auth_email";
const KEY_SESSION_COMMIT = "fq_auth_session_commit";

function _hasKey(name) {
  try { return Keychain.contains(name); }
  catch (error) {
    console.error(`[fq_firebase_auth] keychain contains: ${error.message}`);
    return false;
  }
}

function _getKey(name) {
  try { return _hasKey(name) ? Keychain.get(name) : ""; }
  catch (error) {
    console.error(`[fq_firebase_auth] keychain read: ${error.message}`);
    return "";
  }
}

function _setKey(name, value) {
  if (value === undefined || value === null || value === "") return;
  Keychain.set(name, String(value));
}

function _removeKey(name) {
  try { if (_hasKey(name)) Keychain.remove(name); }
  catch (error) { console.error(`[fq_firebase_auth] keychain remove: ${error.message}`); }
}

function _requireConfiguration() {
  if (!cfg.FIREBASE_API_KEY) {
    throw _authError("لم يُضبط مفتاح Firebase API على هذا الجهاز.", "MISSING_API_KEY", 0);
  }
  if (cfg.FIREBASE_URL === null || cfg.FIREBASE_URL === undefined || cfg.FIREBASE_URL.indexOf("https://") !== 0) {
    throw _authError("لم يُضبط رابط قاعدة Firebase على هذا الجهاز.", "MISSING_DATABASE_URL", 0);
  }
}

/**
 * يبني خطأ مصادقة يحمل رمزًا وحالةً إضافيّتين.
 * `Error` القياسيّ لا يُعرِّف `code` ولا `status`، فتُسند بـ `Object.assign`
 * ويُصرَّح النوع في الوثيقة — فتُسكت أداة الفحص بالصواب لا بالتجاهل.
 * @param {string} message - نصّ الخطأ للموظف
 * @param {string} code - رمز الخطأ
 * @param {number} status - حالة HTTP إن وُجدت
 * @returns {Error & {code: string, status: number, originalError?: any}}
 */
function _authError(message, code, status) {
  return Object.assign(new Error(message), {
    code: code || "AUTH_ERROR",
    status: status || 0,
  });
}

function _firebaseMessage(code) {
  const messages = Object.freeze({
    EMAIL_EXISTS: "البريد الإلكتروني مسجّل مسبقًا.",
    OPERATION_NOT_ALLOWED: "تسجيل البريد وكلمة المرور غير مفعّل في Firebase.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.",
    EMAIL_NOT_FOUND: "البريد أو كلمة المرور غير صحيحة.",
    INVALID_PASSWORD: "البريد أو كلمة المرور غير صحيحة.",
    INVALID_LOGIN_CREDENTIALS: "البريد أو كلمة المرور غير صحيحة.",
    USER_DISABLED: "هذا الحساب موقوف.",
    INVALID_EMAIL: "صيغة البريد الإلكتروني غير صحيحة.",
    MISSING_PASSWORD: "كلمة المرور مطلوبة.",
    WEAK_PASSWORD: "كلمة المرور لا تحقق الحد الأدنى المطلوب في Firebase.",
    INVALID_ID_TOKEN: "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد.",
    MISSING_ID_TOKEN: "تعذّر العثور على جلسة الدخول. سجّل الدخول من جديد.",
    TOKEN_EXPIRED: "انتهت جلسة الدخول. سجّل الدخول من جديد.",
    INVALID_REFRESH_TOKEN: "انتهت جلسة الدخول. سجّل الدخول من جديد.",
    PROJECT_NUMBER_MISMATCH: "جلسة الدخول لا تخص مشروع Firebase الحالي.",
    QUOTA_EXCEEDED: "توقّف إرسال الرسائل مؤقتًا بسبب بلوغ الحد المسموح.",
    USER_NOT_FOUND: "الحساب غير موجود.",
  });
  return messages[code] || "تعذّر إكمال المصادقة مع Firebase.";
}

function _parseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); }
  catch (error) { throw _authError("استجابة Firebase غير صالحة.", "INVALID_RESPONSE", 0); }
}

async function _loadAuthResponse(request) {
  try {
    return await request.loadString();
  } catch (error) {
    const failure = _authError("تعذّر الاتصال بخدمة Firebase Authentication.", "NETWORK_ERROR", 0);
    failure.originalError = error;
    throw failure;
  }
}

function _responseStatus(request) {
  return (request.response && request.response.statusCode)
    ? request.response.statusCode
    : 0;
}

function _assertAuthResponse(status, data) {
  if (status >= 200 && status < 300) return;
  const raw = (data && data.error && data.error.message)
    ? data.error.message
    : "AUTH_ERROR";
  const code = String(raw).split(" : ")[0];
  throw _authError(_firebaseMessage(code), code, status);
}

/**
 * يرسل طلب POST إلى خدمة المصادقة ويُرجع جسم الردّ، ويرمي خطأ مصادقة عند الفشل.
 * كل طلبات الخدمة POST، فلا يُمرَّر الفعل.
 * @param {string} url العنوان مع المفتاح
 * @param {string} body الجسم نصًّا
 * @param {Object} [headers] الترويسة، وافتراضيًّا JSON
 * @returns {Promise<Object>}
 */
async function _request(url, body, headers) {
  const request = new Request(url);
  request.method = "POST";
  request.headers = headers || { "Content-Type": "application/json" };
  request.body = body;
  request.timeoutInterval = REQUEST_TIMEOUT_SECONDS;

  const text = await _loadAuthResponse(request);
  const status = _responseStatus(request);
  const data = _parseJson(text);
  _assertAuthResponse(status, data);
  return data || {};
}

function _resetSessionCommit() {
  try { Keychain.set(KEY_SESSION_COMMIT, "0"); }
  catch (error) { console.error(`[fq_firebase_auth] commit reset: ${error.message}`); }
}

/**
 * موعد انتهاء الرمز بالمللي ثانية: مدّة الخادم، ودقيقة على الأقل.
 * @param {Object} payload ردّ الدخول (expiresIn) أو التجديد (expires_in)
 * @returns {number}
 */
function _tokenExpiry(payload) {
  const expiresIn = Number(payload.expiresIn || payload.expires_in || 3600);
  return Date.now() + Math.max(60, expiresIn) * 1000;
}

/**
 * يكتب مفاتيح الجلسة الخمسة بترتيبها. ردّ الدخول وردّ التجديد يسمّيان الحقول باسمين.
 * لا يمسّ علامة الاكتمال: صاحبها `_storeTokens`.
 * @param {Object} payload ردّ الخادم
 * @param {number} expiry موعد الانتهاء
 * @returns {void}
 */
function _writeSessionKeys(payload, expiry) {
  _setKey(KEY_ID_TOKEN, payload.idToken || payload.id_token);
  _setKey(KEY_REFRESH_TOKEN, payload.refreshToken || payload.refresh_token);
  _setKey(KEY_TOKEN_EXPIRY, expiry);
  _setKey(KEY_UID, payload.localId || payload.user_id);
  _setKey(KEY_EMAIL, payload.email);
}

function _storeTokens(payload) {
  const expiry = _tokenExpiry(payload);
  try {
    // العلامة تُنزل قبل المفاتيح وتُرفع بعدها، فلا تُقرأ جلسةٌ نصفُها مكتوب.
    Keychain.set(KEY_SESSION_COMMIT, "0");
    _writeSessionKeys(payload, expiry);
    Keychain.set(KEY_SESSION_COMMIT, "1");
    return true;
  } catch (error) {
    console.error(`[fq_firebase_auth] store tokens: ${error.message}`);
    _resetSessionCommit();
    return false;
  }
}

/** @returns {boolean} هل الجلسة المخزنة مكتملة الكتابة. */
function _isSessionCommitted() {
  return _getKey(KEY_SESSION_COMMIT) === "1";
}

/**
 * يُرجع هوية الحساب المحفوظة في Keychain.
 * @returns {Readonly<{uid: string, email: string}>} المعرّف والبريد
 */
function getStoredIdentity() {
  return Object.freeze({
    uid: _getKey(KEY_UID),
    email: _getKey(KEY_EMAIL),
  });
}

/**
 * ينشئ حسابًا في Firebase Authentication ويحفظ رموزه في Keychain.
 * @param {string} email البريد الإلكتروني
 * @param {string} password كلمة المرور
 * @returns {Promise<Object>} ردّ الخادم، ويرمي عند الفشل
 */
async function signUp(email, password) {
  _requireConfiguration();
  const data = await _request(
    `${AUTH_BASE_URL}/accounts:signUp?key=${encodeURIComponent(cfg.FIREBASE_API_KEY)}`,
    JSON.stringify({ email: email, password: password, returnSecureToken: true })
  );
  _storeTokens(data);
  return data;
}

/**
 * يسجّل الدخول في Firebase Authentication ويحفظ رموزه في Keychain.
 * @param {string} email البريد الإلكتروني
 * @param {string} password كلمة المرور
 * @returns {Promise<Object>} ردّ الخادم، ويرمي عند الفشل
 */
async function signIn(email, password) {
  _requireConfiguration();
  const data = await _request(
    `${AUTH_BASE_URL}/accounts:signInWithPassword?key=${encodeURIComponent(cfg.FIREBASE_API_KEY)}`,
    JSON.stringify({ email: email, password: password, returnSecureToken: true })
  );
  _storeTokens(data);
  return data;
}

/**
 * يجدّد رمز الدخول القصير من رمز التجديد المحفوظ في Keychain.
 * @returns {Promise<string>} الرمز الجديد، ويرمي إن لم توجد جلسة قابلة للتجديد
 */
async function refreshIdToken() {
  _requireConfiguration();
  const refreshToken = _getKey(KEY_REFRESH_TOKEN);
  if (!refreshToken) throw _authError("لا توجد جلسة قابلة للتجديد.", "NO_REFRESH_TOKEN", 0);
  const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`;
  const data = await _request(
    `${TOKEN_BASE_URL}/token?key=${encodeURIComponent(cfg.FIREBASE_API_KEY)}`,
    body,
    { "Content-Type": "application/x-www-form-urlencoded" }
  );
  _storeTokens(data);
  return data.id_token;
}

/**
 * يُرجع رمز دخول صالحًا: المحفوظ إن بقي له أكثر من هامش الأمان، وإلا يجدّده.
 * @param {boolean} forceRefresh true يجدّد الرمز دائمًا
 * @returns {Promise<string>} رمز الدخول
 */
async function getValidIdToken(forceRefresh) {
  // جلسة غير مكتملة الكتابة تُعامل كغير موجودة، لا كجلسة صالحة جزئيًا.
  if (!_isSessionCommitted()) return await refreshIdToken();
  const token = _getKey(KEY_ID_TOKEN);
  const expiry = Number(_getKey(KEY_TOKEN_EXPIRY) || 0);
  if (!forceRefresh && token && expiry - Date.now() > EXPIRY_SAFETY_SECONDS * 1000) {
    return token;
  }
  return await refreshIdToken();
}

/**
 * يقرأ بيانات الحساب من Firebase Authentication.
 * @param {string} idToken رمز الدخول، ويُجلب الصالح إن غاب
 * @returns {Promise<Object>} بيانات الحساب، ويرمي إن لم يوجد
 */
async function lookupAccount(idToken) {
  _requireConfiguration();
  const token = idToken || await getValidIdToken(false);
  const data = await _request(
    `${AUTH_BASE_URL}/accounts:lookup?key=${encodeURIComponent(cfg.FIREBASE_API_KEY)}`,
    JSON.stringify({ idToken: token })
  );
  const user = (data.users && data.users.length) ? data.users[0] : null;
  if (!user) throw _authError("الحساب غير موجود.", "USER_NOT_FOUND", 404);
  return user;
}

/**
 * يطلب إرسال رسالة تأكيد البريد إلى صاحب الحساب.
 * @param {string} idToken رمز الدخول
 * @returns {Promise<Readonly<{email: string}>>} البريد الذي أُرسلت إليه، ويرمي عند الفشل
 */
async function sendEmailVerification(idToken) {
  _requireConfiguration();
  const token = idToken || await getValidIdToken(false);
  const data = await _request(
    `${AUTH_BASE_URL}/accounts:sendOobCode?key=${encodeURIComponent(cfg.FIREBASE_API_KEY)}`,
    JSON.stringify({ requestType: "VERIFY_EMAIL", idToken: token })
  );
  if (!data.email || !_isValidVerificationEmail(data.email)) {
    throw _authError(
      "لم يؤكد Firebase البريد المستهدف لرسالة التحقق.",
      "INVALID_VERIFICATION_RESPONSE",
      0
    );
  }
  return Object.freeze({ email: String(data.email).trim() });
}

function _isValidVerificationEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

/**
 * يطلب إرسال رسالة إعادة تعيين كلمة المرور.
 * @param {string} email البريد الإلكتروني
 * @returns {Promise<Object>} ردّ الخادم، ويرمي عند الفشل
 */
async function sendPasswordReset(email) {
  _requireConfiguration();
  return await _request(
    `${AUTH_BASE_URL}/accounts:sendOobCode?key=${encodeURIComponent(cfg.FIREBASE_API_KEY)}`,
    JSON.stringify({ requestType: "PASSWORD_RESET", email: email })
  );
}

/**
 * يبني عنوان طلب القاعدة الرئيسة مع رمز الدخول.
 * @param {string} path المسار من جذر القاعدة
 * @param {string} idToken رمز الدخول
 * @returns {string} العنوان الكامل
 */
function buildDatabaseUrl(path, idToken) {
  const base = String(cfg.FIREBASE_URL || "").replace(/\/$/, "");
  const normalized = String(path || "").replace(/^\/+/, "");
  const url = `${base}/${normalized}`;
  return url + (url.indexOf("?") === -1 ? "?" : "&") +
    "auth=" + encodeURIComponent(idToken);
}

async function _resolveDatabaseToken(forceRefresh) {
  try {
    return { ok: true, token: await getValidIdToken(Boolean(forceRefresh)) };
  } catch (error) {
    return {
      ok: false,
      result: { ok: false, status: error.status || 0, data: null, error: error.message },
    };
  }
}

/**
 * يبني طلب القاعدة من مدخلات الطلب ورمز الدخول.
 * @param {DatabaseRequestOptions} options مدخلات الطلب
 * @param {string} token رمز الدخول
 * @returns {Request}
 */
function _createDatabaseRequest(options, token) {
  const request = new Request(buildDatabaseUrl(options.path, token));
  request.method = options.method || "GET";
  request.timeoutInterval = options.timeoutSeconds || REQUEST_TIMEOUT_SECONDS;
  if (options.body !== undefined && options.body !== null) {
    request.headers = { "Content-Type": "application/json" };
    request.body = JSON.stringify(options.body);
  }
  return request;
}

async function _loadDatabaseResponse(request) {
  try {
    return { ok: true, text: await request.loadString() };
  } catch (error) {
    return {
      ok: false,
      result: { ok: false, status: 0, data: null, error: "تعذّر الاتصال بقاعدة البيانات." },
    };
  }
}

function _parseDatabaseData(text, status) {
  try {
    return { ok: true, data: text ? JSON.parse(text) : null };
  } catch (error) {
    return {
      ok: false,
      result: { ok: false, status: status, data: null, error: "استجابة قاعدة البيانات غير صالحة." },
    };
  }
}

function _databaseResult(status, data) {
  if (status < 200 || status >= 300) {
    return { ok: false, status: status, data: data, error: `HTTP ${status}` };
  }
  return { ok: true, status: status, data: data, error: "" };
}

/**
 * مدخلات طلب القاعدة الرئيسة.
 * @typedef {Object} DatabaseRequestOptions
 * @property {string} path المسار مع امتداد .json
 * @property {string} [method] فعل HTTP، وافتراضيًّا GET
 * @property {*} [body] جسم الطلب، أو null
 * @property {number} [timeoutSeconds] المهلة بالثواني، وافتراضيًّا ١٢
 * @property {boolean} [forceRefresh] true يجدّد الرمز قبل الطلب
 */

/**
 * يقرأ حالة الردّ: رفض 401 أو 403 يُعاد مرة واحدة برمز مجدَّد، وما سواه يُحلَّل ويُرجع.
 * @param {DatabaseRequestOptions} options مدخلات الطلب
 * @param {Request} request الطلب بعد إرساله
 * @param {string} text جسم الردّ
 * @returns {Promise<Object>} النتيجة
 */
async function _answerDatabase(options, request, text) {
  const status = _responseStatus(request);
  if ((status === 401 || status === 403) && !options.forceRefresh) {
    return await sendDatabaseRequest(Object.assign({}, options, { forceRefresh: true }));
  }
  const parsed = _parseDatabaseData(text, status);
  return parsed.ok ? _databaseResult(status, parsed.data) : parsed.result;
}

/**
 * يرسل طلبًا إلى القاعدة الرئيسة. وعند رفض 401 أو 403 يجدّد الرمز ويعيد الطلب مرة واحدة.
 * @param {DatabaseRequestOptions} options مدخلات الطلب
 * @returns {Promise<Object>} النتيجة وفيها ok و status و data و error، والفشل قيمة لا استثناء
 */
async function sendDatabaseRequest(options) {
  _requireConfiguration();
  const resolved = await _resolveDatabaseToken(options.forceRefresh);
  if (!resolved.ok) return resolved.result;

  const request = _createDatabaseRequest(options, resolved.token);
  const loaded = await _loadDatabaseResponse(request);
  if (!loaded.ok) return loaded.result;
  return await _answerDatabase(options, request, loaded.text);
}

/**
 * يحذف رموز الجلسة وهويتها من Keychain.
 */
function clearSession() {
  [KEY_SESSION_COMMIT, KEY_ID_TOKEN, KEY_REFRESH_TOKEN, KEY_TOKEN_EXPIRY, KEY_UID, KEY_EMAIL]
    .forEach(_removeKey);
}

module.exports = Object.freeze({
  signUp,
  signIn,
  refreshIdToken,
  getValidIdToken,
  getStoredIdentity,
  lookupAccount,
  sendEmailVerification,
  sendPasswordReset,
  buildDatabaseUrl,
  sendDatabaseRequest,
  clearSession,
});
