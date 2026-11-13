// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: plug;

const consoleCapture = importModule("fq_monitor_console_error");

/** @returns {boolean} true عند تثبيت ملتقط console.error أو وجوده مسبقًا. */
function installMonitorConsoleCapture() {
  if (globalThis.__fqMonitorOriginalConsoleError) return true;
  try {
    globalThis.__fqMonitorOriginalConsoleError = console.error.bind(console);
    globalThis.__fqMonitorConsoleCaptureBusy = false;
    console.error = consoleCapture.captureMonitorConsoleError;
    return true;
  } catch (error) {
    console.warn(`[fq_monitor_install_console_capture] ${error.message}`);
    return false;
  }
}

module.exports = Object.freeze({ installMonitorConsoleCapture });
