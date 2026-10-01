"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/app/financeiro/helpers";
import { RegisterPaymentForm } from "@/app/financeiro/register-payment-form";
import type { BillingInvoice } from "@/lib/billing-types";

type OverdueInvoicesPanelProps = {
  invoices: BillingInvoice[];
  startDate: string;
  endDate: string;
};

export function OverdueInvoicesPanel({ invoices, startDate, endDate }: OverdueInvoicesPanelProps) {
  const [localInvoices, setLocalInvoices] = useState<BillingInvoice[]>(invoices);
  const [activePaymentInvoiceId, setActivePaymentInvoiceId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalInvoices(invoices);
  }, [invoices]);

  return (
    <div className="space-y-4">
      {feedbackMessage ? (
        <div className="flex items-center gap-2 rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      ) : null}

      {localInvoices.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
          Nenhuma fatura vencida no recorte atual.
        </div>
      ) : (
        <div className="space-y-3">
          {localInvoices.map((invoice) => {
            const isFormOpen = activePaymentInvoiceId === invoice.id;

            return (
              <article
                key={invoice.id}
                className="rounded-[20px] border border-brand-line bg-brand-surface p-4 transition hover:border-brand-primary/30"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-brand-ink">{invoice.studentName}</p>
                      <span className="rounded-full bg-[rgba(220,53,69,0.12)] px-2.5 py-0.5 text-xs font-semibold text-brand-danger">
                        Vencida
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brand-subtext">
                      Venceu em {formatDate(invoice.dueDate)} com valor de {formatCurrency(invoice.amountDue)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePaymentInvoiceId(isFormOpen ? null : invoice.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-line bg-brand-panel px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/40"
                    >
                      <BadgeDollarSign className="h-4 w-4 text-brand-primary" />
                      {isFormOpen ? "Fechar baixa" : "Dar baixa rápida"}
                      {isFormOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <Link
                      href={`/financeiro?startDate=${startDate}&endDate=${endDate}&studentId=${invoice.studentId}`}
                      className="inline-flex items-center justify-center gap-1 rounded-2xl border border-brand-line bg-brand-panel px-3 py-2 text-xs font-semibold text-brand-subtext transition hover:text-brand-ink"
                    >
                      <span>Ver ficha</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {isFormOpen ? (
                  <div className="mt-3 border-t border-brand-line/60 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                      Registrar baixa para {invoice.studentName}
                    </p>
                    <RegisterPaymentForm
                      invoiceId={invoice.id}
                      amountDue={invoice.amountDue}
                      onSuccess={() => {
                        setLocalInvoices((current) => current.filter((item) => item.id !== invoice.id));
                        setActivePaymentInvoiceId(null);
                        setFeedbackMessage(`Pagamento da fatura de ${invoice.studentName} registrado com sucesso.`);
                      }}
                      onCancel={() => setActivePaymentInvoiceId(null)}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
