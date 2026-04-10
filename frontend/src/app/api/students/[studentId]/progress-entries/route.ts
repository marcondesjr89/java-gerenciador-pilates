import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  isIntegerInRange,
  isIsoDateTime,
  readJsonBody,
  readTrimmedString
} from "@/app/api/_lib/validation";

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requireInternalApiSession(["ADMIN", "INSTRUCTOR"], "Sessao invalida para lancar evolucao.");

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;

  if (!studentId.trim()) {
    return badRequest("Informe o aluno da evolucao.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    recordedAt?: unknown;
    instructorNotes?: unknown;
    flexibilityScore?: unknown;
    strengthScore?: unknown;
    painLevel?: unknown;
  };
  const recordedAt = readTrimmedString(body.recordedAt);
  const instructorNotes = readTrimmedString(body.instructorNotes);
  const flexibilityScore = body.flexibilityScore;
  const strengthScore = body.strengthScore;
  const painLevel = body.painLevel;

  if (!isIsoDateTime(recordedAt)) {
    return badRequest("Informe a data e hora da evolucao.");
  }

  if (!instructorNotes) {
    return badRequest("Informe as notas do instrutor.");
  }

  if (!isIntegerInRange(flexibilityScore, 0, 100)) {
    return badRequest("Informe uma flexibilidade valida entre 0 e 100.");
  }

  if (!isIntegerInRange(strengthScore, 0, 100)) {
    return badRequest("Informe uma forca valida entre 0 e 100.");
  }

  if (!isIntegerInRange(painLevel, 0, 10)) {
    return badRequest("Informe uma dor valida entre 0 e 10.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/progress-entries`,
    method: "POST",
    body: {
      recordedAt,
      instructorNotes,
      flexibilityScore,
      strengthScore,
      painLevel
    },
    errorMessage: "Nao foi possivel registrar a evolucao."
  });
}
