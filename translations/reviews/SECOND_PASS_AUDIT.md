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
4. Made the section 11.1 opening sentence explicit: all data from networks, files, users, and execution contexts `MUST` be treated as data requiring validation.
5. Corrected section 9.3 from `operational reliance prohibited` to `operational use prohibited`, matching the source prohibition on operational use.
6. Standardized the compatibility status in section 15.5 and the governing rule in section 22 to `Not Verified`, matching the project glossary's controlled compatibility vocabulary. The adjective `unverified` remains where it describes a feature or definition rather than naming the compatibility status.
7. Corrected prohibitions in sections 11.1, 11.2, and 19 to `MUST NOT`, and preserved the corresponding `MUST` obligation to retain old and conflicting evidence.

## Open terminology query

| ID | Location | Source term | Existing English terminology | Issue | Status |
|---|---|---|---|---|---|
| TQ-001 | Section 3 layer table | `Apple Native APIs` | Draft uses `Native iOS APIs`; the supplementary glossary also records `Apple Native APIs`, while Terminology Control Addendum 01 prescribes `Native iOS APIs` | The controlling addendum and supplementary glossary do not use the same canonical label. Keep the current addendum-controlled wording for now and resolve the dictionary inconsistency through an explicit terminology decision, not a silent translation edit. | Open |
| TQ-002 | Section 18.1 | `تستخدم GitHub Actions لتشغيل الفحوص المناسبة للمشروع` | `GitHub Actions are used to run checks appropriate to the project.` | The Arabic wording is an indicative construction in a normative section, but it does not explicitly contain `MUST` or `يجب`. Do not strengthen it to `MUST be used` without a recorded interpretation decision. | Open |

## Unit tracking

| Unit | Source range | Second-pass status |
|---|---|---|
| T-001 | Metadata, sections 1–3 | Translation Query. Paragraph-level review completed for this unit; TQ-001 remains open for the Native iOS APIs terminology conflict. |
| T-002 | Sections 4–6 | In progress. Normative wording normalized; paragraph-level fidelity and terminology review remains open. |
| T-003 | Sections 7–9 | In progress. Section 9.3 wording corrected; paragraph-level fidelity review remains open. |
| T-004 | Sections 10–12 | In progress. Section 11.1 obligation clarified; paragraph-level fidelity review remains open. |
| T-005 | Sections 13–15.2 | In progress. Paragraph-level fidelity review remains open. |
| T-006 | Sections 15.3–16.4 | In progress. Controlled normative vocabulary normalized; paragraph-level fidelity review remains open. |
| T-007 | Sections 17–19 | Translation Query. TQ-002 remains open for the normative interpretation of the GitHub Actions sentence in section 18.1; paragraph-level review remains open. |
| T-008 | Sections 20–23 | In progress. `Not Verified` status standardized; paragraph-level fidelity review remains open. |
| T-009 | Sections 24–25 | In progress. Normative vocabulary normalized; full URL and paragraph-level review remains open. |

## Required before approval

- Compare every Arabic paragraph with its English counterpart.
- Resolve TQ-001 and TQ-002 through explicit terminology and source-interpretation decisions.
- Verify every list item, table cell, qualifier, exception, example, identifier, number, version, and URL.
- Check each normative statement against its source wording and preserve the distinction among `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY`.
- Reconcile recurring terms with the canonical dictionaries and record unresolved conflicts.
- Record source or terminology questions without silently amending the Arabic source.
- Mark a unit `Approved` only after all acceptance criteria in `dictionaries/README.md` are met.
- Keep the complete English document unapproved until the owner explicitly approves it.

**No unit is marked Approved by this audit.**
