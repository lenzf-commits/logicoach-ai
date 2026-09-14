import type { Tables } from "@/types/database";

const fillerWords = ["ähm", "äh", "also", "quasi", "halt", "irgendwie", "sozusagen", "eigentlich"];
const exampleTerms = ["beispiel", "situation", "damals", "konkret", "in meiner letzten stelle"];
const evidenceTerms = ["prozent", "%", "anzahl", "mitarbeiter", "jahre", "täglich", "woechentlich", "wöchentlich"];
const professionalTerms = [
  "aufgabe",
  "projekt",
  "ziel",
  "ergebnis",
  "kunde",
  "qualität",
  "methode",
  "analyse",
  "planung",
  "umsetzung",
  "verbesserung",
  "lösung",
  "erfahrung",
  "verantwortung"
];
const leadershipTerms = ["team", "mitarbeiter", "verantwortung", "konflikt", "zusammenarbeit", "einarbeitung", "motivation"];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function words(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function countTermMatches(text: string, terms: string[]) {
  const normalized = text.toLowerCase();

  return terms.reduce((count, term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = normalized.match(new RegExp(`\\b${escaped}\\b`, "giu"));
    return count + (matches?.length ?? 0);
  }, 0);
}

function uniqueMatchedTerms(text: string, terms: string[]) {
  const normalized = text.toLowerCase();
  return terms.filter((term) => normalized.includes(term.toLowerCase()));
}

export function evaluateInterviewMessages(messages: Tables<"interview_messages">[]) {
  const candidateAnswers = messages.filter((message) => message.role === "candidate");
  const answerTexts = candidateAnswers.map((message) => message.content);
  const fullText = answerTexts.join("\n");
  const answerLengths = answerTexts.map((answer) => words(answer).length);
  const answerCount = candidateAnswers.length;
  const averageAnswerLength =
    answerCount > 0
      ? Math.round(answerLengths.reduce((sum, length) => sum + length, 0) / answerCount)
      : 0;
  const shortAnswerCount = answerLengths.filter((length) => length < 25).length;
  const longAnswerCount = answerLengths.filter((length) => length > 180).length;
  const fillerWordCount = countTermMatches(fullText, fillerWords);
  const exampleCount = countTermMatches(fullText, exampleTerms);
  const evidenceCount = countTermMatches(fullText, evidenceTerms);
  const professionalMatches = uniqueMatchedTerms(fullText, professionalTerms);
  const leadershipMatches = uniqueMatchedTerms(fullText, leadershipTerms);

  const selfPresentationScore = clamp(45 + Math.min(answerCount * 8, 25) + Math.min(exampleCount * 10, 20) + Math.min(evidenceCount * 5, 10) - shortAnswerCount * 8);
  const communicationScore = clamp(75 - fillerWordCount * 4 - longAnswerCount * 10 + Math.min(answerCount * 3, 12));
  const structureScore = clamp(50 + Math.min(exampleCount * 12, 25) + Math.min(evidenceCount * 8, 20) - shortAnswerCount * 10 - longAnswerCount * 8);
  const professionalContextScore = clamp(35 + Math.min(professionalMatches.length * 9, 45) + Math.min(leadershipMatches.length * 5, 20));
  const confidenceScore = clamp(70 - fillerWordCount * 3 - shortAnswerCount * 8 + Math.min(evidenceCount * 5, 15));
  const overallScore = clamp(
    (selfPresentationScore +
      communicationScore +
      structureScore +
      professionalContextScore +
      confidenceScore) /
      5
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (professionalMatches.length > 0) {
    strengths.push("Du hast Aufgaben, Vorgehensweisen oder Ergebnisse aus dem Berufsalltag angesprochen.");
  }

  if (exampleCount > 0) {
    strengths.push("Du hast Praxisbeispiele genannt.");
  }

  if (evidenceCount > 0) {
    strengths.push("Du hast Zahlen oder nachvollziehbare Nachweise eingebaut.");
  }

  if (leadershipMatches.length > 0) {
    strengths.push("Du hast Führungs- oder Teamaspekte angesprochen.");
  }

  if (answerCount === 0) {
    weaknesses.push("Es liegen noch keine Kandidatenantworten vor.");
    recommendations.push("Beantworte zuerst einige Interviewfragen, bevor du eine Bewertung erstellst.");
  }

  if (shortAnswerCount > 0) {
    weaknesses.push("Viele Antworten waren zu kurz.");
    recommendations.push("Gib pro Antwort mehr Kontext: Situation, Handlung und Ergebnis.");
  }

  if (longAnswerCount > 0) {
    weaknesses.push("Einige Antworten waren sehr lang.");
    recommendations.push("Fasse deine Antworten klarer zusammen und bleibe bei der Frage.");
  }

  if (fillerWordCount >= 4) {
    weaknesses.push("Du hast viele Füllwörter verwendet.");
    recommendations.push("Reduziere Füllwörter wie ähm, also und quasi.");
  }

  if (exampleCount === 0 && answerCount > 0) {
    weaknesses.push("Es fehlen konkrete Praxisbeispiele.");
    recommendations.push("Nutze häufiger konkrete Beispiele aus deiner beruflichen Praxis, Ausbildung oder deinem Studium.");
  }

  if (leadershipMatches.length === 0 && answerCount > 0) {
    recommendations.push("Beschreibe bei Fragen zur Zusammenarbeit deine Situation, deinen Beitrag und das Ergebnis.");
  }

  if (professionalMatches.length === 0 && answerCount > 0) {
    weaknesses.push("Deine beruflichen Aufgaben und Vorgehensweisen werden noch wenig konkret.");
    recommendations.push("Beschreibe eine konkrete Aufgabe, deine Vorgehensweise und das Ergebnis passend zur Zielposition.");
  }

  return {
    overall_score: overallScore,
    self_presentation_score: selfPresentationScore,
    communication_score: communicationScore,
    structure_score: structureScore,
    logistics_keywords_score: professionalContextScore,
    confidence_score: confidenceScore,
    filler_word_count: fillerWordCount,
    average_answer_length: averageAnswerLength,
    strengths: strengths.length > 0 ? strengths : ["Du hast das Interview begonnen und erste Antworten gegeben."],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Keine gravierenden Schwachpunkte nach den einfachen Regeln erkannt."],
    recommendations: recommendations.length > 0 ? recommendations : ["Trainiere weiter mit konkreten Beispielen und klarer Antwortstruktur."]
  };
}
