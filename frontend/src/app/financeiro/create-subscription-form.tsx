"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ScrollText } from "lucide-react";
import type { BillingPlan } from "@/lib/billing";

type CreateSubscriptionFormProps = {
  studentId: string;
  plans: BillingPlan[];
  defaultStartDate: string;
};

export function CreateSubscriptionForm({ studentId, plans, defaultStartDate }: CreateSubscriptionFormProps) {
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
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel criar a assinatura.");
            return;
          }

          setSuccessMessage("Assinatura criada com sucesso.");
          router.refresh();
        });
      }}
    >
      {successMessage ? (
        <div className="rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
          {successMessage}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Plano</span>
        <select
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
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Inicio</span>
        <input
          name="startDate"
          type="date"
          defaultValue={defaultStartDate}
          className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isPending || plans.length === 0}
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
        <div className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
