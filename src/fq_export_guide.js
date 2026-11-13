// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: file-export;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_export_guide.js

// ═══ وحدة تصدير دليل التسجيل كملف HTML مستقل ═══

const guide = importModule("fq_guide");

// ═══ توليد ملف HTML مستقل ═══
/**
 * يبني HTML مستقلاً لتصدير الدليل.
 * @param {string} guideContentHtml - محتوى الدليل
 * @returns {string}
 */
function buildStandaloneHtml(guideContentHtml) {
  const css = guide.getGuideStyles();

  const html = [
    '<!DOCTYPE html>',
    '<html lang="ar" dir="rtl">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">',
    '<style>',
    '*{margin:0;padding:0;box-sizing:border-box}',
    ':root{',
    '  --bg:#fafafa;--s1:#ffffff;--s2:#ffffff;--bd:#e5e5e5;',
    '  --ac:#E50914;--ac2:#C1111A;--tx:#1a1a1a;',
    '  --t2:#555555;--ok:#16a34a;--am:#ca8a04;',
    '  --r:4px;--sh:0 2px 8px rgba(0,0,0,0.08);',
    '}',
    'body{',
    '  background:var(--bg);color:var(--tx);',
    '  font-family:"Tajawal",sans-serif;',
    '  font-size:14px;line-height:1.6;',
    '  padding:20px 16px;direction:rtl;',
    '}',
    '.hd{text-align:center;padding:12px 16px;margin-bottom:16px}',
    '.hd p{color:var(--t2);font-size:.82rem}',
    css,
    '.gd-card,.gd-flow,.gd-night,.gd-step,.gd-alert,.gd-timebar{',
    '  break-inside:avoid;page-break-inside:avoid;',
    '}',
    '.gd-toolbar{display:none!important}',
    '.gd-toast{display:none!important}',
    '</style>',
    '</head>',
    '<body>',
    '<div class="hd">',
    '  <p>دليل تسجيل بيانات الحافلات — خطوة بخطوة</p>',
    '</div>',
    guideContentHtml,
    '</body>',
    '</html>'
  ].join("\n");

  return html;
}

// ═══ تصدير ومشاركة ═══
function _readSavedGuideContent(fm) {
  try {
    const path = fm.joinPath(fm.documentsDirectory(), "fq_guide_data.json");
    if (!fm.fileExists(path)) return "";

    const parsed = JSON.parse(fm.readString(path));
    return parsed && parsed.html && parsed.html.length > 10 ? parsed.html : "";
  } catch (error) {
    console.warn(`[fq_export_guide] Guide data read failed: ${error.message}`);
    return "";
  }
}

function _extractDefaultGuideContent() {
  const defaultHtml = guide.getGuideHtml();
  const sectionStart = defaultHtml.indexOf('<!-- ═══ القسم 1');
  const sectionEnd = defaultHtml.lastIndexOf('</div>\n\n</div>');
  if (sectionStart > -1 && sectionEnd > -1) {
    return defaultHtml.substring(sectionStart, sectionEnd);
  }
  return _extractGdContent(defaultHtml);
}

/** الاحتياط حين لا علامة للقسم الأول: ما داخل حاوية `gdContent`. */
function _extractGdContent(defaultHtml) {
  const startTag = '<div id="gdContent">';
  let start = defaultHtml.indexOf(startTag);
  if (start < 0) return "";

  start += startTag.length;
  const end = defaultHtml.indexOf('</div>\n\n</div>\n</div>', start);
  return defaultHtml.substring(start, end > -1 ? end : defaultHtml.length - 30);
}

function _resolveGuideContent(fm, guideHtml) {
  if (guideHtml && guideHtml.length > 10) return guideHtml;
  const saved = _readSavedGuideContent(fm);
  return saved && saved.length > 10 ? saved : _extractDefaultGuideContent();
}

// `padStart` من ECMAScript 2017، ووثائق Scriptable تضمن ES6 وحده:
// «JavaScriptCore, which supports ECMAScript 6». <https://docs.scriptable.app/>
function _pad2(value) {
  let out = String(value);
  while (out.length < 2) out = "0" + out;
  return out;
}

function _buildGuideFileName(now) {
  const timestamp = now.getFullYear() + "-" +
    _pad2(now.getMonth() + 1) + "-" +
    _pad2(now.getDate()) + "_" +
    _pad2(now.getHours()) + "-" +
    _pad2(now.getMinutes());
  return `دليل_التسجيل_${timestamp}.html`;
}

/**
 * يصدّر دليل التسجيل ملفّ HTML مستقلًّا في المجلد المؤقّت، ويعرض نافذة المشاركة.
 * @param {string} guideHtml محتوى الدليل
 * @returns {Promise<string>} اسم الملف المصدَّر
 */
async function exportHtml(guideHtml) {
  const fm = FileManager.local();
  const content = _resolveGuideContent(fm, guideHtml);
  const fullHtml = buildStandaloneHtml(content);
  const fileName = _buildGuideFileName(new Date());
  const filePath = fm.joinPath(fm.temporaryDirectory(), fileName);
  fm.writeString(filePath, fullHtml);
  await ShareSheet.present([filePath]);
  return fileName;
}

module.exports = Object.freeze({ exportHtml, buildStandaloneHtml });
