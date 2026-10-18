import type { Locale } from "./config";

type Item = { title: string; body: string };

export type HomeCopy = {
  heroTitle: string;
  heroBody: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchButton: string;
  heroButtons: [string, string, string];
  heroNote: string;
  foundingNote: string;
  pathsTitle: string;
  paths: { audience: string; heading: string; body: string; link: string; href: string }[];
  howTitle: string;
  howSteps: Item[];
  howButton: string;
  oppTitle: string;
  oppIntro: string;
  oppEmpty: string;
  oppButton: string;
  whyTitle: string;
  whyItems: Item[];
  programsTitle: string;
  programsIntro: string;
  programsEmpty: string;
  programsButton: string;
  partnerTitle: string;
  partnerBody: string;
  partnerButton: string;
  academyTitle: string;
  academyBody: string;
  academyButton: string;
  ctaTitle: string;
  ctaBody: string;
  ctaJoin: string;
  ctaTalk: string;
};

const en: HomeCopy = {
  heroTitle: "Building Trust in Every Deal.",
  heroBody:
    "Kena Hub is Ethiopia's first complete business and investment platform. Raise capital, sell or buy a business, join an accelerator, fix what is holding you back, and meet investors who are ready to act, all in one trusted place.",
  searchLabel: "Search Kena Hub",
  searchPlaceholder: 'Search businesses, sectors or investors, for example "agro-processing in Oromia"',
  searchButton: "Search",
  heroButtons: ["I'm raising capital", "I'm investing", "I need to turn my business around"],
  heroNote: "Free to join. Verified profiles. Built in Addis Ababa.",
  foundingNote: "Founding members now joining from Addis Ababa, Hawassa, Bahir Dar, Mekelle, Dire Dawa and beyond.",
  pathsTitle: "Choose your path",
  paths: [
    {
      audience: "Entrepreneurs",
      heading: "Grow your idea into a business",
      body: "Join an incubation or acceleration program, get matched with a mentor and build an investor-ready profile.",
      link: "Start growing",
      href: "/for-entrepreneurs",
    },
    {
      audience: "Business owners",
      heading: "Raise capital or sell with confidence",
      body: "List your business privately, share a verified EHIRA score, and talk only to serious, vetted buyers and investors.",
      link: "List your business",
      href: "/marketplace/new",
    },
    {
      audience: "Investors",
      heading: "Find deals you can trust",
      body: "Browse diagnosed, graded opportunities across Ethiopian sectors, request access to deal rooms and track your pipeline in one place.",
      link: "Start investing",
      href: "/for-investors",
    },
    {
      audience: "Businesses under pressure",
      heading: "Recover before it is too late",
      body: "Take a free EHIRA assessment, get a recovery plan from accredited turnaround advisors, and explore restructuring or a managed sale if needed.",
      link: "Begin recovery",
      href: "/recovery",
    },
  ],
  howTitle: "How Kena Hub works",
  howSteps: [
    { title: "Create your profile.", body: "Tell us who you are and what you need. It takes about ten minutes." },
    {
      title: "Get diagnosed.",
      body: "Our Enterprise Health & Investment Readiness Assessment (EHIRA) scores your business across eight dimensions, from finance and operations to governance and investment readiness, with grades A to E.",
    },
    {
      title: "Get matched.",
      body: "Kena Hub introduces you to the right programs, mentors, advisors, investors or buyers based on your profile and score.",
    },
    {
      title: "Close and grow.",
      body: "Share documents in a secure deal room, agree terms with expert support, and keep building with the Academy.",
    },
  ],
  howButton: "See how it works",
  oppTitle: "Opportunities this week",
  oppIntro: "A selection of verified businesses currently raising capital or open to acquisition.",
  oppEmpty:
    "Featured listings will appear here once the first verified businesses go live. Each card shows sector, region, amount sought in ETB and its A to E health grade.",
  oppButton: "Browse all opportunities",
  whyTitle: "The only platform that covers the whole life of a business.",
  whyItems: [
    { title: "From idea to exit.", body: "Incubation, investment, growth and sale on one platform, so your track record follows you." },
    { title: "Scores, not just pitches.", body: "Investors see an independent health grade, not only what a founder chooses to show." },
    { title: "Recovery, not just rescue.", body: "Diagnostics and turnaround support come before a distressed sale, not after." },
    {
      title: "Bank-ready by design.",
      body: "Our Credit Management Center helps businesses manage their bank and MFI relationships, and helps lenders complete client due diligence faster.",
    },
    {
      title: "Made for Ethiopia.",
      body: "Pay in Birr through Chapa or Telebirr, read in Amharic or English, and use templates built for Ethiopian law.",
    },
  ],
  programsTitle: "Programs accepting applications",
  programsIntro: "Incubators, accelerators and competitions run on Kena Hub by leading institutions.",
  programsEmpty: "Open programs will be listed here with their organizer and deadline.",
  programsButton: "See all programs",
  partnerTitle: "Partner with Kena Hub",
  partnerBody:
    "We are working with banks, MFIs, development partners and universities to bring their programs and services to Ethiopian businesses. Partner announcements are coming soon.",
  partnerButton: "Become a partner",
  academyTitle: "Training that builds careers and businesses",
  academyBody:
    "Professional courses and certifications in banking, credit, capital markets and investment banking, plus practical courses for founders, in Amharic and English. Banks and MFIs can enroll whole teams.",
  academyButton: "Explore the Academy",
  ctaTitle: "Your next chapter starts here.",
  ctaBody: "Whether you are starting, scaling, investing or recovering, Kena Hub gives you the people, data and tools to move forward.",
  ctaJoin: "Join Kena Hub free",
  ctaTalk: "Talk to our team",
};

/** Draft translation, pending review by a native Amharic speaker. */
const am: HomeCopy = {
  heroTitle: "በእያንዳንዱ ስምምነት እምነትን እንገነባለን።",
  heroBody:
    "Kena Hub የኢትዮጵያ የመጀመሪያው የተሟላ የንግድና የኢንቨስትመንት መድረክ ነው። ካፒታል ያሰባስቡ፣ ንግድ ይሽጡ ወይም ይግዙ፣ አክስለሬተር ፕሮግራም ይቀላቀሉ፣ ወደኋላ የሚያስቀርዎትን ችግር ይፍቱ፣ እንዲሁም ለመንቀሳቀስ ዝግጁ ከሆኑ ባለሀብቶች ጋር ይገናኙ፤ ሁሉንም በአንድ ታማኝ ቦታ።",
  searchLabel: "Kena Hubን ይፈልጉ",
  searchPlaceholder: "ንግዶችን፣ ዘርፎችን ወይም ባለሀብቶችን ይፈልጉ፤ ለምሳሌ «በኦሮሚያ የግብርና ምርት ማቀነባበር»",
  searchButton: "ፈልግ",
  heroButtons: ["ካፒታል እያሰባሰብኩ ነው", "ኢንቨስት እያደረግኩ ነው", "ንግዴን መልሼ ማቋቋም እፈልጋለሁ"],
  heroNote: "መቀላቀል ነፃ ነው። የተረጋገጡ መገለጫዎች። በአዲስ አበባ የተገነባ።",
  foundingNote: "መሥራች አባላት ከአዲስ አበባ፣ ሀዋሳ፣ ባሕር ዳር፣ መቀሌ፣ ድሬዳዋ እና ከሌሎችም ከተሞች እየተቀላቀሉ ነው።",
  pathsTitle: "መንገድዎን ይምረጡ",
  paths: [
    {
      audience: "ሥራ ፈጣሪዎች",
      heading: "ሀሳብዎን ወደ ንግድ ያሳድጉ",
      body: "የኢንኩቤሽን ወይም የአክስለሬሽን ፕሮግራም ይቀላቀሉ፣ ከመካሪ ጋር ይገናኙ፣ እንዲሁም ለባለሀብቶች ዝግጁ የሆነ መገለጫ ይገንቡ።",
      link: "ማደግ ይጀምሩ",
      href: "/for-entrepreneurs",
    },
    {
      audience: "የንግድ ባለቤቶች",
      heading: "ካፒታል ያሰባስቡ ወይም በእርግጠኝነት ይሽጡ",
      body: "ንግድዎን በሚስጥር ያስመዝግቡ፣ የተረጋገጠ የEHIRA ውጤት ያጋሩ፣ እንዲሁም ከቁም ነገረኛና ከተጣሩ ገዢዎችና ባለሀብቶች ጋር ብቻ ይነጋገሩ።",
      link: "ንግድዎን ያስመዝግቡ",
      href: "/marketplace/new",
    },
    {
      audience: "ባለሀብቶች",
      heading: "የሚታመኑ የኢንቨስትመንት ዕድሎችን ያግኙ",
      body: "በኢትዮጵያ ዘርፎች ውስጥ የተመረመሩና ደረጃ የተሰጣቸውን ዕድሎች ያስሱ፣ የስምምነት ክፍሎችን ለመጠቀም ይጠይቁ፣ እንዲሁም የኢንቨስትመንት ሂደትዎን በአንድ ቦታ ይከታተሉ።",
      link: "ኢንቨስት ማድረግ ይጀምሩ",
      href: "/for-investors",
    },
    {
      audience: "ጫና ውስጥ ያሉ ንግዶች",
      heading: "ጊዜው ሳያልፍ ያገግሙ",
      body: "ነፃ የEHIRA ግምገማ ያድርጉ፣ ዕውቅና ካላቸው የማገገሚያ አማካሪዎች የማገገሚያ ዕቅድ ያግኙ፣ አስፈላጊ ከሆነም መልሶ ማዋቀርን ወይም የሚመራ ሽያጭን ያስቡ።",
      link: "ማገገም ይጀምሩ",
      href: "/recovery",
    },
  ],
  howTitle: "Kena Hub እንዴት ይሠራል",
  howSteps: [
    { title: "መገለጫዎን ይፍጠሩ።", body: "ማን እንደሆኑና ምን እንደሚፈልጉ ይንገሩን። አሥር ደቂቃ ገደማ ይወስዳል።" },
    {
      title: "ምርመራ ያድርጉ።",
      body: "የድርጅት ጤናና የኢንቨስትመንት ዝግጁነት ግምገማችን (EHIRA) ንግድዎን ከፋይናንስና ከሥራ ክንውን እስከ አስተዳደርና የኢንቨስትመንት ዝግጁነት ድረስ በስምንት ዘርፎች ይመዝናል፤ ከደረጃ A እስከ E ይሰጣል።",
    },
    {
      title: "ተገቢውን አጋር ያግኙ።",
      body: "Kena Hub በመገለጫዎና በውጤትዎ መሠረት ተገቢ ከሆኑ ፕሮግራሞች፣ መካሪዎች፣ አማካሪዎች፣ ባለሀብቶች ወይም ገዢዎች ጋር ያገናኝዎታል።",
    },
    {
      title: "ስምምነቱን ያጠናቅቁና ያድጉ።",
      body: "ሰነዶችን ደህንነቱ በተጠበቀ የስምምነት ክፍል ውስጥ ያጋሩ፣ በባለሙያ ድጋፍ ውሎችን ይስማሙ፣ እንዲሁም በአካዳሚው አማካኝነት ማደግዎን ይቀጥሉ።",
    },
  ],
  howButton: "እንዴት እንደሚሠራ ይመልከቱ",
  oppTitle: "የዚህ ሳምንት ዕድሎች",
  oppIntro: "በአሁኑ ጊዜ ካፒታል በማሰባሰብ ላይ ያሉ ወይም ለግዢ ክፍት የሆኑ የተረጋገጡ ንግዶች ምርጫ።",
  oppEmpty:
    "የመጀመሪያዎቹ የተረጋገጡ ንግዶች ሥራ ሲጀምሩ ተመራጭ ዝርዝሮች እዚህ ይታያሉ። እያንዳንዱ ካርድ ዘርፉን፣ ክልሉን፣ የሚፈለገውን የገንዘብ መጠን በብር እና ከA እስከ E ያለውን የጤና ደረጃ ያሳያል።",
  oppButton: "ሁሉንም ዕድሎች ያስሱ",
  whyTitle: "የንግድን አጠቃላይ የሕይወት ዑደት የሚሸፍን ብቸኛው መድረክ።",
  whyItems: [
    { title: "ከሀሳብ እስከ ሽያጭ።", body: "ኢንኩቤሽን፣ ኢንቨስትመንት፣ ዕድገትና ሽያጭ በአንድ መድረክ ላይ፤ ስለዚህ የሥራ ታሪክዎ አብሮዎት ይጓዛል።" },
    { title: "ውጤት እንጂ ገለጻ ብቻ አይደለም።", body: "ባለሀብቶች መሥራቹ ለማሳየት የመረጠውን ብቻ ሳይሆን ገለልተኛ የጤና ደረጃን ያያሉ።" },
    { title: "ማዳን ብቻ ሳይሆን ማገገም።", body: "ምርመራና የማገገሚያ ድጋፍ የሚሰጡት ከአስገዳጅ ሽያጭ በኋላ ሳይሆን በፊት ነው።" },
    {
      title: "ከጅምሩ ለባንክ ዝግጁ።",
      body: "የብድር አስተዳደር ማዕከላችን ንግዶች ከባንኮችና ከአነስተኛ የፋይናንስ ተቋማት ጋር ያላቸውን ግንኙነት እንዲያስተዳድሩ፣ አበዳሪዎችም የደንበኛ ማጣራትን በፍጥነት እንዲያጠናቅቁ ይረዳል።",
    },
    {
      title: "ለኢትዮጵያ የተሠራ።",
      body: "በቻፓ ወይም በቴሌብር በብር ይክፈሉ፣ በአማርኛ ወይም በእንግሊዝኛ ያንብቡ፣ እንዲሁም ለኢትዮጵያ ሕግ የተዘጋጁ ቅጾችን ይጠቀሙ።",
    },
  ],
  programsTitle: "ማመልከቻ የሚቀበሉ ፕሮግራሞች",
  programsIntro: "ግንባር ቀደም ተቋማት በKena Hub ላይ የሚያካሂዷቸው ኢንኩቤተሮች፣ አክስለሬተሮችና ውድድሮች።",
  programsEmpty: "ክፍት ፕሮግራሞች ከአዘጋጃቸውና ከማመልከቻ ማብቂያ ቀናቸው ጋር እዚህ ይዘረዘራሉ።",
  programsButton: "ሁሉንም ፕሮግራሞች ይመልከቱ",
  partnerTitle: "ከKena Hub ጋር ይተባበሩ",
  partnerBody:
    "ፕሮግራሞቻቸውንና አገልግሎቶቻቸውን ለኢትዮጵያ ንግዶች ለማድረስ ከባንኮች፣ ከአነስተኛ የፋይናንስ ተቋማት፣ ከልማት አጋሮችና ከዩኒቨርሲቲዎች ጋር እየሠራን ነው። የአጋርነት ማስታወቂያዎች በቅርቡ ይወጣሉ።",
  partnerButton: "አጋር ይሁኑ",
  academyTitle: "ሙያንና ንግድን የሚገነባ ስልጠና",
  academyBody:
    "በባንክ፣ በብድር፣ በካፒታል ገበያና በኢንቨስትመንት ባንኪንግ የሙያ ኮርሶችና ሰርተፊኬቶች፣ እንዲሁም ለሥራ ፈጣሪዎች ተግባራዊ ኮርሶች፣ በአማርኛና በእንግሊዝኛ። ባንኮችና አነስተኛ የፋይናንስ ተቋማት መላ ቡድኖቻቸውን ማስመዝገብ ይችላሉ።",
  academyButton: "አካዳሚውን ያስሱ",
  ctaTitle: "ቀጣዩ ምዕራፍዎ እዚህ ይጀምራል።",
  ctaBody: "እየጀመሩ፣ እያሰፉ፣ ኢንቨስት እያደረጉ ወይም እያገገሙ ቢሆንም Kena Hub ወደፊት ለመራመድ የሚያስፈልጉዎትን ሰዎች፣ መረጃዎችና መሣሪያዎች ይሰጥዎታል።",
  ctaJoin: "Kena Hubን በነፃ ይቀላቀሉ",
  ctaTalk: "ቡድናችንን ያነጋግሩ",
};

/** Draft translation, pending review by a native Afaan Oromoo speaker. */
const om: HomeCopy = {
  heroTitle: "Waliigaltee Hunda Keessatti Amanamummaa Ijaarra.",
  heroBody:
    "Kena Hub waltajjii daldalaa fi investimentii guutuu Itoophiyaa isa jalqabaa ti. Kaappitaala walitti qabaa, daldala gurgurraa ykn bitadhaa, sagantaa saffisiisaa makamaa, rakkoo isin duubatti hambisu furaa, akkasumas invastaroota tarkaanfii fudhachuuf qophaa'an waliin wal-baraa; hunda isaanii bakka amanamaa tokko keessatti.",
  searchLabel: "Kena Hub keessa barbaadaa",
  searchPlaceholder: "Daldaltoota, dameewwan ykn invastaroota barbaadaa; fakkeenyaaf \"qindaa'ina oomisha qonnaa Oromiyaa keessatti\"",
  searchButton: "Barbaadi",
  heroButtons: ["Kaappitaala walitti qabaan jira", "Invest gochaan jira", "Daldala koo deebisee dandamachiisuun barbaada"],
  heroNote: "Makamuun bilisa. Ibsa dhuunfaa mirkanaa'e. Finfinnee keessatti kan ijaarame.",
  foundingNote: "Miseensonni hundeessitootaa Finfinnee, Hawaasaa, Baahir Daar, Maqalee, Dirree Dhawaa fi magaalota biroo irraa makamaa jiru.",
  pathsTitle: "Karaa keessan filadhaa",
  paths: [
    {
      audience: "Kalaqxota daldalaa",
      heading: "Yaada keessan gara daldalaatti guddisaa",
      body: "Sagantaa inkubeeshinii ykn saffisiisaa makamaa, gorsaa waliin wal-qunnamaa, akkasumas ibsa dhuunfaa invastarootaaf qophaa'e ijaaraa.",
      link: "Guddachuu jalqabaa",
      href: "/for-entrepreneurs",
    },
    {
      audience: "Abbootii daldalaa",
      heading: "Kaappitaala walitti qabaa ykn amanamummaan gurgurraa",
      body: "Daldala keessan iccitiidhaan galmeessaa, qabxii EHIRA mirkanaa'e qoodaa, bittootaa fi invastaroota cimoo fi qoratamaniin qofa haasa'aa.",
      link: "Daldala keessan galmeessaa",
      href: "/marketplace/new",
    },
    {
      audience: "Invastaroota",
      heading: "Carraawwan amanaman argadhaa",
      body: "Carraawwan qoratamanii sadarkaan kennameef dameewwan Itoophiyaa keessaa ilaalaa, kutaalee waliigaltee seenuuf gaafadhaa, adeemsa investimentii keessanis bakka tokkotti hordofaa.",
      link: "Invest gochuu jalqabaa",
      href: "/for-investors",
    },
    {
      audience: "Daldaltoota dhiibbaa jala jiran",
      heading: "Utuu yeroon hin darbin deebi'aa dandamadhaa",
      body: "Madaallii EHIRA bilisaa godhaa, gorsitoota deebisanii dandamachiisuu beekamtii qaban irraa karoora argadhaa, yoo barbaachises irra deebiin qindeessuu ykn gurgurtaa qajeelfamaa ilaalaa.",
      link: "Deebi'anii dandamachuu jalqabaa",
      href: "/recovery",
    },
  ],
  howTitle: "Kena Hub akkamitti hojjeta",
  howSteps: [
    { title: "Ibsa dhuunfaa keessan uumaa.", body: "Eenyu akka taatanii fi maal akka barbaaddan nutti himaa. Gara daqiiqaa kudhanii fudhata." },
    {
      title: "Qoratamaa.",
      body: "Madaalliin Fayyaa Dhaabbataa fi Qophaa'ina Investimentii keenya (EHIRA) daldala keessan kallattiiwwan saddeettiin, maallaqa fi hojii irraa hanga bulchiinsaa fi qophaa'ina investimentiitti, madaala; sadarkaa A hanga E kenna.",
    },
    {
      title: "Wal-simsiifamaa.",
      body: "Kena Hub ibsa dhuunfaa fi qabxii keessan irratti hundaa'uun sagantaalee, gorsitoota, ogeeyyii gorsaa, invastaroota ykn bittoota sirrii ta'an isin wajjin wal-barsiisa.",
    },
    {
      title: "Xumuraa fi guddadhaa.",
      body: "Sanadoota kutaa waliigaltee nageenya qabu keessatti qoodaa, deggersa ogeessaatiin haalawwan irratti waliigalaa, Akkaadamii waliin ijaaruu itti fufaa.",
    },
  ],
  howButton: "Akkamitti akka hojjetu ilaalaa",
  oppTitle: "Carraawwan torban kanaa",
  oppIntro: "Daldaltoota mirkanaa'anii amma kaappitaala walitti qabaa jiran ykn bittaaf banaa ta'an keessaa filatamoo.",
  oppEmpty:
    "Daldaltoonni mirkanaa'an jalqabaa hojii yommuu eegalan tarreeffamni filatamoon asitti mul'atu. Kaardiin tokkoon tokkoon isaa damee, naannoo, hanga maallaqa barbaadamu qarshiidhaan fi sadarkaa fayyaa A hanga E agarsiisa.",
  oppButton: "Carraawwan hunda ilaalaa",
  whyTitle: "Waltajjii qofa jireenya daldalaa guutuu haguugu.",
  whyItems: [
    { title: "Yaada irraa hanga gurgurtaatti.", body: "Inkubeeshinii, investimentii, guddinaa fi gurgurtaa waltajjii tokko irratti; kanaaf seenaan hojii keessanii isin hordofa." },
    { title: "Qabxii malee dhiyeessa qofa miti.", body: "Invastaroonni waan hundeessaan agarsiisuu filate qofa osoo hin taane, sadarkaa fayyaa walaboo ilaalu." },
    { title: "Fayyisuu qofa osoo hin taane, deebi'anii dandamachuu.", body: "Qorannoo fi deggersi deebisanii dandamachiisuu gurgurtaa dirqamaa dura dhufa, booda miti." },
    {
      title: "Jalqabumaa baankiif qophaa'e.",
      body: "Giddugalli Bulchiinsa Liqii keenya daldaltoonni hariiroo baankii fi dhaabbilee maallaqaa xixiqqoo waliin qaban akka bulchan, liqeessitoonnis qorannoo maamilaa saffisaan akka xumuran gargaara.",
    },
    {
      title: "Itoophiyaaf kan hojjetame.",
      body: "Chapa ykn Telebirr fayyadamuun qarshiidhaan kaffalaa, Afaan Amaaraa ykn Ingiliziitiin dubbisaa, akkasumas unka seera Itoophiyaaf qophaa'e fayyadamaa.",
    },
  ],
  programsTitle: "Sagantaalee iyyannoo fudhachaa jiran",
  programsIntro: "Inkubeetaroota, saffisiistota fi dorgommiiwwan dhaabbileen hangafoonni Kena Hub irratti gaggeessan.",
  programsEmpty: "Sagantaaleen banaa ta'an qindeessaa fi guyyaa xumuraa isaanii waliin asitti tarreeffamu.",
  programsButton: "Sagantaalee hunda ilaalaa",
  partnerTitle: "Kena Hub waliin hojjedhaa",
  partnerBody:
    "Sagantaalee fi tajaajila isaanii daldaltoota Itoophiyaatiif dhiyeessuuf baankota, dhaabbilee maallaqaa xixiqqoo, michoota misoomaa fi yuunivarsiitiiwwan waliin hojjechaa jirra. Beeksisni michummaa dhiyootti ni dhufa.",
  partnerButton: "Michuu ta'aa",
  academyTitle: "Leenjii ogummaa fi daldala ijaaru",
  academyBody:
    "Koorsiiwwan ogummaa fi ragaa baankii, liqii, gabaa kaappitaalaa fi baankii investimentii, akkasumas koorsiiwwan hojiirra oolan hundeessitootaaf, Afaan Amaaraa fi Ingiliziitiin. Baankonni fi dhaabbileen maallaqaa xixiqqoo gareewwan isaanii guutuu galmeessuu danda'u.",
  academyButton: "Akkaadamii qoradhaa",
  ctaTitle: "Boqonnaan keessan itti aanu asitti jalqaba.",
  ctaBody: "Jalqabaa, babal'isaa, invest gochaa ykn deebi'aa dandamachaa jirtanis, Kena Hub namoota, daataa fi meeshaalee fuulduratti isin tarkaanfachiisan isiniif kenna.",
  ctaJoin: "Kena Hub bilisaan makamaa",
  ctaTalk: "Garee keenya haasofsiisaa",
};

export const homeCopy: Partial<Record<Locale, HomeCopy>> = { en, am, om };
