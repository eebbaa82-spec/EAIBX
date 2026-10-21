import type { ProCourse } from "./types";
import creditL1 from "./credit-foundations.json";
import creditL2 from "./credit-analysis-appraisal.json";
import creditL3 from "./advanced-credit-portfolio-risk.json";
import projectL1 from "./project-finance-foundations.json";
import projectL2 from "./financial-appraisal-loan-structuring.json";
import projectL3 from "./project-risk-structuring-monitoring.json";
import ops from "./domestic-banking-operations.json";

export const proCourses = [creditL1, creditL2, creditL3, projectL1, projectL2, projectL3, ops] as ProCourse[];

export const tracks: { id: ProCourse["track"]; name: string; intro: string }[] = [
  {
    id: "credit",
    name: "Credit Analysis Program",
    intro: "Three levels that take credit officers from the basics of lending to portfolio risk, built on Ethiopian bank credit practice and NBE directives.",
  },
  {
    id: "project",
    name: "Project Appraisal Program",
    intro: "Three levels on project lending: reading feasibility studies, financial appraisal and loan structuring, then risk, security and monitoring.",
  },
  {
    id: "operations",
    name: "Banking Operations",
    intro: "How a branch runs its domestic operations: accounts, deposits, cheques and clearing, transfers, cash and fraud controls.",
  },
];

export const levelNames = { 1: "Foundation", 2: "Intermediate", 3: "Advanced" } as const;

export const academyPath = "/academy/courses";
export const proCourseHref = (course: string, module?: string) => `${academyPath}/${course}/${module ? `${module}/` : ""}`;
export const examHref = (course: string) => `${academyPath}/${course}/final-exam/`;

/** Pass mark for the final exam, in percent. */
export const passMark = 70;
