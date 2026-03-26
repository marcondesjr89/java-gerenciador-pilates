import { AlertCircle, CalendarClock, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionCard } from "@/components/ui/section-card";
import { fetchDashboardKpis } from "@/lib/dashboard";
import { requireInternalSession } from "@/lib/auth";

const agendaItems = [
  {
    time: "07:00",
    title: "Pilates Aparelhos",
    subtitle: "Instrutor: Marina Costa",
    status: "9/10 vagas"
  },
  {
    time: "08:30",
    title: "Reabilitacao",
    subtitle: "Instrutor: Fabio Rocha",
    status: "4/4 vagas"
  },
  {
    time: "10:00",
    title: "Solo Intermediario",
    subtitle: "Instrutor: Julia Nunes",
    status: "6/8 vagas"
  }
];

function formatPercent(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default async function DashboardPage() {
  const session = await requireInternalSession();
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);

  const startIso = startDate.toISOString().slice(0, 10);
  const endIso = endDate.toISOString().slice(0, 10);

  const dashboard = await fetchDashboardKpis(session, startIso, endIso);
  const valuesByKey = new Map(dashboard.indicators.map((indicator) => [indicator.key, indicator]));

  return (
    <AppShell currentPath="/dashboard">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Painel inicial</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Studio em operacao</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                O dashboard agora consome os indicadores operacionais reais do backend para apoiar a rotina
                de recepcao e administracao.
              </p>
            </div>
            <div className="rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              Periodo analisado: {formatDate(startDate)} a {formatDate(endDate)}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <KpiCard
            label="Churn Rate"
            value={formatPercent(valuesByKey.get("churnRate")?.value ?? 0)}
            helper={valuesByKey.get("churnRate")?.description ?? "Leitura do risco atual de cancelamento."}
            tone="primary"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiCard
            label="Taxa de ocupacao"
            value={formatPercent(valuesByKey.get("occupancyRate")?.value ?? 0)}
            helper={valuesByKey.get("occupancyRate")?.description ?? "Uso da agenda no periodo informado."}
            tone="success"
            icon={<CalendarClock className="h-5 w-5" />}
          />
          <KpiCard
            label="Inadimplencia"
            value={formatPercent(valuesByKey.get("delinquencyRate")?.value ?? 0)}
            helper={
              valuesByKey.get("delinquencyRate")?.description ?? "Faturas vencidas em aberto no periodo informado."
            }
            tone="warning"
            icon={<AlertCircle className="h-5 w-5" />}
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Agenda do dia"
            description="Visao operacional para recepcao e instrutores acompanharem ritmo, lotacao e gargalos."
          >
            <div className="space-y-3">
              {agendaItems.map((item) => (
                <div
                  key={`${item.time}-${item.title}`}
                  className="flex flex-col gap-3 rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-brand-primary px-3 py-2 text-sm font-semibold text-white">
                      {item.time}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-ink">{item.title}</p>
                      <p className="text-sm text-brand-subtext">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Backlog funcional"
            description="Com o dashboard ligado ao backend, o proximo corte natural e abrir os modulos internos."
          >
            <div className="space-y-4 text-sm leading-7 text-brand-subtext">
              <p>
                Sessao autenticada para o painel interno: <strong className="font-semibold text-brand-secondary">{session.email}</strong>
              </p>
              <p>
                A mesma casca agora pode evoluir para alunos, agenda e financeiro sem reescrever autenticacao
                e navegacao.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
