/**
 * Interest-free banking (IFB) financing products and modes, drawn from the 2025
 * IFB financing business procedure of an Ethiopian commercial bank (never named):
 * its Sharia'h screening, mode rules, product terms, own contributions and
 * collateral cover. Each bank's Sharia'h Advisory Committee (SAC) approves its own
 * products, so these are presented as typical, not one lender's rules.
 */

export type IfbModeId = "murabaha" | "salam" | "istisna" | "ijarah" | "dm" | "tijarah" | "tawarruq" | "kafalah" | "wakalah" | "qard";

/** How the bank earns on the mode: a fixed sale price, rent, a service charge, or nothing. */
export type Pricing = "sale" | "rent" | "fee" | "none";

export type IfbMode = { id: IfbModeId; name: string; how: string; pricing: Pricing; docs: string[]; conditions: string[] };

export const ifbModes: IfbMode[] = [
  {
    id: "murabaha",
    name: "Murabaha (cost-plus sale)",
    how: "The bank buys the asset, owns it, then sells it to the customer at its cost plus a profit both sides know, paid later in one sum or in installments.",
    pricing: "sale",
    docs: [
      "Master Murabaha Financing Agreement (promise to purchase)",
      "Security contract (mortgage or pledge)",
      "Purchase request and purchase item specification",
      "Purchase instruction",
      "Agency agreement, if the customer buys the goods as the bank's agent",
      "Purchased item declaration",
      "Offer to purchase and the bank's acceptance of offer",
      "Murabaha sale contract",
      "Schedule of payments showing cost, profit, sale price and installments",
    ],
    conditions: [
      "The asset exists, is permissible and is clearly specified, and the vendor is not related to the customer.",
      "The bank owns and possesses the asset, physically or through title documents, before it sells, and never sells it back to its original owner.",
      "Cost may include direct costs such as transport, storage, assembly, taxes, takaful and letter of credit charges, but not the bank's overheads.",
      "Cost, profit and sale price are fixed before signing; the price never rises for late payment and a sale is never rolled over.",
      "An early payment rebate is at the bank's discretion, not a term of the contract.",
      "In term financing, Murabaha is used for terms of three years or less; longer terms use Ijarah or Diminishing Musharakah.",
    ],
  },
  {
    id: "salam",
    name: "Bai' Salam (advance purchase)",
    how: "The bank pays the full price now for goods, usually crops or other produce, delivered later, with type, quality, quantity, date and place fixed in the contract.",
    pricing: "sale",
    docs: ["Written offer for sale of goods", "Bai' Salam agreement", "Second (parallel) Bai' Salam agreement, if the bank resells the goods", "Notice of delivery", "Goods receiving note"],
    conditions: [
      "Used for the short-term working capital of farmers and producers, when Murabaha cannot serve the need.",
      "The full price is paid at signing, and delivery is at least one month later.",
      "The term is the production cycle or 12 months, whichever is shorter.",
      "The goods have a stable price, are generally available in the market, and are fixed in type, grade, quantity, date and place.",
      "Gold, silver and currency cannot be sold this way, and the buyer of a parallel Salam is not related to the customer.",
    ],
  },
  {
    id: "istisna",
    name: "Istisna' (manufacture or build to order)",
    how: "The bank orders an asset to be made or built to a specification and sells it to the customer, paying the contractor as the work progresses.",
    pricing: "sale",
    docs: ["Written offer for manufacture of goods", "Istisna' agreement with the customer", "Parallel Istisna' agreement with the contractor or manufacturer", "Specifications, drawings and bill of quantities", "Progress certificates for each bill", "Goods receiving note and goods delivery receipt"],
    conditions: [
      "For medium and long-term projects; not for an asset that already exists or a natural product.",
      "Construction runs up to three years (five at most), and repayment up to 15 years after delivery.",
      "Price and delivery date are agreed at signing, and bills are paid as the work progresses.",
      "The contractor gives performance and advance payment guarantees, and the customer's down payment sits in a blocked account.",
      "The asset being built can be held as collateral.",
    ],
  },
  {
    id: "ijarah",
    name: "Ijarah (lease)",
    how: "The bank buys an asset and leases it to the customer for rent; in a lease ending in ownership, the customer gets the asset at the end through a separate promise to gift.",
    pricing: "rent",
    docs: ["Promise to lease and letter of commitment", "Purchase instruction and purchased item declaration", "Ijarah agreement with the rent schedule", "Separate promise to gift the asset at the end", "Takaful cover on the asset"],
    conditions: [
      "The asset is not consumed in use and has an economic life of at least five years.",
      "The term is up to the asset's economic life or ten years, whichever is shorter.",
      "The asset is registered in the customer's name and held as collateral, and the customer pays a down payment.",
      "The customer covers delivery, maintenance and takaful costs.",
      "Rent is reviewed each year from the start of the budget year, within 7% above or below the rate first agreed.",
      "Rent starts only once the customer can use the asset, and transfer of ownership is a separate promise, not a condition of the lease.",
    ],
  },
  {
    id: "dm",
    name: "Diminishing Musharakah (shared ownership)",
    how: "The bank and the customer co-own an asset; the customer pays rent on the bank's share and buys the bank's units over time until it owns the whole.",
    pricing: "rent",
    docs: ["Musharakah agreement setting each partner's share", "Rental agreement for the bank's share, with the rent schedule", "Undertaking to purchase the bank's Musharakah units", "Offer and acceptance, and a unit sale and purchase receipt, for each unit bought"],
    conditions: [
      "The term is up to the asset's economic life or ten years, whichever is shorter.",
      "The bank's share is divided into units; rent is charged only on the units the bank still owns.",
      "The asset is registered in the customer's name, and the lease follows the Ijarah terms.",
      "The customer may buy the remaining units early, and losses on the asset are shared in proportion to ownership.",
    ],
  },
  {
    id: "tijarah",
    name: "Tijarah (finished goods financing)",
    how: "The bank buys a manufacturer's finished goods for cash and appoints the manufacturer as its agent to sell them.",
    pricing: "sale",
    docs: ["Master finished goods agreement", "Agency agreement for the sale of the goods", "Written offer for sale of finished goods", "Goods receiving note", "Confirmation of sale of finished goods"],
    conditions: [
      "Only finished, manufactured, marketable goods, which the bank inspects and pays for on the spot.",
      "The bank owns the goods until the agent sells them, and is repaid from the sale proceeds net of the agency fee.",
      "The customer gives a guarantee or collateral for the buyers' payment.",
    ],
  },
  {
    id: "tawarruq",
    name: "Tawarruq (commodity-based financing)",
    how: "The bank sells a real commodity to the customer on deferred payment, and the customer sells it to a third party for cash.",
    pricing: "sale",
    docs: ["Commodity purchase documents and pro forma invoice", "Deferred sale contract with the customer", "Customer's sale to a third party", "Schedule of payments"],
    conditions: [
      "Each sale is real and separate, between three parties, and the commodity never goes back to its original seller.",
      "The bank takes no part in the customer's resale and has no relation to the final buyer.",
      "Gold, silver, currency and assets still under construction cannot be used.",
    ],
  },
  {
    id: "kafalah",
    name: "Kafalah (guarantee)",
    how: "The bank guarantees to pay a beneficiary if the customer fails to meet an obligation, for a service charge.",
    pricing: "fee",
    docs: ["Guarantee application and counter-indemnity", "Contract, tender or advance payment document behind the guarantee", "Guarantee in the agreed wording"],
    conditions: ["Only a service charge for issuing and administering the guarantee.", "If the bank pays a claim, the customer owes the amount paid with no profit for the time until it repays."],
  },
  {
    id: "wakalah",
    name: "Wakalah (agency)",
    how: "The bank acts as the customer's agent, for example to open and settle a letter of credit, for a service charge.",
    pricing: "fee",
    docs: ["Wakalah (agency) agreement", "Letter of credit application and proforma invoice", "Cash margin held in an interest-free account"],
    conditions: ["The agency fee is fixed and disclosed.", "Any cash margin sits in an interest-free account, not one that pays interest."],
  },
  {
    id: "qard",
    name: "Qard al-Hassan (benevolent financing)",
    how: "Financing with no profit; the bank recovers only a processing fee and the actual costs it is allowed to charge.",
    pricing: "none",
    docs: ["Qard al-Hassan agreement", "Dedicated Wadia'h account, where the product requires one"],
    conditions: ["No profit or return linked to the amount or the time.", "Only a processing fee and the actual costs the SAC allows are charged."],
  },
];

export type IfbProductId =
  | "murabaha-revolving"
  | "murabaha-merchandise"
  | "murabaha-transit"
  | "tijarah"
  | "lc-import"
  | "preshipment-trader"
  | "preshipment-manufacturer"
  | "livestock-export"
  | "guarantee"
  | "tawarruq-term"
  | "share-purchase"
  | "vehicle"
  | "machinery"
  | "building"
  | "industrial-park"
  | "agri-term"
  | "smallholder-machinery"
  | "lc-settlement"
  | "buyout"
  | "conversion"
  | "employment-agency"
  | "qard-term";

export type IfbProduct = {
  id: IfbProductId;
  name: string;
  group: "Trade" | "Export" | "Guarantee" | "Term" | "Qard al-Hassan";
  modes: IfbModeId[];
  purpose: string;
  typicalTerm: string;
  maxMonths?: number;
  minOwnShare?: number;
  needsTrackRecord: boolean;
  noMinimum?: boolean;
  /** Renewed each year and drawn repeatedly, like an overdraft or revolving loan. */
  revolving?: boolean;
  /** Off-balance sheet: a guarantee or a letter of credit, with no installments. */
  offBalance?: boolean;
  docs: string[];
  tips: string[];
};

export const ifbProducts: IfbProduct[] = [
  {
    id: "murabaha-revolving",
    name: "Murabaha revolving financing facility",
    group: "Trade",
    modes: ["murabaha"],
    purpose: "Recurring working capital purchases, local or imported, under one Master Murabaha Financing Agreement",
    typicalTerm: "Up to one year for each purchase, with the limit reviewed each year",
    maxMonths: 12,
    needsTrackRecord: true,
    revolving: true,
    docs: ["Trade licence covering the goods to be bought", "Stock and sales record of the business", "Proforma invoice for each purchase", "Account movement over the past year, at renewal"],
    tips: [
      "Each purchase is a separate sale of at least 25% of the limit, repaid within one year on the same payment terms, set by the working capital cycle.",
      "The total of purchases outstanding stays within the limit. Ask for renewal one month before the limit expires.",
      "Lenders usually look for a banking relationship of at least one year.",
    ],
  },
  {
    id: "murabaha-merchandise",
    name: "Murabaha merchandise financing",
    group: "Trade",
    modes: ["murabaha"],
    purpose: "Stock bought by the bank and sold to you at a fixed price, with the goods pledged in your store",
    typicalTerm: "Up to 180 days for each sale, one year at most",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Trade licence covering the goods", "Customs declaration for imported goods, or valid invoices for local goods", "Storeroom details for the bank's inspection"],
    tips: [
      "Financing is up to 70% of the goods' value, and only for marketable goods you did not own or produce before.",
      "The bank sees the goods arrive and locks the store, keeping one key; goods are released as you pay the matching share of the sale price.",
      "You pay for a guard for the store, and profit runs from the day the goods are stored.",
    ],
  },
  {
    id: "murabaha-transit",
    name: "Murabaha against goods in transit",
    group: "Trade",
    modes: ["murabaha"],
    purpose: "Settling import letter of credit or cash against documents before the goods arrive",
    typicalTerm: "Short term, until the goods are cleared and pledged",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Letter of credit or cash against documents shipping papers", "Tripartite agreement with the transitor", "Import permit and trade licence", "Takaful cover on the goods in transit"],
    tips: [
      "The goods are imported through the same bank, and you apply once it tells you the documents have arrived.",
      "A transitor clears the goods and delivers them to the bank's pledge; the financing is then settled or becomes merchandise financing.",
    ],
  },
  {
    id: "tijarah",
    name: "Tijarah finished goods financing",
    group: "Trade",
    modes: ["tijarah"],
    purpose: "Cash for a local manufacturer that sells finished goods on credit, which the bank buys and you sell as its agent",
    typicalTerm: "Up to 180 days, reviewed every six months",
    maxMonths: 6,
    needsTrackRecord: true,
    docs: ["List of finished goods with quantities and costs", "Financial statements and working capital details", "Sales record and customer list", "Warehouse details for inspection"],
    tips: [
      "Financing is up to 70% of the goods' value, and the goods must be marketable.",
      "The bank checks there is no double financing of the same stock, and you guarantee your buyers' payment.",
      "It suits manufacturers with a clean record with the lender.",
    ],
  },
  {
    id: "lc-import",
    name: "Import letter of credit facility",
    group: "Trade",
    modes: ["wakalah", "murabaha"],
    purpose: "Importing goods through a letter of credit while paying only a cash margin upfront",
    typicalTerm: "Per shipment, with the limit reviewed each year",
    needsTrackRecord: true,
    offBalance: true,
    docs: ["Valid trade licence, investment certificate or other licence", "Proforma invoice", "Cash margin, held in an interest-free account"],
    tips: [
      "The usual minimum margin is 30% of the document value; well-established customers may pay less.",
      "If you cannot pay in full when the documents arrive, the bank can settle the letter of credit and sell you the goods on Murabaha.",
      "You bear the service charges and any exchange-rate differences.",
    ],
  },
  {
    id: "preshipment-trader",
    name: "Murabaha pre-shipment export financing (trading exporters)",
    group: "Export",
    modes: ["murabaha"],
    purpose: "Buying, processing and shipping export goods such as coffee, sesame or pulses against a sales contract",
    typicalTerm: "Up to 180 days for each contract, with the limit reviewed each year",
    maxMonths: 6,
    needsTrackRecord: true,
    docs: [
      "Valid export licence",
      "Export sales contract or bona fide purchase order, paid by letter of credit, cash against documents or advance payment",
      "Receipts for export earnings in the past 12 months",
      "Undertaking to route export proceeds through the lender",
      "Guarantee from the major shareholders",
    ],
    tips: [
      "A sales contract is required; there is no pre-shipment financing without one.",
      "Lenders look for export earnings of at least USD 100,000 in the past year and collateral for half the limit, or two years in business.",
      "Financing is up to 95% of the contract for coffee, 80% for sesame and 70% for other exports, paid through the ECX for traded items.",
    ],
  },
  {
    id: "preshipment-manufacturer",
    name: "Murabaha pre-shipment export financing (manufacturer-exporters)",
    group: "Export",
    modes: ["murabaha"],
    purpose: "Raw materials, processing and shipping for goods you make, such as textiles, leather or processed food, for an export order",
    typicalTerm: "Up to 180 days for each contract, with the limit reviewed each year",
    maxMonths: 6,
    needsTrackRecord: false,
    docs: [
      "Valid export licence, or an investment licence with evidence of trial production for export",
      "Export sales contract or bona fide purchase order",
      "Industrial park lease, if you operate in one",
      "Supplier proforma invoices for the inputs",
      "Guarantee from the major shareholders, or a parent company letter of intent",
    ],
    tips: [
      "Financing is up to 80% of the sales contract, paid straight to your suppliers in one sum or in phases.",
      "A first request usually needs export earnings of USD 100,000 in the past year and collateral for half the limit, or a year in another business.",
    ],
  },
  {
    id: "livestock-export",
    name: "Murabaha livestock export financing",
    group: "Export",
    modes: ["murabaha"],
    purpose: "Buying live animals for an export sales contract",
    typicalTerm: "Up to 180 days for each contract",
    maxMonths: 6,
    needsTrackRecord: true,
    docs: [
      "Valid livestock export licence",
      "Sales contract from a foreign buyer for a set quantity and type of animals",
      "Export proceeds documents for at least three years",
      "Ownership or rent contract for a quarantine site",
      "Insurance of the animals from purchase to shipment",
    ],
    tips: [
      "Lenders look for three years in livestock export, USD 500,000 of exports in the past year and collateral for 75% of the request; otherwise collateral for the full limit.",
      "Financing is up to 70% of the sales contract, and total financing per exporter is capped at ETB 50 million.",
    ],
  },
  {
    id: "guarantee",
    name: "Letter of guarantee (Kafalah)",
    group: "Guarantee",
    modes: ["kafalah"],
    purpose: "Bid, performance, advance payment, supplier credit and retention guarantees",
    typicalTerm: "Validity of the underlying contract, with the facility reviewed each year",
    needsTrackRecord: true,
    offBalance: true,
    noMinimum: true,
    docs: ["Tender document, contract or advance payment agreement behind the guarantee", "Beneficiary's required wording, if any", "Signed counter-indemnity", "National Bank permit, for a guarantee in foreign currency"],
    tips: ["The bank charges only its usual guarantee commission. If the guarantee is called, you owe the amount paid with no profit added for time."],
  },
  {
    id: "tawarruq-term",
    name: "Tawarruq term financing",
    group: "Term",
    modes: ["tawarruq"],
    purpose: "Cash for working capital, through the deferred sale of a commodity in high market demand",
    typicalTerm: "Up to three years",
    maxMonths: 36,
    needsTrackRecord: true,
    docs: ["At least one pro forma invoice for the commodity", "Financial statements", "Projected cash flow showing repayment"],
    tips: ["Lenders look for at least a year of experience, a reliable source of income and acceptable collateral."],
  },
  {
    id: "share-purchase",
    name: "Share purchase financing",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Buying shares in a company whose business is permissible",
    typicalTerm: "Up to five years",
    maxMonths: 60,
    minOwnShare: 30,
    needsTrackRecord: false,
    docs: ["Share transfer documents and the selling company's authenticated minutes", "Memorandum and articles of association, if you are a company", "Feasibility study or business plan", "Evidence of your own contribution"],
    tips: [
      "You pay at least 30% of the share price yourself, and the shares bought stay within 70% of the company's total shares.",
      "The financing cannot exceed the company's paid-up capital, and the company's business must pass the same Sharia'h screening.",
    ],
  },
  {
    id: "vehicle",
    name: "Motor vehicle financing",
    group: "Term",
    modes: ["murabaha", "ijarah", "dm"],
    purpose: "Trucks, buses, pickups and other vehicles for your business",
    typicalTerm: "Up to five years",
    maxMonths: 60,
    minOwnShare: 50,
    needsTrackRecord: true,
    docs: ["Proforma invoice with the vehicle's specification", "Duty-free document, if it applies", "For fuel trucks: tripartite agreement with the oil company paying into your financing account", "Evidence of your own contribution"],
    tips: [
      "You contribute at least 50% of the price, deposited in a blocked account; lenders adjust this for your business and risk grade.",
      "The vehicle is registered as collateral, preferably brand new, and spare parts are not financed.",
    ],
  },
  {
    id: "machinery",
    name: "Machinery and equipment financing",
    group: "Term",
    modes: ["murabaha", "ijarah", "dm"],
    purpose: "Agricultural, industrial or construction machinery and equipment",
    typicalTerm: "Medium to long term",
    minOwnShare: 50,
    needsTrackRecord: false,
    docs: ["Proforma invoices with full specifications", "Duty-free document, if it applies", "Installation site details", "Evidence of your own contribution"],
    tips: [
      "You contribute at least 50% of the price, deposited in a blocked account; advances already paid to the supplier count.",
      "The machinery is registered as collateral, preferably brand new, and spare parts are not financed.",
    ],
  },
  {
    id: "building",
    name: "Building and business premises financing",
    group: "Term",
    modes: ["murabaha", "dm", "ijarah", "istisna"],
    purpose: "Buying, or building to order, premises for your business",
    typicalTerm: "Up to 20 years",
    maxMonths: 240,
    minOwnShare: 50,
    needsTrackRecord: false,
    docs: ["Title deed or sale agreement for the property", "Valuation of the property", "For construction: approved plans, bill of quantities and construction permit", "Business plan and cash flow forecast, if the property is new to your business"],
    tips: ["Repayment is set by your cash flow and the property's condition.", "For a building still to be built, Istisna' lets the bank pay the contractor as the work progresses."],
  },
  {
    id: "industrial-park",
    name: "Investment financing for industrial park enterprises",
    group: "Term",
    modes: ["ijarah", "murabaha", "dm"],
    purpose: "Machinery, vehicles and working capital for an enterprise operating in an industrial park",
    typicalTerm: "Up to the shed lease period less one year",
    minOwnShare: 30,
    needsTrackRecord: false,
    docs: ["Permit to operate in the park and the shed lease agreement", "Business registration and investment licence", "Proforma invoices for the machinery, equipment or vehicles", "Duty-free document, if it applies"],
    tips: ["You contribute at least 30% of the investment, and the financed assets are registered as collateral."],
  },
  {
    id: "agri-term",
    name: "Agricultural term financing",
    group: "Term",
    modes: ["murabaha", "salam", "ijarah"],
    purpose: "Working capital, machinery or a new or expanding farm, with priority to commercial farms producing for export",
    typicalTerm: "One crop season to long term",
    minOwnShare: 40,
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Land-holding certificate or land lease agreement", "Letter from the Woreda, Zone or Ministry of Agriculture", "Farm plan with crops, area and expected yields", "Design and bill of quantities for any civil works", "Insurance for the farm"],
    tips: [
      "A new or expanding project contributes at least 40% of the cost, lowered toward 20% with building collateral; work already done counts once valued.",
      "Project applicants usually need at least 30 hectares and qualified farm experts.",
      "Grace periods run up to five years for plantations such as coffee and three years for other crops.",
    ],
  },
  {
    id: "smallholder-machinery",
    name: "Smallholder farmers' machinery financing",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Tractors, combine harvesters and other machinery for farmers with 2 to 29 hectares, or their cooperatives",
    typicalTerm: "Up to five years, with up to six months' grace",
    maxMonths: 60,
    minOwnShare: 30,
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Land-holding certificate and this year's land rent receipt", "Cooperative registration and the Woreda's confirmation, for a cooperative", "Business plan showing repayment", "Dealer proforma invoice for the machinery", "Undertaking to hire a skilled operator"],
    tips: ["You contribute at least 30% of the machinery price, and the machinery is registered as collateral."],
  },
  {
    id: "lc-settlement",
    name: "Import letter of credit settlement financing",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Settling an import letter of credit or cash against documents when working capital is short",
    typicalTerm: "Short to medium term",
    needsTrackRecord: true,
    docs: ["Letter of credit and shipping documents", "Tripartite agreement with the shipping and logistics enterprise or transitor, for merchandise financing"],
    tips: ["Only letters of credit opened at the same bank qualify; the balance becomes Murabaha merchandise or term financing before the documents are released."],
  },
  {
    id: "buyout",
    name: "Buyout of financing from another bank",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Moving an existing financing to a new lender, in exceptional cases",
    typicalTerm: "As agreed",
    needsTrackRecord: true,
    docs: ["Statement of the outstanding principal from your current bank", "Title deeds or vehicle papers, released once the old financing is paid", "Collateral covering the full amount"],
    tips: ["Only the principal is bought; you pay any other balance yourself, and the financing may be restructured."],
  },
  {
    id: "conversion",
    name: "Conversion of a conventional loan to interest-free financing",
    group: "Term",
    modes: ["murabaha", "dm", "ijarah"],
    purpose: "Moving a conventional loan with the same bank to its interest-free window",
    typicalTerm: "The loan's remaining term",
    needsTrackRecord: true,
    docs: ["Loan statement and repayment history", "Details of the asset the new transaction will be based on"],
    tips: [
      "The loan must be performing, with no case in court, and the business is appraised again.",
      "You sign a new financing and mortgage contract that refers to the earlier loan.",
    ],
  },
  {
    id: "employment-agency",
    name: "Overseas employment agency financing (Qard al-Hassan)",
    group: "Qard al-Hassan",
    modes: ["qard"],
    purpose: "The USD 100,000 deposit an overseas employment agency needs for its licence",
    typicalTerm: "Licence period, reviewed each year",
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Agency licence application or licence, and tax clearance", "Requirement letter from the Ministry of Labor and Skills", "Two Wadia'h accounts: a dedicated account and an operating account", "Guarantee from the major shareholders"],
    tips: [
      "You raise at least 10% of the requirement yourself, and the money sits in the dedicated account, blocked for the Ministry and earning nothing.",
      "A yearly confirmation charge of 1% applies, and foreign currency commissions are routed through the lender.",
    ],
  },
  {
    id: "qard-term",
    name: "Qard al-Hassan term financing",
    group: "Qard al-Hassan",
    modes: ["qard"],
    purpose: "Benevolent financing with no profit, for project or working capital purposes the bank's policy allows",
    typicalTerm: "As agreed",
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Statement of the purpose", "Acceptable collateral"],
    tips: ["It goes through the normal appraisal, a processing fee applies, and project applicants may be relieved of the own contribution."],
  },
];

/** Documents every IFB applicant adds for the Sharia'h screening. */
export const ifbDocs = [
  "Income breakdown by activity, so the business can be screened for permissible income",
  "Statement of existing financing by lender, showing which is conventional and which interest-free",
];

/** General eligibility of every IFB applicant, on top of the usual credit checks. */
export const ifbEligibility = [
  "A permissible business with a renewed licence, TIN and tax clearance",
  "Financial statements, once the business has run for a year or more",
  "The minimum own contribution for the product",
  "Consent to a credit reference check, and a viable, legal purpose",
  "A risk grade of 1 to 5 (new customers and new businesses start at grade 4)",
  "An interest-free deposit account with the lender",
];

/** Lower-cases a list item for use mid-sentence, keeping proper nouns such as Halal and Sharia'h. */
export const midSentence = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

export const prohibitedActivities = ["Alcoholic drinks", "Arms and weapons", "Pork, pork products and non-Halal meat", "Interest-based finance", "Other activities the Sharia'h Advisory Committee rules out"];

/** Non-Halal income above 5% of total income is taken only exceptionally, with the SAC's approval. */
export const screeningLimits = { nonPermissibleIncome: 0.05 };

/** Minimum collateral cover by risk grade when the financing is not unsecured; cash and cash substitutes need 65%. */
export const ifbCollateralCover: Record<number, number> = { 1: 60, 2: 65, 3: 75, 4: 85, 5: 100 };

export type Screening = "Eligible" | "Eligible with conditions" | "Not eligible" | "Not screened";

/**
 * The Sharia'h screening decision: the business activity first, then the
 * non-Halal share of income, and a referral when the business mainly finances
 * itself from conventional banks.
 */
export function screen(activity: string, incomeRatio: number, mainlyConventional: string) {
  const reasons: string[] = [];
  const conditions: string[] = [];
  if (activity === "Prohibited") return { decision: "Not eligible" as Screening, reasons: ["The main business activity is not permissible."], conditions };
  if (activity !== "Permissible") return { decision: "Not screened" as Screening, reasons: ["The business activity has not been screened."], conditions };
  const limit = screeningLimits.nonPermissibleIncome * 100;
  if (Number.isFinite(incomeRatio)) {
    if (incomeRatio > screeningLimits.nonPermissibleIncome)
      return {
        decision: "Not eligible" as Screening,
        reasons: [`Non-Halal income is ${(incomeRatio * 100).toFixed(1)}% of total income, above the ${limit}% limit; such a request is considered only exceptionally, with the Sharia'h Advisory Committee's approval.`],
        conditions,
      };
    reasons.push(`Non-Halal income is ${(incomeRatio * 100).toFixed(1)}% of total income, within the ${limit}% limit.`);
    if (incomeRatio > 0) conditions.push("Purify the non-Halal income by giving it to charity, and move interest-bearing deposits to interest-free accounts.");
  }
  if (mainlyConventional === "Yes") {
    reasons.push("Most of the existing financing is from conventional banks.");
    conditions.push("Refer to the head of interest-free banking: applicants who mainly finance from conventional banks are taken only on that direction.");
  }
  return { decision: (conditions.length ? "Eligible with conditions" : "Eligible") as Screening, reasons: reasons.length ? reasons : ["The business activity is permissible."], conditions };
}

/** Murabaha in term financing runs three years or less; longer terms use Ijarah or Diminishing Musharakah. */
export const murabahaTermLimit = 36;

export function termModeNote(product: IfbProduct, mode: IfbModeId, months: number) {
  if (product.group !== "Term" || mode !== "murabaha" || !(months > murabahaTermLimit)) return "";
  const alt = product.modes.filter((m) => m === "ijarah" || m === "dm").map((m) => modeById(m)!.name.split(" (")[0]);
  return `Murabaha term financing runs three years or less${alt.length ? `; for ${months} months, use ${alt.join(" or ")}` : ""}, unless the head of interest-free banking directs otherwise.`;
}

export const productById = (id: string) => ifbProducts.find((p) => p.id === id);
export const modeById = (id: string) => ifbModes.find((m) => m.id === id);

/**
 * The profit on a deferred sale: cost x annual profit rate x months / 12, fixed
 * in the contract as part of the sale price.
 */
export const saleProfit = (cost: number, ratePct: number, months: number) => (cost * ratePct * months) / 1200;
