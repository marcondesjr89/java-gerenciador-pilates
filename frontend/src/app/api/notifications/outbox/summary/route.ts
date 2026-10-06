import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function GET() {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para consultar o sumario de notificacoes."
  );

  if (session instanceof Response) {
    return session;
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/notifications/outbox/summary",
    method: "GET",
    errorMessage: "Nao foi possivel consultar o sumario de notificacoes."
  });
}
