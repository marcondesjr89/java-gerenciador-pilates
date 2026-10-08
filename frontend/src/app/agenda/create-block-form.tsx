"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, LoaderCircle } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";
import { toUtcIsoDateTime } from "@/lib/formatters";
import type { InstructorUser } from "@/lib/users";

type CreateBlockFormProps = {
  selectedDate: string;
  instructors: InstructorUser[];
  onSuccess?: () => void;
};

export function CreateBlockForm({ selectedDate, instructors, onSuccess }: CreateBlockFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const mutationInFlightRef = useRef(false);

  const instructorFieldId = useId();
  const reasonFieldId = useId();
  const startLocalTimeFieldId = useId();
  const endLocalTimeFieldId = useId();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

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
        const startLocalTime = String(formData.get("startLocalTime") ?? "");
        const endLocalTime = String(formData.get("endLocalTime") ?? "");
        const reason = String(formData.get("reason") ?? "").trim();

        const response = await fetch("/api/schedule-blocks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            instructorUserId,
            startTime: toUtcIsoDateTime(selectedDate, startLocalTime),
            endTime: toUtcIsoDateTime(selectedDate, endLocalTime),
            reason
          })
        });

        if (!response.ok) {
          setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel criar o bloqueio."));
          return;
        }

        formRef.current?.reset();
        setSuccessMessage("Bloqueio criado com sucesso para a data selecionada.");
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
          className="md:col-span-2 rounded-2xl border border-brand-line bg-[rgba(220,53,69,0.08)] px-4 py-3 text-sm text-brand-danger"
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
        <label htmlFor={reasonFieldId} className="text-sm font-semibold text-brand-secondary">
          Motivo
        </label>
        <input
          id={reasonFieldId}
          name="reason"
          type="text"
          maxLength={255}
          placeholder="Ferias, reuniao, manutencao ou indisponibilidade"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
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

      <div className="md:col-span-2 flex items-end">
        <button
          type="submit"
          disabled={isPending || instructors.length === 0}
          aria-busy={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.08)] px-4 py-3 font-semibold text-brand-danger transition hover:bg-[rgba(220,53,69,0.12)] disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
          {isPending ? "Bloqueando..." : "Criar bloqueio"}
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
