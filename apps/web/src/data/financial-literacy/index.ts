import type { CourseModule } from "./types";
import m01 from "./m01.json";
import m02 from "./m02.json";
import m03 from "./m03.json";
import m04 from "./m04.json";
import m05 from "./m05.json";
import m06 from "./m06.json";
import m07 from "./m07.json";
import m08 from "./m08.json";
import m09 from "./m09.json";
import m10 from "./m10.json";

export type CourseLocale = "en" | "am";

export const courseModules = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10] as CourseModule[];

export const coursePath = "/academy/financial-literacy";

export const courseHref = (locale: CourseLocale, slug?: string) =>
  `${locale === "am" ? "/am" : ""}${coursePath}/${slug ? `${slug}/` : ""}`;

/** Interface words for the course pages; the lessons themselves live in m01.json ... m10.json. */
export const courseCopy = {
  en: {
    eyebrow: "Investopia Academy · Free course",
    title: "Financial Literacy for Everyone",
    subhead:
      "Ten short, illustrated modules on running a business, setting goals, budgeting, saving, borrowing and staying safe with money. Free, open to everyone, no sign-up needed.",
    start: "Start the course",
    continue: "Continue where you left off",
    modules: "The ten modules",
    module: "Module",
    minutes: "min",
    lessons: "lessons",
    done: "Completed",
    howTitle: "How the course works",
    how: [
      { title: "Learn in small steps", text: "Each module has short lessons with pictures you can read in a few minutes." },
      { title: "See it, then try it", text: "Animated graphics show each idea, and real-life examples show it at work." },
      { title: "Check what you learned", text: "A short quiz ends each module. Your progress is saved on this device." },
    ],
    objectives: "In this module you will learn to",
    contents: "In this module",
    example: "Example",
    tip: "Tip",
    takeaways: "Key points to remember",
    quiz: "Check your understanding",
    quizIntro: "Choose an answer for each question.",
    correct: "Correct.",
    notQuite: "Not quite.",
    score: (n: number, total: number) => `You answered ${n} of ${total} correctly.`,
    retry: "Try the quiz again",
    markDone: "Mark this module as completed",
    markedDone: "Module completed",
    previous: "Previous module",
    next: "Next module",
    backToCourse: "All modules",
    progress: (n: number, total: number) => `${n} of ${total} modules completed`,
    source:
      "Adapted from the Financial Education Module for the Youth and MSMEs (May 2024), published by the National Bank of Ethiopia and developed by St. Mary's University with First Consult, with support from the Mastercard Foundation.",
    otherLanguage: "ይህን ኮርስ በአማርኛ ያንብቡ",
    seeCredits: "Read the full declaration and credits",
    credits: {
      title: "Declaration and acknowledgment of sources",
      declaration: [
        "Investopia, a platform by Erudite Africa Investments PLC, declares that the content of this course is adapted from the Financial Education Module for the Youth and MSMEs (basic level), published by the National Bank of Ethiopia in May 2024, and from its Amharic edition (2016 E.C.).",
        "The knowledge, concepts, examples and structure of this course belong to the authors and institutions credited below. Investopia has only simplified, shortened, illustrated and arranged the original for online learning. Any errors introduced in this adaptation are Investopia's own.",
        "This course is offered free of charge for public financial education. It is not an official publication of the National Bank of Ethiopia, and the institutions named here have not reviewed or endorsed this adaptation.",
      ],
      institutionsTitle: "Original authors and institutions",
      institutions: [
        { name: "National Bank of Ethiopia", role: "Publisher of the module, prepared under its Financial Education Strategy (2021-2025)" },
        { name: "St. Mary's University", role: "Developed the module" },
        { name: "First Consult", role: "Developed the module with St. Mary's University and the National Bank of Ethiopia, under the BRIDGES program" },
        { name: "Mastercard Foundation", role: "Supported the development of the module under the BRIDGES program" },
        { name: "Financial Education Working Group", role: "Financial experts and representatives of various organizations who contributed to the content" },
      ],
      prefaceTitle: "Preface to the original module signed by",
      preface: [
        { name: "H.E. Mamo Mihretu", role: "Governor, National Bank of Ethiopia" },
        { name: "Samuel Yalew", role: "Ethiopia Country Director, Mastercard Foundation" },
        { name: "Nebil Kellow", role: "Managing Director, First Consult" },
      ],
      referencesTitle: "Works cited in the original module",
      references:
        "World Bank; OECD/INFE; International Labour Organization (ILO); Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ); Consumer Financial Protection Bureau (CFPB); Bank of Uganda; Reserve Bank of India; Kilimo Trust; Mengesha et al. (2020); National Bank of Ethiopia, Financial Inclusion Strategy (2017); FDRE Proclamation No. 1147/2019.",
      original: "The original module is published by the National Bank of Ethiopia at nbe.gov.et.",
    },
  },
  am: {
    eyebrow: "ኢንቨስቶፒያ አካዳሚ · ነፃ ኮርስ",
    title: "የፋይናንስ ዕውቀት ለሁሉም",
    subhead:
      "ስለ ንግድ፣ ግብ ማስቀመጥ፣ በጀት፣ ቁጠባ፣ ብድር እና ገንዘብን በጥንቃቄ ስለመያዝ የሚያስተምሩ፣ በሥዕል የተደገፉ አሥር አጫጭር ሞጁሎች። ለሁሉም ክፍት እና ነፃ ነው፤ መመዝገብ አያስፈልግም።",
    start: "ኮርሱን ይጀምሩ",
    continue: "ካቆሙበት ይቀጥሉ",
    modules: "አሥሩ ሞጁሎች",
    module: "ሞጁል",
    minutes: "ደቂቃ",
    lessons: "ትምህርቶች",
    done: "ተጠናቋል",
    howTitle: "ኮርሱ እንዴት ይሠራል",
    how: [
      { title: "በትንሽ በትንሹ ይማሩ", text: "እያንዳንዱ ሞጁል በጥቂት ደቂቃዎች የሚነበቡ፣ በሥዕል የተደገፉ አጫጭር ትምህርቶች አሉት።" },
      { title: "ይመልከቱ፣ ከዚያ ይሞክሩ", text: "ተንቀሳቃሽ ሥዕሎች እያንዳንዱን ሐሳብ ያሳያሉ፤ የሕይወት ምሳሌዎችም በተግባር ያሳያሉ።" },
      { title: "የተማሩትን ይፈትሹ", text: "እያንዳንዱ ሞጁል በአጭር ጥያቄ ይጠናቀቃል። እድገትዎ በዚህ መሣሪያ ላይ ይቀመጣል።" },
    ],
    objectives: "በዚህ ሞጁል የሚከተሉትን ይማራሉ",
    contents: "በዚህ ሞጁል ውስጥ",
    example: "ምሳሌ",
    tip: "ጠቃሚ ምክር",
    takeaways: "ሊያስታውሷቸው የሚገቡ ቁልፍ ነጥቦች",
    quiz: "ግንዛቤዎን ይፈትሹ",
    quizIntro: "ለእያንዳንዱ ጥያቄ አንድ መልስ ይምረጡ።",
    correct: "ትክክል ነው።",
    notQuite: "ትክክል አይደለም።",
    score: (n: number, total: number) => `ውጤትዎ፦ ከ${total} ጥያቄዎች ${n} ትክክል።`,
    retry: "ጥያቄዎቹን እንደገና ይሞክሩ",
    markDone: "ይህን ሞጁል እንደተጠናቀቀ ምልክት ያድርጉ",
    markedDone: "ሞጁሉ ተጠናቋል",
    previous: "ያለፈው ሞጁል",
    next: "ቀጣዩ ሞጁል",
    backToCourse: "ሁሉም ሞጁሎች",
    progress: (n: number, total: number) => `${n}/${total} ሞጁሎች ተጠናቀዋል`,
    source: "በኢትዮጵያ ብሔራዊ ባንክ ከታተመው፣ በቅድስት ማርያም ዩኒቨርሲቲ እና በፈርስት ኮንሰልት ከተዘጋጀው እና በማስተርካርድ ፋውንዴሽን ድጋፍ ከተሠራው የወጣቶች እና የጥቃቅን፣ አነስተኛና መካከለኛ ኢንተርፕራይዞች የፋይናንስ ትምህርት ሞጁል (2016 ዓ.ም.) የተወሰደ።",
    otherLanguage: "Read this course in English",
    seeCredits: "ሙሉ መግለጫውን እና ምስጋናውን ያንብቡ",
    credits: {
      title: "የምንጭ መግለጫ እና ምስጋና",
      declaration: [
        "ኢንቨስቶፒያ፣ የኢሩዳይት አፍሪካ ኢንቨስትመንትስ ኃ.የተ.የግ.ማ. መድረክ፣ የዚህ ኮርስ ይዘት በኢትዮጵያ ብሔራዊ ባንክ በግንቦት 2016 ዓ.ም. (May 2024) ከታተመው የወጣቶች እና የጥቃቅን፣ አነስተኛና መካከለኛ ኢንተርፕራይዞች መሠረታዊ ደረጃ የፋይናንስ ትምህርት ሞጁል እና ከአማርኛ ቅጂው የተወሰደ መሆኑን ያረጋግጣል።",
        "የዚህ ኮርስ ዕውቀት፣ ፅንሰ ሐሳቦች፣ ምሳሌዎች እና አወቃቀር ከዚህ በታች ለተጠቀሱት አዘጋጆች እና ተቋማት የሚገቡ ናቸው። ኢንቨስቶፒያ ያደረገው ዋናውን ሰነድ ለኦንላይን ትምህርት እንዲመች ማቅለል፣ ማሳጠር፣ በሥዕል ማስደገፍ እና ማደራጀት ብቻ ነው። በዚህ ማስተካከያ ሂደት የተፈጠረ ማንኛውም ስሕተት የኢንቨስቶፒያ ኀላፊነት ነው።",
        "ይህ ኮርስ ለሕዝብ የፋይናንስ ትምህርት በነፃ የቀረበ ነው። የኢትዮጵያ ብሔራዊ ባንክ ይፋዊ ኅትመት አይደለም፤ እዚህ የተጠቀሱት ተቋማትም ይህን ማስተካከያ አልገመገሙም ወይም አላጸደቁም።",
      ],
      institutionsTitle: "የዋናው ሞጁል አዘጋጆች እና ተቋማት",
      institutions: [
        { name: "የኢትዮጵያ ብሔራዊ ባንክ", role: "ሞጁሉን ያሳተመ፤ በፋይናንስ ትምህርት ስትራቴጂው (2021-2025) መሠረት የተዘጋጀ" },
        { name: "የቅድስት ማርያም ዩኒቨርሲቲ", role: "ሞጁሉን ያዘጋጀ" },
        { name: "ፈርስት ኮንሰልት", role: "በብሪጅስ (BRIDGES) መርሐ ግብር ከቅድስት ማርያም ዩኒቨርሲቲ እና ከኢትዮጵያ ብሔራዊ ባንክ ጋር በመተባበር ያዘጋጀ" },
        { name: "ማስተርካርድ ፋውንዴሽን", role: "በብሪጅስ (BRIDGES) መርሐ ግብር የሞጁሉን ዝግጅት የደገፈ" },
        { name: "የፋይናንስ ትምህርት የሥራ ቡድን", role: "ለይዘቱ አስተዋጽኦ ያደረጉ የፋይናንስ ባለሙያዎች እና የተለያዩ ድርጅቶች ተወካዮች" },
      ],
      prefaceTitle: "የዋናውን ሞጁል መቅድም የፈረሙ",
      preface: [
        { name: "H.E. Mamo Mihretu", role: "ገዥ፣ የኢትዮጵያ ብሔራዊ ባንክ" },
        { name: "Samuel Yalew", role: "የኢትዮጵያ ሀገር ዳይሬክተር፣ ማስተርካርድ ፋውንዴሽን" },
        { name: "Nebil Kellow", role: "ማኔጂንግ ዳይሬክተር፣ ፈርስት ኮንሰልት" },
      ],
      referencesTitle: "በዋናው ሞጁል የተጠቀሱ ሥራዎች",
      references:
        "World Bank; OECD/INFE; International Labour Organization (ILO); Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ); Consumer Financial Protection Bureau (CFPB); Bank of Uganda; Reserve Bank of India; Kilimo Trust; Mengesha et al. (2020); National Bank of Ethiopia, Financial Inclusion Strategy (2017); FDRE Proclamation No. 1147/2019.",
      original: "ዋናው ሞጁል በኢትዮጵያ ብሔራዊ ባንክ ድረ ገጽ nbe.gov.et ላይ ይገኛል።",
    },
  },
};

export type CourseCopy = (typeof courseCopy)["en"];
