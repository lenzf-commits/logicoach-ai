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

type ReplayDetailPageProps = { params: Promise<{ interviewId: string }> };
function formatDateTime(value: string) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export default async function ReplayDetailPage({ params }: ReplayDetailPageProps) {
  const { interviewId } = await params;
  const interview = await getInterviewById(interviewId);
  if (!interview) notFound();
  const [messages, jobPosting, evaluation] = await Promise.all([getInterviewMessages(interview.id), interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null, getInterviewEvaluationByInterviewId(interview.id)]);
  const interviewCompleted = isInterviewCompleted(interview, messages);
  const recruiterMessages = messages.filter((message) => message.role === "interviewer").length;
  const candidateMessages = messages.filter((message) => message.role === "candidate").length;
  const score = evaluation?.overall_score;

  return (
    <PageShell eyebrow="Replay" title={jobPosting?.title ?? "Interview Replay"} description={`${jobPosting?.company_name ?? "Unternehmen nicht angegeben"} · ${formatDateTime(interview.created_at)}`}>
      <section className="overflow-hidden rounded-xl bg-asphalt p-6 text-white shadow-soft sm:p-8"><div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">Dein Trainings-Replay</p><h2 className="mt-2 text-2xl font-bold">Schau dir deinen Fortschritt an.</h2><p className="mt-2 text-sm leading-6 text-white/70">Jede Wiederholung macht dir deine Antworten vertrauter. Achte beim nächsten Durchlauf auf eine konkrete Verbesserung.</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${interviewCompleted ? "bg-route/20 text-emerald-200" : "bg-signal/20 text-signal"}`}>{interviewCompleted ? "✓ Abgeschlossen" : "○ Offen"}</span></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-white/10 p-4"><p className="text-xs text-white/60">Fragen beantwortet</p><p className="mt-1 text-2xl font-bold text-signal">{candidateMessages}</p></div><div className="rounded-lg bg-white/10 p-4"><p className="text-xs text-white/60">Gesprächsbeiträge</p><p className="mt-1 text-2xl font-bold text-white">{messages.length}</p></div><div className="rounded-lg bg-white/10 p-4"><p className="text-xs text-white/60">Bewertung</p><p className="mt-1 text-2xl font-bold text-signal">{score !== undefined ? `${score}/100` : "–"}</p></div></div><div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70"><span className="rounded-full bg-white/10 px-3 py-1.5">⚡ Level {interview.level ?? 1}</span><span className="rounded-full bg-white/10 px-3 py-1.5">🎯 {getInterviewerPersonaLabel(interview.persona)}</span><span className="rounded-full bg-white/10 px-3 py-1.5">🔥 Nächste Runde bringt neue XP</span></div></section>
      <div className="mt-6 flex flex-wrap gap-2">{!interviewCompleted ? <Link href={`/interview/${interview.id}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90">Interview fortsetzen <span className="ml-2" aria-hidden="true">→</span></Link> : null}{evaluation ? <Link href={`/auswertung/${interview.id}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-route/20 bg-route/10 px-5 py-2.5 text-sm font-semibold text-route transition hover:bg-route/20">Bericht ansehen</Link> : <EvaluationAction interviewId={interview.id} hasEvaluation={false} />}<Link href="/replay-center" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5">← Zurück zur Liste</Link></div>
      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Gesprächsverlauf</p><h2 className="mt-2 text-xl font-semibold text-ink">Deine Antworten im Kontext</h2></div><span className="text-sm text-steel">{recruiterMessages} KI-Beiträge · {candidateMessages} Antworten</span></div>{messages.length > 0 ? <div className="mt-6 space-y-4">{messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.role === "candidate" ? "justify-end" : ""}`}><span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${message.role === "interviewer" ? "bg-route/10 text-route" : "order-2 bg-signal text-ink"}`}>{message.role === "interviewer" ? "KI" : "Du"}</span><div className={`max-w-3xl rounded-2xl p-4 text-sm leading-6 ${message.role === "interviewer" ? "rounded-tl-md border border-route/15 bg-route/5 text-ink" : "rounded-tr-md bg-ink/5 text-ink"}`}><p className="mb-1 text-xs font-bold uppercase tracking-wide text-steel">{message.role === "interviewer" ? getInterviewerPersonaLabel(interview.persona) : "Deine Antwort"}</p><p className="whitespace-pre-wrap">{message.content}</p></div></div>)}</div> : <p className="mt-6 text-sm leading-6 text-steel">Für dieses Interview gibt es noch keinen gespeicherten Verlauf.</p>}</section>
    </PageShell>
  );
}
