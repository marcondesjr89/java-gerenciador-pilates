"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, RefreshCw, Trash2, Users } from "lucide-react";

type Booking = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: string;
};

type WaitlistEntry = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: string;
  promotedAt: string | null;
};

type StudentOption = {
  id: string;
  fullName: string;
};

type SlotBookingsPanelProps = {
  slotId: string;
  availableSpots: number;
  students: StudentOption[];
};

export function SlotBookingsPanel({ slotId, availableSpots, students }: SlotBookingsPanelProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[] | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
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

  function loadWaitlist() {
    startLoading(async () => {
      setErrorMessage("");

      const response = await fetch(`/api/schedule-slots/${slotId}/waitlist`, {
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
        setErrorMessage(payload.message || "Nao foi possivel carregar a fila de espera.");
        return;
      }

      const payload = (await response.json()) as WaitlistEntry[];
      setWaitlist(payload);
    });
  }

  function createBooking() {
    startMutating(async () => {
      setErrorMessage("");

      const response = await fetch(`/api/schedule-slots/${slotId}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: selectedStudentId
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
        setErrorMessage(payload.message || "Nao foi possivel reservar o aluno.");
        return;
      }

      await loadBookings();
      router.refresh();
    });
  }

  function joinWaitlist() {
    startMutating(async () => {
      setErrorMessage("");

      const response = await fetch(`/api/schedule-slots/${slotId}/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: selectedStudentId
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
        setErrorMessage(payload.message || "Nao foi possivel incluir o aluno na fila de espera.");
        return;
      }

      await loadWaitlist();
      router.refresh();
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
      <div className="rounded-2xl border border-brand-line bg-brand-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex-1 space-y-2">
            <span className="text-sm font-semibold text-brand-secondary">Reservar aluno neste horario</span>
            <select
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
              disabled={students.length === 0 || availableSpots === 0 || isMutating}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={createBooking}
            disabled={!selectedStudentId || students.length === 0 || availableSpots === 0 || isMutating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isMutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isMutating ? "Reservando..." : "Reservar aluno"}
          </button>
        </div>

        {students.length === 0 ? (
          <p className="mt-3 text-sm text-brand-subtext">Nenhum aluno ativo disponivel para reserva.</p>
        ) : null}

        {availableSpots === 0 ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-brand-subtext">Este horario esta lotado. Abaixo voce pode incluir alunos na fila de espera.</p>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <button
                type="button"
                onClick={joinWaitlist}
                disabled={!selectedStudentId || students.length === 0 || isMutating}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isMutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                {isMutating ? "Incluindo..." : "Entrar na fila de espera"}
              </button>

              <button
                type="button"
                onClick={loadWaitlist}
                disabled={isLoading || isMutating}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {waitlist ? "Atualizar fila" : "Ver fila de espera"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

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

      {waitlist ? (
        waitlist.length > 0 ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-brand-secondary">Fila de espera</p>
              <p className="text-sm text-brand-subtext">Ordem atual de alunos aguardando vaga neste horario.</p>
            </div>

            {waitlist.map((entry, index) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-brand-ink">{entry.studentName}</p>
                  <p className="text-sm text-brand-subtext">Posicao {index + 1} na fila</p>
                </div>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-surface px-4 py-6 text-sm text-brand-subtext">
            Nenhum aluno aguardando neste horario.
          </div>
        )
      ) : null}
    </div>
  );
}
