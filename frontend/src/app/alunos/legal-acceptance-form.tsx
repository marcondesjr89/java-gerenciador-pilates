"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, LoaderCircle } from "lucide-react";
import { SignaturePad } from "@/app/alunos/signature-pad";
import {
  buildLegalAcceptanceDraft,
  buildLegalAcceptanceRequestPayload,
  getLegalTermNatureLabel,
  getLegalTermTypeLabel,
  type LegalTermType,
  resolveLegalAcceptanceAttachments
} from "@/app/alunos/legal-acceptance-form-logic";
import { readActionErrorMessage } from "@/lib/action-responses";

type LegalAcceptanceFormProps = {
  studentId: string;
  studentName: string;
};

const TERM_OPTIONS: Array<{ value: LegalTermType; label: string }> = [
  { value: "LGPD_DATA_PROCESSING", label: "Tratamento de dados LGPD" },
  { value: "WHATSAPP_COMMUNICATION", label: "Comunicacao por WhatsApp" },
  { value: "CLINICAL_RECORD_SHARING", label: "Compartilhamento clinico" },
  { value: "EVOLUTION_IMAGE_CAPTURE", label: "Imagem para evolucao clinica" }
];

const TERM_PRESETS: Array<{ label: string; helper: string; values: LegalTermType[] }> = [
  {
    label: "Cadastro basico",
    helper: "LGPD para abertura da ficha do aluno.",
    values: ["LGPD_DATA_PROCESSING"]
  },
  {
    label: "Cadastro com WhatsApp",
    helper: "LGPD com comunicacao operacional do dia a dia.",
    values: ["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION"]
  },
  {
    label: "Pacote clinico completo",
    helper: "LGPD, compartilhamento clinico e imagem de evolucao.",
    values: ["LGPD_DATA_PROCESSING", "CLINICAL_RECORD_SHARING", "EVOLUTION_IMAGE_CAPTURE"]
  }
];

export function LegalAcceptanceForm({ studentId, studentName }: LegalAcceptanceFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [coveredTermTypes, setCoveredTermTypes] = useState<LegalTermType[]>(["LGPD_DATA_PROCESSING"]);
  const initialDraft = buildLegalAcceptanceDraft(["LGPD_DATA_PROCESSING"]);
  const [title, setTitle] = useState(initialDraft.title);
  const [termsVersion, setTermsVersion] = useState(initialDraft.termsVersion);
  const [legalBasis, setLegalBasis] = useState(initialDraft.legalBasis);
  const [termBody, setTermBody] = useState(initialDraft.termBody);
  const [status, setStatus] = useState("PENDING_SIGNATURE");
  const [collectionMethod, setCollectionMethod] = useState("TABLET_SIGNATURE");
  const [signatureResetKey, setSignatureResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const draft = buildLegalAcceptanceDraft(coveredTermTypes);
    setTitle(draft.title);
    setTermsVersion(draft.termsVersion);
    setLegalBasis(draft.legalBasis);
    setTermBody(draft.termBody);
  }, [coveredTermTypes]);

  async function dataUrlToFile(dataUrl: string, fileName: string) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type || "image/png" });
  }

  function toggleCoveredTermType(termType: LegalTermType) {
    setCoveredTermTypes((current) => {
      if (current.includes(termType)) {
        return current.length === 1 ? current : current.filter((value) => value !== termType);
      }
      return [...current, termType];
    });
  }

  function applyCoveredTermTypes(nextCoveredTermTypes: LegalTermType[]) {
    setCoveredTermTypes(nextCoveredTermTypes);
  }

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const requestPayload = buildLegalAcceptanceRequestPayload(formData);
          const attachments = resolveLegalAcceptanceAttachments(formData);
          if (attachments.errorMessage) {
            setErrorMessage(attachments.errorMessage);
            return;
          }

          const body = new FormData();
          body.set("request", new Blob([JSON.stringify(requestPayload)], { type: "application/json" }));

          if (attachments.tabletSignatureDataUrl) {
            body.set("tabletSignatureFile", await dataUrlToFile(attachments.tabletSignatureDataUrl, "assinatura-tablet.png"));
          }

          if (attachments.printedTermFile) {
            body.set("printedTermFile", attachments.printedTermFile);
          }

          const response = await fetch(`/api/students/${studentId}/legal-acceptances`, {
            method: "POST",
            body
          });

          if (!response.ok) {
            setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel registrar o termo."));
            return;
          }

          formRef.current?.reset();
          const resetDraft = buildLegalAcceptanceDraft(["LGPD_DATA_PROCESSING"]);
          setCoveredTermTypes(["LGPD_DATA_PROCESSING"]);
          setTitle(resetDraft.title);
          setTermsVersion(resetDraft.termsVersion);
          setLegalBasis(resetDraft.legalBasis);
          setTermBody(resetDraft.termBody);
          setStatus("PENDING_SIGNATURE");
          setCollectionMethod("TABLET_SIGNATURE");
          setSignatureResetKey((current) => current + 1);
          setSuccessMessage(`Termo registrado para ${studentName}.`);
          router.refresh();
        });
      }}
    >
      {successMessage ? (
        <div className="rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-4">
        <fieldset className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Presets operacionais</p>
            <div className="grid gap-2 md:grid-cols-3">
              {TERM_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyCoveredTermTypes(preset.values)}
                  className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-left transition hover:border-brand-primary hover:bg-brand-soft"
                >
                  <span className="block text-sm font-semibold text-brand-secondary">{preset.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-brand-subtext">{preset.helper}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <legend className="text-sm font-semibold text-brand-secondary">Tipos do termo</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyCoveredTermTypes(TERM_OPTIONS.map((option) => option.value))}
                className="rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
              >
                Marcar todos
              </button>
              <button
                type="button"
                onClick={() => applyCoveredTermTypes(["LGPD_DATA_PROCESSING"])}
                className="rounded-full border border-brand-line bg-brand-panel px-3 py-1 text-xs font-semibold text-brand-subtext transition hover:border-brand-primary hover:text-brand-primary"
              >
                Voltar ao padrao
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {TERM_OPTIONS.map((option) => {
              const checked = coveredTermTypes.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={`rounded-2xl border px-4 py-3 text-sm transition ${
                    checked
                      ? "border-brand-primary bg-brand-soft text-brand-secondary"
                      : "border-brand-line bg-brand-panel text-brand-ink"
                  }`}
                >
                  <input
                    name="coveredTermTypes"
                    type="checkbox"
                    value={option.value}
                    checked={checked}
                    onChange={() => toggleCoveredTermType(option.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold">{option.label}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-brand-subtext">
            Ao selecionar mais de um item, o sistema monta automaticamente um texto consolidado para uma unica assinatura.
          </p>
          <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Resumo da coleta</p>
            <p className="mt-2 text-sm font-semibold text-brand-secondary">
              {coveredTermTypes.length === 1
                ? "Coleta individual"
                : `Coleta consolidada com ${coveredTermTypes.length} termos`}
            </p>
            <p className="mt-2 text-sm leading-6 text-brand-subtext">
              {coveredTermTypes
                .map((termType) => getLegalTermTypeLabel(termType))
                .join(", ")}
              .
            </p>
            <p className="mt-2 text-xs leading-5 text-brand-subtext">
              Natureza juridica: {coveredTermTypes.map((termType) => getLegalTermNatureLabel(termType)).join("; ")}.
            </p>
          </div>
        </fieldset>

        <input type="hidden" name="termType" value={coveredTermTypes[0]} readOnly />
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Versao do termo</span>
          <input
            name="termsVersion"
            type="text"
            value={termsVersion}
            onChange={(event) => setTermsVersion(event.target.value)}
            maxLength={60}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Titulo do documento</span>
        <input
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <div className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
        Modelo juridico carregado automaticamente a partir dos tipos selecionados. Revise e ajuste apenas se houver excecao operacional.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Status inicial</span>
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          >
            <option value="PENDING_SIGNATURE">Pendente de assinatura</option>
            <option value="ACCEPTED">Assinado agora</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Metodo de coleta</span>
          <select
            name="collectionMethod"
            value={collectionMethod}
            onChange={(event) => setCollectionMethod(event.target.value)}
            disabled={status !== "ACCEPTED"}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          >
            <option value="TABLET_SIGNATURE">Assinatura no tablet</option>
            <option value="PRINTED_SIGNATURE">Assinatura em papel</option>
            <option value="INTERNAL_RECORD">Registro interno assistido</option>
          </select>
        </label>
      </div>

      {status === "ACCEPTED" && collectionMethod === "TABLET_SIGNATURE" ? (
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Assinatura no tablet</span>
          <SignaturePad name="tabletSignatureDataUrl" resetKey={signatureResetKey} />
          <p className="text-xs text-brand-subtext">
            Para validacao em campo, teste com dedo e caneta em modo paisagem e retrato.
          </p>
        </label>
      ) : null}

      {status === "ACCEPTED" && collectionMethod === "PRINTED_SIGNATURE" ? (
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Termo assinado em papel</span>
          <input
            name="printedTermFile"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:font-semibold file:text-brand-secondary"
          />
          <p className="text-xs text-brand-subtext">Envie PDF ou imagem do termo fisico assinado.</p>
        </label>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Base legal ou observacao juridica</span>
        <input
          name="legalBasis"
          type="text"
          value={legalBasis}
          onChange={(event) => setLegalBasis(event.target.value)}
          maxLength={255}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Texto exibido ao aluno</span>
        <textarea
          name="termBody"
          value={termBody}
          onChange={(event) => setTermBody(event.target.value)}
          rows={7}
          className="w-full rounded-[22px] border border-brand-line bg-brand-panel px-4 py-3 text-sm leading-6 text-brand-ink outline-none"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Evidencia operacional</span>
        <textarea
          name="evidenceNote"
          rows={3}
          maxLength={1000}
          className="w-full rounded-[22px] border border-brand-line bg-brand-panel px-4 py-3 text-sm leading-6 text-brand-ink outline-none"
          placeholder="Ex.: assinatura colhida presencialmente na recepcao. PDF fisico arquivado na pasta do aluno."
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
        {isPending ? "Registrando termo..." : "Registrar trilha de aceite"}
      </button>

      {errorMessage ? (
        <div className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
