# Research: Software Project Structures, Documentation Architecture, and Governance

| Field | Value |
|---|---|
| Document type | Research and architecture options paper |
| Status | Informational research, not a normative project policy |
| Prepared | 2026-11-14 |
| Repository | JSOS-SA/JSOS-SA-s-Scriptable-JSOS |
| Intended use | Inform the future restructuring of Unified Specifications for the Scriptable Project |
| Authority | This paper does not amend or supersede the Project Constitution, policies, standards, approved decisions, or existing specifications |

> **Important boundary:** This document describes and compares established structures. It is not approval to replace the repository's current governance model, move existing rules, or change implementation architecture. Any proposed normative change must follow the repository's approval and change-control process.

## 1. Executive summary

A long specification that combines policy, standards, rules, system constraints, architecture, and programming practices should not be reorganized by copying the directory structure of a software application. These are different structural problems:

1. **Governance structure** defines authority, precedence, obligations, exceptions, and enforcement.
2. **Requirements structure** defines uniquely identifiable obligations, rationale, verification, and traceability.
3. **Architecture description** explains the system through stakeholder concerns and complementary views.
4. **Documentation information architecture** makes information findable by reader intent and task.
5. **Source-code architecture** organizes executable code and dependency boundaries.
6. **Decision and terminology records** preserve why choices were made and what project terms mean.

No single framework solves all six problems. The strongest approach is a layered document system in which each requirement has one authoritative home, while other documents link to it rather than restating it.

The repository's existing Constitution already defines a normative precedence order:

1. Constitution
2. Policies
3. Standards
4. Procedures
5. Records
6. References

This research recommends preserving that hierarchy as the governance authority. Use other frameworks as complementary views within their proper scope:

- Use **ISO/IEC/IEEE 42010** concepts to describe architecture stakeholders, concerns, viewpoints, views, and rationale.
- Use **arc42** as a practical architecture-description outline where useful.
- Use **C4** diagrams to communicate system context and decomposition at consistent levels.
- Use **Diátaxis** to classify explanatory and task-oriented documentation, not to replace normative governance categories.
- Use **docs-as-code** for review, versioning, validation, and publishing practices.
- Use requirements identifiers and bidirectional traceability to connect rules to implementation, tests, evidence, and exceptions.
- Use **ADRs** for consequential decisions and a **glossary** for stable domain terminology.
- Choose code organization independently, based on actual Scriptable runtime boundaries and module responsibilities.

## 2. The six structures that must not be conflated

| Structure | What it organizes | Typical question | Is it the top-level governance hierarchy? |
|---|---|---|---|
| Governance hierarchy | Authority and normative force | Which rule prevails when two statements conflict? | Yes, for normative authority |
| Requirements architecture | Obligations and verification relationships | What must be true, and how is it verified? | No, it is a cross-cutting index |
| Architecture description | System concerns and technical views | How is the system structured and how does it behave? | No, it is a system-description framework |
| Documentation information architecture | Reader journeys and content types | Where should a reader go to learn or perform a task? | No, it is a navigation and content model |
| Source-code architecture | Modules, dependencies, and runtime boundaries | Where does executable responsibility live? | No, it governs code, not document authority |
| Decision and terminology records | Rationale and shared language | Why was a choice made, and what does a term mean? | No, these are supporting records |

A common restructuring error is to make one taxonomy serve several incompatible purposes. For example, placing policies, API references, architecture diagrams, and tutorials into one undifferentiated "architecture" tree confuses authority with subject matter and reader intent.

## 3. Governance hierarchy: policy, standard, procedure, rule, and reference

### 3.1 The concepts

Terminology differs among organizations and standards bodies. The following is a practical distinction, not a claim that every jurisdiction or framework uses identical definitions.

| Artifact | Function | Typical normative force | Example for a Scriptable project |
|---|---|---|---|
| Constitution | Establishes the highest authority, scope, precedence, and governance process | Highest within the repository | Defines the authority order and conflict-resolution process |
| Policy | States an organizational requirement or control objective | Mandatory at policy level | Runtime compatibility must be assessed against declared environments |
| Standard | Defines specific mandatory technical criteria that implement policy | Mandatory within scope | A module must expose a documented contract |
| Rule / requirement | Atomic, identifiable obligation | Depends on its parent policy or standard | A stable rule ID for the approved module import mechanism |
| Procedure | Gives ordered steps to perform or verify an activity | Required process where mandated | Device compatibility test procedure |
| Guideline | Recommends a practice without making it universally mandatory | Advisory | Suggested naming or refactoring approach |
| Record | Captures an event, decision, exception, test, or result | Evidentiary, not normally a source of new policy | Approved exception record |
| Reference | Supplies facts, definitions, external documentation, or explanatory material | Informative unless explicitly incorporated | Scriptable API reference or JavaScriptCore source |
| Decision record | Captures a choice, alternatives, consequences, and rationale | Records a decision; its authority depends on approval | ADR selecting a module boundary |

### 3.2 Recommended rule anatomy

An atomic requirement should be written so it can be reviewed and verified independently. A useful record shape is:

- **ID:** stable unique identifier.
- **Title:** concise obligation.
- **Statement:** one testable normative sentence.
- **Rationale:** why the obligation exists.
- **Scope:** components, files, runtime contexts, or workflows covered.
- **Authority:** parent policy or standard.
- **Verification:** inspection, automated test, runtime test, or evidence review.
- **Evidence:** authoritative source or reproducible artifact.
- **Exceptions:** conditions and approved exception record, if any.
- **Status:** proposed, approved, superseded, or retired.
- **Owner and review date:** accountability and currency.

Do not put several independently verifiable obligations into one requirement. Conversely, do not split one obligation into multiple fragments that cannot be understood without reconstructing scattered text.

### 3.3 Conflict and precedence

The repository's Constitution already establishes a hierarchy. Preserve it as the source of normative precedence. A lower-level document may clarify or implement a higher-level rule, but must not silently weaken it.

When a conflict is found:

1. Record the two identifiers and exact passages.
2. Identify the authority level and scope of each.
3. Apply the existing precedence rule provisionally.
4. Determine whether the conflict is real, contextual, or merely different wording.
5. Resolve it through the approved change process.
6. Update the authoritative source and all affected references.
7. Retain the resolution evidence.

A research report, glossary, tutorial, diagram, or external reference must not become a hidden source of new mandatory rules.

## 4. Requirements architecture and traceability

### 4.1 Why traceability matters

A requirement is not fully managed merely because it appears in a document. It should be possible to follow it to the design element that satisfies it, the implementation that realizes it, and the test or evidence that verifies it.

A practical traceability chain is:

**Source / rationale -> Policy -> Standard -> Requirement ID -> Architecture element -> Code / configuration -> Test -> Evidence -> Exception or change record**

Not every requirement needs every link. A documentation-only rule may be verified by a structural check. A runtime compatibility requirement may need a device and execution-context test. Traceability should reflect the requirement's nature.

### 4.2 Traceability matrix

| Requirement ID | Parent authority | Architecture element | Implementation location | Verification | Evidence | Status |
|---|---|---|---|---|---|---|
| JS-RUN-001 | Runtime policy | Runtime context model | Relevant runtime adapter/module | Device test | Test record | Example only |
| JS-MOD-001 | Module standard | Module boundary | Module entry point | Static inspection/test | CI result | Example only |
| JS-WV-001 | WebView standard | WebView boundary | WebView bridge | Runtime test | Test record | Example only |

The identifiers above are illustrative, not approved project requirements.

### 4.3 Forward and backward traceability

- **Forward traceability:** requirement to architecture, code, test, and evidence. It helps detect requirements that have no implementation or verification.
- **Backward traceability:** code, test, or architecture element back to its originating requirement or decision. It helps identify undocumented behavior and unjustified implementation.
- **Change impact:** when a requirement changes, identify all linked architecture, code, tests, and records.

Do not maintain a manually duplicated traceability table if the canonical structured records can generate it. A generated view is safer than multiple independently edited copies.

## 5. Software architecture description frameworks

Architecture frameworks describe a system. They do not establish the authority order of project policies.

### 5.1 ISO/IEC/IEEE 42010

**Purpose:** A standard for architecture description. It provides concepts for architecture descriptions, stakeholders, concerns, viewpoints, views, model kinds, and rationale.

**Core distinctions:**

- A **stakeholder** has an interest in the system.
- A **concern** is an issue important to a stakeholder.
- A **viewpoint** defines conventions for constructing and interpreting a view that addresses concerns.
- A **view** is an architecture description from a particular perspective.
- A **model kind** defines the conventions of a particular kind of model.
- **Rationale** records why architectural decisions or elements are present.

**Strengths:**

- Makes the intended audience and concern explicit.
- Supports multiple complementary views without assuming one diagram explains everything.
- Helps distinguish a viewpoint (the rules for a view) from the view itself.
- Provides a disciplined way to record architecture rationale.

**Limitations:**

- It is a conceptual standard, not a ready-made folder structure.
- It does not prescribe the one correct architecture or documentation template.
- Applying every concept to a small project can create unnecessary ceremony.

**Recommended use:** Use its concepts to define architecture concerns and views, especially when the specification currently mixes runtime behavior, module boundaries, security, compatibility, and deployment in one narrative.

Official source: [ISO/IEC/IEEE 42010:2022 - Architecture description](https://www.iso.org/standard/74393.html).

### 5.2 C4 model

**Purpose:** A visual model for communicating software architecture at different levels of abstraction.

**Primary diagram levels:**

1. **System context:** the system, its users, and external systems.
2. **Container:** major applications or executable units and their responsibilities.
3. **Component:** major building blocks within a container.
4. **Code:** implementation-level detail, often omitted unless it adds value.

Supplementary diagrams can show dynamic behavior, deployment, and system landscape.

**Strengths:**

- Provides consistent zoom levels.
- Helps prevent a high-level overview from being overloaded with implementation detail.
- Useful for showing external integrations and boundaries.
- Can be maintained as text-based diagrams using tools such as Structurizr.

**Limitations:**

- It is a diagramming model, not a complete specification or governance system.
- It does not define policy precedence, requirement lifecycle, or verification rules.
- The code level is often unnecessary for a document whose purpose is to explain stable architecture.

**Recommended use:** Use context and container diagrams first. Add component or dynamic diagrams only where they answer a documented concern. For Scriptable, a context view can show Scriptable, JavaScriptCore, iOS services, WebView, Firebase, and external services, but each connection must be verified against the actual system.

Official source: [The C4 model](https://c4model.com/).

### 5.3 arc42

**Purpose:** A practical template for architecture documentation. Its commonly used structure covers:

1. Introduction and goals.
2. Architecture constraints.
3. Context and scope.
4. Solution strategy.
5. Building block view.
6. Runtime view.
7. Deployment view.
8. Cross-cutting concepts.
9. Architecture decisions.
10. Quality requirements.
11. Risks and technical debt.
12. Glossary.

**Strengths:**

- Provides a concrete starting outline.
- Covers both static structure and runtime behavior.
- Makes constraints, quality requirements, decisions, risks, and terminology visible.
- Can be tailored rather than followed mechanically.

**Limitations:**

- It describes architecture, not the entire governance system.
- A full template may be excessive for a small project.
- It does not replace requirement identifiers, test evidence, or policy authority.

**Recommended use:** Adopt a tailored subset as the architecture-description chapter or directory. Keep policy and technical standards in their existing normative hierarchy.

Official source: [arc42 overview](https://arc42.org/overview/).

### 5.4 4+1 architectural view model

**Purpose:** Organizes architecture descriptions around logical, development, process, and physical views, with scenarios/use cases tying the views together.

- **Logical view:** key abstractions and domain functionality.
- **Development view:** software organization for developers.
- **Process view:** runtime processes, concurrency, and communication.
- **Physical view:** deployment and infrastructure.
- **Scenarios:** use cases that demonstrate and validate the views.

**Strengths:** It forces attention to different stakeholder concerns and connects architecture to scenarios.

**Limitations:** The terminology and original emphasis may not map cleanly to every modern mobile or scripting system. It can overlap with C4 and arc42.

**Recommended use:** Treat it as a conceptual cross-check, not a second competing documentation template. If arc42 and C4 already answer the concerns, do not duplicate the same views under a separate 4+1 directory.

### 5.5 Choosing among architecture-description frameworks

| Need | Best fit | Why |
|---|---|---|
| Define stakeholders, concerns, viewpoints, and views | ISO/IEC/IEEE 42010 concepts | Provides the architecture-description vocabulary |
| Communicate system boundaries and decomposition | C4 | Clear visual abstraction levels |
| Create a written architecture document | Tailored arc42 | Practical section outline |
| Check multiple stakeholder perspectives | 4+1 | Cross-checks logical, development, process, physical, and scenario views |

These frameworks are complementary. Do not create four parallel architecture documents that restate the same system facts.

## 6. Source-code and repository architecture patterns

These patterns organize executable code and dependencies. They should be selected from actual runtime, change, and testing needs, not copied into the governance hierarchy.

### 6.1 Layered architecture

**Shape:** Code is grouped into layers, commonly presentation/interface, application/use cases, domain, and infrastructure/data access.

**Dependency intent:** Higher-level policy and domain logic should not become dependent on lower-level implementation details without an explicit boundary.

**Strengths:** Familiar, easy to explain, useful where responsibilities naturally align by technical layer.

**Risks:** A feature change may require edits across many layers. Broad shared layers can become dumping grounds. Dependency direction must be specified, not inferred from folder names.

**Suitable when:** The system has stable technical layers and the team benefits from clear separation between UI, application logic, domain rules, and adapters.

### 6.2 Feature-based or modular architecture

**Shape:** Code is grouped by capability or domain area, with each module owning related behavior and its public contract.

**Strengths:** Related changes remain close; ownership and test boundaries are easier to see; supports incremental extraction.

**Risks:** Modules can still depend on each other's internals. Feature folders alone do not guarantee modularity.

**Suitable when:** The project has distinct capabilities that evolve independently.

### 6.3 Hexagonal architecture (ports and adapters)

**Shape:** Core application/domain logic communicates through ports. Adapters implement interaction with external systems, frameworks, storage, UI, or APIs.

**Strengths:** External dependencies can be replaced or tested behind explicit interfaces. Core logic can be tested without every host service.

**Risks:** Excessive interface creation can add indirection without meaningful isolation. A JavaScript runtime may not provide the same dependency injection facilities as larger frameworks.

**Suitable when:** External host APIs, network services, storage, or WebView boundaries need to be isolated and tested.

Reference: [AWS Prescriptive Guidance - Hexagonal architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/hexagonal-architectures/).

### 6.4 Clean Architecture

**Shape:** Organizes code around entities/domain rules, use cases, interface adapters, and frameworks/drivers. The dependency rule aims to keep source dependencies pointing inward toward policy.

**Strengths:** Makes the intended dependency direction explicit and protects core rules from infrastructure churn.

**Risks:** It is frequently over-applied as a rigid folder recipe. The diagram is not proof that dependencies actually obey the rule. Small scripts may not need all layers.

**Suitable when:** Domain rules are substantial and should remain independent of Scriptable APIs, Firebase, WebView, or other adapters.

### 6.5 Vertical Slice Architecture

**Shape:** Organizes code by end-to-end feature or use case, so the implementation for one behavior is kept together rather than split only by technical layer.

**Strengths:** Makes feature changes cohesive and reduces cross-folder navigation for a single use case.

**Risks:** Shared policies and cross-cutting capabilities can be duplicated unless their ownership is explicit. Slices can become inconsistent if common contracts are not governed.

**Suitable when:** Work is primarily delivered as independent user-visible capabilities or workflows.

### 6.6 Monolith, modular monolith, and microservices

| Style | Meaning | Main advantage | Main cost |
|---|---|---|---|
| Monolith | One deployable/application unit, potentially with weak internal boundaries | Operational simplicity | Internal coupling can grow |
| Modular monolith | One deployable unit with explicit module boundaries and contracts | Modular design without distributed deployment | Boundaries require enforcement |
| Microservices | Independently deployable services communicating across process/network boundaries | Independent deployment and scaling | Network, operations, consistency, security, and observability complexity |

A mobile Scriptable project is not automatically a microservices system because it calls several remote APIs. External services are dependencies, not necessarily project-owned microservices.

**Recommendation:** Prefer a modular monolith or feature-oriented modular structure unless independent deployment, scaling, or ownership requirements justify distributed services.

### 6.7 Choosing a code structure

| Actual problem | Candidate pattern |
|---|---|
| Stable separation between UI, application, domain, and infrastructure | Layered |
| Capabilities change independently | Feature-based modules |
| Host APIs and external services need isolation | Hexagonal / ports and adapters |
| Domain policy must remain independent of frameworks | Clean Architecture principles |
| Work is delivered as end-to-end user workflows | Vertical slices |
| One deployment with strong internal boundaries | Modular monolith |
| Independent deployment and scaling are necessary | Microservices, only with evidence |

Do not combine every pattern. A project can use feature modules, ports and adapters at selected external boundaries, and a small number of layers inside modules. The resulting design should have one explicit dependency rule and a clear ownership model.

## 7. Documentation information architecture

### 7.1 Diátaxis

**Purpose:** Classifies documentation by the reader's need and the kind of help being provided.

| Type | Reader need | Content |
|---|---|---|
| Tutorial | Learning through a guided experience | A lesson that helps a beginner gain initial competence |
| How-to guide | Completing a task | Steps for a specific real-world goal |
| Reference | Looking up facts | Accurate, structured descriptions of APIs, options, fields, rules, and behavior |
| Explanation | Understanding concepts and context | Background, rationale, architecture, trade-offs, and relationships |

**Strengths:**

- Separates learning from task execution and lookup.
- Helps identify why a page feels confusing: it may mix several content types.
- Provides a useful editorial classification for a large documentation set.

**Limitations:**

- It is not a governance hierarchy.
- A policy or standard may contain reference-like material, but its normative authority must remain clear.
- Some pages legitimately contain more than one content type; classification should improve reader experience, not become a rigid compliance exercise.

**Recommended use:** Apply Diátaxis to explanatory and user-facing technical documentation. Keep the Constitution's authority categories separate.

Official source: [Diátaxis documentation framework](https://diataxis.fr/).

### 7.2 Docs-as-code

**Purpose:** Treat documentation as version-controlled project artifacts, using review, branches, automated checks, and repeatable publishing workflows.

**Strengths:**

- Documentation changes can be reviewed with code changes.
- Links, formatting, required metadata, and generated indexes can be validated automatically.
- History and ownership are visible.
- A change can be linked to an issue, decision, or implementation.

**Limitations:**

- Git does not make documentation correct merely by storing it.
- Automated link checks do not detect semantic contradictions.
- A technically valid build can still publish stale or misleading content.

**Recommended use:** Use repository review and CI to validate document structure, links, identifiers, and traceability. Add semantic review as a separate quality gate.

### 7.3 Progressive disclosure and information hierarchy

Not every reader or agent needs every detail on every task. Organize material into levels:

1. **Entry point:** purpose, scope, authority, and navigation.
2. **Core instructions:** information needed by most readers or workflows.
3. **Detailed reference:** exhaustive rules and technical facts loaded when needed.
4. **Evidence and records:** test results, decisions, exceptions, and historical artifacts.

This avoids turning one file into an index, tutorial, architecture description, and full API encyclopedia simultaneously.

A link is useful only if its label tells the reader what it contains and when to follow it. A pointer that says "see related docs" without a trigger condition creates navigation uncertainty.

### 7.4 Co-location versus duplication

- **Co-location:** Keep a concept's definition, rules, scope, and caveats together so the reader can understand it in one place.
- **Duplication:** Repeat the same authoritative meaning in multiple places.
- **Fragmentation:** Scatter pieces of one concept across multiple sections without a clear canonical location.
- **Progressive disclosure:** Move detailed material behind a clear link when only some readers need it.
- **Single source of truth:** Maintain one authoritative statement and link to it from other contexts.

Co-location is often good; duplication is usually a maintenance risk. Do not confuse the two.

## 8. Decisions, glossary, catalogs, and registers

### 8.1 Architecture Decision Records (ADRs)

Use an ADR when all three conditions hold:

1. The decision is expensive or difficult to reverse.
2. Future maintainers would reasonably ask why the choice was made.
3. The choice resulted from a real trade-off among alternatives.

A concise ADR normally captures:

- Title and status.
- Context and forces.
- Decision.
- Alternatives considered.
- Consequences, including negative consequences.
- Related requirements and evidence.

Do not create an ADR for every implementation detail or routine change. Keep a decision register that links to individual records.

Reference: [Michael Nygard, Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

### 8.2 RFCs and proposals

An RFC is a proposal mechanism for changes that need review before a decision. It is not the same as an ADR:

- RFC: proposes and solicits feedback.
- ADR: records the decision and its rationale.
- Policy/standard: contains the approved normative requirement, if the decision creates one.

After approval, update the authoritative policy or standard. Do not leave the RFC as the only location of an active rule.

### 8.3 Glossary

A glossary should define stable project terminology and distinguish overloaded terms. It should not become a second specification or implementation plan.

A glossary entry should include:

- Canonical term.
- Precise definition.
- Synonyms or prohibited ambiguous alternatives, where useful.
- Related terms.
- Scope note where the term differs from common usage.

Do not repeat implementation details in the glossary. Link to the architecture or standard that defines behavior.

### 8.4 Registers and catalogs

Use structured registers when records need filtering, status tracking, or machine validation:

- Policy rule catalogue.
- Decision register.
- Exception register.
- Violation and remediation register.
- Compatibility register.
- Evidence register.
- Requirements traceability index.

A register is an index or structured record set. It should not become a second prose policy. Each item should link to its authoritative document and evidence.

## 9. Detecting duplication, ambiguity, and conflict

Text similarity is not enough. Two passages can use different words and impose the same obligation, or use similar words while applying to different scopes.

### 9.1 Classification model

| Finding type | Definition | Example |
|---|---|---|
| Exact duplicate | Same wording repeated | Same mandatory sentence copied into two standards |
| Near duplicate | Minor wording differences, same meaning | "must use importModule" versus "imports shall use importModule" |
| Semantic duplicate | Different wording, same obligation | Two sections independently define the same module import rule |
| Partial overlap | Requirements share a subset but are not identical | One rule covers all runtime contexts, another covers only widgets |
| Fragmented requirement | One obligation is split across disconnected passages | Scope in one chapter, exception in another, verification elsewhere |
| Direct contradiction | Two statements cannot both be satisfied in the same scope | One rule requires a feature, another forbids it |
| Conditional conflict | Statements differ because their conditions or contexts are unclear | A WebView rule is incorrectly generalized to the Scriptable host runtime |
| Terminology conflict | Same term has inconsistent meanings | "Module" used for a Scriptable module and a deployment package |
| Stale statement | Once valid, now contradicted by current runtime or repository evidence | Old API or version assumption |
| Unverifiable requirement | No observable verification method exists | "Code must be excellent" |

### 9.2 Review sequence

1. Extract each normative statement without rewriting it.
2. Preserve its source file, heading, and line range.
3. Assign or identify a stable requirement ID.
4. Normalize only for analysis: subject, modal force, action, object, condition, scope, and exception.
5. Compare exact text and near-duplicate wording.
6. Compare semantic obligations and conditions.
7. Check terminology against the glossary.
8. Check parent authority and precedence.
9. Check whether the requirement has verification and evidence.
10. Produce findings for human review before merging, deleting, or consolidating anything.

### 9.3 Suggested requirement representation

A normalized analysis record can use fields such as:

**id, source, heading, subject, modal, action, object, condition, scope, exception, authority, verification, evidence, status**

This representation supports filtering and comparison. It does not replace the authoritative prose until the project approves a structured-requirements workflow.

### 9.4 Automated checks and human review

**Suitable for automation:**

- Duplicate IDs.
- Missing required metadata.
- Broken internal links.
- Orphaned requirements.
- Requirements without verification fields.
- Exact duplicate sentences.
- Similar passages for reviewer triage.
- Missing references to parent authority.
- Unreferenced or superseded records.

**Requires contextual review:**

- Whether two statements mean the same thing.
- Whether two rules conflict under the same runtime condition.
- Whether a difference is intentional.
- Whether a technical claim is still true for a particular Scriptable or iOS version.
- Whether an exception is still justified.

Similarity scores and language-model findings are candidate signals, not proof. Never automatically delete or merge a requirement based only on textual similarity.

## 10. Proposed target structure for this Scriptable repository

The repository already has a Constitution, glossary, governance policies, standards, decision records, exception records, evidence records, and an English translation draft. The structure below is a **target-state option**, not a request to duplicate or recreate those existing artifacts.

    /
    ├── CONSTITUTION.md
    ├── GLOSSARY.md
    ├── README.md
    ├── SECURITY.md
    ├── docs/
    │   ├── governance/
    │   │   ├── policies/
    │   │   ├── standards/
    │   │   ├── procedures/
    │   │   ├── records/
    │   │   │   ├── decisions/
    │   │   │   ├── exceptions/
    │   │   │   ├── violations/
    │   │   │   └── evidence/
    │   │   ├── policy-rules.md
    │   │   └── requirements-traceability.md
    │   ├── architecture/
    │   │   ├── overview.md
    │   │   ├── context.md
    │   │   ├── runtime-model.md
    │   │   ├── module-model.md
    │   │   ├── integration-boundaries.md
    │   │   ├── security-and-trust-boundaries.md
    │   │   ├── quality-attributes.md
    │   │   ├── diagrams/
    │   │   └── decisions/
    │   ├── engineering/
    │   │   ├── javascript/
    │   │   ├── scriptable-apis/
    │   │   ├── javascriptcore/
    │   │   ├── webview/
    │   │   ├── modules/
    │   │   ├── testing/
    │   │   └── examples/
    │   ├── operations/
    │   │   ├── setup/
    │   │   ├── development/
    │   │   ├── release/
    │   │   ├── troubleshooting/
    │   │   └── incident-response/
    │   ├── reference/
    │   │   ├── api-index.md
    │   │   ├── runtime-compatibility.md
    │   │   ├── configuration.md
    │   │   └── external-sources.md
    │   └── research/
    │       ├── software-project-structure-research.md
    │       └── source-register.md
    ├── src/
    │   └── [actual project code organization, selected independently]
    └── tests/
        └── [actual test organization]

### 10.1 How to interpret this tree

- **CONSTITUTION.md** remains the highest normative authority.
- **docs/governance/** contains policies, standards, procedures, and records according to the existing hierarchy.
- **docs/architecture/** explains the system. It does not create new policy.
- **docs/engineering/** contains explanatory material, examples, and detailed technical reference. Normative requirements remain in the approved standards.
- **docs/operations/** contains task-oriented procedures and operational guides.
- **docs/reference/** contains lookup material and links to external authoritative sources.
- **docs/research/** contains non-normative research and analysis.
- **src/** and **tests/** are executable project structures, not documentation categories.

Do not create empty directories just to match this diagram. Create a directory when a real, owned artifact belongs there.

### 10.2 Diátaxis mapping within the repository

| Content type | Likely home |
|---|---|
| Tutorial | docs/engineering/ or a dedicated learning section |
| How-to | docs/operations/ |
| Reference | docs/reference/ and technical reference pages |
| Explanation | docs/architecture/ and explanatory engineering pages |
| Normative policy/standard | docs/governance/, outside the Diátaxis taxonomy |
| Decision record | docs/governance/records/ or the repository's established decision location |
| Glossary | Existing root GLOSSARY.md |

This mapping deliberately preserves the difference between reader intent and normative authority.

## 11. Scriptable-specific architecture concerns to document

The actual system must be verified before these become project-specific claims or mandatory rules. For a Scriptable iOS project, the architecture description should explicitly investigate the following boundaries:

1. **Host and runtime:** Scriptable's JavaScript execution environment, JavaScriptCore behavior, and the actual supported ECMAScript features.
2. **Execution contexts:** main app, widget, Siri/Shortcuts, share sheet, URL scheme, and other contexts only where the project uses them.
3. **Native host APIs:** Scriptable APIs and iOS services exposed to scripts.
4. **Module system:** module entry points, importModule usage, module contracts, dependency direction, and initialization behavior.
5. **WebView boundary:** page context, message bridge, navigation, data transfer, and lifecycle.
6. **External services:** Firebase or other network services, authentication, data contracts, failure modes, and security boundaries.
7. **Persistence:** Keychain, local files, preferences, remote databases, and the authoritative location of each class of data.
8. **Compatibility:** Scriptable version, iOS version, device, execution context, and API availability tuple.
9. **Testing:** static checks, unit tests, mocked host behavior, device tests, and evidence capture.
10. **Release and operations:** packaging, publication, bootstrap/update behavior, monitoring, rollback, and recovery where implemented.

For every boundary, document: purpose, owner, public contract, dependencies, data crossing the boundary, failure behavior, security considerations, and verification method.

Do not assume that browser APIs, Node.js APIs, CommonJS, native modules, or a particular ECMAScript feature are available merely because they exist in another JavaScript runtime. Runtime claims require authoritative Scriptable or Apple documentation and reproducible tests in the declared environment.

## 12. Migration method for the existing Unified Specifications document

The objective is to preserve all approved requirements while improving structure. Do not begin by rewriting paragraphs.

### Phase 1: Inventory and baseline

- Obtain the exact authoritative source document and its approval status.
- Record its version, date, language authority, and scope.
- Extract headings, tables, normative statements, definitions, examples, citations, and appendices.
- Assign a stable source locator to every extracted item.
- Preserve an immutable baseline for comparison.

**Completion criterion:** Every source passage is represented in an inventory with a source locator; no source content has been silently discarded.

### Phase 2: Classify

Classify each passage as one primary type:

- Constitution/governance.
- Policy.
- Standard.
- Atomic requirement.
- Procedure.
- Guideline.
- Architecture description.
- Technical explanation.
- Tutorial/how-to/reference.
- Decision/rationale.
- Glossary term.
- Evidence or external source.
- Historical or superseded content.

Allow cross-links, but assign one canonical home.

**Completion criterion:** Every passage has a primary classification and a proposed canonical destination.

### Phase 3: Detect quality findings

Run separate passes for:

- Exact duplication.
- Near and semantic duplication.
- Direct and conditional contradictions.
- Fragmentation.
- Ambiguous scope and conditions.
- Inconsistent terminology.
- Missing authority.
- Missing verification.
- Stale or unverifiable technical claims.
- Broken or weak citations.

**Completion criterion:** Every finding has its source locations, category, explanation, confidence, and proposed disposition. No automated finding is treated as an approved deletion.

### Phase 4: Design the target information architecture

- Preserve the current normative hierarchy unless a formal governance decision changes it.
- Define the canonical home for each content type.
- Define navigation and cross-link conventions.
- Define requirement IDs and traceability fields.
- Define how external references and evidence are maintained.
- Map every source passage to the proposed destination.

**Completion criterion:** A reviewer can locate every original passage in the proposed structure and can identify the single authoritative home of each normative requirement.

### Phase 5: Review and approve

- Review all proposed merges and removals.
- Resolve conflicting statements through the existing authority process.
- Confirm that translations preserve normative force.
- Verify technical claims against primary sources and the actual runtime.
- Record consequential structural decisions where appropriate.
- Obtain explicit approval before replacing the authoritative specification.

**Completion criterion:** All normative changes have an approval record; unresolved conflicts remain visible and are not silently reconciled.

### Phase 6: Migrate and validate

- Move content in small, reviewable changes.
- Keep stable IDs when the obligation is unchanged.
- Mark superseded requirements explicitly.
- Update links, indexes, and generated views.
- Run structural and link validation.
- Re-run duplication and traceability analysis.
- Compare the migrated content against the baseline.

**Completion criterion:** Every approved source requirement is either preserved at its canonical destination or has an explicit approved supersession/retirement record; no unapproved normative change is introduced.

## 13. Quality gates for the resulting document system

| Gate | Pass condition |
|---|---|
| Authority | Every normative artifact has an authority level and parent relationship |
| Uniqueness | Every active requirement has one canonical statement and stable ID |
| Traceability | Applicable requirements link to architecture, implementation, verification, and evidence |
| Consistency | No unresolved direct contradiction is hidden |
| Terminology | Canonical terms agree with the glossary |
| Scope | Runtime, device, version, and execution-context conditions are explicit where relevant |
| Verifiability | Mandatory requirements have observable verification criteria |
| Navigation | Each document has purpose, scope, owner, status, and useful links |
| Currency | External and runtime claims have source/version/date information |
| Change control | Normative modifications follow the repository's approval process |
| Documentation health | Links, IDs, indexes, and required metadata are checked automatically where feasible |

## 14. Evidence base, confidence, and limitations

### 14.1 Standards and framework sources

The following primary sources define or explain the frameworks used in this paper:

1. [ISO/IEC/IEEE 42010:2022 - Architecture description](https://www.iso.org/standard/74393.html). Normative standard source. The full standard may require purchase; this paper uses the standard's publicly described scope and concepts, not an invented clause-by-clause interpretation.
2. [C4 model](https://c4model.com/). Maintainer documentation for system context, container, component, code, and supplementary diagrams.
3. [arc42](https://arc42.org/overview/). Maintainer overview and template.
4. [Diátaxis](https://diataxis.fr/). Framework maintainer's explanation of tutorial, how-to, reference, and explanation.
5. [AWS Prescriptive Guidance: Hexagonal architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/hexagonal-architectures/). Practitioner guidance for ports and adapters.
6. [NASA Systems Engineering Handbook](https://www.nasa.gov/reference/systems-engineering-handbook/). Systems engineering context for requirements, verification, and traceability.
7. [Michael Nygard: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). Original practitioner article describing lightweight architecture decision records.

### 14.2 Peer-reviewed and research sources surfaced through Consensus

The research search surfaced the following works. Bibliographic details should be checked against the publisher record before being used as formal evidence in an approved policy.

1. Ernst, N. and Robillard, M. P. (2023). **A study of documentation for software architecture.** *Empirical Software Engineering*. DOI: [10.1007/s10664-023-10347-2](https://doi.org/10.1007/s10664-023-10347-2). The reported experiment found no significant association between architecture-document format and performance in the limited architecture-understanding tasks studied; prior exposure to source code was more strongly associated with answer quality. This cautions against assuming that choosing a template alone improves comprehension.
2. Theunissen, T., Van Heesch, U., and Avgeriou, P. (2021). **A mapping study on documentation in Continuous Software Development.** *Information and Software Technology*, 142, 106733. DOI: [10.1016/j.infsof.2021.106733](https://doi.org/10.1016/j.infsof.2021.106733). The study maps documentation subjects and challenges in continuous software development, including synchronization and maintenance.
3. Santos, J. and Correia, F. F. (2020). **A Review of Pattern Languages for Software Documentation.** *European Conference on Pattern Languages of Programs*. DOI: [10.1145/3424771.3424786](https://doi.org/10.1145/3424771.3424786). Relevant to structural patterns and navigation between documentation and program artifacts.
4. Gaie, C., Florat, B., and Morvan, S. (2021). **An architecture as a code framework to manage documentation of IT projects.** *Applied Computing and Informatics*. DOI: [10.1108/aci-12-2020-0159](https://doi.org/10.1108/aci-12-2020-0159). Discusses decomposing project documentation into parts while retaining a coherent documentation location.
5. Nassif, M. and Robillard, M. P. (2024). **Non-Linear Software Documentation with Interactive Code Examples.** *ACM Transactions on Software Engineering and Methodology*. DOI: [10.1145/3702976](https://doi.org/10.1145/3702976). Relevant to adapting documentation detail to reader needs.
6. Gao, H., Treude, C., and Zahedi, M. (2025). **Adapting Installation Instructions in Rapidly Evolving Software Ecosystems.** *IEEE Transactions on Software Engineering*, 51, 1334-1357. DOI: [10.1109/TSE.2025.3552614](https://doi.org/10.1109/TSE.2025.3552614). Relevant to documentation structure changes and the value of consistent section organization.

### 14.3 Evidence categories

- **Recognized standard:** ISO/IEC/IEEE 42010. Normative source for architecture-description concepts.
- **Maintainer frameworks:** C4, arc42, and Diátaxis. Established practitioner frameworks, not substitutes for formal governance standards.
- **Practitioner guidance:** AWS hexagonal architecture and ADR guidance. Useful design practices, not universal requirements.
- **Empirical research:** The cited studies provide observations within their studied samples and methods. They do not prove that one document tree is universally optimal.
- **Project-specific recommendation:** The target structure and migration method in this paper are synthesis and engineering judgment. They require review against the actual source document and repository.

### 14.4 Important limitations and disagreements

1. There is no single universally accepted directory tree for all software projects.
2. A framework can improve consistency and communication, but does not guarantee correctness, comprehension, or synchronization with code.
3. Architecture views overlap. Select the views that address actual stakeholder concerns rather than duplicating C4, arc42, and 4+1 in parallel.
4. Documentation-as-code improves review and automation, but does not itself detect semantic contradiction.
5. Automated semantic analysis can identify candidates, but human review is required to distinguish duplicate obligations from intentionally different scopes or runtime contexts.
6. The cited academic evidence is not a Scriptable-specific controlled evaluation.
7. This research has not yet audited the full content of the document named **Unified Specifications for the Scriptable Project**. Therefore, no claim is made that a particular paragraph is duplicated, contradictory, obsolete, or incorrectly placed.
8. Scriptable, JavaScriptCore, iOS, and host API compatibility claims must be verified separately against official documentation and reproducible tests for the project's declared environment.

## 15. Final recommendation

Use a **layered governance and documentation system**, not one giant specification and not one software architecture pattern imposed on every concern.

1. Preserve the Constitution's authority hierarchy as the single normative precedence model.
2. Make policies and standards the canonical homes of mandatory obligations.
3. Give atomic requirements stable IDs and verification criteria.
4. Keep procedures task-oriented and keep records evidentiary.
5. Describe system design through selected ISO 42010 concepts, a tailored arc42 outline, and C4 diagrams where they add clarity.
6. Use Diátaxis to classify tutorials, how-to guides, reference, and explanation without allowing it to replace governance categories.
7. Keep ADRs for consequential choices and the glossary for terminology only.
8. Organize source code independently, choosing modular boundaries that reflect Scriptable runtime and external-service constraints.
9. Automate structural validation and traceability checks; use human review for semantic duplication and conflicts.
10. Migrate the existing unified specification only after a complete inventory, source mapping, conflict report, and explicit approval.

**The governing design principle is one authoritative home per meaning, with explicit links to every dependent view, implementation, test, and record.** The aim is not simply to make the document shorter. The aim is to make authority unambiguous, requirements verifiable, technical knowledge findable, and future changes safe.

---

## Appendix A. Review checklist for each candidate passage

- [ ] Is this passage normative, explanatory, procedural, evidentiary, or historical?
- [ ] Does it belong to the Constitution, a policy, a standard, a procedure, a record, or a reference?
- [ ] Does it impose one independently verifiable obligation?
- [ ] Does it have a stable identifier if it is a requirement?
- [ ] Is its scope explicit, including runtime and execution context where applicable?
- [ ] Does it duplicate or partially overlap another passage?
- [ ] Does it conflict with a higher-authority rule?
- [ ] Does it use canonical glossary terminology?
- [ ] Is its technical claim supported by an authoritative, current source or reproducible test?
- [ ] Is its verification method clear?
- [ ] Does another document need a link rather than a copied statement?
- [ ] Is it still relevant and current?

## Appendix B. Glossary of structural terms

| Term | Meaning in this paper |
|---|---|
| Architecture description | A structured account of a system's architecture |
| Viewpoint | Conventions for constructing a view that addresses stakeholder concerns |
| View | A representation of architecture from a selected viewpoint |
| Container (C4) | A separately runnable or deployable application or data store within the model, not necessarily a Docker container |
| Component (C4) | A grouping of related functionality behind a responsibility or interface |
| Port | An interface through which the core interacts with the outside |
| Adapter | An implementation that connects an external technology or service to a port |
| Vertical slice | A feature-oriented path through the layers needed to deliver one behavior |
| Traceability | Explicit links among requirements, design, implementation, verification, and evidence |
| Semantic duplication | Different text expressing the same obligation or meaning |
| Fragmentation | One meaning distributed across places without a clear canonical home |
| Progressive disclosure | Presenting core information first and linking to detail when needed |
| Single source of truth | The one authoritative location for a specific meaning or requirement |
| ADR | A record of an architectural decision and its rationale |
| RFC | A proposal circulated for review before a decision |
| Docs-as-code | Managing documentation with version control, review, and automation practices similar to code |

