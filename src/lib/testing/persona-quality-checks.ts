import type { Tables } from "../../types/database";

export type PersonaAlias = "anna" | "thomas" | "michael" | "sabine";

export type PersonaTestMessage = Pick<Tables<"interview_messages">, "role" | "content" | "message_order">;

export type QualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  score: number;
  details: string[];
  evidence: string[];
};

export type PersonaQualityResult = {
  checks: QualityCheck[];
  totalScore: number;
  metrics: {
    realism: number;
    technicalDepth: number;
    criticality: number;
    naturalness: number;
    followUpQuality: number;
    companyAwareness: number;
    candidateQuestionHandling: number;
    structure: number;
  };
  repetitions: string[];
  unansweredCandidateQuestions: string[];
  followUpsByTopic: Record<string, number>;
  promptRecommendations: string[];
};

const transitionPhrases = [
  "da wuerde ich gerne kurz nachhaken",
  "da würde ich gerne kurz nachhaken",
  "das ist interessant",
  "vielen dank fuer ihre antwort",
  "vielen dank für ihre antwort",
  "darauf wuerde ich gerne eingehen",
  "darauf würde ich gerne eingehen"
];

const topics: Record<string, string[]> = {
  begruessung: ["guten tag", "schoen", "schön", "hergefunden", "da sind"],
  motivation: ["warum", "wechsel", "motivation", "unternehmen", "rolle"],
  werdegang: ["astemo", "rhein", "werdegang", "station", "position", "arbeitgeber"],
  fachlich: ["sap", "ewm", "wms", "wareneingang", "warenausgang", "bestand", "kommissionierung", "kennzahl", "prozess"],
  fuehrung: ["team", "mitarbeit", "fuehr", "führ", "konflikt", "schicht", "prioris"],
  unternehmen: ["nordlog", "stelle", "aufgaben", "einarbeitung", "teamgroesse", "teamgröße", "schichtplanung"],
  abschluss: ["fragen an uns", "melden uns", "erfolgreichen tag", "vielen dank fuer das gespraech", "vielen dank für das gespräch"]
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
}

function words(text: string) {
  return normalize(text).split(/[^a-z0-9]+/).filter((word) => word.length > 3);
}

function similarity(a: string, b: string) {
  const aWords = new Set(words(a));
  const bWords = new Set(words(b));

  if (aWords.size === 0 || bWords.size === 0) {
    return 0;
  }

  let overlap = 0;
  aWords.forEach((word) => {
    if (bWords.has(word)) {
      overlap += 1;
    }
  });

  return overlap / Math.min(aWords.size, bWords.size);
}

function containsAny(text: string, terms: string[]) {
  const normalized = normalize(text);
  return terms.some((term) => normalized.includes(normalize(term)));
}

function getRecruiterMessages(messages: PersonaTestMessage[]) {
  return messages.filter((message) => message.role === "interviewer");
}

function getCandidateMessages(messages: PersonaTestMessage[]) {
  return messages.filter((message) => message.role === "candidate");
}

function detectTopic(text: string) {
  const normalized = normalize(text);
  const match = Object.entries(topics).find(([, terms]) => terms.some((term) => normalized.includes(normalize(term))));
  return match?.[0] ?? "sonstiges";
}

function scoreCheck(id: string, label: string, score: number, details: string[], evidence: string[] = []): QualityCheck {
  return {
    id,
    label,
    passed: score >= 70,
    score,
    details,
    evidence
  };
}

function questionCount(text: string) {
  return (text.match(/\?/g) ?? []).length;
}

function hasCandidateQuestion(text: string) {
  return text.includes("?") || containsAny(text, ["wie gross", "wie groß", "einarbeitung", "aufgaben erwarten", "fuehrungskultur", "führungskultur", "schichtplanung"]);
}

export function runPersonaQualityChecks(persona: PersonaAlias, level: number, messages: PersonaTestMessage[]): PersonaQualityResult {
  const recruiterMessages = getRecruiterMessages(messages);
  const candidateMessages = getCandidateMessages(messages);
  const repetitions: string[] = [];
  const unansweredCandidateQuestions: string[] = [];
  const followUpsByTopic: Record<string, number> = {};

  recruiterMessages.forEach((message, index) => {
    const currentTopic = detectTopic(message.content);
    followUpsByTopic[currentTopic] = (followUpsByTopic[currentTopic] ?? 0) + 1;

    recruiterMessages.slice(0, index).forEach((previous) => {
      if (similarity(previous.content, message.content) >= 0.72) {
        repetitions.push(`Aehnliche Frage in Nachricht ${previous.message_order} und ${message.message_order}`);
      }
    });
  });

  const repeatedTransitions = transitionPhrases.filter((phrase) => {
    const count = recruiterMessages.filter((message) => normalize(message.content).includes(normalize(phrase))).length;
    return count > 1;
  });

  const candidateQuestionTurns = candidateMessages.filter((message) => hasCandidateQuestion(message.content));
  candidateQuestionTurns.forEach((candidateMessage) => {
    const nextRecruiter = recruiterMessages.find((message) => message.message_order > candidateMessage.message_order);
    if (!nextRecruiter || !containsAny(nextRecruiter.content, ["team", "einarbeitung", "aufgaben", "fuehrung", "führung", "schicht", "rolle", "bei uns", "nordlog"])) {
      unansweredCandidateQuestions.push(`Kandidatenfrage in Nachricht ${candidateMessage.message_order} wirkt nicht konkret beantwortet.`);
    }
  });

  const opening = recruiterMessages[0]?.content ?? "";
  const openingWordCount = words(opening).length;
  const checks: QualityCheck[] = [];

  checks.push(
    scoreCheck(
      "opening",
      "Gespraechseinstieg",
      [
        containsAny(opening, ["guten tag", "schoen", "schön", "willkommen"]) ? 25 : 0,
        containsAny(opening, ["hergefunden", "da sind", "zeit genommen", "freut mich"]) ? 25 : 0,
        containsAny(opening, ["anna", "thomas", "michael", "sabine", "mein name"]) ? 25 : 0,
        openingWordCount <= 90 ? 25 : 0
      ].reduce((sum, value) => sum + value, 0),
      [`Opening-Wortzahl: ${openingWordCount}`],
      [opening]
    )
  );

  checks.push(
    scoreCheck(
      "repetitions",
      "Wiederholungen",
      Math.max(0, 100 - repetitions.length * 20 - repeatedTransitions.length * 20),
      [`Aehnliche Fragen: ${repetitions.length}`, `Wiederholte Uebergaenge: ${repeatedTransitions.join(", ") || "keine"}`],
      [...repetitions, ...repeatedTransitions]
    )
  );

  const maxQuestionMarks = Math.max(...recruiterMessages.map((message) => questionCount(message.content)), 0);
  checks.push(
    scoreCheck(
      "follow_ups",
      "Rueckfragen",
      Math.max(0, 100 - Math.max(0, maxQuestionMarks - 2) * 25),
      [`Maximale Fragezeichen pro Recruiter-Nachricht: ${maxQuestionMarks}`, "Heuristik: Mehrfachfragen senken den Score."],
      recruiterMessages.filter((message) => questionCount(message.content) > 2).map((message) => message.content)
    )
  );

  const topicCounts = Object.values(followUpsByTopic);
  const stuckTopic = Math.max(...topicCounts, 0) > 6;
  const coveredTopics = Object.keys(followUpsByTopic).filter((topic) => topic !== "sonstiges").length;
  checks.push(
    scoreCheck(
      "topic_control",
      "Themensteuerung",
      Math.max(0, 70 + coveredTopics * 5 - (stuckTopic ? 35 : 0)),
      [`Erkannte Themen: ${Object.entries(followUpsByTopic).map(([topic, count]) => `${topic}:${count}`).join(", ")}`]
    )
  );

  checks.push(
    scoreCheck(
      "candidate_questions",
      "Kandidatenfragen",
      candidateQuestionTurns.length === 0 ? 75 : Math.max(0, 100 - unansweredCandidateQuestions.length * 35),
      [`Kandidatenfragen: ${candidateQuestionTurns.length}`, `Unbeantwortet: ${unansweredCandidateQuestions.length}`],
      unansweredCandidateQuestions
    )
  );

  const personaTerms: Record<PersonaAlias, string[]> = {
    anna: ["motivation", "wechsel", "team", "kultur", "passen", "mensch"],
    thomas: ["motivation", "wechsel", "beispiel", "passung", "erwartung"],
    michael: ["sap", "ewm", "wms", "wareneingang", "bestand", "kennzahl", "prozess", "schicht"],
    sabine: ["fuehr", "führ", "entscheidung", "kennzahl", "wirkung", "prioris", "verantwortung", "kritisch"]
  };
  const personaHitCount = recruiterMessages.filter((message) => containsAny(message.content, personaTerms[persona])).length;
  checks.push(
    scoreCheck(
      "persona_fit",
      "Persona-Treue",
      Math.min(100, 45 + personaHitCount * 12 + (level >= 7 && persona === "sabine" ? 10 : 0)),
      [`Persona-spezifische Treffer: ${personaHitCount}`]
    )
  );

  const companyHits = recruiterMessages.filter((message) => containsAny(message.content, ["nordlog", "stelle", "rolle", "team", "einarbeitung", "schicht", "25", "aufgaben"])).length;
  checks.push(scoreCheck("company_awareness", "Unternehmensbezug", Math.min(100, 35 + companyHits * 10), [`Unternehmens-/Stellenbezuege: ${companyHits}`]));

  const longMessages = recruiterMessages.filter((message) => words(message.content).length > 95);
  const multiQuestions = recruiterMessages.filter((message) => questionCount(message.content) > 2);
  checks.push(
    scoreCheck(
      "naturalness",
      "Natuerlichkeit",
      Math.max(0, 100 - longMessages.length * 15 - multiQuestions.length * 20 - repeatedTransitions.length * 20),
      [`Lange Nachrichten: ${longMessages.length}`, `Mehrfachfragen: ${multiQuestions.length}`],
      [...longMessages, ...multiQuestions].map((message) => message.content)
    )
  );

  const closingText = recruiterMessages.slice(-2).map((message) => normalize(message.content)).join("\n");
  checks.push(
    scoreCheck(
      "closing",
      "Abschluss",
      containsAny(closingText, ["fragen an uns", "melden uns", "erfolgreichen tag", "vielen dank"]) ? 85 : 45,
      ["Prueft Rueckfrage-Gelegenheit und finale Verabschiedung."],
      recruiterMessages.slice(-2).map((message) => message.content)
    )
  );

  const technicalDepth =
    persona === "michael"
      ? Math.min(100, 30 + recruiterMessages.filter((message) => containsAny(message.content, personaTerms.michael)).length * 12)
      : Math.min(100, 45 + recruiterMessages.filter((message) => containsAny(message.content, personaTerms.michael)).length * 7);
  const criticality = Math.min(100, 35 + level * 5 + recruiterMessages.filter((message) => containsAny(message.content, ["warum", "kritisch", "schwaeche", "entscheidung", "prioris", "einstellen"])).length * 5);
  const naturalness = checks.find((check) => check.id === "naturalness")?.score ?? 0;
  const followUpQuality = checks.find((check) => check.id === "follow_ups")?.score ?? 0;
  const companyAwareness = checks.find((check) => check.id === "company_awareness")?.score ?? 0;
  const candidateQuestionHandling = checks.find((check) => check.id === "candidate_questions")?.score ?? 0;
  const structure = checks.find((check) => check.id === "topic_control")?.score ?? 0;
  const realism = Math.round((naturalness + structure + checks.find((check) => check.id === "opening")!.score) / 3);

  const totalScore = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);
  const promptRecommendations = checks
    .filter((check) => !check.passed)
    .map((check) => `Prompt fuer "${check.label}" schaerfen: ${check.details.join(" ")}`);

  return {
    checks,
    totalScore,
    metrics: {
      realism,
      technicalDepth,
      criticality,
      naturalness,
      followUpQuality,
      companyAwareness,
      candidateQuestionHandling,
      structure
    },
    repetitions,
    unansweredCandidateQuestions,
    followUpsByTopic,
    promptRecommendations
  };
}
