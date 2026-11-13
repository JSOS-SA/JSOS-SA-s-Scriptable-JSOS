# Evidence Register

**Assessment date:** 2026-11-13
**Repository:** JSOS-SA/JSOS-SA-s-Scriptable-JSOS

This register records evidence without treating a source's scope as broader than the source supports. Conflicting or failed evidence is retained with its resolution.

| ID | Evidence class | Source | Supported assertion | Limitation |
|---|---|---|---|---|
| E-001 | Official App Store listing | https://apps.apple.com/us/app/scriptable/id1405459188?platform=ipad | Scriptable is listed for iPhone and iPad; latest displayed app version is 1.7.19; minimum OS is iOS/iPadOS 15.5. | Does not establish the installed version on a particular device or prove every API works on every supported OS. |
| E-002 | Official Scriptable documentation | https://docs.scriptable.app/ | Scriptable uses JavaScriptCore and documents ECMAScript 6 support; the main runtime is not a browser runtime. | Does not establish support for later ECMAScript features without runtime tests. |
| E-003 | Official Scriptable Device API documentation | https://docs.scriptable.app/device/ | Documents Device.model, Device.systemVersion, Device.isPhone, Device.isPad, Device.screenResolution, and Device.screenScale. | The documented Device API page does not expose an installed Scriptable app-version getter or a unique hardware model identifier. |
| E-004 | Apple security documentation | https://support.apple.com/en-sa/120323 | iOS/iPadOS 15.5 compatibility includes iPhone 6s and later, iPad Pro models, iPad Air 2 and later, iPad 5th generation and later, and iPad mini 4 and later. | Establishes OS compatibility, not Scriptable runtime behavior. |
| E-005 | Apple Developer release information | https://developer.apple.com/news/releases/ | Apple published iOS 27.2.1 and iPadOS 27.2.1 on 2026-11-09. | Establishes release availability, not application compatibility. |
| E-006 | Apple security release information | https://support.apple.com/en-sa/100100 | Apple's iOS 27 device list includes iPhone 11 and later; its iPadOS 27 list includes iPad 9th generation and later, plus supported Pro, Air, and mini models. | Device support must still be checked against the exact OS release and hardware model. |
| E-007 | GitHub repository metadata | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS | Identifies the repository and its default branch. | Repository metadata does not prove runtime compatibility. |
| E-008 | GitHub branch metadata | https://api.github.com/repos/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/branches/main | The main branch was initially unprotected. Classic branch protection was subsequently enabled and now requires quality-gates and CodeQL. | Point-in-time configuration. Recheck after settings changes. |
| E-009 | GitHub rulesets metadata | https://api.github.com/repos/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/rulesets | The inspected repository rulesets endpoint returned an empty list. | Classic branch protection is configured separately. |
| E-010 | GitHub repository tree and source inspection | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/tree/main/src | The inspected tree contains application modules, fq_main.js, fq_widget.js, selftest.js, and selftest_cases.js. | Source inspection is not a device execution result. |
| E-011 | Node.js official release schedule | https://nodejs.org/en/about/previous-releases | Node.js 26.x is Active LTS and Node.js 24.x is Maintenance LTS at the assessment date. | Node.js is a tooling runtime, not Scriptable's JavaScriptCore runtime. |
| E-012 | Remote host observation | Remote Desktop Commander, read-only system metadata | The connected Linux ARM64 host reported Git 2.52.0, Node.js 24.22.0, and npm 11.19.1. | This is not the project's CI runner or an Apple device. No local project, Scriptable, Python, document, or memory files were read. |
| E-013 | Source safety review | src/selftest.js and src/selftest_cases.js on the GitHub main branch | The existing self-test loads application modules that reach Keychain reads and copies the report to Pasteboard. | The test was not executed. This is a source-level side-effect finding, not a runtime test result. |
| E-014 | Dedicated device probes | src/compatibility_probe.js, src/async_runtime_probe.js, src/webview_context_probe.js, and src/widget_context_probe.js | Provides separate manual procedures for main runtime, async/await, WebView, and widget contexts without importing application data. | No device result exists until a human runs the probes on the target device and records the output. |
| E-015 | Failed CI run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43444099883 | The first workflow attempt failed in the probe-isolation check because a broad pattern matched the word Pasteboard in a comment. | This was a false positive in the check, not evidence that the probe accessed Pasteboard. The failed run is retained. |
| E-016 | Successful CI run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43444228577 | The corrected workflow passed and parsed 143 JavaScript source files, verified governance artifacts, and passed the probe-isolation check. | This run used ubuntu-latest before the runner was pinned. It proves only the listed Node.js and repository checks. |
| E-017 | Successful CI run on pinned runner | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43444464454 | The workflow passed on ubuntu-24.04 using Node.js 26.x. | It does not prove Scriptable JavaScriptCore, WebView, widget, or physical-device compatibility. |
| E-018 | Branch protection configuration | https://api.github.com/repos/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/branches/main/protection | Main requires pull requests and the strict quality-gates and CodeQL status checks, enforces admins, blocks force pushes and deletion, and requires conversation resolution. | Required approval count is zero because only one collaborator is currently available. |
| E-019 | Collaborator count | GitHub collaborators API, inspected 2026-11-13 | The repository currently has one collaborator. | No collaborator identity is recorded here. |
| E-020 | Draft pull request | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/pull/1 | Holds the operational baseline, glossary, compatibility matrix, evidence register, CI workflow, device probes, and security policy for review. | It has not been merged. |
| E-021 | Successful CI run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43444830645 | The workflow passed after the main-runtime, WebView, and widget probes were separated and included in the isolation check. | This is Node.js syntax and repository validation, not a Scriptable device result. |
| E-022 | Failed patch hygiene check | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43445821718 | The patch hygiene gate detected trailing whitespace in Markdown metadata lines. The whitespace was removed and the workflow rerun. | This was a documentation formatting defect, not an application runtime defect. |
| E-023 | Latest successful quality-gates run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43446108143 | The workflow passed patch hygiene, parsed 145 JavaScript source files, verified governance/security artifacts, and passed the probe-isolation check. | It does not establish Scriptable runtime compatibility. |
| E-024 | GitHub security settings | GitHub repository security settings, inspected 2026-11-13 | Secret Scanning, Push Protection, Dependabot Alerts, and Dependabot Security Updates are enabled. | Secret values and alert details are intentionally not copied into repository documentation. |
| E-025 | Private vulnerability reporting | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/security/advisories/new | Private vulnerability reporting is enabled for the repository. | Does not establish that every report has been reviewed. |
| E-026 | CodeQL default setup | https://api.github.com/repos/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/code-scanning/default-setup | CodeQL default setup is configured for JavaScript/TypeScript, with the default query suite and remote_and_local threat model. Python is not in the configured language set. | Analysis completion does not mean the alert inventory is empty. |
| E-027 | CodeQL main-branch run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43445460446 | CodeQL JavaScript/TypeScript analysis completed successfully on main. | Analysis completion does not imply a clean alert inventory. |
| E-028 | CodeQL pull-request run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43446104838 | CodeQL JavaScript/TypeScript analysis completed successfully on the governance pull request. | Analysis completion does not imply a clean alert inventory. |
| E-029 | Dependabot status | GitHub Dependabot API, inspected 2026-11-13 | Dependabot Alerts and Security Updates are enabled; the alert count was zero at inspection time. | The repository has no root package.json. The Dependabot configuration in the pull request targets GitHub Actions. |
| E-030 | Private security policy | SECURITY.md on the governance pull request branch | Defines private reporting and safe secret-handling requirements. | It is not part of main until the pull request is merged. |
| E-031 | Dependabot configuration | .github/dependabot.yml on the governance pull request branch | Configures monthly updates for GitHub Actions dependencies. | It is not active on main until the pull request is merged. |

## Security findings evidence

| ID | Evidence class | Source | Supported assertion | Limitation |
|---|---|---|---|---|
| E-036 | Secret Scanning alert inventory | GitHub Secret Scanning API and alert-location endpoints, inspected 2026-11-13 | Three open alerts exist: two Google API Key alerts and one Google Cloud Service Account Credentials alert. Validity is unknown. All are tied to commits on the public main branch; one location is a service-account JSON file still present on main. | Secret values and credential contents were not retrieved. The credentials must be treated as exposed until revoked or rotated by the issuing provider. |
| E-037 | CodeQL alert inventory | GitHub Code Scanning API, inspected 2026-11-13 | Two open high-severity js/incomplete-sanitization alerts identify incomplete string escaping in src/fq_add_airport.js at the city and country serialization statements. | Analysis completion is not remediation. A source fix and regression tests remain outstanding. |
| E-038 | Current PR check rollup | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/pull/1 | The latest quality-gates, CodeQL, and Analyze (javascript-typescript) checks all completed successfully on the governance pull request. | These checks do not resolve the open security alerts or prove Scriptable device compatibility. |

## Verified remediation evidence

| ID | Evidence class | Source | Supported assertion | Limitation |
|---|---|---|---|---|
| E-039 | Successful quality-gates run with regression test | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43449061757 | The workflow parsed 146 JavaScript source files, ran the airport serialization regression test successfully, verified governance/security artifacts, and passed probe isolation and patch hygiene. | Node.js tooling test only; not Scriptable JavaScriptCore or physical-device evidence. |
| E-040 | Successful CodeQL pull-request analysis | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43449057010 | The latest CodeQL analysis reports the two incomplete-string-escaping alerts and the temporary dynamic-test alert fixed on refs/pull/1/head. | The two original alerts remain open on main until merge. The three Secret Scanning alerts remain open. |
| E-041 | Regression-test source review | tools/tests/fq-add-airport-serialization.test.js on the governance pull-request head | The test uses the pure serializer module and JSON.parse assertions, with no dynamic code execution. It covers backslashes, quotes, line breaks, Unicode separators, and injection-shaped text. | This validates source-literal serialization, not the full Scriptable FileManager write lifecycle. |

## Evidence handling

- Keep the original evidence and its date.
- Record the exact Scriptable version, iOS version, device, API, and execution context for every runtime test.
- A Node.js or WebView result must not be substituted for a JavaScriptCore result.
- A documentation source supports a documented claim, not a tested or compatible claim.
- Do not store device names, serial numbers, UDIDs, Apple IDs, tokens, or other personal identifiers in this register.

## Additional evidence

| ID | Evidence class | Source | Supported assertion | Limitation |
|---|---|---|---|---|
| E-032 | Failed patch hygiene check | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43446493409 | The patch hygiene gate found trailing whitespace in metadata lines after a documentation rewrite. The whitespace was removed and the workflow rerun. | Documentation formatting issue only. |
| E-033 | Latest successful quality-gates run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43446642015 | The latest quality-gates run passed patch hygiene, parsed 145 JavaScript source files, verified governance/security artifacts, and passed probe isolation. | It does not establish Scriptable runtime compatibility. |
| E-034 | Latest CodeQL pull-request run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43446636909 | CodeQL JavaScript/TypeScript analysis completed successfully on the latest governance pull-request revision. | The alert inventory was not inspected in this assessment. |
| E-035 | Security baseline document | docs/governance/security-baseline.md on the governance pull request branch | Records enabled security settings, CodeQL scope, Dependabot maintenance, and private reporting. | It is not part of main until the pull request is merged. |

## Constitution and policy drafting evidence

| ID | Evidence class | Source | Supported assertion | Limitation |
|---|---|---|---|---|
| E-036 | Failed CI run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43447542579 | Patch hygiene detected trailing whitespace in the newly added policy rule catalogue and decision register. The whitespace was removed. | Documentation formatting issue only. |
| E-037 | Latest quality-gates run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43447658633 | Patch hygiene, JavaScript syntax parsing, governance artifact checks, punctuation checks, and probe isolation all passed on the latest revision. | Node.js checks do not prove Scriptable runtime compatibility. |
| E-038 | Latest CodeQL pull-request run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43447654951 | CodeQL JavaScript/TypeScript analysis completed successfully on the latest revision. | Analysis completion does not mean the alert inventory is empty. |
| E-039 | Constitution and policy draft | CONSTITUTION.md and docs/governance/policy-rules.md on the governance pull request branch | Draft Constitution 0.1.0-draft.1 and 34 structured Policy Rules were created. | Draft text is not effective until approval and merge. |
| E-040 | Approved decision register | docs/governance/records/decision-register.md on the governance pull request branch | Records G1-G3 and Q1-Q75, 78 approved decisions in total, mapped to Policy Rule IDs. | It is not part of main until the pull request is merged. |
| E-041 | Policy, standards, and register set | docs/governance/policies, docs/governance/standards, and docs/governance/records on the governance pull request branch | Adds the policy and standard indexes, architecture/JavaScript/repository standards, and exception/violation register templates. | Draft artifacts remain in the open pull request. |
| E-042 | Current required status checks | GitHub main branch protection API, inspected 2026-11-13 | Main requires quality-gates and CodeQL, with strict checks enabled. | Required approval count remains zero because only one collaborator is available. |

## Final draft verification

| ID | Evidence class | Source | Supported assertion | Limitation |
|---|---|---|---|---|
| E-043 | Latest quality-gates run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43448002839 | The complete governance draft passed patch hygiene, JavaScript syntax parsing, required artifact checks, no-em-dash validation, and device probe isolation. | Node.js parsing does not prove Scriptable Runtime compatibility. |
| E-044 | Latest CodeQL pull-request run | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/actions/runs/43447998338 | CodeQL JavaScript/TypeScript analysis completed successfully on the same governance draft revision. | The code-scanning alert inventory was not inspected. |
