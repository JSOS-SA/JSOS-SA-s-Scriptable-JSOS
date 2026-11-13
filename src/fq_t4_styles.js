// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: paint-brush;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_t4_styles.js

/**
 * @module fq_t4_styles
 * @description المسؤولية الواحدة: أنماط T4.
 *
 * **ثلاثة نطاقات لا نطاق واحد، والسبب بنيوي:**
 *   `#t4Panel …`  المخرجات والمحرّر — داخل اللوحة كبقية التيوبات.
 *   `.t4-form-win …`  النموذج و«نسخ» داخل النافذة. والنطاق صنف لا مُعرِّف
 *                 لأن النافذتين تتقاسمانه منذ ٢٠٢٦-٠٩-٢٦: نموذج F ونموذج
 *                 T4. وما يخصّ إحداهما وحدها يبقى تحت مُعرِّفها.
 *   `.t4-fab` و`.t4-mov`  العلامة والنافذة نفسها — على مستوى `body`
 *                 لأنهما يظهران في كل التيوبات، فلا أب يقيّدهما.
 * والبادئة `t4-` تكفي وحدها لمنع التسرّب: لا وحدة أخرى تستعملها.
 *
 * صندوق المخرجات بمحاذاة يسار واتجاه ltr لأن محتواه أرقام رحلات وأسماء
 * مدن إنجليزية؛ الاتجاه العربي كان يقلب ترتيب الشَرطات الرأسية.
 */

function getT4Styles() {
  return getT4StylesPart1() +
    getT4StylesPart2() +
    getT4StylesPart3() +
    getT4StylesPart4() +
    getT4StylesPart5() +
    getT4StylesPart6();
}

/** الجزء 1 من 6 من نصّ `getT4Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StylesPart1() {
  return `
/* ═══ العلامة العائمة ═══
   تبقى في كل التيوبات، فهي خارج #t4Panel.
   right لا inset-inline-end: الصفحة dir="rtl" فالمنطقي ينقلب إلى اليسار،
   والمطلوب يمين الشاشة الفعلي.
   القطر ٥٦ بكسلًا — فوق حدّ W3C «at least 44 by 44 CSS pixels».
   وارتفاعها من الأسفل يرتكز على --tabsH نفسه الذي يحجزه body للشريط،
   فلا يُكرَّر الرقم. قيس: الشريط ٤٩ بكسلًا، فتقف العلامة فوقه بـ ١٥. */
.t4-fab{
  position:fixed;right:16px;bottom:calc(var(--tabsH,72px) - 8px);
  z-index:45;width:56px;height:56px;border:none;border-radius:50%;
  background:#E50914;color:#fff;font-family:inherit;
  font-size:26px;font-weight:700;line-height:1;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 14px rgba(0,0,0,.28);
}
.t4-fab:active{transform:scale(.94)}

/* ═══ نافذة النموذج ═══
   تعيد استعمال مكوّن النوافذ .ef-* نفسه الذي تستعمله نافذتا fqConfirm
   و fqPrompt في fq_html.js — بطلب المستخدم ٢٠٢٦-٠٩-٢٤ أن تكون بحجم
   نافذة تأكيد الحذف وموقعها. فالتوسيط والمقاس والحشوة تُورَث ولا
   تُكتب هنا، وهذان **فرقان لا غير**، والصنف t4-mov يحصرهما فلا
   يتسرّبان إلى النوافذ الثلاث التي تشارك المكوّن نفسه.

   ومحاولة سابقة وُضعت النافذة فيها في أعلى الشاشة (align-items
   flex-start) لتفادي لوحة المفاتيح — أُلغيت: في Scriptable يعلو شريط
   التطبيق أعلى الصفحة فكان رأس النافذة يُقصّ خلفه. التوسيط الموروث
   يعالج ذلك. */
.t4-mov{
  /* ٩٩٩٠ تحت نافذة التأكيد (.ef-overlay = ٩٩٩٨): زر «جديد» يطلب تأكيدًا
     عبر fqConfirm، ولو بقيت ٩٩٩٨ لظهرت نافذتنا فوقه فيقف المسح.
     قاعدة .ef-overlay تسبق هذه في الملف المجمَّع فيغلب المتأخّر. */
  z-index:9990;
}
/* ٤٤×٤٤ حدّ W3C الأدنى للهدف (المكوّن يعطي ٣٢): زر الإغلاق هو السبيل
   الوحيد لإغلاق هذه النافذة بطلب المستخدم، فلا يجوز أن يكون صعب
   الإصابة. ولا يمسّ هذا النوافذ الأخرى لأنها تُغلق بطرق أخرى. */
.t4-mov .ef-close{width:44px;height:44px}
`;
}

/** الجزء 2 من 6 من نصّ `getT4Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StylesPart2() {
  return `
/* ═══ النموذج — داخل النافذة ═══
   بلا خلفية ولا ظلّ ولا هامش: صندوق النافذة يوفّرها، وتكرارها يُنتج
   بطاقة داخل بطاقة.

   ═══ النطاق ‎.t4-form-win‎ لا ‎#t4Modal‎ ═══
   نافذتان تحملان هذا الصنف: نموذج F ونموذج T4 (٢٠٢٦-٠٩-٢٦). وطلب
   المستخدم أن تكون الثانية «بنفس أسلوب نافذة F»، فالقاعدة تُكتب مرّة
   واحدة لهما لا مرّتين — نسخة ثانية من قاعدة واحدة تنحرف مع الوقت
   (الدرس ١٢). والصنف غير ‎t4-mov‎ عمدًا: ذاك يحمل فرقَي المكوّن العام
   ‎.ef-*‎ ولا يُخلط به شكلُ الحقول. */
.t4-form-win .t4-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.t4-form-win .t4-rel{position:relative}
.t4-form-win .t4-lb{flex:0 0 84px;font-size:13px;color:var(--muted,#64748b)}
.t4-form-win .t4-in{flex:1;min-width:0;padding:8px 10px;font-size:15px;
  border:1px solid var(--line,#e2e8f0);border-radius:8px;background:transparent;
  color:inherit;font-family:inherit}
.t4-form-win .t4-in:focus{outline:none;border-color:#2563eb}
.t4-form-win .t4-dd{position:absolute;top:100%;inset-inline-start:94px;
  inset-inline-end:0;z-index:40;display:none;max-height:220px;overflow:auto;
  background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);
  border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.14)}
.t4-form-win .t4-dd.open{display:block}
.t4-form-win .t4-dd-item{display:flex;justify-content:space-between;gap:10px;
  padding:9px 11px;cursor:pointer;border-bottom:1px solid var(--line,#eef2f7)}
.t4-form-win .t4-dd-item:last-child{border-bottom:none}
.t4-form-win .t4-dd-item:active{background:rgba(37,99,235,.10)}
.t4-form-win .t4-dd-code{font-weight:700;font-size:14px}
.t4-form-win .t4-dd-dest{font-size:12px;color:var(--muted,#64748b)}
/* min-height على أزرار الحالة والأفعال: ٤٤ حدّ W3C الأدنى للهدف */
.t4-form-win .t4-st-group{display:flex;gap:8px}
.t4-form-win .t4-st{font-size:22px;line-height:1;min-height:44px;padding:6px 12px;
  cursor:pointer;border:2px solid transparent;border-radius:10px;
  background:rgba(0,0,0,.04)}
.t4-form-win .t4-st.on{border-color:#2563eb;background:rgba(37,99,235,.12)}
`;
}

/** الجزء 3 من 6 من نصّ `getT4Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StylesPart3() {
  return `
/* ═══ أزرار الأفعال — شكل أزرار تيوب القائمة نفسه ═══
   طلب المستخدم ٢٠٢٦-٠٩-٢٦: «يوجد استايل أزرار في تيوب القائمة، وحّد هذا
   الشكل على تيوب T4 ونموذج T4». فالشكل ليس مكتوبًا هنا من جديد: الأزرار
   تحمل ‎.fqa-btn‎ نفسه الذي تحمله أزرار حفظ وتحديث وحذف في القائمة
   الجانبية، وقاعدته في ‎fq_styles‎ وحدها. ونسخةٌ ثانية من قاعدة واحدة
   تنحرف مع الوقت (الدرس ١٢).

   وما يُكتب هنا ثلاثة لا غير: اللون المميّز لكل زر، والحدّ ٤٤ بكسلًا
   (حدّ W3C الأدنى للهدف — والقاعدة العامة أقلّ منه لأن أزرار القائمة
   داخل قائمة لا تحت الإبهام)، والهامش. والملف يأتي بعد ‎fq_styles‎ في
   التجميع، فما هنا يغلب ما هناك عند التعارض.

   واختيار «جديد» أيقونةَ سلّة لا علامةَ زائد مقصود: الزر يمسح مخرجات
   الجميع من القاعدة، والاسم وحده لا يقول ذلك. */
.t4-form-win .fq-actions-bar,#t4Panel .fq-actions-bar{gap:8px}
.t4-form-win .fqa-btn,#t4Panel .fqa-btn{min-height:44px}
/* زرّا الأسفل في النافذتين نصفان، و«إرسال إلى واتساب» لا يلتفّ في سطرين
   فيطول أحد الزرّين. والنطاق ‎.t4-form-win‎ لا ‎#wlModal‎ منذ ٢٠٢٦-٠٩-٢٧:
   صار للنافذتين زرّا مشاركة لا لواحدة، فقاعدة واحدة لهما لا نسختان. */
.t4-form-win .fqa-btn{padding:10px 4px;white-space:nowrap}
.t4-form-win .fq-actions-bar{margin-top:4px}
#t4Panel .t4-out-btns{margin:0 12px 14px}
/* زرّان في السطر لا أربعة: قسم مخرجات T4 يحمل تعديل وجديد ونسخ وواتساب،
   وأربعتها في سطر واحد تُقصّ أسماءها. والأساس ٤٠٪ لا ٥٠٪ ليتّسع الفاصل. */
#t4Panel .t4-out-btns .fqa-btn{flex:1 1 40%}
.t4-form-win .fqa-ic,#t4Panel .fqa-ic{display:inline-flex}
.t4a-edit{border-color:#2563eb;color:#2563eb}
.t4a-new{border-color:#E50914;color:#E50914}
.t4a-copy{border-color:#16a34a;color:#16a34a}
.t4a-wa{border-color:#25D366;color:#25D366}
/* ═══ اللون يقول ما حدث (طلب المستخدم ٢٠٢٦-٠٩-٢٦) ═══
   أخضر إن نجح الفعل، أحمر إن أخفق، ثم يعود الزر إلى لونه. وصنفان
   معًا في المُحدِّد فيغلبان لون الزر مهما كان ترتيب القواعد. ومعهما
   خلفية خفيفة لا لون نصٍّ فحسب: من لا يميّز الأحمر من الأخضر يرى
   امتلاء الزر. والرسالة الخاطفة تبقى هي الناطقة بالسبب. */
.fqa-btn.t4a-ok{border-color:#16a34a;color:#16a34a;background:rgba(22,163,74,.12)}
.fqa-btn.t4a-bad{border-color:#E50914;color:#E50914;background:rgba(229,9,20,.10)}
`;
}

/** الجزء 4 من 6 من نصّ `getT4Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StylesPart4() {
  return `
/* ═══ قسم مخرجات نموذج F يُطوى (طلب المستخدم ٢٠٢٦-٠٩-٢٦) ═══
   «اجعله مخفيًّا، وعند الضغط عليه يظهر، وعند الضغط مرّة أخرى يختفي، كي
   لا يأخذ مساحة بلا فائدة». فالمطويّ هو الأصل: الجسم ‎display:none‎ بلا
   صنف، والصنف ‎open‎ هو ما يُظهره — فلو تعطّلت الشيفرة بقي مطويًّا كما
   طلب لا مفتوحًا على خلاف طلبه.

   والسهم والدوران من ‎.flist-toggle‎ في القائمة الجانبية نفسها، فالطيّ
   في هذا المشروع يبدو واحدًا أينما كان. */
#t4Panel .t4-sec-hd{cursor:pointer;-webkit-user-select:none;user-select:none}
#t4Panel .t4-sec-hd:active{opacity:.6}
#t4Panel .t4-sec-arrow{transition:transform .2s;font-size:.7rem}
#t4Panel .t4-sec.open .t4-sec-arrow{transform:rotate(90deg)}
#t4Panel .t4-sec-body{display:none}
#t4Panel .t4-sec.open .t4-sec-body{display:block}

/* ═══ المخرجات والمحرّر — داخل اللوحة ═══ */
#t4Panel .t4-out-hd{display:flex;align-items:center;gap:8px;
  margin:14px 14px 6px;font-size:13px;color:var(--muted,#64748b)}
#t4Panel .t4-out-meta{flex:1;font-size:12px}
#t4Panel .t4-refresh{border:none;background:transparent;cursor:pointer;
  font-size:16px;color:inherit;padding:2px 6px}
#t4Panel .t4-out{margin:0 12px 14px;padding:12px 14px;min-height:60px;
  background:var(--card,#fff);border-radius:12px;white-space:pre-wrap;
  word-break:break-word;font-size:14px;line-height:1.9;direction:ltr;
  text-align:left;font-family:ui-monospace,Menlo,Consolas,monospace;
  box-shadow:0 1px 3px rgba(0,0,0,.08)}
/* مقطعٌ لا يُكسر بين فاصلين: كان BUS HLD 0 يلتفّ إلى سطرين فينقطع
   الاختصار عن رقمه (طلب المستخدم ٢٠٢٦-٠٩-٢٦). والالتفاف نفسه باقٍ —
   موضعه وحده تغيّر: عند الفاصل لا داخل المقطع. */
#t4Panel .t4-nw{white-space:nowrap}
/* لا التفاف في مخرجات T4 أصلًا: الأسطر الثلاثة تبقى ثلاثة، والخط يصغر
   بالشيفرة ليتّسع أطولها (طلب المستخدم ٢٠٢٦-٠٩-٢٦). ولنموذج F صندوقه. */
#t4Panel #wlOut{white-space:pre;overflow-x:hidden}
/* المحرّر يحلّ محلّ صندوق المخرجات في الموضع نفسه، فله هامشه نفسه
   (.t4-out: 0 12px 14px) — وإلا قفزت الأزرار تحته عند كل تبديل. */
#t4Panel .t4-editor{margin:0 12px 14px}
#t4Panel .t4-editor-hd{font-size:13px;color:var(--muted,#64748b);margin-bottom:8px}
/* التقسيم والاتجاه كصندوق المخرجات: مجموعة لكل رحلة، عنوانها بالخط
   والاتجاه نفسيهما (ltr وخط ثابت العرض)، فالسطر يُقرأ في الوضعين
   بالتسلسل نفسه: الرقم ثم الوقت ثم الوجهة ثم العدد ثم الحالة. */
#t4Panel .t4-egroup{margin-bottom:14px}
#t4Panel .t4-egroup:last-child{margin-bottom:0}
#t4Panel .t4-ehead{direction:ltr;text-align:left;font-size:14px;font-weight:700;
  line-height:1.9;margin-bottom:6px;
  font-family:ui-monospace,Menlo,Consolas,monospace}`;
}

/** الجزء 5 من 6 من نصّ `getT4Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StylesPart5() {
  return `
#t4Panel .t4-erow{direction:ltr;display:flex;flex-wrap:wrap;gap:6px;align-items:center;
  padding:9px 10px;margin-bottom:8px;background:var(--card,#fff);
  border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
#t4Panel .t4-ein{width:78px;padding:6px 8px;font-size:13px;
  border:1px solid var(--line,#e2e8f0);border-radius:6px;background:transparent;
  color:inherit;font-family:inherit}
#t4Panel .t4-ein.t4-ewide{width:104px}
#t4Panel .t4-ein.t4-enarrow{width:58px}
#t4Panel .t4-esel{padding:6px 4px;font-size:15px;border-radius:6px;
  border:1px solid var(--line,#e2e8f0);background:transparent;color:inherit}
#t4Panel .t4-ebtn{border:none;border-radius:6px;
  padding:6px 10px;font-size:12px;font-weight:600;color:#fff;cursor:pointer;
  font-family:inherit}
/* الحقول مفتوحة منذ فتح اللوحة، ولم يبقَ على السطر إلا «حذف» فيُزاح
   إلى طرفه. واتجاه السطر ltr فطرفه يمينه. */
#t4Panel .t4-edel{background:#dc2626;margin-inline-start:auto}
/* الحالة الثالثة: محفوظ عندي ولم يصل القاعدة بعد.
   إطار برتقالي يميّزه عن الأزرق (تحت التعديل) وعن السطر العادي بلا إطار،
   وكلمة مكتوبة معه لأن اللون وحده لا يقرؤه من لا يميّز الألوان.
   صنف واحد بلا مكوّن جديد: العلامة من ::after لا من عنصر يُضاف ويُحذف. */
#t4Panel .t4-erow.t4-pending{box-shadow:0 0 0 2px #f59e0b inset}
#t4Panel .t4-erow.t4-pending::after{
  content:"قيد الإرسال";direction:rtl;
  width:100%;order:99;
  font-size:11px;font-weight:700;color:#b45309}
#t4Panel .t4-empty{color:var(--muted,#94a3b8);font-size:13px}
/* ═══ نموذج T4 — ما يخصّه وحده ═══
   العلامة الثانية بجانب الأولى (طلب المستخدم ٢٠٢٦-٠٩-٢٦: «بجانب علامة F
   عائمة»). الإزاحة ٨٤ = ١٦ حافةً + ٥٦ قطرَ علامة F + ١٢ فاصلًا، فلا
   تتراكبان. واللون يفرّقها عن الحمراء: دائرتان حمراوان متجاورتان لا
   يميّزهما الإصبع. والقياس هو القياس نفسه، فهي ترث ‎.t4-fab‎ كاملةً. */
.wl-fab{right:84px;background:#1D4ED8;font-size:19px;letter-spacing:.5px}
`;
}

/** الجزء 6 من 6 من نصّ `getT4Styles()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getT4StylesPart6() {
  return `
/* ═══ نافذة T4: الاسم فوق الحقل لا بجانبه، وحقلان في السطر ═══
   اختيار المستخدم ٢٠٢٦-٠٩-٢٦ لتقليل الفراغ: التاريخ منفردًا، ثم الرحلة مع
   الوقت، ثم الوجهة مع العدد، ثم الحالات، ثم النسخ مع الواتساب. والاسم فوق
   حقله لأن نصف العرض لا يتّسع لاسمٍ بجانب حقل. ‎align-items:end‎ يُبقي
   الحقلين على خطٍّ واحد لو التفّ اسم أحدهما في سطر إضافي. */
#wlModal .wl-cell{display:flex;flex-direction:column;gap:4px;min-width:0}
#wlModal .wl-solo{margin-bottom:10px}
#wlModal .wl-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;
  align-items:end;margin-bottom:10px}
#wlModal .t4-lb{flex:none;line-height:1.3}
#wlModal .wl-lb2{display:block;font-size:10px;opacity:.85;font-weight:400}
/* القائمة المنسدلة تمتدّ بعرض الزوج كلّه لا بعرض نصفه: نصف العرض يقطع
   اسم الوجهة. وتنزل تحت الزوج فلا تغطّي حقلَي الرحلة والوقت وهما مكتوبان. */
#wlModal .t4-dd{inset-inline-start:0;inset-inline-end:0}
/* ست حالات نصّية تملأ العرض في سطر واحد: القياس بيّن أن «HLD-WL» كان ينزل
   وحده في سطر كامل لنقص بكسرين، فضاق الحشو والفاصل. وتلتفّ عند الضيق
   الشديد، وكل زرّ يتمدّد فلا يبقى فراغٌ في آخر السطر. */
#wlModal .t4-st-group{flex-wrap:wrap;gap:5px}
#wlModal .t4-st{flex:1 1 auto;font-size:13px;font-weight:700;padding:6px 5px}

/* قسم مخرجات نموذج T4 داخل اللوحة نفسها: خطّ فاصل يفصله عمّا فوقه، فلا
   يلتبس صندوقان متجاوران بصندوق واحد. وحقل التاريخ في المحرّر أعرض من
   بقية الحقول لأن iOS يعرض فيه تاريخًا كاملًا لا رقمًا. */
#t4Panel .wl-sec{border-top:1px solid var(--line,#e2e8f0);margin-top:4px;padding-top:10px}
#t4Panel .t4-ein.wl-edate{width:122px}
`;
}

module.exports = Object.freeze({ getT4Styles });
