// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: vial;

/**
 * Safe, manual probe for async functions and await in Scriptable's main runtime.
 *
 * Run this script manually inside Scriptable.
 * If the runtime cannot parse async syntax, Scriptable will report a syntax error
 * before this script starts. If it runs, the report verifies Promise.all and
 * rejection handling. No application modules or private data are loaded.
 */

async function runProbe() {
  const values = await Promise.all([
    Promise.resolve("first"),
    new Promise(function (resolve) {
      resolve("second");
    })
  ]);

  const caught = await Promise.reject(new Error("probe rejection"))
    .catch(function (error) {
      return error.message;
    });

  const report = {
    asyncFunctionParsed: true,
    promiseAll: values,
    rejectionCaught: caught === "probe rejection",
    systemVersion: Device.systemVersion(),
    deviceClass: Device.model(),
    dataAccess: "No files, Keychain, network, notifications, or Pasteboard access."
  };

  const output = JSON.stringify(report, null, 2);
  console.log(output);

  const alert = new Alert();
  alert.title = "Scriptable async/await Probe";
  alert.message = output;
  alert.addAction("OK");
  await alert.present();
  Script.complete();
}

runProbe().catch(function (error) {
  console.error(error);
  const alert = new Alert();
  alert.title = "Scriptable async/await Probe Failed";
  alert.message = String(error && error.message ? error.message : error);
  alert.addAction("OK");
  alert.present().then(function () {
    Script.complete();
  });
});
