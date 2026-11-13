# Evidence and Exceptions Policy

**Rules:** SCR-EVID-001 through SCR-EVID-003, SCR-COMP-004, SCR-EXC-001, SCR-EXC-002.

## Evidence classes

Evidence is classified as:

- Official documentation.
- Scriptable Runtime test.
- CI result.
- TypeScript or static-analysis result.
- Community report.
- Untested inference.

The evidence class and its limitations must be explicit.

## Required evidence fields

A material test record includes:

- Stable evidence ID.
- Component and API.
- Scriptable and iOS/iPadOS versions.
- Exact device.
- Execution context.
- Reproduction steps and inputs.
- Expected and actual result.
- Date and tester role.
- Source or artifact reference.
- Limitations and risk assessment.

## Evidence validity

Evidence is valid only for the scope it actually covers. It may require re-verification after platform, version, API, device, context, dependency, or threat changes.

The states are:

- Valid for its recorded scope.
- Requires re-verification.
- Superseded.

Superseded evidence remains in history.

## Conflicting evidence

Failed, contradictory, and historical evidence is retained. The review identifies differences in environment, versions, context, inputs, and reproduction steps. It does not delete evidence merely because a newer result disagrees.

## Risk assessment

Every material risk assessment considers likelihood, impact severity, and difficulty of detection. The rationale and residual risk are recorded.

## Exception lifecycle

Exceptions follow Proposed, Reviewed, Approved, Active, and Expired or Revoked. Each exception identifies the rule, scope, reason, risk, compensating controls, approver, start date, expiry date, and evidence.

No exception is open-ended or automatically renewed. Renewal requires a new review and approval. An exception does not rewrite the underlying rule.
