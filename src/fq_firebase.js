// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: database;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_firebase.js

// ═══ الغلاف الجامع لطبقة فايربيس (Facade) ═══
// المسؤولية الواحدة: تجميع وحدات فايربيس المُفكَّكة وإعادة تصدير الواجهة الأصلية
// كما هي تماماً (عقد ثابت) دون أي تغيير في أسماء الدوال المُصدَّرة.
// الوحدات:
//   fq_firebase_rest     → طلبات HTTP الخام
//   fq_firebase_flights  → عمليات الرحلات
//   fq_firebase_reg      → عمليات التسجيلات
//   fq_firebase_content  → الدليل والإشعارات والمستخدمون
//   fq_firebase_webview  → كود الواجهة المحقون (fetch)

const rest = importModule("fq_firebase_rest");
const flights = importModule("fq_firebase_flights");
const reg = importModule("fq_firebase_reg");
const content = importModule("fq_firebase_content");
const webview = importModule("fq_firebase_webview");

module.exports = Object.freeze({
  // ═══ REST خام ═══
  ping: rest.ping,
  readData: rest.readData,
  writeData: rest.writeData,
  patchData: rest.patchData,
  pushData: rest.pushData,
  deleteData: rest.deleteData,
  // ═══ الرحلات ═══
  saveFlightsToFirebase: flights.saveFlightsToFirebase,
  loadFlightsFromFirebase: flights.loadFlightsFromFirebase,
  updateFlight: flights.updateFlight,
  deleteFlight: flights.deleteFlight,
  deleteFlightsBatch: flights.deleteFlightsBatch,
  clearAllFlights: flights.clearAllFlights,
  // ═══ التسجيلات ═══
  saveRegistration: reg.saveRegistration,
  saveRegistrationsBatch: reg.saveRegistrationsBatch,
  loadRegistrations: reg.loadRegistrations,
  deleteRegistration: reg.deleteRegistration,
  // ═══ الدليل والإشعارات والمستخدمون ═══
  saveGuide: content.saveGuide,
  loadGuide: content.loadGuide,
  pushNotification: content.pushNotification,
  saveProfile: content.saveProfile,
  loadProfile: content.loadProfile,
  loadAllUsers: content.loadAllUsers,
  // ═══ كود الواجهة المحقون ═══
  getFirebaseCode: webview.getFirebaseCode,
});
