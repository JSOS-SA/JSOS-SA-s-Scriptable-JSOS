// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: route;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_monitor_journey.js

/**
 * دفتر رحلات الدخول.
 *
 * جُمعت هنا ملفات صغيرة كان كلٌّ منها دالة واحدة (قرار المالك ٢٠٢٦-٠٩-٣٠):
 *   fq_monitor_auth_journey_read.js
 *   fq_monitor_auth_journey_write.js
 *   fq_monitor_auth_journey_summary.js
 *   fq_monitor_auth_checkpoint.js
 *   fq_monitor_auth_journey_start.js
 *   fq_monitor_auth_journey_finish.js
 *   fq_monitor_auth_journey_publish.js
 * وأسماء الدوال المُصدَّرة كما كانت، فلم يتغيّر عند من يستدعيها إلا اسم الملف.
 */

const monitorBase = importModule("fq_monitor_base");
const monitorNet = importModule("fq_monitor_net");
const monitorAuth = importModule("fq_monitor_auth");

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_journey_read.js
// ════════════════════════════════════════════════

const JOURNEY_FILE = "fq_monitor_auth_journeys.json";

/** @returns {Object} سجل رحلات الدخول والربط المحلي. */
function readMonitorAuthJourneys() {
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), JOURNEY_FILE);
    if (!manager.fileExists(path)) return { activeJourneyId: "", journeys: [] };
    const parsed = JSON.parse(manager.readString(path));
    return parsed && Array.isArray(parsed.journeys) ? parsed : { activeJourneyId: "", journeys: [] };
  } catch (error) {
    console.error(`[fq_monitor_auth_journey_read] ${error.message}`);
    return { activeJourneyId: "", journeys: [] };
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_journey_write.js
// ════════════════════════════════════════════════

// ═══ عدّاد القياس — قرار المالك ٢٠٢٦-٠٩-٢٦ ═══
// «أضف القياس في الرصد». والعدّ هنا لا في المستدعين، لأن هذا **الموضع
// الوحيد** الذي يُكتب فيه الدفتر فعلًا، فالرقم مقيسٌ لا محسوب: كل زيادة
// فيه تقابل كتابةً حقيقية على القرص، فلا يمكن أن يُجمَّل.
// ويُحفظ داخل الرحلة نفسها، فيسافر معها إلى القاعدة ويظهر للمطوّر في
// تيوب الرصد بعد الرفع كما يظهر محليًّا.
function _countWrite(state) {
  const journey = state.journeys.find(
    (item) => item.journeyId === state.activeJourneyId
  );
  if (journey) journey.notebookWrites = Number(journey.notebookWrites || 0) + 1;
}

/**
 * يستبدل سجل رحلات الدخول والربط المحلي.
 * @param {Object} state
 * @returns {boolean}
 */
function writeMonitorAuthJourneys(state) {
  if (!state || !Array.isArray(state.journeys)) return false;
  try {
    _countWrite(state);
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), JOURNEY_FILE);
    manager.writeString(path, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error(`[fq_monitor_auth_journey_write] ${error.message}`);
    return false;
  }
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_journey_summary.js
// ════════════════════════════════════════════════

function _journeyValue(journey, key, fallback) {
  return journey[key] || fallback;
}

function _sortedJourneySteps(journey) {
  const steps = Object.keys(journey.steps || {}).map((key) => journey.steps[key]);
  steps.sort((a, b) => Number(a.startedAt || 0) - Number(b.startedAt || 0));
  return steps;
}

function _journeyProblem(steps) {
  const failed = steps.find((step) => step.status === "failed");
  if (failed) return { stage: failed.stageId, message: failed.message };
  const pending = steps.find((step) => step.status === "pending");
  if (pending) return { stage: pending.stageId, message: "الخطوة لم تكتمل بعد." };
  return { stage: "", message: "" };
}

function _summarizeJourney(journey) {
  const steps = _sortedJourneySteps(journey);
  const problem = _journeyProblem(steps);
  return {
    journeyId: journey.journeyId,
    empId: _journeyValue(journey, "empId", ""),
    startedAt: _journeyValue(journey, "startedAt", 0),
    authCompletedAt: _journeyValue(journey, "authCompletedAt", 0),
    linkStartedAt: _journeyValue(journey, "linkStartedAt", 0),
    linkCompletedAt: _journeyValue(journey, "linkCompletedAt", 0),
    completedAt: _journeyValue(journey, "completedAt", 0),
    // ═══ القياس المعروض في تيوب الرصد — قرار المالك ٢٠٢٦-٠٩-٢٦ ═══
    // رقمان لا غير: كم استغرق الدخول، وكم مرّة أُعيدت كتابة الدفتر فيه.
    // وبهما يرى المالك أثر التجميع بعينه بدل أن يصدّق قياسًا على الحاسوب.
    authDurationMs: Math.max(
      0, Number(journey.authCompletedAt || 0) - Number(journey.startedAt || 0)
    ),
    notebookWrites: Number(journey.notebookWrites || 0),
    journeyPhase: _journeyValue(journey, "journeyPhase", "unknown"),
    authStatus: _journeyValue(journey, "authStatus", "unknown"),
    linkStatus: _journeyValue(journey, "linkStatus", "not_started"),
    firstProblemStage: problem.stage,
    firstProblemMessage: problem.message,
    steps: steps,
  };
}

/** يلخص الرحلات ويحدد أول بوابة فاشلة في كل رحلة. */
function summarizeMonitorAuthJourneys(state) {
  const journeys = state && Array.isArray(state.journeys) ? state.journeys : [];
  return journeys.slice(-20).reverse().map(_summarizeJourney);
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_checkpoint.js
// ════════════════════════════════════════════════

function _findActiveJourney(state) {
  return state.journeys.find((item) => item.journeyId === state.activeJourneyId);
}

function _checkpointStatus(value) {
  const allowed = ["pending", "passed", "failed", "skipped"];
  return allowed.indexOf(value) >= 0 ? value : "pending";
}

function _checkpointText(details, key, fallback) {
  return details[key] || fallback;
}

/**
 * @param {Object} details نقطة التفتيش كما سُجّلت
 * @param {{stageId: string, current: Object, now: number, status: string}} point
 */
function _buildCheckpointStage(details, point) {
  const stageId = point.stageId;
  const current = point.current;
  const now = point.now;
  const status = point.status;
  const startedAt = current.startedAt || now;
  const isPending = status === "pending";
  return {
    stageId: stageId,
    phase: String(_checkpointText(details, "phase", "authentication")).substring(0, 40),
    label: monitorBase.redactMonitorText(_checkpointText(details, "label", stageId)).substring(0, 160),
    path: monitorBase.redactMonitorText(_checkpointText(details, "path", "")).substring(0, 240),
    status: status,
    startedAt: startedAt,
    completedAt: isPending ? 0 : now,
    durationMs: isPending ? 0 : Math.max(0, now - startedAt),
    attempts: Number(current.attempts || 0) + (isPending ? 1 : 0),
    code: monitorBase.redactMonitorText(_checkpointText(details, "code", "")).substring(0, 120),
    message: monitorBase.redactMonitorText(_checkpointText(details, "message", "")).substring(0, 500),
  };
}

function _firstFailedStage(steps) {
  const ids = Object.keys(steps);
  let first = "";
  for (let index = 0; index < ids.length; index++) {
    const step = steps[ids[index]];
    if (step.status !== "failed") continue;
    if (!first || step.startedAt < steps[first].startedAt) first = step.stageId;
  }
  return first;
}

function _enterLinkPhase(journey, point) {
  if (!journey.linkStartedAt) journey.linkStartedAt = point.now;
  journey.journeyPhase = "monitor_link";
  if (point.status === "pending") journey.linkStatus = "running";
}

function _completeLink(journey, point) {
  journey.linkStatus = point.status === "passed" ? "passed" : "failed";
  journey.linkCompletedAt = point.now;
  journey.completedAt = point.now;
  journey.journeyPhase = "completed";
}

/** @param {{stageId: string, now: number, status: string}} point */
function _updateLinkStatus(journey, details, point) {
  const linkPhase = details.phase === "monitor_link";
  if (linkPhase) _enterLinkPhase(journey, point);
  if (point.stageId === "monitor_employee_link_complete" && point.status !== "pending") {
    _completeLink(journey, point);
    return;
  }
  if (linkPhase && point.status === "failed") journey.linkStatus = "failed";
}

/** يطبّق نقطة تفتيش واحدة على رحلة محمَّلة، بزمن تسجيلها لا زمن كتابتها. */
function _applyCheckpoint(journey, details, now) {
  const stageId = monitorBase.makeMonitorSafeId(details.stageId);
  const current = journey.steps[stageId] || {};
  const status = _checkpointStatus(details.status);
  const point = { stageId, current, now, status };
  journey.steps[stageId] = _buildCheckpointStage(details, point);
  journey.firstFailedStage = _firstFailedStage(journey.steps);
  _updateLinkStatus(journey, details, point);
}

// ═══════════════════════════════════════════════════════════════
// التجميع قبل الكتابة — قرار المالك ٢٠٢٦-٠٩-٢٦ (الحل الأول)
// ═══════════════════════════════════════════════════════════════
// كانت كل نقطة تفتيش تقرأ دفتر الرحلات كاملًا وتكتبه كاملًا. وقِيس بتنفيذ
// هذه الوحدات نفسها: **٥٩ قراءة و٥٥ كتابة في الدخول الواحد**، مجموعها
// **٣٫٢ ميجابايت** من حركة القرص على دفتر حجمه **٣١ كيلوبايت** — اثنان
// وخمسون ضعفًا بلا فائدة. (وكان ٣٢٣ كيلوبايت قبل قرار المالك «خمسٌ لا
// عشرون» في ٢٠٢٦-٠٩-٢٥، فذاك القرار حمل عُشر المشكلة وهذا يحمل بقيّتها.)
//
// فتُحتجَز النقاط في الذاكرة وتُكتب دفعةً واحدة عند نقاط التفريغ.
//
// ═══ والفاشلة لا تُحتجَز ═══
// نقطة حالتها «فشل» تُكتب فورًا، لأن الدفتر إنما وُجد لتشخيص الدخول
// المتعثّر، والدخول المتعثّر لا يُرفع إلى القاعدة أصلًا (الرفع بعد نجاح
// الدخول، `fq_monitor_start_after_login`). فلو احتُجز الفشل وأُغلق
// التطبيق فجأة لضاع الدليل الوحيد. شرط المالك عند اختيار الحل.
//
// ═══ لماذا نحتجز «ما لم يُطبَّق» لا «نسخةً من الدفتر» ═══
// وثائق Scriptable لا تذكر شيئًا عن تخزين الوحدات مؤقّتًا عند
// `importModule` (<https://docs.scriptable.app/importmodule/>: تذكر ترتيب
// البحث والقيمة المُرجَعة، ولا تذكر التخزين المؤقّت ولا إعادة التقييم).
// فقد تكون لكلّ مستورِدٍ نسخةٌ من هذه الوحدة، وقد تكون نسخة واحدة — **لا
// أعلم، غير مذكور في الوثائق الرسمية**.
//
// ولذلك بُني التصميم كي **يصحّ في الحالتين**: المحتجَز قائمةُ تغييرات لم
// تُطبَّق بعد، لا نسخة من الدفتر. وعند التفريغ يُقرأ الدفتر طازجًا ثم
// تُطبَّق التغييرات عليه بالترتيب. فلو وُجدت عدّة نسخ من الوحدة، كتبت كلٌّ
// منها فوق أحدث حال لا فوق حالٍ قديمة، ولا يضيع شيء.
const PENDING = [];

/** يطبّق المحتجَز على الرحلة بترتيب تسجيله. */
function _applyBatch(journey, batch) {
  for (let index = 0; index < batch.length; index++) {
    _applyCheckpoint(journey, batch[index].details, batch[index].at);
  }
}

/**
 * يعيد دفعة لم تُكتب إلى أول المحتجَز بترتيبها، قبل ما احتُجز بعدها.
 * @param {Array} batch
 */
function _restoreBatch(batch) {
  Array.prototype.unshift.apply(PENDING, batch);
}

/**
 * يطبّق دفعة على الرحلة النشطة ويكتب الدفتر. لا رحلة ← تُسقط الدفعة، وفشل الكتابة ← تُعاد.
 * والرمي يصل إلى المستدعي فيعيدها هو.
 * @param {Array} batch
 * @returns {boolean}
 */
function _writeBatch(batch) {
  const state = readMonitorAuthJourneys();
  const journey = _findActiveJourney(state);
  if (!journey) {
    console.error(`[fq_monitor_auth_checkpoint] flush: لا رحلة نشطة، أُسقطت ${batch.length} نقطة`);
    return false;
  }
  _applyBatch(journey, batch);
  if (writeMonitorAuthJourneys(state)) return true;
  _restoreBatch(batch);
  return false;
}

/**
 * يكتب كل ما احتُجز في كتابة واحدة. يُستدعى قبل كل قراءة للدفتر.
 * فشل الكتابة (إرجاع false أو رمي) يُعيد الدفعة فتُكتب في التفريغ التالي. ولا رحلة نشطة
 * تُطبَّق عليها ← تُسقَط الدفعة ويُسجَّل ذلك.
 * @returns {boolean} صحيحٌ إن لم يبقَ محتجَز، أو نجحت الكتابة.
 */
function flushMonitorAuthCheckpoints() {
  if (!PENDING.length) return true;
  const batch = PENDING.splice(0, PENDING.length);
  try {
    return _writeBatch(batch);
  } catch (error) {
    console.error(`[fq_monitor_auth_checkpoint] flush ${error.message}`);
    _restoreBatch(batch);
    return false;
  }
}

/**
 * يسجل حالة بوابة واحدة بلا تغيير تدفق المصادقة.
 * @param {Object} details
 * @returns {boolean}
 */
function recordMonitorAuthCheckpoint(details) {
  if (!(details && details.stageId)) return false;
  PENDING.push({ details: details, at: Date.now() });
  if (_checkpointStatus(details.status) === "failed") {
    return flushMonitorAuthCheckpoints();
  }
  return true;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_journey_start.js
// ════════════════════════════════════════════════

/** @returns {string} معرّف رحلة الدخول الجديدة. */
function startMonitorAuthJourney() {
  // نقاط الرحلة السابقة المحتجَزة تُكتب قبل أن تُقرأ الحال، وإلا طُبِّقت
  // لاحقًا على الرحلة الجديدة أو ضاعت. فإن فشل تفريغها أُسقط ما بقي منها:
  // الدفعة لا تحمل معرّف رحلتها، فإبقاؤها ينسبها إلى الرحلة الجديدة (قرار المالك ٢٠٢٦-١٠-١١).
  if (!flushMonitorAuthCheckpoints() && PENDING.length) {
    console.error(`[fq_monitor_auth_checkpoint] أُسقطت ${PENDING.splice(0, PENDING.length).length} نقطة قديمة فشل حفظها`);
  }
  const state = readMonitorAuthJourneys();
  const journeyId = `journey_${Date.now().toString(36)}_${UUID.string().replace(/-/g, "").substring(0, 10)}`;
  state.activeJourneyId = journeyId;
  state.journeys.push({
    journeyId: journeyId,
    deviceId: monitorBase.getMonitorDeviceId(),
    systemVersion: monitorBase.getReleaseVersion().systemVersion,
    startedAt: Date.now(),
    authCompletedAt: 0,
    linkStartedAt: 0,
    linkCompletedAt: 0,
    completedAt: 0,
    journeyPhase: "authentication",
    authStatus: "running",
    linkStatus: "not_started",
    firstFailedStage: "",
    publishedAt: 0,
    steps: {},
  });
  // ═══ خمسٌ لا عشرون (قرار المالك ٢٠٢٦-٠٩-٢٥) ═══
  // كل نقطة تفتيش تقرأ هذا الملف كاملًا وتكتبه كاملًا، وفي `fq_auth` وحدها
  // ٥٨ نقطة. وقِيس أن ٥٨ دورة قراءة/كتابة على ملفٍ بحجم ٣٢٣ كيلوبايت تستغرق
  // ٤٧٨ مللي ثانية. فاختار المالك تصغير الملف بدل تجميع الكتابة.
  // وسطر `fq_monitor_auth_journey_summary.js:46` لا يحتاج تغييرًا:
  // slice(-20) على مصفوفة من خمسة يُرجع الخمسة.
  state.journeys = state.journeys.slice(-5);
  writeMonitorAuthJourneys(state);
  return journeyId;
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_journey_finish.js
// ════════════════════════════════════════════════

function _authJourneyStatus(result) {
  if (result && result.ok) return "passed";
  if (result && result.cancelled) return "cancelled";
  return "failed";
}

function _resultText(result, key, maxLength) {
  const value = (result && result[key]) ? result[key] : "";
  return String(value).substring(0, maxLength);
}

/** ينهي نتيجة المصادقة الأساسية دون إنهاء مراحل ربط الرصد اللاحقة. */
function finishMonitorAuthJourney(result) {
  // نقطة التفريغ الأولى: كل ما احتُجز في أثناء المصادقة يُكتب هنا.
  flushMonitorAuthCheckpoints();
  const state = readMonitorAuthJourneys();
  const journey = state.journeys.find((item) => item.journeyId === state.activeJourneyId);
  if (!journey) return false;
  _applyAuthResult(journey, result);
  return writeMonitorAuthJourneys(state);
}

/** يكتب نتيجة المصادقة في الرحلة: حالتها وزمنها والمرحلة التالية ورسالتها منقّاة. */
function _applyAuthResult(journey, result) {
  const now = Date.now();
  journey.authStatus = _authJourneyStatus(result);
  journey.authCompletedAt = now;
  journey.journeyPhase = journey.authStatus === "passed" ? "monitor_link_pending" : "completed";
  journey.completedAt = journey.authStatus === "passed" ? 0 : now;
  journey.empId = _resultText(result, "empId", 80);
  journey.authCode = monitorBase.redactMonitorText(_resultText(result, "code", 120));
  journey.authMessage = monitorBase.redactMonitorText(_resultText(result, "message", 500));
}

// ════════════════════════════════════════════════
// كان ملف fq_monitor_auth_journey_publish.js
// ════════════════════════════════════════════════

/**
 * ينشر الرحلات المحلية غير المنشورة بعد اعتماد ربط هوية الرصد.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
async function publishMonitorAuthJourneys(user) {
  if (!(user && user.empId)) return { ok: false, published: 0, error: "MISSING_MAIN_IDENTITY" };
  const session = await monitorAuth.getMonitorAuthSession(false);
  if (!session) return { ok: false, published: 0, error: "MONITOR_AUTH_UNAVAILABLE" };
  // نقطة التفريغ الثانية: مرحلة ربط الرصد تقع بعد ختام المصادقة،
  // فنقاطها تُكتب قبل أن تُرفع الرحلة إلى القاعدة.
  flushMonitorAuthCheckpoints();
  const state = readMonitorAuthJourneys();
  const tally = await _publishPending(state, { session, empId: monitorBase.makeMonitorSafeId(user.empId) });
  writeMonitorAuthJourneys(state);
  return { ok: tally.lastError === "", published: tally.published, error: tally.lastError };
}

/** رحلة لم تُنشر بعد وتخصّ هذا الموظف. */
function _isUnpublishedFor(journey, empId) {
  if (journey.publishedAt) return false;
  return monitorBase.makeMonitorSafeId(journey.empId) === empId;
}

/**
 * يرسل رحلة واحدة إلى قاعدة الرصد.
 * @param {Object} journey
 * @param {{session: Object, empId: string}} identity
 * @returns {Promise<Object>} نتيجة الطلب
 */
async function _publishJourney(journey, identity) {
  const empId = identity.empId;
  const dateBucket = new Date(journey.startedAt || Date.now()).toISOString().slice(0, 10);
  const path = `auth_journeys/${dateBucket}/${empId}/${monitorBase.makeMonitorSafeId(journey.deviceId)}/${monitorBase.makeMonitorSafeId(journey.journeyId)}`;
  const payload = Object.assign({}, journey, { empId: empId, monitorUid: identity.session.uid, publishedAt: { ".sv": "timestamp" } });
  // ═══ عدّاد القياس محلّي ولا يُرفع ═══
  // أُضيف `notebookWrites` في ٢٠٢٦-٠٩-٢٦، فرُفض النشر في أول تشغيل
  // بـ«رفض صلاحية» على مسار كان يقبل النشر **سبعة وعشرين يومًا متّصلة
  // من الجهاز نفسه، آخرها أمس**. والفرق الوحيد في الحمولة هذا الحقل،
  // فقواعد الأمان في لوحة Firebase تُحصي الحقول ولا تقبل زائدًا.
  //
  // ونصّ قواعد قاعدة الرصد صار في `docs/قواعد-الأمان-قاعدة-الرصد.md`
  // منذ ٢٠٢٦-٠٩-٢٩، وتغييرها بإذن المالك لا من هنا. ولمّا كان
  // العدّاد قياسًا لا بيانَ تشغيل، حُذف من الحمولة ولم تُمسّ القواعد.
  // فيبقى ظاهرًا في تيوب الرصد من الدفتر المحلي على الجهاز نفسه.
  //
  // **وأي حقل جديد يُضاف إلى الرحلة بعد اليوم يلزمه إمّا حذفه هنا وإمّا
  // تعديل القواعد** — وإلا سقط نشر الرحلات كلها لا هذا الحقل وحده.
  delete payload.notebookWrites;
  return await monitorNet.monitorRequest({ path: path, method: "PUT", body: payload });
}

/** يحسب نتيجة رحلة واحدة: يعلّمها منشورة عند النجاح، ويحفظ آخر خطأ عند الفشل. */
function _tallyResult(tally, journey, result) {
  if (!result.ok) {
    tally.lastError = result.error || "AUTH_JOURNEY_PUBLISH_FAILED";
    return;
  }
  journey.publishedAt = Date.now();
  tally.published++;
}

/** ينشر الرحلات غير المنشورة لهذا الموظف واحدة بعد واحدة. @returns {Promise<{published: number, lastError: string}>} */
async function _publishPending(state, identity) {
  const tally = { published: 0, lastError: "" };
  for (let index = 0; index < state.journeys.length; index++) {
    const journey = state.journeys[index];
    if (!_isUnpublishedFor(journey, identity.empId)) continue;
    const result = await _publishJourney(journey, identity);
    _tallyResult(tally, journey, result);
  }
  return tally;
}

module.exports = Object.freeze({
  readMonitorAuthJourneys,
  writeMonitorAuthJourneys,
  summarizeMonitorAuthJourneys,
  recordMonitorAuthCheckpoint,
  flushMonitorAuthCheckpoints,
  startMonitorAuthJourney,
  finishMonitorAuthJourney,
  publishMonitorAuthJourneys,
});
