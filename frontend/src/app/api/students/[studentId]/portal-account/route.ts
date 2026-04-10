import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, isEmail, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION"],
    "Sessao invalida para configurar o portal do aluno."
  );

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;

  if (!studentId.trim()) {
    return badRequest("Informe o aluno da conta do portal.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    email?: unknown;
    password?: unknown;
  };
  const email = readTrimmedString(body.email);
  const password = readTrimmedString(body.password);

  if (!isEmail(email)) {
    return badRequest("Informe um e-mail valido para a conta do portal.");
  }

  if (password.length < 8) {
    return badRequest("Informe uma senha valida com pelo menos 8 caracteres.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/portal-account`,
    method: "POST",
    body: {
      email,
      password
    },
    errorMessage: "Nao foi possivel configurar a conta do portal."
  });
}
