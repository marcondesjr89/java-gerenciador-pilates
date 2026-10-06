"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, LoaderCircle, ShieldAlert, UserX } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";
import { formatDateTime } from "@/lib/formatters";
import type { Student } from "@/lib/students";

type StudentAnonymizePanelProps = {
  student: Student;
  canAnonymize: boolean;
};

export function StudentAnonymizePanel({ student, canAnonymize }: StudentAnonymizePanelProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (student.status === "ANONYMIZED") {
    return (
      <div className="rounded-[22px] border border-brand-line bg-brand-surface p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-2 text-brand-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-brand-ink">Dados pessoais anonimizados (LGPD)</h3>
            <p className="text-sm leading-6 text-brand-subtext">
              Os dados de identificação pessoal deste titular foram desassociados de forma irreversível conforme as
              diretrizes da LGPD (Art. 18). As informações fiscais e prontuários clínicos continuam preservados de forma
              desidentificada.
            </p>
            {student.anonymizedAt ? (
              <p className="text-xs text-brand-subtext">
                Data do processo: {formatDateTime(student.anonymizedAt)}
              </p>
            ) : null}
            {student.anonymizedReason ? (
              <p className="text-xs text-brand-subtext">
                Justificativa registrada: {student.anonymizedReason}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!canAnonymize) {
    return (
      <div className="rounded-[22px] border border-dashed border-brand-line bg-brand-surface p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-brand-soft p-2 text-brand-secondary">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-brand-ink">Anonimização restrita à administração</h3>
            <p className="mt-1 text-sm leading-6 text-brand-subtext">
              A solicitação de direito ao esquecimento e anonimização de cadastro exige perfil administrativo para
              garantir a conformidade regulatória.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-brand-line bg-brand-surface p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[rgba(220,53,69,0.10)] p-2 text-brand-danger">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-semibold text-brand-ink">Direito ao Esquecimento e Anonimização LGPD</h3>
            <p className="mt-1 text-sm leading-6 text-brand-subtext">
              A anonimização desassocia irreversivelmente nome, CPF, telefone, e-mail e data de nascimento do aluno. A
              conta do portal será desativada e termos de consentimento serão revogados. Esta ação só é permitida se não
              houver pendências financeiras abertas ou reservas ativas na agenda.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(async () => {
                setErrorMessage("");
                setSuccessMessage("");

                const reason = String(formData.get("reason") ?? "").trim();
                if (!reason) {
                  setErrorMessage("Informe a justificativa ou protocolo da solicitação de anonimização.");
                  return;
                }

                if (!confirmed) {
                  setErrorMessage("Marque a confirmação de ciência antes de prosseguir com a anonimização.");
                  return;
                }

                const response = await fetch(`/api/students/${student.id}/anonymize`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ reason })
                });

                if (!response.ok) {
                  setErrorMessage(
                    await readActionErrorMessage(response, "Não foi possível anonimizar o cadastro do aluno.")
                  );
                  return;
                }

                setSuccessMessage("Dados do aluno anonimizados com sucesso em conformidade com a LGPD.");
                router.refresh();
              });
            }}
          >
            {successMessage ? (
              <div
                role="status"
                className="rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success"
              >
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-2xl border border-brand-line bg-[rgba(220,53,69,0.10)] px-4 py-3 text-sm text-brand-danger"
              >
                {errorMessage}
              </div>
            ) : null}

            <label htmlFor="anonymize-reason" className="block space-y-2">
              <span className="text-sm font-semibold text-brand-secondary">
                Justificativa / Protocolo da solicitação
              </span>
              <textarea
                id="anonymize-reason"
                name="reason"
                rows={2}
                placeholder="Ex.: Solicitação expressa do titular via formulário LGPD #12345"
                className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="anonymize-confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-xs leading-5 text-brand-ink">
                Estou ciente de que esta ação é irreversível e removerá todos os dados identificáveis do titular.
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending || !confirmed}
              aria-busy={isPending}
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-danger px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
              {isPending ? "Processando anonimização..." : "Anonimizar Cadastro (Irreversível)"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
