# Operational Baseline

**Assessment date:** 2026-11-13  
**Repository:** JSOS-SA/JSOS-SA-s-Scriptable-JSOS  
**Default branch:** main  
**Assessment status:** Initial evidence captured. Device execution has not yet been performed.

## 1. Repository identity and controls

The repository contains the Scriptable application source under src/. The inspected source includes a main application entry point, a widget entry point, reusable modules, and manual self-test files.

The following facts were observed from the GitHub repository and its current default branch:

- The default branch is main.
- The branch was reported as unprotected by the GitHub branch endpoint.
- The repository rulesets endpoint returned an empty list.
- No .github/workflows directory was present.
- No root package.json was present.
- tools/test/harness.js, referenced by comments in the self-test source, was not present at the inspected revision.
- The GitHub connection reports repository-owner permissions including Admin and Push.

These facts mean the repository currently has no verified GitHub Actions workflow and no active branch protection or repository ruleset. They do not imply that the application itself has no tests.

## 2. Scriptable and operating-system baseline

The App Store listing examined identifies Scriptable as available for iPhone and iPad, lists version 1.7.19 as its latest displayed version, and states a minimum requirement of iOS/iPadOS 15.5.

For this project, use the following conservative target baseline until a device-specific record supersedes it:

- **Scriptable target:** 1.7.19, the latest version displayed by the App Store listing examined. Earlier app versions are not in the supported set unless separately verified.
- **Minimum OS target:** iOS/iPadOS 15.5, matching the App Store compatibility requirement.
- **Current OS reference at assessment date:** iOS/iPadOS 27.2.1, released by Apple on 2026-11-09.
- **Device families:** iPhone and iPad.

The OS range is a support target, not a claim that every intermediate OS release, device, API, and context has been tested. Compatibility remains a per-tuple assessment.

## 3. Runtime and execution contexts

The Scriptable documentation states that Scriptable uses Apple's JavaScriptCore and supports ECMAScript 6. It also states that Scriptable does not run the main script in a browser and browser globals such as document are not available in the main runtime.

The inspected application source establishes these project contexts:

- **Main Scriptable context:** src/fq_main.js uses Scriptable host APIs and asynchronous functions.
- **WebView context:** the main application creates and presents a WebView; browser code must be assessed separately from the main JavaScriptCore runtime.
- **Widget context:** src/fq_widget.js creates ListWidget instances and calls Script.setWidget.
- **Manual test context:** src/selftest.js checks config.runsInApp.

The production source uses async functions and await. These are newer than the documented ECMAScript 2015 baseline. They must remain an explicit compatibility exception until the dedicated on-device probe passes on the selected Scriptable/iOS/device tuples. A passing Node.js check is not proof of JavaScriptCore support.

## 4. Device test targets

The compatibility matrix defines representative edge targets:

- An older iPhone and iPad on the iOS/iPadOS 15.x line.
- A current-minimum iPhone and iPad model supported by iOS/iPadOS 27.

The exact representative models and OS versions are listed in compatibility-matrix.md. They are test targets, not devices already tested by this assessment.

The Scriptable Device API exposes model class, system version, phone/pad classification, screen resolution, and screen scale. The inspected Device API page does not expose an installed Scriptable app-version getter. Record the installed app version separately.

Do not include device name, serial number, UDID, Apple ID, or other personal identifiers in a compatibility report.

## 5. Existing self-test safety assessment

src/selftest.js and src/selftest_cases.js exist in the repository. The current manual self-test is not run as part of this assessment because its import path loads fq_helpers, which loads fq_config and reads Keychain. The self-test also copies its report to the Pasteboard.

The test source therefore has side effects that must be reviewed before it is used in an automated or unattended workflow. The dedicated compatibility probes added alongside this baseline do not import application modules and do not access files, Keychain, network services, notifications, or Pasteboard.

## 6. CI toolchain baseline

The remote development host reported Git 2.52.0, Node.js 24.22.0, and npm 11.19.1. This host is not the Scriptable runtime and was not treated as a project CI runner.

The Node.js release schedule identifies Node.js 26.x as Active LTS as of 2026-11-13, while 24.x is in Maintenance LTS. Use Node.js 26.x as the proposed GitHub Actions toolchain for project checks. The Scriptable compatibility policy must not equate Node.js/V8 results with JavaScriptCore results.

No workflow or package manifest was present at the inspected revision. CI must be added explicitly and must separate static checks from device-only runtime evidence.

## 7. Role mapping

The repository-owner permission is verified. The role model is:

- **Constitution Owner:** Repository Owner.
- **Exception Approver:** Repository Owner, unless a formally delegated approver is recorded.
- **Release Approver:** Repository Owner.
- **Change Author:** The contributor proposing the change.
- **Reviewer:** A maintainer other than the author where another qualified maintainer is available.
- **Compatibility Register Steward:** A role assigned by the Constitution Owner.

This maps responsibilities to verified repository authority without inventing personal names or assuming that additional collaborators are available.

## 8. Immediate verification procedure

1. Run src/compatibility_probe.js manually in Scriptable in-app.
2. Run src/async_runtime_probe.js manually in Scriptable in-app.
3. Record the exact device model from Settings, the OS version, and the installed Scriptable version.
4. Preserve the unedited probe output as evidence, excluding personal identifiers.
5. Create a Compatibility Record for each tested device/context tuple.
6. Do not mark a tuple Compatible until the required runtime evidence is recorded.

## Sources

See evidence-register.md for source URLs, evidence identifiers, scope, and limitations.
