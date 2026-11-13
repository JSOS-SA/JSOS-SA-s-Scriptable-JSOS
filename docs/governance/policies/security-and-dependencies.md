# Security and Dependencies Policy

**Rules:** SCR-DEP-001, SCR-DEP-002, SCR-SEC-001 through SCR-SEC-003, SCR-REPO-003.

## Dependency admission

External runtime libraries are prohibited by default. A proposal must document:

- Source and maintainer.
- Exact version and integrity.
- License and redistribution obligations.
- Direct and transitive dependencies.
- Node.js or browser built-in requirements.
- Scriptable API and execution-context compatibility.
- Security advisories and maintenance status.
- Bundle size and runtime impact.
- Evidence and approval.

A build tool or CI action is also a dependency and must be version-pinned and reviewed. Do not add npm dependencies without an approved package manifest and dependency review.

## Secrets

- Never commit API keys, tokens, service-account credentials, private keys, or production secrets.
- Store Scriptable credentials in Keychain when appropriate.
- Store CI credentials in GitHub Actions secrets only when a workflow requires them.
- Never log or display secret values.
- Do not paste secrets into chat, issues, discussions, pull requests, or test output.
- If a secret is detected, treat it as exposed until verified and rotated or revoked.
- Removing a value from the current file does not revoke it or remove it from Git history.

## Network security

Network requests use HTTPS and normal certificate validation. Insecure certificate bypass is prohibited unless a narrowly scoped, documented, time-bounded exception is approved.

Validate inputs and responses. Minimize transmitted data. Use safe, idempotent retries. Do not retry non-idempotent operations without a safe deduplication strategy.

## High-risk operations

Destructive actions, credential changes, data deletion, privileged automation, and irreversible external actions are blocked by default. They require explicit approval, a defined scope, a risk assessment, compensating controls, and an expiry.

## Repository controls

Secret Scanning, Push Protection, Dependabot Alerts, Dependabot Security Updates, and CodeQL must remain enabled. Private vulnerability reporting is enabled. Security findings and credential values remain in GitHub's private Security interface and must not be copied into public project records.

## Safe serialization and output encoding

**Rule:** SCR-SEC-004.

Untrusted values MUST be serialized with a context-appropriate encoder. Do not construct executable source by manually escaping only quotation marks or another subset of special characters. Prefer established serializers such as JSON.stringify for JavaScript string literals, then apply any additional escaping required by the target runtime. Regression tests must cover backslashes, quotes, control characters, line breaks, Unicode line separators, and injection-shaped input.
