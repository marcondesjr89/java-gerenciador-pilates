import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

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
  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/bookings/${bookingId}`,
    method: "DELETE",
    errorMessage: "Nao foi possivel cancelar a reserva."
  });
}
