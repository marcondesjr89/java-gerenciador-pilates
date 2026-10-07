import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, isEmail, isIsoDate, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

const STUDENT_STATUSES = new Set(["ACTIVE", "INACTIVE"]);

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para atualizar aluno.");

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;
  if (!studentId?.trim()) {
    return badRequest("Identificador do aluno nao informado.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    fullName?: unknown;
    email?: unknown;
    phoneNumber?: unknown;
    birthDate?: unknown;
    status?: unknown;
  };

  const fullName = readTrimmedString(body.fullName);
  const email = readTrimmedString(body.email);
  const phoneNumber = readTrimmedString(body.phoneNumber);
  const birthDate = readTrimmedString(body.birthDate);
  const status = readTrimmedString(body.status);

  if (!fullName) {
    return badRequest("Informe o nome completo do aluno.");
  }

  if (!isEmail(email)) {
    return badRequest("Informe um e-mail valido para o aluno.");
  }

  if (!phoneNumber) {
    return badRequest("Informe o telefone do aluno.");
  }

  if (birthDate && !isIsoDate(birthDate)) {
    return badRequest("Informe uma data de nascimento valida.");
  }

  if (!STUDENT_STATUSES.has(status)) {
    return badRequest("Informe um status valido para o aluno.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}`,
    method: "PUT",
    body: {
      fullName,
      email,
      phoneNumber,
      birthDate: birthDate || null,
      status
    },
    errorMessage: "Nao foi possivel atualizar os dados do aluno."
  });
}
