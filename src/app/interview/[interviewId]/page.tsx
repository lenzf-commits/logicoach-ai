import Link from "next/link";
import { notFound } from "next/navigation";
import { EvaluationAction } from "@/components/evaluation/evaluation-action";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderCard } from "@/components/ui/placeholder-card";
import { generateInterviewQuestion } from "@/lib/ai/interview-engine";
import { isInterviewCompleted } from "@/lib/interviews/completion";
import { getInterviewerPersonaLabel } from "@/lib/interviews/personas";
import {
  getInterviewById,
  updateInterviewStatus
} from "@/lib/queries/interviews";
import {
  createInitialInterviewerMessage,
  getInterviewMessages
} from "@/lib/queries/interview-messages";
import { getResumeById } from "@/lib/queries/resumes";
import { getJobPostingById } from "@/lib/queries/job-postings";
import { getInterviewEvaluationByInterviewId } from "@/lib/queries/interview-evaluations";
import { sendCandidateAnswerAction } from "./actions";

type InterviewDetailPageProps = {
  params: Promise<{
    interviewId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

async function ensureInterviewStarted(interviewId: string) {
  const interview = await getInterviewById(interviewId);

  if (!interview) {
    return { interview: null, resume: null, jobPosting: null, messages: [], error: null };
  }

  const [resume, jobPosting, messages] = await Promise.all([
    interview.resume_id ? getResumeById(interview.resume_id) : null,
    interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null,
    getInterviewMessages(interview.id)
  ]);

  console.log("messages count", messages.length);

  if (messages.length > 0) {
    return { interview, resume, jobPosting, messages, error: null };
  }

  try {
    console.log("creating initial interviewer message", interview.id);

    const firstQuestion = await generateInterviewQuestion({
      interview,
      resume,
      jobPosting,
      messages: []
    });

    const initialMessage = await createInitialInterviewerMessage(interview.id, firstQuestion);
    console.log("initial message created", initialMessage.id);

    const updatedInterview = await updateInterviewStatus(interview.id, "active");
    const updatedMessages = await getInterviewMessages(interview.id);
    console.log("messages count", updatedMessages.length);
    const visibleMessages = updatedMessages.length > 0 ? updatedMessages : [initialMessage];

    return { interview: updatedInterview, resume, jobPosting, messages: visibleMessages, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interview konnte nicht gestartet werden.";
    console.error("initial interviewer message error", error);
    return { interview, resume, jobPosting, messages, error: message };
  }
}

export default async function InterviewDetailPage({ params, searchParams }: InterviewDetailPageProps) {
  const { interviewId } = await params;
  const query = await searchParams;
  const { interview, resume, jobPosting, messages, error } = await ensureInterviewStarted(interviewId);

  if (!interview) {
    notFound();
  }

  const visibleError = query.error ?? error;
  const evaluation = await getInterviewEvaluationByInterviewId(interview.id);
  const interviewCompleted = isInterviewCompleted(interview, messages);

  return (
    <PageShell
      eyebrow="Interview"
      title="Textbasiertes Interview"
      description="Phase 6: Text-Chat mit KI-Interviewer. Audio, Speech-to-Text und Bewertung folgen spaeter."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <PlaceholderCard title="Lebenslauf" description={resume?.file_name ?? "Kein Lebenslauf ausgewaehlt."} />
        <PlaceholderCard
          title="Stellenanzeige"
          description={jobPosting ? `${jobPosting.title}${jobPosting.company_name ? ` bei ${jobPosting.company_name}` : ""}` : "Keine Stellenanzeige ausgewaehlt."}
        />
        <PlaceholderCard
          title="Setup"
          description={`${interview.duration_minutes ?? "-"} Minuten, Level ${interview.level ?? "-"}, ${getInterviewerPersonaLabel(interview.persona)}, Status: ${interview.status}`}
        />
      </div>

      {visibleError ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {visibleError}
        </p>
      ) : null}

      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Interview-Chat</h2>
        <div className="mt-5 space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg border p-4 ${
                  message.role === "interviewer"
                    ? "border-route/20 bg-route/10"
                    : "border-ink/10 bg-white"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-steel">
                  {message.role === "interviewer" ? "Interviewer" : "Kandidat"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{message.content}</p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-steel">
              Noch keine Nachrichten gespeichert.
            </p>
          )}
        </div>

        {interviewCompleted ? (
          <div className="mt-6 rounded-md border border-route/20 bg-route/10 p-4">
            <p className="text-sm font-semibold text-route">Interview abgeschlossen</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <EvaluationAction interviewId={interview.id} hasEvaluation={Boolean(evaluation)} />
              <Link
                href="/replay-center"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5"
              >
                Replay Center oeffnen
              </Link>
            </div>
          </div>
        ) : (
          <form action={sendCandidateAnswerAction} className="mt-6 space-y-3">
            <input type="hidden" name="interviewId" value={interview.id} />
            <label className="block text-sm font-medium text-ink">
              Deine Antwort
              <textarea
                name="content"
                required
                rows={5}
                className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
            >
              Antwort senden
            </button>
          </form>
        )}
      </section>
    </PageShell>
  );
}
