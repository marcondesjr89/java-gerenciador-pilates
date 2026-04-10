import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

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

  if (!slotId.trim()) {
    return badRequest("Informe o horario para consultar a fila de espera.");
  }

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

  if (!slotId.trim()) {
    return badRequest("Informe o horario para incluir na fila de espera.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    studentId?: unknown;
  };
  const studentId = readTrimmedString(body.studentId);

  if (!studentId) {
    return badRequest("Informe o aluno da fila de espera.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/waitlist`,
    method: "POST",
    body: {
      studentId
    },
    errorMessage: "Nao foi possivel incluir o aluno na fila de espera.",
    successStatus: 201
  });
}
