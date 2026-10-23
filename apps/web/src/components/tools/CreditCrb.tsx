"use client";

import { useState } from "react";
import { birr, exposureLine, otherBanks, type CreditCase } from "@/lib/credit/case";
import { bankKey, readCrb } from "@/lib/credit/crb";
import { inputClass, labelClass, smallButton } from "./creditFields";

/**
 * Step 7 upload: the borrower's credit report from the National Bank of Ethiopia's
 * credit reference bureau. The analyst names their own institution, whose accounts
 * are left out, and the rest becomes the "Relationship with other banks" table.
 */
export function CrbUpload({ k, set }: { k: CreditCase; set: (p: Partial<CreditCase>) => void }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const r = k.crb;
  const institutions = r ? [...new Set([...r.accounts.map((a) => a.institution), ...r.applications.map((a) => a.institution)])].sort() : [];
  const ob = otherBanks(k);

  const read = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const report = await readCrb(file);
      if (!report || (!report.accounts.length && !report.applications.length && !report.summary.length)) {
        setMsg("This file could not be read as a credit reference report. Upload the PDF exactly as downloaded from the credit reference system, not a scan or photo.");
        return;
      }
      const names = [...new Set(report.accounts.map((a) => a.institution).concat(report.applications.map((a) => a.institution)))];
      const mine = k.institution ? names.find((n) => bankKey(n) === bankKey(k.institution) || bankKey(n).includes(bankKey(k.institution)) || bankKey(k.institution).includes(bankKey(n))) : undefined;
      set({
        crb: report,
        ownBank: mine ?? "",
        crsRef: report.enquiryId || k.crsRef,
        crsDate: report.reportDate || k.crsDate,
      });
      setMsg(`Read ${report.accounts.length} credit accounts and ${report.applications.length} credit applications at ${names.length} institutions.`);
    } catch {
      setMsg("This file could not be read. Upload the PDF exactly as downloaded from the credit reference system.");
    } finally {
      setBusy(false);
    }
  };

  const fillExposure = () => {
    if (!ob) return;
    const sums: Record<string, number> = {};
    for (const a of ob.active) sums[exposureLine(a.creditType)] = (sums[exposureLine(a.creditType)] ?? 0) + a.balance;
    const rows = k.exposure.map((e) => ({ ...e, otherBanks: sums[e.facility] ? Math.round(sums[e.facility]).toLocaleString("en-US") : "" }));
    for (const [facility, v] of Object.entries(sums)) if (!rows.some((e) => e.facility === facility)) rows.push({ facility, withUs: "", otherBanks: Math.round(v).toLocaleString("en-US") });
    set({ exposure: rows });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gold-400 bg-gold-100 p-5">
      <div>
        <p className="font-semibold text-ink">Upload the borrower&apos;s credit reference report</p>
        <p className="mt-1 text-sm text-muted">
          Download the latest report for this borrower from the National Bank of Ethiopia&apos;s credit reference system and upload the PDF here. The workspace reads every credit
          account and application in it and builds the &quot;Relationship with other banks&quot; table. Your own institution&apos;s accounts are left out. The file is read in this
          browser and is not sent anywhere.
        </p>
      </div>
      <label className={`${smallButton} relative inline-block cursor-pointer bg-white`}>
        {busy ? "Reading..." : r ? "Upload a newer report" : "Upload credit report (PDF)"}
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            read(f);
          }}
        />
      </label>
      {msg && (
        <p role="status" className="text-sm text-ink">
          {msg}
        </p>
      )}
      {r && (
        <div className="space-y-4">
          <p className="text-sm text-ink">
            Enquiry {r.enquiryId || "-"}, dated {r.reportDate || "-"}
            {r.subject && (
              <>
                , for <span className="font-semibold">{r.subject}</span>
              </>
            )}
            . Check that this is the borrower you are analyzing.
          </p>
          <label className={labelClass}>
            Which institution is yours?
            <select value={k.ownBank} onChange={(e) => set({ ownBank: e.target.value })} className={inputClass}>
              <option value="">None of these: the borrower has no accounts with us</option>
              {institutions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-normal text-muted">Its accounts are excluded from the relationship with other banks; report them under present facilities.</span>
          </label>
          {ob && (
            <>
              <div className="grid gap-3 rounded-xl bg-white p-4 text-sm sm:grid-cols-4">
                <Stat label="Active facilities" value={`${ob.active.length} at ${ob.banks} bank${ob.banks === 1 ? "" : "s"}`} />
                <Stat label="Outstanding" value={birr(ob.outstanding)} />
                <Stat label="Overdue" value={birr(ob.overdue)} />
                <Stat label="Worst classification" value={ob.active.length ? titleCase(ob.worst) : "-"} />
              </div>
              {ob.byBank.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-line bg-white">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-2 py-2">Bank</th>
                        <th className="px-2 py-2 text-right">Active</th>
                        <th className="px-2 py-2 text-right">Outstanding (ETB)</th>
                        <th className="px-2 py-2 text-right">Overdue (ETB)</th>
                        <th className="px-2 py-2">Worst classification</th>
                        <th className="px-2 py-2 text-right">Settled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ob.byBank.map((b) => (
                        <tr key={b.name} className="border-t border-line">
                          <td className="px-2 py-1.5">{b.name}</td>
                          <td className="px-2 py-1.5 text-right">{b.active}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{Math.round(b.outstanding).toLocaleString("en-US")}</td>
                          <td className={`px-2 py-1.5 text-right tabular-nums ${b.overdue > 0 ? "text-red-700" : ""}`}>{Math.round(b.overdue).toLocaleString("en-US")}</td>
                          <td className="px-2 py-1.5">{b.worst ? titleCase(b.worst) : "-"}</td>
                          <td className="px-2 py-1.5 text-right">{b.settled}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button type="button" className={`${smallButton} bg-white`} onClick={fillExposure}>
                Fill &quot;with other banks&quot; in the exposure table from this report
              </button>
              <p className="text-xs text-muted">The report shows each facility in detail. Use the box below to add anything the report does not show, such as the reason for arrears.</p>
            </>
          )}
          <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => set({ crb: null, ownBank: "" })}>
            Remove the credit report
          </button>
        </div>
      )}
    </div>
  );
}

export const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-bold text-ink">{value}</p>
    </div>
  );
}
