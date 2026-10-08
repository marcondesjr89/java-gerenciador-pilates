import Link from "next/link";
import { BarChart3, CreditCard, Users } from "lucide-react";

type FinanceTabsNavProps = {
  activeTab: "overview" | "plans" | "students";
  startDate: string;
  endDate: string;
  studentId?: string | null;
  plansCount: number;
  studentsCount: number;
  overdueInvoicesCount: number;
};

export function FinanceTabsNav({
  activeTab,
  startDate,
  endDate,
  studentId,
  plansCount,
  studentsCount,
  overdueInvoicesCount
}: FinanceTabsNavProps) {
  const baseQuery = `startDate=${startDate}&endDate=${endDate}`;
  const studentQuery = studentId ? `&studentId=${studentId}` : "";

  return (
    <div
      role="tablist"
      aria-label="Seções do módulo financeiro"
      className="flex flex-wrap items-center gap-2 border-b border-brand-line pb-4"
    >
      <Link
        href={`/financeiro?tab=overview&${baseQuery}${studentQuery}`}
        role="tab"
        aria-selected={activeTab === "overview"}
        className={
          activeTab === "overview"
            ? "flex items-center gap-2.5 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition"
            : "flex items-center gap-2.5 rounded-2xl border border-brand-line bg-brand-surface px-5 py-3 text-sm font-medium text-brand-secondary transition hover:bg-brand-soft hover:text-brand-ink"
        }
      >
        <BarChart3 className="h-4 w-4" />
        <span>Visão Geral & DRE</span>
        {overdueInvoicesCount > 0 ? (
          <span
            className={
              activeTab === "overview"
                ? "rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white"
                : "rounded-full bg-[rgba(220,53,69,0.12)] px-2 py-0.5 text-xs font-semibold text-brand-danger"
            }
          >
            {overdueInvoicesCount} pendente(s)
          </span>
        ) : null}
      </Link>

      <Link
        href={`/financeiro?tab=plans&${baseQuery}${studentQuery}`}
        role="tab"
        aria-selected={activeTab === "plans"}
        className={
          activeTab === "plans"
            ? "flex items-center gap-2.5 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition"
            : "flex items-center gap-2.5 rounded-2xl border border-brand-line bg-brand-surface px-5 py-3 text-sm font-medium text-brand-secondary transition hover:bg-brand-soft hover:text-brand-ink"
        }
      >
        <CreditCard className="h-4 w-4" />
        <span>Gestão de Planos</span>
        <span
          className={
            activeTab === "plans"
              ? "rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white"
              : "rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-subtext"
          }
        >
          {plansCount}
        </span>
      </Link>

      <Link
        href={`/financeiro?tab=students&${baseQuery}${studentQuery}`}
        role="tab"
        aria-selected={activeTab === "students"}
        className={
          activeTab === "students"
            ? "flex items-center gap-2.5 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition"
            : "flex items-center gap-2.5 rounded-2xl border border-brand-line bg-brand-surface px-5 py-3 text-sm font-medium text-brand-secondary transition hover:bg-brand-soft hover:text-brand-ink"
        }
      >
        <Users className="h-4 w-4" />
        <span>Contas a Receber & Alunos</span>
        <span
          className={
            activeTab === "students"
              ? "rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white"
              : "rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-subtext"
          }
        >
          {studentsCount}
        </span>
      </Link>
    </div>
  );
}
