import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  readJsonBody,
  readTrimmedString
} from "@/app/api/_lib/validation";

const VALID_ROLES = ["ADMIN", "RECEPTION", "INSTRUCTOR"] as const;

export async function GET() {
  const session = await requireInternalApiSession(["ADMIN"], "Sessao invalida para consultar usuarios.");

  if (session instanceof Response) {
    return session;
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/users",
    method: "GET",
    errorMessage: "Nao foi possivel carregar a lista de usuarios."
  });
}

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN"], "Sessao invalida para cadastrar usuario.");

  if (session instanceof Response) {
    return session;
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    email?: unknown;
    fullName?: unknown;
    password?: unknown;
    role?: unknown;
    specialties?: unknown;
  };

  const email = readTrimmedString(body.email).toLowerCase();
  const fullName = readTrimmedString(body.fullName);
  const password = typeof body.password === "string" ? body.password : "";
  const role = readTrimmedString(body.role);
  const specialties = Array.isArray(body.specialties) ? body.specialties : [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("Informe um e-mail valido.");
  }

  if (!fullName) {
    return badRequest("Informe o nome completo do usuario.");
  }

  if (password.length < 8) {
    return badRequest("A senha provisoria deve possuir pelo menos 8 caracteres.");
  }

  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    return badRequest("Informe um perfil valido para o usuario.");
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/users",
    method: "POST",
    body: {
      email,
      fullName,
      password,
      role,
      specialties
    },
    errorMessage: "Nao foi possivel cadastrar o usuario."
  });
}
