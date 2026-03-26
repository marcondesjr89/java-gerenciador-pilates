"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw, Trash2, Users } from "lucide-react";

type Booking = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: string;
};

type SlotBookingsPanelProps = {
  slotId: string;
};

export function SlotBookingsPanel({ slotId }: SlotBookingsPanelProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, startLoading] = useTransition();
  const [isMutating, startMutating] = useTransition();

  function loadBookings() {
    startLoading(async () => {
      setErrorMessage("");

      const response = await fetch(`/api/schedule-slots/${slotId}/bookings`, {
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
        setErrorMessage(payload.message || "Nao foi possivel carregar as reservas.");
        return;
      }

      const payload = (await response.json()) as Booking[];
      setBookings(payload);
    });
  }

  function cancelBooking(bookingId: string) {
    startMutating(async () => {
      setErrorMessage("");

      const response = await fetch(`/api/schedule-slots/${slotId}/bookings/${bookingId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
        setErrorMessage(payload.message || "Nao foi possivel cancelar a reserva.");
        return;
      }

      await loadBookings();
      router.refresh();
    });
  }

  return (
    <div className="mt-4 rounded-[20px] border border-brand-line bg-brand-panel p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-secondary">Reservas do horario</p>
          <p className="text-sm text-brand-subtext">Consulte os alunos confirmados e cancele quando necessario.</p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          disabled={isLoading || isMutating}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {bookings ? "Atualizar reservas" : "Ver reservas"}
        </button>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}

      {bookings ? (
        bookings.length > 0 ? (
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-ink">{booking.studentName}</p>
                    <p className="text-sm text-brand-subtext">Reserva ativa neste slot</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => cancelBooking(booking.id)}
                  disabled={isMutating}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.08)] px-4 py-2 text-sm font-semibold text-brand-danger transition hover:bg-[rgba(220,53,69,0.12)] disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isMutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Cancelar reserva
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-surface px-4 py-6 text-sm text-brand-subtext">
            Nenhuma reserva ativa neste horario.
          </div>
        )
      ) : null}
    </div>
  );
}
