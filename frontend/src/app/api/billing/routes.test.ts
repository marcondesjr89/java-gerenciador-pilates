import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as createPlan } from "@/app/api/billing/plans/route";
import { POST as createSubscription } from "@/app/api/billing/subscriptions/route";
import { POST as registerPayment } from "@/app/api/billing/invoices/[invoiceId]/payments/route";

const requireInternalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireInternalApiSession: (...args: unknown[]) => requireInternalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("billing api routes", () => {
  beforeEach(() => {
    requireInternalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("encaminha criacao de plano com o payload recebido", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "plan-1" }), { status: 201 }));

    await createPlan(
      new Request("http://localhost/api/billing/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Pilates 2x",
          priceAmount: "220.00",
          billingCycleMonths: 2
        })
      })
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/billing/plans",
      method: "POST",
      body: {
        name: "Pilates 2x",
        priceAmount: "220.00",
        billingCycleMonths: 2
      },
      errorMessage: "Nao foi possivel cadastrar o plano."
    });
  });

  it("retorna 400 quando o plano chega com valor invalido", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createPlan(
      new Request("http://localhost/api/billing/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Pilates 2x",
          priceAmount: "0",
          billingCycleMonths: 2
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe um valor valido para o plano." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha criacao de assinatura com o aluno e o plano escolhidos", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "subscription-1" }), { status: 201 }));

    await createSubscription(
      new Request("http://localhost/api/billing/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: "student-1",
          planId: "plan-1",
          startDate: "2026-04-07"
        })
      })
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/billing/subscriptions",
      method: "POST",
      body: {
        studentId: "student-1",
        planId: "plan-1",
        startDate: "2026-04-07"
      },
      errorMessage: "Nao foi possivel criar a assinatura."
    });
  });

  it("retorna 400 quando a assinatura chega sem data valida", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createSubscription(
      new Request("http://localhost/api/billing/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: "student-1",
          planId: "plan-1",
          startDate: "07/04/2026"
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe uma data de inicio valida." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha registro de pagamento para a fatura correta", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "payment-1" }), { status: 200 }));

    await registerPayment(
      new Request("http://localhost/api/billing/invoices/invoice-1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amountPaid: "220.00",
          paymentMethod: "PIX",
          paidAt: "2026-04-07T13:30:00.000Z",
          externalReference: null
        })
      }),
      {
        params: Promise.resolve({ invoiceId: "invoice-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/billing/invoices/invoice-1/payments",
      method: "POST",
      body: {
        amountPaid: "220.00",
        paymentMethod: "PIX",
        paidAt: "2026-04-07T13:30:00.000Z",
        externalReference: null
      },
      errorMessage: "Nao foi possivel registrar o pagamento."
    });
  });

  it("retorna 400 quando o pagamento chega com metodo invalido", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await registerPayment(
      new Request("http://localhost/api/billing/invoices/invoice-1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amountPaid: "220.00",
          paymentMethod: "CHEQUE",
          paidAt: "2026-04-07T13:30:00.000Z",
          externalReference: null
        })
      }),
      {
        params: Promise.resolve({ invoiceId: "invoice-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe um metodo de pagamento valido." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });
});
