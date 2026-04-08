import { proxyBinaryToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

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
  return proxyBinaryToBackend({
    session,
    path: `/api/v1/students/${studentId}/legal-acceptances/${acceptanceId}/attachments/${attachmentId}/download`,
    errorMessage: "Nao foi possivel baixar a evidencia do termo."
  });
}
