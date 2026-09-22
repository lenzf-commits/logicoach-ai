import { PageShell } from "@/components/layout/page-shell";
import { PresentationSetup } from "@/components/presentations/presentation-setup";

export default function PresentationsPage() {
  return (
    <PageShell
      eyebrow="Präsentationstraining"
      title="Deine Bühne zum Üben."
      description="Lege Thema, Fach, Niveau und Dauer fest. Bereite deinen Vortrag mit einem passenden Ablauf und kritischen Rückfragen vor."
    >
      <PresentationSetup />
    </PageShell>
  );
}
