"use client";

import { useActionState } from "react";
import { analyzeReplayAction } from "@/app/replay-center/analysis-actions";

export function AnalyzeReplayForm({ interviewId, refresh = false, mode = "answers", label }: { interviewId: string; refresh?: boolean; mode?: "answers" | "overall"; label?: string }) {
  const [state, action, pending] = useActionState(analyzeReplayAction, {});
  const overall = mode === "overall";
  return <form action={action} className="mt-4">
    <input type="hidden" name="interviewId" value={interviewId} />
    <input type="hidden" name="mode" value={mode} />
    <button disabled={pending} className={`min-h-11 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-60 ${overall ? "w-full bg-route text-base shadow-md ring-4 ring-route/10 hover:bg-route/90 sm:w-auto" : "bg-amber-900 hover:bg-amber-800"}`}>
      {pending ? mode === "overall" ? "Gesamtauswertung wird erstellt …" : "Antworten werden inhaltlich geprüft …" : label ?? (refresh ? "Analyse aktualisieren" : "Antworten analysieren")}
    </button>
    <div aria-live="polite">{pending ? <p className="mt-2 text-sm text-steel">{mode === "overall" ? "Die KI fasst Gespräch, Stärken, Schwächen und nächste Übungen zusammen." : "Die KI prüft Frage, Antwort und Lebenslauf. Das kann einen Moment dauern."}</p> : null}
      {state.error ? <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error}</p> : null}
    </div>
  </form>;
}
