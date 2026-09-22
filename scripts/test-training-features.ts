import assert from "node:assert/strict";
import { test } from "node:test";
import { parseReplayAnalysis } from "../src/lib/replay/answer-feedback.ts";
import { parsePresentationSettings, parsePresentationPlan } from "../src/lib/presentations/training.ts";
import { generateReplayAnalysis } from "../src/lib/ai/replay-analysis.ts";
import { generateReplayOverall } from "../src/lib/ai/replay-overall.ts";
import { generatePresentationPlan } from "../src/lib/ai/presentation-plan.ts";
import { generateInterviewQuestion } from "../src/lib/ai/interview-engine.ts";
import type { Tables } from "../src/types/database.ts";

const messages: Tables<"interview_messages">[] = [
  { id: "q1", interview_id: "i1", user_id: "u1", role: "interviewer", content: "Welchen Beitrag haben Sie geleistet?", message_order: 1, created_at: "2026-09-22" },
  { id: "a1", interview_id: "i1", user_id: "u1", role: "candidate", content: "Wir haben alles zusammen gemacht.", message_order: 2, created_at: "2026-09-22" }
];
const resume = "2023–2025: Koordination der Schichtübergaben bei Beispiel GmbH.";
const weakAnswer = { messageId: "a1", verdict: "weak", reason: "Dein eigener Beitrag fehlt.", tip: "Nenne eine Entscheidung, die du selbst getroffen hast.", answerQuote: "alles zusammen gemacht", improvedAnswer: "Ich habe die Schichtübergaben koordiniert. [Platzhalter: konkrete Entscheidung ergänzen]", resumeQuote: "Koordination der Schichtübergaben" };
const report = { answers: [weakAnswer] };

test("Replay ordnet Feedback und nachweisbare Lebenslaufstelle der richtigen Antwort zu", () => {
  const result = parseReplayAnalysis(report, messages, resume);
  assert.equal(result.answers[0].messageId, "a1");
  assert.equal(result.answers[0].resumeQuote, weakAnswer.resumeQuote);
});
test("Replay akzeptiert gute und nicht bewertbare Antworten ohne künstliche Schwächen", () => {
  for (const verdict of ["adequate", "not_assessable"]) {
    const result = parseReplayAnalysis({ answers: [{ ...weakAnswer, verdict }] }, messages, resume);
    assert.equal(result.answers.filter((answer) => answer.verdict === "weak").length, 0);
    assert.equal(result.answers[0].improvedAnswer, "");
  }
});
test("Replay markiert auch grundsätzlich passende Antworten mit konkretem Verbesserungstipp", () => {
  const result = parseReplayAnalysis({ answers: [{ ...weakAnswer, verdict: "needs_improvement" }] }, messages, resume);
  assert.equal(result.answers[0].verdict, "needs_improvement");
  assert.match(result.answers[0].tip, /Entscheidung/);
});
test("Replay ersetzt ungenaue Zitate durch belegbare Originalausschnitte", () => {
  const resumeResult = parseReplayAnalysis({ answers: [{ ...weakAnswer, resumeQuote: "Führung von 50 Mitarbeitern" }] }, messages, resume);
  assert.equal(resumeResult.answers[0].resumeQuote, "");
  const result = parseReplayAnalysis({ answers: [{ ...weakAnswer, answerQuote: "Ich habe nichts gemacht", resumeQuote: "" }] }, messages, resume);
  assert.equal(result.answers[0].answerQuote, messages[1].content);
});
test("Replay weist fremde IDs, doppelte IDs und fehlende Antworten zurück", () => {
  assert.throws(() => parseReplayAnalysis({ answers: [{ ...weakAnswer, messageId: "q1" }] }, messages, resume), /zugeordnet/);
  assert.throws(() => parseReplayAnalysis({ answers: [weakAnswer, weakAnswer] }, messages, resume), /zugeordnet/);
  assert.throws(() => parseReplayAnalysis({ answers: [] }, messages, resume), /Nicht alle/);
});
test("Replay kann ohne Lebenslauf ehrlich auf Gesprächsangaben zurückgreifen", () => {
  assert.equal(parseReplayAnalysis({ answers: [{ ...weakAnswer, resumeQuote: "" }] }, messages, "").answers[0].resumeQuote, "");
});

function settingsForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ topic: "Schichtübergaben", level: "bachelor", subject: "Logistik", durationMinutes: "10" })) form.set(key, value);
  return form;
}
test("Präsentationen unterstützen alle drei Bildungsstufen und brauchen ein Fach", () => {
  const form = settingsForm();
  for (const level of ["abi", "bachelor", "master"]) { form.set("level", level); assert.equal(parsePresentationSettings(form).level, level); }
  form.set("subject", "");
  assert.throws(() => parsePresentationSettings(form), /Fach/);
});
test("Nur Quellen benötigt Text; bloße Links und ungültige Dauer werden abgewiesen", () => {
  const form = settingsForm(); form.set("sourcesOnly", "on");
  assert.throws(() => parsePresentationSettings(form), /mindestens einen Quellentext/);
  form.set("sourceTitle1", "Quelle"); form.set("sourceContent1", "https://example.com/dokument");
  assert.throws(() => parsePresentationSettings(form), /nicht nur einen Link/);
  form.set("sourceContent1", resume); form.set("durationMinutes", "1.5");
  assert.throws(() => parsePresentationSettings(form), /Vortragsdauer/);
});
test("Strenger Quellenmodus prüft Quellenzitate und summiert die Zeitbudgets", () => {
  const form = settingsForm(); form.set("sourcesOnly", "on"); form.set("sourceTitle1", "Beispiel"); form.set("sourceContent1", resume);
  const settings = parsePresentationSettings(form);
  const citations = [{ sourceId: "Q1", quote: "Koordination der Schichtübergaben" }];
  const plan = { sections: [{ title: "Thema", minutes: 10, focus: "Die Koordination erläutern.", citations }], questions: [{ question: "Wie wurden die Übergaben koordiniert?", citations }], sourceGaps: "" };
  assert.equal(parsePresentationPlan(plan, settings).sections[0].minutes, 10);
  assert.throws(() => parsePresentationPlan({ ...plan, sections: [{ ...plan.sections[0], minutes: 9 }] }, settings), /Zeitplanung/);
  assert.throws(() => parsePresentationPlan({ ...plan, questions: [{ ...plan.questions[0], citations: [] }] }, settings), /Quellenbeleg/);
  assert.throws(() => parsePresentationPlan({ ...plan, sections: [{ ...plan.sections[0], citations: [{ sourceId: "Q1", quote: "Erfundenes Zitat" }] }] }, settings), /Quellenbeleg/);
  assert.deepEqual(parsePresentationPlan({ sections: [], questions: [], sourceGaps: "Die Quellen enthalten keine Grundlagen zum Thema." }, settings).sections, []);
});

test("KI-Anfragen transportieren Kontext, Quellenmodus und kritische Nachfragen; keine echten API-Aufrufe", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key-not-real";
  const requests: Record<string, unknown>[] = [];
  let responseValue: unknown = report;
  globalThis.fetch = (async (_url, options) => {
    requests.push(JSON.parse(String(options?.body)));
    return new Response(JSON.stringify({ status: "completed", output: [{ content: [{ type: "output_text", text: typeof responseValue === "string" ? responseValue : JSON.stringify(responseValue) }] }] }), { status: 200 });
  }) as typeof fetch;
  try {
    await generateReplayAnalysis({ messages, resumeText: resume, jobDescription: "Schichtübergaben koordinieren" });
    assert.match(String(requests[0].instructions), /needs_improvement/);
    assert.match(String(requests[0].input), /Koordination der Schichtübergaben/);
    assert.equal(requests[0].store, false);
    responseValue = { sections: [], questions: [], sourceGaps: "Grundlage fehlt." };
    const form = settingsForm(); form.set("sourcesOnly", "on"); form.set("sourceTitle1", "Beispiel"); form.set("sourceContent1", resume);
    await generatePresentationPlan(parsePresentationSettings(form));
    assert.equal(JSON.parse(String(requests[1].input)).sourcesOnly, true);
    assert.match(String(requests[1].instructions), /AUSSCHLIESSLICH/);
    responseValue = "Danke für das Gespräch.";
    await generateInterviewQuestion({ interview: { persona: "anna-mueller", level: 3 } as Tables<"interviews">, resume: null, jobPosting: null, messages, mode: "closing_reply" });
    assert.match(String(requests[2].input), /Ein fehlender Eintrag beweist keine fehlende Fähigkeit/);
    assert.match(String(requests[2].input), /niemals eine neue Frage im closing_reply-Modus/);
    assert.match(String(requests[2].input), /FINALER TURN/);
    responseValue = { summary: "Die Antwort war verständlich, aber dein eigener Beitrag blieb offen.", strengths: ["Du hast die Zusammenarbeit erwähnt."], weaknesses: ["Der eigene Beitrag braucht ein konkretes Beispiel."], recommendations: ["Beschreibe eine eigene Entscheidung."], nextExercise: "Beantworte die Frage erneut mit Situation, Entscheidung und Ergebnis." };
    const overall = await generateReplayOverall({ analysis: parseReplayAnalysis(report, messages, resume), messages, resumeText: resume, jobDescription: "Schichtübergaben koordinieren" });
    assert.match(overall.summary, /Antwort/);
    assert.match(String(requests[3].instructions), /Gesamtauswertung/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
  }
});
