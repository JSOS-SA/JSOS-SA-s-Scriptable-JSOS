# Domain Docs

How engineering skills should consume this repository's domain documentation.

## Before exploring

- Read `GLOSSARY.md` at the repository root if it exists.
- Read relevant ADRs under `docs/adr/` if that directory exists.
- If these files do not exist, proceed without treating their absence as an error.

## File structure

This repository uses a single-context layout:

- `GLOSSARY.md` at the repository root.
- `docs/adr/` for architecture decision records.

## Vocabulary

Use the glossary's established terminology in issue titles, refactoring proposals, hypotheses, and test names.

If a required concept is missing from the glossary, identify it as a possible domain-modeling gap rather than inventing established terminology.

## ADR conflicts

If a proposed change contradicts an existing ADR, identify the conflict explicitly instead of silently overriding the decision.
