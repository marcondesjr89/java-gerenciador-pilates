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

export async function POST(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN"], "Sessao invalida para alterar senha do usuario.");

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
    newPassword?: unknown;
  };

  const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";

  if (newPassword.length < 8) {
    return badRequest("A nova senha deve possuir pelo menos 8 caracteres.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/users/${encodeURIComponent(userId)}/password`,
    method: "POST",
    body: {
      newPassword
    },
    errorMessage: "Nao foi possivel alterar a senha do usuario."
  });
}
