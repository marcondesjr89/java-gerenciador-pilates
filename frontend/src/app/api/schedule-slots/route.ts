import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  isIsoDateTime,
  isPositiveInteger,
  readJsonBody,
  readTrimmedString
} from "@/app/api/_lib/validation";

const SLOT_SPECIALTIES = new Set([
  "PILATES_SOLO",
  "PILATES_APARELHOS",
  "PILATES_GESTANTES",
  "PILATES_REABILITACAO",
  "PILATES_IDOSOS"
]);

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para criar horario.");

  if (session instanceof Response) {
    return session;
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    instructorUserId?: unknown;
    requiredSpecialty?: unknown;
    startTime?: unknown;
    endTime?: unknown;
    capacity?: unknown;
  };
  const instructorUserId = readTrimmedString(body.instructorUserId);
  const requiredSpecialty = readTrimmedString(body.requiredSpecialty);
  const startTime = readTrimmedString(body.startTime);
  const endTime = readTrimmedString(body.endTime);
  const capacity = body.capacity;

  if (!instructorUserId) {
    return badRequest("Informe o instrutor do horario.");
  }

  if (!SLOT_SPECIALTIES.has(requiredSpecialty)) {
    return badRequest("Informe uma especialidade valida para o horario.");
  }

  if (!isIsoDateTime(startTime)) {
    return badRequest("Informe a data e hora de inicio do horario.");
  }

  if (!isIsoDateTime(endTime)) {
    return badRequest("Informe a data e hora de fim do horario.");
  }

  if (!isPositiveInteger(capacity)) {
    return badRequest("Informe uma capacidade valida para o horario.");
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/schedule-slots",
    method: "POST",
    body: {
      instructorUserId,
      requiredSpecialty,
      startTime,
      endTime,
      capacity
    },
    errorMessage: "Nao foi possivel criar o horario.",
    successStatus: 201
  });
}
