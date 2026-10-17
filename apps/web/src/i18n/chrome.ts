import type { Locale } from "./config";

/**
 * Site-wide words (menu, footer, buttons), keyed by the English text.
 * A missing key falls back to English. Amharic and Afaan Oromoo are drafts
 * pending native review.
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
  "EHIRA Assessment": "የEHIRA ግምገማ",
  "Health and investment readiness in 15 minutes": "የንግድ ጤናና የኢንቨስትመንት ዝግጁነት በ15 ደቂቃ",
  "Business Recovery": "የንግድ ማገገሚያ",
  "A guided path back to stability": "ወደ መረጋጋት የሚመልስ የተመራ መንገድ",
  "Credit Management Center": "የብድር አስተዳደር ማዕከል",
  "Stronger lender relationships, faster due diligence": "ጠንካራ የአበዳሪ ግንኙነት፣ ፈጣን የደንበኛ ማጣራት",
  "Deal Rooms": "የስምምነት ክፍሎች",
  "Curated, verified deal flow": "የተመረጡና የተረጋገጡ የኢንቨስትመንት ዕድሎች",
  "For Investors": "ለባለሀብቶች",
  "How Kena works for you": "Kena ለእርስዎ እንዴት እንደሚሠራ",
  "Valuation Tools": "የዋጋ ትመና መሣሪያዎች",
  "Price a business with confidence": "የንግድን ዋጋ በእርግጠኝነት ይገምቱ",
  "Knowledge Hub": "የዕውቀት ማዕከል",
  "Sector Reports": "የዘርፍ ሪፖርቶች",
  "Regulations and Research": "ሕጎችና ጥናቶች",
  Events: "ዝግጅቶች",
  Blog: "ብሎግ",
  // Header
  "Log in": "ይግቡ",
  "Join Kena": "Kenaን ይቀላቀሉ",
  "Open menu": "ምናሌውን ክፈት",
  "Close menu": "ምናሌውን ዝጋ",
  "Skip to content": "ወደ ይዘቱ ይዝለሉ",
  "Kena home": "የKena መነሻ ገጽ",
  // Footer
  "The Kena Brief": "የKena ዜና መጽሔት",
  "Deals, programs and insights from Ethiopia's growth economy, every two weeks.":
    "ከኢትዮጵያ እያደገ ካለው ኢኮኖሚ የተገኙ ስምምነቶች፣ ፕሮግራሞችና ግንዛቤዎች፣ በየሁለት ሳምንቱ።",
  "Email address": "የኢሜይል አድራሻ",
  Subscribe: "ይመዝገቡ",
  "No spam. Unsubscribe any time.": "አላስፈላጊ መልዕክት አንልክም። በማንኛውም ጊዜ ምዝገባዎን ማቋረጥ ይችላሉ።",
  "Thanks for subscribing. (Preview only: not connected yet.)": "ስለተመዘገቡ እናመሰግናለን። (ቅድመ ዕይታ ብቻ፤ ገና አልተገናኘም።)",
  "Building Trust in Every Deal.": "በእያንዳንዱ ስምምነት እምነትን እንገነባለን።",
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
  "Run a program on Kena": "በKena ላይ ፕሮግራም ያካሂዱ",
  "Sponsor a cohort": "የሥልጠና ቡድን ስፖንሰር ያድርጉ",
  "List as an advisor": "እንደ አማካሪ ይመዝገቡ",
  "About Kena": "ስለ Kena",
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
    "© 2026 ኤሩዳይት አፍሪካ ኢንቨስትመንትስ ኃ.የተ.የግ.ማ.። በኢትዮጵያ የተመዘገበ፣ የምዝገባ ቁጥር {reg}። Kena የንግድ ማገናኛና የመረጃ መድረክ ነው። የኢንቨስትመንት ምክር አይሰጥም፤ የሰነደ ሙዓለ ንዋዮች ገበያም አይደለም።",
  // Trust bar
  "Verified profiles": "የተረጋገጡ መገለጫዎች",
  "Secure deal rooms": "ደህንነታቸው የተጠበቀ የስምምነት ክፍሎች",
  "Data hosted on secure cloud infrastructure": "መረጃ ደህንነቱ በተጠበቀ የክላውድ መሠረተ ልማት ላይ ይቀመጣል",
  "Built in Ethiopia for Ethiopia": "በኢትዮጵያ ለኢትዮጵያ የተገነባ",
  // Language switch
  Language: "ቋንቋ",
  // Translation notice
  draftNotice: "ይህ ገጽ የአማርኛ ረቂቅ ትርጉም ሲሆን በባለሙያ እየተገመገመ ነው።",
  readInEnglish: "በእንግሊዝኛ ያንብቡ",
};

/** Draft Afaan Oromoo (Qubee), pending native review. */
const om: Record<string, string> = {
  // Menu
  Explore: "Qoradhu",
  Grow: "Guddadhu",
  Recover: "Deebi'i",
  Invest: "Invest godhi",
  Learn: "Baradhu",
  Pricing: "Gatii",
  "Opportunities Marketplace": "Gabaa Carraawwanii",
  "Businesses raising capital or for sale": "Daldaltoota kaappitaala walitti qabaa jiran ykn gurgurtaaf dhiyaatan",
  Investors: "Invastaroota",
  "Who is funding Ethiopian business": "Eenyutu daldala Itoophiyaa maallaqaan deggeraa jira",
  Advisors: "Gorsitoota",
  "Vetted experts to help you close": "Ogeeyyii qoratamanii fi waliigaltee keessan xumuruuf isin gargaaran",
  Programs: "Sagantaalee",
  "Incubation and acceleration cohorts": "Garee inkubeeshinii fi saffisiisaa",
  Mentors: "Gorsitoota Muuxannoo",
  "Learn from people who have built it": "Namoota daldala ijaaran irraa baradhaa",
  Academy: "Akkaadamii",
  "Banking, credit and investment training": "Leenjii baankii, liqii fi investimentii",
  "EHIRA Assessment": "Madaallii EHIRA",
  "Health and investment readiness in 15 minutes": "Fayyaa daldalaa fi qophaa'ina investimentii daqiiqaa 15 keessatti",
  "Business Recovery": "Deebi'anii Dandamachuu Daldalaa",
  "A guided path back to stability": "Karaa qajeelfamaa tasgabbiitti deebisu",
  "Credit Management Center": "Giddugala Bulchiinsa Liqii",
  "Stronger lender relationships, faster due diligence": "Hariiroo liqeessitootaa cimaa, qorannoo maamilaa saffisaa",
  "Deal Rooms": "Kutaalee Waliigaltee",
  "Curated, verified deal flow": "Carraawwan investimentii filatamanii fi mirkanaa'an",
  "For Investors": "Invastarootaaf",
  "How Kena works for you": "Kena akkamitti isiniif hojjeta",
  "Valuation Tools": "Meeshaalee Madaallii Gatii",
  "Price a business with confidence": "Gatii daldalaa amanamummaan tilmaamaa",
  "Knowledge Hub": "Giddugala Beekumsaa",
  "Sector Reports": "Gabaasa Damee",
  "Regulations and Research": "Seeraa fi Qorannoo",
  Events: "Taateewwan",
  Blog: "Bloogii",
  // Header
  "Log in": "Seeni",
  "Join Kena": "Kena Makami",
  "Open menu": "Baafata bani",
  "Close menu": "Baafata cufi",
  "Skip to content": "Gara qabiyyeetti darbi",
  "Kena home": "Fuula jalqabaa Kena",
  // Footer
  "The Kena Brief": "Odeessa Kena",
  "Deals, programs and insights from Ethiopia's growth economy, every two weeks.":
    "Waliigaltee, sagantaalee fi hubannoo dinagdee guddachaa jiru Itoophiyaa irraa, torban lama lamaan.",
  "Email address": "Teessoo imeelii",
  Subscribe: "Galmaa'i",
  "No spam. Unsubscribe any time.": "Ergaa barbaachisaa hin taane hin erginu. Yeroo barbaaddanitti galmee dhaabuu ni dandeessu.",
  "Thanks for subscribing. (Preview only: not connected yet.)": "Galmaa'uu keessaniif galatoomaa. (Agarsiisa qofa: ammaaf hin walqabatne.)",
  "Building Trust in Every Deal.": "Waliigaltee hunda keessatti amanamummaa ijaarra.",
  "A platform by Erudite Africa Investments PLC.": "Waltajjii Erudite Africa Investments PLC'n dhiyaate.",
  "For Entrepreneurs": "Kalaqxota Daldalaatiif",
  "For Partners": "Michootaaf",
  Company: "Waa'ee Dhaabbatichaa",
  Support: "Deggersa",
  "Raise capital": "Kaappitaala walitti qabaa",
  "Sell your business": "Daldala keessan gurgurraa",
  "Join a program": "Sagantaa makamaa",
  "Find a mentor": "Gorsaa argadhaa",
  "Browse opportunities": "Carraawwan ilaalaa",
  "Become a verified investor": "Invastara mirkanaa'e ta'aa",
  "Valuation tools": "Meeshaalee madaallii gatii",
  "Sector reports": "Gabaasa damee",
  "Investor FAQ": "Gaaffilee irra deddeebiin invastarootaa",
  "Partner with us": "Nu waliin hojjedhaa",
  "Run a program on Kena": "Kena irratti sagantaa gaggeessaa",
  "Sponsor a cohort": "Garee leenjii deggeraa",
  "List as an advisor": "Akka gorsaatti galmaa'aa",
  "About Kena": "Waa'ee Kena",
  "Our team": "Garee keenya",
  Careers: "Carraa hojii",
  Press: "Miidiyaaf",
  "Help Center": "Giddugala Gargaarsaa",
  FAQ: "Gaaffilee irra deddeebiin",
  "Contact us": "Nu quunnamaa",
  "Trust and safety": "Amanamummaa fi nageenya",
  Legal: "Dhimma seeraa",
  Terms: "Haalawwan tajaajilaa",
  Privacy: "Iccitii",
  Cookies: "Kuukii",
  "Investor Disclaimer": "Akeekkachiisa invastarootaa",
  "Rehobot Apartment Building, 1st Floor, Bole Medhanealem, Addis Ababa, Ethiopia":
    "Gamoo Apaartimantii Rehobot, Darbii 1ffaa, Boolee Medhaneealem, Finfinnee (Addis Ababa), Itoophiyaa",
  footerLegal:
    "© 2026 Erudite Africa Investments PLC. Itoophiyaa keessatti galmaa'e, lakkoofsa galmee {reg}. Kena waltajjii walqunnamsiisaa fi odeeffannoo daldalaa ti. Gorsa investimentii hin kennu; gabaa waraqaalee qabeenyaas miti.",
  // Trust bar
  "Verified profiles": "Ibsa dhuunfaa mirkanaa'e",
  "Secure deal rooms": "Kutaalee waliigaltee nageenya qaban",
  "Data hosted on secure cloud infrastructure": "Daataan bu'uura misoomaa kilaawudii nageenya qabu irra kaa'ama",
  "Built in Ethiopia for Ethiopia": "Itoophiyaa keessatti Itoophiyaaf kan ijaarame",
  // Language switch
  Language: "Afaan",
  // Translation notice
  draftNotice: "Fuulli kun hiika Afaan Oromoo isa jalqabaa ti; ogeeyyiin afaanichaa sakatta'aa jiru.",
  readInEnglish: "Afaan Ingiliziitiin dubbisaa",
};

const en: Record<string, string> = {
  footerLegal:
    "© 2026 Erudite Africa Investments PLC. Registered in Ethiopia, registration no. {reg}. Kena is a business matching and information platform. It does not provide investment advice and is not a securities exchange.",
};

const dictionaries: Record<Locale, Record<string, string>> = { en, am, om };

/** Translate site-wide text; falls back to the English key. */
export function translator(locale: Locale) {
  return (key: string, vars?: Record<string, string>) => {
    let text = dictionaries[locale][key] ?? en[key] ?? key;
    for (const [k, v] of Object.entries(vars ?? {})) text = text.replace(`{${k}}`, v);
    return text;
  };
}
