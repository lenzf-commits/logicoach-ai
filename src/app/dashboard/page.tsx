import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { getUserAchievements, getUserProgress } from "@/lib/queries/progress";

export default async function DashboardPage() {
  const [progress, achievements] = await Promise.all([
    getUserProgress(),
    getUserAchievements()
  ]);

  if (!progress) {
    redirect("/login?next=/dashboard");
  }

  return (
    <PageShell eyebrow="Uebersicht" title="Dashboard" description={`Angemeldet als ${progress.profile.email}. Verfolge Level, XP und Trainingsfortschritt.`}>
      <ProgressOverview progress={progress} achievements={achievements} />
    </PageShell>
  );
}
