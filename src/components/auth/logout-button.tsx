import { signOutAction } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5"
      >
        Logout
      </button>
    </form>
  );
}
