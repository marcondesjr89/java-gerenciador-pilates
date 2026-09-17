"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, XCircle } from "lucide-react";
import { readStudentPortalActionErrorMessage } from "@/lib/student-portal-actions";
import { useSingleFlightTransition } from "@/lib/use-single-flight-transition";

type CancelBookingButtonProps = {
  bookingId: string;
};

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
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

            const response = await fetch(`/api/student-portal/bookings/${bookingId}/cancel`, {
              method: "POST"
            });

            if (!response.ok) {
              setErrorMessage(await readStudentPortalActionErrorMessage(response, "Nao foi possivel cancelar a reserva."));
              return;
            }

            router.refresh();
          });
        }}
        className="flex items-center gap-2 rounded-2xl bg-[rgba(220,53,69,0.08)] px-4 py-2 text-sm font-semibold text-brand-danger transition hover:bg-[rgba(220,53,69,0.12)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        {isRunning ? "Cancelando..." : "Cancelar reserva"}
      </button>

      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </div>
  );
}
