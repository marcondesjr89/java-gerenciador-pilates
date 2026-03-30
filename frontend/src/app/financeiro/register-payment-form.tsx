"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeDollarSign, LoaderCircle } from "lucide-react";

type RegisterPaymentFormProps = {
  invoiceId: string;
  amountDue: string;
};

const paymentMethods = [
  { value: "PIX", label: "Pix" },
  { value: "CREDIT_CARD", label: "Cartao" },
  { value: "BANK_TRANSFER", label: "Transferencia" },
  { value: "CASH", label: "Dinheiro" }
];

function getCurrentLocalDateTime() {
  const now = new Date();
  const timezoneOffsetInMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
}

export function RegisterPaymentForm({ invoiceId, amountDue }: RegisterPaymentFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const defaultPaidAt = useMemo(() => getCurrentLocalDateTime(), []);

  return (
    <form
      className="mt-4 grid gap-3 rounded-2xl border border-brand-line bg-brand-surface px-4 py-4"
      action={(formData) => {
        startTransition(async () => {
          setErrorMessage("");
          setSuccessMessage("");

          const paidAtValue = String(formData.get("paidAt") ?? "");
          const response = await fetch(`/api/billing/invoices/${invoiceId}/payments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              amountPaid: String(formData.get("amountPaid") ?? "").trim(),
              paymentMethod: String(formData.get("paymentMethod") ?? ""),
              paidAt: new Date(paidAtValue).toISOString(),
              externalReference: String(formData.get("externalReference") ?? "").trim() || null
            })
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
            setErrorMessage(payload.message || "Nao foi possivel registrar o pagamento.");
            return;
          }

          setSuccessMessage("Pagamento registrado com sucesso.");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Valor pago</span>
          <input
            name="amountPaid"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={amountDue}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Metodo</span>
          <select
            name="paymentMethod"
            defaultValue="PIX"
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Data e hora</span>
          <input
            name="paidAt"
            type="datetime-local"
            defaultValue={defaultPaidAt}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-secondary">Referencia externa</span>
          <input
            name="externalReference"
            type="text"
            maxLength={255}
            className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none"
            placeholder="ID Pix, NSU ou comprovante"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BadgeDollarSign className="h-4 w-4" />}
        {isPending ? "Registrando..." : "Registrar pagamento"}
      </button>

      {successMessage ? <p className="text-sm text-brand-success">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </form>
  );
}
