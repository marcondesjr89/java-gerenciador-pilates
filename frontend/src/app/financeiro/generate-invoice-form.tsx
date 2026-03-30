"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, LoaderCircle } from "lucide-react";

type GenerateInvoiceFormProps = {
  subscriptionId: string;
  defaultDueDate: string;
};

export function GenerateInvoiceForm({ subscriptionId, defaultDueDate }: GenerateInvoiceFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const response = await fetch("/api/billing/invoices/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              subscriptionId,
              dueDate: String(formData.get("dueDate") ?? "")
            })
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel gerar a fatura.");
            return;
          }

          setSuccessMessage("Fatura gerada com sucesso.");
          router.refresh();
        });
      }}
    >
      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-secondary">Vencimento da proxima fatura</span>
        <input
          name="dueDate"
          type="date"
          defaultValue={defaultDueDate}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
        {isPending ? "Gerando..." : "Gerar fatura"}
      </button>

      {successMessage ? <p className="text-sm text-brand-success">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </form>
  );
}
