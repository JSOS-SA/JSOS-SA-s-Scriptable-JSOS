# Exception Register

No active policy exceptions are recorded in this register.

## Required record fields

| Field | Description |
|---|---|
| Exception ID | Stable unique identifier. |
| Policy Rule ID | The rule being excepted. |
| Status | Proposed, Reviewed, Approved, Active, Expired, or Revoked. |
| Scope | Exact components, APIs, versions, devices, contexts, and operations. |
| Reason | Why the exception is required. |
| Risk | Likelihood, impact severity, and detection difficulty. |
| Compensating Controls | Controls that reduce the residual risk. |
| Approver | Verified role and approval reference. |
| Start Date | Date the exception becomes active. |
| Expiry Date | Mandatory end date. |
| Evidence | Links to supporting evidence. |
| Review History | Reassessments, renewals, revocations, and decisions. |

Exceptions MUST NOT be open-ended or renewed automatically. Sensitive credential details MUST NOT be copied into this public register.
