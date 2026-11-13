"use strict";

const assert = require("node:assert/strict");
const { airportEntrySourceLine } = require("../../src/fq_airport_serialization");

const city = "City with \\ backslash, \" quotes, newline\nand separators " + String.fromCharCode(8232, 8233);
const country = "Country with \\ path, \" quote, carriage return\r\nand closing syntax }, injected: true";
const line = airportEntrySourceLine({
  code: "TST",
  city: city,
  country: country
});

const match = /^  TST: \{ d: ("(?:\\.|[^"\\])*"), c: ("(?:\\.|[^"\\])*") \},\n$/.exec(line);

assert.ok(match, "The generated line must contain exactly one object property and two JSON string literals.");
assert.equal(JSON.parse(match[1]), country, "Country text must round-trip without alteration.");
assert.equal(JSON.parse(match[2]), city, "City text must round-trip without alteration.");
assert.equal(line.includes(String.fromCharCode(8232)), false, "U+2028 must be escaped for older JavaScript parsers.");
assert.equal(line.includes(String.fromCharCode(8233)), false, "U+2029 must be escaped for older JavaScript parsers.");
assert.equal(line.split("\n").length, 2, "Untrusted line breaks must remain inside the serialized string literals.");

console.log("PASS: airport source-line serialization preserves hostile input without creating executable syntax.");
