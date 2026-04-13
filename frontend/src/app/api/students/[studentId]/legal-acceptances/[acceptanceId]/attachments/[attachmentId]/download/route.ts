import { proxyBinaryToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { requireRouteParam } from "@/app/api/_lib/validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ studentId: string; acceptanceId: string; attachmentId: string }> }
) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION", "INSTRUCTOR"],
    "Sessao invalida para baixar evidencia do termo."
  );

  if (session instanceof Response) {
    return new Response("Sessao invalida para baixar evidencia do termo.", { status: 401 });
  }

  const { studentId, acceptanceId, attachmentId } = await context.params;
  const studentIdError = requireRouteParam(studentId, "Informe o aluno da evidencia do termo.");

  if (studentIdError) {
    return studentIdError;
  }

  const acceptanceIdError = requireRouteParam(acceptanceId, "Informe o aceite legal da evidencia.");

  if (acceptanceIdError) {
    return acceptanceIdError;
  }

  const attachmentIdError = requireRouteParam(attachmentId, "Informe o anexo da evidencia.");

  if (attachmentIdError) {
    return attachmentIdError;
  }

  return proxyBinaryToBackend({
    session,
    path: `/api/v1/students/${studentId}/legal-acceptances/${acceptanceId}/attachments/${attachmentId}/download`,
    errorMessage: "Nao foi possivel baixar a evidencia do termo."
  });
}
