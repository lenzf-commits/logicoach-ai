import { ButtonLink } from "@/components/ui/button-link";
import { PlaceholderCard } from "@/components/ui/placeholder-card";

export default function LandingPage() {
  return (
    <main>
      <section className="bg-asphalt text-white">
        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-signal">Phase 2 Auth & Database</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">LogiCoach AI</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
              Der deutschsprachige Interviewtrainer fuer Logistikfachkraefte. Diese Version enthaelt das Projektgeruest, Supabase Auth und die ersten Datenbanktabellen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register">Kostenlos starten</ButtonLink>
              <ButtonLink href="/dashboard" variant="secondary">Dashboard ansehen</ButtonLink>
            </div>
          </div>
          <div className="grid content-center gap-4">
            <div className="rounded-lg border border-white/14 bg-white/8 p-5">
              <p className="text-sm font-semibold text-signal">Logistik-Fokus</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Vorbereitung auf Gesprache fuer Lagerlogistik, Disposition, Schichtleitung und Operations.</p>
            </div>
            <div className="rounded-lg border border-white/14 bg-white/8 p-5">
              <p className="text-sm font-semibold text-signal">Spaeter mit KI-Coach</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Analyse, Feedback, Replay und Fortschrittssystem werden in den naechsten Phasen angebunden.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <PlaceholderCard title="Vorbereiten" description="Lebenslauf und Stellenanzeige werden spaeter fuer das Interviewprofil genutzt." />
        <PlaceholderCard title="Trainieren" description="Das Live Interview bleibt ein Platzhalter ohne Audio oder KI-Logik." />
        <PlaceholderCard title="Verbessern" description="Auswertung und Replay Center sind als Zielbereiche bereits angelegt." />
      </section>
    </main>
  );
}
