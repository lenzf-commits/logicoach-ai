import { getInterviewerPersonaLabel } from "@/lib/interviews/personas";
import type { Tables } from "@/types/database";

export type AiCoachingReport = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  topRisks: string[];
  improvedAnswers: string[];
};

export class AiCoachingReportError extends Error {
  openAiResponseBody?: string;

  constructor(message: string, openAiResponseBody?: string) {
    super(message);
    this.name = "AiCoachingReportError";
    this.openAiResponseBody = openAiResponseBody;
  }
}

type GenerateAiCoachingReportInput = {
  interview: Tables<"interviews">;
  messages: Tables<"interview_messages">[];
  resume: Tables<"resumes"> | null;
  jobPosting: Tables<"job_postings"> | null;
  evaluation: Tables<"interview_evaluations">;
};

function compact(value: unknown, maxLength = 5000) {
  if (!value) {
    return "Nicht vorhanden";
  }

  return typeof value === "string" ? value.slice(0, maxLength) : JSON.stringify(value).slice(0, maxLength);
}

function buildPrompt({ interview, messages, resume, jobPosting, evaluation }: GenerateAiCoachingReportInput) {
  const persona = getInterviewerPersonaLabel(interview.persona);
  const conversation = messages
    .map((message) => `${message.role === "interviewer" ? "Interviewer" : "Kandidat"}: ${message.content}`)
    .join("\n\n");

  return [
    "Du bist ein professioneller deutscher Bewerbungscoach fuer Logistik-Bewerbungsgespraeche.",
    "Erstelle einen ehrlichen, direkten und hilfreichen KI-Coaching-Bericht.",
    "Der Bericht ist ein Zusatz zu einer regelbasierten Bewertung und ersetzt diese nicht.",
    "Gehe konkret auf Aussagen aus dem Interview ein. Keine allgemeinen Floskeln wie 'Gut gemacht, weiter so'.",
    "Sei klar und streng, aber nicht beleidigend.",
    "Antworte ausschliesslich als valides JSON ohne Markdown.",
    "",
    "JSON-Schema:",
    "{",
    '  "summary": "string",',
    '  "strengths": ["string"],',
    '  "weaknesses": ["string"],',
    '  "recommendations": ["string"],',
    '  "topRisks": ["string"],',
    '  "improvedAnswers": ["string"]',
    "}",
    "",
    "Regeln:",
    "- summary: 4 bis 6 Saetze.",
    "- strengths: 3 konkrete Staerken.",
    "- weaknesses: 3 konkrete Schwaechen.",
    "- recommendations: 4 konkrete naechste Schritte.",
    "- topRisks: genau 3 Risiken aus Recruiter-Sicht.",
    "- improvedAnswers: genau 3 bessere Beispielantworten, jeweils kurz, realistisch und auf Deutsch.",
    "- Beziehe Lebenslauf, Stellenanzeige, Persona, Level und regelbasierte Scores ein.",
    "- Wenn Informationen fehlen, benenne das sachlich.",
    "",
    `Interviewer-Persona: ${persona}`,
    `Schwierigkeitslevel: ${interview.level ?? 1}/10`,
    `Interviewdauer: ${interview.duration_minutes ?? "Nicht angegeben"} Minuten`,
    "",
    "Regelbasierte Scores:",
    JSON.stringify({
      overall_score: evaluation.overall_score,
      self_presentation_score: evaluation.self_presentation_score,
      communication_score: evaluation.communication_score,
      structure_score: evaluation.structure_score,
      logistics_keywords_score: evaluation.logistics_keywords_score,
      confidence_score: evaluation.confidence_score,
      filler_word_count: evaluation.filler_word_count,
      average_answer_length: evaluation.average_answer_length,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      recommendations: evaluation.recommendations
    }),
    "",
    "Lebenslauf:",
    compact(resume?.extracted_text, 4000),
    "",
    "Lebenslauf parsed_data:",
    compact(resume?.parsed_data, 3000),
    "",
    "Stellenanzeige:",
    compact(jobPosting?.description, 4000),
    "",
    "Stellenanzeige parsed_data:",
    compact(jobPosting?.parsed_data, 3000),
    "",
    "Interviewverlauf:",
    compact(conversation, 9000)
  ].join("\n");
}

function extractResponseText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (response.output_text) {
    return response.output_text.trim();
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseReport(text: string): AiCoachingReport {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("OpenAI hat keinen gueltigen Coaching-Bericht erzeugt.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("OpenAI Coaching-Bericht hat ein unerwartetes Format.");
  }

  const report = parsed as Record<string, unknown>;
  const summary = typeof report.summary === "string" ? report.summary.trim() : "";

  if (!summary) {
    throw new Error("OpenAI Coaching-Bericht enthaelt keine Zusammenfassung.");
  }

  return {
    summary,
    strengths: asStringArray(report.strengths),
    weaknesses: asStringArray(report.weaknesses),
    recommendations: asStringArray(report.recommendations),
    topRisks: asStringArray(report.topRisks),
    improvedAnswers: asStringArray(report.improvedAnswers)
  };
}

export async function generateAiCoachingReport(input: GenerateAiCoachingReportInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY fehlt.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: buildPrompt(input),
      reasoning: {
        effort: "minimal"
      },
      max_output_tokens: 1200
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI coaching response body", errorText);
    throw new AiCoachingReportError("OpenAI Coaching Anfrage fehlgeschlagen.", errorText);
  }

  const data: unknown = await response.json();
  const responseData = data as {
    status?: string;
    incomplete_details?: {
      reason?: string;
    } | null;
  };

  if (
    responseData.status === "incomplete" &&
    responseData.incomplete_details?.reason === "max_output_tokens"
  ) {
    throw new AiCoachingReportError("OpenAI Coaching unvollstaendig: Das Output-Tokenbudget war zu niedrig.");
  }

  const text = extractResponseText(data);

  if (!text) {
    throw new Error("OpenAI hat keinen Coaching-Bericht erzeugt.");
  }

  return parseReport(text);
}
