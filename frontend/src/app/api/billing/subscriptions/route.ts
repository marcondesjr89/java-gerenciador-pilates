import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para criar assinatura.");

  if (session instanceof Response) {
    return session;
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/billing/subscriptions",
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel criar a assinatura."
  });
}
