// Content model for the Financial Literacy course (Academy). Each module is a
// JSON file (m01.json ... m10.json) with parallel English and Amharic content
// adapted from the National Bank of Ethiopia's Financial Education Module for
// the Youth and MSMEs (May 2024).

export type IconName =
  | "store" | "idea" | "target" | "calendar" | "wallet" | "piggy" | "coins" | "chart"
  | "book" | "calculator" | "bank" | "phone" | "card" | "atm" | "pos" | "shield"
  | "umbrella" | "handshake" | "people" | "house" | "truck" | "leaf" | "warning"
  | "check" | "lock" | "receipt" | "scale" | "growth" | "clock" | "heart";

export type Visual =
  /** Numbered steps that light up one after another. */
  | { type: "steps"; items: { label: string; text?: string }[] }
  /** Items arranged on a ring with a rotating highlight (a repeating process). */
  | { type: "cycle"; items: { label: string }[] }
  /** A grid of icon cards that fade in. */
  | { type: "cards"; items: { icon: IconName; label: string; text?: string }[] }
  /** Two columns side by side, e.g. advantages vs disadvantages, formal vs informal. */
  | { type: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  /** A formula built from boxes and operators, e.g. Assets = Liabilities + Equity. */
  | { type: "equation"; parts: { label: string; op?: "+" | "-" | "=" | "x" | "/" }[]; caption?: string }
  /** Horizontal bars that grow to their value. Only numbers stated in the source. */
  | { type: "bars"; unit?: string; items: { label: string; value: number }[]; caption?: string }
  /** Short, medium and long term, or any ordered periods. */
  | { type: "timeline"; items: { label: string; text: string }[] }
  /** An acronym spelled out letter by letter, e.g. SMART. */
  | { type: "acronym"; items: { letter: string; label: string; text?: string }[] };

export type Lesson = {
  id: string; // short kebab-case, same in en and am
  title: string;
  body: string[]; // 1-3 short paragraphs, plain language
  points?: string[]; // optional bullet list
  visual?: Visual; // optional infographic
  example?: { title: string; text: string }; // optional story or worked example from the source
  tip?: string; // optional one-line practical tip
};

export type QuizQuestion = {
  q: string;
  options: string[]; // 3 or 4
  answer: number; // index into options
  explain: string; // one sentence shown after answering
};

export type ModuleContent = {
  title: string;
  summary: string; // one sentence for the course overview card
  objectives: string[]; // "By the end of this module you will be able to..."
  lessons: Lesson[];
  takeaways: string[]; // 3-6 key points
  quiz: QuizQuestion[]; // 4-6 questions
};

export type CourseModule = {
  id: string; // "m01"
  slug: string; // English kebab-case, used in the URL for both languages
  icon: IconName;
  minutes: number; // estimated reading time
  en: ModuleContent;
  am: ModuleContent;
};
