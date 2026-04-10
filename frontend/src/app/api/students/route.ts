import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, isEmail, isIsoDate, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

const STUDENT_STATUSES = new Set(["ACTIVE", "INACTIVE"]);

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para cadastrar aluno.");

  if (session instanceof Response) {
    return session;
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    fullName?: unknown;
    cpf?: unknown;
    email?: unknown;
    phoneNumber?: unknown;
    birthDate?: unknown;
    status?: unknown;
    lgpdConsent?: unknown;
  };
  const fullName = readTrimmedString(body.fullName);
  const cpf = readTrimmedString(body.cpf);
  const email = readTrimmedString(body.email);
  const phoneNumber = readTrimmedString(body.phoneNumber);
  const birthDate = readTrimmedString(body.birthDate);
  const status = readTrimmedString(body.status);
  const lgpdConsent = body.lgpdConsent;

  if (!fullName) {
    return badRequest("Informe o nome completo do aluno.");
  }

  if (!/^\d{11}$/.test(cpf)) {
    return badRequest("Informe um CPF valido com 11 digitos.");
  }

  if (!isEmail(email)) {
    return badRequest("Informe um e-mail valido para o aluno.");
  }

  if (!phoneNumber) {
    return badRequest("Informe o telefone do aluno.");
  }

  if (!isIsoDate(birthDate)) {
    return badRequest("Informe uma data de nascimento valida.");
  }

  if (!STUDENT_STATUSES.has(status)) {
    return badRequest("Informe um status valido para o aluno.");
  }

  if (typeof lgpdConsent !== "boolean") {
    return badRequest("Informe o consentimento LGPD do aluno.");
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/students",
    method: "POST",
    body: {
      fullName,
      cpf,
      email,
      phoneNumber,
      birthDate,
      status,
      lgpdConsent
    },
    errorMessage: "Nao foi possivel cadastrar o aluno.",
    successStatus: 201
  });
}
