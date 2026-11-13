# Runtime and Compatibility Policy

**Rules:** SCR-RUN-001 through SCR-RUN-004, SCR-COMP-001 through SCR-COMP-005.

## Language baseline

Scriptable documents JavaScriptCore and ECMAScript 6 support. The project baseline is ECMAScript 2015. Features introduced after ES2015 require explicit compatibility evidence before general use.

The production source currently contains async functions and await. These features remain a compatibility exception until the async runtime probe passes on the selected Scriptable/iOS/device tuples. Node.js parsing does not prove JavaScriptCore support.

## Execution contexts

Each component declares support independently for:

- Scriptable in-app main runtime.
- Widget.
- WebView.
- Shortcuts and Siri.
- Share Sheet.
- Notifications.
- URL Scheme.

Only contexts with explicit evidence may be described as tested or compatible. Main runtime code does not inherit DOM or Node.js globals. Browser code remains inside WebView and communicates through explicit, validated boundaries.

## Source hierarchy

1. Scriptable official documentation defines the documented contract.
2. Reproducible Scriptable runtime tests establish observed behavior.
3. ECMAScript specifications establish language semantics.
4. Apple JavaScriptCore documentation explains the engine, but does not prove every Scriptable Host API is exposed.
5. TypeScript and ESLint assist analysis, but are not sources of truth.
6. Community reports are supporting evidence and must be reproduced before they support a compatibility claim.

Conflicts are retained and analyzed. A community report or type definition cannot silently override official documentation or a reproducible test.

## Compatibility dimensions

The assessment distinguishes:

- Documented.
- Tested.
- Compatible.
- Incompatible.
- Not Verified.
- Unsupported.

Unsupported is a governance decision. It is not equivalent to a technical incompatibility or missing test.

## Compatibility record

Each record identifies:

- Component and API/feature.
- Scriptable version.
- iOS/iPadOS version.
- Exact device.
- Execution context.
- Evidence references.
- Result and limitations.
- Risk.
- Last verification date.

Each environment tuple receives its own record. Results are not transferred between devices or contexts without evidence.

## Initial version target

The App Store listing examined reports Scriptable 1.7.19 and a minimum iOS/iPadOS requirement of 15.5. The current OS reference used for this baseline is iOS/iPadOS 27.2.1.

These are version targets, not proof that all intermediate releases, devices, APIs, or contexts have passed runtime tests. See the Compatibility Matrix and Evidence Register.
