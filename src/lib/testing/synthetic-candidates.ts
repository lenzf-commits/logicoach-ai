import type { Tables } from "../../types/database";

export type SyntheticCandidateId = "strong" | "uncertain" | "active";

export type SyntheticCandidate = {
  id: SyntheticCandidateId;
  label: string;
  description: string;
  answerQuestion: (question: string, turn: number) => string;
};

export const testResume: Tables<"resumes"> = {
  id: "00000000-0000-0000-0000-000000000101",
  user_id: "00000000-0000-0000-0000-000000000001",
  file_name: "synthetischer-lebenslauf-logistikleitung.pdf",
  file_path: null,
  content_text: null,
  extracted_text: [
    "Max Fetzko",
    "Teamleiter Logistik bei Astemo Logistics GmbH, 2020 bis heute.",
    "Fuehrung von 18 Mitarbeitenden im Wareneingang, Warenausgang und in der Kommissionierung.",
    "Verantwortlich fuer Schichtuebergaben, SAP EWM Buchungen, Bestandsklaerung und Prozessverbesserung.",
    "Vorher Schichtleiter bei RheinCargo Services, Schwerpunkt Tourenplanung, Inventur und Kennzahlen.",
    "Erfolge: Reduktion von Bestandsabweichungen um 18 Prozent, Einarbeitung von 12 neuen Mitarbeitenden, Einfuehrung eines kurzen Shopfloor-Boards.",
    "Zertifikate: Ausbilderschein AEVO, Staplerschein, Lean Basics."
  ].join("\n"),
  parsed_data: {
    name: "Max Fetzko",
    employers: ["Astemo Logistics GmbH", "RheinCargo Services"],
    positions: ["Teamleiter Logistik", "Schichtleiter"],
    skills: ["SAP EWM", "WMS", "Kommissionierung", "Inventur", "Schichtplanung"],
    leadership: true
  },
  created_at: "2026-07-10T10:00:00.000Z",
  updated_at: "2026-07-10T10:00:00.000Z"
};

export const testJobPosting: Tables<"job_postings"> = {
  id: "00000000-0000-0000-0000-000000000201",
  user_id: "00000000-0000-0000-0000-000000000001",
  title: "Teamleiter Logistik / Schichtleitung Distribution",
  company_name: "NordLog Supply Chain GmbH",
  description: [
    "NordLog Supply Chain GmbH sucht eine Teamleitung fuer ein wachsendes Distributionszentrum.",
    "Die Rolle fuehrt ca. 25 Mitarbeitende in Wareneingang, Warenausgang, Kommissionierung und Schichtuebergabe.",
    "Aufgaben: Tagessteuerung, Priorisierung bei Personalausfall, Bestandsklaerung, Eskalationen, Prozessverbesserung und Einarbeitung neuer Mitarbeitender.",
    "Anforderungen: Erfahrung in Fuehrung, SAP EWM oder vergleichbarem WMS, Kennzahlensteuerung, Schichtplanung, klare Kommunikation und Konfliktloesung.",
    "Das Team arbeitet im Zwei-Schicht-System. Die Einarbeitung erfolgt strukturiert ueber vier Wochen mit Operations, HR und Standortleitung.",
    "Wichtige Kennzahlen sind Pickleistung, Fehlerquote, Rueckstand, Bestandstreue und termingerechter Versand."
  ].join("\n"),
  parsed_data: {
    jobTitle: "Teamleiter Logistik / Schichtleitung Distribution",
    company: "NordLog Supply Chain GmbH",
    leadership: "ca. 25 Mitarbeitende",
    systems: ["SAP EWM", "WMS"],
    tasks: ["Tagessteuerung", "Personalausfall", "Bestandsklaerung", "Prozessverbesserung"],
    shifts: "Zwei-Schicht-System"
  },
  created_at: "2026-07-10T10:00:00.000Z",
  updated_at: "2026-07-10T10:00:00.000Z"
};

function includesAny(text: string, terms: string[]) {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

export const syntheticCandidates: SyntheticCandidate[] = [
  {
    id: "strong",
    label: "Guter Bewerber",
    description: "Antwortet konkret, nennt Beispiele, stellt Rueckfragen und hat passende Erfahrung.",
    answerQuestion(question, turn) {
      if (includesAny(question, ["fragen an uns", "rueckfragen", "fragen sie"])) {
        return "Ja, gerne. Wie gross ist das Team aktuell, und wie sieht die Einarbeitung in den ersten Wochen aus?";
      }

      if (includesAny(question, ["stellen sie sich", "ueber sich"])) {
        return "Gerne. Ich bin Max Fetzko und arbeite seit mehreren Jahren in der operativen Logistik. Aktuell fuehre ich bei Astemo ein Team von 18 Mitarbeitenden im Wareneingang und Warenausgang. Besonders wichtig ist mir, Prozesse klar zu steuern und Mitarbeitende so einzubinden, dass die Schicht stabil laeuft.";
      }

      if (includesAny(question, ["motivation", "wechseln", "unternehmen", "rolle"])) {
        return "Ich moechte wechseln, weil ich mehr Verantwortung in einem groesseren Distributionsumfeld uebernehmen will. Die Kombination aus Teamfuehrung, Kennzahlen und SAP EWM passt sehr gut zu meiner Erfahrung. Mich reizt besonders, dass das Team waechst und Prozesse aktiv verbessert werden sollen.";
      }

      if (includesAny(question, ["sap", "ewm", "wms", "bestand", "wareneingang", "warenausgang", "kommissionierung"])) {
        return "Ein Beispiel war eine wiederkehrende Bestandsabweichung im Warenausgang. Ich habe mit dem Team die Buchungsschritte in SAP EWM geprueft, eine Fehlerquelle bei der Schichtuebergabe gefunden und kurze Kontrollpunkte eingefuehrt. Dadurch sank die Abweichung innerhalb von zwei Monaten um etwa 18 Prozent.";
      }

      if (includesAny(question, ["team", "fuehr", "mitarbeit", "konflikt", "schicht"])) {
        return "Ich fuehre sehr klar ueber Erwartungen, kurze taegliche Abstimmungen und regelmaessiges Feedback. Bei Konflikten spreche ich die Beteiligten zeitnah an und klaere erst Fakten, dann Loesungen. In einer Schichtplanung habe ich zum Beispiel Qualifikationen neu verteilt, damit Engpaesse bei Staplerfahrern nicht jeden Montag eskalieren.";
      }

      if (includesAny(question, ["schwaeche", "kritisch", "einstellen", "unterscheidet"])) {
        return "Meine groesste Staerke ist, dass ich operative Probleme strukturiert angehe und Menschen mitnehme. Kritisch an mir ist, dass ich manchmal zu schnell selbst eine Loesung vorschlage. Daran arbeite ich, indem ich im Team zuerst Ursachen und Ideen abfrage.";
      }

      return `Ich wuerde das an einem konkreten Beispiel erklaeren: In meiner letzten Rolle habe ich zuerst die Fakten aufgenommen, dann mit dem Team die Ursache eingegrenzt und eine kurze Massnahme vereinbart. Wichtig war mir, das Ergebnis nach ein bis zwei Wochen anhand der Kennzahl zu pruefen. (${turn})`;
    }
  },
  {
    id: "uncertain",
    label: "Unsicherer Bewerber",
    description: "Antwortet teilweise kurz, nutzt Fuellwoerter und weiss gelegentlich keine Antwort.",
    answerQuestion(question, turn) {
      if (includesAny(question, ["fragen an uns", "rueckfragen", "fragen sie"])) {
        return "Vielleicht nur kurz: Wie laeuft denn die Einarbeitung ab?";
      }

      if (turn % 5 === 0 || includesAny(question, ["beispiel", "konkret"])) {
        return "Dazu faellt mir gerade kein konkretes Beispiel ein. Ich habe solche Situationen zwar erlebt, aber ich muesste kurz ueberlegen.";
      }

      if (includesAny(question, ["stellen sie sich", "ueber sich"])) {
        return "Also, ich bin Max und arbeite in der Logistik. Ich habe schon Teams begleitet und kenne Wareneingang und Warenausgang. Ich bin eher ruhig, aber zuverlaessig.";
      }

      if (includesAny(question, ["sap", "ewm", "wms", "bestand"])) {
        return "Ich habe mit SAP EWM gearbeitet, aber eher im Tagesgeschaeft. Also Buchungen pruefen, Bestand klaeren und solche Sachen. Ganz tief technisch war ich nicht immer drin.";
      }

      if (includesAny(question, ["team", "fuehr", "konflikt", "mitarbeit"])) {
        return "Ich habe ein kleines Team gefuehrt. Aehm, meistens lief das gut. Wenn es Konflikte gab, habe ich versucht, ruhig zu bleiben und mit den Leuten zu sprechen.";
      }

      return "Also, ich wuerde sagen, ich gehe das eher praktisch an. Man schaut, was gerade das Problem ist, spricht mit den Leuten und versucht dann, eine Loesung zu finden.";
    }
  },
  {
    id: "active",
    label: "Gespraechsaktiver Bewerber",
    description: "Stellt Fragen zu Unternehmen, Team, Aufgaben, Einarbeitung und Fuehrungskultur.",
    answerQuestion(question, turn) {
      if (includesAny(question, ["fragen an uns", "rueckfragen", "fragen sie"])) {
        return "Ja. Wie gross ist das Team genau, wie ist die Schichtplanung organisiert und welche Aufgaben haben in den ersten drei Monaten Prioritaet?";
      }

      if (turn === 2) {
        return "Ich komme aus der Schichtleitung und habe Teams im Wareneingang und Warenausgang gefuehrt. Bevor ich tiefer einsteige: Wie wuerden Sie die Fuehrungskultur bei NordLog beschreiben?";
      }

      if (turn === 5) {
        return "Das passt grundsaetzlich. Mich wuerde interessieren, ob die Einarbeitung eher ueber einen festen Mentor laeuft oder ueber mehrere Bereiche verteilt ist.";
      }

      if (includesAny(question, ["sap", "ewm", "wms", "kennzahl", "prozess"])) {
        return "Bei SAP EWM habe ich vor allem mit Buchungskorrekturen, Bestandsklaerung und Rueckstandslisten gearbeitet. Wenn Kennzahlen abwichen, habe ich erst geprueft, ob es ein Prozess- oder ein Kapazitaetsthema war.";
      }

      if (includesAny(question, ["team", "fuehr", "mitarbeit", "konflikt"])) {
        return "Ich fuehre gerne nah an der Schicht. Bei Konflikten hole ich die Beteiligten kurz zusammen, klaere Erwartungen und vereinbare einen konkreten naechsten Schritt. Wie viel Entscheidungsspielraum hat die Teamleitung bei Ihnen im Alltag?";
      }

      return "Ich wuerde zuerst die operative Lage klaeren, dann Prioritaeten setzen und die Schicht transparent informieren. Mir ist wichtig, dass die Mannschaft versteht, warum etwas Vorrang hat.";
    }
  }
];
