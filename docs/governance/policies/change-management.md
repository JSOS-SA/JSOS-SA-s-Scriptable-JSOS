# Change Management Policy

**Rules:** SCR-CHG-001, SCR-CHG-002, SCR-GOV-001, SCR-GOV-002.

## Change lifecycle

A normative change follows:

1. Proposal.
2. Scope and impact analysis.
3. Review.
4. Approval.
5. Version classification.
6. Publication.
7. Synchronization of affected records and documentation.
8. Verification after release.

A file edit alone does not make a normative change effective.

## Breaking changes and deprecation

A breaking change includes an incompatible change to an existing script, API contract, output, side effect, or runtime requirement.

A deprecation record identifies the reason, affected components and users, replacement, transition period, compatibility impact, and release.

## Conflict resolution

Conflicting rules are recorded with their sources, precedence, and scope. The higher-precedence rule remains in force until a formal change resolves the conflict.

## Impact analysis

Changes affecting multiple rules, components, contexts, or evidence records identify dependencies, affected tests, affected evidence, residual risks, and rollback considerations.

## Rule lifecycle

Rules use Proposed, Active, Deprecated, and Retired. IDs are stable and never reused. Retired rules remain traceable to their replacement or retirement reason.

## Versioning

The Constitution uses Semantic Versioning:

- Major: incompatible normative change.
- Minor: backward-compatible policy or capability addition.
- Patch: clarification or correction that does not change normative behavior.

Every release records the version, date, approver, rationale, and affected decisions.
