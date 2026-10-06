import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest } from "@/app/api/_lib/validation";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para reenviar notificacao."
  );

  if (session instanceof Response) {
    return session;
  }

  const { id } = await context.params;

  if (!id.trim()) {
    return badRequest("Informe a notificacao a ser reenviada.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/notifications/outbox/${id}/retry`,
    method: "POST",
    errorMessage: "Nao foi possivel reenviar a notificacao."
  });
}
