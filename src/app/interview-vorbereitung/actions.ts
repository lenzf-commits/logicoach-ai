"use server";

import pdfParse from "pdf-parse";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createResume } from "@/lib/queries/resumes";
import { parseResumeText } from "@/lib/resumes/parser";

const maxResumeSizeBytes = 5 * 1024 * 1024;

function redirectWithStatus(type: "error" | "success", message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/interview-vorbereitung?${params.toString()}`);
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.endsWith(".pdf") ? normalized : `${normalized}.pdf`;
}

export async function uploadResumeAction(formData: FormData) {
  const file = formData.get("resume");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithStatus("error", "Bitte waehle eine PDF-Datei aus.");
  }

  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    redirectWithStatus("error", "Nur PDF-Dateien sind erlaubt.");
  }

  if (file.size > maxResumeSizeBytes) {
    redirectWithStatus("error", "Die PDF-Datei darf maximal 5 MB gross sein.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirectWithStatus("error", "Bitte logge dich ein, um einen Lebenslauf hochzuladen.");
  }

  const safeFileName = sanitizeFileName(file.name);
  const filePath = `${user.id}/${safeFileName}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, buffer, {
      contentType: "application/pdf",
      upsert: false
    });

  if (uploadError) {
    redirectWithStatus("error", `Upload fehlgeschlagen: ${uploadError.message}`);
  }

  let extractedText = "";

  try {
    const parsedPdf = await pdfParse(buffer);
    extractedText = parsedPdf.text.trim();
  } catch {
    const message = "PDF-Text konnte nicht extrahiert werden. Bitte pruefe, ob die PDF Text enthaelt.";
    await createResume({
      file_name: safeFileName,
      file_path: filePath,
      extracted_text: message,
      parsed_data: {
        parsingStatus: "failed",
        error: message
      }
    });
    redirectWithStatus("error", message);
  }

  if (!extractedText) {
    const message = "PDF-Text konnte nicht extrahiert werden. Die Datei enthaelt vermutlich nur gescannte Bilder.";
    await createResume({
      file_name: safeFileName,
      file_path: filePath,
      extracted_text: message,
      parsed_data: {
        parsingStatus: "failed",
        error: message
      }
    });
    redirectWithStatus("error", message);
  }

  await createResume({
    file_name: safeFileName,
    file_path: filePath,
    extracted_text: extractedText,
    parsed_data: {
      parsingStatus: "success",
      ...parseResumeText(extractedText)
    }
  });

  redirectWithStatus("success", "Lebenslauf wurde hochgeladen und analysiert.");
}
