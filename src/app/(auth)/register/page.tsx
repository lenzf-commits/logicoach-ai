import { PageShell } from "@/components/layout/page-shell";
import { AuthMessage } from "@/components/auth/auth-message";
import { signUpAction } from "@/app/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <PageShell eyebrow="Auth" title="Registrierung" description="Erstelle ein Konto mit Supabase Auth. Nach der Registrierung wird automatisch ein Nutzerprofil in der Datenbank angelegt.">
      <form action={signUpAction} className="max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <div className="space-y-4">
          <AuthMessage error={params.error} message={params.message} />
          <label className="block text-sm font-medium text-ink">
            Name
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            E-Mail
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Passwort
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
          >
            Konto erstellen
          </button>
        </div>
      </form>
    </PageShell>
  );
}
