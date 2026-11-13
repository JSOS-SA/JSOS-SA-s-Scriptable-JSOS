"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(process.cwd(), "src", "fq_add_airport.js");
const source = fs.readFileSync(sourcePath, "utf8");
const start = source.indexOf("function _insertAirportEntry(");
const end = source.indexOf("\n}\n", start);

assert.notEqual(start, -1, "The production insertion function must exist.");
assert.notEqual(end, -1, "The production insertion function must have a closing brace.");

const declaration = source.slice(start, end + 2);
const functionContext = {};
vm.runInNewContext(
  declaration + "\nthis.insertAirportEntry = _insertAirportEntry;",
  functionContext
);

const content = "const AIRPORTS = {\n};\n\nmodule.exports = { AIRPORTS };";
const city = "City with \\ backslash, \" quotes, newline\nand separators " + String.fromCharCode(8232, 8233);
const country = "Country with \\ path, \" quote, carriage return\r\nand closing syntax }, injected: true";
const output = functionContext.insertAirportEntry(content, {
  code: "TST",
  city,
  country
});

assert.equal(typeof output, "string", "A valid anchor should produce updated source.");
const executionContext = { module: { exports: {} } };
vm.runInNewContext(output, executionContext);

assert.deepEqual(
  JSON.parse(JSON.stringify(executionContext.module.exports.AIRPORTS.TST)),
  { d: country, c: city },
  "Generated JavaScript must preserve the exact original strings."
);
assert.deepEqual(
  Object.keys(executionContext.module.exports.AIRPORTS),
  ["TST"],
  "Untrusted string contents must not inject additional object properties."
);
assert.equal(
  functionContext.insertAirportEntry("no insertion anchor", { code: "TST", city, country }),
  null,
  "A missing anchor must not modify the source."
);

console.log("PASS: airport string serialization preserves hostile input without code injection.");
