export type ParsedResumeData = {
  name: string | null;
  education: string[];
  workExperience: string[];
  employers: string[];
  positions: string[];
  skills: string[];
  certificates: string[];
  leadershipExperience: {
    possible: boolean;
    evidence: string[];
  };
};

const educationKeywords = ["ausbildung", "studium", "schule", "abschluss", "berufsschule"];
const experienceKeywords = ["berufserfahrung", "taetigkeit", "praxis", "verantwortlich", "erfahrung"];
const skillKeywords = ["kenntnisse", "skills", "faehigkeiten", "kompetenzen", "sap", "wms", "excel"];
const certificateKeywords = ["zertifikat", "zertifizierung", "schein", "lizenz", "staplerschein"];
const leadershipKeywords = ["teamleiter", "schichtleiter", "fuehrung", "personalverantwortung", "leitung"];
const positionKeywords = ["fachkraft", "disponent", "teamleiter", "schichtleiter", "lagerleiter", "operator"];

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
  return Array.from(new Set(values)).slice(0, 12);
}

function findName(lines: string[]) {
  const explicitName = lines.find((line) => /^name\s*:/i.test(line));

  if (explicitName) {
    return explicitName.replace(/^name\s*:/i, "").trim() || null;
  }

  return lines.find((line) => {
    const words = line.split(" ");
    return words.length >= 2 && words.length <= 4 && words.every((word) => /^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß-]+$/.test(word));
  }) ?? null;
}

function collectLines(lines: string[], keywords: string[]) {
  return unique(lines.filter((line) => includesAny(line, keywords)));
}

function collectEmployers(lines: string[]) {
  return unique(
    lines.filter((line) =>
      /\b(gmbh|ag|kg|ug|se|logistik|spedition|dhl|db schenker|dachser|kuehne|nagel)\b/i.test(line)
    )
  );
}

export function parseResumeText(text: string): ParsedResumeData {
  const lines = normalizeLines(text);
  const leadershipEvidence = collectLines(lines, leadershipKeywords);

  return {
    name: findName(lines),
    education: collectLines(lines, educationKeywords),
    workExperience: collectLines(lines, experienceKeywords),
    employers: collectEmployers(lines),
    positions: collectLines(lines, positionKeywords),
    skills: collectLines(lines, skillKeywords),
    certificates: collectLines(lines, certificateKeywords),
    leadershipExperience: {
      possible: leadershipEvidence.length > 0,
      evidence: leadershipEvidence
    }
  };
}
