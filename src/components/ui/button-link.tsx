import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "secondary-dark";
};

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  const classes =
    variant === "primary"
      ? "bg-route text-white hover:bg-route/90"
      : variant === "secondary-dark"
        ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
        : "border border-ink/15 bg-white text-ink hover:bg-ink/5";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition ${classes}`}
    >
      {children}
    </Link>
  );
}
