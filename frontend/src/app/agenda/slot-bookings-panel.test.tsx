import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SlotBookingsPanel } from "@/app/agenda/slot-bookings-panel";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

const students = [
  {
    id: "student-1",
    fullName: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
    active: true
  },
  {
    id: "student-2",
    fullName: "Bruno Aluno",
    email: "bruno@example.com",
    role: "STUDENT",
    active: true
  }
];

describe("SlotBookingsPanel", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("atualiza vagas e bloqueia novo envio para o mesmo aluno apos reservar", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "booking-1",
          slotId: "slot-1",
          studentId: "student-1",
          studentName: "Ana Aluna",
          status: "BOOKED"
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    render(<SlotBookingsPanel slotId="slot-1" availableSpots={1} students={students} />);

    fireEvent.click(screen.getByRole("button", { name: "Reservar aluno" }));

    expect(await screen.findByText("Reserva criada com sucesso para este horario.")).toBeInTheDocument();
    expect(screen.getByText("Este horario esta lotado. Abaixo voce pode incluir alunos na fila de espera.")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Ana Aluna" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bruno Aluno" })).toBeInTheDocument();

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("devolve a vaga localmente ao cancelar reserva carregada", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "booking-1",
              slotId: "slot-1",
              studentId: "student-1",
              studentName: "Ana Aluna",
              status: "BOOKED"
            }
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<SlotBookingsPanel slotId="slot-1" availableSpots={0} students={students} />);

    fireEvent.click(screen.getByRole("button", { name: "Ver reservas" }));
    expect(await screen.findByText("Reserva ativa neste slot")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));

    expect(await screen.findByText("Reserva cancelada com sucesso.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reservar aluno" })).not.toBeDisabled();
    expect(screen.queryByText("Reserva ativa neste slot")).not.toBeInTheDocument();
  });

  it("mantem horario lotado quando cancelamento promove aluno da fila", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "booking-1",
              slotId: "slot-1",
              studentId: "student-1",
              studentName: "Ana Aluna",
              status: "BOOKED"
            }
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "waitlist-1",
              slotId: "slot-1",
              studentId: "student-2",
              studentName: "Bruno Aluno",
              status: "WAITING",
              promotedAt: null
            }
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "booking-2",
              slotId: "slot-1",
              studentId: "student-2",
              studentName: "Bruno Aluno",
              status: "BOOKED"
            }
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<SlotBookingsPanel slotId="slot-1" availableSpots={0} students={students} />);

    fireEvent.click(screen.getByRole("button", { name: "Ver reservas" }));
    expect(await screen.findByText("Reserva ativa neste slot")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver fila de espera" }));
    expect(await screen.findByText("Posicao 1 na fila")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));

    expect(await screen.findByText("Reserva cancelada com sucesso.")).toBeInTheDocument();
    expect(screen.getByText("Bruno Aluno")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reservar aluno" })).toBeDisabled();
    expect(screen.getByText("Nenhum aluno aguardando neste horario.")).toBeInTheDocument();
  });

  it("ignora clique duplo enquanto a reserva esta em andamento", async () => {
    let resolveRequest: (response: Response) => void = () => {};
    vi.mocked(global.fetch).mockImplementation(
      () => new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<SlotBookingsPanel slotId="slot-1" availableSpots={1} students={students} />);

    fireEvent.click(screen.getByRole("button", { name: "Reservar aluno" }));
    fireEvent.click(screen.getByRole("button", { name: "Reservando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveRequest(
      new Response(
        JSON.stringify({
          id: "booking-1",
          slotId: "slot-1",
          studentId: "student-1",
          studentName: "Ana Aluna",
          status: "BOOKED"
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    expect(await screen.findByText("Reserva criada com sucesso para este horario.")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("ignora clique duplo enquanto inclusao na fila esta em andamento", async () => {
    let resolveRequest: (response: Response) => void = () => {};
    vi.mocked(global.fetch).mockImplementation(
      () => new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<SlotBookingsPanel slotId="slot-1" availableSpots={0} students={students} />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar na fila de espera" }));
    fireEvent.click(screen.getByRole("button", { name: "Incluindo..." }));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveRequest(
      new Response(
        JSON.stringify({
          id: "waitlist-1",
          slotId: "slot-1",
          studentId: "student-1",
          studentName: "Ana Aluna",
          status: "WAITING",
          promotedAt: null
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    expect(await screen.findByText("Aluno incluido na fila de espera deste horario.")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("remove aluno carregado da fila de espera", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "waitlist-1",
              slotId: "slot-1",
              studentId: "student-1",
              studentName: "Ana Aluna",
              status: "WAITING",
              promotedAt: null
            }
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "waitlist-1",
            slotId: "slot-1",
            studentId: "student-1",
            studentName: "Ana Aluna",
            status: "CANCELED",
            promotedAt: null
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      );

    render(<SlotBookingsPanel slotId="slot-1" availableSpots={0} students={students} />);

    fireEvent.click(screen.getByRole("button", { name: "Ver fila de espera" }));
    expect(await screen.findByText("Posicao 1 na fila")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remover da fila" }));

    expect(await screen.findByText("Aluno removido da fila de espera.")).toBeInTheDocument();
    expect(screen.getByText("Nenhum aluno aguardando neste horario.")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenLastCalledWith("/api/schedule-slots/slot-1/waitlist/waitlist-1", {
      method: "DELETE"
    });
  });

  it("remarca reserva para outro horario disponivel no dia", async () => {
    const targetSlots = [
      {
        id: "slot-2",
        instructorUserId: "instructor-2",
        instructorName: "Carla Instrutora",
        requiredSpecialty: "PILATES_SOLO",
        startTime: "2026-10-02T10:00:00Z",
        endTime: "2026-10-02T11:00:00Z",
        capacity: 2,
        bookedCount: 1,
        availableSpots: 1
      }
    ];

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "booking-1",
              slotId: "slot-1",
              studentId: "student-1",
              studentName: "Ana Aluna",
              status: "BOOKED"
            }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            canceled: { id: "booking-1", status: "CANCELED" },
            created: { id: "booking-2", status: "BOOKED", slotId: "slot-2" }
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
      );

    render(
      <SlotBookingsPanel
        slotId="slot-1"
        availableSpots={0}
        students={students}
        availableSlotsForReschedule={targetSlots}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ver reservas" }));
    expect(await screen.findByText("Reserva ativa neste slot")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remarcar" }));
    expect(screen.getByRole("combobox", { name: "Novo horario para Ana Aluna" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar remarcacao" }));

    expect(await screen.findByText("Reserva remarcada com sucesso.")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/schedule-slots/slot-1/bookings/booking-1/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetSlotId: "slot-2" })
    });
    expect(screen.getByText("Nenhuma reserva ativa neste horario.")).toBeInTheDocument();
  });

  it("ignora clique duplo durante a remarcacao de reserva", async () => {
    const targetSlots = [
      {
        id: "slot-2",
        instructorUserId: "instructor-2",
        instructorName: "Carla Instrutora",
        requiredSpecialty: "PILATES_SOLO",
        startTime: "2026-10-02T10:00:00Z",
        endTime: "2026-10-02T11:00:00Z",
        capacity: 2,
        bookedCount: 1,
        availableSpots: 1
      }
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: "booking-1",
            slotId: "slot-1",
            studentId: "student-1",
            studentName: "Ana Aluna",
            status: "BOOKED"
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    let resolveReschedule: (response: Response) => void = () => {};
    render(
      <SlotBookingsPanel
        slotId="slot-1"
        availableSpots={0}
        students={students}
        availableSlotsForReschedule={targetSlots}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ver reservas" }));
    expect(await screen.findByText("Reserva ativa neste slot")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remarcar" }));

    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise<Response>((resolve) => {
        resolveReschedule = resolve;
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirmar remarcacao" }));
    fireEvent.click(screen.getByRole("button", { name: "Remarcando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(2); // 1 listagem + 1 remarcacao

    resolveReschedule(
      new Response(
        JSON.stringify({
          canceled: { id: "booking-1", status: "CANCELED" },
          created: { id: "booking-2", status: "BOOKED", slotId: "slot-2" }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    expect(await screen.findByText("Reserva remarcada com sucesso.")).toBeInTheDocument();
    const rescheduleCalls = vi
      .mocked(global.fetch)
      .mock.calls.filter(([url]) => url.toString().includes("reschedule"));
    expect(rescheduleCalls).toHaveLength(1);
  });
});
