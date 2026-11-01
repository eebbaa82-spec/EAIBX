/**
 * Reference data for the borrower profile builder in the Credit Management Center.
 * Drawn from the 2025 credit procedures of an Ethiopian commercial bank (never named)
 * and National Bank of Ethiopia directives. Banks differ, so the builder presents these
 * as typical requirements, not one lender's rules.
 */

export type BorrowerType = "individual" | "sole" | "plc" | "share" | "partnership" | "cooperative" | "public";

export const borrowerTypes: { value: BorrowerType; label: string }[] = [
  { value: "individual", label: "Individual (salaried or personal loan)" },
  { value: "sole", label: "Sole proprietor" },
  { value: "plc", label: "Private limited company (PLC)" },
  { value: "share", label: "Share company or joint venture" },
  { value: "partnership", label: "Partnership" },
  { value: "cooperative", label: "Cooperative" },
  { value: "public", label: "Public enterprise" },
];

export const sectors = [
  "Agriculture",
  "Domestic trade",
  "Services (hotel, health, education, other)",
  "Manufacturing and industry",
  "Export",
  "Import",
  "Building and construction",
  "Transport",
  "Personal or household",
  "Other",
];

export const educationLevels = ["Secondary school", "TVET certificate or diploma", "Bachelor's degree", "Master's degree", "Doctorate", "Other"];

export type LoanTypeId =
  | "working-capital"
  | "project"
  | "lease"
  | "overdraft"
  | "overdrawal"
  | "merchandise"
  | "warehouse-receipt"
  | "guarantee"
  | "lc-import"
  | "pre-shipment"
  | "export-bills"
  | "suppliers-credit"
  | "machinery-vehicle"
  | "building"
  | "personal"
  | "diaspora"
  | "agri-msme"
  | "takeover";

export type LoanType = {
  id: LoanTypeId;
  name: string;
  purpose: string;
  typicalTerm: string;
  /** Longest usual term in months, when the type has one. */
  maxMonths?: number;
  /** Usual minimum own contribution, as a share of the total cost. */
  minOwnShare?: number;
  /** Whether lenders usually ask for a year (or six months with related experience) in business. */
  needsTrackRecord: boolean;
  /** Exempt from the usual ETB 300,000 minimum loan size. */
  noMinimum?: boolean;
  docs: string[];
  tips: string[];
};

export const loanTypes: LoanType[] = [
  {
    id: "working-capital",
    name: "Working capital loan",
    purpose: "Stock, raw materials and running costs of an existing business",
    typicalTerm: "12 to 36 months",
    maxMonths: 36,
    needsTrackRecord: true,
    docs: [
      "Projected cash flow showing that the business can repay existing loans and the new working capital",
      "Production and sales record for the last three years",
      "Payroll with income tax and pension payment receipts for the last three months",
      "Proforma invoices or contracts for the items to be bought",
    ],
    tips: [
      "Working capital loans never pay for equipment or buildings.",
      "Lenders size the loan from your sales growth; for transport and construction they usually cover about three months of needs.",
    ],
  },
  {
    id: "project",
    name: "Project loan",
    purpose: "Starting a business, or expanding capacity by more than 40%",
    typicalTerm: "Up to 10 years plus grace",
    maxMonths: 120,
    needsTrackRecord: false,
    docs: [
      "Feasibility study by a licensed consultant: market, technical, financial and socio-economic study, with an implementation schedule",
      "Investment licence and commercial registration certificate",
      "Land lease agreement running at least five years beyond the final repayment, and lease payment receipt",
      "Approved architectural, structural, sanitary and electrical plans, site plan, bill of quantities and construction permit",
      "Proforma invoices with full specifications and country of origin, from legitimate suppliers or manufacturers",
      "Environmental impact assessment (EIA) with the approval letter",
      "Written confirmation of power and water supply, with indicative costs, from the responsible authorities",
      "Evidence of the source of your equity contribution",
      "CVs and credentials of the general manager and project manager",
      "One year of bank statements",
      "Work permits of foreign investors and managers, if any",
    ],
    tips: [
      "An expansion counts as a project only if it raises capacity by more than 40%.",
      "Undrawn project loan amounts may carry a commitment fee.",
    ],
  },
  {
    id: "lease",
    name: "Capital goods lease financing",
    purpose: "New machinery for a small or medium enterprise, leased from the lender and paid off in installments",
    typicalTerm: "Medium term, set by the lender",
    minOwnShare: 20,
    needsTrackRecord: false,
    noMinimum: true,
    docs: [
      "Lease application naming each machine and its price, on the lender's lease application form",
      "One year of bank statements of the main shareholders",
      "Commercial registration certificate stating the business sector (paid-up capital often must fall within the lender's range for small and medium enterprises)",
      "Renewed ID cards of all shareholders, and spouses",
      "TIN and tax clearance of all shareholders (and spouse, for a married sole proprietor)",
      "Workplace rent agreement running at least one year beyond the lease term, and transferable to a third party",
      "Proforma invoice from the manufacturer or authorized dealer: brand-new machine, model, brand, capacity, FOB price, HS code, validity and delivery dates, ports, power use, spare parts and prices, after-sales service",
      "Lease financing training certificate, or the lender's confirmation that you attended",
      "Business plan, or a feasibility study by a licensed professional for larger leases (often above ETB 10 million)",
      "Commitment letter to deposit 20% of the project cost in a blocked account on signing",
      "Environmental impact assessment and a confirmation letter from the woreda where the workplace is",
      "Credit history confirmation from the microfinance institutions you have borrowed from",
      "Three years of audit reports, for an existing business",
      "Manager's CV with education and experience certificates",
      "Renewed marriage certificate (sole proprietors)",
    ],
    tips: [
      "The machine itself is the main security, so it must be new and come with after-sales service.",
      "Expect to put 20% of the project cost into a blocked account when you sign.",
      "Many lenders require their lease financing training before they approve.",
    ],
  },
  {
    id: "overdraft",
    name: "Overdraft",
    purpose: "Day-to-day cash gaps in a busy business",
    typicalTerm: "Reviewed every 6 or 12 months",
    maxMonths: 12,
    needsTrackRecord: true,
    docs: ["Six months of current account statements"],
    tips: [
      "Lenders like to see deposits of at least 1.5 times the limit over the period, and the limit used regularly.",
      "Interest is charged daily on the amount used, and the balance is repayable on demand.",
    ],
  },
  {
    id: "overdrawal",
    name: "Temporary overdraft (overdrawal)",
    purpose: "An unexpected, short cash shortage",
    typicalTerm: "Up to 30 days per use, cleared within 90 days",
    maxMonths: 3,
    needsTrackRecord: true,
    noMinimum: true,
    docs: ["Evidence of the repayment source: receivables, a contract paid through the bank, or an approved loan awaiting formalities"],
    tips: ["Usually allowed once a month at most, at a higher interest rate than a regular overdraft."],
  },
  {
    id: "merchandise",
    name: "Merchandise loan",
    purpose: "Cash tied up in stock you hold or have in transit",
    typicalTerm: "Up to 6 months per advance",
    maxMonths: 6,
    needsTrackRecord: true,
    docs: [
      "List of goods to be pledged, with quantities and purchase values",
      "Purchase invoices, customs declarations for imports, or production records",
      "Warehouse rent agreement, if the store is rented",
      "Insurance on the stock against fire, lightning and burglary, endorsed to the lender",
    ],
    tips: [
      "Advances are usually 70 to 80% of the lower of cost or market value, excluding VAT.",
      "Perishables, items expiring within a year, fashion goods, chemicals and pharmaceuticals are not accepted.",
      "You pay all storage, guarding and control costs.",
    ],
  },
  {
    id: "warehouse-receipt",
    name: "Warehouse receipt financing",
    purpose: "Cash against commodities stored at the commodity exchange",
    typicalTerm: "Until shortly before the receipt expires",
    maxMonths: 4,
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Commodity exchange membership or client registration", "Goods received note and electronic warehouse receipt number"],
    tips: ["Advances are up to 70% of the commodity value; a common minimum is ETB 150,000.", "If prices fall below the loan balance, you must add collateral."],
  },
  {
    id: "guarantee",
    name: "Letter of guarantee",
    purpose: "Bid, performance, advance payment or customs guarantees",
    typicalTerm: "Matches the underlying contract",
    needsTrackRecord: true,
    noMinimum: true,
    docs: [
      "Signed contract or tender documents behind the guarantee",
      "Signed authority to debit your account for the commission",
      "Foreign exchange permit, for guarantees to foreign beneficiaries",
    ],
    tips: ["Commission is charged upfront.", "A called guarantee becomes a loan due within one month, with penalty interest."],
  },
  {
    id: "lc-import",
    name: "Letter of credit (import) facility",
    purpose: "Importing goods while paying only part upfront",
    typicalTerm: "6 or 12 months; 90 days per advance",
    maxMonths: 12,
    needsTrackRecord: true,
    noMinimum: true,
    docs: ["Proforma invoice and import permit", "Cash for at least a 30% margin", "Import figures for the last six months (renewals)"],
    tips: ["Without a facility you pay 100% upfront.", "You bear service charges, commissions and any exchange-rate differences."],
  },
  {
    id: "pre-shipment",
    name: "Pre-shipment export finance",
    purpose: "Buying and preparing goods for export",
    typicalTerm: "Up to 180 days per advance",
    maxMonths: 6,
    needsTrackRecord: true,
    docs: [
      "Sales contract registered with the National Bank of Ethiopia (coffee) or the Ministry of Trade (oilseeds and pulses), or an export letter of credit",
      "Export performance record for the commodity and market",
      "Evidence of your warehouse, cleaning facilities and suppliers",
    ],
    tips: [
      "Advances range from 20 to 90% of the contract value, depending on the commodity and your record.",
      "Goods must ship within 90 days, and export proceeds must come through the lender.",
      "You must not be on the National Bank of Ethiopia's list of delinquent exporters.",
    ],
  },
  {
    id: "export-bills",
    name: "Advance against export bills",
    purpose: "Cash while exported goods are on their way",
    typicalTerm: "Up to 90 days per advance",
    maxMonths: 3,
    needsTrackRecord: true,
    docs: ["Commercial invoice, packing list, customs declaration, export letter of credit, waybill, insurance and quality certificate"],
    tips: ["Advances are up to 80% of the bill."],
  },
  {
    id: "suppliers-credit",
    name: "Supplier's credit",
    purpose: "Importing equipment or inputs on deferred payment from a foreign supplier",
    typicalTerm: "Short to long term",
    needsTrackRecord: true,
    docs: [
      "Written National Bank of Ethiopia approval stating the amount and payment period",
      "Proforma invoice with at least one year's credit period",
      "Ministry of Transport and Logistics endorsement and import licence (for trucks)",
    ],
    tips: ["Repayment must come from export earnings or approved foreign currency.", "Exchange-rate differences are added to your loan."],
  },
  {
    id: "machinery-vehicle",
    name: "Machinery and vehicle loan",
    purpose: "Factory machinery, construction machinery, trucks and buses",
    typicalTerm: "3 to 5 years",
    maxMonths: 60,
    minOwnShare: 30,
    needsTrackRecord: true,
    docs: [
      "Proforma invoice (new) or ownership booklet, insurance and sale contract (used)",
      "Manufacturer's invoice, for second-hand factory machinery",
      "Transport or construction licence for the business",
    ],
    tips: [
      "Typical own contribution: from 30% for new machinery or trucks, 40 to 50% for used machinery, 50 to 70% for older factory machinery.",
      "Used vehicles over 7 years and used machinery over 5 years in service are rarely financed.",
    ],
  },
  {
    id: "building",
    name: "Building completion, house or real estate loan",
    purpose: "Finishing a commercial building, house or real estate project",
    typicalTerm: "Up to 10 years",
    maxMonths: 120,
    minOwnShare: 50,
    needsTrackRecord: false,
    docs: [
      "Approved building plan and construction permit",
      "Bill of quantities and material specification; structural plan and designer's licence for G+1 and above",
      "For a purchase: sale contract, seller's marital status evidence and latest property tax receipt",
      "Proof of income to repay: rent agreements and tax receipts, salary, or business income",
    ],
    tips: [
      "Lenders usually finance up to 50% of the construction value.",
      "Money is released in stages after engineer inspections, for example 30%, 35%, 35%.",
    ],
  },
  {
    id: "personal",
    name: "Personal, car or housing loan (salaried)",
    purpose: "Household needs, a car or a home, repaid from salary",
    typicalTerm: "Personal up to 5 years; car up to 10; housing up to 25",
    maxMonths: 300,
    minOwnShare: 10,
    needsTrackRecord: false,
    noMinimum: true,
    docs: [
      "Employer letter with position, start date, salary and existing deductions, agreeing to deduct repayments",
      "Employer letter agreeing to block your provident fund for the loan, and your consent",
      "For a car: proforma invoice (new) or ownership booklet and insurance (used), plus sale contract",
    ],
    tips: [
      "Repayments are usually capped at one third to one half of your salary.",
      "Typical own contribution: 10 to 20% for a home, 25 to 30% for a new car, 40% for a used one.",
    ],
  },
  {
    id: "diaspora",
    name: "Diaspora loan",
    purpose: "Personal, car, housing or business loans for Ethiopians abroad",
    typicalTerm: "Up to 5 to 20 years by type",
    maxMonths: 240,
    minOwnShare: 40,
    needsTrackRecord: false,
    noMinimum: true,
    docs: [
      "Foreign residence ID with Ethiopian passport, or Ethiopian origin ID",
      "Marital status evidence, authenticated by the Ministry of Foreign Affairs if issued abroad",
      "Evidence of foreign currency channeled through the lender",
    ],
    tips: ["Rates assume repayment in foreign currency; repaying in birr usually means the higher local rate."],
  },
  {
    id: "agri-msme",
    name: "Agricultural or MSME loan",
    purpose: "Farm inputs, small businesses and start-ups",
    typicalTerm: "One crop season to medium term",
    maxMonths: 60,
    needsTrackRecord: false,
    noMinimum: true,
    docs: ["Completion certificate for any required business development training"],
    tips: ["Movable property such as stock, machinery or farm produce can serve as collateral.", "Farm input loans are usually repaid within one crop season."],
  },
  {
    id: "takeover",
    name: "Loan transfer from another bank",
    purpose: "Moving an existing loan to a new lender",
    typicalTerm: "As agreed",
    needsTrackRecord: true,
    docs: ["Credit report showing the loan to be transferred is in good standing", "Undertaking from your current bank to release title documents once paid off"],
    tips: ["Lenders look for a clean repayment record and good overdraft turnover at your current bank."],
  },
];

export type CollateralTypeId =
  | "building"
  | "building-construction"
  | "vehicle"
  | "machinery"
  | "business-mortgage"
  | "merchandise"
  | "export-goods"
  | "cash"
  | "bank-guarantee"
  | "shares-financial"
  | "shares-other"
  | "securities"
  | "warehouse-receipt"
  | "personal-guarantee";

export type CollateralType = {
  id: CollateralTypeId;
  name: string;
  /** Share of the value lenders typically count, when it is a published norm. */
  counted?: number;
  /** Counts as no security at all (the loan is treated as unsecured). */
  unsecured?: boolean;
  hasAge?: boolean;
  docs: string[];
};

export const collateralTypes: CollateralType[] = [
  {
    id: "building",
    name: "Completed building",
    docs: [
      "Title deed or land-holding certificate",
      "Approved building plan",
      "Lease certificate and proof of annual lease payment (leasehold land)",
      "Current land and property tax receipts",
    ],
  },
  {
    id: "building-construction",
    name: "Building under construction",
    docs: [
      "Title deed or land-holding certificate",
      "Approved building plan",
      "Valid construction permit",
      "Current land and property tax receipts",
    ],
  },
  {
    id: "vehicle",
    name: "Vehicle (truck, bus, tanker, car)",
    hasAge: true,
    docs: ["Vehicle ownership booklet (libre)", "Comprehensive insurance endorsed to the lender", "Current vehicle inspection certificate"],
  },
  {
    id: "machinery",
    name: "Construction or factory machinery",
    hasAge: true,
    docs: ["Machinery ownership certificate", "Customs declaration and CIF value", "Insurance endorsed to the lender"],
  },
  {
    id: "business-mortgage",
    name: "Business mortgage (equipment, goodwill, trade name)",
    docs: ["Original purchase invoices for equipment, with year of make and serial numbers", "Insurance endorsed to the lender"],
  },
  { id: "merchandise", name: "Merchandise (pledged stock)", counted: 70, docs: ["Stock list and purchase invoices", "Stock insurance endorsed to the lender"] },
  { id: "export-goods", name: "Goods ready for export", counted: 80, docs: ["Export sales contract", "Insurance endorsed to the lender"] },
  { id: "cash", name: "Cash deposit (savings, current, fixed-term)", docs: ["Signed letter assigning the deposit", "Certificate of deposit, for fixed-term deposits"] },
  { id: "bank-guarantee", name: "Unconditional bank guarantee", counted: 98, docs: ["Guarantee on the lender's standard form"] },
  { id: "shares-financial", name: "Shares in a bank or insurer", counted: 90, docs: ["Share certificate", "Issuing company's undertaking to transfer the shares on default"] },
  { id: "shares-other", name: "Shares in another company", counted: 60, docs: ["Share certificate", "Issuing company's undertaking to transfer the shares on default"] },
  { id: "securities", name: "Treasury bills, bonds or life insurance cash value", counted: 90, docs: ["Original instrument", "Insurer's letter confirming the cash value (life insurance)"] },
  { id: "warehouse-receipt", name: "Warehouse receipt", counted: 70, docs: ["Receipt from a licensed warehouse operator"] },
  { id: "personal-guarantee", name: "Personal or company guarantee", unsecured: true, docs: ["Guarantor's ID, TIN and financial statements"] },
];

/** Documents every applicant gathers, before the type-specific lists. */
export const generalDocs = [
  "Loan application form, signed by the authorized person",
  "Tax Identification Number (TIN) certificate",
  "Credit report consent form, signed by you and any guarantors",
  "Evidence of marital status of the borrower and of each owner pledging property",
  "Tax clearance certificate of each owner pledging property (and spouse), less than six months old",
];

export const businessDocs = [
  "Company profile: history, products or services, customers, management and plans",
  "Renewed trade licence, principal registration and trade name registration",
  "Financial statements for the last three years, with a business plan and projected cash flow",
  "Aging list of receivables and of creditors",
  "Inventory list by type and age",
];

export const borrowerTypeDocs: Partial<Record<BorrowerType, string[]>> = {
  individual: ["ID card or residence ID"],
  sole: ["ID card of the owner"],
  plc: [
    "Memorandum and articles of association, with all amendments",
    "Board or shareholder resolution to borrow and pledge company property",
    "Capital registration certificate",
    "Management team profiles",
  ],
  share: [
    "Memorandum and articles of association, with all amendments",
    "Board resolution to borrow and pledge company property",
    "Capital registration certificate",
    "Management team profiles",
  ],
  partnership: ["Partnership agreement", "Written agreement of all partners to the borrowing"],
  cooperative: ["Cooperative registration certificate and bylaws", "General assembly or board minute authorizing the borrowing"],
  public: ["Negarit Gazeta notice establishing the enterprise", "Board letter authorizing the general manager to borrow"],
};

export const minimumLoan = 300_000;
export const auditedFrom = 5_000_000;
export const auditedAlwaysFrom = 10_000_000;

/** Extra project-loan documents for expanding an existing project. */
export const expansionDocs = [
  "Renewed business licence and expansion licence",
  "VAT registration certificate",
  "Audited financial statements of the project for the last three years",
  "Payroll with income tax and pension payment receipts for the last three months",
  "Original invoices for existing investment items, and a list of fixed assets and stock with purchase dates and prices",
  "Approved plans for existing civil works, and approved plans and bill of quantities for the expansion",
  "Production and sales (local and export) for the last three years",
];

/** Extra project-loan documents for commercial agriculture. */
export const agricultureDocs = [
  "Land-holding certificate with the farm's coordinates, and confirmation that there are no overlapping land claims",
  "Agronomy study, and confirmation that the land suits the planned crop",
  "Soil and water test report",
  "Irrigation design, contour map and farm layout, with bill of quantities",
  "Hydrological study and borehole completion report, if drilling",
  "Water use permit, if drawing from a dam, river or lake",
  "At least five years of climate data for the project area",
];
