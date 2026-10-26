"use client";

import type { ReactNode } from "react";
import { amount, autoSwot, birr, discounted, otherBanks, originationChecklist, overallVerdict, periodLabel, questions, riskAreas, scorecard, stressTests, suggestedRisks, type CaseAnalysis, type CreditCase } from "@/lib/credit/case";
import { titleCase } from "./CreditCrb";
import { lineLabel, projectionLines } from "./CreditProjection";
import { saleProfit, screeningLimits, termModeNote } from "@/data/credit/ifb";
import { ifbProduct, ifbScreening, productByName } from "@/lib/credit/ifbcase";
import { projection } from "@/lib/credit/projection";
import { appraise } from "@/lib/credit/project";
import type { AnalysisContext } from "@/lib/credit/context";
import { contextSwot, outlookFacts, selection } from "@/lib/credit/select";
import { balanceSheet, fmt, profitLoss, ratioRows, type Column } from "@/lib/credit/spread";

/**
 * The printable credit analysis report, in the order of the "Annex to Loan
 * Application Form": summary, request, purpose, facilities, collateral,
 * background, banking relationship, financial analysis, SWOT, recommendation.
 * The full financial analysis form and the analyst's documents follow as annexes.
 */

const longDate = (iso?: string) => {
  const d = iso ? new Date(iso + "T00:00:00Z") : new Date();
  return Number.isNaN(d.getTime()) ? iso ?? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: iso ? "UTC" : undefined });
};
const pctOr = (n: number) => (Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "-");
const timesOr = (n: number) => (Number.isFinite(n) ? `${n.toFixed(2)}x` : "-");
const etb = (v: string) => (Number.isFinite(amount(v)) ? birr(amount(v)) : v || "-");

function H({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <h2 className="mt-6 break-after-avoid border-b border-slate-400 pb-1 text-[12.5pt] font-bold">
      {n && <span className="mr-2">{n}.</span>}
      {children}
    </h2>
  );
}
function Points({ items }: { items: string[] }) {
  if (!items.length) return <p>-</p>;
  return (
    <ul className="list-disc space-y-0.5 pl-4">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-3 break-after-avoid text-[11pt] font-bold">{children}</h3>;
}
function P({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 whitespace-pre-line text-justify">{children}</p>;
}
function Table({ head, rows, right = [] }: { head: ReactNode[]; rows: ReactNode[][]; right?: number[] }) {
  if (!rows.length) return <p className="mt-1 italic">None reported.</p>;
  return (
    <div className="overflow-x-auto print:overflow-visible">
    <table className="mt-2 w-full break-inside-avoid border-collapse text-[9.5pt]">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} className={`border border-slate-400 bg-slate-100 px-1.5 py-1 ${right.includes(i) ? "text-right" : "text-left"}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className={`border border-slate-400 px-1.5 py-0.5 align-top ${right.includes(j) ? "text-right tabular-nums" : ""} ${typeof c === "string" && /^\d{4}-\d{2}-\d{2}$/.test(c) ? "whitespace-nowrap" : ""}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
function KeyValues({ rows }: { rows: [string, ReactNode][] }) {
  const shown = rows.filter(([, v]) => v !== "" && v != null);
  return (
    <table className="mt-2 w-full border-collapse text-[9.5pt]">
      <tbody>
        {Array.from({ length: Math.ceil(shown.length / 2) }, (_, i) => (
          <tr key={i}>
            {shown.slice(i * 2, i * 2 + 2).map(([k, v]) => (
              <td key={k} className="w-1/2 border border-slate-400 px-1.5 py-0.5 align-top">
                <span className="font-semibold">{k}:</span> {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function Note({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  return (
    <div className="mt-2 break-inside-avoid border-l-4 border-slate-500 bg-slate-50 px-3 py-1.5">
      <p className="text-[9pt] font-semibold uppercase tracking-wide">Analyst&apos;s note</p>
      <p className="whitespace-pre-line text-justify">{text.trim()}</p>
    </div>
  );
}
function SpreadTable({ cols, unit, groups }: { cols: Column[]; unit: string; groups: typeof balanceSheet }) {
  return (
    <div className="overflow-x-auto print:overflow-visible">
    <table className="mt-2 w-full border-collapse text-[8.5pt]">
      <thead>
        <tr>
          <th className="border border-slate-400 bg-slate-100 px-1 py-0.5 text-left">{unit}</th>
          {cols.map((c, i) => (
            <th key={i} className="border border-slate-400 bg-slate-100 px-1 py-0.5 text-right">
              {periodLabel(c)}
            </th>
          ))}
        </tr>
      </thead>
      {groups.map((g) => (
        <tbody key={g.title} className="break-inside-avoid">
          {g.lines.map((l) => (
            <tr key={l.id}>
              <td className="border border-slate-300 px-1 py-px">{l.label}</td>
              {cols.map((c, i) => (
                <td key={i} className="border border-slate-300 px-1 py-px text-right tabular-nums">
                  {fmt(c[l.id], "amount")}
                </td>
              ))}
            </tr>
          ))}
          {g.total?.map((t) => (
            <tr key={t.key} className="font-bold">
              <td className="border border-slate-400 px-1 py-px">{t.label}</td>
              {cols.map((c, i) => (
                <td key={i} className="border border-slate-400 px-1 py-px text-right tabular-nums">
                  {fmt(c[t.key], "amount")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
    </div>
  );
}

const whole = (n: number) => Math.round(n).toLocaleString("en-US");

function OtherBanks({ k, a }: { k: CreditCase; a: CaseAnalysis }) {
  const ob = otherBanks(k);
  const r = k.crb;
  const ref = [k.crsRef || r?.enquiryId ? `enquiry ${k.crsRef || r?.enquiryId}` : "", k.crsDate || r?.reportDate ? `dated ${longDate(k.crsDate || r?.reportDate)}` : ""].filter(Boolean).join(", ");
  const stale = Number.isFinite(a.crsAgeDays) && a.crsAgeDays > 60;
  if (!ob)
    return (
      <P>
        {[ref && `Credit reference report ${ref}.`, stale ? "The report is more than two months old and should be updated." : "", k.otherBanks].filter(Boolean).join(" ") ||
          "No credit reference report was attached."}
      </P>
    );
  const summary =
    ob.active.length === 0
      ? "The borrower has no active facilities at other banks."
      : `The borrower has ${ob.active.length} active facilit${ob.active.length === 1 ? "y" : "ies"} at ${ob.banks} other bank${ob.banks === 1 ? "" : "s"}, with ${birr(ob.outstanding)} outstanding against ${birr(ob.approved)} approved. ${
          ob.inArrears ? `${ob.inArrears} ${ob.inArrears === 1 ? "is" : "are"} in arrears, with ${birr(ob.overdue)} overdue; the worst classification is ${titleCase(ob.worst).toLowerCase()}.` : "All are current and within terms."
        }`;
  return (
    <>
      <P>
        {`Source: National Bank of Ethiopia credit reference report${ref ? `, ${ref}` : ""}. Facilities with our institution are excluded. ${summary}`}
        {ob.settled.length > 0 ? ` A further ${ob.settled.length} facilit${ob.settled.length === 1 ? "y has" : "ies have"} been settled.` : ""}
        {stale ? " The report is more than two months old and should be updated." : ""}
      </P>
      {ob.active.length > 0 && (
        <Table
          head={["Bank", "Facility", "Opened", "Maturity", "Approved", "Outstanding", "Overdue", "Days in arrears", "Classification"]}
          right={[4, 5, 6, 7]}
          rows={[
            ...ob.active.map((x) => [x.institution, x.creditType, x.opened, x.maturity, whole(x.approved), whole(x.balance), whole(x.overdue), x.daysInArrears ? String(x.daysInArrears) : "-", titleCase(x.classification || "-")]),
            [<b key="t">Total</b>, "", "", "", <b key="a">{whole(ob.approved)}</b>, <b key="o">{whole(ob.outstanding)}</b>, <b key="d">{whole(ob.overdue)}</b>, "", ""],
          ]}
        />
      )}
      {ob.byBank.length > 1 && (
        <Table
          head={["Bank", "Active facilities", "Outstanding (ETB)", "Overdue (ETB)", "Worst classification", "Settled facilities"]}
          right={[1, 2, 3, 5]}
          rows={ob.byBank.map((b) => [b.name, String(b.active), whole(b.outstanding), whole(b.overdue), b.worst ? titleCase(b.worst) : "-", String(b.settled)])}
        />
      )}
      {ob.applications.length > 0 && (
        <>
          <p className="mt-2 font-semibold">Credit applications at other banks (24 months before the report)</p>
          <Table head={["Bank", "Date", "Amount (ETB)", "Approved (ETB)", "Status"]} right={[2, 3]} rows={ob.applications.map((x) => [x.institution, x.date, whole(x.amount), x.approved ? whole(x.approved) : "-", x.status])} />
        </>
      )}
      {k.otherBanks.trim() && <P>{k.otherBanks}</P>}
    </>
  );
}

export function CreditReport({ k, a, ctx, drafts }: { k: CreditCase; a: CaseAnalysis; ctx: AnalysisContext; drafts: Record<string, string> }) {
  const sel = selection(k, ctx);
  const L = a.latest;
  const shown = a.cols.filter((c) => c.filled);
  const sectorName = k.sector;
  const address = [k.city, k.woreda, k.kebele, sel.regionName].filter(Boolean).join(", ");
  const text = (n: string) => (k.notes[n]?.trim() ? k.notes[n] : drafts[n] ?? "");
  const suggested = suggestedRisks(k, a);
  const stress = stressTests(k, a);
  const proj = projection(k, a);
  const pj = k.project;
  const ap = pj.has ? appraise(pj) : null;
  const refs = [
    ...new Set(
      [sel.economy, sel.sectorIndicators, sel.sectorOpportunities, sel.sectorIncentives, sel.sectorPoints, sel.regionIndicators, sel.regionEconomy, sel.regionParks, sel.regionOpportunities, sel.regionConsiderations]
        .flat()
        .map((x) => x.item.ref ?? "")
        .filter(Boolean),
    ),
  ].sort();
  const birrOr = (n: number) => (Number.isFinite(n) ? birr(n) : "-");
  const checklist = originationChecklist(k, a);
  const swot = autoSwot(k, a, contextSwot(sel));
  const card = scorecard(k, a);
  const verdict = overallVerdict(card);
  const outlook = [text("8.7"), outlookFacts(k, sel)].filter((x) => x.trim()).join("\n\n");
  const risks = riskAreas(k)
    .map((r) => {
      const own = k.risks[r.key];
      const auto = suggested[r.key];
      if (own.level || !auto) return { label: r.label, level: own.level, note: own.note.trim() || (own.level ? "" : "Not assessed.") };
      return { label: r.label, level: auto.level, note: own.note.trim() || `${auto.why[0].toUpperCase()}${auto.why.slice(1)}.` };
    });
  const extra = (x: string) =>
    x
      .split(/\n+/)
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);
  const all = { s: [...swot.s, ...extra(k.swot.s)], w: [...swot.w, ...extra(k.swot.w)], o: [...swot.o, ...extra(k.swot.o)], t: [...swot.t, ...extra(k.swot.t)] };
  const rated = questions.filter((q) => k.assessment[q.key]?.rating || k.assessment[q.key]?.note.trim());
  const recs = k.recommendations.filter((r) => r.amount || r.collateral);
  const ifb = k.ifb.on ? ifbProduct(k.ifb) : null;
  const screening = k.ifb.on ? ifbScreening(k.ifb, L) : null;
  // Indicative sale prices of the recommended (or else requested) deferred-sale financings.
  const priced = ifb
    ? (recs.length ? recs.map((r) => ({ type: r.type, cost: amount(r.amount), rate: amount(r.rate), months: amount(r.tenure) })) : k.requests.map((r) => ({ type: r.type, cost: amount(r.amount), rate: NaN, months: amount(r.tenor) })))
        .filter((x) => Number.isFinite(x.cost) && x.cost > 0 && Number.isFinite(x.rate) && Number.isFinite(x.months) && (productByName(x.type)?.modes ?? [ifb.mode.id]).some((m) => ["murabaha", "tijarah", "tawarruq", "istisna", "salam"].includes(m)) && !productByName(x.type)?.offBalance)
        .map((x) => ({ ...x, profit: saleProfit(x.cost, x.rate, x.months) }))
    : [];
  const recTotal = recs.reduce((n, r) => n + (Number.isFinite(amount(r.amount)) ? amount(r.amount) : 0), 0);

  return (
    <article className="bank-pack rounded-2xl border border-line bg-white p-6 font-serif text-[10.5pt] leading-snug text-black sm:p-10 print:rounded-none print:border-0 print:p-0">
      <header className="border-b-2 border-black pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[9pt] uppercase tracking-widest">{[k.institution, k.branch && `${k.branch} branch`].filter(Boolean).join(" · ") || "Credit analysis"}</p>
            <h1 className="mt-1 text-[17pt] font-bold leading-tight">Credit Analysis Report</h1>
            <p className="text-[11pt]">Annex to the loan application: {k.borrower || "[Borrower]"}</p>
          </div>
          <div className="text-right text-[9.5pt]">
            <p>{longDate()}</p>
            {k.cif && <p>CIF {k.cif}</p>}
            <p className="mt-1 font-semibold">Confidential</p>
          </div>
        </div>
      </header>

      <H n="1">Summary</H>
      <KeyValues
        rows={[
          ["Borrower", k.borrower],
          ["Branch", k.branch],
          ["Address", address],
          ["Date established", k.established && longDate(k.established)],
          ["Relationship since", k.relationshipSince && longDate(k.relationshipSince)],
          ["Ownership type", k.ownership],
          ["Sector", sectorName],
          ["Type of business", k.activity],
          ["Handling officer", k.officer],
          ["Credit risk grade (previous / current)", k.gradePrev || k.gradeNow ? `${k.gradePrev || "-"} / ${k.gradeNow || "-"}` : ""],
          ["Latest statements", L ? `${L.type || "Type not stated"}, period ended ${periodLabel(L)}` : ""],
          ["Net profit after tax (latest period)", L ? `${fmt(L.netProfit, "amount")} (${k.unit})` : ""],
          ["Paid-up capital", L ? `${fmt(L.capital, "amount")} (${k.unit})` : ""],
          ["Capital employed", L ? `${fmt(L.capitalEmployed, "amount")} (${k.unit})` : ""],
          ["Current ratio", L ? timesOr(L.currentRatio) : ""],
          ["Debt to asset ratio", L ? pctOr(L.tlToTa) : ""],
          ["Stock days", L && Number.isFinite(L.stockDays) ? String(Math.round(L.stockDays)) : ""],
          ["Net profit margin", L ? pctOr(L.npMargin) : ""],
          ["Collateral coverage, existing", pctOr(a.coverExisting)],
          ["Collateral coverage, recommended", pctOr(a.coverRecommended)],
          ["Application received", k.received && longDate(k.received)],
          ["Application complete", k.completed && longDate(k.completed)],
        ]}
      />
      <H3>Exposure (ETB)</H3>
      <Table
        head={["Facility", "With us", "With other banks"]}
        right={[1, 2]}
        rows={[...k.exposure.filter((e) => e.withUs || e.otherBanks).map((e) => [e.facility, etb(e.withUs), etb(e.otherBanks)]), ...(a.existing || a.otherBanks ? [[<b key="t">Total</b>, <b key="u">{birr(a.existing)}</b>, <b key="o">{birr(a.otherBanks)}</b>]] : [])]}
      />
      {k.exceptions.trim() && (
        <>
          <H3>Policy exceptions</H3>
          <P>{k.exceptions}</P>
        </>
      )}
      <Note text={k.additions.borrower} />

      <H n="2">Customer&apos;s request</H>
      <Table head={["Type", "Amount (ETB)", "Tenor (months)", "Repayment"]} right={[1, 2]} rows={k.requests.filter((r) => r.amount || r.repayment).map((r) => [r.type, etb(r.amount), r.tenor || "-", r.repayment || "-"])} />

      {ifb && (
        <>
          <H3>Interest-free financing structure</H3>
          <KeyValues
            rows={[
              ["Product", ifb.product.name],
              ["Contract (mode of financing)", ifb.mode.name],
              ["How it works", ifb.mode.how],
              ["Asset", k.ifb.asset],
              ["Supplier, manufacturer or contractor", k.ifb.supplier],
              ["Bank's possession before the sale or lease", k.ifb.possession],
              ["Customer as the bank's agent (Wakalah)", ifb.mode.pricing === "sale" || ifb.mode.pricing === "rent" ? (k.ifb.agent ? "Yes" : "No") : ""],
              ["Approved by the Sharia'h Advisory Committee", k.ifb.sacApproved ? "Yes" : "Not confirmed"],
            ]}
          />
          {priced.length > 0 && (
            <Table
              head={["Financing", "Cost (ETB)", "Profit rate", "Term (months)", "Profit (ETB)", "Sale price (ETB)"]}
              right={[1, 2, 3, 4, 5]}
              rows={priced.map((x) => [x.type, birr(x.cost), `${x.rate}%`, String(x.months), birr(x.profit), birr(x.cost + x.profit)])}
            />
          )}
          <P>{`Conditions of the contract: ${ifb.mode.conditions.join(" ")}`}</P>
          {(() => {
            const months = Math.max(0, ...priced.filter((x) => x.type === ifb.product.name).map((x) => x.months));
            const note = termModeNote(ifb.product, ifb.mode.id, months);
            return note ? <P>{`Mode of financing: ${note}`}</P> : null;
          })()}
          <p className="mt-2 font-semibold">Contract documents to be signed after approval</p>
          <Points items={ifb.mode.docs} />
        </>
      )}

      <H n="3">Purpose</H>
      <P>{k.purpose || "Not stated."}</P>

      <H n="4">Present facilities</H>
      <Table head={["Facility", "Limit (ETB)", "Outstanding (ETB)", "Expiry", "Status"]} right={[1, 2]} rows={k.facilities.map((f) => [f.type, etb(f.limit), etb(f.outstanding), f.expiry ? longDate(f.expiry) : "-", f.status])} />

      <H n="5">Collateral</H>
      <H3>Buildings</H3>
      <Table
        head={["Location and title deed", "Owner", "Estimated by", "On", "Estimated value", "Discounted value"]}
        right={[4, 5]}
        rows={k.buildings.map((b) => [b.description, b.owner, b.valuedBy, b.valuedOn ? longDate(b.valuedOn) : "-", etb(b.value), birr(discounted(b.value, b.discountPct))])}
      />
      {k.otherCollateral.length > 0 && (
        <>
          <H3>Other collateral</H3>
          <Table
            head={["Type and brand", "Origin", "Year", "Insured", "Invoice", "Duty", "Net value", "Discounted"]}
            right={[4, 5, 6, 7]}
            rows={k.otherCollateral.map((o) => [o.type, o.origin, o.year, o.insured, etb(o.invoice), etb(o.duty), etb(o.net), birr(discounted(o.net || o.invoice, o.discountPct))])}
          />
        </>
      )}
      <H3>Coverage</H3>
      <Table
        head={["Discounted collateral", "To existing exposure", "To existing and requested", "To existing and recommended"]}
        right={[0, 1, 2, 3]}
        rows={[[birr(a.collateral), pctOr(a.coverExisting), pctOr(a.coverRequested), pctOr(a.coverRecommended)]]}
      />
      {k.engineerRemarks.trim() && (
        <>
          <H3>Engineer&apos;s remarks</H3>
          <P>{k.engineerRemarks}</P>
        </>
      )}
      <Note text={k.additions.facilities} />

      <H n="6">General background</H>
      <H3>Nature of business</H3>
      <P>{k.background || "Not stated."}</P>
      <H3>Ownership</H3>
      <Table head={["Shareholder", "Share", "Role"]} right={[1]} rows={k.shareholders.filter((s) => s.name).map((s) => [s.name, s.share ? `${s.share}%` : "-", s.role])} />
      {k.related.length > 0 && (
        <>
          <H3>Related companies</H3>
          <Table head={["Company", "Relationship", "Exposure with us (ETB)"]} right={[2]} rows={k.related.map((r) => [r.name, r.relation, etb(r.exposure)])} />
        </>
      )}
      <H3>Management</H3>
      <Table head={["Name", "Position", "Education", "Experience (years)"]} right={[3]} rows={k.management.filter((m) => m.name).map((m) => [m.name, m.position, m.education, m.experience])} />
      <H3>Customers and suppliers</H3>
      <P>
        {[k.customers && `Customers: ${k.customers}`, k.suppliers && `Suppliers: ${k.suppliers}`, L && Number.isFinite(L.debtorDays) && `Debtor days ${Math.round(L.debtorDays)}, creditor days ${Number.isFinite(L.creditorDays) ? Math.round(L.creditorDays) : "-"} (latest period).`]
          .filter(Boolean)
          .join("\n") || "Not stated."}
      </P>
      {k.projects.length > 0 && (
        <>
          <H3>Projects</H3>
          <Table head={["Project", "Client", "Contract value (ETB)", "Completed", "Status"]} right={[2, 3]} rows={k.projects.map((p) => [p.name, p.client, etb(p.value), p.completion ? `${p.completion}%` : "-", p.status])} />
        </>
      )}
      {k.machineryRental.trim() && (
        <>
          <H3>Machinery rental</H3>
          <P>{k.machineryRental}</P>
        </>
      )}
      {k.exports.length > 0 && (
        <>
          <H3>Export performance</H3>
          {(["Other markets", "China"] as const).map((m) =>
            k.exports.some((e) => e.market === m) ? (
              <div key={m}>
                <p className="mt-2 font-semibold">{m}</p>
                <Table head={["Year", "Commodity", "Volume", "Value (USD)"]} right={[2, 3]} rows={k.exports.filter((e) => e.market === m).map((e) => [e.year, e.commodity, e.volume, etb(e.valueUsd).replace("ETB ", "")])} />
              </div>
            ) : null,
          )}
        </>
      )}
      {(k.visitFindings.trim() || k.visitDate) && (
        <>
          <H3>Business visit</H3>
          <P>{[k.visitDate && `Visited on ${longDate(k.visitDate)}${k.visitBy ? ` by ${k.visitBy}` : ""}.`, k.visitFindings].filter(Boolean).join(" ")}</P>
        </>
      )}
      <Note text={k.additions.background} />

      {rated.length > 0 && (
        <>
          <H3>Business assessment</H3>
          <Table head={["Area", "Rating", "Findings"]} rows={rated.map((q) => [q.label, k.assessment[q.key]?.rating || "-", k.assessment[q.key]?.note || "-"])} />
        </>
      )}
      <Note text={k.additions.assessment} />

      <H n="7">Banking relationship</H>
      {k.repaymentHistory.trim() && (
        <>
          <H3>Term loan repayment history</H3>
          <P>{k.repaymentHistory}</P>
        </>
      )}
      <H3>Overdraft utilization (loan proceeds excluded)</H3>
      <Table
        head={["Period", "Limit", "Credit turnover", "Credits", "Highest debit % of limit", "Lowest debit % of limit", "Days in credit"]}
        right={[1, 2, 3, 4, 5, 6]}
        rows={k.od.map((o) => [o.period, etb(o.limit), etb(o.turnover), o.frequency, o.highPct && `${o.highPct}%`, o.lowPct && `${o.lowPct}%`, o.creditDays])}
      />
      <H3>Letters of credit (last five)</H3>
      <Table head={["Reference", "Amount", "Opened", "Settled", "Remark"]} rows={k.lcs.map((l) => [l.ref, l.amount, l.opened ? longDate(l.opened) : "-", l.settled ? longDate(l.settled) : "-", l.remark])} />
      <H3>Relationship with other banks</H3>
      <OtherBanks k={k} a={a} />
      <Note text={k.additions.banking} />

      <H n="8">Financial analysis</H>
      <P>
        {[
          L && `Statements analyzed: ${shown.map((c) => periodLabel(c)).join("; ")}.`,
          k.auditor && `External auditor: ${k.auditor}.`,
          k.auditQualifications,
        ]
          .filter(Boolean)
          .join(" ") || "No financial statements entered."}
      </P>
      {shown.length > 0 && (
        <>
          <H3>Key figures and ratios</H3>
          <Table
            head={["", ...shown.map((c) => periodLabel(c))]}
            right={shown.map((_, i) => i + 1)}
            rows={[
              ...(
                [
                  ["Net sales", "sales"],
                  ["Gross profit", "grossProfit"],
                  ["Net profit after tax", "netProfit"],
                  ["Current assets", "currentAssets"],
                  ["Current liabilities", "currentLiab"],
                  ["Tangible net worth", "tnw"],
                ] as [string, keyof Column][]
              ).map(([l, key]) => [`${l} (${k.unit})`, ...shown.map((c) => fmt(c[key] as number, "amount"))]),
              ...ratioRows.filter((r) => !["tnw", "totalAssets", "wcStock", "wcDebtors", "wcCreditors"].includes(r.key)).map((r) => [r.label, ...shown.map((c) => fmt(c[r.key] as number, r.kind))]),
            ]}
          />
          {!a.balanced && <P>Note: the balance sheet does not balance for at least one period; see the financial analysis form in Annex A.</P>}
        </>
      )}
      {[
        ["8.1", "Fixed assets"],
        ["8.2", "Sales"],
        ["8.3", "Profitability and margins"],
        ["8.4", "Liquidity"],
        ["8.5", "Leverage"],
        ["8.6", "Inventory, debtor and creditor days"],
        ["8.7", "Trading outlook"],
      ].map(([n, title]) => (
        <div key={n}>
          <H3>
            {n} {title}
          </H3>
          <P>{(n === "8.7" ? outlook : text(n)) || "No comment."}</P>
        </div>
      ))}
      <H3>8.8 Risk assessment</H3>
      <P>Each risk area is assessed from the financial statements, the scenario tests below, the credit reference report and the business assessment.</P>
      <Table head={["Risk area", "Level", "Basis"]} rows={risks.map((r) => [r.label, r.level || "-", r.note])} />
      {stress.length > 0 && (
        <>
          <p className="mt-3 font-semibold">Scenario tests on the latest period</p>
          <Table
            head={["Scenario", "Shock", `Profit before tax (${k.unit})`, "Interest or collateral cover", "Result"]}
            right={[2, 3]}
            rows={stress.map((x) => [x.name, x.shock, Number.isFinite(x.pbt) ? fmt(x.pbt, "amount") : "-", Number.isFinite(x.cover) ? (x.collateral ? pctOr(x.cover) : timesOr(x.cover)) : "-", x.result])}
          />
        </>
      )}
      {screening && (
        <>
          <p className="mt-3 font-semibold">Sharia&apos;h screening</p>
          <Table
            head={["Test", `Figure (${k.unit})`, "Ratio", "Limit"]}
            right={[1, 2]}
            rows={[
              ["Main business activity", k.ifb.activity || "Not screened", "", "Permissible"],
              ["Non-Halal income to total income", Number.isFinite(screening.income) ? fmt(screening.income, "amount") : "-", pctOr(screening.incomeRatio), `${screeningLimits.nonPermissibleIncome * 100}% or less`],
              ["Existing financing mainly from conventional banks", k.ifb.mainlyConventional || "Not checked", "", "No, or referred"],
              ["Interest-free deposit account", k.ifb.account ? "Opened" : "Not yet", "", "Required"],
            ]}
          />
          <P>{`${screening.decision}. ${screening.reasons.join(" ")}${k.ifb.activityNote.trim() ? ` ${k.ifb.activityNote.trim().replace(/\.?$/, ".")}` : ""}${screening.conditions.length ? ` Conditions: ${screening.conditions.join(" ")}` : ""}`}</P>
        </>
      )}
      {k.gradeJustification.trim() && (
        <>
          <p className="mt-2 font-semibold">Grade justification (current grade {k.gradeNow})</p>
          <P>{k.gradeJustification}</P>
        </>
      )}
      <Note text={[k.additions.statements, k.additions.outcomes, k.additions.analysis].filter((x) => x?.trim()).join("\n\n")} />

      {proj && (
        <div>
          <H3>8.9 Cash flow projection and repayment capacity</H3>
          <P>
            {`Cash flows are projected for ${proj.years} year${proj.years === 1 ? "" : "s"}, the life of the proposed facilities, from the latest period's annualized figures. Assumptions: sales growth of ${(proj.input.growth * 100).toFixed(1)}% a year, gross margin before depreciation of ${(proj.input.margin * 100).toFixed(1)}%, operating expenses of ${(proj.input.opex * 100).toFixed(1)}% of sales, profit tax at ${(proj.input.tax * 100).toFixed(0)}%, and capital expenditure of ${fmt(proj.input.capex, "amount")} (${k.unit}) a year. Term loans are repaid in equal yearly installments; revolving facilities pay interest only.${k.ifb.on ? " For the interest-free financing, the profit is fixed in the sale price and paid evenly over the term, so higher market rates affect only existing conventional debt." : ""}`}
          </P>
          <Table
            head={["Scenario", "Shock", "Lowest cover", "Average cover", "Years short", "Repayment capacity"]}
            right={[2, 3, 4]}
            rows={proj.scenarios.map((s) => [s.name, s.shock, timesOr(s.minDscr), timesOr(s.avgDscr), String(s.shortYears), s.result])}
          />
          <p className="mt-3 font-semibold">Base case ({k.unit})</p>
          <Table
            head={["", ...proj.scenarios[0].rows.map((r) => `Year ${r.year}`)]}
            right={proj.scenarios[0].rows.map((_, i) => i + 1)}
            rows={projectionLines.map((line) => [lineLabel(line, k.ifb.on), ...proj.scenarios[0].rows.map((r) => (line.ratio ? timesOr(r[line.key] as number) : fmt(r[line.key] as number, "amount")))])}
          />
          <p className="mt-3 font-semibold">Debt service cover and closing cash by scenario</p>
          <Table
            head={["", ...proj.scenarios[0].rows.map((r) => `Year ${r.year}`)]}
            right={proj.scenarios[0].rows.map((_, i) => i + 1)}
            rows={proj.scenarios.flatMap((s) => [
              [`${s.name}: cover`, ...s.rows.map((r) => timesOr(r.dscr))],
              [`${s.name}: closing cash`, ...s.rows.map((r) => fmt(r.cash, "amount"))],
            ])}
          />
        </div>
      )}

      {pj.has && (
        <section>
          <H n="8A">Project appraisal</H>
          <H3>Project overview</H3>
          <P>
            {[
              pj.name && `${pj.name}.`,
              pj.description,
              pj.location && `Location: ${pj.location}.`,
              pj.capacity && `Capacity: ${pj.capacity}.`,
              pj.products && `Products or services: ${pj.products}.`,
              pj.schedule && `Implementation: ${pj.schedule}.`,
              pj.studyName && `Appraised from the feasibility study or business plan provided by the client and the client's projections${pj.projections ? ` (${pj.projections.years[0]} to ${pj.projections.years[pj.projections.years.length - 1]})` : ""}.`,
            ]
              .filter(Boolean)
              .join(" ")
              .replace(/\.\./g, ".") || "Not described."}
          </P>
          <H3>Market and demand</H3>
          <P>
            {[pj.market, sel.sector?.summary, sel.sectorOpportunities.length > 0 && `Opportunities in the sector include ${sel.sectorOpportunities.map((x) => (x.item.label ?? x.item.text).toLowerCase()).join("; ")}.`]
              .filter(Boolean)
              .join("\n\n") || "No market assessment entered."}
          </P>
          <H3>Technical and operational</H3>
          <P>{pj.technical || "No technical assessment entered."}</P>
          <H3>Investment cost and financing</H3>
          <Table
            head={["Item", "Amount (ETB)"]}
            right={[1]}
            rows={[...pj.investment.filter((x) => x.amount.trim()).map((x) => [x.item, etb(x.amount).replace("ETB ", "")]), ...(ap ? [["Total investment", birrOr(ap.totalInvestment).replace("ETB ", "")]] : [])]}
          />
          {ap && (
            <P>
              {`Financed by equity of ${birrOr(ap.equity)} (${pctOr(ap.equityShare)}) and a loan of ${birrOr(ap.loan)}, against a minimum equity of ${pj.minEquity || 25}%. The loan is assumed at ${pj.rate || 16}% over ${pj.tenure || 5} years${Number(pj.grace) > 0 ? ` with ${pj.grace} year${Number(pj.grace) === 1 ? "" : "s"} of grace` : ""}.`}
            </P>
          )}
          {pj.assumptions.trim() && (
            <>
              <H3>Key assumptions</H3>
              <P>{pj.assumptions}</P>
            </>
          )}
          {ap && pj.projections && (
            <>
              <H3>Projected results (ETB)</H3>
              <Table
                head={["", ...ap.years.map((y) => y.year)]}
                right={ap.years.map((_, i) => i + 1)}
                rows={[
                  ["Revenue", ...ap.years.map((y) => fmt(y.revenue, "amount"))],
                  ["Operating cash profit", ...ap.years.map((y) => fmt(y.ebitda, "amount"))],
                  ["Net profit", ...ap.years.map((y) => fmt(y.netProfit, "amount"))],
                  ["Project cash flow", ...ap.years.map((y) => fmt(y.fcf, "amount"))],
                  ["Debt service", ...ap.years.map((y) => fmt(y.interest + y.principal, "amount"))],
                  ["Debt service cover", ...ap.years.map((y) => timesOr(y.dscr))],
                ]}
              />
              <H3>Financial viability</H3>
              <Table
                head={["Measure", "Appraisal", "Stated in the study"]}
                rows={[
                  [`NPV at ${(ap.discount * 100).toFixed(0)}%`, birrOr(ap.base.npv), (() => { const f = pj.facts.find((x) => x.key === "npv"); return f ? birr(Number(f.value)) : "-"; })()],
                  ["IRR", pctOr(ap.base.irr), (() => { const f = pj.facts.find((x) => x.key === "irr"); return f ? `${f.value}%` : "-"; })()],
                  ["Payback period", Number.isFinite(ap.base.payback) ? `${ap.base.payback.toFixed(1)} years` : "Not within the period", (() => { const f = pj.facts.find((x) => x.key === "payback"); return f ? `${f.value} years` : "-"; })()],
                  ["Lowest debt service cover", timesOr(ap.base.minDscr), "-"],
                  ["Average debt service cover", timesOr(ap.base.avgDscr), "-"],
                ]}
              />
              <H3>Sensitivity</H3>
              <Table
                head={["Case", "NPV", "IRR", "Lowest cover"]}
                right={[1, 2, 3]}
                rows={[{ name: "Base case", v: ap.base }, ...ap.sensitivity].map((s) => [s.name, birrOr(s.v.npv), pctOr(s.v.irr), timesOr(s.v.minDscr)])}
              />
            </>
          )}
          <H3>Environmental, social and economic</H3>
          <P>{[pj.employment && `The project creates ${Number(pj.employment).toLocaleString("en-US")} jobs.`, pj.environment].filter(Boolean).join(" ") || "Not assessed."}</P>
          <H3>Appraisal conclusion</H3>
          <P>{ap ? `${ap.verdict}. ${ap.reasons.join(" ")}` : "The client's projections are needed to complete the financial appraisal."}</P>
        </section>
      )}

      <H n="9">Summary (SWOT)</H>
      <table className="mt-2 w-full break-inside-avoid border-collapse text-[9.5pt]">
        <tbody>
          <tr>
            <td className="w-1/2 border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Strengths</p>
              <Points items={all.s} />
            </td>
            <td className="w-1/2 border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Weaknesses</p>
              <Points items={all.w} />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Opportunities</p>
              <Points items={all.o} />
            </td>
            <td className="border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Threats</p>
              <Points items={all.t} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="break-inside-avoid">
      <H n="10">Officer&apos;s recommendation</H>
      <Table
        head={k.ifb.on ? ["Product", "Cost or amount (ETB)", "Profit rate", "Tenure (months)", "Repayment", "Collateral"] : ["Type of loan", "Amount (ETB)", "Rate", "Tenure (months)", "Repayment", "Collateral"]}
        right={[1, 2, 3]}
        rows={k.recommendations.filter((r) => r.amount || r.collateral).map((r) => [r.type, etb(r.amount), r.rate ? `${r.rate}%` : "-", r.tenure || "-", r.repayment, r.collateral])}
      />
      {k.conditions.trim() && (
        <>
          <H3>Conditions and covenants</H3>
          <P>{k.conditions}</P>
        </>
      )}
      <Note text={k.additions.recommendation} />
      </div>

      <section className="break-inside-avoid">
        <H n="11">Decision summary</H>
        <div className="mt-2 border-2 border-black p-3">
          <p className="text-[11pt]">
            Indicative assessment: <span className="font-bold">{verdict}</span>
          </p>
          <Table head={["Test", "Result", "Assessment"]} rows={card.map((c) => [c.criterion, c.result, c.verdict])} />
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
            <div>
              <p className="font-bold">Key strengths</p>
              <Points items={all.s.slice(0, 4)} />
            </div>
            <div>
              <p className="font-bold">Key concerns</p>
              <Points
                items={[
                  ...card.filter((c) => c.verdict === "Concern").map((c) => `${c.criterion}: ${c.result}.`),
                  ...questions.filter((q) => k.assessment[q.key]?.rating === "Weak").map((q) => `${q.label}: ${k.assessment[q.key]?.note.trim() || "rated weak"}.`.replace(/\.\.$/, ".")),
                  ...card.filter((c) => c.verdict === "Watch").map((c) => `${c.criterion}: ${c.result}.`),
                ].slice(0, 5)}
              />
            </div>
          </div>
          <p className="mt-2 font-bold">Points documented for the approving authority</p>
          <Table head={["Point", "Status"]} rows={checklist.map((c) => [c.point, c.done ? "Documented" : "Not documented"])} />
          <P>
            {recs.length
              ? `The officer recommends ${recs.map((r) => `${r.type ? r.type.toLowerCase() : "a facility"} of ${etb(r.amount)}${r.tenure ? ` for ${r.tenure} months` : ""}`).join(", ")}${recs.length > 1 && recTotal ? `, ${birr(recTotal)} in total` : ""}${recs.some((r) => r.collateral) ? `, secured by ${recs.map((r) => r.collateral).filter(Boolean).join("; ")}` : ""}.${k.conditions.trim() ? " Approval is subject to the conditions and covenants in section 10." : ""}`
              : "No facility is recommended yet."}
          </P>
          <p className="mt-1.5 text-[9pt] italic">The assessment follows from the figures, the credit reference report and the analyst&apos;s ratings. The credit decision rests with the approving authority.</p>
        </div>
      </section>

      <div className="break-inside-avoid">
      <div className="mt-10 grid break-inside-avoid grid-cols-2 gap-10">
        <div>
          <p className="border-t border-black pt-1 font-semibold">Recommended by (loan officer)</p>
          <p>{k.officer || "Name"}</p>
          <p className="mt-4">Signature and date</p>
        </div>
        <div>
          <p className="border-t border-black pt-1 font-semibold">Reviewed by (branch manager)</p>
          <p>{k.reviewer || "Name"}</p>
          <p className="mt-4">Signature and date</p>
        </div>
      </div>
      </div>

      {shown.length > 0 && (
        <section className="break-before-page">
          <H>Annex A. Financial analysis form</H>
          <H3>Balance sheet</H3>
          <SpreadTable cols={shown} unit={k.unit} groups={balanceSheet} />
          <H3>Profit and loss account</H3>
          <SpreadTable cols={shown} unit={k.unit} groups={profitLoss} />
          <H3>Analytical ratios</H3>
          <Table head={["Ratio", ...shown.map((c) => periodLabel(c))]} right={shown.map((_, i) => i + 1)} rows={ratioRows.map((r) => [r.label, ...shown.map((c) => fmt(c[r.key] as number, r.kind))])} />
        </section>
      )}

      {k.files.length > 0 && (
        <>
          <H>Annex B. Documents provided by the analyst</H>
          <Table head={["Document", "What it shows"]} rows={k.files.map((f) => [f.name, f.note || "-"])} />
        </>
      )}

      {refs.length > 0 && (
        <>
          <H>References</H>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-[9pt]">
            {refs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </>
      )}

      <footer className="mt-8 border-t border-slate-400 pt-2 text-[8.5pt] text-slate-700">
        <p className="text-justify">
          Prepared with the Erudite Africa Connect credit analysis workspace from information supplied by the borrower and the analyst. The figures and judgments in this report are the analyst&apos;s
          responsibility; the credit decision rests with the lending institution under its own credit policy.
        </p>
      </footer>
    </article>
  );
}
