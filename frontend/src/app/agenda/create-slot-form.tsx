"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus } from "lucide-react";

type InstructorOption = {
  id: string;
  fullName: string;
  specialties: string[];
};

type CreateSlotFormProps = {
  selectedDate: string;
  instructors: InstructorOption[];
};

const specialtyLabels: Record<string, string> = {
  PILATES_SOLO: "Pilates Solo",
  PILATES_APARELHOS: "Pilates Aparelhos",
  PILATES_GESTANTES: "Pilates Gestantes",
  PILATES_REABILITACAO: "Pilates Reabilitacao",
  PILATES_IDOSOS: "Pilates Idosos"
};

function toIsoDateTime(date: string, time: string) {
  return `${date}T${time}:00Z`;
}

export function CreateSlotForm({ selectedDate, instructors }: CreateSlotFormProps) {
  const router = useRouter();
  const [selectedInstructorId, setSelectedInstructorId] = useState(instructors[0]?.id ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const availableSpecialties = useMemo(() => {
    return instructors.find((instructor) => instructor.id === selectedInstructorId)?.specialties ?? [];
  }, [instructors, selectedInstructorId]);

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");

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
              startTime: toIsoDateTime(selectedDate, startLocalTime),
              endTime: toIsoDateTime(selectedDate, endLocalTime),
              capacity
            })
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel criar o horario.");
            return;
          }

          router.replace(`/agenda?date=${selectedDate}&created=1`);
          router.refresh();
        });
      }}
    >
      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Instrutor</span>
        <select
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
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Especialidade</span>
        <select
          name="requiredSpecialty"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
          disabled={availableSpecialties.length === 0}
        >
          {availableSpecialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialtyLabels[specialty] ?? specialty}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Inicio</span>
        <input
          name="startLocalTime"
          type="time"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Fim</span>
        <input
          name="endLocalTime"
          type="time"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Capacidade</span>
        <input
          name="capacity"
          type="number"
          min={1}
          defaultValue={1}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending || instructors.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {isPending ? "Criando..." : "Criar horario"}
        </button>
      </div>

      {errorMessage ? (
        <div className="md:col-span-2 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
