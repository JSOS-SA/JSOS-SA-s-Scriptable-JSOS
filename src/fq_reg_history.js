// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-red; icon-glyph: history;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_reg_history.js

// ═══ عرض التسجيلات السابقة + قائمة خيارات (نسخ صورة / تعديل) ═══
// المسؤولية الواحدة: قراءة المجموعات من القاعدة، عرضها، وفتح خيارات التفاعل
// التعديل ٣: قائمة خيارين عند الضغط على تسجيل سابق

const cfg = importModule("fq_config");

/**
 * يُرجع نص JS لمنطق التسجيلات السابقة + ربط تبويب التسجيل.
 * @returns {string}
 */
function getHistoryCode() {
  return getHistoryCodePart1() +
    getHistoryCodePart2() +
    getHistoryCodePart3() +
    getHistoryCodePart4() +
    getHistoryCodePart5() +
    getHistoryCodePart6() +
    getHistoryCodePart7() +
    getHistoryCodePart8() +
    getHistoryCodePart9() +
    getHistoryCodePart10();
}

/** الجزء 1 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart1() {
  return `
// ═══ بناء سطر التفاصيل المشترك (clock+users+campaign+tafweej+note) ═══
function _buildDetailLine(src) {
  let d = '';
  if (src.std) d += buildIcon("clock", 12) + ' ' + src.std + ' · ';
  if (src.pax) d += buildIcon("users", 12) + ' ' + src.pax + ' راكب · ';
  if (src.campaign) d += buildIcon("building", 12) + ' ' + src.campaign + ' · ';
  if (src.tafweej) d += buildIcon("clipboard", 12) + ' ' + (LBL.tafweej[src.tafweej] || src.tafweej);
  if (src.note) d += '<br>' + buildIcon("edit", 12) + ' ' + src.note;
  return d;
}

// ═══ بناء رأس عنصر التاريخ (الحدود + الهوية) ═══
// hdr: {key, color, title, right}، وentry: التسجيل (كاتبه ورقمه الوظيفي).
function _buildHistHeader(hdr, entry) {
  const color = hdr.color;
  let h = '<div class="reg-hist-item" style="border-right-color:'+color+'" data-hist-key="'+hdr.key+'">';
  h += '<div class="reg-hist-item-hdr">';
  h += '<span>' + hdr.title + '</span>';
  h += '<span style="color:'+color+';font-size:11px">' + hdr.right + '</span>';
  h += '</div>';
  h += '<div class="reg-hist-item-who">' + buildIcon("user", 14) + ' ' + (entry.recordedBy || "مجهول");
  if (entry.recordedByEmpId) h += ' (#' + entry.recordedByEmpId + ')';
  h += '</div>';
  return h;
}

// ═══ بناء HTML لرحلة واحدة داخل مجموعة ═══
function _renderFlightRow(fl, color) {
  let h = '<div class="reg-hist-flight-row">';
  h += (fl.flt || "—") + ' → ' + (fl.dest || "—");
  const stLbl = (LBL.status[fl.status] || fl.status || "");
  if (stLbl) h += ' <span style="color:'+color+';font-size:11px">(' + stLbl + ')</span>';
  h += '</div>';
  const det = _buildDetailLine(fl);
  if (det) h += '<div class="reg-hist-item-body">' + det + '</div>';
  return h;
}
`;
}

/** الجزء 2 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart2() {
  return `
// ═══ بناء HTML لمجموعة (تسجيل بعدة رحلات) ═══
function _renderGroupItem(key, entry, color) {
  const title = entry.flights.length + ' رحلة مسجّلة';
  let h = _buildHistHeader({ key: key, color: color, title: title, right: (entry.shift || "") }, entry);
  for (let fi = 0; fi < entry.flights.length; fi++) {
    h += _renderFlightRow(entry.flights[fi], color);
    if (fi < entry.flights.length - 1) h += '<div class="reg-hist-flight-sep"></div>';
  }
  h += '</div>';
  return h;
}

// ═══ بناء HTML لسجل فردي قديم (توافق عكسي) ═══
function _renderLegacyItem(key, entry, color) {
  const title = (entry.flt || "—") + ' → ' + (entry.dest || "—");
  const rightHtml = LBL.status[entry.status] || entry.status || "";
  let h = _buildHistHeader({ key: key, color: color, title: title, right: rightHtml }, entry);
  const body = _buildDetailLine(entry);
  if (body) h += '<div class="reg-hist-item-body">' + body + '</div>';
  h += '</div>';
  return h;
}

// ═══ تحديد لون الحد حسب الدور ═══
function _roleColor(role) {
  return roleLook(role).color;
}

// ═══ عرض رسالة فارغة في القائمة ═══
function _showHistEmpty(text) {
  regHistList.innerHTML = '<div style="padding:12px;color:#777;font-size:12px;text-align:center">' + text + '</div>';
  if (regHistCount) regHistCount.textContent = "0";
}
`;
}

/** الجزء 3 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart3() {
  return `
// ═══ بناء قائمة عناصر التاريخ من بيانات القاعدة ═══
function _renderHistList(data) {
  const keys = _histSortedKeys(data);
  if (regHistCount) regHistCount.textContent = keys.length;
  let h = "";
  for (let i = 0; i < keys.length; i++) {
    const e = data[keys[i]];
    if (!e) continue;
    h += _histItemHtml(keys[i], e);
  }
  return h;
}

// مفاتيح التسجيلات من الأحدث إلى الأقدم.
function _histSortedKeys(data) {
  return Object.keys(data).sort(function(a,b){
    return (data[b].recordedAt||"").localeCompare(data[a].recordedAt||"");
  });
}

// عنصر التسجيل: مجموعة رحلات، أو سجلٌّ فرديّ قديم.
function _histItemHtml(k, e) {
  const color = _roleColor(e.recordedByRole);
  const isGroup = Array.isArray(e.flights) && e.flights.length > 0;
  return isGroup ? _renderGroupItem(k, e, color) : _renderLegacyItem(k, e, color);
}

// ═══ تحميل التسجيلات السابقة من القاعدة ═══
async function loadRegHistory() {
  if (!regHistList) return;
  regHistList.innerHTML = '<div style="padding:12px;color:#777;font-size:12px;text-align:center">جارٍ التحميل...</div>';
  try {
    const shiftKey = getShiftKey();
    const resp = await fbFetchTimeout(FB_URL + "/reg_data/" + shiftKey + ".json", null, 12000);
    if (!resp.ok) return _showHistEmpty("لا توجد بيانات");
    _histShowData(await resp.json(), shiftKey);
  } catch(e) {
    console.error("loadRegHistory error", e);
    regHistList.innerHTML = '<div style="padding:12px;color:#E50914;font-size:12px;text-align:center">خطأ في التحميل</div>';
  }
}

`;
}

/** الجزء 4 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart4() {
  return `
// يعرض بيانات الوردية وقد قُرئت، أو رسالة الفراغ إن لم يكن فيها شيء.
function _histShowData(data, shiftKey) {
  if (!data) return _showHistEmpty("لا توجد تسجيلات لهذه الوردية");
  regHistList.innerHTML = _renderHistList(data);
  _bindRegHistClick(data, shiftKey);
}
`;
}

/** الجزء 5 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart5() {
  return `
// ═══ ربط النقر على تسجيل لفتح قائمة الخيارين ═══
// shiftKey = وردية القراءة التي جاءت منها data: عليها يُكتب التعديل لا على وردية لحظة الإرسال.
function _bindRegHistClick(data, shiftKey) {
  const items = regHistList.querySelectorAll(".reg-hist-item");
  for (let i = 0; i < items.length; i++) {
    (function(el){
      el.addEventListener("click", function(){
        const k = el.getAttribute("data-hist-key");
        const entry = data[k];
        if (!entry) return;
        el.style.transform = "scale(0.97)";
        setTimeout(function(){ el.style.transform = ""; }, 150);
        _showHistOptions(entry, k, shiftKey);
      });
    })(items[i]);
  }
}

// ═══ نافذة قائمة الخيارين (تعديل ٣) ═══`;
}

/** الجزء 6 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart6() {
  return `
function _showHistOptions(entry, key, shiftKey) {
  const isGroup = Array.isArray(entry.flights) && entry.flights.length > 0;
  const label = isGroup
    ? (entry.flights.length + " رحلة")
    : ((entry.flt || "—") + " → " + (entry.dest || "—"));
  const ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99998;" +
    "display:flex;align-items:flex-end;justify-content:center";
  const box = document.createElement("div");
  box.style.cssText = "background:#fff;border-radius:16px 16px 0 0;padding:20px;" +
    "width:100%;max-width:500px;direction:rtl;font-family:Tajawal,sans-serif";
  box.innerHTML =
    '<div style="text-align:center;margin-bottom:16px">' +
      '<div style="width:40px;height:4px;background:#e5e5e5;border-radius:2px;margin:0 auto 12px"></div>' +
      '<div style="font-size:16px;font-weight:700;color:#1a1a1a">' + label + '</div>' +
      '<div style="font-size:12px;color:#666;margin-top:4px">' + (entry.shift || "") + '</div>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' +
      '<button id="histOptSnap" style="background:#fafafa;color:#1a1a1a;border:1px solid #e5e5e5;border-radius:12px;' +
        'padding:14px;font-size:15px;font-weight:700;font-family:Tajawal,sans-serif;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;gap:8px">' +
        buildIcon("copy", 18) + '<span>نسخ كصورة</span></button>' +
      '<button id="histOptEdit" style="background:#2563eb;color:#fff;border:none;border-radius:12px;' +
        'padding:14px;font-size:15px;font-weight:700;font-family:Tajawal,sans-serif;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;gap:8px">' +
        buildIcon("edit", 18) + '<span>تعديل البيانات</span></button>' +
      '<button id="histOptClose" style="background:transparent;color:#666;border:none;' +
        'padding:10px;font-size:14px;font-family:Tajawal,sans-serif;cursor:pointer">إلغاء</button>' +
    '</div>';
  ov.appendChild(box);
  document.body.appendChild(ov);
  _bindHistOptionButtons(ov, { entry: entry, isGroup: isGroup }, { key: key, shiftKey: shiftKey });
}
`;
}

/** الجزء 7 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart7() {
  return `
// ═══ ربط أزرار قائمة الخيارين ═══
function _bindHistOptionButtons(ov, item, where) {
  document.getElementById("histOptSnap").addEventListener("click", async function(){
    if (ov.parentNode) ov.parentNode.removeChild(ov);
    await _doHistSnapshot(item.entry, item.isGroup);
  });
  document.getElementById("histOptEdit").addEventListener("click", function(){
    if (ov.parentNode) ov.parentNode.removeChild(ov);
    _doHistEdit(item.entry, item.isGroup, where);
  });
  document.getElementById("histOptClose").addEventListener("click", function(){
    if (ov.parentNode) ov.parentNode.removeChild(ov);
  });
  ov.addEventListener("click", function(ev){
    if (ev.target === ov && ov.parentNode) ov.parentNode.removeChild(ov);
  });
}

// ═══ بناء كائن البطاقة من رحلة ═══
function _buildSnapPayload(fl, shift) {
  return {
    flt: fl.flt || "", std: fl.std || "",
    pax: fl.pax || "", dest: fl.dest || "",
    campaign: fl.campaign || "", shift: shift || "",
    visaLabel: _histLbl(LBL.visa, fl.visa),
    statusLabel: _histLbl(LBL.status, fl.status),
    tafweejLabel: _histLbl(LBL.tafweej, fl.tafweej),
    inspectionLabel: _histLbl(LBL.inspection, fl.inspection),
    note: fl.note || ""
  };
}

// تسمية القيمة من القاموس، وإلا القيمة نفسها، وإلا فراغ.
function _histLbl(map, key) {
  return map[key] || key || "";
}
`;
}

/** الجزء 8 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart8() {
  return `
// ═══ تنفيذ نسخ كصورة ═══
async function _doHistSnapshot(entry, isGroup) {
  if (typeof snapshotRegCard !== "function") return _histToast("نسخ الصورة غير متاح", "error");
  _histToast("جارٍ إنشاء الصورة...", "loading");
  try {
    const dataUrl = await snapshotRegCard(_buildSnapPayload(isGroup ? entry.flights[0] : entry, entry.shift));
    if (typeof exportSnapshotToClipboard === "function") {
      await exportSnapshotToClipboard(dataUrl);
    }
    _histToast("تم نسخ الصورة للحافظة", "success");
  } catch(err) {
    console.error("hist snapshot error", err);
    _histToast("فشل إنشاء الصورة", "error");
  }
}

// رسالة قصيرة إن كانت أداة الرسائل موجودة.
function _histToast(msg, type) {
  if (typeof showToast === "function") showToast(msg, type);
}

// يعيد رحلات التسجيل إلى النماذج: كل رحلات المجموعة، أو الرحلة الفردية.
function _histRefill(entry, isGroup) {
  if (isGroup) {
    for (let gi = 0; gi < entry.flights.length; gi++) {
      addRegForm(entry.flights[gi]);
    }
  } else {
    addRegForm(entry);
  }
}
`;
}

/** الجزء 9 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart9() {
  return `
// ═══ صلاحية التعديل: تسجيلي أنا edit_own_reg، وتسجيل غيري edit_other_reg ═══
function _histMayEdit(entry) {
  const own = !!FB_EMP_ID && entry.recordedByEmpId === FB_EMP_ID;
  return typeof can === "function" && can(own ? "edit_own_reg" : "edit_other_reg");
}

// ═══ تنفيذ تعديل البيانات (إعادة الرحلات للنماذج) ═══
// where.key وwhere.shiftKey = مفتاح التسجيل ووردية قراءته: يجعلان الإرسال القادم يكتب فوقه (_regEditTarget).
function _doHistEdit(entry, isGroup, where) {
  if (!_histMayEdit(entry)) return _histToast("لا تملك صلاحية تعديل هذا التسجيل", "error");
  regFormsContainer.innerHTML = "";
  _regFormId = 0;
  _histRefill(entry, isGroup);
  _regEditTarget = where.key && where.shiftKey ? { key: where.key, shiftKey: where.shiftKey, entry: entry } : null;
  updateRegCounter();
  const histWrap = regHistToggle ? regHistToggle.parentNode : null;
  if (histWrap) histWrap.classList.remove("open");
  regFormsContainer.scrollIntoView({behavior:"smooth"});
  if (typeof showToast === "function") showToast("تم تحميل البيانات للتعديل", "info", 1500);
}
`;
}

/** الجزء 10 من 10 من نصّ `getHistoryCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getHistoryCodePart10() {
  return `
// ═══ ربط زر طي/فتح التسجيلات السابقة ═══
if (regHistToggle) {
  regHistToggle.addEventListener("click", function(){
    const wrap = regHistToggle.parentNode;
    wrap.classList.toggle("open");
    if (wrap.classList.contains("open")) loadRegHistory();
  });
}

// ═══ ربط تبويب التسجيل (إظهار اللوحة + بدء النموذج + المزامنة) ═══
if (regTab) {
  regTab.addEventListener("click", function(){
    if (typeof hideAllPanels === "function") hideAllPanels();
    regTab.classList.add("tab-active");
    regPanel.style.display = "block";
    loadRegHistory();
    if (!_regSyncTimer) {
      _regSyncTimer = setInterval(loadRegHistory, ${cfg.REG_SYNC_MS});
    }
    if (regFormsContainer.children.length === 0) addRegForm();
  });
}
`;
}

module.exports = Object.freeze({
  getHistoryCode,
});
