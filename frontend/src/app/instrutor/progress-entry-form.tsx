"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardPen, LoaderCircle } from "lucide-react";
import { readActionErrorMessage, type ResourceIdResponse } from "@/lib/action-responses";
import {
  appendProgressEntryNoteTemplate,
  applyProgressEntryScorePreset,
  buildProgressEntryPayload,
  DEFAULT_PROGRESS_ENTRY_SCORE_STATE,
  getOptionalProgressEntryAttachment,
  type ProgressEntryDraft,
  PROGRESS_ENTRY_NOTE_TEMPLATES,
  PROGRESS_ENTRY_SCORE_PRESETS
} from "@/app/instrutor/progress-entry-form-logic";

type ProgressEntryFormProps = {
  studentId: string;
  latestEntryDraft?: ProgressEntryDraft | null;
  nextStudentHref?: string | null;
  nextStudentLabel?: string | null;
};

function getCurrentLocalDateTime() {
  const now = new Date();
  const timezoneOffsetInMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
}

export function ProgressEntryForm({
  studentId,
  latestEntryDraft,
  nextStudentHref,
  nextStudentLabel
}: ProgressEntryFormProps) {
  const router = useRouter();
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [instructorNotes, setInstructorNotes] = useState("");
  const [scoreState, setScoreState] = useState({ ...DEFAULT_PROGRESS_ENTRY_SCORE_STATE });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savedProgressEntry, setSavedProgressEntry] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  function releaseAnotherEntry() {
    setInstructorNotes("");
    setScoreState({ ...DEFAULT_PROGRESS_ENTRY_SCORE_STATE });
    setErrorMessage("");
    setSuccessMessage("");
    setSavedProgressEntry(false);
    setSelectedAttachment(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (selectedAttachment) {
      formData.set("attachment", selectedAttachment);
    }

    startTransition(async () => {
      setErrorMessage("");
      setSuccessMessage("");

      const payload = buildProgressEntryPayload(formData);
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
      setSavedProgressEntry(true);
      const attachment = getOptionalProgressEntryAttachment(formData);

      if (attachment) {
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
  }

  return (
    <form
      className="mt-4 grid gap-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4"
      onSubmit={handleSubmit}
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
        <span className="flex flex-col gap-2 text-sm font-semibold text-brand-secondary sm:flex-row sm:items-center sm:justify-between">
          Notas do instrutor
          {latestEntryDraft ? (
            <button
              type="button"
              onClick={() => {
                setInstructorNotes(latestEntryDraft.instructorNotes);
                setScoreState({ ...latestEntryDraft.scores });
              }}
              className="w-fit rounded-full border border-brand-line bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
            >
              Usar ultima evolucao
            </button>
          ) : null}
        </span>
        <textarea
          name="instructorNotes"
          rows={4}
          maxLength={2000}
          value={instructorNotes}
          onChange={(event) => setInstructorNotes(event.target.value)}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          placeholder="Descreva a sessao, adaptacoes, resposta do aluno e proximo foco."
          required
        />
      </label>

      <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
        <p className="text-sm font-semibold text-brand-secondary">Atalhos de anotacao</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROGRESS_ENTRY_NOTE_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => setInstructorNotes((currentNotes) => appendProgressEntryNoteTemplate(currentNotes, template.text))}
              className="rounded-full border border-brand-line bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Anexo clinico opcional</span>
        <input
          ref={attachmentInputRef}
          name="attachment"
          type="file"
          onChange={(event) => setSelectedAttachment(event.target.files?.[0] ?? null)}
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
            value={scoreState.flexibilityScore}
            onChange={(event) => setScoreState((current) => ({ ...current, flexibilityScore: event.target.value }))}
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
            value={scoreState.strengthScore}
            onChange={(event) => setScoreState((current) => ({ ...current, strengthScore: event.target.value }))}
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
            value={scoreState.painLevel}
            onChange={(event) => setScoreState((current) => ({ ...current, painLevel: event.target.value }))}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>
      </div>

      <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
        <p className="text-sm font-semibold text-brand-secondary">Presets de pontuacao</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROGRESS_ENTRY_SCORE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setScoreState(applyProgressEntryScorePreset(preset))}
              className="rounded-full border border-brand-line bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || savedProgressEntry}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ClipboardPen className="h-4 w-4" />}
        {isPending ? "Registrando..." : savedProgressEntry ? "Evolucao registrada" : "Registrar evolucao"}
      </button>

      {savedProgressEntry ? (
        <div className="rounded-2xl border border-[rgba(25,135,84,0.22)] bg-[rgba(25,135,84,0.08)] px-4 py-3">
          {successMessage ? <p className="text-sm font-semibold text-brand-success">{successMessage}</p> : null}
          {nextStudentHref ? (
            <a
              href={nextStudentHref}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primaryHover"
            >
              <ArrowRight className="h-4 w-4" />
              {nextStudentLabel ? `Ir para ${nextStudentLabel}` : "Ir para proximo aluno"}
            </a>
          ) : (
            <p className="mt-2 text-sm text-brand-subtext">Este e o ultimo aluno da fila do dia.</p>
          )}
          <button
            type="button"
            onClick={releaseAnotherEntry}
            className="mt-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
          >
            Liberar novo registro
          </button>
        </div>
      ) : null}
      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </form>
  );
}
