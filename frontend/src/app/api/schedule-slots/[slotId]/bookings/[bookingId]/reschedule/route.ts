import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, readJsonBody, readTrimmedString, requireRouteParam } from "@/app/api/_lib/validation";

type RouteContext = {
  params: Promise<{
    slotId: string;
    bookingId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para remarcar reserva.");

  if (session instanceof Response) {
    return session;
  }

  const { slotId, bookingId } = await context.params;

  const slotIdError = requireRouteParam(slotId, "Informe o horario da reserva.");
  if (slotIdError) {
    return slotIdError;
  }

  const bookingIdError = requireRouteParam(bookingId, "Informe a reserva a ser remarcada.");
  if (bookingIdError) {
    return bookingIdError;
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as Record<string, unknown>;
  const targetSlotId = readTrimmedString(body.targetSlotId);

  if (!targetSlotId) {
    return badRequest("Informe o horario de destino para a remarcacao.");
  }

  if (targetSlotId === slotId.trim()) {
    return badRequest("O horario de destino deve ser diferente do horario atual.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId.trim()}/bookings/${bookingId.trim()}/reschedule`,
    method: "POST",
    body: {
      targetSlotId
    },
    errorMessage: "Nao foi possivel remarcar a reserva."
  });
}
