# Approved Decision Register

**Status:** Approved  
**Total:** 78 decisions, comprising G1-G3 and Q1-Q75.  
**Source:** User-approved decisions recorded during the governance design process.

| ID | Approved decision | Rule mapping |
|---|---|---|
| G1 | The Constitution has absolute normative authority. | SCR-GOV-001, SCR-CHG-002 |
| G2 | The Constitution applies to the entire project. | SCR-RUN-002, SCR-ARCH-001 |
| G3 | GitHub protection applies to policy files and code alike. | SCR-REPO-001 |
| Q1 | ECMAScript 2015 is the baseline; newer features require proof. | SCR-RUN-001 |
| Q2 | Execution contexts are explicitly separated. | SCR-RUN-002 |
| Q3 | Official documentation defines the documented contract; reproducible tests establish observed behavior. | SCR-COMP-003 |
| Q4 | TypeScript and ESLint are supporting checks, not sources of truth; no DOM or Node globals in the main runtime; target and lib remain separate. | SCR-RUN-001, SCR-RUN-003 |
| Q5 | External libraries are denied by default until reviewed. | SCR-DEP-001 |
| Q6 | Layered verification and automated gates block on failure. | SCR-TEST-001, SCR-TEST-002 |
| Q7 | High-risk operations are blocked by default and require approved exceptions. | SCR-SEC-003 |
| Q8 | Unverified memory limits are not treated as official limits; measurements require evidence. | SCR-EVID-001, SCR-EVID-003 |
| Q9 | Components declare supported contexts explicitly. | SCR-RUN-002 |
| Q10 | Documented, Tested, Compatible, Incompatible, and Not Verified are distinct assessment dimensions. | SCR-COMP-002 |
| Q11 | Source hierarchy is explicit, with Scriptable official documentation first. | SCR-COMP-003 |
| Q12 | GitHub Actions is the mandatory CI gate, separate from device testing. | SCR-TEST-002, SCR-REPO-002 |
| Q13 | Exceptions require approval and documented scope, reason, risk, and controls. | SCR-EXC-001 |
| Q14 | Architecture uses Core, Data, Services, Features, and UI layers with Scriptable Host APIs. | SCR-ARCH-001 |
| Q15 | A central compatibility register records each API or feature assessment. | SCR-COMP-001, SCR-GOV-003 |
| Q16 | Minimum Scriptable and iOS versions are evidence-based, not guessed. | SCR-COMP-004, SCR-COMP-005 |
| Q17 | The device matrix includes iPhone and iPad and records differences. | SCR-COMP-005 |
| Q18 | New, changed, uncertain, or risky APIs require Scriptable Runtime proof. | SCR-TEST-003 |
| Q19 | Backward compatibility and deprecation require reason, affected users, alternative, transition period, and records. | SCR-CHG-001 |
| Q20 | Breaking changes include incompatible changes to scripts, API contracts, outputs, side effects, or runtime requirements. | SCR-CHG-001 |
| Q21 | Enforcement uses BLOCK, WARN, and GUIDE. | SCR-RISK-001 |
| Q22 | Author, reviewer, exception approver, register steward, and policy owner responsibilities are distinct, though one person may hold multiple roles. | SCR-GOV-002 |
| Q23 | A central evidence register records evidence identifiers and metadata. | SCR-EVID-001 |
| Q24 | Normative language uses MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY. | SCR-GOV-001 |
| Q25 | Each rule has an ID, title, statement, scope, severity, rationale, source, verification, exception conditions, and owner. | SCR-GOV-001 |
| Q26 | Explicit precedence prevents lower-level rules from overriding higher-level rules. | SCR-CHG-002 |
| Q27 | Rules apply across scripts, modules, libraries, dependencies, settings, tests, tools, CI, and documentation, with applicability declared. | SCR-ARCH-001 |
| Q28 | Evidence is valid only for its tested scope and must be rechecked after material changes. | SCR-COMP-004 |
| Q29 | Exception lifecycle is Proposed, Reviewed, Approved, Active, Expired or Revoked. | SCR-EXC-001 |
| Q30 | The Constitution uses Semantic Versioning with Major, Minor, and Patch changes. | SCR-GOV-001 |
| Q31 | A compatibility proof unit is a component/API/version/device/context/result/evidence tuple. | SCR-COMP-001 |
| Q32 | Script, Module, Library, and Dependency are distinct concepts. | SCR-ARCH-001 |
| Q33 | Runtime, Execution Context, and Host API are distinct concepts. | SCR-RUN-002 |
| Q34 | Compatibility assessment dimensions are independent, not mutually exclusive states. | SCR-COMP-002 |
| Q35 | Incompatible, Not Verified, and Unsupported are distinct. | SCR-COMP-002 |
| Q36 | Reference sources and proof sources are distinct. | SCR-COMP-003 |
| Q37 | Policy Rule, Scope, Enforcement, Exception, Evidence, and Decision have explicit relationships. | SCR-EXC-001, SCR-EVID-001 |
| Q38 | Each API/version/device/context combination has its own compatibility record. | SCR-COMP-001 |
| Q39 | Evidence classes are explicitly categorized. | SCR-EVID-001 |
| Q40 | Runtime test evidence includes reproduction steps, inputs, expected and actual results, and environment. | SCR-EVID-001 |
| Q41 | Conflicting evidence is retained and analyzed, not deleted. | SCR-EVID-002 |
| Q42 | Evidence is classified as valid for scope, requiring re-verification, or superseded. | SCR-COMP-004 |
| Q43 | Risk uses impact, likelihood, and detection difficulty. | SCR-EVID-003 |
| Q44 | Compatible requires sufficient, current evidence for the declared scope. | SCR-COMP-002, SCR-COMP-004 |
| Q45 | Unknown supported versions are recorded as Pending Verification, not guessed. | SCR-COMP-004 |
| Q46 | Device targets are listed and distinguished from tested devices. | SCR-COMP-005 |
| Q47 | Role responsibilities are defined even if a person holds several roles. | SCR-GOV-002 |
| Q48 | Evidence review is event- and risk-driven, not based on one universal expiry period. | SCR-COMP-004 |
| Q49 | Risk considers likelihood, impact severity, and difficulty of detection. | SCR-EVID-003 |
| Q50 | Every exception has an expiry date. | SCR-EXC-002 |
| Q51 | Violation handling follows a recorded detect, classify, assign, remediate or request exception, verify, and close workflow. | SCR-CHG-002, SCR-EVID-001 |
| Q52 | CI reruns relevant checks after dependency, tool, or governance changes and does not claim device proof. | SCR-TEST-002, SCR-TEST-003 |
| Q53 | Unverified versions remain Not Verified until evidence exists. | SCR-COMP-004 |
| Q54 | Device support is declared only with matrix coverage and evidence. | SCR-COMP-005 |
| Q55 | Role names are defined first; personal assignments require verified authority. | SCR-GOV-002 |
| Q56 | Exception renewal requires a new review and approval. | SCR-EXC-002 |
| Q57 | Evidence review is triggered by material changes and risk. | SCR-COMP-004 |
| Q58 | One structured canonical source holds compatibility records. | SCR-GOV-003 |
| Q59 | CI success cannot replace physical-device or context-specific tests. | SCR-TEST-003 |
| Q60 | Documents are layered into Constitution, Policies, Standards/Procedures, Records, and References. | SCR-GOV-001 |
| Q61 | English is used for normative terms and technical fields, with Arabic explanation where useful. | SCR-GOV-001 |
| Q62 | Rule IDs remain stable and are never reused. | SCR-GOV-001 |
| Q63 | Every rule traces to scope, enforcement, checks, evidence, exceptions, and decisions. | SCR-CHG-002, SCR-REPO-002 |
| Q64 | Constitutional changes follow proposal, impact, review, approval, release, and synchronization. | SCR-CHG-002 |
| Q65 | Rules have Proposed, Active, Deprecated, and Retired lifecycle states. | SCR-GOV-001 |
| Q66 | Human documents and structured canonical data are separated and linked. | SCR-GOV-003 |
| Q67 | A constitutional release requires version classification, record integrity, CI, approval, and date. | SCR-GOV-001, SCR-REPO-002 |
| Q68 | Rule conflicts are recorded and resolved by precedence. | SCR-CHG-002 |
| Q69 | Wide-impact changes require documented impact analysis. | SCR-CHG-002 |
| Q70 | Historical and conflicting evidence is retained. | SCR-EVID-002 |
| Q71 | Failed or untrustworthy enforcement tools produce BLOCKED or INDETERMINATE, not success. | SCR-GOV-004 |
| Q72 | Dependency review includes source, version, integrity, transitive dependencies, security, and license. | SCR-DEP-002 |
| Q73 | A bad release is corrected through a later release with traceable rollback impact, not erased history. | SCR-CHG-002 |
| Q74 | Drift between documentation, rules, tests, and actual behavior is recorded and remediated. | SCR-CHG-002 |
| Q75 | The Constitution is reviewed after major platform, architecture, dependency, or threat-model changes. | SCR-GOV-005 |
