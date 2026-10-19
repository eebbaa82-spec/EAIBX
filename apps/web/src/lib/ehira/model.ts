/**
 * EHIRA (Enterprise Health & Investment Readiness Assessment).
 *
 * Source: "EHIRA Enterprise Health & Investment Readiness Assessment Framework" design draft
 * (Erudite Africa, 2026-10-17), completed by the EHIRA methodology addendum v0.2 (Investopia,
 * 2026-10-17) for everything the draft leaves open: weights for each business type, default
 * score bands, and questions added for the Ethiopian context (marked `added: true`).
 */

export type DimensionId = "financial" | "market" | "operations" | "people" | "governance" | "strategy" | "technology" | "investment";

export const dimensions: { id: DimensionId; name: string; weight: number }[] = [
  { id: "financial", name: "Financial Health", weight: 25 },
  { id: "market", name: "Market & Customer", weight: 15 },
  { id: "operations", name: "Operational Excellence", weight: 15 },
  { id: "people", name: "Human Capital & Leadership", weight: 10 },
  { id: "governance", name: "Governance & Compliance", weight: 10 },
  { id: "strategy", name: "Strategic Management", weight: 10 },
  { id: "technology", name: "Technology Readiness", weight: 5 },
  { id: "investment", name: "Growth & Investment Readiness", weight: 10 },
];

export type BusinessType = "startup" | "sme" | "corporate" | "distressed" | "borrower";

export const businessTypes: { id: BusinessType; label: string; focus: string }[] = [
  { id: "startup", label: "Startup (under 3 years)", focus: "Team, market, product-market fit and growth potential, with less weight on historical profitability." },
  { id: "sme", label: "SME", focus: "Balanced weighting across all eight dimensions (the standard model)." },
  { id: "corporate", label: "Corporate", focus: "Governance, internal controls, risk management and compliance." },
  { id: "distressed", label: "Business under financial pressure", focus: "Liquidity, debt burden, cash flow and the ability to turn the business around." },
  { id: "borrower", label: "Borrower seeking a loan", focus: "Financial strength, debt-servicing capacity, governance and compliance." },
];

/** Dimension weights (%) per business type. SME is the framework's standard model; the others follow its stated emphasis. */
export const typeWeights: Record<BusinessType, Record<DimensionId, number>> = {
  sme: { financial: 25, market: 15, operations: 15, people: 10, governance: 10, strategy: 10, technology: 5, investment: 10 },
  startup: { financial: 10, market: 25, operations: 10, people: 20, governance: 5, strategy: 10, technology: 5, investment: 15 },
  corporate: { financial: 25, market: 10, operations: 15, people: 10, governance: 20, strategy: 10, technology: 5, investment: 5 },
  distressed: { financial: 35, market: 10, operations: 15, people: 10, governance: 10, strategy: 15, technology: 5, investment: 0 },
  borrower: { financial: 35, market: 10, operations: 10, people: 5, governance: 20, strategy: 5, technology: 5, investment: 10 },
};

export type Grade = "A" | "B" | "C" | "D" | "E";

/** A score band: values at or above `min` (or strictly above when `strict`) get `score`. Checked top to bottom. */
export type Band = { min: number; score: number; strict?: boolean };

export type Question = {
  id: string;
  dimension: DimensionId;
  text: string;
  help?: string;
  type: "yesno" | "scale" | "percent" | "number" | "money" | "months" | "choice" | "taxclearance" | "creditinfo";
  /** Answer options for `choice` questions; a null score means the option is not scored. An `exclusive` option clears the others. */
  options?: { value: string; label: string; score: number | null; exclusive?: boolean }[];
  /** `choice` question where several options can be picked; the answer is the picked values joined by commas (see multiScore). */
  multi?: boolean;
  /** Business types the question applies to; all types when absent. */
  for?: BusinessType[];
  /** Added by the methodology addendum for the Ethiopian context (not in the framework draft). */
  added?: boolean;
  required: boolean;
  /** Question weight. The draft sets weights only for F1, F2 and G1; the addendum sets the rest (3 unless noted). */
  weight: number;
  /** Bands for percent answers, highest threshold first (see bandScore). Absent for unscored inputs. */
  bands?: Band[];
  /** Not scored on its own (feeds a ratio, or context only). */
  unscored?: boolean;
  /** Evidence the draft asks to be uploaded; collected once accounts and uploads exist. */
  evidence?: string;
  /** Shown only when this returns true. */
  showIf?: (a: Answers) => boolean;
  /** Advice when the answer scores below full marks. Draft wording by Investopia, not from the framework. */
  action: string;
  assumed?: boolean;
};

export type Answers = Record<string, number | string | undefined>;

const DEFAULT_WEIGHT = 3;

export const questions: Question[] = [
  // A. Financial Health
  { id: "F1", dimension: "financial", text: "Does the business prepare annual financial statements?", type: "yesno", required: true, weight: 3, action: "Prepare annual financial statements (income statement, balance sheet and cash flow). Lenders and investors start here." },
  { id: "F2", dimension: "financial", text: "Are the financial statements audited?", type: "yesno", required: true, weight: 5, evidence: "Audit report", showIf: (a) => a.F1 === "yes", action: "Have your latest statements audited by a licensed external auditor." },
  { id: "F3", dimension: "financial", text: "What was annual revenue last year?", help: "Total sales for the last full financial year, in ETB.", type: "money", required: true, weight: 0, unscored: true, action: "" },
  { id: "F4", dimension: "financial", text: "What was net profit last year?", help: "After tax, in ETB. Enter a negative number for a loss.", type: "money", required: true, weight: 0, unscored: true, showIf: (a) => typeof a.F3 === "number" && a.F3 > 0, action: "" },
  { id: "FR1", dimension: "financial", text: "Current assets at the last year end (ETB)", help: "Cash, receivables, stock and other assets turning into cash within a year.", type: "money", required: false, weight: 0, unscored: true, action: "", assumed: true },
  { id: "FR2", dimension: "financial", text: "Current liabilities at the last year end (ETB)", help: "Amounts due within a year: suppliers, short-term loans, tax payable.", type: "money", required: false, weight: 0, unscored: true, action: "", assumed: true },
  { id: "FR3", dimension: "financial", text: "Total debt (ETB)", help: "All loans and borrowings, short and long term.", type: "money", required: false, weight: 0, unscored: true, action: "", assumed: true },
  { id: "FR4", dimension: "financial", text: "Total equity (ETB)", help: "Owners' capital plus retained earnings. Negative if losses exceed capital.", type: "money", required: false, weight: 0, unscored: true, action: "", assumed: true },
  { id: "FR5", dimension: "financial", text: "Net operating income last year (ETB)", help: "Profit before interest and tax.", type: "money", required: false, weight: 0, unscored: true, action: "", assumed: true },
  { id: "FR6", dimension: "financial", text: "Total debt service last year (ETB)", help: "Loan principal plus interest paid in the year. Enter 0 if you have no loans.", type: "money", required: false, weight: 0, unscored: true, action: "", assumed: true },

  { id: "F6", dimension: "financial", added: true, text: "Do all sales and expenses go through a business bank account, separate from personal money?", type: "yesno", required: true, weight: 3, action: "Run all business income and spending through a business bank account. Mixed accounts make revenue impossible for a bank or investor to verify." },
  { id: "F7", dimension: "financial", added: true, text: "How many months of fixed costs could you cover from cash on hand today?", help: "Cash and bank balances divided by monthly rent, salaries and other overheads.", type: "months", required: true, weight: 4, bands: [{ min: 6, score: 100 }, { min: 3, score: 75 }, { min: 1, score: 50 }, { min: 0, score: 20 }], action: "Aim for a cash reserve of at least six months of fixed costs and forecast cash monthly. Try the Investopia cash flow forecaster." },
  { id: "F8", dimension: "financial", added: true, text: "Credit information: declaration or NBE credit report", help: "Mandatory. Investopia cannot access the National Bank of Ethiopia's credit reference system, so either sign the declaration below or attach your own commercial credit report from NBE for our analysts to review.", type: "creditinfo", required: true, weight: 0, unscored: true, evidence: "Signed declaration or NBE commercial credit report", action: "" },

  // B. Market & Customer
  { id: "M1", dimension: "market", text: "How many active customers do you have?", type: "number", required: true, weight: 0, unscored: true, action: "" },
  { id: "M2", dimension: "market", text: "What is your customer retention rate?", help: "Share of last year's customers who bought again this year.", type: "percent", required: true, weight: DEFAULT_WEIGHT, bands: [{ min: 90, score: 100 }, { min: 75, score: 80 }, { min: 60, score: 60 }, { min: 40, score: 40 }, { min: 0, score: 20 }], action: "Track repeat customers and introduce a retention plan: follow-up, service standards and loyalty terms.", assumed: true },
  { id: "M3", dimension: "market", text: "Do you measure customer satisfaction?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, action: "Start measuring satisfaction with a short regular survey or follow-up calls, and act on the results." },
  { id: "M4", dimension: "market", text: "What percentage of revenue comes from your largest customer?", type: "percent", required: true, weight: DEFAULT_WEIGHT, bands: [{ min: 60, score: 20, strict: true }, { min: 40, score: 50 }, { min: 20, score: 75 }, { min: 0, score: 100 }], action: "Reduce dependence on your largest customer by winning new accounts in other segments or regions." },

  { id: "M5", dimension: "market", added: true, for: ["startup"], text: "Have paying customers or signed pilots confirmed demand for your product?", type: "yesno", required: true, weight: 5, action: "Validate demand before scaling: secure paying customers, pre-orders or signed pilots." },
  { id: "M6", dimension: "market", added: true, text: "Do you have written contracts or purchase orders with your main customers?", type: "yesno", required: true, weight: 3, action: "Put agreements with your main customers in writing. Contracts make revenue predictable and can support financing against orders." },
  { id: "M7", dimension: "market", added: true, text: "What share of your sales is received through banks or digital payments (such as Telebirr or CBE Birr)?", help: "Traceable payments let lenders and investors verify your revenue.", type: "percent", required: true, weight: 2, bands: [{ min: 75, score: 100 }, { min: 50, score: 75 }, { min: 25, score: 50 }, { min: 0, score: 25 }], action: "Move more customer payments to bank transfers and mobile money so your sales record can be verified." },

  // C. Operations
  { id: "O1", dimension: "operations", text: "What percentage of orders are delivered on time?", type: "percent", required: true, weight: DEFAULT_WEIGHT, bands: [{ min: 95, score: 100 }, { min: 85, score: 80 }, { min: 70, score: 60 }, { min: 50, score: 40 }, { min: 0, score: 20 }], action: "Measure on-time delivery and fix the main causes of delay: planning, suppliers or capacity.", assumed: true },
  { id: "O2", dimension: "operations", text: "Do you have documented operating procedures?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, evidence: "Operations manual", action: "Write down your key operating procedures so work does not depend on one person." },
  { id: "O3", dimension: "operations", text: "How developed is your quality management?", help: "1 = none, 3 = basic checks, 5 = a formal, certified system.", type: "scale", required: true, weight: DEFAULT_WEIGHT, action: "Introduce quality checks at key steps and record defects and complaints." },

  { id: "O4", dimension: "operations", added: true, text: "What share of your key inputs or stock is imported?", help: "Imported inputs expose the business to foreign exchange availability and birr exchange-rate changes.", type: "percent", required: true, weight: 3, bands: [{ min: 75, score: 25, strict: true }, { min: 50, score: 50, strict: true }, { min: 25, score: 75, strict: true }, { min: 0, score: 100 }], action: "Reduce foreign exchange risk: build local supply options, agree price-adjustment clauses, and plan import needs with your bank early." },
  { id: "O5", dimension: "operations", added: true, text: "What share of your purchases comes from your single largest supplier?", type: "percent", required: true, weight: 2, bands: [{ min: 60, score: 20, strict: true }, { min: 40, score: 50 }, { min: 20, score: 75 }, { min: 0, score: 100 }], action: "Qualify at least one alternative supplier for your critical inputs." },

  // D. Human Capital
  { id: "H1", dimension: "people", text: "What is your annual staff turnover?", help: "Staff who left in the year as a share of average headcount.", type: "percent", required: true, weight: DEFAULT_WEIGHT, bands: [{ min: 30, score: 20, strict: true }, { min: 20, score: 50, strict: true }, { min: 10, score: 75 }, { min: 0, score: 100 }], action: "Find out why staff leave and address pay, progression or working conditions.", assumed: true },
  { id: "H2", dimension: "people", text: "What is your training budget as a percentage of payroll?", type: "percent", required: true, weight: DEFAULT_WEIGHT, bands: [{ min: 3, score: 100 }, { min: 1, score: 70 }, { min: 0, score: 40, strict: true }, { min: 0, score: 0 }], action: "Set aside a training budget for key skills. The Investopia Academy offers practical courses.", assumed: true },
  { id: "H3", dimension: "people", text: "Does a succession plan exist for key roles?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, action: "Name and prepare a deputy for each key role, including the owner." },

  { id: "H4", dimension: "people", added: true, text: "Are all employees registered for the mandatory private-sector pension scheme, with contributions paid?", type: "yesno", required: true, weight: 3, action: "Register all employees for the private-sector pension scheme and pay contributions on time. Arrears are a liability investors will find." },
  { id: "H5", dimension: "people", added: true, text: "Do employees have written employment contracts and job descriptions?", type: "yesno", required: true, weight: 2, action: "Issue written contracts and job descriptions to all employees, in line with the Labour Proclamation." },

  // E. Governance
  { id: "G1", dimension: "governance", text: "Does the business have a Board of Directors?", type: "yesno", required: true, weight: 5, action: "Form a board, or at least an advisory board, that meets regularly with minutes." },
  { id: "G2", dimension: "governance", text: "How formal are your internal controls?", help: "1 = none, 3 = some approvals and reconciliations, 5 = documented and regularly reviewed.", type: "scale", required: true, weight: DEFAULT_WEIGHT, action: "Separate duties for cash handling, approvals and record keeping, and reconcile accounts monthly." },
  { id: "G3", dimension: "governance", text: "Upload your current tax clearance certificate", help: "Mandatory. Issued by the Ministry of Revenues or your city or regional revenue bureau. Investopia checks it against the issuer's records in the verified EHIRA.", type: "taxclearance", required: true, weight: DEFAULT_WEIGHT, evidence: "Tax clearance certificate", action: "Bring all tax filings and payments up to date and renew your tax clearance certificate. An expired certificate caps your grade at C." },

  { id: "G4", dimension: "governance", added: true, text: "Are your accounts prepared under IFRS or IFRS for SMEs, as required by the Accounting and Auditing Board of Ethiopia?", type: "yesno", required: true, weight: 3, action: "Move your reporting to IFRS for SMEs (or full IFRS where required) with a qualified accountant." },
  { id: "G5", dimension: "governance", added: true, text: "Are the memorandum of association, shareholder records and any partner agreements up to date and registered?", type: "yesno", required: true, weight: 3, action: "Update and register your memorandum of association and shareholder records. Unclear ownership stops investment deals." },
  { id: "G6", dimension: "governance", added: true, for: ["corporate"], text: "Is there an audit or risk committee, or an internal audit function?", type: "yesno", required: true, weight: 4, action: "Set up an audit and risk committee or an internal audit function reporting to the board." },

  // F. Strategy
  { id: "S1", dimension: "strategy", text: "Does a written strategic plan exist?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, evidence: "Strategic plan", action: "Write a three-to-five-year strategic plan with clear targets." },
  { id: "S2", dimension: "strategy", text: "Are key performance indicators (KPIs) monitored monthly?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, action: "Choose five to ten KPIs (sales, margin, cash, collections, delivery) and review them every month." },

  { id: "S3", dimension: "strategy", added: true, text: "Is there a written annual budget that is compared with actual results at least quarterly?", type: "yesno", required: true, weight: 3, action: "Prepare an annual budget and review actual results against it every quarter." },
  { id: "S4", dimension: "strategy", added: true, for: ["distressed"], text: "Is there a written turnaround plan, shared with your lenders?", type: "yesno", required: true, weight: 5, action: "Prepare a turnaround plan with cash, cost and debt measures, and discuss it with your lenders early. Investopia Business Recovery advisors can help." },

  // G. Technology
  { id: "T1", dimension: "technology", text: "Do you use an ERP or accounting system?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, action: "Move your records to an accounting or ERP system instead of paper or spreadsheets." },
  { id: "T2", dimension: "technology", text: "How well are cybersecurity controls implemented?", help: "1 = none, 3 = passwords, backups and antivirus, 5 = formal policy, access control and tested backups.", type: "scale", required: true, weight: DEFAULT_WEIGHT, action: "Introduce basics: strong passwords, regular backups, access control and antivirus." },

  { id: "T3", dimension: "technology", added: true, text: "Are invoices and receipts issued from a system rather than written by hand?", type: "yesno", required: true, weight: 2, action: "Issue invoices from your accounting system or a registered sales register machine so every sale is recorded." },

  // H. Growth & Investment Readiness
  { id: "I1", dimension: "investment", text: "Is a business plan available?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, evidence: "Business plan", action: "Prepare a business plan that links your strategy to financial projections." },
  { id: "I2", dimension: "investment", text: "Is a financial model available?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, evidence: "Financial model", action: "Build a three-to-five-year financial model with clear assumptions." },
  { id: "I3", dimension: "investment", text: "Is an investor pitch deck available?", type: "yesno", required: true, weight: DEFAULT_WEIGHT, action: "Prepare a short pitch deck: problem, solution, market, traction, team, financials and the ask." },
  { id: "I4", dimension: "investment", added: true, text: "Do you know how much finance you need and exactly what it will be used for?", type: "yesno", required: true, weight: 4, action: "Set out the amount you need and a use-of-funds table showing what each part buys and what it will achieve." },
  { id: "I5", dimension: "investment", added: true, text: "What is your record with bank or MFI loans?", type: "choice", required: true, weight: 4, options: [{ value: "ontime", label: "Repaid or repaying as agreed", score: 100 }, { value: "late", label: "Some late payments", score: 40 }, { value: "default", label: "Defaulted or restructured", score: 0 }, { value: "never", label: "Never borrowed", score: null }], action: "Build a clean credit record: keep every installment on time. Banks check your history with the National Bank's credit reference system." },
  { id: "I6", dimension: "investment", added: true, for: ["sme", "borrower", "distressed", "corporate"], text: "Do you have collateral or a guarantee you could offer a lender?", help: "For example property, vehicles, machinery, or a guarantee scheme.", type: "yesno", required: true, weight: 3, action: "Document the assets you could pledge, or ask about guarantee schemes and collateral-light products such as lease financing." },
  { id: "I7", dimension: "investment", added: true, for: ["startup"], text: "Has the business raised any outside funding (grants, angel investment or an accelerator)?", type: "yesno", required: true, weight: 2, action: "Apply to an accelerator or grant program. Outside backing gives later investors confidence. See Investopia Programs." },
];

/** Screening questions behind red flags the question bank does not cover yet (assumed wording). */
export const screening: { id: string; text: string; flagIf: "yes" | "no"; cap: Grade; flag: string }[] = [
  { id: "R1", text: "Does the business hold a valid business (trade) license?", flagIf: "no", cap: "E", flag: "No business license" },
  { id: "R2", text: "Is the business under any ongoing regulatory sanction?", flagIf: "yes", cap: "D", flag: "Ongoing regulatory sanctions" },
  { id: "R3", text: "Is an insolvency or bankruptcy filing underway?", flagIf: "yes", cap: "E", flag: "Insolvency filing underway" },
  { id: "R4", text: "Is there a legal dispute that could threaten the survival of the business?", flagIf: "yes", cap: "D", flag: "Material legal dispute threatening survival" },
  { id: "R5", text: "Does management have full control over the business's cash and bank accounts?", flagIf: "no", cap: "D", flag: "No management control over cash flow" },
];

/** Red flags from added questions (addendum), on top of the framework's list. */
export const addedFlags: { id: string; is: string; cap: Grade; flag: string }[] = [
  { id: "F8", is: "yes", cap: "D", flag: "Loan more than 90 days overdue (non-performing)" },
];

export const gradeBands: { min: number; grade: Grade; label: string; meaning: string }[] = [
  { min: 90, grade: "A", label: "Investment Ready", meaning: "Strong governance, strong profitability and low risk." },
  { min: 80, grade: "B", label: "Healthy", meaning: "Good systems with minor weaknesses." },
  { min: 70, grade: "C", label: "Stable but Needs Improvement", meaning: "Average management and some operational issues." },
  { min: 60, grade: "D", label: "Vulnerable", meaning: "Financing challenges and weak controls." },
  { min: 0, grade: "E", label: "Critical", meaning: "Significant risk. Immediate intervention required." },
];

export const ratioBands = {
  currentRatio: [{ min: 2, score: 100 }, { min: 1.5, score: 80 }, { min: 1, score: 60 }, { min: -Infinity, score: 20 }] as Band[],
  // Debt-to-equity: lower is better.
  debtToEquity: [{ min: 3, score: 20, strict: true }, { min: 2, score: 50, strict: true }, { min: 1, score: 75 }, { min: 0, score: 100 }] as Band[],
  profitMargin: [{ min: 20, score: 100, strict: true }, { min: 10, score: 80 }, { min: 5, score: 60 }, { min: 0, score: 40 }, { min: -Infinity, score: 0 }] as Band[],
  dscr: [{ min: 2, score: 100, strict: true }, { min: 1.5, score: 80 }, { min: 1.2, score: 60 }, { min: 1, score: 40 }, { min: -Infinity, score: 0 }] as Band[],
};

/** Weight given to each financial ratio inside Financial Health (not set in the draft; assumed). */
export const RATIO_WEIGHT = 3;
