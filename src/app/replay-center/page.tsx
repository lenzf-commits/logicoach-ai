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

function formatDate(value: string) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }
function formatTime(value: string) { return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
type ReplayCenterPageProps = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function ReplayCenterPage({ searchParams }: ReplayCenterPageProps) {
  const params = await searchParams;
  const interviews = await getUserInterviews();
  const replayItems = await Promise.all(interviews.map(async (interview) => {
    const [jobPosting, evaluation, messages] = await Promise.all([interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null, getInterviewEvaluationByInterviewId(interview.id), getInterviewMessages(interview.id)]);
    return { interview, jobPosting, evaluation, interviewCompleted: isInterviewCompleted(interview, messages) };
  }));
  const completedCount = replayItems.filter((item) => item.interviewCompleted).length;
  const evaluatedCount = replayItems.filter((item) => item.evaluation).length;

  return (
    <PageShell eyebrow="Replay" title="Replay Center" description="Finde deine vergangenen Trainings, höre dir deine Antworten noch einmal an und starte direkt die nächste Runde.">
      <section className="mb-6 rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-7"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Deine Trainingsbibliothek</p><h2 className="mt-2 text-2xl font-bold text-ink">Aus jedem Gespräch lernen</h2></div><Link href="/interview-vorbereitung" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90">Neue Runde starten <span className="ml-2" aria-hidden="true">→</span></Link></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-route/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-steel">Gespeicherte Trainings</p><p className="mt-1 text-2xl font-bold text-ink">{replayItems.length}</p></div><div className="rounded-lg bg-signal/10 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-steel">Abgeschlossen</p><p className="mt-1 text-2xl font-bold text-ink">{completedCount}</p></div><div className="rounded-lg bg-ink/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-steel">Mit Bewertung</p><p className="mt-1 text-2xl font-bold text-ink">{evaluatedCount}</p></div></div></section>
      {params.success || params.error ? <p className={`mb-6 rounded-lg border px-4 py-3 text-sm ${params.error ? "border-red-200 bg-red-50 text-red-700" : "border-route/20 bg-route/10 text-route"}`}>{params.error ?? params.success}</p> : null}
      {replayItems.length > 0 ? <div className="space-y-4">{replayItems.map(({ interview, jobPosting, evaluation, interviewCompleted }) => <section key={interview.id} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft transition hover:border-route/25 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-ink">{jobPosting?.title ?? "Interview ohne Stellenanzeige"}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${interviewCompleted ? "bg-route/10 text-route" : "bg-signal/20 text-ink"}`}>{interviewCompleted ? "Abgeschlossen" : "Offen"}</span></div><p className="mt-1 text-sm text-steel">{jobPosting?.company_name ?? "Unternehmen nicht angegeben"}</p><p className="mt-3 text-xs text-steel">{formatDate(interview.created_at)} · {formatTime(interview.created_at)} · Level {interview.level ?? "-"}</p></div><div className="rounded-lg bg-ink/5 px-4 py-3 text-right"><p className="text-xs text-steel">Bewertung</p><p className="mt-1 text-xl font-bold text-ink">{evaluation ? `${evaluation.overall_score}/100` : "–"}</p></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4"><p className="text-sm text-steel">Interviewer: {getInterviewerPersonaLabel(interview.persona)}</p><div className="flex flex-wrap gap-2">{!interviewCompleted ? <Link href={`/interview/${interview.id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-route px-4 py-2 text-sm font-semibold text-white transition hover:bg-route/90">Fortsetzen</Link> : null}<Link href={`/replay-center/${interview.id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5">Gespräch ansehen</Link><EvaluationAction interviewId={interview.id} hasEvaluation={Boolean(evaluation)} /><DeleteInterviewForm interviewId={interview.id} /></div></div></section>)}</div> : <section className="rounded-xl border border-dashed border-ink/20 bg-white p-10 text-center shadow-soft"><span className="text-5xl" aria-hidden="true">↺</span><h2 className="mt-4 text-xl font-semibold text-ink">Noch keine Trainings gespeichert</h2><p className="mx-auto mt-2 max-w-lg leading-7 text-steel">Sobald du dein erstes Interview startest, erscheint es hier und du kannst es später in Ruhe wiederholen.</p><div className="mt-6"><Link href="/interview-vorbereitung" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90">Erstes Interview vorbereiten</Link></div></section>}
    </PageShell>
  );
}
