import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getSummary } from "@/app/api/notifications/outbox/summary/route";
import { POST as retryNotification } from "@/app/api/notifications/outbox/[id]/retry/route";
import { POST as processOutbox } from "@/app/api/notifications/outbox/process/route";

const requireInternalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireInternalApiSession: (...args: unknown[]) => requireInternalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("notification api routes", () => {
  beforeEach(() => {
    requireInternalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("encaminha consulta de sumario do outbox", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(
      new Response(JSON.stringify({ total: 10, pending: 2, sent: 7, failed: 1 }), { status: 200 })
    );

    await getSummary();

    expect(requireInternalApiSessionMock).toHaveBeenCalledWith(
      ["ADMIN", "RECEPTION"],
      "Sessao invalida para consultar o sumario de notificacoes."
    );
    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/notifications/outbox/summary",
      method: "GET",
      errorMessage: "Nao foi possivel consultar o sumario de notificacoes."
    });
  });

  it("retorna 400 no retry quando o id da notificacao esta vazio", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await retryNotification(new Request("http://localhost/api/notifications/outbox//retry"), {
      params: Promise.resolve({ id: "   " })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Informe a notificacao a ser reenviada."
    });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha solicitacao de retry de notificacao", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "notif-1", status: "PENDING" }), { status: 200 })
    );

    await retryNotification(new Request("http://localhost/api/notifications/outbox/notif-1/retry"), {
      params: Promise.resolve({ id: "notif-1" })
    });

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/notifications/outbox/notif-1/retry",
      method: "POST",
      errorMessage: "Nao foi possivel reenviar a notificacao."
    });
  });

  it("encaminha processamento forçado da fila do outbox", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(
      new Response(JSON.stringify({ processed: 3 }), { status: 200 })
    );

    await processOutbox();

    expect(requireInternalApiSessionMock).toHaveBeenCalledWith(
      ["ADMIN", "RECEPTION"],
      "Sessao invalida para processar a fila de notificacoes."
    );
    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/notifications/outbox/process",
      method: "POST",
      errorMessage: "Nao foi possivel processar a fila de notificacoes."
    });
  });
});
