# Evidence Register

**Assessment date:** 2026-11-13  
**Repository:** JSOS-SA/JSOS-SA-s-Scriptable-JSOS

This register records evidence without treating a source's scope as broader than the source supports.

| ID | Evidence class | Source | Supported assertion | Limitation |
|---|---|---|---|---|
| E-001 | Official App Store listing | https://apps.apple.com/us/app/scriptable/id1405459188?platform=ipad | Scriptable is listed for iPhone and iPad; latest displayed app version is 1.7.19; minimum OS is iOS/iPadOS 15.5. | Does not establish the installed version on a particular device or prove every API works on every supported OS. |
| E-002 | Official Scriptable documentation | https://docs.scriptable.app/ | Scriptable uses JavaScriptCore and documents ECMAScript 6 support; the main runtime is not a browser runtime. | Does not establish support for later ECMAScript features without runtime tests. |
| E-003 | Official Scriptable Device API documentation | https://docs.scriptable.app/device/ | Documents Device.model, Device.systemVersion, Device.isPhone, Device.isPad, Device.screenResolution, and Device.screenScale. | The documented Device API page does not expose an installed Scriptable app-version getter or a unique hardware model identifier. |
| E-004 | Apple security documentation | https://support.apple.com/en-sa/120323 | iOS/iPadOS 15.5 compatibility includes iPhone 6s and later, iPad Pro models, iPad Air 2 and later, iPad 5th generation and later, and iPad mini 4 and later. | Establishes OS compatibility, not Scriptable runtime behavior. |
| E-005 | Apple Developer release information | https://developer.apple.com/news/releases/ | Apple published iOS 27.2.1 and iPadOS 27.2.1 on 2026-11-09. | Establishes release availability, not application compatibility. |
| E-006 | Apple security release information | https://support.apple.com/en-sa/100100 | Apple's iOS 27 device list includes iPhone 11 and later; its iPadOS 27 list includes iPad 9th generation and later, plus supported Pro, Air, and mini models. | Device support must still be checked against the exact OS release and hardware model. |
| E-007 | GitHub repository metadata | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS | Identifies the repository and its default branch. | Repository metadata does not prove runtime compatibility. |
| E-008 | GitHub branch metadata | https://api.github.com/repos/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/branches/main | The inspected main branch reported protected: false at assessment time. | This is a point-in-time observation and must be rechecked after settings changes. |
| E-009 | GitHub rulesets metadata | https://api.github.com/repos/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/rulesets | The inspected repository rulesets endpoint returned an empty list. | Does not replace a fresh check of all repository settings. |
| E-010 | GitHub repository tree and source inspection | https://github.com/JSOS-SA/JSOS-SA-s-Scriptable-JSOS/tree/main/src | The inspected tree contains application modules, fq_main.js, fq_widget.js, selftest.js, and selftest_cases.js. | Source inspection is not a device execution result. |
| E-011 | Node.js official release schedule | https://nodejs.org/en/about/previous-releases | Node.js 26.x is Active LTS and Node.js 24.x is Maintenance LTS at the assessment date. | Node.js is a tooling runtime, not Scriptable's JavaScriptCore runtime. |
| E-012 | Remote host observation | Remote Desktop Commander, read-only system metadata | The connected Linux ARM64 host reported Git 2.52.0, Node.js 24.22.0, and npm 11.19.1. | This is not the project's CI runner or an Apple device. No local project, Scriptable, Python, document, or memory files were read. |
| E-013 | Source safety review | src/selftest.js and src/selftest_cases.js on the GitHub main branch | The existing self-test loads application modules that reach Keychain reads and copies the report to Pasteboard. | The test was not executed. This is a source-level side-effect finding, not a runtime test result. |
| E-014 | Dedicated device probes | src/compatibility_probe.js and src/async_runtime_probe.js | Provides a minimal procedure for collecting device/runtime evidence without reading application data. | No device result exists until a human runs the probes on the target device and records the output. |

## Evidence handling

- Keep the original evidence and its date.
- Record the exact Scriptable version, iOS version, device, API, and execution context for every runtime test.
- A Node.js or WebView result must not be substituted for a JavaScriptCore result.
- A documentation source supports a documented claim, not a tested or compatible claim.
- Do not store device names, serial numbers, UDIDs, Apple IDs, tokens, or other personal identifiers in this register.
