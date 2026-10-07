"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { CreateStudentModal } from "@/app/alunos/create-student-modal";
import { StudentProfile } from "@/app/alunos/student-profile";
import { StudentsList } from "@/app/alunos/students-list";
import { SectionCard } from "@/components/ui/section-card";
import type { ClinicalRecord } from "@/lib/clinical";
import type { StudentLegalAcceptance } from "@/lib/legal-acceptances";
import type { StudentPortalAccount } from "@/lib/student-portal";
import type { Student } from "@/lib/students";

type StudentsPageClientProps = {
  students: Student[];
  selectedStudent: Student | null;
  portalAccount: StudentPortalAccount | null;
  clinicalRecord: ClinicalRecord | null;
  legalAcceptances: StudentLegalAcceptance[];
  canViewClinicalRecord: boolean;
  canAnonymize: boolean;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  searchTerm?: string;
};

export function StudentsPageClient({
  students,
  selectedStudent,
  portalAccount,
  clinicalRecord,
  legalAcceptances,
  canViewClinicalRecord,
  canAnonymize,
  pagination,
  searchTerm
}: StudentsPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Botão de Ação Rápida Superior */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" />
          + Novo Aluno
        </button>
      </div>

      {/* Modal de Cadastro Isolado (Privacidade / LGPD) */}
      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Se houver aluno selecionado, exibe a Ficha em abas em destaque */}
      {selectedStudent ? (
        <div className="space-y-6">
          <StudentProfile
            student={selectedStudent}
            portalAccount={portalAccount}
            clinicalRecord={clinicalRecord}
            legalAcceptances={legalAcceptances}
            canViewClinicalRecord={canViewClinicalRecord}
            canAnonymize={canAnonymize}
          />
        </div>
      ) : null}

      {/* Base de Alunos limpa e paginada */}
      <SectionCard
        title="Base de alunos"
        description="Lista operacional para recepção e instrutores localizarem rapidamente alunos ativos e inativos."
      >
        <StudentsList
          students={students}
          selectedStudentId={selectedStudent?.id ?? null}
          searchTerm={searchTerm}
          currentPage={pagination.page}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
        />
      </SectionCard>
    </div>
  );
}
