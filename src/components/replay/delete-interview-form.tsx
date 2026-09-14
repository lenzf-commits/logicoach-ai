"use client";

import { deleteInterviewAction } from "@/app/replay-center/actions";

type DeleteInterviewFormProps = {
  interviewId: string;
};

export function DeleteInterviewForm({ interviewId }: DeleteInterviewFormProps) {
  return (
    <form
      action={deleteInterviewAction}
      onSubmit={(event) => {
        if (!window.confirm("Interview wirklich loeschen?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="interviewId" value={interviewId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
      >
        Loeschen
      </button>
    </form>
  );
}
