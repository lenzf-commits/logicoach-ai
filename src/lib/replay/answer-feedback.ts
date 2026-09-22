import type { Tables } from "../../types/database.ts";
import { containsQuote, isRecord, requiredText } from "../ai/structured-response.ts";

export type AnswerFeedback = {
  messageId: string;
  verdict: "adequate" | "needs_improvement" | "weak" | "not_assessable";
  reason: string;
  tip: string;
  answerQuote: string;
  improvedAnswer: string;
  resumeQuote: string;
};
export type ReplayOverall = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextExercise: string;
};
export type ReplayAnalysis = { version: 2; answers: AnswerFeedback[]; overall?: ReplayOverall };

export function parseReplayAnalysis(value: unknown, messages: Tables<"interview_messages">[], resumeText: string): ReplayAnalysis {
  if (!isRecord(value) || !Array.isArray(value.answers)) throw new Error("Die Antwortanalyse ist ungültig.");
  const candidates = new Map(messages.filter((message) => message.role === "candidate").map((message) => [message.id, message]));
  const seen = new Set<string>();
  const answers = value.answers.map((item): AnswerFeedback => {
    if (!isRecord(item)) throw new Error("Die Antwortanalyse ist ungültig.");
    const messageId = requiredText(item.messageId, 100);
    const message = candidates.get(messageId);
    if (!message || seen.has(messageId)) throw new Error("Die Analyse konnte den Antworten nicht eindeutig zugeordnet werden.");
    seen.add(messageId);
    if (item.verdict !== "adequate" && item.verdict !== "needs_improvement" && item.verdict !== "weak" && item.verdict !== "not_assessable") throw new Error("Die Antwortanalyse ist ungültig.");
    if (item.verdict !== "weak" && item.verdict !== "needs_improvement") return { messageId, verdict: item.verdict, reason: "", tip: "", answerQuote: "", improvedAnswer: "", resumeQuote: "" };
    const answerQuote = requiredText(item.answerQuote, 600);
    const resumeQuote = typeof item.resumeQuote === "string" ? item.resumeQuote.trim() : "";
    const verifiedAnswerQuote = containsQuote(message.content, answerQuote)
      ? answerQuote
      : message.content.slice(0, 600).trim();
    if (!containsQuote(message.content, answerQuote)) {
      console.warn("Replay analysis returned an unverified answer quote; using source excerpt", { messageId });
    }
    const verifiedResumeQuote = resumeQuote && resumeQuote.length <= 800 && containsQuote(resumeText, resumeQuote)
      ? resumeQuote
      : "";
    if (resumeQuote && !verifiedResumeQuote) {
      console.warn("Replay analysis returned an unverified resume quote; omitting resume citation", { messageId });
    }
    return {
      messageId, verdict: item.verdict, answerQuote: verifiedAnswerQuote, resumeQuote: verifiedResumeQuote,
      reason: requiredText(item.reason, 1000),
      tip: requiredText(item.tip, 800),
      improvedAnswer: requiredText(item.improvedAnswer, 1800)
    };
  });
  if (seen.size !== candidates.size) throw new Error("Nicht alle Antworten wurden geprüft. Bitte erneut analysieren.");
  return { version: 2, answers };
}

export function readReplayAnalysis(value: unknown): ReplayAnalysis | null {
  if (!isRecord(value) || value.version !== 2 || !Array.isArray(value.answers)) return null;
  if (!value.answers.every((item) => isRecord(item) && typeof item.messageId === "string"
    && ["weak", "needs_improvement", "adequate", "not_assessable"].includes(String(item.verdict))
    && [item.reason, item.tip, item.answerQuote, item.improvedAnswer, item.resumeQuote].every((text) => typeof text === "string"))) return null;
  return value as ReplayAnalysis;
}

export function parseReplayOverall(value: unknown): ReplayOverall {
  if (!isRecord(value)) throw new Error("Die Gesamtauswertung ist ungültig.");
  const list = (field: string, maxItems: number) => {
    if (!Array.isArray(value[field]) || value[field].length === 0 || value[field].length > maxItems) throw new Error("Die Gesamtauswertung ist unvollständig.");
    return value[field].map((item) => requiredText(item, 1000));
  };
  return {
    summary: requiredText(value.summary, 1800),
    strengths: list("strengths", 5),
    weaknesses: list("weaknesses", 5),
    recommendations: list("recommendations", 5),
    nextExercise: requiredText(value.nextExercise, 1200)
  };
}
