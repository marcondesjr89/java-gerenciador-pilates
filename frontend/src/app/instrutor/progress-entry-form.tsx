"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPen, LoaderCircle } from "lucide-react";
import { readActionErrorMessage, type ResourceIdResponse } from "@/lib/action-responses";
import type { CreateStudentProgressEntryPayload } from "@/lib/clinical";

type ProgressEntryFormProps = {
  studentId: string;
};

function getCurrentLocalDateTime() {
  const now = new Date();
  const timezoneOffsetInMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
}

export function ProgressEntryForm({ studentId }: ProgressEntryFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 grid gap-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const recordedAtValue = String(formData.get("recordedAt") ?? "");
          const payload: CreateStudentProgressEntryPayload = {
            recordedAt: new Date(recordedAtValue).toISOString(),
            instructorNotes: String(formData.get("instructorNotes") ?? "").trim(),
            flexibilityScore: Number(formData.get("flexibilityScore") ?? 0),
            strengthScore: Number(formData.get("strengthScore") ?? 0),
            painLevel: Number(formData.get("painLevel") ?? 0)
          };
          const response = await fetch(`/api/students/${studentId}/progress-entries`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel registrar a evolucao."));
            return;
          }

          const progressEntry = (await response.json()) as ResourceIdResponse;
          const attachment = formData.get("attachment");

          if (attachment instanceof File && attachment.size > 0) {
            const attachmentFormData = new FormData();
            attachmentFormData.set("file", attachment);

            const attachmentResponse = await fetch(
              `/api/students/${studentId}/progress-entries/${progressEntry.id}/attachments`,
              {
                method: "POST",
                body: attachmentFormData
              }
            );

            if (!attachmentResponse.ok) {
              setErrorMessage(await readActionErrorMessage(
                attachmentResponse,
                "Evolucao registrada, mas nao foi possivel anexar o arquivo clinico."
              ));
              router.refresh();
              return;
            }
          }

          setSuccessMessage("Evolucao registrada com sucesso.");
          router.refresh();
        });
      }}
    >
      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Horario do registro</span>
        <input
          name="recordedAt"
          type="datetime-local"
          defaultValue={getCurrentLocalDateTime()}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Notas do instrutor</span>
        <textarea
          name="instructorNotes"
          rows={4}
          maxLength={2000}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          placeholder="Descreva a sessao, adaptacoes, resposta do aluno e proximo foco."
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Anexo clinico opcional</span>
        <input
          name="attachment"
          type="file"
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:font-semibold file:text-brand-secondary"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Flexibilidade</span>
          <input
            name="flexibilityScore"
            type="number"
            min="0"
            max="100"
            defaultValue="70"
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Forca</span>
          <input
            name="strengthScore"
            type="number"
            min="0"
            max="100"
            defaultValue="70"
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Dor</span>
          <input
            name="painLevel"
            type="number"
            min="0"
            max="10"
            defaultValue="0"
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ClipboardPen className="h-4 w-4" />}
        {isPending ? "Registrando..." : "Registrar evolucao"}
      </button>

      {successMessage ? <p className="text-sm text-brand-success">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </form>
  );
}
