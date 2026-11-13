// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: save;

const JOURNEY_FILE = "fq_monitor_auth_journeys.json";

/**
 * يستبدل سجل رحلات الدخول والربط المحلي.
 * @param {Object} state
 * @returns {boolean}
 */
function writeMonitorAuthJourneys(state) {
  if (!state || !Array.isArray(state.journeys)) return false;
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), JOURNEY_FILE);
    manager.writeString(path, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error(`[fq_monitor_auth_journey_write] ${error.message}`);
    return false;
  }
}

module.exports = Object.freeze({ writeMonitorAuthJourneys });
