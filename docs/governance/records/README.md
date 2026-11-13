# Governance Records

## Canonical structured data

The JSON files in this directory are the canonical machine-readable records:

- [Decision Register Data](decision-register.json)
- [Compatibility Records](compatibility-records.json)
- [Evidence Records](evidence-records.json)
- [Exception Records](exception-register.json)
- [Violation and Remediation Records](violation-register.json)

Human-readable Markdown pages are explanatory views and schemas:

- [Approved Decision Register](decision-register.md)
- [Compatibility Matrix](../compatibility-matrix.md)
- [Evidence Register](../evidence-register.md)
- [Exception Register](exception-register.md)
- [Violation and Remediation Register](violation-register.md)

CI validates identifiers, references, required fields, lifecycle states, and synchronization between canonical JSON and the human-readable decision/evidence/compatibility views. Do not edit a human-readable view without updating its canonical JSON record.

Sensitive credential values, secret snippets, private vulnerability details, device identifiers, and personal information must remain out of public records. Reference private GitHub Security alerts by evidence ID and record only the minimum non-sensitive metadata needed for auditability.

## Approved compatibility scope

The active compatibility target set is iPhone-only under decision Q76 and policy rule SCR-COMP-005. Every target must identify an iPhone model and an iOS version. The canonical validator rejects targets outside that scope. Historical source evidence is retained with assertions limited to the iPhone scope used by this project.

## Compatibility record lifecycle

Compatibility records keep three independent dimensions:

- `testStatus`: `Not Tested` or `Tested`.
- `compatibilityStatus`: `Not Verified`, `Compatible`, or `Incompatible`.
- `supportDecision`: `Pending` or `Unsupported`.

`Unsupported` is a governance decision, not a synonym for technical incompatibility or missing test evidence.

Every compatibility record must reference a declared target, and its device, OS, Scriptable version, and execution context must match that target. An untested record must have no test timestamp or actual result and must remain `Not Verified`. A tested record requires an installed Scriptable version, a timezone-qualified ISO 8601 test timestamp, an actual result (`Passed`, `Failed`, or `Inconclusive`), and a referenced `Scriptable Runtime test` evidence record.

The runtime evidence record includes a `runtimeTest` object identifying the compatibility record, component, API or feature, installed Scriptable version, OS version, device, execution context, result, and test timestamp. Every value must match the compatibility record. Evidence from another device, version, component, API, or execution context cannot support the record.
When the installed Scriptable version or test timestamp is confirmed in a separate source, preserve that source in `versionSource` or `timestampSource` on the evidence record. Do not infer either value from the probe output when the probe does not expose it.

`Compatible` requires a passing runtime test for the declared Scriptable version target. `Incompatible` requires a failing runtime test for that target. Inconclusive or incomplete assessments remain `Not Verified`. The support decision remains independently assessed.
