# Scriptable Engineering Specification

# Unified Terminology Glossary

# قاموس المصطلحات الموحد والموسع

**Document purpose:** Establish a controlled terminology system for the English translation and technical documentation of the Scriptable engineering specification.

**Source basis:**

- قواعد ومعايير تطبيق Scriptable ولغة JavaScript وبيئة تشغيلها.
- المراجع الكاملة المتوافقة مع Scriptable iOS.
- Official Scriptable, Apple, ECMAScript, and TypeScript documentation.

**Status:** Expanded terminology baseline. Terms are subject to contextual verification during translation. This document does not authorize starting the translation.

---

# Part I. Scriptable Domain Glossary

## قاموس مجال Scriptable

This section contains concepts specific to the Scriptable application, its execution environments, and its relationship with the underlying technologies.

## 1. Application and execution environment

**Scriptable**

The iOS application that enables users to write and execute JavaScript scripts and interact with application-provided capabilities.

**Avoid:** JavaScript Runtime, Node.js for iOS, Browser-based JavaScript.

**Host Application**

The application that embeds or provides the JavaScript execution environment and determines which application-specific capabilities are exposed to scripts.

**Avoid:** JavaScript Engine, Runtime Engine.

**Host Environment**

The execution environment surrounding JavaScript, including the application-provided APIs and services available to a script.

**Avoid:** JavaScript Language Environment when referring to application-specific capabilities.

**Scriptable Main Runtime**

A project-defined term for the primary Scriptable script execution environment, distinguished from the WebView page environment.

**Avoid:** Browser Runtime, Node.js Runtime.

**Scriptable APIs**

The application-provided programming interfaces exposed to scripts, including APIs for files, networking, device services, user interfaces, and widgets.

**Avoid:** Native iOS APIs, Browser APIs.

**Built-in Scriptable APIs**

A descriptive term for APIs provided directly by the Scriptable application.

**Avoid:** Native APIs when the intended meaning is specifically Scriptable-provided interfaces.

**Native iOS APIs**

Programming interfaces provided by iOS or Apple’s native frameworks. Their existence does not establish that Scriptable exposes them directly to scripts.

**Avoid:** Scriptable APIs, Scriptable Native APIs unless the distinction is explicitly explained.

**Execution Context**

The environment and state in which a JavaScript program or part of it executes.

**Avoid:** JSContext when referring to the general concept rather than Apple’s specific class.

**WebView Environment**

The web-page execution environment hosted by Scriptable’s WebView interface.

**Avoid:** Scriptable Main Runtime.

**WebView Runtime**

A project-defined descriptive label for JavaScript execution within the WebView page context. It is not presented as an official standalone Scriptable product or API name.

**Avoid:** Main Runtime, Scriptable Runtime when the distinction matters.

## 2. Technology boundaries

**JavaScript Language**

The programming language used to write Scriptable scripts.

**Avoid:** ECMAScript Specification when referring to the language itself.

**ECMAScript Standard**

The standardized language specification that defines JavaScript language syntax and semantics.

**Avoid:** JavaScriptCore Standard.

**JavaScriptCore**

Apple’s JavaScript framework and engine used by Scriptable to execute JavaScript.

**Avoid:** Scriptable API, Scriptable Runtime.

**WebView**

Scriptable’s application-provided interface for loading and displaying web content and executing JavaScript within a web-page context.

**Avoid:** Browser, WKWebView API when referring to Scriptable’s exposed interface.

**TypeScript Definitions**

Type declarations used by development tools to describe available types and APIs. They do not create or expose runtime functionality.

**Avoid:** Runtime APIs, Native APIs.

**Runtime API**

An interface or function that is actually available for use during program execution.

**Avoid:** TypeScript Declaration when referring to actual runtime availability.

**Apple Framework API**

An interface documented by Apple for use by applications or developers. Its presence in Apple’s documentation does not prove that Scriptable exposes it to scripts.

**Avoid:** Scriptable API unless independently confirmed.

---

# Part II. Scriptable API Terminology

## مصطلحات واجهات Scriptable

API names, class names, method names, property names, and identifiers must retain their official spelling and capitalization. They must not be translated or transliterated.

## 3. Execution, input, and output APIs

| المصطلح أو الرمز | English canonical form | الاستخدام |
|---|---|---|
| المدخلات | Inputs | البيانات التي تصل إلى السكربت |
| المخرجات | Outputs | النتائج التي ينتجها السكربت |
| مدخلات التشغيل | Execution Inputs | البيانات المرتبطة بسياق التشغيل |
| إعدادات التشغيل | Execution Configuration | إعدادات السياق المتاحة عبر config |
| وسيطات التشغيل | Arguments | القيم التي يستقبلها السكربت |
| args | args | واجهة المدخلات |
| config | config | واجهة إعدادات سياق التشغيل |
| Script | Script | واجهة التحكم في تشغيل السكربت |
| Script.complete() | Script.complete() | الإبلاغ عن اكتمال التنفيذ في السياقات التي تدعم ذلك |
| Notification | Notification | واجهة الإشعارات |
| ShareSheet | ShareSheet | واجهة مشاركة المحتوى |
| CallbackURL | CallbackURL | التكامل عبر آلية x-callback-url |
| URLScheme | URLScheme | التعامل مع روابط تشغيل Scriptable |

**Controlled distinction:**

- **Arguments:** values passed to a function or script.
- **Parameters:** named variables declared in a function definition.
- **Inputs:** broader term for data entering a system or operation.

Do not use these three terms interchangeably.

## 4. File and storage APIs

| المصطلح أو الرمز | English canonical form | الاستخدام |
|---|---|---|
| إدارة الملفات | File Management | تنظيم الملفات وعملياتها |
| نظام الملفات | File System | البنية التي تخزن الملفات والمجلدات |
| مدير الملفات | File Manager | واجهة إدارة الملفات |
| FileManager | FileManager | واجهة Scriptable للملفات |
| التخزين المحلي | Local Storage | التخزين على الجهاز |
| تخزين iCloud | iCloud Storage | التخزين المرتبط بـiCloud |
| تنزيل ملف | File Download | إتاحة ملف iCloud محلياً عند الحاجة |
| المسار | Path | موقع الملف أو المجلد |
| المجلد | Directory | حاوية الملفات |
| النسخ الاحتياطي | Backup | نسخة تحفظ لإمكان الاستعادة |
| النقل | Move | نقل ملف أو مجلد |
| النسخ | Copy | إنشاء نسخة من ملف أو مجلد |
| الحذف | Remove / Delete | إزالة ملف أو عنصر |
| مخزن المفاتيح | Keychain | واجهة تخزين القيم الحساسة |
| البيانات الحساسة | Sensitive Data | البيانات التي تتطلب حماية |
| البيانات الخام | Raw Data | البيانات قبل تحويلها إلى تمثيل أعلى مستوى |
| Data | Data | كائن Scriptable لتمثيل البيانات |
| Path | Path | واجهة التعامل مع المسارات |
| DocumentPicker | DocumentPicker | اختيار الملفات من واجهة النظام |
| UUID | UUID | معرف فريد |

**Terminology distinctions:**

- **File:** ملف.
- **Directory:** مجلد.
- **Path:** مسار.
- **Storage:** تخزين.
- **File System:** نظام الملفات.

لا تستخدم Folder بديلاً موحداً عن Directory في الشرح التقني إلا إذا كان السياق واجهة مستخدم غير تقنية.

## 5. Networking and external services

| المصطلح العربي | English canonical form | ملاحظة |
|---|---|---|
| الشبكات | Networking | مجال الاتصال بالشبكات |
| طلب HTTP | HTTP Request | طلب يرسل عبر بروتوكول HTTP |
| استجابة HTTP | HTTP Response | الاستجابة الناتجة عن الطلب |
| طلب الشبكة | Network Request | مصطلح عام |
| الاتصال الآمن | Secure Connection | اتصال يستخدم وسائل الحماية المناسبة |
| شهادة الخادم | Server Certificate | شهادة هوية الخادم |
| التحقق من الشهادة | Certificate Validation | فحص صلاحية الشهادة |
| مهلة الطلب | Request Timeout | الحد الزمني للطلب |
| إعادة التوجيه | Redirect | تحويل الطلب إلى عنوان آخر |
| رفع البيانات | Data Upload | إرسال البيانات إلى الخادم |
| تنزيل البيانات | Data Download | استلام البيانات من الخادم |
| بيانات متعددة الأجزاء | Multipart Data | بيانات تستخدم بنية Multipart |
| واجهة الطلب | Request API | واجهة Scriptable المسماة Request |
| Request | Request | واجهة تنفيذ طلبات الشبكة |
| allowInsecureRequest | allowInsecureRequest | خاصية مرتبطة بالسماح بطلبات غير آمنة وفق توثيق Scriptable |

**Avoid:** Treating fetch() as a synonym for Scriptable’s Request. They are different API names and must not be substituted for one another.

## 6. Device and iOS services

| المصطلح أو الرمز | English canonical form | الاستخدام |
|---|---|---|
| معلومات الجهاز | Device Information | معلومات الجهاز |
| Device | Device | واجهة معلومات الجهاز |
| الموقع الجغرافي | Geolocation | تحديد الموقع |
| تحديد الموقع | Location Services | خدمات الموقع |
| الإحداثيات | Coordinates | خطوط الطول والعرض |
| خط العرض | Latitude | الإحداثي الجغرافي الشمالي/الجنوبي |
| خط الطول | Longitude | الإحداثي الجغرافي الشرقي/الغربي |
| الارتفاع | Altitude | الارتفاع |
| دقة الموقع | Location Accuracy | دقة القياس |
| الترميز الجغرافي العكسي | Reverse Geocoding | تحويل الإحداثيات إلى وصف مكاني |
| صلاحية الوصول | Access Permission | الإذن الممنوح للوصول إلى مورد |
| رفض الإذن | Permission Denial | رفض الوصول |
| مكتبة الصور | Photo Library | مكتبة صور المستخدم |
| جهات الاتصال | Contacts | بيانات جهات الاتصال |
| التقويم | Calendar | التقويم |
| حدث التقويم | Calendar Event | حدث ضمن التقويم |
| التذكير | Reminder | عنصر تذكير |
| Location | Location | واجهة الموقع |
| Photos | Photos | واجهة الصور |
| ContactsContainer | ContactsContainer | واجهة مجموعات جهات الاتصال |
| ContactsGroup | ContactsGroup | واجهة مجموعة جهات الاتصال |
| Contact | Contact | واجهة جهة الاتصال |
| Calendar | Calendar | واجهة التقويم |
| CalendarEvent | CalendarEvent | واجهة أحداث التقويم |
| Reminder | Reminder | واجهة التذكيرات |

## 7. User interface, widgets, and graphics

| المصطلح العربي | English canonical form |
|---|---|
| واجهة المستخدم | User Interface (UI) |
| واجهة رسومية | Graphical User Interface (GUI) |
| مخرجات مرئية | Visual Output |
| نافذة تنبيه | Alert |
| منتقي التاريخ | Date Picker |
| حقل نص | Text Field |
| جدول | Table |
| صف جدول | Table Row |
| خلية جدول | Table Cell |
| معاينة سريعة | Quick Look |
| متصفح Safari | Safari |
| عرض ويب | Web View |
| أداة مصغرة | Widget |
| مكدس عناصر | Widget Stack |
| عنصر نصي في Widget | Widget Text |
| عنصر صورة في Widget | Widget Image |
| عنصر تاريخ في Widget | Widget Date |
| عنصر مسافة في Widget | Widget Spacer |
| سياق الرسم | Drawing Context |
| تدرج خطي | Linear Gradient |
| رمز نظام | System Symbol |
| مساحة الرسم | Drawing Surface |
| تحديث Widget | Widget Refresh |
| وقت التحديث المطلوب | Requested Refresh Time |
| قيود الذاكرة | Memory Constraints |

**API identifiers to preserve:**

Alert, DatePicker, TextField, UITable, UITableRow, UITableCell, QuickLook, Safari, WebView, ListWidget, WidgetStack, WidgetText, WidgetImage, WidgetDate, WidgetSpacer, DrawContext, Image, Color, Font, LinearGradient, SFSymbol.

## 8. Other Scriptable API families

Keep these identifiers unchanged:

DateFormatter, RelativeDateTimeFormatter, RecurrenceRule, Dictation, Speech, Mail, Message, XMLParser, Pasteboard, Timer, Point, Rect, Size.

**Related terminology:**

| المصطلح العربي | English canonical form |
|---|---|
| تنسيق التاريخ | Date Formatting |
| قاعدة التكرار | Recurrence Rule |
| الإملاء الصوتي | Dictation |
| تحويل النص إلى كلام | Text-to-Speech |
| البريد | Mail |
| الرسائل | Messages |
| تحليل XML | XML Parsing |
| الحافظة | Clipboard |
| مؤقت | Timer |
| نقطة | Point |
| مستطيل | Rectangle |
| حجم | Size |

---

# Part III. JavaScript and ECMAScript Terminology

## مصطلحات اللغة والمعيار

These terms are general programming concepts. They belong in the translation termbase, not in the Scriptable-specific domain glossary.

## 9. Language fundamentals

| المصطلح العربي | English canonical form | ملاحظة |
|---|---|---|
| لغة البرمجة | Programming Language | |
| القواعد النحوية | Syntax | قواعد بناء الشيفرة |
| دلالات اللغة | Language Semantics | معنى التعليمات وسلوكها |
| المعرّف | Identifier | اسم متغير أو دالة أو رمز |
| المتغير | Variable | |
| الثابت | Constant | اسم لا يعاد إسناده |
| التعبير | Expression | ينتج قيمة |
| التعليمة | Statement | تعليمة برمجية |
| الدالة | Function | |
| الكائن | Object | |
| المصفوفة | Array | |
| الفئة | Class | |
| المُنشئ | Constructor | |
| الاستثناء | Exception | |
| الوعد | Promise | تمثيل نتيجة عملية غير متزامنة |
| القيمة | Value | |
| النوع | Type | |
| نوع البيانات | Data Type | |
| نوع بدائي | Primitive Type | |
| نوع مرجعي | Reference Type | يستخدم عند ملاءمته للسياق |
| سلسلة نصية | String | |
| رقم | Number | |
| قيمة منطقية | Boolean | |
| قيمة غير معرّفة | Undefined | |
| قيمة فارغة | Null | |
| عدد صحيح كبير | BigInt | |
| رمز فريد | Symbol | |
| نطاق | Scope | |
| نطاق كتلي | Block Scope | |
| نطاق دالة | Function Scope | |
| إعادة الإسناد | Reassignment | |
| قابلية التغيير | Mutability | |
| عدم القابلية للتغيير | Immutability | |

**Important distinctions:**

- Constant does not mean that the contents of an object are immutable.
- Undefined and Null are distinct JavaScript values.
- Expression and Statement are not interchangeable.
- Class syntax does not imply a class model identical to that of other programming languages.

## 10. Control flow and functions

| المصطلح العربي | English canonical form |
|---|---|
| تدفق التنفيذ | Control Flow |
| اتخاذ القرار | Decision Making |
| شرط | Condition |
| حلقة تكرار | Loop |
| تكرار | Iteration |
| إيقاف الحلقة | Break |
| تخطي التكرار الحالي | Continue |
| إرجاع قيمة | Return a Value |
| دالة سهمية | Arrow Function |
| دالة من الدرجة الأولى | First-Class Function |
| تمرير دالة | Function Passing |
| إرجاع دالة | Function Return |
| دالة نقية | Pure Function |
| دالة مساعدة | Utility Function |
| دالة قابلة لإعادة الاستخدام | Reusable Function |
| سلسلة النموذج الأولي | Prototype Chain |
| الوراثة | Inheritance |
| خاصية | Property |
| طريقة / أسلوب | Method |
| استدعاء دالة | Function Call |
| معامل | Argument |
| معامل شكلي | Parameter |

## 11. Error handling and asynchronous programming

| المصطلح العربي | English canonical form |
|---|---|
| معالجة الأخطاء | Error Handling |
| اكتشاف الخطأ | Error Detection |
| سبب الخطأ | Error Cause |
| رفض Promise | Promise Rejection |
| تسوية Promise | Promise Settlement |
| عملية غير متزامنة | Asynchronous Operation |
| تنفيذ غير متزامن | Asynchronous Execution |
| تنفيذ متزامن | Synchronous Execution |
| انتظار | Awaiting |
| دالة غير متزامنة | Async Function |
| سلسلة Promise | Promise Chain |
| معالجة الرفض | Rejection Handling |
| إعادة المحاولة | Retry |
| سياسة إعادة المحاولة | Retry Policy |
| تنفيذ متكرر | Repeated Execution |
| عملية ذات آثار جانبية | Side-effecting Operation |

**Terminology rule:** Use Asynchronous for the execution model and Non-blocking only when the technical context specifically establishes non-blocking behavior. Do not treat them as automatic synonyms.

## 12. ECMAScript standards and conformance

| المصطلح العربي | English canonical form |
|---|---|
| مواصفة ECMAScript | ECMAScript Specification |
| معيار ECMAScript | ECMAScript Standard |
| إصدار اللغة | Language Edition |
| الإصدار السادس | Sixth Edition |
| التوافق مع المعيار | Standards Conformance |
| تنفيذ متوافق | Conforming Implementation |
| بيئة مضيفة | Host Environment |
| تنفيذ المضيف | Host Implementation |
| الكائنات القياسية | Standard Objects |
| المكررات | Iterators |
| المكررات غير المتزامنة | Async Iterators |
| العمليات المجردة | Abstract Operations |
| الاختبار المعياري | Conformance Testing |
| اختبار المطابقة | Conformance Test |
| مجموعة الاختبارات | Test Suite |
| اختبار Test262 | Test262 Test |
| محرك JavaScript | JavaScript Engine |

**Version control rule:**

Do not silently change a source reference from ECMAScript 2026 to another edition. Record version differences in the terminology and source discrepancy log.

---

# Part IV. JavaScriptCore and Apple Terminology

## مصطلحات إطار Apple

## 13. JavaScriptCore concepts

| المصطلح العربي | English canonical form | المرجع |
|---|---|---|
| إطار JavaScriptCore | JavaScriptCore Framework | Apple JavaScriptCore |
| سياق JavaScript | JavaScript Context | مفهوم عام |
| JSContext | JSContext | Apple class |
| قيمة JavaScript | JavaScript Value | مفهوم عام |
| JSValue | JSValue | Apple class |
| آلة افتراضية | Virtual Machine | مفهوم عام |
| JSVirtualMachine | JSVirtualMachine | Apple class |
| قيمة مُدارة | Managed Value | مفهوم عام |
| JSManagedValue | JSManagedValue | Apple class |
| بروتوكول التصدير | Export Protocol | مفهوم عام |
| JSExport | JSExport | Apple protocol |
| كائن أصلي | Native Object | كائن من البيئة الأصلية |
| واجهة C | C API | واجهة لغة C |
| إدارة الذاكرة | Memory Management | |
| الاحتفاظ بالقيمة | Value Retention | |
| الربط بين البيئات | Bridging | بحسب السياق |

**Mandatory boundary:** These Apple framework types describe APIs available to application developers using JavaScriptCore. They must not be presented as directly available Scriptable script globals unless Scriptable documentation explicitly confirms that availability.

---

# Part V. WebView Terminology

## مصطلحات WebView

## 14. Web technologies and page context

| المصطلح العربي | English canonical form |
|---|---|
| محتوى الويب | Web Content |
| صفحة ويب | Web Page |
| مستند HTML | HTML Document |
| نموذج كائن المستند | Document Object Model (DOM) |
| كائن المستند | document |
| كائن النافذة | window |
| شجرة DOM | DOM Tree |
| سياق صفحة الويب | Web Page Context |
| بيئة المتصفح | Browser Environment |
| واجهات المتصفح | Browser APIs |
| تحميل HTML | HTML Loading |
| تحميل ملف | File Loading |
| تحميل عنوان URL | URL Loading |
| تحميل طلب | Request Loading |
| تنفيذ JavaScript | JavaScript Evaluation |
| استخراج HTML | HTML Retrieval |
| انتظار اكتمال التحميل | Waiting for Load Completion |
| عرض WebView | WebView Presentation |
| السماح بالطلب | Request Authorization |
| طلب التنقل | Navigation Request |
| سياسة السماح بالطلب | Request Allowance Policy |
| صفحة مضيفة | Host Page |
| آلية الإكمال | Completion Handler |
| دالة الإكمال | Completion Callback |

## 15. WebView API identifiers

Keep these identifiers unchanged:

- shouldAllowRequest
- new WebView()
- loadHTML()
- loadFile()
- loadURL()
- loadRequest()
- evaluateJavaScript()
- getHTML()
- present()
- waitForLoad()

**Reference rule:** Use the official Scriptable WebView documentation as the direct source for Scriptable WebView APIs. Apple WKWebView documentation is supplementary technical context only.

---

# Part VI. TypeScript and Development Tooling

## مصطلحات TypeScript وأدوات التطوير

## 16. TypeScript terminology

| المصطلح العربي | English canonical form |
|---|---|
| نظام الأنواع | Type System |
| فحص الأنواع | Type Checking |
| فحص ساكن | Static Checking |
| تحليل ساكن | Static Analysis |
| تعريف النوع | Type Declaration |
| ملف تصريحات | Declaration File |
| ملف تعريف | Definition File |
| تعريف واجهة | Interface Declaration |
| تعريف عام | Global Declaration |
| تعريف وحدة | Module Declaration |
| نوع عام | Generic Type |
| نوع واجهة | Interface Type |
| تعريفات مكتبة | Library Definitions |
| تعريفات DOM | DOM Definitions |
| تعريفات قياسية | Standard Library Definitions |
| مترجم TypeScript | TypeScript Compiler |
| تحويل الشيفرة | Code Transpilation |
| شيفرة ناتجة | Emitted JavaScript |
| إعدادات المترجم | Compiler Options |
| مستوى JavaScript المستهدف | JavaScript Target |
| مكتبات الأنواع | Type Libraries |
| فحص صارم | Strict Type Checking |
| منع الإخراج | No Emit |
| وقت التطوير | Development Time |
| وقت التشغيل | Runtime |

## 17. TypeScript configuration identifiers

Keep these identifiers unchanged:

- target
- lib
- types
- strict
- noEmit
- include
- compilerOptions
- declare
- .d.ts

**Mandatory distinction:**

- **target** controls the JavaScript language output level and related transformations.
- **lib** controls the library declaration files available to the TypeScript type checker.
- **types** controls which type packages are included in the global scope.

Do not describe these options as runtime feature switches.

## 18. TypeScript ecosystem terminology

| المصطلح العربي | English canonical form |
|---|---|
| تعريفات مجتمعية | Community-maintained Definitions |
| تعريفات غير رسمية | Unofficial Definitions |
| مستودع التعريفات | Definitions Repository |
| حزمة npm | npm Package |
| سجل npm | npm Registry |
| مشروع توليد التعريفات | Definition Generator Project |
| ملفات الاختبار | Test Files |
| اختبارات التعريفات | Definition Tests |
| ملفات التوليد | Generation Files |
| قالب التصريحات | Declaration Template |
| مخرجات التوليد | Generated Output |
| الاعتماديات | Dependencies |
| الاعتماديات المباشرة | Direct Dependencies |
| ترخيص الحزمة | Package License |
| ترخيص المستودع | Repository License |
| المصدر المنشور | Published Source |
| إصدار الحزمة | Package Version |

**Avoid:** Treating schl3ck/ios-scriptable-types and @types/scriptable-ios as the same project or package. They are related but distinct artifacts.

---

# Part VII. Engineering Quality and Architecture

## مصطلحات الجودة والهندسة والمعمارية

## 19. Code quality

| المصطلح العربي | English canonical form |
|---|---|
| جودة الشيفرة | Code Quality |
| معايير كتابة الشيفرة | Coding Standards |
| توافق اللغة | Language Compatibility |
| توافق الواجهات | API Compatibility |
| توافق سياق التشغيل | Context Compatibility |
| التوافق الفعلي | Runtime Compatibility |
| قابلية الصيانة | Maintainability |
| قابلية القراءة | Readability |
| قابلية الاختبار | Testability |
| قابلية إعادة الاستخدام | Reusability |
| قابلية التوسع | Scalability |
| التعقيد | Complexity |
| التعقيد السيكلوماتيكي | Cyclomatic Complexity |
| تكرار الشيفرة | Code Duplication |
| الشيفرة المكررة | Duplicated Code |
| الشيفرة غير المستخدمة | Unused Code |
| الشيفرة الميتة | Dead Code |
| الرمز غير المستخدم | Unused Symbol |
| الاعتماد الدائري | Circular Dependency |
| الترابط | Coupling |
| التماسك | Cohesion |
| المسؤولية الواحدة | Single Responsibility |
| النمط البرمجي | Programming Pattern |
| القيم السحرية | Magic Values |
| النصوص السحرية | Magic Strings |
| إزالة الشيفرة غير المستخدمة | Dead Code Elimination |
| إعادة الهيكلة | Refactoring |
| مراجعة الشيفرة | Code Review |

**Important distinctions:**

- Dead Code: code that cannot be reached or used within the relevant analysis model.
- Unused Code: code for which no usage is detected.
- Duplicated Code: repeated code fragments.
- Circular Dependency: a dependency relationship that forms a cycle.

Do not collapse these findings into one generic term.

## 20. Project architecture

| المصطلح العربي | English canonical form |
|---|---|
| معمارية البرمجيات | Software Architecture |
| معمارية المشروع | Project Architecture |
| بنية المشروع | Project Structure |
| وحدة برمجية | Module |
| تقسيم إلى وحدات | Modularization |
| طبقة | Layer |
| طبقة الخدمات | Services Layer |
| طبقة البيانات | Data Layer |
| طبقة الواجهات | UI Layer |
| الطبقة الأساسية | Core Layer |
| طبقة الخصائص | Features Layer |
| طبقة الاختبارات | Tests Layer |
| منطق الأعمال | Business Logic |
| مصدر البيانات | Data Source |
| مستودع البيانات | Repository |
| التحقق من البيانات | Data Validation |
| مخطط البيانات | Data Schema |
| عقد الواجهة | Interface Contract |
| عقد الوحدة | Module Contract |
| عقد البيانات | Data Contract |
| حدود المعمارية | Architecture Boundaries |
| قاعدة الاعتماد | Dependency Rule |
| اتجاه الاعتماد | Dependency Direction |
| نقطة الدخول | Entry Point |
| ملف التشغيل الرئيسي | Main Entry File |
| وحدة مستقلة | Independent Module |
| وحدة مشتركة | Shared Module |
| اعتماد متبادل | Mutual Dependency |
| فصل المسؤوليات | Separation of Responsibilities |
| فصل الاهتمامات | Separation of Concerns |
| عزل المنطق | Logic Isolation |

**Architecture terminology rule:** Use Layer for an architectural layer and Module for a separately organized code unit. Do not use them interchangeably.

## 21. Data quality and contracts

| المصطلح العربي | English canonical form |
|---|---|
| جودة البيانات | Data Quality |
| بيانات خارجية | External Data |
| بيانات غير موثوقة | Untrusted Data |
| بنية الاستجابة | Response Structure |
| مخطط الاستجابة | Response Schema |
| قيمة مفقودة | Missing Value |
| قيمة غير صالحة | Invalid Value |
| التحقق من المدخلات | Input Validation |
| التحقق من المخرجات | Output Validation |
| تطابق البنية | Structural Conformance |
| عقد البيانات | Data Contract |
| عقد الواجهة | Interface Contract |
| مصدر الحقيقة | Source of Truth |
| مصدر موثوق | Authoritative Source |
| أثر جانبي | Side Effect |
| حالة البرنامج | Program State |
| اتساق البيانات | Data Consistency |

**Validation and Verification distinction:**

- **Validation:** determining whether something is suitable, valid, or fit for its intended purpose.
- **Verification:** determining whether something conforms to specified requirements.

Use the appropriate term according to the actual activity. Do not translate both automatically as «التحقق».

## 22. Testing and verification

| المصطلح العربي | English canonical form |
|---|---|
| الاختبار | Testing |
| التحقق | Verification / Validation بحسب السياق |
| اختبار الوحدة | Unit Testing |
| اختبار التكامل | Integration Testing |
| اختبار وقت التشغيل | Runtime Testing |
| اختبار السياق | Context Testing |
| اختبار الجهاز | Device Testing |
| اختبار الصلاحيات | Permission Testing |
| اختبار الشبكة | Network Testing |
| اختبار الملفات | File System Testing |
| فحص الصياغة | Syntax Checking |
| التحليل الثابت | Static Analysis |
| فحص الأنواع | Type Checking |
| اختبار المنطق | Logic Testing |
| اختبار المطابقة | Conformance Testing |
| اختبار التوافق | Compatibility Testing |
| اختبار الانحدار | Regression Testing |
| اختبار ميزة | Feature Test |
| اختبار مصغر | Minimal Test |
| نتيجة الاختبار | Test Result |
| دليل الاختبار | Test Evidence |
| مصفوفة التوافق | Compatibility Matrix |
| سجل التوافق | Compatibility Record |
| حالة الاختبار | Test Status |
| غير مختبر | Not Tested |
| ناجح | Passed |
| فاشل | Failed |
| نطاق الاختبار | Test Scope |
| تغطية الاختبارات | Test Coverage |

## 23. Tooling terminology

| الأداة | الاسم الإنجليزي المعتمد | الوصف الاصطلاحي |
|---|---|---|
| TypeScript Compiler | TypeScript Compiler | فحص الأنواع وتحويل الشيفرة وفق الإعدادات |
| ESLint | ESLint | أداة تحليل وفحص قواعد الشيفرة |
| Prettier | Prettier | أداة تنسيق الشيفرة |
| Test262 | Test262 | مجموعة اختبارات مطابقة ECMAScript |
| Fallow | Fallow | أداة تحليل بنية مشاريع JavaScript وTypeScript |
| Node.js | Node.js | بيئة تشغيل JavaScript مستقلة عن Scriptable |
| Babel | Babel | أداة تحويل JavaScript |
| GitHub Actions | GitHub Actions | أتمتة سير العمل والاختبارات في GitHub |

**Fallow terminology:**

- **Codebase Analysis:** تحليل قاعدة الشيفرة.
- **Dead Code Analysis:** تحليل الشيفرة غير المستخدمة.
- **Duplication Analysis:** تحليل التكرار.
- **Complexity Analysis:** تحليل التعقيد.
- **Dependency Graph:** مخطط الاعتماديات.
- **Architecture Analysis:** تحليل المعمارية.
- **Boundary Violations:** مخالفات حدود المعمارية.

**Source:** https://fallow.tools/docs/analysis/

Do not describe Fallow as a replacement for runtime testing or as proof that a Scriptable API exists.

---

# Part VIII. Runtime Contexts, Security, and Reliability

## مصطلحات التشغيل والأمان والموثوقية

## 24. Execution contexts

| المصطلح العربي | English canonical form |
|---|---|
| سياق التشغيل | Execution Context |
| التشغيل داخل التطبيق | In-App Execution |
| تشغيل Widget | Widget Execution |
| تشغيل Shortcuts | Shortcuts Execution |
| تشغيل Siri | Siri Execution |
| ورقة المشاركة | Share Sheet |
| تشغيل عبر رابط | URL Scheme Execution |
| سياق قصير العمر | Short-Lived Execution Context |
| دورة حياة التنفيذ | Execution Lifecycle |
| اكتمال التنفيذ | Execution Completion |
| قيود التنفيذ | Execution Constraints |
| حدود الذاكرة | Memory Limits |
| استهلاك الذاكرة | Memory Consumption |
| حجم البيانات | Data Size |
| إنهاء العملية | Process Termination |
| تحديث مجدول | Scheduled Refresh |
| وقت التحديث | Refresh Time |

**Context rule:** A successful execution in the Scriptable app does not prove successful execution in a Widget, Shortcut, Share Sheet, or WebView.

## 25. Security and privacy

| المصطلح العربي | English canonical form |
|---|---|
| الأمان | Security |
| الخصوصية | Privacy |
| أمن البيانات | Data Security |
| حماية البيانات | Data Protection |
| إدارة الأسرار | Secrets Management |
| كلمة مرور | Password |
| رمز وصول | Access Token |
| مفتاح خدمة | Service Key |
| بيانات اعتماد | Credentials |
| تخزين آمن | Secure Storage |
| اتصال مشفر | Encrypted Connection |
| شهادة غير صالحة | Invalid Certificate |
| التحقق من HTTPS | HTTPS Certificate Validation |
| مدخلات المستخدم | User Input |
| التحقق من المدخلات | Input Validation |
| شيفرة خارجية | External Code |
| شيفرة غير موثوقة | Untrusted Code |
| تنفيذ ديناميكي للشيفرة | Dynamic Code Execution |
| تسجيل السجلات | Logging |
| سجل التنفيذ | Execution Log |
| تسريب الأسرار | Secret Leakage |
| مبدأ أقل صلاحية | Principle of Least Privilege |
| صلاحيات النظام | System Permissions |
| رفض الصلاحية | Permission Denial |
| بيانات شخصية | Personal Data |
| بيانات الموقع | Location Data |
| بيانات الصور | Photo Data |
| بيانات جهات الاتصال | Contacts Data |

**Security distinctions:**

- **Authentication:** إثبات هوية المستخدم أو النظام.
- **Authorization:** تحديد ما يسمح للهوية بالوصول إليه.
- **Permission:** إذن للوصول إلى مورد أو قدرة.
- **Credential:** معلومة تستخدم لإثبات الهوية أو منح الوصول.
- **Secret:** قيمة حساسة يجب حمايتها.

Do not use these terms as synonyms.

## 26. Reliability and operational behavior

| المصطلح العربي | English canonical form |
|---|---|
| الموثوقية | Reliability |
| الاستقرار | Stability |
| تحمل الفشل | Fault Tolerance |
| حالة الفشل | Failure State |
| انقطاع الاتصال | Connection Interruption |
| فشل الشبكة | Network Failure |
| معالجة الفشل | Failure Handling |
| إعادة المحاولة | Retry |
| تكرار العملية | Operation Repetition |
| عملية قابلة للتكرار بأمان | Idempotent Operation |
| مهلة زمنية | Timeout |
| استعادة الحالة | State Recovery |
| النسخ الاحتياطي | Backup |
| فقدان البيانات | Data Loss |
| سلامة البيانات | Data Integrity |

---

# Part IX. References, Research, and Evidence

## مصطلحات المراجع والبحث والأدلة

## 27. Source authority and documentation

| المصطلح العربي | English canonical form |
|---|---|
| مصدر مرجعي | Reference Source |
| مصدر رسمي | Official Source |
| مصدر أساسي | Primary Source |
| مصدر ثانوي | Secondary Source |
| توثيق رسمي | Official Documentation |
| مرجع معياري | Standards Reference |
| مرجع تقني | Technical Reference |
| مرجع جامع | Comprehensive Reference |
| فهرس الواجهات | API Index |
| صفحة المرجع | Reference Page |
| قسم داخلي | Section Anchor |
| رابط مباشر | Direct URL |
| رابط داخلي | In-page Anchor |
| مصدر الحقيقة | Source of Truth |
| أولوية المرجع | Source Authority |
| سلطة المصدر | Source Authority |
| دليل موثق | Documented Evidence |
| دليل تجريبي | Experimental Evidence |
| دليل غير مباشر | Indirect Evidence |
| ادعاء غير مثبت | Unverified Claim |
| نقطة غير محسومة | Unresolved Point |
| تعارض المصادر | Source Conflict |
| اختلاف الإصدارات | Version Discrepancy |
| تاريخ التحقق | Verification Date |
| سجل المصادر | Source Register |

## 28. Community research

| المصطلح العربي | English canonical form |
|---|---|
| مستودع مجتمعي | Community Repository |
| مستودع عام | Public Repository |
| مستودع GitHub | GitHub Repository |
| دراسة المستودعات | Repository Study |
| تحليل المستودعات | Repository Analysis |
| بيانات لقطة | Snapshot Data |
| بيانات مباشرة | Live Data |
| عدد النجوم | Star Count |
| شعبية المشروع | Project Popularity |
| نشاط المستودع | Repository Activity |
| آخر دفع | Last Push |
| اتجاهات المجتمع | Community Trends |
| إعادة الاستخدام | Reuse |
| مكونات قابلة لإعادة الاستخدام | Reusable Components |
| أمثلة عملية | Practical Examples |
| ممارسات المجتمع | Community Practices |

**Evidence rule:** Repository popularity, stars, and activity do not establish code quality, security, or compatibility.

---

# Part X. Source-of-Truth and Compatibility Model

## نموذج مصدر الحقيقة والتوافق

## 29. Authority model

| السؤال | المصطلح الإنجليزي المعتمد للمصدر |
|---|---|
| ما قواعد JavaScript؟ | ECMAScript Language Specification |
| ما الذي يحدده المعيار؟ | Language Standard |
| ما الذي ينفذه JavaScriptCore؟ | JavaScriptCore Engine Capabilities |
| ما واجهات Scriptable المتاحة؟ | Official Scriptable API Documentation |
| كيف تعمل الوحدات؟ | Scriptable Module System |
| كيف يعمل WebView؟ | Scriptable WebView Documentation |
| ما أنواع الواجهات في المحرر؟ | TypeScript Definitions |
| هل تعمل الشيفرة على الجهاز؟ | Device Runtime Verification |
| هل تحافظ الشيفرة على الجودة؟ | Static Analysis and Testing |

## 30. Four independent compatibility dimensions

**Language Compatibility**

Compatibility of JavaScript syntax and standardized language features with the JavaScript engine and the target execution environment.

**Avoid:** API Compatibility.

**Host API Compatibility**

Confirmation that an API is provided by the host application and is used according to its documented contract.

**Avoid:** Language Compatibility.

**Context Compatibility**

Confirmation that a feature works in the intended execution context, such as Scriptable Main Runtime, Widget, or WebView.

**Avoid:** Device Compatibility when only the execution context was tested.

**Device Verification**

Evidence that the feature was tested on the target device, application version, and iOS version.

**Avoid:** General Compatibility Claim without a defined test scope.

## 31. Compatibility and evidence status

| المصطلح العربي | English canonical form |
|---|---|
| متوافق | Compatible |
| غير متوافق | Incompatible |
| متوافق جزئياً | Partially Compatible |
| متوافق وفق الاختبار | Verified Compatible |
| غير مثبت التوافق | Compatibility Not Established |
| مدعوم رسمياً | Officially Supported |
| موثق | Documented |
| غير موثق | Undocumented |
| مهمل | Deprecated |
| غير متاح | Unavailable |
| غير مختبر | Not Tested |
| نتيجة مؤكدة | Confirmed Result |
| استنتاج | Inference |
| افتراض | Assumption |
| دليل | Evidence |
| إثبات | Proof / Demonstration بحسب السياق |
| سجل التوافق | Compatibility Record |
| نطاق التوافق | Compatibility Scope |

**Mandatory wording rule:** Never translate an untested feature as Supported or Compatible. Use Not Tested or Compatibility Not Established where appropriate.

---

# Part XI. Controlled Translation Rules

## قواعد ضبط الترجمة

## 32. Standardized English equivalents

| المصطلح العربي | المقابل المعتمد |
|---|---|
| يجب | MUST / must بحسب السياق المعياري |
| يجب ألا | MUST NOT / must not |
| ينبغي | SHOULD / should |
| لا ينبغي | SHOULD NOT / should not |
| يجوز | MAY / may |
| متطلب إلزامي | Mandatory Requirement |
| متطلب موصى به | Recommended Requirement |
| خيار مسموح | Permitted Option |
| قاعدة | Rule |
| معيار | Standard |
| سياسة | Policy |
| إجراء | Procedure |
| توجيه | Guideline |
| استثناء | Exception |
| نطاق الاستثناء | Exception Scope |
| سبب الاستثناء | Exception Rationale |
| صلاحية الاستثناء | Exception Validity Period |
| اعتماد | Approval / Adoption بحسب السياق |
| اعتماد نهائي | Final Approval |
| مراجعة | Review |
| مراجعة تقنية | Technical Review |
| مراجعة الأمانة | Fidelity Review |
| اكتمال | Completeness |
| دقة | Accuracy |
| سلامة المعنى | Semantic Fidelity |

**Normative wording rule:**

The uppercase forms MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are reserved for explicitly normative requirements when the source intends that level of obligation.

Do not uppercase ordinary verbs merely to make them look normative.

Do not claim RFC 2119 or RFC 8174 compliance unless the source specification explicitly adopts those conventions.

## 33. Terms requiring contextual review

These Arabic terms can have more than one English equivalent. The translator must select the correct equivalent based on the sentence and technical context.

| المصطلح العربي | الخيارات الإنجليزية | قاعدة الاختيار |
|---|---|---|
| بيئة | Environment / Context | Environment للبيئة التقنية، Context لسياق التنفيذ |
| سياق | Context / Execution Context | يحدد بحسب المقصود |
| واجهة | Interface / API / UI | API للواجهة البرمجية، UI للواجهة المرئية |
| أصلي | Native / Built-in | Native لواجهات النظام، Built-in لما يدمجه التطبيق |
| تحقق | Verification / Validation / Checking | يحدد بحسب نوع الفحص |
| اعتماد | Approval / Adoption / Dependency | موافقة، اعتماد معيار، أو اعتماد برمجي |
| تشغيل | Execution / Runtime / Operation | عملية التنفيذ أو بيئة التشغيل أو العملية |
| وحدة | Module / Unit | وحدة برمجية أو وحدة اختبار |
| مكوّن | Component | عنصر معماري أو مكوّن واجهة |
| مصدر | Source / Reference / Origin | مصدر بيانات أو مرجع أو منشأ |
| دعم | Support / Compatibility | الدعم الرسمي أو التوافق المثبت |
| إدارة | Management / Handling | إدارة مورد أو معالجة حالة |
| معالجة | Processing / Handling | معالجة بيانات أو التعامل مع حالة |
| بنية | Structure / Architecture | بنية داخلية أو معمارية نظام |
| نتيجة | Result / Output | نتيجة عملية أو مخرجات برنامج |

---

# Part XII. Section-to-Glossary Coverage

## ربط القاموس بأقسام الوثيقة الأصلية

| القسم الأصلي | المجال الاصطلاحي الذي يجب استخدامه |
|---|---|
| 1. التعريف الدقيق: ما هو Scriptable؟ | Scriptable Domain, Host Environment, Scriptable APIs |
| 2. النموذج الذهني | Technology Boundaries, JavaScript, ECMAScript, JavaScriptCore, WebView, TypeScript |
| 3. كيف يعمل Scriptable من الداخل؟ | Execution Model, JavaScriptCore, Apple Framework Terminology |
| 4. JavaScript | Language Fundamentals, Data Types, Functions, Objects, Async Programming |
| 5. معيار ECMAScript | Standards, Editions, Conformance, Test262 |
| 6. واجهات Scriptable | Scriptable API Families, Input/Output, Storage, Networking, Device, UI, Widgets |
| 7. نظام الوحدات | Modules, Imports, Exports, Module Resolution, Dependencies |
| 8. Main Runtime وWebView | Execution Contexts, DOM, Browser APIs, WebView API |
| 9. TypeScript | Type System, Declaration Files, Compiler Options, npm, DefinitelyTyped |
| 10. جودة JavaScript | Coding Standards, Compatibility, Error Handling, Security, Performance, Maintainability |
| 11. المعمارية | Software Architecture, Layers, Modules, Contracts, Dependency Direction |
| 12. سياقات التشغيل | Execution Contexts, Lifecycle, Permissions, Memory Constraints |
| 13. الفحص والاختبار | Static Analysis, Type Checking, Unit Testing, Integration Testing, Runtime Testing |
| 14. إثبات التوافق | Feature Verification, Compatibility, Evidence, Test Records |
| 15. الأمان والموثوقية | Secrets, HTTPS, Permissions, Privacy, Reliability |
| 16. المصادر المرجعية | Official Documentation, Source Authority, Reference Hierarchy |
| 17. دراسة مستودعات المجتمع | Repository Research, Snapshot Data, Popularity, Community Practices |
| 18. مصدر الحقيقة | Source of Truth, Authority Model, Evidence |
| 19. التعريف النهائي | Canonical Definition, Technical Description |
| 20. المعيار الهندسي | Language Compatibility, Host API Compatibility, Context Compatibility, Device Verification |

---

# Part XIII. Reference Register

## سجل المراجع الاصطلاحية

The following references are used to verify terminology. They are not interchangeable in authority or scope.

### A. Scriptable Official Documentation

1. https://docs.scriptable.app/
2. https://docs.scriptable.app/importmodule/
3. https://docs.scriptable.app/webview/
4. https://docs.scriptable.app/filemanager/
5. https://docs.scriptable.app/request/
6. https://docs.scriptable.app/keychain/
7. https://docs.scriptable.app/args/

**Authority:** Primary source for Scriptable’s documented APIs and application behavior.

### B. Apple JavaScriptCore

1. https://developer.apple.com/documentation/javascriptcore
2. https://developer.apple.com/documentation/javascriptcore/jscontext
3. https://developer.apple.com/documentation/javascriptcore/jsexport
4. https://developer.apple.com/documentation/javascriptcore/jsmanagedvalue
5. https://developer.apple.com/documentation/javascriptcore/jsvalue
6. https://developer.apple.com/documentation/javascriptcore/jsvirtualmachine

**Authority:** Primary source for Apple’s JavaScriptCore framework. Not proof that every framework API is exposed by Scriptable.

### C. Apple WebKit

1. https://developer.apple.com/documentation/webkit/wkwebview

**Authority:** Supplementary reference for Apple’s WebKit technology. Not the direct Scriptable WebView API contract.

### D. ECMAScript

1. https://tc39.es/ecma262/
2. https://tc39.es/ecma262/#sec-hosts-and-implementations

**Authority:** Primary language specification.

### E. TypeScript

1. https://www.typescriptlang.org/docs/
2. https://www.typescriptlang.org/tsconfig/
3. https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
4. https://www.typescriptlang.org/docs/handbook/modules/theory.html

**Authority:** Primary source for TypeScript language, declaration, module, and compiler terminology.

### F. Scriptable Type Definitions

1. https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/scriptable-ios
2. https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/scriptable-ios/index.d.ts
3. https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/scriptable-ios/scriptable-ios-tests.ts
4. https://www.npmjs.com/package/@types/scriptable-ios

**Authority:** Community-maintained type definitions. Must be checked against official Scriptable documentation.

### G. Scriptable Type Definition Generator

1. https://github.com/schl3ck/ios-scriptable-types
2. https://github.com/schl3ck/ios-scriptable-types/blob/master/README.md
3. https://github.com/schl3ck/ios-scriptable-types/blob/master/buildFromDocs.js
4. https://github.com/schl3ck/ios-scriptable-types/blob/master/buildFromTernDefinition.js
5. https://github.com/schl3ck/ios-scriptable-types/blob/master/template.d.ts
6. https://github.com/schl3ck/ios-scriptable-types/blob/master/globals.js
7. https://github.com/schl3ck/ios-scriptable-types/blob/master/package.json
8. https://github.com/schl3ck/ios-scriptable-types/blob/master/LICENSE

**Authority:** Reference for the generation project and its own implementation, not proof of runtime support.

### H. Engineering Tooling

1. https://fallow.tools/docs/
2. https://fallow.tools/docs/analysis/
3. https://fallow.tools/docs/analysis/dead-code/
4. https://fallow.tools/docs/quickstart/

**Authority:** Primary terminology reference for Fallow’s documented analysis capabilities.

---

# Part XIV. Discrepancy and Unresolved-Term Register

## سجل التعارضات والمصطلحات غير المحسومة

| ID | الموضوع | الملاحظة | طريقة التعامل |
|---|---|---|---|
| TERM-001 | ECMAScript 2026 / 2027 | النص الأصلي يذكر ECMAScript 2026، بينما صفحة المواصفة الحية التي فُحصت تعرض ECMAScript 2027 | الحفاظ على رقم المصدر في الترجمة، وتسجيل التعارض دون تصحيح صامت |
| TERM-002 | Scriptable Main Runtime | تسمية تنظيمية للمشروع وليست اسماً رسمياً مستقلاً في وثائق Scriptable | اعتمادها كمصطلح مشروع مع توضيح ذلك |
| TERM-003 | WebView Runtime | تسمية تنظيمية للمشروع وليست اسماً رسمياً مستقلاً لواجهة Scriptable | اعتمادها كمصطلح مشروع مع توضيح ذلك |
| TERM-004 | Native Scriptable APIs | قد توحي خطأً بواجهات iOS الأصلية | اعتماد Scriptable APIs |
| TERM-005 | JavaScript Context / JSContext | المفهوم العام يختلف عن فئة Apple المحددة | عدم استخدامهما بالتبادل |
| TERM-006 | Validation / Verification | المصطلحان يصفان نشاطين مختلفين | الاختيار بحسب طبيعة النشاط |
| TERM-007 | Runtime Support / Type Support | قبول المترجم لتعريف لا يثبت وجود API أثناء التشغيل | الفصل بين تعريف النوع وواجهة وقت التشغيل |
| TERM-008 | WebView / WKWebView | واجهة Scriptable ليست مرادفاً لإتاحة واجهة Apple الأصلية | استخدام مرجع Scriptable للواجهة المكشوفة |
| TERM-009 | File / Directory / Path | مفاهيم مختلفة في نظام الملفات | عدم دمجها في مصطلح عام واحد |
| TERM-010 | Promise / async-await | ليستا ميزتين من إصدار ECMAScript نفسه | المحافظة على التمييز الزمني عند شرح التوافق |
| TERM-011 | Support / Compatibility | الدعم الموثق والتوافق المثبت بالاختبار ليسا شيئاً واحداً | وصف حالة كل ميزة بدقة |
| TERM-012 | Fallow / Linter | Fallow يحلل مستوى قاعدة الشيفرة، بينما أدوات Linting تركز على قواعد الشيفرة والأنماط المحلية وفق وثائق الأدوات | عدم وصف Fallow بأنه مجرد Linter |

---

# Part XV. Glossary Governance

## قواعد إدارة القاموس

1. Every newly encountered technical term must be checked against this glossary before translation.
2. Existing canonical terms must not be replaced with stylistic synonyms.
3. New terms must be added under the appropriate conceptual group.
4. Project-defined terms must be explicitly identified as project-defined.
5. Official API identifiers must preserve their exact spelling and capitalization.
6. A term must not be classified as an official API name without authoritative documentation.
7. Conflicting source terminology must be recorded in the discrepancy register.
8. Source corrections must never be silently inserted into the translation.
9. Definitions should remain concise and describe the concept, not implementation details.
10. General programming terms belong in the translation termbase, not in the Scriptable-specific domain glossary.
11. Every term must be reviewed in its actual sentence before final translation.
12. A glossary entry is not evidence that an API or feature exists at runtime.

## Approval status

- Scriptable domain terminology: established as a controlled baseline.
- General engineering terminology: established as a translation termbase.
- API identifiers: preserved as source identifiers.
- Context-dependent terms: require sentence-level review.
- Discrepancies: recorded, not silently resolved.
- Translation: not started.
- Glossary completeness: expanded initial baseline, pending section-by-section validation during the later translation process.

**This document is a terminology reference. It is not a translation of the source specification and does not authorize changes to the source document.**