import type { PersonaAlias, PersonaTestMessage } from "./persona-quality-checks";

export type AiJudgeResult = {
  realism: number;
  naturalness: number;
  followUpQuality: number;
  personaFit: number;
  technicalDepth: number;
  companyAwareness: number;
  candidateQuestionHandling: number;
  structure: number;
  overall: number;
  problematicQuotes: string[];
  recommendations: string[];
};

function extractResponseText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  return (
    response.output_text?.trim() ??
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim() ??
    ""
  );
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function judgePersonaInterview(persona: PersonaAlias, level: number, messages: PersonaTestMessage[]): Promise<AiJudgeResult | null> {
  if (process.env.PERSONA_TEST_AI_JUDGE !== "true") {
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("PERSONA_TEST_AI_JUDGE=true, aber OPENAI_API_KEY fehlt.");
  }

  const transcript = messages.map((message) => `${message.role}: ${message.content}`).join("\n\n");
  const prompt = [
    "Bewerte dieses deutschsprachige Logistik-Bewerbungsinterview als QA-Judge.",
    "Antworte ausschliesslich als valides JSON ohne Markdown.",
    `Persona: ${persona}, Level: ${level}.`,
    "Bewerte 0 bis 100: realism, naturalness, followUpQuality, personaFit, technicalDepth, companyAwareness, candidateQuestionHandling, structure, overall.",
    "Nenne konkrete problematische Zitate und konkrete Empfehlungen.",
    "JSON-Schema: {\"realism\":0,\"naturalness\":0,\"followUpQuality\":0,\"personaFit\":0,\"technicalDepth\":0,\"companyAwareness\":0,\"candidateQuestionHandling\":0,\"structure\":0,\"overall\":0,\"problematicQuotes\":[\"...\"],\"recommendations\":[\"...\"]}",
    "",
    transcript
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: prompt,
      reasoning: { effort: "minimal" },
      max_output_tokens: 900
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI-Judge fehlgeschlagen: ${body}`);
  }

  const text = extractResponseText(await response.json());
  const parsed = JSON.parse(text) as Record<string, unknown>;

  return {
    realism: asNumber(parsed.realism),
    naturalness: asNumber(parsed.naturalness),
    followUpQuality: asNumber(parsed.followUpQuality),
    personaFit: asNumber(parsed.personaFit),
    technicalDepth: asNumber(parsed.technicalDepth),
    companyAwareness: asNumber(parsed.companyAwareness),
    candidateQuestionHandling: asNumber(parsed.candidateQuestionHandling),
    structure: asNumber(parsed.structure),
    overall: asNumber(parsed.overall),
    problematicQuotes: asStringArray(parsed.problematicQuotes),
    recommendations: asStringArray(parsed.recommendations)
  };
}
