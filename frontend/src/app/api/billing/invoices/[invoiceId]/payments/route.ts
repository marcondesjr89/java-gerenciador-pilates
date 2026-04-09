import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  isIsoDateTime,
  isPositiveDecimal,
  readJsonBody,
  readTrimmedString
} from "@/app/api/_lib/validation";

const PAYMENT_METHODS = new Set(["PIX", "CREDIT_CARD", "BANK_TRANSFER", "CASH"]);

export async function POST(request: Request, context: { params: Promise<{ invoiceId: string }> }) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para registrar pagamento.");

  if (session instanceof Response) {
    return session;
  }

  const { invoiceId } = await context.params;

  if (!invoiceId.trim()) {
    return badRequest("Informe a fatura do pagamento.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    amountPaid?: unknown;
    paymentMethod?: unknown;
    paidAt?: unknown;
    externalReference?: unknown;
  };
  const amountPaid = readTrimmedString(body.amountPaid);
  const paymentMethod = readTrimmedString(body.paymentMethod);
  const paidAt = readTrimmedString(body.paidAt);
  const externalReference = body.externalReference === null ? null : readTrimmedString(body.externalReference);

  if (!isPositiveDecimal(amountPaid)) {
    return badRequest("Informe um valor valido para o pagamento.");
  }

  if (!PAYMENT_METHODS.has(paymentMethod)) {
    return badRequest("Informe um metodo de pagamento valido.");
  }

  if (!isIsoDateTime(paidAt)) {
    return badRequest("Informe uma data e hora validas para o pagamento.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/billing/invoices/${invoiceId}/payments`,
    method: "POST",
    body: {
      amountPaid,
      paymentMethod,
      paidAt,
      externalReference
    },
    errorMessage: "Nao foi possivel registrar o pagamento."
  });
}
