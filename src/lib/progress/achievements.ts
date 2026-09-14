import type { Tables } from "@/types/database";

export type Achievement = {
  code: "FIRST_INTERVIEW" | "FIVE_INTERVIEWS" | "TEN_INTERVIEWS" | "LEVEL_5" | "LEVEL_10";
  title: string;
  description: string;
  unlocked: boolean;
};

export function buildAchievements(profile: Tables<"users">): Achievement[] {
  return [
    {
      code: "FIRST_INTERVIEW",
      title: "Erstes Interview",
      description: "Schliesse dein erstes Training ab.",
      unlocked: profile.total_interviews_completed >= 1
    },
    {
      code: "FIVE_INTERVIEWS",
      title: "5 Interviews",
      description: "Schliesse fünf Trainings ab.",
      unlocked: profile.total_interviews_completed >= 5
    },
    {
      code: "TEN_INTERVIEWS",
      title: "10 Interviews",
      description: "Schliesse zehn Trainings ab.",
      unlocked: profile.total_interviews_completed >= 10
    },
    {
      code: "LEVEL_5",
      title: "Level 5",
      description: "Erreiche Level 5.",
      unlocked: profile.current_level >= 5
    },
    {
      code: "LEVEL_10",
      title: "Level 10",
      description: "Erreiche Level 10.",
      unlocked: profile.current_level >= 10
    }
  ];
}
