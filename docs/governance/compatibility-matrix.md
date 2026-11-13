# Compatibility Matrix

**Assessment date:** 2026-11-13
**App Store version reference:** Scriptable 1.7.19, the latest version displayed by the iPhone listing examined.
**Approved device scope:** iPhone only, under Q76 and SCR-COMP-005.

This Markdown matrix is the human-readable view of the canonical per-component, per-iPhone, per-iOS, per-Scriptable-version, and per-context records in records/compatibility-records.json. CI validates target and record synchronization.

Every target is assessed independently. Platform eligibility and user-reported probe outcomes do not by themselves establish a general compatibility claim.

| Target ID | iPhone target | iOS target | Scriptable target | Probe records | Status | Evidence basis |
|---|---|---|---|---|---|---|
| DEV-IPHONE-15 | iPhone 6s | iOS 15.8.8 | 1.7.19 | Main Runtime, async/await, WebView, Widget | Not Verified | E-001, E-004 |
| DEV-IPHONE-27 | iPhone 11 | iOS 27.2.1 | 1.7.19 | Main Runtime, async/await, WebView, Widget | Not Verified | E-001, E-005, E-006 |
| DEV-IPHONE-15-PRO-MAX-27 | iPhone 15 Pro Max | iOS 27.2 | 1.7.12 | Main Runtime, async/await, WebView, home-screen Widget | Not Verified | E-056, E-057, E-058, E-059 |

## Interpretation

- The iPhone App Store listing examined reports a minimum iOS requirement of 15.5. The iOS 15.8.8 target is a representative older iPhone target, not evidence that iOS 15.5 itself was tested.
- Apple published iOS 27.2.1 on 2026-11-09. The iPhone 11 target uses that OS reference.
- Scriptable 1.7.19 is the latest version displayed by the App Store listing examined. It is a version reference, not a project-wide minimum-version decision.
- The iPhone 15 Pro Max results are user-reported for the exact tuple iOS 27.2 and Scriptable 1.7.12. They are recorded as Tested with actual results, while compatibility remains Not Verified and support remains Pending.
- A passing probe on one iPhone does not establish compatibility on another model, iOS version, Scriptable version, component, or execution context.

## Required per-iPhone evidence

For each target, record:

1. Exact iPhone model name from Settings.
2. Device.model() result and iPhone classification.
3. iOS version.
4. Installed Scriptable version.
5. Main-runtime result from src/compatibility_probe.js.
6. async/await result from src/async_runtime_probe.js.
7. WebView result from src/webview_context_probe.js.
8. Widget preview and actual home-screen Widget context result from src/widget_context_probe.js.
9. Date, tester role, and reproducible steps.

Never include the device name, serial number, UDID, Apple ID, or unrelated personal information.
