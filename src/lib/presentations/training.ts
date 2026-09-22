import { containsQuote, isRecord, requiredText } from "../ai/structured-response.ts";

export const presentationLevels = { abi: "Abitur", bachelor: "Bachelor", master: "Master" } as const;
export type PresentationSource = { id: string; title: string; content: string };
export type PresentationSettings = {
  topic: string;
  level: keyof typeof presentationLevels;
  subject: string;
  durationMinutes: number;
  sourcesOnly: boolean;
  sources: PresentationSource[];
};
export type SourceCitation = { sourceId: string; quote: string };
export type PresentationPlan = {
  sections: { title: string; minutes: number; focus: string; citations: SourceCitation[] }[];
  questions: { question: string; citations: SourceCitation[] }[];
  sourceGaps: string;
};
export type PresentationState = { error?: string; settings?: PresentationSettings; plan?: PresentationPlan };

export function parsePresentationSettings(form: FormData): PresentationSettings {
  const field = (key: string) => String(form.get(key) ?? "").trim();
  const topic = field("topic");
  const subject = field("subject");
  const level = field("level");
  const durationMinutes = Number(field("durationMinutes"));
  if (topic.length < 3 || topic.length > 250) throw new Error("Gib ein Thema mit 3 bis 250 Zeichen ein.");
  if (!(level === "abi" || level === "bachelor" || level === "master")) throw new Error("Wähle Abitur, Bachelor oder Master.");
  if (!subject || subject.length > 120) throw new Error("Gib dein Schulfach oder deinen Studiengang / dein Fach an (maximal 120 Zeichen).");
  if (!Number.isInteger(durationMinutes) || durationMinutes < 3 || durationMinutes > 90) throw new Error("Die Vortragsdauer muss zwischen 3 und 90 Minuten liegen.");
  const sourcesOnly = form.get("sourcesOnly") === "on";
  const sources: PresentationSource[] = [];
  for (let index = 1; index <= 5; index++) {
    const title = field(`sourceTitle${index}`);
    const content = field(`sourceContent${index}`);
    if (!title && !content) continue;
    if (!title || title.length > 200) throw new Error(`Quelle ${index}: Bitte eine Bezeichnung mit maximal 200 Zeichen angeben.`);
    if (content.length < 20 || content.length > 12000 || /^https?:\/\/\S+$/i.test(content)) throw new Error(`Quelle ${index}: Füge den Quellentext ein (20 bis 12.000 Zeichen), nicht nur einen Link.`);
    sources.push({ id: `Q${index}`, title, content });
  }
  if (sources.reduce((sum, source) => sum + source.content.length, 0) > 30000) throw new Error("Deine Quellen dürfen zusammen maximal 30.000 Zeichen enthalten.");
  if (sourcesOnly && !sources.length) throw new Error("Für „Nur meine Quellen“ brauchst du mindestens einen Quellentext.");
  return { topic, subject, level, durationMinutes, sourcesOnly, sources };
}

export function parsePresentationPlan(value: unknown, settings: PresentationSettings): PresentationPlan {
  if (!isRecord(value) || !Array.isArray(value.sections) || !Array.isArray(value.questions)
    || value.sections.length > 8 || value.questions.length > 5 || typeof value.sourceGaps !== "string" || value.sourceGaps.length > 1200) throw new Error("Der Trainingsplan ist ungültig. Bitte erneut erstellen.");
  const parseCitations = (citations: unknown): SourceCitation[] => {
    if (!Array.isArray(citations) || citations.length > 5 || (settings.sourcesOnly && !citations.length)) throw new Error("Ein Quellenbeleg fehlt. Bitte den Trainingsplan erneut erstellen.");
    return citations.map((citation) => {
      if (!isRecord(citation)) throw new Error("Ungültiger Quellenbeleg.");
      const sourceId = requiredText(citation.sourceId, 10);
      const source = settings.sources.find((item) => item.id === sourceId);
      const quote = requiredText(citation.quote, 800);
      if (!source || !containsQuote(source.content, quote)) throw new Error("Ein Quellenbeleg konnte nicht im Quellentext gefunden werden. Bitte erneut erstellen.");
      return { sourceId, quote };
    });
  };
  const sections = value.sections.map((item) => {
    if (!isRecord(item) || typeof item.minutes !== "number" || !Number.isInteger(item.minutes) || item.minutes < 1) throw new Error("Die Zeitplanung ist ungültig. Bitte erneut erstellen.");
    return { title: requiredText(item.title, 160), minutes: item.minutes, focus: requiredText(item.focus, 1200), citations: parseCitations(item.citations) };
  });
  const questions = value.questions.map((item) => {
    if (!isRecord(item)) throw new Error("Die Übungsfragen sind ungültig.");
    return { question: requiredText(item.question, 600), citations: parseCitations(item.citations) };
  });
  if (sections.length && sections.reduce((sum, section) => sum + section.minutes, 0) !== settings.durationMinutes) throw new Error("Die Zeitplanung passt noch nicht zur gewählten Dauer. Bitte erneut erstellen.");
  if ((!sections.length || !questions.length) && !value.sourceGaps.trim()) throw new Error("Der Trainingsplan ist unvollständig. Bitte erneut erstellen.");
  return { sections, questions, sourceGaps: value.sourceGaps.trim() };
}
