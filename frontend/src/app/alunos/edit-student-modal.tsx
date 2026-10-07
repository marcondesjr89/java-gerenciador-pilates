"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, LoaderCircle, Save, X } from "lucide-react";
import type { Student, StudentStatus } from "@/lib/students";
import { readActionErrorMessage } from "@/lib/action-responses";

type EditStudentModalProps = {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
};

export function EditStudentModal({ student, isOpen, onClose }: EditStudentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(student.fullName);
  const [email, setEmail] = useState(student.email);
  const [phoneNumber, setPhoneNumber] = useState(student.phoneNumber);
  const [birthDate, setBirthDate] = useState(student.birthDate ?? "");
  const [status, setStatus] = useState<StudentStatus>(student.status);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const birthDateId = useId();
  const statusId = useId();

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/students/${student.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            birthDate: birthDate ? birthDate : null,
            status
          })
        });

        if (!response.ok) {
          const message = await readActionErrorMessage(response, "Nao foi possivel atualizar o aluno.");
          setErrorMessage(message);
          return;
        }

        setSuccessMessage("Dados do aluno atualizados com sucesso!");
        router.refresh();
        setTimeout(() => {
          onClose();
        }, 800);
      } catch {
        setErrorMessage("Erro inesperado ao conectar com o servidor.");
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-student-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-xl rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between border-b border-brand-line pb-4">
          <div>
            <h3 id="edit-student-title" className="font-display text-2xl text-brand-secondary">
              Editar Dados do Aluno
            </h3>
            <p className="text-xs text-brand-subtext mt-1">
              Atualize as informações cadastrais de contato e situação do aluno.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-subtext hover:bg-brand-soft hover:text-brand-ink transition"
            aria-label="Fechar modal de edição"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div>
            <label htmlFor={nameId} className="block text-xs font-medium text-brand-subtext mb-1">
              Nome Completo
            </label>
            <input
              id={nameId}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={emailId} className="block text-xs font-medium text-brand-subtext mb-1">
                E-mail
              </label>
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                required
              />
            </div>

            <div>
              <label htmlFor={phoneId} className="block text-xs font-medium text-brand-subtext mb-1">
                Telefone / WhatsApp
              </label>
              <input
                id={phoneId}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={birthDateId} className="block text-xs font-medium text-brand-subtext mb-1">
                Data de Nascimento
              </label>
              <input
                id={birthDateId}
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
              />
            </div>

            <div>
              <label htmlFor={statusId} className="block text-xs font-medium text-brand-subtext mb-1">
                Status Operacional
              </label>
              <select
                id={statusId}
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2 text-sm text-brand-ink outline-none transition focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-2xl border border-brand-line px-4 py-2.5 text-sm font-semibold text-brand-subtext hover:bg-brand-soft hover:text-brand-ink transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              aria-label={isPending ? "Salvando alterações..." : "Salvar alterações"}
              className="flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
