// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: eye;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_queue_view.js

/**
 * @module fq_queue_view
 * @description المسؤولية الواحدة: **أن يرى الموظف ما لم يصل بعد**.
 * لا يرسل ولا يقرّر ولا يخزّن — يقرأ العمق والنصّ من الوحدات تحته.
 *
 * **لماذا شريط لا إشعار**: الدرس ١٨ — «الحالة التي لا يراها المستخدم
 * ليست حالة». الإشعار يختفي بعد ثانيتين فيبقى الشكّ، وما لم يصل قد يبقى
 * دقائق. فالإيصال دائم ما دام السبب قائمًا، ويختفي وحده حين يصل كل شيء.
 *
 * **وثلاث كتل كما في `fq_toast` تمامًا** (بنية · أنماط · سلوك) ومنصّة
 * على مستوى `body` — فهذا عنصر عامّ كالتوست، يظهر في كل التيوبات ولا
 * يخصّ لوحة. ولم يُبنَ مكوّن جديد: الشريط يرث ألوان المشروع ومتغيّراته.
 *
 * **والموضع فوق علامة `#t4Fab` لا فوق الشريط السفلي وحده**: العلامة
 * مثبَّتة عند `calc(var(--tabsH) - 8px)` وقطرها ٥٦، فأعلاها ١٢٠ بكسل من
 * أسفل الشاشة. أوّل قياس وضع الشريط عند ‎+8‎ فجلست العلامة فوقه تمامًا
 * (٧٢٤←٧٦٤ مقابل ٧٢٤←٧٨٠ على ٣٩٠×٨٤٤). الإزاحة ‎+64‎ ترفعه فوقها بفجوة
 * ١٦ بكسل — **مقيسة في Chromium لا مقدَّرة** (الدرس ٢٣).
 */

function getQueueViewHtml() {
  return `
<div id="fqQueueBar" class="fqq-bar" style="display:none">
  <span class="fqq-dot"></span>
  <span class="fqq-text" id="fqQueueText"></span>
  <button type="button" class="fqq-btn" id="fqQueueRetryBtn">أعد المحاولة</button>
</div>
`;
}

/**
 * يبني أنماط شريط ما لم يصل بعد إلى القاعدة.
 * @returns {string} نص CSS
 */
function getQueueViewStyles() {
  return `
/* شريط ما لم يصل بعد — عنصر عامّ فوق الشريط السفلي */
.fqq-bar{
  position:fixed;
  left:12px;right:12px;
  bottom:calc(var(--tabsH, 72px) + 64px);
  z-index:9980;
  display:flex;align-items:center;gap:8px;
  padding:8px 12px;
  border-radius:12px;
  background:#2b2b2b;color:#fff;
  font-family:Tajawal,sans-serif;font-size:12px;
  box-shadow:0 4px 14px rgba(0,0,0,.28);
}
.fqq-dot{
  width:8px;height:8px;border-radius:50%;
  background:#ffb020;flex:0 0 auto;
}
.fqq-bar[data-tone="bad"] .fqq-dot{background:#E50914}
.fqq-text{flex:1 1 auto;line-height:1.7}
.fqq-btn{
  flex:0 0 auto;
  padding:5px 10px;
  border:0;border-radius:8px;
  background:#fff;color:#1a1a1a;
  font-family:Tajawal,sans-serif;font-size:12px;font-weight:700;
}
`;
}

/**
 * يبني شيفرة الصفحة التي تعرض حال الطابور للموظف.
 * @returns {string} نص JavaScript يعمل داخل الصفحة
 */
function getQueueViewCode() {
  return `
// ═══ الطابور: ما يراه الموظف ═══
// الشريط يظهر حين يكون في الطابور شيء، ويختفي حين يفرغ — بلا زرّ إغلاق:
// إخفاؤه يدويًّا يعني إخفاء عمل لم يُحفظ، وهو ما جاء الشريط ليمنعه.
function fqQueueRender() {
  const bar = document.getElementById("fqQueueBar");
  const text = document.getElementById("fqQueueText");
  if (!bar || !text) return;
  const depth = fqQueueDepth();
  if (depth <= 0) { bar.style.display = "none"; return; }
  fqQueueShowBar(bar, text, depth);
}

// الطابور غير فارغ: الشريط ظاهر، ولونه أحمر إن كان فيه معزول.
function fqQueueShowBar(bar, text, depth) {
  const blocked = fqQueueBlockedCount();
  bar.style.display = "flex";
  bar.setAttribute("data-tone", blocked > 0 ? "bad" : "warn");
  text.textContent = fqQueueStatusText(depth, blocked);
}

function fqQueueBindView() {
  const btn = document.getElementById("fqQueueRetryBtn");
  if (!btn) return false;
  btn.addEventListener("click", function () {
    fqQueueRetryAll().catch(function (e) {
      console.error("[fq_queue] إعادة: " + (e && e.message ? e.message : e));
    });
  });
  return true;
}

fqQueueBindView();
fqQueueRender();
`;
}

module.exports = Object.freeze({
  getQueueViewHtml, getQueueViewStyles, getQueueViewCode
});
