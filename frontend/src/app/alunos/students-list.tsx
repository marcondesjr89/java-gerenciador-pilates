import { formatCpf, formatPhone } from "@/app/alunos/helpers";
import type { Student } from "@/lib/students";

type StudentsListProps = {
  students: Student[];
  selectedStudentId: string | null;
  searchTerm?: string;
  currentPage: number;
  totalPages: number;
};

export function StudentsList({ students, selectedStudentId, searchTerm, currentPage, totalPages }: StudentsListProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
        Nenhum aluno localizado com o filtro atual.
      </div>
    );
  }

  const buildPageHref = (studentId: string, page: number) =>
    `/alunos?studentId=${studentId}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ""}&page=${page}`;

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const isSelected = selectedStudentId === student.id;

        return (
          <a
            key={student.id}
            href={buildPageHref(student.id, currentPage)}
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
                <span className="text-brand-subtext">{student.lgpdConsent ? "LGPD confirmado" : "LGPD pendente"}</span>
              </div>
            </div>
          </a>
        );
      })}

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4 text-sm text-brand-subtext md:flex-row md:items-center md:justify-between">
          <span>
            Pagina {currentPage + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 0 ? (
              <a
                href={`/alunos?${searchTerm ? `q=${encodeURIComponent(searchTerm)}&` : ""}page=${currentPage - 1}`}
                className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 font-semibold text-brand-secondary transition hover:border-brand-primary"
              >
                Pagina anterior
              </a>
            ) : null}
            {currentPage + 1 < totalPages ? (
              <a
                href={`/alunos?${searchTerm ? `q=${encodeURIComponent(searchTerm)}&` : ""}page=${currentPage + 1}`}
                className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 font-semibold text-brand-secondary transition hover:border-brand-primary"
              >
                Proxima pagina
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
