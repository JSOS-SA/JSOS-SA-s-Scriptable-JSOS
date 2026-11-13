// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: fingerprint;

/**
 * يبني بصمة FNV-1a ثابتة من هوية المشكلة.
 * @param {Object} parts
 * @returns {string}
 */
function buildMonitorFingerprint(parts) {
  const source = [parts.type, parts.message, parts.fileName, parts.functionName, parts.line, parts.systemVersion].join("|").toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

module.exports = Object.freeze({ buildMonitorFingerprint });
