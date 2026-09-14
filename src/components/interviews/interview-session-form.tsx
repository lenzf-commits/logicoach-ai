import { createInterviewAction } from "@/app/interview-vorbereitung/interview-actions";
import { interviewerPersonas } from "@/lib/interviews/personas";
import type { Tables } from "@/types/database";

type InterviewSessionFormProps = {
  resumes: Tables<"resumes">[];
  jobPostings: Tables<"job_postings">[];
  error?: string;
};

export function InterviewSessionForm({ resumes, jobPostings, error }: InterviewSessionFormProps) {
  const canCreateSession = resumes.length > 0 && jobPostings.length > 0;

  return (
    <form action={createInterviewAction} className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">Interview-Session erstellen</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Waehle Lebenslauf, Stellenanzeige, Dauer, Level und Interviewer-Persona aus.
          </p>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-ink">
            Lebenslauf
            <select
              name="resumeId"
              required
              disabled={!canCreateSession}
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-route disabled:bg-ink/5"
            >
              <option value="">Bitte auswaehlen</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.file_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-ink">
            Stellenanzeige
            <select
              name="jobPostingId"
              required
              disabled={!canCreateSession}
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-route disabled:bg-ink/5"
            >
              <option value="">Bitte auswaehlen</option>
              {jobPostings.map((jobPosting) => (
                <option key={jobPosting.id} value={jobPosting.id}>
                  {jobPosting.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-ink">
            Dauer
            <select
              name="durationMinutes"
              defaultValue="15"
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-route"
            >
              <option value="10">10 Minuten</option>
              <option value="15">15 Minuten</option>
              <option value="20">20 Minuten</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-ink">
            Level
            <select
              name="level"
              defaultValue="1"
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-route"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-ink">
            Persona
            <select
              name="persona"
              defaultValue={interviewerPersonas[0].value}
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-route"
            >
              {interviewerPersonas.map((persona) => (
                <option key={persona.value} value={persona.value}>
                  {persona.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!canCreateSession ? (
          <p className="text-sm leading-6 text-steel">
            Du brauchst mindestens einen Lebenslauf und eine Stellenanzeige, bevor du eine Session erstellen kannst.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canCreateSession}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90 disabled:cursor-not-allowed disabled:bg-steel"
        >
          Interview-Session erstellen
        </button>
      </div>
    </form>
  );
}
