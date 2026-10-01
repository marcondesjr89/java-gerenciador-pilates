import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  readJsonBody,
  readTrimmedString,
  requireRouteParam
} from "@/app/api/_lib/validation";

const VALID_ROLES = ["ADMIN", "RECEPTION", "INSTRUCTOR"] as const;

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN"], "Sessao invalida para atualizar usuario.");

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
    fullName?: unknown;
    role?: unknown;
    specialties?: unknown;
  };

  const fullName = readTrimmedString(body.fullName);
  const role = readTrimmedString(body.role);
  const specialties = Array.isArray(body.specialties) ? body.specialties : [];

  if (!fullName) {
    return badRequest("Informe o nome completo do usuario.");
  }

  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    return badRequest("Informe um perfil valido para o usuario.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/users/${encodeURIComponent(userId)}`,
    method: "PUT",
    body: {
      fullName,
      role,
      specialties
    },
    errorMessage: "Nao foi possivel atualizar o usuario."
  });
}
