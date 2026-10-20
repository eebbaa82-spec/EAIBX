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
      "Adapted from the Financial Education Module for the Youth and MSMEs (May 2024) by the National Bank of Ethiopia.",
    otherLanguage: "ይህን ኮርስ በአማርኛ ያንብቡ",
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
    source: "ከኢትዮጵያ ብሔራዊ ባንክ የወጣቶች እና የጥቃቅን፣ አነስተኛና መካከለኛ ኢንተርፕራይዞች የፋይናንስ ትምህርት ሞጁል (2016 ዓ.ም.) የተወሰደ።",
    otherLanguage: "Read this course in English",
  },
};

export type CourseCopy = (typeof courseCopy)["en"];
