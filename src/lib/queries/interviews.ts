import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Inserts } from "@/types/database";

export type CreateInterviewInput = Pick<
  Inserts<"interviews">,
  "resume_id" | "job_posting_id" | "duration_minutes" | "level" | "persona" | "status"
>;

export async function createInterview(input: CreateInterviewInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um eine Interview-Session zu erstellen.");
  }

  const { data, error } = await supabase
    .from("interviews")
    .insert({
      user_id: user.id,
      resume_id: input.resume_id,
      job_posting_id: input.job_posting_id,
      duration_minutes: input.duration_minutes,
      level: input.level,
      persona: input.persona,
      status: input.status ?? "ready"
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserInterviews() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getInterviewById(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateInterviewStatus(
  id: string,
  status: Database["public"]["Enums"]["interview_status"]
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um eine Interview-Session zu aktualisieren.");
  }

  const { data, error } = await supabase
    .from("interviews")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteInterviewById(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um ein Interview zu löschen.");
  }

  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}
