"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateInterviewQuestion } from "@/lib/ai/interview-engine";
import { getJobPostingById } from "@/lib/queries/job-postings";
import { getResumeById } from "@/lib/queries/resumes";
import { getInterviewById } from "@/lib/queries/interviews";
import {
  hasClosingQuestion,
  hasFinalFarewell
} from "@/lib/interviews/completion";
import {
  createInterviewMessage,
  getInterviewMessages
} from "@/lib/queries/interview-messages";
import { addXpToUser } from "@/lib/queries/progress";
import type { Tables } from "@/types/database";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getTargetQuestionCount(durationMinutes: number | null) {
  if (durationMinutes && durationMinutes <= 10) {
    return 6;
  }

  if (durationMinutes && durationMinutes >= 20) {
    return 10;
  }

  return 8;
}

function shouldAskClosingQuestion(
  interview: Tables<"interviews">,
  messages: Tables<"interview_messages">[]
) {
  if (hasClosingQuestion(messages)) {
    return false;
  }

  const interviewerQuestionCount = messages.filter((message) => message.role === "interviewer").length;
  const candidateAnswerCount = messages.filter((message) => message.role === "candidate").length;
  const targetQuestionCount = getTargetQuestionCount(interview.duration_minutes);
  const elapsedMinutes = (Date.now() - new Date(interview.created_at).getTime()) / 60_000;
  const durationReached = Boolean(interview.duration_minutes && elapsedMinutes >= interview.duration_minutes);

  return interviewerQuestionCount >= targetQuestionCount || (candidateAnswerCount >= 4 && durationReached);
}

function buildClosingQuestion() {
  return [
    "Vielen Dank fuer Ihre Antworten. Ich habe aktuell keine weiteren Fragen.",
    "Wir haben ueber Ihren Werdegang, Ihre Motivation und Ihre Erfahrungen gesprochen.",
    "Zum Abschluss interessiert mich noch: Haben Sie noch Fragen an uns?"
  ].join("\n\n");
}

function buildFinalGoodbye() {
  return [
    "Vielen Dank fuer Ihre Rueckfrage. Die Details zum weiteren Ablauf und zu den Rahmenbedingungen klaeren wir im naechsten Schritt gern transparent.",
    "Vielen Dank fuer das Gespraech. Wir melden uns zeitnah bei Ihnen.",
    "Ich wuensche Ihnen einen erfolgreichen Tag."
  ].join("\n\n");
}

export async function sendCandidateAnswerAction(formData: FormData) {
  const interviewId = getFormString(formData, "interviewId");
  const content = getFormString(formData, "content");

  if (!interviewId) {
    redirect("/interview-vorbereitung");
  }

  if (!content) {
    redirect(`/interview/${interviewId}?error=Bitte gib eine Antwort ein.`);
  }

  const interview = await getInterviewById(interviewId);

  if (!interview) {
    redirect("/interview-vorbereitung");
  }

  const [resume, jobPosting, existingMessages] = await Promise.all([
    interview.resume_id ? getResumeById(interview.resume_id) : null,
    interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null,
    getInterviewMessages(interview.id)
  ]);

  if (interview.status === "completed" && hasFinalFarewell(existingMessages)) {
    redirect(`/interview/${interview.id}`);
  }

  await createInterviewMessage({
    interview_id: interview.id,
    role: "candidate",
    content
  });

  try {
    const messagesWithAnswer = [
      ...existingMessages,
      {
        id: "pending",
        interview_id: interview.id,
        user_id: interview.user_id,
        role: "candidate" as const,
        content,
        message_order: existingMessages.length + 1,
        created_at: new Date().toISOString()
      }
    ];

    if (hasClosingQuestion(existingMessages) && !hasFinalFarewell(existingMessages)) {
      await createInterviewMessage({
        interview_id: interview.id,
        role: "interviewer",
        content: buildFinalGoodbye()
      });

      try {
        await addXpToUser(interview.id);
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("bereits abgeschlossen")) {
          throw error;
        }
      }

      revalidatePath(`/interview/${interview.id}`);
      revalidatePath("/dashboard");
      redirect(`/interview/${interview.id}`);
    }

    if (shouldAskClosingQuestion(interview, messagesWithAnswer)) {
      await createInterviewMessage({
        interview_id: interview.id,
        role: "interviewer",
        content: buildClosingQuestion()
      });

      revalidatePath(`/interview/${interview.id}`);
      redirect(`/interview/${interview.id}`);
    }

    const question = await generateInterviewQuestion({
      interview,
      resume,
      jobPosting,
      messages: messagesWithAnswer
    });

    await createInterviewMessage({
      interview_id: interview.id,
      role: "interviewer",
      content: question
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Die naechste Frage konnte nicht erzeugt werden.";
    redirect(`/interview/${interview.id}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/interview/${interview.id}`);
  redirect(`/interview/${interview.id}`);
}

export async function completeInterviewAction(formData: FormData) {
  const interviewId = getFormString(formData, "interviewId");

  if (!interviewId) {
    redirect("/interview-vorbereitung");
  }

  try {
    await addXpToUser(interviewId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interview konnte nicht abgeschlossen werden.";
    redirect(`/interview/${interviewId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
