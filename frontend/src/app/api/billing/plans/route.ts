import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  isPositiveDecimal,
  isPositiveInteger,
  readJsonBody,
  readTrimmedString
} from "@/app/api/_lib/validation";

export async function POST(request: Request) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para cadastrar plano.");

  if (session instanceof Response) {
    return session;
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    name?: unknown;
    priceAmount?: unknown;
    billingCycleMonths?: unknown;
  };
  const name = readTrimmedString(body.name);
  const priceAmount = readTrimmedString(body.priceAmount);
  const billingCycleMonths = body.billingCycleMonths;

  if (!name) {
    return badRequest("Informe o nome do plano.");
  }

  if (!isPositiveDecimal(priceAmount)) {
    return badRequest("Informe um valor valido para o plano.");
  }

  if (!isPositiveInteger(billingCycleMonths)) {
    return badRequest("Informe um ciclo de cobranca valido.");
  }

  return proxyJsonToBackend({
    session,
    path: "/api/v1/billing/plans",
    method: "POST",
    body: {
      name,
      priceAmount,
      billingCycleMonths
    },
    errorMessage: "Nao foi possivel cadastrar o plano."
  });
}
