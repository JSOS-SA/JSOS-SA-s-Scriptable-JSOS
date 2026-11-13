// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: inbox;

const QUEUE_FILE = "fq_monitor_v2_queue.json";

/** @returns {Array} طابور الرصد المستقل. */
function readMonitorQueue() {
  try {
    const manager = FileManager.local();
    const path = manager.joinPath(manager.documentsDirectory(), QUEUE_FILE);
    if (!manager.fileExists(path)) return [];
    const parsed = JSON.parse(manager.readString(path));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[fq_monitor_queue_read] ${error.message}`);
    return [];
  }
}

module.exports = Object.freeze({ readMonitorQueue });
