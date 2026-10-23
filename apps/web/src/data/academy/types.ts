// Content model for the Investopia Academy professional courses (subscribers).
// Each course is one JSON file built from Erudite's training modules, enriched
// with a commercial bank's credit procedure manual (never named) and NBE
// directives. Visuals, icons and quiz questions reuse the Financial Literacy types.

import type { IconName, Lesson, QuizQuestion } from "../financial-literacy/types";

export type { IconName, QuizQuestion };

/** A decision the learner makes in a realistic situation, with feedback. */
export type Scenario = {
  title: string;
  situation: string; // 2-4 sentences: who, what, the numbers that matter
  question: string;
  options: string[]; // 3 or 4
  answer: number;
  explain: string; // why the answer is right and the others are not, 1-3 sentences
};

/** A rule from an NBE directive, an Ethiopian law or the credit manual, quoted in plain words. */
export type Regulation = {
  source: string; // e.g. "NBE Directive No. SBB/43/2008, Asset classification and provisioning"
  text: string;
};

/** A small worked calculation shown as a table. */
export type Worked = {
  title: string;
  rows: { label: string; value: string }[];
  note?: string; // the conclusion an analyst draws
};

/**
 * The officer simulation: the learner works a week (or a cycle) as an officer at
 * a fictional bank, handling an inbox of realistic items in order. Each choice
 * moves the desk's meters and is scored; some choices bring a follow-up item
 * that shows the consequence. Passing it, with the final exam, earns the certificate.
 */
export type SimMeter = {
  id: string; // e.g. "quality"
  label: string; // e.g. "Portfolio quality"
  help: string; // what moves it, one sentence
};

export type SimOption = {
  text: string; // the action, in the officer's words
  score: 0 | 1 | 2 | 3; // 3 best practice, 2 acceptable, 1 weak, 0 wrong or non-compliant
  effects: Record<string, number>; // meter id -> change, -30 to +15
  outcome: string; // what happens next and why, 2-3 sentences, naming the rule or lesson
  next?: string; // id of a follow-up item that this choice triggers
};

export type SimTask = {
  id: string;
  when: string; // e.g. "Monday 09:10"
  from: string; // e.g. "Relationship manager, Adama branch"
  channel: "email" | "call" | "visit" | "memo" | "meeting" | "system";
  subject: string;
  body: string[]; // the facts, as the officer receives them
  exhibit?: Worked; // figures to work with; the learner does the analysis
  ask: string; // the decision to make
  options: SimOption[]; // 3 or 4
  module: string; // module id the item draws on, e.g. "s2"
};

export type Simulation = {
  title: string; // e.g. "A week as credit analyst at Bank A, Adama branch"
  role: string; // the learner's job title
  setting: string[]; // the bank, the desk, the portfolio: 2-4 short paragraphs
  authority?: Worked; // limits, policies and targets the officer works under
  meters: SimMeter[]; // 3 or 4, each starts at 60 out of 100
  tasks: SimTask[]; // the inbox, in order: 8 to 12 items
  followUps?: SimTask[]; // items that appear only after a choice's `next`
  memo: { prompt: string; guide: string[] }; // the written hand-over at the end
};

export type ProLesson = Lesson & {
  scenario?: Scenario;
  regulation?: Regulation;
  worked?: Worked;
};

export type ProModule = {
  id: string; // "s1" ... "s5"
  slug: string; // kebab-case, unique within the course
  icon: IconName;
  minutes: number; // estimated study time
  title: string;
  summary: string; // one sentence
  objectives: string[];
  lessons: ProLesson[];
  takeaways: string[];
  quiz: QuizQuestion[]; // 5-6
};

export type ProCourse = {
  id: string;
  slug: string;
  track: "credit" | "project" | "ifb" | "operations" | "banking" | "tax" | "smefinance" | "capital" | "ib" | "skills";
  levels?: string; // e.g. "Foundational to Intermediate"; shown instead of the level number
  level: 1 | 2 | 3;
  icon: IconName;
  title: string;
  subtitle: string;
  summary: string; // one or two sentences for the catalog card
  audience: string;
  hours: number; // contact hours of the classroom version
  days?: number; // classroom days, shown instead of hours when set
  award?: "Certificate" | "Professional Certificate" | "Executive Certificate"; // the tier printed on the certificate
  objectives: string[];
  runningCase?: { name: string; text: string }; // the fictional company used throughout
  modules: ProModule[];
  simulation?: Simulation;
  /** A practical exercise or capstone, done with the downloadable templates and assessed in blended delivery. */
  practical?: {
    kind: "Practical exercise" | "Capstone project";
    title: string;
    text: string;
    steps: string[];
    deliverables: string[];
  };
  /** Excel templates and tools for the course, kept in public/academy/templates/. */
  downloads?: { label: string; file: string; note: string }[];
  /** What a learner must do to earn the award, online and in the blended version. */
  criteria?: string[];
  exam: QuizQuestion[]; // 20, covering every module
  sources: string[]; // what the course draws on, institutions named only if public (NBE, laws)
};
