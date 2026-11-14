# Unified Specifications for the Scriptable Project

| Metadata | Value |
|---|---|
| Document title | Unified Scriptable Engineering Constitution & Technical Standards |
| Status | Unified draft for review and approval |
| Proposed version | 1.0.0 |
| Device scope | iPhone only |
| Responsibility model | Single Developer and Sole Responsible Owner |
| Basis | Decisions Q1–Q75 and the document *Scriptable Application, JavaScript Language, and Runtime Environment Rules and Standards* |

> **Translation status:** Revised English translation draft under review. Not approved. The Arabic source remains authoritative until the English text is fully reviewed and explicitly approved.

### Translation unit map

| Unit | Source sections |
|---|---|
| T-001 | 1–3 |
| T-002 | 4–6 |
| T-003 | 7–9 |
| T-004 | 10–12 |
| T-005 | 13–15.2 |
| T-006 | 15.3–16.4 |
| T-007 | 17–19 |
| T-008 | 20–23 |
| T-009 | 24–25 |

---

## 1. Purpose and Scope

These specifications aim to establish a unified engineering reference governing the development, review, testing, and maintenance of Scriptable projects.

The specifications cover:

- The JavaScript language and the ECMAScript standard.
- The Apple JavaScriptCore engine.
- Scriptable APIs.
- The module and import system.
- Scriptable Main Runtime (Project-defined).
- WebView Runtime (Project-defined).
- TypeScript and its definitions.
- Project structure and architecture.
- Libraries and dependencies.
- Code and data quality.
- Security and privacy.
- Performance and resource management.
- Testing and compatibility verification.
- Change and exception management.
- Governance and evidence registers.
- Integration with GitHub and CI.

These specifications govern engineering work. They do not mean that every API, context, or feature is automatically supported.

## 2. Project Boundaries and Responsibilities

### 2.1 Target Devices

1. MUST make iPhone the sole target device.
2. MUST NOT consider iPad a target device.
3. MUST NOT expand the support scope to any other device without a formal amendment to the specifications.
4. MUST NOT generalize a test result from one device to another.
5. MUST record the iPhone model, iOS version, and Scriptable version when documenting compatibility tests.
6. MUST NOT declare support for a version or device without appropriate test evidence.

### 2.2 Responsibility Model

One person assumes all project responsibilities, including:

- Ownership of the specifications and constitution.
- Writing and developing code.
- Reviewing changes.
- Testing and verification.
- Approving changes and exceptions.
- Version management.
- Deployment and maintenance.
- Managing evidence, compatibility, and risk registers.

These responsibilities can be separated conceptually in procedures and records, but different people MUST NOT be assumed to occupy them.

### 2.3 Responsibility Principle

Every approval, review, test result, and deployment operation MUST be attributable to the sole responsible owner, with the date, outcome, and appropriate evidence recorded.

## 3. Technical Model and Runtime Layers

Scriptable MUST be understood as a host application that executes JavaScript and exposes application-specific interfaces. It is not equivalent to a web browser, Node.js, or an unrestricted native iOS application. Correct engineering decisions depend on identifying which layer owns a language feature, API, or behavior and which execution context is expected to provide it.

### 3.1 Layer Model

The following layers MUST be distinguished and MUST NOT be treated as a single environment:

| Layer | Responsibility and boundary |
|---|---|
| JavaScript | The programming language used to express program logic, values, objects, functions, and control flow. |
| ECMAScript | The language specification that defines JavaScript syntax and semantics, including standardized built-in objects and operations. It does not define Scriptable-specific or browser-specific APIs. |
| JavaScriptCore | Apple's JavaScript engine. Scriptable's official documentation identifies JavaScriptCore as its JavaScript engine. The engine's native integration APIs are not automatically Scriptable script globals. |
| Scriptable (Host Application) | The application that hosts script execution and exposes Scriptable APIs, module loading, execution behavior, and integrations with iOS. |
| Scriptable Main Runtime | The primary script execution context provided by Scriptable. This is a project-defined architectural term, not a separately named Apple framework. |
| WebView Runtime | The web-page execution context hosted by Scriptable's WebView. This is a project-defined architectural term for the page context, not a claim about the internal engine implementation. |
| TypeScript | A development-time type system and compiler toolchain. Its declarations and compiler settings do not create APIs or runtime capabilities. |
| Native iOS APIs | APIs provided by Apple frameworks. Their existence on iOS does not establish that Scriptable exposes them directly to JavaScript. |

### 3.2 Conceptual Execution Model

A useful conceptual model for a Scriptable script is:

```text
JavaScript source
       |
       v
JavaScriptCore execution engine
       |
       v
Scriptable-provided host interfaces
       |
       v
Supported iOS services and capabilities
       |
       v
Script output and integrations
```

This model describes responsibility boundaries. It is not an official diagram of Scriptable's internal implementation, and it MUST NOT be used to infer undocumented implementation details.

### 3.3 JavaScript and ECMAScript Boundary

JavaScript is the language used by the script. ECMAScript is the standard that specifies the language's syntax and behavior. Standard language features and built-in objects belong to this layer; APIs for files, Keychain, location, widgets, and other application services belong to a host environment.

Scriptable's official documentation states that the application uses JavaScriptCore and supports ECMAScript 6. This is the documented baseline for this project. It does not, by itself, prove that every later ECMAScript feature is supported or that every feature introduced after ES6 is unavailable. Feature compatibility MUST be established for the target Scriptable and iOS versions.

### 3.4 JavaScriptCore Boundary

JavaScriptCore is Apple's framework for evaluating JavaScript within applications. Its native interfaces include types such as `JSContext`, `JSValue`, `JSVirtualMachine`, `JSManagedValue`, and `JSExport`. These interfaces are intended for native application developers integrating JavaScriptCore with Swift, Objective-C, or C-based code.

The existence of a JavaScriptCore type or function does not establish that the same name is available inside a Scriptable script. In particular, these native integration types MUST NOT be treated as Scriptable globals unless Scriptable documentation explicitly exposes them.

### 3.5 Scriptable Host Application Boundary

The Scriptable application determines which host APIs are made available to scripts and how those APIs interact with iOS. Examples include `FileManager`, `Request`, `Keychain`, `Location`, `ListWidget`, `Calendar`, and `Reminder`.

These APIs are not defined by ECMAScript. Their names, properties, parameters, return values, asynchronous behavior, availability, and restrictions MUST be established from the official Scriptable documentation and verified in the target context when runtime behavior matters.

### 3.6 Scriptable Main Runtime and WebView Runtime

**Scriptable Main Runtime** is the primary context in which a Scriptable script executes. Scriptable host APIs are available there according to the application's documented interface. The primary script environment is not a browser environment; browser objects such as `window`, `document`, and the DOM MUST NOT be assumed to exist there.

**WebView Runtime** is the page context hosted by a Scriptable `WebView`. A loaded web page can provide HTML, CSS, JavaScript, and browser-page facilities such as `window`, `document`, and the DOM, subject to the page and WebView environment.

The two contexts MUST be treated as separate execution contexts. Code that succeeds in WebView does not thereby become valid in Scriptable Main Runtime. The project MUST NOT assume that the contexts share global objects, JavaScript heaps, module resolution, host APIs, permissions, or lifecycle behavior. Communication between them MUST use the documented WebView mechanisms, such as `evaluateJavaScript()`, with transferred data handled explicitly.

The fact that Scriptable uses JavaScriptCore for its primary script environment MUST NOT be used to infer which engine or internal implementation is used by WebView. That implementation detail requires its own authoritative evidence.

### 3.7 TypeScript Boundary

TypeScript provides development-time type checking and can transform TypeScript source into JavaScript. A declaration describes what a compiler or editor should expect; it does not implement the declared function, object, or property in the runtime.

The `target` compiler option controls aspects of the JavaScript output, while `lib` controls the standard library declarations available to the type checker. Neither setting installs runtime features. DOM declarations can make browser names type-check even when those names are unavailable in Scriptable Main Runtime.

Type definitions for Scriptable are supporting development references. They MUST be checked against official Scriptable documentation, and the generated JavaScript MUST be tested in its intended Scriptable context.

### 3.8 Native iOS API Boundary

An API documented by Apple for an iOS framework is a native platform API. Its availability on iOS does not mean that JavaScript running in Scriptable can call it directly. Scriptable must expose an appropriate wrapper or documented bridge before a script can rely on that capability.

The existence of a native framework, class, method, entitlement, or capability MUST NOT be treated as proof of Scriptable access. The exposed Scriptable interface and any relevant iOS permission or availability constraints remain the controlling boundary.

### 3.9 API Ownership and Evidence

| Item being evaluated | Primary authority | What that authority can establish |
|---|---|---|
| JavaScript syntax and standardized behavior | ECMAScript specification | Language rules and standardized semantics. |
| JavaScriptCore engine behavior and native integration types | Apple JavaScriptCore documentation and suitable engine tests | Engine and framework behavior, not Scriptable host exposure. |
| Scriptable APIs | Official Scriptable documentation | Documented application interfaces and their documented behavior. |
| Web page APIs | Applicable web-platform documentation and tests in the target WebView | Page-context behavior, not Main Runtime availability. |
| Native iOS APIs | Apple platform documentation | Native platform availability, not direct Scriptable exposure. |
| TypeScript declarations and compiler behavior | TypeScript documentation and the relevant definition package | Static type-checking and transformation behavior, not runtime implementation. |

Evidence labels used in technical records MUST distinguish the following meanings:

| Label | Meaning |
|---|---|
| `DOCUMENTED` | The claim is explicitly supported by an identified authoritative document. |
| `CONFIRMED` | The claim has been reproduced by a test in the named target environment, with the environment and evidence recorded. |
| `INFERRED` | The claim is a reasoned interpretation of available evidence, but is not directly stated or demonstrated. |
| `Not Verified` | Available evidence is insufficient to establish the claim. |
| `UNSUPPORTED` | Authoritative documentation or a suitable target-environment test establishes that the capability is not supported in the stated scope. |

`Not Verified` MUST NOT be treated as `UNSUPPORTED`. The absence of a statement in documentation, by itself, does not prove that a capability is unavailable. These evidence labels describe the strength or nature of a claim; they do not replace the compatibility outcomes defined in Section 15.5.

### 3.10 Rules for Separating Layers

1. The existence of a feature in ECMAScript does not establish its existence in every runtime environment.
2. The existence of an API in JavaScriptCore does not establish that it is directly available to a Scriptable script.
3. The existence of a TypeScript definition does not create a Runtime API.
4. Successful execution of code in Node.js does not establish its compatibility with Scriptable.
5. Successful execution of code in WebView does not establish its compatibility with Scriptable Main Runtime.
6. The existence of a Native iOS API does not establish that Scriptable exposes it to scripts.
7. Similar names across JavaScript, JavaScriptCore, Web APIs, Scriptable APIs, and Native iOS APIs MUST NOT be treated as proof of equivalent behavior.
8. Global objects and available interfaces MUST be evaluated in the execution context in which the code actually runs.
9. The responsible layer and execution context MUST be identified before an API or feature is approved for use.
10. Compatibility claims MUST be limited to the versions, device, and execution context covered by the available documentation and test evidence.

## 4. JavaScript and ECMAScript Standard

### 4.1 Language Baseline and Compatibility Contract

1. The project MUST adopt ECMAScript 2015 (ES6) as its documented language baseline. This is the project's approved baseline decision (Q1) and matches Scriptable's official statement that its JavaScript environment uses Apple JavaScriptCore and supports ECMAScript 6.
2. The ES2015 baseline MUST be interpreted as the project's conservative documented baseline. It MUST NOT be interpreted as proof that Scriptable supports no later feature, nor as a guarantee that every ES2015 feature behaves identically on every supported device, Scriptable release, iOS release, or execution context.
3. Features standardized after ES2015 MUST NOT be adopted automatically. They require feature-specific evidence for every required target tuple and execution context before they become an approved project dependency.
4. The project MUST distinguish at least the following compatibility dimensions:
   - **Syntax compatibility:** whether the target runtime can parse the source syntax.
   - **Standard built-in compatibility:** whether the required standard objects, constructors, methods, and properties exist.
   - **Runtime-semantics compatibility:** whether those features behave as required, including asynchronous behavior, errors, iteration, coercion, and edge cases.
   - **Host API compatibility:** whether Scriptable exposes the required application API and whether it behaves as documented.
   - **Execution-context compatibility:** whether the feature and host API work in the intended Main Runtime, WebView, Widget, or other declared context.
5. A feature MUST be assessed against the exact target tuple: iPhone model, iOS version, installed Scriptable version, and execution context. Results MUST NOT be generalized to another tuple without evidence.
6. A successful compilation, type check, lint run, static analysis, or transpilation MUST NOT be treated as proof of runtime compatibility. These checks remain useful supporting evidence for the properties they actually examine.

Scriptable's official JavaScript Environment statement is available at:

https://docs.scriptable.app/

The official page documents JavaScriptCore and ECMAScript 6. It does not publish a complete per-feature compatibility matrix or identify an exact JavaScriptCore build for every Scriptable/iOS combination. The project MUST NOT invent such a mapping. When the exact engine build is not independently established, record it as Not Verified and rely on reproducible tests in the named target environment.

### 4.2 Newer ECMAScript Features and Runtime Evidence

A feature introduced after ES2015 MUST remain Not Verified for a target until the required evidence has been recorded. The fact that a feature appears in a later ECMA-262 edition, a recent JavaScriptCore release, TypeScript declarations, Node.js, Safari, or another JavaScript engine MUST NOT be treated as proof that it is available in the target Scriptable runtime.

The following examples illustrate why features MUST be identified individually rather than grouped under a vague label such as "modern JavaScript":

| Feature | ECMAScript edition | Project evidence and required interpretation |
|---|---|---|
| Selected ES2015 built-ins (Promise, Object.assign(), Map, Set, and String.prototype.includes()) | ES2015 | Evidence E-056 records user-reported successful presence checks for these built-ins on iPhone 15 Pro Max / iOS 27.2 / Scriptable 1.7.12 in the in-app Main Runtime. The result was not independently reproduced and does not establish general compatibility. |
| Array.prototype.includes() | ES2016 | Evidence E-056 records a user-reported successful presence check on iPhone 15 Pro Max / iOS 27.2 / Scriptable 1.7.12 in the in-app Main Runtime. It was not independently reproduced by maintainers; the result does not establish general compatibility. |
| Async functions and await | ES2017 | Evidence E-057 records a user-reported successful probe on iPhone 15 Pro Max / iOS 27.2 / Scriptable 1.7.12 in the in-app Main Runtime. The probe covered async-function parsing, Promise.all(), and rejection handling. It was not independently reproduced by maintainers and does not establish support for every async pattern or target. |
| Array.prototype.flat() and Array.prototype.flatMap() | ES2019 | No target-specific result is established by the current evidence register. Treat as Not Verified. |
| BigInt | ES2020 | No target-specific result is established by the current evidence register. Treat as Not Verified. |
| Array.prototype.at() | ES2022 | No target-specific result is established by the current evidence register. Treat as Not Verified. |
| Array.prototype.toSorted(), toReversed(), toSpliced(), and with() | ES2023 | No target-specific result is established by the current evidence register. Treat as Not Verified. |

The edition assignments above are language-standard facts. The test outcomes are project evidence with narrower scope. In particular, E-056 and E-057 are user-reported observations for one device, one iOS version, one Scriptable version, and one execution context. The compatibility register currently retains the overall compatibility status as Not Verified and the support decision as Pending. A recorded test result MUST NOT be silently promoted to a project-wide compatibility decision.

The project MUST NOT infer that async functions are unavailable merely because they were standardized after ES2015. Conversely, the reported E-057 result MUST NOT be generalized beyond the exact tested tuple. The same rule applies to every newer syntax feature and built-in method.

The project MUST distinguish a syntax probe from a built-in probe. For example, successfully parsing an async function does not prove that every Promise combinator, asynchronous iterator, host API, or execution context works. Checking that typeof Array.prototype.toSorted === "function" is useful for detecting the method's presence, but it does not prove the method's complete semantics or the behavior of application code that depends on it.

TypeScript settings MUST be interpreted correctly:

- target controls which JavaScript syntax TypeScript transforms or leaves in the emitted output. It does not establish what the Scriptable runtime can execute.
- lib supplies type declarations for standard JavaScript APIs and selected host-environment APIs, such as DOM declarations when configured. Scriptable-specific declarations are supplied separately by Scriptable type-definition packages. The lib option does not install APIs, implement missing methods, or polyfill the runtime.
- DOM declarations can make names such as window and document type-check even when they are not available in Scriptable Main Runtime.
- A transpiler may transform some syntax while leaving calls to newer built-in methods in the output. A successful build therefore does not prove that those methods exist at runtime.

Official TypeScript references:

https://www.typescriptlang.org/tsconfig/target

https://www.typescriptlang.org/tsconfig/lib

ECMAScript edition snapshots MUST be used to identify when a feature became part of the standard. The current specification is useful for current semantics, but it MUST NOT replace the edition history when classifying when a feature was introduced.

The project MUST use the feature-verification procedure in Section 15.6 and record the result in the canonical compatibility and evidence registers. The result MUST distinguish Documented, Tested, Compatible, Incompatible, and Not Verified. Not Verified MUST NOT be interpreted as Incompatible, and Tested MUST NOT automatically be interpreted as Compatible.

Test262 may be used as a language-conformance reference or as a source of focused test cases. Passing a Test262 test or a local engine test does not establish Scriptable host API compatibility, execution-context compatibility, or support on every target iPhone.

### 4.3 Code Quality

The following requirements are project engineering policy. They are not additional ECMAScript syntax requirements, and they MUST NOT be presented as rules imposed by the JavaScript language specification. Their purpose is to make project code easier to understand, test, review, and maintain within Scriptable's documented runtime and host-API boundaries.

1. **Variable declarations**
   - New code MUST use const when a binding is not reassigned.
   - New code MUST use let when reassignment is required.
   - New code SHOULD NOT use var. A documented legacy, interoperability, or narrowly justified compatibility requirement MAY permit it.
   - Developers MUST remember that const prevents rebinding; it does not make an object or array deeply immutable.

2. **Comparisons**
   - Code MUST use strict equality (===) and strict inequality (!==) by default.
   - Coercive equality (== or !=) MAY be used only when type coercion is intentional, understood, and documented.
   - Conditions MUST make the intended comparison clear. Truthiness checks MUST NOT replace explicit checks when 0, false, or an empty string are valid values with distinct meanings.

3. **null, undefined, and missing values**
   - Input and data contracts MUST state when a value may be absent, null, or undefined.
   - Code MUST validate optional or untrusted values at the boundary where they enter the application, before relying on their shape or type.
   - Code MUST preserve the distinction between a missing property, an explicitly undefined value, and null when that distinction affects behavior.
   - Code MUST NOT add redundant checks for values that are guaranteed by a validated contract. Defensive checks SHOULD be placed at trust boundaries rather than repeated indiscriminately throughout internal logic.

4. **Expected errors and rejected Promises**
   - Code MUST handle failures that are expected at its operational boundaries, including network requests, file access, parsing, permissions, and asynchronous operations.
   - A catch handler MUST recover, translate the error, add useful context, perform required cleanup, or deliberately report and terminate the operation. It MUST NOT silently swallow an error.
   - Errors that cannot be handled meaningfully at the current layer SHOULD propagate to a layer that can apply the correct failure policy.
   - Retry behavior MUST account for whether the operation is safe to repeat. Non-idempotent operations MUST NOT be retried automatically without appropriate safeguards.
   - Error reports MUST contain useful diagnostic context without exposing credentials, tokens, or private data.

5. **Function size and responsibility**
   - Functions MUST have a clear, cohesive purpose and a comprehensible contract.
   - Functions SHOULD separate unrelated responsibilities, such as input validation, business decisions, system access, transformation, and presentation.
   - Functions SHOULD be split when doing so creates a meaningful boundary that improves understanding, testing, reuse, or change isolation.
   - The project MUST NOT impose an arbitrary line-count limit as a substitute for reviewing cohesion and complexity.

6. **Duplication and abstraction**
   - Repeated business rules, validation rules, and transformations SHOULD be centralized when they represent the same concept and are expected to change together.
   - Developers MUST avoid copying logic in ways that allow equivalent rules to drift apart.
   - Developers SHOULD NOT create premature abstractions for coincidental similarities. A small amount of local duplication MAY be clearer and safer than a shared abstraction that couples unrelated behavior.

7. **Names**
   - Variables, functions, modules, and constants MUST use clear, consistent, intention-revealing names.
   - Names SHOULD use the project's established domain vocabulary and MUST NOT conceal side effects or misleadingly imply stronger guarantees than the code provides.
   - Abbreviations SHOULD be avoided unless they are established domain terms or widely understood technical names.

8. **Magic values and strings**
   - Unexplained values that encode business rules, thresholds, timeouts, limits, protocol identifiers, storage keys, or repeated configuration MUST be replaced with named constants or a clearly defined configuration source.
   - A constant MUST communicate the meaning and, where useful, the unit or scope of the value.
   - Developers SHOULD NOT create constants for every trivial literal when doing so adds indirection without clarifying meaning.

9. **Comments and rationale**
   - Comments MUST explain non-obvious reasons, assumptions, invariants, constraints, workarounds, or security and compatibility decisions.
   - Comments SHOULD explain why the code exists or why a less obvious approach is required, rather than merely restating what the code already says.
   - Comments and references MUST be updated when the underlying behavior or rationale changes. Stale comments MUST NOT be retained as evidence of current behavior.

10. **Business logic and system access**
    - Business rules and data transformations SHOULD be separated from direct Scriptable system access as far as practicable.
    - Calls to Scriptable host APIs such as Request, FileManager, Keychain, Location, Calendar, and Reminder SHOULD be kept behind clear service functions or narrow adapters where that separation improves testability or change isolation.
    - Pure transformation and decision logic SHOULD be kept independent of I/O when practical, so it can be tested with controlled inputs.
    - This rule MUST NOT lead to unnecessary layers or wrappers around every API call. The architecture SHOULD remain proportionate to the script's size, risk, and actual maintenance needs.

The no-var and eqeqeq ESLint rules provide practical, configurable enforcement examples for variable declarations and strict comparisons. They are style-tool policies, not ECMAScript conformance requirements:

https://eslint.org/docs/latest/rules/no-var

https://eslint.org/docs/latest/rules/eqeqeq

Empirical studies of code readability and identifier naming provide supporting context for clear names and understandable structure. They do not prove that one style rule guarantees maintainability or that every duplication is harmful. The project MUST treat these studies as supporting evidence, not as substitutes for project decisions and code review.

## 5. Scriptable APIs

This section defines the project's verification policy for Scriptable host APIs. It distinguishes documented API existence from runtime availability on a particular Scriptable release, iOS version, device, and execution context. The API-family list in 5.2 is an organizational index, not a complete or self-validating API specification.

### 5.1 Source of Truth and API Verification

The official Scriptable documentation is the primary product-specific source for determining which host APIs Scriptable documents and exposes. The documentation describes Scriptable's JavaScript environment and individual API types, properties, constructors, methods, parameters, return values, behavior, and limitations.

The official documentation MUST be consulted before an API is introduced, recommended, or used in project code. However, documentation presence alone MUST NOT be treated as proof that the API works in every installed Scriptable version or execution context. Where the documentation does not state a version or context constraint, record that fact as unspecified and verify the target runtime instead of inferring support.

For each API used or proposed, the reviewer MUST verify and record, where applicable:

1. **Existence and ownership:** the exact documented API/type name, its owning namespace or type, and whether it is a global, constructor, static member, instance member, callback, or returned object.
2. **Exact member names:** spelling and casing of every property and method, including whether a member is read-only, writable, optional, or deprecated.
3. **Signature:** parameter order, types, accepted values, optional parameters, defaults, nullability, callback signatures, and any required object shape.
4. **Return and completion behavior:** return type, returned object shape, whether the operation is synchronous or Promise-based, when the Promise settles, and documented rejection or error behavior.
5. **Side effects and permissions:** user prompts, privacy permissions, access requirements, network activity, persistent changes, destructive operations, and other observable effects.
6. **Execution context:** whether the API is supported in the Scriptable app, action extension, Siri or Shortcuts, Home Screen or Lock Screen widget, notification flow, or another documented context. WebView JavaScript runs in a web-content environment and MUST NOT be confused with Scriptable host globals.
7. **Version constraints:** the minimum or affected Scriptable app version and iOS/iPadOS version, where documented. If no version requirement is published, mark it as **not specified by the documentation** and test the actual target. Do not infer a minimum version from the date of an example or from the current documentation page.
8. **Lifecycle status:** deprecation notices, version of deprecation, replacement API, behavioral changes, warnings, and documented limitations.
9. **Target-runtime evidence:** where runtime behavior matters, test the exact target tuple and record the device, iOS/iPadOS version, Scriptable version, and execution context. A result from one tuple MUST NOT be generalized to other tuples without evidence.
10. **Traceability:** retain the official documentation URL and relevant page or section, the date checked, and the evidence status used by the project.

The documentation itself demonstrates why version and context checks matter. For example, `args.length` and `args.all` are marked deprecated since Scriptable 1.3; `args.siriShortcutArguments` is marked deprecated since 1.4; and `Contact.note` is unavailable starting with Scriptable 1.7.5. The `ListWidget.addAccessoryWidgetBackground` property is documented as available starting with iOS 16, while `Device.isUsingDarkAppearance` is documented as unsupported in widgets. These are API-specific constraints, not general assumptions about every Scriptable API. See the official references in Section 24.11.

The source hierarchy MUST be applied according to the question being answered:

- **Scriptable API existence and host behavior:** official Scriptable API documentation is the primary product-specific reference.
- **Scriptable app-version changes:** official Scriptable release notes or version-specific product documentation, where available.
- **iOS framework behavior:** Apple documentation explains the underlying Apple framework, but does not prove that Scriptable exposes that framework's classes or members to scripts.
- **JavaScript language behavior:** the ECMAScript specification and JavaScriptCore documentation apply to language/runtime questions, not to the existence of Scriptable-specific host APIs.
- **Type definitions, package metadata, examples, forum posts, and tutorials:** secondary discovery or corroboration material only. They MUST NOT override the official Scriptable documentation or establish runtime availability by themselves.
- **Actual runtime behavior:** a reproducible test on the declared target tuple is required when the claim concerns execution compatibility, permissions, context, or version-specific behavior.

If authoritative sources conflict, or the documented API cannot be confirmed on the target, the implementation MUST be marked unresolved and MUST NOT silently select the most convenient interpretation.

### 5.2 API Families

The following families provide an initial, non-exhaustive index of documented Scriptable APIs. The names below are included for organization and navigation only. They do not imply that every member, property, method, or execution context has been verified for every Scriptable or iOS version.

- **Execution, invocation, and script output:** `args`, `config`, and `Script`.
- **Files, data, and credential storage:** `FileManager`, `Data`, and `Keychain`.
- **HTTP networking:** `Request`.
- **Device and location services:** `Device` and `Location`.
- **Photos and image acquisition:** `Photos` and `Image`.
- **Contacts and address-book records:** `Contact`, `ContactsContainer`, and `ContactsGroup`. The documented contact type is `Contact`; do not invent or substitute a `Contacts` class name.
- **Calendars, events, reminders, and recurrence:** `Calendar`, `CalendarEvent`, `Reminder`, and `RecurrenceRule`.
- **Interactive user interfaces:** `Alert`, `DatePicker`, `TextField`, and `UITable`, together with their documented row, cell, and element types. `TextField` is used through an `Alert`; it is not documented as a separately constructed input view.
- **Web content and external browsing:** `WebView` and `Safari`. WebView page JavaScript and Scriptable host APIs are distinct execution surfaces.
- **Widgets and widget elements:** `ListWidget`, `WidgetStack`, and documented widget element types such as `WidgetText`, `WidgetDate`, and `WidgetImage`.
- **Drawing and graphics:** `DrawContext`, `Path`, `Color`, `Font`, and `Image`. In this family, `Path` represents a geometric drawing path used with `DrawContext`; it is not a filesystem-path or storage API.
- **Date and time formatting:** `DateFormatter`.
- **Speech and messaging:** `Speech` and `Mail`.
- **Structured text parsing:** `XMLParser`.

The index MUST be expanded only when the relevant type is present in the official Scriptable documentation. Similar names in Apple frameworks, JavaScript standards, npm packages, or community examples do not establish a Scriptable API. Family placement is an organizational choice and MUST NOT be interpreted as a runtime dependency or guarantee.

### 5.3 Prohibition of Assumptions

The following practices are prohibited:

- **Undocumented API invention:** MUST NOT invent, infer, or fabricate Scriptable globals, classes, constructors, properties, methods, parameter names, return values, or callback behavior.
- **Unverified examples:** MUST NOT treat an internet example, code snippet, forum post, generated answer, or tutorial as authoritative evidence. Examples may be outdated, incomplete, context-specific, or incorrect. They may guide discovery only; verify every API claim against the official documentation and the target runtime where required.
- **Apple framework exposure:** MUST NOT assume that an Apple framework API is directly accessible from Scriptable merely because Apple documents it. Scriptable exposes a product-specific host surface; Apple framework documentation describes the underlying platform, not necessarily Scriptable's JavaScript bridge.
- **npm and third-party package compatibility:** MUST NOT assume that a package works in Scriptable because it is published on npm or works in Node.js, a browser, or another JavaScript runtime. Review its module format, dependency graph, native bindings, runtime globals, platform assumptions, network and filesystem requirements, and build or bundling requirements. Verify the resulting code in the target Scriptable runtime. Runtime-environment compatibility is a separate engineering problem from package availability.
- **Type declarations as runtime proof:** MUST NOT use TypeScript declarations, DefinitelyTyped packages, generated declarations, editor autocomplete, or successful type checking as sole evidence that an API exists or is implemented at runtime. Type declarations describe a static type surface; they do not install or implement the corresponding runtime object.
- **Compilation as runtime proof:** MUST NOT treat successful compilation, transpilation, linting, or static analysis as proof that a Scriptable API is available, that permissions are granted, or that an operation behaves correctly in a particular execution context.
- **Cross-context assumptions:** MUST NOT transfer browser DOM, Node.js, native iOS, or Scriptable Main Runtime behavior to another context without explicit documentation or a target-specific test.
- **Version assumptions:** MUST NOT infer support or deprecation solely from a sample's publication date, package version, or the fact that an API is still callable. Check the current official documentation and the relevant version history.

### 5.4 API Verification Record

Every non-trivial API dependency introduced into a maintained project component SHOULD have a traceable verification record. At minimum, record:

- API/type and exact member names.
- Official Scriptable documentation URL and relevant section.
- Scriptable app version and iOS/iPadOS version relevant to the claim, or an explicit note that the documentation does not specify them.
- Execution context and any permission, storage, network, or resource constraints.
- Signature and return/completion behavior relied upon by the implementation.
- Deprecation or replacement status.
- Runtime test evidence and the exact target tuple, when runtime support is claimed.
- Verification date and a clear status separating **documented**, **runtime verified for the stated target**, **not verified**, and **deprecated**.

A documented API MUST NOT automatically be labelled runtime verified. A runtime test on one target MUST NOT automatically establish support on another target. Where evidence is missing, retain the unresolved status and state what remains to be verified.

## 6. Module and Import System

### 6.1. Scriptable Module Architecture

Scriptable provides a native module mechanism based on the following documented interfaces:

- `importModule()`
- `module`
- `module.exports`

Scriptable treats each JavaScript file as a separate Module. The `importModule(name)` function loads a module and returns the value assigned to its `module.exports` property.

The documented module-loading behavior MUST be followed.

#### 6.1.1. Module Import and Resolution

The `importModule(name)` function accepts a module name or file path.

The `.js` extension is optional when importing a JavaScript file by name.

Scriptable searches for modules in the following documented order:

1. Relative to the file importing the module.
2. The Scriptable folder in iCloud Drive, when iCloud Drive is enabled.
3. Scriptable's internal App Group folder.
4. Scriptable's local folder.

A module may also be imported using a file path. When the specified path points to a directory, Scriptable looks for an `index.js` file inside that directory.

Engineering requirements:

- Module paths MUST identify the intended module unambiguously.
- Relative paths MUST be evaluated according to Scriptable's documented resolution behavior.
- Module directory structures MUST use a consistent and understandable convention.
- Directory-based modules MUST provide the expected `index.js` entry point.
- Modules MUST NOT depend on undocumented path-resolution behavior.
- Import paths MUST be verified in the actual Scriptable execution environment.

#### 6.1.2. Module Exports

A module exposes its public values through `module.exports`.

The exported value may be:

- A Function.
- An Object.
- A Class.
- A primitive value.
- Another supported JavaScript value.

A module may expose multiple functions or objects through properties of `module.exports`, or assign a single value directly to `module.exports`.

Example:

```javascript
function calculateSquare(value) {
  return value * value;
}

function calculateCube(value) {
  return value * value * value;
}

module.exports = {
  calculateSquare,
  calculateCube
};
```

Importing the module:

```javascript
const calculations = importModule("calculations");

const square = calculations.calculateSquare(5);
const cube = calculations.calculateCube(5);
```

Engineering requirements:

- Every module MUST expose an intentional public interface.
- Internal implementation details SHOULD remain private unless consumers require them.
- Exported names MUST be descriptive and consistent.
- Exported functions MUST have predictable input and output behavior.
- Consumers MUST use the exported interface rather than relying on internal implementation details.
- A module's public interface MUST NOT change incompatibly without updating its dependent modules.

### 6.2. Node.js Compatibility Boundaries

The existence of `importModule()` and `module.exports` does NOT establish compatibility with the complete Node.js runtime or its module-loading architecture.

Scriptable uses Apple's JavaScriptCore and provides its own host environment and documented module mechanism. Its module system MUST be treated as Scriptable-specific rather than assumed to be a complete implementation of Node.js CommonJS or ECMAScript Modules.

The following capabilities MUST NOT be assumed to exist unless independently documented and verified in the target Scriptable environment:

- `require()`
- `process`
- Automatic `node_modules` package resolution.
- Node.js built-in modules and native Node.js APIs.
- Node.js package-manager behavior.
- Automatic compatibility with arbitrary npm packages.
- Node.js CommonJS module-loading semantics beyond the behavior explicitly documented by Scriptable.
- The complete Node.js or browser ECMAScript Modules loading and resolution systems.

#### 6.2.1. Third-Party JavaScript Libraries

The fact that a JavaScript library is published on npm does NOT establish that it is compatible with Scriptable.

A third-party library MAY be used only after its runtime requirements have been evaluated.

Compatibility verification MUST consider:

- Dependencies on Node.js built-in modules.
- Dependencies on browser-specific APIs.
- Dependencies on unsupported JavaScript language features.
- Dynamic module loading and package-resolution requirements.
- Native bindings or platform-specific functionality.
- External runtime assumptions.
- Compatibility with Scriptable's actual execution context.

Libraries that require unavailable Node.js or browser APIs MUST NOT be used without a verified compatibility layer or an appropriate alternative implementation.

Bundling or transpiling a library does not, by itself, establish runtime compatibility.

### 6.3. Module Responsibility and Cohesion

Every module MUST have a clearly defined purpose and a cohesive set of related responsibilities.

A module SHOULD represent a well-defined functional concern rather than an arbitrary collection of unrelated functions.

Its design MUST make the following aspects understandable:

- Module purpose and responsibility.
- Public functions, objects, and exported values.
- Required inputs and expected outputs.
- Data structures and interface contracts.
- External dependencies.
- Side effects and state changes.
- Error-handling behavior.
- Execution and asynchronous behavior, where applicable.

A module's responsibilities SHOULD be sufficiently cohesive that its implementation can be understood, tested, and maintained without requiring unnecessary knowledge of unrelated modules.

### 6.4. Dependency Management and Coupling

Module dependencies MUST be explicit, understandable, and limited to what is necessary.

Engineering requirements:

- Circular dependencies MUST be avoided.
- Unnecessary inter-module coupling MUST be eliminated.
- Modules SHOULD depend on stable public interfaces rather than internal implementation details.
- Dependencies MUST follow a clear and understandable direction.
- A module MUST NOT depend on unrelated modules merely to access incidental functionality.
- Shared functionality SHOULD be extracted into an appropriately scoped reusable module when doing so reduces genuine duplication.
- Dependency relationships SHOULD remain traceable through the project's import graph.

A module dependency graph SHOULD be reviewed to identify circular references, excessive dependency chains, unnecessary coupling, and architectural inconsistencies.

### 6.5. Separation of Business Logic and System Integration

Business Logic SHOULD be separated from direct interaction with Scriptable APIs when that separation improves maintainability, testability, or architectural clarity.

System integration includes operations involving Scriptable host APIs, such as:

- `FileManager`
- `Request`
- `Keychain`
- `Location`
- `Calendar`
- `Notification`
- `WebView`

Where appropriate, system-facing operations SHOULD be isolated behind dedicated service modules or adapter functions.

Business Logic SHOULD operate on clearly defined inputs and outputs rather than being unnecessarily coupled to file-system operations, network requests, persistent storage, or user-interface APIs.

This separation MUST NOT introduce unnecessary abstraction layers. Direct use of a Scriptable API is acceptable when the module's primary responsibility is specifically to provide that system integration.

### 6.6. Module Contracts and Interface Stability

Every reusable module MUST maintain a clear and consistent contract with its consumers.

The contract SHOULD document:

- Exported function and object names.
- Function parameters and accepted data structures.
- Return values and their expected structure.
- Synchronous or asynchronous execution behavior.
- Possible errors and failure conditions.
- Side effects and external resource interactions.
- Required dependencies and runtime assumptions.

Changes to a public module contract MUST be reviewed for their impact on dependent modules.

Breaking changes MUST be reflected in all affected consumers and relevant tests.

### 6.7. Module Testing and Verification

Module correctness MUST NOT be established solely by successful importing or the absence of syntax errors.

Verification SHOULD cover:

- Successful module resolution.
- Correct exported values and interfaces.
- Valid input and output behavior.
- Error handling and failure conditions.
- Dependency availability.
- Side effects and state changes.
- Integration with dependent modules.
- Execution within the actual Scriptable Runtime.

Critical modules SHOULD have isolated tests for their business logic and integration tests for their Scriptable-specific dependencies.

All runtime-dependent behavior MUST be verified in the target Scriptable environment rather than inferred from Node.js execution.

### 6.8. Maintainability and Duplication Control

Module boundaries SHOULD support maintainability, reuse, and controlled change.

Engineering requirements:

- Accidental duplication of business logic SHOULD be eliminated.
- Shared behavior SHOULD have a clearly defined owner.
- Modules MUST NOT become general-purpose collections of unrelated utilities.
- Abstractions SHOULD be introduced when they provide a demonstrable benefit.
- Premature abstraction and unnecessary indirection SHOULD be avoided.
- Public interfaces SHOULD remain as small and cohesive as practical.
- Internal implementation details SHOULD NOT be exposed without a functional requirement.

The objective is high cohesion, controlled coupling, explicit contracts, and predictable module behavior.

## 7. Separation Between Scriptable Main Runtime and WebView Runtime

### 7.1. Scriptable Main Runtime

The Scriptable Main Runtime is the primary JavaScript execution context provided by the Scriptable application.

Scriptable uses Apple's JavaScriptCore engine and documents support for ECMAScript 6. Scriptable exposes product-specific host APIs to scripts. Examples include `FileManager`, `Request`, `Keychain`, `Script`, `args`, `WebView`, `Calendar`, `Location`, `Notification`, and `Pasteboard`.

The availability of an API MUST be established through the official Scriptable documentation and verified against the intended execution context and target application version where runtime behavior matters.

The Main Runtime MUST NOT be treated as a browser environment. Developers MUST NOT assume that browser-specific globals or interfaces such as `window`, `document`, `navigator`, `localStorage`, the DOM, or browser rendering and event APIs are available in this context.

JavaScript language features, Scriptable host APIs, and browser APIs MUST be evaluated as separate compatibility categories. The presence of a JavaScript language feature does not establish the availability of a browser API or a Scriptable host API.

### 7.2. WebView Runtime

The WebView Runtime is the JavaScript execution context associated with the web page loaded inside a Scriptable `WebView` instance.

It provides a web-page environment capable of rendering HTML, applying CSS, and executing JavaScript against the page's DOM. Depending on the loaded page and underlying web environment, it may expose browser interfaces such as `window`, `document`, DOM elements and nodes, browser event interfaces, HTML and CSS rendering capabilities, and supported Web platform APIs.

The availability of individual web APIs MUST NOT be assumed solely because code executes inside WebView. Their availability and behavior MUST be verified against the actual web environment and target iOS version when relevant.

Scriptable exposes a native `WebView` API that allows the Main Runtime to control the web-page context. Its documented interface includes:

| API | Purpose |
|---|---|
| `new WebView()` | Creates a WebView instance. |
| `loadHTML()` | Loads HTML content. |
| `loadFile()` | Loads a local file into WebView. |
| `loadURL()` | Loads a URL. |
| `loadRequest()` | Loads a request using its documented request configuration. |
| `evaluateJavaScript()` | Evaluates JavaScript in the current WebView page context. |
| `getHTML()` | Retrieves HTML from the loaded page. |
| `waitForLoad()` | Waits for an active page-loading operation. |
| `present()` | Presents the WebView interface. |

The WebView API MUST be used according to its documented parameters, return values, lifecycle, and asynchronous behavior.

The Main Runtime and WebView Runtime MUST NOT be treated as interchangeable:

- Scriptable host APIs MUST NOT be assumed to exist inside the WebView page context.
- Browser DOM APIs MUST NOT be assumed to exist in the Main Runtime.
- WebView MUST NOT be treated as a replacement for Scriptable APIs such as `FileManager`.
- The availability of a JavaScript feature in one context MUST NOT establish its availability in the other context.

### 7.3. Runtime Identification and Code Placement

Every source file, module, function, and executable code segment MUST have an identifiable execution context.

The project MUST distinguish between Scriptable Main Runtime code, WebView page JavaScript, shared JavaScript code intended to operate in both contexts, and build-time or development-only code that is not executed by Scriptable.

Code placement MUST follow the APIs and capabilities available in the intended runtime. Shared code MUST NOT contain implicit dependencies on browser globals or Scriptable-specific host APIs unless those dependencies are explicitly supplied through a documented interface.

Where shared code requires environment-specific functionality, the environment-dependent operations SHOULD be isolated behind explicit adapters or injected dependencies when that separation improves testability or change isolation.

### 7.4. Runtime Separation and Compatibility

- Developers MUST identify the intended execution context of each runtime-dependent component.
- Main Runtime code MUST NOT depend on browser DOM objects.
- WebView code MUST NOT assume direct access to Scriptable host APIs.
- Runtime-specific APIs MUST be used only in their supported execution context.
- Shared modules MUST define their environmental requirements explicitly.
- Runtime-specific dependencies SHOULD be isolated from reusable business logic.
- Code MUST NOT be considered compatible with both environments merely because it uses JavaScript syntax supported by both.
- Runtime compatibility MUST be verified independently for each intended execution context.

### 7.5. Communication Between Main Runtime and WebView Runtime

Communication between Scriptable Main Runtime and WebView Runtime MUST be explicit.

The `evaluateJavaScript()` interface provides a documented mechanism for evaluating JavaScript in the WebView context and returning its evaluation result through a Promise. When its `useCallback` parameter is enabled, evaluation can wait for the page's `completion` function to be called, and the value supplied to that function is carried by the returned Promise.

- Every cross-context communication operation MUST have a defined direction.
- The sender and receiver MUST have a documented data contract.
- Transferred data MUST be validated before it is consumed.
- Data structures MUST use an explicitly supported transfer representation.
- Data MUST NOT be assumed to preserve unsupported object behavior, methods, or runtime-specific references.
- Cross-context communication MUST handle missing, malformed, unexpected, and incomplete data.
- Error responses MUST be distinguishable from successful results.
- Communication operations SHOULD use a predictable response structure.
- Untrusted values MUST NOT be inserted into executable JavaScript source without appropriate encoding and validation.

A communication contract SHOULD identify the message purpose, sender and receiver, required and optional fields, data types, validation rules, success and error response structures, and timeout or failure-handling behavior where applicable.

### 7.6. Asynchronous Execution and Loading Lifecycle

WebView operations MUST be designed around their documented asynchronous behavior. Developers MUST account for page-loading completion, JavaScript evaluation completion, Promise resolution and rejection, WebView presentation and dismissal, navigation and page replacement, resource-loading failures, invalid or unavailable page content, and operations that depend on a particular loading state.

The documented behavior of individual methods MUST be respected. For example:

- `loadURL()` returns a Promise associated with completion of the page load.
- `evaluateJavaScript()` returns a Promise carrying the evaluation result.
- `present()` returns a Promise associated with dismissal of the presented WebView.
- `waitForLoad()` waits for an active loading operation and may remain pending if the WebView is not loading or about to load another page.
- The documented `waitForLoad()` failure result MUST be handled according to its API contract. Implementations MUST NOT assume that every WebView operation reports errors through identical Promise semantics.

Loading, evaluation, and presentation errors MUST be handled according to the specific API contract.

### 7.7. Runtime Testing and Verification

The Main Runtime and WebView Runtime MUST be tested independently. Testing SHOULD cover Scriptable host API availability, browser API availability within WebView, runtime-specific JavaScript behavior, WebView loading and navigation, JavaScript evaluation results, cross-context data transfer, data validation, asynchronous completion, error handling, and integration between both contexts.

A successful test in a browser MUST NOT establish compatibility with Scriptable Main Runtime. Likewise, a successful Main Runtime test MUST NOT establish compatibility with the WebView page environment.

Critical runtime-dependent functionality MUST be verified within the actual Scriptable application and the intended execution context.

## 8. TypeScript and Scriptable Definitions

### 8.1. Role of TypeScript

TypeScript is a development-time programming language and static type-checking tool built on JavaScript. It provides static type checking, type declarations, interface definitions, editor assistance, refactoring support, compiler diagnostics, and JavaScript code generation.

TypeScript is NOT a native Scriptable runtime environment. Scriptable executes JavaScript. TypeScript source files MUST be checked and, when necessary, transformed into JavaScript before execution.

TypeScript declarations and compiler diagnostics MUST NOT be interpreted as proof that an API exists or is supported at runtime.

### 8.2. Scriptable Type Definitions and Supporting References

A project MAY use community-maintained Scriptable TypeScript definitions and generation projects, including `@types/scriptable-ios`, DefinitelyTyped, `schl3ck/ios-scriptable-types`, and other relevant type-definition or documentation-generation projects.

These resources MUST be treated as unofficial supporting references unless Scriptable explicitly establishes an official distribution or maintenance status. The official Scriptable documentation MUST remain the primary reference for Scriptable API behavior and availability.

The existence of a declaration in a third-party definition package MUST NOT establish that the corresponding API is currently available, correctly described, or supported by the installed Scriptable version.

### 8.3. Type Definition Verification and Classification

Scriptable-related type definitions MUST be compared against the official documentation and, where necessary, verified through runtime testing.

| Classification | Meaning |
|---|---|
| Correct | The definition agrees with the verified API behavior and documented contract. |
| Missing | A documented or verified API member is absent from the definition. |
| Excess | A declared member has no sufficient evidence of availability in the target Scriptable environment. |
| Conflicting | The declaration contradicts the official documentation or verified runtime behavior. |
| Not Verified | Available evidence is insufficient to establish correctness. |

The review MUST consider relevant declaration elements, including global variables, functions, objects, classes, constructors, properties, methods, function parameters, return types, optional parameters, nullable values, callback signatures, Promise behavior, enumerations, literal values, and other supported JavaScript values.

Definitions MUST preserve the distinction between a Function, an Object, a Class, a primitive value, and another supported JavaScript value.

A declaration MUST NOT be accepted merely because it passes the TypeScript compiler. When a discrepancy is identified, the project MUST record the affected symbol, conflicting declaration, authoritative documentation, verification result, and required corrective action.

### 8.4. TypeScript Compiler Configuration

TypeScript compiler configuration MUST reflect the actual target execution environment. The project MUST distinguish the responsibilities of the following options:

| Option | Responsibility |
|---|---|
| `target` | Controls the JavaScript language syntax level emitted by the compiler and influences the default library declarations. |
| `lib` | Selects built-in library declaration files used by the type checker. |
| `types` | Controls which visible `@types` packages are included in the global scope. |
| `typeRoots` | Specifies the directories in which TypeScript searches for type packages. |
| `module` | Controls the module code-generation format. |
| `moduleResolution` | Controls how TypeScript resolves module references during development and type checking. |

The configuration MUST be designed for the intended Scriptable execution context.

#### 8.4.1. Target Compatibility

The `target` option MUST be selected according to the JavaScript syntax supported by the intended Scriptable runtime. Scriptable's official documentation identifies ECMAScript 6 as its documented JavaScript baseline.

A compiler target such as `ES2015` MAY be used as a conservative starting point, but it MUST NOT be treated as proof that every JavaScript API introduced in that specification or later specifications is available in the installed runtime.

Transpilation changes syntax where required. It does not automatically provide missing runtime APIs or polyfills.

#### 8.4.2. Library Definitions

The `lib` option MUST represent the built-in language and environment declarations appropriate to the target runtime.

DOM declarations MUST NOT be included in Main Runtime type checking unless the code is explicitly intended to execute in a browser-like environment. A separate TypeScript configuration SHOULD be used for WebView code when its browser API requirements differ from those of Scriptable Main Runtime.

This separation prevents browser-specific declarations from incorrectly permitting Main Runtime code to reference unavailable globals such as `document` and `window`.

#### 8.4.3. Type Package Inclusion

The `types` and `typeRoots` options MUST be configured deliberately. The project MUST avoid unintentionally importing unrelated global declarations that could distort the apparent capabilities of the target runtime.

Scriptable declarations SHOULD be included explicitly in the relevant TypeScript project configuration. The configuration MUST NOT allow definitions intended for Node.js or browser environments to silently expand the apparent Scriptable Main Runtime API surface.

#### 8.4.4. Module Output Compatibility

TypeScript module settings MUST be selected according to the actual module-loading mechanism used by Scriptable.

A successful TypeScript module resolution or compilation does NOT establish that the resulting module format can be loaded by Scriptable. The generated JavaScript MUST NOT depend on undocumented runtime module loaders or automatically assume support for Node.js `require()`, Node.js module resolution, automatic `node_modules` loading, browser-native ECMAScript module loading, or runtime module formats that Scriptable does not document.

Where Scriptable's `importModule()` and `module.exports` mechanism is used, the generated output MUST be compatible with that mechanism or be transformed into a verified compatible form. Bundled output MUST also be checked for runtime dependencies introduced by the bundler or compiler.

### 8.5. TypeScript Declaration, JavaScript Output, and Runtime API

The project MUST distinguish between three separate technical layers.

**TypeScript Declaration**

A declaration describes the expected structure, properties, methods, parameters, and return types of a value for static analysis and editor tooling. It does not create the declared runtime functionality.

**JavaScript Output**

JavaScript output is the code generated from TypeScript source files through compilation or a build process. The generated code is the executable artifact intended for the target JavaScript environment.

**Runtime API**

A Runtime API is an actual function, object, class, property, or capability exposed by the execution environment. Its availability and behavior depend on the actual runtime and its host APIs.

The following principles MUST be enforced:

- A TypeScript declaration MUST NOT be treated as a runtime implementation.
- A successful type check MUST NOT establish runtime API availability.
- Generated JavaScript MUST NOT be assumed compatible solely because compilation succeeded.
- Runtime API compatibility MUST be verified independently.
- Missing runtime functionality MUST NOT be hidden by adding declarations.
- Unsupported runtime APIs MUST NOT be treated as supported merely because a type package declares them.

### 8.6. TypeScript Development and Build Lifecycle

When TypeScript is used, the project MUST follow a defined development and build lifecycle:

1. **Source Authoring:** Write and maintain the TypeScript source files, type declarations, interfaces, and relevant project configuration.
2. **Static Type Checking:** Run the TypeScript compiler or an appropriate type-checking process and review relevant diagnostics.
3. **Compilation and Build:** Transpile or build TypeScript source into JavaScript when required.
4. **Output Inspection:** Inspect the generated JavaScript for unsupported syntax, unexpected runtime dependencies, incompatible module output, and incorrect build transformations.
5. **Scriptable Compatibility Verification:** Verify that the generated output is compatible with the actual Scriptable execution environment, including its module-loading mechanism and documented APIs.
6. **Application Execution:** Execute the generated JavaScript within the Scriptable application and the intended runtime context.
7. **Runtime Testing:** Test relevant functionality, including API availability, data handling, asynchronous behavior, error handling, and integration with other modules.
8. **Evidence Recording:** Record the compiler configuration, relevant build results, test outcomes, detected discrepancies, and runtime verification evidence.

A successful compilation MUST NOT be considered a substitute for executing and testing the generated JavaScript in Scriptable.

### 8.7. Type Definition Maintenance and Traceability

Type definitions MUST be traceable to their source and verification evidence. For each important declaration, the project SHOULD record the declared symbol, definition package and version, source repository, relevant official Scriptable documentation, verification classification, known discrepancies, last verification date, and runtime verification status.

When Scriptable documentation or the application changes, affected declarations SHOULD be reviewed. Third-party definition updates MUST be assessed before adoption, especially when they introduce APIs, alter function signatures, change optional parameters, or modify return types.

Type definitions MUST NOT silently override verified project-specific compatibility findings.

## 9. Libraries and Dependencies

### 9.1 Default Policy

External libraries MUST be prohibited by default.

Any new library requires review before approval.

### 9.2 Review Criteria

The following MUST be examined:

- Source and trustworthiness.
- License.
- Version.
- Direct and indirect dependencies.
- Compatibility with Scriptable.
- Dependencies on Node.js, the DOM, or Browser APIs.
- Module system used.
- Performance and memory consumption.
- Security risks.
- Maintainability and updateability.

### 9.3 Acceptance Requirement

Successful installation, compilation, or static analysis does not establish library compatibility with the Runtime.

A library MUST NOT be approved until its compatibility has been established in the target context, or it has been documented as Not Verified and operational reliance on it is prohibited.

## 10. Project Architecture and Organization

### 10.1 Principles

MUST adopt a clear structure that is maintainable and testable.

MUST separate responsibilities, prevent duplication, and minimize coupling and circular dependencies.

### 10.2 Architectural Layers

| Layer | Responsibility |
|---|---|
| Core | Configuration, constants, errors, and logging |
| Services | Networking, storage, authentication, and external services |
| Data | Validation, transformation, contracts, and schemas |
| Features | Business logic and user-facing functions |
| UI | Lists, tables, interfaces, and widgets |
| Scriptable APIs | Integration with Scriptable APIs |
| Tests | Logic, contract, and Runtime tests |

This is a reference architectural division, not a fixed structure that is mandatory for every small project.

### 10.3 Module Contracts

Every public module MUST specify:

- Its responsibility.
- Its inputs.
- Its outputs.
- Potential errors.
- Its dependencies.
- The interfaces it exposes to other modules.

## 11. Data Quality and Error Handling

### 11.1 Data

All data originating from the network, files, the user, or the execution context are treated as requiring validation.

MUST:

- Validate the expected structure.
- Validate required values.
- Handle missing values explicitly.
- Distinguish between null and undefined.
- Validate types and ranges.
- MUST NOT consider successful loading as evidence that the data is valid.

### 11.2 Errors

MUST:

- Handle expected errors using try/catch.
- Handle Promise rejections.
- Record useful diagnostic information.
- MUST NOT silently suppress errors.
- Establish a retry policy.
- Prevent the repetition of operations that may produce duplicate data or transactions without appropriate protection.

The system state MUST remain clear when a failure occurs, and a failure MUST NOT be converted into a false success result.

## 12. Security, Privacy, and Reliability

### 12.1 Secrets

MUST store passwords, tokens, and sensitive keys in Keychain when appropriate.

MUST NOT embed secrets in JavaScript files or print them in logs.

### 12.2 Networking

MUST:

- Use HTTPS.
- Validate responses.
- Set appropriate timeouts.
- Handle connection interruptions.
- Preserve HTTPS certificate validation.

MUST NOT disable certificate validation without a specific, documented justification.

### 12.3 Files

MUST validate paths and destinations before sensitive operations.

MUST account for iCloud behavior and the possibility that a file may need to be downloaded before it can be read.

MUST retain backups when needed, particularly before deletion, moving, or replacement operations.

### 12.4 Privacy

The minimum permissions necessary to access location, photos, contacts, and calendars MUST be requested.

Permission denial MUST be handled explicitly, without assuming that the operation succeeded.

### 12.5 External Code

MUST NOT execute untrusted external code using eval or any unsafe dynamic execution method.

## 13. Performance and Resource Management

MUST:

- Minimize repeated read and write operations.
- Avoid loading large files and images unnecessarily.
- Set network timeouts.
- Account for memory constraints in Widgets.
- Avoid heavy operations in short-lived contexts.
- Use caching when appropriate.
- MUST NOT assume that a Widget will refresh immediately after a refresh request.

Performance MUST be evaluated according to the actual context, not solely according to script execution within the application.

## 14. Target Execution Contexts

Execution constraints vary depending on the context.

The contexts that the project MAY include, as needed, are:

- Direct execution within Scriptable.
- Widget.
- Shortcuts and Siri.
- Share Sheet.
- URL Scheme.
- WebView.

These contexts do not mean that the device scope is expanded; all target testing remains limited to iPhone.

MUST test each required context independently.

MUST NOT consider successful script execution within the application as evidence of successful execution in Widget, Shortcuts, Share Sheet, or WebView.

## 15. Testing and Compatibility Verification

### 15.1 Testing Layers

Separate verification layers MUST be adopted:

1. Syntax: Syntax correctness.
2. Static Analysis: Code analysis and issue detection.
3. Type Checking: Type checking.
4. Unit Testing: Testing module logic.
5. Integration Testing: Testing the integration of services and APIs.
6. API Compatibility: Verifying Scriptable APIs.
7. Runtime Verification: Actual execution within Scriptable.
8. Context Verification: Testing the intended execution context.
9. Security Testing: Security and risk assessment.

### 15.2 Tool Limitations

- ESLint does not establish the existence of a Scriptable API.
- TypeScript does not create Runtime APIs.
- Test262 does not test Scriptable APIs.
- Successful execution in Node.js does not establish Scriptable compatibility.
- A successful build does not establish successful execution on iPhone.
- Successful static analysis does not replace actual application testing.

### 15.3 Analysis Tools

The following tools MAY be used:

- TypeScript Compiler.
- ESLint.
- Prettier.
- Test262.
- Fallow.
- Actual Scriptable tests on the device.

The tool MUST be selected according to the type of verification required, and it MUST NOT be given authority to establish anything it does not test.

### 15.4 Compatibility Matrix

Every test MUST record:

- API or feature name.
- Scriptable version.
- iOS version.
- iPhone model.
- Execution context.
- Test result.
- Test date.
- Documentation URL.
- Actual evidence.
- Notes and restrictions.

### 15.5 Compatibility Statuses

The following statuses MUST be distinguished:

- Documented.
- Tested.
- Compatible.
- Incompatible.
- Not Verified.

The phrase “fully compatible” MUST NOT be used without specifying the scope and providing evidence of the required tests.

### 15.6 JavaScript Feature Verification

When approving a new feature:

1. Identify the feature and its standard.
2. Identify the ECMAScript version in which it was introduced.
3. Verify the available evidence for the engine.
4. Write an independent test.
5. Run the test within Scriptable on the target iPhone.
6. Record the result, versions, and date.

A test result establishes behavior only in the environment in which the test was executed.

## 16. Governance and Normative Rules

### 16.1 Order of Authorities

The following hierarchy MUST be adopted:

1. The project’s approved constitution and specifications.
2. The policies, procedures, and standards subordinate to them.
3. Official Scriptable documentation when determining application APIs.
4. Apple JavaScriptCore documentation when determining engine behavior.
5. ECMAScript when determining language rules.
6. TypeScript documentation when determining development-tool behavior.
7. Community definitions, repositories, and examples as supporting references.
8. Actual testing to establish behavior in the target runtime environment.

A source of lower authority MUST NOT override a higher-level rule.

### 16.2 Normative Language

The following terms are used:

- MUST: Mandatory.
- MUST NOT: Prohibited.
- SHOULD: Recommended.
- SHOULD NOT: Not recommended.
- MAY: Optional or permitted.

### 16.3 Enforcement Levels

- BLOCK: Prevents the change from being approved or merged.
- WARN: Allows work to continue while the warning is recorded.
- GUIDE: Non-blocking engineering guidance.

### 16.4 Rule Definition

Every normative rule MUST include:

- A stable identifier.
- Name.
- Normative text.
- Scope.
- Rationale.
- Reference source.
- Verification method.
- Enforcement level.
- Exception conditions.

MUST NOT reuse identifiers of retired rules.

## 17. Exceptions, Risks, and Violations

### 17.1 Exception

An exception is not a means of bypassing rules without documentation.

An exception MUST include:

- The rule being exempted.
- Reason for the exception.
- Its scope.
- Risks.
- Alternative controls.
- Start and end dates.
- The person responsible for approving it.

An open-ended exception MUST NOT be allowed.

### 17.2 Exception Lifecycle

Proposed → Reviewed → Approved → Active → Expired / Revoked

### 17.3 Risk Assessment

The following MUST be assessed:

- Probability of failure.
- Severity of impact.
- Difficulty of detecting the failure.

### 17.4 Violation Lifecycle

Detected → Classified → Assigned → Remediated / Exception Requested → Verified → Closed

Violations, evidence, and corrective actions MUST be recorded. A violation MUST NOT be closed before the remediation has been verified.

## 18. GitHub, CI, and Change Management

### 18.1 Automated Checks

GitHub Actions are used to run checks appropriate to the project.

Depending on the project scope, the checks MUST include:

- Syntax.
- Static Analysis.
- Type Checking.
- Dependency checks.
- Secret and security checks.
- Governance rule checks.
- Logic and contract tests.

### 18.2 Main Branch Protection

The main branch MUST be protected, and Pull Requests and required checks MUST be adopted before merging.

Merging MUST NOT be allowed when a mandatory check fails.

A failure or outage of the checking tool does not mean that the check has passed; its status MUST be recorded as BLOCKED or INDETERMINATE, depending on the reason.

### 18.3 Normative Change Management

Any amendment to the specifications goes through the following stages:

1. Propose the change.
2. Analyze the impact.
3. Review.
4. Approve.
5. Update the version.
6. Preserve the decision record and evidence.

### 18.4 Versions

The project adopts Semantic Versioning:

- Major: A breaking change or a substantial normative restructuring.
- Minor: A compatible addition of new rules or requirements.
- Patch: A correction that does not change the fundamental normative meaning.

The history of versions, decisions, and previous evidence MUST be retained.

## 19. Governance Documentation Organization

Documents are divided into the following layers:

1. Constitution.
2. Policies.
3. Standards and Procedures.
4. Registers.
5. References.

The following MUST be observed:

- Separate human-readable documents from structured data.
- Define a central source for each piece of information.
- Link rules to implementation, checks, evidence, and exceptions.
- Preserve the record of decisions and changes.
- MUST NOT add a mandatory CI check without a clear governance reference.
- MUST preserve old and conflicting evidence; MUST NOT delete it merely because newer evidence has appeared.

English is used for normative terms, rule names, and technical field names.

## 20. Compatibility Review and Governance Continuity

Reverification MUST be performed whenever a material change occurs in any of the following:

- Scriptable version.
- iOS version.
- JavaScriptCore.
- The adopted ECMAScript standard.
- Scriptable APIs.
- Execution contexts.
- Libraries and dependencies.
- Analysis and build tools.
- Architecture.
- Security threat model.

Any discrepancy between documentation, implementation, and tests MUST be recorded as a matter requiring investigation. It MUST NOT be concealed or assumed to have no impact.

## 21. Approved Reference Sources

### Level One: Official Scriptable Documentation

https://docs.scriptable.app/

The primary source for application APIs, their behavior, properties, parameters, and return values.

Important references:

- JavaScript Environment.
- importModule.
- WebView.
- FileManager.
- Request.
- Keychain.
- ListWidget.
- args.
- Script.
- Calendar.
- Location.

### Level Two: Apple JavaScriptCore

https://developer.apple.com/documentation/javascriptcore

A reference for understanding the JavaScriptCore engine and its components, not evidence that Native iOS APIs are directly available within Scriptable.

### Level Three: ECMAScript

https://tc39.es/ecma262/

A reference for language rules and behavior, not a reference for Scriptable APIs.

### Level Four: TypeScript

https://www.typescriptlang.org/docs/

https://www.typescriptlang.org/tsconfig/

**Community Definitions**

https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/scriptable-ios

Used as a development aid after being reviewed against the official documentation.

**Test262**

https://github.com/tc39/test262

ECMAScript conformance tests; they do not replace testing of Scriptable APIs.

## 22. Central Governing Rule

An API, feature, or library MUST NOT be approved solely because it appears in an example or TypeScript definition, or because it works in Node.js or a web browser.

Four independent matters MUST be established:

1. Language Compatibility: Compatibility of JavaScript syntax and standard features with the engine.
2. Host API Compatibility: The existence of the API in Scriptable documentation and the correctness of its use.
3. Context Compatibility: Its operation in the intended execution context.
4. Device Verification: Successful testing on the target iPhone and the targeted Scriptable and iOS versions.

Any point for which sufficient evidence is unavailable MUST be recorded as Not Verified. It MUST NOT be converted into an approved fact through assumption.

## 23. Conditions for Approving the Specifications

This document does not become the final approved reference until the following conditions have been met:

1. Review the completeness of the integration of decisions Q1–Q75.
2. Review the completeness of the integration of the technical rules and standards.
3. Verify that no unresolved conflicts remain.
4. Verify that the device scope remains iPhone only.
5. Verify that the responsibility model remains one person.
6. Review the testing, compatibility, and security rules.
7. Explicitly approve the final version.

**End of the Unified Specifications.**

---

## 24. Complete Reference List

This section is a reference addition to the specifications. It contains the complete URLs of the technical sources that have been identified. URL addresses MUST remain visible exactly as they are and MUST NOT be replaced by reference names alone or hidden behind clickable text.

### 24.1 Scriptable Official Documentation

Main official documentation:

https://docs.scriptable.app/

Official WebView reference:

https://docs.scriptable.app/webview/

Referenced WebView sections:

https://docs.scriptable.app/webview/#shouldallowrequest

https://docs.scriptable.app/webview/#-new-webview

https://docs.scriptable.app/webview/#-loadhtml

https://docs.scriptable.app/webview/#-loadfile

https://docs.scriptable.app/webview/#-loadurl

https://docs.scriptable.app/webview/#-loadurl-1

https://docs.scriptable.app/webview/#-loadrequest

https://docs.scriptable.app/webview/#-loadhtml-1

https://docs.scriptable.app/webview/#-loadfile-1

https://docs.scriptable.app/webview/#-evaluatejavascript

https://docs.scriptable.app/webview/#-gethtml

https://docs.scriptable.app/webview/#-present

https://docs.scriptable.app/webview/#-waitforload

**Note:** The validity of the internal section identifiers ending in -1 has not been verified as standalone URLs. If they cannot be accessed, the main WebView reference and its internal index MUST be used.

### 24.2 Apple JavaScriptCore Documentation

Main reference:

https://developer.apple.com/documentation/javascriptcore

Subreferences:

https://developer.apple.com/documentation/javascriptcore/jscontext

https://developer.apple.com/documentation/javascriptcore/jsexport

https://developer.apple.com/documentation/javascriptcore/jsmanagedvalue

https://developer.apple.com/documentation/javascriptcore/jsvalue

https://developer.apple.com/documentation/javascriptcore/jsvirtualmachine

### 24.3 Apple WebKit Documentation

WKWebView:

https://developer.apple.com/documentation/webkit/wkwebview

This reference is for understanding Apple’s WKWebView technology. It does not establish that all of its properties are directly available in Scriptable.

### 24.4 DefinitelyTyped: Scriptable iOS

Main definitions directory:

https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/scriptable-ios

Main definition file:

https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/scriptable-ios/index.d.ts

Test file:

https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/scriptable-ios/scriptable-ios-tests.ts

### 24.5 npm: Scriptable iOS Type Definitions

Package page:

https://www.npmjs.com/package/@types/scriptable-ios

Package information is used to verify the published version and its metadata, without treating it as a replacement for the official documentation.

### 24.6 ios-scriptable-types

Main repository:

https://github.com/schl3ck/ios-scriptable-types

Files and references:

https://github.com/schl3ck/ios-scriptable-types/blob/master/README.md

https://github.com/schl3ck/ios-scriptable-types/blob/master/buildFromDocs.js

https://github.com/schl3ck/ios-scriptable-types/blob/master/buildFromTernDefinition.js

https://github.com/schl3ck/ios-scriptable-types/blob/master/template.d.ts

https://github.com/schl3ck/ios-scriptable-types/blob/master/globals.js

https://github.com/schl3ck/ios-scriptable-types/blob/master/package.json

https://github.com/schl3ck/ios-scriptable-types/tree/master/example

https://github.com/schl3ck/ios-scriptable-types/tree/master/dist

https://github.com/schl3ck/ios-scriptable-types/blob/master/LICENSE

**Warning:** This generated project is not the same as the DefinitelyTyped package. The version, license, and source of the files MUST be verified before relying on any of them.

### 24.7 TypeScript Official Documentation

Official documentation:

https://www.typescriptlang.org/docs/

Compiler options:

https://www.typescriptlang.org/tsconfig/

Specific compiler options relevant to runtime compatibility:

https://www.typescriptlang.org/tsconfig/target

https://www.typescriptlang.org/tsconfig/lib

### 24.8 ECMAScript Official Specification

Official specification:

https://tc39.es/ecma262/

Completed specifications and proposals:

https://github.com/tc39/proposals

ECMAScript development process:

https://tc39.es/process-document/

Edition snapshots used to identify when features entered the standard:

ECMAScript 2015 (6th Edition):

https://262.ecma-international.org/6.0/

ECMAScript 2016 (7th Edition):

https://262.ecma-international.org/7.0/

ECMAScript 2017 (8th Edition):

https://262.ecma-international.org/8.0/

ECMAScript 2019 (10th Edition):

https://262.ecma-international.org/10.0/

ECMAScript 2020 (11th Edition):

https://262.ecma-international.org/11.0/

ECMAScript 2022 (13th Edition):

https://262.ecma-international.org/13.0/

ECMAScript 2023 (14th Edition):

https://262.ecma-international.org/14.0/

### 24.9 Test262

Official ECMAScript test repository:

https://github.com/tc39/test262

It is used to test JavaScript behavior for conformance with the specification, and does not establish compatibility with Scriptable APIs.

### 24.10 JavaScript Style and Software Engineering Research

ESLint rule for preferring const and let over var:

https://eslint.org/docs/latest/rules/no-var

ESLint rule for preferring strict equality comparisons:

https://eslint.org/docs/latest/rules/eqeqeq

Empirical research on identifier naming and code readability. These papers provide supporting context for maintainability practices; they do not define ECMAScript requirements or prove that a single style rule guarantees quality:

Gresta, Durelli, and Cirilo (2023), Naming Practices in Object-oriented Programming: An Empirical Study:

https://doi.org/10.5753/jserd.2023.2582

Kim et al. (2025), How Are We Detecting Inconsistent Method Names? An Empirical Study from Code Review Perspective:

https://dl.acm.org/doi/10.1145/3711901

Sedano (2016), Code Readability Testing, an Empirical Study:

https://doi.org/10.1109/cseet.2016.36

### 24.11 Scriptable Official API References

The following official Scriptable API pages support the API-family examples and version/context qualifications in Section 5. The main documentation index remains the primary entry point:

https://docs.scriptable.app/

Execution and invocation:

https://docs.scriptable.app/args/

https://docs.scriptable.app/config/

https://docs.scriptable.app/script/

Files, data, and credentials:

https://docs.scriptable.app/filemanager/

https://docs.scriptable.app/data/

https://docs.scriptable.app/keychain/

Networking:

https://docs.scriptable.app/request/

Device, location, photos, and contacts:

https://docs.scriptable.app/device/

https://docs.scriptable.app/location/

https://docs.scriptable.app/photos/

https://docs.scriptable.app/contact/

https://docs.scriptable.app/contactscontainer/

https://docs.scriptable.app/contactsgroup/

Calendars and reminders:

https://docs.scriptable.app/calendar/

https://docs.scriptable.app/calendarevent/

https://docs.scriptable.app/reminder/

https://docs.scriptable.app/recurrencerule/

User interfaces:

https://docs.scriptable.app/alert/

https://docs.scriptable.app/datepicker/

https://docs.scriptable.app/textfield/

https://docs.scriptable.app/uitable/

Web and widgets:

https://docs.scriptable.app/webview/

https://docs.scriptable.app/safari/

https://docs.scriptable.app/listwidget/

https://docs.scriptable.app/widgetstack/

Drawing, date formatting, speech, mail, and parsing:

https://docs.scriptable.app/drawcontext/

https://docs.scriptable.app/path/

https://docs.scriptable.app/image/

https://docs.scriptable.app/color/

https://docs.scriptable.app/font/

https://docs.scriptable.app/dateformatter/

https://docs.scriptable.app/speech/

https://docs.scriptable.app/mail/

https://docs.scriptable.app/xmlparser/

## 25. Rules for Using the Reference List

1. MUST display the complete URL in project documentation, beginning with https:// when the link is securely available over HTTPS.
2. MUST NOT replace a URL with an abbreviated name or a hidden link.
3. MUST consult the Scriptable Official Documentation first when examining application APIs.
4. MUST consult Apple JavaScriptCore to understand the engine, without confusing its APIs with Scriptable APIs.
5. MUST consult ECMAScript to determine language rules.
6. MUST consult TypeScript Official Documentation to determine the behavior of type-checking and transpilation tools.
7. MUST treat DefinitelyTyped definitions and generation projects as supporting references, not as official sources for Runtime APIs.
8. MUST record the specific source on which each rule or compatibility result is based.
9. MUST NOT consider the presence of a URL in this list as evidence that its content establishes a particular form of support.
10. MUST reverify URLs and their content when updating the specifications or conducting a compatibility review.

**End of the additional reference list.**
