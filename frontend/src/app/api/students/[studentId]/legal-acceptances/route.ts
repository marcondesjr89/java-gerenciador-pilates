import { proxyFormDataToBackend, proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION", "INSTRUCTOR"],
    "Sessao invalida para registrar termo legal."
  );

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    return proxyFormDataToBackend({
      session,
      path: `/api/v1/students/${studentId}/legal-acceptances`,
      formData: await request.formData(),
      errorMessage: "Nao foi possivel registrar o termo legal."
    });
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/legal-acceptances`,
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel registrar o termo legal."
  });
}
