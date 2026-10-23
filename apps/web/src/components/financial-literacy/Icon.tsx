import type { IconName } from "@/data/financial-literacy/types";

/** Simple line icons for the course, drawn on a 24-unit grid in the current text color. */
const paths: Record<IconName, string> = {
  store: "M3 9l1.5-5h15L21 9M3 9h18M3 9v1a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0V9M5 13v7h14v-7M10 20v-4h4v4",
  idea: "M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z",
  target: "M12 21a9 9 0 110-18 9 9 0 010 18zM12 16a4 4 0 110-8 4 4 0 010 8zM12 12h.01",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3",
  wallet: "M3 7h15a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7l12-3v3M16 13h2",
  piggy: "M5 11a7 6 0 0113-2h2v4l-2 1-1 3h-3v-2H9v2H6l-1-3a6 6 0 010-3zM14 9h.01M10 6.5a2 2 0 013 0",
  coins: "M8 9a5 2.5 0 100-5 5 2.5 0 000 5zM3 6.5v4C3 11.9 5.2 13 8 13s5-1.1 5-2.5v-4M11 16a5 2.5 0 1010 0 5 2.5 0 00-10 0zM11 16v3.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V16",
  chart: "M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 21h15M8 7h7",
  calculator: "M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01",
  bank: "M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18",
  phone: "M8 2h8a1 1 0 011 1v18a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2",
  card: "M3 6h18v12H3zM3 10h18M6 15h4",
  atm: "M4 4h16v9H4zM8 13v7h8v-7M10 17h4M8 8h8",
  pos: "M7 3h10v18H7zM9 6h6v4H9zM9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3zM9 12l2 2 4-4",
  umbrella: "M12 3a9 9 0 019 9H3a9 9 0 019-9zM12 12v7a2 2 0 01-4 0",
  handshake: "M3 12l4-4 4 2 3-2 7 4-3 3M7 8l-4 4 4 4 2-1M14 14l-2 2-2-1M17 15l-2 2-2-1",
  people: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20a7 7 0 0114 0M16 4a3.5 3.5 0 010 7M18 14a6 6 0 014 6",
  house: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5",
  truck: "M2 6h12v10H2zM14 10h4l3 3v3h-7M6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z",
  leaf: "M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l7-7",
  warning: "M12 3l10 18H2L12 3zM12 10v4M12 17h.01",
  check: "M12 21a9 9 0 110-18 9 9 0 010 18zM8 12l3 3 5-6",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 018 0v4M12 15v2",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3",
  scale: "M12 4v16M6 20h12M4 8h16M4 8l-2 6a3 3 0 006 0L6 8M18 8l-2 6a3 3 0 006 0l-2-6",
  growth: "M3 17l6-6 4 4 8-8M15 7h6v6",
  clock: "M12 21a9 9 0 110-18 9 9 0 010 18zM12 7v5l3 2",
  heart: "M12 20s-7-4.4-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.6-9 9-9 9z",
};

export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name] ?? paths.check} />
    </svg>
  );
}
