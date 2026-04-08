import { proxyJsonToBackend, requireStudentPortalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ slotId: string }> }) {
  const session = await requireStudentPortalApiSession("Sessao invalida para reservar horario.");

  if (session instanceof Response) {
    return session;
  }

  const { slotId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/student-portal/me/schedule-slots/${slotId}/bookings`,
    method: "POST",
    errorMessage: "Nao foi possivel reservar o horario."
  });
}
