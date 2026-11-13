// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: hourglass-half;

/** @returns {Object} سياسة الاحتفاظ المحدودة لمساحة قاعدة الرصد. */
function getMonitorRetentionPolicy() {
  return Object.freeze({ eventsDays: 30, authJourneysDays: 30, controlAuditDays: 0 });
}

module.exports = Object.freeze({ getMonitorRetentionPolicy });
