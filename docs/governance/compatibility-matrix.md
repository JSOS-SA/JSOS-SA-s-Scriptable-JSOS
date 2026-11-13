# Compatibility Matrix

**Assessment date:** 2026-11-13
**Target app release:** Scriptable 1.7.19, latest version displayed by the App Store listing examined.

This Markdown matrix is the human-readable view of the canonical per-component, per-device, per-context records in records/compatibility-records.json. CI validates target and record synchronization.

This matrix defines representative test targets. Every row begins as Not Verified. Platform eligibility is not a runtime test.

| Target ID | Device target | OS target | Scriptable target | Contexts to verify | Status | Evidence basis |
|---|---|---|---|---|---|---|
| DEV-IPHONE-15 | iPhone 6s | iOS 15.8.8 | 1.7.19 | In-app, WebView, widget | Not Verified | E-001, E-004 |
| DEV-IPAD-15 | iPad Air 2 | iPadOS 15.8.8 | 1.7.19 | In-app, WebView, widget | Not Verified | E-001, E-004 |
| DEV-IPHONE-27 | iPhone 11 | iOS 27.2.1 | 1.7.19 | In-app, WebView, widget | Not Verified | E-001, E-005, E-006 |
| DEV-IPAD-27 | iPad 9th generation | iPadOS 27.2.1 | 1.7.19 | In-app, WebView, widget | Not Verified | E-001, E-005, E-006 |

## Interpretation

- The App Store minimum requirement is iOS/iPadOS 15.5. The 15.8.8 targets represent the latest 15.x security branch identified for the selected older device families, not an assertion that 15.5 itself was tested.
- Apple lists iOS/iPadOS 27.2.1 as released on 2026-11-09. The supported-device list for the iOS/iPadOS 27 line is used to select representative current devices.
- Scriptable 1.7.19 is the latest version displayed by the App Store listing examined. The installed version must be recorded on each test device.
- A target is not Compatible until the required runtime tests pass and the evidence record includes exact environment details.
- If a listed model is unavailable for physical testing, record the substitute model explicitly. Do not silently transfer a result between models.

## Required per-device evidence

For each target, record:

1. Exact model name from Settings.
2. Device.model() result and phone/pad classification.
3. iOS/iPadOS version.
4. Installed Scriptable version.
5. Main-runtime result from src/compatibility_probe.js.
6. async/await result from src/async_runtime_probe.js.
7. WebView result from src/webview_context_probe.js.
8. Widget preview and actual widget-context result from src/widget_context_probe.js.
9. Date, tester role, and reproducible steps.

Never include the device name, serial number, UDID, Apple ID, or unrelated personal information.
