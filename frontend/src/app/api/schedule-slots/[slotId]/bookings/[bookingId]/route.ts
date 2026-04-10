import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest } from "@/app/api/_lib/validation";

type RouteContext = {
  params: Promise<{
    slotId: string;
    bookingId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para cancelar reserva.");

  if (session instanceof Response) {
    return session;
  }

  const { slotId, bookingId } = await context.params;

  if (!slotId.trim()) {
    return badRequest("Informe o horario da reserva.");
  }

  if (!bookingId.trim()) {
    return badRequest("Informe a reserva a ser cancelada.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/bookings/${bookingId}`,
    method: "DELETE",
    errorMessage: "Nao foi possivel cancelar a reserva."
  });
}
