"use server";

import { redirect } from "next/navigation";
import {
  AiCoachingReportError,
  generateAiCoachingReport
} from "@/lib/ai/coaching-report";
import { evaluateInterviewMessages } from "@/lib/evaluation/rule-based-evaluator";
import { getInterviewById } from "@/lib/queries/interviews";
import { getInterviewMessages } from "@/lib/queries/interview-messages";
import {
  createInterviewEvaluation,
  getInterviewEvaluationForOwnedInterview,
  updateInterviewEvaluationForOwnedInterview
} from "@/lib/queries/interview-evaluations";
import { getJobPostingById } from "@/lib/queries/job-postings";
import { getResumeById } from "@/lib/queries/resumes";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function ensureRuleBasedEvaluation(interviewId: string) {
  const existingEvaluation = await getInterviewEvaluationForOwnedInterview(interviewId);

  if (existingEvaluation) {
    console.log("AI coaching evaluation query branch", "existing_evaluation_found");
    return existingEvaluation;
  }

  console.log("AI coaching evaluation query branch", "missing_evaluation_create_rule_based");

  const interview = await getInterviewById(interviewId);

  if (!interview) {
    return null;
  }

  const messages = await getInterviewMessages(interview.id);
  const candidateMessages = messages.filter((message) => message.role === "candidate");

  if (candidateMessages.length === 0) {
    throw new Error("Für eine Bewertung brauchst du mindestens eine Kandidatenantwort.");
  }

  const evaluation = evaluateInterviewMessages(messages);

  const createdEvaluation = await createInterviewEvaluation({
    interview_id: interview.id,
    ...evaluation
  });

  console.log("AI coaching evaluation query branch", "rule_based_evaluation_created");

  return createdEvaluation;
}

export async function generateEvaluationAction(formData: FormData) {
  const interviewId = getFormString(formData, "interviewId");

  if (!interviewId) {
    redirect("/dashboard");
  }

  const existingEvaluation = await ensureRuleBasedEvaluation(interviewId);

  if (existingEvaluation) {
    redirect(`/auswertung/${interviewId}`);
  }

  redirect("/dashboard");
}

export async function generateAiCoachingReportAction(formData: FormData) {
  const interviewId = getFormString(formData, "interviewId");

  if (!interviewId) {
    redirect("/dashboard");
  }

  const interview = await getInterviewById(interviewId);

  if (!interview) {
    redirect("/dashboard");
  }

  let evaluation = await getInterviewEvaluationForOwnedInterview(interview.id);

  console.log("AI coaching evaluation before coaching", {
    found: Boolean(evaluation),
    id: evaluation?.id,
    interviewId: interview.id,
    hasAiCoaching: Boolean(evaluation?.ai_created_at)
  });

  if (!evaluation) {
    try {
      evaluation = await ensureRuleBasedEvaluation(interview.id);
    } catch (error) {
      console.error("AI coaching rule-based evaluation creation failed", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      const message = error instanceof Error ? error.message : "Regelbasierte Bewertung konnte nicht erstellt werden.";
      redirect(`/interview/${interview.id}?error=${encodeURIComponent(message)}`);
    }
  }

  if (!evaluation) {
    redirect("/dashboard");
  }

  console.log("AI coaching evaluation id used for update", evaluation.id);

  if (evaluation.ai_created_at) {
    redirect(`/auswertung/${interview.id}`);
  }

  const [messages, resume, jobPosting] = await Promise.all([
    getInterviewMessages(interview.id),
    interview.resume_id ? getResumeById(interview.resume_id) : null,
    interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null
  ]);

  try {
    const report = await generateAiCoachingReport({
      interview,
      messages,
      resume,
      jobPosting,
      evaluation
    });

    await updateInterviewEvaluationForOwnedInterview(interview.id, {
      ai_summary: report.summary,
      ai_strengths: report.strengths,
      ai_weaknesses: report.weaknesses,
      ai_recommendations: report.recommendations,
      ai_top_risks: report.topRisks,
      ai_improved_answers: report.improvedAnswers,
      ai_created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("AI coaching generation failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      openAiResponseBody: error instanceof AiCoachingReportError ? error.openAiResponseBody : undefined,
      supabaseUpdateError: error && typeof error === "object" && "code" in error ? error : undefined
    });

    const message =
      error instanceof AiCoachingReportError && error.openAiResponseBody
        ? `OpenAI Coaching fehlgeschlagen: ${error.openAiResponseBody.slice(0, 500)}`
        : error instanceof Error
          ? error.message
          : "KI-Coaching konnte nicht erstellt werden.";

    redirect(`/auswertung/${interview.id}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/auswertung/${interview.id}`);
}
