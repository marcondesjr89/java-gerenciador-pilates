import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

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

  if (!slotId.trim()) {
    return badRequest("Informe o horario para consultar reservas.");
  }

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

  if (!slotId.trim()) {
    return badRequest("Informe o horario para reservar aluno.");
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
    return badRequest("Informe o aluno da reserva.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-slots/${slotId}/bookings`,
    method: "POST",
    body: {
      studentId
    },
    errorMessage: "Nao foi possivel reservar o aluno.",
    successStatus: 201
  });
}
