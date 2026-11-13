// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: id-card;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_profile_html.js

/**
 * @module fq_profile_html
 * @description هيكل HTML للملف الشخصي فقط.
 */

const icons = importModule("fq_icons");

/**
 * يُرجع HTML الملف الشخصي.
 * @returns {string}
 */
function getProfileHtml() {
  const ic = (n, sz) => icons.buildIcon(n, { size: sz || 18 });
  return getProfileHtmlPart1(ic) +
    getProfileHtmlPart2(ic) +
    getProfileHtmlPart3();
}

/** الجزء 1 من 3 من نصّ `getProfileHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileHtmlPart1(ic) {
  return `
<div id="profilePanel" style="display:none">
  <div class="app">
    <div class="hd"><p>الملف الشخصي</p></div>

    <div id="profileCard" class="pf-card">
      <div class="pf-avatar-wrap">
        <div class="pf-avatar" id="pfAvatar">
          <span class="pf-avatar-icon">${ic("user", 36)}</span>
        </div>
      </div>
      <div class="pf-info" id="pfInfo">
        <div class="pf-name" id="pfName">—</div>
        <div class="pf-role" id="pfRole">—</div>
        <div class="pf-detail" id="pfJobTitle">—</div>
        <div class="pf-detail" id="pfEmpId">—</div>
        <div class="pf-detail" id="pfLocation">—</div>
        <div class="pf-detail" id="pfStatus">—</div>
        <div class="pf-detail" id="pfRegCount">—</div>
      </div>
      <div class="pf-edit-bar">
        <button class="pf-edit-btn" id="pfEditBtn">${ic("edit", 14)}<span> تعديل</span></button>
        <button class="pf-save-btn" id="pfSaveBtn" style="display:none">${ic("save", 14)}<span> حفظ</span></button>
      </div>
    </div>
`;
}

/** الجزء 2 من 3 من نصّ `getProfileHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileHtmlPart2(ic) {
  return `
    <!-- نموذج تعديل البيانات -->
    <div id="pfEditForm" class="pf-edit-form" style="display:none">
      <div class="pf-field">
        <label>الاسم</label>
        <input type="text" id="pfEditName">
      </div>
      <div class="pf-field">
        <label>الموقع</label>
        <select id="pfEditLocation" multiple size="4">
          <option value="مسار 1">مسار 1</option>
          <option value="مسار 2">مسار 2</option>
          <option value="مسار 3">مسار 3</option>
          <option value="مسار 4">مسار 4</option>
          <option value="مسار 5">مسار 5</option>
          <option value="مسار 6">مسار 6</option>
          <option value="مسار 7">مسار 7</option>
          <option value="تسجيل الحافلات">تسجيل الحافلات</option>
          <option value="معد محاضر">معد محاضر</option>
          <option value="دعم مسارات">دعم مسارات</option>
          <option value="جولات تفقدية">جولات تفقدية</option>
        </select>
      </div>
      <div class="pf-field">
        <label>الحالة</label>
        <select id="pfEditStatus">
          <option value="حاضر">حاضر</option>
          <option value="غائب">غائب</option>
        </select>
      </div>
    </div>

    <!-- قسم فريق العمل — للمشرف والمطوّر -->
    <div id="pfTeamSection" style="display:none">
      <div class="pf-team-title">${ic("users", 18)}<span> فريق العمل</span></div>
      <div id="pfTeamList"></div>
    </div>

    <!-- لوحة الإدارة — للمطوّر والمشرف (قرار المالك ٢٠٢٦-٠٩-٢٩) -->
    <div id="pfDevSection" style="display:none">
      <div class="pf-team-title">${ic("settings", 18)}<span> لوحة الإدارة</span></div>
      <button class="pf-dev-btn" id="pfAddUserBtn">${ic("plus", 14)}<span> إضافة موظف جديد</span></button>
      <button class="pf-dev-btn pf-dev-danger" id="pfEmergencyBtn">${ic("alertTriangle", 14)}<span> إيقاف النظام</span></button>
    </div>

  </div>`;
}

/** الجزء 3 من 3 من نصّ `getProfileHtml()` — يُضمّ فيها بالترتيب، ولا يُستدعى وحده. */
function getProfileHtmlPart3() {
  return `
</div>`;
}

module.exports = Object.freeze({ getProfileHtml });
