// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_diagnose.js

// ═══ تشخيص بنية كايا — شغّل مرة واحدة ═══
// يفتح صفحة الرحلات ويطبع بنية العناصر
// الخطوات: 1) تفتح الصفحة 2) انتظر ظهور الرحلات
//          3) اضغط Done 4) تظهر النتيجة

function buildDiagnosticCode() {
  return buildDiagnosticCodePart1() +
    buildDiagnosticCodePart2();
}

/** الجزء 1 من 2 من نصّ `buildDiagnosticCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function buildDiagnosticCodePart1() {
  return `
setTimeout(function() {
const out = [];

const tables = document.querySelectorAll('table');
out.push("=== جداول: " + tables.length + " ===");
for (let t = 0; t < tables.length; t++) {
  const rows = tables[t].querySelectorAll('tr');
  out.push("جدول " + t + ": " + rows.length + " صف");
  for (let r = 0; r < Math.min(3, rows.length); r++) {
    out.push("  صف" + r + ": " +
      rows[r].textContent.replace(/\\s+/g," ").substring(0,200));
  }
}

const sels = [
  '[class*="flight"]','[class*="Flight"]',
  '[class*="departure"]','[class*="Departure"]',
  '[class*="schedule"]','[class*="card"]',
  '[class*="Card"]','[class*="item"]',
  '[class*="Item"]','[class*="row"]'
];
for (let si = 0; si < sels.length; si++) {
  const els = document.querySelectorAll(sels[si]);
  if (els.length > 0) {
    out.push("\\n=== " + sels[si] + ": " + els.length + " ===");
    for (let i = 0; i < Math.min(3, els.length); i++) {
      out.push("  <" + els[i].tagName +
        " class='" + (els[i].className||"").substring(0,100) + "'>");
      out.push("  " +
        els[i].textContent.replace(/\\s+/g," ").substring(0,200));
    }
  }
}

const allEls = document.querySelectorAll('*');
const cls = {};
for (let j = 0; j < allEls.length; j++) {
  const cn = allEls[j].className;
  if (typeof cn === 'string' && cn) {
    cn.split(/\\s+/).forEach(function(c) {
      if (c.length > 2) cls[c] = (cls[c]||0) + 1;
    });
  }
}
const rep = [];`;
}

/** الجزء 2 من 2 من نصّ `buildDiagnosticCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function buildDiagnosticCodePart2() {
  return `
for (const k in cls) {
  if (cls[k] > 3) rep.push(k + ":" + cls[k]);
}
rep.sort(function(a,b){
  return parseInt(b.split(":")[1]) - parseInt(a.split(":")[1]);
});
out.push("\\n=== أصناف متكررة ===");
for (let m = 0; m < Math.min(30, rep.length); m++) {
  out.push("  " + rep[m]);
}

window._DIAG = out.join("\\n");
}, 10000);
void(0);
`;
}

async function main() {
  const wv = new WebView();
  await wv.loadURL("https://www.kaia.sa/ar-SA/Flights");
  await wv.evaluateJavaScript(buildDiagnosticCode());
  await wv.present(true);

  const result = await wv.evaluateJavaScript(
    "window._DIAG || 'لم تُحمّل البيانات — انتظر أطول'"
  );
  Pasteboard.copyString(result);
  await showCopied();
}

// يُعلم أن النتيجة في الحافظة.
async function showCopied() {
  const alert = new Alert();
  alert.title = "تم النسخ";
  alert.message = "النتيجة نُسخت للحافظة — الصقها هنا";
  alert.addAction("حسناً");
  await alert.present();
}

// ═══ نقطة الدخول — حراسة الوعد في المستوى الأعلى (نمط fq_widget.run) ═══
try {
  await main();
} catch (error) {
  const message = (error && error.message) || String(error);
  console.error(`[fq_diagnose] خطأ غير معالج: ${message}`);
  const alert = new Alert();
  alert.title = "توقف التشخيص";
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
} finally {
  Script.complete();
}
