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

These responsibilities MAY be separated conceptually in procedures and records, but different people MUST NOT be assumed to occupy them.

### 2.3 Responsibility Principle

Every approval, review, test result, and deployment operation MUST be attributable to the sole responsible owner, with the date, outcome, and appropriate evidence recorded.

## 3. Technical Model and Runtime Layers

The following layers MUST be distinguished and MUST NOT be treated as a single environment:

| Layer | Responsibility |
|---|---|
| JavaScript | Programming language |
| ECMAScript | The standard that defines the language’s rules and behavior |
| JavaScriptCore | JavaScript execution engine |
| Scriptable | Host Application and its Scriptable APIs |
| Scriptable Main Runtime | Primary script execution context |
| WebView Runtime | Web page execution context |
| TypeScript | Type checking and development tools |
| Native iOS APIs | Apple’s native iOS APIs; their existence does not establish their direct availability within Scriptable |

### 3.1 Rule for Separating Layers

1. The existence of a feature in ECMAScript does not establish its existence in every runtime environment.
2. The existence of an API in JavaScriptCore does not establish that it is directly available to the script.
3. The existence of a TypeScript definition does not create a Runtime API.
4. Successful execution of code in Node.js does not establish its compatibility with Scriptable.
5. Successful execution of code in WebView does not establish its compatibility with Scriptable Main Runtime.
6. The layer and context MUST be identified before any API or feature is approved.

## 4. JavaScript and ECMAScript Standard

### 4.1 Baseline

1. MUST adopt ECMAScript 2015 (ES6) as the project’s documented baseline.
2. MUST NOT adopt newer features automatically.
3. MUST verify newer features through actual testing within Scriptable.
4. MUST distinguish language syntax compatibility from compatibility with standard objects and functions.
5. MUST NOT consider successful compilation or static analysis as evidence of runtime compatibility.

### 4.2 Modern Features

Any feature whose compatibility with the baseline or target device has not been established MUST be treated as unverified until it has been tested.

This includes, for example, features introduced after ES2015, such as async/await, BigInt, and modern array features.

Support for these features MUST NOT be assumed merely because they exist in a recent version of JavaScriptCore or in TypeScript.

### 4.3 Code Quality

MUST:

- Use const and let in new code as appropriate.
- Avoid var unless there is a clear necessity.
- Use explicit comparisons.
- Handle null and undefined explicitly.
- Handle expected errors.
- Avoid oversized functions and functions with multiple responsibilities.
- Minimize duplication.
- Use clear names.
- Avoid magic values and magic strings.
- Document complex logic and the reason for its existence.
- Separate business logic from system access as far as practicable.

## 5. Scriptable APIs

### 5.1 Source of Truth

The official Scriptable documentation is the primary reference for establishing the existence of application APIs.

Before using any API, MUST verify:

1. That the API exists in the official documentation.
2. The correct API name.
3. Property and method names.
4. Parameter types.
5. The return value.
6. Asynchronous behavior, where applicable.
7. Restrictions, warnings, and deprecated properties.
8. The execution context in which it is used.
9. Restrictions associated with the Scriptable and iOS versions.

### 5.2 API Families

The API families that SHOULD be organized and reviewed include:

- Execution, input, and output: args, config, and Script.
- Files and storage: FileManager, Keychain, Data, and Path.
- Networking: Request.
- Device services: Device, Location, Photos, and Contacts.
- Calendar and reminders: Calendar, CalendarEvent, and Reminder.
- User interfaces: Alert, DatePicker, TextField, and UITable.
- Web: WebView and Safari.
- Widgets: ListWidget and its components.
- Drawing and images: DrawContext, Image, Color, and Font.
- Date, audio, messaging, and parsing: DateFormatter, Speech, Mail, XMLParser, and others.

These are family names used for organization. They do not independently establish the existence of every property or method within those families.

### 5.3 Prohibition of Assumptions

MUST NOT:

- Invent undocumented APIs or properties.
- Rely on internet examples without verification.
- Assume that all Apple APIs are directly available.
- Assume that all npm libraries work within Scriptable.
- Use a TypeScript definition alone to establish the existence of an API.

## 6. Module and Import System

### 6.1 Scriptable Mechanism

The module system relies on:

- importModule()
- module.exports

The documented import behavior MUST be followed, and file paths MUST be specified correctly.

### 6.2 Node.js Compatibility Boundaries

The existence of importModule and module.exports does not mean that the complete Node.js environment is available.

MUST NOT assume the availability of:

- require()
- process
- node_modules
- Native Node.js APIs
- All npm libraries
- The ES Modules system as implemented in Node.js or the browser.

### 6.3 Module Responsibility

Every module MUST have a clear purpose, inputs, outputs, and an understandable contract.

MUST avoid:

- Duplicated logic.
- Circular dependencies.
- Unnecessary coupling.
- Multiple responsibilities within a module.
- Direct dependencies on system APIs when business logic can be separated from them.

## 7. Separation Between Scriptable Main Runtime and WebView Runtime

### 7.1 Scriptable Main Runtime

This is the primary script execution context in Scriptable.

Documented Scriptable APIs, such as FileManager, Request, Keychain, Script, and args, can be used in this context.

MUST NOT assume that document, window, or the DOM exists in this context.

### 7.2 WebView Runtime

This is an independent web-page context within WebView.

It can contain HTML, CSS, JavaScript, the DOM, and document, according to the web-page environment.

The documented WebView APIs MUST be used to control the page, such as evaluateJavaScript(), getHTML(), waitForLoad(), and the loading and presentation operations.

### 7.3 Separation Rules

1. MUST identify where each piece of code executes: Scriptable Main Runtime or WebView Runtime.
2. MUST NOT transfer DOM assumptions into Scriptable Main Runtime.
3. MUST NOT consider WebView a replacement for FileManager.
4. MUST test JavaScript within WebView independently from the primary script.
5. MUST handle communication between the two contexts explicitly and validate the transferred data.
6. MUST account for the behavior of asynchronous operations and loading errors.

## 8. TypeScript and Scriptable Definitions

### 8.1 Role

TypeScript is a development and static type-checking tool, not a native runtime environment within Scriptable.

### 8.2 Type Definitions

The project MAY use @types/scriptable-ios, DefinitelyTyped, and type-definition generation projects, but these MUST be treated as unofficial supporting references.

The definitions MUST be compared against the official Scriptable documentation.

The following definition statuses MUST be recorded:

- Correct.
- Missing.
- Extra.
- Conflicting.
- Unverified.

### 8.3 Type-Checking Configuration

The target, lib, and types settings MUST be configured to suit the target runtime environment.

DOM definitions MUST NOT be loaded automatically into Scriptable Main Runtime type checking if doing so would permit the use of APIs that do not exist in that environment.

The following MUST be distinguished:

- TypeScript Declaration.
- JavaScript Output.
- Runtime API.

Successful type checking does not establish that an API exists at runtime.

### 8.4 TypeScript Lifecycle

When using TypeScript:

1. Write the source files.
2. Perform type checking.
3. Transpile or build JavaScript when needed.
4. Verify that the output is compatible with Scriptable.
5. Execute the output within the application.
6. Record the result and evidence.

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

A library MUST NOT be approved until its compatibility has been established in the target context, or it has been documented as unverified with operational use prohibited.

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
| Scriptable Host APIs | Integration with Scriptable APIs |
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

All data originating from the network, files, the user, or the execution context MUST be treated as data requiring validation.

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

A failure of the checking tool does not mean that the check has passed; its status MUST be recorded as BLOCKED or INDETERMINATE, depending on the reason.

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

### 24.8 ECMAScript Official Specification

Official specification:

https://tc39.es/ecma262/

Completed specifications and proposals:

https://github.com/tc39/proposals

ECMAScript development process:

https://tc39.es/process-document/

### 24.9 Test262

Official ECMAScript test repository:

https://github.com/tc39/test262

It is used to test JavaScript behavior for conformance with the specification, and does not establish compatibility with Scriptable APIs.

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
