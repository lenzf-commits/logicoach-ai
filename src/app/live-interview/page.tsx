import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderCard } from "@/components/ui/placeholder-card";

export default function LiveInterviewPage() {
  return (
    <PageShell eyebrow="Training" title="Live Interview" description="Platzhalter fuer den spaeteren sprachbasierten Interviewmodus.">
      <PlaceholderCard title="Noch kein Audio" description="Phase 1 enthaelt bewusst keine Aufnahme, Sprachausgabe oder KI-Gespraechsfuehrung." />
    </PageShell>
  );
}
