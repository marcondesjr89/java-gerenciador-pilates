import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requireInternalApiSession(["ADMIN", "INSTRUCTOR"], "Sessao invalida para lancar evolucao.");

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/progress-entries`,
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel registrar a evolucao."
  });
}
