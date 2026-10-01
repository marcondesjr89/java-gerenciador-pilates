import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  readJsonBody,
  requireRouteParam
} from "@/app/api/_lib/validation";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN"], "Sessao invalida para alterar status do usuario.");

  if (session instanceof Response) {
    return session;
  }

  const { userId } = await context.params;
  const paramError = requireRouteParam(userId, "Identificador do usuario invalido.");
  if (paramError) {
    return paramError;
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    active?: unknown;
  };

  if (typeof body.active !== "boolean") {
    return badRequest("Informe se o usuario deve ficar ativo ou inativo.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/users/${encodeURIComponent(userId)}/status`,
    method: "PATCH",
    body: {
      active: body.active
    },
    errorMessage: "Nao foi possivel alterar o status do usuario."
  });
}
