import { AlertCircle, CalendarClock, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionCard } from "@/components/ui/section-card";

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

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Painel inicial</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Studio em operacao</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                O dashboard ja nasce preparado para consumir os KPIs do backend e priorizar leitura rapida
                durante o expediente.
              </p>
            </div>
            <div className="rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              Ultima sincronizacao: backend local em `localhost:8080`
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <KpiCard
            label="Churn Rate"
            value="8,40%"
            helper="Leitura do risco atual de cancelamento sobre a base ativa e inativa."
            tone="primary"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiCard
            label="Taxa de ocupacao"
            value="76,00%"
            helper="Slots preenchidos no periodo com leitura imediata para recepcao e coordenacao."
            tone="success"
            icon={<CalendarClock className="h-5 w-5" />}
          />
          <KpiCard
            label="Inadimplencia"
            value="12,50%"
            helper="Faturas vencidas em aberto para apoiar cobranca e comunicacao."
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
            description="A estrutura visual ja separa claramente o que e operacional, clinico e financeiro."
          >
            <div className="space-y-4 text-sm leading-7 text-brand-subtext">
              <p>
                Proximo encaixe natural: autenticar com JWT do backend e substituir esses cards por dados reais
                do endpoint `/api/v1/dashboard/kpis`.
              </p>
              <p>
                Depois disso, a mesma base de layout pode receber alunos, prontuario, agenda inteligente e
                financeiro sem reescrever a casca da aplicacao.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
