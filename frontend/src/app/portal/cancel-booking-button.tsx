"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, XCircle } from "lucide-react";

type CancelBookingButtonProps = {
  bookingId: string;
};

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setErrorMessage("");

            const response = await fetch(`/api/student-portal/bookings/${bookingId}/cancel`, {
              method: "POST"
            });

            if (!response.ok) {
              const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
              setErrorMessage(payload.message || "Nao foi possivel cancelar a reserva.");
              return;
            }

            router.refresh();
          });
        }}
        className="flex items-center gap-2 rounded-2xl bg-[rgba(220,53,69,0.08)] px-4 py-2 text-sm font-semibold text-brand-danger transition hover:bg-[rgba(220,53,69,0.12)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        {isPending ? "Cancelando..." : "Cancelar reserva"}
      </button>

      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </div>
  );
}
