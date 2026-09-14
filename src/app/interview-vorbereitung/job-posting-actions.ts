"use server";

import { redirect } from "next/navigation";
import { createJobPosting } from "@/lib/queries/job-postings";
import { parseJobPostingText } from "@/lib/job-postings/parser";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithStatus(type: "jobError" | "jobSuccess", message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/interview-vorbereitung?${params.toString()}`);
}

export async function saveJobPostingAction(formData: FormData) {
  const title = getFormString(formData, "title");
  const companyName = getFormString(formData, "companyName");
  const description = getFormString(formData, "description");

  if (!description) {
    redirectWithStatus("jobError", "Bitte füge die komplette Stellenanzeige ein.");
  }

  if (description.length < 80) {
    redirectWithStatus("jobError", "Die Stellenanzeige ist zu kurz für eine sinnvolle Analyse.");
  }

  const parsedData = parseJobPostingText(description, title || null, companyName || null);

  await createJobPosting({
    title: title || parsedData.jobTitle || "Stellenanzeige ohne Titel",
    company_name: companyName || parsedData.company,
    description,
    parsed_data: {
      parsingStatus: "success",
      ...parsedData
    }
  });

  redirectWithStatus("jobSuccess", "Stellenanzeige wurde gespeichert und analysiert.");
}
