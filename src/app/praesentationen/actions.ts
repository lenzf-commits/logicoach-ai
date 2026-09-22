"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generatePresentationPlan } from "@/lib/ai/presentation-plan";
import { parsePresentationSettings, type PresentationState } from "@/lib/presentations/training";

export async function preparePresentationAction(_previous: PresentationState, formData: FormData): Promise<PresentationState> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { error: "Bitte melde dich an, um dein Präsentationstraining vorzubereiten." };
    const settings = parsePresentationSettings(formData);
    const plan = await generatePresentationPlan(settings);
    return { settings, plan };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Das Training konnte nicht vorbereitet werden. Bitte versuche es erneut." };
  }
}
