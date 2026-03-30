"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus } from "lucide-react";

export function CreateStudentForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className="grid gap-4 md:grid-cols-2"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const response = await fetch("/api/students", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              fullName: String(formData.get("fullName") ?? "").trim(),
              cpf: String(formData.get("cpf") ?? "").trim(),
              email: String(formData.get("email") ?? "").trim(),
              phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
              birthDate: String(formData.get("birthDate") ?? ""),
              status: String(formData.get("status") ?? "ACTIVE"),
              lgpdConsent: formData.get("lgpdConsent") === "on"
            })
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel cadastrar o aluno.");
            return;
          }

          formRef.current?.reset();
          setSuccessMessage("Aluno cadastrado com sucesso.");
          router.refresh();
        });
      }}
    >
      {successMessage ? (
        <div className="md:col-span-2 rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
          {successMessage}
        </div>
      ) : null}

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-semibold text-brand-secondary">Nome completo</span>
        <input
          name="fullName"
          type="text"
          maxLength={255}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="Nome do aluno"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">CPF</span>
        <input
          name="cpf"
          type="text"
          inputMode="numeric"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="Somente numeros"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Telefone</span>
        <input
          name="phoneNumber"
          type="text"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="DDD + numero"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">E-mail</span>
        <input
          name="email"
          type="email"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="aluno@exemplo.com"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Nascimento</span>
        <input
          name="birthDate"
          type="date"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Status</span>
        <select
          name="status"
          defaultValue="ACTIVE"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        >
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-secondary">
        <input name="lgpdConsent" type="checkbox" className="h-4 w-4 accent-[var(--brand-primary)]" />
        Consentimento LGPD registrado
      </label>

      <div className="md:col-span-2 flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {isPending ? "Cadastrando..." : "Cadastrar aluno"}
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
