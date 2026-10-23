"use client";

import { IfbRequest, IfbScreeningBlock } from "./CreditIfb";
import { ifbFacilityTypes, ifbProduct } from "@/lib/credit/ifbcase";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  analyseCase,
  autoSwot,
  birr,
  draftCommentary,
  emptyCase,
  facilityTypes,
  grades,
  ownershipTypes,
  questions,
  sectorReportFor,
  riskAreas,
  stressTests,
  suggestedRisks,
  type AnalystFile,
  type CreditCase,
  type ExportRow,
  type Facility,
  type OtherCollateral,
  type Project,
  type Rating,
} from "@/lib/credit/case";
import { sectors } from "@/data/credit/profile";
import type { AnalysisContext, Cited } from "@/lib/credit/context";
import { contextSwot, isPicked, regionNames, selection, slugOf } from "@/lib/credit/select";
import { deleteFile, getFile, putFile } from "@/lib/docs/store";
import { Area, AnythingToAdd, Block, Check, Grid, Pick, smallButton, TableEditor, Text, inputClass } from "./creditFields";
import { CrbUpload } from "./CreditCrb";
import { CreditProject } from "./CreditProject";
import { CreditProjection } from "./CreditProjection";
import { CreditReport } from "./CreditReport";
import { StatementsImport } from "./StatementsImport";
import { SpreadEntry, SpreadOutcomes } from "./CreditSpread";

/**
 * Credit analysis workspace for loan officers and credit analysts. It follows the
 * "Annex to Loan Application Form" section by section and the lender's financial
 * analysis workbook line by line, adds sector, regional and regulatory context
 * from official sources, and prints a credit analysis report. Everything stays in
 * this browser; nothing is sent anywhere.
 */

const KEY = "investopia-credit-analysis";
const steps = [
  { key: "borrower", title: "Borrower and request", laf: "Sections 1 to 3" },
  { key: "facilities", title: "Facilities and collateral", laf: "Sections 4 and 5" },
  { key: "background", title: "Background", laf: "Section 6" },
  { key: "assessment", title: "Business assessment", laf: "Non-financial" },
  { key: "banking", title: "Banking relationship", laf: "Section 7" },
  { key: "statements", title: "Financial statements", laf: "Financial analysis form" },
  { key: "outcomes", title: "Outcomes", laf: "Ratios and trends" },
  { key: "project", title: "Project appraisal", laf: "Feasibility study" },
  { key: "context", title: "Sector and region", laf: "Operating environment" },
  { key: "analysis", title: "Analysis and risk", laf: "Sections 8 and 9" },
  { key: "recommendation", title: "Recommendation and documents", laf: "Section 10" },
  { key: "report", title: "Report", laf: "Print or save as PDF" },
];
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png";
const MAX_BYTES = 10 * 1024 * 1024;
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function load(): CreditCase | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? merge(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
function merge(raw: Partial<CreditCase>): CreditCase {
  const base = emptyCase();
  if (raw.sector && raw.sectorReport === undefined && !sectors.includes(raw.sector)) {
    raw = { ...raw, sectorReport: raw.sector, sector: "" };
  }
  return { ...base, ...raw, projection: { ...base.projection, ...(raw.projection ?? {}) }, project: { ...base.project, ...(raw.project ?? {}) }, ifb: { ...base.ifb, ...(raw.ifb ?? {}) }, spread: { ...base.spread, ...(raw.spread ?? {}) }, risks: { ...base.risks, ...(raw.risks ?? {}) }, swot: { ...base.swot, ...(raw.swot ?? {}) }, assessment: { ...(raw.assessment ?? {}) } };
}
function save(k: CreditCase) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(k));
  } catch {
    // Storage unavailable: the case lasts for this visit only.
  }
}

export function CreditAnalysis({ ctx, templateHref }: { ctx: AnalysisContext; templateHref: string }) {
  const [k, setK] = useState<CreditCase>(emptyCase);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const saved = load();
      if (saved) setK(saved);
      setLoaded(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (loaded) save(k);
  }, [k, loaded]);

  const set = (patch: Partial<CreditCase>) => setK((prev) => ({ ...prev, ...patch }));
  const a = useMemo(() => analyseCase(k), [k]);
  const drafts = useMemo(() => draftCommentary(k, a), [k, a]);
  const suggested = useMemo(() => suggestedRisks(k, a), [k, a]);
  const stress = useMemo(() => stressTests(k, a), [k, a]);
  const swot = useMemo(() => autoSwot(k, a, contextSwot(selection(k, ctx))), [k, a, ctx]);
  const go = (i: number) => {
    setStep(i);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const add = (key: string, what?: string) => <AnythingToAdd value={k.additions[key] ?? ""} onChange={(v) => set({ additions: { ...k.additions, [key]: v } })} what={what} />;

  const regionOptions = [{ value: "", label: "Select region" }, ...(ctx.regions.length ? ctx.regions.map((r) => ({ value: r.slug, label: r.name })) : regionNames.map((n) => ({ value: slugOf(n), label: n })))];
  const sectorOptions = [{ value: "", label: "Select sector" }, ...sectors.map((s) => ({ value: s, label: s }))];
  const reportOptions = [{ value: "", label: "National economy only" }, ...ctx.sectors.map((s) => ({ value: s.slug, label: s.name }))];
  const construction = k.sector === "Building and construction";

  const body: ReactNode[] = [
    /* 1 to 3 */
    <div key="borrower" className="space-y-6">
      <Block title="1. Summary">
        <Grid>
          <Text label="Name of borrower" value={k.borrower} onChange={(v) => set({ borrower: v })} />
          <Text label="Customer number (CIF)" value={k.cif} onChange={(v) => set({ cif: v })} />
          <Text label="Your institution" value={k.institution} onChange={(v) => set({ institution: v })} placeholder="Your bank or MFI" hint="Optional. Printed on the report header." />
          <Text label="Branch" value={k.branch} onChange={(v) => set({ branch: v })} />
          <Pick label="Region" value={k.region} onChange={(v) => set({ region: v })} options={regionOptions} hint="Drives the regional context in the report." />
          <Text label="City, zone or K/Ketema" value={k.city} onChange={(v) => set({ city: v })} />
          <Text label="Sub-city or woreda" value={k.woreda} onChange={(v) => set({ woreda: v })} />
          <Text label="Kebele and house number" value={k.kebele} onChange={(v) => set({ kebele: v })} />
          <Text label="Date established" type="date" value={k.established} onChange={(v) => set({ established: v })} />
          <Text label="Relationship with us since" type="date" value={k.relationshipSince} onChange={(v) => set({ relationshipSince: v })} />
          <Pick label="Ownership type" value={k.ownership} onChange={(v) => set({ ownership: v })} options={ownershipTypes} />
          <Pick
            label="Sector"
            value={k.sector}
            onChange={(v) =>
              set({ sector: v, sectorReport: sectorReportFor[v] ?? "", ...(v === "Export" ? { exporter: true } : {}), ...(v === "Import" ? { importer: true } : {}) })
            }
            options={sectorOptions}
          />
          <Pick
            label="Sector report for context"
            value={k.sectorReport}
            onChange={(v) => set({ sectorReport: v })}
            options={reportOptions}
            hint="Set from the sector. Change it to the report closest to the borrower's activity, for example coffee exports under agriculture."
          />
          <Text label="Type of business (main activity)" value={k.activity} onChange={(v) => set({ activity: v })} wide />
          <div className="space-y-2 sm:col-span-2">
            <Check label="The borrower exports" checked={k.exporter} onChange={(v) => set({ exporter: v })} />
            <Check label="The borrower imports (letters of credit, foreign currency)" checked={k.importer} onChange={(v) => set({ importer: v })} />
          </div>
          <Text label="Handling officer" value={k.officer} onChange={(v) => set({ officer: v })} />
          <Text label="Reviewed by (branch manager)" value={k.reviewer} onChange={(v) => set({ reviewer: v })} />
        </Grid>
        <div>
          <p className="mb-2 font-semibold text-ink">Exposure (ETB)</p>
          <TableEditor
            rows={k.exposure}
            onChange={(exposure) => set({ exposure })}
            blank={{ facility: "", withUs: "", otherBanks: "" }}
            addLabel="Add facility line"
            cols={[
              { key: "facility", label: "Facility" },
              { key: "withUs", label: "With us", type: "number" },
              { key: "otherBanks", label: "With other banks", type: "number" },
            ]}
          />
          <p className="mt-2 text-sm text-muted">
            Total with us {birr(a.existing)} · with other banks {birr(a.otherBanks)}
          </p>
        </div>
        <Grid>
          <Pick label="Credit risk grade, previous" value={k.gradePrev} onChange={(v) => set({ gradePrev: v })} options={grades} />
          <Pick label="Credit risk grade, current" value={k.gradeNow} onChange={(v) => set({ gradeNow: v })} options={grades} />
          <Text label="Application received" type="date" value={k.received} onChange={(v) => set({ received: v })} />
          <Text label="Application complete" type="date" value={k.completed} onChange={(v) => set({ completed: v })} />
          <Area label="Policy exceptions, if any" value={k.exceptions} onChange={(v) => set({ exceptions: v })} rows={2} />
        </Grid>
      </Block>
      <IfbRequest k={k} set={set} />
      <Block title="2. Customer's request">
        <TableEditor
          rows={k.requests}
          onChange={(requests) => set({ requests })}
          blank={{ type: k.ifb.on ? ifbProduct(k.ifb).product.name : "Term loan", amount: "", tenor: "", repayment: "" }}
          addLabel="Add request"
          cols={[
            { key: "type", label: "Type of facility", type: "select", options: k.ifb.on ? ifbFacilityTypes : facilityTypes },
            { key: "amount", label: "Amount (ETB)", type: "number" },
            { key: "tenor", label: "Tenor (months)", type: "number" },
            { key: "repayment", label: "Repayment" },
          ]}
        />
      </Block>
      <Block title="3. Purpose">
        <Area label="Purpose of the facility" value={k.purpose} onChange={(v) => set({ purpose: v })} />
      </Block>
      {add("borrower", "the borrower and request")}
    </div>,

    /* 4 and 5 */
    <div key="facilities" className="space-y-6">
      <Block title="4. Present facilities">
        <TableEditor<Facility>
          rows={k.facilities}
          onChange={(facilities) => set({ facilities })}
          blank={{ type: "Overdraft", limit: "", outstanding: "", expiry: "", status: "Pass" }}
          addLabel="Add facility"
          cols={[
            { key: "type", label: "Facility", type: "select", options: k.ifb.on ? [...facilityTypes.slice(0, -1), ...ifbFacilityTypes] : facilityTypes },
            { key: "limit", label: "Limit (ETB)", type: "number" },
            { key: "outstanding", label: "Outstanding (ETB)", type: "number" },
            { key: "expiry", label: "Expiry", type: "date" },
            { key: "status", label: "Status", type: "select", options: ["Pass", "Special mention", "Substandard", "Doubtful", "Loss"] },
          ]}
        />
      </Block>
      <Block title="5. Collateral" intro="Discounted value is the value after the lender's margin or haircut. Coverage uses discounted values.">
        <p className="font-semibold text-ink">Buildings</p>
        <TableEditor
          rows={k.buildings}
          onChange={(buildings) => set({ buildings })}
          blank={{ description: "", owner: "", valuedBy: "", valuedOn: "", value: "", discountPct: "" }}
          addLabel="Add building"
          cols={[
            { key: "description", label: "Location and title deed" },
            { key: "owner", label: "Owner" },
            { key: "valuedBy", label: "Estimated by" },
            { key: "valuedOn", label: "Estimated on", type: "date" },
            { key: "value", label: "Estimated value (ETB)", type: "number" },
            { key: "discountPct", label: "Discount %", type: "number" },
          ]}
        />
        <p className="font-semibold text-ink">Other collateral</p>
        <TableEditor<OtherCollateral>
          rows={k.otherCollateral}
          onChange={(otherCollateral) => set({ otherCollateral })}
          blank={{ type: "", origin: "", year: "", insured: "Yes", invoice: "", duty: "", net: "", discountPct: "" }}
          addLabel="Add item"
          cols={[
            { key: "type", label: "Type and brand" },
            { key: "origin", label: "Origin" },
            { key: "year", label: "Year made", type: "number" },
            { key: "insured", label: "Insured", type: "select", options: ["Yes", "No"] },
            { key: "invoice", label: "Invoice value", type: "number" },
            { key: "duty", label: "Duty", type: "number" },
            { key: "net", label: "Net value", type: "number" },
            { key: "discountPct", label: "Discount %", type: "number" },
          ]}
        />
        <div className="grid gap-3 rounded-xl bg-canvas p-4 text-sm sm:grid-cols-3">
          <Stat label="Discounted collateral" value={birr(a.collateral)} />
          <Stat label="Coverage of existing exposure" value={pctOr(a.coverExisting)} />
          <Stat label="Coverage with requested amount" value={pctOr(a.coverRequested)} />
        </div>
        <Area label="Engineer's remarks" value={k.engineerRemarks} onChange={(v) => set({ engineerRemarks: v })} rows={3} />
      </Block>
      {add("facilities", "facilities and collateral")}
    </div>,

    /* 6 */
    <div key="background" className="space-y-6">
      <Block title="6. General background">
        <Area label="Nature of business" value={k.background} onChange={(v) => set({ background: v })} hint="What the business does, since when, its premises, capacity and staff." />
        <p className="font-semibold text-ink">Ownership</p>
        <TableEditor
          rows={k.shareholders}
          onChange={(shareholders) => set({ shareholders })}
          blank={{ name: "", share: "", role: "" }}
          addLabel="Add shareholder"
          cols={[
            { key: "name", label: "Shareholder" },
            { key: "share", label: "Share %", type: "number" },
            { key: "role", label: "Role" },
          ]}
        />
        <p className="font-semibold text-ink">Related companies</p>
        <TableEditor
          rows={k.related}
          onChange={(related) => set({ related })}
          blank={{ name: "", relation: "", exposure: "" }}
          addLabel="Add related company"
          cols={[
            { key: "name", label: "Company" },
            { key: "relation", label: "Relationship" },
            { key: "exposure", label: "Exposure with us (ETB)", type: "number" },
          ]}
        />
        <p className="font-semibold text-ink">Management profile</p>
        <TableEditor
          rows={k.management}
          onChange={(management) => set({ management })}
          blank={{ name: "", position: "", education: "", experience: "" }}
          addLabel="Add manager"
          cols={[
            { key: "name", label: "Name" },
            { key: "position", label: "Position" },
            { key: "education", label: "Education" },
            { key: "experience", label: "Experience (years)", type: "number" },
          ]}
        />
        <Grid>
          <Area label="Major customers and terms" value={k.customers} onChange={(v) => set({ customers: v })} rows={3} hint={a.latest && Number.isFinite(a.latest.debtorDays) ? `Debtor days from the statements: ${Math.round(a.latest.debtorDays)}.` : undefined} />
          <Area label="Major suppliers and terms" value={k.suppliers} onChange={(v) => set({ suppliers: v })} rows={3} hint={a.latest && Number.isFinite(a.latest.creditorDays) ? `Creditor days from the statements: ${Math.round(a.latest.creditorDays)}.` : undefined} />
        </Grid>
      </Block>
      {construction && (
        <Block title="Construction: projects and machinery">
          <TableEditor<Project>
            rows={k.projects}
            onChange={(projects) => set({ projects })}
            blank={{ name: "", client: "", value: "", completion: "", status: "Ongoing" }}
            addLabel="Add project"
            cols={[
              { key: "name", label: "Project" },
              { key: "client", label: "Client" },
              { key: "value", label: "Contract value (ETB)", type: "number" },
              { key: "completion", label: "Completed %", type: "number" },
              { key: "status", label: "Status", type: "select", options: ["Ongoing", "Completed"] },
            ]}
          />
          <Area label="Machinery rental" value={k.machineryRental} onChange={(v) => set({ machineryRental: v })} rows={2} />
        </Block>
      )}
      {k.exporter && (
        <Block title="Export performance" intro="Record sales to China separately from other markets, as the annex asks.">
          <TableEditor<ExportRow>
            rows={k.exports}
            onChange={(exports) => set({ exports })}
            blank={{ year: "", market: "Other markets", commodity: "", volume: "", valueUsd: "" }}
            addLabel="Add export year"
            cols={[
              { key: "year", label: "Year" },
              { key: "market", label: "Market", type: "select", options: ["Other markets", "China"] },
              { key: "commodity", label: "Commodity" },
              { key: "volume", label: "Volume" },
              { key: "valueUsd", label: "Value (USD)", type: "number" },
            ]}
          />
        </Block>
      )}
      {!construction && !k.exporter && <p className="text-sm text-muted">Construction project tables appear when the sector is building and construction; export tables appear when the borrower exports.</p>}
      <Block title="Business visit">
        <Grid>
          <Text label="Date of visit" type="date" value={k.visitDate} onChange={(v) => set({ visitDate: v })} />
          <Text label="Visited by" value={k.visitBy} onChange={(v) => set({ visitBy: v })} />
          <Area label="Summary of findings" value={k.visitFindings} onChange={(v) => set({ visitFindings: v })} />
        </Grid>
      </Block>
      {add("background", "the background")}
    </div>,

    /* Non-financial assessment */
    <Assessment key="assessment" k={k} set={set} />,

    /* 7 */
    <div key="banking" className="space-y-6">
      <Block title="7. Banking relationship">
        <Area label="Term loan repayment history" value={k.repaymentHistory} onChange={(v) => set({ repaymentHistory: v })} rows={3} />
        <p className="font-semibold text-ink">Overdraft utilization</p>
        <p className="text-sm text-muted">Exclude loan proceeds from turnover.</p>
        <TableEditor
          rows={k.od}
          onChange={(od) => set({ od })}
          blank={{ period: "", limit: "", turnover: "", frequency: "", highPct: "", lowPct: "", creditDays: "" }}
          addLabel="Add period"
          cols={[
            { key: "period", label: "Period" },
            { key: "limit", label: "Limit (ETB)", type: "number" },
            { key: "turnover", label: "Credit turnover (ETB)", type: "number" },
            { key: "frequency", label: "Number of credits", type: "number" },
            { key: "highPct", label: "Highest debit % of limit", type: "number" },
            { key: "lowPct", label: "Lowest debit % of limit", type: "number" },
            { key: "creditDays", label: "Days in credit", type: "number" },
          ]}
        />
        <p className="font-semibold text-ink">Letters of credit (last five)</p>
        <TableEditor
          rows={k.lcs}
          onChange={(lcs) => set({ lcs })}
          blank={{ ref: "", amount: "", opened: "", settled: "", remark: "" }}
          addLabel="Add letter of credit"
          cols={[
            { key: "ref", label: "Reference" },
            { key: "amount", label: "Amount" },
            { key: "opened", label: "Opened", type: "date" },
            { key: "settled", label: "Settled", type: "date" },
            { key: "remark", label: "Settlement remark" },
          ]}
        />
        <CrbUpload k={k} set={set} />
        <Grid>
          <Text label="Credit reference (CRS) report number" value={k.crsRef} onChange={(v) => set({ crsRef: v })} />
          <Text
            label="CRS report date"
            type="date"
            value={k.crsDate}
            onChange={(v) => set({ crsDate: v })}
            hint={Number.isFinite(a.crsAgeDays) && a.crsAgeDays > 60 ? "This report is more than two months old. Update it before the credit committee." : "Update the report if it is more than two months old."}
          />
          <Area label="Relationship with other banks: your comments" value={k.otherBanks} onChange={(v) => set({ otherBanks: v })} rows={3} />
        </Grid>
      </Block>
      {add("banking", "the banking relationship")}
    </div>,

    /* Spread entry */
    <div key="statements" className="space-y-6">
      <StatementsImport k={k} set={set} templateHref={templateHref} onDone={() => go(steps.findIndex((s) => s.key === "outcomes"))} />
      <Block
        title="Financial analysis form"
        intro={
          <>
            The figures from the uploaded statements appear here, up to five periods, newest on the left. Check them, or enter and correct figures directly. You can also paste
            cells B9 to F82 of the Excel template into the first cell (land and building, latest period); totals and headings in the block are skipped.
          </>
        }
      >
        <Grid>
          <Pick label="Units" value={k.unit} onChange={(v) => set({ unit: v })} options={["ETB '000", "ETB", "ETB million"]} />
          <Text label="External auditor" value={k.auditor} onChange={(v) => set({ auditor: v })} />
        </Grid>
        <SpreadEntry spread={k.spread} onChange={(spread) => set({ spread })} unit={k.unit} />
      </Block>
      {add("statements", "the financial statements")}
    </div>,

    /* Outcomes */
    <div key="outcomes" className="space-y-6">
      <SpreadOutcomes cols={a.cols} unit={k.unit} />
      {add("outcomes", "the outcomes")}
    </div>,

    /* Project appraisal */
    <CreditProject key="project" k={k} set={set} projectionsTemplate={templateHref.replace(/[^/]+$/, "Investopia-Project-Projections-Template.xlsx")} />,

    /* Context */
    <ContextStep key="context" k={k} ctx={ctx} set={set} />,

    /* 8 and 9 */
    <div key="analysis" className="space-y-6">
      <Block title="8. Financial analysis" intro="Each part starts from a draft written from the figures. Edit it, or replace it with your own words. Leave a box empty to use the draft.">
        <Grid>
          <Area label="Type of statements and auditor's qualifications" value={k.auditQualifications} onChange={(v) => set({ auditQualifications: v })} rows={2} hint="Note any qualified opinion, emphasis of matter or limitation of scope." />
          <Area label="Sales mix (cash and credit sales, product mix)" value={k.salesMix} onChange={(v) => set({ salesMix: v })} rows={2} />
        </Grid>
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
            <label className="block text-sm font-semibold text-ink" htmlFor={`note-${n}`}>
              {n} {title}
            </label>
            <textarea id={`note-${n}`} rows={4} value={k.notes[n] ?? ""} placeholder={drafts[n] || "Enter the financial statements to get a draft."} onChange={(e) => set({ notes: { ...k.notes, [n]: e.target.value } })} className={inputClass} />
            {drafts[n] && !k.notes[n] && (
              <button type="button" className="mt-1 text-sm font-semibold text-brand-700 hover:underline" onClick={() => set({ notes: { ...k.notes, [n]: drafts[n] } })}>
                Start from the draft
              </button>
            )}
          </div>
        ))}
      </Block>
      <Block
        title="8.8 Risk assessment"
        intro="Each risk area is assessed from the figures, the scenario tests, the credit reference report and your business assessment. Levels marked Auto are set by the workspace; choose a level to override one, and add your own comment."
      >
        <Grid>
          {k.importer && (
            <Text label="Share of direct costs that is imported (%)" type="number" value={k.importShare} onChange={(v) => set({ importShare: v })} placeholder="50" hint="Used for the weaker birr scenario. 50% is assumed if left blank." />
          )}
          <Text label="Your institution's capital (ETB)" type="number" value={k.lenderCapital} onChange={(v) => set({ lenderCapital: v })} hint="Optional. Flags a big borrower, whose total exposure is 5% of capital or more." />
        </Grid>
        <StressTable stress={stress} unit={k.unit} />
        <div className="space-y-4">
          {riskAreas(k).map((r) => (
            <div key={r.key} className="grid gap-2 sm:grid-cols-[12rem_8rem_1fr] sm:items-start">
              <div>
                <p className="font-semibold text-ink">{r.label}</p>
                <p className="text-xs text-muted">{r.hint}</p>
              </div>
              <select aria-label={`${r.label} level`} value={k.risks[r.key].level} onChange={(e) => set({ risks: { ...k.risks, [r.key]: { ...k.risks[r.key], level: e.target.value as "" } } })} className={inputClass}>
                {["", "Low", "Medium", "High"].map((l) => (
                  <option key={l} value={l}>
                    {l || (suggested[r.key] ? `Auto: ${suggested[r.key]?.level}` : "Level")}
                  </option>
                ))}
              </select>
              <textarea aria-label={`${r.label} note`} rows={2} value={k.risks[r.key].note} placeholder={suggested[r.key] ? `Suggested ${suggested[r.key]?.level.toLowerCase()}: ${suggested[r.key]?.why}.` : undefined} onChange={(e) => set({ risks: { ...k.risks, [r.key]: { ...k.risks[r.key], note: e.target.value } } })} className={inputClass} />
            </div>
          ))}
        </div>
        {Number(k.gradeNow) > 3 && (
          <Area
            label="Justification for a grade above 3"
            value={k.gradeJustification}
            onChange={(v) => set({ gradeJustification: v })}
            hint="The annex asks for the improvement expected, and how, when the current credit risk grade is above 3."
          />
        )}
      </Block>
      <IfbScreeningBlock k={k} a={a} set={set} />
      <Block title="8.9 Cash flow projection and repayment capacity" intro="Projected cash flows for the life of the proposed facilities, and the borrower's capacity to repay them in a base case and two stress scenarios.">
        <CreditProjection k={k} a={a} set={set} />
      </Block>
      <Block title="9. Summary (SWOT)" intro="The SWOT is written automatically from the figures, the credit reference report, your business assessment and the sector and region. Add your own points under each heading.">
        <Grid>
          {(
            [
              ["s", "Strengths"],
              ["w", "Weaknesses"],
              ["o", "Opportunities"],
              ["t", "Threats"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <p className="font-semibold text-ink">{label}</p>
              {swot[key].length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {swot[key].map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Nothing found automatically yet.</p>
              )}
              <Area label={`Add to ${label.toLowerCase()}`} value={k.swot[key]} onChange={(v) => set({ swot: { ...k.swot, [key]: v } })} rows={2} />
            </div>
          ))}
        </Grid>
      </Block>
      {add("analysis", "the analysis")}
    </div>,

    /* 10 */
    <div key="recommendation" className="space-y-6">
      <Block title="10. Officer's recommendation">
        <TableEditor
          rows={k.recommendations}
          onChange={(recommendations) => set({ recommendations })}
          blank={{ type: k.ifb.on ? ifbProduct(k.ifb).product.name : "Term loan", amount: "", rate: "", tenure: "", repayment: "", collateral: "" }}
          addLabel="Add facility"
          cols={[
            { key: "type", label: k.ifb.on ? "Product" : "Type of loan", type: "select", options: k.ifb.on ? ifbFacilityTypes : facilityTypes },
            { key: "amount", label: k.ifb.on ? "Cost or amount (ETB)" : "Amount (ETB)", type: "number" },
            { key: "rate", label: k.ifb.on ? "Profit rate %" : "Rate %", type: "number" },
            { key: "tenure", label: "Tenure (months)", type: "number" },
            { key: "repayment", label: "Repayment" },
            { key: "collateral", label: "Collateral" },
          ]}
        />
        <p className="text-sm text-muted">Collateral coverage of total exposure with the recommended amounts: {pctOr(a.coverRecommended)}.</p>
        <Area label="Conditions and covenants" value={k.conditions} onChange={(v) => set({ conditions: v })} rows={3} />
      </Block>
      <Documents k={k} set={set} />
      {add("recommendation", "the recommendation")}
    </div>,

    /* Report */
    <div key="report" className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button type="button" onClick={() => window.print()} className="rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
          Download PDF
        </button>
        <p className="text-sm text-muted">Choose &quot;Save as PDF&quot; in the print window. The report below is what prints.</p>
      </div>
      <CreditReport k={k} a={a} ctx={ctx} drafts={drafts} />
    </div>,
  ];

  return (
    <div ref={top} className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted">Your case is saved in this browser only. Export it to keep a copy or move it to another computer.</p>
        <CaseFile k={k} onLoad={(c) => setK(c)} />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_1fr]">
        <nav aria-label="Steps" className="print:hidden">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {steps.map((s, i) => (
              <li key={s.key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${i === step ? "bg-brand-600 text-white" : "bg-canvas text-ink hover:bg-brand-50"}`}
                >
                  <span className="font-semibold">
                    {i + 1}. {s.title}
                  </span>
                  <span className={`block text-xs ${i === step ? "text-brand-100" : "text-muted"}`}>{s.laf}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0">
          <h2 className="mb-4 text-2xl font-bold text-ink print:hidden">{steps[step].title}</h2>
          {body[step]}
          <div className="mt-8 flex justify-between gap-3 print:hidden">
            <button type="button" disabled={step === 0} onClick={() => go(step - 1)} className={`${smallButton} disabled:opacity-40`}>
              Back
            </button>
            {step < steps.length - 1 && (
              <button type="button" onClick={() => go(step + 1)} className="rounded-full bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">
                Next: {steps[step + 1].title}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const pctOr = (n: number) => (Number.isFinite(n) ? `${(n * 100).toFixed(0)}%` : "-");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function CaseFile({ k, onLoad }: { k: CreditCase; onLoad: (c: CreditCase) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const exportCase = () => {
    const blob = new Blob([JSON.stringify(k, null, 1)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Investopia-Credit-Analysis-${(k.borrower || "case").replace(/[^A-Za-z0-9]+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={smallButton} onClick={exportCase}>
        Export case
      </button>
      <button type="button" className={smallButton} onClick={() => input.current?.click()}>
        Open a case
      </button>
      <button
        type="button"
        className={smallButton}
        onClick={() => {
          if (window.confirm("Start a new case? The current case is cleared from this browser. Export it first to keep it.")) onLoad(emptyCase());
        }}
      >
        New case
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            onLoad(merge(JSON.parse(await f.text())));
            setMsg(`Opened ${f.name}.`);
          } catch {
            setMsg("That file is not an exported case.");
          }
        }}
      />
      {msg && (
        <span role="status" className="text-sm text-muted">
          {msg}
        </span>
      )}
    </div>
  );
}

function PickList({ title, prefix, items, k, ctx, set, note }: { title: string; prefix: string; items: Cited[]; k: CreditCase; ctx: AnalysisContext; set: (p: Partial<CreditCase>) => void; note?: string }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="font-semibold text-ink">{title}</p>
      {note && <p className="text-xs text-muted">{note}</p>}
      <ul className="mt-2 space-y-2">
        {items.map((it, i) => {
          const id = `${prefix}:${i}`;
          return (
            <li key={id}>
              <Check
                checked={isPicked(k, id, ctx)}
                onChange={(v) => set({ picked: { ...k.picked, [id]: v } })}
                label={
                  <>
                    {it.label && <span className="font-semibold">{it.label}: </span>}
                    {it.text}
                    {it.period && <span className="text-muted"> ({it.period})</span>}
                    {it.cite && <span className="block text-xs text-muted">{it.cite}</span>}
                  </>
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContextStep({ k, ctx, set }: { k: CreditCase; ctx: AnalysisContext; set: (p: Partial<CreditCase>) => void }) {
  const sector = ctx.sectors.find((s) => s.slug === k.sectorReport);
  const region = ctx.regions.find((r) => r.slug === k.region);
  const props = { k, ctx, set };
  return (
    <div className="space-y-6">
      <p className="text-muted">
        Tick the facts to use in this borrower&apos;s analysis. Ticked figures go into the trading outlook, opportunities into the SWOT, and points to consider into the threats. The
        sector and regional data is refreshed every month.
      </p>
      {ctx.economy && (
        <Block title="National economy">
          <PickList title="Indicators" prefix="e:ind" items={ctx.economy.indicators} {...props} />
        </Block>
      )}
      <Block title={sector ? `Sector: ${sector.name}` : "Sector"} intro={sector ? `${sector.summary} (as of ${sector.asOf})` : "Choose a sector report on step 1 to see sector figures, opportunities and points to consider. Without one, the report uses the national economy only."}>
        {sector && (
          <>
            <PickList title="Indicators" prefix="s:ind" items={sector.indicators} {...props} />
            <PickList title="Opportunities" prefix="s:opp" items={sector.opportunities} {...props} />
            <PickList title="Incentives" prefix="s:inc" items={sector.incentives} {...props} />
            <PickList title="Points to consider" prefix="s:pt" items={sector.points} {...props} note="Sector-wide points for the analyst's risk assessment." />
          </>
        )}
      </Block>
      <Block
        title={region ? `Region: ${region.name}` : "Region"}
        intro={region ? `${region.summary}${region.capital ? ` Capital: ${region.capital}.` : ""}` : ctx.regions.length ? "Choose the borrower's region on step 1 to see regional facts." : "Regional facts are being compiled from official sources and will appear here."}
      >
        {region && (
          <>
            <PickList title="Indicators" prefix="r:ind" items={region.indicators} {...props} />
            <PickList title="Economy" prefix="r:eco" items={region.economy} {...props} />
            <PickList title="Industrial parks and zones" prefix="r:park" items={region.parks} {...props} />
            <PickList title="Investment opportunities" prefix="r:opp" items={region.opportunities} {...props} />
            <PickList title="Points to consider" prefix="r:con" items={region.considerations} {...props} />
            {region.office && <p className="text-sm text-muted">Regional investment office: {region.office}</p>}
          </>
        )}
      </Block>
      <div className="rounded-2xl border border-gold-400 bg-gold-100 p-5">
        <p className="font-semibold text-ink">Do you have more recent or local information?</p>
        <p className="mt-1 text-sm text-muted">
          For example, a new directive, local market prices, a regional bureau&apos;s figures or what you saw on the business visit. It is added to the trading outlook in the
          report.
        </p>
        <textarea aria-label="Analyst's sector and regional information" rows={4} value={k.contextUpdate} onChange={(e) => set({ contextUpdate: e.target.value })} className={inputClass} />
      </div>
    </div>
  );
}

function StressTable({ stress, unit }: { stress: ReturnType<typeof stressTests>; unit: string }) {
  if (!stress.length) return <p className="text-sm text-muted">Enter the financial statements to run the scenario tests.</p>;
  return (
    <div>
      <p className="font-semibold text-ink">Scenario tests on the latest period</p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-2 py-2">Scenario</th>
              <th className="px-2 py-2 text-right">Profit before tax ({unit})</th>
              <th className="px-2 py-2 text-right">Interest or collateral cover</th>
              <th className="px-2 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {stress.map((x) => (
              <tr key={x.name} className="border-t border-line align-top">
                <td className="px-2 py-1.5">
                  <span className="font-semibold">{x.name}</span>
                  <span className="block text-xs text-muted">{x.shock}</span>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{Number.isFinite(x.pbt) ? Math.round(x.pbt).toLocaleString("en-US") : "-"}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{Number.isFinite(x.cover) ? (x.collateral ? `${Math.round(x.cover * 100)}%` : `${x.cover.toFixed(2)}x`) : "-"}</td>
                <td className={`px-2 py-1.5 font-semibold ${x.result === "Fails" ? "text-red-700" : x.result === "Weakens" ? "text-amber-700" : "text-brand-700"}`}>{x.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ratings: Rating[] = ["Strong", "Adequate", "Weak"];

function Assessment({ k, set }: { k: CreditCase; set: (p: Partial<CreditCase>) => void }) {
  const done = questions.filter((q) => k.assessment[q.key]?.rating).length;
  return (
    <div className="space-y-6">
      <Block
        title="Business assessment"
        intro={`Rate each area from what you know of the borrower: interviews, the business visit, references and documents. Your ratings feed the risk assessment, the SWOT and the decision summary. ${done} of ${questions.length} rated.`}
      >
        <div className="space-y-5">
          {questions.map((q) => {
            const v = k.assessment[q.key] ?? { rating: "" as Rating, note: "" };
            const put = (p: Partial<typeof v>) => set({ assessment: { ...k.assessment, [q.key]: { ...v, ...p } } });
            return (
              <fieldset key={q.key} className="min-w-0 border-t border-line pt-4">
                <legend className="sr-only">{q.label}</legend>
                <p className="font-semibold text-ink">{q.label}</p>
                <p className="text-sm text-muted">{q.ask}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ratings.map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={v.rating === r}
                      onClick={() => put({ rating: v.rating === r ? "" : r })}
                      className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${v.rating === r ? (r === "Weak" ? "border-red-700 bg-red-700 text-white" : "border-brand-600 bg-brand-600 text-white") : "border-line bg-white text-ink hover:border-brand-600"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea aria-label={`${q.label}: what you found`} rows={2} value={v.note} placeholder="What you found, in a sentence or two" onChange={(e) => put({ note: e.target.value })} className={inputClass} />
              </fieldset>
            );
          })}
        </div>
      </Block>
      <AnythingToAdd value={k.additions.assessment ?? ""} onChange={(v) => set({ additions: { ...k.additions, assessment: v } })} what="the business assessment" />
    </div>
  );
}

function Documents({ k, set }: { k: CreditCase; set: (p: Partial<CreditCase>) => void }) {
  const [msg, setMsg] = useState("");
  const add = async (files: FileList | null) => {
    if (!files) return;
    const added: AnalystFile[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_BYTES) {
        setMsg(`${f.name} is over 10 MB and was not added.`);
        continue;
      }
      const id = `ca-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await putFile(id, f);
      added.push({ id, name: f.name, size: f.size, note: "" });
    }
    if (added.length) set({ files: [...k.files, ...added] });
  };
  const open = async (f: AnalystFile) => {
    const blob = await getFile(f.id);
    if (!blob) return setMsg(`${f.name} is no longer stored in this browser.`);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  return (
    <Block title="Documents from the analyst" intro="Attach anything that supports your analysis: site visit photos, valuation reports, CRS reports, contracts, market quotes. Files stay in this browser; the report lists them as annexes.">
      <label className={`${smallButton} relative inline-block cursor-pointer`}>
        Attach documents
        <input type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => add(e.target.files).then(() => (e.target.value = ""))} />
      </label>
      {msg && (
        <p role="status" className="text-sm text-red-700">
          {msg}
        </p>
      )}
      {k.files.length > 0 && (
        <ul className="space-y-3">
          {k.files.map((f, i) => (
            <li key={f.id} className="rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <button type="button" onClick={() => open(f)} className="font-semibold text-brand-700 hover:underline">
                  {f.name}
                </button>
                <span className="text-muted">{kb(f.size)}</span>
                <button
                  type="button"
                  className="font-semibold text-red-700 hover:underline"
                  onClick={() => {
                    deleteFile(f.id);
                    set({ files: k.files.filter((x) => x.id !== f.id) });
                  }}
                >
                  Remove
                </button>
              </div>
              <input
                aria-label={`What ${f.name} shows`}
                placeholder="What this document shows"
                value={f.note}
                onChange={(e) => set({ files: k.files.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)) })}
                className={inputClass}
              />
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}
