import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ invoiceId: string }> }) {
  const session = await requireInternalApiSession(["ADMIN", "RECEPTION"], "Sessao invalida para registrar pagamento.");

  if (session instanceof Response) {
    return session;
  }

  const { invoiceId } = await context.params;
  return proxyJsonToBackend({
    session,
    path: `/api/v1/billing/invoices/${invoiceId}/payments`,
    method: "POST",
    body: await request.json(),
    errorMessage: "Nao foi possivel registrar o pagamento."
  });
}
