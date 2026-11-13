// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: vial;

/**
 * Safe, manual device and main-runtime probe.
 * It does not import application modules or access files, Keychain, network,
 * notifications, or Pasteboard. Device.name() is intentionally not read.
 */

const screen = Device.screenResolution();

const report = {
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
  installedScriptableVersion: "Not exposed by the documented Device API. Verify separately.",
  mainRuntime: {
    promise: typeof Promise === "function",
    objectAssign: typeof Object.assign === "function",
    map: typeof Map === "function",
    set: typeof Set === "function",
    arrayIncludes: typeof Array.prototype.includes === "function",
    stringIncludes: typeof String.prototype.includes === "function"
  },
  dataAccess: "No files, Keychain, network, notifications, or Pasteboard access."
};

const output = JSON.stringify(report, null, 2);
console.log(output);

const alert = new Alert();
alert.title = "Scriptable Main Runtime Probe";
alert.message = output;
alert.addAction("OK");
alert.present().then(function () {
  Script.complete();
});
