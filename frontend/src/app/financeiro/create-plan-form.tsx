"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, LoaderCircle } from "lucide-react";

export function CreatePlanForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const response = await fetch("/api/billing/plans", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: String(formData.get("name") ?? "").trim(),
              priceAmount: String(formData.get("priceAmount") ?? "").trim(),
              billingCycleMonths: Number(formData.get("billingCycleMonths") ?? 1)
            })
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel cadastrar o plano.");
            return;
          }

          setSuccessMessage("Plano cadastrado com sucesso.");
          router.refresh();
        });
      }}
    >
      {successMessage ? (
        <div className="rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
          {successMessage}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Nome do plano</span>
        <input
          name="name"
          type="text"
          maxLength={150}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="Pilates 2x por semana"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Valor</span>
          <input
            name="priceAmount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
            placeholder="220.00"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Ciclo em meses</span>
          <input
            name="billingCycleMonths"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
        {isPending ? "Salvando..." : "Cadastrar plano"}
      </button>

      {errorMessage ? (
        <div className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
