import { saveJobPostingAction } from "@/app/interview-vorbereitung/job-posting-actions";

type JobPostingFormProps = { error?: string; success?: string };

export function JobPostingForm({ error, success }: JobPostingFormProps) {
  const message = error ?? success;
  const fieldClass = "mt-2 w-full rounded-lg border border-ink/15 px-3 py-2.5 text-ink outline-none transition focus:border-route focus:ring-2 focus:ring-route/15";
  return (
    <form action={saveJobPostingAction} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-7">
      <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Schritt 2</p><h2 className="mt-2 text-xl font-semibold text-ink">Stellenanzeige einfügen</h2><p className="mt-2 text-sm leading-6 text-steel">Füge die komplette Ausschreibung ein. Jobtitel und Unternehmen sind optional.</p></div>
        {message ? <p className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-route/20 bg-route/10 text-route"}`}>{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-medium text-ink">Jobtitel<input name="title" type="text" className={fieldClass} placeholder="z. B. Projektmanager (optional)" /></label><label className="block text-sm font-medium text-ink">Unternehmen<input name="companyName" type="text" className={fieldClass} placeholder="z. B. Muster GmbH (optional)" /></label></div>
        <label className="block text-sm font-medium text-ink">Komplette Stellenanzeige<textarea name="description" required rows={12} className={fieldClass} placeholder="Füge hier die Aufgaben und Anforderungen der Stelle ein …" /></label>
        <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90">Stellenanzeige speichern <span className="ml-2" aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
