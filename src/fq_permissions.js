// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-orange; icon-glyph: user-shield;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_permissions.js

// ═══ نظام الصلاحيات المركزي ═══
// 3 طبقات: developer > admin > employee

const ROLES = Object.freeze({
  DEVELOPER: "developer",
  ADMIN: "admin",
  EMPLOYEE: "employee",
});

// ═══ اسم كل دور ولونه كما يراهما المستخدم — المصدر الوحيد ═══
// كان كل دور يُكتب اسمه ولونه في أربع شاشات، فصار لشارة «موظف» ثلاثة ألوان
// (أخضر في الملف الشخصي، وبنفسجي في قائمة الفريق، وأزرق في سجلّ التسجيل).
// واعتمد المالك الأزرق للموظف في ٢٠٢٦-٠٩-٣٠.
const ROLE_LOOK = Object.freeze({
  developer: Object.freeze({ label: "مطوّر", color: "#E50914", tint: "rgba(229,9,20,0.08)" }),
  admin:     Object.freeze({ label: "مشرف",  color: "#ca8a04", tint: "rgba(202,138,4,0.15)" }),
  employee:  Object.freeze({ label: "موظف",  color: "#2563eb", tint: "rgba(37,99,235,0.12)" }),
});

// ═══ جدول الصلاحيات الكامل ═══
// true = مسموح، false = ممنوع
const MATRIX = Object.freeze({
  // جداول ورحلات
  // ملاحظة: delete_flight/delete_schedule أُعيدا إلى المشرف فأعلى بعد استعادة
  // بوابة الدخول في fq_auth.js#authGate. فتحُهما للجميع كان إجراءً مؤقتًا حين
  // ألغيت كلمة المرور وصار كل مستخدم employee، فتعذّر على أي أحد الحذف.
  "view_schedules":          { developer: true, admin: true, employee: true  },
  "upload_pdf":              { developer: true, admin: true, employee: true  },
  "add_flight":              { developer: true, admin: true, employee: true  },
  "edit_flight":             { developer: true, admin: true, employee: true  },
  "delete_flight":           { developer: true, admin: true, employee: false },
  "delete_schedule":         { developer: true, admin: true, employee: false },

  // نموذج التسجيل
  "fill_reg_form":           { developer: true, admin: true, employee: true  },
  "edit_own_reg":            { developer: true, admin: true, employee: true  },
  // الموظف يعدّل تسجيل زميله بأمر المالك ٢٠٢٦-١٠-١١: يبقى الكاتب الأصلي وتُضاف حقول المعدِّل،
  // وقاعدة reg_data في القاعدة الحيّة تفرض ذلك (انظر docs/قواعد-الأمان-القاعدة-الرئيسة.md).
  "edit_other_reg":          { developer: true, admin: true, employee: true  },
  "delete_reg":              { developer: true, admin: true, employee: false },

  // تيوب T4 — مفتوح للجميع بقرار المستخدم ٢٠٢٦-٠٩-٢٠.
  // المخرجات في reg_data/t4_reports مشتركة بين كل الموظفين، فكلٌّ يقرأ
  // ويسجّل ويصحّح ويحذف. تقييد أيٍّ منها لاحقًا يكون هنا وحده — طبقة
  // القاعدة في fq_t4_store تسأل هذا الجدول قبل كل عملية.
  "t4_read":                 { developer: true, admin: true, employee: true  },
  "t4_write":                { developer: true, admin: true, employee: true  },
  "t4_delete":               { developer: true, admin: true, employee: true  },
  "t4_delete_all":           { developer: true, admin: true, employee: true  },

  // دليل التسجيل
  "read_guide":              { developer: true, admin: true, employee: true  },
  "edit_guide":              { developer: true, admin: true, employee: false },
  "export_guide":            { developer: true, admin: true, employee: false },

  // ═══ المشرف مساوٍ للمطوّر — قرار المالك ٢٠٢٦-٠٩-٢٩ ═══
  // «تأكيد أن المشرف له صلاحيات مفتوحة». فكل سطر أدناه كان للمطوّر وحده.
  // وما يبقى للمطوّر وحده ليس هنا بل في هويته: نشر الحزمة (`script_package`
  // في قواعد القاعدة) وحساب المطوّر نفسه (`SOLE_DEVELOPER_UID` في fq_auth.js).

  // قاعدة البيانات
  "view_database":           { developer: true, admin: true, employee: false },
  "edit_database":           { developer: true, admin: true, employee: false },
  "delete_database":         { developer: true, admin: true, employee: false },

  // الرصد
  "view_monitor":            { developer: true, admin: true, employee: false },
  "export_monitor":          { developer: true, admin: true, employee: false },

  // الملف الشخصي
  "edit_own_profile":        { developer: true, admin: true, employee: true  },
  "view_team":               { developer: true, admin: true, employee: false },
  "edit_other_profile":      { developer: true, admin: true, employee: false },
  "change_role":             { developer: true, admin: true, employee: false },
  "freeze_account":          { developer: true, admin: true, employee: false },
  "add_new_user":            { developer: true, admin: true, employee: false },
  "delete_user":             { developer: true, admin: true, employee: false },
  "access_api_keys":         { developer: true, admin: true, employee: false },
  "system_emergency_stop":   { developer: true, admin: true, employee: false },

  // الإشعارات
  "receive_notifications":   { developer: true, admin: true, employee: true  },
  "broadcast_notification":  { developer: true, admin: true, employee: false },

  // النسخ كصورة
  "copy_as_image":           { developer: true, admin: true, employee: true  },

  // النسخ الاحتياطي
  "backup_system":           { developer: true, admin: true, employee: false },
});

// ═══ فحص الصلاحية ═══
/**
 * يتحقق من صلاحية دور معين على إجراء محدد.
 * @param {string} role - دور المستخدم
 * @param {string} action - الإجراء المطلوب
 * @returns {boolean}
 */
function can(role, action) {
  const r = (role || "employee").toLowerCase();
  if (!MATRIX[action]) return false;
  return MATRIX[action][r] === true;
}

// ═══ لا سؤال عن اسم الدور — قرار المالك ٢٠٢٦-٠٩-٣٠ ═══
// أُزيلت isAdminOrAbove وisDeveloper: كل بوابة تسأل `can(إجراء)` وحده، فأي
// تعديل في الجدول يصل إلى كل الشاشات. ففي ٢٠٢٦-٠٩-٢٩ فُتح الجدول للمشرف
// وبقيت لوحة الرصد وتبويب القاعدة مخفيّين عنه لأنهما كانا يسألان عن الاسم.

/**
 * اسم الدور ولونه كما يُعرضان. الدور المجهول يُعرض موظفًا، كما يعامله `can`.
 * @param {string} role - دور المستخدم
 * @returns {{label: string, color: string, tint: string}}
 */
function roleLook(role) {
  const r = (role || "employee").toLowerCase();
  return Object.prototype.hasOwnProperty.call(ROLE_LOOK, r) ? ROLE_LOOK[r] : ROLE_LOOK.employee;
}

// ═══ تصدير جدول الصلاحيات للواجهة (جافاسكربت) ═══
/**
 * يُرجع كود JavaScript لحقن متغيرات الصلاحيات في WebView.
 * @returns {string}
 */
function getPermissionsJs() {
  return "window.PERMISSIONS = " + JSON.stringify(MATRIX) + ";" +
    "window.ROLE_DEVELOPER = \"" + ROLES.DEVELOPER + "\";" +
    "window.ROLE_ADMIN = \"" + ROLES.ADMIN + "\";" +
    "window.ROLE_EMPLOYEE = \"" + ROLES.EMPLOYEE + "\";" +
    "function can(action){if(!PERMISSIONS[action])return false;" +
    "return PERMISSIONS[action][FB_ROLE]===true;}" +
    "window.ROLE_LOOK = " + JSON.stringify(ROLE_LOOK) + ";" +
    "function roleLook(role){const r=String(role||\"employee\").toLowerCase();" +
    "return Object.prototype.hasOwnProperty.call(ROLE_LOOK, r)?ROLE_LOOK[r]:ROLE_LOOK.employee;}";
}

// ═══ أسماء الإجراءات (ثوابت آمنة النوع) ═══
const ACTIONS = Object.freeze({
  VIEW_SCHEDULES:        "view_schedules",
  UPLOAD_PDF:            "upload_pdf",
  ADD_FLIGHT:            "add_flight",
  EDIT_FLIGHT:           "edit_flight",
  DELETE_FLIGHT:         "delete_flight",
  DELETE_SCHEDULE:       "delete_schedule",
  FILL_REG_FORM:         "fill_reg_form",
  EDIT_OWN_REG:          "edit_own_reg",
  EDIT_OTHER_REG:        "edit_other_reg",
  DELETE_REG:            "delete_reg",
  T4_READ:               "t4_read",
  T4_WRITE:              "t4_write",
  T4_DELETE:             "t4_delete",
  T4_DELETE_ALL:         "t4_delete_all",
  READ_GUIDE:            "read_guide",
  EDIT_GUIDE:            "edit_guide",
  EXPORT_GUIDE:          "export_guide",
  VIEW_DATABASE:         "view_database",
  EDIT_DATABASE:         "edit_database",
  DELETE_DATABASE:       "delete_database",
  VIEW_MONITOR:          "view_monitor",
  EXPORT_MONITOR:        "export_monitor",
  EDIT_OWN_PROFILE:      "edit_own_profile",
  VIEW_TEAM:             "view_team",
  EDIT_OTHER_PROFILE:    "edit_other_profile",
  CHANGE_ROLE:           "change_role",
  FREEZE_ACCOUNT:        "freeze_account",
  ADD_NEW_USER:          "add_new_user",
  DELETE_USER:           "delete_user",
  ACCESS_API_KEYS:       "access_api_keys",
  SYSTEM_EMERGENCY_STOP: "system_emergency_stop",
  RECEIVE_NOTIFICATIONS: "receive_notifications",
  BROADCAST_NOTIFICATION:"broadcast_notification",
  COPY_AS_IMAGE:         "copy_as_image",
  BACKUP:                "backup_system",
});

module.exports = Object.freeze({
  ROLES,
  MATRIX,
  ACTIONS,
  ROLE_LOOK,
  can,
  roleLook,
  getPermissionsJs,
});
