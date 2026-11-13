"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const recordsDir = path.join(root, "docs", "governance", "records");
const readText = (p) => fs.readFileSync(path.join(root, p), "utf8");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(recordsDir, name), "utf8"));
const ids = (items, field) => items.map((item) => item[field]);
const unique = (values, label) => {
  assert.equal(new Set(values).size, values.length, label + " must be unique.");
};
const sameSet = (left, right, label) => {
  const a = Array.from(new Set(left)).sort();
  const b = Array.from(new Set(right)).sort();
  assert.deepEqual(a, b, label + " must match the Markdown view.");
};

const decisions = readJson("decision-register.json");
const compatibility = readJson("compatibility-records.json");
const evidence = readJson("evidence-records.json");
const exceptions = readJson("exception-register.json");
const violations = readJson("violation-register.json");

assert.equal(decisions.status, "Approved");
assert.equal(decisions.count, decisions.decisions.length);
assert.equal(decisions.decisions.length, 78);
unique(ids(decisions.decisions, "id"), "Decision IDs");

assert.equal(evidence.count, evidence.records.length);
assert.ok(evidence.records.length > 0);
unique(ids(evidence.records, "id"), "Evidence IDs");

assert.equal(compatibility.targetCount, compatibility.targets.length);
assert.equal(compatibility.recordCount, compatibility.records.length);
assert.equal(compatibility.records.length, compatibility.targetCount * 4);
unique(ids(compatibility.targets, "id"), "Compatibility target IDs");
unique(ids(compatibility.records, "recordId"), "Compatibility record IDs");

assert.ok(Array.isArray(exceptions.records));
unique(ids(exceptions.records, "id"), "Exception IDs");
for (const exception of exceptions.records) {
  if (exception.status === "Approved" || exception.status === "Active") {
    assert.ok(exception.expiresAt, "Approved or active exceptions require an expiry.");
  }
}

assert.ok(Array.isArray(violations.records));
unique(ids(violations.records, "id"), "Violation IDs");

const policyText = readText("docs/governance/policy-rules.md");
const ruleIds = new Set(
  Array.from(policyText.matchAll(/^###\s+(SCR-[A-Z]+-\d+):/gm), (match) => match[1])
);
assert.ok(ruleIds.has("SCR-SEC-004"), "Safe serialization rule must exist.");

for (const decision of decisions.decisions) {
  assert.ok(decision.id && decision.decision, "Decision records require an ID and decision.");
  for (const ruleId of decision.policyRuleIds) {
    assert.ok(ruleIds.has(ruleId), "Unknown rule ID in decision " + decision.id + ": " + ruleId);
  }
}
for (const record of compatibility.records) {
  assert.ok(record.targetId && record.component && record.apiOrFeature && record.executionContext);
  assert.ok(record.scriptableVersionTarget && record.osVersionTarget && record.deviceTarget);
  assert.equal(record.testStatus, "Not Tested");
  assert.equal(record.compatibilityStatus, "Not Verified");
  assert.equal(record.supportDecision, "Pending");
  for (const evidenceId of record.evidenceIds) {
    assert.ok(evidence.records.some((item) => item.id === evidenceId), "Unknown evidence ID " + evidenceId);
  }
}
for (const violation of violations.records) {
  assert.ok(violation.id && violation.detectedAt && violation.status && violation.severity);
  assert.ok(["Detected", "Classified", "Assigned", "Remediated", "Exception Requested", "Verified", "Closed"].includes(violation.status));
  for (const ruleId of violation.policyRuleIds) {
    assert.ok(ruleIds.has(ruleId), "Unknown policy rule on " + violation.id + ": " + ruleId);
  }
  for (const evidenceId of violation.evidenceIds) {
    assert.ok(evidence.records.some((item) => item.id === evidenceId), "Unknown evidence ID " + evidenceId);
  }
  if (violation.status === "Closed") assert.ok(violation.closedAt, "Closed violations require a closure date.");
  else assert.equal(violation.closedAt, null, "Open violations must not have a closure date.");
}

const decisionMarkdown = readText("docs/governance/records/decision-register.md");
const decisionMarkdownIds = Array.from(decisionMarkdown.matchAll(/^\|\s*((?:G|Q)\d+)\s*\|/gm), (m) => m[1]);
sameSet(ids(decisions.decisions, "id"), decisionMarkdownIds, "Decision IDs");

const evidenceMarkdown = readText("docs/governance/evidence-register.md");
const evidenceMarkdownIds = Array.from(evidenceMarkdown.matchAll(/^\|\s*(E-\d+)\s*\|/gm), (m) => m[1]);
sameSet(ids(evidence.records, "id"), evidenceMarkdownIds, "Evidence IDs");

const matrixMarkdown = readText("docs/governance/compatibility-matrix.md");
const matrixTargetIds = Array.from(matrixMarkdown.matchAll(/^\|\s*(DEV-[A-Z0-9-]+)\s*\|/gm), (m) => m[1]);
sameSet(ids(compatibility.targets, "id"), matrixTargetIds, "Compatibility target IDs");

const publicRecords = JSON.stringify({ decisions, compatibility, evidence, exceptions, violations });
assert.ok(!/AIza[0-9A-Za-z_-]{20,}|-----BEGIN (?:RSA )?PRIVATE KEY-----|"private_key"\s*:|ya29\.[0-9A-Za-z_-]+/.test(publicRecords),
  "Public canonical records must not contain credential material.");

console.log("PASS: canonical records validated.");
console.log("decisions=" + decisions.decisions.length);
console.log("evidence=" + evidence.records.length);
console.log("compatibility_targets=" + compatibility.targets.length);
console.log("compatibility_records=" + compatibility.records.length);
console.log("exceptions=" + exceptions.records.length);
console.log("violations=" + violations.records.length);
