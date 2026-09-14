export const interviewerPersonas = [
  {
    value: "anna-becker",
    label: "Anna Becker - HR Recruiterin, freundlich"
  },
  {
    value: "thomas-schneider",
    label: "Thomas Schneider - Senior Recruiter, professionell"
  },
  {
    value: "michael-weber",
    label: "Michael Weber - Logistikleiter, fachlich"
  },
  {
    value: "sabine-hoffmann",
    label: "Sabine Hoffmann - Operations Director, kritisch"
  }
] as const;

export type InterviewerPersonaValue = (typeof interviewerPersonas)[number]["value"];

export function getInterviewerPersonaLabel(value: string | null) {
  return interviewerPersonas.find((persona) => persona.value === value)?.label ?? value ?? "Nicht ausgewaehlt";
}
