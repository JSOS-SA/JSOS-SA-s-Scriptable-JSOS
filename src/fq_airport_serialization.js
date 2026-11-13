/**
 * Pure source-literal serialization for airport entries.
 * This module has no Scriptable host, browser, or Node.js dependencies.
 */
function _toJavaScriptStringLiteral(value) {
  return JSON.stringify(String(value))
    .replace(new RegExp(String.fromCharCode(8232), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(8233), "g"), "\\u2029");
}

function airportEntrySourceLine(entry) {
  const cityLiteral = _toJavaScriptStringLiteral(entry.city);
  const countryLiteral = _toJavaScriptStringLiteral(entry.country);
  return "  " + entry.code + ": { d: " + countryLiteral + ", c: " + cityLiteral + " },\n";
}

module.exports = {
  airportEntrySourceLine: airportEntrySourceLine
};
