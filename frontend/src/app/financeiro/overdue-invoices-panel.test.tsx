import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OverdueInvoicesPanel } from "@/app/financeiro/overdue-invoices-panel";
import type { BillingInvoice } from "@/lib/billing-types";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

const mockInvoices: BillingInvoice[] = [
  {
    id: "inv-1",
    studentId: "student-1",
    studentName: "Carlos Aluno",
    subscriptionId: "sub-1",
    referenceMonth: "2026-03-01",
    dueDate: "2026-03-10",
    amountDue: "250.00",
    status: "OPEN",
    paidAt: null
  },
  {
    id: "inv-2",
    studentId: "student-2",
    studentName: "Mariana Aluna",
    subscriptionId: "sub-2",
    referenceMonth: "2026-03-01",
    dueDate: "2026-03-15",
    amountDue: "320.00",
    status: "OPEN",
    paidAt: null
  }
];

describe("OverdueInvoicesPanel", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("renderiza a lista de faturas em atraso com links para as fichas dos alunos", () => {
    render(
      <OverdueInvoicesPanel
        invoices={mockInvoices}
        startDate="2026-03-01"
        endDate="2026-03-31"
      />
    );

    expect(screen.getByText("Carlos Aluno")).toBeInTheDocument();
    expect(screen.getByText("Mariana Aluna")).toBeInTheDocument();
    expect(screen.getAllByText("Vencida")).toHaveLength(2);

    const links = screen.getAllByRole("link", { name: /ver ficha/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute(
      "href",
      "/financeiro?startDate=2026-03-01&endDate=2026-03-31&studentId=student-1"
    );
  });

  it("permite dar baixa rapida com sucesso e remove a fatura da lista", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "pay-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(
      <OverdueInvoicesPanel
        invoices={mockInvoices}
        startDate="2026-03-01"
        endDate="2026-03-31"
      />
    );

    const openButtons = screen.getAllByRole("button", { name: /dar baixa rápida/i });
    fireEvent.click(openButtons[0]);

    expect(screen.getByText("Registrar baixa para Carlos Aluno")).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: "Registrar pagamento" });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Pagamento da fatura de Carlos Aluno registrado com sucesso.")
    ).toBeInTheDocument();

    expect(screen.queryByText("Registrar baixa para Carlos Aluno")).not.toBeInTheDocument();
    expect(screen.queryByText("Carlos Aluno")).not.toBeInTheDocument();
    expect(screen.getByText("Mariana Aluna")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith("/api/billing/invoices/inv-1/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.stringContaining('"amountPaid":"250.00"')
    });

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("bloqueia clique duplo concorrente durante a baixa rapida", async () => {
    let resolvePayment: (response: Response) => void = () => {};
    vi.mocked(global.fetch).mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolvePayment = resolve;
        })
    );

    render(
      <OverdueInvoicesPanel
        invoices={mockInvoices}
        startDate="2026-03-01"
        endDate="2026-03-31"
      />
    );

    const openButtons = screen.getAllByRole("button", { name: /dar baixa rápida/i });
    fireEvent.click(openButtons[0]);

    const submitButton = screen.getByRole("button", { name: "Registrar pagamento" });
    fireEvent.click(submitButton);
    fireEvent.click(screen.getByRole("button", { name: "Registrando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolvePayment(
      new Response(JSON.stringify({ id: "pay-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      })
    );

    expect(
      await screen.findByText("Pagamento da fatura de Carlos Aluno registrado com sucesso.")
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("trata erro da API de forma graciosa sem remover a fatura e permitindo nova tentativa", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Valor do pagamento divergente do saldo da fatura." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    render(
      <OverdueInvoicesPanel
        invoices={mockInvoices}
        startDate="2026-03-01"
        endDate="2026-03-31"
      />
    );

    const openButtons = screen.getAllByRole("button", { name: /dar baixa rápida/i });
    fireEvent.click(openButtons[0]);

    fireEvent.click(screen.getByRole("button", { name: "Registrar pagamento" }));

    expect(
      await screen.findByText("Valor do pagamento divergente do saldo da fatura.")
    ).toBeInTheDocument();

    expect(screen.getByText("Carlos Aluno")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar pagamento" })).not.toBeDisabled();
  });

  it("renderiza mensagem de estado vazio quando nao ha faturas em atraso", () => {
    render(
      <OverdueInvoicesPanel
        invoices={[]}
        startDate="2026-03-01"
        endDate="2026-03-31"
      />
    );

    expect(screen.getByText("Nenhuma fatura vencida no recorte atual.")).toBeInTheDocument();
  });

  it("permite fechar ou cancelar o formulario de baixa sem submeter", () => {
    render(
      <OverdueInvoicesPanel
        invoices={mockInvoices}
        startDate="2026-03-01"
        endDate="2026-03-31"
      />
    );

    const openButtons = screen.getAllByRole("button", { name: /dar baixa rápida/i });
    fireEvent.click(openButtons[0]);
    expect(screen.getByText("Registrar baixa para Carlos Aluno")).toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Registrar baixa para Carlos Aluno")).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
