import { Search, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { requireInternalSession } from "@/lib/auth";
import { fetchStudents } from "@/lib/students";
import { CreateStudentForm } from "@/app/alunos/create-student-form";

type StudentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    studentId?: string;
  }>;
};

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value;
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

function getAge(value: string) {
  const today = new Date();
  const birthDate = new Date(`${value}T12:00:00`);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const session = await requireInternalSession();
  const params = await searchParams;
  const searchTerm = params?.q?.trim().toLowerCase() ?? "";
  const students = await fetchStudents(session);
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) {
      return true;
    }

    const searchable = [student.fullName, student.email, student.cpf, student.phoneNumber].join(" ").toLowerCase();
    return searchable.includes(searchTerm);
  });
  const selectedStudent =
    filteredStudents.find((student) => student.id === params?.studentId) ??
    filteredStudents[0] ??
    students.find((student) => student.id === params?.studentId) ??
    null;
  const activeCount = students.filter((student) => student.status === "ACTIVE").length;
  const inactiveCount = students.length - activeCount;
  const lgpdCount = students.filter((student) => student.lgpdConsent).length;

  return (
    <AppShell currentPath="/alunos">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Modulo de alunos</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Cadastro e leitura operacional</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Primeira entrega do modulo de alunos conectada ao backend real para recepcao consultar a base,
                abrir novos cadastros e validar dados essenciais do aluno.
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

        <section className="grid gap-5 xl:grid-cols-3">
          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Base total</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{students.length}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">Alunos cadastrados no backend.</p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <UsersRound className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Ativos x inativos</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{activeCount}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">
                  {inactiveCount} inativo(s) para acompanhamento comercial e clinico.
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(13,110,253,0.1)] p-3 text-brand-info">
                <UserRound className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">LGPD registrado</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{lgpdCount}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">
                  {students.length - lgpdCount} cadastro(s) ainda sem consentimento marcado.
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-3 text-brand-success">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Cadastrar aluno"
            description="Entrada operacional para recepcao criar alunos na base principal com os campos essenciais."
          >
            <CreateStudentForm />
          </SectionCard>

          <SectionCard
            title="Ficha resumida"
            description="Leitura rapida do aluno selecionado para validar contato, situacao e consentimento."
          >
            {selectedStudent ? (
              <div className="space-y-5">
                <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Aluno selecionado</p>
                      <h2 className="mt-2 font-display text-3xl text-brand-secondary">{selectedStudent.fullName}</h2>
                      <p className="mt-2 text-sm text-brand-subtext">
                        {selectedStudent.status === "ACTIVE" ? "Ativo na operacao atual" : "Inativo na base interna"}
                      </p>
                    </div>

                    <span
                      className={
                        selectedStudent.status === "ACTIVE"
                          ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                          : "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                      }
                    >
                      {selectedStudent.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">CPF</p>
                    <p className="mt-2 font-semibold text-brand-ink">{formatCpf(selectedStudent.cpf)}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Telefone</p>
                    <p className="mt-2 font-semibold text-brand-ink">{formatPhone(selectedStudent.phoneNumber)}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Nascimento</p>
                    <p className="mt-2 font-semibold text-brand-ink">
                      {formatDate(selectedStudent.birthDate)} ({getAge(selectedStudent.birthDate)} anos)
                    </p>
                  </div>
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">LGPD</p>
                    <p className="mt-2 font-semibold text-brand-ink">
                      {selectedStudent.lgpdConsent ? "Consentimento registrado" : "Consentimento pendente"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Contato principal</p>
                  <p className="mt-3 font-semibold text-brand-ink">{selectedStudent.email}</p>
                  <p className="mt-2 text-sm text-brand-subtext">{formatPhone(selectedStudent.phoneNumber)}</p>
                  <p className="mt-4 text-xs text-brand-subtext">
                    Cadastro criado em {formatDateTime(selectedStudent.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhum aluno encontrado para o filtro informado.
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Base de alunos"
          description="Lista operacional para recepcao localizar rapidamente alunos ativos e inativos."
        >
          {filteredStudents.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
              Nenhum aluno localizado com o filtro atual.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;

                return (
                  <a
                    key={student.id}
                    href={`/alunos?studentId=${student.id}${params?.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                    className={
                      isSelected
                        ? "block rounded-[20px] border border-brand-primary/30 bg-brand-soft px-4 py-4"
                        : "block rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4 transition hover:border-brand-primary/30"
                    }
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-brand-ink">{student.fullName}</p>
                        <p className="text-sm text-brand-subtext">
                          {formatCpf(student.cpf)} - {student.email}
                        </p>
                        <p className="text-sm text-brand-subtext">{formatPhone(student.phoneNumber)}</p>
                      </div>

                      <div className="flex flex-col gap-2 text-sm md:items-end">
                        <span
                          className={
                            student.status === "ACTIVE"
                              ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 font-semibold text-brand-success"
                              : "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 font-semibold text-brand-danger"
                          }
                        >
                          {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </span>
                        <span className="text-brand-subtext">
                          {student.lgpdConsent ? "LGPD confirmado" : "LGPD pendente"}
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
