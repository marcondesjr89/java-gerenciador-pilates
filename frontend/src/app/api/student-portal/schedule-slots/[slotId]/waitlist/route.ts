import { proxyJsonToBackend, requireStudentPortalApiSession } from "@/app/api/_lib/proxy";
import { requireRouteParam } from "@/app/api/_lib/validation";

export async function POST(request: Request, context: { params: Promise<{ slotId: string }> }) {
  const session = await requireStudentPortalApiSession("Sessao invalida para entrar na lista de espera.");

  if (session instanceof Response) {
    return session;
  }

  const { slotId } = await context.params;
  const slotIdError = requireRouteParam(slotId, "Informe o horario para a lista de espera.");
  if (slotIdError) {
    return slotIdError;
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/student-portal/me/schedule-slots/${slotId}/waitlist`,
    method: "POST",
    errorMessage: "Nao foi possivel entrar na lista de espera."
  });
}
