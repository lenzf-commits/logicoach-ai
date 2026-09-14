import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { getUserAchievements, getUserProgress } from "@/lib/queries/progress";

export default async function DashboardPage() {
  const [progress, achievements] = await Promise.all([getUserProgress(), getUserAchievements()]);

  if (!progress) redirect("/login?next=/dashboard");

  return (
    <PageShell eyebrow="Übersicht" title="Dein Dashboard" description={`Angemeldet als ${progress.profile.email}. Verfolge Level, XP und Trainingsfortschritt.`}>
      <section className="mb-6 overflow-hidden rounded-xl bg-asphalt p-6 text-white shadow-soft sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">Dein nächster Schritt</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">Bereit für eine neue Runde?</h2><p className="mt-2 max-w-xl leading-7 text-white/70">Ein kurzes Training bringt dich deiner nächsten sicheren Antwort näher. Halte deine Serie am Leben und sammle XP.</p></div>
          <ButtonLink href="/interview-vorbereitung">Training starten</ButtonLink>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/75"><span className="rounded-full bg-white/10 px-3 py-1.5">🔥 Lernserie aufbauen</span><span className="rounded-full bg-white/10 px-3 py-1.5">⚡ XP sammeln</span><span className="rounded-full bg-white/10 px-3 py-1.5">🎯 Antworten verbessern</span></div>
      </section>
      <ProgressOverview progress={progress} achievements={achievements} />
    </PageShell>
  );
}
