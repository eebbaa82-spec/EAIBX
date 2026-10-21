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
  track: "credit" | "project" | "operations";
  level: 1 | 2 | 3;
  icon: IconName;
  title: string;
  subtitle: string;
  summary: string; // one or two sentences for the catalog card
  audience: string;
  hours: number; // contact hours of the classroom version
  objectives: string[];
  runningCase?: { name: string; text: string }; // the fictional company used throughout
  modules: ProModule[];
  exam: QuizQuestion[]; // 20, covering every module
  sources: string[]; // what the course draws on, institutions named only if public (NBE, laws)
};
