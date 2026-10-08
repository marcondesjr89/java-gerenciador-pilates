"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return students;
    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  if (students.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
        Nenhum aluno disponivel para o modulo financeiro.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-subtext" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar aluno por nome ou e-mail..."
          aria-label="Buscar aluno no financeiro"
          className="w-full rounded-2xl border border-brand-line bg-brand-surface py-2.5 pl-10 pr-4 text-sm text-brand-ink outline-none transition focus:border-brand-primary"
        />
      </div>

      <p className="text-xs text-brand-subtext">
        Exibindo {filteredStudents.length} de {students.length} aluno(s)
      </p>

      {filteredStudents.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-4 py-8 text-center text-sm text-brand-subtext">
          Nenhum aluno encontrado para &quot;{searchTerm}&quot;.
        </div>
      ) : (
        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {filteredStudents.map((student) => {
            const isSelected = selectedStudentId === student.id;

            return (
              <a
                key={student.id}
                href={`/financeiro?tab=students&studentId=${student.id}&startDate=${startDate}&endDate=${endDate}`}
                className={
                  isSelected
                    ? "block rounded-[20px] border border-brand-primary/40 bg-brand-soft px-4 py-3.5 shadow-sm"
                    : "block rounded-[20px] border border-brand-line bg-brand-surface px-4 py-3.5 transition hover:border-brand-primary/30"
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-brand-ink">{student.fullName}</p>
                    <p className="truncate text-xs text-brand-subtext">{student.email}</p>
                  </div>
                  <span className={statusClass(student.status)}>{formatStudentStatus(student.status)}</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
