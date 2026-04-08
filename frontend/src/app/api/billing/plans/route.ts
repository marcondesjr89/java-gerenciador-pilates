import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para cadastrar plano.");

  if (session instanceof Response) {
    return session;
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/billing/plans",
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel cadastrar o plano."
  });
}
