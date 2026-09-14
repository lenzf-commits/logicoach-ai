import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { EvaluationAction } from "@/components/evaluation/evaluation-action";
import { DeleteInterviewForm } from "@/components/replay/delete-interview-form";
import { isInterviewCompleted } from "@/lib/interviews/completion";
import { getInterviewerPersonaLabel } from "@/lib/interviews/personas";
import { getInterviewEvaluationByInterviewId } from "@/lib/queries/interview-evaluations";
import { getInterviewMessages } from "@/lib/queries/interview-messages";
import { getUserInterviews } from "@/lib/queries/interviews";
import { getJobPostingById } from "@/lib/queries/job-postings";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

type ReplayCenterPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function ReplayCenterPage({ searchParams }: ReplayCenterPageProps) {
  const params = await searchParams;
  const interviews = await getUserInterviews();
  const replayItems = await Promise.all(
    interviews.map(async (interview) => {
      const [jobPosting, evaluation, messages] = await Promise.all([
        interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null,
        getInterviewEvaluationByInterviewId(interview.id),
        getInterviewMessages(interview.id)
      ]);

      return { interview, jobPosting, evaluation, interviewCompleted: isInterviewCompleted(interview, messages) };
    })
  );

  return (
    <PageShell
      eyebrow="Replay"
      title="Replay Center"
      description="Uebersicht deiner gespeicherten Interviewgespraeche."
    >
      {params.success || params.error ? (
        <p
          className={`mb-6 rounded-md border px-4 py-3 text-sm ${
            params.error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-route/20 bg-route/10 text-route"
          }`}
        >
          {params.error ?? params.success}
        </p>
      ) : null}

      {replayItems.length > 0 ? (
        <div className="space-y-4">
          {replayItems.map(({ interview, jobPosting, evaluation, interviewCompleted }) => (
            <section key={interview.id} className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    {jobPosting?.title ?? "Interview ohne Stellenanzeige"}
                  </h2>
                  <p className="mt-1 text-sm text-steel">
                    {jobPosting?.company_name ?? "Unternehmen nicht angegeben"}
                  </p>
                </div>

                <div className="grid gap-2 text-sm text-steel sm:grid-cols-2">
                  <p>Datum: {formatDate(interview.created_at)}</p>
                  <p>Uhrzeit: {formatTime(interview.created_at)}</p>
                  <p>Interviewer: {getInterviewerPersonaLabel(interview.persona)}</p>
                  <p>Level: {interview.level ?? "-"}</p>
                  <p>
                    Bewertung: {evaluation ? `${evaluation.overall_score} Punkte` : "Noch keine Bewertung"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!interviewCompleted ? (
                    <Link
                      href={`/interview/${interview.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
                    >
                      Fortsetzen
                    </Link>
                  ) : null}
                  <Link
                    href={`/replay-center/${interview.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5"
                  >
                    Gespraech ansehen
                  </Link>
                  <EvaluationAction interviewId={interview.id} hasEvaluation={Boolean(evaluation)} />
                  <DeleteInterviewForm interviewId={interview.id} />
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Noch keine Replays</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Sobald du ein Interview gestartet hast, erscheint es hier.
          </p>
        </section>
      )}
    </PageShell>
  );
}
