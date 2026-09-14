import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inserts, Updates } from "@/types/database";

export type CreateInterviewEvaluationInput = Omit<
  Inserts<"interview_evaluations">,
  "user_id"
>;

export async function createInterviewEvaluation(input: CreateInterviewEvaluationInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um eine Bewertung zu speichern.");
  }

  const { data, error } = await supabase
    .from("interview_evaluations")
    .insert({
      ...input,
      user_id: user.id
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Supabase interview_evaluations insert error", error);
    throw error;
  }

  if (!data) {
    throw new Error("Regelbasierte Bewertung wurde nicht gespeichert oder ist nicht lesbar.");
  }

  return data;
}

export async function getInterviewEvaluationByInterviewId(interviewId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("interview_evaluations")
    .select("*")
    .eq("interview_id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function getOwnedInterviewForEvaluationUpdate(interviewId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um eine Bewertung zu aktualisieren.");
  }

  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .select("id,user_id")
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (interviewError) {
    throw interviewError;
  }

  if (!interview) {
    throw new Error("Du darfst diese Bewertung nicht aktualisieren.");
  }

  return { user, interview };
}

export async function getInterviewEvaluationForOwnedInterview(interviewId: string) {
  const { user, interview } = await getOwnedInterviewForEvaluationUpdate(interviewId);
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("interview_evaluations")
    .select("*")
    .eq("interview_id", interview.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  console.log("AI coaching evaluation ownership check", {
    currentUserId: user.id,
    interviewUserId: interview.user_id,
    evaluationId: data?.id,
    evaluationUserId: data?.user_id,
    updateBranch: "select_evaluation_by_owned_interview_id"
  });

  return data;
}

export async function updateInterviewEvaluationForOwnedInterview(
  interviewId: string,
  input: Pick<
    Updates<"interview_evaluations">,
    | "ai_summary"
    | "ai_strengths"
    | "ai_weaknesses"
    | "ai_recommendations"
    | "ai_top_risks"
    | "ai_improved_answers"
    | "ai_created_at"
  >
) {
  const { user, interview } = await getOwnedInterviewForEvaluationUpdate(interviewId);
  const admin = createSupabaseAdminClient();

  const { data: evaluation, error: evaluationError } = await admin
    .from("interview_evaluations")
    .select("*")
    .eq("interview_id", interview.id)
    .maybeSingle();

  if (evaluationError) {
    throw evaluationError;
  }

  if (!evaluation) {
    throw new Error("KI-Coaching konnte nicht gespeichert werden: Keine Bewertung fuer dieses Interview gefunden.");
  }

  console.log("AI coaching update ownership", {
    currentUserId: user.id,
    evaluationId: evaluation.id,
    evaluationUserId: evaluation.user_id,
    interviewUserId: interview.user_id,
    updateBranch: "verified_interview_owner_update_by_evaluation_id"
  });

  const { data, error } = await admin
    .from("interview_evaluations")
    .update(input)
    .eq("id", evaluation.id)
    .select("*");

  console.log("AI coaching update rows returned", data?.length ?? 0);

  if (error) {
    console.error("Supabase interview_evaluations update error", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("KI-Coaching konnte nicht gespeichert werden: Keine passende Bewertung gefunden.");
  }

  return data[0];
}
