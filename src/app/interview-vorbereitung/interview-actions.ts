"use server";

import { redirect } from "next/navigation";
import { createInterview } from "@/lib/queries/interviews";
import { getResumeById } from "@/lib/queries/resumes";
import { getJobPostingById } from "@/lib/queries/job-postings";
import { interviewerPersonas } from "@/lib/interviews/personas";

const allowedDurations = [10, 15, 20];
const allowedPersonaValues = interviewerPersonas.map((persona) => persona.value);

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  const params = new URLSearchParams({ interviewError: message });
  redirect(`/interview-vorbereitung?${params.toString()}`);
}

export async function createInterviewAction(formData: FormData) {
  const resumeId = getFormString(formData, "resumeId");
  const jobPostingId = getFormString(formData, "jobPostingId");
  const durationMinutes = Number(getFormString(formData, "durationMinutes"));
  const level = Number(getFormString(formData, "level"));
  const persona = getFormString(formData, "persona");

  if (!resumeId) {
    redirectWithError("Bitte wähle einen Lebenslauf aus.");
  }

  if (!jobPostingId) {
    redirectWithError("Bitte wähle eine Stellenanzeige aus.");
  }

  if (!allowedDurations.includes(durationMinutes)) {
    redirectWithError("Bitte wähle eine Interviewdauer von 10, 15 oder 20 Minuten.");
  }

  if (!Number.isInteger(level) || level < 1 || level > 10) {
    redirectWithError("Bitte wähle ein Schwierigkeitslevel zwischen 1 und 10.");
  }

  if (!allowedPersonaValues.includes(persona as never)) {
    redirectWithError("Bitte wähle eine gültige Interviewer-Persona.");
  }

  const [resume, jobPosting] = await Promise.all([
    getResumeById(resumeId),
    getJobPostingById(jobPostingId)
  ]);

  if (!resume) {
    redirectWithError("Der ausgewählte Lebenslauf wurde nicht gefunden.");
  }

  if (!jobPosting) {
    redirectWithError("Die ausgewählte Stellenanzeige wurde nicht gefunden.");
  }

  const interview = await createInterview({
    resume_id: resume.id,
    job_posting_id: jobPosting.id,
    duration_minutes: durationMinutes,
    level,
    persona,
    status: "ready"
  });

  redirect(`/interview/${interview.id}`);
}
