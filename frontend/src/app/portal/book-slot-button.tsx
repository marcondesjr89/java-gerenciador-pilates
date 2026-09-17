"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { readStudentPortalActionErrorMessage } from "@/lib/student-portal-actions";
import { useSingleFlightTransition } from "@/lib/use-single-flight-transition";

type BookSlotButtonProps = {
  slotId: string;
};

export function BookSlotButton({ slotId }: BookSlotButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const { isRunning, run } = useSingleFlightTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isRunning}
        onClick={() => {
          run(async () => {
            setErrorMessage("");

            const response = await fetch(`/api/student-portal/schedule-slots/${slotId}/bookings`, {
              method: "POST"
            });

            if (!response.ok) {
              setErrorMessage(await readStudentPortalActionErrorMessage(response, "Nao foi possivel reservar o horario."));
              return;
            }

            router.refresh();
          });
        }}
        className="flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {isRunning ? "Reservando..." : "Reservar horario"}
      </button>

      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </div>
  );
}
