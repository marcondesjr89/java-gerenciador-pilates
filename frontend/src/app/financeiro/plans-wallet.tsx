import { formatCurrency, statusClass } from "@/app/financeiro/helpers";
import type { BillingPlan } from "@/lib/billing";

type PlansWalletProps = {
  plans: BillingPlan[];
};

export function PlansWallet({ plans }: PlansWalletProps) {
  if (plans.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
        Nenhum plano cadastrado no backend.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <article key={plan.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-brand-ink">{plan.name}</p>
              <p className="mt-1 text-sm text-brand-subtext">
                {formatCurrency(plan.priceAmount)} a cada {plan.billingCycleMonths} mes(es)
              </p>
            </div>
            <span className={statusClass(plan.active ? "ACTIVE" : "CANCELED")}>{plan.active ? "Ativo" : "Inativo"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
