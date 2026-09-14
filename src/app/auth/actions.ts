"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(path: string, type: "error" | "message", message: string) {
  const params = new URLSearchParams({ [type]: message });
  redirect(`${path}?${params.toString()}`);
}

export async function signUpAction(formData: FormData) {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");
  const fullName = getFormString(formData, "fullName");
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    redirectWithMessage("/register", "error", "Bitte E-Mail und Passwort eingeben.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    redirectWithMessage("/register", "error", error.message);
  }

  redirectWithMessage(
    "/login",
    "message",
    "Registrierung erfolgreich. Bitte prüfe bei aktivierter E-Mail-Bestätigung dein Postfach."
  );
}

export async function signInAction(formData: FormData) {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");
  const next = getFormString(formData, "next") || "/dashboard";

  if (!email || !password) {
    redirectWithMessage("/login", "error", "Bitte E-Mail und Passwort eingeben.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithMessage("/login", "error", error.message);
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
