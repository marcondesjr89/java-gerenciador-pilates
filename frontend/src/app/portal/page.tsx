import { CalendarDays, Clock3, ShieldCheck, UserRound } from "lucide-react";
import { requireStudentPortalSession } from "@/lib/student-portal-auth";
import { fetchStudentPortalBookings } from "@/lib/student-portal-bookings";
import { fetchStudentPortalScheduleSlots } from "@/lib/student-portal-schedule";
import { fetchStudentPortalBilling } from "@/lib/student-portal-billing";
import { formatCurrency, formatDate, formatDateTime, formatSpecialty, getTodayIsoDate } from "@/lib/formatters";
import { formatBillingStatus, getStatusBadgeClass } from "@/lib/status";
import { PortalLogoutButton } from "@/app/portal/portal-logout-button";
import { CancelBookingButton } from "@/app/portal/cancel-booking-button";
import { RescheduleBookingPanel } from "@/app/portal/reschedule-booking-panel";
import { BookSlotButton } from "@/app/portal/book-slot-button";
import { JoinWaitlistButton } from "@/app/portal/join-waitlist-button";

type StudentPortalPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export default async function StudentPortalPage({ searchParams }: StudentPortalPageProps) {
  const session = await requireStudentPortalSession();
  const params = await searchParams;
  const selectedDate = params?.date ?? getTodayIsoDate();
  const [bookings, slots, billing] = await Promise.all([
    fetchStudentPortalBookings(session),
    fetchStudentPortalScheduleSlots(session, selectedDate),
    fetchStudentPortalBilling(session)
  ]);
  const activeSubscription = billing.subscriptions.find((subscription) => subscription.status === "ACTIVE") ?? null;
  const openInvoices = billing.invoices.filter((invoice) => invoice.status === "OPEN");

  return (
    <main className="min-h-screen bg-[var(--page-background)] px-4 py-5">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[30px] border border-brand-line bg-brand-surface px-6 py-6 shadow-panel lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-primary">Portal do aluno</p>
              <h1 className="mt-4 font-display text-4xl text-brand-secondary lg:text-5xl">{session.fullName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Consulte suas reservas ativas e acompanhe seus horarios confirmados no studio.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-brand-line bg-brand-muted px-4 py-2 text-sm text-brand-subtext">
                <UserRound className="h-4 w-4" />
                {session.email}
              </div>
              <PortalLogoutButton />
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Reservas ativas</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{bookings.length}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">Horarios confirmados no momento.</p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Próximo compromisso</p>
                <p className="mt-3 font-display text-lg text-brand-ink">
                  {bookings[0]
                    ? formatDateTime(bookings[0].startTime, { dateStyle: "full", timeStyle: "short" })
                    : "Nenhum horario ativo"}
                </p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">
                  {bookings[0] ? `Instrutor: ${bookings[0].instructorName}` : "Quando houver reservas, elas aparecerao aqui."}
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(13,110,253,0.1)] p-3 text-brand-info">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Politica de autoatendimento</p>
                <p className="mt-3 font-display text-lg text-brand-ink">Cancelamento com antecedencia</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">
                  O portal respeita a antecedencia minima configurada pelo studio para cancelamentos.
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-3 text-brand-success">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Financeiro</p>
                <p className="mt-3 font-display text-lg text-brand-ink">
                  {activeSubscription ? activeSubscription.planName : "Sem assinatura ativa"}
                </p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">
                  {openInvoices.length > 0
                    ? `${openInvoices.length} fatura(s) em aberto no portal.`
                    : "Nenhuma fatura aberta no momento."}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Minha assinatura</p>
            <h2 className="mt-2 font-display text-3xl text-brand-secondary">Plano atual</h2>

            {activeSubscription ? (
              <div className="mt-5 rounded-[24px] border border-brand-line bg-brand-panel px-5 py-5">
                <p className="font-display text-2xl text-brand-secondary">{activeSubscription.planName}</p>
                <p className="mt-2 text-sm text-brand-subtext">
                  Inicio em {formatDate(activeSubscription.startDate)}
                </p>
                <p className="mt-2 text-sm text-brand-subtext">
                  Proxima cobranca em {formatDate(activeSubscription.nextBillingDate)}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-[#0f5132] dark:text-[#75b798]">
                  Assinatura ativa
                </span>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-brand-line bg-brand-panel px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhuma assinatura ativa vinculada ao portal neste momento.
              </div>
            )}
          </article>

          <article className="rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Minhas faturas</p>
            <h2 className="mt-2 font-display text-3xl text-brand-secondary">Historico financeiro</h2>

            {billing.invoices.length > 0 ? (
              <div className="mt-5 space-y-3">
                {billing.invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-[24px] border border-brand-line bg-brand-panel px-5 py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-brand-ink">
                          Competencia {formatDate(invoice.referenceMonth)}
                        </p>
                        <p className="mt-1 text-sm text-brand-subtext">
                          Vencimento em {formatDate(invoice.dueDate)}
                        </p>
                        {invoice.paidAt ? (
                          <p className="mt-1 text-sm text-brand-subtext">
                            Pago em {formatDateTime(invoice.paidAt, { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <span className="font-semibold text-brand-secondary">{formatCurrency(invoice.amountDue)}</span>
                        <span
                          className={getStatusBadgeClass(invoice.status)}
                        >
                          {invoice.status === "OPEN" ? "Em aberto" : formatBillingStatus(invoice.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-brand-line bg-brand-panel px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhuma fatura vinculada a sua conta do portal.
              </div>
            )}
          </article>
        </section>

        <section className="rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <div className="flex flex-col gap-5 border-b border-brand-line pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Autoatendimento</p>
              <h2 className="mt-2 font-display text-3xl text-brand-secondary">Reservar nova aula</h2>
              <p className="mt-2 text-sm leading-7 text-brand-subtext">
                Consulte horarios futuros e reserve diretamente quando houver vaga, ou entre na lista de espera.
              </p>
            </div>

            <form className="flex flex-col gap-2 rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              <label htmlFor="portal-filter-date" className="font-semibold">
                Filtrar dia
              </label>
              <input
                id="portal-filter-date"
                name="date"
                type="date"
                aria-label="Filtrar horarios por data"
                defaultValue={selectedDate}
                className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 text-brand-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              />
              <button
                type="submit"
                className="rounded-2xl bg-brand-primary px-4 py-2 font-semibold text-white transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Atualizar horarios
              </button>
            </form>
          </div>

          {slots.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-brand-line bg-brand-panel px-5 py-12 text-center text-sm text-brand-subtext">
              Nenhum horario futuro disponivel para a data selecionada.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {slots.map((slot) => (
                <article key={slot.id} className="rounded-[24px] border border-brand-line bg-brand-panel px-5 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="font-display text-2xl text-brand-secondary">
                        {formatDateTime(slot.startTime, { dateStyle: "full", timeStyle: "short" })}
                      </p>
                      <p className="text-sm text-brand-subtext">
                        ate {formatDateTime(slot.endTime, { timeStyle: "short" })}
                      </p>
                      <p className="text-sm text-brand-subtext">Instrutor: {slot.instructorName}</p>
                      <p className="text-sm text-brand-subtext">Especialidade: {formatSpecialty(slot.requiredSpecialty)}</p>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <span
                        className={slot.availableSpots > 0 ? getStatusBadgeClass("ACTIVE") : getStatusBadgeClass("OPEN")}
                      >
                        {slot.availableSpots > 0 ? `${slot.availableSpots} vaga(s)` : "Lotado"}
                      </span>
                      {slot.availableSpots > 0 ? (
                        <BookSlotButton slotId={slot.id} />
                      ) : (
                        <JoinWaitlistButton slotId={slot.id} />
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Minhas reservas</p>
              <h2 className="mt-2 font-display text-3xl text-brand-secondary">Agenda confirmada</h2>
              <p className="mt-2 text-sm leading-7 text-brand-subtext">
                Veja seus horarios ativos e cancele apenas quando a politica do studio permitir.
              </p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-brand-line bg-brand-panel px-5 py-12 text-center text-sm text-brand-subtext">
              Nenhuma reserva ativa encontrada para sua conta no portal.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {bookings.map((booking) => (
                <article key={booking.id} className="rounded-[24px] border border-brand-line bg-brand-panel px-5 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="font-display text-2xl text-brand-secondary">
                        {formatDateTime(booking.startTime, { dateStyle: "full", timeStyle: "short" })}
                      </p>
                      <p className="text-sm text-brand-subtext">
                        {formatDateTime(booking.startTime, { dateStyle: "full", timeStyle: "short" })} ate{" "}
                        {formatDateTime(booking.endTime, { timeStyle: "short" })}
                      </p>
                      <p className="text-sm text-brand-subtext">Instrutor: {booking.instructorName}</p>
                      <p className="text-sm text-brand-subtext">Especialidade: {formatSpecialty(booking.requiredSpecialty)}</p>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <span className="rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-[#0f5132] dark:text-[#75b798]">
                        Confirmada
                      </span>
                      <CancelBookingButton bookingId={booking.id} />
                    </div>
                  </div>

                  <RescheduleBookingPanel bookingId={booking.id} initialDate={booking.startTime.slice(0, 10)} />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
