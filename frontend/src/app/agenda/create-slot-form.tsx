"use client";

import { useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";
import { formatSpecialty, toUtcIsoDateTime } from "@/lib/formatters";
import type { InstructorUser } from "@/lib/users";

type CreateSlotFormProps = {
  selectedDate: string;
  instructors: InstructorUser[];
  onSuccess?: () => void;
};

export function CreateSlotForm({ selectedDate, instructors, onSuccess }: CreateSlotFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const mutationInFlightRef = useRef(false);

  const instructorFieldId = useId();
  const specialtyFieldId = useId();
  const startLocalTimeFieldId = useId();
  const endLocalTimeFieldId = useId();
  const capacityFieldId = useId();

  const initialInstructorId = instructors[0]?.id ?? "";
  const [selectedInstructorId, setSelectedInstructorId] = useState(instructors[0]?.id ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const availableSpecialties = useMemo(() => {
    return instructors.find((instructor) => instructor.id === selectedInstructorId)?.specialties ?? [];
  }, [instructors, selectedInstructorId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutationInFlightRef.current || isPending) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    mutationInFlightRef.current = true;
    startTransition(async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        const instructorUserId = String(formData.get("instructorUserId") ?? "");
        const requiredSpecialty = String(formData.get("requiredSpecialty") ?? "");
        const startLocalTime = String(formData.get("startLocalTime") ?? "");
        const endLocalTime = String(formData.get("endLocalTime") ?? "");
        const capacity = Number(formData.get("capacity") ?? 0);

        const response = await fetch("/api/schedule-slots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            instructorUserId,
            requiredSpecialty,
            startTime: toUtcIsoDateTime(selectedDate, startLocalTime),
            endTime: toUtcIsoDateTime(selectedDate, endLocalTime),
            capacity
          })
        });

        if (!response.ok) {
          setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel criar o horario."));
          return;
        }

        formRef.current?.reset();
        setSelectedInstructorId(initialInstructorId);
        setSuccessMessage("Horario criado com sucesso para a data selecionada.");
        router.refresh();
        if (onSuccess) {
          setTimeout(onSuccess, 600);
        }
      } finally {
        mutationInFlightRef.current = false;
      }
    });
  }

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="md:col-span-2 rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success"
        >
          {successMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={instructorFieldId} className="text-sm font-semibold text-brand-secondary">
          Instrutor
        </label>
        <select
          id={instructorFieldId}
          name="instructorUserId"
          value={selectedInstructorId}
          onChange={(event) => setSelectedInstructorId(event.target.value)}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        >
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={specialtyFieldId} className="text-sm font-semibold text-brand-secondary">
          Especialidade
        </label>
        <select
          id={specialtyFieldId}
          name="requiredSpecialty"
          key={selectedInstructorId}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
          disabled={availableSpecialties.length === 0}
        >
          {availableSpecialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {formatSpecialty(specialty)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={startLocalTimeFieldId} className="text-sm font-semibold text-brand-secondary">
          Inicio
        </label>
        <input
          id={startLocalTimeFieldId}
          name="startLocalTime"
          type="time"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={endLocalTimeFieldId} className="text-sm font-semibold text-brand-secondary">
          Fim
        </label>
        <input
          id={endLocalTimeFieldId}
          name="endLocalTime"
          type="time"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={capacityFieldId} className="text-sm font-semibold text-brand-secondary">
          Capacidade
        </label>
        <input
          id={capacityFieldId}
          name="capacity"
          type="number"
          min={1}
          defaultValue={1}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending || instructors.length === 0}
          aria-busy={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {isPending ? "Criando..." : "Criar horario"}
        </button>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          aria-live="assertive"
          className="md:col-span-2 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary"
        >
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
