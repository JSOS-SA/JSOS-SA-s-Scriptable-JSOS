"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readText = (root, relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (recordsDir, name) => JSON.parse(fs.readFileSync(path.join(recordsDir, name), "utf8"));
const ids = (items, field) => items.map((item) => item[field]);
const unique = (values, label) => {
  assert.equal(new Set(values).size, values.length, label + " must be unique.");
};
const sameSet = (left, right, label) => {
  const a = Array.from(new Set(left)).sort();
  const b = Array.from(new Set(right)).sort();
  assert.deepEqual(a, b, label + " must match the Markdown view.");
};
const isIsoDateTime = (value) => {
  if (typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    Number.isNaN(Date.parse(value))) {
    return false;
  }
  const datePart = value.slice(0, 10);
  return new Date(datePart + "T00:00:00Z").toISOString().slice(0, 10) === datePart;
};

const runtimeTestMatchesRecord = (item, record) => {
  const test = item.runtimeTest;
  return item.evidenceClass === "Scriptable Runtime test" &&
    test &&
    test.compatibilityRecordId === record.recordId &&
    test.component === record.component &&
    test.apiOrFeature === record.apiOrFeature &&
    test.scriptableVersion === record.installedScriptableVersion &&
    test.osVersion === record.osVersionTarget &&
    test.device === record.deviceTarget &&
    test.executionContext === record.executionContext &&
    test.result === record.actualResult &&
    test.testedAt === record.testedAt;
};

const validateCompatibilityRecord = (record, evidenceRecords, targetsById) => {
  const testStatuses = ["Not Tested", "Tested"];
  const compatibilityStatuses = ["Compatible", "Incompatible", "Not Verified"];
  const supportDecisions = ["Pending", "Unsupported"];
  const actualResults = ["Passed", "Failed", "Inconclusive"];

  assert.ok(record.recordId, "Compatibility records require a record ID.");
  assert.ok(record.targetId && record.component && record.apiOrFeature && record.executionContext);
  assert.ok(record.scriptableVersionTarget && record.osVersionTarget && record.deviceTarget);
  const target = targetsById.get(record.targetId);
  assert.ok(target, "Unknown compatibility target on " + record.recordId + ": " + record.targetId);
  assert.equal(record.deviceTarget, target.deviceTarget,
    "Device target must match the referenced target on " + record.recordId);
  assert.equal(record.osVersionTarget, target.osVersionTarget,
    "OS target must match the referenced target on " + record.recordId);
  assert.equal(record.scriptableVersionTarget, target.scriptableVersionTarget,
    "Scriptable version target must match the referenced target on " + record.recordId);
  assert.ok(Array.isArray(target.contexts) &&
    target.contexts.includes(record.executionContext.toLowerCase()),
  "Execution context must be declared by the referenced target on " + record.recordId);
  assert.ok(testStatuses.includes(record.testStatus), "Unknown test status on " + record.recordId);
  assert.ok(compatibilityStatuses.includes(record.compatibilityStatus),
    "Unknown compatibility status on " + record.recordId);
  assert.ok(supportDecisions.includes(record.supportDecision),
    "Unknown support decision on " + record.recordId);
  assert.ok(Array.isArray(record.evidenceIds), "Evidence IDs must be an array on " + record.recordId);

  for (const evidenceId of record.evidenceIds) {
    assert.ok(evidenceRecords.some((item) => item.id === evidenceId),
      "Unknown evidence ID " + evidenceId);
  }

  if (record.testStatus === "Not Tested") {
    assert.equal(record.testedAt, null, "Untested records must not have a test timestamp: " + record.recordId);
    assert.equal(record.actualResult, null, "Untested records must not have an actual result: " + record.recordId);
    assert.equal(record.compatibilityStatus, "Not Verified",
      "Untested records must remain Not Verified: " + record.recordId);
  }

  if (record.testStatus === "Tested") {
    assert.ok(isIsoDateTime(record.testedAt),
      "Tested records require an ISO 8601 timestamp with a timezone: " + record.recordId);
    assert.ok(typeof record.installedScriptableVersion === "string" &&
      record.installedScriptableVersion.length > 0,
    "Tested records require the installed Scriptable version: " + record.recordId);
    assert.ok(actualResults.includes(record.actualResult),
      "Tested records require Passed, Failed, or Inconclusive as the actual result: " + record.recordId);

    const matchingEvidence = evidenceRecords.find((item) =>
      record.evidenceIds.includes(item.id) && runtimeTestMatchesRecord(item, record)
    );
    assert.ok(matchingEvidence,
      "Tested records require referenced runtime evidence matching the exact compatibility tuple: " + record.recordId);
  }

  if (record.compatibilityStatus === "Compatible") {
    assert.equal(record.testStatus, "Tested",
      "Compatible records must have a completed runtime test: " + record.recordId);
    assert.equal(record.actualResult, "Passed",
      "Compatible records require a passing runtime result: " + record.recordId);
    assert.equal(record.installedScriptableVersion, record.scriptableVersionTarget,
      "Compatible records must test the declared Scriptable version target: " + record.recordId);
  }

  if (record.compatibilityStatus === "Incompatible") {
    assert.equal(record.testStatus, "Tested",
      "Incompatible records must have a completed runtime test: " + record.recordId);
    assert.equal(record.actualResult, "Failed",
      "Incompatible records require a failing runtime result: " + record.recordId);
    assert.equal(record.installedScriptableVersion, record.scriptableVersionTarget,
      "Incompatible records must test the declared Scriptable version target: " + record.recordId);
  }
};

const validateRecords = (root) => {
  const recordsDir = path.join(root, "docs", "governance", "records");
  const decisions = readJson(recordsDir, "decision-register.json");
  const compatibility = readJson(recordsDir, "compatibility-records.json");
  const evidence = readJson(recordsDir, "evidence-records.json");
  const exceptions = readJson(recordsDir, "exception-register.json");
  const violations = readJson(recordsDir, "violation-register.json");

  assert.equal(decisions.status, "Approved");
  assert.equal(decisions.count, decisions.decisions.length);
  assert.equal(decisions.decisions.length, 79);
  const supersededScopeDecision = decisions.decisions.find((decision) => decision.id === "Q17");
  const activeScopeDecision = decisions.decisions.find((decision) => decision.id === "Q76");
  assert.ok(supersededScopeDecision && supersededScopeDecision.status === "Superseded" &&
    supersededScopeDecision.supersededBy === "Q76",
  "Q17 must be marked Superseded by Q76.");
  assert.ok(activeScopeDecision && activeScopeDecision.status === "Approved" &&
    activeScopeDecision.policyRuleIds.includes("SCR-COMP-005"),
  "Q76 must be the approved iPhone-only compatibility scope decision.");
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

  const policyText = readText(root, "docs/governance/policy-rules.md");
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

  const targetsById = new Map(compatibility.targets.map((target) => [target.id, target]));
  for (const record of compatibility.records) {
    validateCompatibilityRecord(record, evidence.records, targetsById);
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

  const decisionMarkdown = readText(root, "docs/governance/records/decision-register.md");
  const decisionMarkdownIds = Array.from(decisionMarkdown.matchAll(/^\|\s*((?:G|Q)\d+)\s*\|/gm), (match) => match[1]);
  sameSet(ids(decisions.decisions, "id"), decisionMarkdownIds, "Decision IDs");

  const evidenceMarkdown = readText(root, "docs/governance/evidence-register.md");
  const evidenceMarkdownIds = Array.from(evidenceMarkdown.matchAll(/^\|\s*(E-\d+)\s*\|/gm), (match) => match[1]);
  sameSet(ids(evidence.records, "id"), evidenceMarkdownIds, "Evidence IDs");

  const matrixMarkdown = readText(root, "docs/governance/compatibility-matrix.md");
  const matrixTargetIds = Array.from(matrixMarkdown.matchAll(/^\|\s*(DEV-[A-Z0-9-]+)\s*\|/gm), (match) => match[1]);
  sameSet(ids(compatibility.targets, "id"), matrixTargetIds, "Compatibility target IDs");

  const publicRecords = JSON.stringify({ decisions, compatibility, evidence, exceptions, violations });
  assert.ok(!/AIza[0-9A-Za-z_-]{20,}|-----BEGIN (?:RSA )?PRIVATE KEY-----|"private_key"\s*:|ya29\.[0-9A-Za-z_-]+/.test(publicRecords),
    "Public canonical records must not contain credential material.");

  return {
    decisions: decisions.decisions.length,
    evidence: evidence.records.length,
    compatibilityTargets: compatibility.targets.length,
    compatibilityRecords: compatibility.records.length,
    exceptions: exceptions.records.length,
    violations: violations.records.length
  };
};

if (require.main === module) {
  const counts = validateRecords(process.cwd());
  console.log("PASS: canonical records validated.");
  console.log("decisions=" + counts.decisions);
  console.log("evidence=" + counts.evidence);
  console.log("compatibility_targets=" + counts.compatibilityTargets);
  console.log("compatibility_records=" + counts.compatibilityRecords);
  console.log("exceptions=" + counts.exceptions);
  console.log("violations=" + counts.violations);
}

module.exports = { validateRecords };
