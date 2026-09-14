import type { Tables } from "@/types/database";

const CLOSING_QUESTION_MARKERS = [
  "ich habe aktuell keine weiteren fragen",
  "haben sie noch fragen an uns"
];

const FINAL_FAREWELL_MARKERS = [
  "vielen dank fuer das gespraech",
  "vielen dank fuer das angenehme gespraech",
  "wir melden uns zeitnah",
  "ich wuensche ihnen einen erfolgreichen tag"
];

function normalizeMessageContent(content: string) {
  return content
    .toLowerCase()
    .replaceAll("ü", "ue")
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ß", "ss");
}

export function hasClosingQuestion(messages: Tables<"interview_messages">[]) {
  return messages.some((message) => {
    if (message.role !== "interviewer") {
      return false;
    }

    const content = normalizeMessageContent(message.content);
    return CLOSING_QUESTION_MARKERS.every((marker) => content.includes(marker));
  });
}

export function hasFinalFarewell(messages: Tables<"interview_messages">[]) {
  return messages.some((message) => {
    if (message.role !== "interviewer") {
      return false;
    }

    const content = normalizeMessageContent(message.content);
    return FINAL_FAREWELL_MARKERS.some((marker) => content.includes(marker));
  });
}

export function isInterviewCompleted(
  interview: Tables<"interviews">,
  messages: Tables<"interview_messages">[]
) {
  return interview.status === "completed" && hasFinalFarewell(messages);
}
