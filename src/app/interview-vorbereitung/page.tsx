import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderCard } from "@/components/ui/placeholder-card";
import { ResumeUploadForm } from "@/components/resumes/resume-upload-form";
import { JobPostingForm } from "@/components/job-postings/job-posting-form";
import { InterviewSessionForm } from "@/components/interviews/interview-session-form";
import { getUserResumes } from "@/lib/queries/resumes";
import { getUserJobPostings } from "@/lib/queries/job-postings";

type InterviewPreparationPageProps = { searchParams: Promise<{ error?: string; success?: string; jobError?: string; jobSuccess?: string; interviewError?: string }> };

export default async function InterviewPreparationPage({ searchParams }: InterviewPreparationPageProps) {
  const params = await searchParams;
  const resumes = await getUserResumes();
  const jobPostings = await getUserJobPostings();

  return (
    <PageShell eyebrow="Vorbereitung" title="Dein Interview vorbereiten" description="In drei kurzen Schritten erstellst du eine persönliche Übungssession für deine Zielposition.">
      <section className="mb-6 rounded-xl border border-route/15 bg-route/5 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[['1', 'Kontext hinzufügen', 'Lebenslauf und Stellenanzeige geben der KI die richtigen Anhaltspunkte.'], ['2', 'Session einstellen', 'Wähle Dauer, Level und die Persona für dein Gespräch.'], ['3', 'Training starten', 'Beantworte Fragen und erhalte direkt danach deine Auswertung.']].map(([number, title, text]) => <div key={number} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-route font-bold text-white">{number}</span><div><h2 className="font-semibold text-ink">{title}</h2><p className="mt-1 text-sm leading-6 text-steel">{text}</p></div></div>)}
        </div>
      </section>
      <div className="mb-6"><InterviewSessionForm resumes={resumes} jobPostings={jobPostings} error={params.interviewError} /></div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ResumeUploadForm error={params.error} success={params.success} />
        <section className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-ink">Gespeicherte Lebensläufe</h2><span className="rounded-full bg-route/10 px-2.5 py-1 text-xs font-bold text-route">{resumes.length}</span></div>{resumes.length > 0 ? <div className="mt-4 space-y-3">{resumes.map((resume) => <div key={resume.id} className="rounded-lg border border-ink/10 p-3"><p className="truncate text-sm font-semibold text-ink">{resume.file_name}</p><p className="mt-1 text-xs text-steel">{resume.extracted_text ? "Text extrahiert" : "Noch kein Text gespeichert"}</p></div>)}</div> : <p className="mt-3 text-sm leading-6 text-steel">Noch kein Lebenslauf hochgeladen.</p>}</section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <JobPostingForm error={params.jobError} success={params.jobSuccess} />
        <section className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-ink">Gespeicherte Stellenanzeigen</h2><span className="rounded-full bg-route/10 px-2.5 py-1 text-xs font-bold text-route">{jobPostings.length}</span></div>{jobPostings.length > 0 ? <div className="mt-4 space-y-3">{jobPostings.map((jobPosting) => <div key={jobPosting.id} className="rounded-lg border border-ink/10 p-3"><p className="truncate text-sm font-semibold text-ink">{jobPosting.title}</p><p className="mt-1 truncate text-xs text-steel">{jobPosting.company_name ?? "Unternehmen nicht angegeben"}</p></div>)}</div> : <p className="mt-3 text-sm leading-6 text-steel">Noch keine Stellenanzeige gespeichert.</p>}</section>
      </div>
      <div className="mt-6"><PlaceholderCard title="Deine persönliche Interview-Session" description="Sobald Lebenslauf und Stellenanzeige vorhanden sind, kannst du oben eine Session erstellen." /></div>
    </PageShell>
  );
}
