import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createHash } from "node:crypto";
import type { ReplayAnalysis } from "@/lib/replay/answer-feedback";
import type { Tables } from "@/types/database";

export function replayInputHash(messages: Tables<"interview_messages">[], resumeText: string, jobDescription: string) {
  return createHash("sha256").update(JSON.stringify({ version: 2, messages: messages.map(({ id, role, content }) => ({ id, role, content })), resumeText, jobDescription })).digest("hex");
}

export async function getReplayAnalysis(interviewId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, available: false };
  const { data, error } = await supabase.from("replay_analyses").select("*").eq("interview_id", interviewId).eq("user_id", user.id).maybeSingle();
  if (error?.code === "42P01" || error?.code === "PGRST205") return { data: null, available: false };
  if (error) throw error;
  return { data, available: true };
}

export async function getUserReplayAnalyses() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("replay_analyses").select("interview_id,report").eq("user_id", user.id);
  if (error?.code === "42P01" || error?.code === "PGRST205") return [];
  if (error) throw error;
  return data ?? [];
}

export async function saveReplayAnalysis(interviewId: string, inputHash: string, report: ReplayAnalysis) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Bitte melde dich erneut an.");
  const { error } = await supabase.from("replay_analyses").upsert({
    interview_id: interviewId, user_id: user.id, input_hash: inputHash, report,
    created_at: new Date().toISOString()
  }, { onConflict: "interview_id" });
  if (error) throw new Error("Die Antwortanalyse konnte nicht gespeichert werden. Bitte versuche es erneut.");
}
