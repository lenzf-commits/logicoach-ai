import Link from "next/link";
import { generateEvaluationAction } from "@/app/evaluation-actions";

type EvaluationActionProps = {
  interviewId: string;
  hasEvaluation: boolean;
};

export function EvaluationAction({ interviewId, hasEvaluation }: EvaluationActionProps) {
  if (hasEvaluation) {
    return (
      <Link
        href={`/auswertung/${interviewId}`}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-route/20 bg-route/10 px-5 py-2.5 text-sm font-semibold text-route transition hover:bg-route/20"
      >
        Auswertung ansehen
      </Link>
    );
  }

  return (
    <form action={generateEvaluationAction}>
      <input type="hidden" name="interviewId" value={interviewId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-route/20 bg-route/10 px-5 py-2.5 text-sm font-semibold text-route transition hover:bg-route/20"
      >
        Bewertung erstellen
      </button>
    </form>
  );
}
