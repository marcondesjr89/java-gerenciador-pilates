import { proxyJsonToBackend, requireStudentPortalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const session = await requireStudentPortalApiSession("Sessao invalida para cancelar a reserva.");

  if (session instanceof Response) {
    return session;
  }

  const { bookingId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/student-portal/me/bookings/${bookingId}/cancel`,
    method: "POST",
    errorMessage: "Nao foi possivel cancelar a reserva."
  });
}
