import { AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, ClipboardPen, TimerReset, UserRound } from "lucide-react";
import { ProgressEntryForm } from "@/app/instrutor/progress-entry-form";
import { loadInstructorPage, type InstructorSearchParams } from "@/app/instrutor/load-instructor-page";
import { requireInstructorSession } from "@/lib/auth";
import { formatSpecialty, formatUtcHour } from "@/lib/formatters";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type InstructorPageProps = {
  searchParams?: Promise<InstructorSearchParams>;
};

export default async function InstructorPage({ searchParams }: InstructorPageProps) {
  const session = await requireInstructorSession();
  const params = await searchParams;
  const {
    selectedDate,
    dateNavigation,
    instructorSlots,
    totalStudents,
    selectedSlot,
    selectedSlotBookings,
    selectedBooking,
    careQueue,
    selectedBookingNavigation,
    dayOperationalSummary,
    slotOperationalSummaries,
    bookingOperationalSummaries,
    alertSummary,
    latestEntrySummary,
    progressEntryDraft,
    nextSlot
  } = await loadInstructorPage(session, params);

  return (
    <main className="min-h-screen bg-[var(--page-background)] px-3 py-4 md:px-4">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-[28px] border border-brand-line bg-brand-surface p-5 shadow-panel md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Modo instrutor</p>
                <div className="lg:hidden">
                  <ThemeToggle />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <h1 className="font-display text-3xl sm:text-4xl text-brand-secondary">{session.fullName}</h1>
                <div className="hidden lg:block">
                  <ThemeToggle />
                </div>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-brand-subtext">
                Interface de tablet para acompanhar a agenda do dia e registrar evolucao dos alunos confirmados.
              </p>
            </div>

            <form className="flex flex-col gap-2 rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              <span className="font-semibold">Filtrar dia</span>
              <input
                name="date"
                type="date"
                defaultValue={selectedDate}
                className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 text-brand-ink outline-none"
              />
              <button
                type="submit"
                className="rounded-2xl bg-brand-primary px-4 py-2 font-semibold text-white transition hover:bg-brand-primaryHover"
              >
                Atualizar agenda
              </button>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={`/instrutor?date=${dateNavigation.previousDate}`}
                  className="rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-center text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
                >
                  Anterior
                </a>
                <a
                  href={`/instrutor?date=${dateNavigation.todayDate}`}
                  className="rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-center text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
                >
                  Hoje
                </a>
                <a
                  href={`/instrutor?date=${dateNavigation.nextDate}`}
                  className="rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-center text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
                >
                  Proximo
                </a>
              </div>
            </form>
          </div>
        </section>

        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Horarios do dia</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{instructorSlots.length}</p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Alunos confirmados</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{totalStudents}</p>
              </div>
              <div className="rounded-2xl bg-[rgba(13,110,253,0.1)] p-3 text-brand-info">
                <UserRound className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Evolucao rapida</p>
                <p className="mt-3 font-display text-2xl text-brand-ink">Ao lado da aula</p>
                <p className="mt-2 text-sm text-brand-subtext">Lancamento direto por aluno agendado.</p>
              </div>
              <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-3 text-brand-success">
                <ClipboardPen className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Proxima aula</p>
                <p className="mt-3 font-display text-2xl text-brand-ink">
                  {nextSlot ? `${formatUtcHour(nextSlot.startTime)} - ${formatUtcHour(nextSlot.endTime)}` : "Sem aulas"}
                </p>
                <p className="mt-2 text-sm text-brand-subtext">
                  {nextSlot ? formatSpecialty(nextSlot.requiredSpecialty) : "Nenhum horario futuro hoje."}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <TimerReset className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        {careQueue.length > 0 ? (
          <section className="rounded-[28px] border border-brand-line bg-brand-surface p-5 shadow-panel md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Prioridades do dia</p>
                <h2 className="mt-2 font-display text-2xl text-brand-secondary">Pendencias de atendimento</h2>
                <p className="mt-2 text-sm text-brand-subtext">
                  Alunos com atencao clinica ou evolucao ainda nao registrada.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-center text-xs font-semibold text-brand-secondary sm:grid-cols-3">
                <span className="rounded-2xl bg-[rgba(220,53,69,0.08)] px-3 py-2 text-brand-danger">
                  {dayOperationalSummary.activeAlertsCount} alerta(s)
                </span>
                <span className="rounded-2xl bg-[rgba(255,193,7,0.18)] px-3 py-2">
                  {dayOperationalSummary.pendingProgressCount} sem evolucao
                </span>
                <span className="rounded-2xl bg-[rgba(25,135,84,0.12)] px-3 py-2 text-brand-success">
                  {dayOperationalSummary.completedProgressCount} ok
                </span>
              </div>
            </div>

            {dayOperationalSummary.priorityQueue.length > 0 ? (
              <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dayOperationalSummary.priorityQueue.map((item) => (
                  <a
                    key={item.bookingId}
                    href={`/instrutor?date=${selectedDate}&slotId=${item.slotId}&studentId=${item.studentId}`}
                    className="block rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4 transition hover:border-brand-primary/30"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-subtext">
                      {formatUtcHour(item.startTime)} - {formatSpecialty(item.requiredSpecialty)}
                    </p>
                    <p className="mt-2 font-semibold text-brand-ink">{item.studentName}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.hasActiveAlerts ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Alerta
                        </span>
                      ) : null}
                      {!item.hasLatestEntry ? (
                        <span className="rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 text-xs font-semibold text-brand-secondary">
                          Evolucao pendente
                        </span>
                      ) : null}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[20px] border border-dashed border-brand-line bg-brand-panel px-4 py-6 text-center text-sm text-brand-subtext">
                Nenhuma pendencia operacional para os alunos confirmados neste dia.
              </div>
            )}

            <div className="mt-5 rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Progresso das evolucoes</p>
                  <p className="mt-1 text-sm font-semibold text-brand-secondary">
                    {dayOperationalSummary.completionPercentage}% registrado
                  </p>
                </div>
                {dayOperationalSummary.nextPendingProgress ? (
                  <a
                    href={`/instrutor?date=${selectedDate}&slotId=${dayOperationalSummary.nextPendingProgress.slotId}&studentId=${dayOperationalSummary.nextPendingProgress.studentId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primaryHover"
                  >
                    <ClipboardPen className="h-4 w-4" />
                    Proxima evolucao
                  </a>
                ) : (
                  <span className="rounded-2xl bg-[rgba(25,135,84,0.12)] px-4 py-2 text-sm font-semibold text-brand-success">
                    Evolucoes do dia completas
                  </span>
                )}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-soft">
                <div
                  className="h-full rounded-full bg-brand-primary"
                  style={{ width: `${dayOperationalSummary.completionPercentage}%` }}
                />
              </div>
            </div>
          </section>
        ) : null}

        {careQueue.length > 0 ? (
          <section className="rounded-[28px] border border-brand-line bg-brand-surface p-5 shadow-panel md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Fila de atendimento</p>
                <h2 className="mt-2 font-display text-2xl text-brand-secondary">Alunos do dia</h2>
              </div>
              {selectedBookingNavigation.selectedIndex >= 0 ? (
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
                  {selectedBookingNavigation.selectedIndex + 1} de {careQueue.length}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {careQueue.map((item, index) => {
                const isSelected = selectedBooking?.studentId === item.studentId;

                return (
                  <a
                    key={item.bookingId}
                    href={`/instrutor?date=${selectedDate}&slotId=${item.slotId}&studentId=${item.studentId}`}
                    className={
                      isSelected
                        ? "block rounded-[20px] border border-brand-primary/30 bg-brand-soft px-4 py-4"
                        : "block rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4 transition hover:border-brand-primary/30"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-subtext">
                          #{index + 1} - {formatUtcHour(item.startTime)}
                        </p>
                        <p className="mt-2 font-semibold text-brand-ink">{item.studentName}</p>
                        <p className="mt-1 text-sm text-brand-subtext">{formatSpecialty(item.requiredSpecialty)}</p>
                      </div>
                      <ChevronRight className={isSelected ? "h-5 w-5 text-brand-primary" : "h-5 w-5 text-brand-subtext"} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={
                          item.hasActiveAlerts
                            ? "inline-flex items-center gap-1 rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                            : "inline-flex items-center gap-1 rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                        }
                      >
                        {item.hasActiveAlerts ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {item.hasActiveAlerts ? "Alerta" : "Sem alerta"}
                      </span>
                      <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-secondary">
                        {item.hasLatestEntry ? "Com evolucao" : "Sem evolucao"}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {instructorSlots.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center">
            <p className="font-display text-2xl text-brand-secondary">Agenda livre neste dia</p>
            <p className="mt-2 text-sm text-brand-subtext">
              Nenhum horario encontrado para este instrutor na data selecionada.
            </p>
          </div>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-brand-line bg-brand-surface p-4 shadow-panel">
              <div className="mb-4">
                <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Agenda do dia</p>
                <h2 className="mt-2 font-display text-2xl text-brand-secondary">Horarios</h2>
                <p className="mt-2 text-sm text-brand-subtext">Toque em um horario para abrir os alunos confirmados.</p>
              </div>

              <div className="space-y-3">
                {instructorSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const operationalSummary = slotOperationalSummaries[slot.id];

                  return (
                    <a
                      key={slot.id}
                      href={`/instrutor?date=${selectedDate}&slotId=${slot.id}`}
                      className={
                        isSelected
                          ? "block rounded-[22px] border border-brand-primary/30 bg-brand-soft px-4 py-4"
                          : "block rounded-[22px] border border-brand-line bg-brand-panel px-4 py-4 transition hover:border-brand-primary/30"
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-2xl text-brand-secondary">
                            {formatUtcHour(slot.startTime)}
                          </p>
                          <p className="mt-1 text-sm text-brand-subtext">
                            {formatUtcHour(slot.startTime)} - {formatUtcHour(slot.endTime)}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-brand-ink">
                            {formatSpecialty(slot.requiredSpecialty)}
                          </p>
                        </div>
                        <ChevronRight className={isSelected ? "h-5 w-5 text-brand-primary" : "h-5 w-5 text-brand-subtext"} />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-brand-subtext">{slot.bookedCount} confirmado(s)</span>
                        <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-secondary">
                          {slot.availableSpots > 0 ? `${slot.availableSpots} vaga(s)` : "Cheio"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={
                            operationalSummary.activeAlertsCount > 0
                              ? "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                              : "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                          }
                        >
                          {operationalSummary.activeAlertsCount > 0
                            ? `${operationalSummary.activeAlertsCount} alerta(s)`
                            : "Sem alertas"}
                        </span>
                        <span
                          className={
                            operationalSummary.pendingProgressCount > 0
                              ? "rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 text-xs font-semibold text-brand-secondary"
                              : "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                          }
                        >
                          {operationalSummary.pendingProgressCount > 0
                            ? `${operationalSummary.pendingProgressCount} sem evolucao`
                            : "Evolucoes ok"}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </aside>

            <section className="space-y-5">
              {selectedSlot ? (
                <>
                  <article className="rounded-[28px] border border-brand-line bg-brand-surface p-5 shadow-panel md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
                          Slot selecionado
                        </p>
                        <h2 className="mt-2 font-display text-4xl text-brand-secondary">
                          {formatUtcHour(selectedSlot.startTime)} - {formatUtcHour(selectedSlot.endTime)}
                        </h2>
                        <p className="mt-2 text-sm text-brand-subtext">
                          {formatSpecialty(selectedSlot.requiredSpecialty)} com {selectedSlot.bookedCount}/{selectedSlot.capacity} aluno(s) confirmados.
                        </p>
                      </div>

                      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
                        {selectedSlot.availableSpots > 0 ? `${selectedSlot.availableSpots} vaga(s) restantes` : "Horario cheio"}
                      </span>
                    </div>
                  </article>

                  <article className="rounded-[28px] border border-brand-line bg-brand-surface p-5 shadow-panel md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Alunos do slot</p>
                        <h3 className="mt-2 font-display text-2xl text-brand-secondary">Selecionar aluno</h3>
                      </div>
                      <p className="text-sm text-brand-subtext">{selectedSlotBookings.length} confirmado(s)</p>
                    </div>

                            {selectedSlotBookings.length === 0 ? (
                      <div className="mt-5 rounded-[20px] border border-dashed border-brand-line bg-brand-panel px-4 py-8 text-center text-sm text-brand-subtext">
                        Este horario ainda nao possui alunos confirmados. Use a agenda interna para acompanhar novas reservas.
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        {selectedSlotBookings.map((booking) => {
                          const isSelected = selectedBooking?.studentId === booking.studentId;
                          const bookingSummary = bookingOperationalSummaries[booking.studentId];

                          return (
                            <a
                              key={booking.id}
                              href={`/instrutor?date=${selectedDate}&slotId=${selectedSlot.id}&studentId=${booking.studentId}`}
                              className={
                                isSelected
                                  ? "block rounded-[20px] border border-brand-primary/30 bg-brand-soft px-4 py-4"
                                  : "block rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4 transition hover:border-brand-primary/30"
                              }
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-brand-ink">{booking.studentName}</p>
                                  <p className="mt-1 text-sm text-brand-subtext">
                                    {bookingSummary.hasLatestEntry ? "Com historico recente" : "Sem evolucao recente"}
                                  </p>
                                </div>
                                <span className="rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success">
                                  Em pauta
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                  className={
                                    bookingSummary.activeAlertsCount > 0
                                      ? "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                                      : "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                                  }
                                >
                                  {bookingSummary.activeAlertsCount > 0
                                    ? `${bookingSummary.activeAlertsCount} alerta(s)`
                                    : "Sem alertas"}
                                </span>
                                <span
                                  className={
                                    bookingSummary.hasLatestEntry
                                      ? "rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-secondary"
                                      : "rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 text-xs font-semibold text-brand-secondary"
                                  }
                                >
                                  {bookingSummary.hasLatestEntry ? "Evolucao existente" : "Registrar evolucao"}
                                </span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </article>

                  {selectedBooking ? (
                    <article className="rounded-[28px] border border-brand-line bg-brand-surface p-5 shadow-panel md:p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Aluno em foco</p>
                          <h3 className="mt-2 font-display text-3xl text-brand-secondary">{selectedBooking.studentName}</h3>
                          <p className="mt-2 text-sm text-brand-subtext">
                            Veja o resumo clinico e registre a evolucao desta aula sem trocar de tela.
                          </p>
                        </div>
                        <span className="rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success">
                          Selecionado
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {selectedBookingNavigation.previous ? (
                          <a
                            href={`/instrutor?date=${selectedDate}&slotId=${selectedBookingNavigation.previous.slotId}&studentId=${selectedBookingNavigation.previous.studentId}`}
                            className="rounded-[18px] border border-brand-line bg-brand-panel px-4 py-3 transition hover:border-brand-primary/30"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Aluno anterior</p>
                            <p className="mt-1 font-semibold text-brand-secondary">
                              {formatUtcHour(selectedBookingNavigation.previous.startTime)} - {selectedBookingNavigation.previous.studentName}
                            </p>
                          </a>
                        ) : (
                          <div className="rounded-[18px] border border-dashed border-brand-line bg-brand-panel px-4 py-3 text-sm text-brand-subtext">
                            Este e o primeiro aluno da fila.
                          </div>
                        )}

                        {selectedBookingNavigation.next ? (
                          <a
                            href={`/instrutor?date=${selectedDate}&slotId=${selectedBookingNavigation.next.slotId}&studentId=${selectedBookingNavigation.next.studentId}`}
                            className="rounded-[18px] border border-brand-line bg-brand-panel px-4 py-3 transition hover:border-brand-primary/30"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Proximo aluno</p>
                            <p className="mt-1 font-semibold text-brand-secondary">
                              {formatUtcHour(selectedBookingNavigation.next.startTime)} - {selectedBookingNavigation.next.studentName}
                            </p>
                          </a>
                        ) : (
                          <div className="rounded-[18px] border border-dashed border-brand-line bg-brand-panel px-4 py-3 text-sm text-brand-subtext">
                            Este e o ultimo aluno da fila.
                          </div>
                        )}
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="space-y-4">
                          <div className="rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Alertas clinicos</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {alertSummary.hasActiveAlerts ? (
                                alertSummary.alerts.map((alert) => (
                                  <span
                                    key={alert}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-danger/20 bg-[rgba(220,53,69,0.08)] px-3 py-1.5 text-xs font-semibold text-brand-danger"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    {alert}
                                  </span>
                                ))
                              ) : (
                                <span className="rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success">
                                  Sem alertas ativos
                                </span>
                              )}
                            </div>
                            <p className="mt-3 text-sm leading-6 text-brand-subtext">
                              {alertSummary.generalObservations}
                            </p>
                          </div>

                          <div className="rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Ultima evolucao</p>
                            {latestEntrySummary ? (
                              <div className="mt-3 space-y-2">
                                <p className="text-sm text-brand-subtext">
                                  {latestEntrySummary.recordedAtLabel}
                                </p>
                                <p className="text-sm text-brand-subtext">
                                  {latestEntrySummary.scoreSummary}
                                </p>
                                <p className="text-sm leading-6 text-brand-subtext">{latestEntrySummary.instructorNotes}</p>
                              </div>
                            ) : (
                              <p className="mt-3 text-sm text-brand-subtext">Nenhuma evolucao registrada ate agora.</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Registrar sessao</p>
                          <h4 className="mt-2 font-display text-2xl text-brand-secondary">Nova evolucao clinica</h4>
                          <ProgressEntryForm
                            studentId={selectedBooking.studentId}
                            latestEntryDraft={progressEntryDraft}
                            nextStudentHref={
                              selectedBookingNavigation.next
                                ? `/instrutor?date=${selectedDate}&slotId=${selectedBookingNavigation.next.slotId}&studentId=${selectedBookingNavigation.next.studentId}`
                                : null
                            }
                            nextStudentLabel={selectedBookingNavigation.next?.studentName ?? null}
                          />
                        </div>
                      </div>
                    </article>
                  ) : null}
                </>
              ) : null}
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
