// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: globe;

/**
 * Safe, manual WebView context probe.
 * It loads only inline HTML and does not access files, Keychain, network,
 * notifications, or Pasteboard.
 */

const webView = new WebView();
const html = "<!doctype html><html><head><meta charset=\"utf-8\"><title>WebView Probe</title></head>" +
  "<body><h2>Scriptable WebView Probe</h2><p id=\"status\">Waiting for JavaScript...</p></body></html>";

function showError(error) {
  const alert = new Alert();
  alert.title = "WebView Probe Failed";
  alert.message = String(error && error.message ? error.message : error);
  alert.addAction("OK");
  return alert.present().then(function () {
    Script.complete();
  });
}

webView.loadHTML(html)
  .then(function () {
    return webView.evaluateJavaScript(
      "document.getElementById('status').textContent = 'PASS'; 'PASS';"
    );
  })
  .then(function (result) {
    if (result !== "PASS") {
      throw new Error("WebView evaluateJavaScript returned an unexpected result.");
    }
    return webView.present(true);
  })
  .then(function () {
    Script.complete();
  })
  .catch(showError);
