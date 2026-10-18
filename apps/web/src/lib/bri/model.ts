// KENA™ Bank Readiness Index (BRI): six readiness indices and the KENA Enterprise Readiness Score (KERS™),
// from Erudite Africa's framework of 18 October 2026. The index and dimension weights, the CBR and DDR rating
// bands, the KERS weights and the maturity classes are Erudite's. Which answers feed each dimension, the
// added questions below and the bands for the other four indices are Kena's draft (marked `assumed`).
import type { Question } from "@/lib/ehira/model";

/** Questions EHIRA does not already ask. They feed the BRI only, never the EHIRA grade. */
export const briQuestions: Question[] = [
  // Collateral and banking relationship
  { id: "B1", dimension: "investment", text: "What collateral could the business offer a lender?", type: "choice", required: true, weight: 1, options: [{ value: "fixed", label: "Land or buildings with title documents", score: 100 }, { value: "movable", label: "Vehicles, machinery or stock only", score: 70 }, { value: "guarantee", label: "A personal or third-party guarantee only", score: 30 }, { value: "none", label: "None", score: 0 }], action: "Build collateral coverage: document land and building titles, and list vehicles, machinery and stock that could be pledged." },
  { id: "B2", dimension: "investment", text: "Are your vehicles, machinery or other movable assets registered in the Movable Collateral Registry?", help: "Ethiopia's online registry under the Movable Property Security Right Proclamation (No. 1147/2019) lets banks lend against movable assets.", type: "choice", required: true, weight: 1, options: [{ value: "yes", label: "Yes", score: 100 }, { value: "no", label: "No", score: 0 }, { value: "na", label: "We have no movable assets", score: null }], action: "Register movable assets in the Movable Collateral Registry so banks can accept them as security." },
  { id: "B3", dimension: "investment", text: "How long has the business banked with its main bank?", type: "choice", required: true, weight: 1, options: [{ value: "3y", label: "3 years or more", score: 100 }, { value: "1y", label: "1 to 3 years", score: 70 }, { value: "new", label: "Less than a year", score: 40 }, { value: "none", label: "No business bank account", score: 0 }], action: "Keep one main bank and run all business money through it; a longer relationship makes credit easier." },
  { id: "B4", dimension: "investment", text: "Do you use more than one product with your main bank, such as an overdraft, trade finance, POS or payroll?", type: "yesno", required: true, weight: 1, action: "Deepen the banking relationship: use your main bank for payroll, collections or trade finance." },
  // MFI readiness
  { id: "B5", dimension: "investment", text: "Does the business or its owner save regularly with a bank, MFI or savings cooperative?", type: "choice", required: true, weight: 1, options: [{ value: "regular", label: "Yes, every month for 12 months or more", score: 100 }, { value: "irregular", label: "Sometimes", score: 50 }, { value: "no", label: "No", score: 0 }], action: "Build a savings record: save a fixed amount every month with a bank, MFI or savings cooperative." },
  { id: "B6", dimension: "investment", text: "Could you provide a guarantor or join a guarantee group if a lender asked?", type: "yesno", required: true, weight: 1, action: "Identify a guarantor, or join a business group that offers group guarantees." },
  { id: "B7", dimension: "investment", text: "On average, how long does it take to turn stock or work into cash received?", type: "choice", required: true, weight: 1, options: [{ value: "30", label: "Under 30 days", score: 100 }, { value: "60", label: "30 to 60 days", score: 75 }, { value: "90", label: "60 to 90 days", score: 50 }, { value: "more", label: "More than 90 days", score: 25 }], action: "Shorten the cash cycle: collect receivables faster and hold less slow-moving stock." },
  { id: "B8", dimension: "investment", text: "Could two suppliers, customers or community leaders vouch for the business and its owners?", type: "yesno", required: true, weight: 1, action: "Line up references from suppliers, customers or your business association." },
  { id: "B9", dimension: "investment", text: "Has the business or its owners had a dispute over unpaid debts in the last three years?", type: "choice", required: true, weight: 1, options: [{ value: "no", label: "No", score: 100 }, { value: "settled", label: "Yes, now settled", score: 50 }, { value: "open", label: "Yes, still open", score: 0 }], action: "Settle any open debt dispute and keep written proof of the settlement." },
  // Leasing readiness
  { id: "B10", dimension: "investment", text: "Do you need equipment, vehicles or machinery financed, and do you have a supplier quotation and a plan for how it will earn revenue?", type: "choice", required: true, weight: 1, options: [{ value: "plan", label: "Yes, with a quotation and a plan", score: 100 }, { value: "idea", label: "Yes, but no quotation or plan yet", score: 40 }, { value: "na", label: "No asset financing needed", score: null }], action: "Get a supplier quotation and write a one-page plan showing the output and revenue the asset will produce." },
  { id: "B11", dimension: "investment", text: "Do you have trained staff or a service contract to maintain your equipment?", type: "yesno", required: true, weight: 1, action: "Put a maintenance plan in place: trained staff or a service contract with the supplier." },
  { id: "B12", dimension: "investment", text: "Are your main business assets insured?", type: "choice", required: true, weight: 1, options: [{ value: "all", label: "All of them", score: 100 }, { value: "some", label: "Some of them", score: 50 }, { value: "none", label: "None", score: 0 }], action: "Insure your main assets; lessors and lenders require it." },
  // Investor readiness
  { id: "B13", dimension: "investment", text: "Is your business model written down: who pays you, for what, and how you make a margin?", type: "yesno", required: true, weight: 1, action: "Write a one-page business model: customers, what they pay for, costs and margin." },
  { id: "B14", dimension: "investment", text: "Have you estimated the size of your target market from published data?", type: "yesno", required: true, weight: 1, action: "Size your market from published sources, such as Kena's sector reports." },
  { id: "B15", dimension: "investment", text: "How did revenue change last year?", type: "choice", required: true, weight: 1, options: [{ value: "30", label: "Grew more than 30%", score: 100 }, { value: "15", label: "Grew 15 to 30%", score: 80 }, { value: "5", label: "Grew 5 to 15%", score: 60 }, { value: "0", label: "Flat (0 to 5%)", score: 40 }, { value: "down", label: "Declined", score: 10 }], action: "Build a credible growth plan with targets by product, customer and market." },
  { id: "B16", dimension: "investment", text: "Is there an up-to-date cap table showing every shareholder and their stake?", type: "yesno", required: true, weight: 1, action: "Prepare a cap table listing every shareholder, their shares and any promised equity." },
  { id: "B17", dimension: "investment", text: "Is a written investment proposal or memorandum ready?", type: "yesno", required: true, weight: 1, action: "Prepare an investment memorandum: the opportunity, the amount sought, use of funds and investor returns." },
  { id: "B18", dimension: "investment", text: "Do you track environmental and social results, such as jobs created, women employed, safety or waste?", type: "yesno", required: true, weight: 1, action: "Track a few ESG indicators: jobs, women employed, safety incidents and environmental impact." },
  // Due diligence readiness
  { id: "B19", dimension: "investment", text: "Are all licenses and permits current, including sector and environmental permits?", type: "yesno", required: true, weight: 1, action: "Renew every license and permit and keep copies together." },
  { id: "B20", dimension: "investment", text: "Do you keep an asset register with purchase dates, values and ownership documents?", type: "yesno", required: true, weight: 1, action: "Create an asset register with purchase dates, costs and ownership documents." },
  { id: "B21", dimension: "investment", text: "Are HR records complete: personnel files, payroll, and proof of pension and income tax remittance?", type: "yesno", required: true, weight: 1, action: "Complete personnel files and keep payroll, pension and tax remittance proofs for every month." },
  { id: "B22", dimension: "investment", text: "How ready is a digital folder of your key documents to share with a bank or investor?", help: "1 = nothing organized, 3 = partly organized, 5 = a complete, indexed data room.", type: "scale", required: true, weight: 1, action: "Set up a digital data room: company documents, statements, tax, contracts, licenses and HR records." },
  // M&A readiness
  { id: "B23", dimension: "investment", text: "Has the business been valued recently, or is the data for a valuation ready?", type: "choice", required: true, weight: 1, options: [{ value: "valued", label: "Professionally valued in the last 2 years", score: 100 }, { value: "data", label: "Not valued, but 3 years of statements are ready", score: 60 }, { value: "no", label: "Neither", score: 0 }], action: "Commission a valuation, or at least prepare three years of statements to support one." },
  { id: "B24", dimension: "investment", text: "Could the business run normally for three months without the founder?", type: "choice", required: true, weight: 1, options: [{ value: "yes", label: "Yes", score: 100 }, { value: "partly", label: "Partly", score: 50 }, { value: "no", label: "No", score: 0 }], action: "Delegate key decisions and relationships so the business does not depend on the founder." },
  { id: "B25", dimension: "investment", text: "Can your key contracts (customers, leases, suppliers) be transferred to a new owner?", type: "choice", required: true, weight: 1, options: [{ value: "yes", label: "Mostly yes", score: 100 }, { value: "some", label: "Some", score: 50 }, { value: "no", label: "No or don't know", score: 0 }], action: "Review key contracts for change-of-ownership clauses and renegotiate where needed." },
  { id: "B26", dimension: "investment", text: "Are all liabilities, including guarantees and pending claims, recorded in the accounts?", type: "yesno", required: true, weight: 1, action: "Record every liability, guarantee and pending claim so a buyer finds no hidden liabilities." },
  { id: "B27", dimension: "investment", text: "Are your brand name, trademarks, software or other intangibles registered in the business's name?", type: "choice", required: true, weight: 1, options: [{ value: "yes", label: "Yes", score: 100 }, { value: "partly", label: "Partly", score: 50 }, { value: "no", label: "No", score: 0 }, { value: "na", label: "We have none", score: null }], action: "Register your trade name and trademarks with the Ethiopian Intellectual Property Authority in the business's name." },
];

export type IndexId = "CBR" | "MFR" | "LR" | "IR" | "DDR" | "MAR";

/**
 * An item is a question id, a screening id (R1 to R5), or a ratio (`ratio:current`, `ratio:leverage`,
 * `ratio:margin`, `ratio:dscr`). A dimension scores the plain average of its answered items.
 */
export type Dimension = { name: string; weight: number; items: string[] };
export type Band = { min: number; label: string };

export type ReadinessIndex = { id: IndexId; name: string; purpose: string; dimensions: Dimension[]; bands: Band[]; bandsAssumed?: boolean };

const readyBands: Band[] = [
  { min: 80, label: "Ready" },
  { min: 70, label: "Nearly ready" },
  { min: 60, label: "Conditionally ready" },
  { min: 0, label: "Improvement required" },
];

export const indices: ReadinessIndex[] = [
  {
    id: "CBR",
    name: "Commercial Bank Readiness",
    purpose: "Ability to obtain financing from commercial banks.",
    dimensions: [
      { name: "Legal Compliance", weight: 15, items: ["R1", "R2", "R4", "G3", "B19", "G5"] },
      { name: "Financial Performance", weight: 20, items: ["F1", "F2", "G4", "ratio:margin", "ratio:current"] },
      { name: "Cash Flow Capacity", weight: 20, items: ["ratio:dscr", "F7", "M7"] },
      { name: "Governance", weight: 10, items: ["G1", "G2", "S3"] },
      { name: "Credit History", weight: 15, items: ["F8", "I5"] },
      { name: "Collateral Strength", weight: 15, items: ["B1", "B2", "I6"] },
      { name: "Banking Relationship", weight: 5, items: ["B3", "B4", "F6"] },
    ],
    bands: [
      { min: 90, label: "Prime Borrower" },
      { min: 80, label: "Highly Bankable" },
      { min: 70, label: "Bankable" },
      { min: 60, label: "Conditionally Bankable" },
      { min: 0, label: "Credit Improvement Required" },
    ],
  },
  {
    id: "MFR",
    name: "MFI Readiness",
    purpose: "Suitability for financing from microfinance institutions, which weigh character, repayment behavior and the cash cycle more than audited accounts or fixed collateral.",
    dimensions: [
      { name: "Business Legitimacy", weight: 15, items: ["R1", "G3", "G5"] },
      { name: "Revenue Stability", weight: 20, items: ["M2", "M4", "M6", "B15"] },
      { name: "Cash Turnover", weight: 20, items: ["B7", "F7", "M7"] },
      { name: "Character & Reputation", weight: 20, items: ["B8", "B9", "R4"] },
      { name: "Existing Debt Burden", weight: 10, items: ["ratio:leverage", "ratio:dscr", "F8"] },
      { name: "Savings History", weight: 10, items: ["B5"] },
      { name: "Group Guarantees", weight: 5, items: ["B6"] },
    ],
    bands: readyBands,
    bandsAssumed: true,
  },
  {
    id: "LR",
    name: "Leasing Readiness",
    purpose: "Readiness for equipment, vehicle and machinery leasing and other asset-based finance.",
    dimensions: [
      { name: "Asset Utilization Plan", weight: 20, items: ["B10", "I4"] },
      { name: "Repayment Capacity", weight: 25, items: ["ratio:dscr", "F7", "I5", "F8"] },
      { name: "Business Stability", weight: 15, items: ["M2", "M4", "H1", "B15"] },
      { name: "Management Capacity", weight: 10, items: ["H3", "S2", "G2"] },
      { name: "Maintenance Capability", weight: 10, items: ["B11", "O2"] },
      { name: "Financial Health", weight: 10, items: ["F1", "ratio:margin", "ratio:current", "ratio:leverage"] },
      { name: "Insurance Preparedness", weight: 10, items: ["B12"] },
    ],
    bands: readyBands,
    bandsAssumed: true,
  },
  {
    id: "IR",
    name: "Investor Readiness",
    purpose: "Attractiveness to angel, venture capital, private equity, impact and strategic investors.",
    dimensions: [
      { name: "Business Model", weight: 15, items: ["B13", "ratio:margin"] },
      { name: "Market Opportunity", weight: 15, items: ["B14", "M2"] },
      { name: "Growth Potential", weight: 15, items: ["B15", "S1"] },
      { name: "Management Team", weight: 15, items: ["H3", "H5", "B24"] },
      { name: "Financial Transparency", weight: 15, items: ["F1", "F2", "G4", "T1"] },
      { name: "Governance", weight: 10, items: ["G1", "G2", "G6"] },
      // The framework's evidence list: pitch deck, business plan, financial model, growth strategy, cap table, shareholder structure, investment proposal.
      { name: "Investment Documentation", weight: 10, items: ["I3", "I1", "I2", "S1", "B16", "G5", "B17"] },
      { name: "ESG Performance", weight: 5, items: ["B18", "H4"] },
    ],
    bands: readyBands,
    bandsAssumed: true,
  },
  {
    id: "DDR",
    name: "Due Diligence Readiness",
    purpose: "Preparedness for review by banks, investors, donors, development finance institutions and acquirers.",
    dimensions: [
      { name: "Corporate Documents", weight: 15, items: ["G5", "B16", "R1"] },
      { name: "Financial Records", weight: 20, items: ["F1", "F2", "G4", "T1", "T3"] },
      { name: "Tax Compliance", weight: 15, items: ["G3"] },
      { name: "Legal Compliance", weight: 15, items: ["R2", "R3", "R4", "B19"] },
      { name: "Operational Documentation", weight: 10, items: ["O2", "O3"] },
      { name: "Human Resources Records", weight: 10, items: ["B21", "H4", "H5"] },
      { name: "Asset Register", weight: 5, items: ["B20"] },
      { name: "Digital Data Room", weight: 10, items: ["B22"] },
    ],
    bands: [
      { min: 90, label: "Due Diligence Ready" },
      { min: 75, label: "Minor Gaps" },
      { min: 60, label: "Significant Preparation Needed" },
      { min: 0, label: "High Transaction Risk" },
    ],
  },
  {
    id: "MAR",
    name: "M&A Readiness",
    purpose: "Readiness for a business sale, acquisition, strategic partnership, joint venture or succession.",
    dimensions: [
      { name: "Business Valuation Preparedness", weight: 20, items: ["B23", "I2"] },
      { name: "Financial Transparency", weight: 20, items: ["F1", "F2", "G4", "B26"] },
      { name: "Legal Cleanliness", weight: 15, items: ["R2", "R3", "R4", "G5", "B25"] },
      { name: "Growth Prospects", weight: 15, items: ["B15", "S1"] },
      { name: "Management Independence", weight: 10, items: ["B24", "H3"] },
      { name: "Customer & Supplier Diversification", weight: 10, items: ["M4", "O5"] },
      { name: "Intellectual Property & Intangibles", weight: 10, items: ["B27"] },
    ],
    bands: readyBands,
    bandsAssumed: true,
  },
];

export const kersWeights: Record<IndexId, number> = { CBR: 20, MFR: 10, LR: 10, IR: 20, DDR: 20, MAR: 20 };

export const maturityBands: Band[] = [
  { min: 90, label: "Enterprise Excellence" },
  { min: 80, label: "Investment Ready" },
  { min: 70, label: "Growth Ready" },
  { min: 60, label: "Emerging Enterprise" },
  { min: 50, label: "Development Stage" },
  { min: 0, label: "Foundation Stage" },
];

/** Short gap labels and actions for items that are not ordinary questions, or whose EHIRA wording does not fit a lender. */
export const itemText: Record<string, { gap: string; action?: string }> = {
  "ratio:current": { gap: "Current ratio below 1.2", action: "Improve the current ratio to above 1.2 by collecting receivables and reducing short-term debt." },
  "ratio:leverage": { gap: "High debt relative to equity", action: "Reduce debt or add equity to bring debt-to-equity below 1.0." },
  "ratio:margin": { gap: "Low profit margin", action: "Raise the net profit margin by reviewing prices, costs and unprofitable products." },
  "ratio:dscr": { gap: "Low debt service coverage ratio", action: "Lift debt service coverage above 1.25 by growing operating income or restructuring repayments." },
  R1: { gap: "No valid business license", action: "Obtain or renew the business license." },
  R2: { gap: "Ongoing regulatory sanction", action: "Resolve the regulatory sanction and keep the closing letter." },
  R3: { gap: "Insolvency filing underway", action: "Work through the insolvency process with a licensed adviser before seeking new finance." },
  R4: { gap: "Legal dispute that threatens the business", action: "Resolve or settle the legal dispute and document the outcome." },
  R5: { gap: "Management lacks control of cash", action: "Put management in control of all bank accounts and cash." },
  F1: { gap: "No annual financial statements", action: "Prepare annual financial statements for the last three years." },
  F2: { gap: "No audited financial statements", action: "Complete an audit of the last three years." },
  F6: { gap: "Business and personal money mixed", action: "Run all business money through a separate business bank account." },
  F7: { gap: "Thin cash reserve", action: "Build a cash reserve of at least three months of fixed costs." },
  F8: { gap: "Non-performing loan reported", action: "Agree a repayment plan for the overdue loan with the lender and keep it current." },
  G1: { gap: "No board", action: "Establish a board or an advisory board that meets regularly." },
  G2: { gap: "Weak internal controls", action: "Separate duties for cash, approvals and records, and reconcile monthly." },
  G3: { gap: "Tax compliance gaps", action: "Obtain a current tax clearance certificate." },
  G4: { gap: "Accounts not under IFRS", action: "Prepare accounts under IFRS for SMEs." },
  G5: { gap: "Company records out of date", action: "Update the memorandum of association and shareholder register." },
  I1: { gap: "No business plan", action: "Write a business plan." },
  I2: { gap: "No financial model", action: "Build 3-year financial projections." },
  I3: { gap: "No investor deck", action: "Prepare an investor pitch deck." },
  I5: { gap: "Weak credit record", action: "Keep every installment on time to rebuild your credit record." },
  I6: { gap: "Weak collateral coverage", action: "Identify assets or guarantees that can secure a loan." },
  M2: { gap: "Low customer retention", action: "Find out why customers leave and fix the main reasons." },
  M4: { gap: "Revenue concentration risk", action: "Diversify the customer base so no customer exceeds 20% of revenue." },
  O5: { gap: "Dependence on one supplier", action: "Qualify a second supplier for key inputs." },
  B1: { gap: "Weak collateral coverage" },
  B2: { gap: "Movable assets not registered", action: "Register movable assets in the Movable Collateral Registry." },
  B16: { gap: "No cap table" },
  B17: { gap: "No investment memorandum", action: "Prepare an investment memorandum." },
  B23: { gap: "No valuation report" },
  B24: { gap: "Business depends on the founder" },
  B3: { gap: "Short banking relationship" },
  B4: { gap: "Few products used with the main bank" },
  B5: { gap: "No regular savings record" },
  B6: { gap: "No guarantor available" },
  B7: { gap: "Slow cash cycle" },
  B8: { gap: "No references to vouch for the business" },
  B9: { gap: "Dispute over unpaid debts" },
  B10: { gap: "No plan or quotation for the asset" },
  B11: { gap: "No maintenance capability" },
  B12: { gap: "Assets not fully insured" },
  B13: { gap: "Business model not documented" },
  B14: { gap: "Market size not estimated" },
  B15: { gap: "Weak revenue growth" },
  B18: { gap: "ESG results not tracked" },
  B19: { gap: "Licenses or permits not current" },
  B20: { gap: "No asset register" },
  B21: { gap: "Incomplete HR records" },
  B22: { gap: "No digital data room" },
  B25: { gap: "Key contracts not transferable" },
  B26: { gap: "Liabilities not fully recorded" },
  B27: { gap: "Intangibles not registered" },
  M6: { gap: "No written customer contracts" },
  M7: { gap: "Sales mostly in untraceable cash" },
  S1: { gap: "No written strategy" },
  S2: { gap: "KPIs not tracked monthly" },
  S3: { gap: "No budget versus actual review" },
  H1: { gap: "High staff turnover" },
  H3: { gap: "No succession plan" },
  H4: { gap: "Staff not registered for pension" },
  H5: { gap: "No written employment contracts" },
  O2: { gap: "No documented procedures" },
  O3: { gap: "Weak quality management" },
  T1: { gap: "No accounting system" },
  T3: { gap: "Handwritten invoices" },
  I4: { gap: "Funding need and use not defined" },
  G6: { gap: "No audit or risk committee" },
};
