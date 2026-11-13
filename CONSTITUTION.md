# Scriptable Project Constitution

**Version:** 0.1.0-draft.1

**Status:** Draft for review

**Authority:** Repository Owner

**Effective date:** Upon approval and merge to main

## 1. Purpose

This Constitution establishes the highest normative authority for the Scriptable project. It governs source code, scripts, modules, libraries, dependencies, configuration, tests, development tools, CI, documentation, and project records.

Its purpose is to make compatibility, security, evidence, and change decisions explicit and reproducible.

## 2. Authority and precedence

The normative hierarchy is:

1. Constitution.
2. Policies.
3. Standards.
4. Procedures.
5. Records.
6. References.

A lower layer MUST NOT weaken, replace, or contradict a higher layer. A conflict MUST be recorded and resolved through the formal change process. Until resolution, the higher-precedence rule remains in force.

## 3. Normative language

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are normative terms.

- MUST and MUST NOT define mandatory requirements.
- SHOULD and SHOULD NOT define strong recommendations. A deviation requires a recorded rationale.
- MAY defines a permitted option.

Translations and explanations MUST NOT change the force of a normative keyword.

## 4. Scope

This Constitution applies to the entire project, including:

- Scripts, Modules, Libraries, and Dependencies.
- Scriptable Runtime, Execution Contexts, and Host APIs.
- Main application, WebView, Widget, Shortcuts, Siri, Share Sheet, Notifications, and URL Scheme contexts where used or declared.
- Architecture, configuration, data, tests, and tooling.
- GitHub repository settings, CI workflows, security controls, and documentation.
- Compatibility, Evidence, Exceptions, Decisions, and release records.

Every component MUST declare its applicable execution contexts. A context MUST NOT inherit assumptions from another context without evidence.

## 5. Runtime and compatibility principles

Scriptable's documented main runtime is JavaScriptCore with documented ECMAScript 6 support. ECMAScript 2015 is the project baseline. Newer language features MAY be used only after scope-appropriate runtime evidence is recorded.

The main Scriptable runtime, WebView, and Widget contexts MUST be assessed separately. Browser globals MUST NOT be assumed in the main runtime. Node.js globals MUST NOT be introduced into Scriptable application code.

Official Scriptable documentation defines the documented contract. Reproducible runtime tests establish observed behavior. A conflict between the two MUST be preserved and investigated.

Compatibility is never an unqualified property of an API. It is an assessment of a specific component, API, Scriptable version, iOS version, device, and execution context.

## 6. Architecture and dependencies

The project architecture uses Core, Data, Services, Features, and UI layers, with Scriptable Host APIs treated as explicit boundary dependencies.

Script, Module, Library, and Dependency are distinct concepts and MUST be recorded as such.

External runtime dependencies are prohibited by default. A dependency requires source, version, license, transitive dependency, security, runtime, and compatibility review before approval.

## 7. Verification and enforcement

Verification uses distinct layers:

- Syntax validation.
- Static analysis.
- Type checking.
- Unit testing.
- Integration testing.
- Scriptable Runtime testing on an Apple device.
- Execution-context testing.
- Security testing.

CI success MUST NOT be represented as proof of JavaScriptCore, WebView, Widget, or physical-device behavior unless the relevant test actually ran in that environment.

Enforcement levels are BLOCK, WARN, and GUIDE. A failed or unavailable mandatory check MUST NOT be treated as success.

## 8. Evidence and compatibility records

Every compatibility assessment MUST identify its complete scope and supporting evidence. Evidence records include source type, date, environment, reproduction steps, expected result, actual result, and limitations.

Evidence is valid only for the scope it actually tested. New versions, devices, APIs, contexts, dependencies, or threat conditions may require re-verification.

Conflicting, failed, superseded, and historical evidence MUST be retained and linked. It MUST NOT be silently deleted or replaced.

A component MUST NOT be declared Compatible unless its required scope has sufficient and current evidence. Documented, Tested, Compatible, Incompatible, Not Verified, and Unsupported are not interchangeable labels.

## 9. Risk and security

Risk assessment considers likelihood, impact severity, and difficulty of detection.

Secrets MUST NOT be committed to source, logs, public documentation, or test output. Scriptable secrets belong in appropriate secure storage, such as Keychain. CI credentials belong in GitHub Actions secrets only when required.

Network requests MUST use HTTPS and normal certificate validation. Insecure certificate bypasses require an explicit, narrow, approved exception. Input validation, data minimization, safe retries, and idempotency MUST be considered.

High-risk operations are blocked by default. An exception requires documented approval, scope, risk, compensating controls, and expiry.

Untrusted values MUST be serialized with context-appropriate encoders. Partial manual escaping MUST NOT be used to construct executable source or structured output.

## 10. Exceptions

An Exception never removes or rewrites the underlying Policy Rule. It grants a limited, time-bounded deviation.

The lifecycle is Proposed, Reviewed, Approved, Active, and Expired or Revoked. No exception may be open-ended or renewed automatically. Renewal requires a new review and approval.

## 11. Roles and decisions

The governance model distinguishes Constitution Owner, Change Author, Reviewer, Exception Approver, Compatibility Register Steward, and Release Approver. One person may perform multiple roles when staffing requires it, but the roles remain distinct in the records.

The Repository Owner is the confirmed authority for this repository. Delegations MUST be recorded.

## 12. Rule and change management

Every Policy Rule has a stable identifier, title, normative statement, scope, severity, rationale, source, verification method, exception conditions, and owner.

Rule identifiers are never reused. Rules move through Proposed, Active, Deprecated, and Retired states. Historical rules remain traceable.

Changes follow proposal, scope and impact analysis, review, approval, release, and record synchronization. Breaking changes include incompatible changes to existing scripts, API contracts, outputs, side effects, or runtime requirements.

The Constitution uses Semantic Versioning. Major, Minor, and Patch changes MUST be recorded with rationale and migration impact.

## 13. Repository controls

Changes to policy and code are protected by the same main-branch controls. Main requires pull requests and successful quality-gates and CodeQL checks. Admin enforcement is enabled. Force pushes and branch deletion are disabled. Conversation resolution is required.

The current repository has one collaborator, so required approving reviews are set to zero while the pull-request and status-check requirements remain mandatory. Reassess this setting when an independent maintainer becomes available.

## 14. Records

The project maintains canonical records for:

- Decisions.
- Compatibility assessments.
- Evidence.
- Exceptions.
- Violations and remediation.
- Releases and policy changes.

Structured records are the canonical data source. Human-readable documentation links to those records and MUST NOT create conflicting copies of canonical values.

## 15. Review and effectiveness

The Constitution and its policies MUST be reviewed when significant changes occur in Scriptable, JavaScriptCore, iOS, project architecture, dependencies, or the security threat model.

This draft becomes effective only after approval and merge to main. Until then, it records the approved governance model and proposed normative text without superseding existing repository behavior.
