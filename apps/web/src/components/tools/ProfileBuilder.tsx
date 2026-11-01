"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  agricultureDocs,
  auditedAlwaysFrom,
  auditedFrom,
  borrowerTypeDocs,
  borrowerTypes,
  businessDocs,
  collateralTypes,
  educationLevels,
  expansionDocs,
  generalDocs,
  loanTypes,
  minimumLoan,
  sectors,
  type BorrowerType,
  type CollateralTypeId,
  type LoanTypeId,
} from "@/data/credit/profile";
import { ifbDocs, ifbProducts, modeById, productById, midSentence, prohibitedActivities, saleProfit, screen, termModeNote, type IfbModeId, type IfbProductId } from "@/data/credit/ifb";
import { frequencies, installmentCount, installmentFor, type Frequency } from "@/lib/calc/loan";
import { findDetails, readText, type Found } from "@/lib/docs/extract";
import { clearFiles, deleteFile, getFile, putFile } from "@/lib/docs/store";
import { IdentityStep, identityVerified, useIdentity } from "./IdentityCheck";
import { BankPack, LetterStep, PackDownload } from "./ProfilePack";

/**
 * Borrower profile builder: a step-by-step version of a bank loan application and
 * the lender's due diligence summary. Everything stays in this browser (saved as a
 * draft in localStorage when allowed); nothing is sent anywhere.
 */

type Owner = { name: string; share: string; role: string };
type Manager = { name: string; position: string; education: string; years: string };
type Related = { name: string; relation: string; loans: string };
type Year = { year: string; sales: string; cost: string; profit: string };
type Facility = { lender: string; type: string; limit: string; outstanding: string; installment: string; status: "performing" | "late" | "nonperforming" };
export type Attached = { id: string; name: string; size: number };
type Collateral = { type: CollateralTypeId; description: string; owner: "applicant" | "third"; value: string; year: string; insured: boolean };

export type Profile = {
  borrowerType: BorrowerType;
  name: string;
  tin: string;
  licence: string;
  licenceRenewed: string;
  sector: string;
  started: string;
  relatedExperience: boolean;
  address: string;
  phone: string;
  email: string;
  maritalStatus: string;
  viaAgent: boolean;
  owners: Owner[];
  managers: Manager[];
  related: Related[];
  loanType: LoanTypeId;
  /** Conventional loan, or interest-free (IFB) financing under Sharia'h principles. */
  financing: "conventional" | "ifb";
  ifbProduct: IfbProductId;
  ifbMode: IfbModeId;
  activity: "" | "Permissible" | "Prohibited";
  /** Whether most of the business's existing financing is from conventional banks. */
  mainlyConventional: "" | "Yes" | "No";
  nonPermissibleIncome: string;
  amount: string;
  purpose: string;
  termMonths: string;
  frequency: Frequency;
  graceMonths: string;
  totalCost: string;
  rate: string;
  repaymentSource: string;
  statements: "audited" | "provisional" | "none";
  years: Year[];
  currentAssets: string;
  inventory: string;
  receivables: string;
  currentLiabilities: string;
  totalAssets: string;
  totalLiabilities: string;
  equity: string;
  customers: string;
  suppliers: string;
  mainBank: string;
  bankSince: string;
  facilities: Facility[];
  creditRecord: "clean" | "issues" | "unsure";
  bouncedCheques: boolean;
  collateral: Collateral[];
  projectStage: "new" | "expansion";
  letterBank: string;
  letterBranch: string;
  signatory: string;
  signatoryTitle: string;
  letterBody: string;
  done: Record<string, boolean>;
  files: Record<string, Attached[]>;
};

const thisYear = new Date().getFullYear();

const emptyProfile = (): Profile => ({
  borrowerType: "plc",
  name: "",
  tin: "",
  licence: "",
  licenceRenewed: "",
  sector: sectors[1],
  started: "",
  relatedExperience: false,
  address: "",
  phone: "",
  email: "",
  maritalStatus: "",
  viaAgent: false,
  owners: [{ name: "", share: "", role: "" }],
  managers: [{ name: "", position: "", education: "", years: "" }],
  related: [],
  loanType: "working-capital",
  financing: "conventional",
  ifbProduct: "murabaha-merchandise",
  ifbMode: "murabaha",
  activity: "",
  mainlyConventional: "",
  nonPermissibleIncome: "",
  amount: "",
  purpose: "",
  termMonths: "",
  frequency: "monthly",
  graceMonths: "",
  totalCost: "",
  rate: "17",
  repaymentSource: "",
  statements: "provisional",
  years: [0, 1, 2].map((i) => ({ year: String(thisYear - 3 + i), sales: "", cost: "", profit: "" })),
  currentAssets: "",
  inventory: "",
  receivables: "",
  currentLiabilities: "",
  totalAssets: "",
  totalLiabilities: "",
  equity: "",
  customers: "",
  suppliers: "",
  mainBank: "",
  bankSince: "",
  facilities: [],
  creditRecord: "unsure",
  bouncedCheques: false,
  collateral: [],
  projectStage: "new",
  letterBank: "",
  letterBranch: "",
  signatory: "",
  signatoryTitle: "",
  letterBody: "",
  done: {},
  files: {},
});

const KEY = "investopia-borrower-profile";

function load(): Profile | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...emptyProfile(), ...(JSON.parse(raw) as Partial<Profile>) } : null;
  } catch {
    return null;
  }
}

function save(p: Profile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage unavailable: the profile lasts for this visit only.
  }
}

export function num(v: string) {
  const n = Number(String(v).replace(/,/g, ""));
  return v.trim() !== "" && Number.isFinite(n) ? n : NaN;
}
export const has = (n: number) => !Number.isNaN(n);
export const birr = (n: number) => `ETB ${Math.round(n).toLocaleString("en-US")}`;
export const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const times = (n: number) => `${n.toFixed(2)}x`;

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
const labelClass = "block text-sm font-medium text-ink";
const smallButton = "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-brand-700 hover:border-brand-500";

const steps = ["Identity check", "Company profile", "Applicant", "Owners and management", "Loan request", "Finances", "Banking record", "Collateral", "Documents", "Application letter", "Your profile"];

const PROFILE_DOC = businessDocs[0];
const ACCEPT = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png";
const MAX_BYTES = 10 * 1024 * 1024;
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/* ---------- small form helpers ---------- */

function Text({ label, value, onChange, hint, type = "text", wide }: { label: string; value: string; onChange: (v: string) => void; hint?: string; type?: string; wide?: boolean }) {
  return (
    <label className={`${labelClass} ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

function Money({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className={labelClass}>
      {label}
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder="ETB" />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

function Choice<T extends string>({ label, value, onChange, options, wide }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; wide?: boolean }) {
  return (
    <label className={`${labelClass} ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Check({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm text-ink sm:col-span-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
      <span>{label}</span>
    </label>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Rows<T>({
  title,
  rows,
  onChange,
  blank,
  render,
  addLabel,
}: {
  title: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  blank: T;
  render: (row: T, set: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 font-semibold text-ink">{title}</legend>
      {rows.map((row, i) => (
        <div key={i} className="rounded-xl border border-line bg-canvas p-4">
          {render(row, (patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r))))}
          <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="mt-3 text-sm font-semibold text-red-700 hover:underline">
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, { ...blank }])} className={smallButton}>
        + {addLabel}
      </button>
    </fieldset>
  );
}

/* ---------- analysis ---------- */

export const isIfb = (p: Profile) => p.financing === "ifb";
/** The product requested: a conventional loan type, or an interest-free product. */
export const productOf = (p: Profile) => (isIfb(p) ? (productById(p.ifbProduct) ?? ifbProducts[0]) : loanTypes.find((l) => l.id === p.loanType)!);
/** The interest-free mode, kept to one the product allows. */
export const modeOf = (p: Profile) => {
  const prod = productById(p.ifbProduct) ?? ifbProducts[0];
  return modeById(prod.modes.includes(p.ifbMode) ? p.ifbMode : prod.modes[0])!;
};
/** Words that differ between a conventional loan and interest-free financing. */
export const words = (p: Profile) => (isIfb(p) ? { loan: "financing", Loan: "Financing", rate: "profit rate", borrowing: "financing" } : { loan: "loan", Loan: "Loan", rate: "interest rate", borrowing: "borrowing" });

type Flag = { level: "fix" | "check" | "good"; text: string };

export function analyse(p: Profile) {
  const loan = productOf(p);
  const ifb = isIfb(p);
  const mode = ifb ? modeOf(p) : null;
  const w = words(p);
  const amount = num(p.amount);
  const term = num(p.termMonths);
  const rate = num(p.rate);
  const grace = has(num(p.graceMonths)) ? num(p.graceMonths) : 0;
  const totalCost = num(p.totalCost);
  const isBusiness = p.borrowerType !== "individual";

  const existing = p.facilities.reduce((s, f) => s + (has(num(f.outstanding)) ? num(f.outstanding) : 0), 0);
  const existingMonthly = p.facilities.reduce((s, f) => s + (has(num(f.installment)) ? num(f.installment) : 0), 0);
  const exposure = (has(amount) ? amount : 0) + existing;

  let installment = NaN;
  let n = 0;
  let profit = NaN;
  if (has(amount) && amount > 0 && has(term) && term > grace && (has(rate) || mode?.pricing === "none")) {
    n = installmentCount(term - grace, p.frequency).n;
    if (n > 0 && !mode) installment = installmentFor(amount, rate, p.frequency, n);
    // A deferred sale fixes cost plus profit as the sale price, paid in equal installments.
    else if (n > 0 && mode?.pricing === "sale") {
      profit = saleProfit(amount, rate, term);
      installment = (amount + profit) / n;
    } else if (n > 0 && mode?.pricing === "rent") installment = installmentFor(amount, rate, p.frequency, n);
    else if (n > 0 && mode?.pricing === "none") installment = amount / n;
  }
  if (ifb && productById(p.ifbProduct)?.offBalance) installment = NaN;
  const salePrice = has(profit) ? amount + profit : NaN;
  const perYear = frequencies.find((f) => f.value === p.frequency)!.perYear;
  const newAnnual = has(installment) ? installment * perYear : NaN;
  const annualService = (has(newAnnual) ? newAnnual : 0) + existingMonthly * 12;

  const years = p.years.map((y) => ({ year: y.year, sales: num(y.sales), cost: num(y.cost), profit: num(y.profit) }));
  const latest = [...years].reverse().find((y) => has(y.sales) || has(y.profit));
  const prior = latest ? years[years.indexOf(latest) - 1] : undefined;
  const ca = num(p.currentAssets);
  const inv = num(p.inventory);
  const cl = num(p.currentLiabilities);
  const ta = num(p.totalAssets);
  const tl = num(p.totalLiabilities);
  const eq = num(p.equity);

  const ratios: { label: string; value: string; note: string }[] = [];
  if (has(ca) && has(cl) && cl > 0) ratios.push({ label: "Current ratio", value: times(ca / cl), note: "Current assets over current liabilities; above 1 means short-term debts are covered." });
  if (has(ca) && has(inv) && has(cl) && cl > 0) ratios.push({ label: "Quick ratio", value: times((ca - inv) / cl), note: "The same test without stock, which takes time to sell." });
  if (has(tl) && has(eq) && eq > 0) ratios.push({ label: "Debt to equity", value: times(tl / eq), note: "How much the business owes for each birr the owners put in. Lower is safer." });
  if (has(tl) && has(ta) && ta > 0) ratios.push({ label: "Debt to assets", value: pct(tl / ta), note: "Share of assets financed by debt." });
  if (latest && has(latest.sales) && latest.sales > 0 && has(latest.cost)) ratios.push({ label: "Gross margin", value: pct((latest.sales - latest.cost) / latest.sales), note: `Sales less cost of sales, ${latest.year}.` });
  if (latest && has(latest.sales) && latest.sales > 0 && has(latest.profit)) ratios.push({ label: "Net margin", value: pct(latest.profit / latest.sales), note: `Net profit over sales, ${latest.year}.` });
  if (latest && prior && has(latest.sales) && has(prior.sales) && prior.sales > 0) ratios.push({ label: "Sales growth", value: pct((latest.sales - prior.sales) / prior.sales), note: `${prior.year} to ${latest.year}. Expect questions on any large jump or fall.` });
  if (latest && has(latest.profit) && has(eq) && eq > 0) ratios.push({ label: "Return on equity", value: pct(latest.profit / eq), note: "Net profit over owners' equity." });
  if (latest && has(latest.profit) && annualService > 0) ratios.push({ label: "Profit cover of repayments", value: times(latest.profit / annualService), note: "Yearly net profit over yearly loan repayments (new and existing). Lenders want comfortably above 1." });

  const ownShare = has(totalCost) && totalCost > 0 && has(amount) ? (totalCost - amount) / totalCost : NaN;
  const incomeRatio = has(num(p.nonPermissibleIncome)) && latest && has(latest.sales) && latest.sales > 0 ? num(p.nonPermissibleIncome) / latest.sales : NaN;
  const screening = ifb ? screen(p.activity, incomeRatio, p.mainlyConventional) : null;

  let counted = 0;
  let estimated = 0;
  for (const c of p.collateral) {
    const type = collateralTypes.find((t) => t.id === c.type)!;
    const v = num(c.value);
    if (!has(v) || type.unsecured) continue;
    estimated += v;
    counted += type.counted ? (v * type.counted) / 100 : v;
  }

  const flags: Flag[] = [];
  const fix = (text: string) => flags.push({ level: "fix", text });
  const check = (text: string) => flags.push({ level: "check", text });
  const good = (text: string) => flags.push({ level: "good", text });

  if (!p.name.trim()) fix("Add the applicant's name.");
  if (!p.tin.trim()) fix("Get a Tax Identification Number (TIN). Every lender asks for it, and it is how your credit record is checked.");
  if (!has(amount) || amount <= 0) fix(`Enter the ${w.loan} amount you need.`);
  if (!p.purpose.trim()) fix(`Describe what the ${w.loan} will pay for. Lenders check that the money is used for the stated purpose.`);
  if (screening) {
    if (screening.decision === "Not eligible") fix(`Sharia'h screening: not eligible. ${screening.reasons.join(" ")} Interest-free financing cannot be offered unless this changes.`);
    else if (screening.decision === "Not screened") fix("Confirm that your main business activity is permissible, so the lender can screen it for interest-free financing.");
    else if (screening.decision === "Eligible with conditions") check(`Sharia'h screening: eligible with conditions. ${screening.conditions.join(" ")}`);
    else good("Sharia'h screening: your business activity is permissible.");
    if (isBusiness && (!has(incomeRatio) || !p.mainlyConventional)) check("Enter any interest or other non-Halal income, with your sales, and say whether most of your existing financing is from conventional banks, so the screening can be completed.");
    const note = mode ? termModeNote(productById(p.ifbProduct) ?? ifbProducts[0], mode.id, term) : "";
    if (note) check(note);
    check("Open an interest-free deposit account with the lender; it is required for interest-free financing.");
    if (mode?.id === "murabaha" || mode?.id === "tijarah") check("The lender buys and owns the goods before selling them to you, so have supplier proforma invoices ready and expect the goods or their title documents to pass through the lender.");
  }
  if (!p.repaymentSource.trim()) fix("Explain where repayments will come from. Lenders weigh your ability to repay above your collateral.");

  if (isBusiness) {
    if (!p.licence.trim()) fix("Add your trade licence number. A valid, renewed licence for the financed activity is required.");
    if (p.licenceRenewed) {
      const renewed = Date.parse(p.licenceRenewed);
      if (has(renewed) && Date.now() - renewed > 365 * 864e5) fix("Your trade licence was last renewed over a year ago. Renew it before applying.");
    }
    const startedYear = num(p.started);
    if (loan.needsTrackRecord && has(startedYear)) {
      const age = thisYear - startedYear;
      if (age < 1 && !p.relatedExperience) fix("Most lenders need the business to have run for at least a year, or six months if the owner or manager has related experience.");
      else if (age < 1) check("Your business is under a year old. Show the owner's or manager's related experience clearly.");
      else good(`In business since ${startedYear}.`);
    }
    if (exposure >= auditedAlwaysFrom && p.statements !== "audited")
      fix(`With total ${w.borrowing} of ${birr(exposure)}, lenders require audited financial statements from an auditor certified by the Accounting and Audit Board of Ethiopia.`);
    else if (exposure >= auditedFrom && p.statements !== "audited")
      check(`Total ${w.borrowing} of ${birr(exposure)}: many lenders ask for audited statements from ETB 5 million, all from ETB 10 million.`);
    if (p.statements === "none") check("Without formal books, you will complete and sign a commercial credit report, and the lender will verify the figures at your premises.");
    if (!latest) check("Add at least one year of sales and profit. Lenders analyse three years of statements.");
  }

  if (has(amount) && amount > 0 && amount < minimumLoan && !loan.noMinimum && !["sole", "cooperative"].includes(p.borrowerType))
    check(`Many lenders start business loans at ${birr(minimumLoan)}. The minimum is usually waived for start-ups and micro, small and medium enterprises.`);

  if (loan.maxMonths && has(term) && term > loan.maxMonths) check(`A ${loan.name.toLowerCase()} usually runs ${loan.typicalTerm.toLowerCase()}. Your requested term is longer.`);
  if (loan.minOwnShare && has(ownShare)) {
    if (ownShare * 100 < loan.minOwnShare) check(`Your own contribution is ${pct(ownShare)} of the total cost. For this loan type lenders typically expect at least ${loan.minOwnShare}%.`);
    else good(`Your own contribution is ${pct(ownShare)} of the total cost.`);
  } else if (loan.minOwnShare && !has(ownShare)) check("Enter the total cost of what you are financing, so your own contribution can be checked.");

  if (p.facilities.some((f) => f.status === "nonperforming"))
    fix("You have a non-performing loan. Under National Bank of Ethiopia rules, lenders cannot give new loans until it is settled or restructured.");
  else if (p.facilities.some((f) => f.status === "late")) check("A late payment on an existing loan will show on your credit report. Bring it up to date and be ready to explain it.");
  if (p.creditRecord === "issues") check("Resolve any problems on your credit record before applying.");
  if (p.creditRecord === "unsure") check("Ask your bank for your credit report from the National Bank of Ethiopia's credit reference system, so nothing surprises you.");
  if (p.creditRecord === "clean" && !p.facilities.some((f) => f.status !== "performing")) good("Clean credit record.");
  if (p.bouncedCheques) check("Bounced cheques count against your character in the lender's assessment. Keep enough balance for every cheque you write.");

  if (latest && has(latest.profit) && annualService > 0) {
    const cover = latest.profit / annualService;
    if (cover < 1) check(`Yearly repayments (${birr(annualService)}) are larger than last year's net profit. Consider a smaller loan or longer term, or show how the loan will raise profit.`);
    else if (cover < 1.25) check("Repayments take up most of your profit. Lenders like a comfortable margin.");
    else good("Profit comfortably covers the repayments.");
  }

  const secured = p.collateral.some((c) => !collateralTypes.find((t) => t.id === c.type)!.unsecured);
  if (ifb ? mode?.pricing !== "none" : !["overdrawal", "warehouse-receipt"].includes(p.loanType)) {
    if (!secured) check(ifb ? "You have not listed any collateral. Unsecured financing is only for well-established, profitable businesses." : "You have not listed any collateral. Unsecured loans are only for well-established, profitable businesses, at a higher interest rate.");
    else if (has(amount) && counted < amount) check(`Your listed collateral counts for about ${birr(counted)}, less than the loan. Lenders lend only part of what you pledge, so plan for collateral worth more than the loan.`);
    else if (has(amount)) good("Your listed collateral is worth more than the loan.");
  }
  for (const c of p.collateral) {
    const type = collateralTypes.find((t) => t.id === c.type)!;
    const y = num(c.year);
    if (type.hasAge && has(y) && thisYear - y > 10) check(`${c.description || type.name}: vehicles and machinery over 10 years old are rarely accepted as collateral.`);
    if (c.type === "building-construction") check(`${c.description || type.name}: buildings count as collateral once at least 60% complete (residential) or 65% (commercial).`);
    if (c.owner === "third") check(`${c.description || type.name} belongs to someone else. The owner (and spouse) must sign the mortgage and provide tax clearance and marital status evidence.`);
    if (!c.insured && !type.unsecured && !["cash", "bank-guarantee", "shares-financial", "shares-other", "securities"].includes(c.type))
      check(`${c.description || type.name}: insure it and endorse the policy to the lender before disbursement.`);
  }
  if (p.viaAgent) check("An agent applying for you needs a power of attorney authenticated by the Documents Authentication and Registration Service that clearly allows borrowing and mortgaging.");

  return { loan, mode, words: w, amount, exposure, installment, n, profit, salePrice, newAnnual, annualService, ratios, ownShare, incomeRatio, screening, counted, estimated, flags, latest };
}

export function documents(p: Profile) {
  const loan = productOf(p);
  const groups: { title: string; items: string[] }[] = [{ title: "Every applicant", items: [...generalDocs] }];
  if (p.borrowerType !== "individual") {
    const exposure = num(p.amount) + p.facilities.reduce((s, f) => s + (has(num(f.outstanding)) ? num(f.outstanding) : 0), 0);
    const biz = [...businessDocs];
    if (has(exposure) && exposure >= auditedFrom) biz.push("Audited financial statements from a certified auditor");
    if (p.statements === "none") biz.push("Commercial credit report, completed and signed by you");
    groups.push({ title: "Your business", items: biz });
  }
  const typeDocs = borrowerTypeDocs[p.borrowerType];
  if (typeDocs) groups.push({ title: borrowerTypes.find((b) => b.value === p.borrowerType)!.label, items: typeDocs });
  if (p.viaAgent) groups.push({ title: "Applying through an agent", items: ["Authenticated power of attorney allowing borrowing and mortgaging"] });
  if (p.sector === "Building and construction" && p.borrowerType !== "individual")
    groups.push({
      title: "Contractors",
      items: [
        "List of owned construction machinery and vehicles",
        "Completion letters from past employers",
        "Status of current projects, with contract amounts and percentage complete",
        "Employer's undertaking to pay contract proceeds through the lender",
      ],
    });
  groups.push({ title: loan.name, items: loan.docs });
  if (isIfb(p)) {
    const mode = modeOf(p);
    groups.push({ title: "Interest-free financing", items: ifbDocs });
    groups.push({ title: `${mode.name}: signed after approval`, items: mode.docs });
  }
  if (!isIfb(p) && p.loanType === "project" && p.projectStage === "expansion") groups.push({ title: "Expanding an existing project", items: expansionDocs });
  if (!isIfb(p) && p.loanType === "project" && p.sector === "Agriculture") groups.push({ title: "Commercial agriculture projects", items: agricultureDocs });
  const seen = new Set<string>();
  const coll: string[] = [];
  for (const c of p.collateral)
    for (const d of collateralTypes.find((t) => t.id === c.type)!.docs) {
      if (seen.has(d)) continue;
      seen.add(d);
      coll.push(d);
    }
  if (coll.length) groups.push({ title: "Collateral", items: coll });
  return groups;
}

/* ---------- component ---------- */

export function ProfileBuilder() {
  const [p, setP] = useState<Profile>(emptyProfile);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const saved = load();
      if (saved) setP(saved);
      setLoaded(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (loaded) save(p);
  }, [p, loaded]);

  const set = (patch: Partial<Profile>) => setP((old) => ({ ...old, ...patch }));
  const at = steps[step];
  const identity = useIdentity();
  const verified = identityVerified(identity, p.tin);
  // Files also live here for the visit, in case the browser blocks IndexedDB.
  const blobs = useRef(new Map<string, Blob>());
  const [found, setFound] = useState<Found[] | null>(null);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState("");

  async function attach(doc: string, list: FileList | null) {
    if (!list?.length) return;
    setFileError("");
    const added: Attached[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_BYTES) {
        setFileError(`${file.name} is larger than 10 MB. Please upload a smaller, readable copy.`);
        continue;
      }
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      blobs.current.set(id, file);
      await putFile(id, file);
      added.push({ id, name: file.name, size: file.size });
    }
    setP((old) => ({ ...old, files: { ...old.files, [doc]: [...(old.files[doc] ?? []), ...added] } }));
    return added;
  }

  async function detach(doc: string, id: string) {
    blobs.current.delete(id);
    await deleteFile(id);
    setP((old) => ({ ...old, files: { ...old.files, [doc]: (old.files[doc] ?? []).filter((f) => f.id !== id) } }));
  }

  async function openFile(id: string) {
    const blob = blobs.current.get(id) ?? (await getFile(id));
    if (!blob) {
      setFileError("That file is no longer stored in this browser. Please attach it again.");
      return;
    }
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function readProfile(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setReading(true);
    await attach(PROFILE_DOC, list);
    const text = file.size <= MAX_BYTES ? await readText(file) : "";
    setFound(text ? findDetails(text) : []);
    setReading(false);
  }

  function apply(f: Found) {
    if (f.field === "manager") {
      const rest = p.managers.filter((m) => m.name);
      set({ managers: [{ name: f.value, position: "General manager", education: "", years: "" }, ...rest] });
    } else if (f.field === "sector") set({ sector: f.value });
    else set({ [f.field]: f.value } as Partial<Profile>);
    setFound((list) => list?.filter((x) => x !== f) ?? null);
  }
  const a = useMemo(() => analyse(p), [p]);
  const docs = useMemo(() => documents(p), [p]);
  const isBusiness = p.borrowerType !== "individual";

  function go(i: number) {
    setStep(i);
    document.getElementById("profile-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    blobs.current.clear();
    void clearFiles();
    setFound(null);
    setP(emptyProfile());
    setStep(0);
  }

  return (
    <div id="profile-builder" className="scroll-mt-24">
      <nav aria-label="Profile steps" className="mb-8 print:hidden">
        <ol className="flex gap-2 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <li key={s} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={step === i ? "step" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  step === i ? "border-brand-600 bg-brand-600 text-white" : i === steps.length - 1 ? "border-gold-400 bg-gold-400/20 text-ink" : "border-line bg-white text-ink hover:border-brand-500"
                }`}
              >
                {i + 1}. {s === "Loan request" && isIfb(p) ? "Financing request" : s}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="print:hidden">
        {at === "Identity check" && (
          <Panel
            title="Confirm who is applying"
            intro="The bank-ready pack is only for the business itself or someone it has authorized. Give the business's TIN and licence and your own details; Erudite Africa Connect checks them against the Ministry of Trade register and sends you a verification code. You can fill in the rest of the profile meanwhile."
          >
            <IdentityStep
              isBusiness={isBusiness}
              profileTin={p.tin}
              onApply={(v) => set({ name: v.name, tin: v.tin, licence: v.licence || p.licence, email: p.email || v.email, phone: p.phone || v.phone })}
            />
          </Panel>
        )}

        {at === "Company profile" && (
          <Panel
            title="Start with your company profile"
            intro="Upload your company profile, or any document that describes the business or borrower. We read it in your browser and suggest answers for you to check, so you type less. Use a clear, readable copy."
          >
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 px-6 py-10 text-center hover:border-brand-500">
              <span className="text-lg font-semibold text-brand-900">{reading ? "Reading your document..." : "Choose a file"}</span>
              <span className="text-sm text-muted">Word (.docx), PDF or text files can be read. Scans, photos and older .doc files are attached but not read. Up to 10 MB.</span>
              <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => void readProfile(e.target.files).then(() => (e.target.value = ""))} />
            </label>
            {fileError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {fileError}
              </p>
            )}
            {(p.files[PROFILE_DOC] ?? []).length > 0 && (
              <FileList files={p.files[PROFILE_DOC]} onOpen={openFile} onRemove={(id) => void detach(PROFILE_DOC, id)} />
            )}
            {found && (
              <div className="mt-6 rounded-xl border border-line bg-white p-5" role="status">
                {found.length === 0 ? (
                  <p className="text-ink">
                    We could not read details from this file, so it is attached to your document checklist instead. A Word or text version of your profile can be read, or you can type the details in the next steps.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold text-ink">Found in your document</h3>
                      <button type="button" onClick={() => found.forEach(apply)} className={smallButton}>
                        Use all
                      </button>
                    </div>
                    <ul className="mt-3 divide-y divide-line">
                      {found.map((f) => (
                        <li key={f.field} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                          <span>
                            <span className="text-muted">{f.label}:</span> <span className="font-semibold text-ink">{f.value}</span>
                          </span>
                          <button type="button" onClick={() => apply(f)} className="font-semibold text-brand-700 hover:underline">
                            Use
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted">Check each answer. You can change anything in the next steps.</p>
                  </>
                )}
              </div>
            )}
            <div className="mt-6 rounded-xl bg-canvas p-5 text-sm text-ink">
              <p className="font-semibold">Helpful documents to have at hand</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                <li>Company profile or business plan</li>
                <li>Trade licence, commercial registration and TIN certificate</li>
                <li>Memorandum and articles of association (companies)</li>
                <li>Financial statements for the last three years</li>
                <li>Bank statements and details of existing loans</li>
                <li>Title deeds, ownership booklets or other collateral papers</li>
              </ul>
              <p className="mt-3 text-muted">No document yet? Choose Next and type your details in.</p>
            </div>
          </Panel>
        )}

        {at === "Applicant" && (
          <Panel title="Applicant" intro="Who is borrowing. Lenders first confirm the applicant is a legitimate person or company and that the signatory may borrow.">
            <Grid>
              <Choice label="Borrower type" value={p.borrowerType} onChange={(v) => set({ borrowerType: v })} options={borrowerTypes} wide />
              <Text label={isBusiness ? "Business name" : "Full name"} value={p.name} onChange={(v) => set({ name: v })} wide />
              <Text label="Tax Identification Number (TIN)" value={p.tin} onChange={(v) => set({ tin: v })} />
              <Choice label="Sector" value={p.sector} onChange={(v) => set({ sector: v })} options={sectors.map((s) => ({ value: s, label: s }))} />
              {isBusiness && (
                <>
                  <Text label="Trade licence number" value={p.licence} onChange={(v) => set({ licence: v })} />
                  <Text label="Licence last renewed" type="date" value={p.licenceRenewed} onChange={(v) => set({ licenceRenewed: v })} />
                  <Text label="Year the business started" value={p.started} onChange={(v) => set({ started: v })} hint="Most lenders want at least one year of operation." />
                  <Check label="The owner or manager has experience in a related business" checked={p.relatedExperience} onChange={(v) => set({ relatedExperience: v })} />
                </>
              )}
              <Text label="Address" value={p.address} onChange={(v) => set({ address: v })} wide />
              <Text label="Phone" type="tel" value={p.phone} onChange={(v) => set({ phone: v })} />
              <Text label="Email" type="email" value={p.email} onChange={(v) => set({ email: v })} />
              {(p.borrowerType === "individual" || p.borrowerType === "sole") && (
                <Choice
                  label="Marital status"
                  value={p.maritalStatus}
                  onChange={(v) => set({ maritalStatus: v })}
                  options={["", "Single", "Married", "Divorced", "Widowed"].map((s) => ({ value: s, label: s || "Select" }))}
                />
              )}
              <Check label="Someone will apply on my behalf with a power of attorney" checked={p.viaAgent} onChange={(v) => set({ viaAgent: v })} />
            </Grid>
          </Panel>
        )}

        {at === "Owners and management" && (
          <Panel title="Owners and management" intro="Lenders look at who owns and runs the business, their experience, and every related business and its loans.">
            <div className="space-y-8">
              {isBusiness && (
                <Rows
                  title="Owners or shareholders"
                  rows={p.owners}
                  onChange={(owners) => set({ owners })}
                  blank={{ name: "", share: "", role: "" }}
                  addLabel="Add owner"
                  render={(o, s) => (
                    <Grid>
                      <Text label="Name" value={o.name} onChange={(v) => s({ name: v })} />
                      <Text label="Share (%)" value={o.share} onChange={(v) => s({ share: v })} />
                      <Text label="Role" value={o.role} onChange={(v) => s({ role: v })} wide />
                    </Grid>
                  )}
                />
              )}
              <Rows
                title={isBusiness ? "Management team" : "You"}
                rows={p.managers}
                onChange={(managers) => set({ managers })}
                blank={{ name: "", position: "", education: "", years: "" }}
                addLabel="Add manager"
                render={(m, s) => (
                  <Grid>
                    <Text label="Name" value={m.name} onChange={(v) => s({ name: v })} />
                    <Text label={isBusiness ? "Position" : "Occupation"} value={m.position} onChange={(v) => s({ position: v })} />
                    <Choice label="Education" value={m.education} onChange={(v) => s({ education: v })} options={["", ...educationLevels].map((e) => ({ value: e, label: e || "Select" }))} />
                    <Text label="Years of relevant experience" value={m.years} onChange={(v) => s({ years: v })} />
                  </Grid>
                )}
              />
              <Rows
                title="Related businesses or people with loans"
                rows={p.related}
                onChange={(related) => set({ related })}
                blank={{ name: "", relation: "", loans: "" }}
                addLabel="Add related party"
                render={(r, s) => (
                  <Grid>
                    <Text label="Name" value={r.name} onChange={(v) => s({ name: v })} />
                    <Text label="Relationship" value={r.relation} onChange={(v) => s({ relation: v })} hint="Sister company, spouse, common shareholder" />
                    <Text label="Their loans and status" value={r.loans} onChange={(v) => s({ loans: v })} wide />
                  </Grid>
                )}
              />
            </div>
          </Panel>
        )}

        {at === "Loan request" && (
          <Panel
            title={`${a.words.Loan} request`}
            intro={`What you need, why, and how you will repay. The expected ${a.words.rate} is only for estimating installments; ask your lender for its rate.`}
          >
            <Grid>
              <Choice
                label="Type of financing"
                value={p.financing}
                onChange={(v) => set({ financing: v })}
                options={[
                  { value: "conventional", label: "Conventional loan" },
                  { value: "ifb", label: "Interest-free financing (IFB)" },
                ]}
                wide
              />
              {isIfb(p) ? (
                <>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Interest-free product
                    <select value={p.ifbProduct} onChange={(e) => { const prod = productById(e.target.value)!; set({ ifbProduct: prod.id, ifbMode: prod.modes.includes(p.ifbMode) ? p.ifbMode : prod.modes[0] }); }} className={inputClass}>
                      {(["Trade", "Export", "Guarantee", "Term", "Qard al-Hassan"] as const).map((g) => (
                        <optgroup key={g} label={g === "Qard al-Hassan" ? g : `${g} financing`}>
                          {ifbProducts.filter((x) => x.group === g).map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  {productById(p.ifbProduct)!.modes.length > 1 && (
                    <Choice label="Contract (mode of financing)" value={a.mode!.id} onChange={(v) => set({ ifbMode: v })} options={productById(p.ifbProduct)!.modes.map((m) => ({ value: m, label: modeById(m)!.name }))} wide />
                  )}
                </>
              ) : (
                <Choice label="Loan type" value={p.loanType} onChange={(v) => set({ loanType: v })} options={loanTypes.map((l) => ({ value: l.id, label: l.name }))} wide />
              )}
              {!isIfb(p) && p.loanType === "project" && (
                <Choice
                  label="Project stage"
                  value={p.projectStage}
                  onChange={(v) => set({ projectStage: v })}
                  options={[
                    { value: "new", label: "A new project" },
                    { value: "expansion", label: "Expanding an existing project" },
                  ]}
                  wide
                />
              )}
              <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900 sm:col-span-2">
                <p>
                  <strong>{a.loan.purpose}.</strong> Typical term: {a.loan.typicalTerm.toLowerCase()}.
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {a.loan.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {a.mode && (
                  <p className="mt-3">
                    <strong>{a.mode.name}:</strong> {a.mode.how}
                  </p>
                )}
              </div>
              <Money label="Amount requested" value={p.amount} onChange={(v) => set({ amount: v })} />
              <Money label="Total cost of what you are financing" value={p.totalCost} onChange={(v) => set({ totalCost: v })} hint={`${a.words.Loan} plus your own contribution, for projects, buildings, vehicles and machinery.`} />
              <Text label="Purpose" value={p.purpose} onChange={(v) => set({ purpose: v })} wide />
              <Text label="Term (months)" value={p.termMonths} onChange={(v) => set({ termMonths: v })} />
              <Text label="Grace period requested (months)" value={p.graceMonths} onChange={(v) => set({ graceMonths: v })} hint="Up to 3 months short term, 6 to 12 medium term, up to 24 long term." />
              <Choice label="Repayment frequency" value={p.frequency} onChange={(v) => set({ frequency: v })} options={frequencies.map((f) => ({ value: f.value, label: f.label }))} />
              {a.mode?.pricing === "none" ? null : (
                <Text
                  label={`Expected ${a.words.rate} (% a year)`}
                  value={p.rate}
                  onChange={(v) => set({ rate: v })}
                  hint={a.mode?.pricing === "sale" ? "Profit = cost x rate x months / 12, fixed in the sale price." : a.mode?.pricing === "rent" ? "Sets the rent on the lender's share." : a.mode?.pricing === "fee" ? "Service charges apply instead; leave as is." : undefined}
                />
              )}
              <Text label="Source of repayment" value={p.repaymentSource} onChange={(v) => set({ repaymentSource: v })} hint="For example: sales of the business, rental income, salary, export proceeds." wide />
            </Grid>
            {has(a.installment) && (
              <p className="mt-6 rounded-xl border border-line bg-canvas p-4 text-ink">
                {has(a.salePrice) && (
                  <>
                    Cost {birr(a.amount)} plus profit {birr(a.profit)} gives a fixed sale price of <strong>{birr(a.salePrice)}</strong>.{" "}
                  </>
                )}
                Estimated {a.mode?.pricing === "rent" ? "rent" : "installment"}: <strong>{birr(a.installment)}</strong> {frequencies.find((f) => f.value === p.frequency)!.label.toLowerCase()}, {a.n} installments after any grace period.
              </p>
            )}
            {isIfb(p) && (
              <fieldset className="mt-8 space-y-4">
                <legend className="font-semibold text-ink">Sharia&apos;h screening</legend>
                <p className="text-sm text-muted">
                  Lenders check that the business and the transaction are permissible. A business whose main activity involves {prohibitedActivities.map(midSentence).join(", ")} is not eligible. For other businesses, non-Halal income such as interest on deposits should be no more than 5% of total income, and a business that mainly borrows from conventional banks is referred for a special decision.
                </p>
                <Grid>
                  <Choice
                    label="Your main business activity"
                    value={p.activity}
                    onChange={(v) => set({ activity: v })}
                    options={[
                      { value: "", label: "Select" },
                      { value: "Permissible", label: "None of the activities above" },
                      { value: "Prohibited", label: "Involves one of the activities above" },
                    ]}
                    wide
                  />
                  {isBusiness && (
                    <Choice
                      label="Is most of your existing financing from conventional banks?"
                      value={p.mainlyConventional}
                      onChange={(v) => set({ mainlyConventional: v })}
                      options={[
                        { value: "", label: "Select" },
                        { value: "No", label: "No, or no existing financing" },
                        { value: "Yes", label: "Yes" },
                      ]}
                    />
                  )}
                  {isBusiness && <Money label="Interest and other non-Halal income a year" value={p.nonPermissibleIncome} onChange={(v) => set({ nonPermissibleIncome: v })} hint="For example interest on conventional deposits. Compared with sales." />}
                </Grid>
                {a.screening && (
                  <div className={`rounded-xl p-4 text-sm ${a.screening.decision === "Not eligible" ? "bg-red-50 text-red-900" : a.screening.decision === "Eligible" ? "bg-brand-50 text-brand-900" : "bg-amber-50 text-amber-900"}`}>
                    <p>
                      <strong>{a.screening.decision}.</strong> {a.screening.reasons.join(" ")}
                    </p>
                    {a.screening.conditions.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {a.screening.conditions.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </fieldset>
            )}
          </Panel>
        )}

        {at === "Finances" && (
          <Panel
            title="Finances"
            intro={
              isBusiness
                ? "Three years of figures from your financial statements, and your latest balance sheet. Lenders compare years and ask about big changes."
                : "Your yearly income and what you own and owe. Use the profit column for your net income after living costs."
            }
          >
            {isBusiness && (
              <div className="mb-6 max-w-sm">
                <Choice
                  label="Your financial statements are"
                  value={p.statements}
                  onChange={(v) => set({ statements: v })}
                  options={[
                    { value: "audited", label: "Audited" },
                    { value: "provisional", label: "Provisional (unaudited)" },
                    { value: "none", label: "We keep no formal books" },
                  ]}
                />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="py-2 pr-3 font-medium">Year</th>
                    <th className="py-2 pr-3 font-medium">{isBusiness ? "Sales" : "Income"} (ETB)</th>
                    <th className="py-2 pr-3 font-medium">{isBusiness ? "Cost of sales" : "Living costs"} (ETB)</th>
                    <th className="py-2 font-medium">Net profit (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {p.years.map((y, i) => {
                    const setYear = (patch: Partial<Year>) => set({ years: p.years.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
                    return (
                      <tr key={i}>
                        <td className="py-1 pr-3">
                          <input aria-label="Year" value={y.year} onChange={(e) => setYear({ year: e.target.value })} className={`${inputClass} mt-0 w-24`} />
                        </td>
                        <td className="py-1 pr-3">
                          <input aria-label={`Sales ${y.year}`} inputMode="decimal" value={y.sales} onChange={(e) => setYear({ sales: e.target.value })} className={`${inputClass} mt-0`} />
                        </td>
                        <td className="py-1 pr-3">
                          <input aria-label={`Cost of sales ${y.year}`} inputMode="decimal" value={y.cost} onChange={(e) => setYear({ cost: e.target.value })} className={`${inputClass} mt-0`} />
                        </td>
                        <td className="py-1">
                          <input aria-label={`Net profit ${y.year}`} inputMode="decimal" value={y.profit} onChange={(e) => setYear({ profit: e.target.value })} className={`${inputClass} mt-0`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <h3 className="mt-8 font-semibold text-ink">Latest balance sheet</h3>
            <div className="mt-3">
              <Grid>
                <Money label="Current assets" value={p.currentAssets} onChange={(v) => set({ currentAssets: v })} hint="Cash, stock, receivables" />
                <Money label="Of which stock (inventory)" value={p.inventory} onChange={(v) => set({ inventory: v })} />
                <Money label="Of which receivables" value={p.receivables} onChange={(v) => set({ receivables: v })} />
                <Money label="Current liabilities" value={p.currentLiabilities} onChange={(v) => set({ currentLiabilities: v })} hint="Debts due within a year" />
                <Money label="Total assets" value={p.totalAssets} onChange={(v) => set({ totalAssets: v })} />
                <Money label="Total liabilities" value={p.totalLiabilities} onChange={(v) => set({ totalLiabilities: v })} />
                <Money label="Owners' equity" value={p.equity} onChange={(v) => set({ equity: v })} hint="Paid-up capital plus retained earnings" />
              </Grid>
            </div>
            {isBusiness && (
              <div className="mt-8">
                <Grid>
                  <label className={labelClass}>
                    Main customers
                    <textarea rows={3} value={p.customers} onChange={(e) => set({ customers: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Main suppliers
                    <textarea rows={3} value={p.suppliers} onChange={(e) => set({ suppliers: e.target.value })} className={inputClass} />
                  </label>
                </Grid>
              </div>
            )}
          </Panel>
        )}

        {at === "Banking record" && (
          <Panel title="Banking record" intro="Lenders check your record at every bank through the National Bank of Ethiopia's credit reference system. List every loan, overdraft and guarantee you have now.">
            <Grid>
              <Text label="Main bank" value={p.mainBank} onChange={(v) => set({ mainBank: v })} />
              <Text label="Customer since (year)" value={p.bankSince} onChange={(v) => set({ bankSince: v })} />
              <Choice
                label="Your credit record"
                value={p.creditRecord}
                onChange={(v) => set({ creditRecord: v })}
                options={[
                  { value: "clean", label: "Clean: all loans paid on time" },
                  { value: "issues", label: "There have been problems" },
                  { value: "unsure", label: "I'm not sure" },
                ]}
              />
              <Check label="A cheque of ours bounced in the last year" checked={p.bouncedCheques} onChange={(v) => set({ bouncedCheques: v })} />
            </Grid>
            <div className="mt-8">
              <Rows<Facility>
                title="Existing loans and facilities"
                rows={p.facilities}
                onChange={(facilities) => set({ facilities })}
                blank={{ lender: "", type: "", limit: "", outstanding: "", installment: "", status: "performing" }}
                addLabel="Add a loan or facility"
                render={(f, s) => (
                  <Grid>
                    <Text label="Lender" value={f.lender} onChange={(v) => s({ lender: v })} />
                    <Text label="Type" value={f.type} onChange={(v) => s({ type: v })} hint="Term loan, overdraft, guarantee" />
                    <Money label="Approved amount or limit" value={f.limit} onChange={(v) => s({ limit: v })} />
                    <Money label="Outstanding balance" value={f.outstanding} onChange={(v) => s({ outstanding: v })} />
                    <Money label="Monthly repayment" value={f.installment} onChange={(v) => s({ installment: v })} />
                    <Choice
                      label="Status"
                      value={f.status}
                      onChange={(v) => s({ status: v })}
                      options={[
                        { value: "performing", label: "Paid on time" },
                        { value: "late", label: "Some late payments" },
                        { value: "nonperforming", label: "Non-performing (over 90 days late)" },
                      ]}
                    />
                  </Grid>
                )}
              />
            </div>
          </Panel>
        )}

        {at === "Collateral" && (
          <Panel title="Collateral" intro="What you can pledge. Lenders count only part of each item's value, and property must be in your own or your company's name, not a trade name.">
            <Rows<Collateral>
              title="Collateral offered"
              rows={p.collateral}
              onChange={(collateral) => set({ collateral })}
              blank={{ type: "building", description: "", owner: "applicant", value: "", year: "", insured: false }}
              addLabel="Add collateral"
              render={(c, s) => {
                const type = collateralTypes.find((t) => t.id === c.type)!;
                return (
                  <Grid>
                    <Choice label="Type" value={c.type} onChange={(v) => s({ type: v })} options={collateralTypes.map((t) => ({ value: t.id, label: t.name }))} wide />
                    <Text label="Description and location" value={c.description} onChange={(v) => s({ description: v })} wide />
                    <Money label="Estimated value" value={c.value} onChange={(v) => s({ value: v })} hint={type.counted ? `Lenders typically count about ${type.counted}%.` : type.unsecured ? "Treated as an unsecured loan." : "The lender's valuer sets the value it counts."} />
                    <Choice
                      label="Owned by"
                      value={c.owner}
                      onChange={(v) => s({ owner: v })}
                      options={[
                        { value: "applicant", label: "The applicant" },
                        { value: "third", label: "Someone else (third party)" },
                      ]}
                    />
                    {type.hasAge && <Text label="Year of manufacture" value={c.year} onChange={(v) => s({ year: v })} />}
                    <Check label="Insured, with the policy endorsable to the lender" checked={c.insured} onChange={(v) => s({ insured: v })} />
                  </Grid>
                );
              }}
            />
          </Panel>
        )}
        {at === "Application letter" && (
          <Panel title="Application letter" intro="Your bank-ready pack opens with a formal loan application letter. Tell us who it goes to and who signs it; we draft the letter from your answers, and you can edit every word.">
            <LetterStep p={p} a={a} set={set} />
          </Panel>
        )}

        {at === "Documents" && (
          <Panel title="Documents" intro="Attach a clear, readable copy of each document as you gather it: PDF, Word or a sharp photo, up to 10 MB each. Attached documents count as ready on your checklist.">
            {fileError && (
              <p role="alert" className="mb-4 text-sm text-red-700">
                {fileError}
              </p>
            )}
            <div className="space-y-8">
              {docs.map((g) => (
                <div key={g.title}>
                  <h3 className="font-semibold text-ink">{g.title}</h3>
                  <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                    {g.items.map((d) => {
                      const files = p.files[d] ?? [];
                      return (
                        <li key={d} className="p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <label className="flex flex-1 items-start gap-3 text-sm text-ink">
                              <input
                                type="checkbox"
                                checked={!!p.done[d] || files.length > 0}
                                disabled={files.length > 0}
                                onChange={() => set({ done: { ...p.done, [d]: !p.done[d] } })}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
                              />
                              <span>{d}</span>
                            </label>
                            <label className={`${smallButton} cursor-pointer`}>
                              Attach
                              <input type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => void attach(d, e.target.files).then(() => (e.target.value = ""))} />
                            </label>
                          </div>
                          {files.length > 0 && <FileList files={files} onOpen={openFile} onRemove={(id) => void detach(d, id)} />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {at === "Your profile" && (
        <>
          <div className="print:hidden">
            <PackDownload p={p} verified={verified} onVerify={() => go(0)} />
            <div className="mt-8">
              <Result p={p} a={a} docs={docs} onToggle={(k) => set({ done: { ...p.done, [k]: !p.done[k] } })} />
            </div>
          </div>
          <BankPack p={p} a={a} docs={docs} identity={verified ? identity : undefined} />
        </>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
        {step > 0 && (
          <button type="button" onClick={() => go(step - 1)} className="rounded-lg border border-line px-5 py-2.5 font-semibold text-ink hover:border-brand-500">
            Back
          </button>
        )}
        {step < steps.length - 1 && (
          <button type="button" onClick={() => go(step + 1)} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            {step === steps.length - 2 ? "See my profile" : "Next"}
          </button>
        )}
        <button type="button" onClick={reset} className="ml-auto text-sm font-semibold text-muted hover:text-red-700">
          Start over
        </button>
      </div>
      <p className="mt-4 text-xs text-muted print:hidden">Your answers stay on this device. Only the identity check details are sent to Erudite Africa Connect; nothing is sent to any lender.</p>
    </div>
  );
}

function FileList({ files, onOpen, onRemove }: { files: Attached[]; onOpen: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <ul className="mt-3 space-y-1 text-sm">
      {files.map((f) => (
        <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button type="button" onClick={() => onOpen(f.id)} className="max-w-full truncate font-semibold text-brand-700 hover:underline">
            {f.name}
          </button>
          <span className="text-muted">{kb(f.size)}</span>
          <button type="button" onClick={() => onRemove(f.id)} className="text-red-700 hover:underline">
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-8">
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-muted">{intro}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

const flagStyle = {
  fix: { box: "border-red-200 bg-red-50 text-red-900", mark: "Fix" },
  check: { box: "border-gold-400 bg-gold-400/10 text-ink", mark: "Check" },
  good: { box: "border-brand-200 bg-brand-50 text-brand-900", mark: "Ready" },
} as const;

function Result({ p, a, docs, onToggle }: { p: Profile; a: ReturnType<typeof analyse>; docs: ReturnType<typeof documents>; onToggle: (key: string) => void }) {
  const fixes = a.flags.filter((f) => f.level === "fix").length;
  const checks = a.flags.filter((f) => f.level === "check").length;
  const total = docs.reduce((s, g) => s + g.items.length, 0);
  const ready = (d: string) => !!p.done[d] || (p.files[d] ?? []).length > 0;
  const ticked = docs.reduce((s, g) => s + g.items.filter(ready).length, 0);
  const attachedCount = Object.values(p.files).reduce((s, f) => s + f.length, 0);
  const isBusiness = p.borrowerType !== "individual";
  const row = (label: string, value: ReactNode) =>
    value ? (
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 border-b border-line py-2 text-sm last:border-0">
        <dt className="text-muted">{label}</dt>
        <dd className="text-ink">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-white p-5 sm:p-8 print:border-0 print:p-0">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Borrower profile</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">{p.name || "Unnamed applicant"}</h2>
        <p className="mt-1 text-sm text-muted">
          Prepared with Erudite Africa Connect on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Figures are as stated by the applicant.
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 print:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink">Applicant</h3>
            <dl className="mt-2">
              {row("Borrower type", borrowerTypes.find((b) => b.value === p.borrowerType)!.label)}
              {row("TIN", p.tin)}
              {row("Sector", p.sector)}
              {isBusiness && row("Trade licence", [p.licence, p.licenceRenewed && `renewed ${p.licenceRenewed}`].filter(Boolean).join(", "))}
              {isBusiness && row("In business since", p.started)}
              {row("Address", p.address)}
              {row("Contact", [p.phone, p.email].filter(Boolean).join(" · "))}
              {row("Marital status", p.maritalStatus)}
              {row("Main bank", [p.mainBank, p.bankSince && `since ${p.bankSince}`].filter(Boolean).join(", "))}
            </dl>
          </div>
          <div>
            <h3 className="font-semibold text-ink">{a.words.Loan} request</h3>
            <dl className="mt-2">
              {row(isIfb(p) ? "Product" : "Loan type", a.loan.name)}
              {a.mode && row("Contract", a.mode.name)}
              {a.screening && row("Sharia'h screening", a.screening.decision)}
              {row("Amount", has(a.amount) ? birr(a.amount) : "")}
              {row("Purpose", p.purpose)}
              {row("Term", p.termMonths && `${p.termMonths} months${p.graceMonths ? `, including ${p.graceMonths} months' grace` : ""}`)}
              {row("Repayment", frequencies.find((f) => f.value === p.frequency)!.label)}
              {has(a.salePrice) && row("Sale price", `${birr(a.salePrice)} (cost ${birr(a.amount)} plus profit ${birr(a.profit)})`)}
              {row("Estimated installment", has(a.installment) ? (a.mode?.pricing === "none" ? birr(a.installment) : `${birr(a.installment)} at ${p.rate}% a year`) : "")}
              {row("Own contribution", has(a.ownShare) ? `${pct(a.ownShare)} of ${birr(num(p.totalCost))}` : "")}
              {row("Source of repayment", p.repaymentSource)}
              {row(`Total ${a.words.borrowing} after this ${a.words.loan}`, a.exposure ? birr(a.exposure) : "")}
            </dl>
          </div>
        </div>

        {(p.owners.some((o) => o.name) || p.managers.some((m) => m.name)) && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2 print:grid-cols-2">
            {isBusiness && p.owners.some((o) => o.name) && (
              <div>
                <h3 className="font-semibold text-ink">Owners</h3>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {p.owners.filter((o) => o.name).map((o, i) => (
                    <li key={i}>
                      {o.name}
                      {o.share && `, ${o.share}%`}
                      {o.role && ` (${o.role})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.managers.some((m) => m.name) && (
              <div>
                <h3 className="font-semibold text-ink">{isBusiness ? "Management" : "Applicant background"}</h3>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {p.managers.filter((m) => m.name).map((m, i) => (
                    <li key={i}>
                      {m.name}
                      {m.position && `, ${m.position}`}
                      {m.education && `; ${m.education}`}
                      {m.years && `; ${m.years} years' experience`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {p.years.some((y) => y.sales || y.profit) && (
          <div className="mt-8">
            <h3 className="font-semibold text-ink">Financial summary {isBusiness && `(${p.statements === "audited" ? "audited" : p.statements === "provisional" ? "provisional" : "no formal books"})`}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="py-2 pr-3 font-medium">Year</th>
                    <th className="py-2 pr-3 text-right font-medium">{isBusiness ? "Sales" : "Income"}</th>
                    <th className="py-2 pr-3 text-right font-medium">{isBusiness ? "Cost of sales" : "Living costs"}</th>
                    <th className="py-2 text-right font-medium">Net profit</th>
                  </tr>
                </thead>
                <tbody>
                  {p.years
                    .filter((y) => y.sales || y.profit)
                    .map((y, i) => (
                      <tr key={i} className="border-b border-line">
                        <td className="py-2 pr-3">{y.year}</td>
                        <td className="py-2 pr-3 text-right">{has(num(y.sales)) ? birr(num(y.sales)) : ""}</td>
                        <td className="py-2 pr-3 text-right">{has(num(y.cost)) ? birr(num(y.cost)) : ""}</td>
                        <td className="py-2 text-right">{has(num(y.profit)) ? birr(num(y.profit)) : ""}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {a.ratios.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-ink">Key ratios</h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
              {a.ratios.map((r) => (
                <div key={r.label} className="rounded-xl border border-line p-4">
                  <dt className="text-sm text-muted">{r.label}</dt>
                  <dd className="mt-1 text-xl font-bold text-ink">{r.value}</dd>
                  <dd className="mt-1 text-xs text-muted">{r.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {(p.facilities.length > 0 || p.collateral.length > 0) && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2 print:grid-cols-2">
            {p.facilities.length > 0 && (
              <div>
                <h3 className="font-semibold text-ink">Existing loans</h3>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {p.facilities.map((f, i) => (
                    <li key={i}>
                      {[f.type || "Loan", f.lender].filter(Boolean).join(", ")}: {has(num(f.outstanding)) ? `${birr(num(f.outstanding))} outstanding` : "balance not given"}
                      {f.status !== "performing" && <strong className="text-red-700"> ({f.status === "late" ? "late payments" : "non-performing"})</strong>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.collateral.length > 0 && (
              <div>
                <h3 className="font-semibold text-ink">Collateral offered</h3>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {p.collateral.map((c, i) => {
                    const type = collateralTypes.find((t) => t.id === c.type)!;
                    return (
                      <li key={i}>
                        {type.name}
                        {c.description && `: ${c.description}`}
                        {has(num(c.value)) && `, about ${birr(num(c.value))}`}
                        {c.owner === "third" && " (third party)"}
                      </li>
                    );
                  })}
                </ul>
                {a.estimated > 0 && (
                  <p className="mt-2 text-sm text-muted">
                    Estimated value {birr(a.estimated)}; about {birr(a.counted)} after typical lender discounts where published. The lender&apos;s own valuation decides.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-8 print:break-before-page print:border-0 print:p-0">
        <h2 className="text-xl font-bold text-ink">Readiness check</h2>
        <p className="mt-2 text-muted">
          {fixes > 0
            ? `${fixes} ${fixes === 1 ? "item needs" : "items need"} fixing before you apply, and ${checks} to check.`
            : checks > 0
              ? `Nothing blocks your application. ${checks} ${checks === 1 ? "point is" : "points are"} worth checking first.`
              : "Your profile looks ready for a lender."}
        </p>
        <ul className="mt-4 space-y-2">
          {a.flags.map((f, i) => (
            <li key={i} className={`flex gap-3 rounded-lg border p-3 text-sm ${flagStyle[f.level].box}`}>
              <span className="w-12 shrink-0 font-bold">{flagStyle[f.level].mark}</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-8 print:break-before-page print:border-0 print:p-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">Your document checklist</h2>
            <p className="mt-2 text-muted">Tick each document as you gather it. Hand them in together: incomplete files are the main cause of delay.</p>
          </div>
          <p className="font-semibold text-brand-700">
            {ticked} of {total} ready{attachedCount > 0 && `, ${attachedCount} ${attachedCount === 1 ? "file" : "files"} attached`}
          </p>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2 print:grid-cols-2">
          {docs.map((g) => (
            <div key={g.title}>
              <h3 className="font-semibold text-ink">{g.title}</h3>
              <ul className="mt-2 space-y-2">
                {g.items.map((d) => (
                  <li key={d}>
                    <label className="flex items-start gap-3 text-sm text-ink">
                      <input type="checkbox" checked={ready(d)} disabled={(p.files[d] ?? []).length > 0} onChange={() => onToggle(d)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
                      <span className={ready(d) ? "text-muted line-through" : ""}>
                        {d}
                        {(p.files[d] ?? []).length > 0 && <span className="ml-1 text-xs font-semibold text-brand-700 no-underline">(attached)</span>}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          Typical requirements of Ethiopian banks under National Bank of Ethiopia directives. Each lender sets its own list, so confirm with yours.{" "}
          <Link href="/credit-center#for-businesses" className="text-brand-700 underline print:hidden">
            More on the Credit Management Center
          </Link>
        </p>
      </section>
    </div>
  );
}
