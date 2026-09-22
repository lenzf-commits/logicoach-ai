import Link from "next/link";
import { notFound } from "next/navigation";
import { EvaluationAction } from "@/components/evaluation/evaluation-action";
import { PageShell } from "@/components/layout/page-shell";
import { AnalyzeReplayForm } from "@/components/replay/analyze-replay-form";
import { isInterviewCompleted } from "@/lib/interviews/completion";
import { getInterviewerPersonaLabel } from "@/lib/interviews/personas";
import { getInterviewEvaluationByInterviewId } from "@/lib/queries/interview-evaluations";
import { getInterviewMessages } from "@/lib/queries/interview-messages";
import { getInterviewById } from "@/lib/queries/interviews";
import { getJobPostingById } from "@/lib/queries/job-postings";
import { getResumeById } from "@/lib/queries/resumes";
import { getReplayAnalysis, replayInputHash } from "@/lib/queries/replay-analyses";
import { readReplayAnalysis, type AnswerFeedback, type ReplayAnalysis, type ReplayOverall } from "@/lib/replay/answer-feedback";

type ReplayDetailPageProps = { params: Promise<{ interviewId: string }> };
const buttonClass = "inline-flex min-h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5";

function FeedbackDetails({ feedback }: { feedback: AnswerFeedback }) {
  return <details open className="mt-3 overflow-hidden rounded-xl border border-amber-300 bg-white">
    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-amber-950">💡 Tipp und bessere Formulierung ansehen <span className="float-right text-amber-700">⌄</span></summary>
    <div className="space-y-4 border-t border-amber-200 p-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-red-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-red-800">🔎 Hier liegt der Hebel</p><p className="mt-1 leading-6 text-red-950">{feedback.reason}</p></div>
        <div className="rounded-lg bg-signal/10 p-3"><p className="text-xs font-bold uppercase tracking-wide text-route">💡 Dein Tipp</p><p className="mt-1 leading-6 text-ink">{feedback.tip}</p></div>
      </div>
      <blockquote className="border-l-2 border-amber-400 pl-3 text-xs leading-5 text-steel">Deine Stelle: „{feedback.answerQuote}“</blockquote>
      <div className="rounded-xl border border-route/20 bg-route/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-route">✨ So könntest du es sagen</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{feedback.improvedAnswer}</p><p className="mt-2 text-xs leading-5 text-steel">Passe den Vorschlag an deine echte Erfahrung an.</p></div>
      {feedback.resumeQuote ? <details className="text-xs"><summary className="cursor-pointer font-bold text-route">📄 Bezug zu deinem Lebenslauf</summary><blockquote className="mt-2 border-l-2 border-route/40 pl-3 leading-5 text-steel">„{feedback.resumeQuote}“</blockquote></details> : null}
    </div>
  </details>;
}

function OverallSummary({ overall, interviewId }: { overall: ReplayOverall; interviewId: string }) {
  return <div className="mt-4 rounded-xl border border-route/20 bg-white p-4 shadow-sm">
    <p className="text-sm leading-6 text-ink">{overall.summary}</p>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <details className="rounded-lg bg-route/5 p-3"><summary className="cursor-pointer text-sm font-bold text-route">✅ Was schon gut sitzt</summary><ul className="mt-2 space-y-1.5 text-sm leading-6 text-steel">{overall.strengths.map((item, index) => <li key={index}>• {item}</li>)}</ul></details>
      <details className="rounded-lg bg-amber-50 p-3"><summary className="cursor-pointer text-sm font-bold text-amber-900">🎯 Dein nächster Hebel</summary><ul className="mt-2 space-y-1.5 text-sm leading-6 text-steel">{overall.weaknesses.map((item, index) => <li key={index}>• {item}</li>)}</ul></details>
    </div>
    <details className="mt-2 rounded-lg bg-ink/5 p-3"><summary className="cursor-pointer text-sm font-bold text-ink">🧭 Tipps für die nächste Runde</summary><ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-6 text-steel">{overall.recommendations.map((item, index) => <li key={index}>{item}</li>)}</ol></details>
    <div className="mt-3 rounded-lg bg-signal/15 p-3 text-sm leading-6 text-ink"><strong>🏋️ Deine nächste Übung</strong><p className="mt-1 text-sm leading-6">{overall.nextExercise}</p></div>
    <AnalyzeReplayForm interviewId={interviewId} mode="overall" label="Gesamtauswertung neu berechnen" />
  </div>;
}

function OverallActionCard({ analysis, interviewId }: { analysis: ReplayAnalysis; interviewId: string }) {
  return <div className="mt-5 border-t-2 border-route/20 pt-5"><div className="rounded-2xl border-2 border-route/35 bg-route/5 p-4 shadow-md sm:p-5"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex rounded-full bg-route px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">Schritt 3 · Abschluss</span><h3 className="mt-3 text-lg font-bold text-ink">📊 Gesamtauswertung freischalten</h3><p className="mt-1 max-w-xl text-sm leading-6 text-steel">Ein Klick bündelt deine Stärken, Lernfelder und die nächste Übung.</p></div><span className="text-3xl" aria-hidden="true">🚀</span></div>{analysis.overall ? <OverallSummary overall={analysis.overall} interviewId={interviewId} /> : <AnalyzeReplayForm interviewId={interviewId} mode="overall" label="Ausführliche Gesamtauswertung erstellen" />}</div></div>;
}

export default async function ReplayDetailPage({ params }: ReplayDetailPageProps) {
  const { interviewId } = await params;
  const interview = await getInterviewById(interviewId);
  if (!interview) notFound();
  const [messages, jobPosting, evaluation, resume, storedAnalysis] = await Promise.all([
    getInterviewMessages(interview.id),
    interview.job_posting_id ? getJobPostingById(interview.job_posting_id) : null,
    getInterviewEvaluationByInterviewId(interview.id),
    interview.resume_id ? getResumeById(interview.resume_id) : null,
    getReplayAnalysis(interview.id)
  ]);
  const interviewCompleted = isInterviewCompleted(interview, messages);
  const candidateMessages = messages.filter((message) => message.role === "candidate");
  const resumeText = resume?.extracted_text ?? resume?.content_text ?? "";
  const currentHash = replayInputHash(messages, resumeText, jobPosting?.description ?? "");
  const analysis = storedAnalysis.data?.input_hash === currentHash ? readReplayAnalysis(storedAnalysis.data.report) : null;
  const attentionAnswers = analysis?.answers.filter((answer) => answer.verdict === "weak" || answer.verdict === "needs_improvement") ?? [];
  const feedbackByMessage = new Map(attentionAnswers.map((answer) => [answer.messageId, answer]));
  const answerAnalysisByMessage = new Map(analysis?.answers.map((answer) => [answer.messageId, answer]) ?? []);
  const evaluatedCount = analysis?.answers.filter((answer) => answer.verdict !== "not_assessable").length ?? 0;
  const adequateCount = analysis?.answers.filter((answer) => answer.verdict === "adequate").length ?? 0;
  const progressPercent = evaluatedCount > 0 ? Math.round((adequateCount / evaluatedCount) * 100) : 0;
  const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(interview.created_at));
  const firstAttentionId = attentionAnswers[0]?.messageId;

  return <PageShell eyebrow="Replay" title={jobPosting?.title ?? "Interview Replay"} description={`${jobPosting?.company_name ?? "Unternehmen nicht angegeben"} · ${date}`}>
    <section className="rounded-2xl bg-asphalt p-5 text-white shadow-soft sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">🎮 Dein Lern-Replay</p><h2 className="mt-2 text-2xl font-bold">Kleine Runde. Nächster Fortschritt.</h2><p className="mt-2 text-sm text-white/70">Finde deinen wichtigsten Hebel und übe genau ihn.</p></div><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{interviewCompleted ? "✓ Abgeschlossen" : "○ Offen"}</span></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-white/10 p-3"><p className="text-xl">🗣️</p><p className="mt-1 text-xs text-white/65">Antworten</p><p className="text-xl font-bold">{candidateMessages.length}</p></div><div className="rounded-xl bg-white/10 p-3"><p className="text-xl">🎯</p><p className="mt-1 text-xs text-white/65">Zum Üben</p><p className="text-xl font-bold text-signal">{analysis ? attentionAnswers.length : "–"}</p></div><div className="rounded-xl bg-white/10 p-3"><p className="text-xl">🏆</p><p className="mt-1 text-xs text-white/65">Trainingsscore</p><p className="text-xl font-bold">{evaluation ? `${evaluation.overall_score}/100` : "–"}</p></div></div>
      {analysis ? <div className="mt-5"><div className="flex justify-between text-xs font-semibold text-white/75"><span>✅ {adequateCount} von {evaluatedCount} Antworten sitzen</span><span>{progressPercent}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-signal transition-all" style={{ width: `${progressPercent}%` }} /></div></div> : null}
      <p className="mt-4 text-xs text-white/60">Level {interview.level ?? 1} · {getInterviewerPersonaLabel(interview.persona)} · Schritt {analysis ? "2" : "1"} von 3</p>
    </section>

    <div className="mt-4 flex flex-wrap gap-2">{!interviewCompleted ? <Link href={`/interview/${interview.id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-route px-4 py-2 text-sm font-semibold text-white hover:bg-route/90">▶ Weiter üben</Link> : null}{firstAttentionId ? <a href={`#answer-${firstAttentionId}`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-ink hover:bg-signal/80">🎯 Wichtigsten Tipp öffnen</a> : null}<EvaluationAction interviewId={interview.id} hasEvaluation={Boolean(evaluation)} /><Link href="/replay-center" className={buttonClass}>← Replay-Liste</Link></div>

    <section aria-labelledby="analysis-title" className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="text-2xl">🎯</span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-900">Dein Feedback</p><h2 id="analysis-title" className="mt-1 text-xl font-bold text-ink">{analysis ? attentionAnswers.length ? `${attentionAnswers.length} Lernkarten warten auf dich` : "Stark – keine klaren Lernfelder gefunden" : "Bereit für deinen Lerncheck?"}</h2></div></div>
      {analysis ? <>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white px-3 py-1.5 text-route">✅ {adequateCount} gut beantwortet</span><span className="rounded-full bg-white px-3 py-1.5 text-amber-900">🛠️ {attentionAnswers.length} verbessern</span><span className="rounded-full bg-white px-3 py-1.5 text-steel">ℹ️ {analysis.answers.length - evaluatedCount} ohne Bewertung</span></div>
        {attentionAnswers.length > 0 ? <nav aria-label="Markierte Antworten" className="mt-4 flex flex-wrap gap-2">{attentionAnswers.map((feedback) => <a key={feedback.messageId} href={`#answer-${feedback.messageId}`} className="rounded-lg border border-amber-400 bg-white px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100">⚑ Antwort {candidateMessages.findIndex((message) => message.id === feedback.messageId) + 1}</a>)}</nav> : null}
        <OverallActionCard analysis={analysis} interviewId={interview.id} />
      </> : !storedAnalysis.available ? <p className="mt-3 text-sm text-amber-950">Die Antwortanalyse wird noch eingerichtet. Dein Gespräch bleibt lesbar.</p>
        : candidateMessages.length ? <>{storedAnalysis.data ? <p className="mt-3 text-sm font-medium text-amber-950">Neue Lernlogik verfügbar – starte die Analyse erneut.</p> : <p className="mt-3 text-sm text-steel">Die KI prüft jede Antwort und zeigt dir nur konkrete Lernchancen.</p>}<AnalyzeReplayForm interviewId={interview.id} refresh={Boolean(storedAnalysis.data)} /></>
        : <p className="mt-3 text-sm text-steel">Die Analyse steht nach deiner ersten Antwort bereit.</p>}
    </section>

    <section className="mt-5 rounded-2xl border-2 border-route/20 bg-white p-4 shadow-soft sm:p-6"><div className="-m-4 mb-4 flex items-center justify-between gap-3 rounded-t-2xl border-b border-route/15 bg-route/5 p-4 sm:-m-6 sm:mb-5 sm:p-5"><div><div className="flex items-center gap-2"><span className="inline-flex rounded-full bg-signal px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">Schritt 2 · Üben</span><span className="text-lg" aria-hidden="true">📚</span></div><h2 className="mt-2 text-xl font-bold text-ink">Lernkarten</h2><p className="mt-1 text-xs text-steel">Öffne eine Karte, nimm den Tipp mit, geh weiter.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-steel">{candidateMessages.length} Antworten</span></div>
      {messages.length ? <div className="mt-5 space-y-3">{messages.map((message) => {
        const feedback = feedbackByMessage.get(message.id);
        const answerAnalysis = answerAnalysisByMessage.get(message.id);
        const candidate = message.role === "candidate";
        if (!candidate) return <div key={message.id} className="flex gap-2 rounded-xl border border-route/15 bg-route/5 p-3 text-sm leading-6"><span className="shrink-0 text-lg">🤖</span><div><p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-route">{getInterviewerPersonaLabel(interview.persona)}</p><p>{message.content}</p></div></div>;
        return <article id={`answer-${message.id}`} key={message.id} className="scroll-mt-6"><div className={`rounded-xl border p-4 ${feedback ? feedback.verdict === "weak" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50" : "border-ink/10 bg-white"}`}><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wide text-steel">🗣️ Deine Antwort</p>{feedback ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${feedback.verdict === "weak" ? "bg-red-200 text-red-950" : "bg-amber-200 text-amber-950"}`}>{feedback.verdict === "weak" ? "⚠️ Üben" : "💡 Ausbauen"}</span> : answerAnalysis?.verdict === "adequate" ? <span className="rounded-full bg-route/10 px-2.5 py-1 text-[10px] font-bold text-route">✅ Sitzt</span> : null}</div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{message.content}</p>{feedback ? <FeedbackDetails feedback={feedback} /> : null}</div></article>;
      })}</div> : <p className="mt-4 text-sm text-steel">Für dieses Interview gibt es noch keinen gespeicherten Verlauf.</p>}
    </section>
  </PageShell>;
}
