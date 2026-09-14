import type { Achievement } from "@/lib/progress/achievements";
import type { getUserProgress } from "@/lib/queries/progress";

type ProgressOverviewProps = { progress: NonNullable<Awaited<ReturnType<typeof getUserProgress>>>; achievements: Achievement[] };

export function ProgressOverview({ progress, achievements }: ProgressOverviewProps) {
  const { profile, nextLevel, xpForCurrentLevel, xpNeededForNextLevel, progressPercent } = progress;
  const xpLabel = nextLevel ? `${xpForCurrentLevel} / ${xpNeededForNextLevel} XP` : `${profile.current_xp} XP`;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Dein Fortschritt</p><h2 className="mt-2 text-3xl font-bold text-ink">Level {profile.current_level}</h2><p className="mt-2 text-sm text-steel">{xpLabel}</p></div><div className="rounded-full bg-signal/15 px-3 py-1.5 text-sm font-semibold text-ink">Nächstes Ziel: {nextLevel ? `Level ${nextLevel.level}` : "Max Level"}</div></div>
        <div className="mt-5 h-4 w-full overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-route transition" style={{ width: `${progressPercent}%` }} /></div>
        <p className="mt-2 text-right text-xs font-semibold text-steel">{progressPercent}% bis zum nächsten Level</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-ink/10 bg-route/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-steel">Aktuelle XP</p><p className="mt-2 text-2xl font-bold text-ink">{profile.current_xp}</p></div>
          <div className="rounded-xl border border-ink/10 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-steel">Interviews abgeschlossen</p><p className="mt-2 text-2xl font-bold text-ink">{profile.total_interviews_completed}</p></div>
          <div className="rounded-xl border border-ink/10 bg-signal/10 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-steel">Längste Serie</p><p className="mt-2 text-2xl font-bold text-ink">{profile.longest_streak_days} Tage</p></div>
        </div>
      </section>
      <section className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Deine Meilensteine</p><h2 className="mt-2 text-lg font-semibold text-ink">Achievements</h2></div><p className="text-sm text-steel">Sammle XP und schalte neue Ziele frei.</p></div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">{achievements.map((achievement) => <div key={achievement.code} className={`rounded-xl border p-4 ${achievement.unlocked ? "border-route/20 bg-route/10" : "border-ink/10 bg-white"}`}><p className="text-sm font-semibold text-ink">{achievement.title}</p><p className="mt-1 text-xs leading-5 text-steel">{achievement.description}</p><p className="mt-2 text-xs font-semibold text-route">{achievement.unlocked ? "Freigeschaltet" : "Gesperrt"}</p></div>)}</div>
      </section>
    </div>
  );
}
