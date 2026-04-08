import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

type RouteContext = {
  params: Promise<{
    blockId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para editar bloqueio.");

  if (session instanceof Response) {
    return session;
  }

  const { blockId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-blocks/${blockId}`,
    method: "PUT",
    body: await request.json(),
    errorMessage: "Nao foi possivel editar o bloqueio."
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para remover bloqueio.");

  if (session instanceof Response) {
    return session;
  }

  const { blockId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/schedule-blocks/${blockId}`,
    method: "DELETE",
    errorMessage: "Nao foi possivel remover o bloqueio."
  });
}
