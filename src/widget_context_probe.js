// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: layout;

/**
 * Safe, manual ListWidget context probe.
 * It creates an in-memory widget only. It does not access files, Keychain,
 * network services, notifications, or Pasteboard.
 */

const widget = new ListWidget();
widget.addText("Scriptable Widget Context Probe");
widget.addSpacer();
widget.addText("Device class: " + Device.model());
widget.addText("OS version: " + Device.systemVersion());
widget.addText("Widget context: " + String(config.runsInWidget));
widget.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);

function showError(error) {
  const alert = new Alert();
  alert.title = "Widget Probe Failed";
  alert.message = String(error && error.message ? error.message : error);
  alert.addAction("OK");
  return alert.present().then(function () {
    Script.complete();
  });
}

if (config.runsInWidget) {
  Script.setWidget(widget);
  Script.complete();
} else {
  widget.presentSmall()
    .then(function () {
      Script.complete();
    })
    .catch(showError);
}
