import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

type RouteContext = {
  params: Promise<{
    slotId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para consultar a fila de espera."
  );

  if (session instanceof Response) {
    return session;
  }

  const { slotId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/waitlist`,
    errorMessage: "Nao foi possivel consultar a fila de espera.",
    passThroughErrorBody: true
  });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para incluir na fila de espera."
  );

  if (session instanceof Response) {
    return session;
  }

  const { slotId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/waitlist`,
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel incluir o aluno na fila de espera.",
    successStatus: 201
  });
}
