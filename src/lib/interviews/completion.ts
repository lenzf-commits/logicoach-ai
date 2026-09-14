import type { Tables } from "@/types/database";

const CLOSING_QUESTION_MARKERS = ["ich habe aktuell keine weiteren fragen", "haben sie noch fragen an uns"];
const FINAL_FAREWELL_MARKERS = ["vielen dank fuer das gespraech", "vielen dank fuer das angenehme gespraech", "wir melden uns zeitnah", "ich wuensche ihnen einen erfolgreichen tag"];

function normalizeMessageContent(content: string) {
  return content.toLowerCase().replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss").replaceAll("Ã¼", "ue").replaceAll("Ã¤", "ae").replaceAll("Ã¶", "oe").replaceAll("ÃŸ", "ss");
}

export function hasClosingQuestion(messages: Tables<"interview_messages">[]) {
  return messages.some((message) => message.role === "interviewer" && CLOSING_QUESTION_MARKERS.every((marker) => normalizeMessageContent(message.content).includes(marker)));
}

export function hasFinalFarewell(messages: Tables<"interview_messages">[]) {
  return messages.some((message) => message.role === "interviewer" && FINAL_FAREWELL_MARKERS.some((marker) => normalizeMessageContent(message.content).includes(marker)));
}

export function isInterviewCompleted(interview: Tables<"interviews">, messages: Tables<"interview_messages">[]) {
  return interview.status === "completed" && hasFinalFarewell(messages);
}
