import Link from "next/link";
import { notFound } from "next/navigation";
import { EvaluationAction } from "@/components/evaluation/evaluation-action";
import { PageShell } from "@/components/layout/page-shell";
import { isInterviewCompleted } from "@/lib/interviews/completion";
import { getInterviewerPersonaLabel } from "@/lib/interviews/personas";
import { getInterviewEvaluationByInterviewId } from "@/lib/queries/interview-evaluations";
import { getInterviewMessages } from "@/lib/queries/interview-messages";
import { getInterviewById } from "@/lib/queries/interviews";
import { getJobPostingById } from "@/lib/queries/job-postings";

type ReplayDetailPageProps = {
  params: Promise<{
    interviewId: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function ReplayDetailPage({ params }: ReplayDetailPageProps) {
  const { interviewId } = await params;
  const interview = await getInterviewById(interviewId);

  if (!interview) {
    notFound();
  }

  const [messages, jobPosting, evaluation] = await Promise.all([
    getInterviewMessages(interview.id),
    interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null,
    getInterviewEvaluationByInterviewId(interview.id)
  ]);
  const interviewCompleted = isInterviewCompleted(interview, messages);

  return (
    <PageShell
      eyebrow="Replay"
      title={jobPosting?.title ?? "Interview Replay"}
      description={`${jobPosting?.company_name ?? "Unternehmen nicht angegeben"} - ${formatDateTime(interview.created_at)}`}
    >
      <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 text-sm text-steel">
            <p>Interviewer: {getInterviewerPersonaLabel(interview.persona)}</p>
            <p>Kandidat: Du</p>
            <p>Level: {interview.level ?? "-"}</p>
            <p>Bewertung: {evaluation ? `${evaluation.overall_score} Punkte` : "Noch keine Bewertung"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!interviewCompleted ? (
              <Link
                href={`/interview/${interview.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
              >
                Interview fortsetzen
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center justify-center rounded-md border border-route/20 bg-route/10 px-5 py-2.5 text-sm font-semibold text-route">
                Interview abgeschlossen
              </span>
            )}
            <EvaluationAction interviewId={interview.id} hasEvaluation={Boolean(evaluation)} />
            <Link
              href="/replay-center"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5"
            >
              Zurueck zur Liste
            </Link>
          </div>
        </div>

        {messages.length > 0 ? (
          <div className="mt-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-md border p-4 ${
                  message.role === "interviewer"
                    ? "border-route/20 bg-route/10"
                    : "border-ink/10 bg-white"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-steel">
                  {message.role === "interviewer" ? getInterviewerPersonaLabel(interview.persona) : "Kandidat"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{message.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm leading-6 text-steel">
            Fuer dieses Interview gibt es noch keinen gespeicherten Verlauf.
          </p>
        )}
      </section>
    </PageShell>
  );
}
