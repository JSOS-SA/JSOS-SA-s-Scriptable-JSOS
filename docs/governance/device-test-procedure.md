# Device Test Procedure

**Purpose:** Collect reproducible Scriptable runtime evidence on an iPhone without loading application data or secrets.

## Safety boundary

Use only the dedicated probe scripts listed below. They do not import application modules and do not access files, Keychain, network services, notifications, or Pasteboard.

Do not run src/selftest.js as a substitute. Its current import path reaches Keychain reads and it copies its report to Pasteboard.

Do not include device name, serial number, UDID, Apple ID, account details, tokens, or unrelated personal data in the evidence.

## Required device metadata

Before testing, record:

- Exact iPhone model name from Settings.
- Device.model() result confirming iPhone classification.
- iOS version returned by Device.systemVersion().
- Installed Scriptable app version as shown by the device's app information.
- Test timestamp in ISO 8601 format with an explicit timezone.
- Tester role.
- Scriptable execution context.

The Scriptable Device API does not expose an installed app-version getter in the documented interface. Do not infer the installed version from the App Store's latest listing.

## Probe sequence

Run the probes manually on the selected physical iPhone inside the Scriptable app, not from Node.js and not from a widget unless the step explicitly requests widget execution.

1. **Main runtime and device:** run src/compatibility_probe.js. Record the JSON report.
2. **async/await:** run src/async_runtime_probe.js. A syntax error before execution is a failed parser result and must be preserved. A successful report confirms the tested async function and Promise behavior on that iPhone.
3. **WebView:** run src/webview_context_probe.js. Confirm the page displays the PASS result, then dismiss the WebView.
4. **Widget preview:** run src/widget_context_probe.js in the app and confirm the small preview renders.
5. **Widget host context:** add a Scriptable home-screen widget, select widget_context_probe as its script, and confirm the widget displays Widget context: true.

## Evidence record

Create one record per iPhone and context tuple. Include:

- Target ID.
- Exact iPhone model.
- Scriptable app version.
- iOS version.
- Context: in-app, WebView, or widget.
- Probe filename and source commit.
- Expected result.
- Actual result.
- Reproduction steps.
- Test timestamp in ISO 8601 format with an explicit timezone and tester role.
- Link to the original output or a sanitized attachment.

Do not combine results from different iPhone models or contexts. Do not mark a tuple Compatible solely because a probe passes on a different device or in a different context.

## Failure handling

- Preserve failed output and the original iPhone environment details.
- Do not overwrite a failed record with a later successful run.
- If a probe is changed, record the new source commit and rerun the affected test.
- A Node.js syntax check is not a substitute for running the probe in Scriptable.
