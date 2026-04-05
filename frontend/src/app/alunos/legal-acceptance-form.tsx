"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, LoaderCircle } from "lucide-react";
import { SignaturePad } from "@/app/alunos/signature-pad";

type LegalAcceptanceFormProps = {
  studentId: string;
  studentName: string;
};

export function LegalAcceptanceForm({ studentId, studentName }: LegalAcceptanceFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [status, setStatus] = useState("PENDING_SIGNATURE");
  const [collectionMethod, setCollectionMethod] = useState("TABLET_SIGNATURE");
  const [isPending, startTransition] = useTransition();

  async function dataUrlToFile(dataUrl: string, fileName: string) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type || "image/png" });
  }

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const status = String(formData.get("status") ?? "PENDING_SIGNATURE");
          const collectionMethodValue = String(formData.get("collectionMethod") ?? "").trim();
          const requestPayload = {
            termType: String(formData.get("termType") ?? "LGPD_DATA_PROCESSING"),
            title: String(formData.get("title") ?? "").trim(),
            termsVersion: String(formData.get("termsVersion") ?? "").trim(),
            legalBasis: String(formData.get("legalBasis") ?? "").trim(),
            termBody: String(formData.get("termBody") ?? "").trim(),
            status,
            collectionMethod: status === "ACCEPTED" ? collectionMethodValue || null : null,
            evidenceNote: String(formData.get("evidenceNote") ?? "").trim()
          };

          const body = new FormData();
          body.set("request", new Blob([JSON.stringify(requestPayload)], { type: "application/json" }));

          if (status === "ACCEPTED" && collectionMethodValue === "TABLET_SIGNATURE") {
            const signatureDataUrl = String(formData.get("tabletSignatureDataUrl") ?? "").trim();
            if (!signatureDataUrl) {
              setErrorMessage("Colete a assinatura no tablet antes de concluir o aceite.");
              return;
            }

            body.set("tabletSignatureFile", await dataUrlToFile(signatureDataUrl, "assinatura-tablet.png"));
          }

          if (status === "ACCEPTED" && collectionMethodValue === "PRINTED_SIGNATURE") {
            const printedTermFile = formData.get("printedTermFile");
            if (!(printedTermFile instanceof File) || printedTermFile.size === 0) {
              setErrorMessage("Anexe o termo assinado em papel para concluir o aceite.");
              return;
            }

            body.set("printedTermFile", printedTermFile);
          }

          const response = await fetch(`/api/students/${studentId}/legal-acceptances`, {
            method: "POST",
            body
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel registrar o termo.");
            return;
          }

          formRef.current?.reset();
          setStatus("PENDING_SIGNATURE");
          setCollectionMethod("TABLET_SIGNATURE");
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Tipo do termo</span>
          <select
            name="termType"
            defaultValue="LGPD_DATA_PROCESSING"
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          >
            <option value="LGPD_DATA_PROCESSING">Tratamento de dados LGPD</option>
            <option value="WHATSAPP_COMMUNICATION">Comunicacao por WhatsApp</option>
            <option value="CLINICAL_RECORD_SHARING">Compartilhamento clinico</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Versao do termo</span>
          <input
            name="termsVersion"
            type="text"
            defaultValue="v1"
            maxLength={60}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            placeholder="Ex.: v1.0-mar-2026"
            required
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Titulo do documento</span>
        <input
          name="title"
          type="text"
          maxLength={255}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          placeholder="Termo de tratamento de dados pessoais"
          required
        />
      </label>

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
          <SignaturePad name="tabletSignatureDataUrl" />
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
          maxLength={255}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          placeholder="Ex.: consentimento especifico para comunicacao e prontuario"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Texto exibido ao aluno</span>
        <textarea
          name="termBody"
          rows={7}
          className="w-full rounded-[22px] border border-brand-line bg-brand-panel px-4 py-3 text-sm leading-6 text-brand-ink outline-none"
          placeholder="Cole aqui o texto integral do termo exibido ou impresso para o aluno."
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
