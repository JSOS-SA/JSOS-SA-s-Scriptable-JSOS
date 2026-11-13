// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: bell;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_alerts.js

/**
 * @module fq_alerts
 * @description وحدة جدولة الإشعارات المحلية للرحلات القادمة.
 * تعمل عبر واجهة Notification الأصلية في iOS.
 * مسؤولية واحدة: جدولة وإلغاء الإشعارات بناءً على بيانات الرحلات.
 */

// ════════════════════════════════════════════════
// 1. الثوابت الداخلية (Information Hiding)
// ════════════════════════════════════════════════
const ALERT_PREFIX     = "fq_flight_";
const MINUTES_BEFORE   = 30;
const MAX_SCHEDULED    = 10;

// ════════════════════════════════════════════════
// 2. دوال مساعدة خاصة
// ════════════════════════════════════════════════

/**
 * إنشاء معرّف فريد للإشعار بناءً على بيانات الرحلة.
 * @param {Object} flight
 * @returns {string}
 */
function _buildAlertId(flight) {
  const key = `${flight.flt || ""}_${flight.std || ""}_${flight.date || ""}`;
  return ALERT_PREFIX + key.replace(/[^a-zA-Z0-9_]/g, "_");
}

/**
 * التحقق من أن الرحلة لم تُقلع بعد ووقتها معروف.
 * @param {Object} flight
 * @returns {boolean}
 */
function _isSchedulable(flight) {
  if (!(flight && flight.depTime)) return false;
  const dep = new Date(flight.depTime);
  const now = new Date();
  // getTime() صريحٌ: الطرح المباشر يعمل بتحويل valueOf الضمنيّ، وليس تعبيرًا
  // حسابيًّا صحيحًا، وترفضه أداة الفحص بحق.
  const minutesUntil = (dep.getTime() - now.getTime()) / 60000;
  return minutesUntil > MINUTES_BEFORE;
}

/**
 * يفحص تفضيل المستخدم لإيقاف إشعارات الآيفون من Keychain — القارئ الوحيد له في
 * النظام (قرار المالك ٢٠٢٦-١٠-٠٥، docs/الذاكرة.md ٣.١١): يحكم `Notification` وحدها،
 * لا رسائل الصفحة ولا سجلّ الإشعارات المشترك. مصدر الحقيقة: مفتاح "fq_notif_off".
 * `Keychain.contains` قبل `Keychain.get` لأن الأخيرة «will throw an error» للمفتاح الغائب.
 * @param {(error: Error) => void} [onFault] ما يُفعل بخطأ القراءة؛ وإلا يُطبع في السجلّ
 * @returns {boolean} true إذا الإشعارات مسموح بها، وغياب المفتاح أو فشل قراءته = مسموح
 */
function isNotifAllowed(onFault) {
  try {
    if (Keychain.contains("fq_notif_off")) {
      return Keychain.get("fq_notif_off") !== "1";
    }
  } catch (e) {
    if (onFault) onFault(e);
    else console.error(`[fq_alerts] keychain read fault: ${e.message}`);
  }
  return true;
}

/**
 * يميّز أخطاء رفض الصلاحيات الصامتة (وفق دستور المشروع: Graceful Degradation).
 * رسالة Scriptable لرفض إذن الإشعارات مضلِّلة نصيًا (تذكر "contacts"/"not granted")
 * لكنها ليست فشل نظام — يجب كتمها دون كسر سير العمل.
 * @param {string} msg
 * @returns {boolean}
 */
function _isPermissionDenialMessage(msg) {
  if (!msg) return false;
  return msg.indexOf("not granted") !== -1 || msg.indexOf("contacts") !== -1;
}

// ════════════════════════════════════════════════
// 3. الدوال العامة المُصدَّرة
// ════════════════════════════════════════════════

function _errorMessage(error) {
  return (error && error.message) ? error.message : String(error);
}

function _logUnexpected(prefix, error) {
  const message = _errorMessage(error);
  if (!_isPermissionDenialMessage(message)) {
    console.error(prefix + message);
  }
}

function _createFlightNotification(flight) {
  const departure = new Date(flight.depTime);
  const triggerAt = new Date(departure.getTime() - MINUTES_BEFORE * 60000);
  const notification = new Notification();
  notification.identifier = _buildAlertId(flight);
  notification.title = `✈️ رحلة ${flight.flt || ""} تُقلع قريباً`;
  notification.body = `الوجهة: ${flight.to || ""}  |  الوقت: ${flight.std || ""}`;
  notification.setTriggerDate(triggerAt);
  notification.sound = "default";
  return notification;
}

async function _scheduleFlightAlert(flight) {
  try {
    const notification = _createFlightNotification(flight);
    await notification.schedule();
    return true;
  } catch (error) {
    _logUnexpected(
      `[fq_alerts] Failed to schedule flight ${flight.flt || ""}: `,
      error
    );
    return false;
  }
}

/**
 * يجدول أوّل الرحلات القابلة حتى الحدّ الأعلى، ويقف إن أُوقفت الإشعارات أثناء الجدولة.
 * @param {Array} flights - مصفوفة الرحلات
 * @returns {Promise<number>} عدد الإشعارات المجدولة
 */
async function _scheduleUpcoming(flights) {
  const schedulable = flights.filter(_isSchedulable).slice(0, MAX_SCHEDULED);
  let scheduled = 0;
  for (let i = 0; i < schedulable.length; i++) {
    if (!isNotifAllowed()) break;
    if (await _scheduleFlightAlert(schedulable[i])) scheduled++;
  }
  return scheduled;
}

/**
 * جدولة إشعارات للرحلات القادمة.
 * @param {Array} flights - مصفوفة الرحلات
 * @returns {Promise<number>} عدد الإشعارات المجدولة
 */
async function scheduleAlerts(flights) {
  if (!Array.isArray(flights) || flights.length === 0) return 0;
  if (!isNotifAllowed()) {
    await cancelAllAlerts();
    return 0;
  }

  try {
    await cancelAllAlerts();
    return await _scheduleUpcoming(flights);
  } catch (error) {
    _logUnexpected("[fq_alerts] scheduleAlerts fault: ", error);
    return 0;
  }
}

/**
 * إلغاء جميع إشعارات النظام المعلّقة الخاصة بالرحلات.
 * يبتلع خطأ صلاحيات الإشعارات بصمت لأن iOS قد يرفض الوصول
 * قبل منح المستخدم الصلاحية، وهذا ليس فشلاً حقيقياً.
 * @returns {Promise<void>}
 */
async function cancelAllAlerts() {
  try {
    const pending = await Notification.allPending();
    for (let i = 0; i < pending.length; i++) {
      if (pending[i].identifier && pending[i].identifier.startsWith(ALERT_PREFIX)) {
        // انتظار الحذف إلزامي — remove تعيد وعدًا، وتركه سائبًا كان يسمح
        // للحذف المتأخر أن يهبط على إشعار جُدول بعده بالمعرّف نفسه فيمحوه
        await pending[i].remove();
      }
    }
  } catch (e) {
    const msg = (e && e.message) ? e.message : String(e);
    if (!_isPermissionDenialMessage(msg)) {
      console.log(`[fq_alerts] cancel skipped: ${msg}`);
    }
  }
}

// ════════════════════════════════════════════════
// 4. نقطة الدخول (إلزام القالب الثابت)
// ════════════════════════════════════════════════
class AppCoordinator {
  static async boot() {
    // وحدة خدمية — لا تنفيذ عند الإقلاع المباشر
  }
}

try {
  // boot() غير متزامنة: الـ try وحده لا يلتقط رفضها، لأن الدالة غير المتزامنة
  // لا ترمي تزامنيًّا بل تُرجع وعدًا مرفوضًا. فكان خطأ الإقلاع يُبتلَع صامتًا.
  // و .catch() إلزاميّ لكل وعد غير منتظَر (CLAUDE.md القسم ١، الخيار أ)، وهذا
  // ما كشفه @typescript-eslint/no-floating-promises في ٢٠٢٦-٠٩-٢٥.
  AppCoordinator.boot().catch((bootError) => console.error(bootError));
} catch (e) {
  console.error(e);
}

module.exports = Object.freeze({ scheduleAlerts, cancelAllAlerts, isNotifAllowed });
