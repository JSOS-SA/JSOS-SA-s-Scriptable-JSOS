// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: align-left;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_text.js

/**
 * @module fq_t4_text
 * @description المسؤولية الواحدة: تحويل قائمة مدخلات T4 إلى نصّ المخرجات.
 * دوال خالصة بلا DOM وبلا شبكة، فهي وحدها القابلة للاختبار مباشرة.
 *
 * الشكل الذي حدّده المستخدم:
 *
 *   LX940 | 09:35 | New Delhi
 *   - 34 ✅
 *   - 42 ✅
 *
 *   SM456 | 10:10 | Cairo
 *   - 49 ✅
 *
 * وعند تأخّر الرحلة (طلب المستخدم ٢٠٢٦-٠٩-٢٧) يصير عنوانها:
 *
 *   IX942 | ~12:45~ - 13:40 DELAYED | Bengaluru
 *
 * التجميع برقم الرحلة، وترتيب المجموعات بأول ظهور.
 */

function getT4TextCode() {
  return getT4TextCodePart1() +
    getT4TextCodePart2();
}

/** الجزء 1 من 2 من نصّ `getT4TextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4TextCodePart1() {
  return `
// ═══ T4: رموز الحالة ═══
// المفتاح المخزَّن في القاعدة، لا الرمز نفسه — تغيير الرمز لاحقًا لا يمسّ
// سطرًا مسجَّلًا. "x" أُضيف في ٢٠٢٦-٠٩-٢٠ بطلب المستخدم.
const T4_EMOJI = { red: "🔴", green: "✅", yellow: "🟡", x: "❌" };

// ═══ اسم الوجهة بالإنجليزية ═══
// en مصدره OurAirports (انظر رأس fq_airports.js). عند غيابه يسقط العرض
// إلى رمز المطار لا إلى الاسم العربي، كي تبقى سطور المخرجات بلغة واحدة.
function t4DestName(code) {
  const up = String(code || "").trim().toUpperCase();
  if (!up) return "";
  if (typeof AIRPORTS !== "undefined" && AIRPORTS[up] && AIRPORTS[up].en) return AIRPORTS[up].en;
  return up;
}

// ═══ تجميع المدخلات برقم الرحلة، بترتيب أول ظهور ═══
// العنوان يؤخذ من أول إدخال في المجموعة.
// والوقت الجديد (التأخير) يُرفع من أي سطر في المجموعة، والأحدث يغلب —
// اختيار المستخدم ٢٠٢٦-٠٩-٢٧: «يظهر التأخير في العنوان». فيكفي أن يكتبه
// الموظف مرّة واحدة في أي تسجيل، ولو تأخّرت الرحلة مرّتين ظهر آخر وقت.
// وهذا بخلاف الوجهة ووقت الإقلاع، وهما من أوّل سطر لأنهما لا يتغيّران.
function t4GroupEntries(entries) {
  const order = [];
  const map = {};
  for (let i = 0; i < entries.length; i++) t4GroupAdd(map, order, entries[i]);
  const out = [];
  for (let j = 0; j < order.length; j++) out.push(map[order[j]]);
  return out;
}

// يضيف سطرًا إلى كتلة رحلته، والسطر بلا رقم رحلة يُتخطّى.
function t4GroupAdd(map, order, e) {
  const key = String(e.flt || "").toUpperCase();
  if (!key) return;
  if (!map[key]) {
    map[key] = { flt: e.flt, std: e.std, dest: e.dest, newStd: "", rows: [] };
    order.push(key);
  }
  if (e.newStd) map[key].newStd = e.newStd;
  map[key].rows.push(e);
}
`;
}

/** الجزء 2 من 2 من نصّ `getT4TextCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4TextCodePart2() {
  return `
// ═══ مقطع الوقت: وقت واحد، أو قديمٌ مشطوب فجديدٌ وكلمة DELAYED ═══
// الشكل الذي حدّده المستخدم ٢٠٢٦-٠٩-٢٧: IX942 | ~12:45~ - 13:40 DELAYED | …
// وعلامتا ~ هما شطبُ واتساب نفسه (اختياره: «على الشاشة وفي واتساب»)، فالنصّ
// واحد للحافظة وللرسالة وللشاشة، وصندوقُ العرض وحده يحوّلهما إلى شطب مرئي.
// ولو لم يُسجَّل وقت الإقلاع أصلًا فلا شيء يُشطب، ويبقى الجديد وكلمته.
function t4TimePart(group) {
  if (!group.newStd) return group.std;
  if (!group.std) return group.newStd + " DELAYED";
  return "~" + group.std + "~ - " + group.newStd + " DELAYED";
}

// ═══ عنوان مجموعة: الرقم | الوقت | الوجهة — بلا شَرطة في البداية ═══
function t4HeadLine(group) {
  return [group.flt, t4TimePart(group), group.dest]
    .filter(function(x) { return x; }).join(" | ");
}

// ═══ سطر إدخال: شَرطة، مسافة، العدد، مسافة، الرمز ═══
function t4EntryLine(entry) {
  return "- " + entry.pax + " " + (T4_EMOJI[entry.status] || "");
}

// ═══ النص الكامل: كتلة لكل رحلة، يفصلها سطر فارغ ═══
function t4BuildText(entries) {
  const groups = t4GroupEntries(entries);
  const blocks = [];
  for (let i = 0; i < groups.length; i++) {
    const lines = [t4HeadLine(groups[i])];
    for (let j = 0; j < groups[i].rows.length; j++) {
      lines.push(t4EntryLine(groups[i].rows[j]));
    }
    blocks.push(lines.join("\\n"));
  }
  return blocks.join("\\n\\n");
}
`;
}

module.exports = Object.freeze({ getT4TextCode });
