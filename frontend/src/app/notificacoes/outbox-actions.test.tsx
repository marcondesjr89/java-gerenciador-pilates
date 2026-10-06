import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProcessOutboxButton, RetryNotificationButton } from "@/app/notificacoes/outbox-actions";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

describe("outbox-actions components", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("ProcessOutboxButton renderiza botao acessivel e processa fila com feedback status", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ processed: 2 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<ProcessOutboxButton />);

    const button = screen.getByRole("button", { name: "Processar fila agora" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-busy", "false");

    fireEvent.click(button);

    const statusFeedback = await screen.findByRole("status");
    expect(statusFeedback).toHaveTextContent("2 notificação(ões) processada(s) com sucesso.");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("ProcessOutboxButton exibe erro com role=alert quando requisicao falha", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Servico indisponivel." }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<ProcessOutboxButton />);

    fireEvent.click(screen.getByRole("button", { name: "Processar fila agora" }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent("Servico indisponivel.");
  });

  it("RetryNotificationButton renderiza botao e solicita reenvio com feedback", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "entry-1", status: "PENDING" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<RetryNotificationButton entryId="entry-1" />);

    const button = screen.getByRole("button", { name: "Tentar novamente" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    const statusFeedback = await screen.findByRole("status");
    expect(statusFeedback).toHaveTextContent("Reenvio solicitado.");
    expect(global.fetch).toHaveBeenCalledWith("/api/notifications/outbox/entry-1/retry", {
      method: "POST"
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
