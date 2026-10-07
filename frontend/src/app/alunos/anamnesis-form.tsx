"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileHeart, LoaderCircle, Save } from "lucide-react";
import type { StudentAnamnesis } from "@/lib/clinical";
import { readActionErrorMessage } from "@/lib/action-responses";

type AnamnesisFormProps = {
  studentId: string;
  studentName: string;
  initialAnamnesis: StudentAnamnesis | null;
  onSaved?: () => void;
};

export function AnamnesisForm({
  studentId,
  studentName,
  initialAnamnesis,
  onSaved
}: AnamnesisFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados dos campos
  const [hasPathologies, setHasPathologies] = useState(initialAnamnesis?.hasPathologies ?? false);
  const [pathologyDetails, setPathologyDetails] = useState(initialAnamnesis?.pathologyDetails ?? "");
  const [hasSurgeries, setHasSurgeries] = useState(initialAnamnesis?.hasSurgeries ?? false);
  const [surgeryDetails, setSurgeryDetails] = useState(initialAnamnesis?.surgeryDetails ?? "");
  const [hasPain, setHasPain] = useState(initialAnamnesis?.hasPain ?? false);
  const [painDetails, setPainDetails] = useState(initialAnamnesis?.painDetails ?? "");
  const [hasHypertension, setHasHypertension] = useState(initialAnamnesis?.hasHypertension ?? false);
  const [hasOsteoporosis, setHasOsteoporosis] = useState(initialAnamnesis?.hasOsteoporosis ?? false);
  const [isPregnant, setIsPregnant] = useState(initialAnamnesis?.isPregnant ?? false);
  const [medicalClearanceRequired, setMedicalClearanceRequired] = useState(
    initialAnamnesis?.medicalClearanceRequired ?? false
  );
  const [generalObservations, setGeneralObservations] = useState(
    initialAnamnesis?.generalObservations ?? ""
  );

  // Estados de feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // IDs para acessibilidade
  const pathologyDetailsId = useId();
  const surgeryDetailsId = useId();
  const painDetailsId = useId();
  const generalObsId = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (hasPathologies && !pathologyDetails.trim()) {
      setErrorMessage("Informe os detalhes das patologias.");
      return;
    }
    if (hasSurgeries && !surgeryDetails.trim()) {
      setErrorMessage("Informe os detalhes das cirurgias.");
      return;
    }
    if (hasPain && !painDetails.trim()) {
      setErrorMessage("Informe os detalhes da dor.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/students/${studentId}/anamnesis`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            hasPathologies,
            pathologyDetails: hasPathologies ? pathologyDetails.trim() : null,
            hasSurgeries,
            surgeryDetails: hasSurgeries ? surgeryDetails.trim() : null,
            hasPain,
            painDetails: hasPain ? painDetails.trim() : null,
            hasHypertension,
            hasOsteoporosis,
            isPregnant,
            medicalClearanceRequired,
            generalObservations: generalObservations.trim() || null
          })
        });

        if (!response.ok) {
          const message = await readActionErrorMessage(response, "Nao foi possivel salvar a anamnese.");
          setErrorMessage(message);
          return;
        }

        setSuccessMessage("Anamnese e alertas clinicos atualizados com sucesso!");
        router.refresh();
        if (onSaved) {
          onSaved();
        }
      } catch {
        setErrorMessage("Erro inesperado ao conectar com o servidor.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-brand-soft p-2.5 text-brand-primary">
          <FileHeart className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-brand-secondary">
            {initialAnamnesis
              ? `Editar Anamnese e Alertas de ${studentName}`
              : `Cadastrar Anamnese e Alertas de ${studentName}`}
          </h4>
          <p className="text-xs text-brand-subtext">
            Os dados marcados aqui geram os alertas visiveis para os instrutores na agenda e atendimento.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div role="alert" className="flex items-center gap-2 rounded-2xl border border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.08)] px-4 py-3 text-sm font-medium text-brand-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {successMessage ? (
        <div role="status" className="flex items-center gap-2 rounded-2xl border border-[rgba(25,135,84,0.22)] bg-[rgba(25,135,84,0.08)] px-4 py-3 text-sm font-medium text-brand-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      {/* Condições e Detalhes */}
      <div className="space-y-4">
        {/* Patologias */}
        <div className="rounded-2xl border border-brand-line bg-brand-panel p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPathologies}
              onChange={(e) => setHasPathologies(e.target.checked)}
              className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-brand-ink">
              Possui patologias ou lesões diagnósticadas (ex.: Hérnia de disco, Artrose, Escoliose)
            </span>
          </label>
          {hasPathologies ? (
            <div className="pl-7 space-y-1">
              <label htmlFor={pathologyDetailsId} className="block text-xs font-medium text-brand-subtext">
                Detalhes da Patologia / Lesão (gera alerta clínico no painel do instrutor)
              </label>
              <textarea
                id={pathologyDetailsId}
                rows={2}
                value={pathologyDetails}
                onChange={(e) => setPathologyDetails(e.target.value)}
                placeholder="Ex.: Hérnia de disco L4-L5 - Evitar hiperflexão lombar"
                className="w-full rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                required={hasPathologies}
              />
            </div>
          ) : null}
        </div>

        {/* Cirurgias */}
        <div className="rounded-2xl border border-brand-line bg-brand-panel p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSurgeries}
              onChange={(e) => setHasSurgeries(e.target.checked)}
              className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-brand-ink">
              Histórico de cirurgias prévias
            </span>
          </label>
          {hasSurgeries ? (
            <div className="pl-7 space-y-1">
              <label htmlFor={surgeryDetailsId} className="block text-xs font-medium text-brand-subtext">
                Detalhes das cirurgias
              </label>
              <textarea
                id={surgeryDetailsId}
                rows={2}
                value={surgeryDetails}
                onChange={(e) => setSurgeryDetails(e.target.value)}
                placeholder="Ex.: Artrodese lombar em 2023"
                className="w-full rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                required={hasSurgeries}
              />
            </div>
          ) : null}
        </div>

        {/* Dor */}
        <div className="rounded-2xl border border-brand-line bg-brand-panel p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPain}
              onChange={(e) => setHasPain(e.target.checked)}
              className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-brand-ink">
              Relata dor frequente ou crônica
            </span>
          </label>
          {hasPain ? (
            <div className="pl-7 space-y-1">
              <label htmlFor={painDetailsId} className="block text-xs font-medium text-brand-subtext">
                Localização e características da dor
              </label>
              <textarea
                id={painDetailsId}
                rows={2}
                value={painDetails}
                onChange={(e) => setPainDetails(e.target.value)}
                placeholder="Ex.: Dor lombar ao permanecer muito tempo em pé"
                className="w-full rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                required={hasPain}
              />
            </div>
          ) : null}
        </div>

        {/* Marcadores rápidos */}
        <div className="rounded-2xl border border-brand-line bg-brand-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-subtext mb-3">
            Marcadores clínicos de atenção
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHypertension}
                onChange={(e) => setHasHypertension(e.target.checked)}
                className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-brand-ink">Hipertensão arterial</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOsteoporosis}
                onChange={(e) => setHasOsteoporosis(e.target.checked)}
                className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-brand-ink">Osteoporose / Osteopenia</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPregnant}
                onChange={(e) => setIsPregnant(e.target.checked)}
                className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-brand-ink">Gestante</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={medicalClearanceRequired}
                onChange={(e) => setMedicalClearanceRequired(e.target.checked)}
                className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-brand-ink">Exige liberação médica</span>
            </label>
          </div>
        </div>

        {/* Observações Gerais */}
        <div className="rounded-2xl border border-brand-line bg-brand-panel p-4 space-y-1">
          <label htmlFor={generalObsId} className="block text-xs font-medium text-brand-subtext">
            Observações gerais / Recomendações aos instrutores
          </label>
          <textarea
            id={generalObsId}
            rows={3}
            value={generalObservations}
            onChange={(e) => setGeneralObservations(e.target.value)}
            placeholder="Informações adicionais para a condução dos exercícios no estúdio..."
            className="w-full rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          aria-label={isPending ? "Salvando anamnese..." : "Salvar anamnese e alertas"}
          className="flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "Salvando..." : "Salvar Anamnese & Alertas"}
        </button>
      </div>
    </form>
  );
}
