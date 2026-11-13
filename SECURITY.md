# Security Policy

## Reporting a vulnerability

Use GitHub's private vulnerability reporting feature for this repository:

https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/security/advisories/new

Do not publish suspected secrets, exploit details, personal data, or unpatched vulnerability details in public issues, discussions, commits, or pull requests.

## Secret handling

- Never commit API keys, access tokens, private keys, service-account credentials, or production secrets.
- Keep Scriptable secrets in the platform's secure storage, such as Keychain, and keep CI credentials in GitHub Actions secrets only when a workflow requires them.
- Use the minimum permissions and API scopes required.
- Do not paste secret values into chat, issue comments, logs, or test output.
- If a secret is detected, treat it as exposed until its owner verifies and, where necessary, revokes or rotates it.
- Removing a secret from the latest file does not revoke it and does not remove it from Git history.

## Supported project baseline

The current documented iPhone target reference is Scriptable 1.7.19 with iOS 15.5 or later. Device and execution-context compatibility is determined by the compatibility matrix and evidence register, not by the version range alone.

## Review and response

The Repository Owner triages private reports, records the affected scope, assesses severity and exposure, coordinates remediation, and publishes a fix when appropriate. Do not assume a response-time guarantee that is not recorded in the project governance records.
