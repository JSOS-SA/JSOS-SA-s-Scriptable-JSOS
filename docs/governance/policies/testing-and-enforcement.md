# Testing and Enforcement Policy

**Rules:** SCR-TEST-001 through SCR-TEST-003, SCR-RISK-001, SCR-GOV-004, SCR-REPO-002.

## Verification layers

Changes use all applicable layers:

1. Syntax validation.
2. Static analysis.
3. Type checking.
4. Unit testing.
5. Integration testing.
6. Scriptable Runtime testing on a physical iPhone.
7. Execution-context testing for WebView, Widget, and other declared contexts.
8. Security testing.

A test plan states which layers apply and why any layer is omitted.

## CI contract

The protected main branch requires:

- quality-gates.
- CodeQL.

The quality-gates workflow currently checks patch hygiene, parses JavaScript source files with Node.js, verifies governance/security artifacts, and checks that dedicated probes do not invoke selected private host APIs.

CodeQL default setup analyzes JavaScript/TypeScript. It is a separate security analysis and does not replace runtime tests.

## Device evidence

A new, changed, uncertain, or risk-sensitive Scriptable API or language feature requires on-device evidence for each required iPhone tuple. A Node.js result is not a Scriptable Runtime result. A WebView result is not a main-runtime result. A widget preview is not proof of actual widget-host execution.

## Enforcement levels

- BLOCK: failure prevents merge or execution.
- WARN: the issue must be visible and justified.
- GUIDE: advisory guidance that does not block.

Mandatory checks fail closed. A failed, unavailable, or untrustworthy check is recorded as BLOCKED or INDETERMINATE, never as success.

## Current gate limitations

The current quality-gates workflow does not enforce the ES2015 syntax ceiling, validate Scriptable Host API signatures, type-check, or run a complete unit/integration harness. It does not execute JavaScriptCore, production WebView, or widget behavior on a physical iPhone. Those capabilities must be added as separate checks with evidence.
