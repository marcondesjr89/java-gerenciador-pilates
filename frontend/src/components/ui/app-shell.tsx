import type { ReactNode } from "react";
import { Activity, CalendarDays, CreditCard, FileText, Search, UsersRound } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type NavItem = {
  label: string;
  hint: string;
  icon: ReactNode;
  active?: boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    hint: "KPI e operacao diaria",
    icon: <Activity className="h-4 w-4" />,
    active: true
  },
  {
    label: "Alunos",
    hint: "CRM e prontuario",
    icon: <UsersRound className="h-4 w-4" />
  },
  {
    label: "Agenda",
    hint: "Slots, reposicoes e lista de espera",
    icon: <CalendarDays className="h-4 w-4" />
  },
  {
    label: "Financeiro",
    hint: "Billing, DRE e DMED",
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    label: "Relatorios",
    hint: "Exportacoes e auditoria",
    icon: <FileText className="h-4 w-4" />
  }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--page-background)] text-brand-ink">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[28px] border border-brand-line bg-brand-sidebar p-5 text-white shadow-panel">
          <div className="mb-8">
            <p className="font-display text-2xl text-white">Gerenciador Pilates</p>
            <p className="mt-2 text-sm text-white/62">
              Operacao clinica, agenda e financeiro em uma unica rotina.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={
                  item.active
                    ? "rounded-2xl bg-brand-sidebarSoft px-4 py-3 text-white"
                    : "rounded-2xl px-4 py-3 text-white/78"
                }
              >
                <div className="flex items-center gap-3">
                  <span className={item.active ? "text-brand-primary" : "text-white/60"}>{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={item.active ? "text-xs text-white/72" : "text-xs text-white/48"}>
                      {item.hint}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="space-y-5">
          <header className="flex flex-col gap-4 rounded-[28px] border border-brand-line bg-brand-surface px-5 py-4 shadow-panel md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">Pilates Pro</p>
              <p className="mt-1 text-sm text-brand-subtext">Saude e bem-estar com foco em operacao clara.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-brand-line bg-brand-muted px-4 py-2 text-sm text-brand-subtext">
                <Search className="h-4 w-4" />
                Buscar modulo
              </div>
              <ThemeToggle />
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
