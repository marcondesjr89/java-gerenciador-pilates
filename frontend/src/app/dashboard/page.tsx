import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CreditCard,
  TrendingUp,
  UserCog,
  UsersRound
} from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionCard } from "@/components/ui/section-card";
import { fetchDashboardKpis } from "@/lib/dashboard";
import { requireInternalSession } from "@/lib/auth";
import { formatSpecialty, formatUtcHour } from "@/lib/formatters";
import { fetchScheduleSlots } from "@/lib/schedule";

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
  const todayIso = today.toISOString().slice(0, 10);

  const [dashboard, scheduleSlots] = await Promise.all([
    fetchDashboardKpis(session, startIso, endIso),
    fetchScheduleSlots(session, todayIso)
  ]);

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
                Visão executiva em tempo real com indicadores operacionais, grade de horários do dia e atalhos rápidos
                para recepção e gestão.
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
            description="Grade em tempo real do backend para recepção e instrutores acompanharem lotação e horários de hoje."
          >
            {scheduleSlots.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-brand-subtext/70" />
                <p className="mt-3 font-semibold text-brand-secondary">Nenhum horário cadastrado para hoje</p>
                <p className="mt-1 text-sm text-brand-subtext">Abra novos horários operacionais na agenda para liberar reservas.</p>
                <Link
                  href="/agenda"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primaryHover"
                >
                  <span>Abrir agenda</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduleSlots.map((slot) => {
                  const isFull = slot.availableSpots === 0;

                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col gap-3 rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-brand-primary px-3 py-2 text-sm font-semibold text-white">
                          {formatUtcHour(slot.startTime)}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-ink">{formatSpecialty(slot.requiredSpecialty)}</p>
                          <p className="text-sm text-brand-subtext">
                            Instrutor: {slot.instructorName} ({formatUtcHour(slot.startTime)} - {formatUtcHour(slot.endTime)})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={
                            isFull
                              ? "rounded-full bg-[rgba(220,53,69,0.12)] px-3 py-1 text-xs font-semibold text-brand-danger"
                              : "rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary"
                          }
                        >
                          {slot.bookedCount}/{slot.capacity} vagas
                        </span>
                        {isFull ? (
                          <span className="rounded-full bg-[rgba(220,53,69,0.08)] px-2 py-0.5 text-xs text-brand-danger">
                            Lotado
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 text-right">
                  <Link
                    href="/agenda"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
                  >
                    <span>Ver grade completa da agenda</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Acesso rápido operacional"
            description="Atalhos diretos e visão da sessão autenticada para agilizar a rotina interna."
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand-line bg-brand-panel p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-brand-subtext">Sessão ativa:</span>
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-secondary uppercase">
                    {session.role}
                  </span>
                </div>
                <p className="mt-1 font-semibold text-brand-ink truncate">{session.email}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/agenda"
                  className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3.5 transition hover:border-brand-primary/40 hover:bg-brand-soft"
                >
                  <div className="rounded-xl bg-brand-soft p-2.5 text-brand-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Agenda</p>
                    <p className="text-xs text-brand-subtext">Horários e reservas</p>
                  </div>
                </Link>

                <Link
                  href="/alunos"
                  className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3.5 transition hover:border-brand-primary/40 hover:bg-brand-soft"
                >
                  <div className="rounded-xl bg-brand-soft p-2.5 text-brand-primary">
                    <UsersRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Alunos</p>
                    <p className="text-xs text-brand-subtext">Fichas e anamnese</p>
                  </div>
                </Link>

                <Link
                  href="/financeiro"
                  className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3.5 transition hover:border-brand-primary/40 hover:bg-brand-soft"
                >
                  <div className="rounded-xl bg-brand-soft p-2.5 text-brand-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Financeiro</p>
                    <p className="text-xs text-brand-subtext">Planos, faturas e DRE</p>
                  </div>
                </Link>

                <Link
                  href="/usuarios"
                  className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3.5 transition hover:border-brand-primary/40 hover:bg-brand-soft"
                >
                  <div className="rounded-xl bg-brand-soft p-2.5 text-brand-primary">
                    <UserCog className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Equipe</p>
                    <p className="text-xs text-brand-subtext">Gestão de usuários</p>
                  </div>
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
