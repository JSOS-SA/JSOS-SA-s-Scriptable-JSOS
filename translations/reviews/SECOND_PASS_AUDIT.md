# Second-Pass Translation Audit

**Status:** In progress. The English specification remains an unapproved draft.
**Source:** `SCRIPTABLE_GOVERNANCE_DECISIONS_Q1-Q75.txt`
**Target:** `translations/UNIFIED_SCRIPTABLE_SPECIFICATIONS_EN_DRAFT.md`

## Scope and method

This audit checks source fidelity, normative force, technical meaning, and terminology against the translation methodology in `dictionaries/README.md`, the unified and supplementary glossaries, `GLOSSARY.md`, and `docs/governance/terminology-control-addendum-01.md`. The Arabic source remains authoritative. The audit does not approve the English specification or authorize silent changes to the source.

## Confirmed corrections applied

1. Restored the source status metadata to `Unified draft for review and approval`; the separate translation-status note continues to state that the English translation is unapproved.
2. Standardized normative wording to the controlled terms `MUST`, `MUST NOT`, `SHOULD`, and `MAY`, including obligations and prohibitions that were previously expressed as ordinary imperatives. Possibility statements such as operations that may produce duplicate data remain ordinary descriptive wording.
3. Changed the responsibility metadata from `One Developer and One Responsible Owner` to `Single Developer and Sole Responsible Owner`, making the single-person model explicit and consistent with section 2.2.
4. Removed an unsupported `MUST` from the opening statements in sections 4.2 and 11.1. The Arabic source uses descriptive constructions (`تعامل باعتبارها` and `تعتبر`) rather than an explicit `يجب`; the English now preserves those constructions without strengthening their normative force.
5. Corrected section 9.3 from `operational reliance prohibited` to `operational use prohibited`, matching the source prohibition on operational use.
6. Aligned the compatibility status in section 15.5 and the governing rule in section 22 with the glossary term `Compatibility Not Established`. The adjective `unverified` remains where it describes a feature or definition rather than naming the compatibility status.
7. Corrected prohibitions in sections 11.1, 11.2, and 19 to `MUST NOT`, and preserved the corresponding `MUST` obligation to retain old and conflicting evidence.

## Open terminology and interpretation queries

| ID | Location | Source term | Existing English terminology | Issue | Status |
|---|---|---|---|---|---|
| TQ-001 | Section 3 layer table | `Apple Native APIs` | `Native iOS APIs` | Terminology Control Addendum 01 explicitly maps the source concept to `Native iOS APIs` and reserves it for interfaces provided by iOS or Apple native frameworks. The draft follows that controlling addendum. The older glossary wording `Apple Native APIs` is a dictionary-maintenance discrepancy, not an unresolved translation choice. | Resolved for translation; dictionary cleanup remains separate |
| TQ-002 | Section 18.1 | `تستخدم GitHub Actions لتشغيل الفحوص المناسبة للمشروع` | `GitHub Actions are used to run checks appropriate to the project.` | The Arabic wording is an indicative construction in a normative section, but it does not explicitly contain `MUST` or `يجب`. Do not strengthen it to `MUST be used` without a recorded interpretation decision. | Open |

## Unit tracking

| Unit | Source range | Second-pass status |
|---|---|---|
| T-001 | Metadata, sections 1–3 | Second-pass comparison completed. `Native iOS APIs` follows Terminology Control Addendum 01; no translation query remains open for this unit. |
| T-002 | Sections 4–6 | Second-pass comparison completed. The definition-status label `Excess` now mirrors the source category; no unresolved source-fidelity query identified in this unit. |
| T-003 | Sections 7–9 | Second-pass comparison completed. Runtime separation, TypeScript lifecycle, and the restriction on operational use of unverified libraries were checked against the source. |
| T-004 | Sections 10–12 | Second-pass comparison completed. The descriptive data-validation statement is no longer strengthened to `MUST`; error, security, privacy, and file requirements retain their source force. |
| T-005 | Sections 13–15.2 | Second-pass comparison completed. Context coverage, independent testing requirements, and tool limitations were checked against the source. |
| T-006 | Sections 15.3–16.4 | Second-pass comparison completed. Compatibility matrix fields, status distinctions, authority order, normative vocabulary, enforcement levels, and rule-definition fields were checked. |
| T-007 | Sections 17–19 | Translation Query. Lifecycle sequences and change-management stages were checked; TQ-002 remains open for the normative interpretation of the GitHub Actions sentence in section 18.1. |
| T-008 | Sections 20–23 | Second-pass comparison completed. Reverification triggers, authority references, four compatibility dimensions, and all seven approval conditions were checked. |
| T-009 | Sections 24–25 | Second-pass comparison completed. All reference entries and usage rules were checked; all 49 URLs match the source exactly. |

## Required before approval

- Resolve TQ-002 through an explicit source-interpretation decision.
- TQ-001 is resolved for translation by Terminology Control Addendum 01; the older glossary label remains a separate dictionary-maintenance discrepancy.
- Verify every list item, table cell, qualifier, exception, example, identifier, number, version, and URL. A URL multiset comparison has confirmed that all 49 source URLs appear in the target exactly once, with no additional URLs.
- Check each normative statement against its source wording and preserve the distinction among `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY`.
- Reconcile recurring terms with the canonical dictionaries and record unresolved conflicts.
- Record source or terminology questions without silently amending the Arabic source.
- Mark a unit `Approved` only after all acceptance criteria in `dictionaries/README.md` are met.
- Keep the complete English document unapproved until the owner explicitly approves it.

**No unit is marked Approved by this audit.**


## Second-pass checks completed in this continuation

- All nine units were reviewed against their Arabic source sections. TQ-002 remains the only open source-interpretation query.
- `Scriptable Main Runtime`, `WebView Runtime`, `Scriptable APIs`, and `Native iOS APIs` follow the terminology control addendum.
- The compatibility status is `Compatibility Not Established`, matching the canonical glossary entry. `Unverified` remains an adjective or definition status where appropriate. `Excess` is used for the excess-definition category.
- The source and target contain the same 49 URLs, with no missing or extra URL occurrences.
- Sections 1 through 25 are present in the target. Both lifecycle sequences are preserved exactly.
- No unit is marked `Approved`; the English document remains a draft.
