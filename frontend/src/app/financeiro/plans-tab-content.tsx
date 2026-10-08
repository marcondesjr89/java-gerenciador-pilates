"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreatePlanModal } from "@/app/financeiro/create-plan-modal";
import { PlansWallet } from "@/app/financeiro/plans-wallet";
import { SectionCard } from "@/components/ui/section-card";
import type { BillingPlan } from "@/lib/billing";

type PlansTabContentProps = {
  plans: BillingPlan[];
};

export function PlansTabContent({ plans }: PlansTabContentProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[24px] border border-brand-line bg-brand-surface p-6 shadow-sm">
        <div>
          <h2 className="font-display text-2xl text-brand-secondary">Carteira de Planos Comerciais</h2>
          <p className="mt-1 text-sm text-brand-subtext">
            Gerencie os planos cadastrados, periodicidade de cobrança e novos pacotes do studio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Plano</span>
        </button>
      </div>

      <SectionCard
        title="Planos vigentes"
        description="Planos vindos do backend com ciclo de cobrança e situação ativa/cancelada."
      >
        <PlansWallet plans={plans} />
      </SectionCard>

      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
