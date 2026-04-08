import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para configurar o portal do aluno."
  );

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/portal-account`,
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel configurar a conta do portal."
  });
}
