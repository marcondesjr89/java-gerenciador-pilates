import { proxyJsonToBackend, requireStudentPortalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const session = await requireStudentPortalApiSession("Sessao invalida para remarcacao.");

  if (session instanceof Response) {
    return session;
  }

  const { bookingId } = await context.params;

  if (!bookingId.trim()) {
    return badRequest("Informe a reserva para remarcacao.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as { targetSlotId?: unknown };
  const targetSlotId = readTrimmedString(body.targetSlotId);

  if (!targetSlotId) {
    return badRequest("Informe o horario de destino para a remarcacao.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/student-portal/me/bookings/${bookingId}/reschedule`,
    method: "POST",
    body: {
      targetSlotId
    },
    errorMessage: "Nao foi possivel remarcar a reserva."
  });
}
