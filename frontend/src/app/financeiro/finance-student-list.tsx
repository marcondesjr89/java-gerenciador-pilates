import { statusClass } from "@/app/financeiro/helpers";
import { formatStudentStatus } from "@/lib/status";
import type { Student } from "@/lib/students";

type FinanceStudentListProps = {
  students: Student[];
  selectedStudentId: string | null;
  startDate: string;
  endDate: string;
};

export function FinanceStudentList({ students, selectedStudentId, startDate, endDate }: FinanceStudentListProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
        Nenhum aluno disponivel para o modulo financeiro.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const isSelected = selectedStudentId === student.id;

        return (
          <a
            key={student.id}
            href={`/financeiro?studentId=${student.id}&startDate=${startDate}&endDate=${endDate}`}
            className={
              isSelected
                ? "block rounded-[20px] border border-brand-primary/30 bg-brand-soft px-4 py-4"
                : "block rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4 transition hover:border-brand-primary/30"
            }
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-brand-ink">{student.fullName}</p>
                <p className="mt-1 text-sm text-brand-subtext">{student.email}</p>
              </div>
              <span className={statusClass(student.status)}>{formatStudentStatus(student.status)}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
