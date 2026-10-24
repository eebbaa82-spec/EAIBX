export const brand = {
  name: "Investopia",
  fullName: "Investopia by Erudite Africa",
  operator: "Erudite Africa Investments PLC",
  tagline: "Powering Smarter Business Decisions.",
};

/**
 * The courses live on their own site, the Erudite Africa Center of Excellence at
 * eruditeafrica.et. The same code builds both sites: NEXT_PUBLIC_SITE=coe builds
 * the course site, anything else builds Investopia.
 */
export const isCoe = process.env.NEXT_PUBLIC_SITE === "coe";

/** A link to an Investopia page: relative on Investopia, absolute from the course site. */
export const mainSite = (path: string) => (isCoe ? `https://investopia.et${path}` : path);

export const academy = {
  name: "Erudite Africa Center of Excellence",
  short: "Center of Excellence",
  mark: "EA",
  host: "eruditeafrica.et",
  url: "https://eruditeafrica.et",
  tagline: "Practical banking and finance training for Ethiopia.",
  email: "training@eruditeafrica.com",
  partner: {
    name: "Kotebe University of Education",
    role: "Curriculum Development Partner",
    logo: "/academy/brand/kue-logo.png",
  },
};

/** From the Erudite Africa Investments PLC corporate profile (2026). */
export const company = {
  address: "Rehobot Apartment Building, 1st Floor, Bole Medhanealem, Addis Ababa, Ethiopia",
  addressDetail: "In front of Kebe Cake, Bole Medhanealem",
  poBox: "P.O. Box 25378/1000",
  phoneOffice: "+251 11 668 7093",
  phoneMobile: "+251 911 249 844",
  email: "investopia@eruditeafrica.com",
  careersEmail: "investopia@eruditeafrica.com",
  website: "www.eruditeafrica.com",
  registrationNo: "MT/AA/2/0063282/2018",
  officeHours: "Monday to Friday, 8:30 a.m. to 5:30 p.m.",
};

/** The inbox for the site being built: training@ on the course site, investopia@ on Investopia. */
export const contactEmail = isCoe ? academy.email : company.email;

export type NavItem = { label: string; href: string; description?: string };
export type NavMenu = { label: string; href?: string; items?: NavItem[] };

export const mainNav: NavMenu[] = [
  {
    label: "Explore",
    items: [
      { label: "Opportunities Marketplace", href: "/marketplace", description: "Businesses raising capital or for sale" },
      { label: "Investors", href: "/investors", description: "Who is funding Ethiopian business" },
      { label: "Advisors", href: "/advisors", description: "Vetted experts to help you close" },
    ],
  },
  {
    label: "Grow",
    items: [
      { label: "Programs", href: "/programs", description: "Incubation and acceleration cohorts" },
      { label: "Mentors", href: "/mentors", description: "Learn from people who have built it" },
    ],
  },
  {
    label: "Recover",
    items: [
      { label: "EHIRA Assessment", href: "/diagnostics", description: "Health and investment readiness in 15 minutes" },
      { label: "Business Recovery", href: "/recovery", description: "A guided path back to stability" },
      { label: "Credit Management Center", href: "/credit-center", description: "Stronger lender relationships, faster due diligence" },
    ],
  },
  {
    label: "Invest",
    items: [
      { label: "Deal Rooms", href: "/deal-rooms", description: "Curated, verified deal flow" },
      { label: "For Investors", href: "/for-investors", description: "How Investopia works for you" },
      { label: "Valuation Tools", href: "/tools", description: "Price a business with confidence" },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Knowledge Hub", href: "/knowledge" },
      { label: "Sector Reports", href: "/knowledge/sectors" },
      { label: "Regulations and Research", href: "/knowledge/regulations" },
      { label: "Events", href: "/events" },
      { label: "Blog", href: "/blog" },
      { label: "Training: Center of Excellence", href: "https://eruditeafrica.et/academy/" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];

export const footerColumns: { heading: string; links: NavItem[] }[] = [
  {
    heading: "For Entrepreneurs",
    links: [
      { label: "Raise capital", href: "/for-entrepreneurs" },
      { label: "Sell your business", href: "/marketplace/new" },
      { label: "Join a program", href: "/programs" },
      { label: "Find a mentor", href: "/mentors" },
      { label: "EHIRA Assessment", href: "/diagnostics" },
    ],
  },
  {
    heading: "For Investors",
    links: [
      { label: "Browse opportunities", href: "/marketplace" },
      { label: "Deal Rooms", href: "/deal-rooms" },
      { label: "Become a verified investor", href: "/investors/verify" },
      { label: "Valuation tools", href: "/tools" },
      { label: "Sector reports", href: "/knowledge/sectors" },
      { label: "Investor FAQ", href: "/faq#investors" },
    ],
  },
  {
    heading: "For Partners",
    links: [
      { label: "Partner with us", href: "/partners" },
      { label: "Run a program on Investopia", href: "/for-partners" },
      { label: "Sponsor a cohort", href: "/partners#ways-to-partner" },
      { label: "List as an advisor", href: "/for-advisors" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Investopia", href: "/about" },
      { label: "Our team", href: "/about/team" },
      { label: "Careers", href: "/about/careers" },
      { label: "Press", href: "/about/press" },
      { label: "Blog", href: "/blog" },
      { label: "Training: Center of Excellence", href: "https://eruditeafrica.et/academy/" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact us", href: "/contact" },
      { label: "Trust and safety", href: "/legal/community" },
      { label: "Legal", href: "/legal/terms" },
    ],
  },
];

export const legalLinks: NavItem[] = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Investor Disclaimer", href: "/legal/investor-disclaimer" },
];

export const socialLinks = ["LinkedIn", "X", "Facebook", "Telegram", "YouTube"];
