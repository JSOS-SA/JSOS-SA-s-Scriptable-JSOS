# Architecture Standard

**Rule:** SCR-ARCH-001.

## Layers

The project uses these logical layers:

- Core: domain rules and pure logic.
- Data: persistence and data transformation.
- Services: external integrations and system-facing operations.
- Features: user-facing capabilities and workflows.
- UI: Scriptable UI, WebView presentation, and Widget composition.

Scriptable Host APIs are explicit boundaries. Modules that use host APIs must declare the required runtime and context.

## Component vocabulary

- Script: an entry point run directly by Scriptable.
- Module: an importable JavaScript unit.
- Library: a reusable collection of modules.
- Dependency: an external or internal component required by another component.

These terms are not interchangeable. A module imported through Scriptable importModule remains a Module even if it is reused by several scripts.

## Runtime vocabulary

- Runtime: the JavaScript engine and its execution services.
- Execution Context: the host context in which code runs.
- Host API: an API exposed by Scriptable or the operating system.

Main runtime, WebView, and Widget code must not be treated as one interchangeable environment.
