import { ifbProducts, modeById, productById, screen, termModeNote, type IfbMode, type IfbModeId, type IfbProduct, type IfbProductId } from "@/data/credit/ifb";
import type { Column } from "./spread";

/**
 * Interest-free (IFB) financing in a credit analysis case: the product and
 * contract, the asset behind it, and the Sharia'h screening of the business.
 */

export type IfbInput = {
  on: boolean;
  product: IfbProductId;
  mode: IfbModeId | "";
  activity: "" | "Permissible" | "Prohibited";
  activityNote: string;
  /** Whether most of the business's existing financing is from conventional banks. */
  mainlyConventional: "" | "Yes" | "No";
  /** Non-Halal income, in the statements' unit; blank uses interest income from the spread. */
  nonPermissibleIncome: string;
  asset: string;
  supplier: string;
  possession: "" | "Physical" | "Constructive (title documents)" | "Not applicable";
  agent: boolean;
  sacApproved: boolean;
  /** The customer holds an interest-free deposit account with the lender. */
  account: boolean;
};

export const emptyIfb = (): IfbInput => ({
  on: false,
  product: "murabaha-merchandise",
  mode: "",
  activity: "",
  activityNote: "",
  mainlyConventional: "",
  nonPermissibleIncome: "",
  asset: "",
  supplier: "",
  possession: "",
  agent: false,
  sacApproved: false,
  account: false,
});

export const ifbFacilityTypes = [...ifbProducts.map((p) => p.name), "Other"];

/** The IFB product whose name the facility row carries, if any. */
export const productByName = (name: string): IfbProduct | undefined => ifbProducts.find((p) => p.name === name);

export function ifbProduct(f: IfbInput) {
  const product = productById(f.product) ?? ifbProducts[0];
  const mode = modeById(f.mode && product.modes.includes(f.mode) ? f.mode : product.modes[0]) as IfbMode;
  return { product, mode };
}

const num = (v: string) => {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return String(v).trim() !== "" && Number.isFinite(n) ? n : NaN;
};

/** The screening, with non-Halal income from the analyst's figure or else the latest spread. */
export function ifbScreening(f: IfbInput, L: Column | undefined) {
  const income = Number.isFinite(num(f.nonPermissibleIncome)) ? num(f.nonPermissibleIncome) : L ? L.interestIncome : NaN;
  const incomeRatio = L && L.sales > 0 && Number.isFinite(income) ? income / L.sales : NaN;
  return { income, incomeRatio, ...screen(f.activity, incomeRatio, f.mainlyConventional) };
}

/** The Sharia'h points the analyst documents for an IFB financing. */
export function ifbChecklist(f: IfbInput, L: Column | undefined, priced: boolean, months = NaN) {
  const { product, mode } = ifbProduct(f);
  const s = ifbScreening(f, L);
  const needsAsset = mode.pricing === "sale" || mode.pricing === "rent";
  const points = [
    { point: "Product approved by the Sharia'h Advisory Committee", done: f.sacApproved },
    { point: "Business activity and non-Halal income screened as permissible", done: s.decision === "Eligible" || s.decision === "Eligible with conditions" },
    { point: "Interest-free deposit account opened with the lender", done: f.account },
  ];
  if (needsAsset) {
    points.push({ point: "Asset identified, existing, permissible and clearly specified", done: !!f.asset.trim() });
    points.push({ point: "The bank owns and possesses the asset before it sells or leases it", done: !!f.possession && f.possession !== "Not applicable" });
  }
  if (mode.pricing === "sale") points.push({ point: "Cost, profit and sale price disclosed and fixed in the contract", done: priced });
  if (product.group === "Term" && mode.id === "murabaha") points.push({ point: "Murabaha term of three years or less, or a longer term directed by the head of IFB", done: !termModeNote(product, mode.id, months) });
  return points;
}
