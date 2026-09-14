import { uploadResumeAction } from "@/app/interview-vorbereitung/actions";

type ResumeUploadFormProps = {
  error?: string;
  success?: string;
};

export function ResumeUploadForm({ error, success }: ResumeUploadFormProps) {
  const message = error ?? success;

  return (
    <form action={uploadResumeAction} className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">Lebenslauf hochladen</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Lade deinen Lebenslauf als PDF hoch. Erlaubt sind nur PDF-Dateien bis 5 MB.
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

        <label className="block text-sm font-medium text-ink">
          PDF-Datei
          <input
            name="resume"
            type="file"
            accept="application/pdf,.pdf"
            required
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink file:mr-4 file:rounded-md file:border-0 file:bg-route file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-route/90"
          />
        </label>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
        >
          Lebenslauf hochladen
        </button>
      </div>
    </form>
  );
}
