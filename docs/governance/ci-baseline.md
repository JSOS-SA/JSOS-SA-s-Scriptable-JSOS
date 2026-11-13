# CI Baseline

**Assessment date:** 2026-11-13  
**Workflow:** .github/workflows/quality-gates.yml  
**Required check:** quality-gates  
**Protected branch:** main

## Workflow contract

The initial quality-gates workflow runs on pull requests targeting main and on pushes to main.

- Runner: ubuntu-24.04.
- Node.js: 26.x, Active LTS at the assessment date.
- Checkout action: actions/checkout v7, pinned to commit 3d3c42e5aac5ba805825da76410c181273ba90b1.
- Setup Node action: actions/setup-node v7, pinned to commit 949feb2413d6458794dcd2491c4babbbce0c15c1.
- Workflow permissions: contents: read.
- Checkout credential persistence: disabled.
- Package-manager caching: disabled.
- No npm dependencies are installed by this initial workflow.

## Checks currently enforced

1. Parse every JavaScript file under src/ using Node.js module syntax checking.
2. Verify the existence of the approved glossary and initial governance records.
3. Check that the two dedicated device probes do not invoke selected private host APIs such as Keychain, FileManager, Pasteboard, Request, Notification, or Location.

The successful run parsed 143 JavaScript source files.

## Recorded runs

- Run 43444099883 failed because the first probe-isolation regular expression matched the word Pasteboard in a comment. The failed result is retained as evidence E-015.
- Run 43444228577 passed after narrowing the check to API-call patterns. It parsed 143 JavaScript files.
- Run 43444464454 passed on the pinned ubuntu-24.04 runner using Node.js 26.x.

## Explicit limitations

The current workflow is an initial syntax and repository-integrity gate. It does not:

- Enforce the ECMAScript 2015 syntax ceiling.
- Validate Scriptable Host API names or signatures.
- Type-check JSDoc or TypeScript definitions.
- Run a full unit-test harness.
- Execute JavaScriptCore on an Apple device.
- Execute the production WebView lifecycle.
- Execute the widget context.
- Establish compatibility for any physical device tuple.

These limitations are deliberate. The workflow must not claim evidence it does not produce. The device probes and later context-specific tests remain separate evidence sources.

## Branch protection

The main branch is protected with:

- Required pull requests.
- Required strict status check: quality-gates.
- Admin enforcement.
- No force pushes.
- No branch deletion.
- Required conversation resolution.

The required approval count is zero because the repository currently has one collaborator. This keeps the pull-request gate usable while the role model permits one person to perform multiple roles. Reassess the approval count when another qualified maintainer becomes available.
