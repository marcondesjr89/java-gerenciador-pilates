"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hourglass, LoaderCircle } from "lucide-react";
import { readStudentPortalActionErrorMessage } from "@/lib/student-portal-actions";
import { useSingleFlightTransition } from "@/lib/use-single-flight-transition";

type JoinWaitlistButtonProps = {
  slotId: string;
};

export function JoinWaitlistButton({ slotId }: JoinWaitlistButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const { isRunning, run } = useSingleFlightTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isRunning}
        aria-busy={isRunning}
        onClick={() => {
          run(async () => {
            setErrorMessage("");

            const response = await fetch(`/api/student-portal/schedule-slots/${slotId}/waitlist`, {
              method: "POST"
            });

            if (!response.ok) {
              setErrorMessage(await readStudentPortalActionErrorMessage(response, "Nao foi possivel entrar na lista de espera."));
              return;
            }

            router.refresh();
          });
        }}
        className="flex items-center gap-2 rounded-2xl border border-brand-line bg-brand-panel px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/30 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Hourglass className="h-4 w-4" />}
        {isRunning ? "Entrando..." : "Entrar na espera"}
      </button>

      {errorMessage ? (
        <p role="alert" className="text-sm font-medium text-[#b02a37] dark:text-[#ea868f]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
