"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ScrollText } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";
import type { BillingPlan } from "@/lib/billing";

type CreateSubscriptionFormProps = {
  studentId: string;
  plans: BillingPlan[];
  defaultStartDate: string;
  onSuccess?: () => void;
};

export function CreateSubscriptionForm({
  studentId,
  plans,
  defaultStartDate,
  onSuccess
}: CreateSubscriptionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const mutationInFlightRef = useRef(false);

  const planFieldId = useId();
  const startDateFieldId = useId();

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

        const response = await fetch("/api/billing/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            studentId,
            planId: String(formData.get("planId") ?? ""),
            startDate: String(formData.get("startDate") ?? "")
          })
        });

        if (!response.ok) {
          setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel criar a assinatura."));
          return;
        }

        formRef.current?.reset();
        setSuccessMessage("Assinatura criada com sucesso.");
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
      className="space-y-4"
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
        <label htmlFor={planFieldId} className="block text-sm font-semibold text-brand-secondary">
          Plano
        </label>
        <select
          id={planFieldId}
          name="planId"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          defaultValue={plans[0]?.id ?? ""}
          required
          disabled={plans.length === 0}
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={startDateFieldId} className="block text-sm font-semibold text-brand-secondary">
          Inicio
        </label>
        <input
          id={startDateFieldId}
          name="startDate"
          type="date"
          defaultValue={defaultStartDate}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending || plans.length === 0}
        aria-busy={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScrollText className="h-4 w-4" />}
        {isPending ? "Salvando..." : "Criar assinatura"}
      </button>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-subtext">
          Cadastre um plano antes de abrir assinaturas.
        </div>
      ) : null}

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
