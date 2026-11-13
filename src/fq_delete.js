// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: light-gray;
// icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_delete.js
const localDiagnostics = importModule("fq_monitor_local");
localDiagnostics.start({});

const fm = FileManager.local()
const scriptsDir = fm.documentsDirectory()
const allFiles = fm.listContents(scriptsDir)
const scripts = allFiles.filter(f => f.endsWith(".js")).sort()

async function _showNoDeleteScripts() {
  const alert = new Alert()
  alert.title = "‏لا توجد سكربتات"
  alert.message = "‏لم يُعثر على أي ملف جافا سكرِبت في مجلد سكرِبتابل"
  alert.addCancelAction("‏حسنًا")
  await alert.present()
}

function _deleteDateText(date) {
  if (!date) return ""
  // `padStart` من ECMAScript 2017، ووثائق Scriptable تضمن ES6 وحده:
  // «JavaScriptCore, which supports ECMAScript 6». <https://docs.scriptable.app/>
  const pad = value => {
    let out = String(value)
    while (out.length < 2) out = "0" + out
    return out
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// عدد الأسطر والحروف؛ وصفر لكليهما إن تعذّرت القراءة أو كان الملف فارغًا.
function _readContentStats(path) {
  const stats = { lineCount: 0, charCount: 0 }
  try {
    const content = fm.readString(path)
    if (content) { stats.lineCount = content.split("\n").length; stats.charCount = content.length }
  } catch (error) { console.warn(`[fq_delete] read error: ${error.message}`) }
  return stats
}

// تاريخ آخر تعديل، أو null إن تعذّرت قراءته.
function _readModDate(path) {
  try { return fm.modificationDate(path) }
  catch (error) {
    console.warn(`[fq_delete] date error: ${error.message}`)
    return null
  }
}

function _readDeleteScriptInfo(name) {
  const path = fm.joinPath(scriptsDir, name)
  const stats = _readContentStats(path)
  const modDate = _readModDate(path)
  return {
    name: name, displayName: name.replace(".js", ""), lineCount: stats.lineCount,
    charCount: stats.charCount, modDate: _deleteDateText(modDate), path: path,
  }
}

function _collectDeleteScriptData() {
  return scripts.map(_readDeleteScriptInfo)
}

/**
 * يبني HTML نافذة حذف الرحلة.
 * @returns {string}
 */
function _buildDeleteHtml(items) {
    let listHtml = ""
    for (let i = 0; i < items.length; i++) {
      const s = items[i]
      listHtml += `
      <div class="item" data-index="${i}" onclick="toggleItem(this)">
        <div class="checkbox" id="cb-${i}"></div>
        <div class="info">
          <div class="name">${s.displayName}</div>
          <div class="meta">${s.lineCount} ‏سطر · ${s.charCount.toLocaleString()} ‏حرف · ${s.modDate}</div>
        </div>
      </div>`
    }

    return _buildDeleteHtmlPart1() +
    _buildDeleteHtmlPart2() +
    _buildDeleteHtmlPart3() +
    _buildDeleteHtmlPart4() +
    _buildDeleteHtmlPart5(items) +
    _buildDeleteHtmlPart6(listHtml, items) +
    _buildDeleteHtmlPart7() +
    _buildDeleteHtmlPart8();
}

/** الجزء 1 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart1() {
  return `<!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>‏حذف سكربتات</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: #fafafa;
      color: #555555;
      padding: 16px;
      padding-top: env(safe-area-inset-top, 16px);
      padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 140px);
      direction: rtl;
    }

    .header {
      text-align: center;
      padding: 16px 0;
      border-bottom: 1px solid #cccccc;
      margin-bottom: 12px;
    }

    .header h1 { font-size: 20px; color: #1a1a1a; margin-bottom: 4px; }
    .header .count { font-size: 13px; color: #666666; }

    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
`;
}

/** الجزء 2 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart2() {
  return `
    .tool-btn {
      flex: 1;
      padding: 10px;
      border: 1px solid #cccccc;
      border-radius: 10px;
      background:#fff;
      color: #888888;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .tool-btn:active { background: #fafafa; }

    .search-box {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #cccccc;
      border-radius: 12px;
      background:#fff;
      color: #1a1a1a;
      font-size: 15px;
      margin-bottom: 12px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      direction: rtl;
      outline: none;
    }

    .search-box::placeholder { color: #555; }
    .search-box:focus { border-color: #2563eb; }
`;
}

/** الجزء 3 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart3() {
  return `
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background:#fff;
      border-radius: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.15s;
      border: 2px solid transparent;
    }

    .item.selected {
      border-color: #dc2626;
      background: #fef2f2;
    }

    .checkbox {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #555;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .item.selected .checkbox {
      background: #dc2626;
      border-color: #dc2626;
    }

    .item.selected .checkbox::after {
      content: "✓";
      color: #1a1a1a;
      font-size: 14px;
      font-weight: 700;
    }

    .info { flex: 1; min-width: 0; }
`;
}

/** الجزء 4 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart4() {
  return `
    .name {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      font-family: "SF Mono", "Menlo", monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item.selected .name { color: #dc2626; }

    .meta {
      font-size: 11px;
      color: #666;
      margin-top: 3px;
    }

    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fafafa;
      border-top: 1px solid #cccccc;
      padding: 12px 16px;
      padding-bottom: calc(env(safe-area-inset-bottom, 12px) + 12px);
    }

    .footer-info {
      text-align: center;
      font-size: 13px;
      color: #666666;
      margin-bottom: 10px;
    }

    .footer-info .sel-count {
      color: #dc2626;
      font-weight: 700;
    }
`;
}

/** الجزء 5 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart5(items) {
  return `
    .footer-buttons {
      display: flex;
      gap: 10px;
    }

    .footer-btn {
      flex: 1;
      padding: 14px;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      text-align: center;
    }

    .btn-delete {
      background: #cccccc;
      color: #555;
      pointer-events: none;
    }

    .btn-delete.active {
      background: #dc2626;
      color: #1a1a1a;
      pointer-events: auto;
    }

    .btn-cancel {
      background: #cccccc;
      color: #1a1a1a;
    }

    .hidden { display: none !important; }
  </style>
  </head>
  <body>

  <div class="header">
    <h1>‏حذف سكربتات</h1>
    <div class="count">‏${items.length} سكربت في سكرِبتابل</div>
  </div>
`;
}

/** الجزء 6 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart6(listHtml, items) {
  return `
  <input type="text" class="search-box" placeholder="‏🔍 بحث..." oninput="filterItems(this.value)">

  <div class="toolbar">
    <div class="tool-btn" onclick="selectAll()">‏تحديد الكل</div>
    <div class="tool-btn" onclick="deselectAll()">‏إلغاء التحديد</div>
    <div class="tool-btn" onclick="invertSelection()">‏عكس التحديد</div>
  </div>

  <div id="list">
  ${listHtml}
  </div>

  <div class="footer">
    <div class="footer-info">‏مُحدَّد: <span class="sel-count" id="selCount">0</span> سكربت</div>
    <div class="footer-buttons">
      <button class="footer-btn btn-delete" id="deleteBtn" onclick="confirmDelete()">‏حذف المُحدَّد</button>
      <button class="footer-btn btn-cancel" onclick="doCancel()">‏إلغاء</button>
    </div>
  </div>

  <script>
    const selected = new Set();
    const totalItems = ${items.length};
    window._FQ_DELETE_RESULT = "";

    function toggleItem(el) {
      const idx = parseInt(el.dataset.index);
      if (selected.has(idx)) {
        selected.delete(idx);
        el.classList.remove("selected");
      } else {
        selected.add(idx);
        el.classList.add("selected");
      }
      updateCount();
    }
`;
}

/** الجزء 7 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart7() {
  return `
    function updateCount() {
      document.getElementById("selCount").textContent = selected.size;
      const btn = document.getElementById("deleteBtn");
      if (selected.size > 0) {
        btn.classList.add("active");
        btn.textContent = "\\u200F\\u{1F5D1} حذف " + selected.size + " سكربت";
      } else {
        btn.classList.remove("active");
        btn.textContent = "\\u200Fحذف المُحدَّد";
      }
    }

    function selectAll() {
      document.querySelectorAll(".item:not(.hidden)").forEach(el => {
        const idx = parseInt(el.dataset.index);
        selected.add(idx);
        el.classList.add("selected");
      });
      updateCount();
    }

    function deselectAll() {
      selected.clear();
      document.querySelectorAll(".item").forEach(el => {
        el.classList.remove("selected");
      });
      updateCount();
    }

    function invertSelection() {
      document.querySelectorAll(".item:not(.hidden)").forEach(el => {
        const idx = parseInt(el.dataset.index);
        if (selected.has(idx)) {
          selected.delete(idx);
          el.classList.remove("selected");
        } else {
          selected.add(idx);
          el.classList.add("selected");
        }
      });
      updateCount();
    }
`;
}

/** الجزء 8 من 8 من نصّ `_buildDeleteHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function _buildDeleteHtmlPart8() {
  return `
    function filterItems(query) {
      const q = query.trim().toLowerCase();
      document.querySelectorAll(".item").forEach(el => {
        const name = el.querySelector(".name").textContent.toLowerCase();
        if (q === "" || name.includes(q)) {
          el.classList.remove("hidden");
        } else {
          el.classList.add("hidden");
        }
      });
    }

    function confirmDelete() {
      if (selected.size === 0) return;
      const indices = Array.from(selected).sort((a, b) => a - b);
      window._FQ_DELETE_RESULT = JSON.stringify({
        action: "delete",
        indices: indices
      });
      document.querySelector(".footer-info").textContent = "تم اختيار " + indices.length + " للحذف — اضغط تم أعلى الشاشة لإكمال";
    }

    function doCancel() {
      window._FQ_DELETE_RESULT = JSON.stringify({ action: "cancel" });
      document.querySelector(".footer-info").textContent = "تم الإلغاء — اضغط تم أعلى الشاشة للخروج";
    }
  </script>

  </body>
  </html>`;
}
async function _readDeleteResult(webView) {
  try { return await webView.evaluateJavaScript("window._FQ_DELETE_RESULT || ''") }
  catch (error) { return null }
}

function _parseDeleteResult(result) {
  if (!result) return null
  try { return JSON.parse(result) }
  catch (error) { return null }
}

function _deleteSelection(parsed, scriptData) {
  if (parsed === null || parsed === undefined || parsed.action !== "delete" || !parsed.indices || parsed.indices.length === 0) return []
  return parsed.indices.map(index => scriptData[index])
}

async function _confirmDeleteScripts(toDelete) {
  const names = toDelete.map(script => script.displayName).join("\n")
  const alert = new Alert()
  alert.title = `‏حذف ${toDelete.length} سكربت؟`
  alert.message = `‏سيتم حذف هذه الملفات نهائيًا من سكرِبتابل:

${names}

‏هذا الإجراء لا يمكن التراجع عنه.`
  alert.addDestructiveAction(`‏حذف ${toDelete.length} سكربت`)
  alert.addCancelAction("‏إلغاء")
  return (await alert.present()) !== -1
}

function _removeSelectedScripts(toDelete) {
  const result = { deletedCount: 0, failedCount: 0, failedNames: [] }
  for (const script of toDelete) {
    try { fm.remove(script.path); result.deletedCount++ }
    catch (error) { result.failedCount++; result.failedNames.push(script.displayName) }
  }
  return result
}

async function _showDeleteReport(result) {
  const alert = new Alert()
  alert.title = "‏تم الحذف"
  const lines = [`‏حُذف: ${result.deletedCount} سكربت`]
  if (result.failedCount > 0) {
    lines.push(`‏فشل: ${result.failedCount}`, "")
    for (const name of result.failedNames) lines.push(`‏• ${name}`)
  }
  alert.message = lines.join("\n")
  alert.addAction("‏حسنًا")
  await alert.present()
}

async function _processDeleteSelection(webView, scriptData) {
  const parsed = _parseDeleteResult(await _readDeleteResult(webView))
  const toDelete = _deleteSelection(parsed, scriptData)
  if (toDelete.length === 0) return
  if (!(await _confirmDeleteScripts(toDelete))) return
  await _showDeleteReport(_removeSelectedScripts(toDelete))
}

async function runDelete() {
  if (scripts.length === 0) { await _showNoDeleteScripts(); return }
  const scriptData = _collectDeleteScriptData()
  const webView = new WebView()
  await webView.loadHTML(_buildDeleteHtml(scriptData))
  await webView.present(true)
  await _processDeleteSelection(webView, scriptData)
}

// ═══ نقطة الدخول — حراسة الوعد في المستوى الأعلى (نمط fq_widget.run) ═══
try {
  localDiagnostics.record("operation", { action: "fq_delete", phase: "start", status: "running", descriptionAr: "بدأ السكربت المستقل" });
  await runDelete()
} catch (error) {
  localDiagnostics.recordError(error, { action: "fq_delete" });
  const message = (error && error.message) || String(error)
  console.error(`[fq_delete] خطأ غير معالج: ${message}`)
  const alert = new Alert()
  alert.title = "توقف الحذف"
  alert.message = message
  alert.addAction("حسنًا")
  await alert.present()
} finally {
  localDiagnostics.record("operation", { action: "fq_delete", phase: "end", status: "returned", descriptionAr: "انتهى السكربت؛ تفاصيل النجاح تعتمد على مخرجاته" });
  localDiagnostics.flush();
  Script.complete()
}
