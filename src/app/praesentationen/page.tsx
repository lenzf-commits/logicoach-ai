import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";

export default function PresentationsPage() {
  return (
    <PageShell
      eyebrow="Präsentationstraining"
      title="Deine Bühne zum Üben."
      description="Bereite dich künftig mit LogiCoach auf Referate, Uni-Präsentationen und Vorträge vor – mit einem KI-Publikum, das zuhört und nachfragt."
    >
      <section className="rounded-xl border border-signal/40 bg-signal/10 p-6 sm:p-8">
        <span className="inline-flex rounded-full bg-signal px-3 py-1 text-xs font-bold text-ink">In Planung</span>
        <h2 className="mt-4 text-xl font-semibold">Präsentationen üben kommt als eigener Trainingsmodus.</h2>
        <p className="mt-3 max-w-2xl leading-7 text-steel">Hier wirst du deinen Vortrag halten, Rückfragen beantworten und Feedback erhalten können. Das Präsentationstraining ist noch nicht verfügbar.</p>
      </section>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          ["Vortrag vorbereiten", "Thema, Zielgruppe und Dauer festlegen und deine Präsentationsmaterialien als Kontext bereitstellen."],
          ["Vor der KI präsentieren", "Deinen Vortrag frei halten und mit einem KI-Publikum eine passende Fragerunde durchspielen."],
          ["Gezieltes Feedback erhalten", "Aufbau, Verständlichkeit, Zeitmanagement und deinen Umgang mit Rückfragen reflektieren."]
        ].map(([title, description]) => (
          <section key={title} className="rounded-xl border border-ink/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-steel">Geplant</p>
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-steel">{description}</p>
          </section>
        ))}
      </div>
      <div className="mt-8"><ButtonLink href="/#vision" variant="secondary">Mehr über unsere Vision</ButtonLink></div>
    </PageShell>
  );
}
