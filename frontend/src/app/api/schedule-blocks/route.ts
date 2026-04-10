import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, isIsoDate, isIsoDateTime, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

export async function GET(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para consultar bloqueios.");

  if (session instanceof Response) {
    return session;
  }

  const url = new URL(request.url);
  const date = readTrimmedString(url.searchParams.get("date"));
  const searchParams = new URLSearchParams();

  if (date) {
    if (!isIsoDate(date)) {
      return badRequest("Informe uma data valida para consultar bloqueios.");
    }

    searchParams.set("date", date);
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-blocks?${searchParams.toString()}`,
    errorMessage: "Nao foi possivel consultar os bloqueios.",
    passThroughErrorBody: true
  });
}

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para criar bloqueio.");

  if (session instanceof Response) {
    return session;
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
    path: "/api/v1/schedule-blocks",
    method: "POST",
    body: {
      instructorUserId,
      startTime,
      endTime,
      reason
    },
    errorMessage: "Nao foi possivel criar o bloqueio.",
    successStatus: 201
  });
}
