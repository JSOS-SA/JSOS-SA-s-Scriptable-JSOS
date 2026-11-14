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

## Scriptable source layout

- All JavaScript application files executed or imported by Scriptable must be stored directly in one flat `src/` directory.
- `src/` must not contain subdirectories.
- `src/` is reserved for Scriptable runtime application JavaScript. Tests, documentation, TypeScript source or declarations, development tools, build tools, package-manager files, and development/build configuration must remain outside `src/`.
- Logical layers describe responsibilities. They must not be represented as nested directories under `src/`. Express module responsibilities through file names, module interfaces, exports, and dependency direction.
- Scriptable's documented `index.js` directory-import behavior is a runtime capability, not an exception to this project's flat `src/` convention.

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
