// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_sidebar.js

const cfg = importModule("fq_config");

/**
 * يُرجع JavaScript الشريط الجانبي.
 * @returns {string}
 */
function getSidebarCode() {
  return getSidebarCodePart1() +
    getSidebarCodePart2() +
    getSidebarCodePart3() +
    getSidebarCodePart4() +
    getSidebarCodePart5() +
    getSidebarCodePart6() +
    getSidebarCodePart7() +
    getSidebarCodePart8() +
    getSidebarCodePart9();
}

/** الجزء 1 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart1() {
  return `
// ═══ القائمة الجانبية الجديدة ═══
let sbt = document.getElementById("sbt");
let sbbadge = document.getElementById("sbbadge");
let sbov = document.getElementById("sbov");
let sbar = document.getElementById("sbar");
let sbc = document.getElementById("sbc");

// إحصائيات
let sbStatUpcoming = document.getElementById("sbStatUpcoming");
let sbStatNearest = document.getElementById("sbStatNearest");
let sbStatTopDest = document.getElementById("sbStatTopDest");
let sbStatTotal = document.getElementById("sbStatTotal");

// ═══ فتح وإغلاق ═══
if (sbt) sbt.addEventListener("click", function(e) {
  e.stopPropagation();
  sbar.classList.add("open");
  sbov.classList.add("open");
  updateSidebarStats();
});
if (sbc) sbc.addEventListener("click", function() {
  sbar.classList.remove("open");
  sbov.classList.remove("open");
});
if (sbov) sbov.addEventListener("click", function() {
  sbar.classList.remove("open");
  sbov.classList.remove("open");
});
`;
}

/** الجزء 2 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart2() {
  return `
// ═══ زمن إقلاع الرحلة بالمللي ثانية (٠ إن لا زمن) ═══
function _sbDepMs(d) {
  return d.depTime instanceof Date ? d.depTime.getTime() :
    (d.depTime ? new Date(d.depTime).getTime() : 0);
}

// ═══ اسم وجهة الرحلة على مستوى المدينة (دقّة أعلى) ═══
function _sbDestName(d) {
  let dest = d.to || "—";
  if (typeof airportName === "function") {
    const an = airportName(dest);
    if (an) dest = an;
  } else if (typeof countryName === "function") {
    const cn = countryName(dest);
    if (cn) dest = cn;
  }
  return dest;
}

// ═══ تسجيل رحلة قادمة في الحصيلة والأقرب ═══
function _sbNoteUpcoming(s, d, diff) {
  s.upcoming++;
  if (diff < s.nearestDiff) {
    s.nearestDiff = diff;
    s.nearestFlt = (d.al || "") + " " + (d.flt || "");
  }
}

// ═══ مسح الرحلات: القادمة والأقرب وعدّ الوجهات ═══
function _sbScan(now) {
  const s = { upcoming: 0, nearestDiff: Infinity, nearestFlt: "—", destCounts: {} };
  for (let i = 0; i < DATA.length; i++) {
    const d = DATA[i];
    const dep = _sbDepMs(d);
    if (dep > now) _sbNoteUpcoming(s, d, dep - now);
    const dest = _sbDestName(d);
    s.destCounts[dest] = (s.destCounts[dest] || 0) + 1;
  }
  return s;
}
`;
}

/** الجزء 3 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart3() {
  return `
// ═══ أكثر وجهة تكرارًا ═══
function _sbTopDest(destCounts) {
  let topDest = "—";
  let topCount = 0;
  for (const dc in destCounts) {
    if (destCounts[dc] > topCount) {
      topCount = destCounts[dc];
      topDest = dc;
    }
  }
  return topDest;
}

// ═══ الأقرب بصيغة ساعات:دقائق ═══
function _sbNearestStr(nearestDiff) {
  if (!(nearestDiff < Infinity)) return "—";
  const h = Math.floor(nearestDiff / 3600000);
  const m = Math.floor((nearestDiff % 3600000) / 60000);
  return h + " س " + m + " د";
}

// ═══ عرض الإحصائيات الأربع ═══
function _sbShowStats(s) {
  if (sbStatUpcoming) sbStatUpcoming.textContent = s.upcoming;
  if (sbStatNearest) {
    sbStatNearest.textContent = s.nearestStr;
    sbStatNearest.title = s.nearestFlt;
  }
  if (sbStatTopDest) sbStatTopDest.textContent = s.topDest;
  if (sbStatTotal) sbStatTotal.textContent = s.total;
}

// ═══ تحديث الإحصائيات الأربع ═══
function updateSidebarStats() {
  if (typeof DATA === "undefined" || !DATA) return;
  const s = _sbScan(Date.now());
  s.total = DATA.length;
  s.topDest = _sbTopDest(s.destCounts);
  s.nearestStr = _sbNearestStr(s.nearestDiff);
  _sbShowStats(s);
  // شارة العدد
  if (sbbadge) sbbadge.textContent = s.total > 0 ? s.total : "";
}
`;
}

/** الجزء 4 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart4() {
  return `
// ═══ تركيب عنصر القائمة في الشريط ═══
function _sbMountList(sbListEl) {
  const sbSection = document.querySelector(".sidebar .sb-section:last-child");
  if (sbSection && sbSection.parentNode) {
    sbSection.parentNode.insertBefore(sbListEl, sbSection.nextSibling);
  } else {
    document.querySelector(".sidebar").appendChild(sbListEl);
  }
}

// ═══ إنشاء عنصر القائمة إذا لم يكن موجوداً ═══
function _sbEnsureList() {
  if (document.getElementById("sbList")) return;
  const sbListEl = document.createElement("div");
  sbListEl.id = "sbList";
  sbListEl.className = "sb-list";
  _sbMountList(sbListEl);
}

// ═══ هل توجد رحلات متعقبة؟ ═══
function _sbHasTracked() {
  return !(typeof TRACKED === "undefined" || !TRACKED || TRACKED.length === 0);
}

// ═══ عنصر رحلة متعقبة واحدة ═══
function _sbItemHtml(f, i) {
  const remain = fmtRemain(f.depTime.getTime() - Date.now());
  const tf = getTafweej(f.depTime);
  let html = '<div class="sb-item" data-flt="' + f.flt + '">';
  html += '<div class="sb-flt">' + (f.al || "") + " " + f.flt + '</div>';
  html += '<div class="sb-std">' + f.std + '</div>';
  html += '<div class="sb-remain ' + remain.cls + '">' + remain.text + '</div>';
  html += '<div class="sb-tafweej ' + tf.cls + '">' + tf.label + '</div>';
  html += '<button class="sb-rm" data-rm="' + i + '">' + buildIcon("x", 14) + '</button>';
  return html + '</div>';
}

// ═══ محتوى القائمة: الرحلات المتعقبة أو رسالة الفراغ ═══
function _sbTrackedHtml() {
  if (!_sbHasTracked()) return '<div class="sb-empty">لا توجد رحلات متعقبة</div>';
  let html = "";
  for (let i = 0; i < TRACKED.length; i++) html += _sbItemHtml(TRACKED[i], i);
  return html;
}
`;
}

/** الجزء 5 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart5() {
  return `
// ═══ ربط أزرار الإزالة ═══
function _sbBindRemove(container) {
  const rmBtns = container.querySelectorAll(".sb-rm");
  for (let r = 0; r < rmBtns.length; r++) {
    rmBtns[r].addEventListener("click", function(e) {
      e.stopPropagation();
      const idx = parseInt(this.getAttribute("data-rm"));
      if (!isNaN(idx) && TRACKED[idx]) {
        TRACKED.splice(idx, 1);
        renderSidebar();
      }
    });
  }
}

// ═══ ربط النقر على العنصر للبحث ═══
function _sbBindItems(container) {
  const items = container.querySelectorAll(".sb-item");
  for (let it = 0; it < items.length; it++) {
    items[it].addEventListener("click", function(e) {
      if (e.target.classList.contains("sb-rm")) return;
      const flt = this.getAttribute("data-flt");
      if (flt && si) {
        si.value = flt;
        doSearch();
        sbar.classList.remove("open");
        sbov.classList.remove("open");
      }
    });
  }
}

// ═══ دالة renderSidebar (كانت مفقودة) ═══
function renderSidebar() {
  _sbEnsureList();
  const container = document.getElementById("sbList");
  if (!container) return;
  container.innerHTML = _sbTrackedHtml();
  if (!_sbHasTracked()) return;
  _sbBindRemove(container);
  _sbBindItems(container);
}
`;
}

/** الجزء 6 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart6() {
  return `
// ═══ نصّ قسم حدود التفويج ═══
function _tfSectionHtml() {
  return '<div class="sb-section-title">⏱ حدود التفويج (ساعات)</div>' +
    '<div style="display:flex;gap:8px;margin-top:8px;direction:rtl">' +
      '<div style="flex:1">' +
        '<label style="font-size:10px;color:#666666;display:block;margin-bottom:4px">مبكر ≥</label>' +
        '<input type="number" id="tfEarlyInput" value="8" min="1" max="24" ' +
          'style="width:100%;background:#fafafa;color:#1a1a1a;border:1px solid #e5e5e5;border-radius:6px;padding:6px 8px;font-size:14px;text-align:center">' +
      '</div>' +
      '<div style="flex:1">' +
        '<label style="font-size:10px;color:#666666;display:block;margin-bottom:4px">في الموعد ≥</label>' +
        '<input type="number" id="tfOntimeInput" value="4" min="1" max="12" ' +
          'style="width:100%;background:#fafafa;color:#1a1a1a;border:1px solid #e5e5e5;border-radius:6px;padding:6px 8px;font-size:14px;text-align:center">' +
      '</div>' +
      '<div style="display:flex;align-items:flex-end;padding-bottom:2px">' +
        '<button id="tfApplyBtn" style="background:#E50914;color:#fff;border:none;border-radius:6px;padding:7px 12px;font-family:Tajawal,sans-serif;font-size:12px;font-weight:700;cursor:pointer">تطبيق</button>' +
      '</div>' +
    '</div>' +
    '<div id="tfHint" style="font-size:11px;color:#666666;margin-top:6px;direction:rtl"></div>';
}

// ═══ إنشاء قسم التحكم في القائمة الجانبية ═══
function _tfBuildSection() {
  const section = document.createElement("div");
  section.className = "sb-section";
  section.id = "tafweejControlSection";
  section.innerHTML = _tfSectionHtml();
  return section;
}

// ═══ إدراجه قبل آخر قسم داخل المنطقة القابلة للتمرير ═══
function _tfInsertSection(container, section) {
  const sections = container.querySelectorAll(".sb-section");
  if (sections.length > 0) {
    container.insertBefore(section, sections[sections.length - 1]);
  } else {
    container.appendChild(section);
  }
}
`;
}

/** الجزء 7 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart7() {
  return `
// ═══ تلميح خطأ: حد المبكر ليس أكبر من في الموعد ═══
function _tfHintWarn() {
  document.getElementById("tfHint").innerHTML = buildIcon("alertTriangle", 14, "ic-am") + " حد المبكر يجب أن يكون أكبر من في الموعد";
  document.getElementById("tfHint").style.color = "#E50914";
}

// ═══ تلميح نجاح: الحدّان المعتمدان ═══
function _tfHintOk(early, ontime) {
  document.getElementById("tfHint").innerHTML =
    buildIcon("check", 14, "ic-ok") + " مبكر ≥ " + early + "س | في الموعد ≥ " + ontime + "س | متأخر < " + ontime + "س";
  document.getElementById("tfHint").style.color = "#16a34a";
}

// ═══ إعادة حساب البطاقات الظاهرة ═══
function _tfRecalc() {
  if (typeof doSearch === "function") doSearch();
  if (typeof updateSidebarStats === "function") updateSidebarStats();
}

// ═══ زر التطبيق ═══
function _tfApply() {
  const early = parseInt(document.getElementById("tfEarlyInput").value) || 8;
  const ontime = parseInt(document.getElementById("tfOntimeInput").value) || 4;
  if (early <= ontime) { _tfHintWarn(); return; }
  window._TF_EARLY = early;
  window._TF_ONTIME = ontime;
  _tfHintOk(early, ontime);
  _tfRecalc();
}

// ═══ حقول التحكم في منطق الوقت ═══
(function initTafweejControls(){
  // يُدرج داخل sb-list (المنطقة القابلة للتمرير) لا في sbar مباشرة
  const sbar = document.getElementById("sbar");
  if (!sbar) return;
  const sbList = sbar.querySelector(".sb-list");
  _tfInsertSection(sbList || sbar, _tfBuildSection());
  // متغيرات عالمية للحدود
  window._TF_EARLY = 8;
  window._TF_ONTIME = 4;
  document.getElementById("tfApplyBtn").addEventListener("click", _tfApply);
})();
`;
}

/** الجزء 8 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart8() {
  return `
// ═══ تحديث دوري للإحصائيات ═══
setInterval(function() {
  if (sbar && sbar.classList.contains("open")) {
    updateSidebarStats();
  }
}, ${cfg.SIDEBAR_REFRESH_MS});

// ═══ تحديث فوري عند تغيّر البيانات ═══
const _nfEl = document.getElementById("nf");
if (_nfEl) {
  const _sbObserver = new MutationObserver(function(){
    updateSidebarStats();
  });
  _sbObserver.observe(_nfEl, { childList: true, subtree: true, characterData: true });
}

// أول تحديث
setTimeout(updateSidebarStats, 800);

// ═══ المؤقت التنازلي — كل ثانية ═══
setInterval(function() {
  if (typeof updateCountdowns === "function") updateCountdowns();
}, ${cfg.COUNTDOWN_INTERVAL_MS});
`;
}

/** الجزء 9 من 9 من نصّ `getSidebarCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getSidebarCodePart9() {
  return `
// ═══ زر إيقاف/تشغيل الإشعارات ═══
// window._NOTIF_OFF حالة الزرّ في الصفحة وحدها: الزرّ يوقف إشعارات الآيفون فقط، ولا يكتم
// رسائل الصفحة ولا سجلّ الإشعارات المشترك (قرار المالك ٢٠٢٦-١٠-٠٥)
// window._FQ_NOTIF_PREF يُمرَّر للسكربت الأم بعد الإغلاق ليحفظ في Keychain
let notifToggleBtn = document.getElementById("notifToggleBtn");
let notifToggleLb = document.getElementById("notifToggleLb");

// قراءة الحالة المحفوظة من LocalStorage (يقرأها سكربتابل من window عند الإغلاق)
function _readNotifState() {
  try {
    if (typeof NOTIF_OFF_INITIAL !== "undefined") return NOTIF_OFF_INITIAL === true;
  } catch(e) { console.error("notif#read", e); }
  return false;
}

window._NOTIF_OFF = _readNotifState();

function _renderNotifBtn() {
  if (!notifToggleBtn || !notifToggleLb) return;
  if (window._NOTIF_OFF) {
    notifToggleLb.textContent = "تشغيل الإشعارات";
    notifToggleBtn.style.background = "#fafafa";
    notifToggleBtn.style.color = "#777";
  } else {
    notifToggleLb.textContent = "إيقاف الإشعارات";
    notifToggleBtn.style.background = "";
    notifToggleBtn.style.color = "";
  }
}
_renderNotifBtn();

if (notifToggleBtn) {
  notifToggleBtn.addEventListener("click", function() {
    window._NOTIF_OFF = !window._NOTIF_OFF;
    window._FQ_NOTIF_PREF = window._NOTIF_OFF ? "off" : "on";
    _renderNotifBtn();
    if (typeof showToast === "function") {
      showToast(window._NOTIF_OFF ? "تم إيقاف الإشعارات" : "تم تشغيل الإشعارات",
        window._NOTIF_OFF ? "info" : "success", 1500);
    }
  });
}
`;
}

module.exports = Object.freeze({ getSidebarCode });
