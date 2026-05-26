import { Search } from "lucide-react";
import { CreateStudentForm } from "@/app/alunos/create-student-form";
import { loadStudentsPage, type StudentsSearchParams } from "@/app/alunos/load-students-page";
import { StudentMetrics } from "@/app/alunos/student-metrics";
import { StudentProfile } from "@/app/alunos/student-profile";
import { StudentsList } from "@/app/alunos/students-list";
import { AppShell } from "@/components/ui/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { requireInternalSession } from "@/lib/auth";

type StudentsPageProps = {
  searchParams?: Promise<StudentsSearchParams>;
};

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const session = await requireInternalSession();
  const params = await searchParams;
  const {
    filteredStudents,
    selectedStudent,
    portalAccount,
    clinicalRecord,
    legalAcceptances,
    canViewClinicalRecord,
    pagination,
    metrics
  } = await loadStudentsPage(session, params);

  return (
    <AppShell currentPath="/alunos">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Modulo de alunos</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Cadastro e leitura operacional</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Primeira entrega do modulo de alunos conectada ao backend real para recepcao consultar a base, abrir
                novos cadastros e validar dados essenciais do aluno.
              </p>
            </div>

            <form className="flex flex-col gap-2 rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              <span className="font-semibold">Buscar aluno</span>
              <div className="flex items-center gap-2 rounded-2xl border border-brand-line bg-brand-surface px-4 py-2">
                <Search className="h-4 w-4 text-brand-subtext" />
                <input
                  name="q"
                  type="search"
                  defaultValue={params?.q ?? ""}
                  placeholder="Nome, CPF, telefone ou e-mail"
                  className="w-full bg-transparent text-brand-ink outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-brand-primary px-4 py-2 font-semibold text-white transition hover:bg-brand-primaryHover"
              >
                Filtrar base
              </button>
            </form>
          </div>
        </section>

        <StudentMetrics
          studentsCount={metrics.totalCount}
          activeCount={metrics.activeCount}
          inactiveCount={metrics.inactiveCount}
          lgpdCount={metrics.lgpdCount}
        />

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <SectionCard
            title="Cadastrar aluno"
            description="Entrada operacional para recepcao criar alunos na base principal com os campos essenciais."
          >
            <CreateStudentForm />
          </SectionCard>

          <SectionCard
            title="Ficha do aluno"
            description="Leitura operacional do cadastro, acesso ao portal e sinais clinicos do aluno selecionado."
          >
            <StudentProfile
              student={selectedStudent}
              portalAccount={portalAccount}
              clinicalRecord={clinicalRecord}
              legalAcceptances={legalAcceptances}
              canViewClinicalRecord={canViewClinicalRecord}
            />
          </SectionCard>
        </div>

        <SectionCard
          title="Base de alunos"
          description="Lista operacional para recepcao localizar rapidamente alunos ativos e inativos."
        >
          <StudentsList
            students={filteredStudents}
            selectedStudentId={selectedStudent?.id ?? null}
            searchTerm={params?.q}
            currentPage={pagination.page}
            totalElements={pagination.totalElements}
            totalPages={pagination.totalPages}
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
