# Repository and CI Standard

**Rules:** SCR-REPO-001 through SCR-REPO-003, SCR-TEST-002.

## Protected branch

The main branch requires pull requests, strict quality-gates and CodeQL status checks, admin enforcement, conversation resolution, and disabled force pushes and branch deletion.

The current required approval count is zero because the repository has one collaborator. Reassess this control when an independent maintainer becomes available.

## Workflow requirements

- Workflows use least-privilege permissions.
- Third-party actions are pinned to full commit SHAs.
- Toolchain versions are explicit.
- CI does not receive credentials unless required.
- CI results state exactly what was tested.
- Device-only evidence remains separate from CI.

## Dependency maintenance

Dependabot is configured for monthly GitHub Actions dependency updates. Dependabot Alerts and Security Updates are enabled. New dependency ecosystems require an explicit manifest and review.
