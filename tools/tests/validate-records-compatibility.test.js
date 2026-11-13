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
  const nextEvidenceNumber = evidence.records.reduce((maximum, item) => {
    const match = /^E-(\d+)$/.exec(item.id);
    return match ? Math.max(maximum, Number(match[1])) : maximum;
  }, 0) + 1;
  const evidenceId = "E-" + String(nextEvidenceNumber).padStart(3, "0");
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

const nonIPhoneTargetRoot = createFixture();
const nonIPhoneCompatibility = readJson(nonIPhoneTargetRoot, "compatibility-records.json");
nonIPhoneCompatibility.targets[0].deviceTarget = "Unsupported device class";
writeJson(nonIPhoneTargetRoot, "compatibility-records.json", nonIPhoneCompatibility);
assert.throws(() => validateRecords(nonIPhoneTargetRoot),
  /Compatibility targets must be iPhone-only/,
  "The canonical compatibility validator must reject targets outside the approved iPhone scope.");

const nonIosTargetRoot = createFixture();
const nonIosCompatibility = readJson(nonIosTargetRoot, "compatibility-records.json");
nonIosCompatibility.targets[0].osVersionTarget = "Unsupported OS 15.8.8";
writeJson(nonIosTargetRoot, "compatibility-records.json", nonIosCompatibility);
assert.throws(() => validateRecords(nonIosTargetRoot),
  /Compatibility targets must use iOS versions/,
  "The canonical compatibility validator must reject OS targets outside the approved iOS scope.");

const iphone15ProMaxRoot = createFixture();
const iphone15ProMax = readJson(iphone15ProMaxRoot, "compatibility-records.json");
const iphone15ProMaxTarget = iphone15ProMax.targets.find((target) =>
  target.id === "DEV-IPHONE-15-PRO-MAX-27"
);
assert.ok(iphone15ProMaxTarget, "The user-tested iPhone 15 Pro Max tuple must be a distinct target.");
assert.equal(iphone15ProMaxTarget.deviceTarget, "iPhone 15 Pro Max");
assert.equal(iphone15ProMaxTarget.osVersionTarget, "iOS 27.2");
assert.equal(iphone15ProMaxTarget.scriptableVersionTarget, "1.7.12");
const iphone15ProMaxRecords = iphone15ProMax.records.filter((record) =>
  record.targetId === iphone15ProMaxTarget.id
);
assert.equal(iphone15ProMaxRecords.length, 4,
  "The iPhone 15 Pro Max target must have four separately scoped context records.");
assert.deepEqual(iphone15ProMaxRecords.map((record) => record.executionContext).sort(),
  ["in-app", "in-app", "WebView", "Widget"].sort());
const iphone15ProMaxEvidence = readJson(iphone15ProMaxRoot, "evidence-records.json");
for (const record of iphone15ProMaxRecords) {
  const runtimeEvidence = iphone15ProMaxEvidence.records.find((item) =>
    record.evidenceIds.includes(item.id) && item.runtimeTest
  );
  assert.ok(runtimeEvidence, "Each tested context must have its own runtime evidence record.");
  assert.equal(runtimeEvidence.timestampSource,
    "https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/issues/11#issuecomment-6861874218");
  assert.equal(runtimeEvidence.versionSource,
    "https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/issues/11#issuecomment-6860697188");
  assert.equal(record.testStatus, "Tested");
  assert.equal(record.compatibilityStatus, "Not Verified");
  assert.equal(record.supportDecision, "Pending");
  assert.equal(record.installedScriptableVersion, "1.7.12");
  assert.equal(record.testedAt, "2026-11-13T20:00:00+03:00");
  assert.equal(record.actualResult, "Passed");
}
assert.doesNotThrow(() => validateRecords(iphone15ProMaxRoot),
  "User-reported pass results must be recorded without upgrading compatibility status.");

const contextMismatchRoot = createFixture();
const contextMismatchRecords = readJson(contextMismatchRoot, "compatibility-records.json");
const contextMismatchRecord = contextMismatchRecords.records.find((record) =>
  record.targetId === "DEV-IPHONE-15-PRO-MAX-27"
);
assert.ok(contextMismatchRecord, "The iPhone 15 Pro Max main-runtime record must exist.");
const contextMismatchEvidence = readJson(contextMismatchRoot, "evidence-records.json");
const contextMismatchItem = contextMismatchEvidence.records.find((item) =>
  contextMismatchRecord.evidenceIds.includes(item.id) && item.runtimeTest
);
assert.ok(contextMismatchItem, "The main-runtime record must reference tuple-specific runtime evidence.");
contextMismatchItem.runtimeTest.executionContext = "Widget";
writeJson(contextMismatchRoot, "evidence-records.json", contextMismatchEvidence);
assert.throws(() => validateRecords(contextMismatchRoot),
  /runtime evidence matching the exact compatibility tuple/,
  "Evidence from another execution context must not support a record.");

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
