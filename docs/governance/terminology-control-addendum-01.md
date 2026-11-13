# Scriptable Engineering Specification
# Terminology Control Addendum 01

**Document type:** Terminology control addendum  
**Scope:** English terminology used in the Scriptable engineering specification and its related technical documentation  
**Status:** Provisionally approved for translation terminology control  
**Relationship to the dictionaries:** This addendum controls term selection, distinctions, and usage. It is not a third glossary and does not create duplicate canonical term records. The existing unified and supplementary dictionaries remain the canonical termbase.

---

## 1. Scriptable and the Execution Environment

| Arabic concept | Approved English term | Usage rule |
|---|---|---|
| تطبيق Scriptable | Scriptable app | Use for the iOS application. |
| بيئة تشغيل مضيفة | Host Environment | Use for the environment surrounding JavaScript and the facilities it provides. |
| التطبيق المضيف | Host Application | Descriptive term for the application providing or embedding the execution environment. Do not present it as a separately defined ECMAScript term. |
| بيئة تشغيل Scriptable الرئيسية | Scriptable Main Runtime | Project-defined term for the primary Scriptable script execution environment. |
| بيئة تشغيل | Runtime Environment | General term for the environment in which a program executes. |
| تشغيل السكربت | Script Execution | Use for the act or process of executing a script. |
| السكربت الرئيسي | Main Script | Use for the primary script entry point where that distinction is intended. |
| واجهات Scriptable البرمجية | Scriptable APIs | Use for programming interfaces exposed by the Scriptable app. |
| واجهات Scriptable المدمجة | Built-in Scriptable APIs | Descriptive term for APIs provided directly by Scriptable. |
| واجهات iOS الأصلية | Native iOS APIs | Reserve for APIs provided by iOS or Apple's native frameworks. |
| واجهات المتصفح | Browser APIs | Use only for APIs provided by a browser environment. |
| كائنات المتصفح | Browser Objects | Use for objects belonging to a browser environment. |
| بيئة غير متصفح | Non-browser Environment | Use when distinguishing Scriptable's main environment from a browser environment. |

**Controlling distinction:** Do not use `Native APIs` as a generic substitute for Scriptable-provided interfaces. Use `Scriptable APIs`. Reserve `Native iOS APIs` for native iOS or Apple framework interfaces. The existence of a Native iOS API does not prove that Scriptable exposes it to scripts.

## 2. JavaScript and ECMAScript

| Arabic concept | Approved English term | Usage rule |
|---|---|---|
| لغة البرمجة | Programming Language | Use for the general concept of a programming language. |
| معيار ECMAScript | ECMAScript Standard | Use for the standardized language definition. |
| مواصفة ECMAScript | ECMAScript Specification | Use when referring to the specification document or its normative text. |
| إصدار ECMAScript 6 | ECMAScript 6 (ES6) | Preserve the edition identifier. |
| قواعد اللغة | Language Syntax | Use for the grammatical rules of the language. |
| دلالات اللغة | Language Semantics | Use for the meaning and behavior defined by the language. |
| تطبيق متوافق | Conforming Implementation | Use in the standards context for an implementation conforming to the specification. |
| بيئة مضيفة | Host Environment | Use for the environment in which ECMAScript code executes and which supplies host facilities. |
| تنفيذ المضيف | Host Implementation | Use for the host's implementation of host-defined behavior and facilities. |

## 3. JavaScriptCore and Apple

| Arabic concept | Approved English term | Usage rule |
|---|---|---|
| محرك JavaScript | JavaScript Engine | General technical term for an engine that executes JavaScript. |
| إطار JavaScriptCore | JavaScriptCore Framework | Use when referring to Apple's framework. |
| سياق تنفيذ JavaScript | JavaScript Execution Context | General descriptive concept. Do not use it as a substitute for the specific Apple class name. |
| الفئة `JSContext` | `JSContext` | Preserve the exact Apple class identifier. |
| قيمة JavaScript | JavaScript Value | General concept of a value in JavaScript. |
| الفئة `JSValue` | `JSValue` | Preserve the exact Apple class identifier. |
| بيئة تنفيذ مستقلة | Self-contained Execution Environment | Apple's descriptive wording for `JSVirtualMachine`; do not treat this phrase as a Scriptable API. |
| إدارة الذاكرة | Memory Management | Use for memory-management concepts and behavior. |
| الاحتفاظ بالقيم | Value Retention | Use for retaining JavaScript values where relevant to JavaScriptCore. |
| الكائنات الأصلية | Native Objects | Use for native objects exposed to or interacting with JavaScript. |
| تصدير الكائنات إلى JavaScript | Exporting Objects to JavaScript | Use for the process described by Apple's JavaScriptCore export facilities. |

**Controlling distinction:** Use `execution context` for the general concept. Use `JSContext` only when referring to Apple's specific class. Do not infer that JavaScriptCore framework classes are directly available to Scriptable scripts.

## 4. WebView

| Arabic concept | Approved English term | Usage rule |
|---|---|---|
| عرض ويب مضمّن | Embedded Web View | Descriptive phrase for a web view embedded in an application. |
| `WebView` | `WebView` | Preserve the Scriptable API identifier exactly. |
| بيئة WebView | WebView Environment | Use for the web-page environment hosted by Scriptable's WebView. |
| بيئة تشغيل WebView | WebView Runtime | Project-defined descriptive term, not an independently established official Scriptable API or product name. |
| سياق منفصل | Separate Execution Context | Use when explaining the separation between the main Scriptable context and the WebView page context. |
| محتوى الويب | Web Content | Use for content loaded or displayed in the WebView. |

## 5. TypeScript

| Arabic concept | Approved English term | Usage rule |
|---|---|---|
| نظام الأنواع | Type System | Use for the system of types and type relationships. |
| تعريفات TypeScript | TypeScript Definitions | Use for TypeScript type information describing APIs and values. |
| ملفات التصريحات | Declaration Files | Use for TypeScript declaration files, commonly `.d.ts`. |
| الفحص الساكن | Static Checking | Use for checks performed without normal runtime execution. |
| فحص الأنواع | Type Checking | Use for checking type relationships and assignments. |
| وقت التطوير | Development Time | Use for activities performed during development. |
| وقت التشغيل | Runtime | Use for the period or environment in which code executes, according to context. |
| واجهة وقت التشغيل | Runtime API | Use only for an interface actually available during program execution. |

**Controlling distinction:** TypeScript Definitions and Declaration Files describe types for development tools. They do not create runtime functionality and do not prove that a Runtime API exists or is exposed by Scriptable.

## 6. Distinctions That Must Not Be Collapsed

The following pairs and groups refer to different concepts and must not be used interchangeably:

- JavaScript / ECMAScript
- JavaScriptCore / Scriptable
- Scriptable APIs / Native iOS APIs
- Main Runtime / WebView Environment
- Execution Context / `JSContext`
- TypeScript Definitions / Runtime APIs
- Browser APIs / Scriptable APIs

Where a sentence could refer to more than one concept, select the term from the technical context. If the intended concept cannot be established from the source, preserve a neutral description and record the ambiguity instead of guessing.

## 7. Terminology Approval and Usage Policy

1. Preserve programming identifiers exactly as written, including capitalization, spelling, and punctuation.
2. Use the approved technical term for standards-based and framework-specific concepts.
3. Do not replace a precise approved term with a stylistic synonym.
4. Where a term has multiple meanings, select the equivalent supported by its sentence-level context and record unresolved ambiguity.
5. Explicitly label project-defined terminology as `Project-defined`.
6. Where the available authoritative reference does not establish the intended meaning, use a neutral description and record the query.
7. Do not classify a term as an official API name unless the relevant authoritative documentation establishes it.
8. Do not infer Scriptable API availability from Apple framework documentation or TypeScript declarations.

## 8. References

The following references support the terminology distinctions in this addendum. Their authority is limited to their respective products, frameworks, and standards.

### Scriptable

- https://docs.scriptable.app/

### Apple JavaScriptCore

- https://developer.apple.com/documentation/javascriptcore
- https://developer.apple.com/documentation/javascriptcore/jscontext
- https://developer.apple.com/documentation/javascriptcore/jsexport

### ECMAScript

- https://tc39.es/ecma262/
- https://tc39.es/ecma262/#sec-hosts-and-implementations

### TypeScript

- https://www.typescriptlang.org/docs/

## 9. Approval Status and Governance

- The terminology mappings in this addendum are provisionally approved for translation use.
- `Scriptable Main Runtime` and `WebView Runtime` are Project-defined terms.
- This addendum does not claim that the complete project glossary is finished.
- No translated section is approved solely because it follows this addendum. Each section still requires contextual terminology review, source-fidelity review, and completeness review.
- The existing unified and supplementary dictionaries remain the canonical termbase. If a canonical glossary entry needs correction or expansion, update that entry in its existing dictionary file rather than creating a duplicate entry here.
- This addendum controls the selection and distinction of terms; it does not silently amend the Arabic source specification or establish new runtime capabilities.
