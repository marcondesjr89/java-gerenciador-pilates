"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, LoaderCircle } from "lucide-react";
import type { InstructorUser } from "@/lib/users";

type CreateBlockFormProps = {
  selectedDate: string;
  instructors: InstructorUser[];
};

function toIsoDateTime(date: string, time: string) {
  return `${date}T${time}:00Z`;
}

export function CreateBlockForm({ selectedDate, instructors }: CreateBlockFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(formData) => {
        startTransition(async () => {
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
              startTime: toIsoDateTime(selectedDate, startLocalTime),
              endTime: toIsoDateTime(selectedDate, endLocalTime),
              reason
            })
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel criar o bloqueio.");
            return;
          }

          formRef.current?.reset();
          setSuccessMessage("Bloqueio criado com sucesso para a data selecionada.");
          router.refresh();
        });
      }}
      ref={formRef}
    >
      {successMessage ? (
        <div className="md:col-span-2 rounded-2xl border border-brand-line bg-[rgba(220,53,69,0.08)] px-4 py-3 text-sm text-brand-danger">
          {successMessage}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Instrutor</span>
        <select
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
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Motivo</span>
        <input
          name="reason"
          type="text"
          maxLength={255}
          placeholder="Ferias, reuniao, manutencao ou indisponibilidade"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
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

      <div className="md:col-span-2 flex items-end">
        <button
          type="submit"
          disabled={isPending || instructors.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.08)] px-4 py-3 font-semibold text-brand-danger transition hover:bg-[rgba(220,53,69,0.12)] disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
          {isPending ? "Bloqueando..." : "Criar bloqueio"}
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
