// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_live.js

// ═══ الغلاف الجامع لطبقة الرحلات الحية (Facade) ═══
// يحفظ عقد التصدير الخماسي كما كان، ويوزّع المسؤوليات على ثلاث وحدات:
//   fq_live_store  → تخزين محلي + دمج خالص
//   fq_live_scrape → كشط كايا عبر WebView مرئي
//   fq_live_view   → كود عرض الواجهة المحقون
const store  = importModule("fq_live_store");
const scrape = importModule("fq_live_scrape");
const view   = importModule("fq_live_view");

module.exports = Object.freeze({
  fetchLiveFlights: scrape.fetchLiveFlights,
  loadLive:         store.loadLive,
  saveLive:         store.saveLive,
  mergeLive:        store.mergeLive,
  getLiveCode:      view.getLiveCode,
});
