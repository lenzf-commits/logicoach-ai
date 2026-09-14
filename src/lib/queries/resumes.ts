import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inserts } from "@/types/database";

export type CreateResumeInput = Pick<
  Inserts<"resumes">,
  "file_name" | "file_path" | "extracted_text" | "parsed_data"
>;

export async function createResume(input: CreateResumeInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um einen Lebenslauf zu speichern.");
  }

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      file_name: input.file_name,
      file_path: input.file_path ?? null,
      extracted_text: input.extracted_text ?? null,
      parsed_data: input.parsed_data ?? {}
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserResumes() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getResumeById(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
