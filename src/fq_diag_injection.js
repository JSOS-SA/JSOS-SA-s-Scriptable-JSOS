// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: stethoscope;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_diag_injection.js

/**
 * @module fq_diag_injection
 * @description أداة اختبار حقن الويب — تقيّم مخرجات get*Code ثم تفحص التحليل.
 * تشغيلها من سكربتابل لا يمسّ القاعدة ولا يكتب ملفات نظام.
 *
 * ماذا تفحص:
 * 1) استدعاء دالة الحقن (بعد تقييم القالب داخل الوحدة)
 * 2) محاولة تحليل النص الناتج كدالة (خطأ التحليل يظهر هنا)
 * 3) بحث أنماط خطرة شائعة بعد الفك (مثل replace(//)
 */

// حُذف المدخل «الرصد» في ٢٠٢٦-٠٩-٢٥ بقرار المالك: كان يشير إلى
// `fq_monitor_view` — شاشة الرصد القديمة التي حلّت محلّها
// `fq_monitor_v2_view_*`. لم يكن `fq_main` يستوردها ولا أحد يستدعي
// دوالها الثلاث، فكانت شيفرة ميتة تُنشَر إلى كل جهاز، وفيها ثغرة XSS.
// وكان هذا المدخل مرجعها الوحيد في المستودع.
const CHECKS = [
  {
    label: "فايربيس واجهة",
    module: "fq_firebase_webview",
    fn: "getFirebaseCode",
  },
  {
    label: "الصلاحيات",
    module: "fq_permissions",
    fn: "getPermissionsJs",
  },
  {
    label: "التنبيهات",
    module: "fq_toast",
    fn: "getToastCode",
  },
];

/**
 * يحاول تحليل النص المحقون دون تنفيذه.
 * @param {string} code
 * @returns {{ ok: boolean, error: string }}
 */
function tryParseInjected(code) {
  if (typeof code !== "string" || !code.length) {
    return { ok: false, error: "نص فارغ أو غير نصي" };
  }
  try {
    // Function constructor = تحليل فقط عند الإنشاء؛ لا تشغيل لمنطق الصفحة
    // eslint-disable-next-line no-new-func
    new Function(code);
    return { ok: true, error: "" };
  } catch (e) {
    const msg = (e && e.message) ? String(e.message) : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * أنماط تدل على هروب ناقص بعد فك القالب.
 * @param {string} code
 * @returns {string[]}
 */
function findDangerPatterns(code) {
  const hits = [];
  if (code.indexOf("replace(//") !== -1) {
    hits.push("replace(// — تعليق ابتلع بقية السطر");
  }
  if (code.indexOf("replace(/[.#$[]/") !== -1) {
    hits.push("تعبير نمطي مكسور بعد فك القالب");
  }
  return hits;
}

function _errorText(error) {
  return (error && error.message) ? String(error.message) : String(error);
}

// نتيجة فحص بلا نصّ مولَّد؛ ومن يملك النصّ يضع حجمه في bytes بعدها.
function _checkResult(item, status, detail) {
  return {
    label: item.label,
    status: status,
    detail: detail,
    bytes: 0,
  };
}

function _loadCheckModule(item) {
  try {
    return { ok: true, module: importModule(item.module) };
  } catch (error) {
    return {
      ok: false,
      result: _checkResult(item, "فشل استيراد", _errorText(error)),
    };
  }
}

function _generateCheckCode(item, mod) {
  if (!mod || typeof mod[item.fn] !== "function") {
    return {
      ok: false,
      result: _checkResult(item, "لا دالة", `${item.fn} غير مُصدَّرة`),
    };
  }
  try {
    return { ok: true, code: mod[item.fn]() };
  } catch (error) {
    return {
      ok: false,
      result: _checkResult(item, "فشل توليد", _errorText(error)),
    };
  }
}

/**
 * @param {{ label: string, module: string, fn: string }} item
 * @returns {Promise<{ label: string, status: string, detail: string, bytes: number }>}
 */
async function runOne(item) {
  const loaded = _loadCheckModule(item);
  if (!loaded.ok) return loaded.result;

  const generated = _generateCheckCode(item, loaded.module);
  if (!generated.ok) return generated.result;

  const code = generated.code;
  const verdict = _judgeCode(code);
  const result = _checkResult(item, verdict.status, verdict.detail);
  result.bytes = typeof code === "string" ? code.length : 0;
  return result;
}

/**
 * حكم النصّ المولَّد: يُحلَّل أولًا، ولا يُبحث عن الأنماط الخطرة إلا في نصّ تحلّل.
 * @param {*} code
 * @returns {{ status: string, detail: string }}
 */
function _judgeCode(code) {
  const parsed = tryParseInjected(code);
  if (!parsed.ok) return { status: "خطأ تحليل", detail: parsed.error };
  const danger = findDangerPatterns(code);
  if (danger.length) return { status: "تحذير نمط", detail: danger.join("؛ ") };
  return { status: "سليم", detail: "تحليل ناجح" };
}

/** سطر الوحدة في التقرير، وسطر السبب تحته إن لم تكن سليمة. */
function _pushResultLines(lines, r) {
  const mark = r.status === "سليم" ? "✅" : "❌";
  lines.push(mark + " " + r.label + " — " + r.status + " (" + r.bytes + " بايت)");
  if (r.detail && r.status !== "سليم") {
    lines.push(`   ← ${r.detail}`);
  }
}

/** الخلاصة: كل الوحدات سليمة أو عددُ ما يحتاج إصلاحًا، ثم حدّ الفحص. */
function _pushSummary(lines, failed) {
  lines.push("");
  if (failed === 0) {
    lines.push("النتيجة: كل وحدات الحقن المفحوصة قابلة للتحليل.");
  } else {
    lines.push(
      "النتيجة: " +
        failed +
        " وحدة تحتاج إصلاحًا قبل التشغيل — لا تعتمد على الواجهة حتى تُصلح."
    );
  }
  lines.push("");
  lines.push("ملاحظة: هذا الفحص لا يغني عن تجربة التيوبات على الجهاز،");
  lines.push("لكنه يكشف خطأ التحليل الذي يُسقط الكتلة كلها قبل التنفيذ.");
}

async function main() {
  const lines = ["═══ اختبار حقن الويب ═══", new Date().toISOString(), ""];
  let failed = 0;
  for (let i = 0; i < CHECKS.length; i++) {
    const r = await runOne(CHECKS[i]);
    if (r.status !== "سليم") failed++;
    _pushResultLines(lines, r);
  }
  _pushSummary(lines, failed);
  await _presentInjectionReport(lines.join("\n"), failed);
}

/** يطبع التقرير في السجلّ ويعرضه بعنوان يقول هل الحقن سليم. */
async function _presentInjectionReport(text, failed) {
  console.log(text);
  const a = new Alert();
  a.title = failed === 0 ? "حقن سليم" : "حقن به خلل";
  a.message = text;
  a.addAction("حسنًا");
  await a.present();
}

// ═══ نقطة الدخول — حراسة الوعد في المستوى الأعلى (نمط fq_widget.run) ═══
try {
  await main();
} catch (error) {
  const message = (error && error.message) || String(error);
  console.error(`[fq_diag_injection] خطأ غير معالج: ${message}`);
  const alert = new Alert();
  alert.title = "توقف فحص الحقن";
  alert.message = message;
  alert.addAction("حسنًا");
  await alert.present();
} finally {
  Script.complete();
}
