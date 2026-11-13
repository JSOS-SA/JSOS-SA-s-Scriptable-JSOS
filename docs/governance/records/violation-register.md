# Violation and Remediation Register

This register records policy violations and their remediation without duplicating sensitive security-alert details.

## Current violations

| Violation ID | Policy Rule | Status | Severity | Scope | Evidence |
|---|---|---|---|---|---|
| V-2026-001 | SCR-SEC-001 | Assigned | Critical | Exposed Google API and service-account credentials in the public repository history/current tree | E-045 |
| V-2026-002 | SCR-SEC-004 | Remediated on pull-request branch | High | Incomplete escaping when generating airport JavaScript source | E-046, E-048, E-049, E-050, E-051, E-052, E-053, E-054, E-053 |

## Required workflow

Detected -> Classified -> Assigned -> Remediated or Exception Requested -> Verified -> Closed.

## Required record fields

| Field | Description |
|---|---|
| Violation ID | Stable unique identifier. |
| Policy Rule ID | Rule that was violated. |
| Detection Date | When the issue was identified. |
| Scope | Affected component, API, version, device, or context. |
| Severity | Critical, High, Medium, or Low. |
| Risk | Likelihood, impact severity, and detection difficulty. |
| Owner | Responsible role. |
| Remediation | Corrective action and source change. |
| Evidence | Reproduction steps and proof. |
| Exception Reference | Approved exception, if any. |
| Verification | Independent or designated verification result. |
| Closure Date | Date the violation was verified and closed. |

Credential values, secret snippets, sensitive paths, and private vulnerability details MUST remain in the appropriate private GitHub Security records, not this public register.
