import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderCard } from "@/components/ui/placeholder-card";

export default function EvaluationPage() {
  return (
    <PageShell eyebrow="Feedback" title="Auswertung" description="Spaeter stehen hier Gesamtscore, Kategorien, Staerken, Schwaechen und konkrete Verbesserungen.">
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard title="Score" description="Platzhalter fuer die Bewertung von 0 bis 100." />
        <PlaceholderCard title="Kategorien" description="Platzhalter fuer Fachwissen, Kommunikation, Selbstpraesentation und weitere Kriterien." />
      </div>
    </PageShell>
  );
}
