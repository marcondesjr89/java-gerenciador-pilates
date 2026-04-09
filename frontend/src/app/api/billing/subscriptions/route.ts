import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, isIsoDate, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para criar assinatura.");

  if (session instanceof Response) {
    return session;
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    studentId?: unknown;
    planId?: unknown;
    startDate?: unknown;
  };
  const studentId = readTrimmedString(body.studentId);
  const planId = readTrimmedString(body.planId);
  const startDate = readTrimmedString(body.startDate);

  if (!studentId) {
    return badRequest("Informe o aluno da assinatura.");
  }

  if (!planId) {
    return badRequest("Informe o plano da assinatura.");
  }

  if (!isIsoDate(startDate)) {
    return badRequest("Informe uma data de inicio valida.");
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/billing/subscriptions",
    method: "POST",
    body: {
      studentId,
      planId,
      startDate
    },
    errorMessage: "Nao foi possivel criar a assinatura."
  });
}
