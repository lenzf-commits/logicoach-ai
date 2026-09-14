"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteInterviewById } from "@/lib/queries/interviews";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function deleteInterviewAction(formData: FormData) {
  const interviewId = getFormString(formData, "interviewId");

  if (!interviewId) {
    redirect("/replay-center?error=Interview konnte nicht gefunden werden.");
  }

  try {
    await deleteInterviewById(interviewId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interview konnte nicht geloescht werden.";
    redirect(`/replay-center?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/replay-center");
  redirect("/replay-center?success=Interview wurde geloescht.");
}
