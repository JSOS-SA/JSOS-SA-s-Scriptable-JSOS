// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_airports.js

// ═══ حقل en: اسم المدينة بالإنجليزية ═══
// المصدر: OurAirports (مجموعة بيانات عامة مفتوحة) — عمود municipality،
// من https://davidmegginson.github.io/ourairports-data/airports.csv
// جُلبت وطُبِّقت في ٢٠٢٦-٠٩-١٩ آليًّا بربط رمز IATA، لا يدويًّا ولا من الذاكرة.
//
// ٣٠٨ من ٣١٢ مطارًا طابقت آليًّا. الأربعة الباقية لم يعطها المصدر اسمًا،
// فبحثتُ عنها في المواقع بطلب المستخدم ٢٠٢٦-٠٩-٢٠ وأضفتُ en لكلٍّ منها
// من ويكيبيديا الإنجليزية (صندوق المعلومات)، مع تسجيل حالة كل رمز:
//   OUJ — "Oujda". **هذا الرمز غير موجود** في IATA: مطار وجدة أنجاد رمزه
//         OUD (ويكيبيديا + OurAirports + air-port-codes، ثلاثة مصادر
//         متفقة). أُبقي الرمز كما هو ولم يُمَسّ — قرار تصحيحه للمستخدم.
//   TIP — "Tripoli". الرمز صحيح، والمطار **مغلق** منذ ٢٠١١ متقطّعًا،
//         والرحلات تحوّلت إلى معيتيقة MJI.
//   FRU — "Bishkek". مطار ماناس **غيّر رمزه إلى BSZ في ٢٠٢٥-٠٨-٠٩**
//         بحسب ويكيبيديا، فـ FRU رمز قديم.
//   TXL — "Berlin". برلين تيغل **أُغلق** للركاب في ٢٠٢٠-١١-٠٨ وأُلغي
//         رسميًّا في ٢٠٢١-٠٥-٠٤.
// إضافة en لا تُصلح رمزًا ولا تُغيّره — هي اسم العرض في تيوب T4 فقط.
//
// ═══ إضافة ٢٠٢٦-٠٩-٢٠: ثلاثة مطارات مصرية لم تكن مسجَّلة ═══
// ATZ و SPX اسماهما الإنجليزيان من المستخدم نصًّا. SPX و HMB يخالفان
// عمود municipality في المصدر، والخلاف مصرَّح به لا مسكوت عنه:
//   ATZ — المصدر: "Asyut". المستخدم: "Assiut". كلاهما نقل لـ«أسيوط»،
//         واعتُمد نصّ المستخدم لأنه هو من حدّده.
//   SPX — المصدر: name = "Sphinx International Airport"، لكن
//         municipality = "Al Jiza". اعتُمد "Sphinx" بطلب المستخدم، وهو
//         اسم المطار لا اسم المدينة، خلافًا لبقية المداخل.
//   HMB — بحثًا في المصدر كما طلب المستخدم: name = "Suhaj International
//         Airport" و municipality = "Suhaj". اعتُمد "Suhaj" حرفيًّا من
//         المصدر. (الهجاء الشائع خارج المصدر "Sohag" — لم يُعتمد.)
// صار المجموع ٣١٥ مطارًا، وبعد بحث ٢٠٢٦-٠٩-٢٠ صارت كلها (٣١٥) بحقل en.

// الاسم الإنجليزي يُعرض في تيوب T4 وحده. عند غياب en يسقط العرض إلى رمز
// المطار — لا إلى الاسم العربي، كي تبقى مخرجات T4 بلغة واحدة.

const AIRPORTS = {
  // ═══ شبه الجزيرة العربية والخليج ═══
  JED: { d: "السعودية", c: "جدة", en: "Jeddah" },
  RUH: { d: "السعودية", c: "الرياض", en: "Riyadh" },
  DMM: { d: "السعودية", c: "الدمام", en: "Ad Dammam" },
  MED: { d: "السعودية", c: "المدينة المنورة", en: "Medina" },
  TIF: { d: "السعودية", c: "الطائف", en: "Taif" },
  AHB: { d: "السعودية", c: "أبها", en: "Abha" },
  TUU: { d: "السعودية", c: "تبوك", en: "Tabuk" },
  GIZ: { d: "السعودية", c: "جازان", en: "Jizan" },
  HAS: { d: "السعودية", c: "حائل", en: "Hail" },
  ABT: { d: "السعودية", c: "الباحة", en: "Al-Baha" },
  EAM: { d: "السعودية", c: "نجران", en: "Najran" },
  RAE: { d: "السعودية", c: "عرعر", en: "Arar" },
  URY: { d: "السعودية", c: "القريات", en: "Gurayat" },
  ELQ: { d: "السعودية", c: "القصيم", en: "Qassim" },
  AJF: { d: "السعودية", c: "الجوف", en: "Al-Jawf" },
  YNB: { d: "السعودية", c: "ينبع", en: "Yanbu" },
  DWD: { d: "السعودية", c: "الدوادمي", en: "Dawadmi" },
  WAE: { d: "السعودية", c: "وادي الدواسر", en: "Wadi Al Dawasir" },
  SHW: { d: "السعودية", c: "شرورة", en: "Sharurah" },
  BHH: { d: "السعودية", c: "بيشة", en: "Bisha" },
  DXB: { d: "الإمارات", c: "دبي", en: "Dubai" },
  AUH: { d: "الإمارات", c: "أبوظبي", en: "Abu Dhabi" },
  SHJ: { d: "الإمارات", c: "الشارقة", en: "Sharjah" },
  RKT: { d: "الإمارات", c: "رأس الخيمة", en: "Ras Al Khaimah" },
  AAN: { d: "الإمارات", c: "العين", en: "Al Ain" },
  DOH: { d: "قطر", c: "الدوحة", en: "Doha" },
  KWI: { d: "الكويت", c: "الكويت", en: "Kuwait City" },
  BAH: { d: "البحرين", c: "المنامة", en: "Manama" },
  MCT: { d: "عمان", c: "مسقط", en: "Muscat/Seeb" },
  SLL: { d: "عمان", c: "صلالة", en: "Salalah" },
  SYZ: { d: "إيران", c: "شيراز", en: "Shiraz" },
  THR: { d: "إيران", c: "طهران", en: "Tehran" },
  IKA: { d: "إيران", c: "طهران الإمام", en: "Tehran" },
  MHD: { d: "إيران", c: "مشهد", en: "Mashhad" },
  IFN: { d: "إيران", c: "أصفهان", en: "Isfahan" },
  TBZ: { d: "إيران", c: "تبريز", en: "Tabriz" },
  AWZ: { d: "إيران", c: "الأهواز", en: "Ahvaz" },
  ABD: { d: "إيران", c: "عبادان", en: "Abadan" },
  BND: { d: "إيران", c: "بندر عباس", en: "Bandar Abbas" },
  SNA: { d: "اليمن", c: "صنعاء", en: "Santa Ana" },
  ADE: { d: "اليمن", c: "عدن", en: "Aden" },
  SAH: { d: "اليمن", c: "صنعاء", en: "Sanaa" },
  BGW: { d: "العراق", c: "بغداد", en: "Baghdad" },
  BSR: { d: "العراق", c: "البصرة", en: "Basra" },
  EBL: { d: "العراق", c: "أربيل", en: "Arbil" },
  NJF: { d: "العراق", c: "النجف", en: "Najaf" },
  ISU: { d: "العراق", c: "السليمانية", en: "Sulaymaniyah" },

  // ═══ الشام ═══
  AMM: { d: "الأردن", c: "عمّان", en: "Amman" },
  AQJ: { d: "الأردن", c: "العقبة", en: "Aqaba" },
  DAM: { d: "سوريا", c: "دمشق", en: "Damascus" },
  ALP: { d: "سوريا", c: "حلب", en: "Aleppo" },
  LTK: { d: "سوريا", c: "اللاذقية", en: "Latakia" },
  BEY: { d: "لبنان", c: "بيروت", en: "Beirut" },
  TLV: { d: "فلسطين", c: "تل أبيب", en: "Tel Aviv" },

  // ═══ مصر ═══
  CAI: { d: "مصر", c: "القاهرة", en: "Cairo" },
  HBE: { d: "مصر", c: "الإسكندرية", en: "Alexandria" },
  SSH: { d: "مصر", c: "شرم الشيخ", en: "Sharm El Sheikh" },
  HRG: { d: "مصر", c: "الغردقة", en: "Hurghada" },
  LXR: { d: "مصر", c: "الأقصر", en: "Luxor" },
  ASW: { d: "مصر", c: "أسوان", en: "Aswan" },
  RMF: { d: "مصر", c: "مرسى علم", en: "Marsa Alam" },
  TCP: { d: "مصر", c: "طابا", en: "Taba" },
  ATZ: { d: "مصر", c: "أسيوط", en: "Assiut" },
  SPX: { d: "مصر", c: "سفنكس", en: "Sphinx" },
  HMB: { d: "مصر", c: "سوهاج", en: "Suhaj" },

  // ═══ شمال أفريقيا ═══
  ALG: { d: "الجزائر", c: "الجزائر", en: "Algiers" },
  ORN: { d: "الجزائر", c: "وهران", en: "Es-Sénia" },
  CZL: { d: "الجزائر", c: "قسنطينة", en: "Constantine" },
  AAE: { d: "الجزائر", c: "عنابة", en: "Annaba" },
  BJA: { d: "الجزائر", c: "بجاية", en: "Béjaïa" },
  TLM: { d: "الجزائر", c: "تلمسان", en: "Zenata" },
  BLJ: { d: "الجزائر", c: "باتنة", en: "Batna" },
  GHA: { d: "الجزائر", c: "غرداية", en: "El Atteuf" },
  TUN: { d: "تونس", c: "تونس", en: "Tunis" },
  MIR: { d: "تونس", c: "المنستير", en: "Monastir" },
  SFA: { d: "تونس", c: "صفاقس", en: "Sfax" },
  DJE: { d: "تونس", c: "جربة", en: "Mellita" },
  NBE: { d: "تونس", c: "النفيضة", en: "Enfidha" },
  CMN: { d: "المغرب", c: "الدار البيضاء", en: "Casablanca" },
  RAK: { d: "المغرب", c: "مراكش", en: "Marrakesh" },
  RBA: { d: "المغرب", c: "الرباط", en: "Rabat" },
  FEZ: { d: "المغرب", c: "فاس", en: "Saïss" },
  TNG: { d: "المغرب", c: "طنجة", en: "Tangier" },
  AGA: { d: "المغرب", c: "أغادير", en: "Agadir (Temsia)" },
  NDR: { d: "المغرب", c: "الناظور", en: "Al Aaroui" },
  OUJ: { d: "المغرب", c: "وجدة", en: "Oujda" },
  TIP: { d: "ليبيا", c: "طرابلس", en: "Tripoli" },
  BEN: { d: "ليبيا", c: "بنغازي", en: "Benina" },
  // صُحِّح في ٢٠٢٦-٠٩-٢٤: كان "مصراتة" خطأً. MJI هو مطار معيتيقة الدولي
  // في طرابلس — خمسة مصادر متفقة (ويكيبيديا عربي/إنجليزي، air-port-codes،
  // OurAirports، مصلحة المطارات الليبية). ومصراتة رمزها MRA وليست هنا.
  // انتبه: TIP مدينته "طرابلس" أيضًا ويسبقه في الترتيب، فالبحث النصي
  // بـ«طرابلس» في fq_addflight.js يقف عند TIP — انظر التسليم ٧-١٣.
  MJI: { d: "ليبيا", c: "طرابلس", en: "Tripoli" },
  SEB: { d: "ليبيا", c: "سبها", en: "Sabha" },

  // ═══ شرق أفريقيا ═══
  ADD: { d: "أثيوبيا", c: "أديس أبابا", en: "Addis Ababa" },
  DIR: { d: "أثيوبيا", c: "دير داوا", en: "Dire Dawa" },
  NBO: { d: "كينيا", c: "نيروبي", en: "Nairobi" },
  MBA: { d: "كينيا", c: "مومباسا", en: "Mombasa" },
  DAR: { d: "تنزانيا", c: "دار السلام", en: "Dar es Salaam" },
  ZNZ: { d: "تنزانيا", c: "زنجبار", en: "Zanzibar" },
  JIB: { d: "جيبوتي", c: "جيبوتي", en: "Djibouti City" },
  MGQ: { d: "الصومال", c: "مقديشو", en: "Mogadishu" },
  HGA: { d: "الصومال", c: "هرجيسا", en: "Hargeisa" },
  KRT: { d: "السودان", c: "الخرطوم", en: "Khartoum" },
  PZU: { d: "السودان", c: "بورتسودان", en: "Port Sudan" },
  EBD: { d: "السودان", c: "الأبيض", en: "El-Obeid" },
  ASM: { d: "إريتريا", c: "أسمرة", en: "Asmara" },
  EBB: { d: "أوغندا", c: "عنتيبي", en: "Entebbe" },

  // ═══ غرب أفريقيا ═══
  LOS: { d: "نيجيريا", c: "لاغوس", en: "Lagos" },
  ABV: { d: "نيجيريا", c: "أبوجا", en: "Abuja" },
  KAN: { d: "نيجيريا", c: "كانو", en: "Kano" },
  ACC: { d: "غانا", c: "أكرا", en: "Accra" },
  DSS: { d: "السنغال", c: "داكار", en: "Dakar" },
  ABJ: { d: "ساحل العاج", c: "أبيدجان", en: "Abidjan" },
  BKO: { d: "مالي", c: "باماكو", en: "Bamako" },
  OUA: { d: "بوركينا فاسو", c: "واغادوغو", en: "Ouagadougou" },
  NKC: { d: "موريتانيا", c: "نواكشوط", en: "Nouakchott" },
  CKY: { d: "غينيا", c: "كوناكري", en: "Conakry" },

  // ═══ جنوب أفريقيا ═══
  JNB: { d: "جنوب أفريقيا", c: "جوهانسبرغ", en: "Johannesburg" },
  CPT: { d: "جنوب أفريقيا", c: "كيب تاون", en: "Cape Town" },
  DUR: { d: "جنوب أفريقيا", c: "ديربان", en: "Durban" },

  // ═══ باكستان ═══
  KHI: { d: "باكستان", c: "كراتشي", en: "Karachi" },
  LHE: { d: "باكستان", c: "لاهور", en: "Lahore" },
  ISB: { d: "باكستان", c: "إسلام آباد", en: "Attock" },
  PEW: { d: "باكستان", c: "بيشاور", en: "Peshawar" },
  MUX: { d: "باكستان", c: "ملتان", en: "Multan" },
  SKT: { d: "باكستان", c: "سيالكوت", en: "Sialkot" },
  UET: { d: "باكستان", c: "كويتا", en: "Quetta" },
  FSD: { d: "باكستان", c: "فيصل آباد", en: "Sioux Falls" },
  RYK: { d: "باكستان", c: "رحيم يار خان", en: "Rahim Yar Khan" },
  GWD: { d: "باكستان", c: "جوادر", en: "Gurandani" },
  TUK: { d: "باكستان", c: "تربات", en: "Turbat" },
  BHV: { d: "باكستان", c: "بهاولبور", en: "Bahawalpur" },
  LYP: { d: "باكستان", c: "فيصل آباد", en: "Faisalabad" },
  DED: { d: "باكستان", c: "ديرة إسماعيل خان", en: "Dehradun (Jauligrant)" },

  // ═══ أفغانستان ═══
  KBL: { d: "أفغانستان", c: "كابل", en: "Kabul" },
  KDH: { d: "أفغانستان", c: "قندهار", en: "Kandahar" },
  MZR: { d: "أفغانستان", c: "مزار شريف", en: "Mazar-i-Sharif" },
  HEA: { d: "أفغانستان", c: "هرات", en: "Guzara" },

  // ═══ الهند ═══
  BOM: { d: "الهند", c: "مومباي", en: "Mumbai" },
  DEL: { d: "الهند", c: "نيودلهي", en: "New Delhi" },
  BLR: { d: "الهند", c: "بنغالور", en: "Bengaluru" },
  HYD: { d: "الهند", c: "حيدر آباد", en: "Hyderabad" },
  MAA: { d: "الهند", c: "تشيناي", en: "Chennai" },
  CCU: { d: "الهند", c: "كلكتا", en: "Kolkata" },
  COK: { d: "الهند", c: "كوتشي", en: "Kochi" },
  TRV: { d: "الهند", c: "تريفاندروم", en: "Thiruvananthapuram" },
  GOI: { d: "الهند", c: "غوا", en: "Vasco da Gama" },
  AMD: { d: "الهند", c: "أحمد آباد", en: "Ahmedabad" },
  JAI: { d: "الهند", c: "جايبور", en: "Jaipur" },
  LKO: { d: "الهند", c: "لكناو", en: "Lucknow" },
  CCJ: { d: "الهند", c: "كاليكوت", en: "Calicut" },
  IXE: { d: "الهند", c: "مانغالور", en: "Mangaluru" },
  GAU: { d: "الهند", c: "غواهاتي", en: "Guwahati" },
  VNS: { d: "الهند", c: "فاراناسي", en: "Varanasi" },
  NAG: { d: "الهند", c: "ناغبور", en: "Nagpur" },
  PAT: { d: "الهند", c: "باتنا", en: "Patna" },
  SXR: { d: "الهند", c: "سريناغار", en: "Srinagar" },
  ATQ: { d: "الهند", c: "أمريتسار", en: "Amritsar" },
  PNQ: { d: "الهند", c: "بونا", en: "Pune" },
  IXZ: { d: "الهند", c: "بورت بلير", en: "Port Blair" },

  // ═══ بنغلاديش ═══
  DAC: { d: "بنغلاديش", c: "دكا", en: "Dhaka" },
  CGP: { d: "بنغلاديش", c: "شيتاغونغ", en: "Chattogram (Chittagong)" },
  ZYL: { d: "بنغلاديش", c: "سيلهت", en: "Sylhet" },
  CXB: { d: "بنغلاديش", c: "كوكس بازار", en: "Cox's Bazar" },

  // ═══ جنوب شرق آسيا ═══
  CGK: { d: "إندونيسيا", c: "جاكرتا", en: "Jakarta" },
  SUB: { d: "إندونيسيا", c: "سورابايا", en: "Surabaya" },
  DPS: { d: "إندونيسيا", c: "بالي", en: "Kuta, Badung" },
  MES: { d: "إندونيسيا", c: "ميدان", en: "Medan" },
  JOG: { d: "إندونيسيا", c: "يوغياكارتا", en: "Yogyakarta" },
  UPG: { d: "إندونيسيا", c: "ماكاسار", en: "Makassar" },
  KNO: { d: "إندونيسيا", c: "كوالا نامو", en: "Beringin" },
  BTJ: { d: "إندونيسيا", c: "باندا آتشيه", en: "Banda Aceh" },
  PDG: { d: "إندونيسيا", c: "بادانغ", en: "Padang (Katapiang)" },
  SOC: { d: "إندونيسيا", c: "سولو", en: "Surakarta" },
  KUL: { d: "ماليزيا", c: "كوالالمبور", en: "Sepang" },
  PEN: { d: "ماليزيا", c: "بينانغ", en: "Penang" },
  LGK: { d: "ماليزيا", c: "لانكاوي", en: "Langkawi" },
  BKI: { d: "ماليزيا", c: "كوتا كينابالو", en: "Kota Kinabalu" },
  KCH: { d: "ماليزيا", c: "كوتشينغ", en: "Kuching" },
  JHB: { d: "ماليزيا", c: "جوهور بارو", en: "Johor Bahru" },
  SIN: { d: "سنغافورة", c: "سنغافورة", en: "Singapore" },
  BKK: { d: "تايلاند", c: "بانكوك", en: "Bangkok" },
  DMK: { d: "تايلاند", c: "بانكوك دون موانغ", en: "Bangkok" },
  HKT: { d: "تايلاند", c: "بوكيت", en: "Phuket" },
  CNX: { d: "تايلاند", c: "شيانغ ماي", en: "Chiang Mai" },
  MNL: { d: "الفلبين", c: "مانيلا", en: "Manila (Pasay)" },
  CEB: { d: "الفلبين", c: "سيبو", en: "Cebu City/Lapu-Lapu City" },
  SGN: { d: "فيتنام", c: "هو تشي منه", en: "Ho Chi Minh City" },
  HAN: { d: "فيتنام", c: "هانوي", en: "Hanoi (Soc Son)" },
  PNH: { d: "كمبوديا", c: "بنوم بنه", en: "Phnom Penh (Pou Senchey)" },
  RGN: { d: "ميانمار", c: "يانغون", en: "Yangon" },

  // ═══ شرق آسيا ═══
  PEK: { d: "الصين", c: "بكين", en: "Beijing" },
  PKX: { d: "الصين", c: "بكين داشينغ", en: "Beijing" },
  PVG: { d: "الصين", c: "شنغهاي", en: "Shanghai (Pudong)" },
  CAN: { d: "الصين", c: "قوانغتشو", en: "Guangzhou (Huadu)" },
  SZX: { d: "الصين", c: "شنجن", en: "Shenzhen" },
  CTU: { d: "الصين", c: "تشنغدو", en: "Chengdu (Shuangliu)" },
  HGH: { d: "الصين", c: "هانغتشو", en: "Hangzhou" },
  XIY: { d: "الصين", c: "شيان", en: "Xi'an" },
  KMG: { d: "الصين", c: "كونمينغ", en: "Kunming" },
  CKG: { d: "الصين", c: "تشونغتشينغ", en: "Chongqing" },
  WUH: { d: "الصين", c: "ووهان", en: "Wuhan (Huangpi)" },
  NKG: { d: "الصين", c: "نانجينغ", en: "Nanjing" },
  URC: { d: "الصين", c: "أورومتشي", en: "Ürümqi" },
  HKG: { d: "هونغ كونغ", c: "هونغ كونغ", en: "Hong Kong" },
  NRT: { d: "اليابان", c: "طوكيو ناريتا", en: "Narita" },
  HND: { d: "اليابان", c: "طوكيو هانيدا", en: "Tokyo" },
  KIX: { d: "اليابان", c: "أوساكا", en: "Osaka" },
  NGO: { d: "اليابان", c: "ناغويا", en: "Tokoname" },
  ICN: { d: "كوريا الجنوبية", c: "سول إنتشون", en: "Seoul" },
  GMP: { d: "كوريا الجنوبية", c: "سول غيمبو", en: "Seoul" },
  TPE: { d: "تايوان", c: "تايبيه", en: "Taoyuan" },
  ULN: { d: "منغوليا", c: "أولان باتور", en: "Ulaanbaatar" },

  // ═══ آسيا الوسطى ═══
  TAS: { d: "أوزبكستان", c: "طشقند", en: "Tashkent" },
  SKD: { d: "أوزبكستان", c: "سمرقند", en: "Samarkand" },
  BHK: { d: "أوزبكستان", c: "بخارى", en: "Bukhara" },
  NMA: { d: "أوزبكستان", c: "نمنغان", en: "Namangan" },
  NCY: { d: "أوزبكستان", c: "نوكوس", en: "Annecy" },
  ALA: { d: "كازاخستان", c: "ألماتي", en: "Almaty" },
  NQZ: { d: "كازاخستان", c: "أستانا", en: "Astana" },
  CIT: { d: "كازاخستان", c: "شيمكنت", en: "Shymkent" },
  GYD: { d: "أذربيجان", c: "باكو", en: "Baku" },
  TBS: { d: "جورجيا", c: "تبليسي", en: "Tbilisi" },
  EVN: { d: "أرمينيا", c: "يريفان", en: "Yerevan" },
  DYU: { d: "طاجيكستان", c: "دوشنبه", en: "Dushanbe" },
  FRU: { d: "قيرغيزستان", c: "بيشكيك", en: "Bishkek" },
  ASB: { d: "تركمانستان", c: "عشق آباد", en: "Ashgabat" },

  // ═══ تركيا ═══
  IST: { d: "تركيا", c: "إسطنبول", en: "Istanbul" },
  SAW: { d: "تركيا", c: "إسطنبول صبيحة", en: "Pendik, Istanbul" },
  ESB: { d: "تركيا", c: "أنقرة", en: "Ankara" },
  ADB: { d: "تركيا", c: "إزمير", en: "Gaziemir" },
  AYT: { d: "تركيا", c: "أنطاليا", en: "Antalya" },
  TZX: { d: "تركيا", c: "طرابزون", en: "Trabzon" },
  ADA: { d: "تركيا", c: "أضنة", en: "Seyhan" },
  GZT: { d: "تركيا", c: "غازي عنتاب", en: "Gaziantep" },
  DLM: { d: "تركيا", c: "دالامان", en: "Dalaman" },
  BJV: { d: "تركيا", c: "بودروم", en: "Bodrum" },
  VAN: { d: "تركيا", c: "وان", en: "Van" },
  DIY: { d: "تركيا", c: "ديار بكر", en: "Diyarbakır" },
  KYA: { d: "تركيا", c: "قونيا", en: "Konya" },

  // ═══ أوروبا الغربية ═══
  LHR: { d: "بريطانيا", c: "لندن هيثرو", en: "London" },
  LGW: { d: "بريطانيا", c: "لندن غاتويك", en: "London" },
  STN: { d: "بريطانيا", c: "لندن ستانستد", en: "London, Essex" },
  MAN: { d: "بريطانيا", c: "مانشستر", en: "Manchester, Greater Manchester" },
  BHX: { d: "بريطانيا", c: "برمنغهام", en: "Birmingham, West Midlands" },
  EDI: { d: "بريطانيا", c: "إدنبرة", en: "Ingliston, Edinburgh" },
  CDG: { d: "فرنسا", c: "باريس شارل ديغول", en: "Paris (Roissy-en-France, Val-d'Oise)" },
  ORY: { d: "فرنسا", c: "باريس أورلي", en: "Paris (Orly, Val-de-Marne)" },
  NCE: { d: "فرنسا", c: "نيس", en: "Nice, Alpes-Maritimes" },
  LYS: { d: "فرنسا", c: "ليون", en: "Colombier-Saugnieu, Rhône" },
  MRS: { d: "فرنسا", c: "مرسيليا", en: "Marignane, Bouches-du-Rhône" },
  FRA: { d: "ألمانيا", c: "فرانكفورت", en: "Frankfurt am Main" },
  MUC: { d: "ألمانيا", c: "ميونخ", en: "Munich" },
  DUS: { d: "ألمانيا", c: "دوسلدورف", en: "Düsseldorf" },
  TXL: { d: "ألمانيا", c: "برلين", en: "Berlin" },
  BER: { d: "ألمانيا", c: "برلين براندنبورغ", en: "Berlin" },
  HAM: { d: "ألمانيا", c: "هامبورغ", en: "Hamburg" },
  CGN: { d: "ألمانيا", c: "كولونيا", en: "Köln (Cologne)" },
  STR: { d: "ألمانيا", c: "شتوتغارت", en: "Stuttgart" },
  AMS: { d: "هولندا", c: "أمستردام", en: "Amsterdam" },
  BRU: { d: "بلجيكا", c: "بروكسل", en: "Zaventem" },
  ZRH: { d: "سويسرا", c: "زيورخ", en: "Zurich" },
  GVA: { d: "سويسرا", c: "جنيف", en: "Geneva" },
  VIE: { d: "النمسا", c: "فيينا", en: "Vienna" },

  // ═══ جنوب أوروبا ═══
  FCO: { d: "إيطاليا", c: "روما", en: "Rome" },
  MXP: { d: "إيطاليا", c: "ميلان", en: "Ferno (VA)" },
  MAD: { d: "إسبانيا", c: "مدريد", en: "Madrid" },
  BCN: { d: "إسبانيا", c: "برشلونة", en: "Barcelona" },
  LIS: { d: "البرتغال", c: "لشبونة", en: "Lisbon" },
  ATH: { d: "اليونان", c: "أثينا", en: "Spata-Artemida" },
  SKG: { d: "اليونان", c: "سالونيك", en: "Thessaloniki" },

  // ═══ شرق أوروبا ═══
  SVO: { d: "روسيا", c: "موسكو شيريميتيفو", en: "Moscow" },
  DME: { d: "روسيا", c: "موسكو دوموديدوفو", en: "Moscow" },
  LED: { d: "روسيا", c: "سانت بطرسبرغ", en: "St. Petersburg" },
  WAW: { d: "بولندا", c: "وارسو", en: "Warsaw" },
  PRG: { d: "التشيك", c: "براغ", en: "Prague" },
  BUD: { d: "المجر", c: "بودابست", en: "Budapest" },
  OTP: { d: "رومانيا", c: "بوخارست", en: "Otopeni" },
  SOF: { d: "بلغاريا", c: "صوفيا", en: "Sofia" },

  // ═══ شمال أوروبا ═══
  CPH: { d: "الدنمارك", c: "كوبنهاغن", en: "Copenhagen" },
  OSL: { d: "النرويج", c: "أوسلو", en: "Oslo (Gardermoen)" },
  ARN: { d: "السويد", c: "ستوكهولم", en: "Stockholm" },
  HEL: { d: "فنلندا", c: "هلسنكي", en: "Helsinki (Vantaa)" },

  // ═══ أمريكا الشمالية ═══
  JFK: { d: "أمريكا", c: "نيويورك كينيدي", en: "New York" },
  EWR: { d: "أمريكا", c: "نيويورك نيوارك", en: "Newark" },
  LAX: { d: "أمريكا", c: "لوس أنجلوس", en: "Los Angeles" },
  ORD: { d: "أمريكا", c: "شيكاغو", en: "Chicago" },
  IAD: { d: "أمريكا", c: "واشنطن دالاس", en: "Dulles" },
  DFW: { d: "أمريكا", c: "دالاس", en: "Dallas-Fort Worth" },
  ATL: { d: "أمريكا", c: "أتلانتا", en: "Atlanta" },
  SFO: { d: "أمريكا", c: "سان فرانسيسكو", en: "San Francisco" },
  MIA: { d: "أمريكا", c: "ميامي", en: "Miami" },
  IAH: { d: "أمريكا", c: "هيوستن", en: "Houston" },
  SEA: { d: "أمريكا", c: "سياتل", en: "Seattle" },
  BOS: { d: "أمريكا", c: "بوسطن", en: "Boston" },
  YYZ: { d: "كندا", c: "تورنتو", en: "Toronto" },
  YUL: { d: "كندا", c: "مونتريال", en: "Montréal" },
  YVR: { d: "كندا", c: "فانكوفر", en: "Vancouver" },
  MEX: { d: "المكسيك", c: "مكسيكو سيتي", en: "Mexico City" },
  CUN: { d: "المكسيك", c: "كانكون", en: "Cancún" },

  // ═══ أمريكا الجنوبية ═══
  GRU: { d: "البرازيل", c: "ساو باولو", en: "São Paulo" },
  GIG: { d: "البرازيل", c: "ريو دي جانيرو", en: "Rio De Janeiro" },
  EZE: { d: "الأرجنتين", c: "بوينس آيرس", en: "Buenos Aires (Ezeiza)" },
  SCL: { d: "تشيلي", c: "سانتياغو", en: "Santiago" },
  BOG: { d: "كولومبيا", c: "بوغوتا", en: "Bogota" },
  LIM: { d: "بيرو", c: "ليما", en: "Lima" },

  // ═══ أوقيانوسيا ═══
  SYD: { d: "أستراليا", c: "سيدني", en: "Sydney (Mascot)" },
  MEL: { d: "أستراليا", c: "ملبورن", en: "Melbourne" },
  BNE: { d: "أستراليا", c: "بريزبن", en: "Brisbane" },
  PER: { d: "أستراليا", c: "بيرث", en: "Perth" },
  AKL: { d: "نيوزيلندا", c: "أوكلاند", en: "Auckland" },

  // ═══ جزر ═══
  MLE: { d: "المالديف", c: "ماليه", en: "Malé" },
  CMB: { d: "سريلانكا", c: "كولومبو", en: "Colombo" },
  KTM: { d: "نيبال", c: "كاتماندو", en: "Kathmandu" },
  PBH: { d: "بوتان", c: "بارو", en: "Paro" },
  BWN: { d: "بروناي", c: "بندر سري بيغاوان", en: "Bandar Seri Begawan" },
  MRU: { d: "موريشيوس", c: "بورت لويس", en: "Plaine Magnien" },
  SEZ: { d: "سيشل", c: "ماهي", en: "Victoria" },
};

module.exports = Object.freeze({ AIRPORTS });
