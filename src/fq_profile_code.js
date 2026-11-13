// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: code;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_profile_code.js

/**
 * @module fq_profile_code
 * @description كود JavaScript المحقون في WebView للملف الشخصي فقط.
 */

/**
 * يُرجع JavaScript الملف الشخصي.
 * @returns {string}
 */
function getProfileCode() {
  return getProfileCodePart1() +
    getProfileCodePart2() +
    getProfileCodePart3() +
    getProfileCodePart4() +
    getProfileCodePart5() +
    getProfileCodePart6() +
    getProfileCodePart7() +
    getProfileCodePart8() +
    getProfileCodePart9() +
    getProfileCodePart10() +
    getProfileCodePart11() +
    getProfileCodePart12() +
    getProfileCodePart13() +
    getProfileCodePart14();
}

/** الجزء 1 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart1() {
  return `
let profileTab = document.getElementById("profileTab");
let profilePanel = document.getElementById("profilePanel");
let pfEditBtn = document.getElementById("pfEditBtn");
let pfSaveBtn = document.getElementById("pfSaveBtn");
let pfEditForm = document.getElementById("pfEditForm");
let pfEditName = document.getElementById("pfEditName");
let pfEditLocation = document.getElementById("pfEditLocation");
let pfEditStatus = document.getElementById("pfEditStatus");

if (profileTab) {
  profileTab.addEventListener("click", function(){
    if (typeof hideAllPanels === "function") hideAllPanels();
    profileTab.classList.add("tab-active");
    profilePanel.style.display = "block";
    renderProfile();
  });
}

// ═══ عناصر العرض الثمانية ═══
function _pfEls() {
  return {
    name: document.getElementById("pfName"),
    role: document.getElementById("pfRole"),
    jobTitle: document.getElementById("pfJobTitle"),
    empId: document.getElementById("pfEmpId"),
    location: document.getElementById("pfLocation"),
    status: document.getElementById("pfStatus"),
    regCount: document.getElementById("pfRegCount"),
    avatar: document.getElementById("pfAvatar")
  };
}

// ═══ إشعار إن وُجدت showToast (بوسيطين) ═══
function _pfNotify(msg, kind) {
  if (typeof showToast === "function") showToast(msg, kind);
}
`;
}

/** الجزء 2 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart2() {
  return `
// ═══ الاسم والدور من الجلسة ═══
function _pfShowBasics(els) {
  if (els.name) els.name.textContent = FB_USER || "—";
  if (els.role) {
    // الاسم واللون من مصدر واحد (roleLook في fq_permissions)
    const look = roleLook(FB_ROLE);
    els.role.textContent = look.label;
    els.role.style.color = look.color;
    els.role.style.background = look.tint;
  }
}

// ═══ الاسم والوظيفة والرقم والموقع من سجلّ القاعدة ═══
function _pfFillText(els, u) {
  if (els.name) els.name.textContent = u.name || FB_USER;
  if (els.jobTitle) els.jobTitle.innerHTML = buildIcon("clipboard", 14) + ' ' + (u.jobTitle || "—");
  if (els.empId) els.empId.innerHTML = '<span style="font-family:monospace">#</span> رقم الموظف: ' + (u.empId || FB_EMP_ID);
  if (els.location) els.location.innerHTML = buildIcon("folder", 14) + ' ' + (Array.isArray(u.location) ? u.location.join("، ") : (u.location || "—"));
}

// ═══ الحالة وعدد التسجيلات والصورة ═══
function _pfFillStatus(els, u) {
  if (els.status) els.status.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:#16a34a;border-radius:50%;vertical-align:middle"></span> ' + (u.status || "حاضر");
  if (els.regCount) els.regCount.innerHTML = buildIcon("barChart", 14) + ' تسجيلات النوبة: ' + (u.regCount || 0);
  if (els.avatar && u.avatar) {
    els.avatar.innerHTML = '<img src="' + u.avatar + '" alt="">';
  }
}

// ═══ تعبئة حقول التعديل ═══
function _pfFillEditFields(u) {
  if (pfEditName) pfEditName.value = u.name || "";
  if (pfEditStatus) pfEditStatus.value = u.status || "حاضر";
  if (pfEditLocation && Array.isArray(u.location)) {
    for (let i = 0; i < pfEditLocation.options.length; i++) {
      pfEditLocation.options[i].selected = u.location.indexOf(pfEditLocation.options[i].value) !== -1;
    }
  }
}
`;
}

/** الجزء 3 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart3() {
  return `
function _pfFillUser(els, u) {
  _pfFillText(els, u);
  _pfFillStatus(els, u);
  _pfFillEditFields(u);
}

// ═══ جلب بيانات كاملة من القاعدة ═══
async function _pfLoadFull(els) {
  try {
    const resp = await fbFetchTimeout(FB_URL + "/users/" + FB_EMP_ID + ".json", null, 12000);
    if (resp.ok) {
      const u = await resp.json();
      if (u) _pfFillUser(els, u);
    }
  } catch(e) { console.warn("[fq_profile] " + e.message); }
}

// ═══ قسم الفريق — لمن يملك view_team في مصفوفة الصلاحيات ═══
function _pfShowTeam() {
  const teamSection = document.getElementById("pfTeamSection");
  const teamList = document.getElementById("pfTeamList");
  if (typeof can === "function" && can("view_team") && teamSection && teamList) {
    teamSection.style.display = "block";
    loadTeamList(teamList);
  }
}

// ═══ لوحة الإدارة — تُسأل مصفوفة الصلاحيات لا الدور (المشرف مساوٍ للمطوّر) ═══
function _pfShowAdmin() {
  const devSection = document.getElementById("pfDevSection");
  if (typeof can === "function" && (can("add_new_user") || can("system_emergency_stop")) && devSection) {
    devSection.style.display = "block";
  }
}
`;
}

/** الجزء 4 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart4() {
  return `
function renderProfile() {
  const els = _pfEls();
  _pfShowBasics(els);
  _pfLoadFull(els);
  _pfShowTeam();
  _pfShowAdmin();
}

// ═══ زر تعديل ═══
if (pfEditBtn) pfEditBtn.addEventListener("click", function(){
  pfEditForm.style.display = "block";
  pfEditBtn.style.display = "none";
  pfSaveBtn.style.display = "inline-block";
});

// ═══ المواقع المختارة في قائمة التعديل ═══
function _pfSelectedLocations() {
  const locations = [];
  for (let i = 0; i < pfEditLocation.options.length; i++) {
    if (pfEditLocation.options[i].selected)
      locations.push(pfEditLocation.options[i].value);
  }
  return locations;
}

// ═══ قراءة نموذج التعديل ═══
function _pfReadEdit() {
  const name = (pfEditName.value || "").trim();
  const status = pfEditStatus.value;
  return { name: name, status: status, locations: _pfSelectedLocations() };
}
`;
}

/** الجزء 5 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart5() {
  return `
// ═══ ما يُقال للموظف بعد الحفظ ═══
function _pfSaveResultToast(resp, name) {
  if (!resp.ok) { _pfNotify("فشل الحفظ: " + resp.error, "error"); return; }
  _pfNotify(resp.queued ? "قيد الإرسال — سيُحفظ عند عودة الاتصال" : "تم حفظ الملف الشخصي",
    resp.queued ? "info" : "success");
  if (typeof fbPushNotif === "function")
    fbPushNotif({ type: "profile_updated", title: "تحديث الملف الشخصي", details: name });
}

// ═══ طلب الحفظ ═══
// على الطابور: الموظف يعدّل بياناته هو، وضياعها لانقطاع لحظي خسارة
// بلا مقابل. والمسار ثابت بمعرّفه، فإعادة الإرسال تكتب فوق نفسها.
// أمّا أفعال المشرف فخارج الطابور (انظر تعليق pfAdminPatch).
function _pfSaveRequest(form) {
  const payload = { name: form.name, status: form.status, location: form.locations,
    lastUpdatedBy: FB_USER, lastUpdatedAt: new Date().toISOString() };
  return {
    path: "/users/" + FB_EMP_ID + ".json", method: "PATCH", body: payload,
    kind: "profile", label: "حفظ الملف الشخصي"
  };
}

function _pfEditClose() {
  pfEditForm.style.display = "none";
  pfEditBtn.style.display = "inline-block";
  pfSaveBtn.style.display = "none";
}
`;
}

/** الجزء 6 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart6() {
  return `
// ═══ زر حفظ ═══
async function _pfSaveClick() {
  _pfNotify("جارٍ حفظ الملف الشخصي...", "loading");
  const form = _pfReadEdit();
  try {
    const resp = await fqSendOrQueue(_pfSaveRequest(form));
    _pfSaveResultToast(resp, form.name);
  } catch(e) {
    _pfNotify("فشل الاتصال", "error");
  }
  _pfEditClose();
  renderProfile();
}

if (pfSaveBtn) pfSaveBtn.addEventListener("click", _pfSaveClick);

// ═══ نداء إداري: يرمي عمدًا عند الفشل، وخارج الطابور عمدًا ═══
// **لا طابور هنا** بقرار المستخدم ٢٠٢٦-٠٩-٢٥: المشرف يتّخذ قرارًا بناءً
// على ما يراه على الشاشة. «تم تغيير الصلاحية» أو «تم إيقاف النظام»
// بينما لم يقع الفعل بعدُ أخطر بكثير من فشل صريح يعيد المحاولة بنفسه.
//
// الباب fqRequest لا يرمي أبدًا — القرار هنا في المستدعي لا في الباب.
// وأفعال الفريق تكتب سجلَّين متتابعين (users ثم auth)، فمضيُّها بعد فشل
// الأول يترك الحسابَ بصلاحية في مكان وأخرى في مكان. الرمي يوقف المتتالية،
// والتقاطه في catch(actionError) القائم يعرض السبب للمشرف.
async function pfAdminPatch(path, body) {
  const res = await fqRequest({ path: path, method: "PATCH", body: body });
  if (!res.ok) throw new Error(res.error);
  return res;
}

// ═══ رسالة وسط قائمة الفريق ═══
function _pfTeamMsg(color, text) {
  return '<div style="padding:12px;color:' + color + ';font-size:12px;text-align:center">' + text + '</div>';
}
`;
}

/** الجزء 7 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart7() {
  return `
// ═══ صورة العضو ═══
function _pfAvatarHtml(m) {
  let h = '<div class="pf-team-avatar">';
  if (m.avatar) h += '<img src="'+m.avatar+'" alt="">';
  else h += '<span style="font-size:18px;display:inline-flex;align-items:center;justify-content:center">'+buildIcon("user", 22)+'</span>';
  return h + '</div>';
}

// ═══ سطور البيانات الفرعية: الدور والرقم والحالة والوظيفة والموقع ═══
function _pfMetaHtml(m, roleLabel) {
  let h = '<div class="pf-team-meta">'+roleLabel;
  if (m.empId) h += ' | #'+m.empId;
  if (m.status) h += ' | '+m.status;
  h += '</div>';
  if (m.jobTitle) h += '<div class="pf-team-meta">'+m.jobTitle+'</div>';
  if (Array.isArray(m.location) && m.location.length > 0)
    h += '<div class="pf-team-meta">'+buildIcon("folder", 12)+' '+m.location.join("، ")+'</div>';
  return h;
}

// ═══ كتلة معلومات العضو ═══
function _pfInfoHtml(m, look, frozen) {
  let h = '<div class="pf-team-info">';
  h += '<div class="pf-team-name">'+(m.name || "—")+(frozen?" "+buildIcon("alertTriangle", 12, "ic-am"):"")+'</div>';
  h += _pfMetaHtml(m, look.label);
  return h + '</div></div>';
}

// ═══ رأس بطاقة العضو ═══
function _pfCardHead(m, key, look) {
  const frozen = m.frozen === true;
  return '<div class="pf-team-card" style="border-right-color:'+look.color+
    (frozen ? ';opacity:0.5' : '')+'" data-team-key="'+key+'">' +
    '<div style="display:flex;align-items:center;gap:10px">' +
    _pfAvatarHtml(m) + _pfInfoHtml(m, look, frozen);
}
`;
}

/** الجزء 8 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart8() {
  return `
// ═══ زرّ عملية في قسم التوسيع ═══
function _pfActionBtn(act, ids, inner) {
  const cls = (act === "freeze" || act === "delete_user") ? "pf-role-toggle pf-freeze-btn" : "pf-role-toggle";
  return '<button class="'+cls+'" data-action="'+act+'" data-key="'+ids.key+'" data-uid="'+ids.uid+'">'+inner+'</button>';
}

// ═══ زرّ تغيير الدور ═══
function _pfRoleBtn(m, ids) {
  const newRole = m.role === "admin" ? "employee" : "admin";
  const newRoleLabel = newRole === "admin" ? "ترقية لمشرف" : "تخفيض لموظف";
  return '<button class="pf-role-toggle" data-action="change_role" data-key="'+ids.key+'" data-uid="'+ids.uid+'" data-new-role="'+newRole+'">'+newRoleLabel+'</button>';
}

// ═══ قسم التوسيع — لمن يملك تغيير الدور ═══
// وحساب المطوّر لا يُعدَّل من هنا: قواعد القاعدة تحصره في صاحبه،
// فزرٌّ عليه يفشل دائمًا.
function _pfExpandHtml(m, key) {
  const ids = { key: key, uid: m.uid || "" };
  if (!(typeof can === "function" && can("change_role") && m.role !== "developer")) return "";
  let h = '<div class="pf-team-expand">' + _pfRoleBtn(m, ids);
  if (m.frozen === true) h += _pfActionBtn("unfreeze", ids, buildIcon("checkCircle", 12)+' إلغاء التجميد');
  else h += _pfActionBtn("freeze", ids, buildIcon("shield", 12)+' تجميد');
  h += _pfActionBtn("delete_user", ids, buildIcon("trash", 12)+' حذف');
  return h + '</div>';
}

// ═══ بطاقة عضو كاملة ═══
function _pfMemberHtml(m, key) {
  const look = roleLook(m.role);
  return _pfCardHead(m, key, look) + _pfExpandHtml(m, key) + '</div>';
}

// ═══ بطاقات الفريق كلها ═══
function _pfTeamHtml(data) {
  const keys = Object.keys(data);
  let h = "";
  for (let i = 0; i < keys.length; i++) h += _pfMemberHtml(data[keys[i]], keys[i]);
  return h;
}
`;
}

/** الجزء 9 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart9() {
  return `
// ═══ ربط الضغط للتوسيع ═══
function _pfBindCards(container) {
  const cards = container.querySelectorAll(".pf-team-card");
  for (let ci = 0; ci < cards.length; ci++) {
    cards[ci].addEventListener("click", function(e){
      if (e.target.closest("button")) return;
      this.classList.toggle("expanded");
    });
  }
}

// ═══ طلب تغيير الصلاحية في سجلّ المستخدم ═══
function _pfRoleRequest(key, newRole) {
  return {
    path: "/users/" + key + ".json", method: "PATCH",
    body: {role: newRole, lastUpdatedBy: FB_USER, lastUpdatedAt: new Date().toISOString()}
  };
}

// ═══ هل نجح تغيير الصلاحية؟ وإلا يُقال للموظف ═══
function _pfRoleApplied(chResp) {
  if (chResp.ok) return true;
  _pfNotify("فشل تغيير الصلاحية: " + chResp.error, "error");
  return false;
}

// ═══ الحساب القديم بلا UID لا يُكمَل ═══
function _pfNeedUid(ctx) {
  if (!ctx.uid) throw new Error("الحساب قديم ولا يحتوي Firebase UID");
}

// ═══ ختام تغيير الصلاحية: إشعار وتدقيق وإشعار الشاشة وإعادة تحميل القائمة ═══
function _pfRoleDone(ctx, newRole) {
  if (typeof fbPushNotif === "function")
    fbPushNotif({ type: "profile_updated", title: "تغيير صلاحية", details: ctx.key + " → " + newRole });
  if (typeof auditLog === "function")
    auditLog("change_role", ctx.key + " → " + newRole, ctx.key);
  _pfNotify("تم تغيير الصلاحية", "success");
  loadTeamList(ctx.container);
}
`;
}

/** الجزء 10 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart10() {
  return `
async function _pfChangeRole(ctx) {
  const newRole = ctx.btn.getAttribute("data-new-role");
  if (!(await fqConfirm("تغيير الصلاحية إلى " + newRole + "؟"))) return;
  _pfNotify("جارٍ التغيير...", "loading");
  const chResp = await fqRequest(_pfRoleRequest(ctx.key, newRole));
  if (!_pfRoleApplied(chResp)) return;
  _pfNeedUid(ctx);
  // تحديث سجل الصلاحية المرتبط بهوية Firebase أيضاً
  await pfAdminPatch("/auth/" + ctx.uid + ".json", {role: newRole});
  _pfRoleDone(ctx, newRole);
}

// ═══ ختام التجميد وإلغائه: تدقيق وإشعار وإعادة تحميل ═══
function _pfFrozenDone(ctx, auditAct, msg) {
  if (typeof auditLog === "function")
    auditLog(auditAct, ctx.key, ctx.key);
  _pfNotify(msg, "success");
  loadTeamList(ctx.container);
}

async function _pfFreeze(ctx) {
  if (!(await fqConfirm("تجميد حساب " + ctx.key + "؟"))) return;
  await pfAdminPatch("/users/" + ctx.key + ".json", {frozen: true});
  _pfNeedUid(ctx);
  await pfAdminPatch("/auth/" + ctx.uid + ".json", {frozen: true});
  _pfFrozenDone(ctx, "freeze_user", "تم تجميد الحساب");
}

async function _pfUnfreeze(ctx) {
  await pfAdminPatch("/users/" + ctx.key + ".json", {frozen: false});
  _pfNeedUid(ctx);
  await pfAdminPatch("/auth/" + ctx.uid + ".json", {frozen: false});
  _pfFrozenDone(ctx, "unfreeze_user", "تم إلغاء التجميد");
}

function _pfDeleteNote() {
  if (typeof showToast === "function")
    showToast("حذف حساب Firebase يتطلب خدمة إدارية موثوقة؛ لم تُحذف أي بيانات", "error", 5000);
}

`;
}

/** الجزء 11 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart11() {
  return `
// ═══ توزيع العملية على معالجها ═══
async function _pfDispatch(ctx) {
  if (ctx.action === "change_role") await _pfChangeRole(ctx);
  else if (ctx.action === "freeze") await _pfFreeze(ctx);
  else if (ctx.action === "unfreeze") await _pfUnfreeze(ctx);
  else if (ctx.action === "delete_user") _pfDeleteNote();
}

// ═══ تنفيذ عملية زرّ من أزرار المطوّر ═══
async function _pfRunAction(btn, container) {
  const ctx = { btn: btn, container: container, action: btn.getAttribute("data-action"),
    key: btn.getAttribute("data-key"), uid: btn.getAttribute("data-uid") };
  if (!ctx.key) return;
  try {
    await _pfDispatch(ctx);
  } catch(actionError) {
    _pfNotify("فشل تنفيذ العملية: " + actionError.message, "error");
  }
}

// ═══ ربط أزرار المطوّر ═══
function _pfBindActions(container) {
  const actionBtns = container.querySelectorAll("[data-action]");
  for (let ai = 0; ai < actionBtns.length; ai++) {
    actionBtns[ai].addEventListener("click", async function(e){
      e.stopPropagation();
      await _pfRunAction(this, container);
    });
  }
}
`;
}

/** الجزء 12 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart12() {
  return `
// ═══ فشل جلب القائمة: يُعرض ويُرجع true ═══
function _pfTeamFailed(container, resp) {
  if (resp.ok) return false;
  container.innerHTML = _pfTeamMsg("#E50914", "تعذر التحميل");
  return true;
}

// ═══ قائمة فارغة: تُعرض ويُرجع true ═══
function _pfTeamEmpty(container, data) {
  if (data) return false;
  container.innerHTML = _pfTeamMsg("#777", "لا يوجد أعضاء");
  return true;
}

// ═══ رسم البطاقات وربط أزرارها ═══
function _pfRenderTeam(container, data) {
  container.innerHTML = _pfTeamHtml(data);
  _pfBindCards(container);
  _pfBindActions(container);
}

// ═══ قائمة الفريق — للمشرف والمطوّر ═══
async function loadTeamList(container) {
  container.innerHTML = _pfTeamMsg("#777", "جارٍ التحميل...");
  try {
    const resp = await fbFetchTimeout(FB_URL + "/users.json", null, 15000);
    if (_pfTeamFailed(container, resp)) return;
    const data = await resp.json();
    if (_pfTeamEmpty(container, data)) return;
    _pfRenderTeam(container, data);
  } catch(e) {
    container.innerHTML = _pfTeamMsg("#E50914", "خطأ");
  }
}

`;
}

/** الجزء 13 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart13() {
  return `
// ═══ إضافة الموظف أصبحت تسجيلًا ذاتيًا من شاشة الدخول ═══
let pfAddUserBtn = document.getElementById("pfAddUserBtn");
if (pfAddUserBtn) {
  pfAddUserBtn.addEventListener("click", async function() {
    if (typeof can !== "function" || !can("add_new_user")) return;
    if (typeof showToast === "function")
      showToast("يُنشئ الموظف حسابه من شاشة الدخول باستخدام بريده الحقيقي", "success", 5000);
  });
}

// ═══ إيقاف النظام: الكتابة ثم التدقيق ثم الإشعار ═══
async function _pfEmergencyStop() {
  const stopRes = await fqRequest({
    path: "/system_status.json", method: "PATCH",
    body: {locked: true, lockedBy: FB_USER, lockedAt: new Date().toISOString()}
  });
  if (!stopRes.ok) throw new Error(stopRes.error);
  if (typeof auditLog === "function")
    auditLog("emergency_stop", "system locked", "all");
  if (typeof showToast === "function")
    showToast("تم إيقاف النظام", "error", 5000);
}
`;
}

/** الجزء 14 من 14 من نصّ `getProfileCode()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileCodePart14() {
  return `
// ═══ زر إيقاف النظام — لمن يملك system_emergency_stop ═══
async function _pfEmergencyClick() {
  if (typeof can !== "function" || !can("system_emergency_stop")) return;
  if (!(await fqConfirm("⚠ إيقاف النظام عن جميع المستخدمين؟"))) return;
  if (!(await fqConfirm("تأكيد نهائي: سيتوقف النظام فوراً للجميع."))) return;
  _pfNotify("جارٍ إيقاف النظام...", "loading");
  try {
    await _pfEmergencyStop();
  } catch(stopError) {
    _pfNotify("فشل إيقاف النظام: " + stopError.message, "error");
  }
}

let pfEmergencyBtn = document.getElementById("pfEmergencyBtn");
if (pfEmergencyBtn) {
  pfEmergencyBtn.addEventListener("click", _pfEmergencyClick);
}

// تسجيل آخر ظهور
(function registerLastSeen(){
  if (!FB_EMP_ID || !fbConnected) return;
  setTimeout(function(){
    if (!fbConnected) return;
    // fqRequest لا يُرفض وعدها أبدًا، فالفشل يُقرأ من النتيجة لا من catch.
    fqRequest({
      path: "/users/" + FB_EMP_ID + ".json", method: "PATCH",
      body: {lastSeen: new Date().toISOString()}
    }).then(function(res){
      if (!res.ok) console.warn("[fq_profile] lastSeen: " + res.error);
    });
  }, 3000);
})();
`;
}

module.exports = Object.freeze({ getProfileCode });
