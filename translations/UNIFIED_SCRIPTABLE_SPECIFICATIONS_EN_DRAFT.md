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
- Under this project's flat `src/` convention, every Scriptable application module MUST be a JavaScript file located directly inside `src/` and MUST be imported by its file name or file path.
- Application modules MUST NOT use nested directories or directory-based `index.js` imports within `src/`.
- Scriptable's documented directory-import behavior is a runtime capability, not a project layout requirement. It MUST NOT be interpreted as a reason to create subdirectories within `src/`.
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

All JavaScript application files that Scriptable executes or imports, including standalone WebView page scripts maintained as JavaScript files, MUST be placed directly inside the flat `src/` directory defined in Section 10.3. Development-only or build-only code that is not executed or imported by Scriptable MUST remain outside `src/`.

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

External libraries MUST be prohibited by default. The project SHOULD prefer JavaScript language features and documented Scriptable APIs already available in the target environment when they provide an adequate solution.

Any proposed external library MUST be reviewed before approval. A library MUST NOT be introduced solely because it is popular, available through npm, used by another JavaScript runtime, or present in an example or tutorial.

The default prohibition is a project governance rule. It does not mean that every external library is technically incompatible with Scriptable. An exception MAY be approved only when the dependency has a documented purpose, its risks have been evaluated, and its compatibility has been established for the intended execution context.

### 9.2 Dependency Classification

Every proposed dependency MUST be classified according to where and when it is used:

- **Scriptable runtime dependency:** JavaScript code imported or executed by Scriptable.
- **WebView dependency:** Code that executes within a WebView page and relies on web-platform facilities.
- **Development dependency:** A tool used to inspect, lint, type-check, test, or maintain source code.
- **Build dependency:** A tool used to transform, bundle, generate, or package deliverables.
- **External service dependency:** A remote API, hosted service, or other externally operated capability required by the project.

A dependency's classification MUST identify its execution environment. A development-time or build-time dependency MUST NOT be represented as a Scriptable runtime dependency unless its generated or distributed output is actually required at runtime.

### 9.3 Review Criteria

Before approval, the following MUST be examined and recorded where applicable:

1. **Purpose and necessity:** the specific requirement addressed and why existing language features or documented Scriptable APIs are insufficient or unsuitable.
2. **Source and provenance:** the official project or distribution source, repository identity, package identity, and whether the obtained artifact can be traced to that source.
3. **License:** the applicable license, redistribution conditions, attribution requirements, and restrictions relevant to the project.
4. **Version and maintenance:** the exact version or immutable revision, release history, maintenance status, known deprecations, and update policy.
5. **Dependency graph:** direct and indirect dependencies, transitive packages, optional dependencies, and packages that introduce additional runtime requirements.
6. **Runtime compatibility:** compatibility with Scriptable, the JavaScript behavior relied upon, the intended Main Runtime or WebView context, and the actual module-loading mechanism.
7. **Platform assumptions:** dependencies on Node.js, browser globals, DOM APIs, native bindings, operating-system services, or APIs unavailable in the intended context.
8. **Module format:** CommonJS, ECMAScript modules, UMD, standalone browser scripts, or another format, and whether the format can be consumed through the project's approved Scriptable loading or build process.
9. **Security and integrity:** known vulnerabilities, source integrity, dynamic code loading, network behavior, permissions, and risks introduced by executing third-party code.
10. **Performance and resources:** package size, initialization work, memory use, execution time, network use, and impact on widgets or other constrained contexts.
11. **Maintainability:** documentation quality, issue history, replacement options, removal cost, and the ability to maintain the dependency if upstream development stops.
12. **Scope of use:** the modules, features, and runtime contexts that will depend on it.

A review MUST distinguish verified facts from assumptions and unresolved compatibility questions. Missing evidence MUST NOT be converted into a positive compatibility claim.

### 9.4 Scriptable Compatibility Requirements

The availability of a package in the npm registry, its successful installation, or its successful execution in Node.js or a browser MUST NOT be treated as proof of Scriptable compatibility.

Compatibility review MUST consider:

- JavaScript syntax and built-ins required by the dependency.
- Scriptable host APIs required by the dependency, if any.
- Browser globals and DOM APIs required by the dependency.
- Node.js globals, built-in modules, and native bindings required by the dependency.
- Module format, import behavior, and dependency resolution.
- File-system, network, storage, cryptographic, and permission assumptions.
- Initialization behavior and side effects.
- The actual execution context in which the dependency will run.

Scriptable's documented `importModule()` and `module.exports` mechanism MUST NOT be assumed to implement the complete Node.js module system, automatic `node_modules` resolution, or arbitrary npm package loading. The project's module requirements are governed by Section 6.

A library that requires browser facilities MUST be confined to a suitable WebView implementation. A library that requires Node.js-specific facilities MUST NOT be used in Scriptable Main Runtime unless the required functionality is independently established through a documented and tested implementation. Bundling or transpilation MAY transform source code, but MUST NOT be treated as proof that unavailable runtime APIs have been supplied.

### 9.5 Versioning, Reproducibility, and Distribution

Every approved dependency MUST have an identifiable version or immutable source revision. Floating references that can silently change dependency content SHOULD NOT be used for maintained deliverables.

For npm-managed development or build dependencies, the project SHOULD retain and review the relevant package manifest and lockfile. A lockfile records the resolved package tree for the package manager; it does not define Scriptable's `importModule()` behavior and does not establish runtime compatibility.

When third-party source is copied, vendored, bundled, or otherwise included in a Scriptable deliverable, the project SHOULD retain its source identity, version or revision, license, integrity information where available, and any required attribution. Generated output MUST be traceable to its source and build process when that traceability is necessary to maintain or audit it.

The delivered Scriptable code MUST NOT rely on development-only packages, build tools, or package-manager behavior being present on the user's device unless that runtime dependency is explicitly supported and documented.

### 9.6 Dependency Isolation and Public Interfaces

An approved dependency SHOULD be accessed through a narrow, explicit interface that limits how much of the project relies on its implementation details.

Where practical:

- Keep third-party-specific calls within the module or adapter responsible for that integration.
- Expose only the operations required by consuming project modules.
- Avoid spreading dependency-specific types, names, and assumptions throughout unrelated business logic.
- Avoid undocumented global state and unexpected import-time side effects.
- Document initialization order when a dependency requires initialization.
- Avoid circular dependencies between project modules and dependency adapters.
- Keep replacement or removal feasible without rewriting unrelated features.

These requirements MUST remain proportionate to the dependency's scope. The project MUST NOT add abstraction layers that provide no meaningful isolation, testability, or maintenance benefit.

### 9.7 Security, Updates, and Removal

Approved dependencies MUST be reconsidered when a relevant security advisory, incompatible release, license change, upstream archival, or significant change in maintenance status is identified.

Dependency updates MUST be reviewed for changes to the dependency graph, runtime requirements, module format, public interfaces, and behavior relied upon by the project. An update MUST NOT be accepted solely because it is the latest available version.

A dependency MUST be removed when it is no longer required, cannot satisfy the project's compatibility requirements, introduces unacceptable risk, or can no longer be maintained under the project's governance rules.

The project SHOULD maintain a dependency record containing, at minimum, the dependency name, purpose, source, version or revision, license, classification, intended runtime, compatibility evidence, known direct or transitive dependencies, review date, and approval status.

### 9.8 Acceptance Requirement

A dependency MUST NOT be approved for operational use until its source, license, version, dependency graph, relevant risks, and intended execution context have been reviewed.

Runtime dependencies MUST have compatibility evidence for the intended Scriptable context. A dependency whose compatibility remains `Not Verified` MUST NOT be relied upon by operational functionality. It MAY be retained for isolated investigation or testing only when that status and restriction are explicit.

Successful installation, compilation, bundling, type checking, linting, or static analysis does not establish library compatibility with the Scriptable Runtime. Required verification layers are governed by Sections 5, 6, 14, and 15.

## 10. Project Architecture and Organization

### 10.1 Architectural Principles

The project MUST adopt a clear structure that is maintainable, testable, and proportionate to its size and complexity.

The architecture MUST:

- Separate responsibilities according to cohesive areas of behavior.
- Define explicit module boundaries and public interfaces.
- Minimize unnecessary coupling and circular dependencies.
- Make dependency direction and initialization requirements understandable.
- Keep data ownership and state changes identifiable.
- Separate business rules from presentation and system access where that separation provides a meaningful benefit.
- Preserve the distinctions between Scriptable Main Runtime, WebView Runtime, and external development or build environments defined in Sections 3 and 7.
- Support verification and maintenance without requiring knowledge of undocumented implementation details.

The architecture MUST NOT introduce complexity, layers, classes, directories, or abstractions solely to satisfy a preferred pattern. Structure MUST be justified by actual responsibilities, risks, and maintenance needs.

### 10.2 Architectural Layers

The following table defines a reference division of responsibilities. It is not a fixed directory layout and does not require every project to create a separate module for every layer.

| Layer | Responsibility |
|---|---|
| Entry Point | Starts the script, validates invocation requirements, and coordinates the application lifecycle. |
| Core | Shared configuration, constants, common errors, logging interfaces, and foundational utilities. |
| Domain | Application-specific concepts, business rules, and decisions that should not depend on presentation. |
| Services | Networking, storage, authentication, and communication with external services. |
| Data | Data contracts, schemas, validation, transformation, mapping, and repositories. |
| Features | Cohesive user-facing capabilities and their orchestration. |
| UI | Menus, alerts, tables, lists, widgets, and presentation behavior. |
| Runtime Adapters | Controlled integration with Scriptable APIs and environment-specific capabilities. |
| WebView | Page content, browser-side scripts, styles, and explicit communication contracts with Scriptable. |

A small project MAY combine responsibilities when doing so remains clear and maintainable. A larger project SHOULD separate responsibilities when shared ownership, change frequency, testability, or dependency direction makes separation valuable.

Testing and verification are engineering activities, not Scriptable runtime architecture layers. Test files, fixtures, and test tooling MUST remain outside `src/`, as required by Section 10.3.

The layer names are architectural terms. They do not establish that Scriptable provides a corresponding built-in directory, service container, package system, or runtime abstraction, and they MUST NOT be interpreted as a requirement to create matching source directories.

### 10.3 Flat Scriptable Source Directory

The Scriptable application source MUST use one directory named `src/`. This directory is reserved for JavaScript application files that are actually executed or imported by Scriptable.

The following source-layout rules are mandatory:

- Every JavaScript application file directly executed by Scriptable or imported through `importModule()` MUST be located directly inside `src/`.
- `src/` MUST remain flat and MUST NOT contain subdirectories.
- `src/` MUST contain only JavaScript application files used by Scriptable at runtime.
- Test files, test fixtures, documentation, TypeScript source or declarations, development tools, build tools, package-manager files, and configuration used only for development or build processes MUST NOT be placed inside `src/`.
- Repository, CI, documentation, testing, and development artifacts that are not executed or imported by Scriptable MUST remain outside `src/`.
- Module responsibilities MUST be expressed through clear file names, module interfaces, exports, and dependency direction, not through nested folders.
- Application JavaScript file names MUST be consistent, descriptive, and aligned with the project's naming conventions.

The required Scriptable source layout is:

```text
project/
└── src/
    ├── script-file.js
    ├── module-a.js
    ├── module-b.js
    └── ...
```

The file names in this example are illustrative only and do not impose a fixed entry-point name. The example describes the Scriptable application source directory only; it does not prescribe the location or presence of other repository-level files or directories.

Logical responsibilities such as Core, Domain, Services, Data, Features, UI, Runtime Adapters, and WebView MAY be represented by separate JavaScript modules, but they MUST NOT be converted into subdirectories under `src/`. Testing remains a separate verification activity, and all test artifacts MUST be kept outside `src/`.

Scriptable's ability to resolve a directory import through an `index.js` file is documented in Section 6.1.1. That runtime capability does not change this project's flat source convention and MUST NOT be used to justify nested directories within `src/`.

### 10.4 Module Contracts and Responsibilities

Every public module MUST specify:

- Its responsibility and intended runtime context.
- Its public exports and their value categories.
- Its expected inputs and output values.
- Whether its operations are synchronous or asynchronous.
- Potential errors and failure behavior.
- Required dependencies and initialization requirements.
- Side effects, including file, network, storage, or state changes.
- The interfaces it exposes to other modules.

Functions SHOULD have focused responsibilities and predictable contracts. Objects SHOULD represent cohesive data or behavior with clear ownership. Classes SHOULD be used when instance state, encapsulation, or lifecycle behavior justifies them. Primitive values and other supported JavaScript values MAY be exported where they form an intentional and documented module contract. The supported export mechanism is defined in Section 6.1.2.

A module MUST NOT expose internal implementation details as an accidental public interface. Consumers MUST depend on documented exports rather than private variables, initialization side effects, or undocumented file layout.

### 10.5 Dependency Direction and Coupling

Dependencies between project modules MUST be explicit and SHOULD follow stable interfaces.

The architecture SHOULD ensure that:

- Domain rules do not depend directly on UI implementation.
- Shared core utilities do not depend on feature-specific behavior.
- Presentation modules consume defined data or service interfaces.
- Data access and external integrations are isolated from pure transformations where practical.
- Runtime-specific code is not imported into an incompatible execution context.
- A module does not require another module's undocumented initialization side effects.

Circular dependencies SHOULD be eliminated. When two modules depend on each other, the design SHOULD be reconsidered by clarifying ownership, extracting a shared contract, or introducing a coordinator with a clear responsibility.

High coupling MUST be assessed by its actual maintenance and failure impact. The project SHOULD NOT treat every dependency as harmful or introduce interfaces for dependencies that are stable, local, and simple without a demonstrated benefit.

### 10.6 Data Flow and State Ownership

The architecture MUST make the origin, transformation, ownership, and persistence of significant application data understandable.

For each important data flow, the project SHOULD identify:

1. The originating source.
2. The module responsible for acquisition.
3. The validation and transformation boundary.
4. The module or component that owns the resulting state.
5. The consumers of the data.
6. The persistence mechanism, when applicable.
7. The failure and recovery behavior.

State SHOULD have a clear owner and an explicit update path. Uncontrolled copies of mutable state SHOULD be avoided because they can diverge and produce inconsistent application behavior.

Persistent data SHOULD have a documented structure and compatibility strategy. When a schema changes, the project MUST determine whether existing stored data remains readable and whether migration, defaulting, rejection, or recovery is required.

### 10.7 Architecture Change and Verification

A change to module boundaries, flat `src/` file organization, dependency direction, public exports, or state ownership MUST be reviewed for its impact on existing consumers and execution contexts.

Where practical, automated or repeatable checks SHOULD identify:

- Unresolved or incorrect imports.
- Circular module dependencies.
- Unused modules or public exports.
- Duplicate implementations of the same business rule.
- Runtime-specific imports used from an incompatible context.
- Missing or inconsistent module contracts.
- Unexpected changes to data ownership or initialization order.
- Scriptable application JavaScript files that are not direct children of `src/`, nested directories inside `src/`, or non-runtime artifacts placed inside `src/`.

Static analysis and dependency-graph tools provide evidence only for the properties they inspect. They MUST NOT replace testing in the intended Scriptable runtime and execution context, as required by Section 15.

## 11. Data Quality and Error Handling

### 11.1 Data Validation Principle

All data originating from the network, files, the user, imported modules, external services, or another execution context MUST be treated as requiring validation at the appropriate trust boundary.

A successful read, request, import, parse, or deserialization operation MUST NOT be considered evidence that the resulting data is valid, complete, current, authorized, or suitable for the intended business operation.

Validation MUST be proportionate to the source, the consequences of incorrect data, and the contract expected by the consuming component. Validated internal data MAY rely on an established contract, but data crossing a trust boundary MUST be checked before it is used for consequential operations.

### 11.2 Data Contracts and Expected Structure

Important data exchanged between modules or received from external sources SHOULD have a documented contract. The contract SHOULD define:

- Required and optional properties.
- Expected JavaScript value types.
- Nullability and missing-value behavior.
- Permitted values and enumerations.
- Numeric ranges and units.
- String format and length constraints.
- Date and time representation, including timezone assumptions where relevant.
- Identifier format and uniqueness requirements.
- Relationships and dependencies between fields.
- Defaults, when explicitly permitted.
- Schema or contract version, where compatibility requires it.

Validation MUST check the expected structure and required values before the data is passed into business logic. Unknown or additional properties MUST be handled according to the relevant contract rather than being accepted or rejected indiscriminately.

TypeScript interfaces and declarations MAY describe expected shapes during development, but they do not validate data at runtime. JSON parsing confirms that text can be interpreted as JSON; it does not establish that the resulting value satisfies the application's schema or business rules.

### 11.3 Type, Range, and Semantic Validation

Validation MUST distinguish structural or type correctness from semantic correctness.

Structural validation SHOULD establish that required fields exist and that values have the expected types and formats. Semantic validation MUST establish that the values are meaningful and permitted for the intended operation.

Where applicable, validation SHOULD check:

- Required properties and expected value types.
- Numeric ranges, precision, and units.
- String formats, length, and permitted character sets.
- Allowed status values and enumerations.
- Date validity, ordering, and applicable timezone assumptions.
- Identifier validity and referenced-record existence.
- Relationships between fields and business invariants.
- Whether the requested operation is permitted for the current state.

Validation SHOULD use explicit permitted-value sets where practical. Invalid values MUST NOT silently enter application state or be converted into plausible-looking defaults unless the contract explicitly defines that behavior.

### 11.4 Missing Values, Nullability, and Normalization

JavaScript distinguishes between an absent property, `undefined`, `null`, an empty string, an empty array, an empty object, zero, and `false`. These values MUST NOT be treated as interchangeable when the distinction affects application behavior.

The project MUST define how missing and nullable values are interpreted at relevant data boundaries. Defaults MUST be applied deliberately and only when the data contract or business rule defines an appropriate default.

Normalization MAY be used to produce a consistent internal representation. Examples include trimming text, standardizing date representations, converting approved numeric formats, mapping external enumerations to internal values, and mapping external response objects into project data models.

Normalization MUST NOT conceal malformed, contradictory, out-of-range, or unauthorized data. The original source value SHOULD remain available in controlled diagnostic context when needed to investigate a transformation failure, subject to the privacy and logging requirements in Section 12.

### 11.5 Data Integrity and Consistency

The project MUST consider data integrity when values are combined, updated, persisted, or shared across modules and external services.

Relevant conditions include duplicate records, missing relationships, stale data, conflicting values, out-of-order updates, partial writes, repeated requests, unexpected schema changes, and corrupted persisted data.

The project SHOULD identify the authoritative source for important values and define how conflicting or stale values are handled. Updates involving related values SHOULD have an explicit consistency strategy. A partially completed operation MUST NOT be represented as a fully successful update.

Operations that may be repeated after a timeout, interrupted request, or uncertain response MUST be evaluated for idempotency. Where repetition can create duplicate records or transactions, the implementation MUST use appropriate safeguards or require confirmation before retrying.

### 11.6 Error Classification and Context

Errors MUST be handled according to their cause and operational impact. The project SHOULD distinguish at least the following categories where relevant:

| Category | Description | Example |
|---|---|---|
| Validation Error | Data violates an expected contract or rule. | Missing required property or invalid range. |
| Parsing Error | Input cannot be interpreted in the required format. | Malformed JSON or invalid date representation. |
| Runtime Error | JavaScript execution fails. | `TypeError` or `ReferenceError`. |
| Module Error | A required module cannot be resolved or initialized. | Incorrect import path or unavailable export. |
| Network Error | A request cannot be completed at the transport layer. | Connection interruption or timeout. |
| HTTP Error | An HTTP response indicates an unsuccessful request. | Client or server error status. |
| Storage Error | A file or persistence operation fails. | Read, write, or migration failure. |
| Authentication Error | Authentication cannot be completed or maintained. | Invalid or expired credentials. |
| Authorization Error | The requested operation is not permitted. | Insufficient access. |
| Integration Error | An external component does not satisfy its expected contract. | Unexpected response or incompatible service behavior. |
| Configuration Error | Required configuration is missing or invalid. | Missing endpoint or invalid setting. |

An error report SHOULD preserve the original error where available and provide useful context such as the operation, module, relevant non-sensitive identifier, and failure stage. Error messages MUST NOT falsely imply that an operation succeeded.

### 11.7 Exception and Promise-Rejection Handling

Expected failures at operational boundaries MUST be handled deliberately. This includes file access, network operations, parsing, permissions, storage, and asynchronous operations.

Synchronous operations that may throw SHOULD be handled at a layer that can recover, translate the failure, add useful context, or propagate it to a responsible caller. `try...catch` MUST NOT be added indiscriminately where it cannot provide meaningful handling.

Asynchronous operations MUST have an explicit Promise-rejection strategy. When using `async` and `await`, rejected Promises MUST be handled by an appropriate `try...catch` boundary or propagated to a caller that is responsible for handling them. Promise chains MUST include a deliberate rejection-handling or propagation path.

A catch handler MUST recover, translate the error, add useful context, perform required cleanup, or deliberately report and terminate the operation. It MUST NOT silently swallow an error or return a success-shaped value that conceals failure.

Errors that cannot be handled meaningfully at the current layer SHOULD propagate to a layer that can apply the correct failure policy. Cleanup that must occur regardless of success or failure SHOULD be performed through an appropriate `finally` path or equivalent controlled cleanup mechanism.

### 11.8 Network, Storage, and External-Service Failures

Network and external-service operations MUST distinguish transport completion from application-level success. Receiving an HTTP response does not by itself establish that the requested operation succeeded. Implementations MUST inspect the response information required by the service contract and validate the returned data before using it.

Network handling SHOULD account for connection interruptions, timeouts, unsuccessful HTTP status codes, malformed responses, missing fields, authentication failures, authorization failures, rate limits, and temporary service unavailability.

Storage handling SHOULD account for missing or unavailable files, iCloud download behavior, read and write failures, invalid serialized content, incomplete updates, and migration failures.

Recovery behavior MUST reflect the actual failure and possible side effects. A transport retry MUST NOT be used as a substitute for checking whether the original operation may already have succeeded.

### 11.9 Retry and Recovery Policy

The project MUST establish a retry policy for operations where retry is relevant. The policy SHOULD define:

- Which failure categories are eligible for retry.
- Which failures are permanent and MUST NOT be retried automatically.
- The maximum number of attempts and applicable delay or backoff behavior.
- Whether the operation is idempotent or protected against duplicate effects.
- Whether the service provides retry or rate-limit guidance.
- What state is retained between attempts.
- When the user must be notified or asked to intervene.
- What happens when all permitted attempts fail.

Retries MUST be bounded. Non-idempotent operations MUST NOT be retried automatically without safeguards that prevent duplicate or unintended effects.

When recovery uses cached or previously persisted data, the application SHOULD identify that data as stale or fallback data where that distinction affects the user's decision. Recovery MUST NOT conceal data corruption, invalid authorization, or an unresolved integrity failure.

### 11.10 Diagnostics and Failure Visibility

The project SHOULD record enough diagnostic information to identify the failing operation, its component, the failure category, and the recovery outcome.

Diagnostic records SHOULD include a timestamp, severity, component or module, operation, error identifier where available, relevant non-sensitive context, and retry or recovery status.

Sensitive-data handling, credential protection, redaction, and logging restrictions are governed by Section 12. Diagnostic output MUST NOT expose secrets or private information. Logs MUST NOT be treated as a substitute for a clear application state or a user-facing failure result where the user needs to know that an operation did not complete.

### 11.11 Testing and Acceptance

Data validation and error handling MUST be included in the relevant verification plan under Section 15.

Tests SHOULD cover valid input, missing properties, null and undefined values, incorrect types, invalid formats, values outside permitted ranges, unexpected enumerations, malformed serialized data, incomplete external responses, unsuccessful HTTP statuses, rejected Promises, synchronous exceptions, missing files, storage failures, authentication and authorization failures, duplicate operations, retry limits, partial updates, and outdated persisted data.

Tests MUST verify both successful behavior and the expected response to invalid data or failed operations. A data-processing operation MUST NOT be considered reliable solely because it works with one valid example.

Acceptance MUST be based on the relevant data contract, validation rules, error propagation, recovery behavior, and tests in the intended Scriptable execution context. Test records and compatibility evidence MUST follow the project requirements in Section 15.


## 12. Security, Privacy, and Reliability

Security and privacy requirements apply to data regardless of its JavaScript representation. Relevant values include primitive values (`String`, `Number`, `Boolean`, `Symbol`, `undefined`, and `null`, with `BigInt` included only when verified on the target Scriptable runtime), `Object` values (including arrays and plain objects), `Function` values, `Class` constructors and instances, and objects exposed by Scriptable or other host APIs. A value's type does not determine whether it is sensitive; its content, origin, purpose, and permitted use do.

### 12.1 Secrets

MUST:

- Store passwords, access tokens, refresh tokens, API keys, private keys, and other credential material in Scriptable `Keychain` when appropriate.
- Keep secrets out of JavaScript source files, committed configuration, URLs, query parameters, screenshots, diagnostic output, and logs.
- Limit secret access to the smallest set of modules and execution paths that require it.
- Remove or rotate credentials when they are no longer required or are suspected to be compromised.
- Redact credentials and sensitive personal data from errors, telemetry, and support reports.

MUST NOT:

- Embed live secrets in source code, examples, test fixtures, or repository history.
- Print, serialize for diagnostics, or expose secrets to WebView content or third-party services unless the data flow is explicitly required and authorized.

Scriptable's `Keychain.set(key, value)` accepts a string value. Structured data MUST be converted only when necessary and only from explicitly selected, serializable data fields. JSON serialization does not preserve `Function` behavior, `Class` behavior or prototypes, `Symbol`, `undefined` object properties, or every JavaScript value type. Do not treat `JSON.stringify()` as a general-purpose serializer for arbitrary JavaScript values. Credential values should normally be stored as their original strings.

### 12.2 Networking

MUST:

- Use HTTPS for remote service communication.
- Validate the final response before consuming it, including the HTTP status code, expected content type where relevant, and the application-level data contract or schema.
- Set an explicit, context-appropriate `Request.timeoutInterval` rather than relying unintentionally on its documented 60-second default.
- Handle rejected Promises, transport failures, connection interruptions, malformed payloads, and unexpected status codes.
- Preserve normal TLS certificate validation.
- Validate redirect destinations when redirect handling could change the trust boundary, and MUST NOT allow a secure request to be silently downgraded to plain HTTP.
- Apply bounded retry policies only where retrying is safe. Non-idempotent operations MUST use an idempotency mechanism or another explicit duplicate-prevention strategy before automatic retries are allowed.

MUST NOT:

- Set `Request.allowInsecureRequest` to `true` for production traffic.
- Disable or bypass certificate validation without a specific, documented, reviewed, and narrowly scoped exception.

A successful `loadJSON()` call establishes that a response was parsed as JSON; it does not establish that the HTTP status, content type, schema, business meaning, or trustworthiness of the returned data is valid. Scriptable documents `Request.timeoutInterval` as an idle timeout, not a guarantee of a total end-to-end execution deadline. If the application requires a total deadline, it MUST enforce that requirement at the application level where the available runtime APIs permit it.

### 12.3 Files

MUST:

- Validate and constrain source paths and destination paths before read, write, copy, move, overwrite, or deletion operations.
- Treat paths derived from user input, URL parameters, network responses, or imported data as untrusted input.
- Check file existence and expected file type where relevant before sensitive operations.
- Account for both local and iCloud-backed storage. A file in iCloud may exist without being downloaded to the device.
- Await `FileManager.downloadFileFromiCloud(filePath)` before reading an iCloud file that may not be available locally.
- Retain a recoverable backup when the operation's impact or irreversibility warrants one, especially before deletion, replacement, or movement.
- Verify the resulting file and its contents after sensitive write or replacement operations.

MUST NOT:

- Assume that an iCloud file is locally available merely because its path exists.
- Assume that move or deletion operations are reversible. Scriptable documents that `move()` replaces an existing destination file and that `remove()` cannot be undone through the API.
- Overwrite or delete a destination without first confirming that it is the intended target.

### 12.4 Privacy and Permission Handling

MUST:

- Apply data minimization: access and process only the location, photos, contacts, calendar data, or other personal information required for the requested feature.
- Request access only when the feature needs the data and the user's intent makes the request understandable.
- Explain the purpose of access in the user-facing flow when the reason is not already clear.
- Use the narrowest access path exposed by Scriptable and the relevant iOS API for the required operation.
- Handle denied, restricted, unavailable, or subsequently revoked access explicitly.
- Provide a safe fallback, cancellation path, or clear explanation when access is unavailable.
- Avoid repeated attempts that assume the user will grant access after denial.

MUST NOT:

- Treat a permission prompt as proof that access was granted.
- Treat a returned empty collection, missing value, or failed Promise as proof that the user has no data without considering authorization and API failure states.
- Collect, retain, transmit, or cache personal data merely because an API makes it available.

The Scriptable API surface may abstract native iOS authorization details. Implementations MUST rely only on authorization controls and behavior actually exposed by Scriptable, and MUST NOT assume that native Apple authorization-status APIs are directly callable from Scriptable JavaScript.

### 12.5 External and Dynamically Executed Code

MUST:

- Treat code and data obtained from network responses, files, shared content, URL parameters, and user input as untrusted until validated.
- Keep executable code separate from data.
- Use fixed, reviewed code paths and validated data structures instead of generating executable source from untrusted input.
- Apply origin and navigation restrictions to WebView content when the WebView handles sensitive data or privileged workflows.

MUST NOT:

- Execute untrusted external code through `eval()`, the `Function` constructor, `WebView.evaluateJavaScript()`, or an equivalent dynamic execution mechanism.
- Concatenate untrusted values into JavaScript source code, HTML, or other executable contexts.
- Assume that code loaded by a WebView is trusted merely because it is displayed inside Scriptable.

`WebView.evaluateJavaScript()` is a documented Scriptable capability, not a blanket security violation. It MAY be used with trusted, reviewed code. Values crossing into the WebView MUST be passed as data using a safe serialization and validation strategy, not interpolated as executable code. WebView navigation and resource loading MUST be constrained when required by the sensitivity of the content.

## 13. Performance and Resource Management

Performance MUST be evaluated against the actual execution context, workload, device, and user-visible outcome. Successful execution in the Scriptable app does not establish that the same workload is viable in a Widget, Siri/Shortcuts action, Share Sheet extension, or WebView.

MUST:

- Minimize redundant file reads, writes, network requests, image decoding, and repeated computation.
- Avoid loading or retaining large files, images, and response bodies when a smaller representation or narrower operation is sufficient.
- Respect memory constraints in Widgets and extension-based execution contexts.
- Keep work performed in short-lived contexts bounded and relevant to the user's immediate action.
- Use caching when it reduces repeated work without violating freshness, privacy, or correctness requirements.
- Define cache lifetime, invalidation behavior, and behavior when cached data is missing, stale, or corrupt.
- Bound concurrency and resource consumption when processing multiple files, images, or network requests.
- Measure performance using representative inputs on the intended iPhone and execution context.

MUST NOT:

- Assume that a script has unlimited memory, persistent background execution, or an unrestricted execution duration.
- Assume that requesting a Widget refresh causes an immediate refresh. `refreshAfterDate` specifies the earliest permitted refresh time; the operating system determines the actual refresh schedule.
- Cache credentials or sensitive personal data without a documented need, retention policy, and protection appropriate to the data.

Network timeout requirements are defined in Section 12.2 and apply to performance as well as reliability.

## 14. Target Execution Contexts

Execution constraints and available inputs, outputs, permissions, memory, and lifecycle behavior vary by context. A project MAY target the following contexts when required:

- Direct execution within the Scriptable app.
- Home Screen or Lock Screen Widget execution.
- Shortcuts and Siri execution.
- Share Sheet / Action Extension execution.
- Scriptable URL Scheme execution.
- JavaScript execution inside a Scriptable WebView.

These are execution contexts within the project's existing iPhone device scope. They MUST NOT be interpreted as authorization to expand device testing to iPad, macOS, or other platforms.

MUST:

- Identify the required execution contexts for each script or feature before implementation is considered complete.
- Test each required context independently on the target iPhone.
- Verify context-specific inputs and outputs, including `args`, `config`, shortcut parameters, Share Sheet payloads, URL query parameters, and Widget parameters where applicable.
- Verify context-specific lifecycle behavior, UI presentation, permission availability, memory constraints, and completion behavior.
- Record the tested iOS version, Scriptable version, execution context, relevant Widget family or extension mode, test conditions, and observed result.
- Test failure paths as well as successful execution, including denied permissions, unavailable network access, missing or undownloaded iCloud files, malformed external data, and oversized inputs where relevant.
- Treat WebView page JavaScript as a separate JavaScript execution environment from the Scriptable Main Runtime.

MUST NOT:

- Treat successful execution in the Scriptable app as evidence of successful execution in a Widget, Shortcuts, Siri, Share Sheet, URL Scheme, or WebView context.
- Assume that an API, permission, input, output, UI capability, or resource budget available in one context is available in another.
- Mark a context as supported unless it has been tested or its unverified status is explicitly recorded.

The project remains iPhone-only. Context coverage expands the execution modes tested on iPhone, not the supported device platforms.

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

- Standard ESLint linting does not prove that a Scriptable host API exists or behaves correctly. A custom rule or verified API allowlist MAY detect selected unsupported names, but remains a static check.
- TypeScript does not create Runtime APIs.
- Test262 tests observable behavior defined by ECMAScript-related standards, including ECMA-262, ECMA-402, and ECMA-404. It does not verify Scriptable-specific host APIs, iOS permissions, or Scriptable execution contexts. Selected tests MAY be used for language-feature investigation only when their required harness and runtime semantics are supported or faithfully adapted. A partial or adapted run MUST NOT be reported as full Test262 conformance.
- Successful execution in Node.js does not establish Scriptable compatibility.
- A successful build does not establish successful execution on iPhone.
- Successful static analysis does not replace actual application testing.

### 15.3 Analysis Tools

The following tools MAY be used:

- TypeScript Compiler.
- ESLint.
- Prettier, for formatting only. Formatting success is not evidence of semantic correctness, API availability, runtime compatibility, or test success.
- Test262.
- Fallow, for static project-level analysis such as module-graph, unused-code, dependency, duplication, complexity, and architecture findings according to enabled features. Its default analysis does not execute Scriptable code or establish host API behavior.
- Actual Scriptable tests on the device.

The tool MUST be selected according to the verification claim and MUST NOT be given authority to establish anything it does not test. These are verification dimensions, not a mandatory linear sequence. The test plan MUST identify applicable layers and justify any layer marked not applicable.

#### 15.3.1 JavaScript Value and Object Coverage

Where a module accepts, returns, transforms, compares, serializes, persists, or transfers JavaScript values, its approved test plan MUST identify the value categories within the module contract. Each category MUST be marked Supported, Unsupported, Not Applicable, or Not Verified. A category MUST NOT be treated as supported merely because the language or a type declaration can represent it.

The value inventory MUST distinguish the following:

- **Primitive values:** `undefined`, `null`, Boolean, String, and Number. Number cases SHOULD include ordinary finite values and relevant edge values such as `NaN`, positive and negative infinity, positive zero, and negative zero. `Symbol` and `BigInt` MUST be tracked separately because support at a language level does not prove that a particular Scriptable API, serializer, storage layer, or transport boundary accepts them. BigInt MUST remain Not Verified for the documented ES6 baseline until it is demonstrated in the target Scriptable runtime.
- **Function objects:** ordinary functions, arrow functions, closures, and bound functions where the interface uses them. A function is an object with callable behavior, not a primitive value. Tests MUST distinguish invocation and identity behavior from serialization or persistence, which generally cannot preserve executable function behavior.
- **Ordinary object values:** plain objects, nested objects, arrays, sparse arrays, and objects with relevant property shapes. Include built-ins such as Date, RegExp, Error, Map, Set, and Promise only when the interface claims to accept or produce them and the target runtime supports the required behavior.
- **Class constructors and instances:** a class declaration creates a constructor function; an instance is an object. `Class` MUST NOT be described as a separate ECMAScript primitive type. Where class instances cross a module, persistence, or transport boundary, verify prototype-dependent behavior and the explicitly supported representation.
- **Scriptable host objects:** documented host objects and values such as `Data`, `Request`, `FileManager` results, `Image`, and other Scriptable APIs only when they are part of the module contract. The applicable Scriptable documentation and actual execution context determine the supported surface.
- **WebView and context-bound values:** values passed between Main Runtime and WebView, or between a script and Widget, Shortcut, or Share Sheet contexts, only where the project has an explicit interface for that transfer. These are distinct host boundaries and MUST NOT be assumed to share globals or object identity.
- **Persistence and transport representations:** JSON-compatible data, strings stored through Keychain, file content, and network payloads. The test plan MUST define the encoding, decoding, validation, and failure behavior for each supported representation.

Value-boundary cases SHOULD include missing properties versus explicit `undefined` and `null`, empty values, invalid types, nested and sparse structures, repeated references, circular references, numeric edge cases, and conversion failures where relevant. Tests MUST NOT assume JSON serialization preserves functions, Symbols, `undefined` object properties, class prototypes, circular references, or Scriptable host-object behavior. Keychain values are strings; any encoding scheme MUST explicitly define its supported value domain and error behavior.

A passing test for one category or boundary MUST NOT be generalized to untested categories, APIs, devices, Scriptable versions, or execution contexts. The language-level distinction between primitive and object values MUST follow the ECMAScript specification: https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values.

### 15.4 Compatibility Matrix

Every test MUST record:

- Stable Test ID and related requirement or rule ID.
- API, language feature, module interface, value category, and test layer.
- Scriptable app version/build, iOS version, and iPhone model.
- Execution context, explicitly distinguishing Main Runtime from WebView.
- Preconditions, relevant permissions, and material environment conditions.
- Test input or sanitized test-data reference.
- Expected result, actual observed result, and result status.
- Execution date/time, procedure, harness revision, and source revision or commit.
- Official documentation URL, specification reference, and evidence location.
- Notes, limitations, deviations, and restrictions.

Fields that do not apply MUST be marked N/A with a reason. Unknown details MUST be marked Unknown, not inferred. Evidence MUST NOT contain credentials, access tokens, private user data, or other secrets. Compatibility claims MUST state their exact tested scope; results from one device, version, or context MUST NOT be generalized to others.

### 15.5 Compatibility Statuses

The following statuses MUST be distinguished:

- Documented: Described by an applicable official source; this does not mean executed.
- Tested: Executed with environment and evidence recorded; this does not by itself mean passed.
- Compatible: Passed the required tests within the explicitly stated version, device, and context scope.
- Incompatible: Failed a reproducible required test, or an applicable authoritative source rules out the claimed support. Scope and evidence MUST be stated.
- Not Verified: Evidence is insufficient to establish compatibility or incompatibility.

These statuses describe different evidence dimensions, not one interchangeable ranking. A feature can be Documented but Not Verified at runtime, or Tested but Incompatible. Partial support MUST be stated by scope.

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

### 15.7 Approved Verification Catalogue

The project MUST maintain an approved catalogue of verification cases. This requirement defines and documents the test coverage expected by approved interfaces; it does not require creating a test implementation for a category that is outside the approved project scope or cannot be executed in the available environment.

The catalogue SHOULD select applicable cases from these distinct test classes:

1. **Syntax and language-feature tests:** parse the declared JavaScript baseline and verify individual language features that the project explicitly approves. Parser success alone does not prove runtime support.
2. **Unit tests:** verify deterministic module logic, transformations, calculations, and error handling independently of Scriptable host APIs where practical.
3. **Contract tests:** verify module inputs, outputs, invariants, state transitions, serialization formats, and documented failure behavior.
4. **Value-category tests:** exercise the primitive, function, object, class, host-object, and persistence/transport categories declared by the interface.
5. **API compatibility tests:** verify Scriptable API names, signatures, parameters, return values, and documented availability. Static allowlists are supporting checks, not proof of runtime behavior.
6. **Integration tests:** verify interactions between modules and Scriptable services such as Request, FileManager, Keychain, and other host APIs used by the feature.
7. **Runtime tests:** execute the relevant code in the actual Scriptable app on the approved target device and record the exact environment.
8. **Context tests:** separately verify each intended context, including Main Runtime, WebView, Widget, Shortcuts, and Share Sheet where applicable.
9. **Negative and boundary tests:** verify invalid inputs, missing data, rejected permissions, unavailable resources, timeouts, malformed responses, and recovery paths where relevant.
10. **Security and privacy tests:** verify secret handling, data minimization, permission behavior, untrusted input handling, and absence of sensitive data in logs.
11. **Performance and resource tests:** assess execution time, memory, payload size, and resource limits when the feature's risk or operational profile makes them material.

Each catalogue entry MUST include a stable Test ID, covered Rule ID or contract, objective, test class, scope, preconditions, input or sanitized fixture reference, expected result, verification method, required environment, owner, approval record, and evidence location. Approval status and execution result MUST be separate fields.

The catalogue lifecycle SHOULD distinguish Proposed, Reviewed, Approved, Implemented, and Retired. Execution outcomes MUST distinguish Passed, Failed, Blocked, Indeterminate, and Not Run. Not Applicable requires a recorded rationale. An approved case is not evidence that it has been implemented or executed; a test plan is not a test result. No test code or runtime execution is implied by documenting or approving a catalogue entry.

## 16. Governance and Normative Rules

### 16.1 Authority by Question and Evidence Type

The project MUST use an authority model based on the question being answered. A single linear ranking MUST NOT make one source authoritative outside its subject area.

1. The approved project constitution and specifications govern project policy, architecture, and engineering obligations. They cannot make an unavailable runtime capability exist or change an external technical specification.
2. Approved subordinate policies and procedures govern project processes and MUST remain consistent with the constitution.
3. Official Scriptable documentation is the primary authority for documented Scriptable host APIs, parameters, return behavior, and application constraints.
4. Apple JavaScriptCore documentation governs Apple's framework behavior. It does not prove Scriptable exposes every framework class or method to scripts.
5. ECMAScript governs language semantics and standard built-ins, not Scriptable-specific host APIs.
6. Official TypeScript documentation governs compiler and declaration behavior, not Scriptable runtime implementation.
7. Community declarations, tools, repositories, and examples are supporting evidence only and MUST be checked against applicable primary sources and the target runtime.
8. Reproducible tests on a target iPhone provide empirical evidence only for the recorded app version, iOS version, device, and execution context. They do not replace normative specifications or official API documentation.

If a project requirement conflicts with a documented platform limitation or observed runtime constraint, the conflict MUST be recorded and resolved through an approved specification change, a supported alternative, or an explicit exception. The project MUST NOT claim a capability exists merely because a project rule requires it. If official documentation and reproducible runtime evidence disagree, record exact versions and evidence, investigate, and escalate for clarification or specification update. A test result MUST NOT silently rewrite a specification. A community source MUST NOT override the applicable primary source, but MAY identify an omission requiring verification.

### 16.2 Normative Language

This constitution adopts IETF BCP 14, RFC 2119 and RFC 8174. The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, NOT RECOMMENDED, MAY, and OPTIONAL have the meanings defined by those RFCs when, and only when, they appear in all capitals.

- MUST / REQUIRED / SHALL: Absolute requirement within the stated scope.
- MUST NOT / SHALL NOT: Absolute prohibition within the stated scope.
- SHOULD / RECOMMENDED: Recommendation that may be departed from only for valid reasons, with implications understood and documented.
- SHOULD NOT / NOT RECOMMENDED: Normally discouraged behavior that may be justified by documented circumstances and risk assessment.
- MAY / OPTIONAL: A genuinely optional choice within the stated scope.

Normative keywords MUST be used carefully and only when a conformance obligation is intended. Each requirement SHOULD be atomic and testable. Lowercase “must” and “should” retain ordinary English meanings.

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

Each rule MUST also identify its owner, lifecycle state (active, superseded, or retired), effective date, change history, verification criteria, and related rules. Verification cases MUST identify the Rule ID they cover. A rule without a verification mapping MUST be marked unverified or guidance-only, not silently treated as enforced. A replacement rule MUST receive a new ID and identify the rule it supersedes.

### 16.5 Traceability and Change Control

The project MUST maintain traceability between normative rules, implementation scope, verification cases, test results, and exceptions. A rule change MUST trigger impact analysis for dependent documentation, code, tests, CI checks, and downstream rules. Missing trace links MUST be reported as governance gaps.

### 16.6 Primary References

- Scriptable: https://docs.scriptable.app/
- Apple JavaScriptCore: https://developer.apple.com/documentation/javascriptcore
- ECMAScript: https://tc39.es/ecma262/
- Test262 scope and execution: https://github.com/tc39/test262/ and https://github.com/tc39/test262/blob/main/INTERPRETING.md
- ESLint: https://eslint.org/docs/latest/use/core-concepts/
- TypeScript: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
- Fallow: https://fallow.tools/docs/analysis/dead-code/
- RFC 2119: https://www.rfc-editor.org/rfc/rfc2119.html
- RFC 8174: https://www.rfc-editor.org/rfc/rfc8174.html
- NIST, Principles for Writing Conformance Requirements: https://www.nist.gov/system/files/principles_for_writing_conformance_criteria_0.pdf
- ETSI, A Guide to Writing World Class Standards: https://www.etsi.org/images/files/Brochures/AGuideToWritingWorldClassStandards.pdf

## 17. Exceptions, Risks, and Violations

### 17.1 Exception Governance

An exception is a formally approved, narrowly scoped, time-bounded deviation from a specific project requirement. It is not an informal waiver, a substitute for remediation, or a mechanism for overriding an external platform limitation.

An exception MUST identify:

- A unique Exception ID and the exact Rule ID and requirement being excepted.
- The requester, affected owner, affected components, files, APIs, data classes, environments, and execution contexts.
- A specific justification, the constraint that prevents compliance, and alternatives considered.
- The risk assessment, linked Risk ID where a risk register entry exists, and the expected residual risk.
- Compensating controls, their owners, their verification method, and the evidence that they are operating.
- The approving person or role and the authority under which approval is granted. The requester MUST NOT approve their own exception.
- A start date, a fixed expiry date, and any earlier review trigger.
- A remediation or exit plan, including rollback or containment steps where applicable.
- Supporting evidence and the canonical register location.

An exception MUST be limited to the minimum scope and duration necessary. An open-ended exception, automatic renewal, or approval without a named accountable owner MUST NOT be allowed. Extension requires a new assessment and approval before the current expiry; it MUST be recorded as a new decision linked to the previous Exception ID.

An exception MAY only waive a project rule that explicitly permits exceptions. It MUST NOT authorize unlawful conduct, defeat a non-waivable security prohibition, fabricate platform capabilities, bypass external service terms, or override GitHub permissions and repository protections. An approved exception does not amend the underlying rule and does not erase a violation that occurred before approval.

### 17.2 Exception Lifecycle

The normal lifecycle is:

`Proposed → Reviewed → Approved → Active → Expired / Revoked`

Rejected requests MUST be retained as decision records. An exception becomes Active only after approval and on or after its approved start date. At expiry it MUST cease authorizing the deviation. Revocation MUST record the reason, effective time, and required containment or remediation. An expired or revoked exception MUST NOT be treated as active because implementation work remains incomplete.

A renewal or material scope change returns through review and approval as a new decision. The exception register MUST preserve the complete history, including rejected, expired, revoked, and superseded records.

### 17.3 Risk Assessment

A material exception, violation, or normative change MUST receive a documented risk assessment proportionate to its scope and impact. At minimum, assess:

- **Likelihood:** probability of the relevant failure, threat event, or adverse condition within the stated scope and period.
- **Impact:** severity and extent of consequences to functionality, data integrity, confidentiality, availability, users, operations, and dependent components.
- **Detectability:** how likely the condition is to be detected before material harm, considering monitoring, observability, and verification coverage.

Likelihood and impact are core risk-assessment dimensions reflected in NIST risk guidance. Detectability is an additional project engineering factor and MUST NOT be presented as a verbatim NIST requirement. Where relevant, the assessment SHOULD also consider exposure duration, exploitability, dependency reach, reversibility, and blast radius.

The assessment MUST state its assumptions, evidence, risk owner, treatment decision, and residual risk after controls. A numeric score MAY be used only when the scoring scale, thresholds, and interpretation are documented. A score MUST NOT replace a reasoned assessment or an authorized risk-acceptance decision. Risk acceptance MUST identify the person authorized to accept the residual risk.

### 17.4 Violation Lifecycle and Closure

The normal violation lifecycle is:

`Detected → Classified → Assigned → Remediated / Exception Requested → Verified → Closed`

Each violation MUST record:

- A unique Violation ID and the violated Rule ID.
- Detection source, date, affected commit or artifact, component, API, data, and execution context.
- Classification, severity, impact, and risk assessment.
- An accountable remediation owner and target date.
- Corrective action, containment, and prevention measures.
- Related Exception ID, if one is requested or approved.
- Verification criteria, verifier, result, date, and evidence.

A request for an exception does not close, suspend, or erase the violation. Approval of a prospective exception does not retroactively make earlier non-compliance compliant. A violation MUST NOT be closed until remediation has been verified against explicit acceptance criteria. If remediation is not performed and a permitted exception is approved, the violation record MUST remain linked to that exception and reflect the accepted residual risk rather than being falsely marked as remediated. Closure evidence MUST be retained.

## 18. GitHub, CI, and Change Management

### 18.1 Automated Checks and Applicability

GitHub Actions and other approved automation MAY enforce repository checks. Every mandatory check MUST map to one or more Rule IDs, have a defined scope and owner, and produce evidence appropriate to the claim it makes. The applicable check set MUST be determined by the changed files, language, dependencies, interfaces, risk, and execution context.

The project MUST maintain a scope-based check matrix and MUST select all applicable checks from the categories below. A category MAY be marked Not Applicable only when the reason is recorded:

- Syntax and language-baseline validation, including the project's declared ECMAScript compatibility target.
- Static analysis and repository hygiene.
- Type checking when TypeScript or JSDoc type contracts are part of the project.
- Dependency inventory, update, and vulnerability checks when external dependencies are present.
- Secret scanning and applicable security analysis.
- Governance rule, register, schema, and traceability validation.
- Unit, contract, serialization, and integration tests for approved behavior within the CI environment.
- Scriptable Runtime and execution-context verification when a supported device-based runner or documented manual evidence procedure is available.

A check MUST NOT be required merely because a tool exists. A check MUST NOT claim to validate Scriptable Runtime, iOS permissions, WebView behavior, or device-specific behavior unless it actually executes and observes that target. Node.js parsing or tests, TypeScript, ESLint, CodeQL, and Test262 each have bounded scopes; their results MUST be described only within those scopes.

The check catalogue MUST record the check name, Rule IDs, trigger conditions, scope, tool and version, expected output, owner, required or advisory status, failure semantics, and evidence location. If a check is not applicable, record `N/A` with a reason. If a required check cannot run, its result MUST NOT be represented as Passed.

### 18.2 Main Branch Protection and Merge Requirements

The default branch, currently `main`, MUST be protected by repository rules or branch protection settings. Changes MUST enter the protected branch through a Pull Request unless an explicitly authorized emergency procedure applies and is itself recorded.

The protection configuration MUST define, as applicable:

- Required Pull Requests and the required number or role of approvals. If the approval count is zero because the repository has only one qualified maintainer, document that limitation and reassess it when the maintainer model changes.
- Required status checks, their trusted source, and whether the branch must be up to date with the base branch.
- Dismissal or re-review behavior for stale approvals after material changes.
- Conversation resolution, code-owner review where appropriate, and the treatment of administrator or bypass permissions.
- Restrictions on force pushes and branch deletion.

A required check MUST report success for the latest commit SHA that GitHub evaluates for the merge. Required check names SHOULD be unique across workflows, and the expected check source SHOULD be restricted to the approved GitHub App or integration where supported. The repository MUST account for GitHub's documented check semantics: `success`, `neutral`, and `skipped` may be treated as successful conclusions for merge requirements. A required workflow or job MUST therefore be designed so that path filters, conditional jobs, or skipped dependencies cannot silently satisfy a control that was expected to run.

A failed, timed-out, action-required, or otherwise unsuccessful required check MUST block merge. Queued, requested, expected, pending, waiting, or in-progress checks are not completed success. If a tool outage or execution failure prevents a required check from producing valid evidence, the project record MUST classify it as `BLOCKED` or `INDETERMINATE` with the reason. These are project evidence labels, not GitHub-native check conclusions. The change MUST remain unmergeable until the required evidence is obtained or a separately authorized and documented exception applies. A tool outage MUST NOT be converted into a successful result.

Administrator bypass MUST be disabled or tightly controlled and audited. Any emergency bypass MUST identify the actor, reason, affected checks, risk acceptance, compensating controls, and follow-up verification. A bypass MUST NOT silently rewrite a failed check as passed.

### 18.3 Normative Change Management

Every change to the Constitution, policy, standards, procedures, rule catalogue, or mandatory CI controls MUST follow a recorded lifecycle:

1. Propose the change and identify its owner and purpose.
2. Identify affected Rule IDs, documents, code, APIs, tests, CI checks, registers, evidence, and dependent projects.
3. Assess compatibility, security, privacy, operational impact, risks, and rollback or transition needs.
4. Review the proposed text and supporting evidence.
5. Approve the change through the defined authority.
6. Update the canonical source, version, decision record, and affected references.
7. Verify required documentation, schema, CI, and runtime consequences within their applicable scopes.
8. Publish the approved revision and retain prior versions and evidence.

A proposed or reviewed change MUST NOT be represented as approved or effective. A file edit or Pull Request merge alone MUST NOT replace a required approval record. Changes to mandatory CI checks MUST identify the governing Rule ID, rationale, expected enforcement level, and failure behavior before the check becomes required.

### 18.4 Versions

The project adopts Semantic Versioning (`MAJOR.MINOR.PATCH`) as its versioning convention for the published Constitution and normative specification. The project MUST define and maintain the public normative contract to which the version applies.

- **MAJOR:** an incompatible change to the existing normative contract, including a rule change that invalidates prior conformance assumptions or makes previously conforming implementations non-conforming.
- **MINOR:** a backward-compatible addition of rules, requirements, clarifications, or capabilities that does not invalidate existing conformance.
- **PATCH:** editorial, typographical, reference, or explanatory corrections that do not change normative meaning or conformance obligations.

A substantial rewrite alone MUST NOT trigger a MAJOR version unless it changes normative compatibility. If a change cannot be classified confidently, the decision and rationale MUST be recorded before release. The published version, release date, approver, change summary, and related decision record MUST be identifiable from the canonical source or release metadata.

The project MUST retain prior published versions, decision records, and historical evidence. A published version MUST NOT be silently overwritten as though it had never existed; corrections MUST be issued as a new version or a clearly recorded revision according to the project's release policy.

## 19. Governance Documentation Organization

### 19.1 Document Layers

Governance documentation is organized into these layers, each with a distinct purpose:

1. **Constitution:** top-level normative authority defining scope, principles, governance roles, and mandatory project-wide obligations.
2. **Policies:** binding subject-specific requirements that implement the Constitution and define decision authority and control expectations.
3. **Standards and Procedures:** technical rules, operational methods, verification procedures, and repeatable instructions for satisfying policies.
4. **Registers:** structured records of decisions, rules, risks, exceptions, violations, compatibility results, and evidence.
5. **References:** external standards, official platform documentation, specifications, tool documentation, and supporting research used to substantiate requirements.

Lower-level documents MUST remain consistent with the Constitution. A conflict MUST be recorded and resolved through the defined change process; a lower-level document MUST NOT silently override a higher-level rule.

### 19.2 Canonical Sources and Data Separation

Each governed fact or record type MUST have one designated canonical source. Other documents SHOULD link to that source rather than maintain competing copies. The canonical source and its owner MUST be identifiable.

Human-readable policy, rationale, procedures, and decision explanations SHOULD be maintained in Markdown or another reviewable document format. Structured records intended for validation or automation SHOULD be maintained in a machine-readable format such as JSON. The two representations MUST have a defined relationship and MUST NOT be allowed to drift silently. Where both human-readable and structured forms exist, the project MUST state which one is authoritative for each field and how consistency is verified.

Secrets, access tokens, private personal data, and credentials MUST NOT be copied into governance documents, registers, test fixtures, or evidence artifacts. Use sanitized evidence and access-controlled references where necessary.

### 19.3 Traceability

Every normative Rule ID MUST be traceable, where applicable, to:

- Its canonical definition and governing policy.
- The affected implementation, module, API, or repository path.
- Approved verification cases and their execution evidence.
- Applicable CI checks and their enforcement level.
- Related decisions, risks, exceptions, violations, and remediation records.
- Applicable external references and their authority or evidence role.

Missing links MUST be recorded as traceability gaps. A rule MUST NOT be described as automated or enforced merely because a document mentions a tool or workflow.

### 19.4 Records, History, and Evidence Retention

Decision records, approved and rejected exceptions, violations, failed and successful verification results, and conflicting evidence MUST be retained according to the project's retention and access-control policy. Newer evidence does not automatically invalidate or erase older evidence. Superseded evidence MUST remain identifiable, with the reason and date of supersession and a link to the evidence that supersedes it.

Records SHOULD be append-oriented: corrections and status changes SHOULD preserve the previous value, actor, timestamp, reason, and reference where the record system supports history. Evidence references MUST be stable enough to support later review. Retention MUST balance auditability with privacy, security, and applicable legal obligations.

### 19.5 Governance and CI Alignment

A mandatory CI check MUST have a clear governance reference, an owner, an applicability rule, and an explicit pass/fail/blocked interpretation. The CI workflow MUST NOT become an independent source of policy. When a rule changes, the project MUST review the affected check implementation and its evidence mapping. A CI check that no longer enforces an active rule MUST be corrected, replaced, or retired through change control.

Normative terms, Rule IDs, and technical field names are maintained in English for consistency across code, CI, registers, and technical references. Explanatory documentation MAY provide translations, but translations MUST preserve the meaning of the approved normative text.

### 19.6 Primary Governance References

- NIST Cybersecurity Framework 2.0, including ID.RA-07, for management, risk assessment, recording, and tracking of changes and exceptions: https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf
- NIST SP 800-30 Rev. 1, Guide for Conducting Risk Assessments: https://csrc.nist.gov/pubs/sp/800/30/r1/final
- GitHub Docs, About protected branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- GitHub Docs, Status checks: https://docs.github.com/en/pull-requests/reference/status-checks
- Semantic Versioning 2.0.0: https://semver.org/spec/v2.0.0.html
- IETF RFC 2119 and RFC 8174 for normative language: https://www.rfc-editor.org/rfc/rfc2119.html and https://www.rfc-editor.org/rfc/rfc8174.html
- Test262, ECMAScript conformance test suite and execution requirements: https://github.com/tc39/test262/ and https://github.com/tc39/test262/blob/main/INTERPRETING.md

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
