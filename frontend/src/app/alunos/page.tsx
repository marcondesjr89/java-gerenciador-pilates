import { Search } from "lucide-react";
import { loadStudentsPage, type StudentsSearchParams } from "@/app/alunos/load-students-page";
import { StudentMetrics } from "@/app/alunos/student-metrics";
import { StudentsPageClient } from "@/app/alunos/students-page-client";
import { AppShell } from "@/components/ui/app-shell";
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
    canAnonymize,
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
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Gestão de Alunos</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Consulte a base de alunos, acesse fichas clínicas com alertas em abas e realize cadastros
                de forma isolada e em total conformidade com a LGPD.
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

        <StudentsPageClient
          students={filteredStudents}
          selectedStudent={selectedStudent}
          portalAccount={portalAccount}
          clinicalRecord={clinicalRecord}
          legalAcceptances={legalAcceptances}
          canViewClinicalRecord={canViewClinicalRecord}
          canAnonymize={canAnonymize}
          pagination={pagination}
          searchTerm={params?.q}
        />
      </div>
    </AppShell>
  );
}
