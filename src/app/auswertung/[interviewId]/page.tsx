import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderCard } from "@/components/ui/placeholder-card";
import { generateAiCoachingReportAction } from "@/app/evaluation-actions";
import { getInterviewEvaluationByInterviewId } from "@/lib/queries/interview-evaluations";
import { getInterviewById } from "@/lib/queries/interviews";

type EvaluationPageProps = {
  params: Promise<{
    interviewId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  return (
    <div className="rounded-md border border-ink/10 p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 text-2xl font-bold text-route">{score}</p>
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-steel">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CompactFeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-ink/10 p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm leading-6 text-steel">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-steel">Keine Eintraege vorhanden.</p>
      )}
    </div>
  );
}

export default async function EvaluationDetailPage({ params, searchParams }: EvaluationPageProps) {
  const { interviewId } = await params;
  const query = await searchParams;
  const [interview, evaluation] = await Promise.all([
    getInterviewById(interviewId),
    getInterviewEvaluationByInterviewId(interviewId)
  ]);

  if (!interview || !evaluation) {
    notFound();
  }

  return (
    <PageShell
      eyebrow="Auswertung"
      title="Regelbasierte Bewertung"
      description="Diese erste Bewertung nutzt einfache Regeln und keine OpenAI API."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/replay-center"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
        >
          Zurueck zur Replay-Liste
        </Link>
        <Link
          href={`/replay-center/${interview.id}`}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5"
        >
          Gespraech ansehen
        </Link>
      </div>

      {query.error ? (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <PlaceholderCard title="Gesamtbewertung" description={`${evaluation.overall_score} von 100 Punkten`} />
        <PlaceholderCard title="Fuellwoerter" description={`${evaluation.filler_word_count} erkannt`} />
        <PlaceholderCard title="Antwortlaenge" description={`${evaluation.average_answer_length} Woerter im Durchschnitt`} />
      </div>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Einzelkategorien</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          <ScoreCard title="Selbstpraesentation" score={evaluation.self_presentation_score} />
          <ScoreCard title="Kommunikation" score={evaluation.communication_score} />
          <ScoreCard title="Struktur" score={evaluation.structure_score} />
          <ScoreCard title="Logistikbezug" score={evaluation.logistics_keywords_score} />
          <ScoreCard title="Selbstbewusstsein" score={evaluation.confidence_score} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <FeedbackList title="Staerken" items={asStringList(evaluation.strengths)} />
        <FeedbackList title="Schwaechen" items={asStringList(evaluation.weaknesses)} />
        <FeedbackList title="Empfehlungen" items={asStringList(evaluation.recommendations)} />
      </div>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">KI-Coaching-Bericht</h2>
            <p className="mt-2 text-sm leading-6 text-steel">
              Zusatzbericht mit konkretem Feedback auf Basis des gespeicherten Interviewverlaufs.
            </p>
          </div>
          {!evaluation.ai_created_at ? (
            <form action={generateAiCoachingReportAction}>
              <input type="hidden" name="interviewId" value={interview.id} />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
              >
                KI-Coaching erstellen
              </button>
            </form>
          ) : null}
        </div>

        {evaluation.ai_created_at ? (
          <div className="mt-6 space-y-6">
            {evaluation.ai_summary ? (
              <div>
                <h3 className="text-sm font-semibold text-ink">Zusammenfassung</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-steel">{evaluation.ai_summary}</p>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <CompactFeedbackList title="KI-Staerken" items={asStringList(evaluation.ai_strengths)} />
              <CompactFeedbackList title="KI-Schwaechen" items={asStringList(evaluation.ai_weaknesses)} />
              <CompactFeedbackList title="Top-Risiken" items={asStringList(evaluation.ai_top_risks)} />
              <CompactFeedbackList title="Konkrete Empfehlungen" items={asStringList(evaluation.ai_recommendations)} />
            </div>

            <CompactFeedbackList title="Bessere Beispielantworten" items={asStringList(evaluation.ai_improved_answers)} />
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-steel">
            Noch kein KI-Coaching vorhanden. Der Bericht wird erst erstellt, wenn du den Button anklickst.
          </p>
        )}
      </section>
    </PageShell>
  );
}
