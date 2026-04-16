"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, LoaderCircle } from "lucide-react";
import { readStudentPortalActionErrorMessage } from "@/lib/student-portal-actions";
import type { StudentPortalRescheduleOption, StudentPortalRescheduleRequest } from "@/lib/student-portal-bookings";

type RescheduleBookingPanelProps = {
  bookingId: string;
  initialDate: string;
};

export function RescheduleBookingPanel({ bookingId, initialDate }: RescheduleBookingPanelProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [options, setOptions] = useState<StudentPortalRescheduleOption[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingOptions, startLoadingOptions] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();

  function loadOptions() {
    startLoadingOptions(async () => {
      setErrorMessage("");
      setSuccessMessage("");
      setSelectedSlotId("");

      const response = await fetch(
        `/api/student-portal/bookings/${bookingId}/reschedule-options?date=${encodeURIComponent(selectedDate)}`
      );

      if (!response.ok) {
        setOptions([]);
        setErrorMessage(await readStudentPortalActionErrorMessage(response, "Nao foi possivel carregar opcoes de remarcacao."));
        return;
      }

      const payload = (await response.json()) as StudentPortalRescheduleOption[];
      setOptions(payload);
      setSelectedSlotId(payload[0]?.slotId ?? "");
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
      <p className="text-sm font-semibold text-brand-secondary">Remarcar horario</p>
      <p className="mt-2 text-sm leading-6 text-brand-subtext">
        Escolha uma data para consultar horarios disponiveis e confirme a troca da sua reserva.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          type="date"
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
        />
        <button
          type="button"
          onClick={loadOptions}
          disabled={isLoadingOptions}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isLoadingOptions ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CalendarSync className="h-4 w-4" />}
          {isLoadingOptions ? "Consultando..." : "Buscar horarios"}
        </button>
      </div>

      {options.length > 0 ? (
        <div className="mt-4 space-y-3">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand-secondary">Horario de destino</span>
            <select
              value={selectedSlotId}
              onChange={(event) => setSelectedSlotId(event.target.value)}
              className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            >
              {options.map((option) => (
                <option key={option.slotId} value={option.slotId}>
                  {new Date(option.startTime).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} |{" "}
                  {option.instructorName} | {option.availableSpots} vaga(s)
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={!selectedSlotId || isSubmitting}
            onClick={() => {
              startSubmitting(async () => {
                setErrorMessage("");
                setSuccessMessage("");

                const response = await fetch(`/api/student-portal/bookings/${bookingId}/reschedule`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    targetSlotId: selectedSlotId
                  } satisfies StudentPortalRescheduleRequest)
                });

                if (!response.ok) {
                  setErrorMessage(await readStudentPortalActionErrorMessage(response, "Nao foi possivel remarcar a reserva."));
                  return;
                }

                setSuccessMessage("Reserva remarcada com sucesso.");
                router.refresh();
              });
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 font-semibold text-brand-secondary transition hover:border-brand-primary/30 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CalendarSync className="h-4 w-4" />}
            {isSubmitting ? "Remarcando..." : "Confirmar remarcacao"}
          </button>
        </div>
      ) : null}

      {errorMessage ? <p className="mt-3 text-sm text-brand-danger">{errorMessage}</p> : null}
      {successMessage ? <p className="mt-3 text-sm text-brand-success">{successMessage}</p> : null}
      {!errorMessage && options.length === 0 ? (
        <p className="mt-3 text-sm text-brand-subtext">Nenhuma opcao carregada ainda para a data selecionada.</p>
      ) : null}
    </div>
  );
}
