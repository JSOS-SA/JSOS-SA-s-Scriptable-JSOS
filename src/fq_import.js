// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_import.js
const localDiagnostics = importModule("fq_monitor_local");
localDiagnostics.start({});

const fm = FileManager.local()
const scriptsDir = fm.documentsDirectory()

async function _showImportIntro() {
  const intro = new Alert()
  intro.title = "‏استيراد سكربتات"
  intro.message = "‏افتح المجلد الذي يحتوي ملفات السكربتات ثم اضغط «تحديد الكل» في الأعلى واختر جميع الملفات"
  intro.addAction("‏اختيار الملفات")
  intro.addCancelAction("‏إلغاء")
  return (await intro.present()) !== -1
}

async function _pickImportPaths() {
  try {
    return await DocumentPicker.open(["public.source-code", "public.javascript-source", "public.plain-text", "public.data"])
  } catch (error) {
    return null
  }
}

function _supportedImportFiles(selectedPaths) {
  const files = []
  for (const filePath of selectedPaths) {
    const fileName = fm.fileName(filePath, true)
    if (fileName.endsWith(".js") || fileName.endsWith(".json")) {
      files.push({ name: fileName, sourcePath: filePath })
    }
  }
  return files
}

async function _showEmptyImportSelection() {
  const alert = new Alert()
  alert.title = "‏لم تُختر ملفات"
  alert.addCancelAction("‏حسنًا")
  await alert.present()
}

async function _showUnsupportedImportSelection() {
  const alert = new Alert()
  alert.title = "‏لا توجد ملفات مدعومة"
  alert.message = "‏الملفات المختارة لا تحتوي أي ملف بامتداد .js أو .json"
  alert.addCancelAction("‏حسنًا")
  await alert.present()
}

async function _confirmImportFiles(files) {
  const alert = new Alert()
  alert.title = `‏وُجد ${files.length} سكربت`
  alert.message = `‏${files.map(file => file.name).join("\n")}`
  alert.addAction("‏استيراد الكل")
  alert.addCancelAction("‏إلغاء")
  return (await alert.present()) !== -1
}

function _readImportContent(file) {
  try {
    const content = fm.readString(file.sourcePath)
    if (content === null || content === undefined) return { ok: false, reason: "محتوى فارغ" }
    return { ok: true, content: content }
  } catch (error) {
    return { ok: false, reason: "فشلت القراءة" }
  }
}

// يسأل عن ملف موجود بالاسم نفسه: ٠ استبدال، ١ تخطٍّ، -١ إلغاء الكل.
async function _askExistingFile(file) {
  const alert = new Alert()
  alert.title = `‏${file.name}`
  alert.message = "‏سكربت بنفس الاسم موجود بالفعل في سكرِبتابل"
  alert.addAction("‏استبدال")
  alert.addAction("‏تخطّي")
  alert.addCancelAction("‏إلغاء الكل")
  return await alert.present()
}

async function _existingFileAction(file, destPath) {
  if (!fm.fileExists(destPath)) return "write"
  const choice = await _askExistingFile(file)
  if (choice === -1) return "cancel"
  if (choice === 1) return "skip"
  return "replace"
}

function _writeImportedContent(destPath, content) {
  try {
    fm.writeString(destPath, content)
    return fm.fileExists(destPath)
  } catch (error) {
    return false
  }
}

function _skippedImport(result, file, reason) {
  result.skippedCount++
  result.skippedNames.push(`${file.name} (${reason})`)
}

// يكتب الملف في مجلد السكربتات ويعدّه: مضافًا، ومستبدَلًا إن حلّ محلّ موجود. العدّ بعد نجاح الكتابة وحدها.
function _storeImport(result, file, target) {
  if (!_writeImportedContent(target.destPath, target.content)) return _skippedImport(result, file, "فشلت الكتابة")
  if (target.replaced) result.replacedCount++
  result.addedCount++
}

// يضع محتوًى مقروءًا في مكانه بعد سؤال الموجود. يُرجع false عند «إلغاء الكل».
async function _placeImport(file, content, result) {
  const destPath = fm.joinPath(scriptsDir, file.name)
  const action = await _existingFileAction(file, destPath)
  if (action === "cancel") return false
  if (action === "skip") _skippedImport(result, file, "موجود")
  else _storeImport(result, file, { destPath: destPath, content: content, replaced: action === "replace" })
  return true
}

// ملف واحد: يُقرأ ثم يوضع. يُرجع false إن أوقف المستخدم ما بعده.
async function _importOneFile(file, result) {
  const read = _readImportContent(file)
  if (!read.ok) {
    _skippedImport(result, file, read.reason)
    return true
  }
  return _placeImport(file, read.content, result)
}

async function _importSelectedFiles(files) {
  const result = { addedCount: 0, skippedCount: 0, replacedCount: 0, skippedNames: [] }
  for (const file of files) {
    if (!(await _importOneFile(file, result))) break
  }
  return result
}

async function _showImportReport(result) {
  const alert = new Alert()
  alert.title = "‏تم الاستيراد"
  const lines = [`‏أُضيف: ${result.addedCount} سكربت`]
  if (result.replacedCount > 0) lines.push(`‏استُبدل: ${result.replacedCount} سكربت`)
  if (result.skippedCount > 0) {
    lines.push(`‏تُخطّي: ${result.skippedCount}`, "")
    for (const name of result.skippedNames) lines.push(`‏• ${name}`)
  }
  alert.message = `${lines.join("\n")}\n\n‏⚠️ أغلق تطبيق اسكربتابل بالكامل ثم أعد فتحه لتظهر الملفات الجديدة في القائمة`
  alert.addAction("‏حسنًا")
  await alert.present()
}

// القارئ الوحيد لتفضيل إشعارات الآيفون في fq_alerts (قرار المالك ٢٠٢٦-١٠-٠٥). يُستورد عند الحاجة
// لا في رأس الملف: هذه الأداة تجلب الملفات إلى جهاز قد لا يحويها بعد، وما يفعله importModule
// لملف غائب غير مذكور في الوثائق الرسمية — فيُلتقط، والافتراضي «مسموح» كغياب المفتاح.
function _importNotificationsEnabled() {
  try {
    return importModule("fq_alerts").isNotifAllowed((error) => console.error(`[fq_import] keychain: ${error.message}`))
  } catch (error) {
    console.error(`[fq_import] fq_alerts: ${error.message}`)
    return true
  }
}

async function _scheduleImportNotification(addedCount) {
  if (!_importNotificationsEnabled()) return
  const note = new Notification()
  note.title = `✅ تم استيراد ${addedCount} ملف`
  note.body = "أغلق اسكربتابل وأعد فتحه لرؤية الملفات"
  note.sound = "default"
  await note.schedule()
}

// المقدّمة ثم المنتقي: المسارات المختارة، أو null عند الإلغاء أو الاختيار الفارغ (ويُقال له).
async function _selectImportPaths() {
  if (!(await _showImportIntro())) return null
  const selectedPaths = await _pickImportPaths()
  if (selectedPaths !== null && selectedPaths.length === 0) await _showEmptyImportSelection()
  return selectedPaths && selectedPaths.length > 0 ? selectedPaths : null
}

// الملفات المدعومة بعد تأكيد المستخدم، أو null إن انتهى الاستيراد قبلها.
async function _chooseImportFiles() {
  const selectedPaths = await _selectImportPaths()
  if (selectedPaths === null) return null
  const files = _supportedImportFiles(selectedPaths)
  if (files.length === 0) { await _showUnsupportedImportSelection(); return null }
  return (await _confirmImportFiles(files)) ? files : null
}

async function runImport() {
  const files = await _chooseImportFiles()
  if (files === null) return

  const result = await _importSelectedFiles(files)
  await _showImportReport(result)
  await _scheduleImportNotification(result.addedCount)
}

// ═══ نقطة الدخول — حراسة الوعد في المستوى الأعلى (نمط fq_widget.run) ═══
try {
  localDiagnostics.record("operation", { action: "fq_import", phase: "start", status: "running", descriptionAr: "بدأ السكربت المستقل" });
  await runImport()
} catch (error) {
  localDiagnostics.recordError(error, { action: "fq_import" });
  const message = (error && error.message) || String(error)
  console.error(`[fq_import] خطأ غير معالج: ${message}`)
  const alert = new Alert()
  alert.title = "توقف الاستيراد"
  alert.message = message
  alert.addAction("حسنًا")
  await alert.present()
} finally {
  localDiagnostics.record("operation", { action: "fq_import", phase: "end", status: "returned", descriptionAr: "انتهى السكربت؛ تفاصيل النجاح تعتمد على مخرجاته" });
  localDiagnostics.flush();
  Script.complete()
}
