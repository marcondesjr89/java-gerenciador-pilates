import { proxyJsonToBackend, requireStudentPortalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const session = await requireStudentPortalApiSession("Sessao invalida para remarcacao.");

  if (session instanceof Response) {
    return session;
  }

  const { bookingId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/student-portal/me/bookings/${bookingId}/reschedule`,
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel remarcar a reserva."
  });
}
