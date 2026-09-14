import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inserts } from "@/types/database";

export type CreateJobPostingInput = Pick<
  Inserts<"job_postings">,
  "title" | "company_name" | "description" | "parsed_data"
>;

export async function createJobPosting(input: CreateJobPostingInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um eine Stellenanzeige zu speichern.");
  }

  const { data, error } = await supabase
    .from("job_postings")
    .insert({
      user_id: user.id,
      title: input.title,
      company_name: input.company_name ?? null,
      description: input.description,
      parsed_data: input.parsed_data ?? {}
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserJobPostings() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getJobPostingById(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
