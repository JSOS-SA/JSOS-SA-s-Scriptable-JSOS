# قاموس المصطلحات الإضافية لخط الأساس الأول

**English title:** Initial Baseline Supplementary Terminology

**الغرض:** حفظ المصطلحات الفريدة الواردة في القاموس الأول والتي لم تكن مدخلة بالاسم الإنجليزي نفسه في القاموس الموحد والموسع.

**العلاقة بالقاموس الموحد:** هذا الملف مكمل للقاموس الموحد والموسع، ولا يعيد إدراج أي مدخل مطابق موجود فيه. المصطلحات المتقاربة لا تُدمج لمجرد التشابه اللفظي، بل يُحافظ على استقلالها متى اختلف معناها التقني.

## المصطلحات الإضافية

| English canonical term | المصطلح العربي | التعريف وقاعدة الاستخدام |
|---|---|---|
| ECMAScript Edition | إصدار ECMAScript | The edition or published revision of the ECMAScript language specification. Do not confuse it with a JavaScript engine version. |
| ECMAScript 2015 / ES6 | ECMAScript 2015 / ES6 | The standardized 2015 edition commonly referred to as ES6. Both labels identify the same edition and must not become separate entries. |
| Runtime Environment | بيئة التشغيل | The environment in which a program executes, including the engine and host-provided facilities. |
| JavaScript Execution Environment | بيئة تنفيذ JavaScript | Apple's descriptive wording for the environment represented by JSContext. It does not establish Scriptable API exposure. |
| Host APIs | واجهات البيئة المضيفة | APIs supplied by the host environment. Do not automatically equate them with Scriptable APIs or Native iOS APIs. |
| Standard Built-in Objects | الكائنات القياسية المضمنة | Objects defined by the ECMAScript language specification and made available by a conforming implementation. |
| Language Feature | ميزة لغوية | A capability defined by the JavaScript language specification, distinct from a host-provided API. |
| Defined Value | قيمة معرّفة | A value specified or established in the relevant context. Do not use it as a synonym for a truthy value. |
| Undefined Value | قيمة غير معرّفة | The JavaScript value undefined. Preserve its distinction from null. |
| Null Value | قيمة فارغة مقصودة | The JavaScript value null. Preserve its distinction from undefined. |
| Application Programming Interface (API) | واجهة برمجة التطبيقات | The expanded form of API. Use at first mention when needed, then use API consistently. |
| HTTP Header | ترويسة HTTP | A metadata field in an HTTP request or response. Do not confuse it with a document heading. |
| File Path | مسار الملف | A path identifying a file-system location. It is not interchangeable with a File URL. |
| File URL | عنوان URL للملف | A URL-form representation identifying a file location. It is not interchangeable with a file-system path. |
| Import a Module | استيراد وحدة | The operation of loading a module into another script. Preserve importModule() when naming Scriptable's API. |
| Module Export | تصدير الوحدة | The value or interface exposed by a module. In Scriptable, distinguish module.exports from ECMAScript export syntax. |
| ECMAScript Modules (ESM) | وحدات ECMAScript | The standardized ECMAScript module system. Do not equate it with Scriptable's importModule() mechanism. |
| CommonJS (CJS) | نظام CommonJS | A module system commonly associated with require() and module.exports. Do not assume Node.js resolution or require() in Scriptable. |
| Direct Dependency | اعتماد مباشر | A dependency referenced directly by a module or project. |
| Transitive Dependency | اعتماد غير مباشر | A dependency introduced through another dependency rather than referenced directly. |
| Module Interface | واجهة الوحدة | The set of values and behavior a module exposes to its importers. |
| Relative Path | مسار نسبي | A path interpreted relative to a defined base location. |
| Absolute Path | مسار مطلق | A path identifying a location from the applicable file-system root or absolute namespace. |
| Compilation Target | الهدف البرمجي للتحويل | The target language version or runtime profile selected for compilation. It does not prove runtime support for every emitted feature. |
| Compilation / Transpilation | التحويل البرمجي | Transformation of source code into output code. Choose the specific term according to the tool operation and context. |
| JavaScript Output | ناتج JavaScript | The JavaScript source emitted by a compiler or transpiler. |
| Static Analysis Tool | أداة التحليل الساكن | A tool that examines source code or project structure without requiring normal program execution. |
| Software Engineering | هندسة البرمجيات | The discipline concerned with systematic specification, design, construction, verification, operation, and maintenance of software. |
| Architectural Layer | طبقة معمارية | A division in software architecture that groups responsibilities and defines permitted dependencies. |
| Software Contract | عقد برمجي | The conditions, guarantees, inputs, outputs, and observable behavior governing interaction with a software interface. |
| Return Value | القيمة المعادة | The value produced by a function or operation and made available to its caller. |
| Function Signature | توقيع الدالة | The identifying name and declared parameters of a function, including type information where available. |
| Resource Management | إدارة الموارد | The controlled acquisition, use, and release of resources such as memory, files, connections, and device facilities. |
| Test Case | حالة اختبار | Defined inputs, preconditions, execution steps, and expected results used to verify a behavior. |
| Compliance | الامتثال | Adherence to applicable rules, policies, or governance requirements. It is not synonymous with compatibility or conformance. |
| Unsupported | غير مدعوم | A status indicating that support has not been established or is explicitly disallowed within a defined scope. It is not synonymous with Incompatible or Not Verified. |
| Removal of Support | إزالة الدعم | Withdrawal of previously provided support. Distinguish it from Deprecation, which does not necessarily mean immediate removal. |
| Engineering Constitution | الدستور الهندسي | The highest-level engineering governance document establishing the project's controlling principles and requirements. |
| Specifications | المواصفات | A collection of defined requirements, constraints, and technical rules. Use Specification for one document or definition. |
| Normative Requirement | متطلب معياري | A requirement establishing an obligation, prohibition, recommendation, or permission. |
| Normative Language | لغة معيارية | Controlled wording expressing the force of requirements, recommendations, prohibitions, and permissions. |
| Enforcement Level | مستوى الإنفاذ | The severity or effect applied when a rule is evaluated, such as blocking, warning, or guidance. |
| Prohibition | الحظر | An explicit rule forbidding an action or condition. |
| Risk Assessment | تقييم المخاطر | Systematic identification and evaluation of risks, including likelihood, impact, and scope. |
| Risk Mitigation | معالجة المخاطر | Actions intended to reduce the likelihood or impact of an identified risk. |
| Corrective Action | الإجراء التصحيحي | An action addressing a detected nonconformity or its cause and preventing recurrence. |
| Traceability | التتبع | The ability to follow relationships among requirements, implementation, tests, evidence, and decisions. |
| Decision Register | سجل القرارات | A controlled record of decisions, rationale, scope, status, and supporting evidence. |
| Auditability | قابلية التدقيق | The ability to inspect and reconstruct actions, decisions, evidence, and outcomes. |
| Change Review | مراجعة التغيير | Review of a proposed change and its impact on requirements, compatibility, evidence, and dependent materials. |
| Version Management | إدارة الإصدارات | Controlled identification and tracking of document, tool, API, and project versions. |
| Single-Owner Responsibility Model | نموذج المسؤولية الفردية | A project-defined model in which one person holds overall responsibility while distinct roles remain conceptually separated. |
| Compatibility Register | سجل التوافق | A project-defined record of compatibility assessments, scope, evidence, and outcomes. |
| Evidence Register | سجل الأدلة | A project-defined index of evidence supporting technical claims, tests, assessments, and decisions. |
| Enforcement Rule | قاعدة الإنفاذ | A project-defined rule specifying how a requirement is evaluated and what consequence follows from a violation. |
| Unresolved Status | حالة غير محسومة | A project-defined status for a question, conflict, or technical point without an approved resolution. |
| Approved Baseline | خط الأساس المعتمد | A project-defined reference state approved for subsequent comparison and controlled change. |
| Target Device Scope | نطاق الأجهزة المستهدفة | The project-defined set of devices to which compatibility and runtime claims are intended to apply. |

## قاعدة الصيانة

1. قبل إضافة مصطلح جديد، ابحث في هذا الملف وفي [القاموس الموحد والموسع](./SCRIPTABLE_ENGINEERING_TERMINOLOGY_GLOSSARY.md).
2. إذا كان المفهوم موجوداً بالفعل، حدّث المدخل الأساسي بدلاً من إنشاء مدخل مكرر.
3. إذا كانت الصياغة الجديدة مرادفاً لمفهوم قائم، أضفها كصيغة بديلة أو ضمن الكلمات التي يجب تجنبها.
4. لا تدمج مصطلحين إذا كان لكل منهما معنى تقني مستقل.
5. لا تحذف مصطلحاً فريداً دون قرار موثق.
