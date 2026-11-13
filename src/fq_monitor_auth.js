// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: key;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_auth.js

/**
 * جلسة الرصد: حساب الجهاز الخاص بقاعدة الرصد.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_auth_read_session.js
 *   fq_monitor_auth_write_session.js
 *   fq_monitor_auth_sign_in.js
 *   fq_monitor_auth_refresh.js
 *   fq_monitor_auth_get_session.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorBase = importModule("fq_monitor_base");

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_read_session.js
// ════════════════════════════════════════════════

const AUTH_KEYS = Object.freeze({
  idToken: "fq_monitor_v2_id_token",
  refreshToken: "fq_monitor_v2_refresh_token",
  expiresAt: "fq_monitor_v2_expires_at",
  uid: "fq_monitor_v2_uid",
});

const COMMIT_KEY = "fq_monitor_v2_session_commit";

/** @returns {Object|null} جلسة رصد محفوظة في Keychain أو null. */
function readMonitorAuthSession() {
  try {
    // جلسة بلا علامة اكتمال = كتابة جزئية، تُرفض ولا تُستعمل.
    if (!Keychain.contains(COMMIT_KEY) || Keychain.get(COMMIT_KEY) !== "1") return null;
    const names = Object.keys(AUTH_KEYS);
    for (let index = 0; index < names.length; index++) {
      if (!Keychain.contains(AUTH_KEYS[names[index]])) return null;
    }
    return {
      idToken: Keychain.get(AUTH_KEYS.idToken),
      refreshToken: Keychain.get(AUTH_KEYS.refreshToken),
      expiresAt: Number(Keychain.get(AUTH_KEYS.expiresAt)) || 0,
      uid: Keychain.get(AUTH_KEYS.uid),
    };
  } catch (error) {
    console.error(`[fq_monitor_auth_read_session] ${error.message}`);
    return null;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_write_session.js
// ════════════════════════════════════════════════

/**
 * يُنزل علَم اكتمال الجلسة، فلا تُقرأ جلسةٌ نصفُها مكتوب.
 * @returns {void}
 */
function _resetMonitorSessionCommit() {
  try { Keychain.set(COMMIT_KEY, "0"); }
  catch (error) { console.error(`[fq_monitor_auth_write_session] commit reset failed: ${error.message}`); }
}

/**
 * يكتب مفاتيح الجلسة الأربعة بترتيبها. لا يمسّ علامة الاكتمال: صاحبها المستدعي.
 * @param {Object} session - الجلسة: idToken و refreshToken و uid و expiresAt
 * @returns {void}
 */
function _storeSessionKeys(session) {
  Keychain.set(AUTH_KEYS.idToken, String(session.idToken));
  Keychain.set(AUTH_KEYS.refreshToken, String(session.refreshToken));
  Keychain.set(AUTH_KEYS.expiresAt, String(session.expiresAt || 0));
  Keychain.set(AUTH_KEYS.uid, String(session.uid));
}

/**
 * يحفظ جلسة رصد واحدة في Keychain.
 * (نُقلت هذه الوثيقة إلى صاحبها في ٢٠٢٦-٠٩-٢٥: كانت فوق دالةٍ أُدخِلت
 *  بينها وبين الدالة التي تصفها. تقرير التدقيق، الفئة أ.)
 * @param {Object} session - الجلسة: idToken و refreshToken و uid و expiresAt
 * @returns {boolean}
 */
function writeMonitorAuthSession(session) {
  if (!(session && session.idToken) || !session.refreshToken || !session.uid) return false;
  try {
    // العلامة تُنزل قبل المفاتيح وتُرفع بعدها، فلا تُقرأ جلسةٌ نصفُها مكتوب.
    Keychain.set(COMMIT_KEY, "0");
    _storeSessionKeys(session);
    Keychain.set(COMMIT_KEY, "1");
    return true;
  } catch (error) {
    console.error(`[fq_monitor_auth_write_session] ${error.message}`);
    _resetMonitorSessionCommit();
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_sign_in.js
// ════════════════════════════════════════════════

/**
 * يبني طلب إنشاء حساب مجهول في خدمة المصادقة.
 * @param {Object} settings إعدادات الرصد: apiKey و requestTimeoutSeconds
 * @returns {Request}
 */
function _createSignUpRequest(settings) {
  const request = new Request(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(settings.apiKey)}`
  );
  request.method = "POST";
  request.timeoutInterval = settings.requestTimeoutSeconds;
  request.headers = { "Content-Type": "application/json" };
  request.body = JSON.stringify({ returnSecureToken: true });
  return request;
}

/**
 * يحوّل ردّ إنشاء الحساب إلى جلسة، أو null إن لم يكن الردّ ناجحًا كاملًا.
 * @param {number} status حالة الاستجابة
 * @param {Object} data جسم الردّ بعد التحليل
 * @returns {Object|null}
 */
function _signUpSession(status, data) {
  if (status !== 200 || !data.idToken || !data.localId) return null;
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + (Number(data.expiresIn) * 1000),
    uid: data.localId,
  };
}

/** @returns {Promise<Object|null>} جلسة رصد مجهولة جديدة. */
async function signInMonitorAnonymously() {
  const request = _createSignUpRequest(monitorBase.getMonitorRemoteConfig());
  try {
    const text = await request.loadString();
    const status = _responseStatus(request);
    const data = text ? JSON.parse(text) : {};
    const session = _signUpSession(status, data);
    return session && writeMonitorAuthSession(session) ? session : null;
  } catch (error) {
    console.error(`[fq_monitor_auth_sign_in] ${error.message}`);
    return null;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_refresh.js
// ════════════════════════════════════════════════

/**
 * رموز نتيجة التجديد. الفشل نوعان لا نوع واحد، والخلط بينهما هو
 * ما جعل انقطاعًا عابرًا يُتلف هوية الرصد ويُسقط التيوب كلّه.
 */
const REFRESH_OUTCOME = Object.freeze({
  OK: "OK",
  REJECTED: "REJECTED",
  TRANSIENT: "TRANSIENT",
});

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;

/**
 * يصنّف ردّ الخادم: رفض صريح للرمز، أم تعذّر عابر.
 * التصنيف بفئة الحالة لا بنصّ الرسالة، لأن النصوص تتغيّر والحالة لا تتغيّر.
 * @param {number} status حالة الاستجابة
 * @returns {boolean} true إن كان رفضًا صريحًا لهذا الرمز بعينه
 */
function _isExplicitRejection(status) {
  return status === HTTP_BAD_REQUEST || status === HTTP_FORBIDDEN;
}

/**
 * يبني نتيجة فشل موحّدة.
 * @param {string} outcome أحد رموز REFRESH_OUTCOME
 * @param {number} status حالة الاستجابة أو صفر
 * @param {string} reason سبب مقروء للتسجيل
 * @returns {Object}
 */
function _failure(outcome, status, reason) {
  return { ok: false, session: null, outcome, status, reason };
}

function _createRefreshRequest(settings, refreshToken) {
  const request = new Request(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(settings.apiKey)}`
  );
  request.method = "POST";
  request.timeoutInterval = settings.requestTimeoutSeconds;
  request.headers = { "Content-Type": "application/x-www-form-urlencoded" };
  request.body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`;
  return request;
}

function _responseStatus(request) {
  return request.response ? request.response.statusCode : 0;
}

function _refreshOutcome(status) {
  return _isExplicitRejection(status)
    ? REFRESH_OUTCOME.REJECTED
    : REFRESH_OUTCOME.TRANSIENT;
}

function _nextMonitorSession(data, session) {
  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token || session.refreshToken,
    expiresAt: Date.now() + (Number(data.expires_in) * 1000),
    uid: data.user_id,
  };
}

function _validRefreshResponse(status, data) {
  return status === 200 && Boolean(data.id_token) && Boolean(data.user_id);
}

/**
 * ردّ لم يحمل جلسة صالحة: يُصنَّف رفضًا صريحًا أو تعذّرًا عابرًا، ويُسجَّل.
 * @param {number} status حالة الاستجابة
 * @returns {Object} نتيجة فشل
 */
function _rejectedRefresh(status) {
  const outcome = _refreshOutcome(status);
  console.error(`[fq_monitor_auth_refresh] ${outcome} status=${status}`);
  return _failure(outcome, status, `HTTP_${status}`);
}

/**
 * يحفظ الجلسة المجدَّدة. فشل الحفظ تعذّر عابر لا رفض، فلا تُستبدل الهويّة بسببه.
 * @param {Object} next الجلسة المجدَّدة
 * @param {number} status حالة الاستجابة
 * @returns {Object} نتيجة التجديد
 */
function _commitRefreshed(next, status) {
  if (!writeMonitorAuthSession(next)) {
    console.error("[fq_monitor_auth_refresh] تعذّر حفظ الجلسة المجدَّدة");
    return _failure(REFRESH_OUTCOME.TRANSIENT, status, "KEYCHAIN_WRITE_FAILED");
  }
  return { ok: true, session: next, outcome: REFRESH_OUTCOME.OK, status, reason: "" };
}

/**
 * يرسل طلب التجديد ويقرأ ردّه. يرمي عند انقطاع الشبكة أو ردّ غير صالح الصيغة،
 * والتقاط ذلك عند المستدعي.
 * @param {Request} request طلب التجديد
 * @param {Object} session الجلسة الحالية
 * @returns {Promise<Object>} نتيجة التجديد
 */
async function _loadRefreshed(request, session) {
  const text = await request.loadString();
  const status = _responseStatus(request);
  const data = text ? JSON.parse(text) : {};
  if (!_validRefreshResponse(status, data)) return _rejectedRefresh(status);
  return _commitRefreshed(_nextMonitorSession(data, session), status);
}

/** يجدد جلسة الرصد فقط، ولا يلمس جلسة النظام الأساسية. */
async function refreshMonitorAuthSession(session) {
  if (!(session && session.refreshToken)) {
    return _failure(REFRESH_OUTCOME.REJECTED, 0, "MISSING_REFRESH_TOKEN");
  }

  const request = _createRefreshRequest(monitorBase.getMonitorRemoteConfig(), session.refreshToken);
  try {
    // await هنا لازمة: بغيرها يفلت رفض الوعد من هذا الـ try (أثبته اختبار التكافؤ بكسر متعمَّد).
    return await _loadRefreshed(request, session);
  } catch (error) {
    console.error(`[fq_monitor_auth_refresh] ${error.message}`);
    return _failure(REFRESH_OUTCOME.TRANSIENT, 0, error.message || "MONITOR_NETWORK_ERROR");
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_get_session.js
// ════════════════════════════════════════════════

/**
 * يعيد جلسة رصد صالحة، بمعزل كامل عن مصادقة النظام.
 *
 * القاعدة الحاكمة: هويّة الرصد لا تُستبدل إلا برفض صريح من الخادم لهذا
 * الرمز بعينه. الفشل العابر يُعاد ولا يُنشئ هويّة جديدة، لأن الهويّة
 * الجديدة تحتاج اعتماد مطوّر أو مشرف لا يستطيع النظام منحه لنفسه — فيقفل النظام
 * على نفسه ويصير التيوب أعمى.
 *
 * @param {boolean} forceRefresh فرض التجديد ولو كان الرمز ساريًا
 * @returns {Promise<Object|null>} جلسة صالحة أو null عند تعذّر عابر
 */
async function getMonitorAuthSession(forceRefresh) {
  const settings = monitorBase.getMonitorRemoteConfig();
  const session = readMonitorAuthSession();
  const stillValid = Boolean(session && session.idToken && session.expiresAt > Date.now() + settings.tokenRefreshMarginMs);
  if (stillValid && !forceRefresh) return session;

  if (session && session.refreshToken) {
    const kept = await _refreshOrKeep(session, stillValid);
    if (kept.done) return kept.session;
  }

  return await signInMonitorAnonymously();
}

/**
 * يجدّد الجلسة ويقرّر: انتهى الأمر بجلسة (أو بلا جلسة عند تعذّر عابر)،
 * أم رُفض الرمز صراحةً فيلزم إنشاء هويّة جديدة.
 * @param {Object} session الجلسة المحفوظة
 * @param {boolean} stillValid أما زال رمزها ساريًا
 * @returns {Promise<{done: boolean, session: Object|null}>} done=false يعني: أنشئ هويّة جديدة
 */
async function _refreshOrKeep(session, stillValid) {
  const result = await refreshMonitorAuthSession(session);
  if (result.ok) return { done: true, session: result.session };
  if (result.outcome !== REFRESH_OUTCOME.REJECTED) {
    console.error(`[fq_monitor_auth_get_session] تعذّر عابر، الهويّة محفوظة: ${result.reason}`);
    return { done: true, session: stillValid ? session : null };
  }
  console.error(`[fq_monitor_auth_get_session] رفض صريح للرمز، تُنشأ هويّة جديدة: ${result.reason}`);
  return { done: false, session: null };
}

module.exports = Object.freeze({
  readMonitorAuthSession,
  writeMonitorAuthSession,
  signInMonitorAnonymously,
  refreshMonitorAuthSession,
  REFRESH_OUTCOME,
  getMonitorAuthSession,
});
