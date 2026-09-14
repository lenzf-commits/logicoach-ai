import { saveJobPostingAction } from "@/app/interview-vorbereitung/job-posting-actions";

type JobPostingFormProps = {
  error?: string;
  success?: string;
};

export function JobPostingForm({ error, success }: JobPostingFormProps) {
  const message = error ?? success;

  return (
    <form action={saveJobPostingAction} className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">Stellenanzeige einfuegen</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Fuege die komplette Ausschreibung ein. Jobtitel und Unternehmen sind optional.
          </p>
        </div>

        {message ? (
          <p
            className={`rounded-md border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-route/20 bg-route/10 text-route"
            }`}
          >
            {message}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-ink">
            Jobtitel
            <input
              name="title"
              type="text"
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Unternehmen
            <input
              name="companyName"
              type="text"
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-ink">
          Komplette Stellenanzeige
          <textarea
            name="description"
            required
            rows={12}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
          />
        </label>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
        >
          Stellenanzeige speichern
        </button>
      </div>
    </form>
  );
}
