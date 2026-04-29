import { useEffect, useMemo, useState } from "react";
import WebApp from "@twa-dev/sdk";

const THEME_KEY = "kalab_theme";
const LANGUAGE_KEY = "kalab_language";
const PREFERENCES_EVENT = "kalab-preferences";

const translations = {
  en: {
    appName: "Kalab Barista Academy",
    subtitle: "Unveil the Science Behind Every Cup",
    student: "Student",
    home: "Home",
    courses: "Courses",
    registration: "Registration",
    welcome: "Welcome",
    welcomeNamed: "Welcome, {name}",
    heroDescription:
      "Explore the academy, submit your application, and track your progress through a refined coffee-inspired Telegram experience.",
    registerNow: "Register Now",
    exploreCourse: "Explore Course",
    studentPortal: "Student Portal",
    openProfile: "Open profile",
    profileManagement: "Profile Management",
    manageYourProfile: "Manage your profile",
    loadingStudentPortal: "Loading student portal...",
    loadingProfile: "Loading profile...",
    portalLocked: "Portal Locked",
    profileLocked: "Profile Locked",
    completeRegistrationFirst:
      "Complete your registration first to unlock the student portal.",
    registerFirstToManage: "Register first to manage your details.",
    goToRegistration: "Go to Registration",
    paymentStatus: "Payment Status",
    paid: "Paid",
    pending: "Pending",
    paymentApproved: "Your payment is approved.",
    waitingForPaymentApproval: "Waiting for payment approval.",
    price: "Price",
    courseFeeSet: "Your course fee is set by the admissions team.",
    interestStatus: "Interest Status",
    interested: "Interested",
    notInterested: "Not Interested",
    reminderLogic:
      "Reminder and payment messages only run for interested applicants.",
    classReadiness: "Class Readiness",
    schedule: "Schedule",
    waitingForScheduleAssignment: "Waiting for schedule assignment",
    startDate: "Start Date",
    waitingForStartDate: "Waiting for start date",
    instructor: "Instructor",
    pendingShort: "Pending",
    profileStep: "Profile",
    programStep: "Program",
    finishStep: "Finish",
    applicationProgress: "Application Progress",
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    phoneHint: "Use the right format for your phone number",
    phoneInvalid: "Enter a valid phone number for the selected country.",
    ethiopianPhoneStart: "Ethiopian numbers must start with 9 or 7",
    dateOfBirth: "Date of Birth",
    dateHint: "Pick your date as DD/MM/YYYY",
    address: "Address",
    experienceQuestion: "Do you already have barista experience?",
    yes: "Yes",
    no: "No",
    programType: "Program Type",
    regular: "Regular",
    regularDescription:
      "A focused academy experience with structured weekday training.",
    vip: "VIP",
    vipDescription:
      "Premium scheduling flexibility with priority support and smaller sessions.",
    preferredVipSchedule: "Preferred VIP Schedule",
    chooseSchedule: "Choose a schedule",
    morning: "Morning",
    afternoon: "Afternoon",
    weekend: "Weekend",
    emergencyContactName: "Emergency Contact Name",
    emergencyContactPhone: "Emergency Contact Phone",
    motivationLabel: "Why do you want to learn barista?",
    motivationPlaceholder:
      "Share your goals, your interest in coffee, and what you hope to learn.",
    motivationLimit: "Keep your answer under 1000 characters.",
    sourceLabel: "How did you hear about us?",
    chooseSource: "Select a source",
    instagram: "Instagram",
    telegram: "Telegram",
    referral: "Referral",
    back: "Back",
    continue: "Continue",
    submitting: "Submitting...",
    submitApplication: "Submit Application",
    submitError:
      "We could not submit your registration right now. Please try again.",
    requiredNotice: "* All fields marked with * are required",
    firstNameRequired: "First name is required.",
    lastNameRequired: "Last name is required.",
    nameFormat:
      "Use English or Amharic letters and / only. Spaces are not allowed.",
    nameMinLength: "Name must be at least 2 letters.",
    emailInvalid: "Enter a valid email address.",
    phoneRequired: "Phone number is required.",
    dobRequired: "Date of birth is required.",
    dobInvalid: "Enter a valid date in DD/MM/YYYY format.",
    dobRange: "Year must be between 1950 and the current year.",
    addressRequired: "Address is required.",
    experienceRequired: "Please choose whether you have experience.",
    programRequired: "Program type is required.",
    vipRequired: "Please select your preferred VIP schedule.",
    emergencyNameInvalid:
      "Use English or Amharic letters and / only. Spaces are not allowed.",
    sourceRequired: "Please tell us how you heard about the academy.",
    registrationReceived: "Registration received",
    registrationSuccess:
      "Your application has been submitted successfully. We have also sent a confirmation message through Telegram and will contact you soon with the next steps.",
    goToHome: "Go to Home",
    previewMode: "Preview mode",
    themeLight: "Light mode",
    themeDark: "Dark mode",
    languageEnglish: "EN",
    languageAmharic: "AM",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    enrollmentSnapshot: "Enrollment Snapshot",
    program: "Program",
    fee: "Fee",
    notProvided: "Not provided",
    couldNotSaveProfile: "We could not save your profile updates right now.",
    courseOverview: "Course Overview",
    courseTitle: "Learn the craft behind every cup",
    beginner: "Beginner",
    intermediate: "Intermediate",
    twoWeeks: "2 weeks",
    oneWeek: "1 week",
    baristaFundamentals: "Barista Fundamentals",
    baristaFundamentalsDescription:
      "Master espresso calibration, milk texture, bar flow, and service discipline.",
    advancedBrewing: "Advanced Brewing Methods",
    advancedBrewingDescription:
      "Refine extraction control and sensory accuracy across manual brew methods.",
    coffeeOrigins: "Coffee origins",
    dialingEspresso: "Dialing espresso",
    milkSteaming: "Milk steaming",
    drinkBuilding: "Drink building",
    serviceRhythm: "Service rhythm",
    pourOverMastery: "Pour-over mastery",
    frenchPressBrewing: "French press brewing",
    coldBrewProcess: "Cold brew process",
    waterChemistry: "Water chemistry",
    tasteProfiling: "Taste profiling",
    scheduleNotAssigned: "Schedule not assigned yet.",
    notSet: "Not set",
    tbd: "TBD",
    selectYear: "Select year",
    selectMonth: "Select month",
    chooseDay: "Choose day",
    monthJanuary: "Jan",
    monthFebruary: "Feb",
    monthMarch: "Mar",
    monthApril: "Apr",
    monthMay: "May",
    monthJune: "Jun",
    monthJuly: "Jul",
    monthAugust: "Aug",
    monthSeptember: "Sep",
    monthOctober: "Oct",
    monthNovember: "Nov",
    monthDecember: "Dec",
    weekdaySun: "Su",
    weekdayMon: "Mo",
    weekdayTue: "Tu",
    weekdayWed: "We",
    weekdayThu: "Th",
    weekdayFri: "Fr",
    weekdaySat: "Sa"
  },
  am: {
    appName: "ካላብ ባሪስታ አካዳሚ",
    subtitle: "በእያንዳንዱ ጽዋ ውስጥ ያለውን ሳይንስ ያግኙ",
    student: "ተማሪ",
    home: "መነሻ",
    courses: "ኮርሶች",
    registration: "ምዝገባ",
    welcome: "እንኳን ደህና መጡ",
    welcomeNamed: "እንኳን ደህና መጡ፣ {name}",
    heroDescription:
      "አካዳሚውን ያስሱ፣ ማመልከቻዎን ያስገቡ፣ እና እድገትዎን በተጠናቀቀ የቡና ተሞክሮ ይከታተሉ።",
    registerNow: "አሁን ይመዝገቡ",
    exploreCourse: "ኮርስ ይመልከቱ",
    studentPortal: "የተማሪ ፖርታል",
    openProfile: "ፕሮፋይል ይክፈቱ",
    profileManagement: "የፕሮፋይል አስተዳደር",
    manageYourProfile: "ፕሮፋይልዎን ያስተዳድሩ",
    loadingStudentPortal: "የተማሪ ፖርታሉ በመጫን ላይ ነው...",
    loadingProfile: "ፕሮፋይል በመጫን ላይ ነው...",
    portalLocked: "ፖርታሉ ተቆልፏል",
    profileLocked: "ፕሮፋይሉ ተቆልፏል",
    completeRegistrationFirst:
      "የተማሪ ፖርታሉን ለመክፈት መጀመሪያ ምዝገባዎን ያጠናቅቁ።",
    registerFirstToManage: "ዝርዝሮችዎን ለማስተዳደር መጀመሪያ ይመዝገቡ።",
    goToRegistration: "ወደ ምዝገባ ይሂዱ",
    paymentStatus: "የክፍያ ሁኔታ",
    paid: "ተከፍሏል",
    pending: "በመጠባበቅ ላይ",
    paymentApproved: "ክፍያዎ ጸድቋል።",
    waitingForPaymentApproval: "የክፍያ ማጽደቅ በመጠባበቅ ላይ ነው።",
    price: "ዋጋ",
    courseFeeSet: "የኮርስ ክፍያዎ በቅበላ ቡድኑ ይወሰናል።",
    interestStatus: "የፍላጎት ሁኔታ",
    interested: "ፍላጎት አለው",
    notInterested: "ፍላጎት የለውም",
    reminderLogic:
      "ማሳሰቢያና የክፍያ መልዕክቶች የሚላኩት ፍላጎት ላላቸው አመልካቾች ብቻ ነው።",
    classReadiness: "የክፍል ዝግጁነት",
    schedule: "መርሃ ግብር",
    waitingForScheduleAssignment: "የመርሃ ግብር መመደብ በመጠባበቅ ላይ ነው",
    startDate: "የመጀመሪያ ቀን",
    waitingForStartDate: "የመጀመሪያ ቀን በመጠባበቅ ላይ ነው",
    instructor: "አሰልጣኝ",
    pendingShort: "በመጠባበቅ ላይ",
    profileStep: "ፕሮፋይል",
    programStep: "ፕሮግራም",
    finishStep: "ማጠናቀቅ",
    applicationProgress: "የማመልከቻ እድገት",
    firstName: "የመጀመሪያ ስም",
    lastName: "የአባት ስም",
    emailAddress: "ኢሜይል አድራሻ",
    phoneNumber: "ስልክ ቁጥር",
    phoneHint: "ስልክ ቁጥሩን በዓለም አቀፍ ቅርጸት ያስገቡ",
    phoneInvalid: "ለተመረጠው ሀገር ትክክለኛ የስልክ ቁጥር ያስገቡ።",
    ethiopianPhoneStart: "የኢትዮጵያ ቁጥሮች በ 9 ወይም 7 መጀመር አለባቸው",
    dateOfBirth: "የትውልድ ቀን",
    dateHint: "ቀኑን እንደ DD/MM/YYYY ያስገቡ ወይም ከላይ ይምረጡ።",
    address: "አድራሻ",
    experienceQuestion: "የባሪስታ ልምድ አለዎት?",
    yes: "አዎ",
    no: "አይ",
    programType: "የፕሮግራም አይነት",
    regular: "መደበኛ",
    regularDescription:
      "በሳምንቱ ቀናት የተዋቀረ ስልጠና ያለው የተጠናከረ የአካዳሚ ተሞክሮ።",
    vip: "ቪአይፒ",
    vipDescription:
      "በተለዋዋጭ የሰዓት አደረጃጀት እና በአነስተኛ ክፍሎች የተደገፈ ፕሪሚየም ተሞክሮ።",
    preferredVipSchedule: "የሚመረጠው የቪአይፒ መርሃ ግብር",
    chooseSchedule: "መርሃ ግብር ይምረጡ",
    morning: "ጠዋት",
    afternoon: "ከሰዓት በኋላ",
    weekend: "ቅዳሜ እና እሁድ",
    emergencyContactName: "የአስቸኳይ ጊዜ ተጠሪ ስም",
    emergencyContactPhone: "የአስቸኳይ ጊዜ ተጠሪ ስልክ",
    motivationLabel: "ባሪስታ ለመማር ለምን ትፈልጋለህ?",
    motivationPlaceholder:
      "ግቦችህን፣ ለቡና ያለህን ፍላጎት እና ምን መማር እንደምትፈልግ አጋራ።",
    motivationLimit: "መልስዎን ከ 1000 ቁምፊዎች በታች ያቆዩ።",
    sourceLabel: "ስለ አካዳሚው እንዴት ሰሙ?",
    chooseSource: "ምንጭ ይምረጡ",
    instagram: "ኢንስታግራም",
    telegram: "ቴሌግራም",
    referral: "ጥቆማ",
    back: "ተመለስ",
    continue: "ቀጥል",
    submitting: "በመላክ ላይ...",
    submitApplication: "ማመልከቻ አስገባ",
    submitError: "ምዝገባዎን አሁን ማስገባት አልቻልንም። እባክዎ እንደገና ይሞክሩ።",
    requiredNotice: "* በ * የተለዩ መስኮች አስፈላጊ ናቸው",
    firstNameRequired: "የመጀመሪያ ስም አስፈላጊ ነው።",
    lastNameRequired: "የአባት ስም አስፈላጊ ነው።",
    nameFormat: "የእንግሊዝኛ ወይም የአማርኛ ፊደሎችን እና / ብቻ ይጠቀሙ። ክፍተት አይፈቀድም።",
    nameMinLength: "ስም ቢያንስ 2 ፊደላት ሊኖሩት ይገባል።",
    emailInvalid: "ትክክለኛ ኢሜይል ያስገቡ።",
    phoneRequired: "ስልክ ቁጥር አስፈላጊ ነው።",
    dobRequired: "የትውልድ ቀን አስፈላጊ ነው።",
    dobInvalid: "ትክክለኛ ቀን በ DD/MM/YYYY ቅርጸት ያስገቡ።",
    dobRange: "ዓመቱ ከ 1950 እስከ አሁኑ ዓመት መሆን አለበት።",
    addressRequired: "አድራሻ አስፈላጊ ነው።",
    experienceRequired: "ልምድ እንዳለዎት ይምረጡ።",
    programRequired: "የፕሮግራም አይነት አስፈላጊ ነው።",
    vipRequired: "የቪአይፒ መርሃ ግብር ይምረጡ።",
    emergencyNameInvalid:
      "የእንግሊዝኛ ወይም የአማርኛ ፊደሎችን እና / ብቻ ይጠቀሙ። ክፍተት አይፈቀድም።",
    sourceRequired: "ስለ አካዳሚው እንዴት እንደሰሙ ይግለጹ።",
    registrationReceived: "ምዝገባዎ ተቀብሏል",
    registrationSuccess:
      "ማመልከቻዎ በተሳካ ሁኔታ ተልኳል። የማረጋገጫ መልዕክትም በቴሌግራም ተልኳል እና በቀጣይ እርምጃዎች በቅርቡ እናገናኝዎታለን።",
    goToHome: "ወደ መነሻ ይሂዱ",
    previewMode: "የቅድመ እይታ ሁኔታ",
    themeLight: "ብርሃን ሁኔታ",
    themeDark: "ጨለማ ሁኔታ",
    languageEnglish: "EN",
    languageAmharic: "AM",
    editProfile: "ፕሮፋይል አርትዕ",
    saveChanges: "ለውጦችን አስቀምጥ",
    saving: "በማስቀመጥ ላይ...",
    cancel: "ይቅር",
    enrollmentSnapshot: "የምዝገባ አጠቃላይ እይታ",
    program: "ፕሮግራም",
    fee: "ክፍያ",
    notProvided: "አልተሰጠም",
    couldNotSaveProfile: "የፕሮፋይል ለውጦችዎን አሁን ማስቀመጥ አልቻልንም።",
    courseOverview: "የኮርስ እይታ",
    courseTitle: "በእያንዳንዱ ጽዋ ውስጥ ያለውን ሙያ ይማሩ",
    beginner: "ጀማሪ",
    intermediate: "መካከለኛ",
    twoWeeks: "2 ሳምንት",
    oneWeek: "1 ሳምንት",
    baristaFundamentals: "የባሪስታ መሰረታዊ ክህሎቶች",
    baristaFundamentalsDescription:
      "ኤስፕሬሶ ማስተካከያ፣ የወተት ማነፍነፍ፣ የባር ፍሰት እና አገልግሎት ስነ ስርዓትን ይቆጣጠሩ።",
    advancedBrewing: "የተሻሻሉ የቡና አዘገጃጀት ዘዴዎች",
    advancedBrewingDescription:
      "በእጅ የሚዘጋጁ ዘዴዎች ላይ የጣዕም ትክክለኛነትን እና የማውጣት ቁጥጥርን ያጠናክሩ።",
    coffeeOrigins: "የቡና አመጣጥ",
    dialingEspresso: "ኤስፕሬሶ ማስተካከያ",
    milkSteaming: "የወተት ማነፍነፍ",
    drinkBuilding: "መጠጥ አዘገጃጀት",
    serviceRhythm: "የአገልግሎት ፍሰት",
    pourOverMastery: "ፖር-ኦቨር ብቃት",
    frenchPressBrewing: "ፍሬንች ፕሬስ ዝግጅት",
    coldBrewProcess: "ኮልድ ብሩ ሂደት",
    waterChemistry: "የውሃ ኬሚስትሪ",
    tasteProfiling: "የጣዕም ትንተና",
    scheduleNotAssigned: "መርሃ ግብር ገና አልተመደበም።",
    notSet: "አልተወሰነም",
    tbd: "ይጠበቃል",
    selectYear: "ዓመት ይምረጡ",
    selectMonth: "ወር ይምረጡ",
    chooseDay: "ቀን ይምረጡ",
    monthJanuary: "ጃን",
    monthFebruary: "ፌብ",
    monthMarch: "ማር",
    monthApril: "ኤፕ",
    monthMay: "ሜይ",
    monthJune: "ጁን",
    monthJuly: "ጁላ",
    monthAugust: "ኦገ",
    monthSeptember: "ሴፕ",
    monthOctober: "ኦክ",
    monthNovember: "ኖቬ",
    monthDecember: "ዲሴ",
    weekdaySun: "እሑ",
    weekdayMon: "ሰኞ",
    weekdayTue: "ማክ",
    weekdayWed: "ረቡ",
    weekdayThu: "ሐሙ",
    weekdayFri: "ዓር",
    weekdaySat: "ቅዳ"
  }
};

const monthKeys = [
  "monthJanuary",
  "monthFebruary",
  "monthMarch",
  "monthApril",
  "monthMay",
  "monthJune",
  "monthJuly",
  "monthAugust",
  "monthSeptember",
  "monthOctober",
  "monthNovember",
  "monthDecember"
];

const weekdayKeys = [
  "weekdaySun",
  "weekdayMon",
  "weekdayTue",
  "weekdayWed",
  "weekdayThu",
  "weekdayFri",
  "weekdaySat"
];

function readTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

function readLanguage() {
  if (typeof window === "undefined") {
    return "en";
  }

  return localStorage.getItem(LANGUAGE_KEY) === "am" ? "am" : "en";
}

function interpolate(template, values = {}) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replace(`{${key}}`, String(value)),
    template
  );
}

function notifyPreferenceChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(PREFERENCES_EVENT, {
      detail: {
        theme: readTheme(),
        language: readLanguage()
      }
    })
  );
}

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

function syncTelegramTheme(theme) {
  try {
    const background = theme === "light" ? "#fefae0" : "#1a110a";
    WebApp.setHeaderColor(background);
    WebApp.setBackgroundColor(background);
  } catch (error) {
    console.warn("Telegram theme sync unavailable.", error);
  }
}

export function useAppPreferences() {
  const [theme, setTheme] = useState(readTheme);
  const [language, setLanguage] = useState(readLanguage);
  const dictionary = useMemo(
    () => translations[language] ?? translations.en,
    [language]
  );

  useEffect(() => {
    applyTheme(theme);
    syncTelegramTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handlePreferenceChange = (event) => {
      setTheme(event.detail?.theme || readTheme());
      setLanguage(event.detail?.language || readLanguage());
    };

    const handleStorage = () => {
      setTheme(readTheme());
      setLanguage(readLanguage());
    };

    window.addEventListener(PREFERENCES_EVENT, handlePreferenceChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(PREFERENCES_EVENT, handlePreferenceChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    notifyPreferenceChange();
  };

  const setPreferredLanguage = (nextLanguage) => {
    localStorage.setItem(LANGUAGE_KEY, nextLanguage === "am" ? "am" : "en");
    notifyPreferenceChange();
  };

  const toggleLanguage = () => {
    setPreferredLanguage(language === "en" ? "am" : "en");
  };

  const t = useMemo(
    () => (key, values) =>
      interpolate(dictionary[key] ?? translations.en[key] ?? key, values),
    [dictionary]
  );

  const months = useMemo(() => monthKeys.map((key) => t(key)), [t]);
  const weekdays = useMemo(() => weekdayKeys.map((key) => t(key)), [t]);

  return {
    theme,
    language,
    locale: language === "am" ? "am-ET" : "en-US",
    isDark: theme === "dark",
    t,
    months,
    weekdays,
    toggleTheme,
    toggleLanguage,
    setPreferredLanguage
  };
}

function useTelegramWebApp() {
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
      WebApp.enableClosingConfirmation();
    } catch (error) {
      console.warn("Telegram WebApp SDK is unavailable outside Telegram.", error);
    }

    return () => {
      try {
        WebApp.disableClosingConfirmation();
      } catch (error) {
        console.warn("Could not disable Telegram closing confirmation.", error);
      }
    };
  }, []);

  const telegramUser = useMemo(() => {
    const user = WebApp?.initDataUnsafe?.user;

    return {
      id: user?.id ?? 0,
      username: user?.username ?? "",
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? ""
    };
  }, []);

  const haptic = (style = "light") => {
    try {
      WebApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
      console.warn("Haptic feedback unavailable.", error);
    }
  };

  const closeApp = () => {
    try {
      WebApp.close();
    } catch (error) {
      console.warn("Telegram close action unavailable.", error);
    }
  };

  return {
    telegramUser,
    haptic,
    closeApp
  };
}

export default useTelegramWebApp;
