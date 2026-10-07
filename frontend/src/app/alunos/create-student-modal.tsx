"use client";

import { X } from "lucide-react";
import { CreateStudentForm } from "@/app/alunos/create-student-form";

type CreateStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateStudentModal({ isOpen, onClose }: CreateStudentModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-student-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between border-b border-brand-line pb-4 mb-6">
          <div>
            <h3 id="create-student-title" className="font-display text-2xl text-brand-secondary">
              Cadastrar Novo Aluno
            </h3>
            <p className="text-xs text-brand-subtext mt-1">
              Preencha os dados essenciais para cadastrar o aluno de forma isolada e segura (LGPD).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-subtext hover:bg-brand-soft hover:text-brand-ink transition"
            aria-label="Fechar modal de cadastro"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <CreateStudentForm onSuccess={onClose} />
      </div>
    </div>
  );
}
