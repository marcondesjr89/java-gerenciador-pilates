"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";
import type { StudentPortalAccount } from "@/lib/student-portal";

type PortalAccountFormProps = {
  studentId: string;
  defaultEmail: string;
  currentAccount: StudentPortalAccount | null;
};

export function PortalAccountForm({ studentId, defaultEmail, currentAccount }: PortalAccountFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const response = await fetch(`/api/students/${studentId}/portal-account`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: String(formData.get("email") ?? "").trim(),
              password: String(formData.get("password") ?? "")
            })
          });

          if (!response.ok) {
            setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel configurar a conta do portal."));
            return;
          }

          setSuccessMessage(
            currentAccount
              ? "Conta do portal atualizada com sucesso."
              : "Conta do portal criada com sucesso."
          );
          router.refresh();
        });
      }}
    >
      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Status atual</p>
            <p className="mt-2 font-semibold text-brand-ink">
              {currentAccount ? (currentAccount.active ? "Portal habilitado" : "Portal desativado") : "Nao configurado"}
            </p>
            <p className="mt-2 text-sm text-brand-subtext">
              {currentAccount ? `Login atual: ${currentAccount.email}` : "Use o e-mail do aluno ou um e-mail dedicado para acesso."}
            </p>
          </div>
          <span
            className={
              currentAccount?.active
                ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                : "rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary"
            }
          >
            {currentAccount?.active ? "Ativo" : "Pendente"}
          </span>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
          {successMessage}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">E-mail de acesso</span>
        <input
          name="email"
          type="email"
          defaultValue={currentAccount?.email ?? defaultEmail}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="aluno@exemplo.com"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">
          {currentAccount ? "Nova senha" : "Senha inicial"}
        </span>
        <input
          name="password"
          type="password"
          minLength={8}
          maxLength={72}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="Minimo de 8 caracteres"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {isPending ? "Salvando..." : currentAccount ? "Atualizar conta do portal" : "Criar conta do portal"}
      </button>

      {errorMessage ? (
        <div className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
