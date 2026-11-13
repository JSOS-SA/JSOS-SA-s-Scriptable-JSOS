# Policy Rule Catalogue

**Status:** Draft for review
**Rule identifiers:** Stable and never reused
**Enforcement:** BLOCK, WARN, GUIDE

All rules are Proposed while this catalogue remains Draft for review. A rule becomes Active only through an approved constitutional release. Every rule below includes its scope, severity, rationale, source, verification method, exception conditions, and owner. The decision register maps the approved decisions to these rules.

## Runtime and compatibility

### SCR-RUN-001: ECMAScript baseline

**Statement:** Project scripts and modules MUST use ECMAScript 2015 as the baseline. Features newer than ES2015 MUST NOT be used until runtime evidence for the required Scriptable versions and contexts is recorded.
**Scope:** All Scriptable JavaScript source, tests, and runtime-loaded modules.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Scriptable documents ECMAScript 6 support, not blanket support for every later ECMAScript feature.
**Source:** Q1, Q4; E-002.
**Verification:** Syntax policy checks plus device Runtime probes for each explicitly approved newer feature.
**Exception:** A narrowly scoped feature exception may be approved after reproducible device testing.
**Owner:** Compatibility Register Steward.

### SCR-RUN-002: Execution-context isolation

**Statement:** Every component MUST declare supported Execution Contexts. Code MUST NOT assume that APIs or globals available in one context exist in another.
**Scope:** In-app, WebView, Widget, Shortcuts/Siri, Share Sheet, Notifications, URL Scheme, and other declared contexts.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Scriptable host capabilities vary by execution context.
**Source:** Q2, Q9, Q33.
**Verification:** Context declarations and separate tests for each claimed context.
**Exception:** No implicit cross-context exception.
**Owner:** Component Author and Reviewer.

### SCR-RUN-003: Main-runtime globals

**Statement:** Main Scriptable code MUST NOT depend on browser DOM globals or Node.js globals unless Scriptable explicitly documents and exposes the corresponding API.
**Scope:** Main Scriptable Runtime and imported Modules.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Scriptable's main runtime is not a browser or Node.js environment.
**Source:** Q4, Q11; E-002.
**Verification:** Static checks and Scriptable device tests.
**Exception:** A documented, context-specific exception may apply only inside an explicitly isolated WebView component.
**Owner:** Runtime Policy Owner.

### SCR-RUN-004: WebView boundary

**Statement:** Browser APIs and DOM access MUST remain inside WebView code. Communication between the main runtime and WebView MUST use explicit, validated message boundaries.
**Scope:** WebView HTML, JavaScript, and main-runtime bridges.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** WebView and JavaScriptCore are distinct execution contexts.
**Source:** Q2, Q9, Q33.
**Verification:** WebView-specific probes and bridge review.
**Exception:** No exception for leaking browser globals into the main runtime.
**Owner:** UI Layer Owner.

### SCR-COMP-001: Compatibility tuple

**Statement:** Every Compatibility Assessment MUST identify the component, API or feature, Scriptable version, iOS version, device, and Execution Context.
**Scope:** All compatibility claims.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Compatibility is scoped to a concrete environment tuple.
**Source:** Q15, Q31, Q38.
**Verification:** Compatibility record schema validation.
**Exception:** No exception for an unscoped compatibility claim.
**Owner:** Compatibility Register Steward.

### SCR-COMP-002: Independent assessment dimensions

**Statement:** Documented, Tested, Compatible, Incompatible, Not Verified, and Unsupported MUST be recorded as distinct assessment dimensions or decisions according to the compatibility schema.
**Scope:** Compatibility records and documentation.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Documentation, test execution, technical compatibility, and governance support are not equivalent.
**Source:** Q10, Q34, Q35, Q44.
**Verification:** Record validation and review.
**Exception:** None.
**Owner:** Compatibility Register Steward.

### SCR-COMP-003: Source and proof hierarchy

**Statement:** Official Scriptable documentation MUST be treated as the documented contract. Reproducible runtime tests MUST be treated as evidence of observed behavior. Type definitions, linters, and community reports MUST NOT override either without explicit analysis.
**Scope:** API and runtime compatibility claims.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Reference sources and proof sources serve different purposes.
**Source:** Q3, Q11, Q36.
**Verification:** Every claim cites its source class and test evidence.
**Exception:** Conflicts require a recorded analysis, not an informal override.
**Owner:** Compatibility Register Steward.

### SCR-COMP-004: Evidence scope and validity

**Statement:** Evidence MUST be used only for the environment and behavior it actually covers. Re-verification MUST occur after material changes to versions, devices, APIs, contexts, dependencies, or threats.
**Scope:** All evidence and compatibility records.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Evidence can become stale or be overgeneralized.
**Source:** Q28, Q42, Q48, Q57.
**Verification:** Evidence review and event-triggered reassessment.
**Exception:** A stale record may remain historical but MUST NOT support a current compatibility claim.
**Owner:** Evidence Steward.

### SCR-COMP-005: iPhone compatibility coverage

**Statement:** The project MUST maintain an iPhone compatibility matrix that distinguishes target iPhone models, documented iOS eligibility, tested iPhone models, and untested iPhone models.
**Scope:** iPhone compatibility targets only.
**Severity / Enforcement:** Medium / WARN.
**Rationale:** Model-specific runtime behavior requires evidence for the exact iPhone target.
**Source:** Q46, Q54, Q76.
**Verification:** iPhone compatibility matrix and on-device evidence.
**Exception:** An unavailable iPhone may be recorded as Not Verified, never as Tested.
**Owner:** Compatibility Register Steward.

## Architecture and dependencies

### SCR-DEP-001: Default-deny external dependencies

**Statement:** External runtime libraries MUST NOT be introduced by default. A proposed dependency MUST pass source, license, version, transitive dependency, security, Scriptable API, and runtime compatibility review.
**Scope:** Runtime Libraries and Dependencies.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Node.js or browser assumptions and transitive dependencies can break Scriptable compatibility.
**Source:** Q5, Q72.
**Verification:** Dependency review record and CI dependency inventory.
**Exception:** Explicit approval with scope, evidence, and expiry where appropriate.
**Owner:** Architecture Owner.

### SCR-ARCH-001: Component and layer boundaries

**Statement:** Scripts, Modules, Libraries, and Dependencies MUST remain distinct in documentation and architecture. Components MUST follow the approved Core, Data, Services, Features, and UI layers, with Scriptable Host APIs treated as explicit boundaries.
**Scope:** Entire source tree and architecture documentation.
**Severity / Enforcement:** Medium / WARN.
**Rationale:** Clear boundaries make dependencies and runtime assumptions reviewable.
**Source:** Q14, Q27, Q32, Q33.
**Verification:** Architecture review and dependency mapping.
**Exception:** A documented exception requires an impact rationale.
**Owner:** Architecture Owner.

### SCR-DEP-002: Supply-chain review

**Statement:** Dependencies and development actions MUST be reviewed for origin, version, license, integrity, security advisories, and transitive impact.
**Scope:** Runtime dependencies, CI actions, and development tooling.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Compatibility alone does not establish supply-chain safety.
**Source:** Q72.
**Verification:** Dependabot, security alerts, pinned actions, and review records.
**Exception:** A temporary exception requires an expiry and compensating controls.
**Owner:** Security Owner.

## Testing and enforcement

### SCR-TEST-001: Layered verification

**Statement:** Changes MUST run all applicable syntax, static, type, unit, integration, runtime-device, context, and security checks.
**Scope:** Code and policy changes.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** No single test layer proves every property.
**Source:** Q6, Q18, Q39.
**Verification:** Test plan and CI results plus device evidence where required.
**Exception:** An omitted layer requires a documented risk-based reason and approval.
**Owner:** Test Owner.

### SCR-TEST-002: CI gates

**Statement:** Applicable automated checks MUST run in GitHub Actions and MUST block protected-branch changes when they fail or cannot produce a trustworthy result.
**Scope:** Pull requests and protected branch updates.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Repeatable automated gates prevent unverified changes from entering main.
**Source:** Q6, Q12, Q52, Q59.
**Verification:** Required quality-gates and CodeQL checks.
**Exception:** Only a formally approved, time-bounded exception where the rule permits it.
**Owner:** CI Owner.

### SCR-TEST-003: Device proof

**Statement:** APIs or language features that are new, changed, uncertain, or risk-sensitive MUST receive Scriptable Runtime evidence on an Apple device for each required context.
**Scope:** Scriptable Host APIs, newer language features, WebView, and Widget behavior.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Node.js, static analysis, and documentation cannot replace device execution.
**Source:** Q18, Q40, Q59.
**Verification:** Reproducible device probe with exact environment metadata.
**Exception:** A compatibility claim remains Not Verified if device proof is unavailable.
**Owner:** Compatibility Register Steward.

### SCR-RISK-001: Enforcement levels

**Statement:** Each rule MUST declare BLOCK, WARN, or GUIDE enforcement. Mandatory checks MUST fail closed when their result is failed, unavailable, or indeterminate.
**Scope:** Policy rules, CI checks, and remediation workflows.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Enforcement behavior must be predictable.
**Source:** Q21, Q71.
**Verification:** Rule metadata and CI behavior tests.
**Exception:** A rule-specific exception may apply only if explicitly defined.
**Owner:** Constitution Owner.

## Security

### SCR-SEC-001: Secret protection

**Statement:** Secrets MUST NOT be committed to source, public documentation, test output, or logs. Scriptable secrets MUST use appropriate secure storage, and CI credentials MUST use GitHub Actions secrets only when required.
**Scope:** Source, configuration, test data, CI, and documentation.
**Severity / Enforcement:** Critical / BLOCK.
**Rationale:** Public or logged credentials can be used outside the intended system.
**Source:** Q7, Q43, Q72.
**Verification:** Secret Scanning, Push Protection, and code review.
**Exception:** No exception for publishing live secrets.
**Owner:** Security Owner.

### SCR-SEC-002: Network request security

**Statement:** Network requests MUST use HTTPS and certificate validation. Insecure certificate bypasses MUST NOT be used except through a narrow, documented, approved exception. Inputs and responses MUST be validated, data minimized, and retries made safe for non-idempotent operations.
**Scope:** Request, API, and network service modules.
**Severity / Enforcement:** Critical / BLOCK.
**Rationale:** Transport and request errors can expose data or cause unintended side effects.
**Source:** Q7, Q43, Q72.
**Verification:** Request review, tests, and security checks.
**Exception:** Explicitly approved, time-bounded, and limited to a non-production test scope.
**Owner:** Security Owner.

### SCR-SEC-003: High-risk operations

**Statement:** High-risk operations MUST be blocked by default and require explicit, documented approval before execution.
**Scope:** Destructive operations, credential changes, data deletion, privileged automation, and irreversible external actions.
**Severity / Enforcement:** Critical / BLOCK.
**Rationale:** Unreviewed high-impact operations can cause irreversible damage.
**Source:** Q7, Q13, Q43.
**Verification:** Change review, approval record, and execution evidence.
**Exception:** Only through the approved Exception lifecycle with compensating controls and expiry.
**Owner:** Exception Approver.

### SCR-SEC-004: Safe serialization of untrusted input

**Status:** Proposed.
**Statement:** Untrusted values MUST be serialized using context-appropriate encoders. Code MUST NOT be constructed by manually escaping only a subset of string metacharacters. Generated source MUST preserve input as data and MUST NOT allow input to alter executable syntax.
**Scope:** Dynamic source generation, JavaScript string literals, HTML, URLs, and other generated executable or structured text.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Partial escaping can permit code or data injection, corrupt generated files, or alter application behavior.
**Source:** Q7, Q43, Q51, Q63.
**Verification:** Static analysis, CodeQL, and regression tests covering quotes, backslashes, control characters, line breaks, Unicode separators, and injection-shaped input.
**Exception:** No exception for executable code injection. Other encoding exceptions require a narrow, documented, approved exception.
**Owner:** Security Owner.

## Evidence, risk, and exceptions

### SCR-EVID-001: Evidence record

**Statement:** Every material compatibility claim, runtime test, exception, and enforcement decision MUST link to a structured evidence record with reproducible steps and environment metadata.
**Scope:** Compatibility, testing, security, and governance records.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Decisions must be auditable and reproducible.
**Source:** Q23, Q31, Q39, Q40.
**Verification:** Evidence schema and record review.
**Exception:** None for material claims.
**Owner:** Evidence Steward.

### SCR-EVID-002: Evidence preservation

**Statement:** Failed, conflicting, superseded, and historical evidence MUST be retained and linked. It MUST NOT be silently replaced or deleted.
**Scope:** Evidence and decision history.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Removing inconvenient evidence hides changes in understanding.
**Source:** Q41, Q42, Q70.
**Verification:** Evidence history review.
**Exception:** Sensitive evidence values may be redacted, but the existence and reason for redaction must be recorded.
**Owner:** Evidence Steward.

### SCR-EVID-003: Risk model

**Statement:** Risk assessments MUST consider likelihood, impact severity, and difficulty of detection.
**Scope:** Exceptions, dependencies, high-risk operations, and compatibility decisions.
**Severity / Enforcement:** Medium / WARN.
**Rationale:** Risk is not captured by impact alone.
**Source:** Q43, Q49.
**Verification:** Risk record contains all three dimensions and an overall rationale.
**Exception:** No exception to recording the dimensions.
**Owner:** Security Owner.

### SCR-EXC-001: Exception lifecycle

**Statement:** Exceptions MUST follow Proposed, Reviewed, Approved, Active, and Expired or Revoked states. Approval MUST identify the approver, scope, reason, risk, controls, and expiry.
**Scope:** Every permitted deviation from a Policy Rule.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Exceptions must remain bounded and auditable.
**Source:** Q13, Q29, Q37, Q50.
**Verification:** Exception register and approval record.
**Exception:** No bypass of the lifecycle.
**Owner:** Exception Approver.

### SCR-EXC-002: Expiry and renewal

**Statement:** Every active exception MUST have an expiry date. Renewal MUST require a new review and approval. Expired exceptions MUST NOT remain active automatically.
**Scope:** All Exceptions.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Temporary risk acceptance must not become permanent by neglect.
**Source:** Q50, Q56.
**Verification:** Expiry checks and exception register review.
**Exception:** No open-ended exception.
**Owner:** Exception Approver.

## Change and governance

### SCR-CHG-001: Compatibility and breaking changes

**Statement:** Backward compatibility and deprecation MUST identify affected users and components, the reason, replacement, transition period, and compatibility-record impact. A change that breaks an existing script, API contract, output, side effect, or runtime requirement is a breaking change.
**Scope:** APIs, scripts, modules, dependencies, and releases.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Breaking changes must be visible and managed.
**Source:** Q19, Q20.
**Verification:** Impact analysis and release notes.
**Exception:** A breaking change may proceed only through the approved change process.
**Owner:** Release Approver.

### SCR-CHG-002: Impact and conflict resolution

**Statement:** Changes affecting multiple rules, components, contexts, or evidence records MUST include impact analysis. Rule conflicts MUST be recorded and resolved by precedence, not by informal choice.
**Scope:** Policy, architecture, source, CI, and security changes.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Wide changes can create hidden regressions or normative contradictions.
**Source:** Q26, Q37, Q63, Q68, Q69, Q74.
**Verification:** Change proposal, traceability, and review.
**Exception:** Emergency handling requires a recorded follow-up review.
**Owner:** Constitution Owner.

### SCR-GOV-001: Stable rule identity and lifecycle

**Statement:** Every rule MUST have a stable, unique ID and a lifecycle state of Proposed, Active, Deprecated, or Retired. IDs MUST NOT be reused.
**Scope:** All Policy Rules.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Stable identity preserves traceability through revisions.
**Source:** Q24, Q25, Q62, Q65.
**Verification:** Rule catalogue validation and history review.
**Exception:** None for ID reuse.
**Owner:** Constitution Owner.

### SCR-REPO-001: Protected main branch

**Statement:** Policy and code changes MUST enter main through pull requests protected by required checks. Force pushes and branch deletion MUST remain disabled.
**Scope:** All project files on main.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Policy and implementation require the same change control.
**Source:** General Decision G3, Q12, Q63.
**Verification:** GitHub branch protection settings.
**Exception:** No direct-push exception unless a formally approved emergency process is added.
**Owner:** Repository Owner.

### SCR-REPO-002: CI and security checks

**Statement:** Protected changes MUST pass quality-gates and CodeQL. CI MUST distinguish static/tooling evidence from device-only runtime evidence.
**Scope:** Pull requests and main branch updates.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Required checks must be repeatable and accurately scoped.
**Source:** Q6, Q12, Q52, Q59, Q67.
**Verification:** Required status checks and workflow records.
**Exception:** A check may be bypassed only under a rule-specific approved exception.
**Owner:** CI Owner.

### SCR-REPO-003: Security monitoring

**Statement:** Secret Scanning, Push Protection, Dependabot Alerts, and CodeQL MUST remain enabled for the repository. Dependency update configuration MUST cover GitHub Actions dependencies.
**Scope:** GitHub repository and CI dependencies.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Public source and automation dependencies require continuous security monitoring.
**Source:** Q7, Q12, Q72.
**Verification:** GitHub security settings and workflow review.
**Exception:** A disabled feature requires documented owner approval and a time-bounded compensating control.
**Owner:** Security Owner.

### SCR-GOV-002: Role accountability

**Statement:** Every governance action MUST identify the responsible role. Role consolidation in a single person MUST be explicit and recorded.
**Scope:** Changes, reviews, exceptions, compatibility records, and releases.
**Severity / Enforcement:** Medium / WARN.
**Rationale:** Accountability must remain clear even with limited staffing.
**Source:** Q22, Q47, Q55.
**Verification:** Role mapping and approval records.
**Exception:** Roles may be combined when staffing requires it, with the limitation recorded.
**Owner:** Constitution Owner.

### SCR-GOV-003: Canonical records

**Statement:** Structured records MUST be the single canonical source for compatibility, evidence, exceptions, and decisions. Human-readable documents MUST link to canonical records and MUST NOT maintain conflicting copies.
**Scope:** Governance documents and registers.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Duplicate records drift and create conflicting facts.
**Source:** Q15, Q23, Q58, Q66.
**Verification:** Record schema and link validation.
**Exception:** A generated view may duplicate data only when its source and generation process are explicit.
**Owner:** Register Steward.

### SCR-GOV-004: Fail-closed verification

**Statement:** A failed, unavailable, or untrustworthy mandatory check MUST be recorded as BLOCKED or INDETERMINATE and MUST NOT be treated as success.
**Scope:** CI, test tooling, evidence collection, and enforcement.
**Severity / Enforcement:** High / BLOCK.
**Rationale:** Missing evidence is not positive evidence.
**Source:** Q6, Q21, Q71.
**Verification:** Failure-path tests and CI status.
**Exception:** Only an explicitly permitted, time-bounded exception.
**Owner:** CI Owner.

### SCR-GOV-005: Periodic constitutional review

**Statement:** The Constitution and its policies MUST be reviewed after material changes to Scriptable, JavaScriptCore, iOS, architecture, dependencies, or the security threat model.
**Scope:** Entire governance system.
**Severity / Enforcement:** Medium / WARN.
**Rationale:** Individually valid rules can become collectively obsolete.
**Source:** Q57, Q75.
**Verification:** Recorded review and resulting decisions.
**Exception:** A review may conclude no change is needed, but the review itself must be recorded.
**Owner:** Constitution Owner.
