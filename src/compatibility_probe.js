// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: vial;

/**
 * Safe, manual device and host-context probe.
 *
 * Run this script manually inside Scriptable.
 * It does not import application modules and does not access files, Keychain,
 * network services, notifications, or Pasteboard.
 * Device.name() is intentionally not read because it may contain personal data.
 */

const screen = Device.screenResolution();

const deviceReport = {
  systemName: Device.systemName(),
  systemVersion: Device.systemVersion(),
  modelClass: Device.model(),
  isPhone: Device.isPhone(),
  isPad: Device.isPad(),
  screenResolution: {
    width: screen.width,
    height: screen.height
  },
  screenScale: Device.screenScale(),
  installedScriptableVersion: "Not exposed by the documented Device API. Verify separately."
};

const mainRuntimeReport = {
  promise: typeof Promise === "function",
  objectAssign: typeof Object.assign === "function",
  map: typeof Map === "function",
  set: typeof Set === "function",
  arrayIncludes: typeof Array.prototype.includes === "function",
  stringIncludes: typeof String.prototype.includes === "function"
};

function showReport(title, report) {
  const output = JSON.stringify(report, null, 2);
  console.log(output);

  const alert = new Alert();
  alert.title = title;
  alert.message = output;
  alert.addAction("OK");
  return alert.present();
}

const webView = new WebView();

webView.loadHTML("<!doctype html><html><head><meta charset=\"utf-8\"></head><body></body></html>")
  .then(function () {
    return webView.evaluateJavaScript(
      "JSON.stringify({" +
      "promise:typeof Promise==='function'," +
      "objectAssign:typeof Object.assign==='function'," +
      "arrayIncludes:typeof Array.prototype.includes==='function'" +
      "})"
    );
  })
  .then(function (webViewJson) {
    return showReport("Scriptable Compatibility Probe", {
      device: deviceReport,
      mainRuntime: mainRuntimeReport,
      webView: JSON.parse(webViewJson),
      dataAccess: "No files, Keychain, network, notifications, or Pasteboard access."
    });
  })
  .catch(function (error) {
    return showReport("Scriptable Compatibility Probe Error", {
      device: deviceReport,
      mainRuntime: mainRuntimeReport,
      webViewError: String(error),
      dataAccess: "No files, Keychain, network, notifications, or Pasteboard access."
    });
  })
  .then(function () {
    Script.complete();
  });
