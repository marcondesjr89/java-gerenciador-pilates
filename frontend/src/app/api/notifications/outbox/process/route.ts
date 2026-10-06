import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST() {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para processar a fila de notificacoes."
  );

  if (session instanceof Response) {
    return session;
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/notifications/outbox/process",
    method: "POST",
    errorMessage: "Nao foi possivel processar a fila de notificacoes."
  });
}
