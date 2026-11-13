// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: vial;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: selftest.js

/**
 * @module selftest
 * @description مهايئ الجهاز لحالات `selftest_cases` — للمطوّر وحده، يُشغَّل يدويًّا.
 *
 * يشغّل الحالات نفسها التي يشغّلها `npm test` على الحاسوب، لكن على المحرّكين
 * الحقيقيين: JavaScriptCore لشيفرة Scriptable، ومحرّك `WebView` لشيفرة المتصفح.
 * فإن اختلفت نتيجة الجهاز عن الحاسوب فذلك ما وُجد هذا السكربت ليكشفه.
 *
 * ═══ ما في الوثائق ═══
 * - `importModule` يُرجع `module.exports` <https://docs.scriptable.app/importmodule/>.
 * - `WebView.loadHTML` و`evaluateJavaScript` يُرجعان وعدًا، والثاني يحمل قيمة
 *   آخر سطر <https://docs.scriptable.app/webview/>.
 * - `console.log(message)` بوسيط واحد <https://docs.scriptable.app/console/>.
 * - `Alert.present()` وعدٌ برقم الزر <https://docs.scriptable.app/alert/>.
 * - `Pasteboard.copy(string)` <https://docs.scriptable.app/pasteboard/>.
 *
 * ═══ ما ليس في الوثائق ═══
 * - `async/await` لم تردا في الصفحات التي فُتحت (البند ٦ من القيد)؛ استعمالهما
 *   بقرار المشروع المعتمد على تجربة المطوّرين في المنتدى، لا على نص رسمي.
 * - تشغيل `WebView` دون عرضه لا تنص عليه الوثائق صراحةً؛ حالة التطابق تثبته أو تنفيه.
 *
 * ═══ الأثر ═══
 * لا يكتب في القاعدة ولا في الملفات ولا في Keychain. وتحميل `fq_helpers` يحمّل
 * `fq_config` الذي يقرأ Keychain، ولا يكتب فيه إلا على جهاز لم يشغّل النظام قط
 * (ترحيل أول تشغيل في `fq_config`) — وهو ما يفعله `fq_main` عند كل تشغيل.
 * وينسخ التقرير إلى الحافظة لتلصقه للمطوّر.
 *
 * ═══ التثبيت ═══
 * الاسم بلا البادئة `fq_` عمدًا: لا يطابق نمط النشر فلا يصل إلى أي جهاز موظف.
 * يُنقل هو و`selftest_cases.js` يدويًّا إلى مجلد Scriptable، بجانب ملفات `fq_*`.
 */

const suite = importModule("selftest_cases");

/**
 * يُرجع دالة تقيّم شيفرة المتصفح في صفحة فارغة جديدة غير معروضة.
 * صفحة لكل تقييم، لأن إعلان `let` أو `const` في أعلى النص يُرفض إن تكرّر في الصفحة نفسها.
 * @returns {Function} دالة تأخذ نصّ الشيفرة وتُرجع وعدًا بقيمة آخر سطر
 */
function makeBrowserEval() {
  return async function (code) {
    const webView = new WebView();
    await webView.loadHTML("<html><body></body></html>");
    return webView.evaluateJavaScript(code);
  };
}

/**
 * يشغّل الحالات واحدة بعد أخرى. `runCase` لا يرمي، ففشل حالة لا يوقف البقية.
 * @returns {Promise<Array<{name: string, ok: boolean, assertions: number, error: string}>>}
 */
async function runAll() {
  const env = {
    load: function (name) { return importModule(name); },
    evalBrowser: makeBrowserEval(),
  };
  const results = [];
  for (const testCase of suite.cases) {
    results.push(await suite.runCase(testCase, env));
  }
  return results;
}

/**
 * يبني نص التقرير: سطر لكل حالة ثم الملخص.
 * @param {Array<{name: string, ok: boolean, assertions: number, error: string}>} results
 * @returns {{text: string, failed: number}}
 */
function buildReport(results) {
  const failed = results.filter(function (r) { return !r.ok; }).length;
  const lines = results.map(function (r) {
    return (r.ok ? "✔ " : "✘ ") + r.name + " (" + r.assertions + ")" + (r.ok ? "" : "\n   " + r.error);
  });
  lines.push("");
  lines.push("ناجح: " + (results.length - failed) + " · فاشل: " + failed + " · من " + results.length);
  return { text: lines.join("\n"), failed: failed };
}

/**
 * يعرض التقرير في تنبيه.
 * @param {string} title
 * @param {string} message
 * @returns {Promise<number>}
 */
function showAlert(title, message) {
  const alert = new Alert();
  alert.title = title;
  alert.message = message;
  alert.addAction("حسنًا");
  return alert.present();
}

// ═══ نقطة الدخول ═══
if (config.runsInApp) {
  try {
    const report = buildReport(await runAll());
    console.log(report.text);
    Pasteboard.copy(report.text);
    await showAlert(report.failed === 0 ? "الاختبار: أخضر" : "الاختبار: أحمر", report.text);
  } catch (e) {
    console.error(e);
    await showAlert("تعذّر تشغيل الاختبار", String(e && e.message ? e.message : e))
      .catch(function (alertError) { console.error(alertError); });
  } finally {
    Script.complete();
  }
}
