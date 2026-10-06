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
        aria-busy={isRunning}
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
        className="flex items-center gap-2 rounded-2xl border border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.09)] px-4 py-2 text-sm font-semibold text-[#b02a37] transition hover:bg-[rgba(220,53,69,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b02a37] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:text-[#ff8591]"
      >
        {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        {isRunning ? "Cancelando..." : "Cancelar reserva"}
      </button>

      {errorMessage ? (
        <p role="alert" className="text-sm font-medium text-[#b02a37] dark:text-[#ea868f]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
