import { createInterviewAction } from "@/app/interview-vorbereitung/interview-actions";
import { interviewerPersonas } from "@/lib/interviews/personas";
import type { Tables } from "@/types/database";

type InterviewSessionFormProps = { resumes: Tables<"resumes">[]; jobPostings: Tables<"job_postings">[]; error?: string };

export function InterviewSessionForm({ resumes, jobPostings, error }: InterviewSessionFormProps) {
  const canCreateSession = resumes.length > 0 && jobPostings.length > 0;
  const fieldClass = "mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-ink outline-none transition focus:border-route focus:ring-2 focus:ring-route/15 disabled:bg-ink/5";

  return (
    <form action={createInterviewAction} className="rounded-xl border-2 border-route/20 bg-route/5 p-6 shadow-soft sm:p-7">
      <div className="space-y-5">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Schritt 3</p><h2 className="mt-2 text-xl font-semibold text-ink">Deine Interview-Session</h2><p className="mt-2 text-sm leading-6 text-steel">Wähle Kontext, Dauer und Gesprächsstil. Danach startet dein persönliches Training.</p></div>
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-ink">Lebenslauf<select name="resumeId" required disabled={!canCreateSession} className={fieldClass}><option value="">Bitte auswählen</option>{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.file_name}</option>)}</select></label>
          <label className="block text-sm font-medium text-ink">Stellenanzeige<select name="jobPostingId" required disabled={!canCreateSession} className={fieldClass}><option value="">Bitte auswählen</option>{jobPostings.map((jobPosting) => <option key={jobPosting.id} value={jobPosting.id}>{jobPosting.title}</option>)}</select></label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-ink">Dauer<select name="durationMinutes" defaultValue="15" className={fieldClass}><option value="10">10 Minuten</option><option value="15">15 Minuten</option><option value="20">20 Minuten</option></select></label>
          <label className="block text-sm font-medium text-ink">Schwierigkeit<select name="level" defaultValue="1" className={fieldClass}>{Array.from({ length: 10 }, (_, index) => index + 1).map((level) => <option key={level} value={level}>Level {level}</option>)}</select></label>
          <label className="block text-sm font-medium text-ink">Interviewer<select name="persona" defaultValue={interviewerPersonas[0].value} className={fieldClass}>{interviewerPersonas.map((persona) => <option key={persona.value} value={persona.value}>{persona.label}</option>)}</select></label>
        </div>
        {!canCreateSession ? <p className="rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm leading-6 text-ink">Lade zuerst einen Lebenslauf und speichere eine Stellenanzeige. Danach wird diese Auswahl freigeschaltet.</p> : null}
        <button type="submit" disabled={!canCreateSession} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90 disabled:cursor-not-allowed disabled:bg-steel">Interview starten <span className="ml-2" aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
