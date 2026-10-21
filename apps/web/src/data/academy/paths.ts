/** Course links and the pass mark, kept apart from the course data so client components stay small. */
export const academyPath = "/academy/courses";
export const proCourseHref = (course: string, module?: string) =>
  `${academyPath}/${course}/${module ? `${module}/` : ""}`;
export const examHref = (course: string) =>
  `${academyPath}/${course}/final-exam/`;

/** Pass mark for the final exam, in percent. */
export const passMark = 70;
