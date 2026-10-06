import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requireInternalApiSession(
    ["ADMIN"],
    "Sessao invalida para solicitar a anonimizacao do aluno."
  );

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;

  if (!studentId.trim()) {
    return badRequest("Informe o aluno para anonimizacao.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    reason?: unknown;
  };
  const reason = readTrimmedString(body.reason);

  if (!reason) {
    return badRequest("Informe a justificativa para anonimizacao dos dados.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/anonymize`,
    method: "POST",
    body: {
      reason
    },
    errorMessage: "Nao foi possivel realizar a anonimizacao do aluno."
  });
}
