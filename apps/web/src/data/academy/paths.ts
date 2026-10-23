/** Course links and the pass mark, kept apart from the course data so client components stay small. */
export const academyPath = "/academy/courses";
export const proCourseHref = (course: string, module?: string) =>
  `${academyPath}/${course}/${module ? `${module}/` : ""}`;
export const simulationHref = (course: string) =>
  `${academyPath}/${course}/simulation/`;
export const examHref = (course: string) =>
  `${academyPath}/${course}/final-exam/`;

/** Pass mark for the final exam, in percent. */
export const passMark = 70;

/** Where a certificate's QR code leads: the public check on the live site. */
export const verifyUrl = (id: string) =>
  `https://investopia.et/academy/verify/?id=${encodeURIComponent(id)}`;

/** Bank and capital market courses put the learner in an officer's seat; business and workplace courses in a job at a fictional company. */
export const simName = (c: { track: string; slug: string }) =>
  c.track === "tax" || c.track === "smefinance" || c.slug.startsWith("organizational-culture")
    ? "Workplace simulation"
    : "Officer simulation";
