import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ studentId: string; acceptanceId: string; attachmentId: string }> }
) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION" && session.role !== "INSTRUCTOR")) {
    return new Response("Sessao invalida para baixar evidencia do termo.", { status: 401 });
  }

  const { studentId, acceptanceId, attachmentId } = await context.params;
  const response = await fetch(
    `${API_BASE_URL}/api/v1/students/${studentId}/legal-acceptances/${acceptanceId}/attachments/${attachmentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return new Response("Nao foi possivel baixar a evidencia do termo.", { status: response.status });
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": response.headers.get("content-disposition") ?? "inline"
    }
  });
}
