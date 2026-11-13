// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_auth.js

/**
 * @module fq_auth
 * @description بوابة الدخول الآمنة: Firebase Authentication ثم ملف الموظف وربط الجهاز.
 * كلمة المرور لا تُقرأ ولا تُخزّن في قاعدة Realtime Database أو ملفات الجهاز.
 */

const cfg = importModule("fq_config");
const firebaseAuth = importModule("fq_firebase_auth");
const monitorCheckpoint = importModule("fq_monitor_journey");

const AUTH_FILE = "fq_auth_local.json";
const DEVICE_FILE = "fq_device_id.json";
const PENDING_PROFILE_KEY = "fq_auth_pending_profile";
const MAX_LOGIN_ATTEMPTS = 3;
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
const VERIFICATION_SENT_KEY_PREFIX = "fq_auth_verification_sent_";
const SAFE_ID_REGEX = /[.#$[\]/]/g;
const HASH_SEED = 5381;

// UID صادر من Firebase Authentication لحساب المطوّر الموثّق.
const SOLE_DEVELOPER_UID = "CZSx9pKMvscPxXIhbPAqf9IZsl12";
const SOLE_DEVELOPER_EMP_ID = "DEV001";

const ROLE_RANK = Object.freeze({ employee: 1, admin: 2, developer: 3 });
const RANK_TO_ROLE = Object.freeze({ 1: "employee", 2: "admin", 3: "developer" });

const FROZEN_ERROR = "الحساب مجمّد — تواصل مع الإدارة.";
const UNVERIFIED_NOTICE = "البريد غير موثّق. افتح رسالة التحقق السابقة أو أعد إرسال الرابط.";

const PHASE = Object.freeze({ AUTH: "authentication", LINK: "profile_link", REGISTER: "registration", RESET: "password_reset" });

// مراحل رحلة الدخول كما تُسجَّل في دفتر الرصد: رقمها ومرحلتها ووصفها ومسارها.
// ما يتغيّر مساره بالحساب بلا مسار هنا، ويُكمَّل عند التسجيل بـ _stageAt.
const STAGE = Object.freeze({
  DEVICE_ID: { stageId: "main_device_identifier", phase: PHASE.AUTH, label: "تهيئة معرّف الجهاز", path: "fq_device_id.json" },
  SESSION_REFRESH: { stageId: "main_session_refresh", phase: PHASE.AUTH, label: "تجديد جلسة النظام", path: "Firebase Auth securetoken" },
  ACCOUNT_LOOKUP: { stageId: "main_account_lookup", phase: PHASE.AUTH, label: "قراءة حساب Firebase", path: "Firebase Auth accounts:lookup" },
  EMAIL_VERIFIED: { stageId: "main_email_verified", phase: PHASE.AUTH, label: "التحقق من توثيق البريد", path: "Firebase Auth emailVerified" },
  INTERACTIVE_LOGIN: { stageId: "main_interactive_login", phase: PHASE.AUTH, label: "اختيار مسار الدخول", path: "واجهة الدخول" },
  CREDENTIALS: { stageId: "main_credentials_validation", phase: PHASE.AUTH, label: "التحقق من مدخلات الدخول", path: "واجهة الدخول" },
  PASSWORD_SIGN_IN: { stageId: "main_password_sign_in", phase: PHASE.AUTH, label: "تسجيل الدخول بكلمة المرور", path: "Firebase Auth (main project)" },
  VERIFICATION_SEND: { stageId: "main_verification_email_send", phase: PHASE.AUTH, label: "إرسال رابط توثيق البريد", path: "Firebase Auth sendOobCode" },
  VERIFICATION_REFRESH: { stageId: "main_verification_refresh", phase: PHASE.AUTH, label: "تحديث حالة توثيق البريد", path: "Firebase Auth securetoken → accounts:lookup" },
  CONTEXT_READY: { stageId: "main_employee_context_ready", phase: PHASE.AUTH, label: "تهيئة سياق الموظف", path: "fq_config.currentUser" },
  AUTH_PROFILE_READ: { stageId: "main_auth_profile_read", phase: PHASE.AUTH, label: "قراءة سجل هوية النظام" },
  AUTH_PROFILE_EXISTS: { stageId: "main_auth_profile_exists", phase: PHASE.AUTH, label: "وجود سجل هوية النظام" },
  AUTH_ACCOUNT_POLICY: { stageId: "main_auth_account_policy", phase: PHASE.AUTH, label: "سياسة حساب النظام" },
  EMPLOYEE_ID_LINK: { stageId: "main_employee_id_link", phase: PHASE.AUTH, label: "وجود رقم الموظف في الهوية" },
  EMPLOYEE_PROFILE_READ: { stageId: "main_employee_profile_read", phase: PHASE.AUTH, label: "قراءة ملف الموظف" },
  EMPLOYEE_PROFILE_EXISTS: { stageId: "main_employee_profile_exists", phase: PHASE.AUTH, label: "وجود ملف الموظف" },
  EMPLOYEE_ACCOUNT_POLICY: { stageId: "main_employee_account_policy", phase: PHASE.AUTH, label: "سياسة حساب الموظف" },
  DEVICE_BIND: { stageId: "main_device_binding_write", phase: PHASE.AUTH, label: "ربط جهاز الموظف في النظام" },
  INDEX_READ: { stageId: "main_employee_index_read", phase: PHASE.LINK, label: "فحص فهرس رقم الموظف" },
  INDEX_AVAILABLE: { stageId: "main_employee_index_available", phase: PHASE.LINK, label: "صلاحية رقم الموظف للحساب" },
  EXISTING_EMPLOYEE_READ: { stageId: "main_existing_employee_read", phase: PHASE.LINK, label: "فحص ملف الموظف الحالي" },
  EXISTING_AUTH_READ: { stageId: "main_existing_auth_read", phase: PHASE.LINK, label: "فحص سجل الهوية الحالي" },
  AUTH_PROFILE_WRITE: { stageId: "main_auth_profile_write", phase: PHASE.LINK, label: "إنشاء سجل هوية النظام" },
  INDEX_WRITE: { stageId: "main_employee_index_write", phase: PHASE.LINK, label: "حجز رقم الموظف" },
  EMPLOYEE_PROFILE_WRITE: { stageId: "main_employee_profile_write", phase: PHASE.LINK, label: "حفظ ملف الموظف" },
  LINK_DEVICE_BIND: { stageId: "main_device_binding_write", phase: PHASE.LINK, label: "ربط جهاز الموظف في النظام" },
  ACCOUNT_CREATE: { stageId: "main_account_create", phase: PHASE.REGISTER, label: "إنشاء حساب Firebase", path: "Firebase Auth accounts:signUp" },
  REGISTRATION_INPUT: { stageId: "main_registration_input", phase: PHASE.REGISTER, label: "بيانات إنشاء الحساب", path: "واجهة إنشاء الحساب" },
  PASSWORD_RESET: { stageId: "main_password_reset", phase: PHASE.RESET, label: "طلب استعادة كلمة المرور", path: "Firebase Auth sendOobCode" },
});

// فحصا السجلّ المقروء: مرحلة وجوده ورمز غيابه، ومرحلة تجميده ورمزه.
const RECORD_CHECKS = Object.freeze({
  auth: { exists: STAGE.AUTH_PROFILE_EXISTS, missingCode: "AUTH_PROFILE_MISSING", policy: STAGE.AUTH_ACCOUNT_POLICY, frozenCode: "AUTH_ACCOUNT_FROZEN" },
  employee: { exists: STAGE.EMPLOYEE_PROFILE_EXISTS, missingCode: "EMPLOYEE_PROFILE_MISSING", policy: STAGE.EMPLOYEE_ACCOUNT_POLICY, frozenCode: "EMPLOYEE_ACCOUNT_FROZEN" },
});

function _path(name) {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), name);
}

function _safeId(value) {
  return String(value || "").trim().replace(SAFE_ID_REGEX, "-");
}

function _isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function _resolveRole(authRole, userRole, uid) {
  const authRank = ROLE_RANK[String(authRole || "").toLowerCase()] || ROLE_RANK.employee;
  const userRank = userRole
    ? (ROLE_RANK[String(userRole).toLowerCase()] || ROLE_RANK.employee)
    : authRank;
  let rank = Math.min(authRank, userRank);
  if (rank === ROLE_RANK.developer && uid !== SOLE_DEVELOPER_UID) rank = ROLE_RANK.admin;
  if (uid === SOLE_DEVELOPER_UID) rank = ROLE_RANK.developer;
  return RANK_TO_ROLE[rank];
}

function _savePendingProfile(profile) {
  try {
    Keychain.set(PENDING_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error(`[fq_auth] pending profile write: ${error.message}`);
    return false;
  }
}

function _loadPendingProfile(email) {
  try {
    if (!Keychain.contains(PENDING_PROFILE_KEY)) return null;
    const profile = JSON.parse(Keychain.get(PENDING_PROFILE_KEY));
    if (!profile || String(profile.email).toLowerCase() !== String(email).toLowerCase()) return null;
    return profile;
  } catch (error) {
    console.error(`[fq_auth] pending profile: ${error.message}`);
    return null;
  }
}

function _clearPendingProfile() {
  try { if (Keychain.contains(PENDING_PROFILE_KEY)) Keychain.remove(PENDING_PROFILE_KEY); }
  catch (error) { console.error(`[fq_auth] pending profile remove: ${error.message}`); }
}

function _verificationSentKey(uid) {
  return VERIFICATION_SENT_KEY_PREFIX + _safeId(uid);
}

function _verificationWaitSeconds(uid) {
  try {
    const key = _verificationSentKey(uid);
    if (!Keychain.contains(key)) return 0;
    const sentAt = Number(Keychain.get(key) || 0);
    const remaining = VERIFICATION_RESEND_COOLDOWN_MS - (Date.now() - sentAt);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  } catch (error) {
    console.error(`[fq_auth] verification cooldown read: ${error.message}`);
    return 0;
  }
}

function _markVerificationSent(uid) {
  try { Keychain.set(_verificationSentKey(uid), String(Date.now())); }
  catch (error) { console.error(`[fq_auth] verification cooldown write: ${error.message}`); }
}

function _clearVerificationSent(uid) {
  try {
    const key = _verificationSentKey(uid);
    if (Keychain.contains(key)) Keychain.remove(key);
  } catch (error) {
    console.error(`[fq_auth] verification cooldown remove: ${error.message}`);
  }
}

/**
 * يُرجع معرّف هذا الجهاز من ملفه المحلي، أو ينشئه ويحفظه إن غاب أو تعذّرت قراءته.
 * @returns {string} معرّف الجهاز
 */
function getOrCreateDeviceUuid() {
  const fm = FileManager.local();
  const path = _path(DEVICE_FILE);
  if (fm.fileExists(path)) {
    try {
      const data = JSON.parse(fm.readString(path));
      if (data && data.uuid) return data.uuid;
    } catch (error) { console.warn("[fq_auth] UUID parse failed; regenerating."); }
  }
  const uuid = UUID.string();
  fm.writeString(path, JSON.stringify({ uuid: uuid, createdAt: new Date().toISOString() }));
  return uuid;
}

/**
 * يقرأ ملف التعريف المحلي للمستخدم. لا يحمل رموز الدخول، فهي في Keychain وحده.
 * @returns {Object|null} بيانات التعريف، و null إن غاب الملف أو تعذّر تحليله
 */
function loadLocalAuth() {
  const fm = FileManager.local();
  const path = _path(AUTH_FILE);
  if (!fm.fileExists(path)) return null;
  try { return JSON.parse(fm.readString(path)); }
  catch (error) {
    console.error(`[fq_auth] local profile: ${error.message}`);
    return null;
  }
}

/**
 * يحفظ بيانات التعريف المرئية للمستخدم في ملفه المحلي، ولا يحفظ أي رمز دخول.
 * @param {Object} data بيانات المستخدم، ويُحفظ منها المعرّف والبريد والرقم والاسم والدور ومعرّف الجهاز فقط
 */
function saveLocalAuth(data) {
  // هذا الملف للتعريف المرئي فقط؛ رموز Firebase تبقى حصريًا داخل Keychain.
  const safe = {
    uid: data.uid || "",
    email: data.email || "",
    empId: data.empId || "",
    name: data.name || "—",
    role: data.role || "employee",
    uuid: data.uuid || "",
    savedAt: new Date().toISOString(),
  };
  FileManager.local().writeString(_path(AUTH_FILE), JSON.stringify(safe));
}

/**
 * يحذف ملف التعريف المحلي للمستخدم إن وُجد.
 */
function clearLocalAuth() {
  const fm = FileManager.local();
  const path = _path(AUTH_FILE);
  if (fm.fileExists(path)) fm.remove(path);
}

async function _read(path) {
  return await firebaseAuth.sendDatabaseRequest({ path, method: "GET", body: null, timeoutSeconds: 12, forceRefresh: false });
}

async function _write(path, method, body) {
  return await firebaseAuth.sendDatabaseRequest({ path, method, body, timeoutSeconds: 12, forceRefresh: false });
}

/**
 * يربط هذا الجهاز بحساب المستخدم المسجَّل في القاعدة.
 * @param {string} empId الرقم الوظيفي
 * @param {string} uuid معرّف الجهاز
 * @returns {Promise<boolean>} نجاح الكتابة، و false إن غابت الهوية أو المعرّف
 */
async function bindDevice(empId, uuid) {
  const identity = firebaseAuth.getStoredIdentity();
  if (!identity.uid || !uuid) return false;
  const result = await _write(`device_bindings/${identity.uid}/${uuid}.json`, "PUT", {
    uuid: uuid,
    empId: empId || "",
    boundAt: new Date().toISOString(),
    active: true,
  });
  return result.ok;
}

/**
 * يتحقّق أن هذا الجهاز مربوط بحساب المستخدم وأن ربطه فعّال.
 * @param {string} _empId غير مستعمل، باقٍ لتوافق التوقيع
 * @param {string} uuid معرّف الجهاز
 * @returns {Promise<boolean>} true إن وُجد الربط ولم يُعطَّل
 */
async function verifyDevice(_empId, uuid) {
  const identity = firebaseAuth.getStoredIdentity();
  if (!identity.uid || !uuid) return false;
  const result = await _read(`device_bindings/${identity.uid}/${uuid}.json`);
  return Boolean(result.ok && result.data && result.data.active !== false);
}

/**
 * يقرأ سجلّ المستخدم من القاعدة برقمه الوظيفي.
 * @param {string} empId الرقم الوظيفي
 * @returns {Promise<Object|null>} السجلّ، و null عند الفشل أو غياب الرقم
 */
async function loadUserData(empId) {
  const safeId = _safeId(empId);
  if (!safeId) return null;
  const result = await _read(`users/${safeId}.json`);
  return result.ok ? result.data : null;
}

/**
 * جلسة الدخول كما تمرّ بين مراحل التحميل والإكمال.
 * @typedef {{uid: string, email: string, uuid: string, idToken: string}} AccountSession
 */

/** نسخة من مرحلة بمسارها، لما يتغيّر مساره بالحساب. */
function _stageAt(stage, path) {
  return Object.assign({}, stage, { path: path });
}

/**
 * يسجّل نقطة تفتيش للمرحلة بحالتها، وتفاصيلها (الرمز والرسالة) إن وُجدت.
 * المسجِّل لا يرمي، فلا يغيّر تسجيله مسار الدخول.
 */
function _checkpoint(stage, status, details) {
  monitorCheckpoint.recordMonitorAuthCheckpoint(Object.assign({
    stageId: stage.stageId, phase: stage.phase, label: stage.label, path: stage.path, status: status,
  }, details));
}

/** نقطة تفتيش بنتيجة: نجاح برمز فارغ، أو فشل برمزه. */
function _checkpointOutcome(stage, passed, failedCode) {
  _checkpoint(stage, passed ? "passed" : "failed", { code: passed ? "" : failedCode });
}

/** يسجّل المرحلة معلّقة، ثم ينفّذ طلب القاعدة ويسجّل نتيجته بحقل ok. */
async function _trackedRequest(stage, request, failedCode) {
  _checkpoint(stage, "pending");
  const result = await request();
  _checkpointOutcome(stage, result.ok, failedCode);
  return result;
}

/** يسجّل المرحلة معلّقة، ثم ينفّذ نداء خدمة المصادقة: ينجح بقيمته، أو يسجّل الخطأ ويعيد رميه. */
async function _trackedCall(stage, call, fallbackCode) {
  _checkpoint(stage, "pending");
  try {
    const value = await call();
    _checkpoint(stage, "passed");
    return value;
  } catch (error) {
    _checkpoint(stage, "failed", { code: error.code || fallbackCode, message: error.message });
    throw error;
  }
}

/** يفحص سجلًّا مقروءًا: موجود وغير مجمّد. يعيد نتيجة الرفض، أو null إن صلح. */
function _rejectRecord(record, checks, path) {
  _checkpointOutcome(_stageAt(checks.exists, path), Boolean(record), checks.missingCode);
  if (!record) return { ok: false, missingProfile: true };
  _checkpointOutcome(_stageAt(checks.policy, path), record.frozen !== true, checks.frozenCode);
  if (record.frozen === true) return { ok: false, error: FROZEN_ERROR };
  return null;
}

/**
 * نتيجة قراءة سجلّ: السجلّ عند الصلاح، أو سبب الرفض، أو غيابه.
 * @typedef {{ok: boolean, record?: Object, empId?: string, error?: string, missingProfile?: boolean}} RecordLoad
 */

/** @returns {Promise<RecordLoad>} سجلّ الهوية ورقم الموظف المنقّى */
async function _loadAuthRecord(uid) {
  const path = `/auth/${_safeId(uid)}`;
  const result = await _trackedRequest(_stageAt(STAGE.AUTH_PROFILE_READ, path), () => _read(`auth/${uid}.json`), "AUTH_PROFILE_READ_FAILED");
  if (!result.ok) return { ok: false, error: "تعذّر قراءة ملف الدخول." };
  const rejected = _rejectRecord(result.data, RECORD_CHECKS.auth, path);
  if (rejected) return rejected;
  const empId = _safeId(result.data.empId);
  _checkpointOutcome(_stageAt(STAGE.EMPLOYEE_ID_LINK, `${path}/empId`), Boolean(empId), "EMPLOYEE_ID_MISSING");
  if (!empId) return { ok: false, error: "ملف الموظف غير مكتمل." };
  return { ok: true, record: result.data, empId: empId };
}

/** @returns {Promise<RecordLoad>} ملف الموظف */
async function _loadEmployeeRecord(empId) {
  const path = `/users/${empId}`;
  const result = await _trackedRequest(_stageAt(STAGE.EMPLOYEE_PROFILE_READ, path), () => _read(`users/${empId}.json`), "EMPLOYEE_PROFILE_READ_FAILED");
  if (!result.ok) return { ok: false, error: "تعذّر قراءة بيانات الموظف." };
  return _rejectRecord(result.data, RECORD_CHECKS.employee, path) || { ok: true, record: result.data };
}

/** مسار ربط الجهاز كما يُعرض في دفتر الرصد. */
function _deviceBindingPath(session) {
  return `/device_bindings/${_safeId(session.uid)}/${_safeId(session.uuid)}`;
}

async function _bindAccountDevice(session, empId) {
  const stage = _stageAt(STAGE.DEVICE_BIND, _deviceBindingPath(session));
  _checkpoint(stage, "pending");
  const bound = await bindDevice(empId, session.uuid);
  _checkpointOutcome(stage, bound, "MAIN_DEVICE_BIND_FAILED");
  return bound;
}

/**
 * يثبّت المستخدم الحالي من سجلّيه. الدور من _resolveRole وحدها.
 * @param {AccountSession} session الجلسة
 * @param {{authRecord: Object, userRecord: Object, empId: string}} profile السجلّان ورقم الموظف
 */
function _activateAccountSession(session, profile) {
  const identity = firebaseAuth.getStoredIdentity();
  const user = {
    uid: session.uid,
    email: identity.email || profile.authRecord.email || "",
    empId: profile.empId,
    name: profile.userRecord.name || profile.authRecord.name || profile.empId,
    role: _resolveRole(profile.authRecord.role, profile.userRecord.role, session.uid),
    uuid: session.uuid,
    token: session.idToken,
  };
  saveLocalAuth(user);
  cfg.setCurrentUser(user);
  _checkpoint(STAGE.CONTEXT_READY, "passed", { message: "اكتمل ربط جلسة النظام بملف الموظف." });
  return { ok: true, user: cfg.getCurrentUser() };
}

/**
 * نتيجة تحميل الحساب: المستخدم عند النجاح، أو سبب الرفض، أو غياب الملف ليُكمَل.
 * @typedef {{ok: boolean, user?: Object, error?: string, missingProfile?: boolean}} ProfileResult
 */

/**
 * @param {AccountSession} session الجلسة
 * @returns {Promise<ProfileResult>}
 */
async function _loadAccountProfile(session) {
  const auth = await _loadAuthRecord(session.uid);
  if (!auth.ok) return auth;
  const employee = await _loadEmployeeRecord(auth.empId);
  if (!employee.ok) return employee;
  if (!(await _bindAccountDevice(session, auth.empId))) return { ok: false, error: "تعذّر ربط الجهاز بقاعدة البيانات." };
  return _activateAccountSession(session, { authRecord: auth.record, userRecord: employee.record, empId: auth.empId });
}

/** جلسة الإكمال من حساب Firebase، بجهاز هذا التشغيل ورمزه. */
function _accountSession(account, uuid, idToken) {
  return { uid: account.localId, email: account.email || "", uuid: uuid, idToken: idToken };
}

/** @param {AccountSession} session الجلسة */
async function _resolveCompletionProfile(session) {
  let profile = _loadPendingProfile(session.email);
  if (session.uid === SOLE_DEVELOPER_UID && !profile) {
    profile = { name: "المطوّر", empId: SOLE_DEVELOPER_EMP_ID, email: session.email };
  }
  if (!profile) profile = await _promptProfileCompletion(session.email);
  return profile;
}

async function _validateEmployeeIndex(uid, safeEmpId) {
  const path = `/employee_index/${safeEmpId}`;
  const result = await _trackedRequest(_stageAt(STAGE.INDEX_READ, path), () => _read(`employee_index/${safeEmpId}.json`), "EMPLOYEE_INDEX_READ_FAILED");
  if (!result.ok) return { ok: false, error: "تعذّر التحقق من رقم الموظف." };
  const available = !result.data || result.data === uid;
  _checkpointOutcome(_stageAt(STAGE.INDEX_AVAILABLE, path), available, "EMPLOYEE_ID_ALREADY_LINKED");
  if (!available) return { ok: false, error: "رقم الموظف مرتبط بحساب آخر." };
  return { ok: true };
}

async function _readExistingEmployee(safeEmpId) {
  const result = await _trackedRequest(_stageAt(STAGE.EXISTING_EMPLOYEE_READ, `/users/${safeEmpId}`), () => _read(`users/${safeEmpId}.json`), "EXISTING_EMPLOYEE_READ_FAILED");
  return result.ok && result.data ? result.data : {};
}

/**
 * سجلّات الإكمال الثلاثة: الهوية وملف الموظف (فوق القديم) وربط الجهاز.
 * @param {AccountSession} session الجلسة
 * @param {{empId: string, name: string}} employee رقم الموظف المنقّى واسمه
 * @param {Object} old ملف الموظف القائم، أو كائن فارغ
 */
function _buildCompletionRecords(session, employee, old) {
  const role = session.uid === SOLE_DEVELOPER_UID ? "developer" : "employee";
  const now = new Date().toISOString();
  return {
    authRecord: {
      uid: session.uid, email: session.email, empId: employee.empId, name: employee.name,
      role: role, frozen: false, createdAt: old.registeredAt || now,
    },
    userRecord: Object.assign({}, old, {
      uid: session.uid, email: session.email, empId: employee.empId, name: employee.name,
      role: role, frozen: false,
      location: Array.isArray(old.location) ? old.location : [],
      status: old.status || "حاضر",
      regCount: Number(old.regCount || 0),
      registeredAt: old.registeredAt || now,
    }),
    deviceRecord: { uuid: session.uuid, empId: employee.empId, boundAt: now, active: true },
  };
}

async function _ensureAuthRecord(uid, authRecord) {
  const path = `/auth/${_safeId(uid)}`;
  const current = await _trackedRequest(_stageAt(STAGE.EXISTING_AUTH_READ, path), () => _read(`auth/${uid}.json`), "EXISTING_AUTH_READ_FAILED");
  if (!current.ok) return { ok: false, error: "تعذّر قراءة سجل الهوية." };
  if (current.data) return { ok: true };
  const written = await _trackedRequest(_stageAt(STAGE.AUTH_PROFILE_WRITE, path), () => _write(`auth/${uid}.json`, "PUT", authRecord), "AUTH_PROFILE_WRITE_FAILED");
  return written.ok ? { ok: true } : { ok: false, error: "تعذّر حفظ سجل الهوية." };
}

/** يكتب حجز الرقم ثم ملف الموظف ثم ربط الجهاز، ويتوقّف عند أول فشل برسالته. */
async function _writeEmployeeLink(session, safeEmpId, records) {
  const writes = [
    { stage: _stageAt(STAGE.INDEX_WRITE, `/employee_index/${safeEmpId}`), path: `employee_index/${safeEmpId}.json`, body: session.uid, code: "EMPLOYEE_INDEX_WRITE_FAILED", error: "تعذّر حجز رقم الموظف." },
    { stage: _stageAt(STAGE.EMPLOYEE_PROFILE_WRITE, `/users/${safeEmpId}`), path: `users/${safeEmpId}.json`, body: records.userRecord, code: "EMPLOYEE_PROFILE_WRITE_FAILED", error: "تعذّر حفظ ملف الموظف." },
    { stage: _stageAt(STAGE.LINK_DEVICE_BIND, _deviceBindingPath(session)), path: `device_bindings/${session.uid}/${session.uuid}.json`, body: records.deviceRecord, code: "MAIN_DEVICE_BIND_FAILED", error: "تعذّر ربط الجهاز." },
  ];
  for (const step of writes) {
    const written = await _trackedRequest(step.stage, () => _write(step.path, "PUT", step.body), step.code);
    if (!written.ok) return { ok: false, error: step.error };
  }
  return { ok: true };
}

/** يتحقّق من فهرس الرقم، ثم يكتب سجلّات الموظف. */
async function _linkEmployee(session, employee) {
  const indexCheck = await _validateEmployeeIndex(session.uid, employee.empId);
  if (!indexCheck.ok) return indexCheck;
  const old = await _readExistingEmployee(employee.empId);
  const records = _buildCompletionRecords(session, employee, old);
  const authReady = await _ensureAuthRecord(session.uid, records.authRecord);
  if (!authReady.ok) return authReady;
  return await _writeEmployeeLink(session, employee.empId, records);
}

async function _removeLegacyAuthRecord(uid, safeEmpId) {
  if (safeEmpId === uid) return;
  const removed = await _write(`auth/${safeEmpId}.json`, "DELETE", null);
  if (!removed.ok) console.warn("[fq_auth] legacy auth record was not removed.");
}

/** @param {AccountSession} session الجلسة */
async function _completeProfile(session) {
  const profile = await _resolveCompletionProfile(session);
  if (!profile) return { ok: false, user: null, error: "لم يكتمل تسجيل ملف الموظف." };
  const safeEmpId = _safeId(profile.empId);
  if (!safeEmpId) return { ok: false, user: null, error: "رقم الموظف مطلوب." };
  const linked = await _linkEmployee(session, { empId: safeEmpId, name: profile.name });
  if (!linked.ok) return { ok: false, user: null, error: linked.error };
  await _removeLegacyAuthRecord(session.uid, safeEmpId);
  _clearPendingProfile();
  return await _loadAccountProfile(session);
}

/**
 * يسجّل الدخول بالبريد وكلمة المرور، ويسجّل نقطة تفتيش في دفتر رحلة الدخول.
 * @param {string} email البريد الإلكتروني
 * @param {string} password كلمة المرور
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>} النتيجة، والفشل قيمة لا استثناء
 */
async function verifyPassword(email, password) {
  if (!_isEmail(email)) return { ok: false, error: "أدخل بريدًا إلكترونيًا صحيحًا." };
  if (!password) return { ok: false, error: "كلمة المرور مطلوبة." };
  try {
    _checkpoint(STAGE.PASSWORD_SIGN_IN, "pending");
    const data = await firebaseAuth.signIn(email.trim(), password);
    _checkpoint(STAGE.PASSWORD_SIGN_IN, "passed");
    return { ok: true, data: data };
  } catch (error) {
    _checkpoint(STAGE.PASSWORD_SIGN_IN, "failed", { code: error.code || "SIGN_IN_FAILED", message: error.message || "تعذّر تسجيل الدخول." });
    return { ok: false, error: error.message || "تعذّر تسجيل الدخول." };
  }
}

/** نافذة بعنوانها، ورسالتها إن وُجدت. */
function _newAlert(title, message) {
  const alert = new Alert();
  alert.title = title;
  if (message !== undefined) alert.message = message;
  return alert;
}

/** يضيف أزرار النافذة بترتيبها، ثم زرّ الإلغاء. */
function _addActions(alert, titles, cancelTitle) {
  titles.forEach((title) => alert.addAction(title));
  alert.addCancelAction(cancelTitle);
}

async function _promptLogin(attempt) {
  const alert = _newAlert(`🔐 ${cfg.SYSTEM_NAME}`, attempt === 0
    ? "سجّل الدخول ببريدك وكلمة المرور، أو أنشئ حسابًا جديدًا."
    : "تعذّر الدخول — راجع البيانات أو استخدم استعادة كلمة المرور.");
  alert.addTextField("البريد الإلكتروني", "");
  alert.addSecureTextField("كلمة المرور", "");
  _addActions(alert, ["دخول", "إنشاء حساب جديد", "نسيت كلمة المرور"], "إلغاء");
  const action = await alert.present();
  if (action === -1) return { action: "cancel" };
  return {
    action: action === 0 ? "login" : action === 1 ? "register" : "reset",
    email: (alert.textFieldValue(0) || "").trim(),
    password: alert.textFieldValue(1) || "",
  };
}

async function _promptRegistration() {
  const alert = _newAlert("إنشاء حساب موظف", "اكتب بياناتك الحقيقية. سيُرسل Firebase رابط تحقق إلى بريدك.");
  alert.addTextField("الاسم", "");
  alert.addTextField("رقم الموظف", "");
  alert.addTextField("البريد الإلكتروني الحقيقي", "");
  alert.addSecureTextField("كلمة المرور", "");
  alert.addSecureTextField("تأكيد كلمة المرور", "");
  _addActions(alert, ["إنشاء الحساب"], "إلغاء");
  if ((await alert.present()) !== 0) return null;
  return {
    name: (alert.textFieldValue(0) || "").trim(),
    empId: (alert.textFieldValue(1) || "").trim(),
    email: (alert.textFieldValue(2) || "").trim(),
    password: alert.textFieldValue(3) || "",
    confirmPassword: alert.textFieldValue(4) || "",
  };
}

async function _promptProfileCompletion(email) {
  const alert = _newAlert("إكمال ملف الموظف", "الحساب موثّق. أكمل اسمك ورقمك الوظيفي مرة واحدة.");
  alert.addTextField("الاسم", "");
  alert.addTextField("رقم الموظف", "");
  _addActions(alert, ["حفظ والمتابعة"], "إلغاء");
  if ((await alert.present()) !== 0) return null;
  return {
    name: (alert.textFieldValue(0) || "").trim(),
    empId: (alert.textFieldValue(1) || "").trim(),
    email: email,
  };
}

async function _show(title, message) {
  const alert = _newAlert(title, message);
  alert.addAction("حسنًا");
  await alert.present();
}

async function _promptEmailVerification(email, notice) {
  const alert = _newAlert("توثيق البريد الإلكتروني", `${notice}\n\nالبريد: ${email}`);
  _addActions(alert, ["تحققت من البريد — متابعة", "إعادة إرسال الرابط"], "إغلاق");
  const action = await alert.present();
  if (action === 0) return "check";
  if (action === 1) return "resend";
  return "cancel";
}

async function _sendVerificationLink(uid, idToken) {
  const waitSeconds = _verificationWaitSeconds(uid);
  if (waitSeconds > 0) return { ok: false, message: `انتظر ${waitSeconds} ثانية قبل إعادة إرسال الرابط.` };
  try {
    const sent = await _trackedCall(STAGE.VERIFICATION_SEND, async () => {
      const token = idToken || await firebaseAuth.getValidIdToken(true);
      return await firebaseAuth.sendEmailVerification(token);
    }, "VERIFICATION_SEND_FAILED");
    _markVerificationSent(uid);
    return { ok: true, message: `وافق Firebase على إرسال رابط التحقق إلى ${sent.email}.` };
  } catch (error) {
    console.error(`[fq_auth] verification send ${error.code || "AUTH_ERROR"}: ${error.message}`);
    return { ok: false, message: `تعذّر إرسال رابط التحقق: ${error.message || "خطأ غير متوقع."}` };
  }
}

async function _completeVerifiedAccount(account, uuid, idToken) {
  const session = _accountSession(account, uuid, idToken);
  const loaded = await _loadAccountProfile(session);
  if (!loaded.missingProfile) return loaded;
  return await _completeProfile(session);
}

/** يجدّد الرمز ويقرأ الحساب، ليُرى أثر فتح رابط التوثيق. */
async function _lookupFreshAccount() {
  const idToken = await firebaseAuth.getValidIdToken(true);
  const account = await firebaseAuth.lookupAccount(idToken);
  return { idToken: idToken, account: account };
}

/** يكمل الحساب بعد توثيقه؛ والفشل نتيجةٌ موثّقة لا استثناء. */
async function _completeVerifiedSafely(account, uuid, idToken) {
  try {
    const result = await _completeVerifiedAccount(account, uuid, idToken);
    return { verified: true, result: result };
  } catch (error) {
    console.error(`[fq_auth] verified account completion: ${error.message}`);
    return {
      verified: true,
      result: { ok: false, user: null, error: "تم توثيق البريد، لكن تعذّر إكمال ملف الموظف." },
    };
  }
}

async function _refreshVerifiedAccount(uuid) {
  let fresh;
  try {
    fresh = await _trackedCall(STAGE.VERIFICATION_REFRESH, _lookupFreshAccount, "VERIFICATION_REFRESH_FAILED");
  } catch (error) {
    console.error(`[fq_auth] verification check: ${error.message}`);
    return { verified: false, message: `تعذّر فحص حالة البريد: ${error.message || "خطأ غير متوقع."}` };
  }
  if (fresh.account.emailVerified !== true) {
    return { verified: false, message: "لم يكتمل توثيق البريد بعد. افتح الرابط ثم أعد الفحص." };
  }
  _clearVerificationSent(fresh.account.localId);
  return await _completeVerifiedSafely(fresh.account, uuid, fresh.idToken);
}

async function _verificationGate(account, uuid, initialNotice) {
  let notice = initialNotice || "البريد غير موثّق. افتح رسالة التحقق أو أعد إرسال الرابط.";
  while (true) {
    const action = await _promptEmailVerification(account.email || "", notice);
    if (action === "cancel") return { ok: false, user: null, stop: true };
    if (action === "resend") {
      notice = (await _sendVerificationLink(account.localId, null)).message;
      continue;
    }
    const checked = await _refreshVerifiedAccount(uuid);
    if (checked.verified) return checked.result;
    notice = checked.message;
  }
}

function _registrationInputError(profile) {
  if (!profile.name || !_safeId(profile.empId) || !_isEmail(profile.email) || !profile.password) {
    return { code: "INVALID_REGISTRATION_FIELDS", title: "بيانات ناقصة", message: "أدخل الاسم ورقم الموظف والبريد وكلمة المرور بصورة صحيحة." };
  }
  if (profile.password !== profile.confirmPassword) {
    return { code: "PASSWORD_CONFIRMATION_MISMATCH", title: "كلمة المرور", message: "كلمتا المرور غير متطابقتين." };
  }
  return null;
}

/** يفحص نموذج التسجيل ويسجّل نتيجته؛ يعيد نتيجة التوقّف، أو null إن صلح النموذج. */
async function _rejectRegistrationInput(profile) {
  if (!profile) {
    _checkpoint(STAGE.REGISTRATION_INPUT, "skipped", { code: "USER_CANCELLED" });
    return { ok: false, user: null, stop: true };
  }
  const inputError = _registrationInputError(profile);
  if (inputError) {
    _checkpoint(STAGE.REGISTRATION_INPUT, "failed", { code: inputError.code });
    await _show(inputError.title, inputError.message);
    return { ok: false, user: null };
  }
  _checkpoint(STAGE.REGISTRATION_INPUT, "passed");
  return null;
}

async function _createRegistrationAccount(profile) {
  try {
    const created = await _trackedCall(STAGE.ACCOUNT_CREATE, () => firebaseAuth.signUp(profile.email, profile.password), "ACCOUNT_CREATE_FAILED");
    return { ok: true, created: created };
  } catch (error) {
    await _show("تعذّر إنشاء الحساب", error.message || "حدث خطأ غير متوقع.");
    return { ok: false };
  }
}

async function _finishRegistration(profile, uuid, created) {
  const pendingSaved = _savePendingProfile({ name: profile.name, empId: profile.empId, email: profile.email });
  if (!pendingSaved) await _show("تنبيه", "تم إنشاء الحساب، وستُطلب بيانات الموظف مجددًا بعد توثيق البريد.");
  const sent = await _sendVerificationLink(created.localId, created.idToken);
  const account = { localId: created.localId, email: created.email || profile.email };
  const result = await _verificationGate(account, uuid, sent.message);
  if (!result.ok && !result.stop && result.error) await _show("تعذّر إكمال الدخول", result.error);
  return result;
}

async function _registerInteractive(uuid) {
  const profile = await _promptRegistration();
  const rejected = await _rejectRegistrationInput(profile);
  if (rejected) return rejected;
  const account = await _createRegistrationAccount(profile);
  if (!account.ok) return { ok: false, user: null };
  return await _finishRegistration(profile, uuid, account.created);
}

/** بريد الاستعادة: المُدخَل إن صحّ، وإلا من نافذة. null عند الإلغاء. */
async function _askResetEmail(email) {
  if (_isEmail(email)) return email;
  const alert = _newAlert("استعادة كلمة المرور");
  alert.addTextField("البريد الإلكتروني", "");
  _addActions(alert, ["إرسال الرابط"], "إلغاء");
  if ((await alert.present()) !== 0) return null;
  return (alert.textFieldValue(0) || "").trim();
}

/** يطلب رابط الاستعادة. لا يكشف هل البريد مسجّل؛ يُظهر فشل الاتصال أو المفتاح وحدهما. */
async function _requestPasswordReset(target) {
  try {
    await _trackedCall(STAGE.PASSWORD_RESET, () => firebaseAuth.sendPasswordReset(target), "PASSWORD_RESET_FAILED");
  } catch (error) {
    if (error.code === "NETWORK_ERROR" || error.code === "MISSING_API_KEY") return { failed: true, message: error.message };
  }
  return { failed: false };
}

async function _resetPassword(email) {
  const target = await _askResetEmail(email);
  if (target === null) return;
  if (!_isEmail(target)) {
    await _show("البريد الإلكتروني", "أدخل بريدًا إلكترونيًا صحيحًا.");
    return;
  }
  const request = await _requestPasswordReset(target);
  if (request.failed) await _show("تعذّر الإرسال", request.message);
  else await _show("استعادة كلمة المرور", "إذا كان البريد مسجّلًا فستصله رسالة الاستعادة.");
}

/** بعد قبول كلمة المرور: يقرأ الحساب، ثم يطلب التوثيق أو يكمل الدخول. */
async function _continueLogin(idToken, uuid) {
  let account;
  try {
    account = await _trackedCall(STAGE.ACCOUNT_LOOKUP, () => firebaseAuth.lookupAccount(idToken), "ACCOUNT_LOOKUP_FAILED");
  } catch (error) {
    return { ok: false, user: null, error: error.message };
  }
  if (account.emailVerified !== true) {
    _checkpoint(STAGE.EMAIL_VERIFIED, "failed", { code: "EMAIL_NOT_VERIFIED", message: "البريد يحتاج إلى التوثيق قبل المتابعة." });
    return await _verificationGate(account, uuid, UNVERIFIED_NOTICE);
  }
  _checkpoint(STAGE.EMAIL_VERIFIED, "passed");
  return await _completeVerifiedAccount(account, uuid, idToken);
}

async function _completeLogin(credentials, uuid) {
  const credentialsValid = Boolean(credentials && _isEmail(credentials.email) && credentials.password);
  _checkpointOutcome(STAGE.CREDENTIALS, credentialsValid, "INVALID_CREDENTIAL_INPUT");
  const check = await verifyPassword(credentials.email, credentials.password);
  if (!check.ok) return { ok: false, user: null, error: check.error };
  return await _continueLogin(check.data.idToken, uuid);
}

/** فشل الاستعادة: «تخطٍّ» إن لم تكن جلسة محفوظة أصلًا، وإلا «فشل» برمزه. */
function _restoreFailureCheckpoint(stage, error) {
  _checkpoint(stage, error.code === "NO_REFRESH_TOKEN" ? "skipped" : "failed", {
    code: error.code || "SESSION_RESTORE_FAILED", message: error.message,
  });
}

async function _restoreVerifiedAccount(account, uuid, idToken) {
  if (account.emailVerified !== true) {
    _checkpoint(STAGE.EMAIL_VERIFIED, "failed", { code: "EMAIL_NOT_VERIFIED" });
    if (!config.runsInApp) return { ok: false, user: null };
    return await _verificationGate(account, uuid, UNVERIFIED_NOTICE);
  }
  _checkpoint(STAGE.EMAIL_VERIFIED, "passed");
  const session = _accountSession(account, uuid, idToken);
  const loaded = await _loadAccountProfile(session);
  if (loaded.ok) return loaded;
  if (loaded.missingProfile && _loadPendingProfile(session.email)) return await _completeProfile(session);
  return loaded;
}

/**
 * يجدّد الرمز المحفوظ ويقرأ الحساب. `progress.stage` المرحلة الجارية، ليُنسب الفشل إليها.
 * @param {{stage: Object}} progress
 */
async function _restoreAccount(progress) {
  _checkpoint(STAGE.SESSION_REFRESH, "pending");
  // لا تجديد بلا حاجة: الدالة نفسها (fq_firebase_auth.getValidIdToken)
  // تُرجع الرمز المخزَّن ما بقي له عمرٌ يتجاوز هامش الأمان، وتجدّده وحدها
  // عند قرب انتهائه. وفرضُ التجديد كان يكلّف شوطَ شبكة كاملًا في **كل**
  // تشغيل قبل أن يرى الموظف شيئًا.
  // والرمز المسحوب من الخادم (تغيير كلمة مرور، إيقاف حساب) ما زال
  // يُكشَف: lookupAccount في السطر التالي يردّ ٤٠١ فيسقط الاستعادة إلى
  // الدخول اليدوي — نفس النتيجة تمامًا، بطلب واحد لا بطلبين.
  const idToken = await firebaseAuth.getValidIdToken(false);
  _checkpoint(STAGE.SESSION_REFRESH, "passed");
  progress.stage = STAGE.ACCOUNT_LOOKUP;
  _checkpoint(STAGE.ACCOUNT_LOOKUP, "pending");
  const account = await firebaseAuth.lookupAccount(idToken);
  _checkpoint(STAGE.ACCOUNT_LOOKUP, "passed");
  return { account: account, idToken: idToken };
}

async function _restoreSession(uuid) {
  const progress = { stage: STAGE.SESSION_REFRESH };
  try {
    const restored = await _restoreAccount(progress);
    return await _restoreVerifiedAccount(restored.account, uuid, restored.idToken);
  } catch (error) {
    _restoreFailureCheckpoint(progress.stage, error);
    if (error.code !== "NO_REFRESH_TOKEN") console.warn(`[fq_auth] restore: ${error.message}`);
    return { ok: false, user: null };
  }
}

/** يكمل الدخول بالبيانات؛ عند الفشل يعرض سببه ويعيد null لمحاولة أخرى، إلا إن طلبت النتيجة التوقّف. */
async function _attemptCredentials(input, uuid) {
  const result = await _completeLogin(input, uuid);
  if (result.ok) return result;
  await _show("تعذّر الدخول", result.error || "سبب غير معروف.");
  return result.stop ? { ok: false, user: null } : null;
}

/** محاولة دخول واحدة: تعيد النتيجة النهائية، أو null لمحاولة أخرى. */
async function _loginAttempt(attempt, uuid) {
  const input = await _promptLogin(attempt);
  if (input.action === "cancel") {
    _checkpoint(STAGE.INTERACTIVE_LOGIN, "skipped", { code: "USER_CANCELLED" });
    return { ok: false, user: null, stop: true };
  }
  _checkpoint(STAGE.INTERACTIVE_LOGIN, "passed", { message: `المسار المختار: ${input.action}` });
  if (input.action === "register") return await _registerInteractive(uuid);
  if (input.action === "reset") {
    await _resetPassword(input.email);
    return null;
  }
  return await _attemptCredentials(input, uuid);
}

async function _loginInteractive(uuid) {
  for (let attempt = 0; attempt < MAX_LOGIN_ATTEMPTS; attempt++) {
    const outcome = await _loginAttempt(attempt, uuid);
    if (outcome) return outcome;
  }
  return { ok: false, user: null };
}

/**
 * بوابة الدخول: تستعيد الجلسة المحفوظة، وإن تعذّرت تطلب الدخول داخل التطبيق.
 * @returns {Promise<Object>} النتيجة وفيها ok، و user عند النجاح
 */
async function authGate() {
  _checkpoint(STAGE.DEVICE_ID, "pending");
  const uuid = getOrCreateDeviceUuid();
  _checkpointOutcome(STAGE.DEVICE_ID, Boolean(uuid), "DEVICE_ID_MISSING");
  const restored = await _restoreSession(uuid);
  if (restored.ok || restored.stop) return restored;
  if (!config.runsInApp) return { ok: false, user: null };
  return await _loginInteractive(uuid);
}

/**
 * يخرج المستخدم: يحذف ملف التعريف المحلي ورموز الدخول من Keychain.
 */
function logout() {
  clearLocalAuth();
  firebaseAuth.clearSession();
}

// واجهات قديمة للتوافق فقط؛ لم تعد مستخدمة في قرار المصادقة.
/**
 * بصمة نصّية قديمة للتوافق فقط، ولا تدخل في أي قرار مصادقة.
 * @param {string} str النص
 * @returns {string} البصمة
 */
function simpleHash(str) {
  let hash = HASH_SEED;
  for (let index = 0; index < str.length; index++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(index);
    hash &= 0xFFFFFFFF;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

/**
 * يولّد معرّفًا عشوائيًّا قديمًا للتوافق فقط، ولا يدخل في أي قرار مصادقة.
 * @returns {string} المعرّف
 */
function generateToken() {
  return `${Date.now().toString(36)}_${UUID.string().replace(/-/g, "").substring(0, 16)}`;
}

class AppCoordinator {
  static async boot() { /* وحدة خدمية؛ fq_main يستدعي البوابة. */ }
}
// boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
// لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
// و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
// ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
try { AppCoordinator.boot().catch((error) => console.error(error)); } catch (error) { console.error(error); }

module.exports = Object.freeze({
  authGate,
  getOrCreateDeviceUuid,
  verifyPassword,
  bindDevice,
  verifyDevice,
  loadUserData,
  loadLocalAuth,
  saveLocalAuth,
  clearLocalAuth,
  simpleHash,
  generateToken,
  logout,
  SOLE_DEVELOPER_UID,
});
