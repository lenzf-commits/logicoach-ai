import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateInterviewQuestion } from "../ai/interview-engine.ts";
import { interviewerPersonas } from "../interviews/personas.ts";
import type { Tables } from "../../types/database.ts";
import { judgePersonaInterview, type AiJudgeResult } from "./persona-ai-judge.ts";
import {
  runPersonaQualityChecks,
  type PersonaAlias,
  type PersonaQualityResult,
  type PersonaTestMessage
} from "./persona-quality-checks.ts";
import {
  syntheticCandidates,
  testJobPosting,
  testResume,
  type SyntheticCandidate,
  type SyntheticCandidateId
} from "./synthetic-candidates.ts";

type PersonaConfig = {
  alias: PersonaAlias;
  personaValue: string;
  level: number;
};

export type PersonaTestCliOptions = {
  persona: PersonaAlias | "all";
  level?: number;
  runs?: number;
  confirmCost: boolean;
};

type InterviewRunResult = {
  persona: PersonaAlias;
  personaLabel: string;
  level: number;
  runIndex: number;
  candidate: {
    id: SyntheticCandidateId;
    label: string;
    description: string;
  };
  messages: PersonaTestMessage[];
  quality: PersonaQualityResult;
  aiJudge: AiJudgeResult | null;
};

type PersonaTestReport = {
  createdAt: string;
  estimatedMaxApiCalls: number;
  aiJudgeEnabled: boolean;
  results: InterviewRunResult[];
  comparison: Array<{
    persona: string;
    realism: number;
    technicalDepth: number;
    criticality: number;
    naturalness: number;
    followUpQuality: number;
    companyAwareness: number;
  }>;
  similarPersonas: string[];
};

const defaultConfigs: PersonaConfig[] = [
  { alias: "anna", personaValue: "anna-becker", level: 2 },
  { alias: "thomas", personaValue: "thomas-schneider", level: 4 },
  { alias: "michael", personaValue: "michael-weber", level: 5 },
  { alias: "sabine", personaValue: "sabine-hoffmann", level: 8 }
];

const maxRecruiterMessages = 14;
const hardApiCallLimit = 120;

function getPersonaLabel(personaValue: string) {
  return interviewerPersonas.find((persona) => persona.value === personaValue)?.label ?? personaValue;
}

function makeInterview(config: PersonaConfig, runIndex: number): Tables<"interviews"> {
  return {
    id: `persona-test-${config.alias}-${runIndex}`,
    user_id: "00000000-0000-0000-0000-000000000001",
    resume_id: testResume.id,
    job_posting_id: testJobPosting.id,
    status: "active",
    duration_minutes: 15,
    level: config.level,
    persona: config.personaValue,
    started_at: "2026-07-10T10:00:00.000Z",
    completed_at: null,
    created_at: "2026-07-10T10:00:00.000Z",
    updated_at: "2026-07-10T10:00:00.000Z"
  };
}

function makeMessage(role: "interviewer" | "candidate", content: string, order: number): PersonaTestMessage {
  return {
    role,
    content,
    message_order: order
  };
}

function asEngineMessage(message: PersonaTestMessage, interview: Tables<"interviews">): Tables<"interview_messages"> {
  return {
    id: `persona-test-message-${message.message_order}`,
    interview_id: interview.id,
    user_id: interview.user_id,
    role: message.role,
    content: message.content,
    message_order: message.message_order,
    created_at: "2026-07-10T10:00:00.000Z"
  };
}

function buildClosingQuestion() {
  return "Vielen Dank fuer Ihre Antworten. Ich habe aktuell keine weiteren Fragen. Haben Sie noch Fragen an uns?";
}

function buildFinalFarewell() {
  return "Danke fuer Ihre Rueckfrage. Wir klaeren die naechsten Schritte transparent im Anschluss. Vielen Dank fuer das Gespraech, wir melden uns zeitnah bei Ihnen. Ich wuensche Ihnen einen erfolgreichen Tag.";
}

async function simulateInterview(config: PersonaConfig, runIndex: number, candidate: SyntheticCandidate) {
  const interview = makeInterview(config, runIndex);
  const messages: PersonaTestMessage[] = [];

  for (let recruiterTurn = 1; recruiterTurn <= maxRecruiterMessages - 2; recruiterTurn += 1) {
    const question = await generateInterviewQuestion({
      interview,
      resume: testResume,
      jobPosting: testJobPosting,
      messages: messages.map((message) => asEngineMessage(message, interview))
    });

    messages.push(makeMessage("interviewer", question, messages.length + 1));
    messages.push(makeMessage("candidate", candidate.answerQuestion(question, recruiterTurn), messages.length + 1));
  }

  const closingQuestion = buildClosingQuestion();
  messages.push(makeMessage("interviewer", closingQuestion, messages.length + 1));
  messages.push(makeMessage("candidate", candidate.answerQuestion(closingQuestion, maxRecruiterMessages - 1), messages.length + 1));
  messages.push(makeMessage("interviewer", buildFinalFarewell(), messages.length + 1));

  const quality = runPersonaQualityChecks(config.alias, config.level, messages);
  const aiJudge = await judgePersonaInterview(config.alias, config.level, messages);

  return {
    persona: config.alias,
    personaLabel: getPersonaLabel(config.personaValue),
    level: config.level,
    runIndex,
    candidate: {
      id: candidate.id,
      label: candidate.label,
      description: candidate.description
    },
    messages,
    quality,
    aiJudge
  };
}

function selectConfigs(options: PersonaTestCliOptions) {
  if (options.persona === "all") {
    return defaultConfigs;
  }

  const base = defaultConfigs.find((config) => config.alias === options.persona);
  if (!base) {
    throw new Error(`Unbekannte Persona: ${options.persona}`);
  }

  return [{ ...base, level: options.level ?? base.level }];
}

function getMaxRuns(requestedRuns?: number) {
  const envMax = Number.parseInt(process.env.PERSONA_TEST_MAX_RUNS ?? "2", 10);
  const safeEnvMax = Number.isFinite(envMax) && envMax > 0 ? Math.min(envMax, 2) : 2;
  return Math.min(requestedRuns ?? safeEnvMax, safeEnvMax);
}

function estimateApiCalls(configCount: number, runs: number) {
  const judgeCalls = process.env.PERSONA_TEST_AI_JUDGE === "true" ? configCount * runs : 0;
  return configCount * runs * (maxRecruiterMessages - 2) + judgeCalls;
}

function average(values: number[]) {
  return values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function buildComparison(results: InterviewRunResult[]) {
  const personas = [...new Set(results.map((result) => result.persona))];
  return personas.map((persona) => {
    const personaResults = results.filter((result) => result.persona === persona);
    return {
      persona,
      realism: average(personaResults.map((result) => result.quality.metrics.realism)),
      technicalDepth: average(personaResults.map((result) => result.quality.metrics.technicalDepth)),
      criticality: average(personaResults.map((result) => result.quality.metrics.criticality)),
      naturalness: average(personaResults.map((result) => result.quality.metrics.naturalness)),
      followUpQuality: average(personaResults.map((result) => result.quality.metrics.followUpQuality)),
      companyAwareness: average(personaResults.map((result) => result.quality.metrics.companyAwareness))
    };
  });
}

function findSimilarPersonas(comparison: PersonaTestReport["comparison"]) {
  const similar: string[] = [];

  comparison.forEach((left, leftIndex) => {
    comparison.slice(leftIndex + 1).forEach((right) => {
      const deltas = [
        Math.abs(left.realism - right.realism),
        Math.abs(left.technicalDepth - right.technicalDepth),
        Math.abs(left.criticality - right.criticality),
        Math.abs(left.naturalness - right.naturalness),
        Math.abs(left.followUpQuality - right.followUpQuality),
        Math.abs(left.companyAwareness - right.companyAwareness)
      ];

      if (average(deltas) <= 7) {
        similar.push(`${left.persona} und ${right.persona} verhalten sich moeglicherweise zu aehnlich.`);
      }
    });
  });

  return similar;
}

function formatTranscript(messages: PersonaTestMessage[]) {
  return messages.map((message) => `**${message.role === "interviewer" ? "Recruiter" : "Kandidat"}:** ${message.content}`).join("\n\n");
}

function buildMarkdownReport(report: PersonaTestReport) {
  const lines: string[] = [
    "# Persona QA Report",
    "",
    `Erstellt: ${report.createdAt}`,
    `AI-Judge: ${report.aiJudgeEnabled ? "aktiv" : "deaktiviert"}`,
    `Geschaetzte maximale API-Aufrufe: ${report.estimatedMaxApiCalls}`,
    "",
    "## Vergleich der Personas",
    "",
    "| Persona | Realismus | Fachliche Tiefe | Kritikalitaet | Natuerlichkeit | Rueckfragenqualitaet | Unternehmensbezug |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...report.comparison.map(
      (row) =>
        `| ${row.persona} | ${row.realism} | ${row.technicalDepth} | ${row.criticality} | ${row.naturalness} | ${row.followUpQuality} | ${row.companyAwareness} |`
    ),
    "",
    "## Aehnlichkeitswarnungen",
    "",
    ...(report.similarPersonas.length > 0 ? report.similarPersonas.map((item) => `- ${item}`) : ["- Keine auffaelligen Aehnlichkeiten."]),
    ""
  ];

  report.results.forEach((result) => {
    const failed = result.quality.checks.filter((check) => !check.passed);
    const passed = result.quality.checks.filter((check) => check.passed);

    lines.push(
      "## Testlauf",
      "",
      `Persona: ${result.personaLabel}`,
      `Level: ${result.level}`,
      `Bewerberprofil: ${result.candidate.label} - ${result.candidate.description}`,
      `Gesamtscore: ${result.quality.totalScore}`,
      "",
      "### Bestandene Checks",
      "",
      ...(passed.length > 0 ? passed.map((check) => `- ${check.label}: ${check.score}`) : ["- Keine"]),
      "",
      "### Fehlgeschlagene Checks",
      "",
      ...(failed.length > 0 ? failed.map((check) => `- ${check.label}: ${check.score} (${check.details.join("; ")})`) : ["- Keine"]),
      "",
      "### Problematische Stellen",
      "",
      ...result.quality.checks.flatMap((check) => check.evidence.slice(0, 4).map((item) => `- ${check.label}: ${item}`)),
      "",
      "### Wiederholungen",
      "",
      ...(result.quality.repetitions.length > 0 ? result.quality.repetitions.map((item) => `- ${item}`) : ["- Keine auffaelligen Wiederholungen."]),
      "",
      "### Unbeantwortete Kandidatenfragen",
      "",
      ...(result.quality.unansweredCandidateQuestions.length > 0 ? result.quality.unansweredCandidateQuestions.map((item) => `- ${item}`) : ["- Keine auffaelligen unbeantworteten Kandidatenfragen."]),
      "",
      "### Rueckfragen pro Thema",
      "",
      ...Object.entries(result.quality.followUpsByTopic).map(([topic, count]) => `- ${topic}: ${count}`),
      "",
      "### Empfohlene Prompt-Aenderungen",
      "",
      ...(result.quality.promptRecommendations.length > 0 ? result.quality.promptRecommendations.map((item) => `- ${item}`) : ["- Keine dringenden Empfehlungen."]),
      ""
    );

    if (result.aiJudge) {
      lines.push(
        "### AI-Judge",
        "",
        `Gesamteindruck: ${result.aiJudge.overall}`,
        "",
        "Problematische Zitate:",
        ...result.aiJudge.problematicQuotes.map((quote) => `- ${quote}`),
        "",
        "Empfehlungen:",
        ...result.aiJudge.recommendations.map((recommendation) => `- ${recommendation}`),
        ""
      );
    }

    lines.push("### Vollstaendiger Gespraechsverlauf", "", formatTranscript(result.messages), "");
  });

  return `${lines.join("\n")}\n`;
}

function timestampForFile() {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export async function runPersonaTests(options: PersonaTestCliOptions) {
  const configs = selectConfigs(options);
  const runs = getMaxRuns(options.runs);
  const estimatedMaxApiCalls = estimateApiCalls(configs.length, runs);

  console.log(`Persona QA: ${configs.length} Konfiguration(en), ${runs} Run(s) pro Konfiguration.`);
  console.log(`Geschaetzte maximale API-Aufrufe: ${estimatedMaxApiCalls}.`);
  console.log(`AI-Judge: ${process.env.PERSONA_TEST_AI_JUDGE === "true" ? "aktiv" : "deaktiviert"}.`);

  if (estimatedMaxApiCalls > hardApiCallLimit) {
    throw new Error(`Sicherheitslimit ueberschritten: ${estimatedMaxApiCalls} > ${hardApiCallLimit} API-Aufrufe.`);
  }

  if (!options.confirmCost && process.env.PERSONA_TEST_CONFIRM !== "true") {
    console.log("Kostenpflichtiger Testlauf nicht gestartet. Nutze --confirm-cost oder PERSONA_TEST_CONFIRM=true.");
    return null;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY fehlt. Persona-Tests nutzen die bestehende Interview-Engine.");
  }

  const results: InterviewRunResult[] = [];

  for (const config of configs) {
    for (let runIndex = 1; runIndex <= runs; runIndex += 1) {
      const candidate = syntheticCandidates[(runIndex - 1) % syntheticCandidates.length];
      console.log(`Starte ${config.alias}, Level ${config.level}, Run ${runIndex}, Kandidat ${candidate.label}.`);
      results.push(await simulateInterview(config, runIndex, candidate));
    }
  }

  const comparison = buildComparison(results);
  const report: PersonaTestReport = {
    createdAt: new Date().toISOString(),
    estimatedMaxApiCalls,
    aiJudgeEnabled: process.env.PERSONA_TEST_AI_JUDGE === "true",
    results,
    comparison,
    similarPersonas: findSimilarPersonas(comparison)
  };

  const outputDir = path.join(process.cwd(), "test-results");
  await mkdir(outputDir, { recursive: true });
  const stamp = timestampForFile();
  const jsonPath = path.join(outputDir, `persona-qa-${stamp}.json`);
  const markdownPath = path.join(outputDir, `persona-qa-${stamp}.md`);

  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");
  await writeFile(markdownPath, buildMarkdownReport(report), "utf8");

  console.log(`JSON-Bericht: ${jsonPath}`);
  console.log(`Markdown-Bericht: ${markdownPath}`);

  return report;
}
