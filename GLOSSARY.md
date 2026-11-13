# Project Glossary

This glossary defines the domain language used by the governance system. It is a terminology reference, not a specification or implementation plan.

| Term | Definition |
|---|---|
| Constitution | The highest normative authority governing the project. |
| Policy Rule | A uniquely identified normative requirement with scope, enforcement, rationale, evidence requirements, and exception conditions. |
| Governance Model | The authority, precedence, approval, enforcement, exception, and review mechanisms used to administer the Constitution. |
| Script | A JavaScript entry point that Scriptable can run directly. |
| Module | A JavaScript unit imported by another script, including through Scriptable importModule. |
| Library | A reusable collection of modules. |
| Dependency | A component required by another component to operate or build. |
| Runtime | The JavaScript execution engine and its execution services. |
| Execution Context | The host context in which code runs, such as Scriptable in-app, a widget, or a WebView. |
| Host API | An API exposed by Scriptable or the operating system to a script. |
| Compatibility Assessment | A scoped evaluation of a component or API against a specific environment tuple. |
| Compatibility Record | The canonical record for one component/API, version, device, and execution-context combination. |
| Evidence | A source or reproducible artifact supporting a claim, test result, or decision. |
| Exception | A time-bounded, approved deviation from a Policy Rule. |
| Decision | A recorded governance outcome based on applicable rules and evidence. |
| Scope | The components, APIs, versions, devices, contexts, and conditions to which a rule or assessment applies. |
| Enforcement | The mechanism that blocks, warns about, or guides a change. |
| Verification | The process of checking that a claim or required behavior is supported by adequate evidence. |

## Compatibility vocabulary

The following labels are independent assessment dimensions unless a policy explicitly defines a relationship:

- Documented
- Tested
- Compatible
- Incompatible
- Not Verified
- Unsupported

Unsupported is a governance decision. It is not interchangeable with Incompatible or Not Verified.
