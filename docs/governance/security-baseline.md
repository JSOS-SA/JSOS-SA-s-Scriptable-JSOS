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
