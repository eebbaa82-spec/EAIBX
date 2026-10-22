"use client";

import type { ReactNode } from "react";
import { amount, birr, discounted, periodLabel, riskKeys, type CaseAnalysis, type CreditCase } from "@/lib/credit/case";
import type { AnalysisContext, Cited } from "@/lib/credit/context";
import { selection, type Picked } from "@/lib/credit/select";
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
              <td key={j} className={`border border-slate-400 px-1.5 py-0.5 align-top ${right.includes(j) ? "text-right tabular-nums" : ""}`}>
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
function CitedList({ items }: { items: Picked }) {
  if (!items.length) return null;
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-5">
      {items.map(({ id, item }) => (
        <li key={id} className="text-justify">
          <Cite item={item} />
        </li>
      ))}
    </ul>
  );
}
function Cite({ item }: { item: Cited }) {
  return (
    <>
      {item.label && <span className="font-semibold">{item.label}: </span>}
      {item.text}
      {item.period && ` (${item.period})`}
      {item.cite && <span className="text-[8.5pt] text-slate-600"> [{item.cite}]</span>}
    </>
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

export function CreditReport({ k, a, ctx, drafts }: { k: CreditCase; a: CaseAnalysis; ctx: AnalysisContext; drafts: Record<string, string> }) {
  const sel = selection(k, ctx);
  const L = a.latest;
  const shown = a.cols.filter((c) => c.filled);
  const sectorName = sel.sector?.name ?? (k.sector === "trade" ? "Trade and commerce" : k.sector === "other" ? "Other" : "");
  const address = [k.city, k.woreda, k.kebele, sel.regionName].filter(Boolean).join(", ");
  const text = (n: string) => (k.notes[n]?.trim() ? k.notes[n] : drafts[n] ?? "");
  const anyRegionItem = sel.regionIndicators.length + sel.regionEconomy.length + sel.regionParks.length + sel.regionOpportunities.length + sel.regionConsiderations.length > 0;
  const sources = [sel.sector && `${sel.sector.name} sector report (as of ${sel.sector.asOf})`, ctx.economy && `Economy overview (as of ${ctx.economy.asOf})`, sel.region && `Regional facts (as of ${sel.region.asOf})`].filter(Boolean);

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

      <H3>Operating environment</H3>
      <P>The following context is taken from Ethiopian government bodies and international institutions, as cited. It was selected for this borrower&apos;s sector and region.</P>
      {sel.economy.length > 0 && (
        <>
          <p className="mt-2 font-semibold">National economy</p>
          <CitedList items={sel.economy} />
        </>
      )}
      {sel.sector && (
        <>
          <p className="mt-2 font-semibold">Sector: {sel.sector.name}</p>
          <P>{sel.sector.summary}</P>
          <CitedList items={sel.sectorIndicators} />
          {sel.sectorOpportunities.length > 0 && <p className="mt-1.5 italic">Opportunities</p>}
          <CitedList items={sel.sectorOpportunities} />
          {sel.sectorIncentives.length > 0 && <p className="mt-1.5 italic">Incentives</p>}
          <CitedList items={sel.sectorIncentives} />
          {sel.sectorPoints.length > 0 && <p className="mt-1.5 italic">Points to consider</p>}
          <CitedList items={sel.sectorPoints} />
        </>
      )}
      {sel.region && anyRegionItem && (
        <>
          <p className="mt-2 font-semibold">
            Region: {sel.region.name}
            {sel.region.capital && ` (capital ${sel.region.capital})`}
          </p>
          <P>{sel.region.summary}</P>
          <CitedList items={sel.regionIndicators} />
          <CitedList items={sel.regionEconomy} />
          {sel.regionParks.length > 0 && <p className="mt-1.5 italic">Industrial parks and zones</p>}
          <CitedList items={sel.regionParks} />
          {sel.regionOpportunities.length > 0 && <p className="mt-1.5 italic">Investment opportunities</p>}
          <CitedList items={sel.regionOpportunities} />
          {sel.regionConsiderations.length > 0 && <p className="mt-1.5 italic">Points to consider</p>}
          <CitedList items={sel.regionConsiderations} />
        </>
      )}
      {sel.regulations.length > 0 && (
        <>
          <p className="mt-2 font-semibold">Laws and directives that apply</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {sel.regulations.map((r) => (
              <li key={r.id} className="text-justify">
                <span className="font-semibold">
                  {r.number}, {r.title}
                </span>{" "}
                ({r.issuer}, {r.status}). {r.relevance}
              </li>
            ))}
          </ul>
        </>
      )}
      {k.contextUpdate.trim() && (
        <div className="mt-2 break-inside-avoid border-l-4 border-slate-500 bg-slate-50 px-3 py-1.5">
          <p className="text-[9pt] font-semibold uppercase tracking-wide">Information added by the analyst</p>
          <p className="whitespace-pre-line text-justify">{k.contextUpdate.trim()}</p>
        </div>
      )}

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
      <P>
        {[
          k.crsRef || k.crsDate ? `Credit reference report ${k.crsRef || ""}${k.crsDate ? ` dated ${longDate(k.crsDate)}` : ""}.` : "",
          Number.isFinite(a.crsAgeDays) && a.crsAgeDays > 60 ? "The report is more than two months old and should be updated." : "",
          k.otherBanks,
        ]
          .filter(Boolean)
          .join(" ") || "Not stated."}
      </P>
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
          <P>{text(n) || "No comment."}</P>
        </div>
      ))}
      <H3>8.8 Risk assessment</H3>
      <Table head={["Risk", "Level", "Comment"]} rows={riskKeys.filter((r) => k.risks[r.key].level || k.risks[r.key].note).map((r) => [r.label, k.risks[r.key].level || "-", k.risks[r.key].note])} />
      {k.gradeJustification.trim() && (
        <>
          <p className="mt-2 font-semibold">Grade justification (current grade {k.gradeNow})</p>
          <P>{k.gradeJustification}</P>
        </>
      )}
      <Note text={[k.additions.statements, k.additions.outcomes, k.additions.analysis].filter((x) => x?.trim()).join("\n\n")} />

      <H n="9">Summary (SWOT)</H>
      <table className="mt-2 w-full break-inside-avoid border-collapse text-[9.5pt]">
        <tbody>
          <tr>
            <td className="w-1/2 border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Strengths</p>
              <p className="whitespace-pre-line">{k.swot.s || "-"}</p>
            </td>
            <td className="w-1/2 border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Weaknesses</p>
              <p className="whitespace-pre-line">{k.swot.w || "-"}</p>
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Opportunities</p>
              <p className="whitespace-pre-line">{k.swot.o || "-"}</p>
            </td>
            <td className="border border-slate-400 px-2 py-1 align-top">
              <p className="font-bold">Threats</p>
              <p className="whitespace-pre-line">{k.swot.t || "-"}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="break-inside-avoid">
      <H n="10">Officer&apos;s recommendation</H>
      <Table
        head={["Type of loan", "Amount (ETB)", "Rate", "Tenure (months)", "Repayment", "Collateral"]}
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

      <footer className="mt-8 border-t border-slate-400 pt-2 text-[8.5pt] text-slate-700">
        <p className="text-justify">
          Prepared with the Investopia credit analysis workspace from information supplied by the borrower and the analyst. Context data comes from Ethiopian government bodies and
          international institutions, cited by publisher and date{sources.length ? `: ${sources.join("; ")}` : ""}. The figures and judgments in this report are the analyst&apos;s
          responsibility; the credit decision rests with the lending institution under its own policies and National Bank of Ethiopia directives.
        </p>
      </footer>
    </article>
  );
}
