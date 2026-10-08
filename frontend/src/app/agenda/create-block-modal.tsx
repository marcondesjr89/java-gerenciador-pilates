"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { CreateBlockForm } from "@/app/agenda/create-block-form";
import type { InstructorUser } from "@/lib/users";

type CreateBlockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  instructors: InstructorUser[];
};

export function CreateBlockModal({ isOpen, onClose, selectedDate, instructors }: CreateBlockModalProps) {
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
      aria-labelledby="create-block-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between border-b border-brand-line pb-4 mb-6">
          <div>
            <h3 id="create-block-modal-title" className="font-display text-2xl text-brand-secondary">
              Bloquear Horário na Agenda
            </h3>
            <p className="text-xs text-brand-subtext mt-1">
              Cadastre uma indisponibilidade para impedir novos agendamentos no intervalo selecionado.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-subtext hover:bg-brand-soft hover:text-brand-ink transition"
            aria-label="Fechar modal de bloqueio de horário"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {instructors.length > 0 ? (
          <CreateBlockForm
            selectedDate={selectedDate}
            instructors={instructors}
            onSuccess={onClose}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-soft px-5 py-8 text-sm text-brand-subtext text-center">
            Nenhum instrutor ativo disponível para bloquear agenda.
          </div>
        )}
      </div>
    </div>
  );
}
