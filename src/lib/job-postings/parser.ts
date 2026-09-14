export type ParsedJobPostingData = {
  jobTitle: string | null;
  company: string | null;
  responsibilities: string[];
  requirements: string[];
  hardSkills: string[];
  softSkills: string[];
  leadershipResponsibility: {
    possible: boolean;
    evidence: string[];
  };
  shiftWork: {
    possible: boolean;
    evidence: string[];
  };
  logisticsTerms: string[];
  systems: string[];
  interviewRisks: string[];
};

const responsibilityKeywords = ["aufgaben", "taetigkeiten", "verantwortung", "ihre rolle", "das erwartet"];
const requirementKeywords = ["anforderungen", "profil", "qualifikation", "bringen sie mit", "voraussetzung"];
const hardSkillKeywords = ["software", "excel", "ms office", "programmierung", "datenanalyse", "projektmanagement", "buchhaltung", "beratung", "pflege", "unterricht", "konstruktion", "marketing", "qualitätssicherung", "fremdsprachen", "kennzahlen"];
const softSkillKeywords = ["teamfaehigkeit", "kommunikation", "zuverlaessigkeit", "belastbarkeit", "organisation"];
const leadershipKeywords = ["fuehrung", "teamleitung", "schichtleitung", "personalverantwortung", "mitarbeiter fuehren"];
const shiftKeywords = ["schicht", "fruehschicht", "spaetschicht", "nachtschicht", "wechselschicht"];
const logisticsKeywords = [
  "lager",
  "logistik",
  "wareneingang",
  "warenausgang",
  "kommissionierung",
  "disposition",
  "supply chain",
  "transport",
  "speditions",
  "inventur"
];

function normalizeLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function includesAny(line: string, keywords: string[]) {
  const normalized = line.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function unique(values: string[]) {
  return Array.from(new Set(values)).slice(0, 14);
}

function collectLines(lines: string[], keywords: string[]) {
  return unique(lines.filter((line) => includesAny(line, keywords)));
}

function collectTerms(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.filter((keyword) => normalized.includes(keyword));
}

function findLabeledValue(lines: string[], labels: string[]) {
  for (const line of lines) {
    for (const label of labels) {
      const match = line.match(new RegExp(`^${label}\\s*:\\s*(.+)$`, "i"));
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }

  return null;
}

function inferJobTitle(lines: string[]) {
  return (
    findLabeledValue(lines, ["jobtitel", "position", "stelle"]) ??
    lines.find((line) => /\b(fachkraft|entwickler|ingenieur|kaufmann|kauffrau|berater|pflegekraft|lehrer|manager|teamleiter|assistenz|techniker|designer)\b/i.test(line)) ??
    null
  );
}

function inferCompany(lines: string[]) {
  return (
    findLabeledValue(lines, ["unternehmen", "firma", "arbeitgeber"]) ??
    lines.find((line) => /\b(gmbh|ag|kg|ug|se|universität|hochschule|klinik|schule)\b/i.test(line)) ??
    null
  );
}

function buildRisks(parsed: Omit<ParsedJobPostingData, "interviewRisks">) {
  const risks: string[] = [];

  if (parsed.leadershipResponsibility.possible) {
    risks.push("Führungsverantwortung könnte im Interview vertieft abgefragt werden.");
  }

  if (parsed.shiftWork.possible) {
    risks.push("Schichtarbeit sollte mit Beispielen zur Belastbarkeit vorbereitet werden.");
  }

  if (parsed.systems.length > 0) {
    risks.push("Die in der Stellenanzeige genannten Systeme und Werkzeuge könnten fachlich geprüft werden.");
  }

  if (parsed.requirements.length === 0) {
    risks.push("Anforderungen sind im Text nicht klar erkennbar und sollten manuell geprüft werden.");
  }

  return risks;
}

export function parseJobPostingText(text: string, title?: string | null, company?: string | null): ParsedJobPostingData {
  const lines = normalizeLines(text);
  const responsibilities = collectLines(lines, responsibilityKeywords);
  const requirements = collectLines(lines, requirementKeywords);
  const leadershipEvidence = collectLines(lines, leadershipKeywords);
  const shiftEvidence = collectLines(lines, shiftKeywords);

  const parsedWithoutRisks = {
    jobTitle: title || inferJobTitle(lines),
    company: company || inferCompany(lines),
    responsibilities,
    requirements,
    hardSkills: collectLines(lines, hardSkillKeywords),
    softSkills: collectLines(lines, softSkillKeywords),
    leadershipResponsibility: {
      possible: leadershipEvidence.length > 0,
      evidence: leadershipEvidence
    },
    shiftWork: {
      possible: shiftEvidence.length > 0,
      evidence: shiftEvidence
    },
    logisticsTerms: collectTerms(text, logisticsKeywords),
    systems: collectTerms(text, hardSkillKeywords)
  };

  return {
    ...parsedWithoutRisks,
    interviewRisks: buildRisks(parsedWithoutRisks)
  };
}
