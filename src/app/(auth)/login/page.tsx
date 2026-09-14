import { PageShell } from "@/components/layout/page-shell";
import { AuthMessage } from "@/components/auth/auth-message";
import { signInAction } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <PageShell eyebrow="Auth" title="Login" description="Melde dich mit E-Mail und Passwort an. Die Session wird über Supabase Auth verwaltet.">
      <form action={signInAction} className="max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
        <div className="space-y-4">
          <AuthMessage error={params.error} message={params.message} />
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
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-ink outline-none focus:border-route"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-route px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-route/90"
          >
            Einloggen
          </button>
        </div>
      </form>
    </PageShell>
  );
}
