"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, LoaderCircle } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";

type GenerateInvoiceFormProps = {
  subscriptionId: string;
  defaultDueDate: string;
  onSuccess?: () => void;
};

export function GenerateInvoiceForm({
  subscriptionId,
  defaultDueDate,
  onSuccess
}: GenerateInvoiceFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const mutationInFlightRef = useRef(false);

  const dueDateFieldId = useId();

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
          setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel gerar a fatura."));
          return;
        }

        setSuccessMessage("Fatura gerada com sucesso.");
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
      className="mt-4 flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <label htmlFor={dueDateFieldId} className="text-sm font-semibold text-brand-secondary">
          Vencimento da proxima fatura
        </label>
        <input
          id={dueDateFieldId}
          name="dueDate"
          type="date"
          defaultValue={defaultDueDate}
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
        {isPending ? "Gerando..." : "Gerar fatura"}
      </button>

      {successMessage ? (
        <p role="status" aria-live="polite" className="text-sm text-brand-success">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" aria-live="assertive" className="text-sm text-brand-danger">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
