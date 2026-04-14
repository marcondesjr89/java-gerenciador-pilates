import { proxyBinaryToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { requireRouteParam } from "@/app/api/_lib/validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ studentId: string; acceptanceId: string }> }
) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION", "INSTRUCTOR"],
    "Sessao invalida para baixar o PDF do termo."
  );

  if (session instanceof Response) {
    return new Response("Sessao invalida para baixar o PDF do termo.", { status: 401 });
  }

  const { studentId, acceptanceId } = await context.params;
  const studentIdError = requireRouteParam(studentId, "Informe o aluno do termo.");

  if (studentIdError) {
    return studentIdError;
  }

  const acceptanceIdError = requireRouteParam(acceptanceId, "Informe o aceite legal do PDF.");

  if (acceptanceIdError) {
    return acceptanceIdError;
  }

  return proxyBinaryToBackend({
    session,
    path: `/api/v1/students/${studentId}/legal-acceptances/${acceptanceId}/document`,
    errorMessage: "Nao foi possivel baixar o PDF consolidado do termo."
  });
}
