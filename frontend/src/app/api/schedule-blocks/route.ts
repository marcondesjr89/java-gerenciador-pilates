import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function GET(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para consultar bloqueios.");

  if (session instanceof Response) {
    return session;
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const searchParams = new URLSearchParams();

  if (date) {
    searchParams.set("date", date);
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-blocks?${searchParams.toString()}`,
    errorMessage: "Nao foi possivel consultar os bloqueios.",
    passThroughErrorBody: true
  });
}

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para criar bloqueio.");

  if (session instanceof Response) {
    return session;
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/schedule-blocks",
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel criar o bloqueio.",
    successStatus: 201
  });
}
