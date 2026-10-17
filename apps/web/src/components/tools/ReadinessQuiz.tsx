"use client";

import Link from "next/link";
import { useState } from "react";

type Question = { area: string; q: string; fix: string; link?: { href: string; label: string } };

const questions: Question[] = [
  {
    area: "Legal",
    q: "Is your business legally registered, with a valid trade license and a TIN?",
    fix: "Complete your registration, trade license and TIN first. Investors and lenders cannot sign agreements with an unregistered business.",
  },
  {
    area: "Ownership",
    q: "Is ownership clear and documented, with an up-to-date list of shareholders and no ownership disputes?",
    fix: "Put the memorandum of association and the shareholder register in order, and resolve any ownership disagreements before talking to investors.",
  },
  {
    area: "Finance",
    q: "Do you have financial statements for your last full financial year, prepared or audited by an accountant?",
    fix: "Ask an accountant to prepare, and ideally audit, your last full year's statements. Investors start their review here.",
    link: { href: "/advisors", label: "Find an accountant or auditor" },
  },
  {
    area: "Finance",
    q: "Do you keep business and personal money in separate bank accounts?",
    fix: "Open a business bank account and run all business income and spending through it. Mixed accounts make your numbers hard to trust.",
  },
  {
    area: "Tax",
    q: "Are your tax filings and payments up to date?",
    fix: "Bring tax filings and payments up to date and keep the receipts. Unpaid tax becomes the investor's problem, so it often stops a deal.",
  },
  {
    area: "Market",
    q: "Do you have paying customers and a sales record you can show?",
    fix: "Build a track record of sales, even if small, and keep invoices and customer lists. Evidence that people pay you matters more than forecasts.",
  },
  {
    area: "Market",
    q: "Can you explain who your customers are, how big the market is and who you compete with?",
    fix: "Write a short market analysis: your target customers, the market size and your main competitors. Our sector reports can help.",
    link: { href: "/knowledge/sectors", label: "Read the sector reports" },
  },
  {
    area: "Plan",
    q: "Do you have a written business plan with financial projections for at least the next three years?",
    fix: "Prepare a business plan with three-year projections that link to your past results. Keep the assumptions realistic and explained.",
    link: { href: "/programs", label: "Join a program for support" },
  },
  {
    area: "Plan",
    q: "Do you know how much money you need and exactly what you will spend it on?",
    fix: "Set out the amount you need and a use-of-funds table, showing what each part will buy and what it will achieve.",
    link: { href: "/tools/loan-calculator", label: "Check what you could borrow instead" },
  },
  {
    area: "Team",
    q: "Are you ready to share regular reports with an investor and give them a say in major decisions?",
    fix: "Decide what you can offer an investor: monthly or quarterly reports, a board seat, or approval rights on big decisions. Most equity investors expect these.",
  },
];

const answers = [
  { label: "Yes", score: 2 },
  { label: "Partly", score: 1 },
  { label: "No", score: 0 },
];

function band(score: number) {
  if (score >= 16)
    return { title: "Investor-ready", body: "You have the basics in place. Get your Business Health Check grade and start talking to investors.", tone: "bg-gradient-to-br from-brand-900 to-brand-700 text-white" };
  if (score >= 10)
    return { title: "Nearly ready", body: "You are close. Fix the gaps below before approaching investors, so the first impression counts.", tone: "bg-gold-100 text-ink" };
  return { title: "Early stage", body: "There is groundwork to do first. Work through the steps below, and consider an incubation or acceleration program.", tone: "bg-canvas text-ink" };
}

export function ReadinessQuiz() {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const done = answered === questions.length;
  const score = picked.reduce<number>((s, p) => s + (p ?? 0), 0);
  const result = band(score);
  const gaps = questions.map((q, i) => ({ ...q, score: picked[i] })).filter((q) => q.score !== null && q.score < 2);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <ol className="space-y-4">
        {questions.map((q, i) => (
          <li key={q.q} className="rounded-xl border border-line bg-white p-5">
            <fieldset>
              <legend className="text-ink">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {i + 1} of {questions.length} · {q.area}
                </span>
                <span className="font-semibold">{q.q}</span>
              </legend>
              <div className="mt-3 flex gap-2">
                {answers.map((a) => (
                  <label
                    key={a.label}
                    className={`cursor-pointer rounded-lg border px-4 py-1.5 text-sm ${picked[i] === a.score ? "border-brand-600 bg-brand-50 font-semibold text-brand-800" : "border-line text-ink hover:bg-canvas"}`}
                  >
                    <input
                      type="radio"
                      name={`q${i}`}
                      className="sr-only"
                      checked={picked[i] === a.score}
                      onChange={() => setPicked(picked.map((p, j) => (j === i ? a.score : p)))}
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {!done ? (
          <div className="rounded-xl border border-line bg-canvas p-6">
            <p className="font-semibold text-ink">
              {answered} of {questions.length} answered
            </p>
            <div className="mt-3 h-2 rounded-full bg-line">
              <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted">Answer every question to see your result and your next steps.</p>
          </div>
        ) : (
          <>
            <div className={`rounded-xl p-6 ${result.tone}`}>
              <p className="text-sm opacity-80">Your readiness score</p>
              <p className="mt-1 text-4xl font-extrabold">
                {score} <span className="text-xl font-semibold opacity-70">/ {questions.length * 2}</span>
              </p>
              <p className="mt-2 text-lg font-bold">{result.title}</p>
              <p className="mt-1 text-sm opacity-90">{result.body}</p>
            </div>
            {gaps.length > 0 && (
              <div className="rounded-xl border border-line bg-white p-6">
                <p className="font-semibold text-ink">Your next steps</p>
                <ol className="mt-3 space-y-3 text-sm text-ink">
                  {gaps.map((g) => (
                    <li key={g.q}>
                      <span className="font-semibold">{g.area}: </span>
                      {g.fix}
                      {g.link && (
                        <>
                          {" "}
                          <Link href={g.link.href} className="font-semibold text-brand-700 hover:underline">
                            {g.link.label} →
                          </Link>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <button type="button" onClick={() => setPicked(questions.map(() => null))} className="text-sm font-semibold text-brand-700 hover:underline">
              Start again
            </button>
          </>
        )}
        <p className="text-xs text-muted">
          A self-assessment to help you prepare. It is not the EABIX Business Health Check and not investment advice. Your answers are not
          saved or sent anywhere.
        </p>
      </div>
    </div>
  );
}
