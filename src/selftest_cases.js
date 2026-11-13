// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: vial;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: selftest_cases.js

/**
 * @module selftest_cases
 * @description حالات الاختبار المشتركة بين الحاسوب والجهاز — مرة واحدة لا نسختين.
 *
 * ═══ المفصل ═══
 * الحالات لا تعرف أين تعمل. كل حالة تأخذ `env` بعنصرين فقط:
 *   env.load(name)         → ما يُرجعه `importModule(name)` (الوثائق: يُرجع `module.exports`)
 *   env.evalBrowser(code)  → وعد بقيمة آخر تعبير في `code` داخل محرّك المتصفح
 * وله مهايئان:
 *   الحاسوب: `tools/test/harness.js` — محمِّل `new Function` و`vm` في Node (V8).
 *   الجهاز: `src/selftest.js` — `importModule` الحقيقي و`WebView.evaluateJavaScript`،
 *           فتجري الحالات نفسها على JavaScriptCore وعلى محرّك WebView الحقيقيين.
 *
 * ═══ قيود الكتابة هنا ═══
 * - ES6 مع `async/await` فقط (حارس المستوى في `npm run syntax` يرفض ما بعده).
 *   و`async/await` لم تردا في صفحات الوثائق التي فُتحت (البند ٦ من القيد)؛
 *   استعمالهما بقرار المشروع المعتمد على تجربة المطوّرين لا على نص رسمي.
 * - لا دوال أحدث من ES2015 (`includes`، `padStart`، `Object.entries`…): `lib: ES2015`.
 * - لا واجهة من الوثائق ولا من Node — كل ما يلزم يأتي من `env`.
 * - كل توقّع مأخوذ من JSDoc الوحدة المختبَرة أو من عُرف موثّق، والمصدر بجانبه.
 * - الملف بلا البادئة `fq_` عمدًا: لا يطابق نمط النشر فلا يصل إلى أي جهاز موظف.
 */

// ════════════════════════════════════════════════
// 1. التأكيدات — واحدة للمهايئين كي لا يختلف الحكم بين المحرّكين
// ════════════════════════════════════════════════

/** يصنع أدوات التأكيد لحالة واحدة، ويعدّ ما نُفِّذ منها. */
function makeAsserts() {
  const state = { count: 0 };
  function fail(label, detail) {
    throw new Error(label + " — " + detail);
  }
  return {
    state: state,
    eq: function (actual, expected, label) {
      state.count++;
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      if (a !== e) fail(label, "المتوقَّع " + e + " والفعلي " + a);
    },
    ok: function (condition, label) {
      state.count++;
      if (condition !== true) fail(label, "الشرط لم يتحقق");
    },
  };
}

/**
 * يشغّل حالة واحدة ولا يرمي أبدًا: يُرجع النتيجة قيمةً.
 * حالة بلا تأكيد واحد تُعدّ فاشلة — الأخضر بلا تأكيد كاذب (الدرس ٤٦).
 * @param {{name: string, run: Function}} testCase
 * @param {{load: Function, evalBrowser: Function}} env
 * @returns {Promise<{name: string, ok: boolean, assertions: number, error: string}>}
 */
async function runCase(testCase, env) {
  const t = makeAsserts();
  try {
    await testCase.run(t, env);
    if (t.state.count === 0) {
      return { name: testCase.name, ok: false, assertions: 0, error: "حالة بلا تأكيد" };
    }
    return { name: testCase.name, ok: true, assertions: t.state.count, error: "" };
  } catch (e) {
    const message = (e && e.message) ? e.message : String(e);
    return { name: testCase.name, ok: false, assertions: t.state.count, error: message };
  }
}

// ════════════════════════════════════════════════
// 2. عيّنات الرحلات — تغطي المصادر الثلاثة والحروف الممنوعة والعربية
// ════════════════════════════════════════════════

const FLIGHT_SAMPLES = Object.freeze([
  { terminal: "t1", date: "2026-09-29", flt: "SV123", std: "14:30" },
  { terminal: "north", date: "2026-09-29", flt: "MS640", std: "02:05" },
  { terminal: "", date: "2026-09-29", flt: "XY1", std: "09:00" },
  { terminal: "unknown", date: "2026-09-30", flt: "PK7", std: "23:59" },
  { terminal: "t1", date: "2026-09-29", flt: "A.B#C$D[E]F/G", std: "10:00" },
  { terminal: "north", date: "٢٠٢٦-٠٩-٢٩", flt: "رحلة١٢", std: "٠٣:١٥" },
  {},
]);

// ════════════════════════════════════════════════
// 3. الحالات
// ════════════════════════════════════════════════

/**
 * الأدوار المفتوحة: كل إجراء مسموح للمطوّر وللمشرف (أمر المالك، وتأكيده ٢٠٢٦-٠٩-٢٩).
 * @param {Object} t المؤكِّدات
 * @param {Object} p وحدة fq_permissions
 * @param {string[]} actions الإجراءات كلها
 */
function checkOpenRoles(t, p, actions) {
  const closed = actions.filter(function (a) { return p.can("developer", a) !== true; });
  t.eq(closed, [], "المطوّر مسموح له بكل إجراء");
  const adminClosed = actions.filter(function (a) { return p.can("admin", a) !== true; });
  t.eq(adminClosed, [], "المشرف مسموح له بكل إجراء");
}

/**
 * قاموس الدول: الاسم والرمز من رمز المطار أو الدولة.
 * @param {Object} t المؤكِّدات
 * @param {Object} env بيئة التشغيل
 */
function checkCountries(t, env) {
  const c = env.load("fq_countries");
  t.eq(c.getCountryName("JED"), "السعودية", "من رمز المطار");
  t.eq(c.getCountryName(" sa "), "السعودية", "من رمز الدولة بأي حالة أحرف");
  t.eq(c.getCountryName("ZZZ"), "ZZZ", "المجهول يُرجع رمزه");
  t.eq(c.getCountryCode("dxb"), "AE", "رمز الدولة من المطار");
  t.eq(c.getCountryCode(""), "", "الفارغ نصّ فارغ");
}

const cases = [
  {
    // ما يعتمد عليه المشروع فوق ES6. على الجهاز هذه قياسٌ لـ JavaScriptCore
    // الحقيقي في موضع تسكت فيه الوثائق (البند ٦)، وتثبت آلية القاعدة (أ):
    // `await` داخل `try/catch` يلتقط الرفض، و`.catch()` يلتقط الوعد غير المنتظَر.
    name: "المحرّك: async/await وPromise.all والتقاط الرفض",
    run: async function (t) {
      const both = await Promise.all([Promise.resolve(1), new Promise(function (r) { r(2); })]);
      t.eq(both, [1, 2], "Promise.all يجمع النتيجتين بالترتيب");

      async function rejects() { throw new Error("مرفوض"); }
      let caught = "";
      try { await rejects(); } catch (e) { caught = e.message; }
      t.eq(caught, "مرفوض", "try/catch حول await يلتقط رفض الدالة غير المتزامنة");

      const viaCatch = await rejects().catch(function (e) { return "التُقط: " + e.message; });
      t.eq(viaCatch, "التُقط: مرفوض", ".catch() يلتقط الرفض بلا await");
    },
  },
  {
    // المصدر: JSDoc `flightKey` و`flightSource` في fq_helpers.js، والعرف ١٣.
    name: "هوية الرحلة: صيغة المفتاح <sch|t1|north>_<date>_<flt>_<std>",
    run: async function (t, env) {
      const h = env.load("fq_helpers");
      t.eq(h.flightKey(FLIGHT_SAMPLES[0]), "t1_2026-09-29_SV123_14:30", "صالة 1");
      t.eq(h.flightKey(FLIGHT_SAMPLES[1]), "north_2026-09-29_MS640_02:05", "الشمالية");
      t.eq(h.flightKey(FLIGHT_SAMPLES[2]), "sch_2026-09-29_XY1_09:00", "بلا صالة → جداول");
      t.eq(h.flightKey(FLIGHT_SAMPLES[3]), "sch_2026-09-30_PK7_23:59", "صالة مجهولة → جداول");
      t.eq(h.flightKey(FLIGHT_SAMPLES[4]), "t1_2026-09-29_A-B-C-D-E-F-G_10:00",
        "الحروف الممنوعة في فايربيس . # $ [ ] / تصير -");
      t.eq(h.flightKey(null), "sch___", "رحلة معدومة لا ترمي");
    },
  },
  {
    // المصدر: JSDoc `flightNode` و`flightNodeOfKey` و`flightNodes` و`splitByNode`،
    // و`.claude/rules/flights.md`: «مفتاح بلا بادئة مصدر لا عقدة له».
    name: "هوية الرحلة: العقد الأربع والتوزيع عليها",
    run: async function (t, env) {
      const h = env.load("fq_helpers");
      t.eq(h.flightNodes(), ["flights_sch", "flights_t1", "flights_north", "flights_hall4"], "ترتيب العقد ثابت");
      t.eq(h.flightNode(FLIGHT_SAMPLES[0]), "flights_t1", "رحلة صالة 1");
      t.eq(h.flightNode(FLIGHT_SAMPLES[2]), "flights_sch", "رحلة جداول");
      t.eq(h.flightNodeOfKey("north_2026-09-29_MS640_02:05"), "flights_north", "العقدة من المفتاح");
      t.eq(h.flightNodeOfKey("2026-09-29_SV1_10:00"), "", "المفتاح القديم بلا مصدر لا عقدة له");
      t.eq(h.flightNodeOfKey("constructor_x"), "", "اسم خاصية موروثة ليس مصدرًا");
      t.eq(h.splitByNode({ sch_a: 1, t1_b: null, north_c: 2, old_d: 3 }),
        { flights_sch: { sch_a: 1 }, flights_t1: { t1_b: null }, flights_north: { north_c: 2 } },
        "التوزيع يحفظ null ويُسقط المفتاح المجهول");
    },
  },
  {
    // المصدر: JSDoc `keepStoredKey` — يبقى المخزَّن ما لم يكن في عقدة أخرى أو محجوزًا.
    name: "هوية الرحلة: مفتاح الكتابة لمن لا يملك الحذف",
    run: async function (t, env) {
      const h = env.load("fq_helpers");
      const moved = { terminal: "t1", date: "d", flt: "F", std: "10:00", _fbKey: "t1_d_F_09:00" };
      t.eq(h.keepStoredKey(moved, {}), "t1_d_F_09:00", "يبقى المخزَّن في عقدته نفسها");
      t.eq(h.keepStoredKey(moved, { "t1_d_F_09:00": true }), "t1_d_F_10:00", "المخزَّن محجوز لسجل آخر → المحسوب");
      const otherNode = Object.assign({}, moved, { _fbKey: "north_d_F_09:00" });
      t.eq(h.keepStoredKey(otherNode, {}), "t1_d_F_10:00", "المخزَّن في عقدة أخرى → المحسوب");
    },
  },
  {
    // المصدر: «النسخة المتصفحية… مطابقة لـ flightKey أعلاه حرفيًّا» (fq_helpers.js).
    // على الجهاز تجري الجهة الأولى في JavaScriptCore والثانية في محرّك WebView.
    name: "هوية الرحلة: نسخة Scriptable مطابقة لنسخة المتصفح",
    run: async function (t, env) {
      const h = env.load("fq_helpers");
      const samples = FLIGHT_SAMPLES.slice();
      const payload = { sch_a: 1, t1_b: null, north_c: 2, old_d: 3 };
      const expected = {
        rows: samples.map(function (f) { return [h.flightKey(f), h.flightNode(f), h.flightSlot(f)]; }),
        split: h.splitByNode(payload),
        nodeOfKey: ["sch_x", "t1_x", "north_x", "old_x", "constructor_x"].map(h.flightNodeOfKey),
      };
      const code = h.getFlightKeyFn()
        + "\nJSON.stringify({"
        + "rows:" + JSON.stringify(samples)
        + ".map(function(f){return [fqFlightKey(f),fqFlightNode(f),fqFlightSlot(f)];}),"
        + "split:fqSplitByNode(" + JSON.stringify(payload) + "),"
        + "nodeOfKey:[\"sch_x\",\"t1_x\",\"north_x\",\"old_x\",\"constructor_x\"].map(fqFlightNodeOfKey)"
        + "})";
      const browser = JSON.parse(await env.evalBrowser(code));
      t.eq(browser.rows, expected.rows, "المفتاح والعقدة والموضع لكل عيّنة");
      t.eq(browser.split, expected.split, "توزيع الحمولة على العقد");
      t.eq(browser.nodeOfKey, expected.nodeOfKey, "العقدة من المفتاح");
    },
  },
  {
    // المصدر: JSDoc `can` في fq_permissions.js، و`fq_diag_state.js` (الموظف لا يحذف
    // رحلة)، وأمر المالك «لا تقيّد صلاحيات المطوّر أو المشرف» وتأكيده ٢٠٢٦-٠٩-٢٩
    // «المشرف له صلاحيات مفتوحة».
    name: "الصلاحيات: جدول مجمَّد والمطوّر والمشرف مفتوح لهما كل شيء",
    run: async function (t, env) {
      const p = env.load("fq_permissions");
      t.ok(Object.isFrozen(p.MATRIX), "MATRIX مجمَّد");
      const actions = Object.keys(p.ACTIONS).map(function (k) { return p.ACTIONS[k]; }).sort();
      t.eq(actions, Object.keys(p.MATRIX).sort(), "كل إجراء في ACTIONS له سطر في MATRIX والعكس");
      checkOpenRoles(t, p, actions);
      t.eq(p.can("employee", "delete_flight"), false, "الموظف لا يحذف رحلة");
      t.eq(p.can(undefined, "delete_flight"), false, "الدور الغائب يُعامَل موظفًا");
      t.eq(p.can("DEVELOPER", "backup_system"), true, "الدور لا يتأثر بحالة الأحرف");
      t.eq(p.can("developer", "no_such_action"), false, "الإجراء المجهول ممنوع");
    },
  },
  {
    // المصدر: JSDoc `roleLook` في fq_permissions.js، وقرار المالك ٢٠٢٦-٠٩-٣٠:
    // الموظف أزرق في كل الشاشات، والاسم واللون من مصدر واحد.
    name: "الأدوار: اسم كل دور ولونه واحد في الخلفية والصفحة",
    run: async function (t, env) {
      const p = env.load("fq_permissions");
      t.eq(p.roleLook("employee"), { label: "موظف", color: "#2563eb", tint: "rgba(37,99,235,0.12)" }, "الموظف أزرق");
      t.eq([p.roleLook("admin").label, p.roleLook("developer").label], ["مشرف", "مطوّر"], "الاسمان العربيان");
      t.eq(p.roleLook("ADMIN").label, "مشرف", "الدور لا يتأثر بحالة الأحرف");
      t.eq([p.roleLook(undefined).label, p.roleLook("constructor").label], ["موظف", "موظف"],
        "الدور الغائب أو المجهول يُعرض موظفًا كما يعامله can");
      t.eq(typeof p.isAdminOrAbove, "undefined", "لا سؤال عن اسم الدور: البوابات تسأل الجدول");
      const roles = ["developer", "admin", "employee", "ADMIN", "", "constructor"];
      const browser = JSON.parse(await env.evalBrowser(p.getPermissionsJs()
        + "\nJSON.stringify(" + JSON.stringify(roles) + ".map(roleLook))"));
      t.eq(browser, roles.map(p.roleLook), "نسخة الصفحة مطابقة لنسخة الخلفية");
    },
  },
  {
    // المصدر: JSDoc `makeMonitorSafeId` («معرّف صالح لمسار Firebase») و`getForbiddenMonitorFields`
    // («أسماء الحقول التي لا تدخل سجل الرصد») في fq_monitor_base.js. حلّت محلّ حالة
    // نموذج الرصد القديم بعد نقله إلى attic في ٢٠٢٦-٠٩-٣٠: لم يكن النظام يستعمله.
    name: "الرصد: المعرّف الآمن والحقول الممنوعة",
    run: async function (t, env) {
      const b = env.load("fq_monitor_base");
      t.eq(b.makeMonitorSafeId("a.b/c#d$e"), "a-b-c-d-e", "رموز مسار فايربيس تصير -");
      t.eq([b.makeMonitorSafeId(null), b.makeMonitorSafeId(undefined), b.makeMonitorSafeId("")],
        ["unknown", "unknown", "unknown"], "المعدوم والفارغ unknown");
      let long = "";
      for (let i = 0; i < 200; i++) long += "x";
      t.eq(b.makeMonitorSafeId(long).length, 120, "المعرّف لا يتجاوز ١٢٠ حرفًا");
      const fields = b.getForbiddenMonitorFields();
      t.eq(["password", "idToken", "refreshToken", "authorization"]
        .filter(function (f) { return fields.indexOf(f) < 0; }), [], "كلمة المرور والرموز ممنوعة");
      fields.push("zz_injected");
      t.eq(b.getForbiddenMonitorFields().indexOf("zz_injected"), -1, "القائمة تُعطى نسخةً لا تُفسد الأصل");
    },
  },
  {
    // المصدر: JSDoc `redactMonitorText` — أربع صيغ وحدّ ٨٠٠٠ حرف.
    name: "الرصد: حجب الأسرار من النص",
    run: async function (t, env) {
      const r = env.load("fq_monitor_base");
      t.eq(r.redactMonitorText("Bearer abc.def-1"), "Bearer [REDACTED]", "ترويسة Bearer");
      // التوثيق يعد بالحجب لا بشكل الناتج: `authorization` نفسه اسم سرّ فتُحجب
      // الكلمة التي بعده أيضًا. فالمؤكَّد غياب الرمز لا نصّ الناتج.
      t.eq(r.redactMonitorText("Authorization: Bearer abc.def-1").indexOf("abc.def-1"), -1,
        "الرمز لا يبقى في ترويسة Authorization");
      t.eq(r.redactMonitorText("{\"password\":\"x1\"}"), "{\"password\":\"[REDACTED]\"}", "قيمة JSON مقتبسة");
      t.eq(r.redactMonitorText("apiKey=zzz, next"), "apiKey=[REDACTED], next", "قيمة حرة بعد =");
      t.eq(r.redactMonitorText("u?auth=TOKEN&x=1"), "u?auth=[REDACTED]&x=1", "بارامتر auth");
      t.eq(r.redactMonitorText(null), "", "المعدوم نصّ فارغ");
      let long = "";
      for (let i = 0; i < 9000; i++) long += "a";
      t.eq(r.redactMonitorText(long).length, 8000, "الحد ٨٠٠٠ حرف");
    },
  },
  {
    // المصدر: JSDoc `getStatusLabel` و`SITE_STATUSES` و`getCountryName` و`getCountryCode`.
    name: "القواميس: حالة الرحلة والدول",
    run: async function (t, env) {
      const s = env.load("fq_enum_status");
      t.eq(s.getStatusLabel("canceled"), "ملغية", "ملغية");
      t.eq(s.getStatusLabel(" delayed "), "متأخرة", "المفتاح يُقصّ من المسافات");
      t.eq(s.getStatusLabel("x"), "", "المفتاح المجهول نصّ فارغ");
      t.eq(s.SITE_STATUSES.slice(), ["canceled", "delayed"], "حالتا الموقع وحدهما");
      t.eq(s.SITE_STATUSES.filter(function (k) { return !s.getStatusLabel(k); }), [], "لكل حالة موقع تسمية");
      checkCountries(t, env);
    },
  },
];

/** مدير ملفات في الذاكرة بالدوال التي يناديها المسجِّل المحلي وحدها. */
function memoryFileManager(memory) {
  return {
    documentsDirectory: function () { return "/test"; },
    joinPath: function (a, b) { return a + "/" + b; },
    isDirectory: function () { return true; },
    fileExists: function (name) { return Object.prototype.hasOwnProperty.call(memory, name); },
    createDirectory: function () {},
    listContents: function () { return Object.keys(memory).map(function (name) { return name.split("/").pop(); }); },
    writeString: function (name, value) { memory[name] = value; },
    readString: function (name) { return memory[name]; },
    fileSize: function (name) { return memory[name].length * 3 / 1024; },
    remove: function (name) { delete memory[name]; },
  };
}

/** الدفعة تُحفظ مرة واحدة ولو أُعيدت، والنص المكتوب لا يُحفظ. */
function checkLocalSavedOnce(t, recorder, clock) {
  const batch = { batchId: "test-one", events: [{ eventId: "one", occurredAt: clock.now, kind: "interaction", action: "input", length: 6, value: "TEXT_NOT_TO_SAVE" }] };
  t.eq(recorder.ingest(batch).ok, true, "الدفعة تحفظ وتؤكد");
  t.eq(recorder.ingest(batch).ok, true, "إعادة الدفعة آمنة");
  t.eq(recorder.readReport().events.length, 1, "لا تكرار للحدث");
  t.eq(JSON.stringify(recorder.readReport()).indexOf("TEXT_NOT_TO_SAVE"), -1, "النص المكتوب غير محفوظ");
}

/** الحدث يبقى يومين إلا جزءًا من الثانية، ويُحذف عند تمامهما، والسجل لا يُرفع. */
function checkLocalRetention(t, recorder, clock) {
  clock.now += 48 * 60 * 60 * 1000 - 1;
  t.eq(recorder.readReport().events.length, 1, "لا حذف مبكر");
  clock.now++;
  t.eq(recorder.readReport().events.length, 0, "الحذف بعد يومين كاملين");
  t.eq(recorder.readReport().uploadEnabled, false, "السجل لا يرفع للشبكة");
}

cases.push({
  name: "التقرير المحلي: تأكيد الحفظ والاحتفاظ يومين دون النص المكتوب",
  run: async function (t, env) {
    const mod = env.load("fq_monitor_local");
    const clock = { now: 1000000 };
    const recorder = mod.createRecorder({ fm: memoryFileManager({}), now: function () { return clock.now; }, uuid: function () { return "device-test"; } });
    recorder.start({ empId: "TEST" });
    checkLocalSavedOnce(t, recorder, clock);
    checkLocalRetention(t, recorder, clock);
  },
});

cases.push({
  name: "التقرير المحلي: كود الصفحة يقيم ويؤكد الدفعة دون مسح الحدث الجديد",
  run: async function (t, env) {
    const code = env.load("fq_monitor_local_web").getLocalCaptureCode({ sessionId: "device-test" });
    // بدائل تُسند إلى الكائن العام عند غياب الواجهة وحدها، فلا تحجب واجهة الصفحة الحقيقية ولا تُعلن اسمًا.
    const prelude = "if(typeof document==='undefined')this.document={addEventListener:function(){},getElementById:function(){return {textContent:''};}};if(typeof addEventListener==='undefined')this.addEventListener=function(){};if(typeof EventTarget==='undefined'){this.EventTarget=function(){};EventTarget.prototype.addEventListener=function(){};EventTarget.prototype.removeEventListener=function(){};}";
    const check = "fqLocalPush('interaction',{action:'input',length:3});const a=fqLocalTakeBatch();fqLocalPush('interaction',{action:'click'});const same=fqLocalTakeBatch().batchId===a.batchId;const ack=fqLocalAcknowledge(a.batchId);JSON.stringify({same:same,ack:ack,remaining:FQ_LOCAL_EVENTS.length})";
    const result = JSON.parse(await env.evalBrowser(prelude + code + check));
    t.eq(result, { same: true, ack: true, remaining: 1 }, "إعادة الدفعة ثابتة والتأكيد لا يمس الحدث اللاحق");
  },
});

module.exports = Object.freeze({ cases: Object.freeze(cases), runCase });
