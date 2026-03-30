import { CalendarDays, ClipboardPen, UserRound } from "lucide-react";
import { requireInstructorSession } from "@/lib/auth";
import { fetchScheduleSlots, fetchSlotBookings } from "@/lib/schedule";
import { fetchClinicalRecord } from "@/lib/clinical";
import { ProgressEntryForm } from "@/app/instrutor/progress-entry-form";

type InstructorPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza"
  }).format(new Date());
}

function formatHour(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

function formatSpecialty(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function InstructorPage({ searchParams }: InstructorPageProps) {
  const session = await requireInstructorSession();
  const params = await searchParams;
  const selectedDate = params?.date ?? getToday();
  const allSlots = await fetchScheduleSlots(session, selectedDate);
  const instructorSlots = allSlots.filter((slot) => slot.instructorUserId === session.userId);
  const bookingsBySlot = await Promise.all(
    instructorSlots.map(async (slot) => ({
      slotId: slot.id,
      bookings: await fetchSlotBookings(session, slot.id)
    }))
  );
  const uniqueStudentIds = Array.from(
    new Set(bookingsBySlot.flatMap((entry) => entry.bookings.map((booking) => booking.studentId)))
  );
  const clinicalRecords = await Promise.all(
    uniqueStudentIds.map(async (studentId) => ({
      studentId,
      record: await fetchClinicalRecord(session, studentId)
    }))
  );
  const clinicalRecordByStudentId = new Map(clinicalRecords.map((entry) => [entry.studentId, entry.record]));
  const totalStudents = bookingsBySlot.reduce((sum, entry) => sum + entry.bookings.length, 0);

  return (
    <main className="min-h-screen bg-[var(--page-background)] px-3 py-4 md:px-4">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-[28px] border border-brand-line bg-brand-surface p-5 shadow-panel md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Modo instrutor</p>
              <h1 className="mt-3 font-display text-4xl text-brand-secondary">{session.fullName}</h1>
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
            </form>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
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
        </section>

        <section className="space-y-4">
          {instructorSlots.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
              Nenhum horario encontrado para este instrutor na data selecionada.
            </div>
          ) : (
            instructorSlots.map((slot) => {
              const slotBookings = bookingsBySlot.find((entry) => entry.slotId === slot.id)?.bookings ?? [];

              return (
                <article key={slot.id} className="rounded-[26px] border border-brand-line bg-brand-surface p-5 shadow-panel">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
                        {formatHour(slot.startTime)} - {formatHour(slot.endTime)}
                      </p>
                      <h2 className="mt-2 font-display text-3xl text-brand-secondary">
                        {formatSpecialty(slot.requiredSpecialty)}
                      </h2>
                      <p className="mt-2 text-sm text-brand-subtext">
                        {slot.bookedCount}/{slot.capacity} aluno(s) confirmados neste horario.
                      </p>
                    </div>

                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
                      {slot.availableSpots > 0 ? `${slot.availableSpots} vaga(s) ainda livres` : "Horario cheio"}
                    </span>
                  </div>

                  {slotBookings.length === 0 ? (
                    <div className="mt-5 rounded-[20px] border border-dashed border-brand-line bg-brand-panel px-4 py-8 text-center text-sm text-brand-subtext">
                      Nenhum aluno confirmado neste horario.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {slotBookings.map((booking) => (
                        <div key={booking.id} className="rounded-[20px] border border-brand-line bg-brand-panel px-4 py-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-semibold text-brand-ink">{booking.studentName}</p>
                              <p className="text-sm text-brand-subtext">Aluno confirmado para este horario</p>
                            </div>
                            <span className="rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success">
                              Presenca aguardada
                            </span>
                          </div>

                          {(() => {
                            const clinicalRecord = clinicalRecordByStudentId.get(booking.studentId);
                            const latestEntry = clinicalRecord?.progressEntries[0] ?? null;

                            return (
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Alertas clinicos</p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {clinicalRecord?.anamnesis?.alerts.length ? (
                                      clinicalRecord.anamnesis.alerts.map((alert) => (
                                        <span
                                          key={alert}
                                          className="rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                                        >
                                          {alert}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success">
                                        Sem alertas ativos
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-3 text-sm text-brand-subtext">
                                    {clinicalRecord?.anamnesis?.generalObservations || "Sem observacoes gerais registradas."}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Ultima evolucao</p>
                                  {latestEntry ? (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-sm text-brand-subtext">
                                        {new Date(latestEntry.recordedAt).toLocaleString("pt-BR", {
                                          dateStyle: "short",
                                          timeStyle: "short"
                                        })}
                                      </p>
                                      <p className="text-sm text-brand-subtext">
                                        Flexibilidade: {latestEntry.flexibilityScore ?? "-"} | Forca: {latestEntry.strengthScore ?? "-"} | Dor: {latestEntry.painLevel ?? "-"}
                                      </p>
                                      <p className="text-sm leading-6 text-brand-subtext">{latestEntry.instructorNotes}</p>
                                    </div>
                                  ) : (
                                    <p className="mt-3 text-sm text-brand-subtext">Nenhuma evolucao registrada ate agora.</p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          <ProgressEntryForm studentId={booking.studentId} />
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
