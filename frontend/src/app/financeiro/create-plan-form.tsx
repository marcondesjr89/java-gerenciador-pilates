"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, LoaderCircle } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";

type CreatePlanFormProps = {
  onSuccess?: () => void;
};

export function CreatePlanForm({ onSuccess }: CreatePlanFormProps = {}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const mutationInFlightRef = useRef(false);

  const nameFieldId = useId();
  const priceFieldId = useId();
  const billingCycleFieldId = useId();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutationInFlightRef.current || isPending) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    mutationInFlightRef.current = true;
    startTransition(async () => {
      try {
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
          setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel cadastrar o plano."));
          return;
        }

        formRef.current?.reset();
        setSuccessMessage("Plano cadastrado com sucesso.");
        router.refresh();
        if (onSuccess) {
          setTimeout(onSuccess, 600);
        }
      } finally {
        mutationInFlightRef.current = false;
      }
    });
  }

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      onSubmit={handleSubmit}
    >
      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success"
        >
          {successMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={nameFieldId} className="text-sm font-semibold text-brand-secondary">
          Nome do plano
        </label>
        <input
          id={nameFieldId}
          name="name"
          type="text"
          maxLength={150}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          placeholder="Pilates 2x por semana"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={priceFieldId} className="text-sm font-semibold text-brand-secondary">
            Valor (R$)
          </label>
          <input
            id={priceFieldId}
            name="priceAmount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
            placeholder="220.00"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={billingCycleFieldId} className="text-sm font-semibold text-brand-secondary">
            Ciclo em meses
          </label>
          <input
            id={billingCycleFieldId}
            name="billingCycleMonths"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
        {isPending ? "Salvando..." : "Cadastrar plano"}
      </button>

      {errorMessage ? (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary"
        >
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
