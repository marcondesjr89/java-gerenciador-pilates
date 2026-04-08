import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

type RouteContext = {
  params: Promise<{
    slotId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para consultar reservas.");

  if (session instanceof Response) {
    return session;
  }

  const { slotId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/bookings`,
    errorMessage: "Nao foi possivel consultar as reservas.",
    passThroughErrorBody: true
  });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para reservar aluno.");

  if (session instanceof Response) {
    return session;
  }

  const { slotId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/bookings`,
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel reservar o aluno.",
    successStatus: 201
  });
}
