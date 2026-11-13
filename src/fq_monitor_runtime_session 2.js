// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: fingerprint;

let runtimeSessionId = "";

/** @returns {string} معرّف جلسة الرصد الحالية داخل تشغيل واحد. */
function getMonitorRuntimeSession() {
  if (!runtimeSessionId) runtimeSessionId = UUID.string();
  return runtimeSessionId;
}

module.exports = Object.freeze({ getMonitorRuntimeSession });
