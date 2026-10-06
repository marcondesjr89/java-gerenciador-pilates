import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookSlotButton } from "@/app/portal/book-slot-button";
import { CancelBookingButton } from "@/app/portal/cancel-booking-button";
import { JoinWaitlistButton } from "@/app/portal/join-waitlist-button";
import { RescheduleBookingPanel } from "@/app/portal/reschedule-booking-panel";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

function deferredResponse() {
  let resolveRequest: (response: Response) => void = () => {};
  const request = new Promise<Response>((resolve) => {
    resolveRequest = resolve;
  });

  return { request, resolveRequest };
}

describe("portal actions", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("mostra erro acessivel com role=alert ao falhar a reserva de horario", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Horario indisponivel." }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<BookSlotButton slotId="slot-1" />);
    const button = screen.getByRole("button", { name: "Reservar horario" });
    expect(button).toHaveAttribute("aria-busy", "false");

    fireEvent.click(button);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Horario indisponivel.");
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("atualiza a tela ao cancelar reserva com sucesso e expoe atributos a11y", async () => {
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 200 }));

    render(<CancelBookingButton bookingId="booking-1" />);
    const button = screen.getByRole("button", { name: "Cancelar reserva" });
    expect(button).toHaveAttribute("aria-busy", "false");

    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/student-portal/bookings/booking-1/cancel", {
        method: "POST"
      });
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("atualiza a tela ao entrar na lista de espera", async () => {
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 200 }));

    render(<JoinWaitlistButton slotId="slot-9" />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar na espera" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/student-portal/schedule-slots/slot-9/waitlist", {
        method: "POST"
      });
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("ignora clique duplo ao reservar horario", async () => {
    const { request, resolveRequest } = deferredResponse();
    vi.mocked(global.fetch).mockReturnValue(request);

    render(<BookSlotButton slotId="slot-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Reservar horario" }));
    fireEvent.click(screen.getByRole("button", { name: "Reservando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveRequest(new Response(null, { status: 200 }));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("ignora clique duplo ao cancelar reserva", async () => {
    const { request, resolveRequest } = deferredResponse();
    vi.mocked(global.fetch).mockReturnValue(request);

    render(<CancelBookingButton bookingId="booking-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveRequest(new Response(null, { status: 200 }));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("ignora clique duplo ao entrar na lista de espera", async () => {
    const { request, resolveRequest } = deferredResponse();
    vi.mocked(global.fetch).mockReturnValue(request);

    render(<JoinWaitlistButton slotId="slot-9" />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar na espera" }));
    fireEvent.click(screen.getByRole("button", { name: "Entrando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveRequest(new Response(null, { status: 200 }));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("carrega opcoes e envia remarcacao do portal", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              slotId: "slot-2",
              instructorName: "Instrutor Teste",
              requiredSpecialty: "PILATES_SOLO",
              startTime: "2026-04-20T10:00:00Z",
              endTime: "2026-04-20T11:00:00Z",
              availableSpots: 1
            }
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    render(<RescheduleBookingPanel bookingId="booking-1" initialDate="2026-04-20" />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar horarios" }));
    expect(await screen.findByText("Horario de destino")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar remarcacao" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "/api/student-portal/bookings/booking-1/reschedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ targetSlotId: "slot-2" })
        }
      );
    });

    expect(await screen.findByText("Reserva remarcada com sucesso.")).toBeInTheDocument();
    expect(refreshMock).toHaveBeenCalled();
  });

  it("ignora clique duplo ao confirmar remarcacao", async () => {
    const { request, resolveRequest } = deferredResponse();
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              slotId: "slot-2",
              instructorName: "Instrutor Teste",
              requiredSpecialty: "PILATES_SOLO",
              startTime: "2026-04-20T10:00:00Z",
              endTime: "2026-04-20T11:00:00Z",
              availableSpots: 1
            }
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockReturnValue(request);

    render(<RescheduleBookingPanel bookingId="booking-1" initialDate="2026-04-20" />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar horarios" }));
    expect(await screen.findByText("Horario de destino")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar remarcacao" }));
    fireEvent.click(screen.getByRole("button", { name: "Remarcando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(2);

    resolveRequest(new Response(null, { status: 200 }));

    expect(await screen.findByText("Reserva remarcada com sucesso.")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("renderiza campos com labels acessiveis e feedback via role=alert no painel de remarcacao", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Nenhum horario compativel encontrado." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<RescheduleBookingPanel bookingId="booking-1" initialDate="2026-04-20" />);

    const dateInput = screen.getByLabelText("Data para remarcacao");
    expect(dateInput).toHaveAttribute("id", "reschedule-date-booking-1");
    expect(dateInput).toHaveValue("2026-04-20");

    const searchButton = screen.getByRole("button", { name: "Buscar horarios" });
    expect(searchButton).toHaveAttribute("aria-busy", "false");

    fireEvent.click(searchButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Nenhum horario compativel encontrado.");
  });
});
