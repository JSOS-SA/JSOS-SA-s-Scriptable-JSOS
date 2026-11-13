// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: shield-alt;

const FORBIDDEN_FIELDS = Object.freeze([
  "password", "pass", "idToken", "refreshToken", "token",
  "authorization", "apiKey", "secret", "cookie", "auth",
]);

/** @returns {Array<string>} أسماء الحقول التي لا تدخل سجل الرصد. */
function getForbiddenMonitorFields() {
  return FORBIDDEN_FIELDS.slice();
}

module.exports = Object.freeze({ getForbiddenMonitorFields });
