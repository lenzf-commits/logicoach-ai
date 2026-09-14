import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";

export default function LiveInterviewPage() {
  return (
    <PageShell eyebrow="Training" title="Live Interview" description="Übe dein Bewerbungsgespräch mit einem KI-Gegenüber. Der Sprachmodus wird Schritt für Schritt ausgebaut.">
      <section className="overflow-hidden rounded-xl bg-asphalt p-6 text-white shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5"><div><span className="inline-flex rounded-full bg-signal px-3 py-1 text-xs font-bold text-ink">In Vorbereitung</span><h2 className="mt-4 text-2xl font-bold sm:text-3xl">Bald sprichst du direkt mit der KI.</h2><p className="mt-3 max-w-2xl leading-7 text-white/70">Starte Gespräche per Mikrofon, höre natürliche Antworten und übe spontane Rückfragen – mit einer Textalternative, wenn du lieber schreibst.</p></div><span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl" aria-hidden="true">◉</span></div>
        <div className="mt-7 flex flex-wrap gap-3"><ButtonLink href="/interview-vorbereitung">Textinterview starten</ButtonLink><ButtonLink href="/#vision" variant="secondary-dark">Vision ansehen</ButtonLink></div>
      </section>
      <div className="mt-6 grid gap-5 md:grid-cols-3">{[["Sprechen", "Mikrofon einschalten und Antworten frei formulieren."], ["Zuhören", "Die KI reagiert auf das Gesagte und stellt passende Rückfragen."], ["Reflektieren", "Transkript und Feedback nach dem Gespräch nachvollziehen."]].map(([title, text]) => <section key={title} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft"><span className="text-2xl text-route" aria-hidden="true">✦</span><h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2><p className="mt-2 leading-7 text-steel">{text}</p></section>)}</div>
      <p className="mt-6 text-sm leading-6 text-steel">Der Sprachmodus ist noch nicht verfügbar. Deine bisherigen Textinterviews findest du in der Vorbereitung und im Replay Center.</p>
    </PageShell>
  );
}
