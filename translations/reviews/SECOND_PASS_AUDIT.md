# Second-Pass Translation Audit

**Status:** Second linguistic and semantic review completed. The English specification remains an unapproved draft.
**Source:** `SCRIPTABLE_GOVERNANCE_DECISIONS_Q1-Q75.txt`
**Target:** `translations/UNIFIED_SCRIPTABLE_SPECIFICATIONS_EN_DRAFT.md`
**Termbase:** `dictionaries/SCRIPTABLE_ENGINEERING_TERMINOLOGY_GLOSSARY.md`, `dictionaries/SCRIPTABLE_INITIAL_TERMINOLOGY_GLOSSARY.md`, `GLOSSARY.md`, and `docs/governance/terminology-control-addendum-01.md`.

## Scope and method

The review compares the Arabic source with the English target at paragraph, list-item, table, terminology, and normative-force levels. The Arabic source remains authoritative. The review does not approve the English specification and does not authorize silent changes to the Arabic source.

Local structural and URL checks were run on `oracle-lab-vm` using DuckDB CLI 2.0.0. Git, GitHub CLI, and the GitHub integration were used for repository operations and pull-request checks. Python was not used.

## Technical source verification

The following primary sources were inspected to validate the technical boundaries and terminology used by the translation:

1. Scriptable official documentation: https://docs.scriptable.app/
   - States that Scriptable uses Apple's JavaScriptCore and supports ECMAScript 6.
   - States that Scriptable does not run JavaScript in a browser and that browser-specific objects such as `document` do not exist in the primary Scriptable script environment.
2. Scriptable WebView documentation: https://docs.scriptable.app/webview/
   - Documents WebView as a facility for presenting websites and evaluating JavaScript on websites.
   - Documents `evaluateJavaScript()`, `getHTML()`, `waitForLoad()`, and the loading and presentation methods used in the translation.
3. Apple JavaScriptCore documentation: https://developer.apple.com/documentation/javascriptcore
   - Describes JavaScriptCore as a framework for evaluating JavaScript from Swift, Objective-C, and C-based apps, and for inserting custom objects into JavaScript environments.
   - Its `JSContext`, `JSValue`, `JSVirtualMachine`, `JSManagedValue`, and `JSExport` types do not establish that those types are directly exposed as Scriptable script globals.
4. ECMAScript 2015 specification: https://262.ecma-international.org/6.0/
   - Identifies the June 2015 document as the sixth edition of ECMA-262 and the ECMAScript 2015 Language Specification.
5. DuckDB CLI documentation: https://duckdb.org/docs/current/clients/cli/overview
   - Documents the DuckDB command-line client, SQL execution, and CSV/JSON output modes.
6. GitHub CLI pull-request documentation: https://cli.github.com/manual/gh_pr
   - Documents the pull-request command family used to inspect PR metadata, diffs, and checks.

These sources verify terminology and technical distinctions. They do not prove runtime compatibility for every Scriptable version, iOS version, device, or execution context.

## Confirmed corrections applied in this review

1. Replaced `Compatibility Not Established` with `Not Verified` where the Arabic source says `غير متحقق`. The project decision register's Q53 uses `Not Verified` for unverified versions. The canonical glossary maps the different Arabic phrase `غير مثبت التوافق` to `Compatibility Not Established`; that term is now reserved for that distinct phrase.
2. Added the explicit `غير متحقق` to `Not Verified` mapping to the canonical glossary, while retaining `غير مثبت التوافق` to `Compatibility Not Established` as a separate mapping.
3. Standardized the relevant status labels in sections 8.2, 15.5, and 22 to `Not Verified`. The descriptive adjective in section 4.2 is no longer used as a substitute status label.
4. Replaced `definition statuses` with `definition categories` in section 8.2. The Arabic source says `MUST تسجيل التعريفات` and then lists categories of definition findings.
5. Replaced `operational use prohibited` with `operational reliance on it is prohibited` in section 9.3. This more closely preserves `منع الاعتماد عليها تشغيلياً` without broadening the prohibition from reliance to every possible use.
6. Rephrased the descriptive data-validation sentence in section 11.1 as `are treated as requiring validation`. No `MUST` was added because the Arabic source uses a descriptive construction rather than an explicit obligation.
7. Retained `GitHub Actions are used to run checks appropriate to the project` in section 18.1. The Arabic source says `تستخدم` and does not explicitly say `يجب` or `MUST`; the following sentence separately contains the explicit requirement that checks include the listed categories.
8. Reconciled `Apple Native APIs` and `Native iOS APIs`: the addendum's canonical term `Native iOS APIs` remains in the translation. The supplementary glossary's duplicate concept entry was removed, and `Apple Native APIs` is retained as a source wording alias under the canonical `Native iOS APIs` entry.
9. Kept the descriptive adjective in section 4.2 as lowercase `unverified`, reserving the controlled status label `Not Verified` for status entries and findings.

## Terminology decisions

| Concept / source wording | Canonical English | Usage decision |
|---|---|---|
| واجهات Scriptable البرمجية | Scriptable APIs | Use for interfaces exposed by the Scriptable app. |
| واجهات Apple الأصلية / source label `Apple Native APIs` | Native iOS APIs | Use `Native iOS APIs` in translated prose; retain `Apple Native APIs` only as a source wording alias. |
| بيئة تشغيل Scriptable الرئيسية | Scriptable Main Runtime | Project-defined term. |
| بيئة تشغيل WebView | WebView Runtime | Project-defined term. |
| غير متحقق | Not Verified | Controlled status label, supported by decision Q53 and the root project glossary. |
| غير مثبت التوافق | Compatibility Not Established | Separate term; do not substitute it for `غير متحقق`. |
| الزائدة | Excess | Definition-category label. |
| الاعتماد عليها تشغيلياً | operational reliance on it | Do not broaden this to a prohibition on every form of use. |

## Query and discrepancy register

| ID | Location | Question | Resolution | Status |
|---|---|---|---|---|
| TQ-001 | Section 3 layer table | Source label `Apple Native APIs` versus addendum term `Native iOS APIs` | Use the addendum's canonical `Native iOS APIs`; retain `Apple Native APIs` as a source wording alias in the canonical glossary. | Resolved |
| TQ-002 | Section 18.1 | Does the sentence about GitHub Actions carry an explicit mandatory force? | No explicit `يجب` or `MUST` appears in the source sentence. Preserve the descriptive construction and do not strengthen it to `MUST`. | Resolved |
| TQ-003 | Sections 8.2, 15.5, and 22 | `غير متحقق` had been rendered as both `Unverified` and `Compatibility Not Established`. | Use `Not Verified`, supported by decision Q53 and the root project glossary. Reserve `Compatibility Not Established` for `غير مثبت التوافق`. The canonical dictionary now records the distinction. | Resolved |
| TQ-004 | Section 9.3 | `الاعتماد عليها تشغيلياً` had been rendered as `operational use`. | Use `operational reliance on it`, which preserves the source's reliance concept without broadening the prohibition. | Resolved |

No translation query remains open in this review. This does not constitute approval of the English specification.

## Unit tracking

| Unit | Source range | Second-pass status |
|---|---|---|
| T-001 | Metadata, sections 1–3 | Reviewed. Runtime-layer terminology and the Native iOS APIs alias were reconciled. |
| T-002 | Sections 4–6 | Reviewed. ECMAScript baseline, normative force, and definition categories were checked. |
| T-003 | Sections 7–9 | Reviewed. Main Runtime/WebView separation, TypeScript terminology, and operational reliance wording were checked. |
| T-004 | Sections 10–12 | Reviewed. Architecture, data-validation wording, error handling, security, and privacy requirements were checked. |
| T-005 | Sections 13–15.2 | Reviewed. Performance, target contexts, testing layers, and tool limitations were checked. |
| T-006 | Sections 15.3–16.4 | Reviewed. Tool authority, compatibility matrix, `Not Verified` status, authority order, and normative vocabulary were checked. |
| T-007 | Sections 17–19 | Reviewed. Exception and violation lifecycles, GitHub checks, branch protection, and change-management wording were checked. TQ-002 was resolved without adding a new obligation. |
| T-008 | Sections 20–23 | Reviewed. Reverification triggers, reference hierarchy, four compatibility dimensions, and seven approval conditions were checked. |
| T-009 | Sections 24–25 | Reviewed. Reference entries and URL usage rules were checked against the source. |

## Mechanical verification results

- The source and target each contain 49 URL occurrences.
- DuckDB multiset comparison found no missing, additional, or differently repeated URL.
- All 25 top-level English sections are present.
- Both lifecycle sequences are preserved exactly.
- The Arabic source file was not modified.
- `git diff --check` passed after the final edits on 2026-11-14.
- All four GitHub check runs completed successfully for the final PR head `a3b0fb450a34fff83a7c2535e0261a2a6e21615f` on 2026-11-14: CodeQL, quality-gates, Analyze (javascript-typescript), and Analyze (actions).

## Approval boundary

- All nine units have completed this second linguistic and semantic review.
- No unit is marked `Approved` by this audit.
- The English specification remains a draft.
- On 2026-11-14, the owner explicitly authorized merging this reviewed revision into `main`.
- This authorization permits publication of the current draft revision only; it does not approve the English translation as final.
- The English specification remains a draft and must retain its `Not approved` translation status until the owner separately approves the final text.
