import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";
export type Theme = "light" | "dark";

const en = {
  nav_home: "Event", nav_register: "Register", nav_recover: "Find my code", nav_admin: "Organizers",
  lang_switch: "العربية", theme_toggle: "Toggle theme",
  hero_kicker: "NPT Technical Lecture",
  hero_intro: "An expert-led session on cutting energy use and emissions across natural gas processing, transmission and compression — from audit to action.",
  register_now: "Register Now",
  schedule_tba: "Date, time and venue will be announced soon.",
  overview_title: "Why it matters",
  overview_lead: "Midstream gas operations run compressors, heaters and processing units around the clock. Every percentage point of efficiency is fuel saved, cost avoided and carbon kept out of the atmosphere.",
  ov1_t: "Process optimization", ov1_d: "How energy audits reveal losses in compression, heating and processing — and how to close them.",
  ov2_t: "Emissions reduction", ov2_d: "Practical routes to lower flaring, venting and combustion emissions in gas facilities.",
  ov3_t: "Sustainable operations", ov3_d: "Integrating renewable energy and long-term energy management into industrial operations.",
  speaker_title: "The speaker", speaker_role: "Energy Efficiency Section Head, Egyptian Natural Gas Company (GASCO)",
  bio1: "With over a decade of experience in energy efficiency, decarbonization, and process engineering, I currently serve as Energy Efficiency Section Head at the Egyptian Natural Gas Company (GASCO). I lead initiatives to improve energy performance, conduct energy audits, and integrate renewable energy solutions into operations. By developing and implementing strategies to enhance energy efficiency, I contribute to the company’s sustainability goals and cost-saving measures.",
  bio2: "My expertise includes oil and gas, renewable energy, and advanced process optimization. Supported by my Certified Energy Manager (CEM) certification and Ph.D. studies in Chemical Engineering, I am dedicated to driving impactful energy efficiency initiatives. Through collaboration, I aim to advance energy sustainability and contribute to a greener industrial future.",
  linkedin: "View LinkedIn profile",
  cta_title: "Save your seat", cta_desc: "Registration takes a minute. You'll get a personal attendance code to present at the entrance.",
  footer_by: "Organized by the NCTU Petroleum Tech Chapter (NPT)",
  reg_title: "Student registration", reg_desc: "Fill in your details to receive your attendance code.",
  f_name: "Full name (three or four parts)", f_name_ph: "e.g. Ahmed Mohamed Ali Hassan",
  f_code: "University student code", f_no_code: "I don't have a university code yet",
  f_year: "Academic year", f_source: "How did you hear about this event?", f_phone: "Phone number", f_phone_ph: "01xxxxxxxxx", f_email: "Email address",
  select_ph: "Select…",
  year_first: "First Year", year_second: "Second Year", year_third: "Third Year", year_fourth: "Fourth Year",
  src_social_media: "Social Media", src_whatsapp: "WhatsApp Channel or Group", src_recommendation: "Personal Recommendation",
  privacy: "Your details will be used only to manage this event and verify your attendance.",
  submit: "Complete registration", submitting: "Registering…",
  e_name: "Please enter your full name in three or four parts, using letters only.",
  e_studentCode: "Please enter a valid university code, or tick \"I don't have a university code yet\".",
  e_academicYear: "Please choose your academic year.", e_discoverySource: "Please tell us how you heard about the event.",
  e_phone: "Please enter a valid Egyptian mobile number (e.g. 01012345678 or +201012345678).",
  e_email: "Please enter a valid email address.",
  e_duplicate: "Your registration already exists. Please contact the event organizers if you need help retrieving your attendance code.",
  e_rate: "Too many attempts. Please wait a few minutes and try again.",
  e_invalid: "Some details are invalid. Please review the form.",
  e_server: "Something went wrong on our side. Please try again shortly.",
  find_code_link: "Already registered? Find your code",
  ty_title: "You're registered!", ty_hello: "Welcome", ty_code_label: "Your attendance code",
  ty_instr: "Copy this code or take a screenshot of this page, and present it when entering the lecture.",
  copy: "Copy Attendance Code", copied: "Attendance code copied.", copy_fail: "Couldn't copy. Please write the code down.",
  back: "Back to Event Page",
  ty_missing: "Your code is no longer shown on this page for your privacy. You can retrieve it securely.",
  rec_title: "Find my attendance code", rec_desc: "Enter the same email and phone number you registered with.",
  rec_submit: "Find my code", rec_not_found: "We couldn't find a registration matching both details.",
  auth_title: "Organizer sign in", password: "Password", sign_in: "Sign in", sign_up: "Create account", sign_out: "Sign out",
  auth_switch_up: "No account? Create one", auth_switch_in: "Have an account? Sign in",
  auth_check_email: "Check your email to confirm your account, then sign in.", auth_error: "Sign in failed. Check your email and password.",
  adm_title: "Organizer dashboard", adm_denied: "Your account doesn't have organizer access yet. Ask an administrator to grant it.",
  adm_total: "Registrations", adm_checked: "Checked in", adm_by_year: "By academic year", adm_by_source: "By source",
  adm_search: "Search name, email, phone, code…", adm_all_years: "All years", adm_all_sources: "All sources", adm_export: "Export CSV",
  adm_prev: "Previous", adm_next: "Next", adm_page: "Page",
  col_name: "Name", col_code: "Student code", col_year: "Year", col_source: "Source", col_phone: "Phone", col_email: "Email", col_att: "Attendance", col_date: "Registered",
  none: "—", present: "Present", absent: "Not yet",
  chk_title: "Verify attendance", chk_ph: "Enter 8-character code", chk_btn: "Check in",
  chk_valid: "Valid — checked in:", chk_used: "Already used by", chk_invalid: "Invalid code.",
};
type Dict = typeof en;

const ar: Dict = {
  nav_home: "الفعالية", nav_register: "التسجيل", nav_recover: "استرجاع الكود", nav_admin: "المنظمون",
  lang_switch: "English", theme_toggle: "تبديل المظهر",
  hero_kicker: "محاضرة NPT التقنية",
  hero_intro: "جلسة يقدمها خبير حول خفض استهلاك الطاقة والانبعاثات في معالجة الغاز الطبيعي ونقله وضغطه — من التدقيق إلى التنفيذ.",
  register_now: "سجّل الآن",
  schedule_tba: "سيتم الإعلان عن الموعد والمكان قريبًا.",
  overview_title: "لماذا يهمنا هذا؟",
  overview_lead: "تعمل منشآت الغاز في القطاع الأوسط بضواغط وسخانات ووحدات معالجة على مدار الساعة. كل نقطة مئوية في الكفاءة تعني وقودًا موفرًا وتكلفة أقل وكربونًا أقل في الغلاف الجوي.",
  ov1_t: "تحسين العمليات", ov1_d: "كيف تكشف عمليات تدقيق الطاقة الفاقد في الضغط والتسخين والمعالجة، وكيف نعالجه.",
  ov2_t: "خفض الانبعاثات", ov2_d: "طرق عملية لتقليل الحرق والتنفيس وانبعاثات الاحتراق في منشآت الغاز.",
  ov3_t: "عمليات مستدامة", ov3_d: "دمج الطاقة المتجددة وإدارة الطاقة طويلة المدى في العمليات الصناعية.",
  speaker_title: "المحاضِرة", speaker_role: "رئيس قسم كفاءة الطاقة، الشركة المصرية للغازات الطبيعية (جاسكو)",
  bio1: "بخبرة تزيد على عشر سنوات في كفاءة الطاقة وإزالة الكربون وهندسة العمليات، أشغل حاليًا منصب رئيس قسم كفاءة الطاقة في الشركة المصرية للغازات الطبيعية (جاسكو). أقود مبادرات لتحسين أداء الطاقة، وأجري عمليات تدقيق الطاقة، وأدمج حلول الطاقة المتجددة في العمليات. ومن خلال تطوير وتنفيذ استراتيجيات لتعزيز كفاءة الطاقة، أساهم في تحقيق أهداف الشركة في الاستدامة وخفض التكاليف.",
  bio2: "تشمل خبرتي مجالات النفط والغاز والطاقة المتجددة والتحسين المتقدم للعمليات. وبدعم من شهادة مدير طاقة معتمد (CEM) ودراساتي للدكتوراه في الهندسة الكيميائية، أكرّس جهودي لقيادة مبادرات مؤثرة في كفاءة الطاقة. ومن خلال التعاون، أسعى إلى تعزيز استدامة الطاقة والمساهمة في مستقبل صناعي أكثر اخضرارًا.",
  linkedin: "عرض الملف على لينكدإن",
  cta_title: "احجز مقعدك", cta_desc: "التسجيل يستغرق دقيقة واحدة. ستحصل على كود حضور شخصي لتقدمه عند الدخول.",
  footer_by: "تنظيم فرع NCTU Petroleum Tech (NPT)",
  reg_title: "تسجيل الطلاب", reg_desc: "أدخل بياناتك للحصول على كود الحضور.",
  f_name: "الاسم بالكامل (ثلاثي أو رباعي)", f_name_ph: "مثال: أحمد محمد علي حسن",
  f_code: "الكود الجامعي", f_no_code: "ليس لدي كود جامعي حتى الآن",
  f_year: "الفرقة الدراسية", f_source: "كيف عرفت بهذه الفعالية؟", f_phone: "رقم الهاتف", f_phone_ph: "01xxxxxxxxx", f_email: "البريد الإلكتروني",
  select_ph: "اختر…",
  year_first: "الفرقة الأولى", year_second: "الفرقة الثانية", year_third: "الفرقة الثالثة", year_fourth: "الفرقة الرابعة",
  src_social_media: "وسائل التواصل الاجتماعي", src_whatsapp: "قناة أو مجموعة واتساب", src_recommendation: "ترشيح شخصي",
  privacy: "ستُستخدم بياناتك فقط لإدارة هذه الفعالية والتحقق من حضورك.",
  submit: "إتمام التسجيل", submitting: "جارٍ التسجيل…",
  e_name: "يُرجى إدخال اسمك ثلاثيًا أو رباعيًا باستخدام الحروف فقط.",
  e_studentCode: "يُرجى إدخال كود جامعي صحيح، أو اختيار \"ليس لدي كود جامعي حتى الآن\".",
  e_academicYear: "يُرجى اختيار الفرقة الدراسية.", e_discoverySource: "يُرجى إخبارنا كيف عرفت بالفعالية.",
  e_phone: "يُرجى إدخال رقم موبايل مصري صحيح (مثل 01012345678 أو ‎+201012345678).",
  e_email: "يُرجى إدخال بريد إلكتروني صحيح.",
  e_duplicate: "بيانات تسجيلك موجودة بالفعل. يُرجى التواصل مع منظمي الفعالية إذا كنت بحاجة إلى استرجاع كود الحضور.",
  e_rate: "محاولات كثيرة. يُرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى.",
  e_invalid: "بعض البيانات غير صحيحة. يُرجى مراجعة النموذج.",
  e_server: "حدث خطأ من جانبنا. يُرجى المحاولة مرة أخرى بعد قليل.",
  find_code_link: "سجّلت من قبل؟ استرجع كودك",
  ty_title: "تم تسجيلك بنجاح!", ty_hello: "مرحبًا", ty_code_label: "كود الحضور الخاص بك",
  ty_instr: "انسخ هذا الكود أو التقط صورة للشاشة، وقدّمه عند دخول المحاضرة.",
  copy: "نسخ كود الحضور", copied: "تم نسخ كود الحضور.", copy_fail: "تعذّر النسخ. يُرجى كتابة الكود.",
  back: "العودة إلى صفحة الفعالية",
  ty_missing: "لم يعد الكود معروضًا في هذه الصفحة حفاظًا على خصوصيتك. يمكنك استرجاعه بأمان.",
  rec_title: "استرجاع كود الحضور", rec_desc: "أدخل البريد الإلكتروني ورقم الهاتف نفسيهما اللذين سجّلت بهما.",
  rec_submit: "استرجاع الكود", rec_not_found: "لم نجد تسجيلًا يطابق البيانات المدخلة.",
  auth_title: "دخول المنظمين", password: "كلمة المرور", sign_in: "تسجيل الدخول", sign_up: "إنشاء حساب", sign_out: "تسجيل الخروج",
  auth_switch_up: "ليس لديك حساب؟ أنشئ حسابًا", auth_switch_in: "لديك حساب؟ سجّل الدخول",
  auth_check_email: "تحقق من بريدك لتأكيد الحساب، ثم سجّل الدخول.", auth_error: "فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.",
  adm_title: "لوحة المنظمين", adm_denied: "حسابك لا يملك صلاحية المنظم بعد. اطلب من المسؤول منحك الصلاحية.",
  adm_total: "التسجيلات", adm_checked: "تم الحضور", adm_by_year: "حسب الفرقة", adm_by_source: "حسب المصدر",
  adm_search: "ابحث بالاسم أو البريد أو الهاتف أو الكود…", adm_all_years: "كل الفرق", adm_all_sources: "كل المصادر", adm_export: "تصدير CSV",
  adm_prev: "السابق", adm_next: "التالي", adm_page: "صفحة",
  col_name: "الاسم", col_code: "الكود الجامعي", col_year: "الفرقة", col_source: "المصدر", col_phone: "الهاتف", col_email: "البريد", col_att: "الحضور", col_date: "تاريخ التسجيل",
  none: "—", present: "حاضر", absent: "لم يحضر بعد",
  chk_title: "التحقق من الحضور", chk_ph: "أدخل الكود المكون من 8 خانات", chk_btn: "تسجيل الحضور",
  chk_valid: "صالح — تم تسجيل حضور:", chk_used: "مستخدم بالفعل بواسطة", chk_invalid: "كود غير صالح.",
};

export const dictionaries = { en, ar };
export type TKey = keyof Dict;

type Ctx = { lang: Lang; theme: Theme; t: (k: TKey) => string; setLang: (l: Lang) => void; toggleTheme: () => void };
const PrefsContext = createContext<Ctx | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const l = localStorage.getItem("npt-lang");
    const th = localStorage.getItem("npt-theme");
    if (l === "ar" || l === "en") setLangState(l);
    if (th === "dark" || th === "light") setTheme(th);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value: Ctx = {
    lang,
    theme,
    t: (k) => dictionaries[lang][k],
    setLang: (l) => { localStorage.setItem("npt-lang", l); setLangState(l); },
    toggleTheme: () => setTheme((p) => { const n = p === "dark" ? "light" : "dark"; localStorage.setItem("npt-theme", n); return n; }),
  };
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const c = useContext(PrefsContext);
  if (!c) throw new Error("usePrefs outside provider");
  return c;
}

/** Inline script to apply saved prefs before paint. */
export const prefsBootScript = `try{var l=localStorage.getItem('npt-lang');var t=localStorage.getItem('npt-theme');var d=document.documentElement;if(l==='ar'){d.lang='ar';d.dir='rtl';}if(t==='dark')d.classList.add('dark');}catch(e){}`;
