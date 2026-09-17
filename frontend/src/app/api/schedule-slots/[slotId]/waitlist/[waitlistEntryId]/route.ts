import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest } from "@/app/api/_lib/validation";

type RouteContext = {
  params: Promise<{
    slotId: string;
    waitlistEntryId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para remover da fila de espera."
  );

  if (session instanceof Response) {
    return session;
  }

  const { slotId, waitlistEntryId } = await context.params;

  if (!slotId.trim()) {
    return badRequest("Informe o horario da fila de espera.");
  }

  if (!waitlistEntryId.trim()) {
    return badRequest("Informe a entrada da fila de espera.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/waitlist/${waitlistEntryId}`,
    method: "DELETE",
    errorMessage: "Nao foi possivel remover o aluno da fila de espera."
  });
}
