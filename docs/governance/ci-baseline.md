# CI Baseline

**Assessment date:** 2026-11-13
**Workflow:** .github/workflows/quality-gates.yml
**Required checks:** quality-gates and CodeQL
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

1. Check patch hygiene with git diff --check against origin/main.
2. Parse every JavaScript file under src/ using Node.js module syntax checking.
3. Verify the existence of the approved glossary, security policy, operational baseline, evidence register, compatibility matrix, CI baseline, device test procedure, Dependabot configuration, and all four device probes.
4. Check that the four dedicated device probes do not invoke selected private host APIs such as Keychain, FileManager, Pasteboard, Request, Notification, or Location.

The latest successful quality-gates run parsed 145 JavaScript source files and passed all workflow steps.

## CodeQL

GitHub CodeQL default setup is enabled for JavaScript/TypeScript only. The configured query suite is default and the threat model includes remote and local sources. Python is not in the configured language set.

CodeQL analysis completed successfully on main and on the governance pull request. The CodeQL status check is required for main. A successful analysis run does not mean the alert inventory is empty. Review code-scanning alerts separately in GitHub Security.

## Recorded quality-gates runs

- Run 43444099883 failed because the first probe-isolation regular expression matched the word Pasteboard in a comment. The failed result is retained as evidence.
- Run 43444228577 passed after narrowing the check to API-call patterns. It parsed 143 JavaScript files.
- Run 43444464454 passed on the pinned ubuntu-24.04 runner using Node.js 26.x.
- Run 43444830645 passed after the main-runtime, WebView, and widget probes were separated and included in the isolation check.
- Run 43445821718 failed because git diff --check found trailing whitespace used for Markdown hard line breaks. The whitespace was removed.
- Run 43446108143 passed after the whitespace correction. It parsed 145 JavaScript source files and passed all workflow steps.

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
- Required strict status checks: quality-gates and CodeQL.
- Admin enforcement.
- No force pushes.
- No branch deletion.
- Required conversation resolution.

The required approval count is zero because the repository currently has one collaborator. This keeps the pull-request gate usable while the role model permits one person to perform multiple roles. Reassess the approval count when another qualified maintainer becomes available.

## Latest verification

- Run 43446493409 failed because a documentation rewrite reintroduced trailing whitespace in metadata lines. The whitespace was removed.
- Run 43446642015 passed after the correction and parsed 145 JavaScript source files.
- CodeQL run 43446636909 passed on the latest governance pull-request revision.

## Governance document validation

The latest successful quality-gates run is 43447658633. It passed patch hygiene, parsed the current JavaScript source set, verified the constitution, policy, standards, records, security, and probe files, enforced the no-em-dash rule for governance prose, and checked probe isolation.

A previous run, 43447542579, failed on trailing whitespace in the new policy catalogue and decision register. The formatting was corrected before the successful run.

The latest complete governance-draft checks are quality-gates run 43448002839 and CodeQL run 43447998338. Both completed successfully on the same pull-request revision.
