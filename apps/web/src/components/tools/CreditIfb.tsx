"use client";

import { ifbCollateralCover, ifbEligibility, ifbProducts, modeById, productById, prohibitedActivities, screeningLimits, termModeNote, type IfbProductId } from "@/data/credit/ifb";
import { amount, facilityTypes, type CaseAnalysis, type CreditCase } from "@/lib/credit/case";
import { ifbProduct, ifbScreening, type IfbInput } from "@/lib/credit/ifbcase";
import { fmt } from "@/lib/credit/spread";
import { Area, Block, Check, Grid, Pick, Text, labelClass, inputClass } from "./creditFields";

/**
 * Interest-free (IFB) financing in the credit analysis: the product and contract
 * with the asset behind it, and the Sharia'h screening of the business.
 */

const pctOr = (n: number) => (Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "-");

export function IfbRequest({ k, set }: { k: CreditCase; set: (p: Partial<CreditCase>) => void }) {
  const f = k.ifb;
  const { product, mode } = ifbProduct(f);
  const put = (patch: Partial<IfbInput>) => set({ ifb: { ...f, ...patch } });
  // Rows still on a conventional type, or on the previous product, follow the product chosen.
  const retype = (from: string[], to: string) => ({
    requests: k.requests.map((r) => (from.includes(r.type) ? { ...r, type: to } : r)),
    recommendations: k.recommendations.map((r) => (from.includes(r.type) ? { ...r, type: to } : r)),
  });
  // Conventional facilities move to the interest-free product that serves the same need.
  const counterpart: Record<string, string> = {
    Overdraft: productById("murabaha-revolving")!.name,
    "Revolving loan": productById("murabaha-revolving")!.name,
    "Merchandise loan": productById("murabaha-merchandise")!.name,
    "Pre-shipment export loan": productById("preshipment-trader")!.name,
    "Letter of credit facility": productById("lc-import")!.name,
    "Letter of guarantee": productById("guarantee")!.name,
    "Lease financing": productById("machinery")!.name,
  };
  const convert = (type: string) => (facilityTypes.includes(type) && type !== "Other" ? (counterpart[type] ?? product.name) : type);
  const toggle = (on: boolean) => {
    const names = ifbProducts.map((p) => p.name);
    const back = (type: string) => (names.includes(type) ? "Term loan" : type);
    const map = on ? convert : back;
    set({
      ifb: { ...f, on },
      requests: k.requests.map((r) => ({ ...r, type: map(r.type) })),
      recommendations: k.recommendations.map((r) => ({ ...r, type: map(r.type) })),
    });
  };
  const months = Math.max(
    0,
    ...k.requests.filter((r) => r.type === product.name).map((r) => amount(r.tenor)),
    ...k.recommendations.filter((r) => r.type === product.name).map((r) => amount(r.tenure)),
  ) || 0;
  const note = termModeNote(product, mode.id, months);
  const pick = (id: string) => {
    const next = productById(id)!;
    set({ ifb: { ...f, product: next.id as IfbProductId, mode: next.modes.includes(mode.id) ? mode.id : next.modes[0] }, ...retype([product.name], next.name) });
  };

  return (
    <Block title="Interest-free financing" intro="For a request under interest-free banking (IFB), choose the main product and the contract it is built on. Term loan rows take this product; overdraft, merchandise, export, letter of credit and guarantee rows move to their interest-free counterparts.">
      <Check label="This request is for interest-free (IFB) financing under Sharia'h principles" checked={f.on} onChange={toggle} />
      {f.on && (
        <div className="space-y-4">
          <Grid>
            <label className={`${labelClass} sm:col-span-2`}>
              Product
              <select value={product.id} onChange={(e) => pick(e.target.value)} className={inputClass}>
                {(["Trade", "Export", "Guarantee", "Term", "Qard al-Hassan"] as const).map((g) => (
                  <optgroup key={g} label={g === "Qard al-Hassan" ? g : `${g} financing`}>
                    {ifbProducts
                      .filter((x) => x.group === g)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {product.modes.length > 1 && (
              <Pick label="Contract (mode of financing)" value={mode.id} onChange={(v) => put({ mode: v as IfbInput["mode"] })} options={product.modes.map((m) => ({ value: m, label: modeById(m)!.name }))} wide />
            )}
          </Grid>
          <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
            <p>
              <strong>{product.purpose}.</strong> Typical term: {product.typicalTerm.charAt(0).toLowerCase() + product.typicalTerm.slice(1)}
              {product.minOwnShare ? `, with an own contribution of at least ${product.minOwnShare}%` : ""}. {mode.name}: {mode.how}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {[...mode.conditions, ...product.tips].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          {note && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{note}</p>}
          {(mode.pricing === "sale" || mode.pricing === "rent") && (
            <Grid>
              <Text label="Asset to be bought, made or leased" value={f.asset} onChange={(v) => put({ asset: v })} hint="Type, quantity and specification, as on the proforma invoice or contract." wide />
              <Text label="Supplier, manufacturer or contractor" value={f.supplier} onChange={(v) => put({ supplier: v })} />
              <Pick label="How the bank takes possession before the sale or lease" value={f.possession} onChange={(v) => put({ possession: v as IfbInput["possession"] })} options={["", "Physical", "Constructive (title documents)"]} />
              <Check label="The customer buys the asset as the bank's agent (Wakalah)" checked={f.agent} onChange={(v) => put({ agent: v })} />
            </Grid>
          )}
          <Check label="The product is approved by the institution's Sharia'h Advisory Committee" checked={f.sacApproved} onChange={(v) => put({ sacApproved: v })} />
          <Check label="The customer has an interest-free deposit account with us" checked={f.account} onChange={(v) => put({ account: v })} />
          <div className="text-sm text-muted">
            <p>General eligibility for interest-free financing:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {ifbEligibility.map((t) => (
                <li key={t}>{t}</li>
              ))}
              <li>
                Collateral, unless the financing is unsecured, of at least{" "}
                {Object.entries(ifbCollateralCover)
                  .map(([g, c]) => `${c}% for grade ${g}${g === "5" ? " and above" : ""}`)
                  .join(", ")}
                ; 65% for cash and cash substitutes
              </li>
            </ul>
          </div>
        </div>
      )}
    </Block>
  );
}

export function IfbScreeningBlock({ k, a, set }: { k: CreditCase; a: CaseAnalysis; set: (p: Partial<CreditCase>) => void }) {
  const f = k.ifb;
  if (!f.on) return null;
  const put = (patch: Partial<IfbInput>) => set({ ifb: { ...f, ...patch } });
  const L = a.latest;
  const s = ifbScreening(f, L);
  return (
    <Block
      title="Sharia'h screening"
      intro={`The business activity is screened first, then income: non-Halal income up to ${screeningLimits.nonPermissibleIncome * 100}% of total income is accepted, and more only exceptionally with the Sharia'h Advisory Committee's approval. Applicants who mainly finance from conventional banks are taken only on the direction of the head of interest-free banking.`}
    >
      <Grid>
        <Pick
          label="Main business activity"
          value={f.activity}
          onChange={(v) => put({ activity: v as IfbInput["activity"] })}
          options={[
            { value: "", label: "Select" },
            { value: "Permissible", label: "Permissible" },
            { value: "Prohibited", label: `Prohibited (${prohibitedActivities.join(", ").toLowerCase()})` },
          ]}
          hint="Look at what the business actually earns from, not only its licence: ask for an income breakdown and record what you saw on the visit."
        />
        <Area label="Basis of the activity screening" value={f.activityNote} onChange={(v) => put({ activityNote: v })} rows={2} />
        <Pick
          label="Is most of the existing financing from conventional banks?"
          value={f.mainlyConventional}
          onChange={(v) => put({ mainlyConventional: v as IfbInput["mainlyConventional"] })}
          options={["", "No", "Yes"]}
          hint={L && L.bankDebt > 0 ? `Bank debt in the latest statements: ${fmt(L.bankDebt, "amount")}. Check the credit reference report for which lenders hold it.` : "Check the credit reference report for which lenders hold the existing financing."}
        />
        <Text
          label={`Interest and other non-Halal income (${k.unit})`}
          type="number"
          value={f.nonPermissibleIncome}
          onChange={(v) => put({ nonPermissibleIncome: v })}
          placeholder={L ? String(Math.round(L.interestIncome)) : ""}
          hint="Blank uses interest income from the statements, for the same period as sales."
        />
      </Grid>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-2 py-2">Test</th>
              <th className="px-2 py-2 text-right">Figure ({k.unit})</th>
              <th className="px-2 py-2 text-right">Ratio</th>
              <th className="px-2 py-2 text-right">Limit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line">
              <td className="px-2 py-1.5">Non-Halal income to total income</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{Number.isFinite(s.income) ? fmt(s.income, "amount") : "-"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{pctOr(s.incomeRatio)}</td>
              <td className="px-2 py-1.5 text-right">{screeningLimits.nonPermissibleIncome * 100}% or less</td>
            </tr>
            <tr className="border-t border-line">
              <td className="px-2 py-1.5">Existing financing mainly from conventional banks</td>
              <td className="px-2 py-1.5 text-right">{f.mainlyConventional || "-"}</td>
              <td className="px-2 py-1.5" />
              <td className="px-2 py-1.5 text-right">No, or referred</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={`rounded-xl p-4 text-sm ${s.decision === "Not eligible" ? "bg-red-50 text-red-900" : s.decision === "Eligible" ? "bg-brand-50 text-brand-900" : "bg-amber-50 text-amber-900"}`}>
        <p>
          <strong>{s.decision}.</strong> {s.reasons.join(" ")}
        </p>
        {s.conditions.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {s.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </div>
    </Block>
  );
}
