"use server";

import { revalidatePath } from "next/cache";
import { generateReplayAnalysis } from "@/lib/ai/replay-analysis";
import { generateReplayOverall } from "@/lib/ai/replay-overall";
import { getInterviewById } from "@/lib/queries/interviews";
import { getInterviewMessages } from "@/lib/queries/interview-messages";
import { getJobPostingById } from "@/lib/queries/job-postings";
import { getResumeById } from "@/lib/queries/resumes";
import { getReplayAnalysis, replayInputHash, saveReplayAnalysis } from "@/lib/queries/replay-analyses";
import { readReplayAnalysis } from "@/lib/replay/answer-feedback";

export async function analyzeReplayAction(_previous: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  try {
    const interviewId = formData.get("interviewId");
    const mode = formData.get("mode") === "overall" ? "overall" : "answers";
    if (typeof interviewId !== "string" || !/^[0-9a-f-]{36}$/i.test(interviewId)) throw new Error("Interview nicht gefunden.");
    const interview = await getInterviewById(interviewId);
    if (!interview) throw new Error("Interview nicht gefunden. Bitte melde dich an.");
    const [messages, resume, job, existing] = await Promise.all([
      getInterviewMessages(interview.id), interview.resume_id ? getResumeById(interview.resume_id) : null,
      interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null, getReplayAnalysis(interview.id)
    ]);
    if (!existing.available) throw new Error("Die Antwortanalyse wird noch eingerichtet. Bitte versuche es später erneut.");
    const resumeText = resume?.extracted_text ?? resume?.content_text ?? "";
    const jobDescription = job?.description ?? "";
    const inputHash = replayInputHash(messages, resumeText, jobDescription);
    if (mode === "overall") {
      const current = existing.data?.input_hash === inputHash ? readReplayAnalysis(existing.data.report) : null;
      if (!current) throw new Error("Erstelle zuerst die Antwortanalyse, bevor du die Gesamtauswertung startest.");
      const overall = await generateReplayOverall({ analysis: current, messages, resumeText, jobDescription });
      await saveReplayAnalysis(interview.id, inputHash, { ...current, overall });
    } else if (existing.data?.input_hash !== inputHash) {
      const report = await generateReplayAnalysis({ messages, resumeText, jobDescription });
      await saveReplayAnalysis(interview.id, inputHash, report);
    }
    revalidatePath(`/replay-center/${interview.id}`);
    revalidatePath("/replay-center");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Die Analyse konnte nicht erstellt werden. Bitte versuche es erneut." };
  }
}
