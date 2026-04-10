import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, isIsoDateTime, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

type RouteContext = {
  params: Promise<{
    blockId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para editar bloqueio.");

  if (session instanceof Response) {
    return session;
  }

  const { blockId } = await context.params;

  if (!blockId.trim()) {
    return badRequest("Informe o bloqueio a ser editado.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    instructorUserId?: unknown;
    startTime?: unknown;
    endTime?: unknown;
    reason?: unknown;
  };
  const instructorUserId = readTrimmedString(body.instructorUserId);
  const startTime = readTrimmedString(body.startTime);
  const endTime = readTrimmedString(body.endTime);
  const reason = readTrimmedString(body.reason);

  if (!instructorUserId) {
    return badRequest("Informe o instrutor do bloqueio.");
  }

  if (!isIsoDateTime(startTime)) {
    return badRequest("Informe a data e hora de inicio do bloqueio.");
  }

  if (!isIsoDateTime(endTime)) {
    return badRequest("Informe a data e hora de fim do bloqueio.");
  }

  if (!reason) {
    return badRequest("Informe o motivo do bloqueio.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-blocks/${blockId}`,
    method: "PUT",
    body: {
      instructorUserId,
      startTime,
      endTime,
      reason
    },
    errorMessage: "Nao foi possivel editar o bloqueio."
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para remover bloqueio.");

  if (session instanceof Response) {
    return session;
  }

  const { blockId } = await context.params;

  if (!blockId.trim()) {
    return badRequest("Informe o bloqueio a ser removido.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-blocks/${blockId}`,
    method: "DELETE",
    errorMessage: "Nao foi possivel remover o bloqueio."
  });
}
