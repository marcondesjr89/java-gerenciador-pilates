import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateSubscriptionForm } from "@/app/financeiro/create-subscription-form";
import type { BillingPlan } from "@/lib/billing";

const mockPlans: BillingPlan[] = [
  {
    id: "plan-1",
    name: "Pilates 2x Semana",
    priceAmount: "250.00",
    billingCycleMonths: 1,
    active: true
  }
];

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

describe("CreateSubscriptionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("associa labels e inputs formalmente com id e htmlFor (WCAG 2.1 AA)", () => {
    render(
      <CreateSubscriptionForm
        studentId="student-1"
        plans={mockPlans}
        defaultStartDate="2026-10-08"
      />
    );

    expect(screen.getByLabelText("Plano")).toBeInTheDocument();
    expect(screen.getByLabelText("Inicio")).toBeInTheDocument();
  });

  it("exibe mensagem de erro acessível com role='alert' quando a requisição falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Aluno já possui assinatura ativa para este período." })
      })
    );

    render(
      <CreateSubscriptionForm
        studentId="student-1"
        plans={mockPlans}
        defaultStartDate="2026-10-08"
      />
    );

    fireEvent.submit(screen.getByRole("button", { name: "Criar assinatura" }).closest("form")!);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Aluno já possui assinatura ativa para este período.");
  });

  it("protege contra submissão duplicada por duplo clique rápido", async () => {
    let resolveFetch: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const fetchMock = vi.fn().mockImplementation(() => pendingPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CreateSubscriptionForm
        studentId="student-1"
        plans={mockPlans}
        defaultStartDate="2026-10-08"
      />
    );

    const form = screen.getByRole("button", { name: "Criar assinatura" }).closest("form")!;

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch!({
      ok: true,
      json: async () => ({ id: "sub-created" })
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Assinatura criada com sucesso.");
    });
  });
});
