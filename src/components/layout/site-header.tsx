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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-ink">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-steel lg:flex">
          {siteConfig.mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-sm text-steel sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="secondary">Login</ButtonLink>
            <ButtonLink href="/register">Registrieren</ButtonLink>
          </div>
        )}
      </div>
    </header>
  );
}
