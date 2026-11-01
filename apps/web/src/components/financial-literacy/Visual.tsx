"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Visual as VisualData } from "@/data/financial-literacy/types";
import { Icon } from "./Icon";

/**
 * Animated infographics for the course. Everything renders as plain, readable
 * HTML first (for search engines and readers without JavaScript); once the page
 * loads, graphics below the fold are hidden and animate in as they scroll into
 * view. Motion is skipped for people who ask their device to reduce it.
 */
type Phase = "static" | "waiting" | "in";

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<Phase>("static");
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !("IntersectionObserver" in window)) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      // Already on screen at load: animate straight away.
      requestAnimationFrame(() => setPhase("in"));
      return;
    }
    const hide = requestAnimationFrame(() => setPhase("waiting"));
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("in");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(hide);
      io.disconnect();
    };
  }, []);
  return { ref, phase };
}

/** Cycles a highlight through `count` items while the graphic is on screen. */
function useActive(count: number, phase: Phase, ms = 1600) {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (phase !== "in" || reducedMotion()) return;
    let i = -1;
    const tick = () => {
      i = (i + 1) % count;
      setActive(i);
    };
    const first = setTimeout(tick, 300);
    const t = setInterval(tick, ms);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [count, phase, ms]);
  return active;
}

const delay = (i: number, step = 120): CSSProperties => ({ "--d": `${i * step}ms` }) as CSSProperties;

function Frame({ phase, children, label }: { phase: Phase; children: ReactNode; label?: string }) {
  return (
    <figure className={`fl-visual fl-${phase} my-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 sm:p-6`} aria-label={label}>
      {children}
    </figure>
  );
}

export function Visual({ data }: { data: VisualData }) {
  switch (data.type) {
    case "steps":
      return <Steps data={data} />;
    case "cycle":
      return <Cycle data={data} />;
    case "cards":
      return <Cards data={data} />;
    case "compare":
      return <Compare data={data} />;
    case "equation":
      return <Equation data={data} />;
    case "bars":
      return <Bars data={data} />;
    case "timeline":
      return <Timeline data={data} />;
    case "acronym":
      return <Acronym data={data} />;
    default:
      return null;
  }
}

function Steps({ data }: { data: Extract<VisualData, { type: "steps" }> }) {
  const { ref, phase } = useReveal<HTMLOListElement>();
  const active = useActive(data.items.length, phase);
  return (
    <Frame phase={phase}>
      <ol ref={ref} className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((s, i) => (
          <li
            key={i}
            style={delay(i)}
            className={`fl-anim flex items-start gap-3 rounded-xl border bg-white p-3 transition-colors duration-500 ${
              active === i ? "border-brand-500 shadow-md" : "border-line"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500 ${
                active === i ? "bg-gold-400 text-ink" : "bg-brand-600 text-white"
              }`}
            >
              {i + 1}
            </span>
            <span>
              <span className="block font-semibold text-ink">{s.label}</span>
              {s.text && <span className="mt-0.5 block text-sm text-muted">{s.text}</span>}
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function Cycle({ data }: { data: Extract<VisualData, { type: "cycle" }> }) {
  const { ref, phase } = useReveal<HTMLDivElement>();
  const n = data.items.length;
  const active = useActive(n, phase);
  const pos = (i: number) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: 50 + 38 * Math.cos(a), y: 50 + 38 * Math.sin(a) };
  };
  return (
    <Frame phase={phase}>
      <div ref={ref} className="relative mx-auto aspect-square w-full max-w-sm">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-brand-200)" strokeWidth="1.2" strokeDasharray="2 2" />
          <g className="fl-orbit">
            <circle cx="50" cy="12" r="2.4" fill="var(--color-gold-500)" />
          </g>
          <text x="50" y="52" textAnchor="middle" fontSize="5" fill="var(--color-brand-600)">
            ↻
          </text>
        </svg>
        <ol>
          {data.items.map((item, i) => {
            const p = pos(i);
            return (
              <li
                key={i}
                style={{ left: `${p.x}%`, top: `${p.y}%`, ...delay(i) }}
                className={`fl-anim absolute ${n > 6 ? "w-[30%]" : "w-[34%]"} -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2 py-1.5 text-center text-xs font-semibold leading-tight transition-colors duration-500 sm:text-sm ${
                  active === i ? "border-brand-500 bg-brand-600 text-white" : "border-line bg-white text-ink"
                }`}
              >
                <span className="sr-only">{i + 1}. </span>
                {item.label}
              </li>
            );
          })}
        </ol>
      </div>
    </Frame>
  );
}

const cardCols: Record<number, string> = { 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-3 lg:grid-cols-4" };

function Cards({ data }: { data: Extract<VisualData, { type: "cards" }> }) {
  const { ref, phase } = useReveal<HTMLUListElement>();
  return (
    <Frame phase={phase}>
      <ul ref={ref} className={`grid grid-cols-2 gap-3 ${cardCols[Math.min(data.items.length, 5)] ?? ""}`}>
        {data.items.map((c, i) => (
          <li key={i} style={delay(i)} className="fl-anim flex flex-col items-center rounded-xl border border-line bg-white p-3 text-center">
            <span className="fl-pop mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700" style={delay(i)}>
              <Icon name={c.icon} />
            </span>
            <span className="font-semibold leading-tight text-ink">{c.label}</span>
            {c.text && <span className="mt-1 text-sm text-muted">{c.text}</span>}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function Compare({ data }: { data: Extract<VisualData, { type: "compare" }> }) {
  const { ref, phase } = useReveal<HTMLDivElement>();
  const side = (s: { title: string; items: string[] }, tone: "brand" | "gold", from: "left" | "right") => (
    <div className={`rounded-xl border bg-white p-4 ${tone === "brand" ? "border-brand-200" : "border-gold-400"}`}>
      <p className={`mb-3 inline-block rounded-full px-3 py-1 text-sm font-bold ${tone === "brand" ? "bg-brand-600 text-white" : "bg-gold-400 text-ink"}`}>
        {s.title}
      </p>
      <ul className="space-y-2">
        {s.items.map((t, i) => (
          <li key={i} style={delay(i)} className={`fl-anim fl-from-${from} flex gap-2 text-sm text-ink`}>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tone === "brand" ? "bg-brand-500" : "bg-gold-500"}`} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <Frame phase={phase}>
      <div ref={ref} className="grid gap-3 md:grid-cols-2">
        {side(data.left, "brand", "left")}
        {side(data.right, "gold", "right")}
      </div>
    </Frame>
  );
}

function Equation({ data }: { data: Extract<VisualData, { type: "equation" }> }) {
  const { ref, phase } = useReveal<HTMLDivElement>();
  const symbol = { "+": "+", "-": "−", "=": "=", x: "×", "/": "÷" } as const;
  let k = 0;
  return (
    <Frame phase={phase}>
      <div ref={ref} className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {data.parts.map((p, i) => (
          <span key={i} className="contents">
            {p.op && (
              <span style={delay(k++, 200)} className="fl-anim fl-pop text-2xl font-bold text-gold-500 sm:text-3xl" aria-label={p.op}>
                {symbol[p.op]}
              </span>
            )}
            <span
              style={delay(k++, 200)}
              className={`fl-anim fl-pop rounded-xl px-3 py-3 text-center font-semibold sm:px-5 ${
                i === data.parts.length - 1 && data.parts.some((x) => x.op === "=") ? "bg-brand-600 text-white" : "border border-brand-200 bg-white text-ink"
              }`}
            >
              {p.label}
            </span>
          </span>
        ))}
      </div>
      {data.caption && <figcaption className="mt-4 text-center text-sm text-muted">{data.caption}</figcaption>}
    </Frame>
  );
}

function Bars({ data }: { data: Extract<VisualData, { type: "bars" }> }) {
  const { ref, phase } = useReveal<HTMLDivElement>();
  const max = Math.max(...data.items.map((b) => b.value), 1);
  return (
    <Frame phase={phase}>
      <div ref={ref} className="space-y-3">
        {data.items.map((b, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <span className="text-sm font-medium text-ink">{b.label}</span>
            <span className="flex items-center gap-2">
              <span className="h-5 flex-1 overflow-hidden rounded-full bg-white">
                <span style={{ width: `${(b.value / max) * 100}%`, ...delay(i, 180) }} className="fl-bar block h-full rounded-full bg-brand-500" />
              </span>
              <span className="w-20 text-right text-sm font-semibold tabular-nums text-ink">
                {b.value.toLocaleString("en-US")}
                {data.unit ? ` ${data.unit}` : ""}
              </span>
            </span>
          </div>
        ))}
      </div>
      {data.caption && <figcaption className="mt-4 text-sm text-muted">{data.caption}</figcaption>}
    </Frame>
  );
}

function Timeline({ data }: { data: Extract<VisualData, { type: "timeline" }> }) {
  const { ref, phase } = useReveal<HTMLOListElement>();
  return (
    <Frame phase={phase}>
      <ol ref={ref} className="relative grid gap-4 md:grid-flow-col md:auto-cols-fr">
        <span aria-hidden="true" className="fl-line absolute left-4 top-4 bottom-4 w-0.5 bg-brand-200 md:left-4 md:right-4 md:top-4 md:bottom-auto md:h-0.5 md:w-auto" />
        {data.items.map((t, i) => (
          <li key={i} style={delay(i, 250)} className="fl-anim relative pl-12 md:pl-0 md:pt-12">
            <span className="fl-pop absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-brand-50 bg-gold-400 text-sm font-bold text-ink" style={delay(i, 250)}>
              {i + 1}
            </span>
            <span className="block font-semibold text-ink">{t.label}</span>
            <span className="mt-1 block text-sm text-muted">{t.text}</span>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function Acronym({ data }: { data: Extract<VisualData, { type: "acronym" }> }) {
  const { ref, phase } = useReveal<HTMLUListElement>();
  return (
    <Frame phase={phase}>
      <ul ref={ref} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {data.items.map((a, i) => (
          <li key={i} style={delay(i, 180)} className="fl-anim flex items-start gap-3 rounded-xl border border-line bg-white p-3 lg:flex-col lg:items-center lg:text-center">
            <span className="fl-pop flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-2xl font-black text-white" style={delay(i, 180)}>
              {a.letter}
            </span>
            <span>
              <span className="block font-semibold text-ink">{a.label}</span>
              {a.text && <span className="mt-0.5 block text-sm text-muted">{a.text}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
