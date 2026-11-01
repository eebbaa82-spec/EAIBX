"use client";

import { useState } from "react";
import { courseCopy, type CourseLocale } from "@/data/financial-literacy";
import type { QuizQuestion } from "@/data/financial-literacy/types";
import { markDone, useDone } from "./Progress";

export function Quiz({ moduleId, questions, locale }: { moduleId: string; questions: QuizQuestion[]; locale: CourseLocale }) {
  const t = courseCopy[locale];
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [round, setRound] = useState(0);
  const done = useDone().includes(moduleId);
  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <div>
      <p className="text-muted">{t.quizIntro}</p>
      <ol className="mt-6 space-y-6">
        {questions.map((q, qi) => {
          const choice = picked[qi];
          return (
            <li key={`${round}-${qi}`} className="rounded-xl border border-line bg-white p-5">
              <p className="font-semibold text-ink">
                {qi + 1}. {q.q}
              </p>
              <div className="mt-3 grid gap-2" role="radiogroup" aria-label={q.q}>
                {q.options.map((o, oi) => {
                  const isPicked = choice === oi;
                  const showRight = choice !== null && oi === q.answer;
                  const showWrong = isPicked && oi !== q.answer;
                  return (
                    <button
                      key={oi}
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      disabled={choice !== null}
                      onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                      className={`rounded-lg border px-4 py-2.5 text-left transition-colors ${
                        showRight
                          ? "border-brand-500 bg-brand-50 font-semibold text-brand-900"
                          : showWrong
                            ? "border-red-300 bg-red-50 text-red-900"
                            : "border-line bg-white text-ink hover:border-brand-500 disabled:hover:border-line"
                      }`}
                    >
                      {showRight ? "✓ " : showWrong ? "✗ " : ""}
                      {o}
                    </button>
                  );
                })}
              </div>
              {choice !== null && (
                <p role="status" className="mt-3 text-sm text-ink">
                  <strong className={choice === q.answer ? "text-brand-700" : "text-red-700"}>
                    {choice === q.answer ? t.correct : t.notQuite}
                  </strong>{" "}
                  {q.explain}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {answered === questions.length && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-5">
          <p className="font-semibold text-brand-900">{t.score(right, questions.length)}</p>
          <button
            type="button"
            onClick={() => {
              setPicked(questions.map(() => null));
              setRound((r) => r + 1);
            }}
            className="rounded-lg border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-white"
          >
            {t.retry}
          </button>
        </div>
      )}

      <div className="mt-6">
        {done ? (
          <p className="font-semibold text-brand-700">✓ {t.markedDone}</p>
        ) : (
          <button
            type="button"
            onClick={() => markDone(moduleId)}
            className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            {t.markDone}
          </button>
        )}
      </div>
    </div>
  );
}
