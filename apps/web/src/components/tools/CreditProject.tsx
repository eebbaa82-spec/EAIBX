"use client";

import { useState } from "react";
import type { AnalystFile, CreditCase } from "@/lib/credit/case";
import { appraise, projLines, studyFacts, type InvestmentItem, type ProjectInput, type StudyFact } from "@/lib/credit/project";
import { putFile } from "@/lib/docs/store";
import { Area, Block, Check, Grid, Pick, TableEditor, Text, smallButton } from "./creditFields";

/**
 * Project appraisal step: the feasibility study or business plan, what to
 * request from the client, the client's projections and the appraisal results.
 */

const n0 = (n: number) => (Number.isFinite(n) ? (n < 0 ? `(${Math.round(-n).toLocaleString("en-US")})` : Math.round(n).toLocaleString("en-US")) : "-");
const pctOr = (n: number) => (Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "-");
const x2 = (n: number) => (Number.isFinite(n) ? `${n.toFixed(2)}x` : "-");
const yrs = (n: number) => (Number.isFinite(n) ? `${n.toFixed(1)} years` : "Not within the period");

/** Which project field a study fact fills. */
const factField: Partial<Record<string, keyof ProjectInput>> = {
  equity: "equity",
  loan: "loan",
  life: "life",
  employment: "employment",
  capacity: "capacity",
  location: "location",
  products: "products",
  schedule: "schedule",
  discount: "discount",
};

export function CreditProject({ k, set, projectionsTemplate }: { k: CreditCase; set: (p: Partial<CreditCase>) => void; projectionsTemplate: string }) {
  const p = k.project;
  const put = (patch: Partial<ProjectInput>) => set({ project: { ...p, ...patch } });
  const [msg, setMsg] = useState("");
  const [projMsg, setProjMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const ap = p.has ? appraise(p) : null;

  const readStudy = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const { documentText } = await import("@/lib/credit/fsread");
      const text = await documentText(file, setMsg);
      const id = `ca-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await putFile(id, file);
      const doc: AnalystFile = { id, name: file.name, size: file.size, note: "Feasibility study or business plan" };
      if (!text.trim()) {
        set({ project: { ...p, studyName: file.name, facts: [] }, files: [...k.files, doc] });
        setMsg("The document is attached, but its text could not be read. Enter the project details below from the study.");
        return;
      }
      const facts = studyFacts(text);
      // Fill empty fields from the study; the analyst checks each one.
      const patch: Partial<ProjectInput> = { studyName: file.name, facts };
      for (const f of facts) {
        const field = factField[f.key];
        if (field && !String(p[field] ?? "").trim()) (patch as Record<string, string>)[field] = f.value;
      }
      const inv = facts.find((f) => f.key === "investment");
      if (inv && !p.investment.some((x) => x.amount.trim())) patch.investment = [{ item: "Total investment cost (from the study)", amount: inv.value }];
      if (!p.name.trim()) patch.name = file.name.replace(/\.[a-z]+$/i, "").replace(/[_-]+/g, " ");
      set({ project: { ...p, ...patch }, files: [...k.files, doc] });
      setMsg(
        facts.length
          ? `Read the study and found ${facts.length} key figure${facts.length === 1 ? "" : "s"}, listed below with the sentence each came from. Empty fields were filled; check them against the study.`
          : "Read the study, but found no investment, financing or return figures in its text. Enter them below.",
      );
    } catch (e) {
      console.error(e);
      setMsg("This document could not be read. Upload the study as a PDF or Word file (.docx).");
    } finally {
      setBusy(false);
    }
  };

  const readProj = async (file?: File) => {
    if (!file) return;
    setProjMsg("");
    try {
      const { readProjections, OldExcelFormat } = await import("@/lib/credit/fsread");
      const r = await readProjections(file).catch((e) => {
        if (e instanceof OldExcelFormat) {
          setProjMsg("This is the older Excel format (.xls). Save it as an Excel Workbook (.xlsx) and upload it again.");
          return undefined;
        }
        throw e;
      });
      if (r === undefined) return;
      if (!r) {
        setProjMsg("No yearly projections were found. The workbook needs a row of year headings (Year 1, Year 2... or 2026, 2027...) and rows such as revenue, operating costs, depreciation and net profit. The template shows the layout.");
        return;
      }
      put({ projections: r });
      const found = projLines.filter((l) => r.lines[l.key]).map((l) => l.label.toLowerCase());
      setProjMsg(`Read ${r.years.length} years (${r.years[0]} to ${r.years[r.years.length - 1]}) with ${found.join(", ")}.`);
    } catch (e) {
      console.error(e);
      setProjMsg("This workbook could not be read. Upload it as .xlsx.");
    }
  };

  const attach = async (files: FileList | null) => {
    if (!files) return;
    const added: AnalystFile[] = [];
    for (const f of Array.from(files)) {
      const id = `ca-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await putFile(id, f);
      added.push({ id, name: f.name, size: f.size, note: "Client's financial assumptions" });
    }
    set({ files: [...k.files, ...added] });
  };

  return (
    <div className="space-y-6">
      <Block title="Project appraisal" intro="For requests that finance a new project, an expansion or a new business with a feasibility study or business plan.">
        <Check checked={p.has} onChange={(v) => put({ has: v })} label="This request finances a project with a feasibility study or business plan" />
      </Block>
      {p.has && (
        <>
          <div className="space-y-3 rounded-2xl border border-gold-400 bg-gold-100 p-5">
            <p className="font-semibold text-ink">1. Upload the feasibility study or business plan</p>
            <p className="text-sm text-muted">PDF or Word. The workspace reads it for the investment cost, financing, capacity, employment and the returns it claims. Files are read in this browser.</p>
            <label className={`${smallButton} relative inline-block cursor-pointer bg-white`}>
              {busy ? "Reading..." : p.studyName ? "Upload another version" : "Upload the study"}
              <input type="file" accept=".pdf,.docx,application/pdf" className="sr-only" disabled={busy} onChange={(e) => readStudy(e.target.files?.[0]).then(() => (e.target.value = ""))} />
            </label>
            {p.studyName && <p className="text-sm text-ink">Study: {p.studyName}</p>}
            {msg && (
              <p role="status" className="text-sm text-ink">
                {msg}
              </p>
            )}
            {p.facts.length > 0 && <Facts facts={p.facts} />}
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold text-ink">2. Request from the client</p>
            <p className="text-sm text-muted">Ask the client for these, for every year of the study period:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
              <li>The financial assumptions: capacity use by year, selling prices, sales volumes, input and labor costs, and the basis of each.</li>
              <li>Projected income statements and cash flows in Excel, a column per year, as in the projections template.</li>
              <li>The investment cost broken down by item, with quotations or pro forma invoices, and the financing plan (equity and loan).</li>
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <a href={projectionsTemplate} download className={`${smallButton} inline-block`}>
                Download the projections template for the client
              </a>
              <label className="relative inline-block cursor-pointer rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Upload the client&apos;s Excel projections
                <input type="file" accept=".xlsx,.xlsm,.xls" className="sr-only" onChange={(e) => readProj(e.target.files?.[0]).then(() => (e.target.value = ""))} />
              </label>
              <label className={`${smallButton} relative inline-block cursor-pointer`}>
                Attach the assumptions
                <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => attach(e.target.files).then(() => (e.target.value = ""))} />
              </label>
            </div>
            {projMsg && (
              <p role="status" className="text-sm text-ink">
                {projMsg}
              </p>
            )}
            <Area label="Key financial assumptions (summary)" value={p.assumptions} onChange={(v) => put({ assumptions: v })} rows={3} hint="For example: 60% capacity in year 1 rising to 85% by year 3; price ETB 45 a unit rising 5% a year." />
          </div>

          <Block title="Project details">
            <Grid>
              <Text label="Project name" value={p.name} onChange={(v) => put({ name: v })} />
              <Text label="Location" value={p.location} onChange={(v) => put({ location: v })} />
              <Text label="Capacity" value={p.capacity} onChange={(v) => put({ capacity: v })} />
              <Text label="Products or services" value={p.products} onChange={(v) => put({ products: v })} />
              <Text label="Employment (jobs)" type="number" value={p.employment} onChange={(v) => put({ employment: v })} />
              <Text label="Implementation period" value={p.schedule} onChange={(v) => put({ schedule: v })} />
              <Area label="Project description" value={p.description} onChange={(v) => put({ description: v })} rows={3} />
            </Grid>
          </Block>

          <Block title="Investment and financing" intro="Amounts in birr.">
            <TableEditor<InvestmentItem>
              rows={p.investment}
              onChange={(investment) => put({ investment })}
              blank={{ item: "", amount: "" }}
              addLabel="Add item"
              cols={[
                { key: "item", label: "Investment item" },
                { key: "amount", label: "Amount (ETB)", type: "number" },
              ]}
            />
            <Grid>
              <Text label="Equity contribution (ETB)" type="number" value={p.equity} onChange={(v) => put({ equity: v })} />
              <Text label="Loan (ETB)" type="number" value={p.loan} onChange={(v) => put({ loan: v })} hint="Leave empty for the investment less equity." />
              <Text label="Loan interest rate (%)" type="number" value={p.rate} onChange={(v) => put({ rate: v })} placeholder="16" />
              <Text label="Loan tenure (years)" type="number" value={p.tenure} onChange={(v) => put({ tenure: v })} placeholder="5" />
              <Text label="Grace period (years)" type="number" value={p.grace} onChange={(v) => put({ grace: v })} placeholder="0" />
              <Text label="Project life (years)" type="number" value={p.life} onChange={(v) => put({ life: v })} />
              <Text label="Discount rate, required return (%)" type="number" value={p.discount} onChange={(v) => put({ discount: v })} placeholder="18" />
              <Text label="Minimum equity required (%)" type="number" value={p.minEquity} onChange={(v) => put({ minEquity: v })} />
              <Pick
                label="Amounts in the client's projections are in"
                value={p.scale}
                onChange={(v) => put({ scale: v })}
                options={[
                  { value: "1", label: "Birr" },
                  { value: "1000", label: "Birr '000" },
                  { value: "1000000", label: "Birr million" },
                ]}
              />
            </Grid>
          </Block>

          {p.projections && (
            <Block title="Client's projections" intro={`From ${p.projections.file}. Check that each line was read from the right row.`}>
              <div className="overflow-x-auto rounded-xl border border-line bg-white">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-2 py-2">Line (row in the workbook)</th>
                      {p.projections.years.map((y) => (
                        <th key={y} className="px-2 py-2 text-right">
                          {y}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projLines
                      .filter((l) => p.projections?.lines[l.key])
                      .map((l) => (
                        <tr key={l.key} className="border-t border-line">
                          <td className="px-2 py-1.5">
                            {l.label}
                            <span className="block text-xs text-muted">{p.projections?.labels[l.key]}</span>
                          </td>
                          {p.projections!.lines[l.key]!.map((v, i) => (
                            <td key={i} className="px-2 py-1.5 text-right tabular-nums">
                              {v === null ? "-" : n0(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => put({ projections: null })}>
                Remove the projections
              </button>
            </Block>
          )}

          <Block title="Appraisal results">
            {!ap ? (
              <p className="text-sm text-muted">Upload the client&apos;s Excel projections to calculate the NPV, IRR, payback and debt service cover.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-xl bg-canvas p-4 text-sm sm:grid-cols-3">
                  <Stat label="Total investment" value={`ETB ${n0(ap.totalInvestment)}`} />
                  <Stat label="Equity share" value={pctOr(ap.equityShare)} />
                  <Stat label={`NPV at ${(ap.discount * 100).toFixed(0)}%`} value={`ETB ${n0(ap.base.npv)}`} />
                  <Stat label="IRR" value={pctOr(ap.base.irr)} />
                  <Stat label="Payback" value={yrs(ap.base.payback)} />
                  <Stat label="Lowest debt service cover" value={x2(ap.base.minDscr)} />
                </div>
                <p className={`font-semibold ${ap.verdict === "Viable" ? "text-brand-700" : ap.verdict === "Viable with conditions" ? "text-amber-700" : "text-red-700"}`}>{ap.verdict}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {ap.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <Sensitivity ap={ap} />
              </div>
            )}
          </Block>

          <Block title="Appraisal notes" intro="Your assessment of each part of the study. The sector and regional facts you picked on the Sector and region step are added to the market section.">
            <Area label="Market and demand" value={p.market} onChange={(v) => put({ market: v })} rows={3} hint="Demand, competitors, prices, offtake agreements, and whether the sales assumptions are realistic." />
            <Area label="Technical and operational" value={p.technical} onChange={(v) => put({ technical: v })} rows={3} hint="Site, technology, machinery suppliers, inputs, utilities, staffing and the implementation plan." />
            <Area label="Environmental and social" value={p.environment} onChange={(v) => put({ environment: v })} rows={3} hint="Environmental clearance, waste, safety, and benefits such as jobs, exports and import substitution." />
          </Block>
        </>
      )}
    </div>
  );
}

function Facts({ facts }: { facts: StudyFact[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-2 py-2">Found in the study</th>
            <th className="px-2 py-2">Value</th>
            <th className="px-2 py-2">From the sentence</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((f) => (
            <tr key={f.key} className="border-t border-line align-top">
              <td className="px-2 py-1.5 font-semibold">{f.label}</td>
              <td className="px-2 py-1.5 tabular-nums">{/^\d+$/.test(f.value) && f.value.length > 4 ? n0(Number(f.value)) : f.value}</td>
              <td className="px-2 py-1.5 text-xs text-muted">{f.snippet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Sensitivity({ ap }: { ap: NonNullable<ReturnType<typeof appraise>> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-2 py-2">Sensitivity</th>
            <th className="px-2 py-2 text-right">NPV (ETB)</th>
            <th className="px-2 py-2 text-right">IRR</th>
            <th className="px-2 py-2 text-right">Lowest cover</th>
          </tr>
        </thead>
        <tbody>
          {[{ name: "Base case", v: ap.base }, ...ap.sensitivity].map((s) => (
            <tr key={s.name} className="border-t border-line">
              <td className="px-2 py-1.5">{s.name}</td>
              <td className={`px-2 py-1.5 text-right tabular-nums ${s.v.npv < 0 ? "text-red-700" : ""}`}>{n0(s.v.npv)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{pctOr(s.v.irr)}</td>
              <td className={`px-2 py-1.5 text-right tabular-nums ${s.v.minDscr < 1 ? "text-red-700" : ""}`}>{x2(s.v.minDscr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-bold text-ink">{value}</p>
    </div>
  );
}
