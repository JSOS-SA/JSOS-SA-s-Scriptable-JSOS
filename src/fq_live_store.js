// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: database;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_live_store.js

/**
 * @module fq_live_store
 * @description طبقة تخزين ودمج الرحلات الحية (تخبئة محلية + دمج خالص بلا تكرار).
 * لا تعرف شيئاً عن العرض ولا عن الكشط — بيانات فقط.
 */

const LIVE_FILE = "fq_live_cache.json";
const _fm = FileManager.local();
const _livePath = _fm.joinPath(_fm.documentsDirectory(), LIVE_FILE);

// ═══ تخزين واسترجاع محلي ═══
/**
 * يحفظ قائمة الرحلات الحية في ملف الكاش المحلي.
 * @param {Array} flights - الرحلات الحية
 * @returns {void}
 */
function saveLive(flights) {
  try {
    _fm.writeString(_livePath, JSON.stringify({
      flights: flights,
      ts: Date.now()
    }));
  } catch(e) { console.warn(`[fq_live] cache load failed: ${e.message}`); }
}

/**
 * يقرأ الرحلات الحية من الكاش المحلي.
 * @returns {Object|null}
 */
function loadLive() {
  try {
    if (!_fm.fileExists(_livePath)) return null;
    const raw = JSON.parse(_fm.readString(_livePath));
    const age = (Date.now() - raw.ts) / 60000;
    return { flights: raw.flights, age: Math.round(age) };
  } catch(e) { return null; }
}

// ═══ دمج رحلات جديدة مع القديمة بدون تكرار ═══
/**
 * يبني مفتاح التعريف الفريد لرحلة حية.
 * @param {Object} f - بيانات الرحلة
 * @returns {string}
 */
function _buildKey(f) {
  return `${f.flight || ""}@${f.time || ""}@${f.dest || ""}`;
}

/**
 * يُحدّث حالة رحلة موجودة في المصفوفة المدمجة إن تغيّرت.
 * @param {Array} merged - مصفوفة الرحلات المدمجة
 * @param {string} nKey - مفتاح الرحلة الجديدة
 * @param {Object} nf - بيانات الرحلة الجديدة
 */
function _updateStatus(merged, nKey, nf) {
  for (let u = 0; u < merged.length; u++) {
    const mk = _buildKey(merged[u]);
    if (mk === nKey && nf.status && nf.status !== merged[u].status) {
      merged[u].status = nf.status;
      if (nf.estimated) merged[u].estimated = nf.estimated;
      break;
    }
  }
}

/**
 * يزرع الرحلات القديمة في القائمة المدموجة، ويسجّل مفاتيحها لمنع التكرار.
 * @param {Array} oldFlights - الرحلات المحفوظة سابقاً
 * @param {Object} seen - جدول المفاتيح المرئية
 * @param {Array} merged - القائمة المدموجة تُعدَّل موضعيًّا
 * @returns {void}
 */
function _seedMergedFlights(oldFlights, seen, merged) {
  for (let i = 0; i < oldFlights.length; i++) {
    const key = _buildKey(oldFlights[i]);
    if (key === "@@" || seen[key]) continue;
    seen[key] = true;
    merged.push(oldFlights[i]);
  }
}

/**
 * يدمج رحلة جديدة واحدة: المكرّرة تُحدَّث حالتها، والجديدة تُضاف.
 * @returns {number} ١ إن أُضيفت، و٠ إن لم تُضَف
 */
function _mergeOneFlight(flight, seen, merged) {
  const key = _buildKey(flight);
  if (key === "@@") return 0;
  if (seen[key]) {
    _updateStatus(merged, key, flight);
    return 0;
  }
  seen[key] = true;
  merged.push(flight);
  return 1;
}

function _mergeNewFlights(newFlights, seen, merged) {
  let added = 0;
  for (let i = 0; i < newFlights.length; i++) {
    added += _mergeOneFlight(newFlights[i], seen, merged);
  }
  return added;
}

/**
 * يدمج قوائم الرحلات الحية القديمة والجديدة بدون تكرار.
 * (نُقلت هذه الوثيقة إلى صاحبها في ٢٠٢٦-٠٩-٢٥: كانت فوق دالةٍ أُدخِلت
 *  بينها وبين الدالة التي تصفها. تقرير التدقيق، الفئة أ.)
 * @param {Array} oldFlights - الرحلات المحفوظة سابقاً
 * @param {Array} newFlights - الرحلات المستخرجة حديثاً
 * @returns {{flights: Array, added: number}}
 */
function mergeLive(oldFlights, newFlights) {
  if (!oldFlights || oldFlights.length === 0) {
    return { flights: newFlights, added: newFlights.length };
  }
  if (!newFlights || newFlights.length === 0) {
    return { flights: oldFlights, added: 0 };
  }

  const seen = {};
  const merged = [];
  _seedMergedFlights(oldFlights, seen, merged);
  const added = _mergeNewFlights(newFlights, seen, merged);
  return { flights: merged, added: added };
}

module.exports = Object.freeze({ saveLive, loadLive, mergeLive });
