import { BadgeDollarSign, CreditCard, FileClock, Landmark } from "lucide-react";
import { formatCurrency } from "@/app/financeiro/helpers";

type FinanceMetricsProps = {
  revenue: string;
  netResult: string;
  overdueInvoicesCount: number;
  overdueAmount: number;
  expensesCount: number;
  totalCosts: number;
};

export function FinanceMetrics({
  revenue,
  netResult,
  overdueInvoicesCount,
  overdueAmount,
  expensesCount,
  totalCosts
}: FinanceMetricsProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-4">
      <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-subtext">Receita do periodo</p>
            <p className="mt-3 font-display text-3xl text-brand-ink">{formatCurrency(revenue)}</p>
            <p className="mt-3 text-sm leading-6 text-brand-subtext">Entradas consolidadas no DRE atual.</p>
          </div>
          <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
            <Landmark className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-subtext">Resultado liquido</p>
            <p className="mt-3 font-display text-3xl text-brand-ink">{formatCurrency(netResult)}</p>
            <p className="mt-3 text-sm leading-6 text-brand-subtext">Receita menos custos fixos e variaveis.</p>
          </div>
          <div className="rounded-2xl bg-[rgba(13,110,253,0.1)] p-3 text-brand-info">
            <BadgeDollarSign className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-subtext">Inadimplencia aberta</p>
            <p className="mt-3 font-display text-3xl text-brand-ink">{overdueInvoicesCount}</p>
            <p className="mt-3 text-sm leading-6 text-brand-subtext">{formatCurrency(String(overdueAmount))} em aberto.</p>
          </div>
          <div className="rounded-2xl bg-[rgba(220,53,69,0.08)] p-3 text-brand-danger">
            <FileClock className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-subtext">Despesas do periodo</p>
            <p className="mt-3 font-display text-3xl text-brand-ink">{expensesCount}</p>
            <p className="mt-3 text-sm leading-6 text-brand-subtext">{formatCurrency(String(totalCosts))} em custos.</p>
          </div>
          <div className="rounded-2xl bg-brand-soft p-3 text-brand-secondary">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>
  );
}
