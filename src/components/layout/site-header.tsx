import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { ButtonLink } from "@/components/ui/button-link";
import { LogoutButton } from "@/components/auth/logout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const user = await (async () => {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      return user;
    } catch {
      return null;
    }
  })();

  return (
    <header className="border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link href="/" aria-label="LogiCoach AI Startseite" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {siteConfig.name}
        </Link>
        <nav aria-label="Hauptnavigation" className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-steel lg:order-none lg:ml-2 lg:w-auto lg:shrink-0">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.description}
              className={item.highlighted
                ? "inline-flex min-h-11 items-center gap-2 rounded-md bg-signal px-3 py-2 font-semibold text-ink shadow-sm transition hover:bg-signal/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                : "inline-flex min-h-11 items-center gap-2 rounded-md border border-transparent px-3 py-2 transition hover:border-route/15 hover:bg-route/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-route"}
            >
              <span aria-hidden="true" className={item.highlighted ? "text-base" : "text-sm font-bold text-route/80"}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="order-2 ml-auto flex items-center gap-2 lg:order-none lg:shrink-0">
            <span className="hidden max-w-48 truncate text-sm text-steel sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="order-2 ml-auto flex items-center gap-2 lg:order-none lg:shrink-0">
            <ButtonLink href="/login" variant="secondary">Login</ButtonLink>
            <ButtonLink href="/register">Registrieren</ButtonLink>
          </div>
        )}
      </div>
    </header>
  );
}
