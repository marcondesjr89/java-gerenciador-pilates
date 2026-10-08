"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { CreatePlanForm } from "@/app/financeiro/create-plan-form";

type CreatePlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatePlanModal({ isOpen, onClose }: CreatePlanModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-plan-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between border-b border-brand-line pb-4 mb-6">
          <div>
            <h3 id="create-plan-modal-title" className="font-display text-2xl text-brand-secondary">
              Novo Plano de Mensalidade
            </h3>
            <p className="text-xs text-brand-subtext mt-1">
              Cadastre um novo plano de mensalidade para disponibilizar a contratação aos alunos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-subtext hover:bg-brand-soft hover:text-brand-ink transition"
            aria-label="Fechar modal de cadastro de plano"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <CreatePlanForm onSuccess={onClose} />
      </div>
    </div>
  );
}
