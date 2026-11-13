"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { validateRecords } = require("../governance/validate-records");

const repositoryRoot = path.resolve(__dirname, "../..");

const createFixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "scriptable-governance-"));
  fs.cpSync(path.join(repositoryRoot, "docs"), path.join(root, "docs"), { recursive: true });
  return root;
};

const readJson = (root, name) => {
  const file = path.join(root, "docs", "governance", "records", name);
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const writeJson = (root, name, value) => {
  const file = path.join(root, "docs", "governance", "records", name);
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
};

const addRuntimeEvidence = (root, record, result) => {
  const evidence = readJson(root, "evidence-records.json");
  const evidenceId = "E-056";
  const testedAt = "2026-11-13T12:00:00Z";
  evidence.records.push({
    id: evidenceId,
    evidenceClass: "Scriptable Runtime test",
    source: "sanitized fixture output",
    assertion: "A test result was recorded for one exact compatibility tuple.",
    limitations: "Test fixture only.",
    recordedAt: "2026-11-13",
    runtimeTest: {
      compatibilityRecordId: record.recordId,
      component: record.component,
      apiOrFeature: record.apiOrFeature,
      scriptableVersion: record.scriptableVersionTarget,
      osVersion: record.osVersionTarget,
      device: record.deviceTarget,
      executionContext: record.executionContext,
      result: result,
      testedAt: testedAt
    }
  });
  evidence.count = evidence.records.length;
  record.evidenceIds.push(evidenceId);
  const markdownPath = path.join(root, "docs", "governance", "evidence-register.md");
  fs.appendFileSync(markdownPath,
    "| " + evidenceId + " | Scriptable Runtime test | sanitized fixture output | Exact tuple test fixture. | Test fixture only. |\n");
  record.testStatus = "Tested";
  record.installedScriptableVersion = record.scriptableVersionTarget;
  record.testedAt = testedAt;
  record.actualResult = result;
  writeJson(root, "evidence-records.json", evidence);
  return evidence.records[evidence.records.length - 1];
};

const updateFirstCompatibilityRecord = (root, update) => {
  const compatibility = readJson(root, "compatibility-records.json");
  const record = compatibility.records[0];
  update(record);
  writeJson(root, "compatibility-records.json", compatibility);
  return record;
};

const baselineRoot = createFixture();
assert.doesNotThrow(() => validateRecords(baselineRoot),
  "The untouched baseline must remain valid.");

const invalidDecisionLifecycleRoot = createFixture();
const invalidDecisionRegister = readJson(invalidDecisionLifecycleRoot, "decision-register.json");
const oldScopeDecision = invalidDecisionRegister.decisions.find((decision) => decision.id === "Q17");
oldScopeDecision.status = "Approved";
oldScopeDecision.supersededBy = null;
writeJson(invalidDecisionLifecycleRoot, "decision-register.json", invalidDecisionRegister);
assert.throws(() => validateRecords(invalidDecisionLifecycleRoot),
  /Q17 must be marked Superseded by Q76/,
  "The superseded scope decision must not remain active.");

const compatibleRoot = createFixture();
updateFirstCompatibilityRecord(compatibleRoot, (record) => {
  addRuntimeEvidence(compatibleRoot, record, "Passed");
  record.compatibilityStatus = "Compatible";
  record.supportDecision = "Pending";
});
assert.doesNotThrow(() => validateRecords(compatibleRoot),
  "A passing test with exact matching runtime evidence must be accepted.");

const unsupportedButTechnicallyCompatibleRoot = createFixture();
updateFirstCompatibilityRecord(unsupportedButTechnicallyCompatibleRoot, (record) => {
  addRuntimeEvidence(unsupportedButTechnicallyCompatibleRoot, record, "Passed");
  record.compatibilityStatus = "Compatible";
  record.supportDecision = "Unsupported";
});
assert.doesNotThrow(() => validateRecords(unsupportedButTechnicallyCompatibleRoot),
  "Governance support decisions must remain independent from technical compatibility.");

const incompatibleRoot = createFixture();
updateFirstCompatibilityRecord(incompatibleRoot, (record) => {
  addRuntimeEvidence(incompatibleRoot, record, "Failed");
  record.compatibilityStatus = "Incompatible";
});
assert.doesNotThrow(() => validateRecords(incompatibleRoot),
  "A failing test with exact matching runtime evidence must be accepted as Incompatible.");

const inconclusiveRoot = createFixture();
updateFirstCompatibilityRecord(inconclusiveRoot, (record) => {
  addRuntimeEvidence(inconclusiveRoot, record, "Inconclusive");
});
assert.doesNotThrow(() => validateRecords(inconclusiveRoot),
  "An inconclusive test may remain Not Verified.");

const compatibleWithoutEvidenceRoot = createFixture();
updateFirstCompatibilityRecord(compatibleWithoutEvidenceRoot, (record) => {
  record.testStatus = "Tested";
  record.installedScriptableVersion = record.scriptableVersionTarget;
  record.testedAt = "2026-11-13T12:00:00Z";
  record.actualResult = "Passed";
  record.compatibilityStatus = "Compatible";
});
assert.throws(() => validateRecords(compatibleWithoutEvidenceRoot),
  /runtime evidence matching the exact compatibility tuple/,
  "Compatible must be rejected without exact runtime evidence.");

const mismatchedEvidenceRoot = createFixture();
updateFirstCompatibilityRecord(mismatchedEvidenceRoot, (record) => {
  const evidence = addRuntimeEvidence(mismatchedEvidenceRoot, record, "Passed");
  evidence.runtimeTest.device = "Different device";
  const allEvidence = readJson(mismatchedEvidenceRoot, "evidence-records.json");
  allEvidence.records[allEvidence.records.length - 1] = evidence;
  writeJson(mismatchedEvidenceRoot, "evidence-records.json", allEvidence);
  record.compatibilityStatus = "Compatible";
});
assert.throws(() => validateRecords(mismatchedEvidenceRoot),
  /runtime evidence matching the exact compatibility tuple/,
  "Evidence from another device must not support this tuple.");

const invalidUntestedRoot = createFixture();
updateFirstCompatibilityRecord(invalidUntestedRoot, (record) => {
  record.actualResult = "Passed";
});
assert.throws(() => validateRecords(invalidUntestedRoot),
  /Untested records must not have an actual result/,
  "Untested records must not contain a result.");

const incompatibleWithPassingResultRoot = createFixture();
updateFirstCompatibilityRecord(incompatibleWithPassingResultRoot, (record) => {
  addRuntimeEvidence(incompatibleWithPassingResultRoot, record, "Passed");
  record.compatibilityStatus = "Incompatible";
});
assert.throws(() => validateRecords(incompatibleWithPassingResultRoot),
  /Incompatible records require a failing runtime result/,
  "Incompatible must not be asserted from a passing result.");

const mismatchedTargetRoot = createFixture();
updateFirstCompatibilityRecord(mismatchedTargetRoot, (record) => {
  record.deviceTarget = "Different device";
});
assert.throws(() => validateRecords(mismatchedTargetRoot),
  /Device target must match the referenced target/,
  "A record must match the target it references.");

const invalidSupportDecisionRoot = createFixture();
updateFirstCompatibilityRecord(invalidSupportDecisionRoot, (record) => {
  record.supportDecision = "Maybe";
});
assert.throws(() => validateRecords(invalidSupportDecisionRoot),
  /Unknown support decision/,
  "Support decisions must use the declared vocabulary.");

console.log("PASS: compatibility lifecycle accepts valid evidence-backed states and rejects invalid claims.");
