import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-route">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-steel">{description}</p>
      {children ? <div className="mt-8">{children}</div> : null}
    </main>
  );
}
