import type { Locale } from "./config";

/**
 * Site-wide words (menu, footer, buttons), keyed by the English text.
 * A missing key falls back to English. Amharic is a draft pending native review;
 * Afaan Oromo is not started yet.
 */
const am: Record<string, string> = {
  // Menu
  Explore: "ያስሱ",
  Grow: "ያሳድጉ",
  Recover: "ያገግሙ",
  Invest: "ኢንቨስት ያድርጉ",
  Learn: "ይማሩ",
  Pricing: "ዋጋ",
  "Opportunities Marketplace": "የዕድሎች ገበያ",
  "Businesses raising capital or for sale": "ካፒታል የሚያሰባስቡ ወይም ለሽያጭ የቀረቡ ንግዶች",
  Investors: "ባለሀብቶች",
  "Who is funding Ethiopian business": "የኢትዮጵያን ንግድ በገንዘብ የሚደግፉት እነማን ናቸው",
  Advisors: "አማካሪዎች",
  "Vetted experts to help you close": "ስምምነትዎን ለማጠናቀቅ የሚረዱ የተጣሩ ባለሙያዎች",
  Programs: "ፕሮግራሞች",
  "Incubation and acceleration cohorts": "የኢንኩቤሽንና የአክስለሬሽን ፕሮግራሞች",
  Mentors: "መካሪዎች",
  "Learn from people who have built it": "ንግድ ከገነቡ ሰዎች ይማሩ",
  Academy: "አካዳሚ",
  "Banking, credit and investment training": "የባንክ፣ የብድርና የኢንቨስትመንት ስልጠና",
  "Business Health Check": "የንግድ ጤና ምርመራ",
  "Know where you stand in 20 minutes": "ያሉበትን ሁኔታ በ20 ደቂቃ ይወቁ",
  "Business Recovery": "የንግድ ማገገሚያ",
  "A guided path back to stability": "ወደ መረጋጋት የሚመልስ የተመራ መንገድ",
  "Credit Management Center": "የብድር አስተዳደር ማዕከል",
  "Stronger lender relationships, faster due diligence": "ጠንካራ የአበዳሪ ግንኙነት፣ ፈጣን የደንበኛ ማጣራት",
  "Deal Rooms": "የስምምነት ክፍሎች",
  "Curated, verified deal flow": "የተመረጡና የተረጋገጡ የኢንቨስትመንት ዕድሎች",
  "For Investors": "ለባለሀብቶች",
  "How EABIX works for you": "EABIX ለእርስዎ እንዴት እንደሚሠራ",
  "Valuation Tools": "የዋጋ ትመና መሣሪያዎች",
  "Price a business with confidence": "የንግድን ዋጋ በእርግጠኝነት ይገምቱ",
  "Knowledge Hub": "የዕውቀት ማዕከል",
  "Sector Reports": "የዘርፍ ሪፖርቶች",
  "Regulations and Research": "ሕጎችና ጥናቶች",
  Events: "ዝግጅቶች",
  Blog: "ብሎግ",
  // Header
  "Log in": "ይግቡ",
  "Join EABIX": "EABIXን ይቀላቀሉ",
  "Open menu": "ምናሌውን ክፈት",
  "Close menu": "ምናሌውን ዝጋ",
  "Skip to content": "ወደ ይዘቱ ይዝለሉ",
  "EABIX home": "የEABIX መነሻ ገጽ",
  // Footer
  "The EABIX Brief": "የEABIX ዜና መጽሔት",
  "Deals, programs and insights from Ethiopia's growth economy, every two weeks.":
    "ከኢትዮጵያ እያደገ ካለው ኢኮኖሚ የተገኙ ስምምነቶች፣ ፕሮግራሞችና ግንዛቤዎች፣ በየሁለት ሳምንቱ።",
  "Email address": "የኢሜይል አድራሻ",
  Subscribe: "ይመዝገቡ",
  "No spam. Unsubscribe any time.": "አላስፈላጊ መልዕክት አንልክም። በማንኛውም ጊዜ ምዝገባዎን ማቋረጥ ይችላሉ።",
  "Thanks for subscribing. (Preview only: not connected yet.)": "ስለተመዘገቡ እናመሰግናለን። (ቅድመ ዕይታ ብቻ፤ ገና አልተገናኘም።)",
  "EABIX, the Erudite Africa Business & Investment Exchange. Where Ideas Grow, Investments Flow, and Businesses Recover.":
    "EABIX፣ ኤሩዳይት አፍሪካ የንግድና የኢንቨስትመንት ልውውጥ። ሀሳቦች የሚያድጉበት፣ ኢንቨስትመንት የሚፈስበት፣ ንግዶች የሚያገግሙበት።",
  "A platform by Erudite Africa Investments PLC.": "በኤሩዳይት አፍሪካ ኢንቨስትመንትስ ኃ.የተ.የግ.ማ. የቀረበ መድረክ።",
  "For Entrepreneurs": "ለሥራ ፈጣሪዎች",
  "For Partners": "ለአጋሮች",
  Company: "ስለ ድርጅቱ",
  Support: "ድጋፍ",
  "Raise capital": "ካፒታል ያሰባስቡ",
  "Sell your business": "ንግድዎን ይሽጡ",
  "Join a program": "ፕሮግራም ይቀላቀሉ",
  "Find a mentor": "መካሪ ያግኙ",
  "Browse opportunities": "ዕድሎችን ያስሱ",
  "Become a verified investor": "የተረጋገጠ ባለሀብት ይሁኑ",
  "Valuation tools": "የዋጋ ትመና መሣሪያዎች",
  "Sector reports": "የዘርፍ ሪፖርቶች",
  "Investor FAQ": "የባለሀብቶች ተደጋጋሚ ጥያቄዎች",
  "Partner with us": "ከእኛ ጋር ይተባበሩ",
  "Run a program on EABIX": "በEABIX ላይ ፕሮግራም ያካሂዱ",
  "Sponsor a cohort": "የሥልጠና ቡድን ስፖንሰር ያድርጉ",
  "List as an advisor": "እንደ አማካሪ ይመዝገቡ",
  "About EABIX": "ስለ EABIX",
  "Our team": "ቡድናችን",
  Careers: "የሥራ ዕድሎች",
  Press: "ለሚዲያ",
  "Help Center": "የእገዛ ማዕከል",
  FAQ: "ተደጋጋሚ ጥያቄዎች",
  "Contact us": "ያግኙን",
  "Trust and safety": "እምነትና ደህንነት",
  Legal: "ሕጋዊ ጉዳዮች",
  Terms: "የአገልግሎት ውል",
  Privacy: "ግላዊነት",
  Cookies: "ኩኪዎች",
  "Investor Disclaimer": "ለባለሀብቶች ማሳሰቢያ",
  "Rehobot Apartment Building, 1st Floor, Bole Medhanealem, Addis Ababa, Ethiopia":
    "ረሆቦት አፓርትመንት ሕንፃ፣ 1ኛ ፎቅ፣ ቦሌ መድኃኔዓለም፣ አዲስ አበባ፣ ኢትዮጵያ",
  footerLegal:
    "© 2026 ኤሩዳይት አፍሪካ ኢንቨስትመንትስ ኃ.የተ.የግ.ማ.። በኢትዮጵያ የተመዘገበ፣ የምዝገባ ቁጥር {reg}። EABIX የንግድ ማገናኛና የመረጃ መድረክ ነው። የኢንቨስትመንት ምክር አይሰጥም፤ የሰነደ ሙዓለ ንዋዮች ገበያም አይደለም።",
  // Trust bar
  "Verified profiles": "የተረጋገጡ መገለጫዎች",
  "Secure deal rooms": "ደህንነታቸው የተጠበቀ የስምምነት ክፍሎች",
  "Data hosted on secure cloud infrastructure": "መረጃ ደህንነቱ በተጠበቀ የክላውድ መሠረተ ልማት ላይ ይቀመጣል",
  "Built in Ethiopia for Ethiopia": "በኢትዮጵያ ለኢትዮጵያ የተገነባ",
  // Language switch
  Language: "ቋንቋ",
  "Afaan Oromoo version coming soon": "የአፋን ኦሮሞ ቅጂ በቅርቡ ይቀርባል",
  // Translation notice
  draftNotice: "ይህ ገጽ የአማርኛ ረቂቅ ትርጉም ሲሆን በባለሙያ እየተገመገመ ነው።",
  readInEnglish: "በእንግሊዝኛ ያንብቡ",
};

const en: Record<string, string> = {
  footerLegal:
    "© 2026 Erudite Africa Investments PLC. Registered in Ethiopia, registration no. {reg}. EABIX is a business matching and information platform. It does not provide investment advice and is not a securities exchange.",
};

const dictionaries: Record<Locale, Record<string, string>> = { en, am, om: {} };

/** Translate site-wide text; falls back to the English key. */
export function translator(locale: Locale) {
  return (key: string, vars?: Record<string, string>) => {
    let text = dictionaries[locale][key] ?? en[key] ?? key;
    for (const [k, v] of Object.entries(vars ?? {})) text = text.replace(`{${k}}`, v);
    return text;
  };
}
