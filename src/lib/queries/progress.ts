import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildAchievements } from "@/lib/progress/achievements";
import {
  calculateInterviewXp,
  calculateLevel,
  getCurrentLevelThreshold,
  getNextLevelThreshold
} from "@/lib/progress/levels";
import { calculateLongestStreakDays } from "@/lib/progress/streaks";

export async function getUserProgress() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  const currentLevelStartXp = getCurrentLevelThreshold(profile.current_level);
  const nextLevel = getNextLevelThreshold(profile.current_level);
  const xpForCurrentLevel = Math.max(profile.current_xp - currentLevelStartXp, 0);
  const xpNeededForNextLevel = nextLevel ? nextLevel.xp - currentLevelStartXp : 0;
  const progressPercent = nextLevel
    ? Math.min(Math.round((xpForCurrentLevel / xpNeededForNextLevel) * 100), 100)
    : 100;

  return {
    profile,
    currentLevelStartXp,
    nextLevel,
    xpForCurrentLevel,
    xpNeededForNextLevel,
    progressPercent
  };
}

export async function getUserAchievements() {
  const progress = await getUserProgress();
  return progress ? buildAchievements(progress.profile) : [];
}

export async function addXpToUser(interviewId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Du musst eingeloggt sein, um XP zu erhalten.");
  }

  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .single();

  if (interviewError) {
    throw interviewError;
  }

  if (interview.status === "completed") {
    throw new Error("Dieses Interview wurde bereits abgeschlossen.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  const xpGained = calculateInterviewXp(interview.level);
  const previousLevel = profile.current_level;
  const newCurrentXp = profile.current_xp + xpGained;
  const newLevel = calculateLevel(newCurrentXp);
  const today = new Date().toISOString();

  const { data: existingProgressHistory, error: existingProgressError } = await supabase
    .from("progress_history")
    .select("created_at")
    .eq("user_id", user.id);

  if (existingProgressError) {
    throw existingProgressError;
  }

  const longestStreakDays = calculateLongestStreakDays([
    ...(existingProgressHistory ?? []).map((entry) => entry.created_at),
    today
  ]);

  const { error: updateUserError } = await supabase
    .from("users")
    .update({
      current_xp: newCurrentXp,
      total_xp: newCurrentXp,
      current_level: newLevel,
      total_interviews_completed: profile.total_interviews_completed + 1,
      longest_streak_days: Math.max(profile.longest_streak_days, longestStreakDays)
    })
    .eq("id", user.id);

  if (updateUserError) {
    throw updateUserError;
  }

  const { error: updateInterviewError } = await supabase
    .from("interviews")
    .update({
      status: "completed",
      completed_at: today
    })
    .eq("id", interview.id)
    .eq("user_id", user.id);

  if (updateInterviewError) {
    throw updateInterviewError;
  }

  const { data: history, error: historyError } = await supabase
    .from("progress_history")
    .insert({
      user_id: user.id,
      interview_id: interview.id,
      xp_delta: xpGained,
      xp_gained: xpGained,
      previous_level: previousLevel,
      new_level: newLevel,
      level_after: newLevel,
      total_xp_after: newCurrentXp,
      note: "Interview abgeschlossen"
    })
    .select("*")
    .single();

  if (historyError) {
    throw historyError;
  }

  return history;
}
