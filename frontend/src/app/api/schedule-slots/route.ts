import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para criar horario.");

  if (session instanceof Response) {
    return session;
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/schedule-slots",
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel criar o horario.",
    successStatus: 201
  });
}
