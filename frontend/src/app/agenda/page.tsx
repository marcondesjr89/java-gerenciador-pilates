import { CalendarDays, Clock3, UsersRound } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { SlotBookingsPanel } from "@/app/agenda/slot-bookings-panel";
import { requireInternalSession } from "@/lib/auth";
import { fetchScheduleSlots } from "@/lib/schedule";
import { fetchActiveStudents, fetchInstructors } from "@/lib/users";
import { CreateSlotForm } from "@/app/agenda/create-slot-form";

type AgendaPageProps = {
  searchParams?: Promise<{
    date?: string;
    created?: string;
  }>;
};

function getTodayIsoDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza"
  }).format(new Date());
}

function formatDayLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
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

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const session = await requireInternalSession();
  const params = await searchParams;
  const selectedDate = params?.date ?? getTodayIsoDate();
  const created = params?.created === "1";
  const slots = await fetchScheduleSlots(session, selectedDate);
  const instructors = await fetchInstructors(session);
  const students = await fetchActiveStudents(session);

  const totalCapacity = slots.reduce((sum, slot) => sum + slot.capacity, 0);
  const totalBooked = slots.reduce((sum, slot) => sum + slot.bookedCount, 0);
  const occupancyRate = totalCapacity === 0 ? 0 : (totalBooked / totalCapacity) * 100;

  return (
    <AppShell currentPath="/agenda">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Agenda operacional</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Rotina do dia em tempo real</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Leitura direta dos slots cadastrados no backend para recepcao acompanhar capacidade,
                instrutores e pontos de saturacao.
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

        <section className="grid gap-5 xl:grid-cols-3">
          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Data selecionada</p>
                <p className="mt-3 font-display text-3xl text-brand-ink">{formatDayLabel(selectedDate)}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">Visao diaria para recepcao e coordenacao.</p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Slots do dia</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{slots.length}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">Quantidade de horarios operacionais encontrados.</p>
              </div>
              <div className="rounded-2xl bg-[rgba(13,110,253,0.1)] p-3 text-brand-info">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Ocupacao do dia</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">
                  {occupancyRate.toFixed(2).replace(".", ",")}%
                </p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">
                  {totalBooked} reservas confirmadas em {totalCapacity} vagas totais.
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-3 text-brand-success">
                <UsersRound className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <SectionCard
          title="Criar horario"
          description="Primeiro fluxo operacional da agenda ligado ao backend para abrir novos slots de atendimento."
        >
          {created ? (
            <div className="mb-4 rounded-2xl border border-brand-line bg-[rgba(25,135,84,0.12)] px-4 py-3 text-sm text-brand-success">
              Horario criado com sucesso para a data selecionada.
            </div>
          ) : null}

          {instructors.length > 0 ? (
            <CreateSlotForm
              selectedDate={selectedDate}
              instructors={instructors.map((instructor) => ({
                id: instructor.id,
                fullName: instructor.fullName,
                specialties: instructor.specialties
              }))}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface px-5 py-8 text-sm text-brand-subtext">
              Nenhum instrutor ativo disponivel para criar horario.
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Grade do dia"
          description="Slots reais vindos do backend, ordenados por horario para facilitar encaixe e acompanhamento."
        >
          {slots.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
              Nenhum slot encontrado para a data selecionada.
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => {
                const isFull = slot.availableSpots === 0;

                return (
                  <article key={slot.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-brand-primary px-3 py-2 text-sm font-semibold text-white">
                          {formatHour(slot.startTime)}
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-brand-ink">{formatSpecialty(slot.requiredSpecialty)}</p>
                          <p className="text-sm text-brand-subtext">Instrutor: {slot.instructorName}</p>
                          <p className="text-sm text-brand-subtext">
                            {formatHour(slot.startTime)} - {formatHour(slot.endTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-sm lg:items-end">
                        <span
                          className={
                            isFull
                              ? "rounded-full bg-[rgba(220,53,69,0.12)] px-3 py-1 font-semibold text-brand-danger"
                              : "rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary"
                          }
                        >
                          {slot.bookedCount}/{slot.capacity} vagas ocupadas
                        </span>
                        <span className="text-brand-subtext">
                          {isFull ? "Lotado" : `${slot.availableSpots} vaga(s) restante(s)`}
                        </span>
                      </div>
                    </div>

                    <SlotBookingsPanel slotId={slot.id} availableSpots={slot.availableSpots} students={students} />
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
