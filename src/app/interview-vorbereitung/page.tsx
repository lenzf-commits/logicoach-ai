import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderCard } from "@/components/ui/placeholder-card";
import { ResumeUploadForm } from "@/components/resumes/resume-upload-form";
import { JobPostingForm } from "@/components/job-postings/job-posting-form";
import { InterviewSessionForm } from "@/components/interviews/interview-session-form";
import { getUserResumes } from "@/lib/queries/resumes";
import { getUserJobPostings } from "@/lib/queries/job-postings";

type InterviewPreparationPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    jobError?: string;
    jobSuccess?: string;
    interviewError?: string;
  }>;
};

export default async function InterviewPreparationPage({ searchParams }: InterviewPreparationPageProps) {
  const params = await searchParams;
  const resumes = await getUserResumes();
  const jobPostings = await getUserJobPostings();

  return (
    <PageShell eyebrow="Vorbereitung" title="Interview Vorbereitung" description="Lade deinen Lebenslauf hoch und speichere die passende Stellenanzeige fuer die spaetere Interviewvorbereitung.">
      <div className="mb-6">
        <InterviewSessionForm
          resumes={resumes}
          jobPostings={jobPostings}
          error={params.interviewError}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ResumeUploadForm error={params.error} success={params.success} />
        <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Gespeicherte Lebenslaeufe</h2>
          {resumes.length > 0 ? (
            <div className="mt-4 space-y-3">
              {resumes.map((resume) => (
                <div key={resume.id} className="rounded-md border border-ink/10 p-3">
                  <p className="truncate text-sm font-semibold text-ink">{resume.file_name}</p>
                  <p className="mt-1 text-xs text-steel">
                    {resume.extracted_text ? "Text extrahiert" : "Noch kein Text gespeichert"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-steel">Noch kein Lebenslauf hochgeladen.</p>
          )}
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <JobPostingForm error={params.jobError} success={params.jobSuccess} />
        <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Gespeicherte Stellenanzeigen</h2>
          {jobPostings.length > 0 ? (
            <div className="mt-4 space-y-3">
              {jobPostings.map((jobPosting) => (
                <div key={jobPosting.id} className="rounded-md border border-ink/10 p-3">
                  <p className="truncate text-sm font-semibold text-ink">{jobPosting.title}</p>
                  <p className="mt-1 truncate text-xs text-steel">
                    {jobPosting.company_name ?? "Unternehmen nicht angegeben"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-steel">Noch keine Stellenanzeige gespeichert.</p>
          )}
        </section>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PlaceholderCard title="Interview Engine" description="Die eigentliche Interview-Engine wird in Phase 6 implementiert." />
      </div>
    </PageShell>
  );
}
