import { ifbProducts, modeById, productById, screen, type IfbMode, type IfbModeId, type IfbProduct, type IfbProductId } from "@/data/credit/ifb";
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
  /** Interest-bearing debt and non-permissible income, in the statements' unit; blank uses the spread. */
  interestDebt: string;
  nonPermissibleIncome: string;
  asset: string;
  supplier: string;
  possession: "" | "Physical" | "Constructive (title documents)" | "Not applicable";
  agent: boolean;
  sacApproved: boolean;
};

export const emptyIfb = (): IfbInput => ({
  on: false,
  product: "murabaha-merchandise",
  mode: "",
  activity: "",
  activityNote: "",
  interestDebt: "",
  nonPermissibleIncome: "",
  asset: "",
  supplier: "",
  possession: "",
  agent: false,
  sacApproved: false,
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

/** The screening ratios, from the analyst's figures or else the latest spread. */
export function ifbScreening(f: IfbInput, L: Column | undefined) {
  const debt = Number.isFinite(num(f.interestDebt)) ? num(f.interestDebt) : L ? L.bankDebt : NaN;
  const income = Number.isFinite(num(f.nonPermissibleIncome)) ? num(f.nonPermissibleIncome) : L ? L.interestIncome : NaN;
  const debtRatio = L && L.totalAssets > 0 && Number.isFinite(debt) ? debt / L.totalAssets : NaN;
  const incomeRatio = L && L.sales > 0 && Number.isFinite(income) ? income / L.sales : NaN;
  return { debt, income, debtRatio, incomeRatio, ...screen(f.activity, debtRatio, incomeRatio) };
}

/** The Sharia'h points the analyst documents for an IFB financing. */
export function ifbChecklist(f: IfbInput, L: Column | undefined, priced: boolean) {
  const { mode } = ifbProduct(f);
  const s = ifbScreening(f, L);
  const needsAsset = mode.pricing === "sale" || mode.pricing === "rent";
  const points = [
    { point: "Product approved by the Sharia'h Advisory Committee", done: f.sacApproved },
    { point: "Business activity and financial ratios screened as permissible", done: s.decision === "Eligible" || s.decision === "Eligible with conditions" },
  ];
  if (needsAsset) {
    points.push({ point: "Asset identified, existing, permissible and clearly specified", done: !!f.asset.trim() });
    points.push({ point: "The bank owns and possesses the asset before it sells or leases it", done: !!f.possession && f.possession !== "Not applicable" });
  }
  if (mode.pricing === "sale") points.push({ point: "Cost, profit and sale price disclosed and fixed in the contract", done: priced });
  return points;
}
