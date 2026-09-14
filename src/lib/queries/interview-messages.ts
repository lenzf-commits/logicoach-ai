import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inserts } from "@/types/database";

export type CreateInterviewMessageInput = Pick<
  Inserts<"interview_messages">,
  "interview_id" | "role" | "content"
>;

export async function getInterviewMessages(interviewId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("interview_id", interviewId)
    .eq("user_id", user.id)
    .order("message_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createInterviewMessage(input: CreateInterviewMessageInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um Interview-Nachrichten zu speichern.");
  }

  const { data: latestMessage, error: latestError } = await supabase
    .from("interview_messages")
    .select("message_order")
    .eq("interview_id", input.interview_id)
    .eq("user_id", user.id)
    .order("message_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    throw latestError;
  }

  const { data, error } = await supabase
    .from("interview_messages")
    .insert({
      interview_id: input.interview_id,
      user_id: user.id,
      role: input.role,
      content: input.content,
      message_order: (latestMessage?.message_order ?? 0) + 1
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createInitialInterviewerMessage(interviewId: string, content: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um Interview-Nachrichten zu speichern.");
  }

  const { data: existingMessage, error: existingError } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("interview_id", interviewId)
    .eq("user_id", user.id)
    .order("message_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingMessage) {
    return existingMessage;
  }

  const { data, error } = await supabase
    .from("interview_messages")
    .insert({
      interview_id: interviewId,
      user_id: user.id,
      role: "interviewer",
      content,
      message_order: 1
    })
    .select("*")
    .single();

  if (error) {
    const { data: messageAfterRace } = await supabase
      .from("interview_messages")
      .select("*")
      .eq("interview_id", interviewId)
      .eq("user_id", user.id)
      .order("message_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (messageAfterRace) {
      return messageAfterRace;
    }

    throw error;
  }

  return data;
}
