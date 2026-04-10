"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PencilLine, Trash2, X } from "lucide-react";
import type { ScheduleBlock } from "@/lib/schedule";
import type { InstructorUser } from "@/lib/users";

type ManageBlocksPanelProps = {
  blocks: ScheduleBlock[];
  instructors: InstructorUser[];
  selectedDate: string;
};

type EditingState = {
  blockId: string;
  instructorUserId: string;
  startLocalTime: string;
  endLocalTime: string;
  reason: string;
};

function formatHour(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  });
}

function toIsoDateTime(date: string, time: string) {
  return `${date}T${time}:00Z`;
}

export function ManageBlocksPanel({ blocks, instructors, selectedDate }: ManageBlocksPanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function openEditor(block: ScheduleBlock) {
    setErrorMessage("");
    setSuccessMessage("");
    setEditing({
      blockId: block.id,
      instructorUserId: block.instructorUserId,
      startLocalTime: formatHour(block.startTime),
      endLocalTime: formatHour(block.endTime),
      reason: block.reason
    });
  }

  function closeEditor() {
    setErrorMessage("");
    setEditing(null);
  }

  function updateEditing<K extends keyof EditingState>(field: K, value: EditingState[K]) {
    setEditing((current) => (current ? { ...current, [field]: value } : current));
  }

  function saveBlock() {
    if (!editing) {
      return;
    }

    startTransition(async () => {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/schedule-blocks/${editing.blockId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorUserId: editing.instructorUserId,
          startTime: toIsoDateTime(selectedDate, editing.startLocalTime),
          endTime: toIsoDateTime(selectedDate, editing.endLocalTime),
          reason: editing.reason.trim()
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
        setErrorMessage(payload.message || "Nao foi possivel editar o bloqueio.");
        return;
      }

      closeEditor();
      setSuccessMessage("Bloqueio atualizado com sucesso para a data selecionada.");
      router.refresh();
    });
  }

  function deleteBlock(blockId: string) {
    startTransition(async () => {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/schedule-blocks/${blockId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
        setErrorMessage(payload.message || "Nao foi possivel remover o bloqueio.");
        return;
      }

      if (editing?.blockId === blockId) {
        closeEditor();
      }

      setSuccessMessage("Bloqueio removido com sucesso da agenda selecionada.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {successMessage ? (
        <div className="rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}

      {blocks.map((block) => {
        const isEditing = editing?.blockId === block.id;

        return (
          <article
            key={block.id}
            className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-[rgba(220,53,69,0.08)] px-3 py-2 text-sm font-semibold text-brand-danger">
                  {formatHour(block.startTime)}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-brand-ink">{block.reason}</p>
                  <p className="text-sm text-brand-subtext">Instrutor: {block.instructorName}</p>
                  <p className="text-sm text-brand-subtext">
                    {formatHour(block.startTime)} - {formatHour(block.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditor(block)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-panel px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isPending && isEditing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.08)] px-4 py-2 text-sm font-semibold text-brand-danger transition hover:bg-[rgba(220,53,69,0.12)] disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isPending && !isEditing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Remover
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4 rounded-[20px] border border-brand-line bg-brand-panel p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-brand-secondary">Instrutor</span>
                    <select
                      value={editing.instructorUserId}
                      onChange={(event) => updateEditing("instructorUserId", event.target.value)}
                      className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
                      disabled={isPending}
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
                      type="text"
                      maxLength={255}
                      value={editing.reason}
                      onChange={(event) => updateEditing("reason", event.target.value)}
                      className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
                      disabled={isPending}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-brand-secondary">Inicio</span>
                    <input
                      type="time"
                      value={editing.startLocalTime}
                      onChange={(event) => updateEditing("startLocalTime", event.target.value)}
                      className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
                      disabled={isPending}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-brand-secondary">Fim</span>
                    <input
                      type="time"
                      value={editing.endLocalTime}
                      onChange={(event) => updateEditing("endLocalTime", event.target.value)}
                      className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
                      disabled={isPending}
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={saveBlock}
                    disabled={
                      isPending ||
                      !editing.reason.trim() ||
                      !editing.startLocalTime ||
                      !editing.endLocalTime ||
                      !editing.instructorUserId
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
                  >
                    {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                    Salvar alteracoes
                  </button>

                  <button
                    type="button"
                    onClick={closeEditor}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-75"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
