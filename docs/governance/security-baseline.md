# Security Baseline

**Assessment date:** 2026-11-13
**Repository:** JSOS-SA/JSOS-SA-s-Scriptable-JSOS

## Enabled repository controls

- GitHub Secret Scanning: enabled.
- Push Protection: enabled.
- Dependabot Alerts: enabled.
- Dependabot Security Updates: enabled.
- Private vulnerability reporting: enabled.
- CodeQL default setup: configured for JavaScript/TypeScript only.
- CodeQL query suite: default.
- CodeQL threat model: remote and local sources.
- Main branch protection requires the quality-gates and CodeQL status checks.

The secret-scanning alert details are intentionally not copied into this public repository document. Review those details only in the GitHub Security interface. Never copy secret values, alert snippets, or sensitive file locations into commits or chat.

## Dependency maintenance

The repository does not currently contain a root package.json. The Dependabot configuration in this change set therefore targets GitHub Actions dependencies only, with a monthly update schedule. No npm runtime or development dependency is introduced by this baseline.

Dependabot Alerts and Security Updates are enabled. The current Dependabot alert count was zero at the time of inspection.

## Code scanning

CodeQL default setup analyzes JavaScript/TypeScript. Python is not included in the configured language set.

The default setup completed successfully on the main branch and on the governance pull request. A successful analysis run means the analysis completed; it does not mean the alert inventory is empty. Review code-scanning alerts separately in GitHub Security.

## Vulnerability reporting

Private vulnerability reporting is enabled. The root SECURITY.md file directs reporters to the private GitHub advisory workflow.

## Secret response

Treat every detected credential as exposed until its owner confirms otherwise. Revoke or rotate active credentials at the issuing provider. Removing a value from the current source file does not revoke it and does not remove it from Git history.

Never put credential values in repository documentation, issues, pull requests, logs, or test fixtures.

## Latest analysis evidence

The latest CodeQL pull-request analysis completed successfully on run 43446636909. This records analysis completion only. The code-scanning alert inventory must still be reviewed separately.

## Current open findings, inspected 2026-11-13

Secret Scanning reports three open alerts: two Google API Key alerts and one Google Cloud Service Account Credentials alert. GitHub reports validity as unknown for all three. The alert-location endpoint ties the findings to commits on the public main branch. One finding is located in a service-account JSON file that is still present on main.

Treat all three credentials as exposed. No secret values, key material, or credential contents were retrieved or copied during this assessment. Revoke or rotate the affected credentials with Google immediately. Do not treat deletion from the current tree as revocation, and do not close alerts until the issuing provider confirms revocation or rotation.

CodeQL reports two open high-severity alerts for incomplete string escaping in src/fq_add_airport.js, at the city and country serialization statements. The current implementation escapes quotation marks but does not escape backslashes. This can produce malformed or altered JavaScript string literals for crafted input. The issue remains open and requires a reviewed fix plus regression tests.

These findings are blockers for declaring the security baseline complete and for merging this governance pull request. A successful CodeQL analysis run means analysis completed, not that no alerts exist.

## CodeQL language scope

The configured CodeQL language set is JavaScript and TypeScript variants only. Python is not configured for CodeQL in this repository. The latest pull-request analysis completed successfully on run 43447654951. The alert inventory remains a separate review task.
