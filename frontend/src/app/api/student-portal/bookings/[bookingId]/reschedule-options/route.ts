import { proxyJsonToBackend, requireStudentPortalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, isIsoDate, readTrimmedString } from "@/app/api/_lib/validation";

export async function GET(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const session = await requireStudentPortalApiSession("Sessao invalida para consultar remarcacao.");

  if (session instanceof Response) {
    return session;
  }

  const { bookingId } = await context.params;
  if (!bookingId.trim()) {
    return badRequest("Informe a reserva para consultar remarcacao.");
  }

  const url = new URL(request.url);
  const date = readTrimmedString(url.searchParams.get("date"));

  if (!isIsoDate(date)) {
    return badRequest("Informe a data desejada.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/student-portal/me/bookings/${bookingId}/reschedule-options?date=${encodeURIComponent(date)}`,
    errorMessage: "Nao foi possivel carregar opcoes de remarcacao."
  });
}
