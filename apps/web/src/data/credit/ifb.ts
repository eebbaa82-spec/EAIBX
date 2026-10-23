/**
 * Interest-free banking (IFB) financing products and modes, drawn from the 2025
 * IFB financing business procedure of an Ethiopian commercial bank (never named)
 * and AAOIFI Sharia'h standards. Terms and own contributions follow the conventional
 * norms in profile.ts, since the procedure aligns IFB terms with conventional credit.
 * Each bank's Sharia'h Advisory Committee (SAC) approves its own products, so these
 * are presented as typical, not one lender's rules.
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
      "Purchase instruction or order",
      "Agency agreement, if the customer buys the goods as the bank's agent",
      "Purchased item declaration and specification",
      "Goods receiving note, or title documents for goods in transit",
      "Offer to purchase and the bank's acceptance of offer",
      "Murabaha sale contract",
      "Schedule of payment showing cost, profit, sale price and installments",
    ],
    conditions: [
      "The asset exists, is permissible and is clearly specified.",
      "The bank owns and possesses the asset, physically or through title documents, before it sells.",
      "Cost, profit and sale price are disclosed before signing, and the price never rises for late payment or extra time.",
    ],
  },
  {
    id: "salam",
    name: "Bai' Salam (advance purchase)",
    how: "The bank pays the full price now for goods, usually crops, delivered later, with type, quality, quantity, date and place fixed in the contract.",
    pricing: "sale",
    docs: ["Bai' Salam agreement", "Second (parallel) Bai' Salam agreement, if the bank resells the goods", "Goods delivery receipt or goods receiving note"],
    conditions: ["The full price is paid at signing.", "Type, grade, quantity, delivery date and place are fixed.", "Gold, silver and currency cannot be sold this way."],
  },
  {
    id: "istisna",
    name: "Istisna' (manufacture or build to order)",
    how: "The bank orders an asset to be made or built to a specification and sells it to the customer, paying the contractor as the work progresses.",
    pricing: "sale",
    docs: ["Istisna' agreement with the customer", "Parallel Istisna' agreement with the contractor or manufacturer", "Specifications, drawings and bill of quantities", "Progress certificates for each bill"],
    conditions: ["The asset is specified in detail.", "Price and delivery date are agreed at signing.", "Bills are settled by the progress of the work."],
  },
  {
    id: "ijarah",
    name: "Ijarah (lease)",
    how: "The bank buys an asset and leases it to the customer for rent; in a lease ending in ownership, the customer gets the asset at the end through a separate promise.",
    pricing: "rent",
    docs: ["Promise to lease", "Ijarah agreement with the rent schedule", "Separate promise to sell or gift the asset at the end, if ownership transfers", "Takaful cover on the asset"],
    conditions: [
      "The bank owns the asset and carries the risks of ownership, including major maintenance and takaful.",
      "Rent starts only once the customer can use the asset.",
      "Transfer of ownership is a separate act, not a condition of the lease.",
    ],
  },
  {
    id: "dm",
    name: "Diminishing Musharakah (shared ownership)",
    how: "The bank and the customer co-own an asset; the customer pays rent on the bank's share and buys the bank's units over time until it owns the whole.",
    pricing: "rent",
    docs: ["Musharakah agreement setting each partner's share", "Lease of the bank's share, with the rent schedule", "Undertaking to buy the bank's units, with the unit schedule"],
    conditions: ["Each partner's share is set at the start.", "Rent is charged only on the bank's remaining share.", "Losses on the asset are shared in proportion to ownership."],
  },
  {
    id: "tijarah",
    name: "Tijarah (finished goods financing)",
    how: "The bank buys a producer's finished goods and appoints the producer as its agent to sell them.",
    pricing: "sale",
    docs: ["Tijarah purchase agreement", "Agency agreement for the sale of the goods", "Stock list and goods receiving note", "Sales reports from the agent"],
    conditions: ["The goods are finished, permissible and identified.", "The bank owns the goods until the agent sells them."],
  },
  {
    id: "tawarruq",
    name: "Tawarruq (commodity-based financing)",
    how: "The bank sells a real commodity to the customer on deferred payment, and the customer sells it to a third party for cash.",
    pricing: "sale",
    docs: ["Commodity purchase documents", "Deferred sale contract with the customer", "Customer's sale to a third party, or agency to sell", "Schedule of payment"],
    conditions: ["Each sale is real and separate.", "The commodity never goes back to its original seller.", "Used only within the limits the SAC sets."],
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
    how: "Financing with no profit; the bank recovers only the actual administrative costs the SAC allows.",
    pricing: "none",
    docs: ["Qard al-Hassan agreement", "Dedicated Wadia'h account, where the product requires one"],
    conditions: ["No profit or return linked to the amount or the time.", "Only the actual administrative costs the SAC allows are recovered."],
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
    purpose: "Repeated stock purchases by a regular trader under one Master Murabaha Financing Agreement",
    typicalTerm: "Short term, renewed each year",
    maxMonths: 12,
    needsTrackRecord: true,
    revolving: true,
    docs: ["Trade licence covering the goods to be bought", "Stock and sales record of the business", "Proforma invoices from the suppliers for each purchase"],
    tips: [
      "Each purchase has its own purchase order, goods receiving note, offer, acceptance, sale contract and schedule.",
      "A new purchase is allowed only when it fits under the limit after earlier sale prices are paid.",
    ],
  },
  {
    id: "murabaha-merchandise",
    name: "Murabaha merchandise financing",
    group: "Trade",
    modes: ["murabaha"],
    purpose: "A defined stock purchase, bought by the bank and sold to you at a fixed sale price",
    typicalTerm: "Short term, matched to the trading cycle",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Trade licence covering the goods", "Proforma invoice from the supplier", "Stock and sales record of the business"],
    tips: ["The bank owns the goods before it sells them to you, so it receives them first or holds their title documents."],
  },
  {
    id: "murabaha-transit",
    name: "Murabaha against goods in transit",
    group: "Trade",
    modes: ["murabaha"],
    purpose: "Goods already shipped, where the bank holds the title documents until it sells them to you",
    typicalTerm: "Short term, until the goods are cleared and sold",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Shipping and title documents (bill of lading or airway bill, invoice, packing list)", "Import permit and trade licence", "Takaful cover on the goods in transit"],
    tips: ["Holding the title documents gives the bank constructive possession, so it can sell the goods while they are on their way."],
  },
  {
    id: "tijarah",
    name: "Tijarah finished goods financing",
    group: "Trade",
    modes: ["tijarah"],
    purpose: "Cash against a producer's finished goods, which the bank buys and you sell as its agent",
    typicalTerm: "Short term, matched to the sales cycle",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["List of finished goods with quantities and costs", "Sales record and customer list", "Warehouse details for inspection"],
    tips: ["You sell the goods on the bank's behalf and pass the proceeds to it, keeping the agreed agency arrangement."],
  },
  {
    id: "lc-import",
    name: "Import letter of credit facility",
    group: "Trade",
    modes: ["wakalah", "murabaha"],
    purpose: "Importing goods through a letter of credit while paying only a cash margin upfront",
    typicalTerm: "Per shipment",
    needsTrackRecord: true,
    offBalance: true,
    docs: ["Import permit and proforma invoice", "Cash margin, held in an interest-free account", "Trade licence covering the goods"],
    tips: [
      "If you cannot pay in full when the documents arrive, the bank can settle the letter of credit and sell you the goods on Murabaha before releasing the documents.",
      "You bear the service charges and any exchange-rate differences.",
    ],
  },
  {
    id: "preshipment-trader",
    name: "Murabaha pre-shipment export financing (trading exporters)",
    group: "Export",
    modes: ["murabaha"],
    purpose: "Buying export goods such as coffee, sesame or pulses from suppliers for an export order",
    typicalTerm: "Matched to the shipment and payment cycle",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Valid export licence", "Export sales contract or letter of credit from the buyer", "Record of past shipments and repatriated proceeds", "Undertaking to route export proceeds through the lender"],
    tips: ["The export proceeds repay the sale price, so the term follows the shipment and payment cycle."],
  },
  {
    id: "preshipment-manufacturer",
    name: "Murabaha pre-shipment export financing (manufacturer-exporters)",
    group: "Export",
    modes: ["murabaha"],
    purpose: "Raw materials and inputs for goods you make for an export order",
    typicalTerm: "Matched to production, shipment and payment",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Valid export licence and investment or manufacturing licence", "Export sales contract or letter of credit from the buyer", "Supplier proforma invoices for the inputs", "Record of past shipments and repatriated proceeds"],
    tips: ["The bank buys the inputs from your suppliers and sells them to you on a deferred price repaid from the export proceeds."],
  },
  {
    id: "livestock-export",
    name: "Murabaha livestock export financing",
    group: "Export",
    modes: ["murabaha"],
    purpose: "Buying livestock for an export order",
    typicalTerm: "Matched to the export cycle",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Valid livestock export licence", "Export sales contract or letter of credit from the buyer", "Quarantine and veterinary arrangements", "Record of past shipments and repatriated proceeds"],
    tips: ["Livestock export financing has its own eligibility and conditions; check them with the lender early."],
  },
  {
    id: "guarantee",
    name: "Letter of guarantee (Kafalah)",
    group: "Guarantee",
    modes: ["kafalah"],
    purpose: "Bid, performance, advance payment and other guarantees",
    typicalTerm: "Validity of the underlying contract or tender",
    needsTrackRecord: true,
    offBalance: true,
    noMinimum: true,
    docs: ["Tender document, contract or advance payment agreement behind the guarantee", "Beneficiary's required wording, if any", "Signed counter-indemnity"],
    tips: ["The bank charges only a service charge. If the guarantee is called, you owe the amount paid with no profit added for time."],
  },
  {
    id: "tawarruq-term",
    name: "Tawarruq term financing",
    group: "Term",
    modes: ["tawarruq"],
    purpose: "Cash for a permissible business need, through the sale of a real commodity",
    typicalTerm: "Medium term, within the SAC's limits",
    needsTrackRecord: true,
    docs: ["Statement of the business need the cash will meet", "Projected cash flow showing repayment"],
    tips: ["Banks offer Tawarruq only within the limits their Sharia'h Advisory Committee sets."],
  },
  {
    id: "share-purchase",
    name: "Share purchase financing",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Buying shares in a company whose business is permissible",
    typicalTerm: "Medium term",
    needsTrackRecord: false,
    docs: ["Share subscription or transfer documents", "Issuing company's documents showing its business activity", "Evidence of your own contribution"],
    tips: ["The shares must pass the same Sharia'h screening as any financed business."],
  },
  {
    id: "vehicle",
    name: "Motor vehicle financing",
    group: "Term",
    modes: ["murabaha", "ijarah", "dm"],
    purpose: "Trucks, buses and other vehicles for your business",
    typicalTerm: "Medium term",
    minOwnShare: 30,
    needsTrackRecord: true,
    docs: ["Proforma invoice with the vehicle's specification", "Route or transport permit, where the business needs one", "Evidence of your own contribution"],
    tips: ["Under Ijarah the bank owns the vehicle and you pay rent; under Murabaha you own it once the sale is signed."],
  },
  {
    id: "machinery",
    name: "Machinery and equipment financing",
    group: "Term",
    modes: ["murabaha", "ijarah", "dm"],
    purpose: "Factory, construction or other machinery and equipment",
    typicalTerm: "Medium to long term",
    minOwnShare: 30,
    needsTrackRecord: false,
    docs: ["Proforma invoices with full specifications and country of origin", "Installation site and power supply details", "Evidence of your own contribution"],
    tips: ["Ijarah ending in ownership suits machinery you want to use now and own later."],
  },
  {
    id: "building",
    name: "Building and business premises financing",
    group: "Term",
    modes: ["murabaha", "dm", "ijarah", "istisna"],
    purpose: "Buying, or building to order, premises for your business",
    typicalTerm: "Long term",
    minOwnShare: 50,
    needsTrackRecord: false,
    docs: ["Title deed or sale agreement for the property", "Valuation of the property", "For construction: approved plans, bill of quantities and construction permit", "Evidence of your own contribution"],
    tips: ["For a building still to be built, Istisna' lets the bank pay the contractor as the work progresses."],
  },
  {
    id: "industrial-park",
    name: "Investment financing for industrial park exporters",
    group: "Term",
    modes: ["ijarah", "murabaha", "dm"],
    purpose: "Machinery, inputs and working capital for an enterprise in an industrial park producing for export",
    typicalTerm: "Medium to long term",
    needsTrackRecord: false,
    docs: ["Industrial park lease or shed agreement", "Investment licence", "Feasibility study or business plan with export markets", "Proforma invoices for machinery and inputs"],
    tips: ["Lenders look for confirmed export orders or buyers."],
  },
  {
    id: "agri-term",
    name: "Agricultural term financing",
    group: "Term",
    modes: ["murabaha", "salam", "ijarah"],
    purpose: "Farm machinery, irrigation, inputs or an advance purchase of your crop",
    typicalTerm: "One crop season to medium term",
    maxMonths: 60,
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Land-holding certificate", "Farm plan with crops, area and expected yields", "Proforma invoices for machinery or inputs"],
    tips: ["Under Bai' Salam the bank pays now for a fixed quantity and grade of crop delivered on a set date and place."],
  },
  {
    id: "smallholder-machinery",
    name: "Smallholder farmers' machinery financing",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Tractors, threshers and other machinery for smallholder farmers or their groups",
    typicalTerm: "Medium term, with installments after each harvest",
    maxMonths: 60,
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Farmers' group or cooperative registration", "Land-holding certificates of the members", "Dealer proforma invoice for the machinery"],
    tips: ["Installments can be timed after each harvest."],
  },
  {
    id: "lc-settlement",
    name: "Import letter of credit settlement financing",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Paying for goods imported under a letter of credit when you cannot pay in full on arrival",
    typicalTerm: "Short to medium term",
    needsTrackRecord: true,
    docs: ["Letter of credit and shipping documents", "Customs clearance estimate"],
    tips: ["The bank pays the supplier, holds the documents and sells you the goods on Murabaha before releasing them."],
  },
  {
    id: "buyout",
    name: "Buyout of financing from another bank",
    group: "Term",
    modes: ["murabaha"],
    purpose: "Moving an existing interest-free financing to a new lender",
    typicalTerm: "As agreed",
    needsTrackRecord: true,
    docs: ["Credit report showing the financing to be moved is in good standing", "Statement of the outstanding sale price from your current bank", "Undertaking from your current bank to release title documents once paid"],
    tips: ["The obligation taken over must itself be Sharia'h-compliant, moved in a way the SAC approves."],
  },
  {
    id: "conversion",
    name: "Conversion of a conventional loan to interest-free financing",
    group: "Term",
    modes: ["murabaha", "dm", "ijarah"],
    purpose: "Replacing a conventional loan with an interest-free financing",
    typicalTerm: "As agreed",
    needsTrackRecord: true,
    docs: ["Loan statement from the current lender", "Details of the asset the new transaction will be based on"],
    tips: ["Conversion is a genuine new transaction on a real asset, and interest already accrued cannot be carried into the new price."],
  },
  {
    id: "employment-agency",
    name: "Overseas employment agency financing (Qard al-Hassan)",
    group: "Qard al-Hassan",
    modes: ["qard"],
    purpose: "The licence deposit of an overseas employment agency",
    typicalTerm: "Licence period",
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Agency licence application or licence", "Requirement letter from the Ministry of Labor and Skills", "Operation account for the agency's income"],
    tips: ["The money goes into a dedicated Wadia'h account in the agency's name, blocked in favor of the Ministry."],
  },
  {
    id: "qard-term",
    name: "Qard al-Hassan term financing",
    group: "Qard al-Hassan",
    modes: ["qard"],
    purpose: "Benevolent financing with no profit, for purposes the bank's policy allows",
    typicalTerm: "As agreed",
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Statement of the purpose"],
    tips: ["Only actual administrative costs approved by the SAC may be charged."],
  },
];

/** General eligibility and Sharia'h screening of every IFB applicant. */
export const ifbDocs = [
  "Income breakdown by activity, so the business can be screened for permissible income",
  "Statement of any interest-bearing borrowing and interest income, for the Sharia'h screening ratios",
];

export const prohibitedActivities = ["Alcohol", "Pork", "Gambling and betting", "Interest-based finance or conventional insurance", "Adult entertainment"];

/** AAOIFI's widely used benchmarks; a bank's SAC sets its own ratios and bases, which take precedence. */
export const screeningLimits = { interestDebt: 0.3, nonPermissibleIncome: 0.05 };

export type Screening = "Eligible" | "Eligible with conditions" | "Not eligible" | "Not screened";

/**
 * The Sharia'h screening decision: the business activity first, then the
 * financial ratios for a permissible business with some conventional debt or income.
 */
export function screen(activity: string, debtRatio: number, incomeRatio: number) {
  const reasons: string[] = [];
  const conditions: string[] = [];
  if (activity === "Prohibited") return { decision: "Not eligible" as Screening, reasons: ["The main business activity is not permissible."], conditions };
  if (activity !== "Permissible") return { decision: "Not screened" as Screening, reasons: ["The business activity has not been screened."], conditions };
  let fail = false;
  if (Number.isFinite(debtRatio)) {
    if (debtRatio > screeningLimits.interestDebt) {
      fail = true;
      reasons.push(`Interest-bearing debt is ${(debtRatio * 100).toFixed(1)}% of total assets, above the ${screeningLimits.interestDebt * 100}% benchmark.`);
    } else {
      reasons.push(`Interest-bearing debt is ${(debtRatio * 100).toFixed(1)}% of total assets, within the ${screeningLimits.interestDebt * 100}% benchmark.`);
      if (debtRatio > 0) conditions.push("Plan to replace the conventional borrowing with interest-free financing over time.");
    }
  }
  if (Number.isFinite(incomeRatio)) {
    if (incomeRatio > screeningLimits.nonPermissibleIncome) {
      fail = true;
      reasons.push(`Income from non-permissible sources is ${(incomeRatio * 100).toFixed(1)}% of revenue, above the ${screeningLimits.nonPermissibleIncome * 100}% benchmark.`);
    } else {
      reasons.push(`Income from non-permissible sources is ${(incomeRatio * 100).toFixed(1)}% of revenue, within the ${screeningLimits.nonPermissibleIncome * 100}% benchmark.`);
      if (incomeRatio > 0) conditions.push("Purify the non-permissible income by giving it to charity, and move interest-bearing deposits to interest-free accounts.");
    }
  }
  if (fail) return { decision: "Not eligible" as Screening, reasons, conditions: [] };
  return { decision: (conditions.length ? "Eligible with conditions" : "Eligible") as Screening, reasons: reasons.length ? reasons : ["The business activity is permissible."], conditions };
}

export const productById = (id: string) => ifbProducts.find((p) => p.id === id);
export const modeById = (id: string) => ifbModes.find((m) => m.id === id);

/**
 * The profit on a deferred sale: cost x annual profit rate x months / 12, fixed
 * in the contract as part of the sale price.
 */
export const saleProfit = (cost: number, ratePct: number, months: number) => (cost * ratePct * months) / 1200;
